import React, { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Phone, ArrowRight, CheckCircle2, RefreshCw, AlertCircle, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';
import { sendWelcomeEmail } from '../lib/freeNotifyService';
import { API_BASE } from '../config/apiConfig';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export default function Register() {
  const { sendOtp, verifyOtp, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  /* ── Form State ── */
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState(params.get('phone') || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  /* ── Workflow Step: 'form' | 'otp' | 'success' ── */
  const [step, setStep] = useState<'form' | 'otp' | 'success'>('form');

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
    const queryPhone = params.get('phone');
    if (queryPhone) {
      setPhone(queryPhone.replace(/\D/g, '').slice(-10));
    }
  }, [params]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCountdown = () => {
    setCountdown(RESEND_COOLDOWN);
    if (timerRef.current) clearInterval(timerRef.current);
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

  /* ── STEP 1: Handle Initial Form Submit (Send Mobile SMS OTP) ── */
  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = fullName.trim();
    if (!cleanName) {
      setError('Please enter your full name.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail && !cleanEmail.includes('@')) {
      setError('Please enter a valid email address, or leave it blank.');
      return;
    }

    setLoading(true);

    // If email is provided, pre-check if email is already taken by another account
    if (cleanEmail) {
      try {
        const checkRes = await fetch(`${API_BASE.replace(/\/$/, '')}/auth/check-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail }),
        });
        if (checkRes.ok) {
          const checkData = await checkRes.json();
          if (checkData?.data?.exists) {
            setLoading(false);
            setError(`⚠️ Email address "${cleanEmail}" is already registered. Please use another email or Sign In.`);
            return;
          }
        }
      } catch {
        // Continue if server check endpoint unreachable
      }
    }

    // Send Mobile SMS OTP via Firebase
    const otpRes = await sendOtp(cleanPhone);
    setLoading(false);

    if (otpRes.error) {
      setError(`❌ ${otpRes.error}`);
      return;
    }

    setStep('otp');
    setDigits(Array(OTP_LENGTH).fill(''));
    startCountdown();
    setTimeout(() => inputRefs.current[0]?.focus(), 150);
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

  /* ── STEP 2: Verify Mobile OTP & Complete Signup ── */
  const handleVerifyOtpAndSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = digits.join('');
    if (enteredOtp.length !== OTP_LENGTH) {
      setError('Please enter all 6 digits of the OTP.');
      return;
    }

    setLoading(true);
    setError(null);

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const cleanEmail = email.trim().toLowerCase();

    // Verify OTP with Firebase and register profile in MongoDB
    const verifyRes = await verifyOtp(cleanPhone, enteredOtp, {
      fullName: fullName.trim(),
      email: cleanEmail || undefined,
    });

    if (verifyRes.error) {
      setLoading(false);
      setError(verifyRes.error);
      return;
    }

    // Send Welcome Email if email was provided for record
    if (cleanEmail) {
      try {
        await sendWelcomeEmail(cleanEmail, fullName.trim() || 'User');
      } catch (welcomeErr) {
        console.error('Welcome email notice:', welcomeErr);
      }
    }

    setLoading(false);
    setStep('success');

    // Automatically redirect to Home Page (/) with Welcome notification banner
    const redirectUrl = `/?welcome=true&name=${encodeURIComponent(fullName.trim() || 'User')}`;
    setTimeout(() => {
      navigate(redirectUrl);
    }, 1500);
  };

  /* ── Resend Mobile SMS OTP Handler ── */
  const handleResendOtp = async () => {
    if (countdown > 0) return;
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    setDigits(Array(OTP_LENGTH).fill(''));
    setError(null);
    setLoading(true);

    const res = await sendOtp(cleanPhone);
    setLoading(false);

    if (res.error) {
      setError(`❌ ${res.error}`);
      return;
    }

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
            {step === 'otp' && 'Verify Mobile Number'}
            {step === 'success' && 'Account Activated! 🎉'}
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            {step === 'form' && 'Enter your details below to register with Instant Mobile OTP.'}
            {step === 'otp' && `Enter the 6-digit OTP code sent via SMS to +91 ${phone.replace(/\D/g, '').slice(-10)}`}
            {step === 'success' && 'Your mobile verification and account registration are complete!'}
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
              <label className="label">
                Full Name <span className="text-red-500 font-bold">*</span>
              </label>
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
              <label className="label">
                Mobile Number <span className="text-red-500 font-bold">*</span>
              </label>
              <div className="flex rounded-xl border border-ink-200 overflow-hidden focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10 bg-white">
                <div className="flex items-center border-r border-ink-200 bg-ink-50 px-3 py-3 text-ink-700 font-bold text-xs">
                  <Phone className="h-4 w-4 text-brand-500 mr-1.5" /> +91
                </div>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9876543210"
                  className="flex-1 bg-white px-3.5 py-3 text-ink-900 outline-none text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="label">
                Email Address
              </label>
              <div className="flex rounded-xl border border-ink-200 overflow-hidden focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10 bg-white">
                <div className="flex items-center border-r border-ink-200 bg-ink-50 px-3.5 py-3 text-ink-500">
                  <Mail className="h-4 w-4 text-brand-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com (optional)"
                  className="flex-1 bg-white px-3.5 py-3 text-ink-900 outline-none text-sm font-medium"
                />
              </div>

            </div>

            <div>
              <label className="label">
                Account Password
              </label>
              <div className="flex rounded-xl border border-ink-200 overflow-hidden focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10 bg-white">
                <div className="flex items-center border-r border-ink-200 bg-ink-50 px-3.5 py-3 text-ink-500">
                  <Lock className="h-4 w-4 text-brand-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password (optional)"
                  className="flex-1 bg-white px-3.5 py-3 text-ink-900 outline-none text-sm font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !fullName.trim() || phone.replace(/\D/g, '').length !== 10}
              className="btn-primary w-full mt-2 font-bold py-3"
            >
              {loading ? 'Sending SMS OTP…' : 'Register & Send Mobile OTP'} <ArrowRight className="h-4 w-4 ml-1" />
            </button>

            <p className="text-center text-xs text-ink-500 pt-2">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-brand-600 hover:underline">
                Sign in here
              </Link>
            </p>
          </form>
        )}

        {/* ── STEP 2: Mobile OTP Input ── */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtpAndSignup} className="mt-8 card p-6 md:p-8 space-y-5">
            <div className="p-4 rounded-2xl bg-[#F0F0F5] border border-[#C0C8D8] text-[#344257] text-xs space-y-1.5">
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5 text-[#1E2734]">
                  <Smartphone className="h-4 w-4 text-[#47576E]" /> Mobile SMS Verification
                </span>
              </div>
              <p>
                We have dispatched a 6-digit SMS verification code to <strong>+91 {phone.replace(/\D/g, '').slice(-10)}</strong>.
              </p>
            </div>

            <label className="label text-center block font-bold">Enter 6-Digit Mobile Verification Code</label>

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
                    borderColor: d ? '#344257' : '#C0C8D8',
                  }}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || digits.join('').length !== OTP_LENGTH}
              className="btn-primary w-full font-bold py-3"
            >
              {loading ? 'Verifying & Creating Account…' : 'Verify Mobile OTP & Complete Registration'} <ArrowRight className="h-4 w-4 ml-1" />
            </button>

            <div className="text-center text-xs text-ink-500 pt-1">
              {countdown > 0 ? (
                <span>Resend SMS OTP in <strong className="text-ink-700">{countdown}s</strong></span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 font-bold text-[#344257] hover:underline"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Resend Mobile OTP
                </button>
              )}
            </div>

            <div className="text-center pt-2 border-t border-ink-100">
              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setError(null);
                }}
                className="text-xs text-ink-500 hover:text-ink-800 underline"
              >
                ← Edit mobile number or details
              </button>
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
                <Smartphone className="h-4 w-4 text-[#47576E] shrink-0" />
                Mobile Number (+91 {phone.replace(/\D/g, '').slice(-10)}) Verified
              </p>
              {email ? (
                <p className="text-slate-600 text-[11px] pt-1 border-t border-emerald-200/60">
                  Email <strong>{email}</strong> recorded for your receipts and order updates.
                </p>
              ) : (
                <p className="text-slate-600 text-[11px] pt-1 border-t border-emerald-200/60">
                  Account verified strictly via Mobile SMS OTP.
                </p>
              )}
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
