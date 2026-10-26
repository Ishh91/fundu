const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const realmeCatalog = [
  // SERIES 1: REALME GT SERIES
  { name: 'Realme GT 6 5G', variant: '256 GB', price: 19240 },
  { name: 'Realme GT 6 5G', variant: '512 GB', price: 22800 },
  { name: 'Realme GT 6T 5G', variant: '128 GB', price: 16450 },
  { name: 'Realme GT 6T 5G', variant: '256 GB', price: 18200 },
  { name: 'Realme GT 3', variant: '1 TB', price: 21500 },
  { name: 'Realme GT 2 Pro 5G', variant: '128 GB', price: 14800 },
  { name: 'Realme GT 2 5G', variant: '128 GB', price: 12400 },
  { name: 'Realme GT Neo 3', variant: '256 GB', price: 13600 },
  { name: 'Realme GT Neo 3', variant: '128 GB', price: 11900 },
  { name: 'Realme GT Neo 3T 5G', variant: '128 GB', price: 11200 },
  { name: 'Realme GT Master Edition 5G', variant: '128 GB', price: 9450 },

  // SERIES 2: REALME NUMBER SERIES (13 & 12 GENERATIONS)
  { name: 'Realme 13 Pro Plus 5G', variant: '256 GB', price: 16890 },
  { name: 'Realme 13 Pro 5G', variant: '128 GB', price: 14500 },
  { name: 'Realme 13+ 5G', variant: '128 GB', price: 12800 },
  { name: 'Realme 13 5G', variant: '128 GB', price: 10900 },
  { name: 'Realme 12 Pro Plus 5G', variant: '128 GB', price: 14850 },
  { name: 'Realme 12 Pro Plus 5G', variant: '256 GB', price: 15700 },
  { name: 'Realme 12 Pro 5G', variant: '128 GB', price: 12400 },
  { name: 'Realme 12+ 5G', variant: '128 GB', price: 11600 },
  { name: 'Realme 12 5G', variant: '128 GB', price: 9800 },
  { name: 'Realme 12x 5G', variant: '128 GB', price: 8200 },
  { name: 'Realme 11 Pro Plus 5G', variant: '256 GB', price: 12900 },
  { name: 'Realme 11 Pro 5G', variant: '128 GB', price: 11400 },
  { name: 'Realme 11 5G', variant: '128 GB', price: 9600 },
  { name: 'Realme 11x 5G', variant: '128 GB', price: 8700 },
  { name: 'Realme 10 Pro Plus 5G', variant: '128 GB', price: 10500 },

  // SERIES 3: REALME NUMBER SERIES (10, 9, 8 & 7 GENERATIONS)
  { name: 'Realme 10 Pro 5G', variant: '128 GB', price: 9200 },
  { name: 'Realme 10', variant: '64 GB', price: 7400 },
  { name: 'Realme 9 Pro Plus 5G', variant: '128 GB', price: 9800 },
  { name: 'Realme 9 Pro 5G', variant: '128 GB', price: 8600 },
  { name: 'Realme 9 5G Speed Edition', variant: '128 GB', price: 8900 },
  { name: 'Realme 9 5G', variant: '64 GB', price: 7200 },
  { name: 'Realme 9', variant: '128 GB', price: 7500 },
  { name: 'Realme 9i 5G', variant: '64 GB', price: 6800 },
  { name: 'Realme 9i', variant: '64 GB', price: 5900 },
  { name: 'Realme 8 Pro', variant: '128 GB', price: 7400 },
  { name: 'Realme 8 5G', variant: '64 GB', price: 6600 },
  { name: 'Realme 8', variant: '128 GB', price: 9740 },
  { name: 'Realme 8s 5G', variant: '128 GB', price: 6900 },
  { name: 'Realme 8i', variant: '64 GB', price: 5800 },
  { name: 'Realme 7 Pro', variant: '128 GB', price: 6200 },
  { name: 'Realme 7', variant: '64 GB', price: 5400 },

  // SERIES 4: REALME P-SERIES
  { name: 'Realme P2 Pro 5G', variant: '128 GB', price: 13500 },
  { name: 'Realme P2 Pro 5G', variant: '256 GB', price: 15200 },
  { name: 'Realme P1 Pro 5G', variant: '128 GB', price: 11800 },
  { name: 'Realme P1 Pro 5G', variant: '256 GB', price: 12700 },
  { name: 'Realme P1 5G', variant: '128 GB', price: 9900 },
  { name: 'Realme P1 5G', variant: '128 GB', price: 10500 },
  { name: 'Realme P1 Speed 5G', variant: '128 GB', price: 11400 },
  { name: 'Realme P1 Speed 5G', variant: '256 GB', price: 12800 },

  // SERIES 5: REALME NARZO SERIES
  { name: 'Realme Narzo 70 Pro 5G', variant: '128 GB', price: 12400 },
  { name: 'Realme Narzo 70 Turbo 5G', variant: '128 GB', price: 10800 },
  { name: 'Realme Narzo 70 5G', variant: '128 GB', price: 7900 },
  { name: 'Realme Narzo 70x 5G', variant: '128 GB', price: 7900 },
  { name: 'Realme Narzo N65 5G', variant: '64 GB', price: 5400 },
  { name: 'Realme Narzo N63', variant: '64 GB', price: 5400 },
  { name: 'Realme Narzo 60 Pro 5G', variant: '128 GB', price: 11800 },
  { name: 'Realme Narzo 60 5G', variant: '128 GB', price: 7800 },
  { name: 'Realme Narzo 60x 5G', variant: '128 GB', price: 7800 },
  { name: 'Realme Narzo N55', variant: '64 GB', price: 5600 },
  { name: 'Realme Narzo N53', variant: '64 GB', price: 5600 },
  { name: 'Realme Narzo 50 Pro 5G', variant: '64 GB', price: 7100 },
  { name: 'Realme Narzo 50 5G', variant: '64 GB', price: 7100 },
  { name: 'Realme Narzo 50', variant: '64 GB', price: 4800 },
  { name: 'Realme Narzo 50A Prime', variant: '64 GB', price: 4800 },
  { name: 'Realme Narzo 30 Pro 5G', variant: '64 GB', price: 5800 },
  { name: 'Realme Narzo 30 5G', variant: '64 GB', price: 5800 },
  { name: 'Realme Narzo 20 Pro', variant: '64 GB', price: 4900 },
  { name: 'Realme Narzo 20', variant: '64 GB', price: 4200 },

  // SERIES 6: REALME C-SERIES
  { name: 'Realme C65 5G', variant: '64 GB', price: 6800 },
  { name: 'Realme C63', variant: '64 GB', price: 5800 },
  { name: 'Realme C61', variant: '64 GB', price: 4490 },
  { name: 'Realme C55', variant: '64 GB', price: 5900 },
  { name: 'Realme C53', variant: '64 GB', price: 4600 },
  { name: 'Realme C51', variant: '64 GB', price: 4600 },
  { name: 'Realme C35', variant: '64 GB', price: 4800 },
  { name: 'Realme C25s', variant: '64 GB', price: 4200 },
  { name: 'Realme C25_Y', variant: '64 GB', price: 4200 },
  { name: 'Realme C25', variant: '64 GB', price: 4200 },

  // SERIES 7: REALME X-SERIES & CLASSIC PIONEERS
  { name: 'Realme X50 Pro 5G', variant: '128 GB', price: 9800 },
  { name: 'Realme X3 SuperZoom', variant: '128 GB', price: 7900 },
  { name: 'Realme X3', variant: '128 GB', price: 7900 },
  { name: 'Realme X2 Pro', variant: '128 GB', price: 7800 },
  { name: 'Realme X2', variant: '64 GB', price: 6400 },
  { name: 'Realme XT', variant: '64 GB', price: 5800 },
  { name: 'Realme X', variant: '128 GB', price: 5400 },
  { name: 'Realme 6 Pro', variant: '64 GB', price: 4600 },
  { name: 'Realme 6', variant: '64 GB', price: 4600 },
  { name: 'Realme 5 Pro', variant: '64 GB', price: 3800 },
  { name: 'Realme 5s', variant: '64 GB', price: 3800 }
];

