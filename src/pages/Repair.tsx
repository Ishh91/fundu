import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Wrench,
  Truck,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Search,
  Smartphone,
  Check,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Clock,
  Sparkles,
  Award,
  BatteryCharging,
  Monitor,
  Camera,
  Volume2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LUCKNOW_AREAS } from '../types';
import { db, formatINR } from '../lib/db';
import { fetchPhoneModels } from '../lib/mobileApi';

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

const REPAIR_ISSUES = [
  {
    id: 'screen',
    label: 'Screen / Display Replacement',
    icon: Monitor,
    desc: 'Glass cracked, touch unresponsive, or lines on screen',
    cost: 2999,
    warranty: '6 Months Warranty',
    time: '30 Mins Doorstep',
  },
  {
    id: 'battery',
    label: 'Battery Replacement',
    icon: BatteryCharging,
    desc: 'Fast draining, battery swelling, or phone heating',
    cost: 1499,
    warranty: '6 Months Warranty',
    time: '20 Mins Doorstep',
  },
  {
    id: 'charging',
    label: 'Charging Port Repair',
    icon: Zap,
    desc: 'Loose charger connection or slow charging speed',
    cost: 699,
    warranty: '3 Months Warranty',
    time: '25 Mins Doorstep',
  },
  {
    id: 'speaker',
    label: 'Mic & Speaker Repair',
    icon: Volume2,
    desc: 'No sound during calls, distorted audio, or mic mute',
    cost: 599,
    warranty: '3 Months Warranty',
    time: '20 Mins Doorstep',
  },
  {
    id: 'camera',
    label: 'Camera Lens Repair',
    icon: Camera,
    desc: 'Blurry photos, broken camera glass, or focus issue',
    cost: 1299,
    warranty: '6 Months Warranty',
    time: '30 Mins Doorstep',
  },
  {
    id: 'backglass',
    label: 'Back Glass Repair',
    icon: Smartphone,
    desc: 'Shattered or cracked rear glass panel',
    cost: 1199,
    warranty: '3 Months Warranty',
    time: '40 Mins Doorstep',
  },
  {
    id: 'motherboard',
    label: 'Water Damage & Diagnostics',
    icon: Wrench,
    desc: 'Phone won\'t turn on or dropped in water',
    cost: 499,
    warranty: 'Inspection & Quote',
    time: '24 Hr Lab Repair',
  },
];

