import { Link } from 'react-router-dom';
import { ArrowRight, Mail, Phone, MapPin, Truck, ShieldCheck, Wrench, FileText, Store, Recycle } from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-ink-200 bg-ink-50">
      <div className="container-page py-12">
        <div className="mb-10 rounded-[34px] bg-[linear-gradient(135deg,_rgba(108,99,255,0.98),_rgba(71,61,163,0.98))] px-6 py-7 text-white shadow-card md:flex md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-900">Ready to start?</p>
            <h3 className="mt-2 font-display text-2xl font-extrabold md:text-3xl">Get phone value, browse deals, or book repair from one place.</h3>
          </div>
          <div className="mt-5 flex flex-wrap gap-3 md:mt-0">
            <Link to="/sell" className="btn border border-white/15 bg-ink-50 px-5 py-3 text-ink-900 hover:bg-ink-200">
              Sell Your Phone <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/buy" className="btn border border-white/20 bg-white/5 px-5 py-3 text-white hover:bg-white/10">
              Browse Phones
            </Link>
          </div>
        </div>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <BrandLogo imageClassName="h-16 w-auto" />
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-ink-600">
              Fundu is a mobile-phone-first marketplace focused on selling, buying, repairing, and responsibly recycling devices with doorstep support across Lucknow.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="badge bg-brand-50 text-brand-700"><Truck className="h-3 w-3" /> Free Pickup</span>
              <span className="badge bg-accent-50 text-accent-700"><ShieldCheck className="h-3 w-3" /> Warranty</span>
              <span className="badge bg-nature-50 text-nature-700"><Wrench className="h-3 w-3" /> Expert Repair</span>
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-ink-900">Services</h4>
            <ul className="mt-3 space-y-2 text-sm text-ink-600">
              <li><Link to="/sell" className="hover:text-brand-700">Sell Your Phone</Link></li>
              <li><Link to="/buy" className="hover:text-brand-700">Buy Refurbished Phones</Link></li>
              <li><Link to="/repair" className="hover:text-brand-700">Phone Repair</Link></li>
              <li><Link to="/store" className="hover:text-brand-700">Our Exclusive Store</Link></li>
              <li><Link to="/recycle" className="hover:text-brand-700">Recycle Phones</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-ink-900">Explore</h4>
            <ul className="mt-3 space-y-2 text-sm text-ink-600">
              <li><Link to="/document-doctor" className="inline-flex items-center gap-2 hover:text-brand-700"><FileText className="h-4 w-4" /> Document Doctor</Link></li>
              <li><Link to="/partner" className="hover:text-brand-700">Business With Us</Link></li>
              <li><Link to="/brand" className="hover:text-brand-700">Brand Hub</Link></li>
              <li><Link to="/articles" className="hover:text-brand-700">Trending Articles</Link></li>
              <li><Link to="/buy-laptop" className="hover:text-brand-700">Buy Laptop (Coming Soon)</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-ink-900">Reach Us</h4>
            <ul className="mt-3 space-y-3 text-sm text-ink-600">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                <span>Hazratganj, Lucknow, Uttar Pradesh 226001</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-brand-600" />
                <a href="tel:+919876543210" className="hover:text-brand-700">CUG: +91 98765 43210</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-brand-600" />
                <a href="mailto:hello@fundu.in" className="hover:text-brand-700">hello@fundu.in</a>
              </li>
              <li className="flex items-center gap-2">
                <Store className="h-4 w-4 shrink-0 text-brand-600" />
                <Link to="/store" className="hover:text-brand-700">Exclusive store collections</Link>
              </li>
              <li className="flex items-center gap-2">
                <Recycle className="h-4 w-4 shrink-0 text-brand-600" />
                <Link to="/recycle" className="hover:text-brand-700">Recycling guidance</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-ink-200 pt-6 text-xs text-ink-400 sm:flex-row">
          <p>© {new Date().getFullYear()} Fundu. Made for Lucknow.</p>
          <p>Privacy · Terms · Warranty Policy</p>
        </div>
      </div>
    </footer>
  );
}
