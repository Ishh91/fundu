import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  quotePhone,
  screenStateShare,
  legacyScreenCondition,
  LOW_PRICE_BELOW,
  HIGH_PRICE_SCREEN_FROM,
  SCREEN_STATE_SHARE_HIGH,
  SCREEN_STATE_SHARE_LOW,
  SCREEN_STATE_SHARE_MID,
} from '../fundu_phone_quote.mjs';

const FULL = ['Original Box', 'Original Charger', 'Valid Bill'];
const S26_ULTRA = { brand: 'Samsung', model: 'Galaxy S26 Ultra', storage: '256 GB' };
const IPHONE = { brand: 'Apple', model: 'iPhone 17 Pro Max', storage: '256 GB' };
const A14 = { brand: 'Samsung', model: 'Galaxy A14 5G', storage: '128 GB' };

/** A flawless phone older than 11 months with every accessory, on the admin price `price`, the way the server prices it. */
const offerAt = (phone, price, extra = {}) =>
  quotePhone(
    {
      ...phone, powers_on: true, activation_lock_cleared: true, ownership_verified: true, liquid_damage: false,
      cosmetic_condition: 'flawless', screen_condition: 'flawless', body_condition: 'flawless', battery_health: 'healthy',
      defects: [], accessories: FULL, age_period: 'above_11_months', ...extra,
    },
    { catalogPrice: price, catalogStorage: phone.storage },
  );
const share = (phone, price, extra) => {
  const flawless = offerAt(phone, price).offerAmount;
  return (flawless - offerAt(phone, price, extra).offerAmount) / flawless;
};
const within = (v, lo, hi) => v >= lo && v <= hi;

const PREMIUM = 82920; // a Galaxy S26 Ultra 256 GB
const MID = 30000;

describe('the three price tiers', () => {
  it('are under 20,000, 20,000 up to 60,000, and 60,000 and over', () => {
    assert.equal(LOW_PRICE_BELOW, 20000);
    assert.equal(HIGH_PRICE_SCREEN_FROM, 60000);
    assert.ok(screenStateShare('cracked', 19999) === SCREEN_STATE_SHARE_LOW.cracked);
    assert.ok(screenStateShare('cracked', 20000) === SCREEN_STATE_SHARE_MID.cracked);
    assert.ok(screenStateShare('cracked', 59999) === SCREEN_STATE_SHARE_MID.cracked);
    assert.ok(screenStateShare('cracked', 60000) === SCREEN_STATE_SHARE_HIGH.cracked);
  });
});

