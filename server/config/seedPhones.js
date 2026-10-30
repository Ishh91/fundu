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

    // 2. Clean up any un-locked dummy seed records from SellPriceConfig
    // SellPriceConfig is ONLY for real Admin-configured/locked price overrides.
    // phonesCatalog.json must NEVER seed or overwrite SellPriceConfig.
    const cleanupResult = await SellPriceConfig.deleteMany({
      manual_override: { $ne: true },
      is_locked: { $ne: true },
    });
    if (cleanupResult.deletedCount > 0) {
      console.log(`[AutoSync] 🧹 Cleaned up ${cleanupResult.deletedCount} un-locked/dummy seed configs from SellPriceConfig to protect Admin fixed prices.`);
    }

    console.log(`[AutoSync] ✅ Master phones catalog automatically synchronized (${currentCatalog.length} models) with Admin price locks strictly preserved.`);
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
