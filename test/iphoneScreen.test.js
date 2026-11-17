import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  quotePhone,
  appleCrackRupees,
  APPLE_SCREEN_CRACK_RUPEES,
  SCREEN_STATE_MULTIPLE,
  SCREEN_STATE_SHARE_MID,
} from '../fundu_phone_quote.mjs';

const FULL = ['Original Box', 'Original Charger', 'Valid Bill'];

/** A flawless iPhone older than 11 months on the admin price `price`, the way the server prices it. */
const offerAt = (model, price, extra = {}, storage = '128 GB') =>
  quotePhone(
    {
      brand: 'Apple', model, storage, powers_on: true, activation_lock_cleared: true, ownership_verified: true, liquid_damage: false,
      cosmetic_condition: 'flawless', screen_condition: 'flawless', body_condition: 'flawless', battery_health: 'healthy',
      defects: [], accessories: FULL, age_period: 'above_11_months', ...extra,
    },
    { catalogPrice: price, catalogStorage: storage },
  );
const cut = (model, price, extra, storage) => offerAt(model, price, {}, storage).offerAmount - offerAt(model, price, extra, storage).offerAmount;
const near = (actual, expected, tolerance, label) => assert.ok(Math.abs(actual - expected) <= tolerance, `${label}: expected about ${expected}, got ${actual}`);

// What Cashify took off a cracked screen (flawless to cracked, phone older than 11 months), measured on every iPhone it buys.
const CASHIFY_CRACK = {
  'iPhone 8 Plus': [7740, 2140], 'iPhone X': [11020, 3810], 'iPhone XR': [12100, 3570], 'iPhone XS Max': [13640, 4880],
  'iPhone SE 2022': [13900, 5000], 'iPhone 11': [14910, 3220], 'iPhone 11 Pro': [18000, 5950], 'iPhone 11 Pro Max': [19900, 7140],
  'iPhone 12': [18420, 4880], 'iPhone 12 mini': [16900, 4290], 'iPhone 12 Pro': [24250, 8030], 'iPhone 12 Pro Max': [25790, 8630],
  'iPhone 13': [25260, 7440], 'iPhone 13 mini': [22390, 6780], 'iPhone 13 Pro': [33940, 9820], 'iPhone 13 Pro Max': [36160, 11900],
  'iPhone 14': [29270, 10710], 'iPhone 14 Plus': [30890, 11900], 'iPhone 14 Pro': [44020, 11900], 'iPhone 14 Pro Max': [44860, 12790],
  'iPhone 15': [43600, 12500], 'iPhone 15 Plus': [46360, 13090], 'iPhone 15 Pro': [63400, 13680], 'iPhone 15 Pro Max': [72500, 13680],
  'iPhone 16': [55000, 15470], 'iPhone 16 Plus': [56200, 16060], 'iPhone 16e': [39320, 13680], 'iPhone 16 Pro': [74240, 16660],
  'iPhone 16 Pro Max': [88300, 16660], 'iPhone 17': [67500, 17850], 'iPhone 17 Pro': [102500, 17850], 'iPhone 17 Pro Max': [108000, 17850],
};

describe('the cracked screen on every iPhone Cashify buys (measured on 32 models)', () => {
  for (const [model, [price, cashify]] of Object.entries(CASHIFY_CRACK)) {
    it(`takes what Cashify takes for the ${model}: about ${cashify.toLocaleString('en-IN')}`, () => {
      near(cut(model, price, { screen_condition: 'cracked' }), cashify, 100, model);
    });
  }

  it('is a flat amount for the model, the same on every storage', () => {
    near(cut('iPhone 14', 29270, { screen_condition: 'cracked' }, '128 GB'), cut('iPhone 14', 30100, { screen_condition: 'cracked' }, '256 GB'), 100, 'iPhone 14');
  });

  it('knows each model by its name, however it is spelled in the catalog', () => {
    assert.equal(appleCrackRupees('iPhone 16 Pro max'), 16660);
    assert.equal(appleCrackRupees('iphone 16 pro max'), 16660);
    assert.equal(appleCrackRupees('Apple iPhone 15 Pro'), 13680);
    assert.equal(appleCrackRupees('iPhone SE 3rd Gen (2022)'), 5000);
    assert.equal(appleCrackRupees('iPhone SE 2022'), 5000);
  });

  it('has no value for a model that was not measured, which keeps its price-tier share', () => {
    for (const model of ['iPhone 8', 'iPhone SE 2020', 'iPhone XS', 'iPhone Air', 'iPhone 17e', 'iPhone 18 Pro', 'Galaxy S24']) {
      assert.equal(appleCrackRupees(model), undefined, model);
    }
    assert.ok(cut('iPhone XS', 12300, { screen_condition: 'cracked' }) > 2500);
  });

  it('is never more than Cashify measured: the most it takes is 17,850', () => {
    assert.equal(Math.max(...Object.values(APPLE_SCREEN_CRACK_RUPEES)), 17850);
  });
});

