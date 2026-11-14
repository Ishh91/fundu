/**
 * Moves photos and videos that are stored inside database rows (as base64 text) to Cloudinary,
 * and replaces each one in its row with the Cloudinary address.
 *
 * Safety rules, in the order they happen for every file:
 *   1. The file is uploaded first. If that fails, the row is not touched.
 *   2. The original base64 text is appended to an undo file on disk.
 *   3. Only then is the row changed, and only if that field still holds the exact same text
 *      (so an edit made in the meantime is never overwritten).
 * A migration can be undone from the undo file with `restoreFromBackup`.
 */
import { createReadStream } from 'node:fs';
import { appendFile } from 'node:fs/promises';
import readline from 'node:readline';
import { listInlineMedia } from './cloudinary.js';

/**
 * @param {{ doc: object, table: string, collection: { updateOne: Function },
 *           uploader: { upload: Function }, writeBackup: (entry: object) => Promise<void>,
 *           onProgress?: (message: string) => void }} options
 * @returns {Promise<{ migrated: object[], failed: object[], changedMeanwhile: object[] }>}
 */
export const migrateDocument = async ({ doc, table, collection, uploader, writeBackup, onProgress }) => {
  const migrated = [];
  const failed = [];
  const changedMeanwhile = [];
  const id = String(doc._id);

  for (const { path, dataUrl } of listInlineMedia(doc)) {
    let uploaded;
    try {
      uploaded = await uploader.upload(dataUrl, table);
    } catch (error) {
      failed.push({ table, id, field: path, error: error.message });
      onProgress?.(`FAILED ${table} ${id} ${path}: ${error.message}`);
      continue;
    }

    await writeBackup({ table, id, field: path, url: uploaded.url, dataUrl });

    const result = await collection.updateOne({ _id: doc._id, [path]: dataUrl }, { $set: { [path]: uploaded.url } });
    if (result.matchedCount === 0) {
      changedMeanwhile.push({ table, id, field: path, url: uploaded.url });
      onProgress?.(`SKIPPED ${table} ${id} ${path}: the field was edited while migrating`);
      continue;
    }
    migrated.push({ table, id, field: path, url: uploaded.url, publicId: uploaded.publicId, kind: uploaded.kind });
    onProgress?.(`moved ${table} ${id} ${path}`);
  }

  return { migrated, failed, changedMeanwhile };
};

/** Appends one undo entry per line to `file`. */
export const createBackupWriter = (file) => async (entry) => {
  await appendFile(file, `${JSON.stringify(entry)}\n`, 'utf8');
};

/**
 * Puts the original base64 files back, for every entry in an undo file.
 * A field is restored only while it still holds the Cloudinary address that was written.
 *
 * @param {{ file: string, getCollection: (table: string) => { updateOne: Function } | undefined,
 *           toId?: (id: string) => unknown }} options
 * @returns {Promise<{ restored: number, skipped: number }>}
 */
export const restoreFromBackup = async ({ file, getCollection, toId = (id) => id }) => {
  let restored = 0;
  let skipped = 0;
  const lines = readline.createInterface({ input: createReadStream(file, { encoding: 'utf8' }), crlfDelay: Infinity });

  for await (const line of lines) {
    if (!line.trim()) continue;
    const entry = JSON.parse(line);
    const collection = getCollection(entry.table);
    if (!collection) {
      skipped += 1;
      continue;
    }
    const result = await collection.updateOne(
      { _id: toId(entry.id), [entry.field]: entry.url },
      { $set: { [entry.field]: entry.dataUrl } },
    );
    if (result.matchedCount > 0) restored += 1;
    else skipped += 1;
  }

  return { restored, skipped };
};
