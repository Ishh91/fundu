import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Wrench,
  Monitor,
  BatteryCharging,
  Zap,
  Volume2,
  Camera,
  Smartphone,
  Cpu,
  FileCode,
  SlidersHorizontal,
  ScanFace,
  Wifi,
  Vibrate,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Truck,
  Lock,
  BadgeIndianRupee,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Mic,
  PhoneCall,
  Fingerprint,
  Droplets,
  AlertCircle,
} from 'lucide-react';
import { formatINR, formatDisplayPrice } from '../lib/db';
import { getCleanPhoneImage } from '../lib/phoneImages';
import { MASTER_MODEL_CATALOG } from '../data/masterModelCatalog';
import { ALL_INDIAN_PHONES_CATALOG } from '../data/indianPhonesCatalog';
import { useRepairPriceSync, getModelRepairPricing } from '../lib/repairPriceSync';
import { isModelDeleted } from '../lib/catalogSync';

const ISSUE_DETAILS: Record<
  string,
  {
    title: string;
    tagline: string;
    desc: string;
    cost: number;
    time: string;
    warranty: string;
    icon: any;
    note?: string;
    features: string[];
    faqs: Array<{ q: string; a: string }>;
  }
> = {
  screen: {
    title: 'Screen & Display Replacement',
    tagline: 'Get Broken Screen Replaced at Your Home in 30 Minutes',
    desc: 'Cracked glass, blank display, OLED lines, screen flickering, or touch unresponsive? Get original quality screen panel replaced at your doorstep with 6 months warranty.',
    cost: 2999,
    time: '30 Mins Doorstep',
    warranty: '6 Months Warranty',
    icon: Monitor,
    features: [
      'Original OLED / FHD Display Panel',
      'True Tone & Touch Sensitivity Preserved',
      'Tested Zero-Pixel Defect Screen',
      '6 Months Replacement Guarantee',
    ],
    faqs: [
      { q: 'Will Touch ID or Face ID work after screen replacement?', a: 'Yes! Our certified technicians preserve all original sensors including Face ID, Touch ID, and True Tone alignment.' },
      { q: 'How long does doorstep screen replacement take?', a: 'The technician replaces the display panel right in front of your eyes in just 30 minutes.' },
      { q: 'What if the new screen stops working within warranty?', a: 'We offer a 6-month warranty. Any touch or display defect is replaced free of charge at your home.' },
    ],
  },
  battery: {
    title: 'Battery Replacement',
    tagline: 'Restore 100% Battery Life & Fix Fast Draining Issues',
    desc: 'Phone draining fast, battery swelling, phone overheating, or battery health below 75%? Get high-capacity OEM battery installed at your doorstep in 20 minutes.',
    cost: 1499,
    time: '20 Mins Doorstep',
    warranty: '6 Months Warranty',
    icon: BatteryCharging,
    features: [
      'High-Density Original Capacity Battery',
      'Fast Charging & Overheat Protection',
      'Battery Health Status Restored',
      '6 Months Performance Warranty',
    ],
    faqs: [
      { q: 'Will my battery backup improve immediately?', a: 'Yes! You will get 100% full-day battery backup performance just like a brand new phone.' },
      { q: 'Is battery replacement safe for my device motherboard?', a: '100% safe. We use high-quality Li-ion cells with thermal cutoff IC protection.' },
    ],
  },
  charging: {
    title: 'Charging Port',
    tagline: 'Fix Slow Charging & Loose Charger Connection',
    desc: 'Charger cable loose, phone not charging, slow charging error, or liquid in charging port? Quick port and sub-board repair at your doorstep.',
    cost: 699,
    time: '25 Mins Doorstep',
    warranty: '3 Months Warranty',
    icon: Zap,
    features: ['Original Type-C / Lightning Port', 'Fast Charging Supported', 'Mic & Sub-board IC Tested', '3 Months Warranty'],
    faqs: [{ q: 'Will fast charging work after port repair?', a: 'Yes, fast charging (PD / Warp / Dart / VOOC) is 100% supported.' }],
  },
  mic: {
    title: 'Mic Repair & Replacement',
    tagline: 'Fix Muted Audio & Call Voice Issues',
    desc: 'Callers cannot hear you, voice notes have no sound, or mic sounds muffled? Quick microphone repair at your doorstep in 20 minutes.',
    cost: 499,
    time: '20 Mins Doorstep',
    warranty: '3 Months Warranty',
    icon: Mic,
    features: ['HD Voice Pickup Unit', 'Noise Cancellation Tested', 'Clean Audio Recording', '3 Months Warranty'],
    faqs: [{ q: 'Will mic audio be clear during voice calls and recording?', a: 'Yes, crystal clear HD audio recording and phone calls are fully restored.' }],
  },
  speaker: {
    title: 'Speaker Repair & Replacement',
    tagline: 'Fix Crackling Loudspeaker & Low Media Sound',
    desc: 'No sound on videos or music, crackling loudspeaker, or distorted ringtone audio? Fast doorstep speaker replacement.',
    cost: 599,
    time: '20 Mins Doorstep',
    warranty: '3 Months Warranty',
    icon: Volume2,
    features: ['Loud & Clear HD Voice Output', 'Original Loudspeaker Unit', 'Dust Mesh Cleaning Included', '3 Months Warranty'],
    faqs: [{ q: 'Will media sound be loud and clear after repair?', a: 'Yes, loud stereo bass and volume clarity are fully restored.' }],
  },
  receiver: {
    title: 'Receiver / Earpiece Repair',
    tagline: 'Fix Low Caller Voice & Distorted Ear Speaker',
    desc: 'Cannot hear caller during phone calls, buzzing earpiece sound, or low in-call volume? Quick earpiece receiver fix at home.',
    cost: 499,
    time: '20 Mins Doorstep',
    warranty: '3 Months Warranty',
    icon: PhoneCall,
    features: ['Original Earpiece Receiver', 'In-Call Voice Clarity', 'Proximity Sensor Alignment', '3 Months Warranty'],
    faqs: [{ q: 'Will I be able to hear phone calls clearly?', a: 'Yes, in-call ear speaker clarity is 100% restored.' }],
  },
  front_camera: {
    title: 'Front Camera Repair',
    tagline: 'Fix Blurry Selfie Camera & Black Screen',
    desc: 'Scratched selfie lens, blurry front camera, or black screen when opening front camera? Fast doorstep front camera replacement.',
    cost: 999,
    time: '30 Mins Doorstep',
    warranty: '6 Months Warranty',
    icon: Camera,
    features: ['Original OEM Selfie Sensor', 'Face Unlock Alignment', 'Crisp Portrait Photos', '6 Months Warranty'],
    faqs: [{ q: 'Will Face Unlock still work after front camera replacement?', a: 'Yes, our certified technicians carefully align all biometric sensors.' }],
  },
  back_camera: {
    title: 'Back Camera Repair',
    tagline: 'Fix Cracked Rear Lens & Camera Focus Failure',
    desc: 'Cracked rear camera glass lens, blurry focus, camera app black screen, or shaky optical stabilization? Get original camera module installed at your doorstep.',
    cost: 1299,
    time: '30 Mins Doorstep',
    warranty: '6 Months Warranty',
    icon: Camera,
    features: ['Original Sensor & Optical Stabilization', 'Crystal Clear 4K Video Focus', 'Scratch-resistant Glass Lens', '6 Months Warranty'],
    faqs: [{ q: 'Is the camera module original OEM?', a: 'Yes, we use genuine OEM camera modules with full mega-pixel & 4K video clarity.' }],
  },
  camera: {
    title: 'Front & Rear Camera Repair',
    tagline: 'Fix Camera Lens & Focus Issues',
    desc: 'Cracked camera glass lens, blurry focus, camera app black screen, or shaky stabilization? Get original camera module installed at your doorstep.',
    cost: 1299,
    time: '30 Mins Doorstep',
    warranty: '6 Months Warranty',
    icon: Camera,
    features: ['Original Sensor & Optical Stabilization', 'Crystal Clear 4K Video Focus', 'Scratch-resistant Glass Lens', '6 Months Warranty'],
    faqs: [{ q: 'Is the camera module original OEM?', a: 'Yes, we use genuine OEM camera modules with full mega-pixel & 4K video clarity.' }],
  },
  motherboard: {
    title: 'Motherboard IC Repair',
    tagline: 'Expert Chip-Level Diagnostics at TheFundu Lab',
    desc: 'Power IC short circuit, restart loop, dead board, or chip-level failure? Professional micro-soldering and diagnostic lab inspection.',
    cost: 299,
    time: '24 Hr Lab Repair',
    warranty: 'Inspection Diagnostic',
    icon: Cpu,
    note: 'The ₹299 charge is for inspection only. Any repair costs will be confirmed after checking the device at TheFundu.',
    features: ['Micro-soldering & Power IC Fix', 'Ultrasonic PCB De-oxidation', 'Data Extraction Priority', 'Lab Tested Equipment'],
    faqs: [{ q: 'What is the ₹299 inspection charge?', a: 'The ₹299 charge is for inspection only. Any repair costs will be confirmed after checking the device at TheFundu.' }],
  },
  fingerprint: {
    title: 'Fingerprint Sensor Repair',
    tagline: 'Restore Fast Biometric Fingerprint Recognition',
    desc: 'In-display or physical fingerprint scanner unresponsive, Touch ID failure, or enrollment error? Quick sensor replacement at your doorstep.',
    cost: 699,
    time: '25 Mins Doorstep',
    warranty: '3 Months Warranty',
    icon: Fingerprint,
    features: ['High Sensitivity Biometric Sensor', 'Instant Unlock Calibration', 'OEM Matching Flex Cable', '3 Months Warranty'],
    faqs: [{ q: 'Will fingerprint unlock work smoothly after replacement?', a: 'Yes, we test and calibrate biometric enrollment immediately on spot.' }],
  },
  faceid: {
    title: 'Faceid Sensor Repair',
    tagline: 'Restore TrueDepth & Face ID Recognition',
    desc: 'Face ID disabled error, TrueDepth camera alignment, dot projector or proximity sensor issues? Expert laser calibration.',
    cost: 1499,
    time: '45 Mins Doorstep',
    warranty: '6 Months Warranty',
    icon: ScanFace,
    features: ['Dot Projector & Flood Illuminator Fix', 'Infrared Camera Calibration', 'True Tone Alignment', '6 Months Warranty'],
    faqs: [{ q: 'Can disabled Face ID be fixed?', a: 'Yes! Our technicians calibrate the TrueDepth infrared sensor module to restore Face ID unlock.' }],
  },
  water_damage: {
    title: 'Water Damaged / Dead Phone Diagnosis',
    tagline: 'Emergency De-oxidation & Revival for Liquid Damaged Phones',
    desc: 'Phone dropped in water, liquid detected, or phone completely dead? Advanced ultrasonic cleaning and power IC testing.',
    cost: 199,
    time: '24 Hr Lab Repair',
    warranty: 'Inspection Diagnostic',
    icon: Droplets,
    note: 'The ₹199 charge is for inspection only. Any repair costs will be confirmed after checking the device at TheFundu.',
    features: ['Ultrasonic Chemical Bath', 'Liquid De-oxidation Treatment', 'Short Circuit Power Tracing', 'Safe Data Recovery Protocol'],
    faqs: [{ q: 'What is the ₹199 inspection charge?', a: 'The ₹199 charge is for inspection only. Any repair costs will be confirmed after checking the device at TheFundu.' }],
  },
};

