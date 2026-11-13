import { compressImage } from './imageUtils';
import { MAX_PHOTO_FILE_BYTES, PRODUCT_PHOTO_MAX_EDGE_PX, PRODUCT_PHOTO_QUALITY } from './uploadLimits';

const readAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => (typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read the file.')));
    reader.onerror = () => reject(new Error('Could not read the file.'));
    reader.readAsDataURL(file);
  });

/**
 * Turns an uploaded product photo into a compact data URL.
 * Phone-camera photos are several MB each; resizing and compressing them here
 * keeps a product with many photos well under the server's save limit.
 */
export async function readProductPhoto(file: File): Promise<string> {
  if (file.size > MAX_PHOTO_FILE_BYTES) {
    throw new Error(`"${file.name}" is too large. Please choose a photo under ${Math.round(MAX_PHOTO_FILE_BYTES / (1024 * 1024))} MB.`);
  }

  const compressed = await compressImage(file, PRODUCT_PHOTO_MAX_EDGE_PX, PRODUCT_PHOTO_MAX_EDGE_PX, PRODUCT_PHOTO_QUALITY);
  if (compressed.startsWith('data:image')) return compressed;

  // The browser could not decode this image for compression; keep the original.
  return readAsDataUrl(file);
}

/** Reads several photos; photos that fail are reported instead of silently skipped. */
export async function readProductPhotos(files: File[]): Promise<{ photos: string[]; errors: string[] }> {
  const results = await Promise.allSettled(files.map(readProductPhoto));
  const photos: string[] = [];
  const errors: string[] = [];
  results.forEach((result) => {
    if (result.status === 'fulfilled') photos.push(result.value);
    else errors.push(result.reason instanceof Error ? result.reason.message : 'Could not read a photo.');
  });
  return { photos, errors };
}
