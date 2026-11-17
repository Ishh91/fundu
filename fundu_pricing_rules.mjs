/**
 * The quote rules an admin can change without a deploy.
 *
 * One plain object, shared by the browser and the server. DEFAULT_PRICING_RULES holds exactly what the engine used before the
 * rules became editable, so a quote with no saved rules is priced as it always was. Every value was measured against Cashify
 * in November 2026 (see the notes in fundu_phone_quote.mjs).
 */

/** Lower-case a model name and drop everything but letters and digits: "Apple iPhone 16 Pro max" -> "iphone16promax". */
export function normalizeModelKey(model) {
  return String(model ?? '').toLowerCase().replace(/^apple\s+/, '').replace(/[^a-z0-9]/g, '');
}

/**
 * The key of an Android phone: its brand and model, so a OnePlus "9" and an iQOO "9" are two keys, without a trailing "5G" (the
 * admin lists some models both ways) and without repeating the brand when the model already starts with it. A "+" is kept as "plus",
 * so a Galaxy S21+ is not a Galaxy S21: ("Samsung", "Galaxy S23 FE 5G") -> "samsunggalaxys23fe", ("OnePlus", "10T") -> "oneplus10t",
 * ("Samsung", "Galaxy S21+ 5G") -> "samsunggalaxys21plus".
 */
export function androidModelKey(brand, model) {
  const plain = (text) => String(text ?? '').toLowerCase().replace(/\+/g, 'plus').replace(/[^a-z0-9]/g, '');
  const brandKey = plain(brand);
  const modelKey = plain(model).replace(/5g$/, '');
  return modelKey.startsWith(brandKey) ? modelKey : `${brandKey}${modelKey}`;
}

const deepFreeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
  }
  return value;
};

