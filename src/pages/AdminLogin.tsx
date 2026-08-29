import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const { signIn, user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user) {
      const activeRole = profile?.role || user?.role || 'customer';
      if (activeRole === 'admin') navigate('/admin');
      else if (activeRole === 'vendor' || activeRole === 'wholesaler') navigate('/vendor');
      else if (activeRole === 'delivery' || activeRole === 'rider') navigate('/delivery');
      else navigate('/dashboard');
    }
  }, [user, profile, authLoading, navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn(email.trim(), password.trim());
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Badge */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500 text-white font-extrabold text-2xl shadow-lg shadow-brand-500/20">
            F
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 border border-slate-800 px-3 py-1 text-xs font-mono text-brand-400">
            <ShieldCheck className="h-3.5 w-3.5" /> Central Admin Command Portal
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-black text-white">
            Admin Management Portal
          </h1>
          <p className="text-xs text-slate-400">
            Exclusive entry for Lucknow Central Operations & Catalog Management
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-xl">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@fundu.in"
                  className="w-full rounded-2xl bg-slate-950 border border-slate-800 text-white pl-10 pr-4 py-3 text-xs font-mono focus:border-brand-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Administrator Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-2xl bg-slate-950 border border-slate-800 text-white pl-10 pr-4 py-3 text-xs font-mono focus:border-brand-500 focus:outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-brand-500 hover:bg-brand-600 active:scale-[0.99] text-white py-3.5 text-xs font-bold shadow-lg shadow-brand-500/25 transition disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating Admin...</span>
              ) : (
                <>
                  <span>Sign In to Admin Console</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center border-t border-slate-800 text-[11px] text-slate-500 space-x-2">
            <span>Lucknow Central Hub · </span>
            <Link to="/wholesaler-login" className="text-brand-400 hover:underline">Wholesaler Portal</Link>
            <span>·</span>
            <Link to="/rider-login" className="text-emerald-400 hover:underline">Delivery Portal</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
