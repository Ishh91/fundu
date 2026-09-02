/**
 * Cashify-Style Clean Smartphone Product Renders
 * Provides official front-facing upright device renders on clean white backgrounds.
 */

// Brand-Specific Clean Front Renders for Fallback
const BRAND_FRONT_FALLBACKS: Record<string, string> = {
  apple: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro-max.jpg',
  iphone: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro-max.jpg',
  samsung: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-ultra-5g.jpg',
  oneplus: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-12.jpg',
  xiaomi: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-pro-plus.jpg',
  redmi: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-pro-plus.jpg',
  poco: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-x6-pro.jpg',
  vivo: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x100-pro.jpg',
  realme: 'https://fdn2.gsmarena.com/vv/bigpic/realme-12-pro-plus.jpg',
  oppo: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-reno11-pro-5g-international.jpg',
  google: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8-pro.jpg',
  pixel: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8-pro.jpg',
  motorola: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-50-pro.jpg',
  moto: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-50-pro.jpg',
  nothing: 'https://fdn2.gsmarena.com/vv/bigpic/nothing-phone-2.jpg',
  infinix: 'https://fdn2.gsmarena.com/vv/bigpic/infinix-zero-30-5g.jpg',
  tecno: 'https://fdn2.gsmarena.com/vv/bigpic/tecno-camon-30-pro.jpg',
  iqoo: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-12.jpg',
};

export function getCleanBrandLogo(brandName?: string): string {
  const b = (brandName || '').toLowerCase().trim();
  for (const [key, url] of Object.entries(BRAND_FRONT_FALLBACKS)) {
    if (b.includes(key)) return url;
  }
  return 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro-max.jpg';
}

