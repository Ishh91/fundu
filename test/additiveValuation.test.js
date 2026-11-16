import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { additiveValuation, HIGH_PRICE_FROM, LOW_PRICE_LIMIT } from '../shared/additiveValuation.js';

// Prices below were read from Cashify's calculator (16 Nov 2026) for the same answers.
const A53 = { brand: 'Samsung', model: 'Galaxy A53 5G', base: 8160 };
const S22 = { brand: 'Samsung', model: 'Galaxy S22 5G', base: 15990 };
const price = (phone, conditions) => additiveValuation({ ...phone, conditions }).price;

describe('additiveValuation on measured models', () => {
  it('returns the base price when nothing is wrong', () => {
    assert.equal(price(A53, {}), 8160);
  });

  it('matches Cashify for single issues on the Galaxy A53 5G', () => {
    assert.equal(price(A53, { screen: 'scratch_1_2' }), 7630);
    assert.equal(price(A53, { screen: 'scratch_3_plus' }), 6930);
    assert.equal(price(A53, { screen: 'chipped' }), 6400);
    assert.equal(price(A53, { screen: 'cracked' }), 5660);
    assert.equal(price(A53, { bodyScratches: 'scratch_3_plus' }), 7870);
    assert.equal(price(A53, { dents: 'minor' }), 7870);
    assert.equal(price(A53, { dents: 'major' }), 7770);
    assert.equal(price(A53, { touchWorks: false }), 3960);
    assert.equal(price(A53, { screenOriginal: false }), 6270);
    assert.equal(price(A53, { faults: ['battery'] }), 7160);
    assert.equal(price(A53, { faults: ['charging_port'] }), 7160);
    assert.equal(price(A53, { faults: ['speaker'] }), 7760);
    assert.equal(price(A53, { faults: ['camera'] }), 5660);
    assert.equal(price(A53, { faults: ['wifi'] }), 4910);
    assert.equal(price(A53, { hasBox: true }), 8260);
  });

  it('adds deductions together, as Cashify does', () => {
    assert.equal(price(A53, { faults: ['camera', 'speaker'] }), 5260);
    assert.equal(price(A53, { screen: 'cracked', faults: ['camera'] }), 3160);
    assert.equal(price(S22, { faults: ['camera', 'speaker'] }), 11590);
  });

  it('matches Cashify for the Galaxy S22 5G', () => {
    assert.equal(price(S22, { screen: 'scratch_1_2' }), 14730);
    assert.equal(price(S22, { screen: 'cracked' }), 10040);
    assert.equal(price(S22, { faults: ['camera'] }), 11990);
    assert.equal(price(S22, { faults: ['battery'] }), 13990);
    assert.equal(price(S22, { faults: ['wifi'] }), 9450);
  });

  it('is marked as measured when every applied item was measured', () => {
    const result = additiveValuation({ ...A53, conditions: { screen: 'cracked', faults: ['camera'] } });
    assert.equal(result.basis, 'measured');
    assert.deepEqual(result.deductions.map((d) => [d.item, d.amount]), [['screen_cracked', 2500], ['camera', 2500]]);
  });

  it('ignores model-name spelling and case', () => {
    assert.equal(price({ brand: 'samsung', model: 'Samsung  GALAXY a53 5g', base: 8160 }, { screen: 'cracked' }), 5660);
  });
});

describe('additiveValuation on other models', () => {
  const S20FE = { brand: 'Samsung', model: 'Galaxy S20 FE', base: 7350 };
  const A52 = { brand: 'Samsung', model: 'Galaxy A52', base: 5160 };

  it('estimates from the base price and says so', () => {
    const result = additiveValuation({ ...S20FE, conditions: { screen: 'scratch_1_2' } });
    assert.equal(result.basis, 'estimated');
    assert.ok(Math.abs(result.price - 6840) / 6840 < 0.03, `got ${result.price}`);
  });

  it('stays close to Cashify for typical mid-range cases', () => {
    const cases = [
      [S20FE, { faults: ['camera', 'speaker'] }, 4950],
      [A52, { faults: ['camera', 'speaker'] }, 3460],
      [A52, { screen: 'scratch_1_2' }, 4680],
    ];
    for (const [phone, conditions, cashify] of cases) {
      const got = price(phone, conditions);
      assert.ok(Math.abs(got - cashify) / cashify < 0.06, `${phone.model}: ${got} vs ${cashify}`);
    }
  });

  it('warns that low-priced phones are unreliable', () => {
    const cheap = additiveValuation({ brand: 'Samsung', model: 'Galaxy A32', base: 4760, conditions: { faults: ['wifi', 'battery'] } });
    assert.ok(4760 < LOW_PRICE_LIMIT);
    assert.ok(cheap.warnings.some((w) => /low-priced/i.test(w)));
    assert.equal(additiveValuation({ ...A53, conditions: {} }).warnings.length, 0);
  });
});

