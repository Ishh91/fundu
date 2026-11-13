/**
 * Size rules for product photos and videos that are saved inside the product
 * record. The API rejects any save request larger than 10 MB, so these keep a
 * form from building a request the server can never accept.
 *
 * This module is pure (no DOM access) so it can be unit-tested.
 */

const BYTES_PER_MB = 1024 * 1024;

/** The server's JSON body limit is 10 MB; stay under it with room for the other fields. */
export const MAX_SAVE_PAYLOAD_BYTES = 9 * BYTES_PER_MB;

/** Photos are resized and compressed on upload, so large originals are fine. */
export const MAX_PHOTO_FILE_BYTES = 20 * BYTES_PER_MB;

/** An uploaded video is stored as-is (base64 adds about a third), so it has to be small. */
export const MAX_INLINE_VIDEO_FILE_BYTES = 5 * BYTES_PER_MB;

/** Longest edge and quality used when compressing an uploaded product photo. */
export const PRODUCT_PHOTO_MAX_EDGE_PX = 1600;
export const PRODUCT_PHOTO_QUALITY = 0.82;

const formatMb = (bytes: number): string => `${(bytes / BYTES_PER_MB).toFixed(1)} MB`;

const isInlineMedia = (value: unknown): value is string => typeof value === 'string' && value.startsWith('data:');

/** Size in bytes of a value once it is sent as JSON (base64 data URLs are plain ASCII). */
export const jsonBytes = (value: unknown): number => new TextEncoder().encode(JSON.stringify(value) ?? '').length;

export const VIDEO_TOO_LARGE_MESSAGE =
  `This video file is larger than ${formatMb(MAX_INLINE_VIDEO_FILE_BYTES)}, which is too big to save with the product. ` +
  'Upload it to YouTube (or any video host) and paste the link in the video field instead.';

type MediaPayload = {
  images?: unknown;
  video_url?: unknown;
};

/**
 * Returns a plain-language explanation when a save request would be too large
 * for the server, or null when it is fine to send.
 */
export function describeOversizedSave(payload: MediaPayload): string | null {
  const totalBytes = jsonBytes(payload);
  if (totalBytes <= MAX_SAVE_PAYLOAD_BYTES) return null;

  const images = Array.isArray(payload.images) ? payload.images.filter(isInlineMedia) : [];
  const photoBytes = images.reduce((sum, image) => sum + image.length, 0);
  const videoBytes = isInlineMedia(payload.video_url) ? payload.video_url.length : 0;

  const parts: string[] = [];
  if (videoBytes > 0) parts.push(`the uploaded video is ${formatMb(videoBytes)}`);
  if (photoBytes > 0) parts.push(`${images.length} uploaded photo${images.length === 1 ? '' : 's'} total ${formatMb(photoBytes)}`);
  const breakdown = parts.length > 0 ? ` (${parts.join(' and ')})` : '';

  const advice =
    videoBytes >= photoBytes && videoBytes > 0
      ? 'Remove the uploaded video and paste a YouTube link instead.'
      : 'Remove a few photos, or use image links instead of uploaded files.';

  return (
    `This item is too large to save: ${formatMb(totalBytes)}${breakdown}. ` +
    `The limit is ${formatMb(MAX_SAVE_PAYLOAD_BYTES)}. ${advice}`
  );
}
