import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Search,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  BadgeIndianRupee,
  Truck,
  Lock,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertCircle,
  FileText,
  Layers,
} from 'lucide-react';
import { formatINR } from '../lib/db';
import { getCleanPhoneImage, getCleanBrandLogo, BRAND_FRONT_FALLBACKS } from '../lib/phoneImages';
import { usePriceSync, applyPriceOverrides } from '../lib/priceSync';
import { MASTER_MODEL_CATALOG } from './SellPhone';
import { fetchBrandCatalogFromApi, type CatalogModelItem } from '../lib/mobileApi';
import {
  groupModelsBySeries,
  getSeriesBySlug,
  isSeriesSlug,
  type SeriesGroup,
} from '../data/brandSeriesCatalog';

const BRAND_DETAILS: Record<
  string,
  { logo: string; tagline: string; desc: string; count: string }
> = {
  apple: {
    logo: getCleanBrandLogo('apple'),
    tagline: 'Sell Old Apple iPhone Online for Instant Cash at Doorstep',
    desc: 'Get highest guaranteed spot cash for your old Apple iPhone in Lucknow. Free doorstep pickup & instant UPI payment across all Lucknow localities.',
    count: '46+ iPhone Models',
  },
  samsung: {
    logo: getCleanBrandLogo('samsung'),
    tagline: 'Sell Old Samsung Galaxy Mobile Online at Best Resale Valuation',
    desc: 'Sell used Samsung Galaxy S, Z Fold/Flip, A & M series smartphones online in Lucknow for maximum spot payment.',
    count: '105+ Galaxy Models',
  },
  oneplus: {
    logo: getCleanBrandLogo('oneplus'),
    tagline: 'Sell Old OnePlus Smartphone Online at Highest Cash Rates',
    desc: 'Sell old OnePlus 13, 12, 11, Nord & Open series phones at best doorstep cash rates in Lucknow with instant data wipe.',
    count: '40+ OnePlus Models',
  },
  xiaomi: {
    logo: getCleanBrandLogo('xiaomi'),
    tagline: 'Get Maximum Resale Cash Value for Your Old Xiaomi / Redmi Phone in Lucknow',
    desc: 'Sell used Xiaomi Mi, Redmi Note & POCO smartphones online in Lucknow for instant spot cash & 100% free doorstep pickup across Gomti Nagar, Hazratganj, Indira Nagar & Aliganj.',
    count: '60+ Xiaomi Models',
  },
  redmi: {
    logo: getCleanBrandLogo('redmi'),
    tagline: 'Sell Old Redmi Mobile Phone Online for Instant Cash',
    desc: 'Sell used Redmi Note 13, 12, 11 & C series phones online in Lucknow for instant spot payment.',
    count: '40+ Redmi Models',
  },
  poco: {
    logo: getCleanBrandLogo('poco'),
    tagline: 'Sell Old POCO Gaming Phone Online at Best Resale Price',
    desc: 'Sell used POCO F, X, M & C series performance smartphones with zero hassle and instant cash at doorstep.',
    count: '25+ POCO Models',
  },
  realme: {
    logo: getCleanBrandLogo('realme'),
    tagline: 'Sell Old Realme Mobile Phone Online at Best Price',
    desc: 'Sell used Realme GT, Number Pro, Narzo & C series phones online in Lucknow for instant cash in hand.',
    count: '40+ Realme Models',
  },
  oppo: {
    logo: getCleanBrandLogo('oppo'),
    tagline: 'Sell Old Oppo Mobile Phone Online for Instant Cash',
    desc: 'Sell old Oppo Find, Reno, F & A series mobiles in Lucknow with zero hassle and instant GPay/PhonePe transfer.',
    count: '35+ Oppo Models',
  },
  vivo: {
    logo: getCleanBrandLogo('vivo'),
    tagline: 'Sell Old Vivo Mobile Online for Instant Spot Payout',
    desc: 'Sell used Vivo X, V, T & Y series smartphones in Lucknow with free doorstep pickup & guaranteed valuation.',
    count: '45+ Vivo Models',
  },
  iqoo: {
    logo: getCleanBrandLogo('iqoo'),
    tagline: 'Sell Old iQOO Gaming Smartphone Online at Best Value',
    desc: 'Sell used iQOO 12, 11, Neo & Z series performance phones for instant doorstep payment in Lucknow.',
    count: '15+ iQOO Models',
  },
  google: {
    logo: getCleanBrandLogo('google'),
    tagline: 'Sell Old Google Pixel Phone Online at Best Resale Value',
    desc: 'Sell used Google Pixel 9, 8, 7, 6 & Fold series phones in Lucknow at highest market value.',
    count: '25+ Pixel Models',
  },
  motorola: {
    logo: getCleanBrandLogo('motorola'),
    tagline: 'Sell Old Motorola Moto Phone Online for Instant Cash',
    desc: 'Sell used Motorola Razr, Edge & Moto G series smartphones in Lucknow for maximum spot payment.',
    count: '30+ Moto Models',
  },
  moto: {
    logo: getCleanBrandLogo('motorola'),
    tagline: 'Sell Old Moto Smartphone Online for Quick Doorstep Cash',
    desc: 'Sell used Moto G, Edge & Razr series phones online in Lucknow with free doorstep pickup.',
    count: '30+ Moto Models',
  },
  nothing: {
    logo: getCleanBrandLogo('nothing'),
    tagline: 'Sell Old Nothing Phone Online at Top Guaranteed Price',
    desc: 'Sell used Nothing Phone (2), (1), (2a) & CMF Phone 1 in Lucknow for instant spot cash.',
    count: '10+ Nothing Models',
  },
};

