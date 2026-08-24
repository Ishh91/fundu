import { useState, useEffect } from 'react';
import {
  Building2,
  CreditCard,
  Plus,
  Search,
  PhoneCall,
  MapPin,
  X,
  MessageSquare,
  Truck,
  CheckCircle2,
  Share2,
  Mail,
  ExternalLink,
  Lock,
  Trash2,
} from 'lucide-react';
import type { Profile, WholesaleInventory, WholesaleOrder } from '../../types';
import { db, formatINR } from '../../lib/db';
import { statusColors } from './adminTypes';

export default function AdminWholesalers() {
  const [activeSubtab, setActiveSubtab] = useState<'vendors' | 'orders' | 'inventory'>('vendors');
  const [_loading, setLoading] = useState(true);

  // Data states
  const [vendors, setVendors] = useState<Profile[]>([]);
  const [orders, setOrders] = useState<WholesaleOrder[]>([]);
  const [inventory, setInventory] = useState<WholesaleInventory[]>([]);
  const [search, setSearch] = useState('');

  // Modals
  const [paymentModal, setPaymentModal] = useState<{ vendor: Profile } | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);

  const [limitModal, setLimitModal] = useState<{ vendor: Profile } | null>(null);
  const [newLimit, setNewLimit] = useState('');
  const [limitSubmitting, setLimitSubmitting] = useState(false);

  const [inventoryModal, setInventoryModal] = useState(false);
  const [invForm, setInvForm] = useState({
    brand: 'Apple',
    model: '',
    storage: '128 GB',
    condition: 'Grade A',
    wholesale_price: '',
    retail_price: '',
    stock: '1',
    imei: '',
  });

  // Add Wholesaler Modal State
  const [addVendorModal, setAddVendorModal] = useState(false);
  const [addVendorForm, setAddVendorForm] = useState({
    businessName: '',
    fullName: '',
    email: '',
    phone: '',
    password: 'Partner@123456',
    creditLimit: '200000',
    gstNumber: '',
  });
  const [addVendorSubmitting, setAddVendorSubmitting] = useState(false);

  // Share Credentials Modal State
  const [shareCredModal, setShareCredModal] = useState<{
    vendor: Partial<Profile>;
    password?: string;
  } | null>(null);

  const getWhatsAppShareLink = (vendor: Partial<Profile>, pass?: string) => {
    const rawPhone = (vendor.phone || '9839122345').replace(/\D/g, '');
    const targetPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const loginUrl = `${window.location.origin}/wholesaler-login`;
    const passwordText = pass || 'Partner@123456';

    const message = `🏢 *FUNDU LUCKNOW B2B WHOLESALER PORTAL*\n\n` +
      `Hi *${vendor.full_name || vendor.business_name || 'Partner'}* (*${vendor.business_name || 'Wholesale Partner'}*),\n` +
      `Your B2B Wholesaler Partner Account is active!\n\n` +
      `🌐 *Login Portal:* ${loginUrl}\n` +
      `📧 *Login Email:* ${vendor.email || vendor.phone}\n` +
      `🔑 *Secret Passcode:* ${passwordText}\n` +
      `💳 *Approved Khata Limit:* ${formatINR(vendor.credit_limit || 200000)}\n\n` +
      `Login to browse lot inventories, place B2B orders, and check Khata balance on Fundu Lucknow!`;

    return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
  };

  const getEmailShareLink = (vendor: Partial<Profile>, pass?: string) => {
    const loginUrl = `${window.location.origin}/wholesaler-login`;
    const passwordText = pass || 'Partner@123456';
    const emailTo = vendor.email || '';
    const subject = `Fundu Lucknow B2B Wholesaler Login Credentials`;
    const body = `Hi ${vendor.full_name || vendor.business_name || 'Wholesaler Partner'},\n\n` +
      `Your Fundu B2B Wholesaler Partner account has been activated.\n\n` +
      `Login Portal: ${loginUrl}\n` +
      `Email: ${vendor.email || vendor.phone}\n` +
      `Password: ${passwordText}\n` +
      `Approved Khata Limit: ${formatINR(vendor.credit_limit || 200000)}\n\n` +
      `Welcome to Fundu Lucknow Refurbished & Bulk Hardware Clearing!`;

    return `mailto:${emailTo}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleAddVendor = async () => {
    if (!addVendorForm.businessName || !addVendorForm.email || !addVendorForm.phone) {
      alert('Please fill business name, email and phone number.');
      return;
    }

    setAddVendorSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://fundu.onrender.com/api'}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: addVendorForm.email.trim(),
          password: addVendorForm.password || 'Partner@123456',
          fullName: addVendorForm.fullName || addVendorForm.businessName,
          phone: addVendorForm.phone.trim(),
          role: 'wholesaler',
          businessName: addVendorForm.businessName.trim(),
          creditLimit: Number(addVendorForm.creditLimit) || 200000,
          gstNumber: addVendorForm.gstNumber.trim() || null,
        }),
      });

      const json = await response.json();
      if (json.error) throw new Error(json.error.message || json.error);

      alert(`✅ Wholesaler Partner "${addVendorForm.businessName}" created successfully!`);
      const newVendor = json.data?.profile || {
        business_name: addVendorForm.businessName,
        full_name: addVendorForm.fullName,
        email: addVendorForm.email,
        phone: addVendorForm.phone,
        credit_limit: Number(addVendorForm.creditLimit) || 200000,
      };

      setAddVendorModal(false);
      setShareCredModal({ vendor: newVendor, password: addVendorForm.password || 'Partner@123456' });
      setAddVendorForm({
        businessName: '',
        fullName: '',
        email: '',
        phone: '',
        password: 'Partner@123456',
        creditLimit: '200000',
        gstNumber: '',
      });
      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create wholesaler account');
    } finally {
      setAddVendorSubmitting(false);
    }
  };

  const handleDeleteVendor = async (vendor: Profile) => {
    const name = vendor.business_name || vendor.full_name || 'this wholesaler partner';
    if (!window.confirm(`Are you sure you want to remove Wholesaler Partner "${name}"?\n\nThis will remove their B2B wholesaler account and portal access.`)) {
      return;
    }

    try {
      await db.from('profiles').delete().eq('id', vendor.id);
      await db.from('users').delete().eq('id', vendor.id);

      alert(`🗑️ Wholesaler Partner "${name}" removed successfully!`);
      setVendors((prev) => prev.filter((v) => v.id !== vendor.id));
    } catch (err) {
      console.error('Failed to delete wholesaler partner:', err);
      alert('Failed to remove wholesaler partner.');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vRes, oRes, iRes] = await Promise.all([
        db.from('profiles').select('*').eq('role', 'wholesaler').order('created_at', { ascending: false }),
        db.from('wholesale_orders').select('*').order('created_at', { ascending: false }),
        db.from('wholesale_inventories').select('*').order('created_at', { ascending: false }),
      ]);

      setVendors((vRes.data as Profile[]) ?? []);
      setOrders((oRes.data as WholesaleOrder[]) ?? []);
      setInventory((iRes.data as WholesaleInventory[]) ?? []);
    } catch (err) {
      console.warn('Error loading B2B admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Stats
  const totalCreditLimit = vendors.reduce((sum, v) => sum + (v.credit_limit || 0), 0);
  const totalOutstandingDue = vendors.reduce((sum, v) => sum + (v.outstanding_balance || 0), 0);
  const totalB2BVolume = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

  // Record Cash Repayment from Vendor
  const handleRecordRepayment = async () => {
    if (!paymentModal?.vendor || !paymentAmount) return;
    const amountNum = Number(paymentAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setPaymentSubmitting(true);
    try {
      const { error } = await db.from('vendor_ledgers').insert({
        vendor_id: paymentModal.vendor.id,
        vendor_name: paymentModal.vendor.business_name || paymentModal.vendor.full_name,
        type: 'cash_repayment',
        amount: amountNum,
        payment_mode: paymentMode,
        notes: paymentNotes || 'Cash received at Fundu Lucknow Hub',
        recorded_by: 'Admin',
      });

      if (error) throw error;

      alert(`Recorded cash repayment of ${formatINR(amountNum)} for ${paymentModal.vendor.business_name || paymentModal.vendor.full_name}. Khata balance updated!`);
      setPaymentModal(null);
      setPaymentAmount('');
      setPaymentNotes('');
      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to record repayment');
    } finally {
      setPaymentSubmitting(false);
    }
  };

  // Update Credit Limit for Vendor
  const handleUpdateLimit = async () => {
    if (!limitModal?.vendor || !newLimit) return;
    const limitNum = Number(newLimit);
    if (isNaN(limitNum) || limitNum < 0) {
      alert('Please enter a valid credit limit');
      return;
    }

    setLimitSubmitting(true);
    try {
      const { error } = await db.from('vendor_ledgers').insert({
        vendor_id: limitModal.vendor.id,
        vendor_name: limitModal.vendor.business_name || limitModal.vendor.full_name,
        type: 'credit_limit_set',
        amount: limitNum,
        balance_after: limitModal.vendor.outstanding_balance || 0,
        notes: `Credit limit updated to ${formatINR(limitNum)} by Admin`,
        recorded_by: 'Admin',
      });

      if (error) throw error;

      alert(`Credit limit set to ${formatINR(limitNum)} for ${limitModal.vendor.business_name || limitModal.vendor.full_name}`);
      setLimitModal(null);
      setNewLimit('');
      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update credit limit');
    } finally {
      setLimitSubmitting(false);
    }
  };

  // WhatsApp alert helper for Wholesaler
  const getWholesaleOrderWhatsAppAlert = (order: WholesaleOrder, status: string) => {
    const rawPhone = (order.vendor_phone || '9105783553').replace(/\D/g, '');
    const targetPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const text = `🎉 *FUNDU LUCKNOW B2B LOT ORDER UPDATE*\n\n` +
      `Hi *${order.vendor_name || 'Wholesale Partner'}*,\n` +
      `Your Wholesale Lot Order *#${order.id.slice(0, 8).toUpperCase()}* (Total: ₹${(order.total_amount || 0).toLocaleString('en-IN')}) is now marked as *${status.toUpperCase()}*.\n\n` +
      `📍 *Location:* Fundu Lucknow Central Hub (Hazratganj)\n` +
      `💳 *Payment:* ${order.payment_method === 'credit' ? 'Fundu Credit (Khata)' : 'Spot Cash'}\n\n` +
      `Check your B2B Wholesaler Portal for full lot invoice and Khata statement!`;
    return `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await db.from('wholesale_orders').update({ status }).eq('id', orderId);
      if (error) throw error;
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: status as any } : o)));

      const targetOrder = orders.find((o) => o.id === orderId);
      const vendorName = targetOrder?.vendor_name || targetOrder?.business_name || 'Wholesale Partner';

      alert(`🎉 Lot Order #${orderId.slice(0, 8).toUpperCase()} marked as "${status.toUpperCase()}"!\nWholesaler dashboard (${vendorName}) has been updated in real-time.`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  // Add Inventory to Wholesale
  const handleAddInventory = async () => {
    if (!invForm.model || !invForm.wholesale_price) {
      alert('Please fill model and wholesale price');
      return;
    }

    try {
      const { error } = await db.from('wholesale_inventories').insert({
        brand: invForm.brand,
        model: invForm.model,
        storage: invForm.storage,
        condition: invForm.condition,
        wholesale_price: Number(invForm.wholesale_price),
        retail_price: invForm.retail_price ? Number(invForm.retail_price) : null,
        stock: Number(invForm.stock) || 1,
        imei: invForm.imei || null,
        status: 'available',
      });

      if (error) throw error;
      alert('Procured phone lot added to Wholesale Catalog!');
      setInventoryModal(false);
      setInvForm({
        brand: 'Apple',
        model: '',
        storage: '128 GB',
        condition: 'Grade A',
        wholesale_price: '',
        retail_price: '',
        stock: '1',
        imei: '',
      });
      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add inventory');
    }
  };

  const filteredVendors = vendors.filter((v) =>
    `${v.business_name || ''} ${v.full_name || ''} ${v.phone || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Stat Cards */}
      <div className="card p-6 rounded-[28px] bg-gradient-to-r from-teal-500/10 via-brand-500/10 to-indigo-500/10 border border-teal-200/60 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-3 py-1 text-xs font-black text-teal-800">
            <Building2 className="h-3.5 w-3.5" /> B2B Wholesaler & Khata Credit Manager
          </div>
          <h2 className="mt-2 font-display text-2xl font-black text-ink-900">Lucknow Vendor Ledgers & Bulk Supply</h2>
          <p className="mt-1 text-xs text-ink-600">
            Control credit limits, record cash repayments, and dispatch used phone lots to Lucknow wholesale partners.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/90 p-3 rounded-2xl border border-blue-200 shadow-xs text-center min-w-[110px]">
            <p className="text-[10px] font-bold uppercase text-ink-500">Credit Extended</p>
            <p className="font-display text-lg font-black text-blue-800">{formatINR(totalCreditLimit)}</p>
          </div>
          <div className="bg-white/90 p-3 rounded-2xl border border-amber-200 shadow-xs text-center min-w-[110px]">
            <p className="text-[10px] font-bold uppercase text-ink-500">Total Outstanding</p>
            <p className="font-display text-lg font-black text-amber-700">{formatINR(totalOutstandingDue)}</p>
          </div>
          <div className="bg-white/90 p-3 rounded-2xl border border-emerald-200 shadow-xs text-center min-w-[110px]">
            <p className="text-[10px] font-bold uppercase text-emerald-700">Total B2B Volume</p>
            <p className="font-display text-lg font-black text-emerald-800">{formatINR(totalB2BVolume)}</p>
          </div>
        </div>
      </div>

      {/* Subtabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 pb-3">
        <div className="flex gap-2">
          {[
            { id: 'vendors', label: 'Wholesale Partners (Khata)', count: vendors.length },
            { id: 'orders', label: 'B2B Wholesale Orders', count: orders.length },
            { id: 'inventory', label: 'Procured Lots Catalog', count: inventory.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubtab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeSubtab === tab.id
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-white text-ink-600 hover:bg-ink-100 border border-ink-200/60'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {activeSubtab === 'inventory' && (
          <button onClick={() => setInventoryModal(true)} className="btn-primary text-xs flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> Add Phone Lot to B2B
          </button>
        )}
      </div>

      {/* ── SUBTAB 1: VENDORS & KHATA LEDGER ── */}
      {activeSubtab === 'vendors' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="card p-3 rounded-2xl bg-white flex items-center gap-2 max-w-md shadow-xs flex-1">
              <Search className="h-4 w-4 text-ink-400 shrink-0 ml-1" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search partner by business name, mobile..."
                className="w-full text-xs bg-transparent border-none focus:outline-none text-ink-900 font-medium"
              />
            </div>
            <button
              onClick={() => setAddVendorModal(true)}
              className="btn-primary text-xs flex items-center justify-center gap-1.5 py-3 px-4 shadow-sm"
            >
              <Plus className="h-4 w-4" /> Add New Wholesaler Partner
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVendors.map((vendor) => {
              const due = vendor.outstanding_balance || 0;
              const limit = vendor.credit_limit || 200000;
              const available = Math.max(0, limit - due);

              return (
                <div key={vendor.id} className="card p-5 rounded-2xl bg-white shadow-xs border border-ink-100 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display text-base font-bold text-ink-900">
                        {vendor.business_name || vendor.full_name || 'Lucknow Partner'}
                      </h3>
                      <p className="text-xs text-ink-500 flex items-center gap-1 mt-0.5">
                        <PhoneCall className="h-3 w-3 text-ink-400" /> {vendor.phone || 'No phone'}
                      </p>
                    </div>
                    <span className="badge bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                      Verified Wholesaler
                    </span>
                  </div>

                  {/* Khata Balance Card */}
                  <div className="p-3 rounded-xl bg-ink-50 space-y-1.5 text-xs border border-ink-100/60">
                    <div className="flex justify-between">
                      <span className="text-ink-500">Credit Limit:</span>
                      <span className="font-bold text-ink-900">{formatINR(limit)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-700 font-semibold">Outstanding Due:</span>
                      <span className="font-black text-amber-800">{formatINR(due)}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-ink-200/60">
                      <span className="text-emerald-700 font-semibold">Available Credit:</span>
                      <span className="font-bold text-emerald-800">{formatINR(available)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => {
                        setPaymentModal({ vendor });
                        setPaymentAmount(String(due > 0 ? due : ''));
                      }}
                      className="btn-primary text-xs flex-1 py-2 flex items-center justify-center gap-1.5"
                    >
                      <CreditCard className="h-3.5 w-3.5" /> Record Cash
                    </button>
                    <button
                      onClick={() => {
                        setLimitModal({ vendor });
                        setNewLimit(String(limit));
                      }}
                      className="btn-outline text-xs px-3 py-2 text-ink-700"
                    >
                      Set Limit
                    </button>
                  </div>

                  {/* Share Credentials & Remove Wholesaler */}
                  <div className="pt-2 border-t border-ink-100 flex items-center justify-between text-[11px] gap-2">
                    <button
                      onClick={() => setShareCredModal({ vendor })}
                      className="inline-flex items-center gap-1 text-brand-600 font-bold hover:underline"
                    >
                      <Share2 className="h-3 w-3 text-brand-500" /> Share Credentials
                    </button>
                    <button
                      onClick={() => handleDeleteVendor(vendor)}
                      className="inline-flex items-center gap-1 text-rose-600 font-bold hover:bg-rose-50 px-2 py-1 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3 text-rose-500" /> Remove Partner
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredVendors.length === 0 && (
              <div className="col-span-full card p-12 text-center bg-white rounded-2xl text-ink-500 text-xs">
                No wholesalers found. As mobile shop vendors register with role='wholesaler', they will appear here.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SUBTAB 2: WHOLESALE ORDERS ── */}
      {activeSubtab === 'orders' && (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="card p-6 rounded-2xl bg-white shadow-xs border border-ink-100 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-ink-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="badge bg-brand-50 text-brand-700 font-bold">Lot Order #{o.id.slice(0, 8)}</span>
                    <span className={`badge capitalize text-[10px] font-bold ${statusColors[o.status] || 'bg-ink-100'}`}>
                      {o.status}
                    </span>
                  </div>
                  <p className="text-xs text-ink-500 mt-1">
                    Partner: <strong className="text-ink-900">{o.vendor_name}</strong> ({o.vendor_phone}) · Placed:{' '}
                    {new Date(o.created_at).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase text-ink-400">Order Amount</p>
                  <p className="font-display text-xl font-black text-brand-700">{formatINR(o.total_amount)}</p>
                  <span className="text-[11px] text-ink-500">
                    Payment: <strong>{o.payment_method === 'credit' ? 'Fundu Credit (Khata)' : 'Spot Cash'}</strong>
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {o.items?.map((it, idx) => (
                  <div key={idx} className="bg-ink-50 p-2.5 rounded-xl text-xs border border-ink-100 flex justify-between">
                    <div>
                      <p className="font-bold text-ink-900">{it.brand} {it.model}</p>
                      <p className="text-[10px] text-ink-500">{it.storage} · {it.condition}</p>
                    </div>
                    <span className="font-black text-brand-700">{formatINR(it.unit_price)}</span>
                  </div>
                ))}
              </div>

              {/* Status Update Buttons */}
              <div className="pt-3 border-t border-ink-100 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-ink-500 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> {o.delivery_address}
                </span>
                
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={getWholesaleOrderWhatsAppAlert(o, o.status)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn bg-[#25D366] text-white hover:bg-[#20bd5a] text-xs px-3 py-1.5 flex items-center gap-1 font-bold rounded-xl shadow-2xs"
                  >
                    <MessageSquare className="h-3.5 w-3.5" /> WhatsApp Partner
                  </a>

                  {['confirmed', 'dispatched', 'delivered'].map((st) => {
                    const isActive = o.status === st;
                    const activeColor =
                      st === 'delivered'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : st === 'dispatched'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-brand-600 text-white shadow-xs';

                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleUpdateOrderStatus(o.id, st)}
                        className={`text-xs px-3 py-1.5 rounded-xl font-bold capitalize transition ${
                          isActive ? activeColor : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
                        }`}
                      >
                        {isActive ? `✓ ${st}` : `Mark ${st}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}

          {orders.length === 0 && (
            <div className="card p-12 text-center bg-white rounded-2xl text-ink-500 text-xs">
              No wholesale orders placed yet.
            </div>
          )}
        </div>
      )}

      {/* ── SUBTAB 3: PROCURED INVENTORY CATALOG ── */}
      {activeSubtab === 'inventory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inventory.map((item) => (
            <div key={item.id} className="card p-5 rounded-2xl bg-white shadow-xs border border-ink-100 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="badge bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase">
                    {item.condition || 'Grade A'}
                  </span>
                  <h3 className="mt-1 font-display font-bold text-ink-900">{item.brand} {item.model}</h3>
                  <p className="text-xs text-ink-500">{item.storage || '128 GB'} · Stock: {item.stock}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase text-ink-400">Wholesale</p>
                  <p className="font-display text-lg font-black text-brand-700">{formatINR(item.wholesale_price)}</p>
                </div>
              </div>

              <div className="p-2 rounded-lg bg-ink-50 text-[11px] text-ink-600 flex justify-between font-mono">
                <span>IMEI: {item.imei || 'Verified'}</span>
                <span className="capitalize font-bold text-emerald-700">{item.status || 'Available'}</span>
              </div>
            </div>
          ))}

          {inventory.length === 0 && (
            <div className="col-span-full card p-12 text-center bg-white rounded-2xl text-ink-500 text-xs">
              No inventory in wholesale catalog. Click "Add Phone Lot to B2B" to create your first listing.
            </div>
          )}
        </div>
      )}

      {/* ── RECORD CASH PAYMENT MODAL ── */}
      {paymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 backdrop-blur-xs p-4">
          <div className="card w-full max-w-md p-6 bg-white rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-ink-100">
              <h3 className="font-display font-bold text-ink-900 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-brand-600" /> Record Cash Repayment
              </h3>
              <button onClick={() => setPaymentModal(null)} className="text-ink-400 hover:text-ink-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <p className="text-xs text-ink-500">Partner:</p>
              <p className="font-bold text-sm text-ink-900">
                {paymentModal.vendor.business_name || paymentModal.vendor.full_name}
              </p>
              <p className="text-xs text-amber-700 font-semibold mt-0.5">
                Current Due: {formatINR(paymentModal.vendor.outstanding_balance || 0)}
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-700">Amount Received (₹)</label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="e.g. 25000"
                className="input mt-1 text-sm font-bold text-ink-900"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-700">Payment Mode</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="input mt-1 text-xs font-medium"
              >
                <option value="Cash">Spot Cash (Hub Handover)</option>
                <option value="UPI">UPI / Instant Transfer</option>
                <option value="Bank Transfer">Bank NEFT / RTGS</option>
                <option value="Cheque">Bank Cheque</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-700">Remarks / Receipt Note</label>
              <input
                type="text"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="e.g. Cleared lot order #34a81"
                className="input mt-1 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setPaymentModal(null)} className="btn-outline text-xs">
                Cancel
              </button>
              <button
                onClick={handleRecordRepayment}
                disabled={paymentSubmitting || !paymentAmount}
                className="btn-primary text-xs px-5"
              >
                {paymentSubmitting ? 'Saving...' : 'Confirm Repayment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SET CREDIT LIMIT MODAL ── */}
      {limitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 backdrop-blur-xs p-4">
          <div className="card w-full max-w-sm p-6 bg-white rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-ink-100">
              <h3 className="font-display font-bold text-ink-900">Set Credit Limit</h3>
              <button onClick={() => setLimitModal(null)} className="text-ink-400 hover:text-ink-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <p className="text-xs text-ink-500">Partner:</p>
              <p className="font-bold text-sm text-ink-900">{limitModal.vendor.business_name || limitModal.vendor.full_name}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-700">New Credit Limit (₹)</label>
              <input
                type="number"
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
                placeholder="e.g. 500000"
                className="input mt-1 text-sm font-bold text-ink-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setLimitModal(null)} className="btn-outline text-xs">
                Cancel
              </button>
              <button
                onClick={handleUpdateLimit}
                disabled={limitSubmitting || !newLimit}
                className="btn-primary text-xs"
              >
                {limitSubmitting ? 'Saving...' : 'Save Limit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD INVENTORY MODAL ── */}
      {inventoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 backdrop-blur-xs p-4">
          <div className="card w-full max-w-lg p-6 bg-white rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-ink-100">
              <h3 className="font-display font-bold text-ink-900">Add Procured Phone to B2B Catalog</h3>
              <button onClick={() => setInventoryModal(false)} className="text-ink-400 hover:text-ink-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-ink-700">Brand</label>
                <select
                  value={invForm.brand}
                  onChange={(e) => setInvForm({ ...invForm, brand: e.target.value })}
                  className="input mt-1 text-xs"
                >
                  {['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Realme', 'Vivo', 'Oppo', 'Google'].map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink-700">Model Name</label>
                <input
                  type="text"
                  value={invForm.model}
                  onChange={(e) => setInvForm({ ...invForm, model: e.target.value })}
                  placeholder="e.g. iPhone 13"
                  className="input mt-1 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-ink-700">Storage</label>
                <input
                  type="text"
                  value={invForm.storage}
                  onChange={(e) => setInvForm({ ...invForm, storage: e.target.value })}
                  placeholder="128 GB"
                  className="input mt-1 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-ink-700">Condition Grade</label>
                <select
                  value={invForm.condition}
                  onChange={(e) => setInvForm({ ...invForm, condition: e.target.value })}
                  className="input mt-1 text-xs"
                >
                  <option value="Grade A">Grade A (Flawless)</option>
                  <option value="Grade B">Grade B (Minor Scratches)</option>
                  <option value="Grade C">Grade C (Heavy Signs of Use)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink-700">Wholesale Price (₹)</label>
                <input
                  type="number"
                  value={invForm.wholesale_price}
                  onChange={(e) => setInvForm({ ...invForm, wholesale_price: e.target.value })}
                  placeholder="32000"
                  className="input mt-1 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-ink-700">Expected Market Retail (₹)</label>
                <input
                  type="number"
                  value={invForm.retail_price}
                  onChange={(e) => setInvForm({ ...invForm, retail_price: e.target.value })}
                  placeholder="38000"
                  className="input mt-1 text-xs"
                />
              </div>

              <div className="col-span-2">
                <label className="text-xs font-semibold text-ink-700">IMEI (Optional)</label>
                <input
                  type="text"
                  value={invForm.imei}
                  onChange={(e) => setInvForm({ ...invForm, imei: e.target.value })}
                  placeholder="358921098234123"
                  className="input mt-1 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setInventoryModal(false)} className="btn-outline text-xs">
                Cancel
              </button>
              <button onClick={handleAddInventory} className="btn-primary text-xs">
                Save to Wholesale
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD NEW WHOLESALER PARTNER MODAL ── */}
      {addVendorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 backdrop-blur-xs p-4">
          <div className="card w-full max-w-lg p-6 bg-white rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-ink-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-ink-900">Register New Wholesaler Partner</h3>
                  <p className="text-xs text-ink-500">Provide business details & login passcode for Lucknow B2B</p>
                </div>
              </div>
              <button onClick={() => setAddVendorModal(false)} className="text-ink-400 hover:text-ink-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2 sm:col-span-1">
                <label className="font-semibold text-ink-700 block mb-1">Business / Shop Name *</label>
                <input
                  type="text"
                  required
                  value={addVendorForm.businessName}
                  onChange={(e) => setAddVendorForm({ ...addVendorForm, businessName: e.target.value })}
                  placeholder="e.g. Gomti Nagar Mobile Hub"
                  className="input text-xs w-full"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="font-semibold text-ink-700 block mb-1">Owner / Contact Name</label>
                <input
                  type="text"
                  value={addVendorForm.fullName}
                  onChange={(e) => setAddVendorForm({ ...addVendorForm, fullName: e.target.value })}
                  placeholder="e.g. Amit Sharma"
                  className="input text-xs w-full"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="font-semibold text-ink-700 block mb-1">Business Email *</label>
                <input
                  type="email"
                  required
                  value={addVendorForm.email}
                  onChange={(e) => setAddVendorForm({ ...addVendorForm, email: e.target.value })}
                  placeholder="amit.mobiles@gmail.com"
                  className="input text-xs w-full font-mono"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="font-semibold text-ink-700 block mb-1">Mobile Number *</label>
                <input
                  type="text"
                  required
                  value={addVendorForm.phone}
                  onChange={(e) => setAddVendorForm({ ...addVendorForm, phone: e.target.value })}
                  placeholder="9839122345"
                  className="input text-xs w-full font-mono"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="font-semibold text-ink-700 block mb-1">Login Password *</label>
                <input
                  type="text"
                  required
                  value={addVendorForm.password}
                  onChange={(e) => setAddVendorForm({ ...addVendorForm, password: e.target.value })}
                  placeholder="Partner@123456"
                  className="input text-xs w-full font-mono"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="font-semibold text-ink-700 block mb-1">Approved Credit Limit (₹)</label>
                <input
                  type="number"
                  value={addVendorForm.creditLimit}
                  onChange={(e) => setAddVendorForm({ ...addVendorForm, creditLimit: e.target.value })}
                  placeholder="200000"
                  className="input text-xs w-full font-bold"
                />
              </div>

              <div className="col-span-2">
                <label className="font-semibold text-ink-700 block mb-1">GSTIN Number (Optional)</label>
                <input
                  type="text"
                  value={addVendorForm.gstNumber}
                  onChange={(e) => setAddVendorForm({ ...addVendorForm, gstNumber: e.target.value })}
                  placeholder="09AAAAA0000A1Z5"
                  className="input text-xs w-full font-mono uppercase"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-ink-100">
              <button onClick={() => setAddVendorModal(false)} className="btn-outline text-xs">
                Cancel
              </button>
              <button
                onClick={handleAddVendor}
                disabled={addVendorSubmitting}
                className="btn-primary text-xs flex items-center gap-1.5"
              >
                {addVendorSubmitting ? 'Registering...' : 'Create & Generate Credentials'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SHARE CREDENTIALS MODAL (WHATSAPP & MAILTO) ── */}
      {shareCredModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 backdrop-blur-xs p-4">
          <div className="card w-full max-w-md p-6 bg-white rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-ink-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <Share2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-ink-900">Share Login & Link</h3>
                  <p className="text-xs text-ink-500">Send direct access details to Wholesaler Partner</p>
                </div>
              </div>
              <button onClick={() => setShareCredModal(null)} className="text-ink-400 hover:text-ink-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-ink-50 p-4 rounded-xl space-y-2 border border-ink-100 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-ink-500">Partner:</span>
                <span className="font-bold text-ink-900">{shareCredModal.vendor.business_name || shareCredModal.vendor.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500">Portal URL:</span>
                <span className="font-bold text-brand-600 truncate">{window.location.origin}/wholesaler-login</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500">Email ID:</span>
                <span className="font-bold text-ink-900">{shareCredModal.vendor.email || shareCredModal.vendor.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500">Password:</span>
                <span className="font-black text-emerald-700">{shareCredModal.password || 'Partner@123456'}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <a
                href={getWhatsAppShareLink(shareCredModal.vendor, shareCredModal.password)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 shadow-sm transition"
              >
                <MessageSquare className="h-4 w-4" /> Send via WhatsApp Direct
              </a>

              <a
                href={getEmailShareLink(shareCredModal.vendor, shareCredModal.password)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 shadow-sm transition"
              >
                <Mail className="h-4 w-4" /> Send via Email (Mailto)
              </a>
            </div>

            <div className="pt-2 text-right">
              <button onClick={() => setShareCredModal(null)} className="btn-outline text-xs px-4">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
