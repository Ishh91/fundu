import React, { useState } from 'react';
import { Store, Search, Plus, Edit2, Trash2, Smartphone, Laptop, Tag, ExternalLink, ShieldCheck, CheckCircle2, Cpu, Monitor, BatteryCharging, Star } from 'lucide-react';
import type { Product } from './adminTypes';
import { formatINR } from '../../lib/db';
import { getCleanPhoneImage } from '../../lib/phoneImages';

type AdminProductsProps = {
  products: Product[];
  selectedProductId: string | null;
  onSelectProduct: (id: string) => void;
  onOpenProductModal: (product: Product | null, initialCategory?: 'smartphone' | 'laptop') => void;
  onToggleApproval: (id: string, current: boolean) => void;
  onToggleFeatured?: (id: string, current: boolean) => void;
  onDeleteProduct: (id: string) => void;
};

export default function AdminProducts({
  products,
  selectedProductId,
  onSelectProduct,
  onOpenProductModal,
  onToggleApproval,
  onToggleFeatured,
  onDeleteProduct,
}: AdminProductsProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'smartphone' | 'laptop'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'featured' | 'live' | 'hidden' | 'out_of_stock'>('all');

  const smartphoneCount = products.filter((p) => p.category !== 'laptop').length;
  const laptopCount = products.filter((p) => p.category === 'laptop').length;
  const featuredCount = products.filter((p) => p.is_featured).length;
  const liveCount = products.filter((p) => p.is_approved).length;
  const hiddenCount = products.filter((p) => !p.is_approved).length;
  const outOfStockCount = products.filter((p) => (p.stock ?? 0) <= 0).length;

  const filteredProducts = products.filter((p) => {
    if (categoryFilter === 'smartphone' && p.category === 'laptop') return false;
    if (categoryFilter === 'laptop' && p.category !== 'laptop') return false;

    const matchesSearch = `${p.title} ${p.brand} ${p.model} ${p.processor || ''} ${p.offer_tag || ''}`.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (statusFilter === 'featured') return !!p.is_featured;
    if (statusFilter === 'live') return p.is_approved;
    if (statusFilter === 'hidden') return !p.is_approved;
    if (statusFilter === 'out_of_stock') return (p.stock ?? 0) <= 0;
    return true;
  });

  const selectedProduct = products.find((p) => p.id === selectedProductId) || filteredProducts[0] || null;

  return (
    <div className="space-y-6">
      <div className="card p-6 rounded-[28px] bg-gradient-to-r from-slate-700/10 via-brand-500/10 to-[#344257]/10 border border-slate-200/60 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#F0F0F5] border border-[#C0C8D8] px-3 py-1 text-xs font-black text-[#344257]">
            <Store className="h-3.5 w-3.5" /> Buy Store Catalog & Listings
          </div>
          <h2 className="mt-2 font-display text-2xl font-black text-ink-900">Refurbished Devices Inventory</h2>
          <p className="mt-1 text-xs text-ink-600">Stock levels, pricing, condition grades, laptops & smartphones, and marketplace approvals.</p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/buy"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline text-xs px-3 py-2 flex items-center gap-1.5 bg-white hover:bg-gray-50 font-bold border-gray-300 shadow-xs transition"
          >
            <Smartphone className="h-3.5 w-3.5" /> Phones Store
          </a>
          <a
            href="/buy-laptop"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline text-xs px-3 py-2 flex items-center gap-1.5 bg-white hover:bg-blue-50 font-bold text-blue-700 border-blue-200 shadow-xs transition"
          >
            <Laptop className="h-3.5 w-3.5 text-blue-600" /> Laptops Store
          </a>
          <button
            onClick={() => onOpenProductModal(null, 'smartphone')}
            className="btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 font-extrabold shadow-md cursor-pointer transition text-white"
          >
            <Plus className="h-4 w-4" /> Add Phone
          </button>
          <button
            onClick={() => onOpenProductModal(null, 'laptop')}
            className="btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 font-extrabold shadow-md cursor-pointer transition text-white"
          >
            <Laptop className="h-4 w-4" /> Add Laptop
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Products List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="card p-3 rounded-2xl bg-white shadow-xs space-y-2.5">
            {/* Category Switcher Tab */}
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl text-[11px] font-black">
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                className={`flex-1 py-1 px-2 rounded-lg text-center transition cursor-pointer ${
                  categoryFilter === 'all' ? 'bg-white text-gray-900 shadow-xs font-black' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All ({products.length})
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('smartphone')}
                className={`flex-1 py-1 px-2 rounded-lg text-center transition cursor-pointer flex items-center justify-center gap-1 ${
                  categoryFilter === 'smartphone' ? 'bg-white text-blue-700 shadow-xs font-black' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Smartphone className="h-3 w-3" /> Phones ({smartphoneCount})
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('laptop')}
                className={`flex-1 py-1 px-2 rounded-lg text-center transition cursor-pointer flex items-center justify-center gap-1 ${
                  categoryFilter === 'laptop' ? 'bg-white text-indigo-700 shadow-xs font-black' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Laptop className="h-3 w-3" /> Laptops ({laptopCount})
              </button>
            </div>

            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <Search className="h-4 w-4 text-ink-400 shrink-0 ml-1" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products by title, model, processor..."
                className="w-full text-xs bg-transparent border-none focus:outline-none text-ink-900 font-medium"
              />
            </div>

            {/* Quick Status Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px] font-bold">
              {[
                { id: 'all', label: `All Status` },
                { id: 'featured', label: `⭐ Featured (${featuredCount})` },
                { id: 'live', label: `Live (${liveCount})` },
                { id: 'hidden', label: `Hidden (${hiddenCount})` },
                { id: 'out_of_stock', label: `No Stock (${outOfStockCount})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id as any)}
                  className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap cursor-pointer ${
                    statusFilter === tab.id
                      ? 'bg-[#344257] text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
            {filteredProducts.length === 0 ? (
              <div className="card p-8 text-center bg-white space-y-3">
                <Store className="h-8 w-8 text-ink-300 mx-auto" />
                <p className="text-xs font-bold text-ink-700">No products found</p>
                <button
                  type="button"
                  onClick={() => onOpenProductModal(null)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-sm transition mx-auto cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Add New Product to Stock
                </button>
              </div>
            ) : (
              filteredProducts.map((p) => {
                const isSelected = selectedProduct?.id === p.id;
                const isOutOfStock = (p.stock ?? 0) <= 0;
                return (
                  <div
                    key={p.id}
                    onClick={() => onSelectProduct(p.id)}
                    className={`card p-3 rounded-2xl cursor-pointer transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/60 shadow-md ring-2 ring-brand-500/20'
                        : 'bg-white hover:border-brand-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="h-12 w-12 rounded-xl bg-ink-100 overflow-hidden shrink-0 flex items-center justify-center p-1 bg-white border border-gray-100">
                      <img
                        src={getCleanPhoneImage(p.brand, p.model || p.title, p.images?.[0])}
                        alt=""
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <p className="font-bold text-xs text-ink-900 truncate">{p.title}</p>
                        <div className="flex items-center gap-1 shrink-0">
                          {p.is_featured && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                              ⭐ Featured
                            </span>
                          )}
                          <span
                            className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full shrink-0 ${
                              p.is_approved
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {p.is_approved ? 'Live' : 'Hidden'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-ink-500 font-semibold">
                          {formatINR(p.price)} · Stock: <strong className={isOutOfStock ? 'text-rose-600' : 'text-ink-900'}>{p.stock ?? 0}</strong>
                        </span>
                        {isOutOfStock && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-600 border border-rose-200">
                            Out of Stock
                          </span>
                        )}
                        {p.offer_tag && (
                          <span className="badge bg-amber-50 text-amber-800 text-[9px] py-0 px-1 font-bold">
                            {p.offer_tag}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Product Detail Pane */}
        <div className="lg:col-span-7 sticky top-6">
          {selectedProduct ? (
            <div className="card p-6 md:p-8 rounded-[28px] space-y-6 shadow-sm border border-[#dce5e8] bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-ink-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="badge bg-brand-50 text-brand-700">{selectedProduct.brand}</span>
                    <span className="badge bg-ink-100 text-ink-700">{selectedProduct.condition}</span>
                    {selectedProduct.offer_tag && (
                      <span className="badge bg-amber-50 text-amber-800 font-bold">{selectedProduct.offer_tag}</span>
                    )}
                  </div>
                  <h2 className="font-display text-2xl font-black text-ink-900 mt-1">{selectedProduct.title}</h2>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`/product/${selectedProduct.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline text-xs px-2.5 py-1.5 flex items-center gap-1 bg-white font-bold text-[#344257]"
                    title="View how customer sees this product"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> View Live
                  </a>
                  <button
                    onClick={() => onOpenProductModal(selectedProduct)}
                    className="btn-outline text-xs px-3 py-1.5 flex items-center gap-1 bg-white font-bold"
                  >
                    <Edit2 className="h-3.5 w-3.5" /> Edit
                  </button>
                  {onToggleFeatured && (
                    <button
                      type="button"
                      onClick={() => onToggleFeatured(selectedProduct.id, !!selectedProduct.is_featured)}
                      className={`btn text-xs px-3 py-1.5 font-bold rounded-xl flex items-center gap-1 cursor-pointer transition ${
                        selectedProduct.is_featured
                          ? 'bg-amber-400 text-amber-950 hover:bg-amber-300 shadow-xs'
                          : 'bg-gray-100 text-gray-700 hover:bg-amber-100 hover:text-amber-900 border border-gray-200'
                      }`}
                      title={selectedProduct.is_featured ? 'Click to remove from Home Featured' : 'Click to feature on Home top'}
                    >
                      <Star className={`h-3.5 w-3.5 ${selectedProduct.is_featured ? 'fill-amber-950 text-amber-950' : 'text-gray-500'}`} />
                      {selectedProduct.is_featured ? 'Featured on Home' : 'Feature on Home'}
                    </button>
                  )}
                  <button
                    onClick={() => onToggleApproval(selectedProduct.id, selectedProduct.is_approved)}
                    className={`btn text-xs px-3 py-1.5 font-bold rounded-xl cursor-pointer ${
                      selectedProduct.is_approved ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                    }`}
                  >
                    {selectedProduct.is_approved ? 'Approved (Live)' : 'Pending Review'}
                  </button>
                  <button
                    onClick={() => onDeleteProduct(selectedProduct.id)}
                    className="btn-outline text-xs px-2.5 py-1.5 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-ink-50 p-4 rounded-2xl text-xs">
                <div>
                  <p className="text-ink-500 font-medium">Selling Price</p>
                  <p className="font-black text-brand-700 text-base mt-0.5">{formatINR(selectedProduct.price)}</p>
                </div>
                <div>
                  <p className="text-ink-500 font-medium">Original MRP</p>
                  <p className="font-bold text-ink-500 line-through text-xs mt-0.5">
                    {selectedProduct.original_price ? formatINR(selectedProduct.original_price) : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-ink-500 font-medium">Discount</p>
                  <p className="font-bold text-emerald-700 text-xs mt-0.5">{selectedProduct.discount_percent}% OFF</p>
                </div>
                <div>
                  <p className="text-ink-500 font-medium">Units in Stock</p>
                  <p className={`font-black text-sm mt-0.5 ${(selectedProduct.stock ?? 0) <= 0 ? 'text-rose-600' : 'text-ink-900'}`}>
                    {selectedProduct.stock ?? 0}
                  </p>
                </div>
              </div>

              {/* Specs Snapshot */}
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-gray-700">
                {selectedProduct.category === 'laptop' && (
                  <span className="bg-indigo-50 text-indigo-800 px-3 py-1 rounded-xl border border-indigo-200 font-bold">
                    💻 Laptop
                  </span>
                )}
                {selectedProduct.processor && (
                  <span className="bg-blue-50 text-blue-800 px-3 py-1 rounded-xl border border-blue-200">
                    CPU: <strong>{selectedProduct.processor}</strong>
                  </span>
                )}
                {selectedProduct.graphics && (
                  <span className="bg-purple-50 text-purple-800 px-3 py-1 rounded-xl border border-purple-200">
                    GPU: <strong>{selectedProduct.graphics}</strong>
                  </span>
                )}
                {selectedProduct.screen_size && (
                  <span className="bg-cyan-50 text-cyan-800 px-3 py-1 rounded-xl border border-cyan-200">
                    Display: <strong>{selectedProduct.screen_size}</strong>
                  </span>
                )}
                {selectedProduct.battery_health && (
                  <span className="bg-emerald-50 text-emerald-800 px-3 py-1 rounded-xl border border-emerald-200">
                    Battery: <strong>{selectedProduct.battery_health}</strong>
                  </span>
                )}
                {selectedProduct.ram && (
                  <span className="bg-gray-100 px-3 py-1 rounded-xl border border-gray-200">
                    RAM: <strong>{selectedProduct.ram}</strong>
                  </span>
                )}
                {selectedProduct.storage && (
                  <span className="bg-gray-100 px-3 py-1 rounded-xl border border-gray-200">
                    Storage: <strong>{selectedProduct.storage}</strong>
                  </span>
                )}
                {selectedProduct.color && (
                  <span className="bg-gray-100 px-3 py-1 rounded-xl border border-gray-200">
                    Color: <strong>{selectedProduct.color}</strong>
                  </span>
                )}
                {selectedProduct.warranty_months && (
                  <span className="bg-gray-100 px-3 py-1 rounded-xl border border-gray-200">
                    Warranty: <strong>{selectedProduct.warranty_months} Months</strong>
                  </span>
                )}
              </div>

              {selectedProduct.accessories_included && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                  <p className="font-bold text-slate-900 mb-0.5">📦 In The Box Accessories:</p>
                  <p>{selectedProduct.accessories_included}</p>
                </div>
              )}

              {selectedProduct.description && (
                <div className="p-4 rounded-2xl bg-ink-50 text-xs text-ink-700">
                  <p className="font-bold text-ink-900 mb-1">Product Description:</p>
                  <p className="leading-relaxed">{selectedProduct.description}</p>
                </div>
              )}

              <div className="rounded-2xl overflow-hidden border border-ink-200 bg-white p-4 flex items-center justify-center">
                <img
                  src={getCleanPhoneImage(selectedProduct.brand, selectedProduct.model || selectedProduct.title, selectedProduct.images?.[0])}
                  alt=""
                  className="h-52 w-auto object-contain"
                />
              </div>
            </div>
          ) : (
            <div className="card p-12 text-center bg-white rounded-[28px] border border-[#dce5e8]">
              <Store className="h-12 w-12 text-ink-300 mx-auto" />
              <h3 className="font-display text-lg font-bold text-ink-900 mt-3">No Product Selected</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
