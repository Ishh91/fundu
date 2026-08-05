import { CheckCircle2, ShieldCheck, Store, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FunduStore() {
  return (
    <div className="container-page py-12">
      <section className="rounded-[32px] bg-gradient-to-br from-ink-100 via-brand-50 to-ink-100 p-8 md:p-12">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            <Store className="h-3.5 w-3.5" /> Our Exclusive Store
          </div>
          <h1 className="mt-4 font-display text-4xl font-extrabold">A curated storefront for trusted refurbished phones</h1>
          <p className="mt-3 text-ink-500">
            Fundu Store brings together premium picks, transparent grading, exclusive offers, and AI-assisted verification notes in one clean buying experience.
          </p>
        </div>
      </section>

      <section className="mt-10 grid gap-5 md:grid-cols-3">
        {[
          { icon: ShieldCheck, title: 'Verified inventory', desc: 'Every listing is framed around trust, condition notes, and warranty clarity.' },
          { icon: Zap, title: 'Exclusive offers', desc: 'Time-bound deals, festive pricing, and visible coupon support across categories.' },
          { icon: CheckCircle2, title: 'Confidence-first buying', desc: 'Simple comparison points for storage, condition, and what comes in the box.' },
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

      <section className="surface-panel mt-10 p-8">
        <h2 className="font-display text-2xl font-extrabold text-ink-900">Best used with lookup-first shopping</h2>
        <p className="mt-3 max-w-2xl text-sm text-ink-600">
          Start from brand, then model, then storage. It is the quickest way to narrow down what matches your budget and avoid generic browsing fatigue.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/buy" className="btn-primary">Browse Best Deals</Link>
          <Link to="/articles" className="btn-outline">Read Buying Guides</Link>
        </div>
      </section>
    </div>
  );
}
