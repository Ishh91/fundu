import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  ShoppingCart,
  Zap,
  Check,
  MapPin,
  ChevronRight,
  Smartphone,
  Cpu,
  Battery,
  Camera,
  Layers,
  Sparkles,
  CreditCard,
  RefreshCw,
  Star,
  Building2,
  AlertCircle,
  Award,
} from 'lucide-react';
import { db, formatINR } from '../lib/db';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import type { Product } from '../types';

// Lucknow PIN code to Area mapping dictionary
const LUCKNOW_PINCODE_MAP: Record<string, string> = {
  '226001': 'Hazratganj, Lucknow',
  '226002': 'Alambagh, Lucknow',
  '226003': 'Chowk / Old Lucknow',
  '226004': 'Charbagh Station Area, Lucknow',
  '226005': 'Rajajipuram, Lucknow',
  '226006': 'Aashiana / Transport Nagar, Lucknow',
  '226010': 'Gomti Nagar, Lucknow',
  '226012': 'Kanpur Road / Amausi, Lucknow',
  '226016': 'Indira Nagar, Lucknow',
  '226017': 'Jankipuram, Lucknow',
  '226020': 'Mahanagar, Lucknow',
  '226022': 'Nishatganj / IT Crossing, Lucknow',
  '226024': 'Vikas Nagar, Lucknow',
  '226028': 'Chinhat / Faizabad Road, Lucknow',
  '226030': 'Gomti Nagar Extension, Lucknow',
};

const CONDITION_GRADES = [
  {
    id: 'Fair',
    label: 'Fair (Value)',
    badge: 'Save Extra ₹4,000',
    color: 'bg-amber-500 text-white',
    desc: 'Light body scratches/dents, 100% functional screen & hardware. Best for max savings.',
    priceMultiplier: 0.88,
  },
  {
    id: 'Good',
    label: 'Good (Popular)',
    badge: 'Most Popular',
    color: 'bg-brand-600 text-white',
    desc: 'Minor hairline scratches, screen & body in great shape. Passed 32-point inspection.',
    priceMultiplier: 0.95,
  },
  {
    id: 'Superb',
    label: 'Superb (Like New)',
    badge: 'Flawless Grade A',
    color: 'bg-emerald-600 text-white',
    desc: 'Zero visible scratches, looks and works brand new. Battery health guaranteed >90%.',
    priceMultiplier: 1.0,
  },
];

const SAMPLE_PRODUCTS: Record<string, Product> = {
  'sample-1': {
    id: 'sample-1',
    title: 'Apple iPhone 13 (128 GB) - Starlight',
    brand: 'Apple',
    model: 'iPhone 13',
    ram: '4 GB',
    storage: '128 GB',
    color: 'Starlight',
    condition: 'Superb',
    price: 38999,
    original_price: 59900,
    discount_percent: 35,
    warranty_months: 6,
    description: 'Refurbished Superb condition Apple iPhone 13. Passed 32-point inspection, battery health guaranteed above 88%. Comes with USB-C cable and 6-month Fundu warranty in Lucknow.',
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80',
    ],
    is_approved: true,
    is_featured: true,
    stock: 5,
    sold_count: 42,
    seller_id: null,
    created_at: new Date().toISOString(),
  },
  'sample-2': {
    id: 'sample-2',
    title: 'Apple iPhone 14 (128 GB) - Midnight',
    brand: 'Apple',
    model: 'iPhone 14',
    ram: '6 GB',
    storage: '128 GB',
    color: 'Midnight',
    condition: 'Superb',
    price: 47499,
    original_price: 69900,
    discount_percent: 32,
    warranty_months: 6,
    description: 'Flawless condition Apple iPhone 14 with A15 Bionic chip, verified screen & camera. Includes charging cable and Fundu 6-month warranty card.',
    images: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?w=800&auto=format&fit=crop&q=80',
    ],
    is_approved: true,
    is_featured: true,
    stock: 4,
    sold_count: 29,
    seller_id: null,
    created_at: new Date().toISOString(),
  },
  'sample-3': {
    id: 'sample-3',
    title: 'Samsung Galaxy S23 5G (256 GB) - Phantom Black',
    brand: 'Samsung',
    model: 'Galaxy S23',
    ram: '8 GB',
    storage: '256 GB',
    color: 'Phantom Black',
    condition: 'Superb',
    price: 42999,
    original_price: 74999,
    discount_percent: 42,
    warranty_months: 6,
    description: 'Flagship Snapdragon performance. Thoroughly sanitized and tested. Free express delivery across Gomti Nagar, Hazratganj, and all Lucknow areas.',
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=800&auto=format&fit=crop&q=80',
    ],
    is_approved: true,
    is_featured: true,
    stock: 3,
    sold_count: 18,
    seller_id: null,
    created_at: new Date().toISOString(),
  },
};

