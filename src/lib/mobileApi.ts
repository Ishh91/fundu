const resolveApiBase = () => {
  if (typeof window !== 'undefined') {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocal) {
      return 'http://localhost:4000/api';
    }
  }
  const envUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl.replace(/\/$/, '');
  }
  return 'https://fundu.onrender.com/api';
};

const API_BASE = resolveApiBase();

export type PhoneModelOption = {

  name: string;
  storages: string[];
};

export type MobileApiDevice = {
  id: string | number;
  mobileapi_id?: number;
  brand: string;
  model: string;
  release_year?: number;
  ram_options?: string[];
  storage_options?: string[];
  default_mrp?: number;
  base_resale_value?: number;
  popular_tag?: string;
  processor?: string;
  camera_spec?: string;
  battery_spec?: string;
  display_spec?: string;
  colors?: string;
  weight?: string;
  thickness?: string;
  image_url?: string;
  image_b64?: string | null;
  model_numbers?: string | null;
  is_5g?: boolean;
  is_active?: boolean;
  source?: string;
};

export type MobileApiAutocompleteItem = {
  id: number;
  name: string;
  brand: string;
  full_name: string;
};

export type MobileApiManufacturer = {
  id: number;
  name: string;
  website_url: string | null;
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
  total?: number;
  count?: number;
  page?: number;
  provider?: string;
  error?: {
    message?: string;
  };
};

const brandCache: { value: string[] | null } = { value: null };
const modelCache = new Map<string, PhoneModelOption[]>();

import { LOOKUP_BRANDS, getModelsForBrand } from '../data/phoneLookup';

async function fetchApi<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);
  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Request failed.');
  }

  return payload?.data as T;
}

export async function fetchPhoneBrands(): Promise<string[]> {
  if (brandCache.value) return brandCache.value;
  try {
    const brands = await fetchApi<string[]>('/mobile/brands');
    if (Array.isArray(brands) && brands.length > 0) {
      brandCache.value = brands;
      return brands;
    }
    return LOOKUP_BRANDS;
  } catch {
    return LOOKUP_BRANDS;
  }
}

export async function fetchPhoneModels(
  brand: string,
  query: string = '',
  provider: 'auto' | 'cashify' | 'mobileapi' = 'auto',
): Promise<PhoneModelOption[]> {
  const cacheKey = `${provider}:${brand.trim().toLowerCase()}:${query.trim().toLowerCase()}`;
  if (modelCache.has(cacheKey)) return modelCache.get(cacheKey) ?? [];
  try {
    const models = await fetchApi<PhoneModelOption[]>(
      `/mobile/models?brand=${encodeURIComponent(brand)}&query=${encodeURIComponent(query)}&provider=${provider}`
    );
    if (Array.isArray(models) && models.length > 0) {
      modelCache.set(cacheKey, models);
      return models;
    }
    const fallbackNames = getModelsForBrand(brand);
    return fallbackNames.map((name) => ({ name, storages: ['64 GB', '128 GB', '256 GB', '512 GB'] }));
  } catch {
    const fallbackNames = getModelsForBrand(brand);
    const fallbackOptions: PhoneModelOption[] = fallbackNames.map((name) => ({
      name,
      storages: ['64 GB', '128 GB', '256 GB', '512 GB'],
    }));
    return fallbackOptions;
  }
}

/**
 * Live autocomplete powered by https://mobileapi.dev/devices/autocomplete/
 */
export async function fetchDeviceAutocomplete(query: string, limit: number = 10): Promise<MobileApiAutocompleteItem[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const response = await fetch(`${API_BASE}/mobile/autocomplete?q=${encodeURIComponent(query)}&limit=${limit}`);
    if (!response.ok) return [];
    const json = await response.json();
    return json.data || [];
  } catch {
    return [];
  }
}

/**
 * Get device by ID from https://mobileapi.dev/devices/{id}/
 */
export async function fetchDeviceById(id: string | number): Promise<MobileApiDevice | null> {
  try {
    const response = await fetch(`${API_BASE}/mobile/devices/${id}`);
    if (!response.ok) return null;
    const json = await response.json();
    return json.data || null;
  } catch {
    return null;
  }
}

/**
 * Get gallery images for a device from https://mobileapi.dev/devices/{id}/images/
 */
