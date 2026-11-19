import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculatePhoneAgingFactor, quotePhone } from '../fundu_phone_quote.mjs';

// The age ramp must be monotone non-increasing: a phone 6-11 months old cannot be offered less than the same phone older than
// 11 months, otherwise a seller wins by saying the phone is older. This matters for the handful of phones Cashify treats as
// "old but still fresh" and pays close to market for past 11 months: pre-2023 iPhones (0.955) and Android models in the
// oldAndroid list (0.955 for OnePlus 10T, Galaxy S21, S23 FE, A52, Nord 2, etc.).

const offer = (brand, model, age) => quotePhone(
  {
    brand, model, storage: '128 GB', powers_on: true, activation_lock_cleared: true, ownership_verified: true, liquid_damage: false,
    cosmetic_condition: 'flawless', screen_condition: 'flawless', body_condition: 'flawless', battery_health: 'healthy',
    defects: [], accessories: [], age_period: age,
  },
  { catalogPrice: 24000, catalogStorage: '128 GB' },
).offerAmount;

describe('the age ramp stays monotone for phones Cashify treats as "old but still fresh"', () => {
  const cases = [
    ['OnePlus', '10T'],
    ['OnePlus', 'Nord 2'],
    ['Samsung', 'Galaxy S21'],
    ['Samsung', 'Galaxy S23 FE'],
    ['Samsung', 'Galaxy A52'],
    ['Apple', 'iPhone 13'],
    ['Apple', 'iPhone 14'],
    ['Apple', 'iPhone 11'],
  ];

  for (const [brand, model] of cases) {
    it(`${brand} ${model}: 6-11 month offer is at least the 11+ month offer`, () => {
      const younger = offer(brand, model, '6_to_11_months');
      const older = offer(brand, model, 'above_11_months');
      assert.ok(younger >= older, `${brand} ${model}: 6-11 months (${younger}) must not be less than 11+ months (${older})`);
    });

    it(`${brand} ${model}: 3-6 month offer is at least the 11+ month offer`, () => {
      const younger = offer(brand, model, '3_to_6_months');
      const older = offer(brand, model, 'above_11_months');
      assert.ok(younger >= older, `${brand} ${model}: 3-6 months (${younger}) must not be less than 11+ months (${older})`);
    });

    it(`${brand} ${model}: the full ramp 0-3 > 3-6 > 6-11 > 11+ is monotone`, () => {
      const u3 = offer(brand, model, '0_to_3_months');
      const m36 = offer(brand, model, '3_to_6_months');
      const m611 = offer(brand, model, '6_to_11_months');
      const old = offer(brand, model, 'above_11_months');
      assert.ok(u3 >= m36 && m36 >= m611 && m611 >= old, `ramp: ${u3} >= ${m36} >= ${m611} >= ${old}`);
    });
  }
});

describe('the generic ramp stays unchanged for phones without an old-but-fresh override', () => {
  it('a recent Samsung flagship still uses m6to11 (0.9078) at 6-11 months', () => {
    const factor = calculatePhoneAgingFactor('Samsung', 'Galaxy S25 Ultra', false, '6_to_11_months');
    assert.ok(Math.abs(factor - 0.9078) < 1e-6, `expected 0.9078, got ${factor}`);
  });

  it('a recent OnePlus still uses m6to11 (0.9078) at 6-11 months', () => {
    const factor = calculatePhoneAgingFactor('OnePlus', '12', false, '6_to_11_months');
    assert.ok(Math.abs(factor - 0.9078) < 1e-6, `expected 0.9078, got ${factor}`);
  });

  it('a recent iPhone (iPhone 15) still uses m6to11 (0.9078) at 6-11 months', () => {
    const factor = calculatePhoneAgingFactor('Apple', 'iPhone 15', false, '6_to_11_months');
    assert.ok(Math.abs(factor - 0.9078) < 1e-6, `expected 0.9078, got ${factor}`);
  });
});

describe('the OnePlus 10T case from the bug report', () => {
  it('6-11 month offer is at least the 11+ month (out-of-warranty) offer', () => {
    const younger = offer('OnePlus', '10T', '6_to_11_months');
    const older = offer('OnePlus', '10T', 'above_11_months');
    assert.ok(younger >= older, `6-11 months (${younger}) must not pay less than 11+ months (${older})`);
  });

  it('the 6-11 month factor uses the OnePlus 10T override (0.955), not the generic 0.9078', () => {
    const factor = calculatePhoneAgingFactor('OnePlus', '10T', false, '6_to_11_months');
    assert.ok(Math.abs(factor - 0.955) < 1e-6, `expected 0.955, got ${factor}`);
  });
});
