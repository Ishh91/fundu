import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LOOKUP_BRANDS } from '../../data/phoneLookup';
import { getCleanBrandLogo } from '../../lib/phoneImages';

const BRAND_DATA: Record<
  string,
  { image: string; tag: string; popularModel: string }
> = {
  Apple: {
    image: getCleanBrandLogo('Apple'),
    tag: 'Top Value',
    popularModel: 'iPhone 13 / 14 / 15',
  },
  Samsung: {
    image: getCleanBrandLogo('Samsung'),
    tag: 'Galaxy Series',
    popularModel: 'S23 / S22 / M Series',
  },
  OnePlus: {
    image: getCleanBrandLogo('OnePlus'),
    tag: 'Fast Charging',
    popularModel: 'Nord / 11 / 10R',
  },
  Xiaomi: {
    image: getCleanBrandLogo('Xiaomi'),
    tag: 'Best Budget',
    popularModel: 'Redmi Note 13 / 12',
  },
  Realme: {
    image: getCleanBrandLogo('Realme'),
    tag: 'Popular',
    popularModel: 'Narzo / 12 Pro',
  },
  Vivo: {
    image: getCleanBrandLogo('Vivo'),
    tag: 'Camera Expert',
    popularModel: 'V29 / T2x 5G',
  },
  Oppo: {
    image: getCleanBrandLogo('Oppo'),
    tag: 'Portrait Pro',
    popularModel: 'Reno 11 / F25',
  },
  Google: {
    image: getCleanBrandLogo('Google'),
    tag: 'Clean Android',
    popularModel: 'Pixel 7 / 7a / 8',
  },
  Nothing: {
    image: getCleanBrandLogo('Nothing'),
    tag: 'Glyph Design',
    popularModel: 'Phone (1) / (2)',
  },
  Motorola: {
    image: getCleanBrandLogo('Motorola'),
    tag: 'Moto 5G',
    popularModel: 'Edge 40 / G84',
  },
};

export default function PopularBrands() {
  const [activeTab, setActiveTab] = useState<'sell' | 'buy'>('sell');

  const topBrands = LOOKUP_BRANDS.slice(0, 10);

  return (
    <section className="container-page py-8">
      <div className="rounded-3xl border border-white/80 bg-white/85 p-6 sm:p-8 md:p-10 shadow-[0_16px_40px_rgba(0,0,0,0.04)] backdrop-blur-xl">
        {/* Header & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-teal-700">
                Brand Directory
              </span>
              <span className="text-xs font-semibold text-gray-500">Lucknow Doorstep Service</span>
            </div>
            <h2 className="mt-2 text-2xl font-black text-gray-900 sm:text-3xl">
              Select Your Mobile Brand
            </h2>
          </div>

          <div className="flex rounded-2xl bg-gray-100 p-1 border border-gray-200/60 shrink-0">
            <button
              onClick={() => setActiveTab('sell')}
              className={`rounded-xl px-5 py-2 text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'sell'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sell Phone (Cash)
            </button>
            <button
              onClick={() => setActiveTab('buy')}
              className={`rounded-xl px-5 py-2 text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'buy'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Buy Refurbished
            </button>
          </div>
        </div>

        {/* Brands Grid Cards */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {topBrands.map((brand) => {
            const data = BRAND_DATA[brand] || {
              image: getCleanBrandLogo(brand),
              tag: 'Top Brand',
              popularModel: `${brand} Models`,
            };

            const targetHref =
              activeTab === 'sell'
                ? `/sell?brand=${encodeURIComponent(brand)}`
                : `/buy?brand=${encodeURIComponent(brand)}`;

            return (
              <Link
                key={brand}
                to={targetHref}
                className="group relative flex flex-col items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 text-center transition-all duration-200 hover:-translate-y-1 hover:border-teal-400 hover:shadow-lg"
              >
                <span className="absolute left-2.5 top-2.5 z-10 pointer-events-none rounded-md bg-teal-50 border border-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                  {data.tag}
                </span>

                <div className="mt-4 h-20 w-20 overflow-hidden rounded-2xl bg-white p-1 flex items-center justify-center border border-gray-100 transition group-hover:scale-105 group-hover:border-teal-300">
                  <img
                    src={getCleanBrandLogo(brand)}
                    alt={`${brand} phone`}
                    className="h-full w-full object-contain"
                  />
                </div>

                <div className="mt-3">
                  <h3 className="text-sm font-extrabold text-gray-900 group-hover:text-teal-600 transition">
                    {brand}
                  </h3>
                  <p className="text-[11px] font-medium text-gray-500 truncate max-w-[120px] mt-0.5">
                    {data.popularModel}
                  </p>
                </div>

                <div className="mt-3 w-full rounded-lg bg-teal-50 group-hover:bg-teal-600 py-1.5 text-[11px] font-bold text-teal-800 group-hover:text-white border border-teal-200 transition">
                  {activeTab === 'sell' ? 'Get Quote' : 'View Deals'}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
