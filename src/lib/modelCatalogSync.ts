import { useState, useEffect } from 'react';
import { db } from './db';
import { broadcastSync, subscribeToRealtimeSync } from './realtimeSync';
import { MASTER_MODEL_CATALOG } from '../data/masterModelCatalog';
import { ALL_INDIAN_PHONES_CATALOG } from '../data/indianPhonesCatalog';
import {
  BRAND_SERIES_DEFINITIONS,
  getDeviceRecencyScore,
  sortDeviceModelsLatestFirst,
  getModelDedupeKey,
  inferModelSeries,
} from '../data/brandSeriesCatalog';
import { getCleanPhoneImage } from './phoneImages';
import { getLocalPriceOverrides, getPriceLookupKeys } from './priceSync';
import { markModelAsDeleted, restoreModel, isModelDeleted } from './catalogSync';
import { normalizeStorageString, getModelHardwareSpecs, isObsoleteDeviceHardware } from './deviceSpecs';

const LIVE_MASTER_PHONES_STORAGE_KEY = 'fundu_live_master_phones_v2';

export type UnifiedCatalogModel = {
  id?: string;
  brand: string;
  series: string;
  model: string;
  storage: string;
  price: number;
  image: string;
  release_year?: number;
  is_active?: boolean;
};

// In-memory cache for live master_phones from DB
let memoryLivePhones: any[] = [];

/**
 * Reads cached live master_phones from LocalStorage
 */
export function getStoredLiveMasterPhones(): any[] {
  if (memoryLivePhones.length > 0) return memoryLivePhones;
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LIVE_MASTER_PHONES_STORAGE_KEY) || sessionStorage.getItem(LIVE_MASTER_PHONES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryLivePhones = parsed;
        return parsed;
      }
    }
  } catch {}
  return [];
}

let isPullingPhones = false;
/**
 * Pulls master_phones live from DB and stores in memory & localStorage
 */
export async function pullLiveMasterPhonesFromDb(): Promise<any[]> {
  if (typeof window === 'undefined' || isPullingPhones) return memoryLivePhones;
  isPullingPhones = true;
  try {
    const { data, error } = await db.from('master_phones')
      .select('brand, model, is_active, release_year, default_mrp, image_url')
      .limit(2000);
    if (!error && Array.isArray(data) && data.length > 0) {
      memoryLivePhones = data;
      // Auto-sync deleted/inactive flags into local deleted models set
      data.forEach((p: any) => {
        if (p.is_active === false && p.brand && p.model) {
          markModelAsDeleted(p.brand, p.model);
        } else if (p.is_active === true && p.brand && p.model) {
          restoreModel(p.brand, p.model);
        }
      });
      try {
        localStorage.setItem(LIVE_MASTER_PHONES_STORAGE_KEY, JSON.stringify(data));
        sessionStorage.setItem(LIVE_MASTER_PHONES_STORAGE_KEY, JSON.stringify(data));
      } catch {}
      window.dispatchEvent(new CustomEvent('fundu_catalog_synced', { detail: { count: data.length } }));
      return data;
    }
  } catch (err) {
    // Fail silently on network errors
  } finally {
    isPullingPhones = false;
  }
  return memoryLivePhones;
}

// Auto-trigger background pull on client boot without blocking initial render
if (typeof window !== 'undefined') {
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => pullLiveMasterPhonesFromDb(), { timeout: 2000 });
  } else {
    setTimeout(() => pullLiveMasterPhonesFromDb(), 1200);
  }
}

/**
 * Normalizes brand display names for consistent grouping
 */
export function normalizeCanonicalBrand(brand?: string): string {
  const b = (brand || '').trim().toLowerCase();
  if (b === 'apple' || b === 'iphone') return 'Apple';
  if (b === 'samsung') return 'Samsung';
  if (b === 'oneplus') return 'OnePlus';
  if (b === 'xiaomi' || b === 'mi' || b === 'redmi') return 'Xiaomi';
  if (b === 'poco') return 'Poco';
  if (b === 'vivo') return 'Vivo';
  if (b === 'iqoo') return 'iQOO';
  if (b === 'oppo') return 'Oppo';
  if (b === 'realme') return 'Realme';
  if (b === 'motorola' || b === 'moto') return 'Motorola';
  if (b === 'google' || b === 'pixel') return 'Google';
  if (b === 'nothing' || b === 'cmf') return 'Nothing';
  if (b === 'tecno') return 'Tecno';
  if (b === 'infinix') return 'Infinix';
  if (b === 'itel') return 'Itel';
  if (!brand) return 'Smartphone';
  return brand.charAt(0).toUpperCase() + brand.slice(1);
}

