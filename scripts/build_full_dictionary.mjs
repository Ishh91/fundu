import fs from 'fs';
import { ALL_INDIAN_PHONES_CATALOG } from '../src/data/indianPhonesCatalog.ts';
import { MOBILE_API_THUMBS } from '../src/data/deviceImageDictionary.ts';

const dict = { ...MOBILE_API_THUMBS };

function normalize(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
}

// 1. Add all from ALL_INDIAN_PHONES_CATALOG
for (const p of ALL_INDIAN_PHONES_CATALOG) {
  if (p.image_url && !p.image_url.includes('unsplash') && !p.image_url.includes('777/thumb')) {
    const full = normalize(`${p.brand} ${p.model}`);
    const mod = normalize(p.model);
    dict[full] = p.image_url;
    dict[mod] = p.image_url;
  }
}

// 2. Extra verified flagship & recent models
const extraModels = [
  // Samsung
  { name: 'Samsung Galaxy Z Fold6', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold6.jpg' },
  { name: 'Samsung Galaxy Z Fold5', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold5.jpg' },
  { name: 'Samsung Galaxy Z Fold4', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold4.jpg' },
  { name: 'Samsung Galaxy Z Flip6', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip6.jpg' },
  { name: 'Samsung Galaxy Z Flip5', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip5.jpg' },
  { name: 'Samsung Galaxy Z Flip4', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip4.jpg' },
  { name: 'Samsung Galaxy S25 Ultra', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s25-ultra-sm-s938.jpg' },
  { name: 'Samsung Galaxy S25 Plus', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-plus-5g-sm-s926.jpg' },
  { name: 'Samsung Galaxy S25', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-5g-sm-s921.jpg' },
  { name: 'Samsung Galaxy S24 Ultra', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-ultra-5g-sm-s928-stylus.jpg' },
  { name: 'Samsung Galaxy S24 Plus', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-plus-5g-sm-s926.jpg' },
  { name: 'Samsung Galaxy S24 FE', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-fe.jpg' },
  { name: 'Samsung Galaxy S24', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-5g-sm-s921.jpg' },
  { name: 'Samsung Galaxy S23 Ultra', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-ultra-5g.jpg' },
  { name: 'Samsung Galaxy S23 Plus', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-plus-5g.jpg' },
  { name: 'Samsung Galaxy S23 FE', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-fe.jpg' },
  { name: 'Samsung Galaxy S23', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-5g.jpg' },
  { name: 'Samsung Galaxy S22 Ultra', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s22-ultra-5g.jpg' },
  { name: 'Samsung Galaxy S22 Plus', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s22-plus-5g.jpg' },
  { name: 'Samsung Galaxy S22', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s22-5g.jpg' },
  { name: 'Samsung Galaxy S21 Ultra', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s21-ultra-5g-.jpg' },
  { name: 'Samsung Galaxy S21 FE', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s21-fe-5g.jpg' },
  { name: 'Samsung Galaxy S21', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s21-5g-r.jpg' },
  { name: 'Samsung Galaxy Note 20 Ultra', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-note20-ultra-5g-.jpg' },
  { name: 'Samsung Galaxy Note 20', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-note20-5g-r.jpg' },
  { name: 'Samsung Galaxy A55', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a55.jpg' },
  { name: 'Samsung Galaxy A54', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a54.jpg' },
  { name: 'Samsung Galaxy A35', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a35.jpg' },
  { name: 'Samsung Galaxy A34', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a34.jpg' },
  { name: 'Samsung Galaxy A15', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a15-5g.jpg' },
  { name: 'Samsung Galaxy A14', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a14-5g.jpg' },
  { name: 'Samsung Galaxy M55', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m55.jpg' },
  { name: 'Samsung Galaxy M35', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m35.jpg' },
  { name: 'Samsung Galaxy M34', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m34-5g.jpg' },
  { name: 'Samsung Galaxy F55', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f55.jpg' },

  // Apple
  { name: 'Apple iPhone 16 Pro Max', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro-max.jpg' },
  { name: 'Apple iPhone 16 Pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro.jpg' },
  { name: 'Apple iPhone 16 Plus', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-plus.jpg' },
  { name: 'Apple iPhone 16', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16.jpg' },
  { name: 'Apple iPhone 15 Pro Max', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro-max.jpg' },
  { name: 'Apple iPhone 15 Pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro.jpg' },
  { name: 'Apple iPhone 15 Plus', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-plus.jpg' },
  { name: 'Apple iPhone 15', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15.jpg' },
  { name: 'Apple iPhone 14 Pro Max', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14-pro-max.jpg' },
  { name: 'Apple iPhone 14 Pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14-pro.jpg' },
  { name: 'Apple iPhone 14 Plus', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14-plus.jpg' },
  { name: 'Apple iPhone 14', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14.jpg' },
  { name: 'Apple iPhone 13 Pro Max', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13-pro-max.jpg' },
  { name: 'Apple iPhone 13 Pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13-pro.jpg' },
  { name: 'Apple iPhone 13 mini', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13-mini.jpg' },
  { name: 'Apple iPhone 13', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13.jpg' },
  { name: 'Apple iPhone 12 Pro Max', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-12-pro-max.jpg' },
  { name: 'Apple iPhone 12 Pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-12-pro.jpg' },
  { name: 'Apple iPhone 12 mini', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-12-mini.jpg' },
  { name: 'Apple iPhone 12', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-12.jpg' },
  { name: 'Apple iPhone 11 Pro Max', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-11-pro-max.jpg' },
  { name: 'Apple iPhone 11 Pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-11-pro.jpg' },
  { name: 'Apple iPhone 11', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-11.jpg' },
  { name: 'Apple iPhone SE 2022', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-se-2022.jpg' },
  { name: 'Apple iPhone SE 2020', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-se-2020.jpg' },
  { name: 'Apple iPhone XR', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-xr.jpg' },
  { name: 'Apple iPhone XS Max', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-xs-max.jpg' },
  { name: 'Apple iPhone XS', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-xs.jpg' },
  { name: 'Apple iPhone X', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-x.jpg' },

  // OnePlus
  { name: 'OnePlus 12', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-12.jpg' },
  { name: 'OnePlus 12R', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-12r.jpg' },
  { name: 'OnePlus Open', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-open.jpg' },
  { name: 'OnePlus 11', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-11.jpg' },
  { name: 'OnePlus 11R', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-ace2.jpg' },
  { name: 'OnePlus Nord 4', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-4.jpg' },
  { name: 'OnePlus Nord CE4', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-ce4.jpg' },
  { name: 'OnePlus Nord CE4 Lite', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-ce4-lite.jpg' },
  { name: 'OnePlus 10 Pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-10-pro.jpg' },
  { name: 'OnePlus 10R', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-10r.jpg' },
  { name: 'OnePlus 10T', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-10t-5g.jpg' },
  { name: 'OnePlus 9 Pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-9-pro.jpg' },
  { name: 'OnePlus 9', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-9.jpg' },
  { name: 'OnePlus 9R', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-9r.jpg' },
  { name: 'OnePlus 9RT', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-9rt-5g.jpg' },

  // Realme
  { name: 'Realme GT 6', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-gt6.jpg' },
  { name: 'Realme GT 6T', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-gt-6t.jpg' },
  { name: 'Realme 13 Pro Plus', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-13-pro-plus.jpg' },
  { name: 'Realme 13 Pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-13-pro.jpg' },
  { name: 'Realme 12 Pro Plus', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-12-pro-plus.jpg' },
  { name: 'Realme 12 Pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-12-pro.jpg' },
  { name: 'Realme 12 Plus', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-12-plus.jpg' },
  { name: 'Realme 12', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-12-5g.jpg' },
  { name: 'Realme P1 Pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-p1-pro.jpg' },
  { name: 'Realme P1', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-p1.jpg' },
  { name: 'Realme Narzo 70 Pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-70-pro.jpg' },
  { name: 'Realme Narzo 70x', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-70x.jpg' },
  { name: 'Realme Narzo 60 Pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-60-pro.jpg' },
  { name: 'Realme Narzo 60', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-60.jpg' },

  // Xiaomi & Redmi
  { name: 'Xiaomi 14 Ultra', url: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-14-ultra.jpg' },
  { name: 'Xiaomi 14', url: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-14.jpg' },
  { name: 'Xiaomi 13 Pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-13-pro.jpg' },
  { name: 'Xiaomi 12 Pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-12-pro.jpg' },
  { name: 'Redmi Note 13 Pro Plus', url: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-pro-plus.jpg' },
  { name: 'Redmi Note 13 Pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-pro-5g.jpg' },
  { name: 'Redmi Note 13', url: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-5g.jpg' },
  { name: 'Redmi Note 12 Pro Plus', url: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-12-pro-plus.jpg' },
  { name: 'Redmi Note 12 Pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-12-pro.jpg' },
  { name: 'Redmi Note 12', url: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-12.jpg' },
  { name: 'Redmi 13 5G', url: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-13-5g.jpg' },
  { name: 'Redmi 12 5G', url: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-12-5g.jpg' },

  // Vivo
  { name: 'Vivo X100 Pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x100-pro.jpg' },
  { name: 'Vivo X100', url: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x100.jpg' },
  { name: 'Vivo X90 Pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x90-pro.jpg' },
  { name: 'Vivo V40 Pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v40-pro.jpg' },
  { name: 'Vivo V40', url: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v40.jpg' },
  { name: 'Vivo V30 Pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v30-pro.jpg' },
  { name: 'Vivo V30', url: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v30.jpg' },
  { name: 'Vivo V29 Pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v29-pro.jpg' },
  { name: 'Vivo V29', url: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v29.jpg' },
  { name: 'Vivo T3 Ultra', url: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-t3-ultra.jpg' },
  { name: 'Vivo T3 Pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-t3-pro.jpg' },
  { name: 'Vivo T3 5G', url: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-t3.jpg' },

  // iQOO
  { name: 'iQOO 12', url: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo12.jpg' },
  { name: 'iQOO Neo 9 Pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-neo9-pro.jpg' },
  { name: 'iQOO Neo 7 Pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-neo-7-pro.jpg' },
  { name: 'iQOO Z9s Pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-z9s-pro.jpg' },
  { name: 'iQOO Z9s', url: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-z9s.jpg' },
  { name: 'iQOO Z9', url: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-z9.jpg' },

  // Poco
  { name: 'Poco F6 Pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-f6-pro.jpg' },
  { name: 'Poco F6', url: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-f6.jpg' },
  { name: 'Poco X6 Pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-x6-pro.jpg' },
  { name: 'Poco X6', url: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-x6.jpg' },
  { name: 'Poco M6 Pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-m6-pro.jpg' },
  { name: 'Poco M6 Plus', url: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-m6-plus.jpg' },
  { name: 'Poco C65', url: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-c65.jpg' },

  // Google Pixel
  { name: 'Google Pixel 9 Pro Fold', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-9-pro-fold.jpg' },
  { name: 'Google Pixel 9 Pro XL', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-9-pro-xl.jpg' },
  { name: 'Google Pixel 9 Pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-9-pro-.jpg' },
  { name: 'Google Pixel 9', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-9.jpg' },
  { name: 'Google Pixel 8a', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8a.jpg' },
  { name: 'Google Pixel 8 Pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8-pro.jpg' },
  { name: 'Google Pixel 8', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8.jpg' },
  { name: 'Google Pixel 7a', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-7a.jpg' },
  { name: 'Google Pixel 7 Pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-7-pro.jpg' },
  { name: 'Google Pixel 7', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-7.jpg' },
  { name: 'Google Pixel 6a', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-6a.jpg' },
  { name: 'Google Pixel 6 Pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-6-pro.jpg' },
  { name: 'Google Pixel 6', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-6.jpg' },

  // Motorola
  { name: 'Motorola Edge 50 Ultra', url: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-50-ultra.jpg' },
  { name: 'Motorola Edge 50 Pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-50-pro.jpg' },
  { name: 'Motorola Edge 50 Fusion', url: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-50-fusion.jpg' },
  { name: 'Motorola Razr 50 Ultra', url: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-razr-50-ultra.jpg' },
  { name: 'Motorola Razr 40 Ultra', url: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-razr-40-ultra.jpg' },
  { name: 'Moto G85', url: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-moto-g85.jpg' },
  { name: 'Moto G64', url: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-moto-g64.jpg' },

  // Nothing
  { name: 'Nothing Phone 2a Plus', url: 'https://fdn2.gsmarena.com/vv/bigpic/nothing-phone-2a-plus.jpg' },
  { name: 'Nothing Phone 2a', url: 'https://fdn2.gsmarena.com/vv/bigpic/nothing-phone-2a.jpg' },
  { name: 'Nothing Phone 2', url: 'https://fdn2.gsmarena.com/vv/bigpic/nothing-phone-2.jpg' },
  { name: 'Nothing Phone 1', url: 'https://fdn2.gsmarena.com/vv/bigpic/nothing-phone-1.jpg' },
  { name: 'CMF Phone 1', url: 'https://fdn2.gsmarena.com/vv/bigpic/nothing-cmf-phone-1.jpg' },

  // Infinix & Tecno
  { name: 'Infinix GT 20 Pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/infinix-gt-20-pro.jpg' },
  { name: 'Infinix Note 40 Pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/infinix-note-40-pro-5g.jpg' },
  { name: 'Infinix Zero 30', url: 'https://fdn2.gsmarena.com/vv/bigpic/infinix-zero-30-5g.jpg' },
  { name: 'Tecno Camon 30 Pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/tecno-camon-30-pro.jpg' },
  { name: 'Tecno Pova 6 Pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/tecno-pova-6-pro.jpg' },

  // Lenovo
  { name: 'Lenovo K10 Note', url: 'https://fdn2.gsmarena.com/vv/bigpic/lenovo-k10-note.jpg' },
  { name: 'Lenovo K10 Plus', url: 'https://fdn2.gsmarena.com/vv/bigpic/lenovo-k10-plus.jpg' },
  { name: 'Lenovo K9 Note', url: 'https://fdn2.gsmarena.com/vv/bigpic/lenovo-k9-note.jpg' },
  { name: 'Lenovo K8 Note', url: 'https://fdn2.gsmarena.com/vv/bigpic/lenovo-k8-note.jpg' },
  { name: 'Lenovo Legion Duel 2', url: 'https://fdn2.gsmarena.com/vv/bigpic/lenovo-legion-duel-2.jpg' },
  { name: 'Lenovo Z6 Pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/lenovo-z6-pro.jpg' },
];

for (const m of extraModels) {
  const norm = normalize(m.name);
  dict[norm] = m.url;
}

const fileHeader = `export const MOBILE_API_THUMBS: Record<string, string> = `;
const json = JSON.stringify(dict, null, 2);
fs.writeFileSync('src/data/deviceImageDictionary.ts', `${fileHeader}${json};\n`);

console.log('Successfully wrote deviceImageDictionary.ts with', Object.keys(dict).length, 'entries.');
