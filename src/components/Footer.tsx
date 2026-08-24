import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Truck,
  ShieldCheck,
  Wrench,
  BadgeIndianRupee,
  Store,
  CheckCircle2,
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import { LUCKNOW_LOCALITIES } from './Navbar';

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-white/70 bg-white/85 backdrop-blur-2xl">
      {/* Top Action Banner with the 5-Color Gradient */}
      <div
        className="py-10 text-slate-900 border-b border-white/60 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #86dedd 0%, #bfebe1 25%, #9ac0dd 50%, #c0e7e4 75%, #a2e5e2 100%)',
        }}
      >
        <div className="container-page flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div>
            <span className="rounded-full bg-slate-900 text-white px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-wider shadow-sm">
              📍 Lucknow Exclusive Hub
            </span>
            <h3 className="mt-2.5 font-display text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950">
              Sell Old Phone, Buy Refurbished or Repair at Doorstep.
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-800 font-semibold">
              Free doorstep pickup, spot cash/UPI payment & 6 months warranty across Lucknow.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/sell"
              className="canva-pill-white font-extrabold shadow-md hover:scale-105"
            >
              <span>Sell Phone Now</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Link>
            <Link
              to="/repair"
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 hover:bg-black px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <Wrench className="h-4 w-4 text-[#86dedd]" />
              <span>Book Doorstep Repair</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container-page py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Col 1: About Fundu */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <BrandLogo imageClassName="h-11 sm:h-14 md:h-16 w-auto max-w-[240px] sm:max-w-[290px] md:max-w-[320px]" />
            </Link>
            <p className="text-xs leading-relaxed text-slate-600 font-medium">
              Fundu is Lucknow's dedicated smartphone re-commerce platform. We simplify selling old mobiles, buying certified refurbished devices, and getting doorstep phone repairs done in 30 minutes.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#c0e7e4]/70 border border-[#86dedd]/50 px-2.5 py-1 text-[11px] font-bold text-slate-800">
                <Truck className="h-3 w-3 text-teal-700" /> Free Pickup
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#bfebe1]/70 border border-[#86dedd]/50 px-2.5 py-1 text-[11px] font-bold text-slate-800">
                <ShieldCheck className="h-3 w-3 text-teal-700" /> 6M Warranty
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#9ac0dd]/40 border border-[#9ac0dd]/60 px-2.5 py-1 text-[11px] font-bold text-slate-800">
                <Wrench className="h-3 w-3 text-teal-700" /> 30-Min Repair
              </span>
            </div>
          </div>

          {/* Col 2: Services in Lucknow */}
          <div>
            <h4 className="font-display text-xs font-black uppercase tracking-wider text-slate-900">
              Services in Lucknow
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs font-semibold text-slate-700">
              <li>
                <Link to="/sell" className="hover:text-teal-700 flex items-center gap-1.5 transition">
                  <BadgeIndianRupee className="h-3.5 w-3.5 text-teal-600" /> Sell Used Mobile for Cash
                </Link>
              </li>
              <li>
                <Link to="/buy" className="hover:text-teal-700 flex items-center gap-1.5 transition">
                  <Store className="h-3.5 w-3.5 text-teal-600" /> Buy Refurbished iPhones & Androids
                </Link>
              </li>
              <li>
                <Link to="/repair" className="hover:text-teal-700 flex items-center gap-1.5 transition">
                  <Wrench className="h-3.5 w-3.5 text-teal-600" /> Doorstep Screen Replacement
                </Link>
              </li>
              <li>
                <Link to="/repair?issue=battery" className="hover:text-teal-700 flex items-center gap-1.5 transition">
                  <Wrench className="h-3.5 w-3.5 text-teal-600" /> Doorstep Battery Replacement
                </Link>
              </li>
              <li>
                <Link to="/store" className="hover:text-teal-700 flex items-center gap-1.5 transition">
                  <Store className="h-3.5 w-3.5 text-teal-600" /> Fundu Exclusive Store
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Lucknow Localities Covered */}
          <div>
            <h4 className="font-display text-xs font-black uppercase tracking-wider text-slate-900">
              Lucknow Localities
            </h4>
            <div className="mt-4 grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs text-slate-600 font-medium">
              {LUCKNOW_LOCALITIES.slice(0, 10).map((loc) => (
                <span key={loc} className="flex items-center gap-1 truncate">
                  <CheckCircle2 className="h-3 w-3 text-teal-600 shrink-0" />
                  {loc}
                </span>
              ))}
            </div>
            <p className="mt-3 text-[11px] font-bold text-teal-800">
              + All other Lucknow pin codes supported!
            </p>
          </div>

          {/* Col 4: Lucknow Reach & Helpdesk */}
          <div>
            <h4 className="font-display text-xs font-black uppercase tracking-wider text-slate-900">
              Lucknow Helpline
            </h4>
            <ul className="mt-4 space-y-3 text-xs text-slate-700 font-medium">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                <span>Hazratganj, Lucknow, Uttar Pradesh 226001</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-teal-600" />
                <a href="tel:+919876543210" className="font-bold text-slate-950 hover:text-teal-700 transition">
                  +91 98765 43210 (9 AM - 9 PM)
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-teal-600" />
                <a href="mailto:hello@fundu.in" className="hover:text-teal-700 transition">
                  hello@fundu.in
                </a>
              </li>
              <li className="pt-1">
                <Link
                  to="/partner"
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#c0e7e4]/70 border border-[#86dedd]/60 px-3.5 py-1.5 text-xs font-bold text-slate-900 hover:bg-[#a2e5e2] transition shadow-sm"
                >
                  Partner With Us in Lucknow →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/80 pt-6 text-xs text-slate-500 font-medium">
          <p>© {new Date().getFullYear()} Fundu Technologies Pvt. Ltd. Exclusively for Lucknow.</p>
          <div className="flex items-center gap-4 text-xs">
            <Link to="/about" className="hover:text-teal-700 transition">About Us</Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-teal-700 transition">Contact</Link>
            <span>•</span>
            <Link to="/articles" className="hover:text-teal-700 transition">Guides</Link>
            <span>•</span>
            <span>100% Data Safe</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
