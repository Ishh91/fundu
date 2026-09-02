import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Search,
  Wrench,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BadgeIndianRupee,
  Truck,
  Lock,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertCircle,
  BatteryCharging,
  Zap,
  Camera,
  Monitor,
  Volume2,
  Cpu,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';
import { formatINR } from '../lib/db';
import { MASTER_MODEL_CATALOG } from './SellPhone';
import { ALL_INDIAN_PHONES_CATALOG } from '../data/indianPhonesCatalog';
import { getCleanPhoneImage } from '../lib/phoneImages';

const BRAND_REPAIR_DETAILS: Record<
  string,
  { logo: string; tagline: string; desc: string; count: string; series: string[] }
> = {
  apple: {
    logo: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=150&auto=format&fit=crop&q=80',
    tagline: 'Doorstep iPhone Repair Services in Lucknow with Up to 6 Months Warranty',
    desc: 'Get certified doorstep Apple iPhone screen, battery, camera & back glass repair in Lucknow. 30-minute repair right in front of your eyes at home or office.',
    count: '30+ iPhone Models Covered',
    series: ['All', 'iPhone 15 Series', 'iPhone 14 Series', 'iPhone 13 Series', 'iPhone 12 Series', 'iPhone 11 Series'],
  },
  samsung: {
    logo: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=150&auto=format&fit=crop&q=80',
    tagline: 'Doorstep Samsung Galaxy Phone Repair & Display Replacement in Lucknow',
    desc: 'Original Super AMOLED screen replacement, battery health fix & motherboard IC repair for Samsung S, Z Fold, A & M series at your doorstep.',
    count: '45+ Samsung Models Covered',
    series: ['All', 'Galaxy S Series', 'Galaxy Z Series', 'Galaxy A Series', 'Galaxy M Series'],
  },
  oneplus: {
    logo: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=150&auto=format&fit=crop&q=80',
    tagline: 'Doorstep OnePlus Mobile Screen, Battery & Charging Port Repair',
    desc: 'Quick 30-minute doorstep repair for OnePlus 12, 11, Nord & R series in Lucknow with 100% genuine spare parts.',
    count: '25+ OnePlus Models Covered',
    series: ['All', 'Number Series', 'Nord Series', 'R Series'],
  },
  xiaomi: {
    logo: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=150&auto=format&fit=crop&q=80',
    tagline: 'Fast Doorstep Xiaomi / Redmi / POCO Phone Repair in Lucknow',
    desc: 'Expert display change, battery replacement & liquid damage diagnosis for Xiaomi Mi, Redmi Note & POCO mobiles at home.',
    count: '50+ Xiaomi Models Covered',
    series: ['All', 'Redmi Note Series', 'Mi Series', 'Redmi Series', 'Poco Series'],
  },
  vivo: {
    logo: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=150&auto=format&fit=crop&q=80',
    tagline: 'Doorstep Vivo Mobile Display & Glass Replacement Service',
    desc: 'Get your Vivo X, V & Y series phone repaired at your doorstep in Lucknow. Original parts & up to 6 months warranty.',
    count: '40+ Vivo Models Covered',
    series: ['All', 'X Series', 'V Series', 'Y Series'],
  },
  realme: {
    logo: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=150&auto=format&fit=crop&q=80',
    tagline: 'Doorstep Realme Mobile Phone Repair & Battery Replacement',
    desc: 'Affordable doorstep screen & battery repair for Realme GT, Pro & C series across Gomti Nagar, Hazratganj & all Lucknow.',
    count: '35+ Realme Models Covered',
    series: ['All', 'Pro Series', 'GT Series', 'C Series'],
  },
  oppo: {
    logo: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=150&auto=format&fit=crop&q=80',
    tagline: 'Doorstep Oppo Mobile Screen & Charging Port Repair',
    desc: 'Certified repair for Oppo Reno, Find & A series at your doorstep in Lucknow with zero visiting fees.',
    count: '30+ Oppo Models Covered',
    series: ['All', 'Reno Series', 'Find Series', 'A Series'],
  },
  google: {
    logo: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=150&auto=format&fit=crop&q=80',
    tagline: 'Doorstep Google Pixel Display & Battery Repair in Lucknow',
    desc: 'Specialized doorstep repair for Google Pixel 8, 7 & 6 series with OEM screen panels & original batteries.',
    count: '15+ Pixel Models Covered',
    series: ['All', 'Pixel Series'],
  },
};

