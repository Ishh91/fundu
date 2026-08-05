import { Star } from 'lucide-react';
import { HOME_COUPONS, HOME_REVIEWS } from '../../data/siteContent';

export default function OffersAndReviews() {
  return (
    <section className="container-page py-4">
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[28px] border border-[#dce5e8] bg-white p-8 shadow-soft">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-700">Offers & Coupons</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-ink-900">Running deals that feel active and visible</h2>
          <p className="mt-3 text-sm leading-7 text-ink-600">
            Cashify-like homepage feel me offer visibility important hoti hai, isliye Fundu ke promo blocks ko clear, bright, and easy to scan style me rakha gaya hai.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {HOME_COUPONS.map((coupon) => (
              <div key={coupon.code} className="rounded-[22px] border border-dashed border-brand-300 bg-brand-50/40 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-700">Coupon code</p>
                <h3 className="mt-3 text-2xl font-extrabold text-ink-900">{coupon.code}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-600">{coupon.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-[#dce5e8] bg-white p-8 shadow-soft">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-700">Customer Reviews</p>
          <div className="mt-6 space-y-4">
            {HOME_REVIEWS.map((review) => (
              <div key={review.name} className="rounded-[22px] border border-[#e8eef1] bg-[#fafcfc] p-5">
                <div className="flex gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-3 text-sm leading-7 text-ink-600">"{review.quote}"</p>
                <div className="mt-4">
                  <p className="font-semibold text-ink-900">{review.name}</p>
                  <p className="text-xs text-ink-400">{review.area}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
