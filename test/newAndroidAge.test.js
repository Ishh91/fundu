import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { quotePhone, calculatePhoneAgingFactor } from '../fundu_phone_quote.mjs';
import {
  DEFAULT_PRICING_RULES,
  RULE_LIMITS,
  androidModelKey,
  fillMissingGroups,
  resolvePricingRules,
  validatePricingRules,
  cloneRules,
} from '../fundu_pricing_rules.mjs';

const OLD = 'above_11_months';

/** A flawless Android older than 11 months with no box, charger or bill, the way Cashify was asked, on the admin price `price`. */
const offerAt = (brand, model, price, storage, rules) =>
  quotePhone(
    {
      brand, model, storage, powers_on: true, activation_lock_cleared: true, ownership_verified: true, liquid_damage: false,
      cosmetic_condition: 'flawless', screen_condition: 'flawless', body_condition: 'flawless', battery_health: 'healthy',
      defects: [], accessories: [], age_period: OLD,
    },
    { catalogPrice: price, catalogStorage: storage, ...(rules ? { pricingRules: rules } : {}) },
  ).offerAmount;

describe('the key of an Android model', () => {
  it('has the brand and the model, without a trailing 5G, and the brand once', () => {
    assert.equal(androidModelKey('Samsung', 'Galaxy S23 FE 5G'), 'samsunggalaxys23fe');
    assert.equal(androidModelKey('Samsung', 'Galaxy S23 fe'), 'samsunggalaxys23fe');
    assert.equal(androidModelKey('OnePlus', '10T'), 'oneplus10t');
    assert.equal(androidModelKey('OnePlus', 'OnePlus 10T'), 'oneplus10t');
    assert.equal(androidModelKey('Realme', 'GT Neo 2'), 'realmegtneo2');
  });

  it('tells a OnePlus 9 from an iQOO 9', () => {
    assert.notEqual(androidModelKey('OnePlus', '9'), androidModelKey('iQOO', '9 5G'));
    assert.equal(androidModelKey('iQOO', '9 5G'), 'iqoo9');
  });

  it('is a valid model key for the rules', () => {
    for (const key of Object.keys(DEFAULT_PRICING_RULES.age.oldAndroid)) assert.match(key, /^[a-z0-9]{2,40}$/, key);
  });
});

describe('the age factor of an Android older than 11 months', () => {
  it('is 0.77 for a Samsung and 0.73 for every other recent Android, where it was 0.80 for all', () => {
    assert.equal(calculatePhoneAgingFactor('Samsung', 'Galaxy S25 Ultra', false, OLD), 0.77);
    assert.equal(calculatePhoneAgingFactor('Samsung', 'Galaxy S26 Ultra 5G', false, OLD), 0.77);
    assert.equal(calculatePhoneAgingFactor('OnePlus', '13', false, OLD), 0.73);
    assert.equal(calculatePhoneAgingFactor('Realme', 'P1 5G', false, OLD), 0.73);
    assert.equal(calculatePhoneAgingFactor('Google', 'Pixel 10', false, OLD), 0.73);
    assert.equal(calculatePhoneAgingFactor('Nothing', 'Phone (2a)', false, 'out_of_warranty'), 0.73);
    assert.equal(calculatePhoneAgingFactor('Infinix', 'Note 40X 5G', false, ''), 0.73);
  });

  it('is its own factor for an Android Cashify treats as old', () => {
    assert.equal(calculatePhoneAgingFactor('Samsung', 'Galaxy S23 FE 5G', false, OLD), 0.975);
    assert.equal(calculatePhoneAgingFactor('Samsung', 'Galaxy S21', false, OLD), 0.955);
    assert.equal(calculatePhoneAgingFactor('Samsung', 'Galaxy A52 5G', false, OLD), 0.925);
    assert.equal(calculatePhoneAgingFactor('OnePlus', '10T', false, OLD), 0.955);
    assert.equal(calculatePhoneAgingFactor('OnePlus', 'Nord 2 5G', false, OLD), 0.94);
    assert.equal(calculatePhoneAgingFactor('iQOO', '9 5G', false, OLD), 0.95);
    assert.equal(calculatePhoneAgingFactor('Realme', 'GT Neo 2', false, OLD), 0.84);
  });

  it('keeps the old factor to the brand it was measured for', () => {
    assert.equal(calculatePhoneAgingFactor('OnePlus', '9', false, OLD), 0.95);
    assert.equal(calculatePhoneAgingFactor('Vivo', '9', false, OLD), 0.73);
    assert.equal(calculatePhoneAgingFactor('Poco', 'F5', false, OLD), 0.73, 'Cashify offers a Poco F5 0.74 of its market price, so it is not old');
  });

  it('does not touch a phone younger than 11 months, or an iPhone', () => {
    for (const [brand, model] of [['Samsung', 'Galaxy S25 Ultra'], ['OnePlus', '13'], ['Samsung', 'Galaxy S21']]) {
      assert.equal(calculatePhoneAgingFactor(brand, model, false, '0_to_3_months'), 1.0, model);
      assert.equal(calculatePhoneAgingFactor(brand, model, false, '3_to_6_months'), 0.9345, model);
      assert.equal(calculatePhoneAgingFactor(brand, model, false, '6_to_9_months'), 0.9078, model);
    }
    assert.equal(calculatePhoneAgingFactor('Apple', 'iPhone 16', false, OLD), 0.80);
    assert.equal(calculatePhoneAgingFactor('Apple', 'iPhone 14', false, OLD), 0.955);
  });
});

