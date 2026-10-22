import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  ChevronLeft,
  ChevronRight,
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
  Mic,
  PhoneCall,
  Fingerprint,
  Droplets,
  ScanFace,
} from 'lucide-react';
import { formatINR, formatDisplayPrice } from '../lib/db';
import { MASTER_MODEL_CATALOG } from '../data/masterModelCatalog';
import { getCleanPhoneImage, getCleanBrandLogo, BRAND_FRONT_FALLBACKS, getGenericDevicePlaceholder } from '../lib/phoneImages';
import { ALL_INDIAN_PHONES_CATALOG } from '../data/indianPhonesCatalog';
import { useRepairPriceSync, getModelRepairPricing } from '../lib/repairPriceSync';
import { isModelDeleted } from '../lib/catalogSync';
import { getModelDedupeKey, groupModelsBySeries, inferModelSeries, isSeriesSlug, sortDeviceModelsLatestFirst } from '../data/brandSeriesCatalog';

const BRAND_REPAIR_DETAILS: Record<
  string,
  { logo: string; tagline: string; desc: string; count: string; series: string[] }
> = {
  apple: {
    logo: getCleanBrandLogo('Apple'),
    tagline: 'Doorstep iPhone Repair Our Services with Up to 6 Months Warranty',
    desc: 'Get certified doorstep Apple iPhone screen, battery, camera & back glass doorstep repair. 30-minute repair right in front of your eyes at home or office.',
    count: '30+ iPhone Models Covered',
    series: ['All', 'iPhone 15 Series', 'iPhone 14 Series', 'iPhone 13 Series', 'iPhone 12 Series', 'iPhone 11 Series'],
  },
  samsung: {
    logo: getCleanBrandLogo('Samsung'),
    tagline: 'Doorstep Samsung Galaxy Phone Repair & Display Replacement at your doorstep',
    desc: 'Original Super AMOLED screen replacement, battery health fix & motherboard IC repair for Samsung S, Z Fold, A & M series at your doorstep.',
    count: '45+ Samsung Models Covered',
    series: ['All', 'Galaxy S Series', 'Galaxy Z Series', 'Galaxy A Series', 'Galaxy M Series'],
  },
  oneplus: {
    logo: getCleanBrandLogo('OnePlus'),
    tagline: 'Doorstep OnePlus Mobile Screen, Battery & Charging Port Repair',
    desc: 'Quick 30-minute doorstep repair for OnePlus 12, 11, Nord & R series at your doorstep with 100% genuine spare parts.',
    count: '25+ OnePlus Models Covered',
    series: ['All', 'Number Series', 'Nord Series', 'R Series'],
  },
  xiaomi: {
    logo: getCleanBrandLogo('Xiaomi'),
    tagline: 'Fast Doorstep Xiaomi / Redmi / POCO Phone Doorstep Repair',
    desc: 'Expert display change, battery replacement & liquid damage diagnosis for Xiaomi Mi, Redmi Note & POCO mobiles at home.',
    count: '50+ Xiaomi Models Covered',
    series: ['All', 'Redmi Note Series', 'Mi Series', 'Redmi Series', 'Poco Series'],
  },
  vivo: {
    logo: getCleanBrandLogo('Vivo'),
    tagline: 'Doorstep Vivo Mobile Display & Glass Replacement Service',
    desc: 'Get your Vivo X, V & Y series phone repaired at your doorstep at your doorstep. Original parts & up to 6 months warranty.',
    count: '40+ Vivo Models Covered',
    series: ['All', 'X Series', 'V Series', 'Y Series'],
  },
  realme: {
    logo: getCleanBrandLogo('Realme'),
    tagline: 'Doorstep Realme Mobile Phone Repair & Battery Replacement',
    desc: 'Affordable doorstep screen & battery repair for Realme GT, Pro & C series across all major service zones.',
    count: '35+ Realme Models Covered',
    series: ['All', 'Pro Series', 'GT Series', 'C Series'],
  },
  oppo: {
    logo: getCleanBrandLogo('Oppo'),
    tagline: 'Doorstep Oppo Mobile Screen & Charging Port Repair',
    desc: 'Certified repair for Oppo Reno, Find & A series at your doorstep at your doorstep with zero visiting fees.',
    count: '30+ Oppo Models Covered',
    series: ['All', 'Reno Series', 'Find Series', 'A Series'],
  },
  google: {
    logo: getCleanBrandLogo('Google'),
    tagline: 'Doorstep Google Pixel Display & Battery Doorstep Repair',
    desc: 'Specialized doorstep repair for Google Pixel 8, 7 & 6 series with OEM screen panels & original batteries.',
    count: '15+ Pixel Models Covered',
    series: ['All', 'Pixel Series'],
  },
  motorola: {
    logo: getCleanBrandLogo('Motorola'),
    tagline: 'Doorstep Motorola Phone Display & Battery Doorstep Repair',
    desc: 'Certified repair for Motorola Edge, Moto G & Razr series at your doorstep with genuine replacement parts.',
    count: '25+ Motorola Models Covered',
    series: ['All', 'Edge Series', 'G Series', 'Razr Series'],
  },
  nothing: {
    logo: getCleanBrandLogo('Nothing'),
    tagline: 'Doorstep Nothing Phone Repair & Glyph Interface Diagnostics',
    desc: 'Doorstep transparent back glass, OLED display & battery repair for Nothing Phone (1), (2), (2a) & CMF at your doorstep.',
    count: '4+ Nothing Models Covered',
    series: ['All', 'Phone Series', 'CMF Series'],
  },
};

