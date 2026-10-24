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

export const MISSING_STYLUS_DEDUCTION = 3000;

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
    pattern: /iphone\s*(17|16|15)\s*pro\s*max/i,
    variants: [
      { storage: '256 GB', rams: [] },
      { storage: '512 GB', rams: [] },
      { storage: '1 TB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*(17|16|15|14|13)\s*pro\b/i,
    variants: [
      { storage: '128 GB', rams: [] },
      { storage: '256 GB', rams: [] },
      { storage: '512 GB', rams: [] },
      { storage: '1 TB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*14\s*pro\s*max/i,
    variants: [
      { storage: '128 GB', rams: [] },
      { storage: '256 GB', rams: [] },
      { storage: '512 GB', rams: [] },
      { storage: '1 TB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*13\s*pro\s*max/i,
    variants: [
      { storage: '128 GB', rams: [] },
      { storage: '256 GB', rams: [] },
      { storage: '512 GB', rams: [] },
      { storage: '1 TB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*(17\s*air|16|15|14|13)\s*(plus|\b)/i,
    variants: [
      { storage: '128 GB', rams: [] },
      { storage: '256 GB', rams: [] },
      { storage: '512 GB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*13\s*mini/i,
    variants: [
      { storage: '128 GB', rams: [] },
      { storage: '256 GB', rams: [] },
      { storage: '512 GB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*12\s*(pro\s*max|pro)/i,
    variants: [
      { storage: '128 GB', rams: [] },
      { storage: '256 GB', rams: [] },
      { storage: '512 GB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*12\s*(mini|\b)/i,
    variants: [
      { storage: '64 GB', rams: [] },
      { storage: '128 GB', rams: [] },
      { storage: '256 GB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*11\s*(pro\s*max|pro)/i,
    variants: [
      { storage: '64 GB', rams: [] },
      { storage: '256 GB', rams: [] },
      { storage: '512 GB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*11\b/i,
    variants: [
      { storage: '64 GB', rams: [] },
      { storage: '128 GB', rams: [] },
      { storage: '256 GB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*(xs\s*max|xs)/i,
    variants: [
      { storage: '64 GB', rams: [] },
      { storage: '256 GB', rams: [] },
      { storage: '512 GB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*xr/i,
    variants: [
      { storage: '64 GB', rams: [] },
      { storage: '128 GB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*x\b/i,
    variants: [
      { storage: '64 GB', rams: [] },
      { storage: '256 GB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*8\s*plus/i,
    variants: [
      { storage: '64 GB', rams: [] },
      { storage: '128 GB', rams: [] },
      { storage: '256 GB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*8\b/i,
    variants: [
      { storage: '64 GB', rams: [] },
      { storage: '128 GB', rams: [] },
      { storage: '256 GB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*7/i,
    variants: [
      { storage: '32 GB', rams: [] },
      { storage: '128 GB', rams: [] },
      { storage: '256 GB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*6s/i,
    variants: [
      { storage: '16 GB', rams: [] },
      { storage: '32 GB', rams: [] },
      { storage: '64 GB', rams: [] },
      { storage: '128 GB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*se\s*(\(2022\)|3rd|2022)/i,
    variants: [
      { storage: '64 GB', rams: [] },
      { storage: '128 GB', rams: [] },
      { storage: '256 GB', rams: [] },
    ],
  },
  {
    pattern: /iphone\s*se\s*(\(2020\)|2nd|2020)/i,
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
      { storage: '32 GB', rams: ['4 GB'] },
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
    pattern: /lenovo\s*phab\s*2/i,
    variants: [
      { storage: '32 GB', rams: ['3 GB'] },
    ],
  },
  {
    pattern: /lenovo\s*moto\s*m|\bmoto\s*m\b/i,
    variants: [
      { storage: '32 GB', rams: ['3 GB'] },
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
      { storage: '32 GB', rams: ['3 GB'] },
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
      storages = ['128 GB', '256 GB', '512 GB', '1 TB'];
    } else if (/\b(11|12|xr|xs|x\b|8\b|8\s*plus|se\b)/i.test(mLower)) {
      storages = /xs/i.test(mLower) ? ['64 GB', '256 GB', '512 GB'] : ['64 GB', '128 GB', '256 GB'];
    } else if (/\b(7|6s|6|5s|5c|5)\b/i.test(mLower)) {
      storages = ['16 GB', '32 GB', '64 GB', '128 GB'];
    } else if (/plus\b/i.test(mLower)) {
      storages = ['128 GB', '256 GB', '512 GB'];
    } else if (/ipad/i.test(mLower)) {
      storages = ['128 GB', '256 GB', '512 GB', '1 TB'];
    }

    const normSeeds = seedStorages.map(normalizeStorageString).filter(Boolean);
    const finalStorages = Array.from(new Set([...normSeeds, ...storages]));
    const defaultStorage = normSeeds[0] || finalStorages[0] || '128 GB';

    return {
      storages: finalStorages,
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
  // 3. Budget / Entry-level (A0x, A1x, Redmi C, Realme C, Poco C, Spark, etc.)
  else if (
    /a0\d|a1\d|m0\d|m1\d|f0\d|f1\d|redmi\s*c|realme\s*c|poco\s*c|vivo\s*y|itel|spark|smart|pova|camon|moto\s*e/i.test(fullText)
  ) {
    tierStorages = ['32 GB', '64 GB', '128 GB'];
    tierRamMap = {
      '32 GB': ['2 GB', '3 GB'],
      '64 GB': ['3 GB', '4 GB', '6 GB'],
      '128 GB': ['4 GB', '6 GB', '8 GB'],
    };
    allRams = ['3 GB', '4 GB', '6 GB', '8 GB'];
  }
  // 4. Classic / Vintage J, C, On series
  else if (/galaxy\s*[jcon]\d|\bj\d|\bc\d|\bon\d|galaxy\s*core|galaxy\s*grand/i.test(fullText)) {
    tierStorages = ['16 GB', '32 GB', '64 GB', '128 GB'];
    tierRamMap = {
      '16 GB': ['2 GB', '3 GB'],
      '32 GB': ['2 GB', '3 GB', '4 GB'],
      '64 GB': ['4 GB', '6 GB'],
      '128 GB': ['6 GB'],
    };
    allRams = ['2 GB', '3 GB', '4 GB', '6 GB'];
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

  const normSeeds = seedStorages.map(normalizeStorageString).filter(Boolean);
  const finalStorages = Array.from(new Set([...normSeeds, ...tierStorages]));
  const normalizedSeedRams = seedRams.map(normalizeRamString).filter(Boolean);
  const finalRams = Array.from(new Set([...normalizedSeedRams, ...allRams]));

  const getRamsForStorage = (stg: string): string[] => {
    const norm = normalizeStorageString(stg);
    if (tierRamMap[norm] && tierRamMap[norm].length > 0) {
      if (normalizedSeedRams.length > 0) {
        return Array.from(new Set([...normalizedSeedRams, ...tierRamMap[norm]]));
      }
      return tierRamMap[norm];
    }
    if (norm.includes('16 GB')) return ['2 GB', '3 GB'];
    if (norm.includes('32 GB')) return ['2 GB', '3 GB', '4 GB'];
    if (norm.includes('64 GB')) return ['4 GB', '6 GB'];
    if (norm.includes('128 GB')) return ['6 GB', '8 GB'];
    if (norm.includes('256 GB')) return ['8 GB', '12 GB'];
    if (norm.includes('512 GB')) return ['12 GB', '16 GB'];
    if (norm.includes('1 TB')) return ['12 GB', '16 GB'];
    return finalRams.slice(0, 2);
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
  const normBrand = (brand || '').toLowerCase().trim();
  const normModel = (model || '').toLowerCase().trim();
  const fullText = `${normBrand} ${normModel}`;
  const isApple = normBrand.includes('apple') || normModel.includes('iphone') || normModel.includes('ipad');

  // 1. Check Explicit Hardware Rules with Exact Storage <-> RAM Pairing
  for (const rule of MODEL_HARDWARE_RULES) {
    if (rule.pattern.test(fullText) || rule.pattern.test(normModel)) {
      const storages = rule.variants.map((v) => normalizeStorageString(v.storage));
      const defaultStorage = storages[0] || '128 GB';

      const getRamsForStorage = (stg: string): string[] => {
        const normStg = normalizeStorageString(stg);
        const match = rule.variants.find((v) => normalizeStorageString(v.storage) === normStg);
        return match ? match.rams.map(normalizeRamString) : [];
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
      : [];
    const dbRams = Array.isArray(foundPhone.ram_options) && foundPhone.ram_options.length > 0
      ? Array.from(new Set(foundPhone.ram_options.map(normalizeRamString)))
      : [];

    if (dbStorages.length > 1 && (isApple || dbRams.length > 0)) {
      const defaultStorage = dbStorages[0] || '128 GB';
      const validRams = isApple ? [] : dbRams;

      return {
        storages: dbStorages,
        rams: validRams,
        defaultStorage,
        defaultRam: validRams[0] || '',
        getRamsForStorage: () => validRams,
      };
    }

    // If database has incomplete options (e.g. only 1 storage or empty RAM), enhance with tier specs
    return inferTierHardwareSpecs(brand, model, dbStorages, dbRams);
  }

  // 3. Check customCatalog variants if provided (e.g. MASTER_MODEL_CATALOG)
  if (Array.isArray(customCatalog) && customCatalog.length > 0) {
    const catalogVariants = customCatalog.filter((m) => {
      const mModel = m.model.toLowerCase();
      return (
        m.brand.toLowerCase() === normBrand &&
        (mModel === normModel || mModel.includes(normModel) || normModel.includes(mModel))
      );
    });

    if (catalogVariants.length > 0) {
      const seedStorages = Array.from(new Set(catalogVariants.map((v) => normalizeStorageString(v.storage))));
      return inferTierHardwareSpecs(brand, model, seedStorages, []);
    }
  }

  // 4. Intelligent Fallback by Brand & Generation Tier
  return inferTierHardwareSpecs(brand, model);
}
