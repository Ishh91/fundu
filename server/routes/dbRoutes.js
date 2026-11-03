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

function getCacheKey(table, query, role = 'public') {
  return `${table}:${role}:${JSON.stringify(query)}`;
}

export function clearTableCache(table) {
  for (const key of routeCache.keys()) {
    if (key.startsWith(`${table}:`)) {
      routeCache.delete(key);
    }
  }
}

router.get('/:table', async (req, res, next) => {
  try {
    const table = req.params.table;
    const isCacheable = PUBLIC_CACHE_TABLES.has(table);
    const role = req.auth?.role || (req.auth ? 'user' : 'public');

    // Fast In-Memory Cache Lookup (returns in <1ms)
    if (isCacheable) {
      const cacheKey = getCacheKey(table, req.query, role);
      const cached = routeCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        if (!req.auth) {
          res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=300');
        } else {
          res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        }
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

    const data = await queryTable(table, {
      auth: req.auth,
      filters,
      sort,
      select,
      single,
      limit,
    });

    if (isCacheable && data) {
      const cacheKey = getCacheKey(table, req.query, role);
      routeCache.set(cacheKey, { data, timestamp: Date.now() });
      if (!req.auth) {
        res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=300');
      }
      res.setHeader('X-Cache', 'MISS');
    }

    res.json({ data });
  } catch (error) {
    console.warn(`Notice database GET query notice for ${req.params.table}:`, error?.message || error);
    const single = req.query.single === 'true' || req.query.maybeSingle === 'true';
    res.json({ data: single ? null : [] });
  }
});

router.post('/:table', async (req, res, next) => {
  try {
    const { action = 'insert', values, single = false } = req.body;
    if (!values) throw createHttpError(400, 'values is required.');

    clearTableCache(req.params.table);

    const data = action === 'upsert'
      ? await upsertTable(req.params.table, { auth: req.auth, values, single })
      : await insertIntoTable(req.params.table, { auth: req.auth, values, single });

    res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
});

router.patch('/:table', async (req, res, next) => {
  try {
    const { filters = [], values, single = false } = req.body;
    if (!values) throw createHttpError(400, 'values is required.');

    clearTableCache(req.params.table);

    const data = await updateTable(req.params.table, {
      auth: req.auth,
      filters,
      values,
      single,
    });

    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.delete('/:table', async (req, res, next) => {
  try {
    const { filters = [] } = req.body;
    clearTableCache(req.params.table);

    const data = await deleteFromTable(req.params.table, {
      auth: req.auth,
      filters,
    });

    res.json({ data });
  } catch (error) {
    next(error);
  }
});

export default router;
