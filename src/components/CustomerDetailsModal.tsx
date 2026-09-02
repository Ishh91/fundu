import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Smartphone,
  ShieldCheck,
  Calendar,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Wrench,
  Package,
} from 'lucide-react';
import { db, formatINR } from '../lib/db';

export type CustomerDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  customer: {
    user_id?: string | null;
    customer_name?: string | null;
    customer_phone?: string | null;
    customer_email?: string | null;
    delivery_name?: string | null;
    delivery_phone?: string | null;
    user_name?: string | null;
    user_phone?: string | null;
    full_name?: string | null;
    phone?: string | null;
    email?: string | null;
    pickup_address?: string | null;
    delivery_address?: string | null;
    pickup_area?: string | null;
    delivery_area?: string | null;
    payout_method?: string | null;
    payout_details?: string | null;
    payment_method?: string | null;
    payment_status?: string | null;
    items?: any[];
    // Item specific
    type?: 'sell' | 'repair' | 'order' | 'user';
    brand?: string | null;
    model?: string | null;
    storage?: string | null;
    ram?: string | null;
    condition?: string | null;
    imei?: string | null;
    imei_photo?: string | null;
    device_photos?: any;
    diagnostics?: any;
    problem?: string | null;
    problem_detail?: string | null;
    estimated_price?: number | null;
    final_price?: number | null;
    estimated_cost?: number | null;
    final_cost?: number | null;
    total_amount?: number | null;
    tracking_id?: string | null;
    created_at?: string | null;
    notes?: string | null;
  } | null;
};