export const DEFAULT_PRICING_RULES = deepFreeze({
  // What a phone is offered, as a share of its admin price, by how old it is.
  age: {
    under3: 1.0,
    m3to6: 0.9345,
    m6to11: 0.9078,
    over11: 0.80,
    // An iPhone launched in 2022 or before, once older than 11 months (Cashify 0.96 of its market price).
    oldIphone: 0.955,
    // An Android phone older than 11 months, as a share of its admin price. Cashify offers a recent Android 0.69-0.79 of its market
    // price (Samsung 0.77, the rest about 0.72); the admin price is close to that market price for Samsung and 0-20% above it for
    // the rest, so after the Rs 800 off for no box, charger or bill, 0.77 and 0.73 land within a few percent of Cashify.
    samsungOver11: 0.77,
    androidOver11: 0.73,
    // An Android phone Cashify treats as old (it pays about 0.95 of the market price, the way it does for an iPhone 14), by brand
    // and model key (androidModelKey). Only phones measured on Cashify, and their older siblings, are here.
    oldAndroid: {
      samsunggalaxys23fe: 0.975,
      samsunggalaxys21: 0.955,
      samsunggalaxya52: 0.925,
      oneplus10t: 0.955,
      oneplusnord2: 0.94,
      realmegtneo2: 0.84,
      samsunggalaxys20: 0.95,
      samsunggalaxys20plus: 0.95,
      samsunggalaxys20fe: 0.95,
      samsunggalaxys20ultra: 0.95,
      samsunggalaxys21plus: 0.95,
      samsunggalaxys21fe: 0.95,
      samsunggalaxys21ultra: 0.95,
      samsunggalaxys22: 0.95,
      samsunggalaxys22plus: 0.95,
      samsunggalaxys22ultra: 0.95,
      samsunggalaxys23: 0.95,
      samsunggalaxys23plus: 0.95,
      samsunggalaxys23ultra: 0.95,
      samsunggalaxynote20: 0.95,
      samsunggalaxynote20ultra: 0.95,
      samsunggalaxya52s: 0.95,
      samsunggalaxya53: 0.95,
      samsunggalaxya72: 0.95,
      samsunggalaxyzflip3: 0.95,
      samsunggalaxyzflip4: 0.95,
      samsunggalaxyzfold3: 0.95,
      samsunggalaxyzfold4: 0.95,
      oneplus8: 0.95,
      oneplus8t: 0.95,
      oneplus8pro: 0.95,
      oneplus9: 0.95,
      oneplus9r: 0.95,
      oneplus9rt: 0.95,
      oneplus9pro: 0.95,
      oneplus10pro: 0.95,
      oneplus10r: 0.95,
      oneplusnord2t: 0.95,
      oneplusnordce: 0.95,
      oneplusnordce2: 0.95,
      iqoo7: 0.95,
      iqoo7legend: 0.95,
      iqoo9: 0.95,
      iqoo9se: 0.95,
      iqoo9t: 0.95,
      iqoo9pro: 0.95,
      iqoo11: 0.95,
      realmegt2: 0.95,
      realmegt2pro: 0.95,
    },
    // The newest iPhones, once older than 11 months, each by model key.
    recentIphone: {
      iphone17: 0.735,
      iphone17pro: 0.735,
      iphone17promax: 0.735,
      iphone16e: 0.75,
    },
  },
  // What Cashify takes off an iPhone's screen, in rupees, by model key.
  appleScreen: {
    crackRupees: {
      iphone8plus: 2140,
      iphonex: 3810,
      iphonexr: 3570,
      iphonexsmax: 4880,
      iphonese2022: 5000,
      iphonese3rdgen2022: 5000,
      iphone11: 3220,
      iphone11pro: 5950,
      iphone11promax: 7140,
      iphone12: 4880,
      iphone12mini: 4290,
      iphone12pro: 8030,
      iphone12promax: 8630,
      iphone13: 7440,
      iphone13mini: 6780,
      iphone13pro: 9820,
      iphone13promax: 11900,
      iphone14: 10710,
      iphone14plus: 11900,
      iphone14pro: 11900,
      iphone14promax: 12790,
      iphone15: 12500,
      iphone15plus: 13090,
      iphone15pro: 13680,
      iphone15promax: 13680,
      iphone16: 15470,
      iphone16e: 13680,
      iphone16plus: 16060,
      iphone16pro: 16660,
      iphone16promax: 16660,
      iphone17: 17850,
      iphone17pro: 17850,
      iphone17promax: 17850,
    },
    // Touch not working, where Cashify takes a little less than 1.68 times the crack.
    touchRupees: {
      iphone14: 16920,
      iphone14plus: 17980,
      iphone15: 19350,
    },
    // Every other screen state as a multiple of the crack (identical on an iPhone 14, 17 Pro Max, S26 Ultra and S25 Ultra).
    multiples: {
      scratches_minor: 0.212,
      scratches_major: 0.494,
      spots_few: 0.336,
      tint_minor: 0.336,
      faded_edges: 0.84,
      spots_many: 1.008,
      chipped: 0.706,
      cracked: 1,
      tint_major: 0.924,
      spots_heavy: 1.4286,
      lines_visible: 1.4286,
      touch_fault: 1.68,
      display_lines: 1.4286,
    },
    // A screen state never takes more than this share of the aged value.
    maxShare: 0.75,
  },

  // What Cashify takes off a cracked screen, in rupees, on each Android phone it was measured on (phone older than 11 months), by brand
  // and model key (androidModelKey). Like an iPhone's, it is the model's own amount, the same on every storage, and every other screen
  // state is a fixed multiple of it (appleScreen.multiples; the multiples are identical on Android). It does not follow the price: an
  // iQOO 15 on 40,950 is 5,950 and a Galaxy S21 on 14,280 is 5,350. A model that is not here is priced on the screen tables below.
  androidScreen: {
    crackRupees: {
      samsunggalaxyzfold8: 28560,
      samsunggalaxys25edge: 10710,
      samsunggalaxys24fe: 5360,
      samsunggalaxys23fe: 6250,
      samsunggalaxys21: 5350,
      samsunggalaxya52: 2260,
      realme15pro: 5600,
      realmep1: 2500,
      realmegtneo2: 2980,
      vivoy28e: 1780,
      opporeno16c: 5950,
      oppof31pro: 4160,
      xiaomi14civi: 5710,
      motorolamotosignature: 11900,
      motorolamotoedge60fusion: 3810,
      oneplusnord6: 5950,
      oneplus10t: 4170,
      oneplusnord2: 3270,
      iqoo15: 5950,
      pocof5: 3220,
      pocom7pro: 2380,
      infinixnote40x: 1190,
      nothingphone3: 5350,
      nothingphone4a: 4760,
      nothingphone3a: 4760,
      nothingphone2a: 4410,
      samsunggalaxys26ultra: 12500,
      samsunggalaxys25ultra: 12500,
      samsunggalaxys23ultra: 9520,
    },
  },
  // A Samsung phone from 20,000 up to 60,000 takes this much of the middle screen table.
  samsungMidFactor: 0.8,

  // What each screen state takes off a phone that is not an iPhone with its own amount, as a share of the aged value, by price
  // range: under 20,000 (low), 20,000 up to 60,000 (mid, reached over 20,000-25,000) and 60,000 and up (high).
  screenTables: {
    low: {
      scratches_minor: 0.065, scratches_major: 0.155, spots_few: 0.10, tint_minor: 0.10, faded_edges: 0.26, spots_many: 0.31, chipped: 0.22,
      cracked: 0.31, tint_major: 0.27, spots_heavy: 0.44, lines_visible: 0.445, touch_fault: 0.51, display_lines: 0.36,
    },
    mid: {
      scratches_minor: 0.076, scratches_major: 0.178, spots_few: 0.121, tint_minor: 0.121, faded_edges: 0.303, spots_many: 0.364, chipped: 0.255,
      cracked: 0.36, tint_major: 0.333, spots_heavy: 0.515, lines_visible: 0.515, touch_fault: 0.594, display_lines: 0.42,
    },
    high: {
      scratches_minor: 0.046, scratches_major: 0.113, spots_few: 0.077, tint_minor: 0.077, faded_edges: 0.19, spots_many: 0.22, chipped: 0.155,
      cracked: 0.229, tint_major: 0.21, spots_heavy: 0.31, lines_visible: 0.31, touch_fault: 0.384, display_lines: 0.31,
    },
  },

  // What body damage takes off, as a share of the aged value: a phone under 60,000, an iPhone from 60,000 and an Android phone from 60,000.
  bodyDamage: {
    standard: { minor_scratches: 0.035, dents_bent: 0.045, panel_broken: 0.11 },
    premiumApple: { minor_scratches: 0.06, dents_bent: 0.10, panel_broken: 0.18 },
    premiumAndroid: { minor_scratches: 0.03, dents_bent: 0.0375, panel_broken: 0.09 },
  },

  // What each declared fault takes off.
  faults: {
    // A share of the aged value. Face ID / fingerprint (biometrics) counts on an iPhone and on an Android phone from 60,000 only.
    share: {
      wifi: 0.40, bluetooth: 0.40, biometrics: 0.27, speaker: 0.03, audio_receiver: 0.03, proximity_sensor: 0.03, silent_button: 0.02,
      microphone: 0.01, volume_button: 0.01, power_button: 0.01, vibrator: 0.01, buttons: 0.01, sensors: 0.03,
    },
    // The least a small fault takes off, in rupees, whatever the price.
    min: { speaker: 600, audio_receiver: 600, silent_button: 300, microphone: 300, volume_button: 300, power_button: 300, vibrator: 300 },
    // What a small fault takes off an Android phone, in rupees, whatever its price (an iPhone keeps its share).
    flatAndroid: { speaker: 450, audio_receiver: 450, vibrator: 300 },
    // A fault that costs a part of the model's repair of one part: the back camera is all of the camera repair, a battery fault a battery.
    repairFactor: { camera_back: 1, camera_front: 0.55, camera_glass: 0.45, battery_fault: 1 },
    // A replaced (non-original) screen, as a share of a cracked screen.
    screenNotOriginalShare: 0.85,
    // A fault with no share of its own takes this share of the price, so it is never ignored.
    unknownShare: 0.08,
    // A phone that cannot make or receive calls is bought for this much: an iPhone or any phone from 20,000 up, and a cheaper Android.
    callsSalvageApple: 1200,
    callsSalvageOther: 800,
  },

  // What a missing accessory takes off, in rupees, and the most that all of them take off a phone under 20,000.
  accessories: { box: 300, charger: 300, bill: 200, lowEndMaxShare: 0.06 },
});

