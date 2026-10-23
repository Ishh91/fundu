import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Smartphone,
  Search,
  Sparkles,
  ArrowRight,
  RefreshCw,
  X,
  AlertCircle,
  Truck,
  ShieldCheck,
  BadgeIndianRupee,
  Clock,
  PhoneCall,
  Lock,
  FileText,
  Star,
  MapPin,
  HelpCircle,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { getCleanBrandLogo, getCleanPhoneImage, BRAND_FRONT_FALLBACKS, getGenericDevicePlaceholder } from '../../lib/phoneImages';
import { formatDisplayPrice } from '../../lib/db';
import { BRAND_TILES, MASTER_MODEL_CATALOG, FAQS_LIST } from '../../data/masterModelCatalog';
import { isModelDeleted, usePriceSync } from '../../lib/priceSync';
import { getModelDedupeKey, sortDeviceModelsLatestFirst } from '../../data/brandSeriesCatalog';
import { getModelHardwareSpecs } from '../../lib/deviceSpecs';

interface SellStep1DeviceProps {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  brandSlug?: string;
  modelSlug?: string;
  handleBrandSelect: (brand: string) => void;
  handleQuickModelSelect: (item?: { brand?: string; model?: string; storage?: string }) => void;
  selectedSeries: string;
  setSelectedSeries: (series: string) => void;
  brandSeriesList: string[];
  user?: any;
  dbReviews?: Array<{ id: string; reviewer_name: string; location: string; rating: number; comment: string }>;
}

