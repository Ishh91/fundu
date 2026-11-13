import { Router } from 'express';
import mongoose from 'mongoose';
import { MasterPhone, SellPriceConfig, SellRequest as SellRequestModel } from '../models/index.js';
import { normalizeDoc } from '../utils/dbHelpers.js';
import { clearTableCache } from './dbRoutes.js';
import { buildLiveImagesResponse, getLiveImages, invalidateLiveImages } from '../utils/liveImagesCache.js';
import { INDIAN_MARKET_PHONES_LAST_10_YEARS, ensureMasterPhonesSeeded } from '../config/seedPhones.js';
import { isBlockedPhone } from '../utils/blockedModels.js';
import {
  extractStorageOptions,
  extractRamOptions,
  formatMobileApiDevice,
  fetchMobileApiSearch,
  fetchMobileApiAutocomplete,
  fetchMobileApiDeviceById,
} from '../utils/mobileApi.js';

const router = Router();


/**
 * Universal Indian Smartphones Search API
 * GET /api/phones/search?query=iphone&brand=Apple&limit=30
 */
router.get('/search', async (req, res) => {
  try {
    const { query = '', brand = '', limit = '50', fetch_remote = 'true' } = req.query;
    const maxResults = Math.min(Number(limit) || 50, 100);

    const filter = { is_active: { $ne: false } };
    if (brand && brand !== 'All') {
      filter.brand = new RegExp(`^${brand.trim()}$`, 'i');
    }
    if (query && query.trim()) {
      const q = query.trim();
      const flexPattern = q.split(/\s+/).map((part) => part.replace(/[^a-zA-Z0-9]/g, '')).filter(Boolean).join('\\s*');
      const searchRegex = new RegExp(flexPattern || q, 'i');
      filter.$or = [
        { model: searchRegex },
        { brand: new RegExp(q, 'i') },
        { popular_tag: new RegExp(q, 'i') },
        { processor: new RegExp(q, 'i') },
      ];
    }

    let phones = await MasterPhone.find(filter)
      .sort({ release_year: -1, base_resale_value: -1 })
      .limit(maxResults);

    // If local DB or memory catalog matches
    let results = normalizeDoc(phones).filter((p) => p.is_active !== false && !isBlockedPhone(p.brand, p.model));

    if (results.length === 0) {
      let filtered = INDIAN_MARKET_PHONES_LAST_10_YEARS.filter((p) => p.is_active !== false && !isBlockedPhone(p.brand, p.model));
      if (brand && brand !== 'All') {
        filtered = filtered.filter((p) => p.brand.toLowerCase() === brand.toLowerCase());
      }
      if (query && query.trim()) {
        const q = query.toLowerCase().trim();
        filtered = filtered.filter((p) => `${p.brand} ${p.model} ${p.release_year}`.toLowerCase().includes(q));
      }
      results = filtered;
    }

    // If still no results and user provided a query, query https://mobileapi.dev live!
    if (results.length === 0 && query && fetch_remote !== 'false') {
      const searchRes = await fetchMobileApiSearch(query, brand, 1);
      const remoteDevices = (searchRes.devices || []).filter((p) => !isBlockedPhone(p.brand || brand, p.model || p.name));
      if (remoteDevices.length > 0) {
        return res.json({
          data: remoteDevices.slice(0, maxResults),
          total: remoteDevices.length,
          source: 'https://mobileapi.dev/',
        });
      }
    }

    return res.json({
      data: results.slice(0, maxResults),
      total: results.length,
      source: phones.length > 0 ? 'database' : 'indian_catalog',
    });
  } catch (error) {
    return res.status(500).json({ error: { message: error.message } });
  }
});

/**
 * Live Autocomplete on https://mobileapi.dev/
 * GET /api/phones/mobileapi/autocomplete?q=iPhone
 */
router.get('/mobileapi/autocomplete', async (req, res) => {
  try {
    const { q = '', limit = '10' } = req.query;
    if (!q || String(q).trim().length < 2) {
      return res.json({ data: [], count: 0 });
    }

    const suggestions = await fetchMobileApiAutocomplete(String(q).trim(), Math.min(Number(limit) || 10, 50));
    return res.json({
      data: suggestions,
      count: suggestions.length,
      provider: 'https://mobileapi.dev/',
    });
  } catch (error) {
    return res.status(500).json({ error: { message: error.message } });
  }
});

