/**
 * Official Studio Smartphone Renders (Cashify-Style Clean Isolated Renders)
 * Provides official front-facing upright device renders on clean white backgrounds.
 */

// Model-Specific Official Studio Renders
export const MODEL_EXACT_RENDERS: Array<{ keyword: string; url: string }> = [
  // Apple iPhone
  { keyword: 'iphone 16 pro max', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro-max.jpg' },
  { keyword: 'iphone 16 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro.jpg' },
  { keyword: 'iphone 16', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16.jpg' },
  { keyword: 'iphone 15 pro max', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro-max.jpg' },
  { keyword: 'iphone 15 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro.jpg' },
  { keyword: 'iphone 15', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15.jpg' },
  { keyword: 'iphone 14 pro max', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14-pro-max.jpg' },
  { keyword: 'iphone 14 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14-pro.jpg' },
  { keyword: 'iphone 14', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14.jpg' },
  { keyword: 'iphone 13 pro max', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13-pro-max.jpg' },
  { keyword: 'iphone 13 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13-pro.jpg' },
  { keyword: 'iphone 13', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13.jpg' },
  { keyword: 'iphone 12', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-12.jpg' },
  { keyword: 'iphone 11', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-11.jpg' },

  // Samsung Galaxy
  { keyword: 's24 ultra', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-ultra-5g.jpg' },
  { keyword: 's24', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24.jpg' },
  { keyword: 's23 ultra', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-ultra-5g.jpg' },
  { keyword: 's23', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23.jpg' },
  { keyword: 'fold 5', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold5.jpg' },
  { keyword: 'flip 5', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip5.jpg' },
  { keyword: 'a55', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a55.jpg' },
  { keyword: 'a54', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a54.jpg' },

  // OnePlus
  { keyword: 'oneplus 12r', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-12r.jpg' },
  { keyword: 'oneplus 12', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-12.jpg' },
  { keyword: 'oneplus 11r', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-11r.jpg' },
  { keyword: 'oneplus 11', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-11.jpg' },
  { keyword: 'oneplus 9 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-9-pro.jpg' },
  { keyword: 'oneplus 9', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-9.jpg' },
  { keyword: 'nord 3', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-3.jpg' },
  { keyword: 'nord 2', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-2-5g.jpg' },

  // Xiaomi / Redmi / Poco
  { keyword: 'xiaomi 14', url: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-14-pro.jpg' },
  { keyword: 'redmi note 13 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-pro-plus.jpg' },
  { keyword: 'redmi note 13', url: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13.jpg' },
  { keyword: 'poco x6', url: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-x6-pro.jpg' },

  // Vivo / iQOO
  { keyword: 'vivo x200', url: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x200-pro.jpg' },
  { keyword: 'vivo x100', url: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x100-pro.jpg' },
  { keyword: 'vivo v30', url: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v30-pro.jpg' },
  { keyword: 'iqoo 12', url: 'https://fdn2.gsmarena.com/vv/bigpic/iqoo-12.jpg' },

  // Google Pixel
  { keyword: 'pixel 8 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8-pro.jpg' },
  { keyword: 'pixel 8', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8.jpg' },
  { keyword: 'pixel 7', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-7a.jpg' },

  // Motorola
  { keyword: 'edge 50', url: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-50-pro.jpg' },
  { keyword: 'g84', url: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-g84.jpg' },

  // Others
  { keyword: 'nothing phone', url: 'https://fdn2.gsmarena.com/vv/bigpic/nothing-phone-2a.jpg' },
  { keyword: 'itel s24', url: 'https://fdn2.gsmarena.com/vv/bigpic/itel-s24.jpg' },
  { keyword: 'infinix gt', url: 'https://fdn2.gsmarena.com/vv/bigpic/infinix-gt-20-pro.jpg' },
  { keyword: 'tecno camon', url: 'https://fdn2.gsmarena.com/vv/bigpic/tecno-camon-30-pro.jpg' },
];

// Brand-Specific High-Reliability Clean Renders for Fallback
export const BRAND_FRONT_FALLBACKS: Record<string, string> = {
  apple: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro.jpg',
  iphone: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro.jpg',
  samsung: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-ultra-5g.jpg',
  oneplus: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-12.jpg',
  xiaomi: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-14-pro.jpg',
  redmi: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-pro-plus.jpg',
  poco: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-x6-pro.jpg',
  vivo: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x100-pro.jpg',
  iqoo: 'https://fdn2.gsmarena.com/vv/bigpic/iqoo-12.jpg',
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
};

export function getCleanBrandLogo(brandName?: string): string {
  const b = (brandName || '').toLowerCase().trim();
  for (const [key, url] of Object.entries(BRAND_FRONT_FALLBACKS)) {
    if (b.includes(key)) return url;
  }
  return BRAND_FRONT_FALLBACKS.apple;
}

/**
 * Returns clean official studio upright device renders on white background.
 * Explicitly rejects low-quality/lifestyle unsplash stock photos.
 */
export function getCleanPhoneImage(brand?: string, model?: string, fallbackUrl?: string): string {
  const b = (brand || '').toLowerCase().trim();
  const m = (model || '').toLowerCase().trim();
  const fullText = `${b} ${m}`;
  const rawUrl = (fallbackUrl || '').trim();

  // 1. If valid non-Unsplash custom image (Base64 or explicit non-unsplash image URL), use it
  if (
    rawUrl &&
    !rawUrl.includes('unsplash.com') &&
    (rawUrl.startsWith('data:image/') || rawUrl.startsWith('http'))
  ) {
    return rawUrl;
  }

  // 2. Try exact model matching
  for (const item of MODEL_EXACT_RENDERS) {
    if (fullText.includes(item.keyword)) {
      return item.url;
    }
  }

  // 3. Try brand matching
  for (const [key, url] of Object.entries(BRAND_FRONT_FALLBACKS)) {
    if (b.includes(key) || m.includes(key)) {
      return url;
    }
  }

  return BRAND_FRONT_FALLBACKS.apple;
}
