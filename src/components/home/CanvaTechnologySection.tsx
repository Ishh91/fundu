import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, Truck } from 'lucide-react';

export default function CanvaTechnologySection() {
  return (
    <section className="relative overflow-hidden py-14 sm:py-20">
      <div className="container-page">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          {/* Left Text Column */}
          <div className="lg:col-span-6 space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-950">
              All-new technology
            </h2>

            <div className="space-y-4 text-base sm:text-lg text-slate-700 font-medium leading-relaxed max-w-xl">
              <p>
                News write-ups offer a great way to let clients know about new products and services,
                events, awards, and more. News write-ups offer a great way to let clients know about new
                products and services, events, awards, and more.
              </p>
              <p className="text-slate-600 text-sm sm:text-base">
                Every smartphone, laptop, and gadget goes through our rigorous 32-point inspection
                with instant doorstep cash payment and 6 months replacement warranty in Lucknow.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="flex items-center gap-2 rounded-2xl bg-white/80 backdrop-blur-md p-3.5 border border-white/80 shadow-sm">
                <Zap className="h-5 w-5 text-teal-600 shrink-0" />
                <span className="text-xs font-bold text-slate-900 leading-tight">Instant Spot Cash</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-white/80 backdrop-blur-md p-3.5 border border-white/80 shadow-sm">
                <ShieldCheck className="h-5 w-5 text-teal-600 shrink-0" />
                <span className="text-xs font-bold text-slate-900 leading-tight">32-Point Check</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-white/80 backdrop-blur-md p-3.5 border border-white/80 shadow-sm">
                <Truck className="h-5 w-5 text-teal-600 shrink-0" />
                <span className="text-xs font-bold text-slate-900 leading-tight">Lucknow Pickup</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/sell"
                className="canva-pill-white font-extrabold"
              >
                Sell Your Device
              </Link>
            </div>
          </div>

          {/* Right Column: Signature Canva Asymmetric Arch Card */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="canva-arch-card w-full max-w-[520px] aspect-[4/3] relative group overflow-hidden bg-white/60">
              <img
                src="/assets/theme/tech_device.jpg"
                alt="All-new technology"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
