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
    <footer className="border-t border-gray-200 bg-white">
      {/* Top Cashify Style Action Banner */}
      <div className="bg-gradient-to-r from-[#0f2d30] via-[#0d5953] to-[#14c8ba] py-8 text-white">
        <div className="container-page flex flex-col md:flex-row items-center justify-between gap-5">
          <div>
            <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white">
              Lucknow Mobile Hub
            </span>
            <h3 className="mt-2 font-display text-2xl sm:text-3xl font-black">
              Sell Old Phone, Buy Refurbished or Repair at Doorstep.
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-teal-100 font-medium">
              Free doorstep pickup, spot cash/UPI payment & 6 months warranty across Lucknow.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/sell"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-extrabold text-gray-900 shadow-md hover:bg-teal-50 transition active:scale-95"
            >
              <span>Sell Phone Now</span>
              <ArrowRight className="h-4 w-4 text-teal-600" />
            </Link>
            <Link
              to="/repair"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-500 hover:bg-teal-600 px-5 py-3 text-xs font-bold text-white shadow-md transition"
            >
              <Wrench className="h-4 w-4" />
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
              <BrandLogo imageClassName="h-10 sm:h-12 w-auto max-w-[190px]" />
            </Link>
            <p className="text-xs leading-relaxed text-gray-500">
              Fundu is Lucknow's dedicated smartphone re-commerce platform. We simplify selling old mobiles, buying certified refurbished devices, and getting doorstep phone repairs done in 30 minutes.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1 rounded-md bg-teal-50 px-2 py-1 text-[11px] font-bold text-teal-700">
                <Truck className="h-3 w-3" /> Free Pickup
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700">
                <ShieldCheck className="h-3 w-3" /> 6M Warranty
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-700">
                <Wrench className="h-3 w-3" /> 30-Min Repair
              </span>
            </div>
          </div>

          {/* Col 2: Services in Lucknow */}
          <div>
            <h4 className="font-display text-xs font-black uppercase tracking-wider text-gray-900">
              Services in Lucknow
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs font-semibold text-gray-600">
              <li>
                <Link to="/sell" className="hover:text-teal-600 flex items-center gap-1.5">
                  <BadgeIndianRupee className="h-3.5 w-3.5 text-teal-600" /> Sell Used Mobile for Cash
                </Link>
              </li>
              <li>
                <Link to="/buy" className="hover:text-teal-600 flex items-center gap-1.5">
                  <Store className="h-3.5 w-3.5 text-teal-600" /> Buy Refurbished iPhones & Androids
                </Link>
              </li>
              <li>
                <Link to="/repair" className="hover:text-teal-600 flex items-center gap-1.5">
                  <Wrench className="h-3.5 w-3.5 text-teal-600" /> Doorstep Screen Replacement
                </Link>
              </li>
              <li>
                <Link to="/repair?issue=battery" className="hover:text-teal-600 flex items-center gap-1.5">
                  <Wrench className="h-3.5 w-3.5 text-teal-600" /> Doorstep Battery Replacement
                </Link>
              </li>
              <li>
                <Link to="/store" className="hover:text-teal-600 flex items-center gap-1.5">
                  <Store className="h-3.5 w-3.5 text-teal-600" /> Fundu Exclusive Store
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Lucknow Localities Covered */}
          <div>
            <h4 className="font-display text-xs font-black uppercase tracking-wider text-gray-900">
              Lucknow Localities
            </h4>
            <div className="mt-4 grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs text-gray-500 font-medium">
              {LUCKNOW_LOCALITIES.slice(0, 10).map((loc) => (
                <span key={loc} className="flex items-center gap-1 truncate">
                  <CheckCircle2 className="h-3 w-3 text-teal-600 shrink-0" />
                  {loc}
                </span>
              ))}
            </div>
            <p className="mt-3 text-[11px] font-bold text-teal-700">
              + All other Lucknow pin codes supported!
            </p>
          </div>

          {/* Col 4: Lucknow Reach & Helpdesk */}
          <div>
            <h4 className="font-display text-xs font-black uppercase tracking-wider text-gray-900">
              Lucknow Helpline
            </h4>
            <ul className="mt-4 space-y-3 text-xs text-gray-600 font-medium">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                <span>Hazratganj, Lucknow, Uttar Pradesh 226001</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-teal-600" />
                <a href="tel:+919876543210" className="font-bold text-gray-900 hover:text-teal-600">
                  +91 98765 43210 (9 AM - 9 PM)
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-teal-600" />
                <a href="mailto:hello@fundu.in" className="hover:text-teal-600">
                  hello@fundu.in
                </a>
              </li>
              <li className="pt-1">
                <Link
                  to="/partner"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800 hover:bg-teal-100"
                >
                  Partner With Us in Lucknow →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 pt-6 text-xs text-gray-500 font-medium">
          <p>© {new Date().getFullYear()} Fundu Technologies Pvt. Ltd. Exclusively for Lucknow.</p>
          <div className="flex items-center gap-4 text-xs">
            <Link to="/about" className="hover:text-teal-600">About Us</Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-teal-600">Contact</Link>
            <span>•</span>
            <Link to="/articles" className="hover:text-teal-600">Guides</Link>
            <span>•</span>
            <span>100% Data Safe</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
