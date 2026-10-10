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
  const m = (model || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${b}:${m}`;
}

export function normalizeName(name?: string): string {
  return (name || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
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
  if (typeof window === 'undefined') return;
  const current = getDeletedModelKeys();
  const fullKey = normalizeModelKey(brand, model);
  const modelOnly = normalizeName(model);

  current.add(fullKey);
  current.add(modelOnly);

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
  if (typeof window === 'undefined') return;
  const current = getDeletedModelKeys();
  const fullKey = normalizeModelKey(brand, model);
  const modelOnly = normalizeName(model);

  current.delete(fullKey);
  current.delete(modelOnly);

  localStorage.setItem(DELETED_MODELS_STORAGE_KEY, JSON.stringify(Array.from(current)));

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

/**
 * Checks if a specific model has been deleted by an admin
 */
export function isModelDeleted(brand?: string, model?: string): boolean {
  if (!model) return false;
  const current = getDeletedModelKeys();
  const fullKey = normalizeModelKey(brand, model);
  const modelOnly = normalizeName(model);

  return current.has(fullKey) || current.has(modelOnly);
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

    const pullDeletedFromDb = () => {
      db.from('sell_price_configs')
        .select('brand, model, is_active')
        .eq('is_active', false)
        .then(({ data }) => {
          if (Array.isArray(data) && data.length > 0) {
            const current = getDeletedModelKeys();
            let changed = false;
            data.forEach((r: any) => {
              if (r.brand && r.model) {
                const k = normalizeModelKey(r.brand, r.model);
                if (!current.has(k)) {
                  current.add(k);
                  current.add(normalizeName(r.model));
                  changed = true;
                }
              }
            });
            if (changed) {
              localStorage.setItem(DELETED_MODELS_STORAGE_KEY, JSON.stringify(Array.from(current)));
              setSyncVersion((v) => v + 1);
            }
          }
        })
        .catch(() => null);
    };

    pullDeletedFromDb();

    // Auto-fetch polling every 10 seconds + on window focus
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        pullDeletedFromDb();
      }
    }, 10000);

    const handleFocus = () => {
      pullDeletedFromDb();
      handleSync();
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
