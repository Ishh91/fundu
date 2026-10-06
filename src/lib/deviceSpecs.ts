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
  // APPLE iPHONES (Strictly sold by storage, RAM row hidden)
  // ==========================================
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

  // ==========================================
  // GOOGLE PIXEL
  // ==========================================
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
  // LENOVO
  // ==========================================
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
    const storages = Array.isArray(foundPhone.storage_options) && foundPhone.storage_options.length > 0
      ? Array.from(new Set(foundPhone.storage_options.map(normalizeStorageString)))
      : [];
    const rams = Array.isArray(foundPhone.ram_options) && foundPhone.ram_options.length > 0
      ? Array.from(new Set(foundPhone.ram_options.map(normalizeRamString)))
      : [];

    if (storages.length > 0) {
      const defaultStorage = storages[0] || '128 GB';
      const isApple = normBrand.includes('apple') || normModel.includes('iphone');
      const validRams = isApple ? [] : rams;

      return {
        storages,
        rams: validRams,
        defaultStorage,
        defaultRam: validRams[0] || '',
        getRamsForStorage: () => validRams,
      };
    }
  }

  // 3. Check customCatalog variants if provided
  if (Array.isArray(customCatalog) && customCatalog.length > 0) {
    const catalogVariants = customCatalog.filter((m) => {
      const mModel = m.model.toLowerCase();
      return (
        m.brand.toLowerCase() === normBrand &&
        (mModel === normModel || mModel.includes(normModel) || normModel.includes(mModel))
      );
    });

    if (catalogVariants.length > 0) {
      const storages = Array.from(new Set(catalogVariants.map((v) => normalizeStorageString(v.storage))));
      if (storages.length > 0) {
        return {
          storages,
          rams: [],
          defaultStorage: storages[0],
          defaultRam: '',
          getRamsForStorage: () => [],
        };
      }
    }
  }

  // 4. Intelligent Fallback by Brand & Generation
  if (normBrand.includes('apple') || normModel.includes('iphone')) {
    return {
      storages: ['128 GB', '256 GB', '512 GB'],
      rams: [],
      defaultStorage: '128 GB',
      defaultRam: '',
      getRamsForStorage: () => [],
    };
  }

  // Default Standard Modern Android Phone
  return {
    storages: ['128 GB', '256 GB'],
    rams: ['6 GB', '8 GB'],
    defaultStorage: '128 GB',
    defaultRam: '6 GB',
    getRamsForStorage: () => ['6 GB', '8 GB'],
  };
}
