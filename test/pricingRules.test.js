import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_PRICING_RULES,
  RULE_LIMITS,
  SCREEN_STATE_KEYS,
  normalizeModelKey,
  resolvePricingRules,
  validatePricingRules,
  diffPricingRules,
  cloneRules,
} from '../fundu_pricing_rules.mjs';
import { quotePhone, calculatePhoneAgingFactor, appleCrackRupees, screenStateShare } from '../fundu_phone_quote.mjs';

const FULL = ['Original Box', 'Original Charger', 'Valid Bill'];
const near = (actual, expected, tolerance, label) => assert.ok(Math.abs(actual - expected) <= tolerance, `${label}: expected about ${expected}, got ${actual}`);

// With no accessories the offer is the aged price less 800 (box 300, charger 300, bill 200).
const NO_ACCESSORIES = 800;

/** A flawless phone older than 11 months, no accessories, on the admin price `price`. */
const quote = (brand, model, price, storage, pricingRules, extra = {}) =>
  quotePhone(
    {
      brand, model, storage, powers_on: true, activation_lock_cleared: true, ownership_verified: true, liquid_damage: false,
      cosmetic_condition: 'flawless', screen_condition: 'flawless', body_condition: 'flawless', battery_health: 'healthy',
      defects: [], accessories: [], age_period: 'above_11_months', ...extra,
    },
    { catalogPrice: price, catalogStorage: storage, pricingRules },
  );
const offer = (...args) => quote(...args).offerAmount;
const iphone = (model, price, rules, extra) => quote('Apple', model, price, '128 GB', rules, extra);
const withRules = (change) => {
  const rules = cloneRules(DEFAULT_PRICING_RULES);
  change(rules);
  return rules;
};

describe('model keys', () => {
  it('drop everything but letters and digits, and a leading "Apple"', () => {
    assert.equal(normalizeModelKey('iPhone 16 Pro max'), 'iphone16promax');
    assert.equal(normalizeModelKey('Apple iPhone 15 Pro'), 'iphone15pro');
    assert.equal(normalizeModelKey('iPhone SE 3rd Gen (2022)'), 'iphonese3rdgen2022');
    assert.equal(normalizeModelKey(undefined), '');
  });
});

describe('the default rules', () => {
  it('hold what the engine always used', () => {
    assert.equal(DEFAULT_PRICING_RULES.age.over11, 0.80);
    assert.equal(DEFAULT_PRICING_RULES.age.oldIphone, 0.955);
    assert.equal(DEFAULT_PRICING_RULES.age.recentIphone.iphone17promax, 0.735);
    assert.equal(DEFAULT_PRICING_RULES.appleScreen.crackRupees.iphone14plus, 11900);
    assert.equal(DEFAULT_PRICING_RULES.appleScreen.touchRupees.iphone15, 19350);
    assert.equal(DEFAULT_PRICING_RULES.appleScreen.multiples.touch_fault, 1.68);
    assert.equal(DEFAULT_PRICING_RULES.samsungMidFactor, 0.8);
  });

  it('are valid, and cannot be changed by accident', () => {
    assert.deepEqual(validatePricingRules(DEFAULT_PRICING_RULES), { valid: true, errors: [] });
    assert.throws(() => { 'use strict'; DEFAULT_PRICING_RULES.age.over11 = 0.5; }, TypeError);
    assert.ok(Object.isFrozen(DEFAULT_PRICING_RULES.appleScreen.crackRupees));
  });

  it('cover all thirteen screen states', () => {
    assert.equal(SCREEN_STATE_KEYS.length, 13);
    assert.ok(SCREEN_STATE_KEYS.includes('touch_fault'));
  });
});

