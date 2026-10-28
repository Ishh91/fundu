import React from 'react';
import {
  Lock,
  ArrowRight,
  ShieldCheck,
  Check,
  CheckCircle2,
  AlertCircle,
  Truck,
  Sparkles,
  PenTool,
} from 'lucide-react';
import { getCleanPhoneImage, BRAND_FRONT_FALLBACKS, getGenericDevicePlaceholder } from '../../lib/phoneImages';
import { formatINR, formatMaskedPrice } from '../../lib/db';
import { HARDWARE_DEFECTS, ACCESSORIES_LIST } from '../../data/masterModelCatalog';
import { deviceIncludesStylus, getModelReleaseYear, isAmoledDisplay } from '../../lib/deviceSpecs';
import type { FunduQuoteResponse } from '../../lib/quoteEngine';

interface SellStep2ConditionProps {
  form: any;
  setForm: any;
  currentDeviceSpecs: {
    storages: string[];
    rams: string[];
    colors?: string[];
    getRamsForStorage: (stg: string) => string[];
  };
  brandSlug?: string;
  baseModelPrice?: number;
  pricingConfig?: any;
  estimate: number;
  user: any;
  handleGoToLoginForExactPrice: (targetStep?: number) => void;
  toggleDefect: (id: string) => void;
  toggleAccessory: (id: string) => void;
  funduQuote: FunduQuoteResponse | null;
  handleStep2Back: () => void;
  goToStep: (step: number) => void;
}

