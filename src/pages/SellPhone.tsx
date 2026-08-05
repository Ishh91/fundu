import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  BadgeIndianRupee,
  Truck,
  CheckCircle2,
  ArrowRight,
  Check,
  ShieldCheck,
  Lock,
  Zap,
  Search,
  Smartphone,
  Sparkles,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from 'lucide-react';
import { computeSellEstimate, fetchSellPriceConfig, fetchPhoneModels, type SellPriceConfig } from '../lib/mobileApi';
import { db, formatINR } from '../lib/db';
import { useAuth } from '../context/AuthContext';
import { LUCKNOW_AREAS } from '../types';

const BRAND_CARDS = [
  { name: 'Apple', logo: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=150&auto=format&fit=crop&q=80' },
  { name: 'Samsung', logo: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=150&auto=format&fit=crop&q=80' },
  { name: 'OnePlus', logo: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=150&auto=format&fit=crop&q=80' },
  { name: 'Xiaomi', logo: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=150&auto=format&fit=crop&q=80' },
  { name: 'Realme', logo: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=150&auto=format&fit=crop&q=80' },
  { name: 'Vivo', logo: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=150&auto=format&fit=crop&q=80' },
  { name: 'Oppo', logo: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=150&auto=format&fit=crop&q=80' },
  { name: 'Google', logo: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=150&auto=format&fit=crop&q=80' },
  { name: 'Nothing', logo: 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=150&auto=format&fit=crop&q=80' },
  { name: 'Motorola', logo: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=150&auto=format&fit=crop&q=80' },
];

const POPULAR_SELL_MODELS = [
  { brand: 'Apple', model: 'iPhone 13', storage: '128 GB', price: 38500, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Apple', model: 'iPhone 14', storage: '128 GB', price: 46000, image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Samsung', model: 'Galaxy S23', storage: '256 GB', price: 41000, image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300&auto=format&fit=crop&q=80' },
  { brand: 'OnePlus', model: 'OnePlus 11', storage: '256 GB', price: 33500, image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Google', model: 'Pixel 7', storage: '128 GB', price: 27000, image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Xiaomi', model: 'Redmi Note 13 Pro', storage: '256 GB', price: 16500, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format&fit=crop&q=80' },
];

const STORAGE_OPTIONS = ['64 GB', '128 GB', '256 GB', '512 GB', '1 TB'];

const CONDITIONS = [
  { id: 'Excellent', label: 'Flawless / Like New', desc: 'Zero scratches or scuffs, 100% working screen, battery & body.', mult: 0.75 },
  { id: 'Good', label: 'Good Condition', desc: 'Minor micro-scratches on body, screen perfectly intact and fully functional.', mult: 0.60 },
  { id: 'Fair', label: 'Fair Condition', desc: 'Visible scuffs/wear, minor screen scratches, fully functional hardware.', mult: 0.45 },
];

const ACCESSORIES_LIST = [
  { id: 'Original Box', label: 'Original Box', bonus: '+ ₹300' },
  { id: 'Charger', label: 'Original Charger', bonus: '+ ₹400' },
  { id: 'Bill', label: 'Valid Purchase Invoice/Bill', bonus: '+ ₹200' },
  { id: 'Earphones', label: 'Original Earphones', bonus: '+ ₹150' },
  { id: 'Warranty Card', label: 'Brand Warranty Card', bonus: '+ ₹200' },
];

const FUNCTIONAL_CHECKS = [
  { id: 'touch', label: 'Touch Screen Working Perfectly' },
  { id: 'camera', label: 'Front & Rear Cameras Working' },
  { id: 'speakers', label: 'Speakers & Microphone Clear' },
  { id: 'battery', label: 'Battery Health Good (>80%)' },
  { id: 'biometric', label: 'Face ID / Fingerprint Functional' },
];

const FAQS = [
  { q: 'How is my mobile phone price calculated?', a: 'Your price is calculated based on current market value, brand, model tier, storage size, hardware condition, functional test results, and included original accessories.' },
  { q: 'When do I get paid for my phone?', a: 'Payout is instant! Our Lucknow pickup executive inspects your device at your doorstep and transfers cash or UPI directly into your bank account on spot before taking the phone.' },
  { q: 'Is doorstep pickup free in Lucknow?', a: 'Yes! Pickup is 100% FREE across all Lucknow localities including Gomti Nagar, Hazratganj, Indira Nagar, Aliganj, Mahanagar, and surrounding areas.' },
  { q: 'What happens to my personal data on the phone?', a: 'We perform an ISO-standard factory reset and binary data wipe right in front of you or at our certified facility to ensure 100% data safety.' },
];

export default function SellPhone() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [form, setForm] = useState({
    brand: '',
    model: '',
    ram: '',
    storage: '',
    condition: 'Excellent',
    imei: '',
    accessories: ['Original Box', 'Charger'] as string[],
    functionalIssues: [] as string[],
    payoutMethod: 'UPI' as 'UPI' | 'Cash' | 'Bank',
    pickupAddress: '',
    pickupArea: LUCKNOW_AREAS[0] || 'Gomti Nagar',
    pickupDate: new Date().toISOString().split('T')[0],
    pickupSlot: '10 AM - 12 PM',
    notes: '',
  });

  const [modelsList, setModelsList] = useState<Array<{ name: string; storages: string[] }>>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pricingConfig, setPricingConfig] = useState<SellPriceConfig | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const b = searchParams.get('brand');
    const m = searchParams.get('model');
    const s = searchParams.get('storage');
    if (b || m || s) {
      setForm((cur) => ({
        ...cur,
        brand: b ?? cur.brand,
        model: m ?? cur.model,
        storage: s ?? cur.storage,
      }));
    }
  }, [searchParams]);

  useEffect(() => {
    if (!form.brand) {
      setModelsList([]);
      return;
    }
    setLoadingModels(true);
    fetchPhoneModels(form.brand, searchQuery)
      .then((items) => setModelsList(items))
      .catch(() => setModelsList([]))
      .finally(() => setLoadingModels(false));
  }, [form.brand, searchQuery]);

  useEffect(() => {
    let active = true;

    if (!form.brand || !form.model) {
      setPricingConfig(null);
      return;
    }

    fetchSellPriceConfig(form.brand, form.model, form.storage)
      .then((config) => {
        if (active) setPricingConfig(config);
      })
      .catch(() => {
        if (active) setPricingConfig(null);
      });

    return () => {
      active = false;
    };
  }, [form.brand, form.model, form.storage]);

  const estimate = useMemo(() => {
    return computeSellEstimate(
      pricingConfig,
      form.condition,
      form.accessories,
      form.brand,
      form.model,
      form.storage,
    );
  }, [pricingConfig, form.condition, form.accessories, form.brand, form.model, form.storage]);

  const toggleAccessory = (a: string) => {
    setForm((f) => ({
      ...f,
      accessories: f.accessories.includes(a) ? f.accessories.filter((x) => x !== a) : [...f.accessories, a],
    }));
  };

  const handleBrandSelect = (brandName: string) => {
    setForm((f) => ({ ...f, brand: brandName, model: '', storage: '' }));
  };

  const handleQuickModelSelect = (item: typeof POPULAR_SELL_MODELS[0]) => {
    setForm((f) => ({
      ...f,
      brand: item.brand,
      model: item.model,
      storage: item.storage,
    }));
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!user) {
      navigate('/login?redirect=/sell');
      return;
    }
    setSubmitting(true);
    setError(null);

    const { error: reqErr } = await db.from('sell_requests').insert({
      brand: form.brand,
      model: form.model,
      ram: form.ram || null,
      storage: form.storage || null,
      condition: form.condition,
      imei: form.imei || null,
      accessories: form.accessories,
      estimated_price: estimate,
      pickup_address: `${form.pickupAddress}, ${form.pickupArea}`,
      pickup_date: form.pickupDate || null,
      pickup_slot: form.pickupSlot || null,
      notes: `Payout: ${form.payoutMethod} | Notes: ${form.notes || 'None'}`,
    });

    setSubmitting(false);
    if (reqErr) {
      setError(reqErr.message);
      return;
    }
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#f4f7f8] py-16">
        <div className="container-page">
          <div className="max-w-xl mx-auto card p-8 md:p-10 text-center rounded-[32px] shadow-soft border border-[#dce5e8]">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <span className="mt-4 inline-block rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Pickup Reserved in Lucknow
            </span>
            <h2 className="mt-2 font-display text-3xl font-black text-ink-900">
              Sell Order Confirmed!
            </h2>
            <p className="mt-3 text-sm text-ink-600 leading-relaxed">
              Doorstep pickup booked for <span className="font-bold text-ink-900">{form.brand} {form.model}</span> at <span className="font-bold text-ink-900">{form.pickupArea}, Lucknow</span>. Our agent will verify your phone and transfer payment on spot.
            </p>

            <div className="mt-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white shadow-md">
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-100">Guaranteed Spot Cash Payout</p>
              <p className="mt-1 font-display text-4xl font-black">{formatINR(estimate)}</p>
              <p className="mt-2 text-xs text-white/80">Payout Method: {form.payoutMethod} · Instant Payout on Inspection</p>
            </div>

            <div className="mt-8 flex justify-center gap-3">
              <button onClick={() => navigate('/dashboard')} className="btn-primary">
                View My Orders
              </button>
              <button onClick={() => { setSuccess(false); setStep(1); }} className="btn-outline">
                Sell Another Phone
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7f8] pb-24">
      {/* Cashify-style Search & Top Banner Section */}
      <section className="bg-white border-b border-[#e5ecef] py-8">
        <div className="container-page">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                <Zap className="h-3.5 w-3.5 text-emerald-600" /> Instant Mobile Valuation
              </div>
              <h1 className="mt-2 font-display text-2xl md:text-4xl font-extrabold text-ink-900">
                Sell Old Mobile Phone for Instant Cash
              </h1>
              <p className="mt-1 text-sm text-ink-500">
                Free doorstep pickup across Lucknow · Instant cash or UPI payout on spot
              </p>
            </div>

            {/* Quick Search Bar */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search mobile phone to sell..."
                className="input pl-10 pr-4 py-2.5 rounded-full border-ink-200 text-sm shadow-sm focus:border-brand-500"
              />
            </div>
          </div>

          {/* Cashify Step Progress Bar */}
          <div className="mt-8 flex items-center justify-center gap-2 sm:gap-4 max-w-2xl mx-auto">
            {[
              { s: 1, label: 'Select Device' },
              { s: 2, label: 'Diagnostics' },
              { s: 3, label: 'Instant Quote' },
              { s: 4, label: 'Doorstep Pickup' },
            ].map(({ s, label }) => (
              <div key={s} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => step > s && setStep(s)}
                  className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                    step === s
                      ? 'bg-brand-600 text-white shadow-sm'
                      : step > s
                      ? 'bg-emerald-100 text-emerald-700 cursor-pointer'
                      : 'bg-ink-100 text-ink-400 cursor-not-allowed'
                  }`}
                >
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-white/20 text-xs font-extrabold">
                    {step > s ? <Check className="h-3.5 w-3.5" /> : s}
                  </span>
                  <span className="hidden sm:inline">{label}</span>
                </button>
                {s < 4 && <div className={`h-0.5 w-4 sm:w-8 ${step > s ? 'bg-emerald-500' : 'bg-ink-200'}`} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="container-page mt-8">
        {step === 1 && (
          <div className="space-y-8 animate-fade-in">
            {/* Top Brand Cards Grid */}
            <div className="card p-6 md:p-8 rounded-[28px]">
              <h2 className="font-display text-xl font-extrabold text-ink-900 flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-brand-600" /> Select Phone Brand
              </h2>
              <p className="mt-1 text-xs text-ink-500">Pick your phone manufacturer to view exact models</p>

              <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3 md:gap-4">
                {BRAND_CARDS.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleBrandSelect(item.name)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                      form.brand === item.name
                        ? 'border-brand-600 bg-brand-50/80 shadow-md ring-2 ring-brand-500/20'
                        : 'border-ink-200 bg-white hover:border-brand-300 hover:shadow-sm'
                    }`}
                  >
                    <img src={item.logo} alt={item.name} className="h-12 w-12 object-contain rounded-lg" />
                    <span className="mt-2 text-sm font-bold text-ink-900">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Model & Storage Selection */}
            {form.brand && (
              <div className="card p-6 md:p-8 rounded-[28px] space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="badge bg-brand-50 text-brand-700">Selected Brand: {form.brand}</span>
                    <h3 className="mt-2 font-display text-xl font-extrabold text-ink-900">Select Model & Variant</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, brand: '', model: '', storage: '' }))}
                    className="text-xs text-brand-600 hover:underline font-semibold"
                  >
                    Change Brand
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Select Model</label>
                    <select
                      value={form.model}
                      onChange={(e) => setForm({ ...form, model: e.target.value })}
                      className="input"
                    >
                      <option value="">{loadingModels ? 'Fetching models from API...' : 'Select phone model'}</option>
                      {modelsList.map((m) => (
                        <option key={m.name} value={m.name}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-ink-400">
                      {modelsList.length > 0 ? `${modelsList.length} models available for ${form.brand}` : 'No models loaded yet'}
                    </p>
                  </div>

                  <div>
                    <label className="label">Select Storage / RAM</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {STORAGE_OPTIONS.map((stg) => (
                        <button
                          key={stg}
                          type="button"
                          onClick={() => setForm({ ...form, storage: stg })}
                          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                            form.storage === stg
                              ? 'bg-brand-600 text-white shadow-sm'
                              : 'border border-ink-200 bg-white text-ink-700 hover:border-brand-400'
                          }`}
                        >
                          {stg}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {form.brand && form.model && (
                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="btn-primary flex items-center gap-2"
                    >
                      Continue to Diagnostics <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Popular Sell Models Grid */}
            <div className="card p-6 md:p-8 rounded-[28px]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold text-ink-900 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-brand-600" /> Popular Mobiles Sold in Lucknow
                  </h3>
                  <p className="mt-0.5 text-xs text-ink-500">Tap any model for instant cash quote</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {POPULAR_SELL_MODELS.map((item) => (
                  <button
                    key={item.model}
                    type="button"
                    onClick={() => handleQuickModelSelect(item)}
                    className="flex flex-col items-center p-3 rounded-2xl border border-ink-100 bg-white hover:border-brand-400 hover:shadow-md transition text-center"
                  >
                    <img src={item.image} alt={item.model} className="h-20 w-20 object-contain rounded-lg" />
                    <p className="mt-2 text-xs font-bold text-ink-900 truncate w-full">{item.model}</p>
                    <p className="text-[10px] text-ink-500">{item.storage}</p>
                    <span className="mt-1.5 badge bg-emerald-50 text-emerald-700 font-extrabold">
                      Up to {formatINR(item.price)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <div className="card p-6 md:p-8 rounded-[28px]">
              <div className="flex items-center justify-between border-b border-ink-100 pb-4">
                <div>
                  <span className="badge bg-brand-50 text-brand-700">Step 2 of 4</span>
                  <h2 className="mt-1 font-display text-xl font-extrabold text-ink-900">
                    Device Condition Diagnostics
                  </h2>
                  <p className="text-xs text-ink-500">
                    Evaluating: <span className="font-bold text-ink-900">{form.brand} {form.model} {form.storage}</span>
                  </p>
                </div>
                <button type="button" onClick={() => setStep(1)} className="text-xs text-brand-600 font-bold hover:underline">
                  Change Phone
                </button>
              </div>

              {/* Physical Condition Selector */}
              <div className="mt-6 space-y-4">
                <label className="label">1. Overall Screen & Physical Condition</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {CONDITIONS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setForm({ ...form, condition: c.id })}
                      className={`p-4 rounded-2xl border text-left transition ${
                        form.condition === c.id
                          ? 'border-brand-600 bg-brand-50/80 ring-2 ring-brand-500/20'
                          : 'border-ink-200 bg-white hover:border-ink-300'
                      }`}
                    >
                      <p className="font-bold text-sm text-ink-900">{c.label}</p>
                      <p className="mt-1 text-xs text-ink-500 leading-relaxed">{c.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Functional Quick Checks */}
              <div className="mt-8 space-y-3">
                <label className="label">2. Hardware & Functional Health Check</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {FUNCTIONAL_CHECKS.map((fc) => {
                    const isChecked = !form.functionalIssues.includes(fc.id);
                    return (
                      <button
                        key={fc.id}
                        type="button"
                        onClick={() => {
                          setForm((f) => ({
                            ...f,
                            functionalIssues: isChecked
                              ? [...f.functionalIssues, fc.id]
                              : f.functionalIssues.filter((x) => x !== fc.id),
                          }));
                        }}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-semibold transition ${
                          isChecked
                            ? 'border-emerald-300 bg-emerald-50/60 text-emerald-800'
                            : 'border-ink-200 bg-white text-ink-500 opacity-60'
                        }`}
                      >
                        <div className={`grid h-5 w-5 place-items-center rounded-md ${isChecked ? 'bg-emerald-600 text-white' : 'border border-ink-300'}`}>
                          {isChecked && <Check className="h-3.5 w-3.5" />}
                        </div>
                        {fc.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Accessories Included */}
              <div className="mt-8 space-y-3">
                <label className="label">3. Available Original Accessories</label>
                <div className="flex flex-wrap gap-2">
                  {ACCESSORIES_LIST.map((acc) => {
                    const isSel = form.accessories.includes(acc.id);
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => toggleAccessory(acc.id)}
                        className={`rounded-full px-4 py-2 text-xs font-bold border transition ${
                          isSel
                            ? 'border-brand-600 bg-brand-600 text-white shadow-sm'
                            : 'border-ink-200 bg-white text-ink-700 hover:border-brand-300'
                        }`}
                      >
                        {acc.label} <span className="opacity-80 font-normal">{acc.bonus}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8 flex justify-between gap-3 pt-4 border-t border-ink-100">
                <button type="button" onClick={() => setStep(1)} className="btn-outline text-sm">
                  Back
                </button>
                <button type="button" onClick={() => setStep(3)} className="btn-primary flex items-center gap-2">
                  Calculate Instant Quote <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div className="card p-6 md:p-8 rounded-[28px] text-center">
              <span className="badge bg-emerald-50 text-emerald-700 font-extrabold uppercase tracking-wider">
                Instant Valuation Result
              </span>

              <h2 className="mt-3 font-display text-2xl font-black text-ink-900">
                {form.brand} {form.model} ({form.storage})
              </h2>
              <p className="text-xs text-ink-500">Condition: {form.condition} · Accessories: {form.accessories.join(', ') || 'None'}</p>

              {/* Cashify Quote Box */}
              <div className="mt-6 rounded-3xl bg-gradient-to-r from-[#0d2225] via-[#143035] to-[#0d2225] p-8 text-white shadow-xl relative overflow-hidden">
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Guaranteed Lucknow Payout Quote</p>
                <div className="mt-2 font-display text-4xl sm:text-5xl font-black text-white">
                  {formatINR(estimate)}
                </div>
                <p className="mt-2 text-xs text-white/70">Valid for 7 days · Price match guarantee across Lucknow</p>

                {/* Trust Pills */}
                <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs font-semibold">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 backdrop-blur-md text-emerald-300">
                    <BadgeIndianRupee className="h-3.5 w-3.5" /> Instant Spot Payment
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 backdrop-blur-md text-emerald-300">
                    <Truck className="h-3.5 w-3.5" /> Free Doorstep Pickup
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 backdrop-blur-md text-emerald-300">
                    <Lock className="h-3.5 w-3.5" /> 100% Data Safety
                  </span>
                </div>
              </div>

              {/* Payout Method Selector */}
              <div className="mt-6 text-left">
                <label className="label">Choose Payout Method</label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {[
                    { id: 'UPI', label: 'Instant UPI / GPay' },
                    { id: 'Cash', label: 'Spot Cash Payout' },
                    { id: 'Bank', label: 'Bank Transfer' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setForm({ ...form, payoutMethod: p.id as 'UPI' | 'Cash' | 'Bank' })}
                      className={`p-3 rounded-xl border text-center transition ${
                        form.payoutMethod === p.id
                          ? 'border-emerald-600 bg-emerald-50 font-extrabold text-emerald-800 ring-2 ring-emerald-500/20'
                          : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300'
                      }`}
                    >
                      <p className="text-xs font-bold">{p.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex justify-between gap-3 pt-4 border-t border-ink-100">
                <button type="button" onClick={() => setStep(2)} className="btn-outline text-sm">
                  Adjust Diagnostics
                </button>
                <button type="button" onClick={() => setStep(4)} className="btn-primary flex items-center gap-2">
                  Book Doorstep Pickup <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div className="card p-6 md:p-8 rounded-[28px]">
              <div className="flex items-center justify-between border-b border-ink-100 pb-4">
                <div>
                  <span className="badge bg-brand-50 text-brand-700">Step 4 of 4</span>
                  <h2 className="mt-1 font-display text-xl font-extrabold text-ink-900">
                    Schedule Lucknow Doorstep Pickup
                  </h2>
                  <p className="text-xs text-ink-500">
                    Quote: <span className="font-extrabold text-emerald-700">{formatINR(estimate)}</span> ({form.payoutMethod})
                  </p>
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-xl bg-accent-50 border border-accent-200 p-3 text-xs text-accent-700">
                  {error}
                </div>
              )}

              <div className="mt-6 space-y-4">
                <div>
                  <label className="label">Lucknow Pickup Locality / Area</label>
                  <select
                    value={form.pickupArea}
                    onChange={(e) => setForm({ ...form, pickupArea: e.target.value })}
                    className="input mt-1"
                  >
                    {LUCKNOW_AREAS.map((area) => (
                      <option key={area} value={area}>
                        {area}, Lucknow
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Full Doorstep Pickup Address</label>
                  <textarea
                    rows={3}
                    value={form.pickupAddress}
                    onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })}
                    placeholder="House / Flat No., Building Name, Street, Landmark"
                    className="input mt-1"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Preferred Pickup Date</label>
                    <input
                      type="date"
                      value={form.pickupDate}
                      onChange={(e) => setForm({ ...form, pickupDate: e.target.value })}
                      className="input mt-1"
                    />
                  </div>

                  <div>
                    <label className="label">Preferred Time Slot</label>
                    <select
                      value={form.pickupSlot}
                      onChange={(e) => setForm({ ...form, pickupSlot: e.target.value })}
                      className="input mt-1"
                    >
                      {['10 AM - 12 PM', '12 PM - 2 PM', '2 PM - 4 PM', '4 PM - 6 PM', '6 PM - 8 PM'].map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Special Instructions (Optional)</label>
                  <input
                    type="text"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="e.g. Call before coming, gate passcode"
                    className="input mt-1"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-between gap-3 pt-4 border-t border-ink-100">
                <button type="button" onClick={() => setStep(3)} className="btn-outline text-sm">
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || !form.pickupAddress.trim()}
                  className="btn-primary text-sm flex items-center gap-2"
                >
                  {submitting ? 'Confirming...' : 'Confirm Pickup Booking'} <CheckCircle2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* How It Works Section */}
        <section className="mt-16 card p-8 rounded-[32px]">
          <div className="text-center max-w-xl mx-auto">
            <span className="badge bg-brand-50 text-brand-700">Simple 3-Step Process</span>
            <h2 className="mt-2 font-display text-2xl font-extrabold text-ink-900">How Selling on Fundu Works</h2>
            <p className="mt-1 text-xs text-ink-500">Hassle-free phone selling right from your home in Lucknow</p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-6 rounded-2xl bg-[#f8fafb] border border-ink-100">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-white font-black text-lg">
                1
              </div>
              <h3 className="mt-4 font-bold text-ink-900 text-base">Check Price</h3>
              <p className="mt-2 text-xs text-ink-500 leading-relaxed">
                Select your phone model and evaluate device condition to get an instant valuation quote.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#f8fafb] border border-ink-100">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-white font-black text-lg">
                2
              </div>
              <h3 className="mt-4 font-bold text-ink-900 text-base">Schedule Free Pickup</h3>
              <p className="mt-2 text-xs text-ink-500 leading-relaxed">
                Book a convenient date and time slot for free doorstep pickup anywhere in Lucknow.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#f8fafb] border border-ink-100">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-white font-black text-lg">
                3
              </div>
              <h3 className="mt-4 font-bold text-ink-900 text-base">Get Paid Instantly</h3>
              <p className="mt-2 text-xs text-ink-500 leading-relaxed">
                Receive instant cash or UPI transfer right at your doorstep upon quick physical inspection.
              </p>
            </div>
          </div>
        </section>

        {/* Why Sell on Fundu Section */}
        <section className="mt-8 card p-8 rounded-[32px]">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="font-display text-2xl font-extrabold text-ink-900">Why Sell Your Phone on Fundu?</h2>
            <p className="mt-1 text-xs text-ink-500">Lucknow's most trusted refurbished & phone re-commerce hub</p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl border border-ink-100 bg-white">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                <BadgeIndianRupee className="h-5 w-5" />
              </div>
              <h4 className="mt-3 font-bold text-ink-900 text-sm">Best Market Valuation</h4>
              <p className="mt-1 text-xs text-ink-500">AI algorithm ensures highest price match for your device tier.</p>
            </div>

            <div className="p-5 rounded-2xl border border-ink-100 bg-white">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-100 text-brand-700">
                <Truck className="h-5 w-5" />
              </div>
              <h4 className="mt-3 font-bold text-ink-900 text-sm">Free Doorstep Pickup</h4>
              <p className="mt-1 text-xs text-ink-500">Zero shipping fees or pickup charges across all Lucknow areas.</p>
            </div>

            <div className="p-5 rounded-2xl border border-ink-100 bg-white">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-weather-100 text-weather-700">
                <Lock className="h-5 w-5" />
              </div>
              <h4 className="mt-3 font-bold text-ink-900 text-sm">100% Safe Data Wipe</h4>
              <p className="mt-1 text-xs text-ink-500">Military-grade data destruction wipes all personal info securely.</p>
            </div>

            <div className="p-5 rounded-2xl border border-ink-100 bg-white">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-nature-100 text-nature-700">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h4 className="mt-3 font-bold text-ink-900 text-sm">Spot Payment Guarantee</h4>
              <p className="mt-1 text-xs text-ink-500">Instant cash or UPI credit before our executive leaves your home.</p>
            </div>
          </div>
        </section>

        {/* FAQs Section */}
        <section className="mt-8 card p-8 rounded-[32px]">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-brand-600" />
            <h2 className="font-display text-xl font-extrabold text-ink-900">Frequently Asked Questions</h2>
          </div>

          <div className="mt-6 space-y-3">
            {FAQS.map((faq, idx) => {
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
