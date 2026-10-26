const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://trustiqueassist0003_db_user:r1BrCdYiCcPgBxK6@cluster0.w56fxzj.mongodb.net/fundu?appName=Cluster0';

async function checkCatalogSync() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;

  const catalog = JSON.parse(fs.readFileSync(path.join(__dirname, '../server/config/phonesCatalog.json'), 'utf8'));
  console.log(`Checking ${catalog.length} items in phonesCatalog.json against MongoDB sellpriceconfigs...`);

  let updatedCount = 0;
  let insertedCount = 0;

  for (const item of catalog) {
    const brand = item.brand;
    let model = item.model;
    if (brand && model.toLowerCase().startsWith(brand.toLowerCase())) {
      model = model.slice(brand.length).trim();
    }
    const price = item.price || item.base_resale_value;
    if (!price || price <= 0) continue;

    const storage = item.storage_options?.[0] || '128 GB';
    const storageClean = storage.replace(/\s+/g, '');

    // Check if exists in sellpriceconfigs
    const existing = await db.collection('sellpriceconfigs').findOne({
      brand: new RegExp(`^${brand}$`, 'i'),
      model: new RegExp(`^${model.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
    });

    if (existing) {
      if (existing.base_price !== price) {
        await db.collection('sellpriceconfigs').updateOne(
          { _id: existing._id },
          { $set: { base_price: price, updated_at: new Date() } }
        );
        updatedCount++;
      }
    } else {
      await db.collection('sellpriceconfigs').insertOne({
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
      });
      insertedCount++;
    }
  }

  console.log(`Sync complete: updated ${updatedCount} prices, inserted ${insertedCount} missing models.`);
  await mongoose.disconnect();
}

checkCatalogSync();
