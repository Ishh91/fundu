import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MasterPhone } from '../models/MasterPhone.js';
import { SellPriceConfig } from '../models/SellPriceConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const catalogPath = path.join(__dirname, 'phonesCatalog.json');

function loadCatalog() {
  try {
    return JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  } catch (err) {
    console.error('[AutoSync] Could not read phonesCatalog.json:', err.message);
    return [];
  }
}

export let INDIAN_MARKET_PHONES_LAST_10_YEARS = loadCatalog();

/**
 * Automatically synchronizes phonesCatalog.json into both:
 * 1. MasterPhone collection (used by customer sell search & catalog)
 * 2. SellPriceConfig collection (used by Admin Sell Pricing dashboard)
 */
export async function ensureMasterPhonesSeeded(force = true) {
  try {
    const currentCatalog = loadCatalog();
    if (!currentCatalog || currentCatalog.length === 0) return;
    INDIAN_MARKET_PHONES_LAST_10_YEARS = currentCatalog;

    console.log(`[AutoSync] Synchronizing ${currentCatalog.length} models into database masterphones & sellpriceconfigs...`);

    // Fetch any phones where an admin set a custom image so we NEVER wipe custom uploads
    const customPhones = await MasterPhone.find(
      {
        $or: [
          { custom_image: true },
          { image_url: /^data:image\//i },
          { image_url: /^blob:/i },
        ],
      },
      { brand: 1, model: 1, image_url: 1 }
    ).lean();

    const customPhoneImageMap = new Map();
    customPhones.forEach((p) => {
      const b = (p.brand || '').toLowerCase().trim();
      const m = (p.model || '').toLowerCase().trim();
      let strippedM = m;
      if (b && strippedM.startsWith(b)) {
        strippedM = strippedM.slice(b.length).trim();
      }
      customPhoneImageMap.set(`${b}:${m}`, p.image_url);
      if (strippedM) {
        customPhoneImageMap.set(`${b}:${strippedM}`, p.image_url);
      }
    });

    // 0. Pre-fetch all Admin Locked / Custom Prices so seed NEVER overwrites them!
    const lockedConfigs = await SellPriceConfig.find(
      { $or: [{ manual_override: true }, { is_locked: true }, { updated_at: { $exists: true } }] },
      { brand: 1, model: 1, base_price: 1 }
    ).lean();

    const lockedSet = new Set();
    const lockedPriceMap = new Map();
    lockedConfigs.forEach((c) => {
      const b = (c.brand || '').toLowerCase().trim();
      const m = (c.model || '').toLowerCase().trim();
      const key = `${b}:${m}`;
      lockedSet.add(key);
      if (c.base_price > 0) {
        lockedPriceMap.set(key, c.base_price);
      }
    });

    // 1. Bulk Upsert into MasterPhone
    const masterBulkOps = currentCatalog.map((phone) => {
      const b = (phone.brand || '').toLowerCase().trim();
      const m = (phone.model || '').toLowerCase().trim();
      let strippedM = m;
      if (b && strippedM.startsWith(b)) {
        strippedM = strippedM.slice(b.length).trim();
      }
      const existingCustomImg = customPhoneImageMap.get(`${b}:${m}`) || customPhoneImageMap.get(`${b}:${strippedM}`);
      const key = `${b}:${m}`;
      const strippedKey = `${b}:${strippedM}`;
      const lockedPrice = lockedPriceMap.get(key) || lockedPriceMap.get(strippedKey);
      const price = lockedPrice || phone.price || phone.base_resale_value || 12000;

      const updateFields = {
        brand: phone.brand,
        model: phone.model,
        release_year: phone.release_year || 2024,
        ram_options: phone.ram_options || ['6GB', '8GB', '12GB'],
        storage_options: phone.storage_options || ['128GB', '256GB'],
        default_mrp: phone.default_mrp || Math.round(price * 1.5),
        popular_tag: phone.popular_tag || `${phone.brand} Official Model`,
        processor: phone.processor || 'High-Performance Processor',
        camera_spec: phone.camera_spec || '50MP OIS Camera',
        battery_spec: phone.battery_spec || '5000 mAh Fast Charging',
        display_spec: phone.display_spec || 'AMOLED Display',
        is_5g: phone.is_5g !== false,
        is_active: phone.is_active !== false,
        updated_at: new Date(),
      };

      // Only update base_resale_value and price if not locked or if using locked price
      if (lockedPrice) {
        updateFields.base_resale_value = lockedPrice;
        updateFields.price = lockedPrice;
      } else {
        updateFields.$setOnInsert = {
          base_resale_value: price,
          price: price,
        };
      }

      if (existingCustomImg) {
        updateFields.image_url = existingCustomImg;
        updateFields.custom_image = true;
      } else {
        updateFields.image_url = phone.image_url || null;
      }

      const setPayload = { ...updateFields };
      delete setPayload.$setOnInsert;

      const updateOp = { $set: setPayload };
      if (updateFields.$setOnInsert) {
        updateOp.$setOnInsert = updateFields.$setOnInsert;
      }

      return {
        updateOne: {
          filter: { brand: phone.brand, model: phone.model },
          update: updateOp,
          upsert: true,
        },
      };
    });

    for (let i = 0; i < masterBulkOps.length; i += 200) {
      const chunk = masterBulkOps.slice(i, i + 200);
      await MasterPhone.bulkWrite(chunk, { ordered: false });
    }

    // 2. Bulk Upsert into SellPriceConfig (Admin Pricing Rules)
    // NEVER overwrite models that an admin has manually set or locked!

    const configBulkOps = currentCatalog
      .filter((phone) => {
        let cleanModel = (phone.model || '').trim();
        const b = (phone.brand || '').trim();
        if (b && cleanModel.toLowerCase().startsWith(b.toLowerCase())) {
          cleanModel = cleanModel.slice(b.length).trim();
        }
        const key = `${(phone.brand || '').toLowerCase().trim()}:${cleanModel.toLowerCase()}`;
        return !lockedSet.has(key);
      })
      .map((phone) => {
        let cleanModel = (phone.model || '').trim();
        const b = (phone.brand || '').trim();
        if (b && cleanModel.toLowerCase().startsWith(b.toLowerCase())) {
          cleanModel = cleanModel.slice(b.length).trim();
        }
        const stg = (phone.storage_options?.[0] || '128GB').replace(/\s+/g, '');
        const price = phone.price || phone.base_resale_value || 12000;

        return {
          updateOne: {
            filter: {
              brand: phone.brand,
              model: cleanModel,
              manual_override: { $ne: true },
              is_locked: { $ne: true },
            },
            update: {
              $set: {
                brand: phone.brand,
                model: cleanModel,
                storage: stg,
                base_price: price,
                is_active: phone.is_active !== false,
                updated_at: new Date(),
              },
              $setOnInsert: {
                excellent_multiplier: 1.0,
                good_multiplier: 0.70,
                fair_multiplier: 0.55,
                box_bonus: 500,
                charger_bonus: 400,
                created_at: new Date(),
              },
            },
            upsert: true,
          },
        };
      });

    if (configBulkOps.length > 0) {
      for (let i = 0; i < configBulkOps.length; i += 200) {
        const chunk = configBulkOps.slice(i, i + 200);
        await SellPriceConfig.bulkWrite(chunk, { ordered: false });
      }
    }

    console.log(`[AutoSync] ✅ Master phones & Admin sell price configs automatically synchronized (${currentCatalog.length} models).`);
  } catch (err) {
    console.error(`[AutoSync] Error during catalog auto-sync:`, err.message);
  }
}

// 3. Live File Watcher: Automatically detects any changes to phonesCatalog.json and re-syncs
let isSyncing = false;
let watcherStarted = false;

export function startCatalogAutoWatcher() {
  if (watcherStarted) return;
  if (fs.existsSync(catalogPath)) {
    watcherStarted = true;
    fs.watchFile(catalogPath, { interval: 2500 }, async (curr, prev) => {
      if (curr.mtimeMs !== prev.mtimeMs && !isSyncing) {
        console.log(`[AutoSync] phonesCatalog.json change detected! Running auto-sync into database...`);
        isSyncing = true;
        try {
          await ensureMasterPhonesSeeded(true);
        } catch (e) {
          console.error('[AutoSync] Error:', e.message);
        } finally {
          isSyncing = false;
        }
      }
    });
    console.log('[AutoSync] Active file watcher enabled on phonesCatalog.json (auto-syncs to Admin & DB).');
  }
}
