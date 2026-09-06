import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User, db } from '../lib/db';
import { sendFirebasePhoneOtp, verifyFirebasePhoneOtp } from '../lib/firebase';

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: 'customer' | 'wholesaler' | 'admin' | 'delivery' | 'rider';
  business_name: string | null;
  gst_number?: string | null;
  credit_limit?: number;
  outstanding_balance?: number;
  is_b2b_approved?: boolean;
  is_verified: boolean;
  avatar_url: string | null;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  /** Send OTP to a phone number. Returns devOtp string in dev mode. */
  sendOtp: (phone: string) => Promise<{ error: string | null; devOtp?: string }>;
  /** Verify OTP and complete login (auto-registers new users). */
  verifyOtp: (phone: string, otp: string) => Promise<{ error: string | null; isNewUser?: boolean }>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    const { data } = await db.from('profiles').select('*').eq('id', uid).maybeSingle();
    setProfile(data as Profile | null);
  };

  useEffect(() => {
    db.auth.getSession().then(({ data }) => {
      const currentSession = data?.session ?? null;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: sub } = db.auth.onAuthStateChange((_event, newSession) => {
      (async () => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          await fetchProfile(newSession.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      })();
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await db.auth.signInWithPassword({ email, password });
    if (error) return { error: error?.message ?? null, user: null, profile: null };
    const prof = data?.user ? await fetchProfile(data.user.id) : null;
    return { error: null, user: data?.user, profile: prof };
  };

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    const { data, error } = await db.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone } },
    });
    if (error) return { error: error.message };
    if (!data?.user) return { error: 'Unable to create account.' };
    return { error: null };
  };

  const sendOtp = async (phone: string) => {
    // 1. Primary: Send real SMS via Firebase Phone Authentication (10,000 free SMS/mo)
    try {
      const fbResult = await sendFirebasePhoneOtp(phone);
      if (fbResult.success) {
        return { error: null };
      }
      if (fbResult.error && !fbResult.error.toLowerCase().includes('network')) {
        return { error: fbResult.error };
      }
    } catch (fbErr: any) {
      console.warn('Firebase OTP failed, falling back to server dispatch:', fbErr);
    }

    // 2. Fallback to server-side SMS provider if Firebase client fails
    const { data, error } = await db.auth.sendOtp(phone);
    if (error) return { error: error.message };
    return { error: null, devOtp: data?.devOtp };
  };

  const verifyOtp = async (phone: string, otp: string) => {
    // 1. If Firebase confirmation result is present, verify code with Firebase
    if (typeof window !== 'undefined' && window.confirmationResult) {
      const fbVerify = await verifyFirebasePhoneOtp(otp);
      if (fbVerify.success) {
        const { data, error } = await db.auth.verifyFirebaseSession(phone);
        if (error) return { error: error.message };
        if (!data?.session) return { error: 'Login failed. Please try again.' };
        return { error: null, isNewUser: data.isNewUser };
      }
      return { error: fbVerify.error || 'Invalid OTP code.' };
    }

    // 2. Fallback to server-side verification
    const { data, error } = await db.auth.verifyOtp(phone, otp);
    if (error) return { error: error.message };
    if (!data?.session) return { error: 'Login failed. Please try again.' };
    return { error: null, isNewUser: data.isNewUser };
  };

  const signOut = async () => {
    await db.auth.signOut();
    setProfile(null);
    setUser(null);
    setSession(null);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, signIn, signUp, signOut, refreshProfile, sendOtp, verifyOtp }}>
      {children}
    </AuthContext.Provider>
  );
}

const defaultAuthFallback: AuthContextValue = {
  session: null,
  user: null,
  profile: null,
  loading: false,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  refreshProfile: async () => {},
  sendOtp: async () => ({ error: null }),
  verifyOtp: async () => ({ error: null }),
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  return ctx || defaultAuthFallback;
}