describe('screen states on a premium phone (measured against Cashify on S26 Ultra, S25 Ultra and iPhone 17 Pro Max)', () => {
  const cashifyS26Ultra = {
    scratches_minor: 0.044, scratches_major: 0.102, spots_few: 0.07, tint_minor: 0.07, faded_edges: 0.174, spots_many: 0.209,
    chipped: 0.146, cracked: 0.207, tint_major: 0.191, spots_heavy: 0.296, lines_visible: 0.296, touch_fault: 0.348,
  };

  for (const [state, wanted] of Object.entries(SCREEN_STATE_SHARE_HIGH).filter(([s]) => s !== 'display_lines')) {
    it(`takes about ${(wanted * 100).toFixed(1)}% off for ${state}`, () => {
      const lost = share(S26_ULTRA, PREMIUM, { screen_condition: state });
      assert.ok(Math.abs(lost - wanted) < 0.012, `${state} took ${(lost * 100).toFixed(1)}%`);
    });
  }

  it('is within 4 points of what Cashify takes off the Galaxy S26 Ultra, for every state', () => {
    for (const [state, cashify] of Object.entries(cashifyS26Ultra)) {
      const lost = share(S26_ULTRA, PREMIUM, { screen_condition: state });
      assert.ok(Math.abs(lost - cashify) < 0.04, `${state}: Fundu ${(lost * 100).toFixed(1)}% vs Cashify ${(cashify * 100).toFixed(1)}%`);
    }
  });

  it('takes about two thirds of what it takes off a cheap phone', () => {
    for (const state of ['cracked', 'touch_fault', 'spots_heavy', 'scratches_major']) {
      const ratio = SCREEN_STATE_SHARE_HIGH[state] / SCREEN_STATE_SHARE_LOW[state];
      assert.ok(within(ratio, 0.6, 0.78), `${state}: ${ratio.toFixed(2)}`);
    }
  });

  it('is in the order Cashify prices them', () => {
    const order = ['scratches_minor', 'scratches_major', 'chipped', 'faded_edges', 'cracked', 'spots_heavy', 'touch_fault'];
    for (let i = 1; i < order.length; i++) {
      assert.ok(share(S26_ULTRA, PREMIUM, { screen_condition: order[i] }) > share(S26_ULTRA, PREMIUM, { screen_condition: order[i - 1] }), `${order[i - 1]} < ${order[i]}`);
    }
  });

  it('takes the graded share instead of the flat "good look" markdown of 15%', () => {
    const light = share(S26_ULTRA, PREMIUM, { screen_condition: 'scratches_minor', cosmetic_condition: 'good' });
    assert.ok(light < 0.07, `light scratches took ${(light * 100).toFixed(1)}%`);
  });

  it('is the same for an iPhone as for an Android phone', () => {
    for (const state of ['cracked', 'touch_fault', 'scratches_major']) {
      const apple = share(IPHONE, 109500, { screen_condition: state });
      const android = share(S26_ULTRA, 109500, { screen_condition: state });
      assert.ok(Math.abs(apple - android) < 0.01, state);
    }
  });

  it('keeps a body dent for a worn screen, but not on top of a screen that needs a repair', () => {
    assert.ok(offerAt(S26_ULTRA, PREMIUM, { screen_condition: 'spots_many', body_condition: 'dents_bent' }).offerAmount < offerAt(S26_ULTRA, PREMIUM, { screen_condition: 'spots_many' }).offerAmount);
    for (const state of ['cracked', 'chipped', 'touch_fault', 'spots_heavy', 'lines_visible', 'tint_major']) {
      assert.equal(offerAt(S26_ULTRA, PREMIUM, { screen_condition: state, body_condition: 'dents_bent' }).offerAmount, offerAt(S26_ULTRA, PREMIUM, { screen_condition: state }).offerAmount, state);
    }
  });

  it('tells the customer what is wrong with the screen', () => {
    const text = (state) => offerAt(S26_ULTRA, PREMIUM, { screen_condition: state }).conditionSummary.join(' | ');
    assert.match(text('touch_fault'), /touch not working/);
    assert.match(text('lines_visible'), /visible lines/);
  });

  it('takes the screen-not-original share as 85% of a crack on a premium phone', () => {
    const lost = share(S26_ULTRA, PREMIUM, { defects: ['screen_not_original'] });
    assert.ok(within(lost, 0.17, 0.21), `${(lost * 100).toFixed(1)}%`);
  });
});

describe('a phone just under the premium line', () => {
  it('is priced on the middle table up to 59,999 and on the premium table from 60,000', () => {
    assert.ok(within(share(S26_ULTRA, 59999, { screen_condition: 'cracked' }), 0.34, 0.38));
    assert.ok(within(share(S26_ULTRA, 60000, { screen_condition: 'cracked' }), 0.21, 0.25));
  });

  it('is priced on the middle table well under it', () => {
    assert.ok(within(share(S26_ULTRA, MID, { screen_condition: 'cracked' }), 0.34, 0.38));
    assert.ok(within(share(S26_ULTRA, MID, { screen_condition: 'scratched', cosmetic_condition: 'good' }), 0.13, 0.17));
  });

  it('prices chipped glass as a smaller problem than a crack, as Cashify does', () => {
    assert.ok(offerAt(S26_ULTRA, MID, { screen_condition: 'chipped' }).offerAmount > offerAt(S26_ULTRA, MID, { screen_condition: 'cracked' }).offerAmount);
    assert.equal(legacyScreenCondition('chipped'), 'cracked');
  });
});

