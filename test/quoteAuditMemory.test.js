import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { quotePhone } from '../fundu_phone_quote.mjs';
import { DEFAULT_PRICING_RULES, cloneRules } from '../fundu_pricing_rules.mjs';

const answers = {
  brand: 'Samsung', model: 'Galaxy S21', storage: '128 GB', powers_on: true, activation_lock_cleared: true, ownership_verified: true, liquid_damage: false,
  cosmetic_condition: 'good', screen_condition: 'flawless', body_condition: 'flawless', battery_health: 'healthy', defects: [], accessories: [], age_period: 'above_11_months',
};
const quote = (rules) => quotePhone(answers, { catalogPrice: 14280, catalogStorage: '128 GB', pricingRules: rules });

describe('the rules a quote audit keeps', () => {
  it('are one shared object for quotes priced with the same rules object', () => {
    // A quote audit keeps the rules it was priced with. A new ~30 KB copy per quote filled the server's heap.
    const rules = cloneRules(DEFAULT_PRICING_RULES);
    const first = quote(rules)._internalAudit.pricingRules;
    const second = quote(rules)._internalAudit.pricingRules;
    assert.equal(first, second);
  });

  it('are a different object when the rules object is different', () => {
    const a = quote(cloneRules(DEFAULT_PRICING_RULES))._internalAudit.pricingRules;
    const b = quote(cloneRules(DEFAULT_PRICING_RULES))._internalAudit.pricingRules;
    assert.notEqual(a, b);
  });

  it('still price the same: sharing the resolved rules does not change an offer', () => {
    const rules = cloneRules(DEFAULT_PRICING_RULES);
    const one = quote(rules).offerAmount;
    const two = quote(rules).offerAmount;
    assert.equal(one, two);
    assert.equal(one, quote(undefined).offerAmount);
  });

  it('do not grow memory per quote', () => {
    const rules = cloneRules(DEFAULT_PRICING_RULES);
    const audits = [];
    global.gc?.();
    const before = process.memoryUsage().heapUsed;
    for (let i = 0; i < 600; i += 1) audits.push(quote(rules)._internalAudit);
    global.gc?.();
    const perQuoteKb = (process.memoryUsage().heapUsed - before) / 600 / 1024;
    // It was about 30 KB per quote. Without --expose-gc the number is noisy, so the bar is loose.
    assert.ok(perQuoteKb < 15, `each kept quote audit holds ${perQuoteKb.toFixed(1)} KB`);
    assert.equal(audits.length, 600);
  });
});
