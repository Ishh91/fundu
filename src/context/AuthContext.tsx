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
  /** Send OTP to a phone number and optional email. Returns devOtp string in dev mode or fallback. */
  sendOtp: (phone: string, email?: string, fullName?: string) => Promise<{ error: string | null; devOtp?: string; message?: string }>;
  /** Verify OTP and complete login (auto-registers new users). */
  verifyOtp: (phone: string, otp: string, options?: { fullName?: string; email?: string; password?: string }) => Promise<{ error: string | null; isNewUser?: boolean }>;
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

  const sendOtp = async (phone: string, email?: string, fullName?: string) => {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const cleanEmail = email ? email.trim().toLowerCase() : undefined;

    // 1. If no email is provided, try Firebase Phone SMS first
    if (!cleanEmail) {
      try {
        const fbResult = await sendFirebasePhoneOtp(cleanPhone);
        if (fbResult.success) {
          return { error: null };
        }
        console.warn('Firebase SMS failed/quota-limited, falling back to server OTP:', fbResult.error);
      } catch (fbErr: any) {
        console.warn('Firebase SMS error, falling back to server OTP:', fbErr);
      }
    }

    // 2. Dispatch via Server OTP (dispatches SMS and optional Email via Gmail SMTP)
    try {
      const serverRes = await db.auth.sendOtp(cleanPhone, cleanEmail, fullName);
      if (serverRes.data) {
        return {
          error: null,
          devOtp: serverRes.data.devOtp,
          message: serverRes.data.message,
        };
      }
      return { error: serverRes.error?.message || 'Failed to send OTP.' };
    } catch (serverErr: any) {
      return { error: serverErr?.message || 'Failed to send OTP.' };
    }
  };

  const verifyOtp = async (phone: string, otp: string, options?: { fullName?: string; email?: string; password?: string }) => {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);

    // 1. If Firebase verification session exists, try it first
    if (window.confirmationResult) {
      try {
        const fbVerify = await verifyFirebasePhoneOtp(otp);
        if (fbVerify.success) {
          const { data, error } = await db.auth.verifyFirebaseSession(cleanPhone, options?.fullName, options?.email);
          if (error) return { error: error.message };
          if (!data?.session) return { error: 'Login failed. Please try again.' };
          return { error: null, isNewUser: data.isNewUser };
        }
      } catch (fbErr) {
        console.warn('Firebase verification error, falling back to server verification:', fbErr);
      }
    }

    // 2. Verify via Server OTP
    const serverVerify = await db.auth.verifyOtp(cleanPhone, otp, options);
    if (serverVerify.error) {
      return { error: serverVerify.error.message };
    }
    return { error: null, isNewUser: serverVerify.data?.isNewUser };
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



