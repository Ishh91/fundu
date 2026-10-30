import { ALL_INDIAN_PHONES_CATALOG } from '../data/indianPhonesCatalog';

export type StorageVariantRule = {
  storage: string;
  rams: string[]; // Authentic RAM options officially launched for THIS storage
};

export type DeviceHardwareSpecs = {
  storages: string[];
  rams: string[];
  defaultStorage: string;
  defaultRam: string;
  getRamsForStorage: (storage: string) => string[];
};

// Normalizes storage strings to standard 'X GB' or 'X TB' format
export function normalizeStorageString(str: string): string {
  const match = String(str || '').match(/(\d+)\s*(gb|tb)/i);
  if (!match) return String(str || '').trim();
  return `${match[1]} ${match[2].toUpperCase()}`;
}

// Converts any storage string ('128 GB', '1 TB', '512GB') into numerical gigabytes
export function getStorageInGb(storageStr: string): number {
  const match = String(storageStr || '').match(/(\d+)\s*(gb|tb)/i);
  if (!match) return 0;
  const num = parseInt(match[1], 10);
  const unit = match[2].toUpperCase();
  return unit === 'TB' ? num * 1024 : num;
}

// Validates whether a storage size is an authentic smartphone/tablet hardware tier (16GB - 2TB)
export function isValidStorageTier(storageStr: string): boolean {
  const gb = getStorageInGb(storageStr);
  return [16, 32, 64, 128, 256, 512, 1024, 2048].includes(gb);
}

// Normalizes RAM strings to standard 'X GB' format
export function normalizeRamString(str: string): string {
  const match = String(str || '').match(/(\d+)\s*(gb)?/i);
  if (!match) return String(str || '').trim();
  return `${match[1]} GB`;
}

export const MISSING_STYLUS_DEDUCTION = 1500;

/**
 * Checks if a device originally includes an integrated or in-box S-Pen / Stylus.
 * Devices: Samsung Galaxy S22/S23/S24/S25/S26 Ultra, Samsung Galaxy Note Series, Moto G Stylus.
 */
export function deviceIncludesStylus(brand?: string, model?: string): boolean {
  const b = String(brand || '').toLowerCase().trim();
  const m = String(model || '').toLowerCase().trim();
  const full = `${b} ${m}`;

  // Samsung Galaxy Note Series (Exclude Redmi/Infinix/Lenovo Note)
  if (full.includes('note') && (b.includes('samsung') || full.includes('galaxy'))) {
    if (!full.includes('redmi') && !full.includes('infinix') && !full.includes('k10') && !full.includes('k8')) {
      return true;
    }
  }

  // Samsung Galaxy S Ultra Series with built-in S-Pen (S22 Ultra, S23 Ultra, S24 Ultra, S25 Ultra, S26 Ultra)
  if (
    (b.includes('samsung') || full.includes('galaxy')) &&
    /\bs2[2-6]\s*ultra\b/i.test(m)
  ) {
    return true;
  }

  // Motorola Moto G Stylus / Moto G Pro
  if (m.includes('stylus') || (b.includes('motorola') && m.includes('g pro'))) {
    return true;
  }

  // Samsung Galaxy Tab S with S-Pen included
  if (b.includes('samsung') && /\btab\s*s[6-9]|\btab\s*s10/i.test(m)) {
    return true;
  }

  return false;
}

/**
 * Detects whether a smartphone has an AMOLED / OLED display.
 * Policy:
 * - If phone has AMOLED/OLED display -> 45% direct deduction for broken screen
 * - If phone has normal (LCD/IPS/TFT) display -> 40% direct deduction for broken screen
 */
export function isAmoledDisplay(brand = '', model = '', displaySpec = ''): boolean {
  const spec = String(displaySpec || '').toLowerCase();
  if (spec.length > 0) {
    if (/amoled|oled|retina|poled/i.test(spec)) return true;
    if (/ips|lcd|tft/i.test(spec)) return false;
  }

  const b = String(brand || '').toLowerCase().trim();
  const m = String(model || '').toLowerCase().trim();
  const full = `${b} ${m}`;

  // 1. Catalog lookup
  const foundPhone = ALL_INDIAN_PHONES_CATALOG.find((p) => {
    const pModel = p.model.toLowerCase();
    const pFull = `${p.brand.toLowerCase()} ${pModel}`;
    return pFull === full || pModel === m || (m.length > 5 && (pFull.includes(m) || m.includes(pModel)));
  });
  if (foundPhone?.display_spec) {
    if (/amoled|oled|retina|poled/i.test(foundPhone.display_spec)) return true;
    if (/ips|lcd|tft/i.test(foundPhone.display_spec)) return false;
  }

  // 2. Apple iPhones
  if (b.includes('apple') || full.includes('iphone')) {
    if (/iphone\s*(x[s\b]|11\s*pro|12|13|14|15|16)/i.test(m)) return true;
    if (/iphone\s*(xr|11\b|se|8|7|6)/i.test(m)) return false;
    return true; // Modern iPhones default to OLED
  }

  // 3. Samsung Galaxy
  if (b.includes('samsung') || full.includes('galaxy')) {
    if (/\b(s[6-9]|s10|s2[0-6]|note|z\s*fold|z\s*flip|a5[0-5]|a3[0-5]|m5[0-5]|m3[0-5]|f54)\b/i.test(m)) return true;
    if (/\b(m0[1-5]|m1[0-5]|a0[1-5]|a1[0-5]|f0[1-5]|f1[0-5])\b/i.test(m)) return false;
    return true;
  }

  // 4. OnePlus
  if (b.includes('oneplus')) {
    if (/nord\s*ce\s*\d+\s*lite/i.test(m)) return false;
    return true;
  }

  // 5. Google Pixel
  if (b.includes('google') || full.includes('pixel')) return true;

  // 6. Nothing & CMF
  if (b.includes('nothing') || full.includes('cmf')) return true;

  // 7. POCO
  if (b.includes('poco')) {
    if (/\b(f[1-6]|x[4-7]|m6\s*pro)\b/i.test(m)) return true;
    if (/\b(c[5-7]\d|m[2-5])\b/i.test(m)) return false;
  }

  // 8. iQOO
  if (b.includes('iqoo')) {
    if (/\b(3|7|9|11|12|13|15|neo|z[6-9]\s*pro|z9|z10)\b/i.test(m)) return true;
    if (/lite|z6\s*5g/i.test(m)) return false;
  }

  // 9. Vivo
  if (b.includes('vivo')) {
    if (/\b(x\d+|v\d+|t[2-4]\s*pro|t3|y200|y100)\b/i.test(m)) return true;
    if (/\b(y[0-9]{1,2}\b|t1\b|t1x)/i.test(m)) return false;
  }

  // 10. Oppo
  if (b.includes('oppo')) {
    if (/\b(find|reno|f2[1-7]\s*pro)\b/i.test(m)) return true;
    if (/\b(a[1-7]\d)\b/i.test(m)) return false;
  }

  // 11. Infinix
  if (b.includes('infinix')) {
    if (/\b(gt\s*\d+|zero\s*\d+|note\s*40|note\s*12)\b/i.test(m)) return true;
    return false;
  }

  // 12. Lenovo
  if (b.includes('lenovo')) {
    if (/\b(legion|z6\s*pro|z5\s*pro)\b/i.test(m)) return true;
    return false;
  }

  return false;
}

/**
 * Returns direct deduction percentage for broken/cracked screen:
 * - 45% (0.45) for AMOLED displays
 * - 40% (0.40) for Normal LCD displays
 */
export function getBrokenScreenDeductionRate(brand = '', model = '', displaySpec = ''): number {
  return isAmoledDisplay(brand, model, displaySpec) ? 0.45 : 0.40;
}

/**
 * Resolves the official market release / launch year for a phone model.
 * Used to determine if the device is recent enough to have active brand warranty (< 1 year old, i.e. 2024+).
 */
