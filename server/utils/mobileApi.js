import { createHttpError } from './error.js';

export const DEFAULT_PHONE_BRANDS = [
  'Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Realme', 'Vivo', 'Oppo',
  'Motorola', 'Google', 'Nothing', 'Poco', 'Redmi', 'iQOO', 'Asus', 'Nokia',
];

export const mobileCache = new Map();

export const getCachedValue = (key, maxAgeMs) => {
  const entry = mobileCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.createdAt > maxAgeMs) {
    mobileCache.delete(key);
    return null;
  }
  return entry.value;
};

export const setCachedValue = (key, value) => {
  mobileCache.set(key, { value, createdAt: Date.now() });
  return value;
};

export const mobileApiRequest = async (pathname, params = {}) => {
  const MOBILE_API_BASE = (process.env.MOBILE_API_BASE || 'https://api.mobileapi.dev').replace(/\/$/, '');
  const MOBILE_API_KEY = process.env.MOBILE_API_KEY || '';

  if (!MOBILE_API_KEY) {
    throw createHttpError(500, 'Missing MOBILE_API_KEY in environment.');
  }

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  });
  searchParams.set('key', MOBILE_API_KEY);

  const response = await fetch(`${MOBILE_API_BASE}${pathname}?${searchParams.toString()}`);
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw createHttpError(response.status, payload?.error || payload?.message || 'Mobile API request failed.');
  }

  return payload;
};

export const extractStorageOptions = (device) => {
  const rawValues = [];

  if (typeof device.storage === 'string') {
    rawValues.push(...device.storage.split(','));
  }

  if (Array.isArray(device.storage_options)) {
    rawValues.push(...device.storage_options);
  }

  return Array.from(new Set(rawValues
    .map((value) => String(value).trim())
    .filter(Boolean)
    .filter((value) => /\d+\s*(GB|TB)/i.test(value))
    .map((value) => value.replace(/\s+/g, ' ').toUpperCase().replace(' GB', 'GB').replace(' TB', 'TB'))));
};
