const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

// Full OPPO Cashify Catalogue (Models 1 - 110)
const rawOppoList = [
  // SERIES 1: OPPO FIND SERIES (Models 1 - 8)
  { name: 'OPPO Find X8 Pro 5G', variant: '512 GB', price: 38480 },
  { name: 'OPPO Find X8 5G', variant: '256 GB', price: 30930 },
  { name: 'OPPO Find N3 Flip 5G', variant: '256 GB', price: 21430 },
  { name: 'OPPO Find N2 Flip 5G', variant: '256 GB', price: 18030 },
  { name: 'OPPO Find X2 Pro', variant: '512 GB', price: 14500 },
  { name: 'OPPO Find X2', variant: '256 GB', price: 12090 },
  { name: 'OPPO Find X', variant: '256 GB', price: 9640 },
  { name: 'OPPO Find X Automobili Lamborghini', variant: '512 GB', price: 14800 },

  // SERIES 2: OPPO RENO SERIES (Models 9 - 26)
  { name: 'OPPO Reno12 Pro 5G', variant: '512 GB', price: 17940 },
  { name: 'OPPO Reno12 Pro', variant: '256 GB', price: 16800 },
  { name: 'OPPO Reno12 5G', variant: '256 GB', price: 13360 },
  { name: 'OPPO Reno12', variant: '256 GB', price: 13360 },
  { name: 'OPPO Reno11 Pro 5G', variant: '256 GB', price: 16000 },
  { name: 'OPPO Reno11 Pro', variant: '256 GB', price: 16000 },
  { name: 'OPPO Reno11 5G', variant: '128 GB', price: 14940 },
  { name: 'OPPO Reno11', variant: '256 GB', price: 15800 },
  { name: 'OPPO Reno10 Pro Plus 5G', variant: '256 GB', price: 18410 },
  { name: 'OPPO Reno10 Pro+ 5G', variant: '256 GB', price: 18410 },
  { name: 'OPPO Reno10 Pro 5G', variant: '256 GB', price: 14510 },
  { name: 'OPPO Reno10 Pro', variant: '256 GB', price: 14510 },
  { name: 'OPPO Reno10 5G', variant: '256 GB', price: 15460 },
  { name: 'OPPO Reno10', variant: '256 GB', price: 15460 },
  { name: 'OPPO Reno8 Pro 5G', variant: '256 GB', price: 12880 },
  { name: 'OPPO Reno8 Pro', variant: '256 GB', price: 12880 },
  { name: 'OPPO Reno8 5G', variant: '128 GB', price: 10560 },
  { name: 'OPPO Reno8', variant: '128 GB', price: 10560 },
  { name: 'OPPO Reno8T 5G', variant: '128 GB', price: 12340 },
  { name: 'OPPO Reno8 T 5G', variant: '128 GB', price: 12340 },
  { name: 'OPPO Reno7 Pro 5G', variant: '256 GB', price: 12370 },
  { name: 'OPPO Reno7 Pro', variant: '256 GB', price: 12370 },
  { name: 'OPPO Reno7 5G', variant: '256 GB', price: 9550 },
  { name: 'OPPO Reno7', variant: '256 GB', price: 9550 },
  { name: 'OPPO Reno6 Pro 5G', variant: '256 GB', price: 11060 },
  { name: 'OPPO Reno6 Pro', variant: '256 GB', price: 11060 },
  { name: 'OPPO Reno6 5G', variant: '128 GB', price: 9700 },
  { name: 'OPPO Reno6', variant: '128 GB', price: 9700 },
  { name: 'OPPO Reno5 Pro 5G', variant: '128 GB', price: 9860 },
  { name: 'OPPO Reno5 Pro', variant: '128 GB', price: 9860 },
  { name: 'OPPO Reno4 Pro', variant: '128 GB', price: 9260 },

  // SERIES 3: OPPO RENO CLASSIC & SHARK-FIN POP-UP (Models 27 - 34)
  { name: 'OPPO Reno 10x Zoom', variant: '256 GB', price: 8730 },
  { name: 'OPPO Reno3 Pro', variant: '128 GB', price: 8460 },
  { name: 'OPPO Reno 2', variant: '256 GB', price: 8320 },
  { name: 'OPPO Reno2', variant: '256 GB', price: 8320 },
  { name: 'OPPO Reno 2Z', variant: '256 GB', price: 8250 },
  { name: 'OPPO Reno2 Z', variant: '256 GB', price: 8250 },
  { name: 'OPPO Reno2 F', variant: '128 GB', price: 8220 },
  { name: 'OPPO Reno 2F', variant: '128 GB', price: 8220 },
  { name: 'OPPO Reno', variant: '128 GB', price: 7730 },
  { name: 'OPPO Reno 8 Lite 5G', variant: '128 GB', price: 8900 },
  { name: 'OPPO Reno 7 Lite 5G', variant: '128 GB', price: 8100 },

  // SERIES 4: OPPO F-SERIES (MODERN SLEEK 5G) (Models 35 - 52)
  { name: 'OPPO F27 Pro Plus 5G', variant: '128 GB', price: 12740 },
  { name: 'OPPO F27 Pro+ 5G', variant: '128 GB', price: 12740 },
  { name: 'OPPO F27 Pro Plus 5G (256GB)', variant: '256 GB', price: 13800 },
  { name: 'OPPO F27 5G', variant: '128 GB', price: 11970 },
  { name: 'OPPO F27', variant: '128 GB', price: 11970 },
  { name: 'OPPO F25 Pro 5G', variant: '128 GB', price: 12090 },
  { name: 'OPPO F25 Pro 5G (256GB)', variant: '256 GB', price: 13100 },
  { name: 'OPPO F25 Pro', variant: '128 GB', price: 12090 },
  { name: 'OPPO F23 5G', variant: '256 GB', price: 10690 },
  { name: 'OPPO F23', variant: '256 GB', price: 10690 },
  { name: 'OPPO F21s Pro 5G', variant: '128 GB', price: 9670 },
  { name: 'OPPO F21s Pro', variant: '128 GB', price: 8670 },
  { name: 'OPPO F21 Pro 5G', variant: '128 GB', price: 9040 },
  { name: 'OPPO F21 Pro', variant: '128 GB', price: 8470 },
  { name: 'OPPO F19 Pro Plus 5G', variant: '128 GB', price: 8590 },
  { name: 'OPPO F19 Pro+ 5G', variant: '128 GB', price: 8590 },
  { name: 'OPPO F19 Pro', variant: '128 GB', price: 8300 },
  { name: 'OPPO F19s', variant: '128 GB', price: 7400 },
  { name: 'OPPO F19', variant: '128 GB', price: 7680 },
  { name: 'OPPO F17 Pro', variant: '128 GB', price: 7150 },
  { name: 'OPPO F17', variant: '128 GB', price: 7480 },
  { name: 'OPPO F15', variant: '128 GB', price: 7240 },
  { name: 'OPPO F15 (4GB)', variant: '128 GB', price: 6600 },

  // SERIES 5: OPPO F-SERIES (LEGACY SELFIE EXPERTS) (Models 53 - 62)
  { name: 'OPPO F11 Pro', variant: '64 GB', price: 6860 },
  { name: 'OPPO F11', variant: '128 GB', price: 6540 },
  { name: 'OPPO F9 Pro', variant: '64 GB', price: 5830 },
  { name: 'OPPO F9', variant: '64 GB', price: 5430 },
  { name: 'OPPO F7', variant: '64 GB', price: 5360 },
  { name: 'OPPO F5', variant: '32 GB', price: 4520 },
  { name: 'OPPO F5 Youth', variant: '32 GB', price: 4180 },
  { name: 'OPPO F3 Plus', variant: '64 GB', price: 5080 },
  { name: 'OPPO F3', variant: '64 GB', price: 4180 },
  { name: 'OPPO F1s', variant: '64 GB', price: 4240 },
  { name: 'OPPO F1 Plus', variant: '64 GB', price: 4240 },

  // SERIES 6: OPPO K-SERIES & R-SERIES (Models 63 - 71)
  { name: 'OPPO K12x 5G', variant: '128 GB', price: 9210 },
  { name: 'OPPO K12x', variant: '128 GB', price: 9210 },
  { name: 'OPPO K10 5G', variant: '128 GB', price: 9150 },
  { name: 'OPPO K10', variant: '128 GB', price: 7500 },
  { name: 'OPPO K3', variant: '64 GB', price: 7170 },
  { name: 'OPPO K1', variant: '64 GB', price: 6080 },
  { name: 'OPPO R17 Pro', variant: '128 GB', price: 6770 },
  { name: 'OPPO R17', variant: '128 GB', price: 6080 },
  { name: 'OPPO R15 Pro', variant: '128 GB', price: 6670 },
  { name: 'OPPO R11 Plus', variant: '64 GB', price: 5150 },
  { name: 'OPPO R11', variant: '64 GB', price: 5150 },

  // SERIES 7: OPPO A-SERIES (MODERN 5G SEGMENT) (Models 72 - 79)
  { name: 'OPPO A3 Pro 5G', variant: '128 GB', price: 10210 },
  { name: 'OPPO A3 Pro', variant: '128 GB', price: 10210 },
  { name: 'OPPO A3x 5G', variant: '64 GB', price: 8730 },
  { name: 'OPPO A3x', variant: '64 GB', price: 8730 },
  { name: 'OPPO A79 5G', variant: '128 GB', price: 9680 },
  { name: 'OPPO A79', variant: '128 GB', price: 9680 },
  { name: 'OPPO A78 5G', variant: '128 GB', price: 9750 },
  { name: 'OPPO A74 5G', variant: '128 GB', price: 8980 },
  { name: 'OPPO A59 5G', variant: '128 GB', price: 9100 },
  { name: 'OPPO A53s 5G', variant: '128 GB', price: 9320 },
  { name: 'OPPO A77 5G', variant: '128 GB', price: 8900 },
  { name: 'OPPO A98 5G', variant: '128 GB', price: 8900 },

  // SERIES 8: OPPO A-SERIES (POPULAR 4G & LEGACY) (Models 80 - 110)
  { name: 'OPPO A96', variant: '128 GB', price: 7740 },
  { name: 'OPPO A9 2020', variant: '128 GB', price: 6770 },
  { name: 'OPPO A9', variant: '128 GB', price: 5840 },
  { name: 'OPPO A78', variant: '128 GB', price: 8550 },
  { name: 'OPPO A77s', variant: '128 GB', price: 7900 },
  { name: 'OPPO A77', variant: '64 GB', price: 6860 },
  { name: 'OPPO A76', variant: '128 GB', price: 6890 },
  { name: 'OPPO A58', variant: '128 GB', price: 7730 },
  { name: 'OPPO A57 (2022)', variant: '64 GB', price: 6480 },
  { name: 'OPPO A57', variant: '64 GB', price: 6480 },
  { name: 'OPPO A55', variant: '64 GB', price: 7180 },
  { name: 'OPPO A54', variant: '64 GB', price: 6690 },
  { name: 'OPPO A53', variant: '64 GB', price: 6980 },
  { name: 'OPPO A52', variant: '128 GB', price: 6960 },
  { name: 'OPPO A5 2020', variant: '64 GB', price: 6370 },
  { name: 'OPPO A38', variant: '128 GB', price: 6910 },
  { name: 'OPPO A33', variant: '32 GB', price: 5930 },
  { name: 'OPPO A31', variant: '64 GB', price: 6330 },
  { name: 'OPPO A18', variant: '64 GB', price: 6590 },
  { name: 'OPPO A17', variant: '64 GB', price: 6210 },
  { name: 'OPPO A17k', variant: '64 GB', price: 6210 },
  { name: 'OPPO A16', variant: '32 GB', price: 6220 },
  { name: 'OPPO A16e', variant: '32 GB', price: 6220 },
  { name: 'OPPO A16k', variant: '32 GB', price: 6220 },
  { name: 'OPPO A15', variant: '32 GB', price: 5890 },
  { name: 'OPPO A15s', variant: '32 GB', price: 5890 },
  { name: 'OPPO A12', variant: '32 GB', price: 5420 },
  { name: 'OPPO A11k', variant: '32 GB', price: 5420 },
  { name: 'OPPO A1k', variant: '32 GB', price: 4340 },
  { name: 'OPPO A83', variant: '32 GB', price: 4350 },
  { name: 'OPPO A7', variant: '64 GB', price: 5200 },
  { name: 'OPPO A5s', variant: '32 GB', price: 5580 },
  { name: 'OPPO A5', variant: '32 GB', price: 5660 },
  { name: 'OPPO A3s', variant: '16 GB', price: 4880 },
  { name: 'OPPO A71', variant: '16 GB', price: 3910 },
  { name: 'OPPO A37', variant: '16 GB', price: 3890 },
  { name: 'OPPO A33 (Legacy)', variant: '16 GB', price: 3890 }
];

