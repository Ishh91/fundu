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
  if (/pixel\s*8/i.test(m)) return 2023;
  if (/pixel\s*7/i.test(m)) return 2022;
  if (/pixel\s*6/i.test(m)) return 2021;
  if (/pixel\s*5/i.test(m)) return 2020;

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

  // 13. Explicit 4-digit year match if present
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
      { storage: '128 GB', rams: [] },
      { storage: '256 GB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*7\b(?!\s*plus)/i,
    variants: [
      { storage: '128 GB', rams: [] },
      { storage: '256 GB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*6s\s*plus\b/i,
    variants: [
      { storage: '64 GB', rams: [] },
      { storage: '128 GB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*6s\b(?!\s*plus)/i,
    variants: [
      { storage: '64 GB', rams: [] },
      { storage: '128 GB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*6\s*plus\b/i,
    variants: [
      { storage: '16 GB', rams: [] },
      { storage: '64 GB', rams: [] },
      { storage: '128 GB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*6\b(?!\s*(s|plus))/i,
    variants: [
      { storage: '16 GB', rams: [] },
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
  // NOTHING
  // ==========================================
  {
    pattern: /nothing\s*phone\s*\(?2\)?\b/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['12 GB'] },
      { storage: '512 GB', rams: ['12 GB'] },
    ],
  },
  {
    pattern: /nothing\s*phone\s*\(?2a\)?/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
    ],
  },
  {
    pattern: /cmf\s*phone\s*1/i,
    variants: [
      { storage: '128 GB', rams: ['6 GB', '8 GB'] },
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
  {
    pattern: /poco\s*f7\b/i,
    variants: [
      { storage: '256 GB', rams: ['12 GB'] },
      { storage: '512 GB', rams: ['12 GB', '16 GB'] },
    ],
  },
  {
    pattern: /poco\s*x7\b/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB', '12 GB'] },
    ],
  },
  {
    pattern: /poco\s*m7\s*plus/i,
    variants: [
      { storage: '128 GB', rams: ['6 GB', '8 GB'] },
    ],
  },
  {
    pattern: /poco\s*m8\b/i,
    variants: [
      { storage: '128 GB', rams: ['6 GB', '8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },
  {
    pattern: /poco\s*c75\b/i,
    variants: [
      { storage: '128 GB', rams: ['6 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
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
    pattern: /pixel\s*10\b/i,
    variants: [
      { storage: '128 GB', rams: ['12 GB'] },
      { storage: '256 GB', rams: ['12 GB'] },
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
    pattern: /pixel\s*(8a|8|7a)\b/i,
    variants: [
      { storage: '128 GB', rams: ['8 GB'] },
      { storage: '256 GB', rams: ['8 GB'] },
    ],
  },

  // ==========================================
  // LENOVO & MOTO
  // ==========================================
  {
    pattern: /lenovo\s*moto\s*m|\bmoto\s*m\b/i,
    variants: [
      { storage: '64 GB', rams: ['4 GB'] },
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
    pattern: /lenovo\s*k8\s*note/i,
    variants: [
      { storage: '64 GB', rams: ['4 GB'] },
    ],
  },
  {
    pattern: /lenovo\s*legion\s*duel\s*2/i,
    variants: [
      { storage: '256 GB', rams: ['12 GB'] },
      { storage: '512 GB', rams: ['16 GB'] },
    ],
  },

  // ==========================================
  // MOTOROLA
  // ==========================================
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
    } else if (/\b(7|6s|6|5s|5c|5)\b/i.test(mLower)) {
      storages = ['64 GB', '128 GB'];
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
  // 2. Upper Mid-Range / Pro / Performance / Neo / GT / Edge / Reno / V series
  else if (
    /pro\+|pro\s*plus|\bpro\b|neo|turbo|gt|plus|\+|fe|nord|reno|iqoo\s*z|poco\s*(f|x)|note.*pro|a5\d|a7\d|m5\d|f5\d|edge|v\d+/i.test(fullText)
  ) {
    tierStorages = ['128 GB', '256 GB', '512 GB'];
    tierRamMap = {
      '128 GB': ['6 GB', '8 GB'],
      '256 GB': ['8 GB', '12 GB'],
      '512 GB': ['12 GB'],
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
  // 4. Budget / Entry-level (A0x, A1x, Redmi C, Realme C, Poco C, Spark, etc.)
  else if (
    /a0\d|a1\d|m0\d|m1\d|f0\d|f1\d|redmi\s*c|realme\s*c|poco\s*c|vivo\s*y|spark|smart|pova|camon|moto\s*e/i.test(fullText)
  ) {
    tierStorages = ['64 GB', '128 GB'];
    tierRamMap = {
      '64 GB': ['4 GB', '6 GB'],
      '128 GB': ['4 GB', '6 GB', '8 GB'],
    };
    allRams = ['4 GB', '6 GB', '8 GB'];
  }
  // 4. Classic / Vintage J, C, On series
  else if (/galaxy\s*[jcon]\d|\bj\d|\bc\d|\bon\d|galaxy\s*core|galaxy\s*grand/i.test(fullText)) {
    tierStorages = ['64 GB', '128 GB'];
    tierRamMap = {
      '64 GB': ['4 GB', '6 GB'],
      '128 GB': ['6 GB'],
    };
    allRams = ['4 GB', '6 GB'];
  }
  // 5. Standard Mid-range default (A2x, A3x, M3x, Redmi Note base, Realme number, Moto G, etc.)
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
    .filter((s) => {
      const m = s.match(/(\d+)\s*(?:gb|tb)/i);
      return !m || parseInt(m[1], 10) >= 64;
    });
  const finalStorages = Array.from(new Set([...normSeeds, ...tierStorages])).filter((s) => {
    const m = s.match(/(\d+)\s*(?:gb|tb)/i);
    return !m || parseInt(m[1], 10) >= 64;
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
      if (norm.includes('64 GB')) {
        const match = normalizedSeedRams.filter((r) => parseInt(r, 10) <= 6);
        return match.length > 0 ? match : [normalizedSeedRams[0]];
      }
      if (norm.includes('128 GB')) {
        const match = normalizedSeedRams.filter((r) => parseInt(r, 10) <= 8);
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
      return tierRamMap[norm].filter((r) => !/^(2|3)\s*gb$/i.test(r));
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

  // 1. Check Explicit Hardware Rules with Exact Storage <-> RAM Pairing
  for (const rule of MODEL_HARDWARE_RULES) {
    if (rule.pattern.test(fullText) || rule.pattern.test(normModel)) {
      const storages = rule.variants
        .map((v) => normalizeStorageString(v.storage))
        .filter((s) => {
          const m = s.match(/(\d+)\s*(?:gb|tb)/i);
          return !m || parseInt(m[1], 10) >= 64;
        });

      if (storages.length > 0) {
        const defaultStorage = storages[0] || '128 GB';

        const getRamsForStorage = (stg: string): string[] => {
          const normStg = normalizeStorageString(stg);
          const match = rule.variants.find((v) => normalizeStorageString(v.storage) === normStg);
          return match ? match.rams.map(normalizeRamString).filter((r) => !/^(2|3)\s*gb$/i.test(r)) : [];
        };

        const defaultRams = getRamsForStorage(defaultStorage);

        return {
          storages,
          rams: defaultRams,
          defaultStorage,
          defaultRam: defaultRams[0] || '',
          getRamsForStorage,
        };
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
          .filter((s) => {
            const m = s.match(/(\d+)\s*(?:gb|tb)/i);
            return !m || parseInt(m[1], 10) >= 64;
          })
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
        if (norm.includes('64 GB')) {
          const match = validRams.filter((r) => parseInt(r, 10) <= 6);
          return match.length > 0 ? match : [validRams[0]];
        }
        if (norm.includes('128 GB')) {
          const match = validRams.filter((r) => parseInt(r, 10) <= 8);
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

      return {
        storages: dbStorages,
        rams: defaultRams,
        defaultStorage,
        defaultRam: defaultRams[0] || '',
        getRamsForStorage,
      };
    }

    // If database has incomplete options (e.g. only 1 storage or empty RAM), enhance with tier specs
    return inferTierHardwareSpecs(brand, model, dbStorages, dbRams);
  }

  // 3. Check customCatalog variants if provided (e.g. MASTER_MODEL_CATALOG)
  if (Array.isArray(customCatalog) && customCatalog.length > 0) {
    const cleanTarget = normModel
      .replace(/^(apple|samsung|oneplus|xiaomi|vivo|oppo|realme|motorola|google|nothing|tecno|techno|itel|infinix)\s+/i, '')
      .replace(/[\s-]+/g, ' ')
      .trim();

    const catalogVariants = customCatalog.filter((m) => {
      const mBrand = m.brand.toLowerCase();
      if (mBrand !== normBrand && !(normBrand === 'tecno' && mBrand === 'techno')) return false;
      const cleanM = m.model
        .toLowerCase()
        .replace(/^(apple|samsung|oneplus|xiaomi|vivo|oppo|realme|motorola|google|nothing|tecno|techno|itel|infinix)\s+/i, '')
        .replace(/[\s-]+/g, ' ')
        .trim();
      return cleanM === cleanTarget;
    });

    if (catalogVariants.length > 0) {
      const seedStorages = Array.from(new Set(catalogVariants.map((v) => normalizeStorageString(v.storage))))
        .filter((s) => {
          const m = s.match(/(\d+)\s*(?:gb|tb)/i);
          return !m || parseInt(m[1], 10) >= 64;
        });
      return inferTierHardwareSpecs(brand, model, seedStorages, []);
    }
  }

  // 4. Intelligent Fallback by Brand & Generation Tier
  return inferTierHardwareSpecs(brand, model);
}
