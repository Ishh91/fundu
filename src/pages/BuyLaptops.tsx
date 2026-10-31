import { useEffect, useMemo, useState, useRef } from 'react';
import {
  Search,
  Laptop,
  ShieldCheck,
  ShoppingCart,
  CheckCircle2,
  Truck,
  X,
  Filter,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Tag,
  Award,
  Zap,
  BatteryCharging,
  Cpu,
  Wifi,
  SlidersHorizontal,
  Monitor,
  HardDrive,
  Gamepad2,
  Briefcase,
  GraduationCap,
  Apple,
} from 'lucide-react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { db, formatINR } from '../lib/db';
import { deduplicateProductsByModel } from '../lib/modelVariants';
import { getCachedLaptops, setCachedLaptops } from '../lib/productsCache';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { isProductDeleted, useCatalogSync } from '../lib/catalogSync';
import { subscribeToRealtimeSync } from '../lib/realtimeSync';
import type { Product } from '../types';
import { SAMPLE_LAPTOPS } from '../data/sampleLaptops';

// Circular brand filters
const BRAND_PILLS = [
  { name: 'All', label: 'All Brands' },
  { name: 'Apple', label: 'Apple' },
  { name: 'Dell', label: 'Dell' },
  { name: 'HP', label: 'HP' },
  { name: 'Acer', label: 'Acer' },
];

const PRICE_PRESETS = [
  { label: 'All Budgets', min: 0, max: 250000 },
  { label: 'Under ₹25,000', min: 0, max: 25000 },
  { label: '₹25,000 - ₹40,000', min: 25000, max: 40000 },
  { label: '₹40,000 - ₹60,000', min: 40000, max: 60000 },
  { label: 'Above ₹60,000', min: 60000, max: 250000 },
];

const USE_CASES = [
  { id: 'all', label: 'All Laptops', icon: Laptop },
  { id: 'business', label: 'Business & Coding', icon: Briefcase },
  { id: 'student', label: 'Student & Everyday', icon: GraduationCap },
  { id: 'gaming', label: '144Hz Gaming', icon: Gamepad2 },
  { id: 'macbook', label: 'Apple MacBooks', icon: Apple },
];

const LAPTOP_QUALITY_CHECK_POINTS = [
  {
    category: 'Display & Hinge Tension',
    icon: Monitor,
    points: ['TrueColor original IPS/OLED panel', 'Zero dead pixels, bleeding or lines', 'Hinge torque & 180° smooth opening', 'Webcam clarity & microphone sync'],
  },
  {
    category: 'Battery & Thermal Health',
    icon: BatteryCharging,
    points: ['Guaranteed >85% battery health retention', 'Original OEM charger wattage pass', 'No thermal throttling under Cinebench load', 'Dual fan RPM calibration & dust cleaning'],
  },
  {
    category: 'Processor & Motherboard',
    icon: Cpu,
    points: ['Intel / AMD / M-Series stress-test pass', 'Motherboard capacitor & circuit audit', 'No liquid damage / moisture indicator check', 'High-speed NVMe SSD read/write verified'],
  },
  {
    category: 'Keyboard & Precision Trackpad',
    icon: Laptop,
    points: ['Every single key stroke registered (84+ keys)', 'Keyboard backlight LED functionality', 'Trackpad precision multi-touch gestures', 'Biometric Fingerprint / Windows Hello pass'],
  },
  {
    category: 'Ports & Wireless Connectivity',
    icon: Wifi,
    points: ['Thunderbolt / USB-C fast charging verified', 'HDMI video output signal to monitor', 'Wi-Fi 6 / 5 dual-band throughput test', 'Bluetooth 5.0+ pairing latency check'],
  },
];

