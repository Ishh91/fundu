const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

// Full Xiaomi / Redmi Cashify Catalogue (Models 1 - 85)
const rawXiaomiList = [
  // SERIES 1: XIAOMI NUMBERED FLAGSHIP & LEICA CIVI SERIES (Models 1 - 16)
  { name: 'Xiaomi 17 Ultra 5G', variant: '512 GB', price: 58500 },
  { name: 'Xiaomi 17 Pro 5G', variant: '256 GB', price: 47200 },
  { name: 'Xiaomi 17 5G', variant: '256 GB', price: 39800 },
  { name: 'Xiaomi 15 Pro 5G', variant: '256 GB', price: 42000 },
  { name: 'Xiaomi 15 5G', variant: '256 GB', price: 34500 },
  { name: 'Xiaomi 14 Ultra 5G', variant: '512 GB', price: 37980 },
  { name: 'Xiaomi 14', variant: '512 GB', price: 27740 },
  { name: 'Xiaomi 14 CIVI', variant: '256 GB', price: 18620 },
  { name: 'Xiaomi 13 Pro 5G', variant: '256 GB', price: 25460 },
  { name: 'Xiaomi 13 Pro', variant: '256 GB', price: 25460 },
  { name: 'Xiaomi 13T Pro', variant: '256 GB', price: 17800 },
  { name: 'Xiaomi 13T', variant: '256 GB', price: 17800 },
  { name: 'Xiaomi 12 Pro 5G', variant: '256 GB', price: 14920 },
  { name: 'Xiaomi 12 Pro', variant: '256 GB', price: 14920 },
  { name: 'Xiaomi 11 Ultra 5G', variant: '256 GB', price: 18500 },
  { name: 'Xiaomi 11 Ultra', variant: '256 GB', price: 18500 },
  { name: 'Xiaomi 11T Pro 5G', variant: '128 GB', price: 11400 },
  { name: 'Xiaomi 11T Pro', variant: '128 GB', price: 11400 },
  { name: 'Xiaomi Mi 11X Pro 5G', variant: '128 GB', price: 12800 },
  { name: 'Xiaomi Mi 11X Pro', variant: '128 GB', price: 12800 },
  { name: 'Xiaomi Mi 11X 5G', variant: '128 GB', price: 14480 },
  { name: 'Xiaomi Mi 11X', variant: '128 GB', price: 14480 },

  // SERIES 2: MI NUMERIC & CONCEPT SERIES (Models 17 - 24)
  { name: 'Xiaomi Mi 11 Lite NE 5G', variant: '128 GB', price: 9800 },
  { name: 'Xiaomi Mi 11 Lite NE', variant: '128 GB', price: 9800 },
  { name: 'Xiaomi Mi 11 Lite', variant: '128 GB', price: 13200 },
  { name: 'Xiaomi Mi 10T Pro 5G', variant: '128 GB', price: 8900 },
  { name: 'Xiaomi Mi 10T Pro', variant: '128 GB', price: 8900 },
  { name: 'Xiaomi Mi 10T 5G', variant: '128 GB', price: 7600 },
  { name: 'Xiaomi Mi 10T', variant: '128 GB', price: 7600 },
  { name: 'Xiaomi Mi 10i 5G', variant: '128 GB', price: 7100 },
  { name: 'Xiaomi Mi 10i', variant: '128 GB', price: 7100 },
  { name: 'Xiaomi Mi 10', variant: '128 GB', price: 10500 },
  { name: 'Xiaomi Mi Mix 2', variant: '128 GB', price: 3200 },
  { name: 'Xiaomi Mi Max 2', variant: '64 GB', price: 2400 },

  // SERIES 3: REDMI NOTE 13 & NOTE 12 SERIES (Models 25 - 39)
  { name: 'Redmi Note 13 Pro Plus 5G', variant: '256 GB', price: 16800 },
  { name: 'Redmi Note 13 Pro+ 5G', variant: '256 GB', price: 16800 },
  { name: 'Redmi Note 13 Pro 5G', variant: '128 GB', price: 13690 },
  { name: 'Redmi Note 13 5G', variant: '128 GB', price: 10200 },
  { name: 'Redmi Note 13 4G', variant: '128 GB', price: 8100 },
  { name: 'Redmi Note 13', variant: '128 GB', price: 8100 },
  { name: 'Redmi Note 13R Pro', variant: '128 GB', price: 7800 },
  { name: 'Redmi Note 13R', variant: '128 GB', price: 7800 },
  { name: 'Redmi Note 12 Pro Plus 5G', variant: '256 GB', price: 14500 },
  { name: 'Redmi Note 12 Pro+ 5G', variant: '256 GB', price: 14500 },
  { name: 'Redmi Note 12 Pro 5G', variant: '128 GB', price: 12130 },
  { name: 'Redmi Note 12 5G', variant: '128 GB', price: 8400 },
  { name: 'Redmi Note 12 4G', variant: '64 GB', price: 6900 },
  { name: 'Redmi Note 12', variant: '64 GB', price: 6900 },
  { name: 'Redmi Note 12T Pro 5G', variant: '128 GB', price: 10500 },
  { name: 'Redmi Note 12T Pro', variant: '128 GB', price: 10500 },
  { name: 'Redmi Note 12S', variant: '128 GB', price: 7400 },
  { name: 'Redmi Note 12 Turbo', variant: '256 GB', price: 12800 },
  { name: 'Redmi Note 12R Pro', variant: '128 GB', price: 6200 },
  { name: 'Redmi Note 12R', variant: '128 GB', price: 6200 },
  { name: 'Redmi Note 12 Discovery Edition', variant: '256 GB', price: 14000 },
  { name: 'Redmi Note 12 Speed Edition', variant: '128 GB', price: 9200 },

  // SERIES 4: REDMI NOTE 11 & NOTE 10 SERIES (Models 40 - 55)
  { name: 'Redmi Note 11 Pro Plus 5G', variant: '128 GB', price: 7900 },
  { name: 'Redmi Note 11 Pro+ 5G', variant: '128 GB', price: 7900 },
  { name: 'Redmi Note 11 Pro', variant: '128 GB', price: 6250 },
  { name: 'Redmi Note 11S', variant: '64 GB', price: 5600 },
  { name: 'Redmi Note 11S 5G', variant: '64 GB', price: 5400 },
  { name: 'Redmi Note 11T 5G', variant: '64 GB', price: 5800 },
  { name: 'Redmi Note 11', variant: '64 GB', price: 4800 },
  { name: 'Redmi Note 11 4G', variant: '128 GB', price: 4500 },
  { name: 'Redmi Note 11 SE', variant: '64 GB', price: 5100 },
  { name: 'Redmi Note 11 Pro 5G', variant: '64 GB', price: 6800 },
  { name: 'Redmi Note 10 Pro Max', variant: '64 GB', price: 12170 },
  { name: 'Redmi Note 10 Pro', variant: '64 GB', price: 5800 },
  { name: 'Redmi Note 10S', variant: '64 GB', price: 4700 },
  { name: 'Redmi Note 10T 5G', variant: '64 GB', price: 4900 },
  { name: 'Redmi Note 10', variant: '64 GB', price: 4200 },
  { name: 'Redmi Note 10 Lite', variant: '64 GB', price: 4100 },
  { name: 'Redmi Note 10 JE', variant: '64 GB', price: 3800 },

  // SERIES 5: LEGACY REDMI NOTE SERIES (Models 56 - 63)
  { name: 'Redmi Note 9 Pro Max', variant: '64 GB', price: 12740 },
  { name: 'Redmi Note 9 Pro', variant: '64 GB', price: 4200 },
  { name: 'Redmi Note 9', variant: '64 GB', price: 3600 },
  { name: 'Redmi Note 8 Pro', variant: '64 GB', price: 3900 },
  { name: 'Redmi Note 8', variant: '64 GB', price: 3100 },
  { name: 'Redmi Note 7 Pro', variant: '64 GB', price: 2600 },
  { name: 'Redmi Note 6 Pro', variant: '64 GB', price: 1800 },
  { name: 'Redmi Note 5 Pro', variant: '64 GB', price: 1600 },

  // SERIES 6: REDMI K-SERIES & MI A-SERIES (Models 64 - 71)
  { name: 'Redmi K50i 5G', variant: '128 GB', price: 8510 },
  { name: 'Redmi K50i', variant: '128 GB', price: 8510 },
  { name: 'Redmi K20 Pro', variant: '128 GB', price: 6200 },
  { name: 'Redmi K20', variant: '64 GB', price: 4600 },
  { name: 'Redmi Turbo 3', variant: '256 GB', price: 14500 },
  { name: 'Redmi K70E', variant: '256 GB', price: 14500 },
  { name: 'Redmi K30 Pro 5G', variant: '128 GB', price: 6800 },
  { name: 'Redmi K30 5G', variant: '128 GB', price: 6800 },
  { name: 'Redmi K30', variant: '128 GB', price: 6800 },
  { name: 'Redmi K40 Gaming', variant: '128 GB', price: 11500 },
  { name: 'Redmi K60', variant: '128 GB', price: 11500 },
  { name: 'Xiaomi Mi A3', variant: '64 GB', price: 2500 },
  { name: 'Xiaomi Mi A2', variant: '64 GB', price: 1800 },
  { name: 'Xiaomi Mi A1', variant: '64 GB', price: 1800 },

  // SERIES 7 & 8: REDMI NUMBER & 'C' SERIES (Models 72 - 85)
  { name: 'Redmi 13 5G', variant: '128 GB', price: 8880 },
  { name: 'Redmi 13C 5G', variant: '128 GB', price: 7200 },
  { name: 'Redmi 13C', variant: '128 GB', price: 5800 },
  { name: 'Redmi 12 5G', variant: '128 GB', price: 9780 },
  { name: 'Redmi 12', variant: '128 GB', price: 6320 },
  { name: 'Redmi 12C', variant: '64 GB', price: 4900 },
  { name: 'Redmi 11 Prime 5G', variant: '64 GB', price: 5900 },
  { name: 'Redmi 11 Prime', variant: '64 GB', price: 5900 },
  { name: 'Redmi 10 5G', variant: '64 GB', price: 5400 },
  { name: 'Redmi 10 Power', variant: '64 GB', price: 5400 },
  { name: 'Redmi 10 Prime 2022', variant: '64 GB', price: 4600 },
  { name: 'Redmi 10 Prime', variant: '64 GB', price: 4600 },
  { name: 'Redmi 10', variant: '64 GB', price: 4100 },
  { name: 'Redmi 9 Power', variant: '64 GB', price: 3700 },
  { name: 'Redmi 9 Prime', variant: '64 GB', price: 3300 },
  { name: 'Redmi 9 Active', variant: '64 GB', price: 3100 },
  { name: 'Redmi 9', variant: '64 GB', price: 3100 },
  { name: 'Redmi 9i Sport', variant: '64 GB', price: 2700 },
  { name: 'Redmi 9i', variant: '64 GB', price: 2700 }
];

