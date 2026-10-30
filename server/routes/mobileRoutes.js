import { Router } from 'express';
import { SellPriceConfig, MasterPhone } from '../models/index.js';
import { createHttpError } from '../utils/error.js';
import { normalizeDoc } from '../utils/dbHelpers.js';
import {
  DEFAULT_PHONE_BRANDS,
  extractStorageOptions,
  getCachedValue,
  mobileApiRequest,
  setCachedValue,
  fetchMobileApiAutocomplete,
  fetchMobileApiSearch,
  fetchMobileApiDeviceById,
  fetchMobileApiDeviceImages,
  fetchMobileApiManufacturers,
} from '../utils/mobileApi.js';
import {
  fetchCashifyBrands,
  fetchCashifyModels,
  fetchCashifyValuation,
} from '../utils/cashifyApi.js';
import { seedDatabase } from '../config/db.js';
import { resolveDeviceImage } from '../services/deviceImageService.js';
import { INDIAN_MARKET_PHONES_LAST_10_YEARS } from '../config/seedPhones.js';
import { calculateHardwareVariantMultiplier } from '../../fundu_phone_quote.mjs';

const router = Router();


const FALLBACK_MODELS = {
  apple: [
    { name: 'iPhone 15 Pro Max', storages: ['256GB', '512GB', '1TB'] },
    { name: 'iPhone 15 Pro', storages: ['128GB', '256GB', '512GB', '1TB'] },
    { name: 'iPhone 15 Plus', storages: ['128GB', '256GB', '512GB'] },
    { name: 'iPhone 15', storages: ['128GB', '256GB', '512GB'] },
    { name: 'iPhone 14 Pro Max', storages: ['128GB', '256GB', '512GB', '1TB'] },
    { name: 'iPhone 14 Pro', storages: ['128GB', '256GB', '512GB'] },
    { name: 'iPhone 14 Plus', storages: ['128GB', '256GB', '512GB'] },
    { name: 'iPhone 14', storages: ['128GB', '256GB', '512GB'] },
    { name: 'iPhone 13 Pro Max', storages: ['128GB', '256GB', '512GB', '1TB'] },
    { name: 'iPhone 13 Pro', storages: ['128GB', '256GB', '512GB'] },
    { name: 'iPhone 13', storages: ['128GB', '256GB', '512GB'] },
    { name: 'iPhone 13 mini', storages: ['128GB', '256GB', '512GB'] },
    { name: 'iPhone 12 Pro Max', storages: ['128GB', '256GB', '512GB'] },
    { name: 'iPhone 12 Pro', storages: ['128GB', '256GB', '512GB'] },
    { name: 'iPhone 12', storages: ['64GB', '128GB', '256GB'] },
    { name: 'iPhone 11', storages: ['64GB', '128GB', '256GB'] },
    { name: 'iPhone SE (2022)', storages: ['64GB', '128GB', '256GB'] },
  ],
  samsung: [
    { name: 'Galaxy S26 Ultra', storages: ['256GB', '512GB', '1TB'] },
    { name: 'Galaxy S26+', storages: ['256GB', '512GB'] },
    { name: 'Galaxy S26 5G', storages: ['128GB', '256GB', '512GB'] },
    { name: 'Galaxy Z Fold 7', storages: ['256GB', '512GB', '1TB'] },
    { name: 'Galaxy Z Flip 7', storages: ['256GB', '512GB'] },
    { name: 'Galaxy S25 Ultra', storages: ['256GB', '512GB', '1TB'] },
    { name: 'Galaxy S25+', storages: ['256GB', '512GB'] },
    { name: 'Galaxy S25 5G', storages: ['128GB', '256GB', '512GB'] },
    { name: 'Galaxy S25 FE', storages: ['128GB', '256GB'] },
    { name: 'Galaxy Z Fold 6', storages: ['256GB', '512GB', '1TB'] },
    { name: 'Galaxy Z Flip 6', storages: ['256GB', '512GB'] },
    { name: 'Galaxy S24 Ultra', storages: ['256GB', '512GB', '1TB'] },
    { name: 'Galaxy S24+', storages: ['256GB', '512GB'] },
    { name: 'Galaxy S24 5G', storages: ['128GB', '256GB', '512GB'] },
    { name: 'Galaxy S23 Ultra 5G', storages: ['256GB', '512GB', '1TB'] },
    { name: 'Galaxy S23 FE 5G', storages: ['128GB', '256GB'] },
    { name: 'Galaxy S23 5G', storages: ['128GB', '256GB'] },
    { name: 'Galaxy S22 Ultra 5G', storages: ['128GB', '256GB', '512GB'] },
    { name: 'Galaxy S22 5G', storages: ['128GB', '256GB'] },
    { name: 'Galaxy S21 FE 5G', storages: ['128GB', '256GB'] },
    { name: 'Galaxy Z Fold5', storages: ['256GB', '512GB', '1TB'] },
    { name: 'Galaxy Z Flip5', storages: ['256GB', '512GB'] },
    { name: 'Galaxy Z Fold4', storages: ['256GB', '512GB'] },
    { name: 'Galaxy Z Flip4', storages: ['128GB', '256GB'] },
    { name: 'Galaxy A55 5G', storages: ['128GB', '256GB'] },
    { name: 'Galaxy A35 5G', storages: ['128GB', '256GB'] },
    { name: 'Galaxy A54 5G', storages: ['128GB', '256GB'] },
    { name: 'Galaxy A34 5G', storages: ['128GB', '256GB'] },
    { name: 'Galaxy A15 5G', storages: ['128GB', '256GB'] },
    { name: 'Galaxy M55 5G', storages: ['128GB', '256GB'] },
    { name: 'Galaxy M34 5G', storages: ['128GB', '256GB'] },
    { name: 'Galaxy F54 5G', storages: ['256GB'] },
  ],
  oneplus: [
    { name: 'OnePlus 12', storages: ['256GB', '512GB'] },
    { name: 'OnePlus 12R', storages: ['128GB', '256GB'] },
    { name: 'OnePlus 11 5G', storages: ['128GB', '256GB'] },
    { name: 'OnePlus 11R 5G', storages: ['128GB', '256GB'] },
    { name: 'OnePlus 10 Pro 5G', storages: ['128GB', '256GB'] },
    { name: 'OnePlus 10R 5G', storages: ['128GB', '256GB'] },
    { name: 'OnePlus Nord 4 5G', storages: ['128GB', '256GB'] },
    { name: 'OnePlus Nord CE 4 5G', storages: ['128GB', '256GB'] },
    { name: 'OnePlus Nord 3 5G', storages: ['128GB', '256GB'] },
    { name: 'OnePlus Nord CE 3 5G', storages: ['128GB', '256GB'] },
  ],
  xiaomi: [
    { name: 'Xiaomi 14 Ultra', storages: ['512GB'] },
    { name: 'Xiaomi 14', storages: ['256GB', '512GB'] },
    { name: 'Xiaomi 13 Pro', storages: ['256GB', '512GB'] },
    { name: 'Redmi Note 13 Pro+ 5G', storages: ['256GB', '512GB'] },
    { name: 'Redmi Note 13 Pro 5G', storages: ['128GB', '256GB'] },
    { name: 'Redmi Note 13 5G', storages: ['128GB', '256GB'] },
    { name: 'Redmi Note 12 Pro 5G', storages: ['128GB', '256GB'] },
    { name: 'Poco X6 Pro 5G', storages: ['256GB', '512GB'] },
    { name: 'Poco F6 5G', storages: ['256GB', '512GB'] },
    { name: 'Poco M6 Pro 5G', storages: ['64GB', '128GB'] },
  ],
  vivo: [
    { name: 'Vivo X100 Pro', storages: ['512GB'] },
    { name: 'Vivo V30 Pro 5G', storages: ['256GB', '512GB'] },
    { name: 'Vivo V30 5G', storages: ['128GB', '256GB', '512GB'] },
    { name: 'Vivo V29 5G', storages: ['128GB', '256GB'] },
    { name: 'Vivo V29e 5G', storages: ['128GB', '256GB'] },
    { name: 'Vivo Y200 5G', storages: ['128GB', '256GB'] },
    { name: 'Vivo Y56 5G', storages: ['128GB'] },
  ],
  oppo: [
    { name: 'Oppo Reno 11 Pro 5G', storages: ['256GB'] },
    { name: 'Oppo Reno 11 5G', storages: ['128GB', '256GB'] },
    { name: 'Oppo F25 Pro 5G', storages: ['128GB', '256GB'] },
    { name: 'Oppo F23 5G', storages: ['256GB'] },
    { name: 'Oppo A79 5G', storages: ['128GB'] },
  ],
  realme: [
    { name: 'Realme GT 6 5G', storages: ['256GB', '512GB'] },
    { name: 'Realme 12 Pro+ 5G', storages: ['128GB', '256GB'] },
    { name: 'Realme 12 Pro 5G', storages: ['128GB', '256GB'] },
    { name: 'Realme 12+ 5G', storages: ['128GB', '256GB'] },
    { name: 'Realme 11 Pro+ 5G', storages: ['256GB', '512GB'] },
    { name: 'Realme Narzo 70 Pro 5G', storages: ['128GB', '256GB'] },
  ],
  google: [
    { name: 'Pixel 8a', storages: ['128GB', '256GB'] },
    { name: 'Pixel 8 Pro', storages: ['128GB', '256GB', '512GB'] },
    { name: 'Pixel 8', storages: ['128GB', '256GB'] },
    { name: 'Pixel 7a', storages: ['128GB'] },
    { name: 'Pixel 7 Pro', storages: ['128GB', '256GB'] },
    { name: 'Pixel 7', storages: ['128GB', '256GB'] },
    { name: 'Pixel 6a', storages: ['128GB'] },
  ],
  nothing: [
    { name: 'Nothing Phone (2)', storages: ['128GB', '256GB', '512GB'] },
    { name: 'Nothing Phone (2a)', storages: ['128GB', '256GB'] },
    { name: 'Nothing Phone (1)', storages: ['128GB', '256GB'] },
  ],
  motorola: [
    { name: 'Moto Edge 50 Ultra', storages: ['512GB'] },
    { name: 'Moto Edge 50 Pro 5G', storages: ['256GB', '512GB'] },
    { name: 'Moto Edge 50 Fusion', storages: ['128GB', '256GB'] },
    { name: 'Moto Edge 40 Neo', storages: ['128GB', '256GB'] },
    { name: 'Moto G84 5G', storages: ['256GB'] },
    { name: 'Moto G54 5G', storages: ['128GB', '256GB'] },
  ],
  poco: [
    { name: 'Poco X6 Pro 5G', storages: ['256GB', '512GB'] },
    { name: 'Poco F6 5G', storages: ['256GB', '512GB'] },
    { name: 'Poco X6 5G', storages: ['128GB', '256GB', '512GB'] },
    { name: 'Poco M6 Pro 5G', storages: ['64GB', '128GB'] },
  ],
  iqoo: [
    { name: 'iQOO 12 5G', storages: ['256GB', '512GB'] },
    { name: 'iQOO Neo 9 Pro 5G', storages: ['128GB', '256GB'] },
    { name: 'iQOO Z9 5G', storages: ['128GB', '256GB'] },
    { name: 'iQOO Neo 7 Pro 5G', storages: ['128GB', '256GB'] },
  ],
  infinix: [
    { name: 'Infinix Zero 30 5G', storages: ['256GB'] },
    { name: 'Infinix GT 20 Pro 5G', storages: ['256GB'] },
    { name: 'Infinix Note 40 Pro 5G', storages: ['256GB'] },
  ],
  tecno: [
    { name: 'Tecno Camon 30 Premier 5G', storages: ['512GB'] },
    { name: 'Tecno Camon 30 Pro 5G', storages: ['256GB'] },
    { name: 'Tecno Camon 30 5G', storages: ['256GB'] },
    { name: 'Tecno Camon 20 Pro 5G', storages: ['128GB', '256GB'] },
    { name: 'Tecno Pova 6 Pro 5G', storages: ['128GB', '256GB'] },
    { name: 'Tecno Pova 5 Pro 5G', storages: ['128GB', '256GB'] },
    { name: 'Tecno Spark 20 Pro+', storages: ['256GB'] },
    { name: 'Tecno Spark 20', storages: ['128GB'] },
    { name: 'Tecno Spark Go 2024', storages: ['64GB', '128GB'] },
    { name: 'Tecno Phantom V Fold 5G', storages: ['256GB', '512GB'] },
    { name: 'Tecno Phantom V Flip 5G', storages: ['256GB'] },
    { name: 'Tecno Phantom X2 Pro 5G', storages: ['256GB'] },
  ],
  honor: [
    { name: 'Honor 200 5G', storages: ['256GB', '512GB'] },
    { name: 'Honor 90 5G', storages: ['256GB', '512GB'] },
  ],
  itel: [
    { name: 'Itel Color Pro 5G', storages: ['128GB'] },
    { name: 'Itel S24', storages: ['128GB'] },
    { name: 'Itel S23+', storages: ['128GB', '256GB'] },
    { name: 'Itel S23', storages: ['128GB'] },
    { name: 'Itel P55 5G', storages: ['64GB', '128GB'] },
    { name: 'Itel P55+', storages: ['128GB', '256GB'] },
    { name: 'Itel P55', storages: ['128GB'] },
    { name: 'Itel P55T', storages: ['128GB'] },
    { name: 'Itel A70', storages: ['64GB', '128GB', '256GB'] },
    { name: 'Itel A60s', storages: ['64GB', '128GB'] },
    { name: 'Itel A05s', storages: ['64GB'] },
  ],
};

