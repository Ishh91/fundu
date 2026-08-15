import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  IndianRupee,
  Smartphone,
  Quote,
  MessageSquarePlus,
  Star,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { db } from '../../lib/db';
import type { Review } from '../../types';
import ReviewModal from '../ReviewModal';

const TRUST_STATS = [
  {
    icon: IndianRupee,
    value: '₹14.2 Cr.+',
    label: 'Instant Cash Paid in Lucknow',
  },
  {
    icon: Smartphone,
    value: '25,000+',
    label: 'Phones Serviced & Delivered',
  },
  {
    icon: Star,
    value: '4.8 / 5.0',
    label: 'Verified Lucknow Rating',
  },
];

const DEFAULT_LUCKNOW_TESTIMONIALS = [
  {
    quote:
      'Sold my iPhone 13 right from my flat in Gomti Nagar. The executive arrived within 2 hours, checked the screen and transferred the full UPI payment immediately.',
    name: 'Tarun Singh Verma',
    location: 'Gomti Nagar, Lucknow',
    service: 'Sold iPhone 13',
    rating: 5,
  },
  {
    quote:
      'Bought a refurbished Galaxy S22 at Hazratganj. Flawless condition, genuine battery health, and got 6 months warranty card on delivery. Super impressed!',
    name: 'Karan Sharma',
    location: 'Hazratganj, Lucknow',
    service: 'Bought Galaxy S22',
    rating: 5,
  },
  {
    quote:
      'Screen replacement done at my doorstep in Indira Nagar in just 25 minutes! The technician replaced the display right in front of me with genuine warranty.',
    name: 'Abhiyash Srivastava',
    location: 'Indira Nagar, Lucknow',
    service: 'Screen Repair',
    rating: 5,
  },
  {
    quote:
      'Doorstep phone evaluation in Aliganj was extremely transparent. No unfair bargaining like local markets. Got exact quoted price paid to GPay instantly.',
    name: 'Vinit Kumar',
    location: 'Aliganj, Lucknow',
    service: 'Sold OnePlus Nord',
    rating: 5,
  },
  {
    quote:
      'Super fast battery replacement service in Mahanagar. My iPhone was dying in 2 hours, now it lasts whole day. 6-month warranty included.',
    name: 'Neha Gupta',
    location: 'Mahanagar, Lucknow',
    service: 'Battery Replacement',
    rating: 5,
  },
];

const BRAND_PARTNERS = [
  'Apple',
  'Samsung',
  'OnePlus',
  'Xiaomi',
  'Vivo',
  'Oppo',
  'Google',
  'Realme',
  'Motorola',
  'Nothing',
];

export default function TrustAndTestimonials() {
  const [startIndex, setStartIndex] = useState(0);
  const [dbReviews, setDbReviews] = useState<Review[]>([]);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  useEffect(() => {
    db.from('reviews')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .then((res) => {
        if (res.data && Array.isArray(res.data)) {
          setDbReviews(res.data as Review[]);
        }
      });
  }, []);

  const allTestimonials = [
    ...dbReviews.map((r) => ({
      quote: r.comment,
      name: r.reviewer_name,
      location: r.location || 'Lucknow',
      service: r.phone_model ? `Serviced ${r.phone_model}` : 'Verified Customer',
      rating: r.rating || 5,
    })),
    ...DEFAULT_LUCKNOW_TESTIMONIALS,
  ];

  const visibleCount = 3;

  const handleNext = () => {
    setStartIndex((prev) => (prev + 1) % Math.max(1, allTestimonials.length - visibleCount + 1));
  };

  const handlePrev = () => {
    setStartIndex((prev) => (prev === 0 ? Math.max(0, allTestimonials.length - visibleCount) : prev - 1));
  };

  return (
    <section className="bg-[#0f172a] py-10 text-white overflow-hidden">
      <div className="container-page">
        {/* Header & Stats Strip */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-gray-800 pb-8">
          <div>
            <span className="rounded-full bg-teal-500/20 border border-teal-500/30 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-teal-400">
              Verified Lucknow Feedback
            </span>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-black text-white">
              Trusted by 25,000+ Customers Across Lucknow
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-gray-400">
              Read authentic reviews from buyers, sellers, and repair clients in Lucknow.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {TRUST_STATS.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-sm"
                >
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-teal-500/20 text-teal-400">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-base font-black text-white leading-tight">{stat.value}</p>
                    <p className="text-[11px] text-gray-400 font-medium">{stat.label}</p>
                  </div>
                </div>
              );
            })}

            <button
              type="button"
              onClick={() => setReviewModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-teal-500 hover:bg-teal-600 px-4 py-3 text-xs font-bold text-white shadow-lg transition"
            >
              <MessageSquarePlus className="h-4 w-4" />
              <span>Write a Review</span>
            </button>
          </div>
        </div>

        {/* Testimonials Carousel Cards */}
        <div className="mt-8 relative">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allTestimonials.slice(startIndex, startIndex + visibleCount).map((item, idx) => (
              <div
                key={`${item.name}-${idx}`}
                className="flex flex-col justify-between rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur-md transition hover:border-teal-500/50 hover:bg-white/10"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1 text-amber-400">
                      {Array.from({ length: item.rating || 5 }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <span className="rounded-full bg-teal-500/20 px-2.5 py-0.5 text-[10px] font-bold text-teal-300">
                      {item.service}
                    </span>
                  </div>

                  <p className="mt-4 text-xs sm:text-sm leading-relaxed text-gray-200 font-medium">
                    "{item.quote}"
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-teal-500/30 text-teal-300 font-bold text-xs border border-teal-500/40">
                      {item.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{item.name}</h4>
                      <p className="text-[11px] text-gray-400 font-medium">{item.location}</p>
                    </div>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" title="Verified Customer" />
                </div>
              </div>
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={startIndex === 0}
              className="grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-white/5 text-white transition hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Previous"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={startIndex >= allTestimonials.length - visibleCount}
              className="grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-white/5 text-white transition hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Next"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onSuccess={() => {
          db.from('reviews')
            .select('*')
            .eq('is_approved', true)
            .order('created_at', { ascending: false })
            .then((res) => {
              if (res.data && Array.isArray(res.data)) {
                setDbReviews(res.data as Review[]);
              }
            });
        }}
      />

      {/* Brand Partners Marquee Strip */}
      <div className="mt-10 bg-teal-600 py-3.5 overflow-hidden">
        <div className="flex whitespace-nowrap marquee-track">
          {[
            ...BRAND_PARTNERS,
            ...BRAND_PARTNERS,
            ...BRAND_PARTNERS,
            ...BRAND_PARTNERS,
          ].map((b, i) => (
            <div
              key={`${b}-${i}`}
              className="flex items-center gap-3 px-8 text-white font-black tracking-wider text-sm uppercase opacity-90"
            >
              <span>{b}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
