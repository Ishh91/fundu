import { isStorageAllowedForModel, normalizeStorageString } from './deviceSpecs';

interface CardSpecProduct {
  brand?: string | null;
  model?: string | null;
  title?: string | null;
  storage?: string | null;
  available_storages?: string[] | null;
}

/**
 * Storage sizes to show on a listing card. Same rule as the product page: only sizes that really
 * exist for this model, and the listing's own storage when the stored list has nothing usable.
 */
export const cardStorages = (product: CardSpecProduct): string[] => {
  const allowed = (product.available_storages ?? [])
    .map((size) => normalizeStorageString(size))
    .filter((size) => isStorageAllowedForModel(product.brand ?? '', product.model || product.title || '', size));
  const unique = Array.from(new Set(allowed));
  if (unique.length > 0) return unique;
  return product.storage ? [normalizeStorageString(product.storage)] : [];
};

/** iPhones and iPads have no RAM choice for buyers, so the card must not show one. */
export const showsRam = (product: Pick<CardSpecProduct, 'brand' | 'model' | 'title'>): boolean => {
  const text = `${product.brand ?? ''} ${product.model ?? ''} ${product.title ?? ''}`.toLowerCase();
  return !/\b(apple|iphone|ipad)\b/.test(text);
};
