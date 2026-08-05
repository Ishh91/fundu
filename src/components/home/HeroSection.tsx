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

const buildHeroImage = (prompt: string, imageSize = 'portrait_4_3') =>
  `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=${imageSize}`;

const heroSlides = [
  {
    eyebrow: 'Sell old phone',
    title: 'Best place to sell your old phone',
    description: 'Get instant resale value, free doorstep pickup, and quick payment from a phone-first flow that feels familiar and clean.',
    primaryLabel: 'Sell Now',
    primaryHref: '/sell',
    secondaryLabel: 'How it Works',
    secondaryHref: '#sell-flow',
    accent: 'from-[#4cd2c4] to-[#18bdb0]',
    image: buildHeroImage(
      'photorealistic Indian man holding smartphone and cash wallet, premium teal ecommerce banner, realistic advertising, clean studio lighting, full body, modern Indian tech ad',
    ),
    bullets: ['Doorstep pickup', 'Top resale value', 'Fast payment'],
  },
  {
    eyebrow: 'Buy refurbished phones',
    title: 'Verified devices with warranty and clean pricing',
    description: 'Browse refurbished phones with battery confidence, warranty details, and value-focused deals just like a polished marketplace frontend should feel.',
    primaryLabel: 'Buy Phones',
    primaryHref: '/buy',
    secondaryLabel: 'Visit Store',
    secondaryHref: '/store',
    accent: 'from-[#58dbcf] to-[#1db8aa]',
    image: buildHeroImage(
      'photorealistic premium smartphones arranged for ecommerce banner, teal gradient backdrop, glossy lighting, realistic ad photography, clean modern composition',
    ),
    bullets: ['Warranty-backed', 'Verified stock', 'Weekly offers'],
  },
  {
    eyebrow: 'Repair with pickup support',
    title: 'Book phone repair without the usual hassle',
    description: 'From screen and battery to charging issues, Fundu keeps the repair journey simple, premium, and easy to trust.',
    primaryLabel: 'Book Repair',
    primaryHref: '/repair',
    secondaryLabel: 'Talk to Support',
    secondaryHref: '/document-doctor',
    accent: 'from-[#48d3c3] to-[#129f92]',
    image: buildHeroImage(
      'photorealistic mobile repair technician with smartphone, premium teal service banner, realistic Indian ecommerce ad, clean lighting and sharp modern composition',
    ),
    bullets: ['Screen repair', 'Battery replacement', 'Pickup support'],
  },
];

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
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  const currentSlide = heroSlides[activeSlide];

  return (
    <section className="border-b border-[#e6eaef] bg-[#f6f7fb] py-6 md:py-8">
      <div className="container-page">
        <div className="overflow-hidden rounded-[28px] border border-[#dce5e8] bg-white shadow-soft">
          <div className={`grid min-h-[320px] gap-6 bg-gradient-to-r ${currentSlide.accent} px-6 py-8 text-white md:grid-cols-[0.95fr_1.05fr] md:px-8`}>
            <div className="flex flex-col justify-center">
              <span className="inline-flex w-fit items-center rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-white/90">
                {currentSlide.eyebrow}
              </span>
              <h1 className="mt-4 max-w-xl font-display text-4xl font-extrabold leading-tight md:text-5xl">
                {currentSlide.title}
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-7 text-white/90 md:text-base">
                {currentSlide.description}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link to={currentSlide.primaryHref} className="btn rounded-xl bg-white px-6 py-3 text-ink-900 hover:bg-emerald-50">
                  {currentSlide.primaryLabel}
                </Link>
                <Link
                  to={currentSlide.secondaryHref}
                  className="btn rounded-xl border border-white/25 bg-white/10 px-6 py-3 text-white hover:bg-white/15"
                >
                  {currentSlide.secondaryLabel}
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {currentSlide.bullets.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative flex items-end justify-center">
              <img
                src={currentSlide.image}
                alt={currentSlide.title}
                className="h-[240px] w-auto object-contain drop-shadow-[0_18px_32px_rgba(0,0,0,0.24)] md:h-[300px]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-2">
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.title}
                  type="button"
                  onClick={() => setActiveSlide(index)}
                  className={`h-2.5 rounded-full transition ${index === activeSlide ? 'w-8 bg-brand-500' : 'w-2.5 bg-ink-300'}`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveSlide((activeSlide - 1 + heroSlides.length) % heroSlides.length)}
                className="grid h-9 w-9 place-items-center rounded-full border border-[#dbe5e8] bg-white text-ink-700 transition hover:border-brand-300 hover:text-brand-700"
                aria-label="Previous slide"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setActiveSlide((activeSlide + 1) % heroSlides.length)}
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
