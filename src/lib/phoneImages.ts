/**
 * Official Studio Smartphone Renders & Brand Vector Logos
 * Provides official front-facing upright device renders and authentic brand logos.
 */

import { MOBILE_API_THUMBS } from '../data/deviceImageDictionary';

// Official Brand Vector Logos
export const BRAND_OFFICIAL_LOGOS: Record<string, string> = {
  apple: 'https://cdn.simpleicons.org/apple/000000',
  iphone: 'https://cdn.simpleicons.org/apple/000000',
  samsung: 'https://cdn.simpleicons.org/samsung/1428a0',
  oneplus: 'https://cdn.simpleicons.org/oneplus/eb0029',
  xiaomi: 'https://cdn.simpleicons.org/xiaomi/ff6900',
  redmi: 'https://cdn.simpleicons.org/xiaomi/ff6900',
  poco: 'https://cdn.simpleicons.org/xiaomi/ff6900',
  vivo: 'https://cdn.simpleicons.org/vivo/0056bd',
  iqoo: 'https://cdn.simpleicons.org/vivo/0056bd',
  oppo: 'https://cdn.simpleicons.org/oppo/008b47',
  realme: '/realme-logo.svg',
  google: 'https://cdn.simpleicons.org/google/4285f4',
  pixel: 'https://cdn.simpleicons.org/google/4285f4',
  nothing: '/nothing-logo.svg',
  motorola: 'https://cdn.simpleicons.org/motorola/000000',
  moto: 'https://cdn.simpleicons.org/motorola/000000',
  infinix: '/infinix-logo.svg',
  tecno: '/tecno-logo.svg',
  itel: '/itel-logo.svg',
  lenovo: 'https://cdn.simpleicons.org/lenovo/e2231a',
};