// Calculate Fundu Base Price with ₹800 to ₹1,000 random value added (in steps of 10)
function calculateFunduPrice(basePrice) {
  const randAddition = 800 + Math.floor(Math.random() * 21) * 10;
  return basePrice + randAddition;
}

function normalizeKey(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/^oppo\s+/i, '')
    .replace(/\bplus\b/gi, '+')
    .replace(/\s*\+\s*/g, '+')
    .replace(/\b(hasselblad|triple hasselblad|3k qhd\+ 120hz|stealth 3d cameras|automobili lamborghini|ai portrait|dimensity 7300-energy|80w supervooc|32 mp telephoto|periscope ois|marisilicon x npu|108 mp curved screen|aircraft-grade laser|snapdragon 870|reno glow design|dimensity 1000\+|periscope hybrid|dual punch hole 44mp|shark fin wedge cam|quad camera|original pivot rising|ip69 waterproof|halo light ring|4k ultra-clear cam|67w supervooc 5000mah|dual orbit light|microlens 30x|sunset orange leather|4g amoled|50w flash|dual-view video|glowing gold special|33w fast charge|ultra thin 7.48mm|in-display fingerprint 3.0|rising pop-up cam 48mp|waterdrop screen vooc|25 mp ai beauty|bezel-less 18:9|dual selfie cam|damage-proof 360 armour|dimensity 810|snapdragon 680 33w|rising camera amoled|in-display fingerprint pioneer|supervooc 50w 3d tof|all-round waterproof|shock resistance military|dual stereo speakers|glowing silk design|quad camera 48mp|original|leather feel fiberglass|2022|90hz display|stereo quad cam|stereo speakers|33w supervooc|2020|triple lens 4230mah|legacy|2018|original 2016)\b/gi, '')
    .replace(/[^a-z0-9+]/g, '');
}