describe('the flawless offer of an Android, against what Cashify offered (no accessories)', () => {
  // [brand, model, storage, admin price, Cashify's offer on 17 November 2026]
  const cashify = [
    ['Samsung', 'Galaxy Z Fold 8', '512 GB', 102250, 77690],
    ['Samsung', 'Galaxy S25 Edge', '512 GB', 50090, 37640],
    ['Samsung', 'Galaxy S24 FE', '256 GB', 26440, 19660],
    ['Samsung', 'Galaxy S23 FE 5G', '128 GB', 19250, 18030],
    ['Samsung', 'Galaxy S21', '256 GB', 14280, 12860],
    ['Realme', '15 Pro 5G', '128 GB', 19480, 13330],
    ['Oppo', 'F31 Pro 5G', '128 GB', 19690, 13430],
    ['Xiaomi', '14 Civi', '512 GB', 20600, 14230],
    ['Motorola', 'moto signature', '256 GB', 36670, 26190],
    ['OnePlus', 'Nord 6', '256 GB', 29550, 20010],
    ['OnePlus', '10T', '256 GB', 15760, 14240],
    ['OnePlus', 'Nord 2 5G', '256 GB', 11340, 9870],
    ['iQOO', '15', '256 GB', 40950, 29540],
    ['Poco', 'F5', '256 GB', 14060, 9780],
    ['Nothing', 'Phone 4a', '256 GB', 28750, 20040],
    ['Nothing', 'Phone 3a', '256 GB', 22300, 16060],
  ];

  for (const [brand, model, storage, price, theirs] of cashify) {
    it(`${brand} ${model} ${storage} is within 5% of Cashify's ${theirs}`, () => {
      const ours = offerAt(brand, model, price, storage);
      assert.ok(Math.abs(ours / theirs - 1) <= 0.05, `${ours} against ${theirs}`);
    });
  }

  it('is no longer 4% to 33% above Cashify on a recent phone: the average gap is under 3%', () => {
    const recent = cashify.filter(([, , , , theirs]) => theirs > 0).map(([brand, model, storage, price, theirs]) => offerAt(brand, model, price, storage) / theirs - 1);
    const mean = recent.reduce((sum, gap) => sum + Math.abs(gap), 0) / recent.length;
    assert.ok(mean < 0.03, `mean gap ${(mean * 100).toFixed(1)}%`);
  });
});

describe('the Android factors as editable rules', () => {
  it('have defaults and bounds', () => {
    assert.equal(DEFAULT_PRICING_RULES.age.samsungOver11, 0.77);
    assert.equal(DEFAULT_PRICING_RULES.age.androidOver11, 0.73);
    assert.equal(DEFAULT_PRICING_RULES.age.oldAndroid.samsunggalaxys21, 0.955);
    for (const key of ['samsungOver11', 'androidOver11', 'oldAndroid']) assert.deepEqual(RULE_LIMITS.age[key], [0.5, 1.0], key);
  });

  it('take an edited factor, and an edited list', () => {
    const rules = cloneRules(DEFAULT_PRICING_RULES);
    rules.age.androidOver11 = 0.7;
    rules.age.samsungOver11 = 0.8;
    rules.age.oldAndroid.oneplus12 = 0.9;
    const resolved = resolvePricingRules(rules);
    assert.equal(calculatePhoneAgingFactor('Vivo', 'X200', false, OLD, resolved), 0.7);
    assert.equal(calculatePhoneAgingFactor('Samsung', 'Galaxy S25', false, OLD, resolved), 0.8);
    assert.equal(calculatePhoneAgingFactor('OnePlus', '12', false, OLD, resolved), 0.9);
    assert.ok(offerAt('Vivo', 'X200', 40000, '256 GB', rules) < offerAt('Vivo', 'X200', 40000, '256 GB'));
  });

  it('can have a phone taken off the old list, so it is a recent one', () => {
    const rules = cloneRules(DEFAULT_PRICING_RULES);
    delete rules.age.oldAndroid.samsunggalaxys21;
    assert.equal(calculatePhoneAgingFactor('Samsung', 'Galaxy S21', false, OLD, resolvePricingRules(rules)), 0.77);
  });

  it('are refused when out of bounds, and a bad entry in the list is dropped when read', () => {
    const rules = cloneRules(DEFAULT_PRICING_RULES);
    rules.age.androidOver11 = 0.2;
    rules.age.oldAndroid.oneplus10t = 1.4;
    const errors = validatePricingRules(rules).errors.join(' ');
    assert.match(errors, /androidOver11/);
    assert.match(errors, /Old Android phones/);
    const resolved = resolvePricingRules(rules);
    assert.equal(resolved.age.androidOver11, 0.73);
    assert.equal(resolved.age.oldAndroid.oneplus10t, undefined);
  });

  it('are filled in for rules saved before they existed, so those still publish and still price', () => {
    const saved = cloneRules(DEFAULT_PRICING_RULES);
    delete saved.age.samsungOver11;
    delete saved.age.androidOver11;
    delete saved.age.oldAndroid;
    saved.age.over11 = 0.78;
    assert.equal(validatePricingRules(saved).valid, false);
    const filled = fillMissingGroups(saved);
    assert.equal(validatePricingRules(filled).valid, true);
    assert.equal(filled.age.over11, 0.78, 'a value that was saved is not replaced');
    assert.equal(filled.age.androidOver11, 0.73);
    assert.equal(resolvePricingRules(saved).age.oldAndroid.samsunggalaxys21, 0.955);
    assert.equal(saved.age.androidOver11, undefined, 'the saved object is not changed');
  });
});
