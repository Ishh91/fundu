import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Smartphone,
  BadgeIndianRupee,
  Truck,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ArrowRight,
  Wrench,
  Store,
} from 'lucide-react';

const FLOW_DATA = {
  sell: {
    title: 'How to Sell Your Phone on Fundu',
    desc: 'Get the highest resale value for your old smartphone in 4 easy steps without stepping out of your home in Lucknow.',
    ctaText: 'Sell Phone Now',
    ctaHref: '/sell',
    steps: [
      {
        step: '01',
        title: 'Select Device & Variant',
        desc: 'Choose your phone brand, model, and storage from our 200+ device catalog.',
        icon: Smartphone,
      },
      {
        step: '02',
        title: 'Get Instant Best Quote',
        desc: 'Answer a few quick questions about screen and functional health to see guaranteed value.',
        icon: BadgeIndianRupee,
      },
      {
        step: '03',
        title: 'Free Lucknow Doorstep Pickup',
        desc: 'Choose your convenient date and time slot for doorstep inspection in Lucknow.',
        icon: Truck,
      },
      {
        step: '04',
        title: 'Instant Spot Cash / UPI Payment',
        desc: 'Our pickup executive verifies device and transfers instant payment directly to you on the spot.',
        icon: Zap,
      },
    ],
  },
  buy: {
    title: 'How to Buy Refurbished Mobiles on Fundu',
    desc: 'Own top flagship smartphones at up to 70% off retail prices with complete peace of mind and warranty in Lucknow.',
    ctaText: 'Explore Refurbished Store',
    ctaHref: '/buy',
    steps: [
      {
        step: '01',
        title: 'Browse Verified Inventory',
        desc: 'Choose iPhones, Samsung Galaxy, or OnePlus graded Superb, Good, or Fair with full transparency.',
        icon: Smartphone,
      },
      {
        step: '02',
        title: '32-Point Quality Inspection',
        desc: 'Every phone passes rigorous hardware, battery, display, and biometric testing.',
        icon: ShieldCheck,
      },
      {
        step: '03',
        title: '6 to 12 Months Warranty',
        desc: 'Enjoy hassle-free replacement warranty and Lucknow doorstep customer support.',
        icon: ShieldCheck,
      },
      {
        step: '04',
        title: 'Free Same-Day Lucknow Delivery',
        desc: 'Safe, sealed package delivered directly to your doorstep in Lucknow.',
        icon: Truck,
      },
    ],
  },
  repair: {
    title: 'How Doorstep Phone Repair Works',
    desc: 'Broken screen or dead battery? Our certified technician repairs your phone at your home/office in Lucknow in 30 minutes.',
    ctaText: 'Book Doorstep Repair',
    ctaHref: '/repair',
    steps: [
      {
        step: '01',
        title: 'Select Model & Issue',
        desc: 'Pick your phone and problem (screen, battery, camera, mic, charging port).',
        icon: Smartphone,
      },
      {
        step: '02',
        title: 'See Fixed Transparent Pricing',
        desc: 'Get upfront pricing with zero hidden charges and free doorstep visit.',
        icon: BadgeIndianRupee,
      },
      {
        step: '03',
        title: 'Technician Visits Your Doorstep',
        desc: 'Certified repair engineer visits your Lucknow address at your selected time.',
        icon: Wrench,
      },
      {
        step: '04',
        title: '30-Min Repair + 6M Warranty',
        desc: 'Watch your phone get repaired in front of you. Test everything before paying.',
        icon: ShieldCheck,
      },
    ],
  },
};

export default function SellFlow() {
  const [activeTab, setActiveTab] = useState<'sell' | 'buy' | 'repair'>('sell');

  const currentFlow = FLOW_DATA[activeTab];

  return (
    <section id="sell-flow" className="container-page py-8">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 md:p-10 shadow-sm">
        {/* Top Header & Tab Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-gray-100 pb-6">
          <div>
            <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-teal-700">
              Simple & Transparent
            </span>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-gray-900">
              {currentFlow.title}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 max-w-xl">
              {currentFlow.desc}
            </p>
          </div>

          <div className="flex items-center gap-1.5 rounded-2xl bg-gray-100 p-1.5 self-start lg:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('sell')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === 'sell'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BadgeIndianRupee className="h-4 w-4 text-emerald-600" />
              Selling Flow
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('buy')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === 'buy'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Store className="h-4 w-4 text-teal-600" />
              Buying Flow
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('repair')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === 'repair'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Wrench className="h-4 w-4 text-amber-600" />
              Repair Flow
            </button>
          </div>
        </div>

        {/* 4 Step Cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {currentFlow.steps.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.step}
                className="group relative rounded-2xl border border-gray-200 bg-[#f8fafc] p-5 transition-all duration-200 hover:-translate-y-1 hover:border-teal-400 hover:bg-white hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-display text-2xl font-black text-teal-600/30 group-hover:text-teal-600 transition">
                      {st.step}
                    </span>
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-teal-100 text-teal-700">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <h3 className="mt-4 text-base font-extrabold text-gray-900 group-hover:text-teal-700 transition">
                    {st.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-gray-500">{st.desc}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-[11px] font-bold text-teal-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Guaranteed in Lucknow</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Bottom Banner */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-teal-500 p-5 text-white shadow-md">
          <div className="flex items-center gap-3">
            <Zap className="h-6 w-6 text-amber-300 shrink-0" />
            <div>
              <p className="text-sm font-black">Ready to get started in Lucknow?</p>
              <p className="text-xs text-teal-100">
                Over 25,000+ happy customers across Gomti Nagar, Hazratganj, Indira Nagar & more.
              </p>
            </div>
          </div>
          <Link
            to={currentFlow.ctaHref}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-extrabold text-teal-900 shadow-sm hover:bg-teal-50 transition"
          >
            <span>{currentFlow.ctaText}</span>
            <ArrowRight className="h-3.5 w-3.5 text-teal-700" />
          </Link>
        </div>
      </div>
    </section>
  );
}
