import { Building2, Handshake, Store, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PartnerProgram() {
  return (
    <div className="container-page py-12">
      <section className="rounded-[32px] border border-ink-200 bg-gradient-to-br from-brand-50 via-ink-100 to-accent-50 p-8 md:p-12">
        <p className="text-sm font-bold uppercase tracking-[0.28em] text-brand-700">Business With Us</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-extrabold text-ink-900">Partner with Fundu for sourcing, repairs, and retail collaboration</h1>
        <p className="mt-3 max-w-2xl text-ink-600">
          Fundu works with local businesses, resellers, repair shops, and offline stores that want trusted phone inventory, repair coordination, or branded partnership opportunities.
        </p>
      </section>

      <section className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          { icon: Store, title: 'Retail partners', desc: 'Curated inventory support for stores that want cleaner refurbished supply.' },
          { icon: Building2, title: 'Corporate sourcing', desc: 'Bulk device procurement and exchange planning for businesses.' },
          { icon: Handshake, title: 'Brand collaborations', desc: 'Campaigns, activations, and trust-led co-branded experiences.' },
          { icon: Truck, title: 'Operations support', desc: 'Pickup, inspection, and delivery coordination built for local scale.' },
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
        <h2 className="font-display text-2xl font-extrabold text-ink-900">What to include in your inquiry</h2>
        <p className="mt-3 text-sm text-ink-600">Tell us your business type, expected monthly volume, city coverage, and whether you need buying, selling, repair, or store partnership support.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/contact" className="btn-primary">Send Partnership Inquiry</Link>
          <Link to="/store" className="btn-outline">View Exclusive Store</Link>
        </div>
      </section>
    </div>
  );
}