/**
 * Normalizes model display name avoiding duplicate brand prefix (e.g. "Apple Apple iPhone 13")
 */
export function getCleanModelName(brand: string, rawModel: string): string {
  const bNorm = (brand || '').trim().toLowerCase();
  const trimmed = (rawModel || '').trim();
  if (bNorm && trimmed.toLowerCase().startsWith(bNorm)) {
    const sliced = trimmed.slice(bNorm.length).trim();
    if (sliced) return sliced;
  }
  return trimmed;
}

// In-memory unified catalog cache to prevent massive re-allocations on renders
const unifiedCatalogCache = new Map<string, UnifiedCatalogModel[]>();

export function clearUnifiedCatalogCache(): void {
  unifiedCatalogCache.clear();
}

if (typeof window !== 'undefined') {
  const clear = () => unifiedCatalogCache.clear();
  window.addEventListener('fundu_catalog_synced', clear);
  window.addEventListener('fundu_model_image_updated', clear);
  window.addEventListener('fundu_price_updated', clear);
  window.addEventListener('fundu_model_deleted', clear);
  window.addEventListener('fundu_model_restored', clear);
  window.addEventListener('storage', clear);
}

/**
 * Returns the complete unified list of models, reactive to admin updates, DB master_phones,
 * custom prices, custom images, and deleted model flags.
 */
export function getUnifiedCatalog(brandFilter?: string): UnifiedCatalogModel[] {
  const cacheKey = (brandFilter || '__ALL__').toLowerCase().trim();
  if (unifiedCatalogCache.has(cacheKey)) {
    return unifiedCatalogCache.get(cacheKey)!;
  }

  const overrides = getLocalPriceOverrides();
  const dbPhones = getStoredLiveMasterPhones();

  const targetBrandNorm = brandFilter ? brandFilter.trim().toLowerCase() : '';
  const seenKeys = new Set<string>();
  const results: UnifiedCatalogModel[] = [];

  const addModel = (
    brand: string,
    model: string,
    defaultStorage = '128 GB',
    defaultPrice = 12000,
    rawImage?: string,
    seriesName?: string,
    releaseYear?: number
  ) => {
    if (!brand || !model) return;
    const cleanBrand = normalizeCanonicalBrand(brand);
    const cleanModel = getCleanModelName(cleanBrand, model);

    // Brand filter matching
    if (targetBrandNorm) {
      const bLow = cleanBrand.toLowerCase();
      if (targetBrandNorm === 'apple') {
        if (bLow !== 'apple' && !cleanModel.toLowerCase().startsWith('iphone')) return;
      } else if (targetBrandNorm === 'xiaomi') {
        if (bLow !== 'xiaomi' && bLow !== 'redmi') return;
      } else if (targetBrandNorm === 'poco') {
        if (bLow !== 'poco') return;
      } else if (bLow !== targetBrandNorm) {
        return;
      }
    }

    // Deletion check (Admin delete sync)
    if (isModelDeleted(cleanBrand, cleanModel) || isModelDeleted(cleanBrand, model)) {
      return;
    }

    // Exclude obsolete <=32GB devices
    if (isObsoleteDeviceHardware({ brand: cleanBrand, model: cleanModel, storage: defaultStorage })) {
      return;
    }

    // Deduplication key
    const dedupeKey = getModelDedupeKey(cleanBrand, cleanModel);
    const fullKey = `${cleanBrand.toLowerCase()}:${dedupeKey}`;
    if (seenKeys.has(fullKey)) return;
    seenKeys.add(fullKey);

    // Custom image resolution
    const finalImage = getCleanPhoneImage(cleanBrand, cleanModel, rawImage);

    // Price override resolution
    const lookupKeys = getPriceLookupKeys(cleanBrand, cleanModel, defaultStorage);
    let effectivePrice = defaultPrice;
    for (const k of lookupKeys) {
      if (typeof overrides[k] === 'number' && overrides[k] > 0) {
        effectivePrice = overrides[k];
        break;
      }
    }

    // Series resolution
    const finalSeries = seriesName || inferModelSeries(cleanBrand, cleanModel).seriesName;

    results.push({
      id: `${cleanBrand.toLowerCase()}-${dedupeKey}`,
      brand: cleanBrand,
      series: finalSeries,
      model: cleanModel,
      storage: normalizeStorageString(defaultStorage),
      price: effectivePrice,
      image: finalImage,
      release_year: releaseYear,
      is_active: true,
    });
  };

  // 0. Pre-block all explicitly disabled or obsolete models from DB so static fallbacks can never resurrect them
  dbPhones.forEach((p) => {
    if (p.is_active === false || isObsoleteDeviceHardware(p)) {
      const cleanBrand = normalizeCanonicalBrand(p.brand);
      const cleanModel = getCleanModelName(cleanBrand, p.model);
      const dedupeKey = getModelDedupeKey(cleanBrand, cleanModel);
      seenKeys.add(`${cleanBrand.toLowerCase()}:${dedupeKey}`);
      seenKeys.add(`${cleanBrand.toLowerCase()}:${cleanModel.toLowerCase().trim()}`);
    }
  });

  // 1. High Priority: Database master_phones (Admin customized / added models)
  dbPhones.forEach((p) => {
    if (p.is_active === false) return;
    addModel(
      p.brand,
      p.model,
      p.storage_options?.[0] || '128 GB',
      p.base_resale_value || p.price || 12500,
      p.image_url,
      undefined,
      p.release_year
    );
  });

  // 2. Core Curated Master Model Catalog (1,162 primary devices)
  MASTER_MODEL_CATALOG.forEach((m) => {
    addModel(
      m.brand,
      m.model,
      m.storage || '128 GB',
      m.price || 12000,
      m.image,
      m.series
    );
  });

  // 3. Indian Market Brand Series Definitions
  Object.entries(BRAND_SERIES_DEFINITIONS).forEach(([bKey, seriesList]) => {
    if (!targetBrandNorm || targetBrandNorm === bKey || (targetBrandNorm === 'apple' && bKey === 'apple')) {
      seriesList.forEach((s) => {
        (s.defaultModels || []).forEach((dm) => {
          addModel(
            s.brand || bKey,
            dm.model,
            dm.storage || '128 GB',
            dm.price || 12000,
            dm.image,
            s.seriesName
          );
        });
      });
    }
  });

  // 4. Fallback Comprehensive Catalog: ALL_INDIAN_PHONES_CATALOG (31k+ database)
  ALL_INDIAN_PHONES_CATALOG.forEach((p) => {
    addModel(
      p.brand,
      p.model,
      p.storage_options?.[0] || '128 GB',
      p.base_resale_value || 11000,
      p.image_url,
      undefined,
      p.release_year
    );
  });

  // Sort latest/flagship devices first and store in memory cache
  const finalSorted = brandFilter
    ? sortDeviceModelsLatestFirst(normalizeCanonicalBrand(brandFilter), results)
    : results.sort((a, b) => {
        const scoreB = getDeviceRecencyScore(b.brand, b.model);
        const scoreA = getDeviceRecencyScore(a.brand, a.model);
        if (scoreB !== scoreA) return scoreB - scoreA;
        return a.model.localeCompare(b.model);
      });

  unifiedCatalogCache.set(cacheKey, finalSorted);
  return finalSorted;
}

