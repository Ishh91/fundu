/**
 * Puts `value` in a Map that is used as a cache and drops the oldest entries once it holds more than `maxEntries`.
 *
 * The server caches public reads (phone searches, device images, table reads) under keys that contain what the visitor typed. A key that is
 * never asked for again used to stay in memory for ever, so the cache only ever grew and the process eventually ran out of heap. A Map keeps
 * insertion order, so the first key is the oldest; setting an existing key moves it to the newest place.
 */
export const setBounded = (map, key, value, maxEntries) => {
  if (map.has(key)) map.delete(key);
  map.set(key, value);
  while (map.size > maxEntries) map.delete(map.keys().next().value);
  return value;
};

/** Removes every entry whose `timestamp` / `createdAt` is older than `maxAgeMs`. */
export const dropExpired = (map, maxAgeMs, now = Date.now()) => {
  for (const [key, entry] of map) {
    const at = entry?.timestamp ?? entry?.createdAt ?? 0;
    if (now - at > maxAgeMs) map.delete(key);
  }
};
