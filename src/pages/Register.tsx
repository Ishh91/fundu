import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await signUp(form.email, form.password, form.fullName, form.phone);
    setLoading(false);
    if (error) { setError(error); return; }
    setSuccess(true);
    setTimeout(() => navigate('/dashboard'), 1500);
  };

  if (success) {
    return (
      <div className="container-page py-16">
        <div className="max-w-md mx-auto card p-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-nature-100 text-nature-600">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h2 className="mt-4 font-display text-2xl font-extrabold text-ink-900">Account created!</h2>
          <p className="mt-2 text-ink-500">Taking you to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-16">
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <BrandLogo imageClassName="h-20 w-auto" />
          </Link>
          <h1 className="mt-6 font-display text-3xl font-extrabold text-ink-900">Create your account</h1>
          <p className="mt-2 text-ink-500">Join 3,100+ customers in Lucknow.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 card p-6 md:p-8">
          {error && (
            <div className="alert-error mb-4 flex items-center gap-2 p-3 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}
          <div>
            <label className="label">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
              <input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Your name" className="input pl-10" />
            </div>
          </div>
          <div className="mt-4">
            <label className="label">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className="input pl-10" />
            </div>
          </div>
          <div className="mt-4">
            <label className="label">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
              <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" className="input pl-10" />
            </div>
          </div>
          <div className="mt-4">
            <label className="label">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
              <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" className="input pl-10" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="mt-6 btn-primary w-full">
            {loading ? 'Creating account...' : 'Create Account'} <ArrowRight className="h-4 w-4" />
          </button>
          <p className="mt-5 text-center text-sm text-ink-500">
            Already have an account? <Link to="/login" className="font-semibold text-brand-600 hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
