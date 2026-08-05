import { Router } from 'express';
import { SellPriceConfig } from '../models/index.js';
import { createHttpError } from '../utils/error.js';
import { normalizeDoc } from '../utils/dbHelpers.js';
import {
  DEFAULT_PHONE_BRANDS,
  extractStorageOptions,
  getCachedValue,
  mobileApiRequest,
  setCachedValue,
} from '../utils/mobileApi.js';
import { seedDatabase } from '../config/db.js';

const router = Router();

const FALLBACK_MODELS = {
  apple: [
    { name: 'iPhone 15 Pro Max', storages: ['256GB', '512GB', '1TB'] },
    { name: 'iPhone 15 Pro', storages: ['128GB', '256GB', '512GB'] },
    { name: 'iPhone 15', storages: ['128GB', '256GB', '512GB'] },
    { name: 'iPhone 14 Pro', storages: ['128GB', '256GB', '512GB'] },
    { name: 'iPhone 14', storages: ['128GB', '256GB'] },
    { name: 'iPhone 13', storages: ['128GB', '256GB', '512GB'] },
    { name: 'iPhone 12', storages: ['64GB', '128GB', '256GB'] },
    { name: 'iPhone 11', storages: ['64GB', '128GB'] },
  ],
  samsung: [
    { name: 'Galaxy S24 Ultra', storages: ['256GB', '512GB', '1TB'] },
    { name: 'Galaxy S23 5G', storages: ['128GB', '256GB'] },
    { name: 'Galaxy S22 5G', storages: ['128GB', '256GB'] },
    { name: 'Galaxy A54 5G', storages: ['128GB', '256GB'] },
    { name: 'Galaxy M34 5G', storages: ['128GB'] },
  ],
  oneplus: [
    { name: 'OnePlus 12', storages: ['256GB', '512GB'] },
    { name: 'OnePlus 11 5G', storages: ['128GB', '256GB'] },
    { name: 'OnePlus 10 Pro', storages: ['128GB', '256GB'] },
    { name: 'OnePlus Nord 3 5G', storages: ['128GB', '256GB'] },
  ],
  xiaomi: [
    { name: 'Xiaomi 14', storages: ['256GB', '512GB'] },
    { name: 'Redmi Note 13 Pro+ 5G', storages: ['256GB', '512GB'] },
    { name: 'Redmi Note 13 Pro 5G', storages: ['128GB', '256GB'] },
    { name: 'Poco X6 Pro', storages: ['256GB', '512GB'] },
  ],
  vivo: [
    { name: 'Vivo V30 Pro', storages: ['256GB', '512GB'] },
    { name: 'Vivo V29 5G', storages: ['128GB', '256GB'] },
    { name: 'Vivo Y200 5G', storages: ['128GB', '256GB'] },
  ],
  oppo: [
    { name: 'Oppo Reno 11 Pro 5G', storages: ['256GB'] },
    { name: 'Oppo F25 Pro 5G', storages: ['128GB', '256GB'] },
  ],
  realme: [
    { name: 'Realme 12 Pro+ 5G', storages: ['128GB', '256GB'] },
    { name: 'Realme GT 5 Pro', storages: ['256GB', '512GB'] },
  ],
  google: [
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
    { name: 'Moto Edge 40 Neo', storages: ['128GB', '256GB'] },
    { name: 'Moto G84 5G', storages: ['256GB'] },
  ],
};

function getFallbackModels(brand, query) {
  const list = FALLBACK_MODELS[brand.toLowerCase()] ?? [
    { name: `${brand} Model 1`, storages: ['128GB', '256GB'] },
    { name: `${brand} Model 2`, storages: ['128GB', '256GB'] },
  ];

  if (!query) return list;
  return list.filter((m) => m.name.toLowerCase().includes(query.toLowerCase()));
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

    res.json({ data: setCachedValue(cacheKey, DEFAULT_PHONE_BRANDS) });
  } catch (error) {
    next(error);
  }
});

router.get('/mobile/models', async (req, res) => {
  const brand = typeof req.query.brand === 'string' ? req.query.brand.trim() : '';
  const query = typeof req.query.query === 'string' ? req.query.query.trim() : '';

  if (!brand) {
    res.status(400).json({ error: 'brand is required.' });
    return;
  }

  const searchQuery = query.length >= 2 ? query : brand;
  const cacheKey = `model-search:${brand.toLowerCase()}:${searchQuery.toLowerCase()}`;
  const cached = getCachedValue(cacheKey, 1000 * 60 * 60 * 12);

  if (cached) {
    res.json({ data: cached });
    return;
  }

  try {
    const payload = await mobileApiRequest('/devices/search/', {
      name: searchQuery,
      manufacturer: brand,
      page: 1,
    });

    const modelMap = new Map();

    (payload.devices ?? [])
      .filter((device) => String(device.device_type || '').toLowerCase() === 'phone')
      .forEach((device) => {
        const modelName = String(device.name || '').trim();
        if (!modelName) return;

        const existing = modelMap.get(modelName) ?? { name: modelName, storages: new Set() };
        extractStorageOptions(device).forEach((storage) => existing.storages.add(storage));
        modelMap.set(modelName, existing);
      });

    const models = Array.from(modelMap.values())
      .map((entry) => ({
        name: entry.name,
        storages: Array.from(entry.storages),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    if (models.length === 0) {
      const fallback = getFallbackModels(brand, query);
      res.json({ data: fallback });
      return;
    }

    setCachedValue(cacheKey, models);
    res.json({ data: models });
  } catch (_err) {
    // If mobile API returns 429 rate limit or fails, return fallback models seamlessly!
    const fallback = getFallbackModels(brand, query);
    setCachedValue(cacheKey, fallback);
    res.json({ data: fallback });
  }
});

router.get('/sell-pricing/config', async (req, res, next) => {
  try {
    const brand = typeof req.query.brand === 'string' ? req.query.brand.trim() : '';
    const model = typeof req.query.model === 'string' ? req.query.model.trim() : '';
    const storage = typeof req.query.storage === 'string' ? req.query.storage.trim() : '';

    if (!brand || !model) {
      throw createHttpError(400, 'brand and model are required.');
    }

    let config = null;

    if (storage) {
      config = await SellPriceConfig.findOne({
        brand,
        model,
        storage,
        is_active: true,
      });
    }

    if (!config) {
      config = await SellPriceConfig.findOne({
        brand,
        model,
        storage: null,
        is_active: true,
      });
    }

    res.json({ data: normalizeDoc(config) });
  } catch (error) {
    next(error);
  }
});

export default router;
