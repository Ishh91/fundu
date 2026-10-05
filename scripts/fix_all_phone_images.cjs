const fs = require('fs');

// Master Exact GSMArena Studio Render Mapping
const EXACT_PHONE_IMAGES = {
  // === APPLE IPHONE ===
  'iphone 17 pro max': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro-max.jpg',
  'iphone 17 pro': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro.jpg',
  'iphone 17 air': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16.jpg',
  'iphone 17 slim': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16.jpg',
  'iphone 17': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16.jpg',
  'iphone 16 pro max': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro-max.jpg',
  'iphone 16 pro': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro.jpg',
  'iphone 16 plus': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16.jpg',
  'iphone 16': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16.jpg',
  'iphone 15 pro max': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro-max.jpg',
  'iphone 15 pro': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro.jpg',
  'iphone 15 plus': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15.jpg',
  'iphone 15': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15.jpg',
  'iphone 14 pro max': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14-pro.jpg',
  'iphone 14 pro': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14-pro.jpg',
  'iphone 14 plus': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14.jpg',
  'iphone 14': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14.jpg',
  'iphone 13 pro max': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13-pro-max.jpg',
  'iphone 13 pro': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13-pro.jpg',
  'iphone 13 mini': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13-mini.jpg',
  'iphone 13': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13.jpg',
  'iphone 12 pro max': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-12-pro-max-.jpg',
  'iphone 12 pro': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-12-pro--.jpg',
  'iphone 12 mini': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-12-mini.jpg',
  'iphone 12': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-12.jpg',
  'iphone 11 pro max': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-11-pro.jpg',
  'iphone 11 pro': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-11-pro.jpg',
  'iphone 11': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-11.jpg',
  'iphone xs max': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-xs-max-new1.jpg',
  'iphone xs': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-xs-new.jpg',
  'iphone xr': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-xr-new.jpg',
  'iphone x': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-x.jpg',
  'iphone 8 plus': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-8.jpg',
  'iphone 8': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-8.jpg',
  'iphone 7 plus': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-7-plus-r2.jpg',
  'iphone 7': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-7r4.jpg',
  'iphone 6s plus': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-6s-plus.jpg',
  'iphone 6s': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-6s.jpg',
  'iphone 6 plus': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-6-plus.jpg',
  'iphone 6': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-6.jpg',
  'iphone se 2022': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-se-2022.jpg',
  'iphone se 2020': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-se-2020.jpg',
  'iphone se 2016': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-5s.jpg',
  'iphone 5s': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-5s.jpg',
  'iphone 5c': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-5c.jpg',
  'iphone 5': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-5.jpg',
  'iphone 4s': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-4s.jpg',
  'iphone 4': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-4.jpg',
  'iphone 3gs': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-3gs.jpg',
  'iphone 3g': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-3g.jpg',
  'iphone 1': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone.jpg',

  // === SAMSUNG GALAXY ===
  'galaxy s25 ultra': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s25-ultra-sm-s938.jpg',
  'galaxy s25+': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-plus-5g-sm-s926.jpg',
  'galaxy s25 plus': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-plus-5g-sm-s926.jpg',
  'galaxy s25': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-5g-sm-s921.jpg',
  'galaxy s24 ultra': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-ultra-5g-sm-s928-stylus.jpg',
  'galaxy s24+': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-plus-5g-sm-s926.jpg',
  'galaxy s24 plus': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-plus-5g-sm-s926.jpg',
  'galaxy s24 fe': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-fe.jpg',
  'galaxy s24': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-5g-sm-s921.jpg',
  'galaxy s23 ultra': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-ultra-5g.jpg',
  'galaxy s23+': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-plus-5g.jpg',
  'galaxy s23 plus': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-plus-5g.jpg',
  'galaxy s23 fe': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-fe.jpg',
  'galaxy s23': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-5g.jpg',
  'galaxy s22 ultra': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s22-ultra-5g.jpg',
  'galaxy s22+': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s22-plus-5g.jpg',
  'galaxy s22 plus': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s22-plus-5g.jpg',
  'galaxy s22': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s22-5g.jpg',
  'galaxy s21 ultra': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s21-ultra-5g-.jpg',
  'galaxy s21+': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s21-plus-5g-.jpg',
  'galaxy s21 plus': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s21-plus-5g-.jpg',
  'galaxy s21 fe': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s21-fe-5g.jpg',
  'galaxy s21': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s21-5g-r.jpg',
  'galaxy s20 ultra': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s20-ultra-5g-r.jpg',
  'galaxy s20+': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s20-plus-5g-r.jpg',
  'galaxy s20 fe': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s20-fe-5g.jpg',
  'galaxy s20': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s20-5g-r.jpg',
  'galaxy s10+': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s10-plus-new.jpg',
  'galaxy s10 plus': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s10-plus-new.jpg',
  'galaxy s10': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s10-1.jpg',
  'galaxy z fold6': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold6.jpg',
  'galaxy z flip6': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip6.jpg',
  'galaxy z fold5': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold5.jpg',
  'galaxy z flip5': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip5.jpg',
  'galaxy z fold4': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold4.jpg',
  'galaxy z flip4': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip4.jpg',
  'galaxy note 20 ultra': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-note20-ultra-5g-.jpg',
  'galaxy note 20': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-note20-5g-r.jpg',
  'galaxy note 10+': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-note10-plus-.jpg',
  'galaxy note 10': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-note10-.jpg',
  'galaxy a55': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a55.jpg',
  'galaxy a54': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a54.jpg',
  'galaxy a53': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a53-5g.jpg',
  'galaxy a35': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a35.jpg',
  'galaxy a34': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a34.jpg',
  'galaxy m55': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m55.jpg',
  'galaxy m34': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m34-5g.jpg',
  'galaxy f54': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f54.jpg',

  // === ONEPLUS ===
  'oneplus 13': 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-12.jpg',
  'oneplus 12r': 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-12r.jpg',
  'oneplus 12': 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-12.jpg',
  'oneplus 11r': 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-ace2.jpg',
  'oneplus 11': 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-11.jpg',
  'oneplus 10 pro': 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-10-pro.jpg',
  'oneplus 10r': 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-10r.jpg',
  'oneplus 10t': 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-10t.jpg',
  'oneplus 9 pro': 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-9-pro-.jpg',
  'oneplus 9rt': 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-9rt-5g.jpg',
  'oneplus 9r': 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-9r.jpg',
  'oneplus 9': 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-9-pro-.jpg',
  'oneplus 8 pro': 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-8-pro.jpg',
  'oneplus 8t': 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-8t.jpg',
  'oneplus 8': 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-8.jpg',
  'oneplus 7t pro': 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-7t-pro.jpg',
  'oneplus 7t': 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-7t-.jpg',
  'oneplus 7 pro': 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-7-pro-r.jpg',
  'oneplus 7': 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-7.jpg',
  'oneplus 6t': 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-6t.jpg',
  'oneplus 6': 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-6.jpg',
  'oneplus nord 4': 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-4.jpg',
  'oneplus nord 3': 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-3r.jpg',
  'oneplus nord 2t': 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-2t.jpg',
  'oneplus nord 2': 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-2-5g.jpg',
  'oneplus nord ce 4': 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-ce4.jpg',
  'oneplus nord ce 3 lite': 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-ce-3-lite.jpg',
  'oneplus nord ce 2': 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-ce-2-5g.jpg',
  'oneplus open': 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-open.jpg',

  // === XIAOMI / REDMI / POCO ===
  'xiaomi 14 ultra': 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-14-ultra.jpg',
  'xiaomi 14': 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-14-pro.jpg',
  'xiaomi 13 pro': 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-13-pro.jpg',
  'redmi note 13 pro+': 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-pro-plus.jpg',
  'redmi note 13 pro': 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-pro-5g.jpg',
  'redmi note 13': 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13.jpg',
  'redmi 13 5g': 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-13-5g.jpg',
  'redmi 13c': 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-13c-5g.jpg',
  'redmi note 12 pro+': 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-12-pro-plus.jpg',
  'redmi note 12 pro': 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-12-pro-plus.jpg',
  'redmi note 12': 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-12-5g.jpg',
  'redmi note 11 pro': 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-11-pro-plus-5g.jpg',
  'redmi note 11': 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-11-global.jpg',
  'redmi note 10 pro max': 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note10-pro.jpg',
  'redmi note 10 pro': 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note10-pro.jpg',
  'redmi note 10': 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note10.jpg',
  'redmi note 9 pro': 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-9-pro-global-.jpg',
  'redmi note 9': 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-9.jpg',
  'redmi note 8 pro': 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-8-pro.jpg',
  'redmi note 8': 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-8.jpg',
  'redmi note 7 pro': 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-7-pro.jpg',
  'redmi note 4': 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-4.jpg',
  'poco f6 pro': 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-f6-pro.jpg',
  'poco f6': 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-f6.jpg',
  'poco x6 pro': 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-x6-pro.jpg',
  'poco x6': 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-x6-pro.jpg',
  'poco m6 pro': 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-m6-pro.jpg',
  'poco m6': 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-m6-pro.jpg',
  'poco c65': 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-c65.jpg',

  // === VIVO / IQOO ===
  'vivo x200 pro': 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x200-pro.jpg',
  'vivo x200': 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x200.jpg',
  'vivo x100 ultra': 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x100-ultra.jpg',
  'vivo x100 pro': 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x100-pro.jpg',
  'vivo x100': 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x100.jpg',
  'vivo x fold3 pro': 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x-fold3-pro.jpg',
  'vivo x90 pro': 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x90-pro.jpg',
  'vivo x90': 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x90.jpg',
  'vivo x80 pro': 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x80-pro.jpg',
  'vivo x80': 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x80.jpg',
  'vivo v40 pro': 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v40-pro.jpg',
  'vivo v40': 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v40.jpg',
  'vivo v30 pro': 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v30-pro.jpg',
  'vivo v30': 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v30.jpg',
  'vivo v29 pro': 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v29-pro.jpg',
  'vivo v29': 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v29.jpg',
  'vivo t3 pro': 'https://fdn2.gsmarena.com/vv/bigpic/vivo-t3-pro.jpg',
  'vivo t3': 'https://fdn2.gsmarena.com/vv/bigpic/vivo-t3-5g.jpg',
  'vivo y200': 'https://fdn2.gsmarena.com/vv/bigpic/vivo-y200.jpg',
  'iqoo 13': 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo12.jpg',
  'iqoo 12': 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo12.jpg',
  'iqoo neo 9 pro': 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-neo9-pro.jpg',
  'iqoo neo 7 pro': 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-neo-7-pro.jpg',
  'iqoo z9': 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-z9.jpg',

  // === REALME ===
  'realme gt 6t': 'https://fdn2.gsmarena.com/vv/bigpic/realme-gt-6t.jpg',
  'realme gt 6': 'https://fdn2.gsmarena.com/vv/bigpic/realme-gt-6t.jpg',
  'realme 13 pro+': 'https://fdn2.gsmarena.com/vv/bigpic/realme-13-pro-plus.jpg',
  'realme 13 pro': 'https://fdn2.gsmarena.com/vv/bigpic/realme-13-pro-plus.jpg',
  'realme 12 pro+': 'https://fdn2.gsmarena.com/vv/bigpic/realme-12-pro-plus.jpg',
  'realme 12 pro': 'https://fdn2.gsmarena.com/vv/bigpic/realme-12-pro.jpg',
  'realme 11 pro+': 'https://fdn2.gsmarena.com/vv/bigpic/realme-11-pro-plus.jpg',
  'realme 11 pro': 'https://fdn2.gsmarena.com/vv/bigpic/realme-11-pro.jpg',
  'realme narzo 70 pro': 'https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-70-pro.jpg',
  'realme p1 pro': 'https://fdn2.gsmarena.com/vv/bigpic/realme-p1-pro.jpg',
  'realme p1': 'https://fdn2.gsmarena.com/vv/bigpic/realme-p1.jpg',

  // === GOOGLE PIXEL ===
  'pixel 9 pro xl': 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-9-pro-xl.jpg',
  'pixel 9 pro': 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-9-pro.jpg',
  'pixel 9': 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-9.jpg',
  'pixel 8 pro': 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8-pro.jpg',
  'pixel 8a': 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8a.jpg',
  'pixel 8': 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8.jpg',
  'pixel 7 pro': 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-7-pro.jpg',
  'pixel 7a': 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-7a.jpg',
  'pixel 7': 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-7.jpg',
  'pixel 6 pro': 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-6-pro.jpg',
  'pixel 6a': 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-6a.jpg',
  'pixel 6': 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-6.jpg',

  // === MOTOROLA ===
  'motorola edge 50 ultra': 'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-50-ultra.jpg',
  'motorola edge 50 pro': 'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-50-pro.jpg',
  'motorola edge 40': 'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-40.jpg',
  'moto g85': 'https://fdn2.gsmarena.com/vv/bigpic/motorola-moto-g85.jpg',
  'moto g84': 'https://fdn2.gsmarena.com/vv/bigpic/motorola-moto-g84.jpg',
  'moto g54': 'https://fdn2.gsmarena.com/vv/bigpic/motorola-moto-g54.jpg',

  // === OPPO ===
  'oppo reno 12 pro': 'https://fdn2.gsmarena.com/vv/bigpic/oppo-reno12-pro.jpg',
  'oppo reno 12': 'https://fdn2.gsmarena.com/vv/bigpic/oppo-reno12.jpg',
  'oppo reno 11 pro': 'https://fdn2.gsmarena.com/vv/bigpic/oppo-reno11-pro.jpg',
  'oppo reno 11': 'https://fdn2.gsmarena.com/vv/bigpic/oppo-reno11.jpg',
  'oppo find x7 ultra': 'https://fdn2.gsmarena.com/vv/bigpic/oppo-find-x7-ultra.jpg',
  'oppo f27 pro+': 'https://fdn2.gsmarena.com/vv/bigpic/oppo-f27-pro-plus.jpg',

  // === NOTHING ===
  'nothing phone (2a)': 'https://fdn2.gsmarena.com/vv/bigpic/nothing-phone-2a.jpg',
  'nothing phone (2)': 'https://fdn2.gsmarena.com/vv/bigpic/nothing-phone-2.jpg',
  'nothing phone (1)': 'https://fdn2.gsmarena.com/vv/bigpic/nothing-phone-1.jpg',
  'cmf phone 1': 'https://fdn2.gsmarena.com/vv/bigpic/cmf-phone-1.jpg'
};