export default function RepairIssuePage() {
  const { issueSlug } = useParams<{ issueSlug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const issueCleanKey = useMemo(() => {
    if (!issueSlug) return 'screen';
    return issueSlug.toLowerCase();
  }, [issueSlug]);

  const issueData = ISSUE_DETAILS[issueCleanKey] || ISSUE_DETAILS.screen;
  const IssueIcon = issueData.icon;

  const { configs: repairConfigs } = useRepairPriceSync();

  const [selectedBrand, setSelectedBrand] = useState<string>('Apple');
  const [selectedModel, setSelectedModel] = useState<string>('iPhone 15');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const brandOptions = [
    'Apple',
    'Samsung',
    'OnePlus',
    'Xiaomi',
    'Vivo',
    'Realme',
    'Oppo',
    'Google',
    'Motorola',
    'Nothing',
  ];

  const availableModelsForBrand = useMemo(() => {
    const bLower = selectedBrand.toLowerCase().trim();

    // 1. Admin models from repairConfigs
    const adminModels = (repairConfigs || [])
      .filter((c) => (c.brand || '').toLowerCase().trim() === bLower && c.is_active !== false)
      .map((c) => c.model);

    const adminSet = new Set(adminModels.map((m) => m.toLowerCase().replace(/[\s-]+/g, '')));

    // 2. Catalog models
    const catalogModels = ALL_INDIAN_PHONES_CATALOG
      .filter((p) => p.brand.toLowerCase().trim() === bLower && !adminSet.has(p.model.toLowerCase().replace(/[\s-]+/g, '')))
      .map((p) => p.model);

    const catSet = new Set([...adminSet, ...catalogModels.map((m) => m.toLowerCase().replace(/[\s-]+/g, ''))]);

    // 3. Master models
    const masterModels = MASTER_MODEL_CATALOG
      .filter((m) => m.brand.toLowerCase().trim() === bLower && !catSet.has(m.model.toLowerCase().replace(/[\s-]+/g, '')))
      .map((m) => m.model);

    const combined = [...adminModels, ...catalogModels, ...masterModels].filter(
      (m) => !isModelDeleted(selectedBrand, m)
    );

    return combined.length > 0 ? combined : ['Generic Phone'];
  }, [selectedBrand, repairConfigs]);

  useEffect(() => {
    if (!availableModelsForBrand.includes(selectedModel)) {
      setSelectedModel(availableModelsForBrand[0] || 'iPhone 15');
    }
  }, [availableModelsForBrand, selectedModel]);

  // Dynamic pricing for selected device and issue
  const selectedModelPricing = useMemo(() => {
    return getModelRepairPricing(selectedBrand, selectedModel, 'smartphone', repairConfigs);
  }, [selectedBrand, selectedModel, repairConfigs]);

  const matchedService = useMemo(() => {
    return selectedModelPricing.services.find((s) => s.service_id === issueCleanKey);
  }, [selectedModelPricing, issueCleanKey]);

  const currentPrice = matchedService?.price ?? issueData.cost;
  const currentWarranty = matchedService?.warranty ?? issueData.warranty;
  const currentTime = matchedService?.turnaround_time ?? issueData.time;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [issueSlug]);

  const handleStartBooking = () => {
    const targetUrl = `/repair?step=4&brand=${encodeURIComponent(selectedBrand)}&model=${encodeURIComponent(selectedModel)}&issue=${encodeURIComponent(issueCleanKey)}`;
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(targetUrl)}`);
      return;
    }
    navigate(targetUrl);
  };

  return (
    <div className="min-h-screen bg-[#f4f7f8] pb-24">
      {/* BREADCRUMB */}
      <div className="bg-white border-b border-gray-100 py-2.5 px-4 text-xs font-semibold text-gray-500">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 flex-wrap">
          <Link to="/repair" className="hover:text-purple-700">Home</Link>
          <span>&gt;</span>
          <Link to="/repair" className="hover:text-purple-700">Doorstep Mobile Repair</Link>
          <span>&gt;</span>
          <span className="text-purple-700 font-extrabold">{issueData.title}</span>
        </div>
      </div>

      {/* HERO BANNER */}
      <section className="py-8 px-4 bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-bold">
              <IssueIcon className="h-4 w-4 text-purple-400" /> {currentTime} Guarantee
            </div>
            <h1 className="font-display text-2xl md:text-4xl font-black text-white">
              {issueData.title} at your doorstep
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {issueData.desc}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="badge bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold px-3 py-1">
                From {formatDisplayPrice(currentPrice, !!user)}
              </span>
              <span className="badge bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold px-3 py-1">
                🛡️ {currentWarranty}
              </span>
              <span className="badge bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold px-3 py-1">
                📍 Free Doorstep Visit
              </span>
            </div>
          </div>

          {/* Quick Booking Box */}
          <div className="w-full md:w-96 bg-white text-slate-900 p-6 rounded-3xl shadow-2xl space-y-4 shrink-0">
            <h3 className="font-display font-black text-lg text-slate-900 border-b border-gray-100 pb-2">
              Book {issueData.title}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Select Brand</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="input text-xs w-full py-2.5 bg-gray-50 border-gray-300 font-bold"
                >
                  {brandOptions.map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Select Model</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="input text-xs w-full py-2.5 bg-gray-50 border-gray-300 font-bold"
                >
                  {availableModelsForBrand.map((model) => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>

              {/* Price Display */}
              <div className="bg-purple-50 p-3 rounded-2xl border border-purple-100 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-700">Estimated Price:</span>
                  <span className="text-base font-black text-purple-700">{formatDisplayPrice(currentPrice, !!user)}</span>
                </div>
                {!user && (
                  <button
                    type="button"
                    onClick={() => {
                      const targetUrl = `/repair?step=4&brand=${encodeURIComponent(selectedBrand)}&model=${encodeURIComponent(selectedModel)}&issue=${encodeURIComponent(issueCleanKey)}`;
                      navigate(`/login?redirect=${encodeURIComponent(targetUrl)}`);
                    }}
                    className="text-[11px] font-bold text-purple-700 hover:text-purple-900 underline flex items-center justify-end gap-1 cursor-pointer transition w-full"
                  >
                    <Lock className="h-3 w-3" /> Know exact price? Login to view
                  </button>
                )}
              </div>

              {issueData.note && (
                <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-1.5 leading-snug">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <span><strong>Note:</strong> {issueData.note}</span>
                </div>
              )}

              {/* Selected Phone Live Thumbnail */}
              <div className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-2xl border border-gray-200/80">
                <div className="h-12 w-12 rounded-xl bg-white p-1 border border-gray-100 flex items-center justify-center shrink-0 shadow-xs">
                  <img
                    src={getCleanPhoneImage(selectedBrand, selectedModel)}
                    alt={selectedModel}
                    className="max-h-full max-w-full w-auto h-auto object-contain mix-blend-multiply"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">{selectedModel}</p>
                  <p className="text-[11px] text-gray-500 font-semibold">{selectedBrand} · Instant Doorstep Fix</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleStartBooking}
                className="btn bg-purple-600 hover:bg-purple-700 text-white w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition"
              >
                <Wrench className="h-4 w-4" /> Book Doorstep Repair Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICE FEATURES */}
      <div className="max-w-7xl mx-auto px-4 mt-8 space-y-8">
        <div className="card p-8 rounded-[32px] bg-white border border-gray-200 shadow-md space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="badge bg-purple-50 text-purple-700 text-xs font-bold">Service Assurance</span>
            <h2 className="font-display text-2xl font-black text-gray-900">Key Features of Our {issueData.title}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {issueData.features.map((feat, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-purple-700 shrink-0 mt-0.5" />
                <p className="font-bold text-xs text-gray-800 leading-snug">{feat}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQS */}
        <div className="card p-8 rounded-[32px] bg-white border border-gray-200 space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="badge bg-purple-50 text-purple-700 text-xs font-bold">Frequently Asked Questions</span>
            <h2 className="font-display text-2xl font-black text-gray-900">
              {issueData.title} FAQs
            </h2>
          </div>

          <div className="space-y-3 max-w-4xl mx-auto">
            {issueData.faqs.map((f, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 text-left font-bold text-sm text-gray-900 flex items-center justify-between gap-4 hover:bg-purple-50/30 transition cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-purple-600 shrink-0" /> {f.q}
                    </span>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/50">
                      {f.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