const COMMON_REPAIR_SERVICES = [
  { id: 'screen', label: 'Screen & Display Replacement', cost: 2999, time: '30 Mins', warranty: '6 Months', icon: Monitor },
  { id: 'battery', label: 'Battery Replacement', cost: 1499, time: '20 Mins', warranty: '6 Months', icon: BatteryCharging },
  { id: 'charging', label: 'Charging Port', cost: 699, time: '25 Mins', warranty: '3 Months', icon: Zap },
  { id: 'mic', label: 'Mic', cost: 499, time: '20 Mins', warranty: '3 Months', icon: Mic },
  { id: 'speaker', label: 'Speaker', cost: 599, time: '20 Mins', warranty: '3 Months', icon: Volume2 },
  { id: 'receiver', label: 'Receiver', cost: 499, time: '20 Mins', warranty: '3 Months', icon: PhoneCall },
  { id: 'front_camera', label: 'Front camera', cost: 999, time: '30 Mins', warranty: '6 Months', icon: Camera },
  { id: 'back_camera', label: 'Back camera', cost: 1299, time: '30 Mins', warranty: '6 Months', icon: Camera },
  { id: 'motherboard', label: 'Motherboard IC', cost: 299, time: '24 Hr Lab', warranty: 'Inspection Only', icon: Cpu, note: 'The ₹299 charge is for inspection only. Any repair costs will be confirmed after checking the device at TheFundu.' },
  { id: 'fingerprint', label: 'Fingerprint Sensor', cost: 699, time: '25 Mins', warranty: '3 Months', icon: Fingerprint },
  { id: 'faceid', label: 'Faceid sensor', cost: 1499, time: '45 Mins', warranty: '6 Months', icon: ScanFace },
  { id: 'water_damage', label: 'Water damaged/dead phone', cost: 199, time: '24 Hr Lab', warranty: 'Inspection Only', icon: Droplets, note: 'The ₹199 charge is for inspection only. Any repair costs will be confirmed after checking the device at TheFundu.' },
];

