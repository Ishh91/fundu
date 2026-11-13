import { useEffect, useMemo, useState, useRef } from 'react';
import {
  Search,
  Smartphone,
  ShieldCheck,
  ShoppingCart,
  CheckCircle2,
  Truck,
  X,
  Filter,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  RotateCcw,
  MessageSquare,
  Tag,
  Award,
  Zap,
  BatteryCharging,
  Camera,
  Cpu,
  Wifi,
  SlidersHorizontal,
  Star,
  PackageCheck,
  Check,
  ArrowRight,
  ShieldAlert,
  Play,
  Film,
} from 'lucide-react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { db, formatINR } from '../lib/db';
import { deduplicateProductsByModel } from '../lib/modelVariants';
import { getCachedPhones, setCachedPhones } from '../lib/productsCache';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getCleanPhoneImage, getCleanBrandLogo } from '../lib/phoneImages';
import { isProductDeleted, useCatalogSync } from '../lib/catalogSync';
import { subscribeToRealtimeSync } from '../lib/realtimeSync';
import type { Product } from '../types';
import { SAMPLE_BEST_SELLING_PHONES } from '../data/sampleProducts';

// Circular brand filters with brand logos
const BRAND_PILLS = [
  { name: 'All', label: 'All Brands' },
  { name: 'Apple', label: 'Apple' },
  { name: 'Samsung', label: 'Samsung' },
  { name: 'OnePlus', label: 'OnePlus' },
  { name: 'Xiaomi', label: 'Xiaomi' },
  { name: 'Vivo', label: 'Vivo' },
  { name: 'Oppo', label: 'Oppo' },
  { name: 'Realme', label: 'Realme' },
  { name: 'Nothing', label: 'Nothing' },
  { name: 'Google', label: 'Pixel' },
  { name: 'Motorola', label: 'Motorola' },
  { name: 'Tecno', label: 'Tecno' },
  { name: 'Itel', label: 'Itel' },
  { name: 'Poco', label: 'POCO' },
  { name: 'iQOO', label: 'iQOO' },
];

const PRICE_PRESETS = [
  { label: 'All Prices', min: 0, max: 250000 },
  { label: 'Under ₹10,000', min: 0, max: 10000 },
  { label: '₹10,000 - ₹20,000', min: 10000, max: 20000 },
  { label: '₹20,000 - ₹35,000', min: 20000, max: 35000 },
  { label: '₹35,000 - ₹50,000', min: 35000, max: 50000 },
  { label: 'Above ₹50,000', min: 50000, max: 250000 },
];

const QUALITY_CHECK_POINTS = [
  {
    category: 'Display & Touchscreen',
    icon: Smartphone,
    points: ['TrueColor original OLED/LCD', '100% Touch responsiveness across screen', 'Zero dead pixels or burn-ins', 'Multi-touch gesture calibration'],
  },
  {
    category: 'Battery & Power Health',
    icon: BatteryCharging,
    points: ['Guaranteed >85% battery health retention', 'Original fast charging voltage tested', 'Thermal stability under load', 'Safe standby drain rate check'],
  },
  {
    category: 'Camera & Optics',
    icon: Camera,
    points: ['Primary & telephoto optical alignment', 'Optical Image Stabilization (OIS) pass', 'Front portrait selfie clarity', '4K video & microphone sync test'],
  },
  {
    category: 'Processor & Motherboard',
    icon: Cpu,
    points: ['Motherboard component diagnostic', 'RAM / storage read-write speed check', 'No water damage / moisture check', 'Zero performance throttling'],
  },
  {
    category: 'Connectivity & Sensors',
    icon: Wifi,
    points: ['5G / 4G LTE signal reception check', 'Dual-band Wi-Fi 6 & Bluetooth 5.3', 'GPS & Compass positioning accuracy', 'Biometrics (Face ID & Fingerprint)'],
  },
];

