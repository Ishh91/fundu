import { randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';
import { createHttpError } from '../utils/error.js';
import { normalizeDoc } from '../utils/dbHelpers.js';

const KNOWN_PLACEHOLDER_SECRETS = new Set([
  'change-this-jwt-secret',
  'replace_with_a_long_random_secret',
]);

let ephemeralSecret = null;

// Never sign tokens with a publicly known secret. If JWT_SECRET is missing or
// still a placeholder, use a random per-process secret: logins keep working
// but sessions reset on every restart until a real secret is configured.
export const getJwtSecret = () => {
  const configured = (process.env.JWT_SECRET || '').trim();
  if (configured && !KNOWN_PLACEHOLDER_SECRETS.has(configured)) return configured;

  if (!ephemeralSecret) {
    ephemeralSecret = randomBytes(48).toString('hex');
    console.warn('JWT_SECRET is not set (or is a placeholder). Using a temporary random secret; all sessions will reset on restart. Set JWT_SECRET in the environment.');
  }
  return ephemeralSecret;
};

export const isAdmin = (auth) => auth?.role === 'admin';

export const requireAdmin = (auth) => {
  requireAuth(auth);
  if (!isAdmin(auth)) {
    throw createHttpError(403, 'Admin access required.');
  }
};
export const isVendor = (auth) => auth?.role === 'vendor' || auth?.role === 'wholesaler';
export const isWholesaler = isVendor;

export const requireAuth = (auth) => {
  if (!auth?.sub) {
    throw createHttpError(401, 'Authentication required.');
  }
};

export const issueSession = (user) => {
  const publicUser = normalizeDoc(user);
  const access_token = jwt.sign(
    { sub: publicUser.id, email: publicUser.email, role: publicUser.role },
    getJwtSecret(),
    { expiresIn: '7d' },
  );

  return {
    access_token,
    user: {
      id: publicUser.id,
      email: publicUser.email,
      role: publicUser.role,
    },
  };
};

export const parseAuth = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    req.auth = null;
    next();
    return;
  }

  try {
    req.auth = jwt.verify(header.slice(7), getJwtSecret());
  } catch {
    req.auth = null;
  }
  next();
};
