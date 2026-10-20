const familyFallbacks = {
  // Apple
  apple_flagship: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro.jpg',
  apple_max: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro-max.jpg',
  apple_base: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16.jpg',
  apple_se: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-se-2022.jpg',
  apple_ipad: 'https://fdn2.gsmarena.com/vv/bigpic/apple-ipad-pro-13-2024.jpg',

  // Samsung
  samsung_s_ultra: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s25-ultra-sm-s938.jpg',
  samsung_s_base: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-5g-sm-s921.jpg',
  samsung_fold: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold6.jpg',
  samsung_flip: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip6.jpg',
  samsung_note: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-note20-ultra-.jpg',
  samsung_a: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a55.jpg',
  samsung_m: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m55-5g.jpg',
  samsung_f: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f55.jpg',
  samsung_j: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j7-prime.jpg',

  // OnePlus
  oneplus_flagship: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-12.jpg',
  oneplus_r: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-12r.jpg',
  oneplus_nord: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-ce4.jpg',
  oneplus_open: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-open.jpg',

  // Xiaomi & Redmi & Poco
  xiaomi_flagship: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-14-pro.jpg',
  xiaomi_ultra: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-14-ultra.jpg',
  xiaomi_redmi_note: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-pro-plus.jpg',
  xiaomi_redmi_c: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-13c.jpg',
  xiaomi_poco_x: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-x6-pro.jpg',
  xiaomi_poco_f: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-f6-pro.jpg',
  xiaomi_poco_m: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-m6-pro.jpg',

  // Realme
  realme_flagship: 'https://fdn2.gsmarena.com/vv/bigpic/realme-13-pro-plus.jpg',
  realme_gt: 'https://fdn2.gsmarena.com/vv/bigpic/realme-gt6.jpg',
  realme_narzo: 'https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-70-pro.jpg',
  realme_p: 'https://fdn2.gsmarena.com/vv/bigpic/realme-p1-pro.jpg',
  realme_c: 'https://fdn2.gsmarena.com/vv/bigpic/realme-c67-4g.jpg',

  // Vivo & iQOO
  vivo_x: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x100-pro.jpg',
  vivo_v: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v40-pro.jpg',
  vivo_t: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-t3-pro.jpg',
  vivo_y: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-y200-pro.jpg',
  iqoo_flagship: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo12.jpg',
  iqoo_neo: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-neo9-pro.jpg',
  iqoo_z: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-z9s-pro.jpg',

  // Oppo
  oppo_find: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-find-x7-ultra.jpg',
  oppo_reno: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-reno12-pro.jpg',
  oppo_f: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-f27-pro-plus.jpg',
  oppo_k: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-k12x-5g.jpg',
  oppo_a: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-a79-5g.jpg',

  // Motorola
  motorola_razr: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-razr-50-ultra.jpg',
  motorola_edge: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-50-pro.jpg',
  motorola_g: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-moto-g84.jpg',
  motorola_e: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-moto-e13.jpg',

  // Google
  google_fold: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-9-pro-fold.jpg',
  google_pro: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-9-pro-.jpg',
  google_base: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-9.jpg',

  // Others
  tecno: 'https://fdn2.gsmarena.com/vv/bigpic/tecno-camon-30-pro.jpg',
  infinix: 'https://fdn2.gsmarena.com/vv/bigpic/infinix-gt-20-pro.jpg',
  itel: 'https://fdn2.gsmarena.com/vv/bigpic/itel-s24.jpg',
  nothing: 'https://fdn2.gsmarena.com/vv/bigpic/nothing-phone-2a.jpg',
  lenovo: 'https://fdn2.gsmarena.com/vv/bigpic/lenovo-legion-duel-2.jpg'
};

async function testAll() {
  const bad = [];
  for (const [name, url] of Object.entries(familyFallbacks)) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (res.status !== 200) bad.push({ name, url, status: res.status });
    } catch (e) {
      bad.push({ name, url, error: e.message });
    }
  }
  console.log(`Tested ${Object.keys(familyFallbacks).length} family renders. Bad:`, bad);
}
testAll();
