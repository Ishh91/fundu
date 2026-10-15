import React from 'react';
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
} from 'lucide-react';
import { formatINR } from '../../lib/db';
import { PAN_INDIA_POPULAR_CITIES, type PanIndiaLocation } from '../../lib/locationService';

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

          {/* Proper Pincode & Locality */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="label text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-[#344257]" /> Pincode (PIN Code) *
              </label>
              <input
                required
                type="text"
                maxLength={6}
                value={form.pincode}
                onChange={(e) => setForm((prev: any) => ({ ...prev, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                placeholder="6-digit Pincode (e.g. 226001)"
                className="input mt-1 text-xs sm:text-sm font-semibold focus:border-[#6A859F] focus:ring-4 focus:ring-[#6A859F]/15"
              />
              {form.pincode && form.pincode.length === 6 && (
                <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">✓ Valid 6-digit Pincode</span>
              )}
            </div>
            <div>
              <label className="label text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-[#344257]" /> Locality / Sector / Landmark *
              </label>
              <input
                required
                type="text"
                value={form.locality}
                onChange={(e) => setForm((prev: any) => ({ ...prev, locality: e.target.value }))}
                placeholder="e.g. Gomti Nagar, Sector 4, Near Clock Tower"
                className="input mt-1 text-xs sm:text-sm focus:border-[#6A859F] focus:ring-4 focus:ring-[#6A859F]/15"
              />
            </div>
          </div>

          {/* Pan-India Pincode / City Location Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="label text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-[#344257]" /> Doorstep Pickup Location (Pincode / City)
              </label>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Pan-India Coverage Active
              </span>
            </div>

            {/* Interactive Pincode or City Search Input */}
            <div className="relative">
              <div className="flex items-center rounded-xl border-2 border-[#C0C8D8] focus-within:border-[#344257] bg-white px-3.5 py-2.5 transition shadow-2xs">
                <Search className="h-4 w-4 text-[#6A859F] shrink-0 mr-2" />
                <input
                  type="text"
                  value={pickupSearchQuery}
                  onChange={(e) => setPickupSearchQuery(e.target.value)}
                  placeholder="Search Pincode (e.g. 110001, 226001, 560001) or City / Town name..."
                  className="w-full bg-transparent text-xs sm:text-sm font-semibold text-gray-900 outline-none placeholder:text-gray-400"
                />
                {isSearchingPickupLoc && (
                  <RefreshCw className="h-3.5 w-3.5 text-[#344257] animate-spin shrink-0 ml-2" />
                )}
                {pickupSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setPickupSearchQuery('')}
                    className="text-gray-400 hover:text-gray-600 transition ml-2 p-0.5"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Instant Autocomplete Suggestions Dropdown */}
              {pickupSearchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-30 max-h-56 overflow-y-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl space-y-1">
                  {pickupSearchResults.map((loc) => (
                    <div
                      key={`${loc.city}-${loc.pincode}-${loc.displayLabel}`}
                      onClick={() => {
                        const label = `${loc.city}, ${loc.state} (${loc.pincode})`;
                        setForm((f: any) => ({ ...f, pickupArea: label }));
                        setPickupSearchQuery('');
                      }}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F0F0F5] cursor-pointer transition text-xs"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="font-bold text-gray-900 truncate">{loc.city}</p>
                        <p className="text-[11px] text-gray-500 truncate">
                          {loc.district ? `${loc.district}, ` : ''}{loc.state} • PIN: <span className="font-extrabold text-[#344257]">{loc.pincode}</span>
                        </p>
                      </div>
                      <span className="shrink-0 text-[10px] font-bold text-[#344257] bg-[#F0F0F5] px-2 py-0.5 rounded border border-[#C0C8D8]">
                        Select
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Location Pill */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#F0F0F5] p-2.5 border border-[#C0C8D8]/70 text-xs">
              <div className="flex items-center gap-1.5 text-gray-700 min-w-0 flex-1">
                <span className="text-gray-500 font-medium shrink-0">Selected Area:</span>
                <span className="font-extrabold text-[#344257] truncate">{form.pickupArea}</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 shrink-0">
                <Check className="h-3 w-3" /> Free Doorstep Visit
              </span>
            </div>

            {/* Quick Popular City Chips */}
            <div className="pt-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Or 1-Click Select City Hub:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {PAN_INDIA_POPULAR_CITIES.slice(0, 8).map((cityItem) => (
                  <button
                    key={cityItem.city}
                    type="button"
                    onClick={() => {
                      setForm((f: any) => ({ ...f, pickupArea: `${cityItem.city}, ${cityItem.state} (${cityItem.pincode})` }));
                      setPickupSearchQuery('');
                    }}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold border transition ${
                      form.pickupArea.includes(cityItem.city)
                        ? 'bg-[#344257] text-white border-[#344257]'
                        : 'bg-white hover:bg-[#F0F0F5] text-gray-700 border-gray-200'
                    }`}
                  >
                    {cityItem.city}
                  </button>
                ))}
              </div>
            </div>
          </div>

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
              !form.pickupAddress.trim() ||
              !form.locality.trim() ||
              form.pincode.replace(/\D/g, '').length !== 6 ||
              !(form.customerPhone || profile?.phone)
            }
            className="btn-primary text-sm flex items-center gap-2"
          >
            {submitting ? 'Auto-Assigning Agent...' : 'Confirm Pickup Booking'} <CheckCircle2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
