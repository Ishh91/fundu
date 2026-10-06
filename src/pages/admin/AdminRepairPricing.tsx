import React, { useState } from 'react';
import {
  Wrench,
  Search,
  Plus,
  Zap,
  Edit2,
  Trash2,
  CheckCircle2,
  Smartphone,
  Laptop,
  Tablet,
  Watch,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  ExternalLink,
  X,
  AlertCircle,
  Save,
} from 'lucide-react';
import type { RepairPriceConfig, RepairProductType, RepairServiceItem } from '../../types';
import { formatINR } from '../../lib/db';
import {
  getServiceTemplatesForProduct,
  calculateSmartDefaultRepairServices,
} from '../../lib/repairPriceSync';
import { getCleanPhoneImage } from '../../lib/phoneImages';

type AdminRepairPricingProps = {
  configs: RepairPriceConfig[];
  selectedConfigId: string | null;
  onSelectConfig: (id: string) => void;
  onSaveConfig: (config: Partial<RepairPriceConfig>) => Promise<void>;
  onDeleteConfig: (id: string) => Promise<void>;
  onToggleActive: (id: string, current: boolean) => Promise<void>;
  onAutoGenerateSeed: () => Promise<void>;
  generating: boolean;
};

export default function AdminRepairPricing({
  configs,
  selectedConfigId,
  onSelectConfig,
  onSaveConfig,
  onDeleteConfig,
  onToggleActive,
  onAutoGenerateSeed,
  generating,
}: AdminRepairPricingProps) {
  const [search, setSearch] = useState('');
  const [productTypeFilter, setProductTypeFilter] = useState<string>('all');
  const [brandFilter, setBrandFilter] = useState<string>('All');

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<RepairPriceConfig | null>(null);
  const [modalForm, setModalForm] = useState<{
    id?: string;
    product_type: RepairProductType;
    brand: string;
    model: string;
    device_series: string;
    image_url: string;
    base_repair_price: number;
    services: RepairServiceItem[];
    is_active: boolean;
  }>({
    product_type: 'smartphone',
    brand: 'Apple',
    model: '',
    device_series: '',
    image_url: '',
    base_repair_price: 499,
    services: [],
    is_active: true,
  });

  const [saving, setSaving] = useState(false);

  // Filtered List
  const filteredConfigs = configs.filter((c) => {
    const matchesProduct = productTypeFilter === 'all' || (c.product_type || 'smartphone') === productTypeFilter;
    const matchesBrand = brandFilter === 'All' || c.brand.toLowerCase() === brandFilter.toLowerCase();
    const query = search.toLowerCase().trim();
    const matchesSearch =
      !query ||
      `${c.brand} ${c.model} ${c.device_series || ''}`.toLowerCase().includes(query);

    return matchesProduct && matchesBrand && matchesSearch;
  });

  const selectedConfig =
    configs.find((c) => c.id === selectedConfigId) || filteredConfigs[0] || null;

  // Extract unique brands from current configs
  const availableBrands = Array.from(
    new Set(configs.map((c) => c.brand).filter(Boolean))
  ).sort();

  // Open Modal to Add
  const handleOpenAdd = () => {
    const defaultServices = calculateSmartDefaultRepairServices('Apple', 'iPhone 15', 'smartphone');
    setEditingConfig(null);
    setModalForm({
      product_type: 'smartphone',
      brand: 'Apple',
      model: '',
      device_series: '',
      image_url: '',
      base_repair_price: 499,
      services: defaultServices,
      is_active: true,
    });
    setModalOpen(true);
  };

  // Open Modal to Edit
  const handleOpenEdit = (cfg: RepairPriceConfig) => {
    setEditingConfig(cfg);
    setModalForm({
      id: cfg.id,
      product_type: cfg.product_type || 'smartphone',
      brand: cfg.brand,
      model: cfg.model,
      device_series: cfg.device_series || '',
      image_url: cfg.image_url || '',
      base_repair_price: cfg.base_repair_price || 499,
      services: cfg.services && cfg.services.length > 0
        ? JSON.parse(JSON.stringify(cfg.services))
        : calculateSmartDefaultRepairServices(cfg.brand, cfg.model, cfg.product_type),
      is_active: cfg.is_active !== false,
    });
    setModalOpen(true);
  };

  // When Product Type or Model changes in modal, allow regenerating default services
  const handleProductTypeChangeInModal = (pt: RepairProductType) => {
    const templates = getServiceTemplatesForProduct(pt);
    const newServices: RepairServiceItem[] = templates.map((tmpl) => ({
      service_id: tmpl.id,
      name: tmpl.name,
      price: pt === 'laptop' ? 2499 : 1499,
      original_price: pt === 'laptop' ? 2999 : 1899,
      warranty: tmpl.defaultWarranty,
      turnaround_time: tmpl.defaultTime,
      is_available: true,
    }));

    setModalForm((prev) => ({
      ...prev,
      product_type: pt,
      services: newServices,
    }));
  };

  const handleUpdateServicePriceInModal = (idx: number, field: string, val: any) => {
    setModalForm((prev) => {
      const nextServices = [...prev.services];
      nextServices[idx] = {
        ...nextServices[idx],
        [field]: val,
      };
      return { ...prev, services: nextServices };
    });
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalForm.brand.trim() || !modalForm.model.trim()) {
      alert('Brand and Model are required.');
      return;
    }

    setSaving(true);
    try {
      await onSaveConfig({
        id: modalForm.id,
        product_type: modalForm.product_type,
        brand: modalForm.brand.trim(),
        model: modalForm.model.trim(),
        device_series: modalForm.device_series.trim() || null,
        image_url: modalForm.image_url.trim() || null,
        base_repair_price: Number(modalForm.base_repair_price) || 499,
        services: modalForm.services,
        is_active: modalForm.is_active,
      });
      setModalOpen(false);
    } catch (err: any) {
      alert(err?.message || 'Failed to save repair price config');
    } finally {
      setSaving(false);
    }
  };

  // Quick Inline Service Price Editor for Selected Device
  const [inlinePriceEdits, setInlinePriceEdits] = useState<Record<string, number>>({});
  const [savingInline, setSavingInline] = useState(false);

  const handleInlinePriceChange = (serviceId: string, val: number) => {
    setInlinePriceEdits((prev) => ({ ...prev, [serviceId]: val }));
  };

  const handleSaveInlineChanges = async () => {
    if (!selectedConfig) return;
    setSavingInline(true);
    try {
      const updatedServices = (selectedConfig.services || []).map((s) => {
        const edited = inlinePriceEdits[s.service_id];
        return edited !== undefined ? { ...s, price: Number(edited) } : s;
      });

      const validPrices = updatedServices.map((s) => Number(s.price) || 0).filter((p) => p > 0);
      const newBasePrice = validPrices.length > 0 ? Math.min(...validPrices) : (selectedConfig.base_repair_price || 499);

      await onSaveConfig({
        id: selectedConfig.id,
        services: updatedServices,
        base_repair_price: newBasePrice,
      });
      setInlinePriceEdits({});
      alert('✅ Repair service rates saved successfully!');
    } catch (err: any) {
      alert(err?.message || 'Failed to update rates');
    } finally {
      setSavingInline(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* TOP BANNER */}
      <div className="card p-6 md:p-8 rounded-[28px] bg-gradient-to-r from-slate-900 via-[#1E2734] to-[#344257] text-white shadow-xl border border-slate-700/60 flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-black text-emerald-300 border border-emerald-500/30">
            <Wrench className="h-3.5 w-3.5" /> Model-Wise Repair Price Catalog
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-black text-white">
            Repair Pricing Engine & Multi-Product Catalog
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Configure exact repair prices per device model (Screen, Battery, Charging Port, Camera, Motherboard) across Smartphones, Laptops, Tablets, and Smartwatches.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleOpenAdd}
            className="btn-primary text-xs px-4 py-2.5 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-md transition"
          >
            <Plus className="h-4 w-4" /> Add Model Price
          </button>
          <button
            type="button"
            onClick={onAutoGenerateSeed}
            disabled={generating}
            className="btn-outline text-xs px-4 py-2.5 flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold rounded-xl shadow-sm transition"
          >
            <Zap className={`h-4 w-4 text-amber-400 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Seeding Catalog...' : '⚡ Auto-Generate All Indian Models'}
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="card p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Smartphones</p>
            <p className="font-display text-xl font-black text-slate-900">
              {configs.filter((c) => (c.product_type || 'smartphone') === 'smartphone').length}
            </p>
          </div>
        </div>

        <div className="card p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-purple-50 text-purple-700">
            <Laptop className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Laptops</p>
            <p className="font-display text-xl font-black text-slate-900">
              {configs.filter((c) => c.product_type === 'laptop').length}
            </p>
          </div>
        </div>

        <div className="card p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
            <Tablet className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Tablets & iPads</p>
            <p className="font-display text-xl font-black text-slate-900">
              {configs.filter((c) => c.product_type === 'tablet').length}
            </p>
          </div>
        </div>

        <div className="card p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-700">
            <Watch className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Smartwatches</p>
            <p className="font-display text-xl font-black text-slate-900">
              {configs.filter((c) => c.product_type === 'smartwatch').length}
            </p>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="card p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'all', label: 'All Products', icon: Layers },
            { id: 'smartphone', label: 'Smartphones', icon: Smartphone },
            { id: 'laptop', label: 'Laptops', icon: Laptop },
            { id: 'tablet', label: 'Tablets', icon: Tablet },
            { id: 'smartwatch', label: 'Watches', icon: Watch },
          ].map((cat) => {
            const Icon = cat.icon;
            const active = productTypeFilter === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setProductTypeFilter(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition ${
                  active
                    ? 'bg-[#344257] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5" /> {cat.label}
              </button>
            );
          })}
        </div>

        {/* Brand Dropdown & Search Bar */}
        <div className="flex items-center gap-2 flex-1 max-w-md">
          {availableBrands.length > 0 && (
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="text-xs font-bold rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-slate-700 focus:outline-none focus:border-[#344257]"
            >
              <option value="All">All Brands</option>
              {availableBrands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          )}

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search model (e.g. S24 Ultra, iPhone 15, MacBook)..."
              className="w-full text-xs font-medium pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-[#344257]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MASTER-DETAIL SPLIT VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: LIST OF MODELS */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
          {filteredConfigs.length === 0 ? (
            <div className="card p-10 text-center bg-white border border-slate-200 rounded-2xl">
              <Wrench className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="font-display font-black text-sm text-slate-800 mt-3">
                No configured models found
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Click "⚡ Auto-Generate All Indian Models" to populate instant market rates.
              </p>
            </div>
          ) : (
            filteredConfigs.map((cfg) => {
              const isSelected = selectedConfig?.id === cfg.id;
              const screenService = cfg.services?.find((s) => s.service_id === 'screen');
              const batteryService = cfg.services?.find((s) => s.service_id === 'battery');

              return (
                <div
                  key={cfg.id}
                  onClick={() => onSelectConfig(cfg.id)}
                  className={`card p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'border-[#344257] bg-white shadow-md ring-2 ring-[#344257]/20'
                      : 'border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 shrink-0 rounded-xl bg-slate-50 border border-slate-100 p-1 flex items-center justify-center">
                      <img
                        src={getCleanPhoneImage(cfg.brand, cfg.model, cfg.image_url || undefined)}
                        alt={cfg.model}
                        className="max-h-full max-w-full object-contain mix-blend-multiply"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="badge bg-slate-100 text-slate-700 text-[10px] font-black px-1.5 py-0.5 rounded">
                          {cfg.brand}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          {cfg.product_type || 'phone'}
                        </span>
                        {!cfg.is_active && (
                          <span className="badge bg-red-50 text-red-700 text-[9px] font-bold">
                            Inactive
                          </span>
                        )}
                      </div>
                      <h4 className="font-display font-black text-xs sm:text-sm text-slate-900 truncate mt-0.5">
                        {cfg.model}
                      </h4>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] font-bold text-slate-500">
                        {screenService && (
                          <span>Screen: <strong className="text-slate-900">{formatINR(screenService.price)}</strong></span>
                        )}
                        {batteryService && (
                          <span>· Battery: <strong className="text-slate-900">{formatINR(batteryService.price)}</strong></span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(cfg);
                        }}
                        className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-[#344257] hover:text-white transition"
                        title="Edit Full Rates"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete repair price config for ${cfg.brand} ${cfg.model}?`)) {
                            onDeleteConfig(cfg.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT COLUMN: DETAIL VIEW & SERVICE PRICING TABLE */}
        <div className="lg:col-span-7">
          {selectedConfig ? (
            <div className="card p-6 md:p-7 rounded-[28px] bg-white border border-slate-200/90 shadow-sm space-y-6">
              {/* Device Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 shrink-0 rounded-2xl bg-slate-50 border border-slate-100 p-2 flex items-center justify-center shadow-xs">
                    <img
                      src={getCleanPhoneImage(selectedConfig.brand, selectedConfig.model, selectedConfig.image_url || undefined)}
                      alt={selectedConfig.model}
                      className="max-h-full max-w-full object-contain mix-blend-multiply"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="badge bg-[#344257] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                        {selectedConfig.brand}
                      </span>
                      <span className="badge bg-slate-100 text-slate-700 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                        {selectedConfig.product_type || 'smartphone'}
                      </span>
                      {selectedConfig.device_series && (
                        <span className="text-[11px] font-bold text-slate-400">
                          {selectedConfig.device_series}
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-xl font-black text-slate-900 mt-1">
                      {selectedConfig.model}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => onToggleActive(selectedConfig.id, selectedConfig.is_active)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      selectedConfig.is_active
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {selectedConfig.is_active ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(selectedConfig)}
                    className="btn-outline text-xs px-3.5 py-1.5 flex items-center gap-1.5 font-bold"
                  >
                    <Edit2 className="h-3.5 w-3.5" /> Edit Model
                  </button>
                </div>
              </div>

              {/* Service Pricing Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-black text-sm text-slate-900 flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-[#344257]" /> Itemized Service Pricing ({selectedConfig.services?.length || 0} Services)
                  </h4>
                  {Object.keys(inlinePriceEdits).length > 0 && (
                    <button
                      type="button"
                      onClick={handleSaveInlineChanges}
                      disabled={savingInline}
                      className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 font-bold"
                    >
                      <Save className="h-3.5 w-3.5" />
                      {savingInline ? 'Saving...' : 'Save Price Changes'}
                    </button>
                  )}
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Repair Service</th>
                        <th className="py-2.5 px-3">Warranty</th>
                        <th className="py-2.5 px-3">Turnaround</th>
                        <th className="py-2.5 px-3 text-right">Price (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {(selectedConfig.services || []).map((srv) => {
                        const currentVal =
                          inlinePriceEdits[srv.service_id] !== undefined
                            ? inlinePriceEdits[srv.service_id]
                            : srv.price;

                        return (
                          <tr key={srv.service_id} className="hover:bg-slate-50/60 transition">
                            <td className="py-3 px-3">
                              <p className="font-bold text-slate-900">{srv.name}</p>
                              <p className="text-[10px] font-mono text-slate-400">{srv.service_id}</p>
                            </td>
                            <td className="py-3 px-3">
                              <span className="badge bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                                {srv.warranty || '6 Months Warranty'}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className="badge bg-purple-50 text-purple-800 text-[10px] font-bold">
                                {srv.turnaround_time || '30 Mins Doorstep'}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="inline-flex items-center gap-1">
                                <span className="text-slate-400 font-bold">₹</span>
                                <input
                                  type="number"
                                  value={currentVal}
                                  onChange={(e) =>
                                    handleInlinePriceChange(srv.service_id, Number(e.target.value))
                                  }
                                  className="w-24 text-right font-display font-black text-slate-900 text-xs py-1 px-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#344257] bg-white"
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-12 text-center bg-white border border-slate-200 rounded-[28px]">
              <Sparkles className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="font-display font-black text-sm text-slate-800 mt-3">
                Select a device from the left to view and modify repair prices
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: ADD / EDIT MODEL REPAIR PRICING */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-3xl rounded-[28px] bg-white p-6 md:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="border-b border-slate-100 pb-4">
              <span className="badge bg-emerald-50 text-emerald-800 text-xs font-black">
                {editingConfig ? 'Edit Model Rates' : 'Add New Model Price'}
              </span>
              <h3 className="font-display text-xl font-black text-slate-900 mt-1">
                {editingConfig
                  ? `Configure ${editingConfig.brand} ${editingConfig.model}`
                  : 'Add Device Repair Price Configuration'}
              </h3>
            </div>

            <form onSubmit={handleModalSubmit} className="mt-6 space-y-5">
              {/* Product Type & Brand Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="label">Product Category</label>
                  <select
                    value={modalForm.product_type}
                    onChange={(e) => handleProductTypeChangeInModal(e.target.value as RepairProductType)}
                    className="input mt-1"
                  >
                    <option value="smartphone">📱 Smartphone</option>
                    <option value="laptop">💻 Laptop</option>
                    <option value="tablet">📟 Tablet / iPad</option>
                    <option value="smartwatch">⌚ Smartwatch</option>
                    <option value="other">🔧 Other Device</option>
                  </select>
                </div>

                <div>
                  <label className="label">Brand *</label>
                  <input
                    type="text"
                    required
                    value={modalForm.brand}
                    onChange={(e) => setModalForm({ ...modalForm, brand: e.target.value })}
                    placeholder="e.g. Apple, Samsung, Dell, HP"
                    className="input mt-1"
                  />
                </div>

                <div>
                  <label className="label">Model Name *</label>
                  <input
                    type="text"
                    required
                    value={modalForm.model}
                    onChange={(e) => setModalForm({ ...modalForm, model: e.target.value })}
                    placeholder="e.g. iPhone 15 Pro, S24 Ultra, XPS 13"
                    className="input mt-1"
                  />
                </div>
              </div>

              {/* Series & Image URL Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Device Series (Optional)</label>
                  <input
                    type="text"
                    value={modalForm.device_series}
                    onChange={(e) => setModalForm({ ...modalForm, device_series: e.target.value })}
                    placeholder="e.g. iPhone 15 Series, Galaxy S Series"
                    className="input mt-1"
                  />
                </div>

                <div>
                  <label className="label">Image URL (Optional)</label>
                  <input
                    type="url"
                    value={modalForm.image_url}
                    onChange={(e) => setModalForm({ ...modalForm, image_url: e.target.value })}
                    placeholder="https://..."
                    className="input mt-1"
                  />
                </div>
              </div>

              {/* Services List Configuration */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="label font-black text-slate-900">
                    Repair Services Pricing for this Model
                  </label>
                  <span className="text-[11px] font-bold text-slate-500">
                    {modalForm.services.length} Services Configured
                  </span>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {modalForm.services.map((srv, idx) => (
                    <div
                      key={srv.service_id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 truncate">{srv.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{srv.service_id}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-slate-500">Price ₹</span>
                          <input
                            type="number"
                            required
                            min={0}
                            value={srv.price}
                            onChange={(e) =>
                              handleUpdateServicePriceInModal(idx, 'price', Number(e.target.value))
                            }
                            className="w-24 text-right font-black input py-1 px-2"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status & Submit */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={modalForm.is_active}
                    onChange={(e) => setModalForm({ ...modalForm, is_active: e.target.checked })}
                    className="h-4 w-4 rounded text-[#344257] focus:ring-0"
                  />
                  <span>Active in Storefront Catalog</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="btn-outline text-xs px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary text-xs px-5 py-2 flex items-center gap-1.5 bg-[#344257] hover:bg-[#2B3646]"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {saving ? 'Saving...' : 'Save Model Configuration'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
