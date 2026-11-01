const mongoose = require('mongoose');
const fs = require('fs');

async function run() {
  await mongoose.connect('mongodb+srv://trustiqueassist0003_db_user:r1BrCdYiCcPgBxK6@cluster0.w56fxzj.mongodb.net/?appName=Cluster0', {
    dbName: 'fundu',
    serverSelectionTimeoutMS: 8000,
  });

  const Cfg = mongoose.model('SellPriceConfig', new mongoose.Schema({}, { strict: false }));
  const MP = mongoose.model('MasterPhone', new mongoose.Schema({}, { strict: false }));

  const catalog = JSON.parse(fs.readFileSync('server/config/phonesCatalog.json', 'utf8'));
  const infinixCatalog = catalog.filter(p => p.brand.toLowerCase() === 'infinix');
  console.log(`Phones in phonesCatalog for Infinix: ${infinixCatalog.length}`);

  const catMap = new Map();
  infinixCatalog.forEach(p => {
    const clean = p.model.toLowerCase().replace(/^infinix\s+/i, '').trim();
    catMap.set(clean, p);
  });

  const dbCfgs = await Cfg.find({ brand: /infinix/i }).lean();
  console.log(`Infinix configs in SellPriceConfig: ${dbCfgs.length}`);

  console.log('\n--- Comparing SellPriceConfig vs phonesCatalog.json ---');
  for (const c of dbCfgs) {
    const clean = c.model.toLowerCase().replace(/^infinix\s+/i, '').trim();
    const cat = catMap.get(clean);
    const catPrice = cat ? (cat.base_resale_value || cat.price) : 'NOT IN CATALOG';
    if (cat && catPrice !== c.base_price) {
      console.log(`MISMATCH: "${c.model}" -> SellPriceConfig: ₹${c.base_price} | Catalog: ₹${catPrice} | is_active: ${c.is_active}`);
    } else {
      console.log(`OK: "${c.model}" -> ₹${c.base_price} (active: ${c.is_active})`);
    }
  }

  await mongoose.disconnect();
}

run().catch(console.error);