function normalizeKey(str) {
  return (str || '')
    .toLowerCase()
    .replace(/^realme\s+/i, '')
    .replace(/\+/g, 'plus')
    .replace(/\s*5g\b/gi, '')
    .replace(/\s*\(.*?\)/g, '')
    .replace(/[^a-z0-9]/g, '');
}

async function run() {
  console.log(`Auditing & syncing ${realmeCatalog.length} Realme models...`);

  // 1. UPDATE phonesCatalog.json
  const phonesCatalogPath = path.join(__dirname, '../server/config/phonesCatalog.json');
  let phonesCatalog = [];
  if (fs.existsSync(phonesCatalogPath)) {
    phonesCatalog = JSON.parse(fs.readFileSync(phonesCatalogPath, 'utf8'));
  }
  let phonesCatalogUpdated = 0;

  phonesCatalog.forEach(phone => {
    if (phone.brand && phone.brand.toLowerCase() === 'realme') {
      const pNorm = normalizeKey(phone.model);
      const match = realmeCatalog.find(r => normalizeKey(r.name) === pNorm);
      if (match) {
        phone.base_resale_value = match.price;
        phone.price = match.price;
        phonesCatalogUpdated++;
      }
    }
  });
  fs.writeFileSync(phonesCatalogPath, JSON.stringify(phonesCatalog, null, 2), 'utf8');
  console.log(`phonesCatalog.json: Updated ${phonesCatalogUpdated} Realme models.`);

  // 2. UPDATE masterModelCatalog.ts
  const masterPath = path.join(__dirname, '../src/data/masterModelCatalog.ts');
  const masterContent = fs.readFileSync(masterPath, 'utf8');
  const mAnchor = masterContent.indexOf('export const MASTER_MODEL_CATALOG =');
  const mStart = masterContent.indexOf('[', mAnchor);
  const storageIdx = masterContent.indexOf('export const STORAGE_OPTIONS', mStart);
  const mEnd = masterContent.lastIndexOf(']', storageIdx);

  const masterList = JSON.parse(masterContent.substring(mStart, mEnd + 1));
  let masterUpdated = 0;

  masterList.forEach(item => {
    if (item.brand && item.brand.toLowerCase() === 'realme') {
      const normK = normalizeKey(item.model);
      const match = realmeCatalog.find(r => normalizeKey(r.name) === normK);
      if (match) {
        item.price = match.price;
        masterUpdated++;
      }
    }
  });

  const newMasterContent = masterContent.substring(0, mStart) + JSON.stringify(masterList, null, 2) + masterContent.substring(mEnd + 1);
  fs.writeFileSync(masterPath, newMasterContent, 'utf8');
  console.log(`masterModelCatalog.ts: Updated ${masterUpdated} Realme model entries.`);

  // 3. UPDATE indianPhonesCatalog.ts
  const indianPath = path.join(__dirname, '../src/data/indianPhonesCatalog.ts');
  const indianContent = fs.readFileSync(indianPath, 'utf8');
  const iAnchor = indianContent.indexOf('ALL_INDIAN_PHONES_CATALOG');
  const eqIdx = indianContent.indexOf('=', iAnchor);
  const iStart = indianContent.indexOf('[', eqIdx);
  const funcIdx = indianContent.indexOf('export function getIndianPhoneByModel');
  const iEnd = indianContent.lastIndexOf(']', funcIdx);

  const indianList = JSON.parse(indianContent.substring(iStart, iEnd + 1));
  let indianUpdated = 0;

  indianList.forEach(item => {
    if (item.brand && item.brand.toLowerCase() === 'realme') {
      const normK = normalizeKey(item.model);
      const match = realmeCatalog.find(r => normalizeKey(r.name) === normK);
      if (match) {
        item.base_resale_value = match.price;
        if (item.price) item.price = match.price;
        indianUpdated++;
      }
    }
  });

  const newIndianContent = indianContent.substring(0, iStart) + JSON.stringify(indianList, null, 2) + indianContent.substring(iEnd + 1);
  fs.writeFileSync(indianPath, newIndianContent, 'utf8');
  console.log(`indianPhonesCatalog.ts: Updated ${indianUpdated} Realme model entries.`);

  // 4. UPDATE brandSeriesCatalog.ts
  const brandSeriesCatalogPath = path.join(__dirname, '../src/data/brandSeriesCatalog.ts');
  let brandSeriesContent = fs.readFileSync(brandSeriesCatalogPath, 'utf8');
  let brandSeriesUpdated = 0;

  realmeCatalog.forEach(item => {
    const cleanPattern = item.name.replace(/\\/g, '\\\\').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(model:\\s*['"](?:Realme\\s+)?${cleanPattern}['"][\\s\\S]*?price:\\s*)\\d+`, 'gi');
    if (regex.test(brandSeriesContent)) {
      brandSeriesContent = brandSeriesContent.replace(regex, `$1${item.price}`);
      brandSeriesUpdated++;
    }
  });
  fs.writeFileSync(brandSeriesCatalogPath, brandSeriesContent, 'utf8');
  console.log(`brandSeriesCatalog.ts: Updated ${brandSeriesUpdated} Realme models.`);

  // 5. UPDATE MongoDB Atlas
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME || 'fundu' });
  const db = mongoose.connection.db;

  const priceDiffs = [];

  // Update existing sellpriceconfigs
  const existingConfigs = await db.collection('sellpriceconfigs').find({ brand: /realme/i }).toArray();
  for (const doc of existingConfigs) {
    const docNorm = normalizeKey(doc.model);
    const match = realmeCatalog.find(r => normalizeKey(r.name) === docNorm);
    if (match) {
      if (doc.base_price !== match.price) {
        priceDiffs.push({
          model: doc.model,
          storage: doc.storage,
          oldPrice: doc.base_price,
          newPrice: match.price,
          diff: match.price - doc.base_price
        });
        await db.collection('sellpriceconfigs').updateOne(
          { _id: doc._id },
          { $set: { base_price: match.price, updated_at: new Date() } }
        );
      }
    }
  }

  // Also upsert missing models
  for (const item of realmeCatalog) {
    const cleanModel = item.name.replace(/^realme\s+/i, '');
    const normK = normalizeKey(cleanModel);
    const exists = existingConfigs.some(c => normalizeKey(c.model) === normK);
    if (!exists) {
      const storageClean = item.variant.replace(/\s+/g, '');
      await db.collection('sellpriceconfigs').insertOne({
        brand: 'Realme',
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
        updated_at: new Date()
      });
      priceDiffs.push({
        model: cleanModel,
        storage: storageClean,
        oldPrice: 'Not Listed',
        newPrice: item.price,
        diff: 0
      });
    }

    // Update masterphones collection
    await db.collection('masterphones').updateMany(
      {
        brand: /realme/i,
        $or: [
          { model: new RegExp(`^${cleanModel.replace(/[^a-zA-Z0-9]/g, '.*')}$`, 'i') },
          { model: new RegExp(`^Realme\\s+${cleanModel.replace(/[^a-zA-Z0-9]/g, '.*')}$`, 'i') }
        ]
      },
      {
        $set: {
          base_resale_value: item.price,
          price: item.price,
          updated_at: new Date()
        }
      }
    );
  }

  console.log(`\n🎉 Realme Sync Complete!`);
  console.log(`Price revisions detected & updated: ${priceDiffs.length}`);
  console.log('Sample updated items:');
  priceDiffs.slice(0, 15).forEach(p => {
    console.log(`- ${p.model} (${p.storage}): ₹${p.oldPrice} -> ₹${p.newPrice} (${p.diff >= 0 ? '+' : ''}${p.diff})`);
  });

  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Realme sync failed:', err);
  process.exit(1);
});
