import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  quotePhone,
  screenStateShare,
  LOW_PRICE_BELOW,
  HIGH_PRICE_SCREEN_FROM,
  SCREEN_STATE_SHARE_LOW,
  SCREEN_STATE_SHARE_MID,
  SCREEN_STATE_SHARE_HIGH,
} from '../fundu_phone_quote.mjs';

const FULL = ['Original Box', 'Original Charger', 'Valid Bill'];
const IPHONE_14 = { brand: 'Apple', model: 'iPhone 14', storage: '128 GB' };
const ONEPLUS_12 = { brand: 'OnePlus', model: '12', storage: '256 GB' };

/** A flawless phone older than 11 months with every accessory, on the admin price `price`, the way the server prices it. */
const offerAt = (phone, price, extra = {}) =>
  quotePhone(
    {
      ...phone, powers_on: true, activation_lock_cleared: true, ownership_verified: true, liquid_damage: false,
      cosmetic_condition: 'flawless', screen_condition: 'flawless', body_condition: 'flawless', battery_health: 'healthy',
      defects: [], accessories: FULL, age_period: 'above_11_months', ...extra,
    },
    { catalogPrice: price, catalogStorage: phone.storage },
  ).offerAmount;
const share = (phone, price, extra) => (offerAt(phone, price) - offerAt(phone, price, extra)) / offerAt(phone, price);
const within = (v, lo, hi) => v >= lo && v <= hi;

describe('where the middle tier sits', () => {
  it('runs from 20,000 up to 60,000', () => {
    assert.equal(LOW_PRICE_BELOW, 20000);
    assert.equal(HIGH_PRICE_SCREEN_FROM, 60000);
  });

  it('has a graded share for every state, as the cheap and the premium tiers do', () => {
    assert.deepEqual(Object.keys(SCREEN_STATE_SHARE_MID).sort(), Object.keys(SCREEN_STATE_SHARE_LOW).sort());
    assert.deepEqual(Object.keys(SCREEN_STATE_SHARE_MID).sort(), Object.keys(SCREEN_STATE_SHARE_HIGH).sort());
  });

  it('prices every known state from the middle table at 20,000 and right up to 59,999', () => {
    for (const state of Object.keys(SCREEN_STATE_SHARE_MID)) {
      assert.equal(screenStateShare(state, 20000), SCREEN_STATE_SHARE_MID[state], state);
      assert.equal(screenStateShare(state, 45000), SCREEN_STATE_SHARE_MID[state], state);
      assert.equal(screenStateShare(state, 59999), SCREEN_STATE_SHARE_MID[state], state);
      assert.equal(screenStateShare(state, 60000), SCREEN_STATE_SHARE_HIGH[state], state);
    }
  });

  it('is still undefined for the old two-level values a client may send, like "scratched"', () => {
    assert.equal(screenStateShare('scratched', 30000), undefined);
  });
});

describe('a phone near the top of the middle tier (measured on an iPhone 15 Plus, 16, 15 Pro and 16 Pro)', () => {
  const IPHONE_16 = { brand: 'Apple', model: 'iPhone 16', storage: '128 GB' };

  it('still takes about a third off for a crack, as Cashify takes 15,470 off the iPhone 16 (37.5% of its offer)', () => {
    assert.ok(within(share(IPHONE_16, 55000, { screen_condition: 'cracked' }), 0.34, 0.38));
    assert.ok(within(share(IPHONE_16, 46360, { screen_condition: 'cracked' }), 0.34, 0.38));
  });

  it('takes about 63% off for a touch that does not work and 53% for lines, as Cashify does on the iPhone 16', () => {
    assert.ok(within(share(IPHONE_16, 55000, { screen_condition: 'touch_fault' }), 0.58, 0.64));
    assert.ok(within(share(IPHONE_16, 55000, { screen_condition: 'lines_visible' }), 0.5, 0.56));
  });

  it('steps down to the premium share at 60,000, where Cashify steps down too (iPhone 16 29% to iPhone 15 Pro 22% of the market price)', () => {
    const under = share(IPHONE_16, 59999, { screen_condition: 'cracked' });
    const over = share(IPHONE_16, 60000, { screen_condition: 'cracked' });
    assert.ok(under > over + 0.09, `${(under * 100).toFixed(1)}% then ${(over * 100).toFixed(1)}%`);
  });
});

