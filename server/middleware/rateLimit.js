const MAX_TRACKED_CLIENTS = 5000;

/**
 * Fixed-window counter kept in memory. Good enough for one server process:
 * it stops a single address from flooding an endpoint, and resets on restart.
 */
export const createRateLimiter = ({ windowMs, max, now = Date.now }) => {
  const hits = new Map();

  const prune = (time) => {
    for (const [key, entry] of hits) {
      if (entry.resetAt <= time) hits.delete(key);
    }
  };

  return {
    /** Records one request for `key`; returns whether it is allowed and when the window resets. */
    take(key) {
      const time = now();
      const entry = hits.get(key);
      if (!entry || entry.resetAt <= time) {
        if (hits.size >= MAX_TRACKED_CLIENTS) prune(time);
        hits.set(key, { count: 1, resetAt: time + windowMs });
        return { allowed: true, retryAfterMs: 0 };
      }
      if (entry.count >= max) return { allowed: false, retryAfterMs: entry.resetAt - time };
      hits.set(key, { ...entry, count: entry.count + 1 });
      return { allowed: true, retryAfterMs: 0 };
    },
  };
};

const isAdminPanelUser = (auth) => auth?.role === 'admin' || auth?.role === 'staff';

/**
 * Express middleware: limits requests per client address. Signed-in admin
 * panel users are not limited, since they send notifications in bulk.
 */
export const rateLimit = ({ windowMs, max, name }) => {
  const limiter = createRateLimiter({ windowMs, max });

  return (req, res, next) => {
    if (isAdminPanelUser(req.auth)) return next();

    const key = req.ip || req.socket?.remoteAddress || 'unknown';
    const { allowed, retryAfterMs } = limiter.take(key);
    if (allowed) return next();

    console.warn(`Rate limit hit on ${name} from ${key}`);
    res.setHeader('Retry-After', String(Math.ceil(retryAfterMs / 1000)));
    return res.status(429).json({ success: false, error: 'Too many requests. Please try again in a few minutes.' });
  };
};