const BUYER_FAQS = [
  {
    q: 'What is a Fundu Certified Refurbished Phone?',
    a: 'A Fundu Certified Refurbished phone is a gently used or pre-owned smartphone that has undergone rigorous 32-point diagnostic inspection by certified engineers. Every component — including display, battery health, cameras, motherboard, and sensors — is verified 100% functional. Devices are professionally sanitized, graded honestly, and backed by a free 6-month Fundu warranty.',
  },
  {
    q: 'What are the Refurbished Condition Grades (Superb vs Good vs Fair)?',
    a: '• Superb (Like New): Flawless screen and body with near-zero signs of usage. 100% original parts and >88% battery health.\n• Good: Light cosmetic scuffs or faint scratches on the frame/back, but 100% pristine original screen and fully functional hardware.\n• Fair (Budget): Visible signs of wear on the body, but screen and internal components are completely functional and pass all 32 quality points.',
  },
  {
    q: 'How does the 6-Month Warranty work?',
    a: 'Every refurbished phone includes a 6-month warranty covering manufacturing defects, display glitches, motherboard issues, and technical hardware failures. If an issue occurs, our certified technician repairs or replaces it free of charge.',
  },
  {
    q: 'Do I get free doorstep delivery?',
    a: 'Yes! We offer 100% free doorstep delivery across all service areas locations including Gomti Nagar, Hazratganj, Indira Nagar, Aliganj, Mahanagar, Sushant Golf City, Jankipuram, and surrounding areas. Delivery is typically completed within 2 to 24 hours.',
  },
  {
    q: 'Can I inspect the phone before accepting delivery?',
    a: 'Yes! Our doorstep delivery executive allows you an Open Box Inspection. You can verify the cosmetic condition, camera, display, and charging before making payment or signing the receipt.',
  },
  {
    q: 'What is the 7-Day Replacement Guarantee?',
    a: 'If you discover any technical defect within 7 days of delivery that was not described, we will replace the device with an identical certified model or provide a 100% refund, no questions asked.',
  },
];