const INSPECTION_POINTS = [
  'Display & Touch Response Verified',
  'Battery Capacity & Charging Health >88%',
  'Front & Rear Cameras Lens Clarity',
  'Speakers, Microphones & Earpiece',
  'Wi-Fi, Bluetooth & Cellular Signal',
  'Buttons, Switches & Haptic Motor',
  'Charging Port & Power Transfer Functional',
  'Biometric Face ID / Fingerprint Working',
];

const REVIEWS = [
  { name: 'Abhinav Sharma', location: 'Gomti Nagar, Lucknow', rating: 5, text: 'Purchased iPhone 13 in Superb condition. Literally looks brand new with 94% battery health! Got doorstep delivery within 4 hours.' },
  { name: 'Priya Verma', location: 'Hazratganj, Lucknow', rating: 5, text: 'Clean packaging, original box, and 6 months warranty card included. Saved almost ₹20k compared to new!' },
  { name: 'Mohd. Tariq', location: 'Indira Nagar, Lucknow', rating: 5, text: 'Pincode check exact location show kiya. COD service was smooth, technician showed phone working before payment.' },
];

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { setCartItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // Variant States
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<string>('Superb');
  const [selectedStorage, setSelectedStorage] = useState<string>('128 GB');
  const [selectedColor, setSelectedColor] = useState<string>('');

  // Pincode & Location Auto-lookup State
  const [pincode, setPincode] = useState<string>('226010');
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [locationName, setLocationName] = useState<string>('Gomti Nagar, Lucknow');
  const [pincodeError, setPincodeError] = useState<string | null>(null);

  // Accordion & Modal States
  const [showEmiModal, setShowEmiModal] = useState(false);
  const [showExchangeModal, setShowExchangeModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    if (SAMPLE_PRODUCTS[id]) {
      const p = SAMPLE_PRODUCTS[id];
      setProduct(p);
      setSelectedImage(p.images[0] || '');
      setSelectedStorage(p.storage || '128 GB');
      setSelectedColor(p.color || 'Default');
      setSelectedGrade(p.condition || 'Superb');
      setLoading(false);
      return;
    }

    db.from('products')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          const p = data as Product;
          setProduct(p);
          setSelectedImage(p.images[0] || '');
          setSelectedStorage(p.storage || '128 GB');
          setSelectedColor(p.color || 'Default');
          setSelectedGrade(p.condition || 'Superb');
        } else {
          // Fallback sample product
          const fallback = SAMPLE_PRODUCTS['sample-1'];
          setProduct(fallback);
          setSelectedImage(fallback.images[0] || '');
          setSelectedStorage(fallback.storage || '128 GB');
          setSelectedColor(fallback.color || 'Starlight');
        }
        setLoading(false);
      });
  }, [id]);

  // Handle PIN Code Auto Location Lookup
  const handleCheckPincode = async (codeToTest?: string) => {
    const targetPin = (codeToTest || pincode).trim();
    if (!/^\d{6}$/.test(targetPin)) {
      setPincodeError('Please enter a valid 6-digit PIN code.');
      return;
    }

    setPincodeLoading(true);
    setPincodeError(null);

    // 1. Check local Lucknow database first
    if (LUCKNOW_PINCODE_MAP[targetPin]) {
      setLocationName(LUCKNOW_PINCODE_MAP[targetPin]);
      setPincodeLoading(false);
      return;
    }

    // 2. Fetch from free Indian Postal API
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${targetPin}`);
      const data = await res.json();

      if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice?.[0]) {
        const po = data[0].PostOffice[0];
        const derivedLoc = `${po.Name}, ${po.District}, ${po.State}`;
        setLocationName(derivedLoc);
      } else {
        setLocationName(`Area (PIN ${targetPin}), India`);
      }
    } catch {
      setLocationName(`Area (PIN ${targetPin}), India`);
    } finally {
      setPincodeLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f7f8] py-16">
        <div className="container-page max-w-4xl mx-auto">
          <div className="card p-12 text-center animate-pulse rounded-[32px] bg-white">
            <Smartphone className="mx-auto h-12 w-12 text-ink-300 animate-bounce" />
            <p className="mt-4 text-sm font-bold text-ink-500">Loading Cashify Refurbished Device Details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  // Calculate dynamic pricing based on Grade & Storage selection
  const gradeObj = CONDITION_GRADES.find((g) => g.id === selectedGrade) || CONDITION_GRADES[2];
  const storageMultiplier = selectedStorage === '256 GB' ? 1.12 : selectedStorage === '512 GB' ? 1.25 : selectedStorage === '64 GB' ? 0.92 : 1.0;
  
  const currentPrice = Math.round(product.price * gradeObj.priceMultiplier * storageMultiplier);
  const currentMrp = product.original_price ? Math.round(product.original_price * storageMultiplier) : Math.round(currentPrice * 1.5);
  const currentSavings = Math.max(0, currentMrp - currentPrice);
  const currentDiscountPercent = Math.round((currentSavings / currentMrp) * 100);
  const emiAmount = Math.round(currentPrice / 24);

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80'];

  const handleAddToCart = () => {
    if (profile && profile.role !== 'customer') {
      alert(`Access Restricted: You are logged in as ${profile.role.toUpperCase()}. Vendor, Delivery, and Admin accounts cannot place orders.`);
      return;
    }
    const updatedProduct = { ...product, price: currentPrice, storage: selectedStorage, condition: selectedGrade };
    setCartItem({ type: 'product', item: updatedProduct, quantity: 1 });
  };

  const handleBuyNow = () => {
    if (profile && profile.role !== 'customer') {
      alert(`Access Restricted: You are logged in as ${profile.role.toUpperCase()}. Vendor, Delivery, and Admin accounts cannot place orders.`);
      return;
    }
    const updatedProduct = { ...product, price: currentPrice, storage: selectedStorage, condition: selectedGrade };
    setCartItem({ type: 'product', item: updatedProduct, quantity: 1 });
    if (user) {
      navigate('/checkout');
    } else {
      navigate('/login?redirect=/checkout');
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f8] pb-32">
      {/* Top Breadcrumb Navigation */}
      <section className="bg-white border-b border-[#e5ecef] py-3.5 shadow-xs">
        <div className="container-page">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-ink-500">
            <div className="flex items-center gap-2">
              <Link to="/" className="hover:text-brand-600 transition">Home</Link>
              <ChevronRight className="h-3.5 w-3.5 text-ink-300" />
              <Link to="/buy" className="hover:text-brand-600 transition">Buy Refurbished Mobiles</Link>
              <ChevronRight className="h-3.5 w-3.5 text-ink-300" />
              <span className="text-ink-900 font-bold truncate max-w-xs">{product.brand} {product.model}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              <Building2 className="h-3 w-3 text-emerald-600" /> Lucknow Certified Warehouse Stock
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container-page mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Gallery & Inspection Badges (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Main Image Display Box */}
            <div className="card p-6 md:p-8 rounded-[32px] bg-white border border-ink-100 relative overflow-hidden flex flex-col justify-center items-center group shadow-soft">
              <span className={`absolute top-4 left-4 z-10 pointer-events-none badge text-xs font-extrabold px-3 py-1 rounded-full ${gradeObj.color}`}>
                Grade: {selectedGrade}
              </span>

              {currentDiscountPercent > 0 && (
                <span className="absolute top-4 right-4 z-10 pointer-events-none badge bg-accent-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-xs">
                  {currentDiscountPercent}% OFF
                </span>
              )}

              <img
                src={selectedImage || images[0]}
                alt={product.title}
                className="h-80 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />

              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-ink-500 bg-ink-50 px-3 py-1 rounded-full">
                <Sparkles className="h-3.5 w-3.5 text-brand-600" /> 32-Point Cashify Quality Certified
              </div>
            </div>

            {/* Gallery Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
                {images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`rounded-2xl border-2 p-2 bg-white transition cursor-pointer shrink-0 ${
                      (selectedImage || images[0]) === imgUrl
                        ? 'border-brand-600 ring-2 ring-brand-500/20 scale-105'
                        : 'border-ink-200 hover:border-brand-300'
                    }`}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${idx}`} className="h-16 w-16 object-contain rounded-lg" />
                  </button>
                ))}
              </div>
            )}

            {/* Certified Quality Highlights Box */}
            <div className="card p-6 rounded-[28px] bg-gradient-to-br from-white to-[#f0f9f8] border border-emerald-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-ink-900 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" /> 32-Point Quality Inspected
                </h4>
                <span className="badge bg-emerald-100 text-emerald-800 text-[10px] font-bold">Passed</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs text-ink-700 font-bold pt-1">
                <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Original Display</span>
                <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Battery Health &gt; 88%</span>
                <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> 100% Data Wiped</span>
                <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Hardware Verified</span>
              </div>
            </div>

            {/* Exchange Old Phone Banner */}
            <div className="card p-5 rounded-[28px] bg-gradient-to-r from-emerald-900 to-teal-900 text-white shadow-md flex items-center justify-between gap-4">
              <div>
                <span className="badge bg-emerald-400/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider">Exchange Offer</span>
                <h4 className="mt-1 font-display font-extrabold text-sm text-white">Trade in your old phone</h4>
                <p className="text-[11px] text-emerald-100/80">Get up to ₹18,500 instant trade-in discount</p>
              </div>
              <button
                type="button"
                onClick={() => setShowExchangeModal(true)}
                className="btn bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-bold px-3 py-2 shrink-0 rounded-xl"
              >
                Check Value
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Device Options, Pricing, Location Checker & Buy CTA (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="card p-6 md:p-8 rounded-[32px] bg-white border border-ink-100 space-y-6 shadow-soft">
              
              {/* Header Info */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="badge bg-brand-50 text-brand-700 font-black">{product.brand}</span>
                  <span className="text-xs text-ink-400 font-semibold">Verified Refurbished</span>
                  <div className="ml-auto flex items-center gap-1 text-amber-500 font-bold text-xs">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> 4.8 (142 reviews)
                  </div>
                </div>
                <h1 className="mt-2 font-display text-2xl md:text-3xl font-black text-ink-900 leading-snug">
                  {product.brand} {product.model} ({selectedStorage}) - {selectedColor || product.color}
                </h1>
                <p className="mt-1 text-xs text-ink-500">
                  Certified Refurbished · Lucknow Hub Stock · Free 6M Warranty Included
                </p>
              </div>

              {/* CASHIFY-STYLE PRICE & NO-COST EMI BLOCK */}
              <div className="rounded-3xl bg-gradient-to-br from-[#f8fafb] to-[#f1f5f7] p-6 border border-ink-100 space-y-4">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-ink-400">Offer Price</span>
                    <div className="flex items-baseline gap-3 mt-0.5">
                      <span className="font-display text-3xl sm:text-4xl font-black text-ink-900">
                        {formatINR(currentPrice)}
                      </span>
                      {currentMrp > currentPrice && (
                        <span className="text-base text-ink-400 line-through font-semibold">
                          {formatINR(currentMrp)}
                        </span>
                      )}
                    </div>
                  </div>

                  {currentSavings > 0 && (
                    <div className="rounded-2xl bg-emerald-500 text-white px-4 py-2 text-right shadow-xs">
                      <p className="text-[10px] uppercase font-black tracking-wider text-emerald-100">Total Instant Savings</p>
                      <p className="text-lg font-black">{formatINR(currentSavings)} OFF</p>
                    </div>
                  )}
                </div>

                {/* EMI Offer Breakdown Pill */}
                <div className="pt-3 border-t border-ink-200/60 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 font-bold text-ink-700">
                    <CreditCard className="h-4 w-4 text-brand-600" />
                    <span>No-Cost EMI starting at <strong className="text-brand-600 font-extrabold">{formatINR(emiAmount)}/month</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEmiModal(!showEmiModal)}
                    className="text-brand-600 font-bold hover:underline shrink-0 text-xs"
                  >
                    {showEmiModal ? 'Hide Plans' : 'View EMI Plans'}
                  </button>
                </div>

                {showEmiModal && (
                  <div className="p-4 rounded-2xl bg-white border border-brand-200 text-xs space-y-2 animate-fade-in">
                    <p className="font-bold text-ink-900">Calculated No-Cost EMI Options:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-semibold text-ink-700">
                      <div className="p-2 rounded-xl bg-ink-50">3 Months: {formatINR(Math.round(currentPrice / 3))}/mo</div>
                      <div className="p-2 rounded-xl bg-ink-50">6 Months: {formatINR(Math.round(currentPrice / 6))}/mo</div>
                      <div className="p-2 rounded-xl bg-ink-50">12 Months: {formatINR(Math.round(currentPrice / 12))}/mo</div>
                    </div>
                  </div>
                )}
              </div>

              {/* CONDITION GRADE SELECTOR CARDS */}
              <div className="space-y-3">
                <label className="label text-xs font-extrabold text-ink-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-brand-600" /> Select Refurbished Grade / Condition
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {CONDITION_GRADES.map((g) => {
                    const isSelected = selectedGrade === g.id;
                    const gradePrice = Math.round(product.price * g.priceMultiplier * storageMultiplier);

                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setSelectedGrade(g.id)}
                        className={`p-4 rounded-2xl border-2 text-left transition relative flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? 'border-brand-600 bg-brand-50/70 shadow-md ring-2 ring-brand-500/20'
                            : 'border-ink-200 bg-white hover:border-brand-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-ink-900">{g.label}</span>
                            {isSelected && <CheckCircle2 className="h-4 w-4 text-brand-600" />}
                          </div>
                          <p className="text-[11px] text-ink-500 leading-tight mb-2">{g.desc}</p>
                        </div>
                        <div>
                          <span className="font-display font-black text-sm text-ink-900">{formatINR(gradePrice)}</span>
                          <span className="ml-1 text-[10px] text-emerald-700 font-bold block">{g.badge}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STORAGE CAPACITY SELECTOR */}
              <div className="space-y-2">
                <label className="label text-xs font-bold text-ink-900">Storage Capacity</label>
                <div className="flex flex-wrap gap-2.5">
                  {['64 GB', '128 GB', '256 GB', '512 GB'].map((stg) => (
                    <button
                      key={stg}
                      type="button"
                      onClick={() => setSelectedStorage(stg)}
                      className={`rounded-2xl px-5 py-2.5 text-xs font-extrabold transition cursor-pointer ${
                        selectedStorage === stg
                          ? 'bg-brand-600 text-white shadow-md ring-2 ring-brand-500/20'
                          : 'border border-ink-200 bg-white text-ink-800 hover:border-brand-300'
                      }`}
                    >
                      {stg}
                    </button>
                  ))}
                </div>
              </div>

              {/* COLOR SELECTION */}
              <div className="space-y-2">
                <label className="label text-xs font-bold text-ink-900">Device Color</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedColor(product.color || 'Default')}
                    className="rounded-2xl px-4 py-2 text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200 flex items-center gap-2"
                  >
                    <span className="h-3 w-3 rounded-full bg-brand-600 inline-block" />
                    {selectedColor || product.color || 'Default Color'}
                  </button>
                </div>
              </div>

              {/* PINCODE & LOCATION AUTO-LOOKUP BOX */}
              <div className="rounded-3xl border border-ink-200 p-5 space-y-3 bg-[#fbfdfd] shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-ink-900 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-emerald-600" /> Enter PIN Code for Delivery Date & Location
                  </label>
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    Express Dispatch
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setPincode(val);
                      if (val.length === 6) handleCheckPincode(val);
                    }}
                    placeholder="Enter 6-digit PIN code"
                    className="input py-2.5 px-4 text-sm font-mono font-bold w-44 text-center border-ink-200 focus:border-brand-500 rounded-xl"
                  />
                  <button
                    type="button"
                    disabled={pincodeLoading}
                    onClick={() => handleCheckPincode()}
                    className="btn-primary py-2.5 px-5 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    {pincodeLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : 'Check Location'}
                  </button>
                </div>

                {pincodeError && (
                  <p className="text-xs text-accent-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" /> {pincodeError}
                  </p>
                )}

                {locationName && !pincodeError && (
                  <div className="rounded-2xl bg-emerald-50/90 border border-emerald-200 p-3.5 space-y-1 text-xs text-emerald-900 font-semibold">
                    <p className="font-bold text-emerald-950 flex items-center gap-1.5 text-sm">
                      <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                      Location: <span className="underline font-black">{locationName}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-emerald-800">
                      <Truck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      Estimated Delivery: <strong className="font-black text-emerald-950">Tomorrow by 5:00 PM</strong> (Free Delivery)
                    </p>
                    <p className="flex items-center gap-1.5 text-emerald-800">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      Cash on Delivery (COD) & Pay on Doorstep Available
                    </p>
                  </div>
                )}
              </div>

              {/* TRUST GUARANTEES PILLS */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3.5 rounded-2xl border border-ink-100 bg-[#f8fafb]">
                  <ShieldCheck className="mx-auto h-6 w-6 text-emerald-600" />
                  <p className="mt-1 text-xs font-bold text-ink-900">6 Months Warranty</p>
                  <p className="text-[10px] text-ink-400">Free Replacement</p>
                </div>
                <div className="p-3.5 rounded-2xl border border-ink-100 bg-[#f8fafb]">
                  <RotateCcw className="mx-auto h-6 w-6 text-emerald-600" />
                  <p className="mt-1 text-xs font-bold text-ink-900">7 Days Money Back</p>
                  <p className="text-[10px] text-ink-400">No Questions Asked</p>
                </div>
                <div className="p-3.5 rounded-2xl border border-ink-100 bg-[#f8fafb]">
                  <Award className="mx-auto h-6 w-6 text-emerald-600" />
                  <p className="mt-1 text-xs font-bold text-ink-900">32-Point Verified</p>
                  <p className="text-[10px] text-ink-400">Quality Assured</p>
                </div>
              </div>

              {/* MAIN ACTION CTA BUTTONS */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="btn-outline py-3.5 text-sm font-extrabold flex items-center justify-center gap-2 rounded-2xl cursor-pointer"
                >
                  <ShoppingCart className="h-4 w-4" /> Add to Cart
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="btn-primary py-3.5 text-sm font-extrabold flex items-center justify-center gap-2 rounded-2xl shadow-md cursor-pointer"
                >
                  <Zap className="h-4 w-4" /> Buy Now
                </button>
              </div>
            </div>

            {/* TECHNICAL SPECIFICATIONS ACCORDION / GRID */}
            <div className="card p-6 md:p-8 rounded-[32px] bg-white border border-ink-100 space-y-4 shadow-soft">
              <h3 className="font-display text-lg font-black text-ink-900 flex items-center gap-2">
                <Layers className="h-5 w-5 text-brand-600" /> Device Technical Specifications
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-2xl border border-ink-100 bg-[#f8fafb] flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-brand-600 shrink-0" />
                  <div>
                    <p className="font-bold text-ink-900">Brand & Model</p>
                    <p className="text-ink-500">{product.brand} {product.model}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-ink-100 bg-[#f8fafb] flex items-center gap-3">
                  <Cpu className="h-5 w-5 text-brand-600 shrink-0" />
                  <div>
                    <p className="font-bold text-ink-900">Processor & RAM</p>
                    <p className="text-ink-500">{product.ram || '6 GB'} RAM · High Speed Chipset</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-ink-100 bg-[#f8fafb] flex items-center gap-3">
                  <Battery className="h-5 w-5 text-brand-600 shrink-0" />
                  <div>
                    <p className="font-bold text-ink-900">Battery & Health</p>
                    <p className="text-ink-500">Capacity &gt;88% · Fast Charging Supported</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-ink-100 bg-[#f8fafb] flex items-center gap-3">
                  <Camera className="h-5 w-5 text-brand-600 shrink-0" />
                  <div>
                    <p className="font-bold text-ink-900">Cameras & Display</p>
                    <p className="text-ink-500">HD Multi-Camera · Original Retina/AMOLED</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 32-POINT CHECKLIST FULL GRID */}
            <div className="card p-6 md:p-8 rounded-[32px] bg-white border border-ink-100 space-y-4 shadow-soft">
              <h3 className="font-display text-lg font-black text-ink-900 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" /> Full 32-Point Quality Checklist
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-ink-700">
                {INSPECTION_POINTS.map((pt, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* REVIEWS */}
            <div className="card p-6 md:p-8 rounded-[32px] bg-white border border-ink-100 space-y-6 shadow-soft">
              <h3 className="font-display text-lg font-black text-ink-900 flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500 fill-amber-400" /> Verified Customer Reviews
              </h3>

              <div className="space-y-4">
                {REVIEWS.map((r, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#f8fafb] border border-ink-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-xs text-ink-900">{r.name}</p>
                      <span className="text-[10px] text-ink-400 font-semibold">{r.location}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400 text-xs">
                      {'★'.repeat(r.rating)}
                    </div>
                    <p className="text-xs text-ink-600 leading-relaxed pt-1">{r.text}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* STICKY FLOATING BUY BAR (BOTTOM) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-ink-200 shadow-2xl py-3 px-4 transition-all">
        <div className="container-page flex items-center justify-between gap-4 max-w-5xl mx-auto">
          <div className="flex items-center gap-3 shrink-0">
            <img src={images[0]} alt={product.title} className="h-10 w-10 object-contain rounded-lg hidden sm:block" />
            <div>
              <p className="font-bold text-xs text-ink-900 truncate max-w-[160px] sm:max-w-xs">{product.brand} {product.model}</p>
              <p className="text-[10px] text-ink-500">{selectedGrade} Grade · {selectedStorage}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <span className="font-display font-black text-lg text-ink-900">{formatINR(currentPrice)}</span>
              {currentSavings > 0 && <span className="text-[10px] text-emerald-600 font-bold block">Save {formatINR(currentSavings)}</span>}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="btn-outline py-2.5 px-4 text-xs font-extrabold rounded-xl cursor-pointer"
              >
                Add to Cart
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className="btn-primary py-2.5 px-5 text-xs font-extrabold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Zap className="h-3.5 w-3.5" /> Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* EXCHANGE MODAL */}
      {showExchangeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fade-in">
            <h3 className="font-display font-bold text-lg text-ink-900">Exchange Old Mobile Phone</h3>
            <p className="text-xs text-ink-500">Enter your current old phone model to calculate instant exchange discount value:</p>
            <input
              type="text"
              placeholder="e.g. iPhone 11, Redmi Note 10..."
              className="input text-sm"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowExchangeModal(false)} className="btn-outline text-xs cursor-pointer">Cancel</button>
              <button onClick={() => { alert('Estimated trade-in value: ₹12,500 applied!'); setShowExchangeModal(false); }} className="btn-primary text-xs cursor-pointer">Calculate Discount</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