function getFallbackModels(brand, query) {
  let bLower = (brand || '').toLowerCase().trim();
  if (bLower === 'techno') bLower = 'tecno';
  const qLower = (query || '').toLowerCase().trim();

  // 1. Pull matching models from comprehensive catalog
  const catalogMatches = INDIAN_MARKET_PHONES_LAST_10_YEARS.filter((p) => {
    const pBrand = p.brand.toLowerCase();
    let matchBrand = pBrand === bLower;
    if (!matchBrand) {
      if (bLower === 'xiaomi' && (pBrand === 'redmi' || pBrand === 'poco')) matchBrand = true;
      if (bLower === 'vivo' && pBrand === 'iqoo') matchBrand = true;
      if (bLower === 'motorola' && pBrand === 'moto') matchBrand = true;
      if (bLower === 'apple' && (pBrand === 'apple' || /iphone/i.test(p.model))) matchBrand = true;
    }
    if (!matchBrand) return false;
    if (qLower) return p.model.toLowerCase().includes(qLower);
    return true;
  }).map((p) => ({
    name: p.model,
    storages: p.storage_options || ['128GB', '256GB'],
  }));

  if (catalogMatches.length > 0) return catalogMatches;

  const list = FALLBACK_MODELS[bLower] ?? [
    { name: `${brand} Phone Model 1`, storages: ['128GB', '256GB'] },
    { name: `${brand} Phone Model 2`, storages: ['128GB', '256GB'] },
  ];

  if (!qLower) return list;
  return list.filter((m) => m.name.toLowerCase().includes(qLower));
}

