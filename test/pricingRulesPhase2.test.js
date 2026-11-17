import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_PRICING_RULES,
  RULE_LIMITS,
  resolvePricingRules,
  validatePricingRules,
  fillMissingGroups,
  diffPricingRules,
  cloneRules,
} from '../fundu_pricing_rules.mjs';
import {
  quotePhone,
  screenStateShare,
  SCREEN_STATE_SHARE_LOW,
  SCREEN_STATE_SHARE_MID,
  SCREEN_STATE_SHARE_HIGH,
  ACCESSORIES_MAX_SHARE_LOW,
} from '../fundu_phone_quote.mjs';
import { createPricingRulesService } from '../server/services/pricingRulesService.js';

const FULL = ['Original Box', 'Original Charger', 'Valid Bill'];
const near = (actual, expected, tolerance, label) => assert.ok(Math.abs(actual - expected) <= tolerance, `${label}: expected about ${expected}, got ${actual}`);

const quote = (brand, model, price, storage, pricingRules, extra = {}) =>
  quotePhone(
    {
      brand, model, storage, powers_on: true, activation_lock_cleared: true, ownership_verified: true, liquid_damage: false,
      cosmetic_condition: 'flawless', screen_condition: 'flawless', body_condition: 'flawless', battery_health: 'healthy',
      defects: [], accessories: FULL, age_period: 'above_11_months', ...extra,
    },
    { catalogPrice: price, catalogStorage: storage, pricingRules },
  );
const offer = (...args) => quote(...args).offerAmount;
/** How much a change of condition takes off a flawless phone with every accessory. */
const cut = (brand, model, price, storage, rules, extra) => offer(brand, model, price, storage, rules) - offer(brand, model, price, storage, rules, extra);
const withRules = (change) => {
  const rules = cloneRules(DEFAULT_PRICING_RULES);
  change(rules);
  return rules;
};

// Phones in each price range, none of them an iPhone with its own screen amount.
const CHEAP = ['Samsung', 'Galaxy A14 5G', 6240, '128 GB'];
const MID = ['OnePlus', '12', 34480, '256 GB'];
const PREMIUM_ANDROID = ['Samsung', 'Galaxy S26 Ultra', 82920, '256 GB'];
const PREMIUM_APPLE = ['Apple', 'iPhone 18 Pro', 123000, '256 GB']; // no crack amount saved: priced by its range

describe('the Phase 2 defaults', () => {
  it('are the tables the engine always used', () => {
    assert.equal(SCREEN_STATE_SHARE_LOW, DEFAULT_PRICING_RULES.screenTables.low);
    assert.equal(SCREEN_STATE_SHARE_MID, DEFAULT_PRICING_RULES.screenTables.mid);
    assert.equal(SCREEN_STATE_SHARE_HIGH, DEFAULT_PRICING_RULES.screenTables.high);
    assert.equal(DEFAULT_PRICING_RULES.screenTables.low.cracked, 0.31);
    assert.equal(DEFAULT_PRICING_RULES.screenTables.mid.touch_fault, 0.594);
    assert.equal(DEFAULT_PRICING_RULES.screenTables.high.cracked, 0.229);
    assert.deepEqual(DEFAULT_PRICING_RULES.bodyDamage.premiumApple, { minor_scratches: 0.06, dents_bent: 0.10, panel_broken: 0.18 });
    assert.equal(DEFAULT_PRICING_RULES.faults.share.wifi, 0.40);
    assert.equal(DEFAULT_PRICING_RULES.faults.share.biometrics, 0.27);
    assert.equal(DEFAULT_PRICING_RULES.faults.flatAndroid.speaker, 450);
    assert.equal(DEFAULT_PRICING_RULES.faults.callsSalvageApple, 1200);
    assert.equal(DEFAULT_PRICING_RULES.accessories.box, 300);
    assert.equal(ACCESSORIES_MAX_SHARE_LOW, 0.06);
  });

  it('are valid', () => {
    assert.deepEqual(validatePricingRules(DEFAULT_PRICING_RULES), { valid: true, errors: [] });
  });
});

