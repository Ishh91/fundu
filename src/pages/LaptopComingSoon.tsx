import { Laptop, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LaptopComingSoon() {
  return (
    <div className="container-page py-16">
      <div className="surface-panel mx-auto max-w-3xl p-8 text-center md:p-12">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-700">
          <Laptop className="h-8 w-8" />
        </div>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700">
          <Sparkles className="h-3.5 w-3.5" /> Coming Soon
        </div>
        <h1 className="mt-4 font-display text-4xl font-extrabold text-ink-900">Laptop buying moves to a later phase</h1>
        <p className="mt-3 text-ink-600">
          Fundu is currently focused on a cleaner mobile-phone-only experience. Laptop journeys will return in a future release after the core phone marketplace is fully shaped.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/buy" className="btn-primary">Browse Phones</Link>
          <Link to="/" className="btn-outline">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
