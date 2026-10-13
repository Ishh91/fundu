import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Store,
  Wrench,
  Truck,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  BadgePercent,
  TrendingUp,
  MessageSquare,
  Copy,
  Check,
  ChevronDown,
  HelpCircle,
  ExternalLink,
  DollarSign
} from 'lucide-react';
import { db } from '../lib/db';

type PartnershipType = 'retail' | 'repair' | 'wholesale' | 'delivery';

interface PartnerFormState {
  fullName: string;
  businessName: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  pincode: string;
  category: PartnershipType;
  experience: string;
  monthlyVolume: string;
  notes: string;
}

const PARTNER_CATEGORIES = [
  {
    id: 'retail' as PartnershipType,
    title: 'Retail Store & Franchise',
    badge: 'High Margin',
    icon: Store,
    shortDesc: 'For offline mobile stores seeking certified refurbished stock & brand signage.',
    benefits: [
      'Access to certified refurbished iPhones & Androids at wholesale pricing',
      'Doorstep phone sell/exchange customer walk-in leads',
      'Official Fundu store branding, banners & promotional collateral',
      'Up to 15-20% retail profit margin per device sold',
    ],
  },
  {
    id: 'repair' as PartnershipType,
    title: 'Technician & Service Center',
    badge: 'Daily Bookings',
    icon: Wrench,
    shortDesc: 'For skilled mobile repair professionals & independent service shops.',
    benefits: [
      'High-ticket 30-min doorstep screen & battery repair bookings in your pincode',
      '100% genuine OEM spare parts supply with 6 months warranty backup',
      'Fundu diagnostic checklists & transparent pricing matrix',
      'Bi-weekly direct bank/UPI payouts for completed repair tickets',
    ],
  },
  {
    id: 'wholesale' as PartnershipType,
    title: 'Corporate & Bulk Wholesaler',
    badge: 'Khata Credit',
    icon: Building2,
    shortDesc: 'For bulk device procurement, corporate buyback & lots liquidation.',
    benefits: [
      'Bulk device lots (Grade A/B/C) with comprehensive grading reports',
      'Flexible vendor Khata credit limit up to ₹2,00,000 for approved partners',
      'GST invoice input credit & pan-India insured freight shipping',
      'Dedicated relationship manager for custom sourcing orders',
    ],
  },
  {
    id: 'delivery' as PartnershipType,
    title: 'Field Fleet & Inspection Rider',
    badge: 'Spot Payout',
    icon: Truck,
    shortDesc: 'For delivery riders & agents conducting doorstep phone pickup & inspection.',
    benefits: [
      'Guaranteed spot payout per completed mobile inspection and pickup',
      'Automated digital QC checklist app on your phone',
      'Flexible working hours with area-specific routing',
      'Daily fuel and performance milestone bonuses',
    ],
  },
];

const POPULAR_CITIES = [
  'Lucknow',
  'Kanpur',
  'Varanasi',
  'Prayagraj',
  'Gorakhpur',
  'Noida',
  'Ghaziabad',
  'Agra',
  'Delhi NCR',
  'Other',
];

const FAQS = [
  {
    q: 'Is there any upfront fee or deposit required to become a Fundu partner?',
    a: 'No. Fundu charges ₹0 onboarding or franchise fee. We believe in collaborative growth, providing verified leads, stock inventory, and technology tools directly to your business.',
  },
  {
    q: 'How are leads assigned to repair technicians and stores?',
    a: 'Our smart routing engine assigns sell requests and doorstep repair orders to the nearest verified partner based on customer pincode and category expertise.',
  },
  {
    q: 'How do payouts and Khata settlements work?',
    a: 'Technicians and riders receive instant UPI or weekly direct bank transfers. Retail and wholesale partners have an integrated digital Khata ledger with transparent settlement terms.',
  },
  {
    q: 'What documents are required for partner verification?',
    a: 'A valid Aadhaar card, PAN card, business address proof (or shop photo), and bank account/UPI details for payouts. GST certificate is required only for wholesale invoicing.',
  },
];

