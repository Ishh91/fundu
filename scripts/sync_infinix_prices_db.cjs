const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not set. Add it to the .env file in the project root.');
  process.exit(1);
}
const fs = require('fs');

async function syncPrices() {
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: 'fundu',
    serverSelectionTimeoutMS: 8000,
  });

  const Cfg = mongoose.model('SellPriceConfig', new mongoose.Schema({}, { strict: false }));
  const MP = mongoose.model('MasterPhone', new mongoose.Schema({}, { strict: false }));

  const catalog = JSON.parse(fs.readFileSync('server/config/phonesCatalog.json', 'utf8'));
  const infinixCatalog = catalog.filter(p => p.brand.toLowerCase() === 'infinix');

  const catMap = new Map();
  infinixCatalog.forEach(p => {
    const clean = p.model.toLowerCase().replace(/^infinix\s+/i, '').trim();
    catMap.set(clean, p);
  });

  // Disabled models set by admin that must remain disabled:
  const disabledModels = new Set(['note 40 pro+ 5g', 'gt 20 pro 5g', 'hot 40 pro', 'zero 30 5g']);

  console.log('Cleaning up duplicate Infinix records in SellPriceConfig...');
  const existingCfgs = await Cfg.find({ brand: /infinix/i }).lean();

  const seen = new Set();
  for (const c of existingCfgs) {
    const clean = c.model.toLowerCase().replace(/^infinix\s+/i, '').trim();
    if (seen.has(clean)) {
      console.log(`Removing duplicate SellPriceConfig: ${c.model} (${c._id})`);
      await Cfg.deleteOne({ _id: c._id });
    } else {
      seen.add(clean);
      const cat = catMap.get(clean);
      const correctPrice = cat ? (cat.base_resale_value || cat.price) : c.base_price;
      const shouldBeDisabled = disabledModels.has(clean) || c.is_active === false;

      await Cfg.updateOne(
        { _id: c._id },
        {
          $set: {
            base_price: correctPrice,
            is_active: !shouldBeDisabled,
            model: cat ? cat.model : c.model,
          }
        }
      );
      console.log(`Updated SellPriceConfig: ${c.model} -> ₹${correctPrice} (active: ${!shouldBeDisabled})`);
    }
  }

  // Also update master_phones in MongoDB for these disabled models
  console.log('\nSyncing master_phones for disabled models...');
  for (const modelKey of disabledModels) {
    const cat = catMap.get(modelKey);
    const mName = cat ? cat.model : modelKey;
    const variants = [mName, `Infinix ${mName}`, modelKey];

    const res = await MP.updateMany(
      { brand: /infinix/i, model: { $in: variants } },
      { $set: { is_active: false } }
    );
    console.log(`Set is_active: false on master_phones for "${mName}" (matched ${res.modifiedCount} docs)`);
  }

  await mongoose.disconnect();
  console.log('\nSync complete!');
}

syncPrices().catch(console.error);

