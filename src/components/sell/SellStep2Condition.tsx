import React from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  PenTool,
} from 'lucide-react';
import { getCleanPhoneImage, BRAND_FRONT_FALLBACKS, getGenericDevicePlaceholder } from '../../lib/phoneImages';
import { formatINR } from '../../lib/db';
import { HARDWARE_DEFECTS, ACCESSORIES_LIST } from '../../data/masterModelCatalog';
import { deviceIncludesStylus, calculateRamPriceOffset } from '../../lib/deviceSpecs';
import { getCleanModelName } from '../../lib/modelCatalogSync';
import type { FunduQuoteResponse } from '../../lib/quoteEngine';
import type { SellFormState } from '../../lib/sellForm';
import { deriveCondition } from '../../lib/sellCondition';
import {
  QUESTION_SECTIONS,
  applyChoice,
  clearSection,
  sectionHasAnswers,
  selectedOptionId,
  type QuestionGroup,
  type QuestionSection,
} from '../../lib/sellQuestions';
import type { User } from '../../lib/db';

/** Cashify's eSIM question. It is asked and saved with the request; it does not change the price. */
const ESIM_GROUP: QuestionGroup = {
  id: 'esim',
  title: 'How many eSIMs does your device support?',
  help: 'Choose "Dual eSIM" if your device supports two eSIMs. Otherwise choose "Single eSIM".',
  options: [
    { id: 'single', label: 'Single eSIM', sets: {} },
    { id: 'dual', label: 'Dual eSIM', sets: {} },
  ],
};

