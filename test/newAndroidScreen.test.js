import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { quotePhone, androidCrackRupees, ANDROID_SCREEN_CRACK_RUPEES } from '../fundu_phone_quote.mjs';
import {
  DEFAULT_PRICING_RULES,
  androidModelKey,
  cloneRules,
  fillMissingGroups,
  resolvePricingRules,
  validatePricingRules,
} from '../fundu_pricing_rules.mjs';

const near = (actual, expected, tolerance, label) => assert.ok(Math.abs(actual - expected) <= tolerance, `${label}: expected about ${expected}, got ${actual}`);

/** A phone older than 11 months, no box, charger or bill, on the admin price `price`, with the given screen. */
const offerAt = (brand, model, price, storage, extra = {}, rules) =>
  quotePhone(
    {
      brand, model, storage, powers_on: true, activation_lock_cleared: true, ownership_verified: true, liquid_damage: false,
      cosmetic_condition: 'flawless', screen_condition: 'flawless', body_condition: 'flawless', battery_health: 'healthy',
      defects: [], accessories: [], age_period: 'above_11_months', ...extra,
    },
    { catalogPrice: price, catalogStorage: storage, ...(rules ? { pricingRules: rules } : {}) },
  ).offerAmount;

const cut = (brand, model, price, storage, screen, rules, extra = {}) =>
  offerAt(brand, model, price, storage, extra, rules) - offerAt(brand, model, price, storage, { ...extra, screen_condition: screen }, rules);

describe('the cracked screen of an Android measured on Cashify (older than 11 months)', () => {
  // [brand, model, storage, admin price, what Cashify took off a cracked screen on 17 November 2026]
  const measured = [
    ['Samsung', 'Galaxy Z Fold 8', '512 GB', 102250, 28560],
    ['Samsung', 'Galaxy S25 Edge', '512 GB', 50090, 10710],
    ['Samsung', 'Galaxy S24 FE', '256 GB', 26440, 5360],
    ['Samsung', 'Galaxy S23 FE 5G', '128 GB', 19250, 6250],
    ['Samsung', 'Galaxy S21', '256 GB', 14280, 5350],
    ['Samsung', 'Galaxy A52', '128 GB', 6450, 2260],
    ['Realme', '15 Pro 5G', '128 GB', 19480, 5600],
    ['Realme', 'P1 5G', '256 GB', 12600, 2500],
    ['Vivo', 'Y28e 5G', '64 GB', 8620, 1780],
    ['Oppo', 'Reno16c 5G', '128 GB', 29500, 5950],
    ['Xiaomi', '14 Civi', '512 GB', 20600, 5710],
    ['Motorola', 'moto signature', '256 GB', 36670, 11900],
    ['OnePlus', 'Nord 6', '256 GB', 29550, 5950],
    ['OnePlus', '10T', '256 GB', 15760, 4170],
    ['iQOO', '15', '256 GB', 40950, 5950],
    ['Poco', 'M7 Pro 5G', '128 GB', 10090, 2380],
    ['Infinix', 'Note 40X 5G', '256 GB', 7280, 1190],
    ['Nothing', 'Phone 3', '512 GB', 37150, 5350],
    ['Nothing', 'Phone (2a)', '256 GB', 18870, 4410],
    ['Samsung', 'Galaxy S26 Ultra', '256 GB', 82920, 12500],
    ['Samsung', 'Galaxy S23 ultra', '256 GB', 32280, 9520],
    // measured on 17 November 2026 in a second batch of the most-asked phones
    ['Samsung', 'Galaxy S24', '128 GB', 34390, 7740],
    ['Samsung', 'Galaxy S24 Ultra', '256 GB', 62820, 11010],
    ['Samsung', 'Galaxy S25 5G', '128 GB', 43140, 8920],
    ['Samsung', 'Galaxy S22 Ultra 5G', '128 GB', 22000, 10110],
    ['Samsung', 'Galaxy A55', '128 GB', 17830, 4520],
    ['Samsung', 'Galaxy Z Flip 6', '256 GB', 39700, 14280],
    ['Samsung', 'Galaxy Z Fold 6', '256 GB', 66800, 24630],
    ['OnePlus', '13', '256 GB', 42900, 11310],
    ['OnePlus', '12', '256 GB', 34480, 9520],
    ['OnePlus', '11R 5G', '128 GB', 22210, 5050],
    ['Realme', '14 Pro 5G', '128 GB', 17670, 4280],
    ['Xiaomi', 'Redmi Note 13 Pro+ 5G', '256 GB', 17790, 4160],
    ['Poco', 'X7 Pro 5G', '256 GB', 15200, 3930],
    ['Vivo', 'V40 5G', '128 GB', 21090, 5470],
    ['Vivo', 'X100 5G', '256 GB', 27960, 9100],
    ['iQOO', '13 5G', '256 GB', 25180, 5360],
    ['Google', 'Pixel 8 5G', '128 GB', 26470, 8330],
    ['Google', 'Pixel 8a', '128 GB', 24350, 7140],
    ['Nothing', 'Phone (2)', '128 GB', 20920, 4410],
  ];

  for (const [brand, model, storage, price, theirs] of measured) {
    it(`${brand} ${model} loses ${theirs} for a crack, as on Cashify`, () => {
      near(cut(brand, model, price, storage, 'cracked'), theirs, 60, `${brand} ${model}`);
    });
  }

  it('is not a share of the price: the same model on a higher admin price loses the same amount', () => {
    const low = cut('iQOO', '15', 30000, '256 GB', 'cracked');
    const high = cut('iQOO', '15', 60000, '256 GB', 'cracked');
    near(low, 5950, 60, 'iQOO 15 on 30,000');
    near(high, 5950, 60, 'iQOO 15 on 60,000');
  });

  it('is the same on every storage and, as on an iPhone, at every age', () => {
    near(cut('Nothing', 'Phone 3a', 22300, '256 GB', 'cracked'), 4760, 60, '256 GB');
    near(cut('Nothing', 'Phone 3a', 18000, '128 GB', 'cracked'), 4760, 60, '128 GB');
    near(cut('Nothing', 'Phone 3a', 22300, '256 GB', 'cracked', undefined, { age_period: '3_to_6_months' }), 4760, 60, '3 to 6 months');
  });

  it('is never more than 75% of the aged value', () => {
    const rules = cloneRules(DEFAULT_PRICING_RULES);
    rules.androidScreen.crackRupees.pocom7pro = 50000;
    const aged = offerAt('Poco', 'M7 Pro 5G', 10090, '128 GB', {}, rules);
    assert.ok(cut('Poco', 'M7 Pro 5G', 10090, '128 GB', 'cracked', rules) <= Math.round(10090 * 0.73 * 0.75) + 5, String(aged));
  });
});

