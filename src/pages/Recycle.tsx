import { Leaf, RefreshCcw, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Recycle() {
  return (
    <div className="container-page py-12">
      <section className="rounded-[32px] border border-ink-200 bg-gradient-to-br from-nature-50 via-ink-100 to-brand-50 p-8 md:p-12">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-nature-700">Recycle</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold text-ink-900">Responsible phone recycling starts with the right path</h1>
          <p className="mt-3 text-ink-600">
            If a phone is no longer fit for resale or repair, Fundu can guide the next step toward responsible recycling and safe device disposal.
          </p>
        </div>
      </section>

      <section className="mt-10 grid gap-5 md:grid-cols-3">
        {[
          { icon: RefreshCcw, title: 'Trade-in first', desc: 'We help determine if your device still has resale or exchange value before recycling.' },
          { icon: ShieldCheck, title: 'Data safety', desc: 'Factory reset and ownership guidance matter before any disposal decision is made.' },
          { icon: Leaf, title: 'Lower e-waste', desc: 'Responsible routing helps reduce unnecessary waste and extends device life where possible.' },
        ].map((item) => (
          <div key={item.title} className="card p-6">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-nature-50 text-nature-700">
              <item.icon className="h-6 w-6" />
            </div>
            <h2 className="mt-4 font-display text-xl font-bold text-ink-900">{item.title}</h2>
            <p className="mt-2 text-sm text-ink-500">{item.desc}</p>
          </div>
        ))}
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link to="/sell" className="btn-primary">Check Sell Value First</Link>
        <Link to="/contact" className="btn-outline">Talk to Support</Link>
      </div>
    </div>
  );
}