export default function CustomerDetailsModal({ isOpen, onClose, customer }: CustomerDetailsModalProps) {
  const [fetchedProfile, setFetchedProfile] = useState<{ full_name?: string | null; phone?: string | null; email?: string | null } | null>(null);

  useEffect(() => {
    if (isOpen && customer?.user_id && !customer.user_id.startsWith('guest_')) {
      db.from('profiles')
        .select('*')
        .eq('id', customer.user_id)
        .single()
        .then(({ data }) => {
          if (data) {
            setFetchedProfile({
              full_name: data.full_name,
              phone: data.phone,
              email: (data as any).email || null,
            });
          }
        })
        .catch(() => {});
    } else {
      setFetchedProfile(null);
    }
  }, [isOpen, customer]);

  if (!isOpen || !customer) return null;

  const name =
    customer.customer_name ||
    customer.delivery_name ||
    customer.user_name ||
    customer.full_name ||
    fetchedProfile?.full_name ||
    'Valued Customer';

  const rawPhone =
    customer.customer_phone ||
    customer.delivery_phone ||
    customer.user_phone ||
    customer.phone ||
    fetchedProfile?.phone ||
    '';

  const cleanPhone = rawPhone.replace(/\D/g, '');
  const formattedPhone = rawPhone || 'Not Provided';
  const email =
    customer.customer_email ||
    customer.email ||
    fetchedProfile?.email ||
    'Not Provided';
  const address = customer.pickup_address || customer.delivery_address || 'Lucknow Address Not Specified';
  const locality = customer.pickup_area || customer.delivery_area || 'Lucknow';

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`Copied ${label} to clipboard!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-8">
        
        {/* Header Strip */}
        <div className="bg-gradient-to-r from-gray-900 via-teal-950 to-gray-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-400/30">
              <User className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-extrabold text-lg text-white">{name}</h3>
                <span className="badge bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold px-2 py-0.5">
                  Verified User
                </span>
              </div>
              <p className="text-xs text-gray-400 font-medium">Full Customer Profile & Service Inspection</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">

          {/* Quick Action Contact Bar */}
          <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-teal-600 text-white font-bold text-sm">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-teal-900 uppercase tracking-wider">Primary Mobile</p>
                <p className="font-display font-extrabold text-base text-gray-900">{formattedPhone}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cleanPhone && (
                <>
                  <a
                    href={`tel:${cleanPhone}`}
                    className="btn bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3.5 py-2 font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                  >
                    <Phone className="h-3.5 w-3.5" /> Call Customer
                  </a>
                  <a
                    href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`Hello ${name}, regarding your service request on Fundu...`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn bg-green-600 hover:bg-green-700 text-white text-xs px-3.5 py-2 font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                  >
                    <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Customer Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Contact & Email */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <Mail className="h-4 w-4 text-teal-600" /> Customer Email & Account
              </div>
              <p className="font-semibold text-sm text-gray-900">{email}</p>
              {customer.user_id && (
                <p className="text-xs text-gray-400 font-mono">User ID: {customer.user_id}</p>
              )}
            </div>

            {/* Payout / Payment Method */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <CreditCard className="h-4 w-4 text-emerald-600" /> Payout / Payment Details
              </div>
              <p className="font-semibold text-sm text-gray-900">
                {customer.payout_method || customer.payment_method || 'Online / Spot Payment'}
              </p>
              {customer.payout_details && (
                <p className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg inline-block border border-emerald-200">
                  {customer.payout_details}
                </p>
              )}
            </div>
          </div>

          {/* Full Address Card */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <MapPin className="h-4 w-4 text-rose-600" /> Complete Doorstep Address (Lucknow)
              </div>
              <span className="badge bg-rose-50 text-rose-700 font-bold text-[11px] px-2.5 py-0.5">
                Cluster: {locality}
              </span>
            </div>
            <p className="text-sm font-semibold text-gray-900 leading-relaxed">{address}</p>
          </div>

          {/* Purchased Order Items (if Order) */}
          {Array.isArray(customer.items) && customer.items.length > 0 && (
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <Package className="h-4 w-4 text-blue-600" /> Purchased Order Items ({customer.items.length})
              </div>
              <div className="space-y-2">
                {customer.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-gray-100 text-xs">
                    <div className="flex items-center gap-2.5">
                      {item.image_url ? (
                        <img src={item.image_url} alt="" className="h-9 w-9 object-cover rounded-lg bg-gray-50 p-0.5" />
                      ) : (
                        <div className="h-9 w-9 rounded-lg bg-teal-50 text-teal-700 grid place-items-center font-bold">
                          {item.title ? item.title[0] : 'P'}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-gray-900">{item.title || 'Refurbished Device'}</p>
                        <p className="text-gray-500 text-[11px]">Qty: {item.quantity || 1}</p>
                      </div>
                    </div>
                    <span className="font-extrabold text-teal-700">{formatINR(item.price || 0)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Lead / Service Details (If applicable) */}
          {(customer.brand || customer.type) && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-50/50 to-blue-50/50 border border-teal-200/80 space-y-4">
              <div className="flex items-center justify-between border-b border-teal-200/60 pb-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-teal-700" />
                  <span className="font-extrabold text-sm text-gray-900">
                    {customer.brand ? `${customer.brand} ${customer.model || ''}` : 'Service Request Details'}
                  </span>
                </div>
                {customer.tracking_id && (
                  <span className="font-mono text-xs font-bold text-teal-800 bg-teal-100 px-2.5 py-1 rounded-lg">
                    ID: {customer.tracking_id}
                  </span>
                )}
              </div>

              {/* Specs & Condition */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                {customer.storage && (
                  <div className="bg-white p-2.5 rounded-xl border border-gray-200">
                    <span className="text-gray-400 block font-semibold text-[10px]">STORAGE / RAM</span>
                    <span className="font-bold text-gray-900">{customer.storage} {customer.ram ? `· ${customer.ram}` : ''}</span>
                  </div>
                )}
                {customer.condition && (
                  <div className="bg-white p-2.5 rounded-xl border border-gray-200">
                    <span className="text-gray-400 block font-semibold text-[10px]">CONDITION</span>
                    <span className="font-bold text-gray-900">{customer.condition}</span>
                  </div>
                )}
                {customer.imei && (
                  <div className="bg-white p-2.5 rounded-xl border border-gray-200 col-span-2 sm:col-span-1">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 block font-semibold text-[10px]">IMEI NUMBER</span>
                      <button
                        onClick={() => copyToClipboard(customer.imei!, 'IMEI')}
                        className="text-teal-600 hover:text-teal-700"
                        title="Copy IMEI"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="font-mono font-bold text-gray-900">{customer.imei}</span>
                  </div>
                )}
              </div>

              {/* Cashify Hardware Diagnostics & Accessories Summary */}
              {((customer as any).screenCondition || (customer as any).bodyCondition || (customer as any).defects || (customer as any).accessories) && (
                <div className="p-3.5 rounded-xl bg-white border border-gray-200 text-xs space-y-2">
                  <span className="font-bold text-gray-900 block text-[11px] uppercase tracking-wider text-teal-800">
                    🔍 Fundu Diagnostics Evaluation Summary:
                  </span>
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    {(customer as any).screenCondition && (
                      <span className="bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-lg font-semibold">
                        Screen: {(customer as any).screenCondition}
                      </span>
                    )}
                    {(customer as any).bodyCondition && (
                      <span className="bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-lg font-semibold">
                        Body: {(customer as any).bodyCondition}
                      </span>
                    )}
                    {Array.isArray((customer as any).accessories) && (customer as any).accessories.map((acc: string, i: number) => (
                      <span key={i} className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-lg font-semibold">
                        + {acc}
                      </span>
                    ))}
                    {Array.isArray((customer as any).defects) && (customer as any).defects.map((def: string, i: number) => (
                      <span key={i} className="bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded-lg font-semibold">
                        ⚠ Defect: {def}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Problem / Valuation Cost */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                {customer.problem && (
                  <div>
                    <span className="text-xs text-gray-500 font-semibold block">Reported Problem:</span>
                    <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                      {customer.problem} {customer.problem_detail ? `— ${customer.problem_detail}` : ''}
                    </span>
                  </div>
                )}
                {(customer.estimated_price || customer.estimated_cost || customer.total_amount) && (
                  <div className="ml-auto text-right">
                    <span className="text-[11px] text-gray-500 font-semibold block">Estimated Valuation / Cost:</span>
                    <span className="font-display font-black text-xl text-teal-700">
                      {formatINR(customer.estimated_price || customer.estimated_cost || customer.total_amount || 0)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400 font-medium">Fundu User Safety & Privacy Protocol</span>
          <button
            onClick={onClose}
            className="btn-outline text-xs px-4 py-2 font-bold rounded-xl"
          >
            Close Profile
          </button>
        </div>

      </div>
    </div>
  );
}
