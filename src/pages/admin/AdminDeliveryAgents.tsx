import React, { useState } from 'react';
import { Truck, Search, Plus, MapPin, PhoneCall, CheckCircle2 } from 'lucide-react';
import type { DeliveryAgent } from './adminTypes';

type AdminDeliveryAgentsProps = {
  agents: DeliveryAgent[];
  selectedAgentId: string | null;
  onSelectAgent: (id: string) => void;
  onOpenAgentModal: () => void;
  onToggleStatus: (agent: DeliveryAgent) => void;
};

export default function AdminDeliveryAgents({
  agents,
  selectedAgentId,
  onSelectAgent,
  onOpenAgentModal,
  onToggleStatus,
}: AdminDeliveryAgentsProps) {
  const [search, setSearch] = useState('');

  const filteredAgents = agents.filter((ag) =>
    `${ag.name} ${ag.phone} ${ag.current_locality || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const selectedAgent = agents.find((ag) => ag.id === selectedAgentId) || filteredAgents[0] || null;

  return (
    <div className="space-y-6">
      <div className="card p-6 rounded-[28px] bg-gradient-to-r from-emerald-500/10 via-brand-500/10 to-teal-500/10 border border-emerald-200/60 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
            <Truck className="h-3.5 w-3.5" /> Lucknow Doorstep Dispatch Fleet
          </div>
          <h2 className="mt-2 font-display text-2xl font-black text-ink-900">Delivery & Inspection Partners</h2>
          <p className="mt-1 text-xs text-ink-600">Assign orders, manage Lucknow delivery zones, vehicle fleet, and live workload.</p>
        </div>

        <button
          onClick={onOpenAgentModal}
          className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 font-bold"
        >
          <Plus className="h-3.5 w-3.5" /> Register Delivery Partner
        </button>
      </div>

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

          <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto pr-1">
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

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs">
                <p className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-emerald-600" /> Operational Lucknow Localities
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedAgent.zones?.map((zone) => (
                    <span key={zone} className="rounded-xl bg-white px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                      {zone}
                    </span>
                  ))}
                </div>
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
    </div>
  );
}
