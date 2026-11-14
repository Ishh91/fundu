/**
 * Removes vendor ledger rows that were posted more than once for the same
 * sell request / repair booking, and lowers each vendor's outstanding balance
 * by the amount those repeated buyback payouts added.
 *
 *   node scripts/fix_duplicate_ledger.mjs            # report only, changes nothing
 *   node scripts/fix_duplicate_ledger.mjs --apply    # back up, then fix
 *
 * Needs MONGODB_URI (from the environment or the project's .env file).
 * With --apply, the removed rows and old balances are first saved to a JSON
 * file in backups/ so the change can be reviewed or undone by hand.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User, VendorLedger } from '../server/models/index.js';
import { ONCE_PER_JOB_TYPES, correctedBalance, findDuplicateLedgerEntries } from '../server/services/ledgerCleanup.js';
import { describeDbTarget, resolveDbName } from '../server/utils/dbTarget.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(ROOT, '.env') });

const shouldApply = process.argv.includes('--apply');
const rupees = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

const loadVendors = async (vendorIds) => {
  const validIds = vendorIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
  const vendors = await User.find({ _id: { $in: validIds } }).select('full_name business_name outstanding_balance').lean();
  return new Map(vendors.map((vendor) => [String(vendor._id), vendor]));
};

const buildBalanceChanges = (overchargeByVendor, vendorsById) =>
  Object.entries(overchargeByVendor).map(([vendorId, overcharge]) => {
    const vendor = vendorsById.get(vendorId);
    const before = vendor?.outstanding_balance || 0;
    return {
      vendorId,
      name: vendor ? vendor.business_name || vendor.full_name || vendorId : `${vendorId} (vendor not found)`,
      found: Boolean(vendor),
      overcharge,
      before,
      after: correctedBalance(before, overcharge),
    };
  });

const printReport = (duplicates, balanceChanges) => {
  console.log(`Duplicate ledger rows: ${duplicates.length}`);
  const byType = duplicates.reduce((counts, row) => ({ ...counts, [row.type]: (counts[row.type] || 0) + 1 }), {});
  Object.entries(byType).forEach(([type, count]) => console.log(`  ${type}: ${count}`));

  console.log(`\nVendors whose balance was overcharged: ${balanceChanges.length}`);
  balanceChanges.forEach((change) => {
    console.log(`  ${change.name}: ${rupees(change.before)} -> ${rupees(change.after)} (overcharged ${rupees(change.overcharge)})`);
  });
};

const writeBackup = async (duplicates, balanceChanges) => {
  const backupDir = path.join(ROOT, 'backups');
  await mkdir(backupDir, { recursive: true });
  const file = path.join(backupDir, `vendor-ledger-duplicates-${Date.now()}.json`);
  await writeFile(file, JSON.stringify({ removedRows: duplicates, balanceChanges }, null, 2), 'utf8');
  return file;
};

const applyFix = async (duplicates, balanceChanges) => {
  const backupFile = await writeBackup(duplicates, balanceChanges);
  console.log(`\nBackup written: ${backupFile}`);

  const { deletedCount } = await VendorLedger.deleteMany({ _id: { $in: duplicates.map((row) => row._id) } });
  console.log(`Removed ${deletedCount} duplicate ledger rows.`);

  for (const change of balanceChanges.filter((item) => item.found)) {
    await User.updateOne({ _id: change.vendorId }, { $set: { outstanding_balance: change.after } });
    console.log(`Balance corrected for ${change.name}: ${rupees(change.after)}`);
  }
};

const main = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set. Put it in .env or the environment.');

  const dbName = resolveDbName();
  console.log(`Database: ${describeDbTarget(uri, dbName)}
`);
  await mongoose.connect(uri, { dbName });
  const rows = await VendorLedger.find({ type: { $in: ONCE_PER_JOB_TYPES } }).lean();
  const { duplicates, overchargeByVendor } = findDuplicateLedgerEntries(rows);
  const balanceChanges = buildBalanceChanges(overchargeByVendor, await loadVendors(Object.keys(overchargeByVendor)));

  console.log(`Checked ${rows.length} ledger rows.`);
  printReport(duplicates, balanceChanges);

  if (duplicates.length === 0) {
    console.log('\nNothing to fix.');
  } else if (shouldApply) {
    await applyFix(duplicates, balanceChanges);
  } else {
    console.log('\nReport only. Nothing was changed. Run again with --apply to fix.');
  }
};

main()
  .catch((error) => {
    console.error('Ledger cleanup failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