describe('validating the Phase 2 rules', () => {
  const errorsFor = (change) => validatePricingRules(withRules(change)).errors.join(' | ');

  it('rejects a screen share outside its bounds, a missing state and a state the engine does not price', () => {
    assert.match(errorsFor((r) => { r.screenTables.mid.cracked = 0.95; }), /Screen table \(mid\): cracked must be between/);
    assert.match(errorsFor((r) => { delete r.screenTables.low.chipped; }), /Screen table \(low\): chipped/);
    assert.match(errorsFor((r) => { r.screenTables.high.made_up = 0.1; }), /"made_up" is not something/);
    assert.match(errorsFor((r) => { r.screenTables.extra = {}; }), /not a price range/);
  });

  it('rejects a table where worse damage takes less off than lighter damage', () => {
    assert.match(errorsFor((r) => { r.screenTables.mid.cracked = 0.05; }), /cracked must not take less off than scratches_major/);
    assert.match(errorsFor((r) => { r.screenTables.low.touch_fault = 0.2; }), /touch_fault must not take less off than cracked/);
  });

  it('rejects body damage out of bounds or out of order', () => {
    assert.match(errorsFor((r) => { r.bodyDamage.standard.panel_broken = 0.9; }), /Body damage \(standard\): panel_broken/);
    assert.match(errorsFor((r) => { r.bodyDamage.premiumApple.dents_bent = 0.01; }), /a dent must not take less than minor wear/);
  });

  it('rejects fault values out of bounds, a made-up fault, and a missing fault', () => {
    assert.match(errorsFor((r) => { r.faults.share.wifi = 0.9; }), /Fault shares: wifi/);
    assert.match(errorsFor((r) => { r.faults.min.speaker = 99999; }), /Fault minimums: speaker/);
    assert.match(errorsFor((r) => { r.faults.flatAndroid.hacked = 100; }), /"hacked" is not something/);
    assert.match(errorsFor((r) => { delete r.faults.repairFactor.camera_back; }), /Repair part factors: camera_back/);
    assert.match(errorsFor((r) => { r.faults.screenNotOriginalShare = 5; }), /replaced-screen share/);
    assert.match(errorsFor((r) => { r.faults.unknownShare = 0.9; }), /unknown fault/);
    assert.match(errorsFor((r) => { r.faults.callsSalvageApple = -1; }), /callsSalvageApple/);
  });

  it('rejects accessory amounts out of bounds', () => {
    assert.match(errorsFor((r) => { r.accessories.box = 99999; }), /Accessory box/);
    assert.match(errorsFor((r) => { r.accessories.lowEndMaxShare = 0.9; }), /accessories can take off a cheap phone/);
  });

  it('accepts a zero accessory amount and a zero fault share', () => {
    assert.equal(validatePricingRules(withRules((r) => { r.accessories.box = 0; r.faults.share.vibrator = 0; })).valid, true);
  });

  it('says a rules set from before these groups existed is missing them', () => {
    const phase1 = { age: DEFAULT_PRICING_RULES.age, appleScreen: DEFAULT_PRICING_RULES.appleScreen, samsungMidFactor: 0.8 };
    const result = validatePricingRules(phase1);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => /screen tables/.test(e)));
  });
});

