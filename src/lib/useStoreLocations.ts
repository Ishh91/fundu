import { useCallback, useEffect, useState } from 'react';
import { db } from './db';
import { broadcastSync, subscribeToRealtimeSync } from './realtimeSync';
import { DEFAULT_STORES, STORE_CONTENT_KEY, normalizeStores, type StoreLocation } from './storeLocations';

const CACHE_KEY = 'fundu_store_locations_v1';
const UPDATED_EVENT = 'fundu_store_locations_updated';

const readCache = (): StoreLocation[] | null => {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    return raw ? normalizeStores(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
};

const writeCache = (stores: StoreLocation[]): void => {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(stores));
  } catch {
    // The list is saved in the database; the cache only avoids a flash on load.
  }
};

/** Saves the list for everyone. Returns an error message, or null on success. */
export async function saveStoreLocations(stores: StoreLocation[]): Promise<string | null> {
  const { error } = await db.from('site_content').upsert({
    key: STORE_CONTENT_KEY,
    title: 'Our Stores',
    items: stores,
    is_active: true,
  });
  if (error) return error.message || 'Could not save the stores.';
  writeCache(stores);
  broadcastSync('STORES_UPDATE', 'site_content', 'upsert', stores);
  window.dispatchEvent(new CustomEvent(UPDATED_EVENT, { detail: stores }));
  return null;
}

/** The live store list: the saved one, or the defaults until an admin saves. */
export function useStoreLocations() {
  const [stores, setStores] = useState<StoreLocation[]>(() => readCache() ?? [...DEFAULT_STORES]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data, error } = await db.from<{ items?: unknown }>('site_content').select('*').eq('key', STORE_CONTENT_KEY).maybeSingle();
      if (!error && data && Array.isArray(data.items)) {
        const saved = normalizeStores(data.items);
        setStores((prev) => (JSON.stringify(prev) === JSON.stringify(saved) ? prev : saved));
        writeCache(saved);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const unsubscribe = subscribeToRealtimeSync((payload) => {
      if (payload.action === 'STORES_UPDATE' || payload.table === 'site_content') load();
    });
    const onUpdated = (event: Event) => {
      const detail = (event as CustomEvent<StoreLocation[]>).detail;
      if (Array.isArray(detail)) setStores(detail);
    };
    window.addEventListener(UPDATED_EVENT, onUpdated);
    return () => {
      unsubscribe();
      window.removeEventListener(UPDATED_EVENT, onUpdated);
    };
  }, [load]);

  return { stores, loading };
}
