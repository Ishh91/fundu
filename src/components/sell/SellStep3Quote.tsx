import React from 'react';
import {
  Truck,
  ShieldCheck,
  BadgeIndianRupee,
  PhoneCall,
  ArrowRight,
  Lock,
  AlertCircle,
  Zap,
  Sparkles,
  CheckCircle2,
  PenTool,
} from 'lucide-react';
import { formatINR, formatMaskedPrice } from '../../lib/db';
import { calculateMarketPriceComparison } from '../../lib/mobileApi';
import { deviceIncludesStylus } from '../../lib/deviceSpecs';
import type { FunduQuoteResponse } from '../../lib/quoteEngine';

interface SellStep3QuoteProps {
  form: {
    brand: string;
    model: string;
    storage: string;
    cosmeticCondition: string;
    stylusAvailable?: boolean;
    payoutMethod: 'UPI' | 'Cash' | 'Bank';
    payoutDetails: string;
  };
  setForm: React.Dispatch<React.SetStateAction<any>>;
  estimate: number;
  funduQuote: FunduQuoteResponse | null;
  user: any;
  handleGoToLoginForExactPrice: (targetStep?: number) => void;
  goToStep: (step: number) => void;
}

export default function SellStep3Quote({
  form,
  setForm,
  estimate,
  funduQuote,
  user,
  handleGoToLoginForExactPrice,
  goToStep,
}: SellStep3QuoteProps) {
  const cleanModelForDisplay = (form.model || '').replace(/^(sell\s+|old\s+|used\s+)+/i, '').trim();
  const phoneDisplayName = cleanModelForDisplay.toLowerCase().startsWith(form.brand.toLowerCase())
    ? cleanModelForDisplay
    : `${form.brand} ${cleanModelForDisplay}`;
  const rawInspectionOffer = funduQuote?.offerAmount || estimate;
  const safeInspectionOffer = Math.min(180000, Math.max(500, rawInspectionOffer));

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {funduQuote?.status === 'requires_manual_review' ? (
        /* MANUAL REVIEW / PHYSICAL INSPECTION PATH */
        <div className="card p-6 md:p-8 rounded-[28px] bg-white border border-amber-200 shadow-xl text-center space-y-6">
          <span className="badge bg-amber-100 text-amber-900 border border-amber-300 font-extrabold uppercase tracking-wider text-xs">
            Physical Doorstep Inspection Required
          </span>

          <div>
            <h2 className="font-display text-2xl font-black text-[#344257]">
              {phoneDisplayName} ({form.storage || '128 GB'})
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Transparent On-Site Evaluation · No Fabricated Online Pricing
            </p>
          </div>

          {/* Prominently show Estimated Phone Valuation */}
          <div className="rounded-3xl bg-gradient-to-r from-[#1E2734] via-[#344257] to-[#47576E] p-6 text-white shadow-xl space-y-2 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-[#9ac0dd]">
              Estimated Buyback Value
            </p>
            <div className="font-display text-4xl sm:text-5xl font-black text-white">
              {user ? formatINR(safeInspectionOffer) : formatMaskedPrice(safeInspectionOffer)}
            </div>
            {!user ? (
              <button
                type="button"
                onClick={() => handleGoToLoginForExactPrice(3)}
                className="mt-2 text-xs font-bold text-amber-200 hover:text-white underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Lock className="h-3.5 w-3.5" /> Login to reveal exact price
              </button>
            ) : (
              <div className="mt-1 space-y-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-950/40 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Price Unlocked
                </span>
                <p className="text-xs text-amber-200 font-semibold">
                  Estimated valuation · Final spot payment verified upon doorstep inspection
                </p>
              </div>
            )}
          </div>

          {/* Clear explanation banner */}
          <div className="rounded-3xl bg-gradient-to-r from-[#2A3442] via-[#344257] to-[#40536C] p-6 text-white text-left space-y-3 shadow-lg">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>Evaluation Trigger: {funduQuote.reviewReason || 'Manual Verification'}</span>
            </div>
            <p className="text-xs text-gray-200 leading-relaxed">
              {funduQuote.reviewMessage ||
                'This device condition requires a direct physical inspection by a trained Fundu technician before a guaranteed spot cash quote can be confirmed.'}
            </p>

            {funduQuote.missingConfig && (
              <div className="p-3 rounded-xl bg-black/20 border border-white/10 text-[11px] text-amber-200">
                <strong>Configuration Note:</strong> Pricing benchmark for variant{' '}
                <code>{funduQuote.missingConfig}</code> is awaiting catalog policy update. Fundu never fabricates quotes.
              </div>
            )}

            <div className="pt-2 border-t border-white/10 flex flex-wrap gap-2 text-[11px] text-gray-300">
              <span className="flex items-center gap-1">
                <Truck className="h-3.5 w-3.5 text-emerald-400" /> Free Doorstep Visit
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Zero Obligation / Cancel Anytime
              </span>
              <span className="flex items-center gap-1">
                <BadgeIndianRupee className="h-3.5 w-3.5 text-emerald-400" /> Spot Payout Upon Verification
              </span>
            </div>
          </div>

          {/* Doorstep Action Steps */}
          <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 text-left space-y-2 text-xs">
            <p className="font-extrabold text-[#344257] text-xs uppercase tracking-wide">
              How Doorstep Inspection Works
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-gray-600 leading-relaxed">
              <li>A Fundu certified technician visits your address at your scheduled time.</li>
              <li>They run physical hardware, motherboard, and display diagnostics in front of you.</li>
              <li>You receive an exact guaranteed cash offer on the spot.</li>
              <li>If you accept, receive instant UPI or Cash payment immediately. If not, zero charge.</li>
            </ol>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-3 pt-2">
            <button type="button" onClick={() => goToStep(2)} className="btn-outline text-sm">
              Back to Edit Answers
            </button>
            <div className="flex gap-2">
              <a
                href="tel:+919839122345"
                className="btn-outline text-xs flex items-center justify-center gap-1.5 border-[#C0C8D8] text-[#344257]"
              >
                <PhoneCall className="h-3.5 w-3.5" /> Call Helpline
              </a>
              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    handleGoToLoginForExactPrice(3);
                  } else {
                    goToStep(4);
                  }
                }}
                className="btn-primary flex items-center justify-center gap-2"
              >
                {!user ? 'Login to View Price & Book' : 'Book Free Doorstep Inspection'} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* REGULAR CONDITIONAL ESTIMATE QUOTE PATH */
        <div className="card p-6 md:p-8 rounded-[28px] bg-white border border-gray-200 shadow-xl text-center space-y-6">
          <div>
            <span className="badge bg-[#F0F0F5] text-[#344257] border border-[#C0C8D8] font-extrabold uppercase tracking-wider text-xs">
              Conditional Estimate · Subject to Doorstep Inspection
            </span>
            <h2 className="font-display text-2xl font-black text-[#344257] mt-2">
              {phoneDisplayName} ({form.storage || '128 GB'})
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Cosmetic Grade: <span className="capitalize font-bold text-gray-700">{form.cosmeticCondition}</span> · Policy Version: {funduQuote?.policyVersion || 'v2026.1'}
            </p>
          </div>

          {/* Fundu Theme Dark Quote Box */}
          <div className="rounded-3xl bg-gradient-to-r from-[#1E2734] via-[#344257] to-[#47576E] p-8 text-white shadow-2xl relative overflow-hidden space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[#9ac0dd]">
              Estimated Buyback Offer
            </p>
            {(() => {
              const rawAmt = funduQuote?.offerAmount ?? estimate;
              const safeAmt = Math.min(180000, Math.max(500, rawAmt));
              return (
                <div className="font-display text-4xl sm:text-5xl font-black text-white">
                  {user ? formatINR(safeAmt) : formatMaskedPrice(safeAmt)}
                </div>
              );
            })()}
            {!user ? (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => handleGoToLoginForExactPrice(3)}
                  className="btn bg-white text-[#344257] hover:bg-gray-100 font-black text-xs px-4 py-2 rounded-xl inline-flex items-center gap-1.5 shadow-md cursor-pointer transition"
                >
                  <Lock className="h-3.5 w-3.5 text-[#344257]" /> Want exact price? Login to view
                </button>
              </div>
            ) : (
              <div className="pt-1 space-y-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-950/40 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Guaranteed Price Unlocked
                </span>
                <p className="text-xs text-gray-300">
                  Real guaranteed quote · Subject to physical inspection · Valid for 7 days
                </p>
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-2 text-xs font-semibold pt-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-white border border-white/20">
                <BadgeIndianRupee className="h-3.5 w-3.5" /> Instant Spot Payment
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-white border border-white/20">
                <Truck className="h-3.5 w-3.5" /> Free Doorstep Pickup
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-white border border-white/20">
                <Lock className="h-3.5 w-3.5" /> 100% Data Wipe Guaranteed
              </span>
            </div>
          </div>

          {/* Dedicated Fundu Price Match (+5% Extra Cash Guaranteed) Widget */}
          {(() => {
            const rawAmt = funduQuote?.offerAmount ?? estimate;
            const finalAmt = Math.min(180000, Math.max(500, rawAmt));
            const comparison = calculateMarketPriceComparison(finalAmt);
            return (
              <div className="rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/60 p-5 text-left space-y-3.5 shadow-sm">
                {/* <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                      <Zap className="h-4 w-4 text-emerald-600" /> Fundu Best Price Guarantee
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/60 px-2.5 py-0.5 rounded-full">
                    Guaranteed Highest Payout
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-white p-3.5 rounded-xl border border-gray-200/90 shadow-2xs">
                    <p className="text-[11px] font-bold text-gray-500"> Market Rate</p>
                    <p className="text-base sm:text-lg font-black text-gray-600 line-through decoration-rose-500 decoration-2 mt-0.5">
                      {user ? formatINR(comparison.standardMarketPrice) : formatMaskedPrice(comparison.standardMarketPrice)}
                    </p>
                    <span className="text-[10px] text-gray-400 font-medium">Standard Buyback Sites</span>
                  </div>
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-3.5 rounded-xl shadow-md">
                    <p className="text-[11px] font-bold text-emerald-100">Fundu Spot Cash Offer</p>
                    <p className="text-base sm:text-lg font-black text-white mt-0.5">
                      {user ? formatINR(comparison.funduPrice) : formatMaskedPrice(comparison.funduPrice)}
                    </p>
                  </div>
                </div> */}


              </div>
            );
          })()}

          {/* Understandable Condition-Related Reasons */}
          <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 text-left space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <span className="font-extrabold text-[#344257] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#6A859F]" /> Valuation Condition Summary
              </span>
              <span className="badge bg-[#F0F0F5] text-[#344257] border border-[#C0C8D8] text-[10px] font-bold">
                Algorithm Verified
              </span>
            </div>

            <ul className="space-y-1.5 text-gray-700">
              {funduQuote?.conditionSummary && funduQuote.conditionSummary.length > 0 ? (
                funduQuote.conditionSummary.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-gray-500">Device in evaluated standard condition.</li>
              )}
            </ul>

            {deviceIncludesStylus(form.brand, form.model) && (
              <div
                className={`p-3 rounded-xl border flex items-center justify-between gap-2 text-xs font-bold ${form.stylusAvailable === false
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <PenTool className="h-4 w-4 shrink-0" />
                  <span>
                    Original Stylus / S-Pen:{' '}
                    {form.stylusAvailable === false ? 'Missing / Not Available' : 'Available & Working'}
                  </span>
                </div>
                <span
                  className={`shrink-0 font-extrabold px-2 py-0.5 rounded-md text-[11px] ${form.stylusAvailable === false
                    ? 'bg-rose-200 text-rose-900 border border-rose-300'
                    : 'bg-emerald-200 text-emerald-900 border border-emerald-300'
                    }`}
                >
                  {form.stylusAvailable === false ? 'Not Included' : 'Included'}
                </span>
              </div>
            )}

            <div className="mt-3 p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 text-[11px] text-blue-900 leading-relaxed">
              <strong>Inspection Discrepancy Rule:</strong> If the inspected phone materially differs from your answers above, our technician will explain the mismatch, present a revised offer, and require your explicit acceptance before payment proceeds.
            </div>
          </div>

          {/* Payout Method Selector */}
          <div className="text-left space-y-2">
            <label className="label text-xs font-bold text-gray-900">Choose Instant Payout Method</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'UPI', label: 'Instant UPI / GPay' },
                { id: 'Cash', label: 'Spot Hard Cash' },
                { id: 'Bank', label: 'Bank IMPS Transfer' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setForm((prev: any) => ({ ...prev, payoutMethod: p.id as any }))}
                  className={`p-3 rounded-xl border text-center transition cursor-pointer ${form.payoutMethod === p.id
                    ? 'border-[#344257] bg-[#F0F0F5] font-extrabold text-[#344257] ring-2 ring-[#344257]/20'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <p className="text-xs font-bold">{p.label}</p>
                </button>
              ))}
            </div>

            {form.payoutMethod === 'UPI' && (
              <div className="pt-2">
                <label className="label text-xs">UPI ID / Phone Number (Optional)</label>
                <input
                  type="text"
                  value={form.payoutDetails}
                  onChange={(e) => setForm((prev: any) => ({ ...prev, payoutDetails: e.target.value }))}
                  placeholder="e.g. yourname@oksbi or 9839122345"
                  className="input mt-1 text-xs focus:border-[#6A859F] focus:ring-4 focus:ring-[#6A859F]/15"
                />
              </div>
            )}
          </div>

          <div className="flex justify-between gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => goToStep(2)} className="btn-outline text-sm">
              Back to Edit Answers
            </button>
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  handleGoToLoginForExactPrice(3);
                } else {
                  goToStep(4);
                }
              }}
              className="btn-primary flex items-center gap-2"
            >
              {!user ? 'Login to View Final Price' : 'Accept Quote & Proceed to Schedule Pickup'}{' '}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
