import { useState, useEffect, useCallback } from 'react';
import type { HeroPoster } from '../types';
import { db } from './db';
import { broadcastSync, subscribeToRealtimeSync } from './realtimeSync';

import { LIVE_HERO_POSTERS } from '../data/liveHeroPosters';

const STORAGE_KEY = 'fundu_hero_posters_v2';
const EVENT_NAME = 'fundu_hero_posters_updated';

export const DEFAULT_HERO_POSTERS: HeroPoster[] = LIVE_HERO_POSTERS;

export const getStoredHeroPosters = (): HeroPoster[] => {
  if (typeof window === 'undefined') return DEFAULT_HERO_POSTERS;
  try {
    // Purge old v1 key if present
    if (window.localStorage.getItem('fundu_hero_posters_v1')) {
      window.localStorage.removeItem('fundu_hero_posters_v1');
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_HERO_POSTERS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // If cached data contains obsolete poster image paths, purge and return latest defaults
      const hasObsoleteImage = parsed.some((p: any) =>
        typeof p.image === 'string' && p.image.includes('poster_flagship_buy.jpg')
      );
      if (hasObsoleteImage) {
        window.localStorage.removeItem(STORAGE_KEY);
        return DEFAULT_HERO_POSTERS;
      }
      return parsed;
    }
  } catch (err) {
    console.error('Failed to parse stored hero posters:', err);
  }
  return DEFAULT_HERO_POSTERS;
};

export const saveStoredHeroPosters = async (posters: HeroPoster[]): Promise<boolean> => {
  if (typeof window === 'undefined') return false;

  try {
    // 1. Primary: Save directly to MongoDB Atlas site_content and AWAIT it
    try {
      const dbRes = await db.from('site_content').upsert({
        key: 'hero_slides',
        title: 'Hero Posters Carousel',
        items: posters,
        is_active: true,
      });
      if (dbRes.error) {
        console.warn('Database upsert warning for hero posters:', dbRes.error);
      }
    } catch (dbErr) {
      console.warn('Network error syncing hero posters to DB:', dbErr);
    }

    // 2. Secondary: Safe local cache (prevent quota errors from breaking app)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posters));
    } catch (storageErr) {
      console.warn('localStorage full (skipping local cache, posters saved in DB):', storageErr);
    }

    // 3. Dispatch live update event to all listening components and tabs
    broadcastSync('HERO_UPDATE', 'site_content', 'upsert', posters);
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: posters }));

    return true;
  } catch (err) {
    console.error('Failed to save hero posters:', err);
    return false;
  }
};

export const resetStoredHeroPosters = async (): Promise<HeroPoster[]> => {
  await saveStoredHeroPosters(DEFAULT_HERO_POSTERS);
  return DEFAULT_HERO_POSTERS;
};

export const useHeroPosters = () => {
  const [posters, setPosters] = useState<HeroPoster[]>(() => getStoredHeroPosters());
  const [loading, setLoading] = useState<boolean>(true);

  // Sync from DB with auto-polling
  useEffect(() => {
    let isMounted = true;

    const loadFromDb = async () => {
      try {
        const { data, error } = await db
          .from<any>('site_content')
          .select('*')
          .eq('key', 'hero_slides')
          .maybeSingle();

        if (!error && data?.items && Array.isArray(data.items) && data.items.length > 0) {
          if (isMounted) {
            const dbPosters = data.items as HeroPoster[];
            setPosters((prev) => {
              if (JSON.stringify(prev) === JSON.stringify(dbPosters)) {
                return prev;
              }
              return dbPosters;
            });
            try {
              window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dbPosters));
            } catch {}
          }
        }
      } catch (err) {
        console.warn('Notice loading posters from DB, using cached:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadFromDb();

    const unsubscribeRealtime = subscribeToRealtimeSync((payload) => {
      if (
        payload.action === 'HERO_UPDATE' ||
        payload.table === 'site_content' ||
        payload.table === 'hero_posters'
      ) {
        loadFromDb();
      }
    });

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<HeroPoster[]>;
      if (customEvent.detail && Array.isArray(customEvent.detail)) {
        setPosters(customEvent.detail);
      } else {
        setPosters(getStoredHeroPosters());
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setPosters(getStoredHeroPosters());
      }
    };

    window.addEventListener(EVENT_NAME, handleUpdate);
    window.addEventListener('storage', handleStorage);

    // Auto-polling every 12 seconds
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadFromDb();
      }
    }, 12000);

    const handleFocus = () => loadFromDb();
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      isMounted = false;
      unsubscribeRealtime();
      clearInterval(interval);
      window.removeEventListener(EVENT_NAME, handleUpdate);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, []);

  const savePosters = useCallback(async (newPosters: HeroPoster[]) => {
    setPosters(newPosters);
    return await saveStoredHeroPosters(newPosters);
  }, []);

  const resetPosters = useCallback(async () => {
    return await resetStoredHeroPosters();
  }, []);

  const activePosters = posters.filter((p) => p.is_active !== false);

  return {
    posters,
    activePosters: activePosters.length > 0 ? activePosters : DEFAULT_HERO_POSTERS,
    loading,
    savePosters,
    resetPosters,
  };
};
