import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getCleanPhoneImage } from '../lib/phoneImages';
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
  Cpu,
  Wifi,
  ScanFace,
  Vibrate,
  SlidersHorizontal,
  X,
  Lock,
  FileCode,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LUCKNOW_AREAS } from '../types';
import { db, formatINR } from '../lib/db';
import { fetchPhoneModels, searchMobileApiDev } from '../lib/mobileApi';

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
    label: 'Screen & Display Replacement',
    icon: Monitor,
    desc: 'Cracked glass, touch dead, black screen, OLED lines or flickering',
    cost: 2999,
    warranty: '6 Months Warranty',
    time: '30 Mins Doorstep',
  },
  {
    id: 'battery',
    label: 'Battery Replacement & Health Check',
    icon: BatteryCharging,
    desc: 'Fast draining, battery swelling, phone heating, health < 75%',
    cost: 1499,
    warranty: '6 Months Warranty',
    time: '20 Mins Doorstep',
  },
  {
    id: 'charging',
    label: 'Charging Port & Sub-board IC',
    icon: Zap,
    desc: 'Loose charger connection, slow charging, port liquid detected',
    cost: 699,
    warranty: '3 Months Warranty',
    time: '25 Mins Doorstep',
  },
  {
    id: 'speaker',
    label: 'Mic, Receiver & Speaker Repair',
    icon: Volume2,
    desc: 'No sound on calls, muted microphone, crackling speaker audio',
    cost: 599,
    warranty: '3 Months Warranty',
    time: '20 Mins Doorstep',
  },
  {
    id: 'camera',
    label: 'Front & Rear Camera Repair',
    icon: Camera,
    desc: 'Blurry camera focus, cracked glass lens, camera app black screen',
    cost: 1299,
    warranty: '6 Months Warranty',
    time: '30 Mins Doorstep',
  },
  {
    id: 'backglass',
    label: 'Back Glass & Body Chassis Replacement',
    icon: Smartphone,
    desc: 'Shattered rear glass panel, bended metal frame, loose back cover',
    cost: 1199,
    warranty: '3 Months Warranty',
    time: '40 Mins Doorstep',
  },
  {
    id: 'motherboard',
    label: 'Water Damage & Motherboard IC Repair',
    icon: Cpu,
    desc: 'Dead phone, liquid/water damage, power IC short circuit diagnostics',
    cost: 499,
    warranty: 'Lab Diagnostics',
    time: '24 Hr Lab Repair',
  },
  {
    id: 'software',
    label: 'Software Recovery & OS Flashing',
    icon: FileCode,
    desc: 'Stuck on Apple/Android logo, boot loop error, pattern/PIN unlock',
    cost: 399,
    warranty: 'Data Safe Protocol',
    time: '20 Mins Doorstep',
  },
  {
    id: 'buttons',
    label: 'Power, Volume & Fingerprint Sensor',
    icon: SlidersHorizontal,
    desc: 'Stuck power button, volume keys not working, Touch ID sensor',
    cost: 499,
    warranty: '3 Months Warranty',
    time: '25 Mins Doorstep',
  },
  {
    id: 'faceid',
    label: 'Face ID & TrueDepth Sensor Repair',
    icon: ScanFace,
    desc: 'Face ID disabled error, TrueDepth camera alignment, proximity sensor',
    cost: 1499,
    warranty: '6 Months Warranty',
    time: '45 Mins Doorstep',
  },
  {
    id: 'network',
    label: 'Network, SIM & Wi-Fi IC Repair',
    icon: Wifi,
    desc: 'No SIM signal / searching, grayed out Wi-Fi / Bluetooth toggle',
    cost: 1199,
    warranty: '3 Months Warranty',
    time: '45 Mins Doorstep',
  },
  {
    id: 'haptics',
    label: 'Vibration Motor & Taptic Engine',
    icon: Vibrate,
    desc: 'No vibration alerts during calls, haptic feedback engine failure',
    cost: 399,
    warranty: '3 Months Warranty',
    time: '20 Mins Doorstep',
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
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const stepFromUrl = parseInt(searchParams.get('step') || '1', 10);
  const step = isNaN(stepFromUrl) || stepFromUrl < 1 || stepFromUrl > 5 ? 1 : stepFromUrl;

  const modelSectionRef = useRef<HTMLDivElement>(null);

  const [selectedIssueIds, setSelectedIssueIds] = useState<string[]>(['screen']);

  const selectedIssues = useMemo(() => {
    const list = REPAIR_ISSUES.filter((i) => selectedIssueIds.includes(i.id));
    return list.length > 0 ? list : [REPAIR_ISSUES[0]];
  }, [selectedIssueIds]);

  const totalRepairCost = useMemo(() => {
    return selectedIssues.reduce((sum, item) => sum + (item.cost || 0), 0);
  }, [selectedIssues]);

  const combinedProblemLabel = useMemo(() => {
    return selectedIssues.map((i) => i.label).join(' + ');
  }, [selectedIssues]);

  const toggleIssueSelection = (issueId: string) => {
    setSelectedIssueIds((prev) => {
      if (prev.includes(issueId)) {
        if (prev.length === 1) return prev; // Keep at least 1 issue selected
        return prev.filter((id) => id !== issueId);
      } else {
        return [...prev, issueId];
      }
    });
  };

  const goToStep = (nextStep: number, extraParams: Record<string, string> = {}) => {
    const newParams = new URLSearchParams();
    newParams.set('step', String(nextStep));
    const targetBrand = extraParams.brand || form.brand;
    const targetModel = extraParams.model || form.model;
    const targetIssue = extraParams.issue || selectedIssueIds.join(',');
    const targetTracking = extraParams.trackingId || trackingId;

    if (targetBrand) newParams.set('brand', targetBrand);
    if (targetModel) newParams.set('model', targetModel);
    if (targetIssue) newParams.set('issue', targetIssue);
    if (targetTracking) newParams.set('trackingId', targetTracking);

    Object.entries(extraParams).forEach(([k, v]) => {
      if (v) newParams.set(k, v);
    });
    window.scrollTo({ top: 120, behavior: 'smooth' });
    navigate(`/repair?${newParams.toString()}`);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [liveSearchResults, setLiveSearchResults] = useState<Array<{ brand: string; model: string }>>([]);
  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

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
  const [modelFilter, setModelFilter] = useState('');
  const [loadingModels, setLoadingModels] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackingId, setTrackingId] = useState<string>('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const selectedIssue = selectedIssues[0];

  const filteredModelsList = useMemo(() => {
    if (!modelFilter.trim()) return modelsList;
    const q = modelFilter.toLowerCase().trim();
    return modelsList.filter((m) => m.name.toLowerCase().includes(q));
  }, [modelsList, modelFilter]);

  // Sync params from URL subpage routing
  useEffect(() => {
    const b = searchParams.get('brand');
    const m = searchParams.get('model');
    const issue = searchParams.get('issue');
    const tid = searchParams.get('trackingId');

    if (b || m) {
      setForm((cur) => ({
        ...cur,
        brand: b ?? cur.brand,
        model: m ?? cur.model,
      }));
    }
    if (issue) {
      const parsedIds = issue.split(',').filter((id) => REPAIR_ISSUES.some((r) => r.id === id));
      if (parsedIds.length > 0) {
        setSelectedIssueIds(parsedIds);
      }
    }
    if (tid) {
      setTrackingId(tid);
    }
  }, [searchParams]);

  // Live Mobile Device Search Effect across all 31,500+ phones
  useEffect(() => {
    if (!searchQuery.trim()) {
      setLiveSearchResults([]);
      setSearchOpen(false);
      return;
    }

    setIsSearchingLive(true);
    setSearchOpen(true);
    const q = searchQuery.toLowerCase().trim();

    searchMobileApiDev(searchQuery)
      .then((results) => {
        const items = results.map((r: any) => ({ brand: r.brand, model: r.model }));
        if (items.length > 0) {
          setLiveSearchResults(items.slice(0, 8));
        } else {
          const fallback = POPULAR_REPAIR_MODELS.filter((m) =>
            `${m.brand} ${m.model}`.toLowerCase().includes(q)
          ).map((m) => ({ brand: m.brand, model: m.model }));
          setLiveSearchResults(fallback);
        }
      })
      .catch(() => {
        const fallback = POPULAR_REPAIR_MODELS.filter((m) =>
          `${m.brand} ${m.model}`.toLowerCase().includes(q)
        ).map((m) => ({ brand: m.brand, model: m.model }));
        setLiveSearchResults(fallback);
      })
      .finally(() => setIsSearchingLive(false));
  }, [searchQuery]);

  const handleSelectPhoneForRepair = (brandName: string, modelName: string) => {
    setForm((f) => ({ ...f, brand: brandName, model: modelName }));
    setSearchQuery('');
    setSearchOpen(false);
    goToStep(2, { brand: brandName, model: modelName });
  };

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
    window.scrollTo({ top: 120, behavior: 'smooth' });
    navigate(`/repair?brand=${encodeURIComponent(brandName)}&step=1`);
  };

  const handleQuickModelSelect = (item: typeof POPULAR_REPAIR_MODELS[0]) => {
    setForm((f) => ({
      ...f,
      brand: item.brand,
      model: item.model,
    }));
    goToStep(2, { brand: item.brand, model: item.model });
  };

  const handleSubmit = async () => {
    if (!user) {
      navigate('/login?redirect=/repair');
      return;
    }

    if (profile && profile.role !== 'customer') {
      setError(`Access Restricted: You are logged in as ${profile.role.toUpperCase()}. Vendor, Delivery, and Admin accounts cannot book customer repair services.`);
      return;
    }

    setSubmitting(true);
    setError(null);

    const { data, error: reqErr } = await db
      .from<{ tracking_id: string }>('repair_bookings')
      .insert({
        user_id: user.id,
        customer_name: profile?.full_name || null,
        customer_phone: profile?.phone || null,
        customer_email: user?.email || null,
        brand: form.brand,
        model: form.model,
        problem: combinedProblemLabel || 'General Repair',
        problem_detail: form.problemDetail || null,
        estimated_cost: totalRepairCost || 1499,
        pickup_address: form.pickupAddress,
        pickup_area: form.pickupArea,
        pickup_date: form.pickupDate || null,
        pickup_slot: form.pickupSlot || null,
        status: 'pending',
      })
      .select()
      .single();

    setSubmitting(false);
    if (reqErr) {
      setError(reqErr.message);
      return;
    }
    setTrackingId(data?.tracking_id ?? '');
    goToStep(5, { trackingId: data?.tracking_id ?? '' }); // Confirmation Step
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
              <button onClick={() => { goToStep(1); setSelectedIssueId('screen'); }} className="btn-outline">
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

            {/* Live Autocomplete Model Search across all 31,500+ phones */}
            <div className="relative w-full md:w-96">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => searchQuery.trim() && setSearchOpen(true)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search any phone model (e.g. iPhone 15, S24, Pixel 8)..."
                  className="input pl-10 pr-9 py-2.5 rounded-full border-ink-200 text-xs sm:text-sm shadow-sm focus:border-[#00a896] bg-white font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setSearchOpen(false); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Autocomplete Results Dropdown */}
              {searchOpen && searchQuery.trim() && (
                <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-gray-200 bg-white p-3 shadow-2xl z-50 animate-fade-in max-h-80 overflow-y-auto">
                  {isSearchingLive ? (
                    <div className="p-4 text-center text-xs font-bold text-teal-700 flex items-center justify-center gap-2">
                      <Sparkles className="h-4 w-4 animate-spin text-[#00a896]" /> Searching all phones in catalog...
                    </div>
                  ) : liveSearchResults.length > 0 ? (
                    <div className="space-y-1">
                      <p className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                        Select Device to Repair
                      </p>
                      {liveSearchResults.map((phone, idx) => (
                        <button
                          key={`${phone.brand}-${phone.model}-${idx}`}
                          type="button"
                          onClick={() => handleSelectPhoneForRepair(phone.brand, phone.model)}
                          className="flex items-center justify-between w-full p-2.5 rounded-xl hover:bg-teal-50/80 transition text-left group border border-transparent hover:border-teal-200"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="grid h-8 w-8 place-items-center rounded-lg bg-teal-100/70 text-[#00a896]">
                              <Smartphone className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-900 group-hover:text-[#00a896]">
                                {phone.model}
                              </p>
                              <p className="text-[11px] text-gray-400 font-semibold">{phone.brand}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-extrabold text-[#00a896] bg-teal-100/60 px-2 py-1 rounded-md group-hover:bg-[#00a896] group-hover:text-white transition">
                            Select Issue →
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-gray-500">
                      No exact phone match found. Try typing brand or model name (e.g. <strong className="text-gray-800">Galaxy S24</strong>).
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* STANDALONE STICKY 4-STEP PROGRESS TRACKER BAR */}
      <div className="sticky top-[64px] md:top-[116px] z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-md py-3 px-4 transition-all">
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
                onClick={() => step > s && goToStep(s)}
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
            {form.brand ? (
              /* DEDICATED BRAND MODEL SELECTION ULTRA-PREMIUM SUBPAGE */
              <div ref={modelSectionRef} className="space-y-6 animate-fade-in">
                {/* Hero Banner Header */}
                <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-950 p-6 sm:p-8 text-white shadow-xl">
                  {/* Subtle Glowing Background Accents */}
                  <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-teal-500/20 blur-3xl pointer-events-none" />
                  <div className="absolute -left-10 -bottom-10 h-48 w-48 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start sm:items-center gap-4">
                      {BRAND_CARDS.find((b) => b.name.toLowerCase() === form.brand.toLowerCase())?.logo ? (
                        <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-white/10 backdrop-blur-md p-2.5 border border-white/20 flex items-center justify-center shrink-0 shadow-lg">
                          <img
                            src={BRAND_CARDS.find((b) => b.name.toLowerCase() === form.brand.toLowerCase())?.logo}
                            alt={form.brand}
                            className="h-full w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-white/10 backdrop-blur-md p-2.5 border border-white/20 flex items-center justify-center shrink-0 shadow-lg text-teal-400">
                          <Smartphone className="h-8 w-8" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="badge bg-teal-400/20 text-teal-300 border border-teal-400/30 text-xs font-bold px-3 py-1">
                            Official Doorstep Repair Catalog
                          </span>
                          <span className="badge bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold px-3 py-1">
                            6-Month Parts Guarantee
                          </span>
                        </div>
                        <h2 className="mt-2 font-display text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                          {form.brand} Repair Models
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                          Select your exact model below for instant upfront repair quotes and doorstep technician dispatch in Lucknow.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setForm((f) => ({ ...f, brand: '', model: '' }));
                        navigate('/repair?step=1');
                      }}
                      className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-extrabold text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md px-5 py-3 rounded-2xl transition-all shadow-md shrink-0 self-start md:self-auto"
                    >
                      ← Back to All Brands
                    </button>
                  </div>
                </div>

                {/* Filter & Controls Toolbar */}
                <div className="card p-4 sm:p-5 rounded-[22px] border border-gray-200/80 bg-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="relative w-full sm:w-80 md:w-96">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={modelFilter}
                      onChange={(e) => setModelFilter(e.target.value)}
                      placeholder={`Search ${form.brand} models (e.g. ${form.brand} 15, S23)...`}
                      className="input pl-10 pr-9 py-2.5 rounded-xl text-xs sm:text-sm border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    />
                    {modelFilter && (
                      <button
                        type="button"
                        onClick={() => setModelFilter('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 font-bold"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="text-xs font-bold text-gray-500">
                      Showing <strong className="text-gray-900">{filteredModelsList.length}</strong> models
                    </span>
                    <span className="h-4 w-px bg-gray-200 hidden sm:block" />
                    <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-lg border border-teal-100">
                      ⚡ Doorstep Service Available
                    </span>
                  </div>
                </div>

                {/* Direct Models Grid View */}
                {loadingModels ? (
                  <div className="card p-16 text-center rounded-[28px] border border-teal-100 bg-teal-50/20">
                    <Sparkles className="h-8 w-8 animate-spin text-[#00a896] mx-auto mb-3" />
                    <p className="text-sm font-bold text-teal-900">Fetching all certified {form.brand} models...</p>
                    <p className="text-xs text-teal-600 mt-1">Checking stock & repair parts availability</p>
                  </div>
                ) : filteredModelsList.length === 0 ? (
                  <div className="card p-12 text-center rounded-[28px] border border-gray-200 bg-white">
                    <Smartphone className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-gray-800">No models found matching "{modelFilter}"</p>
                    <p className="text-xs text-gray-500 mt-1">Try clearing your search or typing a different model name</p>
                    <button
                      type="button"
                      onClick={() => setModelFilter('')}
                      className="mt-4 btn-outline text-xs py-2 px-4 inline-flex items-center gap-1.5"
                    >
                      Clear Search Filter
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4 max-h-[580px] overflow-y-auto pr-1">
                    {filteredModelsList.map((m) => (
                      <button
                        key={m.name}
                        type="button"
                        onClick={() => handleSelectPhoneForRepair(form.brand, m.name)}
                        className="group relative flex flex-col items-center justify-between p-4 sm:p-5 rounded-2xl border border-gray-200/90 bg-white hover:border-[#00a896] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center cursor-pointer overflow-hidden"
                      >
                        {/* Top Subtle Pill */}
                        <span className="text-[10px] font-extrabold text-teal-700 bg-teal-50 group-hover:bg-teal-600 group-hover:text-white transition-colors px-2 py-0.5 rounded-full mb-3">
                          Lucknow Express
                        </span>

                        <div className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 text-[#00a896] group-hover:from-[#00a896] group-hover:to-teal-600 group-hover:text-white transition-all duration-300 shadow-xs">
                          <Smartphone className="h-6 w-6 sm:h-7 sm:w-7" />
                        </div>

                        <p className="mt-3 text-xs sm:text-sm font-black text-gray-900 group-hover:text-[#00a896] line-clamp-2 transition-colors">
                          {m.name}
                        </p>

                        <div className="mt-4 w-full py-2 px-3 rounded-xl bg-slate-900 text-white font-extrabold text-xs group-hover:bg-[#00a896] transition-all flex items-center justify-center gap-1 shadow-sm">
                          Select Issue <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* BRAND SELECTION GRID (Shown when no brand is selected) */
              <>
                <div className="card p-6 md:p-8 rounded-[28px] border border-gray-200/80 bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <div>
                      <span className="badge bg-teal-50 text-teal-800 font-extrabold text-xs">
                        Step 1: Pick Manufacturer
                      </span>
                      <h2 className="mt-2 font-display text-xl sm:text-2xl font-black text-ink-900 flex items-center gap-2">
                        <Smartphone className="h-6 w-6 text-[#00a896]" /> Select Phone Brand to Repair
                      </h2>
                      <p className="mt-1 text-xs text-ink-500">Choose your phone manufacturer to explore dedicated model repair catalogs</p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 md:gap-4">
                    {BRAND_CARDS.map((item) => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => handleBrandSelect(item.name)}
                        className="group relative flex flex-col items-center justify-center p-5 rounded-2xl border border-gray-200/90 bg-white hover:border-[#00a896] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
                      >
                        <div className="h-14 w-14 p-2 rounded-2xl bg-gray-50 group-hover:bg-teal-50 transition-colors flex items-center justify-center">
                          <img src={item.logo} alt={item.name} className="h-full w-full object-contain" />
                        </div>
                        <span className="mt-3 text-sm font-black text-ink-900 group-hover:text-[#00a896] transition-colors">{item.name}</span>
                        <span className="mt-1 text-[11px] font-bold text-gray-400 group-hover:text-[#00a896] transition-colors flex items-center gap-0.5">
                          View Models <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Popular Repair Models Grid */}
                <div className="card p-6 md:p-8 rounded-[28px] border border-gray-200/80 bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <div>
                      <span className="badge bg-amber-50 text-amber-800 font-extrabold text-xs">
                        Popular Choices in Lucknow
                      </span>
                      <h3 className="mt-2 font-display text-lg sm:text-xl font-black text-ink-900 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-amber-500" /> Frequently Repaired Phones
                      </h3>
                      <p className="mt-0.5 text-xs text-ink-500">Tap any popular model for instant repair pricing</p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
                    {POPULAR_REPAIR_MODELS.map((item) => (
                      <button
                        key={item.model}
                        type="button"
                        onClick={() => handleQuickModelSelect(item)}
                        className="group flex flex-col items-center p-4 rounded-2xl border border-gray-200/80 bg-white hover:border-[#00a896] hover:shadow-lg hover:-translate-y-1 transition-all text-center"
                      >
                        <img src={getCleanPhoneImage(item.brand, item.model, item.image)} alt={item.model} className="h-20 w-20 object-contain rounded-xl" />
                        <p className="mt-2 text-xs font-black text-ink-900 group-hover:text-[#00a896] truncate w-full transition-colors">{item.model}</p>
                        <span className="mt-2 badge bg-emerald-50 text-emerald-800 font-black text-[10px]">
                          From {formatINR(item.price)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <div className="card p-6 md:p-8 rounded-[28px]">
              <div className="flex items-center justify-between border-b border-ink-100 pb-4">
                <div>
                  <span className="badge bg-brand-50 text-brand-700">Step 2 of 4</span>
                  <h2 className="mt-1 font-display text-xl font-extrabold text-ink-900">
                    Select Repair Issue(s)
                  </h2>
                  <p className="text-xs text-ink-500">
                    Device: <span className="font-bold text-ink-900">{form.brand} {form.model}</span> · <span className="text-[#00a896] font-bold">Select multiple issues if needed</span>
                  </p>
                </div>
                <button type="button" onClick={() => goToStep(1)} className="text-xs text-brand-600 font-bold hover:underline">
                  Change Phone
                </button>
              </div>

              {/* Repair Issues Grid */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {REPAIR_ISSUES.map((issue) => {
                  const IconComp = issue.icon;
                  const isSelected = selectedIssueIds.includes(issue.id);

                  return (
                    <button
                      key={issue.id}
                      type="button"
                      onClick={() => toggleIssueSelection(issue.id)}
                      className={`p-5 rounded-2xl border text-left flex items-start gap-4 transition cursor-pointer relative overflow-hidden ${
                        isSelected
                          ? 'border-[#00a896] bg-teal-50/90 shadow-md ring-2 ring-[#00a896]/30'
                          : 'border-ink-200 bg-white hover:border-teal-300 hover:bg-gray-50/50'
                      }`}
                    >
                      <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${isSelected ? 'bg-[#00a896] text-white shadow-md' : 'bg-ink-100 text-ink-600'}`}>
                        <IconComp className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-sm text-ink-900">{issue.label}</p>
                          <span className="font-display font-black text-[#00a896] text-base">{formatINR(issue.cost)}</span>
                        </div>
                        <p className="mt-1 text-xs text-ink-500 leading-relaxed">{issue.desc}</p>
                        <div className="mt-3 flex items-center justify-between text-[10px] font-bold">
                          <div className="flex items-center gap-2">
                            <span className="badge bg-emerald-50 text-emerald-700">{issue.warranty}</span>
                            <span className="badge bg-purple-50 text-purple-700">{issue.time}</span>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black transition ${isSelected ? 'bg-[#00a896] text-white' : 'bg-gray-100 text-gray-600 hover:bg-teal-100 hover:text-[#00a896]'}`}>
                            {isSelected ? '✓ Selected' : '+ Add Issue'}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Multi-Issue Live Summary Bar */}
              <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl border border-teal-500/30">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="badge bg-teal-500/20 text-teal-300 text-xs font-extrabold px-3 py-0.5 border border-teal-400/30">
                      {selectedIssues.length} Repair Issue{selectedIssues.length > 1 ? 's' : ''} Selected
                    </span>
                    {selectedIssues.length > 1 && (
                      <span className="text-xs text-amber-300 font-black animate-pulse">
                        🔥 Multi-Repair Combo Active!
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 font-semibold line-clamp-1">
                    {combinedProblemLabel}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Combined Quote</p>
                  <p className="font-display font-black text-2xl text-emerald-400">{formatINR(totalRepairCost)}</p>
                </div>
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
                <button type="button" onClick={() => goToStep(1)} className="btn-outline text-sm">
                  Back
                </button>
                <button type="button" onClick={() => goToStep(3)} className="btn-primary flex items-center gap-2 bg-[#00a896] hover:bg-[#008f80]">
                  View Total Upfront Quote ({formatINR(totalRepairCost)}) <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div className="card p-6 md:p-8 rounded-[28px] text-center">
              <span className="badge bg-emerald-50 text-emerald-700 font-extrabold uppercase tracking-wider">
                Upfront Repair Estimate ({selectedIssues.length} Issue{selectedIssues.length > 1 ? 's' : ''})
              </span>

              <h2 className="mt-3 font-display text-2xl font-black text-ink-900">
                {form.brand} {form.model}
              </h2>

              {/* Cashify Upfront Quote Box */}
              <div className="mt-6 rounded-3xl bg-gradient-to-r from-[#0a1b1d] via-[#11292d] to-[#0a1b1d] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden space-y-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Total Upfront Repair Price (Incl. Parts & Labor)</p>
                  <div className="mt-2 font-display text-4xl sm:text-5xl font-black text-white">
                    {formatINR(totalRepairCost)}
                  </div>
                  <p className="mt-2 text-xs text-white/70">No hidden fees · Pay only after testing your phone</p>
                </div>

                {/* Selected Issues List */}
                <div className="text-left bg-white/10 p-4 rounded-2xl border border-white/10 space-y-2 text-xs">
                  <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">Included Repairs ({selectedIssues.length}):</p>
                  {selectedIssues.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-slate-200 font-semibold border-b border-white/10 pb-1.5 pt-0.5">
                      <span>• {item.label}</span>
                      <span className="font-bold text-white">{formatINR(item.cost)}</span>
                    </div>
                  ))}
                </div>

                {/* Repair Guarantees Pills */}
                <div className="flex flex-wrap justify-center gap-2 text-xs font-semibold pt-1">
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
                <button type="button" onClick={() => goToStep(2)} className="btn-outline text-sm">
                  Change Issue(s)
                </button>
                <button type="button" onClick={() => goToStep(4)} className="btn-primary flex items-center gap-2 bg-[#00a896] hover:bg-[#008f80]">
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
                <button type="button" onClick={() => goToStep(3)} className="btn-outline text-sm">
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
