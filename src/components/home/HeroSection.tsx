import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BadgeIndianRupee,
  ShieldCheck,
  Sparkles,
  Store,
  Wrench,
  Truck,
  Zap,
  CheckCircle2,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import { useHeroPosters } from '../../lib/heroBanners';

const CASHIFY_SERVICE_CARDS = [
  {
    id: 'sell',
    title: 'Sell Old Phone',
    subtitle: 'Instant Price Quote',
    tag: 'Highest Cash',
    tagColor: 'bg-emerald-500 text-white',
    desc: 'Free doorstep pickup across Lucknow & instant cash/UPI on spot.',
    href: '/sell',
    icon: BadgeIndianRupee,
    iconBg: 'bg-emerald-100/80 text-emerald-700',
    btnText: 'Sell Phone',
    btnColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  },
  {
    id: 'buy',
    title: 'Buy Refurbished Phone',
    subtitle: '32-Point Quality Check',
    tag: '6M Warranty',
    tagColor: 'bg-teal-600 text-white',
    desc: 'Certified phones with battery confidence & free same-day Lucknow delivery.',
    href: '/buy',
    icon: Store,
    iconBg: 'bg-teal-100/80 text-teal-700',
    btnText: 'Browse Store',
    btnColor: 'bg-teal-600 hover:bg-teal-700 text-white',
  },
  {
    id: 'repair',
    title: 'Repair Phone',
    subtitle: 'Doorstep in 30 Mins',
    tag: 'Genuine Parts',
    tagColor: 'bg-amber-500 text-white',
    desc: 'Screen, battery, and camera fixed right at your home or office in Lucknow.',
    href: '/repair',
    icon: Wrench,
    iconBg: 'bg-amber-100/80 text-amber-700',
    btnText: 'Book Repair',
    btnColor: 'bg-amber-600 hover:bg-amber-700 text-white',
  },
];

const TRUST_PILLARS_STRIP = [
  { icon: Zap, label: 'Instant Spot Payment on Pickup' },
  { icon: Truck, label: 'Free Doorstep Service across all Lucknow Localities' },
  { icon: ShieldCheck, label: '32-Point Certified Quality Inspection' },
  { icon: Wrench, label: '30-Minute Screen & Battery Doorstep Repair' },
];

