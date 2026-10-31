import React, { useState } from 'react';
import {
  Truck,
  Search,
  Plus,
  MapPin,
  PhoneCall,
  CheckCircle2,
  Package,
  Smartphone,
  Wrench,
  Navigation,
  XCircle,
  Edit3,
  AlertTriangle,
  RotateCcw,
  DollarSign,
  X,
  Camera,
  Shield,
  Eye,
} from 'lucide-react';
import type { DeliveryAgent, Order, SellRequest, RepairBooking } from './adminTypes';
import { db, formatINR } from '../../lib/db';

type AdminDeliveryAgentsProps = {
  agents: DeliveryAgent[];
  selectedAgentId: string | null;
  onSelectAgent: (id: string) => void;
  onOpenAgentModal: () => void;
  onToggleStatus: (agent: DeliveryAgent) => void;
  orders?: Order[];
  sellRequests?: SellRequest[];
  repairs?: RepairBooking[];
};

export default function AdminDeliveryAgents({
  agents,
  selectedAgentId,
  onSelectAgent,
  onOpenAgentModal,
  onToggleStatus,
  orders = [],
  sellRequests = [],
  repairs = [],
}: AdminDeliveryAgentsProps) {
  const [subTab, setSubTab] = useState<'fleet' | 'pending-inspections' | 'declined-tasks'>('fleet');
  const [search, setSearch] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [overrideModal, setOverrideModal] = useState<{ open: boolean; sell: any; price: string }>({
    open: false,
    sell: null,
    price: '',
  });

  const pendingInspections = sellRequests.filter((s) => s.status === 'inspection_submitted');
  const declinedSells = sellRequests.filter((s) => (s as any).rider_acceptance_status === 'declined');
  const declinedRepairs = repairs.filter((r) => (r as any).rider_acceptance_status === 'declined');
  const declinedOrders = orders.filter((o) => (o as any).rider_acceptance_status === 'declined');
  const totalDeclinedCount = declinedSells.length + declinedRepairs.length + declinedOrders.length;

  const filteredAgents = agents.filter((ag) =>
    `${ag.name} ${ag.phone} ${ag.current_locality || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const selectedAgent = agents.find((ag) => ag.id === selectedAgentId) || filteredAgents[0] || null;

  const agentOrders = selectedAgent
    ? orders.filter(
        (o) =>
          o.assigned_agent_id === selectedAgent.id ||
          (o.delivery_person_name && o.delivery_person_name.toLowerCase().includes(selectedAgent.name.toLowerCase()))
      )
    : [];

  const agentSells = selectedAgent
    ? sellRequests.filter(
        (s) =>
          s.assigned_agent_id === selectedAgent.id ||
          ((s as any).pickup_person_name && (s as any).pickup_person_name.toLowerCase().includes(selectedAgent.name.toLowerCase()))
      )
    : [];

  const agentRepairs = selectedAgent
    ? repairs.filter(
        (r) =>
          r.assigned_agent_id === selectedAgent.id ||
          (r.delivery_person_name && r.delivery_person_name.toLowerCase().includes(selectedAgent.name.toLowerCase()))
      )
    : [];

  // Approval, Override & Reassignment Handlers
  const handleApproveInspectionPayout = async (sell: SellRequest) => {
    const payout = sell.final_price || sell.estimated_price || 0;
    const { error } = await db.from('sell_requests').update({
      status: 'confirmed',
      rider_inspection_status: 'approved',
    }).eq('id', sell.id);

    if (error) {
      alert(`❌ Error approving payout: ${error.message}`);
      return;
    }
    alert(`✅ Spot Payout of ${formatINR(payout)} approved for ${sell.brand} ${sell.model}!\nExecutive portal received live clearance.`);
    window.location.reload();
  };

  const handleSavePriceOverride = async () => {
    if (!overrideModal.sell) return;
    const num = Number(overrideModal.price);
    if (!num || num <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    const { error } = await db.from('sell_requests').update({
      final_price: num,
      status: 'confirmed',
      rider_inspection_status: 'approved',
    }).eq('id', overrideModal.sell.id);

    if (error) {
      alert(`❌ Error saving price: ${error.message}`);
      return;
    }
    alert(`✅ Spot Payout overridden to ${formatINR(num)} and approved!`);
    setOverrideModal({ open: false, sell: null, price: '' });
    window.location.reload();
  };

  const handleReassignSellExecutive = async (sellId: string, newAgentId: string) => {
    const ag = agents.find((a) => a.id === newAgentId);
    if (!ag) return;
    const { error } = await db.from('sell_requests').update({
      assigned_agent_id: ag.id,
      pickup_person_name: ag.name,
      pickup_person_phone: ag.phone,
      rider_acceptance_status: 'assigned',
      status: 'assigned',
    }).eq('id', sellId);

    if (error) {
      alert(`❌ Reassignment error: ${error.message}`);
      return;
    }
    alert(`✅ Pickup reassigned to ${ag.name} (${ag.phone})!`);
    window.location.reload();
  };

  const handleReassignRepairExecutive = async (repairId: string, newAgentId: string) => {
    const ag = agents.find((a) => a.id === newAgentId);
    if (!ag) return;
    const { error } = await db.from('repair_bookings').update({
      assigned_agent_id: ag.id,
      delivery_person_name: ag.name,
      delivery_person_phone: ag.phone,
      rider_acceptance_status: 'assigned',
      status: 'assigned',
    }).eq('id', repairId);

    if (error) {
      alert(`❌ Reassignment error: ${error.message}`);
      return;
    }
    alert(`✅ Repair booking reassigned to ${ag.name}!`);
    window.location.reload();
  };

  const handleReassignOrderExecutive = async (orderId: string, newAgentId: string) => {
    const ag = agents.find((a) => a.id === newAgentId);
    if (!ag) return;
    const { error } = await db.from('orders').update({
      assigned_agent_id: ag.id,
      delivery_person_name: ag.name,
      delivery_person_phone: ag.phone,
      rider_acceptance_status: 'assigned',
      status: 'assigned',
    }).eq('id', orderId);

    if (error) {
      alert(`❌ Reassignment error: ${error.message}`);
      return;
    }
    alert(`✅ Order delivery reassigned to ${ag.name}!`);
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="card p-6 rounded-[28px] bg-gradient-to-r from-slate-700/10 via-brand-500/10 to-[#344257]/10 border border-slate-200/60 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
            <Truck className="h-3.5 w-3.5" /> Doorstep Dispatch Fleet & Verification
          </div>
          <h2 className="mt-2 font-display text-2xl font-black text-ink-900">Delivery & Field Executives</h2>
          <p className="mt-1 text-xs text-ink-600">
            Verify doorstep physical inspection sheets, approve spot payouts, handle rider declines & manage vehicle fleet.
          </p>
        </div>

        <button
          onClick={onOpenAgentModal}
          className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 font-bold"
        >
          <Plus className="h-3.5 w-3.5" /> Register Delivery Partner
        </button>
      </div>

      {/* Subtab Navigation Bar */}
      <div className="flex gap-2 border-b border-gray-200 pb-3">
        <button
          type="button"
          onClick={() => setSubTab('fleet')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
            subTab === 'fleet'
              ? 'bg-[#344257] text-white shadow-sm'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Truck className="h-3.5 w-3.5" />
          <span>Fleet & Active Riders ({agents.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('pending-inspections')}
          className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
            subTab === 'pending-inspections'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white text-amber-900 hover:bg-amber-50 border border-amber-300'
          }`}
        >
          <Camera className="h-3.5 w-3.5" />
          <span>⚡ Pending Spot Clearances</span>
          {pendingInspections.length > 0 && (
            <span className="badge bg-white text-amber-800 font-extrabold text-[10px] px-1.5 py-0.2 animate-pulse">
              {pendingInspections.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setSubTab('declined-tasks')}
          className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
            subTab === 'declined-tasks'
              ? 'bg-red-600 text-white shadow-sm'
              : 'bg-white text-red-900 hover:bg-red-50 border border-red-300'
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>🚨 Declined Pickups</span>
          {totalDeclinedCount > 0 && (
            <span className="badge bg-white text-red-800 font-extrabold text-[10px] px-1.5 py-0.2 animate-pulse">
              {totalDeclinedCount}
            </span>
          )}
        </button>
      </div>

      {/* VIEW 1: FLEET & LIVE RIDERS */}
      {subTab === 'fleet' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Agents List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="card p-3 rounded-2xl bg-white shadow-xs">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-ink-400 shrink-0 ml-1" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search delivery partner..."
                  className="w-full text-xs bg-transparent border-none focus:outline-none text-ink-900 font-medium"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-[calc(100vh-340px)] overflow-y-auto pr-1">
              {filteredAgents.length === 0 ? (
                <div className="card p-8 text-center bg-white">
                  <Truck className="h-8 w-8 text-ink-300 mx-auto" />
                  <p className="text-xs font-bold text-ink-700 mt-2">No partners registered</p>
                </div>
              ) : (
                filteredAgents.map((ag) => {
                  const isSelected = selectedAgent?.id === ag.id;
                  return (
                    <div
                      key={ag.id}
                      onClick={() => onSelectAgent(ag.id)}
                      className={`card p-4 rounded-2xl cursor-pointer transition-all ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50/60 shadow-md ring-2 ring-brand-500/20'
                          : 'bg-white hover:border-brand-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-100 text-brand-700 font-bold text-sm">
                            {ag.name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-ink-900">{ag.name}</p>
                            <p className="text-xs text-ink-500">{ag.phone}</p>
                          </div>
                        </div>
                        <span
                          className={`badge text-[10px] font-bold ${
                            ag.status === 'available' ? 'bg-emerald-50 text-emerald-700' : 'bg-ink-100 text-ink-600'
                          }`}
                        >
                          {ag.status}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs pt-2 border-t border-ink-100/60 text-ink-500">
                        <span>Active Load: {ag.current_orders_count} orders</span>
                        <span>★ {ag.rating || '4.8'}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Agent Details */}
          <div className="lg:col-span-7 sticky top-6">
            {selectedAgent ? (
              <div className="card p-6 md:p-8 rounded-[28px] space-y-6 shadow-sm border border-[#dce5e8] bg-white">
                <div className="flex items-center justify-between pb-4 border-b border-ink-100">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-white font-display text-xl font-black">
                      {selectedAgent.name[0]}
                    </div>
                    <div>
                      <h2 className="font-display text-2xl font-black text-ink-900">{selectedAgent.name}</h2>
                      <p className="text-xs text-ink-500">{selectedAgent.phone}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleStatus(selectedAgent)}
                    className={`btn text-xs px-3.5 py-1.5 font-bold rounded-xl ${
                      selectedAgent.status === 'available'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    Set {selectedAgent.status === 'available' ? 'Offline' : 'Available'}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-ink-50 p-4 rounded-2xl text-xs">
                  <div>
                    <p className="text-ink-500 font-medium">Vehicle</p>
                    <p className="font-bold text-ink-900 mt-0.5">{selectedAgent.vehicle_type} ({selectedAgent.vehicle_number || 'N/A'})</p>
                  </div>
                  <div>
                    <p className="text-ink-500 font-medium">Max Order Capacity</p>
                    <p className="font-bold text-ink-900 mt-0.5">{selectedAgent.max_capacity} pickups/day</p>
                  </div>
                  <div>
                    <p className="text-ink-500 font-medium">Current Active Load</p>
                    <p className="font-black text-brand-700 text-sm mt-0.5">{selectedAgent.current_orders_count} orders</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 text-white text-xs space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="badge bg-brand-500 text-slate-950 font-black text-[10px] uppercase">
                      🔒 Private Fleet Login Credentials
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Secret Route: <strong className="text-emerald-400">/fleet-desk</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700 font-mono text-[11px]">
                    <div>
                      <span className="text-slate-400 text-[10px] block">RIDER OFFICIAL ID:</span>
                      <span className="font-bold text-brand-400">
                        {selectedAgent.rider_id || 'LKO-RIDER-' + selectedAgent.id.slice(0, 4).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">LOGIN EMAIL:</span>
                      <span className="font-bold text-white">
                        {selectedAgent.email || selectedAgent.name.toLowerCase().replace(/\s+/g, '') + '@fundu.in'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">SECRET PASSCODE:</span>
                      <span className="font-bold text-emerald-400">{selectedAgent.login_pin || 'Rider@123'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">STATUS:</span>
                      <span className="font-bold text-[#C0C8D8]">Active & Verified Fleet</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <a
                      href={`https://wa.me/91${selectedAgent.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                        `🎉 *FUNDU DISPATCH FLEET - RIDER CREDENTIALS*\n\n` +
                        `👤 *Name:* ${selectedAgent.name}\n` +
                        `🆔 *Rider ID:* ${selectedAgent.rider_id || 'LKO-RIDER-' + selectedAgent.id.slice(0, 4).toUpperCase()}\n` +
                        `📧 *Login Email:* ${selectedAgent.email || selectedAgent.name.toLowerCase().replace(/\s+/g, '') + '@fundu.in'}\n` +
                        `🔑 *Secret Passcode:* ${selectedAgent.login_pin || 'Rider@123'}\n` +
                        `🔗 *Private Fleet Portal:* ${window.location.origin}/fleet-desk\n\n` +
                        `Please log in on the private fleet desk and keep your GPS online.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs px-3.5 py-2 font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
                    >
                      <PhoneCall className="h-3.5 w-3.5" /> 📲 WhatsApp Credentials to Partner
                    </a>

                    <a
                      href="/fleet-desk"
                      target="_blank"
                      rel="noreferrer"
                      className="btn bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-2 font-bold rounded-xl flex items-center gap-1.5"
                    >
                      <Truck className="h-3.5 w-3.5 text-brand-400" /> Open Private Rider Desk
                    </a>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs">
                  <p className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-emerald-600" /> Operational Service Localities
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedAgent.zones?.map((zone) => (
                      <span key={zone} className="rounded-xl bg-white px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                        {zone}
                      </span>
                    ))}
                  </div>
                </div>

                {/* ASSIGNED TASKS SUMMARY BOX */}
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-black text-blue-950 flex items-center gap-1.5 text-sm">
                      <Package className="h-4 w-4 text-blue-600" />
                      Orders Assigned to {selectedAgent.name} ({agentOrders.length + agentSells.length + agentRepairs.length})
                    </p>
                    <span className="badge bg-blue-600 text-white font-bold text-[10px]">
                      Live Executive Queue
                    </span>
                  </div>

                  {agentOrders.length === 0 && agentSells.length === 0 && agentRepairs.length === 0 ? (
                    <p className="text-slate-500 font-medium py-2">No active orders assigned to {selectedAgent.name} currently.</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {agentOrders.map((o) => (
                        <div key={o.id} className="p-3 rounded-xl bg-white border border-blue-200 flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="badge bg-[#F0F0F5] text-[#344257] border border-[#C0C8D8] font-bold text-[10px]">Store Order</span>
                              <span className="font-bold text-slate-900">#{o.id.slice(0, 8).toUpperCase()}</span>
                            </div>
                            <p className="text-slate-600 mt-0.5">{o.delivery_name || 'Customer'} · {o.delivery_address || 'Doorstep Service'}</p>
                          </div>
                          <span className="font-black text-brand-700">{formatINR(o.total_amount || 0)}</span>
                        </div>
                      ))}

                      {agentSells.map((s) => (
                        <div key={s.id} className="p-3 rounded-xl bg-white border border-amber-200 flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="badge bg-amber-100 text-amber-800 font-bold text-[10px]">Sell Pickup</span>
                              <span className="font-bold text-slate-900">#{s.id.slice(0, 8).toUpperCase()}</span>
                            </div>
                            <p className="text-slate-600 mt-0.5">{s.brand} {s.model} · {s.pickup_address || s.pickup_area || 'Doorstep Service'}</p>
                          </div>
                          <span className="font-black text-emerald-700">{formatINR(s.final_price || s.estimated_price || 0)}</span>
                        </div>
                      ))}

                      {agentRepairs.map((r) => (
                        <div key={r.id} className="p-3 rounded-xl bg-white border border-purple-200 flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="badge bg-purple-100 text-purple-800 font-bold text-[10px]">Doorstep Repair</span>
                              <span className="font-bold text-slate-900">#{r.id.slice(0, 8).toUpperCase()}</span>
                            </div>
                            <p className="text-slate-600 mt-0.5">{r.brand} {r.model} · {r.problem}</p>
                          </div>
                          <span className="font-black text-purple-800">{formatINR(r.final_cost || r.estimated_cost || 0)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="card p-12 text-center bg-white rounded-[28px] border border-[#dce5e8]">
                <Truck className="h-12 w-12 text-ink-300 mx-auto" />
                <h3 className="font-display text-lg font-bold text-ink-900 mt-3">No Delivery Partner Selected</h3>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: PENDING DOORSTEP INSPECTIONS & SPOT CLEARANCE */}
      {subTab === 'pending-inspections' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="badge bg-amber-200 text-amber-900 font-extrabold uppercase text-[10px]">
                ⚡ Executive Doorstep Spot Clearance Hub
              </span>
              <p className="text-amber-950 font-bold mt-1 text-sm">
                Riders have completed 32-point physical check & uploaded live photos. Review and authorize spot bank payout.
              </p>
            </div>
            <span className="font-mono font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-xl">
              {pendingInspections.length} Waiting Verification
            </span>
          </div>

          {pendingInspections.length === 0 ? (
            <div className="card p-12 text-center bg-white rounded-3xl border border-gray-200 space-y-2">
              <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
              <h3 className="font-extrabold text-gray-900 text-base">All Spot Payouts Cleared!</h3>
              <p className="text-xs text-gray-500">No field inspections currently awaiting Admin spot authorization.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingInspections.map((sell) => {
                const payoutAmount = sell.final_price || sell.estimated_price || 0;
                const photos = [
                  { label: 'Front', url: sell.device_photos?.front },
                  { label: 'Back', url: sell.device_photos?.back },
                  { label: 'Edges', url: sell.device_photos?.edges },
                  { label: 'IMEI / Bill', url: sell.imei_photo || sell.device_photos?.bill_box },
                ].filter((p) => Boolean(p.url));

                return (
                  <div key={sell.id} className="card p-5 rounded-2xl bg-white border border-amber-200 shadow-sm space-y-4">
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100">
                      <div>
                        <span className="badge bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[10px]">
                          #SELL-{sell.id.slice(0, 8).toUpperCase()}
                        </span>
                        <h4 className="font-extrabold text-base text-gray-900 mt-1">
                          {sell.brand} {sell.model} {sell.storage ? `(${sell.storage})` : ''}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {sell.pickup_address || sell.pickup_area || 'Doorstep Service'} · Customer: {sell.customer_name || 'Customer'}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold uppercase text-gray-400 block">Proposed Spot Payout</span>
                        <span className="font-black text-xl text-emerald-700">
                          {formatINR(payoutAmount)}
                        </span>
                        <span className="text-[10px] text-gray-400 block">
                          Original: {formatINR(sell.estimated_price || 0)}
                        </span>
                      </div>
                    </div>

                    {/* IMEI & Diagnostics Summary */}
                    <div className="p-3 bg-gray-50 rounded-xl space-y-1.5 text-xs">
                      {sell.imei && (
                        <div className="flex items-center gap-2 font-mono font-bold text-gray-800">
                          <Shield className="h-3.5 w-3.5 text-emerald-600" />
                          <span>IMEI: {sell.imei}</span>
                        </div>
                      )}

                      {sell.notes && (
                        <p className="text-gray-700 italic text-[11px] bg-white p-2 rounded-lg border border-gray-200">
                          {sell.notes}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-[11px] pt-1 text-gray-600">
                        <span>Executive: <strong>{(sell as any).pickup_person_name || 'Assigned Rider'}</strong></span>
                        <span>Mode: <strong>{sell.payout_method || 'UPI'}</strong></span>
                      </div>
                    </div>

                    {/* Live Photos Uploaded by Executive */}
                    {photos.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold uppercase text-gray-400 block">
                          Live Inspection Photos ({photos.length})
                        </span>
                        <div className="grid grid-cols-4 gap-2">
                          {photos.map((p, idx) => (
                            <div
                              key={idx}
                              onClick={() => setPhotoPreview(p.url as string)}
                              className="group relative h-16 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 cursor-pointer"
                            >
                              <img src={p.url} alt={p.label} className="w-full h-full object-cover group-hover:scale-105 transition" />
                              <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] text-center py-0.5 truncate font-medium">
                                {p.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleApproveInspectionPayout(sell)}
                          className="btn bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs flex items-center gap-1"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Approve Payout ({formatINR(payoutAmount)})
                        </button>

                        <button
                          type="button"
                          onClick={() => setOverrideModal({
                            open: true,
                            sell,
                            price: String(payoutAmount),
                          })}
                          className="btn-outline bg-white hover:bg-gray-50 text-indigo-700 border-indigo-200 font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1"
                        >
                          <Edit3 className="h-3.5 w-3.5" /> Override
                        </button>
                      </div>

                      {/* Reassign Executive Dropdown */}
                      <div className="flex items-center gap-1 bg-gray-50 border border-gray-300 rounded-xl px-2 py-1">
                        <RotateCcw className="h-3 w-3 text-gray-500 shrink-0" />
                        <select
                          value={sell.assigned_agent_id || ''}
                          onChange={(e) => handleReassignSellExecutive(sell.id, e.target.value)}
                          className="bg-transparent text-xs font-bold text-gray-800 focus:outline-none cursor-pointer"
                        >
                          <option value="" disabled>Reassign Executive...</option>
                          {agents.map((ag) => (
                            <option key={ag.id} value={ag.id}>
                              {ag.name} ({ag.status}) - {ag.current_orders_count} tasks
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: DECLINED TASKS & REASSIGNMENT QUEUE */}
      {subTab === 'declined-tasks' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="badge bg-red-200 text-red-900 font-extrabold uppercase text-[10px]">
                🚨 Declined Lead Reassignment Hub
              </span>
              <p className="text-red-950 font-bold mt-1 text-sm">
                Riders were unable to service these pickups. Reassign immediately to prevent customer drop-off.
              </p>
            </div>
            <span className="font-mono font-bold text-red-900 bg-red-100 px-3 py-1 rounded-xl">
              {totalDeclinedCount} Tasks Pending Reassignment
            </span>
          </div>

          {totalDeclinedCount === 0 ? (
            <div className="card p-12 text-center bg-white rounded-3xl border border-gray-200 space-y-2">
              <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
              <h3 className="font-extrabold text-gray-900 text-base">No Declined Tasks!</h3>
              <p className="text-xs text-gray-500">All field executives are actively attending their assigned pickups.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Declined Sell Pickups */}
              {declinedSells.map((sell) => (
                <div key={sell.id} className="card p-4 rounded-2xl bg-white border border-red-300 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="badge bg-red-600 text-white font-extrabold text-[10px]">Sell Pickup Declined</span>
                      <span className="font-bold text-gray-900">{sell.brand} {sell.model}</span>
                      <span className="text-gray-400 font-mono">#{sell.id.slice(0, 8).toUpperCase()}</span>
                    </div>
                    <p className="text-gray-600">
                      📍 {sell.pickup_address || sell.pickup_area || 'Doorstep Service'} · Customer: {sell.customer_name || 'Customer'} ({sell.customer_phone || ''})
                    </p>
                    <p className="text-red-700 font-semibold italic">
                      Decline Reason: "{(sell as any).rider_decline_reason || 'Schedule conflict / area unreachable'}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-black text-emerald-700 text-sm">
                      {formatINR(sell.final_price || sell.estimated_price || 0)}
                    </span>
                    <select
                      defaultValue=""
                      onChange={(e) => handleReassignSellExecutive(sell.id, e.target.value)}
                      className="input text-xs py-1.5 px-3 bg-red-50 border-red-300 font-bold text-gray-800"
                    >
                      <option value="" disabled>⚡ Reassign to another Rider...</option>
                      {agents.map((ag) => (
                        <option key={ag.id} value={ag.id}>
                          {ag.name} ({ag.status}) - {ag.current_orders_count} orders
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}

              {/* Declined Repairs */}
              {declinedRepairs.map((repair) => (
                <div key={repair.id} className="card p-4 rounded-2xl bg-white border border-red-300 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="badge bg-red-600 text-white font-extrabold text-[10px]">Repair Visit Declined</span>
                      <span className="font-bold text-gray-900">{repair.brand} {repair.model}</span>
                      <span className="text-gray-400 font-mono">#{repair.id.slice(0, 8).toUpperCase()}</span>
                    </div>
                    <p className="text-gray-600">
                      📍 {repair.pickup_address || 'Doorstep Service'} · Problem: {repair.problem}
                    </p>
                    <p className="text-red-700 font-semibold italic">
                      Decline Reason: "{(repair as any).rider_decline_reason || 'Rider unavailable'}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-black text-purple-700 text-sm">
                      {formatINR(repair.final_cost || repair.estimated_cost || 0)}
                    </span>
                    <select
                      defaultValue=""
                      onChange={(e) => handleReassignRepairExecutive(repair.id, e.target.value)}
                      className="input text-xs py-1.5 px-3 bg-red-50 border-red-300 font-bold text-gray-800"
                    >
                      <option value="" disabled>⚡ Reassign to another Technician...</option>
                      {agents.map((ag) => (
                        <option key={ag.id} value={ag.id}>
                          {ag.name} ({ag.status})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}

              {/* Declined Store Orders */}
              {declinedOrders.map((order) => (
                <div key={order.id} className="card p-4 rounded-2xl bg-white border border-red-300 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="badge bg-red-600 text-white font-extrabold text-[10px]">Order Delivery Declined</span>
                      <span className="font-bold text-gray-900">Order #{order.id.slice(0, 8).toUpperCase()}</span>
                    </div>
                    <p className="text-gray-600">
                      📍 {order.delivery_address || 'Doorstep Service'} · Deliver to: {order.delivery_name || 'Customer'}
                    </p>
                    <p className="text-red-700 font-semibold italic">
                      Decline Reason: "{(order as any).rider_decline_reason || 'Rider unavailable'}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-black text-brand-700 text-sm">
                      {formatINR(order.total_amount || 0)}
                    </span>
                    <select
                      defaultValue=""
                      onChange={(e) => handleReassignOrderExecutive(order.id, e.target.value)}
                      className="input text-xs py-1.5 px-3 bg-red-50 border-red-300 font-bold text-gray-800"
                    >
                      <option value="" disabled>⚡ Reassign to another Rider...</option>
                      {agents.map((ag) => (
                        <option key={ag.id} value={ag.id}>
                          {ag.name} ({ag.status})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PRICE OVERRIDE MODAL */}
      {overrideModal.open && overrideModal.sell && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">Spot Payout Override</h3>
                  <p className="text-xs text-gray-500">
                    {overrideModal.sell.brand} {overrideModal.sell.model} ({overrideModal.sell.storage || '128GB'})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOverrideModal({ open: false, sell: null, price: '' })}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-xl space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Original Estimate:</span>
                  <span className="font-bold text-gray-700">{formatINR(overrideModal.sell.estimated_price || 0)}</span>
                </div>
                {overrideModal.sell.final_price && (
                  <div className="flex justify-between">
                    <span className="text-amber-700 font-bold">Rider Proposed:</span>
                    <span className="font-extrabold text-amber-800">{formatINR(overrideModal.sell.final_price)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Assigned Executive:</span>
                  <span className="font-semibold text-gray-800">{(overrideModal.sell as any).pickup_person_name || 'Rider'}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Admin Authorized Payout Amount (₹)
                </label>
                <input
                  type="number"
                  value={overrideModal.price}
                  onChange={(e) => setOverrideModal((prev) => ({ ...prev, price: e.target.value }))}
                  placeholder="e.g. 15000"
                  className="input w-full text-base font-black text-gray-900"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Executive app will immediately update to this authorized amount for on-the-spot bank transfer.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setOverrideModal({ open: false, sell: null, price: '' })}
                className="btn-outline text-xs px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePriceOverride}
                className="btn-primary text-xs px-4 py-2 bg-amber-600 hover:bg-amber-700"
              >
                Authorize & Clear Spot Payout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL PHOTO PREVIEW MODAL */}
      {photoPreview && (
        <div
          onClick={() => setPhotoPreview(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-2xl max-h-[90vh] bg-black rounded-2xl overflow-hidden p-2">
            <button
              onClick={() => setPhotoPreview(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/20 text-white grid place-items-center hover:bg-white/40"
            >
              <X className="h-5 w-5" />
            </button>
            <img src={photoPreview} alt="Inspection Proof" className="max-w-full max-h-[85vh] object-contain rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
}
