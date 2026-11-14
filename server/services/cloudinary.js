/**
 * Cloudinary photo and video storage.
 *
 * Photos and videos used to be saved inside MongoDB as base64 text, which made every
 * product read heavy and filled the database. Here an uploaded file is sent
 * to Cloudinary once and only its short web address is stored instead.
 *
 * Uploads are signed on the server, so the API secret never reaches a browser.
 * Nothing here ever throws into a save: if Cloudinary is not configured or an
 * upload fails, the original photo is kept as it was.
 */
import { createHash } from 'node:crypto';

const INLINE_IMAGE = /^data:image\/(png|jpe?g|webp|gif|avif);base64,/i;
const INLINE_VIDEO = /^data:video\/(mp4|webm|quicktime|ogg|x-m4v);base64,/i;
/** Smaller inline files (tiny placeholders and icons) are not worth a round trip. */
const MIN_INLINE_CHARS = 1000;
const IMAGE_UPLOAD_TIMEOUT_MS = 30 * 1000;
const VIDEO_UPLOAD_TIMEOUT_MS = 120 * 1000;
const DEFAULT_CONCURRENCY = 4;
export const MAX_MEDIA_PER_SAVE = 25;
const DEFAULT_FOLDER = 'fundu';
/**
 * Photos: Cloudinary picks the best format (WebP/AVIF) and quality for each visitor's browser.
 * Videos: only the quality is optimised, so the file stays a plain .mp4 that plays everywhere.
 */
const DELIVERY_TRANSFORM = { image: 'f_auto,q_auto', video: 'q_auto' };

export const isInlineImage = (value) =>
  typeof value === 'string' && value.length >= MIN_INLINE_CHARS && INLINE_IMAGE.test(value);

export const isInlineVideo = (value) =>
  typeof value === 'string' && value.length >= MIN_INLINE_CHARS && INLINE_VIDEO.test(value);

/** A photo or video stored inline as base64 text. */
export const isInlineMedia = (value) => isInlineImage(value) || isInlineVideo(value);

/** 'image' or 'video' for an inline file, as Cloudinary names its resource types. */
export const mediaKind = (dataUrl) => (isInlineVideo(dataUrl) ? 'video' : 'image');

/**
 * Reads credentials from `CLOUDINARY_URL` (cloudinary://key:secret@cloud) or from
 * CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET.
 * @returns {{ cloudName: string, apiKey: string, apiSecret: string } | null} null when not configured
 */
export const getCloudinaryConfig = (env = process.env) => {
  const url = String(env.CLOUDINARY_URL || '').trim();
  const fromUrl = url.match(/^cloudinary:\/\/([^:@/\s]+):([^@/\s]+)@([^/\s]+)\/?$/);
  if (fromUrl) return { apiKey: fromUrl[1], apiSecret: fromUrl[2], cloudName: fromUrl[3] };

  const cloudName = String(env.CLOUDINARY_CLOUD_NAME || '').trim();
  const apiKey = String(env.CLOUDINARY_API_KEY || '').trim();
  const apiSecret = String(env.CLOUDINARY_API_SECRET || '').trim();
  return cloudName && apiKey && apiSecret ? { cloudName, apiKey, apiSecret } : null;
};

/** Cloudinary's request signature: the sorted `key=value` pairs joined by `&`, plus the secret, hashed with SHA-1. */
export const signParams = (params, apiSecret) => {
  const toSign = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return createHash('sha1').update(toSign + apiSecret).digest('hex');
};

/** Adds automatic quality (and format, for photos) to a Cloudinary delivery address. Other addresses are returned unchanged. */
export const withDeliveryTransform = (url) => {
  if (typeof url !== 'string' || !url.includes('res.cloudinary.com')) return url;
  const kind = ['image', 'video'].find((type) => url.includes(`/${type}/upload/`));
  if (!kind) return url;
  const transform = DELIVERY_TRANSFORM[kind];
  if (url.includes(`/upload/${transform}/`)) return url;
  return url.replace(`/${kind}/upload/`, `/${kind}/upload/${transform}/`);
};

const folderFor = (name) => {
  const clean = String(name || '').toLowerCase().replace(/[^a-z0-9_-]/g, '');
  return clean ? `${DEFAULT_FOLDER}/${clean}` : DEFAULT_FOLDER;
};

/** Same photo -> same name, so re-saving a product never stores a second copy. */
export const publicIdFor = (dataUrl) => createHash('sha1').update(dataUrl).digest('hex').slice(0, 24);

/**
 * @param {{ config: { cloudName: string, apiKey: string, apiSecret: string },
 *           fetchImpl?: typeof fetch, nowSeconds?: () => number }} options
 * @returns {{ upload: (dataUrl: string, folderName?: string) => Promise<{ url: string, publicId: string, bytes: number }> }}
 */
