import React, { useState } from 'react';
import {
  Smartphone,
  Search,
  ExternalLink,
  Plus,
  RefreshCw,
  Tag,
  X,
  Zap,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import type { MasterPhone, Product } from './adminTypes';
import { formatINR } from '../../lib/db';
import { searchMobileApiDev, importPhoneFromMobileApi } from '../../lib/mobileApi';

type AdminCatalogProps = {
  masterPhones: MasterPhone[];
  selectedPhoneId: string | null;
  onSelectPhone: (id: string) => void;
  products: Product[];
  onOpenListPhoneModal: (phone: MasterPhone) => void;
  onOpenCustomPhoneModal: () => void;
  onSyncAllToDb: () => void;
  syncingCatalog: boolean;
  onPhoneImported?: (phone: MasterPhone) => void;
};

export default function AdminCatalog({
  masterPhones,
  selectedPhoneId,
  onSelectPhone,
  products,
  onOpenListPhoneModal,
  onOpenCustomPhoneModal,
  onSyncAllToDb,
  syncingCatalog,
  onPhoneImported,
}: AdminCatalogProps) {
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('All');

  // MobileAPI.dev Live Search State
  const [mobileApiModalOpen, setMobileApiModalOpen] = useState(false);
  const [mobileApiQuery, setMobileApiQuery] = useState('');
  const [mobileApiBrand, setMobileApiBrand] = useState('All');
  const [mobileApiResults, setMobileApiResults] = useState<MasterPhone[]>([]);
  const [mobileApiLoading, setMobileApiLoading] = useState(false);
  const [importingPhoneId, setImportingPhoneId] = useState<string | null>(null);

  const filteredCatalog = masterPhones.filter((mp) => {
    const matchesBrand = brandFilter === 'All' || mp.brand.toLowerCase() === brandFilter.toLowerCase();
    const matchesSearch = `${mp.brand} ${mp.model} ${mp.release_year} ${mp.popular_tag || ''}`
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesBrand && matchesSearch;
  });

  const selectedPhone = masterPhones.find((p) => p.id === selectedPhoneId) || filteredCatalog[0] || null;

  const handleSearchMobileApi = async () => {
    if (!mobileApiQuery.trim() && mobileApiBrand === 'All') {
      alert('Please enter a phone model to search (e.g. Galaxy S24, iPhone 15, OnePlus 12)');
      return;
    }
    setMobileApiLoading(true);
    try {
      const results = await searchMobileApiDev(
        mobileApiQuery.trim(),
        mobileApiBrand === 'All' ? '' : mobileApiBrand
      );
      setMobileApiResults(results as MasterPhone[]);
      if (results.length === 0) {
        alert('No devices found for this query.');
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to search MobileAPI.dev');
    } finally {
      setMobileApiLoading(false);
    }
  };

  const handleImportMobileApiPhone = async (phone: MasterPhone) => {
    setImportingPhoneId(phone.id);
    try {
      const res = await importPhoneFromMobileApi(phone);
      const imported: MasterPhone = res.data || phone;
      if (onPhoneImported) {
        onPhoneImported(imported);
      }
      alert(`🎉 Successfully imported "${imported.brand} ${imported.model}" into Fundu database!`);
    } catch (err: any) {
      alert(err?.message || 'Failed to import phone');
    } finally {
      setImportingPhoneId(null);
    }
  };

  const allBrands = [
    'All',
    'Apple',
    'Samsung',
    'OnePlus',
    'Xiaomi',
    'Realme',
    'Vivo',
    'Oppo',
    'Google',
    'Nothing',
    'Motorola',
    'Poco',
    'iQOO',
    'Infinix',
    'Tecno',
    'Honor',
    'Lava',
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="card p-6 rounded-[28px] bg-gradient-to-r from-emerald-500/10 via-brand-500/10 to-teal-500/10 border border-emerald-200/60 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
            <Smartphone className="h-3.5 w-3.5" /> 31,500+ Live Device API & Indian Phone Database
          </div>
          <h2 className="mt-2 font-display text-2xl font-black text-ink-900">
            Master Phone Catalog & MobileAPI.dev Engine
          </h2>
          <p className="mt-1 text-xs text-ink-600">
            Official smartphone specifications, camera sensors, processors, batteries, and 1-click refurbished store listing.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setMobileApiModalOpen(true)}
            className="btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5 bg-nature-600 hover:bg-nature-700 font-bold shadow-xs"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Search MobileAPI.dev
          </button>
          <button
            onClick={onOpenCustomPhoneModal}
            className="btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 font-bold"
          >
            <Plus className="h-3.5 w-3.5" /> Add Model
          </button>
          <button
            onClick={onSyncAllToDb}
            disabled={syncingCatalog}
            className="btn-outline text-xs px-3 py-2 flex items-center gap-1.5 bg-white font-bold text-brand-700 border-brand-200 hover:bg-brand-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncingCatalog ? 'animate-spin text-brand-600' : ''}`} />
            {syncingCatalog ? 'Syncing...' : 'Bulk Sync DB'}
          </button>
        </div>
      </div>

      {/* Main Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Catalog List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {/* Search & Brand Filter */}
          <div className="card p-3 rounded-2xl bg-white shadow-xs space-y-2">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-ink-400 shrink-0 ml-1" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search phone (e.g. S24, iPhone 15, OnePlus)..."
                className="w-full text-xs bg-transparent border-none focus:outline-none text-ink-900 font-medium"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-xs text-ink-400 hover:text-ink-700">
                  Clear
                </button>
              )}
            </div>

            {/* Brand Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide py-1 border-t border-ink-100/60">
              {allBrands.map((b) => (
                <button
                  key={b}
                  onClick={() => setBrandFilter(b)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold shrink-0 transition ${
                    brandFilter.toLowerCase() === b.toLowerCase()
                      ? 'bg-brand-600 text-white shadow-xs ring-2 ring-brand-500/20'
                      : 'bg-ink-50 text-ink-600 hover:bg-ink-100'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* List Items */}
          <div className="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
            {filteredCatalog.length === 0 ? (
              <div className="card p-8 text-center bg-white">
                <Smartphone className="h-8 w-8 text-ink-300 mx-auto" />
                <p className="text-xs font-bold text-ink-700 mt-2">No phone models match</p>
                <button
                  onClick={() => {
                    setBrandFilter('All');
                    setSearch('');
                  }}
                  className="mt-2 text-xs text-brand-600 font-bold hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              filteredCatalog.map((mp) => {
                const isSelected = selectedPhone?.id === mp.id;
                const isAlreadyListed = products.some(
                  (p) => p.model.toLowerCase() === mp.model.toLowerCase()
                );

                return (
                  <div
                    key={mp.id}
                    onClick={() => onSelectPhone(mp.id)}
                    className={`card p-3.5 rounded-2xl cursor-pointer transition-all ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/60 shadow-md ring-2 ring-brand-500/20'
                        : 'bg-white hover:border-brand-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="font-bold text-sm text-ink-900">
                          {mp.brand} {mp.model}
                        </p>
                        <p className="text-xs text-ink-500">
                          {mp.release_year} · {mp.storage_options?.join(', ') || '128GB'}
                        </p>
                      </div>
                      {isAlreadyListed ? (
                        <span className="badge bg-nature-50 text-nature-700 text-[10px] font-bold">
                          ✓ In Store
                        </span>
                      ) : (
                        <span className="badge bg-brand-50 text-brand-700 text-[10px] font-bold">
                          Ready to List
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs pt-2 border-t border-ink-100/60">
                      <span className="font-extrabold text-emerald-700">
                        Resale: {formatINR(mp.base_resale_value)}
                      </span>
                      <span className="text-ink-400 font-mono text-[11px]">
                        MRP: {formatINR(mp.default_mrp)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Phone Specs & List To Store Pane (7 cols) */}
        <div className="lg:col-span-7 sticky top-6">
          {selectedPhone ? (
            <div className="card p-6 md:p-8 rounded-[28px] space-y-6 shadow-sm border border-[#dce5e8] bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-ink-100">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="badge bg-brand-50 text-brand-700">{selectedPhone.brand}</span>
                    <span className="badge bg-ink-100 text-ink-700">Launch {selectedPhone.release_year}</span>
                    {selectedPhone.is_5g && (
                      <span className="badge bg-emerald-50 text-emerald-700 font-bold">5G Verified</span>
                    )}
                  </div>
                  <h2 className="font-display text-2xl font-black text-ink-900 mt-1">
                    {selectedPhone.brand} {selectedPhone.model}
                  </h2>
                </div>

                <button
                  onClick={() => onOpenListPhoneModal(selectedPhone)}
                  className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 font-bold shadow-md shadow-brand-500/20"
                >
                  <Tag className="h-4 w-4" /> List to Buy Store
                </button>
              </div>

              {/* Price Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-ink-50 p-4 rounded-2xl">
                <div>
                  <p className="text-xs text-ink-500 font-medium">India Launch MRP</p>
                  <p className="font-bold text-ink-900 mt-0.5">{formatINR(selectedPhone.default_mrp)}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-500 font-medium">Base Resale Value</p>
                  <p className="font-black text-emerald-700 text-sm mt-0.5">
                    {formatINR(selectedPhone.base_resale_value)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-ink-500 font-medium">Storage Options</p>
                  <p className="font-bold text-ink-900 text-xs mt-0.5">
                    {selectedPhone.storage_options?.join(', ') || '128GB'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-ink-500 font-medium">Popular Tag</p>
                  <p className="font-bold text-brand-700 text-xs mt-0.5">
                    {selectedPhone.popular_tag || 'Standard'}
                  </p>
                </div>
              </div>

              {/* Hardware Specs Grid */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-500 mb-2">
                  Official Hardware Specifications
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 rounded-2xl bg-ink-50">
                    <p className="text-ink-400 font-bold text-[10px] uppercase">Processor</p>
                    <p className="font-bold text-ink-900 mt-0.5">
                      {selectedPhone.processor || 'High-performance Octa-core'}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-ink-50">
                    <p className="text-ink-400 font-bold text-[10px] uppercase">Camera Setup</p>
                    <p className="font-bold text-ink-900 mt-0.5">
                      {selectedPhone.camera_spec || '50MP High-Resolution Sensor'}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-ink-50">
                    <p className="text-ink-400 font-bold text-[10px] uppercase">Battery & Charging</p>
                    <p className="font-bold text-ink-900 mt-0.5">
                      {selectedPhone.battery_spec || '5000 mAh Fast Charging'}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-ink-50">
                    <p className="text-ink-400 font-bold text-[10px] uppercase">Display</p>
                    <p className="font-bold text-ink-900 mt-0.5">
                      {selectedPhone.display_spec || 'FHD+ High Refresh Rate'}
                    </p>
                  </div>
                </div>
              </div>

              {selectedPhone.image_url && (
                <div className="rounded-2xl overflow-hidden border border-ink-200">
                  <img src={selectedPhone.image_url} alt="" className="h-52 w-full object-cover" />
                </div>
              )}
            </div>
          ) : (
            <div className="card p-12 text-center bg-white rounded-[28px] border border-[#dce5e8]">
              <Smartphone className="h-12 w-12 text-ink-300 mx-auto" />
              <h3 className="font-display text-lg font-bold text-ink-900 mt-3">No Phone Selected</h3>
              <p className="text-xs text-ink-500 mt-1">Select a phone from the catalog on the left to inspect hardware.</p>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: LIVE SEARCH & 1-CLICK IMPORT FROM MOBILEAPI.DEV                    */}
      {/* ========================================================================= */}
      {mobileApiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4 overflow-y-auto">
          <div className="card w-full max-w-2xl p-6 my-4 space-y-4 max-h-[90vh] flex flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-ink-100 shrink-0">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-nature-100 text-nature-700">
                  <ExternalLink className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-ink-900">Search https://mobileapi.dev</h3>
                  <p className="text-[11px] text-ink-500">Live Device Database with Hardware Specs & Storage</p>
                </div>
              </div>
              <button onClick={() => setMobileApiModalOpen(false)} className="text-ink-400 hover:text-ink-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search Input Box */}
            <div className="flex gap-2 shrink-0">
              <select
                value={mobileApiBrand}
                onChange={(e) => setMobileApiBrand(e.target.value)}
                className="input text-xs w-36 font-semibold"
              >
                {allBrands.map((b) => (
                  <option key={b} value={b}>
                    {b === 'All' ? 'All Brands' : b}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={mobileApiQuery}
                onChange={(e) => setMobileApiQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchMobileApi()}
                placeholder="Type model (e.g. Galaxy S24, iPhone 16, Pixel 9, OnePlus 12)..."
                className="input text-xs flex-1"
              />
              <button
                onClick={handleSearchMobileApi}
                disabled={mobileApiLoading}
                className="btn-primary text-xs bg-nature-600 hover:bg-nature-700 px-4 font-bold flex items-center gap-1 shrink-0"
              >
                <Search className={`h-3.5 w-3.5 ${mobileApiLoading ? 'animate-spin' : ''}`} />
                {mobileApiLoading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {/* Results Area */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[250px]">
              {mobileApiResults.length === 0 && !mobileApiLoading && (
                <div className="text-center py-12 text-ink-400 text-xs">
                  <Smartphone className="h-10 w-10 mx-auto mb-2 opacity-30 text-nature-600" />
                  Search for any phone name to fetch full hardware specs live from https://mobileapi.dev
                </div>
              )}

              {mobileApiLoading && (
                <div className="text-center py-12 text-nature-700 text-xs font-semibold flex flex-col items-center gap-2">
                  <RefreshCw className="h-6 w-6 animate-spin text-nature-600" />
                  Fetching live specifications from https://mobileapi.dev...
                </div>
              )}

              {mobileApiResults.map((phone) => (
                <div
                  key={phone.id}
                  className="p-3.5 rounded-2xl border border-ink-100 bg-white hover:border-nature-300 hover:shadow-xs transition flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    {phone.image_url ? (
                      <img
                        src={phone.image_url}
                        alt=""
                        className="h-14 w-12 object-contain rounded-lg shrink-0 bg-ink-50 p-1"
                      />
                    ) : (
                      <div className="h-14 w-12 rounded-lg bg-nature-50 flex items-center justify-center text-nature-600 shrink-0">
                        <Smartphone className="h-5 w-5" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="badge bg-nature-50 text-nature-800 text-[10px] font-bold">
                          {phone.brand}
                        </span>
                        <span className="text-[11px] text-ink-400 font-medium">({phone.release_year})</span>
                        <span className="text-[9px] font-semibold bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded border border-emerald-200">
                          {phone.source === 'https://mobileapi.dev/' ? '⚡ MobileAPI.dev' : '✓ Verified Catalog'}
                        </span>
                      </div>

                      <h4 className="font-bold text-ink-900 text-xs mt-0.5">{phone.model}</h4>
                      <p className="text-[11px] text-ink-500 line-clamp-1 mt-0.5">
                        ⚡ {phone.processor} • 📸 {phone.camera_spec} • 🔋 {phone.battery_spec}
                      </p>
                      <div className="flex gap-1 mt-1">
                        {phone.storage_options?.map((st) => (
                          <span
                            key={st}
                            className="text-[9px] font-semibold bg-ink-100 text-ink-700 px-1.5 py-0.5 rounded"
                          >
                            {st}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleImportMobileApiPhone(phone)}
                    disabled={importingPhoneId === phone.id}
                    className="btn-primary text-xs bg-nature-600 hover:bg-nature-700 shrink-0 px-3 py-1.5 font-bold shadow-xs flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {importingPhoneId === phone.id ? 'Importing...' : '1-Click Import'}
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-ink-100 shrink-0">
              <span className="text-[11px] text-ink-400 font-medium">Powered by https://mobileapi.dev/ API</span>
              <button onClick={() => setMobileApiModalOpen(false)} className="btn-outline text-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
