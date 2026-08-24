import { useState } from 'react';
import {
  X,
  Package,
  Truck,
  MapPin,
  Phone,
  Calendar,
  CreditCard,
  CheckCircle2,
  Clock,
  Navigation,
  ShieldCheck,
  Printer,
  MessageSquare,
  Send,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  Star,
  Building2,
} from 'lucide-react';
import type { Order, Dispatch } from '../types';
import { db, formatINR } from '../lib/db';

type OrderDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  dispatch?: Dispatch;
  onOpenTracker?: (params: {
    locality: string;
    executiveName?: string | null;
    executivePhone?: string | null;
    orderType: 'sell' | 'repair' | 'buy';
    deviceInfo: string;
    trackingId?: string;
  }) => void;
  onOpenReviewModal?: () => void;
  onOrderUpdated?: () => void;
};

const ORDER_LIFECYCLE_STEPS = [
  { id: 'pending', label: 'Order Placed', desc: 'Received at Fundu Lucknow' },
  { id: 'confirmed', label: 'Confirmed', desc: 'Verified & assigned to hub' },
  { id: 'packed', label: 'Packed & Inspected', desc: '32-point check passed' },
  { id: 'dispatched', label: 'Out for Delivery', desc: 'Executive on the way' },
  { id: 'delivered', label: 'Delivered', desc: 'Handed over at doorstep' },
];

