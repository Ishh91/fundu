import { Router } from 'express';
import { SystemError } from '../models/SystemError.js';
import { isAdmin } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { buildClientErrorRecord, groupErrors } from '../services/errorReports.js';

const router = Router();

// In-memory rolling buffer of the last 100 errors in case MongoDB is temporarily busy
const recentMemoryErrors = [];
const MAX_MEMORY_ERRORS = 100;
const MAX_ROWS_PER_VIEW = 500;

export function recordServerError(err, req = null) {
  const errEntry = {
    id: 'err_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
    type: 'server_error',
    message: err?.message || String(err),
    stack: err?.stack || '',
    path: req?.originalUrl || req?.url || '',
    user_agent: req?.headers?.['user-agent'] || '',
    ip: req?.ip || '',
    created_at: new Date().toISOString(),
  };

  recentMemoryErrors.unshift(errEntry);
  if (recentMemoryErrors.length > MAX_MEMORY_ERRORS) {
    recentMemoryErrors.pop();
  }

  SystemError.create(errEntry).catch(() => {});
}

// One browser stuck in a crash loop (or someone abusing the endpoint) must not fill the database.
const REPORT_WINDOW_MS = 10 * 60 * 1000;
const REPORT_MAX_PER_WINDOW = 30;
const reportLimiter = rateLimit({ windowMs: REPORT_WINDOW_MS, max: REPORT_MAX_PER_WINDOW, name: 'errors/report' });

// POST /api/errors/report - Client reporting endpoint (public so any visitor error is captured)
router.post('/report', reportLimiter, async (req, res) => {
  try {
    const built = buildClientErrorRecord(req.body, {
      auth: req.auth,
      ip: req.ip || '',
      userAgent: req.headers['user-agent'] || '',
    });
    if (!built.ok) {
      return res.status(400).json({ success: false, error: built.error });
    }

    recentMemoryErrors.unshift({ id: 'err_' + Date.now(), ...built.record });
    if (recentMemoryErrors.length > MAX_MEMORY_ERRORS) {
      recentMemoryErrors.pop();
    }

    await SystemError.create(built.record).catch((e) => {
      console.warn('[ErrorTracker] Failed to persist error to Mongo:', e.message);
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/errors - View recent errors (Admin protected)
router.get('/', async (req, res) => {
  try {
    if (!isAdmin(req.auth)) {
      return res.status(403).json({ success: false, error: 'Admin access required.' });
    }

    const limit = Math.min(Number(req.query.limit) || 200, MAX_ROWS_PER_VIEW);
    const dbErrors = await SystemError.find().sort({ created_at: -1 }).limit(limit).lean().catch(() => []);
    const errors = dbErrors.length > 0 ? dbErrors : recentMemoryErrors.slice(0, limit);

    res.json({ success: true, count: errors.length, errors, groups: groupErrors(errors) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/errors/clear - Clear tracked errors (Admin protected)
router.delete('/clear', async (req, res) => {
  try {
    if (!isAdmin(req.auth)) {
      return res.status(403).json({ success: false, error: 'Admin access required.' });
    }

    recentMemoryErrors.length = 0;
    await SystemError.deleteMany({}).catch(() => {});
    res.json({ success: true, message: 'Tracked errors cleared.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

