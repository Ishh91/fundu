import React, { useState } from 'react';
import { Wrench, Search, Plus, Edit2, Trash2, Tag, CheckCircle2 } from 'lucide-react';
import type { SparePart } from './adminTypes';
import { formatINR } from '../../lib/db';

type AdminSparePartsProps = {
  parts: SparePart[];
  selectedPartId: string | null;
  onSelectPart: (id: string) => void;
  onOpenPartModal: (part: SparePart | null) => void;
  onToggleApproval: (id: string, current: boolean) => void;
  onDeletePart: (id: string) => void;
};

export default function AdminSpareParts({
  parts,
  selectedPartId,
  onSelectPart,
  onOpenPartModal,
  onToggleApproval,
  onDeletePart,
}: AdminSparePartsProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = ['All', 'Screen / Display', 'Battery', 'Camera Module', 'Charging Port', 'Motherboard', 'Back Glass', 'Speaker / Mic'];

  const filteredParts = parts.filter((p) => {
    const matchesSearch = `${p.title} ${p.brand} ${p.model} ${p.category}`.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const selectedPart = parts.find((p) => p.id === selectedPartId) || filteredParts[0] || null;

  return (
    <div className="space-y-6">
      <div className="card p-6 rounded-[28px] bg-gradient-to-r from-cyan-500/10 via-brand-500/10 to-blue-500/10 border border-cyan-200/60 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-100 px-3 py-1 text-xs font-black text-cyan-800">
            <Wrench className="h-3.5 w-3.5" /> OEM & Genuine Smartphone Components
          </div>
          <h2 className="mt-2 font-display text-2xl font-black text-ink-900">Spare Parts Inventory & Wholesalers</h2>
          <p className="mt-1 text-xs text-ink-600">Displays, batteries, camera sensors, charging ICs, and technician stock.</p>
        </div>

        <button
          onClick={() => onOpenPartModal(null)}
          className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 font-bold"
        >
          <Plus className="h-3.5 w-3.5" /> Add Spare Part
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Parts List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="card p-3 rounded-2xl bg-white shadow-xs space-y-2">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-ink-400 shrink-0 ml-1" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search parts by title, model..."
                className="w-full text-xs bg-transparent border-none focus:outline-none text-ink-900 font-medium"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide py-1 border-t border-ink-100/60">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold shrink-0 transition ${
                    categoryFilter.toLowerCase() === cat.toLowerCase()
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-ink-50 text-ink-600 hover:bg-ink-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
            {filteredParts.length === 0 ? (
              <div className="card p-8 text-center bg-white">
                <Wrench className="h-8 w-8 text-ink-300 mx-auto" />
                <p className="text-xs font-bold text-ink-700 mt-2">No spare parts match</p>
              </div>
            ) : (
              filteredParts.map((sp) => {
                const isSelected = selectedPart?.id === sp.id;
                return (
                  <div
                    key={sp.id}
                    onClick={() => onSelectPart(sp.id)}
                    className={`card p-4 rounded-2xl cursor-pointer transition-all ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/60 shadow-md ring-2 ring-brand-500/20'
                        : 'bg-white hover:border-brand-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-sm text-ink-900">{sp.title}</p>
                      <span
                        className={`badge text-[10px] font-bold ${
                          sp.is_approved ? 'bg-nature-50 text-nature-700' : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {sp.is_approved ? 'Live' : 'Pending Approval'}
                      </span>
                    </div>
                    <p className="text-xs text-ink-500 mt-1">
                      {sp.brand} {sp.model} · {sp.category} · Stock: {sp.stock}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-xs pt-2 border-t border-ink-100/60">
                      <span className="font-extrabold text-brand-700">{formatINR(sp.price)}</span>
                      <span className="text-ink-400 font-mono text-[11px]">₹{sp.price}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Part Details */}
        <div className="lg:col-span-7 sticky top-6">
          {selectedPart ? (
            <div className="card p-6 md:p-8 rounded-[28px] space-y-6 shadow-sm border border-[#dce5e8] bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-ink-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="badge bg-brand-50 text-brand-700">{selectedPart.brand}</span>
                    <span className="badge bg-ink-100 text-ink-700">{selectedPart.category}</span>
                  </div>
                  <h2 className="font-display text-2xl font-black text-ink-900 mt-1">{selectedPart.title}</h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenPartModal(selectedPart)}
                    className="btn-outline text-xs px-3 py-1.5 flex items-center gap-1 bg-white font-bold"
                  >
                    <Edit2 className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => onToggleApproval(selectedPart.id, selectedPart.is_approved)}
                    className={`btn text-xs px-3 py-1.5 font-bold rounded-xl ${
                      selectedPart.is_approved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {selectedPart.is_approved ? 'Approved' : 'Approve'}
                  </button>
                  <button
                    onClick={() => onDeletePart(selectedPart.id)}
                    className="btn-outline text-xs px-2.5 py-1.5 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-ink-50 p-4 rounded-2xl text-xs">
                <div>
                  <p className="text-ink-500 font-medium">Wholesale Price</p>
                  <p className="font-black text-brand-700 text-base mt-0.5">{formatINR(selectedPart.price)}</p>
                </div>
                <div>
                  <p className="text-ink-500 font-medium">Stock Units</p>
                  <p className="font-black text-ink-900 text-base mt-0.5">{selectedPart.stock}</p>
                </div>
                <div>
                  <p className="text-ink-500 font-medium">Target Smartphone Model</p>
                  <p className="font-bold text-ink-900 mt-0.5">{selectedPart.model}</p>
                </div>
              </div>

              {selectedPart.description && (
                <div className="p-4 rounded-2xl bg-ink-50 text-xs text-ink-700">
                  <p className="font-bold text-ink-900 mb-1">Specifications & Warranty:</p>
                  <p className="leading-relaxed">{selectedPart.description}</p>
                </div>
              )}

              {selectedPart.images?.[0] && (
                <div className="rounded-2xl overflow-hidden border border-ink-200">
                  <img src={selectedPart.images[0]} alt="" className="h-52 w-full object-cover" />
                </div>
              )}
            </div>
          ) : (
            <div className="card p-12 text-center bg-white rounded-[28px] border border-[#dce5e8]">
              <Wrench className="h-12 w-12 text-ink-300 mx-auto" />
              <h3 className="font-display text-lg font-bold text-ink-900 mt-3">No Spare Part Selected</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
