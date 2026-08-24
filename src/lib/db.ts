type QueryError = {
  message: string;
};

export type User = {
  id: string;
  email: string;
  role: 'customer' | 'wholesaler' | 'admin';
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

const resolveApiBase = () => {
  if (typeof window !== 'undefined') {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocal) {
      return 'http://localhost:4000/api';
    }
  }
  const envUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl.replace(/\/$/, '');
  }
  return 'https://fundu.onrender.com/api';
};

const API_BASE = resolveApiBase();
const SESSION_KEY = 'fundu_mongo_session';

const authListeners = new Set<AuthChangeHandler>();

const createError = (message: string): QueryError => ({ message });

const readSession = (): Session | null => {
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

const notifyAuthChange = (event: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED', session: Session | null) => {
  authListeners.forEach((listener) => listener(event, session));
};

const apiRequest = async <T>(path: string, init: RequestInit = {}, useAuth = true): Promise<QueryResponse<T>> => {
  try {
    const session = readSession();
    const headers = new Headers(init.headers || {});

    if (!headers.has('Content-Type') && init.body) {
      headers.set('Content-Type', 'application/json');
    }

    if (useAuth && session?.access_token) {
      headers.set('Authorization', `Bearer ${session.access_token}`);
    }

    const response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers,
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      return { data: null, error: createError(payload?.error?.message || 'Request failed.') };
    }

    return { data: (payload?.data ?? null) as T | null, error: null };
  } catch (error) {
    return {
      data: null,
      error: createError(error instanceof Error ? error.message : 'Network request failed.'),
    };
  }
};

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
      return apiRequest<T>(`/db/${this.table}?${params.toString()}`, { method: 'GET' }, true);
    }

    if (this.action === 'insert' || this.action === 'upsert') {
      return apiRequest<T>(`/db/${this.table}`, {
        method: 'POST',
        body: JSON.stringify({
          action: this.action,
          values: this.payload,
          single: this.expectSingle,
          select: this.selectColumns,
        }),
      }, true);
    }

    if (this.action === 'update') {
      return apiRequest<T>(`/db/${this.table}`, {
        method: 'PATCH',
        body: JSON.stringify({
          filters: this.filters,
          values: this.payload,
          single: this.expectSingle,
          select: this.selectColumns,
        }),
      }, true);
    }

    return apiRequest<T>(`/db/${this.table}`, {
      method: 'DELETE',
      body: JSON.stringify({
        filters: this.filters,
      }),
    }, true);
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
  /** Send OTP to a phone number. In dev mode returns devOtp in data. */
  sendOtp: (phone: string) => Promise<QueryResponse<{ message: string; devOtp?: string }>>;
  /** Verify OTP and log in (auto-creates account if new user). */
  verifyOtp: (phone: string, otp: string) => AuthResponse<{ session: Session; user: User; isNewUser: boolean }>;
};

export const auth: AuthApi = {
  async getSession() {
    const storedSession = readSession();
    if (!storedSession) return { data: { session: null }, error: null };

    const response = await apiRequest<{ session: Session }>('/auth/me', { method: 'GET' }, true);
    if (response.error || !response.data?.session) {
      writeSession(null);
      return { data: { session: null }, error: null };
    }

    writeSession(response.data.session);
    return { data: { session: response.data.session }, error: null };
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

  async sendOtp(phone) {
    return apiRequest<{ message: string; devOtp?: string }>('/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }, false);
  },

  async verifyOtp(phone, otp) {
    const response = await apiRequest<{ session: Session; profile: unknown; isNewUser: boolean }>(
      '/auth/otp/verify',
      {
        method: 'POST',
        body: JSON.stringify({ phone, otp }),
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
};

export const db = {
  auth,
  from<T = unknown>(table: string) {
    return new QueryBuilder<T>(table);
  },
};

export const formatINR = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