export default function RepairBrandPage() {
  const { brandSlug, seriesSlug, modelSlug } = useParams<{
    brandSlug?: string;
    seriesSlug?: string;
    modelSlug?: string;
  }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { configs: repairConfigs } = useRepairPriceSync();

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
    tagline: `Doorstep ${brandDisplayName} Mobile Repair Service at your doorstep`,
    desc: `Get certified doorstep ${brandDisplayName} mobile screen, battery, camera & motherboard doorstep repair with up to 6 months warranty.`,
    count: `30+ ${brandDisplayName} Models Covered`,
    series: ['All'],
  };

  const effectiveSeriesSlug = useMemo(() => {
    if (seriesSlug) return seriesSlug;
    if (modelSlug && isSeriesSlug(modelSlug)) return modelSlug;
    return undefined;
  }, [seriesSlug, modelSlug]);

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

  // 1. Raw models list from Admin configs, Indian catalog, and Master catalog
  const rawBrandModels = useMemo(() => {
    const isForeignBrandModel = (brandKey: string, modelName: string) => {
      const mLower = (modelName || '').toLowerCase().trim();
      if (brandKey === 'apple' && /\b(oneplus|samsung|galaxy|xiaomi|redmi|poco|vivo|iqoo|oppo|realme|motorola|moto|pixel|google|nothing)\b/i.test(mLower)) {
        return true;
      }
      if (brandKey === 'samsung' && /\b(iphone|apple|oneplus|xiaomi|redmi|poco|vivo|iqoo|oppo|realme|motorola|pixel)\b/i.test(mLower)) {
        return true;
      }
      if (brandKey === 'oneplus' && /\b(iphone|apple|samsung|galaxy|xiaomi|redmi|poco|vivo|iqoo|oppo|realme|motorola|pixel)\b/i.test(mLower)) {
        return true;
      }
      return false;
    };

    const adminModels = (repairConfigs || [])
      .filter((c) => (c.brand || '').toLowerCase().trim() === brandCleanKey && c.is_active !== false && !isForeignBrandModel(brandCleanKey, c.model))
      .map((c) => ({
        brand: c.brand,
        model: c.model,
        series: c.device_series || '',
        image: c.image_url || '',
        price: c.base_repair_price || 599,
      }));

    const adminNames = new Set(adminModels.map((m) => m.model.toLowerCase().replace(/[\s-]+/g, '')));

    const indianList = ALL_INDIAN_PHONES_CATALOG.filter(
      (p) => p.brand.toLowerCase() === brandCleanKey && !adminNames.has(p.model.toLowerCase().replace(/[\s-]+/g, '')) && !isForeignBrandModel(brandCleanKey, p.model)
    ).map((p) => ({
      brand: p.brand,
      model: p.model,
      series: p.series || '',
      image: p.image_url,
      price: 599,
    }));

    const masterList = MASTER_MODEL_CATALOG.filter(
      (m) =>
        m.brand.toLowerCase() === brandCleanKey &&
        !adminNames.has(m.model.toLowerCase().replace(/[\s-]+/g, '')) &&
        !isForeignBrandModel(brandCleanKey, m.model) &&
        !indianList.some((ip) => getModelDedupeKey(ip.brand, ip.model) === getModelDedupeKey(m.brand, m.model))
    ).map((m) => ({
      brand: m.brand,
      model: m.model,
      series: m.series || '',
      image: m.image,
      price: 599,
    }));

    const rawList = [...adminModels, ...indianList, ...masterList].filter(
      (m) => !isForeignBrandModel(brandCleanKey, m.model) && !isModelDeleted(m.brand || brandDisplayName, m.model)
    );

    // Deduplicate entire list
    const seenRepair = new Set<string>();
    const dedupeList: typeof rawList = [];
    rawList.forEach((m) => {
      const dKey = getModelDedupeKey(m.brand || brandDisplayName, m.model);
      if (!seenRepair.has(dKey)) {
        seenRepair.add(dKey);
        dedupeList.push(m);
      }
    });

    return dedupeList;
  }, [brandCleanKey, brandDisplayName, repairConfigs]);

  // 2. Group into Series Groups (e.g. Galaxy S25 Series, S24 Series, Z Series, Note Series, A Series, etc.)
  const seriesGroups = useMemo(() => {
    return groupModelsBySeries(brandCleanKey, rawBrandModels);
  }, [brandCleanKey, rawBrandModels]);

  // 3. Series tabs derived dynamically from seriesGroups
  const seriesTabs = useMemo(() => {
    const list = seriesGroups.filter((g) => g.models.length > 0).map((g) => g.name);
    return ['All', ...list];
  }, [seriesGroups]);

  // 4. Sync effective series slug to selectedSeries
  useEffect(() => {
    if (effectiveSeriesSlug) {
      const clean = effectiveSeriesSlug.toLowerCase().replace(/^(repair-|sell-)/, '');
      const match = seriesGroups.find(
        (g) =>
          g.slug.toLowerCase() === clean ||
          g.id.toLowerCase() === clean ||
          g.name.toLowerCase().includes(clean)
      );
      if (match) {
        setSelectedSeries(match.name);
      } else {
        setSelectedSeries(effectiveSeriesSlug);
      }
    } else {
      setSelectedSeries('All');
    }
  }, [effectiveSeriesSlug, seriesGroups]);

  // Series sliding track state & smooth sliding controller
  const seriesScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = () => {
    const el = seriesScrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  };

  useEffect(() => {
    updateScrollButtons();
    const el = seriesScrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollButtons, { passive: true });
    window.addEventListener('resize', updateScrollButtons);
    return () => {
      el.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [seriesTabs]);

  // Automatically slide the selected series pill into center view
  useEffect(() => {
    const el = seriesScrollRef.current;
    if (!el) return;
    const activeBtn = el.querySelector<HTMLElement>('[data-active="true"]');
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    const timer = setTimeout(updateScrollButtons, 320);
    return () => clearTimeout(timer);
  }, [selectedSeries]);

  const slideSeries = (direction: 'left' | 'right') => {
    const el = seriesScrollRef.current;
    if (!el) return;
    const scrollDistance = Math.max(260, Math.floor(el.clientWidth * 0.75));
    el.scrollBy({
      left: direction === 'left' ? -scrollDistance : scrollDistance,
      behavior: 'smooth',
    });
  };

  // 5. Flatten models in sequential series order, each stamped with its exact series
  const allModelsInSeriesOrder = useMemo(() => {
    const models: Array<{
      brand: string;
      model: string;
      series: string;
      seriesSlug: string;
      image?: string | null;
      price: number;
    }> = [];
    const seen = new Set<string>();

    seriesGroups.forEach((group) => {
      const sortedGroupModels = sortDeviceModelsLatestFirst(brandCleanKey, group.models || []);
      sortedGroupModels.forEach((m) => {
        const key = getModelDedupeKey(m.brand || brandDisplayName, m.model);
        if (!seen.has(key)) {
          seen.add(key);
          models.push({
            brand: m.brand || brandDisplayName,
            model: m.model,
            series: group.name,
            seriesSlug: group.slug,
            image: m.image,
            price: m.price || 599,
          });
        }
      });
    });

    // Any leftovers - accurately mapped to series via inferModelSeries
    const leftovers: Array<{
      brand: string;
      model: string;
      series: string;
      seriesSlug: string;
      image?: string | null;
      price: number;
    }> = [];
    rawBrandModels.forEach((m) => {
      const key = getModelDedupeKey(m.brand || brandDisplayName, m.model);
      if (!seen.has(key)) {
        seen.add(key);
        const inferred = inferModelSeries(m.brand || brandDisplayName, m.model, m.series);
        leftovers.push({
          ...m,
          series: inferred.seriesName,
          seriesSlug: inferred.seriesSlug,
        });
      }
    });

    if (leftovers.length > 0) {
      models.push(...sortDeviceModelsLatestFirst(brandCleanKey, leftovers));
    }

    return models;
  }, [seriesGroups, rawBrandModels, brandDisplayName, brandCleanKey]);

  // 6. Final filtered models
  const brandModels = useMemo(() => {
    let list = allModelsInSeriesOrder;

    if (selectedSeries !== 'All') {
      const cleanSel = selectedSeries.toLowerCase().replace(/^(repair-|sell-)/, '');
      const filtered = list.filter(
        (m) =>
          m.series.toLowerCase() === selectedSeries.toLowerCase() ||
          m.seriesSlug.toLowerCase() === cleanSel ||
          m.series.toLowerCase().includes(cleanSel)
      );
      list = sortDeviceModelsLatestFirst(brandCleanKey, filtered);
    }

    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase();
      const searched = list.filter((m) => m.model.toLowerCase().includes(q));
      list = sortDeviceModelsLatestFirst(brandCleanKey, searched);
    }

    return list;
  }, [allModelsInSeriesOrder, selectedSeries, debouncedQuery, brandCleanKey]);

  // Grouped models by Series for organized chronological section layout
  const seriesGroupedSections = useMemo(() => {
    const map = new Map<string, typeof brandModels>();
    brandModels.forEach((m) => {
      const s = m.series || `${brandDisplayName} Series`;
      if (!map.has(s)) map.set(s, []);
      map.get(s)!.push(m);
    });
    return Array.from(map.entries()).map(([name, models]) => ({
      name,
      models: sortDeviceModelsLatestFirst(brandCleanKey, models),
    }));
  }, [brandModels, brandDisplayName, brandCleanKey]);

  const handleBookRepair = (modelName: string, issueId: string = 'screen') => {
    const modelSlugClean = modelName.toLowerCase().replace(/\s+/g, '-');
    const targetUrl = `/repair/${brandCleanKey}/${modelSlugClean}?step=2&issue=${encodeURIComponent(issueId)}`;
    navigate(targetUrl);
  };

  const brandCommonServices = useMemo(() => {
    return COMMON_REPAIR_SERVICES.map((srv) => {
      const brandConfigs = (repairConfigs || []).filter(
        (c) => (c.brand || '').toLowerCase() === brandCleanKey && c.is_active !== false
      );
      const prices = brandConfigs
        .map((c) => c.services?.find((s) => s.service_id === srv.id && s.is_available !== false)?.price)
        .filter((p): p is number => typeof p === 'number' && p > 0);

      const lowestPrice = prices.length > 0 ? Math.min(...prices) : srv.cost;
      return {
        ...srv,
        cost: lowestPrice,
      };
    });
  }, [brandCleanKey, repairConfigs]);

  return (
    <div className="min-h-screen bg-[#F0F0F5] pb-24">
      {/* BREADCRUMB NAVIGATION */}
      <div className="bg-white border-b border-[#C0C8D8]/50 py-2.5 px-4 text-xs font-semibold text-[#8A9AAF]">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 flex-wrap">
          <Link to="/" className="hover:text-[#344257] transition">Home</Link>
          <span>&gt;</span>
          <Link to="/repair" className="hover:text-[#344257] transition">Repair</Link>
          <span>&gt;</span>
          <span className="text-[#344257] font-extrabold">{brandDisplayName}</span>
        </div>
      </div>

      {/* BRAND REPAIR HERO */}
      <section className="py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-white p-3 border border-[#C0C8D8]/80 shadow-sm flex items-center justify-center shrink-0">
                <img
                  src={brandInfo.logo || getCleanBrandLogo(brandCleanKey)}
                  alt={brandDisplayName}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6A859F]/15 border border-[#6A859F]/30 text-[#344257] font-extrabold text-xs mb-2">
                  <Wrench className="h-3.5 w-3.5 text-[#47576E]" /> Doorstep Repair Center
                </div>
                <h1 className="font-display text-2xl md:text-3xl font-black text-[#344257]">
                  Doorstep {brandDisplayName} Doorstep Mobile Repair
                </h1>
                <p className="text-xs text-[#47576E] mt-1 max-w-2xl font-medium">
                  {brandInfo.desc}
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-80 shrink-0">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8A9AAF]" />
                <input
                  type="text"
                  value={rawSearchQuery}
                  onChange={(e) => setRawSearchQuery(e.target.value)}
                  placeholder={`Search ${brandDisplayName} model to repair...`}
                  className="w-full pl-12 pr-10 py-3 rounded-2xl bg-white border border-[#C0C8D8] text-xs font-medium text-[#344257] shadow-sm focus:border-[#6A859F] focus:ring-4 focus:ring-[#6A859F]/15 outline-none transition"
                />
                {isSearching && (
                  <RefreshCw className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#47576E] animate-spin" />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* 1. MODEL SELECTION GRID (First Step: Select Model) */}
        <div className="card p-6 md:p-8 rounded-[32px] bg-white border border-[#C0C8D8]/70 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <span className="badge bg-[#6A859F]/15 border border-[#6A859F]/30 text-[#344257] font-extrabold text-xs">
                Step 1: Pick Device
              </span>
              <h2 className="font-display text-xl sm:text-2xl font-black text-[#344257] mt-1">
                Select {brandDisplayName} Model
              </h2>
            </div>
            <span className="text-xs font-bold text-[#47576E] bg-[#F7F7FA] px-3.5 py-1.5 rounded-xl border border-[#C0C8D8]/60">
              Showing {brandModels.length} Models
            </span>
          </div>

          {/* Horizontal Series Filter Tabs (Sliding with Smooth Navigation Arrows & Gradient Fades) */}
          {seriesTabs.length > 1 && (
            <div className="relative border-b border-gray-100 pb-4 group/slider">
              {/* Left Slide Arrow with Gradient Mask */}
              {canScrollLeft && (
                <div className="absolute left-0 top-0 bottom-4 z-10 flex items-center pr-3 bg-gradient-to-r from-white via-white/95 to-transparent">
                  <button
                    type="button"
                    onClick={() => slideSeries('left')}
                    aria-label="Slide Left"
                    className="h-8 w-8 rounded-full bg-white border border-[#C0C8D8] text-[#344257] hover:bg-[#344257] hover:text-white shadow-md flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Scrollable Sliding Track */}
              <div
                ref={seriesScrollRef}
                className="flex items-center gap-2 overflow-x-auto scroll-smooth scrollbar-none py-1 select-none"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <span className="text-xs font-bold text-[#8A9AAF] uppercase tracking-wider shrink-0 mr-1">Series:</span>
                {seriesTabs.map((ser) => {
                  const isSelected = selectedSeries === ser;
                  return (
                    <button
                      key={ser}
                      type="button"
                      data-active={isSelected}
                      onClick={() => setSelectedSeries(ser)}
                      className={`px-4 py-2 rounded-full text-xs font-extrabold transition shrink-0 cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#344257] to-[#5D6A82] text-white shadow-md scale-[1.02]'
                          : 'bg-[#F7F7FA] text-[#47576E] hover:bg-[#F0F0F5] hover:text-[#344257] border border-transparent hover:border-[#C0C8D8]'
                      }`}
                    >
                      {ser}
                    </button>
                  );
                })}
              </div>

              {/* Right Slide Arrow with Gradient Mask */}
              {canScrollRight && (
                <div className="absolute right-0 top-0 bottom-4 z-10 flex items-center pl-3 bg-gradient-to-l from-white via-white/95 to-transparent">
                  <button
                    type="button"
                    onClick={() => slideSeries('right')}
                    aria-label="Slide Right"
                    className="h-8 w-8 rounded-full bg-white border border-[#C0C8D8] text-[#344257] hover:bg-[#344257] hover:text-white shadow-md flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 6-COLUMN RESPONSIVE MODEL PRODUCT TILE GRID REARRANGED BY SERIES */}
          {brandModels.length > 0 ? (
            selectedSeries === 'All' && !debouncedQuery ? (
              <div className="space-y-8">
                {seriesGroupedSections.map((group) => (
                  <div key={group.name} className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#344257]" />
                        <h3 className="font-display font-black text-base sm:text-lg text-[#344257]">
                          {group.name}
                        </h3>
                        <span className="text-[11px] font-extrabold text-[#47576E] bg-[#F0F0F5] border border-[#C0C8D8] px-2.5 py-0.5 rounded-full">
                          {group.models.length} Models
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedSeries(group.name)}
                        className="text-xs font-extrabold text-[#47576E] hover:text-[#344257] hover:underline cursor-pointer"
                      >
                        Filter {group.name} Only →
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
                      {group.models.map((m) => {
                        const displayName = m.model.toLowerCase().startsWith((m.brand || brandDisplayName).toLowerCase())
                          ? m.model
                          : `${brandDisplayName} ${m.model}`;

                        return (
                          <div
                            key={m.model}
                            onClick={() => handleBookRepair(m.model, 'screen')}
                            className="p-3.5 sm:p-5 rounded-2xl border border-gray-100 bg-white hover:border-[#6A859F] hover:shadow-lg transition-all duration-200 group cursor-pointer flex flex-col items-center justify-between text-center min-h-[195px] sm:min-h-[230px]"
                          >
                            <span className="text-[10px] font-extrabold text-[#344257] bg-[#F0F0F5] border border-[#C0C8D8] group-hover:bg-[#344257] group-hover:text-white transition-colors px-2.5 py-0.5 rounded-full mb-1 truncate max-w-full">
                              {m.series || `${brandDisplayName} Series`}
                            </span>

                            <div className="h-32 sm:h-40 w-full flex items-center justify-center p-2.5 relative">
                              <img
                                src={getCleanPhoneImage(m.brand || brandDisplayName, m.model, m.image || undefined)}
                                alt={displayName}
                                className="max-h-full max-w-full w-auto h-auto object-contain group-hover:scale-105 transition-transform duration-300 filter drop-shadow-sm mix-blend-multiply"
                                loading="lazy"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  const bSlug = (m.brand || brandDisplayName).toLowerCase().replace(/[^a-z0-9]/g, '');
                                  if (!target.dataset.triedBrandFallback) {
                                    target.dataset.triedBrandFallback = 'true';
                                    const fallback = BRAND_FRONT_FALLBACKS[bSlug] || BRAND_FRONT_FALLBACKS.apple;
                                    if (target.src !== fallback) {
                                      target.src = fallback;
                                      return;
                                    }
                                  }
                                  target.src = getGenericDevicePlaceholder(m.brand || brandDisplayName, m.model);
                                }}
                              />
                            </div>

                            <p className="mt-2 text-xs sm:text-sm font-semibold text-gray-800 group-hover:text-[#344257] transition-colors line-clamp-2 leading-snug">
                              {displayName}
                            </p>

                            <div className="mt-2.5 w-full py-1.5 px-2 rounded-xl bg-[#F0F0F5] group-hover:bg-[#344257] group-hover:text-white text-[#344257] text-[11px] font-extrabold text-center transition-colors">
                              Select Issues
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
                {brandModels.map((m) => {
                  const displayName = m.model.toLowerCase().startsWith((m.brand || brandDisplayName).toLowerCase())
                    ? m.model
                    : `${brandDisplayName} ${m.model}`;

                  return (
                    <div
                      key={m.model}
                      onClick={() => handleBookRepair(m.model, 'screen')}
                      className="p-3.5 sm:p-5 rounded-2xl border border-gray-100 bg-white hover:border-[#6A859F] hover:shadow-lg transition-all duration-200 group cursor-pointer flex flex-col items-center justify-between text-center min-h-[195px] sm:min-h-[230px]"
                    >
                      <span className="text-[10px] font-extrabold text-[#344257] bg-[#F0F0F5] border border-[#C0C8D8] group-hover:bg-[#344257] group-hover:text-white transition-colors px-2.5 py-0.5 rounded-full mb-1 truncate max-w-full">
                        {m.series || `${brandDisplayName} Series`}
                      </span>

                      <div className="h-32 sm:h-40 w-full flex items-center justify-center p-2.5 relative">
                        <img
                          src={getCleanPhoneImage(m.brand || brandDisplayName, m.model, m.image || undefined)}
                          alt={displayName}
                          className="max-h-full max-w-full w-auto h-auto object-contain group-hover:scale-105 transition-transform duration-300 filter drop-shadow-sm mix-blend-multiply"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const target = e.currentTarget;
                            const bSlug = (m.brand || brandDisplayName).toLowerCase().replace(/[^a-z0-9]/g, '');
                            if (!target.dataset.triedBrandFallback) {
                              target.dataset.triedBrandFallback = 'true';
                              const fallback = BRAND_FRONT_FALLBACKS[bSlug] || BRAND_FRONT_FALLBACKS.apple;
                              if (target.src !== fallback) {
                                target.src = fallback;
                                return;
                              }
                            }
                            target.src = getGenericDevicePlaceholder(m.brand || brandDisplayName, m.model);
                          }}
                        />
                      </div>

                      <p className="mt-2 text-xs sm:text-sm font-semibold text-gray-800 group-hover:text-[#344257] transition-colors line-clamp-2 leading-snug">
                        {displayName}
                      </p>

                      <div className="mt-2.5 w-full py-1.5 px-2 rounded-xl bg-[#F0F0F5] group-hover:bg-[#344257] group-hover:text-white text-[#344257] text-[11px] font-extrabold text-center transition-colors">
                        Select Issues
                      </div>
                    </div>
                  );
                })}
              </div>
            )
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

        {/* 2. COMMON REPAIR ISSUES CAROUSEL / GRID (Or Pick by Problem) */}
        <div className="card p-6 md:p-8 rounded-[32px] bg-white border border-[#C0C8D8]/70 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="badge bg-[#6A859F]/15 border border-[#6A859F]/30 text-[#344257] font-extrabold text-xs">Or Pick by Problem</span>
              <h2 className="font-display text-xl font-black text-[#344257] mt-1">
                Common Repair Issues for {brandDisplayName}
              </h2>
            </div>
            <span className="text-xs font-bold text-[#47576E] bg-[#F7F7FA] px-3 py-1 rounded-full border border-[#C0C8D8]/50">6 Months Warranty</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {brandCommonServices.map((srv) => {
              const IconComp = srv.icon;
              return (
                <div
                  key={srv.id}
                  onClick={() => navigate(`/repair/issue/${srv.id}`)}
                  className="p-4 rounded-2xl border border-[#C0C8D8]/60 bg-[#F7F7FA] hover:bg-white hover:border-[#6A859F] hover:shadow-md transition cursor-pointer text-center space-y-2 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#344257] to-[#5D6A82] text-white grid place-items-center mx-auto shadow-sm group-hover:scale-110 transition">
                    <IconComp className="h-5 w-5" />
                  </div>
                  <p className="font-bold text-xs text-[#344257] line-clamp-1">{srv.label}</p>
                  <p className="text-[11px] font-black text-[#47576E]">From {formatDisplayPrice(srv.cost, !!user)}</p>
                  {(srv as any).note ? (
                    <span className="inline-block text-[9px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      ⚠️ Inspection Only
                    </span>
                  ) : (
                    <span className="inline-block text-[10px] text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                      ⏱️ {srv.time}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 3-STEP REPAIR PROCESS */}
        <div className="card p-8 rounded-[32px] bg-white border border-[#C0C8D8]/70 shadow-sm space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="badge bg-[#6A859F]/15 border border-[#6A859F]/30 text-[#344257] text-xs font-bold">Fast & Convenient</span>
            <h2 className="font-display text-2xl font-black text-[#344257]">How Doorstep {brandDisplayName} Repair Works</h2>
            <p className="text-xs text-[#47576E]">Repaired right at your home or office in 30 minutes</p>
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
                desc: 'Select your preferred date & location. Our certified technician visits your doorstep.',
              },
              {
                num: '3',
                title: 'Repaired in 30 Mins & Pay',
                desc: 'Tech repairs your phone in front of your eyes. Test thoroughly and pay via cash or UPI!',
              },
            ].map((stepItem) => (
              <div key={stepItem.num} className="p-6 rounded-2xl bg-[#F7F7FA] border border-[#C0C8D8]/60 flex flex-col items-center text-center space-y-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-r from-[#344257] to-[#5D6A82] text-white font-display font-black text-xl shadow-md">
                  {stepItem.num}
                </div>
                <h3 className="font-extrabold text-base text-[#344257]">{stepItem.title}</h3>
                <p className="text-xs text-[#47576E] leading-relaxed">{stepItem.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* REPAIR ADVANTAGES */}
        <div className="card p-8 rounded-[32px] bg-[#344257] text-white border border-[#47576E] shadow-xl space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="badge bg-[#6A859F]/20 text-[#C0C8D8] border border-[#6A859F]/40 text-xs font-bold px-3 py-1">
              Our #1 Doorstep Mobile Service
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-black text-white">
              Why Choose Fundu for {brandDisplayName} Repair?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: <Wrench className="h-6 w-6 text-[#C0C8D8]" />,
                title: '30-Minute Doorstep Fix',
                desc: 'No need to leave your home or travel to local markets. Repair completed right at your desk.',
              },
              {
                icon: <ShieldCheck className="h-6 w-6 text-emerald-400" />,
                title: 'Up to 6 Months Warranty',
                desc: 'All replaced screens, batteries & camera parts come with genuine warranty protection.',
              },
              {
                icon: <Lock className="h-6 w-6 text-sky-300" />,
                title: '100% Personal Data Safe',
                desc: 'Repair happens right in front of your eyes. No need to share passwords or unlock pin.',
              },
              {
                icon: <BadgeIndianRupee className="h-6 w-6 text-amber-300" />,
                title: 'Pay ONLY After Testing',
                desc: 'Zero advance payment required. Test your touch, display, battery & camera first, then pay.',
              },
              {
                icon: <Truck className="h-6 w-6 text-rose-300" />,
                title: 'Zero Visiting Charges',
                desc: 'Free doorstep technician visit across Gomti Nagar, Hazratganj, Indira Nagar, Aliganj & Chowk.',
              },
              {
                icon: <CheckCircle2 className="h-6 w-6 text-emerald-300" />,
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
        <div className="card p-8 rounded-[32px] bg-white border border-[#C0C8D8]/70 shadow-sm space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="badge bg-[#6A859F]/15 border border-[#6A859F]/30 text-[#344257] text-xs font-bold">Frequently Asked Questions</span>
            <h2 className="font-display text-2xl font-black text-[#344257]">
              {brandDisplayName} Doorstep Repair FAQs
            </h2>
          </div>

          <div className="space-y-3 max-w-4xl mx-auto">
            {[
              {
                q: `How long does it take to repair a ${brandDisplayName} phone at my doorstep at your doorstep?`,
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
                    className="w-full p-4 text-left font-bold text-sm text-[#344257] flex items-center justify-between gap-4 hover:bg-[#F7F7FA] transition cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-[#6A859F] shrink-0" /> {f.q}
                    </span>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-gray-600 leading-relaxed border-t border-gray-100 bg-[#F7F7FA]">
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
