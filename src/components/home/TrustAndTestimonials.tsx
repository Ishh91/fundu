import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, IndianRupee, Smartphone, Quote, MessageSquarePlus, Star } from 'lucide-react';
import { db } from '../../lib/db';
import type { Review } from '../../types';
import ReviewModal from '../ReviewModal';

const trustStats = [
  {
    icon: IndianRupee,
    value: '₹14.2 Cr.',
    label: 'Instant Cash Paid in Lucknow',
  },
  {
    icon: Smartphone,
    value: '25,000+',
    label: 'Devices Serviced & Delivered',
  },
];

const defaultTestimonials = [
  {
    quote: 'Sold off my phone very easily in Gomti Nagar and got instant payout on spot. Best experience so far.',
    name: 'Tarun Singh Verma',
    location: 'Gomti Nagar, Lucknow',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    rating: 5,
  },
  {
    quote: 'Well trained staff and free doorstep pickup in Hazratganj. Overall positive experience selling my phone.',
    name: 'Karan Sharma',
    location: 'Hazratganj, Lucknow',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    rating: 5,
  },
  {
    quote: 'No complaints! Bought a refurbished iPhone 13 at Indira Nagar branch with 6 months warranty.',
    name: 'Abhiyash',
    location: 'Indira Nagar, Lucknow',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    rating: 5,
  },
  {
    quote: 'Doorstep repair in Aliganj was super fast. Display replacement done within 30 mins.',
    name: 'Vinit Kumar',
    location: 'Aliganj, Lucknow',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=80',
    rating: 5,
  },
  {
    quote: 'Awesome doorstep service in Mahanagar! Evaluation was fair and UPI payout came within 5 minutes.',
    name: 'Neha Gupta',
    location: 'Mahanagar, Lucknow',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    rating: 5,
  },
];

const partnerBrands = [
  { name: 'Mi', logoText: 'mi' },
  { name: 'Vijay Sales', logoText: 'vijay sales' },
  { name: 'Reliance Digital', logoText: 'reliancedigital' },
  { name: 'HP', logoText: 'hp' },
  { name: 'Paytm', logoText: 'paytm' },
  { name: 'Nokia', logoText: 'NOKIA' },
  { name: 'OnePlus', logoText: 'ONEPLUS' },
  { name: 'Dell', logoText: 'DELL' },
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
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(r.reviewer_name)}`,
      rating: r.rating || 5,
    })),
    ...defaultTestimonials,
  ];

  const visibleCount = 4;

  const handleNext = () => {
    setStartIndex((prev) => (prev + 1) % Math.max(1, allTestimonials.length - visibleCount + 1));
  };

  const handlePrev = () => {
    setStartIndex((prev) => (prev === 0 ? Math.max(0, allTestimonials.length - visibleCount) : prev - 1));
  };

  return (
    <section className="bg-[#0f1214] pt-12 text-white overflow-hidden">
      <div className="container-page">
        {/* Header section with Stats */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-teal-400">Verified Customer Reviews</span>
            <h2 className="mt-1 max-w-2xl font-display text-3xl font-extrabold leading-tight md:text-4xl">
              Trusted by 25,000+ Lucknow Customers
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {trustStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#1c2226] px-4 py-3 min-w-[170px]"
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white leading-snug">{stat.value}</p>
                    <p className="text-xs text-white/60 font-medium">{stat.label}</p>
                  </div>
                </div>
              );
            })}
            <button
              type="button"
              onClick={() => setReviewModalOpen(true)}
              className="btn-primary py-3 px-5 text-xs font-semibold rounded-2xl flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-lg"
            >
              <MessageSquarePlus className="h-4 w-4" /> Write a Review
            </button>
          </div>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative mt-10 pb-12">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {allTestimonials.slice(startIndex, startIndex + visibleCount).map((item, idx) => (
              <div
                key={`${item.name}-${idx}`}
                className="flex flex-col justify-between rounded-[24px] bg-white p-6 text-ink-900 shadow-lg min-h-[260px] transition hover:translate-y-[-2px]"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <Quote className="h-8 w-8 text-[#4cd2c4] fill-[#4cd2c4]/20 rotate-180" />
                    <div className="flex gap-0.5 text-amber-400">
                      {Array.from({ length: item.rating || 5 }).map((_, index) => (
                        <Star key={index} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 text-sm font-medium leading-relaxed text-ink-700">
                    "{item.quote}"
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="h-11 w-11 rounded-full object-cover border-2 border-brand-100 bg-ink-50"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-ink-900 leading-tight">{item.name}</h3>
                    <p className="text-xs text-ink-400 font-medium">{item.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 flex gap-2 z-10 hidden md:flex">
            {startIndex > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="grid h-11 w-11 place-items-center rounded-full border border-gray-200 bg-white text-ink-800 shadow-md transition hover:bg-gray-50"
                aria-label="Previous Testimonials"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            {startIndex < allTestimonials.length - visibleCount && (
              <button
                type="button"
                onClick={handleNext}
                className="grid h-11 w-11 place-items-center rounded-full border border-gray-200 bg-white text-ink-800 shadow-md transition hover:bg-gray-50"
                aria-label="Next Testimonials"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onSuccess={() => {
          // Re-fetch approved reviews
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

      {/* Partner Brands Strip (Running Marquee Style) */}
      <div className="bg-[#18bdb0] py-5 overflow-hidden">
        <div className="flex whitespace-nowrap marquee-track">
          {[...partnerBrands, ...partnerBrands, ...partnerBrands, ...partnerBrands].map((brand, index) => (
            <div
              key={`${brand.name}-${index}`}
              className="flex items-center gap-2 text-white font-extrabold tracking-tight px-8 md:px-12"
            >
              {brand.logoText === 'mi' ? (
                <span className="rounded-lg bg-white px-2 py-0.5 text-xs font-black text-[#18bdb0] uppercase tracking-wider">
                  mi
                </span>
              ) : brand.logoText === 'hp' ? (
                <span className="rounded-full border-2 border-white px-2 py-0.5 text-xs font-black italic">
                  hp
                </span>
              ) : brand.logoText === 'DELL' ? (
                <span className="rounded-full border-2 border-white px-2.5 py-1 text-xs font-black uppercase">
                  DELL
                </span>
              ) : (
                <span className="text-lg md:text-xl font-black uppercase tracking-wider opacity-95">
                  {brand.logoText}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