export default function SellBrandPage() {
  const { brandSlug, seriesSlug, modelSlug } = useParams<{
    brandSlug?: string;
    seriesSlug?: string;
    modelSlug?: string;
  }>();
  const navigate = useNavigate();

  const brandCleanKey = useMemo(() => {
    if (!brandSlug) return 'apple';
    return brandSlug.replace(/^sell-/, '').toLowerCase();
  }, [brandSlug]);

  const brandCanonicalKey = useMemo(() => {
    if (brandCleanKey === 'poco' || brandCleanKey === 'redmi') return 'xiaomi';
    if (brandCleanKey === 'iqoo') return 'vivo';
    if (brandCleanKey === 'moto') return 'motorola';
    if (brandCleanKey === 'pixel') return 'google';
    if (brandCleanKey === 'iphone') return 'apple';
    return brandCleanKey;
  }, [brandCleanKey]);

  const effectiveSeriesSlug = useMemo(() => {
    const raw = seriesSlug || (modelSlug && isSeriesSlug(modelSlug) ? modelSlug : undefined);
    if (!raw) return undefined;
    return raw.replace(/^sell-/, '').toLowerCase();
  }, [seriesSlug, modelSlug]);

  const brandDisplayName = useMemo(() => {
    if (brandCleanKey === 'xiaomi') return 'Xiaomi';
    if (brandCleanKey === 'apple' || brandCleanKey === 'iphone') return 'Apple';
    return brandCleanKey.charAt(0).toUpperCase() + brandCleanKey.slice(1);
  }, [brandCleanKey]);

  const brandInfo = BRAND_DETAILS[brandCleanKey] || BRAND_DETAILS[brandCanonicalKey] || {
    logo: getCleanBrandLogo(brandDisplayName),
    tagline: `Sell Old ${brandDisplayName} Mobile Phone Online At Best Price`,
    desc: `Sell used ${brandDisplayName} smartphones online in Lucknow for instant spot cash & free doorstep pickup.`,
    count: `30+ ${brandDisplayName} Models`,
  };

  // Debounced Search Query State
  const [rawSearchQuery, setRawSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(rawSearchQuery.trim());
      setIsSearching(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [rawSearchQuery]);

  // Auto Scroll to Top on Brand Page Load or Series Change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [brandSlug, effectiveSeriesSlug]);

  // Dynamic API Models Catalog State
  const [apiModels, setApiModels] = useState<CatalogModelItem[]>([]);
  const [isLoadingApi, setIsLoadingApi] = useState<boolean>(true);

  // Fetch models dynamically from API when brand changes
  useEffect(() => {
    let isSubscribed = true;
    setIsLoadingApi(true);
    fetchBrandCatalogFromApi(brandCanonicalKey)
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
  }, [brandCanonicalKey]);

  const { version } = usePriceSync();

  // Master Brand Models - combine local master catalog with API models so full lineup is always present
  const allBrandModels = useMemo(() => {
    const masterList = MASTER_MODEL_CATALOG.filter((m) => {
      const b = m.brand.toLowerCase();
      if (b === brandCanonicalKey || b === brandCleanKey) return true;
      if (brandCanonicalKey === 'xiaomi' && (b === 'redmi' || b === 'poco')) return true;
      if (brandCanonicalKey === 'vivo' && b === 'iqoo') return true;
      if (brandCanonicalKey === 'motorola' && b === 'moto') return true;
      return false;
    });
    const combinedMap = new Map<string, CatalogModelItem>();

    // Add all master catalog items first
    masterList.forEach((m) => {
      const key = m.model.toLowerCase().replace(/\+/g, 'plus').replace(/[^a-z0-9]/g, '');
      combinedMap.set(key, m);
    });

    // Merge any live API models
    apiModels.forEach((m) => {
      const key = m.model.toLowerCase().replace(/\+/g, 'plus').replace(/[^a-z0-9]/g, '');
      if (!combinedMap.has(key)) {
        combinedMap.set(key, m);
      }
    });

    const list = Array.from(combinedMap.values());
    return applyPriceOverrides(list);
  }, [apiModels, brandCleanKey, brandCanonicalKey, version]);

  // Series Groups (iPhone 16 Series down to iPhone 1 / Classic)
  const seriesGroups = useMemo(() => {
    return groupModelsBySeries(brandCanonicalKey, allBrandModels);
  }, [brandCanonicalKey, allBrandModels]);

  // Active Series Group if on series page
  const currentSeriesGroup = useMemo(() => {
    if (!effectiveSeriesSlug) return undefined;
    const clean = effectiveSeriesSlug.toLowerCase().replace(/^sell-/, '');

    // 1. Direct slug or id match
    const direct = seriesGroups.find((g) => g.slug === clean || g.id === clean);
    if (direct && direct.models.length > 0) return direct;

    // 2. Normalize and check aliases (e.g. redmi-note-11-series -> matches group containing note 11)
    const normalized = clean.replace(/-series$/, '');
    const partialMatch = seriesGroups.find((g) => {
      const gSlugNorm = g.slug.replace(/-series$/, '');
      return (
        gSlugNorm.includes(normalized) ||
        normalized.includes(gSlugNorm) ||
        clean.split('-').filter((w) => w.length > 2 && w !== 'series' && w !== 'note').every((w) => g.slug.includes(w) || g.name.toLowerCase().includes(w))
      );
    });
    if (partialMatch && partialMatch.models.length > 0) return partialMatch;

    // 3. If direct was found, use it even if models count is being loaded
    if (direct) return direct;

    // 4. Dynamic series creation from allBrandModels pattern match
    const pattern = new RegExp(clean.replace(/-/g, '\\s*').replace(/series/g, ''), 'i');
    const matchedModels = allBrandModels.filter((m) => pattern.test(`${m.model} ${m.series}`));
    if (matchedModels.length > 0) {
      return {
        id: clean,
        slug: clean,
        name: clean.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        brand: brandDisplayName,
        image: matchedModels[0].image,
        modelsCount: matchedModels.length,
        models: matchedModels,
      };
    }

    return undefined;
  }, [effectiveSeriesSlug, seriesGroups, allBrandModels, brandDisplayName]);

  // Sub-models for current series
  const subModels = useMemo(() => {
    if (!currentSeriesGroup) return [];
    let list = currentSeriesGroup.models;

    // Fallback: if group models array is unexpectedly empty, search allBrandModels
    if (list.length === 0) {
      const terms = (currentSeriesGroup.name || effectiveSeriesSlug || '')
        .toLowerCase()
        .replace(/series/g, '')
        .trim()
        .split(/\s+/);
      list = allBrandModels.filter((m) => {
        const text = `${m.model} ${m.series}`.toLowerCase();
        return terms.some((t) => t.length > 2 && text.includes(t));
      });
    }

    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase();
      list = list.filter((m) => m.model.toLowerCase().includes(q));
    }
    return list;
  }, [currentSeriesGroup, effectiveSeriesSlug, allBrandModels, debouncedQuery]);

  // Global search matches across brand
  const globalSearchMatches = useMemo(() => {
    if (!debouncedQuery) return [];
    const q = debouncedQuery.toLowerCase();
    return allBrandModels.filter((m) => m.model.toLowerCase().includes(q));
  }, [allBrandModels, debouncedQuery]);

  const handleSelectModel = (modelName: string, storage: string) => {
    const modelSlugClean = modelName.toLowerCase().replace(/\s+/g, '-');
    navigate(`/sell/${brandCleanKey}/${modelSlugClean}?storage=${encodeURIComponent(storage)}`);
  };

  const handleSelectSeries = (series: SeriesGroup) => {
    navigate(`/sell/${brandCleanKey}/${series.slug}`);
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
    <div className="min-h-screen bg-transparent pb-24">
      {/* CASHIFY EXACT BREADCRUMB NAVIGATION */}
      <div className="bg-white/90 backdrop-blur-md border-b border-[#C0C8D8]/70 py-2.5 px-4 text-xs font-semibold text-[#47576E]">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 flex-wrap">
          <Link to="/" className="hover:text-[#344257] transition">Home</Link>
          <span>&gt;</span>
          <Link to="/sell" className="hover:text-[#344257] transition">Sell</Link>
          <span>&gt;</span>
          {effectiveSeriesSlug ? (
            <>
              <Link to={`/sell/${brandCleanKey}`} className="hover:text-[#344257] transition">
                {brandDisplayName}
              </Link>
              <span>&gt;</span>
              <span className="text-[#344257] font-extrabold">{currentSeriesGroup?.name || effectiveSeriesSlug}</span>
            </>
          ) : (
            <span className="text-[#344257] font-extrabold">{brandDisplayName}</span>
          )}
        </div>
      </div>

      {/* Clean Brand Header & Right-Corner Search Bar */}
      <section className="py-6 px-4">
        <div className="max-w-7xl mx-auto">
          {effectiveSeriesSlug && (
            <button
              type="button"
              onClick={() => navigate(`/sell/${brandCleanKey}`)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#47576E] hover:text-[#344257] transition cursor-pointer mb-3"
            >
              <ArrowLeft className="h-4 w-4 text-[#6A859F]" /> Back to all {brandDisplayName} Series
            </button>
          )}

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-black text-[#344257]">
                {effectiveSeriesSlug
                  ? `Sell Old ${currentSeriesGroup?.name || brandDisplayName} Online`
                  : `Sell Old ${brandDisplayName} Mobile Phone Online At Best Price`}
              </h1>
              <p className="text-xs text-[#47576E] mt-1">
                {effectiveSeriesSlug
                  ? `Select your exact ${currentSeriesGroup?.name || brandDisplayName} model below for instant spot valuation & doorstep pickup in Lucknow`
                  : `Select your ${brandDisplayName} model series below for instant spot cash & doorstep pickup in Lucknow`}
              </p>
            </div>

            {/* Search Bar Aligned at Right Corner */}
            <div className="relative w-full md:w-80 shrink-0">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6A859F]" />
                <input
                  type="text"
                  value={rawSearchQuery}
                  onChange={(e) => setRawSearchQuery(e.target.value)}
                  placeholder={
                    effectiveSeriesSlug
                      ? `Search in ${currentSeriesGroup?.name || brandDisplayName}...`
                      : `Search ${brandDisplayName} models...`
                  }
                  className="w-full pl-12 pr-10 py-3 rounded-2xl bg-white border border-[#C0C8D8] text-xs font-medium shadow-sm focus:border-[#6A859F] focus:ring-4 focus:ring-[#6A859F]/15 outline-none transition text-[#344257] placeholder:text-[#8A9AAF]"
                />
                {rawSearchQuery ? (
                  <button
                    type="button"
                    onClick={() => setRawSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : isSearching ? (
                  <RefreshCw className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#47576E] animate-spin" />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CATALOG CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        <div className="card p-6 md:p-8 rounded-[32px] bg-white border border-gray-200/80 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-black text-gray-900">
                {debouncedQuery
                  ? `Search Results for "${debouncedQuery}"`
                  : effectiveSeriesSlug
                  ? `Select ${currentSeriesGroup?.name || 'Model'}`
                  : `Select ${brandDisplayName} Series / Model`}
              </h2>
            </div>
            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3.5 py-1.5 rounded-xl border border-gray-200">
              {debouncedQuery
                ? `Showing ${globalSearchMatches.length} Matching Models`
                : effectiveSeriesSlug
                ? `Showing ${subModels.length} Models`
                : `Showing ${seriesGroups.length} Series Available`}
            </span>
          </div>

          {/* CATALOG CONTENT SWITCHER */}
          {isLoadingApi ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="h-8 w-8 text-[#00a896] animate-spin mx-auto" />
              <p className="text-xs font-bold text-gray-500">Fetching live {brandDisplayName} models...</p>
            </div>
          ) : debouncedQuery ? (
            /* ============================================================ */
            /* VIEW 1: GLOBAL SEARCH RESULTS ACROSS BRAND                   */
            /* ============================================================ */
            globalSearchMatches.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
                {globalSearchMatches.map((m) => {
                  const displayName = m.model.toLowerCase().startsWith((m.brand || brandDisplayName).toLowerCase())
                    ? m.model
                    : `${brandDisplayName} ${m.model}`;

                  return (
                    <div
                      key={m.model}
                      onClick={() => handleSelectModel(m.model, m.storage || '128 GB')}
                      className="p-3.5 sm:p-5 rounded-2xl border border-gray-100 bg-white hover:border-[#6A859F] hover:shadow-lg transition-all duration-200 group cursor-pointer flex flex-col items-center justify-between text-center min-h-[175px] sm:min-h-[210px]"
                    >
                      <div className="h-28 sm:h-36 w-full flex items-center justify-center p-1 relative overflow-hidden">
                        <img
                          src={getCleanPhoneImage(m.brand || brandDisplayName, m.model, m.image)}
                          alt={displayName}
                          className="h-full max-h-28 sm:max-h-36 w-auto object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-xs"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const target = e.currentTarget;
                            const fallback = BRAND_FRONT_FALLBACKS[brandCleanKey] || BRAND_FRONT_FALLBACKS.apple;
                            if (target.src !== fallback) {
                              target.src = fallback;
                            }
                          }}
                        />
                      </div>
                      <p className="mt-2 text-xs sm:text-sm font-semibold text-gray-800 group-hover:text-[#344257] transition-colors line-clamp-2 leading-snug">
                        {highlightMatch(displayName, debouncedQuery)}
                      </p>
                    </div>
                  );
                })}
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
                  onClick={() => setRawSearchQuery('')}
                  className="btn-outline text-xs px-4 py-2 cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
            )
          ) : effectiveSeriesSlug ? (
            /* ============================================================ */
            /* VIEW 2: SUB-MODELS OF SELECTED SERIES (e.g. iPhone 16)       */
            /* ============================================================ */
            subModels.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
                {subModels.map((m) => {
                  const displayName = m.model.toLowerCase().startsWith((m.brand || brandDisplayName).toLowerCase())
                    ? m.model
                    : `${brandDisplayName} ${m.model}`;

                  return (
                    <div
                      key={m.model}
                      onClick={() => handleSelectModel(m.model, m.storage || '128 GB')}
                      className="p-3.5 sm:p-5 rounded-2xl border border-gray-100 bg-white hover:border-[#6A859F] hover:shadow-lg transition-all duration-200 group cursor-pointer flex flex-col items-center justify-between text-center min-h-[175px] sm:min-h-[210px]"
                    >
                      <div className="h-28 sm:h-36 w-full flex items-center justify-center p-1 relative overflow-hidden">
                        <img
                          src={getCleanPhoneImage(m.brand || brandDisplayName, m.model, m.image)}
                          alt={displayName}
                          className="h-full max-h-28 sm:max-h-36 w-auto object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-xs"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const target = e.currentTarget;
                            const fallback = BRAND_FRONT_FALLBACKS[brandCleanKey] || BRAND_FRONT_FALLBACKS.apple;
                            if (target.src !== fallback) {
                              target.src = fallback;
                            }
                          }}
                        />
                      </div>
                      <p className="mt-2 text-xs sm:text-sm font-semibold text-gray-800 group-hover:text-[#344257] transition-colors line-clamp-2 leading-snug">
                        {displayName}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center space-y-3">
                <AlertCircle className="h-8 w-8 text-rose-500 mx-auto" />
                <h3 className="font-bold text-lg text-gray-900">No sub-models found in {currentSeriesGroup?.name || effectiveSeriesSlug}</h3>
                <button
                  type="button"
                  onClick={() => navigate(`/sell/${brandCleanKey}`)}
                  className="btn-outline text-xs px-4 py-2 cursor-pointer"
                >
                  View All {brandDisplayName} Series
                </button>
              </div>
            )
          ) : (
            /* ============================================================ */
            /* VIEW 3: SERIES SELECTION (iPhone 16 down to iPhone 1)        */
            /* ============================================================ */
            seriesGroups.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
                {seriesGroups.map((ser) => (
                  <div
                    key={ser.slug}
                    onClick={() => handleSelectSeries(ser)}
                    className="p-3.5 sm:p-5 rounded-2xl border border-gray-100 bg-white hover:border-[#6A859F] hover:shadow-lg transition-all duration-200 group cursor-pointer flex flex-col items-center justify-between text-center min-h-[175px] sm:min-h-[210px]"
                  >
                    <div className="h-28 sm:h-36 w-full flex items-center justify-center p-1 relative overflow-hidden">
                      <img
                        src={ser.image || getCleanPhoneImage(brandDisplayName, ser.name)}
                        alt={ser.name}
                        className="h-full max-h-28 sm:max-h-36 w-auto object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-xs"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.currentTarget;
                          const fallback = BRAND_FRONT_FALLBACKS[brandCleanKey] || BRAND_FRONT_FALLBACKS.apple;
                          if (target.src !== fallback) {
                            target.src = fallback;
                          }
                        }}
                      />
                    </div>
                    <div className="mt-2 w-full">
                      <p className="text-xs sm:text-sm font-bold text-[#344257] group-hover:text-[#47576E] transition-colors line-clamp-2 leading-snug">
                        {ser.name}
                      </p>
                      <p className="text-[11px] font-medium text-gray-400 mt-0.5">
                        {ser.modelsCount} Models
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center space-y-3">
                <AlertCircle className="h-8 w-8 text-rose-500 mx-auto" />
                <h3 className="font-bold text-lg text-gray-900">No {brandDisplayName} series available at this time</h3>
                <p className="text-xs text-gray-500">
                  Please call our Lucknow helpline at <span className="font-bold text-gray-900">+91-9839122345</span>.
                </p>
              </div>
            )
          )}
        </div>

        {/* CASHIFY "HOW IT WORKS" 3-STEP FLOW */}
        <div className="card p-8 rounded-[32px] bg-white border border-gray-200 space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="badge bg-[#F0F0F5] text-[#344257] border border-[#C0C8D8] text-xs font-bold">Simple 3-Step Process</span>
            <h2 className="font-display text-2xl font-black text-gray-900">How to Sell Old {brandDisplayName} Phone</h2>
            <p className="text-xs text-gray-500">Sell your mobile in under 2 minutes from home</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {[
              {
                num: '1',
                title: 'Select Model & Evaluate',
                desc: `Select your ${brandDisplayName} series and sub-model, storage variant, and answer simple condition questions.`,
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
