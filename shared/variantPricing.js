/**
 * How a listing's price changes with the storage and condition grade the customer picks.
 * One copy of the rules, used by the product page (to show the price) and by the server
 * (to charge it), so the two can never disagree.
 */

const GRADE_MULTIPLIERS = { fair: 0.88, good: 0.95, superb: 1.0 };
const DEFAULT_BASE_STORAGE = '128 GB';
const MIN_STORAGE_GB = 16;
const MAX_STORAGE_GB = 4096;

/** Condition text -> 'fair' | 'good' | 'superb'. 'Excellent' and anything unknown count as superb. */
export const gradeKey = (condition) => {
  const text = String(condition ?? '').toLowerCase();
  if (text.includes('fair')) return 'fair';
  if (text.includes('good')) return 'good';
  return 'superb';
};

/** "256 GB", "256gb", "1 TB" -> gigabytes. 0 when there is no number. */
export const storageGb = (storage) => {
  const text = String(storage ?? '').toLowerCase();
  const number = parseInt(text, 10);
  if (!Number.isFinite(number) || number <= 0) return 0;
  return text.includes('tb') ? number * 1024 : number;
};

/** Price factor for choosing `target` storage on a listing whose own storage is `base`. */
export const storageMultiplier = (target, base = DEFAULT_BASE_STORAGE) => {
  const targetSize = storageGb(target) || 128;
  const baseSize = storageGb(base) || 128;
  if (targetSize === baseSize) return 1.0;
  if (targetSize > baseSize) return Math.round((1 + Math.log2(targetSize / baseSize) * 0.15) * 100) / 100;
  return Math.round((1 - Math.log2(baseSize / targetSize) * 0.12) * 100) / 100;
};

/** True when `storage` is a believable size, so a made-up value cannot price a phone at nearly nothing. */
export const isPlausibleStorage = (storage) => {
  const gb = storageGb(storage);
  return gb >= MIN_STORAGE_GB && gb <= MAX_STORAGE_GB;
};

/**
 * The price for one unit. `listing` = { price, storage } (the saved listing),
 * `choice` = { storage, condition } (what the customer picked).
 */
export const variantPrice = (listing, choice = {}) => {
  const base = Number(listing?.price) || 20000;
  const baseStorage = listing?.storage || DEFAULT_BASE_STORAGE;
  const storage = choice.storage || baseStorage;
  return Math.round(base * storageMultiplier(storage, baseStorage) * GRADE_MULTIPLIERS[gradeKey(choice.condition)]);
};
