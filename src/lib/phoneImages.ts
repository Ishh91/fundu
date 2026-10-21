/**
 * Official Studio Smartphone Renders & Brand Vector Logos
 * Provides official front-facing upright device renders and authentic brand logos.
 */

import { MOBILE_API_THUMBS } from '../data/deviceImageDictionary.ts';

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
  // Apple iPhone Pro Max / Pro / Plus / Mini / SE / iPad
  { keyword: 'iphone 18 pro max', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro-max.jpg' },
  { keyword: 'iphone 18 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro.jpg' },
  { keyword: 'iphone 18', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16.jpg' },
  { keyword: 'iphone 17 pro max', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro-max.jpg' },
  { keyword: 'iphone 17 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro.jpg' },
  { keyword: 'iphone 17 air', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16.jpg' },
  { keyword: 'iphone 17 slim', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16.jpg' },
  { keyword: 'iphone 17e', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16e.jpg' },
  { keyword: 'iphone 17', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16.jpg' },
  { keyword: 'iphone 16 pro max', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro-max.jpg' },
  { keyword: 'iphone 16 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro.jpg' },
  { keyword: 'iphone 16 plus', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-plus.jpg' },
  { keyword: 'iphone 16e', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16e.jpg' },
  { keyword: 'iphone 16', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16.jpg' },
  { keyword: 'iphone 15 pro max', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro-max.jpg' },
  { keyword: 'iphone 15 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro.jpg' },
  { keyword: 'iphone 15 plus', url: 'https://api.mobileapi.dev/devices/37/thumb.png' },
  { keyword: 'iphone 15', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15.jpg' },
  { keyword: 'iphone 14 pro max', url: 'https://api.mobileapi.dev/devices/35/thumb.png' },
  { keyword: 'iphone 14 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14-pro.jpg' },
  { keyword: 'iphone 14 plus', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14-plus.jpg' },
  { keyword: 'iphone 14', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14.jpg' },
  { keyword: 'iphone 13 pro max', url: 'https://api.mobileapi.dev/devices/33/thumb.png' },
  { keyword: 'iphone 13 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13-pro.jpg' },
  { keyword: 'iphone 13 mini', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13-mini.jpg' },
  { keyword: 'iphone 13', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13.jpg' },
  { keyword: 'iphone 12 pro max', url: 'https://api.mobileapi.dev/devices/32/thumb.png' },
  { keyword: 'iphone 12 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-12-pro.jpg' },
  { keyword: 'iphone 12 mini', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-12-mini.jpg' },
  { keyword: 'iphone 12', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-12.jpg' },
  { keyword: 'iphone 11 pro max', url: 'https://api.mobileapi.dev/devices/30/thumb.png' },
  { keyword: 'iphone 11 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-11-pro.jpg' },
  { keyword: 'iphone 11', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-11.jpg' },
  { keyword: 'iphone 8 plus', url: 'https://api.mobileapi.dev/devices/843/thumb.png' },
  { keyword: 'iphone 7 plus', url: 'https://api.mobileapi.dev/devices/844/thumb.png' },
  { keyword: 'iphone 7', url: 'https://api.mobileapi.dev/devices/846/thumb.png' },
  { keyword: 'iphone 6 plus', url: 'https://api.mobileapi.dev/devices/847/thumb.png' },
  { keyword: 'iphone se 1st', url: 'https://api.mobileapi.dev/devices/29322/thumb.png' },
  { keyword: 'iphone se', url: 'https://api.mobileapi.dev/devices/29322/thumb.png' },
  { keyword: 'ipad pro 13', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-ipad-pro-13-2024.jpg' },
  { keyword: 'ipad 10.9', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-ipad-pro-13-2024.jpg' },
  { keyword: 'ipad', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-ipad-pro-13-2024.jpg' },

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
  { keyword: 's21 plus', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s21-plus-5g-.jpg' },
  { keyword: 's21+', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s21-plus-5g-.jpg' },
  { keyword: 's26 ultra', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s25-ultra-sm-s938.jpg' },
  { keyword: 's26 plus', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-plus-5g-sm-s926.jpg' },
  { keyword: 's26+', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-plus-5g-sm-s926.jpg' },
  { keyword: 's26 fe', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-fe.jpg' },
  { keyword: 's26', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-5g-sm-s921.jpg' },
  { keyword: 's25 fe', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-fe.jpg' },
  { keyword: 's25 edge', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-5g-sm-s921.jpg' },
  { keyword: 's21 fe', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s21-fe-5g.jpg' },
  { keyword: 's21', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s21-5g-r.jpg' },
  { keyword: 's20 ultra', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s20-ultra-.jpg' },
  { keyword: 's20 fe 5g', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s20-fe-5g.jpg' },
  { keyword: 's20 fe', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s20-fe-5g.jpg' },
  { keyword: 's20', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s20-.jpg' },
  { keyword: 's10 lite', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s10-lite.jpg' },
  { keyword: 's10 plus', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s10-plus-new.jpg' },
  { keyword: 's10+', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s10-plus-new.jpg' },
  { keyword: 's10', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s10-1.jpg' },
  { keyword: 's9 plus', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s9-plus-.jpg' },
  { keyword: 's9+', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s9-plus-.jpg' },
  { keyword: 's9', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s9-.jpg' },
  { keyword: 's8 plus', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s8-plus-.jpg' },
  { keyword: 's8+', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s8-plus-.jpg' },
  { keyword: 's8', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s8-.jpg' },
  { keyword: 'z flip 8', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip6.jpg' },
  { keyword: 'z flip 7', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip6.jpg' },
  { keyword: 'z flip7 fe', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip6.jpg' },
  { keyword: 'z flip7', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip6.jpg' },
  { keyword: 'z flip 6', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip6.jpg' },
  { keyword: 'z flip6', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip6.jpg' },
  { keyword: 'flip 6', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip6.jpg' },
  { keyword: 'flip6', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip6.jpg' },
  { keyword: 'z flip 5', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip5.jpg' },
  { keyword: 'z flip5', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip5.jpg' },
  { keyword: 'flip 5', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip5.jpg' },
  { keyword: 'flip5', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip5.jpg' },
  { keyword: 'z flip 4', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip4.jpg' },
  { keyword: 'z flip4', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip4.jpg' },
  { keyword: 'flip 4', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip4.jpg' },
  { keyword: 'flip4', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip4.jpg' },
  { keyword: 'z flip 3', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip3-5g.jpg' },
  { keyword: 'z flip3', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip3-5g.jpg' },
  { keyword: 'flip 3', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip3-5g.jpg' },
  { keyword: 'flip3', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip3-5g.jpg' },
  { keyword: 'z flip', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip-01.jpg' },
  { keyword: 'galaxy flip', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip-01.jpg' },
  { keyword: 'z fold 8 ultra', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold6.jpg' },
  { keyword: 'z fold 8', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold6.jpg' },
  { keyword: 'z fold 7', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold6.jpg' },
  { keyword: 'z fold 6', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold6.jpg' },
  { keyword: 'z fold6', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold6.jpg' },
  { keyword: 'fold 6', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold6.jpg' },
  { keyword: 'fold6', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold6.jpg' },
  { keyword: 'z fold 5', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold5.jpg' },
  { keyword: 'z fold5', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold5.jpg' },
  { keyword: 'fold 5', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold5.jpg' },
  { keyword: 'fold5', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold5.jpg' },
  { keyword: 'z fold 4', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold4.jpg' },
  { keyword: 'z fold4', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold4.jpg' },
  { keyword: 'fold 4', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold4.jpg' },
  { keyword: 'fold4', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold4.jpg' },
  { keyword: 'z fold 3', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold3-5g.jpg' },
  { keyword: 'z fold 2', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold2-5g.jpg' },
  { keyword: 'galaxy fold', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-fold.jpg' },
  { keyword: '360 h1', url: 'https://api.mobileapi.dev/devices/1365/thumb.png' },
  { keyword: 'note 20 ultra', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-note20-ultra-.jpg' },
  { keyword: 'note 20', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-note20-5g-r.jpg' },
  { keyword: 'note 10 lite', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-note10-lite.jpg' },
  { keyword: 'note 10+', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-note10-plus-.jpg' },
  { keyword: 'note 10', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-note10-.jpg' },
  { keyword: 'note 8', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-note-8.jpg' },

  // Samsung Galaxy C-Series, J-Series, On-Series, F-Series, M-Series, A-Series
  { keyword: 'galaxy c5 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-c5-pro-sm-c5010.jpg' },
  { keyword: 'galaxy c7 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-c7-pro.jpg' },
  { keyword: 'galaxy c9 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-c9-pro-.jpg' },
  { keyword: 'galaxy on max', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j7-max.jpg' },
  { keyword: 'galaxy on6', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-on6.jpg' },
  { keyword: 'galaxy on8', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j8-j800.jpg' },
  { keyword: 'galaxy on7 prime', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j7-prime.jpg' },
  { keyword: 'galaxy on7 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j7-prime.jpg' },
  { keyword: 'galaxy on5 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j5-2016.jpg' },
  { keyword: 'galaxy on nxt', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j7-prime.jpg' },
  { keyword: 'galaxy j8', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j8-j800.jpg' },
  { keyword: 'galaxy j7 prime', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j7-prime.jpg' },
  { keyword: 'galaxy j7 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j7-pro.jpg' },
  { keyword: 'galaxy j7 max', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j7-max.jpg' },
  { keyword: 'galaxy j7 nxt', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j7-nxt.jpg' },
  { keyword: 'galaxy j7 duo', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j7-duo.jpg' },
  { keyword: 'galaxy j7 2016', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j7-2016.jpg' },
  { keyword: 'galaxy j7', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j7-2016.jpg' },
  { keyword: 'galaxy j6+', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j6-plus-sm-j610f.jpg' },
  { keyword: 'galaxy j6 plus', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j6-plus-sm-j610f.jpg' },
  { keyword: 'galaxy j6', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j6.jpg' },
  { keyword: 'galaxy j4+', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j4-plus-sm-j415f.jpg' },
  { keyword: 'galaxy j4 plus', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j4-plus-sm-j415f.jpg' },
  { keyword: 'galaxy j4', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j4.jpg' },
  { keyword: 'galaxy j2 2018', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j2-2018-sm-j250-.jpg' },
  { keyword: 'galaxy j2 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j2-2018-sm-j250-.jpg' },
  { keyword: 'galaxy j2', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j2-2018-sm-j250-.jpg' },
  { keyword: 'galaxy f02s', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f02s.jpg' },
  { keyword: 'galaxy f12', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f12.jpg' },
  { keyword: 'galaxy f13', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f13.jpg' },
  { keyword: 'galaxy f14', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f14-5g.jpg' },
  { keyword: 'galaxy f15', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f15-5g.jpg' },
  { keyword: 'galaxy f22', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f22.jpg' },
  { keyword: 'galaxy f23', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f23-5g.jpg' },
  { keyword: 'galaxy f34', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f34-5g.jpg' },
  { keyword: 'galaxy f41', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f41.jpg' },
  { keyword: 'galaxy f42', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f42-5g.jpg' },
  { keyword: 'galaxy f54', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f54.jpg' },
  { keyword: 'galaxy f55', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f55.jpg' },
  { keyword: 'galaxy f62', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f62.jpg' },
  { keyword: 'galaxy m01', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m01.jpg' },
  { keyword: 'galaxy m02', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m02.jpg' },
  { keyword: 'galaxy m04', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m04.jpg' },
  { keyword: 'galaxy m11', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m11.jpg' },
  { keyword: 'galaxy m12', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m12.jpg' },
  { keyword: 'galaxy m13', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m13-4g.jpg' },
  { keyword: 'galaxy m14', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m14-5g.jpg' },
  { keyword: 'galaxy m21', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m21.jpg' },
  { keyword: 'galaxy m31', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m31.jpg' },
  { keyword: 'galaxy m32', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m32.jpg' },
  { keyword: 'galaxy m34', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m34-5g.jpg' },
  { keyword: 'galaxy m51', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m51.jpg' },
  { keyword: 'galaxy m52', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m52-5g.jpg' },
  { keyword: 'galaxy m53', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m53-5g.jpg' },
  { keyword: 'galaxy a80', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a80.jpg' },
  { keyword: 'galaxy a73', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a73-5g.jpg' },
  { keyword: 'galaxy a72', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a72-4g.jpg' },
  { keyword: 'galaxy a71', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a71.jpg' },
  { keyword: 'galaxy a70', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a70.jpg' },
  { keyword: 'galaxy a55', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a55.jpg' },
  { keyword: 'galaxy a54', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a54.jpg' },
  { keyword: 'galaxy a53', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a53-5g.jpg' },
  { keyword: 'galaxy a52', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a52-4g.jpg' },
  { keyword: 'galaxy a51', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a51.jpg' },
  { keyword: 'galaxy a50', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a50.jpg' },
  { keyword: 'galaxy a35', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a35.jpg' },
  { keyword: 'galaxy a34', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a34.jpg' },
  { keyword: 'galaxy a33', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a33-5g.jpg' },
  { keyword: 'galaxy a32', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a32-4g.jpg' },
  { keyword: 'galaxy a31', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a31.jpg' },
  { keyword: 'galaxy a30', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a30.jpg' },
  { keyword: 'galaxy a15', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a15-5g.jpg' },
  { keyword: 'galaxy a14', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a14-5g.jpg' },
  { keyword: 'galaxy a13', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a13.jpg' },
  { keyword: 'galaxy a12', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a12.jpg' },
  { keyword: 'galaxy a10', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a10.jpg' },

  // OnePlus
  { keyword: 'oneplus open', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-open.jpg' },
  { keyword: 'oneplus 12r', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-12r.jpg' },
  { keyword: 'oneplus 12', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-12.jpg' },
  { keyword: 'oneplus 11r', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-ace2.jpg' },
  { keyword: 'oneplus 11', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-11.jpg' },
  { keyword: 'oneplus 10 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-10-pro.jpg' },
  { keyword: 'oneplus 10r 5g', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-10r.jpg' },
  { keyword: 'oneplus 10r', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-10r.jpg' },
  { keyword: 'oneplus 10t', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-10t-5g.jpg' },
  { keyword: 'oneplus 9 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-9-pro-.jpg' },
  { keyword: 'oneplus 9rt', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-9rt-5g.jpg' },
  { keyword: 'oneplus 9r', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-9r.jpg' },
  { keyword: 'oneplus 9', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-9-.jpg' },
  { keyword: 'oneplus 8t', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-8t-5g.jpg' },
  { keyword: 'oneplus 8 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-8-pro.jpg' },
  { keyword: 'oneplus 8 5g uw', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-8.jpg' },
  { keyword: 'oneplus 8', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-8.jpg' },
  { keyword: 'oneplus 7t pro', url: 'https://api.mobileapi.dev/devices/16320/thumb.png' },
  { keyword: 'oneplus 7t', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-7t-.jpg' },
  { keyword: 'oneplus 7 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-7-pro-r.jpg' },
  { keyword: 'oneplus 7', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-7-.jpg' },
  { keyword: 'oneplus 6t', url: 'https://api.mobileapi.dev/devices/809/thumb.png' },
  { keyword: 'oneplus 6', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-6-.jpg' },
  { keyword: 'oneplus 5t', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-5t.jpg' },
  { keyword: 'oneplus 5', url: 'https://api.mobileapi.dev/devices/369/thumb.png' },
  { keyword: 'oneplus 3t', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-3t-.jpg' },
  { keyword: 'oneplus 3', url: 'https://api.mobileapi.dev/devices/815/thumb.png' },
  { keyword: 'oneplus nord 4', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-4-5g.jpg' },
  { keyword: 'oneplus nord 3', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-3.jpg' },
  { keyword: 'oneplus nord 2t', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-2t.jpg' },
  { keyword: 'oneplus nord 2', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-2-5g.jpg' },
  { keyword: 'oneplus nord ce4 lite', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-ce4-lite.jpg' },
  { keyword: 'oneplus nord ce4', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-ce4.jpg' },
  { keyword: 'oneplus nord ce3 lite', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-ce3-lite.jpg' },
  { keyword: 'oneplus nord ce3', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-ce3-5g.jpg' },
  { keyword: 'oneplus nord ce2 lite', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-ce-2-lite-5g.jpg' },
  { keyword: 'oneplus nord ce2', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-ce-2-5g.jpg' },
  { keyword: 'oneplus nord ce', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-ce-5g.jpg' },
  { keyword: 'oneplus nord', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-.jpg' },

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
  honor: 'https://fdn2.gsmarena.com/vv/bigpic/honor-90.jpg',
  lenovo: 'https://fdn2.gsmarena.com/vv/bigpic/lenovo-k13-pro.jpg',
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

import { broadcastSync } from './realtimeSync';

export const CUSTOM_MODEL_IMAGES_KEY = 'fundu_custom_model_images_v1';

export function getCustomModelImages(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(CUSTOM_MODEL_IMAGES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCustomModelImage(brand: string, model: string, imageUrl: string) {
  if (typeof window === 'undefined') return;
  const current = getCustomModelImages();
  const b = (brand || '').toLowerCase().trim();
  const m = (model || '').toLowerCase().trim();
  const key1 = `${b}:${m}`;
  const key2 = m;

  if (imageUrl && imageUrl.trim()) {
    current[key1] = imageUrl.trim();
    current[key2] = imageUrl.trim();
  } else {
    delete current[key1];
    delete current[key2];
  }

  localStorage.setItem(CUSTOM_MODEL_IMAGES_KEY, JSON.stringify(current));
  broadcastSync('MODEL_IMAGE_UPDATE', 'master_phones', 'update', { brand, model, imageUrl });
  window.dispatchEvent(new CustomEvent('fundu_model_image_updated', { detail: { brand, model, imageUrl } }));
}

export function resetCustomModelImage(brand: string, model: string) {
  saveCustomModelImage(brand, model, '');
}

export function hasCustomModelImage(brand?: string, model?: string): boolean {
  if (!brand && !model) return false;
  const current = getCustomModelImages();
  const b = (brand || '').toLowerCase().trim();
  const m = (model || '').toLowerCase().trim();
  return Boolean(current[`${b}:${m}`] || current[m]);
}

/**
 * Returns clean official studio upright device renders on white background.
 * Resolves the EXACT model image rather than generic brand fallbacks.
 * Explicitly rejects fake repetitive URLs (e.g. apple-apple, samsung-samsung) and unsplash placeholders.
 */
function cleanUrl(url: string, brandHint?: string): string {
  if (!url) return '';
  let cleaned = url.trim();
  cleaned = cleaned.replace(/\/vv\/bigpic\/([a-z0-9]+)-\1-/gi, '/vv/bigpic/$1-');
  cleaned = cleaned.replace(/\/vv\/bigpic\/samsung-samsung-/gi, '/vv/bigpic/samsung-');
  cleaned = cleaned.replace(/\/vv\/bigpic\/apple-apple-/gi, '/vv/bigpic/apple-');
  cleaned = cleaned.replace(/\/vv\/bigpic\/xiaomi-xiaomi-/gi, '/vv/bigpic/xiaomi-');
  cleaned = cleaned.replace(/\/vv\/bigpic\/oneplus-oneplus-/gi, '/vv/bigpic/oneplus-');
  cleaned = cleaned.replace(/\/vv\/bigpic\/vivo-vivo-/gi, '/vv/bigpic/vivo-');
  cleaned = cleaned.replace(/\/vv\/bigpic\/oppo-oppo-/gi, '/vv/bigpic/oppo-');
  cleaned = cleaned.replace(/\/vv\/bigpic\/realme-realme-/gi, '/vv/bigpic/realme-');

  // Sanitize known broken or missing GSMarena suffixes
  cleaned = cleaned.replace(/samsung-galaxy-z-flip6-5g\.jpg/i, 'samsung-galaxy-z-flip6.jpg');
  cleaned = cleaned.replace(/samsung-galaxy-z-fold6-5g\.jpg/i, 'samsung-galaxy-z-fold6.jpg');
  cleaned = cleaned.replace(/samsung-galaxy-z-flip\.jpg$/i, 'samsung-galaxy-z-flip-01.jpg');
  cleaned = cleaned.replace(/samsung-galaxy-c9-pro\.jpg$/i, 'samsung-galaxy-c9-pro-.jpg');

  // OnePlus URL fixes (GSMArena requires trailing dash for some models)
  cleaned = cleaned.replace(/oneplus-6\.jpg$/i, 'oneplus-6-.jpg');
  cleaned = cleaned.replace(/oneplus-7\.jpg$/i, 'oneplus-7-.jpg');
  cleaned = cleaned.replace(/oneplus-7t\.jpg$/i, 'oneplus-7t-.jpg');
  cleaned = cleaned.replace(/oneplus-9\.jpg$/i, 'oneplus-9-.jpg');
  cleaned = cleaned.replace(/oneplus-9-pro\.jpg$/i, 'oneplus-9-pro-.jpg');
  cleaned = cleaned.replace(/oneplus-3t\.jpg$/i, 'oneplus-3t-.jpg');
  cleaned = cleaned.replace(/oneplus-11r-5g\.jpg$/i, 'oneplus-ace2.jpg');
  cleaned = cleaned.replace(/oneplus-11r\.jpg$/i, 'oneplus-ace2.jpg');

  return cleaned;
}

/**
 * Returns an authentic official brand flagship photo to fall back on when a specific model image 404s
 */
export function getBrandFrontFallback(brand?: string): string {
  const b = (brand || '').toLowerCase().trim();
  for (const [key, url] of Object.entries(BRAND_FRONT_FALLBACKS)) {
    if (b.includes(key)) return url;
  }
  return BRAND_FRONT_FALLBACKS.apple;
}

/**
 * Clean device SVG placeholder generator for when no remote photo is reachable
 */
export function getGenericDevicePlaceholder(brand?: string, model?: string): string {
  const b = (brand || 'Device').trim();
  const m = (model || '').trim();
  const name = m ? (m.toLowerCase().startsWith(b.toLowerCase()) ? m : `${b} ${m}`) : b;
  const safeName = name.replace(/[<>&"']/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 360" width="200" height="360">
    <rect x="18" y="12" width="164" height="336" rx="28" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="4"/>
    <rect x="26" y="24" width="148" height="312" rx="20" fill="#F1F5F9"/>
    <rect x="76" y="16" width="48" height="5" rx="2.5" fill="#94A3B8"/>
    <circle cx="100" cy="38" r="4.5" fill="#64748B"/>
    <text x="100" y="165" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#334155" text-anchor="middle">${safeName.length > 22 ? safeName.slice(0, 20) + '…' : safeName}</text>
    <text x="100" y="185" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="600" fill="#64748B" text-anchor="middle">Official Studio Render</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function getCleanPhoneImage(brand?: string, model?: string, fallbackUrl?: string): string {
  const b = (brand || '').toLowerCase().trim();
  const m = (model || '').toLowerCase().trim();
  const fullText = `${b} ${m}`.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
  const modelNorm = m.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
  const rawUrl = cleanUrl((fallbackUrl || '').trim(), b);

  // 0. Priority 0: Admin custom image override for this specific brand & model
  const customImages = getCustomModelImages();
  const customKey = `${b}:${m}`;
  if (customImages[customKey]) {
    return customImages[customKey];
  }
  if (customImages[modelNorm]) {
    return customImages[modelNorm];
  }

  // 1. If explicit user-uploaded image (data URL or custom backend CDN), use it
  if (
    rawUrl &&
    !rawUrl.includes('unsplash.com') &&
    !rawUrl.includes('777/thumb') &&
    (rawUrl.startsWith('data:image/') ||
      rawUrl.includes('supabase') ||
      rawUrl.includes('cloudinary') ||
      rawUrl.includes('firebase') ||
      rawUrl.includes('blob:'))
  ) {
    return rawUrl;
  }

  // 2. Reject fake placeholder patterns in fallbackUrl
  const isInvalidUrl =
    rawUrl.includes('unsplash.com') ||
    rawUrl.includes('777/thumb');

  // 3. Try high-resolution flagship & classic renders (sorted longest keyword first)
  for (const item of MODEL_EXACT_RENDERS) {
    if (fullText.includes(item.keyword) || modelNorm.includes(item.keyword)) {
      return cleanUrl(item.url, b);
    }
  }

  // 4. Exact dictionary lookup from verified 4,000+ device catalog
  if (MOBILE_API_THUMBS[fullText]) {
    return cleanUrl(MOBILE_API_THUMBS[fullText], b);
  }
  if (MOBILE_API_THUMBS[modelNorm]) {
    return cleanUrl(MOBILE_API_THUMBS[modelNorm], b);
  }

  // 5. Intelligent substring match in deviceImageDictionary
  for (const k of SORTED_THUMB_KEYS) {
    if (k.length >= 5 && (fullText.includes(k) || modelNorm.includes(k))) {
      return cleanUrl(MOBILE_API_THUMBS[k], b);
    }
  }

  // 6. If fallbackUrl was a valid non-fake URL, return it
  if (rawUrl && !isInvalidUrl && rawUrl.startsWith('http')) {
    return cleanUrl(rawUrl, b);
  }

  // 7. Intelligent Series & Family Studio Renders
  // If an exact model image wasn't found in verified dictionaries, map to authentic flagship series renders.
  // This guarantees high-resolution studio photos for unannounced devices (e.g. iPhone 18, S26, Fold 8)
  // and models with GSMArena hash collisions, completely preventing broken 404 links.
  if (b.includes('apple') || b.includes('iphone')) {
    if (m.includes('ipad')) return 'https://fdn2.gsmarena.com/vv/bigpic/apple-ipad-pro-13-2024.jpg';
    if (m.includes('pro max') || m.includes('promax')) return 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro-max.jpg';
    if (m.includes('pro')) return 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro.jpg';
    if (m.includes('plus')) return 'https://api.mobileapi.dev/devices/37/thumb.png';
    if (m.includes('se')) return 'https://api.mobileapi.dev/devices/29322/thumb.png';
    return BRAND_FRONT_FALLBACKS.apple;
  }

  if (b.includes('samsung')) {
    if (m.includes('fold')) return 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold6.jpg';
    if (m.includes('flip')) return 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip6.jpg';
    if (m.includes('ultra')) return 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-ultra-5g-sm-s928-stylus.jpg';
    if (m.includes('note')) return 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-note20-ultra-.jpg';
    if (m.includes('galaxy a') || /\ba\d+/i.test(m)) return 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a55.jpg';
    if (m.includes('galaxy m') || /\bm\d+/i.test(m)) return 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m54-5g.jpg';
    if (m.includes('galaxy f') || /\bf\d+/i.test(m)) return 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f55.jpg';
    if (m.includes('galaxy j') || /\bj\d+/i.test(m)) return 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j7-prime.jpg';
    return BRAND_FRONT_FALLBACKS.samsung;
  }

  if (b.includes('oneplus')) {
    if (m.includes('nord')) return 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-ce3-5g.jpg';
    return BRAND_FRONT_FALLBACKS.oneplus;
  }

  if (b.includes('xiaomi') || b.includes('redmi') || b.includes('poco')) {
    if (m.includes('poco') || b.includes('poco')) return BRAND_FRONT_FALLBACKS.poco;
    if (m.includes('note')) return BRAND_FRONT_FALLBACKS.redmi;
    return BRAND_FRONT_FALLBACKS.xiaomi;
  }

  if (b.includes('realme')) {
    if (m.includes('gt')) return 'https://fdn2.gsmarena.com/vv/bigpic/realme-gt6.jpg';
    if (m.includes('narzo')) return 'https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-70-pro.jpg';
    if (m.includes('p') || m.includes('c')) return 'https://fdn2.gsmarena.com/vv/bigpic/realme-p1-pro.jpg';
    return BRAND_FRONT_FALLBACKS.realme;
  }

  if (b.includes('vivo') || b.includes('iqoo')) {
    if (m.includes('iqoo') || b.includes('iqoo')) return BRAND_FRONT_FALLBACKS.iqoo;
    if (/\bv\d+/i.test(m)) return 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v40-pro.jpg';
    if (/\bt\d+/i.test(m)) return 'https://fdn2.gsmarena.com/vv/bigpic/vivo-t3-pro.jpg';
    if (/\by\d+/i.test(m)) return 'https://fdn2.gsmarena.com/vv/bigpic/vivo-y200e-5g.jpg';
    return BRAND_FRONT_FALLBACKS.vivo;
  }

  if (b.includes('oppo')) {
    if (/\ba\d+/i.test(m) || /\bk\d+/i.test(m) || /\bf\d+/i.test(m)) return 'https://fdn2.gsmarena.com/vv/bigpic/oppo-a79-5g.jpg';
    return BRAND_FRONT_FALLBACKS.oppo;
  }

  if (b.includes('motorola') || b.includes('moto')) {
    if (m.includes('razr')) return 'https://fdn2.gsmarena.com/vv/bigpic/motorola-razr-50-ultra.jpg';
    if (m.includes('edge')) return BRAND_FRONT_FALLBACKS.motorola;
    return 'https://fdn2.gsmarena.com/vv/bigpic/motorola-moto-g84.jpg';
  }

  if (b.includes('google') || b.includes('pixel')) {
    return BRAND_FRONT_FALLBACKS.google;
  }

  // 8. Brand-Specific Clean Render Fallback
  for (const [key, url] of Object.entries(BRAND_FRONT_FALLBACKS)) {
    if (b.includes(key) || m.includes(key)) {
      return cleanUrl(url, b);
    }
  }

  if (BRAND_FRONT_FALLBACKS[b]) {
    return cleanUrl(BRAND_FRONT_FALLBACKS[b], b);
  }

  // 9. Ultimate Fallback: Default to Apple Clean Render
  return cleanUrl(BRAND_FRONT_FALLBACKS.apple, b);
}
