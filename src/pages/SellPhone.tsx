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
  Camera,
  Upload,
  AlertCircle,
  HelpCircle,
  PhoneCall,
  UserCheck,
  Clock,
  MapPin,
  Battery,
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
  { id: 'screen_touch', label: 'Touch Screen Responsive across all areas' },
  { id: 'cameras', label: 'Front & Rear Cameras Working Clearly' },
  { id: 'speaker_mic', label: 'Speakers & Microphone Crystal Clear' },
  { id: 'charging_port', label: 'Charging Port & Cable Connects Fast' },
  { id: 'biometrics', label: 'Face ID / Fingerprint Unlock Working' },
];

const FAQS = [
  { q: 'Why is IMEI number required?', a: 'IMEI (International Mobile Equipment Identity) is required to legally verify device ownership, check blacklist records, and ensure seamless spot cash payout at your doorstep.' },
  { q: 'How do I check my phone IMEI?', a: 'Simply open your phone dialer and type *#06#. A 15-digit IMEI number will appear instantly on screen.' },
  { q: 'When do I get paid for my phone?', a: 'Payout is instant! Our Lucknow pickup executive inspects your device at your doorstep and transfers cash or UPI directly into your account on spot before taking the phone.' },
  { q: 'Is doorstep pickup free in Lucknow?', a: 'Yes! Pickup is 100% FREE across all Lucknow localities including Gomti Nagar, Hazratganj, Indira Nagar, Aliganj, Mahanagar, and surrounding areas.' },
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
    imeiPhoto: '',
    devicePhotos: {
      front: '',
      back: '',
      edges: '',
      bill_box: '',
    },
    diagnostics: {
      screen_touch: true,
      cameras: true,
      battery_health: '85%+',
      biometrics: true,
      speaker_mic: true,
      charging_port: true,
    },
    accessories: ['Original Box', 'Charger'] as string[],
    payoutMethod: 'UPI' as 'UPI' | 'Cash' | 'Bank',
    payoutDetails: '',
    pickupAddress: '',
    pickupArea: LUCKNOW_AREAS[0] || 'Gomti Nagar',
    pickupDate: new Date().toISOString().split('T')[0],
    pickupSlot: '10 AM - 12 PM',
    notes: '',
  });

  const [modelsList, setModelsList] = useState<Array<{ name: string; storages: string[] }>>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{
    id?: string;
    pickup_person_name?: string | null;
    pickup_person_phone?: string | null;
    estimated_arrival_time?: string | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [pricingConfig, setPricingConfig] = useState<SellPriceConfig | null>(null);
  const [showImeiGuide, setShowImeiGuide] = useState(false);

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

  // Photo reader helper
  const handlePhotoUpload = (key: 'front' | 'back' | 'edges' | 'bill_box' | 'imei', file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (key === 'imei') {
        setForm((prev) => ({ ...prev, imeiPhoto: base64 }));
      } else {
        setForm((prev) => ({
          ...prev,
          devicePhotos: {
            ...prev.devicePhotos,
            [key]: base64,
          },
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const isImeiValid = useMemo(() => {
    if (!form.imei) return false;
    const clean = form.imei.replace(/\D/g, '');
    return clean.length === 15;
  }, [form.imei]);

  const handleSubmit = async () => {
    if (!user) {
      navigate('/login?redirect=/sell');
      return;
    }
    setSubmitting(true);
    setError(null);

    const payload = {
      brand: form.brand,
      model: form.model,
      ram: form.ram || null,
      storage: form.storage || null,
      condition: form.condition,
      imei: form.imei ? form.imei.replace(/\D/g, '') : null,
      imei_photo: form.imeiPhoto || null,
      device_photos: form.devicePhotos,
      diagnostics: form.diagnostics,
      accessories: form.accessories,
      estimated_price: estimate,
      pickup_address: form.pickupAddress,
      pickup_area: form.pickupArea,
      pickup_date: form.pickupDate || null,
      pickup_slot: form.pickupSlot || null,
      payout_method: form.payoutMethod,
      payout_details: form.payoutDetails || form.payoutMethod,
      notes: `Payout: ${form.payoutMethod} (${form.payoutDetails || 'Doorstep'}) | Notes: ${form.notes || 'None'}`,
    };

    const { data, error: reqErr } = await db.from('sell_requests').insert(payload).select().single();

    setSubmitting(false);
    if (reqErr) {
      setError(reqErr.message);
      return;
    }

    setSuccessData({
      id: (data as any)?.id,
      pickup_person_name: (data as any)?.pickup_person_name || 'Rohit Verma',
      pickup_person_phone: (data as any)?.pickup_person_phone || '+91 98391 22345',
      estimated_arrival_time: (data as any)?.estimated_arrival_time || `${form.pickupSlot} (${form.pickupDate})`,
    });
  };

  if (successData) {
    return (
      <div className="min-h-screen bg-[#f4f7f8] py-16">
        <div className="container-page">
          <div className="max-w-2xl mx-auto card p-8 md:p-10 text-center rounded-[32px] shadow-soft border border-[#dce5e8]">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <span className="mt-4 inline-block rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Pickup & Executive Assigned · Lucknow Hub
            </span>
            <h2 className="mt-2 font-display text-3xl font-black text-ink-900">
              Sell Order Confirmed!
            </h2>
            <p className="mt-2 text-sm text-ink-600 leading-relaxed">
              Doorstep pickup booked for <span className="font-bold text-ink-900">{form.brand} {form.model}</span> ({form.storage}) at <span className="font-bold text-ink-900">{form.pickupArea}, Lucknow</span>.
            </p>

            {/* Payout Banner */}
            <div className="mt-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white shadow-md">
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-100">Guaranteed Spot Payout</p>
              <p className="mt-1 font-display text-4xl font-black">{formatINR(estimate)}</p>
              <p className="mt-2 text-xs text-white/80">Payout Method: {form.payoutMethod} · Instant Transfer on Doorstep Inspection</p>
            </div>

            {/* Auto-Assigned Field Executive Card */}
            <div className="mt-6 p-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4 text-emerald-600" /> Auto-Assigned Lucknow Executive
                </span>
                <span className="badge bg-emerald-100 text-emerald-800 text-[11px] font-bold">Verified Agent</span>
              </div>

              <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-emerald-100">
                <div>
                  <p className="font-display font-black text-lg text-ink-900">{successData.pickup_person_name}</p>
                  <p className="text-xs text-ink-600 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3.5 w-3.5 text-emerald-600" /> Serving {form.pickupArea} Cluster, Lucknow
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${successData.pickup_person_phone}`}
                    className="btn bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5"
                  >
                    <PhoneCall className="h-3.5 w-3.5" /> Call Agent
                  </a>
                </div>
              </div>

              <div className="mt-3 bg-white p-3 rounded-xl border border-emerald-100 flex items-center gap-2 text-xs text-ink-700">
                <Clock className="h-4 w-4 text-brand-600 shrink-0" />
                <span>
                  <strong>Arrival Window:</strong> {successData.estimated_arrival_time}
                </span>
              </div>
            </div>

            {/* Registered Details Summary */}
            <div className="mt-6 p-4 rounded-2xl bg-ink-50 border border-ink-100 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-ink-500">Registered IMEI:</span>
                <span className="font-mono font-bold text-ink-900">{form.imei || 'Pre-inspected at doorstep'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500">Pickup Locality:</span>
                <span className="font-semibold text-ink-900">{form.pickupArea}, Lucknow</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500">Condition Grade:</span>
                <span className="font-semibold text-ink-900">{form.condition}</span>
              </div>
            </div>

            <div className="mt-8 flex justify-center gap-3">
              <button onClick={() => navigate('/dashboard')} className="btn-primary">
                View My Orders
              </button>
              <button
                onClick={() => {
                  setSuccessData(null);
                  setStep(1);
                }}
                className="btn-outline"
              >
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
      {/* Top Banner Section */}
      <section className="bg-white border-b border-[#e5ecef] py-8">
        <div className="container-page">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                <Zap className="h-3.5 w-3.5 text-emerald-600" /> Instant Mobile Valuation · Lucknow
              </div>
              <h1 className="mt-2 font-display text-2xl md:text-4xl font-extrabold text-ink-900">
                Sell Old Mobile Phone for Instant Cash
              </h1>
              <p className="mt-1 text-sm text-ink-500">
                Doorstep pickup across Lucknow · Auto-assigned executive · Instant spot UPI/cash payment
              </p>
            </div>

            {/* Quick Search Bar */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search phone brand or model..."
                className="input pl-10 pr-4 py-2.5 rounded-full border-ink-200 text-sm shadow-sm focus:border-brand-500"
              />
            </div>
          </div>

          {/* 5-Step Progress Bar */}
          <div className="mt-8 flex items-center justify-center gap-1.5 sm:gap-3 max-w-4xl mx-auto overflow-x-auto pb-2">
            {[
              { s: 1, label: 'Select Phone' },
              { s: 2, label: 'Condition & Diagnostics' },
              { s: 3, label: 'IMEI & Photos' },
              { s: 4, label: 'Instant Quote' },
              { s: 5, label: 'Schedule Pickup' },
            ].map(({ s, label }) => (
              <div key={s} className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => step > s && setStep(s)}
                  className={`flex items-center gap-1.5 sm:gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition ${
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
                {s < 5 && <div className={`h-0.5 w-3 sm:w-6 ${step > s ? 'bg-emerald-500' : 'bg-ink-200'}`} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="container-page mt-8">
        {/* STEP 1: Select Device */}
        {step === 1 && (
          <div className="space-y-8 animate-fade-in">
            <div className="card p-6 md:p-8 rounded-[28px]">
              <h2 className="font-display text-xl font-extrabold text-ink-900 flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-brand-600" /> Select Phone Brand
              </h2>
              <p className="mt-1 text-xs text-ink-500">Pick your phone manufacturer to view exact models</p>

              <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3.5 md:gap-4">
                {BRAND_CARDS.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleBrandSelect(item.name)}
                    className={`group relative flex flex-col items-center justify-center p-5 rounded-2xl border transition-all duration-300 active:scale-95 cursor-pointer ${
                      form.brand === item.name
                        ? 'border-[#00a896] bg-teal-50/90 shadow-lg shadow-teal-500/10 ring-2 ring-[#00a896]/30 -translate-y-1'
                        : 'border-gray-200/90 bg-white hover:border-[#00a896] hover:bg-teal-50/40 hover:shadow-xl hover:shadow-teal-500/10 hover:-translate-y-1.5'
                    }`}
                  >
                    <div className="overflow-hidden rounded-xl p-2 bg-gray-50/80 group-hover:bg-white group-hover:shadow-xs transition-all duration-300">
                      <img src={item.logo} alt={item.name} className="h-12 w-12 object-contain rounded-lg group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <span className="mt-2.5 text-sm font-extrabold text-gray-900 group-hover:text-[#00a896] transition-colors duration-200">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>

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
                      className="input mt-1 focus:border-[#00a896] transition-colors"
                    >
                      <option value="">{loadingModels ? 'Fetching models...' : 'Select phone model'}</option>
                      {modelsList.map((m) => (
                        <option key={m.name} value={m.name}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-ink-400">
                      {modelsList.length > 0 ? `${modelsList.length} models available for ${form.brand}` : 'No models loaded'}
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
                          className={`rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer ${
                            form.storage === stg
                              ? 'bg-[#00a896] text-white shadow-md shadow-teal-500/20 scale-105'
                              : 'border border-gray-200 bg-white text-gray-700 hover:border-[#00a896] hover:bg-teal-50/50 hover:scale-102'
                          }`}
                        >
                          {stg}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {form.brand && form.model && (
                  <div className="flex justify-end pt-4 border-t border-ink-100">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="btn-primary flex items-center gap-2 hover:scale-102 active:scale-95 transition-transform"
                    >
                      Continue to Diagnostics <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Popular Sell Models */}
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
                    className="group flex flex-col items-center p-4 rounded-2xl border border-gray-200/90 bg-white hover:border-[#00a896] hover:bg-teal-50/20 hover:shadow-xl hover:shadow-teal-500/10 hover:-translate-y-1.5 transition-all duration-300 text-center active:scale-95 cursor-pointer"
                  >
                    <div className="overflow-hidden rounded-xl p-1 group-hover:scale-105 transition-transform duration-300">
                      <img src={item.image} alt={item.model} className="h-20 w-20 object-contain rounded-lg" />
                    </div>
                    <p className="mt-2 text-xs font-bold text-gray-900 group-hover:text-[#00a896] transition-colors truncate w-full">{item.model}</p>
                    <p className="text-[10px] text-gray-500 font-semibold">{item.storage}</p>
                    <span className="mt-1.5 badge bg-emerald-50 text-emerald-700 font-extrabold group-hover:bg-[#00a896] group-hover:text-white transition-colors duration-200">
                      Up to {formatINR(item.price)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Diagnostics & Condition */}
        {step === 2 && (
          <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <div className="card p-6 md:p-8 rounded-[28px]">
              <div className="flex items-center justify-between border-b border-ink-100 pb-4">
                <div>
                  <span className="badge bg-brand-50 text-brand-700">Step 2 of 5</span>
                  <h2 className="mt-1 font-display text-xl font-extrabold text-ink-900">
                    Device Condition & Hardware Diagnostics
                  </h2>
                  <p className="text-xs text-ink-500">
                    Evaluating: <span className="font-bold text-ink-900">{form.brand} {form.model} {form.storage}</span>
                  </p>
                </div>
                <button type="button" onClick={() => setStep(1)} className="text-xs text-brand-600 font-bold hover:underline">
                  Change Phone
                </button>
              </div>

              {/* Physical Condition */}
              <div className="mt-6 space-y-4">
                <label className="label">1. Overall Screen & Physical Condition</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {CONDITIONS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setForm({ ...form, condition: c.id })}
                      className={`p-4 rounded-2xl border text-left transition-all duration-300 active:scale-95 cursor-pointer ${
                        form.condition === c.id
                          ? 'border-[#00a896] bg-teal-50/90 shadow-md ring-2 ring-[#00a896]/30 -translate-y-1'
                          : 'border-gray-200 bg-white hover:border-[#00a896] hover:bg-teal-50/30 hover:shadow-xl hover:shadow-teal-500/10 hover:-translate-y-1'
                      }`}
                    >
                      <p className="font-extrabold text-sm text-gray-900">{c.label}</p>
                      <p className="mt-1 text-xs text-gray-500 leading-relaxed">{c.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Functional Diagnostics Checklist */}
              <div className="mt-8 space-y-3">
                <label className="label">2. Hardware Diagnostics Checklist</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {FUNCTIONAL_CHECKS.map((fc) => {
                    const isPassed = (form.diagnostics as any)[fc.id] ?? true;
                    return (
                      <button
                        key={fc.id}
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            diagnostics: {
                              ...prev.diagnostics,
                              [fc.id]: !isPassed,
                            },
                          }));
                        }}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer ${
                          isPassed
                            ? 'border-emerald-400 bg-emerald-50/80 text-emerald-800 shadow-xs hover:bg-emerald-100/80'
                            : 'border-gray-200 bg-white text-gray-500 opacity-70 hover:opacity-100 hover:border-emerald-400 hover:bg-emerald-50/30'
                        }`}
                      >
                        <div className={`grid h-5 w-5 place-items-center rounded-md transition-colors ${isPassed ? 'bg-emerald-600 text-white' : 'border border-gray-300'}`}>
                          {isPassed && <Check className="h-3.5 w-3.5" />}
                        </div>
                        {fc.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Battery Health Selector */}
              <div className="mt-6">
                <label className="label flex items-center gap-1.5">
                  <Battery className="h-4 w-4 text-emerald-600" /> Battery Health Status
                </label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {['85%+ (Excellent)', '75% - 84% (Good)', 'Below 75% (Service)'].map((bat) => (
                    <button
                      key={bat}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, diagnostics: { ...prev.diagnostics, battery_health: bat } }))}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer ${
                        form.diagnostics.battery_health === bat
                          ? 'border-[#00a896] bg-teal-50 text-[#00a896] ring-2 ring-[#00a896]/20 shadow-xs'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-[#00a896] hover:bg-teal-50/40 hover:scale-102'
                      }`}
                    >
                      {bat}
                    </button>
                  ))}
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
                        className={`rounded-full px-4 py-2 text-xs font-bold border transition-all duration-200 active:scale-95 cursor-pointer ${
                          isSel
                            ? 'border-[#00a896] bg-[#00a896] text-white shadow-md shadow-teal-500/20 scale-105'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-[#00a896] hover:bg-teal-50/50 hover:shadow-xs hover:scale-102'
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
                  Continue to IMEI & Photos <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: IMEI Verification & Multi-Angle Photos */}
        {step === 3 && (
          <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <div className="card p-6 md:p-8 rounded-[28px]">
              <div className="flex items-center justify-between border-b border-ink-100 pb-4">
                <div>
                  <span className="badge bg-brand-50 text-brand-700">Step 3 of 5</span>
                  <h2 className="mt-1 font-display text-xl font-extrabold text-ink-900">
                    IMEI Verification & Device Photos
                  </h2>
                  <p className="text-xs text-ink-500">
                    Required to verify authenticity and guarantee maximum instant cash payout.
                  </p>
                </div>
              </div>

              {/* IMEI Input & Helper */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="label flex items-center gap-1.5 font-bold text-ink-900">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" /> 15-Digit IMEI Number
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowImeiGuide(!showImeiGuide)}
                    className="text-xs text-brand-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <HelpCircle className="h-3.5 w-3.5" /> How to find IMEI?
                  </button>
                </div>

                {showImeiGuide && (
                  <div className="p-3.5 rounded-2xl bg-brand-50 border border-brand-200 text-xs text-brand-900 space-y-1 animate-fade-in">
                    <p className="font-bold">⚡ Quick Steps to Find Your IMEI:</p>
                    <p>1. Open your phone dialer app.</p>
                    <p>2. Dial <strong className="font-mono bg-white px-1.5 py-0.5 rounded text-brand-800">*#06#</strong>.</p>
                    <p>3. Your 15-digit IMEI number will pop up on your screen. Enter it below.</p>
                  </div>
                )}

                <div className="relative">
                  <input
                    type="text"
                    maxLength={15}
                    value={form.imei}
                    onChange={(e) => setForm({ ...form, imei: e.target.value.replace(/\D/g, '') })}
                    placeholder="Enter 15-digit IMEI number (e.g. 356984123456789)"
                    className={`input font-mono text-sm tracking-wider pl-4 pr-24 ${
                      isImeiValid ? 'border-emerald-500 focus:border-emerald-600' : ''
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {isImeiValid ? (
                      <span className="badge bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                        <Check className="h-3 w-3" /> 15-Digit Valid
                      </span>
                    ) : (
                      <span className="text-[11px] text-ink-400 font-mono">
                        {form.imei.length}/15
                      </span>
                    )}
                  </div>
                </div>

                {/* Optional IMEI Screenshot Upload */}
                <div className="mt-2 flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-dashed border-ink-300 text-xs text-ink-600 hover:border-brand-500 hover:bg-brand-50/50 transition">
                    <Upload className="h-3.5 w-3.5 text-brand-600" />
                    <span>Upload *#06# Screenshot / Box Sticker</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handlePhotoUpload('imei', e.target.files?.[0] || null)}
                    />
                  </label>
                  {form.imeiPhoto && (
                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Photo Attached
                    </span>
                  )}
                </div>
              </div>

              {/* 4 Multi-Angle Device Photos */}
              <div className="mt-8 space-y-4 pt-6 border-t border-ink-100">
                <div>
                  <label className="label flex items-center gap-2">
                    <Camera className="h-4 w-4 text-brand-600" /> Upload Device Condition Photos
                  </label>
                  <p className="text-xs text-ink-500">
                    Clear photos help our Lucknow dispatch team pre-approve your full valuation.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: 'front' as const, label: '1. Front (Display Turned ON)', desc: 'Shows screen works, no lines/spots' },
                    { key: 'back' as const, label: '2. Back Panel & Cameras', desc: 'Shows rear glass & camera lenses' },
                    { key: 'edges' as const, label: '3. Side Frame & Edges', desc: 'Shows side body scuffs / dents' },
                    { key: 'bill_box' as const, label: '4. Bill / Box / Accessories', desc: 'Bonus verification proof' },
                  ].map(({ key, label, desc }) => {
                    const currentImg = form.devicePhotos[key];
                    return (
                      <div
                        key={key}
                        className={`p-4 rounded-2xl border transition-all ${
                          currentImg ? 'border-emerald-400 bg-emerald-50/30' : 'border-dashed border-ink-300 bg-ink-50/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-bold text-xs text-ink-900">{label}</p>
                          {currentImg && <Check className="h-4 w-4 text-emerald-600" />}
                        </div>
                        <p className="text-[11px] text-ink-500 mb-3">{desc}</p>

                        {currentImg ? (
                          <div className="relative group rounded-xl overflow-hidden border border-ink-200 bg-white">
                            <img src={currentImg} alt={label} className="h-32 w-full object-cover" />
                            <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold cursor-pointer transition">
                              Change Photo
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handlePhotoUpload(key, e.target.files?.[0] || null)}
                              />
                            </label>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center p-6 rounded-xl border border-dashed border-ink-300 bg-white hover:border-brand-500 hover:bg-brand-50/40 cursor-pointer transition">
                            <Camera className="h-6 w-6 text-ink-400" />
                            <span className="mt-1.5 text-xs font-bold text-brand-600">Tap to Upload</span>
                            <span className="text-[10px] text-ink-400">JPG, PNG up to 5MB</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handlePhotoUpload(key, e.target.files?.[0] || null)}
                            />
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8 flex justify-between gap-3 pt-4 border-t border-ink-100">
                <button type="button" onClick={() => setStep(2)} className="btn-outline text-sm">
                  Back
                </button>
                <button type="button" onClick={() => setStep(4)} className="btn-primary flex items-center gap-2">
                  View Instant Quote <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Instant Quote & Payout Method */}
        {step === 4 && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div className="card p-6 md:p-8 rounded-[28px] text-center">
              <span className="badge bg-emerald-50 text-emerald-700 font-extrabold uppercase tracking-wider">
                Pre-Approved Valuation · Lucknow
              </span>

              <h2 className="mt-3 font-display text-2xl font-black text-ink-900">
                {form.brand} {form.model} ({form.storage})
              </h2>
              <p className="text-xs text-ink-500">
                Condition: {form.condition} · IMEI: {form.imei || 'Doorstep verified'}
              </p>

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
                    <Lock className="h-3.5 w-3.5" /> 100% Data Wipe Guaranteed
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

                {form.payoutMethod === 'UPI' && (
                  <div className="mt-3">
                    <label className="label text-xs">UPI ID / Phone Number (Optional)</label>
                    <input
                      type="text"
                      value={form.payoutDetails}
                      onChange={(e) => setForm({ ...form, payoutDetails: e.target.value })}
                      placeholder="e.g. yourname@oksbi or 98390XXXXX"
                      className="input mt-1 text-xs"
                    />
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-between gap-3 pt-4 border-t border-ink-100">
                <button type="button" onClick={() => setStep(3)} className="btn-outline text-sm">
                  Back
                </button>
                <button type="button" onClick={() => setStep(5)} className="btn-primary flex items-center gap-2">
                  Schedule Pickup <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Schedule Doorstep Pickup & Auto-Assign Agent */}
        {step === 5 && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div className="card p-6 md:p-8 rounded-[28px]">
              <div className="flex items-center justify-between border-b border-ink-100 pb-4">
                <div>
                  <span className="badge bg-brand-50 text-brand-700">Step 5 of 5</span>
                  <h2 className="mt-1 font-display text-xl font-extrabold text-ink-900">
                    Schedule Lucknow Doorstep Pickup
                  </h2>
                  <p className="text-xs text-ink-500">
                    Guaranteed Payout: <span className="font-extrabold text-emerald-700">{formatINR(estimate)}</span> ({form.payoutMethod})
                  </p>
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-xl bg-accent-50 border border-accent-200 p-3 text-xs text-accent-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                </div>
              )}

              <div className="mt-6 space-y-4">
                <div>
                  <label className="label">Select Lucknow Locality / Cluster</label>
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
                  <p className="mt-1 text-[11px] text-ink-400">
                    Our dispatch algorithm assigns the nearest available Lucknow field agent for your locality.
                  </p>
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
                  <label className="label">Special Instructions / Gate Passcode (Optional)</label>
                  <input
                    type="text"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="e.g. Call 10 mins before arrival, Landmark near Sahara Ganj"
                    className="input mt-1"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-between gap-3 pt-4 border-t border-ink-100">
                <button type="button" onClick={() => setStep(4)} className="btn-outline text-sm">
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || !form.pickupAddress.trim()}
                  className="btn-primary text-sm flex items-center gap-2"
                >
                  {submitting ? 'Auto-Assigning Agent...' : 'Confirm Pickup Booking'} <CheckCircle2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FAQs */}
        <section className="mt-16 card p-8 rounded-[32px]">
          <div className="text-center max-w-xl mx-auto">
            <span className="badge bg-brand-50 text-brand-700">Clear Answers</span>
            <h2 className="mt-2 font-display text-2xl font-extrabold text-ink-900">Frequently Asked Questions</h2>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {FAQS.map((f) => (
              <div key={f.q} className="p-5 rounded-2xl border border-gray-200/90 bg-white hover:border-[#00a896] hover:bg-teal-50/20 hover:shadow-lg hover:shadow-teal-500/10 hover:-translate-y-1 transition-all duration-300">
                <p className="font-extrabold text-sm text-gray-900">{f.q}</p>
                <p className="mt-1.5 text-xs text-gray-600 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
