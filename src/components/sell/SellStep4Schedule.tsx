import React, { useState } from 'react';
import {
  MapPin,
  Search,
  RefreshCw,
  X,
  Check,
  CheckCircle2,
  AlertCircle,
  User,
  Phone,
  Sparkles,
} from 'lucide-react';
import { formatINR } from '../../lib/db';
import {
  PAN_INDIA_POPULAR_CITIES,
  verifyPanIndiaPincode,
  type PanIndiaLocation,
  type VerifiedLocation,
} from '../../lib/locationService';
import { checkPincodeServiceability } from '../../lib/pincodeService';

interface SellStep4ScheduleProps {
  form: {
    brand: string;
    model: string;
    storage: string;
    payoutMethod: string;
    customerName: string;
    customerPhone: string;
    pincode: string;
    locality: string;
    pickupAddress: string;
    pickupArea: string;
    pickupDate: string;
    pickupSlot: string;
    notes?: string;
  };
  setForm: React.Dispatch<React.SetStateAction<any>>;
  estimate: number;
  submitting: boolean;
  error: string | null;
  pickupSearchQuery: string;
  setPickupSearchQuery: (val: string) => void;
  pickupSearchResults: PanIndiaLocation[];
  isSearchingPickupLoc: boolean;
  handleSubmit: () => void;
  onBack: () => void;
  profile: any;
}