describe('resolving and completing the Phase 2 rules', () => {
  it('gives a set from before these groups the default for each group', () => {
    const phase1 = { age: { ...DEFAULT_PRICING_RULES.age, over11: 0.78 }, appleScreen: DEFAULT_PRICING_RULES.appleScreen, samsungMidFactor: 0.8 };
    const resolved = resolvePricingRules(phase1);
    assert.equal(resolved.age.over11, 0.78);
    assert.deepEqual(resolved.screenTables, DEFAULT_PRICING_RULES.screenTables);
    assert.deepEqual(resolved.faults, DEFAULT_PRICING_RULES.faults);
    assert.deepEqual(resolved.accessories, DEFAULT_PRICING_RULES.accessories);
  });

  it('fills only a group that is missing altogether, so a wrong value is still seen', () => {
    const phase1 = { age: DEFAULT_PRICING_RULES.age, appleScreen: DEFAULT_PRICING_RULES.appleScreen, samsungMidFactor: 0.8 };
    assert.equal(validatePricingRules(fillMissingGroups(phase1)).valid, true);
    const wrong = { ...phase1, faults: { share: { wifi: 9 } } };
    assert.equal(validatePricingRules(fillMissingGroups(wrong)).valid, false);
    assert.equal(fillMissingGroups(wrong).faults.share.wifi, 9);
  });

  it('does not change the object it is given, and gives back non-objects as they are', () => {
    const phase1 = { age: DEFAULT_PRICING_RULES.age };
    fillMissingGroups(phase1);
    assert.deepEqual(Object.keys(phase1), ['age']);
    assert.equal(fillMissingGroups(null), null);
    assert.equal(fillMissingGroups('x'), 'x');
  });

  it('replaces a value out of bounds with its default, one at a time', () => {
    const resolved = resolvePricingRules(withRules((r) => { r.faults.share.wifi = 9; r.faults.min.speaker = 700; r.accessories.box = -5; r.bodyDamage.standard.dents_bent = 0.06; }));
    assert.equal(resolved.faults.share.wifi, 0.40);
    assert.equal(resolved.faults.min.speaker, 700);
    assert.equal(resolved.accessories.box, 300);
    assert.equal(resolved.bodyDamage.standard.dents_bent, 0.06);
  });

  it('replaces a table that was damaged (a crack below scratches) with the default table, whole', () => {
    const resolved = resolvePricingRules(withRules((r) => { r.screenTables.mid.cracked = 0.05; r.screenTables.mid.scratches_minor = 0.02; }));
    assert.deepEqual(resolved.screenTables.mid, DEFAULT_PRICING_RULES.screenTables.mid);
    const body = resolvePricingRules(withRules((r) => { r.bodyDamage.premiumApple.dents_bent = 0.01; }));
    assert.deepEqual(body.bodyDamage.premiumApple, DEFAULT_PRICING_RULES.bodyDamage.premiumApple);
  });

  it('drops a key that is not one the engine prices, and always gives every key', () => {
    const resolved = resolvePricingRules(withRules((r) => { r.faults.share.hacked = 0.5; delete r.faults.share.wifi; }));
    assert.equal(resolved.faults.share.hacked, undefined);
    assert.equal(resolved.faults.share.wifi, 0.40);
  });

  it('lists a changed value in the diff', () => {
    const diff = diffPricingRules(DEFAULT_PRICING_RULES, withRules((r) => { r.screenTables.mid.cracked = 0.4; r.accessories.box = 0; }));
    assert.deepEqual(diff.map((d) => d.path).sort(), ['accessories.box', 'screenTables.mid.cracked']);
  });

  it('has bounds for every new value', () => {
    for (const key of ['screenShare', 'bodyShare', 'faultShare', 'faultRupees', 'repairFactor', 'screenNotOriginalShare', 'unknownShare', 'salvage', 'accessoryRupees', 'accessoryMaxShare']) {
      assert.ok(Array.isArray(RULE_LIMITS[key]) && RULE_LIMITS[key].length === 2, key);
    }
  });
});

