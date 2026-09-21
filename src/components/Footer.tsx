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
    <footer className="mt-12 border-t border-[#C0C8D8]/70 bg-white/95 backdrop-blur-2xl">
      {/* Top Action Banner with the Official Palette Gradient */}
      <div
        className="py-10 text-white border-b border-[#344257]/30 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #344257 0%, #47576E 50%, #5D6A82 100%)',
        }}
      >
        <div className="container-page flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div>
            <span className="rounded-full bg-white/15 border border-white/20 text-white px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-wider shadow-sm">
              📍 Lucknow Exclusive Hub
            </span>
            <h3 className="mt-2.5 font-display text-2xl sm:text-3xl lg:text-4xl font-black text-white">
              Sell Old Phone, Buy Refurbished or Repair at Doorstep.
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-[#C0C8D8] font-semibold">
              Free doorstep pickup, spot cash/UPI payment & 6 months warranty across Lucknow.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/sell"
              className="inline-flex items-center justify-center px-7 py-3 rounded-full bg-white text-[#344257] font-black text-sm shadow-md hover:shadow-xl hover:bg-gray-100 active:scale-95 transition-all duration-200"
            >
              <span>Sell Phone Now</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Link>
            <Link
              to="/repair"
              className="inline-flex items-center gap-2 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <Wrench className="h-4 w-4 text-[#C0C8D8]" />
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
            <p className="text-xs leading-relaxed text-[#47576E] font-medium">
              Fundu is Lucknow's dedicated smartphone re-commerce platform. We simplify selling old mobiles, buying certified refurbished devices, and getting doorstep phone repairs done in 30 minutes.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F0F0F5] border border-[#C0C8D8] px-2.5 py-1 text-[11px] font-bold text-[#344257]">
                <Truck className="h-3 w-3 text-[#6A859F]" /> Free Pickup
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F0F0F5] border border-[#C0C8D8] px-2.5 py-1 text-[11px] font-bold text-[#344257]">
                <ShieldCheck className="h-3 w-3 text-[#6A859F]" /> 6M Warranty
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F0F0F5] border border-[#C0C8D8] px-2.5 py-1 text-[11px] font-bold text-[#344257]">
                <Wrench className="h-3 w-3 text-[#6A859F]" /> 30-Min Repair
              </span>
            </div>
          </div>

          {/* Col 2: Services in Lucknow */}
          <div>
            <h4 className="font-display text-xs font-black uppercase tracking-wider text-[#344257]">
              Services in Lucknow
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs font-semibold text-[#47576E]">
              <li>
                <Link to="/sell" className="hover:text-[#344257] flex items-center gap-1.5 transition">
                  <BadgeIndianRupee className="h-3.5 w-3.5 text-[#6A859F]" /> Sell Used Mobile for Cash
                </Link>
              </li>
              <li>
                <Link to="/buy" className="hover:text-[#344257] flex items-center gap-1.5 transition">
                  <Store className="h-3.5 w-3.5 text-[#6A859F]" /> Buy Refurbished iPhones & Androids
                </Link>
              </li>
              <li>
                <Link to="/repair" className="hover:text-[#344257] flex items-center gap-1.5 transition">
                  <Wrench className="h-3.5 w-3.5 text-[#6A859F]" /> Doorstep Screen Replacement
                </Link>
              </li>
              <li>
                <Link to="/repair?issue=battery" className="hover:text-[#344257] flex items-center gap-1.5 transition">
                  <Wrench className="h-3.5 w-3.5 text-[#6A859F]" /> Doorstep Battery Replacement
                </Link>
              </li>
              <li>
                <Link to="/store" className="hover:text-[#344257] flex items-center gap-1.5 transition">
                  <Store className="h-3.5 w-3.5 text-[#6A859F]" /> Fundu Exclusive Store
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Lucknow Localities Covered */}
          <div>
            <h4 className="font-display text-xs font-black uppercase tracking-wider text-[#344257]">
              Lucknow Localities
            </h4>
            <div className="mt-4 grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs text-[#47576E] font-medium">
              {LUCKNOW_LOCALITIES.slice(0, 10).map((loc) => (
                <span key={loc} className="flex items-center gap-1 truncate">
                  <CheckCircle2 className="h-3 w-3 text-[#6A859F] shrink-0" />
                  {loc}
                </span>
              ))}
            </div>
            <p className="mt-3 text-[11px] font-bold text-[#47576E]">
              + All other Lucknow pin codes supported!
            </p>
          </div>

          {/* Col 4: Helpline & Contact */}
          <div>
            <h4 className="font-display text-xs font-black uppercase tracking-wider text-[#344257]">
              Helpline
            </h4>
            <ul className="mt-4 space-y-3 text-xs text-[#47576E] font-medium">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#6A859F]" />
                <span>Hazratganj, Lucknow, Uttar Pradesh 226001</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-[#6A859F]" />
                <a href="tel:+919876543210" className="font-bold text-[#344257] hover:text-[#6A859F] transition">
                  +91 98765 43210 (9 AM - 9 PM)
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-[#6A859F]" />
                <a href="mailto:hello@fundu.in" className="hover:text-[#344257] transition">
                  hello@fundu.in
                </a>
              </li>
              <li className="pt-1">
                <Link
                  to="/partner"
                  className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#344257] to-[#5D6A82] text-white px-4 py-2 text-xs font-bold hover:brightness-110 transition shadow-sm"
                >
                  Partner With Us in Lucknow →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#C0C8D8]/70 pt-6 text-xs text-[#8A9AAF] font-medium">
          <p>© {new Date().getFullYear()} Fundu Technologies Pvt. Ltd.</p>
          <div className="flex items-center gap-4 text-xs">
            <Link to="/about" className="hover:text-[#344257] transition">About Us</Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-[#344257] transition">Contact</Link>
            <span>•</span>
            <Link to="/articles" className="hover:text-[#344257] transition">Guides</Link>
            <span>•</span>
            <span className="text-[#344257] font-semibold">100% Data Safe</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