// Calculate Fundu Base Price with ₹800 to ₹1,000 random value added
function calculateFunduPrice(basePrice) {
  const randAddition = 800 + Math.floor(Math.random() * 21) * 10;
  return basePrice + randAddition;
}

function normalizeKey(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/^(xiaomi\s+|redmi\s+|mi\s+)+/gi, '')
    .replace(/\bplus\b/gi, '+')
    .replace(/\s*\+\s*/g, '+')
    .replace(/\b(curved display|snapdragon 7s gen 2|200 mp ois|sony imx766|super amoled 120hz|leica summilux|leica|hypercharge 120w|4g slim|144hz|108 mp flagship|ceramic frame|discovery edition 210w|speed edition|helio g96|108 mp|64 mp amoled|japan edition|global|aura balance|helio g85|64 mp quad cam|48 mp sony imx586|dual front cameras|camera beast|dimensity 8100 flagship|pop-up amoled flagship|snapdragon 730|android one amoled|crystal glass design|4g starshine|snapdragon 4 gen 2|4g helio g88|stereo speakers|helio g80)\b/gi, '')
    .replace(/[^a-z0-9+]/g, '');
}

// Build map with persistent randomized prices
const xiaomiMap = new Map();
rawXiaomiList.forEach(item => {
  const funduPrice = calculateFunduPrice(item.price);
  const key = normalizeKey(item.name);
  const entry = {
    ...item,
    funduPrice,
    key
  };
  xiaomiMap.set(key, entry);
  xiaomiMap.set(item.name.toLowerCase().trim(), entry);
});

