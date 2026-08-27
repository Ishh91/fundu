import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Phone, ArrowRight, AlertCircle, ChevronLeft, RefreshCw, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

export default function Login() {
  const { sendOtp, verifyOtp, signIn, user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/dashboard';

  useEffect(() => {
    if (!authLoading && user) {
      if (profile?.role === 'admin') navigate('/admin');
      else if (profile?.role === 'vendor' || profile?.role === 'wholesaler') navigate('/vendor');
      else if (profile?.role === 'delivery' || profile?.role === 'rider') navigate('/delivery');
      else navigate(redirect);
    }
  }, [user, profile, authLoading, navigate, redirect]);

  /* ── Step 1 — Phone & Password ── */
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [devOtp, setDevOtp] = useState<string | null>(null);

  /* ── Step 2 — OTP ── */
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── Common ── */
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* ── Admin toggle ── */
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startCountdown = () => {
    setCountdown(RESEND_COOLDOWN);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timerRef.current!); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  /* ── Send OTP (Step 1 Submit) ── */
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Please enter your account password (min 6 characters).');
      return;
    }
    setLoading(true);
    setError(null);

    // 1. Verify credentials first if password login route
    const authRes = await signIn(cleaned, password);
    if (authRes.error) {
      setLoading(false);
      setError(authRes.error);
      return;
    }

    // 2. Trigger Phone & Email OTP
    const result = await sendOtp(cleaned);
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    setDevOtp(result.devOtp ?? null);
    setStep('otp');
    startCountdown();
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  };

  /* ── OTP digit handlers ── */
  const handleDigitChange = (idx: number, val: string) => {
    const char = val.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[idx] = char;
    setDigits(next);
    if (char && idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  /* ── Verify OTP ── */
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = digits.join('');
    if (otp.length !== OTP_LENGTH) {
      setError('Please enter all 6 digits of the OTP.');
      return;
    }
    setLoading(true);
    setError(null);
    const cleaned = phone.replace(/\D/g, '');
    const result = await verifyOtp(cleaned, otp);
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    navigate(redirect);
  };

  /* ── Resend OTP ── */
  const handleResend = async () => {
    if (countdown > 0) return;
    setDigits(Array(OTP_LENGTH).fill(''));
    setError(null);
    setLoading(true);
    const cleaned = phone.replace(/\D/g, '');
    const result = await sendOtp(cleaned);
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    setDevOtp(result.devOtp ?? null);
    startCountdown();
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  };

  /* ── Admin email+password login ── */
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await signIn(adminEmail, adminPassword);
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    navigate(redirect);
  };

  const formatPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  };

  return (
    <div className="container-page py-16">
      <div className="max-w-md mx-auto">

        {/* Logo */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center justify-center">
            <BrandLogo imageClassName="h-11 sm:h-14 md:h-16 w-auto max-w-[240px] sm:max-w-[290px] md:max-w-[320px] mx-auto filter drop-shadow-xs" />
          </Link>
          <h1 className="mt-6 font-display text-3xl font-extrabold text-ink-900">
            {step === 'credentials' ? 'Welcome back' : 'Enter OTP'}
          </h1>
          <p className="mt-2 text-ink-500">
            {step === 'credentials'
              ? 'Sign in with your mobile number and password.'
              : `We sent a 6-digit OTP to +91 ${formatPhone(phone)}`}
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mt-5 alert-error flex items-center gap-2 p-3 text-sm rounded-xl">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        {/* Dev OTP banner */}
        {devOtp && step === 'otp' && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-brand-300 bg-brand-50 px-4 py-3 text-sm text-brand-800">
            <ShieldCheck className="h-4 w-4 shrink-0 text-brand-600" />
            <span><strong>Dev mode OTP:</strong> <span className="font-mono font-bold tracking-widest text-brand-700">{devOtp}</span></span>
          </div>
        )}

        {/* ── Step 1: Mobile & Password ── */}
        {step === 'credentials' && !showAdminForm && (
          <form onSubmit={handleSendOtp} className="mt-8 card p-6 md:p-8 space-y-4" style={{ animation: 'panel-rise 0.3s ease-out' }}>
            <div>
              <label className="label">Mobile Number</label>
              <div className="flex rounded-xl border border-ink-200 overflow-hidden focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10 bg-white transition-all">
                <div className="flex items-center gap-1.5 border-r border-ink-200 bg-ink-50 px-3 py-3 text-sm font-semibold text-ink-600 select-none shrink-0">
                  <Phone className="h-4 w-4 text-brand-500" />
                  +91
                </div>
                <input
                  id="phone-input"
                  type="tel"
                  inputMode="numeric"
                  required
                  value={formatPhone(phone)}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                    setError(null);
                  }}
                  placeholder="98765 43210"
                  className="flex-1 bg-white px-4 py-3 text-ink-900 placeholder-ink-400 outline-none text-base"
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="••••••••"
                className="input"
              />
            </div>

            <button
              type="submit"
              id="send-otp-btn"
              disabled={loading || phone.replace(/\D/g, '').length !== 10 || password.length < 6}
              className="mt-6 btn-primary w-full"
            >
              {loading ? 'Verifying & Sending OTP…' : 'Continue to OTP'} <ArrowRight className="h-4 w-4" />
            </button>

            <p className="mt-5 text-center text-sm text-ink-500">
              New user? No worries — account will be created automatically.
            </p>

            <button
              type="button"
              onClick={() => navigate('/admin-login')}
              className="mt-3 w-full text-center text-xs text-brand-600 font-bold hover:text-brand-800 transition-colors"
            >
              Admin login →
            </button>
          </form>
        )}

        {/* ── Admin email+password form ── */}
        {step === 'credentials' && showAdminForm && (
          <form onSubmit={handleAdminLogin} className="mt-8 card p-6 md:p-8" style={{ animation: 'panel-rise 0.3s ease-out' }}>
            <button
              type="button"
              onClick={() => { setShowAdminForm(false); setError(null); }}
              className="mb-4 flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-800 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" /> Back to phone login
            </button>
            <div>
              <label className="label">Admin Email</label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@fundu.in"
                className="input"
              />
            </div>
            <div className="mt-4">
              <label className="label">Password</label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="input"
              />
            </div>
            <button type="submit" disabled={loading} className="mt-6 btn-primary w-full">
              {loading ? 'Signing in…' : 'Sign In as Admin'} <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        {/* ── Step 2: OTP input ── */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="mt-8 card p-6 md:p-8" style={{ animation: 'panel-rise 0.3s ease-out' }}>
            <button
              type="button"
              onClick={() => { setStep('phone'); setError(null); setDevOtp(null); setDigits(Array(OTP_LENGTH).fill('')); }}
              className="mb-5 flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-800 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" /> Change number
            </button>

            {/* 6-box OTP input */}
            <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
              {digits.map((d, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  id={`otp-digit-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-11 h-14 rounded-xl border-2 text-center text-xl font-bold text-ink-900 outline-none transition-all duration-200 bg-white"
                  style={{
                    borderColor: d ? 'rgb(var(--color-brand-500, 20 200 186))' : undefined,
                  }}
                />
              ))}
            </div>

            <style>{`
              #otp-digit-0, #otp-digit-1, #otp-digit-2,
              #otp-digit-3, #otp-digit-4, #otp-digit-5 {
                border-color: #e2e8f0;
              }
              #otp-digit-0:focus, #otp-digit-1:focus, #otp-digit-2:focus,
              #otp-digit-3:focus, #otp-digit-4:focus, #otp-digit-5:focus {
                border-color: #14c8ba;
                box-shadow: 0 0 0 4px rgba(20,200,186,0.12);
              }
            `}</style>

            <button
              type="submit"
              id="verify-otp-btn"
              disabled={loading || digits.join('').length !== OTP_LENGTH}
              className="mt-6 btn-primary w-full"
            >
              {loading ? 'Verifying…' : 'Verify & Login'} <ArrowRight className="h-4 w-4" />
            </button>

            {/* Resend */}
            <div className="mt-4 text-center text-sm text-ink-500">
              {countdown > 0 ? (
                <span>Resend OTP in <strong className="text-ink-700">{countdown}s</strong></span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 font-semibold text-brand-600 hover:underline disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Resend OTP
                </button>
              )}
            </div>
          </form>
        )}

        {/* Bottom link */}
        {step === 'phone' && !showAdminForm && (
          <p className="mt-6 text-center text-sm text-ink-500">
            Already have an email account? <Link to="/register" className="font-semibold text-brand-600 hover:underline">Register here</Link>
          </p>
        )}
      </div>
    </div>
  );
}