export default function PartnerProgram() {
  const [selectedCategory, setSelectedCategory] = useState<PartnershipType>('retail');
  const [form, setForm] = useState<PartnerFormState>({
    fullName: '',
    businessName: '',
    phone: '',
    email: '',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    pincode: '',
    category: 'retail',
    experience: '1-3 years',
    monthlyVolume: '10-30 units / jobs',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submittedAppId, setSubmittedAppId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleCategoryChange = (cat: PartnershipType) => {
    setSelectedCategory(cat);
    setForm((prev) => ({ ...prev, category: cat }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fullName.trim()) {
      alert('Please enter your full name.');
      return;
    }
    const cleanPhone = form.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!form.email.trim() || !form.email.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);

    try {
      const generatedId = `FND-PTR-${Math.floor(100000 + Math.random() * 900000)}`;
      const categoryName = PARTNER_CATEGORIES.find((c) => c.id === form.category)?.title || form.category;

      const applicationPayload = {
        id: generatedId,
        name: form.fullName.trim(),
        email: form.email.trim(),
        phone: cleanPhone,
        subject: `[Partner Application] ${categoryName} — ${form.city}`,
        message: `Business/Store: ${form.businessName.trim() || 'N/A'}\nCategory: ${categoryName}\nLocation: ${form.city}, ${form.state} (PIN: ${form.pincode || 'N/A'})\nExperience: ${form.experience}\nMonthly Capacity: ${form.monthlyVolume}\nNotes: ${form.notes.trim() || 'None'}\nReference ID: ${generatedId}`,
        status: 'new',
        created_at: new Date().toISOString(),
      };

      // 1. Store in contact_messages so Admin Portal (AdminContactQueries) tracks it
      try {
        await db.from('contact_messages').insert(applicationPayload);
      } catch (err) {
        console.warn('Failed to insert into contact_messages, falling back to local store:', err);
      }

      // 2. Also cache in localStorage for client persistence
      try {
        const stored = JSON.parse(localStorage.getItem('fundu_partner_applications') || '[]');
        stored.unshift({ ...form, id: generatedId, created_at: new Date().toISOString() });
        localStorage.setItem('fundu_partner_applications', JSON.stringify(stored));
      } catch {}

      setSubmittedAppId(generatedId);
    } catch (err) {
      console.error('Error submitting partner application:', err);
      alert('Failed to submit application. Please reach out to our partner desk directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyAppId = () => {
    if (!submittedAppId) return;
    navigator.clipboard.writeText(submittedAppId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getWhatsAppPartnerUrl = () => {
    const categoryName = PARTNER_CATEGORIES.find((c) => c.id === form.category)?.title || form.category;
    const msg = `Hi Fundu Partner Desk! 🤝\nI have submitted my Partnership Application:\n\n*Reference ID:* ${submittedAppId || 'New Partner'}\n*Name:* ${form.fullName}\n*Business:* ${form.businessName || 'Independent'}\n*Category:* ${categoryName}\n*City:* ${form.city}\n*Phone:* ${form.phone}\n\nPlease help me complete my onboarding.`;
    return `https://wa.me/919876543210?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION */}
      {/* ========================================================================= */}
      <section
        className="relative overflow-hidden py-14 lg:py-20 text-white"
        style={{
          background: 'linear-gradient(135deg, #1E293B 0%, #344257 50%, #47576E 100%)',
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_50%)]" />
        <div className="container-page relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-3.5 py-1 text-xs font-extrabold uppercase tracking-widest text-[#E4E7F0] shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Fundu Official Partner Program</span>
            </div>

            <h1 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              Grow Your Smartphone Business with Fundu Network.
            </h1>

            <p className="mt-4 text-sm sm:text-base text-slate-200 font-medium leading-relaxed max-w-2xl">
              Join 150+ offline mobile stores, certified repair technicians, and field inspection riders. Get verified customer leads, genuine spare parts supply, certified refurbished stock, and zero upfront onboarding fees.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#partner-form"
                onClick={(e) => {
                  const el = document.getElementById('partner-form');
                  if (el) {
                    e.preventDefault();
                    el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="inline-flex items-center gap-2 rounded-full bg-white text-[#344257] px-7 py-3 text-sm font-black shadow-lg hover:shadow-xl hover:bg-slate-100 active:scale-95 transition-all duration-200"
              >
                <span>Apply as Partner Today</span>
                <ArrowRight className="h-4 w-4" />
              </a>

              <Link
                to="/vendor-login"
                className="inline-flex items-center gap-2 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 px-6 py-3 text-sm font-bold text-white shadow-md active:scale-95 transition-all duration-200"
              >
                <Building2 className="h-4 w-4 text-amber-300" />
                <span>Existing Vendor Login</span>
              </Link>

              <Link
                to="/delivery-login"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 px-5 py-3 text-xs sm:text-sm font-bold text-slate-200 transition"
              >
                <Truck className="h-4 w-4 text-emerald-300" />
                <span>Rider Partner Login</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/15 pt-8">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="text-2xl font-black text-white">150+</div>
              <div className="text-xs font-semibold text-slate-300 mt-0.5">Active Partners</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="text-2xl font-black text-white">₹0 Fee</div>
              <div className="text-xs font-semibold text-slate-300 mt-0.5">Zero Franchise Cost</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="text-2xl font-black text-white">Up to 20%</div>
              <div className="text-xs font-semibold text-slate-300 mt-0.5">Retail Margins</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="text-2xl font-black text-white">24 Hours</div>
              <div className="text-xs font-semibold text-slate-300 mt-0.5">Fast Onboarding</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. PARTNERSHIP VERTICALS */}
      {/* ========================================================================= */}
      <section className="container-page py-12 lg:py-16">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#344257]">
            Tailored Collaboration
          </p>
          <h2 className="mt-2 font-display text-2xl sm:text-3xl font-black text-gray-900">
            Choose Your Partnership Category
          </h2>
          <p className="mt-2 text-sm text-gray-600 font-medium">
            Whether you operate an offline mobile shop, fix phones, or run delivery operations, Fundu provides verified leads and reliable inventory.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PARTNER_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <div
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`cursor-pointer rounded-3xl p-6 border transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#344257] bg-white ring-2 ring-[#344257]/20 shadow-xl'
                    : 'border-gray-200 bg-white hover:border-[#6A859F] hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div
                      className={`grid h-12 w-12 place-items-center rounded-2xl ${
                        isSelected ? 'bg-[#344257] text-white' : 'bg-gray-100 text-[#344257]'
                      }`}
                    >
                      <cat.icon className="h-6 w-6" />
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-[#344257] text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {cat.badge}
                    </span>
                  </div>

                  <h3 className="mt-4 font-display text-lg font-bold text-gray-900">
                    {cat.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">
                    {cat.shortDesc}
                  </p>

                  <ul className="mt-4 space-y-2 text-xs text-gray-600 font-medium border-t border-gray-100 pt-3">
                    {cat.benefits.slice(0, 3).map((b, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  className={`mt-6 w-full rounded-xl py-2.5 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#344257] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{isSelected ? '✓ Selected Category' : 'Select Category'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. APPLICATION FORM & VALUE PROPOSITION */}
      {/* ========================================================================= */}
      <section id="partner-form" className="container-page pb-16">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Why Partner with Fundu info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
              <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 text-xs font-extrabold uppercase tracking-wider">
                Why Partner With Us
              </span>
              <h3 className="mt-3 font-display text-2xl font-black text-gray-900">
                Unlock Uncapped Growth For Your Shop or Service
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-gray-600 font-medium leading-relaxed">
                Fundu empowers ground-level entrepreneurs and service technicians with enterprise supply-chain backing, continuous marketing, and instant digital payments.
              </p>

              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-[#344257]">
                    <BadgePercent className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Highest Industry Margins</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Earn up to 20% on phone reselling and maintain transparent repair pricing with no hidden cuts.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">100% Genuine Inventory & Spares</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Every phone and spare part undergoes our 32-point inspection check with 6 months warranty support.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-purple-50 text-purple-700">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Digital Portal & Ledger Khata</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Manage orders, claim doorstep repair tickets, track inventory, and settle balances seamlessly online.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-700">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Dedicated Partner Desk on WhatsApp</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Direct escalation manager available 7 days a week from 9 AM to 9 PM to assist your orders.
                    </p>
                  </div>
                </div>
              </div>

              {/* Existing Partner Quick Links */}
              <div className="mt-8 rounded-2xl bg-gray-50 border border-gray-200 p-4">
                <p className="text-xs font-bold text-gray-800">Already Registered?</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Login directly to access your partner dashboard & leads.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    to="/vendor-login"
                    className="text-xs font-bold text-[#344257] bg-white border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-100 transition inline-flex items-center gap-1"
                  >
                    <Building2 className="h-3.5 w-3.5" /> Vendor Portal
                  </Link>
                  <Link
                    to="/delivery-login"
                    className="text-xs font-bold text-emerald-800 bg-white border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-100 transition inline-flex items-center gap-1"
                  >
                    <Truck className="h-3.5 w-3.5" /> Rider Portal
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Partner Application Form */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
              {submittedAppId ? (
                /* Success State */
                <div className="py-8 text-center animate-fade-in">
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>

                  <h3 className="mt-4 font-display text-2xl font-black text-gray-900">
                    Application Submitted Successfully!
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-gray-600 max-w-md mx-auto font-medium">
                    Thank you, <span className="font-bold text-gray-900">{form.fullName}</span>. Your partnership application has been registered with the Fundu B2B Onboarding Desk.
                  </p>

                  <div className="mt-6 mx-auto max-w-sm rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                    <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                      Application Reference ID
                    </div>
                    <div className="mt-1 flex items-center justify-center gap-2">
                      <span className="font-mono text-lg font-black text-emerald-950">
                        {submittedAppId}
                      </span>
                      <button
                        type="button"
                        onClick={copyAppId}
                        className="rounded-md p-1.5 hover:bg-emerald-200 text-emerald-700 transition cursor-pointer"
                        title="Copy Reference ID"
                      >
                        {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="mt-1 text-[11px] text-emerald-700">
                      Our Partner Relations Manager will call you on <span className="font-bold">{form.phone}</span> within 24 hours.
                    </p>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href={getWhatsAppPartnerUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 text-xs shadow-md transition"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Connect on WhatsApp Now</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        setSubmittedAppId(null);
                        setForm({
                          fullName: '',
                          businessName: '',
                          phone: '',
                          email: '',
                          city: 'Lucknow',
                          state: 'Uttar Pradesh',
                          pincode: '',
                          category: 'retail',
                          experience: '1-3 years',
                          monthlyVolume: '10-30 units / jobs',
                          notes: '',
                        });
                      }}
                      className="w-full sm:w-auto rounded-xl border border-gray-300 px-5 py-3 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
                    >
                      Submit Another Application
                    </button>
                  </div>
                </div>
              ) : (
                /* Application Form */
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="border-b border-gray-100 pb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-[#344257]">
                        Step 1 of 1 — Partner Application
                      </span>
                      <span className="rounded-full bg-blue-50 text-[#344257] px-2.5 py-0.5 text-[11px] font-bold">
                        Takes &lt; 2 minutes
                      </span>
                    </div>
                    <h3 className="mt-1 font-display text-xl font-extrabold text-gray-900">
                      Apply to Partner with Fundu
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Tell us about your business or services so our team can onboard you quickly.
                    </p>
                  </div>

                  {/* Category Selection Tabs inside Form */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Partnership Role *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {PARTNER_CATEGORIES.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleCategoryChange(c.id)}
                          className={`rounded-xl p-2.5 text-xs font-bold text-left border transition cursor-pointer ${
                            form.category === c.id
                              ? 'border-[#344257] bg-[#344257] text-white shadow-xs'
                              : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <c.icon className={`h-4 w-4 mb-1 ${form.category === c.id ? 'text-white' : 'text-[#344257]'}`} />
                          <div className="truncate">{c.title.split('&')[0]}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name & Business Name */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Full Name / Owner Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.fullName}
                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                        placeholder="e.g. Ramesh Kumar"
                        className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-xs font-medium text-gray-900 outline-none focus:border-[#344257] focus:ring-2 focus:ring-[#344257]/10"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Shop / Business Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={form.businessName}
                        onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                        placeholder="e.g. Kumar Mobile Hub"
                        className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-xs font-medium text-gray-900 outline-none focus:border-[#344257] focus:ring-2 focus:ring-[#344257]/10"
                      />
                    </div>
                  </div>

                  {/* Mobile & Email */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Mobile Number (WhatsApp Preferred) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs font-bold text-gray-400">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                          placeholder="9876543210"
                          className="w-full rounded-xl border border-gray-300 pl-11 pr-3.5 py-2.5 text-xs font-medium text-gray-900 outline-none focus:border-[#344257] focus:ring-2 focus:ring-[#344257]/10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="ramesh@example.com"
                        className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-xs font-medium text-gray-900 outline-none focus:border-[#344257] focus:ring-2 focus:ring-[#344257]/10"
                      />
                    </div>
                  </div>

                  {/* City, State & Pincode */}
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        City *
                      </label>
                      <select
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-xs font-medium text-gray-900 outline-none focus:border-[#344257] bg-white"
                      >
                        {POPULAR_CITIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        value={form.state}
                        onChange={(e) => setForm({ ...form, state: e.target.value })}
                        placeholder="Uttar Pradesh"
                        className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-xs font-medium text-gray-900 outline-none focus:border-[#344257]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Pincode
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={form.pincode}
                        onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, '') })}
                        placeholder="e.g. 226001"
                        className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-xs font-medium text-gray-900 outline-none focus:border-[#344257]"
                      />
                    </div>
                  </div>

                  {/* Experience & Capacity */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Experience in Mobile Industry
                      </label>
                      <select
                        value={form.experience}
                        onChange={(e) => setForm({ ...form, experience: e.target.value })}
                        className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-xs font-medium text-gray-900 outline-none focus:border-[#344257] bg-white"
                      >
                        <option value="New to business / <1 year">New to business / &lt;1 year</option>
                        <option value="1-3 years">1-3 years</option>
                        <option value="3-5 years">3-5 years</option>
                        <option value="5+ years">5+ years</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Expected Monthly Units / Bookings
                      </label>
                      <select
                        value={form.monthlyVolume}
                        onChange={(e) => setForm({ ...form, monthlyVolume: e.target.value })}
                        className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-xs font-medium text-gray-900 outline-none focus:border-[#344257] bg-white"
                      >
                        <option value="5-15 units / orders">5 - 15 units / orders</option>
                        <option value="15-50 units / orders">15 - 50 units / orders</option>
                        <option value="50-100 units / orders">50 - 100 units / orders</option>
                        <option value="100+ bulk units">100+ bulk units</option>
                      </select>
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Additional Requirements / Notes (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder="Tell us about your setup, preferred device brands, or any specific support you need..."
                      className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-xs font-medium text-gray-900 outline-none focus:border-[#344257]"
                    />
                  </div>

                  {/* Submission Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full rounded-xl bg-[#344257] hover:bg-[#47576E] text-white font-bold py-3.5 text-xs sm:text-sm shadow-md hover:shadow-lg active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {submitting ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Submitting Application...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Partner Application</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                    <p className="mt-2 text-center text-[11px] text-gray-500">
                      By submitting, you agree to receive onboarding communications on Phone & WhatsApp.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. ONBOARDING PROCESS STEPS */}
      {/* ========================================================================= */}
      <section className="bg-white border-y border-gray-200 py-12 lg:py-16">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#344257]">
              Simple 4-Step Process
            </span>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-black text-gray-900">
              How Fundu Partner Onboarding Works
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-gray-600 font-medium">
              We keep the verification rapid so you can start receiving leads and purchasing inventory immediately.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: '01',
                title: 'Apply Online',
                desc: 'Fill out the form above with your basic contact, business type, and operating city.',
              },
              {
                step: '02',
                title: 'KYC & Verification',
                desc: 'Our onboarding team connects on WhatsApp to verify identity, store photo, and payout details.',
              },
              {
                step: '03',
                title: 'Portal Credentials',
                desc: 'Get your Vendor or Rider login credentials to access real-time leads, pricing, and inventory.',
              },
              {
                step: '04',
                title: 'Start Earning',
                desc: 'Receive repair bookings, supply retail customers with refurbished phones, and withdraw daily/weekly earnings.',
              },
            ].map((s) => (
              <div key={s.step} className="rounded-2xl border border-gray-200 bg-gray-50/70 p-6 relative">
                <span className="font-mono text-3xl font-black text-gray-300 block">{s.step}</span>
                <h3 className="mt-2 font-display text-base font-bold text-gray-900">{s.title}</h3>
                <p className="mt-1.5 text-xs text-gray-600 leading-relaxed font-medium">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. FREQUENTLY ASKED QUESTIONS */}
      {/* ========================================================================= */}
      <section className="container-page py-12 lg:py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#344257]">
              Partner Help Center
            </span>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-black text-gray-900">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-xs transition"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="font-display text-sm font-bold text-gray-900 flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-[#344257] shrink-0" />
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-gray-400 transition-transform shrink-0 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-0 text-xs text-gray-600 leading-relaxed font-medium border-t border-gray-50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Direct WhatsApp Callout */}
          <div className="mt-10 rounded-2xl bg-gradient-to-r from-[#344257] to-[#47576E] p-6 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div>
              <h3 className="font-display text-base font-bold text-white">Have custom business requirements?</h3>
              <p className="text-xs text-slate-200 mt-0.5">Talk to our B2B Partnerships Lead directly on phone or WhatsApp.</p>
            </div>
            <a
              href="https://wa.me/919876543210?text=Hi%20Fundu%20Partner%20Desk%2C%20I%20have%20a%20partnership%20inquiry."
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 shadow-sm transition inline-flex items-center gap-1.5 shrink-0"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Chat with Partner Desk</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
