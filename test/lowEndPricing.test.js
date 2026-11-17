import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import {
  quotePhone,
  calculateRamPriceOffset,
  legacyScreenCondition,
  LOW_PRICE_BELOW,
  RAM_OFFSET_MAX_SHARE_LOW,
  SCREEN_STATE_SHARE_LOW,
  ACCESSORIES_MAX_SHARE_LOW,
} from '../fundu_phone_quote.mjs';

const FULL = ['Original Box', 'Original Charger', 'Valid Bill'];
const phone = { brand: 'Samsung', model: 'Galaxy A14 5G', storage: '128 GB' };

/** A flawless phone older than 11 months with every accessory, on the admin price `price` (the way the server prices it). */
const quoteAt = (price, extra = {}) =>
  quotePhone(
    {
      ...phone, powers_on: true, activation_lock_cleared: true, ownership_verified: true, liquid_damage: false,
      cosmetic_condition: 'flawless', screen_condition: 'flawless', body_condition: 'flawless', battery_health: 'healthy',
      defects: [], accessories: FULL, age_period: 'above_11_months', ...extra,
    },
    { catalogPrice: price, catalogStorage: '128 GB' },
  );
const offerAt = (price, extra) => quoteAt(price, extra).offerAmount;
const share = (price, extra) => (offerAt(price) - offerAt(price, extra)) / offerAt(price);

const CHEAP = 6240; // the Galaxy A14 5G on Cashify
const MID = 30000;

describe('what counts as a low-end phone', () => {
  it('is a phone priced under 20,000', () => {
    assert.equal(LOW_PRICE_BELOW, 20000);
  });
});

describe('screen states on a low-end phone (measured against Cashify on a Galaxy A14 5G, a Redmi Note 10 and a Galaxy A53 5G)', () => {
  const expected = {
    scratches_minor: 0.065,
    scratches_major: 0.155,
    spots_few: 0.10,
    tint_minor: 0.10,
    faded_edges: 0.26,
    spots_many: 0.31,
    chipped: 0.22,
    cracked: 0.31,
    tint_major: 0.27,
    spots_heavy: 0.44,
    lines_visible: 0.445,
    touch_fault: 0.51,
  };

  for (const [state, wanted] of Object.entries(expected)) {
    it(`takes about ${(wanted * 100).toFixed(1).replace(/\.0$/, '')}% off for ${state}`, () => {
      const lost = share(CHEAP, { screen_condition: state });
      assert.ok(Math.abs(lost - wanted) < 0.02, `${state} took ${(lost * 100).toFixed(1)}%`);
    });
  }

  it('is in the order Cashify prices them', () => {
    const order = ['scratches_minor', 'scratches_major', 'chipped', 'faded_edges', 'cracked', 'spots_heavy', 'touch_fault'];
    for (let i = 1; i < order.length; i++) {
      assert.ok(share(CHEAP, { screen_condition: order[i] }) > share(CHEAP, { screen_condition: order[i - 1] }), `${order[i - 1]} < ${order[i]}`);
    }
  });

  it('takes the graded share instead of the flat "good look" markdown of 15%', () => {
    const light = share(CHEAP, { screen_condition: 'scratches_minor', cosmetic_condition: 'good' });
    assert.ok(light < 0.09, `light scratches took ${(light * 100).toFixed(1)}%`);
  });

  it('keeps a body dent for a worn screen, but not on top of a screen that needs a repair', () => {
    assert.ok(offerAt(CHEAP, { screen_condition: 'spots_many', body_condition: 'dents_bent' }) < offerAt(CHEAP, { screen_condition: 'spots_many' }));
    for (const state of ['cracked', 'chipped', 'touch_fault', 'spots_heavy', 'lines_visible', 'tint_major']) {
      assert.equal(offerAt(CHEAP, { screen_condition: state, body_condition: 'dents_bent' }), offerAt(CHEAP, { screen_condition: state }), state);
    }
  });

  it('takes its share even off a very cheap phone, with no rupee floor (the 1,999 floor is for the other phones)', () => {
    const lost = (offerAt(3000) - offerAt(3000, { screen_condition: 'cracked' })) / offerAt(3000);
    assert.ok(within(lost, 0.28, 0.34), `took ${(lost * 100).toFixed(1)}%`);
  });

  it('keeps the 1,999 floor on a phone that is not low-end', () => {
    // A phone just over the line: the share of its value is already above the floor, so the floor does not show.
    const lost = offerAt(MID) - offerAt(MID, { screen_condition: 'cracked' });
    assert.ok(lost >= Math.round(1999 * 0.8));
  });

  it('tells the customer what is wrong with the screen', () => {
    const text = (state) => quoteAt(CHEAP, { screen_condition: state }).conditionSummary.join(' | ');
    assert.match(text('touch_fault'), /touch not working/);
    assert.match(text('spots_heavy'), /heavy spots/);
    assert.match(text('scratches_major'), /many scratches/);
    assert.match(text('faded_edges'), /faded along the edges/);
  });

  it('still prices the old two-level values the way it did', () => {
    const cracked = share(CHEAP, { screen_condition: 'cracked' });
    assert.ok(within(share(CHEAP, { screen_condition: 'scratched', cosmetic_condition: 'good' }), 0.13, 0.17));
    assert.ok(cracked > 0.27 && cracked < 0.33);
    assert.ok(within(share(CHEAP, { screen_condition: 'display_lines' }), 0.33, 0.39));
  });
});