export function getModelReleaseYear(brand = '', model = ''): number {
  const b = String(brand || '').toLowerCase().trim();
  const m = String(model || '').toLowerCase().trim();
  const full = `${b} ${m}`;

  // 1. Check exact match in ALL_INDIAN_PHONES_CATALOG
  const foundPhone = ALL_INDIAN_PHONES_CATALOG.find((p) => {
    const pModel = p.model.toLowerCase();
    const pFull = `${p.brand.toLowerCase()} ${pModel}`;
    return pFull === full || pModel === m || (m.length > 5 && (pFull.includes(m) || m.includes(pModel)));
  });
  if (foundPhone && foundPhone.release_year) {
    return foundPhone.release_year;
  }

  // 2. Year in parentheses or suffix, e.g. "Galaxy A54 (2023)" or "iPhone SE 2022" or "SE (2020)"
  const yrMatch = full.match(/\b(201[5-9]|202[0-6])\b/);
  if (yrMatch && (full.includes('(') || full.includes('edition') || full.includes('se '))) {
    return parseInt(yrMatch[1], 10);
  }

  // 3. Apple iPhone
  if (/iphone\s*18/i.test(m)) return 2026;
  if (/iphone\s*17/i.test(m)) return 2025;
  if (/iphone\s*16/i.test(m)) return 2024;
  if (/iphone\s*15/i.test(m)) return 2023;
  if (/iphone\s*14/i.test(m)) return 2022;
  if (/iphone\s*13/i.test(m)) return 2021;
  if (/iphone\s*12/i.test(m)) return 2020;
  if (/iphone\s*11/i.test(m)) return 2019;
  if (/iphone\s*(xs|xr|x\b)/i.test(m)) return 2018;
  if (/se\s*\(?2022\)?|se\s*3rd/i.test(m)) return 2022;
  if (/se\s*\(?2020\)?|se\s*2nd/i.test(m)) return 2020;

  // 4. Samsung Galaxy S / Z / Note / A / M / F
  if (/\bs26/i.test(m)) return 2026;
  if (/\bs25/i.test(m)) return 2025;
  if (/\bs24/i.test(m)) return 2024;
  if (/\bs23/i.test(m)) return 2023;
  if (/\bs22/i.test(m)) return 2022;
  if (/\bs21/i.test(m)) return 2021;
  if (/\bs20/i.test(m)) return 2020;
  if (/\bs10/i.test(m)) return 2019;
  if (/\bs9/i.test(m)) return 2018;
  if (/\bfold\s*8|\bflip\s*8/i.test(m)) return 2026;
  if (/\bfold\s*7|\bflip\s*7/i.test(m)) return 2025;
  if (/\bfold\s*6|\bflip\s*6/i.test(m)) return 2024;
  if (/\bfold\s*5|\bflip\s*5/i.test(m)) return 2023;
  if (/\bfold\s*4|\bflip\s*4/i.test(m)) return 2022;
  if (/\bfold\s*3|\bflip\s*3/i.test(m)) return 2021;
  if (/\bnote\s*20/i.test(m)) return 2020;
  if (/\bnote\s*10/i.test(m)) return 2019;
  if (/galaxy\s*[amf]56|[amf]36|[amf]26|[amf]16|[amf]06/i.test(m)) return 2025;
  if (/galaxy\s*[amf]55|[amf]35|[amf]25|[amf]15|[amf]05/i.test(m)) return 2024;
  if (/galaxy\s*[amf]54|[amf]34|[amf]24|[amf]14|[amf]04/i.test(m)) return 2023;
  if (/galaxy\s*[amf]53|[amf]33|[amf]23|[amf]13|[amf]03/i.test(m)) return 2022;
  if (/galaxy\s*[amf]52|[amf]32|[amf]22|[amf]12|[amf]02/i.test(m)) return 2021;
  if (/galaxy\s*[amf]51|[amf]31|[amf]21|[amf]11|[amf]01/i.test(m)) return 2020;

  // 5. OnePlus
  if (/oneplus\s*14/i.test(m)) return 2026;
  if (/oneplus\s*13/i.test(m)) return 2025;
  if (/oneplus\s*12/i.test(m)) return 2024;
  if (/oneplus\s*11/i.test(m)) return 2023;
  if (/oneplus\s*10/i.test(m)) return 2022;
  if (/oneplus\s*9/i.test(m)) return 2021;
  if (/oneplus\s*8/i.test(m)) return 2020;
  if (/oneplus\s*open\s*2/i.test(m)) return 2025;
  if (/oneplus\s*open/i.test(m)) return 2023;
  if (/nord\s*5/i.test(m)) return 2025;
  if (/nord\s*4|nord\s*ce\s*4/i.test(m)) return 2024;
  if (/nord\s*3|nord\s*ce\s*3/i.test(m)) return 2023;
  if (/nord\s*2|nord\s*ce\s*2/i.test(m)) return 2022;
  if (/nord\s*ce\b|nord\s*n/i.test(m)) return 2021;

  // 6. Vivo
  if (/vivo\s*x200/i.test(full)) return 2024;
  if (/vivo\s*x100/i.test(full)) return 2023;
  if (/vivo\s*x90/i.test(full)) return 2022;
  if (/vivo\s*x80/i.test(full)) return 2022;
  if (/vivo\s*x70/i.test(full)) return 2021;
  if (/vivo\s*v50/i.test(full)) return 2025;
  if (/vivo\s*v40/i.test(full)) return 2024;
  if (/vivo\s*v30|vivo\s*v29/i.test(full)) return 2024;
  if (/vivo\s*v27/i.test(full)) return 2023;
  if (/vivo\s*v25/i.test(full)) return 2022;
  if (/vivo\s*v23/i.test(full)) return 2022;
  if (/vivo\s*v21/i.test(full)) return 2021;
  if (/vivo\s*v20/i.test(full)) return 2020;
  if (/vivo\s*t3/i.test(full)) return 2024;
  if (/vivo\s*t2/i.test(full)) return 2023;
  if (/vivo\s*t1/i.test(full)) return 2022;
  if (/vivo\s*y200/i.test(full)) return 2024;
  if (/vivo\s*y100/i.test(full)) return 2023;

  // 7. Oppo
  if (/find\s*x8/i.test(m)) return 2024;
  if (/find\s*x7/i.test(m)) return 2024;
  if (/find\s*x6/i.test(m)) return 2023;
  if (/find\s*x5/i.test(m)) return 2022;
  if (/find\s*n3/i.test(m)) return 2023;
  if (/find\s*n2/i.test(m)) return 2022;
  if (/reno\s*13/i.test(m)) return 2025;
  if (/reno\s*12/i.test(m)) return 2024;
  if (/reno\s*11/i.test(m)) return 2024;
  if (/reno\s*10/i.test(m)) return 2023;
  if (/reno\s*8/i.test(m)) return 2022;
  if (/reno\s*7/i.test(m)) return 2022;
  if (/reno\s*6/i.test(m)) return 2021;
  if (/oppo\s*f27/i.test(full)) return 2024;
  if (/oppo\s*f25/i.test(full)) return 2024;
  if (/oppo\s*f23/i.test(full)) return 2023;
  if (/oppo\s*f21/i.test(full)) return 2022;
  if (/oppo\s*f19/i.test(full)) return 2021;
  if (/oppo\s*k12/i.test(full)) return 2024;
  if (/oppo\s*k10/i.test(full)) return 2022;

  // 8. Xiaomi / Redmi
  if (/xiaomi\s*15/i.test(full)) return 2025;
  if (/xiaomi\s*14/i.test(full)) return 2024;
  if (/xiaomi\s*13/i.test(full)) return 2023;
  if (/xiaomi\s*12/i.test(full)) return 2022;
  if (/xiaomi\s*11/i.test(full)) return 2021;
  if (/redmi\s*note\s*14/i.test(full)) return 2024;
  if (/redmi\s*note\s*13/i.test(full)) return 2024;
  if (/redmi\s*note\s*12/i.test(full)) return 2023;
  if (/redmi\s*note\s*11/i.test(full)) return 2022;
  if (/redmi\s*note\s*10/i.test(full)) return 2021;
  if (/redmi\s*note\s*9/i.test(full)) return 2020;
  if (/redmi\s*14/i.test(full)) return 2024;
  if (/redmi\s*13/i.test(full)) return 2024;
  if (/redmi\s*12/i.test(full)) return 2023;
  if (/redmi\s*11/i.test(full)) return 2022;
  if (/redmi\s*10/i.test(full)) return 2021;

  // 9. Realme
  if (/realme\s*gt\s*7/i.test(full)) return 2025;
  if (/realme\s*gt\s*6/i.test(full)) return 2024;
  if (/realme\s*gt\s*neo\s*3/i.test(full)) return 2022;
  if (/realme\s*gt\s*2/i.test(full)) return 2022;
  if (/realme\s*14/i.test(full)) return 2025;
  if (/realme\s*13/i.test(full)) return 2024;
  if (/realme\s*12/i.test(full)) return 2024;
  if (/realme\s*11/i.test(full)) return 2023;
  if (/realme\s*10/i.test(full)) return 2022;
  if (/realme\s*9/i.test(full)) return 2022;
  if (/realme\s*8/i.test(full)) return 2021;

  // 10. Google Pixel
  if (/pixel\s*10/i.test(m)) return 2025;
  if (/pixel\s*9/i.test(m)) return 2024;
  if (/pixel\s*8a/i.test(m)) return 2024;
  if (/pixel\s*8/i.test(m)) return 2023;
  if (/pixel\s*7a/i.test(m)) return 2023;
  if (/pixel\s*fold\b/i.test(m)) return 2023;
  if (/pixel\s*7/i.test(m)) return 2022;
  if (/pixel\s*6a/i.test(m)) return 2022;
  if (/pixel\s*6/i.test(m)) return 2021;
  if (/pixel\s*5a/i.test(m)) return 2021;
  if (/pixel\s*5/i.test(m)) return 2020;
  if (/pixel\s*4a/i.test(m)) return 2020;
  if (/pixel\s*4/i.test(m)) return 2019;
  if (/pixel\s*3a/i.test(m)) return 2019;
  if (/pixel\s*3/i.test(m)) return 2018;
  if (/pixel\s*2/i.test(m)) return 2017;

  // 11. Motorola / Moto
  if (/moto|motorola/i.test(full)) {
    if (/razr\s*60/i.test(m)) return 2025;
    if (/razr\s*50|edge\s*50|g85|g64|g45|g35|g34|g24|g04/i.test(m)) return 2024;
    if (/razr\s*40|edge\s*40|g84|g54|g73|g14|e13/i.test(m)) return 2023;
    if (/edge\s*30|g82|g72|g62|g52|g42|g32|g22|e22/i.test(m)) return 2022;
    if (/edge\s*20|g71|g51|g31/i.test(m)) return 2021;
    return 2023;
  }

  // 11. Itel Smartphones
  if (/itel/i.test(full)) {
    if (/color\s*pro|s24|p55\s*t|p55\s*\+|p55\s*5g|\bp55\b|a70/i.test(m)) return 2024;
    if (/s23\s*\+|s23|a60s|a60|a05s|p40\s*\+|p40/i.test(m)) return 2023;
    if (/vision\s*3|a58|a49|a27/i.test(m)) return 2022;
    if (/vision\s*2|vision\s*1|a48|a23/i.test(m)) return 2021;
    return 2023;
  }

  // 12. Tecno / Techno Smartphones
  if (/tecno|techno/i.test(full)) {
    if (/camon\s*30|pova\s*6|spark\s*20|spark\s*go\s*2024/i.test(m)) return 2024;
    if (/phantom\s*v|pova\s*5|camon\s*20/i.test(m)) return 2023;
    if (/phantom\s*x2/i.test(m)) return 2022;
    return 2023;
  }

  // 13. Nothing & CMF
  if (/nothing|cmf/i.test(full)) {
    if (/phone\s*\(?2a\)?\s*plus|phone\s*\(?2a\)?|cmf/i.test(m)) return 2024;
    if (/phone\s*\(?2\)?/i.test(m)) return 2023;
    if (/phone\s*\(?1\)?/i.test(m)) return 2022;
    return 2024;
  }

  // 14. POCO
  if (/poco/i.test(full)) {
    if (/\b(f6|x6\s*pro|x6\s*neo|x6|m6\s*plus|c61)\b/i.test(m)) return 2024;
    if (/\b(f5|x5\s*pro|x5|m6\s*pro|m6|c55|c51|c65)\b/i.test(m)) return 2023;
    if (/\b(f4\s*gt|f4|x4\s*pro|m5|m4\s*5g|m4\s*pro)\b/i.test(m)) return 2022;
    if (/\b(f3\s*gt|x3\s*pro|m3\s*pro|m2\s*reloaded)\b/i.test(m)) return 2021;
    if (/\b(x3|m3|m2\s*pro|m2)\b/i.test(m)) return 2020;
    if (/\bf1\b/i.test(m)) return 2018;
    return 2023;
  }

  // 15. Infinix
  if (/infinix/i.test(full)) {
    if (/gt\s*20\s*pro|note\s*40/i.test(m)) return 2024;
    if (/gt\s*10\s*pro|note\s*30|zero\s*30|hot\s*40|hot\s*30/i.test(m)) return 2023;
    if (/zero\s*20|note\s*12|hot\s*20|hot\s*12/i.test(m)) return 2022;
    if (/note\s*11|note\s*10|hot\s*11|hot\s*10/i.test(m)) return 2021;
    return 2023;
  }

  // 16. Lenovo
  if (/lenovo/i.test(full)) {
    if (/legion\s*y90/i.test(m)) return 2022;
    if (/legion\s*duel\s*2/i.test(m)) return 2021;
    if (/legion\s*pro/i.test(m)) return 2020;
    if (/z6\s*pro|z6\s*lite|k10\s*note|k10\s*plus/i.test(m)) return 2019;
    if (/z5\s*pro\s*gt|z5s|z5/i.test(m)) return 2018;
    if (/z2\s*plus/i.test(m)) return 2016;
    return 2019;
  }

  // 17. Explicit 4-digit year match if present
  if (yrMatch) return parseInt(yrMatch[1], 10);

  // Default older devices to 2022
  return 2022;
}

