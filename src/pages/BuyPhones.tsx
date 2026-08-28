import { useEffect, useMemo, useState } from 'react';
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
  HelpCircle,
  RotateCcw,
  MessageSquare,
} from 'lucide-react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { db, formatINR } from '../lib/db';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import type { Product } from '../types';

const BRAND_PILLS = [
  { name: 'All', icon: '📱' },
  { name: 'Apple', icon: '🍎' },
  { name: 'Samsung', icon: '🌌' },
  { name: 'OnePlus', icon: '⚡' },
  { name: 'Xiaomi', icon: '🔥' },
  { name: 'Vivo', icon: '📸' },
  { name: 'Oppo', icon: '✨' },
  { name: 'Realme', icon: '🚀' },
  { name: 'Google', icon: '🔍' },
  { name: 'Nothing', icon: '⭕' },
  { name: 'Motorola', icon: '📡' },
];

const SAMPLE_BEST_SELLING_PHONES: Product[] = [
  {
    id: 'sample-1',
    title: 'Apple iPhone 13 (128 GB) - Starlight',
    brand: 'Apple',
    model: 'iPhone 13',
    ram: '4 GB',
    storage: '128 GB',
    color: 'Starlight',
    condition: 'Excellent',
    price: 38999,
    original_price: 59900,
    discount_percent: 35,
    warranty_months: 6,
    description: 'Refurbished Superb condition. 32-Point inspection passed. Battery health above 88%. Free doorstep delivery in Lucknow.',
    images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80'],
    is_approved: true,
    is_featured: true,
    stock: 5,
    sold_count: 42,
    seller_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-2',
    title: 'Apple iPhone 14 (128 GB) - Midnight',
    brand: 'Apple',
    model: 'iPhone 14',
    ram: '6 GB',
    storage: '128 GB',
    color: 'Midnight',
    condition: 'Excellent',
    price: 47499,
    original_price: 69900,
    discount_percent: 32,
    warranty_months: 6,
    description: 'Flawless condition, verified screen & camera. Includes charging cable and Fundu 6-month warranty card.',
    images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80'],
    is_approved: true,
    is_featured: true,
    stock: 4,
    sold_count: 29,
    seller_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-3',
    title: 'Samsung Galaxy S23 5G (256 GB) - Phantom Black',
    brand: 'Samsung',
    model: 'Galaxy S23',
    ram: '8 GB',
    storage: '256 GB',
    color: 'Phantom Black',
    condition: 'Excellent',
    price: 42999,
    original_price: 74999,
    discount_percent: 42,
    warranty_months: 6,
    description: 'Flagship Snapdragon performance. Thoroughly sanitized and tested. Free express delivery in Gomti Nagar, Lucknow.',
    images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80'],
    is_approved: true,
    is_featured: true,
    stock: 3,
    sold_count: 18,
    seller_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-4',
    title: 'OnePlus 11 5G (256 GB) - Titan Black',
    brand: 'OnePlus',
    model: 'OnePlus 11',
    ram: '16 GB',
    storage: '256 GB',
    color: 'Titan Black',
    condition: 'Good',
    price: 34999,
    original_price: 56999,
    discount_percent: 38,
    warranty_months: 6,
    description: 'Hasselblad camera system, super fast charging. Fully verified device.',
    images: ['https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80'],
    is_approved: true,
    is_featured: true,
    stock: 6,
    sold_count: 35,
    seller_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-5',
    title: 'Google Pixel 7 5G (128 GB) - Obsidian',
    brand: 'Google',
    model: 'Pixel 7',
    ram: '8 GB',
    storage: '128 GB',
    color: 'Obsidian',
    condition: 'Excellent',
    price: 28499,
    original_price: 59999,
    discount_percent: 52,
    warranty_months: 6,
    description: 'Pure Android experience with top-tier AI photography. Grade A condition.',
    images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80'],
    is_approved: true,
    is_featured: true,
    stock: 7,
    sold_count: 50,
    seller_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-6',
    title: 'Xiaomi Redmi Note 13 Pro 5G (256 GB) - Coral Purple',
    brand: 'Xiaomi',
    model: 'Redmi Note 13 Pro',
    ram: '8 GB',
    storage: '256 GB',
    color: 'Coral Purple',
    condition: 'Good',
    price: 17999,
    original_price: 24999,
    discount_percent: 28,
    warranty_months: 6,
    description: '200MP OIS Camera, AMOLED 120Hz display. Clean, tested device.',
    images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80'],
    is_approved: true,
    is_featured: false,
    stock: 8,
    sold_count: 64,
    seller_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-7',
    title: 'Nothing Phone (2) 5G (256 GB) - Dark Grey',
    brand: 'Nothing',
    model: 'Phone (2)',
    ram: '12 GB',
    storage: '256 GB',
    color: 'Dark Grey',
    condition: 'Excellent',
    price: 29999,
    original_price: 44999,
    discount_percent: 33,
    warranty_months: 6,
    description: 'Glyph Interface, premium glass design. Cleaned and quality certified.',
    images: ['https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=600&auto=format&fit=crop&q=80'],
    is_approved: true,
    is_featured: false,
    stock: 2,
    sold_count: 14,
    seller_id: null,
    created_at: new Date().toISOString(),
  },
];