describe('every other screen state of a measured Android is a multiple of its crack', () => {
  it('on a cheap phone (Poco M7 Pro: Cashify took 1,170 for more than 2 scratches)', () => {
    near(cut('Poco', 'M7 Pro 5G', 10090, '128 GB', 'scratches_major'), 1170, 40, 'more than 2 scratches');
    near(cut('Poco', 'M7 Pro 5G', 10090, '128 GB', 'scratches_minor'), Math.round(2380 * 0.212), 40, '1-2 scratches');
  });

  it('on a flagship (iQOO 15: Cashify took 2,940 for more than 2 scratches and about 10,000 for touch)', () => {
    near(cut('iQOO', '15', 40950, '256 GB', 'scratches_major'), 2940, 40, 'more than 2 scratches');
    near(cut('iQOO', '15', 40950, '256 GB', 'touch_fault'), 10000, 120, 'touch not working');
  });

  it('costs more the worse the state', () => {
    const order = ['scratches_minor', 'scratches_major', 'cracked', 'touch_fault'];
    for (let i = 1; i < order.length; i++) {
      assert.ok(cut('Nothing', 'Phone 4a', 28750, '256 GB', order[i]) > cut('Nothing', 'Phone 4a', 28750, '256 GB', order[i - 1]), order[i]);
    }
  });

  it('takes 85% of a crack for a replaced (non-original) screen', () => {
    const lost = offerAt('OnePlus', 'Nord 6', 29550, '256 GB') - offerAt('OnePlus', 'Nord 6', 29550, '256 GB', { defects: ['screen_not_original'] });
    near(lost, 5950 * 0.85, 60, 'replaced screen');
  });
});

