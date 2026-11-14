/**
 * Checks that the Cloudinary credentials in .env work, without uploading anything.
 *
 *   node scripts/cloudinary_check.mjs
 *
 * Calls Cloudinary's read-only "ping" and "usage" endpoints and prints the account's
 * plan and how much storage is used. The secret is never printed.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { getCloudinaryConfig } from '../server/services/cloudinary.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(ROOT, '.env') });

const config = getCloudinaryConfig();
if (!config) {
  console.error('Cloudinary is not configured. Set CLOUDINARY_URL in .env (cloudinary://<key>:<secret>@<cloud_name>).');
  process.exit(1);
}

const auth = `Basic ${Buffer.from(`${config.apiKey}:${config.apiSecret}`).toString('base64')}`;
const call = async (endpoint) => {
  const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/${endpoint}`, { headers: { Authorization: auth } });
  const body = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, body };
};

const ping = await call('ping');
if (!ping.ok) {
  console.error(`Cloudinary rejected the credentials (HTTP ${ping.status}): ${ping.body?.error?.message || 'no details'}`);
  console.error(`Cloud name used: "${config.cloudName}". Check it matches the one shown at the top of your Cloudinary dashboard.`);
  process.exit(1);
}

const usage = await call('usage');
const mb = (bytes) => `${Math.round((Number(bytes) || 0) / (1024 * 1024))} MB`;
console.log(`Connected to Cloudinary account "${config.cloudName}".`);
if (usage.ok) {
  console.log(`Plan: ${usage.body.plan || 'unknown'}`);
  console.log(`Images stored: ${usage.body.resources ?? 'unknown'}`);
  console.log(`Storage used: ${mb(usage.body.storage?.usage)}`);
}