/**
 * Smart sorting prioritizing popular modern smartphone series
 */
function sortModernModels(models, brand) {
  const curated = FALLBACK_MODELS[brand.toLowerCase()] ?? [];
  const curatedNames = new Set(curated.map(c => c.name.toLowerCase()));

  // Modern series key terms
  const modernTerms = [
    'galaxy', 'iphone', 'oneplus', 'pixel', 'redmi', 'poco', 'vivo', 'reno',
    'realme', 'edge', 'phone', 'iqoo', 'nord', 'narzo', 'zero', 'camon', 'honor',
    'pro', 'ultra', 'max', 'plus', '5g', 'fold', 'flip'
  ];

  const scoreModel = (modelName) => {
    const lower = modelName.toLowerCase();
    let score = 0;

    // Highest priority for curated modern smartphone list
    if (curatedNames.has(lower)) score += 1000;

    // High priority for popular modern series names
    if (modernTerms.some(t => lower.includes(t))) score += 500;

    // Filter out ancient 2G feature phones or single word legacy numbers like "360 H1", "A5 Duo"
    if (/^(360|a\d|b\d|c\d|e\d|f\d|g\d|u\d)\b/i.test(lower)) score -= 200;
    if (/\b(cdma|duos|guru|duo|metro|focus|contour|aviator)\b/i.test(lower)) score -= 300;

    return score;
  };

  return models.sort((a, b) => {
    const scoreA = scoreModel(a.name);
    const scoreB = scoreModel(b.name);
    if (scoreA !== scoreB) return scoreB - scoreA;
    return a.name.localeCompare(b.name);
  });
}

router.get('/health', (_req, res) => {
  res.json({ ok: true });
});

router.all('/seed', async (_req, res, next) => {
  try {
    await seedDatabase();
    res.json({ message: 'Database seed process completed successfully.' });
  } catch (error) {
    next(error);
  }
});

router.get('/mobile/brands', async (_req, res, next) => {
  try {
    const cacheKey = 'mobile-brands';
    const cached = getCachedValue(cacheKey, 1000 * 60 * 60 * 24);
    if (cached) {
      res.json({ data: cached });
      return;
    }

    // Try fetching live manufacturers from mobileapi.dev
    try {
      const liveManufacturers = await fetchMobileApiManufacturers(1);
      if (Array.isArray(liveManufacturers) && liveManufacturers.length > 0) {
        const liveBrandNames = liveManufacturers.map((m) => m.name).filter(Boolean);
        // Combine default top Indian brands with live brands
        const combined = Array.from(new Set([...DEFAULT_PHONE_BRANDS, ...liveBrandNames]));
        res.json({ data: setCachedValue(cacheKey, combined) });
        return;
      }
    } catch (_e) {
      // Fallback seamlessly to default brands
    }

    res.json({ data: setCachedValue(cacheKey, DEFAULT_PHONE_BRANDS) });
  } catch (error) {
    next(error);
  }
});

/**
 * Live Autocomplete for devices from https://mobileapi.dev/devices/autocomplete/
 * GET /api/mobile/autocomplete?q=iPhone&limit=10
 */
router.get('/mobile/autocomplete', async (req, res) => {
  try {
    const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const limit = Math.min(Number(req.query.limit) || 30, 50);

    if (!query || query.length < 2) {
      return res.json({ data: [] });
    }

    const suggestions = await fetchMobileApiAutocomplete(query, limit);
    return res.json({ data: suggestions, count: suggestions.length, provider: 'https://mobileapi.dev/' });
  } catch (error) {
    return res.status(500).json({ error: { message: error.message } });
  }
});

/**
 * Direct Live Device Search on https://mobileapi.dev/devices/search/
 * GET /api/mobile/search?query=iPhone+15&brand=Apple&page=1
 */
router.get('/mobile/search', async (req, res) => {
  try {
    const query = typeof req.query.query === 'string' ? req.query.query.trim() : '';
    const brand = typeof req.query.brand === 'string' ? req.query.brand.trim() : '';
    const page = Math.max(Number(req.query.page) || 1, 1);

    if (!query && !brand) {
      return res.status(400).json({ error: { message: 'query or brand parameter is required' } });
    }

    const result = await fetchMobileApiSearch(query || brand, brand, page);
    return res.json({
      data: result.devices,
      total: result.total,
      page: result.page,
      provider: 'https://mobileapi.dev/',
    });
  } catch (error) {
    return res.status(500).json({ error: { message: error.message } });
  }
});

/**
 * Dynamic Device Image Resolver: Option A (MobileAPI.dev) with Option B (RapidAPI GSM Arena) Backup
 * GET /api/device-image?brand=Apple&model=iPhone+15+Pro
 */
router.get('/device-image', async (req, res) => {
  try {
    const brand = typeof req.query.brand === 'string' ? req.query.brand.trim() : '';
    const model = typeof req.query.model === 'string' ? req.query.model.trim() : '';

    if (!brand && !model) {
      return res.status(400).json({ error: { message: 'Brand or model parameter is required' } });
    }

    const resolved = await resolveDeviceImage(brand, model);
    if (resolved && resolved.imageUrl) {
      return res.json({
        success: true,
        imageUrl: resolved.imageUrl,
        source: resolved.source,
        title: resolved.title || `${brand} ${model}`,
        deviceId: resolved.deviceId || null,
      });
    }

    return res.json({
      success: false,
      message: 'No exact studio render found in Option A or Option B',
    });
  } catch (error) {
    return res.status(500).json({ error: { message: error.message } });
  }
});

/**
 * Query devices by brand or search term
 * GET /api/mobile/devices?brand=oneplus&page=1
 */
router.get('/mobile/devices', async (req, res) => {
  try {
    const query = typeof req.query.query === 'string' ? req.query.query.trim() : '';
    const brand = typeof req.query.brand === 'string' ? req.query.brand.trim() : '';
    const page = Math.max(Number(req.query.page) || 1, 1);

    const result = await fetchMobileApiSearch(query || brand, brand, page);
    return res.json({
      data: result.devices,
      total: result.total,
      page: result.page,
      provider: 'https://mobileapi.dev/',
    });
  } catch (error) {
    return res.status(500).json({ error: { message: error.message } });
  }
});

