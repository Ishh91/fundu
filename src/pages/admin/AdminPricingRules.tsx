import React, { useState } from 'react';
import {
  TrendingUp,
  Search,
  Plus,
  Zap,
  Edit2,
  Trash2,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import type { SellPriceConfig } from './adminTypes';
import { formatINR } from '../../lib/db';

type AdminPricingRulesProps = {
  configs: SellPriceConfig[];
  selectedPricingId: string | null;
  onSelectPricing: (id: string) => void;
  onOpenPricingModal: (config: SellPriceConfig | null) => void;
  onToggleActive: (id: string, current: boolean) => void;
  onDeleteConfig: (id: string) => void;
  onAutoGenerateRules: () => void;
  generatingRules: boolean;
};

export default function AdminPricingRules({
  configs,
  selectedPricingId,
  onSelectPricing,
  onOpenPricingModal,
  onToggleActive,
  onDeleteConfig,
  onAutoGenerateRules,
  generatingRules,
}: AdminPricingRulesProps) {
  const [search, setSearch] = useState('');

  const filteredConfigs = configs.filter((c) =>
    `${c.brand} ${c.model} ${c.storage || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const selectedConfig = configs.find((c) => c.id === selectedPricingId) || filteredConfigs[0] || null;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="card p-6 rounded-[28px] bg-gradient-to-r from-brand-500/10 via-emerald-500/10 to-teal-500/10 border border-brand-200/60 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-3 py-1 text-xs font-black text-brand-800">
            <TrendingUp className="h-3.5 w-3.5" /> Dynamic Buyback Valuation Algorithm
          </div>
          <h2 className="mt-2 font-display text-2xl font-black text-ink-900">
            Sell Pricing Engine & Multipliers
          </h2>
          <p className="mt-1 text-xs text-ink-600">
            Configure base resale values, condition degradation multipliers (Flawless, Good, Fair), and accessories bonuses.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onOpenPricingModal(null)}
            className="btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 font-bold"
          >
            <Plus className="h-3.5 w-3.5" /> Add Price Rule
          </button>
          <button
            onClick={onAutoGenerateRules}
            disabled={generatingRules}
            className="btn-outline text-xs px-3.5 py-2 flex items-center gap-1.5 bg-white font-bold text-emerald-700 border-emerald-300 hover:bg-emerald-50"
          >
            <Zap className={`h-3.5 w-3.5 ${generatingRules ? 'animate-spin text-emerald-600' : 'text-emerald-600'}`} />
            {generatingRules ? 'Generating...' : '⚡ Auto-Generate All Indian Rules'}
          </button>
        </div>
      </div>

      {/* Main Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Rules List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="card p-3 rounded-2xl bg-white shadow-xs">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-ink-400 shrink-0 ml-1" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search pricing rule (e.g. S24, iPhone 14)..."
                className="w-full text-xs bg-transparent border-none focus:outline-none text-ink-900 font-medium"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto pr-1">
            {filteredConfigs.length === 0 ? (
              <div className="card p-8 text-center bg-white">
                <TrendingUp className="h-8 w-8 text-ink-300 mx-auto" />
                <p className="text-xs font-bold text-ink-700 mt-2">No price rules match</p>
              </div>
            ) : (
              filteredConfigs.map((c) => {
                const isSelected = selectedConfig?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => onSelectPricing(c.id)}
                    className={`card p-4 rounded-2xl cursor-pointer transition-all ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/60 shadow-md ring-2 ring-brand-500/20'
                        : 'bg-white hover:border-brand-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm text-ink-900">
                          {c.brand} {c.model}
                        </p>
                        <p className="text-xs text-ink-500">{c.storage || 'All Storages'}</p>
                      </div>
                      <span
                        className={`badge text-[10px] font-bold ${
                          c.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-ink-100 text-ink-600'
                        }`}
                      >
                        {c.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs pt-2 border-t border-ink-100/60">
                      <span className="font-extrabold text-emerald-700">Base: {formatINR(c.base_price)}</span>
                      <span className="text-ink-400">
                        Exc: {Math.round(c.excellent_multiplier * 100)}% · Good: {Math.round(c.good_multiplier * 100)}%
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Rule Details & Calculator */}
        <div className="lg:col-span-7 sticky top-6">
          {selectedConfig ? (
            <div className="card p-6 md:p-8 rounded-[28px] space-y-6 shadow-sm border border-[#dce5e8] bg-white">
              <div className="flex items-center justify-between pb-4 border-b border-ink-100">
                <div>
                  <span className="badge bg-brand-50 text-brand-700">{selectedConfig.brand}</span>
                  <h2 className="font-display text-2xl font-black text-ink-900 mt-1">
                    {selectedConfig.brand} {selectedConfig.model}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenPricingModal(selectedConfig)}
                    className="btn-outline text-xs px-3 py-1.5 flex items-center gap-1 bg-white font-bold"
                  >
                    <Edit2 className="h-3.5 w-3.5" /> Edit Rule
                  </button>
                  <button
                    onClick={() => onToggleActive(selectedConfig.id, selectedConfig.is_active)}
                    className={`btn text-xs px-3 py-1.5 font-bold rounded-xl ${
                      selectedConfig.is_active ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {selectedConfig.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => onDeleteConfig(selectedConfig.id)}
                    className="btn-outline text-xs px-2.5 py-1.5 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Multiplier Table */}
              <div className="grid grid-cols-3 gap-3 text-center bg-ink-50 p-4 rounded-2xl">
                <div className="p-3 bg-white rounded-xl shadow-xs border border-ink-100">
                  <p className="text-[10px] font-bold text-ink-400 uppercase">Flawless (Superb)</p>
                  <p className="text-xl font-black text-emerald-700 mt-1">
                    {formatINR(Math.round(selectedConfig.base_price * selectedConfig.excellent_multiplier))}
                  </p>
                  <span className="text-[10px] text-ink-500 font-semibold">
                    {Math.round(selectedConfig.excellent_multiplier * 100)}% of Base
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl shadow-xs border border-ink-100">
                  <p className="text-[10px] font-bold text-ink-400 uppercase">Good Condition</p>
                  <p className="text-xl font-black text-brand-700 mt-1">
                    {formatINR(Math.round(selectedConfig.base_price * selectedConfig.good_multiplier))}
                  </p>
                  <span className="text-[10px] text-ink-500 font-semibold">
                    {Math.round(selectedConfig.good_multiplier * 100)}% of Base
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl shadow-xs border border-ink-100">
                  <p className="text-[10px] font-bold text-ink-400 uppercase">Fair Condition</p>
                  <p className="text-xl font-black text-amber-700 mt-1">
                    {formatINR(Math.round(selectedConfig.base_price * selectedConfig.fair_multiplier))}
                  </p>
                  <span className="text-[10px] text-ink-500 font-semibold">
                    {Math.round(selectedConfig.fair_multiplier * 100)}% of Base
                  </span>
                </div>
              </div>

              {/* Accessories Bonus */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="font-bold text-emerald-900">Original Box Bonus</p>
                    <p className="text-[11px] text-emerald-700">Added to final payout</p>
                  </div>
                  <span className="font-black text-emerald-800 text-sm">+{formatINR(selectedConfig.box_bonus)}</span>
                </div>
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="font-bold text-emerald-900">Original Charger Bonus</p>
                    <p className="text-[11px] text-emerald-700">Added to final payout</p>
                  </div>
                  <span className="font-black text-emerald-800 text-sm">+{formatINR(selectedConfig.charger_bonus)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-12 text-center bg-white rounded-[28px] border border-[#dce5e8]">
              <TrendingUp className="h-12 w-12 text-ink-300 mx-auto" />
              <h3 className="font-display text-lg font-bold text-ink-900 mt-3">No Pricing Rule Selected</h3>
              <p className="text-xs text-ink-500 mt-1">Select any price rule on the left to inspect payout multipliers.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