/** The bounds each value must stay within. The admin editor and the server both enforce them. */
export const RULE_LIMITS = deepFreeze({
  age: {
    under3: [0.8, 1.0],
    m3to6: [0.5, 1.0],
    m6to11: [0.5, 1.0],
    over11: [0.5, 1.0],
    oldIphone: [0.5, 1.0],
    samsungOver11: [0.5, 1.0],
    androidOver11: [0.5, 1.0],
    oldAndroid: [0.5, 1.0],
    recentIphone: [0.5, 1.0],
  },
  crackRupees: [500, 50000],
  touchRupees: [500, 80000],
  multiple: [0, 3],
  maxShare: [0.3, 0.9],
  samsungMidFactor: [0.4, 1.2],
  screenShare: [0, 0.9],
  bodyShare: [0, 0.4],
  faultShare: [0, 0.6],
  faultRupees: [0, 5000],
  repairFactor: [0, 2],
  screenNotOriginalShare: [0.3, 1.5],
  unknownShare: [0, 0.3],
  salvage: [0, 5000],
  accessoryRupees: [0, 3000],
  accessoryMaxShare: [0, 0.3],
  maxEntries: 1500,
});

export const SCREEN_STATE_KEYS = Object.freeze(Object.keys(DEFAULT_PRICING_RULES.appleScreen.multiples));

