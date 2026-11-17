import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { quotePhone, calculatePhoneAgingFactor, RECENT_IPHONE_AGE_FACTOR } from '../fundu_phone_quote.mjs';

const OLD = 'above_11_months';
const near = (actual, expected, tolerance, label) => assert.ok(Math.abs(actual - expected) <= tolerance, `${label}: expected about ${expected}, got ${actual}`);

/** A flawless iPhone older than 11 months with no accessories (the way Cashify was asked), on the admin price `price`. */
const offerAt = (model, price, storage = '256 GB', extra = {}) =>
  quotePhone(
    {
      brand: 'Apple', model, storage, powers_on: true, activation_lock_cleared: true, ownership_verified: true, liquid_damage: false,
      cosmetic_condition: 'flawless', screen_condition: 'flawless', body_condition: 'flawless', battery_health: 'healthy',
      defects: [], accessories: [], age_period: OLD, ...extra,
    },
    { catalogPrice: price, catalogStorage: storage },
  ).offerAmount;

describe('the age factor of the newest iPhones, measured against Cashify (phone older than 11 months)', () => {
  it('is 0.735 for the iPhone 17, 17 Pro and 17 Pro Max, and 0.75 for the 16e', () => {
    assert.equal(RECENT_IPHONE_AGE_FACTOR.iphone17, 0.735);
    for (const model of ['iPhone 17', 'iPhone 17 Pro', 'iPhone 17 Pro Max', 'iPhone 17 pro max', 'Apple iPhone 17 Pro']) {
      assert.equal(calculatePhoneAgingFactor('Apple', model, false, OLD), 0.735, model);
    }
    assert.equal(calculatePhoneAgingFactor('Apple', 'iPhone 16e', false, OLD), 0.75);
  });

  it('is applied whichever way the age is sent, as long as the phone is older than 11 months', () => {
    for (const age of ['above_11_months', 'out_of_warranty', 'older_than_9_months', '']) {
      assert.equal(calculatePhoneAgingFactor('Apple', 'iPhone 17', false, age), 0.735, age);
    }
  });

  it('does not touch a phone younger than 11 months', () => {
    assert.equal(calculatePhoneAgingFactor('Apple', 'iPhone 17', false, '0_to_3_months'), 1.0);
    assert.equal(calculatePhoneAgingFactor('Apple', 'iPhone 17', false, '3_to_6_months'), 0.9345);
    assert.equal(calculatePhoneAgingFactor('Apple', 'iPhone 17', false, '6_to_9_months'), 0.9078);
    assert.equal(calculatePhoneAgingFactor('Apple', 'iPhone 17 Pro Max', true, ''), 1.0);
  });

  it('does not touch the iPhones that were already right: 15 and 16 family stay at 0.80, the old ones at 0.955', () => {
    for (const model of ['iPhone 15', 'iPhone 15 Plus', 'iPhone 15 Pro', 'iPhone 15 Pro Max', 'iPhone 16', 'iPhone 16 Plus', 'iPhone 16 Pro', 'iPhone 16 Pro Max']) {
      assert.equal(calculatePhoneAgingFactor('Apple', model, false, OLD), 0.80, model);
    }
    assert.equal(calculatePhoneAgingFactor('Apple', 'iPhone 14 Plus', false, OLD), 0.955);
  });

  it('does not touch a model that was not measured (17e, Air, 18) or another brand', () => {
    for (const model of ['iPhone 17e', 'iPhone Air', 'iPhone 17 Air', 'iPhone 18 Pro', 'iPhone 18 Pro Max']) {
      assert.equal(calculatePhoneAgingFactor('Apple', model, false, OLD), 0.80, model);
    }
    assert.equal(calculatePhoneAgingFactor('Samsung', 'Galaxy S26 Ultra', false, OLD), 0.80);
    assert.equal(calculatePhoneAgingFactor('OnePlus', '17', false, OLD), 0.80);
  });
});

describe('the flawless offer of the newest iPhones, against what Cashify offered (no accessories)', () => {
  // [model, storage, admin price, Cashify's offer]
  const cashify = [
    ['iPhone 17', '256 GB', 67500, 48840],
    ['iPhone 17 Pro', '256 GB', 102500, 74220],
    ['iPhone 17 Pro Max', '256 GB', 108000, 79520],
    ['iPhone 16e', '128 GB', 39320, 28720],
  ];
  for (const [model, storage, price, expected] of cashify) {
    it(`is within 2% of Cashify's ${expected.toLocaleString('en-IN')} for the ${model}`, () => {
      const offer = offerAt(model, price, storage);
      assert.ok(Math.abs(offer / expected - 1) < 0.02, `${model}: Fundu ${offer} vs Cashify ${expected} (${((offer / expected - 1) * 100).toFixed(1)}%)`);
    });
  }

  it('takes the same flat screen amount off, so a cracked iPhone 17 is still 17,850 below flawless', () => {
    near(offerAt('iPhone 17', 67500) - offerAt('iPhone 17', 67500, '256 GB', { screen_condition: 'cracked' }), 17850, 100, 'iPhone 17');
    near(offerAt('iPhone 17 Pro Max', 108000) - offerAt('iPhone 17 Pro Max', 108000, '256 GB', { screen_condition: 'cracked' }), 17850, 100, 'iPhone 17 Pro Max');
  });

  it('pays a cracked iPhone 17 about what Cashify pays (30,990)', () => {
    near(offerAt('iPhone 17', 67500, '256 GB', { screen_condition: 'cracked' }), 30990, 700, 'cracked iPhone 17');
  });

  it('keeps the iPhone 15 and 16 where they were', () => {
    near(offerAt('iPhone 15', 43600, '128 GB'), 34100, 100, 'iPhone 15');
    near(offerAt('iPhone 16 Pro Max', 88300, '512 GB'), 69850, 100, 'iPhone 16 Pro Max');
  });

  it('never offers more than the admin price', () => {
    for (const [model, , price] of cashify) {
      assert.ok(offerAt(model, price, '256 GB', { age_period: '0_to_3_months' }) <= price, model);
    }
  });
});
