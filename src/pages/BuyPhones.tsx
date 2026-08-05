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
} from 'lucide-react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { db, formatINR } from '../lib/db';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import type { Product } from '../types';
import PhoneLookup from '../components/PhoneLookup';

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

function generateSearchedProducts(query: string, brandFilter: string): Product[] {
  const q = (query || brandFilter).trim();
  if (!q) return [];

  const brandNames = ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Vivo', 'Realme', 'Google', 'Oppo'];
  const detectedBrand = brandNames.find((b) => q.toLowerCase().includes(b.toLowerCase())) || brandFilter || 'Refurbished';
  const cleanTitle = q.charAt(0).toUpperCase() + q.slice(1);

  const imagesByBrand: Record<string, string[]> = {
    Apple: ['https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&q=80&w=800'],
    Samsung: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=800'],
    OnePlus: ['https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&q=80&w=800'],
    Google: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=800'],
    Xiaomi: ['https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&q=80&w=800'],
  };

  const selectedImages = imagesByBrand[detectedBrand] ?? ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&q=80&w=800'];

  let basePrice = 24999;
  const qLower = q.toLowerCase();
  if (qLower.includes('pro max') || qLower.includes('ultra') || qLower.includes('fold')) basePrice = 54999;
  else if (qLower.includes('pro') || qLower.includes('s23') || qLower.includes('14')) basePrice = 42999;
  else if (qLower.includes('13') || qLower.includes('s22') || qLower.includes('pixel')) basePrice = 32999;
  else if (qLower.includes('redmi') || qLower.includes('nord') || qLower.includes('v27')) basePrice = 16999;

  return [
    {
      id: `dyn-search-1-${q}`,
      title: `${cleanTitle} (128 GB)`,
      brand: detectedBrand,
      model: cleanTitle,
      seller_id: 'fundu-official',
      ram: '6 GB',
      storage: '128 GB',
      color: 'Default',
      condition: 'Excellent',
      price: basePrice,
      original_price: Math.round(basePrice * 1.45),
      discount_percent: 31,
      warranty_months: 6,
      description: `Certified refurbished ${cleanTitle}. Passed 32-point inspection, battery health guaranteed above 88%. 6-month Fundu warranty.`,
      images: selectedImages,
      is_approved: true,
      is_featured: true,
      stock: 4,
      sold_count: 8,
      created_at: new Date().toISOString(),
    },
    {
      id: `dyn-search-2-${q}`,
      title: `${cleanTitle} (256 GB)`,
      brand: detectedBrand,
      model: cleanTitle,
      seller_id: 'fundu-official',
      ram: '8 GB',
      storage: '256 GB',
      color: 'Pro Edition',
      condition: 'Good',
      price: basePrice + 4000,
      original_price: Math.round((basePrice + 4000) * 1.4),
      discount_percent: 28,
      warranty_months: 6,
      description: `Refurbished ${cleanTitle} (256 GB). Fully tested and verified with complete accessories in Lucknow.`,
      images: [...selectedImages].reverse(),
      is_approved: true,
      is_featured: false,
      stock: 3,
      sold_count: 5,
      created_at: new Date().toISOString(),
    },
  ];
}

