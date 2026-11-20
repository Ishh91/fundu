import { setBounded } from './boundedCache.js';

/**
 * Counts requests per route between two reads, so the periodic [memory] log line can say which routes were busy while the heap grew.
 * The key is the route pattern (e.g. "GET /api/db/:table [master_phones]"), never the raw URL, so it cannot grow with visitor input;
 * the number of keys is capped anyway.
 */
const MAX_KEYS = 200;
let counts = new Map();

export const countRequest = (key) => {
  setBounded(counts, key, (counts.get(key) || 0) + 1, MAX_KEYS);
};

/** The `n` busiest routes since the last call, as "route xCount", and a reset. */
export const takeTopRoutes = (n = 5) => {
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([key, count]) => `${key} x${count}`);
  const total = [...counts.values()].reduce((sum, count) => sum + count, 0);
  counts = new Map();
  return { top, total };
};
