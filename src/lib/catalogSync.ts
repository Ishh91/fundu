import { useEffect, useState } from 'react';
import { db } from './db';
import { broadcastSync, subscribeToRealtimeSync } from './realtimeSync';

const DELETED_MODELS_STORAGE_KEY = 'fundu_deleted_models_v2';
const DELETED_PRODUCTS_STORAGE_KEY = 'fundu_deleted_products_v2';

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
 * Reads the list of deleted model keys from LocalStorage
 */
export function getDeletedModelKeys(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(DELETED_MODELS_STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

/**
 * Reads the list of deleted product IDs / titles from LocalStorage
 */
export function getDeletedProductKeys(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(DELETED_PRODUCTS_STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

/**
 * Marks a phone model as deleted (from Admin panel deletion of Pricing Rule, Catalog, or Repair Config)
 */
export function markModelAsDeleted(brand: string, model: string) {
  if (typeof window === 'undefined' || !model) return;
  const current = getDeletedModelKeys();
  const variants = getModelKeyVariants(brand, model);

  variants.forEach((v) => current.add(v));
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
  // Infinix
  { brand: 'infinix', pattern: /zero\s*30/i, label: 'Infinix zero 30' },
  { brand: 'infinix', pattern: /hot\s*40\s*pro/i, label: 'Infinix hot 40 pro' },
  { brand: 'infinix', pattern: /hot\s*50i/i, label: 'Infinix hot 50i' },
  { brand: 'infinix', pattern: /hot\s*12i/i, label: 'Infinix hot 12i' },

  // OnePlus
  { brand: 'oneplus', pattern: /ace\s*3v/i, label: 'OnePlus ace 3v' },
  { brand: 'oneplus', pattern: /ace\s*2v/i, label: 'OnePlus ace 2v' },
  { brand: 'oneplus', pattern: /nord\s*n30/i, label: 'OnePlus nord n30' },

  // Motorola
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
    const brandMatches = !b || b.includes(t.brand) || (t.brand === 'motorola' && (b === 'moto' || b.includes('motorola')));
    if (brandMatches && t.pattern.test(m)) {
      return true;
    }
  }
  return false;
}

/**
 * Checks if a specific model has been deleted or disabled by an admin
 */
export function isModelDeleted(brand?: string, model?: string): boolean {
  if (!model) return false;
  if (isPermanentlyBlockedModel(brand, model)) return true;

  // If phone is actively verified in live master_phones cache with is_active: true, it cannot be blocked by stale keys
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('fundu_live_master_phones_v2');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const cleanB = (brand || '').toLowerCase().trim();
          const cleanM = (model || '').toLowerCase().trim();
          const match = parsed.find((p: any) => {
            const pb = (p.brand || '').toLowerCase().trim();
            const pm = (p.model || '').toLowerCase().trim();
            return (
              (pb === cleanB || cleanB.includes(pb)) &&
              (pm === cleanM || cleanM.includes(pm) || pm.includes(cleanM))
            );
          });
          if (match) {
            if (match.is_active === false) return true;
            if (match.is_active === true) return false;
          }
        }
      }
    } catch {}
  }

  const current = getDeletedModelKeys();
  if (current.size === 0) return false;

  const variants = getModelKeyVariants(brand, model);
  return variants.some((v) => current.has(v));
}

/**
 * Marks a store product as deleted
 */
export function markProductAsDeleted(productId: string, title?: string) {
  if (typeof window === 'undefined') return;
  const current = getDeletedProductKeys();
  current.add(productId);
  if (title) current.add(normalizeName(title));

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
    const [sellRes, masterRes] = await Promise.all([
      db.from('sell_price_configs').select('brand, model, is_active'),
      db.from('master_phones').select('brand, model, is_active'),
    ]);

    const records = [...(sellRes.data || []), ...(masterRes.data || [])];
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

    if (changed) {
      localStorage.setItem(DELETED_MODELS_STORAGE_KEY, JSON.stringify(Array.from(current)));
      window.dispatchEvent(new CustomEvent('fundu_model_deleted'));
      window.dispatchEvent(new CustomEvent('fundu_model_restored'));
      window.dispatchEvent(new CustomEvent('fundu_price_updated'));
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

    // Auto-fetch polling every 10 seconds + on window focus
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshDeletedModelsFromDb().then(handleSync);
      }
    }, 10000);

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
