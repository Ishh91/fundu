const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || 'http://localhost:4000/api';

export type PhoneModelOption = {
  name: string;
  storages: string[];
};

export type SellPriceConfig = {
  id: string;
  brand: string;
  model: string;
  storage: string | null;
  base_price: number;
  excellent_multiplier: number;
  good_multiplier: number;
  fair_multiplier: number;
  box_bonus: number;
  charger_bonus: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type ApiEnvelope<T> = {
  data: T;
  error?: {
    message?: string;
  };
};

const brandCache: { value: string[] | null } = { value: null };
const modelCache = new Map<string, PhoneModelOption[]>();

import { LOOKUP_BRANDS, getModelsForBrand } from '../data/phoneLookup';

async function fetchApi<T>(path: string) {
  const response = await fetch(`${API_BASE}${path}`);
  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Request failed.');
  }

  return payload?.data as T;
}

export async function fetchPhoneBrands() {
  if (brandCache.value) return brandCache.value;
  try {
    const brands = await fetchApi<string[]>('/mobile/brands');
    brandCache.value = brands;
    return brands;
  } catch {
    return LOOKUP_BRANDS;
  }
}

export async function fetchPhoneModels(brand: string, query: string) {
  const cacheKey = `${brand.trim().toLowerCase()}:${query.trim().toLowerCase()}`;
  if (modelCache.has(cacheKey)) return modelCache.get(cacheKey) ?? [];
  try {
    const models = await fetchApi<PhoneModelOption[]>(`/mobile/models?brand=${encodeURIComponent(brand)}&query=${encodeURIComponent(query)}`);
    modelCache.set(cacheKey, models);
    return models;
  } catch {
    const fallbackNames = getModelsForBrand(brand);
    const fallbackOptions: PhoneModelOption[] = fallbackNames.map((name) => ({ name, storages: ['64 GB', '128 GB', '256 GB', '512 GB'] }));
    return fallbackOptions;
  }
}

export async function fetchSellPriceConfig(brand: string, model: string, storage: string) {
  const query = new URLSearchParams({
    brand,
    model,
  });

  if (storage) query.set('storage', storage);

  try {
    return await fetchApi<SellPriceConfig | null>(`/sell-pricing/config?${query.toString()}`);
  } catch {
    return null;
  }
}

export function getDynamicFallbackConfig(brand: string, model: string, storage: string): SellPriceConfig {
  const brandLower = brand.toLowerCase();
  const modelLower = model.toLowerCase();

  let basePrice = 16000;

  if (brandLower.includes('apple') || modelLower.includes('iphone')) {
    if (modelLower.includes('15') || modelLower.includes('pro max')) basePrice = 58000;
    else if (modelLower.includes('14')) basePrice = 48000;
    else if (modelLower.includes('13')) basePrice = 38000;
    else if (modelLower.includes('12')) basePrice = 28000;
    else basePrice = 22000;
  } else if (brandLower.includes('samsung')) {
    if (modelLower.includes('s23') || modelLower.includes('fold') || modelLower.includes('flip')) basePrice = 46000;
    else if (modelLower.includes('s22') || modelLower.includes('ultra')) basePrice = 32000;
    else if (modelLower.includes('s21') || modelLower.includes('fe')) basePrice = 22000;
    else basePrice = 14000;
  } else if (brandLower.includes('oneplus')) {
    if (modelLower.includes('11') || modelLower.includes('10 pro')) basePrice = 34000;
    else if (modelLower.includes('nord')) basePrice = 18000;
    else basePrice = 24000;
  } else if (brandLower.includes('google') || modelLower.includes('pixel')) {
    if (modelLower.includes('8') || modelLower.includes('7 pro')) basePrice = 42000;
    else if (modelLower.includes('7')) basePrice = 30000;
    else basePrice = 22000;
  } else if (brandLower.includes('vivo') || brandLower.includes('oppo') || brandLower.includes('realme') || brandLower.includes('xiaomi') || brandLower.includes('redmi')) {
    if (modelLower.includes('pro') || modelLower.includes('ultra')) basePrice = 18000;
    else basePrice = 12000;
  }

  if (storage.includes('256')) basePrice += 3000;
  else if (storage.includes('512') || storage.includes('1TB')) basePrice += 6000;

  return {
    id: `fallback-${brand}-${model}`,
    brand,
    model,
    storage: storage || '128GB',
    base_price: basePrice,
    excellent_multiplier: 0.75,
    good_multiplier: 0.60,
    fair_multiplier: 0.45,
    box_bonus: 600,
    charger_bonus: 400,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function computeSellEstimate(
  config: SellPriceConfig | null,
  condition: string,
  accessories: string[],
  fallbackBrand = '',
  fallbackModel = '',
  fallbackStorage = '',
) {
  const activeConfig = config ?? getDynamicFallbackConfig(fallbackBrand, fallbackModel, fallbackStorage);

  const multiplierMap: Record<string, number> = {
    Excellent: activeConfig.excellent_multiplier,
    Good: activeConfig.good_multiplier,
    Fair: activeConfig.fair_multiplier,
  };

  let price = activeConfig.base_price * (multiplierMap[condition] ?? activeConfig.good_multiplier);

  if (accessories.includes('Original Box')) price += activeConfig.box_bonus;
  if (accessories.includes('Charger')) price += activeConfig.charger_bonus;

  return Math.round(price);
}
