import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Lock,
  User as UserIcon,
  ArrowRight,
  AlertCircle,
  KeyRound,
  Mail,
  X,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  Phone,
  Smartphone,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';
import { sendEmailOtpCode } from '../lib/freeNotifyService';
import { API_BASE } from '../config/apiConfig';

export default function Login() {
  const { signIn, sendOtp, verifyOtp, user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/';

  /* ── Auth Mode: 'otp' (default) vs 'password' ── */
  const [authMode, setAuthMode] = useState<'otp' | 'password'>('otp');

  /* ── Mobile OTP States ── */
  const [phone, setPhone] = useState('');
  const [otpStep, setOtpStep] = useState<'input' | 'verify'>('input');
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(''));
  const [otpCountdown, setOtpCountdown] = useState(0);
  const otpInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const otpTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  /* ── Unified Credentials State ── */
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  /* ── UI Notification & Loading States ── */
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* ── Reset Password Modal States ── */
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetStep, setResetStep] = useState<1 | 2>(1); // 1: Send OTP, 2: Verify & New Password
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtpInput, setResetOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (otpTimerRef.current) clearInterval(otpTimerRef.current);
    };
  }, []);

  const startOtpCountdown = () => {
    setOtpCountdown(60);
    if (otpTimerRef.current) clearInterval(otpTimerRef.current);
    otpTimerRef.current = setInterval(() => {
      setOtpCountdown((c) => {
        if (c <= 1) {
          clearInterval(otpTimerRef.current!);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setError('⚠️ Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setLoading(true);
    setError(null);
    setDevOtpHint(null);

    const res = await sendOtp(cleanPhone);
    setLoading(false);

    if (res.error) {
      setError(`❌ ${res.error}`);
      return;
    }

    setOtpStep('verify');
    setOtpDigits(Array(6).fill(''));
    if (res.devOtp) {
      setDevOtpHint(res.devOtp);
    }
    startOtpCountdown();
    setTimeout(() => {
      otpInputRefs.current[0]?.focus();
    }, 150);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const otpCode = otpDigits.join('');

    if (otpCode.length !== 6) {
      setError('⚠️ Please enter the complete 6-digit OTP.');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await verifyOtp(cleanPhone, otpCode);
    setLoading(false);

    if (res.error) {
      setError(`❌ ${res.error}`);
      return;
    }

    setSuccessMsg('✅ Mobile number verified successfully! Redirecting...');
  };

  const handleOtpDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    if (!clean) {
      const next = [...otpDigits];
      next[index] = '';
      setOtpDigits(next);
      return;
    }

    if (clean.length > 1) {
      const pasted = clean.slice(0, 6).split('');
      const next = [...otpDigits];
      pasted.forEach((d, i) => {
        if (i < 6) next[i] = d;
      });
      setOtpDigits(next);
      const targetIndex = Math.min(pasted.length, 5);
      otpInputRefs.current[targetIndex]?.focus();
      return;
    }

    const next = [...otpDigits];
    next[index] = clean;
    setOtpDigits(next);
    if (index < 5 && clean) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      const activeRole = profile?.role || user?.role || 'customer';
      if (activeRole === 'admin') navigate('/admin');
      else if (activeRole === 'vendor' || activeRole === 'wholesaler') navigate('/vendor');
      else if (activeRole === 'delivery' || activeRole === 'rider') navigate('/delivery');
      else navigate(redirect);
    }
  }, [user, profile, authLoading, navigate, redirect]);

  /* ── Direct Login Submit Handler ── */
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = identifier.trim();
    if (!cleanId) {
      setError('⚠️ Please enter your mobile number or email address.');
      return;
    }
    if (!password) {
      setError('⚠️ Please enter your account password.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const authRes = await signIn(cleanId, password);
    setLoading(false);

    if (authRes.error) {
      const errText = String(authRes.error);
      if (errText.includes('404') || errText.toLowerCase().includes('not found') || errText.toLowerCase().includes('no registered account')) {
        setError(`⚠️ Account Not Registered: "${cleanId}" is not registered. Please check details or click Create New Account below.`);
      } else if (errText.toLowerCase().includes('incorrect') || errText.toLowerCase().includes('invalid')) {
        setError(`❌ Password Incorrect: The password entered for "${cleanId}" is incorrect. Please try again or click Reset Password.`);
      } else {
        setError(errText);
      }
      return;
    }

    const role = ((authRes as any).profile?.role as string) || (profile?.role as string);
    if (role === 'admin') {
      navigate('/admin');
    } else if (role === 'vendor' || role === 'wholesaler') {
      navigate('/vendor');
    } else if (role === 'delivery' || role === 'rider') {
      navigate('/delivery');
    } else {
      navigate(redirect);
    }
  };

  /* ── Step 1: Send Reset Password EmailJS OTP ── */
  const handleSendResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = resetEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setResetError('Please enter your registered email address.');
      return;
    }

    setResetLoading(true);
    setResetError(null);
    setResetSuccess(null);

    try {
      // 1. Check if Email is registered in database BEFORE sending OTP
      const baseUrl = API_BASE;
      const checkRes = await fetch(`${baseUrl.replace(/\/$/, '')}/auth/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const checkJson = await checkRes.json();
      if (!checkJson.data?.exists) {
        setResetError(`⚠️ Email Not Registered: "${cleanEmail}" is not found in our database. Please check your email or click Create New Account below.`);
        return;
      }

      // 2. Generate 6-digit Reset OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(otpCode);

      // 3. Dispatch EmailJS Reset OTP (ONLY to user's email inbox)
      await sendEmailOtpCode(cleanEmail, otpCode, 'User Account');

      // 4. Set UI Success message without revealing numeric OTP code
      setResetSuccess(`📧 Verification OTP code sent to ${cleanEmail} via Email. Please check your email inbox.`);
      setResetStep(2);
    } catch (err: any) {
      console.error('Reset OTP error:', err);
      setResetError('Failed to send reset OTP. Please check your internet connection and try again.');
    } finally {
      setResetLoading(false);
    }
  };

  /* ── Step 2: Verify OTP & Submit New Password ── */
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetOtpInput.trim() !== generatedOtp.trim()) {
      setResetError('❌ Invalid OTP Code! Please enter the correct 6-digit code sent to your email.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setResetError('⚠️ Password must be at least 6 characters long.');
      return;
    }

    setResetLoading(true);
    setResetError(null);

    try {
      const resetUrl = `${API_BASE.replace(/\/$/, '')}/auth/reset-password`;

      const response = await fetch(resetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetEmail.trim().toLowerCase(),
          newPassword: newPassword,
        }),
      });

      if (!response) {
        throw new Error('Failed to connect to authentication server');
      }
      const json = await response.json();
      if (json.error) {
        throw new Error(json.error.message || json.error);
      }

      setResetModalOpen(false);
      setSuccessMsg(`🎉 Password Reset Successfully! Please sign in with your new password.`);
      setIdentifier(resetEmail.trim().toLowerCase());
      setPassword('');
    } catch (err: any) {
      setResetError(err?.message || 'Failed to reset password. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="container-page py-16">
      <div className="max-w-md mx-auto">
        {/* Brand Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center justify-center">
            <BrandLogo imageClassName="h-11 sm:h-14 md:h-16 w-auto max-w-[240px] sm:max-w-[290px] md:max-w-[320px] mx-auto filter drop-shadow-xs" />
          </Link>
          <h1 className="mt-6 font-display text-3xl font-extrabold text-ink-900">
            Sign In to Fundu
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            Enter your mobile number or email and password to access your account.
          </p>
        </div>

        {/* Success Banner */}
        {successMsg && (
          <div className="mt-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2.5 shadow-xs">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <div className="flex-1 font-bold text-sm text-emerald-950">{successMsg}</div>
          </div>
        )}

        {/* Prominent Error Banner */}
        {error && (
          <div className="mt-5 p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-semibold flex items-start gap-2.5 shadow-sm animate-shake">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p className="font-bold text-rose-950 text-sm">
                {error.includes('Not Registered') ? '⚠️ Account Not Registered' : error.includes('Incorrect') ? '❌ Password Incorrect' : 'Authentication Notice'}
              </p>
              <p className="text-rose-800 font-medium leading-relaxed">{error}</p>
              {error.includes('Not Registered') && (
                <div className="pt-1">
                  <Link to="/register" className="inline-flex items-center gap-1 font-extrabold text-brand-700 underline hover:text-brand-900 text-xs">
                    Click here to Create New Account <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              )}
              {error.includes('Incorrect') && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(identifier);
                      setResetModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 font-extrabold text-brand-700 underline hover:text-brand-900 text-xs"
                  >
                    Click here to Reset Password <KeyRound className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Auth Mode Toggle Tabs */}
        <div className="mt-6 grid grid-cols-2 p-1.5 rounded-2xl bg-gray-100 border border-gray-200 text-xs font-black shadow-xs">
          <button
            type="button"
            onClick={() => { setAuthMode('otp'); setError(null); }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all cursor-pointer ${
              authMode === 'otp'
                ? 'bg-white text-gray-950 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Smartphone className="h-4 w-4 text-[#00a896]" /> Mobile OTP
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('password'); setError(null); }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all cursor-pointer ${
              authMode === 'password'
                ? 'bg-white text-gray-950 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Lock className="h-4 w-4 text-[#00a896]" /> Password
          </button>
        </div>

        {/* ── MODE 1: MOBILE OTP AUTHENTICATION (TWILIO) ── */}
        {authMode === 'otp' && (
          <div className="mt-4 card p-6 md:p-8 space-y-5 shadow-sm border border-ink-100 bg-white rounded-3xl animate-fade-in">
            {otpStep === 'input' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="label">Enter Your Mobile Number</label>
                  <div className="flex rounded-xl border border-ink-200 overflow-hidden focus-within:border-[#00a896] focus-within:ring-4 focus-within:ring-[#00a896]/10 bg-white transition-all">
                    <div className="flex items-center gap-1.5 border-r border-ink-200 bg-ink-50 px-3.5 py-3 text-xs font-black text-gray-700 select-none shrink-0">
                      <span>🇮🇳</span>
                      <span>+91</span>
                    </div>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value.replace(/\D/g, ''));
                        setError(null);
                      }}
                      placeholder="Enter 10-digit mobile number"
                      className="flex-1 bg-white px-3.5 py-3 text-ink-900 outline-none text-sm font-bold tracking-wider"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#00a896]" />
                    We'll send a 6-digit OTP code via Twilio SMS to verify.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || phone.replace(/\D/g, '').length !== 10}
                  className="btn-primary w-full py-3 font-bold shadow-md hover:scale-[1.01] transition-transform flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" /> Sending OTP via Twilio...
                    </>
                  ) : (
                    <>
                      Get OTP on Mobile <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold">OTP sent via Twilio SMS to:</p>
                    <p className="text-sm font-black text-gray-900">+91 {phone}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpStep('input');
                      setError(null);
                      setDevOtpHint(null);
                    }}
                    className="text-xs text-[#00a896] font-bold hover:underline"
                  >
                    Change Number
                  </button>
                </div>

                {devOtpHint && (
                  <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold flex items-center justify-between">
                    <span>🔑 Dev Mode OTP:</span>
                    <span className="font-mono text-sm tracking-widest text-[#00a896]">{devOtpHint}</span>
                  </div>
                )}

                <div>
                  <label className="label text-center mb-2 block">Enter 6-Digit OTP</label>
                  <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpInputRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-10 sm:w-12 h-12 sm:h-14 text-center text-lg sm:text-xl font-black rounded-xl border border-gray-300 focus:border-[#00a896] focus:ring-4 focus:ring-[#00a896]/10 outline-none transition bg-white"
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || otpDigits.join('').length !== 6}
                  className="btn-primary w-full py-3 font-bold shadow-md hover:scale-[1.01] transition-transform flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" /> Verifying Code...
                    </>
                  ) : (
                    <>
                      Verify & Sign In <CheckCircle2 className="h-4 w-4" />
                    </>
                  )}
                </button>

                {/* Resend OTP */}
                <div className="text-center pt-2">
                  {otpCountdown > 0 ? (
                    <p className="text-xs text-gray-400 font-semibold">
                      Resend OTP in <span className="text-[#00a896] font-bold">{otpCountdown}s</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="text-xs text-[#00a896] font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <RefreshCw className="h-3 w-3" /> Resend OTP Code
                    </button>
                  )}
                </div>
              </form>
            )}

            <div className="mt-4 text-center text-xs text-ink-500 pt-3 border-t border-ink-100">
              New to Fundu? Sign in with mobile OTP automatically creates your account!
            </div>
          </div>
        )}

        {/* ── MODE 2: EMAIL & PASSWORD FORM (ADMIN & LEGACY) ── */}
        {authMode === 'password' && (
          <form onSubmit={handleLoginSubmit} className="mt-4 card p-6 md:p-8 space-y-4 shadow-sm border border-ink-100 bg-white rounded-3xl animate-fade-in">
            {/* Unified Identifier Input */}
            <div>
              <label className="label">Mobile Number or Email Address</label>
              <div className="flex rounded-xl border border-ink-200 overflow-hidden focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10 bg-white transition-all">
                <div className="flex items-center border-r border-ink-200 bg-ink-50 px-3.5 py-3 text-ink-500 select-none shrink-0">
                  <UserIcon className="h-4 w-4 text-brand-500" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setError(null);
                  }}
                  placeholder="e.g. 9876543210 or user@gmail.com"
                  className="flex-1 bg-white px-3.5 py-3 text-ink-900 outline-none text-sm font-medium"
                />
              </div>
            </div>

            {/* Password Input + Reset Password Link */}
            <div>
              <div className="flex items-center justify-between">
                <label className="label">Account Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(identifier);
                    setResetModalOpen(true);
                  }}
                  className="text-xs font-bold text-brand-600 hover:underline hover:text-brand-800 flex items-center gap-1 mb-1"
                >
                  <KeyRound className="h-3 w-3" /> Reset Password?
                </button>
              </div>
              <div className="flex rounded-xl border border-ink-200 overflow-hidden focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10 bg-white transition-all">
                <div className="flex items-center border-r border-ink-200 bg-ink-50 px-3.5 py-3 text-ink-500 select-none shrink-0">
                  <Lock className="h-4 w-4 text-brand-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="••••••••"
                  className="flex-1 bg-white px-3.5 py-3 text-ink-900 outline-none text-sm font-medium"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !identifier.trim() || !password}
              className="btn-primary w-full mt-2 font-bold py-3 shadow-md hover:scale-[1.01] transition-transform"
            >
              {loading ? 'Signing in…' : 'Sign In with Password'} <ArrowRight className="h-4 w-4 ml-1" />
            </button>

            {/* Registration Redirect Link */}
            <div className="mt-5 text-center text-xs text-ink-500 pt-2 border-t border-ink-100">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-brand-600 hover:underline">
                Create New Account
              </Link>
            </div>
          </form>
        )}
      </div>

      {/* ── RESET PASSWORD MODAL ── */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="card max-w-md w-full p-6 md:p-8 space-y-4 bg-white rounded-3xl animate-scale-up shadow-xl">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
              <h3 className="font-display text-lg font-black text-ink-900 flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-brand-600" /> Reset Password
              </h3>
              <button
                onClick={() => {
                  setResetModalOpen(false);
                  setResetStep(1);
                  setResetError(null);
                }}
                className="p-1 rounded-full text-ink-400 hover:text-ink-900 hover:bg-ink-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {resetError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold space-y-1.5">
                <p>{resetError}</p>
                {resetError.includes('Not Registered') && (
                  <div className="pt-1">
                    <Link
                      to="/register"
                      onClick={() => setResetModalOpen(false)}
                      className="inline-flex items-center gap-1 font-extrabold text-brand-700 underline hover:text-brand-900 text-xs"
                    >
                      Click here to Create New Account <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            )}

            {resetSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium">
                {resetSuccess}
              </div>
            )}

            {/* STEP 1: Enter Email to Send EmailJS OTP */}
            {resetStep === 1 ? (
              <form onSubmit={handleSendResetOtp} className="space-y-4 text-xs">
                <p className="text-ink-600">
                  Enter your registered email address below. We will send a 6-digit Verification OTP code via EmailJS to verify your identity.
                </p>

                <div>
                  <label className="label">Registered Email Address</label>
                  <div className="flex rounded-xl border border-ink-200 overflow-hidden focus-within:border-brand-500 bg-white">
                    <div className="flex items-center border-r border-ink-200 bg-ink-50 px-3 text-ink-500">
                      <Mail className="h-4 w-4 text-brand-500" />
                    </div>
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="user@gmail.com"
                      className="w-full px-3.5 py-3 outline-none font-medium text-ink-900"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={resetLoading || !resetEmail}
                  className="btn-primary w-full py-3 font-bold text-sm"
                >
                  {resetLoading ? 'Sending Verification OTP…' : 'Send Verification OTP'}
                </button>
              </form>
            ) : (
              /* STEP 2: Verify OTP & Enter New Password */
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-xs">
                <p className="text-ink-600">
                  Enter the 6-digit OTP sent to <strong>{resetEmail}</strong> and your new password.
                </p>

                <div>
                  <label className="label">6-Digit Email OTP Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={resetOtpInput}
                    onChange={(e) => setResetOtpInput(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    className="input w-full text-center font-mono text-base tracking-widest py-2.5 font-bold"
                  />
                </div>

                <div>
                  <label className="label">New Account Password</label>
                  <div className="flex rounded-xl border border-ink-200 overflow-hidden focus-within:border-brand-500 bg-white">
                    <div className="flex items-center border-r border-ink-200 bg-ink-50 px-3 text-ink-500">
                      <Lock className="h-4 w-4 text-brand-500" />
                    </div>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full px-3.5 py-3 outline-none font-medium text-ink-900"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setResetStep(1)}
                    className="btn-outline flex-1 py-2.5 font-bold text-xs"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading || !resetOtpInput || !newPassword}
                    className="btn-primary flex-1 py-2.5 font-bold text-xs"
                  >
                    {resetLoading ? 'Resetting Password…' : 'Confirm New Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
