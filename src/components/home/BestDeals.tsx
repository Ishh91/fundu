import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, CheckCircle2, ShoppingCart, Sparkles, Star } from 'lucide-react';
import { formatINR } from '../../lib/db';
import type { Product } from '../../types';
import { useCart } from '../../context/CartContext';

interface BestDealsProps {
  products: Product[];
  loading: boolean;
}

const FALLBACK_REFURBISHED_PHONES: Product[] = [
  {
    id: 'sample-1',
    title: 'Apple iPhone 13 (128 GB) - Starlight',
    brand: 'Apple',
    model: 'iPhone 13',
    ram: '4 GB',
    storage: '128 GB',
    color: 'Starlight',
    condition: 'Excellent',
    price: 38999,
    original_price: 59900,
    discount_percent: 35,
    warranty_months: 6,
    description: 'Refurbished Superb condition. 32-Point inspection passed. Battery health above 88%. Free doorstep delivery in Lucknow.',
    images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80'],
    is_approved: true,
    is_featured: true,
    stock: 5,
    sold_count: 42,
    seller_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-2',
    title: 'Apple iPhone 14 (128 GB) - Midnight',
    brand: 'Apple',
    model: 'iPhone 14',
    ram: '6 GB',
    storage: '128 GB',
    color: 'Midnight',
    condition: 'Excellent',
    price: 47499,
    original_price: 69900,
    discount_percent: 32,
    warranty_months: 6,
    description: 'Flawless condition, verified screen & camera. Includes charging cable and Fundu 6-month warranty card.',
    images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80'],
    is_approved: true,
    is_featured: true,
    stock: 4,
    sold_count: 29,
    seller_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-3',
    title: 'Samsung Galaxy S23 5G (256 GB) - Phantom Black',
    brand: 'Samsung',
    model: 'Galaxy S23',
    ram: '8 GB',
    storage: '256 GB',
    color: 'Phantom Black',
    condition: 'Good',
    price: 42999,
    original_price: 74999,
    discount_percent: 42,
    warranty_months: 6,
    description: 'Snapdragon 8 Gen 2, Super AMOLED display, pristine condition with 6-month warranty.',
    images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80'],
    is_approved: true,
    is_featured: true,
    stock: 3,
    sold_count: 19,
    seller_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-4',
    title: 'OnePlus 11 5G (256 GB) - Titan Black',
    brand: 'OnePlus',
    model: 'OnePlus 11',
    ram: '16 GB',
    storage: '256 GB',
    color: 'Titan Black',
    condition: 'Excellent',
    price: 34999,
    original_price: 61999,
    discount_percent: 43,
    warranty_months: 6,
    description: 'Hasselblad camera, 100W fast charging supported, battery health 92%.',
    images: ['https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80'],
    is_approved: true,
    is_featured: true,
    stock: 6,
    sold_count: 31,
    seller_id: null,
    created_at: new Date().toISOString(),
  },
];

export default function BestDeals({ products, loading }: BestDealsProps) {
  const { addToCart } = useCart();
  const displayProducts = products && products.length > 0 ? products : FALLBACK_REFURBISHED_PHONES;

  return (
    <section className="container-page py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-teal-700">
              Refurbished Store
            </span>
            <span className="text-xs font-semibold text-gray-500">📍 Lucknow Stock Ready</span>
          </div>
          <h2 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-gray-900">
            Top Deals on Certified Refurbished Phones
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            32-Point Inspected • 6-12 Months Replacement Warranty • Free Doorstep Delivery
          </p>
        </div>
        <Link
          to="/buy"
          className="inline-flex items-center gap-2 text-sm font-bold text-teal-700 hover:text-teal-800 transition"
        >
          View All Refurbished Mobiles <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {loading ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-96 rounded-2xl border border-gray-200 bg-white shadow-sm animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {displayProducts.slice(0, 4).map((item) => {
            const gradeText =
              item.condition === 'Excellent'
                ? 'Superb'
                : item.condition === 'Good'
                  ? 'Good'
                  : 'Fair';
            const gradeColor =
              item.condition === 'Excellent'
                ? 'bg-emerald-500 text-white'
                : item.condition === 'Good'
                  ? 'bg-teal-600 text-white'
                  : 'bg-amber-500 text-white';

            const emiAmount = Math.round(item.price / 12);

            return (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-teal-400 hover:shadow-xl"
              >
                {/* Top Badges */}
                <div className="relative aspect-[4/3] bg-[#f8fafc] overflow-hidden p-4 flex items-center justify-center">
                  <span
                    className={`absolute left-3 top-3 z-10 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${gradeColor}`}
                  >
                    Grade: {gradeText}
                  </span>

                  {item.discount_percent > 0 && (
                    <span className="absolute right-3 top-3 z-10 rounded-full bg-orange-500 px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow-sm">
                      {item.discount_percent}% OFF
                    </span>
                  )}

                  <Link to={`/product/${item.id}`} className="h-full w-full flex items-center justify-center">
                    {item.images?.[0] ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="h-full w-auto object-contain transition group-hover:scale-105"
                      />
                    ) : (
                      <div className="text-xs text-gray-400">Refurbished Device</div>
                    )}
                  </Link>
                </div>

                {/* Body Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-400 font-semibold uppercase tracking-wider">
                      <span>{item.brand}</span>
                      <span className="flex items-center gap-1 text-emerald-600 font-bold">
                        <CheckCircle2 className="h-3 w-3" /> 32-Pt Check Passed
                      </span>
                    </div>

                    <Link to={`/product/${item.id}`}>
                      <h3 className="mt-1.5 text-sm font-bold text-gray-900 group-hover:text-teal-700 transition line-clamp-1">
                        {item.title}
                      </h3>
                    </Link>

                    {/* Specs Pills */}
                    <div className="mt-2.5 flex flex-wrap gap-1.5 text-[11px]">
                      {item.storage && (
                        <span className="rounded-md bg-gray-100 px-2 py-0.5 font-bold text-gray-700">
                          {item.storage}
                        </span>
                      )}
                      {item.ram && (
                        <span className="rounded-md bg-gray-100 px-2 py-0.5 font-bold text-gray-700">
                          {item.ram} RAM
                        </span>
                      )}
                      <span className="rounded-md bg-teal-50 px-2 py-0.5 font-bold text-teal-700 flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" /> {item.warranty_months || 6}M Warranty
                      </span>
                    </div>
                  </div>

                  {/* Pricing & CTA */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-black text-gray-900">
                        {formatINR(item.price)}
                      </span>
                      {item.original_price && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatINR(item.original_price)}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-semibold text-teal-700 mt-0.5">
                      Or EMI from {formatINR(emiAmount)}/month
                    </p>

                    <div className="mt-3 flex gap-2">
                      <Link
                        to={`/product/${item.id}`}
                        className="flex-1 rounded-xl bg-teal-500 py-2 text-center text-xs font-bold text-white hover:bg-teal-600 shadow-sm transition"
                      >
                        Buy Now
                      </Link>
                      <button
                        type="button"
                        onClick={() => addToCart(item, 1)}
                        className="grid h-8 w-8 place-items-center rounded-xl border border-gray-200 bg-white text-gray-700 hover:border-teal-400 hover:text-teal-700 transition shadow-sm"
                        title="Add to Cart"
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
