import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { quotePhone, backGlassRupees } from '../fundu_phone_quote.mjs';
import {
  DEFAULT_PRICING_RULES,
  androidModelKey,
  cloneRules,
  fillMissingGroups,
  resolvePricingRules,
  validatePricingRules,
} from '../fundu_pricing_rules.mjs';

/** A phone older than 11 months, no box, charger or bill, on the admin price `price`, with the given body condition. */
const offerAt = (brand, model, price, storage, body, rules) =>
  quotePhone(
    {
      brand, model, storage, powers_on: true, activation_lock_cleared: true, ownership_verified: true, liquid_damage: false,
      cosmetic_condition: 'flawless', screen_condition: 'flawless', body_condition: body, battery_health: 'healthy',
      defects: [], accessories: [], age_period: 'above_11_months',
    },
    { catalogPrice: price, catalogStorage: storage, pricingRules: rules },
  ).offerAmount;

const cut = (brand, model, price, storage, rules) =>
  offerAt(brand, model, price, storage, 'flawless', rules) - offerAt(brand, model, price, storage, 'panel_broken', rules);

describe('the per-model back glass amount', () => {
  const brand = 'Samsung';
  const model = 'Galaxy S21';
  const key = androidModelKey(brand, model);
  const basePrice = 14280;

  it('takes off that amount in rupees when the panel is broken', () => {
    const rules = cloneRules(DEFAULT_PRICING_RULES);
    rules.backGlass = { rupees: { [key]: 3500 } };
    const broken = cut(brand, model, basePrice, '128 GB', rules);
    assert.equal(broken, 3500);
  });

  it('is not used for other body states (minor scratches or dents)', () => {
    const rules = cloneRules(DEFAULT_PRICING_RULES);
    rules.backGlass = { rupees: { [key]: 3500 } };
    const flawless = offerAt(brand, model, basePrice, '128 GB', 'flawless', rules);
    const minor = offerAt(brand, model, basePrice, '128 GB', 'minor_scratches', rules);
    // Minor scratches still uses the share, not the rupees amount.
    assert.notEqual(flawless - minor, 3500);
    assert.ok(flawless - minor > 0, 'minor scratches still take something off');
  });

  it('falls back to the body damage share when the phone has no own amount', () => {
    const rules = cloneRules(DEFAULT_PRICING_RULES);
    rules.backGlass = { rupees: {} };
    const broken = cut(brand, model, basePrice, '128 GB', rules);
    // Share-based: expectedResaleProceeds * agingFactor * bodyDamage.standard.panel_broken (0.11).
    // Order-of-magnitude check: should be in the low thousands, and clearly not exactly 3500.
    assert.ok(broken > 0, 'a broken panel still takes something off');
    assert.notEqual(broken, 3500);
  });

  it('is exposed through backGlassRupees()', () => {
    const rules = cloneRules(DEFAULT_PRICING_RULES);
    rules.backGlass = { rupees: { [key]: 4200 } };
    assert.equal(backGlassRupees(brand, model, rules), 4200);
    assert.equal(backGlassRupees('OnePlus', '12', rules), undefined);
  });
});

describe('back glass rule plumbing', () => {
  it('fills a missing backGlass group with an empty one so older saves still price', () => {
    const rules = cloneRules(DEFAULT_PRICING_RULES);
    delete rules.backGlass;
    const filled = fillMissingGroups(rules);
    assert.deepEqual(filled.backGlass, { rupees: {} });
  });

  it('resolvePricingRules keeps a typed back glass map and drops out-of-range entries', () => {
    const saved = {
      ...cloneRules(DEFAULT_PRICING_RULES),
      backGlass: { rupees: { samsunggalaxys21: 3500, oneplus12: 99999 /* out of range */, bogus: 'not-a-number' } },
    };
    const resolved = resolvePricingRules(saved);
    assert.equal(resolved.backGlass.rupees.samsunggalaxys21, 3500);
    assert.ok(!('oneplus12' in resolved.backGlass.rupees));
    assert.ok(!('bogus' in resolved.backGlass.rupees));
  });

  it('validatePricingRules rejects back glass amounts outside the allowed range', () => {
    const rules = cloneRules(DEFAULT_PRICING_RULES);
    rules.backGlass = { rupees: { samsunggalaxys21: 999999 } };
    const result = validatePricingRules(rules);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((error) => error.toLowerCase().includes('back glass')));
  });
});
