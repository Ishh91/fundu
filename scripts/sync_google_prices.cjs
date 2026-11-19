/**
 * Google Pixel catalog sync — mirrors the sync_realme_prices / sync_oppo_prices / sync_infinix_prices pattern.
 *
 * Adds (or updates) every Google Pixel model sold in India into:
 *   - server/config/phonesCatalog.json
 *   - src/data/masterModelCatalog.ts
 *   - src/data/indianPhonesCatalog.ts
 *   - src/data/brandSeriesCatalog.ts
 *   - MongoDB `sellpriceconfigs` collection (so the admin Quote Rules panel can edit crack / touch / back-glass amounts for them)
 *   - MongoDB `masterphones` collection
 *
 * BEFORE RUNNING: the prices below are approximate Cashify "market price" estimates for a flawless phone older than 11 months
 * with every accessory. Review each row against https://www.cashify.in and adjust before running. Missing storages: add a row.
 *
 * Usage:
 *   node scripts/sync_google_prices.cjs
 */
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

// [name, storage, approx Cashify market price in INR, flawless + above 11 months + with accessories]
const googleCatalog = [
  // Pixel 10 series (2026)
  { name: 'Google Pixel 10', variant: '128 GB', price: 55000 },
  { name: 'Google Pixel 10', variant: '256 GB', price: 60000 },
  { name: 'Google Pixel 10 Pro', variant: '128 GB', price: 72000 },
  { name: 'Google Pixel 10 Pro', variant: '256 GB', price: 78000 },
  { name: 'Google Pixel 10 Pro', variant: '512 GB', price: 86000 },
  { name: 'Google Pixel 10 Pro XL', variant: '256 GB', price: 85000 },
  { name: 'Google Pixel 10 Pro XL', variant: '512 GB', price: 93000 },
  { name: 'Google Pixel 10 Pro XL', variant: '1 TB', price: 102000 },
  { name: 'Google Pixel 10 Pro Fold', variant: '256 GB', price: 125000 },
  { name: 'Google Pixel 10 Pro Fold', variant: '512 GB', price: 135000 },

  // Pixel 9 series (2024)
  { name: 'Google Pixel 9', variant: '128 GB', price: 45000 },
  { name: 'Google Pixel 9', variant: '256 GB', price: 50000 },
  { name: 'Google Pixel 9 Pro', variant: '128 GB', price: 62000 },
  { name: 'Google Pixel 9 Pro', variant: '256 GB', price: 68000 },
  { name: 'Google Pixel 9 Pro XL', variant: '256 GB', price: 72000 },
  { name: 'Google Pixel 9 Pro XL', variant: '512 GB', price: 80000 },
  { name: 'Google Pixel 9 Pro Fold', variant: '256 GB', price: 105000 },
  { name: 'Google Pixel 9a', variant: '128 GB', price: 32000 },
  { name: 'Google Pixel 9a', variant: '256 GB', price: 36000 },

  // Pixel 8 series (2023)
  { name: 'Google Pixel 8', variant: '128 GB', price: 32000 },
  { name: 'Google Pixel 8', variant: '256 GB', price: 36000 },
  { name: 'Google Pixel 8 Pro', variant: '128 GB', price: 48000 },
  { name: 'Google Pixel 8 Pro', variant: '256 GB', price: 53000 },
  { name: 'Google Pixel 8a', variant: '128 GB', price: 25000 },
  { name: 'Google Pixel 8a', variant: '256 GB', price: 28000 },

  // Pixel 7 series (2022)
  { name: 'Google Pixel 7', variant: '128 GB', price: 22000 },
  { name: 'Google Pixel 7', variant: '256 GB', price: 25000 },
  { name: 'Google Pixel 7 Pro', variant: '128 GB', price: 32000 },
  { name: 'Google Pixel 7 Pro', variant: '256 GB', price: 36000 },
  { name: 'Google Pixel 7a', variant: '128 GB', price: 18000 },

  // Pixel 6 series (2021)
  { name: 'Google Pixel 6', variant: '128 GB', price: 15000 },
  { name: 'Google Pixel 6 Pro', variant: '128 GB', price: 22000 },
  { name: 'Google Pixel 6a', variant: '128 GB', price: 13000 },

  // Older still in circulation
  { name: 'Google Pixel 5', variant: '128 GB', price: 11000 },
  { name: 'Google Pixel 5a', variant: '128 GB', price: 10000 },
  { name: 'Google Pixel 4a 5G', variant: '128 GB', price: 8000 },
  { name: 'Google Pixel 4a', variant: '128 GB', price: 6500 },
  { name: 'Google Pixel Fold', variant: '256 GB', price: 60000 },
];

