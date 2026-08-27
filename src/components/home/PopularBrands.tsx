import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeIndianRupee, Store, Sparkles } from 'lucide-react';
import { LOOKUP_BRANDS } from '../../data/phoneLookup';

const BRAND_DATA: Record<
  string,
  { image: string; tag: string; popularModel: string }
> = {
  Apple: {
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&auto=format&fit=crop&q=80',
    tag: 'Top Value',
    popularModel: 'iPhone 13 / 14 / 15',
  },
  Samsung: {
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300&auto=format&fit=crop&q=80',
    tag: 'Galaxy Series',
    popularModel: 'S23 / S22 / M Series',
  },
  OnePlus: {
    image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=300&auto=format&fit=crop&q=80',
    tag: 'Fast Charging',
    popularModel: 'Nord / 11 / 10R',
  },
  Xiaomi: {
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300&auto=format&fit=crop&q=80',
    tag: 'Best Budget',
    popularModel: 'Redmi Note 13 / 12',
  },
  Realme: {
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format&fit=crop&q=80',
    tag: 'Popular',
    popularModel: 'Narzo / 12 Pro',
  },
  Vivo: {
    image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80',
    tag: 'Camera Expert',
    popularModel: 'V29 / T2x 5G',
  },
  Oppo: {
    image: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=300&auto=format&fit=crop&q=80',
    tag: 'Portrait Pro',
    popularModel: 'Reno 11 / F25',
  },
  Google: {
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300&auto=format&fit=crop&q=80',
    tag: 'Clean Android',
    popularModel: 'Pixel 7 / 7a / 8',
  },
  Nothing: {
    image: 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=300&auto=format&fit=crop&q=80',
    tag: 'Glyph Design',
    popularModel: 'Phone (1) / (2)',
  },
  Motorola: {
    image: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=300&auto=format&fit=crop&q=80',
    tag: 'Moto 5G',
    popularModel: 'Edge 40 / G84',
  },
};

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format&fit=crop&q=80';

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
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-gray-900">
              {activeTab === 'sell' ? 'Select Brand to Sell Phone' : 'Select Brand to Buy Refurbished'}
            </h2>
          </div>

          {/* Toggle Tab */}
          <div className="flex items-center rounded-2xl bg-gray-100 p-1">
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
              Sell Old Phone
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
              Buy Refurbished
            </button>
          </div>
        </div>

        {/* Brands Grid */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          {topBrands.map((brand) => {
            const data = BRAND_DATA[brand] || {
              image: DEFAULT_IMAGE,
              tag: 'Mobile',
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
                className="group relative flex flex-col items-center justify-between rounded-2xl border border-gray-100 bg-[#f8fafc] p-4 text-center transition-all duration-200 hover:-translate-y-1 hover:border-teal-400 hover:bg-white hover:shadow-md"
              >
                <span className="absolute left-2.5 top-2.5 z-10 pointer-events-none rounded-md bg-white border border-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500 group-hover:text-teal-600 group-hover:border-teal-200">
                  {data.tag}
                </span>

                <div className="mt-4 h-16 w-16 overflow-hidden rounded-2xl bg-white p-1.5 shadow-sm border border-gray-100 transition group-hover:scale-105 group-hover:border-teal-300">
                  <img
                    src={data.image}
                    alt={`${brand} phone`}
                    className="h-full w-full object-cover rounded-xl"
                  />
                </div>

                <div className="mt-3">
                  <h3 className="text-sm font-extrabold text-gray-800 group-hover:text-teal-600 transition">
                    {brand}
                  </h3>
                  <p className="text-[11px] font-medium text-gray-400 truncate max-w-[120px] mt-0.5">
                    {data.popularModel}
                  </p>
                </div>

                <div className="mt-3 w-full rounded-lg bg-white group-hover:bg-teal-50 py-1.5 text-[11px] font-bold text-gray-600 group-hover:text-teal-700 border border-gray-100 group-hover:border-teal-200 transition">
                  {activeTab === 'sell' ? 'Get Quote' : 'View Deals'}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 p-4 border border-teal-100">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal-500 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-teal-800">
                Can't find your brand or model?
              </p>
              <p className="text-xs text-gray-600">
                Fundu supports 200+ phone models across all Lucknow pin codes.
              </p>
            </div>
          </div>
          <Link
            to="/sell"
            className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-extrabold text-teal-800 shadow-sm border border-teal-200 hover:bg-teal-600 hover:text-white transition"
          >
            <span>Search Full Catalog</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
