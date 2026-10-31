import React from 'react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { formatINR } from '../../lib/db';

interface SellSuccessModalProps {
  successData: {
    id?: string;
    pickup_person_name?: string | null;
    pickup_person_phone?: string | null;
    estimated_arrival_time?: string | null;
    delivery_otp?: string | null;
  };
  form: {
    brand: string;
    model: string;
    storage: string;
  };
  estimate: number;
  onReset: () => void;
  onViewTracking: () => void;
}

export default function SellSuccessModal({
  successData,
  form,
  estimate,
  onReset,
  onViewTracking,
}: SellSuccessModalProps) {
  return (
    <div className="min-h-screen bg-[#F7F7FA] py-12 px-4 flex items-center justify-center text-[#344257]">
      <div className="max-w-md w-full card p-8 rounded-[32px] text-center bg-white border border-gray-200 shadow-2xl animate-fade-in space-y-6">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#E4E7F0] text-[#344257] shadow-md">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>

        <div>
          <span className="badge bg-[#F0F0F5] text-[#344257] border border-[#C0C8D8] text-xs font-bold">Booking Confirmed</span>
          <h2 className="mt-2 font-display text-2xl font-black text-[#344257]">Doorstep Pickup Scheduled!</h2>
          <p className="mt-1 text-xs text-gray-500">
            Tracking ID: <span className="font-mono font-bold text-[#344257]">{successData.id}</span>
          </p>
        </div>

        {/* Handover OTP Badge */}
        {successData.delivery_otp && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-400 text-center space-y-1 shadow-xs">
            <span className="badge bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Your Doorstep Handover OTP
            </span>
            <div className="font-mono font-black text-3xl text-emerald-800 tracking-[0.25em] py-1">
              {successData.delivery_otp}
            </div>
            <p className="text-[11px] text-emerald-800 font-semibold">
              Share this 4-digit PIN with your Fundu Executive at doorstep to verify device & release your spot payout.
            </p>
          </div>
        )}

        <div className="rounded-2xl bg-[#F0F0F5] p-5 text-left border border-[#C0C8D8] space-y-2 text-xs">
          <div className="flex justify-between border-b border-[#C0C8D8]/60 pb-2">
            <span className="text-gray-500 font-medium">Device:</span>
            <span className="font-bold text-[#344257]">{form.brand} {form.model} ({form.storage})</span>
          </div>
          <div className="flex justify-between border-b border-[#C0C8D8]/60 pb-2">
            <span className="text-gray-500 font-medium">Spot Payout:</span>
            <span className="font-black text-[#344257] text-sm">{formatINR(estimate)}</span>
          </div>
          <div className="flex justify-between border-b border-[#C0C8D8]/60 pb-2">
            <span className="text-gray-500 font-medium">Pickup Rider:</span>
            <span className="font-bold text-[#344257]">{successData.pickup_person_name}</span>
          </div>
          <div className="flex justify-between border-b border-[#C0C8D8]/60 pb-2">
            <span className="text-gray-500 font-medium">Helpline Hotline:</span>
            <span className="font-bold text-[#344257]">{successData.pickup_person_phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Arrival Slot:</span>
            <span className="font-bold text-[#344257]">{successData.estimated_arrival_time}</span>
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <button onClick={onViewTracking} className="btn-primary">
            View Order Tracking
          </button>
          <button onClick={onReset} className="btn-outline">
            Sell Another Phone
          </button>
        </div>
      </div>
    </div>
  );
}