export function getCleanPhoneImage(brand?: string, model?: string, fallbackUrl?: string): string {
  const b = (brand || '').toLowerCase().trim();
  const m = (model || '').toLowerCase().trim();

  // If a valid custom base64 image or uploaded URL is provided (not an unsplash stock photo), use it
  if (fallbackUrl && (fallbackUrl.startsWith('data:image/') || (fallbackUrl.startsWith('http') && !fallbackUrl.includes('unsplash.com')))) {
    return fallbackUrl;
  }

  // Apple iPhone Renders
  if (b.includes('apple') || m.includes('iphone')) {
    if (m.includes('16 pro max')) return 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro-max.jpg';
    if (m.includes('16 pro')) return 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro-max.jpg';
    if (m.includes('16')) return 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16.jpg';
    if (m.includes('15 pro max')) return 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro-max.jpg';
    if (m.includes('15 pro')) return 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro-max.jpg';
    if (m.includes('15')) return 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15.jpg';
    if (m.includes('14 pro max')) return 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14-pro-max.jpg';
    if (m.includes('14 pro')) return 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14-pro-max.jpg';
    if (m.includes('14')) return 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14.jpg';
    if (m.includes('13 pro max')) return 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13-pro-max.jpg';
    if (m.includes('13 pro')) return 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13-pro-max.jpg';
    if (m.includes('13')) return 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13.jpg';
    if (m.includes('12 pro max')) return 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-12-pro-max.jpg';
    if (m.includes('12 pro')) return 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-12-pro.jpg';
    if (m.includes('12')) return 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-12.jpg';
    if (m.includes('11 pro')) return 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-11-pro.jpg';
    if (m.includes('11')) return 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-11.jpg';
    if (m.includes('xr')) return 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-xr.jpg';
    if (m.includes('xs')) return 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-xs-max.jpg';
    if (m.includes('se')) return 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-se-2022.jpg';
    return BRAND_FRONT_FALLBACKS.apple;
  }

  // Samsung Galaxy Renders
  if (b.includes('samsung') || m.includes('galaxy') || m.includes('s24') || m.includes('s23') || m.includes('s22')) {
    if (m.includes('s25')) return 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-ultra-5g.jpg';
    if (m.includes('s24 ultra')) return 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-ultra-5g.jpg';
    if (m.includes('s24')) return 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24.jpg';
    if (m.includes('s23 ultra')) return 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-ultra-5g.jpg';
    if (m.includes('s23')) return 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-5g.jpg';
    if (m.includes('s22 ultra')) return 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s22-ultra-5g.jpg';
    if (m.includes('s22')) return 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s22-5g.jpg';
    if (m.includes('s21 ultra')) return 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s21-ultra-5g-.jpg';
    if (m.includes('s21')) return 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s21-5g.jpg';
    if (m.includes('s20')) return 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s20-5g.jpg';
    if (m.includes('fold')) return 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold5.jpg';
    if (m.includes('flip')) return 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip5.jpg';
    if (m.includes('a55') || m.includes('a54')) return 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a55.jpg';
    if (m.includes('a35') || m.includes('a34')) return 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a35.jpg';
    return BRAND_FRONT_FALLBACKS.samsung;
  }

  // OnePlus Renders
  if (b.includes('oneplus') || m.includes('nord') || m.includes('oneplus')) {
    if (m.includes('12r')) return 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-12r.jpg';
    if (m.includes('12')) return 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-12.jpg';
    if (m.includes('11r')) return 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-11r.jpg';
    if (m.includes('11')) return 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-11.jpg';
    if (m.includes('10 pro')) return 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-10-pro.jpg';
    if (m.includes('10t') || m.includes('10r')) return 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-10t-5g.jpg';
    if (m.includes('open')) return 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-open.jpg';
    if (m.includes('nord 4')) return 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-4.jpg';
    if (m.includes('nord 3')) return 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-3.jpg';
    if (m.includes('nord 2t')) return 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-2t-5g.jpg';
    if (m.includes('nord 2')) return 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-2-5g.jpg';
    if (m.includes('nord ce 4')) return 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-ce4.jpg';
    if (m.includes('nord ce 3 lite')) return 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-ce3-lite-.jpg';
    return BRAND_FRONT_FALLBACKS.oneplus;
  }

  // Xiaomi / Redmi / POCO Renders
  if (b.includes('xiaomi') || b.includes('redmi') || b.includes('poco') || m.includes('redmi') || m.includes('mi ')) {
    if (m.includes('14 ultra') || m.includes('14 pro') || m.includes('xiaomi 14')) return 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-14-ultra.jpg';
    if (m.includes('13 pro') && !m.includes('redmi')) return 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-13-pro.jpg';
    if (m.includes('note 13 pro+')) return 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-pro-plus.jpg';
    if (m.includes('note 13 pro')) return 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-pro.jpg';
    if (m.includes('note 13')) return 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-5g.jpg';
    if (m.includes('note 12 pro')) return 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-12-pro.jpg';
    if (m.includes('poco x6')) return 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-x6-pro.jpg';
    if (m.includes('poco f6')) return 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-f6-pro.jpg';
    return BRAND_FRONT_FALLBACKS.xiaomi;
  }

  // Vivo Renders
  if (b.includes('vivo')) {
    if (m.includes('x200')) return 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x200-pro.jpg';
    if (m.includes('x100')) return 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x100-pro.jpg';
    if (m.includes('v40')) return 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v40-pro.jpg';
    if (m.includes('v30')) return 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v30-pro.jpg';
    if (m.includes('v29')) return 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v29-pro.jpg';
    if (m.includes('t3')) return 'https://fdn2.gsmarena.com/vv/bigpic/vivo-t3.jpg';
    if (m.includes('t2')) return 'https://fdn2.gsmarena.com/vv/bigpic/vivo-t2-pro.jpg';
    return BRAND_FRONT_FALLBACKS.vivo;
  }

  // Realme Renders
  if (b.includes('realme')) {
    if (m.includes('13 pro') || m.includes('12 pro')) return 'https://fdn2.gsmarena.com/vv/bigpic/realme-12-pro-plus.jpg';
    if (m.includes('gt 6') || m.includes('gt 5')) return 'https://fdn2.gsmarena.com/vv/bigpic/realme-gt6.jpg';
    if (m.includes('narzo')) return 'https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-70-pro.jpg';
    return BRAND_FRONT_FALLBACKS.realme;
  }

  // Google Pixel Renders
  if (b.includes('google') || m.includes('pixel')) {
    if (m.includes('9 pro')) return 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-9-pro.jpg';
    if (m.includes('8 pro')) return 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8-pro.jpg';
    if (m.includes('7a')) return 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-7a.jpg';
    return BRAND_FRONT_FALLBACKS.google;
  }

  // Motorola Renders
  if (b.includes('motorola') || b.includes('moto')) {
    if (m.includes('edge 50')) return 'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-50-pro.jpg';
    if (m.includes('edge 40')) return 'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-40-neo.jpg';
    return BRAND_FRONT_FALLBACKS.motorola;
  }

  // Oppo Renders
  if (b.includes('oppo')) {
    if (m.includes('reno 11')) return 'https://fdn2.gsmarena.com/vv/bigpic/oppo-reno11-pro-5g-international.jpg';
    if (m.includes('reno 10')) return 'https://fdn2.gsmarena.com/vv/bigpic/oppo-reno10-pro-5g-international.jpg';
    return BRAND_FRONT_FALLBACKS.oppo;
  }

  // Fallback by checking brand match
  for (const [key, url] of Object.entries(BRAND_FRONT_FALLBACKS)) {
    if (b.includes(key) || m.includes(key)) return url;
  }

  return BRAND_FRONT_FALLBACKS.apple;
}
