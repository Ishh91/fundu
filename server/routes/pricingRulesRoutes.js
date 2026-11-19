import { Router } from 'express';
import mongoose from 'mongoose';
import { permissionGuard } from '../middleware/auth.js';
import { SellPriceConfig } from '../models/SellPriceConfig.js';
import { buildModelList } from '../services/modelList.js';
import { createHttpError } from '../utils/error.js';
import { DEFAULT_PRICING_RULES, RULE_LIMITS, validatePricingRules, resolvePricingRules } from '../../fundu_pricing_rules.mjs';
import { pricingRules as realService } from '../services/pricingRules.js';
import { createPhoneQuote } from '../services/quoteService.js';

const MODEL_LIST_CACHE_MS = 60_000;

/**
 * Every active sell price row, as { brand, model, storage, base_price }. A row with no price yet is still listed, so quote rules
 * (crack amount, back glass amount) can be typed in for it; the grey estimate column falls back to "no admin price" for those. Nothing without a database connection, rather than waiting for one.
 */
async function loadAllSellRows() {
  if (mongoose.connection.readyState !== 1) return [];
  // Switched-off rows (an admin-deleted model) stay out; a row with no price yet is still listed.
  return SellPriceConfig.find({ is_active: { $ne: false } }).select('brand model storage base_price').lean();
}

/** The answers a preview may send; nothing else reaches the quote engine. */
const PREVIEW_FIELDS = [
  'brand', 'model', 'storage', 'ram', 'powers_on', 'activation_lock_cleared', 'ownership_verified', 'liquid_damage',
  'cosmetic_condition', 'screen_condition', 'body_condition', 'battery_health', 'under_warranty', 'age_period', 'stylus_available',
];

export function pickPreviewInput(body) {
  const source = body && typeof body === 'object' ? body : {};
  const input = {};
  for (const field of PREVIEW_FIELDS) {
    const value = source[field];
    if (typeof value === 'string') input[field] = value.slice(0, 80);
    else if (typeof value === 'boolean') input[field] = value;
  }
  input.defects = Array.isArray(source.defects) ? source.defects.filter((d) => typeof d === 'string').slice(0, 20).map((d) => d.slice(0, 60)) : [];
  input.accessories = Array.isArray(source.accessories) ? source.accessories.filter((a) => typeof a === 'string').slice(0, 5).map((a) => a.slice(0, 60)) : [];
  if (!input.brand || !input.model || !input.storage) throw createHttpError(400, 'Brand, model and storage are needed to preview a quote.');
  return input;
}

const summary = (quote) => ({
  status: quote.status,
  offerAmount: quote.offerAmount ?? null,
  reason: quote.reason || quote.message || null,
  conditionSummary: Array.isArray(quote.conditionSummary) ? quote.conditionSummary : [],
});

const who = (req) => String(req.auth?.email || req.auth?.sub || '').slice(0, 120);

const handle = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (error) {
    const status = Number.isInteger(error.status) ? error.status : 500;
    res.status(status).json({
      success: false,
      error: status === 500 ? 'The quote rules could not be read or saved right now.' : error.message,
      errors: error.errors,
    });
  }
};

/**
 * GET  /api/pricing-rules                  the published rules (public: the sell page prices its estimate with them)
 * GET  /api/pricing-rules/admin            published, draft, history, the defaults and the bounds
 * PUT  /api/pricing-rules/admin/draft      save the rules being edited
 * DELETE /api/pricing-rules/admin/draft    throw the draft away
 * POST /api/pricing-rules/admin/publish    make the draft live as the next version
 * POST /api/pricing-rules/admin/rollback   make an earlier version live again
 * POST /api/pricing-rules/admin/preview    one quote under the live rules and under the given rules, side by side
 * GET  /api/pricing-rules/admin/models     every brand and its models and storages, for the preview's dropdowns
 */
export function createPricingRulesRouter({
  service = realService,
  quote = createPhoneQuote,
  guard = permissionGuard('sell_pricing'),
  loadRows = loadAllSellRows,
  now = () => Date.now(),
} = {}) {
  const router = Router();
  let modelListCache = null; // { at, list }

  router.get('/', handle(async (_req, res) => {
    const published = await service.getPublished();
    res.set('Cache-Control', 'public, max-age=30');
    res.json({ success: true, data: { version: published.version, rules: published.rules } });
  }));

  router.get('/admin', guard, handle(async (_req, res) => {
    const state = await service.getState();
    res.json({ success: true, data: { ...state, defaults: DEFAULT_PRICING_RULES, limits: RULE_LIMITS } });
  }));

  router.get('/admin/models', guard, handle(async (_req, res) => {
    if (!modelListCache || now() - modelListCache.at > MODEL_LIST_CACHE_MS) {
      modelListCache = { at: now(), list: buildModelList(await loadRows()) };
    }
    res.json({ success: true, data: { brands: modelListCache.list } });
  }));

  router.put('/admin/draft', guard, handle(async (req, res) => {
    const draft = await service.saveDraft(req.body?.rules, { user: who(req), note: req.body?.note });
    res.json({ success: true, data: { draft } });
  }));

  router.delete('/admin/draft', guard, handle(async (_req, res) => {
    await service.discardDraft();
    res.json({ success: true });
  }));

  router.post('/admin/publish', guard, handle(async (req, res) => {
    const version = await service.publish({ user: who(req), note: req.body?.note });
    res.json({ success: true, data: { version } });
  }));

  router.post('/admin/rollback', guard, handle(async (req, res) => {
    const version = await service.rollback(req.body?.version, { user: who(req) });
    res.json({ success: true, data: { version } });
  }));

  router.post('/admin/preview', guard, handle(async (req, res) => {
    const input = pickPreviewInput(req.body?.input);
    const published = await service.getPublished();
    let proposed = published.rules;
    if (req.body?.rules !== undefined) {
      const checked = validatePricingRules(req.body.rules);
      if (!checked.valid) {
        const error = createHttpError(400, checked.errors[0]);
        error.errors = checked.errors;
        throw error;
      }
      proposed = resolvePricingRules(req.body.rules);
    }
    // A preview prices the quote twice and records nothing.
    const [live, draft] = await Promise.all([
      quote(input, { pricingRules: published.rules, pricingRulesVersion: published.version, preview: true }),
      quote(input, { pricingRules: proposed, preview: true }),
    ]);
    res.json({ success: true, data: { live: summary(live), draft: summary(draft) } });
  }));

  return router;
}

export default createPricingRulesRouter();