export default function BuyPhones() {
  const { user } = useAuth();
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

  const filteredProducts = useMemo(() => {
    const preset = PRICE_PRESETS[pricePreset];
    let list = products.filter((p) => {
      const matchSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase()) ||
        p.model.toLowerCase().includes(search.toLowerCase());

      const matchBrand =
        selectedBrand === 'All' || !selectedBrand || p.brand.toLowerCase() === selectedBrand.toLowerCase();

      const matchGrade =
        gradeFilter === 'All' ||
        (gradeFilter === 'Superb' && p.condition === 'Excellent') ||
        (gradeFilter === 'Good' && p.condition === 'Good') ||
        (gradeFilter === 'Fair' && p.condition === 'Fair');

      const matchStorage =
        !selectedStorage || p.storage?.toLowerCase().includes(selectedStorage.toLowerCase());

      const matchPreset = p.price >= preset.min && p.price <= preset.max;
      const matchMaxPrice = p.price <= maxPrice;

      return matchSearch && matchBrand && matchGrade && matchStorage && matchPreset && matchMaxPrice;
    });

    if (list.length === 0 && (search || (selectedBrand && selectedBrand !== 'All') || lookupModel)) {
      return generateSearchedProducts(search || lookupModel, selectedBrand !== 'All' ? selectedBrand : '');
    }

    if (sortBy === 'low') list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === 'high') list = [...list].sort((a, b) => b.price - a.price);
    if (sortBy === 'discount') list = [...list].sort((a, b) => (b.discount_percent || 0) - (a.discount_percent || 0));

    return list;
  }, [products, search, selectedBrand, gradeFilter, selectedStorage, pricePreset, maxPrice, sortBy, lookupModel]);

  const handleAddToCart = (product: Product) => {
    setCartItem({ type: 'product', item: product, quantity: 1 });
  };

  const handleBuyNow = (product: Product) => {
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

            {/* Top Search Bar */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search refurbished phones (iPhone 14, S23)..."
                className="input pl-10 pr-4 py-2.5 rounded-full border-ink-200 text-sm shadow-sm focus:border-brand-500"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Brand Pills Carousel */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {BRAND_PILLS.map((b) => (
              <button
                key={b.name}
                type="button"
                onClick={() => setSelectedBrand(b.name)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold whitespace-nowrap transition ${
                  selectedBrand === b.name
                    ? 'bg-brand-600 text-white shadow-sm ring-2 ring-brand-500/20'
                    : 'border border-ink-200 bg-white text-ink-700 hover:border-brand-300'
                }`}
              >
                <span>{b.icon}</span> {b.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Container: Sidebar + Product Grid */}
      <div className="container-page mt-8">
        {/* Compact Phone Lookup Tool */}
        <section className="mb-6">
          <PhoneLookup
            brand={selectedBrand === 'All' ? '' : selectedBrand}
            model={lookupModel}
            storage={lookupStorage}
            onBrandChange={(b) => setSelectedBrand(b || 'All')}
            onModelChange={setLookupModel}
            onStorageChange={setLookupStorage}
            title="Find & Filter Refurbished Phones"
            description="Pick brand, model, and storage variant to narrow down available stock."
            actionLabel="Apply Lookup"
            compact
          />
        </section>

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
                  onClick={() => {
                    setSelectedBrand('All');
                    setGradeFilter('All');
                    setPricePreset(0);
                    setMaxPrice(100000);
                    setSelectedStorage('');
                    setSearch('');
                  }}
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
                Showing <span className="text-ink-900">{filteredProducts.length}</span> certified refurbished phones in Lucknow
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="card p-4 h-72 animate-pulse bg-white/60" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="card p-12 text-center rounded-[28px]">
                <Smartphone className="mx-auto h-12 w-12 text-ink-300" />
                <h3 className="mt-4 font-display text-lg font-bold text-ink-900">No refurbished phones match criteria</h3>
                <p className="mt-1 text-xs text-ink-500">Try adjusting your brand, grade, or price filters.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBrand('All');
                    setGradeFilter('All');
                    setPricePreset(0);
                    setSearch('');
                  }}
                  className="mt-4 btn-primary text-xs"
                >
                  Clear Filters
                </button>
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
                              className={`absolute top-3 left-3 badge text-[10px] font-extrabold ${
                                isSuperb ? 'bg-emerald-600 text-white' : 'bg-weather-600 text-white'
                              }`}
                            >
                              {isSuperb ? 'Superb (Like New)' : 'Good Value'}
                            </span>
                            {product.discount_percent && (
                              <span className="absolute top-3 right-3 badge bg-accent-500 text-white text-[10px] font-extrabold">
                                {product.discount_percent}% OFF
                              </span>
                            )}
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