describe('the engine with edited screen tables', () => {
  it('uses the middle table for a phone from 25,000 to 60,000', () => {
    const rules = withRules((r) => { r.screenTables.mid.cracked = 0.5; r.screenTables.mid.touch_fault = 0.7; });
    const base = cut(...MID, undefined, { screen_condition: 'cracked' });
    const edited = cut(...MID, rules, { screen_condition: 'cracked' });
    assert.ok(edited > base * 1.3, `${edited} against ${base}`);
    near(edited / (offer(...MID, rules) - 800 * 0), 0.5 * 0.8 * 34480 / offer(...MID, rules) * 1, 0.02, 'about half of the aged value');
    assert.ok(cut(...MID, rules, { screen_condition: 'touch_fault' }) > edited);
  });

  it('uses the low table under 20,000 and the high table from 60,000, each on its own', () => {
    const lowRules = withRules((r) => { r.screenTables.low.cracked = 0.5; });
    assert.ok(cut(...CHEAP, lowRules, { screen_condition: 'cracked' }) > cut(...CHEAP, undefined, { screen_condition: 'cracked' }) * 1.4);
    assert.equal(cut(...MID, lowRules, { screen_condition: 'cracked' }), cut(...MID, undefined, { screen_condition: 'cracked' }), 'the middle phone is not moved by the low table');
    const highRules = withRules((r) => { r.screenTables.high.cracked = 0.4; r.screenTables.high.touch_fault = 0.6; });
    assert.ok(cut(...PREMIUM_ANDROID, highRules, { screen_condition: 'cracked' }) > cut(...PREMIUM_ANDROID, undefined, { screen_condition: 'cracked' }) * 1.5);
    assert.equal(cut(...MID, highRules, { screen_condition: 'cracked' }), cut(...MID, undefined, { screen_condition: 'cracked' }));
  });

  it('is also used for an iPhone that has no crack amount of its own, and not for one that has', () => {
    const rules = withRules((r) => { r.screenTables.high.cracked = 0.4; r.screenTables.high.touch_fault = 0.6; });
    assert.ok(cut(...PREMIUM_APPLE, rules, { screen_condition: 'cracked' }) > cut(...PREMIUM_APPLE, undefined, { screen_condition: 'cracked' }) * 1.5);
    assert.equal(cut('Apple', 'iPhone 14', 29270, '128 GB', rules, { screen_condition: 'cracked' }), cut('Apple', 'iPhone 14', 29270, '128 GB', undefined, { screen_condition: 'cracked' }));
  });

  it('keeps the share function in step: the rules table, the Samsung factor, and the ramp from 20,000 to 25,000', () => {
    const rules = resolvePricingRules(withRules((r) => { r.screenTables.mid.cracked = 0.5; r.screenTables.low.cracked = 0.3; }));
    assert.equal(screenStateShare('cracked', 30000, 'OnePlus', rules), 0.5);
    assert.equal(screenStateShare('cracked', 30000, 'Samsung', rules), 0.5 * 0.8);
    assert.equal(screenStateShare('cracked', 10000, 'OnePlus', rules), 0.3);
    near(screenStateShare('cracked', 22500, 'OnePlus', rules), 0.4, 1e-9, 'halfway up the ramp');
    assert.equal(screenStateShare('cracked', 30000, 'OnePlus'), 0.36);
  });

  it('does not read a screen state that is not in the table, whatever it is called', () => {
    for (const odd of ['constructor', 'toString', '__proto__', 'scratched', '']) {
      assert.equal(screenStateShare(odd, 30000, 'OnePlus'), undefined, odd);
      assert.equal(screenStateShare(odd, 10000, 'OnePlus', resolvePricingRules(undefined)), undefined, odd);
    }
  });
});

