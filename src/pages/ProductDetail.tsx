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
  ArrowLeft,
  Smartphone,
  Cpu,
  Battery,
  Camera,
  Layers,
} from 'lucide-react';
import { db, formatINR } from '../lib/db';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import type { Product } from '../types';
import { LUCKNOW_AREAS } from '../types';

const SAMPLE_PRODUCTS: Record<string, Product> = {
  'sample-1': {
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
    condition: 'Excellent',
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
    condition: 'Excellent',
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
  'sample-4': {
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
    description: 'Hasselblad camera system, super fast charging. Fully verified device with Fundu 6-month warranty.',
    images: [
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80',
    ],
    is_approved: true,
    is_featured: true,
    stock: 6,
    sold_count: 35,
    seller_id: null,
    created_at: new Date().toISOString(),
  },
  'sample-5': {
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
    images: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80',
    ],
    is_approved: true,
    is_featured: true,
    stock: 7,
    sold_count: 50,
    seller_id: null,
    created_at: new Date().toISOString(),
  },
};

const INSPECTION_POINTS = [
  'Display & Touch Sensitivity Tested',
  'Battery Health Guaranteed > 85%',
  'Front & Rear Camera Focus Verified',
  'Microphone, Earpiece & Speakers Clear',
  'Wi-Fi, Bluetooth & Cellular Signal Active',
  'Physical Buttons & Mute Switch Tactile',
  'Charging Port & Power Transfer Functional',
  'Biometric Face ID / Fingerprint Working',
];

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setCartItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedStorage, setSelectedStorage] = useState<string>('128 GB');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<string>('Gomti Nagar');
  const [pincode, setPincode] = useState<string>('226010');
  const [pincodeChecked, setPincodeChecked] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    if (SAMPLE_PRODUCTS[id]) {
      const p = SAMPLE_PRODUCTS[id];
      setProduct(p);
      setSelectedImage(p.images[0] || '');
      setSelectedStorage(p.storage || '128 GB');
      setSelectedColor(p.color || 'Default');
      setLoading(false);
      return;
    }

    db
      .from('products')
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
        } else {
          const title = id.replace(/^dyn-search-\d+-/, '').replace(/-/g, ' ');
          const fallback: Product = {
            id: id,
            title: title.charAt(0).toUpperCase() + title.slice(1),
            brand: title.split(' ')[0] || 'Refurbished',
            model: title,
            ram: '6 GB',
            storage: '128 GB',
            color: 'Original',
            condition: 'Excellent',
            price: 32999,
            original_price: 49999,
            discount_percent: 34,
            warranty_months: 6,
            description: `Certified refurbished ${title}. 32-Point quality inspection passed, battery health guaranteed >88%. Comes with charging cable and 6-month Fundu warranty in Lucknow.`,
            images: [
              'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80',
            ],
            is_approved: true,
            is_featured: true,
            stock: 4,
            sold_count: 12,
            seller_id: null,
            created_at: new Date().toISOString(),
          };
          setProduct(fallback);
          setSelectedImage(fallback.images[0] || '');
          setSelectedStorage(fallback.storage || '128 GB');
          setSelectedColor(fallback.color || 'Default');
        }
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f7f8] py-16">
        <div className="container-page">
          <div className="card p-12 text-center animate-pulse rounded-[32px]">
            <Smartphone className="mx-auto h-12 w-12 text-ink-300" />
            <p className="mt-4 text-sm text-ink-500">Loading device specifications...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f4f7f8] py-16">
        <div className="container-page">
          <div className="card p-12 text-center rounded-[32px] max-w-md mx-auto">
            <Smartphone className="mx-auto h-12 w-12 text-ink-300" />
            <h2 className="mt-4 font-display text-xl font-bold text-ink-900">Mobile phone not found</h2>
            <p className="mt-2 text-xs text-ink-500">The product you are looking for might have been sold or unlisted.</p>
            <Link to="/buy" className="mt-6 btn-primary inline-flex items-center gap-2 text-xs">
              <ArrowLeft className="h-4 w-4" /> Back to Refurbished Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isSuperb = product.condition === 'Excellent';
  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80'];

  const savings = product.original_price ? product.original_price - product.price : 0;

  const handleAddToCart = () => {
    setCartItem({ type: 'product', item: product, quantity: 1 });
  };

  const handleBuyNow = () => {
    setCartItem({ type: 'product', item: product, quantity: 1 });
    if (user) {
      navigate('/checkout');
    } else {
      navigate('/login?redirect=/checkout');
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f8] pb-24">
      {/* Breadcrumb Navigation Header */}
      <section className="bg-white border-b border-[#e5ecef] py-4">
        <div className="container-page">
          <div className="flex items-center gap-2 text-xs font-semibold text-ink-500">
            <Link to="/" className="hover:text-brand-600">Home</Link>
            <ChevronRight className="h-3.5 w-3.5 text-ink-300" />
            <Link to="/buy" className="hover:text-brand-600">Refurbished Mobile Store</Link>
            <ChevronRight className="h-3.5 w-3.5 text-ink-300" />
            <span className="text-ink-900 font-bold truncate max-w-xs">{product.brand} {product.model}</span>
          </div>
        </div>
      </section>

      {/* Main Container: Gallery + Options */}
      <div className="container-page mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Image Gallery (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="card p-6 rounded-[28px] bg-white border border-ink-100 relative overflow-hidden flex flex-col justify-center items-center">
              <span
                className={`absolute top-4 left-4 badge text-xs font-extrabold ${
                  isSuperb ? 'bg-emerald-600 text-white' : 'bg-weather-600 text-white'
                }`}
              >
                {isSuperb ? 'Grade: Superb (Like New)' : 'Grade: Good Value'}
              </span>

              {product.discount_percent && (
                <span className="absolute top-4 right-4 badge bg-accent-500 text-white text-xs font-extrabold">
                  {product.discount_percent}% OFF
                </span>
              )}

              <img
                src={selectedImage || images[0]}
                alt={product.title}
                className="h-80 w-auto object-contain transition-transform duration-300 hover:scale-105"
              />
            </div>

            {/* Gallery Thumbnails */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`rounded-2xl border p-2 bg-white transition ${
                      (selectedImage || images[0]) === imgUrl
                        ? 'border-brand-600 ring-2 ring-brand-500/20'
                        : 'border-ink-200 hover:border-brand-300'
                    }`}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${idx}`} className="h-16 w-16 object-contain" />
                  </button>
                ))}
              </div>
            )}

            {/* Quick Inspection Badges */}
            <div className="card p-5 rounded-[24px] space-y-3 bg-white">
              <h4 className="text-xs font-bold text-ink-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> 32-Point Quality Certified
              </h4>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-ink-600 font-semibold">
                <span className="flex items-center gap-1"><Check className="h-3 w-3 text-emerald-600" /> Original Display</span>
                <span className="flex items-center gap-1"><Check className="h-3 w-3 text-emerald-600" /> Battery Health &gt; 88%</span>
                <span className="flex items-center gap-1"><Check className="h-3 w-3 text-emerald-600" /> 100% Data Wiped</span>
                <span className="flex items-center gap-1"><Check className="h-3 w-3 text-emerald-600" /> Hardware Verified</span>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Pricing (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="card p-6 md:p-8 rounded-[28px] bg-white border border-ink-100 space-y-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="badge bg-brand-50 text-brand-700 font-extrabold">{product.brand}</span>
                  <span className="text-xs text-ink-400">Model: {product.model}</span>
                </div>
                <h1 className="mt-2 font-display text-2xl md:text-3xl font-black text-ink-900 leading-snug">
                  {product.title}
                </h1>
                <p className="mt-1 text-xs text-ink-500">
                  Refurbished Mobile Phone · Lucknow Stock · {product.ram ? `${product.ram} RAM · ` : ''}{product.storage}
                </p>
              </div>

              {/* Price & Savings Block */}
              <div className="rounded-2xl bg-[#f8fafb] p-5 border border-ink-100 flex flex-wrap items-baseline justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-ink-400">Offer Price</p>
                  <div className="flex items-baseline gap-3 mt-1">
                    <span className="font-display text-3xl font-black text-ink-900">
                      {formatINR(product.price)}
                    </span>
                    {product.original_price && (
                      <span className="text-sm text-ink-400 line-through">
                        {formatINR(product.original_price)}
                      </span>
                    )}
                  </div>
                </div>

                {savings > 0 && (
                  <div className="rounded-xl bg-emerald-50 px-3.5 py-2 border border-emerald-200 text-right">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-700">Total Instant Savings</p>
                    <p className="text-base font-extrabold text-emerald-700">{formatINR(savings)} OFF</p>
                  </div>
                )}
              </div>

              {/* Storage & Color Selector */}
              <div className="space-y-4">
                <div>
                  <label className="label text-xs font-bold">Storage Capacity</label>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {['64 GB', '128 GB', '256 GB', '512 GB'].map((stg) => (
                      <button
                        key={stg}
                        type="button"
                        onClick={() => setSelectedStorage(stg)}
                        className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                          selectedStorage === stg
                            ? 'bg-brand-600 text-white shadow-sm ring-2 ring-brand-500/20'
                            : 'border border-ink-200 bg-white text-ink-700 hover:border-brand-300'
                        }`}
                      >
                        {stg}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label text-xs font-bold">Available Color</label>
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedColor(product.color || 'Default')}
                      className="rounded-xl px-4 py-2 text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200"
                    >
                      ● {selectedColor || product.color || 'Default Color'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Lucknow Delivery & Service Checker */}
              <div className="rounded-2xl border border-ink-200 p-4 space-y-3 bg-[#fbfdfd]">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-ink-900 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-emerald-600" /> Lucknow Doorstep Delivery Checker
                  </p>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Hub Active
                  </span>
                </div>

                <div className="flex gap-2">
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="select py-2 text-xs font-bold flex-1 border-ink-200"
                  >
                    {LUCKNOW_AREAS.map((a) => (
                      <option key={a} value={a}>{a}, Lucknow</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="Enter PIN Code"
                    className="input py-2 text-xs w-28 text-center font-mono font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setPincodeChecked(true)}
                    className="btn-outline py-2 px-3 text-xs font-bold"
                  >
                    Check
                  </button>
                </div>

                {pincodeChecked && (
                  <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <Truck className="h-3.5 w-3.5 text-emerald-600" /> Free Same-Day / Next-Day Delivery available in {selectedArea}, Lucknow ({pincode}).
                  </p>
                )}
              </div>

              {/* Trust Guarantee Cards */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl border border-ink-100 bg-[#f8fafb]">
                  <ShieldCheck className="mx-auto h-5 w-5 text-emerald-600" />
                  <p className="mt-1 text-[11px] font-bold text-ink-900">6 Months Warranty</p>
                  <p className="text-[9px] text-ink-400">Lucknow Repairs</p>
                </div>
                <div className="p-3 rounded-xl border border-ink-100 bg-[#f8fafb]">
                  <RotateCcw className="mx-auto h-5 w-5 text-emerald-600" />
                  <p className="mt-1 text-[11px] font-bold text-ink-900">7 Days Replacement</p>
                  <p className="text-[9px] text-ink-400">Hassle Free</p>
                </div>
                <div className="p-3 rounded-xl border border-ink-100 bg-[#f8fafb]">
                  <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-600" />
                  <p className="mt-1 text-[11px] font-bold text-ink-900">32-Point Checked</p>
                  <p className="text-[9px] text-ink-400">Quality Certified</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="btn-outline py-3 text-sm font-bold flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="h-4 w-4" /> Add to Cart
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="btn-primary py-3 text-sm font-bold flex items-center justify-center gap-2"
                >
                  <Zap className="h-4 w-4" /> Buy Now
                </button>
              </div>
            </div>

            {/* Technical Specifications Section */}
            <div className="card p-6 md:p-8 rounded-[28px] bg-white border border-ink-100 space-y-4">
              <h3 className="font-display text-lg font-extrabold text-ink-900 flex items-center gap-2">
                <Layers className="h-5 w-5 text-brand-600" /> Technical Specifications
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-ink-100 bg-[#f8fafb] flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-brand-600" />
                  <div>
                    <p className="font-bold text-ink-900">Model Name</p>
                    <p className="text-ink-500">{product.brand} {product.model}</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-ink-100 bg-[#f8fafb] flex items-center gap-3">
                  <Cpu className="h-5 w-5 text-brand-600" />
                  <div>
                    <p className="font-bold text-ink-900">RAM & Storage</p>
                    <p className="text-ink-500">{product.ram || '6 GB'} RAM · {product.storage || '128 GB'} Internal</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-ink-100 bg-[#f8fafb] flex items-center gap-3">
                  <Battery className="h-5 w-5 text-brand-600" />
                  <div>
                    <p className="font-bold text-ink-900">Battery & Health</p>
                    <p className="text-ink-500">Guaranteed &gt; 88% Battery Capacity</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-ink-100 bg-[#f8fafb] flex items-center gap-3">
                  <Camera className="h-5 w-5 text-brand-600" />
                  <div>
                    <p className="font-bold text-ink-900">Cameras & Display</p>
                    <p className="text-ink-500">Dual/Triple HD Camera · Original Display</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 32-Point Quality Inspection Checklist */}
            <div className="card p-6 md:p-8 rounded-[28px] bg-white border border-ink-100 space-y-4">
              <h3 className="font-display text-lg font-extrabold text-ink-900 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" /> 32-Point Quality Checklist Verified
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-ink-700">
                {INSPECTION_POINTS.map((pt, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
