/**
 * Stock kept per storage + colour. A listing that has a `variant_stock` list counts each
 * combination on its own; a listing without one keeps using its single `stock` number.
 * Shared so the product page and the server read the same stock the same way.
 */
import { storageGb } from './variantPricing.js';

const normalizeText = (value) => String(value ?? '').trim().toLowerCase();

/** True when the listing counts stock per variant. */
export const tracksVariantStock = (doc) => Array.isArray(doc?.variant_stock) && doc.variant_stock.length > 0;

/** The entry for the customer's storage + colour (a listing's own values when none is given), or null. */
export const findVariantEntry = (doc, choice = {}) => {
  if (!tracksVariantStock(doc)) return null;
  const gb = storageGb(choice.storage || doc.storage);
  const color = normalizeText(choice.color || doc.color);
  return (
    doc.variant_stock.find((entry) => {
      const sameStorage = !storageGb(entry.storage) || storageGb(entry.storage) === gb;
      const sameColor = !normalizeText(entry.color) || normalizeText(entry.color) === color;
      return sameStorage && sameColor;
    }) || null
  );
};

/** Whole-number units left for one entry; never negative. */
export const entryStock = (entry) => Math.max(0, Math.floor(Number(entry?.stock) || 0));

/** Units in the whole list. */
export const totalVariantStock = (entries) =>
  (Array.isArray(entries) ? entries : []).reduce((sum, entry) => sum + entryStock(entry), 0);

/** Tidies a list from a form: trimmed text, whole non-negative stock, one entry per storage + colour. */
export const cleanVariantStock = (entries) => {
  const merged = new Map();
  for (const entry of Array.isArray(entries) ? entries : []) {
    const storage = String(entry?.storage ?? '').trim();
    const color = String(entry?.color ?? '').trim();
    if (!storage && !color) continue;
    const key = `${storageGb(storage) || normalizeText(storage)}|${normalizeText(color)}`;
    const previous = merged.get(key);
    merged.set(key, { storage: previous?.storage ?? storage, color: previous?.color ?? color, stock: (previous?.stock || 0) + entryStock(entry) });
  }
  return [...merged.values()];
};
