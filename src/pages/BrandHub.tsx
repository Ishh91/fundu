import { Smartphone, Wrench, BadgeIndianRupee } from 'lucide-react';
import { LOOKUP_BRANDS } from '../data/phoneLookup';

export default function BrandHub() {
  return (
    <div className="container-page py-12">
      <section className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.28em] text-brand-700">Brand Hub</p>
        <h1 className="mt-3 font-display text-4xl font-extrabold text-ink-900">One brand layer across buy, sell, and repair</h1>
        <p className="mt-3 text-ink-600">
          Brand Hub is where Fundu organizes supported mobile brands so users can jump into the right lookup flow without hunting around the site.
        </p>
      </section>

      <section className="mt-10 grid gap-5 md:grid-cols-3">
        {[
          { icon: BadgeIndianRupee, title: 'Sell by brand', desc: 'Start valuation faster with a guided model and storage selection path.' },
          { icon: Smartphone, title: 'Buy by brand', desc: 'Browse best deals with cleaner comparison between condition and storage variants.' },
          { icon: Wrench, title: 'Repair by brand', desc: 'Find common repair categories and likely parts support for your device family.' },
        ].map((item) => (
          <div key={item.title} className="card p-6">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
              <item.icon className="h-6 w-6" />
            </div>
            <h2 className="mt-4 font-display text-xl font-bold text-ink-900">{item.title}</h2>
            <p className="mt-2 text-sm text-ink-500">{item.desc}</p>
          </div>
        ))}
      </section>

      <section className="mt-10 card p-8">
        <h2 className="font-display text-2xl font-extrabold text-ink-900">Supported brands</h2>
        <div className="mt-6 flex flex-wrap gap-3">
          {LOOKUP_BRANDS.map((item) => (
            <span key={item} className="rounded-full border border-ink-200 bg-ink-200/70 px-4 py-2 text-sm font-semibold text-ink-700">
              {item}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
