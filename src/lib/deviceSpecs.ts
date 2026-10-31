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

  // Samsung Galaxy Note Series (Exclude Redmi/Infinix Note)
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

  // 16. Explicit 4-digit year match if present
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
    pattern: /(?:apple\s*(?:iphone\s*)?|iphone\s*)(?:1[5-9]|[2-9]\d)\s*pro\s*max\b/i,
    variants: [
      { storage: '256 GB', rams: [] },
      { storage: '512 GB', rams: [] },
      { storage: '1 TB', rams: [] },
    ],
  },
  {
    pattern: /(?:apple\s*(?:iphone\s*)?|iphone\s*)14\s*pro\s*max\b/i,
    variants: [
      { storage: '128 GB', rams: [] },
      { storage: '256 GB', rams: [] },
      { storage: '512 GB', rams: [] },
      { storage: '1 TB', rams: [] },
    ],
  },
  {
    pattern: /(?:apple\s*(?:iphone\s*)?|iphone\s*)13\s*pro\s*max\b/i,
    variants: [
      { storage: '128 GB', rams: [] },
      { storage: '256 GB', rams: [] },
      { storage: '512 GB', rams: [] },
      { storage: '1 TB', rams: [] },
    ],
  },
  {
    pattern: /(?:apple\s*(?:iphone\s*)?|iphone\s*)(?:1[3-9]|[2-9]\d)\s*pro(?!\s*max)\b/i,
    variants: [
      { storage: '128 GB', rams: [] },
      { storage: '256 GB', rams: [] },
      { storage: '512 GB', rams: [] },
      { storage: '1 TB', rams: [] },
    ],
  },
  {
    pattern: /(?:apple\s*(?:iphone\s*)?|iphone\s*)16e\b/i,
    variants: [
      { storage: '128 GB', rams: [] },
      { storage: '256 GB', rams: [] },
    ],
  },
  {
    pattern: /(?:apple\s*(?:iphone\s*)?|iphone\s*)(?:1[3-9]|[2-9]\d)\s*(?:plus|air|\b)(?!\s*(?:pro|max|mini))/i,
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
  // 1. S-Series Ultra (S26 Ultra down to S20 Ultra)
  {
    pattern: /samsung.*(s2[3-6])\s*ultra/i,
    variants: [
      { storage: '256 GB', rams: ['12 GB'] },
      { storage: '512 GB', rams: ['12 GB', '16 GB'] },
      { storage: '1 TB', rams: ['12 GB', '16 GB'] },
    ],
  },
  {
    pattern: /samsung.*s22\s*ultra/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['12 GB'] },
      { storage: '512 GB', rams: ['12 GB'] },
      { storage: '1 TB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /samsung.*(s21|s20)\s*ultra/i,
    variants: [
      { storage: '128 GB', rams: ['12 GB'] },
      { storage: '256 GB', rams: ['12 GB'] },
      { storage: '512 GB', rams: ['16 GB'] },
    ],
  },

  // 2. S-Series Plus (S26+ down to S20+)
  {
    pattern: /samsung.*(s2[3-6])\s*\+/i,
    variants: [
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
      { storage: '512 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /samsung.*(s22|s21)\s*\+/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /samsung.*s20\s*\+/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '512 GB', rams: ['12 GB'] },
    ],
  },

  // 3. S-Series Base (S26 down to S20)
  {
    pattern: /samsung.*(s26|s25)\s*(5g|\b)(?!\s*(ultra|\+|fe|edge|slim))/i,
    variants: [
      { storage: '128 GB', rams: ['12 GB'] },
      { storage: '256 GB', rams: ['12 GB'] },
      { storage: '512 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /samsung.*s24\s*(5g|\b)(?!\s*(ultra|\+|fe))/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
      { storage: '512 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /samsung.*(s23|s22|s21)\s*(5g|\b)(?!\s*(ultra|\+|fe))/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /samsung.*s20\s*(5g|\b)(?!\s*(ultra|\+|fe))/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
    ],
  },

  // 4. S-Series FE
  {
    pattern: /samsung.*s24\s*fe/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
      { storage: '512 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /samsung.*(s26|s25|s23|s21|s20)\s*fe/i,
    variants: [
      { storage: '128 GB', rams: ['6 GB', '8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },

  // 5. S10 Series
  {
    pattern: /samsung.*s10\s*\+/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '512 GB', rams: ['8 GB'] },
      { storage: '1 TB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /samsung.*s10\s*lite/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '512 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /samsung.*s10e/i,
    variants: [
      { storage: '128 GB', rams: ['6 GB', '8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /samsung.*s10\b(?!\s*(\+|lite|e))/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '512 GB', rams: ['8 GB'] },
    ],
  },

  // 6. S9 & S8 Series
  {
    pattern: /samsung.*s9\s*(\+|plus)/i,
    variants: [
      { storage: '64 GB', rams: ['6 GB'] },
      { storage: '128 GB', rams: ['6 GB'] },
      { storage: '256 GB', rams: ['6 GB'] },
    ],
  },
  {
    pattern: /samsung.*s9\b(?!\s*(\+|plus))/i,
    variants: [
      { storage: '64 GB', rams: ['4 GB'] },
      { storage: '128 GB', rams: ['4 GB'] },
      { storage: '256 GB', rams: ['4 GB'] },
    ],
  },
  {
    pattern: /samsung.*s8\s*(\+|plus)/i,
    variants: [
      { storage: '64 GB', rams: ['4 GB', '6 GB'] },
      { storage: '128 GB', rams: ['6 GB'] },
    ],
  },
  {
    pattern: /samsung.*s8\b(?!\s*(\+|plus))/i,
    variants: [
      { storage: '64 GB', rams: ['4 GB'] },
    ],
  },

  // 7. GALAXY Z FOLD SERIES
  {
    pattern: /samsung.*z\s*fold\s*special/i,
    variants: [
      { storage: '512 GB', rams: ['16 GB'] },
      { storage: '1 TB', rams: ['16 GB'] },
    ],
  },
  {
    pattern: /samsung.*z\s*fold\s*([4-8])/i,
    variants: [
      { storage: '256 GB', rams: ['12 GB'] },
      { storage: '512 GB', rams: ['12 GB', '16 GB'] },
      { storage: '1 TB', rams: ['12 GB', '16 GB'] },
    ],
  },
  {
    pattern: /samsung.*z\s*fold\s*[23]/i,
    variants: [
      { storage: '256 GB', rams: ['12 GB'] },
      { storage: '512 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /samsung.*galaxy\s*fold\b(?!\s*[2-8])/i,
    variants: [
      { storage: '512 GB', rams: ['12 GB'] },
    ],
  },

  // 8. GALAXY Z FLIP SERIES
  {
    pattern: /samsung.*z\s*flip\s*([6-8])/i,
    variants: [
      { storage: '256 GB', rams: ['12 GB'] },
      { storage: '512 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /samsung.*z\s*flip\s*5\b/i,
    variants: [
      { storage: '256 GB', rams: ['8 GB'] },
      { storage: '512 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /samsung.*z\s*flip\s*4\b/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
      { storage: '512 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /samsung.*z\s*flip\s*3\b/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /samsung.*galaxy\s*z\s*flip\b(?!\s*[3-8])/i,
    variants: [
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },

  // 9. GALAXY NOTE SERIES
  {
    pattern: /samsung.*note\s*20\s*ultra/i,
    variants: [
      { storage: '256 GB', rams: ['12 GB'] },
      { storage: '512 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /samsung.*note\s*20\b(?!\s*ultra)/i,
    variants: [
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /samsung.*note\s*10\s*(\+|plus)/i,
    variants: [
      { storage: '256 GB', rams: ['12 GB'] },
      { storage: '512 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /samsung.*note\s*10\s*lite/i,
    variants: [
      { storage: '128 GB', rams: ['6 GB', '8 GB'] },
    ],
  },
  {
    pattern: /samsung.*note\s*10\b(?!\s*(\+|plus|lite))/i,
    variants: [
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /samsung.*note\s*9/i,
    variants: [
      { storage: '128 GB', rams: ['6 GB'] },
      { storage: '512 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /samsung.*note\s*8/i,
    variants: [
      { storage: '64 GB', rams: ['6 GB'] },
    ],
  },

  // 10. GALAXY A & M POPULAR SERIES
  {
    pattern: /samsung.*(a14|a13|a12|a15|a16|m14|m13|m12|f14)\s*(5g|\b)/i,
    variants: [
      { storage: '64 GB', rams: ['4 GB', '6 GB'] },
      { storage: '128 GB', rams: ['4 GB', '6 GB', '8 GB'] },
    ],
  },
  {
    pattern: /samsung.*(a04|a04s|a03|a03s|a05|m04|f04)\b/i,
    variants: [
      { storage: '32 GB', rams: ['3 GB', '4 GB'] },
      { storage: '64 GB', rams: ['4 GB'] },
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
    pattern: /nothing\s*phone\s*\(?4a\)?\s*pro/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
      { storage: '512 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /nothing\s*phone\s*\(?4a\)?\b(?!\s*pro)/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
    ],
  },
  {
    pattern: /nothing\s*phone\s*\(?4b\)?\b/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
    ],
  },
  {
    pattern: /nothing\s*phone\s*\(?3a\)?\s*pro/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
      { storage: '512 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /nothing\s*phone\s*\(?3a\)?\s*lite/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /nothing\s*phone\s*\(?3a\)?\b(?!\s*(?:pro|lite))/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
    ],
  },
  {
    pattern: /nothing\s*phone\s*\(?3\)?\b(?!\s*a)/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['12 GB'] },
      { storage: '512 GB', rams: ['12 GB', '16 GB'] },
    ],
  },
  {
    pattern: /nothing\s*phone\s*\(?2a\)?\s*plus/i,
    variants: [
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
    ],
  },
  {
    pattern: /nothing\s*phone\s*\(?2a\)?\b(?!\s*plus)/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
    ],
  },
  {
    pattern: /nothing\s*phone\s*\(?2\)?\b(?!\s*a)/i,
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
    pattern: /(?:cmf(?:\s*by\s*nothing)?\s*phone\s*2\s*pro|cmf\s*2\s*pro)/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
    ],
  },
  {
    pattern: /(?:cmf(?:\s*by\s*nothing)?\s*phone\s*1|cmf\s*phone\s*1\s*by\s*nothing)/i,
    variants: [
      { storage: '128 GB', rams: ['6 GB', '8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },

  // ==========================================
  // VIVO & iQOO
  // ==========================================
  {
    pattern: /vivo\s*x(200|100|90|80|70)\b/i,
    variants: [
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
      { storage: '512 GB', rams: ['12 GB', '16 GB'] },
    ],
  },
  {
    pattern: /vivo\s*y(21|22|20|16|15|12|02|01|35|56|200)\b/i,
    variants: [
      { storage: '32 GB', rams: ['3 GB', '4 GB'] },
      { storage: '64 GB', rams: ['4 GB'] },
      { storage: '128 GB', rams: ['4 GB', '6 GB', '8 GB'] },
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
    pattern: /iqoo\s*neo\s*9\s*pro/i,
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
    pattern: /(?:iqoo\s*z6\s*pro|\bz6\s*pro)(?:\s*5g)?\b/i,
    variants: [
      { storage: '128 GB', rams: ['6 GB', '8 GB'] },
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
    ],
  },
  {
    pattern: /(?:iqoo\s*z6\s*lite|\bz6\s*lite)(?:\s*5g)?\b/i,
    variants: [
      { storage: '64 GB', rams: ['4 GB'] },
      { storage: '128 GB', rams: ['6 GB'] },
    ],
  },
  {
    pattern: /(?:iqoo\s*z6|\bz6\s*(?:5g|44w)?\b)(?!\s*(?:pro|lite))/i,
    variants: [
      { storage: '128 GB', rams: ['4 GB', '6 GB', '8 GB'] },
    ],
  },
  {
    pattern: /(?:iqoo\s*)?z7s?(\s*5g)?\b(?!\s*pro)/i,
    variants: [
      { storage: '128 GB', rams: ['6 GB', '8 GB'] },
    ],
  },
  {
    pattern: /(?:iqoo\s*)?z7\s*pro(\s*5g)?\b/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /(?:iqoo\s*)?z9x(\s*5g)?\b/i,
    variants: [
      { storage: '128 GB', rams: ['4 GB', '6 GB', '8 GB'] },
    ],
  },
  {
    pattern: /(?:iqoo\s*)?z9\s*lite(\s*5g)?\b/i,
    variants: [
      { storage: '128 GB', rams: ['4 GB', '6 GB'] },
    ],
  },
  {
    pattern: /(?:iqoo\s*)?z9s\s*pro(\s*5g)?\b/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
    ],
  },
  {
    pattern: /(?:iqoo\s*)?z9s(\s*5g)?\b(?!\s*pro)/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
    ],
  },
  {
    pattern: /(?:iqoo\s*)?z9(\s*5g)?\b(?!\s*(?:x|lite|s|pro|turbo))/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /(?:vivo\s*)?t1\s*(?:5g|44w)?\b(?!\s*(?:pro|x))/i,
    variants: [
      { storage: '128 GB', rams: ['4 GB', '6 GB', '8 GB'] },
    ],
  },
  {
    pattern: /(?:vivo\s*)?t1x\b/i,
    variants: [
      { storage: '64 GB', rams: ['4 GB'] },
      { storage: '128 GB', rams: ['4 GB', '6 GB'] },
    ],
  },
  {
    pattern: /(?:vivo\s*)?t1\s*pro(\s*5g)?\b/i,
    variants: [
      { storage: '128 GB', rams: ['6 GB', '8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /(?:vivo\s*)?t2x(\s*5g)?\b/i,
    variants: [
      { storage: '128 GB', rams: ['4 GB', '6 GB', '8 GB'] },
    ],
  },
  {
    pattern: /(?:vivo\s*)?t2(\s*5g)?\b(?!\s*(?:pro|x))/i,
    variants: [
      { storage: '128 GB', rams: ['6 GB', '8 GB'] },
    ],
  },
  {
    pattern: /(?:vivo\s*)?t2\s*pro(\s*5g)?\b/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /(?:vivo\s*)?t3x(\s*5g)?\b/i,
    variants: [
      { storage: '128 GB', rams: ['4 GB', '6 GB', '8 GB'] },
    ],
  },
  {
    pattern: /(?:vivo\s*)?t3\s*lite(\s*5g)?\b/i,
    variants: [
      { storage: '128 GB', rams: ['4 GB', '6 GB'] },
    ],
  },
  {
    pattern: /(?:vivo\s*)?t3\s*ultra\b/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
    ],
  },
  {
    pattern: /(?:vivo\s*)?t3(\s*pro)?(\s*5g)?\b(?!\s*(?:x|lite|ultra))/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },

  // ==========================================
  // OPPO
  // ==========================================
  // Find Series
  {
    pattern: /oppo\s*find\s*n3\b(?!\s*flip)/i,
    variants: [
      { storage: '512 GB', rams: ['16 GB'] },
    ],
  },
  {
    pattern: /oppo\s*find\s*n[23]\s*flip/i,
    variants: [
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
    ],
  },
  {
    pattern: /oppo\s*(find\s*x[78]\s*ultra|find\s*x8\s*pro)/i,
    variants: [
      { storage: '256 GB', rams: ['12 GB', '16 GB'] },
      { storage: '512 GB', rams: ['16 GB'] },
    ],
  },
  {
    pattern: /oppo\s*find\s*(?:x[28]|x\b)/i,
    variants: [
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
    ],
  },
  // Reno Series
  {
    pattern: /oppo\s*reno\s*(?:12|13|14|15)\s*pro/i,
    variants: [
      { storage: '256 GB', rams: ['12 GB'] },
      { storage: '512 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /oppo\s*reno\s*(?:10\s*pro\+|10\s*pro|11\s*pro|7\s*pro|8\s*pro|6\s*pro|10\b|7\b|12\b|2\b|2z\b)/i,
    variants: [
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
    ],
  },
  {
    pattern: /oppo\s*reno\s*(?:11\b|3\s*pro|2f|10x\s*zoom)/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
    ],
  },
  {
    pattern: /oppo\s*reno\s*(?:8\b|8t|6\b|5\s*pro|4\s*pro)/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
    ],
  },
  // F Series
  {
    pattern: /oppo\s*f(?:27\s*pro\+|27\b|25\s*pro|19\s*pro\+|19\s*pro\b)/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /oppo\s*f23\b/i,
    variants: [
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /oppo\s*f(?:11\s*pro|9\s*pro|7\b)/i,
    variants: [
      { storage: '64 GB', rams: ['4 GB', '6 GB'] },
      { storage: '128 GB', rams: ['6 GB'] },
    ],
  },
  {
    pattern: /oppo\s*f(?:21s?\s*pro|19s?|17\s*pro|17\b|15|11\b)/i,
    variants: [
      { storage: '128 GB', rams: ['6 GB', '8 GB'] },
    ],
  },
  {
    pattern: /oppo\s*f(?:9\b|3\b)/i,
    variants: [
      { storage: '64 GB', rams: ['4 GB'] },
    ],
  },
  {
    pattern: /oppo\s*f(?:5\b|1s\b)/i,
    variants: [
      { storage: '32 GB', rams: ['3 GB', '4 GB'] },
      { storage: '64 GB', rams: ['4 GB', '6 GB'] },
    ],
  },
  // K Series
  {
    pattern: /oppo\s*k12x/i,
    variants: [
      { storage: '128 GB', rams: ['6 GB', '8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /oppo\s*k10\b/i,
    variants: [
      { storage: '128 GB', rams: ['6 GB', '8 GB'] },
    ],
  },
  {
    pattern: /oppo\s*k3\b/i,
    variants: [
      { storage: '64 GB', rams: ['6 GB'] },
      { storage: '128 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /oppo\s*k1\b/i,
    variants: [
      { storage: '64 GB', rams: ['4 GB'] },
    ],
  },
  // A Series
  {
    pattern: /oppo\s*a3\s*pro/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /oppo\s*a(?:79|78|77s|76|74|58|53s|52|38|96|9\s*2020|3\b)/i,
    variants: [
      { storage: '128 GB', rams: ['4 GB', '6 GB', '8 GB'] },
    ],
  },
  {
    pattern: /oppo\s*a(?:59|55|54|53|31|77\b|18|3x|15s)/i,
    variants: [
      { storage: '64 GB', rams: ['4 GB'] },
      { storage: '128 GB', rams: ['4 GB', '6 GB'] },
    ],
  },
  {
    pattern: /oppo\s*a(?:57|5\s*2020|17k?)/i,
    variants: [
      { storage: '64 GB', rams: ['3 GB', '4 GB'] },
    ],
  },
  {
    pattern: /oppo\s*a(?:16[ke]?|15\b|12\b|11k)/i,
    variants: [
      { storage: '32 GB', rams: ['3 GB'] },
      { storage: '64 GB', rams: ['4 GB'] },
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
  // SAMSUNG LEGACY
  // ==========================================
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
  {
    pattern: /redmi\s*(12c|10a|9a|9c|9\s*power|10\b|a1|a2|a3)\b/i,
    variants: [
      { storage: '32 GB', rams: ['2 GB', '3 GB'] },
      { storage: '64 GB', rams: ['3 GB', '4 GB'] },
      { storage: '128 GB', rams: ['4 GB', '6 GB'] },
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
  {
    pattern: /realme\s*c(55|53|35|33|31|30|25|21|15|12|11)\b/i,
    variants: [
      { storage: '32 GB', rams: ['3 GB', '4 GB'] },
      { storage: '64 GB', rams: ['4 GB'] },
      { storage: '128 GB', rams: ['4 GB', '6 GB', '8 GB'] },
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
    pattern: /pixel\s*9\s*pro\s*xl/i,
    variants: [
      { storage: '128 GB', rams: ['16 GB'] },
      { storage: '256 GB', rams: ['16 GB'] },
      { storage: '512 GB', rams: ['16 GB'] },
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
    pattern: /pixel\s*9\s*pro\b(?!\s*(xl|fold))/i,
    variants: [
      { storage: '128 GB', rams: ['16 GB'] },
      { storage: '256 GB', rams: ['16 GB'] },
    ],
  },
  {
    pattern: /pixel\s*9\b(?!\s*pro)/i,
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
    pattern: /pixel\s*8\b(?!\s*(pro|a))/i,
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
    pattern: /pixel\s*7\b(?!\s*(pro|a))/i,
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
    pattern: /pixel\s*6\b(?!\s*(pro|a))/i,
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
    pattern: /razr\s*(50|40)\s*ultra/i,
    variants: [
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
      { storage: '512 GB', rams: ['12 GB', '16 GB'] },
    ],
  },
  {
    pattern: /edge\s*50\s*ultra/i,
    variants: [
      { storage: '512 GB', rams: ['12 GB', '16 GB'] },
      { storage: '1 TB', rams: ['16 GB'] },
    ],
  },
  {
    pattern: /edge\s*50\s*pro/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
      { storage: '512 GB', rams: ['12 GB'] },
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
      { storage: '64 GB', rams: ['4 GB'] },
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

  // 1. Apple: Only iPhone 11 Pro / Pro Max and newer, XS / XS Max, or iPhone 13/14/15/16/17/18/19/20+ standard/plus/pro
  if (b.includes('apple') || m.includes('iphone') || m.includes('ipad')) {
    if (/ipad/i.test(m)) return true;
    if (/(?:iphone\s*)?(?:1[3-9]|[2-9]\d|12\s*pro|11\s*pro|xs)/i.test(m)) return true;
    // iPhone 12/11 base, XR, X, 8, 7, 6, SE max out at 256GB or lower
    return false;
  }

  // 2. Samsung: Strictly Ultra (S20-S30, Note 20), Fold, Flip 4/5/6/7/8/9, S-Plus (S20-S30+), S24-S30 Base, S24 FE, S10/S10+/S10 Lite, Note 10+, Note 9
  if (b.includes('samsung') || m.includes('galaxy')) {
    if (
      /ultra|fold|flip\s*[4-9]|s2[0-9]\s*\+|s3\d\s*\+|s2[4-9]\s*(5g|\b)|s3\d\s*(5g|\b)|s24\s*fe|s10\s*(\+|lite|\b)|note\s*(20|10\+|9)/i.test(m)
    ) return true;
    return false; // All other Samsung (A, M, F, base S20/S21/S22/S23, other FE) max out at 256GB
  }

  // 3. OnePlus: Strictly OnePlus 12, 13, Open (Nord series, 11R, 12R never had 512GB in India)
  if (b.includes('oneplus')) {
    if (/\b(12|13|open)\b/i.test(m) && !/12r|nord/i.test(m)) return true;
    return false;
  }

  // 4. Xiaomi / Redmi / Poco: Strictly Xiaomi 13 Pro, 14, 14 Ultra, Redmi Note 13 Pro+, Poco F6, Poco X6 Pro
  if (b.includes('xiaomi') || b.includes('redmi') || b.includes('poco')) {
    if (/xiaomi\s*(13\s*pro|14\b|14\s*ultra)|note\s*13\s*pro\+|poco\s*(f6|x6\s*pro)/i.test(m)) return true;
    return false;
  }

  // 5. Vivo / iQOO: Strictly Vivo X series flagships (X70-X200, Pro), V30/V40 Pro & iQOO 11/12/13/15
  if (b.includes('vivo') || b.includes('iqoo')) {
    if (/vivo\s*x(70|80|90|100|200)|v(30|40)\s*pro|iqoo\s*(11|12|13|15)/i.test(m)) return true;
    return false; // Vivo V series standard and Y series never had 512GB in India
  }

  // 6. Realme: Strictly GT 6 / GT 7 / GT 2 Pro
  if (b.includes('realme')) {
    if (/gt\s*(6|7|2\s*pro)/i.test(m)) return true;
    return false;
  }

  // 7. Motorola: Strictly Razr Ultra & Edge 50 Ultra / Edge 50 Pro
  if (b.includes('motorola') || b.includes('moto')) {
    if (/razr\s*(40|50|60)\s*ultra|edge\s*50\s*(ultra|pro)/i.test(m)) return true;
    return false;
  }

  // 8. Google Pixel: Strictly Pixel 6 Pro, 7 Pro, 8 Pro, 9 Pro, 9 Pro XL, 9/10 Pro Fold, 10 Pro
  if (b.includes('google') || b.includes('pixel')) {
    if (/pixel\s*(6\s*pro|7\s*pro|8\s*pro|9\s*pro|10\s*pro|fold)/i.test(m)) return true;
    return false;
  }

  // 9. Oppo: Strictly Find N series, Find X series, Reno 11/12/13/14/15 Pro
  if (b.includes('oppo')) {
    if (/find\s*(?:n|x[2-9]|x\d+)|reno\s*(?:11|12|13|14|15)\s*pro/i.test(m)) return true;
    return false;
  }

  // 9. Honor: Honor 200 Pro & Magic 6 Pro
  if (b.includes('honor') && /(200\s*pro|magic\s*6\s*pro)/i.test(m)) return true;

  // 11. Tecno: Phantom V Fold & Camon 30 Premier
  if (b.includes('tecno') && /(phantom\s*v|camon\s*30\s*premier)/i.test(m)) return true;

  // 12. Nothing: Phone (2), Phone 3, Phone 3a Pro, Phone 4a Pro
  if (b.includes('nothing')) {
    if (/phone\s*\(?2\)?\b(?!\s*[ap])/i.test(m) || /phone\s*(?:3\b|3a\s*pro|4a\s*pro)/i.test(m)) return true;
    return false;
  }

  return false;
}

/**
 * Master Authenticity Validator:
 * Ensures NO phone model in the system can ever display or select a fake/impossible storage tier.
 * Validates real-world Indian retail availability for every tier (16GB - 2TB).
 */
export function isStorageAllowedForModel(brand = '', model = '', storageStr = ''): boolean {
  const normStorage = normalizeStorageString(storageStr);
  const gb = getStorageInGb(normStorage);
  if (![16, 32, 64, 128, 256, 512, 1024, 2048].includes(gb)) {
    return false;
  }

  const b = String(brand || '').toLowerCase().trim();
  const m = String(model || '').toLowerCase().trim();
  const full = `${b} ${m}`;

  // 1. Tier: 512 GB / 1 TB / 2 TB (Strict Flagships Only)
  if (gb >= 512) {
    return is512GBValidForModel(brand, model);
  }

  // 2. Tier: 256 GB
  if (gb === 256) {
    // Google Pixel: In India & online recommerce, Pixel 6/7/8/9/10 series and Pixel Fold officially support 256GB
    if (b.includes('google') || b.includes('pixel')) {
      if (/pixel\s*(?:6|7|8|9|10|fold)/i.test(m)) return true;
      return false;
    }

    // Apple: Max 128GB on iPhone 6s/6, max 64GB on iPhone 5s/5/4
    if (b.includes('apple') || m.includes('iphone')) {
      if (/iphone\s*([456]s?|se\b(?!\s*(2|3|202[02])))\b/i.test(m)) return false;
      return true;
    }

    // iQOO & Vivo: Budget/Mid-range capped at 128GB in India
    if (b.includes('iqoo') || b.includes('vivo')) {
      if (/(?:iqoo\s*z6|z6\s*5g|z6\s*44w|z6\s*lite)\b(?!\s*pro)/i.test(m)) return false;
      if (/(?:iqoo\s*z7|z7\s*5g|z7s)\b(?!\s*pro)/i.test(m)) return false;
      if (/(?:iqoo\s*z9x|z9\s*lite)\b/i.test(m)) return false;
      if (/(?:vivo\s*t1|t1\s*5g|t1\s*44w|t1x)\b(?!\s*pro)/i.test(m)) return false;
      if (/(?:vivo\s*t2x|t3x|t3\s*lite)\b/i.test(m)) return false;
      if (/vivo\s*y0[1-9]|vivo\s*y1[0-9]|vivo\s*y2[0-2]\b/i.test(m)) return false;
      return true;
    }

    // Samsung: Budget lines (A0x, A1x, M0x, M1x, F0x, F1x, J, On, Core, Grand) NEVER had 256GB
    if (b.includes('samsung') || m.includes('galaxy')) {
      if (/\b(a0[1-9]|m0[1-9]|f0[1-9]|a1[0-4]|m1[0-4]|f1[0-4])\b/i.test(m)) return false;
      if (/galaxy\s*[jcon]\d|\bj\d|\bc\d|\bon\d|galaxy\s*core|galaxy\s*grand/i.test(m)) return false;
      return true;
    }

    // Xiaomi / Redmi / Poco: Budget lines NEVER had 256GB
    if (b.includes('xiaomi') || b.includes('redmi') || b.includes('poco')) {
      if (/redmi\s*([1-9][ac]|10a|12c|a[1-3]|go)\b/i.test(m)) return false;
      if (/poco\s*c[3-6]\d\b/i.test(m)) return false;
      if (/poco\s*m[2-4]\b(?!\s*pro)/i.test(m)) return false;
      return true;
    }

    // Realme: Budget C and Narzo lines NEVER had 256GB
    if (b.includes('realme')) {
      if (/realme\s*c(1|2|3|11|12|15|20|21|25|30|31|33|35)\b/i.test(m)) return false;
      if (/narzo\s*([1-5]0i|[1-5]0a)\b/i.test(m)) return false;
      return true;
    }

    // Motorola: E series and lower G series NEVER had 256GB
    if (b.includes('motorola') || b.includes('moto')) {
      if (/moto\s*e\d+\b/i.test(m)) return false;
      if (/moto\s*g(10|13|14|22|31|32|34|42|52)\b/i.test(m)) return false;
      return true;
    }

    // OnePlus: Nord CE 2 Lite & older flagships never had 256GB in India
    if (b.includes('oneplus')) {
      if (/nord\s*ce\s*2\s*lite/i.test(m)) return false;
      if (/oneplus\s*(?:[123]|3t|x)\b/i.test(m)) return false;
      return true;
    }

    // Oppo: Budget A series and older lower F/K series NEVER had 256GB in India
    if (b.includes('oppo')) {
      if (/oppo\s*a(?!3\s*pro)/i.test(m) || /\ba(1[1-9]|3[138x]|5[2-9]|7[4-9]|9[26]|9\s*2020|5\s*2020)\b/i.test(m)) {
        return false;
      }
      if (/oppo\s*f(?:[13579]|1[157]|19s?|21s?)\b(?!\s*pro\+)/i.test(m) || /oppo\s*f21s?\s*pro/i.test(m)) {
        return false;
      }
      if (/oppo\s*k([13]|10)\b/i.test(m)) {
        return false;
      }
      return true;
    }

    return true;
  }

  // 3. Tier: 128 GB
  if (gb === 128) {
    // Antique phones that only had up to 32GB or 64GB
    if (/iphone\s*[45]s?\b|galaxy\s*[jcon][1-3]\b/i.test(m)) {
      return false;
    }
    return true;
  }

  // 4. Tier: 64 GB
  if (gb === 64) {
    // Modern phones starting in 2021+ that START at 128 GB (64 GB is completely fake)
    if (
      /iphone\s*(?:1[3-9]|[2-9]\d)/i.test(m) ||
      /galaxy\s*s2[0-9]/i.test(m) ||
      /galaxy\s*s3\d/i.test(m) ||
      /galaxy\s*note\s*20/i.test(m) ||
      /z\s*(fold|flip)/i.test(m) ||
      /pixel\s*([4-9]|1[0-9])/i.test(m) ||
      /oneplus\s*([7-9]|1[0-3]|nord\s*[2-4]|nord\s*ce\s*[2-4])/i.test(m) ||
      /vivo\s*x(50|60|70|80|90|100|200)/i.test(m) ||
      /vivo\s*v(2[1-9]|3[0-9]|4[0-9])/i.test(m) ||
      /iqoo\s*(3|7|9|11|12|13|neo|z[6-9]\s*5g|z[6-9]\s*pro|z9s)/i.test(m) ||
      /oppo\s*(?:reno\s*\d+|find|f(?:19|2[1-7])|k1[0-9]|a(?:3\s*pro|5[89]|7[89]|9[68]))/i.test(full) ||
      /nothing\s*phone|cmf\s*phone/i.test(full)
    ) {
      return false;
    }
    return true;
  }

  // 5. Tier: 16 GB & 32 GB
  if (gb <= 32) {
    // Allowed ONLY on legacy/vintage devices (iPhone <= 7, Galaxy S <= 7, Galaxy J, Redmi <= 6A, A1, C11)
    if (
      /iphone\s*(?:[89]|1[0-9]|x|se\s*(?:2|3|202[02]))/i.test(m) ||
      /galaxy\s*s([89]|1[0-9]|2[0-9])/i.test(m) ||
      /galaxy\s*note\s*([89]|1[0-9]|2[0-9])/i.test(m) ||
      /oneplus\b/i.test(b) ||
      /pixel\s*([2-9]|1[0-9])/i.test(m) ||
      /nord\b/i.test(m) ||
      /iqoo\b/i.test(b) ||
      /vivo\s*[xv]\d+/i.test(m) ||
      /oppo\s*(find|reno)/i.test(m) ||
      /redmi\s*note/i.test(m) ||
      /realme\s*(gt|number|\d+)/i.test(m)
    ) {
      return false;
    }
    return true;
  }

  return true;
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
      storages = ['128 GB', '256 GB', '512 GB', '1 TB'];
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
    /pro\+|pro\s*plus|\bpro\b|neo|turbo|gt|plus|\+|fe|nord|reno|iqoo\s*z\s*(?:pro|s|turbo|\d{2})|poco\s*(f|x)|note.*pro|a5\d|a7\d|m5\d|f5\d|edge|v\d+/i.test(fullText)
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
      '32 GB': ['4 GB'],
      '64 GB': ['4 GB', '6 GB'],
      '128 GB': ['4 GB', '6 GB', '8 GB'],
    };
    allRams = ['4 GB', '6 GB', '8 GB'];
  }
  // 5. Classic / Vintage J, C, On series
  else if (/galaxy\s*[jcon]\d|\bj\d|\bc\d|\bon\d|galaxy\s*core|galaxy\s*grand/i.test(fullText)) {
    tierStorages = ['16 GB', '32 GB', '64 GB'];
    tierRamMap = {
      '16 GB': ['4 GB'],
      '32 GB': ['4 GB'],
      '64 GB': ['4 GB'],
    };
    allRams = ['4 GB'];
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
  const finalStorages = rawStorages.filter((stg) => {
    return isStorageAllowedForModel(brand, model, stg);
  });
  const normalizedSeedRams = seedRams.map(normalizeRamString).filter((r) => parseInt(r, 10) >= 4);
  const finalRams = Array.from(new Set([...normalizedSeedRams, ...allRams])).filter((r) => parseInt(r, 10) >= 4);

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
      return tierRamMap[norm].filter((r) => parseInt(r, 10) >= 4);
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

  const sanitizeSpecs = (specs: DeviceHardwareSpecs): DeviceHardwareSpecs => {
    const storages = specs.storages.filter((stg) => {
      return isValidStorageTier(stg) && isStorageAllowedForModel(brand, model, stg);
    });
    const safeStorages = storages.length > 0 ? storages : (specs.storages[0] ? [specs.storages[0]] : ['128 GB']);
    const defaultStorage = safeStorages.includes(specs.defaultStorage) ? specs.defaultStorage : safeStorages[0];

    // Filter out all RAM <= 3 GB (1 GB, 2 GB, 3 GB) globally
    const sanitizedGetRamsForStorage = (stg: string): string[] => {
      if (isApple) return [];
      const rawRams = specs.getRamsForStorage(stg) || [];
      const cleanRams = rawRams.filter((r) => {
        const gb = parseInt(r, 10);
        return !isNaN(gb) && gb >= 4;
      });
      return cleanRams.length > 0 ? cleanRams : (rawRams.length > 0 ? ['4 GB'] : []);
    };

    const defaultRams = sanitizedGetRamsForStorage(defaultStorage);
    return {
      ...specs,
      storages: safeStorages,
      defaultStorage,
      rams: defaultRams,
      defaultRam: defaultRams[0] || (isApple ? '' : '4 GB'),
      getRamsForStorage: sanitizedGetRamsForStorage,
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
      const validRams = isApple ? [] : dbRams.filter((r) => parseInt(r, 10) >= 4);

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
    const brandPrefixRegex = /^(apple|samsung|oneplus|xiaomi|vivo|oppo|realme|motorola|moto|google|pixel|nothing|cmf|tecno|techno|itel|infinix|poco|iqoo|honor)\s+/i;
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
