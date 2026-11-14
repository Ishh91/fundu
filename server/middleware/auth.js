import { randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { createHttpError } from '../utils/error.js';
import { normalizeDoc } from '../utils/dbHelpers.js';
import { User } from '../models/index.js';
import { STAFF_ROLE, TABLE_PERMISSION, sanitizePermissions } from '../config/permissions.js';

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

/** True for the super admin, or for staff who were granted this permission. */
export const hasPermission = (auth, permission) => {
  if (isAdmin(auth)) return true;
  return (
    auth?.role === STAFF_ROLE &&
    Boolean(permission) &&
    Array.isArray(auth.permissions) &&
    auth.permissions.includes(permission)
  );
};

export const requirePermission = (auth, permission) => {
  requireAuth(auth);
  if (!hasPermission(auth, permission)) {
    throw createHttpError(403, 'You do not have access to this section.');
  }
};

/**
 * Express middleware form of requirePermission: answers 401/403 itself instead
 * of throwing. With several permissions, holding any one of them is enough.
 */
export const permissionGuard = (...permissions) => (req, res, next) => {
  try {
    requireAuth(req.auth);
    if (!permissions.some((permission) => hasPermission(req.auth, permission))) {
      throw createHttpError(403, 'You do not have access to this section.');
    }
    next();
  } catch (error) {
    res.status(error.status || 403).json({ success: false, error: error.message });
  }
};

/** Admin-level access to one database table (super admin, or staff with the table's permission). */
export const canAdminTable = (auth, table) => hasPermission(auth, TABLE_PERMISSION[table]);

export const requireTableAdmin = (auth, table) => {
  requireAuth(auth);
  if (!canAdminTable(auth, table)) {
    throw createHttpError(403, 'You do not have access to this section.');
  }
};

const PRIVILEGED_ROLES = new Set(['admin', STAFF_ROLE]);

/**
 * Admin and staff tokens are re-checked against the database on every request,
 * so changing or revoking someone's role or permissions takes effect at once
 * instead of when their 7-day token expires.
 */
const refreshPrivilegedAuth = async (auth) => {
  if (mongoose.connection.readyState !== 1) {
    // No database: staff permissions cannot be verified, so grant none.
    return auth.role === STAFF_ROLE ? { ...auth, permissions: [] } : auth;
  }

  try {
    const user = await User.findById(auth.sub).select('role permissions').lean();
    if (!user) return null;
    return {
      ...auth,
      role: user.role,
      permissions: user.role === STAFF_ROLE ? sanitizePermissions(user.permissions) : [],
    };
  } catch {
    return null;
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

export const parseAuth = async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    req.auth = null;
    next();
    return;
  }

  try {
    const claims = jwt.verify(header.slice(7), getJwtSecret());
    req.auth = PRIVILEGED_ROLES.has(claims?.role) ? await refreshPrivilegedAuth(claims) : claims;
  } catch {
    req.auth = null;
  }
  next();
};