const BUYER_FAQS = [
  {
    q: 'What is a Fundu Certified Refurbished Laptop?',
    a: 'A Fundu Certified Refurbished laptop is an enterprise-grade or consumer laptop that has undergone rigorous 45-point diagnostic hardware testing by certified computer engineers. Components including motherboard, SSD, RAM, display, keyboard, thermals, and battery health are verified 100% functional. Laptops are professionally cleaned, sanitized, and backed by a free 6-month Fundu replacement warranty.',
  },
  {
    q: 'Do I get the original charger and power cable?',
    a: 'Yes, 100%! Every Fundu certified refurbished laptop comes with its genuine OEM fast charger and power cord included in the box at no extra charge.',
  },
  {
    q: 'Can I inspect the laptop before making payment (Open Box)?',
    a: 'Yes! Our doorstep delivery executive allows an Open Box Delivery. You can power on the laptop, check the display, test keys, and verify the battery and charger before making payment or signing the receipt.',
  },
  {
    q: 'Can I upgrade the RAM or SSD in the future?',
    a: 'Most Windows laptops (ThinkPad, Latitude, Pavilion, TUF) come with upgradable DDR4/DDR5 SO-DIMM slots and expandable M.2 NVMe SSD bays. Apple MacBooks feature unified integrated memory which is fixed from factory.',
  },
  {
    q: 'How does the 6-Month Warranty work?',
    a: 'Every refurbished laptop includes a comprehensive 6-month warranty covering display defects, motherboard faults, RAM/SSD issues, and keyboard failures. If any hardware issue occurs, our certified technician will repair or replace it free of charge.',
  },
  {
    q: 'What is the 7-Day Replacement Policy?',
    a: 'If you discover any technical hardware defect within 7 days of delivery that was not described, we will replace the device with an identical certified model or provide a 100% full refund.',
  },
];

