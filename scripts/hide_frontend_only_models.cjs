/**
 * Hides the models of one brand that the frontend catalogs list but the database (sellpriceconfigs) does not, so the sell and repair
 * lists follow the database.
 *
 * The lists hide a model through an inactive sellpriceconfigs row (what the admin "delete model" does), so this adds one such row per
 * model. Nothing is deleted and no price or image is touched. The rows carry is_locked and manual_override, because the backend
 * auto-sync (server/config/seedPhones.js) deletes every row without them.
 *
 * Dry run by default; pass --apply to write.
 *
 *   node scripts/hide_frontend_only_models.cjs --brand infinix
 *   node scripts/hide_frontend_only_models.cjs --brand infinix --apply
 */
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const APPLY = process.argv.includes('--apply');
const brandArg = process.argv[process.argv.indexOf('--brand') + 1];
if (!brandArg || brandArg.startsWith('--')) {
  console.error('Pass --brand <name>, e.g. --brand infinix');
  process.exit(1);
}
const BRAND = brandArg.toLowerCase();
const ROOT = path.join(__dirname, '..');

const FRONTEND_FILES = ['src/data/masterModelCatalog.ts', 'src/data/indianPhonesCatalog.ts', 'src/data/brandSeriesCatalog.ts'];

const brandPrefix = new RegExp(`^${BRAND}\\s+`, 'i');
const modelKey = (model) => String(model || '').toLowerCase().replace(brandPrefix, '').replace(/\+/g, 'plus').replace(/\s*5g\b/g, '').replace(/[^a-z0-9]/g, '');
const titleCase = (s) => s.replace(/^./, (c) => c.toUpperCase());

/** Every model of the brand named in the frontend catalogs and in server/config/phonesCatalog.json, by key. */
function frontendModels() {
  const found = new Map();
  const add = (name) => {
    const clean = String(name).replace(brandPrefix, '').trim();
    const key = modelKey(clean);
    if (key && !found.has(key)) found.set(key, clean);
  };
  const pattern = new RegExp(`["']?model["']?\\s*:\\s*["'](${BRAND}\\s[^"']+)["']`, 'gi');
  for (const file of FRONTEND_FILES) {
    for (const match of fs.readFileSync(path.join(ROOT, file), 'utf8').matchAll(pattern)) add(match[1]);
  }
  const phones = JSON.parse(fs.readFileSync(path.join(ROOT, 'server/config/phonesCatalog.json'), 'utf8'));
  phones.filter((p) => String(p.brand || '').toLowerCase() === BRAND).forEach((p) => add(p.model));
  return found;
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME || 'fundu' });
  const rows = mongoose.connection.db.collection('sellpriceconfigs');
  const inDb = new Set((await rows.find({ brand: new RegExp(`^${BRAND}$`, 'i') }).toArray()).map((row) => modelKey(row.model)));

  const extras = [...frontendModels()].filter(([key]) => !inDb.has(key));
  console.log(`${APPLY ? 'APPLYING' : 'DRY RUN'}: ${titleCase(BRAND)}: ${inDb.size} models in the database, ${extras.length} only in the frontend catalogs.`);
  extras.forEach(([, name]) => console.log(`  x ${name}`));

  if (APPLY) {
    for (const [, name] of extras) {
      await rows.insertOne({
        brand: titleCase(BRAND), model: name, storage: '128GB', base_price: 0, is_active: false,
        is_locked: true, manual_override: true, created_at: new Date(), updated_at: new Date(),
      });
    }
    console.log(`\nDone: ${extras.length} models hidden.`);
  } else {
    console.log('\nNothing was written. Run again with --apply to do it.');
  }
  await mongoose.disconnect();
}

run().catch((err) => { console.error('Hide failed:', err); process.exit(1); });
