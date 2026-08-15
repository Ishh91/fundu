import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench,
  Monitor,
  BatteryCharging,
  Zap,
  Camera,
  Volume2,
  ShieldCheck,
  Clock,
  CheckCircle2,
  ArrowRight,
  MapPin,
} from 'lucide-react';
import { formatINR } from '../../lib/db';

const REPAIR_SERVICES = [
  {
    id: 'screen',
    title: 'Screen Replacement',
    icon: Monitor,
    desc: 'Cracked glass, lines on display, or dead touch.',
    estTime: '30 Mins',
    warranty: '6 Months',
    priceFrom: 1499,
    bgIcon: 'bg-teal-100 text-teal-700',
  },
  {
    id: 'battery',
    title: 'Battery Replacement',
    icon: BatteryCharging,
    desc: 'Battery draining fast, phone heating, or swelling.',
    estTime: '20 Mins',
    warranty: '6 Months',
    priceFrom: 999,
    bgIcon: 'bg-emerald-100 text-emerald-700',
  },
  {
    id: 'charging',
    title: 'Charging Port Repair',
    icon: Zap,
    desc: 'Slow charging, loose cable fit, or no charging.',
    estTime: '25 Mins',
    warranty: '3 Months',
    priceFrom: 499,
    bgIcon: 'bg-amber-100 text-amber-700',
  },
  {
    id: 'camera',
    title: 'Camera Lens Repair',
    icon: Camera,
    desc: 'Broken camera glass, blurry focus, or black camera.',
    estTime: '30 Mins',
    warranty: '6 Months',
    priceFrom: 899,
    bgIcon: 'bg-purple-100 text-purple-700',
  },
  {
    id: 'speaker',
    title: 'Mic & Speaker Repair',
    icon: Volume2,
    desc: 'Low sound on calls, distorted audio, or mic mute.',
    estTime: '20 Mins',
    warranty: '3 Months',
    priceFrom: 599,
    bgIcon: 'bg-blue-100 text-blue-700',
  },
];

export default function RepairShowcase() {
  const [selectedIssue, setSelectedIssue] = useState<string>('screen');

  return (
    <section className="container-page py-8">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 md:p-10 shadow-sm">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-amber-700">
                Doorstep Repair Hub
              </span>
              <span className="text-xs font-semibold text-gray-500">
                📍 Repaired in 30 Mins across Lucknow
              </span>
            </div>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-gray-900">
              Mobile Screen & Battery Repair at Your Doorstep
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-gray-600">
              Certified technician visits your home or office in Lucknow. Repaired right in front of you with 6M warranty.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/repair"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-500 hover:bg-teal-600 px-5 py-3 text-sm font-bold text-white shadow-md transition"
            >
              <Wrench className="h-4 w-4" />
              <span>Book Doorstep Repair</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Repair Issues Grid */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {REPAIR_SERVICES.map((srv) => {
            const Icon = srv.icon;
            const isSelected = selectedIssue === srv.id;
            return (
              <div
                key={srv.id}
                onClick={() => setSelectedIssue(srv.id)}
                className={`cursor-pointer rounded-2xl border p-4 transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'border-2 border-teal-500 bg-teal-50/40 shadow-md'
                    : 'border-gray-200 bg-[#f8fafc] hover:border-teal-300 hover:bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className={`grid h-10 w-10 place-items-center rounded-xl ${srv.bgIcon}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-white border border-gray-200 px-2 py-0.5 text-[10px] font-bold text-gray-600">
                      {srv.estTime}
                    </span>
                  </div>

                  <h3 className="mt-3 text-sm font-bold text-gray-900">{srv.title}</h3>
                  <p className="mt-1 text-[11px] leading-relaxed text-gray-500">{srv.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-gray-400 block">Starts from</span>
                    <span className="text-sm font-black text-gray-900">{formatINR(srv.priceFrom)}</span>
                  </div>
                  <Link
                    to={`/repair?issue=${srv.id}`}
                    className="rounded-lg bg-teal-500 px-2.5 py-1 text-xs font-bold text-white hover:bg-teal-600 shadow-sm"
                  >
                    Book
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Lucknow Repair Guarantees Strip */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-4 rounded-2xl bg-gray-50 p-4 border border-gray-100">
          <div className="flex items-center gap-2.5">
            <Clock className="h-4 w-4 text-teal-600 shrink-0" />
            <span className="text-xs font-bold text-gray-700">30-Min Instant Doorstep Repair</span>
          </div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-4 w-4 text-teal-600 shrink-0" />
            <span className="text-xs font-bold text-gray-700">Up to 6 Months Replacement Warranty</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
            <span className="text-xs font-bold text-gray-700">100% Genuine Tested Spare Parts</span>
          </div>
          <div className="flex items-center gap-2.5">
            <MapPin className="h-4 w-4 text-teal-600 shrink-0" />
            <span className="text-xs font-bold text-gray-700">Free Visit across all Lucknow Localities</span>
          </div>
        </div>
      </div>
    </section>
  );
}