/**
 * Calculates deterministic dynamic price multiplier based on RAM + Storage combination.
 * Standard baseline: 6GB RAM + 128GB Storage = 1.000x multiplier.
 */
export function calculateHardwareVariantMultiplier(storage = '128 GB', ram = '', brand = ''): number {
  const normStorage = normalizeStorageString(storage).toLowerCase();
  const normRam = normalizeRamString(ram).toLowerCase();
  const isApple = String(brand || '').toLowerCase().includes('apple');

  // 1. Storage Multiplier (against 128GB standard)
  let storageMult = 1.0;
  if (normStorage.includes('1 tb') || normStorage.includes('1024')) storageMult = 1.42;
  else if (normStorage.includes('512')) storageMult = 1.26;
  else if (normStorage.includes('256')) storageMult = 1.12;
  else if (normStorage.includes('128')) storageMult = 1.00;
  else if (normStorage.includes('64')) storageMult = 0.88;
  else if (normStorage.includes('32')) storageMult = 0.76;
  else if (normStorage.includes('16')) storageMult = 0.65;

  // 2. RAM Multiplier (against 6GB standard, Apple is fixed 1.0)
  let ramMult = 1.0;
  if (!isApple && normRam) {
    const ramMatch = normRam.match(/(\d+)/);
    if (ramMatch) {
      const r = parseInt(ramMatch[1], 10);
      if (r >= 24) ramMult = 1.38;
      else if (r >= 16) ramMult = 1.28;
      else if (r >= 12) ramMult = 1.18;
      else if (r >= 8) ramMult = 1.08;
      else if (r >= 6) ramMult = 1.00;
      else if (r >= 4) ramMult = 0.95;
      else if (r >= 3) ramMult = 0.92;
      else if (r >= 2) ramMult = 0.88;
    }
  }

  return Number((storageMult * ramMult).toFixed(4));
}

/**
 * Calculates authentic RAM tier price offset for devices with multiple RAM options on the same storage.
 * e.g. 6GB RAM -> +0 (baseline), 8GB RAM -> +1,000, 12GB RAM -> +2,000
 * Guaranteed minimum +₹1,000 difference for 8GB over 6GB on Android devices.
 */
export function calculateRamPriceOffset(selectedRam = '', availableRams: string[] = [], brand = ''): number {
  const isApple = String(brand || '').toLowerCase().includes('apple');
  if (isApple || !selectedRam) {
    return 0;
  }
  const norm = (r: string) => parseInt(String(r || '').replace(/\D/g, ''), 10) || 0;
  const targetGb = norm(selectedRam);
  if (targetGb <= 0) return 0;

  // Determine baseline RAM for this model/storage
  let baseGb = 6; // Standard modern Android baseline RAM for 64GB/128GB phones
  if (Array.isArray(availableRams) && availableRams.length > 0) {
    const validRams = availableRams.map(norm).filter((g) => g > 0).sort((a, b) => a - b);
    if (validRams.length > 0) {
      baseGb = validRams[0];
      if (validRams.length > 1) {
        const stepIdx = validRams.indexOf(targetGb);
        if (stepIdx > 0) {
          // Exactly step * 1000 (e.g. 6GB -> 0, 8GB -> +1000, 12GB -> +2000)
          return stepIdx * 1000;
        }
        if (stepIdx === 0) {
          return 0;
        }
      }
    }
  }

  // Fallback if availableRams is empty or only 1 item or targetGb not in array:
  if (targetGb === baseGb) return 0;
  if (targetGb > baseGb) {
    const gbDiff = targetGb - baseGb;
    // Guaranteed minimum 1,000 for any higher RAM tier (e.g. 8GB over 6GB)
    return Math.max(1000, Math.round(gbDiff / 2) * 1000);
  }
  if (targetGb < baseGb) {
    return -1000;
  }
  return 0;
}

