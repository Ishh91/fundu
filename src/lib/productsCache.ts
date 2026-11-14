import type { Product } from '../types';
import { SAMPLE_BEST_SELLING_PHONES } from '../data/sampleProducts';
import { deduplicateProductsByModel } from './modelVariants';
import { db } from './db';

const CACHE_KEY_PHONES = 'fundu_cached_phones_v3';
const CACHE_KEY_FEATURED_PHONES = 'fundu_cached_featured_phones_v1';
const CACHE_KEY_LAPTOPS = 'fundu_cached_laptops_v3';

/**
 * Products already loaded on this visit (from a list, or a link the visitor pointed at), by id.
 * The product page shows one of these at once and refreshes it from the server behind the scenes.
 */
const knownProducts = new Map<string, Product>();
const inFlightProducts = new Set<string>();
const MAX_KNOWN_PRODUCTS = 300;

const productKey = (id: unknown): string => String(id ?? '');

/** Remembers every product in `products` that has an id. */
export function rememberProducts(products: readonly Product[]): void {
  for (const product of products) {
    const key = productKey(product?.id);
    if (!key) continue;
    if (knownProducts.size >= MAX_KNOWN_PRODUCTS && !knownProducts.has(key)) {
      const oldest = knownProducts.keys().next().value;
      if (oldest !== undefined) knownProducts.delete(oldest);
    }
    knownProducts.set(key, product);
  }
}

export function getRememberedProduct(id: string | undefined): Product | undefined {
  return id ? knownProducts.get(productKey(id)) : undefined;
}

/** Loads one product ahead of time, e.g. when the visitor points at its link. Does nothing if already known. */
export function prefetchProduct(id: string): void {
  const key = productKey(id);
  if (!key || knownProducts.has(key) || inFlightProducts.has(key)) return;
  inFlightProducts.add(key);
  db.from('products')
    .select('*')
    .eq('id', key)
    .single()
    .then(({ data, error }) => {
      if (!error && data) rememberProducts([data as Product]);
    })
    .catch(() => undefined)
    .finally(() => inFlightProducts.delete(key));
}

/**
 * Returns cached featured products for the Home page.
 * Guarantees only products with is_featured: true are loaded on the home page.
 */
export function getCachedFeaturedPhones(): Product[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(CACHE_KEY_FEATURED_PHONES) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return deduplicateProductsByModel(parsed.filter((p: Product) => p.is_featured));
      }
    }
  } catch (_e) {
    // fallback
  }
  return deduplicateProductsByModel(SAMPLE_BEST_SELLING_PHONES.filter((p) => p.is_featured));
}

export function setCachedFeaturedPhones(products: Product[]): void {
  try {
    if (typeof window !== 'undefined' && Array.isArray(products)) {
      const featured = products.filter((p) => p.is_featured);
      rememberProducts(products);
      localStorage.setItem(CACHE_KEY_FEATURED_PHONES, JSON.stringify(featured));
    }
  } catch (_e) {
    // ignore
  }
}

/**
 * Returns immediately with cached products or default instant sample products.
 * Guarantees 0ms initial load time on the storefront with zero blank screen delay.
 */
export function getCachedPhones(): Product[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(CACHE_KEY_PHONES) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return deduplicateProductsByModel(parsed);
      }
    }
  } catch (_e) {
    // fallback
  }
  return deduplicateProductsByModel(SAMPLE_BEST_SELLING_PHONES);
}

export function setCachedPhones(products: Product[]): void {
  try {
    if (typeof window !== 'undefined' && Array.isArray(products) && products.length > 0) {
      rememberProducts(products);
      localStorage.setItem(CACHE_KEY_PHONES, JSON.stringify(products));
    }
  } catch (_e) {
    // ignore
  }
}

export function getCachedLaptops(): Product[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(CACHE_KEY_LAPTOPS) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return deduplicateProductsByModel(parsed);
      }
    }
  } catch (_e) {
    // ignore
  }
  return [];
}

export function setCachedLaptops(products: Product[]): void {
  try {
    if (typeof window !== 'undefined' && Array.isArray(products) && products.length > 0) {
      rememberProducts(products);
      localStorage.setItem(CACHE_KEY_LAPTOPS, JSON.stringify(products));
    }
  } catch (_e) {
    // ignore
  }
}

