type QueryError = {
  message: string;
  /** HTTP status of the failed request, when the server answered. */
  status?: number;
};

export type User = {
  id: string;
  email: string;
  phone?: string;
  role: 'customer' | 'wholesaler' | 'admin' | 'staff' | 'delivery' | 'rider' | 'vendor';
};

export type Session = {
  access_token: string;
  user: User;
};

type QueryResponse<T> = {
  data: T | null;
  error: QueryError | null;
};

type AuthResponse<T> = Promise<QueryResponse<T>>;

type AuthChangeHandler = (_event: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED', session: Session | null) => void;

type Filter = {
  field: string;
  op: 'eq' | 'in';
  value: unknown;
};

import { API_BASE } from '../config/apiConfig';
import { broadcastSync } from './realtimeSync';

const SESSION_KEY = 'fundu_mongo_session';

const authListeners = new Set<AuthChangeHandler>();

const createError = (message: string, status?: number): QueryError => ({ message, status });

const HTTP_UNAUTHORIZED = 401;

export const readSession = (): Session | null => {
  if (typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Session;
  } catch {
    window.localStorage.removeItem(SESSION_KEY);
    return null;
  }
};

const writeSession = (session: Session | null) => {
  if (typeof window === 'undefined') return;
  if (session) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    window.localStorage.removeItem(SESSION_KEY);
  }
};

/** Authorization header for the signed-in session (empty when signed out). */
export const authHeaders = (): Record<string, string> => {
  const session = readSession();
  return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
};

const notifyAuthChange = (event: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED', session: Session | null) => {
  authListeners.forEach((listener) => listener(event, session));
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * The server rejected the stored token (expired, or signed with an old
 * secret). Drop it and tell the app, so the user is sent to sign in again
 * instead of staying on a page where every save silently fails with 401.
 */
const expireSession = (rejectedToken: string) => {
  // Ignore a late reply for a token that has already been replaced by a new sign-in.
  if (readSession()?.access_token !== rejectedToken) return;
  writeSession(null);
  notifyAuthChange('SIGNED_OUT', null);
};

const apiRequest = async <T>(path: string, init: RequestInit = {}, useAuth = true, retryCount = 1): Promise<QueryResponse<T>> => {
  const session = readSession();
  const headers = new Headers(init.headers || {});

  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (useAuth && session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }

  let attempt = 0;
  while (attempt <= retryCount) {
    try {
      const response = await fetch(`${API_BASE}${path}`, {
        ...init,
        headers,
      });

      // If server returned 502/503/504 (Render cold-start wake-up response), retry
      if ([502, 503, 504].includes(response.status) && attempt < retryCount) {
        attempt++;
        await wait(800 * attempt);
        continue;
      }

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMessage =
          typeof payload?.error === 'string'
            ? payload.error
            : payload?.error?.message || payload?.message || 'Authentication failed.';
        if (response.status === HTTP_UNAUTHORIZED && useAuth && session?.access_token) {
          expireSession(session.access_token);
        }
        return { data: null, error: createError(errorMessage, response.status) };
      }

      return { data: (payload?.data ?? null) as T | null, error: null };
    } catch (error: any) {
      if (attempt < retryCount) {
        attempt++;
        await wait(800 * attempt);
        continue;
      }
      return {
        data: null,
        error: createError(error?.message || 'Backend server connection failed. Please try again.'),
      };
    }
  }

  return {
    data: null,
    error: createError('Backend server connection failed after retries.'),
  };
};

// Client-Side In-Memory + SessionStorage SWR Cache for Instant 0ms Read Queries
const clientQueryCache = new Map<string, { data: unknown; timestamp: number }>();
const CLIENT_CACHE_TTL_MS = 60 * 1000; // 60 seconds fresh in memory
const CLIENT_CACHEABLE_TABLES = new Set([
  'products',
  'site_content',
  'banners',
  'repair_price_configs',
  'repair_catalogs',
  'sell_price_configs',
  'master_phones',
  'spare_parts',
  'reviews',
]);

