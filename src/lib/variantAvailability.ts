import { entryStock, findVariantEntry, tracksVariantStock } from '../../shared/variantStock.js';
import type { VariantStockEntry } from '../../shared/variantStock.js';

interface StockedListing {
  storage?: string | null;
  color?: string | null;
  variant_stock?: VariantStockEntry[] | null;
}

/**
 * Whether a storage + colour can still be ordered. A listing that does not count stock per variant
 * never blocks a choice here; its single stock number is handled by the listing-level check.
 */
export const variantInStock = (listing: StockedListing | null | undefined, storage: string, color: string): boolean => {
  if (!listing || !tracksVariantStock(listing)) return true;
  return entryStock(findVariantEntry(listing, { storage, color })) > 0;
};

/** True when some colour of this storage is still in stock. */
export const storageInStock = (listing: StockedListing | null | undefined, storage: string, colors: string[]): boolean =>
  colors.some((color) => variantInStock(listing, storage, color));

/** The first storage + colour that is in stock, preferring the given storage; null when everything is sold out. */
export const firstInStockChoice = (
  listing: StockedListing | null | undefined,
  storages: string[],
  colors: string[],
  preferredStorage?: string,
): { storage: string; color: string } | null => {
  const ordered = preferredStorage ? [preferredStorage, ...storages.filter((s) => s !== preferredStorage)] : storages;
  for (const storage of ordered) {
    const color = colors.find((candidate) => variantInStock(listing, storage, candidate));
    if (color !== undefined) return { storage, color };
  }
  return null;
};
