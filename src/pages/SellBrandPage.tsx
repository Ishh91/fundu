import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Search,
  Smartphone,
  Sparkles,
  ArrowRight,
  Zap,
  Check,
  BadgeIndianRupee,
  Truck,
  Lock,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  RefreshCw,
  AlertCircle,
  Star,
  FileText,
  Clock,
  UserCheck,
} from 'lucide-react';
import { formatINR } from '../lib/db';
import { getCleanPhoneImage, getCleanBrandLogo } from '../lib/phoneImages';
import { usePriceSync, applyPriceOverrides } from '../lib/priceSync';
import { MASTER_MODEL_CATALOG } from './SellPhone';
import { fetchBrandCatalogFromApi, type CatalogModelItem } from '../lib/mobileApi';

const BRAND_DETAILS: Record<
  string,
  { logo: string; tagline: string; desc: string; count: string; series: string[] }
> = {
  xiaomi: {
    logo: getCleanBrandLogo('xiaomi'),
    tagline: 'Get Maximum Resale Cash Value for Your Old Xiaomi / Redmi Phone in Lucknow',
    desc: 'Sell used Xiaomi Mi, Redmi Note & POCO smartphones online in Lucknow for instant spot cash & 100% free doorstep pickup across Gomti Nagar, Hazratganj, Indira Nagar & Aliganj.',
    count: '50+ Xiaomi Models',
    series: ['All', 'Redmi Note Series', 'Mi Series', 'Redmi Series', 'Poco Series'],
  },
  apple: {
    logo: getCleanBrandLogo('apple'),
    tagline: 'Sell Old Apple iPhone Online for Instant Cash at Doorstep',
    desc: 'Get highest guaranteed spot cash for your old Apple iPhone in Lucknow. Free doorstep pickup & instant UPI payment across all Lucknow localities.',
    count: '30+ iPhone Models',
    series: ['All', 'iPhone 15 Series', 'iPhone 14 Series', 'iPhone 13 Series', 'iPhone 12 Series', 'iPhone 11 Series'],
  },
  samsung: {
    logo: getCleanBrandLogo('samsung'),
    tagline: 'Sell Old Samsung Galaxy Mobile Online at Best Resale Valuation',
    desc: 'Sell used Samsung Galaxy S, Z Fold/Flip, A & M series smartphones online in Lucknow for maximum spot payment.',
    count: '45+ Galaxy Models',
    series: ['All', 'Galaxy S Series', 'Galaxy Z Series', 'Galaxy A Series', 'Galaxy M Series'],
  },
  oneplus: {
    logo: getCleanBrandLogo('oneplus'),
    tagline: 'Sell Old OnePlus Smartphone Online at Highest Cash Rates',
    desc: 'Sell old OnePlus 12, 11, Nord & R series phones at best doorstep cash rates in Lucknow with instant data wipe.',
    count: '25+ OnePlus Models',
    series: ['All', 'Number Series', 'Nord Series', 'R Series'],
  },
  vivo: {
    logo: getCleanBrandLogo('vivo'),
    tagline: 'Sell Old Vivo Mobile Online for Instant Spot Payout',
    desc: 'Sell used Vivo X, V, Y, T, Z, U, NEX & S series smartphones in Lucknow with free doorstep pickup & guaranteed valuation.',
    count: '100+ Vivo Models',
    series: ['All', 'X Series', 'V Series', 'Y Series', 'T Series', 'Z Series', 'U Series', 'NEX Series', 'S Series'],
  },
  realme: {
    logo: getCleanBrandLogo('realme'),
    tagline: 'Sell Old Realme Mobile Phone Online at Best Price',
    desc: 'Sell used Realme Pro, GT & C series phones online in Lucknow for instant cash in hand.',
    count: '35+ Realme Models',
    series: ['All', 'Pro Series', 'GT Series', 'C Series'],
  },
  oppo: {
    logo: getCleanBrandLogo('oppo'),
    tagline: 'Sell Old Oppo Mobile Phone Online for Instant Cash',
    desc: 'Sell old Oppo Reno, Find & A series mobiles in Lucknow with zero hassle and instant GPay/PhonePe transfer.',
    count: '30+ Oppo Models',
    series: ['All', 'Reno Series', 'Find Series', 'A Series'],
  },
  google: {
    logo: getCleanBrandLogo('google'),
    tagline: 'Sell Old Google Pixel Phone Online at Best Resale Value',
    desc: 'Sell used Google Pixel 8, 7 & 6 series phones in Lucknow at highest market value.',
    count: '15+ Pixel Models',
    series: ['All', 'Pixel Series'],
  },
};