export default function SellStep4Schedule({
  form,
  setForm,
  estimate,
  submitting,
  error,
  pickupSearchQuery,
  setPickupSearchQuery,
  pickupSearchResults,
  isSearchingPickupLoc,
  handleSubmit,
  onBack,
  profile,
}: SellStep4ScheduleProps) {
  const [verifyingPin, setVerifyingPin] = useState(false);
  const [verifiedLoc, setVerifiedLoc] = useState<VerifiedLocation | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);

  const handlePincodeChange = async (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 6);
    setForm((prev: any) => ({ ...prev, pincode: clean }));

    if (clean.length === 6) {
      setVerifyingPin(true);
      setPinError(null);
      try {
        // 1. Verify doorstep serviceability for sell
        const serviceCheck = await checkPincodeServiceability(clean, 'sell');
        if (!serviceCheck.serviceable) {
          setVerifiedLoc(null);
          setPinError(serviceCheck.message || 'Doorstep service is currently not available at this pincode. We are rapidly expanding to new areas!');
          return;
        }

        // 2. Query postal metadata for locality suggestions
        const res = await verifyPanIndiaPincode(clean);
        if (res.valid) {
          setVerifiedLoc(res);
          setPinError(null);
          setForm((prev: any) => ({
            ...prev,
            pickupArea: `${res.city}, ${res.state} (${res.pincode})`,
          }));
        } else {
          const fallbackLoc: VerifiedLocation = {
            valid: true,
            city: serviceCheck.city || 'Service Hub',
            state: serviceCheck.state || 'India',
            pincode: clean,
          };
          setVerifiedLoc(fallbackLoc);
          setPinError(null);
          setForm((prev: any) => ({
            ...prev,
            pickupArea: `${fallbackLoc.city}, ${fallbackLoc.state} (${clean})`,
          }));
        }
      } catch (_err) {
        setPinError('Could not verify PIN code. Check connection.');
      } finally {
        setVerifyingPin(false);
      }
    } else {
      setVerifiedLoc(null);
      setPinError(null);
    }
  };
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="card p-6 md:p-8 rounded-[28px] bg-white border border-gray-200 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <span className="badge bg-[#F0F0F5] text-[#344257] border border-[#C0C8D8] font-bold">Step 4 of 4</span>
            <h2 className="mt-1 font-display text-xl font-extrabold text-[#344257]">
              Schedule Doorstep Pickup
            </h2>
            <p className="text-xs text-gray-500">
              Guaranteed Payout: <span className="font-extrabold text-[#344257]">{formatINR(estimate)}</span> ({form.payoutMethod})
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        <div className="space-y-4 text-left">
          {/* Customer Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="label text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <User className="h-4 w-4 text-[#344257]" /> Full Name *
              </label>
              <input
                required
                type="text"
                value={form.customerName}
                onChange={(e) => setForm((prev: any) => ({ ...prev, customerName: e.target.value }))}
                placeholder="Enter your full name"
                className="input mt-1 text-xs sm:text-sm focus:border-[#6A859F] focus:ring-4 focus:ring-[#6A859F]/15"
              />
            </div>
            <div>
              <label className="label text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-[#344257]" /> Mobile Number *
              </label>
              <input
                required
                type="tel"
                maxLength={10}
                value={form.customerPhone}
                onChange={(e) => setForm((prev: any) => ({ ...prev, customerPhone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                placeholder="10-digit mobile number"
                className="input mt-1 text-xs sm:text-sm focus:border-[#6A859F] focus:ring-4 focus:ring-[#6A859F]/15"
              />
              <span className="text-[10px] text-gray-400 mt-0.5 block">Technician calls on this number before doorstep arrival</span>
            </div>
          </div>

          {/* Proper Pincode & Locality with Auto-Verification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="label text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-[#344257]" /> Pincode (PIN Code) *
                </label>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                  Auto-Verified
                </span>
              </div>
              <div className="relative">
                <input
                  required
                  type="text"
                  maxLength={6}
                  value={form.pincode}
                  onChange={(e) => handlePincodeChange(e.target.value)}
                  placeholder="6-digit PIN (e.g. 226010)"
                  className={`input text-xs sm:text-sm font-semibold tracking-wider ${
                    verifiedLoc?.valid
                      ? 'border-emerald-500 bg-emerald-50/20 text-gray-900'
                      : pinError
                      ? 'border-rose-400 bg-rose-50/20 text-rose-900'
                      : 'focus:border-[#6A859F]'
                  }`}
                />
                {verifyingPin && (
                  <RefreshCw className="h-3.5 w-3.5 text-[#344257] animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                )}
              </div>

              {/* Verified Location Badge */}
              {verifiedLoc?.valid && (
                <div className="mt-1.5 rounded-lg bg-emerald-50 border border-emerald-200 p-2 text-[11px] text-emerald-950 flex items-start gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">✓ {verifiedLoc.city}, {verifiedLoc.state}</span>
                    <span className="text-emerald-700 block text-[10px]">Doorstep pickup active</span>
                  </div>
                </div>
              )}

              {/* Error Alert */}
              {pinError && (
                <div className="mt-1.5 rounded-lg bg-rose-50 border border-rose-200 p-2 text-[11px] text-rose-800 flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                  <span>{pinError}</span>
                </div>
              )}
            </div>

            <div>
              <label className="label text-xs font-bold text-gray-900 flex items-center gap-1.5 mb-1">
                <MapPin className="h-4 w-4 text-[#344257]" /> Locality / Sector / Landmark *
              </label>
              <input
                required
                type="text"
                value={form.locality}
                onChange={(e) => setForm((prev: any) => ({ ...prev, locality: e.target.value }))}
                placeholder="e.g. Main Market, Cantt, Sector 4, Near Clock Tower"
                className="input text-xs sm:text-sm focus:border-[#6A859F] focus:ring-4 focus:ring-[#6A859F]/15"
              />

              {/* Quick Postal Locality Chips */}
              {verifiedLoc?.postOffices && verifiedLoc.postOffices.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1 items-center">
                  <span className="text-[10px] text-gray-500 font-semibold">Select:</span>
                  {verifiedLoc.postOffices.slice(0, 5).map((po) => (
                    <button
                      key={po}
                      type="button"
                      onClick={() => setForm((prev: any) => ({ ...prev, locality: po }))}
                      className={`text-[10px] px-1.5 py-0.5 rounded border transition ${
                        form.locality === po
                          ? 'bg-[#344257] text-white border-[#344257]'
                          : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                    >
                      {po}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pickup Area Summary */}
          {verifiedLoc?.valid && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#F0F0F5] p-2.5 border border-[#C0C8D8]/70 text-xs">
              <div className="flex items-center gap-1.5 text-gray-700 min-w-0 flex-1">
                <MapPin className="h-4 w-4 text-[#344257] shrink-0" />
                <span className="text-gray-500 font-medium shrink-0">Service Area:</span>
                <span className="font-extrabold text-[#344257] truncate">{form.pickupArea || `${verifiedLoc.city}, ${verifiedLoc.state}`}</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 shrink-0">
                <Check className="h-3 w-3" /> Free Doorstep Visit Included
              </span>
            </div>
          )}

          <div>
            <label className="label">Full Doorstep Address</label>
            <textarea
              rows={3}
              value={form.pickupAddress}
              onChange={(e) => setForm((prev: any) => ({ ...prev, pickupAddress: e.target.value }))}
              placeholder="House / Flat No., Building Name, Street, Landmark"
              className="input mt-1 focus:border-[#6A859F] focus:ring-4 focus:ring-[#6A859F]/15"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Preferred Pickup Date</label>
              <input
                type="date"
                value={form.pickupDate}
                onChange={(e) => setForm((prev: any) => ({ ...prev, pickupDate: e.target.value }))}
                className="input mt-1 focus:border-[#6A859F] focus:ring-4 focus:ring-[#6A859F]/15"
              />
            </div>

            <div>
              <label className="label">Preferred Time Slot</label>
              <select
                value={form.pickupSlot}
                onChange={(e) => setForm((prev: any) => ({ ...prev, pickupSlot: e.target.value }))}
                className="input mt-1 focus:border-[#6A859F] focus:ring-4 focus:ring-[#6A859F]/15"
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
            <label className="label">Special Instructions / Landmark (Optional)</label>
            <input
              type="text"
              value={form.notes || ''}
              onChange={(e) => setForm((prev: any) => ({ ...prev, notes: e.target.value }))}
              placeholder="e.g. Call 10 mins before arrival, Landmark near Sahara Ganj"
              className="input mt-1 focus:border-[#6A859F] focus:ring-4 focus:ring-[#6A859F]/15"
            />
          </div>
        </div>

        <div className="flex justify-between gap-3 pt-4 border-t border-gray-100">
          <button type="button" onClick={onBack} className="btn-outline text-sm">
            Back
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              submitting ||
              verifyingPin ||
              !verifiedLoc?.valid ||
              !form.pickupAddress.trim() ||
              !form.locality.trim() ||
              form.pincode.replace(/\D/g, '').length !== 6 ||
              !(form.customerPhone || profile?.phone)
            }
            className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {verifyingPin ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" /> Verifying Pincode...
              </>
            ) : form.pincode.length === 6 && !verifiedLoc?.valid ? (
              <>
                <AlertCircle className="h-4 w-4" /> Service Not Available at Pincode
              </>
            ) : submitting ? (
              'Auto-Assigning Agent...'
            ) : (
              <>
                Confirm Pickup Booking <CheckCircle2 className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
