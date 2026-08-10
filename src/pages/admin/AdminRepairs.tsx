import React, { useState } from 'react';
import {
  Wrench,
  Search,
  MapPin,
  Clock,
  PhoneCall,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Truck,
  Sparkles,
} from 'lucide-react';
import type { RepairBooking, DeliveryAgent } from './adminTypes';
import { statusColors } from './adminTypes';
import { formatINR } from '../../lib/db';

type AdminRepairsProps = {
  repairs: RepairBooking[];
  selectedRepairId: string | null;
  onSelectRepair: (id: string) => void;
  agents: DeliveryAgent[];
  onUpdateStatus: (id: string, status: string) => void;
  onUpdateRepairCost?: (id: string, finalCost: number) => void;
  onReassignAgent?: (repairId: string, agentId: string) => void;
};

export default function AdminRepairs({
  repairs,
  selectedRepairId,
  onSelectRepair,
  agents,
  onUpdateStatus,
  onUpdateRepairCost,
  onReassignAgent,
}: AdminRepairsProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingCost, setEditingCost] = useState(false);
  const [costInput, setCostInput] = useState('');

  const filteredRepairs = repairs.filter((r) => {
    const matchesSearch = `${r.brand} ${r.model} ${r.tracking_id} ${r.problem} ${r.pickup_address || ''}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const selectedRepair = repairs.find((r) => r.id === selectedRepairId) || filteredRepairs[0] || null;

  const handleSaveCost = () => {
    if (!selectedRepair || !onUpdateRepairCost) return;
    const num = Number(costInput);
    if (!isNaN(num) && num > 0) {
      onUpdateRepairCost(selectedRepair.id, num);
      setEditingCost(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="card p-6 rounded-[28px] bg-gradient-to-r from-purple-500/10 via-brand-500/10 to-blue-500/10 border border-purple-200/60 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-black text-purple-800">
            <Wrench className="h-3.5 w-3.5" /> Doorstep Repair Operations · Lucknow
          </div>
          <h2 className="mt-2 font-display text-2xl font-black text-ink-900">
            Repair Diagnostics & Service Tracker
          </h2>
          <p className="mt-1 text-xs text-ink-600">
            Manage doorstep device collection, 32-point technician diagnosis, genuine part replacements, and return delivery across Lucknow.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-purple-200 shadow-xs text-center min-w-[110px]">
            <p className="text-[10px] font-bold uppercase text-ink-500">Total Bookings</p>
            <p className="font-display text-xl font-black text-ink-900">{repairs.length}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-purple-200 shadow-xs text-center min-w-[110px]">
            <p className="text-[10px] font-bold uppercase text-purple-700">In Workshop</p>
            <p className="font-display text-xl font-black text-purple-700">
              {repairs.filter((r) => r.status === 'diagnosing' || r.status === 'repairing').length}
            </p>
          </div>
        </div>
      </div>

      {/* Main Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Repair List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {/* Search & Filter */}
          <div className="card p-3 rounded-2xl bg-white shadow-xs space-y-2">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-ink-400 shrink-0 ml-1" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tracking ID, phone model, issue..."
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
                { id: 'pending', label: 'Booked' },
                { id: 'picked_up', label: 'Picked Up' },
                { id: 'diagnosing', label: 'Diagnosing' },
                { id: 'repairing', label: 'Repairing' },
                { id: 'repaired', label: 'Repaired' },
                { id: 'delivered', label: 'Delivered' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setStatusFilter(pill.id)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold shrink-0 transition ${
                    statusFilter === pill.id
                      ? 'bg-purple-600 text-white shadow-xs'
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
            {filteredRepairs.length === 0 ? (
              <div className="card p-8 text-center bg-white">
                <Wrench className="h-8 w-8 text-ink-300 mx-auto" />
                <p className="text-xs font-bold text-ink-700 mt-2">No repair bookings found</p>
                <p className="text-[11px] text-ink-400 mt-0.5">Try adjusting search or status filter</p>
              </div>
            ) : (
              filteredRepairs.map((r) => {
                const isSelected = selectedRepair?.id === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => onSelectRepair(r.id)}
                    className={`card p-4 rounded-2xl cursor-pointer transition-all ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/60 shadow-md ring-2 ring-purple-500/20'
                        : 'bg-white hover:border-purple-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-purple-700 font-extrabold text-xs">
                            {r.tracking_id}
                          </span>
                        </div>
                        <p className="font-bold text-sm text-ink-900 mt-0.5">
                          {r.brand} {r.model}
                        </p>
                        <p className="text-xs text-ink-500 font-medium line-clamp-1 mt-0.5">{r.problem}</p>
                      </div>
                      <span className={`badge text-[10px] ${statusColors[r.status] ?? 'bg-ink-100 text-ink-600'}`}>
                        {r.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs pt-2 border-t border-ink-100/60">
                      <span className="font-extrabold text-emerald-700">
                        {formatINR(r.final_cost || r.estimated_cost || 0)}
                      </span>
                      <span className="text-ink-400 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-purple-600" /> {r.pickup_address ? 'Lucknow' : 'Pickup'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Repair Details & Workflow (7 cols) */}
        <div className="lg:col-span-7 sticky top-6">
          {selectedRepair ? (
            <div className="card p-6 md:p-8 rounded-[28px] space-y-6 shadow-sm border border-[#dce5e8] bg-white">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-ink-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="badge bg-purple-50 text-purple-800 font-mono font-bold">
                      Tracking ID: {selectedRepair.tracking_id}
                    </span>
                    <span className="badge bg-ink-100 text-ink-700">{selectedRepair.brand}</span>
                  </div>
                  <h2 className="font-display text-2xl font-black text-ink-900 mt-1">
                    {selectedRepair.brand} {selectedRepair.model}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedRepair.status}
                    onChange={(e) => onUpdateStatus(selectedRepair.id, e.target.value)}
                    className="input text-xs py-1.5 px-3 bg-white font-bold"
                  >
                    {[
                      'pending',
                      'assigned',
                      'pickup_scheduled',
                      'picked_up',
                      'diagnosing',
                      'repairing',
                      'repaired',
                      'delivered',
                      'cancelled',
                    ].map((st) => (
                      <option key={st} value={st}>
                        {st.replace('_', ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Problem Diagnosis Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-ink-50 p-4 rounded-2xl text-xs">
                <div>
                  <p className="text-ink-500 font-medium">Reported Problem / Issue:</p>
                  <p className="font-bold text-ink-900 text-sm mt-0.5">{selectedRepair.problem}</p>
                </div>
                <div>
                  <p className="text-ink-500 font-medium">Estimated Diagnostic Quote:</p>
                  <p className="font-black text-emerald-700 text-sm mt-0.5">
                    {formatINR(selectedRepair.estimated_cost || 0)}
                  </p>
                </div>
                <div className="col-span-1 sm:col-span-2 pt-2 border-t border-ink-200/60 flex items-center justify-between">
                  <div>
                    <p className="text-ink-500 font-medium">Final Repair Cost / Invoice:</p>
                    <p className="font-black text-purple-700 text-base mt-0.5">
                      {selectedRepair.final_cost ? formatINR(selectedRepair.final_cost) : 'Pending final invoice'}
                    </p>
                  </div>
                  {onUpdateRepairCost && (
                    <div>
                      {editingCost ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            value={costInput}
                            onChange={(e) => setCostInput(e.target.value)}
                            placeholder="Amount ₹"
                            className="input text-xs py-1 w-28 bg-white"
                          />
                          <button onClick={handleSaveCost} className="btn-primary text-xs py-1 px-2.5 bg-purple-600">
                            Save
                          </button>
                          <button onClick={() => setEditingCost(false)} className="btn-outline text-xs py-1 px-2">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setCostInput(String(selectedRepair.final_cost || selectedRepair.estimated_cost || ''));
                            setEditingCost(true);
                          }}
                          className="btn-outline text-xs py-1 px-2.5 font-bold text-purple-700 bg-white"
                        >
                          Update Final Quotation
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Doorstep Pickup Address */}
              <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2 text-xs">
                <span className="font-bold text-purple-900 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-purple-600" /> Lucknow Doorstep Address & Slot
                </span>
                <p className="font-bold text-ink-900 mt-1">{selectedRepair.pickup_address || 'Gomti Nagar, Lucknow'}</p>
                <div className="flex items-center gap-4 text-ink-500 mt-2">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-purple-600" /> Date: {selectedRepair.pickup_date || 'Scheduled'}
                  </span>
                  <span>Slot: {selectedRepair.pickup_slot || '10 AM - 1 PM'}</span>
                </div>
              </div>

              {/* Service Technician / Logistics Dispatch */}
              <div className="p-4 rounded-2xl bg-ink-50 border border-ink-200 space-y-3 text-xs">
                <span className="font-bold text-ink-900 flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4 text-brand-600" /> Assigned Service Agent / Rider
                </span>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-black text-ink-900 text-sm">
                      {selectedRepair.delivery_person_name || 'Auto-dispatching certified tech...'}
                    </p>
                    {selectedRepair.delivery_person_phone && (
                      <a
                        href={`tel:${selectedRepair.delivery_person_phone}`}
                        className="text-brand-600 font-bold hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <PhoneCall className="h-3 w-3" /> Call {selectedRepair.delivery_person_phone}
                      </a>
                    )}
                  </div>

                  {onReassignAgent && (
                    <div className="flex items-center gap-2">
                      <select
                        onChange={(e) => onReassignAgent(selectedRepair.id, e.target.value)}
                        defaultValue=""
                        className="input text-xs py-1 bg-white"
                      >
                        <option value="" disabled>
                          Reassign executive...
                        </option>
                        {agents.map((ag) => (
                          <option key={ag.id} value={ag.id}>
                            {ag.name} ({ag.status}) - {ag.current_orders_count} orders
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-12 text-center bg-white rounded-[28px] border border-[#dce5e8]">
              <Wrench className="h-12 w-12 text-ink-300 mx-auto" />
              <h3 className="font-display text-lg font-bold text-ink-900 mt-3">No Repair Booking Selected</h3>
              <p className="text-xs text-ink-500 mt-1">
                Click on any repair tracking entry on the left to review diagnostic problem details and service quotes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
