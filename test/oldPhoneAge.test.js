import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { quotePhone, calculatePhoneAgingFactor, isIphoneLaunchedBefore2023, OLD_PHONE_AGE_FACTOR } from '../fundu_phone_quote.mjs';

const OLD = 'above_11_months';
const near = (actual, expected, tolerance, label) => assert.ok(Math.abs(actual - expected) <= tolerance, `${label}: expected about ${expected}, got ${actual}`);

/** A flawless iPhone older than 11 months with no box, charger or bill (the way Cashify was asked), on the admin price `price`. */
const offerAt = (model, price, storage = '128 GB', extra = {}) =>
  quotePhone(
    {
      brand: 'Apple', model, storage, powers_on: true, activation_lock_cleared: true, ownership_verified: true, liquid_damage: false,
      cosmetic_condition: 'flawless', screen_condition: 'flawless', body_condition: 'flawless', battery_health: 'healthy',
      defects: [], accessories: [], age_period: OLD, ...extra,
    },
    { catalogPrice: price, catalogStorage: storage },
  );

describe('which iPhones are old enough that Cashify has no bill or warranty cut on them', () => {
  const old = ['iPhone 6', 'iPhone 6s Plus', 'iPhone 7 Plus', 'iPhone 8', 'iPhone 8 Plus', 'iPhone X', 'iPhone XR', 'iPhone XS', 'iPhone XS Max',
    'iPhone SE 2020', 'iPhone SE 2022', 'iPhone SE 3rd Gen (2022)', 'iPhone 11', 'iPhone 11 Pro', 'iPhone 11 Pro Max', 'iPhone 12', 'iPhone 12 mini',
    'iPhone 12 Pro', 'iPhone 12 Pro Max', 'iPhone 13', 'iPhone 13 mini', 'iPhone 13 Pro', 'iPhone 13 Pro Max', 'iPhone 14', 'iPhone 14 Plus',
    'iPhone 14 Pro', 'iPhone 14 Pro Max', 'Apple iPhone 14 Plus'];
  const recent = ['iPhone 15', 'iPhone 15 Plus', 'iPhone 15 Pro', 'iPhone 15 Pro Max', 'iPhone 16', 'iPhone 16e', 'iPhone 16 Plus', 'iPhone 16 Pro',
    'iPhone 16 Pro max', 'iPhone 17', 'iPhone 17e', 'iPhone 17 Pro', 'iPhone 17 Pro Max', 'iPhone Air', 'iPhone air', 'iPhone 17 Air', 'iPhone 18 Pro', 'iPhone 18 pro max'];

  for (const model of old) it(`${model} is old`, () => assert.equal(isIphoneLaunchedBefore2023('Apple', model), true));
  for (const model of recent) it(`${model} is not`, () => assert.equal(isIphoneLaunchedBefore2023('Apple', model), false));

  it('is never true for another brand, even for a model that looks like an iPhone name', () => {
    assert.equal(isIphoneLaunchedBefore2023('Samsung', 'Galaxy S23'), false);
    assert.equal(isIphoneLaunchedBefore2023('OnePlus', '11'), false);
    assert.equal(isIphoneLaunchedBefore2023('Google', 'Pixel 7'), false);
    assert.equal(isIphoneLaunchedBefore2023('Xiaomi', 'Redmi Note 11 Pro'), false);
    assert.equal(isIphoneLaunchedBefore2023('', ''), false);
    assert.equal(isIphoneLaunchedBefore2023(undefined, undefined), false);
  });
});

describe('the age factor of an old iPhone', () => {
  it('is 0.955 for a phone older than 11 months, where every other phone is 0.80', () => {
    assert.equal(OLD_PHONE_AGE_FACTOR, 0.955);
    assert.equal(calculatePhoneAgingFactor('Apple', 'iPhone 14 Plus', false, OLD), 0.955);
    assert.equal(calculatePhoneAgingFactor('Apple', 'iPhone 11', false, 'out_of_warranty'), 0.955);
    assert.equal(calculatePhoneAgingFactor('Apple', 'iPhone 13', false, ''), 0.955);
    assert.equal(calculatePhoneAgingFactor('Apple', 'iPhone 15', false, OLD), 0.80);
    assert.equal(calculatePhoneAgingFactor('Apple', 'iPhone 17 Pro Max', false, OLD), 0.735);
    assert.equal(calculatePhoneAgingFactor('Apple', 'iPhone 16 Pro Max', false, OLD), 0.80);
    assert.equal(calculatePhoneAgingFactor('Samsung', 'Galaxy S23', false, OLD), 0.80);
    assert.equal(calculatePhoneAgingFactor('OnePlus', '11', false, OLD), 0.80);
  });

  it('does not change a younger phone: 0-3 months is 1.00, 3-6 months 0.9345, 6-11 months 0.9078', () => {
    assert.equal(calculatePhoneAgingFactor('Apple', 'iPhone 14', false, '0_to_3_months'), 1.0);
    assert.equal(calculatePhoneAgingFactor('Apple', 'iPhone 14', false, '3_to_6_months'), 0.9345);
    assert.equal(calculatePhoneAgingFactor('Apple', 'iPhone 14', false, '6_to_9_months'), 0.9078);
    assert.equal(calculatePhoneAgingFactor('Apple', 'iPhone 14', true, ''), 1.0);
  });

  it('never goes above a younger phone: an old iPhone is below the 6-11 month factor', () => {
    assert.ok(OLD_PHONE_AGE_FACTOR > 0.9078, 'the old factor is above the 6-11 month one, as Cashify pays an old phone more than a young one');
  });
});

