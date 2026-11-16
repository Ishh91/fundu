/**
 * TEST VERSION of a "base price minus fixed deductions" valuation, modelled on what Cashify's
 * calculator returned on 16 Nov 2026. It is not connected to the live quote and changes no price.
 *
 *   price = base - (sum of each issue's deduction) + (+100 for the original box)
 *
 * Deductions add up (they do not multiply), and the phone's age plays no part. Cashify's deductions are
 * rupee amounts that differ per model, so measured models carry their own table and every other model
 * falls back to a percentage of the base price. That fallback was within about 6% on mid-range phones but
 * far off on low-priced ones, so such results carry a warning. Phones from HIGH_PRICE_FROM up lose a
 * smaller share for the same fault, so they use their own rates (measured on four phones).
 */

/** Below this base price the percentage fallback is not reliable (it overshot a Galaxy A32 by up to 49%). */
export const LOW_PRICE_LIMIT = 6000;

/** From this base price Cashify takes a smaller share off for a cracked screen or a camera fault. */
export const HIGH_PRICE_FROM = 45000;

const BOX_BONUS = 100;
const SPEAKER_FIXED = 400;
/** With calls not working Cashify left about 9.5% of the base price. */
const NO_CALLS_KEEP_RATE = 0.095;

/** Share of the base price taken off, for models that were not measured. */
const FALLBACK_RATES = Object.freeze({
  screen_scratch_1_2: 0.075,
  screen_scratch_3_plus: 0.15,
  screen_chipped: 0.215,
  screen_cracked: 0.35,
  body_scratches_3_plus: 0.036,
  dents_minor: 0.036,
  dents_major: 0.048,
  touch: 0.515,
  screen_not_original: 0.23,
  battery: 0.125,
  charging_port: 0.125,
  camera: 0.27,
  wifi: 0.4,
});

/** Share taken off at HIGH_PRICE_FROM and above. Only these items were measured there. */
const HIGH_BAND_RATES = Object.freeze({
  screen_scratch_1_2: 0.055,
  screen_cracked: 0.25,
  camera: 0.115,
});

/** Rupees Cashify took off, read from its calculator. Items missing here use the fallback rate. */
const MEASURED_DEDUCTIONS = Object.freeze({
  'samsung:galaxy a53 5g': Object.freeze({
    screen_scratch_1_2: 530,
    screen_scratch_3_plus: 1230,
    screen_chipped: 1760,
    screen_cracked: 2500,
    body_scratches_3_plus: 290,
    dents_minor: 290,
    dents_major: 390,
    touch: 4200,
    screen_not_original: 1890,
    battery: 1000,
    charging_port: 1000,
    speaker: 400,
    camera: 2500,
    wifi: 3250,
  }),
  'samsung:galaxy s22 5g': Object.freeze({
    screen_scratch_1_2: 1260,
    screen_cracked: 5950,
    battery: 2000,
    speaker: 400,
    camera: 4000,
    wifi: 6540,
  }),
});

const SCREEN_ITEMS = Object.freeze({
  scratch_1_2: 'screen_scratch_1_2',
  scratch_3_plus: 'screen_scratch_3_plus',
  chipped: 'screen_chipped',
  cracked: 'screen_cracked',
});

const FAULT_ITEMS = new Set(['battery', 'charging_port', 'speaker', 'camera', 'wifi']);

const roundTo10 = (value) => Math.round(value / 10) * 10;

/** "samsung:galaxy a53 5g", whatever the case, spacing or repeated brand word. */
const modelKey = (brand, model) => {
  const b = String(brand ?? '').trim().toLowerCase();
  let m = String(model ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
  if (b && m.startsWith(`${b} `)) m = m.slice(b.length + 1);
  return `${b}:${m}`;
};

/** Everything the seller's answers take off, in the order they are applied. */
const appliedItems = (conditions) => {
  const items = [];
  const screen = SCREEN_ITEMS[conditions.screen];
  if (screen) items.push(screen);
  if (conditions.bodyScratches === 'scratch_3_plus') items.push('body_scratches_3_plus');
  if (conditions.dents === 'minor') items.push('dents_minor');
  if (conditions.dents === 'major') items.push('dents_major');
  if (conditions.touchWorks === false) items.push('touch');
  if (conditions.screenOriginal === false) items.push('screen_not_original');
  for (const fault of new Set(conditions.faults ?? [])) {
    if (FAULT_ITEMS.has(fault)) items.push(fault);
  }
  return items;
};

/**
 * @param {object} input
 * @param {string} input.brand
 * @param {string} input.model
 * @param {number} input.base  The flawless price for this model and storage.
 * @param {object} [input.conditions]
 *   callsWork, touchWorks, screenOriginal (booleans, default true);
 *   screen: 'scratch_1_2' | 'scratch_3_plus' | 'chipped' | 'cracked';
 *   bodyScratches: 'scratch_3_plus'; dents: 'minor' | 'major';
 *   faults: any of 'battery', 'charging_port', 'speaker', 'camera', 'wifi'; hasBox: boolean.
 * @returns {{ price: number, deductions: Array<{ item: string, amount: number }>,
 *   basis: 'measured' | 'estimated', warnings: string[] }}
 */
export function additiveValuation({ brand, model, base, conditions = {} }) {
  if (!Number.isFinite(base) || base <= 0) throw new Error('A valid base price is required.');

  const warnings = base < LOW_PRICE_LIMIT
    ? ['Low-priced phone: Cashify deductions are larger than a percentage of the price, so this may be too high.']
    : [];

  if (conditions.callsWork === false) {
    const price = roundTo10(base * NO_CALLS_KEEP_RATE);
    return { price, deductions: [{ item: 'calls_not_working', amount: base - price }], basis: 'estimated', warnings };
  }

  const measured = MEASURED_DEDUCTIONS[modelKey(brand, model)] ?? {};
  const highBand = base >= HIGH_PRICE_FROM;
  let allMeasured = true;
  let highBandGuess = false;
  const deductions = appliedItems(conditions).map((item) => {
    if (measured[item] !== undefined) return { item, amount: measured[item] };
    allMeasured = false;
    if (item === 'speaker') return { item, amount: SPEAKER_FIXED };
    if (highBand && HIGH_BAND_RATES[item] !== undefined) return { item, amount: roundTo10(base * HIGH_BAND_RATES[item]) };
    if (highBand) highBandGuess = true;
    return { item, amount: roundTo10(base * FALLBACK_RATES[item]) };
  });
  if (highBandGuess) {
    warnings.push('High-priced phone: only screen scratches, a cracked screen and a camera fault were measured here; other items use mid-range rates and may take off too much.');
  }

  const taken = deductions.reduce((sum, d) => sum + d.amount, 0);
  const bonus = conditions.hasBox ? BOX_BONUS : 0;
  const price = Math.max(0, roundTo10(base - taken + bonus));

  return { price, deductions, basis: allMeasured ? 'measured' : 'estimated', warnings };
}
