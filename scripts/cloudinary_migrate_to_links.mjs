/**
 * Replaces photos and videos stored inside database rows (base64 text) with Cloudinary links.
 * This CHANGES the database, so it is careful: every file is uploaded first, the original is saved
 * to an undo file in backups/, and a field edited while the script runs is never overwritten.
 *
 *   node scripts/cloudinary_migrate_to_links.mjs                    # report only, nothing changes
 *   node scripts/cloudinary_migrate_to_links.mjs --apply --limit 3  # try it on the first 3 rows that have files
 *   node scripts/cloudinary_migrate_to_links.mjs --apply            # migrate everything
 *   node scripts/cloudinary_migrate_to_links.mjs --restore backups/media-undo-<time>.ndjson   # put the originals back
 *
 * Needs MONGODB_URI and CLOUDINARY_URL (from the environment or the project's .env).
 * Take an Atlas snapshot first. Running it again is safe; rows already moved are skipped.
 */
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import * as models from '../server/models/index.js';
import { createMediaUploader, getCloudinaryConfig, listInlineMedia } from '../server/services/cloudinary.js';
import { createBackupWriter, migrateDocument, restoreFromBackup } from '../server/services/mediaMigration.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(ROOT, '.env'), quiet: true });

const args = process.argv.slice(2);
const shouldApply = args.includes('--apply');
const restoreIndex = args.indexOf('--restore');
const restoreFile = restoreIndex >= 0 ? args[restoreIndex + 1] : null;
const limitIndex = args.indexOf('--limit');
const rowLimit = limitIndex >= 0 ? Number(args[limitIndex + 1]) : Infinity;
const SKIPPED_MODELS = new Set(['SystemError']);
const UPLOAD_PAUSE_MS = 150;

const megabytes = (chars) => `${(chars / (1024 * 1024)).toFixed(1)} MB`;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const listModels = () =>
  Object.entries(models)
    .filter(([name, model]) => !SKIPPED_MODELS.has(name) && typeof model?.find === 'function' && model.collection)
    .map(([, model]) => ({ model, table: model.collection.name }));

const toId = (id) => (mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id);

const report = async (entries) => {
  let rows = 0;
  let files = 0;
  let chars = 0;
  for (const { model, table } of entries) {
    let tableRows = 0;
    let tableFiles = 0;
    for await (const doc of model.find().lean().cursor()) {
      const found = listInlineMedia(doc);
      if (found.length === 0) continue;
      tableRows += 1;
      tableFiles += found.length;
      chars += found.reduce((sum, item) => sum + item.dataUrl.length, 0);
    }
    if (tableFiles > 0) console.log(`  ${table}: ${tableFiles} files in ${tableRows} rows`);
    rows += tableRows;
    files += tableFiles;
  }
  console.log(files === 0 ? 'Nothing is stored inside the database as base64.' : `  TOTAL: ${files} files in ${rows} rows, about ${megabytes(chars)}.`);
  return files;
};

const apply = async (entries, config) => {
  const backupDir = path.join(ROOT, 'backups');
  await mkdir(backupDir, { recursive: true });
  const undoFile = path.join(backupDir, `media-undo-${Date.now()}.ndjson`);
  const writeBackup = createBackupWriter(undoFile);
  const uploader = createMediaUploader({ config });
  const totals = { migrated: 0, failed: 0, changedMeanwhile: 0 };
  let rowsDone = 0;

  console.log(`Undo file: ${undoFile}\n`);
  for (const { model, table } of entries) {
    if (rowsDone >= rowLimit) break;
    for await (const doc of model.find().lean().cursor()) {
      if (rowsDone >= rowLimit) break;
      if (listInlineMedia(doc).length === 0) continue;
      const result = await migrateDocument({ doc, table, collection: model.collection, uploader, writeBackup, onProgress: (m) => console.log(`  ${m}`) });
      totals.migrated += result.migrated.length;
      totals.failed += result.failed.length;
      totals.changedMeanwhile += result.changedMeanwhile.length;
      rowsDone += 1;
      await sleep(UPLOAD_PAUSE_MS);
    }
  }
  console.log(`\nDone. ${totals.migrated} files moved, ${totals.failed} failed, ${totals.changedMeanwhile} skipped (edited meanwhile).`);
  console.log(`To undo everything: node scripts/cloudinary_migrate_to_links.mjs --restore ${path.relative(ROOT, undoFile)}`);
  if (totals.failed > 0) process.exitCode = 1;
};

const main = async () => {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not set. Put it in .env or the environment.');
  await mongoose.connect(process.env.MONGODB_URI);
  const entries = listModels();

  if (restoreFile) {
    const byTable = new Map(entries.map(({ model, table }) => [table, model.collection]));
    const outcome = await restoreFromBackup({ file: path.resolve(restoreFile), getCollection: (table) => byTable.get(table), toId });
    console.log(`Restored ${outcome.restored} files. Skipped ${outcome.skipped} (changed again since the migration).`);
    return;
  }

  const files = await report(entries);
  if (files === 0) return;
  if (!shouldApply) {
    console.log('\nReport only. Nothing was changed. Add --apply (and --limit 3 to try a few rows first).');
    return;
  }

  const config = getCloudinaryConfig();
  if (!config) throw new Error('CLOUDINARY_URL is not set. Put it in .env or the environment.');
  console.log('\nMigrating. The database rows are changed one file at a time...');
  await apply(entries, config);
};

main()
  .catch((error) => {
    console.error('Migration failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