const MODEL_KEY = /^[a-z0-9]{2,40}$/;
const isNumber = (v) => typeof v === 'number' && Number.isFinite(v);
const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const inRange = (v, [lo, hi]) => isNumber(v) && v >= lo && v <= hi;

function checkMap(map, label, range, errors) {
  if (!isPlainObject(map)) {
    errors.push(`${label} must be a list of model amounts.`);
    return;
  }
  const keys = Object.keys(map);
  if (keys.length > RULE_LIMITS.maxEntries) errors.push(`${label} can have at most ${RULE_LIMITS.maxEntries} models.`);
  for (const key of keys) {
    if (!MODEL_KEY.test(key)) errors.push(`${label}: "${key}" is not a valid model key (letters and digits, 2 to 40).`);
    else if (!inRange(map[key], range)) errors.push(`${label}: ${key} must be between ${range[0]} and ${range[1]}.`);
  }
}

// A map whose keys are fixed (screen states, body kinds, faults): every key must be there, none may be added.
function checkFixedMap(map, defaults, label, range, errors) {
  if (!isPlainObject(map)) {
    errors.push(`${label} is missing.`);
    return false;
  }
  for (const key of Object.keys(defaults)) {
    if (!inRange(map[key], range)) errors.push(`${label}: ${key} must be between ${range[0]} and ${range[1]}.`);
  }
  for (const key of Object.keys(map)) {
    if (!(key in defaults)) errors.push(`${label}: "${key}" is not something the quote engine prices.`);
  }
  return true;
}

// Worse damage must not take less off than lighter damage: minor wear <= more scratches <= a crack <= touch not working.
function checkStateOrder(table, label, errors) {
  const order = ['scratches_minor', 'scratches_major', 'cracked', 'touch_fault'];
  for (let i = 1; i < order.length; i++) {
    if (isNumber(table[order[i]]) && isNumber(table[order[i - 1]]) && table[order[i]] < table[order[i - 1]]) {
      errors.push(`${label}: ${order[i]} must not take less off than ${order[i - 1]}.`);
    }
  }
}