describe('screen states on a middle phone (measured against Cashify on iPhone 13, 14, 14 Pro, 15, OnePlus 12 and Galaxy S23)', () => {
  // The share Cashify takes off an iPhone 14 128 GB (flawless 27,290) for each state.
  const cashifyIphone14 = {
    scratches_minor: 0.083, scratches_major: 0.194, spots_few: 0.132, tint_minor: 0.132, faded_edges: 0.33, spots_many: 0.396,
    chipped: 0.277, cracked: 0.392, tint_major: 0.363, spots_heavy: 0.561, lines_visible: 0.561, touch_fault: 0.62,
  };

  for (const [state, wanted] of Object.entries(SCREEN_STATE_SHARE_MID).filter(([s]) => s !== 'display_lines')) {
    it(`takes about ${(wanted * 100).toFixed(1)}% off for ${state}`, () => {
      const lost = share(IPHONE_14, 30000, { screen_condition: state });
      assert.ok(Math.abs(lost - wanted) < 0.012, `${state} took ${(lost * 100).toFixed(1)}%`);
    });
  }

  it('is within 6 points of what Cashify takes off an iPhone 14, for every state', () => {
    for (const [state, cashify] of Object.entries(cashifyIphone14)) {
      const lost = share(IPHONE_14, 30000, { screen_condition: state });
      assert.ok(Math.abs(lost - cashify) < 0.06, `${state}: Fundu ${(lost * 100).toFixed(1)}% vs Cashify ${(cashify * 100).toFixed(1)}%`);
    }
  });

  it('keeps a crack at the 36% it always took', () => {
    assert.ok(within(share(IPHONE_14, 30000, { screen_condition: 'cracked' }), 0.34, 0.38));
    assert.ok(within(share(ONEPLUS_12, 34480, { screen_condition: 'cracked' }), 0.34, 0.38));
  });

  it('takes far more off for a touch that does not work than for a crack', () => {
    const touch = share(ONEPLUS_12, 34480, { screen_condition: 'touch_fault' });
    const crack = share(ONEPLUS_12, 34480, { screen_condition: 'cracked' });
    assert.ok(touch > crack + 0.18, `touch ${(touch * 100).toFixed(1)}% vs crack ${(crack * 100).toFixed(1)}%`);
  });

  it('takes a lot off for lines and heavy spots, as Cashify does (about 52-56%)', () => {
    for (const state of ['lines_visible', 'spots_heavy']) {
      assert.ok(within(share(ONEPLUS_12, 34480, { screen_condition: state }), 0.48, 0.56), state);
    }
  });

  it('takes less off for chipped glass than for a crack', () => {
    assert.ok(share(IPHONE_14, 30000, { screen_condition: 'chipped' }) < share(IPHONE_14, 30000, { screen_condition: 'cracked' }) - 0.07);
  });

  it('takes under 10% for one or two light scratches, in place of the flat 15% "good look" markdown', () => {
    const light = share(IPHONE_14, 30000, { screen_condition: 'scratches_minor', cosmetic_condition: 'good' });
    assert.ok(light < 0.10, `light scratches took ${(light * 100).toFixed(1)}%`);
  });

  it('is in the order Cashify prices them', () => {
    const order = ['scratches_minor', 'scratches_major', 'chipped', 'faded_edges', 'cracked', 'spots_heavy', 'touch_fault'];
    for (let i = 1; i < order.length; i++) {
      assert.ok(share(IPHONE_14, 30000, { screen_condition: order[i] }) > share(IPHONE_14, 30000, { screen_condition: order[i - 1] }), `${order[i - 1]} < ${order[i]}`);
    }
  });

  it('keeps a body dent for a worn screen, but not on top of a screen that needs a repair', () => {
    assert.ok(offerAt(IPHONE_14, 30000, { screen_condition: 'spots_many', body_condition: 'dents_bent' }) < offerAt(IPHONE_14, 30000, { screen_condition: 'spots_many' }));
    for (const state of ['cracked', 'chipped', 'touch_fault', 'spots_heavy', 'lines_visible', 'tint_major']) {
      assert.equal(offerAt(IPHONE_14, 30000, { screen_condition: state, body_condition: 'dents_bent' }), offerAt(IPHONE_14, 30000, { screen_condition: state }), state);
    }
  });

  it('tells the customer what is wrong with the screen', () => {
    const text = (state) => quotePhone(
      { ...IPHONE_14, powers_on: true, activation_lock_cleared: true, ownership_verified: true, liquid_damage: false, cosmetic_condition: 'flawless', screen_condition: state, body_condition: 'flawless', battery_health: 'healthy', defects: [], accessories: FULL, age_period: 'above_11_months' },
      { catalogPrice: 30000, catalogStorage: '128 GB' },
    ).conditionSummary.join(' | ');
    assert.match(text('touch_fault'), /touch not working/);
    assert.match(text('faded_edges'), /faded along the edges/);
  });

  it('takes the screen-not-original share as 85% of a crack', () => {
    const lost = share(IPHONE_14, 30000, { defects: ['screen_not_original'] });
    assert.ok(within(lost, 0.28, 0.33), `${(lost * 100).toFixed(1)}%`);
  });
});

describe('a client that still sends the old two-level values', () => {
  it('prices "display_lines" as a heavy screen problem and "scratched" as the 15% look', () => {
    assert.ok(within(share(IPHONE_14, 30000, { screen_condition: 'display_lines' }), 0.36, 0.46));
    assert.ok(within(share(IPHONE_14, 30000, { screen_condition: 'scratched', cosmetic_condition: 'good' }), 0.13, 0.17));
  });
});

describe('the other tiers are not moved by the middle tier', () => {
  it('prices a cheap phone and a premium phone exactly as before', () => {
    assert.equal(screenStateShare('cracked', 19999), SCREEN_STATE_SHARE_LOW.cracked);
    assert.equal(screenStateShare('touch_fault', 6240), SCREEN_STATE_SHARE_LOW.touch_fault);
    assert.equal(screenStateShare('cracked', 82920), SCREEN_STATE_SHARE_HIGH.cracked);
  });
});
