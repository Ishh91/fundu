import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Clock3, FileText, HelpCircle, Truck } from 'lucide-react';
import { HOME_FAQS } from '../../data/siteContent';

export default function FaqSection() {
  const [faqOpen, setFaqOpen] = useState(0);

  return (
    <section className="container-page py-12">
      <div className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
        <div className="rounded-[28px] border border-[#dce5e8] bg-white p-8 shadow-soft">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            <HelpCircle className="h-3.5 w-3.5" /> Help & FAQ
          </div>
          <h2 className="mt-4 font-display text-3xl font-extrabold text-ink-900">Questions users ask before they convert</h2>
          <p className="mt-3 text-sm leading-7 text-ink-600">
            Pricing, pickup, warranty, repair, aur account-related doubts ko homepage par hi visible rakhna trust build karta hai.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/sell" className="btn rounded-full bg-brand-500 px-5 py-3 text-white hover:bg-brand-600">
              Sell Your Phone
            </Link>
            <Link to="/contact" className="btn rounded-full border border-[#dce5e8] bg-white px-5 py-3 text-ink-900 hover:border-brand-300 hover:text-brand-700">
              Contact Support
            </Link>
          </div>

          <div className="mt-8 grid gap-3">
            {[
              { icon: Clock3, label: 'Quick response guidance' },
              { icon: Truck, label: 'Pickup and doorstep support' },
              { icon: FileText, label: 'Invoice and document help' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 rounded-2xl bg-[#f7fbfb] px-4 py-3 text-sm font-medium text-ink-700">
                <item.icon className="h-4 w-4 text-brand-600" />
                {item.label}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {HOME_FAQS.map((faq, index) => {
            const open = faqOpen === index;
            return (
              <div key={faq.question} className="rounded-[24px] border border-[#dce5e8] bg-white p-5 shadow-soft">
                <button
                  type="button"
                  onClick={() => setFaqOpen(open ? -1 : index)}
                  className="flex w-full items-start justify-between gap-4 text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                      <HelpCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-ink-900">{faq.question}</h3>
                      {open ? <p className="mt-2 text-sm leading-7 text-ink-500">{faq.answer}</p> : null}
                    </div>
                  </div>
                  <ChevronDown className={`h-5 w-5 shrink-0 text-ink-400 transition ${open ? 'rotate-180' : ''}`} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