describe('additiveValuation limits', () => {
  it('leaves a small value when calls do not work', () => {
    const result = price(A53, { callsWork: false });
    assert.ok(result > 0 && result < 1500, `got ${result}`);
  });

  it('never goes below zero', () => {
    const wrecked = { screen: 'cracked', touchWorks: false, faults: ['camera', 'wifi', 'battery', 'charging_port', 'speaker'] };
    assert.equal(price({ brand: 'Samsung', model: 'Galaxy A52', base: 5160 }, wrecked), 0);
  });

  it('counts a repeated fault once and does not change its input', () => {
    const conditions = Object.freeze({ faults: Object.freeze(['camera', 'camera']) });
    assert.equal(price(A53, conditions), 5660);
  });

  it('refuses a missing or invalid base price', () => {
    assert.throws(() => additiveValuation({ brand: 'Samsung', model: 'X', base: 0, conditions: {} }), /base/i);
    assert.throws(() => additiveValuation({ brand: 'Samsung', model: 'X', base: Number.NaN, conditions: {} }), /base/i);
  });
});

describe('additiveValuation for phones from the high price band', () => {
  // Cashify prices (16 Nov 2026): flawless, 1-2 screen scratches, cracked screen, back camera + speaker faulty.
  const phones = [
    ['Apple', 'iPhone 15 Pro Max', 55500, 52600, 41820, 48500],
    ['Apple', 'iPhone 17 Pro', 74220, 70440, 56370, 65520],
    ['Samsung', 'Galaxy S24 Ultra', 48280, 45950, 37270, 43880],
    ['Apple', 'iPhone 16 Pro', 57530, 54010, 40870, 48830],
  ];
  const within = (got, want, limit) => Math.abs(got - want) / want <= limit;

  it('starts at the band limit', () => {
    assert.equal(HIGH_PRICE_FROM, 45000);
  });

  it('stays within 6% of Cashify on scratches, a cracked screen and camera plus speaker faults', () => {
    for (const [brand, model, base, scratch, cracked, faults] of phones) {
      const run = (conditions) => additiveValuation({ brand, model, base, conditions }).price;
      assert.ok(within(run({ screen: 'scratch_1_2' }), scratch, 0.06), `${model} scratch ${run({ screen: 'scratch_1_2' })} vs ${scratch}`);
      assert.ok(within(run({ screen: 'cracked' }), cracked, 0.06), `${model} cracked ${run({ screen: 'cracked' })} vs ${cracked}`);
      assert.ok(within(run({ faults: ['camera', 'speaker'] }), faults, 0.06), `${model} faults ${run({ faults: ['camera', 'speaker'] })} vs ${faults}`);
    }
  });

  it('takes less off a cracked screen than the mid-range rate does', () => {
    const cracked = (base) => base - additiveValuation({ brand: 'X', model: 'Y', base, conditions: { screen: 'cracked' } }).price;
    assert.ok(cracked(HIGH_PRICE_FROM) / HIGH_PRICE_FROM < cracked(HIGH_PRICE_FROM - 1) / (HIGH_PRICE_FROM - 1));
  });

  it('keeps the mid-range rates just under the limit (iPhone 16 at 41,280 behaves mid-range)', () => {
    const got = additiveValuation({ brand: 'Apple', model: 'iPhone 16', base: 41280, conditions: { screen: 'cracked' } }).price;
    assert.ok(within(got, 25810, 0.06), `got ${got}`);
  });

  it('warns when an item in the high band was not measured', () => {
    const measuredOnly = additiveValuation({ brand: 'Apple', model: 'iPhone 17 Pro', base: 74220, conditions: { screen: 'cracked', faults: ['camera'] } });
    assert.equal(measuredOnly.warnings.length, 0);
    const other = additiveValuation({ brand: 'Apple', model: 'iPhone 17 Pro', base: 74220, conditions: { faults: ['wifi'] } });
    assert.ok(other.warnings.some((w) => /high-priced/i.test(w)));
  });
});