function hashString(str: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c64e6d;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

const getSessionCacheKey = (key: string): string => {
  const table = key.split(':')[0] || 'tbl';
  return `fundu_swr_v3_${table}_${hashString(key)}`;
};

// Purge legacy truncated cache keys from sessionStorage so stale single-item lookups are immediately wiped
if (typeof window !== 'undefined') {
  try {
    for (let i = window.sessionStorage.length - 1; i >= 0; i--) {
      const k = window.sessionStorage.key(i);
      if (k && (k.startsWith('fundu_swr_products_') || k.startsWith('fundu_swr_v1_') || k.startsWith('fundu_swr_v2_'))) {
        window.sessionStorage.removeItem(k);
      }
    }
  } catch {}
}

function readQueryCache(cacheKey: string): { data: unknown; timestamp: number } | null {
  const inMem = clientQueryCache.get(cacheKey);
  if (inMem) return inMem;
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(getSessionCacheKey(cacheKey));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.data !== undefined) {
        clientQueryCache.set(cacheKey, parsed);
        return parsed;
      }
    }
  } catch {}
  return null;
}

function writeQueryCache(cacheKey: string, data: unknown) {
  const entry = { data, timestamp: Date.now() };
  clientQueryCache.set(cacheKey, entry);
  if (typeof window === 'undefined') return;
  try {
    // Only cache moderate payloads in sessionStorage to avoid quota issues
    const serialized = JSON.stringify(entry);
    if (serialized.length < 500000) {
      window.sessionStorage.setItem(getSessionCacheKey(cacheKey), serialized);
    }
  } catch {}
}

export function invalidateClientTableCache(table: string) {
  for (const key of clientQueryCache.keys()) {
    if (key.startsWith(`${table}:`)) {
      clientQueryCache.delete(key);
      try {
        if (typeof window !== 'undefined') {
          window.sessionStorage.removeItem(getSessionCacheKey(key));
        }
      } catch {}
    }
  }
}

class QueryBuilder<T = unknown> implements PromiseLike<QueryResponse<T>> {
  private readonly table: string;

  private action: 'select' | 'insert' | 'update' | 'delete' | 'upsert' = 'select';

  private filters: Filter[] = [];

  private selectColumns = '*';

  private sortConfig: { field: string; ascending: boolean } | null = null;

  private limitCount: number | null = null;

  private payload: unknown = null;

  private expectSingle = false;

  constructor(table: string) {
    this.table = table;
  }

  select(columns = '*') {
    this.selectColumns = columns;
    return this;
  }

  eq(field: string, value: unknown) {
    this.filters.push({ field, op: 'eq', value });
    return this;
  }

  in(field: string, values: unknown[]) {
    this.filters.push({ field, op: 'in', value: values });
    return this;
  }

  order(field: string, options: { ascending?: boolean } = {}) {
    this.sortConfig = { field, ascending: options.ascending ?? true };
    return this;
  }

