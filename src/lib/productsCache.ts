import type { Product } from '../types';
import { SAMPLE_BEST_SELLING_PHONES } from '../data/sampleProducts';
import { deduplicateProductsByModel } from './modelVariants';

const CACHE_KEY_PHONES = 'fundu_cached_phones_v3';
const CACHE_KEY_LAPTOPS = 'fundu_cached_laptops_v3';

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
      localStorage.setItem(CACHE_KEY_LAPTOPS, JSON.stringify(products));
    }
  } catch (_e) {
    // ignore
  }
}
