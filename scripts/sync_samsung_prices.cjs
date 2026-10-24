const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

// Full Samsung Cashify Catalogue (Models 1 - 88)
// Range top (Get Upto baseline) is selected for optimal resale quote
const rawSamsungList = [
  // 1. GALAXY S SERIES (Models 1 - 20)
  { name: 'Galaxy S9', variant: '64 GB', price: 4200 },
  { name: 'Galaxy S9 Plus', variant: '64 GB', price: 4800 },
  { name: 'Galaxy S10e', variant: '128 GB', price: 6500 },
  { name: 'Galaxy S10', variant: '128 GB', price: 7500 },
  { name: 'Galaxy S10 Plus', variant: '128 GB', price: 10000 },
  { name: 'Galaxy S20', variant: '128 GB', price: 12000 },
  { name: 'Galaxy S20 Plus', variant: '128 GB', price: 13500 },
  { name: 'Galaxy S20 Ultra 5G', variant: '128 GB', price: 18000 },
  { name: 'Galaxy S20 FE 5G', variant: '128 GB', price: 11000 },
  { name: 'Galaxy S20 FE', variant: '128 GB', price: 10000 },
  { name: 'Galaxy S21 5G', variant: '128 GB', price: 16000 },
  { name: 'Galaxy S21 Plus 5G', variant: '128 GB', price: 19500 },
  { name: 'Galaxy S21 Ultra 5G', variant: '256 GB', price: 25500 },
  { name: 'Galaxy S21 FE 5G', variant: '128 GB', price: 14000 },
  { name: 'Galaxy S22 5G', variant: '128 GB', price: 21500 },
  { name: 'Galaxy S22 Plus 5G', variant: '128 GB', price: 26000 },
  { name: 'Galaxy S22 Ultra 5G', variant: '256 GB', price: 32000 },
  { name: 'Galaxy S23 5G', variant: '128 GB', price: 28000 },
  { name: 'Galaxy S23 Plus 5G', variant: '256 GB', price: 35000 },
  { name: 'Galaxy S23 Ultra 5G', variant: '256 GB', price: 48000 },
  { name: 'Galaxy S23 FE 5G', variant: '128 GB', price: 21500 },
  { name: 'Galaxy S24 5G', variant: '128 GB', price: 42000 },
  { name: 'Galaxy S24 Plus 5G', variant: '256 GB', price: 50000 },
  { name: 'Galaxy S24 Ultra 5G', variant: '256 GB', price: 64500 },

  // 2. GALAXY Z FOLD & Z FLIP SERIES (Models 21 - 28)
  { name: 'Galaxy Z Flip', variant: '128 GB', price: 13000 },
  { name: 'Galaxy Z Flip 3 5G', variant: '128 GB', price: 15000 },
  { name: 'Galaxy Z Fold 2', variant: '256 GB', price: 22000 },
  { name: 'Galaxy Z Fold 3 5G', variant: '256 GB', price: 26000 },
  { name: 'Galaxy Z Flip 4', variant: '128 GB', price: 23500 },
  { name: 'Galaxy Z Fold 4', variant: '256 GB', price: 42000 },
  { name: 'Galaxy Z Flip 5', variant: '256 GB', price: 35000 },
  { name: 'Galaxy Z Fold 5', variant: '256 GB', price: 55000 },
  { name: 'Galaxy Z Flip 6', variant: '256 GB', price: 48000 },
  { name: 'Galaxy Z Fold 6', variant: '256 GB', price: 76000 },

  // 3. GALAXY NOTE SERIES & EARLY NOTE LINE (Models 29 - 38)
  { name: 'Galaxy Note 1', variant: '16 GB', price: 600 },
  { name: 'Galaxy Note 2', variant: '16 GB', price: 800 },
  { name: 'Galaxy Note 3', variant: '32 GB', price: 1100 },
  { name: 'Galaxy Note 3 Neo', variant: '16 GB', price: 800 },
  { name: 'Galaxy Note 4', variant: '32 GB', price: 1300 },
  { name: 'Galaxy Note Edge', variant: '32 GB', price: 1500 },
  { name: 'Galaxy Note 5', variant: '32 GB', price: 2300 },
  { name: 'Galaxy Note Fan Edition', variant: '64 GB', price: 4200 },
  { name: 'Galaxy Note FE', variant: '64 GB', price: 4200 },
  { name: 'Galaxy Note 8', variant: '64 GB', price: 5000 },
  { name: 'Galaxy Note 9', variant: '128 GB', price: 6500 },
  { name: 'Galaxy Note 10', variant: '128 GB', price: 9800 },
  { name: 'Galaxy Note 10 Lite', variant: '128 GB', price: 8500 },
  { name: 'Galaxy Note 10 Plus', variant: '256 GB', price: 13000 },
  { name: 'Galaxy Note 20', variant: '256 GB', price: 16000 },
  { name: 'Galaxy Note 20 Ultra 5G', variant: '256 GB', price: 23000 },

  // 4. GALAXY A-SERIES (Models 39 - 60)
  { name: 'Galaxy A10', variant: '32 GB', price: 2000 },
  { name: 'Galaxy A10s', variant: '32 GB', price: 2500 },
  { name: 'Galaxy A20', variant: '32 GB', price: 2500 },
  { name: 'Galaxy A20s', variant: '32 GB', price: 3000 },
  { name: 'Galaxy A30', variant: '32 GB', price: 3200 },
  { name: 'Galaxy A30s', variant: '64 GB', price: 3800 },
  { name: 'Galaxy A50', variant: '64 GB', price: 4000 },
  { name: 'Galaxy A50s', variant: '64 GB', price: 4500 },
  { name: 'Galaxy A51', variant: '128 GB', price: 5000 },
  { name: 'Galaxy A70', variant: '128 GB', price: 5200 },
  { name: 'Galaxy A70s', variant: '128 GB', price: 6000 },
  { name: 'Galaxy A71', variant: '128 GB', price: 7000 },
  { name: 'Galaxy A72', variant: '128 GB', price: 9500 },
  { name: 'Galaxy A73 5G', variant: '128 GB', price: 13500 },
  { name: 'Galaxy A52', variant: '128 GB', price: 8200 },
  { name: 'Galaxy A52s 5G', variant: '128 GB', price: 9200 },
  { name: 'Galaxy A53 5G', variant: '128 GB', price: 12000 },
  { name: 'Galaxy A54 5G', variant: '128 GB', price: 15000 },
  { name: 'Galaxy A55 5G', variant: '128 GB', price: 18500 },
  { name: 'Galaxy A33 5G', variant: '128 GB', price: 9500 },
  { name: 'Galaxy A34 5G', variant: '128 GB', price: 11000 },
  { name: 'Galaxy A35 5G', variant: '128 GB', price: 14500 },
  { name: 'Galaxy A22', variant: '64 GB', price: 5000 },
  { name: 'Galaxy A22 5G', variant: '128 GB', price: 6200 },
  { name: 'Galaxy A23', variant: '128 GB', price: 7500 },
  { name: 'Galaxy A24', variant: '128 GB', price: 8500 },
  { name: 'Galaxy A25 5G', variant: '128 GB', price: 10500 },
  { name: 'Galaxy A12', variant: '64 GB', price: 4200 },
  { name: 'Galaxy A13', variant: '64 GB', price: 5000 },
  { name: 'Galaxy A14', variant: '64 GB', price: 5000 },
  { name: 'Galaxy A14 5G', variant: '128 GB', price: 6000 },
  { name: 'Galaxy A15', variant: '128 GB', price: 5800 },
  { name: 'Galaxy A15 5G', variant: '128 GB', price: 6800 },
  { name: 'Galaxy A03', variant: '32 GB', price: 2200 },
  { name: 'Galaxy A03s', variant: '32 GB', price: 2600 },
  { name: 'Galaxy A03 Core', variant: '32 GB', price: 1900 },
  { name: 'Galaxy A04', variant: '32 GB', price: 2600 },
  { name: 'Galaxy A04e', variant: '32 GB', price: 2200 },
  { name: 'Galaxy A04s', variant: '64 GB', price: 3200 },
  { name: 'Galaxy A05', variant: '64 GB', price: 4200 },
  { name: 'Galaxy A05s', variant: '128 GB', price: 5200 },
  { name: 'Galaxy A80', variant: '128 GB', price: 6000 },
  { name: 'Galaxy A90 5G', variant: '128 GB', price: 7200 },

  // 5. GALAXY M-SERIES (Models 61 - 78)
  { name: 'Galaxy M01', variant: '32 GB', price: 1500 },
  { name: 'Galaxy M01 Core', variant: '16 GB', price: 1300 },
  { name: 'Galaxy M01s', variant: '32 GB', price: 1800 },
  { name: 'Galaxy M02', variant: '32 GB', price: 1600 },
  { name: 'Galaxy M02s', variant: '32 GB', price: 2200 },
  { name: 'Galaxy M04', variant: '64 GB', price: 2800 },
  { name: 'Galaxy M10', variant: '32 GB', price: 2000 },
  { name: 'Galaxy M11', variant: '32 GB', price: 2500 },
  { name: 'Galaxy M12', variant: '64 GB', price: 3500 },
  { name: 'Galaxy M13', variant: '64 GB', price: 4500 },
  { name: 'Galaxy M13 5G', variant: '64 GB', price: 4800 },
  { name: 'Galaxy M14 5G', variant: '128 GB', price: 5500 },
  { name: 'Galaxy M15 5G', variant: '128 GB', price: 6500 },
  { name: 'Galaxy M20', variant: '32 GB', price: 2600 },
  { name: 'Galaxy M21', variant: '64 GB', price: 3500 },
  { name: 'Galaxy M21s', variant: '64 GB', price: 4200 },
  { name: 'Galaxy M30', variant: '64 GB', price: 3200 },
  { name: 'Galaxy M30s', variant: '64 GB', price: 3800 },
  { name: 'Galaxy M31', variant: '64 GB', price: 4600 },
  { name: 'Galaxy M31 Prime', variant: '128 GB', price: 5000 },
  { name: 'Galaxy M31s', variant: '128 GB', price: 5800 },
  { name: 'Galaxy M32', variant: '64 GB', price: 4800 },
  { name: 'Galaxy M32 5G', variant: '128 GB', price: 5800 },
  { name: 'Galaxy M33 5G', variant: '128 GB', price: 7200 },
  { name: 'Galaxy M34 5G', variant: '128 GB', price: 8500 },
  { name: 'Galaxy M35 5G', variant: '128 GB', price: 11000 },
  { name: 'Galaxy M40', variant: '128 GB', price: 4500 },
  { name: 'Galaxy M42 5G', variant: '128 GB', price: 6800 },
  { name: 'Galaxy M51', variant: '128 GB', price: 7000 },
  { name: 'Galaxy M52 5G', variant: '128 GB', price: 8500 },
  { name: 'Galaxy M53 5G', variant: '128 GB', price: 10500 },
  { name: 'Galaxy M54 5G', variant: '128 GB', price: 11500 },
  { name: 'Galaxy M55 5G', variant: '128 GB', price: 13500 },

  // 6. GALAXY F-SERIES (Models 79 - 88)
  { name: 'Galaxy F02s', variant: '32 GB', price: 2200 },
  { name: 'Galaxy F04', variant: '64 GB', price: 2800 },
  { name: 'Galaxy F12', variant: '64 GB', price: 3400 },
  { name: 'Galaxy F13', variant: '64 GB', price: 4000 },
  { name: 'Galaxy F14 5G', variant: '128 GB', price: 5500 },
  { name: 'Galaxy F15 5G', variant: '128 GB', price: 6500 },
  { name: 'Galaxy F22', variant: '64 GB', price: 4800 },
  { name: 'Galaxy F23 5G', variant: '128 GB', price: 6000 },
  { name: 'Galaxy F34 5G', variant: '128 GB', price: 8500 },
  { name: 'Galaxy F41', variant: '64 GB', price: 4500 },
  { name: 'Galaxy F42 5G', variant: '128 GB', price: 5500 },
  { name: 'Galaxy F54 5G', variant: '256 GB', price: 12000 },
  { name: 'Galaxy F55 5G', variant: '128 GB', price: 16000 },
  { name: 'Galaxy F62', variant: '128 GB', price: 7200 }
];