interface SellStep2ConditionProps {
  form: SellFormState;
  setForm: React.Dispatch<React.SetStateAction<SellFormState>>;
  currentDeviceSpecs: {
    storages: string[];
    rams: string[];
    colors?: string[];
    getRamsForStorage: (stg: string) => string[];
    combinedVariants?: { storage: string; ram: string; label: string; key: string }[];
  };
  brandSlug?: string;
  baseModelPrice?: number;
  pricingConfig?: any;
  estimate: number;
  user: User | null;
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
  toggleDefect,
  toggleAccessory,
  funduQuote,
  handleStep2Back,
  goToStep,
}: SellStep2ConditionProps) {
  const isApple = (form.brand?.toLowerCase() === 'apple') ||
    (brandSlug?.toLowerCase() === 'apple') ||
    (form.model?.toLowerCase().includes('iphone'));

  const showsAging = true;
  const hasStylus = deviceIncludesStylus(form.brand, form.model);

  // A kind of damage is open when the customer ticked it, or when an answer in it already says something is wrong.
  const isAreaOn = (section: QuestionSection) => form.defectAreas.includes(section.id) || sectionHasAnswers(section, form);
  const visibleSections = QUESTION_SECTIONS.filter(isAreaOn);

  // 1: Power, Ownership & calls, 2: which damage applies, then one section for each kind of damage ticked.
  let nextSection = 2 + visibleSections.length;
  const batterySectionNum = isApple ? ++nextSection : 0;
  const faultsSectionNum = ++nextSection;
  const agingSectionNum = showsAging ? ++nextSection : 0;
  const warrantySectionNum = ++nextSection;
  const accessoriesSectionNum = ++nextSection;
  const stylusSectionNum = hasStylus ? ++nextSection : 0;

  const toggleQuestion = (field: string, value: boolean) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // Every screen, display, touch and body answer feeds the quote through one shared rule.
      return { ...next, ...deriveCondition(next) };
    });
  };

  /** Picks one description for a part of the phone (for example the screen) and re-derives how the phone is priced. */
  const chooseOption = (group: QuestionGroup, optionId: string) => {
    setForm((prev) => {
      const next = { ...prev, ...applyChoice(group, optionId, prev) };
      return { ...next, ...deriveCondition(next) };
    });
  };

  /** Ticks or unticks a kind of damage. Unticking it clears its answers, so a phone is never priced on damage the customer said does not apply. */
  const toggleArea = (section: QuestionSection) => {
    setForm((prev) => {
      const isOn = prev.defectAreas.includes(section.id) || sectionHasAnswers(section, prev);
      if (!isOn) return { ...prev, defectAreas: [...prev.defectAreas, section.id] };
      const next = { ...prev, ...clearSection(section, prev), defectAreas: prev.defectAreas.filter((id) => id !== section.id) };
      return { ...next, ...deriveCondition(next) };
    });
  };

  /** A fault that the quote prices like any other declared fault, kept in the same list as the faults below. */
  const setFault = (faultId: string, present: boolean) => {
    setForm((prev) => {
      const others = prev.defects.filter((d) => d !== faultId);
      return { ...prev, defects: present ? [...others, faultId] : others };
    });
  };

  const availableRams = currentDeviceSpecs?.getRamsForStorage
    ? currentDeviceSpecs.getRamsForStorage(form.storage)
    : (currentDeviceSpecs?.rams || []);

  const ramOffset = calculateRamPriceOffset(form.ram, availableRams, form.brand);

  const effectiveBasePrice = (baseModelPrice && baseModelPrice > 0)
    ? baseModelPrice
    : ((pricingConfig?.base_price || 0) > 0 ? (pricingConfig?.base_price || 0) + ramOffset : 0);



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
                {getCleanModelName(form.brand, form.model)} {form.ram ? `(${form.ram}/${form.storage})` : `(${form.storage})`}
              </h3>
            </div>

            {/* Choose a variant (Single-Click Unified RAM/Storage Selector matching screenshot) */}
            <div className="pt-2 text-left space-y-2.5">
              <label className="text-sm font-extrabold text-gray-900 block tracking-tight">
                Choose a variant
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {(currentDeviceSpecs?.combinedVariants || []).map((v: any) => {
                  const isSelected = form.storage === v.storage && (v.ram ? form.ram === v.ram : true);
                  return (
                    <button
                      key={v.key}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, storage: v.storage, ram: v.ram }))}
                      className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#344257] bg-white shadow-sm ring-2 ring-[#344257]/20'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                      }`}
                    >
                      <span className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? 'border-[#344257] bg-white' : 'border-gray-300 bg-white'
                      }`}>
                        {isSelected && <span className="h-2.5 w-2.5 rounded-full bg-[#344257]" />}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-gray-900">{v.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

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

            {/* Calls (Cashify asks this on its first page) */}
            <YesNoQuestion
              title="Are you able to make and receive calls?"
              help="Check your phone for network or calling problems."
              value={form.canMakeCalls !== false}
              onChange={(works) => {
                setForm((f) => ({ ...f, canMakeCalls: works }));
                setFault('calls_not_working', !works);
              }}
            />

            {/* Original screen (Cashify asks this on its first page) */}
            <YesNoQuestion
              title="Is your phone's screen original?"
              help="Choose Yes if the screen was never changed, or was changed by an authorised service centre. Choose No if it was changed at a local shop."
              value={!form.defects.includes('screen_not_original')}
              onChange={(original) => setFault('screen_not_original', !original)}
            />

            {/* Touch (Cashify asks this on its first page) */}
            <YesNoQuestion
              title="Is your device's touch screen working properly?"
              help="Check the touch screen of your phone: no dead areas, no ghost touches."
              value={!form.touchFault}
              onChange={(working) => toggleQuestion('touchFault', !working)}
            />
          </div>
        </div>

        {/* 2. Which kinds of damage apply (Cashify asks this before the detailed questions) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-[#344257] text-white flex items-center justify-center font-black text-xs">
                2
              </div>
              <div>
                <label className="label text-sm font-extrabold text-gray-900">
                  Select screen / body defects that are applicable
                </label>
                <span className="text-[11px] text-gray-500 block">
                  Tick what is wrong with your phone. We only ask about what you tick. Leave all unticked if there is no damage.
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {QUESTION_SECTIONS.map((section) => {
              const isOn = isAreaOn(section);
              return (
                <button
                  key={section.id}
                  type="button"
                  role="checkbox"
                  aria-checked={isOn}
                  onClick={() => toggleArea(section)}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                    isOn
                      ? 'border-rose-400 bg-rose-50 text-rose-900 shadow-xs'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-md transition-colors ${
                      isOn ? 'bg-rose-600 text-white' : 'border border-gray-300'
                    }`}
                  >
                    {isOn && <Check className="h-3.5 w-3.5" />}
                  </span>
                  {section.applies}
                </button>
              );
            })}
          </div>
        </div>

        {/* The detailed questions for each kind of damage the customer ticked */}
        {visibleSections.map((section, sectionIndex) => (
          <div key={section.id} className="space-y-3.5">
            <div className="flex items-center justify-between pb-1 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-[#344257] text-white flex items-center justify-center font-black text-xs">
                  {sectionIndex + 3}
                </div>
                <div>
                  <label className="label text-sm font-extrabold text-gray-900">
                    {section.title}
                  </label>
                  <span className="text-[11px] text-gray-500 block">{section.subtitle}</span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                {section.groups.length} {section.groups.length === 1 ? 'Question' : 'Questions'}
              </span>
            </div>

            {section.groups.map((group) => (
              <ChoiceGroupCard
                key={group.id}
                group={group}
                selectedId={selectedOptionId(group, form)}
                onSelect={(optionId) => chooseOption(group, optionId)}
              />
            ))}
          </div>
        ))}

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
                    onClick={() => setForm((f) => ({ ...f, batteryHealth: bat.id as SellFormState['batteryHealth'] }))}
                    className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${isSelected
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
            {HARDWARE_DEFECTS.filter((def) => !(isApple && def.id === 'battery_fault')).map((def) => {
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
                      setForm((f) => ({
                        ...f,
                        agePeriod: age.id as SellFormState['agePeriod'],
                        underWarranty: age.warranty,
                      }))
                    }
                    className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${isSelected
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

        {/* Warranty, purchase bill and eSIM (asked on Cashify's first page) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="label text-sm font-extrabold text-gray-900">
              {warrantySectionNum}. {isApple ? 'Warranty, Bill & eSIM' : 'Warranty & Bill'}
            </label>
            <span className="text-[11px] text-[#6A859F] font-bold">Better price with a valid bill</span>
          </div>
          <YesNoQuestion
            title="Is your device under manufacturer warranty?"
            help="You get a better price if it is under manufacturer warranty with a GST valid bill. This follows the age you picked above; change it if it is wrong."
            value={!!form.underWarranty}
            onChange={(inWarranty) => setForm((f) => ({ ...f, underWarranty: inWarranty }))}
          />
          <YesNoQuestion
            title="Do you have a GST valid bill with the same IMEI?"
            help="Make sure the bill has the device IMEI written on it."
            value={form.accessories.includes('Valid Bill')}
            onChange={(hasBill) => {
              if (hasBill !== form.accessories.includes('Valid Bill')) toggleAccessory('Valid Bill');
            }}
          />
          {isApple && (
            <ChoiceGroupCard
              neutral
              group={ESIM_GROUP}
              selectedId={form.esimCount}
              onSelect={(optionId) => setForm((f) => ({ ...f, esimCount: optionId === 'dual' ? 'dual' : 'single' }))}
            />
          )}
        </div>

        {/* Included Original Accessories */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="label text-sm font-extrabold text-gray-900">
              {accessoriesSectionNum}. Included Original Accessories
            </label>
            <span className="text-[11px] text-gray-500 font-medium">Select included items</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {ACCESSORIES_LIST.filter((acc) => acc.id !== 'Valid Bill').map((acc) => {
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
                onClick={() => setForm((f) => ({ ...f, stylusAvailable: true }))}
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
                onClick={() => setForm((f) => ({ ...f, stylusAvailable: false }))}
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

function ChoiceGroupCard({
  group,
  selectedId,
  onSelect,
  neutral = false,
}: {
  group: QuestionGroup;
  selectedId: string;
  onSelect: (optionId: string) => void;
  /** True for choices that are not a problem with the phone, so no choice is shown as an issue. */
  neutral?: boolean;
}) {
  return (
    <div className="p-3.5 sm:p-4 rounded-2xl border border-gray-200 bg-white space-y-2.5">
      <div>
        <p className="text-xs font-extrabold text-gray-900">{group.title}</p>
        <p className="text-[11px] text-gray-500 mt-0.5">{group.help}</p>
      </div>
      <div role="radiogroup" aria-label={group.title} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {group.options.map((option) => {
          const isSelected = option.id === selectedId;
          const hasIssue = !neutral && isSelected && option.id !== 'none';
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(option.id)}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? hasIssue && option.severe
                    ? 'border-rose-400 bg-rose-50 text-rose-900 ring-1 ring-rose-300/40'
                    : hasIssue
                      ? 'border-amber-400 bg-amber-50 text-amber-900 ring-1 ring-amber-300/40'
                      : 'border-[#344257] bg-[#F0F0F5] text-gray-900 ring-1 ring-[#344257]/20'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <span
                className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  isSelected ? 'border-[#344257]' : 'border-gray-300'
                }`}
              >
                {isSelected && <span className="h-2 w-2 rounded-full bg-[#344257]" />}
              </span>
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function YesNoQuestion({
  title,
  help,
  value,
  onChange,
}: {
  title: string;
  help: string;
  /** True when the answer is "Yes". */
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="p-3.5 sm:p-4 rounded-2xl border border-gray-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="space-y-1">
        <p className="text-xs font-bold text-gray-900">{title}</p>
        <p className="text-[11px] text-gray-500 leading-snug">{help}</p>
      </div>
      <div role="radiogroup" aria-label={title} className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
        <button
          type="button"
          role="radio"
          aria-checked={value}
          onClick={() => onChange(true)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            value ? 'bg-[#344257] text-white shadow-xs' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
          }`}
        >
          Yes
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={!value}
          onClick={() => onChange(false)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            !value ? 'bg-rose-600 text-white shadow-xs' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
          }`}
        >
          No
        </button>
      </div>
    </div>
  );
}
