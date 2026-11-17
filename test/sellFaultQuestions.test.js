import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { quotePhone, lookupModelRepairs, lookupResaleBenchmark } from '../fundu_phone_quote.mjs';

// A flawless iPhone 17 Pro Max older than 11 months, with every accessory: the "nothing wrong" answers of the sell form.
const noProblems = {
  brand: 'Apple',
  model: 'iPhone 17 Pro Max',
  storage: '256 GB',
  powers_on: true,
  cosmetic_condition: 'flawless',
  screen_condition: 'flawless',
  body_condition: 'flawless',
  battery_health: 'healthy',
  defects: [],
  accessories: ['Original Box', 'Original Charger', 'Valid Bill'],
  age_period: 'above_11_months',
};

const quoteWith = (defects, extra = {}) => quotePhone({ ...noProblems, defects, ...extra });
const offerWith = (defects, extra = {}) => quoteWith(defects, extra).offerAmount;
const flawlessOffer = offerWith([]);

/** The share of the flawless offer a set of faults takes off. */
const shareLost = (defects, extra = {}) => {
  const flawless = offerWith([], extra);
  return (flawless - offerWith(defects, extra)) / flawless;
};

const GALAXY_A14 = { brand: 'Samsung', model: 'Galaxy A14 5G', storage: '128 GB' };
const IPHONE_13 = { model: 'iPhone 13', storage: '128 GB' };

describe('how much each fault takes off (measured against Cashify on three phones)', () => {
  // The share of the aged value, on an iPhone 17 Pro Max. WiFi and Bluetooth are 40% on a ₹23,500 and a ₹6,240 phone too.
  const expected = {
    wifi: 0.40,
    bluetooth: 0.40,
    biometrics: 0.27,
    screen_not_original: 0.148,
    speaker: 0.03,
    audio_receiver: 0.03,
    proximity_sensor: 0.03,
    silent_button: 0.02,
    microphone: 0.01,
    volume_button: 0.01,
    power_button: 0.01,
    vibrator: 0.01,
  };

  for (const [fault, share] of Object.entries(expected)) {
    it(`takes about ${(share * 100).toFixed(1).replace(/\.0$/, '')}% off for ${fault}`, () => {
      const lost = shareLost([fault]);
      assert.ok(Math.abs(lost - share) < 0.01, `${fault} took ${(lost * 100).toFixed(1)}%`);
    });
  }

  it('takes a bigger share for a worse fault', () => {
    assert.ok(offerWith(['wifi']) < offerWith(['biometrics']));
    assert.ok(offerWith(['biometrics']) < offerWith(['screen_not_original']));
    assert.ok(offerWith(['screen_not_original']) < offerWith(['camera_back']));
    assert.ok(offerWith(['camera_back']) < offerWith(['vibrator']));
  });

  it('scales with the phone age, so an old phone does not lose a larger share', () => {
    const fresh = shareLost(['biometrics'], { age_period: '0_to_3_months' });
    const old = shareLost(['biometrics']);
    assert.ok(Math.abs(fresh - old) < 0.02, `${(fresh * 100).toFixed(1)}% fresh vs ${(old * 100).toFixed(1)}% old`);
  });

  it('takes WiFi and Bluetooth off once, not twice', () => {
    assert.equal(offerWith(['wifi', 'bluetooth']), offerWith(['wifi']));
    assert.equal(offerWith(['bluetooth', 'wifi']), offerWith(['bluetooth']));
  });

  it('still deducts the other faults next to WiFi', () => {
    assert.ok(offerWith(['wifi', 'vibrator']) < offerWith(['wifi']));
  });

  it('understands the combined WiFi / Bluetooth fault saved by the old list as WiFi', () => {
    assert.equal(offerWith(['wifi_bluetooth']), offerWith(['wifi']));
  });

  it('still understands the other faults saved by the old list', () => {
    for (const fault of ['camera', 'charging_port', 'speaker_mic', 'buttons', 'sensors']) {
      assert.ok(offerWith([fault]) < flawlessOffer, fault);
    }
  });

  it('still takes something off for a fault it has no share for', () => {
    assert.ok(offerWith(['some_unknown_fault']) < flawlessOffer);
  });

  it('tells the customer what the deduction is for, in plain words', () => {
    const text = (fault) => quoteWith([fault]).conditionSummary.join(' | ');
    assert.match(text('wifi'), /WiFi \/ wireless repair required/);
    assert.match(text('camera_back'), /Back camera repair required/);
    assert.match(text('screen_not_original'), /non-original\) screen/);
    assert.match(text('camera_glass'), /Camera glass replacement/);
  });

  it('shows the generic wording for a fault without a special message', () => {
    assert.match(quoteWith(['some_unknown_fault']).conditionSummary.join(' | '), /Additional reported hardware fault/);
  });
});

