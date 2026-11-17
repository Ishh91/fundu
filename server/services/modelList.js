// The brands and models an admin can pick in the quote rules preview, built from the sell price rows (the rows quotes are priced from).
// The sell price rows were filled over time and are not tidy: one model is spelled two ways ("iPhone 16 Pro Max", "iPhone 16 Pro max"), a
// storage is "128 GB", "128GB" or "256", and a Redmi Note is filed under Apple. The list the admin sees cleans that up without changing a row.

const STORAGE = /^(\d+(?:\.\d+)?)\s*(gb|tb)?$/i;
const MAKES_REDMI = new Set(['xiaomi', 'redmi', 'poco']);

/** "128GB" and "256" become "128 GB" and "256 GB"; "1tb" becomes "1 TB". Anything that is not a size is null. */
export function normalizeStorageLabel(value) {
  const text = typeof value === 'number' && value > 0 ? String(value) : value;
  if (typeof text !== 'string') return null;
  const match = STORAGE.exec(text.trim());
  if (!match) return null;
  return `${match[1]} ${(match[2] || 'gb').toUpperCase()}`;
}

const storageSize = (label) => {
  const [amount, unit] = label.split(' ');
  return Number(amount) * (unit === 'TB' ? 1024 : 1);
};

const clean = (value) => (typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '');
const keyOf = (value) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
const isMixedCase = (text) => text !== text.toLowerCase() && text !== text.toUpperCase();

/** The spelling most rows use; between equals, one that is not all lower or all upper case, then the first alphabetically. */
function bestSpelling(counts) {
  return [...counts.entries()]
    .sort(([a, countA], [b, countB]) => countB - countA || Number(isMixedCase(b)) - Number(isMixedCase(a)) || a.localeCompare(b))[0][0];
}

const bump = (map, key) => map.set(key, (map.get(key) || 0) + 1);

/** A row that cannot be a real phone of its brand: a Redmi Note under Apple, or under a brand that does not make Redmis. */
function isMisfiled(brandKey, model) {
  if (brandKey === 'apple') return !/iphone/i.test(model);
  return /redmi/i.test(model) && !MAKES_REDMI.has(brandKey);
}

/**
 * @param {unknown} rows the active sell price rows ({ brand, model, storage })
 * @returns {{ brand: string, models: { model: string, storages: string[] }[] }[]} brands A to Z, each with its models in reading order
 */
export function buildModelList(rows) {
  if (!Array.isArray(rows)) return [];
  const brands = new Map(); // brand key -> { spellings: Map, models: Map }

  for (const row of rows) {
    if (!row || typeof row !== 'object') continue;
    const brand = clean(row.brand);
    const model = clean(row.model);
    const brandKey = keyOf(brand);
    const modelKey = keyOf(model);
    if (!brandKey || !modelKey || isMisfiled(brandKey, model)) continue;

    if (!brands.has(brandKey)) brands.set(brandKey, { spellings: new Map(), models: new Map() });
    const entry = brands.get(brandKey);
    bump(entry.spellings, brand);
    if (!entry.models.has(modelKey)) entry.models.set(modelKey, { spellings: new Map(), storages: new Set() });
    const phone = entry.models.get(modelKey);
    bump(phone.spellings, model);
    const storage = normalizeStorageLabel(row.storage);
    if (storage) phone.storages.add(storage);
  }

  const byName = (a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  return [...brands.values()]
    .map((entry) => ({
      brand: bestSpelling(entry.spellings),
      models: [...entry.models.values()]
        .map((phone) => ({ model: bestSpelling(phone.spellings), storages: [...phone.storages].sort((a, b) => storageSize(a) - storageSize(b)) }))
        .sort((a, b) => byName(a.model, b.model)),
    }))
    .sort((a, b) => byName(a.brand, b.brand));
}