export default function BuyPhones() {
  const { user, profile } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { syncVersion } = useCatalogSync();

  const [products, setProducts] = useState<Product[]>(() => getCachedPhones());
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [gradeFilter, setGradeFilter] = useState<string>('All');
  const [pricePreset, setPricePreset] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(120000);
  const [selectedStorage, setSelectedStorage] = useState<string>('');
  const [sortBy, setSortBy] = useState('featured');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const brandScrollRef = useRef<HTMLDivElement>(null);

  const scrollBrands = (direction: 'left' | 'right') => {
    if (brandScrollRef.current) {
      const scrollAmount = 260;
      brandScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    const loadProducts = () => {
      db
        .from('products')
        .select('*')
        .eq('is_approved', true)
        .limit(80)
        .order('is_featured', { ascending: false })
        .then(({ data }) => {
          const fetched = (data as Product[]) ?? [];
          if (fetched.length > 0) {
            // Priority sort: featured first, then newest updated/created
            const sorted = [...fetched].sort((a, b) => {
              if (a.is_featured && !b.is_featured) return -1;
              if (!a.is_featured && b.is_featured) return 1;
              const timeA = new Date(a.updated_at || a.created_at || 0).getTime();
              const timeB = new Date(b.updated_at || b.created_at || 0).getTime();
              return timeB - timeA;
            });
            const deduplicated = deduplicateProductsByModel(sorted);
            setProducts(deduplicated);
            setCachedPhones(deduplicated);
          } else {
            setProducts(SAMPLE_BEST_SELLING_PHONES);
          }
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    };

    loadProducts();

    const unsubscribeRealtime = subscribeToRealtimeSync((payload) => {
      if (payload.action === 'PRODUCT_UPDATE' || payload.table === 'products') {
        loadProducts();
      }
    });

    const handleProductEvent = () => loadProducts();
    window.addEventListener('fundu_product_updated', handleProductEvent);
    window.addEventListener('fundu_product_deleted', handleProductEvent);

    const handleFocus = () => loadProducts();
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      unsubscribeRealtime();
      window.removeEventListener('fundu_product_updated', handleProductEvent);
      window.removeEventListener('fundu_product_deleted', handleProductEvent);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, []);

  useEffect(() => {
    const q = searchParams.get('search') ?? searchParams.get('product') ?? '';
    const b = searchParams.get('brand') ?? '';
    if (q) setSearch(q);
    if (b) setSelectedBrand(b);
  }, [searchParams]);

  const handleResetFilters = () => {
    setSelectedBrand('All');
    setGradeFilter('All');
    setPricePreset(0);
    setMaxPrice(120000);
    setSelectedStorage('');
    setSearch('');
  };

  const filteredProducts = useMemo(() => {
    const preset = PRICE_PRESETS[pricePreset];
    let list = products.filter((p) => {
      // 0. Exclude products marked deleted by admin
      if (isProductDeleted(p.id, p.title)) return false;

      // 1. Search text input match
      const matchSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase()) ||
        p.model.toLowerCase().includes(search.toLowerCase());

      // 2. Brand match
      const matchBrand =
        selectedBrand === 'All' ||
        !selectedBrand ||
        p.brand.toLowerCase() === selectedBrand.toLowerCase() ||
        (selectedBrand.toLowerCase() === 'xiaomi' && p.brand.toLowerCase() === 'redmi');

      // 3. Grade condition match
      const pCond = (p.condition || '').toLowerCase();
      const matchGrade =
        gradeFilter === 'All' ||
        (gradeFilter === 'Superb' && (pCond === 'superb' || pCond === 'excellent')) ||
        (gradeFilter === 'Good' && pCond === 'good') ||
        (gradeFilter === 'Fair' && pCond === 'fair');

      // 4. Storage match
      const matchStorage =
        !selectedStorage || p.storage?.toLowerCase().includes(selectedStorage.toLowerCase());

      // 5. Price range match
      const matchPrice =
        pricePreset === 0
          ? p.price <= maxPrice
          : (p.price >= preset.min && p.price <= preset.max);

      return matchSearch && matchBrand && matchGrade && matchStorage && matchPrice;
    });

    if (sortBy === 'low') list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === 'high') list = [...list].sort((a, b) => b.price - a.price);
    if (sortBy === 'discount') list = [...list].sort((a, b) => (b.discount_percent || 0) - (a.discount_percent || 0));

    // Deduplicate by model so identical models do not repeat on the Buy storefront
    return deduplicateProductsByModel(list);
  }, [products, search, selectedBrand, gradeFilter, selectedStorage, pricePreset, maxPrice, sortBy, syncVersion]);

  const handleAddToCart = (product: Product) => {
    if (product.stock !== undefined && product.stock <= 0) {
      alert('This device is currently Out of Stock.');
      return;
    }
    if (profile && profile.role !== 'customer' && profile.role !== 'admin') {
      alert(`Access Restricted: You are logged in as ${profile.role.toUpperCase()}. Vendor and Delivery accounts cannot place customer orders.`);
      return;
    }
    addToCart(product, 1);
  };

  const handleBuyNow = (product: Product) => {
    if (product.stock !== undefined && product.stock <= 0) {
      alert('This device is currently Out of Stock.');
      return;
    }
    if (profile && profile.role !== 'customer' && profile.role !== 'admin') {
      alert(`Access Restricted: You are logged in as ${profile.role.toUpperCase()}. Vendor and Delivery accounts cannot place customer orders.`);
      return;
    }
    addToCart(product, 1);
    if (user) {
      navigate('/checkout');
    } else {
      navigate('/login?redirect=/checkout');
    }
  };

  const activeFilterCount = (selectedBrand !== 'All' ? 1 : 0) +
    (gradeFilter !== 'All' ? 1 : 0) +
    (pricePreset !== 0 ? 1 : 0) +
    (selectedStorage ? 1 : 0) +
    (search ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#F8F9FC] pb-24 text-[#344257]">
      {/* 1. HERO BANNER WITH REFINED FUNDU PALETTE & TRUST BADGES */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#121924] via-[#1E2734] to-[#2B384B] text-white py-12 md:py-16 border-b border-white/10 shadow-lg">
        {/* Ambient subtle glow mesh */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#6A859F]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-[#86dedd]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        <div className="container-page relative z-10 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-[#C0C8D8] border border-white/15 shadow-xs">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <Sparkles className="h-3.5 w-3.5 text-[#9ac0dd]" />
                <span>Certified Refurbished Marketplace · 100% Tested</span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-[1.15]">
                Certified Refurbished <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#C0C8D8] to-[#9ac0dd]">
                  Smartphones at Best Prices
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-[#C0C8D8] max-w-xl leading-relaxed">
                Save up to 50% compared to brand-new prices. Every phone is inspected through our 32-point diagnostic protocol, guaranteed with 6-month warranty and free doorstep delivery.
              </p>

              {/* Trust Pillars Bar */}
              <div className="pt-2 flex flex-wrap items-center gap-2.5 text-xs font-semibold">
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/15 text-white shadow-xs">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>6 Months Free Warranty</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/15 text-white shadow-xs">
                  <PackageCheck className="h-4 w-4 text-[#9ac0dd] shrink-0" />
                  <span>Open-Box Doorstep Inspection</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/15 text-white shadow-xs">
                  <RotateCcw className="h-4 w-4 text-amber-300 shrink-0" />
                  <span>7-Day Replacement Guarantee</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/15 text-white shadow-xs">
                  <Truck className="h-4 w-4 text-emerald-300 shrink-0" />
                  <span>Free Express Delivery</span>
                </div>
              </div>
            </div>

            {/* Premium Floating Search Box */}
            <div className="w-full lg:w-[440px] shrink-0">
              <div className="bg-white/95 backdrop-blur-md rounded-3xl p-3 sm:p-4 shadow-2xl border border-white/30 text-[#344257] space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-black uppercase tracking-wider text-[#47576E] flex items-center gap-1.5">
                    <Search className="h-3.5 w-3.5 text-[#344257]" /> Find Your Next Phone
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Live Stock
                  </span>
                </div>

                <div className="relative flex items-center">
                  <Search className="absolute left-3.5 h-4.5 w-4.5 text-[#6A859F]" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search model — iPhone 15, S24, OnePlus 12..."
                    className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white pl-10 pr-9 py-3 rounded-2xl text-xs sm:text-sm font-bold text-[#344257] border border-slate-200 focus:border-[#344257] focus:ring-2 focus:ring-[#344257]/15 outline-none transition placeholder:text-slate-400 placeholder:font-normal"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="absolute right-3 text-slate-400 hover:text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-full p-1 transition"
                      title="Clear search"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Trending Quick Search Chips */}
                <div className="pt-1 flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="font-extrabold text-[10px] uppercase tracking-wider text-slate-400">Popular:</span>
                  {['iPhone 15', 'Galaxy S24', 'Nothing 2a', 'OnePlus 12', 'Pixel 8', 'Tecno'].map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setSearch(term)}
                      className="rounded-lg bg-slate-100 hover:bg-[#344257] hover:text-white px-2.5 py-1 text-[11px] font-bold text-[#47576E] transition cursor-pointer"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HORIZONTAL BRAND STRIP WITH SLEEK CARDS */}
      <section className="bg-white border-b border-slate-200/90 sticky top-0 z-30 shadow-xs">
        <div className="container-page py-3.5">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#47576E] flex items-center gap-1.5">
              <Smartphone className="h-3.5 w-3.5 text-[#344257]" /> Shop By Verified Brand
            </span>
            <span className="text-[11px] text-slate-500 font-semibold hidden sm:inline">
              Showing official certified models across India
            </span>
          </div>

          <div className="relative group/carousel">
            {/* Desktop Left Scroll Button */}
            <button
              type="button"
              onClick={() => scrollBrands('left')}
              className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-20 h-9 w-9 items-center justify-center rounded-full bg-white border border-slate-200 shadow-md text-[#344257] hover:bg-[#344257] hover:text-white transition cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Scrollable Brands Strip */}
            <div
              ref={brandScrollRef}
              className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto py-2 px-1 scrollbar-hide no-scrollbar scrollbar-none scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {BRAND_PILLS.map((b) => {
                const isSelected = selectedBrand.toLowerCase() === b.name.toLowerCase();
                return (
                  <button
                    key={b.name}
                    type="button"
                    onClick={() => setSelectedBrand(b.name)}
                    className="flex flex-col items-center gap-1.5 px-1 py-1 min-w-[72px] sm:min-w-[82px] transition-all duration-200 shrink-0 group focus:outline-none cursor-pointer"
                  >
                    <div
                      className={`h-14 w-14 sm:h-16 sm:w-16 rounded-2xl flex items-center justify-center p-2.5 transition-all duration-200 bg-white ${
                        isSelected
                          ? 'border-2 border-[#344257] ring-4 ring-[#344257]/15 shadow-md scale-105 bg-slate-50'
                          : 'border border-slate-200 hover:border-[#6A859F] hover:shadow-xs hover:scale-105'
                      }`}
                    >
                      {b.name === 'All' ? (
                        <div className="h-full w-full rounded-xl bg-gradient-to-br from-[#1E2734] to-[#344257] text-white flex items-center justify-center shadow-xs">
                          <Smartphone className="h-5 w-5 text-white" />
                        </div>
                      ) : (
                        <img
                          src={getCleanBrandLogo(b.name)}
                          alt={b.name}
                          className="h-full w-full object-contain pointer-events-none"
                          loading="lazy"
                        />
                      )}
                    </div>
                    <span
                      className={`text-xs tracking-tight text-center whitespace-nowrap transition-colors ${
                        isSelected
                          ? 'font-black text-[#344257]'
                          : 'font-bold text-slate-600 group-hover:text-[#344257]'
                      }`}
                    >
                      {b.label}
                    </span>
                    {isSelected && (
                      <span className="h-1 w-6 rounded-full bg-[#344257] -mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Desktop Right Scroll Button */}
            <button
              type="button"
              onClick={() => scrollBrands('right')}
              className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 h-9 w-9 items-center justify-center rounded-full bg-white border border-slate-200 shadow-md text-[#344257] hover:bg-[#344257] hover:text-white transition cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. QUICK BUDGET PRESETS STRIP */}
      <section className="bg-slate-100/80 border-b border-slate-200/80 py-2.5">
        <div
          className="container-page flex items-center justify-between gap-3 overflow-x-auto scrollbar-hide no-scrollbar scrollbar-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider hidden sm:inline">
              Budget:
            </span>
            {PRICE_PRESETS.map((p, idx) => {
              const active = pricePreset === idx;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setPricePreset(idx);
                    if (idx !== 0) setMaxPrice(p.max);
                  }}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    active
                      ? 'bg-[#344257] text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/90'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden flex items-center gap-1.5 bg-white border border-slate-300 px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#344257] shrink-0 shadow-xs cursor-pointer"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-[#344257]" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="h-4 w-4 rounded-full bg-[#344257] text-white text-[10px] font-black flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </section>

      {/* 4. MAIN CONTAINER: SIDEBAR + PRODUCT GRID */}
      <div className="container-page mt-6">
        {/* Top Control Bar: Grade Pills + Sort By + Active Filters Summary */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl mb-6 flex flex-wrap items-center justify-between gap-3 border border-slate-200/90 shadow-xs">
          <div
            className="flex items-center gap-2 overflow-x-auto scrollbar-hide no-scrollbar scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <span className="text-xs font-black text-slate-400 px-1 uppercase tracking-wider">Condition:</span>
            {[
              { id: 'All', label: 'All Grades' },
              { id: 'Superb', label: 'Superb (Like New)' },
              { id: 'Good', label: 'Good Value' },
              { id: 'Fair', label: 'Fair / Budget' },
            ].map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setGradeFilter(g.id)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  gradeFilter === g.id
                    ? 'bg-[#344257] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2.5">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Sort:</label>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="py-1.5 pl-3 pr-8 text-xs font-bold rounded-xl border border-slate-200 bg-white text-[#344257] outline-none focus:ring-2 focus:ring-[#344257]/20 cursor-pointer appearance-none"
              >
                <option value="featured">Featured Deals</option>
                <option value="low">Price: Low to High</option>
                <option value="high">Price: High to Low</option>
                <option value="discount">Highest Savings (%)</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-start">
          {/* DESKTOP FILTER SIDEBAR */}
          <aside className={`space-y-6 ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-6 sticky top-28">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-display text-sm font-black text-[#344257] flex items-center gap-2">
                  <Filter className="h-4 w-4 text-[#47576E]" /> Refine Results
                </h3>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-xs text-rose-600 hover:underline font-bold cursor-pointer"
                  >
                    Reset ({activeFilterCount})
                  </button>
                )}
              </div>

              {/* Storage Filter */}
              <div>
                <label className="text-xs font-black text-[#344257] uppercase tracking-wider block mb-2.5">
                  Storage Capacity
                </label>
                <div className="flex flex-wrap gap-2">
                  {['64 GB', '128 GB', '256 GB', '512 GB'].map((stg) => (
                    <button
                      key={stg}
                      type="button"
                      onClick={() => setSelectedStorage(selectedStorage === stg ? '' : stg)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                        selectedStorage === stg
                          ? 'bg-[#344257] text-white shadow-xs'
                          : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {stg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Max Slider */}
              <div>
                <div className="flex justify-between text-xs font-bold text-[#344257] mb-2">
                  <span className="text-slate-500">Max Budget:</span>
                  <span className="text-[#344257] font-black text-sm">{formatINR(maxPrice)}</span>
                </div>
                <input
                  type="range"
                  min="8000"
                  max="150000"
                  step="5000"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(Number(e.target.value));
                    setPricePreset(0);
                  }}
                  className="w-full accent-[#344257] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-semibold mt-1">
                  <span>₹8,000</span>
                  <span>₹1,50,000</span>
                </div>
              </div>

              {/* Certified Refurbished Assurances Box */}
              <div className="rounded-2xl bg-gradient-to-br from-[#F7F7FA] to-[#ECEEF5] p-4 border border-[#C0C8D8]/50 space-y-3">
                <div className="font-black text-[#344257] flex items-center gap-2 text-xs">
                  <ShieldCheck className="h-4 w-4 text-[#344257]" /> Fundu Assured Guarantee
                </div>
                <div className="space-y-2 text-xs text-slate-600 font-medium">
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    32-Point diagnostic tested
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    6 Months Free Warranty
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    7 Days Replacement Policy
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    Free Doorstep Delivery
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    Open Box Doorstep Inspection
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* PRODUCT GRID */}
          <main className="space-y-6">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
              <p>
                Showing <span className="text-[#344257] font-black">{filteredProducts.length}</span> certified refurbished devices
              </p>
              {selectedBrand !== 'All' && (
                <button
                  type="button"
                  onClick={() => setSelectedBrand('All')}
                  className="text-[#47576E] hover:text-[#344257] hover:underline flex items-center gap-1 font-bold cursor-pointer"
                >
                  Clear Brand Filter <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="bg-white rounded-3xl p-5 h-96 animate-pulse border border-slate-200" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 sm:p-14 text-center border border-slate-200 shadow-xs space-y-4">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-[#47576E]">
                  <Search className="h-8 w-8" />
                </div>
                <h3 className="font-display text-xl font-bold text-[#344257]">
                  No Refurbished Phones Found
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  We currently do not have matching inventory for your selected filters. Our verified stock refreshes daily at our inspection hubs!
                </p>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="btn bg-[#344257] text-white hover:bg-[#47576E] text-xs px-4 py-2.5 rounded-xl font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> View All Phones
                  </button>
                  <a
                    href={`https://wa.me/919839122345?text=${encodeURIComponent(
                      `Hi Fundu, I am searching for ${search || selectedBrand || 'a refurbished phone'}. Please notify me when it's available!`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn bg-[#25D366] text-white hover:bg-[#20ba59] text-xs px-4 py-2.5 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <MessageSquare className="h-3.5 w-3.5" /> Notify on WhatsApp
                  </a>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProducts.map((product) => {
                  const image = product.images?.[0] || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80';
                  const isSuperb = product.condition === 'Excellent' || product.condition === 'Superb';
                  const savings = product.original_price && product.original_price > product.price
                    ? product.original_price - product.price
                    : null;
                  const emiAmount = Math.round(product.price / 6);

                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-3xl border border-slate-200 hover:border-[#6A859F] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group relative"
                    >
                      {/* Top Card Section: Badges, Image & Details */}
                      <div>
                        {/* Image Showcase Container */}
                        <div className="relative bg-gradient-to-b from-slate-50 via-white to-white p-5 flex items-center justify-center overflow-hidden border-b border-slate-100">
                          {/* Certified Grade Pill */}
                          <span
                            className={`absolute top-3.5 left-3.5 z-10 text-[10px] font-black px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1 ${
                              isSuperb
                                ? 'bg-gradient-to-r from-[#1E2734] to-[#344257] text-white'
                                : 'bg-slate-700 text-white'
                            }`}
                          >
                            <Sparkles className="h-2.5 w-2.5 text-amber-300" />
                            {isSuperb ? 'Superb (Like New)' : 'Good Value'}
                          </span>

                          {/* Discount / Offer Tag */}
                          <div className="absolute top-3.5 right-3.5 z-10 flex flex-col items-end gap-1">
                            {product.discount_percent ? (
                              <span className="text-[10px] font-black bg-gradient-to-r from-amber-500 to-orange-600 text-white px-2.5 py-0.5 rounded-lg shadow-xs flex items-center gap-1">
                                <Tag className="h-3 w-3" /> {product.discount_percent}% OFF
                              </span>
                            ) : null}
                            {product.video_url || product.has_video ? (
                              <span className="text-[9px] font-black bg-purple-600/90 text-white px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1 backdrop-blur-xs">
                                <Play className="h-2 w-2 fill-white" /> Video
                              </span>
                            ) : null}
                          </div>

                          <Link to={`/product/${product.id}`} className="block my-3">
                            <img
                              src={getCleanPhoneImage(product.brand, product.title, image)}
                              alt={product.title}
                              className="h-44 w-auto max-h-44 object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-md"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                if (!target.dataset.triedFallback) {
                                  target.dataset.triedFallback = '1';
                                  target.src = getCleanPhoneImage(product.brand, product.title, '');
                                }
                              }}
                            />
                          </Link>

                          {/* 32-Point Quality Badge Bottom Overlay */}
                          <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-center gap-1.5 bg-white/95 backdrop-blur-sm py-1 px-2.5 rounded-xl text-[10px] font-black text-[#344257] border border-slate-200/80 shadow-xs">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                            <span>32-Point Inspected & Verified</span>
                          </div>
                        </div>

                        {/* Title & Specs */}
                        <div className="p-4 sm:p-5 pb-2">
                          <Link to={`/product/${product.id}`}>
                            <h3 className="font-display font-black text-sm text-[#344257] group-hover:text-[#47576E] transition line-clamp-1">
                              {product.title}
                            </h3>
                          </Link>

                          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
                            {product.available_storages && product.available_storages.length > 0 ? (
                              <span className="bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-0.5 rounded-lg">
                                {product.available_storages.join(' • ')}
                              </span>
                            ) : product.storage ? (
                              <span className="bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded-lg">
                                {product.storage}
                              </span>
                            ) : null}
                            {product.ram && (
                              <span className="bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded-lg">
                                {product.ram} RAM
                              </span>
                            )}
                            {product.color && (
                              <span className="text-slate-400 font-medium">· {product.color}</span>
                            )}
                          </div>

                          {/* 6 Months Warranty Ribbon */}
                          <div className="mt-3 flex items-center gap-1.5 text-[10px] font-black text-[#344257] bg-emerald-50/70 border border-emerald-200/60 px-2.5 py-1 rounded-lg w-max">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                            <span>6 Months Free Warranty Included</span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Pricing & Action Section */}
                      <div className="p-4 sm:p-5 pt-3 border-t border-slate-100 bg-[#FAFAFC]">
                        <div className="flex items-baseline justify-between mb-1.5">
                          <div className="flex items-baseline gap-2">
                            <span className="font-display text-lg sm:text-xl font-black text-[#1E2734]">
                              {product.available_storages && product.available_storages.length > 1 ? `From ${formatINR(product.price)}` : formatINR(product.price)}
                            </span>
                            {product.original_price && (
                              <span className="text-xs text-slate-400 line-through font-semibold">
                                {formatINR(product.original_price)}
                              </span>
                            )}
                          </div>
                          {savings && (
                            <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                              Save {formatINR(savings)}
                            </span>
                          )}
                        </div>

                        {/* Low Cost EMI Line */}
                        <p className="text-[10px] text-slate-500 mb-3.5 font-medium flex items-center gap-1">
                          <Zap className="h-3 w-3 text-amber-500 shrink-0" />
                          <span>EMI from <strong>{formatINR(emiAmount)}/mo</strong></span>
                        </p>

                        {/* Action Buttons */}
                        {product.stock !== undefined && product.stock <= 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="flex-1 py-2.5 text-center text-xs font-black text-rose-600 bg-rose-50 border border-rose-200 rounded-xl">
                              Out of Stock
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleBuyNow(product)}
                              className="flex-1 text-white text-xs py-2.5 rounded-xl font-black shadow-sm bg-gradient-to-r from-[#1E2734] via-[#344257] to-[#47576E] hover:from-[#121924] hover:to-[#344257] transition text-center cursor-pointer"
                            >
                              Buy Now
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddToCart(product)}
                              className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-[#344257] hover:bg-slate-50 hover:border-slate-300 transition shrink-0 shadow-xs cursor-pointer"
                              title="Add to cart"
                            >
                              <ShoppingCart className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>

        {/* 5. THE 32-POINT QUALITY INSPECTION STANDARDS */}
        <section className="mt-16 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm relative overflow-hidden">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#344257]/10 px-3.5 py-1 text-xs font-black text-[#344257]">
              <ShieldCheck className="h-3.5 w-3.5 text-[#344257]" /> Fundu Assured Inspection
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-[#1E2734]">
              The 32-Point Quality Inspection
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Every refurbished phone undergoes strict mechanical, electronic, and software inspection before arriving at your doorstep.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {QUALITY_CHECK_POINTS.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.category}
                  className="rounded-2xl border border-slate-200/90 bg-gradient-to-b from-[#F8F9FB] to-white p-4 flex flex-col justify-between hover:shadow-md transition"
                >
                  <div>
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#1E2734] to-[#344257] text-white flex items-center justify-center shadow-xs">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="mt-3 font-display text-xs font-black text-[#1E2734]">
                      {cat.category}
                    </h4>
                    <ul className="mt-2.5 space-y-2">
                      {cat.points.map((pt) => (
                        <li key={pt} className="text-[11px] text-slate-600 flex items-start gap-1.5 leading-tight">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 6. REFURBISHED GRADING GUIDE */}
        <section className="mt-8 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm">
          <div className="text-center max-w-xl mx-auto space-y-1.5">
            <h2 className="font-display text-2xl sm:text-3xl font-black text-[#1E2734]">
              Refurbished Condition Grading Guide
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Transparent assessment — zero surprises when you open your box at your doorstep
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-2xl border-2 border-[#344257] bg-gradient-to-b from-slate-50 to-white p-6 space-y-3.5 shadow-sm">
              <div className="inline-flex items-center gap-1.5 bg-[#344257] text-white text-xs font-black px-3 py-1 rounded-full shadow-xs">
                <Sparkles className="h-3 w-3 text-amber-300" /> Superb (Like New)
              </div>
              <h4 className="font-bold text-sm text-[#1E2734]">Almost Indistinguishable From New</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Zero scratches on screen, flawless body or near-invisible handling marks. Battery health guaranteed &gt;88%. 100% original OEM display and camera modules.
              </p>
              <div className="text-[11px] font-bold text-emerald-700 pt-2.5 border-t border-slate-200 flex items-center gap-1">
                <Check className="h-3.5 w-3.5" /> Best for buyers wanting showroom condition at 40% off
              </div>
            </div>

            <div className="rounded-2xl border-2 border-slate-300 bg-white p-6 space-y-3.5">
              <div className="inline-flex items-center gap-1.5 bg-slate-700 text-white text-xs font-black px-3 py-1 rounded-full shadow-xs">
                Good Value
              </div>
              <h4 className="font-bold text-sm text-[#1E2734]">Perfect Functionality with Minor Signs</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Clean pristine display with zero cracks. Body or bezel may show light faint cosmetic scratches from pocket wear. 100% internal hardware performance.
              </p>
              <div className="text-[11px] font-bold text-emerald-700 pt-2.5 border-t border-slate-200 flex items-center gap-1">
                <Check className="h-3.5 w-3.5" /> Best value for money — saves up to 50% on flagships
              </div>
            </div>

            <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 space-y-3.5">
              <div className="inline-flex items-center gap-1.5 bg-slate-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-xs">
                Fair / Budget
              </div>
              <h4 className="font-bold text-sm text-[#1E2734]">Maximum Savings, 100% Working</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Visible cosmetic scuffs, paint chips, or scratches on body or back panel. Screen has no cracks. All 32 diagnostic tests pass 100%.
              </p>
              <div className="text-[11px] font-bold text-slate-700 pt-2.5 border-t border-slate-200 flex items-center gap-1">
                <Check className="h-3.5 w-3.5" /> Ideal for high performance on a strict budget
              </div>
            </div>
          </div>
        </section>

        {/* 7. BUYER FAQS ACCORDION */}
        <section className="mt-8 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="h-8 w-8 rounded-xl bg-[#344257]/10 flex items-center justify-center text-[#344257]">
              <HelpCircle className="h-5 w-5" />
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-black text-[#1E2734]">
              Refurbished Mobile Phone FAQs
            </h2>
          </div>

          <div className="space-y-3">
            {BUYER_FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={faq.q}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-4.5 text-left font-bold text-xs sm:text-sm text-[#344257] hover:bg-slate-50 transition cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="p-4.5 pt-0 text-xs text-slate-600 border-t border-slate-100 leading-relaxed whitespace-pre-line bg-slate-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