// Model-Specific Official Studio Renders (sorted longest keyword first)
export const RAW_MODEL_EXACT_RENDERS: Array<{ keyword: string; url: string }> = [
  // Apple iPhone Pro Max / Pro / Plus / Mini
  { keyword: 'iphone 17 pro max', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro-max.jpg' },
  { keyword: 'iphone 17 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro.jpg' },
  { keyword: 'iphone 17 air', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16.jpg' },
  { keyword: 'iphone 17 slim', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16.jpg' },
  { keyword: 'iphone 17', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16.jpg' },
  { keyword: 'iphone 16 pro max', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro-max.jpg' },
  { keyword: 'iphone 16 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro.jpg' },
  { keyword: 'iphone 16 plus', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-plus.jpg' },
  { keyword: 'iphone 16', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16.jpg' },
  { keyword: 'iphone 15 pro max', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro-max.jpg' },
  { keyword: 'iphone 15 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro.jpg' },
  { keyword: 'iphone 15 plus', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-plus.jpg' },
  { keyword: 'iphone 15', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15.jpg' },
  { keyword: 'iphone 14 pro max', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14-pro-max.jpg' },
  { keyword: 'iphone 14 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14-pro.jpg' },
  { keyword: 'iphone 14 plus', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14-plus.jpg' },
  { keyword: 'iphone 14', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14.jpg' },
  { keyword: 'iphone 13 pro max', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13-pro-max.jpg' },
  { keyword: 'iphone 13 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13-pro.jpg' },
  { keyword: 'iphone 13 mini', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13-mini.jpg' },
  { keyword: 'iphone 13', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13.jpg' },
  { keyword: 'iphone 12 pro max', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-12-pro-max.jpg' },
  { keyword: 'iphone 12 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-12-pro.jpg' },
  { keyword: 'iphone 12 mini', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-12-mini.jpg' },
  { keyword: 'iphone 12', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-12.jpg' },
  { keyword: 'iphone 11 pro max', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-11-pro-max.jpg' },
  { keyword: 'iphone 11 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-11-pro.jpg' },
  { keyword: 'iphone 11', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-11.jpg' },
  { keyword: 'iphone se 2022', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-se-2022.jpg' },
  { keyword: 'iphone se 2020', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-se-2020.jpg' },
  { keyword: 'iphone xs max', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-xs-max.jpg' },
  { keyword: 'iphone xs', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-xs.jpg' },
  { keyword: 'iphone xr', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-xr.jpg' },
  { keyword: 'iphone x', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-x.jpg' },

  // Samsung Galaxy S-Series, Z-Fold, Z-Flip, Note & A-Series
  { keyword: 's25 ultra', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s25-ultra-sm-s938.jpg' },
  { keyword: 's25 plus', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-plus-5g-sm-s926.jpg' },
  { keyword: 's25+', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-plus-5g-sm-s926.jpg' },
  { keyword: 's25', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-5g-sm-s921.jpg' },
  { keyword: 's24 ultra', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-ultra-5g-sm-s928-stylus.jpg' },
  { keyword: 's24 plus', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-plus-5g-sm-s926.jpg' },
  { keyword: 's24+', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-plus-5g-sm-s926.jpg' },
  { keyword: 's24 fe', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-fe.jpg' },
  { keyword: 's24', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-5g-sm-s921.jpg' },
  { keyword: 's23 ultra', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-ultra-5g.jpg' },
  { keyword: 's23 plus', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-plus-5g.jpg' },
  { keyword: 's23+', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-plus-5g.jpg' },
  { keyword: 's23 fe', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-fe.jpg' },
  { keyword: 's23', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-5g.jpg' },
  { keyword: 's22 ultra', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s22-ultra-5g.jpg' },
  { keyword: 's22 plus', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s22-plus-5g.jpg' },
  { keyword: 's22+', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s22-plus-5g.jpg' },
  { keyword: 's22', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s22-5g.jpg' },
  { keyword: 's21 ultra', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s21-ultra-5g-.jpg' },
  { keyword: 's21 fe', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s21-fe-5g.jpg' },
  { keyword: 's21', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s21-5g-r.jpg' },
  { keyword: 's20 ultra', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s20-ultra-5g-r.jpg' },
  { keyword: 's20 fe', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s20-fe-5g.jpg' },
  { keyword: 's10 plus', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s10-plus-new.jpg' },
  { keyword: 's10+', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s10-plus-new.jpg' },
  { keyword: 's10', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s10-1.jpg' },
  { keyword: 'fold 6', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold6.jpg' },
  { keyword: 'flip 6', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip6.jpg' },
  { keyword: 'fold 5', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold5.jpg' },
  { keyword: 'flip 5', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip5.jpg' },
  { keyword: 'fold 4', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold4.jpg' },
  { keyword: 'flip 4', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip4.jpg' },
  { keyword: 'note 20 ultra', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-note20-ultra-5g-.jpg' },
  { keyword: 'note 20', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-note20-5g-r.jpg' },
  { keyword: 'note 10+', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-note10-plus-.jpg' },
  { keyword: 'note 10', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-note10-.jpg' },
  { keyword: 'galaxy a55', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a55.jpg' },
  { keyword: 'galaxy a54', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a54.jpg' },
  { keyword: 'galaxy a35', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a35.jpg' },
  { keyword: 'galaxy a34', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a34.jpg' },
  { keyword: 'galaxy a15', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a15-5g.jpg' },
  { keyword: 'galaxy a14', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a14-5g.jpg' },

  // OnePlus
  { keyword: 'oneplus 12r', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-12r.jpg' },
  { keyword: 'oneplus 12', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-12.jpg' },
  { keyword: 'oneplus open', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-open.jpg' },
  { keyword: 'oneplus 11r', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-ace2.jpg' },
  { keyword: 'oneplus 11', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-11.jpg' },
  { keyword: 'oneplus nord 4', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-4.jpg' },
  { keyword: 'oneplus nord ce4', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-ce4.jpg' },
  { keyword: 'oneplus 10 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-10-pro.jpg' },
  { keyword: 'oneplus 10r', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-10r.jpg' },
  { keyword: 'oneplus 10t', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-10t-5g.jpg' },
  { keyword: 'oneplus 9 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-9-pro.jpg' },
  { keyword: 'oneplus 9', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-9.jpg' },

  // Realme
  { keyword: 'realme 13 pro+', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-13-pro-plus.jpg' },
  { keyword: 'realme 13 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-13-pro.jpg' },
  { keyword: 'realme 12 pro+', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-12-pro-plus.jpg' },
  { keyword: 'realme 12 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-12-pro.jpg' },
  { keyword: 'realme gt 6t', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-gt-6t.jpg' },
  { keyword: 'realme gt 6', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-gt6.jpg' },
  { keyword: 'narzo 70 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-70-pro.jpg' },
  { keyword: 'realme p1 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-p1-pro.jpg' },
  { keyword: 'realme p1', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-p1.jpg' },

  // Xiaomi & Redmi
  { keyword: 'xiaomi 14 ultra', url: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-14-ultra.jpg' },
  { keyword: 'xiaomi 14 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-14-pro.jpg' },
  { keyword: 'xiaomi 14', url: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-14.jpg' },
  { keyword: 'xiaomi 13 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-13-pro.jpg' },
  { keyword: 'redmi note 13 pro+', url: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-pro-plus.jpg' },
  { keyword: 'redmi note 13 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-pro-5g.jpg' },
  { keyword: 'redmi note 13', url: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-5g.jpg' },

  // Vivo & iQOO
  { keyword: 'vivo x100 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x100-pro.jpg' },
  { keyword: 'vivo x100', url: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x100.jpg' },
  { keyword: 'vivo v40 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v40-pro.jpg' },
  { keyword: 'vivo v40', url: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v40.jpg' },
  { keyword: 'vivo v30 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v30-pro.jpg' },
  { keyword: 'vivo v30', url: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v30.jpg' },
  { keyword: 'iqoo 12', url: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo12.jpg' },
  { keyword: 'iqoo neo 9 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-neo9-pro.jpg' },
  { keyword: 'iqoo neo 7 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-neo-7-pro.jpg' },
  { keyword: 'iqoo z9s pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-z9s-pro.jpg' },

  // Google Pixel
  { keyword: 'pixel 9 pro fold', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-9-pro-fold.jpg' },
  { keyword: 'pixel 9 pro xl', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-9-pro-xl.jpg' },
  { keyword: 'pixel 9 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-9-pro-.jpg' },
  { keyword: 'pixel 9', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-9.jpg' },
  { keyword: 'pixel 8a', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8a.jpg' },
  { keyword: 'pixel 8 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8-pro.jpg' },
  { keyword: 'pixel 8', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8.jpg' },
  { keyword: 'pixel 7a', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-7a.jpg' },
  { keyword: 'pixel 7 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-7-pro.jpg' },
  { keyword: 'pixel 7', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-7.jpg' },

  // Nothing
  { keyword: 'nothing phone 2a', url: 'https://fdn2.gsmarena.com/vv/bigpic/nothing-phone-2a.jpg' },
  { keyword: 'nothing phone 2', url: 'https://fdn2.gsmarena.com/vv/bigpic/nothing-phone-2.jpg' },
  { keyword: 'nothing phone 1', url: 'https://fdn2.gsmarena.com/vv/bigpic/nothing-phone-1.jpg' },
  { keyword: 'cmf phone 1', url: 'https://fdn2.gsmarena.com/vv/bigpic/nothing-cmf-phone-1.jpg' },

  // Lenovo
  { keyword: 'lenovo legion duel 2', url: 'https://fdn2.gsmarena.com/vv/bigpic/lenovo-legion-duel-2.jpg' },
  { keyword: 'lenovo k10 note', url: 'https://fdn2.gsmarena.com/vv/bigpic/lenovo-k10-note.jpg' },
  { keyword: 'lenovo k10 plus', url: 'https://fdn2.gsmarena.com/vv/bigpic/lenovo-k10-plus.jpg' },
  { keyword: 'lenovo k9 note', url: 'https://fdn2.gsmarena.com/vv/bigpic/lenovo-k9-note.jpg' },
  { keyword: 'lenovo k8 note', url: 'https://fdn2.gsmarena.com/vv/bigpic/lenovo-k8-note.jpg' },
  { keyword: 'lenovo z6 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/lenovo-z6-pro.jpg' },
  { keyword: 'lenovo a6 note', url: 'https://fdn2.gsmarena.com/vv/bigpic/lenovo-a6-note.jpg' },
];

// Always sort by keyword length descending so specific variants take precedence over base models
export const MODEL_EXACT_RENDERS = [...RAW_MODEL_EXACT_RENDERS].sort((a, b) => b.keyword.length - a.keyword.length);

// Cache sorted keys of MOBILE_API_THUMBS for fast substring matching
const SORTED_THUMB_KEYS = Object.keys(MOBILE_API_THUMBS).sort((a, b) => b.length - a.length);

// Brand-Specific High-Reliability Clean Renders for Device Fallbacks
export const BRAND_FRONT_FALLBACKS: Record<string, string> = {
  apple: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro.jpg',
  iphone: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro.jpg',
  samsung: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-ultra-5g-sm-s928-stylus.jpg',
  oneplus: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-12.jpg',
  xiaomi: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-14-pro.jpg',
  redmi: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-pro-plus.jpg',
  poco: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-x6-pro.jpg',
  vivo: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x100-pro.jpg',
  iqoo: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo12.jpg',
  realme: 'https://fdn2.gsmarena.com/vv/bigpic/realme-12-pro-plus.jpg',
  oppo: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-find-x7-ultra.jpg',
  google: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8-pro.jpg',
  pixel: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8-pro.jpg',
  motorola: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-50-pro.jpg',
  moto: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-50-pro.jpg',
  nothing: 'https://fdn2.gsmarena.com/vv/bigpic/nothing-phone-2a.jpg',
  infinix: 'https://fdn2.gsmarena.com/vv/bigpic/infinix-gt-20-pro.jpg',
  tecno: 'https://fdn2.gsmarena.com/vv/bigpic/tecno-camon-30-pro.jpg',
  itel: 'https://fdn2.gsmarena.com/vv/bigpic/itel-s24.jpg',
  honor: 'https://fdn2.gsmarena.com/vv/bigpic/honor-200.jpg',
  lenovo: 'https://fdn2.gsmarena.com/vv/bigpic/lenovo-k10-note.jpg',
};

/**
 * Returns authentic official vector/brand logo URL.
 */
export function getCleanBrandLogo(brandName?: string): string {
  const b = (brandName || '').toLowerCase().trim();
  for (const [key, url] of Object.entries(BRAND_OFFICIAL_LOGOS)) {
    if (b.includes(key)) return url;
  }
  return BRAND_OFFICIAL_LOGOS.apple;
}

/**
 * Returns clean official studio upright device renders on white background.
 * Resolves the EXACT model image rather than generic brand fallbacks.
 * Explicitly rejects fake repetitive URLs (e.g. apple-apple, samsung-samsung) and unsplash placeholders.
 */
export function getCleanPhoneImage(brand?: string, model?: string, fallbackUrl?: string): string {
  const b = (brand || '').toLowerCase().trim();
  const m = (model || '').toLowerCase().trim();
  const fullText = `${b} ${m}`.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
  const modelNorm = m.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
  const rawUrl = (fallbackUrl || '').trim();

  // 1. If explicit user-uploaded image (data URL or custom backend CDN), use it
  if (
    rawUrl &&
    !rawUrl.includes('unsplash.com') &&
    !rawUrl.includes('777/thumb') &&
    (rawUrl.startsWith('data:image/') ||
      rawUrl.includes('supabase') ||
      rawUrl.includes('cloudinary') ||
      rawUrl.includes('firebase'))
  ) {
    return rawUrl;
  }

  // 2. Reject fake repetitive brand slug patterns in fallbackUrl (e.g. apple-apple, samsung-samsung, etc.)
  const isFakeRepetitiveUrl =
    /([a-z0-9]+)-\1-/i.test(rawUrl) ||
    rawUrl.includes('unsplash.com') ||
    rawUrl.includes('777/thumb');

  // 3. Try high-resolution flagship renders (sorted longest keyword first)
  for (const item of MODEL_EXACT_RENDERS) {
    if (fullText.includes(item.keyword) || modelNorm.includes(item.keyword)) {
      return item.url;
    }
  }

  // 4. Exact dictionary lookup from verified 4,000+ device catalog
  if (MOBILE_API_THUMBS[fullText]) {
    return MOBILE_API_THUMBS[fullText];
  }
  if (MOBILE_API_THUMBS[modelNorm]) {
    return MOBILE_API_THUMBS[modelNorm];
  }

  // 5. Intelligent substring match in deviceImageDictionary
  for (const k of SORTED_THUMB_KEYS) {
    if (k.length >= 5 && (fullText.includes(k) || modelNorm.includes(k))) {
      return MOBILE_API_THUMBS[k];
    }
  }

  // 6. If fallbackUrl was a valid non-fake URL, return it
  if (rawUrl && !isFakeRepetitiveUrl && rawUrl.startsWith('http')) {
    return rawUrl;
  }

  // 7. Fallback to brand clean render
  for (const [key, url] of Object.entries(BRAND_FRONT_FALLBACKS)) {
    if (b.includes(key) || m.includes(key)) {
      return url;
    }
  }

  if (BRAND_FRONT_FALLBACKS[b]) {
    return BRAND_FRONT_FALLBACKS[b];
  }

  return BRAND_FRONT_FALLBACKS.apple;
}