describe('resolving saved rules', () => {
  it('gives the defaults, as a copy, when nothing is saved', () => {
    for (const nothing of [undefined, null, {}, 'junk', 42, []]) {
      const resolved = resolvePricingRules(nothing);
      assert.deepEqual(resolved, DEFAULT_PRICING_RULES);
      assert.notEqual(resolved, DEFAULT_PRICING_RULES);
      assert.ok(!Object.isFrozen(resolved));
    }
    const a = resolvePricingRules(undefined);
    a.age.over11 = 0.5;
    assert.equal(resolvePricingRules(undefined).age.over11, 0.80);
  });

  it('keeps a valid value', () => {
    const resolved = resolvePricingRules(withRules((r) => { r.age.over11 = 0.78; r.samsungMidFactor = 0.9; r.appleScreen.crackRupees.iphone14 = 9000; }));
    assert.equal(resolved.age.over11, 0.78);
    assert.equal(resolved.samsungMidFactor, 0.9);
    assert.equal(resolved.appleScreen.crackRupees.iphone14, 9000);
  });

  it('replaces a value that is missing, out of bounds or not a number with its default', () => {
    const resolved = resolvePricingRules({
      age: { under3: 5, over11: 'x', oldIphone: 0.1, recentIphone: { iphone17: 0.01, iphone16e: 0.7 } },
      appleScreen: { maxShare: 5, multiples: { touch_fault: -2, scratches_minor: 0.3 } },
      samsungMidFactor: NaN,
    });
    assert.equal(resolved.age.under3, 1.0);
    assert.equal(resolved.age.over11, 0.80);
    assert.equal(resolved.age.oldIphone, 0.955);
    assert.equal(resolved.age.recentIphone.iphone17, undefined, 'a bad entry is dropped, not defaulted back in');
    assert.equal(resolved.age.recentIphone.iphone16e, 0.7);
    assert.equal(resolved.appleScreen.maxShare, 0.75);
    assert.equal(resolved.appleScreen.multiples.touch_fault, 1.68);
    assert.equal(resolved.appleScreen.multiples.scratches_minor, 0.3);
    assert.equal(resolved.samsungMidFactor, 0.8);
  });

  it('keeps the model lists exactly as saved, so a removed model stays removed', () => {
    const resolved = resolvePricingRules(withRules((r) => { delete r.appleScreen.crackRupees.iphone14; delete r.age.recentIphone.iphone16e; }));
    assert.equal(resolved.appleScreen.crackRupees.iphone14, undefined);
    assert.equal(resolved.age.recentIphone.iphone16e, undefined);
    assert.equal(resolved.appleScreen.crackRupees.iphone13, 7440);
  });

  it('drops a model key that is not letters and digits', () => {
    const resolved = resolvePricingRules(withRules((r) => { r.appleScreen.crackRupees['bad key!'] = 5000; r.appleScreen.crackRupees.__proto__x = 5000; }));
    assert.equal(resolved.appleScreen.crackRupees['bad key!'], undefined);
    assert.equal(Object.keys(resolved.appleScreen.crackRupees).length, Object.keys(DEFAULT_PRICING_RULES.appleScreen.crackRupees).length);
  });

  it('uses the default age factors when the saved ones rise with age', () => {
    const resolved = resolvePricingRules(withRules((r) => { r.age.under3 = 0.85; r.age.m3to6 = 0.9; }));
    assert.equal(resolved.age.under3, 1.0);
    assert.equal(resolved.age.m3to6, 0.9345);
  });

  it('always keeps the crack multiple at 1', () => {
    assert.equal(resolvePricingRules(withRules((r) => { r.appleScreen.multiples.cracked = 2; })).appleScreen.multiples.cracked, 1);
  });
});

