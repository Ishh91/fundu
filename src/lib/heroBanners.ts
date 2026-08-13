import { useState, useEffect, useCallback } from 'react';
import type { HeroPoster } from '../types';
import { db } from './db';

const STORAGE_KEY = 'fundu_hero_posters_v1';
const EVENT_NAME = 'fundu_hero_posters_updated';

const buildHeroImage = (prompt: string, imageSize = 'portrait_4_3') =>
  `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=${imageSize}`;

export const DEFAULT_HERO_POSTERS: HeroPoster[] = [
  {
    id: 'poster-sell-default',
    eyebrow: 'Sell old phone',
    title: 'Best place to sell your old phone',
    description: 'Get instant resale value, free doorstep pickup, and quick payment from a phone-first flow that feels familiar and clean.',
    primaryLabel: 'Sell Now',
    primaryHref: '/sell',
    secondaryLabel: 'How it Works',
    secondaryHref: '#sell-flow',
    accent: 'from-[#4cd2c4] to-[#18bdb0]',
    image: buildHeroImage(
      'photorealistic Indian man holding smartphone and cash wallet, premium teal ecommerce banner, realistic advertising, clean studio lighting, full body, modern Indian tech ad',
    ),
    bullets: ['Doorstep pickup', 'Top resale value', 'Fast payment'],
    is_active: true,
    sort_order: 1,
  },
  {
    id: 'poster-buy-default',
    eyebrow: 'Buy refurbished phones',
    title: 'Verified devices with warranty and clean pricing',
    description: 'Browse refurbished phones with battery confidence, warranty details, and value-focused deals just like a polished marketplace frontend should feel.',
    primaryLabel: 'Buy Phones',
    primaryHref: '/buy',
    secondaryLabel: 'Visit Store',
    secondaryHref: '/store',
    accent: 'from-[#58dbcf] to-[#1db8aa]',
    image: buildHeroImage(
      'photorealistic premium smartphones arranged for ecommerce banner, teal gradient backdrop, glossy lighting, realistic ad photography, clean modern composition',
    ),
    bullets: ['Warranty-backed', 'Verified stock', 'Weekly offers'],
    is_active: true,
    sort_order: 2,
  },
  {
    id: 'poster-repair-default',
    eyebrow: 'Repair with pickup support',
    title: 'Book phone repair without the usual hassle',
    description: 'From screen and battery to charging issues, Fundu keeps the repair journey simple, premium, and easy to trust.',
    primaryLabel: 'Book Repair',
    primaryHref: '/repair',
    secondaryLabel: 'Talk to Support',
    secondaryHref: '/document-doctor',
    accent: 'from-[#48d3c3] to-[#129f92]',
    image: buildHeroImage(
      'photorealistic mobile repair technician with smartphone, premium teal service banner, realistic Indian ecommerce ad, clean lighting and sharp modern composition',
    ),
    bullets: ['Screen repair', 'Battery replacement', 'Pickup support'],
    is_active: true,
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
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posters));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: posters }));

    // Async sync to database site_content
    db.from('site_content')
      .upsert({
        key: 'hero_slides',
        title: 'Hero Posters Carousel',
        items: posters,
        is_active: true,
      })
      .catch((err) => console.warn('Could not sync hero posters to DB:', err));

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
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dbPosters));
          }
        }
      } catch (err) {
        // Fallback to localStorage
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
