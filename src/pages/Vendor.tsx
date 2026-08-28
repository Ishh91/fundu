import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Smartphone, Package, Plus, Edit2, Trash2, X, ShoppingCart, CreditCard,
  Building2, CheckCircle2, FileText, MapPin, ShieldCheck, Check, TrendingUp,
  Printer, MessageSquare, Truck, Sparkles, Clock, ExternalLink, Wrench, AlertCircle,
  Eye, IndianRupee, UserCheck, DollarSign
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Product, SparePart, WholesaleInventory, WholesaleOrder, VendorLedger, SellRequest, RepairBooking } from '../types';
import { PHONE_BRANDS } from '../types';
import { db, formatINR } from '../lib/db';
import CustomerDetailsModal from '../components/CustomerDetailsModal';

export default function Vendor() {
  const { user, profile, loading, refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();

  // Active Main Tab State
  const [activeTab, setActiveTab] = useState<'sell-leads' | 'repair-leads' | 'wallet-khata' | 'b2b-procurement' | 'store-supply'>('sell-leads');

  // Vendor Assigned Leads Data
  const [assignedSellLeads, setAssignedSellLeads] = useState<SellRequest[]>([]);
  const [assignedRepairLeads, setAssignedRepairLeads] = useState<RepairBooking[]>([]);

  // B2B Catalog & Orders
  const [inventory, setInventory] = useState<WholesaleInventory[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [cart, setCart] = useState<WholesaleInventory[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'cash'>('credit');
  const [orderSubmitting, setOrderSubmitting] = useState(false);

  // Khata & Orders State
  const [ledgers, setLedgers] = useState<VendorLedger[]>([]);
  const [wholesaleOrders, setWholesaleOrders] = useState<WholesaleOrder[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Modal States for Vendor Actions
  // 1. Mobile Physical Valuation Quote Modal
  const [sellQuoteModal, setSellQuoteModal] = useState<SellRequest | null>(null);
  const [sellValuationPrice, setSellValuationPrice] = useState('');
  const [sellInspectionNotes, setSellInspectionNotes] = useState('');
  const [sellQuoteSubmitting, setSellQuoteSubmitting] = useState(false);

  // 2. Repair Quotation Upload Modal
  const [repairQuoteModal, setRepairQuoteModal] = useState<RepairBooking | null>(null);
  const [repairQuotationAmount, setRepairQuotationAmount] = useState('');
  const [repairQuotationDetails, setRepairQuotationDetails] = useState('');
  const [repairQuoteSubmitting, setRepairQuoteSubmitting] = useState(false);

  // 3. Customer Profile Inspection Modal
  const [customerModalData, setCustomerModalData] = useState<any>(null);

  // Supply Parts & Products State
  const [supplyTab, setSupplyTab] = useState<'products' | 'spare-parts'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);

  // Authentication check
  useEffect(() => {
    if (!loading && !user) navigate('/vendor-login?redirect=/vendor');
    if (!loading && user && profile && profile.role !== 'vendor' && profile.role !== 'wholesaler' && profile.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [loading, user, profile, navigate]);

  // Fetch Vendor Assigned Data & General Catalogs
  const fetchData = async () => {
    if (!user) return;
    setDataLoading(true);
    try {
      const [sellRes, repairRes, invRes, ledgerRes, ordersRes, pRes, spRes] = await Promise.all([
        db.from('sell_requests').select('*').eq('assigned_vendor_id', user.id).order('created_at', { ascending: false }),
        db.from('repair_bookings').select('*').eq('assigned_vendor_id', user.id).order('created_at', { ascending: false }),
        db.from('wholesale_inventories').select('*').order('created_at', { ascending: false }),
        db.from('vendor_ledgers').select('*').eq('vendor_id', user.id).order('created_at', { ascending: false }),
        db.from('wholesale_orders').select('*').eq('vendor_id', user.id).order('created_at', { ascending: false }),
        db.from('products').select('*').eq('seller_id', user.id).order('created_at', { ascending: false }),
        db.from('spare_parts').select('*').eq('seller_id', user.id).order('created_at', { ascending: false }),
      ]);

      setAssignedSellLeads((sellRes.data as SellRequest[]) ?? []);
      setAssignedRepairLeads((repairRes.data as RepairBooking[]) ?? []);
      setInventory((invRes.data as WholesaleInventory[]) ?? []);
      setLedgers((ledgerRes.data as VendorLedger[]) ?? []);
      setWholesaleOrders((ordersRes.data as WholesaleOrder[]) ?? []);
      setProducts((pRes.data as Product[]) ?? []);
      setSpareParts((spRes.data as SparePart[]) ?? []);
    } catch (err) {
      console.warn('Error fetching vendor data:', err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Calculations for Khata / Credit
  const creditLimit = profile?.credit_limit || 200000;
  const outstandingBalance = profile?.outstanding_balance || 0;
  const availableCredit = Math.max(0, creditLimit - outstandingBalance);
  const cartTotal = cart.reduce((sum, item) => sum + (item.wholesale_price || 0), 0);

  // Submit Valuation Quote for Physical Mobile Inspection
  const handleSubmitSellValuation = async () => {
    if (!sellQuoteModal || !sellValuationPrice) return;
    const priceNum = Number(sellValuationPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Please enter a valid price valuation amount.');
      return;
    }

    setSellQuoteSubmitting(true);
    try {
      const { error } = await db.from('sell_requests').update({
        vendor_quote_price: priceNum,
        vendor_notes: sellInspectionNotes || 'Physical inspection completed by Vendor.',
        vendor_quote_status: 'quoted',
        status: 'quoted_by_vendor',
      }).eq('id', sellQuoteModal.id);

      if (error) throw error;

      alert(`✅ Valuation quote of ${formatINR(priceNum)} submitted for customer mobile (${sellQuoteModal.brand} ${sellQuoteModal.model}). Customer can now accept on their dashboard!`);
      setSellQuoteModal(null);
      setSellValuationPrice('');
      setSellInspectionNotes('');
      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to submit sell valuation');
    } finally {
      setSellQuoteSubmitting(false);
    }
  };

  // Upload Quotation for Repair Request
  const handleSubmitRepairQuotation = async () => {
    if (!repairQuoteModal || !repairQuotationAmount) return;
    const amountNum = Number(repairQuotationAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid repair quotation amount.');
      return;
    }

    setRepairQuoteSubmitting(true);
    try {
      const { error } = await db.from('repair_bookings').update({
        vendor_quotation_amount: amountNum,
        vendor_quotation_details: repairQuotationDetails || 'Repair quotation uploaded by Vendor.',
        quotation_status: 'quoted',
        status: 'quoted_by_vendor',
      }).eq('id', repairQuoteModal.id);

      if (error) throw error;

      alert(`✅ Repair quotation of ${formatINR(amountNum)} uploaded for ${repairQuoteModal.brand} ${repairQuoteModal.model}. Customer can now review & pay on their dashboard!`);
      setRepairQuoteModal(null);
      setRepairQuotationAmount('');
      setRepairQuotationDetails('');
      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to upload repair quotation');
    } finally {
      setRepairQuoteSubmitting(false);
    }
  };

  // Cart Functions
  const toggleCartItem = (item: WholesaleInventory) => {
    if (cart.some((c) => c.id === item.id)) {
      setCart((prev) => prev.filter((c) => c.id !== item.id));
    } else {
      setCart((prev) => [...prev, item]);
    }
  };

  // Place B2B Wholesale Order
  const handlePlaceOrder = async () => {
    if (!user || cart.length === 0) return;
    if (paymentMethod === 'credit' && cartTotal > availableCredit) {
      alert(`Order total (${formatINR(cartTotal)}) exceeds available credit (${formatINR(availableCredit)}). Please choose Spot Cash or pay existing dues.`);
      return;
    }

    setOrderSubmitting(true);
    try {
      const orderData = {
        vendor_id: user.id,
        vendor_name: profile?.full_name || profile?.business_name || 'Lucknow Mobile Vendor',
        vendor_phone: profile?.phone || '+91 98391 00000',
        business_name: profile?.business_name || 'Lucknow Partner Store',
        items: cart.map((item) => ({
          inventory_id: item.id,
          brand: item.brand,
          model: item.model,
          storage: item.storage,
          condition: item.condition,
          quantity: 1,
          unit_price: item.wholesale_price,
          total_price: item.wholesale_price,
          imei: item.imei,
        })),
        total_amount: cartTotal,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'credit' ? 'credit_due' : 'paid',
        status: 'confirmed',
        delivery_address: profile?.vendor_location || 'Fundu Lucknow Central Hub (Self Pickup / Delivery Executive)',
        notes: `Vendor Lot Order for ${cart.length} used phone(s)`,
      };

      const { error } = await db.from('wholesale_orders').insert(orderData).select('*').single();
      if (error) throw error;

      alert(`Wholesale Order Confirmed!\nOrder Total: ${formatINR(cartTotal)}\nPayment: ${paymentMethod === 'credit' ? 'Fundu Credit (Khata)' : 'Spot Cash'}`);
      setCart([]);
      setIsCartOpen(false);
      await refreshProfile?.();
      await fetchData();
      setActiveTab('wallet-khata');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to place wholesale order');
    } finally {
      setOrderSubmitting(false);
    }
  };

  // Filtered inventory
  const filteredInventory = inventory.filter((item) => {
    const isAvail = item.status === 'available' || !item.status;
    const matchesBrand = selectedBrand === 'All' || item.brand.toLowerCase() === selectedBrand.toLowerCase();
    return isAvail && matchesBrand;
  });

  if (loading || !user) {
    return <div className="container-page py-20 text-center text-ink-500 font-bold">Loading Vendor Portal...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f4f7f8] pb-24">
      {/* Standalone Vendor Top Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#0f172a] text-white shadow-md">
        <div className="container-page flex items-center justify-between py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 font-extrabold text-white text-lg shadow-sm">
              F
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white">
                Fundu <span className="text-brand-400 text-xs uppercase px-2.5 py-0.5 rounded-full bg-brand-900/60 font-bold border border-brand-700">Official Vendor Portal</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium">Lucknow Mobile Buyback & Repair Network</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-200">{profile?.business_name || profile?.full_name || 'Vendor Partner'}</span>
              <span className="text-[10px] text-emerald-400 font-semibold">10% Platform Commission Active</span>
            </div>
            <button
              onClick={() => signOut()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-rose-900/50 hover:text-rose-200 border border-slate-700 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Top Vendor Info Banner */}
      <div className="bg-white border-b border-[#e5ecef] py-6">
        <div className="container-page">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
                <Building2 className="h-3.5 w-3.5" /> Official Vendor Hub · Lucknow
              </div>
              <h1 className="mt-2 font-display text-2xl md:text-3xl font-extrabold text-ink-900">
                {profile?.business_name && profile.business_name !== 'Fundu Admin'
                  ? `${profile.business_name} Vendor Portal`
                  : 'Fundu Partner Vendor Portal'}
              </h1>
              <p className="mt-1 text-xs md:text-sm text-ink-500 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                Location: {profile?.vendor_location || 'Lucknow Store'} · Buyback & Repair Lead Handling
              </p>
            </div>

            {/* Credit Limit & Balance Summary Card */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-emerald-50/80 p-3 rounded-2xl border border-emerald-200">
                <p className="text-[10px] font-bold uppercase text-emerald-700">Available Limit</p>
                <p className="font-display text-lg font-black text-emerald-800">{formatINR(availableCredit)}</p>
                <p className="text-[10px] text-emerald-600">Limit: {formatINR(creditLimit)}</p>
              </div>
              <div className="bg-amber-50/80 p-3 rounded-2xl border border-amber-200">
                <p className="text-[10px] font-bold uppercase text-amber-700">Outstanding Balance</p>
                <p className="font-display text-lg font-black text-amber-800">{formatINR(outstandingBalance)}</p>
                <p className="text-[10px] text-amber-600">Used for Buyback Payouts</p>
              </div>
              <div className="col-span-2 sm:col-span-1 bg-brand-50/80 p-3 rounded-2xl border border-brand-200 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase text-brand-700">Platform Rate</p>
                  <p className="font-bold text-xs text-brand-900 flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-brand-600" /> 10% Flat Commission
                  </p>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="mt-2 bg-brand-600 text-white rounded-lg py-1 px-2 text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs"
                  >
                    <ShoppingCart className="h-3 w-3" /> Lot Cart ({cart.length})
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main Vendor Navigation Tabs - Responsive 4-Column Card Grid */}
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-2.5 border-b border-ink-100 pb-4">
            {[
              {
                id: 'sell-leads',
                label: '1. Buyback Leads',
                sublabel: 'Customer Sell Requests',
                icon: Smartphone,
                badge: `${assignedSellLeads.filter((s) => s.vendor_quote_status !== 'completed').length} Pending`,
              },
              {
                id: 'repair-leads',
                label: '2. Repair Leads',
                sublabel: 'Quotes & Doorstep Repairs',
                icon: Wrench,
                badge: `${assignedRepairLeads.filter((r) => r.quotation_status !== 'paid').length} Pending`,
              },
              {
                id: 'wallet-khata',
                label: '3. Wallet & Khata',
                sublabel: '10% Commission Ledger',
                icon: CreditCard,
                badge: outstandingBalance > 0 ? `₹${outstandingBalance.toLocaleString('en-IN')}` : 'Clear',
              },
              {
                id: 'b2b-procurement',
                label: '4. Buy Phone Lots',
                sublabel: 'Bulk Wholesale Catalog',
                icon: Package,
                badge: `${filteredInventory.length} In Hub`,
              },
            ].map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`flex items-center justify-between gap-2 p-3 sm:p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                      : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-2 rounded-xl shrink-0 ${isActive ? 'bg-brand-500 text-slate-950 font-black' : 'bg-slate-100 text-slate-600'}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-extrabold text-xs sm:text-sm truncate">{t.label}</p>
                      <p className={`text-[10px] font-medium truncate ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>{t.sublabel}</p>
                    </div>
                  </div>
                  {t.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-black shrink-0 ${
                        isActive ? 'bg-brand-400 text-slate-950' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {t.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container-page mt-8">
        {/* ── TAB 1: MOBILE BUYBACK LEADS (PHYSICAL CHECK & VALUATION) ── */}
        {activeTab === 'sell-leads' && (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="card p-6 rounded-[28px] bg-gradient-to-r from-blue-600/10 via-brand-500/10 to-emerald-500/10 border border-blue-200/60 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-800">
                  <Smartphone className="h-3.5 w-3.5" /> Task 1: Mobile Sell Forwarded Leads
                </div>
                <h2 className="mt-2 font-display text-2xl font-black text-ink-900">
                  Customer Mobile Physical Inspection & Valuation
                </h2>
                <p className="mt-1 text-xs text-ink-600">
                  Receive customer details & product specifications. Perform physical device check, input price valuation. Upon user acceptance, payment is processed via website using your Vendor Limit (10% Commission logged).
                </p>
              </div>

              <div className="bg-white/90 p-3 rounded-2xl border border-blue-200 shadow-xs text-center min-w-[120px]">
                <p className="text-[10px] font-bold uppercase text-ink-500">Total Leads Assigned</p>
                <p className="font-display text-xl font-black text-blue-800">{assignedSellLeads.length}</p>
              </div>
            </div>

            {/* Sell Leads List */}
            {dataLoading ? (
              <div className="card p-12 text-center text-ink-500 font-bold">Loading Assigned Buyback Leads...</div>
            ) : assignedSellLeads.length === 0 ? (
              <div className="card p-12 text-center bg-white rounded-2xl space-y-3">
                <Smartphone className="h-10 w-10 text-ink-300 mx-auto" />
                <h3 className="font-display font-bold text-ink-800 text-lg">No Mobile Sell Leads Assigned Yet</h3>
                <p className="text-xs text-ink-500 max-w-md mx-auto">
                  When Fundu Admin forwards customer mobile sell requests to your shop, they will appear here. Click below to generate a test lead for demonstration:
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    const { error } = await db.from('sell_requests').insert({
                      brand: 'Apple',
                      model: 'iPhone 13',
                      storage: '128GB',
                      condition: 'Excellent',
                      estimated_price: 32500,
                      customer_name: 'Siddharth Roy',
                      customer_phone: '+91 98391 88990',
                      pickup_address: 'Hazratganj Main Market, Lucknow',
                      pickup_area: 'Hazratganj',
                      assigned_vendor_id: user.id,
                      status: 'assigned',
                    });
                    if (error) alert(error.message);
                    else fetchData();
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-black text-xs shadow-md transition cursor-pointer"
                >
                  ⚡ Assign Real Test Buyback Lead to My Store
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {assignedSellLeads.map((lead) => {
                  const isQuoted = lead.vendor_quote_status === 'quoted';
                  const isAccepted = lead.vendor_quote_status === 'user_accepted' || lead.status === 'completed';
                  const isRejected = lead.vendor_quote_status === 'user_rejected';

                  return (
                    <div key={lead.id} className="card p-6 rounded-2xl bg-white shadow-xs border border-ink-100 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-ink-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="badge bg-brand-50 text-brand-700 font-bold">Lead #{lead.id.slice(0, 8).toUpperCase()}</span>
                            <span
                              className={`badge capitalize text-[10px] font-bold ${
                                isAccepted
                                  ? 'bg-emerald-600 text-white'
                                  : isQuoted
                                  ? 'bg-blue-600 text-white'
                                  : isRejected
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-amber-500 text-white'
                              }`}
                            >
                              {isAccepted
                                ? '✓ Accepted by User (Bought via Limit)'
                                : isQuoted
                                ? `Quoted: ${formatINR(lead.vendor_quote_price || 0)}`
                                : isRejected
                                ? 'User Declined Quote'
                                : 'Pending Physical Check'}
                            </span>
                          </div>
                          <p className="text-xs text-ink-500 mt-1">
                            Submitted on {new Date(lead.created_at).toLocaleDateString('en-IN')} · Est. Online Value: <strong>{formatINR(lead.estimated_price || 0)}</strong>
                          </p>
                        </div>

                        {/* Valuation Action Button */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setCustomerModalData({ ...lead, type: 'sell' })}
                            className="btn-outline text-xs px-3 py-1.5 text-teal-700 border-teal-200 hover:bg-teal-50 flex items-center gap-1.5 font-bold rounded-xl"
                          >
                            <Eye className="h-3.5 w-3.5 text-teal-600" /> Customer Details
                          </button>
                          {!isAccepted && (
                            <button
                              onClick={() => {
                                setSellQuoteModal(lead);
                                setSellValuationPrice(String(lead.vendor_quote_price || lead.estimated_price || ''));
                                setSellInspectionNotes(lead.vendor_notes || '');
                              }}
                              className="btn-primary text-xs px-4 py-2 font-bold flex items-center gap-1.5"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                              {isQuoted ? 'Update Valuation' : 'Physical Check & Quote'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Product Details & User Contact Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Device Info */}
                        <div className="bg-ink-50 p-4 rounded-xl border border-ink-100 space-y-2 text-xs">
                          <h4 className="font-bold text-ink-900 flex items-center gap-1.5 text-sm">
                            <Smartphone className="h-4 w-4 text-brand-600" /> {lead.brand} {lead.model}
                          </h4>
                          <div className="grid grid-cols-2 gap-2 text-ink-700">
                            <div>RAM/Storage: <strong>{lead.ram || '-'} / {lead.storage || '-'}</strong></div>
                            <div>Condition: <strong>{lead.condition}</strong></div>
                            <div>IMEI: <strong className="font-mono">{lead.imei || 'Not provided'}</strong></div>
                            <div>Accessories: <strong>{lead.accessories?.join(', ') || 'Phone only'}</strong></div>
                          </div>
                          {lead.diagnostics && (
                            <div className="pt-2 border-t border-ink-200/60 text-[11px] text-ink-600">
                              Screen Touch: {lead.diagnostics.screen_touch ? '✓ OK' : '❌ Issue'} · Cameras: {lead.diagnostics.cameras ? '✓ OK' : '❌ Issue'} · Battery: {lead.diagnostics.battery_health || 'Normal'}
                            </div>
                          )}
                        </div>

                        {/* Customer Contact & Address Info */}
                        <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100 space-y-2 text-xs">
                          <h4 className="font-bold text-blue-900 flex items-center gap-1.5 text-sm">
                            <UserCheck className="h-4 w-4 text-blue-700" /> Customer Details
                          </h4>
                          <p className="text-ink-800">Address: <strong>{lead.pickup_address || 'Lucknow Pickup'}</strong> ({lead.pickup_area})</p>
                          <p className="text-ink-800">Slot: <strong>{lead.pickup_date || 'Today'} ({lead.pickup_slot || 'Anytime'})</strong></p>
                          {lead.pickup_person_phone && (
                            <p className="text-ink-800 font-semibold text-blue-800">Phone: {lead.pickup_person_phone}</p>
                          )}
                          {lead.vendor_notes && (
                            <div className="pt-2 border-t border-blue-200 text-[11px] text-blue-900 font-medium italic">
                              Vendor Note: "{lead.vendor_notes}"
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 10% Commission Summary Banner if Accepted */}
                      {isAccepted && lead.vendor_quote_price && (
                        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex flex-wrap items-center justify-between gap-2 text-emerald-900">
                          <div>
                            <span className="font-bold">✓ Phone Purchased via Vendor Limit: {formatINR(lead.vendor_quote_price)}</span>
                            <p className="text-[11px] text-emerald-700 mt-0.5">
                              Platform 10% Commission Fee: <strong>{formatINR(Math.round(lead.vendor_quote_price * 0.10))}</strong> (Logged in Vendor Ledger)
                            </p>
                          </div>
                          <span className="badge bg-emerald-600 text-white text-[10px] font-bold">Transaction Complete</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: REPAIR LEADS & QUOTATIONS (LOCATION-BASED) ── */}
        {activeTab === 'repair-leads' && (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="card p-6 rounded-[28px] bg-gradient-to-r from-purple-600/10 via-brand-500/10 to-teal-500/10 border border-purple-200/60 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-black text-purple-800">
                  <Wrench className="h-3.5 w-3.5" /> Task 2: Nearby Location Repair Requests
                </div>
                <h2 className="mt-2 font-display text-2xl font-black text-ink-900">
                  Repair Lead Assignment & Quotation Upload
                </h2>
                <p className="mt-1 text-xs text-ink-600">
                  Customer repair requests near your location are routed to your shop. Inspect the issue, upload your repair quotation (parts + labor). User pays on the website (10% Commission deducted, 90% credited to your Vendor balance).
                </p>
              </div>

              <div className="bg-white/90 p-3 rounded-2xl border border-purple-200 shadow-xs text-center min-w-[120px]">
                <p className="text-[10px] font-bold uppercase text-ink-500">Repair Leads</p>
                <p className="font-display text-xl font-black text-purple-800">{assignedRepairLeads.length}</p>
              </div>
            </div>

            {/* Repair Leads List */}
            {dataLoading ? (
              <div className="card p-12 text-center text-ink-500 font-bold">Loading Assigned Repair Leads...</div>
            ) : assignedRepairLeads.length === 0 ? (
              <div className="card p-12 text-center bg-white rounded-2xl">
                <Wrench className="h-10 w-10 text-ink-300 mx-auto" />
                <h3 className="mt-3 font-display font-bold text-ink-800">No Repair Requests Assigned Yet</h3>
                <p className="text-xs text-ink-500 mt-1">Repair requests near your shop address ({profile?.vendor_location || 'Lucknow'}) will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignedRepairLeads.map((repair) => {
                  const isQuoted = repair.quotation_status === 'quoted';
                  const isPaid = repair.quotation_status === 'paid' || repair.quotation_status === 'user_accepted' || repair.status === 'paid';

                  return (
                    <div key={repair.id} className="card p-6 rounded-2xl bg-white shadow-xs border border-ink-100 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-ink-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="badge bg-brand-50 text-brand-700 font-bold">Repair #{repair.tracking_id || repair.id.slice(0, 8)}</span>
                            <span
                              className={`badge capitalize text-[10px] font-bold ${
                                isPaid
                                  ? 'bg-emerald-600 text-white'
                                  : isQuoted
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-amber-500 text-white'
                              }`}
                            >
                              {isPaid
                                ? '✓ Paid by User (90% Credited to Vendor)'
                                : isQuoted
                                ? `Quotation Uploaded: ${formatINR(repair.vendor_quotation_amount || 0)}`
                                : 'Pending Repair Quotation'}
                            </span>
                          </div>
                          <p className="text-xs text-ink-500 mt-1">
                            Booked on {new Date(repair.created_at).toLocaleDateString('en-IN')} · Customer Area: <strong>{repair.pickup_area || 'Lucknow'}</strong>
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setCustomerModalData({ ...repair, type: 'repair' })}
                            className="btn-outline text-xs px-3 py-1.5 text-teal-700 border-teal-200 hover:bg-teal-50 flex items-center gap-1.5 font-bold rounded-xl"
                          >
                            <Eye className="h-3.5 w-3.5 text-teal-600" /> Customer Details
                          </button>
                          {!isPaid && (
                            <button
                              onClick={() => {
                                setRepairQuoteModal(repair);
                                setRepairQuotationAmount(String(repair.vendor_quotation_amount || repair.estimated_cost || ''));
                                setRepairQuotationDetails(repair.vendor_quotation_details || '');
                              }}
                              className="btn-primary bg-purple-600 hover:bg-purple-700 text-xs flex items-center gap-1.5 px-4 py-2 font-bold"
                            >
                              <FileText className="h-4 w-4" /> {isQuoted ? 'Update Quotation' : 'Upload Repair Quotation'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Problem & Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-ink-50 p-4 rounded-xl border border-ink-100 space-y-2 text-xs">
                          <h4 className="font-bold text-ink-900 flex items-center gap-1.5 text-sm">
                            <Wrench className="h-4 w-4 text-purple-600" /> Device & Problem
                          </h4>
                          <p className="text-ink-800">Phone: <strong>{repair.brand} {repair.model}</strong></p>
                          <p className="text-ink-800">Reported Problem: <strong className="text-rose-700">{repair.problem}</strong></p>
                          {repair.problem_detail && (
                            <p className="text-ink-600 text-[11px] italic">"{repair.problem_detail}"</p>
                          )}
                        </div>

                        <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-100 space-y-2 text-xs">
                          <h4 className="font-bold text-purple-900 flex items-center gap-1.5 text-sm">
                            <UserCheck className="h-4 w-4 text-purple-700" /> Customer Location
                          </h4>
                          <p className="text-ink-800">Address: <strong>{repair.pickup_address || 'Customer Store Visit'}</strong></p>
                          <p className="text-ink-800">Date/Slot: <strong>{repair.pickup_date || 'Today'} ({repair.pickup_slot || 'Anytime'})</strong></p>
                          {repair.vendor_quotation_details && (
                            <div className="pt-2 border-t border-purple-200 text-[11px] text-purple-900 font-medium">
                              Quotation Specs: "{repair.vendor_quotation_details}"
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 10% Commission Summary Banner for Paid Repair */}
                      {isPaid && repair.vendor_quotation_amount && (
                        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex flex-wrap items-center justify-between gap-2 text-emerald-900">
                          <div>
                            <span className="font-bold">✓ Total Repair Payment Received: {formatINR(repair.vendor_quotation_amount)}</span>
                            <p className="text-[11px] text-emerald-700 mt-0.5">
                              Platform 10% Commission: <strong>{formatINR(Math.round(repair.vendor_quotation_amount * 0.10))}</strong> · Vendor Net Earning (90%): <strong>{formatINR(Math.round(repair.vendor_quotation_amount * 0.90))}</strong>
                            </p>
                          </div>
                          <span className="badge bg-emerald-600 text-white text-[10px] font-bold">Payout Credited</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: VENDOR WALLET & 10% COMMISSION LEDGER ── */}
        {activeTab === 'wallet-khata' && (
          <div className="space-y-6">
            {/* Big Wallet Banner */}
            <div className="card p-6 md:p-8 rounded-[28px] bg-gradient-to-r from-ink-900 via-brand-950 to-teal-950 text-white shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <span className="badge bg-white/20 text-white text-xs font-bold">Lucknow Vendor Limit & Wallet</span>
                  <h2 className="mt-2 font-display text-2xl md:text-3xl font-black">
                    Vendor Credit Limit & Commission Account
                  </h2>
                  <p className="mt-1 text-xs text-white/80 max-w-xl">
                    Track website credit limit usage for mobile buybacks, 90% repair job earnings, and 10% platform commissions. Double-entry transparent logs.
                  </p>
                </div>
                <div className="text-left md:text-right bg-white/10 p-4 rounded-2xl backdrop-blur-xs border border-white/20">
                  <p className="text-xs font-bold uppercase tracking-wider text-teal-200">Current Outstanding Balance</p>
                  <p className="mt-1 font-display text-3xl font-black text-white">{formatINR(outstandingBalance)}</p>
                  <p className="text-[11px] text-white/70 mt-1">Available Credit Limit: {formatINR(availableCredit)}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span>Credit Limit Utilized ({Math.round((outstandingBalance / (creditLimit || 1)) * 100)}%)</span>
                  <span>Approved Limit: {formatINR(creditLimit)}</span>
                </div>
                <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 transition-all rounded-full"
                    style={{ width: `${Math.min(100, Math.round((outstandingBalance / (creditLimit || 1)) * 100))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Ledger Transactions Table */}
            <div className="card p-6 rounded-2xl bg-white shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-ink-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-brand-600" /> Vendor Ledger & Commission History
                </h3>
                <span className="text-xs text-ink-500 font-semibold">{ledgers.length} Records</span>
              </div>

              {ledgers.length === 0 ? (
                <div className="p-8 text-center text-ink-500 text-xs font-medium">
                  No ledger transactions recorded yet. When mobile buybacks, repair earnings, or cash settlements occur, entries will appear here.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-ink-100 text-ink-400 font-bold uppercase text-[10px]">
                        <th className="py-3 px-2">Date</th>
                        <th className="py-3 px-2">Type</th>
                        <th className="py-3 px-2">Reference ID</th>
                        <th className="py-3 px-2">Remarks / Details</th>
                        <th className="py-3 px-2 text-right">Amount</th>
                        <th className="py-3 px-2 text-right">Balance After</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-50">
                      {ledgers.map((l) => (
                        <tr key={l.id} className="hover:bg-ink-50/50">
                          <td className="py-3 px-2 font-medium text-ink-600">
                            {new Date(l.created_at).toLocaleDateString('en-IN')}
                          </td>
                          <td className="py-3 px-2">
                            <span
                              className={`badge text-[10px] font-bold ${
                                l.type === 'sell_commission_fee' || l.type === 'repair_commission_fee'
                                  ? 'bg-purple-100 text-purple-800'
                                  : l.type === 'repair_earning' || l.type === 'cash_repayment'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {l.type.replace(/_/g, ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-2 font-mono font-semibold text-ink-700">
                            {l.reference_order_id ? `#${l.reference_order_id.slice(0, 8)}` : 'N/A'}
                          </td>
                          <td className="py-3 px-2 font-medium text-ink-600">{l.notes || l.payment_mode}</td>
                          <td
                            className={`py-3 px-2 text-right font-bold ${
                              l.type === 'repair_earning' || l.type === 'cash_repayment'
                                ? 'text-emerald-600'
                                : 'text-amber-600'
                            }`}
                          >
                            {l.type === 'repair_earning' || l.type === 'cash_repayment' ? '+' : '-'} {formatINR(l.amount)}
                          </td>
                          <td className="py-3 px-2 text-right font-black text-ink-900">
                            {formatINR(l.balance_after)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 4: B2B BULK LOT PROCUREMENT CATALOG ── */}
        {activeTab === 'b2b-procurement' && (
          <div className="space-y-6">
            <div className="card p-4 rounded-2xl bg-white flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
                <span className="text-xs font-bold text-ink-500 shrink-0">Brand:</span>
                {['All', 'Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Realme', 'Vivo', 'Oppo'].map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBrand(b)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition ${
                      selectedBrand === b ? 'bg-brand-600 text-white shadow-xs' : 'bg-ink-50 text-ink-600 hover:bg-ink-100'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>

              {cart.length > 0 && (
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="btn-primary text-xs flex items-center gap-2 px-4 py-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Checkout Lot ({cart.length} Devices · {formatINR(cartTotal)})
                </button>
              )}
            </div>

            {/* Inventory Grid */}
            {dataLoading ? (
              <div className="card p-12 text-center text-ink-500 font-bold">Loading Fundu Hub Inventory...</div>
            ) : filteredInventory.length === 0 ? (
              <div className="card p-12 text-center bg-white rounded-2xl">
                <Smartphone className="h-10 w-10 text-ink-300 mx-auto" />
                <h3 className="mt-3 font-display font-bold text-ink-800">No phones available in this category</h3>
                <p className="text-xs text-ink-500 mt-1">Fresh inventory from customer sell requests is added daily at Fundu Lucknow Hub.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredInventory.map((item) => {
                  const inCart = cart.some((c) => c.id === item.id);
                  const margin = item.retail_price && item.retail_price > item.wholesale_price
                    ? item.retail_price - item.wholesale_price
                    : 2500;

                  return (
                    <div
                      key={item.id}
                      className={`card p-5 rounded-2xl transition-all border ${
                        inCart ? 'border-brand-600 bg-brand-50/40 ring-2 ring-brand-500/20' : 'bg-white hover:border-brand-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="badge bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase">
                            {item.condition || 'Grade A'}
                          </span>
                          <h3 className="mt-2 font-display text-base font-bold text-ink-900">
                            {item.brand} {item.model}
                          </h3>
                          <p className="text-xs text-ink-500">
                            {item.storage || '128 GB'} · {item.ram || '6 GB RAM'} · {item.color || 'Tested'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold uppercase text-ink-400">Wholesale</p>
                          <p className="font-display text-lg font-black text-brand-700">{formatINR(item.wholesale_price)}</p>
                          {item.retail_price && (
                            <p className="text-[10px] text-ink-400 line-through">{formatINR(item.retail_price)}</p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] bg-ink-50 p-2.5 rounded-xl text-ink-700">
                        <div>🔋 Battery: <strong>{item.diagnostics?.battery_health || '85%+'}</strong></div>
                        <div>📱 Screen: <strong>{item.diagnostics?.screen || 'Tested OK'}</strong></div>
                        <div>📷 Cameras: <strong>{item.diagnostics?.cameras || '100% Working'}</strong></div>
                        <div>🛡 IMEI: <strong className="font-mono">{item.imei ? `...${item.imei.slice(-4)}` : 'Verified'}</strong></div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-ink-100 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" /> Profit Margin: ~{formatINR(margin)}
                        </span>
                        <button
                          onClick={() => toggleCartItem(item)}
                          className={`btn text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition ${
                            inCart
                              ? 'bg-brand-600 text-white'
                              : 'bg-ink-100 text-ink-800 hover:bg-brand-50 hover:text-brand-700'
                          }`}
                        >
                          {inCart ? (
                            <>
                              <Check className="h-3.5 w-3.5" /> Added to Lot
                            </>
                          ) : (
                            <>
                              <Plus className="h-3.5 w-3.5" /> Add to Order
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── MODAL 1: PHYSICAL INSPECTION & VALUATION MODAL ── */}
      {sellQuoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 backdrop-blur-xs p-4">
          <div className="card w-full max-w-md p-6 bg-white rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-ink-100">
              <h3 className="font-display font-bold text-ink-900 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-brand-600" /> Physical Check & Valuation Quote
              </h3>
              <button onClick={() => setSellQuoteModal(null)} className="text-ink-400 hover:text-ink-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <p className="text-xs text-ink-500">Device Details:</p>
              <p className="font-bold text-sm text-ink-900">{sellQuoteModal.brand} {sellQuoteModal.model} ({sellQuoteModal.storage})</p>
              <p className="text-xs text-blue-700 font-semibold mt-0.5">
                Online Estimated Value: {formatINR(sellQuoteModal.estimated_price || 0)}
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-700">Vendor Final Valuation Price (₹)</label>
              <input
                type="number"
                value={sellValuationPrice}
                onChange={(e) => setSellValuationPrice(e.target.value)}
                placeholder="e.g. 14500"
                className="input mt-1 text-sm font-bold text-ink-900"
              />
              <p className="text-[11px] text-ink-500 mt-1">
                Amount paid to user via your website credit limit upon user acceptance. (10% platform commission: {formatINR(Math.round((Number(sellValuationPrice) || 0) * 0.10))})
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-700">Physical Inspection Notes</label>
              <textarea
                value={sellInspectionNotes}
                onChange={(e) => setSellInspectionNotes(e.target.value)}
                rows={2}
                placeholder="e.g. Display minor scratch, battery 84%, rest flawless."
                className="input mt-1 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setSellQuoteModal(null)} className="btn-outline text-xs">
                Cancel
              </button>
              <button
                onClick={handleSubmitSellValuation}
                disabled={sellQuoteSubmitting || !sellValuationPrice}
                className="btn-primary text-xs px-5"
              >
                {sellQuoteSubmitting ? 'Submitting...' : 'Submit Valuation Quote'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: UPLOAD REPAIR QUOTATION MODAL ── */}
      {repairQuoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 backdrop-blur-xs p-4">
          <div className="card w-full max-w-md p-6 bg-white rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-ink-100">
              <h3 className="font-display font-bold text-ink-900 flex items-center gap-2">
                <Wrench className="h-5 w-5 text-purple-600" /> Upload Repair Quotation
              </h3>
              <button onClick={() => setRepairQuoteModal(null)} className="text-ink-400 hover:text-ink-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <p className="text-xs text-ink-500">Repair Job:</p>
              <p className="font-bold text-sm text-ink-900">{repairQuoteModal.brand} {repairQuoteModal.model}</p>
              <p className="text-xs text-rose-700 font-semibold mt-0.5">Problem: {repairQuoteModal.problem}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-700">Total Repair Quotation (₹)</label>
              <input
                type="number"
                value={repairQuotationAmount}
                onChange={(e) => setRepairQuotationAmount(e.target.value)}
                placeholder="e.g. 2400"
                className="input mt-1 text-sm font-bold text-ink-900"
              />
              <p className="text-[11px] text-ink-500 mt-1">
                90% ({formatINR(Math.round((Number(repairQuotationAmount) || 0) * 0.90))}) credited to your Vendor balance upon user payment. 10% ({formatINR(Math.round((Number(repairQuotationAmount) || 0) * 0.10))}) platform commission.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-700">Quotation Details / Parts & Labor Breakdown</label>
              <textarea
                value={repairQuotationDetails}
                onChange={(e) => setRepairQuotationDetails(e.target.value)}
                rows={3}
                placeholder="e.g. Original Display Assembly: ₹1,800 + Service/Labor: ₹600. Includes 3 months warranty."
                className="input mt-1 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setRepairQuoteModal(null)} className="btn-outline text-xs">
                Cancel
              </button>
              <button
                onClick={handleSubmitRepairQuotation}
                disabled={repairQuoteSubmitting || !repairQuotationAmount}
                className="btn-primary bg-purple-600 hover:bg-purple-700 text-xs px-5"
              >
                {repairQuoteSubmitting ? 'Uploading...' : 'Upload Quotation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── B2B CART CHECKOUT MODAL ── */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 backdrop-blur-xs p-4">
          <div className="card w-full max-w-lg p-6 bg-white rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-ink-100">
              <h3 className="font-display font-bold text-ink-900 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-brand-600" /> B2B Phone Lot Cart ({cart.length})
              </h3>
              <button onClick={() => setIsCartOpen(false)} className="text-ink-400 hover:text-ink-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto divide-y divide-ink-100 pr-1">
              {cart.map((item) => (
                <div key={item.id} className="py-2 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-ink-900">{item.brand} {item.model}</p>
                    <p className="text-[10px] text-ink-500">{item.storage} · {item.condition}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-brand-700">{formatINR(item.wholesale_price)}</span>
                    <button onClick={() => toggleCartItem(item)} className="text-rose-500 hover:text-rose-700">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-ink-100 space-y-3">
              <div className="flex justify-between items-center text-sm font-bold">
                <span>Lot Total Amount:</span>
                <span className="text-lg font-black text-brand-700">{formatINR(cartTotal)}</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink-700">Payment Option</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit')}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition ${
                      paymentMethod === 'credit'
                        ? 'border-brand-600 bg-brand-50 text-brand-900'
                        : 'border-ink-200 text-ink-700 hover:bg-ink-50'
                    }`}
                  >
                    <div>Fundu Limit (Khata)</div>
                    <div className="text-[10px] text-emerald-700 font-normal mt-0.5">Available: {formatINR(availableCredit)}</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition ${
                      paymentMethod === 'cash'
                        ? 'border-brand-600 bg-brand-50 text-brand-900'
                        : 'border-ink-200 text-ink-700 hover:bg-ink-50'
                    }`}
                  >
                    <div>Spot Cash Handover</div>
                    <div className="text-[10px] text-ink-500 font-normal mt-0.5">Hub Pickup</div>
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setIsCartOpen(false)} className="btn-outline text-xs">
                  Close
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={orderSubmitting}
                  className="btn-primary text-xs px-5"
                >
                  {orderSubmitting ? 'Placing Order...' : 'Confirm Lot Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CUSTOMER FULL DETAILS INSPECTION MODAL ── */}
      <CustomerDetailsModal
        isOpen={Boolean(customerModalData)}
        onClose={() => setCustomerModalData(null)}
        customer={customerModalData}
      />
    </div>
  );
}
