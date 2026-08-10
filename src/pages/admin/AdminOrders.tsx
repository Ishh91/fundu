import React, { useState } from 'react';
import { Package, Search, Truck, MapPin, PhoneCall, MessageCircle, CreditCard, ShoppingBag } from 'lucide-react';
import type { Order, DeliveryAgent } from './adminTypes';
import { statusColors } from './adminTypes';
import { formatINR } from '../../lib/db';

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
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = `${o.delivery_name || ''} ${o.id} ${o.delivery_phone || ''} ${o.delivery_address || ''}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

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
                placeholder="Search order ID, customer name..."
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

                <div className="flex items-center gap-2">
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
                      onChange={(e) => onReassignAgent(selectedOrder.id, e.target.value)}
                      defaultValue=""
                      className="input text-xs py-1 bg-white"
                    >
                      <option value="" disabled>
                        Reassign agent...
                      </option>
                      {agents.map((ag) => (
                        <option key={ag.id} value={ag.id}>
                          {ag.name} ({ag.status}) - {ag.current_orders_count} orders
                        </option>
                      ))}
                    </select>
                  </div>
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
    </div>
  );
}
