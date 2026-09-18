import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useHeroPosters } from '../../lib/heroBanners';
import OurServices from './OurServices';

export default function HeroSection() {
  const navigate = useNavigate();
  const { activePosters } = useHeroPosters();
  const [activeSlide, setActiveSlide] = useState(0);

  const slidesCount = activePosters.length || 1;

  useEffect(() => {
    if (slidesCount <= 1) return;
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slidesCount);
    }, 6500);

    return () => window.clearInterval(timer);
  }, [slidesCount]);

  const currentIndex = activeSlide >= slidesCount ? 0 : activeSlide;
  const currentSlide = activePosters[currentIndex] || activePosters[0];

  if (!currentSlide) return null;

  return (
    <section className="py-4 space-y-4">
      <div className="container-page space-y-4">
        {/* Cashify Top Search Bar (Mobile Only) */}
        <div className="max-w-3xl mx-auto md:hidden">
          <div
            onClick={() => navigate('/sell')}
            className="relative flex items-center w-full px-4 py-3 bg-white rounded-2xl border border-gray-200 shadow-xs cursor-pointer hover:border-[#00a896] hover:shadow-md transition group"
          >
            <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-[#00a896] mr-3 shrink-0" />
            <span className="text-xs sm:text-sm text-gray-400 font-medium truncate">
              Search for mobiles, accessories & More
            </span>
          </div>
        </div>

        {/* Full Width Custom Poster Carousel with Official Hero Palette Frame */}
        <div
          className="relative group/hero overflow-hidden rounded-2xl sm:rounded-3xl p-1 sm:p-1.5 shadow-md"
          style={{
            background: 'linear-gradient(135deg, #6A859F 0%, #F0F0F5 50%, #C0C8D8 100%)',
          }}
        >
          <div className="relative overflow-hidden rounded-[14px] sm:rounded-[22px] bg-white border border-white/60">
            {/* Main Slide Poster */}
            <Link
              key={currentIndex}
              to={currentSlide.primaryHref || '/sell'}
              className="block relative w-full overflow-hidden animate-fade-in group cursor-pointer bg-white"
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
                  className="w-full h-auto max-h-[550px] object-contain sm:object-cover transition-transform duration-700 group-hover:scale-[1.01] mx-auto block"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://placehold.co/1400x550?text=Fundu+Poster+Banner';
                  }}
                />
              </picture>
            </Link>

            {/* Left Navigation Button */}
            {slidesCount > 1 && (
              <button
                type="button"
                onClick={() => setActiveSlide((currentIndex - 1 + slidesCount) % slidesCount)}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/90 hover:bg-white text-[#344257] border border-[#C0C8D8] shadow-md transition-all duration-300 opacity-70 hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            )}

            {/* Right Navigation Button */}
            {slidesCount > 1 && (
              <button
                type="button"
                onClick={() => setActiveSlide((currentIndex + 1) % slidesCount)}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/90 hover:bg-white text-[#344257] border border-[#C0C8D8] shadow-md transition-all duration-300 opacity-70 hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer"
                aria-label="Next Slide"
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Bottom Centered Pagination Indicator Dots */}
        {slidesCount > 1 && (
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {activePosters.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  index === currentIndex
                    ? 'w-7 bg-gradient-to-r from-[#344257] to-[#5D6A82]'
                    : 'w-2 bg-[#8A9AAF]/40 hover:bg-[#8A9AAF]'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Bottom Feature Strip (Gradient: #F7F7FA -> #E4E7F0) */}
        <div className="rounded-2xl sm:rounded-3xl border border-[#C0C8D8]/70 fundu-feature-strip-gradient p-4 sm:p-5 shadow-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#C0C8D8]/80 grid place-items-center shrink-0 shadow-xs">
                <span className="text-lg">⚡</span>
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-[#344257]">Instant Cash / UPI</h4>
                <p className="text-[11px] text-[#47576E] font-medium">Spot payout at doorstep</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#C0C8D8]/80 grid place-items-center shrink-0 shadow-xs">
                <span className="text-lg">🚚</span>
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-[#344257]">Free Lucknow Pickup</h4>
                <p className="text-[11px] text-[#47576E] font-medium">Zero travel or pickup fee</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#C0C8D8]/80 grid place-items-center shrink-0 shadow-xs">
                <span className="text-lg">🛡️</span>
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-[#344257]">6-Month Warranty</h4>
                <p className="text-[11px] text-[#47576E] font-medium">Certified refurbished guarantee</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#C0C8D8]/80 grid place-items-center shrink-0 shadow-xs">
                <span className="text-lg">🔒</span>
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-[#344257]">100% Data Wiped</h4>
                <p className="text-[11px] text-[#47576E] font-medium">Certified privacy protection</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cashify 4-Column Services Section */}
        <OurServices />
      </div>
    </section>
  );
}