describe('validating rules', () => {
  const errorsFor = (change) => validatePricingRules(withRules(change)).errors;

  it('rejects something that is not an object', () => {
    for (const bad of [null, undefined, 5, 'x', []]) assert.equal(validatePricingRules(bad).valid, false);
  });

  it('rejects an age factor outside its bounds, and says which', () => {
    assert.match(errorsFor((r) => { r.age.over11 = 0.2; }).join(' '), /over11/);
    assert.match(errorsFor((r) => { r.age.under3 = 1.2; }).join(' '), /under3/);
    assert.match(errorsFor((r) => { r.age.oldIphone = 'x'; }).join(' '), /oldIphone/);
  });

  it('rejects age factors that rise with age', () => {
    assert.match(errorsFor((r) => { r.age.over11 = 0.95; }).join(' '), /must not be offered more as it gets older/);
  });

  it('rejects a crack amount outside 500 to 50,000, a bad model key and too many models', () => {
    assert.match(errorsFor((r) => { r.appleScreen.crackRupees.iphone14 = 100; }).join(' '), /iphone14 must be between 500/);
    assert.match(errorsFor((r) => { r.appleScreen.crackRupees.iphone14 = 90000; }).join(' '), /iphone14/);
    assert.match(errorsFor((r) => { r.appleScreen.crackRupees['bad key'] = 5000; }).join(' '), /not a valid model key/);
    assert.match(errorsFor((r) => { for (let i = 0; i < 1500; i++) r.appleScreen.touchRupees[`model${i}x`] = 5000; }).join(' '), /at most 1500/);
  });

  it('rejects a screen multiple outside 0 to 3, a changed crack multiple and an unknown state', () => {
    assert.match(errorsFor((r) => { r.appleScreen.multiples.touch_fault = 5; }).join(' '), /touch_fault/);
    assert.match(errorsFor((r) => { r.appleScreen.multiples.cracked = 1.2; }).join(' '), /must stay 1/);
    assert.match(errorsFor((r) => { r.appleScreen.multiples.made_up_state = 1; }).join(' '), /not a screen state/);
    assert.match(errorsFor((r) => { delete r.appleScreen.multiples.spots_few; }).join(' '), /spots_few/);
  });

  it('rejects a maximum share and a Samsung factor outside their bounds', () => {
    assert.match(errorsFor((r) => { r.appleScreen.maxShare = 1; }).join(' '), /most a screen can take/);
    assert.match(errorsFor((r) => { r.samsungMidFactor = 0.1; }).join(' '), /Samsung factor/);
  });

  it('reports every problem at once', () => {
    assert.ok(errorsFor((r) => { r.age.over11 = 0.1; r.samsungMidFactor = 9; r.appleScreen.maxShare = 2; }).length >= 3);
  });

  it('has bounds that the defaults sit well inside', () => {
    assert.ok(RULE_LIMITS.age.over11[0] < DEFAULT_PRICING_RULES.age.over11 && DEFAULT_PRICING_RULES.age.over11 < RULE_LIMITS.age.over11[1] + 1e-9);
  });
});

describe('diffing two rules', () => {
  it('lists each changed, added and removed value', () => {
    const after = withRules((r) => { r.age.over11 = 0.78; r.appleScreen.crackRupees.iphone99 = 20000; delete r.appleScreen.touchRupees.iphone15; });
    const diff = diffPricingRules(DEFAULT_PRICING_RULES, after);
    assert.deepEqual(diff.find((d) => d.path === 'age.over11'), { path: 'age.over11', from: 0.8, to: 0.78 });
    assert.deepEqual(diff.find((d) => d.path === 'appleScreen.crackRupees.iphone99'), { path: 'appleScreen.crackRupees.iphone99', from: undefined, to: 20000 });
    assert.deepEqual(diff.find((d) => d.path === 'appleScreen.touchRupees.iphone15'), { path: 'appleScreen.touchRupees.iphone15', from: 19350, to: undefined });
    assert.equal(diff.length, 3);
  });

  it('is empty for equal rules', () => {
    assert.deepEqual(diffPricingRules(DEFAULT_PRICING_RULES, cloneRules(DEFAULT_PRICING_RULES)), []);
  });
});

describe('the engine with no rules, and with the default rules', () => {
  const cases = [
    ['Apple', 'iPhone 14 Plus', 30890, '128 GB'], ['Apple', 'iPhone 17 Pro Max', 108000, '256 GB'], ['Apple', 'iPhone 15', 43600, '128 GB'],
    ['Samsung', 'Galaxy S23', 23970, '128 GB'], ['Samsung', 'Galaxy S26 Ultra', 82920, '256 GB'], ['OnePlus', '12', 34480, '256 GB'], ['Xiaomi', 'Redmi Note 10', 5990, '128 GB'],
  ];
  const conditions = [{}, { screen_condition: 'cracked' }, { screen_condition: 'touch_fault' }, { screen_condition: 'scratches_minor', cosmetic_condition: 'good' },
    { body_condition: 'dents_bent' }, { defects: ['wifi'] }, { age_period: '0_to_3_months' }, { age_period: '3_to_6_months' }, { age_period: '6_to_9_months' }, { accessories: FULL }];

  it('price every phone and condition the same', () => {
    for (const [brand, model, price, storage] of cases) {
      for (const extra of conditions) {
        const none = quote(brand, model, price, storage, undefined, extra);
        const defaults = quote(brand, model, price, storage, DEFAULT_PRICING_RULES, extra);
        assert.equal(defaults.offerAmount, none.offerAmount, `${model} ${JSON.stringify(extra)}`);
        assert.equal(defaults.status, none.status);
      }
    }
  });

  it('price the same when the rules are damaged: junk in, defaults out', () => {
    const junk = { age: { over11: 0.01, oldIphone: 'x' }, appleScreen: { crackRupees: 'no', maxShare: 9 }, samsungMidFactor: 99 };
    for (const [brand, model, price, storage] of cases) {
      assert.equal(offer(brand, model, price, storage, junk, { screen_condition: 'cracked' }), offer(brand, model, price, storage, undefined, { screen_condition: 'cracked' }), model);
    }
  });

  it('do not change the rules they are given', () => {
    const rules = withRules((r) => { r.age.over11 = 0.77; });
    const before = JSON.stringify(rules);
    quote('Apple', 'iPhone 15', 43600, '128 GB', rules, { screen_condition: 'cracked' });
    assert.equal(JSON.stringify(rules), before);
  });
});