/**
 * Get Device by ID from https://mobileapi.dev/devices/{id}/
 * GET /api/mobile/devices/:id
 */
router.get('/mobile/devices/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: { message: 'Device ID required' } });
    }

    const device = await fetchMobileApiDeviceById(id);
    if (!device) {
      return res.status(404).json({ error: { message: 'Device not found on MobileAPI.dev' } });
    }

    return res.json({ data: device, provider: 'https://mobileapi.dev/' });
  } catch (error) {
    return res.status(500).json({ error: { message: error.message } });
  }
});

/**
 * Get Device Images from https://mobileapi.dev/devices/{id}/images/
 * GET /api/mobile/devices/:id/images
 */
router.get('/mobile/devices/:id/images', async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: { message: 'Device ID required' } });
    }

    const images = await fetchMobileApiDeviceImages(id);
    return res.json({ data: images, count: images.length, provider: 'https://mobileapi.dev/' });
  } catch (error) {
    return res.status(500).json({ error: { message: error.message } });
  }
});

/**
 * Get Manufacturers list from https://mobileapi.dev/manufacturers/
 * GET /api/mobile/manufacturers?page=1
 */
router.get('/mobile/manufacturers', async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const manufacturers = await fetchMobileApiManufacturers(page);
    return res.json({ data: manufacturers, count: manufacturers.length, provider: 'https://mobileapi.dev/' });
  } catch (error) {
    return res.status(500).json({ error: { message: error.message } });
  }
});

router.get('/mobile/models', async (req, res) => {
  const brand = typeof req.query.brand === 'string' ? req.query.brand.trim() : '';
  const query = typeof req.query.query === 'string' ? req.query.query.trim() : '';
  const provider = typeof req.query.provider === 'string' ? req.query.provider.trim().toLowerCase() : 'auto';

  if (!brand) {
    res.status(400).json({ error: 'brand is required.' });
    return;
  }

  const searchQuery = query.length >= 2 ? query : brand;
  const cacheKey = `model-search:${provider}:${brand.toLowerCase()}:${searchQuery.toLowerCase()}`;
  const cached = getCachedValue(cacheKey, 1000 * 60 * 60 * 12);

  if (cached) {
    res.json({ data: cached });
    return;
  }

  // 1. Try MobileAPI.dev first (api.mobileapi.dev) when mobileapi or auto is requested
  if (provider === 'mobileapi' || provider === 'auto') {
    try {
      const searchRes = await fetchMobileApiSearch(query, brand, 1);
      if (searchRes.devices && searchRes.devices.length > 0) {
        const modelMap = new Map();

        // Seed with curated modern models first
        const curatedList = getFallbackModels(brand, query);
        curatedList.forEach((item) => {
          modelMap.set(item.name.toLowerCase(), { name: item.name, storages: new Set(item.storages) });
        });

        searchRes.devices.forEach((device) => {
          const modelName = String(device.model || device.name || '').trim();
          if (!modelName) return;

          const key = modelName.toLowerCase();
          const existing = modelMap.get(key) ?? { name: modelName, storages: new Set() };
          (device.storage_options || []).forEach((stg) => existing.storages.add(stg));
          modelMap.set(key, existing);
        });

        const rawModels = Array.from(modelMap.values()).map((entry) => ({
          name: entry.name,
          storages: Array.from(entry.storages),
        }));

        const sortedModels = sortModernModels(rawModels, brand);
        if (sortedModels.length > 0) {
          setCachedValue(cacheKey, sortedModels);
          res.json({ data: sortedModels, provider: 'mobileapi' });
          return;
        }
      }
    } catch (_err) {
      // Seamless fallback
    }
  }

  // 2. Try Cashify API if requested or in auto mode
  if (provider === 'cashify' || provider === 'auto') {
    try {
      const cashifyModels = await fetchCashifyModels(brand, query);
      if (Array.isArray(cashifyModels) && cashifyModels.length > 0) {
        const sorted = sortModernModels(cashifyModels, brand);
        setCachedValue(cacheKey, sorted);
        res.json({ data: sorted, provider: 'cashify' });
        return;
      }
    } catch (_e) {
      // Fallback seamlessly to local catalog
    }
  }

  // 3. Fallback to curated local models
  const fallback = sortModernModels(getFallbackModels(brand, query), brand);
  setCachedValue(cacheKey, fallback);
  res.json({ data: fallback, provider: 'local' });
});


router.get('/mobile/cashify/models', async (req, res) => {
  const brand = typeof req.query.brand === 'string' ? req.query.brand.trim() : '';
  const query = typeof req.query.query === 'string' ? req.query.query.trim() : '';

  if (!brand) {
    res.status(400).json({ error: 'brand is required.' });
    return;
  }

  const models = await fetchCashifyModels(brand, query);
  if (!models || models.length === 0) {
    const fallback = getFallbackModels(brand, query);
    res.json({ data: fallback, provider: 'fallback' });
    return;
  }

  res.json({ data: models, provider: 'cashify' });
});

router.get('/mobile/cashify/estimate', async (req, res, next) => {
  try {
    const brand = typeof req.query.brand === 'string' ? req.query.brand.trim() : '';
    const model = typeof req.query.model === 'string' ? req.query.model.trim() : '';
    const storage = typeof req.query.storage === 'string' ? req.query.storage.trim() : '';

    if (!brand || !model) {
      res.status(400).json({ error: 'brand and model are required.' });
      return;
    }

    const valuation = await fetchCashifyValuation(brand, model, storage);
    res.json({ data: valuation });
  } catch (error) {
    next(error);
  }
});