const COMMON_REPAIR_SERVICES = [
  { id: 'screen', label: 'Screen & Display Replacement', cost: 2999, time: '30 Mins', warranty: '6 Months', icon: Monitor },
  { id: 'battery', label: 'Battery Replacement & Health Check', cost: 1499, time: '20 Mins', warranty: '6 Months', icon: BatteryCharging },
  { id: 'charging', label: 'Charging Port & Sub-board IC', cost: 699, time: '25 Mins', warranty: '3 Months', icon: Zap },
  { id: 'camera', label: 'Front & Rear Camera Repair', cost: 1299, time: '30 Mins', warranty: '6 Months', icon: Camera },
  { id: 'speaker', label: 'Mic, Receiver & Speaker Repair', cost: 599, time: '20 Mins', warranty: '3 Months', icon: Volume2 },
  { id: 'motherboard', label: 'Water Damage & IC Repair', cost: 499, time: '24 Hr Lab', warranty: 'Lab Tested', icon: Cpu },
];

export default function RepairBrandPage() {
  const { brandSlug } = useParams<{ brandSlug: string }>();
  const navigate = useNavigate();

  const brandCleanKey = useMemo(() => {
    if (!brandSlug) return 'apple';
    return brandSlug.replace(/^repair-/, '').toLowerCase();
  }, [brandSlug]);

  const brandDisplayName = useMemo(() => {
    if (brandCleanKey === 'xiaomi') return 'Xiaomi';
    return brandCleanKey.charAt(0).toUpperCase() + brandCleanKey.slice(1);
  }, [brandCleanKey]);

  const brandInfo = BRAND_REPAIR_DETAILS[brandCleanKey] || {
    logo: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=150&auto=format&fit=crop&q=80',
    tagline: `Doorstep ${brandDisplayName} Mobile Repair Service in Lucknow`,
    desc: `Get certified doorstep ${brandDisplayName} mobile screen, battery, camera & motherboard repair in Lucknow with up to 6 months warranty.`,
    count: `30+ ${brandDisplayName} Models Covered`,
    series: ['All'],
  };

  const [selectedSeries, setSelectedSeries] = useState<string>('All');
  const [rawSearchQuery, setRawSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(rawSearchQuery.trim());
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [rawSearchQuery]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [brandSlug, selectedSeries]);

  const brandModels = useMemo(() => {
    const indianList = ALL_INDIAN_PHONES_CATALOG.filter(
      (p) => p.brand.toLowerCase() === brandCleanKey
    ).map((p) => ({
      brand: p.brand,
      model: p.model,
      series: p.series || brandDisplayName,
      image: p.image_url,
      price: 599,
    }));

    const masterList = MASTER_MODEL_CATALOG.filter(
      (m) => m.brand.toLowerCase() === brandCleanKey && !indianList.some((ip) => ip.model.toLowerCase() === m.model.toLowerCase())
    ).map((m) => ({
      brand: m.brand,
      model: m.model,
      series: m.series || brandDisplayName,
      image: m.image,
      price: 599,
    }));

    let list = [...indianList, ...masterList];

    if (selectedSeries !== 'All') {
      list = list.filter((m) => m.series?.toLowerCase() === selectedSeries.toLowerCase());
    }

    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase();
      list = list.filter((m) => m.model.toLowerCase().includes(q));
    }

    return list;
  }, [brandCleanKey, brandDisplayName, selectedSeries, debouncedQuery]);

  const seriesTabs = useMemo(() => {
    if (brandInfo.series && brandInfo.series.length > 1) {
      return brandInfo.series;
    }
    const seriesSet = new Set<string>();
    ALL_INDIAN_PHONES_CATALOG.filter((p) => p.brand.toLowerCase() === brandCleanKey).forEach((p) => {
      if (p.series) seriesSet.add(p.series);
    });
    return ['All', ...Array.from(seriesSet)];
  }, [brandCleanKey, brandInfo.series]);

  const handleBookRepair = (modelName: string, issueId: string = 'screen') => {
    const modelSlugClean = modelName.toLowerCase().replace(/\s+/g, '-');
    navigate(`/repair/${brandCleanKey}/${modelSlugClean}?issue=${encodeURIComponent(issueId)}`);
  };

  return (
    <div className="min-h-screen bg-[#f4f7f8] pb-24">
      {/* BREADCRUMB NAVIGATION */}
      <div className="bg-white border-b border-gray-100 py-2.5 px-4 text-xs font-semibold text-gray-500">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 flex-wrap">
          <Link to="/repair" className="hover:text-purple-700">Home</Link>
          <span>&gt;</span>
          <Link to="/repair" className="hover:text-purple-700">Doorstep Mobile Repair</Link>
          <span>&gt;</span>
          <span className="text-purple-700 font-extrabold">{brandDisplayName} Repair Services</span>
        </div>
      </div>

      {/* BRAND REPAIR HERO */}
      <section className="py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-800 font-extrabold text-xs mb-2">
                <Wrench className="h-3.5 w-3.5" /> Lucknow Doorstep Repair Center
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-black text-gray-900">
                Doorstep {brandDisplayName} Mobile Repair in Lucknow
              </h1>
              <p className="text-xs text-gray-500 mt-1 max-w-2xl">
                {brandInfo.desc}
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-80 shrink-0">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={rawSearchQuery}
                  onChange={(e) => setRawSearchQuery(e.target.value)}
                  placeholder={`Search ${brandDisplayName} model to repair...`}
                  className="w-full pl-12 pr-10 py-3 rounded-2xl bg-white border border-gray-300 text-xs font-medium shadow-sm focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 outline-none transition"
                />
                {isSearching && (
                  <RefreshCw className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-600 animate-spin" />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* COMMON REPAIR ISSUES CAROUSEL / GRID */}
        <div className="card p-6 md:p-8 rounded-[32px] bg-white border border-gray-200 shadow-md space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="badge bg-purple-50 text-purple-700 font-bold text-xs">Doorstep Services</span>
              <h2 className="font-display text-xl font-black text-gray-900 mt-0.5">
                Select Repair Issue for {brandDisplayName}
              </h2>
            </div>
            <span className="text-xs font-semibold text-purple-700">6 Months Warranty</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {COMMON_REPAIR_SERVICES.map((srv) => {
              const IconComp = srv.icon;
              return (
                <div
                  key={srv.id}
                  onClick={() => navigate(`/repair/issue/${srv.id}`)}
                  className="p-4 rounded-2xl border border-gray-200 bg-purple-50/30 hover:bg-purple-100/50 hover:border-purple-300 transition cursor-pointer text-center space-y-2 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white grid place-items-center mx-auto shadow-md group-hover:scale-110 transition">
                    <IconComp className="h-5 w-5" />
                  </div>
                  <p className="font-bold text-xs text-gray-900 line-clamp-1">{srv.label}</p>
                  <p className="text-[11px] font-black text-purple-800">From {formatINR(srv.cost)}</p>
                  <span className="inline-block text-[10px] text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                    ⏱️ {srv.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* MODEL SELECTION GRID */}
        <div className="card p-6 md:p-8 rounded-[32px] bg-white border border-gray-200 shadow-md space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <span className="badge bg-purple-100 text-purple-800 font-bold text-xs">Select Model</span>
              <h2 className="mt-1 font-display text-2xl font-black text-gray-900">
                Select Your {brandDisplayName} Model to Book Doorstep Repair
              </h2>
            </div>
            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3.5 py-1.5 rounded-xl border border-gray-200">
              Showing {brandModels.length} Models
            </span>
          </div>

          {/* Series Tabs */}
          {seriesTabs.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1 border-b border-gray-100 pb-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 mr-2">Series:</span>
              {seriesTabs.map((ser) => (
                <button
                  key={ser}
                  type="button"
                  onClick={() => setSelectedSeries(ser)}
                  className={`px-4 py-2 rounded-full text-xs font-extrabold transition shrink-0 cursor-pointer ${
                    selectedSeries === ser
                      ? 'bg-purple-700 text-white shadow-md scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                  }`}
                >
                  {ser}
                </button>
              ))}
            </div>
          )}

          {/* COMPACT 5-COLUMN RESPONSIVE MODEL PRODUCT TILE GRID */}
          {brandModels.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {brandModels.map((m) => (
                <div
                  key={m.model}
                  onClick={() => handleBookRepair(m.model, 'screen')}
                  className="p-3 sm:p-4 rounded-2xl border border-gray-200/90 bg-white hover:border-[#00a896] hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1">
                      <span className="badge bg-teal-50 text-teal-800 font-extrabold text-[10px] sm:text-[11px] px-1.5 py-0.5">
                        Repair from ₹599
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-gray-400 font-medium truncate max-w-[80px]">
                        {m.series || brandDisplayName}
                      </span>
                    </div>

                    {/* Centered Clean Device Image Container */}
                    <div className="h-28 sm:h-32 w-full bg-white rounded-xl p-1.5 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
                      <img
                        src={getCleanPhoneImage(m.brand || brandDisplayName, m.model, m.image)}
                        alt={m.model}
                        className="h-full max-h-28 sm:max-h-32 w-auto object-contain drop-shadow-xs"
                        loading="lazy"
                      />
                    </div>

                    <div>
                      <p className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-[#00a896] transition-colors line-clamp-1">
                        {m.model}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Screen · Battery · Camera
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-[#00a896] font-bold group-hover:translate-x-0.5 transition-transform">
                    <span>Book Repair</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center space-y-3">
              <AlertCircle className="h-8 w-8 text-rose-500 mx-auto" />
              <h3 className="font-bold text-lg text-gray-900">No {brandDisplayName} models found for "{rawSearchQuery}"</h3>
              <p className="text-xs text-gray-500">
                Call our technician helpline at <span className="font-bold text-gray-900">+91-9839122345</span> for custom repair quotes.
              </p>
              <button
                type="button"
                onClick={() => { setRawSearchQuery(''); setSelectedSeries('All'); }}
                className="btn-outline text-xs px-4 py-2"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

        {/* 3-STEP REPAIR PROCESS */}
        <div className="card p-8 rounded-[32px] bg-white border border-gray-200 space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="badge bg-purple-50 text-purple-700 text-xs font-bold">Fast & Convenient</span>
            <h2 className="font-display text-2xl font-black text-gray-900">How Doorstep {brandDisplayName} Repair Works</h2>
            <p className="text-xs text-gray-500">Repaired right at your home or office in 30 minutes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {[
              {
                num: '1',
                title: 'Select Model & Issue',
                desc: `Choose your ${brandDisplayName} phone model and the issue (Screen, Battery, Camera, Charging).`,
              },
              {
                num: '2',
                title: 'Book Free Time Slot',
                desc: 'Select your preferred date & Lucknow location. Our certified technician visits your doorstep.',
              },
              {
                num: '3',
                title: 'Repaired in 30 Mins & Pay',
                desc: 'Tech repairs your phone in front of your eyes. Test thoroughly and pay via cash or UPI!',
              },
            ].map((stepItem) => (
              <div key={stepItem.num} className="p-6 rounded-2xl bg-purple-50/50 border border-purple-100 flex flex-col items-center text-center space-y-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-purple-600 text-white font-display font-black text-xl shadow-md">
                  {stepItem.num}
                </div>
                <h3 className="font-extrabold text-base text-gray-900">{stepItem.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{stepItem.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* REPAIR ADVANTAGES */}
        <div className="card p-8 rounded-[32px] bg-slate-900 text-white shadow-xl space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="badge bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-bold px-3 py-1">
              Lucknow's #1 Doorstep Mobile Service
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-black text-white">
              Why Choose Fundu for {brandDisplayName} Repair?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: <Wrench className="h-6 w-6 text-purple-400" />,
                title: '30-Minute Doorstep Fix',
                desc: 'No need to leave your home or travel to local markets. Repair completed right at your desk.',
              },
              {
                icon: <ShieldCheck className="h-6 w-6 text-emerald-400" />,
                title: 'Up to 6 Months Warranty',
                desc: 'All replaced screens, batteries & camera parts come with genuine warranty protection.',
              },
              {
                icon: <Lock className="h-6 w-6 text-blue-400" />,
                title: '100% Personal Data Safe',
                desc: 'Repair happens right in front of your eyes. No need to share passwords or unlock pin.',
              },
              {
                icon: <BadgeIndianRupee className="h-6 w-6 text-amber-400" />,
                title: 'Pay ONLY After Testing',
                desc: 'Zero advance payment required. Test your touch, display, battery & camera first, then pay.',
              },
              {
                icon: <Truck className="h-6 w-6 text-rose-400" />,
                title: 'Zero Visiting Charges',
                desc: 'Free doorstep technician visit across Gomti Nagar, Hazratganj, Indira Nagar, Aliganj & Chowk.',
              },
              {
                icon: <CheckCircle2 className="h-6 w-6 text-teal-400" />,
                title: 'Tested Genuine Parts',
                desc: 'We use high-grade OEM displays and tested lithium batteries for maximum longevity.',
              },
            ].map((card, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs hover:bg-white/10 transition-colors space-y-2">
                <div className="p-2.5 rounded-xl bg-white/10 w-fit">{card.icon}</div>
                <h3 className="font-bold text-sm text-white mt-2">{card.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQS */}
        <div className="card p-8 rounded-[32px] bg-white border border-gray-200 space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="badge bg-purple-50 text-purple-700 text-xs font-bold">Frequently Asked Questions</span>
            <h2 className="font-display text-2xl font-black text-gray-900">
              {brandDisplayName} Doorstep Repair FAQs
            </h2>
          </div>

          <div className="space-y-3 max-w-4xl mx-auto">
            {[
              {
                q: `How long does it take to repair a ${brandDisplayName} phone at my doorstep in Lucknow?`,
                a: `Most screen, battery, camera, and charging port replacements are completed within 20 to 30 minutes right in front of you.`,
              },
              {
                q: `Is there any visiting fee if I cancel after technician arrival?`,
                a: `No! Visiting is 100% FREE. You pay only for the actual repair service performed.`,
              },
              {
                q: `Do I get a warranty on ${brandDisplayName} display replacement?`,
                a: `Yes! You get up to 6 months of Fundu warranty on screen and battery replacements. Any fault is replaced free of charge.`,
              },
            ].map((f, idx) => {
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
