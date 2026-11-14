/**
 * Saves a copy of every photo already stored inside the database on Cloudinary.
 * The database itself is NOT changed: each photo stays exactly where and how it is.
 *
 *   node scripts/cloudinary_backup_existing.mjs           # report only: counts photos, uploads nothing
 *   node scripts/cloudinary_backup_existing.mjs --apply   # upload the copies
 *
 * Needs MONGODB_URI and CLOUDINARY_URL (from the environment or the project's .env).
 *
 * With --apply, a list of what was uploaded (database row, field, Cloudinary address) is written to
 * backups/cloudinary-manifest-<time>.json. Running it again is safe: a photo gets the same Cloudinary
 * name every time, so it is never stored twice.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import * as models from '../server/models/index.js';
import { createMediaUploader, getCloudinaryConfig, listInlineMedia } from '../server/services/cloudinary.js';
import { describeDbTarget, resolveDbName } from '../server/utils/dbTarget.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(ROOT, '.env'), quiet: true });

const shouldApply = process.argv.includes('--apply');
const BACKUP_FOLDER_PREFIX = 'backup';
const SKIPPED_MODELS = new Set(['SystemError']);
const UPLOAD_PAUSE_MS = 150;

const megabytes = (chars) => `${(chars / (1024 * 1024)).toFixed(1)} MB`;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const listModels = () =>
  Object.entries(models)
    .filter(([name, model]) => !SKIPPED_MODELS.has(name) && typeof model?.find === 'function' && model.collection)
    .map(([name, model]) => ({ name, model, table: model.collection.name }));

/** Counts photos per collection without keeping any in memory. */
const survey = async (entries) => {
  const rows = [];
  for (const { name, model, table } of entries) {
    let photos = 0;
    let chars = 0;
    let docsWithPhotos = 0;
    for await (const doc of model.find().lean().cursor()) {
      const found = listInlineMedia(doc);
      if (found.length > 0) docsWithPhotos += 1;
      photos += found.length;
      chars += found.reduce((sum, item) => sum + item.dataUrl.length, 0);
    }
    if (photos > 0) rows.push({ name, table, docsWithPhotos, photos, chars });
  }
  return rows;
};

const printSurvey = (rows) => {
  if (rows.length === 0) {
    console.log('No photos are stored inside the database. Nothing to copy.');
    return;
  }
  console.log('Photos stored inside the database:');
  rows.forEach((row) => {
    console.log(`  ${row.table}: ${row.photos} photos in ${row.docsWithPhotos} rows (${megabytes(row.chars)})`);
  });
  const total = rows.reduce((sum, row) => ({ photos: sum.photos + row.photos, chars: sum.chars + row.chars }), { photos: 0, chars: 0 });
  console.log(`  TOTAL: ${total.photos} photos, about ${megabytes(total.chars)} of text in the database.`);
};

const uploadAll = async (entries, uploader) => {
  const manifest = [];
  const failures = [];
  for (const { model, table } of entries) {
    for await (const doc of model.find().lean().cursor()) {
      for (const { path: field, dataUrl } of listInlineMedia(doc)) {
        try {
          const result = await uploader.upload(dataUrl, `${BACKUP_FOLDER_PREFIX}/${table}`);
          manifest.push({ table, id: String(doc._id), field, url: result.url, publicId: result.publicId, bytes: result.bytes });
          console.log(`  copied ${table} ${doc._id} ${field}`);
        } catch (error) {
          failures.push({ table, id: String(doc._id), field, error: error.message });
          console.warn(`  FAILED ${table} ${doc._id} ${field}: ${error.message}`);
        }
        await sleep(UPLOAD_PAUSE_MS);
      }
    }
  }
  return { manifest, failures };
};

const writeManifest = async (manifest, failures) => {
  const dir = path.join(ROOT, 'backups');
  await mkdir(dir, { recursive: true });
  const file = path.join(dir, `cloudinary-manifest-${Date.now()}.json`);
  await writeFile(file, JSON.stringify({ copied: manifest, failed: failures }, null, 2), 'utf8');
  return file;
};

const main = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set. Put it in .env or the environment.');
  const config = getCloudinaryConfig();
  if (shouldApply && !config) throw new Error('CLOUDINARY_URL is not set. Put it in .env or the environment.');

  const dbName = resolveDbName();
  console.log(`Database: ${describeDbTarget(uri, dbName)}
`);
  await mongoose.connect(uri, { dbName });
  const entries = listModels();
  const rows = await survey(entries);
  printSurvey(rows);
  if (rows.length === 0) return;

  if (!shouldApply) {
    console.log('\nReport only. Nothing was uploaded and the database was not changed. Run again with --apply to upload the copies.');
    return;
  }

  console.log('\nUploading copies to Cloudinary (the database is not changed)...');
  const { manifest, failures } = await uploadAll(entries, createMediaUploader({ config }));
  const file = await writeManifest(manifest, failures);
  console.log(`\nDone. ${manifest.length} copied, ${failures.length} failed. List saved: ${file}`);
  if (failures.length > 0) process.exitCode = 1;
};

main()
  .catch((error) => {
    console.error('Cloudinary backup failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