describe('the engine with edited body damage', () => {
  it('uses the standard table under 60,000, and the iPhone and Android tables from 60,000', () => {
    const rules = withRules((r) => { r.bodyDamage.standard.dents_bent = 0.2; r.bodyDamage.standard.panel_broken = 0.25; r.bodyDamage.premiumApple.dents_bent = 0.3; r.bodyDamage.premiumApple.panel_broken = 0.35; r.bodyDamage.premiumAndroid.dents_bent = 0.15; r.bodyDamage.premiumAndroid.panel_broken = 0.2; });
    assert.ok(cut(...MID, rules, { body_condition: 'dents_bent' }) > cut(...MID, undefined, { body_condition: 'dents_bent' }) * 3);
    assert.ok(cut(...PREMIUM_APPLE, rules, { body_condition: 'dents_bent' }) > cut(...PREMIUM_APPLE, undefined, { body_condition: 'dents_bent' }) * 2.5);
    assert.ok(cut(...PREMIUM_ANDROID, rules, { body_condition: 'dents_bent' }) > cut(...PREMIUM_ANDROID, undefined, { body_condition: 'dents_bent' }) * 3);
    assert.ok(cut(...MID, rules, { body_condition: 'minor_scratches' }) === cut(...MID, undefined, { body_condition: 'minor_scratches' }), 'a value that was not edited is not moved');
  });

  it('takes the edited share of the aged value', () => {
    const rules = withRules((r) => { r.bodyDamage.standard.minor_scratches = 0.1; r.bodyDamage.standard.dents_bent = 0.1; r.bodyDamage.standard.panel_broken = 0.1; });
    near(cut(...MID, rules, { body_condition: 'minor_scratches' }), 34480 * 0.8 * 0.1, 80, 'ten percent');
  });

  it('ignores an unknown body condition', () => {
    assert.equal(cut(...MID, undefined, { body_condition: 'constructor' }), 0);
  });
});

describe('the engine with edited faults', () => {
  it('uses the share for WiFi, and the share of Face ID on an iPhone', () => {
    const rules = withRules((r) => { r.faults.share.wifi = 0.2; r.faults.share.biometrics = 0.1; });
    near(cut(...MID, rules, { defects: ['wifi'] }), 34480 * 0.8 * 0.2, 80, 'wifi');
    near(cut('Apple', 'iPhone 14', 29270, '128 GB', rules, { defects: ['biometrics'] }), 29270 * 0.955 * 0.1, 80, 'face id');
    assert.ok(cut(...MID, rules, { defects: ['wifi'] }) < cut(...MID, undefined, { defects: ['wifi'] }));
  });

  it('still counts WiFi and Bluetooth once, and a cheap Android phone has no big sensor', () => {
    const rules = withRules((r) => { r.faults.share.biometrics = 0.5; });
    assert.equal(cut(...MID, rules, { defects: ['wifi', 'bluetooth'] }), cut(...MID, rules, { defects: ['wifi'] }));
    assert.equal(cut(...CHEAP, rules, { defects: ['biometrics'] }), cut(...CHEAP, undefined, { defects: ['biometrics'] }), 'unknown to a cheap Android: priced as an unknown fault');
  });

  it('uses the minimum of a small fault', () => {
    const rules = withRules((r) => { r.faults.min.microphone = 900; });
    assert.ok(cut(...MID, rules, { defects: ['microphone'] }) >= 900);
    assert.ok(cut(...MID, undefined, { defects: ['microphone'] }) < 900);
  });

  it('uses the flat amount of an Android phone and not an iPhone', () => {
    const rules = withRules((r) => { r.faults.flatAndroid.speaker = 700; });
    assert.equal(cut(...MID, rules, { defects: ['speaker'] }), 700);
    assert.equal(cut('Apple', 'iPhone 14', 29270, '128 GB', rules, { defects: ['speaker'] }), cut('Apple', 'iPhone 14', 29270, '128 GB', undefined, { defects: ['speaker'] }));
  });

  it('uses the repair part factors: the back camera is edited, the front camera not', () => {
    const rules = withRules((r) => { r.faults.repairFactor.camera_back = 0.5; r.faults.repairFactor.battery_fault = 2; });
    const iphone = ['Apple', 'iPhone 14', 29270, '128 GB'];
    near(cut(...iphone, rules, { defects: ['camera_back'] }), cut(...iphone, undefined, { defects: ['camera_back'] }) * 0.5, 60, 'back camera');
    assert.equal(cut(...iphone, rules, { defects: ['camera_front'] }), cut(...iphone, undefined, { defects: ['camera_front'] }));
    near(cut(...iphone, rules, { defects: ['battery_fault'] }), cut(...iphone, undefined, { defects: ['battery_fault'] }) * 2, 60, 'battery');
  });

  it('uses the replaced-screen share, on an iPhone with its own amount and on any other phone', () => {
    const rules = withRules((r) => { r.faults.screenNotOriginalShare = 0.5; });
    near(cut('Apple', 'iPhone 14', 29270, '128 GB', rules, { defects: ['screen_not_original'] }), 10710 * 0.5, 80, 'iPhone 14');
    assert.ok(cut(...MID, rules, { defects: ['screen_not_original'] }) < cut(...MID, undefined, { defects: ['screen_not_original'] }) * 0.7);
  });

  it('uses the share for a fault it does not know, and never for a fault it does', () => {
    const rules = withRules((r) => { r.faults.unknownShare = 0.2; });
    near(cut(...MID, rules, { defects: ['some_new_fault'] }), 34480 * 0.2, 60, 'unknown fault');
    assert.equal(cut(...MID, rules, { defects: ['wifi'] }), cut(...MID, undefined, { defects: ['wifi'] }));
  });

  it('prices a fault named like an object property as an unknown fault, not as nothing or NaN', () => {
    for (const odd of ['constructor', 'toString', 'hasOwnProperty', '__proto__']) {
      const lost = cut(...MID, undefined, { defects: [odd] });
      assert.ok(Number.isFinite(lost) && lost > 0, `${odd}: ${lost}`);
    }
  });

  it('uses the calls-not-working amounts: an iPhone or a phone from 20,000, and a cheaper Android', () => {
    const rules = withRules((r) => { r.faults.callsSalvageApple = 1500; r.faults.callsSalvageOther = 600; });
    assert.equal(quote(...MID, rules, { defects: ['calls_not_working'] }).offerAmount, 1500);
    assert.equal(quote('Apple', 'iPhone 14', 29270, '128 GB', rules, { defects: ['calls_not_working'] }).offerAmount, 1500);
    assert.equal(quote(...CHEAP, rules, { defects: ['calls_not_working'] }).offerAmount, 600);
    assert.equal(quote(...MID, undefined, { defects: ['calls_not_working'] }).offerAmount, 1200);
  });
});

