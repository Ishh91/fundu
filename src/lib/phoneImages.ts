/**
 * Official Studio Smartphone Renders & Brand Vector Logos
 * Provides official front-facing upright device renders and authentic brand logos.
 */

import { getErrorMessage } from './errorMessage';
import { MOBILE_API_THUMBS } from '../data/deviceImageDictionary.ts';
import { broadcastSync, subscribeToRealtimeSync } from './realtimeSync';
import { db, readSession, invalidateClientTableCache } from './db';
import { API_BASE } from '../config/apiConfig';

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
  honor: 'https://cdn.simpleicons.org/honor/000000',
};

// Model-Specific Official Studio Renders (sorted longest keyword first)
export const RAW_MODEL_EXACT_RENDERS: Array<{ keyword: string; url: string }> = [
  // Apple iPhone 17 Series Flagships & Air
  { keyword: 'iphone 17 pro max', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro-max.jpg' },
  { keyword: 'iphone 17 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro.jpg' },
  { keyword: 'iphone 17 air', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-air.jpg' },
  { keyword: 'iphone 17e', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-17e.jpg' },
  { keyword: 'iphone 17', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16.jpg' },
  { keyword: 'iphone air', url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-air.jpg' },

  // Apple iPhone Pro Max / Pro / Plus / Mini / SE / iPad
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
  { keyword: 's26 ultra', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s25-ultra-sm-s938.jpg' },
  { keyword: 's26 plus', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-plus-5g-sm-s926.jpg' },
  { keyword: 's26+', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-plus-5g-sm-s926.jpg' },
  { keyword: 's26', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-5g-sm-s921.jpg' },
  { keyword: 'z fold 7', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold6.jpg' },
  { keyword: 'fold 7', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold6.jpg' },
  { keyword: 'z flip 7', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip6.jpg' },
  { keyword: 'flip 7', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip6.jpg' },
  // Itel verified S-series & popular models
  { keyword: 'itel s23+', url: 'https://fdn2.gsmarena.com/vv/bigpic/itel-s23-plus.jpg' },
  { keyword: 'itel s23', url: 'https://fdn2.gsmarena.com/vv/bigpic/itel-s23.jpg' },
  { keyword: 'itel s24', url: 'https://fdn2.gsmarena.com/vv/bigpic/itel-s24.jpg' },
  { keyword: 'itel color pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/itel-color-pro-5g.jpg' },
  { keyword: 'itel p55+', url: 'https://fdn2.gsmarena.com/vv/bigpic/itel-p55-plus.jpg' },
  { keyword: 'itel p55', url: 'https://fdn2.gsmarena.com/vv/bigpic/itel-p55.jpg' },

  { keyword: 'fold special edition', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold6.jpg' },
  { keyword: 'flip7 fe', url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip6.jpg' },
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
  { keyword: 'realme 14 pro+', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-14-pro-plus-5g.jpg' },
  { keyword: 'realme 14 pro plus', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-14-pro-plus-5g.jpg' },
  { keyword: 'realme 14 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-14-pro-5g.jpg' },
  { keyword: 'realme 13 pro+', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-13-pro-plus.jpg' },
  { keyword: 'realme 13 pro plus', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-13-pro-plus.jpg' },
  { keyword: 'realme 13 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-13-pro.jpg' },
  { keyword: 'realme 13+', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-13-plus-5g.jpg' },
  { keyword: 'realme 13 plus', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-13-plus-5g.jpg' },
  { keyword: 'realme 13', url: 'https://api.mobileapi.dev/devices/13814/thumb.png' },
  { keyword: 'realme 12 pro+', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-12-pro-plus.jpg' },
  { keyword: 'realme 12 pro plus', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-12-pro-plus.jpg' },
  { keyword: 'realme 12 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-12-pro.jpg' },
  { keyword: 'realme 12+', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-12-plus-5g.jpg' },
  { keyword: 'realme 12 plus', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-12-plus-5g.jpg' },
  { keyword: 'realme 12x', url: 'https://api.mobileapi.dev/devices/13726/thumb.png' },
  { keyword: 'realme 12', url: 'https://api.mobileapi.dev/devices/13728/thumb.png' },
  { keyword: 'realme 11 pro+', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-11-pro-plus.jpg' },
  { keyword: 'realme 11 pro plus', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-11-pro-plus.jpg' },
  { keyword: 'realme 11 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-11-pro.jpg' },
  { keyword: 'realme 11x', url: 'https://api.mobileapi.dev/devices/13739/thumb.png' },
  { keyword: 'realme 11', url: 'https://api.mobileapi.dev/devices/13819/thumb.png' },
  { keyword: 'realme 10 pro+', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-10-pro-plus-5g.jpg' },
  { keyword: 'realme 10 pro plus', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-10-pro-plus-5g.jpg' },
  { keyword: 'realme 10 pro', url: 'https://api.mobileapi.dev/devices/13760/thumb.png' },
  { keyword: 'realme 10', url: 'https://api.mobileapi.dev/devices/13759/thumb.png' },
  { keyword: 'realme 9 pro+', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-9-pro-plus.jpg' },
  { keyword: 'realme 9 pro plus', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-9-pro-plus.jpg' },
  { keyword: 'realme 9 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-9-pro.jpg' },
  { keyword: 'realme 9', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-9.jpg' },
  { keyword: 'realme 8 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-8-pro.jpg' },
  { keyword: 'realme 8', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-8.jpg' },
  { keyword: 'realme 7 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-7-pro.jpg' },
  { keyword: 'realme 7', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-7-asia.jpg' },
  { keyword: 'realme 6 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-6-pro.jpg' },
  { keyword: 'realme 6', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-6.jpg' },
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
  { keyword: 'pixel fold', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-fold.jpg' },
  { keyword: 'pixel 8a', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8a.jpg' },
  { keyword: 'pixel 8 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8-pro.jpg' },
  { keyword: 'pixel 8', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8.jpg' },
  { keyword: 'pixel 7a', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-7a.jpg' },
  { keyword: 'pixel 7 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel7-pro-new.jpg' },
  { keyword: 'pixel 7', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel7-new.jpg' },
  { keyword: 'pixel 6 pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-6-pro.jpg' },
  { keyword: 'pixel 6a', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-6a.jpg' },
  { keyword: 'pixel 6', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-6.jpg' },
  { keyword: 'pixel 5', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-5-5g.jpg' },
  { keyword: 'pixel 4 xl', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-4-xl.jpg' },
  { keyword: 'pixel 4a', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-4a.jpg' },
  { keyword: 'pixel 3a xl', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-3a-xl.jpg' },
  { keyword: 'pixel 3a', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-3a.jpg' },
  { keyword: 'pixel 3 xl', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-3-xl.jpg' },

  // Nothing
  { keyword: 'nothing phone 2a', url: 'https://fdn2.gsmarena.com/vv/bigpic/nothing-phone-2a.jpg' },
  { keyword: 'nothing phone 2', url: 'https://fdn2.gsmarena.com/vv/bigpic/nothing-phone-2.jpg' },
  { keyword: 'nothing phone 1', url: 'https://fdn2.gsmarena.com/vv/bigpic/nothing-phone-1.jpg' },
  { keyword: 'cmf phone 1', url: 'https://fdn2.gsmarena.com/vv/bigpic/nothing-cmf-phone-1.jpg' },
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

export const CUSTOM_MODEL_IMAGES_KEY = 'fundu_custom_model_images_v1';

// In-memory fallback cache to ensure images render even if localStorage is full or disabled
const memoryCustomCache: Record<string, string> = {};

/**
 * Generates all normalized and stripped lookup keys for a phone model
 * (e.g. "Apple" + "Apple iPhone 16 Pro Max" will map to "apple:iphone 16 pro max", "apple:apple iphone 16 pro max", "iphone 16 pro max", etc.)
 */
export function generateModelLookupKeys(brand?: string, model?: string): string[] {
  const b = (brand || '').toLowerCase().trim();
  const m = (model || '').toLowerCase().trim();
  const keys = new Set<string>();

  if (!b && !m) return [];

  // Strip brand prefix if present (e.g. "Apple iPhone 16" -> "iPhone 16", "Oppo Reno 12" -> "Reno 12")
  let strippedM = m;
  if (b && strippedM.startsWith(b)) {
    strippedM = strippedM.slice(b.length).trim();
  }

  const modelNorm = m.replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
  const strippedNorm = strippedM.replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();

  // Generate cleaned base name without storage specs, colors, cellular generation, or parenthesized info
  // e.g. "Galaxy S22 5G" -> "galaxy s22"
  // e.g. "Samsung Galaxy S22 (128GB) - Phantom Black" -> "galaxy s22"
  const cleanBase = strippedNorm
    .replace(/\b(16|32|64|128|256|512|1024)\s*(gb|tb)\b/gi, '')
    .replace(/\b(3g|4g|5g|lte)\b/gi, '')
    .replace(/\b(phantom black|starlight|midnight|cream|green|blue|black|white|purple|red|gold|silver|titanium|gray|grey)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Helper: adds brand-scoped keys. Only adds bare key if it explicitly contains the brand name
  const addCombos = (val: string) => {
    if (!val) return;
    const v = val.trim();
    if (!v) return;

    if (b) {
      keys.add(`${b}:${v}`);
      keys.add(`${b} ${v}`);
    }

    // Bare key is ONLY safe if it includes the brand name (e.g. "iphone 16", "oneplus 12", "oppo reno 12")
    // Never allow ambiguous bare numbers or tokens like "12", "pro", "reno 12" to be looked up globally without brand!
    if (v.startsWith(b) || v.includes(` ${b}`) || v.includes('iphone') || v.includes('galaxy')) {
      keys.add(v);
    }
  };

  // Helper to add letter-digit boundary variations (e.g. "reno12" <-> "reno 12", "findx8" <-> "find x8", "gt8" <-> "gt 8")
  const addVariations = (val: string) => {
    if (!val) return;
    addCombos(val);
    // 1. Insert space at letter-digit boundaries ("reno12" -> "reno 12", "gt8" -> "gt 8")
    const spaced = val.replace(/([a-zA-Z])(\d)/g, '$1 $2').replace(/(\d)([a-zA-Z])/g, '$1 $2').replace(/\s+/g, ' ').trim();
    if (spaced !== val) {
      addCombos(spaced);
    }
    // 2. Remove all spaces ("reno 12" -> "reno12")
    const compact = val.replace(/\s+/g, '').trim();
    if (compact !== val) {
      addCombos(compact);
    }
  };

  addVariations(strippedM);
  addVariations(m);
  addVariations(strippedNorm);
  addVariations(modelNorm);
  if (cleanBase && cleanBase !== strippedNorm) {
    addVariations(cleanBase);
  }

  // Also strip series tags like "galaxy", "phone", "narzo"
  const shortCode = cleanBase.replace(/^(galaxy|phone|redmi|poco|nord|iqoo|narzo)\s+/i, '').trim();
  if (shortCode && shortCode !== cleanBase && shortCode.length >= 2) {
    addVariations(shortCode);
  }

  return Array.from(keys);
}

export function isStockImageUrl(url?: string): boolean {
  if (!url) return false;
  const u = url.toLowerCase().trim();
  if (u.startsWith('data:image/') || u.startsWith('blob:')) return false;
  return (
    u.includes('gsmarena.com/vv/bigpic/') ||
    u.includes('api.mobileapi.dev') ||
    u.includes('777/thumb') ||
    u.includes('unsplash.com') ||
    u.includes('pexels.com') ||
    u.includes('pixabay.com')
  );
}

// Self-healing boot check: free up browser quota immediately if previous sessions bloated localStorage
export function isBrandImageMismatch(brand = '', model = '', url = ''): boolean {
  if (!url) return false;
  const b = String(brand || '').toLowerCase().trim();
  const m = String(model || '').toLowerCase().trim();
  const u = String(url || '').toLowerCase().trim();

  // Data URIs, blobs, and generic SVG placeholders are brand-neutral
  if (u.startsWith('data:') || u.startsWith('blob:') || u.includes('<svg')) return false;

  const isApple = b.includes('apple') || b.includes('iphone') || m.includes('iphone') || m.includes('ipad');
  const isSamsung = b.includes('samsung') || m.includes('galaxy') || /\b(s\d{2}|z\s*flip|z\s*fold)\b/i.test(m);
  const isOnePlus = b.includes('oneplus') || m.includes('oneplus') || m.includes('nord');
  const isXiaomi = b.includes('xiaomi') || b.includes('redmi') || b.includes('poco') || m.includes('redmi') || m.includes('poco');
  const isRealme = b.includes('realme') || m.includes('realme') || m.includes('narzo');
  const isIqoo = b === 'iqoo' || m.includes('iqoo');
  const isVivo = (b.includes('vivo') || m.includes('vivo')) && !isIqoo;
  const isOppo = b.includes('oppo') || m.includes('oppo');
  const isMotorola = b.includes('motorola') || b.includes('moto') || m.includes('moto');
  const isGoogle = b.includes('google') || b.includes('pixel') || m.includes('pixel');

  const hasToken = (tokens: string[]) => tokens.some((t) => u.includes(t));

  // 1. Hard rejection: Apple device receiving non-Apple render
  if (isApple) {
    if (hasToken(['samsung', 'galaxy', 'oneplus', 'xiaomi', 'redmi', 'poco', 'realme', 'vivo', 'iqoo', 'oppo', 'motorola', 'moto', 'pixel'])) {
      return true;
    }
    if (u.includes('gsmarena.com/vv/bigpic/') && !u.includes('apple-')) {
      return true;
    }
  }

  // 2. Hard rejection: Samsung device receiving non-Samsung render
  if (isSamsung) {
    if (hasToken(['apple-iphone', 'apple-', 'oneplus', 'xiaomi', 'redmi', 'poco', 'realme', 'vivo', 'iqoo', 'oppo', 'motorola', 'moto', 'pixel'])) {
      return true;
    }
    if (u.includes('gsmarena.com/vv/bigpic/') && !u.includes('samsung-')) {
      return true;
    }
  }

  // 3. Hard rejection: OnePlus receiving other brands (specifically iQOO, Vivo, Oppo, Realme, etc.)
  if (isOnePlus) {
    if (hasToken(['apple-iphone', 'apple-', 'samsung', 'galaxy', 'xiaomi', 'redmi', 'poco', 'realme', 'vivo', 'iqoo', 'oppo', 'motorola', 'moto', 'pixel'])) {
      return true;
    }
    if (u.includes('gsmarena.com/vv/bigpic/') && !u.includes('oneplus-')) {
      return true;
    }
  }

  // 4. Hard rejection: Oppo receiving other brands
  if (isOppo) {
    if (hasToken(['apple-iphone', 'apple-', 'samsung', 'galaxy', 'oneplus', 'xiaomi', 'redmi', 'poco', 'realme', 'vivo', 'iqoo', 'motorola', 'moto', 'pixel'])) {
      return true;
    }
    if (u.includes('gsmarena.com/vv/bigpic/') && !u.includes('oppo-')) {
      return true;
    }
  }

  // 5. Hard rejection: Realme receiving other brands
  if (isRealme) {
    if (hasToken(['apple-iphone', 'apple-', 'samsung', 'galaxy', 'oneplus', 'xiaomi', 'redmi', 'poco', 'vivo', 'iqoo', 'oppo', 'motorola', 'moto', 'pixel'])) {
      return true;
    }
    if (u.includes('gsmarena.com/vv/bigpic/') && !u.includes('realme-')) {
      return true;
    }
  }

  // 6. Hard rejection: Vivo receiving other brands
  if (isVivo) {
    if (hasToken(['apple-iphone', 'apple-', 'samsung', 'galaxy', 'oneplus', 'xiaomi', 'redmi', 'poco', 'realme', 'oppo', 'motorola', 'moto', 'pixel', 'vivo-iqoo', 'iqoo-'])) {
      return true;
    }
  }

  // 7. Hard rejection: iQOO receiving other brands
  if (isIqoo) {
    if (hasToken(['apple-iphone', 'apple-', 'samsung', 'galaxy', 'oneplus', 'xiaomi', 'redmi', 'poco', 'realme', 'oppo', 'motorola', 'moto', 'pixel'])) {
      return true;
    }
  }

  // 8. Hard rejection: Xiaomi/Redmi/Poco receiving other brands
  if (isXiaomi) {
    if (hasToken(['apple-iphone', 'apple-', 'samsung', 'galaxy', 'oneplus', 'realme', 'vivo', 'iqoo', 'oppo', 'motorola', 'moto', 'pixel'])) {
      return true;
    }
  }

  // 9. Hard rejection: Motorola receiving other brands
  if (isMotorola) {
    if (hasToken(['apple-iphone', 'apple-', 'samsung', 'galaxy', 'oneplus', 'xiaomi', 'redmi', 'poco', 'realme', 'vivo', 'iqoo', 'oppo', 'pixel'])) {
      return true;
    }
  }

  // 10. Hard rejection: Google Pixel receiving other brands
  if (isGoogle) {
    if (hasToken(['apple-iphone', 'apple-', 'samsung', 'galaxy', 'oneplus', 'xiaomi', 'redmi', 'poco', 'realme', 'vivo', 'iqoo', 'oppo', 'motorola', 'moto'])) {
      return true;
    }
  }

  return false;
}

function cleanOversizedStorageOnBoot() {
  if (typeof window === 'undefined') return;
  try {
    // 1. Purge poisoned keys and bare un-scoped keys from CUSTOM_MODEL_IMAGES_KEY
    const raw = localStorage.getItem(CUSTOM_MODEL_IMAGES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const cleaned: Record<string, string> = {};
      let modified = false;
      for (const [k, v] of Object.entries(parsed)) {
        if (typeof v === 'string') {
          const kLow = k.toLowerCase().trim();
          // Drop bare un-scoped keys (keys without ":" like "12", "11", "pro", "13")
          if (!kLow.includes(':')) {
            modified = true;
            continue;
          }
          const [brandPart, ...modelParts] = kLow.split(':');
          const modelPart = modelParts.join(':');
          if (isBrandImageMismatch(brandPart, modelPart, v)) {
            modified = true;
            continue; // Dropped poisoned cross-brand image entry
          }
          if (v.includes('unsplash.com') || v.includes('pexels.com') || v.includes('pixabay.com') || v.includes('777/thumb')) {
            modified = true;
            continue; // Dropped placeholder entry from custom images
          }
          if (v.startsWith('blob:') || (v.startsWith('data:') && v.length > 60000)) {
            modified = true;
            continue;
          }
          if (v.startsWith('http://') || v.startsWith('https://') || v.startsWith('data:')) {
            cleaned[k] = v;
          }
        }
      }
      if (modified || raw.length > 350_000) {
        localStorage.setItem(CUSTOM_MODEL_IMAGES_KEY, JSON.stringify(cleaned));
      }
    }

    // 2. Purge poisoned records from fundu_live_master_phones_v2
    const rawLive = localStorage.getItem('fundu_live_master_phones_v2');
    if (rawLive) {
      const parsedLive = JSON.parse(rawLive);
      if (Array.isArray(parsedLive)) {
        const filteredLive = parsedLive.filter((p: any) => {
          if (!p || !p.brand) return false;
          const bLow = String(p.brand).toLowerCase();
          const mLow = String(p.model || '').toLowerCase();
          if (bLow === 'apple' && !mLow.startsWith('iphone') && !mLow.startsWith('ipad') && !mLow.startsWith('apple')) {
            return false;
          }
          // Purge explicitly removed Poco and Infinix models
          const isPocoXiaomi = bLow === 'poco' || bLow === 'xiaomi';
          if (isPocoXiaomi && /(x3\s*gt|x4\s*gt|f3\s*gt|f4\s*gt)/i.test(mLow)) {
            return false;
          }
          if (bLow === 'infinix' && /(hot\s*20i|hot\s*20s|hot\s*20\s*s)/i.test(mLow)) {
            return false;
          }
          if (isBrandImageMismatch(p.brand, p.model, p.image_url)) {
            p.image_url = null;
            p.custom_image = false;
          }
          return true;
        });
        localStorage.setItem('fundu_live_master_phones_v2', JSON.stringify(filteredLive));
      }
    }

    // 3. Purge cross-brand mismatched images and deleted models from all cached brand catalogs
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('fundu_brand_catalog_')) {
        const rawCatalog = localStorage.getItem(key);
        if (rawCatalog) {
          try {
            const parsed = JSON.parse(rawCatalog);
            if (Array.isArray(parsed)) {
              let modified = false;
              const sanitized = parsed.filter((item: any) => {
                if (!item || !item.brand) return false;
                const bLow = String(item.brand).toLowerCase();
                const mLow = String(item.model || '').toLowerCase();
                if ((bLow === 'poco' || bLow === 'xiaomi') && /(x3\s*gt|x4\s*gt|f3\s*gt|f4\s*gt)/i.test(mLow)) {
                  modified = true;
                  return false;
                }
                if (bLow === 'infinix' && /(hot\s*20i|hot\s*20s|hot\s*20\s*s)/i.test(mLow)) {
                  modified = true;
                  return false;
                }
                return true;
              }).map((item: any) => {
                if (item && item.brand && item.model && item.image) {
                  if (isBrandImageMismatch(item.brand, item.model, item.image)) {
                    modified = true;
                    return { ...item, image: getCleanPhoneImage(item.brand, item.model) };
                  }
                }
                return item;
              });
              if (modified) {
                localStorage.setItem(key, JSON.stringify(sanitized));
              }
            }
          } catch {}
        }
      }
    }
  } catch {
    try {
      localStorage.removeItem(CUSTOM_MODEL_IMAGES_KEY);
    } catch {}
  }
}

cleanOversizedStorageOnBoot();

function safeSetLocalStorage(key: string, data: Record<string, string>) {
  if (typeof window === 'undefined') return;

  // Persist URLs and compact compressed images (<60KB)
  const filtered: Record<string, string> = {};
  for (const [k, v] of Object.entries(data)) {
    if (typeof v === 'string') {
      if (v.startsWith('blob:') || (v.startsWith('data:') && v.length > 60000)) continue;
      filtered[k] = v;
    }
  }

  try {
    localStorage.setItem(key, JSON.stringify(filtered));
  } catch {
    // Quota reached - emergency prune: keep only canonical keys
    try {
      const canonicalOnly: Record<string, string> = {};
      for (const [k, v] of Object.entries(filtered)) {
        if (k.includes(':')) {
          canonicalOnly[k] = v;
        }
      }
      localStorage.setItem(key, JSON.stringify(canonicalOnly));
    } catch {
      // If still fails, clear this key so origin isn't locked up; memory & DB handle it smoothly
      try {
        localStorage.removeItem(key);
      } catch {}
    }
  }
}

export function getCustomModelImages(): Record<string, string> {
  let stored: Record<string, string> = {};
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(CUSTOM_MODEL_IMAGES_KEY);
      if (raw) stored = JSON.parse(raw);
    } catch {
      stored = {};
    }
  }
  const combined = { ...stored, ...memoryCustomCache };
  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(combined)) {
    if (v && typeof v === 'string' && !v.includes('unsplash.com') && !v.includes('pexels.com') && !v.includes('777/thumb') && !v.includes('pixabay.com')) {
      clean[k] = v;
    }
  }
  return clean;
}

/**
 * Ingests live master_phones from the database into client cache & memory
 */
export function syncCustomImagesFromDatabase(
  phones: Array<{ brand: string; model: string; image_url?: string; custom_image?: boolean }>
): boolean {
  if (!Array.isArray(phones) || phones.length === 0) return false;
  let changed = false;

  const trueCustomEntries: Array<{ brand: string; model: string; url: string }> = [];

  // 1. Ingest ONLY true custom images uploaded by admin (stock/gsmarena must NEVER enter memoryCustomCache)
  phones.forEach((p) => {
    if (!p || !p.brand || !p.model || !p.image_url) return;
    const url = cleanUrl(String(p.image_url).trim(), p.brand);
    if (!url || url.includes('777/thumb')) return;
    if (isBrandImageMismatch(p.brand, p.model, url)) return;

    const isCustom = Boolean(p.custom_image) || (!isStockImageUrl(url) && !url.includes('unsplash.com') && !url.includes('pexels.com'));
    if (isCustom) {
      trueCustomEntries.push({ brand: p.brand, model: p.model, url });
    }
  });

  // 2. Process true custom entries: they take absolute priority in memory and get persisted
  const customToPersist: Record<string, string> = {};
  trueCustomEntries.forEach((entry) => {
    const brand = entry.brand;
    const model = entry.model;
    const url = entry.url;

    const keys = generateModelLookupKeys(brand, model);
    keys.forEach((k) => {
      if (memoryCustomCache[k] !== url) {
        memoryCustomCache[k] = url;
        changed = true;
      }
    });

    // In localStorage, store canonical keys and keep compact images (<60KB)
    if (!url.startsWith('blob:') && (!url.startsWith('data:') || url.length < 60000)) {
      const b = (brand || '').toLowerCase().trim();
      let strippedM = (model || '').toLowerCase().trim();
      if (b && strippedM.startsWith(b)) {
        strippedM = strippedM.slice(b.length).trim();
      }
      const canonicalKey = `${b}:${strippedM || (model || '').toLowerCase().trim()}`;
      customToPersist[canonicalKey] = url;
    }
  });

  if (changed && typeof window !== 'undefined') {
    try {
      let current: Record<string, string> = {};
      try {
        const raw = localStorage.getItem(CUSTOM_MODEL_IMAGES_KEY);
        if (raw) current = JSON.parse(raw);
      } catch {
        current = {};
      }
      Object.assign(current, customToPersist);
      safeSetLocalStorage(CUSTOM_MODEL_IMAGES_KEY, current);
    } catch (e) {
      console.warn('[phoneImages] Failed to write db sync to localStorage:', e);
    }

    clearPhoneImageCache();
    window.dispatchEvent(new CustomEvent('fundu_model_image_updated', { detail: { count: phones.length } }));
  }

  return changed;
}

let isPullingImages = false;
/** Version of the live-image payload this tab already applied (sent back so the server can reply "unchanged"). */
let liveImagesVersion = '';
const LIVE_IMAGES_POLL_INTERVAL_MS = 60 * 1000;
/**
 * Pulls custom photos from database (master_phones + sell_price_configs)
 * to ensure any visitor on any device sees images updated by admin within seconds.
 */
export async function pullLiveModelImagesFromDb(): Promise<boolean> {
  if (typeof window === 'undefined' || isPullingImages) return false;
  isPullingImages = true;
  try {
    // 1. Fast direct un-cached fetch from dedicated endpoint
    try {
      const versionQuery = liveImagesVersion ? `?v=${encodeURIComponent(liveImagesVersion)}` : '';
      const liveRes = await fetch(`${API_BASE}/phones/live-images${versionQuery}`, {
        cache: 'no-store',
      });
      if (liveRes.ok) {
        const json = await liveRes.json();
        // Nothing changed since the last pull: skip the multi-MB download entirely.
        if (json?.unchanged) return false;
        if (Array.isArray(json?.data) && json.data.length > 0) {
          if (typeof json.version === 'string') liveImagesVersion = json.version;
          return syncCustomImagesFromDatabase(json.data);
        }
      }
    } catch (_liveErr) {
      // fallback to db.from
    }

    // 2. Fallback to standard DB table queries
    const [mpRes, spRes] = await Promise.all([
      db.from('master_phones').select('brand,model,image_url,custom_image').limit(5000),
      db.from('sell_price_configs').select('brand,model,image_url,custom_image').limit(5000),
    ]);
    const merged: any[] = [];
    if (!mpRes.error && Array.isArray(mpRes.data)) merged.push(...mpRes.data);
    if (!spRes.error && Array.isArray(spRes.data)) merged.push(...spRes.data);
    if (merged.length > 0) {
      return syncCustomImagesFromDatabase(merged);
    }
  } catch {
    // Fail silently on offline/network errors
  } finally {
    isPullingImages = false;
  }
  return false;
}

/**
 * Direct persistence of custom phone image into MongoDB (MasterPhone + SellPriceConfig)
 * Guarantees immediate database update, cache invalidation, and real-time UI synchronization.
 */
export async function saveModelImageToDatabase(
  brand: string,
  model: string,
  imageUrl: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  const b = (brand || '').trim();
  const m = (model || '').trim();
  const url = (imageUrl || '').trim();

  // 1. Immediately apply to in-memory cache and localStorage for 0ms instant local rendering
  saveCustomModelImage(b, m, url);

  // 2. Direct persistence into MongoDB via backend API
  try {
    const session = readSession();
    const res = await fetch(`${API_BASE}/phones/model-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
      },
      body: JSON.stringify({
        brand: b,
        model: m,
        image_url: url,
      }),
    });

    const json = await res.json().catch(() => null);
    if (!res.ok) {
      const errMsg = json?.error?.message || json?.message || 'Failed to save image into database';
      throw new Error(errMsg);
    }

    // 3. Invalidate client caches
    invalidateClientTableCache('master_phones');
    invalidateClientTableCache('sell_price_configs');
    clearPhoneImageCache();
    const bLow = b.toLowerCase();
    if (bLow) {
      try { localStorage.removeItem(`fundu_brand_catalog_${bLow}`); } catch {}
    }

    // 4. Broadcast realtime event
    broadcastSync('MODEL_IMAGE_UPDATE', 'master_phones', 'update', {
      brand: b,
      model: m,
      imageUrl: url,
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('fundu_model_image_updated', {
        detail: { brand: b, model: m, imageUrl: url },
      }));
      window.dispatchEvent(new CustomEvent('fundu_catalog_synced', {
        detail: { brand: b, model: m, imageUrl: url },
      }));
    }

    return { success: true, data: json?.data };
  } catch (err) {
    console.error('[phoneImages] saveModelImageToDatabase error:', err);
    return { success: false, error: getErrorMessage(err, 'Database save failed') };
  }
}

/**
 * Direct persistence of custom phone video into MongoDB (MasterPhone + SellPriceConfig)
 * Saves the video URL to the phone record, updates caches and dispatches live update events.
 */
export async function saveModelVideoToDatabase(
  brand: string,
  model: string,
  videoUrl: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  const b = (brand || '').trim();
  const m = (model || '').trim();
  const url = (videoUrl || '').trim();

  try {
    const session = readSession();
    const res = await fetch(`${API_BASE}/phones/model-video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
      },
      body: JSON.stringify({
        brand: b,
        model: m,
        video_url: url,
      }),
    });

    const json = await res.json().catch(() => null);
    if (!res.ok) {
      const errMsg = json?.error?.message || json?.message || 'Failed to save phone video into database';
      throw new Error(errMsg);
    }

    // Invalidate client caches
    invalidateClientTableCache('master_phones');
    invalidateClientTableCache('sell_price_configs');

    // Broadcast realtime event
    broadcastSync('MODEL_VIDEO_UPDATE', 'master_phones', 'update', {
      brand: b,
      model: m,
      videoUrl: url,
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('fundu_model_video_updated', {
          detail: { brand: b, model: m, videoUrl: url },
        })
      );
    }

    return { success: true, data: json?.data };
  } catch (err) {
    console.error('[phoneImages] saveModelVideoToDatabase error:', err);
    return { success: false, error: getErrorMessage(err, 'Database save failed') };
  }
}

// Fast startup and continuous real-time synchronization
if (typeof window !== 'undefined') {
  // Listen for real-time broadcasts across all tabs
  subscribeToRealtimeSync((payload) => {
    if (payload.action === 'MODEL_IMAGE_UPDATE') {
      const { brand, model, imageUrl } = payload.data || {};
      if (brand && model) {
        const val = imageUrl ? String(imageUrl).trim() : '';
        const keys = generateModelLookupKeys(brand, model);
        if (val) {
          keys.forEach((k) => { memoryCustomCache[k] = val; });
        } else {
          keys.forEach((k) => { delete memoryCustomCache[k]; });
        }
        clearPhoneImageCache();
        const b = String(brand || '').toLowerCase().trim();
        if (b) {
          try { localStorage.removeItem(`fundu_brand_catalog_${b}`); } catch {}
        }
        window.dispatchEvent(new CustomEvent('fundu_model_image_updated', { detail: payload.data }));
        window.dispatchEvent(new CustomEvent('fundu_catalog_synced', { detail: payload.data }));
      } else {
        pullLiveModelImagesFromDb();
      }
    }
  });

  // Pull after the first paint, not at the very start: this is a large download and, started
  // immediately, it competes with the page's own data (a product, a list) on the same slow server.
  // Pages that need the images straight away (sell pages) still ask for them themselves.
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => { void pullLiveModelImagesFromDb(); }, { timeout: 3000 });
  } else {
    setTimeout(() => { void pullLiveModelImagesFromDb(); }, 1800);
  }

  // Fast re-check on tab focus / visibilitychange
  window.addEventListener('focus', () => {
    pullLiveModelImagesFromDb();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      pullLiveModelImagesFromDb();
    }
  });

  // Background polling once a minute, only while the tab is visible. Each poll
  // is a tiny version check unless an image actually changed; focus and
  // realtime events above still refresh immediately.
  setInterval(() => {
    if (document.visibilityState === 'visible') {
      pullLiveModelImagesFromDb();
    }
  }, LIVE_IMAGES_POLL_INTERVAL_MS);
}

export function saveCustomModelImage(brand: string, model: string, imageUrl: string) {
  if (typeof window === 'undefined') return;
  const val = imageUrl ? imageUrl.trim() : '';
  const isPlaceholder = val.includes('unsplash.com') || val.includes('pexels.com') || val.includes('777/thumb') || val.includes('pixabay.com');
  const keys = generateModelLookupKeys(brand, model);

  if (val && !isPlaceholder) {
    keys.forEach((k) => {
      memoryCustomCache[k] = val;
    });
  } else {
    keys.forEach((k) => {
      delete memoryCustomCache[k];
    });
  }

  // Clear in-memory image cache immediately so fresh image computes on next render
  clearPhoneImageCache();

  // Persist safely to localStorage with auto-pruning & quota protection
  try {
    let current: Record<string, string> = {};
    try {
      const raw = localStorage.getItem(CUSTOM_MODEL_IMAGES_KEY);
      if (raw) current = JSON.parse(raw);
    } catch {
      current = {};
    }

    const b = (brand || '').toLowerCase().trim();
    let strippedM = (model || '').toLowerCase().trim();
    if (b && strippedM.startsWith(b)) {
      strippedM = strippedM.slice(b.length).trim();
    }
    const primaryKey = `${b}:${strippedM || (model || '').toLowerCase().trim()}`;
    const secondaryKey = strippedM || (model || '').toLowerCase().trim();

    if (val) {
      // Persist http URLs and compressed images under 60KB to localStorage for instant load across reloads
      if (!val.startsWith('blob:') && (!val.startsWith('data:') || val.length < 60000)) {
        current[primaryKey] = val;
        // ONLY save secondaryKey if it is explicitly brand-qualified (never bare numbers like "12")
        if (secondaryKey && (secondaryKey.includes(b) || secondaryKey.includes('iphone') || secondaryKey.includes('galaxy'))) {
          current[secondaryKey] = val;
        }
      }
    } else {
      delete current[primaryKey];
      delete current[secondaryKey];
      keys.forEach((k) => delete current[k]);
    }

    safeSetLocalStorage(CUSTOM_MODEL_IMAGES_KEY, current);

    // Evict cached brand catalog so frontend pulls fresh image
    if (b) {
      try {
        localStorage.removeItem(`fundu_brand_catalog_${b}`);
      } catch {}
    }

    // Also update LIVE_MASTER_PHONES_STORAGE_KEY cache in localStorage if present
    try {
      const rawLive = localStorage.getItem('fundu_live_master_phones_v2');
      if (rawLive) {
        const parsed = JSON.parse(rawLive);
        if (Array.isArray(parsed)) {
          let updated = false;
          const updatedLive = parsed.map((p: any) => {
            const pb = (p.brand || '').toLowerCase().trim();
            const pm = (p.model || '').toLowerCase().trim();
            if (pb === b && (pm === strippedM || pm === (model || '').toLowerCase().trim() || pm.includes(strippedM))) {
              updated = true;
              return { ...p, image_url: val, custom_image: Boolean(val) };
            }
            return p;
          });
          if (updated) {
            localStorage.setItem('fundu_live_master_phones_v2', JSON.stringify(updatedLive));
          }
        }
      }
    } catch {}
  } catch (err) {
    console.warn('[phoneImages] Safe fallback: skipped localStorage write:', err);
  }

  try {
    broadcastSync('MODEL_IMAGE_UPDATE', 'master_phones', 'update', { brand, model, imageUrl: val });
  } catch {}

  try {
    window.dispatchEvent(new CustomEvent('fundu_model_image_updated', { detail: { brand, model, imageUrl: val } }));
    window.dispatchEvent(new CustomEvent('fundu_catalog_synced', { detail: { brand, model } }));
  } catch {}
}

export function resetCustomModelImage(brand: string, model: string) {
  saveCustomModelImage(brand, model, '');
}

export function hasCustomModelImage(brand?: string, model?: string): boolean {
  if (!brand && !model) return false;
  const current = getCustomModelImages();
  const keys = generateModelLookupKeys(brand, model);
  return keys.some((k) => Boolean(current[k]));
}

/**
 * Returns clean official studio upright device renders on white background.
 * Resolves the EXACT model image rather than generic brand fallbacks.
 * Explicitly rejects fake repetitive URLs (e.g. apple-apple, samsung-samsung) and unsplash placeholders.
 */
function cleanUrl(url: string, brandHint?: string): string {
  if (!url) return '';
  let cleaned = url.trim();

  // Reject fake placeholder patterns immediately
  if (
    cleaned.includes('777/thumb') ||
    cleaned.includes('unsplash.com') ||
    cleaned.includes('pexels.com') ||
    cleaned.includes('pixabay.com')
  ) {
    return '';
  }

  // Reject cross-brand contaminated URLs
  if (brandHint && isBrandImageMismatch(brandHint, '', cleaned)) {
    return '';
  }

  // Remove doubled brand prefixes in GSMArena URLs
  cleaned = cleaned.replace(/\/vv\/bigpic\/([a-z0-9]+)-\1-/gi, '/vv/bigpic/$1-');
  cleaned = cleaned.replace(/\/vv\/bigpic\/motorola-motorola-/gi, '/vv/bigpic/motorola-');
  cleaned = cleaned.replace(/\/vv\/bigpic\/infinix-infinix-/gi, '/vv/bigpic/infinix-');
  cleaned = cleaned.replace(/\/vv\/bigpic\/samsung-samsung-/gi, '/vv/bigpic/samsung-');
  cleaned = cleaned.replace(/\/vv\/bigpic\/apple-apple-/gi, '/vv/bigpic/apple-');
  cleaned = cleaned.replace(/\/vv\/bigpic\/google-google-/gi, '/vv/bigpic/google-');
  cleaned = cleaned.replace(/\/vv\/bigpic\/xiaomi-xiaomi-/gi, '/vv/bigpic/xiaomi-');
  cleaned = cleaned.replace(/\/vv\/bigpic\/oneplus-oneplus-/gi, '/vv/bigpic/oneplus-');
  cleaned = cleaned.replace(/\/vv\/bigpic\/vivo-vivo-/gi, '/vv/bigpic/vivo-');
  cleaned = cleaned.replace(/\/vv\/bigpic\/oppo-oppo-/gi, '/vv/bigpic/oppo-');
  cleaned = cleaned.replace(/\/vv\/bigpic\/realme-realme-/gi, '/vv/bigpic/realme-');
  cleaned = cleaned.replace(/\/vv\/bigpic\/iqoo-iqoo-/gi, '/vv/bigpic/vivo-iqoo-');
  cleaned = cleaned.replace(/\/vv\/bigpic\/iqoo-/gi, '/vv/bigpic/vivo-iqoo-');

  // Sanitize known broken or missing GSMarena suffixes for Samsung
  cleaned = cleaned.replace(/samsung-galaxy-z-flip6-5g\.jpg/i, 'samsung-galaxy-z-flip6.jpg');
  cleaned = cleaned.replace(/samsung-galaxy-z-fold6-5g\.jpg/i, 'samsung-galaxy-z-fold6.jpg');
  cleaned = cleaned.replace(/samsung-galaxy-z-flip\.jpg$/i, 'samsung-galaxy-z-flip-01.jpg');
  cleaned = cleaned.replace(/samsung-galaxy-c9-pro\.jpg$/i, 'samsung-galaxy-c9-pro-.jpg');
  cleaned = cleaned.replace(/samsung-galaxy-s21-ultra-5g\.jpg$/i, 'samsung-galaxy-s21-ultra-5g-.jpg');
  cleaned = cleaned.replace(/samsung-galaxy-s21-plus-5g\.jpg$/i, 'samsung-galaxy-s21-plus-5g-.jpg');
  cleaned = cleaned.replace(/samsung-galaxy-s20-ultra\.jpg$/i, 'samsung-galaxy-s20-ultra-.jpg');
  cleaned = cleaned.replace(/samsung-galaxy-s20\.jpg$/i, 'samsung-galaxy-s20-.jpg');
  cleaned = cleaned.replace(/samsung-galaxy-s9-plus\.jpg$/i, 'samsung-galaxy-s9-plus-.jpg');
  cleaned = cleaned.replace(/samsung-galaxy-s9\.jpg$/i, 'samsung-galaxy-s9-.jpg');
  cleaned = cleaned.replace(/samsung-galaxy-s8-plus\.jpg$/i, 'samsung-galaxy-s8-plus-.jpg');
  cleaned = cleaned.replace(/samsung-galaxy-s8\.jpg$/i, 'samsung-galaxy-s8-.jpg');
  cleaned = cleaned.replace(/samsung-galaxy-note20-ultra\.jpg$/i, 'samsung-galaxy-note20-ultra-.jpg');
  cleaned = cleaned.replace(/samsung-galaxy-note10-plus\.jpg$/i, 'samsung-galaxy-note10-plus-.jpg');
  cleaned = cleaned.replace(/samsung-galaxy-note10\.jpg$/i, 'samsung-galaxy-note10-.jpg');

  // Google Pixel URL fixes
  cleaned = cleaned.replace(/google-pixel-9-pro\.jpg$/i, 'google-pixel-9-pro-.jpg');
  cleaned = cleaned.replace(/google-pixel-?7-pro(-)?\.jpg$/i, 'google-pixel7-pro-new.jpg');
  cleaned = cleaned.replace(/google-pixel-?7(-)?\.jpg$/i, 'google-pixel7-new.jpg');
  cleaned = cleaned.replace(/google-pixel7\.jpg$/i, 'google-pixel7-new.jpg');
  cleaned = cleaned.replace(/google-pixel7-pro\.jpg$/i, 'google-pixel7-pro-new.jpg');

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

// In-memory phone image cache to avoid repeating regex and substring loops
const phoneImageCache = new Map<string, string>();

export function clearPhoneImageCache(): void {
  phoneImageCache.clear();
}

export function getCleanPhoneImage(brand?: string, model?: string, fallbackUrl?: string): string {
  const b = (brand || '').toLowerCase().trim();
  const m = (model || '').toLowerCase().trim();
  const cacheKey = `${b}:::${m}:::${fallbackUrl || ''}`;

  if (phoneImageCache.has(cacheKey)) {
    return phoneImageCache.get(cacheKey)!;
  }

  const result = computeCleanPhoneImage(brand, model, fallbackUrl);
  phoneImageCache.set(cacheKey, result);
  return result;
}

function computeCleanPhoneImage(brand?: string, model?: string, fallbackUrl?: string): string {
  const b = (brand || '').toLowerCase().trim();
  const m = (model || '').toLowerCase().trim();
  const fullText = `${b} ${m}`.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
  const modelNorm = m.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
  const rawUrl = cleanUrl((fallbackUrl || '').trim(), b);

  // 1. If explicit product image was provided and valid, USE IT IMMEDIATELY!
  // A specific product's photo must NEVER be overwritten by a generic catalog render.
  const isInvalidUrl =
    !rawUrl ||
    rawUrl.includes('unsplash.com') ||
    rawUrl.includes('pexels.com') ||
    rawUrl.includes('pixabay.com') ||
    rawUrl.includes('777/thumb') ||
    isBrandImageMismatch(brand, model, rawUrl);

  if (!isInvalidUrl) {
    return rawUrl;
  }

  // 2. Admin custom image override for this specific brand & model (from database/admin panel)
  const customImages = getCustomModelImages();
  const lookupKeys = generateModelLookupKeys(brand, model);
  for (const k of lookupKeys) {
    if (
      customImages[k] &&
      !customImages[k].includes('unsplash.com') &&
      !customImages[k].includes('pexels.com') &&
      !customImages[k].includes('777/thumb') &&
      !isBrandImageMismatch(brand, model, customImages[k])
    ) {
      return cleanUrl(customImages[k], b);
    }
  }

  const isApple = b.includes('apple') || b.includes('iphone') || fullText.includes('iphone');
  // Default authentic studio renders for iPhone 17 (when no custom admin photo exists)
  if (isApple && /\b(17\s*pro\s*max|17\s*pro|17\s*air|17e|17)\b/i.test(m)) {
    if (/\bpro\s*max\b/i.test(m)) return 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro-max.jpg';
    if (/\bpro\b/i.test(m)) return 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro.jpg';
    if (/\b(17\s*air|air)\b/i.test(m)) return 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-air.jpg';
    if (/\b17e\b/i.test(m)) return 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-17e.jpg';
    return 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16.jpg';
  }

  // 2. Try high-resolution flagship & classic renders (sorted longest keyword first)
  for (const item of MODEL_EXACT_RENDERS) {
    if (isBrandImageMismatch(brand, model, item.url)) {
      continue;
    }
    // Prevent non-Samsung brands (e.g. Itel S23, Vivo S20) from matching generic Samsung S-series renders
    const isSamsungRender = item.url.includes('samsung-galaxy');
    if (isSamsungRender && b && b !== 'samsung' && !fullText.includes('galaxy') && !fullText.includes('samsung')) {
      continue;
    }
    // Prevent non-Apple brands from matching iPhone renders
    const isAppleRender = item.url.includes('apple-iphone');
    if (isAppleRender && b && b !== 'apple' && !fullText.includes('iphone') && !fullText.includes('apple')) {
      continue;
    }
    const escaped = item.keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const wordReg = new RegExp(`(^|\\s)${escaped}(\\s|$)`, 'i');
    if (wordReg.test(fullText) || wordReg.test(modelNorm)) {
      return cleanUrl(item.url, b);
    }
  }

  // 3. Exact dictionary lookup from verified 4,000+ device catalog
  if (MOBILE_API_THUMBS[fullText] && !isBrandImageMismatch(brand, model, MOBILE_API_THUMBS[fullText])) {
    return cleanUrl(MOBILE_API_THUMBS[fullText], b);
  }
  if (MOBILE_API_THUMBS[modelNorm] && !isBrandImageMismatch(brand, model, MOBILE_API_THUMBS[modelNorm])) {
    return cleanUrl(MOBILE_API_THUMBS[modelNorm], b);
  }

  // 4. If a valid verified catalog/database image URL was passed, use it before fuzzy substring matching!
  if (!isInvalidUrl && (rawUrl.includes('gsmarena.com') || rawUrl.includes('api.mobileapi.dev')) && !isBrandImageMismatch(brand, model, rawUrl)) {
    return rawUrl;
  }

  // 5. Intelligent word-boundary match in deviceImageDictionary (strictly word boundaries to prevent single-digit hijacking!)
  for (const k of SORTED_THUMB_KEYS) {
    if (k.length >= 4) {
      if (isBrandImageMismatch(brand, model, MOBILE_API_THUMBS[k])) {
        continue;
      }
      const escaped = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const wordReg = new RegExp(`(^|\\s)${escaped}(\\s|$)`, 'i');
      if (wordReg.test(fullText) || wordReg.test(modelNorm)) {
        return cleanUrl(MOBILE_API_THUMBS[k], b);
      }
    }
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