export default function SellStep1Device({
  form,
  setForm,
  brandSlug,
  modelSlug,
  handleBrandSelect,
  handleQuickModelSelect,
  selectedSeries,
  setSelectedSeries,
  brandSeriesList,
  user,
  dbReviews = [],
}: SellStep1DeviceProps) {
  const navigate = useNavigate();
  const { version: _imageSyncVersion } = usePriceSync();
  const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(0);
  return (
          <div className="space-y-8 animate-fade-in">
            {/* BRAND SELECTION GRID */}
            {!form.brand && (
              <div className="card p-6 md:p-8 rounded-[28px] bg-white border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div>
                    <h2 className="font-display text-xl font-extrabold text-[#344257] flex items-center gap-2">
                      <Smartphone className="h-5 w-5 text-[#6A859F]" /> Select Phone Brand
                    </h2>
                    <p className="mt-0.5 text-xs text-gray-500">Pick your phone manufacturer to view all models</p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
                  {BRAND_TILES.map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => handleBrandSelect(item.name)}
                      className="group relative flex flex-col items-center justify-center p-5 rounded-2xl border border-gray-200/90 bg-white hover:border-[#6A859F] hover:bg-[#F0F0F5] hover:shadow-xl transition-all duration-300 active:scale-95 cursor-pointer"
                    >
                      <div className="h-12 w-12 flex items-center justify-center rounded-xl p-2 bg-gray-50 group-hover:bg-white transition-all">
                        <img src={getCleanBrandLogo(item.name)} alt={item.name} className="h-full w-full object-contain group-hover:scale-110 transition-transform" />
                      </div>
                      <span className="mt-2.5 text-sm font-extrabold text-gray-900 group-hover:text-[#344257] transition-colors">{item.name}</span>
                      <span className="text-[10px] text-gray-400 font-semibold">{item.count}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* DEDICATED BRAND PAGE VIEW (Renders at top when Brand is selected or URL is /sell/{brand}) */}
            {form.brand && (
              <div className="card p-6 md:p-8 rounded-[28px] space-y-6 border border-[#C0C8D8] bg-white shadow-xl animate-fade-in">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#F0F0F5] border border-[#C0C8D8] grid place-items-center font-black text-[#344257] text-base shadow-xs">
                      {form.brand[0]}
                    </div>
                    <div>
                      <span className="badge bg-[#F0F0F5] text-[#344257] border border-[#C0C8D8] font-bold text-xs">
                        Selling Brand: {form.brand}
                      </span>
                      <h2 className="mt-0.5 font-display text-xl font-black text-[#344257]">
                        Sell Old {form.brand} Mobile Phone Online At Best Price
                      </h2>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setForm((f: any) => ({ ...f, brand: '', model: '' })); navigate('/sell'); }}
                    className="text-xs text-[#344257] hover:underline font-bold bg-[#F0F0F5] px-3 py-1.5 rounded-xl border border-[#C0C8D8]"
                  >
                    ← All Brands
                  </button>
                </div>

                {/* Series Selection Filter Tabs */}
                {brandSeriesList.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider shrink-0 mr-1">Series:</span>
                    {brandSeriesList.map((ser) => (
                      <button
                        key={ser}
                        type="button"
                        onClick={() => setSelectedSeries(ser)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition shrink-0 ${
                          selectedSeries === ser
                            ? 'bg-[#344257] text-white shadow-xs'
                            : 'bg-[#F0F0F5] text-[#47576E] hover:bg-[#E4E7F0]'
                        }`}
                      >
                        {ser}
                      </button>
                    ))}
                  </div>
                )}

                {/* Brand Models Image Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(() => {
                    const seen = new Set<string>();
                    const rawList = MASTER_MODEL_CATALOG.filter(
                      (m) => m.brand === form.brand && !isModelDeleted(m.brand, m.model) && (selectedSeries === 'All' || m.series === selectedSeries)
                    ).filter((m) => {
                      const dKey = getModelDedupeKey(m.brand, m.model);
                      if (seen.has(dKey)) return false;
                      seen.add(dKey);
                      return true;
                    });
                    return sortDeviceModelsLatestFirst(form.brand, rawList);
                  })().map((m) => (
                    <div
                      key={`${m.brand}-${m.model}`}
                      className="p-4 rounded-2xl border border-gray-200 bg-white hover:border-[#6A859F] hover:shadow-lg transition-all duration-300 space-y-3 cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white p-1 border border-gray-100 flex items-center justify-center">
                          <img
                            src={getCleanPhoneImage(m.brand, m.model, m.image)}
                            alt={m.model}
                            className="h-full w-full object-contain group-hover:scale-105 transition-transform drop-shadow-xs"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              const target = e.currentTarget;
                              const bSlug = (m.brand || form.brand || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                              if (!target.dataset.triedBrandFallback) {
                                target.dataset.triedBrandFallback = 'true';
                                const fallback = BRAND_FRONT_FALLBACKS[bSlug] || BRAND_FRONT_FALLBACKS.apple;
                                if (target.src !== fallback) {
                                  target.src = fallback;
                                  return;
                                }
                              }
                              target.src = getGenericDevicePlaceholder(m.brand || form.brand, m.model);
                            }}
                          />
                        </div>
                        <div>
                          <p className="font-extrabold text-sm text-gray-900 group-hover:text-[#344257] transition-colors">{m.model}</p>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span className="badge bg-[#F0F0F5] text-[#344257] border border-[#C0C8D8] font-extrabold text-[11px]">
                              Select Condition for Quote
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              Best Resale Price
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Storage Selection Pills */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {getModelHardwareSpecs(m.brand || form.brand, m.model, MASTER_MODEL_CATALOG).storages.map((stg) => (
                          <button
                            key={stg}
                            type="button"
                            onClick={() => {
                              handleQuickModelSelect({ brand: form.brand || m.brand, model: m.model, storage: stg });
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                              form.model === m.model && form.storage === stg
                                ? 'bg-[#344257] text-white shadow-xs'
                                : 'bg-[#F0F0F5] text-[#47576E] hover:bg-[#E4E7F0] hover:text-[#344257]'
                            }`}
                          >
                            {stg}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          handleQuickModelSelect({ brand: form.brand, model: m.model, storage: form.storage || '128 GB' });
                        }}
                        className="btn-primary w-full text-xs py-2 flex items-center justify-center gap-1 font-bold shadow-xs"
                      >
                        Get Instant Price Quote <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Sell Models Section */}
            <div className="card p-6 md:p-8 rounded-[28px] bg-white border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold text-[#344257] flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[#6A859F]" /> Popular Mobiles Sold at your doorstep
                  </h3>
                  <p className="mt-0.5 text-xs text-gray-500">Tap any model for instant cash quote</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {(() => {
                  const targetBrands = ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Realme', 'Vivo'];
                  const picked: typeof MASTER_MODEL_CATALOG[0][] = [];
                  for (const b of targetBrands) {
                    const item = MASTER_MODEL_CATALOG.find(
                      (m) =>
                        m.brand.toLowerCase() === b.toLowerCase() &&
                        !isModelDeleted(m.brand, m.model) &&
                        !m.model.includes('2007') &&
                        !m.model.includes('3G')
                    );
                    if (item) picked.push(item);
                  }
                  const displayList = picked.length >= 4 ? picked : MASTER_MODEL_CATALOG.slice(0, 6);
                  return displayList.map((item) => {
                    return (
                      <button
                        key={`${item.brand}-${item.model}`}
                        type="button"
                        onClick={() => handleQuickModelSelect(item)}
                        className="p-3.5 rounded-2xl border border-gray-200 bg-white hover:border-[#6A859F] hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center cursor-pointer group"
                      >
                        <div className="h-20 w-full overflow-hidden rounded-xl p-1 bg-white flex items-center justify-center">
                          <img
                            src={getCleanPhoneImage(item.brand, item.model, item.image)}
                            alt={item.model}
                            className="h-full w-full object-contain group-hover:scale-105 transition-transform"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              const target = e.currentTarget;
                              const bSlug = (item.brand || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                              if (!target.dataset.triedBrandFallback) {
                                target.dataset.triedBrandFallback = 'true';
                                const fallback = BRAND_FRONT_FALLBACKS[bSlug] || BRAND_FRONT_FALLBACKS.apple;
                                if (target.src !== fallback) {
                                  target.src = fallback;
                                  return;
                                }
                              }
                              target.src = getGenericDevicePlaceholder(item.brand, item.model);
                            }}
                          />
                        </div>
                        <p className="mt-2 text-xs font-extrabold text-gray-900 group-hover:text-[#344257] transition-colors truncate w-full">{item.model}</p>
                        <span className="mt-1 badge bg-[#F0F0F5] text-[#344257] border border-[#C0C8D8] font-extrabold text-[10px]">
                          Evaluate Condition →
                        </span>
                      </button>
                    );
                  });
                })()}
              </div>
            </div>

            {/* How It Works (3 Steps) */}
            <div className="card p-8 rounded-[32px] bg-white border border-gray-200 space-y-6">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <span className="badge bg-[#F0F0F5] text-[#344257] border border-[#C0C8D8] text-xs font-bold">Simple 3-Step Flow</span>
                <h2 className="font-display text-2xl font-black text-[#344257]">How Selling Works On Fundu</h2>
                <p className="text-xs text-gray-500">Sell your mobile phone in under 2 minutes from home</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                {[
                  {
                    num: '1',
                    title: 'Check Price & Evaluate',
                    desc: 'Select your phone brand, model, storage, and answer simple questions about screen & body condition.',
                  },
                  {
                    num: '2',
                    title: 'Schedule Free Pickup',
                    desc: 'Select your preferred date & time slot. Our automated dispatch system assigns the nearest delivery rider.',
                  },
                  {
                    num: '3',
                    title: 'Get Paid at Doorstep',
                    desc: 'Our rider inspects your phone at your doorstep and transfers spot cash or UPI instantly to your account!',
                  },
                ].map((stepItem) => (
                  <div key={stepItem.num} className="p-6 rounded-2xl bg-[#F7F7FA] border border-[#C0C8D8] flex flex-col items-center text-center space-y-3">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-r from-[#344257] to-[#47576E] text-white font-display font-black text-xl shadow-md">
                      {stepItem.num}
                    </div>
                    <h3 className="font-extrabold text-base text-[#344257]">{stepItem.title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{stepItem.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Why Us (6 USPs) */}
            <div className="card p-8 rounded-[32px] bg-gradient-to-r from-[#1E2734] via-[#344257] to-[#47576E] text-white shadow-xl space-y-6">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <span className="badge bg-white/10 text-white border border-white/20 text-xs font-bold px-3 py-1">
                  Our #1 Phone Buyback Network
                </span>
                <h2 className="font-display text-2xl md:text-3xl font-black text-white">
                  Why Choose Fundu?
                </h2>
                <p className="text-xs text-gray-300">
                  India's most trusted, instant cash doorstep mobile re-commerce network.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    icon: <BadgeIndianRupee className="h-6 w-6 text-[#8A9AAF]" />,
                    title: 'Instant Spot Cash Payout',
                    desc: 'Get instant UPI (GPay/PhonePe) or hard cash transfer directly into your hand before handing over your mobile.',
                  },
                  {
                    icon: <Sparkles className="h-6 w-6 text-[#9ac0dd]" />,
                    title: 'Highest Valuation Guarantee',
                    desc: 'Our AI valuation algorithm checks live resale market rates to guarantee you the absolute highest cash price at your doorstep.',
                  },
                  {
                    icon: <Truck className="h-6 w-6 text-[#9ac0dd]" />,
                    title: 'Free Doorstep Pickup',
                    desc: 'Zero shipping fees across Gomti Nagar, Hazratganj, Indira Nagar, Aliganj, Mahanagar, Ashiyana & Chowk.',
                  },
                  {
                    icon: <Lock className="h-6 w-6 text-[#C0C8D8]" />,
                    title: 'Military-Grade Data Wipe',
                    desc: 'We perform automated factory data wipe right in front of you for complete privacy & data safety.',
                  },
                  {
                    icon: <ShieldCheck className="h-6 w-6 text-amber-400" />,
                    title: 'All Conditions Accepted',
                    desc: 'We buy phones in all physical states — flawless, body scratches, cracked screen glass, or dead battery.',
                  },
                  {
                    icon: <FileText className="h-6 w-6 text-rose-400" />,
                    title: 'Legal Digital Seller Invoice',
                    desc: 'Receive an official digital receipt & invoice sent to your mobile phone instantly upon doorstep pickup completion.',
                  },
                ].map((card, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs hover:bg-white/10 transition-colors space-y-2">
                    <div className="p-2.5 rounded-xl bg-white/10 w-fit">{card.icon}</div>
                    <h3 className="font-bold text-sm text-white mt-2">{card.title}</h3>
                    <p className="text-xs text-gray-300 leading-relaxed">{card.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Testimonials Grid (8-10 Doorstep Sellers) */}
            <div className="card p-8 rounded-[32px] bg-white border border-gray-200 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                  <span className="badge bg-[#F0F0F5] text-[#344257] border border-[#C0C8D8] font-bold text-xs">Verified Customer Feedback</span>
                  <h2 className="font-display text-2xl font-black text-[#344257] mt-1">What Verified Sellers Say</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-black text-2xl text-[#344257]">4.9</span>
                  <span className="text-amber-500 text-lg">★★★★★</span>
                  <span className="text-xs text-gray-500 font-medium">(12,400+ Verified Deals)</span>
                </div>
              </div>

              {dbReviews.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200/80 space-y-2">
                  <Star className="h-8 w-8 text-amber-400 mx-auto opacity-50" />
                  <p className="font-bold text-xs text-gray-800">No customer reviews submitted yet.</p>
                  <p className="text-[11px] text-gray-500">Real customer feedback will appear here after seller deals are completed.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {dbReviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2 text-xs flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900 text-sm">{rev.reviewer_name}</span>
                          <span className="text-amber-500 text-xs">{'★'.repeat(rev.rating || 5)}</span>
                        </div>
                        <p className="text-gray-600 leading-relaxed italic">"{rev.comment}"</p>
                      </div>
                      <div className="pt-2 border-t border-gray-200/60 text-[11px] font-bold text-[#344257] flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {rev.location || 'Doorstep Service'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* FAQ Accordion Section (14 Comprehensive Q&As) */}
            <div className="card p-8 rounded-[32px] bg-white border border-gray-200 space-y-6">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <span className="badge bg-[#F0F0F5] text-[#344257] border border-[#C0C8D8] text-xs font-bold">Clear Answers</span>
                <h2 className="font-display text-2xl font-black text-[#344257]">Frequently Asked Questions</h2>
                <p className="text-xs text-gray-500 font-medium">Everything you need to know about selling mobile on Fundu</p>
              </div>

              <div className="space-y-3 max-w-4xl mx-auto">
                {FAQS_LIST.map((f, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-gray-200 bg-white overflow-hidden transition-all duration-200"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full p-4 text-left font-bold text-sm text-[#344257] flex items-center justify-between gap-4 hover:bg-[#F7F7FA] transition cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <HelpCircle className="h-4 w-4 text-[#6A859F] shrink-0" />
                          {f.q}
                        </span>
                        {isOpen ? <ChevronUp className="h-4 w-4 text-gray-500 shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-500 shrink-0" />}
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 text-xs text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/50">
                          {f.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SEO Content & Footer Rating Summary */}
            <div className="p-8 rounded-[32px] bg-gray-100 border border-gray-200 text-xs text-gray-600 space-y-3 leading-relaxed">
              <h3 className="font-bold text-gray-900 text-sm">Sell Old Mobile Phone Online at your doorstep — Fundu Mobile Re-Commerce Hub</h3>
              <p>
                Looking to sell your old mobile phone for instant spot cash at your doorstep? Fundu is a premier largest, most trusted online platform for selling used smartphones across top brands like Apple iPhone, Samsung, OnePlus, Xiaomi Redmi, Vivo, Oppo, Realme, Google Pixel, and Poco.
              </p>
              <p>
                Whether your mobile phone is in brand new condition, has minor body scratches, or has a cracked screen, Fundu's instant AI valuation algorithm calculates the highest guaranteed cash price for your device. Enjoy free doorstep pickup across all service areas areas including Gomti Nagar, Hazratganj, Indira Nagar, Aliganj, Mahanagar, Ashiyana, Chowk, Rajajipuram, Jankipuram, and Kanpur Road.
              </p>
              <div className="pt-3 border-t border-gray-300/60 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-gray-800">
                <span>Fundu Helpline: +91-9839122345</span>
                <span>Average User Rating: 4.9 / 5.0 (12,400+ Verified Deals)</span>
              </div>
            </div>
          </div>
  );
}
