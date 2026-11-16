import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { quotePhone } from '../fundu_phone_quote.mjs';

// A flawless iPhone 13 older than 11 months, with every accessory: the "nothing wrong" answers of the sell form.
const noProblems = {
  brand: 'Apple',
  model: 'iPhone 13',
  storage: '128 GB',
  powers_on: true,
  cosmetic_condition: 'flawless',
  screen_condition: 'flawless',
  body_condition: 'flawless',
  battery_health: 'healthy',
  defects: [],
  accessories: ['Original Box', 'Original Charger', 'Valid Bill'],
  age_period: 'above_11_months',
};

const offerWith = (defects) => quotePhone({ ...noProblems, defects }).offerAmount;

describe('the Cashify-style faults list', () => {
  it('takes money off for each fault the customer can tick', () => {
    for (const fault of [
      'camera_front', 'camera_back', 'camera_glass', 'volume_button', 'power_button', 'silent_button', 'wifi', 'bluetooth',
      'speaker', 'microphone', 'audio_receiver', 'biometrics', 'charging_port', 'vibrator', 'proximity_sensor', 'battery_fault',
    ]) {
      assert.ok(offerWith([fault]) < offerWith([]), fault);
    }
  });

  it('prices a front or back camera as the camera repair, and both together as one', () => {
    assert.equal(offerWith(['camera_front']), offerWith(['camera']));
    assert.equal(offerWith(['camera_back']), offerWith(['camera']));
    assert.equal(offerWith(['camera_front', 'camera_back']), offerWith(['camera']));
  });

  it('prices a speaker, microphone or receiver as the audio repair, and all three together as one', () => {
    assert.equal(offerWith(['speaker']), offerWith(['speaker_mic']));
    assert.equal(offerWith(['microphone']), offerWith(['speaker_mic']));
    assert.equal(offerWith(['speaker', 'microphone', 'audio_receiver']), offerWith(['speaker_mic']));
  });

  it('still understands the faults saved by the old list', () => {
    for (const fault of ['camera', 'charging_port', 'speaker_mic', 'wifi_bluetooth', 'buttons', 'sensors']) {
      assert.ok(offerWith([fault]) < offerWith([]), fault);
    }
  });

  it('takes more off for unrelated faults than for one', () => {
    assert.ok(offerWith(['wifi', 'vibrator']) < offerWith(['wifi']));
  });
});

describe('the "calls" and "original screen" questions', () => {
  it('takes money off when the phone cannot make or receive calls', () => {
    assert.ok(offerWith(['calls_not_working']) < offerWith([]));
  });

  it('takes money off when the screen is not original', () => {
    assert.ok(offerWith(['screen_not_original']) < offerWith([]));
  });

  it('takes more off when both are wrong than when only one is', () => {
    const both = offerWith(['calls_not_working', 'screen_not_original']);
    assert.ok(both < offerWith(['calls_not_working']));
    assert.ok(both < offerWith(['screen_not_original']));
  });

  it('tells the customer what the deduction is for, in plain words', () => {
    const calls = quotePhone({ ...noProblems, defects: ['calls_not_working'] }).conditionSummary.join(' | ');
    const screen = quotePhone({ ...noProblems, defects: ['screen_not_original'] }).conditionSummary.join(' | ');
    assert.match(calls, /Calling \/ network fault/);
    assert.match(screen, /non-original\) screen/);
  });

  it('still shows the generic wording for a fault without a special message', () => {
    const summary = quotePhone({ ...noProblems, defects: ['wifi_bluetooth'] }).conditionSummary.join(' | ');
    assert.match(summary, /Additional reported hardware fault/);
  });
});
