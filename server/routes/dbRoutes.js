import { Router } from 'express';
import { parseJsonParam } from '../utils/dbHelpers.js';
import { createHttpError } from '../utils/error.js';
import {
  deleteFromTable,
  insertIntoTable,
  queryTable,
  updateTable,
  upsertTable,
} from '../services/dbService.js';
import { invalidateLiveImages } from '../utils/liveImagesCache.js';

const router = Router();

// Fast in-memory cache for public read tables (60s TTL)
const routeCache = new Map();
const CACHE_TTL_MS = 60 * 1000;
const PUBLIC_CACHE_TABLES = new Set([
  'products',
  'site_content',
  'banners',
  'master_phones',
  'repair_price_configs',
  'repair_catalogs',
  'sell_price_configs',
  'spare_parts',
  'reviews',
]);

function getCacheKey(table, query) {
  return `${table}:${JSON.stringify(query)}`;
}

const LIVE_IMAGE_TABLES = new Set(['master_phones', 'phones', 'sell_price_configs']);

/**
 * Drops cached reads for a table. Call it after a write has finished: clearing
 * before the write lets a concurrent read re-cache the old data.
 */
export function clearTableCache(table) {
  if (LIVE_IMAGE_TABLES.has(table)) invalidateLiveImages();
  for (const key of routeCache.keys()) {
    if (key.startsWith(`${table}:`)) {
      routeCache.delete(key);
    }
  }
}

const HTTP_UNAUTHORIZED = 401;

/**
 * True when a private read failed because the caller sent a login token the
 * server did not accept (expired, or signed with an old secret). Replying 401
 * lets the app sign the user out; an empty list would look like "no data".
 */
export function isRejectedSessionRead(req, error) {
  const sentToken = String(req.headers?.authorization || '').startsWith('Bearer ');
  return error?.status === HTTP_UNAUTHORIZED && sentToken && !req.auth;
}

router.get('/:table', async (req, res, next) => {
  try {
    const table = req.params.table;
    const isPublicCacheable = PUBLIC_CACHE_TABLES.has(table) && !req.auth;

    // Fast In-Memory Cache Lookup for Public Reads (returns in <1ms)
    if (isPublicCacheable) {
      const cacheKey = getCacheKey(table, req.query);
      const cached = routeCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=300');
        res.setHeader('X-Cache', 'HIT');
        return res.json({ data: cached.data });
      }
    } else {
      res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    }

    const filters = parseJsonParam(req.query.filters, []);
    const sort = parseJsonParam(req.query.sort, null);
    const select = typeof req.query.select === 'string' ? req.query.select : '*';
    const single = req.query.single === 'true' || req.query.maybeSingle === 'true';
    const limit = typeof req.query.limit === 'string' ? Number(req.query.limit) : undefined;
    const offset = typeof req.query.offset === 'string' ? Number(req.query.offset) : undefined;

    const data = await queryTable(table, {
      auth: req.auth,
      filters,
      sort,
      select,
      single,
      limit,
      offset,
    });

    if (isPublicCacheable && data) {
      const cacheKey = getCacheKey(table, req.query);
      routeCache.set(cacheKey, { data, timestamp: Date.now() });
      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=300');
      res.setHeader('X-Cache', 'MISS');
    }

    res.json({ data });
  } catch (error) {
    if (isRejectedSessionRead(req, error)) {
      res.status(HTTP_UNAUTHORIZED).json({ error: 'Session expired. Please sign in again.' });
      return;
    }
    console.warn(`Notice database GET query notice for ${req.params.table}:`, error?.message || error);
    const single = req.query.single === 'true' || req.query.maybeSingle === 'true';
    res.json({ data: single ? null : [] });
  }
});

router.post('/:table', async (req, res, next) => {
  try {
    const { action = 'insert', values, single = false } = req.body;
    if (!values) throw createHttpError(400, 'values is required.');

    const data = action === 'upsert'
      ? await upsertTable(req.params.table, { auth: req.auth, values, single })
      : await insertIntoTable(req.params.table, { auth: req.auth, values, single });

    res.status(201).json({ data });
  } catch (error) {
    next(error);
  } finally {
    clearTableCache(req.params.table);
  }
});

router.patch('/:table', async (req, res, next) => {
  try {
    const { filters = [], values, single = false, select } = req.body;
    if (!values) throw createHttpError(400, 'values is required.');

    const data = await updateTable(req.params.table, {
      auth: req.auth,
      filters,
      values,
      single,
      select,
    });

    res.json({ data });
  } catch (error) {
    next(error);
  } finally {
    clearTableCache(req.params.table);
  }
});

router.delete('/:table', async (req, res, next) => {
  try {
    const { filters = [] } = req.body;

    const data = await deleteFromTable(req.params.table, {
      auth: req.auth,
      filters,
    });

    res.json({ data });
  } catch (error) {
    next(error);
  } finally {
    clearTableCache(req.params.table);
  }
});

export default router;
