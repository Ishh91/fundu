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

        {/* Full Width Custom Poster Carousel */}
        <div className="relative group/hero overflow-hidden rounded-2xl sm:rounded-3xl border border-teal-100 bg-[#eef8f7] shadow-sm">
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
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/80 hover:bg-white text-gray-700 border border-gray-200 shadow-md transition-all duration-300 opacity-60 hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer"
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
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/80 hover:bg-white text-gray-700 border border-gray-200 shadow-md transition-all duration-300 opacity-60 hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer"
              aria-label="Next Slide"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          )}
        </div>

        {/* Bottom Centered Cashify-style Pagination Indicator Dots */}
        {slidesCount > 1 && (
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {activePosters.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  index === currentIndex
                    ? 'w-6 bg-[#00a896]'
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Cashify 4-Column Services Section */}
        <OurServices />
      </div>
    </section>
  );
}
