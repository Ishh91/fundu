import React, { useState } from 'react';
import {
  BadgeIndianRupee,
  Search,
  Store,
  Shield,
  PhoneCall,
  MapPin,
  Camera,
  ExternalLink,
  CheckCircle2,
  Clock,
  UserCheck,
  Zap,
} from 'lucide-react';
import type { SellRequest, DeliveryAgent, MasterPhone } from './adminTypes';
import { statusColors } from './adminTypes';
import { formatINR } from '../../lib/db';

type AdminSellRequestsProps = {
  sells: SellRequest[];
  selectedSellId: string | null;
  onSelectSell: (id: string) => void;
  agents: DeliveryAgent[];
  masterPhones: MasterPhone[];
  onUpdateStatus: (id: string, status: string) => void;
  onReassignAgent: (sellId: string, agentId: string) => void;
  onApproveAndListToStore: (phone: MasterPhone) => void;
  onOpenProductModal: () => void;
};

export default function AdminSellRequests({
  sells,
  selectedSellId,
  onSelectSell,
  agents,
  masterPhones,
  onUpdateStatus,
  onReassignAgent,
  onApproveAndListToStore,
  onOpenProductModal,
}: AdminSellRequestsProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredSells = sells.filter((s) => {
    const matchesSearch = `${s.brand} ${s.model} ${s.pickup_address || ''} ${s.imei || ''} ${s.pickup_area || ''}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const selectedSell = sells.find((s) => s.id === selectedSellId) || filteredSells[0] || null;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="card p-6 rounded-[28px] bg-gradient-to-r from-amber-500/10 via-brand-500/10 to-emerald-500/10 border border-amber-200/60 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800">
            <BadgeIndianRupee className="h-3.5 w-3.5" /> Doorstep Mobile Buyback Management
          </div>
          <h2 className="mt-2 font-display text-2xl font-black text-ink-900">
            Sell Requests & Lucknow Pickups
          </h2>
          <p className="mt-1 text-xs text-ink-600">
            Verify 15-digit IMEIs, inspect uploaded device photos, reassign field agents, and approve spot payouts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-amber-200 shadow-xs text-center min-w-[110px]">
            <p className="text-[10px] font-bold uppercase text-ink-500">Total Requests</p>
            <p className="font-display text-xl font-black text-ink-900">{sells.length}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-emerald-200 shadow-xs text-center min-w-[110px]">
            <p className="text-[10px] font-bold uppercase text-emerald-700">Pending Action</p>
            <p className="font-display text-xl font-black text-emerald-700">
              {sells.filter((s) => s.status === 'pending' || s.status === 'assigned').length}
            </p>
          </div>
        </div>
      </div>

      {/* Main Split View: Left List + Right Detail Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Requests List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {/* Search & Status Filter */}
          <div className="card p-3 rounded-2xl bg-white shadow-xs space-y-2">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-ink-400 shrink-0 ml-1" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by phone, locality, IMEI..."
                className="w-full text-xs bg-transparent border-none focus:outline-none text-ink-900 font-medium"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-xs text-ink-400 hover:text-ink-700">
                  Clear
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pt-1 border-t border-ink-100/60">
              {[
                { id: 'all', label: 'All' },
                { id: 'pending', label: 'Pending' },
                { id: 'assigned', label: 'Assigned' },
                { id: 'picked_up', label: 'Picked Up' },
                { id: 'inspected', label: 'Inspected' },
                { id: 'accepted', label: 'Completed' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setStatusFilter(pill.id)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold shrink-0 transition ${
                    statusFilter === pill.id
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-ink-50 text-ink-600 hover:bg-ink-100'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* List Items */}
          <div className="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
            {filteredSells.length === 0 ? (
              <div className="card p-8 text-center bg-white">
                <BadgeIndianRupee className="h-8 w-8 text-ink-300 mx-auto" />
                <p className="text-xs font-bold text-ink-700 mt-2">No sell requests found</p>
                <p className="text-[11px] text-ink-400 mt-0.5">Try clearing filters or search terms</p>
              </div>
            ) : (
              filteredSells.map((s) => {
                const isSelected = selectedSell?.id === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => onSelectSell(s.id)}
                    className={`card p-4 rounded-2xl cursor-pointer transition-all ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/60 shadow-md ring-2 ring-brand-500/20'
                        : 'bg-white hover:border-brand-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-sm text-ink-900">
                          {s.brand} {s.model}
                        </p>
                        <p className="text-xs text-ink-500 font-medium">
                          {s.storage || '128GB'} · {s.condition}
                        </p>
                      </div>
                      <span className={`badge text-[10px] ${statusColors[s.status] ?? 'bg-ink-100 text-ink-600'}`}>
                        {s.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs pt-2 border-t border-ink-100/60">
                      <span className="font-extrabold text-emerald-700">
                        {formatINR(s.final_price || s.estimated_price || 0)}
                      </span>
                      <span className="text-ink-400 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-brand-600" /> {s.pickup_area || 'Lucknow'}
                      </span>
                    </div>

                    {s.imei && (
                      <div className="mt-1.5 flex items-center gap-1 text-[11px] text-emerald-700 font-mono font-semibold">
                        <Shield className="h-3 w-3" /> IMEI: {s.imei}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Rich Inspection & Action Pane (7 cols) */}
        <div className="lg:col-span-7 sticky top-6">
          {selectedSell ? (
            <div className="card p-6 md:p-8 rounded-[28px] space-y-6 shadow-sm border border-[#dce5e8] bg-white">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-ink-100">
                <div>
                  <span className="badge bg-brand-50 text-brand-700">Sell Request #{selectedSell.id.slice(0, 8)}</span>
                  <h2 className="font-display text-2xl font-black text-ink-900 mt-1">
                    {selectedSell.brand} {selectedSell.model} {selectedSell.storage ? `(${selectedSell.storage})` : ''}
                  </h2>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={selectedSell.status}
                    onChange={(e) => onUpdateStatus(selectedSell.id, e.target.value)}
                    className="input text-xs py-1.5 px-3 bg-white font-bold"
                  >
                    {['pending', 'assigned', 'pickup_scheduled', 'picked_up', 'inspected', 'accepted', 'completed', 'rejected'].map((st) => (
                      <option key={st} value={st}>
                        {st.replace('_', ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => {
                      const matchingMaster = masterPhones.find(
                        (mp) => mp.model.toLowerCase() === selectedSell.model.toLowerCase()
                      );
                      if (matchingMaster) {
                        onApproveAndListToStore(matchingMaster);
                      } else {
                        onOpenProductModal();
                      }
                    }}
                    className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 font-bold shadow-xs"
                  >
                    <Store className="h-3.5 w-3.5" /> Approve & List in Store
                  </button>
                </div>
              </div>

              {/* Price & Payout Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-ink-50 p-4 rounded-2xl">
                <div>
                  <p className="text-xs text-ink-500 font-medium">Condition Grade</p>
                  <p className="font-bold text-ink-900 mt-0.5">{selectedSell.condition}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-500 font-medium">Estimated Quote</p>
                  <p className="font-black text-emerald-700 text-sm mt-0.5">
                    {formatINR(selectedSell.estimated_price || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-ink-500 font-medium">Final Spot Payout</p>
                  <p className="font-black text-brand-700 text-sm mt-0.5">
                    {selectedSell.final_price ? formatINR(selectedSell.final_price) : 'Pending Inspection'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-ink-500 font-medium">Payout Method</p>
                  <p className="font-bold text-ink-900 text-xs mt-0.5">{selectedSell.payout_method || 'UPI / Instant Cash'}</p>
                </div>
              </div>

              {/* 15-Digit IMEI Verification */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-emerald-600" /> 15-Digit IMEI Verification
                  </span>
                  {selectedSell.imei ? (
                    <span className="badge bg-emerald-100 text-emerald-800 text-[10px] font-bold">Verified</span>
                  ) : (
                    <span className="badge bg-amber-100 text-amber-800 text-[10px] font-bold">Doorstep Check</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-mono text-base font-black text-ink-900 tracking-wider">
                    {selectedSell.imei || 'To be verified at doorstep by executive'}
                  </p>
                  {selectedSell.imei_photo && (
                    <a
                      href={selectedSell.imei_photo}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-outline text-xs px-2.5 py-1 bg-white font-bold text-brand-700 flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" /> View *#06# Proof
                    </a>
                  )}
                </div>
              </div>

              {/* Multi-Angle Inspection Photos */}
              {selectedSell.device_photos && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-ink-500 mb-2 flex items-center gap-1.5">
                    <Camera className="h-3.5 w-3.5 text-brand-600" /> Uploaded Device Photos (32-Point Check)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { label: '1. Front (Screen ON)', img: selectedSell.device_photos.front },
                      { label: '2. Back Panel', img: selectedSell.device_photos.back },
                      { label: '3. Frame & Edges', img: selectedSell.device_photos.edges },
                      { label: '4. Bill & Box', img: selectedSell.device_photos.bill_box },
                    ].map((ph) => (
                      <div key={ph.label} className="rounded-2xl border border-ink-200 overflow-hidden bg-ink-50 p-1.5 text-center">
                        <p className="text-[10px] font-bold text-ink-700 mb-1 truncate">{ph.label}</p>
                        {ph.img ? (
                          <a href={ph.img} target="_blank" rel="noreferrer" className="block relative group">
                            <img src={ph.img} alt={ph.label} className="h-28 w-full object-cover rounded-xl group-hover:opacity-90" />
                            <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                              Zoom
                            </span>
                          </a>
                        ) : (
                          <div className="h-28 grid place-items-center bg-white rounded-xl text-ink-400 text-[10px]">
                            No photo
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Doorstep Pickup & Executive Assignment */}
              <div className="p-4 rounded-2xl bg-brand-50/50 border border-brand-100 space-y-3">
                <span className="text-xs font-bold text-brand-900 flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4 text-brand-600" /> Lucknow Doorstep Dispatch & Pickup Info
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-ink-500 font-medium">Pickup Locality Cluster:</p>
                    <p className="font-black text-ink-900 text-sm mt-0.5 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-brand-600" /> {selectedSell.pickup_area || 'Gomti Nagar, Lucknow'}
                    </p>
                    <p className="text-ink-500 font-medium mt-2">Full Address:</p>
                    <p className="font-bold text-ink-900 mt-0.5">{selectedSell.pickup_address || 'Lucknow'}</p>
                    <p className="text-ink-500 mt-1 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-ink-400" /> Slot: {selectedSell.pickup_slot} ({selectedSell.pickup_date})
                    </p>
                  </div>

                  <div>
                    <p className="text-ink-500 font-medium">Assigned Field Executive:</p>
                    <p className="font-black text-ink-900 text-sm mt-0.5">
                      {selectedSell.pickup_person_name || 'Auto-assigning executive...'}
                    </p>
                    {selectedSell.pickup_person_phone && (
                      <a
                        href={`tel:${selectedSell.pickup_person_phone}`}
                        className="text-brand-600 font-bold hover:underline flex items-center gap-1 mt-1"
                      >
                        <PhoneCall className="h-3.5 w-3.5" /> Call {selectedSell.pickup_person_phone}
                      </a>
                    )}

                    <div className="mt-3">
                      <label className="text-[10px] font-bold text-ink-500 uppercase">
                        Reassign Field Executive:
                      </label>
                      <select
                        onChange={(e) => onReassignAgent(selectedSell.id, e.target.value)}
                        defaultValue=""
                        className="input text-xs py-1 mt-1 bg-white"
                      >
                        <option value="" disabled>
                          Choose executive...
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
            </div>
          ) : (
            <div className="card p-12 text-center bg-white rounded-[28px] border border-[#dce5e8]">
              <BadgeIndianRupee className="h-12 w-12 text-ink-300 mx-auto" />
              <h3 className="font-display text-lg font-bold text-ink-900 mt-3">No Request Selected</h3>
              <p className="text-xs text-ink-500 mt-1">
                Click on any sell request on the left to view IMEI inspection details and approve payouts.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