/**
 * Direct search on https://mobileapi.dev/
 * GET /api/phones/mobileapi/search?query=Galaxy+S24&brand=Samsung&page=1
 */
router.get('/mobileapi/search', async (req, res) => {
  try {
    const { query = '', brand = '', page = '1' } = req.query;
    if (!query && !brand) {
      return res.status(400).json({ error: { message: 'query or brand parameter required' } });
    }

    const searchRes = await fetchMobileApiSearch(query || brand, brand, Math.max(Number(page) || 1, 1));
    const devices = (searchRes.devices || []).filter((p) => !isBlockedPhone(p.brand || brand, p.model || p.name));

    return res.json({
      data: devices,
      total: devices.length,
      page: searchRes.page || 1,
      provider: 'https://mobileapi.dev/',
    });
  } catch (error) {
    return res.status(500).json({ error: { message: error.message } });
  }
});


/**
 * 1-Click Import a phone from https://mobileapi.dev into Fundu's database
 * POST /api/phones/mobileapi/import
 */
router.post('/mobileapi/import', async (req, res) => {
  try {
    const body = req.body;
    if (!body.brand || !body.model) {
      return res.status(400).json({ error: { message: 'brand and model required' } });
    }

    const payload = {
      brand: body.brand.trim(),
      model: body.model.trim(),
      release_year: Number(body.release_year) || 2024,
      ram_options: Array.isArray(body.ram_options) ? body.ram_options : ['8GB', '12GB'],
      storage_options: Array.isArray(body.storage_options) ? body.storage_options : ['128GB', '256GB'],
      default_mrp: Number(body.default_mrp) || 39999,
      base_resale_value: Number(body.base_resale_value) || 22000,
      popular_tag: body.popular_tag || `${body.brand} 5G Device`,
      processor: body.processor || 'Octa-core Processor',
      camera_spec: body.camera_spec || '50MP OIS Camera',
      battery_spec: body.battery_spec || '5000 mAh Fast Charging',
      display_spec: body.display_spec || '6.7" AMOLED 120Hz',
      image_url: body.image_url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
      is_5g: body.is_5g !== false,
      is_active: true,
    };

    const doc = await MasterPhone.findOneAndUpdate(
      { brand: payload.brand, model: payload.model },
      { $set: payload },
      { upsert: true, new: true }
    );

    // Also create sell price config rule if not exists
    for (const stg of payload.storage_options) {
      let baseVal = payload.base_resale_value;
      if (stg.includes('256')) baseVal = Math.round(baseVal * 1.08);
      else if (stg.includes('512') || stg.includes('1TB')) baseVal = Math.round(baseVal * 1.18);

      // Never overwrite manually fixed or locked radar prices
      const existingConfig = await SellPriceConfig.findOne({ brand: payload.brand, model: payload.model, storage: stg });
      if (existingConfig && (existingConfig.is_locked || existingConfig.manual_override)) {
        continue;
      }

      await SellPriceConfig.findOneAndUpdate(
        { brand: payload.brand, model: payload.model, storage: stg },
        {
          $set: {
            brand: payload.brand,
            model: payload.model,
            storage: stg,
            base_price: baseVal,
            excellent_multiplier: 0.80,
            good_multiplier: 0.65,
            fair_multiplier: 0.50,
            box_bonus: 600,
            charger_bonus: 400,
            is_active: true,
          },
        },
        { upsert: true }
      );
    }

    return res.json({
      data: normalizeDoc(doc),
      message: `Successfully imported "${payload.brand} ${payload.model}" from MobileAPI.dev into Fundu database!`,
    });
  } catch (error) {
    return res.status(500).json({ error: { message: error.message } });
  }
});

/**
 * Get all Indian smartphone models
 * GET /api/phones/all
 */
router.get('/all', async (_req, res) => {
  try {
    const phones = await MasterPhone.find({ is_active: { $ne: false } }).sort({ release_year: -1, brand: 1 });
    if (phones.length > 0) {
      const activeList = normalizeDoc(phones).filter((p) => p.is_active !== false && !isBlockedPhone(p.brand, p.model));
      return res.json({ data: activeList, count: activeList.length });
    }
    const fallbackList = INDIAN_MARKET_PHONES_LAST_10_YEARS.filter((p) => p.is_active !== false && !isBlockedPhone(p.brand, p.model));
    return res.json({ data: fallbackList, count: fallbackList.length });
  } catch (error) {
    return res.status(500).json({ error: { message: error.message } });
  }
});

