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
} from 'lucide-react';
import { PROMO_MESSAGES } from '../../data/siteContent';
import { useHeroPosters } from '../../lib/heroBanners';

const serviceCards = [
  {
    title: 'Sell Phone',
    description: 'Get a fast quote and doorstep pickup.',
    href: '/sell',
    icon: BadgeIndianRupee,
  },
  {
    title: 'Buy Phone',
    description: 'Shop verified refurbished devices.',
    href: '/buy',
    icon: Store,
  },
  {
    title: 'Repair Phone',
    description: 'Book screen, battery, and charging repairs.',
    href: '/repair',
    icon: Wrench,
  },
  {
    title: 'Spare Parts',
    description: 'Find compatible parts and accessories.',
    href: '/spare-parts',
    icon: ShieldCheck,
  },
  {
    title: 'Fundu Store',
    description: 'Exclusive offers and curated collections.',
    href: '/store',
    icon: Sparkles,
  },
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

  const isCustomGradient = currentSlide.accent?.includes('gradient') || currentSlide.accent?.startsWith('#');
  const gradientClass = !isCustomGradient && currentSlide.accent
    ? `bg-gradient-to-r ${currentSlide.accent}`
    : !isCustomGradient
    ? 'bg-gradient-to-r from-[#4cd2c4] to-[#18bdb0]'
    : '';
  const gradientStyle = isCustomGradient ? { background: currentSlide.accent } : undefined;

  return (
    <section className="border-b border-[#e6eaef] bg-[#f6f7fb] py-6 md:py-8">
      <div className="container-page">
        <div className="overflow-hidden rounded-[28px] border border-[#dce5e8] bg-white shadow-soft">
          <div
            className={`grid min-h-[320px] gap-6 ${gradientClass} px-6 py-8 text-white md:grid-cols-[0.95fr_1.05fr] md:px-8`}
            style={gradientStyle}
          >
            <div className="flex flex-col justify-center">
              {currentSlide.eyebrow && (
                <span className="inline-flex w-fit items-center rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-white/90">
                  {currentSlide.eyebrow}
                </span>
              )}
              <h1 className="mt-4 max-w-xl font-display text-4xl font-extrabold leading-tight md:text-5xl">
                {currentSlide.title}
              </h1>
              {currentSlide.description && (
                <p className="mt-4 max-w-lg text-sm leading-7 text-white/90 md:text-base">
                  {currentSlide.description}
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                {currentSlide.primaryLabel && (
                  <Link
                    to={currentSlide.primaryHref || '/'}
                    className="btn rounded-xl bg-white px-6 py-3 text-ink-900 font-bold hover:bg-emerald-50 shadow-md transition"
                  >
                    {currentSlide.primaryLabel}
                  </Link>
                )}
                {currentSlide.secondaryLabel && (
                  <Link
                    to={currentSlide.secondaryHref || '#'}
                    className="btn rounded-xl border border-white/25 bg-white/10 px-6 py-3 text-white font-semibold hover:bg-white/15 transition"
                  >
                    {currentSlide.secondaryLabel}
                  </Link>
                )}
              </div>

              {currentSlide.bullets && currentSlide.bullets.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {currentSlide.bullets.map((item, idx) => (
                    <span
                      key={`${item}-${idx}`}
                      className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="relative flex items-end justify-center">
              {currentSlide.image ? (
                <img
                  src={currentSlide.image}
                  alt={currentSlide.title}
                  className="h-[240px] w-auto max-w-full object-contain drop-shadow-[0_18px_32px_rgba(0,0,0,0.24)] md:h-[300px] transition-all duration-500"
                />
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-2">
              {activePosters.map((slide, index) => (
                <button
                  key={slide.id || index}
                  type="button"
                  onClick={() => setActiveSlide(index)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    index === currentIndex ? 'w-8 bg-brand-500' : 'w-2.5 bg-ink-300 hover:bg-ink-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveSlide((currentIndex - 1 + slidesCount) % slidesCount)}
                className="grid h-9 w-9 place-items-center rounded-full border border-[#dbe5e8] bg-white text-ink-700 transition hover:border-brand-300 hover:text-brand-700"
                aria-label="Previous slide"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setActiveSlide((currentIndex + 1) % slidesCount)}
                className="grid h-9 w-9 place-items-center rounded-full border border-[#dbe5e8] bg-white text-ink-700 transition hover:border-brand-300 hover:text-brand-700"
                aria-label="Next slide"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {serviceCards.map((item) => (
            <Link
              key={item.title}
              to={item.href}
              className="rounded-[24px] border border-[#dce5e8] bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-card"
            >
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-bold text-ink-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-ink-500">{item.description}</p>
            </Link>
          ))}
        </div>

        <div className="mt-6 overflow-hidden rounded-[22px] border border-[#dce5e8] bg-white shadow-soft">
          <div className="flex whitespace-nowrap marquee-track">
            {[...PROMO_MESSAGES, ...PROMO_MESSAGES].map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="flex items-center gap-2 border-r border-[#e9eff2] px-6 py-4 text-sm font-semibold text-ink-700"
              >
                <Sparkles className="h-4 w-4 text-brand-600" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
