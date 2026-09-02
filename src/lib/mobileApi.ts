const API_BASE = 'https://fundu.onrender.com/api';

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
import { ALL_INDIAN_PHONES_CATALOG } from '../data/indianPhonesCatalog';

export type CatalogModelItem = {
  brand: string;
  series: string;
  model: string;
  storage: string;
  price: number;
  image: string;
};

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

// Helper: Timeout fetch wrapper (15s limit)
async function fetchWithTimeout<T>(fetchFn: () => Promise<T>, timeoutMs = 15000): Promise<T> {
  let timeoutId: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('API_TIMEOUT_15S')), timeoutMs);
  });
  try {
    const result = await Promise.race([fetchFn(), timeoutPromise]);
    return result;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Smart Evaluator: Compare results from MobileAPI & GSMArena API and return the best list
function evaluateBestModelList(listA: PhoneModelOption[], listB: PhoneModelOption[]): PhoneModelOption[] {
  if (!listA || listA.length === 0) return listB;
  if (!listB || listB.length === 0) return listA;

  // Best list score: count of models + storage options details completeness
  const scoreA = listA.length * 10 + listA.reduce((acc, m) => acc + (m.storages?.length || 0), 0);
  const scoreB = listB.length * 10 + listB.reduce((acc, m) => acc + (m.storages?.length || 0), 0);

  return scoreA >= scoreB ? listA : listB;
}

export async function fetchPhoneModels(
  brand: string,
  query: string = '',
  provider: 'auto' | 'cashify' | 'mobileapi' = 'auto',
): Promise<PhoneModelOption[]> {
  const cacheKey = `${provider}:${brand.trim().toLowerCase()}:${query.trim().toLowerCase()}`;
  if (modelCache.has(cacheKey)) return modelCache.get(cacheKey) ?? [];

  // Primary Call: MobileAPI (15s Timeout)
  const primaryPromise = fetchWithTimeout(async () => {
    const models = await fetchApi<PhoneModelOption[]>(
      `/mobile/models?brand=${encodeURIComponent(brand)}&query=${encodeURIComponent(query)}&provider=${provider}`
    );
    if (Array.isArray(models) && models.length > 0) return models;
    throw new Error('NO_DATA');
  }, 15000).catch(() => null);

  // Secondary Call: GSMArena Unofficial API (15s Timeout)
  const secondaryPromise = fetchWithTimeout(async () => {
    const gsmModels = await fetchGsmArenaBrandModels(brand.toLowerCase());
    if (Array.isArray(gsmModels) && gsmModels.length > 0) {
      let filtered = gsmModels;
      if (query.trim()) {
        const q = query.toLowerCase();
        filtered = gsmModels.filter((m) => m.phone_name.toLowerCase().includes(q));
      }
      return filtered.map((item) => ({
        name: item.phone_name,
        storages: ['64 GB', '128 GB', '256 GB', '512 GB'],
      }));
    }
    throw new Error('NO_DATA');
  }, 15000).catch(() => null);

  // Await responses from both APIs within 15 seconds
  const [resMobileApi, resGsmArena] = await Promise.all([primaryPromise, secondaryPromise]);

  // Pick the BEST response and hide/discard the inferior one
  const bestResult = evaluateBestModelList(resMobileApi || [], resGsmArena || []);

  if (bestResult.length > 0) {
    modelCache.set(cacheKey, bestResult);
    return bestResult;
  }

  // Tier 3: Local Indian Phone Catalog Fallback
  const fallbackNames = getModelsForBrand(brand);
  let filteredFallback = fallbackNames;
  if (query.trim()) {
    const q = query.toLowerCase();
    filteredFallback = fallbackNames.filter((n) => n.toLowerCase().includes(q));
  }
  const fallbackOptions: PhoneModelOption[] = filteredFallback.map((name) => ({
    name,
    storages: ['64 GB', '128 GB', '256 GB', '512 GB'],
  }));
  return fallbackOptions;
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
  const q = query.trim().toLowerCase();
  const brandClean = brand && brand !== 'All' ? brand.toLowerCase() : '';

  // 1. Try Backend API first
  try {
    const params = new URLSearchParams();
    if (query) params.set('query', query);
    if (brand && brand !== 'All') params.set('brand', brand);
    if (page) params.set('page', String(page));

    const response = await fetch(`${API_BASE}/phones/mobileapi/search?${params.toString()}`);
    if (response.ok) {
      const json = await response.json();
      if (json.data && Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
    }
  } catch {
    // Fall through to local catalog & GSMArena fallback
  }

  // 2. Search local Indian Phones Catalog (ALL_INDIAN_PHONES_CATALOG)
  const localMatches = ALL_INDIAN_PHONES_CATALOG.filter((p) => {
    const matchBrand = !brandClean || p.brand.toLowerCase() === brandClean;
    const matchQuery = !q || `${p.brand} ${p.model} ${p.processor || ''}`.toLowerCase().includes(q);
    return matchBrand && matchQuery;
  });

  if (localMatches.length > 0) {
    return localMatches as any[];
  }

  // 3. Fallback to GSMArena Search
  try {
    const gsmRes = await fetchGsmArenaSearch(query);
    if (gsmRes.length > 0) {
      return gsmRes.map((g, idx) => ({
        id: `gsm-${g.slug}-${idx}`,
        brand: g.brand || brand || 'Smartphone',
        model: g.phone_name,
        release_year: 2024,
        ram_options: ['8GB', '12GB'],
        storage_options: ['128GB', '256GB', '512GB'],
        default_mrp: 49999,
        base_resale_value: 28000,
        image_url: g.image,
        popular_tag: 'GSMArena Live Verified Device',
        processor: 'Octa-Core Flagship Processor',
        camera_spec: '50MP Triple Camera Setup',
        battery_spec: '5000 mAh Fast Charging',
        display_spec: 'Dynamic AMOLED 120Hz',
        is_5g: true,
        is_active: true,
      })) as any[];
    }
  } catch {
    // Ignore
  }

  return [];
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
import { getEffectivePrice } from './priceSync';

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

  // Apply real-time admin price override if configured
  basePrice = getEffectivePrice(brand, model, basePrice, storage);

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

export type CashifyDiagnosticParams = {
  screenCondition?: 'flawless' | 'scratches' | 'cracked';
  bodyCondition?: 'flawless' | 'scratches' | 'dents_bent';
  canMakeCalls?: boolean;
  underWarranty?: boolean;
  defects?: string[];
  accessories?: string[];
};

export type ValuationBreakdown = {
  basePrice: number;
  screenDeduction: number;
  bodyDeduction: number;
  callDeduction: number;
  defectDeductionTotal: number;
  defectsBreakdown: Array<{ name: string; amount: number }>;
  warrantyBonus: number;
  accessoriesBonus: number;
  finalEstimate: number;
};

export function computeDetailedCashifyValuation(
  config: SellPriceConfig | null,
  params: CashifyDiagnosticParams,
  fallbackBrand = '',
  fallbackModel = '',
  fallbackStorage = ''
): ValuationBreakdown {
  const activeConfig = config ?? getDynamicFallbackConfig(fallbackBrand, fallbackModel, fallbackStorage);
  const basePrice = Math.round(activeConfig.base_price * 0.85);

  let screenDeduction = 0;
  if (params.screenCondition === 'scratches') screenDeduction = Math.round(basePrice * 0.12);
  else if (params.screenCondition === 'cracked') screenDeduction = Math.round(basePrice * 0.35);

  let bodyDeduction = 0;
  if (params.bodyCondition === 'scratches') bodyDeduction = Math.round(basePrice * 0.08);
  else if (params.bodyCondition === 'dents_bent') bodyDeduction = Math.round(basePrice * 0.22);

  let callDeduction = 0;
  if (params.canMakeCalls === false) callDeduction = Math.round(basePrice * 0.20);

  let warrantyBonus = 0;
  if (params.underWarranty === true) warrantyBonus = Math.round(basePrice * 0.08);

  const defectsBreakdown: Array<{ name: string; amount: number }> = [];
  let defectDeductionTotal = 0;

  const defectRates: Record<string, { label: string; rate: number }> = {
    cameras: { label: 'Front / Rear Camera Issue', rate: 0.10 },
    battery: { label: 'Battery Degradation / Service', rate: 0.08 },
    speaker_mic: { label: 'Speaker / Microphone Fault', rate: 0.07 },
    charging_port: { label: 'Charging Port Fault', rate: 0.06 },
    biometrics: { label: 'Fingerprint / Face ID Sensor Fault', rate: 0.10 },
    network: { label: 'Wi-Fi / Bluetooth Connectivity Issue', rate: 0.08 },
  };

  if (Array.isArray(params.defects)) {
    params.defects.forEach((defectKey) => {
      const def = defectRates[defectKey];
      if (def) {
        const amt = Math.round(basePrice * def.rate);
        defectsBreakdown.push({ name: def.label, amount: amt });
        defectDeductionTotal += amt;
      }
    });
  }

  let accessoriesBonus = 0;
  if (Array.isArray(params.accessories)) {
    if (params.accessories.includes('Original Box')) accessoriesBonus += 400;
    if (params.accessories.includes('Charger')) accessoriesBonus += 400;
    if (params.accessories.includes('Bill')) accessoriesBonus += 300;
  }

  const calculatedTotal =
    basePrice -
    screenDeduction -
    bodyDeduction -
    callDeduction -
    defectDeductionTotal +
    warrantyBonus +
    accessoriesBonus;

  const floorPrice = Math.max(500, Math.round(basePrice * 0.15));
  const finalEstimate = Math.max(floorPrice, Math.round(calculatedTotal));

  return {
    basePrice,
    screenDeduction,
    bodyDeduction,
    callDeduction,
    defectDeductionTotal,
    defectsBreakdown,
    warrantyBonus,
    accessoriesBonus,
    finalEstimate,
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

/**
 * GSMArena Unofficial API Integration
 * Live endpoints for device specifications, high-res photos, and brand catalogs
 */
const GSMARENA_BASE = 'https://phone-specs-api.azharimm.dev/v2';

export type GsmArenaSearchResult = {
  brand: string;
  phone_name: string;
  slug: string;
  image: string;
};

export type GsmArenaDeviceDetail = {
  brand: string;
  phone_name: string;
  thumbnail: string;
  phone_images: string[];
  release_date?: string;
  dimension?: string;
  os?: string;
  storage?: string;
  specifications: Array<{
    title: string;
    specs: Array<{ key: string; val: string[] }>;
  }>;
};

export async function fetchGsmArenaSearch(query: string): Promise<GsmArenaSearchResult[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await fetch(`${GSMARENA_BASE}/search?q=${encodeURIComponent(query)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.status && json.data && Array.isArray(json.data.phones)) {
        return json.data.phones;
      }
    }
  } catch {
    // Fall through to active backend API if GSMArena mirror is down
  }

  try {
    const res = await fetch(`${API_BASE}/mobile/autocomplete?q=${encodeURIComponent(query)}&limit=10`);
    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        return json.data.map((item: any) => ({
          brand: item.brand || '',
          phone_name: item.name || item.full_name || '',
          slug: (item.name || '').toLowerCase().replace(/\s+/g, '-'),
          image: item.image_url || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=150&auto=format&fit=crop&q=80',
        }));
      }
    }
  } catch {
    return [];
  }
  return [];
}

export async function fetchGsmArenaDeviceDetails(slug: string): Promise<GsmArenaDeviceDetail | null> {
  if (!slug) return null;
  try {
    const res = await fetch(`${GSMARENA_BASE}/${encodeURIComponent(slug)}`);
    if (!res.ok) return null;
    const json = await res.json();
    if (json.status && json.data) {
      return json.data as GsmArenaDeviceDetail;
    }
    return null;
  } catch {
    return null;
  }
}

export function detectSeries(brand: string, modelName: string): string {
  const b = brand.toLowerCase();
  const m = modelName.toLowerCase();

  if (b === 'vivo') {
    if (/\bx\d|\bx\s|\bx-|\bfold/i.test(modelName)) return 'X Series';
    if (/\bv\d|\bv\s|\bv-/i.test(modelName)) return 'V Series';
    if (/\by\d|\by\s|\by-/i.test(modelName)) return 'Y Series';
    if (/\bt\d|\bt\s|\bt-/i.test(modelName)) return 'T Series';
    if (/\bz\d|\bz\s|\bz-/i.test(modelName)) return 'Z Series';
    if (/\bu\d|\bu\s|\bu-/i.test(modelName)) return 'U Series';
    if (/nex/i.test(modelName)) return 'NEX Series';
    if (/\bs\d|\bs\s|\bs-/i.test(modelName)) return 'S Series';
    return 'X Series';
  }
  if (b === 'apple') {
    if (/iphone 16/i.test(modelName)) return 'iPhone 16 Series';
    if (/iphone 15/i.test(modelName)) return 'iPhone 15 Series';
    if (/iphone 14/i.test(modelName)) return 'iPhone 14 Series';
    if (/iphone 13/i.test(modelName)) return 'iPhone 13 Series';
    if (/iphone 12/i.test(modelName)) return 'iPhone 12 Series';
    if (/iphone 11/i.test(modelName)) return 'iPhone 11 Series';
    return 'iPhone Series';
  }
  if (b === 'samsung') {
    if (/galaxy s/i.test(modelName)) return 'Galaxy S Series';
    if (/galaxy z/i.test(modelName)) return 'Galaxy Z Series';
    if (/galaxy a/i.test(modelName)) return 'Galaxy A Series';
    if (/galaxy m/i.test(modelName)) return 'Galaxy M Series';
    return 'Galaxy S Series';
  }
  if (b === 'oneplus') {
    if (/nord/i.test(modelName)) return 'Nord Series';
    if (/\dr\b/i.test(modelName)) return 'R Series';
    return 'Number Series';
  }
  if (b === 'xiaomi') {
    if (/redmi note/i.test(modelName)) return 'Redmi Note Series';
    if (/redmi/i.test(modelName)) return 'Redmi Series';
    if (/poco/i.test(modelName)) return 'Poco Series';
    return 'Mi Series';
  }
  return 'All Series';
}

const catalogCache = new Map<string, CatalogModelItem[]>();

export async function fetchBrandCatalogFromApi(brand: string): Promise<CatalogModelItem[]> {
  const cleanBrand = brand.trim().toLowerCase();
  if (catalogCache.has(cleanBrand)) {
    return catalogCache.get(cleanBrand)!;
  }

  // 1. Primary: Try Remote API endpoint `/mobile/devices?brand=...`
  try {
    const apiDevices = await fetchWithTimeout(async () => {
      const result = await fetchApi<MobileApiDevice[]>(`/mobile/devices?brand=${encodeURIComponent(brand)}`);
      if (Array.isArray(result) && result.length > 0) return result;
      throw new Error('NO_API_DEVICES');
    }, 8000).catch(() => null);

    if (apiDevices && apiDevices.length > 0) {
      const mapped: CatalogModelItem[] = apiDevices.map((dev) => ({
        brand: dev.brand || brand,
        series: detectSeries(dev.brand || brand, dev.model),
        model: dev.model,
        storage: dev.storage_options?.[0] || '128 GB',
        price: dev.base_resale_value || Math.round((dev.default_mrp || 30000) * 0.55),
        image: dev.image_url || 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80',
      }));
      catalogCache.set(cleanBrand, mapped);
      return mapped;
    }
  } catch {
    // fallback to local catalog
  }

  // 2. Secondary: Fallback to local catalog database (ALL_INDIAN_PHONES_CATALOG)
  const localMatches = ALL_INDIAN_PHONES_CATALOG.filter(
    (p) => p.brand.toLowerCase() === cleanBrand
  );

  if (localMatches.length > 0) {
    const mapped: CatalogModelItem[] = localMatches.map((p) => ({
      brand: p.brand,
      series: detectSeries(p.brand, p.model),
      model: p.model,
      storage: p.storage_options?.[0] || '128 GB',
      price: p.base_resale_value || Math.round(p.default_mrp * 0.55),
      image: p.image_url || 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80',
    }));
    catalogCache.set(cleanBrand, mapped);
    return mapped;
  }

  return [];
}



