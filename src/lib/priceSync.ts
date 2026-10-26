import { useEffect, useState } from 'react';
import { db } from './db';
import { broadcastSync, subscribeToRealtimeSync } from './realtimeSync';
import { pullLiveModelImagesFromDb } from './phoneImages';

import { calculateHardwareVariantMultiplier } from './deviceSpecs';

const OVERRIDES_STORAGE_KEY = 'fundu_price_overrides_v1';

export type PriceOverrideItem = {
  brand: string;
  model: string;
  storage?: string;
  base_price: number;
  updated_at: string;
};

/**
 * Reads stored price overrides from LocalStorage
 */
export function getLocalPriceOverrides(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(OVERRIDES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Generates exact storage-specific keys for a brand + model + storage
 */
export function getPriceStorageKeys(brand: string, model: string, storage: string): string[] {
  const b = (brand || '').trim().toLowerCase();
  let m = (model || '').trim().toLowerCase();
  let cleanM = m;
  if (b && cleanM.startsWith(b)) {
    cleanM = cleanM.slice(b.length).trim();
  }

  const models = Array.from(new Set([cleanM, m])).filter(Boolean);
  const s = storage.trim().toLowerCase();
  const sNorm = s.replace(/\s+/g, '');
  const storageVariants = Array.from(new Set([sNorm, s])).filter(Boolean);
  const keys: string[] = [];

  models.forEach((mod) => {
    storageVariants.forEach((stg) => {
      if (b) keys.push(`${b}:${mod}:${stg}`);
      keys.push(`${mod}:${stg}`);
    });
  });

  return keys;
}

/**
 * Generates generic model keys for a brand + model
 */
export function getPriceModelKeys(brand: string, model: string): string[] {
  const b = (brand || '').trim().toLowerCase();
  let m = (model || '').trim().toLowerCase();
  let cleanM = m;
  if (b && cleanM.startsWith(b)) {
    cleanM = cleanM.slice(b.length).trim();
  }

  const models = Array.from(new Set([cleanM, m])).filter(Boolean);
  const keys: string[] = [];

  models.forEach((mod) => {
    if (b) keys.push(`${b}:${mod}`);
    keys.push(mod);
  });

  return keys;
}

/**
 * Generates lookup keys (storage-specific first, then model-wide fallback)
 */
export function getPriceLookupKeys(brand: string, model: string, storage?: string): string[] {
  if (storage) {
    return [...getPriceStorageKeys(brand, model, storage), ...getPriceModelKeys(brand, model)];
  }
  return getPriceModelKeys(brand, model);
}

/**
 * Saves a price override for a specific brand + model (or specific storage)
 */
export function savePriceOverride(brand: string, model: string, newPrice: number, storage?: string) {
  if (typeof window === 'undefined') return;
  const current = getLocalPriceOverrides();
  const saveKeys = storage
    ? getPriceStorageKeys(brand, model, storage)
    : getPriceModelKeys(brand, model);

  saveKeys.forEach((k) => {
    current[k] = newPrice;
  });

  localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(current));

  // Dispatch real-time broadcast across all tabs and open components
  broadcastSync('PRICE_UPDATE', 'sell_price_configs', 'update', { brand, model, storage, newPrice });
  window.dispatchEvent(new CustomEvent('fundu_price_updated', {
    detail: { brand, model, storage, newPrice }
  }));
}

/**
 * Returns effective base price for a model after checking dynamic Admin overrides
 */
export function getEffectivePrice(brand: string, model: string, defaultPrice: number, storage?: string): number {
  const overrides = getLocalPriceOverrides();

  // 1. Exact storage match first
  if (storage) {
    const storageKeys = getPriceStorageKeys(brand, model, storage);
    for (const k of storageKeys) {
      const val = overrides[k];
      if (typeof val === 'number' && val > 0 && val <= 250000) {
        return val;
      }
    }
  }

  // 2. Generic base model match (with dynamic variant scaling if storage requested)
  const modelKeys = getPriceModelKeys(brand, model);
  for (const k of modelKeys) {
    const val = overrides[k];
    if (typeof val === 'number' && val > 0 && val <= 250000) {
      if (storage) {
        const baseMult = calculateHardwareVariantMultiplier('128 GB', '', brand);
        const targetMult = calculateHardwareVariantMultiplier(storage, '', brand);
        const ratio = baseMult > 0 ? targetMult / baseMult : 1.0;
        return Math.max(500, Math.round((val * ratio) / 50) * 50);
      }
      return val;
    }
  }

  if (typeof defaultPrice === 'number' && defaultPrice > 250000) {
    return 50000;
  }

  return defaultPrice;
}

/**
 * Helper to apply dynamic price overrides to any array of phone models
 */
export function applyPriceOverrides<T extends { brand: string; model: string; storage?: string; price?: number; base_resale_value?: number }>(
  items: T[]
): T[] {
  const overrides = getLocalPriceOverrides();
  return items.map((item) => {
    const keys = getPriceLookupKeys(item.brand, item.model, item.storage);
    let overridePrice: number | undefined;

    for (const k of keys) {
      if (typeof overrides[k] === 'number' && overrides[k] > 0) {
        overridePrice = overrides[k];
        break;
      }
    }

    if (overridePrice !== undefined) {
      return {
        ...item,
        price: overridePrice,
        base_resale_value: overridePrice,
      };
    }
    return item;
  });
}

export {
  isModelDeleted,
  markModelAsDeleted,
  restoreModel,
  isProductDeleted,
  markProductAsDeleted,
  useCatalogSync,
} from './catalogSync';

/**
 * Custom React Hook to listen to real-time price changes and model deletions across Admin & Website
 */
export function usePriceSync() {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const handleUpdate = () => {
      setVersion((v) => v + 1);
    };

    const unsubscribeRealtime = subscribeToRealtimeSync((payload) => {
      if (
        payload.action === 'PRICE_UPDATE' ||
        payload.action === 'MODEL_DELETE' ||
        payload.action === 'MODEL_RESTORE' ||
        payload.action === 'MODEL_IMAGE_UPDATE' ||
        payload.table === 'sell_price_configs' ||
        payload.table === 'master_phones'
      ) {
        if (payload.action === 'MODEL_IMAGE_UPDATE' || payload.table === 'master_phones') {
          pullLiveModelImagesFromDb().then(() => handleUpdate());
        }
        handleUpdate();
      }
    });

    window.addEventListener('fundu_price_updated', handleUpdate);
    window.addEventListener('fundu_model_deleted', handleUpdate);
    window.addEventListener('fundu_model_restored', handleUpdate);
    window.addEventListener('fundu_model_image_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    // Function to pull latest sell_price_configs from database
    const pullPriceRules = () => {
      db.from('sell_price_configs')
        .select('*')
        .limit(5000)
        .then(({ data }) => {
          if (Array.isArray(data) && data.length > 0) {
            const current = getLocalPriceOverrides();
            let changed = false;

            // Sort ascending so newest updated rule always wins
            const sortedData = [...data].sort((a: any, b: any) => {
              const ta = new Date(a.updated_at || a.created_at || 0).getTime();
              const tb = new Date(b.updated_at || b.created_at || 0).getTime();
              return ta - tb;
            });

            sortedData.forEach((rule: any) => {
              if (rule.brand && rule.model && typeof rule.base_price === 'number' && rule.base_price > 0) {
                const keys = rule.storage
                  ? getPriceStorageKeys(rule.brand, rule.model, rule.storage)
                  : getPriceModelKeys(rule.brand, rule.model);
                keys.forEach((k) => {
                  if (current[k] !== rule.base_price) {
                    current[k] = rule.base_price;
                    changed = true;
                  }
                });
              }
            });

            if (changed) {
              localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(current));
              setVersion((v) => v + 1);
            }
          }
        })
        .catch(() => null);
    };

    pullPriceRules();

    // Background auto-polling every 8 seconds
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        pullPriceRules();
      }
    }, 8000);

    const handleFocus = () => {
      pullPriceRules();
      handleUpdate();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      unsubscribeRealtime();
      clearInterval(interval);
      window.removeEventListener('fundu_price_updated', handleUpdate);
      window.removeEventListener('fundu_model_deleted', handleUpdate);
      window.removeEventListener('fundu_model_restored', handleUpdate);
      window.removeEventListener('fundu_model_image_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, []);

  return { version, getEffectivePrice, applyPriceOverrides };
}

