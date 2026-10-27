import { ALL_INDIAN_PHONES_CATALOG } from './indianPhonesCatalog';
import { MASTER_MODEL_CATALOG } from './masterModelCatalog';

export type PhoneLookupEntry = {
  brand: string;
  model: string;
  storages: string[];
};

// Build unified, deduplicated lookup catalog across all data sources (1,260+ models)
const buildPhoneLookupCatalog = (): PhoneLookupEntry[] => {
  const map = new Map<string, PhoneLookupEntry>();

  const normKey = (brand: string, model: string) => {
    const b = (brand || '').toLowerCase().trim();
    let m = (model || '').toLowerCase().trim();
    if (m.startsWith(b)) m = m.slice(b.length).trim();
    return `${b}:${m}`;
  };

  // 1. Add all from MASTER_MODEL_CATALOG (1,167 phones)
  for (const m of MASTER_MODEL_CATALOG) {
    const key = normKey(m.brand, m.model);
    if (!map.has(key)) {
      map.set(key, {
        brand: m.brand,
        model: m.model,
        storages: m.storage ? [m.storage] : ['128GB', '256GB'],
      });
    }
  }

  // 2. Add all from ALL_INDIAN_PHONES_CATALOG (210 phones, includes 94 unique models)
  for (const p of ALL_INDIAN_PHONES_CATALOG) {
    const key = normKey(p.brand, p.model);
    if (!map.has(key)) {
      map.set(key, {
        brand: p.brand,
        model: p.model,
        storages: p.storage_options && p.storage_options.length > 0 ? p.storage_options : ['128GB', '256GB'],
      });
    } else {
      const existing = map.get(key)!;
      if (p.storage_options && p.storage_options.length > 0) {
        existing.storages = Array.from(new Set([...existing.storages, ...p.storage_options]));
      }
    }
  }

  return Array.from(map.values());
};

export const PHONE_LOOKUP_CATALOG: PhoneLookupEntry[] = buildPhoneLookupCatalog();

export const LOOKUP_BRANDS = [
  'Apple',
  'Samsung',
  'OnePlus',
  'Xiaomi',
  'Realme',
  'Vivo',
  'Oppo',
  'Google',
  'Nothing',
  'Motorola',
  'Poco',
  'iQOO',
  'Infinix',
  'Tecno',
  'Itel',
  'Honor',
  'Lenovo',
  'Asus',
  'Nokia',
  'Micromax',
];

export function getModelsForBrand(brand: string): string[] {
  const bLower = (brand || '').toLowerCase().trim();
  const matches = PHONE_LOOKUP_CATALOG.filter((entry) => {
    const eBrand = entry.brand.toLowerCase().trim();
    if (eBrand === bLower) return true;
    if (bLower === 'techno' && eBrand === 'tecno') return true;
    if (bLower === 'xiaomi' && (eBrand === 'redmi' || eBrand === 'poco')) return true;
    if (bLower === 'redmi' && (eBrand === 'redmi' || (eBrand === 'xiaomi' && /redmi/i.test(entry.model)))) return true;
    if (bLower === 'poco' && (eBrand === 'poco' || (eBrand === 'xiaomi' && /poco/i.test(entry.model)))) return true;
    if (bLower === 'vivo' && eBrand === 'iqoo') return true;
    if (bLower === 'iqoo' && (eBrand === 'iqoo' || (eBrand === 'vivo' && /iqoo/i.test(entry.model)))) return true;
    if (bLower === 'motorola' && (eBrand === 'moto' || eBrand === 'motorola')) return true;
    if (bLower === 'moto' && (eBrand === 'moto' || eBrand === 'motorola')) return true;
    if (bLower === 'apple' && (eBrand === 'apple' || /iphone/i.test(entry.model))) return true;
    return false;
  }).map((entry) => entry.model);

  if (matches.length > 0) return Array.from(new Set(matches));
  return [`${brand} Model 1`, `${brand} Model 2`];
}

export function getStoragesForModel(brand: string, model: string): string[] {
  const bLower = (brand || '').toLowerCase().trim();
  const mLower = (model || '').toLowerCase().trim();
  const match = PHONE_LOOKUP_CATALOG.find((entry) => {
    const eBrand = entry.brand.toLowerCase().trim();
    const eModel = entry.model.toLowerCase().trim();
    return (
      (eBrand === bLower || bLower.includes(eBrand) || eBrand.includes(bLower)) &&
      (eModel === mLower || eModel.includes(mLower) || mLower.includes(eModel))
    );
  });
  return match?.storages && match.storages.length > 0 ? match.storages : ['128GB', '256GB'];
}

export function getPopularLookupEntries(limit = 12): PhoneLookupEntry[] {
  return PHONE_LOOKUP_CATALOG.slice(0, limit);
}

