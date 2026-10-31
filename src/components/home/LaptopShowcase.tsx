import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Laptop,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  Cpu,
  Layers,
  Battery,
  ShoppingCart,
  Check,
} from 'lucide-react';
import { formatINR } from '../../lib/db';
import { useCart } from '../../context/CartContext';
import { SAMPLE_LAPTOPS } from '../../data/sampleLaptops';
import { deduplicateProductsByModel } from '../../lib/modelVariants';
import type { Product } from '../../types';

interface LaptopShowcaseProps {
  customLaptops?: Product[];
}

export default function LaptopShowcase({ customLaptops }: LaptopShowcaseProps) {
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState<'all' | 'macbook' | 'business' | 'gaming'>('all');
  const [addedId, setAddedId] = useState<string | null>(null);

  const allLaptops = useMemo(() => {
    let list = SAMPLE_LAPTOPS;
    if (customLaptops && customLaptops.length > 0) {
      list = [...customLaptops, ...SAMPLE_LAPTOPS.filter(s => !customLaptops.some(c => c.id === s.id))];
    }
    return deduplicateProductsByModel(list);
  }, [customLaptops]);

  const filteredLaptops = useMemo(() => {
    if (activeTab === 'all') return allLaptops.slice(0, 8);
    if (activeTab === 'macbook') {
      return allLaptops.filter((l) => l.brand.toLowerCase() === 'apple').slice(0, 8);
    }
    if (activeTab === 'business') {
      return allLaptops.filter((l) => ['dell', 'hp'].includes(l.brand.toLowerCase())).slice(0, 8);
    }
    if (activeTab === 'gaming') {
      return allLaptops.filter((l) => ['acer'].includes(l.brand.toLowerCase()) || /rtx|gtx|ryzen 9/i.test(`${l.title} ${l.processor} ${l.graphics}`)).slice(0, 8);
    }
    return allLaptops.slice(0, 8);
  }, [allLaptops, activeTab]);

  const handleQuickAdd = (e: React.MouseEvent, laptop: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(laptop, 1);
    setAddedId(laptop.id);
    setTimeout(() => setAddedId(null), 2000);
  };

  return (
    <section className="py-12 bg-gradient-to-b from-white via-[#f7f9fa] to-white border-y border-[#e5ecef]">
      <div className="container-page space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              <Laptop className="h-3.5 w-3.5 text-blue-600" /> Certified Refurbished Laptops
            </div>
            <h2 className="text-2xl md:text-3xl font-black font-display text-ink-900 tracking-tight">
              Flagship Laptops. Unbeatable Prices.
            </h2>
            <p className="text-sm font-semibold text-ink-500 max-w-2xl">
              Save up to 60% on verified MacBooks, Dell Latitudes & Ultrabooks. 32-point inspected, 6-month doorstep warranty & genuine chargers included.
            </p>
          </div>

          <Link
            to="/buy-laptops"
            className="inline-flex items-center gap-2 text-sm font-black text-brand-600 hover:text-brand-700 transition group self-start md:self-auto shrink-0"
          >
            <span>Explore All Laptops ({allLaptops.length}+)</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {[
            { id: 'all', label: 'All Top Models' },
            { id: 'macbook', label: '🍎 Apple MacBooks' },
            { id: 'business', label: '💼 Work & Business (Dell / HP)' },
            { id: 'gaming', label: '⚡ Performance & Gaming (Acer)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#344257] text-white shadow-sm'
                  : 'bg-white text-ink-600 border border-ink-200 hover:bg-ink-50 hover:text-ink-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Laptops Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredLaptops.map((laptop) => {
            const savings = (laptop.original_price || 0) > laptop.price ? (laptop.original_price || 0) - laptop.price : 0;
            const discountPct = laptop.discount_percent || Math.round((savings / (laptop.original_price || laptop.price)) * 100);

            return (
              <div
                key={laptop.id}
                className="card group flex flex-col justify-between overflow-hidden rounded-[26px] bg-white border border-ink-100 p-4 transition-all duration-300 hover:border-[#6A859F] hover:shadow-xl hover:-translate-y-1 relative"
              >
                {/* Top Badges */}
                <div className="flex items-center justify-between gap-1 w-full mb-2">
                  <div className="flex items-center gap-1">
                    <span className="badge bg-[#344257] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full">
                      {laptop.condition || 'Superb'} Grade
                    </span>
                    {laptop.is_featured && (
                      <span className="badge bg-amber-400 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs flex items-center gap-0.5">
                        ⭐ Featured
                      </span>
                    )}
                  </div>
                  {discountPct > 0 && (
                    <span className="badge bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                      {discountPct}% OFF
                    </span>
                  )}
                </div>

                {/* Laptop Image */}
                <Link
                  to={`/product/${laptop.id}`}
                  className="h-44 w-full flex items-center justify-center p-2 relative overflow-hidden my-2 group-hover:scale-105 transition-transform duration-300"
                >
                  <img
                    src={laptop.images[0]}
                    alt={laptop.title}
                    className="max-h-full max-w-full object-contain drop-shadow-md"
                    loading="lazy"
                  />
                </Link>

                {/* Laptop Details */}
                <div className="space-y-2 mt-2">
                  <div className="text-[11px] font-black text-brand-600 uppercase tracking-wider">
                    {laptop.brand}
                  </div>

                  <Link to={`/product/${laptop.id}`}>
                    <h3 className="font-bold text-sm text-ink-900 group-hover:text-brand-600 transition line-clamp-1">
                      {laptop.title}
                    </h3>
                  </Link>

                  {/* Hardware Spec Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {laptop.processor && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-ink-600 bg-ink-50 px-2 py-0.5 rounded-md border border-ink-100">
                        <Cpu className="h-2.5 w-2.5 text-[#47576E]" /> {laptop.processor.split('(')[0].trim()}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-ink-600 bg-ink-50 px-2 py-0.5 rounded-md border border-ink-100">
                      <Layers className="h-2.5 w-2.5 text-[#47576E]" /> {laptop.ram} • {laptop.storage}
                    </span>
                    {laptop.battery_health && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                        <Battery className="h-2.5 w-2.5 text-emerald-600" /> {laptop.battery_health.split('(')[0].trim()}
                      </span>
                    )}
                  </div>

                  {/* Price & Savings */}
                  <div className="pt-2 border-t border-ink-100">
                    <div className="flex items-baseline gap-2">
                      <span className="font-display font-black text-lg text-ink-900">
                        {formatINR(laptop.price)}
                      </span>
                      {laptop.original_price && laptop.original_price > laptop.price && (
                        <span className="text-xs text-ink-400 line-through font-semibold">
                          {formatINR(laptop.original_price)}
                        </span>
                      )}
                    </div>
                    {savings > 0 && (
                      <span className="text-[11px] font-bold text-emerald-600 block">
                        Save {formatINR(savings)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-2">
                  <Link
                    to={`/product/${laptop.id}`}
                    className="btn-outline text-xs py-2 px-2 text-center rounded-xl font-bold flex items-center justify-center gap-1 hover:border-brand-600 hover:text-brand-600 transition"
                  >
                    View Specs
                  </Link>

                  <button
                    onClick={(e) => handleQuickAdd(e, laptop)}
                    className={`btn text-xs py-2 px-2 rounded-xl font-bold flex items-center justify-center gap-1 transition ${
                      addedId === laptop.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-brand-600 text-white hover:bg-brand-700 shadow-xs'
                    }`}
                  >
                    {addedId === laptop.id ? (
                      <>
                        <Check className="h-3 w-3" /> Added
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-3 w-3" /> Add to Cart
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Refurbished Assurance Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-[#344257] via-[#47576E] to-[#5D6A82] text-white p-5 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 grid place-items-center shrink-0">
                <ShieldCheck className="h-5 w-5 text-emerald-300" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-white">6-Month Warranty</h4>
                <p className="text-[11px] text-white/80 font-medium">Free repairs & replacement</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 grid place-items-center shrink-0">
                <CheckCircle2 className="h-5 w-5 text-amber-300" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-white">32-Point Quality Check</h4>
                <p className="text-[11px] text-white/80 font-medium">Screen, battery & keyboard certified</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 grid place-items-center shrink-0">
                <Zap className="h-5 w-5 text-blue-300" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-white">Genuine Power Brick</h4>
                <p className="text-[11px] text-white/80 font-medium">Includes original OEM charger</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 grid place-items-center shrink-0">
                <Sparkles className="h-5 w-5 text-purple-300" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-white">Free Doorstep Delivery</h4>
                <p className="text-[11px] text-white/80 font-medium">Safe tamper-proof packaging</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

