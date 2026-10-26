const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const syncScriptContent = fs.readFileSync('./scripts/sync_all_seven_catalog_prices.cjs', 'utf8');
const pStart = syncScriptContent.indexOf('const allBrandPrices = [');
const pEnd = syncScriptContent.indexOf('];\n\nfunction normalizeKey', pStart);
const arrayStr = syncScriptContent.substring(syncScriptContent.indexOf('[', pStart), pEnd + 1);
const allBrandPrices = eval(arrayStr);

function normalizeKey(str) {
  return (str || '')
    .toLowerCase()
    .replace(/^samsung\s+|^motorola\s+|^moto\s+|^lenovo\s+|^infinix\s+|^google\s+|^honor\s+|^nokia\s+/i, '')
    .replace(/\s*5g\b/gi, '')
    .replace(/\s*\(.*?\)/g, '')
    .replace(/[^a-z0-9]/g, '');
}

async function deepUpdate() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'fundu' });
  const db = mongoose.connection.db;

  const configs = await db.collection('sellpriceconfigs').find({}).toArray();
  let updatedConfigs = 0;

  for (const doc of configs) {
    const docNorm = normalizeKey(doc.model);
    const match = allBrandPrices.find(p => 
      p.brand.toLowerCase() === doc.brand.toLowerCase() && 
      normalizeKey(p.name) === docNorm
    );
    if (match && doc.base_price !== match.price) {
      await db.collection('sellpriceconfigs').updateOne(
        { _id: doc._id },
        { $set: { base_price: match.price, updated_at: new Date() } }
      );
      updatedConfigs++;
    }
  }
  console.log('sellpriceconfigs updated to exact catalog values:', updatedConfigs);

  const masters = await db.collection('masterphones').find({}).toArray();
  let updatedMasters = 0;
  for (const doc of masters) {
    const docNorm = normalizeKey(doc.model);
    const match = allBrandPrices.find(p => 
      p.brand.toLowerCase() === doc.brand.toLowerCase() && 
      normalizeKey(p.name) === docNorm
    );
    if (match && (doc.price !== match.price || doc.base_resale_value !== match.price)) {
      await db.collection('masterphones').updateOne(
        { _id: doc._id },
        { $set: { base_resale_value: match.price, price: match.price, updated_at: new Date() } }
      );
      updatedMasters++;
    }
  }
  console.log('masterphones updated to exact catalog values:', updatedMasters);

  // Spot-check
  const queries = [
    { brand: 'Samsung', model: /S24 Ultra/i },
    { brand: 'Motorola', model: /Razr 50 Ultra/i },
    { brand: 'Google', model: /Pixel 9 Pro Fold/i },
    { brand: 'Lenovo', model: /Z6 Pro/i },
    { brand: 'Infinix', model: /Zero 30/i },
    { brand: 'Nokia', model: /X30/i },
    { brand: 'Honor', model: /Magic 6 Pro/i },
  ];
  console.log('\nVerified updated samples in MongoDB:');
  for (const q of queries) {
    const items = await db.collection('sellpriceconfigs').find(q).toArray();
    items.forEach(item => {
      console.log(`- [${item.brand}] ${item.model} (${item.storage}): ₹${item.base_price}`);
    });
  }

  await mongoose.disconnect();
}

deepUpdate().catch(console.error);