function findXiaomiMatch(modelName) {
  if (!modelName) return null;
  const lower = modelName.toLowerCase().trim();
  if (xiaomiMap.has(lower)) return xiaomiMap.get(lower);
  const k = normalizeKey(modelName);
  if (xiaomiMap.has(k)) return xiaomiMap.get(k);

  for (const [dictKey, val] of xiaomiMap.entries()) {
    if (k === dictKey) {
      return val;
    }
  }
  return null;
}

async function run() {
  console.log(`Starting Xiaomi / Redmi Base Price Sync with +₹800 to +₹1,000 random addition...`);

  // 1. UPDATE server/config/phonesCatalog.json
  const phonesCatalogPath = path.join(__dirname, '../server/config/phonesCatalog.json');
  const catalog = JSON.parse(fs.readFileSync(phonesCatalogPath, 'utf8'));

  let catalogUpdatedCount = 0;
  const existingXiaomiKeys = new Set();

  catalog.forEach(item => {
    const b = (item.brand || '').toLowerCase();
    if (b === 'xiaomi' || b === 'redmi' || b === 'mi') {
      const match = findXiaomiMatch(item.model);
      if (match) {
        item.base_resale_value = match.funduPrice;
        item.price = match.funduPrice;
        catalogUpdatedCount++;
        existingXiaomiKeys.add(normalizeKey(item.model));
      }
    }
  });

  // Insert any missing Xiaomi models from the official list
  let catalogAddedCount = 0;
  rawXiaomiList.forEach(item => {
    const k = normalizeKey(item.name);
    if (!existingXiaomiKeys.has(k)) {
      catalog.push({
        brand: 'Xiaomi',
        model: item.name,
        release_year: 2024,
        ram_options: ['6GB', '8GB', '12GB'],
        storage_options: [item.variant, '256GB'],
        default_mrp: Math.round(item.funduPrice * 1.5),
        base_resale_value: item.funduPrice,
        price: item.funduPrice,
        image_url: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-14.jpg',
        popular_tag: 'Xiaomi Official Model',
        processor: 'Snapdragon / MediaTek Dimensity',
        camera_spec: '50MP OIS Camera',
        battery_spec: '5000 mAh Fast Charging',
        display_spec: 'AMOLED 120Hz Display',
        is_5g: item.name.includes('5G') || item.price > 10000,
        is_active: true
      });
      existingXiaomiKeys.add(k);
      catalogAddedCount++;
    }
  });

  fs.writeFileSync(phonesCatalogPath, JSON.stringify(catalog, null, 2), 'utf8');
  console.log(`phonesCatalog.json: Updated ${catalogUpdatedCount} Xiaomi/Redmi models, added ${catalogAddedCount} missing models.`);

  // 2. UPDATE src/data/indianPhonesCatalog.ts
  const indianCatalogPath = path.join(__dirname, '../src/data/indianPhonesCatalog.ts');
  let indianContent = fs.readFileSync(indianCatalogPath, 'utf8');
  let indianUpdated = 0;

  rawXiaomiList.forEach(item => {
    const match = findXiaomiMatch(item.name);
    if (!match) return;
    const cleanPattern = item.name.replace(/\\/g, '\\\\').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(model:\\s*['"](?:Xiaomi\\s+|Redmi\\s+)?${cleanPattern}['"][\\s\\S]*?base_resale_value:\\s*)\\d+`, 'gi');
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

  rawXiaomiList.forEach(item => {
    const match = findXiaomiMatch(item.name);
    if (!match) return;
    const cleanPattern = item.name.replace(/\\/g, '\\\\').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(model:\\s*['"](?:Xiaomi\\s+|Redmi\\s+)?${cleanPattern}['"][\\s\\S]*?price:\\s*)\\d+`, 'gi');
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

  rawXiaomiList.forEach(item => {
    const match = findXiaomiMatch(item.name);
    if (!match) return;
    const cleanPattern = item.name.replace(/\\/g, '\\\\').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(model:\\s*['"](?:Xiaomi\\s+|Redmi\\s+)?${cleanPattern}['"][\\s\\S]*?price:\\s*)\\d+`, 'gi');
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

  for (const item of rawXiaomiList) {
    const match = findXiaomiMatch(item.name);
    if (!match) continue;

    const cleanModel = item.name.replace(/^(xiaomi\s+|redmi\s+|mi\s+)+/i, '');

    // Update masterphones
    const resMaster = await db.collection('masterphones').updateMany(
      {
        brand: { $regex: /^(xiaomi|redmi|mi)$/i },
        $or: [
          { model: new RegExp(`^${cleanModel.replace(/[^a-zA-Z0-9]/g, '.*')}$`, 'i') },
          { model: new RegExp(`^Xiaomi\\s+${cleanModel.replace(/[^a-zA-Z0-9]/g, '.*')}$`, 'i') },
          { model: new RegExp(`^Redmi\\s+${cleanModel.replace(/[^a-zA-Z0-9]/g, '.*')}$`, 'i') },
          { model: new RegExp(`^Mi\\s+${cleanModel.replace(/[^a-zA-Z0-9]/g, '.*')}$`, 'i') }
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
    mongoMasterUpdated += (resMaster.modifiedCount || 0);

    // Upsert sellpriceconfigs
    const resConfig = await db.collection('sellpriceconfigs').updateOne(
      {
        brand: { $regex: /^(xiaomi|redmi|mi)$/i },
        $or: [
          { model: new RegExp(`^${cleanModel.replace(/[^a-zA-Z0-9]/g, '.*')}$`, 'i') },
          { model: new RegExp(`^Xiaomi\\s+${cleanModel.replace(/[^a-zA-Z0-9]/g, '.*')}$`, 'i') },
          { model: new RegExp(`^Redmi\\s+${cleanModel.replace(/[^a-zA-Z0-9]/g, '.*')}$`, 'i') },
          { model: new RegExp(`^Mi\\s+${cleanModel.replace(/[^a-zA-Z0-9]/g, '.*')}$`, 'i') }
        ]
      },
      {
        $set: {
          brand: 'Xiaomi',
          model: item.name,
          storage: item.variant || '128 GB',
          base_price: match.funduPrice,
          is_active: true,
          updated_at: new Date()
        },
        $setOnInsert: {
          excellent_multiplier: 0.85,
          good_multiplier: 0.70,
          fair_multiplier: 0.55,
          box_bonus: 500,
          charger_bonus: 400,
          created_at: new Date()
        }
      },
      { upsert: true }
    );
    if (resConfig.upsertedCount || resConfig.modifiedCount) mongoConfigUpdated++;
  }

  console.log(`MongoDB Atlas sync -> masterphones updated: ${mongoMasterUpdated}, sellpriceconfigs upserted: ${mongoConfigUpdated}`);

  // Print sample updated models
  console.log('Sample updated Xiaomi / Redmi admin prices:');
  const samples = [
    'Xiaomi 17 Ultra 5G',
    'Xiaomi 14 Ultra 5G',
    'Xiaomi 14',
    'Xiaomi 14 CIVI',
    'Xiaomi 13 Pro 5G',
    'Xiaomi Mi 11X Pro 5G',
    'Redmi Note 13 Pro Plus 5G',
    'Redmi Note 13 Pro 5G',
    'Redmi Note 12 Pro Plus 5G',
    'Redmi Note 12 5G',
    'Redmi Note 11 Pro Plus 5G',
    'Redmi Note 10 Pro Max',
    'Redmi K50i 5G',
    'Redmi K20 Pro',
    'Redmi 13 5G',
    'Redmi 12 5G'
  ];
  samples.forEach(s => {
    const m = findXiaomiMatch(s);
    if (m) {
      console.log(`- ${m.name}: Base Price ₹${m.funduPrice} (Cashify ₹${m.price} + ₹${m.funduPrice - m.price})`);
    }
  });

  await mongoose.disconnect();
  console.log('✅ Xiaomi Base Price Sync Complete!');
}

run().catch(err => {
  console.error('Fatal sync error:', err);
  process.exit(1);
});