/**
 * Get specs for a specific smartphone
 * GET /api/phones/specs?brand=Samsung&model=Galaxy S24 Ultra
 */
router.get('/specs', async (req, res) => {
  try {
    const { brand, model } = req.query;
    if (!brand || !model) {
      return res.status(400).json({ error: { message: 'brand and model parameters required' } });
    }

    if (isBlockedPhone(brand, model)) {
      return res.status(404).json({ error: { message: 'Model discontinued or removed from catalog' } });
    }

    let phone = await MasterPhone.findOne({
      brand: new RegExp(`^${brand.trim()}$`, 'i'),
      model: new RegExp(`^${model.trim()}$`, 'i'),
      is_active: { $ne: false },
    });

    if (!phone) {
      phone = INDIAN_MARKET_PHONES_LAST_10_YEARS.find(
        (p) => p.brand.toLowerCase() === brand.toLowerCase() && p.model.toLowerCase() === model.toLowerCase()
      );
    }

    if (!phone) {
      // Try searching mobileapi.dev live
      const searchRes = await fetchMobileApiSearch(model, brand);
      if (searchRes.devices && searchRes.devices.length > 0) {
        phone = searchRes.devices[0];
      }
    }

    if (!phone) {
      phone = {
        brand,
        model,
        release_year: 2024,
        ram_options: ['8GB', '12GB'],
        storage_options: ['128GB', '256GB', '512GB'],
        default_mrp: 34999,
        base_resale_value: 18000,
        popular_tag: 'Indian 5G Smartphone',
        processor: 'High-performance Octa-core 5G',
        camera_spec: '50MP AI Triple Camera with OIS',
        battery_spec: '5000 mAh Fast Charging',
        display_spec: '6.7" AMOLED 120Hz FHD+',
        is_5g: true,
      };
    }

    return res.json({ data: normalizeDoc(phone) });
  } catch (error) {
    return res.status(500).json({ error: { message: error.message } });
  }
});

/**
 * Add a custom / newly launched Indian smartphone model
 * POST /api/phones/custom
 */
router.post('/custom', async (req, res) => {
  try {
    const body = req.body;
    if (!body.brand || !body.model) {
      return res.status(400).json({ error: { message: 'Brand and Model are required' } });
    }

    const payload = {
      brand: body.brand.trim(),
      model: body.model.trim(),
      release_year: Number(body.release_year) || new Date().getFullYear(),
      ram_options: Array.isArray(body.ram_options) ? body.ram_options : ['8GB', '12GB'],
      storage_options: Array.isArray(body.storage_options) ? body.storage_options : ['128GB', '256GB'],
      default_mrp: Number(body.default_mrp) || 29999,
      base_resale_value: Number(body.base_resale_value) || 16000,
      image_url: body.image_url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
      video_url: body.video_url ? String(body.video_url).trim() : null,
      popular_tag: body.popular_tag || 'Latest Launch',
      processor: body.processor || 'Octa-core 5G Processor',
      camera_spec: body.camera_spec || '50MP OIS Camera',
      battery_spec: body.battery_spec || '5000 mAh Fast Charging',
      display_spec: body.display_spec || '6.7" AMOLED 120Hz',
      is_5g: body.is_5g !== false,
      is_active: true,
    };

    const doc = await MasterPhone.findOneAndUpdate(
      { brand: payload.brand, model: payload.model },
      { $set: payload },
      { upsert: true, new: true }
    );

    return res.json({ data: normalizeDoc(doc), message: 'Phone model successfully saved to Indian catalog' });
  } catch (error) {
    return res.status(500).json({ error: { message: error.message } });
  }
});

/**
 * 1-Click Bulk Seed / Sync all Indian phones into Database
 * POST /api/phones/bulk-sync
 */
router.post('/bulk-sync', async (_req, res) => {
  try {
    await ensureMasterPhonesSeeded(true);
    const count = await MasterPhone.countDocuments();
    return res.json({ message: 'Catalog synced successfully', count });
  } catch (error) {
    return res.status(500).json({ error: { message: error.message } });
  }
});

import {
  createPhoneQuote,
  processInspectionMismatch,
  FUNDU_POLICY,
  FUNDU_SERVICE_LOCALITIES,
} from '../services/quoteService.js';