const STORAGE_OPTIONS = ['64 GB', '128 GB', '256 GB', '512 GB', '1 TB'];

export default function SellBrandPage() {
  const { brandSlug } = useParams<{ brandSlug: string }>();
  const navigate = useNavigate();

  const brandCleanKey = useMemo(() => {
    if (!brandSlug) return 'xiaomi';
    return brandSlug.replace(/^sell-/, '').toLowerCase();
  }, [brandSlug]);

  const brandDisplayName = useMemo(() => {
    if (brandCleanKey === 'xiaomi') return 'Xiaomi';
    return brandCleanKey.charAt(0).toUpperCase() + brandCleanKey.slice(1);
  }, [brandCleanKey]);

  const brandInfo = BRAND_DETAILS[brandCleanKey] || {
    logo: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=150&auto=format&fit=crop&q=80',
    tagline: `Sell Old ${brandDisplayName} Mobile Phone Online At Best Price`,
    desc: `Sell used ${brandDisplayName} smartphones online in Lucknow for instant spot cash & free doorstep pickup.`,
    count: `30+ ${brandDisplayName} Models`,
    series: ['All'],
  };

  // Active Series Filter Tab
  const [selectedSeries, setSelectedSeries] = useState<string>('All');

  // Debounced Search Query State
  const [rawSearchQuery, setRawSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [focusedSearchIndex, setFocusedSearchIndex] = useState(-1);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(rawSearchQuery.trim());
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [rawSearchQuery]);

  // Auto Scroll to Top on Brand Page Load or Series Change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [brandSlug, selectedSeries]);

  // Dynamic API Models Catalog State
  const [apiModels, setApiModels] = useState<CatalogModelItem[]>([]);
  const [isLoadingApi, setIsLoadingApi] = useState<boolean>(true);

  // Fetch models dynamically from API when brand changes
  useEffect(() => {
    let isSubscribed = true;
    setIsLoadingApi(true);
    fetchBrandCatalogFromApi(brandCleanKey)
      .then((models) => {
        if (isSubscribed) setApiModels(models);
      })
      .catch(() => {
        if (isSubscribed) setApiModels([]);
      })
      .finally(() => {
        if (isSubscribed) setIsLoadingApi(false);
      });
    return () => {
      isSubscribed = false;
    };
  }, [brandCleanKey]);

  const { version } = usePriceSync();

  // Models filtered for this brand, selected series, and debounced search query
  const brandModels = useMemo(() => {
    let list = apiModels.length > 0
      ? apiModels
      : MASTER_MODEL_CATALOG.filter((m) => m.brand.toLowerCase() === brandCleanKey);

    if (selectedSeries !== 'All') {
      list = list.filter((m) => m.series === selectedSeries);
    }

    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase();
      list = list.filter((m) => m.model.toLowerCase().includes(q));
    }

    return applyPriceOverrides(list);
  }, [apiModels, brandCleanKey, selectedSeries, debouncedQuery, version]);

  // Available Series Tabs
  const seriesTabs = useMemo(() => {
    if (brandInfo.series && brandInfo.series.length > 1) {
      return brandInfo.series;
    }
    const seriesSet = new Set<string>();
    const sourceList = apiModels.length > 0
      ? apiModels
      : MASTER_MODEL_CATALOG.filter((m) => m.brand.toLowerCase() === brandCleanKey);

    sourceList.forEach((m) => {
      if (m.series) seriesSet.add(m.series);
    });
    return ['All', ...Array.from(seriesSet)];
  }, [brandCleanKey, brandInfo.series, apiModels]);

  const handleSelectModel = (modelName: string, storage: string) => {
    const modelSlugClean = modelName.toLowerCase().replace(/\s+/g, '-');
    navigate(`/sell/${brandCleanKey}/${modelSlugClean}?storage=${encodeURIComponent(storage)}`);
  };

  // Highlight matching search query text
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-teal-100 text-[#00a896] font-black px-0.5 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#f4f7f8] pb-24">
      {/* CASHIFY EXACT BREADCRUMB NAVIGATION */}
      <div className="bg-white border-b border-gray-100 py-2.5 px-4 text-xs font-semibold text-gray-500">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 flex-wrap">
          <Link to="/" className="hover:text-[#00a896] transition">Home</Link>
          <span>&gt;</span>
          <Link to="/sell" className="hover:text-[#00a896] transition">Sell</Link>
          <span>&gt;</span>
          <span className="text-[#00a896] font-extrabold">{brandDisplayName}</span>
        </div>
      </div>

      {/* Clean Brand Header & Right-Corner Search Bar */}
      <section className="py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-black text-gray-900">
                Sell Old {brandDisplayName} Mobile Phone Online At Best Price
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Instant Spot Cash & Free Doorstep Pickup Across Lucknow
              </p>
            </div>

            {/* Search Bar Aligned at Right Corner */}
            <div className="relative w-full md:w-80 shrink-0">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={rawSearchQuery}
                  onChange={(e) => setRawSearchQuery(e.target.value)}
                  placeholder={`Search ${brandDisplayName} models...`}
                  className="w-full pl-12 pr-10 py-3 rounded-2xl bg-white border border-gray-300 text-xs font-medium shadow-sm focus:border-[#00a896] focus:ring-4 focus:ring-[#00a896]/10 outline-none transition"
                />
                {isSearching && (
                  <RefreshCw className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00a896] animate-spin" />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CATALOG CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* CASHIFY SERIES SELECTION FILTER TABS BAR */}
        <div className="card p-6 md:p-8 rounded-[32px] bg-white border border-gray-200 shadow-md space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <span className="badge bg-teal-100 text-teal-800 font-bold text-xs">Select Series & Model</span>
              <h2 className="mt-1 font-display text-2xl font-black text-gray-900">
                Select Your {brandDisplayName} Model
              </h2>
            </div>
            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3.5 py-1.5 rounded-xl border border-gray-200">
              Showing {brandModels.length} Models
            </span>
          </div>

          {/* Cashify Horizontal Series Filter Tabs */}
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
                      ? 'bg-[#00a896] text-white shadow-md shadow-teal-500/20 scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-teal-50 hover:text-[#00a896]'
                  }`}
                >
                  {ser}
                </button>
              ))}
            </div>
          )}

          {/* CASHIFY COMPACT MODEL PRODUCT TILE GRID */}
          {isLoadingApi ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="h-8 w-8 text-[#00a896] animate-spin mx-auto" />
              <p className="text-xs font-bold text-gray-500">Fetching live {brandDisplayName} models...</p>
            </div>
          ) : brandModels.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {brandModels.map((m) => (
                <div
                  key={m.model}
                  onClick={() => handleSelectModel(m.model, m.storage || '128 GB')}
                  className="p-3 sm:p-4 rounded-2xl border border-gray-200/90 bg-white hover:border-[#00a896] hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1">
                      <span className="badge bg-emerald-50 text-emerald-800 font-extrabold text-[10px] sm:text-[11px] px-1.5 py-0.5">
                        Up to {formatINR(m.price)}
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
                    </div>

                    {/* Storage Variant Pills */}
                    <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-wrap gap-1">
                        {STORAGE_OPTIONS.slice(0, 4).map((stg) => (
                          <button
                            key={stg}
                            type="button"
                            onClick={() => handleSelectModel(m.model, stg)}
                            className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700 hover:bg-[#00a896] hover:text-white transition"
                          >
                            {stg}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectModel(m.model, m.storage || '128 GB');
                    }}
                    className="btn-primary w-full text-[11px] sm:text-xs py-1.5 sm:py-2 mt-2.5 bg-[#00a896] hover:bg-[#008f80] flex items-center justify-center gap-1 font-bold shadow-xs"
                  >
                    Get Quote <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center space-y-3">
              <AlertCircle className="h-8 w-8 text-rose-500 mx-auto" />
              <h3 className="font-bold text-lg text-gray-900">No {brandDisplayName} models found for "{rawSearchQuery}"</h3>
              <p className="text-xs text-gray-500">
                Try clearing your search filter or calling our helpline at <span className="font-bold text-gray-900">+91-9839122345</span>.
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

        {/* CASHIFY "HOW IT WORKS" 3-STEP FLOW */}
        <div className="card p-8 rounded-[32px] bg-white border border-gray-200 space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="badge bg-teal-50 text-[#00a896] text-xs font-bold">Simple 3-Step Process</span>
            <h2 className="font-display text-2xl font-black text-gray-900">How to Sell Old {brandDisplayName} Phone</h2>
            <p className="text-xs text-gray-500">Sell your mobile in under 2 minutes from home</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {[
              {
                num: '1',
                title: 'Select Model & Evaluate',
                desc: `Select your ${brandDisplayName} phone model, storage variant, and answer simple condition questions.`,
              },
              {
                num: '2',
                title: 'Schedule Free Doorstep Pickup',
                desc: 'Pick your preferred date & time slot. Our automated Lucknow rider is dispatched to your location.',
              },
              {
                num: '3',
                title: 'Receive Instant Spot Payment',
                desc: 'Rider checks your device on spot and transfers cash or UPI (GPay/PhonePe) directly into your account!',
              },
            ].map((stepItem) => (
              <div key={stepItem.num} className="p-6 rounded-2xl bg-teal-50/50 border border-teal-100 flex flex-col items-center text-center space-y-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#00a896] text-white font-display font-black text-xl shadow-md shadow-teal-500/20">
                  {stepItem.num}
                </div>
                <h3 className="font-extrabold text-base text-gray-900">{stepItem.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{stepItem.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CASHIFY WHY SELL BRAND ON FUNDU (6 USPs) */}
        <div className="card p-8 rounded-[32px] bg-gradient-to-r from-teal-950 via-gray-900 to-teal-950 text-white shadow-xl space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="badge bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-bold px-3 py-1">
              Lucknow's #1 Mobile Buyback Network
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-black text-white">
              Why Sell Old {brandDisplayName} Phone On Fundu?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: <BadgeIndianRupee className="h-6 w-6 text-teal-400" />,
                title: 'Instant Spot Cash Payout',
                desc: 'Get instant UPI (GPay/PhonePe) or hard cash transfer directly into your hand before handing over your mobile.',
              },
              {
                icon: <Sparkles className="h-6 w-6 text-emerald-400" />,
                title: 'Highest Valuation Guarantee',
                desc: `Our AI algorithm checks live Lucknow market demand to guarantee maximum cash for your ${brandDisplayName}.`,
              },
              {
                icon: <Truck className="h-6 w-6 text-blue-400" />,
                title: 'Free Lucknow Doorstep Visit',
                desc: 'Zero shipping or visiting fees across Gomti Nagar, Hazratganj, Indira Nagar, Aliganj, Mahanagar & Chowk.',
              },
              {
                icon: <Lock className="h-6 w-6 text-purple-400" />,
                title: 'Military-Grade Data Wipe',
                desc: 'We perform automated factory data wipe right in front of you for 100% privacy & peace of mind.',
              },
              {
                icon: <ShieldCheck className="h-6 w-6 text-amber-400" />,
                title: 'All Conditions Accepted',
                desc: 'We buy phones in all physical states — flawless, body scratches, cracked screen glass, or dead battery.',
              },
              {
                icon: <FileText className="h-6 w-6 text-rose-400" />,
                title: 'Legal Digital Seller Invoice',
                desc: 'Receive an official digital receipt & invoice sent to your mobile phone instantly upon pickup completion.',
              },
            ].map((card, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs hover:bg-white/10 transition-colors space-y-2">
                <div className="p-2.5 rounded-xl bg-white/10 w-fit">{card.icon}</div>
                <h3 className="font-bold text-sm text-white mt-2">{card.title}</h3>
                <p className="text-xs text-gray-300 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* BRAND SPECIFIC FAQS */}
        <div className="card p-8 rounded-[32px] bg-white border border-gray-200 space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="badge bg-teal-50 text-[#00a896] text-xs font-bold">Frequently Asked Questions</span>
            <h2 className="font-display text-2xl font-black text-gray-900">
              Selling {brandDisplayName} on Fundu Lucknow
            </h2>
          </div>

          <div className="space-y-3 max-w-4xl mx-auto">
            {[
              {
                q: `How is the cash quote for my old ${brandDisplayName} phone calculated?`,
                a: `Our automated algorithm checks real-time Lucknow resale market demand for ${brandDisplayName} models and adjusts based on screen condition, body scuffs, hardware defects, warranty status, and original box/charger bonuses.`,
              },
              {
                q: `Is doorstep pickup for ${brandDisplayName} 100% free in Lucknow?`,
                a: `Yes! Doorstep pickup is 100% FREE with zero visiting fees across all Lucknow areas including Gomti Nagar, Hazratganj, Indira Nagar, Aliganj, Mahanagar, Ashiyana, Chowk, and Rajajipuram.`,
              },
              {
                q: `Do I get instant payment when selling my ${brandDisplayName}?`,
                a: `Yes! Our pickup executive inspects your ${brandDisplayName} device at your doorstep and transfers instant UPI (GPay/PhonePe) or hard spot cash directly into your hands before taking the phone.`,
              },
              {
                q: `What documents are required to sell an old ${brandDisplayName}?`,
                a: `You only need a valid Govt ID proof (Aadhaar Card or Driving License). Having the original invoice or box earns you up to ₹700 in extra cash bonuses!`,
              },
            ].map((f, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 text-left font-bold text-sm text-gray-900 flex items-center justify-between gap-4 hover:bg-teal-50/30 transition cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-[#00a896] shrink-0" /> {f.q}
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

        {/* SEO FOOTER CONTENT BLOCK */}
        <div className="p-8 rounded-[32px] bg-gray-100 border border-gray-200 text-xs text-gray-600 space-y-3 leading-relaxed">
          <h3 className="font-bold text-gray-900 text-sm">Sell Old {brandDisplayName} Mobile Phone Online in Lucknow — Fundu Re-Commerce Hub</h3>
          <p>
            Looking to sell your old {brandDisplayName} mobile phone for instant spot cash in Lucknow? Fundu is Lucknow's largest, most trusted online platform for selling used {brandDisplayName} smartphones across all series.
          </p>
          <p>
            Enjoy free doorstep pickup across all Lucknow areas including Gomti Nagar, Hazratganj, Indira Nagar, Aliganj, Mahanagar, Ashiyana, Chowk, Rajajipuram, Jankipuram, and Kanpur Road.
          </p>
          <div className="pt-3 border-t border-gray-300/60 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-gray-800">
            <span>Fundu Lucknow Helpline: +91-9839122345</span>
            <span>Average User Rating: 4.9 / 5.0 (12,400+ Verified Deals)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