export default function BuyLaptops() {
  const { user, profile } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { syncVersion } = useCatalogSync();

  const [products, setProducts] = useState<Product[]>(() => {
    const cached = getCachedLaptops();
    return cached.length > 0 ? cached : SAMPLE_LAPTOPS;
  });
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [selectedUseCase, setSelectedUseCase] = useState<string>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('All');
  const [pricePreset, setPricePreset] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(150000);
  const [selectedRam, setSelectedRam] = useState<string>('');
  const [selectedStorage, setSelectedStorage] = useState<string>('');
  const [selectedCpu, setSelectedCpu] = useState<string>('All');
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
        .order('is_featured', { ascending: false })
        .then(({ data }) => {
          const fetched = ((data as Product[]) ?? []).filter(
            (p) => p.category === 'laptop' || !!p.processor
          );
          if (fetched.length > 0) {
            setProducts(fetched);
            setCachedLaptops(fetched);
          } else {
            setProducts(SAMPLE_LAPTOPS);
          }
          setLoading(false);
        })
        .catch(() => {
          setProducts(SAMPLE_LAPTOPS);
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
    const u = searchParams.get('use_case') ?? '';
    if (q) setSearch(q);
    if (b) setSelectedBrand(b);
    if (u) setSelectedUseCase(u);
  }, [searchParams]);

  const handleResetFilters = () => {
    setSelectedBrand('All');
    setSelectedUseCase('all');
    setGradeFilter('All');
    setPricePreset(0);
    setMaxPrice(150000);
    setSelectedRam('');
    setSelectedStorage('');
    setSelectedCpu('All');
    setSearch('');
  };

  const filteredProducts = useMemo(() => {
    const preset = PRICE_PRESETS[pricePreset];
    let list = products.filter((p) => {
      // 0. Exclude deleted products
      if (isProductDeleted(p.id, p.title)) return false;

      // 1. Search text input
      const matchSearch =
        !search ||
        `${p.title} ${p.brand} ${p.model} ${p.processor || ''} ${p.graphics || ''}`
          .toLowerCase()
          .includes(search.toLowerCase());

      // 2. Brand match
      const matchBrand =
        selectedBrand === 'All' ||
        !selectedBrand ||
        p.brand.toLowerCase() === selectedBrand.toLowerCase();

      // 3. Use Case match
      const matchUseCase =
        selectedUseCase === 'all' ||
        p.use_case === selectedUseCase ||
        (selectedUseCase === 'macbook' && p.brand.toLowerCase() === 'apple') ||
        (selectedUseCase === 'gaming' && (p.graphics || '').toLowerCase().includes('rtx'));

      // 4. Grade condition match
      const pCond = (p.condition || '').toLowerCase();
      const matchGrade =
        gradeFilter === 'All' ||
        (gradeFilter === 'Superb' && (pCond === 'superb' || pCond === 'excellent')) ||
        (gradeFilter === 'Good' && pCond === 'good') ||
        (gradeFilter === 'Fair' && pCond === 'fair');

      // 5. RAM match
      const matchRam = !selectedRam || (p.ram || '').toLowerCase().includes(selectedRam.toLowerCase());

      // 6. Storage match
      const matchStorage =
        !selectedStorage || (p.storage || '').toLowerCase().includes(selectedStorage.toLowerCase());

      // 7. CPU match
      const matchCpu =
        selectedCpu === 'All' ||
        (selectedCpu === 'm_series' && /m1|m2|m3|apple/i.test(p.processor || '')) ||
        (selectedCpu === 'i5' && /i5|1135g7|1235u|12450h/i.test(p.processor || '')) ||
        (selectedCpu === 'i7' && /i7|1185g7|12700h/i.test(p.processor || '')) ||
        (selectedCpu === 'ryzen' && /ryzen|5625u|5600h|5800h/i.test(p.processor || '')) ||
        (selectedCpu === 'i3' && /i3|1115g4/i.test(p.processor || ''));

      // 8. Price range match
      const matchPrice =
        pricePreset === 0
          ? p.price <= maxPrice
          : p.price >= preset.min && p.price <= preset.max;

      return (
        matchSearch &&
        matchBrand &&
        matchUseCase &&
        matchGrade &&
        matchRam &&
        matchStorage &&
        matchCpu &&
        matchPrice
      );
    });

    if (sortBy === 'low') list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === 'high') list = [...list].sort((a, b) => b.price - a.price);
    if (sortBy === 'discount') list = [...list].sort((a, b) => (b.discount_percent || 0) - (a.discount_percent || 0));

    // Deduplicate by laptop model so identical models do not repeat on the Buy storefront
    return deduplicateProductsByModel(list);
  }, [
    products,
    search,
    selectedBrand,
    selectedUseCase,
    gradeFilter,
    selectedRam,
    selectedStorage,
    selectedCpu,
    pricePreset,
    maxPrice,
    sortBy,
    syncVersion,
  ]);

  const handleAddToCart = (product: Product) => {
    if (product.stock !== undefined && product.stock <= 0) {
      alert('This laptop is currently Out of Stock.');
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
      alert('This laptop is currently Out of Stock.');
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

  return (
    <div className="min-h-screen bg-[#F7F7FA] pb-24 text-[#344257]">
      {/* HERO SECTION */}
      <section
        style={{
          background: 'linear-gradient(135deg, #1E2734 0%, #344257 55%, #47576E 100%)',
        }}
        className="text-white py-10 md:py-14 border-b border-[#344257]/30 shadow-md relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C0C8D8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="container-page relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-[#C0C8D8] border border-white/15">
                <Sparkles className="h-3.5 w-3.5 text-[#C0C8D8]" />
                <span>Certified Refurbished Laptops Marketplace</span>
              </div>
              <h1 className="mt-3 font-display text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Buy Refurbished Laptops
              </h1>
              <p className="mt-2 text-xs md:text-sm text-[#C0C8D8] leading-relaxed">
                Save up to 70% on premium MacBooks, ThinkPads, Dell Latitude, & Gaming Laptops. 45-Point tested, original charger included, 6-Month warranty, & free express doorstep delivery.
              </p>

              {/* Feature Badges */}
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold text-white/90">
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg border border-white/10">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#C0C8D8]" /> 6 Months Warranty
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg border border-white/10">
                  <Award className="h-3.5 w-3.5 text-[#C0C8D8]" /> 45-Point Quality Passed
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg border border-white/10">
                  <BatteryCharging className="h-3.5 w-3.5 text-[#C0C8D8]" /> Original Charger Included
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg border border-white/10">
                  <Truck className="h-3.5 w-3.5 text-[#C0C8D8]" /> Free Doorstep Delivery
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg border border-white/10">
                  <RotateCcw className="h-3.5 w-3.5 text-[#C0C8D8]" /> 7-Day Replacement
                </div>
              </div>
            </div>

            {/* Prominent Search Bar */}
            <div className="w-full md:w-[460px] bg-white rounded-2xl p-2 shadow-xl border border-white/20">
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 h-5 w-5 text-[#47576E]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search — ThinkPad, MacBook M1, i5 12th Gen, RTX 3050..."
                  className="w-full bg-transparent pl-11 pr-10 py-2.5 text-sm font-semibold text-[#344257] outline-none placeholder:text-gray-400"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-2 text-gray-400 hover:text-[#344257] bg-gray-100 hover:bg-gray-200 rounded-full p-1 transition"
                    title="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Popular Search Pills */}
              <div className="pt-2 px-2 border-t border-gray-100 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="font-bold text-gray-400 text-[10px] uppercase tracking-wider">Popular:</span>
                {['ThinkPad T14', 'MacBook Air M1', 'Latitude 7420', 'Victus Gaming', '16GB RAM'].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setSearch(term)}
                    className="text-[11px] font-semibold text-[#344257] bg-[#F0F0F5] hover:bg-[#E2E6EF] px-2 py-0.5 rounded-md transition"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* USE CASE QUICK SWITCHER BAR */}
      <section className="bg-white border-b border-gray-200 shadow-xs">
        <div className="container-page py-3.5">
          <div className="flex items-center justify-between gap-3 overflow-x-auto scrollbar-none">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 hidden sm:inline">
              Shop by Use Case:
            </span>
            <div className="flex items-center gap-2">
              {USE_CASES.map((uc) => {
                const Icon = uc.icon;
                const active = selectedUseCase === uc.id;
                return (
                  <button
                    key={uc.id}
                    type="button"
                    onClick={() => setSelectedUseCase(uc.id)}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
                      active
                        ? 'bg-[#344257] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{uc.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* BRAND SELECTOR WITH CAROUSEL */}
      <section className="bg-white border-b border-gray-200 py-4 shadow-xs">
        <div className="container-page relative">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-gray-400">
              Browse by Brand
            </h3>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => scrollBrands('left')}
                className="p-1 rounded-full border border-gray-200 hover:bg-gray-100 text-[#344257] transition cursor-pointer"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollBrands('right')}
                className="p-1 rounded-full border border-gray-200 hover:bg-gray-100 text-[#344257] transition cursor-pointer"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div
            ref={brandScrollRef}
            className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {BRAND_PILLS.map((b) => {
              const active = selectedBrand.toLowerCase() === b.name.toLowerCase();
              return (
                <button
                  key={b.name}
                  type="button"
                  onClick={() => setSelectedBrand(b.name)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-extrabold transition shrink-0 cursor-pointer ${
                    active
                      ? 'border-[#344257] bg-[#344257] text-white shadow-sm'
                      : 'border-gray-200 bg-[#F9FAFB] text-gray-700 hover:border-gray-400 hover:bg-white'
                  }`}
                >
                  <Laptop className="h-3.5 w-3.5" />
                  <span>{b.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* BUDGET PRESETS STRIP */}
      <section className="bg-[#F0F2F5] border-b border-gray-200/80 py-2.5">
        <div className="container-page flex items-center justify-between gap-3 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-[#47576E] uppercase tracking-wider hidden sm:inline">
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
                  className={`rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    active
                      ? 'bg-[#344257] text-white shadow-xs'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
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
            className="lg:hidden flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-1 rounded-full text-xs font-bold text-[#344257] shrink-0 shadow-xs"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
          </button>
        </div>
      </section>

      {/* MAIN CONTAINER: SIDEBAR + LAPTOP GRID */}
      <div className="container-page mt-6">
        {/* Grade Tabs & Sort Bar */}
        <div className="bg-white p-3 rounded-2xl mb-6 flex flex-wrap items-center justify-between gap-3 border border-gray-200 shadow-xs">
          <div
            className="flex items-center gap-2 overflow-x-auto scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <span className="text-xs font-bold text-gray-500 px-2 uppercase tracking-wider">Condition Grade:</span>
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
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                  gradeFilter === g.id
                    ? 'bg-[#344257] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-gray-500">Sort By:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-1 px-3 text-xs font-bold rounded-xl border border-gray-200 bg-white text-[#344257] outline-none focus:ring-1 focus:ring-[#344257]"
            >
              <option value="featured">Featured Deals</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
              <option value="discount">Highest Savings / Discount</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          {/* DESKTOP FILTER SIDEBAR */}
          <aside className={`space-y-6 ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-6 sticky top-24">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-display text-sm font-extrabold text-[#344257] flex items-center gap-2">
                  <Filter className="h-4 w-4 text-[#47576E]" /> Refine Laptop Specs
                </h3>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-[#47576E] hover:underline font-bold cursor-pointer"
                >
                  Reset
                </button>
              </div>

              {/* Processor Family Filter */}
              <div>
                <label className="text-xs font-bold text-[#344257] uppercase tracking-wider block mb-2">
                  Processor (CPU)
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'All', label: 'All CPUs' },
                    { id: 'm_series', label: 'Apple M1/M2' },
                    { id: 'i5', label: 'Intel Core i5' },
                    { id: 'i7', label: 'Intel Core i7' },
                    { id: 'ryzen', label: 'AMD Ryzen 5/7' },
                    { id: 'i3', label: 'Intel Core i3' },
                  ].map((cpu) => (
                    <button
                      key={cpu.id}
                      type="button"
                      onClick={() => setSelectedCpu(cpu.id)}
                      className={`rounded-lg px-2 py-1 text-[11px] font-bold transition text-center cursor-pointer ${
                        selectedCpu === cpu.id
                          ? 'bg-[#344257] text-white'
                          : 'border border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {cpu.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* RAM Filter */}
              <div>
                <label className="text-xs font-bold text-[#344257] uppercase tracking-wider block mb-2">
                  RAM Memory
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['8 GB', '16 GB', '32 GB'].map((ram) => (
                    <button
                      key={ram}
                      type="button"
                      onClick={() => setSelectedRam(selectedRam === ram ? '' : ram)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                        selectedRam === ram
                          ? 'bg-[#344257] text-white'
                          : 'border border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {ram}
                    </button>
                  ))}
                </div>
              </div>

              {/* Storage SSD Filter */}
              <div>
                <label className="text-xs font-bold text-[#344257] uppercase tracking-wider block mb-2">
                  Fast SSD Storage
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['256 GB', '512 GB', '1 TB'].map((stg) => (
                    <button
                      key={stg}
                      type="button"
                      onClick={() => setSelectedStorage(selectedStorage === stg ? '' : stg)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                        selectedStorage === stg
                          ? 'bg-[#344257] text-white'
                          : 'border border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {stg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Max Slider */}
              <div>
                <div className="flex justify-between text-xs font-bold text-[#344257] mb-1">
                  <span>Max Budget:</span>
                  <span className="text-[#344257] font-black">{formatINR(maxPrice)}</span>
                </div>
                <input
                  type="range"
                  min="15000"
                  max="150000"
                  step="5000"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(Number(e.target.value));
                    setPricePreset(0);
                  }}
                  className="w-full accent-[#344257] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>₹15,000</span>
                  <span>₹1,50,000</span>
                </div>
              </div>

              {/* Certified Refurbished Laptop Assurances Box */}
              <div className="rounded-xl bg-[#F7F7FA] p-3.5 border border-gray-200/80 space-y-2.5 text-xs text-[#47576E]">
                <div className="font-extrabold text-[#344257] flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="h-4 w-4 text-[#344257]" /> Fundu Laptop Assured
                </div>
                <div className="space-y-1.5 text-[11px] text-gray-600">
                  <p className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#47576E] shrink-0" />
                    45-Point hardware tested
                  </p>
                  <p className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#47576E] shrink-0" />
                    6 Months Free Warranty
                  </p>
                  <p className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#47576E] shrink-0" />
                    Original Charger + Power Cable
                  </p>
                  <p className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#47576E] shrink-0" />
                    7 Days Replacement Policy
                  </p>
                  <p className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#47576E] shrink-0" />
                    Free Express Doorstep Delivery
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* LAPTOP GRID */}
          <main className="space-y-6">
            <div className="flex items-center justify-between text-xs font-bold text-gray-500">
              <p>
                Showing <span className="text-[#344257] font-extrabold">{filteredProducts.length}</span> certified refurbished laptops
              </p>
              {(selectedBrand !== 'All' || selectedUseCase !== 'all') && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-[#47576E] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Clear Filters <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="bg-white rounded-2xl p-4 h-96 animate-pulse border border-gray-200" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-gray-200 shadow-xs space-y-4">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gray-100 text-[#47576E]">
                  <Laptop className="h-8 w-8" />
                </div>
                <h3 className="font-display text-xl font-bold text-[#344257]">No Laptops Match Your Filters</h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Try clearing some specs or expanding your budget range to view available certified stock.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="btn-primary text-xs px-5 py-2.5 rounded-xl font-bold cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredProducts.map((laptop) => {
                  const image =
                    laptop.images && laptop.images.length > 0
                      ? laptop.images[0]
                      : 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80';
                  const isSuperb = (laptop.condition || '').toLowerCase().includes('superb');
                  const savings =
                    laptop.original_price && laptop.original_price > laptop.price
                      ? laptop.original_price - laptop.price
                      : 0;
                  const emiAmount = Math.round(laptop.price / 24);
                  const isOutOfStock = laptop.stock !== undefined && laptop.stock <= 0;

                  return (
                    <div
                      key={laptop.id}
                      className="bg-white rounded-2xl border border-gray-200/90 hover:border-[#6A859F] hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                    >
                      {/* Top Card Section: Image & Badges */}
                      <div>
                        <div className="relative bg-[#F8F9FA] p-4 flex items-center justify-center overflow-hidden border-b border-gray-100">
                          {/* Certified Grade Pill */}
                          <span
                            className={`absolute top-3 left-3 z-10 text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-xs ${
                              isSuperb ? 'bg-[#344257] text-white' : 'bg-[#47576E] text-white'
                            }`}
                          >
                            {isSuperb ? 'Superb (Like New)' : 'Good Value'}
                          </span>

                          {/* Discount Tag */}
                          {laptop.discount_percent ? (
                            <span className="absolute top-3 right-3 z-10 text-[10px] font-extrabold bg-[#E65100] text-white px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                              <Tag className="h-3 w-3" /> {laptop.discount_percent}% OFF
                            </span>
                          ) : null}

                          <Link to={`/product/${laptop.id}`} className="block my-2 w-full text-center">
                            <img
                              src={image}
                              alt={laptop.title}
                              className="h-44 w-auto max-h-44 mx-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-sm"
                              loading="lazy"
                            />
                          </Link>

                          {/* 45-Point Badge Bottom Overlay */}
                          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-center gap-1 bg-white/90 backdrop-blur-xs py-1 px-2 rounded-lg text-[10px] font-bold text-[#344257] border border-gray-200/60 shadow-xs">
                            <CheckCircle2 className="h-3 w-3 text-[#47576E] shrink-0" />
                            <span>45-Point Certified Hardware Tested</span>
                          </div>
                        </div>

                        {/* Title & Laptop Hardware Specs */}
                        <div className="p-4 pb-2 space-y-2">
                          <Link to={`/product/${laptop.id}`}>
                            <h3 className="font-display font-bold text-sm text-[#344257] group-hover:text-[#47576E] transition line-clamp-1">
                              {laptop.title}
                            </h3>
                          </Link>

                          {/* Hardware Specs Chips */}
                          <div className="flex flex-wrap items-center gap-1 text-[10px] font-bold">
                            {laptop.processor && (
                              <span className="bg-[#EAEFF5] text-[#344257] px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Cpu className="h-3 w-3 text-[#47576E]" /> {laptop.processor.split('(')[0].trim()}
                              </span>
                            )}
                            {laptop.available_rams && laptop.available_rams.length > 0 ? (
                              <span className="bg-blue-50 border border-blue-200/60 text-blue-800 px-2 py-0.5 rounded-md font-bold">
                                {laptop.available_rams.join(' • ')} RAM
                              </span>
                            ) : laptop.ram ? (
                              <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md">
                                {laptop.ram} RAM
                              </span>
                            ) : null}
                            {laptop.available_storages && laptop.available_storages.length > 0 ? (
                              <span className="bg-blue-50 border border-blue-200/60 text-blue-800 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                                <HardDrive className="h-2.5 w-2.5" /> {laptop.available_storages.join(' • ')}
                              </span>
                            ) : laptop.storage ? (
                              <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <HardDrive className="h-2.5 w-2.5" /> {laptop.storage} SSD
                              </span>
                            ) : null}
                          </div>

                          {/* Secondary Specs Row */}
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-gray-500 font-semibold">
                            {laptop.screen_size && <span>{laptop.screen_size}</span>}
                            {laptop.graphics && <span>· {laptop.graphics.split('(')[0].trim()}</span>}
                          </div>

                          {/* Original Charger Included Pill */}
                          <div className="flex items-center gap-1 text-[10px] font-bold text-[#344257] bg-[#F0F0F5] border border-[#C0C8D8] px-2 py-0.5 rounded w-max">
                            <BatteryCharging className="h-3 w-3 text-[#47576E]" />
                            <span>Original Charger & Power Cable Included</span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Pricing & Action Section */}
                      <div className="p-4 pt-2 border-t border-gray-100 bg-[#FAFAFC]">
                        <div className="flex items-baseline justify-between mb-1">
                          <div className="flex items-baseline gap-2">
                            <span className="font-display text-lg font-black text-[#344257]">
                              {laptop.available_storages && laptop.available_storages.length > 1 ? `From ${formatINR(laptop.price)}` : formatINR(laptop.price)}
                            </span>
                            {laptop.original_price && (
                              <span className="text-xs text-gray-400 line-through">
                                {formatINR(laptop.original_price)}
                              </span>
                            )}
                          </div>
                          {savings > 0 && (
                            <span className="text-[10px] font-extrabold text-[#344257] bg-[#F0F0F5] border border-[#C0C8D8] px-1.5 py-0.5 rounded">
                              Save {formatINR(savings)}
                            </span>
                          )}
                        </div>

                        {/* Low Cost EMI Line */}
                        <p className="text-[10px] text-gray-500 mb-3 font-medium flex items-center gap-1">
                          <Zap className="h-2.5 w-2.5 text-amber-500" />
                          <span>Or EMI starting at <strong>{formatINR(emiAmount)}/mo</strong></span>
                        </p>

                        {/* Action Buttons */}
                        {isOutOfStock ? (
                          <div className="flex items-center gap-2">
                            <span className="flex-1 py-2 text-center text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl">
                              Out of Stock
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleBuyNow(laptop)}
                              style={{
                                background: 'linear-gradient(135deg, #344257 0%, #47576E 100%)',
                              }}
                              className="flex-1 text-white text-xs py-2 rounded-xl font-bold shadow-xs hover:opacity-95 transition text-center cursor-pointer"
                            >
                              Buy Now
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddToCart(laptop)}
                              className="grid h-8 w-8 place-items-center rounded-xl border border-gray-300 bg-white text-[#344257] hover:bg-gray-50 transition shrink-0 shadow-xs cursor-pointer"
                              title="Add to cart"
                            >
                              <ShoppingCart className="h-3.5 w-3.5" />
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

        {/* 45-POINT INSPECTION CHECKLIST SECTION */}
        <section className="mt-16 bg-white rounded-3xl p-6 md:p-10 border border-gray-200 shadow-xs">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#344257]/10 px-3 py-1 text-xs font-bold text-[#344257]">
              <ShieldCheck className="h-3.5 w-3.5 text-[#344257]" /> Fundu Laptop Certified Standards
            </div>
            <h2 className="mt-2 font-display text-2xl md:text-3xl font-extrabold text-[#344257]">
              The 45-Point Laptop Quality Inspection
            </h2>
            <p className="mt-1.5 text-xs md:text-sm text-gray-500">
              Every refurbished laptop undergoes rigorous electronic stress-testing, keyboard calibration, and battery cycle verification before arriving at your doorstep.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {LAPTOP_QUALITY_CHECK_POINTS.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.category}
                  className="rounded-2xl border border-gray-200 bg-[#F8F9FB] p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="h-9 w-9 rounded-xl bg-[#344257] text-white flex items-center justify-center shadow-xs">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="mt-3 font-display text-xs font-bold text-[#344257]">
                      {cat.category}
                    </h4>
                    <ul className="mt-2 space-y-1.5 text-[11px] text-gray-500">
                      {cat.points.map((pt) => (
                        <li key={pt} className="flex items-start gap-1.5">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0 mt-0.5" />
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

        {/* BUYER FAQS ACCORDION SECTION */}
        <section className="mt-12 bg-white rounded-3xl p-6 md:p-10 border border-gray-200 shadow-xs">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-extrabold text-[#344257]">
              Frequently Asked Questions (Refurbished Laptops)
            </h2>
            <p className="mt-1.5 text-xs md:text-sm text-gray-500">
              Everything you need to know about Fundu certified laptops, warranty, charger, and doorstep inspection.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {BUYER_FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={faq.q}
                  className="border border-gray-200 rounded-2xl overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left p-4 md:p-5 flex items-center justify-between gap-4 font-display font-bold text-sm text-[#344257] hover:bg-gray-50 transition cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span className="text-lg font-black text-[#47576E]">{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 md:px-5 md:pb-5 text-xs text-gray-600 leading-relaxed border-t border-gray-100 bg-[#FAFAFC]">
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

