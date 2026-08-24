import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function CanvaHero() {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 sm:py-20">
      <div className="container-page">
        {/* Brand Tag from Canva Template */}
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-[#86dedd]" />
          </div>
          <span className="text-sm font-black tracking-tight text-slate-900 uppercase">
            Westmire Wired
          </span>
          <span className="ml-2 rounded-full bg-[#86dedd]/30 px-2.5 py-0.5 text-xs font-bold text-slate-800 border border-[#86dedd]/50">
            📍 Lucknow Exclusive
          </span>
        </div>

        {/* Hero Grid: Typography Left, Floating Product Right */}
        <div className="grid items-center gap-10 lg:grid-cols-12">
          {/* Left Text Column */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-slate-950 leading-[1.08]">
              <span className="block font-medium text-slate-800">The Westmire</span>
              <span className="block font-extrabold text-slate-950">A56 Headset</span>
            </h1>

            <p className="max-w-lg text-base sm:text-lg text-slate-700 font-medium leading-relaxed">
              Experience studio-grade acoustics and certified refurbished tech across Lucknow.
              Doorstep delivery, instant spot cash, and verified quality.
            </p>

            {/* Signature Canva Pill Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/buy"
                className="canva-pill-white text-base font-extrabold"
              >
                Buy Now
              </Link>
              <Link
                to="/buy"
                className="canva-pill-frosted text-base font-extrabold"
              >
                Shop All
              </Link>
            </div>
          </div>

          {/* Right Product Showcase: Floating White Headphone */}
          <div className="lg:col-span-6 flex items-center justify-center relative">
            {/* Ambient soft glow aura */}
            <div className="absolute -inset-4 rounded-full bg-white/40 blur-3xl -z-10 pointer-events-none" />
            <div className="relative group">
              <img
                src="/assets/theme/headphone_hero.jpg"
                alt="The Westmire A56 Headset"
                className="w-full max-w-[440px] sm:max-w-[480px] h-auto object-contain drop-shadow-[0_25px_40px_rgba(15,23,42,0.18)] transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