// Calculate Fundu Buyback Price - EXACT PRICE FROM CASHIFY CATALOGUE (No random additions)
function calculateFunduPrice(basePrice) {
  return basePrice;
}

function normalizeKey(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/^samsung\s+/i, '')
    .replace(/^galaxy\s+/i, '')
    .replace(/\b5g\b/gi, '')
    .replace(/\bplus\b/gi, '+')
    .replace(/\b(rotating cam|vegan leather|flagship 7nm chip|fan edition|7000 mah)\b/gi, '')
    .replace(/[^a-z0-9]/g, '');
}

// Build map with persistent randomized prices
const samsungMap = new Map();
rawSamsungList.forEach(item => {
  const funduPrice = calculateFunduPrice(item.price);
  const key = normalizeKey(item.name);
  const entry = {
    ...item,
    funduPrice,
    key
  };
  samsungMap.set(key, entry);
  samsungMap.set(item.name.toLowerCase().trim(), entry);
});

function findSamsungMatch(modelName) {
  if (!modelName) return null;
  const lower = modelName.toLowerCase().trim();
  if (samsungMap.has(lower)) return samsungMap.get(lower);
  const k = normalizeKey(modelName);
  if (samsungMap.has(k)) return samsungMap.get(k);

  for (const [dictKey, val] of samsungMap.entries()) {
    if (dictKey.length >= 4 && (k === dictKey || k.startsWith(dictKey) || dictKey.startsWith(k))) {
      return val;
    }
  }
  return null;
}

