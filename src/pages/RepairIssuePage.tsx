import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
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
} from 'lucide-react';
import { formatINR } from '../lib/db';
import { MASTER_MODEL_CATALOG } from './SellPhone';

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
    features: string[];
    faqs: Array<{ q: string; a: string }>;
  }
> = {
  screen: {
    title: 'Doorstep Screen & Display Replacement',
    tagline: 'Get Broken Screen Replaced at Your Home in 30 Minutes',
    desc: 'Cracked glass, blank display, OLED lines, screen flickering, or touch unresponsive? Get original quality screen panel replaced at your doorstep in Lucknow with 6 months warranty.',
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
    title: 'Doorstep Mobile Battery Replacement',
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
    title: 'Charging Port & Sub-board IC Repair',
    tagline: 'Fix Slow Charging & Loose Charger Connection',
    desc: 'Charger cable loose, phone not charging, slow charging error, or liquid in charging port? Quick sub-board repair at your home.',
    cost: 699,
    time: '25 Mins Doorstep',
    warranty: '3 Months Warranty',
    icon: Zap,
    features: ['Original Type-C / Lightning Port', 'Fast Charging Supported', 'Mic & Sub-board IC Tested', '3 Months Warranty'],
    faqs: [{ q: 'Will fast charging work after port repair?', a: 'Yes, fast charging (PD / Warp / Dart / VOOC) is 100% supported.' }],
  },
  camera: {
    title: 'Front & Rear Camera Module Replacement',
    tagline: 'Fix Blurry Lens, Black Screen & Focus Failure',
    desc: 'Cracked camera glass lens, blurry focus, camera app black screen, or shaky optical stabilization? Get original camera module installed at your doorstep.',
    cost: 1299,
    time: '30 Mins Doorstep',
    warranty: '6 Months Warranty',
    icon: Camera,
    features: ['Original Sensor & Optical Stabilization', 'Crystal Clear 4K Video Focus', 'Scratch-resistant Glass Lens', '6 Months Warranty'],
    faqs: [{ q: 'Is the camera module original OEM?', a: 'Yes, we use genuine OEM camera modules with full mega-pixel & 4K video clarity.' }],
  },
  speaker: {
    title: 'Mic, Earpiece & Speaker Repair',
    tagline: 'Fix Low Call Volume & Crackling Sound',
    desc: 'Cannot hear caller voice, crackling speaker sound, or muted microphone on calls? Fast doorstep speaker replacement.',
    cost: 599,
    time: '20 Mins Doorstep',
    warranty: '3 Months Warranty',
    icon: Volume2,
    features: ['Loud & Clear HD Voice Output', 'Original Receiver & Mic Unit', 'Dust Mesh Cleaning Included', '3 Months Warranty'],
    faqs: [{ q: 'Will call audio be clear after repair?', a: 'Yes, HD voice call clarity is fully restored.' }],
  },
  motherboard: {
    title: 'Water Damage & Motherboard IC Repair',
    tagline: 'Expert Lab Diagnosis for Dead & Water Damaged Phones',
    desc: 'Mobile dropped in water, dead phone short circuit, or power IC failure? Advanced ultrasonic cleaning & chip-level motherboard diagnosis.',
    cost: 499,
    time: '24 Hr Lab Repair',
    warranty: 'Lab Diagnostics',
    icon: Cpu,
    features: ['Micro-soldering & Power IC Fix', 'Ultrasonic PCB Liquid De-oxidation', 'Data Extraction Priority', 'Lab Tested'],
    faqs: [{ q: 'Can water-damaged dead phones be repaired?', a: 'Yes! Over 85% of water-damaged phones are successfully revived by our lab engineers.' }],
  },
};

export default function RepairIssuePage() {
  const { issueSlug } = useParams<{ issueSlug: string }>();
  const navigate = useNavigate();

  const issueCleanKey = useMemo(() => {
    if (!issueSlug) return 'screen';
    return issueSlug.toLowerCase();
  }, [issueSlug]);

  const issueData = ISSUE_DETAILS[issueCleanKey] || ISSUE_DETAILS.screen;
  const IssueIcon = issueData.icon;

  const [selectedBrand, setSelectedBrand] = useState('Apple');
  const [selectedModel, setSelectedModel] = useState('iPhone 13');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [issueSlug]);

  const handleStartBooking = () => {
    navigate(`/repair?step=2&brand=${encodeURIComponent(selectedBrand)}&model=${encodeURIComponent(selectedModel)}&issue=${encodeURIComponent(issueCleanKey)}`);
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
              <IssueIcon className="h-4 w-4 text-purple-400" /> {issueData.time} Guarantee
            </div>
            <h1 className="font-display text-2xl md:text-4xl font-black text-white">
              {issueData.title} in Lucknow
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {issueData.desc}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="badge bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold px-3 py-1">
                From {formatINR(issueData.cost)}
              </span>
              <span className="badge bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold px-3 py-1">
                🛡️ {issueData.warranty}
              </span>
              <span className="badge bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold px-3 py-1">
                📍 Free Lucknow Doorstep Visit
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
                  onChange={(e) => {
                    setSelectedBrand(e.target.value);
                    if (e.target.value === 'Apple') setSelectedModel('iPhone 13');
                    else if (e.target.value === 'Samsung') setSelectedModel('Galaxy S22');
                    else setSelectedModel('OnePlus 11R');
                  }}
                  className="input text-xs w-full py-2.5 bg-gray-50 border-gray-300 font-bold"
                >
                  <option value="Apple">Apple iPhone</option>
                  <option value="Samsung">Samsung Galaxy</option>
                  <option value="OnePlus">OnePlus</option>
                  <option value="Xiaomi">Xiaomi / Redmi</option>
                  <option value="Vivo">Vivo</option>
                  <option value="Realme">Realme</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Select Model</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="input text-xs w-full py-2.5 bg-gray-50 border-gray-300 font-bold"
                >
                  {selectedBrand === 'Apple' && (
                    <>
                      <option value="iPhone 15 Pro Max">iPhone 15 Pro Max</option>
                      <option value="iPhone 14">iPhone 14</option>
                      <option value="iPhone 13">iPhone 13</option>
                      <option value="iPhone 12">iPhone 12</option>
                      <option value="iPhone 11">iPhone 11</option>
                    </>
                  )}
                  {selectedBrand === 'Samsung' && (
                    <>
                      <option value="Galaxy S23 Ultra">Galaxy S23 Ultra</option>
                      <option value="Galaxy S22">Galaxy S22</option>
                      <option value="Galaxy A54 5G">Galaxy A54 5G</option>
                    </>
                  )}
                  {selectedBrand === 'OnePlus' && (
                    <>
                      <option value="OnePlus 11R 5G">OnePlus 11R 5G</option>
                      <option value="OnePlus Nord CE 3">OnePlus Nord CE 3</option>
                      <option value="OnePlus 10 Pro">OnePlus 10 Pro</option>
                    </>
                  )}
                </select>
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
