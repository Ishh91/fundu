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
} from 'lucide-react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { db, formatINR } from '../lib/db';
import { deduplicateProductsByModel } from '../lib/modelVariants';
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

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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
        .order('is_featured', { ascending: false })
        .then(({ data }) => {
          const fetched = (data as Product[]) ?? [];
          if (fetched.length > 0) {
            setProducts(fetched);
          } else {
            setProducts(SAMPLE_BEST_SELLING_PHONES);
          }
          setLoading(false);
        })
        .catch (() => {
      setProducts(SAMPLE_BEST_SELLING_PHONES);
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

return (
  <div className="min-h-screen bg-[#F7F7FA] pb-24 text-[#344257]">
    {/* HERO & TOP BAR WITH FUNDU PALETTE */}
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
              <span>Certified Refurbished Marketplace</span>
            </div>
            <h1 className="mt-3 font-display text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Buy Refurbished Mobile Phones
            </h1>
            <p className="mt-2 text-xs md:text-sm text-[#C0C8D8] leading-relaxed">
              Save up to 50% on top smartphones. 32-Point inspection certified, 6-Month warranty, & free express doorstep delivery.
            </p>

            {/* Feature Badges */}
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold text-white/90">
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg border border-white/10">
                <ShieldCheck className="h-3.5 w-3.5 text-[#C0C8D8]" /> 6 Months Warranty
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg border border-white/10">
                <Award className="h-3.5 w-3.5 text-[#C0C8D8]" /> 32-Point Quality Passed
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
                placeholder="Search model — iPhone 15, S24, OnePlus 12..."
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
              <span className="font-bold text-gray-400 text-[10px] uppercase tracking-wider">Trending:</span>
              {['iPhone 15', 'Galaxy S24', 'Nothing 2a', 'OnePlus 12', 'Pixel 8', 'Tecno Camon'].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setSearch(term)}
                  className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-[#47576E] hover:bg-[#344257] hover:text-white transition"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* HORIZONTAL CIRCULAR BRAND LOGO CAROUSEL */}
    <section className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
      <div className="container-page py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#47576E]">
            Shop By Brand
          </span>
          <span className="text-xs text-gray-500 font-medium hidden sm:inline">
            Select a brand to filter certified phones
          </span>
        </div>

        <div className="relative group/carousel">
          {/* Desktop Left Scroll Arrow */}
          <button
            type="button"
            onClick={() => scrollBrands('left')}
            className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-20 h-8 w-8 items-center justify-center rounded-full bg-white border border-gray-300 shadow-md text-[#344257] hover:bg-[#344257] hover:text-white transition cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Scrollable Brands Strip */}
          <div
            ref={brandScrollRef}
            className="flex items-center gap-2 sm:gap-3 overflow-x-auto py-2 px-1 scrollbar-hide no-scrollbar scrollbar-none scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {BRAND_PILLS.map((b) => {
              const isSelected = selectedBrand.toLowerCase() === b.name.toLowerCase();
              return (
                <button
                  key={b.name}
                  type="button"
                  onClick={() => setSelectedBrand(b.name)}
                  className="flex flex-col items-center gap-1.5 px-1.5 py-1 min-w-[70px] sm:min-w-[78px] transition-all duration-200 shrink-0 group focus:outline-none cursor-pointer"
                >
                  <div
                    className={`h-14 w-14 sm:h-16 sm:w-16 rounded-full flex items-center justify-center p-2.5 transition-all duration-200 bg-white ${isSelected
                        ? 'border-2 border-[#344257] ring-4 ring-[#344257]/15 shadow-sm scale-105 bg-slate-50'
                        : 'border border-gray-200 hover:border-[#6A859F] hover:shadow-xs hover:scale-105'
                      }`}
                  >
                    {b.name === 'All' ? (
                      <div className="h-full w-full rounded-full bg-[#344257] text-white flex items-center justify-center">
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
                    className={`text-xs tracking-tight text-center whitespace-nowrap transition-colors ${isSelected
                        ? 'font-extrabold text-[#344257]'
                        : 'font-semibold text-gray-600 group-hover:text-[#344257]'
                      }`}
                  >
                    {b.label}
                  </span>
                  {isSelected && (
                    <span className="h-1 w-5 rounded-full bg-[#344257] -mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Desktop Right Scroll Arrow */}
          <button
            type="button"
            onClick={() => scrollBrands('right')}
            className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 h-8 w-8 items-center justify-center rounded-full bg-white border border-gray-300 shadow-md text-[#344257] hover:bg-[#344257] hover:text-white transition cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>

    {/* QUICK PRICE PRESET FILTER PILLS */}
    <section className="bg-[#F0F2F5] border-b border-gray-200/80 py-2.5">
      <div
        className="container-page flex items-center justify-between gap-3 overflow-x-auto scrollbar-hide no-scrollbar scrollbar-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
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
      </section >

  {/* MAIN CONTAINER: SIDEBAR + PRODUCT GRID */ }
  < div className = "container-page mt-6" >
    {/* Grade Tabs & Sort Bar */ }
    < div className = "bg-white p-3 rounded-2xl mb-6 flex flex-wrap items-center justify-between gap-3 border border-gray-200 shadow-xs" >
          <div
            className="flex items-center gap-2 overflow-x-auto scrollbar-hide no-scrollbar scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <span className="text-xs font-bold text-gray-500 px-2 uppercase tracking-wider">Grade:</span>
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
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
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
        </div >

  <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
    {/* DESKTOP FILTER SIDEBAR */}
    <aside className={`space-y-6 ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-6 sticky top-24">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="font-display text-sm font-extrabold text-[#344257] flex items-center gap-2">
            <Filter className="h-4 w-4 text-[#47576E]" /> Refine Results
          </h3>
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs text-[#47576E] hover:underline font-bold"
          >
            Reset
          </button>
        </div>

        {/* Storage Filter */}
        <div>
          <label className="text-xs font-bold text-[#344257] uppercase tracking-wider block mb-2">
            Storage Capacity
          </label>
          <div className="flex flex-wrap gap-1.5">
            {['64 GB', '128 GB', '256 GB', '512 GB'].map((stg) => (
              <button
                key={stg}
                type="button"
                onClick={() => setSelectedStorage(selectedStorage === stg ? '' : stg)}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${selectedStorage === stg
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
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>₹8,000</span>
            <span>₹1,50,000</span>
          </div>
        </div>

        {/* Certified Refurbished Assurances Box */}
        <div className="rounded-xl bg-[#F7F7FA] p-3.5 border border-gray-200/80 space-y-2.5 text-xs text-[#47576E]">
          <div className="font-extrabold text-[#344257] flex items-center gap-1.5 text-xs">
            <ShieldCheck className="h-4 w-4 text-[#344257]" /> Fundu Assured
          </div>
          <div className="space-y-1.5 text-[11px] text-gray-600">
            <p className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#47576E] shrink-0" />
              32-Point diagnostic tested
            </p>
            <p className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#47576E] shrink-0" />
              6 Months Free Warranty
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

    {/* PRODUCT GRID */}
    <main className="space-y-6">
      <div className="flex items-center justify-between text-xs font-bold text-gray-500">
        <p>
          Showing <span className="text-[#344257] font-extrabold">{filteredProducts.length}</span> certified refurbished devices
        </p>
        {selectedBrand !== 'All' && (
          <button
            type="button"
            onClick={() => setSelectedBrand('All')}
            className="text-[#47576E] hover:underline flex items-center gap-1"
          >
            Clear Brand Filter <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-4 h-80 animate-pulse border border-gray-200" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-gray-200 shadow-xs space-y-4">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gray-100 text-[#47576E]">
            <Search className="h-8 w-8" />
          </div>
          <h3 className="font-display text-xl font-bold text-[#344257]">
            No Refurbished Phones Found
          </h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            We currently do not have matching inventory for your filters. Our stock refreshes daily at your doorstep!
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleResetFilters}
              className="btn bg-[#344257] text-white hover:bg-[#47576E] text-xs px-4 py-2 rounded-xl font-bold shadow-xs flex items-center gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" /> View All Phones
            </button>
            <a
              href={`https://wa.me/919839122345?text=${encodeURIComponent(
                `Hi Fundu, I am searching for ${search || selectedBrand || 'a refurbished phone'}. Please notify me when it's available!`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="btn bg-[#25D366] text-white text-xs px-4 py-2 rounded-xl font-bold flex items-center gap-1.5"
            >
              <MessageSquare className="h-3.5 w-3.5" /> Notify on WhatsApp
            </a>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((product) => {
            const image = product.images?.[0] || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80';
            const isSuperb = product.condition === 'Excellent';
            const savings = product.original_price && product.original_price > product.price
              ? product.original_price - product.price
              : null;
            const emiAmount = Math.round(product.price / 6);

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-gray-200/90 hover:border-[#6A859F] hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden group"
              >
                {/* Top Card Section: Badges, Image & Details */}
                <div>
                  {/* Image Showcase Container */}
                  <div className="relative bg-[#F8F9FA] p-4 flex items-center justify-center overflow-hidden border-b border-gray-100">
                    {/* Certified Grade Pill */}
                    <span
                      className={`absolute top-3 left-3 z-10 text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-xs ${isSuperb
                          ? 'bg-[#344257] text-white'
                          : 'bg-[#47576E] text-white'
                        }`}
                    >
                      {isSuperb ? 'Superb (Like New)' : 'Good Value'}
                    </span>

                    {/* Discount / Offer Tag */}
                    {product.discount_percent ? (
                      <span className="absolute top-3 right-3 z-10 text-[10px] font-extrabold bg-[#E65100] text-white px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                        <Tag className="h-3 w-3" /> {product.discount_percent}% OFF
                      </span>
                    ) : null}

                    <Link to={`/product/${product.id}`} className="block my-2">
                      <img
                        src={getCleanPhoneImage(product.brand, product.title, image)}
                        alt={product.title}
                        className="h-44 w-auto max-h-44 object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-sm"
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
                    <div className="absolute bottom-2 left-3 right-3 flex items-center justify-center gap-1 bg-white/90 backdrop-blur-xs py-1 px-2 rounded-lg text-[10px] font-bold text-[#344257] border border-gray-200/60 shadow-xs">
                      <CheckCircle2 className="h-3 w-3 text-[#47576E] shrink-0" />
                      <span>32-Point Certified Refurbished</span>
                    </div>
                  </div>

                  {/* Title & Specs */}
                  <div className="p-4 pb-2">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="font-display font-bold text-sm text-[#344257] group-hover:text-[#47576E] transition line-clamp-1">
                        {product.title}
                      </h3>
                    </Link>

                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-gray-500 font-semibold">
                      {product.available_storages && product.available_storages.length > 0 ? (
                        <span className="bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-md text-blue-800 font-bold">
                          {product.available_storages.join(' • ')}
                        </span>
                      ) : product.storage ? (
                        <span className="bg-gray-100 px-2 py-0.5 rounded-md text-gray-700">
                          {product.storage}
                        </span>
                      ) : null}
                      {product.ram && (
                        <span className="bg-gray-100 px-2 py-0.5 rounded-md text-gray-700">
                          {product.ram} RAM
                        </span>
                      )}
                      {product.color && (
                        <span className="text-gray-400">· {product.color}</span>
                      )}
                    </div>

                    {/* 6 Months Warranty Pill */}
                    <div className="mt-2.5 flex items-center gap-1 text-[10px] font-bold text-[#344257] bg-[#F0F0F5] border border-[#C0C8D8] px-2 py-0.5 rounded w-max">
                      <ShieldCheck className="h-3 w-3 text-[#47576E]" />
                      <span>6 Months Replacement Warranty</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Pricing & Action Section */}
                <div className="p-4 pt-2 border-t border-gray-100 bg-[#FAFAFC]">
                  <div className="flex items-baseline justify-between mb-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-lg font-black text-[#344257]">
                        {product.available_storages && product.available_storages.length > 1 ? `From ${formatINR(product.price)}` : formatINR(product.price)}
                      </span>
                      {product.original_price && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatINR(product.original_price)}
                        </span>
                      )}
                    </div>
                    {savings && (
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
                  {product.stock !== undefined && product.stock <= 0 ? (
                    <div className="flex items-center gap-2">
                      <span className="flex-1 py-2 text-center text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl">
                        Out of Stock
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleBuyNow(product)}
                        style={{
                          background: 'linear-gradient(135deg, #344257 0%, #47576E 100%)',
                        }}
                        className="flex-1 text-white text-xs py-2 rounded-xl font-bold shadow-xs hover:opacity-95 transition text-center cursor-pointer"
                      >
                        Buy Now
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
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

{/* 32-POINT INSPECTION CHECKLIST SECTION */ }
<section className="mt-16 bg-white rounded-3xl p-6 md:p-10 border border-gray-200 shadow-xs">
  <div className="text-center max-w-2xl mx-auto">
    <div className="inline-flex items-center gap-1.5 rounded-full bg-[#344257]/10 px-3 py-1 text-xs font-bold text-[#344257]">
      <ShieldCheck className="h-3.5 w-3.5 text-[#344257]" /> Fundu-Certified Standards
    </div>
    <h2 className="mt-2 font-display text-2xl md:text-3xl font-extrabold text-[#344257]">
      The 32-Point Quality Inspection
    </h2>
    <p className="mt-1.5 text-xs md:text-sm text-gray-500">
      Every refurbished phone undergoes strict mechanical, electronic, and software inspection before arriving at your doorstep.
    </p>
  </div>

  <div className="mt-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
    {QUALITY_CHECK_POINTS.map((cat) => {
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
            <ul className="mt-2.5 space-y-1.5">
              {cat.points.map((pt) => (
                <li key={pt} className="text-[11px] text-gray-600 flex items-start gap-1.5 leading-tight">
                  <CheckCircle2 className="h-3 w-3 text-[#47576E] mt-0.5 shrink-0" />
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

{/* REFURBISHED GRADING GUIDE */ }
<section className="mt-8 bg-white rounded-3xl p-6 md:p-10 border border-gray-200 shadow-xs">
  <div className="text-center max-w-xl mx-auto">
    <h2 className="font-display text-2xl font-extrabold text-[#344257]">
      Refurbished Condition Grading Guide
    </h2>
    <p className="mt-1 text-xs text-gray-500">
      Transparent assessment — zero surprises when you open your box at your doorstep
    </p>
  </div>

  <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
    <div className="rounded-2xl border-2 border-[#47576E] bg-[#F0F0F5] p-5 space-y-3">
      <div className="inline-flex items-center gap-1.5 bg-[#344257] text-white text-xs font-extrabold px-3 py-1 rounded-full">
        Superb (Like New)
      </div>
      <h4 className="font-bold text-sm text-[#344257]">Almost Indistinguishable From New</h4>
      <p className="text-xs text-gray-600 leading-relaxed">
        Zero scratches on screen, flawless body or near-invisible handling marks. Battery health guaranteed &gt;88%. 100% original OEM display and camera modules.
      </p>
      <div className="text-[11px] font-bold text-[#344257] pt-2 border-t border-[#C0C8D8]">
        ✓ Best for buyers wanting a showroom feel at up to 40% off
      </div>
    </div>

    <div className="rounded-2xl border-2 border-[#47576E]/60 bg-[#F4F5F8] p-5 space-y-3">
      <div className="inline-flex items-center gap-1.5 bg-[#47576E] text-white text-xs font-extrabold px-3 py-1 rounded-full">
        Good Value
      </div>
      <h4 className="font-bold text-sm text-[#344257]">Perfect Functionality with Minor Signs</h4>
      <p className="text-xs text-gray-600 leading-relaxed">
        Clean pristine display with zero cracks. Body or bezel may show light faint cosmetic scratches from pocket wear. 100% internal hardware performance.
      </p>
      <div className="text-[11px] font-bold text-[#344257] pt-2 border-t border-gray-300">
        ✓ Best value for money — saves up to 50% on flagship models
      </div>
    </div>

    <div className="rounded-2xl border-2 border-gray-300 bg-white p-5 space-y-3">
      <div className="inline-flex items-center gap-1.5 bg-gray-600 text-white text-xs font-extrabold px-3 py-1 rounded-full">
        Fair / Budget
      </div>
      <h4 className="font-bold text-sm text-[#344257]">Maximum Savings, 100% Working</h4>
      <p className="text-xs text-gray-600 leading-relaxed">
        Visible cosmetic scuffs, paint chips, or scratches on body or back panel. Screen has no cracks. All 32 diagnostic tests pass 100%.
      </p>
      <div className="text-[11px] font-bold text-gray-700 pt-2 border-t border-gray-200">
        ✓ Ideal for high performance on a strict budget
      </div>
    </div>
  </div>
</section>

{/* BUYER FAQS ACCORDION */ }
<section className="mt-8 bg-white rounded-3xl p-6 md:p-10 border border-gray-200 shadow-xs">
  <div className="flex items-center gap-2 mb-6">
    <HelpCircle className="h-5 w-5 text-[#344257]" />
    <h2 className="font-display text-xl md:text-2xl font-extrabold text-[#344257]">
      Refurbished Mobile Phone FAQs
    </h2>
  </div>

  <div className="space-y-3">
    {BUYER_FAQS.map((faq, idx) => {
      const isOpen = openFaq === idx;
      return (
        <div key={faq.q} className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <button
            type="button"
            onClick={() => setOpenFaq(isOpen ? null : idx)}
            className="w-full flex items-center justify-between p-4 text-left font-bold text-xs md:text-sm text-[#344257] hover:bg-gray-50 transition"
          >
            <span>{faq.q}</span>
            {isOpen ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />}
          </button>
          {isOpen && (
            <div className="p-4 pt-0 text-xs text-gray-600 border-t border-gray-100 leading-relaxed whitespace-pre-line">
              {faq.a}
            </div>
          )}
        </div>
      );
    })}
  </div>
</section>
      </div >
    </div >
  );
}