const PRICE_PRESETS = [
  { label: 'All Prices', min: 0, max: 200000 },
  { label: 'Under ₹15,000', min: 0, max: 15000 },
  { label: '₹15,000 - ₹30,000', min: 15000, max: 30000 },
  { label: '₹30,000 - ₹50,000', min: 30000, max: 50000 },
  { label: 'Above ₹50,000', min: 50000, max: 200000 },
];

const BUYER_FAQS = [
  { q: 'What does "Refurbished Superb / Good" condition mean?', a: 'Superb condition means the phone is like-new with zero scratches, 100% original parts, and battery health >88%. Good condition has minor cosmetic scuffs on the body but 100% original functional display and hardware.' },
  { q: 'What warranty comes with refurbished phones?', a: 'Every refurbished mobile phone purchased on Fundu includes a 6-month warranty covering hardware repairs and technical support right in Lucknow.' },
  { q: 'Is doorstep delivery free in Lucknow?', a: 'Yes! We offer free same-day or next-day doorstep delivery across all Lucknow areas including Gomti Nagar, Hazratganj, Indira Nagar, Aliganj, Mahanagar, etc.' },
  { q: 'What is the 7-day replacement policy?', a: 'If you encounter any technical issue with your phone within 7 days of delivery, we will replace it free of cost or provide a full refund.' },
];

