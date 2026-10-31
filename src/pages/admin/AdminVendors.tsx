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
  UserCheck,
  Check,
  AlertTriangle,
  RotateCcw,
  Edit2,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';
import type { Profile, WholesaleInventory, WholesaleOrder, SellRequest, RepairBooking, VendorLedger } from '../../types';
import { db, formatINR } from '../../lib/db';
import { statusColors } from './adminTypes';
import { sendEmailOtpCode } from '../../lib/freeNotifyService';

export default function AdminVendors() {
  const [activeSubtab, setActiveSubtab] = useState<'pending-quotes' | 'assign-sell' | 'assign-repair' | 'vendors' | 'commissions'>('pending-quotes');
  const [_loading, setLoading] = useState(true);

  // Data states
  const [vendors, setVendors] = useState<Profile[]>([]);
  const [sellRequests, setSellRequests] = useState<SellRequest[]>([]);
  const [repairBookings, setRepairBookings] = useState<RepairBooking[]>([]);
  const [ledgers, setLedgers] = useState<VendorLedger[]>([]);
  const [search, setSearch] = useState('');
  const [sellFilter, setSellFilter] = useState<'all' | 'pending_quote' | 'admin_approved' | 'user_accepted' | 'declined'>('all');
  const [repairFilter, setRepairFilter] = useState<'all' | 'pending_quote' | 'admin_approved' | 'paid' | 'declined'>('all');

  // Modals
  const [paymentModal, setPaymentModal] = useState<{ vendor: Profile } | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);

  const [limitModal, setLimitModal] = useState<{ vendor: Profile } | null>(null);
  const [newLimit, setNewLimit] = useState('');
  const [limitSubmitting, setLimitSubmitting] = useState(false);

  // Admin Price Override Modal
  const [overrideModal, setOverrideModal] = useState<{
    type: 'sell' | 'repair';
    id: string;
    brand: string;
    model: string;
    currentPrice: number;
    vendorName?: string;
  } | null>(null);
  const [overridePriceInput, setOverridePriceInput] = useState('');
  const [overrideSubmitting, setOverrideSubmitting] = useState(false);

  // Add Vendor Modal State
  const [addVendorModal, setAddVendorModal] = useState(false);
  const [addVendorForm, setAddVendorForm] = useState({
    businessName: '',
    fullName: '',
    email: '',
    phone: '',
    vendorLocation: 'Doorstep Central',
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

    const message = `🏬 *Fundu VENDOR PARTNER PORTAL*\n\n` +
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
    const subject = `Fundu Vendor Account Created — Verification Required`;
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
        vendorLocation: 'Doorstep Central',
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

  // Pending Vendor Quotations Waiting for Admin Verification & Approval
  const pendingSellQuotes = sellRequests.filter(
    (s) =>
      s.vendor_quote_status === 'quoted' ||
      (s.vendor_quote_price &&
        s.vendor_quote_status !== 'admin_approved' &&
        s.vendor_quote_status !== 'user_accepted' &&
        s.vendor_quote_status !== 'user_rejected' &&
        s.status !== 'completed' &&
        s.status !== 'cancelled')
  );

  const pendingRepairQuotes = repairBookings.filter(
    (r) =>
      r.quotation_status === 'quoted' ||
      (r.vendor_quotation_amount &&
        r.quotation_status !== 'admin_approved' &&
        r.quotation_status !== 'user_accepted' &&
        r.quotation_status !== 'user_rejected' &&
        r.status !== 'delivered' &&
        r.status !== 'cancelled' &&
        r.status !== 'completed')
  );

  const totalPendingQuotes = pendingSellQuotes.length + pendingRepairQuotes.length;

  // Assign or Reassign Mobile Sell Request to Vendor
  const handleAssignSellToVendor = async (sellId: string, vendorId: string) => {
    try {
      const isReassign = Boolean(vendorId);
      const targetVendor = vendors.find((v) => (v.id && String(v.id) === String(vendorId)) || (v._id && String(v._id) === String(vendorId)));
      const vendorName = targetVendor ? (targetVendor.business_name || targetVendor.full_name) : null;
      const { error } = await db.from('sell_requests').update({
        assigned_vendor_id: vendorId || null,
        assigned_vendor_name: isReassign ? vendorName : null,
        forwarded_to_vendor: isReassign,
        vendor_quote_status: isReassign ? 'pending_inspection' : 'none',
        status: isReassign ? 'assigned_to_vendor' : 'pending',
        updated_at: new Date().toISOString(),
      }).eq('id', sellId);

      if (error) throw error;
      if (vendorId) {
        alert(`✅ Mobile sell request forwarded/reassigned to Vendor "${targetVendor?.business_name || targetVendor?.full_name || 'Vendor'}"!`);
      } else {
        alert(`Lead reset to Platform Direct (Vendor unassigned).`);
      }
      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to forward sell request to vendor');
    }
  };

  // Approve Vendor Sell Quotation (Admin verifies & pushes price to customer)
  const handleApproveSellQuote = async (sellId: string, price: number) => {
    try {
      const { error } = await db.from('sell_requests').update({
        vendor_quote_status: 'admin_approved',
        final_price: price,
        status: 'inspection_mismatch', // Triggers user acceptance prompt on dashboard
        updated_at: new Date().toISOString(),
      }).eq('id', sellId);

      if (error) throw error;
      alert(`✅ Quoted valuation of ${formatINR(price)} APPROVED by Admin! Customer can now accept on their dashboard.`);
      await fetchData();
    } catch (err: any) {
      alert(err?.message || 'Failed to approve sell quotation');
    }
  };

  // Reject Vendor Sell Quotation
  const handleRejectSellQuote = async (sellId: string) => {
    const confirmReject = window.confirm(
      'Are you sure you want to reject this vendor quotation? You can reassign this lead to another vendor.'
    );
    if (!confirmReject) return;
    try {
      const { error } = await db.from('sell_requests').update({
        vendor_quote_status: 'admin_rejected',
        status: 'pending',
        updated_at: new Date().toISOString(),
      }).eq('id', sellId);

      if (error) throw error;
      alert('Quotation rejected. You can now reassign this lead to another vendor.');
      await fetchData();
    } catch (err: any) {
      alert(err?.message || 'Failed to reject quotation');
    }
  };

  // Assign or Reassign Repair Request to Vendor
  const handleAssignRepairToVendor = async (repairId: string, vendorId: string) => {
    try {
      const isReassign = Boolean(vendorId);
      const targetVendor = vendors.find((v) => (v.id && String(v.id) === String(vendorId)) || (v._id && String(v._id) === String(vendorId)));
      const vendorName = targetVendor ? (targetVendor.business_name || targetVendor.full_name) : null;
      const { error } = await db.from('repair_bookings').update({
        assigned_vendor_id: vendorId || null,
        assigned_vendor_name: isReassign ? vendorName : null,
        forwarded_to_vendor: isReassign,
        quotation_status: isReassign ? 'pending_quote' : 'none',
        status: isReassign ? 'assigned_to_vendor' : 'pending',
        updated_at: new Date().toISOString(),
      }).eq('id', repairId);

      if (error) throw error;
      if (vendorId) {
        alert(`✅ Repair request assigned/reassigned to Vendor "${targetVendor?.business_name || targetVendor?.full_name || 'Vendor'}"!`);
      } else {
        alert(`Repair reset to Platform Technician.`);
      }
      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to assign repair request to vendor');
    }
  };

  // Approve Vendor Repair Quotation (Admin verifies & pushes quotation to customer)
  const handleApproveRepairQuote = async (repairId: string, amount: number) => {
    try {
      const { error } = await db.from('repair_bookings').update({
        quotation_status: 'admin_approved',
        final_cost: amount,
        status: 'quoted', // Triggers payment/acceptance on customer dashboard
        updated_at: new Date().toISOString(),
      }).eq('id', repairId);

      if (error) throw error;
      alert(`✅ Repair quotation of ${formatINR(amount)} APPROVED by Admin! Customer can now review & pay on their dashboard.`);
      await fetchData();
    } catch (err: any) {
      alert(err?.message || 'Failed to approve repair quotation');
    }
  };

  // Reject Vendor Repair Quotation
  const handleRejectRepairQuote = async (repairId: string) => {
    const confirmReject = window.confirm(
      'Are you sure you want to reject this repair quotation? You can reassign this repair to another nearby vendor.'
    );
    if (!confirmReject) return;
    try {
      const { error } = await db.from('repair_bookings').update({
        quotation_status: 'admin_rejected',
        status: 'pending',
        updated_at: new Date().toISOString(),
      }).eq('id', repairId);

      if (error) throw error;
      alert('Repair quotation rejected. You can now reassign this repair to another vendor.');
      await fetchData();
    } catch (err: any) {
      alert(err?.message || 'Failed to reject quotation');
    }
  };

  // Admin Custom Price Override Submission
  const handleSaveOverridePrice = async () => {
    if (!overrideModal || !overridePriceInput) return;
    const num = Number(overridePriceInput);
    if (isNaN(num) || num <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    setOverrideSubmitting(true);
    try {
      const nowIso = new Date().toISOString();
      if (overrideModal.type === 'sell') {
        const { error } = await db.from('sell_requests').update({
          vendor_quote_price: num,
          final_price: num,
          vendor_quote_status: 'admin_approved',
          status: 'inspection_mismatch',
          updated_at: nowIso,
        }).eq('id', overrideModal.id);
        if (error) throw error;
        alert(`✅ Verified price of ${formatINR(num)} approved for ${overrideModal.brand} ${overrideModal.model}!`);
      } else {
        const { error } = await db.from('repair_bookings').update({
          vendor_quotation_amount: num,
          final_cost: num,
          quotation_status: 'admin_approved',
          status: 'quoted',
          updated_at: nowIso,
        }).eq('id', overrideModal.id);
        if (error) throw error;
        alert(`✅ Verified repair cost of ${formatINR(num)} approved for ${overrideModal.brand} ${overrideModal.model}!`);
      }
      setOverrideModal(null);
      setOverridePriceInput('');
      await fetchData();
    } catch (err: any) {
      alert(err?.message || 'Failed to override price');
    } finally {
      setOverrideSubmitting(false);
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
        notes: paymentNotes || 'Cash received at Fundu Hub',
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
      <div className="card p-6 rounded-[28px] bg-gradient-to-r from-slate-700/10 via-brand-500/10 to-[#344257]/10 border border-slate-200/60 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#F0F0F5] border border-[#C0C8D8] px-3 py-1 text-xs font-black text-[#344257]">
            <Building2 className="h-3.5 w-3.5" /> Vendor Network & 10% Commission Manager
          </div>
          <h2 className="mt-2 font-display text-2xl font-black text-ink-900">Doorstep Vendors & Lead Forwarding Hub</h2>
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
        <div className="flex flex-wrap gap-2">
          {[
            {
              id: 'pending-quotes',
              label: '⚡ Pending Quotations',
              count: totalPendingQuotes,
              alert: totalPendingQuotes > 0,
            },
            { id: 'assign-sell', label: 'Forward Mobile Sell Leads', count: sellRequests.length, alert: false },
            { id: 'assign-repair', label: 'Assign Repair Bookings', count: repairBookings.length, alert: false },
            { id: 'vendors', label: 'Vendor Partners', count: vendors.length, alert: false },
            { id: 'commissions', label: '10% Commission Ledgers', count: ledgers.length, alert: false },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubtab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeSubtab === tab.id
                  ? 'bg-brand-600 text-white shadow-xs'
                  : tab.alert
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 font-black animate-pulse'
                  : 'bg-white text-ink-600 hover:bg-ink-100 border border-ink-200/60'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  activeSubtab === tab.id
                    ? 'bg-white/20 text-white'
                    : tab.alert
                    ? 'bg-amber-500 text-white'
                    : 'bg-ink-100 text-ink-700'
                }`}
              >
                {tab.count}
              </span>
              {tab.alert && activeSubtab !== tab.id && (
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── SUBTAB 0: PENDING VENDOR QUOTATIONS QUEUE (ADMIN VERIFICATION) ── */}
      {activeSubtab === 'pending-quotes' && (
        <div className="space-y-6">
          <div className="card p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-white border border-amber-200 space-y-1">
            <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
              <Sparkles className="h-4 w-4 text-amber-600" /> Vendor Quotation Verification & Approval Queue
            </div>
            <p className="text-xs text-amber-800">
              Vendors have submitted prices after physical diagnostic checks. Verify if the quotation is fair and accurate.
              Click <strong>Approve Price</strong> to push it to the customer dashboard, <strong>Override</strong> to modify the price,
              or <strong>Reassign</strong> if the vendor declined or quoted an invalid price.
            </p>
          </div>

          {totalPendingQuotes === 0 ? (
            <div className="card p-12 text-center bg-white rounded-2xl border border-ink-100">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
              <h3 className="mt-3 font-display font-bold text-ink-800 text-sm">All Vendor Quotations Verified</h3>
              <p className="text-xs text-ink-500 mt-1">There are currently no pending quotes from vendors awaiting Admin verification.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Sell Request Quotes */}
              {pendingSellQuotes.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-ink-900 text-sm flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-brand-600" />
                      Mobile Buyback Quotes ({pendingSellQuotes.length})
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {pendingSellQuotes.map((s) => {
                      const vendor = vendors.find((v) => (v.id && String(v.id) === String(s.assigned_vendor_id)) || (v._id && String(v._id) === String(s.assigned_vendor_id)));
                      const vendorName = vendor?.business_name || vendor?.full_name || (s as any).assigned_vendor_name || 'Vendor Partner';
                      const vendorPhone = vendor?.phone || vendor?.mobile || null;
                      return (
                        <div key={s.id} className="card p-5 rounded-2xl bg-white shadow-xs border-2 border-amber-300 space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-ink-100">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="badge bg-brand-50 text-brand-700 font-bold">Sell #{s.id.slice(0, 8)}</span>
                                <span className="badge bg-amber-500 text-white font-black text-[10px] animate-pulse">
                                  ⚡ Quoted by Vendor: {formatINR(s.vendor_quote_price || 0)}
                                </span>
                              </div>
                              <h4 className="text-sm font-black text-ink-900 mt-1">
                                {s.brand} {s.model} {s.storage ? `(${s.storage})` : ''} · Condition: {s.condition}
                              </h4>
                              <p className="text-xs text-ink-500">
                                Assigned Vendor: <strong className="text-brand-900">{vendorName}</strong> {vendorPhone ? `(${vendorPhone})` : ''}
                              </p>
                            </div>

                            {/* Verification Action Buttons */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                type="button"
                                onClick={() => handleApproveSellQuote(s.id, s.vendor_quote_price || 0)}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                              >
                                <Check className="h-4 w-4" /> Approve Price ({formatINR(s.vendor_quote_price || 0)})
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setOverrideModal({
                                    type: 'sell',
                                    id: s.id,
                                    brand: s.brand,
                                    model: s.model,
                                    currentPrice: s.vendor_quote_price || s.estimated_price || 0,
                                    vendorName: vendor?.business_name || vendor?.full_name || undefined,
                                  });
                                  setOverridePriceInput(String(s.vendor_quote_price || s.estimated_price || ''));
                                }}
                                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                              >
                                <Edit2 className="h-3.5 w-3.5" /> Override Price
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectSellQuote(s.id)}
                                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition cursor-pointer"
                              >
                                Reject Quote
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs bg-amber-50/50 p-3.5 rounded-xl border border-amber-100">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-ink-500 block">Est. Online Valuation</span>
                              <strong className="text-ink-800">{formatINR(s.estimated_price || 0)}</strong>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-amber-800 block">Vendor Quoted Valuation</span>
                              <strong className="text-amber-900 font-display text-base font-black">{formatINR(s.vendor_quote_price || 0)}</strong>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-emerald-700 block">10% Platform Commission</span>
                              <strong className="text-emerald-800 font-bold">{formatINR(Math.round((s.vendor_quote_price || 0) * 0.10))}</strong>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-ink-500 block">Reassign to Other Vendor</span>
                              <select
                                value={s.assigned_vendor_id || ''}
                                onChange={(e) => handleAssignSellToVendor(s.id, e.target.value)}
                                className="input py-0.5 px-2 text-xs font-bold text-brand-900 border-brand-300 w-full mt-0.5"
                              >
                                <option value="">-- Platform Direct --</option>
                                {vendors.map((v) => (
                                  <option key={v.id} value={v.id}>
                                    {v.business_name || v.full_name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {s.vendor_notes && (
                            <div className="text-xs bg-ink-50 p-3 rounded-xl border border-ink-100 text-ink-800">
                              <span className="font-bold text-ink-900">Vendor Inspection Note:</span> "{s.vendor_notes}"
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Repair Request Quotes */}
              {pendingRepairQuotes.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-ink-900 text-sm flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-purple-600" />
                      Doorstep Repair Quotations ({pendingRepairQuotes.length})
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {pendingRepairQuotes.map((r) => {
                      const vendor = vendors.find((v) => (v.id && String(v.id) === String(r.assigned_vendor_id)) || (v._id && String(v._id) === String(r.assigned_vendor_id)));
                      const vendorName = vendor?.business_name || vendor?.full_name || (r as any).assigned_vendor_name || 'Vendor Partner';
                      const vendorPhone = vendor?.phone || vendor?.mobile || null;
                      return (
                        <div key={r.id} className="card p-5 rounded-2xl bg-white shadow-xs border-2 border-purple-300 space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-ink-100">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="badge bg-purple-50 text-purple-700 font-bold">Repair #{r.tracking_id || r.id.slice(0, 8)}</span>
                                <span className="badge bg-purple-600 text-white font-black text-[10px] animate-pulse">
                                  ⚡ Quoted by Vendor: {formatINR(r.vendor_quotation_amount || 0)}
                                </span>
                              </div>
                              <h4 className="text-sm font-black text-ink-900 mt-1">
                                {r.brand} {r.model} · Issue: <span className="text-rose-700 font-bold">{r.problem}</span>
                              </h4>
                              <p className="text-xs text-ink-500">
                                Assigned Technician/Vendor: <strong className="text-purple-900">{vendorName}</strong> {vendorPhone ? `(${vendorPhone})` : ''}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                type="button"
                                onClick={() => handleApproveRepairQuote(r.id, r.vendor_quotation_amount || 0)}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                              >
                                <Check className="h-4 w-4" /> Approve Quotation ({formatINR(r.vendor_quotation_amount || 0)})
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setOverrideModal({
                                    type: 'repair',
                                    id: r.id,
                                    brand: r.brand,
                                    model: r.model,
                                    currentPrice: r.vendor_quotation_amount || r.estimated_cost || 0,
                                    vendorName: vendor?.business_name || vendor?.full_name || undefined,
                                  });
                                  setOverridePriceInput(String(r.vendor_quotation_amount || r.estimated_cost || ''));
                                }}
                                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                              >
                                <Edit2 className="h-3.5 w-3.5" /> Override Cost
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectRepairQuote(r.id)}
                                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition cursor-pointer"
                              >
                                Reject Quote
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs bg-purple-50/50 p-3.5 rounded-xl border border-purple-100">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-ink-500 block">Est. Online Cost</span>
                              <strong className="text-ink-800">{formatINR(r.estimated_cost || 0)}</strong>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-purple-800 block">Vendor Repair Quotation</span>
                              <strong className="text-purple-900 font-display text-base font-black">{formatINR(r.vendor_quotation_amount || 0)}</strong>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-emerald-700 block">10% Platform Commission</span>
                              <strong className="text-emerald-800 font-bold">{formatINR(Math.round((r.vendor_quotation_amount || 0) * 0.10))}</strong>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-ink-500 block">Reassign to Other Vendor</span>
                              <select
                                value={r.assigned_vendor_id || ''}
                                onChange={(e) => handleAssignRepairToVendor(r.id, e.target.value)}
                                className="input py-0.5 px-2 text-xs font-bold text-purple-900 border-purple-300 w-full mt-0.5"
                              >
                                <option value="">-- Platform Technician --</option>
                                {vendors.map((v) => (
                                  <option key={v.id} value={v.id}>
                                    {v.business_name || v.full_name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {r.vendor_quotation_details && (
                            <div className="text-xs bg-ink-50 p-3 rounded-xl border border-ink-100 text-ink-800">
                              <span className="font-bold text-ink-900">Quotation Breakdown:</span> "{r.vendor_quotation_details}"
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

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
                        {vendor.business_name || vendor.full_name || 'Doorstep Vendor'}
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
                      className="inline-flex items-center gap-1 text-[#344257] font-bold hover:underline"
                    >
                      <Mail className="h-3 w-3 text-[#47576E]" /> Send Email OTP
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
          {/* Sell Filter Controls */}
          <div className="flex flex-wrap items-center gap-2 pb-2">
            {[
              { id: 'all', label: `All (${sellRequests.length})` },
              { id: 'pending_quote', label: `⚡ Pending Quote (${pendingSellQuotes.length})` },
              { id: 'admin_approved', label: `✓ Admin Approved (${sellRequests.filter((s) => s.vendor_quote_status === 'admin_approved').length})` },
              { id: 'user_accepted', label: `✓ Customer Accepted (${sellRequests.filter((s) => s.vendor_quote_status === 'user_accepted' || s.status === 'completed').length})` },
              { id: 'declined', label: `❌ Declined (${sellRequests.filter((s) => s.vendor_quote_status === 'vendor_declined' || s.vendor_quote_status === 'user_rejected').length})` },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSellFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  sellFilter === f.id
                    ? 'bg-[#344257] text-white shadow-xs'
                    : 'bg-white text-ink-600 hover:bg-ink-50 border border-ink-200/60'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {sellRequests
            .filter((s) => {
              if (sellFilter === 'pending_quote') return s.vendor_quote_status === 'quoted';
              if (sellFilter === 'admin_approved') return s.vendor_quote_status === 'admin_approved';
              if (sellFilter === 'user_accepted') return s.vendor_quote_status === 'user_accepted' || s.status === 'completed';
              if (sellFilter === 'declined') return s.vendor_quote_status === 'vendor_declined' || s.vendor_quote_status === 'user_rejected';
              return true;
            })
            .map((s) => {
              const currentVendor = vendors.find((v) => (v.id && String(v.id) === String(s.assigned_vendor_id)) || (v._id && String(v._id) === String(s.assigned_vendor_id)));
              const vendorName = currentVendor?.business_name || currentVendor?.full_name || (s as any).assigned_vendor_name || 'Vendor Partner';
              const isQuoted = s.vendor_quote_status === 'quoted';
              const isAdminApproved = s.vendor_quote_status === 'admin_approved';
              const isUserAccepted = s.vendor_quote_status === 'user_accepted' || s.status === 'completed';
              const isVendorDeclined = s.vendor_quote_status === 'vendor_declined';
              const isUserRejected = s.vendor_quote_status === 'user_rejected';

              return (
                <div
                  key={s.id}
                  className={`card p-6 rounded-2xl bg-white shadow-xs border transition space-y-4 ${
                    isQuoted ? 'border-2 border-amber-300 ring-2 ring-amber-100' : 'border-ink-100'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-ink-100">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="badge bg-brand-50 text-brand-700 font-bold">Sell #{s.id.slice(0, 8)}</span>
                        {isUserAccepted ? (
                          <span className="badge bg-emerald-600 text-white font-bold text-[10px]">
                            ✓ Customer Accepted (Bought via Limit)
                          </span>
                        ) : isAdminApproved ? (
                          <span className="badge bg-blue-600 text-white font-bold text-[10px]">
                            ✓ Approved by Admin ({formatINR(s.vendor_quote_price || 0)}) — Sent to Customer
                          </span>
                        ) : isQuoted ? (
                          <span className="badge bg-amber-500 text-white font-black text-[10px] animate-pulse">
                            ⚡ Quoted by Vendor: {formatINR(s.vendor_quote_price || 0)} (Awaiting Verification)
                          </span>
                        ) : isVendorDeclined ? (
                          <span className="badge bg-rose-600 text-white font-bold text-[10px]">
                            ❌ Vendor Declined Lead — Please Reassign
                          </span>
                        ) : isUserRejected ? (
                          <span className="badge bg-gray-600 text-white font-bold text-[10px]">
                            ❌ Customer Declined Quote
                          </span>
                        ) : s.assigned_vendor_id ? (
                          <span className="badge bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                            Assigned to {vendorName}
                          </span>
                        ) : (
                          <span className="badge bg-ink-100 text-ink-800 text-[10px] font-bold">
                            Platform Direct
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-ink-500 mt-1">
                        Device: <strong className="text-ink-900">{s.brand} {s.model} ({s.storage})</strong> · Pickup: {s.pickup_address || s.pickup_area}
                      </p>
                    </div>

                    {/* Forward / Reassign Dropdown */}
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold text-ink-700">Forward / Reassign:</label>
                      <select
                        value={currentVendor ? (currentVendor.id || currentVendor._id) : (s.assigned_vendor_id || '')}
                        onChange={(e) => handleAssignSellToVendor(s.id, e.target.value)}
                        className="input py-1 px-3 text-xs font-bold text-brand-900 border-brand-300"
                      >
                        <option value="">-- Platform Direct (No Vendor) --</option>
                        {vendors.map((v) => {
                          const vId = v.id || v._id;
                          return (
                            <option key={vId} value={vId}>
                              {v.business_name || v.full_name} ({v.phone || 'Store'})
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  {/* Valuation Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-ink-50 p-3 rounded-xl">
                    <div>Est. Online Price: <strong>{formatINR(s.estimated_price || 0)}</strong></div>
                    <div>
                      Vendor Quoted Valuation:{' '}
                      <strong className={isQuoted ? 'text-amber-700 font-black' : ''}>
                        {s.vendor_quote_price ? formatINR(s.vendor_quote_price) : 'Not Quoted Yet'}
                      </strong>
                    </div>
                    <div>10% Platform Commission: <strong>{s.vendor_quote_price ? formatINR(Math.round(s.vendor_quote_price * 0.10)) : '-'}</strong></div>
                  </div>

                  {s.vendor_notes && (
                    <div className="text-xs bg-amber-50/60 p-2.5 rounded-xl border border-amber-200 text-amber-900">
                      <strong>Vendor Inspection Notes:</strong> "{s.vendor_notes}"
                    </div>
                  )}

                  {/* Verification Actions for Admin */}
                  {isQuoted && (
                    <div className="flex items-center justify-between gap-3 pt-2 border-t border-ink-100 flex-wrap bg-amber-50/30 p-2.5 rounded-xl">
                      <span className="text-xs font-bold text-amber-900">
                        ⚡ Action Required: Verify Vendor Quotation
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleApproveSellQuote(s.id, s.vendor_quote_price || 0)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5" /> Approve Price ({formatINR(s.vendor_quote_price || 0)})
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOverrideModal({
                              type: 'sell',
                              id: s.id,
                              brand: s.brand,
                              model: s.model,
                              currentPrice: s.vendor_quote_price || s.estimated_price || 0,
                              vendorName: currentVendor?.business_name || currentVendor?.full_name || undefined,
                            });
                            setOverridePriceInput(String(s.vendor_quote_price || s.estimated_price || ''));
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" /> Override
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectSellQuote(s.id)}
                          className="px-3 py-1.5 bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 text-xs font-bold rounded-xl transition cursor-pointer"
                        >
                          Reject Quote
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {/* ── SUBTAB 3: ASSIGN REPAIR REQUESTS TO NEARBY VENDORS ── */}
      {activeSubtab === 'assign-repair' && (
        <div className="space-y-4">
          {/* Repair Filter Controls */}
          <div className="flex flex-wrap items-center gap-2 pb-2">
            {[
              { id: 'all', label: `All (${repairBookings.length})` },
              { id: 'pending_quote', label: `⚡ Pending Quote (${pendingRepairQuotes.length})` },
              { id: 'admin_approved', label: `✓ Admin Approved (${repairBookings.filter((r) => r.quotation_status === 'admin_approved').length})` },
              { id: 'paid', label: `✓ Paid/Done (${repairBookings.filter((r) => r.quotation_status === 'paid' || r.status === 'paid').length})` },
              { id: 'declined', label: `❌ Declined (${repairBookings.filter((r) => r.quotation_status === 'vendor_declined' || r.quotation_status === 'user_rejected').length})` },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setRepairFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  repairFilter === f.id
                    ? 'bg-[#344257] text-white shadow-xs'
                    : 'bg-white text-ink-600 hover:bg-ink-50 border border-ink-200/60'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {repairBookings
            .filter((r) => {
              if (repairFilter === 'pending_quote') return r.quotation_status === 'quoted';
              if (repairFilter === 'admin_approved') return r.quotation_status === 'admin_approved';
              if (repairFilter === 'paid') return r.quotation_status === 'paid' || r.status === 'paid';
              if (repairFilter === 'declined') return r.quotation_status === 'vendor_declined' || r.quotation_status === 'user_rejected';
              return true;
            })
            .map((r) => {
              const currentVendor = vendors.find((v) => (v.id && String(v.id) === String(r.assigned_vendor_id)) || (v._id && String(v._id) === String(r.assigned_vendor_id)));
              const vendorName = currentVendor?.business_name || currentVendor?.full_name || (r as any).assigned_vendor_name || 'Vendor Partner';
              const isQuoted = r.quotation_status === 'quoted';
              const isAdminApproved = r.quotation_status === 'admin_approved';
              const isPaid = r.quotation_status === 'paid' || r.status === 'paid';
              const isVendorDeclined = r.quotation_status === 'vendor_declined';

              return (
                <div
                  key={r.id}
                  className={`card p-6 rounded-2xl bg-white shadow-xs border transition space-y-4 ${
                    isQuoted ? 'border-2 border-purple-300 ring-2 ring-purple-100' : 'border-ink-100'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-ink-100">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="badge bg-purple-50 text-purple-700 font-bold">Repair #{r.tracking_id || r.id.slice(0, 8)}</span>
                        {isPaid ? (
                          <span className="badge bg-emerald-600 text-white font-bold text-[10px]">
                            ✓ Paid by Customer
                          </span>
                        ) : isAdminApproved ? (
                          <span className="badge bg-blue-600 text-white font-bold text-[10px]">
                            ✓ Approved by Admin ({formatINR(r.vendor_quotation_amount || 0)}) — Sent to Customer
                          </span>
                        ) : isQuoted ? (
                          <span className="badge bg-purple-600 text-white font-black text-[10px] animate-pulse">
                            ⚡ Quoted by Vendor: {formatINR(r.vendor_quotation_amount || 0)} (Awaiting Verification)
                          </span>
                        ) : isVendorDeclined ? (
                          <span className="badge bg-rose-600 text-white font-bold text-[10px]">
                            ❌ Vendor Declined Repair — Please Reassign
                          </span>
                        ) : r.assigned_vendor_id ? (
                          <span className="badge bg-purple-50 text-purple-700 font-bold text-[10px]">
                            Assigned to {vendorName}
                          </span>
                        ) : (
                          <span className="badge bg-ink-100 text-ink-800 text-[10px] font-bold">
                            Platform Technician
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-ink-500 mt-1">
                        Problem: <strong className="text-rose-700">{r.problem}</strong> on {r.brand} {r.model} · Area: {r.pickup_area || 'Doorstep Service'}
                      </p>
                    </div>

                    {/* Vendor Assignment Dropdown */}
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold text-ink-700">Assign / Reassign:</label>
                      <select
                        value={currentVendor ? (currentVendor.id || currentVendor._id) : (r.assigned_vendor_id || '')}
                        onChange={(e) => handleAssignRepairToVendor(r.id, e.target.value)}
                        className="input py-1 px-3 text-xs font-bold text-purple-900 border-purple-300"
                      >
                        <option value="">-- Platform Technician --</option>
                        {vendors.map((v) => {
                          const vId = v.id || v._id;
                          return (
                            <option key={vId} value={vId}>
                              {v.business_name || v.full_name} ({v.phone || 'Store'})
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-purple-50/50 p-3 rounded-xl border border-purple-100">
                    <div>
                      Vendor Quotation:{' '}
                      <strong className={isQuoted ? 'text-purple-800 font-black' : ''}>
                        {r.vendor_quotation_amount ? formatINR(r.vendor_quotation_amount) : 'Pending Upload'}
                      </strong>
                    </div>
                    <div>10% Platform Commission: <strong>{r.vendor_quotation_amount ? formatINR(Math.round(r.vendor_quotation_amount * 0.10)) : '-'}</strong></div>
                    <div>Vendor Net Payout (90%): <strong>{r.vendor_quotation_amount ? formatINR(Math.round(r.vendor_quotation_amount * 0.90)) : '-'}</strong></div>
                  </div>

                  {r.vendor_quotation_details && (
                    <div className="text-xs bg-purple-50/40 p-2.5 rounded-xl border border-purple-100 text-purple-900">
                      <strong>Quotation Breakdown:</strong> "{r.vendor_quotation_details}"
                    </div>
                  )}

                  {/* Verification Actions for Admin */}
                  {isQuoted && (
                    <div className="flex items-center justify-between gap-3 pt-2 border-t border-ink-100 flex-wrap bg-purple-50/40 p-2.5 rounded-xl">
                      <span className="text-xs font-bold text-purple-900">
                        ⚡ Action Required: Verify Repair Quotation
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleApproveRepairQuote(r.id, r.vendor_quotation_amount || 0)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5" /> Approve Cost ({formatINR(r.vendor_quotation_amount || 0)})
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOverrideModal({
                              type: 'repair',
                              id: r.id,
                              brand: r.brand,
                              model: r.model,
                              currentPrice: r.vendor_quotation_amount || r.estimated_cost || 0,
                              vendorName: currentVendor?.business_name || currentVendor?.full_name || undefined,
                            });
                            setOverridePriceInput(String(r.vendor_quotation_amount || r.estimated_cost || ''));
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" /> Override
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectRepairQuote(r.id)}
                          className="px-3 py-1.5 bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 text-xs font-bold rounded-xl transition cursor-pointer"
                        >
                          Reject Quote
                        </button>
                      </div>
                    </div>
                  )}
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
                placeholder="e.g. Doorstep Mobile Care"
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
                placeholder="vendor@doorstep.com"
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

      {/* ── ADMIN PRICE OVERRIDE & APPROVAL MODAL ── */}
      {overrideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 backdrop-blur-xs p-4">
          <div className="card w-full max-w-md p-6 bg-white rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-ink-100">
              <h3 className="font-display font-bold text-ink-900 flex items-center gap-2 text-sm">
                <Edit2 className="h-4 w-4 text-blue-600" />
                Override & Approve {overrideModal.type === 'sell' ? 'Valuation Price' : 'Repair Cost'}
              </h3>
              <button
                type="button"
                onClick={() => setOverrideModal(null)}
                className="text-ink-400 hover:text-ink-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3 bg-blue-50/60 rounded-xl space-y-1 text-xs border border-blue-100">
              <p>Device: <strong>{overrideModal.brand} {overrideModal.model}</strong></p>
              {overrideModal.vendorName && <p>Assigned Vendor: <strong>{overrideModal.vendorName}</strong></p>}
              <p>Current Quoted Amount: <strong className="text-blue-900">{formatINR(overrideModal.currentPrice)}</strong></p>
            </div>

            <div>
              <label className="text-xs font-bold text-ink-700">
                Verified Final {overrideModal.type === 'sell' ? 'Valuation Amount' : 'Repair Cost'} (₹)
              </label>
              <input
                type="number"
                value={overridePriceInput}
                onChange={(e) => setOverridePriceInput(e.target.value)}
                placeholder="e.g. 7500"
                className="input mt-1 text-sm font-black text-ink-900"
                autoFocus
              />
              <p className="text-[11px] text-ink-500 mt-1">
                This verified price will be approved by Admin and immediately sent to the customer dashboard for acceptance.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-ink-100">
              <button
                type="button"
                onClick={() => setOverrideModal(null)}
                className="btn-outline text-xs px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveOverridePrice}
                disabled={overrideSubmitting}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="h-4 w-4" />
                {overrideSubmitting ? 'Saving...' : 'Approve Verified Price'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
