import { Link } from 'react-router-dom';
import { MapPin, Phone } from 'lucide-react';

export default function CanvaSupportSection() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      <div className="container-page">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          {/* Left Text & Location Info */}
          <div className="lg:col-span-6 space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-950">
              Expert Support
            </h2>

            <p className="text-base sm:text-lg text-slate-700 font-medium leading-relaxed max-w-xl">
              Faulty phone battery? Slow laptop? We have in-house tech experts who can assist you.
            </p>

            <div>
              <Link
                to="/repair"
                className="inline-flex items-center gap-2 text-base font-bold text-slate-900 hover:text-teal-700 underline underline-offset-4 decoration-2"
              >
                <span>Visit us in stores!</span>
              </Link>
            </div>

            {/* Our Locations */}
            <div className="pt-4 space-y-3">
              <h4 className="text-xs font-black tracking-widest text-slate-950 uppercase">
                OUR LOCATIONS
              </h4>

              <div className="space-y-2.5 text-sm text-slate-700 font-medium">
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-teal-600 shrink-0" />
                  <span><strong>Hazratganj Flagship:</strong> MG Marg, Near Cathedral, Lucknow</span>
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-teal-600 shrink-0" />
                  <span><strong>Gomti Nagar Super Hub:</strong> Viram Khand 1, Patrakarpuram, Lucknow</span>
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-teal-600 shrink-0" />
                  <span><strong>Doorstep Coverage:</strong> Indira Nagar, Aliganj, Mahanagar, Ashiyana</span>
                </p>
                <p className="flex items-center gap-2 text-slate-600 text-xs pt-1">
                  <Phone className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                  <span>+91 98765 43210 &nbsp;|&nbsp; 10:00 AM – 9:00 PM (All Days)</span>
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/repair"
                className="canva-pill-white font-extrabold"
              >
                Book Doorstep Repair
              </Link>
            </div>
          </div>

          {/* Right Column: Signature Canva Asymmetric Arch Card */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="canva-arch-card w-full max-w-[520px] aspect-[4/3] relative group overflow-hidden bg-white/60">
              <img
                src="/assets/theme/expert_support.jpg"
                alt="Expert Support in Lucknow"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
