import { useState, useEffect, useCallback } from 'react';
import type { HeroPoster } from '../types';
import { db } from './db';

const STORAGE_KEY = 'fundu_hero_posters_v1';
const EVENT_NAME = 'fundu_hero_posters_updated';

const buildHeroImage = (prompt: string, imageSize = 'portrait_4_3') =>
  `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=${imageSize}`;

export const DEFAULT_HERO_POSTERS: HeroPoster[] = [
  {
    id: 'poster-flagship-buy',
    eyebrow: 'Exclusive Deals',
    title: 'Discover Your Next Flagship at your doorstep',
    description: 'Certified refurbished smartphones with 6 months warranty and doorstep doorstep delivery.',
    primaryLabel: 'Shop Now',
    primaryHref: '/buy',
    secondaryLabel: 'Explore Catalog',
    secondaryHref: '/store',
    accent: 'from-[#0a2f32] to-[#86dedd]',
    image: '/assets/posters/poster_flagship_buy.jpg',
    bullets: ['32-Pt Audit Passed', '6 Months Warranty', 'Doorstep Delivery Doorstep'],
    is_active: true,
    is_full_banner: true,
    sort_order: 1,
  },
  {
    id: 'poster-sell-cash',
    eyebrow: 'Instant Cash',
    title: 'Sell Old Phone Get Instant Cash at your doorstep',
    description: 'Highest valuation, doorstep pickup, and spot cash/UPI payment at your doorstep.',
    primaryLabel: 'Sell Now',
    primaryHref: '/sell',
    secondaryLabel: 'Check Value',
    secondaryHref: '/sell',
    accent: 'from-[#0a2f32] to-[#86dedd]',
    image: '/assets/posters/poster_sell_cash.jpg',
    bullets: ['Instant UPI/Cash', 'Free Doorstep Pickup', 'Top Resale Value'],
    is_active: true,
    is_full_banner: true,
    sort_order: 2,
  },
  {
    id: 'poster-repair-doorstep',
    eyebrow: 'Doorstep Service',
    title: '30-Minute Doorstep Doorstep Mobile Repair',
    description: 'Certified technicians repair your phone right at your home or office with genuine parts.',
    primaryLabel: 'Book Repair',
    primaryHref: '/repair',
    secondaryLabel: 'Contact Us',
    secondaryHref: '/contact',
    accent: 'from-[#0a2f32] to-[#86dedd]',
    image: '/assets/posters/poster_repair.jpg',
    bullets: ['30-Min Fast Repair', 'Tested Genuine Parts', '6M Repair Warranty'],
    is_active: true,
    is_full_banner: true,
    sort_order: 3,
  },
];

export const getStoredHeroPosters = (): HeroPoster[] => {
  if (typeof window === 'undefined') return DEFAULT_HERO_POSTERS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_HERO_POSTERS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
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

    // 3. Dispatch live update event to all listening components
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

  // Sync from DB once on mount if available
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
            setPosters(dbPosters);
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

    return () => {
      isMounted = false;
      window.removeEventListener(EVENT_NAME, handleUpdate);
      window.removeEventListener('storage', handleStorage);
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
