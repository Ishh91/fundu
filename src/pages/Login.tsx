import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) { setError(error); return; }
    navigate(redirect);
  };

  return (
    <div className="container-page py-16">
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <BrandLogo imageClassName="h-20 w-auto" />
          </Link>
          <h1 className="mt-6 font-display text-3xl font-extrabold text-ink-900">Welcome back</h1>
          <p className="mt-2 text-ink-500">Sign in to track orders, sell requests, and repairs.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 card p-6 md:p-8">
          {error && (
            <div className="alert-error mb-4 flex items-center gap-2 p-3 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}
          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input pl-10" />
            </div>
          </div>
          <div className="mt-4">
            <label className="label">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input pl-10" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="mt-6 btn-primary w-full">
            {loading ? 'Signing in...' : 'Sign In'} <ArrowRight className="h-4 w-4" />
          </button>
          <p className="mt-5 text-center text-sm text-ink-500">
            New to Fundu? <Link to="/register" className="font-semibold text-brand-600 hover:underline">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
