import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Smartphone, Package, Plus, Edit2, Trash2, X, ShoppingCart, CreditCard,
  Building2, CheckCircle2, FileText, MapPin, ShieldCheck, Check, TrendingUp,
  Printer, MessageSquare, Truck, Sparkles, Clock, ExternalLink, BadgeIndianRupee,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Product, SparePart, WholesaleInventory, WholesaleOrder, VendorLedger } from '../types';
import { PHONE_BRANDS } from '../types';
import { db, formatINR } from '../lib/db';

export default function Wholesaler() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();

  // Tab State
  const [activeTab, setActiveTab] = useState<'b2b-buy' | 'khata' | 'orders' | 'supply'>('b2b-buy');

  // B2B Procured Inventory State
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

  // Supply Parts & Products State (Seller Marketplace)
  const [supplyTab, setSupplyTab] = useState<'products' | 'spare-parts'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);

  // Product modal
  const [productModal, setProductModal] = useState<{ product: Product | null } | null>(null);
  const [productForm, setProductForm] = useState({
    title: '', brand: '', model: '', ram: '', storage: '', color: '',
    condition: 'Excellent' as 'Excellent' | 'Good' | 'Fair',
    price: '', original_price: '', discount_percent: '0', warranty_months: '6',
    description: '', images: '', is_featured: false, stock: '0',
  });
  const [productSaving, setProductSaving] = useState(false);

  // Spare Part modal
  const [partModal, setPartModal] = useState<{ part: SparePart | null } | null>(null);
  const [partForm, setPartForm] = useState({
    title: '', brand: '', category: '', compatible_models: '',
    price: '', original_price: '', stock: '0', description: '', images: '',
  });
  const [partSaving, setPartSaving] = useState(false);

  // Authentication check
  useEffect(() => {
    if (!loading && !user) navigate('/login?redirect=/wholesaler');
    if (!loading && user && profile && profile.role !== 'wholesaler' && profile.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [loading, user, profile, navigate]);

  // Fetch all Wholesaler B2B Data
  const fetchData = async () => {
    if (!user) return;
    setDataLoading(true);
    try {
      const [invRes, ledgerRes, ordersRes, pRes, spRes] = await Promise.all([
        db.from('wholesale_inventories').select('*').order('created_at', { ascending: false }),
        db.from('vendor_ledgers').select('*').eq('vendor_id', user.id).order('created_at', { ascending: false }),
        db.from('wholesale_orders').select('*').eq('vendor_id', user.id).order('created_at', { ascending: false }),
        db.from('products').select('*').eq('seller_id', user.id).order('created_at', { ascending: false }),
        db.from('spare_parts').select('*').eq('seller_id', user.id).order('created_at', { ascending: false }),
      ]);

      setInventory((invRes.data as WholesaleInventory[]) ?? []);
      setLedgers((ledgerRes.data as VendorLedger[]) ?? []);
      setWholesaleOrders((ordersRes.data as WholesaleOrder[]) ?? []);
      setProducts((pRes.data as Product[]) ?? []);
      setSpareParts((spRes.data as SparePart[]) ?? []);
    } catch (err) {
      console.warn('Error fetching wholesaler data:', err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Calculations for Khata / Credit
  const creditLimit = profile?.credit_limit || 200000; // Default ₹2 Lakh credit limit for demo
  const outstandingBalance = profile?.outstanding_balance || 0;
  const availableCredit = Math.max(0, creditLimit - outstandingBalance);
  const cartTotal = cart.reduce((sum, item) => sum + (item.wholesale_price || 0), 0);

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
        business_name: profile?.business_name || 'Lucknow B2B Partner',
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
        delivery_address: 'Fundu Lucknow Central Hub (Self Pickup / Delivery Executive)',
        notes: `B2B Lot Order for ${cart.length} used phone(s)`,
      };

      const { error } = await db.from('wholesale_orders').insert(orderData).select('*').single();
      if (error) throw error;

      alert(`Wholesale Order Confirmed!\nOrder Total: ${formatINR(cartTotal)}\nPayment: ${paymentMethod === 'credit' ? 'Fundu Credit (Khata)' : 'Spot Cash'}`);
      setCart([]);
      setIsCartOpen(false);
      await refreshProfile?.();
      await fetchData();
      setActiveTab('orders');
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

  // Supply Product functions (Retained)
  const openProductModal = (product: Product | null) => {
    if (product) {
      setProductForm({
        title: product.title,
        brand: product.brand,
        model: product.model,
        ram: product.ram ?? '',
        storage: product.storage ?? '',
        color: product.color ?? '',
        condition: product.condition,
        price: String(product.price),
        original_price: product.original_price ? String(product.original_price) : '',
        discount_percent: String(product.discount_percent),
        warranty_months: String(product.warranty_months),
        description: product.description ?? '',
        images: product.images.join('\n'),
        is_featured: product.is_featured,
        stock: String(product.stock),
      });
    } else {
      setProductForm({
        title: '', brand: '', model: '', ram: '', storage: '', color: '',
        condition: 'Excellent', price: '', original_price: '', discount_percent: '0',
        warranty_months: '6', description: '', images: '', is_featured: false, stock: '0',
      });
    }
    setProductModal({ product });
  };

  const saveProduct = async () => {
    if (!user) return;
    setProductSaving(true);
    try {
      const productData = {
        title: productForm.title,
        brand: productForm.brand,
        model: productForm.model,
        ram: productForm.ram || null,
        storage: productForm.storage || null,
        color: productForm.color || null,
        condition: productForm.condition,
        price: Number(productForm.price),
        original_price: productForm.original_price ? Number(productForm.original_price) : null,
        discount_percent: Number(productForm.discount_percent),
        warranty_months: Number(productForm.warranty_months),
        description: productForm.description || null,
        images: productForm.images.split('\n').filter(Boolean),
        is_approved: false,
        is_featured: productForm.is_featured,
        stock: Number(productForm.stock),
        seller_id: user.id,
      };

      const product = productModal?.product;
      if (product) {
        const { data, error } = await db.from('products').update(productData).eq('id', product.id).select('*').single();
        if (error) throw error;
        setProducts((prev) => prev.map((p) => (p.id === product.id ? (data as Product) : p)));
      } else {
        const { data, error } = await db.from('products').insert(productData).select('*').single();
        if (error) throw error;
        setProducts((prev) => [data as Product, ...prev]);
      }
      setProductModal(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setProductSaving(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const { error } = await db.from('products').delete().eq('id', id);
    if (error) { alert(error.message); return; }
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // Supply Spare Part functions (Retained)
  const openPartModal = (part: SparePart | null) => {
    if (part) {
      setPartForm({
        title: part.title,
        brand: part.brand ?? '',
        category: part.category,
        compatible_models: part.compatible_models.join('\n'),
        price: String(part.price),
        original_price: part.original_price ? String(part.original_price) : '',
        stock: String(part.stock),
        description: part.description ?? '',
        images: part.images.join('\n'),
      });
    } else {
      setPartForm({
        title: '', brand: '', category: '', compatible_models: '',
        price: '', original_price: '', stock: '0', description: '', images: '',
      });
    }
    setPartModal({ part });
  };

  const savePart = async () => {
    if (!user) return;
    setPartSaving(true);
    try {
      const partData = {
        title: partForm.title,
        brand: partForm.brand || null,
        category: partForm.category,
        compatible_models: partForm.compatible_models.split('\n').filter(Boolean),
        price: Number(partForm.price),
        original_price: partForm.original_price ? Number(partForm.original_price) : null,
        stock: Number(partForm.stock),
        description: partForm.description || null,
        images: partForm.images.split('\n').filter(Boolean),
        is_approved: false,
        seller_id: user.id,
      };

      const part = partModal?.part;
      if (part) {
        const { data, error } = await db.from('spare_parts').update(partData).eq('id', part.id).select('*').single();
        if (error) throw error;
        setSpareParts((prev) => prev.map((p) => (p.id === part.id ? (data as SparePart) : p)));
      } else {
        const { data, error } = await db.from('spare_parts').insert(partData).select('*').single();
        if (error) throw error;
        setSpareParts((prev) => [data as SparePart, ...prev]);
      }
      setPartModal(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save spare part');
    } finally {
      setPartSaving(false);
    }
  };

  const deletePart = async (id: string) => {
    if (!confirm('Are you sure you want to delete this spare part?')) return;
    const { error } = await db.from('spare_parts').delete().eq('id', id);
    if (error) { alert(error.message); return; }
    setSpareParts((prev) => prev.filter((p) => p.id !== id));
  };

  if (loading || !user) {
    return <div className="container-page py-20 text-center text-ink-500 font-bold">Loading B2B Portal...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f4f7f8] pb-24">
      {/* Top Header Card */}
      <div className="bg-white border-b border-[#e5ecef] py-8">
        <div className="container-page">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
                <Building2 className="h-3.5 w-3.5" /> B2B Wholesaler & Refurbisher Portal · Lucknow
              </div>
              <h1 className="mt-2 font-display text-2xl md:text-3xl font-extrabold text-ink-900">
                {profile?.business_name || profile?.full_name || 'Wholesale Partner'} Dashboard
              </h1>
              <p className="mt-1 text-xs md:text-sm text-ink-500 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                Fundu Lucknow Hub Supply · Buy Tested Old Phones with Cash or Credit (Khata)
              </p>
            </div>

            {/* Khata / Credit Summary Widget */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-emerald-50/80 p-3 rounded-2xl border border-emerald-200">
                <p className="text-[10px] font-bold uppercase text-emerald-700">Available Credit</p>
                <p className="font-display text-lg font-black text-emerald-800">{formatINR(availableCredit)}</p>
                <p className="text-[10px] text-emerald-600">Limit: {formatINR(creditLimit)}</p>
              </div>
              <div className="bg-amber-50/80 p-3 rounded-2xl border border-amber-200">
                <p className="text-[10px] font-bold uppercase text-amber-700">Outstanding Balance</p>
                <p className="font-display text-lg font-black text-amber-800">{formatINR(outstandingBalance)}</p>
                <p className="text-[10px] text-amber-600">{outstandingBalance > 0 ? 'Due for Settlement' : 'No dues'}</p>
              </div>
              <div className="col-span-2 sm:col-span-1 bg-brand-50/80 p-3 rounded-2xl border border-brand-200 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase text-brand-700">B2B Status</p>
                  <p className="font-bold text-xs text-brand-900 flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-brand-600" /> Verified Partner
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

          {/* Main Navigation Tabs */}
          <div className="mt-8 flex gap-2 border-b border-ink-100 overflow-x-auto scrollbar-hide">
            {[
              { id: 'b2b-buy', label: 'Buy Procured Phone Lots', icon: Smartphone, badge: `${filteredInventory.length} In Hub` },
              { id: 'khata', label: 'Khata & Credit Statement', icon: CreditCard, badge: outstandingBalance > 0 ? `₹${outstandingBalance.toLocaleString('en-IN')} Due` : 'Clear' },
              { id: 'orders', label: 'Wholesale Orders', icon: Package, badge: wholesaleOrders.length > 0 ? `${wholesaleOrders.length}` : undefined },
              { id: 'supply', label: 'Supply Parts / Store Seller', icon: Building2 },
            ].map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 text-xs md:text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
                    isActive ? 'border-brand-600 text-brand-700 bg-brand-50/30' : 'border-transparent text-ink-500 hover:text-ink-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{t.label}</span>
                  {t.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${isActive ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-600'}`}>
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
        {/* ── TAB 1: B2B BUY PROCURED INVENTORY ── */}
        {activeTab === 'b2b-buy' && (
          <div className="space-y-6">
            {/* Filter Bar */}
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
                          <p className="text-[10px] font-bold uppercase text-ink-400">B2B Wholesale</p>
                          <p className="font-display text-lg font-black text-brand-700">{formatINR(item.wholesale_price)}</p>
                          {item.retail_price && (
                            <p className="text-[10px] text-ink-400 line-through">{formatINR(item.retail_price)}</p>
                          )}
                        </div>
                      </div>

                      {/* Device Diagnostic Highlights */}
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

        {/* ── TAB 2: KHATA & CREDIT STATEMENT ── */}
        {activeTab === 'khata' && (
          <div className="space-y-6">
            {/* Big Khata Banner */}
            <div className="card p-6 md:p-8 rounded-[28px] bg-gradient-to-r from-ink-900 via-brand-950 to-teal-950 text-white shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <span className="badge bg-white/20 text-white text-xs font-bold">Lucknow Vendor Khata</span>
                  <h2 className="mt-2 font-display text-2xl md:text-3xl font-black">
                    Fundu Credit & Ledger Account
                  </h2>
                  <p className="mt-1 text-xs text-white/80 max-w-xl">
                    Buy inventory on credit, sell in Lucknow local markets, and settle payments in cash or UPI. Double-entry verified records.
                  </p>
                </div>
                <div className="text-left md:text-right bg-white/10 p-4 rounded-2xl backdrop-blur-xs border border-white/20">
                  <p className="text-xs font-bold uppercase tracking-wider text-teal-200">Current Outstanding Due</p>
                  <p className="mt-1 font-display text-3xl font-black text-white">{formatINR(outstandingBalance)}</p>
                  <p className="text-[11px] text-white/70 mt-1">Available Credit: {formatINR(availableCredit)}</p>
                </div>
              </div>

              {/* Credit Utilization Bar */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span>Credit Utilized ({Math.round((outstandingBalance / (creditLimit || 1)) * 100)}%)</span>
                  <span>Limit: {formatINR(creditLimit)}</span>
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
                  <FileText className="h-5 w-5 text-brand-600" /> Transaction Ledger History
                </h3>
                <span className="text-xs text-ink-500 font-semibold">{ledgers.length} Records</span>
              </div>

              {ledgers.length === 0 ? (
                <div className="p-8 text-center text-ink-500 text-xs font-medium">
                  No credit transactions recorded yet. When you buy phone lots on credit or make cash payments, ledger entries will appear here.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-ink-100 text-ink-400 font-bold uppercase text-[10px]">
                        <th className="py-3 px-2">Date</th>
                        <th className="py-3 px-2">Transaction Type</th>
                        <th className="py-3 px-2">Reference</th>
                        <th className="py-3 px-2">Mode</th>
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
                                l.type === 'cash_repayment'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {l.type === 'cash_repayment' ? 'Cash Repayment' : 'Credit Purchase'}
                            </span>
                          </td>
                          <td className="py-3 px-2 font-mono font-semibold text-ink-700">
                            {l.reference_order_id ? `#${l.reference_order_id.slice(0, 8)}` : 'Settlement'}
                          </td>
                          <td className="py-3 px-2 font-medium text-ink-600">{l.payment_mode || 'Khata'}</td>
                          <td
                            className={`py-3 px-2 text-right font-bold ${
                              l.type === 'cash_repayment' ? 'text-emerald-600' : 'text-amber-600'
                            }`}
                          >
                            {l.type === 'cash_repayment' ? '-' : '+'} {formatINR(l.amount)}
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

        {/* ── TAB 3: B2B ORDERS ── */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Tab Header Banner */}
            <div className="card p-6 rounded-[28px] bg-gradient-to-r from-teal-500/10 via-brand-500/10 to-emerald-500/10 border border-teal-200/60 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-3 py-1 text-xs font-black text-teal-800">
                  <Package className="h-3.5 w-3.5" /> B2B Wholesale Lot Orders · Lucknow
                </div>
                <h2 className="mt-2 font-display text-2xl font-black text-ink-900">
                  My Procured Wholesale Phone Lots
                </h2>
                <p className="mt-1 text-xs text-ink-600">
                  Track lot order confirmations, hub dispatch, doorstep delivery, gate passes, and tax receipts.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-teal-200 shadow-xs text-center min-w-[110px]">
                  <p className="text-[10px] font-bold uppercase text-ink-500">Total Lot Orders</p>
                  <p className="font-display text-xl font-black text-ink-900">{wholesaleOrders.length}</p>
                </div>
                <div className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-teal-200 shadow-xs text-center min-w-[110px]">
                  <p className="text-[10px] font-bold uppercase text-emerald-700">Delivered</p>
                  <p className="font-display text-xl font-black text-emerald-700">
                    {wholesaleOrders.filter((o) => o.status === 'delivered').length}
                  </p>
                </div>
              </div>
            </div>

            {wholesaleOrders.length === 0 ? (
              <div className="card p-12 text-center bg-white rounded-2xl">
                <Package className="h-10 w-10 text-ink-300 mx-auto" />
                <h3 className="mt-3 font-display font-bold text-ink-800">No Wholesale Orders Yet</h3>
                <p className="text-xs text-ink-500 mt-1">Browse procured phone lots in Tab 1 and place your first B2B order.</p>
              </div>
            ) : (
              wholesaleOrders.map((o) => {
                const isDelivered = o.status === 'delivered';
                const isDispatched = o.status === 'dispatched' || isDelivered;
                const isConfirmed = o.status === 'confirmed' || isDispatched;

                return (
                  <div key={o.id} className="card p-6 md:p-7 rounded-[28px] bg-white shadow-xs border border-ink-100 space-y-5">
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-ink-100">
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="badge bg-brand-50 text-brand-700 font-black text-xs px-3 py-1">
                            Lot Order #{o.id.slice(0, 8).toUpperCase()}
                          </span>
                          <span
                            className={`badge text-xs font-black px-3 py-1 capitalize ${
                              isDelivered
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : o.status === 'dispatched'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-teal-600 text-white shadow-xs'
                            }`}
                          >
                            {isDelivered ? '✓ Delivered' : o.status}
                          </span>
                        </div>
                        <p className="text-xs text-ink-500 mt-1.5 flex items-center gap-2">
                          <span>Placed on {new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          <span>•</span>
                          <span>Payment: <strong>{o.payment_method === 'credit' ? 'Fundu Credit (Khata)' : 'Spot Cash'}</strong></span>
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Total Lot Value</p>
                        <p className="font-display text-2xl font-black text-brand-700">{formatINR(o.total_amount)}</p>
                      </div>
                    </div>

                    {/* 4-Stage Lifecycle Progress Bar */}
                    <div className="p-4 rounded-2xl bg-ink-50/60 border border-ink-100 space-y-3">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-ink-500">
                        Real-time Order Lifecycle Status
                      </p>
                      <div className="grid grid-cols-4 gap-2 text-center text-xs">
                        <div className="space-y-1">
                          <div className="h-2 rounded-full bg-emerald-500" />
                          <p className="text-[11px] font-bold text-emerald-800">1. Placed</p>
                        </div>
                        <div className="space-y-1">
                          <div className={`h-2 rounded-full ${isConfirmed ? 'bg-emerald-500' : 'bg-ink-200'}`} />
                          <p className={`text-[11px] font-bold ${isConfirmed ? 'text-emerald-800' : 'text-ink-400'}`}>
                            2. Confirmed
                          </p>
                        </div>
                        <div className="space-y-1">
                          <div className={`h-2 rounded-full ${isDispatched ? 'bg-emerald-500' : 'bg-ink-200'}`} />
                          <p className={`text-[11px] font-bold ${isDispatched ? 'text-emerald-800' : 'text-ink-400'}`}>
                            3. Dispatched
                          </p>
                        </div>
                        <div className="space-y-1">
                          <div className={`h-2 rounded-full ${isDelivered ? 'bg-emerald-500' : 'bg-ink-200'}`} />
                          <p className={`text-[11px] font-bold ${isDelivered ? 'text-emerald-800 font-black' : 'text-ink-400'}`}>
                            4. Delivered ✓
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Status Alert Banner */}
                    {isDelivered ? (
                      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white grid place-items-center shrink-0">
                            <CheckCircle2 className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-black text-emerald-900 text-sm">
                              ✓ Lot Order Handover Verified & Delivered!
                            </p>
                            <p className="text-emerald-700 mt-0.5">
                              Device inventory received at Lucknow Central Hub. Double-entry Khata statement synchronized.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => window.print()}
                            className="btn bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 text-xs px-3 py-1.5 font-bold rounded-xl flex items-center gap-1.5 shadow-2xs"
                          >
                            <Printer className="h-3.5 w-3.5" /> Print Lot Tax Invoice
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveTab('khata')}
                            className="btn bg-emerald-600 text-white hover:bg-emerald-700 text-xs px-3 py-1.5 font-bold rounded-xl flex items-center gap-1.5 shadow-2xs"
                          >
                            <FileText className="h-3.5 w-3.5" /> View Khata Statement
                          </button>
                        </div>
                      </div>
                    ) : o.status === 'dispatched' ? (
                      <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center gap-3 text-xs">
                        <Truck className="h-5 w-5 text-blue-600 shrink-0" />
                        <div>
                          <p className="font-bold text-blue-900">
                            🚚 Lot Order Dispatched & Ready for Handover
                          </p>
                          <p className="text-blue-700 mt-0.5">
                            Your procured lot is available for self-pickup or doorstep delivery in Lucknow.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 flex items-center gap-3 text-xs">
                        <Sparkles className="h-5 w-5 text-teal-600 shrink-0" />
                        <div>
                          <p className="font-bold text-teal-900">
                            ⚡ Lot Order Confirmed & Being Prepared at Hazratganj Hub
                          </p>
                          <p className="text-teal-700 mt-0.5">
                            Technicians are packaging devices with 32-point inspection certificates.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Items in this B2B Order */}
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-ink-500">Ordered Phone Lots ({o.items?.length || 0})</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {o.items?.map((it, idx) => (
                          <div key={idx} className="bg-ink-50 p-3 rounded-2xl border border-ink-100 flex items-center justify-between text-xs">
                            <div>
                              <p className="font-bold text-ink-900">{it.brand} {it.model}</p>
                              <p className="text-[11px] text-ink-500 mt-0.5">{it.storage || '128 GB'} · <span className="font-semibold text-emerald-700">{it.condition || 'Grade A'}</span></p>
                              {it.imei && <p className="text-[10px] text-ink-400 font-mono mt-0.5">IMEI: {it.imei}</p>}
                            </div>
                            <span className="font-extrabold text-brand-700 text-sm">{formatINR(it.unit_price)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer Info */}
                    <div className="pt-3 border-t border-ink-100 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-600">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-emerald-600" /> {o.delivery_address}
                      </span>
                      <span className="font-semibold text-emerald-700">
                        {isDelivered ? 'Handover Completed at Lucknow Hub' : 'Ready for Hub Pickup / Doorstep Handover'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── TAB 4: SUPPLY SPARE PARTS & STORE (PRESERVED SELLER DASHBOARD) ── */}
        {activeTab === 'supply' && (
          <div className="space-y-6">
            <div className="flex gap-2 border-b border-ink-100">
              <button
                onClick={() => setSupplyTab('products')}
                className={`px-4 py-2 text-xs font-bold border-b-2 ${
                  supplyTab === 'products' ? 'border-brand-600 text-brand-700' : 'border-transparent text-ink-500'
                }`}
              >
                My Refurbished Products
              </button>
              <button
                onClick={() => setSupplyTab('spare-parts')}
                className={`px-4 py-2 text-xs font-bold border-b-2 ${
                  supplyTab === 'spare-parts' ? 'border-brand-600 text-brand-700' : 'border-transparent text-ink-500'
                }`}
              >
                My Spare Parts
              </button>
            </div>

            {supplyTab === 'products' ? (
              <div className="space-y-3">
                <div className="flex justify-end">
                  <button onClick={() => openProductModal(null)} className="btn-primary text-xs flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Add Product to Store
                  </button>
                </div>
                {products.map((p) => (
                  <div key={p.id} className="card p-4 flex flex-wrap items-center justify-between gap-3 bg-white">
                    <div className="flex items-center gap-3">
                      <div className="grid h-12 w-12 place-items-center rounded-lg bg-ink-100 overflow-hidden">
                        {p.images?.[0] ? <img src={p.images[0]} alt="" className="h-full w-full object-cover" /> : <Smartphone className="h-5 w-5 text-ink-400" />}
                      </div>
                      <div>
                        <p className="font-semibold text-ink-900 text-sm">{p.title}</p>
                        <p className="text-xs text-ink-500">{formatINR(p.price)} · Stock: {p.stock}</p>
                        <span className={`badge mt-1 text-[10px] ${p.is_approved ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {p.is_approved ? 'Approved' : 'Pending Approval'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openProductModal(p)} className="btn-outline text-xs px-3 py-1.5">
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button onClick={() => deleteProduct(p.id)} className="btn-outline border-accent-300 text-xs px-3 py-1.5 text-accent-600">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
                {products.length === 0 && <p className="text-xs text-ink-500 text-center py-6">No products added yet.</p>}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-end">
                  <button onClick={() => openPartModal(null)} className="btn-primary text-xs flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Add Spare Part
                  </button>
                </div>
                {spareParts.map((p) => (
                  <div key={p.id} className="card p-4 flex flex-wrap items-center justify-between gap-3 bg-white">
                    <div className="flex items-center gap-3">
                      <div className="grid h-12 w-12 place-items-center rounded-lg bg-ink-100 overflow-hidden">
                        {p.images?.[0] ? <img src={p.images[0]} alt="" className="h-full w-full object-cover" /> : <Package className="h-5 w-5 text-ink-400" />}
                      </div>
                      <div>
                        <p className="font-semibold text-ink-900 text-sm">{p.title}</p>
                        <p className="text-xs text-ink-500">{p.category} · {formatINR(p.price)} · Stock: {p.stock}</p>
                        <span className={`badge mt-1 text-[10px] ${p.is_approved ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {p.is_approved ? 'Approved' : 'Pending Approval'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openPartModal(p)} className="btn-outline text-xs px-3 py-1.5">
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button onClick={() => deletePart(p.id)} className="btn-outline border-accent-300 text-xs px-3 py-1.5 text-accent-600">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
                {spareParts.length === 0 && <p className="text-xs text-ink-500 text-center py-6">No spare parts added yet.</p>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── B2B LOT CHECKOUT DRAWER / MODAL ── */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 backdrop-blur-xs p-4">
          <div className="card w-full max-w-lg p-6 bg-white rounded-[28px] shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-ink-100">
              <div>
                <h3 className="font-display font-black text-lg text-ink-900 flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-brand-600" /> B2B Wholesale Lot Checkout
                </h3>
                <p className="text-xs text-ink-500">{cart.length} Devices selected from Lucknow Hub</p>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="rounded-full p-1.5 text-ink-400 hover:bg-ink-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-ink-50 text-xs border border-ink-100/60">
                  <div>
                    <p className="font-bold text-ink-900">{item.brand} {item.model}</p>
                    <p className="text-[11px] text-ink-500">{item.storage} · {item.condition}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-brand-700">{formatINR(item.wholesale_price)}</span>
                    <button onClick={() => toggleCartItem(item)} className="text-accent-500 hover:text-accent-700">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Amount Breakdown */}
            <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 space-y-2 text-xs">
              <div className="flex justify-between text-ink-600">
                <span>Subtotal ({cart.length} items):</span>
                <span className="font-bold">{formatINR(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-ink-600">
                <span>Pickup / Lucknow Hub Delivery:</span>
                <span className="font-bold text-emerald-700">FREE</span>
              </div>
              <div className="pt-2 border-t border-brand-200 flex justify-between text-sm font-black text-brand-900">
                <span>Total Amount:</span>
                <span>{formatINR(cartTotal)}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-ink-500">Choose Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('credit')}
                  className={`p-3 rounded-2xl border text-left transition ${
                    paymentMethod === 'credit'
                      ? 'border-brand-600 bg-brand-50/80 ring-2 ring-brand-500/20'
                      : 'border-ink-200 bg-white hover:bg-ink-50'
                  }`}
                >
                  <p className="font-bold text-xs text-ink-900 flex items-center gap-1.5">
                    <CreditCard className="h-4 w-4 text-brand-600" /> Fundu Credit (Khata)
                  </p>
                  <p className="text-[10px] text-ink-500 mt-1">Available: {formatINR(availableCredit)}</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-3 rounded-2xl border text-left transition ${
                    paymentMethod === 'cash'
                      ? 'border-brand-600 bg-brand-50/80 ring-2 ring-brand-500/20'
                      : 'border-ink-200 bg-white hover:bg-ink-50'
                  }`}
                >
                  <p className="font-bold text-xs text-ink-900 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Spot Cash / UPI
                  </p>
                  <p className="text-[10px] text-ink-500 mt-1">Pay on Hub Handover</p>
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button onClick={() => setIsCartOpen(false)} className="btn-outline text-xs">
                Cancel
              </button>
              <button
                onClick={handlePlaceOrder}
                disabled={orderSubmitting || cart.length === 0}
                className="btn-primary text-xs px-6"
              >
                {orderSubmitting ? 'Confirming Order...' : `Confirm Wholesale Order (${formatINR(cartTotal)})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Modal (Seller) */}
      {productModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4 overflow-y-auto">
          <div className="card w-full max-w-2xl p-6 my-4 bg-white rounded-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-ink-900 flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-brand-600" /> {productModal.product ? 'Edit Product' : 'Add Product'}
              </h3>
              <button onClick={() => setProductModal(null)} className="text-ink-400 hover:text-ink-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-ink-700">Title</label>
                <input
                  value={productForm.title}
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                  placeholder="e.g. Apple iPhone 14 Pro Max"
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-700">Brand</label>
                <select
                  value={productForm.brand}
                  onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                  className="input mt-1"
                >
                  <option value="">Select Brand</option>
                  {PHONE_BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-700">Model</label>
                <input
                  value={productForm.model}
                  onChange={(e) => setProductForm({ ...productForm, model: e.target.value })}
                  placeholder="e.g. 14 Pro Max"
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-700">Price (₹)</label>
                <input
                  type="number"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  placeholder="e.g. 79999"
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-700">Stock</label>
                <input
                  type="number"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                  placeholder="0"
                  className="input mt-1"
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setProductModal(null)} className="btn-outline text-xs">Cancel</button>
              <button onClick={saveProduct} disabled={productSaving} className="btn-primary text-xs">
                {productSaving ? 'Saving...' : (productModal.product ? 'Update Product' : 'Add Product')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spare Part Modal (Seller) */}
      {partModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4 overflow-y-auto">
          <div className="card w-full max-w-2xl p-6 my-4 bg-white rounded-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-ink-900 flex items-center gap-2">
                <Package className="h-5 w-5 text-brand-600" /> {partModal.part ? 'Edit Spare Part' : 'Add Spare Part'}
              </h3>
              <button onClick={() => setPartModal(null)} className="text-ink-400 hover:text-ink-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-ink-700">Title</label>
                <input
                  value={partForm.title}
                  onChange={(e) => setPartForm({ ...partForm, title: e.target.value })}
                  placeholder="e.g. iPhone 14 Display Screen"
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-700">Category</label>
                <input
                  value={partForm.category}
                  onChange={(e) => setPartForm({ ...partForm, category: e.target.value })}
                  placeholder="e.g. Screen, Battery"
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-700">Price (₹)</label>
                <input
                  type="number"
                  value={partForm.price}
                  onChange={(e) => setPartForm({ ...partForm, price: e.target.value })}
                  placeholder="e.g. 2999"
                  className="input mt-1"
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setPartModal(null)} className="btn-outline text-xs">Cancel</button>
              <button onClick={savePart} disabled={partSaving} className="btn-primary text-xs">
                {partSaving ? 'Saving...' : (partModal.part ? 'Update Spare Part' : 'Add Spare Part')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