const POPULAR_REPAIR_MODELS = [
  { brand: 'Apple', model: 'iPhone 13', price: 2999, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Apple', model: 'iPhone 14', price: 3499, image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Samsung', model: 'Galaxy S22', price: 2499, image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300&auto=format&fit=crop&q=80' },
  { brand: 'OnePlus', model: 'OnePlus 11', price: 2199, image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Google', model: 'Pixel 7', price: 1999, image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Xiaomi', model: 'Redmi Note 13 Pro', price: 1299, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format&fit=crop&q=80' },
];

const REPAIR_FAQS = [
  { q: 'How does doorstep mobile repair work in Lucknow?', a: 'Once you book, our certified technician comes to your home or office in Lucknow at your preferred time slot, brings genuine spare parts, and repairs your mobile phone right in front of you in 30 minutes!' },
  { q: 'Do I get a warranty on repaired mobile spare parts?', a: 'Yes! All screen, battery, and camera replacements come with up to 6 months of Fundu warranty. If any issue occurs, we replace the part free of charge.' },
  { q: 'Is my personal data safe during repair?', a: 'Absolutely 100% safe. Since the technician repairs your phone right in front of your eyes at your doorstep, you do not need to share passwords or hand over your unlocked device to anyone.' },
  { q: 'When do I pay for the repair service?', a: 'You pay ONLY AFTER the repair is completed and you have tested your phone. Payment can be made via cash, UPI (GPay/PhonePe/Paytm), or card at your doorstep.' },
];

export default function Repair() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIssueId, setSelectedIssueId] = useState<string>('screen');
  const [form, setForm] = useState({
    brand: '',
    model: '',
    storage: '',
    problemDetail: '',
    pickupAddress: '',
    pickupArea: LUCKNOW_AREAS[0] || 'Gomti Nagar',
    pickupDate: new Date().toISOString().split('T')[0],
    pickupSlot: '10 AM - 12 PM',
  });

  const [modelsList, setModelsList] = useState<Array<{ name: string; storages: string[] }>>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackingId, setTrackingId] = useState<string>('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const selectedIssue = REPAIR_ISSUES.find((i) => i.id === selectedIssueId) ?? REPAIR_ISSUES[0];

  useEffect(() => {
    const b = searchParams.get('brand');
    const m = searchParams.get('model');
    if (b || m) {
      setForm((cur) => ({
        ...cur,
        brand: b ?? cur.brand,
        model: m ?? cur.model,
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

  const handleBrandSelect = (brandName: string) => {
    setForm((f) => ({ ...f, brand: brandName, model: '' }));
  };

  const handleQuickModelSelect = (item: typeof POPULAR_REPAIR_MODELS[0]) => {
    setForm((f) => ({
      ...f,
      brand: item.brand,
      model: item.model,
    }));
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!user) {
      navigate('/login?redirect=/repair');
      return;
    }
    setSubmitting(true);
    setError(null);

    const { data, error: reqErr } = await db
      .from<{ tracking_id: string }>('repair_bookings')
      .insert({
        brand: form.brand,
        model: form.model,
        problem: selectedIssue?.label ?? 'General Repair',
        problem_detail: form.problemDetail || null,
        estimated_cost: selectedIssue?.cost ?? 1499,
        pickup_address: `${form.pickupAddress}, ${form.pickupArea}`,
        pickup_date: form.pickupDate || null,
        pickup_slot: form.pickupSlot || null,
      })
      .select()
      .single();

    setSubmitting(false);
    if (reqErr) {
      setError(reqErr.message);
      return;
    }
    setTrackingId(data?.tracking_id ?? '');
    setStep(5); // Confirmation Step
  };

  if (step === 5) {
    return (
      <div className="min-h-screen bg-[#f4f7f8] py-16">
        <div className="container-page">
          <div className="max-w-xl mx-auto card p-8 md:p-10 text-center rounded-[32px] shadow-soft border border-[#dce5e8]">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <span className="mt-4 inline-block rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Technician Slot Reserved
            </span>
            <h2 className="mt-2 font-display text-3xl font-black text-ink-900">
              Doorstep Repair Booked!
            </h2>
            <p className="mt-3 text-sm text-ink-600 leading-relaxed">
              Our technician will visit <span className="font-bold text-ink-900">{form.pickupArea}, Lucknow</span> on <span className="font-bold text-ink-900">{form.pickupDate} ({form.pickupSlot})</span> with genuine parts for your <span className="font-bold text-ink-900">{form.brand} {form.model}</span>.
            </p>

            <div className="mt-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white shadow-md text-left">
              <div className="flex justify-between items-center border-b border-white/20 pb-3">
                <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider">Repair Tracking ID</span>
                <span className="font-mono text-sm font-black text-white">{trackingId}</span>
              </div>
              <div className="mt-3 space-y-1 text-xs text-white/90">
                <p><span className="font-bold text-white">Repair Issue:</span> {selectedIssue?.label}</p>
                <p><span className="font-bold text-white">Upfront Price:</span> {formatINR(selectedIssue?.cost ?? 0)} (Pay after testing)</p>
                <p><span className="font-bold text-white">Warranty:</span> 6 Months Parts Warranty</p>
              </div>
            </div>

            <div className="mt-8 flex justify-center gap-3">
              <button onClick={() => navigate('/dashboard')} className="btn-primary">
                Track My Repair
              </button>
              <button onClick={() => { setStep(1); setSelectedIssueId('screen'); }} className="btn-outline">
                Book Another Repair
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7f8] pb-24">
      {/* Cashify Top Search & Header */}
      <section className="bg-white border-b border-[#e5ecef] py-8">
        <div className="container-page">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                <Wrench className="h-3.5 w-3.5 text-emerald-600" /> 30-Minute Doorstep Mobile Repair
              </div>
              <h1 className="mt-2 font-display text-2xl md:text-4xl font-extrabold text-ink-900">
                Mobile Repair at Your Doorstep in Lucknow
              </h1>
              <p className="mt-1 text-sm text-ink-500">
                Screen, battery & hardware fixed at your home in 30 mins · 6 Months Warranty · Pay after testing
              </p>
            </div>

            {/* Quick Model Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search mobile model for repair..."
                className="input pl-10 pr-4 py-2.5 rounded-full border-ink-200 text-sm shadow-sm focus:border-brand-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* STANDALONE STICKY 4-STEP PROGRESS TRACKER BAR */}
      <div className="sticky top-[60px] md:top-[108px] z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-md py-3 px-4 transition-all">
        <div className="flex items-center justify-center flex-wrap sm:flex-nowrap gap-2 sm:gap-4 max-w-4xl mx-auto overflow-x-auto scrollbar-hide no-scrollbar py-1">
          {[
            { s: 1, label: 'Select Phone' },
            { s: 2, label: 'Select Issue' },
            { s: 3, label: 'Upfront Quote' },
            { s: 4, label: 'Doorstep Booking' },
          ].map(({ s, label }) => (
            <div key={s} className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => step > s && setStep(s)}
                className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${
                  step === s
                    ? 'bg-[#00a896] text-white shadow-sm'
                    : step > s
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 cursor-pointer'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span className="grid h-5 w-5 place-items-center rounded-full bg-white/25 text-xs font-black">
                  {step > s ? <Check className="h-3.5 w-3.5" /> : s}
                </span>
                <span className="whitespace-nowrap font-extrabold">{label}</span>
              </button>
              {s < 4 && <div className={`h-0.5 w-3 sm:w-6 rounded-full ${step > s ? 'bg-emerald-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Main Container */}
      <div className="container-page mt-8">
        {step === 1 && (
          <div className="space-y-8 animate-fade-in">
            {/* Brand Selection Cards */}
            <div className="card p-6 md:p-8 rounded-[28px]">
              <h2 className="font-display text-xl font-extrabold text-ink-900 flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-brand-600" /> Select Phone Brand to Repair
              </h2>
              <p className="mt-1 text-xs text-ink-500">Pick your phone manufacturer to view repair costs</p>

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

            {/* Model Selector */}
            {form.brand && (
              <div className="card p-6 md:p-8 rounded-[28px] space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="badge bg-brand-50 text-brand-700">Selected Brand: {form.brand}</span>
                    <h3 className="mt-2 font-display text-xl font-extrabold text-ink-900">Select Exact Model</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, brand: '', model: '' }))}
                    className="text-xs text-brand-600 hover:underline font-semibold"
                  >
                    Change Brand
                  </button>
                </div>

                <div>
                  <label className="label">Select Model</label>
                  <select
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    className="input max-w-md"
                  >
                    <option value="">{loadingModels ? 'Fetching models from API...' : 'Select phone model'}</option>
                    {modelsList.map((m) => (
                      <option key={m.name} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                {form.brand && form.model && (
                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="btn-primary flex items-center gap-2"
                    >
                      Select Repair Issue <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Popular Repair Models Grid */}
            <div className="card p-6 md:p-8 rounded-[28px]">
              <h3 className="font-display text-lg font-bold text-ink-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brand-600" /> Frequently Repaired Phones in Lucknow
              </h3>
              <p className="mt-0.5 text-xs text-ink-500">Tap model for instant repair pricing</p>

              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {POPULAR_REPAIR_MODELS.map((item) => (
                  <button
                    key={item.model}
                    type="button"
                    onClick={() => handleQuickModelSelect(item)}
                    className="flex flex-col items-center p-3 rounded-2xl border border-ink-100 bg-white hover:border-brand-400 hover:shadow-md transition text-center"
                  >
                    <img src={item.image} alt={item.model} className="h-20 w-20 object-contain rounded-lg" />
                    <p className="mt-2 text-xs font-bold text-ink-900 truncate w-full">{item.model}</p>
                    <span className="mt-1.5 badge bg-emerald-50 text-emerald-700 font-extrabold">
                      Repairs from {formatINR(item.price)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <div className="card p-6 md:p-8 rounded-[28px]">
              <div className="flex items-center justify-between border-b border-ink-100 pb-4">
                <div>
                  <span className="badge bg-brand-50 text-brand-700">Step 2 of 4</span>
                  <h2 className="mt-1 font-display text-xl font-extrabold text-ink-900">
                    Select Mobile Repair Issue
                  </h2>
                  <p className="text-xs text-ink-500">
                    Device: <span className="font-bold text-ink-900">{form.brand} {form.model}</span>
                  </p>
                </div>
                <button type="button" onClick={() => setStep(1)} className="text-xs text-brand-600 font-bold hover:underline">
                  Change Phone
                </button>
              </div>

              {/* Repair Issues Grid */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {REPAIR_ISSUES.map((issue) => {
                  const IconComp = issue.icon;
                  const isSelected = selectedIssueId === issue.id;

                  return (
                    <button
                      key={issue.id}
                      type="button"
                      onClick={() => setSelectedIssueId(issue.id)}
                      className={`p-5 rounded-2xl border text-left flex items-start gap-4 transition ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50/80 shadow-md ring-2 ring-brand-500/20'
                          : 'border-ink-200 bg-white hover:border-brand-300'
                      }`}
                    >
                      <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${isSelected ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-600'}`}>
                        <IconComp className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-sm text-ink-900">{issue.label}</p>
                          <span className="font-display font-black text-brand-700 text-base">{formatINR(issue.cost)}</span>
                        </div>
                        <p className="mt-1 text-xs text-ink-500 leading-relaxed">{issue.desc}</p>
                        <div className="mt-3 flex items-center gap-3 text-[10px] font-bold text-emerald-700">
                          <span className="badge bg-emerald-50 text-emerald-700">{issue.warranty}</span>
                          <span className="badge bg-brand-50 text-brand-700">{issue.time}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6">
                <label className="label">Additional Problem Notes (Optional)</label>
                <input
                  type="text"
                  value={form.problemDetail}
                  onChange={(e) => setForm({ ...form, problemDetail: e.target.value })}
                  placeholder="Describe specific issue e.g. lines on display, mic echo..."
                  className="input mt-1"
                />
              </div>

              <div className="mt-8 flex justify-between gap-3 pt-4 border-t border-ink-100">
                <button type="button" onClick={() => setStep(1)} className="btn-outline text-sm">
                  Back
                </button>
                <button type="button" onClick={() => setStep(3)} className="btn-primary flex items-center gap-2">
                  View Upfront Quote & Guarantees <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div className="card p-6 md:p-8 rounded-[28px] text-center">
              <span className="badge bg-emerald-50 text-emerald-700 font-extrabold uppercase tracking-wider">
                Upfront Repair Estimate
              </span>

              <h2 className="mt-3 font-display text-2xl font-black text-ink-900">
                {form.brand} {form.model}
              </h2>
              <p className="text-xs text-ink-500">Selected Repair: <span className="font-bold text-ink-900">{selectedIssue?.label}</span></p>

              {/* Cashify Upfront Quote Box */}
              <div className="mt-6 rounded-3xl bg-gradient-to-r from-[#0a1b1d] via-[#11292d] to-[#0a1b1d] p-8 text-white shadow-xl relative overflow-hidden">
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Total Upfront Repair Price (Incl. Parts & Labor)</p>
                <div className="mt-2 font-display text-4xl sm:text-5xl font-black text-white">
                  {formatINR(selectedIssue?.cost ?? 0)}
                </div>
                <p className="mt-2 text-xs text-white/70">No hidden fees · Pay only after testing your phone</p>

                {/* Repair Guarantees Pills */}
                <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs font-semibold">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 backdrop-blur-md text-emerald-300">
                    <ShieldCheck className="h-3.5 w-3.5" /> 6 Months Parts Warranty
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 backdrop-blur-md text-emerald-300">
                    <Clock className="h-3.5 w-3.5" /> 30-Min On-Spot Fix
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 backdrop-blur-md text-emerald-300">
                    <Truck className="h-3.5 w-3.5" /> Free Doorstep Visit in Lucknow
                  </span>
                </div>
              </div>

              <div className="mt-8 flex justify-between gap-3 pt-4 border-t border-ink-100">
                <button type="button" onClick={() => setStep(2)} className="btn-outline text-sm">
                  Change Issue
                </button>
                <button type="button" onClick={() => setStep(4)} className="btn-primary flex items-center gap-2">
                  Schedule Doorstep Booking <ArrowRight className="h-4 w-4" />
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
                    Schedule Lucknow Doorstep Repair
                  </h2>
                  <p className="text-xs text-ink-500">
                    Device: <span className="font-bold text-ink-900">{form.brand} {form.model}</span> ({selectedIssue?.label})
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
                  <label className="label">Lucknow Repair Area / Locality</label>
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
                  <label className="label">Full Doorstep Address</label>
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
                    <label className="label">Preferred Repair Date</label>
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
                  {submitting ? 'Booking Repair...' : 'Confirm Doorstep Repair Booking'} <CheckCircle2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* How Doorstep Repair Works Section */}
        <section className="mt-16 card p-8 rounded-[32px]">
          <div className="text-center max-w-xl mx-auto">
            <span className="badge bg-brand-50 text-brand-700">Convenient Doorstep Service</span>
            <h2 className="mt-2 font-display text-2xl font-extrabold text-ink-900">How Doorstep Repair Works</h2>
            <p className="mt-1 text-xs text-ink-500">Get your phone fixed at home in Lucknow in 3 simple steps</p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-6 rounded-2xl bg-[#f8fafb] border border-ink-100">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-white font-black text-lg">
                1
              </div>
              <h3 className="mt-4 font-bold text-ink-900 text-base">Select Model & Issue</h3>
              <p className="mt-2 text-xs text-ink-500 leading-relaxed">
                Choose your phone model and repair problem (Screen, Battery, Port) to get an upfront quote.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#f8fafb] border border-ink-100">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-white font-black text-lg">
                2
              </div>
              <h3 className="mt-4 font-bold text-ink-900 text-base">Technician Visits Doorstep</h3>
              <p className="mt-2 text-xs text-ink-500 leading-relaxed">
                Our certified technician visits your home in Lucknow at your selected time slot with genuine spare parts.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#f8fafb] border border-ink-100">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-white font-black text-lg">
                3
              </div>
              <h3 className="mt-4 font-bold text-ink-900 text-base">Fixed in 30 Mins & Pay</h3>
              <p className="mt-2 text-xs text-ink-500 leading-relaxed">
                Your phone is repaired right in front of you. Test your phone and pay via Cash or UPI on spot!
              </p>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="mt-8 card p-8 rounded-[32px]">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="font-display text-2xl font-extrabold text-ink-900">Why Choose Fundu Doorstep Repair?</h2>
            <p className="mt-1 text-xs text-ink-500">Lucknow's highest-rated mobile repair service</p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl border border-ink-100 bg-white">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h4 className="mt-3 font-bold text-ink-900 text-sm">6 Months Warranty</h4>
              <p className="mt-1 text-xs text-ink-500">All replaced screens, batteries, and parts come with 6-month warranty.</p>
            </div>

            <div className="p-5 rounded-2xl border border-ink-100 bg-white">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-100 text-brand-700">
                <Award className="h-5 w-5" />
              </div>
              <h4 className="mt-3 font-bold text-ink-900 text-sm">Grade A Spare Parts</h4>
              <p className="mt-1 text-xs text-ink-500">Only 100% original spec displays and OEM quality batteries used.</p>
            </div>

            <div className="p-5 rounded-2xl border border-ink-100 bg-white">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-weather-100 text-weather-700">
                <Zap className="h-5 w-5" />
              </div>
              <h4 className="mt-3 font-bold text-ink-900 text-sm">Zero Data Risk</h4>
              <p className="mt-1 text-xs text-ink-500">Repair happens in front of your eyes. No need to share passwords.</p>
            </div>

            <div className="p-5 rounded-2xl border border-ink-100 bg-white">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-nature-100 text-nature-700">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h4 className="mt-3 font-bold text-ink-900 text-sm">Pay After Testing</h4>
              <p className="mt-1 text-xs text-ink-500">Pay only after checking that your repaired phone works 100% fine.</p>
            </div>
          </div>
        </section>

        {/* FAQs Section */}
        <section className="mt-8 card p-8 rounded-[32px]">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-brand-600" />
            <h2 className="font-display text-xl font-extrabold text-ink-900">Repair Frequently Asked Questions</h2>
          </div>

          <div className="mt-6 space-y-3">
            {REPAIR_FAQS.map((faq, idx) => {
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
