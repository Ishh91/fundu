import {
  BadgeIndianRupee,
  Zap,
  Truck,
  ShieldCheck,
  Lock,
  Award,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { LUCKNOW_LOCALITIES } from '../Navbar';

const WHY_CHOOSE_PILLARS = [
  {
    icon: BadgeIndianRupee,
    title: 'Maximum Value Guaranteed',
    desc: 'Our real-time dynamic pricing algorithm guarantees the highest resale value for your used smartphone.',
    color: 'bg-emerald-100 text-emerald-700',
  },
  {
    icon: Zap,
    title: 'Instant Spot UPI / Cash',
    desc: 'Money transferred directly to your bank account or paid in cash on the spot before pickup is completed.',
    color: 'bg-amber-100 text-amber-700',
  },
  {
    icon: Truck,
    title: 'Free Lucknow Doorstep Pickup',
    desc: 'Zero hidden charges, zero travel hassle. Our executive comes to your home or workplace anywhere in Lucknow.',
    color: 'bg-teal-100 text-teal-700',
  },
  {
    icon: ShieldCheck,
    title: '32-Point Certified Testing',
    desc: 'Every phone bought or sold goes through intense multi-point hardware, display, camera and battery audits.',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    icon: Award,
    title: '6 to 12 Months Warranty',
    desc: 'Complete warranty on refurbished smartphones and doorstep repair services with free pickup assistance.',
    color: 'bg-purple-100 text-purple-700',
  },
  {
    icon: Lock,
    title: '100% Data Safe & Wipe',
    desc: 'Your personal data is completely erased using certified multi-pass wipe protocols for 100% privacy protection.',
    color: 'bg-rose-100 text-rose-700',
  },
];

export default function WhyChooseFundu() {
  return (
    <section className="container-page py-8">
      <div className="rounded-3xl border border-white/80 bg-white/85 p-6 sm:p-8 md:p-10 shadow-[0_16px_40px_rgba(0,0,0,0.04)] backdrop-blur-xl">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="rounded-full bg-[#6A859F]/15 border border-[#6A859F]/30 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#344257]">
            The Fundu Advantage
          </span>
          <h2 className="mt-3 font-display text-2xl sm:text-3xl font-extrabold text-[#344257]">
            Why Lucknow Trusts Fundu Over Local Shops
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#47576E]">
            Fair pricing, zero negotiation stress, transparent doorstep service, and certified guarantees.
          </p>
        </div>

        {/* 6 Grid Cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {WHY_CHOOSE_PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="group rounded-2xl border border-gray-200 bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[#6A859F] hover:shadow-md"
              >
                <div className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-r from-[#344257] to-[#5D6A82] text-white shadow-xs`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-extrabold text-[#344257] group-hover:text-[#6A859F] transition">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#8A9AAF]">{pillar.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Lucknow Localities Coverage Box */}
        <div className="mt-8 rounded-2xl border border-[#C0C8D8]/60 bg-[#F7F7FA] p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C0C8D8]/40 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-r from-[#344257] to-[#5D6A82] text-white shadow-xs">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-[#344257]">
                  Doorstep Mobile Service Coverage in Lucknow
                </h4>
                <p className="text-xs text-[#8A9AAF]">
                  Free pickup & 30-min doorstep repair available in these areas today
                </p>
              </div>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#344257] border border-[#C0C8D8] self-start sm:self-auto shadow-xs">
              ✓ All Pin Codes Active
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {LUCKNOW_LOCALITIES.map((loc) => (
              <span
                key={loc}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white hover:border-[#6A859F] hover:text-[#344257] border border-[#C0C8D8]/70 px-3 py-1.5 text-xs font-bold text-[#47576E] transition cursor-default shadow-xs"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-[#6A859F]" />
                {loc}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
