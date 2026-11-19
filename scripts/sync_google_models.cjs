/**
 * Makes the Google models in the sell price list match Cashify's Google list (sell-old-mobile-phone/sell-google, 19 Nov 2026).
 *
 *  - A Cashify model that is missing in `sellpriceconfigs` is added (one row per variant).
 *  - A Google model that Cashify does not list is switched off (is_active: false), which is what the admin "delete model" does: the sell page
 *    (and the repair lists, which use the same check) stop showing it. Rows are kept, so it can be switched back on.
 *  - Nothing else is touched: no existing price is changed and no image is touched.
 *
 * Dry run by default (reads only, prints the plan). Pass --apply to write.
 *
 *   node scripts/sync_google_models.cjs            # show what would change
 *   node scripts/sync_google_models.cjs --apply    # do it
 */
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const APPLY = process.argv.includes('--apply');

// [model, storage, price]. The price is only used for a model that is new: Cashify's "Get Upto" for that variant, so the row can be quoted.
const CASHIFY_GOOGLE = [
  ['Pixel 4a', '128 GB', 4390],
  ['Pixel 6a', '128 GB', 10750],
  ['Pixel 7', '128 GB', 15050], ['Pixel 7', '256 GB', 15610],
  ['Pixel 7 Pro', '128 GB', 18670], ['Pixel 7 Pro', '256 GB', 19160],
  ['Pixel 7a', '128 GB', 18210],
  ['Pixel 8', '128 GB', 25470], ['Pixel 8', '256 GB', 25680],
  ['Pixel 8 Pro', '128 GB', 32640], ['Pixel 8 Pro', '256 GB', 33120], ['Pixel 8 Pro', '512 GB', 33600],
  ['Pixel 8a', '128 GB', 24500], ['Pixel 8a', '256 GB', 25140],
  ['Pixel 9', '256 GB', 38400],
  ['Pixel 9 Pro', '256 GB', 51070],
  ['Pixel 9 Pro XL', '256 GB', 52660], ['Pixel 9 Pro XL', '512 GB', 53810],
  ['Pixel 9 Pro Fold', '256 GB', 66000],
  ['Pixel 9a', '256 GB', 28800],
  ['Pixel 10', '256 GB', 47000],
  ['Pixel 10 Pro', '256 GB', 65300],
  ['Pixel 10 Pro XL', '256 GB', 69650],
  ['Pixel 10 Pro Fold', '256 GB', 92750],
  ['Pixel 10a', '256 GB', 34500],
  ['Pixel 11', '256 GB', 60250], ['Pixel 11', '512 GB', 66250],
  ['Pixel 11 Pro', '256 GB', 72250], ['Pixel 11 Pro', '512 GB', 80250],
  ['Pixel 11 Pro XL', '256 GB', 80250], ['Pixel 11 Pro XL', '512 GB', 85250],
  ['Pixel 11 Pro Fold', '512 GB', 101250],
];

// Google models the frontend catalogs (masterModelCatalog, indianPhonesCatalog, brandSeriesCatalog) list but Cashify does not. They have
// no row in sellpriceconfigs, so a switched-off row is added for them.
const FRONTEND_EXTRAS = ['Pixel 2 XL', 'Pixel 3', 'Pixel 3 XL', 'Pixel 3a', 'Pixel 3a XL', 'Pixel 4', 'Pixel 4 XL', 'Pixel 5', 'Pixel 6', 'Pixel 6 Pro', 'Pixel C', 'Pixel Fold'];

// The backend auto-sync (server/config/seedPhones.js) deletes every sellpriceconfigs row that is neither manual_override nor is_locked.
// The admin's own save sets both, so rows written here set them too, or the next sync would wipe them.
const ADMIN_ROW = { is_locked: true, manual_override: true };

const modelKey = (model) => String(model || '').toLowerCase().replace(/^google\s+/, '').replace(/\+/g, 'plus').replace(/\s*5g\b/g, '').replace(/[^a-z0-9]/g, '');
const storageKey = (storage) => String(storage || '').toUpperCase().replace(/\s+/g, '');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME || 'fundu' });
  const rows = mongoose.connection.db.collection('sellpriceconfigs');
  const existing = await rows.find({ brand: /^google$/i }).toArray();

  const wanted = new Set(CASHIFY_GOOGLE.map(([model]) => modelKey(model)));
  const have = new Set(existing.map((row) => modelKey(row.model)));

  const toAdd = CASHIFY_GOOGLE.filter(([model]) => !have.has(modelKey(model)));
  const toRemove = existing.filter((row) => !wanted.has(modelKey(row.model)) && row.is_active !== false);
  const switchedOff = new Set(existing.filter((row) => row.is_active === false).map((row) => modelKey(row.model)));
  const extrasToMark = FRONTEND_EXTRAS.filter((model) => !have.has(modelKey(model)) && !switchedOff.has(modelKey(model)));
  const kept = [...have].filter((key) => wanted.has(key)).length;

  console.log(`${APPLY ? 'APPLYING' : 'DRY RUN'}: ${existing.length} Google rows in the sell list, ${wanted.size} models on Cashify.`);
  console.log(`\nStay as they are (${kept} models, prices untouched)`);
  console.log(`\nAdd (${new Set(toAdd.map(([m]) => modelKey(m))).size} models, ${toAdd.length} rows):`);
  toAdd.forEach(([model, storage, price]) => console.log(`  + ${model} ${storage}  base_price ${price}`));
  console.log(`\nSwitch off (${toRemove.length} existing rows not on Cashify; the row and its price stay):`);
  toRemove.forEach((row) => console.log(`  x ${row.model} ${row.storage}`));
  console.log(`\nHide from the frontend lists (${extrasToMark.length} models that have no row yet):`);
  extrasToMark.forEach((model) => console.log(`  x ${model}`));

  if (APPLY) {
    if (toRemove.length) await rows.updateMany({ _id: { $in: toRemove.map((row) => row._id) } }, { $set: { is_active: false, ...ADMIN_ROW, updated_at: new Date() } });
    for (const model of extrasToMark) {
      await rows.insertOne({ brand: 'Google', model, storage: '128GB', base_price: 0, is_active: false, ...ADMIN_ROW, created_at: new Date(), updated_at: new Date() });
    }
    for (const [model, storage, price] of toAdd) {
      await rows.insertOne({
        brand: 'Google', model, storage: storageKey(storage), base_price: price,
        excellent_multiplier: 0.85, good_multiplier: 0.70, fair_multiplier: 0.55, box_bonus: 500, charger_bonus: 400,
        is_active: true, ...ADMIN_ROW, created_at: new Date(), updated_at: new Date(),
      });
    }
    console.log(`\nDone: added ${toAdd.length}, switched off ${toRemove.length}, hidden ${extrasToMark.length}.`);
  } else {
    console.log('\nNothing was written. Run again with --apply to do it.');
  }
  await mongoose.disconnect();
}

run().catch((err) => { console.error('Google model sync failed:', err); process.exit(1); });
