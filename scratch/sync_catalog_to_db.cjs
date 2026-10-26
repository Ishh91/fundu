const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://trustiqueassist0003_db_user:r1BrCdYiCcPgBxK6@cluster0.w56fxzj.mongodb.net/fundu?appName=Cluster0';

function normalizeKey(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/\b5g\b/gi, '')
    .replace(/[^a-z0-9]/g, '');
}

async function bulkSync() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;

  const catalog = JSON.parse(fs.readFileSync(path.join(__dirname, '../server/config/phonesCatalog.json'), 'utf8'));
  console.log(`Loaded ${catalog.length} items from phonesCatalog.json.`);

  // Load all existing sellpriceconfigs in one query
  const allConfigs = await db.collection('sellpriceconfigs').find().toArray();
  console.log(`Loaded ${allConfigs.length} existing sellpriceconfigs from MongoDB.`);

  const configMap = new Map();
  allConfigs.forEach(c => {
    const key = `${(c.brand || '').toLowerCase().trim()}:${normalizeKey(c.model)}`;
    configMap.set(key, c);
  });

  const updates = [];
  const inserts = [];

  for (const item of catalog) {
    const brand = item.brand;
    let model = item.model;
    if (brand && model.toLowerCase().startsWith(brand.toLowerCase())) {
      model = model.slice(brand.length).trim();
    }
    const price = item.price || item.base_resale_value;
    if (!price || price <= 0) continue;

    const key = `${brand.toLowerCase().trim()}:${normalizeKey(model)}`;
    const existing = configMap.get(key);

    if (existing) {
      if (existing.base_price !== price) {
        updates.push({
          updateOne: {
            filter: { _id: existing._id },
            update: { $set: { base_price: price, updated_at: new Date() } }
          }
        });
      }
    } else {
      const storage = item.storage_options?.[0] || '128 GB';
      const storageClean = storage.replace(/\s+/g, '');
      inserts.push({
        insertOne: {
          document: {
            brand,
            model,
            storage: storageClean,
            base_price: price,
            excellent_multiplier: 0.85,
            good_multiplier: 0.70,
            fair_multiplier: 0.55,
            box_bonus: 500,
            charger_bonus: 400,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
          }
        }
      });
    }
  }

  console.log(`Prepared ${updates.length} updates and ${inserts.length} new inserts.`);

  if (updates.length > 0) {
    await db.collection('sellpriceconfigs').bulkWrite(updates);
    console.log(`Successfully updated ${updates.length} existing model prices in MongoDB!`);
  }

  if (inserts.length > 0) {
    await db.collection('sellpriceconfigs').bulkWrite(inserts);
    console.log(`Successfully inserted ${inserts.length} new models into MongoDB!`);
  }

  const finalTotal = await db.collection('sellpriceconfigs').countDocuments();
  console.log(`Final total sellpriceconfigs in MongoDB Atlas: ${finalTotal}`);

  await mongoose.disconnect();
}

bulkSync().catch(console.error);
