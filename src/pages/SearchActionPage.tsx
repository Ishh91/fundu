import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Smartphone,
  BadgeIndianRupee,
  Wrench,
  ArrowRight,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Bell,
  X,
  RefreshCw,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { ALL_INDIAN_PHONES_CATALOG } from '../data/indianPhonesCatalog';
import { getCleanPhoneImage } from '../lib/phoneImages';
import { db, formatINR } from '../lib/db';
import type { Product } from '../types';

export default function SearchActionPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || searchParams.get('search') || searchParams.get('model') || '';

  const [searchInput, setSearchInput] = useState(query);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Restock Notification Modal State
  const [notifyModal, setNotifyModal] = useState<{
    isOpen: boolean;
    phoneModel: string;
    brand: string;
  } | null>(null);
  const [notifyContact, setNotifyContact] = useState('');
  const [notifySuccess, setNotifySuccess] = useState(false);

  // Sync search input when URL changes
  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  // Load products to cross-check live inventory stock
  useEffect(() => {
    async function loadProducts() {
      setLoadingProducts(true);
      try {
        const { data } = await db.from('products').select('*');
        if (data && Array.isArray(data)) {
          setProducts(data);
        }
      } catch (err) {
        console.warn('Could not fetch products inventory:', err);
      } finally {
        setLoadingProducts(false);
      }
    }
    loadProducts();
  }, []);

  // Handle Search Submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchInput.trim();
    if (clean) {
      navigate(`/search?q=${encodeURIComponent(clean)}`);
    }
  };

  // Find matching phones from catalogs
  const cleanQ = query.trim().toLowerCase();
  const strippedQ = cleanQ.replace(/[\s-]+/g, '');

  const matchedPhones = React.useMemo(() => {
    if (!cleanQ) return [];

    const matches = new Map<string, { brand: string; model: string; price: number; image?: string }>();

    // 1. Check ALL_INDIAN_PHONES_CATALOG
    ALL_INDIAN_PHONES_CATALOG.forEach((p) => {
      const full = `${p.brand} ${p.model}`.toLowerCase();
      const strippedFull = full.replace(/[\s-]+/g, '');
      if (
        full.includes(cleanQ) ||
        strippedFull.includes(strippedQ) ||
        cleanQ.includes(p.model.toLowerCase())
      ) {
        matches.set(`${p.brand}__${p.model}`.toLowerCase(), {
          brand: p.brand,
          model: p.model,
          price: p.base_resale_value || Math.round(p.default_mrp * 0.55),
          image: p.image_url,
        });
      }
    });

    // 2. Also check database products
    products.forEach((prod) => {
      const full = `${prod.brand} ${prod.model} ${prod.title}`.toLowerCase();
      const strippedFull = full.replace(/[\s-]+/g, '');
      const key = `${prod.brand}__${prod.model}`.toLowerCase();
      if (
        (full.includes(cleanQ) || strippedFull.includes(strippedQ)) &&
        !matches.has(key)
      ) {
        matches.set(key, {
          brand: prod.brand,
          model: prod.model,
          price: prod.price,
          image: prod.image,
        });
      }
    });

    return Array.from(matches.values()).slice(0, 8);
  }, [cleanQ, strippedQ, products]);

  // Check product stock for a specific model
  const getProductStockInfo = (brand: string, model: string) => {
    const strippedModel = model.toLowerCase().replace(/[\s-]+/g, '');
    const found = products.find((p) => {
      const pStripped = (p.model || p.title || '').toLowerCase().replace(/[\s-]+/g, '');
      return p.brand?.toLowerCase() === brand.toLowerCase() && (pStripped.includes(strippedModel) || strippedModel.includes(pStripped));
    });

    if (found && (found.stock ?? 1) > 0) {
      return {
        inStock: true,
        stockCount: found.stock ?? 1,
        product: found,
        price: found.price,
      };
    }

    return {
      inStock: false,
      stockCount: 0,
      product: found || null,
      price: found?.price || null,
    };
  };

  // Submit Restock Notification
  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyContact.trim()) return;

    setNotifySuccess(true);
    setTimeout(() => {
      setNotifyModal(null);
      setNotifySuccess(false);
      setNotifyContact('');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#f4f7f8] pb-24">
      {/* CASHIFY EXACT BREADCRUMB NAVIGATION */}
      <div className="bg-white border-b border-gray-100 py-2.5 px-4 text-xs font-semibold text-gray-500">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 flex-wrap">
          <Link to="/" className="hover:text-[#00a896] transition">Home</Link>
          <span>&gt;</span>
          <Link to="/search" className="hover:text-[#00a896] transition">Search</Link>
          {query && (
            <>
              <span>&gt;</span>
              <span className="text-[#00a896] font-extrabold">{query}</span>
            </>
          )}
        </div>
      </div>

      {/* Search Header Banner */}
      <div className="bg-white border-b border-gray-200/80 py-6 px-4">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="badge bg-teal-50 text-[#00a896] text-xs font-bold">Smart Device Hub</span>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
                {query ? `Search Results for "${query}"` : 'Search Any Phone'}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Choose whether you want to Buy, Sell, or Repair this device in Lucknow with instant doorstep service.
              </p>
            </div>
          </div>

          {/* Quick Search Re-input Bar */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-2xl">
            <div className="flex items-center gap-2 rounded-2xl bg-gray-50 border border-gray-300/80 px-4 py-3 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#00a896]/30 focus-within:border-[#00a896] transition shadow-xs">
              <Search className="h-5 w-5 text-gray-400 shrink-0" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search phone — iPhone 15, S24, OnePlus 12, Galaxy J7..."
                className="w-full bg-transparent text-sm font-semibold text-gray-900 outline-none placeholder:text-gray-400"
              />
              <button
                type="submit"
                className="btn-primary text-xs px-4 py-1.5 bg-[#00a896] hover:bg-[#008f80] font-bold rounded-xl shrink-0 shadow-xs"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Main Results Container */}
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {matchedPhones.length === 0 ? (
          <div className="card p-12 text-center bg-white rounded-3xl border border-gray-200 shadow-sm space-y-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-teal-50 text-[#00a896] mx-auto shadow-xs">
              <Smartphone className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">No exact phone match found for "{query}"</h2>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                Check your spelling or choose from our primary service options below:
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link to="/buy" className="btn-primary text-xs px-5 py-2.5 bg-[#00a896] hover:bg-[#008f80] font-bold">
                Browse Buy Store
              </Link>
              <Link to="/sell" className="btn-outline text-xs px-5 py-2.5 font-bold">
                Sell Old Phone
              </Link>
              <Link to="/repair" className="btn-outline text-xs px-5 py-2.5 font-bold">
                Book Repair Service
              </Link>
            </div>
          </div>
        ) : (
          matchedPhones.map((phone) => {
            const stockInfo = getProductStockInfo(phone.brand, phone.model);
            const brandClean = phone.brand.toLowerCase();
            const modelClean = phone.model.toLowerCase().replace(/\s+/g, '-');

            return (
              <div
                key={`${phone.brand}-${phone.model}`}
                className="card p-6 sm:p-7 rounded-[28px] bg-white border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 space-y-6"
              >
                {/* Device Title & Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-2xl bg-[#f8fafc] border border-gray-200/80 p-2 flex items-center justify-center shadow-xs">
                      <img
                        src={getCleanPhoneImage(phone.brand, phone.model, phone.image)}
                        alt={phone.model}
                        className="h-full w-full object-contain drop-shadow-xs"
                        loading="lazy"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="badge bg-teal-50 text-[#00a896] font-extrabold text-[11px] px-2.5 py-0.5">
                        {phone.brand}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                        {phone.model}
                      </h2>
                      <p className="text-xs text-gray-500 flex items-center gap-2">
                        <span>Fundu Re-Commerce Network</span>
                        <span>·</span>
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <Truck className="h-3.5 w-3.5 text-emerald-600" /> Free Lucknow Doorstep Service
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Stock Availability Pill */}
                  <div>
                    {stockInfo.inStock ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-xs">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        In Stock ({stockInfo.stockCount} Available)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-200 shadow-xs">
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                        Currently Out of Stock
                      </span>
                    )}
                  </div>
                </div>

                {/* 3 CORE ACTIONS GRID: BUY / SELL / REPAIR */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 1. SELL CARD */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/30 border border-emerald-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-400 transition-colors group">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-700 shadow-xs">
                          <BadgeIndianRupee className="h-5 w-5" />
                        </div>
                        <span className="badge bg-emerald-600 text-white font-extrabold text-[10px] px-2 py-0.5">
                          Instant Cash
                        </span>
                      </div>

                      <h3 className="font-extrabold text-base text-gray-900 group-hover:text-emerald-700 transition-colors">
                        Sell This Phone
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Get instant cash quote with free Lucknow doorstep pickup and spot UPI payout.
                      </p>

                      <div className="pt-1">
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Estimated Valuation:</p>
                        <p className="text-lg font-black text-emerald-700">
                          Up to {formatINR(phone.price)}
                        </p>
                      </div>
                    </div>

                    <Link
                      to={`/sell/${brandClean}/${modelClean}`}
                      className="btn-primary w-full text-xs py-2.5 bg-emerald-600 hover:bg-emerald-700 font-bold flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      Sell & Get Cash Quote <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>

                  {/* 2. BUY CARD */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-50/80 via-white to-teal-50/30 border border-teal-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-teal-400 transition-colors group">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-teal-100 text-[#00a896] shadow-xs">
                          <Smartphone className="h-5 w-5" />
                        </div>
                        {stockInfo.inStock ? (
                          <span className="badge bg-teal-600 text-white font-extrabold text-[10px] px-2 py-0.5">
                            Certified Ready
                          </span>
                        ) : (
                          <span className="badge bg-amber-500 text-white font-extrabold text-[10px] px-2 py-0.5">
                            Out of Stock
                          </span>
                        )}
                      </div>

                      <h3 className="font-extrabold text-base text-gray-900 group-hover:text-[#00a896] transition-colors">
                        Buy Refurbished
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {stockInfo.inStock
                          ? '32-point tested, Grade A condition, 6-month warranty with same-day Lucknow delivery.'
                          : 'Currently out of stock in Lucknow warehouse. Click below to get restock SMS alert.'}
                      </p>

                      <div className="pt-1">
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Starting Price:</p>
                        <p className="text-lg font-black text-teal-800">
                          {stockInfo.price ? formatINR(stockInfo.price) : 'Check Restock'}
                        </p>
                      </div>
                    </div>

                    {stockInfo.inStock && stockInfo.product ? (
                      <Link
                        to={`/product/${stockInfo.product.id}`}
                        className="btn-primary w-full text-xs py-2.5 bg-[#00a896] hover:bg-[#008f80] font-bold flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        Buy Now ({formatINR(stockInfo.price!)}) <ArrowRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setNotifyModal({
                            isOpen: true,
                            phoneModel: phone.model,
                            brand: phone.brand,
                          })
                        }
                        className="btn w-full text-xs py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold flex items-center justify-center gap-1.5 rounded-xl shadow-xs transition"
                      >
                        <Bell className="h-3.5 w-3.5" /> Out of Stock — Notify Me
                      </button>
                    )}
                  </div>

                  {/* 3. REPAIR CARD */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/80 via-white to-amber-50/30 border border-amber-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-400 transition-colors group">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-amber-700 shadow-xs">
                          <Wrench className="h-5 w-5" />
                        </div>
                        <span className="badge bg-amber-600 text-white font-extrabold text-[10px] px-2 py-0.5">
                          Doorstep Repair
                        </span>
                      </div>

                      <h3 className="font-extrabold text-base text-gray-900 group-hover:text-amber-700 transition-colors">
                        Repair Screen / Battery
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Screen crack, battery drainage, or charging port issues fixed right in front of you.
                      </p>

                      <div className="pt-1">
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Service Guarantee:</p>
                        <p className="text-sm font-black text-amber-800">
                          6-Month Warranty on Parts
                        </p>
                      </div>
                    </div>

                    <Link
                      to={`/repair?brand=${encodeURIComponent(phone.brand)}&model=${encodeURIComponent(phone.model)}`}
                      className="btn-primary w-full text-xs py-2.5 bg-amber-600 hover:bg-amber-700 font-bold flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      Book Doorstep Repair <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* RESTOCK NOTIFICATION MODAL */}
      {notifyModal?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-gray-200 space-y-5 relative">
            <button
              onClick={() => setNotifyModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
            >
              <X className="h-5 w-5" />
            </button>

            {notifySuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600 mx-auto shadow-sm">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-black text-gray-900">Restock Alert Confirmed!</h3>
                <p className="text-xs text-gray-600 max-w-xs mx-auto">
                  We have registered your restock request for <span className="font-bold text-gray-900">{notifyModal.phoneModel}</span>. You'll receive a notification as soon as units arrive in Lucknow!
                </p>
              </div>
            ) : (
              <form onSubmit={handleNotifySubmit} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 text-amber-700 shadow-xs shrink-0">
                    <Bell className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Notify Me When In Stock</h3>
                    <p className="text-xs text-gray-500">{notifyModal.brand} {notifyModal.phoneModel}</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 leading-relaxed">
                  Currently, this exact model is sold out in Lucknow. Leave your phone number or email below to receive an instant WhatsApp/SMS notification the moment a tested unit is certified!
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-gray-700">Phone Number or Email Address</label>
                  <input
                    type="text"
                    required
                    value={notifyContact}
                    onChange={(e) => setNotifyContact(e.target.value)}
                    placeholder="Enter WhatsApp number (e.g. 9839122345)"
                    className="input w-full text-xs font-semibold py-2.5 px-3 bg-gray-50 border-gray-300 focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full py-2.5 text-xs font-bold bg-[#00a896] hover:bg-[#008f80] flex items-center justify-center gap-1.5 shadow-md shadow-teal-500/20"
                >
                  <Bell className="h-4 w-4" /> Notify Me When In Stock
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