export async function fetchDeviceImages(id: string | number): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE}/mobile/devices/${id}/images`);
    if (!response.ok) return [];
    const json = await response.json();
    return json.data || [];
  } catch {
    return [];
  }
}

/**
 * Search devices on https://mobileapi.dev
 */
export async function searchMobileApiDev(
  query: string,
  brand?: string,
  page: number = 1,
): Promise<MobileApiDevice[]> {
  try {
    const params = new URLSearchParams();
    if (query) params.set('query', query);
    if (brand && brand !== 'All') params.set('brand', brand);
    if (page) params.set('page', String(page));

    const response = await fetch(`${API_BASE}/phones/mobileapi/search?${params.toString()}`);
    if (!response.ok) throw new Error('MobileAPI search failed');
    const json = await response.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

/**
 * 1-Click Import a phone from https://mobileapi.dev into Fundu database
 */
export async function importPhoneFromMobileApi(phone: Record<string, any>) {
  const response = await fetch(`${API_BASE}/phones/mobileapi/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(phone),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to import phone from MobileAPI');
  }
  return response.json();
}

export async function fetchCashifyModels(brand: string, query: string = '') {
  try {
    return await fetchApi<PhoneModelOption[]>(
      `/mobile/cashify/models?brand=${encodeURIComponent(brand)}&query=${encodeURIComponent(query)}`
    );
  } catch {
    return fetchPhoneModels(brand, query, 'auto');
  }
}

export async function fetchCashifyValuation(brand: string, model: string, storage: string = '') {
  try {
    return await fetchApi<unknown>(
      `/mobile/cashify/estimate?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}&storage=${encodeURIComponent(storage)}`
    );
  } catch {
    return null;
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

import { getIndianPhoneByModel } from '../data/indianPhonesCatalog';

export function getDynamicFallbackConfig(brand: string, model: string, storage: string): SellPriceConfig {
  const indianPhone = getIndianPhoneByModel(model) || getIndianPhoneByModel(`${brand} ${model}`);
  let basePrice = indianPhone?.base_resale_value || 16000;

  const brandLower = brand.toLowerCase();
  const modelLower = model.toLowerCase();

  if (!indianPhone) {
    if (brandLower.includes('apple') || modelLower.includes('iphone')) {
      if (modelLower.includes('16') || modelLower.includes('15 pro')) basePrice = 65000;
      else if (modelLower.includes('15')) basePrice = 48000;
      else if (modelLower.includes('14')) basePrice = 38000;
      else if (modelLower.includes('13')) basePrice = 30000;
      else if (modelLower.includes('12')) basePrice = 22000;
      else basePrice = 16000;
    } else if (brandLower.includes('samsung')) {
      if (modelLower.includes('s24') || modelLower.includes('s23 ultra')) basePrice = 58000;
      else if (modelLower.includes('s23') || modelLower.includes('fold') || modelLower.includes('flip')) basePrice = 42000;
      else if (modelLower.includes('s22')) basePrice = 26000;
      else basePrice = 16000;
    } else if (brandLower.includes('oneplus')) {
      if (modelLower.includes('12') || modelLower.includes('11')) basePrice = 36000;
      else if (modelLower.includes('nord')) basePrice = 18000;
      else basePrice = 22000;
    } else if (brandLower.includes('google') || modelLower.includes('pixel')) {
      if (modelLower.includes('9') || modelLower.includes('8 pro')) basePrice = 52000;
      else if (modelLower.includes('8') || modelLower.includes('7a')) basePrice = 28000;
      else basePrice = 20000;
    }
  }

  if (storage.includes('256')) basePrice = Math.round(basePrice * 1.08);
  else if (storage.includes('512') || storage.includes('1TB')) basePrice = Math.round(basePrice * 1.18);

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

export async function searchIndianPhonesApi(query: string, brand?: string, limit = 50) {
  try {
    const params = new URLSearchParams();
    if (query) params.set('query', query);
    if (brand && brand !== 'All') params.set('brand', brand);
    if (limit) params.set('limit', String(limit));

    const response = await fetch(`${API_BASE}/phones/search?${params.toString()}`);
    if (!response.ok) throw new Error('Search failed');
    const json = await response.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export async function syncAllIndianPhonesToDbApi() {
  try {
    const response = await fetch(`${API_BASE}/phones/bulk-sync`, { method: 'POST' });
    const json = await response.json();
    return json;
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function addCustomIndianPhoneApi(payload: Record<string, any>) {
  const response = await fetch(`${API_BASE}/phones/custom`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to add custom phone model');
  }
  return response.json();
}



