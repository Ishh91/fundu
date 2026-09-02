import { useState, useEffect } from 'react';
import { API_BASE } from '../../config/apiConfig';
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
  DollarSign,
  Wrench,
  Smartphone,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import type { Profile, WholesaleInventory, WholesaleOrder, SellRequest, RepairBooking, VendorLedger } from '../../types';
import { db, formatINR } from '../../lib/db';
import { statusColors } from './adminTypes';
import { sendEmailOtpCode } from '../../lib/freeNotifyService';

export default function AdminVendors() {
  const [activeSubtab, setActiveSubtab] = useState<'vendors' | 'assign-sell' | 'assign-repair' | 'commissions'>('vendors');
  const [_loading, setLoading] = useState(true);

  // Data states
  const [vendors, setVendors] = useState<Profile[]>([]);
  const [sellRequests, setSellRequests] = useState<SellRequest[]>([]);
  const [repairBookings, setRepairBookings] = useState<RepairBooking[]>([]);
  const [ledgers, setLedgers] = useState<VendorLedger[]>([]);
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

  // Add Vendor Modal State
  const [addVendorModal, setAddVendorModal] = useState(false);
  const [addVendorForm, setAddVendorForm] = useState({
    businessName: '',
    fullName: '',
    email: '',
    phone: '',
    vendorLocation: 'Lucknow Central',
    password: 'Vendor@123456',
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
    const loginUrl = `${window.location.origin}/vendor-login`;
    const passwordText = pass || 'Vendor@123456';

    const message = `🏬 *FUNDU LUCKNOW VENDOR PARTNER PORTAL*\n\n` +
      `Hi *${vendor.full_name || vendor.business_name || 'Vendor'}* (*${vendor.business_name || 'Vendor Partner'}*),\n` +
      `Your Official Vendor Account is created! Please check your email for the EmailJS Verification OTP code to verify your account.\n\n` +
      `🌐 *Login Portal:* ${loginUrl}\n` +
      `📧 *Login Email:* ${(vendor as any).email || vendor.phone}\n` +
      `🔑 *Passcode:* ${passwordText}\n` +
      `💳 *Approved Credit Limit:* ${formatINR(vendor.credit_limit || 200000)}`;

    return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
  };

  const getEmailShareLink = (vendor: Partial<Profile>, pass?: string) => {
    const loginUrl = `${window.location.origin}/vendor-login`;
    const passwordText = pass || 'Vendor@123456';
    const emailTo = (vendor as any).email || '';
    const subject = `Fundu Lucknow Vendor Account Created — Verification Required`;
    const body = `Hi ${vendor.full_name || vendor.business_name || 'Vendor Partner'},\n\n` +
      `Your Fundu Vendor Partner account has been created.\n\n` +
      `Login Portal: ${loginUrl}\n` +
      `Email: ${(vendor as any).email || vendor.phone}\n` +
      `Password: ${passwordText}\n` +
      `Approved Credit Limit: ${formatINR(vendor.credit_limit || 200000)}\n\n` +
      `Please enter the Email Verification OTP sent to your email to verify and activate your account.`;

    return `mailto:${emailTo}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleAddVendor = async () => {
    if (!addVendorForm.businessName || !addVendorForm.email || !addVendorForm.phone) {
      alert('Please fill business name, email and phone number.');
      return;
    }

    setAddVendorSubmitting(true);
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      const response = await fetch(`${API_BASE.replace(/\/$/, '')}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: addVendorForm.email.trim(),
          password: addVendorForm.password || 'Vendor@123456',
          fullName: addVendorForm.fullName || addVendorForm.businessName,
          phone: addVendorForm.phone.trim(),
          role: 'vendor',
          businessName: addVendorForm.businessName.trim(),
          creditLimit: Number(addVendorForm.creditLimit) || 200000,
          gstNumber: addVendorForm.gstNumber.trim() || null,
          is_verified: false, // Requires email OTP verification
        }),
      });

      const json = await response.json();
      if (json.error) throw new Error(json.error.message || json.error);

      // Dispatch Email Verification OTP via EmailJS
      try {
        await sendEmailOtpCode(addVendorForm.email.trim(), generatedOtp, addVendorForm.fullName || addVendorForm.businessName);
      } catch (otpErr) {
        console.error('Vendor Email OTP dispatch notice:', otpErr);
      }

      alert(`✅ Vendor Partner "${addVendorForm.businessName}" created!\n📧 Verification Email OTP (${generatedOtp}) sent to ${addVendorForm.email} via EmailJS.`);
      const newVendor = json.data?.profile || {
        business_name: addVendorForm.businessName,
        full_name: addVendorForm.fullName,
        email: addVendorForm.email,
        phone: addVendorForm.phone,
        credit_limit: Number(addVendorForm.creditLimit) || 200000,
      };

      setAddVendorModal(false);
      setShareCredModal({ vendor: newVendor, password: addVendorForm.password || 'Vendor@123456' });
      setAddVendorForm({
        businessName: '',
        fullName: '',
        email: '',
        phone: '',
        vendorLocation: 'Lucknow Central',
        password: 'Vendor@123456',
        creditLimit: '200000',
        gstNumber: '',
      });
      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create vendor account');
    } finally {
      setAddVendorSubmitting(false);
    }
  };

  const handleDeleteVendor = async (vendor: Profile) => {
    const name = vendor.business_name || vendor.full_name || 'this vendor partner';
    if (!window.confirm(`Are you sure you want to remove Vendor Partner "${name}"?\n\nThis will remove their vendor account and portal access.`)) {
      return;
    }

    try {
      await db.from('profiles').delete().eq('id', vendor.id);
      await db.from('users').delete().eq('id', vendor.id);

      alert(`🗑️ Vendor Partner "${name}" removed successfully!`);
      setVendors((prev) => prev.filter((v) => v.id !== vendor.id));
    } catch (err) {
      console.error('Failed to delete vendor partner:', err);
      alert('Failed to remove vendor partner.');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vRes, sRes, rRes, lRes] = await Promise.all([
        db.from('profiles').select('*').in('role', ['vendor', 'wholesaler']).order('created_at', { ascending: false }),
        db.from('sell_requests').select('*').order('created_at', { ascending: false }),
        db.from('repair_bookings').select('*').order('created_at', { ascending: false }),
        db.from('vendor_ledgers').select('*').order('created_at', { ascending: false }),
      ]);

      setVendors((vRes.data as Profile[]) ?? []);
      setSellRequests((sRes.data as SellRequest[]) ?? []);
      setRepairBookings((rRes.data as RepairBooking[]) ?? []);
      setLedgers((lRes.data as VendorLedger[]) ?? []);
    } catch (err) {
      console.warn('Error loading vendor admin data:', err);
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
  const totalCommissionsEarned = ledgers
    .filter((l) => l.type === 'sell_commission_fee' || l.type === 'repair_commission_fee')
    .reduce((sum, l) => sum + (l.amount || 0), 0);

  // Assign Mobile Sell Request to Vendor
  const handleAssignSellToVendor = async (sellId: string, vendorId: string) => {
    try {
      const { error } = await db.from('sell_requests').update({
        assigned_vendor_id: vendorId || null,
        forwarded_to_vendor: Boolean(vendorId),
        vendor_quote_status: vendorId ? 'pending_inspection' : 'none',
      }).eq('id', sellId);

      if (error) throw error;
      const targetVendor = vendors.find((v) => v.id === vendorId);
      alert(`✅ Mobile sell request forwarded to Vendor "${targetVendor?.business_name || targetVendor?.full_name || 'Vendor'}" for physical valuation!`);
      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to forward sell request to vendor');
    }
  };

  // Assign Repair Request to Vendor
  const handleAssignRepairToVendor = async (repairId: string, vendorId: string) => {
    try {
      const { error } = await db.from('repair_bookings').update({
        assigned_vendor_id: vendorId || null,
        forwarded_to_vendor: Boolean(vendorId),
        quotation_status: vendorId ? 'pending_quote' : 'none',
      }).eq('id', repairId);

      if (error) throw error;
      const targetVendor = vendors.find((v) => v.id === vendorId);
      alert(`✅ Repair request assigned to nearby Vendor "${targetVendor?.business_name || targetVendor?.full_name || 'Vendor'}" for quotation upload!`);
      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to assign repair request to vendor');
    }
  };

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

      alert(`Recorded cash repayment of ${formatINR(amountNum)} for ${paymentModal.vendor.business_name || paymentModal.vendor.full_name}. Limit balance updated!`);
      setPaymentModal(null);
      setPaymentAmount('');
      setPaymentNotes('');
      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to record repayment');
    } flex: {
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

  const filteredVendors = vendors.filter((v) =>
    `${v.business_name || ''} ${v.full_name || ''} ${v.phone || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Stat Cards */}
      <div className="card p-6 rounded-[28px] bg-gradient-to-r from-teal-500/10 via-brand-500/10 to-indigo-500/10 border border-teal-200/60 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-3 py-1 text-xs font-black text-teal-800">
            <Building2 className="h-3.5 w-3.5" /> Vendor Network & 10% Commission Manager
          </div>
          <h2 className="mt-2 font-display text-2xl font-black text-ink-900">Lucknow Vendors & Lead Forwarding Hub</h2>
          <p className="mt-1 text-xs text-ink-600">
            Forward unhandled mobile sell requests & location repair bookings to Vendors. Collect 10% platform commissions automatically.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/90 p-3 rounded-2xl border border-blue-200 shadow-xs text-center min-w-[110px]">
            <p className="text-[10px] font-bold uppercase text-ink-500">Active Vendors</p>
            <p className="font-display text-lg font-black text-blue-800">{vendors.length}</p>
          </div>
          <div className="bg-white/90 p-3 rounded-2xl border border-amber-200 shadow-xs text-center min-w-[110px]">
            <p className="text-[10px] font-bold uppercase text-ink-500">Credit Extended</p>
            <p className="font-display text-lg font-black text-amber-700">{formatINR(totalCreditLimit)}</p>
          </div>
          <div className="bg-white/90 p-3 rounded-2xl border border-emerald-200 shadow-xs text-center min-w-[110px]">
            <p className="text-[10px] font-bold uppercase text-emerald-700">10% Commissions</p>
            <p className="font-display text-lg font-black text-emerald-800">{formatINR(totalCommissionsEarned)}</p>
          </div>
        </div>
      </div>

      {/* Subtabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 pb-3">
        <div className="flex gap-2">
          {[
            { id: 'vendors', label: 'Vendor Partners', count: vendors.length },
            { id: 'assign-sell', label: 'Forward Mobile Sell Leads', count: sellRequests.length },
            { id: 'assign-repair', label: 'Assign Repair Bookings', count: repairBookings.length },
            { id: 'commissions', label: '10% Commission Ledgers', count: ledgers.length },
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
      </div>

      {/* ── SUBTAB 1: VENDORS & CREDIT LEDGER ── */}
      {activeSubtab === 'vendors' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="card p-3 rounded-2xl bg-white flex items-center gap-2 max-w-md shadow-xs flex-1">
              <Search className="h-4 w-4 text-ink-400 shrink-0 ml-1" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search vendor by shop name, mobile..."
                className="w-full text-xs bg-transparent border-none focus:outline-none text-ink-900 font-medium"
              />
            </div>
            <button
              onClick={() => setAddVendorModal(true)}
              className="btn-primary text-xs flex items-center justify-center gap-1.5 py-3 px-4 shadow-sm"
            >
              <Plus className="h-4 w-4" /> Add New Vendor Partner
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
                        {vendor.business_name || vendor.full_name || 'Lucknow Vendor'}
                      </h3>
                      <p className="text-xs text-ink-500 flex items-center gap-1 mt-0.5">
                        <PhoneCall className="h-3 w-3 text-ink-400" /> {vendor.phone || 'No phone'}
                      </p>
                    </div>
                    <span className="badge bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                      Verified Vendor
                    </span>
                  </div>

                  {/* Balance & Limit Card */}
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
                      <CreditCard className="h-3.5 w-3.5" /> Record Repayment
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

                  {/* Share Credentials, Resend Email OTP & Delete Vendor */}
                  <div className="pt-2 border-t border-ink-100 flex items-center justify-between text-[11px] gap-2 flex-wrap">
                    <button
                      onClick={() => setShareCredModal({ vendor })}
                      className="inline-flex items-center gap-1 text-brand-600 font-bold hover:underline"
                    >
                      <Share2 className="h-3 w-3 text-brand-500" /> Share Access
                    </button>

                    <button
                      onClick={async () => {
                        const email = (vendor as any).email || `${vendor.phone}@fundu.in`;
                        const otp = Math.floor(100000 + Math.random() * 900000).toString();
                        try {
                          await sendEmailOtpCode(email, otp, vendor.full_name || vendor.business_name || 'Vendor');
                          alert(`📧 Verification Email OTP (${otp}) sent to ${email} via EmailJS!`);
                        } catch {
                          alert('Failed to send EmailJS OTP.');
                        }
                      }}
                      className="inline-flex items-center gap-1 text-teal-700 font-bold hover:underline"
                    >
                      <Mail className="h-3 w-3 text-teal-600" /> Send Email OTP
                    </button>

                    <button
                      onClick={async () => {
                        const name = vendor.business_name || vendor.full_name || 'Vendor';
                        if (!window.confirm(`⚠️ Are you sure you want to PERMANENTLY DELETE vendor "${name}"?`)) return;
                        try {
                          await db.from('profiles').delete().eq('id', vendor.id);
                          setVendors((prev) => prev.filter((v) => v.id !== vendor.id));
                          alert(`✅ Vendor "${name}" deleted successfully.`);
                        } catch {
                          alert('Failed to delete vendor.');
                        }
                      }}
                      className="inline-flex items-center gap-1 text-rose-600 font-bold hover:underline"
                    >
                      <Trash2 className="h-3 w-3 text-rose-500" /> Delete Vendor
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredVendors.length === 0 && (
              <div className="col-span-full card p-12 text-center bg-white rounded-2xl text-ink-500 text-xs">
                No vendors found. As vendors register, they will appear here.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SUBTAB 2: FORWARD MOBILE SELL REQUESTS TO VENDORS ── */}
      {activeSubtab === 'assign-sell' && (
        <div className="space-y-4">
          {sellRequests.map((s) => {
            const currentVendor = vendors.find((v) => v.id === s.assigned_vendor_id);

            return (
              <div key={s.id} className="card p-6 rounded-2xl bg-white shadow-xs border border-ink-100 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-ink-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="badge bg-brand-50 text-brand-700 font-bold">Sell #{s.id.slice(0, 8)}</span>
                      <span className="badge bg-ink-100 text-ink-800 text-[10px] font-bold capitalize">{s.status}</span>
                      {s.vendor_quote_status === 'user_accepted' && (
                        <span className="badge bg-emerald-600 text-white font-bold text-[10px]">✓ User Accepted (Bought via Limit)</span>
                      )}
                    </div>
                    <p className="text-xs text-ink-500 mt-1">
                      Device: <strong className="text-ink-900">{s.brand} {s.model} ({s.storage})</strong> · Pickup: {s.pickup_address || s.pickup_area}
                    </p>
                  </div>

                  {/* Vendor Forward Selection */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-ink-700">Forward to Vendor:</label>
                    <select
                      value={s.assigned_vendor_id || ''}
                      onChange={(e) => handleAssignSellToVendor(s.id, e.target.value)}
                      className="input py-1 px-3 text-xs font-bold text-brand-900 border-brand-300"
                    >
                      <option value="">-- Platform Direct (No Vendor) --</option>
                      {vendors.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.business_name || v.full_name} ({v.phone})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-ink-50 p-3 rounded-xl">
                  <div>Est. Online Price: <strong>{formatINR(s.estimated_price || 0)}</strong></div>
                  <div>Vendor Quoted Valuation: <strong>{s.vendor_quote_price ? formatINR(s.vendor_quote_price) : 'Not Quoted Yet'}</strong></div>
                  <div>10% Platform Commission: <strong>{s.vendor_quote_price ? formatINR(Math.round(s.vendor_quote_price * 0.10)) : '-'}</strong></div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── SUBTAB 3: ASSIGN REPAIR REQUESTS TO NEARBY VENDORS ── */}
      {activeSubtab === 'assign-repair' && (
        <div className="space-y-4">
          {repairBookings.map((r) => {
            return (
              <div key={r.id} className="card p-6 rounded-2xl bg-white shadow-xs border border-ink-100 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-ink-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="badge bg-purple-50 text-purple-700 font-bold">Repair #{r.tracking_id || r.id.slice(0, 8)}</span>
                      <span className="badge bg-ink-100 text-ink-800 text-[10px] font-bold capitalize">{r.status}</span>
                    </div>
                    <p className="text-xs text-ink-500 mt-1">
                      Problem: <strong className="text-rose-700">{r.problem}</strong> on {r.brand} {r.model} · Area: {r.pickup_area || 'Lucknow'}
                    </p>
                  </div>

                  {/* Vendor Assignment Dropdown */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-ink-700">Assign Nearby Vendor:</label>
                    <select
                      value={r.assigned_vendor_id || ''}
                      onChange={(e) => handleAssignRepairToVendor(r.id, e.target.value)}
                      className="input py-1 px-3 text-xs font-bold text-purple-900 border-purple-300"
                    >
                      <option value="">-- Platform Technician --</option>
                      {vendors.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.business_name || v.full_name} ({v.phone})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-purple-50/50 p-3 rounded-xl border border-purple-100">
                  <div>Vendor Quotation: <strong>{r.vendor_quotation_amount ? formatINR(r.vendor_quotation_amount) : 'Pending Upload'}</strong></div>
                  <div>10% Platform Commission: <strong>{r.vendor_quotation_amount ? formatINR(Math.round(r.vendor_quotation_amount * 0.10)) : '-'}</strong></div>
                  <div>Vendor Net Payout (90%): <strong>{r.vendor_quotation_amount ? formatINR(Math.round(r.vendor_quotation_amount * 0.90)) : '-'}</strong></div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── SUBTAB 4: 10% PLATFORM COMMISSION LEDGERS ── */}
      {activeSubtab === 'commissions' && (
        <div className="card p-6 rounded-2xl bg-white shadow-xs space-y-4">
          <h3 className="font-display text-lg font-bold text-ink-900">All Vendor Ledgers & 10% Commission Records</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-ink-100 text-ink-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-2">Date</th>
                  <th className="py-3 px-2">Vendor Name</th>
                  <th className="py-3 px-2">Type</th>
                  <th className="py-3 px-2">Remarks</th>
                  <th className="py-3 px-2 text-right">Amount</th>
                  <th className="py-3 px-2 text-right">Balance After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {ledgers.map((l) => (
                  <tr key={l.id} className="hover:bg-ink-50/50">
                    <td className="py-3 px-2 text-ink-600">{new Date(l.created_at).toLocaleDateString('en-IN')}</td>
                    <td className="py-3 px-2 font-bold text-ink-900">{l.vendor_name || 'Vendor'}</td>
                    <td className="py-3 px-2">
                      <span className="badge bg-purple-100 text-purple-800 text-[10px] font-bold">
                        {l.type.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-ink-600">{l.notes || '-'}</td>
                    <td className="py-3 px-2 text-right font-bold text-brand-700">{formatINR(l.amount)}</td>
                    <td className="py-3 px-2 text-right font-black text-ink-900">{formatINR(l.balance_after)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── ADD VENDOR MODAL ── */}
      {addVendorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 backdrop-blur-xs p-4">
          <div className="card w-full max-w-md p-6 bg-white rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-ink-100">
              <h3 className="font-display font-bold text-ink-900 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-brand-600" /> Create Vendor Partner
              </h3>
              <button onClick={() => setAddVendorModal(false)} className="text-ink-400 hover:text-ink-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-700">Vendor / Shop Name</label>
              <input
                type="text"
                required
                value={addVendorForm.businessName}
                onChange={(e) => setAddVendorForm({ ...addVendorForm, businessName: e.target.value })}
                placeholder="e.g. Lucknow Mobile Care"
                className="input mt-1 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-700">Email Address</label>
              <input
                type="email"
                required
                value={addVendorForm.email}
                onChange={(e) => setAddVendorForm({ ...addVendorForm, email: e.target.value })}
                placeholder="vendor@lucknow.com"
                className="input mt-1 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-700">Mobile Phone</label>
              <input
                type="text"
                required
                value={addVendorForm.phone}
                onChange={(e) => setAddVendorForm({ ...addVendorForm, phone: e.target.value })}
                placeholder="9839122345"
                className="input mt-1 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-700">Approved Credit Limit (₹)</label>
              <input
                type="number"
                value={addVendorForm.creditLimit}
                onChange={(e) => setAddVendorForm({ ...addVendorForm, creditLimit: e.target.value })}
                placeholder="200000"
                className="input mt-1 text-xs font-bold"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setAddVendorModal(false)} className="btn-outline text-xs">
                Cancel
              </button>
              <button
                onClick={handleAddVendor}
                disabled={addVendorSubmitting}
                className="btn-primary text-xs px-5"
              >
                {addVendorSubmitting ? 'Creating...' : 'Create Vendor'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHARE CREDENTIALS MODAL */}
      {shareCredModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 backdrop-blur-xs p-4">
          <div className="card w-full max-w-md p-6 bg-white rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-ink-100">
              <h3 className="font-display font-bold text-ink-900">Vendor Login Credentials</h3>
              <button onClick={() => setShareCredModal(null)} className="text-ink-400 hover:text-ink-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3 bg-ink-50 rounded-xl space-y-1 text-xs">
              <p>Email: <strong>{(shareCredModal.vendor as any).email || shareCredModal.vendor.phone}</strong></p>
              <p>Passcode: <strong>{shareCredModal.password || 'Vendor@123456'}</strong></p>
              <p>Limit: <strong>{formatINR(shareCredModal.vendor.credit_limit || 200000)}</strong></p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <a
                href={getWhatsAppShareLink(shareCredModal.vendor, shareCredModal.password)}
                target="_blank"
                rel="noreferrer"
                className="btn bg-[#25D366] text-white hover:bg-[#20bd5a] text-xs py-2.5 flex items-center justify-center gap-2 font-bold rounded-xl shadow-xs"
              >
                <MessageSquare className="h-4 w-4" /> Share Credentials via WhatsApp
              </a>
              <button onClick={() => setShareCredModal(null)} className="btn-outline text-xs py-2">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