const within = (v, lo, hi) => v >= lo && v <= hi;

describe('screen states on a phone that is not low-end', () => {
  it('are priced on the middle table, not the cheap one (see middlePricing.test.js): a Samsung crack takes 0.8 of 36%', () => {
    assert.ok(within(share(MID, { screen_condition: 'cracked' }), 0.26, 0.32));
    assert.ok(within(share(MID, { screen_condition: 'touch_fault' }), 0.44, 0.51));
    assert.ok(share(MID, { screen_condition: 'touch_fault' }) > share(MID, { screen_condition: 'cracked' }) + 0.15);
  });

  it('maps each state to the old two-level value, which decides whether the screen needs a repair', () => {
    assert.equal(legacyScreenCondition('chipped'), 'cracked');
    assert.equal(legacyScreenCondition('spots_many'), 'scratched');
    assert.equal(legacyScreenCondition('lines_visible'), 'display_lines');
    assert.equal(legacyScreenCondition('cracked'), 'cracked');
    assert.equal(legacyScreenCondition('flawless'), 'flawless');
  });

  it('has a share for every state', () => {
    assert.equal(Object.keys(SCREEN_STATE_SHARE_LOW).length, 13);
  });
});

describe('missing accessories on a low-end phone', () => {
  it('never take more than 6% of the aged value, where the flat Rs 800 would be 17%', () => {
    const lost = offerAt(6000) - offerAt(6000, { accessories: [] });
    assert.ok(lost <= Math.round(6000 * 0.8 * ACCESSORIES_MAX_SHARE_LOW) + 50, `took Rs ${lost}`);
    assert.ok(lost < 800);
  });

  it('still take the full Rs 800 off a phone that is not low-end', () => {
    assert.equal(offerAt(MID) - offerAt(MID, { accessories: [] }), 800);
  });

  it('still take something off a low-end phone, and more for more missing', () => {
    assert.ok(offerAt(6000, { accessories: ['Original Box', 'Original Charger'] }) < offerAt(6000));
    assert.ok(offerAt(15000, { accessories: [] }) <= offerAt(15000, { accessories: ['Original Box', 'Original Charger'] }));
  });

  it('take the flat amounts where they are already under the cap (a Rs 18,000 phone loses Rs 800)', () => {
    assert.equal(offerAt(18000) - offerAt(18000, { accessories: [] }), 800);
  });
});

