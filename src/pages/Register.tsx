import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, ArrowRight } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';

export default function Register() {
  const navigate = useNavigate();

  // Auto-redirect after 4 seconds
  useEffect(() => {
    const t = setTimeout(() => navigate('/login'), 4000);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="container-page py-16">
      <div className="max-w-md mx-auto text-center">
        <Link to="/" className="inline-flex items-center justify-center">
          <BrandLogo imageClassName="h-14 sm:h-16 w-auto max-w-[260px] mx-auto" />
        </Link>

        <div className="mt-8 card p-8">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-600 mb-5">
            <Phone className="h-8 w-8" />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-ink-900">No registration needed!</h1>
          <p className="mt-3 text-ink-500 leading-relaxed">
            Fundu par account banana bilkul easy hai. Bas apna <strong className="text-ink-800">mobile number</strong> daalo,
            OTP verify karo — aur tumhara account ready! Koi password set karne ki zarurat nahi.
          </p>

          <Link
            to="/login"
            className="mt-6 btn-primary w-full"
          >
            Login / Register with Phone <ArrowRight className="h-4 w-4" />
          </Link>

          <p className="mt-4 text-xs text-ink-400">Redirecting automatically in a moment…</p>
        </div>
      </div>
    </div>
  );
}


