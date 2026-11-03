import { useEffect, useState } from 'react';
import { db } from './db';
import { broadcastSync, subscribeToRealtimeSync } from './realtimeSync';
import { API_BASE } from '../config/apiConfig';

const DELETED_MODELS_STORAGE_KEY = 'fundu_deleted_models_v2';
const DELETED_PRODUCTS_STORAGE_KEY = 'fundu_deleted_products_v2';

// High-speed In-Memory Snapshots to avoid repetitive synchronous JSON.parse & localStorage overhead
let cachedDeletedModelKeys: Set<string> | null = null;
let cachedDeletedProductKeys: Set<string> | null = null;
let cachedLivePhonesMap: Map<string, boolean> | null = null;
let cachedPriceOverrides: Record<string, number> | null = null;
let lastSyncCacheRefresh = 0;

export function invalidateCatalogSyncCache() {
  cachedDeletedModelKeys = null;
  cachedDeletedProductKeys = null;
  cachedLivePhonesMap = null;
  cachedPriceOverrides = null;
  lastSyncCacheRefresh = 0;
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (
      !e.key ||
      e.key === DELETED_MODELS_STORAGE_KEY ||
      e.key === DELETED_PRODUCTS_STORAGE_KEY ||
      e.key === 'fundu_live_master_phones_v2' ||
      e.key === 'fundu_price_overrides_v1'
    ) {
      invalidateCatalogSyncCache();
    }
  });
  window.addEventListener('fundu_model_deleted', () => invalidateCatalogSyncCache());
  window.addEventListener('fundu_model_restored', () => invalidateCatalogSyncCache());
  window.addEventListener('fundu_price_updated', () => invalidateCatalogSyncCache());
}

function ensureSyncCachesLoaded() {
  const now = Date.now();
  if (cachedDeletedModelKeys && now - lastSyncCacheRefresh < 15000) {
    return;
  }

  if (typeof window === 'undefined') {
    cachedDeletedModelKeys = new Set();
    cachedDeletedProductKeys = new Set();
    cachedLivePhonesMap = new Map();
    cachedPriceOverrides = {};
    return;
  }

  try {
    const rawDeleted = localStorage.getItem(DELETED_MODELS_STORAGE_KEY);
    cachedDeletedModelKeys = rawDeleted ? new Set(JSON.parse(rawDeleted)) : new Set();
  } catch {
    cachedDeletedModelKeys = new Set();
  }

  try {
    const rawProd = localStorage.getItem(DELETED_PRODUCTS_STORAGE_KEY);
    cachedDeletedProductKeys = rawProd ? new Set(JSON.parse(rawProd)) : new Set();
  } catch {
    cachedDeletedProductKeys = new Set();
  }

  try {
    const rawLive = localStorage.getItem('fundu_live_master_phones_v2');
    const liveMap = new Map<string, boolean>();
    if (rawLive) {
      const parsed = JSON.parse(rawLive);
      if (Array.isArray(parsed)) {
        parsed.forEach((p: any) => {
          if (p && p.brand && p.model && p.is_active !== undefined) {
            const pb = (p.brand || '').toLowerCase().trim();
            const pm = (p.model || '').toLowerCase().trim();
            liveMap.set(`${pb}:${pm}`, Boolean(p.is_active));
            let strippedM = pm;
            if (pb && strippedM.startsWith(pb)) {
              strippedM = strippedM.slice(pb.length).trim();
              liveMap.set(`${pb}:${strippedM}`, Boolean(p.is_active));
            }
          }
        });
      }
    }
    cachedLivePhonesMap = liveMap;
  } catch {
    cachedLivePhonesMap = new Map();
  }

  try {
    const rawOverrides = localStorage.getItem('fundu_price_overrides_v1');
    cachedPriceOverrides = rawOverrides ? JSON.parse(rawOverrides) : {};
  } catch {
    cachedPriceOverrides = {};
  }

  lastSyncCacheRefresh = now;
}

/**
 * Normalizes brand and model names for consistent key lookups
 */
