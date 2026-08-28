import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  Zap,
  Wrench,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useHeroPosters } from '../../lib/heroBanners';

const TRUST_PILLARS_STRIP = [
  { icon: Zap, label: 'Instant Spot Cash/UPI Payment on Pickup' },
  { icon: Truck, label: 'Free Doorstep Service across all Lucknow Localities' },
  { icon: ShieldCheck, label: '32-Point Certified Device Audit & Warranty' },
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
    }, 2500);

    return () => window.clearInterval(timer);
  }, [slidesCount]);

  const currentIndex = activeSlide >= slidesCount ? 0 : activeSlide;
  const currentSlide = activePosters[currentIndex] || activePosters[0];

  if (!currentSlide) return null;

  return (
    <section className="py-5 sm:py-8">
      <div className="container-page space-y-5">
        {/* Full Edge-to-Edge Custom Poster Carousel */}
        <div className="relative group/hero overflow-hidden rounded-[28px] sm:rounded-[36px] border border-white/80 bg-slate-900 shadow-[0_24px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          {/* Main Slide Poster (Clickable & Responsive per Device) */}
          <Link
            key={currentIndex}
            to={currentSlide.primaryHref || '/sell'}
            className="block relative w-full overflow-hidden animate-fade-in group cursor-pointer bg-slate-950"
          >
            <picture className="w-full h-auto block">
              {currentSlide.image_mobile && (
                <source media="(max-width: 639px)" srcSet={currentSlide.image_mobile} />
              )}
              {currentSlide.image_tablet && (
                <source media="(min-width: 640px) and (max-width: 1023px)" srcSet={currentSlide.image_tablet} />
              )}
              <img
                src={currentSlide.image}
                alt={currentSlide.title || 'Fundu Lucknow Poster'}
                className="w-full h-auto max-h-[620px] object-contain sm:object-cover transition-transform duration-700 group-hover:scale-[1.01] mx-auto block"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://placehold.co/1400x550?text=Fundu+Poster+Banner';
                }}
              />
            </picture>
          </Link>

          {/* Floating Left Navigation Button */}
          {slidesCount > 1 && (
            <button
              type="button"
              onClick={() => setActiveSlide((currentIndex - 1 + slidesCount) % slidesCount)}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-slate-950/40 hover:bg-white text-white hover:text-slate-950 backdrop-blur-xl border border-white/40 shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          )}

          {/* Floating Right Navigation Button */}
          {slidesCount > 1 && (
            <button
              type="button"
              onClick={() => setActiveSlide((currentIndex + 1) % slidesCount)}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-slate-950/40 hover:bg-white text-white hover:text-slate-950 backdrop-blur-xl border border-white/40 shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
              aria-label="Next Slide"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          )}

          {/* Bottom Centered Pagination Indicator Pills */}
          {slidesCount > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 rounded-full bg-slate-950/50 backdrop-blur-lg px-3.5 py-1.5 border border-white/20 shadow-lg">
              {activePosters.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    index === currentIndex
                      ? 'w-7 bg-[#86dedd] shadow-[0_0_12px_#86dedd]'
                      : 'w-2 bg-white/50 hover:bg-white'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Lucknow Exclusive Trust Pillars Strip */}
        <div className="rounded-3xl border border-white/80 bg-white/85 p-4 sm:p-5 shadow-[0_12px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_PILLARS_STRIP.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 rounded-2xl bg-white/80 p-3 text-xs font-bold text-slate-800 border border-white/90 shadow-sm"
                >
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#c0e7e4] text-[#0d5955]">
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
