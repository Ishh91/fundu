import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  Edit2,
  RefreshCw,
  Layers,
  Wrench,
  Smartphone,
  ShieldAlert,
  X,
  Check,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';
import {
  fetchServiceablePincodes,
  addServiceablePincodes,
  updateServiceablePincode,
  deleteServiceablePincode,
  seedLucknowPincodes,
  type ServiceablePincodeItem,
} from '../../lib/pincodeService';

export default function AdminPincodes() {
  const [pincodes, setPincodes] = useState<ServiceablePincodeItem[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState<'all' | 'sell' | 'repair'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ServiceablePincodeItem | null>(null);

  // Single Add / Edit form
  const [form, setForm] = useState({
    pincode: '',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    locality: '',
    services: ['sell', 'repair'] as string[],
    is_active: true,
    notes: '',
  });

  // Bulk Add form
  const [bulkText, setBulkText] = useState('');
  const [bulkCity, setBulkCity] = useState('Lucknow');
  const [bulkState, setBulkState] = useState('Uttar Pradesh');
  const [bulkLocality, setBulkLocality] = useState('');
  const [bulkServices, setBulkServices] = useState<string[]>(['sell', 'repair']);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchServiceablePincodes(search, serviceFilter, statusFilter);
      setPincodes(res.data || []);
      setStats(res.stats || { total: 0, active: 0, inactive: 0 });
    } catch (err: any) {
      console.error('Failed to load pincodes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, serviceFilter, statusFilter]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setForm({
      pincode: '',
      city: 'Lucknow',
      state: 'Uttar Pradesh',
      locality: '',
      services: ['sell', 'repair'],
      is_active: true,
      notes: '',
    });
    setAddModalOpen(true);
  };

  const handleOpenEdit = (item: ServiceablePincodeItem) => {
    setEditingItem(item);
    setForm({
      pincode: item.pincode,
      city: item.city || 'Lucknow',
      state: item.state || 'Uttar Pradesh',
      locality: item.locality || '',
      services: item.services && item.services.length > 0 ? item.services : ['sell', 'repair'],
      is_active: item.is_active,
      notes: item.notes || '',
    });
    setAddModalOpen(true);
  };

  const handleToggleService = (svc: string) => {
    setForm((prev) => {
      const exists = prev.services.includes(svc);
      return {
        ...prev,
        services: exists ? prev.services.filter((s) => s !== svc) : [...prev.services, svc],
      };
    });
  };

  const handleSaveSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = form.pincode.replace(/\D/g, '').slice(0, 6);
    if (cleanPin.length !== 6) {
      alert('Please enter a valid 6-digit PIN code.');
      return;
    }

    try {
      setActionLoading(true);
      if (editingItem && (editingItem._id || editingItem.id)) {
        const id = editingItem._id || editingItem.id!;
        await updateServiceablePincode(id, {
          city: form.city,
          state: form.state,
          locality: form.locality,
          services: form.services,
          is_active: form.is_active,
          notes: form.notes,
        });
        showToast(`Updated pincode ${cleanPin} successfully.`);
      } else {
        await addServiceablePincodes({
          pincode: cleanPin,
          city: form.city,
          state: form.state,
          locality: form.locality,
          services: form.services,
          is_active: form.is_active,
          notes: form.notes,
        });
        showToast(`Added pincode ${cleanPin} to serviceable database.`);
      }
      setAddModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to save pincode.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    const extracted = bulkText.match(/\b\d{6}\b/g) || [];
    if (extracted.length === 0) {
      alert('Please enter or paste at least one valid 6-digit PIN code.');
      return;
    }

    try {
      setActionLoading(true);
      const res = await addServiceablePincodes({
        pincodes: bulkText,
        city: bulkCity,
        state: bulkState,
        locality: bulkLocality,
        services: bulkServices,
        is_active: true,
      });
      showToast(res.message || `Added ${extracted.length} pincodes successfully.`);
      setBulkModalOpen(false);
      setBulkText('');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to bulk-add pincodes.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (item: ServiceablePincodeItem) => {
    const id = item._id || item.id;
    if (!id) return;
    try {
      await updateServiceablePincode(id, { is_active: !item.is_active });
      setPincodes((prev) =>
        prev.map((p) => ((p._id || p.id) === id ? { ...p, is_active: !p.is_active } : p))
      );
      setStats((prev) => ({
        ...prev,
        active: item.is_active ? prev.active - 1 : prev.active + 1,
        inactive: item.is_active ? prev.inactive + 1 : prev.inactive - 1,
      }));
      showToast(`Pincode ${item.pincode} ${!item.is_active ? 'Activated' : 'Paused'}.`);
    } catch (err: any) {
      alert('Failed to update status.');
    }
  };

  const handleDelete = async (item: ServiceablePincodeItem) => {
    const id = item._id || item.id;
    if (!id) return;
    if (!window.confirm(`Are you sure you want to remove Pincode ${item.pincode}?`)) return;

    try {
      await deleteServiceablePincode(id);
      setPincodes((prev) => prev.filter((p) => (p._id || p.id) !== id));
      setStats((prev) => ({
        total: prev.total - 1,
        active: item.is_active ? prev.active - 1 : prev.active,
        inactive: !item.is_active ? prev.inactive - 1 : prev.inactive,
      }));
      showToast(`Pincode ${item.pincode} deleted.`);
    } catch (err: any) {
      alert('Failed to delete pincode.');
    }
  };

  const handleSeedLucknow = async () => {
    if (!window.confirm('Reset and seed standard Lucknow hub pincodes (226001 - 226030)?')) return;
    try {
      setActionLoading(true);
      const res = await seedLucknowPincodes();
      showToast(res.message || 'Seeded 30 standard Lucknow pincodes.');
      await loadData();
    } catch (err: any) {
      alert('Failed to seed pincodes.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-[#344257] px-4 py-3 text-sm font-bold text-white shadow-xl animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Card */}
      <div className="card p-6 rounded-[28px] bg-gradient-to-r from-slate-900 via-[#344257] to-slate-800 text-white shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-xs font-black text-emerald-300">
            <MapPin className="h-3.5 w-3.5 text-emerald-400" /> Active Doorstep Service Hubs
          </div>
          <h2 className="mt-2 font-display text-2xl font-black text-white tracking-tight">
            Serviceable Pincodes Manager
          </h2>
          <p className="mt-1 text-sm text-slate-300 max-w-2xl font-medium">
            Control exactly where customers can book Sell Mobile and Repair doorstep appointments. As you expand to new areas or cities, simply add their pincodes here.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSeedLucknow}
            disabled={actionLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-3.5 py-2 text-xs font-bold text-white transition cursor-pointer"
            title="Seed / Reset 30 standard Lucknow pincodes (226001 - 226030)"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-300" /> Seed Lucknow (30 PINs)
          </button>
          <button
            type="button"
            onClick={() => setBulkModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition cursor-pointer"
          >
            <Layers className="h-3.5 w-3.5" /> ⚡ Bulk Add
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-xs font-black text-slate-950 shadow-md transition cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Pincode
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-500">Total Configured</span>
          <p className="mt-1 font-display text-2xl font-black text-slate-900">{stats.total}</p>
          <span className="text-[11px] font-semibold text-slate-400">Postal codes registered</span>
        </div>
        <div className="card p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/60 shadow-sm">
          <span className="text-xs font-bold text-emerald-700">Active Serviceable</span>
          <p className="mt-1 font-display text-2xl font-black text-emerald-800">{stats.active}</p>
          <span className="text-[11px] font-semibold text-emerald-600">Currently accepting bookings</span>
        </div>
        <div className="card p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60 shadow-sm">
          <span className="text-xs font-bold text-amber-700">Inactive / Paused</span>
          <p className="mt-1 font-display text-2xl font-black text-amber-800">{stats.inactive}</p>
          <span className="text-[11px] font-semibold text-amber-600">Temporarily paused</span>
        </div>
        <div className="card p-4 rounded-2xl bg-blue-50/60 border border-blue-200/60 shadow-sm">
          <span className="text-xs font-bold text-blue-700">Doorstep Services</span>
          <p className="mt-1 font-display text-xl font-black text-blue-900 flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-brand-600" /> Sell & <Wrench className="h-4 w-4 text-purple-600" /> Repair
          </p>
          <span className="text-[11px] font-semibold text-blue-600">Auto-verified at booking</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="card p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Pincode, locality, city..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#344257] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Service Filter */}
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value as any)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Services (Sell & Repair)</option>
            <option value="sell">Sell Mobile Only</option>
            <option value="repair">Repair Only</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          <button
            type="button"
            onClick={loadData}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
            title="Refresh Table"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-brand-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Pincodes Data Table */}
      <div className="card rounded-[24px] bg-white border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Pincode</th>
                <th className="py-3.5 px-4">Hub / City</th>
                <th className="py-3.5 px-4">Localities & Key Areas</th>
                <th className="py-3.5 px-4">Enabled Services</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-brand-500 mb-2" />
                    Loading serviceable pincodes...
                  </td>
                </tr>
              ) : pincodes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">
                    <MapPin className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                    No serviceable pincodes found matching filters.
                    <div className="mt-3">
                      <button
                        onClick={handleSeedLucknow}
                        className="btn-primary text-xs py-1.5 px-3 rounded-lg"
                      >
                        Seed Initial Lucknow Pincodes
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                pincodes.map((item) => (
                  <tr
                    key={item._id || item.id || item.pincode}
                    className="hover:bg-slate-50/60 transition group"
                  >
                    <td className="py-3 px-4 font-mono font-black text-sm text-slate-900">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
                        <MapPin className="h-3 w-3 text-[#344257]" /> {item.pincode}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{item.city}</div>
                      <div className="text-[11px] text-slate-400">{item.state}</div>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-medium text-slate-700 truncate" title={item.locality}>
                        {item.locality || 'Full city zone coverage'}
                      </p>
                      {item.notes && (
                        <p className="text-[10px] text-slate-400 italic truncate">{item.notes}</p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {(!item.services || item.services.includes('sell')) && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[10px]">
                            <Smartphone className="h-2.5 w-2.5" /> Sell
                          </span>
                        )}
                        {(!item.services || item.services.includes('repair')) && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-purple-800 font-bold text-[10px]">
                            <Wrench className="h-2.5 w-2.5" /> Repair
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(item)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black transition cursor-pointer ${
                          item.is_active
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {item.is_active ? (
                          <>
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" /> Active
                          </>
                        ) : (
                          <>
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" /> Paused
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1 opacity-80 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Single Pincode Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#344257]" />
                <h3 className="font-display text-lg font-black text-slate-900">
                  {editingItem ? 'Edit Serviceable Pincode' : 'Add New Serviceable Pincode'}
                </h3>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSingle} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1">6-Digit Pincode *</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={form.pincode}
                  disabled={Boolean(editingItem)}
                  onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, '') })}
                  placeholder="e.g. 226010"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono font-bold text-slate-900 focus:border-[#344257] focus:outline-none disabled:bg-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Hub City</label>
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="e.g. Lucknow"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 focus:border-[#344257] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    placeholder="e.g. Uttar Pradesh"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 focus:border-[#344257] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Localities / Sectors Covered</label>
                <input
                  type="text"
                  value={form.locality}
                  onChange={(e) => setForm({ ...form, locality: e.target.value })}
                  placeholder="e.g. Gomti Nagar, Vibhuti Khand, Patrakar Puram"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 focus:border-[#344257] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1.5">Enabled Doorstep Services</label>
                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.services.includes('sell')}
                      onChange={() => handleToggleService('sell')}
                      className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-slate-800 font-bold">Sell Mobile Pickup</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.services.includes('repair')}
                      onChange={() => handleToggleService('repair')}
                      className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-slate-800 font-bold">Phone Repair</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="inline-flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-slate-800 font-bold">Pincode Active (Accept bookings)</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-[#344257] hover:bg-[#253243] text-white font-black shadow-md cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : editingItem ? 'Save Changes' : 'Add Pincode'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Add Pincodes Modal */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-indigo-600" />
                <h3 className="font-display text-lg font-black text-slate-900">
                  ⚡ Bulk Add Serviceable Pincodes
                </h3>
              </div>
              <button
                onClick={() => setBulkModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBulk} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1">
                  Paste Pincodes (Comma, space, or newline separated) *
                </label>
                <textarea
                  rows={4}
                  required
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder="e.g.&#10;226001, 226002, 226003&#10;226010 226016 226022"
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs font-mono font-bold text-slate-900 focus:border-indigo-600 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">
                  System will automatically extract and deduplicate all valid 6-digit numbers.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={bulkCity}
                    onChange={(e) => setBulkCity(e.target.value)}
                    placeholder="e.g. Lucknow"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={bulkState}
                    onChange={(e) => setBulkState(e.target.value)}
                    placeholder="e.g. Uttar Pradesh"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Default Localities / Notes</label>
                <input
                  type="text"
                  value={bulkLocality}
                  onChange={(e) => setBulkLocality(e.target.value)}
                  placeholder="e.g. Urban Doorstep Coverage"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setBulkModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black shadow-md cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'Configuring...' : 'Add All Pincodes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

