import { useState, useEffect } from 'react';
import {
  BadgeIndianRupee,
  Search,
  Store,
  Shield,
  PhoneCall,
  MapPin,
  Camera,
  ExternalLink,
  Clock,
  UserCheck,
  Building2,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Edit3,
  AlertTriangle,
  RotateCcw,
  DollarSign,
  X,
} from 'lucide-react';
import type { SellRequest, DeliveryAgent, MasterPhone } from './adminTypes';
import { statusColors } from './adminTypes';
import { db, formatINR } from '../../lib/db';
import CustomerDetailsModal from '../../components/CustomerDetailsModal';

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
  const [customerModalData, setCustomerModalData] = useState<any>(null);
  const [vendors, setVendors] = useState<any[]>([]);
  const [overrideModal, setOverrideModal] = useState<{ open: boolean; sell: any; price: string }>({
    open: false,
    sell: null,
    price: '',
  });

  useEffect(() => {
    db.from('profiles')
      .select('*')
      .in('role', ['vendor', 'wholesaler'])
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setVendors(data);
      });
  }, []);

  const handleApproveVendorQuote = async (sell: any) => {
    const price = Number(sell.vendor_quote_price);
    if (!price || price <= 0) {
      alert('⚠️ Invalid quote price from vendor.');
      return;
    }
    const { error } = await db.from('sell_requests').update({
      vendor_quote_status: 'admin_approved',
      final_price: price,
      status: 'inspection_mismatch',
    }).eq('id', sell.id);

    if (error) {
      alert(`❌ Error approving quotation: ${error.message}`);
      return;
    }
    alert(`✅ Quotation of ${formatINR(price)} approved! Forwarded to customer dashboard.`);
    window.location.reload();
  };

  const handleRejectVendorQuote = async (sell: any) => {
    if (!window.confirm('Reject this quotation and reset lead status to pending?')) return;
    const { error } = await db.from('sell_requests').update({
      vendor_quote_status: 'admin_rejected',
      status: 'pending',
    }).eq('id', sell.id);

    if (error) {
      alert(`❌ Error rejecting quote: ${error.message}`);
      return;
    }
    alert('❌ Quotation rejected. You can now reassign this lead to another partner vendor.');
    window.location.reload();
  };

  const handleReassignVendor = async (sell: any, newVendorId: string) => {
    const newVendor = vendors.find((v) => v.id === newVendorId);
    const vendorName = newVendor ? (newVendor.business_name || newVendor.full_name) : null;
    const isDirect = !newVendorId || newVendorId === 'direct';

    const { error } = await db.from('sell_requests').update({
      assigned_vendor_id: isDirect ? null : newVendorId,
      assigned_vendor_name: isDirect ? null : vendorName,
      vendor_quote_price: null,
      vendor_quote_notes: null,
      vendor_quote_status: isDirect ? null : 'pending_inspection',
      forwarded_to_vendor: !isDirect,
      status: isDirect ? 'pending' : 'assigned_to_vendor',
    }).eq('id', sell.id);

    if (error) {
      alert(`❌ Reassignment error: ${error.message}`);
      return;
    }
    alert(isDirect ? '✅ Reassigned to Direct Fundu Platform!' : `✅ Reassigned to partner vendor ${vendorName}!`);
    window.location.reload();
  };

  const handleSavePriceOverride = async () => {
    if (!overrideModal.sell) return;
    const num = Number(overrideModal.price);
    if (!num || num <= 0) {
      alert('Please enter a valid price.');
      return;
    }
    const { error } = await db.from('sell_requests').update({
      vendor_quote_price: num,
      final_price: num,
      vendor_quote_status: 'admin_approved',
      status: 'inspection_mismatch',
    }).eq('id', overrideModal.sell.id);

    if (error) {
      alert(`❌ Error saving price override: ${error.message}`);
      return;
    }
    alert(`✅ Price overridden to ${formatINR(num)} and approved for customer!`);
    setOverrideModal({ open: false, sell: null, price: '' });
    window.location.reload();
  };

  const handleTransferToWholesale = async (sell: SellRequest) => {
    try {
      const cost = sell.final_price || sell.estimated_price || 15000;
      const wholesalePrice = Math.round(cost + 1200);
      const retailPrice = Math.round(cost + 4000);

      const { error } = await db.from('wholesale_inventories').insert({
        brand: sell.brand,
        model: sell.model,
        storage: sell.storage || '128 GB',
        condition: sell.condition || 'Grade A',
        wholesale_price: wholesalePrice,
        retail_price: retailPrice,
        stock: 1,
        imei: sell.imei || null,
        source_sell_request_id: sell.id,
        status: 'available',
      });

      if (error) throw error;
      alert(`🎉 Successfully transferred ${sell.brand} ${sell.model} to B2B Wholesale Inventory at ${formatINR(wholesalePrice)}!`);
    } catch (err: any) {
      alert(err?.message || 'Failed to transfer to wholesale inventory');
    }
  };

  const getWhatsAppLink = (sell: SellRequest) => {
    const phone = (sell as any).phone || (sell as any).contact_phone || '9839100000';
    const text = `Hi, this is Fundu regarding your sell request #${sell.id.slice(0, 8)} for ${sell.brand} ${sell.model}. Your pickup executive ${sell.pickup_person_name || 'is on the way'}. Guaranteed Spot Payout: ${formatINR(sell.estimated_price || 0)}.`;
    const cleanPhone = String(phone).replace(/\D/g, '');
    const fullPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    return `https://wa.me/${fullPhone}?text=${encodeURIComponent(text)}`;
  };

  const filteredSells = sells.filter((s) => {
    const matchesSearch = `${s.brand} ${s.model} ${s.pickup_address || ''} ${s.imei || ''} ${s.pickup_area || ''}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const selectedSell = sells.find((s) => s.id === selectedSellId) || filteredSells[0] || null;

  const getExecutiveTaskWhatsAppLink = (sell: SellRequest, agentPhone?: string) => {
    const rawPhone = (agentPhone || sell.pickup_person_phone || '9839122345').replace(/\D/g, '');
    const targetPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const text = `🚀 *NEW FUNDU PICKUP TASK ASSIGNED*\n\n` +
      `📋 *Request ID:* #${sell.id.slice(0, 8).toUpperCase()}\n` +
      `👤 *Customer Name:* ${(sell as any).full_name || (sell as any).customer_name || 'Customer'}\n` +
      `📞 *Customer Phone:* ${(sell as any).phone || (sell as any).customer_phone || (sell.payout_details ?? 'N/A')}\n` +
      `📍 *Pickup Address:* ${sell.pickup_address || 'Doorstep Service'}\n` +
      `🏙️ *Locality:* ${sell.pickup_area || 'Doorstep Service'}\n` +
      `⏰ *Pickup Slot:* ${sell.pickup_date || ''} (${sell.pickup_slot || ''})\n\n` +
      `📱 *DEVICE SPECIFICATIONS & QUOTATION:*\n` +
      `• *Device:* ${sell.brand} ${sell.model} (${sell.storage || '128GB'})\n` +
      `• *Declared Condition:* ${sell.condition}\n` +
      `• *Estimated Spot Payout:* ₹${(sell.estimated_price || 0).toLocaleString('en-IN')}\n` +
      `• *Payout Method:* ${sell.payout_method || 'UPI on spot inspection'}\n` +
      `• *IMEI:* ${sell.imei || 'Perform *#06# doorstep check'}\n` +
      `• *Accessories with Phone:* ${sell.accessories?.join(', ') || 'None'}\n\n` +
      `🔍 *Inspection Guidelines:* Verify display touch, battery health, cameras, and physical edges before processing spot payout at your doorstep.`;
    return `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="card p-6 rounded-[28px] bg-gradient-to-r from-amber-500/10 via-brand-500/10 to-emerald-500/10 border border-amber-200/60 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800">
            <BadgeIndianRupee className="h-3.5 w-3.5" /> Doorstep Mobile Buyback Management
          </div>
          <h2 className="mt-2 font-display text-2xl font-black text-ink-900">
            Sell Requests & Doorstep Pickups
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
                        <MapPin className="h-3 w-3 text-brand-600" /> {s.pickup_area || 'Doorstep Service'}
                      </span>
                    </div>

                    {s.imei && (
                      <div className="mt-1.5 flex items-center gap-1 text-[11px] text-emerald-700 font-mono font-semibold">
                        <Shield className="h-3 w-3" /> IMEI: {s.imei}
                      </div>
                    )}

                    {Boolean((s as any).assigned_vendor_name || (s as any).vendor_quote_status) && (
                      <div className="mt-2 pt-2 border-t border-ink-100/60 flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1 font-bold text-gray-700 truncate max-w-[160px]">
                          <Building2 className="h-3 w-3 text-purple-600 shrink-0" />
                          {(s as any).assigned_vendor_name || 'Partner Store'}
                        </span>
                        {(s as any).vendor_quote_status === 'quoted' && (
                          <span className="badge bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[9px] animate-pulse">
                            ⚡ Quoted: {formatINR((s as any).vendor_quote_price || 0)}
                          </span>
                        )}
                        {(s as any).vendor_quote_status === 'admin_approved' && (
                          <span className="badge bg-emerald-100 text-emerald-800 font-bold text-[9px]">
                            ✓ Approved
                          </span>
                        )}
                        {(s as any).vendor_quote_status === 'vendor_declined' && (
                          <span className="badge bg-red-100 text-red-800 font-bold text-[9px]">
                            ❌ Declined
                          </span>
                        )}
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
                    {['pending', 'assigned', 'pickup_scheduled', 'inspection_submitted', 'price_offered', 'picked_up', 'inspected', 'accepted', 'completed', 'rejected'].map((st) => (
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
                    <Store className="h-3.5 w-3.5" /> List in Store
                  </button>

                  <button
                    onClick={() => handleTransferToWholesale(selectedSell)}
                    className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5 bg-[#344257] hover:bg-[#2B3646] font-bold shadow-xs"
                  >
                    <Building2 className="h-3.5 w-3.5" /> Send to B2B Wholesale
                  </button>

                  <button
                    onClick={() => setCustomerModalData({ ...selectedSell, type: 'sell' })}
                    className="btn-outline text-xs px-3 py-1.5 text-[#344257] border-[#C0C8D8] hover:bg-[#F0F0F5] flex items-center gap-1.5 font-bold shadow-xs rounded-xl"
                  >
                    <UserCheck className="h-3.5 w-3.5 text-[#47576E]" /> Customer Details
                  </button>

                  <a
                    href={getWhatsAppLink(selectedSell)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn bg-[#25D366] text-white hover:bg-[#20bd5a] text-xs px-3 py-1.5 flex items-center gap-1.5 font-bold shadow-xs rounded-xl"
                  >
                    <MessageSquare className="h-3.5 w-3.5" /> WhatsApp Customer
                  </a>
                </div>
              </div>

              {/* Partner Store / Vendor Quotation & Verification Alert */}
              {Boolean((selectedSell as any).assigned_vendor_id || (selectedSell as any).vendor_quote_status) && (
                <div className={`p-4 rounded-2xl border transition-all ${
                  (selectedSell as any).vendor_quote_status === 'quoted'
                    ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/20'
                    : (selectedSell as any).vendor_quote_status === 'vendor_declined'
                    ? 'bg-red-50 border-red-300'
                    : 'bg-indigo-50/60 border-indigo-200'
                }`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="badge bg-purple-100 text-purple-900 font-extrabold text-[10px] uppercase flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          Partner: {(selectedSell as any).assigned_vendor_name || 'Assigned Store'}
                        </span>
                        {(selectedSell as any).vendor_quote_status === 'quoted' && (
                          <span className="badge bg-amber-500 text-white font-black text-[10px] animate-pulse">
                            ⚡ Quote Awaiting Verification
                          </span>
                        )}
                        {(selectedSell as any).vendor_quote_status === 'admin_approved' && (
                          <span className="badge bg-emerald-600 text-white font-bold text-[10px]">
                            ✓ Price Approved
                          </span>
                        )}
                        {(selectedSell as any).vendor_quote_status === 'vendor_declined' && (
                          <span className="badge bg-red-600 text-white font-bold text-[10px]">
                            ❌ Vendor Declined Lead
                          </span>
                        )}
                      </div>

                      {(selectedSell as any).vendor_quote_status === 'quoted' && (
                        <p className="font-extrabold text-gray-900 text-sm">
                          Vendor Quoted Valuation:{' '}
                          <span className="font-black text-xl text-emerald-800">
                            {formatINR((selectedSell as any).vendor_quote_price || 0)}
                          </span>
                          <span className="text-xs text-gray-500 font-medium ml-2">
                            (Original Est: {formatINR(selectedSell.estimated_price || 0)})
                          </span>
                        </p>
                      )}

                      {(selectedSell as any).vendor_quote_notes && (
                        <p className="text-xs text-gray-700 italic bg-white/70 px-2.5 py-1 rounded-lg border border-gray-200">
                          Vendor Remarks: "{(selectedSell as any).vendor_quote_notes}"
                        </p>
                      )}

                      {(selectedSell as any).vendor_quote_status === 'vendor_declined' && (
                        <p className="text-xs font-bold text-red-800">
                          Vendor declined to purchase this device. Please reassign to another vendor below.
                        </p>
                      )}
                    </div>

                    {/* Quick Verification Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      {(selectedSell as any).vendor_quote_status === 'quoted' && (
                        <>
                          <button
                            onClick={() => handleApproveVendorQuote(selectedSell)}
                            className="btn bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Approve Quote ({formatINR((selectedSell as any).vendor_quote_price || 0)})
                          </button>

                          <button
                            onClick={() => setOverrideModal({
                              open: true,
                              sell: selectedSell,
                              price: String((selectedSell as any).vendor_quote_price || selectedSell.estimated_price || ''),
                            })}
                            className="btn-outline bg-white hover:bg-ink-50 text-indigo-700 border-indigo-200 font-bold text-xs px-3 py-2 rounded-xl shadow-xs flex items-center gap-1"
                          >
                            <Edit3 className="h-3.5 w-3.5" /> Override Price
                          </button>

                          <button
                            onClick={() => handleRejectVendorQuote(selectedSell)}
                            className="btn-outline bg-white hover:bg-red-50 text-red-600 border-red-200 font-bold text-xs px-3 py-2 rounded-xl shadow-xs flex items-center gap-1"
                          >
                            <XCircle className="h-3.5 w-3.5" /> Reject
                          </button>
                        </>
                      )}

                      {/* Reassign Vendor Dropdown */}
                      <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-xl px-2 py-1 shadow-xs">
                        <RotateCcw className="h-3 w-3 text-gray-500 shrink-0" />
                        <select
                          value={(selectedSell as any).assigned_vendor_id || ''}
                          onChange={(e) => handleReassignVendor(selectedSell, e.target.value)}
                          className="bg-transparent text-xs font-bold text-gray-800 focus:outline-none cursor-pointer"
                        >
                          <option value="">Platform Direct (Unassigned)</option>
                          {vendors.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.business_name || v.full_name} ({v.phone || 'Store'})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Rider Inspection Approval Alert */}
              {selectedSell.status === 'inspection_submitted' && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="badge bg-amber-200 text-amber-900 font-bold text-[10px] uppercase">
                      🚨 Field Executive Doorstep Inspection Ready
                    </span>
                    <p className="font-bold text-amber-950 text-sm mt-1">
                      Rider has uploaded 4 live photos & verified IMEI. Proposed Spot Payout: <span className="font-black text-emerald-800">{formatINR(selectedSell.final_price || selectedSell.estimated_price || 0)}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onUpdateStatus(selectedSell.id, 'confirmed');
                        alert(`✅ Spot Payout of ${formatINR(selectedSell.final_price || selectedSell.estimated_price || 0)} approved for ${selectedSell.brand} ${selectedSell.model}!\nDelivery Executive portal has received live clearance.`);
                      }}
                      className="btn bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs"
                    >
                      ✅ Approve Spot Payout ({formatINR(selectedSell.final_price || selectedSell.estimated_price || 0)})
                    </button>
                  </div>
                </div>
              )}

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
                  <UserCheck className="h-4 w-4 text-brand-600" /> Doorstep Doorstep Dispatch & Pickup Info
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-ink-500 font-medium">Pickup Locality Cluster:</p>
                    <p className="font-black text-ink-900 text-sm mt-0.5 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-brand-600" /> {selectedSell.pickup_area || 'Gomti Nagar'}
                    </p>
                    <p className="text-ink-500 font-medium mt-2">Full Address:</p>
                    <p className="font-bold text-ink-900 mt-0.5">{selectedSell.pickup_address || 'Doorstep Service'}</p>
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

                    <a
                      href={getExecutiveTaskWhatsAppLink(selectedSell)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 btn bg-[#25D366] text-white hover:bg-[#20bd5a] text-xs px-3 py-2 flex items-center justify-center gap-1.5 font-bold shadow-xs rounded-xl w-full"
                    >
                      <MessageSquare className="h-3.5 w-3.5" /> Send Job Briefing to Executive on WhatsApp
                    </a>
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

      {/* CUSTOMER FULL DETAILS MODAL */}
      <CustomerDetailsModal
        isOpen={Boolean(customerModalData)}
        onClose={() => setCustomerModalData(null)}
        customer={customerModalData}
      />

      {/* PRICE OVERRIDE MODAL */}
      {overrideModal.open && overrideModal.sell && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">Admin Price Override</h3>
                  <p className="text-xs text-gray-500">
                    {overrideModal.sell.brand} {overrideModal.sell.model} ({overrideModal.sell.storage || '128GB'})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOverrideModal({ open: false, sell: null, price: '' })}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-xl space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Original Estimate:</span>
                  <span className="font-bold text-gray-700">{formatINR(overrideModal.sell.estimated_price || 0)}</span>
                </div>
                {overrideModal.sell.vendor_quote_price && (
                  <div className="flex justify-between">
                    <span className="text-amber-700 font-bold">Vendor Quoted:</span>
                    <span className="font-extrabold text-amber-800">{formatINR(overrideModal.sell.vendor_quote_price)}</span>
                  </div>
                )}
                {overrideModal.sell.assigned_vendor_name && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Partner Store:</span>
                    <span className="font-semibold text-gray-800">{overrideModal.sell.assigned_vendor_name}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Verified Payout Amount (₹)
                </label>
                <input
                  type="number"
                  value={overrideModal.price}
                  onChange={(e) => setOverrideModal((prev) => ({ ...prev, price: e.target.value }))}
                  placeholder="e.g. 18500"
                  className="input w-full text-base font-black text-gray-900"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  This final amount will be locked and forwarded to the customer's portal for approval.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setOverrideModal({ open: false, sell: null, price: '' })}
                className="btn-outline text-xs px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePriceOverride}
                className="btn-primary text-xs px-4 py-2 bg-indigo-600 hover:bg-indigo-700"
              >
                Confirm & Approve Price
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
