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
  // A Samsung phone from 20,000 up to 60,000 takes this much of the middle screen table.
  samsungMidFactor: 0.8,
});

/** The bounds each value must stay within. The admin editor and the server both enforce them. */
export const RULE_LIMITS = deepFreeze({
  age: {
    under3: [0.8, 1.0],
    m3to6: [0.5, 1.0],
    m6to11: [0.5, 1.0],
    over11: [0.5, 1.0],
    oldIphone: [0.5, 1.0],
    recentIphone: [0.5, 1.0],
  },
  crackRupees: [500, 50000],
  touchRupees: [500, 80000],
  multiple: [0, 3],
  maxShare: [0.3, 0.9],
  samsungMidFactor: [0.4, 1.2],
  maxEntries: 300,
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
    for (const field of ['under3', 'm3to6', 'm6to11', 'over11', 'oldIphone']) {
      if (!inRange(age[field], RULE_LIMITS.age[field])) errors.push(`Age factor ${field} must be between ${RULE_LIMITS.age[field][0]} and ${RULE_LIMITS.age[field][1]}.`);
    }
    if (isNumber(age.under3) && isNumber(age.m3to6) && isNumber(age.m6to11) && isNumber(age.over11)
      && !(age.under3 >= age.m3to6 && age.m3to6 >= age.m6to11 && age.m6to11 >= age.over11)) {
      errors.push('A phone must not be offered more as it gets older: the age factors must fall from under 3 months to over 11 months.');
    }
    checkMap(age.recentIphone, 'Newest iPhones', RULE_LIMITS.age.recentIphone, errors);
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

  if (!inRange(rules.samsungMidFactor, RULE_LIMITS.samsungMidFactor)) {
    errors.push(`The Samsung factor must be between ${RULE_LIMITS.samsungMidFactor[0]} and ${RULE_LIMITS.samsungMidFactor[1]}.`);
  }
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
      recentIphone: cleanMap(age.recentIphone, RULE_LIMITS.age.recentIphone) ?? { ...d.age.recentIphone },
    },
    appleScreen: {
      crackRupees: cleanMap(screen.crackRupees, RULE_LIMITS.crackRupees) ?? { ...d.appleScreen.crackRupees },
      touchRupees: cleanMap(screen.touchRupees, RULE_LIMITS.touchRupees) ?? { ...d.appleScreen.touchRupees },
      multiples: multiplesOut,
      maxShare: pickNumber(screen.maxShare, RULE_LIMITS.maxShare, d.appleScreen.maxShare),
    },
    samsungMidFactor: pickNumber(s.samsungMidFactor, RULE_LIMITS.samsungMidFactor, d.samsungMidFactor),
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
