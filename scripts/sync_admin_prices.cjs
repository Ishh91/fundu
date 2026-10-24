const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const phonesCatalogPath = path.join(__dirname, '../server/config/phonesCatalog.json');
const catalog = JSON.parse(fs.readFileSync(phonesCatalogPath, 'utf8'));

function cleanModelName(brand, model) {
  let m = String(model || '').trim();
  const b = String(brand || '').trim();
  if (b && m.toLowerCase().startsWith(b.toLowerCase())) {
    m = m.slice(b.length).trim();
  }
  return m;
}

function normalizeKey(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/\b5g\b/gi, '')
    .replace(/[^a-z0-9]/g, '');
}

async function run() {
  console.log('Connecting to MongoDB Atlas to synchronize Admin Sell Pricing...');
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME || 'fundu' });
  const db = mongoose.connection.db;

  // 1. Synchronize Apple iPhones
  const appleCatalog = catalog.filter(c => c.brand && c.brand.toLowerCase() === 'apple');
  console.log(`Found ${appleCatalog.length} Apple models in phonesCatalog.json.`);

  let appleMasterUpdated = 0;
  let appleConfigUpdated = 0;

  for (const item of appleCatalog) {
    const cleanName = cleanModelName('Apple', item.model);
    const price = item.price || item.base_resale_value;
    const storage = item.storage_options?.[0] || '128 GB';
    const storageClean = storage.replace(/\s+/g, '');

    // Update masterphones in MongoDB
    const resMaster = await db.collection('masterphones').updateMany(
      {
        brand: { $regex: /^apple$/i },
        $or: [
          { model: new RegExp(`^${cleanName.replace(/[^a-zA-Z0-9]/g, '.*')}$`, 'i') },
          { model: new RegExp(`^Apple\\s+${cleanName.replace(/[^a-zA-Z0-9]/g, '.*')}$`, 'i') }
        ]
      },
      {
        $set: {
          base_resale_value: price,
          price: price,
          updated_at: new Date()
        }
      }
    );
    appleMasterUpdated += resMaster.modifiedCount;

    // Update / upsert sellpriceconfigs for Admin Sell Pricing
    // First remove any stale variations with lowercase or bad formatting
    const normK = normalizeKey(cleanName);
    await db.collection('sellpriceconfigs').deleteMany({
      brand: { $regex: /^apple$/i },
      $expr: {
        $regexMatch: {
          input: { $replaceAll: { input: { $toLower: '$model' }, find: ' ', replacement: '' } },
          regex: `^${normK}$`
        }
      }
    });

    await db.collection('sellpriceconfigs').insertOne({
      brand: 'Apple',
      model: cleanName,
      storage: storageClean,
      base_price: price,
      excellent_multiplier: 0.85,
      good_multiplier: 0.70,
      fair_multiplier: 0.55,
      box_bonus: 600,
      charger_bonus: 400,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    });
    appleConfigUpdated++;
  }

  console.log(`Apple sync: Updated ${appleMasterUpdated} masterphones docs, inserted/updated ${appleConfigUpdated} sellpriceconfigs.`);

  // 2. Synchronize Vivo Phones
  const vivoCatalog = catalog.filter(c => c.brand && c.brand.toLowerCase() === 'vivo');
  console.log(`Found ${vivoCatalog.length} Vivo models in phonesCatalog.json.`);

  let vivoMasterUpdated = 0;
  let vivoConfigUpdated = 0;

  for (const item of vivoCatalog) {
    const cleanName = cleanModelName('Vivo', item.model);
    const price = item.price || item.base_resale_value;
    const storage = item.storage_options?.[0] || '128 GB';
    const storageClean = storage.replace(/\s+/g, '');

    // Update masterphones in MongoDB
    const resMaster = await db.collection('masterphones').updateMany(
      {
        brand: { $regex: /^vivo$/i },
        $or: [
          { model: new RegExp(`^${cleanName.replace(/[^a-zA-Z0-9]/g, '.*')}$`, 'i') },
          { model: new RegExp(`^Vivo\\s+${cleanName.replace(/[^a-zA-Z0-9]/g, '.*')}$`, 'i') }
        ]
      },
      {
        $set: {
          base_resale_value: price,
          price: price,
          updated_at: new Date()
        }
      }
    );
    vivoMasterUpdated += resMaster.modifiedCount;

    // Clean up duplicate/stale sellpriceconfigs for this model
    const normK = normalizeKey(cleanName);
    await db.collection('sellpriceconfigs').deleteMany({
      brand: { $regex: /^vivo$/i },
      $expr: {
        $regexMatch: {
          input: { $replaceAll: { input: { $toLower: '$model' }, find: ' ', replacement: '' } },
          regex: `^${normK}$`
        }
      }
    });

    await db.collection('sellpriceconfigs').insertOne({
      brand: 'Vivo',
      model: cleanName,
      storage: storageClean,
      base_price: price,
      excellent_multiplier: 0.85,
      good_multiplier: 0.70,
      fair_multiplier: 0.55,
      box_bonus: 400,
      charger_bonus: 400,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    });
    vivoConfigUpdated++;
  }

  console.log(`Vivo sync: Updated ${vivoMasterUpdated} masterphones docs, inserted/updated ${vivoConfigUpdated} sellpriceconfigs.`);

  // 3. Update localStorage fallback / local price overrides seed
  console.log('Verifying sellpriceconfigs counts in MongoDB Atlas...');
  const totalAppleConfigs = await db.collection('sellpriceconfigs').countDocuments({ brand: /apple/i });
  const totalVivoConfigs = await db.collection('sellpriceconfigs').countDocuments({ brand: /vivo/i });
  console.log(`Active Admin configs now in DB -> Apple: ${totalAppleConfigs}, Vivo: ${totalVivoConfigs}`);

  // Sample check Apple
  const sampleApple = await db.collection('sellpriceconfigs').find({ brand: /apple/i, model: /iPhone 16 Pro Max|iPhone 15|iPhone 11/i }).toArray();
  console.log('Sample Apple Admin configs:', sampleApple.map(s => ({ model: s.model, base_price: s.base_price })));

  // Sample check Vivo
  const sampleVivo = await db.collection('sellpriceconfigs').find({ brand: /vivo/i, model: /X300 Ultra|V40|T3 Pro/i }).toArray();
  console.log('Sample Vivo Admin configs:', sampleVivo.map(s => ({ model: s.model, base_price: s.base_price })));

  await mongoose.disconnect();
  console.log('✅ Admin Sell Pricing completely synchronized for both iPhone and Vivo!');
  process.exit(0);
}

run().catch(console.error);
