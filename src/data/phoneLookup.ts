export type PhoneLookupEntry = {
  brand: string;
  model: string;
  storages: string[];
};

export const PHONE_LOOKUP_CATALOG: PhoneLookupEntry[] = [
  { brand: 'Apple', model: 'iPhone 12', storages: ['64GB', '128GB', '256GB'] },
  { brand: 'Apple', model: 'iPhone 13', storages: ['128GB', '256GB', '512GB'] },
  { brand: 'Apple', model: 'iPhone 14', storages: ['128GB', '256GB', '512GB'] },
  { brand: 'Apple', model: 'iPhone 15', storages: ['128GB', '256GB', '512GB'] },
  { brand: 'Samsung', model: 'Galaxy S22', storages: ['128GB', '256GB'] },
  { brand: 'Samsung', model: 'Galaxy S23', storages: ['128GB', '256GB', '512GB'] },
  { brand: 'Samsung', model: 'Galaxy A54', storages: ['128GB', '256GB'] },
  { brand: 'Samsung', model: 'Galaxy Z Flip5', storages: ['256GB', '512GB'] },
  { brand: 'OnePlus', model: 'OnePlus 11', storages: ['128GB', '256GB'] },
  { brand: 'OnePlus', model: 'OnePlus 12R', storages: ['128GB', '256GB'] },
  { brand: 'OnePlus', model: 'Nord CE 4', storages: ['128GB', '256GB'] },
  { brand: 'Xiaomi', model: 'Redmi Note 12', storages: ['128GB', '256GB'] },
  { brand: 'Xiaomi', model: 'Redmi Note 13 Pro', storages: ['128GB', '256GB'] },
  { brand: 'Xiaomi', model: 'Xiaomi 13 Pro', storages: ['256GB', '512GB'] },
  { brand: 'Realme', model: 'Realme 11 Pro', storages: ['128GB', '256GB'] },
  { brand: 'Realme', model: 'GT 6', storages: ['256GB', '512GB'] },
  { brand: 'Vivo', model: 'Vivo V27', storages: ['128GB', '256GB'] },
  { brand: 'Vivo', model: 'Vivo V30', storages: ['128GB', '256GB', '512GB'] },
  { brand: 'Oppo', model: 'Reno 11', storages: ['128GB', '256GB'] },
  { brand: 'Oppo', model: 'F25 Pro', storages: ['128GB', '256GB'] },
  { brand: 'Nothing', model: 'Phone (2)', storages: ['128GB', '256GB', '512GB'] },
  { brand: 'Google', model: 'Pixel 7', storages: ['128GB', '256GB'] },
  { brand: 'Google', model: 'Pixel 8', storages: ['128GB', '256GB'] },
  { brand: 'Motorola', model: 'Edge 50 Pro', storages: ['256GB', '512GB'] },
  { brand: 'Poco', model: 'Poco X6 Pro', storages: ['256GB', '512GB'] },
  { brand: 'iQOO', model: 'Neo 9 Pro', storages: ['128GB', '256GB'] },
];

export const LOOKUP_BRANDS = Array.from(new Set(PHONE_LOOKUP_CATALOG.map((entry) => entry.brand)));

export function getModelsForBrand(brand: string) {
  return PHONE_LOOKUP_CATALOG.filter((entry) => entry.brand === brand).map((entry) => entry.model);
}

export function getStoragesForModel(brand: string, model: string) {
  return PHONE_LOOKUP_CATALOG.find((entry) => entry.brand === brand && entry.model === model)?.storages ?? [];
}

export function getPopularLookupEntries(limit = 6) {
  return PHONE_LOOKUP_CATALOG.slice(0, limit);
}