/**
 * React hook that guarantees front-end & admin components stay 100% in sync with the unified catalog
 */
export function useUnifiedCatalog(brandFilter?: string) {
  const [syncVersion, setSyncVersion] = useState(0);

  useEffect(() => {
    // Initial fetch from DB
    pullLiveMasterPhonesFromDb();

    const handleUpdate = () => {
      setSyncVersion((v) => v + 1);
    };

    const unsubscribe = subscribeToRealtimeSync((payload) => {
      if (
        payload.table === 'master_phones' ||
        payload.table === 'sell_price_configs' ||
        payload.action === 'MODEL_IMAGE_UPDATE' ||
        payload.action === 'MODEL_DELETE' ||
        payload.action === 'MODEL_RESTORE' ||
        payload.action === 'PRICE_UPDATE'
      ) {
        pullLiveMasterPhonesFromDb().then(() => handleUpdate());
      }
    });

    window.addEventListener('fundu_catalog_synced', handleUpdate);
    window.addEventListener('fundu_model_image_updated', handleUpdate);
    window.addEventListener('fundu_price_updated', handleUpdate);
    window.addEventListener('fundu_model_deleted', handleUpdate);
    window.addEventListener('fundu_model_restored', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    // Focus & visibility change sync
    const handleFocus = () => {
      pullLiveMasterPhonesFromDb();
      handleUpdate();
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      unsubscribe();
      window.removeEventListener('fundu_catalog_synced', handleUpdate);
      window.removeEventListener('fundu_model_image_updated', handleUpdate);
      window.removeEventListener('fundu_price_updated', handleUpdate);
      window.removeEventListener('fundu_model_deleted', handleUpdate);
      window.removeEventListener('fundu_model_restored', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, []);

  const models = getUnifiedCatalog(brandFilter);

  return {
    models,
    syncVersion,
  };
}

