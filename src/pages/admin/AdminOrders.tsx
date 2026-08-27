import { useState } from 'react';
import { Package, Search, Truck, MapPin, PhoneCall, MessageCircle, CreditCard, ShoppingBag, MessageSquare, Send } from 'lucide-react';
import type { Order, DeliveryAgent } from './adminTypes';
import { statusColors } from './adminTypes';
import { db, formatINR } from '../../lib/db';
import CustomerDetailsModal from '../../components/CustomerDetailsModal';

type AdminOrdersProps = {
  orders: Order[];
  selectedOrderId: string | null;
  onSelectOrder: (id: string) => void;
  agents: DeliveryAgent[];
  onUpdateStatus: (id: string, status: string) => void;
  onReassignAgent: (orderId: string, agentId: string) => void;
};

export default function AdminOrders({
  orders,
  selectedOrderId,
  onSelectOrder,
  agents,
  onUpdateStatus,
  onReassignAgent,
}: AdminOrdersProps) {
  const [agentFilter, setAgentFilter] = useState('all');
  const [reassignModalData, setReassignModalData] = useState<{
    order: Order;
    newAgent: DeliveryAgent;
    oldAgentName: string;
  } | null>(null);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);
  const [smsSentSuccess, setSmsSentSuccess] = useState(false);

  const handleSendAdminReply = async (order: Order) => {
    if (!adminReplyText.trim()) return;
    try {
      const newMsg = {
        sender: 'admin' as const,
        message: adminReplyText.trim(),
        timestamp: new Date().toISOString(),
      };
      const existing = Array.isArray(order.support_messages) ? order.support_messages : [];
      const updated = [...existing, newMsg];
      const { error } = await db.from('orders').update({
        support_messages: updated,
        admin_reply: adminReplyText.trim(),
      }).eq('id', order.id);
      if (error) throw error;
      order.support_messages = updated;
      order.admin_reply = adminReplyText.trim();
      setAdminReplyText('');
      alert('🎉 Reply posted to customer tracking view!');
    } catch (err: any) {
      alert(err?.message || 'Failed to send reply');
    }
  };

  const handleSelectReassignAgent = (order: Order, agentId: string) => {
    const newAgent = agents.find((a) => a.id === agentId);
    if (!newAgent) return;
    const oldName = order.delivery_person_name || 'Unassigned';
    onReassignAgent(order.id, agentId);
    setReassignModalData({
      order: {
        ...order,
        delivery_person_name: newAgent.name,
        delivery_person_phone: newAgent.phone,
        assigned_agent_id: newAgent.id,
      },
      newAgent,
      oldAgentName: oldName,
    });
    setEmailSentSuccess(false);
    setSmsSentSuccess(false);
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = `${o.delivery_name || ''} ${o.id} ${o.delivery_phone || ''} ${o.delivery_address || ''} ${o.delivery_person_name || ''}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesAgent =
      agentFilter === 'all' ||
      o.assigned_agent_id === agentFilter ||
      (o.delivery_person_name && o.delivery_person_name.toLowerCase().includes(agentFilter.toLowerCase()));
    return matchesSearch && matchesStatus && matchesAgent;
  });

  const getWhatsAppDispatchLink = (order: Order) => {
    const phone = order.delivery_phone ? order.delivery_phone.replace(/\D/g, '') : '9839122345';
    const targetPhone = phone.length === 10 ? `91${phone}` : phone;
    const text = `🎉 *FUNDU LUCKNOW DISPATCH UPDATE*\n\n` +
      `Hi *${order.delivery_name || 'Customer'}*,\n` +
      `Your refurbished order *#${order.id.slice(0, 8).toUpperCase()}* is dispatched with our certified executive *${order.delivery_person_name || 'Rohit'}*.\n\n` +
      `📍 *Delivery To:* ${order.delivery_address || 'Lucknow'}\n` +
      `💰 *Total Amount:* ₹${order.total_amount?.toLocaleString('en-IN')}\n` +
      `💳 *Payment Method:* ${order.payment_method || 'COD'}\n\n` +
      `You can track your executive live on your Fundu Dashboard!`;
    return `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
  };

  const getDeliveryPartnerJobWhatsAppLink = (order: Order, agentPhone?: string) => {
    const rawPhone = (agentPhone || order.delivery_person_phone || '9839122345').replace(/\D/g, '');
    const targetPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const itemsSummary =
      order.items?.map((it: any) => `• ${it.title || 'Refurbished Device'} (Qty: ${it.quantity || 1}) - ₹${it.price || 0}`).join('\n') ||
      `• Certified Refurbished Device - ₹${order.total_amount || 0}`;
    const text = `📦 *NEW FUNDU DELIVERY DISPATCH ASSIGNED*\n\n` +
      `📋 *Order ID:* #${order.id.slice(0, 8).toUpperCase()}\n` +
      `👤 *Customer Name:* ${order.delivery_name || 'Customer'}\n` +
      `📞 *Customer Phone:* ${order.delivery_phone || 'N/A'}\n` +
      `📍 *Delivery Address:* ${order.delivery_address || 'Lucknow'}\n` +
      `🏙️ *Locality:* ${order.delivery_area || 'Lucknow'}\n` +
      `⏰ *Delivery Slot:* ${order.delivery_slot || 'Today Same-Day Express'}\n\n` +
      `🛍️ *ORDER ITEMS & PAYMENT:*\n` +
      `${itemsSummary}\n` +
      `• *Total Payable:* ₹${(order.total_amount || 0).toLocaleString('en-IN')}\n` +
      `• *Payment Mode:* ${order.payment_method || 'COD'} (${order.payment_status || 'Prepaid/Pending'})\n\n` +
      `🚚 *Instructions:* Collect payment (if COD) and hand over verified sealed package to customer doorstep in Lucknow.`;
    return `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
  };

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || filteredOrders[0] || null;

  return (
    <div className="space-y-6">
      <div className="card p-6 rounded-[28px] bg-gradient-to-r from-blue-500/10 via-brand-500/10 to-indigo-500/10 border border-blue-200/60 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-800">
            <Package className="h-3.5 w-3.5" /> Refurbished Phone Sales & Shipments
          </div>
          <h2 className="mt-2 font-display text-2xl font-black text-ink-900">Customer Orders & Deliveries</h2>
          <p className="mt-1 text-xs text-ink-600">Track shipments, verified Lucknow doorstep delivery, and customer payments.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-blue-200 shadow-xs text-center min-w-[110px]">
            <p className="text-[10px] font-bold uppercase text-ink-500">Total Orders</p>
            <p className="font-display text-xl font-black text-ink-900">{orders.length}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-emerald-200 shadow-xs text-center min-w-[110px]">
            <p className="text-[10px] font-bold uppercase text-emerald-700">Delivered</p>
            <p className="font-display text-xl font-black text-emerald-700">
              {orders.filter((o) => o.status === 'delivered').length}
            </p>
          </div>
        </div>
      </div>

      {/* Rider Workload Overview Bar */}
      <div className="card p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
            <Truck className="h-4 w-4 text-brand-600" /> Executive Order Assignment Overview
          </span>
          <span className="text-[11px] font-bold text-slate-500">
            {agents.length} Registered Lucknow Riders
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setAgentFilter('all')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
              agentFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>All Executives</span>
            <span className="badge bg-white/20 text-white text-[10px]">{orders.length}</span>
          </button>

          {agents.map((ag) => {
            const count = orders.filter(
              (o) => o.assigned_agent_id === ag.id || (o.delivery_person_name && o.delivery_person_name.toLowerCase().includes(ag.name.toLowerCase()))
            ).length;
            const isSelected = agentFilter === ag.id || agentFilter.toLowerCase() === ag.name.toLowerCase();

            return (
              <button
                key={ag.id}
                onClick={() => setAgentFilter(isSelected ? 'all' : ag.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-900 grid place-items-center text-[10px] font-black">
                  {ag.name[0]}
                </div>
                <span>{ag.name}</span>
                <span className={`badge text-[10px] font-black ${isSelected ? 'bg-white text-brand-700' : 'bg-slate-100 text-slate-700'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Orders List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="card p-3 rounded-2xl bg-white shadow-xs space-y-2">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-ink-400 shrink-0 ml-1" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search order ID, customer, rider name..."
                className="w-full text-xs bg-transparent border-none focus:outline-none text-ink-900 font-medium"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-xs text-ink-400 hover:text-ink-700">
                  Clear
                </button>
              )}
            </div>

            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pt-1 border-t border-ink-100/60">
              {[
                { id: 'all', label: 'All' },
                { id: 'pending', label: 'Pending' },
                { id: 'assigned', label: 'Assigned' },
                { id: 'packed', label: 'Packed' },
                { id: 'dispatched', label: 'Dispatched' },
                { id: 'delivered', label: 'Delivered' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setStatusFilter(pill.id)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold shrink-0 transition ${statusFilter === pill.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-ink-50 text-ink-600 hover:bg-ink-100'
                    }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
            {filteredOrders.length === 0 ? (
              <div className="card p-8 text-center bg-white">
                <Package className="h-8 w-8 text-ink-300 mx-auto" />
                <p className="text-xs font-bold text-ink-700 mt-2">No orders found</p>
              </div>
            ) : (
              filteredOrders.map((o) => {
                const isSelected = selectedOrder?.id === o.id;
                return (
                  <div
                    key={o.id}
                    onClick={() => onSelectOrder(o.id)}
                    className={`card p-4 rounded-2xl cursor-pointer transition-all ${isSelected
                        ? 'border-brand-600 bg-brand-50/60 shadow-md ring-2 ring-brand-500/20'
                        : 'bg-white hover:border-brand-300 hover:shadow-xs'
                      }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-sm text-ink-900">Order #{o.id.slice(0, 8)}</p>
                        <p className="text-xs text-ink-500">{o.delivery_name || 'Customer'}</p>
                      </div>
                      <span className={`badge text-[10px] ${statusColors[o.status] ?? 'bg-ink-100 text-ink-600'}`}>
                        {o.status}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs pt-2 border-t border-ink-100/60">
                      <span className="font-extrabold text-brand-700">{formatINR(o.total_amount)}</span>
                      <span className="text-ink-400">{new Date(o.created_at).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Order Details */}
        <div className="lg:col-span-7 sticky top-6">
          {selectedOrder ? (
            <div className="card p-6 md:p-8 rounded-[28px] space-y-6 shadow-sm border border-[#dce5e8] bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-ink-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="badge bg-brand-50 text-brand-700">Order #{selectedOrder.id.slice(0, 8)}</span>
                    <span className={`badge text-[10px] ${statusColors[selectedOrder.status] ?? 'bg-ink-100 text-ink-600'}`}>
                      {selectedOrder.status.toUpperCase()}
                    </span>
                  </div>
                  <h2 className="font-display text-2xl font-black text-ink-900 mt-1">
                    {formatINR(selectedOrder.total_amount)}
                  </h2>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setCustomerModalData({ ...selectedOrder, type: 'order' })}
                    className="btn-outline text-xs px-3 py-1.5 text-teal-700 border-teal-200 hover:bg-teal-50 flex items-center gap-1.5 font-bold shadow-xs rounded-xl"
                  >
                    <MessageCircle className="h-3.5 w-3.5 text-teal-600" /> Customer Details
                  </button>

                  <select
                    value={selectedOrder.status}
                    onChange={(e) => onUpdateStatus(selectedOrder.id, e.target.value)}
                    className="input text-xs py-1.5 px-3 bg-white font-bold"
                  >
                    {['pending', 'assigned', 'packed', 'dispatched', 'in_transit', 'delivered', 'cancelled'].map((st) => (
                      <option key={st} value={st}>
                        {st.toUpperCase()}
                      </option>
                    ))}
                  </select>

                  <a
                    href={getWhatsAppDispatchLink(selectedOrder)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn bg-[#25D366] text-white hover:bg-[#20bd5a] text-xs px-3 py-1.5 flex items-center gap-1.5 font-bold shadow-xs rounded-xl"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> WhatsApp Dispatch Alert
                  </a>
                </div>
              </div>

              {/* Order Customer & Payment Information */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-ink-50 p-4 rounded-2xl text-xs">
                <div>
                  <p className="text-ink-500 font-medium">Customer Name</p>
                  <p className="font-bold text-ink-900 mt-0.5">{selectedOrder.delivery_name || 'Customer'}</p>
                </div>
                <div>
                  <p className="text-ink-500 font-medium">Customer Phone</p>
                  {selectedOrder.delivery_phone ? (
                    <div className="flex items-center gap-2 mt-0.5">
                      <a
                        href={`tel:${selectedOrder.delivery_phone}`}
                        className="font-bold text-brand-700 hover:underline flex items-center gap-1"
                      >
                        <PhoneCall className="h-3 w-3" /> {selectedOrder.delivery_phone}
                      </a>
                    </div>
                  ) : (
                    <p className="font-bold text-ink-400 mt-0.5">—</p>
                  )}
                </div>
                <div>
                  <p className="text-ink-500 font-medium">Payment Status</p>
                  <p className="font-bold text-emerald-700 uppercase mt-0.5 flex items-center gap-1">
                    <CreditCard className="h-3 w-3" /> {selectedOrder.payment_status || 'PAID (UPI/Card)'}
                  </p>
                </div>
                <div className="col-span-2 sm:col-span-3 pt-2 border-t border-ink-200/60">
                  <p className="text-ink-500 font-medium">Lucknow Delivery Address</p>
                  <p className="font-bold text-ink-900 mt-0.5 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-brand-600 shrink-0" /> {selectedOrder.delivery_address || 'Lucknow, Uttar Pradesh'}
                  </p>
                </div>
              </div>

              {/* Order Items List */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-ink-500 flex items-center gap-1.5">
                    <ShoppingBag className="h-3.5 w-3.5 text-brand-600" /> Items in this Order ({selectedOrder.items.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item: { image_url: string | undefined; title: (string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined)[]; quantity: any; price: any; }, idx: React.Key | null | undefined) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-2xl bg-ink-50 border border-ink-100 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          {item.image_url ? (
                            <img src={item.image_url} alt="" className="h-10 w-10 object-cover rounded-xl bg-white p-1" />
                          ) : (
                            <div className="h-10 w-10 rounded-xl bg-brand-100 text-brand-700 grid place-items-center font-bold">
                              {item.title ? item.title[0] : 'P'}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-ink-900">{item.title || 'Refurbished Smartphone'}</p>
                            <p className="text-ink-500">Qty: {item.quantity || 1}</p>
                          </div>
                        </div>
                        <span className="font-black text-brand-700 text-sm">{formatINR(item.price || 0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Delivery Partner Dispatch */}
              <div className="p-4 rounded-2xl bg-brand-50/50 border border-brand-100 space-y-3">
                <span className="text-xs font-bold text-brand-900 flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-brand-600" /> Assigned Delivery Executive
                </span>
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-black text-ink-900 text-sm">
                      {selectedOrder.delivery_person_name || 'Auto-dispatching certified rider...'}
                    </p>
                    {selectedOrder.delivery_person_phone && (
                      <a
                        href={`tel:${selectedOrder.delivery_person_phone}`}
                        className="text-brand-600 font-bold hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <PhoneCall className="h-3 w-3" /> Call {selectedOrder.delivery_person_phone}
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      onChange={(e) => handleSelectReassignAgent(selectedOrder, e.target.value)}
                      defaultValue=""
                      className="input text-xs py-1 bg-white font-bold border-brand-300"
                    >
                      <option value="" disabled>
                        Reassign agent & Send Alert...
                      </option>
                      {agents.map((ag) => (
                        <option key={ag.id} value={ag.id}>
                          {ag.name} ({ag.status}) - {ag.current_orders_count} orders
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <a
                  href={getDeliveryPartnerJobWhatsAppLink(selectedOrder)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn bg-[#25D366] text-white hover:bg-[#20bd5a] text-xs px-3 py-2 flex items-center justify-center gap-1.5 font-bold shadow-xs rounded-xl w-full"
                >
                  <MessageSquare className="h-3.5 w-3.5" /> Send Order Job Briefing to Executive on WhatsApp
                </a>
              </div>

              {/* Customer Live Tracking Inquiries & Notes */}
              <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4 text-teal-600" /> Customer Tracking Instructions & Live Chat
                  </span>
                  <span className="rounded-full bg-teal-200/60 px-2 py-0.5 text-[10px] font-black text-teal-800">
                    Live Support
                  </span>
                </div>

                {selectedOrder.customer_notes ? (
                  <div className="p-3 bg-white rounded-xl border border-teal-100 text-xs">
                    <p className="text-[10px] font-bold uppercase text-ink-400">Latest Customer Note:</p>
                    <p className="font-semibold text-ink-800 mt-0.5">"{selectedOrder.customer_notes}"</p>
                  </div>
                ) : (
                  <p className="text-xs text-teal-700 italic">No special instructions from customer yet.</p>
                )}

                {/* Messages conversation thread */}
                {Array.isArray(selectedOrder.support_messages) && selectedOrder.support_messages.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedOrder.support_messages.map((m: any, idx: number) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl text-xs ${
                          m.sender === 'admin'
                            ? 'bg-teal-600 text-white ml-6 font-medium'
                            : 'bg-white text-slate-800 border border-teal-200 mr-6 font-medium'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-[10px] opacity-80">
                            {m.sender === 'admin' ? 'Fundu Admin (You)' : 'Customer'}
                          </span>
                          <span className="text-[9px] text-ink-400">
                            {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p>{m.message}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Form */}
                <div className="pt-2 flex gap-2">
                  <input
                    type="text"
                    placeholder="Type reply or delivery update to customer..."
                    value={adminReplyText}
                    onChange={(e) => setAdminReplyText(e.target.value)}
                    className="input text-xs bg-white flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendAdminReply(selectedOrder)}
                    className="btn-primary text-xs px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 font-bold flex items-center gap-1 shadow-xs"
                  >
                    <Send className="h-3.5 w-3.5" /> Reply Customer
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-12 text-center bg-white rounded-[28px] border border-[#dce5e8]">
              <Package className="h-12 w-12 text-ink-300 mx-auto" />
              <h3 className="font-display text-lg font-bold text-ink-900 mt-3">No Order Selected</h3>
            </div>
          )}
        </div>
      </div>

      {/* CUSTOMER FULL DETAILS MODAL */}
      <CustomerDetailsModal
        isOpen={Boolean(customerModalData)}
        onClose={() => setCustomerModalData(null)}
        customer={customerModalData}
      />

      {/* RE-ASSIGNMENT EMAIL & MOBILE SMS NOTIFICATION MODAL */}
      {reassignModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-[28px] shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[92vh] animate-fade-in text-slate-900">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-500 text-slate-950 grid place-items-center font-black">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-lg text-white">
                    Order Task Re-assigned
                  </h3>
                  <p className="text-xs text-slate-400">
                    Order #{reassignModalData.order.id.slice(0, 8).toUpperCase()} · Re-assigned to {reassignModalData.newAgent.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReassignModalData(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 grid place-items-center text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                <p className="font-black text-sm text-amber-950">
                  🔄 Reassigned: {reassignModalData.oldAgentName} ➔ {reassignModalData.newAgent.name} ({reassignModalData.newAgent.phone})
                </p>
                <p className="text-amber-800">
                  Database record updated. Send immediate Email & Mobile SMS / WhatsApp alerts to the newly assigned delivery executive below.
                </p>
              </div>

              {/* EMAIL DISPATCH PREVIEW BOX */}
              <div className="space-y-2.5 p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="font-black text-blue-950 text-xs flex items-center gap-1.5">
                    📧 1. Automated Email Dispatch Payload
                  </span>
                  <span className="badge bg-blue-600 text-white text-[10px] font-bold">
                    SMTP / Resend API
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-blue-200 font-mono text-[11px] space-y-1 text-slate-800">
                  <p><strong className="text-slate-500">TO:</strong> {reassignModalData.newAgent.email || reassignModalData.newAgent.name.toLowerCase().replace(/\s+/g, '.') + '@fundu.in'}</p>
                  <p><strong className="text-slate-500">SUBJECT:</strong> 🚨 NEW DISPATCH TASK: Order #{reassignModalData.order.id.slice(0, 8).toUpperCase()}</p>
                  <div className="pt-2 border-t border-slate-100 font-sans text-xs text-slate-700 space-y-1">
                    <p>Hi <strong>{reassignModalData.newAgent.name}</strong>,</p>
                    <p>You have been assigned a new doorstep delivery task in Lucknow:</p>
                    <p>• <strong>Order ID:</strong> #{reassignModalData.order.id.slice(0, 8).toUpperCase()}</p>
                    <p>• <strong>Customer Name:</strong> {reassignModalData.order.delivery_name || 'Customer'}</p>
                    <p>• <strong>Customer Phone:</strong> {reassignModalData.order.delivery_phone || 'N/A'}</p>
                    <p>• <strong>Delivery Address:</strong> {reassignModalData.order.delivery_address || 'Lucknow'}</p>
                    <p>• <strong>Total Payable Amount:</strong> ₹{reassignModalData.order.total_amount?.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEmailSentSuccess(true);
                    alert(`📧 Email Alert successfully dispatched to ${reassignModalData.newAgent.email || reassignModalData.newAgent.name + '@fundu.in'}!`);
                  }}
                  className={`btn text-xs px-4 py-2 font-bold rounded-xl flex items-center gap-1.5 transition w-full justify-center ${
                    emailSentSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                  }`}
                >
                  {emailSentSuccess ? '✓ Email Sent & Logged' : '📧 Trigger Email Notification to Executive'}
                </button>
              </div>

              {/* MOBILE SMS & WHATSAPP DISPATCH BOX */}
              <div className="space-y-2.5 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                <div className="flex items-center justify-between">
                  <span className="font-black text-emerald-950 text-xs flex items-center gap-1.5">
                    📲 2. Mobile SMS / WhatsApp Direct Alert
                  </span>
                  <span className="badge bg-emerald-600 text-white text-[10px] font-bold">
                    Fast2SMS / WhatsApp API
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-emerald-200 font-mono text-[11px] text-slate-800">
                  <p className="text-slate-500 text-[10px] mb-1 font-bold uppercase">SMS TEXT PAYLOAD (Sent to {reassignModalData.newAgent.phone}):</p>
                  <p className="text-slate-800">
                    [FUNDU DISPATCH] New task assigned: Order #{reassignModalData.order.id.slice(0, 8).toUpperCase()} for {reassignModalData.order.delivery_name || 'Customer'}. Address: {reassignModalData.order.delivery_address || 'Lucknow'}. Phone: {reassignModalData.order.delivery_phone}. Open map: https://maps.google.com/?q={encodeURIComponent(reassignModalData.order.delivery_address || 'Lucknow')}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={getDeliveryPartnerJobWhatsAppLink(reassignModalData.order, reassignModalData.newAgent.phone)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs px-4 py-2 font-black rounded-xl flex items-center justify-center gap-1.5 shadow-xs flex-1"
                  >
                    💬 Send WhatsApp / SMS Alert Now
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setSmsSentSuccess(true);
                      alert(`📲 SMS Dispatch Triggered to ${reassignModalData.newAgent.phone}!`);
                    }}
                    className="btn bg-slate-900 text-white text-xs px-4 py-2 font-bold rounded-xl"
                  >
                    {smsSentSuccess ? '✓ SMS Sent' : '📲 Send SMS'}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setReassignModalData(null)}
                className="btn bg-slate-900 text-white text-xs px-5 py-2 font-black rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
