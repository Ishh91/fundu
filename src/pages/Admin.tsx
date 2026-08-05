import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Smartphone, BadgeIndianRupee, Wrench, Package,
  TrendingUp, Users, ShieldCheck, Store, UserCog, Truck, X, Plus, Edit2, Trash2,
  Eye, Star, MessageSquare, CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Product, SellRequest, SellPriceConfig, RepairBooking, Order, SparePart, Dispatch, Review } from '../types';
import { PHONE_BRANDS } from '../types';
import { db, formatINR } from '../lib/db';
import { fetchPhoneModels } from '../lib/mobileApi';

const statusColors: Record<string, string> = {
  pending: 'bg-trail-50 text-trail-500',
  confirmed: 'bg-weather-50 text-weather-700',
  price_offered: 'bg-weather-50 text-weather-700',
  accepted: 'bg-brand-50 text-brand-700',
  pickup_scheduled: 'bg-brand-50 text-brand-700',
  picked_up: 'bg-brand-50 text-brand-700',
  diagnosing: 'bg-brand-50 text-brand-700',
  repairing: 'bg-brand-50 text-brand-700',
  inspected: 'bg-weather-50 text-weather-700',
  repaired: 'bg-nature-50 text-nature-700',
  completed: 'bg-nature-50 text-nature-700',
  delivered: 'bg-nature-50 text-nature-700',
  shipped: 'bg-weather-50 text-weather-700',
  cancelled: 'bg-accent-50 text-accent-700',
  rejected: 'bg-accent-50 text-accent-700',
  open: 'bg-trail-50 text-trail-500',
  in_progress: 'bg-weather-50 text-weather-700',
  resolved: 'bg-nature-50 text-nature-700',
  closed: 'bg-ink-100 text-ink-600',
};