describe('the engine with edited accessories', () => {
  it('takes the edited amount for each missing accessory', () => {
    const rules = withRules((r) => { r.accessories.box = 500; r.accessories.charger = 100; r.accessories.bill = 1000; });
    const without = (list) => offer(...MID, rules, { accessories: list });
    assert.equal(offer(...MID, rules, { accessories: FULL }) - without(['Original Charger', 'Valid Bill']), 500);
    assert.equal(offer(...MID, rules, { accessories: FULL }) - without(['Original Box', 'Valid Bill']), 100);
    assert.equal(offer(...MID, rules, { accessories: FULL }) - without(['Original Box', 'Original Charger']), 1000);
  });

  it('takes nothing for an accessory that is set to 0, and does not fall back to the old amount', () => {
    const rules = withRules((r) => { r.accessories.box = 0; r.accessories.charger = 0; r.accessories.bill = 0; });
    assert.equal(offer(...MID, rules, { accessories: [] }), offer(...MID, rules, { accessories: FULL }));
  });

  it('keeps the cap on what all of them take off a cheap phone', () => {
    const base = offer(...CHEAP, undefined, { accessories: FULL }) - offer(...CHEAP, undefined, { accessories: [] });
    const loose = withRules((r) => { r.accessories.lowEndMaxShare = 0.3; r.accessories.box = 1000; });
    assert.ok(offer(...CHEAP, loose, { accessories: FULL }) - offer(...CHEAP, loose, { accessories: [] }) > base);
    assert.equal(offer(...MID, loose, { accessories: FULL }) - offer(...MID, loose, { accessories: [] }), 1000 + 300 + 200, 'a middle phone has no cap');
  });
});