describe('the other screen states are a fixed multiple of the crack, as on Cashify', () => {
  // The multiples are identical on the iPhone 14, 17 Pro Max, S26 Ultra and S25 Ultra on Cashify.
  it('has the multiples Cashify uses', () => {
    assert.equal(SCREEN_STATE_MULTIPLE.cracked, 1);
    near(SCREEN_STATE_MULTIPLE.scratches_minor, 0.212, 0.002, 'scratches_minor');
    near(SCREEN_STATE_MULTIPLE.scratches_major, 0.494, 0.002, 'scratches_major');
    near(SCREEN_STATE_MULTIPLE.chipped, 0.706, 0.002, 'chipped');
    near(SCREEN_STATE_MULTIPLE.spots_few, 0.336, 0.002, 'spots_few');
    near(SCREEN_STATE_MULTIPLE.faded_edges, 0.84, 0.002, 'faded_edges');
    near(SCREEN_STATE_MULTIPLE.spots_many, 1.008, 0.002, 'spots_many');
    near(SCREEN_STATE_MULTIPLE.tint_major, 0.924, 0.002, 'tint_major');
    near(SCREEN_STATE_MULTIPLE.lines_visible, 1.4286, 0.002, 'lines_visible');
    near(SCREEN_STATE_MULTIPLE.touch_fault, 1.68, 0.002, 'touch_fault');
  });

  it('matches the middle table, which was built from the same multiples', () => {
    for (const state of Object.keys(SCREEN_STATE_SHARE_MID).filter((s) => s !== 'display_lines')) {
      near(SCREEN_STATE_MULTIPLE[state], SCREEN_STATE_SHARE_MID[state] / SCREEN_STATE_SHARE_MID.cracked, 0.04, state);
    }
  });

  it('takes what Cashify takes off touch not working on the three iPhones where it is under 1.68 times the crack', () => {
    near(cut('iPhone 14', 29270, { screen_condition: 'touch_fault' }, '128 GB'), 16920, 150, 'iPhone 14');
    near(cut('iPhone 14 Plus', 30890, { screen_condition: 'touch_fault' }, '128 GB'), 17980, 150, 'iPhone 14 Plus');
    near(cut('iPhone 15', 43600, { screen_condition: 'touch_fault' }, '128 GB'), 19350, 150, 'iPhone 15');
  });

  it('takes what Cashify takes off an iPhone 14 for every state', () => {
    const cashify = {
      scratches_minor: 2270, scratches_major: 5290, chipped: 7560, spots_few: 3600, spots_many: 10800, faded_edges: 9000,
      tint_major: 9900, spots_heavy: 15300, lines_visible: 15300,
    };
    for (const [state, expected] of Object.entries(cashify)) {
      near(cut('iPhone 14', 29270, { screen_condition: state, cosmetic_condition: 'good' }), expected, 150, state);
    }
  });

  it('takes what Cashify takes off an iPhone 16 Pro (touch 28,000) and an iPhone 12 (touch 8,200)', () => {
    near(cut('iPhone 16 Pro', 74240, { screen_condition: 'touch_fault' }), 28000, 150, 'iPhone 16 Pro touch');
    near(cut('iPhone 12', 18420, { screen_condition: 'touch_fault' }), 8200, 150, 'iPhone 12 touch');
  });

  it('is in the order Cashify prices them, on every measured model', () => {
    const order = ['scratches_minor', 'scratches_major', 'chipped', 'cracked', 'spots_heavy', 'touch_fault'];
    for (const [model, [price]] of Object.entries(CASHIFY_CRACK)) {
      let last = -1;
      for (const state of order) {
        const c = cut(model, price, { screen_condition: state, cosmetic_condition: 'good' });
        assert.ok(c >= last, `${model}: ${state} ${c} after ${last}`);
        last = c;
      }
    }
  });
});

describe('an iPhone with a damaged screen', () => {
  it('does not stack a body dent or a worn battery on a screen that needs a repair', () => {
    assert.equal(offerAt('iPhone 15', 43600, { screen_condition: 'cracked', body_condition: 'dents_bent' }).offerAmount, offerAt('iPhone 15', 43600, { screen_condition: 'cracked' }).offerAmount);
  });

  it('keeps a body dent for a worn screen', () => {
    assert.ok(offerAt('iPhone 15', 43600, { screen_condition: 'scratches_major', body_condition: 'dents_bent' }).offerAmount < offerAt('iPhone 15', 43600, { screen_condition: 'scratches_major' }).offerAmount);
  });

  it('takes 85% of a crack for a screen that is not original', () => {
    near(cut('iPhone 15', 43600, { defects: ['screen_not_original'] }), 12500 * 0.85, 150, 'not original');
  });

  it('never takes more than three quarters of the value, whatever the table says', () => {
    const flawless = offerAt('iPhone 17 Pro Max', 5000).offerAmount;
    const cracked = offerAt('iPhone 17 Pro Max', 5000, { screen_condition: 'touch_fault' });
    assert.ok(cracked.status !== 'quoted' || flawless - cracked.offerAmount <= flawless * 0.8);
  });

  it('does not move an Android phone', () => {
    const android = (price) => quotePhone(
      { brand: 'OnePlus', model: '12', storage: '256 GB', powers_on: true, activation_lock_cleared: true, ownership_verified: true, liquid_damage: false, cosmetic_condition: 'flawless', screen_condition: 'cracked', body_condition: 'flawless', battery_health: 'healthy', defects: [], accessories: FULL, age_period: 'above_11_months' },
      { catalogPrice: price, catalogStorage: '256 GB' },
    ).offerAmount;
    assert.ok(android(34480) > 15000 && android(34480) < 21000);
  });
});
