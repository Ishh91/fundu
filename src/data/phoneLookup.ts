import { ALL_INDIAN_PHONES_CATALOG } from './indianPhonesCatalog';

export type PhoneLookupEntry = {
  brand: string;
  model: string;
  storages: string[];
};

export const PHONE_LOOKUP_CATALOG: PhoneLookupEntry[] = ALL_INDIAN_PHONES_CATALOG.map((p) => ({
  brand: p.brand,
  model: p.model,
  storages: p.storage_options || ['128GB', '256GB'],
}));

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
  'Honor',
  'Lava',
  'Asus',
  'Nokia',
  'Micromax',
];

export function getModelsForBrand(brand: string) {
  const matches = PHONE_LOOKUP_CATALOG.filter((entry) => entry.brand.toLowerCase() === brand.toLowerCase()).map(
    (entry) => entry.model
  );
  if (matches.length > 0) return matches;
  return [`${brand} Model 1`, `${brand} Model 2`];
}

export function getStoragesForModel(brand: string, model: string) {
  return (
    PHONE_LOOKUP_CATALOG.find(
      (entry) => entry.brand.toLowerCase() === brand.toLowerCase() && entry.model.toLowerCase() === model.toLowerCase()
    )?.storages ?? ['128GB', '256GB']
  );
}

export function getPopularLookupEntries(limit = 8) {
  return PHONE_LOOKUP_CATALOG.slice(0, limit);
}