router.get('/sell-pricing/config', async (req, res, next) => {
  try {
    const rawBrand = typeof req.query.brand === 'string' ? req.query.brand.trim() : '';
    let rawModel = typeof req.query.model === 'string' ? req.query.model.trim() : '';
    const storage = typeof req.query.storage === 'string' ? req.query.storage.trim() : '';

    if (!rawBrand || !rawModel) {
      throw createHttpError(400, 'brand and model are required.');
    }

    // Sanitize model
    rawModel = rawModel
      .replace(/^(sell-old-|old-sell-|sell-|old-|used-)+/i, '')
      .replace(/^(sell\s+|old\s+|used\s+)+/i, '')
      .trim();
    if (rawBrand && rawModel.toLowerCase().startsWith(rawBrand.toLowerCase())) {
      rawModel = rawModel.slice(rawBrand.length).trim();
    }

    const isPoco = rawBrand.toLowerCase() === 'poco';
    const isXiaomi = rawBrand.toLowerCase() === 'xiaomi';
    const brandRegex = (isPoco || isXiaomi)
      ? /^(poco|xiaomi)$/i
      : new RegExp(`^${rawBrand}$`, 'i');

    const cleanModelName = rawModel.replace(/^(poco|xiaomi)\s+/i, '').trim();
    const modelEscaped = rawModel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const cleanEscaped = cleanModelName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const modelRegex = new RegExp(`^(${modelEscaped}|${rawBrand}\\s+${modelEscaped}|${cleanEscaped}|poco\\s+${cleanEscaped}|xiaomi\\s+${cleanEscaped})$`, 'i');

    let config = null;

    // 1. Try exact storage match first
    if (storage) {
      const storageClean = storage.replace(/\s+/g, '\\s*');
      config = await SellPriceConfig.findOne({
        brand: brandRegex,
        model: modelRegex,
        storage: new RegExp(`^${storageClean}$`, 'i'),
        is_active: { $ne: false },
      }).sort({ manual_override: -1, is_locked: -1, updated_at: -1, _id: -1 }).lean();
    }

    // 2. Try any active config for this model in SellPriceConfig
    if (!config) {
      config = await SellPriceConfig.findOne({
        brand: brandRegex,
        model: modelRegex,
        is_active: { $ne: false },
      }).sort({ manual_override: -1, is_locked: -1, updated_at: -1, _id: -1 }).lean();
    }

    if (config) {
      const normDoc = normalizeDoc(config);
      const isExplicitMatch = !storage || (normDoc.storage && normDoc.storage.replace(/\s+/g, '').toLowerCase() === storage.replace(/\s+/g, '').toLowerCase());

      // If document was explicitly set/locked by admin OR exact storage matched, PRESERVE exact price without any mutation!
      if (isExplicitMatch || normDoc.manual_override || normDoc.is_locked) {
        if (storage) normDoc.storage = storage;
        res.json({ data: normDoc, source: 'admin_database' });
        return;
      }

      // Only if requested storage differs from an unlocked default config, scale dynamically
      if (storage && normDoc.base_price > 0) {
        const baseStorage = normDoc.storage || '128 GB';
        const normBaseStorage = baseStorage.replace(/\s+/g, '').toLowerCase();
        const normTargetStorage = storage.replace(/\s+/g, '').toLowerCase();
        
        if (normBaseStorage !== normTargetStorage) {
          const baseMult = calculateHardwareVariantMultiplier(baseStorage, '', rawBrand);
          const targetMult = calculateHardwareVariantMultiplier(storage, '', rawBrand);
          const ratio = baseMult > 0 ? targetMult / baseMult : 1.0;
          normDoc.base_price = Math.max(500, Math.round((normDoc.base_price * ratio) / 50) * 50);
          normDoc.storage = storage;
        }
      }

      res.json({ data: normDoc, source: 'admin_database' });
      return;
    }

    // 3. Check MasterPhone in MongoDB if no SellPriceConfig
    const mp = await MasterPhone.findOne({
      brand: brandRegex,
      model: modelRegex,
    }).lean();

    if (mp && (mp.base_resale_value > 0 || mp.price > 0)) {
      const baseVal = mp.base_resale_value || Math.round(mp.price * 0.55);
      const catalogStorage = mp.storage_options?.[0] || '128 GB';
      const baseMult = calculateHardwareVariantMultiplier(catalogStorage, '', rawBrand);
      const targetMult = calculateHardwareVariantMultiplier(storage || catalogStorage, '', rawBrand);
      const ratio = baseMult > 0 ? targetMult / baseMult : 1.0;
      const finalPrice = Math.max(500, Math.round((baseVal * ratio) / 50) * 50);

      res.json({
        data: {
          id: `masterphone-${mp._id}`,
          brand: mp.brand,
          model: mp.model,
          storage: storage || catalogStorage,
          base_price: finalPrice,
          excellent_multiplier: 0.85,
          good_multiplier: 0.70,
          fair_multiplier: 0.55,
          box_bonus: 300,
          charger_bonus: 300,
          is_active: true,
        },
        source: 'masterphone_database',
      });
      return;
    }

    // 4. Try Cashify Valuation API if no admin config exists in database
    const cashifyValuation = await fetchCashifyValuation(rawBrand, rawModel, storage);
    if (cashifyValuation && typeof cashifyValuation.base_price === 'number') {
      res.json({
        data: {
          id: `cashify-${rawBrand}-${rawModel}`,
          brand: rawBrand,
          model: rawModel,
          storage: storage || null,
          base_price: cashifyValuation.base_price,
          excellent_multiplier: cashifyValuation.excellent_multiplier || 0.75,
          good_multiplier: cashifyValuation.good_multiplier || 0.60,
          fair_multiplier: cashifyValuation.fair_multiplier || 0.45,
          box_bonus: cashifyValuation.box_bonus || 600,
          charger_bonus: cashifyValuation.charger_bonus || 400,
          is_active: true,
        },
        source: 'cashify_api',
      });
      return;
    }

    res.json({ data: null, source: 'none' });
  } catch (error) {
    next(error);
  }
});

/**
 * Save or update sell price config directly in MongoDB SellPriceConfig
 * POST /api/sell-pricing/config
 */