describe('an Android that was not measured', () => {
  it('is priced on the screen tables, as before', () => {
    assert.equal(androidCrackRupees('Samsung', 'Galaxy A14 5G'), undefined);
    const share = cut('Samsung', 'Galaxy A14 5G', 6240, '128 GB', 'cracked') / offerAt('Samsung', 'Galaxy A14 5G', 6240, '128 GB');
    assert.ok(share > 0.2 && share < 0.45, String(share));
  });

  it('does not take the amount of a different model with a similar name: a Galaxy S21+ is not a Galaxy S21', () => {
    assert.equal(androidModelKey('Samsung', 'Galaxy S21+ 5G'), 'samsunggalaxys21plus');
    assert.notEqual(androidModelKey('Samsung', 'Galaxy S21+'), androidModelKey('Samsung', 'Galaxy S21'));
    assert.equal(androidCrackRupees('Samsung', 'Galaxy S21+ 5G'), undefined);
    assert.equal(androidCrackRupees('Samsung', 'Galaxy S21 5G'), 5350, 'the admin lists the S21 with and without 5G');
  });
});

describe('an iPhone is not touched by the Android amounts', () => {
  it('keeps its own amount, and an iPhone key in the Android list is ignored', () => {
    const rules = cloneRules(DEFAULT_PRICING_RULES);
    rules.androidScreen.crackRupees.iphone14 = 20000;
    near(cut('Apple', 'iPhone 14', 29270, '128 GB', 'cracked', rules), 10700, 100, 'iPhone 14');
  });
});

describe('the Android screen amounts as editable rules', () => {
  it('start with the measured phones', () => {
    assert.equal(Object.keys(ANDROID_SCREEN_CRACK_RUPEES).length, 70);
    assert.equal(DEFAULT_PRICING_RULES.androidScreen.crackRupees.iqoo15, 5950);
    assert.equal(validatePricingRules(DEFAULT_PRICING_RULES).valid, true);
  });

  it('take an edited amount, a new phone, and a phone taken out', () => {
    const rules = cloneRules(DEFAULT_PRICING_RULES);
    rules.androidScreen.crackRupees.iqoo15 = 8000;
    rules.androidScreen.crackRupees.samsunggalaxya14 = 1500;
    delete rules.androidScreen.crackRupees.nothingphone3;
    near(cut('iQOO', '15', 40950, '256 GB', 'cracked', rules), 8000, 60, 'edited');
    near(cut('Samsung', 'Galaxy A14 5G', 6240, '128 GB', 'cracked', rules), 1500, 60, 'added');
    assert.notEqual(Math.round(cut('Nothing', 'Phone 3', 37150, '512 GB', 'cracked', rules)), 5350, 'taken out: back on the tables');
  });

  it('are refused when out of bounds or badly keyed, and dropped when read', () => {
    const rules = cloneRules(DEFAULT_PRICING_RULES);
    rules.androidScreen.crackRupees.iqoo15 = 90;
    rules.androidScreen.crackRupees['Bad Key!'] = 3000;
    const errors = validatePricingRules(rules).errors.join(' ');
    assert.match(errors, /Android crack amounts/);
    const resolved = resolvePricingRules(rules);
    assert.equal(resolved.androidScreen.crackRupees.iqoo15, undefined);
    assert.equal(resolved.androidScreen.crackRupees['Bad Key!'], undefined);
    assert.equal(resolved.androidScreen.crackRupees.nothingphone3, 5350);
  });

  it('are filled in for rules saved before they existed, so those still publish and still price', () => {
    const saved = cloneRules(DEFAULT_PRICING_RULES);
    delete saved.androidScreen;
    assert.equal(validatePricingRules(saved).valid, false);
    const filled = fillMissingGroups(saved);
    assert.equal(validatePricingRules(filled).valid, true);
    assert.equal(filled.androidScreen.crackRupees.iqoo15, 5950);
    assert.equal(resolvePricingRules(saved).androidScreen.crackRupees.iqoo15, 5950);
    assert.equal(saved.androidScreen, undefined, 'the saved object is not changed');
  });

  it('keep a saved empty list: an admin who removed every phone is not given them back', () => {
    const saved = cloneRules(DEFAULT_PRICING_RULES);
    saved.androidScreen.crackRupees = {};
    assert.deepEqual(resolvePricingRules(saved).androidScreen.crackRupees, {});
  });
});