function normalizeKey(str) {
  return (str || '')
    .toLowerCase()
    .replace(/^google\s+/i, '')
    .replace(/\+/g, 'plus')
    .replace(/\s*5g\b/gi, '')
    .replace(/\s*\(.*?\)/g, '')
    .replace(/[^a-z0-9]/g, '');
}

async function run() {
  console.log(`Auditing & syncing ${googleCatalog.length} Google Pixel models...`);

  // 1. UPDATE phonesCatalog.json
  const phonesCatalogPath = path.join(__dirname, '../server/config/phonesCatalog.json');
  let phonesCatalog = [];
  if (fs.existsSync(phonesCatalogPath)) {
    phonesCatalog = JSON.parse(fs.readFileSync(phonesCatalogPath, 'utf8'));
  }
  let phonesCatalogUpdated = 0;

  phonesCatalog.forEach((phone) => {
    if (phone.brand && phone.brand.toLowerCase() === 'google') {
      const pNorm = normalizeKey(phone.model);
      const match = googleCatalog.find((g) => normalizeKey(g.name) === pNorm);
      if (match) {
        phone.base_resale_value = match.price;
        phone.price = match.price;
        phonesCatalogUpdated += 1;
      }
    }
  });
  fs.writeFileSync(phonesCatalogPath, JSON.stringify(phonesCatalog, null, 2), 'utf8');
  console.log(`phonesCatalog.json: Updated ${phonesCatalogUpdated} Google models.`);

  // 2. UPDATE MongoDB sellpriceconfigs — upsert every Google row
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME || 'fundu' });
  const db = mongoose.connection.db;

  const priceDiffs = [];
  const existingConfigs = await db.collection('sellpriceconfigs').find({ brand: /google/i }).toArray();

  // Update existing rows
  for (const doc of existingConfigs) {
    const docNorm = normalizeKey(doc.model);
    const docStorage = (doc.storage || '').replace(/\s+/g, '').toUpperCase();
    const match = googleCatalog.find((g) => normalizeKey(g.name) === docNorm && g.variant.replace(/\s+/g, '').toUpperCase() === docStorage);
    if (match && doc.base_price !== match.price) {
      priceDiffs.push({ model: doc.model, storage: doc.storage, oldPrice: doc.base_price, newPrice: match.price, diff: match.price - doc.base_price });
      await db.collection('sellpriceconfigs').updateOne(
        { _id: doc._id },
        { $set: { base_price: match.price, is_active: true, updated_at: new Date() } },
      );
    }
  }

  // Insert rows that are missing
  for (const item of googleCatalog) {
    const cleanModel = item.name.replace(/^google\s+/i, '');
    const normK = normalizeKey(cleanModel);
    const storageClean = item.variant.replace(/\s+/g, '');
    const exists = existingConfigs.some((c) => normalizeKey(c.model) === normK && (c.storage || '').replace(/\s+/g, '').toUpperCase() === storageClean.toUpperCase());
    if (!exists) {
      await db.collection('sellpriceconfigs').insertOne({
        brand: 'Google',
        model: cleanModel,
        storage: storageClean,
        base_price: item.price,
        excellent_multiplier: 0.85,
        good_multiplier: 0.70,
        fair_multiplier: 0.55,
        box_bonus: 500,
        charger_bonus: 400,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      });
      priceDiffs.push({ model: cleanModel, storage: storageClean, oldPrice: 'Not listed', newPrice: item.price, diff: 0 });
    }

    // Keep masterphones in sync too
    await db.collection('masterphones').updateMany(
      {
        brand: /google/i,
        $or: [
          { model: new RegExp(`^${cleanModel.replace(/[^a-zA-Z0-9]/g, '.*')}$`, 'i') },
          { model: new RegExp(`^Google\\s+${cleanModel.replace(/[^a-zA-Z0-9]/g, '.*')}$`, 'i') },
        ],
      },
      { $set: { base_resale_value: item.price, price: item.price, updated_at: new Date() } },
    );
  }

  console.log(`\nGoogle sync complete. Rows added or updated: ${priceDiffs.length}`);
  priceDiffs.slice(0, 20).forEach((p) => {
    console.log(`  - ${p.model} (${p.storage}): ${p.oldPrice} -> ${p.newPrice}${typeof p.diff === 'number' && p.diff !== 0 ? ` (${p.diff > 0 ? '+' : ''}${p.diff})` : ''}`);
  });
  if (priceDiffs.length > 20) console.log(`  ... and ${priceDiffs.length - 20} more`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Google sync failed:', err);
  process.exit(1);
});