describe('the engine with edited rules', () => {
  it('uses the age factors: a lower over-11-months factor lowers every phone older than 11 months, and nothing younger', () => {
    const rules = withRules((r) => { r.age.androidOver11 = 0.7; });
    assert.ok(offer('OnePlus', '12', 34480, '256 GB', rules) < offer('OnePlus', '12', 34480, '256 GB', undefined));
    near(offer('OnePlus', '12', 34480, '256 GB', rules), 34480 * 0.7 - NO_ACCESSORIES, 60, 'OnePlus 12 at 0.70');
    assert.equal(offer('OnePlus', '12', 34480, '256 GB', rules, { age_period: '0_to_3_months' }), offer('OnePlus', '12', 34480, '256 GB', undefined, { age_period: '0_to_3_months' }));
  });

  it('uses the young-age factors', () => {
    const rules = withRules((r) => { r.age.m3to6 = 0.9; r.age.m6to11 = 0.85; });
    near(offer('OnePlus', '12', 34480, '256 GB', rules, { age_period: '3_to_6_months' }), 34480 * 0.9 - NO_ACCESSORIES, 60, '3 to 6 months');
    near(offer('OnePlus', '12', 34480, '256 GB', rules, { age_period: '6_to_9_months' }), 34480 * 0.85 - NO_ACCESSORIES, 60, '6 to 11 months');
  });

  it('uses the old iPhone factor and the newest-iPhone list', () => {
    const rules = withRules((r) => { r.age.oldIphone = 0.9; r.age.recentIphone.iphone15 = 0.75; });
    near(iphone('iPhone 14', 29270, rules).offerAmount, 29270 * 0.9 - NO_ACCESSORIES, 60, 'old iPhone');
    near(iphone('iPhone 15', 43600, rules).offerAmount, 43600 * 0.75 - NO_ACCESSORIES, 60, 'iPhone 15 added to the list');
    near(iphone('iPhone 16', 55000, rules).offerAmount, 55000 * 0.8 - NO_ACCESSORIES, 60, 'an iPhone not on the list stays at over11');
  });

  it('reads the age factor through calculatePhoneAgingFactor too', () => {
    const rules = resolvePricingRules(withRules((r) => { r.age.samsungOver11 = 0.7; r.age.oldIphone = 0.9; }));
    assert.equal(calculatePhoneAgingFactor('Samsung', 'Galaxy S24', false, 'above_11_months', rules), 0.7);
    assert.equal(calculatePhoneAgingFactor('Apple', 'iPhone 13', false, 'above_11_months', rules), 0.9);
    assert.equal(calculatePhoneAgingFactor('Samsung', 'Galaxy S24', false, 'above_11_months'), 0.77);
  });

  it('uses the crack amount of a model, and a new model that was not measured', () => {
    const base = iphone('iPhone 14', 29270, undefined).offerAmount - iphone('iPhone 14', 29270, undefined, { screen_condition: 'cracked' }).offerAmount;
    const rules = withRules((r) => { r.appleScreen.crackRupees.iphone14 = 8000; r.appleScreen.crackRupees.iphone99 = 20000; });
    const lowered = iphone('iPhone 14', 29270, rules).offerAmount - iphone('iPhone 14', 29270, rules, { screen_condition: 'cracked' }).offerAmount;
    near(base, 10700, 100, 'default crack');
    near(lowered, 8000, 100, 'edited crack');
    assert.equal(appleCrackRupees('iPhone 99', resolvePricingRules(rules)), 20000);
    near(iphone('iPhone 99', 60000, rules).offerAmount - iphone('iPhone 99', 60000, rules, { screen_condition: 'cracked' }).offerAmount, 20000, 100, 'new model');
  });

  it('puts a model back on its price-tier share when its crack amount is removed', () => {
    const rules = withRules((r) => { delete r.appleScreen.crackRupees.iphone14; });
    const share = (iphone('iPhone 14', 29270, rules).offerAmount - iphone('iPhone 14', 29270, rules, { screen_condition: 'cracked' }).offerAmount) / iphone('iPhone 14', 29270, rules).offerAmount;
    assert.ok(share > 0.3 && share < 0.45, `${(share * 100).toFixed(1)}%`);
  });

  it('uses the touch amount of a model, and the multiples of the other states', () => {
    const rules = withRules((r) => { r.appleScreen.touchRupees.iphone14 = 12000; r.appleScreen.multiples.scratches_major = 0.25; });
    near(iphone('iPhone 14', 29270, rules).offerAmount - iphone('iPhone 14', 29270, rules, { screen_condition: 'touch_fault' }).offerAmount, 12000, 100, 'touch');
    near(iphone('iPhone 14', 29270, rules).offerAmount - iphone('iPhone 14', 29270, rules, { screen_condition: 'scratches_major', cosmetic_condition: 'good' }).offerAmount, 10710 * 0.25, 100, 'scratches');
  });

  it('caps a screen state at the maximum share of the value', () => {
    const rules = withRules((r) => { r.appleScreen.maxShare = 0.4; });
    const aged = 30000 * 0.735; // an iPhone 17 Pro Max older than 11 months
    const flawless = iphone('iPhone 17 Pro Max', 30000, rules).offerAmount;
    const cut = flawless - iphone('iPhone 17 Pro Max', 30000, rules, { screen_condition: 'cracked' }).offerAmount;
    assert.ok(cut <= aged * 0.4 + 60 && cut > aged * 0.4 - 120, `${cut} of an aged ${aged}`);
  });

  it('uses the Samsung factor from the middle tier, and the screen-not-original share follows it', () => {
    const rules = withRules((r) => { r.samsungMidFactor = 1.0; });
    assert.equal(screenStateShare('cracked', 30000, 'Samsung', resolvePricingRules(rules)), 0.36);
    assert.equal(screenStateShare('cracked', 30000, 'Samsung'), 0.36 * 0.8);
    assert.equal(screenStateShare('cracked', 30000, 'OnePlus', resolvePricingRules(rules)), 0.36);
    const s23 = (r) => offer('Samsung', 'Galaxy S23', 30000, '128 GB', r) - offer('Samsung', 'Galaxy S23', 30000, '128 GB', r, { screen_condition: 'cracked' });
    assert.ok(s23(rules) > s23(undefined), 'a factor of 1 takes more off a Samsung than 0.8');
  });

  it('does not move the cheap or the premium tier for a Samsung factor change', () => {
    const rules = withRules((r) => { r.samsungMidFactor = 1.1; });
    for (const [model, price] of [['Galaxy A14 5G', 6240], ['Galaxy S26 Ultra', 82920]]) {
      assert.equal(offer('Samsung', model, price, '128 GB', rules, { screen_condition: 'cracked' }), offer('Samsung', model, price, '128 GB', undefined, { screen_condition: 'cracked' }), model);
    }
  });

  it('records the version of the saved rules on the quote audit', () => {
    const q = quotePhone(
      { brand: 'Apple', model: 'iPhone 14', storage: '128 GB', powers_on: true, activation_lock_cleared: true, ownership_verified: true, liquid_damage: false, cosmetic_condition: 'flawless', screen_condition: 'flawless', body_condition: 'flawless', battery_health: 'healthy', defects: [], accessories: [], age_period: 'above_11_months' },
      { catalogPrice: 29270, catalogStorage: '128 GB', pricingRulesVersion: 7 },
    );
    assert.equal(q._internalAudit.pricingRulesVersion, 7);
    assert.equal(quote('Apple', 'iPhone 14', 29270, '128 GB', undefined)._internalAudit.pricingRulesVersion, null);
  });
});