/**
 * Generate official Fundu buyback quote
 * POST /api/phones/quote
 */
router.post('/quote', async (req, res) => {
  try {
    const quote = await createPhoneQuote(req.body);
    return res.json({ data: quote });
  } catch (error) {
    return res.status(500).json({ error: { message: error.message } });
  }
});

/**
 * Get active policy info & supported service areas
 * GET /api/phones/quote/policy
 */
router.get('/quote/policy', (_req, res) => {
  return res.json({
    data: {
      version: FUNDU_POLICY.version,
      effectiveDate: FUNDU_POLICY.effectiveDate,
      supportedLocalities: FUNDU_SERVICE_LOCALITIES,
      disclaimer: 'All quotes are conditional estimates subject to physical doorstep inspection.',
    },
  });
});

/**
 * Physical Doorstep Inspection recalculation & mismatch detection
 * POST /api/phones/quote/inspect
 */
router.post('/quote/inspect', async (req, res) => {
  try {
    const { quoteId, sellRequestId, inspectedAnswers } = req.body;
    const result = await processInspectionMismatch(quoteId, inspectedAnswers, sellRequestId);
    return res.json({ data: result });
  } catch (error) {
    return res.status(400).json({ error: { message: error.message } });
  }
});

/**
 * Seller accepts or declines revised offer
 * POST /api/phones/quote/accept-revised
 */
router.post('/quote/accept-revised', async (req, res) => {
  try {
    const { sellRequestId, accept } = req.body;
    if (!sellRequestId) {
      return res.status(400).json({ error: { message: 'sellRequestId is required' } });
    }

    const doc = await SellRequestModel.findById(sellRequestId);
    if (!doc) {
      return res.status(404).json({ error: { message: 'Sell request not found' } });
    }

    if (accept) {
      doc.vendor_quote_status = 'user_accepted';
      doc.status = 'completed';
      doc.final_price = doc.vendor_quote_price || doc.estimated_price;
      await doc.save();
      return res.json({ data: normalizeDoc(doc), message: 'Revised offer accepted. Payment dispatched.' });
    } else {
      doc.vendor_quote_status = 'user_rejected';
      doc.status = 'cancelled';
      await doc.save();
      return res.json({ data: normalizeDoc(doc), message: 'Revised offer declined. Device return initiated.' });
    }
  } catch (error) {
    return res.status(500).json({ error: { message: error.message } });
  }
});

/**
 * Update Phone Model Image directly in Database (MasterPhone + SellPriceConfig)
 * POST /api/phones/model-image
 */