export default function Admin() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'overview' | 'products' | 'sells' | 'pricing' | 'repairs' | 'orders' | 'parts' | 'users' | 'reviews'>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [sells, setSells] = useState<SellRequest[]>([]);
  const [sellPriceConfigs, setSellPriceConfigs] = useState<SellPriceConfig[]>([]);
  const [repairs, setRepairs] = useState<RepairBooking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [parts, setParts] = useState<SparePart[]>([]);
  const [profiles, setProfiles] = useState<Array<{ id: string; full_name: string | null; phone: string | null; role: string; business_name: string | null; is_verified: boolean; created_at: string }>>([]);
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dispatchModal, setDispatchModal] = useState<{ orderId: string } | null>(null);
  const [dispatchForm, setDispatchForm] = useState({ name: '', phone: '', notes: '' });
  const [dispatching, setDispatching] = useState(false);
  
  // Detail modals
  const [orderDetailsModal, setOrderDetailsModal] = useState<Order | null>(null);
  const [sellDetailsModal, setSellDetailsModal] = useState<SellRequest | null>(null);
  const [userDetailsModal, setUserDetailsModal] = useState<typeof profiles[0] | null>(null);
  
  // Product modal
  const [productModal, setProductModal] = useState<{ product: Product | null } | null>(null);
  const [productForm, setProductForm] = useState<{
    title: string;
    brand: string;
    model: string;
    ram: string;
    storage: string;
    color: string;
    condition: 'Excellent' | 'Good' | 'Fair';
    price: string;
    original_price: string;
    discount_percent: string;
    warranty_months: string;
    description: string;
    images: string;
    is_approved: boolean;
    is_featured: boolean;
    stock: string;
  }>({
    title: '',
    brand: '',
    model: '',
    ram: '',
    storage: '',
    color: '',
    condition: 'Excellent',
    price: '',
    original_price: '',
    discount_percent: '0',
    warranty_months: '6',
    description: '',
    images: '',
    is_approved: true,
    is_featured: false,
    stock: '0',
  });
  const [productSaving, setProductSaving] = useState(false);
  
  // Spare part modal
  const [partModal, setPartModal] = useState<{ part: SparePart | null } | null>(null);
  const [partForm, setPartForm] = useState({
    title: '',
    brand: '',
    category: '',
    compatible_models: '' as string,
    price: '',
    original_price: '',
    stock: '0',
    description: '',
    images: '' as string,
    is_approved: true,
  });
  const [partSaving, setPartSaving] = useState(false);
  
  // Sell request edit modal
  const [sellRequestModal, setSellRequestModal] = useState<{ request: SellRequest | null } | null>(null);
  const [sellRequestForm, setSellRequestForm] = useState({
    final_price: '',
    pickup_person_name: '',
    pickup_person_phone: '',
  });
  const [sellRequestSaving, setSellRequestSaving] = useState(false);

  // Sell price config modal
  const [priceConfigModal, setPriceConfigModal] = useState<{ config: SellPriceConfig | null } | null>(null);
  const [priceConfigForm, setPriceConfigForm] = useState({
    brand: '',
    model: '',
    storage: '',
    base_price: '',
    excellent_multiplier: '0.7',
    good_multiplier: '0.55',
    fair_multiplier: '0.4',
    box_bonus: '500',
    charger_bonus: '300',
    is_active: true,
  });
  const [priceConfigSaving, setPriceConfigSaving] = useState(false);
  const [apiModels, setApiModels] = useState<Array<{ name: string; storages: string[] }>>([]);
  const [apiModelsLoading, setApiModelsLoading] = useState(false);

  useEffect(() => {
    if (!priceConfigForm.brand) {
      setApiModels([]);
      return;
    }
    setApiModelsLoading(true);
    fetchPhoneModels(priceConfigForm.brand, '')
      .then((items) => setApiModels(items))
      .catch(() => setApiModels([]))
      .finally(() => setApiModelsLoading(false));
  }, [priceConfigForm.brand]);
  
  // Repair booking edit modal
  const [repairBookingModal, setRepairBookingModal] = useState<{ booking: RepairBooking | null } | null>(null);
  const [repairBookingForm, setRepairBookingForm] = useState({
    final_cost: '',
    technician_name: '',
    technician_phone: '',
    pickup_person_name: '',
    pickup_person_phone: '',
  });
  const [repairBookingSaving, setRepairBookingSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate('/login?redirect=/admin');
    if (!loading && user && profile && profile.role !== 'admin') navigate('/dashboard');
  }, [loading, user, profile, navigate]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      db.from('products').select('*').order('created_at', { ascending: false }),
      db.from('sell_requests').select('*').order('created_at', { ascending: false }),
      db.from('sell_price_configs').select('*').order('created_at', { ascending: false }),
      db.from('repair_bookings').select('*').order('created_at', { ascending: false }),
      db.from('orders').select('*').order('created_at', { ascending: false }),
      db.from('spare_parts').select('*').order('created_at', { ascending: false }),
      db.from('profiles').select('id, full_name, phone, role, business_name, is_verified, created_at').order('created_at', { ascending: false }),
      db.from('dispatches').select('*').order('created_at', { ascending: false }),
      db.from('reviews').select('*').order('created_at', { ascending: false }),
    ]).then(([p, s, pc, r, o, sp, prof, disp, rev]) => {
      setProducts((p.data as Product[]) ?? []);
      setSells((s.data as SellRequest[]) ?? []);
      setSellPriceConfigs((pc.data as SellPriceConfig[]) ?? []);
      setRepairs((r.data as RepairBooking[]) ?? []);
      setOrders((o.data as Order[]) ?? []);
      setParts((sp.data as SparePart[]) ?? []);
      setProfiles((prof.data as typeof profiles) ?? []);
      setDispatches((disp.data as Dispatch[]) ?? []);
      setReviews((rev.data as Review[]) ?? []);
      setDataLoading(false);
    });
  }, [user]);

  if (loading || !user) return <div className="container-page py-20 text-center text-ink-500">Loading...</div>;

  const pendingSells = sells.filter((s) => s.status === 'pending').length;
  const pendingRepairs = repairs.filter((r) => r.status === 'pending').length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const pendingReviews = reviews.filter((r) => !r.is_approved).length;
  const revenue = orders.filter((o) => o.payment_status === 'paid').reduce((sum, o) => sum + o.total_amount, 0);

  const approveAndPublishSellRequest = async (sell: SellRequest) => {
    // Mark sell_request as accepted
    const { error: sellErr } = await db.from('sell_requests').update({ status: 'accepted' }).eq('id', sell.id);
    if (sellErr) { alert(sellErr.message); return; }
    setSells((prev) => prev.map((s) => s.id === sell.id ? { ...s, status: 'accepted' } : s));

    // Pre-fill Product Modal to publish into Buy Store
    setProductForm({
      title: `${sell.brand} ${sell.model}${sell.storage ? ` (${sell.storage})` : ''}`,
      brand: sell.brand,
      model: sell.model,
      ram: sell.ram || '',
      storage: sell.storage || '',
      color: 'Standard',
      condition: (['Excellent', 'Good', 'Fair'].includes(sell.condition) ? sell.condition : 'Good') as 'Excellent' | 'Good' | 'Fair',
      price: String(sell.final_price || sell.estimated_price || 0),
      original_price: String(Math.round((sell.final_price || sell.estimated_price || 0) * 1.25)),
      discount_percent: '20',
      warranty_months: '6',
      description: `Refurbished ${sell.brand} ${sell.model} in ${sell.condition} condition. Thoroughly inspected and certified by Fundu Lucknow team.`,
      images: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
      is_approved: true,
      is_featured: true,
      stock: '1',
    });
    setProductModal({ product: null });
    setTab('products');
  };

  const toggleReviewApproval = async (id: string, currentStatus: boolean) => {
    const { error } = await db.from('reviews').update({ is_approved: !currentStatus }).eq('id', id);
    if (error) { alert(error.message); return; }
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, is_approved: !currentStatus } : r));
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    const { error } = await db.from('reviews').delete().eq('id', id);
    if (error) { alert(error.message); return; }
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  const updateStatus = async (table: string, id: string, status: string) => {
    const { error } = await db.from(table).update({ status }).eq('id', id);
    if (error) { alert(error.message); return; }
    if (table === 'sell_requests') setSells((prev) => prev.map((s) => s.id === id ? { ...s, status } : s));
    if (table === 'repair_bookings') setRepairs((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    if (table === 'orders') setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
  };

  const openDispatch = (orderId: string) => {
    setDispatchForm({ name: '', phone: '', notes: '' });
    setDispatchModal({ orderId });
  };

  const submitDispatch = async () => {
    if (!dispatchModal) return;
    if (!dispatchForm.name.trim() || !dispatchForm.phone.trim()) {
      alert('Delivery person name and phone are required.');
      return;
    }
    setDispatching(true);
    const { data, error } = await db.from('dispatches').insert({
      order_id: dispatchModal.orderId,
      delivery_person_name: dispatchForm.name.trim(),
      delivery_person_phone: dispatchForm.phone.trim(),
      notes: dispatchForm.notes.trim() || null,
      status: 'dispatched',
    }).select('*').single();
    if (error) { alert(error.message); setDispatching(false); return; }
    const { error: orderErr } = await db.from('orders').update({ status: 'dispatched' }).eq('id', dispatchModal.orderId);
    if (orderErr) { alert(orderErr.message); setDispatching(false); return; }
    setDispatches((prev) => [data as Dispatch, ...prev]);
    setOrders((prev) => prev.map((o) => o.id === dispatchModal.orderId ? { ...o, status: 'dispatched' } : o));
    setDispatching(false);
    setDispatchModal(null);
  };

  const updateDispatchStatus = async (dispatchId: string, status: 'in_transit' | 'delivered' | 'returned') => {
    const patch: Partial<Dispatch> = { status };
    if (status === 'delivered') patch.delivered_at = new Date().toISOString();
    const { error } = await db.from('dispatches').update(patch).eq('id', dispatchId);
    if (error) { alert(error.message); return; }
    setDispatches((prev) => prev.map((d) => d.id === dispatchId ? { ...d, ...patch } : d));
    if (status === 'delivered') {
      const disp = dispatches.find((d) => d.id === dispatchId);
      if (disp) {
        const { error: orderErr } = await db.from('orders').update({ status: 'delivered' }).eq('id', disp.order_id);
        if (!orderErr) setOrders((prev) => prev.map((o) => o.id === disp.order_id ? { ...o, status: 'delivered' } : o));
      }
    }
  };

  const toggleApproval = async (table: string, id: string, current: boolean) => {
    await db.from(table).update({ is_approved: !current }).eq('id', id);
    if (table === 'products') setProducts((prev) => prev.map((p) => p.id === id ? { ...p, is_approved: !current } : p));
    if (table === 'spare_parts') setParts((prev) => prev.map((p) => p.id === id ? { ...p, is_approved: !current } : p));
  };

  const updateRole = async (id: string, role: string) => {
    if (id === user.id) return;
    const { error } = await db.from('profiles').update({ role }).eq('id', id);
    if (error) { alert(error.message); return; }
    setProfiles((prev) => prev.map((p) => p.id === id ? { ...p, role } : p));
  };

  const toggleVerified = async (id: string, current: boolean) => {
    const { error } = await db.from('profiles').update({ is_verified: !current }).eq('id', id);
    if (error) { alert(error.message); return; }
    setProfiles((prev) => prev.map((p) => p.id === id ? { ...p, is_verified: !current } : p));
  };

  // Product functions
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
        is_approved: product.is_approved,
        is_featured: product.is_featured,
        stock: String(product.stock),
      });
    } else {
      setProductForm({
        title: '',
        brand: '',
        model: '',
        ram: '',
        storage: '',
        color: '',
        condition: 'Excellent',
        price: '',
        original_price: '',
        discount_percent: '0',
        warranty_months: '6',
        description: '',
        images: '',
        is_approved: true,
        is_featured: false,
        stock: '0',
      });
    }
    setProductModal({ product });
  };

  const saveProduct = async () => {
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
        is_approved: productForm.is_approved,
        is_featured: productForm.is_featured,
        stock: Number(productForm.stock),
      };

      const product = productModal?.product;
      if (product) {
        const { data, error } = await db
          .from('products')
          .update(productData)
          .eq('id', product.id)
          .select('*')
          .single();
        if (error) throw error;
        setProducts(prev => prev.map(p => p.id === product.id ? data as Product : p));
      } else {
        const { data, error } = await db
          .from('products')
          .insert(productData)
          .select('*')
          .single();
        if (error) throw error;
        setProducts(prev => [data as Product, ...prev]);
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
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Spare part functions
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
        is_approved: part.is_approved,
      });
    } else {
      setPartForm({
        title: '',
        brand: '',
        category: '',
        compatible_models: '',
        price: '',
        original_price: '',
        stock: '0',
        description: '',
        images: '',
        is_approved: true,
      });
    }
    setPartModal({ part });
  };

  const savePart = async () => {
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
        is_approved: partForm.is_approved,
      };

      const part = partModal?.part;
      if (part) {
        const { data, error } = await db
          .from('spare_parts')
          .update(partData)
          .eq('id', part.id)
          .select('*')
          .single();
        if (error) throw error;
        setParts(prev => prev.map(p => p.id === part.id ? data as SparePart : p));
      } else {
        const { data, error } = await db
          .from('spare_parts')
          .insert(partData)
          .select('*')
          .single();
        if (error) throw error;
        setParts(prev => [data as SparePart, ...prev]);
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
    setParts(prev => prev.filter(p => p.id !== id));
  };
  
  // Sell request edit functions
  const openSellRequestModal = (request: SellRequest | null) => {
    if (request) {
      setSellRequestForm({
        final_price: request.final_price ? String(request.final_price) : '',
        pickup_person_name: request.pickup_person_name ?? '',
        pickup_person_phone: request.pickup_person_phone ?? '',
      });
    } else {
      setSellRequestForm({
        final_price: '',
        pickup_person_name: '',
        pickup_person_phone: '',
      });
    }
    setSellRequestModal({ request });
  };
  
  const saveSellRequest = async () => {
    const request = sellRequestModal?.request;
    if (!request) return;
    setSellRequestSaving(true);
    try {
      const { data, error } = await db
        .from('sell_requests')
        .update({
          final_price: sellRequestForm.final_price ? Number(sellRequestForm.final_price) : null,
          pickup_person_name: sellRequestForm.pickup_person_name || null,
          pickup_person_phone: sellRequestForm.pickup_person_phone || null,
        })
        .eq('id', request.id)
        .select('*')
        .single();
      if (error) throw error;
      setSells(prev => prev.map(s => s.id === request.id ? data as SellRequest : s));
      setSellRequestModal(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save sell request');
    } finally {
      setSellRequestSaving(false);
    }
  };

  // Sell price config functions
  const openPriceConfigModal = (config: SellPriceConfig | null) => {
    if (config) {
      setPriceConfigForm({
        brand: config.brand,
        model: config.model,
        storage: config.storage ?? '',
        base_price: String(config.base_price),
        excellent_multiplier: String(config.excellent_multiplier),
        good_multiplier: String(config.good_multiplier),
        fair_multiplier: String(config.fair_multiplier),
        box_bonus: String(config.box_bonus),
        charger_bonus: String(config.charger_bonus),
        is_active: config.is_active,
      });
    } else {
      setPriceConfigForm({
        brand: '',
        model: '',
        storage: '',
        base_price: '',
        excellent_multiplier: '0.7',
        good_multiplier: '0.55',
        fair_multiplier: '0.4',
        box_bonus: '500',
        charger_bonus: '300',
        is_active: true,
      });
    }
    setPriceConfigModal({ config });
  };

  const savePriceConfig = async () => {
    setPriceConfigSaving(true);
    try {
      const payload = {
        brand: priceConfigForm.brand,
        model: priceConfigForm.model,
        storage: priceConfigForm.storage || null,
        base_price: Number(priceConfigForm.base_price),
        excellent_multiplier: Number(priceConfigForm.excellent_multiplier),
        good_multiplier: Number(priceConfigForm.good_multiplier),
        fair_multiplier: Number(priceConfigForm.fair_multiplier),
        box_bonus: Number(priceConfigForm.box_bonus),
        charger_bonus: Number(priceConfigForm.charger_bonus),
        is_active: priceConfigForm.is_active,
      };

      const config = priceConfigModal?.config;
      if (config) {
        const { data, error } = await db
          .from('sell_price_configs')
          .update(payload)
          .eq('id', config.id)
          .select('*')
          .single();
        if (error) throw error;
        setSellPriceConfigs((prev) => prev.map((item) => item.id === config.id ? data as SellPriceConfig : item));
      } else {
        const { data, error } = await db
          .from('sell_price_configs')
          .insert(payload)
          .select('*')
          .single();
        if (error) throw error;
        setSellPriceConfigs((prev) => [data as SellPriceConfig, ...prev]);
      }

      setPriceConfigModal(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save sell price config');
    } finally {
      setPriceConfigSaving(false);
    }
  };

  const deletePriceConfig = async (id: string) => {
    if (!confirm('Are you sure you want to delete this price config?')) return;
    const { error } = await db.from('sell_price_configs').delete().eq('id', id);
    if (error) { alert(error.message); return; }
    setSellPriceConfigs((prev) => prev.filter((item) => item.id !== id));
  };

  const togglePriceConfigActive = async (id: string, currentStatus: boolean) => {
    const { error } = await db
      .from('sell_price_configs')
      .update({ is_active: !currentStatus })
      .eq('id', id);
    if (error) { alert(error.message); return; }
    setSellPriceConfigs((prev) => prev.map((item) => item.id === id ? { ...item, is_active: !currentStatus } : item));
  };
  
  // Repair booking edit functions
  const openRepairBookingModal = (booking: RepairBooking | null) => {
    if (booking) {
      setRepairBookingForm({
        final_cost: booking.final_cost ? String(booking.final_cost) : '',
        technician_name: booking.technician_name ?? '',
        technician_phone: booking.technician_phone ?? '',
        pickup_person_name: booking.pickup_person_name ?? '',
        pickup_person_phone: booking.pickup_person_phone ?? '',
      });
    } else {
      setRepairBookingForm({
        final_cost: '',
        technician_name: '',
        technician_phone: '',
        pickup_person_name: '',
        pickup_person_phone: '',
      });
    }
    setRepairBookingModal({ booking });
  };
  
  const saveRepairBooking = async () => {
    const booking = repairBookingModal?.booking;
    if (!booking) return;
    setRepairBookingSaving(true);
    try {
      const { data, error } = await db
        .from('repair_bookings')
        .update({
          final_cost: repairBookingForm.final_cost ? Number(repairBookingForm.final_cost) : null,
          technician_name: repairBookingForm.technician_name || null,
          technician_phone: repairBookingForm.technician_phone || null,
          pickup_person_name: repairBookingForm.pickup_person_name || null,
          pickup_person_phone: repairBookingForm.pickup_person_phone || null,
        })
        .eq('id', booking.id)
        .select('*')
        .single();
      if (error) throw error;
      setRepairs(prev => prev.map(r => r.id === booking.id ? data as RepairBooking : r));
      setRepairBookingModal(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save repair booking');
    } finally {
      setRepairBookingSaving(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Smartphone, count: products.length },
    { id: 'sells', label: 'Sell Requests', icon: BadgeIndianRupee, count: sells.length, badge: pendingSells },
    { id: 'pricing', label: 'Sell Pricing', icon: BadgeIndianRupee, count: sellPriceConfigs.length },
    { id: 'repairs', label: 'Repairs', icon: Wrench, count: repairs.length, badge: pendingRepairs },
    { id: 'orders', label: 'Orders', icon: Package, count: orders.length, badge: pendingOrders },
    { id: 'parts', label: 'Spare Parts', icon: Package, count: parts.length },
    { id: 'users', label: 'Users', icon: Users, count: profiles.length },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare, count: reviews.length, badge: pendingReviews },
  ] as const;

  return (
    <div className="container-page py-10">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-700">
          <LayoutDashboard className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink-900">Admin Panel</h1>
          <p className="text-sm text-ink-500">Manage products, requests, and orders</p>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8 grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { icon: TrendingUp, label: 'Revenue', value: formatINR(revenue), bg: 'bg-nature-50 text-nature-600' },
          { icon: BadgeIndianRupee, label: 'Pending Sells', value: pendingSells, bg: 'bg-trail-50 text-trail-500' },
          { icon: Wrench, label: 'Pending Repairs', value: pendingRepairs, bg: 'bg-trail-50 text-trail-500' },
          { icon: Package, label: 'Pending Orders', value: pendingOrders, bg: 'bg-trail-50 text-trail-500' },
        ].map((s) => (
          <div key={s.label} className="card p-5">
            <div className={`grid h-10 w-10 place-items-center rounded-xl ${s.bg}`}><s.icon className="h-5 w-5" /></div>
            <p className="mt-3 font-display text-2xl font-extrabold text-ink-900">{s.value}</p>
            <p className="text-xs text-ink-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-1 border-b border-ink-100 overflow-x-auto scrollbar-hide">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as typeof tab)}
            className={`relative flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
              tab === t.id ? 'border-brand-600 text-brand-700' : 'border-transparent text-ink-500 hover:text-ink-800'
            }`}
          >
            <t.icon className="h-4 w-4" /> {t.label}
            {'badge' in t && t.badge ? (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-accent-500 px-1 text-xs font-bold text-white">{t.badge}</span>
            ) : null}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {dataLoading ? (
          <div className="card p-12 text-center text-ink-500">Loading...</div>
        ) : tab === 'overview' ? (
          <div className="grid gap-5 md:grid-cols-2">
            <div className="card p-6">
              <h3 className="font-display font-bold text-ink-900">Recent Sell Requests</h3>
              <div className="mt-3 space-y-2">
                {sells.slice(0, 5).map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-lg bg-ink-50 p-3 text-sm">
                    <span className="font-semibold text-ink-900">{s.brand} {s.model}</span>
                    <span className={`badge ${statusColors[s.status] ?? 'bg-ink-100 text-ink-600'}`}>{s.status.replace('_', ' ')}</span>
                  </div>
                ))}
                {sells.length === 0 && <p className="text-sm text-ink-500">No sell requests.</p>}
              </div>
            </div>
            <div className="card p-6">
              <h3 className="font-display font-bold text-ink-900">Recent Repairs</h3>
              <div className="mt-3 space-y-2">
                {repairs.slice(0, 5).map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-lg bg-ink-50 p-3 text-sm">
                    <div>
                      <p className="font-semibold text-ink-900">{r.brand} {r.model}</p>
                      <p className="text-xs text-ink-500">{r.tracking_id}</p>
                    </div>
                    <span className={`badge ${statusColors[r.status] ?? 'bg-ink-100 text-ink-600'}`}>{r.status.replace('_', ' ')}</span>
                  </div>
                ))}
                {repairs.length === 0 && <p className="text-sm text-ink-500">No repair bookings.</p>}
              </div>
            </div>
          </div>
        ) : tab === 'products' ? (
          <div className="space-y-3">
            <div className="flex justify-end">
              <button onClick={() => openProductModal(null)} className="btn-primary text-sm flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add Product
              </button>
            </div>
            {products.map((p) => (
              <div key={p.id} className="card p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-lg bg-ink-100 overflow-hidden">
                    {p.images?.[0] ? <img src={p.images[0]} alt="" className="h-full w-full object-cover" /> : <Smartphone className="h-5 w-5 text-ink-400" />}
                  </div>
                  <div>
                    <p className="font-semibold text-ink-900">{p.title}</p>
                    <p className="text-xs text-ink-500">{formatINR(p.price)} · Stock: {p.stock}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${p.is_approved ? 'bg-nature-50 text-nature-700' : 'bg-trail-50 text-trail-500'}`}>
                    {p.is_approved ? 'Approved' : 'Pending'}
                  </span>
                  <button onClick={() => toggleApproval('products', p.id, p.is_approved)} className="btn-outline text-xs px-3 py-1.5">
                    {p.is_approved ? 'Unapprove' : 'Approve'}
                  </button>
                  <button onClick={() => openProductModal(p)} className="btn-outline text-xs px-3 py-1.5">
                    <Edit2 className="h-3 w-3" />
                  </button>
                  <button onClick={() => deleteProduct(p.id)} className="btn-outline border-accent-300 text-xs px-3 py-1.5 text-accent-600">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : tab === 'sells' ? (
          <div className="space-y-3">
            {sells.map((s) => (
              <div key={s.id} className="card p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink-900">{s.brand} {s.model}</p>
                    <p className="text-xs text-ink-500">
                      {s.condition} · Est: {s.estimated_price ? formatINR(s.estimated_price) : '—'}
                      {s.final_price && <span className="ml-2 text-brand-700 font-semibold">Final: {formatINR(s.final_price)}</span>}
                    </p>
                    {s.pickup_address && <p className="text-xs text-ink-400 mt-0.5">{s.pickup_address}</p>}
                    {s.pickup_person_name && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-nature-700">
                        <Truck className="h-3 w-3" /> Pickup: {s.pickup_person_name} ({s.pickup_person_phone})
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={() => setSellDetailsModal(s)} className="btn-outline text-xs px-3 py-1.5">
                      <Eye className="h-3 w-3 mr-1" /> View
                    </button>
                    <select value={s.status} onChange={(e) => updateStatus('sell_requests', s.id, e.target.value)} className="input text-sm w-40">
                      {['pending', 'price_offered', 'accepted', 'pickup_scheduled', 'picked_up', 'inspected', 'completed', 'rejected'].map((st) => (
                        <option key={st} value={st}>{st.replace('_', ' ')}</option>
                      ))}
                    </select>
                    <button onClick={() => openSellRequestModal(s)} className="btn-outline text-xs px-3 py-1.5">
                      <Edit2 className="h-3 w-3 mr-1" /> Edit
                    </button>
                    <button onClick={() => approveAndPublishSellRequest(s)} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700">
                      <Store className="h-3.5 w-3.5" /> Approve & List in Buy Store
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {sells.length === 0 && <p className="text-sm text-ink-500">No sell requests.</p>}
          </div>
        ) : tab === 'pricing' ? (
          <div className="space-y-3">
            <div className="flex justify-end">
              <button onClick={() => openPriceConfigModal(null)} className="btn-primary text-sm flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add Sell Price
              </button>
            </div>
            {sellPriceConfigs.map((config) => (
              <div key={config.id} className="card p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink-900">
                    {config.brand} {config.model}
                    {config.storage ? <span className="text-ink-500"> · {config.storage}</span> : null}
                  </p>
                  <p className="text-xs text-ink-500">
                    Base: {formatINR(config.base_price)} · Excellent x{config.excellent_multiplier} · Good x{config.good_multiplier} · Fair x{config.fair_multiplier}
                  </p>
                  <p className="text-xs text-ink-400">
                    Box +{formatINR(config.box_bonus)} · Charger +{formatINR(config.charger_bonus)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => togglePriceConfigActive(config.id, config.is_active)}
                    title="Click to toggle display on frontend"
                    className={`badge cursor-pointer transition hover:opacity-80 ${config.is_active ? 'bg-nature-50 text-nature-700 border border-nature-200' : 'bg-ink-100 text-ink-600 border border-ink-300'}`}
                  >
                    {config.is_active ? '● Display Active' : '○ Display Hidden'}
                  </button>
                  <button onClick={() => openPriceConfigModal(config)} className="btn-outline text-xs px-3 py-1.5">
                    <Edit2 className="h-3 w-3 mr-1" /> Edit
                  </button>
                  <button onClick={() => deletePriceConfig(config.id)} className="btn-outline border-accent-300 text-xs px-3 py-1.5 text-accent-600">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
            {sellPriceConfigs.length === 0 && <p className="text-sm text-ink-500">No sell price configs yet.</p>}
          </div>
        ) : tab === 'repairs' ? (
          <div className="space-y-3">
            {repairs.map((r) => (
              <div key={r.id} className="card p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink-900">{r.brand} {r.model}</p>
                    <p className="text-xs text-ink-500">
                      {r.problem} · {r.tracking_id}
                      {r.estimated_cost && <span className="ml-1">· Est: {formatINR(r.estimated_cost)}</span>}
                      {r.final_cost && <span className="ml-2 text-brand-700 font-semibold">Final: {formatINR(r.final_cost)}</span>}
                    </p>
                    {r.pickup_address && <p className="text-xs text-ink-400 mt-0.5">{r.pickup_address}</p>}
                    {r.technician_name && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-nature-700">
                        <Wrench className="h-3 w-3" /> Tech: {r.technician_name} ({r.technician_phone})
                      </p>
                    )}
                    {r.pickup_person_name && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-weather-700">
                        <Truck className="h-3 w-3" /> Pickup: {r.pickup_person_name} ({r.pickup_person_phone})
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <select value={r.status} onChange={(e) => updateStatus('repair_bookings', r.id, e.target.value)} className="input text-sm w-40">
                      {['pending', 'confirmed', 'pickup_scheduled', 'picked_up', 'diagnosing', 'repairing', 'repaired', 'delivered', 'cancelled'].map((st) => (
                        <option key={st} value={st}>{st.replace('_', ' ')}</option>
                      ))}
                    </select>
                    <button onClick={() => openRepairBookingModal(r)} className="btn-outline text-xs px-3 py-1.5">
                      <Edit2 className="h-3 w-3 mr-1" /> Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {repairs.length === 0 && <p className="text-sm text-ink-500">No repair bookings.</p>}
          </div>
        ) : tab === 'orders' ? (
          <div className="space-y-4">
            {orders.map((o) => {
              const disp = dispatches.find((d) => d.order_id === o.id);
              return (
                <div key={o.id} className="card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-display font-bold text-ink-900">Order #{o.id.slice(0, 8)}</p>
                      <p className="text-xs text-ink-500">{formatINR(o.total_amount)} · {new Date(o.created_at).toLocaleDateString('en-IN')} · {o.payment_method ?? 'COD'}</p>
                      {o.delivery_name && o.delivery_phone && <p className="mt-1 text-xs text-ink-500">Deliver to: {o.delivery_name} ({o.delivery_phone})</p>}
                      {o.delivery_address && <p className="text-xs text-ink-500">Address: {o.delivery_address}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setOrderDetailsModal(o)} className="btn-outline text-xs px-3 py-1.5">
                        <Eye className="h-3 w-3 mr-1" /> View
                      </button>
                      <span className={`badge ${statusColors[o.status] ?? 'bg-ink-100 text-ink-600'}`}>{o.status}</span>
                      {o.status === 'pending' && (
                        <button onClick={() => updateStatus('orders', o.id, 'confirmed')} className="btn-primary text-xs px-3 py-1.5">Accept</button>
                      )}
                      {o.status === 'confirmed' && (
                        <button onClick={() => openDispatch(o.id)} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5">
                          <Truck className="h-3.5 w-3.5" /> Hand over to delivery
                        </button>
                      )}
                      {o.status !== 'pending' && o.status !== 'confirmed' && o.status !== 'delivered' && o.status !== 'cancelled' && (
                        <select value={o.status} onChange={(e) => updateStatus('orders', o.id, e.target.value)} className="input text-sm w-40">
                          {['dispatched', 'shipped', 'delivered', 'cancelled', 'returned'].map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                  {disp && (
                    <div className="mt-4 rounded-lg bg-brand-50/60 p-4 border border-brand-100">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-100 text-brand-700">
                            <Truck className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-ink-900 text-sm">{disp.delivery_person_name}</p>
                            <p className="text-xs text-ink-500">{disp.delivery_person_phone}</p>
                            <p className="text-xs text-ink-400">Dispatched {new Date(disp.dispatched_at).toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                        <span className={`badge ${disp.status === 'delivered' ? 'bg-nature-50 text-nature-700' : disp.status === 'returned' ? 'bg-accent-50 text-accent-700' : 'bg-weather-50 text-weather-700'}`}>
                          {disp.status.replace('_', ' ')}
                        </span>
                      </div>
                      {disp.notes && <p className="mt-2 text-xs text-ink-500">Notes: {disp.notes}</p>}
                      {disp.status !== 'delivered' && disp.status !== 'returned' && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button onClick={() => updateDispatchStatus(disp.id, 'in_transit')} className="btn-outline text-xs px-3 py-1.5">Mark in transit</button>
                          <button onClick={() => updateDispatchStatus(disp.id, 'delivered')} className="btn-primary text-xs px-3 py-1.5">Mark delivered</button>
                          <button onClick={() => updateDispatchStatus(disp.id, 'returned')} className="btn-outline border-accent-300 text-xs px-3 py-1.5 text-accent-600">Returned</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {orders.length === 0 && <p className="text-sm text-ink-500">No orders.</p>}
          </div>
        ) : tab === 'parts' ? (
          <div className="space-y-3">
            <div className="flex justify-end">
              <button onClick={() => openPartModal(null)} className="btn-primary text-sm flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add Spare Part
              </button>
            </div>
            {parts.map((p) => (
              <div key={p.id} className="card p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink-900">{p.title}</p>
                  <p className="text-xs text-ink-500">{p.category} · {formatINR(p.price)} · Stock: {p.stock}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${p.is_approved ? 'bg-nature-50 text-nature-700' : 'bg-trail-50 text-trail-500'}`}>
                    {p.is_approved ? 'Approved' : 'Pending'}
                  </span>
                  <button onClick={() => toggleApproval('spare_parts', p.id, p.is_approved)} className="btn-outline text-xs px-3 py-1.5">
                    {p.is_approved ? 'Unapprove' : 'Approve'}
                  </button>
                  <button onClick={() => openPartModal(p)} className="btn-outline text-xs px-3 py-1.5">
                    <Edit2 className="h-3 w-3" />
                  </button>
                  <button onClick={() => deletePart(p.id)} className="btn-outline border-accent-300 text-xs px-3 py-1.5 text-accent-600">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
            {parts.length === 0 && <p className="text-sm text-ink-500">No spare parts.</p>}
          </div>
        ) : tab === 'users' ? (
          <div className="space-y-3">
            {profiles.map((p) => (
              <div key={p.id} className="card p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`grid h-10 w-10 place-items-center rounded-full ${p.role === 'admin' ? 'bg-brand-100 text-brand-700' : p.role === 'wholesaler' ? 'bg-accent-100 text-accent-700' : 'bg-ink-100 text-ink-600'}`}>
                    {p.role === 'admin' ? <ShieldCheck className="h-5 w-5" /> : p.role === 'wholesaler' ? <Store className="h-5 w-5" /> : <UserCog className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-semibold text-ink-900 flex items-center gap-2">
                      {p.full_name ?? 'Unnamed'}
                      {p.id === user.id && <span className="badge bg-brand-50 text-brand-700">You</span>}
                      {p.is_verified && <span className="badge bg-nature-50 text-nature-700">Verified</span>}
                    </p>
                    <p className="text-xs text-ink-500">{p.phone ?? 'No phone'}{p.business_name ? ` · ${p.business_name}` : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setUserDetailsModal(p)} className="btn-outline text-xs px-3 py-1.5">
                    <Eye className="h-3 w-3 mr-1" /> View
                  </button>
                  <button
                    onClick={() => toggleVerified(p.id, p.is_verified)}
                    className={`btn-outline text-xs px-3 py-1.5 ${p.is_verified ? 'border-nature-300 text-nature-700' : ''}`}
                  >
                    {p.is_verified ? 'Unverify' : 'Verify'}
                  </button>
                  <select
                    value={p.role}
                    disabled={p.id === user.id}
                    onChange={(e) => updateRole(p.id, e.target.value)}
                    className="input text-sm w-36 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <option value="customer">Customer</option>
                    <option value="wholesaler">Wholesaler</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        ) : tab === 'reviews' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display font-bold text-lg text-ink-900 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-brand-600" /> Customer Reviews ({reviews.length})
              </h3>
              <span className="text-xs text-ink-500 font-medium">
                Pending Verification: <span className="font-bold text-amber-600">{pendingReviews}</span>
              </span>
            </div>
            {reviews.map((r) => (
              <div key={r.id} className="card p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-ink-900 text-sm">{r.reviewer_name}</span>
                    <span className="badge bg-brand-50 text-brand-700 text-xs">{r.location || 'Lucknow'}</span>
                    <span className="badge bg-ink-100 text-ink-700 text-xs uppercase">{r.service_type || 'General'}</span>
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`h-3.5 w-3.5 ${star <= r.rating ? 'fill-amber-400' : 'text-ink-200'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-ink-700 leading-relaxed italic">"{r.comment}"</p>
                  <p className="text-xs text-ink-400">
                    Submitted on: {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${r.is_approved ? 'bg-nature-50 text-nature-700 border border-nature-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                    {r.is_approved ? 'Approved & Published' : 'Pending Verification'}
                  </span>
                  <button
                    onClick={() => toggleReviewApproval(r.id, r.is_approved)}
                    className={`btn-outline text-xs px-3.5 py-1.5 font-semibold ${
                      r.is_approved ? 'border-amber-300 text-amber-700 hover:bg-amber-50' : 'border-nature-300 text-nature-700 hover:bg-nature-50'
                    }`}
                  >
                    {r.is_approved ? 'Unapprove' : 'Approve & Publish'}
                  </button>
                  <button onClick={() => deleteReview(r.id)} className="btn-outline border-accent-300 text-xs px-3 py-1.5 text-accent-600 hover:bg-accent-50">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {reviews.length === 0 && <p className="text-sm text-ink-500 py-6 text-center card">No customer reviews submitted yet.</p>}
          </div>
        ) : null}
      </div>

      {dispatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4">
          <div className="card w-full max-w-md p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-ink-900 flex items-center gap-2">
                <Truck className="h-5 w-5 text-brand-600" /> Hand over to delivery
              </h3>
              <button onClick={() => setDispatchModal(null)} className="text-ink-400 hover:text-ink-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-1 text-sm text-ink-500">Order #{dispatchModal.orderId.slice(0, 8)} will be marked as dispatched.</p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-semibold text-ink-700">Delivery person name</label>
                <input
                  value={dispatchForm.name}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, name: e.target.value })}
                  placeholder="e.g. Ravi Kumar"
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Phone number</label>
                <input
                  value={dispatchForm.phone}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, phone: e.target.value })}
                  placeholder="e.g. 98XXXXXXXX"
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Notes (optional)</label>
                <textarea
                  value={dispatchForm.notes}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, notes: e.target.value })}
                  placeholder="Any instructions for the delivery person"
                  rows={2}
                  className="input mt-1"
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setDispatchModal(null)} className="btn-outline text-sm">Cancel</button>
              <button onClick={submitDispatch} disabled={dispatching} className="btn-primary text-sm">
                {dispatching ? 'Dispatching...' : 'Dispatch order'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Product modal */}
      {productModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4 overflow-y-auto">
          <div className="card w-full max-w-2xl p-6 my-4">
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
                <label className="text-sm font-semibold text-ink-700">Title</label>
                <input
                  value={productForm.title}
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                  placeholder="e.g. Apple iPhone 14 Pro Max"
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Brand</label>
                <select
                  value={productForm.brand}
                  onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                  className="input mt-1"
                >
                  <option value="">Select Brand</option>
                  {PHONE_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Model</label>
                <input
                  value={productForm.model}
                  onChange={(e) => setProductForm({ ...productForm, model: e.target.value })}
                  placeholder="e.g. 14 Pro Max"
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">RAM</label>
                <input
                  value={productForm.ram}
                  onChange={(e) => setProductForm({ ...productForm, ram: e.target.value })}
                  placeholder="e.g. 6GB"
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Storage</label>
                <input
                  value={productForm.storage}
                  onChange={(e) => setProductForm({ ...productForm, storage: e.target.value })}
                  placeholder="e.g. 128GB"
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Color</label>
                <input
                  value={productForm.color}
                  onChange={(e) => setProductForm({ ...productForm, color: e.target.value })}
                  placeholder="e.g. Space Black"
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Condition</label>
                <select
                  value={productForm.condition}
                  onChange={(e) => setProductForm({ ...productForm, condition: e.target.value as 'Excellent' | 'Good' | 'Fair' })}
                  className="input mt-1"
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Price</label>
                <input
                  type="number"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  placeholder="e.g. 79999"
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Original Price</label>
                <input
                  type="number"
                  value={productForm.original_price}
                  onChange={(e) => setProductForm({ ...productForm, original_price: e.target.value })}
                  placeholder="e.g. 99999"
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Discount (%)</label>
                <input
                  type="number"
                  value={productForm.discount_percent}
                  onChange={(e) => setProductForm({ ...productForm, discount_percent: e.target.value })}
                  placeholder="0"
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Warranty (Months)</label>
                <input
                  type="number"
                  value={productForm.warranty_months}
                  onChange={(e) => setProductForm({ ...productForm, warranty_months: e.target.value })}
                  placeholder="6"
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Stock</label>
                <input
                  type="number"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                  placeholder="0"
                  className="input mt-1"
                />
              </div>
              <div className="md:col-span-2 flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.is_approved}
                    onChange={(e) => setProductForm({ ...productForm, is_approved: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-semibold text-ink-700">Approved</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.is_featured}
                    onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-semibold text-ink-700">Featured</span>
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-ink-700">Description</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Product description..."
                  rows={3}
                  className="input mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-ink-700">Images (one per line)</label>
                <textarea
                  value={productForm.images}
                  onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                  placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                  rows={3}
                  className="input mt-1"
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setProductModal(null)} className="btn-outline text-sm">Cancel</button>
              <button onClick={saveProduct} disabled={productSaving} className="btn-primary text-sm">
                {productSaving ? 'Saving...' : (productModal.product ? 'Update Product' : 'Add Product')}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Spare part modal */}
      {partModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4 overflow-y-auto">
          <div className="card w-full max-w-2xl p-6 my-4">
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
                <label className="text-sm font-semibold text-ink-700">Title</label>
                <input
                  value={partForm.title}
                  onChange={(e) => setPartForm({ ...partForm, title: e.target.value })}
                  placeholder="e.g. iPhone 14 Battery"
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Brand</label>
                <select
                  value={partForm.brand}
                  onChange={(e) => setPartForm({ ...partForm, brand: e.target.value })}
                  className="input mt-1"
                >
                  <option value="">Select Brand</option>
                  {PHONE_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Category</label>
                <input
                  value={partForm.category}
                  onChange={(e) => setPartForm({ ...partForm, category: e.target.value })}
                  placeholder="e.g. Battery, Screen, Camera"
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Price</label>
                <input
                  type="number"
                  value={partForm.price}
                  onChange={(e) => setPartForm({ ...partForm, price: e.target.value })}
                  placeholder="e.g. 2999"
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Original Price</label>
                <input
                  type="number"
                  value={partForm.original_price}
                  onChange={(e) => setPartForm({ ...partForm, original_price: e.target.value })}
                  placeholder="e.g. 3999"
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Stock</label>
                <input
                  type="number"
                  value={partForm.stock}
                  onChange={(e) => setPartForm({ ...partForm, stock: e.target.value })}
                  placeholder="0"
                  className="input mt-1"
                />
              </div>
              <div className="md:col-span-2 flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={partForm.is_approved}
                    onChange={(e) => setPartForm({ ...partForm, is_approved: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-semibold text-ink-700">Approved</span>
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-ink-700">Compatible Models (one per line)</label>
                <textarea
                  value={partForm.compatible_models}
                  onChange={(e) => setPartForm({ ...partForm, compatible_models: e.target.value })}
                  placeholder="iPhone 14&#10;iPhone 14 Pro"
                  rows={3}
                  className="input mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-ink-700">Description</label>
                <textarea
                  value={partForm.description}
                  onChange={(e) => setPartForm({ ...partForm, description: e.target.value })}
                  placeholder="Spare part description..."
                  rows={3}
                  className="input mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-ink-700">Images (one per line)</label>
                <textarea
                  value={partForm.images}
                  onChange={(e) => setPartForm({ ...partForm, images: e.target.value })}
                  placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                  rows={3}
                  className="input mt-1"
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setPartModal(null)} className="btn-outline text-sm">Cancel</button>
              <button onClick={savePart} disabled={partSaving} className="btn-primary text-sm">
                {partSaving ? 'Saving...' : (partModal.part ? 'Update Spare Part' : 'Add Spare Part')}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Sell request edit modal */}
      {sellRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4">
          <div className="card w-full max-w-md p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-ink-900 flex items-center gap-2">
                <BadgeIndianRupee className="h-5 w-5 text-brand-600" /> Edit Sell Request
              </h3>
              <button onClick={() => setSellRequestModal(null)} className="text-ink-400 hover:text-ink-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-semibold text-ink-700">Final Price</label>
                <input
                  type="number"
                  value={sellRequestForm.final_price}
                  onChange={(e) => setSellRequestForm({ ...sellRequestForm, final_price: e.target.value })}
                  placeholder="e.g. 35000"
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Pickup Person Name</label>
                <input
                  value={sellRequestForm.pickup_person_name}
                  onChange={(e) => setSellRequestForm({ ...sellRequestForm, pickup_person_name: e.target.value })}
                  placeholder="e.g. Raj Kumar"
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Pickup Person Phone</label>
                <input
                  value={sellRequestForm.pickup_person_phone}
                  onChange={(e) => setSellRequestForm({ ...sellRequestForm, pickup_person_phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="input mt-1"
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setSellRequestModal(null)} className="btn-outline text-sm">Cancel</button>
              <button onClick={saveSellRequest} disabled={sellRequestSaving} className="btn-primary text-sm">
                {sellRequestSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sell price config modal */}
      {priceConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4 overflow-y-auto">
          <div className="card w-full max-w-2xl p-6 my-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-ink-900 flex items-center gap-2">
                <BadgeIndianRupee className="h-5 w-5 text-brand-600" /> {priceConfigModal.config ? 'Edit Sell Price' : 'Add Sell Price'}
              </h3>
              <button onClick={() => setPriceConfigModal(null)} className="text-ink-400 hover:text-ink-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-ink-700">Brand</label>
                <select
                  value={priceConfigForm.brand}
                  onChange={(e) => setPriceConfigForm({ ...priceConfigForm, brand: e.target.value })}
                  className="input mt-1"
                >
                  <option value="">Select Brand</option>
                  {PHONE_BRANDS.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">
                  Model {apiModelsLoading ? <span className="text-xs text-brand-600 font-normal">(Fetching API models...)</span> : null}
                </label>
                <input
                  list="admin-api-phone-models"
                  value={priceConfigForm.model}
                  onChange={(e) => setPriceConfigForm({ ...priceConfigForm, model: e.target.value })}
                  placeholder={!priceConfigForm.brand ? 'Select brand first' : 'Select or type phone model'}
                  className="input mt-1"
                  disabled={!priceConfigForm.brand}
                />
                <datalist id="admin-api-phone-models">
                  {apiModels.map((item) => (
                    <option key={item.name} value={item.name} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Storage (optional)</label>
                {apiModels.find((m) => m.name === priceConfigForm.model)?.storages.length ? (
                  <select
                    value={priceConfigForm.storage}
                    onChange={(e) => setPriceConfigForm({ ...priceConfigForm, storage: e.target.value })}
                    className="input mt-1"
                  >
                    <option value="">All / Default Storage</option>
                    {apiModels.find((m) => m.name === priceConfigForm.model)?.storages.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={priceConfigForm.storage}
                    onChange={(e) => setPriceConfigForm({ ...priceConfigForm, storage: e.target.value })}
                    placeholder="e.g. 128GB"
                    className="input mt-1"
                  />
                )}
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Base Price</label>
                <input
                  type="number"
                  value={priceConfigForm.base_price}
                  onChange={(e) => setPriceConfigForm({ ...priceConfigForm, base_price: e.target.value })}
                  placeholder="e.g. 30000"
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Excellent Multiplier</label>
                <input
                  type="number"
                  step="0.01"
                  value={priceConfigForm.excellent_multiplier}
                  onChange={(e) => setPriceConfigForm({ ...priceConfigForm, excellent_multiplier: e.target.value })}
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Good Multiplier</label>
                <input
                  type="number"
                  step="0.01"
                  value={priceConfigForm.good_multiplier}
                  onChange={(e) => setPriceConfigForm({ ...priceConfigForm, good_multiplier: e.target.value })}
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Fair Multiplier</label>
                <input
                  type="number"
                  step="0.01"
                  value={priceConfigForm.fair_multiplier}
                  onChange={(e) => setPriceConfigForm({ ...priceConfigForm, fair_multiplier: e.target.value })}
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Original Box Bonus</label>
                <input
                  type="number"
                  value={priceConfigForm.box_bonus}
                  onChange={(e) => setPriceConfigForm({ ...priceConfigForm, box_bonus: e.target.value })}
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Charger Bonus</label>
                <input
                  type="number"
                  value={priceConfigForm.charger_bonus}
                  onChange={(e) => setPriceConfigForm({ ...priceConfigForm, charger_bonus: e.target.value })}
                  className="input mt-1"
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  id="sell-price-active"
                  type="checkbox"
                  checked={priceConfigForm.is_active}
                  onChange={(e) => setPriceConfigForm({ ...priceConfigForm, is_active: e.target.checked })}
                  className="h-4 w-4"
                />
                <label htmlFor="sell-price-active" className="text-sm font-semibold text-ink-700">Active config</label>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setPriceConfigModal(null)} className="btn-outline text-sm">Cancel</button>
              <button onClick={savePriceConfig} disabled={priceConfigSaving} className="btn-primary text-sm">
                {priceConfigSaving ? 'Saving...' : 'Save Price'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Repair booking edit modal */}
      {repairBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4">
          <div className="card w-full max-w-md p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-ink-900 flex items-center gap-2">
                <Wrench className="h-5 w-5 text-brand-600" /> Edit Repair Booking
              </h3>
              <button onClick={() => setRepairBookingModal(null)} className="text-ink-400 hover:text-ink-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-semibold text-ink-700">Final Cost</label>
                <input
                  type="number"
                  value={repairBookingForm.final_cost}
                  onChange={(e) => setRepairBookingForm({ ...repairBookingForm, final_cost: e.target.value })}
                  placeholder="e.g. 2500"
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Technician Name</label>
                <input
                  value={repairBookingForm.technician_name}
                  onChange={(e) => setRepairBookingForm({ ...repairBookingForm, technician_name: e.target.value })}
                  placeholder="e.g. Suresh"
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Technician Phone</label>
                <input
                  value={repairBookingForm.technician_phone}
                  onChange={(e) => setRepairBookingForm({ ...repairBookingForm, technician_phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Pickup Person Name</label>
                <input
                  value={repairBookingForm.pickup_person_name}
                  onChange={(e) => setRepairBookingForm({ ...repairBookingForm, pickup_person_name: e.target.value })}
                  placeholder="e.g. Raj Kumar"
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Pickup Person Phone</label>
                <input
                  value={repairBookingForm.pickup_person_phone}
                  onChange={(e) => setRepairBookingForm({ ...repairBookingForm, pickup_person_phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="input mt-1"
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setRepairBookingModal(null)} className="btn-outline text-sm">Cancel</button>
              <button onClick={saveRepairBooking} disabled={repairBookingSaving} className="btn-primary text-sm">
                {repairBookingSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order details modal */}
      {orderDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4 overflow-y-auto">
          <div className="card w-full max-w-2xl p-6 my-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-ink-900 flex items-center gap-2">
                <Package className="h-5 w-5 text-brand-600" /> Order Details
              </h3>
              <button onClick={() => setOrderDetailsModal(null)} className="text-ink-400 hover:text-ink-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-ink-500">Order ID</p>
                  <p className="text-sm font-semibold text-ink-900">#{orderDetailsModal.id.slice(0, 12)}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-500">Date</p>
                  <p className="text-sm font-semibold text-ink-900">{new Date(orderDetailsModal.created_at).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-500">Total Amount</p>
                  <p className="text-sm font-semibold text-brand-600">{formatINR(orderDetailsModal.total_amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-500">Status</p>
                  <span className={`badge ${statusColors[orderDetailsModal.status] ?? 'bg-ink-100 text-ink-600'}`}>{orderDetailsModal.status.replace('_', ' ')}</span>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-ink-500">Payment Method</p>
                  <p className="text-sm font-semibold text-ink-900">{orderDetailsModal.payment_method ?? 'Cash on Delivery'}</p>
                </div>
              </div>
              <div className="border-t border-ink-100 pt-3">
                <h4 className="text-sm font-bold text-ink-900 mb-2">Delivery Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-ink-500 text-xs">Name</p>
                    <p className="font-medium">{orderDetailsModal.delivery_name ?? 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-ink-500 text-xs">Phone</p>
                    <p className="font-medium">{orderDetailsModal.delivery_phone ?? 'Not provided'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-ink-500 text-xs">Address</p>
                    <p className="font-medium">{orderDetailsModal.delivery_address ?? 'Not provided'}</p>
                  </div>
                </div>
              </div>
              <div className="border-t border-ink-100 pt-3">
                <h4 className="text-sm font-bold text-ink-900 mb-2">Ordered Item</h4>
                {orderDetailsModal.product_id ? (
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-ink-100 rounded-lg grid place-items-center">
                      <Smartphone className="h-8 w-8 text-ink-400" />
                    </div>
                    <div>
                      <p className="font-medium text-ink-900">Product</p>
                      <p className="text-xs text-ink-500">ID: {orderDetailsModal.product_id.slice(0, 12)}</p>
                    </div>
                  </div>
                ) : orderDetailsModal.spare_part_id ? (
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-ink-100 rounded-lg grid place-items-center">
                      <Package className="h-8 w-8 text-ink-400" />
                    </div>
                    <div>
                      <p className="font-medium text-ink-900">Spare Part</p>
                      <p className="text-xs text-ink-500">ID: {orderDetailsModal.spare_part_id.slice(0, 12)}</p>
                    </div>
                  </div>
                ) : null}
              </div>
              {(() => {
                const disp = dispatches.find(d => d.order_id === orderDetailsModal.id);
                if (disp) {
                  return (
                    <div className="border-t border-ink-100 pt-3">
                      <h4 className="text-sm font-bold text-ink-900 mb-2">Delivery Info</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-ink-500 text-xs">Person</p>
                          <p className="font-medium">{disp.delivery_person_name}</p>
                        </div>
                        <div>
                          <p className="text-ink-500 text-xs">Phone</p>
                          <p className="font-medium">{disp.delivery_person_phone}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-ink-500 text-xs">Status</p>
                          <span className={`badge ${disp.status === 'delivered' ? 'bg-nature-50 text-nature-700' : disp.status === 'returned' ? 'bg-accent-50 text-accent-700' : 'bg-weather-50 text-weather-700'}`}>{disp.status.replace('_', ' ')}</span>
                        </div>
                        {disp.notes && (
                          <div className="col-span-2">
                            <p className="text-ink-500 text-xs">Notes</p>
                            <p className="font-medium">{disp.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Sell request details modal */}
      {sellDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4 overflow-y-auto">
          <div className="card w-full max-w-2xl p-6 my-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-ink-900 flex items-center gap-2">
                <BadgeIndianRupee className="h-5 w-5 text-brand-600" /> Sell Request Details
              </h3>
              <button onClick={() => setSellDetailsModal(null)} className="text-ink-400 hover:text-ink-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-ink-500">Request ID</p>
                  <p className="text-sm font-semibold text-ink-900">#{sellDetailsModal.id.slice(0, 12)}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-500">Date</p>
                  <p className="text-sm font-semibold text-ink-900">{new Date(sellDetailsModal.created_at).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-500">Status</p>
                  <span className={`badge ${statusColors[sellDetailsModal.status] ?? 'bg-ink-100 text-ink-600'}`}>{sellDetailsModal.status.replace('_', ' ')}</span>
                </div>
              </div>
              <div className="border-t border-ink-100 pt-3">
                <h4 className="text-sm font-bold text-ink-900 mb-2">Device Info</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-ink-500 text-xs">Brand</p>
                    <p className="font-medium">{sellDetailsModal.brand}</p>
                  </div>
                  <div>
                    <p className="text-ink-500 text-xs">Model</p>
                    <p className="font-medium">{sellDetailsModal.model}</p>
                  </div>
                  <div>
                    <p className="text-ink-500 text-xs">Condition</p>
                    <p className="font-medium">{sellDetailsModal.condition}</p>
                  </div>
                </div>
              </div>
              <div className="border-t border-ink-100 pt-3">
                <h4 className="text-sm font-bold text-ink-900 mb-2">Price Info</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {sellDetailsModal.estimated_price && (
                    <div>
                      <p className="text-ink-500 text-xs">Estimated Price</p>
                      <p className="font-medium">{formatINR(sellDetailsModal.estimated_price)}</p>
                    </div>
                  )}
                  {sellDetailsModal.final_price && (
                    <div>
                      <p className="text-ink-500 text-xs">Final Price</p>
                      <p className="font-bold text-brand-600">{formatINR(sellDetailsModal.final_price)}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="border-t border-ink-100 pt-3">
                <h4 className="text-sm font-bold text-ink-900 mb-2">Pickup Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {sellDetailsModal.pickup_address && (
                    <div className="col-span-2">
                      <p className="text-ink-500 text-xs">Address</p>
                      <p className="font-medium">{sellDetailsModal.pickup_address}</p>
                    </div>
                  )}
                  {sellDetailsModal.pickup_person_name && (
                    <>
                      <div>
                        <p className="text-ink-500 text-xs">Pickup Person</p>
                        <p className="font-medium">{sellDetailsModal.pickup_person_name}</p>
                      </div>
                      <div>
                        <p className="text-ink-500 text-xs">Phone</p>
                        <p className="font-medium">{sellDetailsModal.pickup_person_phone}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User details modal */}
      {userDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4 overflow-y-auto">
          <div className="card w-full max-w-3xl p-6 my-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-ink-900 flex items-center gap-2">
                <UserCog className="h-5 w-5 text-brand-600" /> User Details
              </h3>
              <button onClick={() => setUserDetailsModal(null)} className="text-ink-400 hover:text-ink-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full grid place-items-center ${userDetailsModal.role === 'admin' ? 'bg-brand-100 text-brand-700' : userDetailsModal.role === 'wholesaler' ? 'bg-accent-100 text-accent-700' : 'bg-ink-100 text-ink-600'}`}>
                  {userDetailsModal.role === 'admin' ? <ShieldCheck className="h-8 w-8" /> : userDetailsModal.role === 'wholesaler' ? <Store className="h-8 w-8" /> : <UserCog className="h-8 w-8" />}
                </div>
                <div>
                  <p className="font-display font-bold text-xl text-ink-900">{userDetailsModal.full_name ?? 'Unnamed User'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`badge ${userDetailsModal.role === 'admin' ? 'bg-brand-50 text-brand-700' : userDetailsModal.role === 'wholesaler' ? 'bg-accent-50 text-accent-700' : 'bg-ink-50 text-ink-700'}`}>{userDetailsModal.role}</span>
                    {userDetailsModal.is_verified && <span className="badge bg-nature-50 text-nature-700">Verified</span>}
                  </div>
                  <p className="text-sm text-ink-500 mt-1">
                    {userDetailsModal.phone ?? 'No phone'}
                    {userDetailsModal.business_name ? ` · ${userDetailsModal.business_name}` : ''}
                  </p>
                  <p className="text-xs text-ink-400">Joined: {new Date(userDetailsModal.created_at).toLocaleDateString('en-IN')}</p>
                </div>
              </div>

              <div className="border-t border-ink-100 pt-4">
                <h4 className="font-bold text-ink-900 mb-3">Orders</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {orders.filter(o => o.user_id === userDetailsModal.id).length === 0 ? (
                    <p className="text-sm text-ink-500">No orders yet</p>
                  ) : (
                    orders.filter(o => o.user_id === userDetailsModal.id).map(o => (
                      <div key={o.id} className="flex items-center justify-between bg-ink-50 rounded-lg p-2 text-sm">
                        <div>
                          <p className="font-medium">#{o.id.slice(0, 8)}</p>
                          <p className="text-xs text-ink-500">{formatINR(o.total_amount)}</p>
                        </div>
                        <span className={`badge ${statusColors[o.status] ?? 'bg-ink-100 text-ink-600'}`}>{o.status}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="border-t border-ink-100 pt-4">
                <h4 className="font-bold text-ink-900 mb-3">Sell Requests</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {sells.filter(s => s.user_id === userDetailsModal.id).length === 0 ? (
                    <p className="text-sm text-ink-500">No sell requests yet</p>
                  ) : (
                    sells.filter(s => s.user_id === userDetailsModal.id).map(s => (
                      <div key={s.id} className="flex items-center justify-between bg-ink-50 rounded-lg p-2 text-sm">
                        <div>
                          <p className="font-medium">{s.brand} {s.model}</p>
                          <p className="text-xs text-ink-500">#{s.id.slice(0, 8)}</p>
                        </div>
                        <span className={`badge ${statusColors[s.status] ?? 'bg-ink-100 text-ink-600'}`}>{s.status.replace('_', ' ')}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="border-t border-ink-100 pt-4">
                <h4 className="font-bold text-ink-900 mb-3">Repair Bookings</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {repairs.filter(r => r.user_id === userDetailsModal.id).length === 0 ? (
                    <p className="text-sm text-ink-500">No repair bookings yet</p>
                  ) : (
                    repairs.filter(r => r.user_id === userDetailsModal.id).map(r => (
                      <div key={r.id} className="flex items-center justify-between bg-ink-50 rounded-lg p-2 text-sm">
                        <div>
                          <p className="font-medium">{r.brand} {r.model}</p>
                          <p className="text-xs text-ink-500">{r.tracking_id}</p>
                        </div>
                        <span className={`badge ${statusColors[r.status] ?? 'bg-ink-100 text-ink-600'}`}>{r.status.replace('_', ' ')}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
