/**
 * Adds the Ai+ phones that Cashify lists (sell-old-mobile-phone/sell-ai-plus, 20 Nov 2026) to the database.
 *
 * Each model gets one `masterphones` row (the sell page builds its model list from master_phones) and one `sellpriceconfigs` row per
 * storage (the price the quote starts from). The price of a storage is Cashify's "Get Upto" for its smallest-RAM variant: rows carry no RAM,
 * so a 6 GB variant is not priced apart from the 4 GB one.
 *
 * Rows already there are left alone. Rows written carry is_locked and manual_override because the backend auto-sync
 * (server/config/seedPhones.js) deletes every sellpriceconfigs row without them. No image is set.
 *
 * Dry run by default; pass --apply to write.
 *
 *   node scripts/add_ai_plus_models.cjs
 *   node scripts/add_ai_plus_models.cjs --apply
 */
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const APPLY = process.argv.includes('--apply');
const BRAND = 'Ai+';
const ADMIN_ROW = { is_locked: true, manual_override: true };

// model, release year, RAM options, [storage, price] pairs (price = Cashify "Get Upto" for the smallest-RAM variant of that storage)
const MODELS = [
  { model: 'Nova 2 5G', year: 2025, ram: ['4 GB', '6 GB'], storages: [['64 GB', 8200], ['128 GB', 8600]] },
  { model: 'Nova 2 Neo 5G', year: 2025, ram: ['4 GB', '6 GB'], storages: [['64 GB', 8500], ['128 GB', 9200]] },
  { model: 'Nova 2 Power 5G', year: 2025, ram: ['6 GB', '8 GB'], storages: [['128 GB', 10000]] },
  { model: 'Nova 2 Pro 5G', year: 2025, ram: ['6 GB', '8 GB'], storages: [['128 GB', 10500]] },
  { model: 'Nova 2 Ultra 5G', year: 2025, ram: ['6 GB', '8 GB'], storages: [['128 GB', 12300]] },
  { model: 'NovaFlip 5G', year: 2025, ram: ['8 GB'], storages: [['256 GB', 25000]] },
  { model: 'Pulse 2', year: 2025, ram: ['4 GB', '6 GB'], storages: [['64 GB', 6400], ['128 GB', 6700]] },
  { model: 'Pulse 2 FE', year: 2025, ram: ['4 GB'], storages: [['64 GB', 6000]] },
];

const key = (text) => String(text || '').toLowerCase().replace(/^ai\+?\s*/, '').replace(/\+/g, 'plus').replace(/\s*5g\b/g, '').replace(/[^a-z0-9]/g, '');
const storageKey = (storage) => String(storage || '').toUpperCase().replace(/\s+/g, '');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME || 'fundu' });
  const db = mongoose.connection.db;
  const phones = db.collection('masterphones');
  const configs = db.collection('sellpriceconfigs');

  const brandRegex = /^ai\+$/i;
  const havePhones = new Set((await phones.find({ brand: brandRegex }).toArray()).map((row) => key(row.model)));
  const haveConfigs = new Set((await configs.find({ brand: brandRegex }).toArray()).map((row) => `${key(row.model)}|${storageKey(row.storage)}`));

  const newPhones = MODELS.filter((m) => !havePhones.has(key(m.model)));
  const newConfigs = MODELS.flatMap((m) => m.storages.map(([storage, price]) => ({ m, storage, price })))
    .filter(({ m, storage }) => !haveConfigs.has(`${key(m.model)}|${storageKey(storage)}`));

  console.log(`${APPLY ? 'APPLYING' : 'DRY RUN'}: ${BRAND}: ${havePhones.size} models and ${haveConfigs.size} price rows already in the database.`);
  console.log(`\nAdd to masterphones (${newPhones.length}):`);
  newPhones.forEach((m) => console.log(`  + ${m.model}  RAM ${m.ram.join('/')}  storage ${m.storages.map(([s]) => s).join('/')}`));
  console.log(`\nAdd to sellpriceconfigs (${newConfigs.length}):`);
  newConfigs.forEach(({ m, storage, price }) => console.log(`  + ${m.model} ${storage}  base_price ${price}`));

  if (APPLY) {
    const now = new Date();
    for (const m of newPhones) {
      const top = Math.max(...m.storages.map(([, price]) => price));
      await phones.insertOne({
        brand: BRAND, model: m.model, base_resale_value: top, price: top, default_mrp: Math.round(top * 1.5),
        storage_options: m.storages.map(([s]) => s), ram_options: m.ram, is_5g: /5g/i.test(m.model),
        release_year: m.year, is_active: true, updated_at: now,
      });
    }
    for (const { m, storage, price } of newConfigs) {
      await configs.insertOne({
        brand: BRAND, model: m.model, storage, base_price: price,
        excellent_multiplier: 1.0, good_multiplier: 0.85, fair_multiplier: 0.7, box_bonus: 600, charger_bonus: 400,
        is_active: true, ...ADMIN_ROW, created_at: now, updated_at: now,
      });
    }
    console.log(`\nDone: ${newPhones.length} models and ${newConfigs.length} price rows added.`);
  } else {
    console.log('\nNothing was written. Run again with --apply to do it.');
  }
  await mongoose.disconnect();
}

run().catch((err) => { console.error('Ai+ add failed:', err); process.exit(1); });