describe('the RAM offset on a low-end phone', () => {
  const rams = ['4 GB', '6 GB', '8 GB'];

  it('never passes 14% of the price', () => {
    assert.equal(RAM_OFFSET_MAX_SHARE_LOW, 0.14);
    for (const price of [3000, 6000, 7450, 12000]) {
      for (const ram of ['4 GB', '6 GB', '8 GB', '12 GB']) {
        const offset = calculateRamPriceOffset(ram, rams, 'Samsung', price);
        assert.ok(Math.abs(offset) <= Math.round(price * 0.14), `${ram} on ${price}: ${offset}`);
      }
    }
  });

  it('matches Cashify on the Galaxy A14 5G: 8 GB adds about 14% of Rs 7,450, not Rs 2,000', () => {
    const offset = calculateRamPriceOffset('8 GB', rams, 'Samsung', 7450);
    assert.equal(offset, 1043);
  });

  it('is not capped on a phone that is not low-end, or when no price is given', () => {
    assert.equal(calculateRamPriceOffset('8 GB', rams, 'Samsung', 30000), 2000);
    assert.equal(calculateRamPriceOffset('8 GB', rams, 'Samsung'), 2000);
    assert.equal(calculateRamPriceOffset('8 GB', rams, 'Samsung', 20000), 2000);
  });

  it('is the same on the sell page as in the quote engine', async () => {
    const { outputFiles } = await build({ entryPoints: [new URL('../src/lib/deviceSpecs.ts', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')], bundle: true, format: 'esm', write: false, logLevel: 'error' });
    const client = await import(`data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString('base64')}`);
    assert.equal(client.LOW_PRICE_BELOW, LOW_PRICE_BELOW);
    assert.equal(client.RAM_OFFSET_MAX_SHARE_LOW, RAM_OFFSET_MAX_SHARE_LOW);
    // The sell page and the engine keep their own fallback for a RAM that is not in the list (an older difference), so this
    // compares the RAM sizes the phone is sold with.
    for (const price of [0, 5000, 7450, 19999, 20000, 60000]) {
      for (const ram of ['4 GB', '6 GB', '8 GB']) {
        assert.equal(client.calculateRamPriceOffset(ram, rams, 'Samsung', price), calculateRamPriceOffset(ram, rams, 'Samsung', price), `${ram} at ${price}`);
      }
    }
  });
});

describe('from the sell form answers to the quote, on a low-end phone', () => {
  it('prices what the customer ticked: touch not working takes about half, a few light scratches under 10%', async () => {
    const { transform } = await import('esbuild');
    const { readFile } = await import('node:fs/promises');
    const source = await readFile(new URL('../src/lib/sellCondition.ts', import.meta.url), 'utf8');
    const { code } = await transform(source, { loader: 'ts', format: 'esm' });
    const { deriveCondition } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
    const priced = (answers) => {
      const c = deriveCondition(answers);
      return share(CHEAP, { screen_condition: c.screenCondition, body_condition: c.bodyCondition, cosmetic_condition: c.cosmeticCondition });
    };
    assert.ok(within(priced({ touchFault: true }), 0.47, 0.55), String(priced({ touchFault: true })));
    assert.ok(priced({ screenMinorScratches: true }) < 0.09);
    assert.ok(within(priced({ screenCracked: true }), 0.28, 0.34));
    assert.ok(within(priced({ screenCracked: true, screenChipped: true }), 0.19, 0.25));
    assert.ok(within(priced({ displayMajorLines: true }), 0.41, 0.48));
    assert.ok(within(priced({ displayManyMinorSpots: true, displayMinorSpotsWhite: true }), 0.28, 0.34));
  });
});

describe('a low-end quote end to end (Galaxy A14 5G, Cashify base 6,240)', () => {
  it('quotes a flawless old phone at about the aged price (a Samsung older than 11 months is offered 0.77 of it)', () => {
    assert.ok(within(offerAt(CHEAP), 4750, 4850), String(offerAt(CHEAP)));
  });

  it('still sends a phone that cannot make calls to inspection', () => {
    assert.equal(quoteAt(CHEAP, { defects: ['calls_not_working'] }).status, 'requires_manual_review');
  });
});
