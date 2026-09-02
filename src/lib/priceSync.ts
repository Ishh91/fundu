import { useEffect, useState } from 'react';
import { db } from './db';

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
 * Saves a price override for a specific brand + model (or storage)
 */
export function savePriceOverride(brand: string, model: string, newPrice: number, storage?: string) {
  if (typeof window === 'undefined') return;
  const current = getLocalPriceOverrides();
  const key = `${brand.trim().toLowerCase()}:${model.trim().toLowerCase()}`;
  current[key] = newPrice;
  
  if (storage) {
    const keyWithStorage = `${key}:${storage.trim().toLowerCase()}`;
    current[keyWithStorage] = newPrice;
  }

  localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(current));

  // Dispatch custom window event for real-time live UI updates across components
  window.dispatchEvent(new CustomEvent('fundu_price_updated', {
    detail: { brand, model, storage, newPrice }
  }));
}

/**
 * Returns effective base price for a model after checking dynamic Admin overrides
 */
export function getEffectivePrice(brand: string, model: string, defaultPrice: number, storage?: string): number {
  const overrides = getLocalPriceOverrides();
  const key = `${brand.trim().toLowerCase()}:${model.trim().toLowerCase()}`;
  
  if (storage) {
    const keyWithStorage = `${key}:${storage.trim().toLowerCase()}`;
    if (overrides[keyWithStorage] !== undefined) {
      return overrides[keyWithStorage];
    }
  }

  if (overrides[key] !== undefined) {
    return overrides[key];
  }

  return defaultPrice;
}

/**
 * Helper to apply dynamic price overrides to any array of phone models
 */
export function applyPriceOverrides<T extends { brand: string; model: string; price?: number; base_resale_value?: number }>(
  items: T[]
): T[] {
  const overrides = getLocalPriceOverrides();
  return items.map((item) => {
    const key = `${item.brand.trim().toLowerCase()}:${item.model.trim().toLowerCase()}`;
    const overridePrice = overrides[key];
    
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

/**
 * Custom React Hook to listen to real-time price changes across Admin & Website
 */
export function usePriceSync() {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const handleUpdate = () => {
      setVersion((v) => v + 1);
    };

    window.addEventListener('fundu_price_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    // Initial fetch of sell_price_configs from database to populate overrides
    db.from('sell_price_configs')
      .select('*')
      .then(({ data }) => {
        if (Array.isArray(data) && data.length > 0) {
          const current = getLocalPriceOverrides();
          let changed = false;

          data.forEach((rule: any) => {
            if (rule.brand && rule.model && rule.base_price) {
              const k = `${rule.brand.trim().toLowerCase()}:${rule.model.trim().toLowerCase()}`;
              if (current[k] !== rule.base_price) {
                current[k] = rule.base_price;
                changed = true;
              }
            }
          });

          if (changed) {
            localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(current));
            setVersion((v) => v + 1);
          }
        }
      })
      .catch(() => null);

    return () => {
      window.removeEventListener('fundu_price_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return { version, getEffectivePrice, applyPriceOverrides };
}