export default function OrderDetailsModal({
  isOpen,
  onClose,
  order,
  dispatch: disp,
  onOpenTracker,
  onOpenReviewModal,
  onOrderUpdated,
}: OrderDetailsModalProps) {
  const [chatMessage, setChatMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [supportSentAlert, setSupportSentAlert] = useState(false);

  if (!isOpen || !order) return null;

  const effectiveStatus = disp?.status ?? order.status;
  const isDelivered = effectiveStatus === 'delivered';
  const isCancelled = effectiveStatus === 'cancelled';

  // Items list normalization
  const items = Array.isArray(order.items) && order.items.length > 0
    ? order.items
    : [
        {
          title: 'Certified Refurbished Smartphone',
          quantity: order.quantity || 1,
          price: order.total_amount,
          image_url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&auto=format&fit=crop&q=80',
          specs: 'Grade A Refurbished • 6-Month Fundu Warranty',
        },
      ];

  // Determine current lifecycle step index
  const getStepIndex = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 0;
      case 'assigned':
      case 'confirmed': return 1;
      case 'packed': return 2;
      case 'dispatched':
      case 'in_transit':
      case 'out_for_delivery': return 3;
      case 'delivered': return 4;
      default: return 0;
    }
  };

  const currentStepIdx = getStepIndex(effectiveStatus);

  // Send in-app message / instruction to Admin
  const handleSendMessageToAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    setSendingMessage(true);
    try {
      const newMessage = {
        sender: 'customer' as const,
        message: chatMessage.trim(),
        timestamp: new Date().toISOString(),
      };

      const existingMessages = Array.isArray(order.support_messages) ? order.support_messages : [];
      const updatedMessages = [...existingMessages, newMessage];

      const { error } = await db.from('orders').update({
        support_messages: updatedMessages,
        customer_notes: chatMessage.trim(),
      }).eq('id', order.id);

      if (error) throw error;

      order.support_messages = updatedMessages;
      order.customer_notes = chatMessage.trim();
      setChatMessage('');
      setSupportSentAlert(true);
      setTimeout(() => setSupportSentAlert(false), 5000);
      onOrderUpdated?.();
    } catch (err: any) {
      alert(err?.message || 'Failed to send message to admin');
    } finally {
      setSendingMessage(false);
    }
  };

  // WhatsApp Admin Direct Link
  const getWhatsAppAdminLink = () => {
    const orderId = order.id.slice(0, 8).toUpperCase();
    const customerName = order.delivery_name || 'Customer';
    const locality = order.delivery_area || 'Lucknow';
    const text = `Hi Fundu Admin, I have a query regarding my Order #${orderId} for delivery at ${locality}, Lucknow. Current Status: ${effectiveStatus}. Customer Name: ${customerName}. Please assist.`;
    return `https://wa.me/919839122345?text=${encodeURIComponent(text)}`;
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-[32px] bg-white shadow-2xl border border-ink-100 overflow-hidden my-6">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white p-6 flex flex-wrap items-center justify-between gap-4 border-b border-ink-800">
          <div className="flex items-center gap-3.5">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-500/20 text-brand-400 border border-brand-500/30">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display font-black text-lg sm:text-xl">
                  Order #{order.id.slice(0, 8).toUpperCase()}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                  isDelivered
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : isCancelled
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                    : 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                }`}>
                  {effectiveStatus.replace(/_/g, ' ').toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-ink-300 mt-0.5 flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-brand-400" />
                Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintInvoice}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white px-3 py-2 text-xs font-bold transition"
              title="Print Receipt"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Receipt</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[calc(85vh-120px)] overflow-y-auto">
          
          {/* Order Lifecycle Progress Tracker */}
          {!isCancelled && (
            <div className="p-5 rounded-2xl bg-ink-50/80 border border-ink-100 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-display text-xs font-black uppercase tracking-wider text-ink-600 flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-brand-600" /> Doorstep Order Progress (Lucknow Express)
                </h4>
                {order.tracking_id && (
                  <span className="text-[11px] font-mono font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200">
                    Tracking ID: {order.tracking_id}
                  </span>
                )}
              </div>

              {/* Progress Nodes */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                {ORDER_LIFECYCLE_STEPS.map((step, idx) => {
                  const isDone = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;
                  return (
                    <div
                      key={step.id}
                      className={`p-3 rounded-2xl border transition-all ${
                        isCurrent
                          ? 'bg-brand-500/10 border-brand-500 text-brand-900 ring-2 ring-brand-500/20'
                          : isDone
                          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                          : 'bg-white border-ink-100 text-ink-400 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[10px] font-black rounded-full h-5 w-5 grid place-items-center ${
                          isDone ? 'bg-emerald-600 text-white' : 'bg-ink-200 text-ink-600'
                        }`}>
                          {isDone ? '✓' : idx + 1}
                        </span>
                        {isCurrent && (
                          <span className="h-2 w-2 rounded-full bg-brand-600 animate-ping" />
                        )}
                      </div>
                      <p className="font-bold text-xs leading-tight">{step.label}</p>
                      <p className="text-[10px] text-ink-500 mt-0.5 leading-snug">{step.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* Live Track on Map Button */}
              {effectiveStatus !== 'delivered' && effectiveStatus !== 'cancelled' && (
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 bg-brand-50/60 p-3.5 rounded-xl border border-brand-100">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-bold text-brand-900">
                      Live Delivery Executive GPS is active in Lucknow
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenTracker?.({
                        locality: order.delivery_area || order.delivery_address || 'Lucknow',
                        executiveName: disp?.delivery_person_name || order.delivery_person_name || 'Rohit Verma',
                        executivePhone: disp?.delivery_person_phone || order.delivery_person_phone || '+91 98391 22345',
                        orderType: 'buy',
                        deviceInfo: `Order #${order.id.slice(0, 8).toUpperCase()}`,
                        trackingId: order.tracking_id,
                      });
                    }}
                    className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 shadow-md font-bold"
                  >
                    <Navigation className="h-4 w-4" /> Open Live GPS Map Tracker
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Items Purchased List */}
          <div className="space-y-3">
            <h4 className="font-display text-xs font-black uppercase tracking-wider text-ink-600 flex items-center gap-1.5">
              <Package className="h-4 w-4 text-brand-600" /> Items in this Order ({items.length})
            </h4>

            <div className="divide-y divide-ink-100 rounded-2xl border border-ink-100 bg-white overflow-hidden">
              {items.map((item: any, idx: number) => (
                <div key={idx} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="h-16 w-16 object-cover rounded-2xl bg-ink-50 p-1 border border-ink-100 shrink-0"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-2xl bg-brand-100 text-brand-700 grid place-items-center font-bold text-lg shrink-0">
                        {item.title?.charAt(0) || 'P'}
                      </div>
                    )}
                    <div>
                      <h5 className="font-display font-bold text-sm text-ink-900">{item.title}</h5>
                      <p className="text-xs text-ink-500 mt-0.5">
                        {item.specs || item.storage ? `${item.storage || ''} ${item.condition ? `· ${item.condition}` : ''}` : 'Fundu Quality Tested'}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                          <ShieldCheck className="h-3 w-3" /> 6-Month Warranty
                        </span>
                        <span className="text-[11px] font-bold text-ink-600">Qty: {item.quantity || 1}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right self-end sm:self-center">
                    <p className="font-display text-base font-black text-ink-900">
                      {formatINR((item.price || order.total_amount) * (item.quantity || 1))}
                    </p>
                    <p className="text-[10px] text-ink-400">({formatINR(item.price || order.total_amount)} / unit)</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2-Column Split: Delivery Info + Price Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Delivery & Dispatch Agent Details */}
            <div className="p-4 rounded-2xl bg-ink-50/70 border border-ink-100 space-y-3 text-xs">
              <h4 className="font-display text-xs font-black uppercase tracking-wider text-ink-600 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-brand-600" /> Lucknow Delivery Address
              </h4>
              
              <div>
                <p className="text-ink-500 font-medium">Recipient:</p>
                <p className="font-bold text-ink-900 text-sm">{order.delivery_name || 'Customer'}</p>
              </div>

              <div>
                <p className="text-ink-500 font-medium">Contact Phone:</p>
                <p className="font-bold text-ink-900 flex items-center gap-1 mt-0.5">
                  <Phone className="h-3.5 w-3.5 text-brand-600" /> {order.delivery_phone || '—'}
                </p>
              </div>

              <div>
                <p className="text-ink-500 font-medium">Address & Locality:</p>
                <p className="font-bold text-ink-900 mt-0.5">{order.delivery_address || 'Lucknow, Uttar Pradesh'}</p>
                <span className="inline-block mt-1 rounded bg-brand-100/60 px-2 py-0.5 text-[10px] font-black text-brand-800">
                  📍 {order.delivery_area || 'Gomti Nagar / Hazratganj Cluster'}
                </span>
              </div>

              {/* Assigned Executive if any */}
              {(disp?.delivery_person_name || order.delivery_person_name) && (
                <div className="pt-2 border-t border-ink-200/60 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-ink-500 font-bold uppercase">Field Executive:</p>
                    <p className="font-bold text-ink-900 text-xs mt-0.5">
                      {disp?.delivery_person_name || order.delivery_person_name}
                    </p>
                  </div>
                  <a
                    href={`tel:${disp?.delivery_person_phone || order.delivery_person_phone || '+919839122345'}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-white border border-brand-200 px-2.5 py-1 text-[11px] font-bold text-brand-700 hover:bg-brand-50"
                  >
                    <Phone className="h-3 w-3" /> Call Agent
                  </a>
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="p-4 rounded-2xl bg-ink-50/70 border border-ink-100 space-y-3 text-xs flex flex-col justify-between">
              <div>
                <h4 className="font-display text-xs font-black uppercase tracking-wider text-ink-600 flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4 text-emerald-600" /> Payment & Billing Summary
                </h4>

                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-ink-600">
                    <span>Items Subtotal:</span>
                    <span className="font-bold">{formatINR(order.total_amount)}</span>
                  </div>
                  <div className="flex justify-between text-ink-600">
                    <span>Lucknow Doorstep Delivery:</span>
                    <span className="font-bold text-emerald-600">FREE</span>
                  </div>
                  <div className="flex justify-between text-ink-600">
                    <span>GST (18% Included):</span>
                    <span className="font-bold">{formatINR(Math.round(order.total_amount * 0.18))}</span>
                  </div>
                  <div className="pt-2 border-t border-ink-200 flex justify-between text-sm font-black text-ink-900">
                    <span>Grand Total:</span>
                    <span className="font-display text-base text-brand-700">{formatINR(order.total_amount)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-ink-200/80 flex items-center justify-between text-xs">
                <div>
                  <p className="text-[10px] text-ink-500 font-medium">Payment Mode:</p>
                  <p className="font-bold text-ink-900 uppercase">{order.payment_method || 'Cash on Delivery (COD)'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-ink-500 font-medium">Status:</p>
                  <span className={`inline-block font-bold uppercase text-[11px] ${
                    order.payment_status === 'paid' ? 'text-emerald-700' : 'text-amber-700'
                  }`}>
                    ● {order.payment_status || 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════
              CONNECT WITH ADMIN & LIVE SUPPORT SECTION
             ══════════════════════════════════════════════════════════ */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-500/10 via-brand-500/10 to-indigo-500/10 border border-teal-200/80 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-2.5 py-0.5 text-[10px] font-black text-teal-800">
                  <Sparkles className="h-3 w-3" /> Live Tracking Support Desk
                </div>
                <h4 className="font-display text-sm font-black text-ink-900 mt-1">
                  Need Help or Delivery Instructions? Connect with Admin
                </h4>
                <p className="text-xs text-ink-600">
                  Change delivery timing, add landmark details, or resolve payment issues directly with Fundu Lucknow Admin desk.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={getWhatsAppAdminLink()}
                  target="_blank"
                  rel="noreferrer"
                  className="btn bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs px-3.5 py-2 font-bold flex items-center gap-1.5 shadow-sm rounded-xl"
                >
                  <MessageSquare className="h-4 w-4" /> WhatsApp Admin
                </a>
                <a
                  href="tel:+919839122345"
                  className="btn bg-white hover:bg-ink-50 text-ink-800 border border-ink-200 text-xs px-3.5 py-2 font-bold flex items-center gap-1.5 shadow-xs rounded-xl"
                >
                  <Phone className="h-4 w-4 text-brand-600" /> Call Admin Desk
                </a>
              </div>
            </div>

            {/* In-App Direct Message to Admin */}
            <form onSubmit={handleSendMessageToAdmin} className="space-y-2 pt-2 border-t border-teal-200/60">
              <label className="text-[11px] font-bold text-ink-700 flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5 text-teal-600" />
                Send a quick message/note to Admin regarding this order:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="e.g. Call before delivery, deliver after 5 PM at Gate 2..."
                  className="input text-xs bg-white flex-1"
                />
                <button
                  type="submit"
                  disabled={sendingMessage || !chatMessage.trim()}
                  className="btn-primary text-xs px-4 py-2 font-bold flex items-center gap-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" /> Send Note
                </button>
              </div>
            </form>

            {supportSentAlert && (
              <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Note sent to Fundu Admin! Our Lucknow team will take action right away.
              </div>
            )}

            {/* Conversation History with Admin if any */}
            {Array.isArray(order.support_messages) && order.support_messages.length > 0 && (
              <div className="mt-3 p-3 rounded-xl bg-white border border-teal-100 space-y-2 text-xs">
                <p className="text-[10px] font-bold uppercase text-ink-400">Order Messages & Updates:</p>
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {order.support_messages.map((msg, mIdx) => (
                    <div
                      key={mIdx}
                      className={`p-2 rounded-xl text-xs ${
                        msg.sender === 'admin'
                          ? 'bg-brand-50 text-brand-900 border border-brand-100 mr-6'
                          : 'bg-teal-50 text-teal-900 border border-teal-100 ml-6 text-right'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="font-bold text-[10px]">
                          {msg.sender === 'admin' ? 'Fundu Lucknow Admin' : 'You'}
                        </span>
                        <span className="text-[9px] text-ink-400">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs">{msg.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Delivered State: Review & Rate prompt */}
          {isDelivered && (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <h4 className="font-display font-bold text-sm text-emerald-900">
                    Order Successfully Delivered!
                  </h4>
                </div>
                <p className="text-xs text-emerald-700 mt-0.5">
                  We hope you love your certified refurbished device. How was your delivery experience in Lucknow?
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenReviewModal?.();
                }}
                className="btn-primary text-xs px-4 py-2 font-bold bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1.5 shadow-sm"
              >
                <Star className="h-3.5 w-3.5 fill-current" /> Rate & Review Order
              </button>
            </div>
          )}

        </div>

        {/* Footer Bar */}
        <div className="p-4 bg-ink-50 border-t border-ink-100 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-ink-500 font-medium">
            Fundu Technologies Pvt Ltd • Lucknow Central Hub, Hazratganj
          </p>
          <button
            type="button"
            onClick={onClose}
            className="btn-outline text-xs px-5 py-2 font-bold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