function resolveExactImage(brand, model, currentUrl) {
  const full = `${brand} ${model}`.toLowerCase().replace(/5g/g, '').replace(/4g/g, '').replace(/\s+/g, ' ').trim();
  const mLower = model.toLowerCase().replace(/5g/g, '').replace(/4g/g, '').replace(/\s+/g, ' ').trim();
  
  // Direct match
  for (const [key, url] of Object.entries(EXACT_PHONE_IMAGES)) {
    if (mLower === key || full === key) {
      return url;
    }
  }

  // Substring match with specificity
  const sortedKeys = Object.keys(EXACT_PHONE_IMAGES).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (full.includes(key) || mLower.includes(key)) {
      return EXACT_PHONE_IMAGES[key];
    }
  }

  // If currentUrl is already valid non-unsplash gsmarena, keep it
  if (currentUrl && currentUrl.includes('gsmarena.com') && !currentUrl.includes('unsplash')) {
    return currentUrl;
  }

  return null;
}

console.log('Testing resolution for 10 key devices:');
const testCases = [
  ['Apple', 'iPhone 16 Pro Max'],
  ['Apple', 'iPhone 12 Pro Max'],
  ['Apple', 'iPhone 11 Pro'],
  ['Samsung', 'Galaxy S24 Ultra'],
  ['Samsung', 'Galaxy Z Fold6'],
  ['OnePlus', 'OnePlus 12'],
  ['Vivo', 'Vivo X200 Pro 5G'],
  ['Vivo', 'Vivo V40 Pro 5G'],
  ['Realme', 'Realme GT 6 5G'],
  ['Google', 'Pixel 9 Pro XL']
];
testCases.forEach(([b, m]) => {
  console.log(`${b} ${m} => ${resolveExactImage(b, m, '')}`);
});

module.exports = { EXACT_PHONE_IMAGES, resolveExactImage };
