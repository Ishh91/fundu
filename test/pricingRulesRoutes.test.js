import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { createPricingRulesRouter, pickPreviewInput } from '../server/routes/pricingRulesRoutes.js';
import { createPricingRulesService } from '../server/services/pricingRulesService.js';
import { createPhoneQuote, getQuoteAudit } from '../server/services/quoteService.js';
import { DEFAULT_PRICING_RULES, RULE_LIMITS, cloneRules } from '../fundu_pricing_rules.mjs';

/** A tiny in-memory stand-in for the PricingRules model. */
function fakeModel() {
  const docs = [];
  const matches = (doc, filter = {}) => Object.entries(filter).every(([k, c]) => (c && typeof c === 'object' ? ('$in' in c ? c.$in.includes(doc[k]) : doc[k] < c.$lt) : doc[k] === c));
  const query = (rows, single) => {
    let result = rows;
    const chain = {
      sort(spec) { const [[f, d]] = Object.entries(spec); result = [...result].sort((a, b) => (a[f] - b[f]) * d); return chain; },
      limit(n) { result = result.slice(0, n); return chain; },
      lean() { return chain; },
      then(resolve, reject) { return Promise.resolve(single ? (result[0] ?? null) : result).then(resolve, reject); },
    };
    return chain;
  };
  return {
    findOne: (f) => query(docs.filter((d) => matches(d, f)), true),
    find: (f) => query(docs.filter((d) => matches(d, f)), false),
    async create(doc) { docs.push({ ...doc, updated_at: new Date() }); },
    async updateOne(f, u) { Object.assign(docs.find((d) => matches(d, f)), u.$set); },
    async updateMany(f, u) { docs.filter((d) => matches(d, f)).forEach((d) => Object.assign(d, u.$set)); },
    async deleteMany(f) { for (let i = docs.length - 1; i >= 0; i--) if (matches(docs[i], f)) docs.splice(i, 1); },
  };
}

const rulesWith = (change) => {
  const rules = cloneRules(DEFAULT_PRICING_RULES);
  change(rules);
  return rules;
};

// The "engine" of the preview: it returns the 11-months-or-older factor it was handed, so the test can see which rules priced it.
const previewCalls = [];
const stubQuote = async (input, options) => {
  previewCalls.push({ input, options });
  return { status: 'quoted', offerAmount: Math.round(10000 * options.pricingRules.age.over11), conditionSummary: ['stub'] };
};

const MODEL_ROWS = [
  { brand: 'Apple', model: 'iPhone 14', storage: '128 GB' }, { brand: 'Apple', model: 'iPhone 14', storage: '256GB' },
  { brand: 'Apple', model: 'iPhone 14 Plus', storage: '128 GB' }, { brand: 'Apple', model: 'Redmi Note 11 Pro+ 5g', storage: '128 GB' },
  { brand: 'Samsung', model: 'Galaxy S23', storage: '256 GB' }, { brand: 'OnePlus', model: '12', storage: '256 GB' },
];
let rowLoads = 0;
const clock = { t: 1_000_000 };

let server;
let base;
let currentAuth = null;

before(async () => {
  const service = createPricingRulesService({ model: fakeModel() });
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => { req.auth = currentAuth; next(); });
  app.use('/api/pricing-rules', createPricingRulesRouter({ service, quote: stubQuote, loadRows: async () => { rowLoads += 1; return MODEL_ROWS; }, now: () => clock.t }));
  await new Promise((resolve) => { server = app.listen(0, resolve); });
  base = `http://127.0.0.1:${server.address().port}/api/pricing-rules`;
});

after(() => new Promise((resolve) => server.close(resolve)));

