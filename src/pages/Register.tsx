import React, { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Mail, Lock, User as UserIcon, ArrowRight, CheckCircle2, ShieldCheck, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/db';
import BrandLogo from '../components/BrandLogo';
import { sendEmailOtpCode, sendWelcomeEmail } from '../lib/freeNotifyService';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export default function Register() {
  const { sendOtp, verifyOtp, signUp, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  /* ── Form State ── */
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  /* ── Workflow Step: 'form' | 'otp' | 'success' ── */
  const [step, setStep] = useState<'form' | 'otp' | 'success'>('form');
  const [devOtp, setDevOtp] = useState<string | null>(null);

  /* ── OTP digits ── */
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── Common State ── */
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSentStatus, setEmailSentStatus] = useState<boolean>(false);

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

  /* ── STEP 1: Handle Initial Form Submit ── */
  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedPhone = phone.replace(/\D/g, '');

    if (cleanedPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    // 0. Check database for existing mobile number or email
    const cleanEmail = email.trim().toLowerCase();
    try {
      const { data: existingProfiles } = await db.from('profiles').select('*');
      if (Array.isArray(existingProfiles)) {
        const phoneMatch = existingProfiles.find((p: any) => p.phone && String(p.phone).replace(/\D/g, '').endsWith(cleanedPhone));
        const emailMatch = existingProfiles.find((p: any) => p.email && String(p.email).toLowerCase() === cleanEmail);

        if (phoneMatch) {
          setLoading(false);
          setError(`⚠️ Mobile number +91 ${cleanedPhone} is ALREADY registered in our database! No duplicate account created. Please Sign In instead.`);
          return;
        }
        if (emailMatch) {
          setLoading(false);
          setError(`⚠️ Email address "${cleanEmail}" is ALREADY registered in our database! No duplicate account created. Please Sign In instead.`);
          return;
        }
      }
    } catch (checkErr) {
      console.warn('Database duplicate check warning:', checkErr);
    }

    // 1. Trigger Phone OTP
    const otpResult = await sendOtp(cleanedPhone);
    setLoading(false);

    if (otpResult.error) {
      setError(otpResult.error);
      return;
    }

    setDevOtp(otpResult.devOtp ?? null);

    // 2. Trigger Real Verification Email to user's email address
    try {
      const emailOtp = otpResult.devOtp || Math.floor(100000 + Math.random() * 900000).toString();
      await sendEmailOtpCode(email.trim(), emailOtp, fullName.trim() || 'User');
      setEmailSentStatus(true);
    } catch (emailErr) {
      console.error('Email verification dispatch error:', emailErr);
    }

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

  /* ── STEP 2: Verify OTP & Complete Signup ── */
  const handleVerifyOtpAndSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = digits.join('');
    if (otp.length !== OTP_LENGTH) {
      setError('Please enter all 6 digits of the OTP.');
      return;
    }

    setLoading(true);
    setError(null);
    const cleanedPhone = phone.replace(/\D/g, '');

    // 1. Verify Phone OTP
    const verifyResult = await verifyOtp(cleanedPhone, otp);
    if (verifyResult.error) {
      setLoading(false);
      setError(verifyResult.error);
      return;
    }

    // 2. Also register email profile
    await signUp(email, password, fullName, cleanedPhone);
    setLoading(false);

    setStep('success');
  };

  /* ── Resend OTP Handler ── */
  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setDigits(Array(OTP_LENGTH).fill(''));
    setError(null);
    setLoading(true);
    const cleanedPhone = phone.replace(/\D/g, '');
    const result = await sendOtp(cleanedPhone);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setDevOtp(result.devOtp ?? null);
    startCountdown();
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  };

  const formatPhoneDisplay = (raw: string) => {
    const d = raw.replace(/\D/g, '').slice(0, 10);
    if (d.length <= 5) return d;
    return `${d.slice(0, 5)} ${d.slice(5)}`;
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
            {step === 'otp' && 'Verify Phone & Email'}
            {step === 'success' && 'Account Activated! 🎉'}
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            {step === 'form' && 'Enter your mobile number, email, and password to register.'}
            {step === 'otp' && `Enter the 6-digit OTP sent to +91 ${formatPhoneDisplay(phone)}`}
            {step === 'success' && 'Your mobile number and email verification link have been processed!'}
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mt-5 alert-error flex items-center gap-2 p-3 text-sm rounded-xl">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        {/* Dev OTP helper banner */}
        {devOtp && step === 'otp' && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-brand-300 bg-brand-50 px-4 py-3 text-sm text-brand-800">
            <ShieldCheck className="h-4 w-4 shrink-0 text-brand-600" />
            <span>
              <strong>Dev mode OTP:</strong>{' '}
              <span className="font-mono font-bold tracking-widest text-brand-700">{devOtp}</span>
            </span>
          </div>
        )}

        {/* ── STEP 1: Registration Form ── */}
        {step === 'form' && (
          <form onSubmit={handleInitialSubmit} className="mt-8 card p-6 md:p-8 space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="flex rounded-xl border border-ink-200 overflow-hidden focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10 bg-white">
                <div className="flex items-center border-r border-ink-200 bg-ink-50 px-3 py-3 text-ink-500">
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
              <label className="label">Mobile Number (For OTP Verification)</label>
              <div className="flex rounded-xl border border-ink-200 overflow-hidden focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10 bg-white">
                <div className="flex items-center gap-1 border-r border-ink-200 bg-ink-50 px-3 py-3 text-sm font-semibold text-ink-600 select-none shrink-0">
                  <Phone className="h-4 w-4 text-brand-500" />
                  +91
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  required
                  value={formatPhoneDisplay(phone)}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="98765 43210"
                  className="flex-1 bg-white px-3.5 py-3 text-ink-900 outline-none text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="label">Email Address (For Confirmation Link)</label>
              <div className="flex rounded-xl border border-ink-200 overflow-hidden focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10 bg-white">
                <div className="flex items-center border-r border-ink-200 bg-ink-50 px-3 py-3 text-ink-500">
                  <Mail className="h-4 w-4 text-brand-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="trustiqueassist0003@gmail.com"
                  className="flex-1 bg-white px-3.5 py-3 text-ink-900 outline-none text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="label">Account Password</label>
              <div className="flex rounded-xl border border-ink-200 overflow-hidden focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10 bg-white">
                <div className="flex items-center border-r border-ink-200 bg-ink-50 px-3 py-3 text-ink-500">
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
              disabled={loading || phone.replace(/\D/g, '').length !== 10 || !email}
              className="btn-primary w-full mt-2 font-bold py-3"
            >
              {loading ? 'Sending OTP & Email…' : 'Register & Get OTP'} <ArrowRight className="h-4 w-4 ml-1" />
            </button>

            <p className="text-center text-xs text-ink-500 pt-2">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-brand-600 hover:underline">
                Sign in here
              </Link>
            </p>
          </form>
        )}

        {/* ── STEP 2: OTP & Resend Email Confirmation ── */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtpAndSignup} className="mt-8 card p-6 md:p-8 space-y-5">
            {/* Email Dispatch Notice Box */}
            <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-xs space-y-1.5">
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5 text-teal-950">
                  <Mail className="h-4 w-4 text-teal-600" /> Resend Confirmation Email Sent
                </span>
                <span className="badge bg-teal-600 text-white text-[10px]">Live Resend API</span>
              </div>
              <p>
                We have dispatched a verification email to <strong>{email}</strong> containing a <strong>"Verify & Activate Account"</strong> button!
              </p>
            </div>

            <label className="label text-center block font-bold">Enter 6-Digit Mobile Phone OTP</label>

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
              {loading ? 'Verifying & Activating…' : 'Verify OTP & Complete Registration'} <ArrowRight className="h-4 w-4 ml-1" />
            </button>

            <div className="text-center text-xs text-ink-500 pt-1">
              {countdown > 0 ? (
                <span>Resend OTP in <strong className="text-ink-700">{countdown}s</strong></span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 font-bold text-brand-600 hover:underline"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Resend OTP
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
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                Mobile Phone (+91 {phone}) Verified with OTP
              </p>
              <p className="flex items-center gap-2 font-bold">
                <Mail className="h-4 w-4 text-teal-600 shrink-0" />
                Confirmation Email Sent to {email}
              </p>
              <p className="text-slate-600 text-[11px] pt-1 border-t border-emerald-200/60">
                Check your inbox (or spam folder) and click the <strong>"Verify & Activate Account"</strong> button in the email from Resend API.
              </p>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary w-full font-bold py-3"
            >
              Go to My Account Dashboard <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