export default function HeroSection() {
  const { activePosters } = useHeroPosters();
  const [activeSlide, setActiveSlide] = useState(0);

  const slidesCount = activePosters.length || 1;

  useEffect(() => {
    if (slidesCount <= 1) return;
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slidesCount);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [slidesCount]);

  const currentIndex = activeSlide >= slidesCount ? 0 : activeSlide;
  const currentSlide = activePosters[currentIndex] || activePosters[0];

  if (!currentSlide) return null;

  const isCustomGradient =
    currentSlide.accent?.includes('gradient') || currentSlide.accent?.startsWith('#');
  const gradientClass =
    !isCustomGradient && currentSlide.accent
      ? `bg-gradient-to-r ${currentSlide.accent}`
      : !isCustomGradient
      ? 'bg-gradient-to-r from-[#0f4044] via-[#0d6e67] to-[#14c8ba]'
      : '';
  const gradientStyle = isCustomGradient ? { background: currentSlide.accent } : undefined;

  return (
    <section className="bg-[#f8fafc] py-5 sm:py-7 border-b border-gray-200">
      <div className="container-page space-y-6">
        {/* Top 3 Core Cashify Action Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          {CASHIFY_SERVICE_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-teal-400 hover:shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className={`grid h-12 w-12 place-items-center rounded-xl ${card.iconBg}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide ${card.tagColor}`}>
                      {card.tag}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-extrabold text-gray-900 group-hover:text-teal-700 transition">
                    {card.title}
                  </h3>
                  <p className="text-xs font-semibold text-teal-600 mt-0.5">{card.subtitle}</p>
                  <p className="mt-2 text-xs leading-relaxed text-gray-500">{card.desc}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-400 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-teal-600" /> Lucknow Only
                  </span>
                  <Link
                    to={card.href}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold shadow-sm transition ${card.btnColor}`}
                  >
                    <span>{card.btnText}</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Promotional Hero Carousel Banner */}
        <div className="overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-md">
          <div
            className={`grid min-h-[320px] md:min-h-[350px] gap-6 ${gradientClass} p-6 sm:p-8 md:p-10 text-white md:grid-cols-[1.1fr_0.9fr] items-center relative overflow-hidden`}
            style={gradientStyle}
          >
            {/* Background geometric accents */}
            <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
            <div className="absolute left-1/3 bottom-0 h-64 w-64 rounded-full bg-teal-400/10 blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col justify-center">
              {currentSlide.eyebrow && (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-white backdrop-blur-sm border border-white/20">
                    <Sparkles className="h-3 w-3 text-amber-300" />
                    {currentSlide.eyebrow}
                  </span>
                  <span className="hidden sm:inline-block rounded-full bg-emerald-400/30 border border-emerald-400/40 px-2.5 py-0.5 text-[11px] font-bold text-emerald-100">
                    📍 Lucknow Exclusive
                  </span>
                </div>
              )}

              <h1 className="mt-3.5 font-display text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight drop-shadow-sm">
                {currentSlide.title}
              </h1>

              {currentSlide.description && (
                <p className="mt-3.5 max-w-xl text-sm sm:text-base leading-relaxed text-white/90 font-medium">
                  {currentSlide.description}
                </p>
              )}

              {/* Bullet points */}
              {currentSlide.bullets && currentSlide.bullets.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {currentSlide.bullets.map((bullet, idx) => (
                    <span
                      key={`${bullet}-${idx}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-black/20 border border-white/20 px-3 py-1 text-xs font-semibold text-white/95"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-teal-300 shrink-0" />
                      {bullet}
                    </span>
                  ))}
                </div>
              )}

              {/* CTA Action Buttons */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {currentSlide.primaryLabel && (
                  <Link
                    to={currentSlide.primaryHref || '/sell'}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-extrabold text-gray-900 shadow-xl hover:bg-teal-50 hover:text-teal-900 transition active:scale-95"
                  >
                    <span>{currentSlide.primaryLabel}</span>
                    <ArrowRight className="h-4 w-4 text-teal-600" />
                  </Link>
                )}
                {currentSlide.secondaryLabel && (
                  <Link
                    to={currentSlide.secondaryHref || '#'}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 backdrop-blur-sm px-5 py-3 text-sm font-bold text-white hover:bg-white/20 transition"
                  >
                    {currentSlide.secondaryLabel}
                  </Link>
                )}
              </div>
            </div>

            {/* Poster Image */}
            <div className="relative z-10 flex items-center justify-center md:justify-end">
              {currentSlide.image ? (
                <img
                  src={currentSlide.image}
                  alt={currentSlide.title}
                  className="h-[220px] sm:h-[260px] md:h-[290px] w-auto max-w-full object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.35)] transition-all duration-500 hover:scale-105"
                />
              ) : (
                <div className="h-[220px] w-[260px] rounded-2xl bg-white/10 grid place-items-center text-white/50">
                  Fundu Lucknow
                </div>
              )}
            </div>
          </div>

          {/* Slider Controls */}
          <div className="flex items-center justify-between border-t border-gray-100 bg-white px-6 py-3.5">
            <div className="flex items-center gap-2">
              {activePosters.map((slide, index) => (
                <button
                  key={slide.id || index}
                  type="button"
                  onClick={() => setActiveSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'w-7 bg-teal-500'
                      : 'w-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveSlide((currentIndex - 1 + slidesCount) % slidesCount)}
                className="grid h-8 w-8 place-items-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:border-teal-400 hover:text-teal-700 shadow-sm"
                aria-label="Previous slide"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setActiveSlide((currentIndex + 1) % slidesCount)}
                className="grid h-8 w-8 place-items-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:border-teal-400 hover:text-teal-700 shadow-sm"
                aria-label="Next slide"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Cashify Trust & Lucknow Doorstep Strip */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_PILLARS_STRIP.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 rounded-xl bg-[#f8fafc] p-3 text-xs font-bold text-gray-800 border border-gray-100"
                >
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-teal-100 text-teal-700">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="leading-snug">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