export default function BuyPhones() {
  const { user, profile } = useAuth();
  const { setCartItem } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [gradeFilter, setGradeFilter] = useState<string>('All');
  const [pricePreset, setPricePreset] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(100000);
  const [selectedStorage, setSelectedStorage] = useState<string>('');
  const [sortBy, setSortBy] = useState('featured');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const [lookupModel, setLookupModel] = useState<string>('');
  const [lookupStorage, setLookupStorage] = useState<string>('');

  useEffect(() => {
    db
      .from('products')
      .select('*')
      .eq('is_approved', true)
      .order('is_featured', { ascending: false })
      .then(({ data }) => {
        const fetched = (data as Product[]) ?? [];
        if (fetched.length > 0) {
          const combined = [...fetched];
          SAMPLE_BEST_SELLING_PHONES.forEach((sp) => {
            if (!combined.some((p) => p.title.toLowerCase() === sp.title.toLowerCase())) {
              combined.push(sp);
            }
          });
          setProducts(combined);
        } else {
          setProducts(SAMPLE_BEST_SELLING_PHONES);
        }
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const q = searchParams.get('search') ?? searchParams.get('product') ?? '';
    const b = searchParams.get('brand') ?? '';
    if (q) setSearch(q);
    if (b) setSelectedBrand(b);
  }, [searchParams]);

  const handleResetFilters = () => {
    setSelectedBrand('All');
    setLookupModel('');
    setLookupStorage('');
    setGradeFilter('All');
    setPricePreset(0);
    setMaxPrice(100000);
    setSelectedStorage('');
    setSearch('');
  };

  const filteredProducts = useMemo(() => {
    const preset = PRICE_PRESETS[pricePreset];
    let list = products.filter((p) => {
      // 1. Search text input match
      const matchSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase()) ||
        p.model.toLowerCase().includes(search.toLowerCase());

      // 2. Brand match (from Brand Pills or PhoneLookup)
      const matchBrand =
        selectedBrand === 'All' || !selectedBrand || p.brand.toLowerCase() === selectedBrand.toLowerCase();

      // 3. Model match (from PhoneLookup)
      const matchModel =
        !lookupModel ||
        p.model.toLowerCase().includes(lookupModel.toLowerCase()) ||
        p.title.toLowerCase().includes(lookupModel.toLowerCase()) ||
        lookupModel.toLowerCase().includes(p.model.toLowerCase());

      // 4. Grade condition match
      const matchGrade =
        gradeFilter === 'All' ||
        (gradeFilter === 'Superb' && p.condition === 'Excellent') ||
        (gradeFilter === 'Good' && p.condition === 'Good') ||
        (gradeFilter === 'Fair' && p.condition === 'Fair');

      // 5. Storage match (from Sidebar or PhoneLookup)
      const effectiveStorage = selectedStorage || lookupStorage;
      const matchStorage =
        !effectiveStorage || p.storage?.toLowerCase().includes(effectiveStorage.toLowerCase());

      // 6. Price range match
      const matchPreset = p.price >= preset.min && p.price <= preset.max;
      const matchMaxPrice = p.price <= maxPrice;

      return matchSearch && matchBrand && matchModel && matchGrade && matchStorage && matchPreset && matchMaxPrice;
    });

    if (sortBy === 'low') list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === 'high') list = [...list].sort((a, b) => b.price - a.price);
    if (sortBy === 'discount') list = [...list].sort((a, b) => (b.discount_percent || 0) - (a.discount_percent || 0));

    return list;
  }, [products, search, selectedBrand, lookupModel, gradeFilter, selectedStorage, lookupStorage, pricePreset, maxPrice, sortBy]);

  const handleAddToCart = (product: Product) => {
    if (profile && profile.role !== 'customer') {
      alert(`Access Restricted: You are logged in as ${profile.role.toUpperCase()}. Vendor, Delivery, and Admin accounts cannot place orders.`);
      return;
    }
    setCartItem({ type: 'product', item: product, quantity: 1 });
  };

  const handleBuyNow = (product: Product) => {
    if (profile && profile.role !== 'customer') {
      alert(`Access Restricted: You are logged in as ${profile.role.toUpperCase()}. Vendor, Delivery, and Admin accounts cannot place orders.`);
      return;
    }
    setCartItem({ type: 'product', item: product, quantity: 1 });
    if (user) {
      navigate('/checkout');
    } else {
      navigate('/login?redirect=/checkout');
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f8] pb-24">
      {/* Cashify Top Search & Brand Filter Header */}
      <section className="bg-white border-b border-[#e5ecef] py-6">
        <div className="container-page space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> Refurbished Mobile Store
              </div>
              <h1 className="mt-2 font-display text-2xl md:text-4xl font-extrabold text-ink-900">
                Buy Refurbished Mobile Phones
              </h1>
              <p className="mt-1 text-xs md:text-sm text-ink-500">
                32-Point Checked · 6 Months Warranty · Free Doorstep Delivery in Lucknow
              </p>
            </div>

            {/* Enhanced Prominent Working Search Bar */}
            <div className="relative w-full md:w-[480px]">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#00a896]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search phone to buy — iPhone 15, S24, Pixel 8..."
                  className="w-full bg-[#f1f5f9] hover:bg-gray-100 focus:bg-white focus:ring-2 focus:ring-[#00a896]/30 focus:border-[#00a896] border border-gray-200 pl-11 pr-10 py-3 rounded-full text-sm font-semibold text-gray-800 outline-none shadow-xs transition-all"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-full p-1 transition"
                    title="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Quick Search Tag Chips */}
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="font-bold text-gray-400 text-[11px] uppercase tracking-wider">Popular:</span>
                {['iPhone 15', 'iPhone 14', 'Galaxy S24', 'OnePlus 12', 'Pixel 8'].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setSearch(term)}
                    className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-600 hover:bg-teal-50 hover:text-[#00a896] transition"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Brand Pills Carousel */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {BRAND_PILLS.map((b) => (
              <button
                key={b.name}
                type="button"
                onClick={() => setSelectedBrand(b.name)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                  selectedBrand === b.name
                    ? 'bg-[#00a896] text-white shadow-sm ring-2 ring-[#00a896]/20'
                    : 'border border-gray-200 bg-white text-gray-700 hover:border-[#00a896] hover:bg-teal-50/40'
                }`}
              >
                <span>{b.icon}</span> {b.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* STANDALONE STICKY 3-STEP REFURBISHED BUYING PROGRESS BAR */}
      <div className="sticky top-[64px] md:top-[116px] z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-md py-3 px-4 transition-all">
        <div className="flex items-center justify-center flex-wrap sm:flex-nowrap gap-2 sm:gap-4 max-w-4xl mx-auto overflow-x-auto scrollbar-hide no-scrollbar py-1">
          {[
            { s: 1, label: '1. Select Refurbished Model' },
            { s: 2, label: '2. 32-Point Inspection & 6M Warranty' },
            { s: 3, label: '3. Free Lucknow Doorstep Delivery' },
          ].map(({ s, label }) => (
            <div key={s} className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-2 rounded-full bg-teal-50 border border-teal-200/80 px-3.5 py-1.5 text-xs font-extrabold text-[#00a896]">
                <span className="grid h-4 w-4 place-items-center rounded-full bg-[#00a896] text-white text-[10px]">
                  ✓
                </span>
                <span className="whitespace-nowrap">{label}</span>
              </div>
              {s < 3 && <div className="h-0.5 w-3 sm:w-6 rounded-full bg-teal-400" />}
            </div>
          ))}
        </div>
      </div>

      {/* Main Container: Sidebar + Product Grid */}
      <div className="container-page mt-8">

        {/* Refurbished Condition Grade Tabs */}
        <div className="card p-3 rounded-2xl mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-bold text-ink-500 px-2 uppercase tracking-wider">Grade:</span>
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
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-ink-500">Sort By:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="select py-1 px-3 text-xs font-bold rounded-xl border-ink-200"
            >
              <option value="featured">Featured</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
              <option value="discount">Highest Discount</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block space-y-6">
            <div className="card p-6 rounded-[24px] space-y-6 sticky top-24">
              <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                <h3 className="font-display text-base font-extrabold text-ink-900 flex items-center gap-2">
                  <Filter className="h-4 w-4 text-brand-600" /> Filters
                </h3>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-brand-600 hover:underline font-bold"
                >
                  Reset All
                </button>
              </div>

              {/* Price Preset Filter */}
              <div>
                <label className="label text-xs font-bold">Price Range</label>
                <div className="space-y-1.5 mt-2">
                  {PRICE_PRESETS.map((preset, idx) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setPricePreset(idx)}
                      className={`w-full text-left rounded-xl px-3 py-2 text-xs font-semibold transition ${
                        pricePreset === idx
                          ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200'
                          : 'text-ink-600 hover:bg-ink-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-ink-100">
                  <div className="flex justify-between text-xs font-bold text-ink-700">
                    <span>Max Price:</span>
                    <span className="text-brand-600">{formatINR(maxPrice)}</span>
                  </div>
                  <input
                    type="range"
                    min="10000"
                    max="100000"
                    step="5000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full mt-2 accent-brand-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Storage Filter */}
              <div>
                <label className="label text-xs font-bold">Storage Capacity</label>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {['64 GB', '128 GB', '256 GB', '512 GB'].map((stg) => (
                    <button
                      key={stg}
                      type="button"
                      onClick={() => setSelectedStorage(selectedStorage === stg ? '' : stg)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                        selectedStorage === stg
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'border border-ink-200 bg-white text-ink-700 hover:border-brand-300'
                      }`}
                    >
                      {stg}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-ink-500">
                Showing <span className="text-ink-900 font-extrabold">{filteredProducts.length}</span> certified refurbished phones in Lucknow
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="card p-4 h-72 animate-pulse bg-white/60" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="space-y-8 animate-fade-in">
                {/* Clean, Informative No-Match State Card */}
                <div className="card p-8 sm:p-12 text-center rounded-[32px] bg-white border border-ink-100/90 shadow-soft-sm space-y-4">
                  <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-amber-50 text-amber-600 border border-amber-200/80 shadow-inner">
                    <Search className="h-10 w-10 text-amber-600" />
                  </div>
                  
                  <div className="max-w-md mx-auto">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/80 px-3 py-1 text-xs font-black text-amber-800">
                      <span>No Exact Match in Stock</span>
                    </div>
                    
                    <h3 className="mt-3 font-display text-xl sm:text-2xl font-black text-ink-900">
                      No phones found matching "{lookupModel || search || (selectedBrand !== 'All' ? selectedBrand : '') || 'your filters'}"
                    </h3>
                    
                    <p className="mt-2 text-xs sm:text-sm text-ink-500 leading-relaxed">
                      We currently don't have this specific device in our certified refurbished Lucknow inventory. Our stock refreshes daily!
                    </p>
                  </div>

                  {/* Active filters chips preview */}
                  <div className="flex flex-wrap justify-center items-center gap-2 pt-2">
                    {selectedBrand !== 'All' && (
                      <span className="badge bg-ink-100 text-ink-700 text-xs">Brand: {selectedBrand}</span>
                    )}
                    {lookupModel && (
                      <span className="badge bg-brand-100 text-brand-800 text-xs">Model: {lookupModel}</span>
                    )}
                    {lookupStorage && (
                      <span className="badge bg-ink-100 text-ink-700 text-xs">Storage: {lookupStorage}</span>
                    )}
                    {search && (
                      <span className="badge bg-ink-100 text-ink-700 text-xs">Search: "{search}"</span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="btn-primary text-xs px-5 py-2.5 rounded-xl font-bold shadow-md flex items-center gap-2"
                    >
                      <RotateCcw className="h-4 w-4" /> Clear Filters & View All Phones
                    </button>

                    <a
                      href={`https://wa.me/919839122345?text=${encodeURIComponent(
                        `Hi Fundu Lucknow, I am looking for ${lookupModel || search || selectedBrand || 'a refurbished phone'} in Lucknow. Please notify me when it is in stock!`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn bg-[#25D366] text-white hover:bg-[#20bd5a] text-xs px-4 py-2.5 rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <MessageSquare className="h-4 w-4" /> Request on WhatsApp
                    </a>

                    <Link
                      to="/sell"
                      className="btn-outline text-xs px-4 py-2.5 rounded-xl font-bold flex items-center gap-1.5"
                    >
                      <span>Sell Your Old Phone</span>
                    </Link>
                  </div>
                </div>

                {/* Recommendations: Available Top Refurbished Phones in Lucknow */}
                {products.length > 0 && (
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-display font-black text-lg text-ink-900">
                          Popular Certified Refurbished Phones in Stock
                        </h4>
                        <p className="text-xs text-ink-500">Ready for same-day doorstep delivery across Lucknow</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="text-xs font-bold text-brand-600 hover:underline"
                      >
                        View all ({products.length}) →
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {products.slice(0, 3).map((product) => {
                        const image = product.images?.[0] || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80';
                        const isSuperb = product.condition === 'Excellent';

                        return (
                          <div
                            key={product.id}
                            className="card p-5 rounded-[24px] flex flex-col justify-between hover:shadow-soft-lg transition-all duration-200 border border-ink-100 group bg-white"
                          >
                            <div>
                              <Link to={`/product/${product.id}`} className="block">
                                <div className="relative rounded-2xl bg-[#f8fafb] p-4 flex justify-center items-center overflow-hidden">
                                  <span
                                    className={`absolute top-3 left-3 z-10 pointer-events-none badge text-[10px] font-extrabold ${
                                      isSuperb ? 'bg-emerald-600 text-white' : 'bg-weather-600 text-white'
                                    }`}
                                  >
                                    {isSuperb ? 'Superb (Like New)' : 'Good Value'}
                                  </span>
                                  {product.discount_percent && (
                                    <span className="absolute top-3 right-3 z-10 pointer-events-none badge bg-accent-500 text-white text-[10px] font-extrabold">
                                      {product.discount_percent}% OFF
                                    </span>
                                  )}
                                  <img
                                    src={image}
                                    alt={product.title}
                                    className="h-44 w-full object-contain group-hover:scale-105 transition-transform duration-300"
                                    loading="lazy"
                                  />
                                </div>
                              </Link>

                              <div className="mt-4">
                                <Link to={`/product/${product.id}`}>
                                  <h3 className="font-display font-extrabold text-sm text-ink-900 group-hover:text-brand-600 transition truncate">
                                    {product.title}
                                  </h3>
                                </Link>
                                <p className="text-xs text-ink-500 mt-0.5">
                                  {[product.storage, product.color].filter(Boolean).join(' · ')}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-ink-100/60">
                              <div className="flex items-baseline justify-between mb-3">
                                <div>
                                  <span className="font-display text-lg font-black text-ink-900">
                                    {formatINR(product.price)}
                                  </span>
                                  {product.original_price && (
                                    <span className="ml-2 text-xs text-ink-400 line-through">
                                      {formatINR(product.original_price)}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleBuyNow(product)}
                                  className="btn-primary text-xs flex-1 py-2 rounded-xl font-bold bg-brand-600 hover:bg-brand-700"
                                >
                                  Buy Now
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAddToCart(product)}
                                  className="grid h-9 w-9 place-items-center rounded-xl border border-ink-200 bg-white text-ink-700 hover:border-brand-500 hover:text-brand-600 transition shrink-0"
                                  title="Add to cart"
                                >
                                  <ShoppingCart className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProducts.map((product) => {
                  const image = product.images?.[0] || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80';
                  const isSuperb = product.condition === 'Excellent';

                  return (
                    <div
                      key={product.id}
                      className="card p-5 rounded-[24px] flex flex-col justify-between hover:shadow-soft-lg transition-all duration-200 border border-ink-100 group bg-white"
                    >
                      <div>
                        {/* Image & Grade Badge */}
                        <Link to={`/product/${product.id}`} className="block">
                          <div className="relative rounded-2xl bg-[#f8fafb] p-4 flex justify-center items-center overflow-hidden">
                            <span
                              className={`absolute top-3 left-3 z-10 pointer-events-none badge text-[10px] font-extrabold ${
                                isSuperb ? 'bg-emerald-600 text-white' : 'bg-weather-600 text-white'
                              }`}
                            >
                              {isSuperb ? 'Superb (Like New)' : 'Good Value'}
                            </span>
                            {product.offer_tag ? (
                              <span className="absolute top-3 right-3 z-10 pointer-events-none badge bg-amber-500 text-white text-[10px] font-black shadow-xs">
                                {product.offer_tag}
                              </span>
                            ) : product.discount_percent ? (
                              <span className="absolute top-3 right-3 z-10 pointer-events-none badge bg-accent-500 text-white text-[10px] font-extrabold">
                                {product.discount_percent}% OFF
                              </span>
                            ) : null}
                            <img
                              src={image}
                              alt={product.title}
                              className="h-44 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                        </Link>

                        {/* Title & Specs */}
                        <Link to={`/product/${product.id}`} className="block mt-4">
                          <h3 className="font-display font-bold text-sm text-ink-900 line-clamp-1 group-hover:text-brand-600 transition">
                            {product.title}
                          </h3>
                        </Link>
                        <p className="text-xs text-ink-500 mt-0.5">
                          {product.storage ? `${product.storage} Storage` : ''} · {product.color || 'Original'}
                        </p>

                        {/* Warranty Badge */}
                        <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 rounded-lg px-2.5 py-1 w-max">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> 6 Months Warranty in Lucknow
                        </div>

                        {/* Trust Bullets */}
                        <div className="mt-3 space-y-1 text-[10px] text-ink-500 font-semibold">
                          <p className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" /> 32-Point Quality Inspection Passed
                          </p>
                          <p className="flex items-center gap-1">
                            <Truck className="h-3 w-3 text-emerald-600" /> Free Doorstep Delivery in Lucknow
                          </p>
                        </div>
                      </div>

                      {/* Price & Action Buttons */}
                      <div className="mt-5 pt-4 border-t border-ink-100">
                        <div className="flex items-baseline gap-2">
                          <span className="font-display text-xl font-extrabold text-ink-900">
                            {formatINR(product.price)}
                          </span>
                          {product.original_price && (
                            <span className="text-xs text-ink-400 line-through">
                              {formatINR(product.original_price)}
                            </span>
                          )}
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => handleAddToCart(product)}
                            className="btn-outline text-xs py-2 px-3 flex items-center justify-center gap-1 font-bold"
                          >
                            <ShoppingCart className="h-3.5 w-3.5" /> Cart
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBuyNow(product)}
                            className="btn-primary text-xs py-2 px-3 flex items-center justify-center gap-1 font-bold"
                          >
                            Buy Now
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>

        {/* Why Buy Refurbished Section */}
        <section className="mt-16 card p-8 rounded-[32px]">
          <div className="text-center max-w-xl mx-auto">
            <span className="badge bg-brand-50 text-brand-700">Certified Quality Guarantee</span>
            <h2 className="mt-2 font-display text-2xl font-extrabold text-ink-900">Why Buy Refurbished Phones from Fundu?</h2>
            <p className="mt-1 text-xs text-ink-500">Premium pre-owned smartphones backed by 100% testing & warranty in Lucknow</p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl border border-ink-100 bg-white">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h4 className="mt-3 font-bold text-ink-900 text-sm">32-Point Check</h4>
              <p className="mt-1 text-xs text-ink-500">Display, battery, camera, microphones, and touch tested thoroughly.</p>
            </div>

            <div className="p-5 rounded-2xl border border-ink-100 bg-white">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-100 text-brand-700">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h4 className="mt-3 font-bold text-ink-900 text-sm">6 Months Warranty</h4>
              <p className="mt-1 text-xs text-ink-500">Free Lucknow technician support and repair warranty included.</p>
            </div>

            <div className="p-5 rounded-2xl border border-ink-100 bg-white">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-weather-100 text-weather-700">
                <Truck className="h-5 w-5" />
              </div>
              <h4 className="mt-3 font-bold text-ink-900 text-sm">Free Lucknow Delivery</h4>
              <p className="mt-1 text-xs text-ink-500">Doorstep delivery across Gomti Nagar, Hazratganj, Indira Nagar & 25+ areas.</p>
            </div>

            <div className="p-5 rounded-2xl border border-ink-100 bg-white">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-nature-100 text-nature-700">
                <RotateCcw className="h-5 w-5" />
              </div>
              <h4 className="mt-3 font-bold text-ink-900 text-sm">7-Day Replacement</h4>
              <p className="mt-1 text-xs text-ink-500">Hassle-free replacement if any hardware fault occurs within 7 days.</p>
            </div>
          </div>
        </section>

        {/* FAQs Section */}
        <section className="mt-8 card p-8 rounded-[32px]">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-brand-600" />
            <h2 className="font-display text-xl font-extrabold text-ink-900">Buyer Frequently Asked Questions</h2>
          </div>

          <div className="mt-6 space-y-3">
            {BUYER_FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={faq.q} className="rounded-2xl border border-ink-100 bg-white overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-4 text-left font-bold text-sm text-ink-900 hover:bg-ink-50"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-ink-400" /> : <ChevronDown className="h-4 w-4 text-ink-400" />}
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-0 text-xs text-ink-600 border-t border-ink-50 leading-relaxed">
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
