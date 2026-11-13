import jwt from 'jsonwebtoken';
import { createHttpError } from './error.js';

const CERTS_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
const DEFAULT_CERT_TTL_MS = 60 * 60 * 1000;
const CERT_FETCH_TIMEOUT_MS = 5000;

let cachedCerts = null;
let cachedCertsExpireAt = 0;

// The Firebase project id is public (it ships in the web bundle), not a secret.
const getProjectId = () =>
  (process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || 'thefundu-3700a').trim();

async function getSigningCerts() {
  if (cachedCerts && Date.now() < cachedCertsExpireAt) return cachedCerts;

  const response = await fetch(CERTS_URL, { signal: AbortSignal.timeout(CERT_FETCH_TIMEOUT_MS) });
  if (!response.ok) {
    throw new Error(`Google signing certs request failed with status ${response.status}`);
  }

  const maxAgeMatch = /max-age=(\d+)/.exec(response.headers.get('cache-control') || '');
  const ttlMs = maxAgeMatch ? Number(maxAgeMatch[1]) * 1000 : DEFAULT_CERT_TTL_MS;

  cachedCerts = await response.json();
  cachedCertsExpireAt = Date.now() + ttlMs;
  return cachedCerts;
}

/**
 * Verifies a Firebase Auth ID token (signature, issuer, audience, expiry)
 * and returns the 10-digit Indian phone number it was issued for.
 */
export async function verifyFirebasePhoneToken(idToken) {
  if (!idToken || typeof idToken !== 'string') {
    throw createHttpError(401, 'Phone verification token is required.');
  }

  const decoded = jwt.decode(idToken, { complete: true });
  const keyId = decoded?.header?.kid;
  if (!keyId || decoded.header.alg !== 'RS256') {
    throw createHttpError(401, 'Invalid phone verification token.');
  }

  let certs;
  try {
    certs = await getSigningCerts();
  } catch (err) {
    console.error('Firebase signing cert fetch failed:', err?.message || err);
    throw createHttpError(503, 'Phone verification is temporarily unavailable. Please try again.');
  }

  const cert = certs[keyId];
  if (!cert) {
    throw createHttpError(401, 'Invalid phone verification token.');
  }

  const projectId = getProjectId();
  let claims;
  try {
    claims = jwt.verify(idToken, cert, {
      algorithms: ['RS256'],
      audience: projectId,
      issuer: `https://securetoken.google.com/${projectId}`,
    });
  } catch {
    throw createHttpError(401, 'Phone verification expired or invalid. Please request a new OTP.');
  }

  const digits = String(claims.phone_number || '').replace(/\D/g, '');
  if (!claims.sub || digits.length < 10) {
    throw createHttpError(401, 'Phone verification token has no verified phone number.');
  }

  return digits.slice(-10);
}