async function run() {
  console.log(`Starting Samsung Base Price Sync with +₹700 to +₹1,000 random addition...`);

  // 1. UPDATE server/config/phonesCatalog.json
  const phonesCatalogPath = path.join(__dirname, '../server/config/phonesCatalog.json');
  const catalog = JSON.parse(fs.readFileSync(phonesCatalogPath, 'utf8'));

  let catalogUpdatedCount = 0;
  const existingSamsungKeys = new Set();

  catalog.forEach(item => {
    if (item.brand && item.brand.toLowerCase() === 'samsung') {
      const match = findSamsungMatch(item.model);
      existingSamsungKeys.add(normalizeKey(item.model));
      if (match) {
        item.base_resale_value = match.funduPrice;
        item.price = match.funduPrice;
        catalogUpdatedCount++;
      }
    }
  });

  // Insert any missing Samsung models from the official list
  let catalogAddedCount = 0;
  rawSamsungList.forEach(item => {
    const k = normalizeKey(item.name);
    if (!existingSamsungKeys.has(k)) {
      const fullModelName = item.name.toLowerCase().startsWith('galaxy') ? `Samsung ${item.name}` : `Samsung Galaxy ${item.name}`;
      catalog.push({
        brand: 'Samsung',
        model: fullModelName,
        release_year: 2024,
        ram_options: ['6GB', '8GB', '12GB'],
        storage_options: [item.variant, '256GB'],
        default_mrp: Math.round(item.funduPrice * 1.5),
        base_resale_value: item.funduPrice,
        price: item.funduPrice,
        image_url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-ultra-5g-sm-s928-final.jpg',
        popular_tag: 'Samsung Official Model',
        processor: 'Exynos / Snapdragon Flagship',
        camera_spec: '50MP OIS Camera',
        battery_spec: '5000 mAh Fast Charging',
        display_spec: 'Dynamic AMOLED 2X 120Hz',
        is_5g: item.name.includes('5G') || item.price > 20000,
        is_active: true
      });
      existingSamsungKeys.add(k);
      catalogAddedCount++;
    }
  });

  fs.writeFileSync(phonesCatalogPath, JSON.stringify(catalog, null, 2), 'utf8');
  console.log(`phonesCatalog.json: Updated ${catalogUpdatedCount} Samsung models, added ${catalogAddedCount} missing models.`);

  // 2. UPDATE src/data/indianPhonesCatalog.ts
  const indianCatalogPath = path.join(__dirname, '../src/data/indianPhonesCatalog.ts');
  let indianContent = fs.readFileSync(indianCatalogPath, 'utf8');
  let indianUpdated = 0;

  rawSamsungList.forEach(item => {
    const match = findSamsungMatch(item.name);
    if (!match) return;
    const cleanPattern = item.name.replace(/\\/g, '\\\\').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(model:\\s*["'](?:Samsung\\s+)?${cleanPattern}["'][\\s\\S]*?base_resale_value:\\s*)\\d+`, 'gi');
    if (regex.test(indianContent)) {
      indianContent = indianContent.replace(regex, `$1${match.funduPrice}`);
      indianUpdated++;
    }
  });
  fs.writeFileSync(indianCatalogPath, indianContent, 'utf8');
  console.log(`indianPhonesCatalog.ts: Updated prices for ${indianUpdated} matching items.`);

  // 3. UPDATE src/data/masterModelCatalog.ts
  const masterCatalogPath = path.join(__dirname, '../src/data/masterModelCatalog.ts');
  let masterContent = fs.readFileSync(masterCatalogPath, 'utf8');
  let masterUpdated = 0;

  rawSamsungList.forEach(item => {
    const match = findSamsungMatch(item.name);
    if (!match) return;
    const cleanPattern = item.name.replace(/\\/g, '\\\\').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(model:\\s*["'](?:Samsung\\s+)?${cleanPattern}["'][\\s\\S]*?price:\\s*)\\d+`, 'gi');
    if (regex.test(masterContent)) {
      masterContent = masterContent.replace(regex, `$1${match.funduPrice}`);
      masterUpdated++;
    }
  });
  fs.writeFileSync(masterCatalogPath, masterContent, 'utf8');
  console.log(`masterModelCatalog.ts: Updated prices for ${masterUpdated} matching items.`);

  // 4. UPDATE src/data/brandSeriesCatalog.ts
  const brandSeriesCatalogPath = path.join(__dirname, '../src/data/brandSeriesCatalog.ts');
  let brandSeriesContent = fs.readFileSync(brandSeriesCatalogPath, 'utf8');
  let brandSeriesUpdated = 0;

  rawSamsungList.forEach(item => {
    const match = findSamsungMatch(item.name);
    if (!match) return;
    const cleanPattern = item.name.replace(/\\/g, '\\\\').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(model:\\s*['"](?:Samsung\\s+)?${cleanPattern}['"][\\s\\S]*?price:\\s*)\\d+`, 'gi');
    if (regex.test(brandSeriesContent)) {
      brandSeriesContent = brandSeriesContent.replace(regex, `$1${match.funduPrice}`);
      brandSeriesUpdated++;
    }
  });
  fs.writeFileSync(brandSeriesCatalogPath, brandSeriesContent, 'utf8');
  console.log(`brandSeriesCatalog.ts: Updated prices for ${brandSeriesUpdated} matching items.`);

  // 5. UPDATE MongoDB Atlas (masterphones & sellpriceconfigs for Admin Sell Pricing)
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME || 'fundu' });
  const db = mongoose.connection.db;

  let mongoMasterUpdated = 0;
  let mongoConfigUpdated = 0;

  for (const item of rawSamsungList) {
    const match = findSamsungMatch(item.name);
    if (!match) continue;

    const cleanModel = item.name.replace(/^samsung\s+/i, '');

    // Update masterphones
    const resMaster = await db.collection('masterphones').updateMany(
      {
        brand: { $regex: /^samsung$/i },
        $or: [
          { model: new RegExp(`^${cleanModel.replace(/[^a-zA-Z0-9]/g, '.*')}$`, 'i') },
          { model: new RegExp(`^Samsung\\s+${cleanModel.replace(/[^a-zA-Z0-9]/g, '.*')}$`, 'i') }
        ]
      },
      {
        $set: {
          base_resale_value: match.funduPrice,
          price: match.funduPrice,
          updated_at: new Date()
        }
      }
    );
    mongoMasterUpdated += resMaster.modifiedCount;

    // Clean duplicate/stale sellpriceconfigs and upsert exact rule
    const normK = normalizeKey(cleanModel);
    await db.collection('sellpriceconfigs').deleteMany({
      brand: { $regex: /^samsung$/i },
      $expr: {
        $regexMatch: {
          input: { $replaceAll: { input: { $toLower: '$model' }, find: ' ', replacement: '' } },
          regex: `^${normK}$`
        }
      }
    });

    const storageClean = item.variant.replace(/\s+/g, '');
    await db.collection('sellpriceconfigs').insertOne({
      brand: 'Samsung',
      model: cleanModel,
      storage: storageClean,
      base_price: match.funduPrice,
      excellent_multiplier: 0.85,
      good_multiplier: 0.70,
      fair_multiplier: 0.55,
      box_bonus: 500,
      charger_bonus: 400,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    });
    mongoConfigUpdated++;
  }

  console.log(`MongoDB Atlas sync -> masterphones updated: ${mongoMasterUpdated}, sellpriceconfigs upserted: ${mongoConfigUpdated}`);

  // Sample check
  const samples = await db.collection('sellpriceconfigs').find({
    brand: /samsung/i,
    model: /S24 Ultra|S23 Ultra|Z Fold 6|Z Flip 6|Note 20 Ultra|A55|M55/i
  }).toArray();
  console.log('Sample updated Samsung admin prices:');
  samples.forEach(s => console.log(`- ${s.model} (${s.storage}): Base Price ₹${s.base_price}`));

  await mongoose.disconnect();
  console.log('✅ Samsung Base Price Sync Complete!');
  process.exit(0);
}

run().catch(console.error);