describe('body damage on a premium phone', () => {
  const bodyShare = (phone, price, body_condition) => share(phone, price, { body_condition });

  it('takes 3%, 3.75% and 9% off an Android flagship (Galaxy S26 Ultra and S25 Ultra on Cashify)', () => {
    assert.ok(Math.abs(bodyShare(S26_ULTRA, PREMIUM, 'minor_scratches') - 0.03) < 0.006);
    assert.ok(Math.abs(bodyShare(S26_ULTRA, PREMIUM, 'dents_bent') - 0.0375) < 0.006);
    assert.ok(Math.abs(bodyShare(S26_ULTRA, PREMIUM, 'panel_broken') - 0.09) < 0.008);
  });

  it('still takes 6%, 10% and 18% off an iPhone (iPhone 17 Pro Max on Cashify)', () => {
    assert.ok(Math.abs(bodyShare(IPHONE, 109500, 'minor_scratches') - 0.06) < 0.01);
    assert.ok(Math.abs(bodyShare(IPHONE, 109500, 'dents_bent') - 0.10) < 0.01);
    assert.ok(Math.abs(bodyShare(IPHONE, 109500, 'panel_broken') - 0.18) < 0.01);
  });

  it('takes less off an Android flagship than off an iPhone of the same price', () => {
    for (const body of ['minor_scratches', 'dents_bent', 'panel_broken']) {
      assert.ok(bodyShare(S26_ULTRA, 109500, body) < bodyShare(IPHONE, 109500, body), body);
    }
  });

  it('is not changed for an Android phone that is not premium', () => {
    assert.ok(Math.abs(bodyShare(S26_ULTRA, MID, 'dents_bent') - 0.045) < 0.008);
  });
});

describe('the face or fingerprint sensor', () => {
  const sensor = (phone, price) => share(phone, price, { defects: ['biometrics'] });

  it('takes 27% off an Android flagship, as Cashify does on the S25 Ultra and S26 Ultra', () => {
    assert.ok(within(sensor(S26_ULTRA, PREMIUM), 0.25, 0.29), String(sensor(S26_ULTRA, PREMIUM)));
  });

  it('takes 27% off an iPhone at any price', () => {
    assert.ok(within(sensor(IPHONE, 109500), 0.25, 0.29));
    assert.ok(within(sensor({ brand: 'Apple', model: 'iPhone 13', storage: '128 GB' }, 25260), 0.25, 0.29));
  });

  it('does not take the big share off a cheaper Android phone, which has no such sensor to repair', () => {
    assert.ok(sensor(A14, 7450) < 0.15);
    assert.ok(sensor(S26_ULTRA, MID) < 0.15);
  });
});

describe('small faults on an Android phone', () => {
  const cut = (phone, price, defect) => offerAt(phone, price).offerAmount - offerAt(phone, price, { defects: [defect] }).offerAmount;

  it('take the same few hundred rupees off a cheap phone and a flagship (Cashify: speaker 400 and 500, vibrator 300 and 500)', () => {
    for (const defect of ['speaker', 'audio_receiver']) {
      assert.equal(cut(A14, 7450, defect), cut(S26_ULTRA, PREMIUM, defect), defect);
      assert.ok(within(cut(S26_ULTRA, PREMIUM, defect), 400, 500), defect);
    }
    assert.equal(cut(A14, 7450, 'vibrator'), 300);
    assert.equal(cut(S26_ULTRA, PREMIUM, 'vibrator'), 300);
  });

  it('still take a share off an iPhone (speaker about 3%)', () => {
    const lost = cut(IPHONE, 109500, 'speaker') / offerAt(IPHONE, 109500).offerAmount;
    assert.ok(within(lost, 0.025, 0.035), String(lost));
  });
});

describe('a phone that cannot make or receive calls', () => {
  const salvage = (phone, price) => offerAt(phone, price, { defects: ['calls_not_working'] }).offerAmount;

  it('is bought for about 1,200: an iPhone at any price, and any phone from 20,000 up', () => {
    assert.equal(salvage(IPHONE, 109500), 1200);
    assert.equal(salvage({ brand: 'Apple', model: 'iPhone 13', storage: '128 GB' }, 25260), 1200);
    assert.equal(salvage(S26_ULTRA, PREMIUM), 1200);
    assert.equal(salvage(S26_ULTRA, MID), 1200);
  });

  it('is bought for about 800 when it is a cheaper Android phone', () => {
    assert.equal(salvage(A14, 7450), 800);
    assert.equal(salvage(S26_ULTRA, 12000), 800);
  });

  it('switches at 20,000', () => {
    assert.equal(salvage(S26_ULTRA, 19999), 800);
    assert.equal(salvage(S26_ULTRA, 20000), 1200);
  });
});