// Explicit Authentic Hardware Variant Rules with Exact Storage <-> RAM Pairing
const MODEL_HARDWARE_RULES: Array<{
  pattern: RegExp;
  variants: StorageVariantRule[];
}> = [
  // ==========================================
  // APPLE iPHONES & iPADS (Strictly sold by storage, RAM row hidden)
  // ==========================================
  {
    pattern: /ipad\s*pro\s*13/i,
    variants: [
      { storage: '256 GB', rams: [] },
      { storage: '512 GB', rams: [] },
      { storage: '1 TB', rams: [] },
      { storage: '2 TB', rams: [] },
    ],
  },
  {
    pattern: /ipad\s*10\.9/i,
    variants: [
      { storage: '64 GB', rams: [] },
      { storage: '256 GB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*(17|16|15)\s*pro\s*max\b/i,
    variants: [
      { storage: '256 GB', rams: [] },
      { storage: '512 GB', rams: [] },
      { storage: '1 TB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*14\s*pro\s*max\b/i,
    variants: [
      { storage: '128 GB', rams: [] },
      { storage: '256 GB', rams: [] },
      { storage: '512 GB', rams: [] },
      { storage: '1 TB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*13\s*pro\s*max\b/i,
    variants: [
      { storage: '128 GB', rams: [] },
      { storage: '256 GB', rams: [] },
      { storage: '512 GB', rams: [] },
      { storage: '1 TB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*(17|16|15|14|13)\s*pro(?!\s*max)\b/i,
    variants: [
      { storage: '128 GB', rams: [] },
      { storage: '256 GB', rams: [] },
      { storage: '512 GB', rams: [] },
      { storage: '1 TB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*16e\b/i,
    variants: [
      { storage: '128 GB', rams: [] },
      { storage: '256 GB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*(17\s*air|16|15|14|13)\s*(plus|\b)(?!\s*(pro|max|mini))/i,
    variants: [
      { storage: '128 GB', rams: [] },
      { storage: '256 GB', rams: [] },
      { storage: '512 GB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*13\s*mini\b/i,
    variants: [
      { storage: '128 GB', rams: [] },
      { storage: '256 GB', rams: [] },
      { storage: '512 GB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*12\s*pro\s*max\b/i,
    variants: [
      { storage: '128 GB', rams: [] },
      { storage: '256 GB', rams: [] },
      { storage: '512 GB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*12\s*pro(?!\s*max)\b/i,
    variants: [
      { storage: '128 GB', rams: [] },
      { storage: '256 GB', rams: [] },
      { storage: '512 GB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*12\s*(mini|\b)(?!\s*pro)/i,
    variants: [
      { storage: '64 GB', rams: [] },
      { storage: '128 GB', rams: [] },
      { storage: '256 GB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*11\s*pro\s*max\b/i,
    variants: [
      { storage: '64 GB', rams: [] },
      { storage: '256 GB', rams: [] },
      { storage: '512 GB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*11\s*pro(?!\s*max)\b/i,
    variants: [
      { storage: '64 GB', rams: [] },
      { storage: '256 GB', rams: [] },
      { storage: '512 GB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*11\b(?!\s*pro)/i,
    variants: [
      { storage: '64 GB', rams: [] },
      { storage: '128 GB', rams: [] },
      { storage: '256 GB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*xs\s*max\b/i,
    variants: [
      { storage: '64 GB', rams: [] },
      { storage: '256 GB', rams: [] },
      { storage: '512 GB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*xs(?!\s*max)\b/i,
    variants: [
      { storage: '64 GB', rams: [] },
      { storage: '256 GB', rams: [] },
      { storage: '512 GB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*xr\b/i,
    variants: [
      { storage: '64 GB', rams: [] },
      { storage: '128 GB', rams: [] },
      { storage: '256 GB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*x\b(?!\s*(r|s|s\s*max))/i,
    variants: [
      { storage: '64 GB', rams: [] },
      { storage: '256 GB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*8\s*plus\b/i,
    variants: [
      { storage: '64 GB', rams: [] },
      { storage: '128 GB', rams: [] },
      { storage: '256 GB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*8\b(?!\s*plus)/i,
    variants: [
      { storage: '64 GB', rams: [] },
      { storage: '128 GB', rams: [] },
      { storage: '256 GB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*7\s*plus\b/i,
    variants: [
      { storage: '32 GB', rams: [] },
      { storage: '128 GB', rams: [] },
      { storage: '256 GB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*7\b(?!\s*plus)/i,
    variants: [
      { storage: '32 GB', rams: [] },
      { storage: '128 GB', rams: [] },
      { storage: '256 GB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*6s\s*plus\b/i,
    variants: [
      { storage: '16 GB', rams: [] },
      { storage: '32 GB', rams: [] },
      { storage: '64 GB', rams: [] },
      { storage: '128 GB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*6s\b(?!\s*plus)/i,
    variants: [
      { storage: '16 GB', rams: [] },
      { storage: '32 GB', rams: [] },
      { storage: '64 GB', rams: [] },
      { storage: '128 GB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*6\s*plus\b/i,
    variants: [
      { storage: '16 GB', rams: [] },
      { storage: '32 GB', rams: [] },
      { storage: '64 GB', rams: [] },
      { storage: '128 GB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*6\b(?!\s*(s|plus))/i,
    variants: [
      { storage: '16 GB', rams: [] },
      { storage: '32 GB', rams: [] },
      { storage: '64 GB', rams: [] },
      { storage: '128 GB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*se\s*(\(2022\)|3rd|2022)\b/i,
    variants: [
      { storage: '64 GB', rams: [] },
      { storage: '128 GB', rams: [] },
      { storage: '256 GB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*se\s*(\(2020\)|2nd|2020)\b/i,
    variants: [
      { storage: '64 GB', rams: [] },
      { storage: '128 GB', rams: [] },
      { storage: '256 GB', rams: [] },
    ],
  },

  // ==========================================
  // ONEPLUS (Strict Storage-Dependent RAM Tiers)
  // ==========================================
  {
    pattern: /oneplus\s*nord\s*4\b/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
    ],
  },
  {
    pattern: /oneplus\s*(12r|11r)\b/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB', '16 GB'] },
    ],
  },
  {
    pattern: /oneplus\s*(13|12)\b/i,
    variants: [
      { storage: '256 GB', rams: ['12 GB'] },
      { storage: '512 GB', rams: ['16 GB'] },
    ],
  },
  {
    pattern: /oneplus\s*11\b/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['16 GB'] },
    ],
  },
  {
    pattern: /oneplus\s*10\s*pro/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /oneplus\s*10t/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['12 GB', '16 GB'] },
    ],
  },
  {
    pattern: /oneplus\s*nord\s*ce\s*4\b/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /oneplus\s*nord\s*ce\s*4\s*lite/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /oneplus\s*nord\s*3\b/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['16 GB'] },
    ],
  },
  {
    pattern: /oneplus\s*open/i,
    variants: [
      { storage: '512 GB', rams: ['16 GB'] },
    ],
  },

  // ==========================================
  // SAMSUNG GALAXY
  // ==========================================
  {
    pattern: /samsung.*(s25|s24|s23|s22)\s*ultra/i,
    variants: [
      { storage: '256 GB', rams: ['12 GB'] },
      { storage: '512 GB', rams: ['12 GB'] },
      { storage: '1 TB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /samsung.*(s25|s24|s23|s22)\s*\+/i,
    variants: [
      { storage: '256 GB', rams: ['12 GB'] },
      { storage: '512 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /samsung.*(s25|s24|s23|s22)\s*(5g|\b)/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /samsung.*(s24|s23)\s*fe/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /samsung.*z\s*fold\s*(6|5|4)/i,
    variants: [
      { storage: '256 GB', rams: ['12 GB'] },
      { storage: '512 GB', rams: ['12 GB'] },
      { storage: '1 TB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /samsung.*z\s*flip\s*6/i,
    variants: [
      { storage: '256 GB', rams: ['12 GB'] },
      { storage: '512 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /samsung.*z\s*flip\s*(5|4)/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
      { storage: '512 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /samsung.*a55\s*5g/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
    ],
  },
  {
    pattern: /samsung.*a35\s*5g/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /samsung.*(m35|m34)\s*5g/i,
    variants: [
      { storage: '128 GB', rams: ['6 GB', '8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /samsung.*f54/i,
    variants: [
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },

  // ==========================================
  // XIAOMI / REDMI / POCO
  // ==========================================
  {
    pattern: /redmi\s*note\s*13\s*pro\+/i,
    variants: [
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
      { storage: '512 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /redmi\s*note\s*13\s*pro\b/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
    ],
  },
  {
    pattern: /redmi\s*note\s*13\b/i,
    variants: [
      { storage: '128 GB', rams: ['6 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /poco\s*(x6\s*pro|f6)/i,
    variants: [
      { storage: '256 GB', rams: ['8 GB'] },
      { storage: '512 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /poco\s*m6/i,
    variants: [
      { storage: '64 GB', rams: ['4 GB'] },
      { storage: '128 GB', rams: ['4 GB', '6 GB'] },
    ],
  },
  {
    pattern: /xiaomi\s*14\s*ultra/i,
    variants: [
      { storage: '512 GB', rams: ['16 GB'] },
    ],
  },
  {
    pattern: /xiaomi\s*14\b/i,
    variants: [
      { storage: '512 GB', rams: ['12 GB'] },
    ],
  },

  // ==========================================
  // NOTHING & CMF
  // ==========================================
  {
    pattern: /nothing\s*phone\s*\(?2a\)?\s*plus/i,
    variants: [
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
    ],
  },
  {
    pattern: /nothing\s*phone\s*\(?2a\)?\b/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
    ],
  },
  {
    pattern: /nothing\s*phone\s*\(?2\)?\b/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['12 GB'] },
      { storage: '512 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /nothing\s*phone\s*\(?1\)?\b/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
    ],
  },
  {
    pattern: /cmf\s*phone\s*1/i,
    variants: [
      { storage: '128 GB', rams: ['6 GB', '8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },

  // ==========================================
  // VIVO & iQOO
  // ==========================================
  {
    pattern: /vivo\s*x100/i,
    variants: [
      { storage: '256 GB', rams: ['12 GB'] },
      { storage: '512 GB', rams: ['16 GB'] },
    ],
  },
  {
    pattern: /vivo\s*v(40|30)\s*pro/i,
    variants: [
      { storage: '256 GB', rams: ['8 GB'] },
      { storage: '512 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /iqoo\s*12\b/i,
    variants: [
      { storage: '256 GB', rams: ['12 GB'] },
      { storage: '512 GB', rams: ['16 GB'] },
    ],
  },
  {
    pattern: /iqoo\s*15\b/i,
    variants: [
      { storage: '256 GB', rams: ['12 GB', '16 GB'] },
      { storage: '512 GB', rams: ['16 GB'] },
    ],
  },
  {
    pattern: /iqoo\s*neo\s*10r/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
    ],
  },
  {
    pattern: /iqoo\s*neo\s*9\s*se/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
    ],
  },
  {
    pattern: /iqoo\s*z11/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
    ],
  },
  {
    pattern: /iqoo\s*z10/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /iqoo\s*neo\s*9\s*pro/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
    ],
  },

  // ==========================================
  // OPPO
  // ==========================================
  {
    pattern: /oppo\s*reno\s*12\s*pro/i,
    variants: [
      { storage: '256 GB', rams: ['12 GB'] },
      { storage: '512 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /oppo\s*reno\s*12\b/i,
    variants: [
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /oppo\s*f27\s*pro\+/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },

  // ==========================================
  // ONEPLUS
  // ==========================================
  {
    pattern: /6t\s*mclaren|mclaren.*6t/i,
    variants: [
      { storage: '256 GB', rams: ['10 GB'] },
    ],
  },
  {
    pattern: /7t\s*pro.*mclaren|mclaren.*7t\s*pro/i,
    variants: [
      { storage: '256 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /oneplus\s*13s\b/i,
    variants: [
      { storage: '256 GB', rams: ['12 GB', '16 GB'] },
      { storage: '512 GB', rams: ['16 GB'] },
    ],
  },
  {
    pattern: /oneplus\s*13\b/i,
    variants: [
      { storage: '256 GB', rams: ['12 GB', '16 GB'] },
      { storage: '512 GB', rams: ['16 GB'] },
      { storage: '1 TB', rams: ['24 GB'] },
    ],
  },
  {
    pattern: /oneplus\s*13r\b/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['12 GB', '16 GB'] },
      { storage: '512 GB', rams: ['16 GB'] },
    ],
  },
  {
    pattern: /oneplus\s*12\b/i,
    variants: [
      { storage: '256 GB', rams: ['12 GB', '16 GB'] },
      { storage: '512 GB', rams: ['16 GB'] },
    ],
  },
  {
    pattern: /oneplus\s*12r\b/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB', '16 GB'] },
    ],
  },
  {
    pattern: /nord\s*ce\s*3\s*lite|nord\s*ce3\s*lite/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /nord\s*ce\s*3\b|nord\s*ce3\b/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /nord\s*ce\s*4\s*lite|nord\s*ce4\s*lite/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /nord\s*ce\s*4\b|nord\s*ce4\b/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /oneplus.*nord\s*4\b/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
      { storage: '512 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /oneplus\s*6t\b/i,
    variants: [
      { storage: '128 GB', rams: ['6 GB', '8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /nord\s*6\b/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['12 GB'] },
      { storage: '512 GB', rams: ['16 GB'] },
    ],
  },
  {
    pattern: /nord\s*5\b/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /nord\s*ce\s*5\b|nord\s*ce5\b/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /nord\s*ce\s*2\s*lite|nord\s*ce2\s*lite/i,
    variants: [
      { storage: '128 GB', rams: ['6 GB', '8 GB'] },
    ],
  },
  {
    pattern: /oneplus\s*6\b/i,
    variants: [
      { storage: '64 GB', rams: ['6 GB'] },
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /oneplus\s*10r(\s*5g)?/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
    ],
  },
  {
    pattern: /oneplus\s*8(\s*5g)?(\s*uw)?/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['12 GB'] },
    ],
  },

  // ==========================================
  // SAMSUNG
  // ==========================================
  {
    pattern: /s26\s*fe|s26fe/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /z\s*flip\s*8|flip\s*8|flip8/i,
    variants: [
      { storage: '256 GB', rams: ['12 GB'] },
      { storage: '512 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /z\s*fold\s*8|fold\s*8|fold8/i,
    variants: [
      { storage: '256 GB', rams: ['12 GB', '16 GB'] },
      { storage: '512 GB', rams: ['16 GB'] },
      { storage: '1 TB', rams: ['16 GB'] },
    ],
  },
  {
    pattern: /galaxy\s*a8\b|\ba8\s*\(2018\)|\ba8\b/i,
    variants: [
      { storage: '64 GB', rams: ['4 GB'] },
    ],
  },

  // ==========================================
  // XIAOMI & POCO
  // ==========================================
  {
    pattern: /11x\s*pro|11xpro/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  // POCO
  {
    pattern: /poco\s*f6/i,
    variants: [
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
      { storage: '512 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /poco\s*f5/i,
    variants: [
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
    ],
  },
  {
    pattern: /poco\s*f4\s*gt/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /poco\s*f4\b/i,
    variants: [
      { storage: '128 GB', rams: ['6 GB', '8 GB'] },
      { storage: '256 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /poco\s*f3\s*gt/i,
    variants: [
      { storage: '128 GB', rams: ['6 GB', '8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /poco\s*f1\b/i,
    variants: [
      { storage: '64 GB', rams: ['6 GB'] },
      { storage: '128 GB', rams: ['6 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /poco\s*x6\s*pro/i,
    variants: [
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
      { storage: '512 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /poco\s*x6\s*neo/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /poco\s*x6\b/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
      { storage: '512 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /poco\s*x5\s*pro/i,
    variants: [
      { storage: '128 GB', rams: ['6 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /poco\s*x5\b/i,
    variants: [
      { storage: '128 GB', rams: ['6 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /poco\s*x4\s*pro/i,
    variants: [
      { storage: '64 GB', rams: ['6 GB'] },
      { storage: '128 GB', rams: ['6 GB', '8 GB'] },
    ],
  },
  {
    pattern: /poco\s*x3\s*pro/i,
    variants: [
      { storage: '128 GB', rams: ['6 GB', '8 GB'] },
    ],
  },
  {
    pattern: /poco\s*x3\b/i,
    variants: [
      { storage: '64 GB', rams: ['6 GB'] },
      { storage: '128 GB', rams: ['6 GB', '8 GB'] },
    ],
  },
  {
    pattern: /poco\s*m6\s*plus/i,
    variants: [
      { storage: '128 GB', rams: ['6 GB', '8 GB'] },
    ],
  },
  {
    pattern: /poco\s*m6\s*pro/i,
    variants: [
      { storage: '64 GB', rams: ['4 GB'] },
      { storage: '128 GB', rams: ['6 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /poco\s*m6\b/i,
    variants: [
      { storage: '64 GB', rams: ['4 GB'] },
      { storage: '128 GB', rams: ['6 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /poco\s*m5\b/i,
    variants: [
      { storage: '64 GB', rams: ['4 GB'] },
      { storage: '128 GB', rams: ['6 GB'] },
    ],
  },
  {
    pattern: /poco\s*m4\s*pro/i,
    variants: [
      { storage: '64 GB', rams: ['6 GB'] },
      { storage: '128 GB', rams: ['6 GB', '8 GB'] },
    ],
  },
  {
    pattern: /poco\s*m4\b/i,
    variants: [
      { storage: '64 GB', rams: ['4 GB'] },
      { storage: '128 GB', rams: ['6 GB'] },
    ],
  },
  {
    pattern: /poco\s*m3\s*pro/i,
    variants: [
      { storage: '64 GB', rams: ['4 GB'] },
      { storage: '128 GB', rams: ['6 GB'] },
    ],
  },
  {
    pattern: /poco\s*m3\b/i,
    variants: [
      { storage: '64 GB', rams: ['6 GB'] },
      { storage: '128 GB', rams: ['6 GB'] },
    ],
  },
  {
    pattern: /poco\s*m2\s*pro/i,
    variants: [
      { storage: '64 GB', rams: ['4 GB', '6 GB'] },
      { storage: '128 GB', rams: ['6 GB'] },
    ],
  },
  {
    pattern: /poco\s*m2\b/i,
    variants: [
      { storage: '64 GB', rams: ['6 GB'] },
      { storage: '128 GB', rams: ['6 GB'] },
    ],
  },
  {
    pattern: /poco\s*c65\b/i,
    variants: [
      { storage: '128 GB', rams: ['4 GB', '6 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /poco\s*c61\b/i,
    variants: [
      { storage: '64 GB', rams: ['4 GB'] },
      { storage: '128 GB', rams: ['6 GB'] },
    ],
  },
  {
    pattern: /poco\s*c55\b/i,
    variants: [
      { storage: '64 GB', rams: ['4 GB'] },
      { storage: '128 GB', rams: ['6 GB'] },
    ],
  },
  {
    pattern: /poco\s*c51\b/i,
    variants: [
      { storage: '64 GB', rams: ['4 GB'] },
    ],
  },
  {
    pattern: /redmi\s*11\s*prime/i,
    variants: [
      { storage: '64 GB', rams: ['4 GB'] },
      { storage: '128 GB', rams: ['6 GB'] },
    ],
  },

  // ==========================================
  // REALME
  // ==========================================
  {
    pattern: /realme\s*gt\s*6\b/i,
    variants: [
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
      { storage: '512 GB', rams: ['16 GB'] },
    ],
  },
  {
    pattern: /realme\s*12\s*pro\+/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
    ],
  },
  {
    pattern: /realme\s*11\s*pro\+/i,
    variants: [
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
    ],
  },
  {
    pattern: /realme\s*12\s*plus|realme\s*12\+/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /narzo\s*80\s*lite/i,
    variants: [
      { storage: '128 GB', rams: ['6 GB', '8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /realme\s*c19\b/i,
    variants: [
      { storage: '64 GB', rams: ['4 GB'] },
      { storage: '128 GB', rams: ['4 GB', '6 GB'] },
    ],
  },

  // ==========================================
  // GOOGLE PIXEL
  // ==========================================
  {
    pattern: /pixel\s*10\s*pro\s*fold/i,
    variants: [
      { storage: '256 GB', rams: ['16 GB'] },
      { storage: '512 GB', rams: ['16 GB'] },
    ],
  },
  {
    pattern: /pixel\s*10\s*pro/i,
    variants: [
      { storage: '128 GB', rams: ['16 GB'] },
      { storage: '256 GB', rams: ['16 GB'] },
      { storage: '512 GB', rams: ['16 GB'] },
      { storage: '1 TB', rams: ['16 GB'] },
    ],
  },
  {
    pattern: /pixel\s*10\b/i,
    variants: [
      { storage: '128 GB', rams: ['12 GB'] },
      { storage: '256 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /pixel\s*9\s*pro\s*fold/i,
    variants: [
      { storage: '256 GB', rams: ['16 GB'] },
      { storage: '512 GB', rams: ['16 GB'] },
    ],
  },
  {
    pattern: /pixel\s*9\s*pro/i,
    variants: [
      { storage: '128 GB', rams: ['16 GB'] },
      { storage: '256 GB', rams: ['16 GB'] },
      { storage: '512 GB', rams: ['16 GB'] },
      { storage: '1 TB', rams: ['16 GB'] },
    ],
  },
  {
    pattern: /pixel\s*9\b/i,
    variants: [
      { storage: '128 GB', rams: ['12 GB'] },
      { storage: '256 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /pixel\s*8\s*pro/i,
    variants: [
      { storage: '128 GB', rams: ['12 GB'] },
      { storage: '256 GB', rams: ['12 GB'] },
      { storage: '512 GB', rams: ['12 GB'] },
      { storage: '1 TB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /pixel\s*8a\b/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /pixel\s*8\b/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /pixel\s*fold\b/i,
    variants: [
      { storage: '256 GB', rams: ['12 GB'] },
      { storage: '512 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /pixel\s*7\s*pro/i,
    variants: [
      { storage: '128 GB', rams: ['12 GB'] },
      { storage: '256 GB', rams: ['12 GB'] },
      { storage: '512 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /pixel\s*7a\b/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /pixel\s*7\b/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /pixel\s*6\s*pro/i,
    variants: [
      { storage: '128 GB', rams: ['12 GB'] },
      { storage: '256 GB', rams: ['12 GB'] },
      { storage: '512 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /pixel\s*6a\b/i,
    variants: [
      { storage: '128 GB', rams: ['6 GB'] },
    ],
  },
  {
    pattern: /pixel\s*6\b/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /pixel\s*5a\b/i,
    variants: [
      { storage: '128 GB', rams: ['6 GB'] },
    ],
  },
  {
    pattern: /pixel\s*5\b/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /pixel\s*4a\b/i,
    variants: [
      { storage: '128 GB', rams: ['6 GB'] },
    ],
  },
  {
    pattern: /pixel\s*4\s*xl/i,
    variants: [
      { storage: '64 GB', rams: ['6 GB'] },
      { storage: '128 GB', rams: ['6 GB'] },
    ],
  },
  {
    pattern: /pixel\s*4\b/i,
    variants: [
      { storage: '64 GB', rams: ['6 GB'] },
      { storage: '128 GB', rams: ['6 GB'] },
    ],
  },
  {
    pattern: /pixel\s*3a/i,
    variants: [
      { storage: '64 GB', rams: ['4 GB'] },
    ],
  },
  {
    pattern: /pixel\s*3\s*xl/i,
    variants: [
      { storage: '64 GB', rams: ['4 GB'] },
      { storage: '128 GB', rams: ['4 GB'] },
    ],
  },
  {
    pattern: /pixel\s*3\b/i,
    variants: [
      { storage: '64 GB', rams: ['4 GB'] },
      { storage: '128 GB', rams: ['4 GB'] },
    ],
  },
  {
    pattern: /pixel\s*2/i,
    variants: [
      { storage: '64 GB', rams: ['4 GB'] },
      { storage: '128 GB', rams: ['4 GB'] },
    ],
  },

  // ==========================================
  // INFINIX
  // ==========================================
  {
    pattern: /infinix\s*gt\s*20\s*pro/i,
    variants: [
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
    ],
  },
  {
    pattern: /infinix\s*gt\s*10\s*pro/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /infinix\s*note\s*40\s*pro\+/i,
    variants: [
      { storage: '256 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /infinix\s*note\s*40\s*pro\b/i,
    variants: [
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /infinix\s*note\s*30/i,
    variants: [
      { storage: '128 GB', rams: ['4 GB', '8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /infinix\s*zero\s*30/i,
    variants: [
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
    ],
  },
  {
    pattern: /infinix\s*hot\s*40\s*pro/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /infinix\s*hot\s*30/i,
    variants: [
      { storage: '128 GB', rams: ['4 GB', '8 GB'] },
    ],
  },

  // ==========================================
  // LENOVO
  // ==========================================
  {
    pattern: /lenovo\s*legion\s*y90/i,
    variants: [
      { storage: '256 GB', rams: ['12 GB', '16 GB', '18 GB'] },
      { storage: '512 GB', rams: ['18 GB'] },
    ],
  },
  {
    pattern: /lenovo\s*legion\s*duel\s*2/i,
    variants: [
      { storage: '256 GB', rams: ['12 GB'] },
      { storage: '512 GB', rams: ['16 GB'] },
    ],
  },
  {
    pattern: /lenovo\s*legion\s*pro/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB', '12 GB'] },
      { storage: '256 GB', rams: ['12 GB'] },
      { storage: '512 GB', rams: ['16 GB'] },
    ],
  },
  {
    pattern: /lenovo\s*z6\s*pro/i,
    variants: [
      { storage: '128 GB', rams: ['6 GB', '8 GB'] },
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
    ],
  },
  {
    pattern: /lenovo\s*z6\s*lite/i,
    variants: [
      { storage: '64 GB', rams: ['4 GB', '6 GB'] },
      { storage: '128 GB', rams: ['6 GB'] },
    ],
  },
  {
    pattern: /lenovo\s*z5\s*pro\s*gt/i,
    variants: [
      { storage: '128 GB', rams: ['6 GB', '8 GB'] },
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
    ],
  },
  {
    pattern: /lenovo\s*z5s/i,
    variants: [
      { storage: '64 GB', rams: ['4 GB', '6 GB'] },
      { storage: '128 GB', rams: ['6 GB'] },
    ],
  },
  {
    pattern: /lenovo\s*k10\s*note/i,
    variants: [
      { storage: '64 GB', rams: ['4 GB'] },
      { storage: '128 GB', rams: ['6 GB'] },
    ],
  },
  {
    pattern: /lenovo\s*k10\s*plus/i,
    variants: [
      { storage: '64 GB', rams: ['4 GB'] },
    ],
  },
  {
    pattern: /lenovo\s*z2\s*plus/i,
    variants: [
      { storage: '64 GB', rams: ['4 GB'] },
    ],
  },

  // ==========================================
  // MOTOROLA
  // ==========================================
  {
    pattern: /razr\s*60\s*ultra/i,
    variants: [
      { storage: '256 GB', rams: ['12 GB'] },
      { storage: '512 GB', rams: ['16 GB'] },
    ],
  },
  {
    pattern: /razr\s*60\b/i,
    variants: [
      { storage: '256 GB', rams: ['8 GB'] },
      { storage: '512 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /razr\s*50\s*ultra/i,
    variants: [
      { storage: '512 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /razr\s*50\b/i,
    variants: [
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /razr\s*40\s*ultra/i,
    variants: [
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
    ],
  },
  {
    pattern: /razr\s*40\b/i,
    variants: [
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /edge\s*50\s*ultra/i,
    variants: [
      { storage: '512 GB', rams: ['12 GB', '16 GB'] },
    ],
  },
  {
    pattern: /edge\s*50\s*pro/i,
    variants: [
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
    ],
  },
  {
    pattern: /edge\s*50\s*fusion/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /edge\s*50\s*neo/i,
    variants: [
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /edge\s*40\s*pro/i,
    variants: [
      { storage: '256 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /edge\s*40\s*neo/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /edge\s*40\b/i,
    variants: [
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /edge\s*30\s*ultra/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /edge\s*30\s*fusion/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /edge\s*30\b/i,
    variants: [
      { storage: '128 GB', rams: ['6 GB', '8 GB'] },
    ],
  },
  {
    pattern: /moto\s*g85/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /moto\s*g64/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /moto\s*g84/i,
    variants: [
      { storage: '256 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /moto\s*g54/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /moto\s*g34/i,
    variants: [
      { storage: '128 GB', rams: ['4 GB', '8 GB'] },
    ],
  },
  {
    pattern: /moto\s*g24/i,
    variants: [
      { storage: '128 GB', rams: ['4 GB', '8 GB'] },
    ],
  },
  {
    pattern: /moto\s*g14/i,
    variants: [
      { storage: '128 GB', rams: ['4 GB'] },
    ],
  },
  {
    pattern: /moto\s*e13/i,
    variants: [
      { storage: '64 GB', rams: ['2 GB', '4 GB'] },
      { storage: '128 GB', rams: ['8 GB'] },
    ],
  },

  // ==========================================
  // ITEL SMARTPHONES
  // ==========================================
  {
    pattern: /itel\s*s23\s*\+/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /itel\s*s24\b/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /itel\s*s23\b/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /itel\s*color\s*pro/i,
    variants: [
      { storage: '128 GB', rams: ['6 GB'] },
    ],
  },
  {
    pattern: /itel\s*p55\s*5g/i,
    variants: [
      { storage: '64 GB', rams: ['4 GB', '6 GB'] },
      { storage: '128 GB', rams: ['6 GB'] },
    ],
  },
  {
    pattern: /itel\s*p55\s*\+/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /itel\s*p55\s*t/i,
    variants: [
      { storage: '128 GB', rams: ['4 GB'] },
    ],
  },
  {
    pattern: /itel\s*p55\b/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /itel\s*a70\b/i,
    variants: [
      { storage: '64 GB', rams: ['4 GB'] },
      { storage: '128 GB', rams: ['4 GB'] },
      { storage: '256 GB', rams: ['4 GB'] },
    ],
  },
  {
    pattern: /itel\s*a60s?\b/i,
    variants: [
      { storage: '64 GB', rams: ['4 GB'] },
      { storage: '128 GB', rams: ['4 GB'] },
    ],
  },
  {
    pattern: /itel\s*a05s\b/i,
    variants: [
      { storage: '64 GB', rams: ['4 GB'] },
    ],
  },

  // ==========================================
  // TECNO SMARTPHONES
  // ==========================================
  {
    pattern: /camon\s*30\s*premier/i,
    variants: [
      { storage: '512 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /camon\s*30\s*pro/i,
    variants: [
      { storage: '256 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /camon\s*30\b/i,
    variants: [
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /camon\s*20\s*pro/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /pova\s*6\s*pro/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
    ],
  },
  {
    pattern: /pova\s*5\s*pro/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /spark\s*20\s*pro/i,
    variants: [
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /spark\s*20\b/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /spark\s*go/i,
    variants: [
      { storage: '64 GB', rams: ['4 GB'] },
      { storage: '128 GB', rams: ['4 GB'] },
    ],
  },
  {
    pattern: /phantom\s*v\s*fold/i,
    variants: [
      { storage: '256 GB', rams: ['12 GB'] },
      { storage: '512 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /phantom\s*v\s*flip/i,
    variants: [
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /phantom\s*x2\s*pro/i,
    variants: [
      { storage: '256 GB', rams: ['12 GB'] },
    ],
  },
];

/**
 * Infers authentic, tier-accurate storage and RAM hardware options
 * for any smartphone based on brand, model series, and market release tier.
 */
/**
 * Checks whether a smartphone model realistically exists with 512 GB (or 1 TB) in the Indian retail market.
 * In India, mainstream and mid-range devices (Vivo V series, OnePlus Nord/CE/R, Redmi Note, Realme Pro,
 * Samsung A/M/F series, Moto G series, Poco X/M) NEVER shipped with 512 GB.
 */
export function is512GBValidForModel(brand = '', model = ''): boolean {
  const b = String(brand || '').toLowerCase().trim();
  const m = String(model || '').toLowerCase().trim();

  // 1. Apple: Only iPhone 11 Pro / Pro Max and newer, XS / XS Max, or iPhone 13/14/15/16 standard/plus/pro
  if (b.includes('apple') || m.includes('iphone') || m.includes('ipad')) {
    if (/ipad/i.test(m)) return true;
    if (/iphone\s*(17|16|15|14|13|12\s*pro|11\s*pro|xs)/i.test(m)) return true;
    // iPhone 12/11 base, XR, X, 8, 7, 6, SE max out at 256GB or lower
    return false;
  }

  // 2. Samsung: Strictly Ultra, Fold, Flip 5/6/7, S24+, S25+, S26+, Note 20 Ultra
  if (b.includes('samsung') || m.includes('galaxy')) {
    if (/ultra|fold|flip\s*[5-7]|s2[4-6]\s*\+|note\s*20\s*ultra/i.test(m)) return true;
    return false; // All other Samsung (A, M, F, base S20/S21/S22/S23, FE) max out at 256GB
  }

  // 3. OnePlus: Strictly OnePlus 12, 13, Open (Nord series, 11R, 12R never had 512GB in India)
  if (b.includes('oneplus')) {
    if (/\b(12|13|open)\b/i.test(m) && !/12r|nord/i.test(m)) return true;
    return false;
  }

  // 4. Xiaomi / Redmi / Poco: Strictly Xiaomi 13 Pro, 14, 14 Ultra, Redmi Note 13 Pro+
  if (b.includes('xiaomi') || b.includes('redmi') || b.includes('poco')) {
    if (/xiaomi\s*(13\s*pro|14\b|14\s*ultra)|note\s*13\s*pro\+|poco\s*f6/i.test(m)) return true;
    return false;
  }

  // 5. Vivo / iQOO: Strictly Vivo X series flagships (X100, X200, X90 Pro) & iQOO 12/13
  if (b.includes('vivo') || b.includes('iqoo')) {
    if (/vivo\s*x(100|200|90)|iqoo\s*(12|13)/i.test(m)) return true;
    return false; // Vivo V series (V20, V29, V30, V40) and Y series never had 512GB in India
  }

  // 6. Realme: Strictly GT 6 / GT 7
  if (b.includes('realme')) {
    if (/gt\s*[67]/i.test(m)) return true;
    return false;
  }

  // 7. Motorola: Strictly Razr Ultra & Edge 50 Ultra
  if (b.includes('motorola') || b.includes('moto')) {
    if (/razr\s*(40|50|60)\s*ultra|edge\s*50\s*ultra/i.test(m)) return true;
    return false;
  }

  // 8. Google Pixel: Strictly Pixel 7 Pro, 8 Pro, 9 Pro, Fold
  if (b.includes('google') || b.includes('pixel')) {
    if (/pixel.*(pro|fold)/i.test(m)) return true;
    return false;
  }

  return false;
}

export function inferTierHardwareSpecs(
  brand = '',
  model = '',
  seedStorages: string[] = [],
  seedRams: string[] = []
): DeviceHardwareSpecs {
  const bLower = (brand || '').toLowerCase().trim();
  const mLower = (model || '').toLowerCase().trim();
  const fullText = `${bLower} ${mLower}`;
  const isApple = bLower.includes('apple') || mLower.includes('iphone') || mLower.includes('ipad');

  if (isApple) {
    let storages = ['128 GB', '256 GB', '512 GB'];
    if (/pro\s*max/i.test(mLower)) {
      if (/1[567]/i.test(mLower)) storages = ['256 GB', '512 GB', '1 TB'];
      else storages = ['128 GB', '256 GB', '512 GB', '1 TB'];
    } else if (/\bpro\b/i.test(mLower)) {
      if (/1[12]/i.test(mLower)) storages = /11/i.test(mLower) ? ['64 GB', '256 GB', '512 GB'] : ['128 GB', '256 GB', '512 GB'];
      else storages = ['128 GB', '256 GB', '512 GB', '1 TB'];
    } else if (/\b(11|12|xr|xs|x\b|8\b|8\s*plus|se\b)/i.test(mLower)) {
      if (/xs/i.test(mLower)) storages = ['64 GB', '256 GB', '512 GB'];
      else if (/x\b/i.test(mLower)) storages = ['64 GB', '256 GB'];
      else storages = ['64 GB', '128 GB', '256 GB'];
    } else if (/\b(7)\b/i.test(mLower)) {
      storages = ['32 GB', '128 GB', '256 GB'];
    } else if (/\b(6s|6)\b/i.test(mLower)) {
      storages = ['16 GB', '32 GB', '64 GB', '128 GB'];
    } else if (/\b(5s|5c|5)\b/i.test(mLower)) {
      storages = ['16 GB', '32 GB', '64 GB'];
    } else if (/plus\b/i.test(mLower)) {
      storages = ['128 GB', '256 GB', '512 GB'];
    } else if (/ipad/i.test(mLower)) {
      storages = ['128 GB', '256 GB', '512 GB', '1 TB'];
    }

    const defaultStorage = storages[0] || '128 GB';

    return {
      storages,
      rams: [],
      defaultStorage,
      defaultRam: '',
      getRamsForStorage: () => [],
    };
  }

  // Non-Apple (Android) Specs Generation by Tier
  let tierStorages = ['128 GB', '256 GB'];
  let tierRamMap: Record<string, string[]> = {
    '128 GB': ['6 GB', '8 GB'],
    '256 GB': ['8 GB', '12 GB'],
  };
  let allRams = ['6 GB', '8 GB', '12 GB'];

  // 1. Ultra / Fold / Flip / Top Flagships
  if (
    /ultra|fold|flip|find\s*x|pixel.*pro|oneplus\s*(13|12|11|10\s*pro|open)|x100|x90|s2[0-6]|note\s*20/i.test(fullText)
  ) {
    if (/ultra|fold/i.test(mLower)) {
      tierStorages = ['256 GB', '512 GB', '1 TB'];
      tierRamMap = {
        '256 GB': ['12 GB', '16 GB'],
        '512 GB': ['12 GB', '16 GB'],
        '1 TB': ['16 GB'],
      };
      allRams = ['12 GB', '16 GB'];
    } else {
      tierStorages = ['128 GB', '256 GB', '512 GB'];
      tierRamMap = {
        '128 GB': ['8 GB', '12 GB'],
        '256 GB': ['8 GB', '12 GB', '16 GB'],
        '512 GB': ['12 GB', '16 GB'],
      };
      allRams = ['8 GB', '12 GB', '16 GB'];
    }
  }
  // 2. Upper Mid-Range / Pro / Performance / Neo / GT / Edge / Reno / V series (Indian market caps out at 256 GB)
  else if (
    /pro\+|pro\s*plus|\bpro\b|neo|turbo|gt|plus|\+|fe|nord|reno|iqoo\s*z|poco\s*(f|x)|note.*pro|a5\d|a7\d|m5\d|f5\d|edge|v\d+/i.test(fullText)
  ) {
    tierStorages = ['128 GB', '256 GB'];
    tierRamMap = {
      '128 GB': ['6 GB', '8 GB'],
      '256 GB': ['8 GB', '12 GB'],
    };
    allRams = ['6 GB', '8 GB', '12 GB'];
  }
  // 3. Itel Budget Series (Accurate 4GB-8GB RAM, 64GB-256GB Storage)
  else if (/itel/i.test(fullText)) {
    tierStorages = ['64 GB', '128 GB', '256 GB'];
    tierRamMap = {
      '64 GB': ['4 GB'],
      '128 GB': ['4 GB', '6 GB', '8 GB'],
      '256 GB': ['8 GB'],
    };
    allRams = ['4 GB', '6 GB', '8 GB'];
  }
  // 4. Budget / Entry-level (A0x, A1x, Redmi A/C/number A, Realme C, Poco C, Spark, Smart, Narzo 50i, etc.)
  else if (
    /a0\d|a1\d|m0\d|m1\d|f0\d|f1\d|redmi\s*([6-9][ac]|10a|12c|13c|a[1-3])|realme\s*c|poco\s*c|vivo\s*y|spark|smart|pova|camon|moto\s*e|narzo\s*([1-5]0i|[1-5]0a)/i.test(fullText)
  ) {
    tierStorages = ['32 GB', '64 GB', '128 GB'];
    tierRamMap = {
      '32 GB': ['2 GB', '3 GB', '4 GB'],
      '64 GB': ['3 GB', '4 GB', '6 GB'],
      '128 GB': ['4 GB', '6 GB', '8 GB'],
    };
    allRams = ['2 GB', '3 GB', '4 GB', '6 GB'];
  }
  // 5. Classic / Vintage J, C, On series
  else if (/galaxy\s*[jcon]\d|\bj\d|\bc\d|\bon\d|galaxy\s*core|galaxy\s*grand/i.test(fullText)) {
    tierStorages = ['16 GB', '32 GB', '64 GB'];
    tierRamMap = {
      '16 GB': ['2 GB', '3 GB'],
      '32 GB': ['3 GB', '4 GB'],
      '64 GB': ['4 GB'],
    };
    allRams = ['2 GB', '3 GB', '4 GB'];
  }
  // 6. Standard Mid-range default (A2x, A3x, M3x, Redmi Note base, Realme number, Moto G, etc.)
  else {
    tierStorages = ['64 GB', '128 GB', '256 GB'];
    tierRamMap = {
      '64 GB': ['4 GB', '6 GB'],
      '128 GB': ['6 GB', '8 GB'],
      '256 GB': ['8 GB'],
    };
    allRams = ['4 GB', '6 GB', '8 GB'];
  }

  const normSeeds = seedStorages
    .map(normalizeStorageString)
    .filter(isValidStorageTier);
  const rawStorages = normSeeds.length > 0 ? normSeeds : tierStorages;
  const is512Allowed = is512GBValidForModel(brand, model);
  const finalStorages = rawStorages.filter((stg) => {
    const norm = normalizeStorageString(stg);
    if (norm.includes('512 GB') || norm.includes('1 TB') || norm.includes('2 TB')) {
      return is512Allowed;
    }
    return true;
  });
  const normalizedSeedRams = seedRams.map(normalizeRamString).filter(Boolean);
  const finalRams = Array.from(new Set([...normalizedSeedRams, ...allRams]));

  const getRamsForStorage = (stg: string): string[] => {
    if (isApple) return [];
    const norm = normalizeStorageString(stg);

    // If explicit seed RAM was defined in database/catalog for this model:
    if (normalizedSeedRams.length === 1) {
      // Exactly 1 RAM exists for this phone - NEVER fabricate a second fake RAM!
      return normalizedSeedRams;
    }
    if (normalizedSeedRams.length > 1) {
      // Multiple authentic RAMs exist across storages
      if (norm.includes('32 GB') || norm.includes('16 GB')) {
        const match = normalizedSeedRams.filter((r) => parseInt(r, 10) <= 4);
        return match.length > 0 ? match : [normalizedSeedRams[0]];
      }
      if (norm.includes('64 GB')) {
        const match = normalizedSeedRams.filter((r) => parseInt(r, 10) <= 6);
        return match.length > 0 ? match : [normalizedSeedRams[0]];
      }
      if (norm.includes('128 GB')) {
        const match = normalizedSeedRams.filter((r) => parseInt(r, 10) <= 12);
        return match.length > 0 ? match : [normalizedSeedRams[0]];
      }
      if (norm.includes('256 GB')) {
        const match = normalizedSeedRams.filter((r) => parseInt(r, 10) >= 8);
        return match.length > 0 ? match : [normalizedSeedRams[normalizedSeedRams.length - 1]];
      }
      if (norm.includes('512 GB') || norm.includes('1 TB')) {
        const match = normalizedSeedRams.filter((r) => parseInt(r, 10) >= 12);
        return match.length > 0 ? match : [normalizedSeedRams[normalizedSeedRams.length - 1]];
      }
      return normalizedSeedRams;
    }

    if (tierRamMap[norm] && tierRamMap[norm].length > 0) {
      return tierRamMap[norm];
    }
    return [];
  };

  const defaultStorage = normSeeds[0] || finalStorages[0] || '128 GB';
  const defaultRams = getRamsForStorage(defaultStorage);

  return {
    storages: finalStorages,
    rams: defaultRams,
    defaultStorage,
    defaultRam: defaultRams[0] || '',
    getRamsForStorage,
  };
}

/**
 * Returns exact model-accurate storage and RAM variant options.
 * Guarantees that invalid storage tiers and invalid RAM tiers
 * (e.g. 12GB on 128GB or 6GB on 64GB) are NEVER displayed.
 */
export function getModelHardwareSpecs(
  brand = '',
  model = '',
  customCatalog?: Array<{ brand: string; model: string; storage: string }>
): DeviceHardwareSpecs {
  let normBrand = (brand || '').toLowerCase().trim();
  if (normBrand === 'techno') normBrand = 'tecno';
  const normModel = (model || '').toLowerCase().trim();
  const fullText = `${normBrand} ${normModel}`;
  const isApple = normBrand.includes('apple') || normModel.includes('iphone') || normModel.includes('ipad');

  const is512Allowed = is512GBValidForModel(brand, model);
  const sanitizeSpecs = (specs: DeviceHardwareSpecs): DeviceHardwareSpecs => {
    const storages = specs.storages.filter((stg) => {
      const norm = normalizeStorageString(stg);
      if (norm.includes('512 GB') || norm.includes('1 TB') || norm.includes('2 TB')) {
        return is512Allowed;
      }
      return true;
    });
    const safeStorages = storages.length > 0 ? storages : (specs.storages[0] ? [specs.storages[0]] : ['128 GB']);
    const defaultStorage = safeStorages.includes(specs.defaultStorage) ? specs.defaultStorage : safeStorages[0];
    const defaultRams = specs.getRamsForStorage(defaultStorage);
    return {
      ...specs,
      storages: safeStorages,
      defaultStorage,
      rams: defaultRams,
      defaultRam: defaultRams[0] || '',
    };
  };

  // 1. Check Explicit Hardware Rules with Exact Storage <-> RAM Pairing
  for (const rule of MODEL_HARDWARE_RULES) {
    if (rule.pattern.test(fullText) || rule.pattern.test(normModel)) {
      const storages = rule.variants
        .map((v) => normalizeStorageString(v.storage))
        .filter(isValidStorageTier);

      if (storages.length > 0) {
        const defaultStorage = storages[0] || '128 GB';

        const getRamsForStorage = (stg: string): string[] => {
          const normStg = normalizeStorageString(stg);
          const match = rule.variants.find((v) => normalizeStorageString(v.storage) === normStg);
          return match ? match.rams.map(normalizeRamString) : [];
        };

        const defaultRams = getRamsForStorage(defaultStorage);

        return sanitizeSpecs({
          storages,
          rams: defaultRams,
          defaultStorage,
          defaultRam: defaultRams[0] || '',
          getRamsForStorage,
        });
      }
    }
  }

  // 2. Check Database in ALL_INDIAN_PHONES_CATALOG
  const foundPhone = ALL_INDIAN_PHONES_CATALOG.find((p) => {
    const pModel = p.model.toLowerCase();
    const pFull = `${p.brand.toLowerCase()} ${pModel}`;
    return (
      pFull === fullText ||
      pModel === normModel ||
      fullText.includes(pModel) ||
      pModel.includes(normModel)
    );
  });

  if (foundPhone) {
    const dbStorages = Array.isArray(foundPhone.storage_options) && foundPhone.storage_options.length > 0
      ? Array.from(new Set(foundPhone.storage_options.map(normalizeStorageString)))
          .filter(isValidStorageTier)
      : [];
    const dbRams = isApple
      ? []
      : (Array.isArray(foundPhone.ram_options) && foundPhone.ram_options.length > 0
          ? Array.from(new Set(foundPhone.ram_options.map(normalizeRamString)))
          : []);

    if (dbStorages.length > 0) {
      const defaultStorage = dbStorages[0] || '128 GB';
      const validRams = isApple ? [] : dbRams;

      const getRamsForStorage = (stg: string): string[] => {
        if (isApple || validRams.length === 0) return [];
        if (validRams.length === 1) return validRams;

        const norm = normalizeStorageString(stg);
        if (norm.includes('32 GB') || norm.includes('16 GB')) {
          const match = validRams.filter((r) => parseInt(r, 10) <= 4);
          return match.length > 0 ? match : [validRams[0]];
        }
        if (norm.includes('64 GB')) {
          const match = validRams.filter((r) => parseInt(r, 10) <= 6);
          return match.length > 0 ? match : [validRams[0]];
        }
        if (norm.includes('128 GB')) {
          const match = validRams.filter((r) => parseInt(r, 10) <= 12);
          return match.length > 0 ? match : [validRams[0]];
        }
        if (norm.includes('256 GB')) {
          const match = validRams.filter((r) => parseInt(r, 10) >= 8);
          return match.length > 0 ? match : [validRams[validRams.length - 1]];
        }
        if (norm.includes('512 GB') || norm.includes('1 TB')) {
          const match = validRams.filter((r) => parseInt(r, 10) >= 12);
          return match.length > 0 ? match : [validRams[validRams.length - 1]];
        }
        return validRams;
      };

      const defaultRams = getRamsForStorage(defaultStorage);

      return sanitizeSpecs({
        storages: dbStorages,
        rams: defaultRams,
        defaultStorage,
        defaultRam: defaultRams[0] || '',
        getRamsForStorage,
      });
    }

    // If database has incomplete options (e.g. only 1 storage or empty RAM), enhance with tier specs
    return sanitizeSpecs(inferTierHardwareSpecs(brand, model, dbStorages, dbRams));
  }

  // 3. Check customCatalog variants if provided (e.g. MASTER_MODEL_CATALOG)
  if (Array.isArray(customCatalog) && customCatalog.length > 0) {
    const brandPrefixRegex = /^(apple|samsung|oneplus|xiaomi|vivo|oppo|realme|motorola|moto|google|pixel|nothing|cmf|tecno|techno|itel|infinix|poco|iqoo|honor|lenovo)\s+/i;
    const cleanTarget = normModel
      .replace(brandPrefixRegex, '')
      .replace(/[\s-]+/g, ' ')
      .trim();

    const areBrandsEquivalent = (b1: string, b2: string) => {
      const a = b1.toLowerCase().trim();
      const b = b2.toLowerCase().trim();
      if (a === b) return true;
      if ((a === 'tecno' && b === 'techno') || (a === 'techno' && b === 'tecno')) return true;
      if ((a === 'moto' && b === 'motorola') || (a === 'motorola' && b === 'moto')) return true;
      if ((a === 'pixel' && b === 'google') || (a === 'google' && b === 'pixel')) return true;
      if ((a === 'poco' && b === 'xiaomi') || (a === 'xiaomi' && b === 'poco')) return true;
      if ((a === 'iqoo' && b === 'vivo') || (a === 'vivo' && b === 'iqoo')) return true;
      if ((a === 'cmf' && b === 'nothing') || (a === 'nothing' && b === 'cmf')) return true;
      return false;
    };

    const catalogVariants = customCatalog.filter((m) => {
      const mBrand = m.brand.toLowerCase();
      if (!areBrandsEquivalent(mBrand, normBrand)) return false;
      const cleanM = m.model
        .toLowerCase()
        .replace(brandPrefixRegex, '')
        .replace(/[\s-]+/g, ' ')
        .trim();
      return cleanM === cleanTarget;
    });

    if (catalogVariants.length > 0) {
      const seedStorages = Array.from(new Set(catalogVariants.map((v) => normalizeStorageString(v.storage))))
        .filter(isValidStorageTier);
      return sanitizeSpecs(inferTierHardwareSpecs(brand, model, seedStorages, []));
    }
  }

  // 4. Intelligent Fallback by Brand & Generation Tier
  return sanitizeSpecs(inferTierHardwareSpecs(brand, model));
}
