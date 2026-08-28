import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, X, ShieldCheck, Zap, Tag, Smartphone, ArrowRight, Gift } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function VipLoginModal() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Do not show on auth pages, admin, delivery, or vendor portals
    const isAuthPath =
      location.pathname.startsWith('/login') ||
      location.pathname.startsWith('/register') ||
      location.pathname.startsWith('/admin') ||
      location.pathname.startsWith('/vendor') ||
      location.pathname.startsWith('/wholesaler') ||
      location.pathname.startsWith('/delivery') ||
      location.pathname.startsWith('/rider');

    if (loading || user || isAuthPath) {
      setIsOpen(false);
      return;
    }

    const isDismissed = sessionStorage.getItem('fundu_vip_login_popup_dismissed');
    if (isDismissed) return;

    // Show popup after 3.5 seconds
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 3500);

    return () => clearTimeout(timer);
  }, [user, loading, location.pathname]);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('fundu_vip_login_popup_dismissed', 'true');
  };

  if (!isOpen || user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-white space-y-6 p-6 sm:p-8">
        
        {/* Glow Ambient Lights */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition border border-slate-700/60"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Top Header Badge */}
        <div className="text-center space-y-3 pt-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-amber-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-black tracking-wide uppercase shadow-sm">
            <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
            <span>Exclusive VIP Member Portal</span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-black text-white leading-tight">
            🔥 Unlock Secret VIP Mobile Deals & Spot Cash!
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-md mx-auto">
            Log in to <span className="font-bold text-emerald-400">Fundu</span> right now to unlock unadvertised <span className="text-amber-300 font-bold">₹2,500 OFF</span> on Certified Flagship Phones & Get <span className="text-emerald-300 font-bold">100% Instant Spot Cash</span> at your Lucknow doorstep!
          </p>
        </div>

        {/* Highlight Perks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
              <Tag className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold text-xs text-white">Extra ₹2,500 Off</p>
              <p className="text-[11px] text-slate-400">On Apple & Samsung 5G Flagships</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold text-xs text-white">Instant Spot Cash</p>
              <p className="text-[11px] text-slate-400">30-Min Doorstep Sell Valuation</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 shrink-0">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold text-xs text-white">6-Month Free Warranty</p>
              <p className="text-[11px] text-slate-400">Fundu Certified Quality Check</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 shrink-0">
              <Gift className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold text-xs text-white">Welcome Gift Voucher</p>
              <p className="text-[11px] text-slate-400">Free Glass Guard & Case Included</p>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3 pt-2">
          <Link
            to="/login"
            onClick={handleClose}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-[0.99] text-slate-950 py-3.5 text-xs font-black shadow-lg shadow-emerald-500/25 transition"
          >
            <span>🚀 Login to Unlock Secret VIP Deals</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <div className="flex items-center justify-between text-xs px-1 text-slate-400">
            <span>Don't have an account yet?</span>
            <Link
              to="/register"
              onClick={handleClose}
              className="text-emerald-400 hover:underline font-bold"
            >
              ✨ Create Free Account →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
