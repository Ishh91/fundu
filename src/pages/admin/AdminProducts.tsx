import React, { useState } from 'react';
import { Store, Search, Plus, Edit2, Trash2, Smartphone, Tag } from 'lucide-react';
import type { Product } from './adminTypes';
import { formatINR } from '../../lib/db';

type AdminProductsProps = {
  products: Product[];
  selectedProductId: string | null;
  onSelectProduct: (id: string) => void;
  onOpenProductModal: (product: Product | null) => void;
  onToggleApproval: (id: string, current: boolean) => void;
  onDeleteProduct: (id: string) => void;
};

export default function AdminProducts({
  products,
  selectedProductId,
  onSelectProduct,
  onOpenProductModal,
  onToggleApproval,
  onDeleteProduct,
}: AdminProductsProps) {
  const [search, setSearch] = useState('');

  const filteredProducts = products.filter((p) =>
    `${p.title} ${p.brand} ${p.model} ${p.offer_tag || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const selectedProduct = products.find((p) => p.id === selectedProductId) || filteredProducts[0] || null;

  return (
    <div className="space-y-6">
      <div className="card p-6 rounded-[28px] bg-gradient-to-r from-teal-500/10 via-brand-500/10 to-emerald-500/10 border border-teal-200/60 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-3 py-1 text-xs font-black text-teal-800">
            <Store className="h-3.5 w-3.5" /> Buy Store Catalog & Listings
          </div>
          <h2 className="mt-2 font-display text-2xl font-black text-ink-900">Refurbished Phones Inventory</h2>
          <p className="mt-1 text-xs text-ink-600">Stock levels, pricing, condition grades, offer tags, and marketplace approvals.</p>
        </div>

        <button
          onClick={() => onOpenProductModal(null)}
          className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 font-bold"
        >
          <Plus className="h-3.5 w-3.5" /> Add New Product
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Products List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="card p-3 rounded-2xl bg-white shadow-xs">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-ink-400 shrink-0 ml-1" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products by title, model..."
                className="w-full text-xs bg-transparent border-none focus:outline-none text-ink-900 font-medium"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto pr-1">
            {filteredProducts.length === 0 ? (
              <div className="card p-8 text-center bg-white">
                <Store className="h-8 w-8 text-ink-300 mx-auto" />
                <p className="text-xs font-bold text-ink-700 mt-2">No products found</p>
              </div>
            ) : (
              filteredProducts.map((p) => {
                const isSelected = selectedProduct?.id === p.id;
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
                    <div className="h-12 w-12 rounded-xl bg-ink-100 overflow-hidden shrink-0">
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Smartphone className="h-6 w-6 text-ink-400 m-3" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-xs text-ink-900 truncate">{p.title}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-ink-500 font-semibold">
                          {formatINR(p.price)} · Stock: {p.stock}
                        </span>
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
                  <button
                    onClick={() => onOpenProductModal(selectedProduct)}
                    className="btn-outline text-xs px-3 py-1.5 flex items-center gap-1 bg-white font-bold"
                  >
                    <Edit2 className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => onToggleApproval(selectedProduct.id, selectedProduct.is_approved)}
                    className={`btn text-xs px-3 py-1.5 font-bold rounded-xl ${
                      selectedProduct.is_approved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
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
                  <p className="font-black text-ink-900 text-sm mt-0.5">{selectedProduct.stock}</p>
                </div>
              </div>

              {selectedProduct.description && (
                <div className="p-4 rounded-2xl bg-ink-50 text-xs text-ink-700">
                  <p className="font-bold text-ink-900 mb-1">Product Description:</p>
                  <p className="leading-relaxed">{selectedProduct.description}</p>
                </div>
              )}

              {selectedProduct.images?.[0] && (
                <div className="rounded-2xl overflow-hidden border border-ink-200">
                  <img src={selectedProduct.images[0]} alt="" className="h-52 w-full object-cover" />
                </div>
              )}
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
