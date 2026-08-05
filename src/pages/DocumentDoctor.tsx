import { FileCheck2, MessageSquareText, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DocumentDoctor() {
  return (
    <div className="container-page py-12">
      <section className="surface-panel p-8 md:p-12">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            <Sparkles className="h-3.5 w-3.5" /> Free consultation
          </div>
          <h1 className="mt-4 font-display text-4xl font-extrabold">Document Doctor</h1>
          <p className="mt-3 max-w-2xl text-ink-500">
            Need help understanding device paperwork, ownership proof, warranty slips, or purchase records? Fundu Document Doctor gives you a quick human-first consultation before you move ahead.
          </p>
        </div>
      </section>

      <section className="mt-10 grid gap-5 md:grid-cols-3">
        {[
          { icon: FileCheck2, title: 'Document review', desc: 'Get help checking invoices, ID match, and resale paperwork before pickup or purchase.' },
          { icon: ShieldCheck, title: 'Trust support', desc: 'Reduce confusion around ownership proof, warranty claims, and purchase safety.' },
          { icon: MessageSquareText, title: 'Quick call-back', desc: 'Use the contact flow to request a free consultation from the Fundu team.' },
        ].map((item) => (
          <div key={item.title} className="card p-6">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
              <item.icon className="h-6 w-6" />
            </div>
            <h2 className="mt-4 font-display text-xl font-bold text-ink-900">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">{item.desc}</p>
          </div>
        ))}
      </section>

      <section className="mt-10 card p-8">
        <h2 className="font-display text-2xl font-extrabold text-ink-900">How to request help</h2>
        <ol className="mt-4 space-y-3 text-sm text-ink-600">
          <li>1. Open the contact page and select your issue type.</li>
          <li>2. Share the document or describe the confusion.</li>
          <li>3. Our team helps you understand the next best step before sell, buy, or repair.</li>
        </ol>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/contact" className="btn-primary">Talk to Fundu</Link>
          <a href="tel:+919876543210" className="btn-outline">Call CUG Number</a>
        </div>
      </section>
    </div>
  );
}