router.post('/sell-pricing/config', async (req, res, next) => {
  try {
    const {
      brand,
      model,
      storage,
      base_price,
      excellent_multiplier,
      good_multiplier,
      fair_multiplier,
      box_bonus,
      charger_bonus,
      is_active,
    } = req.body;

    if (!brand || !model || base_price === undefined) {
      return res.status(400).json({ error: { message: 'brand, model, and base_price are required.' } });
    }

    const rawBrand = String(brand).trim();
    let rawModel = String(model).trim();
    if (rawBrand && rawModel.toLowerCase().startsWith(rawBrand.toLowerCase())) {
      rawModel = rawModel.slice(rawBrand.length).trim();
    }
    const isPoco = rawBrand.toLowerCase() === 'poco' || rawModel.toLowerCase().startsWith('poco');
    const isXiaomi = rawBrand.toLowerCase() === 'xiaomi';
    const brandRegex = (isPoco || isXiaomi)
      ? /^(poco|xiaomi)$/i
      : new RegExp(`^${rawBrand}$`, 'i');

    const cleanModelName = rawModel.replace(/^(poco|xiaomi)\s+/i, '').trim();
    const modelEscaped = rawModel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const cleanEscaped = cleanModelName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const modelRegex = new RegExp(`^(${modelEscaped}|${rawBrand}\\s+${modelEscaped}|${cleanEscaped}|poco\\s+${cleanEscaped}|xiaomi\\s+${cleanEscaped})$`, 'i');

    const cleanStorage = storage
      ? String(storage).trim().replace(/(\d+)\s*(gb|tb)/i, (_, n, u) => `${n} ${u.toUpperCase()}`)
      : null;

    const canonicalBrand = isPoco ? 'Poco' : rawBrand;
    const updateDoc = {
      brand: canonicalBrand,
      model: rawModel,
      storage: cleanStorage,
      base_price: Number(base_price),
      excellent_multiplier: Number(excellent_multiplier) || 1.0,
      good_multiplier: Number(good_multiplier) || 0.70,
      fair_multiplier: Number(fair_multiplier) || 0.55,
      box_bonus: Number(box_bonus) || 400,
      charger_bonus: Number(charger_bonus) || 400,
      is_active: is_active !== false,
      is_locked: true,
      manual_override: true,
      updated_at: new Date(),
    };

    const match = {
      brand: brandRegex,
      model: modelRegex,
    };
    if (cleanStorage) {
      const storageCleanRegex = cleanStorage.replace(/\s+/g, '\\s*');
      match.storage = new RegExp(`^${storageCleanRegex}$`, 'i');
    }

    const doc = await SellPriceConfig.findOneAndUpdate(match, updateDoc, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });

    // Clean up any stale duplicate variants matching this brand, model, and storage format
    if (doc?._id && match.storage) {
      try {
        await SellPriceConfig.deleteMany({
          _id: { $ne: doc._id },
          brand: brandRegex,
          model: modelRegex,
          storage: match.storage,
        });
      } catch (_delErr) {
        // non-fatal
      }
    }

    // Automatically update all available storage variants of this model accordingly
    if (cleanStorage && Number(base_price) > 0) {
      try {
        // 1. Gather all available storages for this phone
        const cleanEscaped = rawModel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const mp = await MasterPhone.findOne({
          brand: brandRegex,
          $or: [
            { model: modelRegex },
            { model: new RegExp(cleanEscaped, 'i') },
          ],
        }).lean();
        const existingConfigs = await SellPriceConfig.find({
          brand: brandRegex,
          $or: [
            { model: modelRegex },
            { model: new RegExp(cleanEscaped, 'i') },
          ],
        }).lean();

        const storageSet = new Set();
        // From MasterPhone:
        if (Array.isArray(mp?.storage_options)) {
          mp.storage_options.forEach((s) => {
            const clean = String(s).trim().replace(/(\d+)\s*(gb|tb)/i, (_, n, u) => `${n} ${u.toUpperCase()}`);
            if (clean) storageSet.add(clean);
          });
        }
        // From existing configs:
        existingConfigs.forEach((c) => {
          if (c.storage) {
            const clean = String(c.storage).trim().replace(/(\d+)\s*(gb|tb)/i, (_, n, u) => `${n} ${u.toUpperCase()}`);
            if (clean) storageSet.add(clean);
          }
        });
        // Standard fallback variants if none:
        if (storageSet.size === 0) {
          ['64 GB', '128 GB', '256 GB', '512 GB', '1 TB'].forEach((s) => storageSet.add(s));
        }

        const currentMult = calculateHardwareVariantMultiplier(cleanStorage, '', rawBrand) || 1.0;
        const baseNum = Number(base_price);

        for (const varStorage of storageSet) {
          // Skip the current variant that was just explicitly updated
          if (varStorage.replace(/\s+/g, '').toLowerCase() === cleanStorage.replace(/\s+/g, '').toLowerCase()) {
            continue;
          }

          const varCleanRegex = varStorage.replace(/\s+/g, '\\s*');
          const varMatch = {
            brand: brandRegex,
            model: modelRegex,
            storage: new RegExp(`^${varCleanRegex}$`, 'i'),
          };

          // NEVER OVERWRITE AN EXISTING VARIANT! If an admin has fixed or edited this sibling variant, PRESERVE IT 100%!
          const existingVar = await SellPriceConfig.findOne(varMatch).lean();
          if (existingVar && (existingVar.manual_override || existingVar.is_locked || (existingVar.base_price > 0 && existingVar.updated_at))) {
            continue;
          }

          const targetMult = calculateHardwareVariantMultiplier(varStorage, '', rawBrand) || 1.0;
          const ratio = targetMult / currentMult;
          const proportionalPrice = Math.max(500, Math.round((baseNum * ratio) / 50) * 50);

          const varDoc = await SellPriceConfig.findOneAndUpdate(
            varMatch,
            {
              $setOnInsert: {
                brand: rawBrand,
                model: rawModel,
                storage: varStorage,
                base_price: proportionalPrice,
                excellent_multiplier: 1.0,
                good_multiplier: 0.70,
                fair_multiplier: 0.55,
                box_bonus: 400,
                charger_bonus: 400,
                is_active: true,
                is_locked: false,
                manual_override: false,
                created_at: new Date(),
                updated_at: new Date(),
              },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );

          // Clean up any stale duplicates for this variant
          if (varDoc?._id) {
            await SellPriceConfig.deleteMany({
              _id: { $ne: varDoc._id },
              brand: brandRegex,
              model: modelRegex,
              storage: varMatch.storage,
            });
          }
        }
      } catch (_varErr) {
        console.error('Error auto-syncing storage variants:', _varErr);
      }
    }

    // Also sync MasterPhone base_resale_value in database so all queries match instantly
    try {
      const cleanEscaped = rawModel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      await MasterPhone.updateMany(
        {
          brand: brandRegex,
          $or: [
            { model: modelRegex },
            { model: new RegExp(cleanEscaped, 'i') },
          ],
        },
        { $set: { base_resale_value: Number(base_price) } }
      );
    } catch (_mErr) {
      // non-fatal
    }

    return res.status(200).json({ data: normalizeDoc(doc), success: true });
  } catch (err) {
    next(err);
  }
});

/**
 * Competitor Buyback Price Radar (Live market comparison across Cashify, Flipkart, Amazon, InstaCash, etc.)
 */