function validateExtraRules(rules, errors) {
  const screenTables = rules.screenTables;
  if (!isPlainObject(screenTables)) {
    errors.push('The screen tables by price range are missing.');
  } else {
    for (const tier of ['low', 'mid', 'high']) {
      if (checkFixedMap(screenTables[tier], DEFAULT_PRICING_RULES.screenTables[tier], `Screen table (${tier})`, RULE_LIMITS.screenShare, errors)) {
        checkStateOrder(screenTables[tier], `Screen table (${tier})`, errors);
      }
    }
    for (const key of Object.keys(screenTables)) if (!['low', 'mid', 'high'].includes(key)) errors.push(`Screen table "${key}" is not a price range.`);
  }

  const body = rules.bodyDamage;
  if (!isPlainObject(body)) {
    errors.push('The body damage shares are missing.');
  } else {
    for (const kind of Object.keys(DEFAULT_PRICING_RULES.bodyDamage)) {
      if (checkFixedMap(body[kind], DEFAULT_PRICING_RULES.bodyDamage[kind], `Body damage (${kind})`, RULE_LIMITS.bodyShare, errors)) {
        const t = body[kind];
        if (isNumber(t.minor_scratches) && isNumber(t.dents_bent) && isNumber(t.panel_broken) && !(t.minor_scratches <= t.dents_bent && t.dents_bent <= t.panel_broken)) {
          errors.push(`Body damage (${kind}): a dent must not take less than minor wear, and a broken panel not less than a dent.`);
        }
      }
    }
  }

  const faults = rules.faults;
  if (!isPlainObject(faults)) {
    errors.push('The fault amounts are missing.');
  } else {
    const d = DEFAULT_PRICING_RULES.faults;
    checkFixedMap(faults.share, d.share, 'Fault shares', RULE_LIMITS.faultShare, errors);
    checkFixedMap(faults.min, d.min, 'Fault minimums', RULE_LIMITS.faultRupees, errors);
    checkFixedMap(faults.flatAndroid, d.flatAndroid, 'Android flat fault amounts', RULE_LIMITS.faultRupees, errors);
    checkFixedMap(faults.repairFactor, d.repairFactor, 'Repair part factors', RULE_LIMITS.repairFactor, errors);
    if (!inRange(faults.screenNotOriginalShare, RULE_LIMITS.screenNotOriginalShare)) errors.push(`The replaced-screen share must be between ${RULE_LIMITS.screenNotOriginalShare[0]} and ${RULE_LIMITS.screenNotOriginalShare[1]}.`);
    if (!inRange(faults.unknownShare, RULE_LIMITS.unknownShare)) errors.push(`The share for an unknown fault must be between ${RULE_LIMITS.unknownShare[0]} and ${RULE_LIMITS.unknownShare[1]}.`);
    for (const field of ['callsSalvageApple', 'callsSalvageOther']) {
      if (!inRange(faults[field], RULE_LIMITS.salvage)) errors.push(`${field} must be between ${RULE_LIMITS.salvage[0]} and ${RULE_LIMITS.salvage[1]}.`);
    }
  }

  const accessories = rules.accessories;
  if (!isPlainObject(accessories)) {
    errors.push('The accessory amounts are missing.');
  } else {
    for (const field of ['box', 'charger', 'bill']) {
      if (!inRange(accessories[field], RULE_LIMITS.accessoryRupees)) errors.push(`Accessory ${field} must be between ${RULE_LIMITS.accessoryRupees[0]} and ${RULE_LIMITS.accessoryRupees[1]}.`);
    }
    if (!inRange(accessories.lowEndMaxShare, RULE_LIMITS.accessoryMaxShare)) errors.push(`The most accessories can take off a cheap phone must be between ${RULE_LIMITS.accessoryMaxShare[0]} and ${RULE_LIMITS.accessoryMaxShare[1]}.`);
  }
}

