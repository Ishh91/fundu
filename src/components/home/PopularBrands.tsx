import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { LOOKUP_BRANDS } from '../../data/phoneLookup';

const BRAND_MOBILE_IMAGES: Record<string, string> = {
  Apple: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&auto=format&fit=crop&q=80',
  Samsung: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&auto=format&fit=crop&q=80',
  OnePlus: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=200&auto=format&fit=crop&q=80',
  Xiaomi: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=200&auto=format&fit=crop&q=80',
  Realme: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&auto=format&fit=crop&q=80',
  Vivo: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=200&auto=format&fit=crop&q=80',
  Oppo: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=200&auto=format&fit=crop&q=80',
  Nothing: 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=200&auto=format&fit=crop&q=80',
  Google: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=200&auto=format&fit=crop&q=80',
  Motorola: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=200&auto=format&fit=crop&q=80',
  Poco: 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=200&auto=format&fit=crop&q=80',
  iQOO: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=200&auto=format&fit=crop&q=80',
};

const DEFAULT_PHONE_IMAGE = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&auto=format&fit=crop&q=80';

export default function PopularBrands() {
  return (
    <section className="container-page py-12">
      <div className="rounded-[28px] border border-[#dce5e8] bg-white p-6 shadow-soft md:p-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-700">Popular Brands</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-ink-900">Choose your brand and start fast</h2>
          </div>
          <Link to="/sell" className="hidden items-center gap-2 text-sm font-semibold text-brand-700 sm:inline-flex">
            Sell by brand <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {LOOKUP_BRANDS.slice(0, 12).map((brand) => {
            const imgUrl = BRAND_MOBILE_IMAGES[brand] || DEFAULT_PHONE_IMAGE;
            return (
              <Link
                key={brand}
                to={`/sell?brand=${encodeURIComponent(brand)}`}
                className="group flex min-h-[140px] flex-col items-center justify-center rounded-[22px] border border-[#e7edf0] bg-[#f8fbfb] p-4 text-center transition hover:-translate-y-1 hover:border-brand-300 hover:bg-brand-50/50 hover:shadow-md"
              >
                <div className="h-16 w-16 overflow-hidden rounded-2xl bg-white p-1.5 shadow-sm transition group-hover:scale-105">
                  <img
                    src={imgUrl}
                    alt={`${brand} phone`}
                    className="h-full w-full object-cover rounded-xl"
                  />
                </div>
                <span className="mt-3 text-sm font-bold text-ink-800 group-hover:text-brand-700">{brand}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