export function normalizeModelKey(brand?: string, model?: string): string {
  const b = (brand || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  let m = (model || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  if (b && m.startsWith(b)) {
    const stripped = m.slice(b.length);
    if (stripped) m = stripped;
  }
  return `${b}:${m}`;
}

export function normalizeName(name?: string, brand?: string): string {
  let n = (name || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  if (brand) {
    const b = (brand || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (b && n.startsWith(b)) {
      const stripped = n.slice(b.length);
      if (stripped) n = stripped;
    }
  }
  return n;
}

/**
 * Returns all key variants for brand + model to ensure matching regardless of brand prefix
 */
export function getModelKeyVariants(brand?: string, model?: string): string[] {
  if (!model) return [];
  const b = (brand || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const m = (model || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const stripped = (b && m.startsWith(b)) ? m.slice(b.length) : m;
  const prefixed = (b && !m.startsWith(b)) ? `${b}${m}` : m;

  const set = new Set<string>();
  if (b) {
    if (stripped) set.add(`${b}:${stripped}`);
    if (m) set.add(`${b}:${m}`);
    if (prefixed) set.add(`${b}:${prefixed}`);
  }
  if (stripped) set.add(stripped);
  if (m) set.add(m);
  if (prefixed) set.add(prefixed);

  return Array.from(set);
}

/**
 * Reads the list of deleted model keys from LocalStorage (with in-memory cache)
 */
export function getDeletedModelKeys(): Set<string> {
  ensureSyncCachesLoaded();
  return cachedDeletedModelKeys || new Set();
}

/**
 * Reads the list of deleted product IDs / titles from LocalStorage (with in-memory cache)
 */
export function getDeletedProductKeys(): Set<string> {
  ensureSyncCachesLoaded();
  return cachedDeletedProductKeys || new Set();
}

/**
 * Marks a phone model as deleted (from Admin panel deletion of Pricing Rule, Catalog, or Repair Config)
 */
export function markModelAsDeleted(brand: string, model: string) {
  if (typeof window === 'undefined' || !model) return;
  const current = getDeletedModelKeys();
  const variants = getModelKeyVariants(brand, model);

  variants.forEach((v) => current.add(v));
  cachedDeletedModelKeys = current;
  localStorage.setItem(DELETED_MODELS_STORAGE_KEY, JSON.stringify(Array.from(current)));

  // Also clean up any lingering local price overrides for this model
  try {
    const rawOverrides = localStorage.getItem('fundu_price_overrides_v1');
    if (rawOverrides) {
      const overrides = JSON.parse(rawOverrides);
      const bKey = brand.trim().toLowerCase();
      const mKey = model.trim().toLowerCase();
      delete overrides[`${bKey}:${mKey}`];
      localStorage.setItem('fundu_price_overrides_v1', JSON.stringify(overrides));
    }
  } catch {}

  // Broadcast real-time events across all tabs and open components
  const fullKey = normalizeModelKey(brand, model);
  broadcastSync('MODEL_DELETE', 'master_phones', 'delete', { brand, model, fullKey });
  window.dispatchEvent(
    new CustomEvent('fundu_model_deleted', {
      detail: { brand, model, fullKey },
    })
  );
  window.dispatchEvent(
    new CustomEvent('fundu_price_updated', {
      detail: { brand, model },
    })
  );
}

/**
 * Restores a deleted model
 */
export function restoreModel(brand: string, model: string) {
  if (typeof window === 'undefined' || !model) return;
  const current = getDeletedModelKeys();
  const variants = getModelKeyVariants(brand, model);

  variants.forEach((v) => current.delete(v));
  cachedDeletedModelKeys = current;
  localStorage.setItem(DELETED_MODELS_STORAGE_KEY, JSON.stringify(Array.from(current)));

  const fullKey = normalizeModelKey(brand, model);
  broadcastSync('MODEL_RESTORE', 'master_phones', 'restore', { brand, model, fullKey });
  window.dispatchEvent(
    new CustomEvent('fundu_model_restored', {
      detail: { brand, model, fullKey },
    })
  );
  window.dispatchEvent(
    new CustomEvent('fundu_price_updated', {
      detail: { brand, model },
    })
  );
}

export const PERMANENTLY_BLOCKED_TARGETS = [
  // OnePlus (Requested removals)
  { brand: 'oneplus', pattern: /\b8\s*5g\s*uw\b/i, label: 'OnePlus 8 5G UW' },

  // Xiaomi / Redmi (Requested removals)
  { brand: 'xiaomi', pattern: /note\s*12t\s*pro/i, label: 'Redmi Note 12T Pro' },
  { brand: 'redmi', pattern: /note\s*12t\s*pro/i, label: 'Redmi Note 12T Pro' },
  { brand: 'xiaomi', pattern: /note\s*13r\s*pro/i, label: 'Redmi Note 13R Pro' },
  { brand: 'redmi', pattern: /note\s*13r\s*pro/i, label: 'Redmi Note 13R Pro' },
  { brand: 'xiaomi', pattern: /note\s*12r\s*pro/i, label: 'Redmi Note 12R Pro' },
  { brand: 'redmi', pattern: /note\s*12r\s*pro/i, label: 'Redmi Note 12R Pro' },
  { brand: 'xiaomi', pattern: /note\s*11e(?:\s*pro)?\b/i, label: 'Redmi Note 11E / Note 11E Pro' },
  { brand: 'redmi', pattern: /note\s*11e(?:\s*pro)?\b/i, label: 'Redmi Note 11E / Note 11E Pro' },
  { brand: 'xiaomi', pattern: /note\s*11r\b/i, label: 'Redmi Note 11R' },
  { brand: 'redmi', pattern: /note\s*11r\b/i, label: 'Redmi Note 11R' },
  { brand: 'xiaomi', pattern: /\b9\s*active\b/i, label: 'Redmi 9 Active' },
  { brand: 'redmi', pattern: /\b9\s*active\b/i, label: 'Redmi 9 Active' },
  { brand: 'xiaomi', pattern: /\ba7\s*(?:plus|\+)\b/i, label: 'Redmi A7 Plus' },
  { brand: 'redmi', pattern: /\ba7\s*(?:plus|\+)\b/i, label: 'Redmi A7 Plus' },
  { brand: 'xiaomi', pattern: /note\s*11s\b/i, label: 'Redmi Note 11S' },
  { brand: 'redmi', pattern: /note\s*11s\b/i, label: 'Redmi Note 11S' },
  { brand: 'xiaomi', pattern: /(?:note\s*10t\s*pro|mi\s*10t\s*pro|10t\s*pro)/i, label: 'Redmi Note 10T Pro / Mi 10T Pro' },
  { brand: 'redmi', pattern: /(?:note\s*10t\s*pro|mi\s*10t\s*pro|10t\s*pro)/i, label: 'Redmi Note 10T Pro / Mi 10T Pro' },
  { brand: 'xiaomi', pattern: /note\s*13r\b(?!\s*pro)/i, label: 'Redmi Note 13R' },
  { brand: 'redmi', pattern: /note\s*13r\b(?!\s*pro)/i, label: 'Redmi Note 13R' },
  { brand: 'xiaomi', pattern: /note\s*12s\b/i, label: 'Redmi Note 12S' },
  { brand: 'redmi', pattern: /note\s*12s\b/i, label: 'Redmi Note 12S' },
  { brand: 'xiaomi', pattern: /note\s*12r\b(?!\s*pro)/i, label: 'Redmi Note 12R' },
  { brand: 'redmi', pattern: /note\s*12r\b(?!\s*pro)/i, label: 'Redmi Note 12R' },
  { brand: 'xiaomi', pattern: /(?:^|\b)(?:xiaomi\s*|mi\s*)13(?:\s*5g|\s*4g)?(?!\s*(?:pro|ultra|t\b|t\s*pro|c\b|r\b|x\b|lite|s\b))(?:$|\b)/i, label: 'Xiaomi 13 base' },
  { brand: 'xiaomi', pattern: /\b13\s*lite\b/i, label: 'Xiaomi 13 Lite' },
  { brand: 'xiaomi', pattern: /\b12\s*lite\b/i, label: 'Xiaomi 12 Lite' },
  { brand: 'xiaomi', pattern: /\bcivi\s*3\b/i, label: 'Xiaomi Civi 3' },

  // Vivo (Requested removals)
  { brand: 'vivo', pattern: /\bnex\s*dual\s*display\b/i, label: 'Vivo NEX Dual Display Edition' },
  { brand: 'vivo', pattern: /\b(?:vivo\s+)?y\s*65\b/i, label: 'Vivo Y65' },
  { brand: 'vivo', pattern: /\b(?:vivo\s+)?y\s*55\s*l\b/i, label: 'Vivo Y55L' },
  { brand: 'vivo', pattern: /\b(?:vivo\s+)?y\s*55\b(?!\s*s\s*5g)/i, label: 'Vivo Y55' },
  { brand: 'vivo', pattern: /\b(?:vivo\s+)?y\s*51\s*l\b/i, label: 'Vivo Y51L' },
  { brand: 'vivo', pattern: /\b(?:vivo\s+)?y\s*31\s*l\b/i, label: 'Vivo Y31L' },
  { brand: 'vivo', pattern: /\b(?:vivo\s+)?y\s*27\s*l\b/i, label: 'Vivo Y27L' },
  { brand: 'vivo', pattern: /\b(?:vivo\s+)?y\s*25\b/i, label: 'Vivo Y25' },
  { brand: 'vivo', pattern: /\b(?:vivo\s+)?y\s*21\s*l\b/i, label: 'Vivo Y21L' },
  { brand: 'vivo', pattern: /\b(?:vivo\s+)?y\s*19\s*e\b/i, label: 'Vivo Y19e' },
  { brand: 'vivo', pattern: /\b(?:vivo\s+)?y\s*15\s*[sc]\b/i, label: 'Vivo Y15s / Y15c' },
  { brand: 'vivo', pattern: /\b(?:vivo\s+)?y\s*11\b(?!\s*5g)/i, label: 'Vivo Y11 original' },
  { brand: 'vivo', pattern: /\b(?:vivo\s+)?y\s*03[t]?\b/i, label: 'Vivo Y03 / Y03t' },
  { brand: 'vivo', pattern: /\b(?:vivo\s+)?y\s*02[sa]\b/i, label: 'Vivo Y02s / Y02a' },
  { brand: 'vivo', pattern: /\b(?:vivo\s+)?x\s*21\s*ud\b/i, label: 'Vivo X21 UD' },
  { brand: 'vivo', pattern: /\b(?:vivo\s+)?v[1-3](?:\s*(?:max|plus))?\b(?!\d)/i, label: 'Vivo V3 and below (V1, V1 Max, V3, V3 Max)' },

  // Poco / Xiaomi GT models requested for complete removal
  { brand: 'poco', pattern: /x3\s*gt/i, label: 'POCO X3 GT' },
  { brand: 'poco', pattern: /x4\s*gt/i, label: 'POCO X4 GT' },
  { brand: 'poco', pattern: /f3\s*gt/i, label: 'POCO F3 GT' },
  { brand: 'poco', pattern: /f4\s*gt/i, label: 'POCO F4 GT' },
  { brand: 'xiaomi', pattern: /x3\s*gt/i, label: 'Xiaomi POCO X3 GT' },
  { brand: 'xiaomi', pattern: /x4\s*gt/i, label: 'Xiaomi POCO X4 GT' },
  { brand: 'xiaomi', pattern: /f3\s*gt/i, label: 'Xiaomi POCO F3 GT' },
  { brand: 'xiaomi', pattern: /f4\s*gt/i, label: 'Xiaomi POCO F4 GT' },
  { brand: 'xiaomi', pattern: /note\s*12\s*turbo/i, label: 'Redmi Note 12 Turbo' },
  { brand: 'redmi', pattern: /note\s*12\s*turbo/i, label: 'Redmi Note 12 Turbo' },
  { brand: 'xiaomi', pattern: /discovery\s*edition/i, label: 'Redmi Note 12 Discovery Edition' },
  { brand: 'redmi', pattern: /discovery\s*edition/i, label: 'Redmi Note 12 Discovery Edition' },
  { brand: 'xiaomi', pattern: /note\s*10\s*je\b/i, label: 'Redmi Note 10 JE' },
  { brand: 'redmi', pattern: /note\s*10\s*je\b/i, label: 'Redmi Note 10 JE' },

  // iQOO / Vivo (Requested removals)
  { brand: 'iqoo', pattern: /z9\s*turbo/i, label: 'iQOO Z9 Turbo' },
  { brand: 'vivo', pattern: /z9\s*turbo/i, label: 'Vivo iQOO Z9 Turbo' },

  // Oppo (Requested removals)
  { brand: 'oppo', pattern: /find\s*x7\s*ultra/i, label: 'Oppo Find X7 Ultra' },

  // Apple (Antique / Obsolete classic models and oversized iPads requested for removal)
  { brand: 'apple', pattern: /\b(?:apple\s*)?iphone\s*(?:(?:[1-5]|2g|3g|3gs)[sc]?|original)\b/i, label: 'iPhone 5s and older classic series' },
  { brand: 'apple', pattern: /\bipad\s*(?:pro\s*13|air\s*13|10\.9)\b/i, label: 'iPad Pro 13, iPad Air 13, iPad 10.9' },

  // Infinix models requested for complete removal
  { brand: 'infinix', pattern: /hot\s*20i/i, label: 'Infinix Hot 20i' },
  { brand: 'infinix', pattern: /hot\s*20s/i, label: 'Infinix Hot 20s' },
  { brand: 'infinix', pattern: /hot\s*20\s*s/i, label: 'Infinix Hot 20 S' },
  { brand: 'infinix', pattern: /zero\s*30/i, label: 'Infinix zero 30' },
  { brand: 'infinix', pattern: /hot\s*40\s*pro/i, label: 'Infinix hot 40 pro' },
  { brand: 'infinix', pattern: /hot\s*50i/i, label: 'Infinix hot 50i' },
  { brand: 'infinix', pattern: /hot\s*12i/i, label: 'Infinix hot 12i' },

  // OnePlus
  { brand: 'oneplus', pattern: /ace\s*3v/i, label: 'OnePlus ace 3v' },
  { brand: 'oneplus', pattern: /ace\s*2v/i, label: 'OnePlus ace 2v' },
  { brand: 'oneplus', pattern: /nord\s*n30/i, label: 'OnePlus nord n30' },

  // Motorola
  { brand: 'motorola', pattern: /\b(?:moto\s*)?g\s*(?:0?[1-9]s?|10)\b|\bmoto\s*g\b(?!\s*(?:1[1-9]|[2-9]\d|\d{3}))/i, label: 'Motorola Moto G10 and below' },
  { brand: 'motorola', pattern: /razr\s*60/i, label: 'Motorola razr 60' },
  { brand: 'motorola', pattern: /razr\s*50\s*ultra/i, label: 'Motorola razr 50 ultra' },
  { brand: 'motorola', pattern: /razr\s*40\s*ultra/i, label: 'Motorola razr 40 ultra' },
  { brand: 'motorola', pattern: /razr\s*40(?!\s*ultra)/i, label: 'Motorola razr 40' },
  { brand: 'motorola', pattern: /edge\s*50\s*fusion/i, label: 'Motorola edge 50 fusion' },
  { brand: 'motorola', pattern: /edge\s*40\s*pro/i, label: 'Motorola edge 40 pro' },
  { brand: 'motorola', pattern: /edge\s*40\s*neo/i, label: 'Motorola edge 40 neo' },
  { brand: 'motorola', pattern: /edge\s*40(?!\s*pro|\s*neo)/i, label: 'Motorola edge 40' },
  { brand: 'motorola', pattern: /edge\s*30\s*ultra/i, label: 'Motorola edge 30 ultra' },
  { brand: 'motorola', pattern: /edge\s*30\s*fusion/i, label: 'Motorola edge 30 fusion' },
  { brand: 'motorola', pattern: /edge\s*30(?!\s*ultra|\s*fusion|\s*pro|\s*neo|\s*lite)/i, label: 'Motorola edge 30' },
  { brand: 'motorola', pattern: /edge\s*s\s*30|edge\s*s30/i, label: 'Motorola edge s 30' },
  { brand: 'motorola', pattern: /backflip/i, label: 'Motorola backflip' },
  { brand: 'motorola', pattern: /droid\s*x2|drodix\s*x2/i, label: 'Motorola DRODIX X2' },
  { brand: 'motorola', pattern: /atrix\s*hd/i, label: 'Motorola Atrix HD' },
  { brand: 'motorola', pattern: /mc9500/i, label: 'Motorola MC9500-K' },
];

export function isPermanentlyBlockedModel(brand?: string, model?: string): boolean {
  if (!model) return false;
  const b = (brand || '').toLowerCase().trim();
  const m = (model || '').toLowerCase().trim();
  for (const t of PERMANENTLY_BLOCKED_TARGETS) {
    const isPocoXiaomi = (t.brand === 'poco' || t.brand === 'xiaomi') && (b === 'poco' || b === 'xiaomi' || b.includes('poco') || b.includes('xiaomi'));
    const isMoto = t.brand === 'motorola' && (b === 'moto' || b.includes('motorola'));
    const brandMatches = !b || isPocoXiaomi || isMoto || b.includes(t.brand) || t.brand.includes(b);
    if (brandMatches && t.pattern.test(m)) {
      return true;
    }
  }
  return false;
}

/**
 * Checks if a specific model has been deleted or disabled by an admin (O(1) in-memory lookup)
 */
export function isModelDeleted(brand?: string, model?: string): boolean {
  if (!model) return false;
  if (isPermanentlyBlockedModel(brand, model)) return true;

  ensureSyncCachesLoaded();

  // 1. If phone is actively verified in live master_phones cache with is_active: true, it cannot be blocked by stale keys
  if (cachedLivePhonesMap && cachedLivePhonesMap.size > 0) {
    const cleanB = (brand || '').toLowerCase().trim();
    const cleanM = (model || '').toLowerCase().trim();
    let strippedM = cleanM;
    if (cleanB && strippedM.startsWith(cleanB)) {
      strippedM = strippedM.slice(cleanB.length).trim();
    }
    const isActiveDirect = cachedLivePhonesMap.get(`${cleanB}:${cleanM}`);
    const isActiveStripped = strippedM ? cachedLivePhonesMap.get(`${cleanB}:${strippedM}`) : undefined;
    const activeStatus = isActiveDirect !== undefined ? isActiveDirect : isActiveStripped;

    if (activeStatus === false) return true;
    if (activeStatus === true) return false;
  }

  // 2. Also check if admin has an explicit active price override for this model
  if (cachedPriceOverrides && Object.keys(cachedPriceOverrides).length > 0) {
    const variants = getModelKeyVariants(brand, model);
    const hasActiveOverride = variants.some((v) => typeof cachedPriceOverrides![v] === 'number' && cachedPriceOverrides![v] > 0);
    if (hasActiveOverride) {
      return false;
    }
  }

  if (!cachedDeletedModelKeys || cachedDeletedModelKeys.size === 0) return false;

  const variants = getModelKeyVariants(brand, model);
  return variants.some((v) => cachedDeletedModelKeys!.has(v));
}

/**
 * Marks a store product as deleted
 */
export function markProductAsDeleted(productId: string, title?: string) {
  if (typeof window === 'undefined') return;
  const current = getDeletedProductKeys();
  current.add(productId);
  if (title) current.add(normalizeName(title));
  cachedDeletedProductKeys = current;

  localStorage.setItem(DELETED_PRODUCTS_STORAGE_KEY, JSON.stringify(Array.from(current)));

  broadcastSync('PRODUCT_UPDATE', 'products', 'delete', { productId, title });
  window.dispatchEvent(
    new CustomEvent('fundu_product_deleted', {
      detail: { productId, title },
    })
  );
}

/**
 * Checks if a store product is deleted
 */
export function isProductDeleted(productId?: string, title?: string): boolean {
  if (!productId && !title) return false;
  const current = getDeletedProductKeys();
  if (productId && current.has(productId)) return true;
  if (title && current.has(normalizeName(title))) return true;
  return false;
}

/**
 * Pulls all disabled/inactive models from MongoDB tables and synchronizes local storage
 */
export async function refreshDeletedModelsFromDb(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const [sellRes, masterRes, disabledRes] = await Promise.all([
      db.from('sell_price_configs').select('brand, model, is_active'),
      db.from('master_phones').select('brand, model, is_active'),
      fetch(`${API_BASE}/sell/disabled-models`).then((r) => r.json()).catch(() => ({ disabledModels: [] })),
    ]);

    const records = [...(sellRes.data || []), ...(masterRes.data || [])];
    const serverDisabled = disabledRes?.disabledModels || [];
    const current = getDeletedModelKeys();
    let changed = false;

    // 1. Remove any models from deleted set that are explicitly active in DB
    records.forEach((r: any) => {
      if (r.brand && r.model && r.is_active === true) {
        const variants = getModelKeyVariants(r.brand, r.model);
        variants.forEach((v) => {
          if (current.has(v)) {
            current.delete(v);
            changed = true;
          }
        });
      }
    });

    // 2. Add any models that are explicitly marked inactive in DB
    records.forEach((r: any) => {
      if (r.brand && r.model && r.is_active === false) {
        const variants = getModelKeyVariants(r.brand, r.model);
        variants.forEach((v) => {
          if (!current.has(v)) {
            current.add(v);
            changed = true;
          }
        });
      }
    });

    // 3. Add any models from the authoritative server disabled list
    serverDisabled.forEach((d: any) => {
      if (d.brand && d.model) {
        const variants = getModelKeyVariants(d.brand, d.model);
        variants.forEach((v) => {
          if (!current.has(v)) {
            current.add(v);
            changed = true;
          }
        });
      }
    });

    if (changed) {
      localStorage.setItem(DELETED_MODELS_STORAGE_KEY, JSON.stringify(Array.from(current)));
      window.dispatchEvent(new CustomEvent('fundu_model_deleted'));
      window.dispatchEvent(new CustomEvent('fundu_model_restored'));
      window.dispatchEvent(new CustomEvent('fundu_price_updated'));
      window.dispatchEvent(new CustomEvent('fundu_catalog_synced'));
    }
  } catch {}
}

// Background sync on browser load after initial paint
if (typeof window !== 'undefined') {
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => refreshDeletedModelsFromDb(), { timeout: 3000 });
  } else {
    setTimeout(() => refreshDeletedModelsFromDb(), 1800);
  }
}

/**
 * Custom React hook for real-time live synchronization of deleted models across website components
 */
export function useCatalogSync() {
  const [syncVersion, setSyncVersion] = useState(0);

  useEffect(() => {
    const handleSync = () => {
      setSyncVersion((v) => v + 1);
    };

    const unsubscribeRealtime = subscribeToRealtimeSync((payload) => {
      if (
        payload.action === 'MODEL_DELETE' ||
        payload.action === 'MODEL_RESTORE' ||
        payload.action === 'PRODUCT_UPDATE' ||
        payload.table === 'master_phones' ||
        payload.table === 'sell_price_configs' ||
        payload.table === 'products'
      ) {
        handleSync();
      }
    });

    window.addEventListener('fundu_model_deleted', handleSync);
    window.addEventListener('fundu_model_restored', handleSync);
    window.addEventListener('fundu_product_deleted', handleSync);
    window.addEventListener('storage', handleSync);

    refreshDeletedModelsFromDb().then(handleSync);

    // Auto-fetch polling every 60 seconds (realtime events handle instant updates)
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshDeletedModelsFromDb().then(handleSync);
      }
    }, 60000);

    const handleFocus = () => {
      refreshDeletedModelsFromDb().then(handleSync);
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      unsubscribeRealtime();
      clearInterval(interval);
      window.removeEventListener('fundu_model_deleted', handleSync);
      window.removeEventListener('fundu_model_restored', handleSync);
      window.removeEventListener('fundu_product_deleted', handleSync);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, []);

  return {
    syncVersion,
    isModelDeleted,
    isProductDeleted,
    markModelAsDeleted,
    restoreModel,
    markProductAsDeleted,
  };
}
