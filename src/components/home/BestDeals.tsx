import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, CheckCircle2, ShoppingCart, Sparkles } from 'lucide-react';
import { formatINR } from '../../lib/db';
import type { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { getCleanPhoneImage } from '../../lib/phoneImages';
import { cardStorages, showsRam } from '../../lib/cardSpecs';
import { hasStock } from '../../lib/variantAvailability';

interface BestDealsProps {
  products: Product[];
  loading: boolean;
}

export default function BestDeals({ products, loading }: BestDealsProps) {
  const { addToCart } = useCart();
  // Display products: prioritize featured, but always ensure top store phones show
  const displayProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    const buyable = products.filter((p) => p.is_approved !== false && hasStock(p));
    const featured = buyable.filter((p) => p.is_featured);
    if (featured.length > 0) return featured;
    // If no products are explicitly tagged is_featured, display the top approved products from store
    return buyable.slice(0, 8);
  }, [products]);

  return (
    <section className="container-page py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#F0F0F5] border border-[#C0C8D8] px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#344257]">
              Refurbished Store
            </span>
            <span className="text-xs font-semibold text-gray-500">📍 Stock Ready</span>
          </div>
          <h2 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-gray-900">
            Top Deals on Certified Refurbished Phones
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            42-Point Inspected • 6-12 Months Replacement Warranty • Free Doorstep Delivery
          </p>
        </div>
        <Link
          to="/buy"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#344257] hover:text-[#47576E] transition"
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
      ) : displayProducts.length === 0 ? (
        <div className="mt-6 p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <Sparkles className="h-6 w-6 text-amber-500 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-700">No featured phones currently highlighted.</p>
          <p className="text-xs text-gray-500 mt-1">Explore our full certified refurbished collection below.</p>
          <Link to="/buy" className="mt-3 inline-block bg-[#344257] hover:bg-[#2A374A] text-white font-bold text-xs px-4 py-2 rounded-xl transition">
            Browse All Phones
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {displayProducts.slice(0, 8).map((item) => {
            const gradeText =
              item.condition === 'Excellent'
                ? 'Superb'
                : item.condition === 'Good'
                  ? 'Good'
                  : 'Fair';
            const gradeColor =
              item.condition === 'Excellent'
                ? 'bg-[#344257] text-white'
                : item.condition === 'Good'
                  ? 'bg-[#47576E] text-white'
                  : 'bg-[#6A859F] text-white';

            const emiAmount = Math.round(item.price / 12);

            return (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-[#6A859F] hover:shadow-xl"
              >
                {/* Top Badges */}
                <div className="relative aspect-[4/3] bg-[#F7F7FA] overflow-hidden p-4 flex items-center justify-center">
                  <span
                    className={`absolute left-3 top-3 z-10 pointer-events-none rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${gradeColor}`}
                  >
                    Grade: {gradeText}
                  </span>

                  {item.is_featured && (
                    <span className="absolute left-3 bottom-3 z-10 pointer-events-none rounded-full bg-amber-400 text-amber-950 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide flex items-center gap-1 shadow-sm">
                      <Sparkles className="h-2.5 w-2.5" /> Featured
                    </span>
                  )}

                  {item.discount_percent > 0 && (
                    <span className="absolute right-3 top-3 z-10 pointer-events-none rounded-full bg-orange-500 px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow-sm">
                      {item.discount_percent}% OFF
                    </span>
                  )}

                  <Link to={`/product/${item.id}`} className="h-full w-full flex items-center justify-center">
                    <img
                      src={getCleanPhoneImage(item.brand, item.title || item.model, item.images?.[0])}
                      alt={item.title}
                      className="h-full w-auto object-contain transition group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getCleanPhoneImage(item.brand, item.title || item.model, '');
                      }}
                    />
                  </Link>
                </div>

                {/* Body Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-400 font-semibold uppercase tracking-wider">
                      <span>{item.brand}</span>
                      <span className="flex items-center gap-1 text-[#344257] font-bold">
                        <CheckCircle2 className="h-3 w-3 text-[#6A859F]" /> 42-Pt Check Passed
                      </span>
                    </div>

                    <Link to={`/product/${item.id}`}>
                      <h3 className="mt-1.5 text-sm font-bold text-[#344257] group-hover:text-[#6A859F] transition line-clamp-1">
                        {item.title}
                      </h3>
                    </Link>

                    {/* Specs Pills */}
                    <div className="mt-2.5 flex flex-wrap gap-1.5 text-[11px]">
                      {cardStorages(item).length > 0 && (
                        <span className="rounded-md bg-blue-50 border border-blue-200/60 px-2 py-0.5 font-bold text-blue-800">
                          {cardStorages(item).join(' • ')}
                        </span>
                      )}
                      {item.ram && showsRam(item) && (
                        <span className="rounded-md bg-gray-100 px-2 py-0.5 font-bold text-[#47576E]">
                          {item.ram} RAM
                        </span>
                      )}
                      <span className="rounded-md bg-[#6A859F]/15 px-2 py-0.5 font-bold text-[#344257] flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3 text-[#6A859F]" /> {item.warranty_months || 6}M Warranty
                      </span>
                    </div>
                  </div>

                  {/* Pricing & CTA */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-black text-[#344257]">
                        {cardStorages(item).length > 1 ? `From ${formatINR(item.price)}` : formatINR(item.price)}
                      </span>
                      {item.original_price && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatINR(item.original_price)}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-semibold text-[#6A859F] mt-0.5">
                      Or EMI from {formatINR(emiAmount)}/month
                    </p>

                    <div className="mt-3 flex gap-2">
                      <Link
                        to={`/product/${item.id}`}
                        className="flex-1 rounded-xl bg-gradient-to-r from-[#344257] to-[#5D6A82] py-2 text-center text-xs font-bold text-white hover:brightness-110 shadow-sm transition"
                      >
                        Buy Now
                      </Link>
                      <button
                        type="button"
                        onClick={() => addToCart(item, 1)}
                        className="grid h-8 w-8 place-items-center rounded-xl border border-gray-200 bg-white text-[#344257] hover:border-[#6A859F] hover:text-[#344257] transition shadow-sm"
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