/**
 * Checks a full rules object. Returns every problem found, so the admin sees them all at once.
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validatePricingRules(rules) {
  const errors = [];
  if (!isPlainObject(rules)) return { valid: false, errors: ['The rules must be an object.'] };

  const age = rules.age;
  if (!isPlainObject(age)) {
    errors.push('The age factors are missing.');
  } else {
    for (const field of ['under3', 'm3to6', 'm6to11', 'over11', 'oldIphone', 'samsungOver11', 'androidOver11']) {
      if (!inRange(age[field], RULE_LIMITS.age[field])) errors.push(`Age factor ${field} must be between ${RULE_LIMITS.age[field][0]} and ${RULE_LIMITS.age[field][1]}.`);
    }
    if (isNumber(age.under3) && isNumber(age.m3to6) && isNumber(age.m6to11) && isNumber(age.over11)
      && !(age.under3 >= age.m3to6 && age.m3to6 >= age.m6to11 && age.m6to11 >= age.over11)) {
      errors.push('A phone must not be offered more as it gets older: the age factors must fall from under 3 months to over 11 months.');
    }
    checkMap(age.recentIphone, 'Newest iPhones', RULE_LIMITS.age.recentIphone, errors);
    checkMap(age.oldAndroid, 'Old Android phones', RULE_LIMITS.age.oldAndroid, errors);
  }

  const screen = rules.appleScreen;
  if (!isPlainObject(screen)) {
    errors.push('The iPhone screen amounts are missing.');
  } else {
    checkMap(screen.crackRupees, 'iPhone crack amounts', RULE_LIMITS.crackRupees, errors);
    checkMap(screen.touchRupees, 'iPhone touch amounts', RULE_LIMITS.touchRupees, errors);
    if (!isPlainObject(screen.multiples)) {
      errors.push('The screen state multiples are missing.');
    } else {
      for (const state of SCREEN_STATE_KEYS) {
        if (!inRange(screen.multiples[state], RULE_LIMITS.multiple)) errors.push(`Screen multiple ${state} must be between ${RULE_LIMITS.multiple[0]} and ${RULE_LIMITS.multiple[1]}.`);
      }
      if (screen.multiples.cracked !== 1) errors.push('The multiple for a cracked screen is the base and must stay 1.');
      for (const state of Object.keys(screen.multiples)) {
        if (!SCREEN_STATE_KEYS.includes(state)) errors.push(`Screen multiple "${state}" is not a screen state.`);
      }
    }
    if (!inRange(screen.maxShare, RULE_LIMITS.maxShare)) errors.push(`The most a screen can take must be between ${RULE_LIMITS.maxShare[0]} and ${RULE_LIMITS.maxShare[1]}.`);
  }

  if (!isPlainObject(rules.androidScreen)) {
    errors.push('The Android screen amounts are missing.');
  } else {
    checkMap(rules.androidScreen.crackRupees, 'Android crack amounts', RULE_LIMITS.crackRupees, errors);
  }

  if (!inRange(rules.samsungMidFactor, RULE_LIMITS.samsungMidFactor)) {
    errors.push(`The Samsung factor must be between ${RULE_LIMITS.samsungMidFactor[0]} and ${RULE_LIMITS.samsungMidFactor[1]}.`);
  }
  validateExtraRules(rules, errors);
  return { valid: errors.length === 0, errors };
}

const cleanMap = (map, range) => {
  const out = {};
  if (!isPlainObject(map)) return null;
  for (const [key, value] of Object.entries(map)) {
    if (MODEL_KEY.test(key) && inRange(value, range)) out[key] = value;
  }
  return out;
};

const pickNumber = (value, range, fallback) => (inRange(value, range) ? value : fallback);

// A fixed-key map: each value that is missing or out of bounds is its default.
function resolveFixedMap(saved, defaults, range) {
  const src = isPlainObject(saved) ? saved : {};
  const out = {};
  for (const key of Object.keys(defaults)) out[key] = pickNumber(src[key], range, defaults[key]);
  return out;
}

// A table that was damaged (a crack that takes less than light scratches) is replaced whole, so it cannot price a quote oddly.
function resolveStateTable(saved, defaults, range, order) {
  const table = resolveFixedMap(saved, defaults, range);
  for (let i = 1; i < order.length; i++) if (table[order[i]] < table[order[i - 1]]) return { ...defaults };
  return table;
}

const STATE_ORDER = ['scratches_minor', 'scratches_major', 'cracked', 'touch_fault'];
const BODY_ORDER = ['minor_scratches', 'dents_bent', 'panel_broken'];

/**
 * Turns saved rules (anything, including nothing) into a complete, safe rules object. A value that is missing or out of bounds is
 * replaced by its default, so a damaged record can never change a quote beyond what the bounds allow. Always a fresh object.
 */