const call = async (method, path, body) => {
  const res = await fetch(`${base}${path}`, { method, headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
  return { status: res.status, json: await res.json() };
};
const admin = { sub: 'u1', email: 'admin@fundu.in', role: 'admin' };

describe('the public rules', () => {
  it('can be read by anyone, and are the defaults before anything is published', async () => {
    currentAuth = null;
    const { status, json } = await call('GET', '/');
    assert.equal(status, 200);
    assert.equal(json.data.version, 0);
    assert.deepEqual(json.data.rules, DEFAULT_PRICING_RULES);
  });
});

describe('who may change the rules', () => {
  const adminRoutes = [['GET', '/admin'], ['PUT', '/admin/draft', { rules: DEFAULT_PRICING_RULES }], ['DELETE', '/admin/draft'], ['POST', '/admin/publish', {}], ['POST', '/admin/rollback', { version: 1 }], ['POST', '/admin/preview', { input: {} }]];

  it('nobody who is not logged in', async () => {
    currentAuth = null;
    for (const [method, path, body] of adminRoutes) assert.equal((await call(method, path, body)).status, 401, `${method} ${path}`);
  });

  it('not a customer, and not staff without the sell pricing permission', async () => {
    for (const auth of [{ sub: 'c1', role: 'customer' }, { sub: 's1', role: 'staff', permissions: ['orders'] }]) {
      currentAuth = auth;
      for (const [method, path, body] of adminRoutes) assert.equal((await call(method, path, body)).status, 403, `${auth.role} ${method} ${path}`);
    }
  });

  it('the super admin, and staff who were given sell pricing', async () => {
    for (const auth of [admin, { sub: 's2', email: 'staff@fundu.in', role: 'staff', permissions: ['sell_pricing'] }]) {
      currentAuth = auth;
      assert.equal((await call('GET', '/admin')).status, 200, auth.role);
    }
  });
});

describe('the admin page data', () => {
  it('has the published rules, the draft, the history, the defaults and the bounds', async () => {
    currentAuth = admin;
    const { json } = await call('GET', '/admin');
    assert.equal(json.data.published.version, 0);
    assert.equal(json.data.draft, null);
    assert.deepEqual(json.data.versions, []);
    assert.deepEqual(json.data.defaults, DEFAULT_PRICING_RULES);
    assert.deepEqual(json.data.limits, RULE_LIMITS);
  });
});

describe('saving, publishing and rolling back', () => {
  it('refuses a draft out of bounds with a 400 and the list of problems', async () => {
    currentAuth = admin;
    const { status, json } = await call('PUT', '/admin/draft', { rules: rulesWith((r) => { r.age.over11 = 0.1; r.samsungMidFactor = 9; }) });
    assert.equal(status, 400);
    assert.equal(json.success, false);
    assert.ok(json.errors.length >= 2);
  });

  it('refuses a body with no rules', async () => {
    currentAuth = admin;
    assert.equal((await call('PUT', '/admin/draft', {})).status, 400);
    assert.equal((await call('PUT', '/admin/draft', { rules: 'nope' })).status, 400);
  });

  it('saves a draft, which does not go live, then publishes it as version 1', async () => {
    currentAuth = admin;
    const saved = await call('PUT', '/admin/draft', { rules: rulesWith((r) => { r.age.over11 = 0.78; }), note: 'matched Cashify' });
    assert.equal(saved.status, 200);
    assert.equal(saved.json.data.draft.rules.age.over11, 0.78);
    assert.equal((await call('GET', '/')).json.data.rules.age.over11, 0.8, 'a draft is not live');

    const published = await call('POST', '/admin/publish', {});
    assert.equal(published.status, 200);
    assert.equal(published.json.data.version, 1);
    const live = await call('GET', '/');
    assert.equal(live.json.data.version, 1);
    assert.equal(live.json.data.rules.age.over11, 0.78);
  });

  it('cannot publish again without a new draft', async () => {
    currentAuth = admin;
    assert.equal((await call('POST', '/admin/publish', {})).status, 409);
  });

  it('publishes a second version, then rolls back to the first', async () => {
    currentAuth = admin;
    await call('PUT', '/admin/draft', { rules: rulesWith((r) => { r.age.over11 = 0.7; }) });
    assert.equal((await call('POST', '/admin/publish', {})).json.data.version, 2);
    assert.equal((await call('GET', '/')).json.data.rules.age.over11, 0.7);

    const back = await call('POST', '/admin/rollback', { version: 1 });
    assert.equal(back.status, 200);
    assert.equal(back.json.data.version, 3);
    assert.equal((await call('GET', '/')).json.data.rules.age.over11, 0.78);
    assert.equal((await call('POST', '/admin/rollback', { version: 3 })).status, 409);
    assert.equal((await call('POST', '/admin/rollback', { version: 42 })).status, 404);
    assert.equal((await call('POST', '/admin/rollback', {})).status, 400);
  });

  it('throws a draft away', async () => {
    currentAuth = admin;
    await call('PUT', '/admin/draft', { rules: rulesWith((r) => { r.age.over11 = 0.6; }) });
    assert.equal((await call('DELETE', '/admin/draft')).status, 200);
    assert.equal((await call('GET', '/admin')).json.data.draft, null);
  });

  it('shows the history, newest first', async () => {
    currentAuth = admin;
    const { json } = await call('GET', '/admin');
    assert.deepEqual(json.data.versions.map((v) => v.version), [3, 2, 1]);
  });
});

describe('the model list for the preview dropdowns', () => {
  it('is for admins only', async () => {
    currentAuth = null;
    assert.equal((await call('GET', '/admin/models')).status, 401);
    currentAuth = { sub: 'c1', role: 'customer' };
    assert.equal((await call('GET', '/admin/models')).status, 403);
    currentAuth = { sub: 's1', role: 'staff', permissions: ['orders'] };
    assert.equal((await call('GET', '/admin/models')).status, 403);
  });

  it('lists each brand with its models and storages, tidied', async () => {
    currentAuth = admin;
    const { status, json } = await call('GET', '/admin/models');
    assert.equal(status, 200);
    assert.deepEqual(json.data.brands.map((b) => b.brand), ['Apple', 'OnePlus', 'Samsung']);
    assert.deepEqual(json.data.brands[0].models, [
      { model: 'iPhone 14', storages: ['128 GB', '256 GB'] },
      { model: 'iPhone 14 Plus', storages: ['128 GB'] },
    ]);
  });

  it('reads the rows once a minute, not on every visit', async () => {
    currentAuth = admin;
    await call('GET', '/admin/models');
    const loads = rowLoads;
    await call('GET', '/admin/models');
    await call('GET', '/admin/models');
    assert.equal(rowLoads, loads);
    clock.t += 61_000;
    await call('GET', '/admin/models');
    assert.equal(rowLoads, loads + 1);
  });
});

describe('the preview', () => {
  const input = { brand: 'Apple', model: 'iPhone 14', storage: '128 GB', screen_condition: 'cracked', age_period: 'above_11_months' };

  it('prices one quote twice: under the live rules and under the rules being edited', async () => {
    currentAuth = admin;
    previewCalls.length = 0;
    const { status, json } = await call('POST', '/admin/preview', { input, rules: rulesWith((r) => { r.age.over11 = 0.65; }) });
    assert.equal(status, 200);
    assert.equal(json.data.live.offerAmount, 7800, 'live is version 3, over11 0.78');
    assert.equal(json.data.draft.offerAmount, 6500);
    assert.equal(previewCalls.length, 2);
    assert.ok(previewCalls.every((c) => c.options.preview === true), 'a preview must never leave a quote record');
  });

  it('uses the live rules for both when no rules are given', async () => {
    currentAuth = admin;
    const { json } = await call('POST', '/admin/preview', { input });
    assert.equal(json.data.live.offerAmount, json.data.draft.offerAmount);
  });

  it('refuses rules out of bounds and a quote with no model', async () => {
    currentAuth = admin;
    const bad = await call('POST', '/admin/preview', { input, rules: rulesWith((r) => { r.age.over11 = 0.1; }) });
    assert.equal(bad.status, 400);
    assert.ok(bad.json.errors.length >= 1);
    assert.equal((await call('POST', '/admin/preview', { input: { brand: 'Apple' } })).status, 400);
  });

  it('passes only the quote answers on, and trims what it passes', () => {
    const picked = pickPreviewInput({
      brand: 'Apple', model: 'iPhone 14', storage: '128 GB', screen_condition: 'cracked', __proto__x: 'evil', admin: true,
      defects: ['wifi', 5, 'x'.repeat(200)], accessories: new Array(20).fill('Original Box'), powers_on: true, battery_health: 'y'.repeat(500),
    });
    assert.equal(picked.admin, undefined);
    assert.equal(picked.__proto__x, undefined);
    assert.deepEqual(picked.defects.slice(0, 1), ['wifi']);
    assert.equal(picked.defects.length, 2);
    assert.equal(picked.defects[1].length, 60);
    assert.equal(picked.accessories.length, 5);
    assert.equal(picked.battery_health.length, 80);
    assert.equal(picked.powers_on, true);
  });
});

describe('a quote on the real quote service', () => {
  const input = { brand: 'Apple', model: 'iPhone 13', storage: '128 GB', powers_on: true, activation_lock_cleared: true, ownership_verified: true, liquid_damage: false, cosmetic_condition: 'flawless', screen_condition: 'flawless', body_condition: 'flawless', battery_health: 'healthy', defects: [], accessories: [], age_period: 'above_11_months' };

  it('is priced on the rules it is handed, and a preview leaves no record', async () => {
    const standard = await createPhoneQuote(input, { preview: true });
    const lowered = await createPhoneQuote(input, { preview: true, pricingRules: rulesWith((r) => { r.age.oldIphone = 0.8; }) });
    assert.equal(standard.status, 'quoted');
    assert.ok(lowered.offerAmount < standard.offerAmount, `${lowered.offerAmount} should be below ${standard.offerAmount}`);
    assert.equal(getQuoteAudit(standard.quoteId), null, 'a preview is not recorded');
  });

  it('is recorded when it is a real quote, with the rules that priced it', async () => {
    const rules = rulesWith((r) => { r.age.oldIphone = 0.9; });
    const quote = await createPhoneQuote(input, { pricingRules: rules, pricingRulesVersion: 5 });
    const audit = getQuoteAudit(quote.quoteId);
    assert.ok(audit);
    assert.equal(audit.pricingRulesVersion, 5);
    assert.equal(audit.pricingRules.age.oldIphone, 0.9);
  });

  it('is priced on the defaults when no rules were ever saved', async () => {
    const quote = await createPhoneQuote(input, { preview: true });
    const explicit = await createPhoneQuote(input, { preview: true, pricingRules: DEFAULT_PRICING_RULES });
    assert.equal(quote.offerAmount, explicit.offerAmount);
  });
});
