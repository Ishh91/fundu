import { Router } from 'express';
import { SystemError } from '../models/SystemError.js';
import { isAdmin } from '../middleware/auth.js';

const router = Router();

// In-memory rolling buffer of the last 100 errors in case MongoDB is temporarily busy
const recentMemoryErrors = [];
const MAX_MEMORY_ERRORS = 100;

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

// POST /api/errors/report - Client reporting endpoint (public so any visitor error is captured)
router.post('/report', async (req, res) => {
  try {
    const {
      type = 'client_error',
      message,
      stack = '',
      url = '',
      path = '',
      component_stack = '',
      metadata = {},
      user_id = null,
      user_email = null,
    } = req.body || {};

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: 'Error message is required.' });
    }

    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || '';
    const userAgent = req.headers['user-agent'] || '';

    const errorPayload = {
      type: String(type).slice(0, 50),
      message: String(message).slice(0, 1000),
      stack: String(stack).slice(0, 5000),
      url: String(url).slice(0, 500),
      path: String(path).slice(0, 500),
      component_stack: String(component_stack).slice(0, 5000),
      user_id: req.auth?.sub || user_id || null,
      user_email: req.auth?.email || user_email || null,
      user_agent: userAgent.slice(0, 300),
      ip: clientIp.slice(0, 50),
      metadata: typeof metadata === 'object' && metadata !== null ? metadata : {},
      created_at: new Date().toISOString(),
    };

    recentMemoryErrors.unshift({ id: 'err_' + Date.now(), ...errorPayload });
    if (recentMemoryErrors.length > MAX_MEMORY_ERRORS) {
      recentMemoryErrors.pop();
    }

    await SystemError.create(errorPayload).catch((e) => {
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

    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const dbErrors = await SystemError.find().sort({ created_at: -1 }).limit(limit).lean().catch(() => []);
    const errors = dbErrors.length > 0 ? dbErrors : recentMemoryErrors.slice(0, limit);

    res.json({ success: true, count: errors.length, errors });
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
