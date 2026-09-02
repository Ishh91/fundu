/**
 * Cashify-Style Clean Smartphone Product Renders
 * Provides official front-facing device renders on clean white backgrounds.
 */

export function getCleanPhoneImage(brand?: string, model?: string, fallbackUrl?: string): string {
  const b = (brand || '').toLowerCase();
  const m = (model || '').toLowerCase();

  // Apple iPhone Renders
  if (b.includes('apple') || m.includes('iphone')) {
    if (m.includes('16 pro')) return 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro-max.jpg';
    if (m.includes('16')) return 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16.jpg';
    if (m.includes('15 pro')) return 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro-max.jpg';
    if (m.includes('15')) return 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15.jpg';
    if (m.includes('14 pro')) return 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14-pro-max.jpg';
    if (m.includes('14')) return 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14.jpg';
    if (m.includes('13 pro')) return 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13-pro-max.jpg';
    if (m.includes('13')) return 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13.jpg';
    if (m.includes('12')) return 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-12.jpg';
    if (m.includes('11')) return 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-11.jpg';
    return 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro-max.jpg';
  }

  // Samsung Galaxy Renders
  if (b.includes('samsung') || m.includes('galaxy')) {
    if (m.includes('s25')) return 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-ultra-5g.jpg';
    if (m.includes('s24 ultra')) return 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-ultra-5g.jpg';
    if (m.includes('s24')) return 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24.jpg';
    if (m.includes('s23 ultra')) return 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-ultra-5g.jpg';
    if (m.includes('s23')) return 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-5g.jpg';
    if (m.includes('s21 ultra')) return 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s21-ultra-5g-.jpg';
    if (m.includes('fold')) return 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold5.jpg';
    if (m.includes('flip')) return 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip5.jpg';
    if (m.includes('a55') || m.includes('a54')) return 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a55.jpg';
    return 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-ultra-5g.jpg';
  }

  // OnePlus Renders
  if (b.includes('oneplus') || m.includes('nord') || m.includes('oneplus')) {
    if (m.includes('12r')) return 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-12r.jpg';
    if (m.includes('12')) return 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-12.jpg';
    if (m.includes('11')) return 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-11.jpg';
    if (m.includes('open')) return 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-open.jpg';
    if (m.includes('nord 4')) return 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-4.jpg';
    if (m.includes('nord 3')) return 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-3.jpg';
    if (m.includes('nord 2t')) return 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-2t-5g.jpg';
    if (m.includes('nord 2')) return 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-2-5g.jpg';
    if (m.includes('nord ce 4')) return 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-ce4.jpg';
    if (m.includes('nord ce 3 lite')) return 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-ce3-lite-.jpg';
    return 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-12.jpg';
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
    return 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-pro-plus.jpg';
  }

  // Vivo Renders
  if (b.includes('vivo')) {
    if (m.includes('x200')) return 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x200-pro.jpg';
    if (m.includes('x100')) return 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x100-pro.jpg';
    if (m.includes('v30')) return 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v30-pro.jpg';
    if (m.includes('v40')) return 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v40-pro.jpg';
    if (m.includes('t3')) return 'https://fdn2.gsmarena.com/vv/bigpic/vivo-t3.jpg';
    return 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x100-pro.jpg';
  }

  // Realme Renders
  if (b.includes('realme')) {
    if (m.includes('13 pro') || m.includes('12 pro')) return 'https://fdn2.gsmarena.com/vv/bigpic/realme-12-pro-plus.jpg';
    if (m.includes('gt 6') || m.includes('gt 5')) return 'https://fdn2.gsmarena.com/vv/bigpic/realme-gt6.jpg';
    return 'https://fdn2.gsmarena.com/vv/bigpic/realme-12-pro-plus.jpg';
  }

  // Google Pixel Renders
  if (b.includes('google') || m.includes('pixel')) {
    if (m.includes('9 pro')) return 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-9-pro.jpg';
    if (m.includes('8 pro')) return 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8-pro.jpg';
    if (m.includes('7a')) return 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-7a.jpg';
    return 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8-pro.jpg';
  }

  // Motorola Renders
  if (b.includes('motorola') || b.includes('moto')) {
    if (m.includes('edge 50')) return 'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-50-pro.jpg';
    return 'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-50-pro.jpg';
  }

  // If fallbackUrl exists and is a valid external URL, return it
  if (fallbackUrl && fallbackUrl.startsWith('http')) {
    return fallbackUrl;
  }

  return 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro-max.jpg';
}