export function resolvePricingRules(saved) {
  const d = DEFAULT_PRICING_RULES;
  const s = isPlainObject(saved) ? saved : {};
  const age = isPlainObject(s.age) ? s.age : {};
  const screen = isPlainObject(s.appleScreen) ? s.appleScreen : {};
  const multiples = isPlainObject(screen.multiples) ? screen.multiples : {};

  const brackets = {
    under3: pickNumber(age.under3, RULE_LIMITS.age.under3, d.age.under3),
    m3to6: pickNumber(age.m3to6, RULE_LIMITS.age.m3to6, d.age.m3to6),
    m6to11: pickNumber(age.m6to11, RULE_LIMITS.age.m6to11, d.age.m6to11),
    over11: pickNumber(age.over11, RULE_LIMITS.age.over11, d.age.over11),
  };
  // A bracket set that rises with age is damaged: use the defaults for all four rather than half of each.
  const ordered = brackets.under3 >= brackets.m3to6 && brackets.m3to6 >= brackets.m6to11 && brackets.m6to11 >= brackets.over11;

  const multiplesOut = {};
  for (const state of SCREEN_STATE_KEYS) multiplesOut[state] = pickNumber(multiples[state], RULE_LIMITS.multiple, d.appleScreen.multiples[state]);
  multiplesOut.cracked = 1;

  return {
    age: {
      ...(ordered ? brackets : { under3: d.age.under3, m3to6: d.age.m3to6, m6to11: d.age.m6to11, over11: d.age.over11 }),
      oldIphone: pickNumber(age.oldIphone, RULE_LIMITS.age.oldIphone, d.age.oldIphone),
      samsungOver11: pickNumber(age.samsungOver11, RULE_LIMITS.age.samsungOver11, d.age.samsungOver11),
      androidOver11: pickNumber(age.androidOver11, RULE_LIMITS.age.androidOver11, d.age.androidOver11),
      // Rules saved before this list existed have none, so they get the built-in one; a saved list (even an emptied one) is kept.
      oldAndroid: cleanMap(age.oldAndroid, RULE_LIMITS.age.oldAndroid) ?? { ...d.age.oldAndroid },
      recentIphone: cleanMap(age.recentIphone, RULE_LIMITS.age.recentIphone) ?? { ...d.age.recentIphone },
    },
    appleScreen: {
      crackRupees: cleanMap(screen.crackRupees, RULE_LIMITS.crackRupees) ?? { ...d.appleScreen.crackRupees },
      touchRupees: cleanMap(screen.touchRupees, RULE_LIMITS.touchRupees) ?? { ...d.appleScreen.touchRupees },
      multiples: multiplesOut,
      maxShare: pickNumber(screen.maxShare, RULE_LIMITS.maxShare, d.appleScreen.maxShare),
    },
    androidScreen: {
      crackRupees: cleanMap(s.androidScreen?.crackRupees, RULE_LIMITS.crackRupees) ?? { ...d.androidScreen.crackRupees },
    },
    samsungMidFactor: pickNumber(s.samsungMidFactor, RULE_LIMITS.samsungMidFactor, d.samsungMidFactor),
    screenTables: {
      low: resolveStateTable(s.screenTables?.low, d.screenTables.low, RULE_LIMITS.screenShare, STATE_ORDER),
      mid: resolveStateTable(s.screenTables?.mid, d.screenTables.mid, RULE_LIMITS.screenShare, STATE_ORDER),
      high: resolveStateTable(s.screenTables?.high, d.screenTables.high, RULE_LIMITS.screenShare, STATE_ORDER),
    },
    bodyDamage: {
      standard: resolveStateTable(s.bodyDamage?.standard, d.bodyDamage.standard, RULE_LIMITS.bodyShare, BODY_ORDER),
      premiumApple: resolveStateTable(s.bodyDamage?.premiumApple, d.bodyDamage.premiumApple, RULE_LIMITS.bodyShare, BODY_ORDER),
      premiumAndroid: resolveStateTable(s.bodyDamage?.premiumAndroid, d.bodyDamage.premiumAndroid, RULE_LIMITS.bodyShare, BODY_ORDER),
    },
    faults: {
      share: resolveFixedMap(s.faults?.share, d.faults.share, RULE_LIMITS.faultShare),
      min: resolveFixedMap(s.faults?.min, d.faults.min, RULE_LIMITS.faultRupees),
      flatAndroid: resolveFixedMap(s.faults?.flatAndroid, d.faults.flatAndroid, RULE_LIMITS.faultRupees),
      repairFactor: resolveFixedMap(s.faults?.repairFactor, d.faults.repairFactor, RULE_LIMITS.repairFactor),
      screenNotOriginalShare: pickNumber(s.faults?.screenNotOriginalShare, RULE_LIMITS.screenNotOriginalShare, d.faults.screenNotOriginalShare),
      unknownShare: pickNumber(s.faults?.unknownShare, RULE_LIMITS.unknownShare, d.faults.unknownShare),
      callsSalvageApple: pickNumber(s.faults?.callsSalvageApple, RULE_LIMITS.salvage, d.faults.callsSalvageApple),
      callsSalvageOther: pickNumber(s.faults?.callsSalvageOther, RULE_LIMITS.salvage, d.faults.callsSalvageOther),
    },
    accessories: {
      box: pickNumber(s.accessories?.box, RULE_LIMITS.accessoryRupees, d.accessories.box),
      charger: pickNumber(s.accessories?.charger, RULE_LIMITS.accessoryRupees, d.accessories.charger),
      bill: pickNumber(s.accessories?.bill, RULE_LIMITS.accessoryRupees, d.accessories.bill),
      lowEndMaxShare: pickNumber(s.accessories?.lowEndMaxShare, RULE_LIMITS.accessoryMaxShare, d.accessories.lowEndMaxShare),
    },
  };
}