describe('the flawless offer of an old iPhone, against what Cashify offered (phone older than 11 months, no accessories)', () => {
  // [model, storage, admin price, Cashify's offer]
  const cashify = [
    ['iPhone 8 Plus', '64 GB', 7740, 6520], ['iPhone X', '256 GB', 11020, 9680], ['iPhone XR', '256 GB', 12100, 10180], ['iPhone XS Max', '256 GB', 13640, 12220],
    ['iPhone SE 2022', '128 GB', 13900, 12590], ['iPhone 11', '128 GB', 14910, 13290], ['iPhone 11 Pro', '256 GB', 18000, 16380], ['iPhone 11 Pro Max', '256 GB', 19900, 18120],
    ['iPhone 12', '128 GB', 18420, 16600], ['iPhone 12 mini', '128 GB', 16900, 15190], ['iPhone 12 Pro', '128 GB', 24250, 22670], ['iPhone 12 Pro Max', '128 GB', 25790, 24370],
    ['iPhone 13', '128 GB', 25260, 23500], ['iPhone 13 mini', '128 GB', 22390, 20610], ['iPhone 13 Pro', '128 GB', 33940, 31920], ['iPhone 13 Pro Max', '128 GB', 36160, 34140],
    ['iPhone 14', '128 GB', 29270, 27290], ['iPhone 14 Plus', '128 GB', 30890, 28910], ['iPhone 14 Pro', '128 GB', 44020, 41230], ['iPhone 14 Pro Max', '128 GB', 44860, 41990],
  ];

  for (const [model, storage, price, expected] of cashify) {
    it(`is within 7% of Cashify's ${expected.toLocaleString('en-IN')} for the ${model}`, () => {
      const offer = offerAt(model, price, storage).offerAmount;
      assert.ok(Math.abs(offer / expected - 1) < 0.07, `${model}: Fundu ${offer} vs Cashify ${expected} (${((offer / expected - 1) * 100).toFixed(1)}%)`);
    });
  }

  it('is within 3% of Cashify on average', () => {
    const gaps = cashify.map(([model, storage, price, expected]) => Math.abs(offerAt(model, price, storage).offerAmount / expected - 1));
    const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    assert.ok(mean < 0.03, `mean gap ${(mean * 100).toFixed(1)}%`);
  });

  it('pays an iPhone 14 Plus about 29,000 and ₹17,000 with a cracked screen (Cashify 28,910 and 17,010)', () => {
    near(offerAt('iPhone 14 Plus', 30890).offerAmount, 28910, 500, 'flawless');
    near(offerAt('iPhone 14 Plus', 30890, '128 GB', { screen_condition: 'cracked' }).offerAmount, 17010, 500, 'cracked');
    near(offerAt('iPhone 14 Plus', 30890, '128 GB', { screen_condition: 'lines_visible' }).offerAmount, 11910, 500, 'lines');
    near(offerAt('iPhone 14 Plus', 30890, '128 GB', { screen_condition: 'touch_fault' }).offerAmount, 10930, 1000, 'touch');
  });
});

describe('what does not move', () => {
  it('prices a newer iPhone as before: an iPhone 15 on 43,600 is 34,100 without accessories', () => {
    near(offerAt('iPhone 15', 43600).offerAmount, 34100, 100, 'iPhone 15');
    near(offerAt('iPhone 16 Pro Max', 88300, '512 GB').offerAmount, 69850, 100, 'iPhone 16 Pro Max');
  });

  it('prices an old Android phone as before: a Galaxy S23 on 23,970 is 18,400 without accessories', () => {
    const offer = quotePhone(
      { brand: 'Samsung', model: 'Galaxy S23', storage: '128 GB', powers_on: true, activation_lock_cleared: true, ownership_verified: true, liquid_damage: false, cosmetic_condition: 'flawless', screen_condition: 'flawless', body_condition: 'flawless', battery_health: 'healthy', defects: [], accessories: [], age_period: OLD },
      { catalogPrice: 23970, catalogStorage: '128 GB' },
    ).offerAmount;
    near(offer, 18400, 100, 'Galaxy S23');
  });

  it('never offers an old iPhone more than the admin price', () => {
    for (const [model, price] of [['iPhone 13', 25260], ['iPhone 14 Plus', 30890], ['iPhone 11', 14910], ['iPhone X', 11020]]) {
      assert.ok(offerAt(model, price, '128 GB', { age_period: '0_to_3_months', accessories: ['Original Box', 'Original Charger', 'Valid Bill'] }).offerAmount <= price, model);
    }
  });
});
