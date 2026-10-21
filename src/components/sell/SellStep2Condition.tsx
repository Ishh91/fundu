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
} from 'lucide-react';
import { getCleanPhoneImage, getGenericDevicePlaceholder } from '../../lib/phoneImages';
import { formatINR, formatMaskedPrice } from '../../lib/db';
import { HARDWARE_DEFECTS, ACCESSORIES_LIST } from '../../data/masterModelCatalog';
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
  estimate,
  user,
  handleGoToLoginForExactPrice,
  toggleDefect,
  toggleAccessory,
  funduQuote,
  handleStep2Back,
  goToStep,
}: SellStep2ConditionProps) {
  const availableRams = currentDeviceSpecs?.getRamsForStorage
    ? currentDeviceSpecs.getRamsForStorage(form.storage)
    : (currentDeviceSpecs?.rams || []);

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
                if (!target.dataset.triedCanonical && form.brand && form.model) {
                  target.dataset.triedCanonical = 'true';
                  const bSlug = form.brand.toLowerCase().replace(/[^a-z0-9]/g, '');
                  const mSlug = form.model.toLowerCase().replace(new RegExp(`^${bSlug}\\s*`, 'i'), '').replace(/\+/g, '-plus').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                  const canonical = `https://fdn2.gsmarena.com/vv/bigpic/${bSlug}-${mSlug}.jpg`;
                  if (target.src !== canonical) {
                    target.src = canonical;
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
                {form.model} {form.ram ? `(${form.ram} / ${form.storage})` : `(${form.storage})`}
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
                    const nextRam = nextRams.includes(form.ram) ? form.ram : (nextRams[0] || '');
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

            {/* Quick RAM Variant Switcher (strictly displays only officially launched RAMs for the chosen storage) */}
            {availableRams.length > 0 && (
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

        {/* 2. Screen & Touch Condition */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="label text-sm font-extrabold text-gray-900">
              2. Screen / Display & Touch Condition
            </label>
            <span className="text-[11px] text-gray-500">Select exact state</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'flawless', label: '🌟 Flawless Screen', desc: 'No scratches, scuffs, or glass marks' },
              { id: 'scratched', label: '🔍 Light Scratches', desc: 'Minor hairline scratches on glass' },
              { id: 'cracked', label: '⚡ Cracked Glass', desc: 'Cracked or shattered outer screen glass' },
              { id: 'touch_fault', label: '👆 Touch Issues / Dead Zones', desc: 'Touch unresponsive in parts' },
              { id: 'display_lines', label: '🌈 Display Lines / Bleed', desc: 'Black spots, green/white lines' },
            ].map((sc) => (
              <button
                key={sc.id}
                type="button"
                onClick={() => setForm((f) => ({ ...f, screenCondition: sc.id as any }))}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${form.screenCondition === sc.id
                    ? 'border-[#344257] bg-[#F0F0F5] shadow-md ring-2 ring-[#344257]/20 -translate-y-1'
                    : 'border-gray-200 bg-white hover:border-[#6A859F] hover:bg-[#F7F7FA]'
                  }`}
              >
                <p className="font-extrabold text-xs text-gray-900">{sc.label}</p>
                <p className="mt-1 text-[11px] text-gray-500 leading-snug">{sc.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Cosmetic Body Condition */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="label text-sm font-extrabold text-gray-900">
              3. Body / Frame Cosmetic Condition
            </label>
            <span className="text-[11px] text-gray-500">Back panel & sides</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'flawless',
                cosmetic: 'flawless' as const,
                label: '🌟 Flawless / Like New',
                desc: 'Zero marks, zero dents, looks brand new',
              },
              {
                id: 'minor_scratches',
                cosmetic: 'good' as const,
                label: '🔨 Normal Daily Wear',
                desc: 'Minor hairline scratches or pocket scuffs',
              },
              {
                id: 'dents_bent',
                cosmetic: 'fair' as const,
                label: '💥 Heavy Dents / Bent / Back Crack',
                desc: 'Noticeable dents, back cracked or frame bent',
              },
            ].map((bc) => (
              <button
                key={bc.id}
                type="button"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    bodyCondition: bc.id as any,
                    cosmeticCondition: bc.cosmetic,
                  }))
                }
                className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${form.bodyCondition === bc.id
                    ? 'border-[#344257] bg-[#F0F0F5] shadow-md ring-2 ring-[#344257]/20 -translate-y-1'
                    : 'border-gray-200 bg-white hover:border-[#6A859F] hover:bg-[#F7F7FA]'
                  }`}
              >
                <p className="font-extrabold text-xs text-gray-900">{bc.label}</p>
                <p className="mt-1 text-[11px] text-gray-500 leading-snug">{bc.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 4. Battery Health */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="label text-sm font-extrabold text-gray-900">
              4. Battery Health (if known)
            </label>
            <span className="text-[11px] text-gray-500">Capacity & backup</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'healthy',
                label: '🔋 Healthy (85%+ / Normal)',
                desc: 'Holds full day charge without quick drain',
              },
              {
                id: 'degraded_service',
                label: '⚠️ Degraded / Service (<80%)',
                desc: 'Needs frequent charging or shows Service',
              },
              {
                id: 'unknown',
                label: '❓ Unknown / Cannot Check',
                desc: 'Not sure or Android without % indicator',
              },
            ].map((bat) => (
              <button
                key={bat.id}
                type="button"
                onClick={() => setForm((f) => ({ ...f, batteryHealth: bat.id as any }))}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${form.batteryHealth === bat.id
                    ? 'border-[#344257] bg-[#F0F0F5] shadow-md ring-2 ring-[#344257]/20 -translate-y-1'
                    : 'border-gray-200 bg-white hover:border-[#6A859F] hover:bg-[#F7F7FA]'
                  }`}
              >
                <p className="font-extrabold text-xs text-gray-900">{bat.label}</p>
                <p className="mt-1 text-[11px] text-gray-500 leading-snug">{bat.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 5. Known Hardware Faults */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="label text-sm font-extrabold text-gray-900">
              5. Other Known Faults (Select any that apply)
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

        {/* 6. Warranty & Original Accessories */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="label text-sm font-extrabold text-gray-900">
              6. Warranty & Included Original Accessories
            </label>
            <span className="text-[11px] text-emerald-600 font-bold">Earns Extra Bonus</span>
          </div>

          <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 flex items-center justify-between mb-2">
            <div>
              <p className="font-bold text-xs text-gray-900">Is phone under valid brand warranty?</p>
              <p className="text-[11px] text-gray-500">Original manufacturer warranty invoice available</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, underWarranty: true }))}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${form.underWarranty ? 'bg-[#344257] text-white shadow-xs' : 'bg-white text-gray-600 border border-gray-200'
                  }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, underWarranty: false }))}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${!form.underWarranty ? 'bg-gray-700 text-white shadow-xs' : 'bg-white text-gray-600 border border-gray-200'
                  }`}
              >
                No
              </button>
            </div>
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
                  {acc.label} <span className="opacity-80 font-normal">{acc.bonus}</span>
                </button>
              );
            })}
          </div>
        </div>

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