describe('the older rules sets in the history', () => {
  const rulesWith = (change) => cloneRules(change(cloneRules(DEFAULT_PRICING_RULES)) ?? DEFAULT_PRICING_RULES);

  /** A model that keeps its documents in an array: the few calls the service makes. */
  function model(seed = []) {
    const docs = [...seed];
    const match = (d, f = {}) => Object.entries(f).every(([k, c]) => (c && typeof c === 'object' ? ('$in' in c ? c.$in.includes(d[k]) : d[k] < c.$lt) : d[k] === c));
    const q = (rows, one) => {
      let r = rows;
      const c = { sort(spec) { const [[f, dir]] = Object.entries(spec); r = [...r].sort((a, b) => (a[f] - b[f]) * dir); return c; }, limit(n) { r = r.slice(0, n); return c; }, lean() { return c; }, then(res, rej) { return Promise.resolve(one ? (r[0] ?? null) : r).then(res, rej); } };
      return c;
    };
    return {
      docs,
      findOne: (f) => q(docs.filter((d) => match(d, f)), true),
      find: (f) => q(docs.filter((d) => match(d, f)), false),
      async create(doc) { docs.push({ ...doc }); },
      async updateOne(f, u) { Object.assign(docs.find((d) => match(d, f)), u.$set); },
      async updateMany(f, u) { docs.filter((d) => match(d, f)).forEach((d) => Object.assign(d, u.$set)); },
      async deleteMany(f) { for (let i = docs.length - 1; i >= 0; i--) if (match(docs[i], f)) docs.splice(i, 1); },
    };
  }
  const phase1Rules = { age: { ...DEFAULT_PRICING_RULES.age, over11: 0.78 }, appleScreen: DEFAULT_PRICING_RULES.appleScreen, samsungMidFactor: 0.8 };

  it('can be published as a draft: a set saved before these groups existed is completed from the defaults', async () => {
    const m = model([{ status: 'draft', version: null, rules: phase1Rules }]);
    const service = createPricingRulesService({ model: m });
    assert.equal(await service.publish({ user: 'a' }), 1);
    const live = await service.getPublished();
    assert.equal(live.rules.age.over11, 0.78);
    assert.deepEqual(live.rules.faults, DEFAULT_PRICING_RULES.faults);
    const stored = m.docs.find((d) => d.status === 'published');
    assert.deepEqual(stored.rules.screenTables, DEFAULT_PRICING_RULES.screenTables, 'it is stored complete');
  });

  it('can be rolled back to, and is made live complete', async () => {
    const m = model([
      { status: 'archived', version: 1, rules: phase1Rules },
      { status: 'published', version: 2, rules: rulesWith((r) => { r.age.over11 = 0.7; return r; }) },
    ]);
    const service = createPricingRulesService({ model: m });
    assert.equal(await service.rollback(1, { user: 'a' }), 3);
    const live = await service.getPublished();
    assert.equal(live.rules.age.over11, 0.78);
    assert.equal(live.rules.accessories.box, 300);
  });

  it('can be edited: an old draft saved with the new groups is accepted', async () => {
    const service = createPricingRulesService({ model: model() });
    const draft = await service.saveDraft(phase1Rules, { user: 'a' });
    assert.equal(draft.rules.age.over11, 0.78);
    assert.deepEqual(draft.rules.bodyDamage, DEFAULT_PRICING_RULES.bodyDamage);
  });

  it('still refuses a set with a wrong value in a group that is there', async () => {
    const service = createPricingRulesService({ model: model() });
    await assert.rejects(service.saveDraft({ ...phase1Rules, faults: { ...DEFAULT_PRICING_RULES.faults, share: { ...DEFAULT_PRICING_RULES.faults.share, wifi: 9 } } }), (e) => e.status === 400);
  });
});
