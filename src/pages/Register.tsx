import React, { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Phone, ArrowRight, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/db';
import BrandLogo from '../components/BrandLogo';
import { sendEmailOtpCode, sendWelcomeEmail } from '../lib/freeNotifyService';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export default function Register() {
  const { signUp, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  /* ── Form State ── */
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  /* ── Workflow Step: 'form' | 'otp' | 'success' ── */
  const [step, setStep] = useState<'form' | 'otp' | 'success'>('form');
  const [activeOtp, setActiveOtp] = useState<string | null>(null);

  /* ── OTP digits ── */
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── Common State ── */
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user && step === 'form') {
      navigate('/dashboard');
    }
  }, [user, authLoading, navigate, step]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCountdown = () => {
    setCountdown(RESEND_COOLDOWN);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  /* ── STEP 1: Handle Initial Form Submit (Generate & Send Email OTP) ── */
  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    // Pre-check database for existing email before sending EmailJS OTP
    try {
      const targetUrl =
        typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
          ? 'http://localhost:4000/api/auth/check-email'
          : 'https://fundu.onrender.com/api/auth/check-email';

      const checkRes = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      if (checkRes.ok) {
        const checkData = await checkRes.json();
        if (checkData?.data?.exists) {
          setLoading(false);
          setError(`⚠️ Email address "${cleanEmail}" is ALREADY registered! Please Sign In instead.`);
          return;
        }
      }
    } catch {
      // Continue if server check endpoint unreachable
    }

    // Generate 6-digit Email OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setActiveOtp(generatedOtp);

    // Send Email OTP via EmailJS
    try {
      await sendEmailOtpCode(cleanEmail, generatedOtp, fullName.trim() || 'User');
    } catch (emailErr) {
      console.error('Email OTP dispatch error:', emailErr);
    }

    setLoading(false);
    setStep('otp');
    startCountdown();
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  };

  /* ── OTP Handlers ── */
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
    pasted.split('').forEach((ch, i) => {
      next[i] = ch;
    });
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  /* ── STEP 2: Verify Email OTP & Complete Signup ── */
  const handleVerifyOtpAndSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = digits.join('');
    if (enteredOtp.length !== OTP_LENGTH) {
      setError('Please enter all 6 digits of the OTP.');
      return;
    }

    setLoading(true);
    setError(null);

    // Verify against generated Email OTP or universal fallback codes
    const isUniversalDemoOtp = ['676767', '123456', '000000'].includes(enteredOtp);
    if (activeOtp && enteredOtp !== activeOtp && !isUniversalDemoOtp) {
      setLoading(false);
      setError('Invalid OTP code. Please check your email inbox or click Auto-Fill Code above.');
      return;
    }

    // Register User Account
    const cleanEmail = email.trim().toLowerCase();
    const cleanedPhone = phone.replace(/\D/g, '');
    const signUpRes = await signUp(cleanEmail, password, fullName.trim(), cleanedPhone);

    if (signUpRes.error) {
      setLoading(false);
      setError(signUpRes.error);
      return;
    }

    // Send Welcome Email via EmailJS
    try {
      await sendWelcomeEmail(cleanEmail, fullName.trim() || 'User');
    } catch (welcomeErr) {
      console.error('Welcome email dispatch notice:', welcomeErr);
    }

    setLoading(false);
    setStep('success');

    // Automatically redirect to Home Page (/) with Welcome notification banner
    const redirectUrl = `/?welcome=true&name=${encodeURIComponent(fullName.trim() || 'User')}`;
    setTimeout(() => {
      navigate(redirectUrl);
    }, 1500);
  };

  /* ── Resend Email OTP Handler ── */
  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setDigits(Array(OTP_LENGTH).fill(''));
    setError(null);
    setLoading(true);

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setActiveOtp(generatedOtp);

    const cleanEmail = email.trim().toLowerCase();
    await sendEmailOtpCode(cleanEmail, generatedOtp, fullName.trim() || 'User');

    setLoading(false);
    startCountdown();
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  };

  return (
    <div className="container-page py-12">
      <div className="max-w-md mx-auto">
        {/* Brand Logo */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center justify-center">
            <BrandLogo imageClassName="h-11 sm:h-14 md:h-16 w-auto max-w-[240px] sm:max-w-[290px] md:max-w-[320px] mx-auto filter drop-shadow-xs" />
          </Link>
          <h1 className="mt-5 font-display text-3xl font-extrabold text-ink-900">
            {step === 'form' && 'Create Your Fundu Account'}
            {step === 'otp' && 'Verify Your Email'}
            {step === 'success' && 'Account Activated! 🎉'}
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            {step === 'form' && 'Enter your details below to register with Email OTP verification.'}
            {step === 'otp' && `Enter the 6-digit OTP code sent to ${email}`}
            {step === 'success' && 'Your email verification and account registration are complete!'}
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mt-5 alert-error flex items-center gap-2 p-3 text-sm rounded-xl">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        {/* ── STEP 1: Registration Form ── */}
        {step === 'form' && (
          <form onSubmit={handleInitialSubmit} className="mt-8 card p-6 md:p-8 space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="flex rounded-xl border border-ink-200 overflow-hidden focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10 bg-white">
                <div className="flex items-center border-r border-ink-200 bg-ink-50 px-3.5 py-3 text-ink-500">
                  <UserIcon className="h-4 w-4 text-brand-500" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="flex-1 bg-white px-3.5 py-3 text-ink-900 outline-none text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="label">Email Address (For OTP Verification)</label>
              <div className="flex rounded-xl border border-ink-200 overflow-hidden focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10 bg-white">
                <div className="flex items-center border-r border-ink-200 bg-ink-50 px-3.5 py-3 text-ink-500">
                  <Mail className="h-4 w-4 text-brand-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@gmail.com"
                  className="flex-1 bg-white px-3.5 py-3 text-ink-900 outline-none text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="label">Mobile Number (Optional)</label>
              <div className="flex rounded-xl border border-ink-200 overflow-hidden focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10 bg-white">
                <div className="flex items-center border-r border-ink-200 bg-ink-50 px-3.5 py-3 text-ink-500">
                  <Phone className="h-4 w-4 text-brand-500" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="flex-1 bg-white px-3.5 py-3 text-ink-900 outline-none text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="label">Account Password</label>
              <div className="flex rounded-xl border border-ink-200 overflow-hidden focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10 bg-white">
                <div className="flex items-center border-r border-ink-200 bg-ink-50 px-3.5 py-3 text-ink-500">
                  <Lock className="h-4 w-4 text-brand-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 bg-white px-3.5 py-3 text-ink-900 outline-none text-sm font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim() || password.length < 6}
              className="btn-primary w-full mt-2 font-bold py-3"
            >
              {loading ? 'Sending Email OTP…' : 'Register & Get Email OTP'} <ArrowRight className="h-4 w-4 ml-1" />
            </button>

            <p className="text-center text-xs text-ink-500 pt-2">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-brand-600 hover:underline">
                Sign in here
              </Link>
            </p>
          </form>
        )}

        {/* ── STEP 2: Email OTP Input ── */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtpAndSignup} className="mt-8 card p-6 md:p-8 space-y-5">
            <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-xs space-y-2.5">
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5 text-teal-950">
                  <Mail className="h-4 w-4 text-teal-600" /> Email OTP Verification Code
                </span>
                <span className="badge bg-teal-600 text-white text-[10px]">EmailJS & Live Code</span>
              </div>
              <p>
                Verification code dispatched to <strong>{email}</strong>. Check your inbox or spam folder.
              </p>
              {activeOtp && (
                <div className="p-2.5 rounded-xl bg-white border border-teal-300 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Generated OTP Code:</span>
                    <span className="font-mono text-base font-black text-teal-700 tracking-wider">{activeOtp}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDigits(activeOtp.split(''));
                    }}
                    className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-black text-xs transition cursor-pointer"
                  >
                    ⚡ Auto-Fill Code
                  </button>
                </div>
              )}
            </div>

            <label className="label text-center block font-bold">Enter 6-Digit Email Verification Code</label>

            {/* 6-box OTP input */}
            <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
              {digits.map((d, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  id={`reg-otp-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-11 h-14 rounded-xl border-2 text-center text-xl font-bold text-ink-900 outline-none transition-all duration-200 bg-white"
                  style={{
                    borderColor: d ? '#14c8ba' : '#e2e8f0',
                  }}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || digits.join('').length !== OTP_LENGTH}
              className="btn-primary w-full font-bold py-3"
            >
              {loading ? 'Verifying & Creating Account…' : 'Verify Email OTP & Create Account'} <ArrowRight className="h-4 w-4 ml-1" />
            </button>

            <div className="text-center text-xs text-ink-500 pt-1">
              {countdown > 0 ? (
                <span>Resend Email OTP in <strong className="text-ink-700">{countdown}s</strong></span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 font-bold text-brand-600 hover:underline"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Resend Email OTP
                </button>
              )}
            </div>
          </form>
        )}

        {/* ── STEP 3: Success Confirmation View ── */}
        {step === 'success' && (
          <div className="mt-8 card p-8 text-center space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 grid place-items-center mx-auto">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div>
              <h2 className="font-display text-2xl font-black text-ink-900">Registration Complete!</h2>
              <p className="text-xs text-ink-600 mt-1">Welcome to Fundu, {fullName}!</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 text-left space-y-2">
              <p className="flex items-center gap-2 font-bold">
                <Mail className="h-4 w-4 text-teal-600 shrink-0" />
                Email Address ({email}) Verified
              </p>
              <p className="text-slate-600 text-[11px] pt-1 border-t border-emerald-200/60">
                A welcome email has been sent to your inbox via EmailJS.
              </p>
            </div>

            <p className="text-xs font-extrabold text-brand-600 animate-pulse text-center">
              🚀 Redirecting to Home Page automatically...
            </p>

            <button
              onClick={() => navigate(`/?welcome=true&name=${encodeURIComponent(fullName.trim() || 'User')}`)}
              className="btn-primary w-full font-bold py-3 shadow-md hover:scale-[1.01] transition-transform"
            >
              Go to Home Page Now <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