router.post('/model-image', async (req, res) => {
  try {
    const { brand, model, image_url } = req.body;
    if (!brand || !model) {
      return res.status(400).json({ error: { message: 'Brand and Model are required' } });
    }

    const rawBrand = String(brand).trim();
    let rawModel = String(model).trim();
    const cleanImageUrl = typeof image_url === 'string' ? image_url.trim() : '';

    // Strip brand prefix if redundant
    if (rawBrand && rawModel.toLowerCase().startsWith(rawBrand.toLowerCase())) {
      rawModel = rawModel.slice(rawBrand.length).trim();
    }

    const isPoco = rawBrand.toLowerCase() === 'poco' || rawModel.toLowerCase().startsWith('poco');
    const isXiaomi = rawBrand.toLowerCase() === 'xiaomi';
    const brandRegex = (isPoco || isXiaomi)
      ? /^(poco|xiaomi)$/i
      : new RegExp(`^${rawBrand}$`, 'i');

    const cleanModelName = rawModel.replace(/^(poco|xiaomi)\s+/i, '').trim();
    const cleanNo5g = cleanModelName.replace(/\s*5g$/i, '').trim();
    const modelEscaped = rawModel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const cleanEscaped = cleanModelName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const cleanNo5gEscaped = cleanNo5g.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Flexible pattern that bridges "Reno 12" <-> "Reno12", "GT 8" <-> "GT8", "Find X8" <-> "FindX8"
    const flexPattern = cleanNo5g
      .replace(/([a-zA-Z])(\d)/g, '$1\\s*$2')
      .replace(/(\d)([a-zA-Z])/g, '$1\\s*$2')
      .split(/\s+/)
      .map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('\\s*');

    const modelRegex = new RegExp(`^(${modelEscaped}|${rawBrand}\\s+${modelEscaped}|${cleanEscaped}|poco\\s+${cleanEscaped}|xiaomi\\s+${cleanEscaped}|${cleanNo5gEscaped}|poco\\s+${cleanNo5gEscaped}|xiaomi\\s+${cleanNo5gEscaped}|(?:${rawBrand}\\s+)?${flexPattern})(?:\\s*5g)?$`, 'i');

    const canonicalBrand = isPoco ? 'Poco' : rawBrand;

    // 1. Update or upsert MasterPhone in MongoDB
    const mpUpdate = {
      image_url: cleanImageUrl || null,
      custom_image: Boolean(cleanImageUrl),
      updated_at: new Date(),
    };

    let updatedMp = await MasterPhone.findOneAndUpdate(
      { brand: brandRegex, model: modelRegex },
      { $set: mpUpdate },
      { new: true }
    );

    if (!updatedMp) {
      // If not present in DB, create it permanently with sensible defaults
      updatedMp = await MasterPhone.create({
        brand: canonicalBrand,
        model: rawModel,
        release_year: new Date().getFullYear(),
        ram_options: ['6GB', '8GB', '12GB'],
        storage_options: ['128GB', '256GB'],
        default_mrp: 29999,
        base_resale_value: 14000,
        image_url: cleanImageUrl || null,
        custom_image: Boolean(cleanImageUrl),
        popular_tag: `${canonicalBrand} 5G Device`,
        is_active: true,
      });
    } else {
      // Also update any other variant docs with this brand and model regex
      await MasterPhone.updateMany(
        { brand: brandRegex, model: modelRegex },
        { $set: mpUpdate }
      );
    }

    // 2. Also update in SellPriceConfig
    const spUpdate = {
      image_url: cleanImageUrl || null,
      custom_image: Boolean(cleanImageUrl),
      updated_at: new Date(),
    };
    await SellPriceConfig.updateMany(
      { brand: brandRegex, model: modelRegex },
      { $set: spUpdate }
    );

    // 3. Clear server in-memory route cache so next read is 100% fresh
    clearTableCache('master_phones');
    clearTableCache('sell_price_configs');
    invalidateLiveImages();

    return res.json({
      success: true,
      message: `Image for ${canonicalBrand} ${rawModel} successfully saved directly to database`,
      data: {
        brand: canonicalBrand,
        model: rawModel,
        image_url: cleanImageUrl || null,
        custom_image: Boolean(cleanImageUrl),
        id: updatedMp._id.toString(),
      },
    });
  } catch (error) {
    console.error('[phoneRoutes] Failed to update model image:', error);
    return res.status(500).json({ error: { message: error.message } });
  }
});

/**
 * Update Phone Model Video directly in Database (MasterPhone + SellPriceConfig)
 * POST /api/phones/model-video
 */
