import React, { useEffect, useState, useRef } from 'react';
import {
  MapPin,
  Phone,
  Truck,
  ShieldCheck,
  Zap,
  Clock,
  CheckCircle2,
  X,
  Navigation,
  Sparkles,
  Share2,
  Award,
  CircleDot,
} from 'lucide-react';

export type TrackerProps = {
  isOpen: boolean;
  onClose: () => void;
  locality: string;
  executiveName?: string | null;
  executivePhone?: string | null;
  orderType: 'sell' | 'repair' | 'buy';
  deviceInfo: string;
  trackingId?: string;
};

// Real GPS Centroids for Lucknow Localities
const LUCKNOW_GEO: Record<string, { x: number; y: number; label: string }> = {
  'hazratganj': { x: 48, y: 52, label: 'Hazratganj, Central Lucknow' },
  'gomti nagar': { x: 74, y: 44, label: 'Gomti Nagar, East Lucknow' },
  'indira nagar': { x: 68, y: 32, label: 'Indira Nagar, North-East' },
  'aliganj': { x: 42, y: 28, label: 'Aliganj, North Lucknow' },
  'mahanagar': { x: 50, y: 38, label: 'Mahanagar, Central-North' },
  'ashiyana': { x: 38, y: 76, label: 'Ashiyana, South Lucknow' },
  'charbagh': { x: 44, y: 64, label: 'Charbagh, Station Hub' },
  'chowk': { x: 30, y: 40, label: 'Chowk, Old Lucknow' },
  'jankipuram': { x: 52, y: 18, label: 'Jankipuram, Outer North' },
  'vikas nagar': { x: 58, y: 26, label: 'Vikas Nagar, Sector 4' },
  'alambagh': { x: 36, y: 68, label: 'Alambagh, South-West' },
  'gomti nagar extension': { x: 84, y: 58, label: 'Gomti Nagar Extn, Shaheed Path' },
  'telibagh': { x: 46, y: 82, label: 'Telibagh, South Cantt' },
  'rajajipuram': { x: 24, y: 56, label: 'Rajajipuram, West Lucknow' },
};