  // Alias: sort({ field, ascending }) — used by Admin data fetching
  sort(config: { field: string; ascending?: boolean }) {
    this.sortConfig = { field: config.field, ascending: config.ascending ?? true };
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  insert(values: unknown) {
    this.action = 'insert';
    this.payload = values;
    return this;
  }

  update(values: unknown) {
    this.action = 'update';
    this.payload = values;
    return this;
  }

  delete() {
    this.action = 'delete';
    return this;
  }

  upsert(values: unknown) {
    this.action = 'upsert';
    this.payload = values;
    return this;
  }

  single() {
    this.expectSingle = true;
    return this;
  }

  maybeSingle() {
    this.expectSingle = true;
    return this;
  }

  private async execute(): Promise<QueryResponse<T>> {
    if (this.action === 'select') {
      const params = new URLSearchParams();
      params.set('select', this.selectColumns);
      if (this.filters.length > 0) params.set('filters', JSON.stringify(this.filters));
      if (this.sortConfig) params.set('sort', JSON.stringify(this.sortConfig));
      if (typeof this.limitCount === 'number') params.set('limit', String(this.limitCount));
      if (this.expectSingle) params.set('single', 'true');

      const cacheKey = `${this.table}:${params.toString()}`;
      const isCacheable = CLIENT_CACHEABLE_TABLES.has(this.table) && !this.expectSingle;

      // Fast SWR Cache (Instant 0ms UI load from Memory or SessionStorage)
      if (isCacheable) {
        const cached = readQueryCache(cacheKey);
        if (cached && cached.data !== undefined) {
          // If cached data is older than 20 seconds, revalidate in background silently
          if (Date.now() - cached.timestamp > 20 * 1000) {
            apiRequest<T>(`/db/${this.table}?${params.toString()}`, { method: 'GET' }, false).then((fresh) => {
              if (fresh && fresh.data && !fresh.error) {
                writeQueryCache(cacheKey, fresh.data);
              }
            }).catch(() => {});
          }
          return { data: cached.data as T, error: null };
        }
      }

      // Public reads do not need user authorization headers, enabling fast server caching & CDN
      const res = await apiRequest<T>(`/db/${this.table}?${params.toString()}`, { method: 'GET' }, !isCacheable);
      if (isCacheable && res.data && !res.error) {
        writeQueryCache(cacheKey, res.data);
      }
      return res;
    }

    // Invalidate client cache on any mutation
    invalidateClientTableCache(this.table);

    let res: QueryResponse<T>;
    if (this.action === 'insert' || this.action === 'upsert') {
      res = await apiRequest<T>(`/db/${this.table}`, {
        method: 'POST',
        body: JSON.stringify({
          action: this.action,
          values: this.payload,
          single: this.expectSingle,
          select: this.selectColumns,
        }),
      }, true);
    } else if (this.action === 'update') {
      res = await apiRequest<T>(`/db/${this.table}`, {
        method: 'PATCH',
        body: JSON.stringify({
          filters: this.filters,
          values: this.payload,
          single: this.expectSingle,
          select: this.selectColumns,
        }),
      }, true);
    } else {
      res = await apiRequest<T>(`/db/${this.table}`, {
        method: 'DELETE',
        body: JSON.stringify({
          filters: this.filters,
        }),
      }, true);
    }

    if (!res.error) {
      broadcastSync('DB_MUTATION', this.table, this.action, this.payload);
    }

    return res;
  }

  then<TResult1 = QueryResponse<T>, TResult2 = never>(
    onfulfilled?: ((value: QueryResponse<T>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled ?? undefined, onrejected ?? undefined);
  }
}

type AuthApi = {
  getSession: () => AuthResponse<{ session: Session | null }>;
  onAuthStateChange: (callback: AuthChangeHandler) => {
    data: {
      subscription: {
        unsubscribe: () => void;
      };
    };
  };
  signInWithPassword: (params: { email: string; password: string }) => AuthResponse<{ session: Session; user: User }>;
  signUp: (params: {
    email: string;
    password: string;
    options?: {
      data?: {
        full_name?: string;
        phone?: string;
      };
    };
  }) => AuthResponse<{ session: Session; user: User }>;
  signOut: () => AuthResponse<null>;
  /** Send OTP to a phone number and optional email. In dev mode returns devOtp in data. */
  sendOtp: (phone: string, email?: string, fullName?: string) => Promise<QueryResponse<{ message: string; devOtp?: string; emailSent?: boolean; smsSent?: boolean }>>;
  /** Verify OTP and log in (auto-creates account if new user). */
  verifyOtp: (phone: string, otp: string, options?: { fullName?: string; email?: string; password?: string }) => AuthResponse<{ session: Session; user: User; isNewUser: boolean }>;
  /** Verify Firebase-authenticated phone and issue backend session */
  verifyFirebaseSession: (idToken: string, phone: string, fullName?: string, email?: string) => AuthResponse<{ session: Session; user: User; isNewUser: boolean }>;
};

export const auth: AuthApi = {
  async getSession() {
    const storedSession = readSession();
    if (!storedSession) return { data: { session: null }, error: null };

    try {
      const response = await apiRequest<{ session: Session }>('/auth/me', { method: 'GET' }, true);
      if (!response.error && response.data?.session) {
        writeSession(response.data.session);
        return { data: { session: response.data.session }, error: null };
      }

      // The server no longer accepts this token: the user is signed out.
      if (response.error?.status === HTTP_UNAUTHORIZED) {
        writeSession(null);
        return { data: { session: null }, error: null };
      }
    } catch {
      // Retain stored session on network errors or server cold-starts
    }

    return { data: { session: storedSession }, error: null };
  },

  onAuthStateChange(callback) {
    authListeners.add(callback);
    return {
      data: {
        subscription: {
          unsubscribe: () => authListeners.delete(callback),
        },
      },
    };
  },

  async signInWithPassword({ email, password }) {
    const response = await apiRequest<{ session: Session; profile: unknown }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, false);

    if (response.error || !response.data?.session) {
      return { data: null, error: response.error || createError('Unable to sign in.') };
    }

    writeSession(response.data.session);
    notifyAuthChange('SIGNED_IN', response.data.session);
    return {
      data: {
        session: response.data.session,
        user: response.data.session.user,
      },
      error: null,
    };
  },

  async signUp({ email, password, options }) {
    const response = await apiRequest<{ session: Session; profile: unknown }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        fullName: options?.data?.full_name || '',
        phone: options?.data?.phone || '',
      }),
    }, false);

    if (response.error || !response.data?.session) {
      return { data: null, error: response.error || createError('Unable to create account.') };
    }

    writeSession(response.data.session);
    notifyAuthChange('SIGNED_IN', response.data.session);
    return {
      data: {
        session: response.data.session,
        user: response.data.session.user,
      },
      error: null,
    };
  },

  async signOut() {
    writeSession(null);
    notifyAuthChange('SIGNED_OUT', null);
    return { data: null, error: null };
  },

  async sendOtp(phone, email, fullName) {
    return apiRequest<{ message: string; devOtp?: string; emailSent?: boolean; smsSent?: boolean }>('/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ phone, email, fullName }),
    }, false);
  },

  async verifyOtp(phone, otp, options) {
    const response = await apiRequest<{ session: Session; profile: unknown; isNewUser: boolean }>(
      '/auth/otp/verify',
      {
        method: 'POST',
        body: JSON.stringify({
          phone,
          otp,
          fullName: options?.fullName,
          email: options?.email,
          password: options?.password,
        }),
      },
      false,
    );

    if (response.error || !response.data?.session) {
      return { data: null, error: response.error || createError('OTP verification failed.') };
    }

    writeSession(response.data.session);
    notifyAuthChange('SIGNED_IN', response.data.session);
    return {
      data: {
        session: response.data.session,
        user: response.data.session.user,
        isNewUser: response.data.isNewUser ?? false,
      },
      error: null,
    };
  },

  async verifyFirebaseSession(idToken, phone, fullName, email) {
    const response = await apiRequest<{ session: Session; profile: unknown; isNewUser: boolean }>(
      '/auth/otp/verify-firebase',
      {
        method: 'POST',
        body: JSON.stringify({ idToken, phone, fullName, email }),
      },
      false,
    );

    if (response.error || !response.data?.session) {
      return { data: null, error: response.error || createError('Firebase verification failed.') };
    }

    writeSession(response.data.session);
    notifyAuthChange('SIGNED_IN', response.data.session);
    return {
      data: {
        session: response.data.session,
        user: response.data.session.user,
        isNewUser: response.data.isNewUser ?? false,
      },
      error: null,
    };
  },
};

export const db = {
  auth,
  from<T = unknown>(table: string) {
    return new QueryBuilder<T>(table);
  },
};

export const formatINR = (amount: number | string | null | undefined): string => {
  const num = Number(amount);
  if (amount === null || amount === undefined || isNaN(num) || num <= 0) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

/**
 * Masks price when customer is not logged in:
 * Shows the first digit and replaces every remaining digit with 'x'.
 * e.g. 13000 -> ₹1xxxx, 1200 -> ₹1xxx
 */
export const formatMaskedPrice = (amount: number): string => {
  if (!amount || isNaN(amount) || amount <= 0) return '₹1xxxx';
  const str = String(Math.round(amount));
  const firstDigit = str[0] || '1';
  const xCount = Math.max(1, str.length - 1);
  return `₹${firstDigit}${'x'.repeat(xCount)}`;
};

/**
 * Returns real price if logged in, otherwise masked price.
 */
export const formatDisplayPrice = (amount: number, isLoggedIn: boolean): string => {
  if (isLoggedIn) {
    return formatINR(amount);
  }
  return formatMaskedPrice(amount);
};