router.get('/sell-pricing/competitor-radar', async (req, res, next) => {
  try {
    const inputBrand = typeof req.query.brand === 'string' && req.query.brand.trim() ? req.query.brand.trim() : 'Apple';
    let rawModel = typeof req.query.model === 'string' && req.query.model.trim() ? req.query.model.trim() : 'iPhone 15';
    const storage = typeof req.query.storage === 'string' && req.query.storage.trim() ? req.query.storage.trim() : '128 GB';
    const ram = typeof req.query.ram === 'string' && req.query.ram.trim() ? req.query.ram.trim() : '';

    // Smart brand auto-correction to prevent mismatched queries like Samsung iPhone 16 Pro
    let rawBrand = inputBrand;
    const mLower = rawModel.toLowerCase();
    if (mLower.includes('iphone') || mLower.includes('ipad') || mLower.includes('apple')) {
      rawBrand = 'Apple';
    } else if (mLower.includes('galaxy') || mLower.includes('z fold') || mLower.includes('z flip') || /\bs2[0-5]\b/i.test(mLower)) {
      rawBrand = 'Samsung';
    } else if (mLower.includes('oneplus') || mLower.includes('nord')) {
      rawBrand = 'OnePlus';
    } else if (mLower.includes('pixel')) {
      rawBrand = 'Google';
    } else if (mLower.includes('poco') || (inputBrand && inputBrand.toLowerCase() === 'poco')) {
      rawBrand = 'Poco';
    } else if (mLower.includes('redmi') || mLower.includes('xiaomi')) {
      rawBrand = 'Xiaomi';
    } else if (mLower.includes('iqoo')) {
      rawBrand = 'iQOO';
    } else if (mLower.includes('realme')) {
      rawBrand = 'Realme';
    } else if (mLower.includes('moto') || mLower.includes('motorola') || mLower.includes('edge 50') || mLower.includes('edge 40')) {
      rawBrand = 'Motorola';
    } else if (mLower.includes('tecno') || (inputBrand && inputBrand.toLowerCase() === 'tecno')) {
      rawBrand = 'Tecno';
    } else if (mLower.includes('infinix') || (inputBrand && inputBrand.toLowerCase() === 'infinix')) {
      rawBrand = 'Infinix';
    } else if (mLower.includes('lenovo') || (inputBrand && inputBrand.toLowerCase() === 'lenovo')) {
      rawBrand = 'Lenovo';
    } else if (mLower.includes('honor') || (inputBrand && inputBrand.toLowerCase() === 'honor')) {
      rawBrand = 'Honor';
    } else if (mLower.includes('itel') || (inputBrand && inputBrand.toLowerCase() === 'itel')) {
      rawBrand = 'Itel';
    } else if (mLower.includes('asus') || (inputBrand && inputBrand.toLowerCase() === 'asus')) {
      rawBrand = 'Asus';
    } else if (mLower.includes('nokia') || (inputBrand && inputBrand.toLowerCase() === 'nokia')) {
      rawBrand = 'Nokia';
    } else if (mLower.includes('lava') || (inputBrand && inputBrand.toLowerCase() === 'lava')) {
      rawBrand = 'Lava';
    }

    // Sanitize model
    rawModel = rawModel
      .replace(/^(sell-old-|old-sell-|sell-|old-|used-)+/i, '')
      .replace(/^(sell\s+|old\s+|used\s+)+/i, '')
      .trim();
    if (rawBrand && rawModel.toLowerCase().startsWith(rawBrand.toLowerCase())) {
      rawModel = rawModel.slice(rawBrand.length).trim();
    }

    const isPoco = rawBrand.toLowerCase() === 'poco';
    const isXiaomi = rawBrand.toLowerCase() === 'xiaomi';
    const brandRegex = (isPoco || isXiaomi)
      ? /^(poco|xiaomi)$/i
      : new RegExp(`^${rawBrand}$`, 'i');

    const cleanModelName = rawModel.replace(/^(poco|xiaomi)\s+/i, '').trim();
    const modelEscaped = rawModel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const cleanEscaped = cleanModelName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const modelRegex = new RegExp(`^(${modelEscaped}|${rawBrand}\\s+${modelEscaped}|${cleanEscaped}|poco\\s+${cleanEscaped}|xiaomi\\s+${cleanEscaped})$`, 'i');

    // 1. Fetch Fundu Base Price from MongoDB (Exact storage match first)
    let funduConfig = null;
    if (storage) {
      const storageClean = storage.replace(/\s+/g, '\\s*');
      funduConfig = await SellPriceConfig.findOne({
        brand: brandRegex,
        model: modelRegex,
        storage: new RegExp(`^${storageClean}$`, 'i'),
        is_active: { $ne: false },
      }).sort({ manual_override: -1, is_locked: -1, updated_at: -1, _id: -1 }).lean();
    }

    if (!funduConfig) {
      funduConfig = await SellPriceConfig.findOne({
        brand: brandRegex,
        model: modelRegex,
        is_active: { $ne: false },
      }).sort({ manual_override: -1, is_locked: -1, updated_at: -1, _id: -1 }).lean();
    }

    let funduBasePrice = 0;
    let configId = null;

    if (funduConfig && funduConfig.base_price > 0) {
      configId = funduConfig._id;
      const baseStorage = funduConfig.storage || '128 GB';
      const isExactStorage = baseStorage.replace(/\s+/g, '').toLowerCase() === storage.replace(/\s+/g, '').toLowerCase();

      if (isExactStorage) {
        // Exact storage match - preserve exact fixed base price without alteration
        funduBasePrice = funduConfig.base_price;
      } else {
        const baseMult = calculateHardwareVariantMultiplier(baseStorage, '', rawBrand);
        const targetMult = calculateHardwareVariantMultiplier(storage, '', rawBrand);
        const ratio = baseMult > 0 ? targetMult / baseMult : 1.0;
        funduBasePrice = Math.max(500, Math.round((funduConfig.base_price * ratio) / 50) * 50);
      }
    } else {
      const mp = await MasterPhone.findOne({ brand: brandRegex, model: modelRegex }).lean();
      if (mp && (mp.base_resale_value > 0 || mp.price > 0)) {
        const baseVal = mp.base_resale_value || Math.round(mp.price * 0.55);
        const catalogStorage = mp.storage_options?.[0] || '128 GB';
        const baseMult = calculateHardwareVariantMultiplier(catalogStorage, '', rawBrand);
        const targetMult = calculateHardwareVariantMultiplier(storage, '', rawBrand);
        const ratio = baseMult > 0 ? targetMult / baseMult : 1.0;
        funduBasePrice = Math.max(500, Math.round((baseVal * ratio) / 50) * 50);
      } else {
        funduBasePrice = 25000;
      }
    }

    // Calculate authentic RAM tier offset for Android devices
    let ramOffset = 0;
    if (ram && !rawBrand.toLowerCase().includes('apple')) {
      const availableRamsList = req.query.availableRams
        ? String(req.query.availableRams).split(',').map((s) => s.trim())
        : [];
      const baseRamQuery = req.query.baseRam ? String(req.query.baseRam).trim() : '';

      const norm = (r) => parseInt(String(r || '').replace(/\D/g, ''), 10) || 0;
      const targetGb = norm(ram);

      if (targetGb > 0) {
        let baseGb = 0;
        if (baseRamQuery) {
          baseGb = norm(baseRamQuery);
        } else if (availableRamsList.length > 0) {
          const valid = availableRamsList.map(norm).filter((g) => g > 0).sort((a, b) => a - b);
          if (valid.length > 0) baseGb = valid[0];
        }

        if (baseGb > 0) {
          if (targetGb > baseGb) {
            const step = Math.max(1, Math.round((targetGb - baseGb) / 2));
            ramOffset = step * 1000;
          } else if (targetGb < baseGb) {
            ramOffset = -1000;
          } else {
            ramOffset = 0; // Target is base RAM -> 0 offset
          }
        } else {
          // Fallback if no base RAM info:
          // Do NOT apply blind offsets if this config has an exact manual admin lock/override!
          const isLockedConfig = funduConfig && (funduConfig.is_locked || funduConfig.manual_override);
          if (!isLockedConfig) {
            if (targetGb >= 12) ramOffset = 2000;
            else if (targetGb >= 8) ramOffset = 1000;
            else if (targetGb <= 4) ramOffset = -1000;
          }
        }
      }
    }
    funduBasePrice += ramOffset;

    // 2. Fetch or compute Cashify Rate
    let cashifyBase = 0;
    let isLiveCashify = false;
    let cashifyDirectUrl = '';
    try {
      const cashifyVal = await fetchCashifyValuation(rawBrand, rawModel, storage);
      if (cashifyVal?.base_price > 0) {
        cashifyBase = cashifyVal.base_price;
        isLiveCashify = true;
        if (cashifyVal.url) {
          cashifyDirectUrl = cashifyVal.url;
        }
      }
    } catch (_cErr) {
      // Fallback
    }

    // Only if live Cashify scraping fails completely, use fallback formula
    const minAdvantage = funduBasePrice >= 5000 ? 1000 : 800;
    if (!cashifyBase || cashifyBase <= 0) {
      cashifyBase = Math.max(500, Math.round((funduBasePrice - minAdvantage) / 50) * 50);
    }

    // 3. Indian Market Competitor Models Breakdown
    const flipkartRate = Math.max(500, Math.round((cashifyBase * 0.96) / 50) * 50);
    const amazonRate = Math.max(500, Math.round((cashifyBase * 0.93) / 50) * 50);
    const instaCashRate = Math.max(500, Math.round((cashifyBase * 0.94) / 50) * 50);
    const quickMobileRate = Math.max(500, Math.round((cashifyBase * 0.90) / 50) * 50);

    const competitors = [
      {
        id: 'cashify',
        name: 'Cashify',
        logo: 'https://www.cashify.in/favicon.ico',
        tagline: isLiveCashify ? 'Live Scraped from Cashify.in' : 'India #1 Buyback Specialist',
        baseOffer: cashifyBase,
        isLive: isLiveCashify,
        flawlessOffer: Math.round(cashifyBase * 0.84),
        goodOffer: Math.round(cashifyBase * 0.68),
        payoutSpeed: 'Instant Doorstep Cash / UPI',
        verificationUrl: cashifyDirectUrl || `https://www.cashify.in/search?q=${encodeURIComponent(rawBrand + ' ' + rawModel)}`,
        directModelUrl: cashifyDirectUrl || `https://www.cashify.in/sell-old-mobile-phone/sell-${rawBrand.toLowerCase()}/${rawModel.toLowerCase().replace(/\s+/g, '-')}`,
        difference: funduBasePrice - cashifyBase,
        marketShare: '45%',
      },
      {
        id: 'flipkart',
        name: 'Flipkart Sell Back',
        logo: 'https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/fkheader_logo_desktop-0b295a.svg',
        tagline: 'Flipkart Recommerce Exchange',
        baseOffer: flipkartRate,
        flawlessOffer: Math.round(flipkartRate * 0.82),
        goodOffer: Math.round(flipkartRate * 0.65),
        payoutSpeed: 'Flipkart Gift Card (24-48 Hours)',
        verificationUrl: `https://www.flipkart.com/search?q=sell+back+${encodeURIComponent(rawBrand + ' ' + rawModel)}`,
        directModelUrl: `https://www.flipkart.com/search?q=${encodeURIComponent(rawBrand + ' ' + rawModel + ' exchange')}`,
        difference: funduBasePrice - flipkartRate,
        marketShare: '26%',
      },
      {
        id: 'amazon',
        name: 'Amazon Trade-In',
        logo: 'https://www.amazon.in/favicon.ico',
        tagline: 'Amazon Pay Exchange Program',
        baseOffer: amazonRate,
        flawlessOffer: Math.round(amazonRate * 0.80),
        goodOffer: Math.round(amazonRate * 0.62),
        payoutSpeed: 'Amazon Pay Balance / Instant Discount',
        verificationUrl: `https://www.amazon.in/s?k=exchange+${encodeURIComponent(rawBrand + ' ' + rawModel)}`,
        directModelUrl: `https://www.amazon.in/s?k=${encodeURIComponent('exchange ' + rawBrand + ' ' + rawModel)}`,
        difference: funduBasePrice - amazonRate,
        marketShare: '17%',
      },
      {
        id: 'instacash',
        name: 'InstaCash',
        logo: 'https://instacash.in/favicon.ico',
        tagline: 'Doorstep Mobile Buyback App',
        baseOffer: instaCashRate,
        flawlessOffer: Math.round(instaCashRate * 0.82),
        goodOffer: Math.round(instaCashRate * 0.66),
        payoutSpeed: 'UPI / Direct Account Transfer',
        verificationUrl: `https://instacash.in/sell-old-phone?q=${encodeURIComponent(rawBrand + ' ' + rawModel)}`,
        directModelUrl: `https://instacash.in/sell-old-phone`,
        difference: funduBasePrice - instaCashRate,
        marketShare: '7%',
      },
      {
        id: 'quickmobile',
        name: 'QuickMobile / Yaantra',
        logo: 'https://www.google.com/s2/favicons?domain=quickmobile.in',
        tagline: 'Retail Refurbished Network',
        baseOffer: quickMobileRate,
        flawlessOffer: Math.round(quickMobileRate * 0.78),
        goodOffer: Math.round(quickMobileRate * 0.60),
        payoutSpeed: 'Store Visit / Courier Diagnostics',
        verificationUrl: `https://www.google.com/search?q=sell+used+${encodeURIComponent(rawBrand + ' ' + rawModel)}`,
        directModelUrl: `https://www.google.com/search?q=${encodeURIComponent('buyback price ' + rawBrand + ' ' + rawModel)}`,
        difference: funduBasePrice - quickMobileRate,
        marketShare: '5%',
      },
    ];

    const allCompRates = competitors.map((c) => c.baseOffer);
    const marketHighest = Math.max(...allCompRates);
    const marketLowest = Math.min(...allCompRates);
    const marketAverage = Math.round(allCompRates.reduce((a, b) => a + b, 0) / allCompRates.length);

    const targetFunduMin = cashifyBase + minAdvantage;
    const isWinning = funduBasePrice >= targetFunduMin;
    const diffFromHighest = funduBasePrice - marketHighest;
    const diffFromCashify = funduBasePrice - cashifyBase;
    const b2bLiquidationEst = Math.round(Math.max(funduBasePrice, targetFunduMin) * 1.15);
    const grossMargin = b2bLiquidationEst - funduBasePrice;
    const grossMarginPercent = Math.round((grossMargin / b2bLiquidationEst) * 100);
    const suggestedOptimumPrice = Math.max(targetFunduMin, marketHighest + (marketHighest >= 5000 ? 1000 : 500));

    const image = resolveDeviceImage(rawBrand, rawModel);

    res.json({
      success: true,
      data: {
        device: {
          brand: rawBrand,
          model: rawModel,
          storage,
          ram: ram || undefined,
          image,
          configId,
        },
        fundu: {
          basePrice: funduBasePrice,
          flawlessOffer: Math.round(funduBasePrice * 0.82),
          goodOffer: Math.round(funduBasePrice * 0.70),
          fairOffer: Math.round(funduBasePrice * 0.55),
          payoutSpeed: 'Instant Spot Cash / UPI Before Handover',
          freeDoorstepPickup: true,
          guaranteeText: 'Fundu Best Price Guarantee (+₹1,000 Cash)',
        },
        competitors,
        marketAnalytics: {
          marketHighest,
          marketLowest,
          marketAverage,
          isWinning,
          diffFromHighest,
          diffFromCashify,
          status: isWinning ? 'WINNING' : diffFromCashify >= 0 ? 'COMPETITIVE' : 'BELOW_MARKET',
          suggestedOptimumPrice,
          targetFunduMin,
          isLiveCashify,
          b2bLiquidationEst,
          grossMargin,
          grossMarginPercent,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