/** A deep copy that is safe to edit. */
export const cloneRules = (rules) => JSON.parse(JSON.stringify(rules));

/**
 * Every value that differs between two rules objects, for the "what did I change" list.
 * @returns {{ path: string, from: number | undefined, to: number | undefined }[]}
 */
export function diffPricingRules(before, after) {
  const out = [];
  const walk = (a, b, path) => {
    const keys = new Set([...Object.keys(isPlainObject(a) ? a : {}), ...Object.keys(isPlainObject(b) ? b : {})]);
    for (const key of keys) {
      const av = isPlainObject(a) ? a[key] : undefined;
      const bv = isPlainObject(b) ? b[key] : undefined;
      if (isPlainObject(av) || isPlainObject(bv)) walk(av, bv, path ? `${path}.${key}` : key);
      else if (av !== bv) out.push({ path: path ? `${path}.${key}` : key, from: av, to: bv });
    }
  };
  walk(before, after, '');
  return out;
}

const ANDROID_AGE_FIELDS = ['samsungOver11', 'androidOver11', 'oldAndroid'];
const TOP_LEVEL_GROUPS = ['age', 'appleScreen', 'androidScreen', 'samsungMidFactor', 'screenTables', 'bodyDamage', 'faults', 'accessories'];

/**
 * Rules saved before a group existed (a Phase 1 set has no screen tables, body damage, faults or accessories) get that group from the
 * defaults. Only a group that is missing altogether is filled; a value that is there and wrong is left wrong, so validation still sees it.
 */
export function fillMissingGroups(rules) {
  if (!isPlainObject(rules)) return rules;
  const filled = { ...rules };
  for (const group of TOP_LEVEL_GROUPS) {
    if (filled[group] === undefined) filled[group] = cloneRules(DEFAULT_PRICING_RULES[group]);
  }
  // The age group grew after it was first saved: a set without the Android factors gets them from the defaults.
  if (isPlainObject(filled.age)) {
    filled.age = { ...filled.age };
    for (const field of ANDROID_AGE_FIELDS) {
      if (filled.age[field] === undefined) filled.age[field] = cloneRules(DEFAULT_PRICING_RULES.age[field]);
    }
  }
  return filled;
}