export default function SellStep2Condition({
  form,
  setForm,
  currentDeviceSpecs,
  brandSlug,
  baseModelPrice,
  pricingConfig,
  estimate,
  user,
  handleGoToLoginForExactPrice,
  toggleDefect,
  toggleAccessory,
  funduQuote,
  handleStep2Back,
  goToStep,
}: SellStep2ConditionProps) {
  const isApple = (form.brand?.toLowerCase() === 'apple') ||
                  (brandSlug?.toLowerCase() === 'apple') ||
                  (form.model?.toLowerCase().includes('iphone'));

  const isAmoled = isAmoledDisplay(form.brand, form.model, pricingConfig?.display_spec);
  const releaseYear = getModelReleaseYear(form.brand, form.model);
  const showsAging = true;
  const hasStylus = deviceIncludesStylus(form.brand, form.model);

  let nextSection = 4; // 1: Power/Ownership, 2: Screen, 3: Display Spots & Issues, 4: Body
  const batterySectionNum = isApple ? ++nextSection : 0;
  const faultsSectionNum = ++nextSection;
  const agingSectionNum = showsAging ? ++nextSection : 0;
  const accessoriesSectionNum = ++nextSection;
  const stylusSectionNum = hasStylus ? ++nextSection : 0;

  const toggleQuestion = (field: string, value: boolean) => {
    setForm((prev: any) => {
      const next = { ...prev, [field]: value };

      const screenCracked = field === 'screenCracked' ? value : !!next.screenCracked;
      const screenMajor = field === 'screenMajorScratches' ? value : !!next.screenMajorScratches;
      const screenMinor = field === 'screenMinorScratches' ? value : !!next.screenMinorScratches;
      const displayMajorLines = field === 'displayMajorLines' ? value : !!next.displayMajorLines;
      const displayMajorSpots = field === 'displayMajorSpots' ? value : !!next.displayMajorSpots;

      let sc = 'flawless';
      if (screenCracked) sc = 'cracked';
      else if (displayMajorLines || displayMajorSpots) sc = 'display_lines';
      else if (screenMajor || screenMinor) sc = 'scratched';

      const bodyCracked = field === 'bodyCrackedOrBroken' ? value : !!next.bodyCrackedOrBroken;
      const bodyMajorDents = field === 'bodyMajorDents' ? value : !!next.bodyMajorDents;
      const bodyMinorDents = field === 'bodyMinorDents' ? value : !!next.bodyMinorDents;
      const bodyMajorSide = field === 'bodyMajorSideScratches' ? value : !!next.bodyMajorSideScratches;
      const bodyMinorSide = field === 'bodyMinorSideScratches' ? value : !!next.bodyMinorSideScratches;

      let bc = 'flawless';
      let cc = 'flawless';
      if (bodyCracked || bodyMajorDents) {
        bc = 'dents_bent';
        cc = 'fair';
      } else if (bodyMinorDents || bodyMajorSide || bodyMinorSide) {
        bc = 'minor_scratches';
        cc = 'good';
      }

      if (screenCracked) cc = 'fair';
      else if (screenMajor || screenMinor) cc = 'good';

      return {
        ...next,
        screenCondition: sc,
        bodyCondition: bc,
        cosmeticCondition: cc,
      };
    });
  };

  const availableRams = currentDeviceSpecs?.getRamsForStorage
    ? currentDeviceSpecs.getRamsForStorage(form.storage)
    : (currentDeviceSpecs?.rams || []);

  const effectiveBasePrice = (baseModelPrice && baseModelPrice > 0)
    ? baseModelPrice
    : (pricingConfig?.base_price || 0);

  const rawOffer = funduQuote?.offerAmount ?? estimate;
  const currentLiveOffer = Math.min(effectiveBasePrice > 0 ? effectiveBasePrice : 180000, Math.max(500, rawOffer));
  const totalDeductions = effectiveBasePrice > 0 ? Math.max(0, effectiveBasePrice - currentLiveOffer) : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="card p-6 md:p-8 rounded-[28px] bg-white border border-gray-200 shadow-xl space-y-6">
        {/* SELECTED PRODUCT DETAIL SHOWCASE CARD */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#F0F0F5] via-white to-[#F7F7FA] border border-[#C0C8D8] shadow-xs flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
          <div className="h-24 w-24 sm:h-28 sm:w-28 shrink-0 rounded-2xl bg-white p-2 border border-[#C0C8D8] flex items-center justify-center shadow-xs">
            <img
              src={getCleanPhoneImage(form.brand, form.model)}
              alt={form.model}
              className="h-full w-full object-contain drop-shadow-xs"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.currentTarget;
                const bSlug = (form.brand || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                if (!target.dataset.triedBrandFallback) {
                  target.dataset.triedBrandFallback = 'true';
                  const fallback = BRAND_FRONT_FALLBACKS[bSlug] || BRAND_FRONT_FALLBACKS.apple;
                  if (target.src !== fallback) {
                    target.src = fallback;
                    return;
                  }
                }
                target.src = getGenericDevicePlaceholder(form.brand, form.model);
              }}
            />
          </div>

          <div className="space-y-2 flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="badge bg-[#344257] text-white font-extrabold text-[11px] px-2 py-0.5">
                {form.brand}
              </span>
              <h3 className="font-extrabold text-base sm:text-lg text-gray-900">
                {form.model} {form.ram && availableRams.length > 1 ? `(${form.ram} / ${form.storage})` : `(${form.storage})`}
              </h3>
            </div>

            {/* Quick Storage Variant Switcher */}
            <div className="flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-gray-500 mr-1">Storage:</span>
              {currentDeviceSpecs.storages.map((stg) => (
                <button
                  key={stg}
                  type="button"
                  onClick={() => {
                    const nextRams = currentDeviceSpecs.getRamsForStorage(stg);
                    const nextRam = nextRams.length > 1 ? (nextRams.includes(form.ram) ? form.ram : nextRams[0]) : (nextRams[0] || '');
                    setForm((f) => ({ ...f, storage: stg, ram: nextRam }));
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${form.storage === stg
                    ? 'bg-[#344257] text-white shadow-xs'
                    : 'bg-white text-gray-700 border border-[#C0C8D8] hover:bg-[#F0F0F5] hover:border-[#6A859F]'
                    }`}
                >
                  {stg}
                </button>
              ))}
            </div>

            {/* Quick RAM Variant Switcher (strictly displays only when multiple authentic RAMs exist for the chosen storage) */}
            {availableRams.length > 1 && (
              <div className="flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-gray-500 mr-1">RAM:</span>
                {availableRams.map((ramVal) => (
                  <button
                    key={ramVal}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, ram: ramVal }))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${form.ram === ramVal
                      ? 'bg-[#344257] text-white shadow-xs'
                      : 'bg-white text-gray-700 border border-[#C0C8D8] hover:bg-[#F0F0F5] hover:border-[#6A859F]'
                      }`}
                  >
                    {ramVal}
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-center sm:justify-start gap-1 sm:gap-2.5 pt-0.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#344257] bg-[#F0F0F5] border border-[#C0C8D8] px-3 py-1 rounded-xl">
                <Sparkles className="h-3.5 w-3.5 text-[#6A859F]" /> Answer condition questions below to calculate exact price
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-block">
                Condition-Based Valuation
              </span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-center sm:items-end gap-1.5">
            <button
              type="button"
              onClick={handleStep2Back}
              className="btn-outline text-xs px-3 py-1.5 rounded-xl border-[#C0C8D8] text-[#344257] hover:border-[#6A859F] hover:text-[#344257] font-bold transition"
            >
              Change Model
            </button>
            <span className="badge bg-[#F0F0F5] text-[#344257] border border-[#C0C8D8] text-[10px] font-bold px-2 py-0.5">
              Step 2 of 4
            </span>
          </div>
        </div>

        {/* BASE PRICE & LIVE REAL-TIME OFFER HERO BAR */}
        <div className="rounded-2xl bg-gradient-to-r from-[#1E2734] via-[#344257] to-[#47576E] p-4 sm:p-5 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#C0C8D8]/20">
          <div className="text-center sm:text-left space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="badge bg-white/20 text-white font-black text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-md">
                Starting Base Price
              </span>
              <span className="text-[11px] text-emerald-300 font-bold">100% Flawless Benchmark</span>
            </div>
            <div className="flex items-baseline justify-center sm:justify-start gap-2">
              <span className="font-display text-2xl sm:text-3xl font-black text-white">
                {effectiveBasePrice > 0 ? formatINR(effectiveBasePrice) : 'Calculating...'}
              </span>
            </div>
            <p className="text-[11px] text-gray-300">
              Starting base quote. Your answers below will generate your final spot cash quote.
            </p>
          </div>
        </div>

        {/* 1. Critical Device Status & Ownership */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="label text-sm font-extrabold text-gray-900">
              1. Device Power, Security & Ownership
            </label>
            <span className="text-[11px] text-[#6A859F] font-bold">Mandatory Verification</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Powers On */}
            <div className={`p-4 rounded-2xl border transition-all ${form.powersOn ? 'bg-white border-gray-200' : 'bg-amber-50/70 border-amber-300'
              }`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-xs text-gray-900">Does phone turn on & stay on?</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Powers on without being plugged in</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, powersOn: true }))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${form.powersOn ? 'bg-[#344257] text-white shadow-xs' : 'bg-white text-gray-600 border border-gray-200'
                      }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, powersOn: false }))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${!form.powersOn ? 'bg-rose-600 text-white shadow-xs' : 'bg-white text-gray-600 border border-gray-200'
                      }`}
                  >
                    No
                  </button>
                </div>
              </div>
              {!form.powersOn && (
                <p className="mt-2 text-[10px] text-rose-700 font-bold bg-rose-100/70 px-2 py-1 rounded-lg">
                  ⚠️ Non-powering devices are routed to manual doorstep physical inspection.
                </p>
              )}
            </div>

            {/* Activation Locks Cleared */}
            <div className={`p-4 rounded-2xl border transition-all ${form.activationLockCleared ? 'bg-white border-gray-200' : 'bg-amber-50/70 border-amber-300'
              }`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-xs text-gray-900">Activation locks removed?</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">iCloud, Google, Mi Account logged out</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, activationLockCleared: true }))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${form.activationLockCleared ? 'bg-[#344257] text-white shadow-xs' : 'bg-white text-gray-600 border border-gray-200'
                      }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, activationLockCleared: false }))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${!form.activationLockCleared ? 'bg-rose-600 text-white shadow-xs' : 'bg-white text-gray-600 border border-gray-200'
                      }`}
                  >
                    No
                  </button>
                </div>
              </div>
              {!form.activationLockCleared && (
                <p className="mt-2 text-[10px] text-rose-700 font-bold bg-rose-100/70 px-2 py-1 rounded-lg">
                  ⚠️ Accounts must be signed out before or during technician pickup.
                </p>
              )}
            </div>

            {/* Proof of Ownership */}
            <div className="p-4 rounded-2xl border border-gray-200 bg-white flex items-center justify-between">
              <div>
                <p className="font-bold text-xs text-gray-900">Can provide proof of ownership?</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Govt Photo ID (Aadhaar / Driving License)</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, ownershipVerified: true }))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${form.ownershipVerified ? 'bg-[#344257] text-white shadow-xs' : 'bg-white text-gray-600 border border-gray-200'
                    }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, ownershipVerified: false }))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${!form.ownershipVerified ? 'bg-rose-600 text-white shadow-xs' : 'bg-white text-gray-600 border border-gray-200'
                    }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* Liquid Damage */}
            <div className={`p-4 rounded-2xl border transition-all ${!form.liquidDamage ? 'bg-white border-gray-200' : 'bg-amber-50/70 border-amber-300'
              }`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-xs text-gray-900">Any liquid or water exposure?</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Dropped in water, steam, or moisture</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, liquidDamage: false }))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${!form.liquidDamage ? 'bg-[#344257] text-white shadow-xs' : 'bg-white text-gray-600 border border-gray-200'
                      }`}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, liquidDamage: true }))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${form.liquidDamage ? 'bg-rose-600 text-white shadow-xs' : 'bg-white text-gray-600 border border-gray-200'
                      }`}
                  >
                    Yes
                  </button>
                </div>
              </div>
              {form.liquidDamage && (
                <p className="mt-2 text-[10px] text-amber-800 font-bold bg-amber-100/70 px-2 py-1 rounded-lg">
                  ⚠️ Liquid-damaged phones require physical inspection for safety.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 2. Screen Condition (PDF Questions 1-3) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-[#344257] text-white flex items-center justify-center font-black text-xs">
                2
              </div>
              <div>
                <label className="label text-sm font-extrabold text-gray-900">
                  Screen Condition
                </label>
                <span className="text-[11px] text-gray-500 block">Outer front glass surface physical assessment</span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">3 Questions</span>
          </div>

          <div className="space-y-2.5">
            {/* Minor Scratches */}
            <QuestionToggleRow
              title="Minor Scratches"
              question="Does the screen have light scratches that are hard to see?"
              value={!!form.screenMinorScratches}
              onChange={(val) => toggleQuestion('screenMinorScratches', val)}
            />

            {/* Major Scratches */}
            <QuestionToggleRow
              title="Major Scratches"
              question="Does the screen have deep scratches that are easy to see or feel?"
              value={!!form.screenMajorScratches}
              onChange={(val) => toggleQuestion('screenMajorScratches', val)}
            />

            {/* Cracked or Broken */}
            <QuestionToggleRow
              title="Cracked or Broken"
              question="Is the screen cracked or broken?"
              value={!!form.screenCracked}
              onChange={(val) => toggleQuestion('screenCracked', val)}
              highlightDanger
              customBadge={
                isAmoled
                  ? 'AMOLED Screen (45% Direct Deduction)'
                  : 'Normal LCD Screen (40% Direct Deduction)'
              }
              customBadgeColor={
                isAmoled
                  ? 'bg-purple-100 text-purple-800 border-purple-300'
                  : 'bg-teal-100 text-teal-800 border-teal-300'
              }
            />
          </div>
        </div>

        {/* 3. Display Spots & Issues (PDF Questions 4-9) */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between pb-1 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-[#344257] text-white flex items-center justify-center font-black text-xs">
                3
              </div>
              <div>
                <label className="label text-sm font-extrabold text-gray-900">
                  Display Spots &amp; Issues
                </label>
                <span className="text-[11px] text-gray-500 block">Internal panel health, spots, lines &amp; color accuracy</span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">6 Questions</span>
          </div>

          {/* Subcategory: Spots */}
          <div className="space-y-2">
            <p className="text-[11px] font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#344257]"></span> Spots
            </p>
            <QuestionToggleRow
              title="Minor Spots (White)"
              question="Are there any small white spots on the display?"
              value={!!form.displayMinorSpotsWhite}
              onChange={(val) => toggleQuestion('displayMinorSpotsWhite', val)}
            />
            <QuestionToggleRow
              title="Major Spots (Black / Green / Other)"
              question="Are there any black, green, or other coloured spots on the display?"
              value={!!form.displayMajorSpots}
              onChange={(val) => toggleQuestion('displayMajorSpots', val)}
              highlightDanger
            />
          </div>

          {/* Subcategory: Lines */}
          <div className="space-y-2 pt-1">
            <p className="text-[11px] font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#344257]"></span> Lines
            </p>
            <QuestionToggleRow
              title="Minor Lines"
              question="Are there any thin or faint lines that show up only sometimes?"
              value={!!form.displayMinorLines}
              onChange={(val) => toggleQuestion('displayMinorLines', val)}
            />
            <QuestionToggleRow
              title="Major Lines"
              question="Are there any bold lines that are always visible on the display?"
              value={!!form.displayMajorLines}
              onChange={(val) => toggleQuestion('displayMajorLines', val)}
              highlightDanger
            />
          </div>

          {/* Subcategory: Discolouration */}
          <div className="space-y-2 pt-1">
            <p className="text-[11px] font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#344257]"></span> Discolouration
            </p>
            <QuestionToggleRow
              title="Minor Discolouration"
              question="Does the display have a slight colour tint that you can notice only when you look closely?"
              value={!!form.displayMinorDiscolouration}
              onChange={(val) => toggleQuestion('displayMinorDiscolouration', val)}
            />
            <QuestionToggleRow
              title="Major Discolouration"
              question="Does the display have a strong colour patch or tint that is easy to see?"
              value={!!form.displayMajorDiscolouration}
              onChange={(val) => toggleQuestion('displayMajorDiscolouration', val)}
            />
          </div>
        </div>

        {/* 4. Body & Frame Condition (PDF Questions 10-14) */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between pb-1 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-[#344257] text-white flex items-center justify-center font-black text-xs">
                4
              </div>
              <div>
                <label className="label text-sm font-extrabold text-gray-900">
                  Body &amp; Frame Condition
                </label>
                <span className="text-[11px] text-gray-500 block">Side panels, metal frame, corners &amp; back integrity</span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">5 Questions</span>
          </div>

          {/* Subcategory: Side Panel Scratches */}
          <div className="space-y-2">
            <p className="text-[11px] font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#344257]"></span> Side Panel Scratches
            </p>
            <QuestionToggleRow
              title="Minor Side Panel Scratches"
              question="Are there any light scratches on the side panels of the phone?"
              value={!!form.bodyMinorSideScratches}
              onChange={(val) => toggleQuestion('bodyMinorSideScratches', val)}
            />
            <QuestionToggleRow
              title="Major Side Panel Scratches"
              question="Are there any deep scratches on the side panels that are easy to see or feel?"
              value={!!form.bodyMajorSideScratches}
              onChange={(val) => toggleQuestion('bodyMajorSideScratches', val)}
            />
          </div>

          {/* Subcategory: Dents */}
          <div className="space-y-2 pt-1">
            <p className="text-[11px] font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#344257]"></span> Dents
            </p>
            <QuestionToggleRow
              title="Minor Dents"
              question="Are there any small dents on the phone, such as on the corners or edges?"
              value={!!form.bodyMinorDents}
              onChange={(val) => toggleQuestion('bodyMinorDents', val)}
            />
            <QuestionToggleRow
              title="Major Dents"
              question="Are there any large or deep dents that change the shape of the phone?"
              value={!!form.bodyMajorDents}
              onChange={(val) => toggleQuestion('bodyMajorDents', val)}
              highlightDanger
            />
          </div>

          {/* Subcategory: Back & Frame Integrity */}
          <div className="space-y-2 pt-1">
            <p className="text-[11px] font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#344257]"></span> Back &amp; Frame Integrity
            </p>
            <QuestionToggleRow
              title="Cracked or Broken Body"
              question="Is the back panel or frame of the phone cracked or broken?"
              value={!!form.bodyCrackedOrBroken}
              onChange={(val) => toggleQuestion('bodyCrackedOrBroken', val)}
              highlightDanger
            />
          </div>
        </div>

        {/* Battery Health (Apple iOS Only - Android does not have battery health percentage) */}
        {isApple && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="label text-sm font-extrabold text-gray-900">
                {batterySectionNum}. iPhone Battery Health (Maximum Capacity %)
              </label>
              <span className="text-[11px] text-gray-500">Settings &gt; Battery &gt; Battery Health</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'above_85',
                  label: '🔋 Above 85% (Optimal)',
                  badge: 'Optimal',
                  badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                  desc: 'Maximum capacity 85% or above, normal backup',
                },
                {
                  id: '75_to_85',
                  label: '⚡ 75% to 85% (Normal)',
                  badge: 'Normal',
                  badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
                  desc: 'Maximum capacity between 75% and 85%',
                },
                {
                  id: 'below_75',
                  label: '⚠️ Below 75% (Service Alert)',
                  badge: 'Service Alert',
                  badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
                  desc: 'Maximum capacity below 75% or service recommendation',
                },
              ].map((bat) => {
                const isSelected = form.batteryHealth === bat.id ||
                  (bat.id === 'above_85' && (form.batteryHealth === 'healthy' || !form.batteryHealth)) ||
                  (bat.id === 'below_75' && form.batteryHealth === 'degraded_service');
                return (
                  <button
                    key={bat.id}
                    type="button"
                    onClick={() => setForm((f: any) => ({ ...f, batteryHealth: bat.id as any }))}
                    className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'border-[#344257] bg-[#F0F0F5] shadow-md ring-2 ring-[#344257]/20 -translate-y-1'
                        : 'border-gray-200 bg-white hover:border-[#6A859F] hover:bg-[#F7F7FA]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-extrabold text-xs text-gray-900">{bat.label}</p>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${bat.badgeColor}`}>
                        {bat.badge}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-gray-500 leading-snug">{bat.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Known Hardware Faults */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="label text-sm font-extrabold text-gray-900">
              {faultsSectionNum}. Other Known Faults (Select any that apply)
            </label>
            <span className="text-[11px] text-gray-500">Leave unchecked if working</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {HARDWARE_DEFECTS.map((def) => {
              const hasDefect = form.defects.includes(def.id);
              return (
                <button
                  key={def.id}
                  type="button"
                  onClick={() => toggleDefect(def.id)}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer ${hasDefect
                    ? 'border-rose-400 bg-rose-50 text-rose-900 shadow-xs'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <div
                    className={`grid h-5 w-5 place-items-center rounded-md transition-colors ${hasDefect ? 'bg-rose-600 text-white' : 'border border-gray-300'
                      }`}
                  >
                    {hasDefect && <Check className="h-3.5 w-3.5" />}
                  </div>
                  {def.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Device Age & Warranty Period (Only for models launched in 2024 or later) */}
        {showsAging && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="label text-sm font-extrabold text-gray-900">
                {agingSectionNum}. Device Age &amp; Purchase Period
              </label>
              <span className="text-[11px] text-[#6A859F] font-bold">How old is your phone?</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: '0_to_3_months',
                  label: '✨ 0 to 3 Months',
                  warranty: true,
                  badge: 'Brand New',
                  badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                  desc: 'Bought recently, valid GST invoice & full brand warranty',
                },
                {
                  id: '3_to_6_months',
                  label: '🛡️ 3 to 6 Months',
                  warranty: true,
                  badge: 'Under Warranty',
                  badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
                  desc: 'Active manufacturer brand warranty remaining',
                },
                {
                  id: '6_to_9_months',
                  label: '⏳ 6 to 11 Months',
                  warranty: true,
                  badge: 'Under Warranty',
                  badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
                  desc: 'Active manufacturer brand warranty remaining',
                },
                {
                  id: 'above_9_months',
                  label: '📅 Older than 11 Months',
                  warranty: false,
                  badge: 'Out of Warranty',
                  badgeColor: 'bg-gray-100 text-gray-700 border-gray-300',
                  desc: 'More than 11 months old, standard out-of-warranty device',
                },
              ].map((age) => {
                const isSelected =
                  (form.agePeriod || 'above_9_months') === age.id ||
                  (age.id === '0_to_3_months' && form.agePeriod === 'below_3_months') ||
                  (age.id === 'above_9_months' &&
                    (form.agePeriod === 'above_11_months' ||
                      form.agePeriod === '10_to_12_months' ||
                      form.agePeriod === '3_to_10_months'));
                return (
                  <button
                    key={age.id}
                    type="button"
                    onClick={() =>
                      setForm((f: any) => ({
                        ...f,
                        agePeriod: age.id,
                        underWarranty: age.warranty,
                      }))
                    }
                    className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'border-[#344257] bg-[#F0F0F5] shadow-md ring-2 ring-[#344257]/20 -translate-y-0.5'
                        : 'border-gray-200 bg-white hover:border-[#6A859F] hover:bg-[#F7F7FA]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-extrabold text-xs text-gray-900">{age.label}</p>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${age.badgeColor}`}
                      >
                        {age.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-snug">{age.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Included Original Accessories */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="label text-sm font-extrabold text-gray-900">
              {accessoriesSectionNum}. Included Original Accessories
            </label>
            <span className="text-[11px] text-gray-500 font-medium">Select included items</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {ACCESSORIES_LIST.map((acc) => {
              const isSel = form.accessories.includes(acc.id);
              return (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => toggleAccessory(acc.id)}
                  className={`rounded-full px-4 py-2 text-xs font-bold border transition-all duration-200 active:scale-95 cursor-pointer ${isSel
                    ? 'border-[#344257] bg-[#344257] text-white shadow-md shadow-slate-500/20 scale-105'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-[#6A859F] hover:bg-[#F0F0F5]'
                    }`}
                >
                  {acc.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* S-Pen / Stylus Availability for supported models (Galaxy S Ultra, Note series, Moto G Stylus) */}
        {deviceIncludesStylus(form.brand, form.model) && (
          <div className="space-y-3 p-4 sm:p-5 rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/50 shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0 mt-0.5 shadow-xs">
                  <PenTool className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5 flex-wrap">
                    {stylusSectionNum}. Original Stylus / S-Pen Available?
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Included With Model
                    </span>
                  </h4>
                  <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                    This phone ({form.model}) comes with an original built-in stylus / S-Pen.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setForm((f: any) => ({ ...f, stylusAvailable: true }))}
                className={`p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${form.stylusAvailable !== false
                  ? 'border-emerald-500 bg-emerald-50/80 text-emerald-950 ring-2 ring-emerald-500/30 shadow-xs'
                  : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-extrabold text-xs text-gray-900">Yes, S-Pen Available & Working</p>
                    <p className="text-[11px] text-emerald-700 font-medium mt-0.5">Original stylus included</p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setForm((f: any) => ({ ...f, stylusAvailable: false }))}
                className={`p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${form.stylusAvailable === false
                  ? 'border-rose-500 bg-rose-50/90 text-rose-950 ring-2 ring-rose-500/30 shadow-xs'
                  : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                  <div>
                    <p className="font-extrabold text-xs text-gray-900">No, S-Pen Missing / Not Available</p>
                    <p className="text-[11px] text-rose-700 font-medium mt-0.5">Original stylus not available</p>
                  </div>
                </div>
              </button>
            </div>
            {form.stylusAvailable === false && (
              <p className="text-[11px] text-gray-600 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-xl">
                Original built-in stylus not included.
              </p>
            )}
          </div>
        )}
        <div className="flex justify-between gap-3 pt-4 border-t border-gray-100">
          <button type="button" onClick={handleStep2Back} className="btn-outline text-sm">
            Back
          </button>
          <button
            type="button"
            onClick={() => goToStep(3)}
            className="btn-primary flex items-center gap-2"
          >
            {funduQuote?.status === 'requires_manual_review'
              ? 'View Inspection Details'
              : 'Calculate & View Final Quote'}{' '}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function QuestionToggleRow({
  title,
  question,
  value,
  onChange,
  highlightDanger = false,
  customBadge,
  customBadgeColor,
}: {
  title: string;
  question: string;
  value: boolean;
  onChange: (val: boolean) => void;
  highlightDanger?: boolean;
  customBadge?: string;
  customBadgeColor?: string;
}) {
  return (
    <div
      className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
        value
          ? highlightDanger
            ? 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-300/40'
            : 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-300/40'
          : 'bg-white border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-gray-900">{title}</span>
            {customBadge && (
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                  customBadgeColor || 'bg-purple-100 text-purple-800 border-purple-300'
                }`}
              >
                {customBadge}
              </span>
            )}
            {value && (
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  highlightDanger
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                Issue Declared
              </span>
            )}
          </div>
          <p className="text-[12px] text-gray-600 leading-snug">{question}</p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={() => onChange(true)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              value
                ? highlightDanger
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-amber-600 text-white shadow-xs'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => onChange(false)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              !value
                ? 'bg-[#344257] text-white shadow-xs'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
            }`}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}