router.post('/model-video', async (req, res) => {
  try {
    const { brand, model, video_url } = req.body;
    if (!brand || !model) {
      return res.status(400).json({ error: { message: 'Brand and Model are required' } });
    }

    const rawBrand = String(brand).trim();
    let rawModel = String(model).trim();
    const cleanVideoUrl = typeof video_url === 'string' ? video_url.trim() : '';

    // Strip brand prefix if redundant
    if (rawBrand && rawModel.toLowerCase().startsWith(rawBrand.toLowerCase())) {
      rawModel = rawModel.slice(rawBrand.length).trim();
    }

    const isPoco = rawBrand.toLowerCase() === 'poco' || rawModel.toLowerCase().startsWith('poco');
    const isXiaomi = rawBrand.toLowerCase() === 'xiaomi';
    const brandRegex = (isPoco || isXiaomi)
      ? /^(poco|xiaomi)$/i
      : new RegExp(`^${rawBrand}$`, 'i');

    const cleanModelName = rawModel.replace(/^(poco|xiaomi)\s+/i, '').trim();
    const cleanNo5g = cleanModelName.replace(/\s*5g$/i, '').trim();
    const modelEscaped = rawModel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const cleanEscaped = cleanModelName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const cleanNo5gEscaped = cleanNo5g.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Flexible pattern that bridges "Reno 12" <-> "Reno12", "GT 8" <-> "GT8", "Find X8" <-> "FindX8"
    const flexPattern = cleanNo5g
      .replace(/([a-zA-Z])(\d)/g, '$1\\s*$2')
      .replace(/(\d)([a-zA-Z])/g, '$1\\s*$2')
      .split(/\s+/)
      .map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('\\s*');

    const modelRegex = new RegExp(`^(${modelEscaped}|${rawBrand}\\s+${modelEscaped}|${cleanEscaped}|poco\\s+${cleanEscaped}|xiaomi\\s+${cleanEscaped}|${cleanNo5gEscaped}|poco\\s+${cleanNo5gEscaped}|xiaomi\\s+${cleanNo5gEscaped}|(?:${rawBrand}\\s+)?${flexPattern})(?:\\s*5g)?$`, 'i');

    const canonicalBrand = isPoco ? 'Poco' : rawBrand;

    // 1. Update or upsert MasterPhone in MongoDB
    const mpUpdate = {
      video_url: cleanVideoUrl || null,
      updated_at: new Date(),
    };

    let updatedMp = await MasterPhone.findOneAndUpdate(
      { brand: brandRegex, model: modelRegex },
      { $set: mpUpdate },
      { new: true }
    );

    if (!updatedMp) {
      // If not present in DB, create it permanently with sensible defaults
      updatedMp = await MasterPhone.create({
        brand: canonicalBrand,
        model: rawModel,
        release_year: new Date().getFullYear(),
        ram_options: ['6GB', '8GB', '12GB'],
        storage_options: ['128GB', '256GB'],
        default_mrp: 29999,
        base_resale_value: 14000,
        image_url: null,
        video_url: cleanVideoUrl || null,
        popular_tag: `${canonicalBrand} 5G Device`,
        is_active: true,
      });
    } else {
      await MasterPhone.updateMany(
        { brand: brandRegex, model: modelRegex },
        { $set: mpUpdate }
      );
    }

    // 2. Also update in SellPriceConfig
    const spUpdate = {
      video_url: cleanVideoUrl || null,
      updated_at: new Date(),
    };
    await SellPriceConfig.updateMany(
      { brand: brandRegex, model: modelRegex },
      { $set: spUpdate }
    );

    // 3. Clear server in-memory route cache so next read is 100% fresh
    clearTableCache('master_phones');
    clearTableCache('sell_price_configs');
    invalidateLiveImages();

    return res.json({
      success: true,
      message: `Video for ${canonicalBrand} ${rawModel} successfully saved to database`,
      data: {
        brand: canonicalBrand,
        model: rawModel,
        video_url: cleanVideoUrl || null,
        id: updatedMp._id.toString(),
      },
    });
  } catch (error) {
    console.error('[phoneRoutes] Failed to update model video:', error);
    return res.status(500).json({ error: { message: error.message } });
  }
});

/**
 * Fast endpoint to fetch all models with custom or database images
 * GET /api/phones/live-images
 */
async function loadLiveImageItems() {
  const [mpDocs, spDocs] = await Promise.all([
    MasterPhone.find(
      { is_active: { $ne: false }, image_url: { $ne: null } },
      'brand model image_url custom_image'
    ).lean(),
    SellPriceConfig.find(
      { is_active: { $ne: false }, image_url: { $ne: null } },
      'brand model image_url custom_image'
    ).lean(),
  ]);

  const items = [];
  const seen = new Set();

  const addDoc = (d) => {
    if (!d || !d.brand || !d.model || !d.image_url) return;
    const key = `${d.brand.toLowerCase().trim()}:${d.model.toLowerCase().trim()}`;
    if (seen.has(key)) return;
    seen.add(key);
    items.push({
      brand: d.brand,
      model: d.model,
      image_url: d.image_url,
      custom_image: Boolean(d.custom_image),
    });
  };

  mpDocs.forEach(addDoc);
  spDocs.forEach(addDoc);
  return items;
}

router.get('/live-images', async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

    if (mongoose.connection.readyState !== 1) {
      return res.json({ data: [], count: 0, status: 'standalone', timestamp: Date.now() });
    }

    // Cached in memory: the database is read at most once a minute no matter
    // how many browser tabs are polling, and writes invalidate it right away.
    const snapshot = await getLiveImages(loadLiveImageItems);
    return res.json({ ...buildLiveImagesResponse(snapshot, req.query.v), timestamp: Date.now() });
  } catch (error) {
    console.warn('[phoneRoutes] Live images fallback:', error?.message || error);
    return res.json({ data: [], count: 0, error: 'Live images are temporarily unavailable.', timestamp: Date.now() });
  }
});

export default router;