describe('faults that cost the model\'s repair of one part', () => {
  const repairs = lookupModelRepairs('Apple', 'iPhone 17 Pro Max', lookupResaleBenchmark('Apple', 'iPhone 17 Pro Max', '256 GB').benchmark.proceeds);
  const cut = (defects) => flawlessOffer - offerWith(defects);
  const near = (actual, expected, label) => assert.ok(Math.abs(actual - expected) <= 50, `${label}: expected about ${expected}, got ${actual}`);

  it('takes the camera repair off for a back camera', () => near(cut(['camera_back']), repairs.camera, 'back camera'));

  it('takes a part of the camera repair off for a front camera and for camera glass', () => {
    near(cut(['camera_front']), Math.round(repairs.camera * 0.55), 'front camera');
    near(cut(['camera_glass']), Math.round(repairs.camera * 0.45), 'camera glass');
  });

  it('takes the battery repair off for a battery fault', () => near(cut(['battery_fault']), repairs.battery, 'battery fault'));

  it('adds up the front and the back camera, as Cashify does', () => {
    near(cut(['camera_front', 'camera_back']), repairs.camera + Math.round(repairs.camera * 0.55), 'both cameras');
  });
});

describe('on a cheaper phone', () => {
  const cheapFlawless = offerWith([], IPHONE_13);
  const cheapShare = (defects) => (cheapFlawless - offerWith(defects, IPHONE_13)) / cheapFlawless;

  it('still takes about 40% off for WiFi, as Cashify does on a cheap phone too', () => {
    const lost = cheapShare(['wifi']);
    assert.ok(Math.abs(lost - 0.40) < 0.02, `took ${(lost * 100).toFixed(1)}%`);
  });

  it('takes the camera repair cost off, which is a bigger share of a cheaper phone', () => {
    assert.ok(cheapShare(['camera_back']) > shareLost(['camera_back']));
  });

  it('takes at least a minimum for the small faults', () => {
    assert.ok(cheapFlawless - offerWith(['vibrator'], IPHONE_13) >= 300);
    assert.ok(cheapFlawless - offerWith(['speaker'], IPHONE_13) >= 600);
  });

  it('does not take Face ID\'s share for a fingerprint sensor on an Android phone', () => {
    const androidFlawless = offerWith([], GALAXY_A14);
    const lost = (androidFlawless - offerWith(['biometrics'], GALAXY_A14)) / androidFlawless;
    assert.ok(lost < 0.15, `took ${(lost * 100).toFixed(1)}%`);
  });
});

describe('body damage on a cheaper phone', () => {
  const share = (body_condition, extra) => (offerWith([], extra) - offerWith([], { ...extra, body_condition })) / offerWith([], extra);

  it('takes a smaller share than on a premium phone', () => {
    for (const body_condition of ['minor_scratches', 'dents_bent', 'panel_broken']) {
      assert.ok(share(body_condition, IPHONE_13) < share(body_condition), body_condition);
    }
  });

  it('takes about 3.5%, 4.5% and 11% off', () => {
    assert.ok(Math.abs(share('minor_scratches', IPHONE_13) - 0.035) < 0.01);
    assert.ok(Math.abs(share('dents_bent', IPHONE_13) - 0.045) < 0.01);
    assert.ok(Math.abs(share('panel_broken', IPHONE_13) - 0.11) < 0.015);
  });
});

describe('a phone that cannot make or receive calls', () => {
  it('is sent to inspection with a salvage estimate instead of being quoted', () => {
    const quote = quoteWith(['calls_not_working']);
    assert.equal(quote.status, 'requires_manual_review');
    assert.equal(quote.reason, 'CALLS_NOT_WORKING');
    assert.equal(quote.reviewAction, 'book_inspection');
  });

  it('is valued at a small fixed amount, as Cashify does: about ₹1,200 for an iPhone and ₹800 for the rest', () => {
    assert.equal(quoteWith(['calls_not_working']).offerAmount, 1200);
    assert.equal(quoteWith(['calls_not_working'], GALAXY_A14).offerAmount, 800);
  });

  it('is valued at the same amount whatever the price of the phone', () => {
    assert.equal(quoteWith(['calls_not_working']).offerAmount, quoteWith(['calls_not_working'], IPHONE_13).offerAmount);
  });

  it('is sent to inspection whatever else is wrong with the phone', () => {
    assert.equal(quoteWith(['calls_not_working', 'wifi']).reason, 'CALLS_NOT_WORKING');
    assert.equal(quoteWith(['calls_not_working'], { screen_condition: 'cracked' }).status, 'requires_manual_review');
  });

  it('does not change a phone whose calls work', () => {
    assert.equal(quoteWith([]).status, 'quoted');
  });
});
