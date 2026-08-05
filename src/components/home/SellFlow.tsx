import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

const sellSteps = [
  {
    title: 'Choose your device',
    description: 'Brand, model, and storage select karo so resale estimate exact journey se start ho.',
  },
  {
    title: 'See instant value',
    description: 'Condition aur accessories ke basis par immediate pricing direction mil jaati hai.',
  },
  {
    title: 'Schedule pickup',
    description: 'Doorstep pickup slot choose karo and smooth inspection flow continue karo.',
  },
  {
    title: 'Receive payment',
    description: 'Final check ke baad payout jaldi process hoti hai so user trust build hota hai.',
  },
];

export default function SellFlow() {
  return (
    <section id="sell-flow" className="container-page py-12">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[28px] bg-[#0f1d20] p-8 text-white shadow-soft md:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-emerald-200">How it works</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold">Sell your phone in 4 easy steps</h2>
          <p className="mt-3 text-sm leading-7 text-white/75">
            Same clean frontend energy ka real benefit tab milta hai jab user journey bhi straightforward ho. Isliye sell flow ko homepage par clearly visible rakha gaya hai.
          </p>

          <div className="mt-8 space-y-4">
            {[
              'Exact device selection',
              'Immediate resale direction',
              'Doorstep pickup scheduling',
              'Fast payout expectation',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl bg-white/5 px-4 py-4 text-sm text-white/90">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/sell" className="btn rounded-full bg-white px-5 py-3 text-ink-900 hover:bg-emerald-50">
              Check Sell Value
            </Link>
            <Link to="/repair" className="btn rounded-full border border-white/20 bg-white/10 px-5 py-3 text-white hover:bg-white/15">
              Book Repair
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {sellSteps.map((step, index) => (
            <div key={step.title} className="rounded-[24px] border border-[#dce5e8] bg-white p-6 shadow-soft">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-sm font-extrabold text-brand-700">
                0{index + 1}
              </span>
              <h3 className="mt-4 text-xl font-bold text-ink-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-7 text-ink-500">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