// Build map with persistent randomized prices
const oppoMap = new Map();
rawOppoList.forEach(item => {
  const funduPrice = calculateFunduPrice(item.price);
  const key = normalizeKey(item.name);
  const entry = {
    ...item,
    funduPrice,
    key
  };
  oppoMap.set(key, entry);
  oppoMap.set(item.name.toLowerCase().trim(), entry);
});

function findOppoMatch(modelName) {
  if (!modelName) return null;
  const lower = modelName.toLowerCase().trim();
  if (oppoMap.has(lower)) return oppoMap.get(lower);
  const k = normalizeKey(modelName);
  if (oppoMap.has(k)) return oppoMap.get(k);

  // Exact key match
  for (const [dictKey, val] of oppoMap.entries()) {
    if (k === dictKey) {
      return val;
    }
  }

  // 5G agnostic match fallback
  const kNo5g = k.replace(/5g/g, '');
  if (kNo5g.length >= 2) {
    for (const [dictKey, val] of oppoMap.entries()) {
      if (dictKey.replace(/5g/g, '') === kNo5g) {
        return val;
      }
    }
  }

  return null;
}

async function run() {
  console.log(`Starting OPPO Base Price Sync with +₹800 to +₹1,000 random addition...`);

  // 1. UPDATE server/config/phonesCatalog.json
  const phonesCatalogPath = path.join(__dirname, '../server/config/phonesCatalog.json');
  const catalog = JSON.parse(fs.readFileSync(phonesCatalogPath, 'utf8'));

  let catalogUpdatedCount = 0;
  const existingOppoKeys = new Set();

  catalog.forEach(item => {
    const b = (item.brand || '').toLowerCase();
    if (b === 'oppo') {
      const match = findOppoMatch(item.model);
      if (match) {
        item.base_resale_value = match.funduPrice;
        item.price = match.funduPrice;
        catalogUpdatedCount++;
        existingOppoKeys.add(normalizeKey(item.model));
      }
    }
  });

  // Insert any missing OPPO models from the official catalogue
  let catalogAddedCount = 0;
  rawOppoList.forEach(item => {
    const k = normalizeKey(item.name);
    const match = findOppoMatch(item.name);
    const fPrice = match ? match.funduPrice : calculateFunduPrice(item.price);
    if (!existingOppoKeys.has(k)) {
      catalog.push({
        brand: 'Oppo',
        model: item.name,
        release_year: 2024,
        ram_options: ['6GB', '8GB', '12GB'],
        storage_options: [item.variant, '256GB'],
        default_mrp: Math.round(fPrice * 1.5),
        base_resale_value: fPrice,
        price: fPrice,
        image_url: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-reno12-pro.jpg',
        popular_tag: 'Oppo Official Model',
        processor: 'MediaTek Dimensity / Snapdragon',
        camera_spec: '50MP OIS Camera',
        battery_spec: '5000 mAh SUPERVOOC',
        display_spec: 'AMOLED 120Hz Display',
        is_5g: item.name.includes('5G') || item.price > 9000,
        is_active: true
      });
      existingOppoKeys.add(k);
      catalogAddedCount++;
    }
  });

  fs.writeFileSync(phonesCatalogPath, JSON.stringify(catalog, null, 2), 'utf8');
  console.log(`phonesCatalog.json: Updated ${catalogUpdatedCount} OPPO models, added ${catalogAddedCount} missing models.`);

  // 2. UPDATE src/data/indianPhonesCatalog.ts
  const indianCatalogPath = path.join(__dirname, '../src/data/indianPhonesCatalog.ts');
  let indianContent = fs.readFileSync(indianCatalogPath, 'utf8');
  let indianUpdated = 0;

  rawOppoList.forEach(item => {
    const match = findOppoMatch(item.name);
    if (!match) return;
    const cleanPattern = item.name.replace(/\\/g, '\\\\').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(model:\\s*['"](?:OPPO\\s+|Oppo\\s+)?${cleanPattern}['"][\\s\\S]*?base_resale_value:\\s*)\\d+`, 'gi');
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

  rawOppoList.forEach(item => {
    const match = findOppoMatch(item.name);
    if (!match) return;
    const cleanPattern = item.name.replace(/\\/g, '\\\\').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(model:\\s*['"](?:OPPO\\s+|Oppo\\s+)?${cleanPattern}['"][\\s\\S]*?price:\\s*)\\d+`, 'gi');
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

  rawOppoList.forEach(item => {
    const match = findOppoMatch(item.name);
    if (!match) return;
    const cleanPattern = item.name.replace(/\\/g, '\\\\').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(model:\\s*['"](?:OPPO\\s+|Oppo\\s+)?${cleanPattern}['"][\\s\\S]*?price:\\s*)\\d+`, 'gi');
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

  for (const item of rawOppoList) {
    const match = findOppoMatch(item.name);
    if (!match) continue;

    const cleanModel = item.name.replace(/^oppo\s+/i, '');

    // Update masterphones
    const resMaster = await db.collection('masterphones').updateMany(
      {
        brand: { $regex: /^oppo$/i },
        $or: [
          { model: new RegExp(`^${cleanModel.replace(/[^a-zA-Z0-9]/g, '.*')}$`, 'i') },
          { model: new RegExp(`^Oppo\\s+${cleanModel.replace(/[^a-zA-Z0-9]/g, '.*')}$`, 'i') }
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
        brand: { $regex: /^oppo$/i },
        $or: [
          { model: new RegExp(`^${cleanModel.replace(/[^a-zA-Z0-9]/g, '.*')}$`, 'i') },
          { model: new RegExp(`^Oppo\\s+${cleanModel.replace(/[^a-zA-Z0-9]/g, '.*')}$`, 'i') }
        ]
      },
      {
        $set: {
          brand: 'Oppo',
          model: item.name,
          storage: item.variant || '128 GB',
          base_price: match.funduPrice,
          is_active: true,
          updated_at: new Date()
        },
        $setOnInsert: {
          excellent_multiplier: 1.0,
          good_multiplier: 1.0,
          fair_multiplier: 0.85,
          box_bonus: 300,
          charger_bonus: 300
        }
      },
      { upsert: true }
    );
    if (resConfig.upsertedCount || resConfig.modifiedCount) {
      mongoConfigUpdated++;
    }
  }

  console.log(`MongoDB Atlas sync -> masterphones updated: ${mongoMasterUpdated}, sellpriceconfigs upserted: ${mongoConfigUpdated}`);

  // Display sample output
  console.log('Sample updated OPPO admin prices:');
  const samples = [
    'OPPO Find X8 Pro 5G',
    'OPPO Find N3 Flip 5G',
    'OPPO Reno12 Pro 5G',
    'OPPO Reno11 Pro 5G',
    'OPPO Reno10 Pro+ 5G',
    'OPPO Reno8 Pro 5G',
    'OPPO F27 Pro+ 5G',
    'OPPO F25 Pro 5G',
    'OPPO F21 Pro 5G',
    'OPPO K12x 5G',
    'OPPO K10 5G',
    'OPPO A3 Pro 5G',
    'OPPO A79 5G',
    'OPPO A78',
    'OPPO A58',
    'OPPO A38',
    'OPPO A18'
  ];

  samples.forEach(s => {
    const m = findOppoMatch(s);
    if (m) {
      console.log(`- ${s}: Base Price ₹${m.funduPrice} (Cashify ₹${m.price} + ₹${m.funduPrice - m.price})`);
    }
  });

  await mongoose.disconnect();
  console.log('✅ OPPO Base Price Sync Complete!');
}

run().catch(err => {
  console.error('Fatal sync error:', err);
  process.exit(1);
});
