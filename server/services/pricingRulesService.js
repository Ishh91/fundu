import { resolvePricingRules, validatePricingRules, cloneRules } from '../../fundu_pricing_rules.mjs';
import { createHttpError } from '../utils/error.js';

/** How long a quote may use rules it already read before it looks again. A publish clears it at once on this server. */
const DEFAULT_CACHE_MS = 30_000;
const VERSIONS_SHOWN = 20;

const plain = (doc) => (doc && typeof doc.toObject === 'function' ? doc.toObject() : doc);

const publicVersion = (doc) => ({
  version: doc.version,
  status: doc.status,
  note: doc.note || '',
  published_by: doc.published_by || '',
  published_at: doc.published_at || null,
  based_on_version: doc.based_on_version ?? null,
  rules: resolvePricingRules(doc.rules),
});

const publicDraft = (doc) => (doc ? {
  note: doc.note || '',
  based_on_version: doc.based_on_version ?? null,
  updated_by: doc.updated_by || '',
  updated_at: doc.updated_at || null,
  rules: resolvePricingRules(doc.rules),
} : null);

const validationError = (errors) => {
  const error = createHttpError(400, errors[0] || 'The rules are not valid.');
  error.errors = errors;
  return error;
};

/**
 * The saved quote rules: which set prices a quote now, the draft being edited, and the history.
 *
 * `model` is the PricingRules model (or a stand-in with the same few methods). A quote never waits on this and never fails
 * because of it: if the database cannot answer, the rules last read (or the built-in defaults) are used.
 */
export function createPricingRulesService({ model, cacheMs = DEFAULT_CACHE_MS, now = () => Date.now(), isReady = () => true }) {
  let cache = null; // { at, value }

  const invalidate = () => { cache = null; };

  /** The rules every quote uses. Never throws. */
  async function getPublished() {
    if (cache && now() - cache.at < cacheMs) return cache.value;
    // Without a database connection a query would wait for it; a quote must not, so use what was last read, or the defaults.
    if (!isReady()) return cache ? cache.value : { version: 0, rules: resolvePricingRules(undefined), source: 'defaults' };
    try {
      const doc = plain(await model.findOne({ status: 'published' }).sort({ version: -1 }).lean());
      const value = doc
        ? { version: doc.version, rules: resolvePricingRules(doc.rules), source: 'database' }
        : { version: 0, rules: resolvePricingRules(undefined), source: 'defaults' };
      cache = { at: now(), value };
      return value;
    } catch {
      if (cache) return cache.value;
      return { version: 0, rules: resolvePricingRules(undefined), source: 'defaults' };
    }
  }

  /** The rules last read, or the defaults, without waiting for the database. For code that cannot await. */
  function peek() {
    return cache ? cache.value : { version: 0, rules: resolvePricingRules(undefined), source: 'defaults' };
  }

  async function getDraft() {
    return publicDraft(plain(await model.findOne({ status: 'draft' }).lean()));
  }

  async function listVersions() {
    const docs = await model.find({ status: { $in: ['published', 'archived'] } }).sort({ version: -1 }).limit(VERSIONS_SHOWN).lean();
    return docs.map((doc) => publicVersion(plain(doc)));
  }

  /** Everything the admin page needs in one read. */
  async function getState() {
    const [published, draft, versions] = await Promise.all([getPublished(), getDraft(), listVersions()]);
    return { published, draft, versions };
  }

  /** Saves the rules being edited. Nothing about quotes changes until publish. */
  async function saveDraft(rules, { user = '', note = '' } = {}) {
    const checked = validatePricingRules(rules);
    if (!checked.valid) throw validationError(checked.errors);
    const published = await getPublished();
    const body = {
      rules: cloneRules(rules),
      note: String(note || '').slice(0, 300),
      based_on_version: published.version || null,
      updated_by: user,
    };
    const existing = plain(await model.findOne({ status: 'draft' }).lean());
    if (existing) {
      await model.updateOne({ status: 'draft' }, { $set: body });
    } else {
      await model.create({ status: 'draft', version: null, ...body });
    }
    return getDraft();
  }

  async function discardDraft() {
    await model.deleteMany({ status: 'draft' });
  }

  async function latestVersionNumber() {
    const latest = plain(await model.findOne({ status: { $in: ['published', 'archived'] } }).sort({ version: -1 }).lean());
    return latest?.version || 0;
  }

  /** Makes `rules` the published set as the next version and archives the one before it. */
  async function publishRules(rules, { user, note, basedOn }) {
    const version = (await latestVersionNumber()) + 1;
    await model.create({
      status: 'published',
      version,
      rules: cloneRules(rules),
      note: String(note || '').slice(0, 300),
      based_on_version: basedOn ?? null,
      published_by: user,
      published_at: new Date(now()),
    });
    // The new set is saved before the old one is archived, so there is never a moment with nothing published.
    await model.updateMany({ status: 'published', version: { $lt: version } }, { $set: { status: 'archived' } });
    invalidate();
    return version;
  }

  /** Publishes the draft as the next version. */
  async function publish({ user = '', note = '' } = {}) {
    const draft = plain(await model.findOne({ status: 'draft' }).lean());
    if (!draft) throw createHttpError(409, 'There is no draft to publish. Change a rule and save it first.');
    const checked = validatePricingRules(draft.rules);
    if (!checked.valid) throw validationError(checked.errors);
    const current = await getPublished();
    const version = await publishRules(draft.rules, { user, note: note || draft.note, basedOn: current.version || null });
    await model.deleteMany({ status: 'draft' });
    return version;
  }

  /** Publishes an earlier version again, as a new version, so the history is never rewritten. */
  async function rollback(targetVersion, { user = '' } = {}) {
    const version = Number(targetVersion);
    if (!Number.isInteger(version) || version < 1) throw createHttpError(400, 'Choose a version to roll back to.');
    const target = plain(await model.findOne({ status: { $in: ['published', 'archived'] }, version }).lean());
    if (!target) throw createHttpError(404, `Version ${version} was not found.`);
    const checked = validatePricingRules(target.rules);
    if (!checked.valid) throw validationError(checked.errors);
    const current = await getPublished();
    if (current.version === version) throw createHttpError(409, `Version ${version} is already the live one.`);
    return publishRules(target.rules, { user, note: `Rolled back to version ${version}`, basedOn: version });
  }

  return { getPublished, peek, getDraft, listVersions, getState, saveDraft, discardDraft, publish, rollback, invalidate };
}
