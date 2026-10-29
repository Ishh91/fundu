/**
 * API Configuration helper for Fundu App
 * Connected to the production Render cloud backend
 */
export const RENDER_BACKEND_URL = 'https://fundu-o80c.onrender.com/api';

export const getApiBaseUrl = (): string => {
  const envUrl = (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_API_URL)
    ? import.meta.env.VITE_API_URL
    : (typeof process !== 'undefined' ? process.env?.VITE_API_URL : undefined);

  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl.replace(/\/$/, '');
  }

  return RENDER_BACKEND_URL;
};

export const API_BASE = getApiBaseUrl();