export default function LiveExecutiveTracker({
  isOpen,
  onClose,
  locality,
  executiveName = 'Rohit Verma',
  executivePhone = '+91 98391 22345',
  orderType,
  deviceInfo,
  trackingId,
}: TrackerProps) {
  const [progress, setProgress] = useState(35); // 0% to 100%
  const [speed, setSpeed] = useState(32); // km/h
  const [distanceKm, setDistanceKm] = useState(2.8); // km
  const [etaMins, setEtaMins] = useState(14);
  const [statusStep, setStatusStep] = useState<'dispatched' | 'on_the_way' | 'nearby' | 'arrived'>('on_the_way');

  // Match target locality
  const cleanLoc = locality ? locality.toLowerCase().trim() : 'gomti nagar';
  const matchedKey = Object.keys(LUCKNOW_GEO).find((k) => cleanLoc.includes(k)) || 'gomti nagar';
  const targetPos = LUCKNOW_GEO[matchedKey];

  // Starting hub (Hazratganj central dispatch hub)
  const startPos = { x: 48, y: 52 };

  // Animate moving marker along path
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) {
          setStatusStep('arrived');
          setDistanceKm(0.1);
          setEtaMins(1);
          setSpeed(0);
          return 100;
        }
        const next = prev + 1.2;
        const remainingRatio = 1 - next / 100;
        setDistanceKm(Number((remainingRatio * 3.5).toFixed(1)));
        setEtaMins(Math.max(1, Math.round(remainingRatio * 18)));
        setSpeed(28 + Math.floor(Math.random() * 8));

        if (next > 80) setStatusStep('nearby');
        else if (next > 20) setStatusStep('on_the_way');
        return next;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  // Compute current live position along trajectory
  const currentX = startPos.x + (targetPos.x - startPos.x) * (progress / 100);
  const currentY = startPos.y + (targetPos.y - startPos.y) * (progress / 100);

  const actionText =
    orderType === 'sell'
      ? 'Doorstep Phone Pickup'
      : orderType === 'repair'
      ? '30-Min Doorstep Screen/Battery Repair'
      : 'Refurbished Phone Delivery';

  const isAssigned = Boolean(
    executiveName &&
    !executiveName.toLowerCase().includes('auto-dispatch') &&
    !executiveName.toLowerCase().includes('auto-assign') &&
    !executiveName.toLowerCase().includes('field executive') &&
    executiveName !== 'Pending Rider'
  );

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-3 sm:p-4 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-gray-100 overflow-hidden my-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-[#0f172a] px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="relative grid h-10 w-10 place-items-center rounded-2xl bg-teal-500 text-white shadow-glow">
              <Truck className="h-5 w-5 animate-pulse" />
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-400 border-2 border-[#0f172a] animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-base sm:text-lg">
                  {isAssigned ? 'Live Executive Tracking' : 'Dispatch Assignment in Progress'}
                </h3>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                  isAssigned
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                    : 'bg-amber-500/20 border border-amber-500/40 text-amber-300 animate-pulse'
                }`}>
                  {isAssigned ? 'GPS Active' : 'Admin Assigning Rider'}
                </span>
              </div>
              <p className="text-xs text-teal-200">
                {actionText} • {deviceInfo}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Live Lucknow Visual Map Canvas */}
        <div className="relative h-64 sm:h-72 w-full bg-[#1e293b] overflow-hidden select-none">
          {/* Map Grid Pattern */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'radial-gradient(#14c8ba 1.5px, transparent 1.5px), radial-gradient(#38bdf8 1.5px, #1e293b 1.5px)',
              backgroundSize: '30px 30px',
              backgroundPosition: '0 0, 15px 15px',
            }}
          />

          {/* Gomti River Vector Accent */}
          <svg className="absolute inset-0 h-full w-full pointer-events-none opacity-40">
            <path
              d="M 0,220 Q 150,180 300,190 T 600,120 T 900,140"
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              d="M 0,220 Q 150,180 300,190 T 600,120 T 900,140"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="4"
              strokeDasharray="8,6"
            />
          </svg>

          {/* Static Landmark Labels in Lucknow */}
          <div className="absolute left-4 top-4 rounded-md bg-black/60 px-2 py-1 text-[10px] font-bold text-gray-300 backdrop-blur-sm border border-white/10">
            📍 Lucknow Central Hub (Hazratganj)
          </div>
          <div className="absolute right-4 top-4 rounded-md bg-black/60 px-2 py-1 text-[10px] font-bold text-teal-300 backdrop-blur-sm border border-white/10">
            🏙️ Gomti Riverfront
          </div>
          <div className="absolute right-4 bottom-4 rounded-md bg-black/60 px-2 py-1 text-[10px] font-bold text-gray-300 backdrop-blur-sm border border-white/10">
            🛣️ Shaheed Path Express
          </div>

          {/* Trajectory Route Line */}
          <svg className="absolute inset-0 h-full w-full pointer-events-none">
            <line
              x1={`${startPos.x}%`}
              y1={`${startPos.y}%`}
              x2={`${targetPos.x}%`}
              y2={`${targetPos.y}%`}
              stroke={isAssigned ? '#14c8ba' : '#38bdf8'}
              strokeWidth="4"
              strokeDasharray="6,6"
              className="animate-pulse"
            />
          </svg>

          {/* Start Hub Pin (Hazratganj) */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center pointer-events-none"
            style={{ left: `${startPos.x}%`, top: `${startPos.y}%` }}
          >
            <div className="h-3 w-3 rounded-full bg-cyan-400 border border-white shadow-md" />
          </div>

          {/* Destination Pin (Customer Address) */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
            style={{ left: `${targetPos.x}%`, top: `${targetPos.y}%` }}
          >
            {/* Label placed ABOVE the marker to prevent collision */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap z-30">
              <span className="rounded-md bg-[#042f2e]/95 px-2 py-0.5 text-[10px] font-black text-emerald-300 shadow-xl border border-emerald-500/50 backdrop-blur-xs">
                🏠 Your Doorstep ({targetPos.label.split(',')[0]})
              </span>
            </div>

            <div className="relative">
              <span className="absolute -inset-2 rounded-full bg-emerald-400/40 animate-ping" />
              <div className="grid h-8 w-8 place-items-center rounded-full bg-emerald-500 text-white shadow-xl border-2 border-white">
                <MapPin className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Live Moving Bike / Executive Marker */}
          {isAssigned ? (
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center transition-all duration-1000 ease-linear"
              style={{ left: `${currentX}%`, top: `${currentY}%` }}
            >
              <div className="relative">
                <span className="absolute -inset-3 rounded-full bg-teal-400/40 animate-pulse" />
                <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-tr from-teal-600 to-cyan-400 text-white shadow-2xl border-2 border-white">
                  <Navigation className="h-4.5 w-4.5 rotate-45" />
                </div>
              </div>
              
              {/* Label placed BELOW the marker to avoid overlap */}
              <div className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap z-30">
                <div className="flex items-center gap-1 rounded-full bg-[#0f172a]/95 border border-teal-400 px-2.5 py-0.5 text-[10px] font-black text-white shadow-xl">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>{executiveName?.split(' ')[0]} (On Bike)</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-black/40 backdrop-blur-xs z-30 pointer-events-none">
              <div className="rounded-2xl bg-black/80 border border-teal-500/40 p-4 text-center text-white max-w-xs shadow-2xl space-y-1">
                <p className="text-xs font-black text-teal-300">⚡ Order Verified at Hazratganj Hub</p>
                <p className="text-[11px] text-gray-300">
                  Admin is assigning certified rider for doorstep pickup/delivery in {targetPos.label.split(',')[0]}.
                </p>
              </div>
            </div>
          )}

          {/* Live Telemetry Float Box */}
          {isAssigned && (
            <div className="absolute left-4 bottom-4 rounded-2xl bg-black/80 backdrop-blur-md p-3 text-white border border-white/10 flex items-center gap-4 text-xs shadow-xl z-30">
              <div>
                <p className="text-[10px] font-bold uppercase text-teal-400">Live ETA</p>
                <p className="text-sm font-black">{etaMins} mins</p>
              </div>
              <div className="h-6 w-px bg-white/20" />
              <div>
                <p className="text-[10px] font-bold uppercase text-gray-400">Distance</p>
                <p className="text-sm font-bold">{distanceKm} km</p>
              </div>
              <div className="h-6 w-px bg-white/20" />
              <div>
                <p className="text-[10px] font-bold uppercase text-gray-400">Speed</p>
                <p className="text-sm font-bold">{speed} km/h</p>
              </div>
            </div>
          )}
        </div>

        {/* Executive Profile & Quick Actions */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-gray-50 p-4 border border-gray-200">
            <div className="flex items-center gap-3.5">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-teal-100 text-teal-800 font-display font-black text-lg border-2 border-teal-200">
                {executiveName?.charAt(0) || 'R'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-display font-bold text-base text-gray-900">
                    {executiveName}
                  </h4>
                  <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Verified Agent
                  </span>
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                  <span>🏍️ Hero Splendor (UP 32 AB 1234)</span>
                  <span>•</span>
                  <span className="font-bold text-amber-600">★ 4.9 Rating</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`tel:${executivePhone}`}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500 hover:bg-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-md transition active:scale-95"
              >
                <Phone className="h-4 w-4" />
                <span>Call Executive</span>
              </a>
            </div>
          </div>

          {/* 4 Status Progress Nodes */}
          <div className="grid grid-cols-4 gap-2 pt-2">
            {[
              { id: 'dispatched', label: 'Assigned', time: '10:00 AM' },
              { id: 'on_the_way', label: 'On The Way', time: '10:15 AM' },
              { id: 'nearby', label: 'Near You (1 km)', time: '10:25 AM' },
              { id: 'arrived', label: 'At Doorstep', time: '10:30 AM' },
            ].map((node, i) => {
              const isPast =
                (statusStep === 'on_the_way' && i <= 1) ||
                (statusStep === 'nearby' && i <= 2) ||
                (statusStep === 'arrived' && i <= 3);
              return (
                <div key={node.id} className="text-center">
                  <div
                    className={`h-1.5 w-full rounded-full transition-all ${
                      isPast ? 'bg-teal-500' : 'bg-gray-200'
                    }`}
                  />
                  <p
                    className={`mt-2 text-[11px] font-bold ${
                      isPast ? 'text-teal-700' : 'text-gray-400'
                    }`}
                  >
                    {node.label}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Safety & Payout Note */}
          <div className="rounded-xl bg-teal-50/70 p-3 text-xs text-teal-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-semibold">
              <Zap className="h-4 w-4 text-teal-600 shrink-0" />
              {orderType === 'sell'
                ? 'Instant UPI / Cash payment will be transferred on the spot before phone handover.'
                : 'Inspect and test completely before paying.'}
            </span>
            {trackingId && (
              <span className="font-mono font-bold text-[11px] text-teal-900 bg-white px-2 py-0.5 rounded border border-teal-200">
                #{trackingId}
              </span>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════
              CONNECT WITH ADMIN DESK IN TRACKING
             ══════════════════════════════════════════════════════════ */}
          <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black text-teal-300 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> Need Delivery Assistance? Connect with Admin
                </p>
                <p className="text-[11px] text-gray-300 mt-0.5">
                  Direct support from Lucknow Central Desk for route updates or address change.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/919839122345?text=${encodeURIComponent(
                    `Hi Fundu Admin, I am currently tracking my ${actionText} (#${trackingId || 'LIVE'}) for ${deviceInfo} in ${locality || 'Lucknow'}. Please assist me with live delivery updates.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white px-3 py-1.5 text-xs font-bold transition shadow-sm"
                >
                  <span>WhatsApp Admin</span>
                </a>
                <a
                  href="tel:+919839122345"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white px-3 py-1.5 text-xs font-bold transition border border-white/20"
                >
                  <Phone className="h-3.5 w-3.5 text-teal-400" />
                  <span>Call Desk</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
