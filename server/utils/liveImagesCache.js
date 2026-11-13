import { createHash } from 'crypto';

/**
 * In-memory cache for the public /phones/live-images payload.
 *
 * Every open browser tab polls that endpoint. Without a cache each poll made
 * the server read every phone image (several MB) from MongoDB again. With it
 * the database is read at most once per TTL, and a client that already has
 * the current version gets a tiny "unchanged" reply instead of the payload.
 */
const CACHE_TTL_MS = 60 * 1000;

let cached = null; // { items, version, expiresAt }
let pendingLoad = null;
// Bumped by every invalidation so a read that started before a write can
// never be stored as if it were fresh.
let generation = 0;

const computeVersion = (items) => createHash('sha1').update(JSON.stringify(items)).digest('hex').slice(0, 16);

/**
 * Returns { items, version }, loading through `loader` only when the cache is
 * empty or expired. Concurrent callers share a single database read.
 */
export async function getLiveImages(loader) {
  if (cached && Date.now() < cached.expiresAt) return cached;
  if (pendingLoad) return pendingLoad;

  const startedInGeneration = generation;
  const load = (async () => {
    try {
      const items = await loader();
      const snapshot = { items, version: computeVersion(items), expiresAt: Date.now() + CACHE_TTL_MS };
      if (startedInGeneration === generation) cached = snapshot;
      return snapshot;
    } finally {
      if (pendingLoad === load) pendingLoad = null;
    }
  })();

  pendingLoad = load;
  return load;
}

/**
 * Builds the endpoint reply. A client that already holds the current version
 * (sent as ?v=) only gets a small "unchanged" marker instead of the payload.
 */
export function buildLiveImagesResponse({ items, version }, clientVersion) {
  if (typeof clientVersion === 'string' && clientVersion !== '' && clientVersion === version) {
    return { unchanged: true, version, count: items.length };
  }
  return { data: items, version, count: items.length };
}

/** Drops the cache so the next request reads fresh data (call after an image or catalog write). */
export function invalidateLiveImages() {
  generation += 1;
  cached = null;
  pendingLoad = null;
}