export const createMediaUploader = ({ config, fetchImpl = fetch, nowSeconds = () => Math.floor(Date.now() / 1000) }) => ({
  async upload(dataUrl, folderName) {
    const kind = mediaKind(dataUrl);
    const publicId = publicIdFor(dataUrl);
    const signed = { folder: folderFor(folderName), public_id: publicId, timestamp: nowSeconds() };

    const form = new FormData();
    form.append('file', dataUrl);
    form.append('api_key', config.apiKey);
    form.append('signature', signParams(signed, config.apiSecret));
    Object.entries(signed).forEach(([key, value]) => form.append(key, String(value)));

    const response = await fetchImpl(`https://api.cloudinary.com/v1_1/${config.cloudName}/${kind}/upload`, {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(kind === 'video' ? VIDEO_UPLOAD_TIMEOUT_MS : IMAGE_UPLOAD_TIMEOUT_MS),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body.secure_url) {
      throw new Error(body?.error?.message || `Cloudinary upload failed (HTTP ${response.status}).`);
    }
    return { url: withDeliveryTransform(body.secure_url), publicId: body.public_id, bytes: body.bytes || 0, kind };
  },
});

const collectInlineMedia = (value, found = new Set()) => {
  if (isInlineMedia(value)) found.add(value);
  else if (Array.isArray(value)) value.forEach((item) => collectInlineMedia(item, found));
  else if (value && typeof value === 'object') Object.values(value).forEach((item) => collectInlineMedia(item, found));
  return found;
};

const replaceMedia = (value, replacements) => {
  if (typeof value === 'string') return replacements.get(value) ?? value;
  if (Array.isArray(value)) return value.map((item) => replaceMedia(item, replacements));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replaceMedia(item, replacements)]));
  }
  return value;
};

/**
 * Lists every inline photo and video in `value` with where it sits, e.g. `images.0` or `device_photos.front`.
 * @returns {Array<{ path: string, dataUrl: string }>}
 */
export const listInlineMedia = (value, prefix = '') => {
  if (isInlineMedia(value)) return [{ path: prefix, dataUrl: value }];
  if (Array.isArray(value)) return value.flatMap((item, index) => listInlineMedia(item, prefix ? `${prefix}.${index}` : String(index)));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, item]) => listInlineMedia(item, prefix ? `${prefix}.${key}` : key));
  }
  return [];
};

/** Runs `worker` over `items`, at most `limit` at a time. */
const runLimited = async (items, limit, worker) => {
  const queue = [...items];
  const runners = Array.from({ length: Math.min(limit, queue.length) }, async () => {
    while (queue.length > 0) await worker(queue.shift());
  });
  await Promise.all(runners);
};

/**
 * Returns a copy of `value` in which every inline photo and video (base64 `data:image/...` or `data:video/...`)
 * has been replaced by its Cloudinary address. The input is not modified.
 * A file that fails to upload stays inline, so the save itself still succeeds.
 *
 * @returns {Promise<{ value: unknown, uploaded: number, failed: number, skipped: number }>}
 */
export const offloadInlineMedia = async (value, uploader, { folder, concurrency = DEFAULT_CONCURRENCY, onError } = {}) => {
  const images = [...collectInlineMedia(value)];
  if (images.length === 0) return { value, uploaded: 0, failed: 0, skipped: 0 };

  const toUpload = images.slice(0, MAX_MEDIA_PER_SAVE);
  const replacements = new Map();
  let failed = 0;

  await runLimited(toUpload, concurrency, async (dataUrl) => {
    try {
      const { url } = await uploader.upload(dataUrl, folder);
      replacements.set(dataUrl, url);
    } catch (error) {
      failed += 1;
      onError?.(error);
    }
  });

  return {
    value: replacements.size > 0 ? replaceMedia(value, replacements) : value,
    uploaded: replacements.size,
    failed,
    skipped: images.length - toUpload.length,
  };
};

let sharedUploader;
let sharedFor = '';

/** The uploader for this server's environment, or null when Cloudinary is not configured. */
export const getMediaUploader = (env = process.env) => {
  const config = getCloudinaryConfig(env);
  if (!config) return null;
  const key = `${config.cloudName}:${config.apiKey}`;
  if (!sharedUploader || sharedFor !== key) {
    sharedUploader = createMediaUploader({ config });
    sharedFor = key;
  }
  return sharedUploader;
};

/**
 * What the save routes call. Moves inline photos and videos in `value` to Cloudinary when it is
 * configured; otherwise (or on any failure) hands `value` back untouched.
 */
export const offloadMediaForSave = async (value, { folder, uploader = getMediaUploader(), log = console } = {}) => {
  if (!uploader) return value;
  try {
    const result = await offloadInlineMedia(value, uploader, {
      folder,
      onError: (error) => log.warn(`[Cloudinary] Upload failed, keeping the file inline: ${error.message}`),
    });
    if (result.skipped > 0) {
      log.warn(`[Cloudinary] ${result.skipped} files beyond the ${MAX_MEDIA_PER_SAVE} per save were kept inline.`);
    }
    return result.value;
  } catch (error) {
    log.warn(`[Cloudinary] Skipped media upload: ${error.message}`);
    return value;
  }
};
