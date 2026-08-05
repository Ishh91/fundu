import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { formatINR } from '../../lib/db';
import type { Product } from '../../types';

interface BestDealsProps {
  products: Product[];
  loading: boolean;
}

export default function BestDeals({ products, loading }: BestDealsProps) {
  return (
    <section className="container-page py-2">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-700">Best Deals</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-ink-900">Refurbished phones users can trust</h2>
        </div>
        <Link to="/buy" className="hidden items-center gap-2 text-sm font-semibold text-brand-700 sm:inline-flex">
          View all phones <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {loading ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-80 rounded-[24px] border border-[#dce5e8] bg-white shadow-soft" />
          ))}
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {products.slice(0, 4).map((item) => (
            <Link
              key={item.id}
              to={`/product/${item.id}`}
              className="overflow-hidden rounded-[24px] border border-[#dce5e8] bg-white transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-card"
            >
              <div className="relative aspect-[4/3] bg-[#f3f7f8]">
                {item.images?.[0] ? (
                  <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center text-ink-300">No image</div>
                )}
                {item.discount_percent > 0 && (
                  <span className="absolute left-4 top-4 rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white">
                    {item.discount_percent}% OFF
                  </span>
                )}
              </div>
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">{item.brand}</p>
                <h3 className="mt-2 text-lg font-bold text-ink-900">{item.title}</h3>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {item.storage ? <span className="rounded-full bg-[#f3f7f8] px-2.5 py-1 text-ink-600">{item.storage}</span> : null}
                  {item.ram ? <span className="rounded-full bg-[#f3f7f8] px-2.5 py-1 text-ink-600">{item.ram}</span> : null}
                  <span className="rounded-full bg-brand-50 px-2.5 py-1 text-brand-700">{item.condition}</span>
                </div>
                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-extrabold text-ink-900">{formatINR(item.price)}</p>
                    {item.original_price ? (
                      <p className="text-xs text-ink-400 line-through">{formatINR(item.original_price)}</p>
                    ) : null}
                  </div>
                  <div className="text-right text-xs text-ink-500">
                    <p className="font-semibold text-brand-700">{item.warranty_months} months</p>
                    <p>warranty</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
