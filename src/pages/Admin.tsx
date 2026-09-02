import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Menu,
  X,
  Plus,
  RefreshCw,
  Smartphone,
  MapPin,
  Tag,
  Wrench,
  ShieldAlert,
  Lock,
  LogIn,
  LogOut,
  Truck,
  ShieldCheck,
  Camera,
  Upload,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type {
  Product,
  SellRequest,
  SellPriceConfig,
  RepairBooking,
  Order,
  SparePart,
  Review,
  DeliveryAgent,
  MasterPhone,
} from './admin/adminTypes';
import type { AdminTab } from './admin/adminTypes';
import { savePriceOverride } from '../lib/priceSync';
import { LUCKNOW_AREAS } from '../types';
import { db, formatINR } from '../lib/db';
import { ALL_INDIAN_PHONES_CATALOG } from '../data/indianPhonesCatalog';
import {
  syncAllIndianPhonesToDbApi,
  addCustomIndianPhoneApi,
} from '../lib/mobileApi';
import { soundNotifier } from '../lib/soundAlert';
import AdminLiveNotifier, { LiveNotification } from '../components/admin/AdminLiveNotifier';

// Sub-page modular components
import AdminSidebar from './admin/AdminSidebar';
import AdminOverview from './admin/AdminOverview';
import AdminSellRequests from './admin/AdminSellRequests';
import AdminRepairs from './admin/AdminRepairs';
import AdminCatalog from './admin/AdminCatalog';
import AdminPricingRules from './admin/AdminPricingRules';
import AdminOrders from './admin/AdminOrders';
import AdminProducts from './admin/AdminProducts';
import AdminDeliveryAgents from './admin/AdminDeliveryAgents';
import AdminSpareParts from './admin/AdminSpareParts';
import AdminUsers from './admin/AdminUsers';
import AdminReviews from './admin/AdminReviews';
import AdminHeroPosters from './admin/AdminHeroPosters';
import AdminWholesalers from './admin/AdminWholesalers';
import AdminContactQueries from './admin/AdminContactQueries';

export default function Admin() {
  const { user, profile, loading, signIn, signOut } = useAuth();
  const navigate = useNavigate();
  const { subtab } = useParams<{ subtab?: string }>();
  const [searchParams] = useSearchParams();

  // Admin Login Form State
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);

  const handleAdminSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAdminLoginLoading(true);
    setAdminLoginError(null);
    try {
      const res = await signIn(adminEmail, adminPassword);
      if (res.error) throw new Error(res.error);
    } catch (err: any) {
      setAdminLoginError(err?.message || 'Invalid admin credentials');
    } finally {
      setAdminLoginLoading(false);
    }
  };

  // Tab state derived from URL or params
  const [tab, setTab] = useState<AdminTab>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Live Notification alerts
  const [activeNotifications, setActiveNotifications] = useState<LiveNotification[]>([]);
  const isInitialLoad = useRef(true);

  // Data Stores
  const [products, setProducts] = useState<Product[]>([]);
  const [masterPhones, setMasterPhones] = useState<MasterPhone[]>(ALL_INDIAN_PHONES_CATALOG);
  const [sells, setSells] = useState<SellRequest[]>([]);
  const [sellPriceConfigs, setSellPriceConfigs] = useState<SellPriceConfig[]>([]);
  const [repairs, setRepairs] = useState<RepairBooking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [parts, setParts] = useState<SparePart[]>([]);
  const [profiles, setProfiles] = useState<
    Array<{
      id: string;
      full_name: string | null;
      phone: string | null;
      role: string;
      business_name: string | null;
      is_verified: boolean;
      created_at: string;
    }>
  >([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [agents, setAgents] = useState<DeliveryAgent[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Selection states
  const [selectedPhoneId, setSelectedPhoneId] = useState<string | null>(ALL_INDIAN_PHONES_CATALOG[0]?.id || null);
  const [selectedSellId, setSelectedSellId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedRepairId, setSelectedRepairId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [selectedPricingId, setSelectedPricingId] = useState<string | null>(null);
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

  // Sync tab with URL parameter
  useEffect(() => {
    if (subtab) {
      const validTabs: AdminTab[] = [
        'overview',
        'catalog',
        'sells',
        'orders',
        'repairs',
        'wholesalers',
        'agents',
        'products',
        'pricing',
        'banners',
        'parts',
        'users',
        'reviews',
      ];
      if (validTabs.includes(subtab as AdminTab)) {
        setTab(subtab as AdminTab);
        return;
      }
    }
    const queryTab = searchParams.get('tab');
    if (queryTab) {
      setTab(queryTab as AdminTab);
    }
  }, [subtab, searchParams]);

  // Modals state
  // 1. Delivery Agent Modal
  const [agentModalOpen, setAgentModalOpen] = useState(false);
  const [agentForm, setAgentForm] = useState({
    name: '',
    phone: '',
    email: '',
    login_pin: 'Rider@123',
    zones: ['Gomti Nagar', 'Hazratganj', 'Aliganj', 'Indira Nagar'] as string[],
    vehicle_type: 'Hero Splendor (Bike)',
    vehicle_number: 'UP 32 BK 4421',
    max_capacity: 6,
    status: 'available' as 'available' | 'offline',
    current_locality: 'Gomti Nagar, Lucknow',
  });
  const [agentSaving, setAgentSaving] = useState(false);

  // 2. List Master Phone into Store Modal
  const [listPhoneModal, setListPhoneModal] = useState<{ phone: MasterPhone } | null>(null);
  const [listPhoneForm, setListPhoneForm] = useState({
    title: '',
    brand: '',
    model: '',
    ram: '',
    storage: '',
    color: 'Midnight Black',
    condition: 'Excellent' as 'Excellent' | 'Good' | 'Fair',
    price: '',
    original_price: '',
    discount_percent: '35',
    offer_tag: '🔥 Hot Deal',
    warranty_months: '6',
    stock: '2',
    description: '',
    images: '',
  });
  const [listPhoneSaving, setListPhoneSaving] = useState(false);

  // 3. Product Add/Edit Modal
  const [productModal, setProductModal] = useState<{ product: Product | null } | null>(null);
  const [productForm, setProductForm] = useState({
    title: '',
    brand: '',
    model: '',
    ram: '',
    storage: '',
    color: '',
    condition: 'Excellent' as 'Excellent' | 'Good' | 'Fair',
    price: '',
    original_price: '',
    discount_percent: '0',
    offer_tag: '',
    warranty_months: '6',
    description: '',
    images: '',
    is_approved: true,
    is_featured: false,
    show_all_grades: true,
    stock: '0',
  });
  const [productSaving, setProductSaving] = useState(false);

  // 4. Custom Phone Model Modal
  const [customPhoneModalOpen, setCustomPhoneModalOpen] = useState(false);
  const [customPhoneForm, setCustomPhoneForm] = useState({
    brand: 'Apple',
    model: '',
    release_year: '2024',
    ram_options: '8GB, 12GB',
    storage_options: '128GB, 256GB, 512GB',
    default_mrp: '69999',
    base_resale_value: '38000',
    popular_tag: 'Indian 5G Smartphone',
    processor: 'Octa-core 5G Processor',
    camera_spec: '50MP OIS Camera',
    battery_spec: '5000 mAh Fast Charging',
    display_spec: '6.7" AMOLED 120Hz',
    is_5g: true,
  });
  const [customPhoneSaving, setCustomPhoneSaving] = useState(false);
  const [syncingCatalog, setSyncingCatalog] = useState(false);

  // 5. Pricing Rule Modal
  const [pricingModal, setPricingModal] = useState<{ config: SellPriceConfig | null } | null>(null);
  const [pricingForm, setPricingForm] = useState({
    brand: 'Apple',
    model: '',
    storage: '128GB',
    base_price: '20000',
    excellent_multiplier: '0.75',
    good_multiplier: '0.60',
    fair_multiplier: '0.45',
    box_bonus: '600',
    charger_bonus: '400',
    is_active: true,
  });
  const [pricingSaving, setPricingSaving] = useState(false);
  const [generatingPricingRules, setGeneratingPricingRules] = useState(false);

  // 6. Spare Part Modal
  const [partModal, setPartModal] = useState<{ part: SparePart | null } | null>(null);
  const [partForm, setPartForm] = useState({
    title: '',
    brand: '',
    model: '',
    category: 'Screen / Display',
    price: '',
    stock: '5',
    description: '',
    images: '',
    is_approved: true,
  });
  const [partSaving, setPartSaving] = useState(false);

  // Initial Data Fetch
  useEffect(() => {
    const activeRole = profile?.role || user?.role || 'customer';
    if (!loading && (!user || activeRole !== 'admin')) {
      navigate('/admin-login');
      return;
    }

    if (user && activeRole === 'admin') {
      loadAllData();
    }
  }, [user, profile, loading, navigate]);

  const loadAllData = async () => {
    setDataLoading(true);
    setFetchError(null);
    try {
      // Fetch all tables independently so one failure doesn't block others
      const [productsRes, sellsRes, pricingRes, repairsRes, ordersRes, partsRes, profilesRes, reviewsRes, agentsRes, masterPhonesRes] =
        await Promise.all([
          db.from('products').select('*').limit(250).sort({ field: 'created_at', ascending: false }),
          db.from('sell_requests').select('*').limit(250).sort({ field: 'created_at', ascending: false }),
          db.from('sell_price_configs').select('*').limit(250).sort({ field: 'created_at', ascending: false }),
          db.from('repair_bookings').select('*').limit(250).sort({ field: 'created_at', ascending: false }),
          db.from('orders').select('*').limit(250).sort({ field: 'created_at', ascending: false }),
          db.from('spare_parts').select('*').limit(250).sort({ field: 'created_at', ascending: false }),
          db.from('profiles').select('*').limit(250).sort({ field: 'created_at', ascending: false }),
          db.from('reviews').select('*').limit(250).sort({ field: 'created_at', ascending: false }),
          db.from('delivery_agents').select('*').limit(100).sort({ field: 'created_at', ascending: false }),
          db.from('master_phones').select('*').limit(150).sort({ field: 'release_year', ascending: false }),
        ]);

      // Log any per-table errors but keep loading the rest
      const errors: string[] = [];
      if (productsRes.error) errors.push(`products: ${productsRes.error.message}`);
      else if (productsRes.data) setProducts(productsRes.data as Product[]);

      if (sellsRes.error) errors.push(`sell_requests: ${sellsRes.error.message}`);
      else if (sellsRes.data) setSells(sellsRes.data as SellRequest[]);

      if (pricingRes.error) errors.push(`pricing: ${pricingRes.error.message}`);
      else if (pricingRes.data) setSellPriceConfigs(pricingRes.data as SellPriceConfig[]);

      if (repairsRes.error) errors.push(`repairs: ${repairsRes.error.message}`);
      else if (repairsRes.data) setRepairs(repairsRes.data as RepairBooking[]);

      if (ordersRes.error) errors.push(`orders: ${ordersRes.error.message}`);
      else if (ordersRes.data) setOrders(ordersRes.data as Order[]);

      if (partsRes.error) errors.push(`spare_parts: ${partsRes.error.message}`);
      else if (partsRes.data) setParts(partsRes.data as SparePart[]);

      if (profilesRes.error) errors.push(`profiles: ${profilesRes.error.message}`);
      else if (profilesRes.data) setProfiles(profilesRes.data as any[]);

      if (reviewsRes.error) errors.push(`reviews: ${reviewsRes.error.message}`);
      else if (reviewsRes.data) setReviews(reviewsRes.data as Review[]);

      if (agentsRes.error) errors.push(`delivery_agents: ${agentsRes.error.message}`);
      else if (agentsRes.data) setAgents(agentsRes.data as DeliveryAgent[]);

      if (masterPhonesRes.error) errors.push(`master_phones: ${masterPhonesRes.error.message}`);
      else if (Array.isArray(masterPhonesRes.data) && masterPhonesRes.data.length > 0) {
        setMasterPhones(masterPhonesRes.data as MasterPhone[]);
      }

      if (errors.length > 0) {
        console.warn('[Admin] Some tables failed to load:', errors);
        setFetchError(`Backend errors: ${errors.join(', ')}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network error — unable to connect to backend server.';
      console.error('[Admin] Failed to load admin data:', msg);
      setFetchError(msg);
    } finally {
      setDataLoading(false);
    }
  };

  // Real-time Background Lead Listener with Audio Chimes
  useEffect(() => {
    const activeRole = profile?.role || user?.role || 'customer';
    if (!user || activeRole !== 'admin') return;

    const pollInterval = setInterval(async () => {
      try {
        const [sellsRes, repairsRes, ordersRes] = await Promise.all([
          db.from('sell_requests').select('*').sort({ field: 'created_at', ascending: false }).limit(5),
          db.from('repair_bookings').select('*').sort({ field: 'created_at', ascending: false }).limit(5),
          db.from('orders').select('*').sort({ field: 'created_at', ascending: false }).limit(5),
        ]);

        if (sellsRes.data && Array.isArray(sellsRes.data) && sellsRes.data.length > 0) {
          const freshSells = sellsRes.data as SellRequest[];
          if (!isInitialLoad.current && sells.length > 0 && freshSells[0].id !== sells[0]?.id) {
            const newest = freshSells[0];
            const newNotif: LiveNotification = {
              id: newest.id,
              type: 'sell',
              title: `${newest.brand} ${newest.model}`,
              subtitle: `Estimated Valuation: ₹${newest.estimated_price?.toLocaleString('en-IN') || '—'}`,
              locality: newest.pickup_area || 'Lucknow',
              amount: newest.estimated_price,
              timestamp: new Date(),
              tabTarget: 'sells',
            };
            setActiveNotifications((prev) => [newNotif, ...prev.slice(0, 3)]);
            soundNotifier.playChime('sell');
            setSells(freshSells);
          }
        }

        if (repairsRes.data && Array.isArray(repairsRes.data) && repairsRes.data.length > 0) {
          const freshRepairs = repairsRes.data as RepairBooking[];
          if (!isInitialLoad.current && repairs.length > 0 && freshRepairs[0].id !== repairs[0]?.id) {
            const newest = freshRepairs[0];
            const newNotif: LiveNotification = {
              id: newest.id,
              type: 'repair',
              title: `${newest.brand} ${newest.model}`,
              subtitle: `Problem: ${newest.problem}`,
              locality: newest.pickup_area || 'Lucknow',
              amount: newest.estimated_cost,
              timestamp: new Date(),
              tabTarget: 'repairs',
            };
            setActiveNotifications((prev) => [newNotif, ...prev.slice(0, 3)]);
            soundNotifier.playChime('repair');
            setRepairs(freshRepairs);
          }
        }

        if (ordersRes.data && Array.isArray(ordersRes.data) && ordersRes.data.length > 0) {
          const freshOrders = ordersRes.data as Order[];
          if (!isInitialLoad.current && orders.length > 0 && freshOrders[0].id !== orders[0]?.id) {
            const newest = freshOrders[0];
            const newNotif: LiveNotification = {
              id: newest.id,
              type: 'order',
              title: `Order #${newest.id.slice(0, 8).toUpperCase()}`,
              subtitle: `Total Amount: ₹${newest.total_amount?.toLocaleString('en-IN')}`,
              locality: newest.delivery_area || 'Lucknow',
              amount: newest.total_amount,
              timestamp: new Date(),
              tabTarget: 'orders',
            };
            setActiveNotifications((prev) => [newNotif, ...prev.slice(0, 3)]);
            soundNotifier.playChime('order');
            setOrders(freshOrders);
          }
        }

        isInitialLoad.current = false;
      } catch (err) {
        // silent polling catch
      }
    }, 8000);

    return () => clearInterval(pollInterval);
  }, [user, profile, sells, repairs, orders]);

  const handleSimulateTestAlert = () => {
    const mockLead: LiveNotification = {
      id: `test_${Date.now()}`,
      type: 'sell',
      title: 'Apple iPhone 14 Pro Max (256GB)',
      subtitle: 'Excellent Condition • Box & Charger available',
      locality: 'Gomti Nagar, Lucknow',
      amount: 68500,
      timestamp: new Date(),
      tabTarget: 'sells',
    };
    setActiveNotifications((prev) => [mockLead, ...prev.slice(0, 3)]);
    soundNotifier.playChime('sell');
  };

  // Status Updaters
  const updateStatus = async (table: 'sell_requests' | 'orders' | 'repair_bookings', id: string, status: string) => {
    const { error } = await db.from(table).update({ status }).eq('id', id);
    if (error) {
      alert(error.message);
      return;
    }
    if (table === 'sell_requests') setSells((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    if (table === 'orders') setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    if (table === 'repair_bookings') setRepairs((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  // Agent Reassignments
  const reassignSellAgent = async (sellId: string, agentId: string) => {
    const agent = agents.find((a) => a.id === agentId);
    if (!agent) return;
    const { error } = await db
      .from('sell_requests')
      .update({
        assigned_agent_id: agent.id,
        pickup_person_name: agent.name,
        pickup_person_phone: agent.phone,
        status: 'assigned',
      })
      .eq('id', sellId);

    if (error) {
      alert(error.message);
      return;
    }
    setSells((prev) =>
      prev.map((s) =>
        s.id === sellId
          ? {
              ...s,
              assigned_agent_id: agent.id,
              pickup_person_name: agent.name,
              pickup_person_phone: agent.phone,
              status: 'assigned',
            }
          : s
      )
    );
  };

  const reassignOrderAgent = async (orderId: string, agentId: string) => {
    const agent = agents.find((a) => a.id === agentId);
    if (!agent) return;
    const { error } = await db
      .from('orders')
      .update({
        assigned_agent_id: agent.id,
        delivery_person_name: agent.name,
        delivery_person_phone: agent.phone,
        status: 'assigned',
      })
      .eq('id', orderId);

    if (error) {
      alert(error.message);
      return;
    }
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              assigned_agent_id: agent.id,
              delivery_person_name: agent.name,
              delivery_person_phone: agent.phone,
              status: 'assigned',
            }
          : o
      )
    );
  };

  // List Phone from Catalog into Store
  const openListPhoneToStore = (phone: MasterPhone) => {
    const recommendedPrice = Math.round((phone.base_resale_value || 15000) * 1.15);
    const originalMrp = phone.default_mrp || Math.round(recommendedPrice * 1.5);
    const discount = Math.round(((originalMrp - recommendedPrice) / originalMrp) * 100);

    setListPhoneForm({
      title: `${phone.brand} ${phone.model} (${phone.storage_options[0] || '128GB'})`,
      brand: phone.brand,
      model: phone.model,
      ram: phone.ram_options[0] || '8GB',
      storage: phone.storage_options[0] || '128GB',
      color: 'Midnight Black',
      condition: 'Excellent',
      price: String(recommendedPrice),
      original_price: String(originalMrp),
      discount_percent: String(discount),
      offer_tag: phone.popular_tag ? `🔥 ${phone.popular_tag}` : '⚡ Hot Deal',
      warranty_months: '6',
      stock: '2',
      description: `Certified refurbished ${phone.brand} ${phone.model}. Powered by ${phone.processor || 'high performance processor'}. Camera: ${phone.camera_spec || '50MP camera'}. Battery: ${phone.battery_spec || '5000mAh'}. 32-point inspection passed with 6-month Fundu Lucknow warranty.`,
      images: phone.image_url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
    });
    setListPhoneModal({ phone });
  };

  const publishPhoneToStore = async () => {
    setListPhoneSaving(true);
    try {
      const payload = {
        title: listPhoneForm.title,
        brand: listPhoneForm.brand,
        model: listPhoneForm.model,
        ram: listPhoneForm.ram || null,
        storage: listPhoneForm.storage || null,
        color: listPhoneForm.color || null,
        condition: listPhoneForm.condition,
        price: Number(listPhoneForm.price),
        original_price: listPhoneForm.original_price ? Number(listPhoneForm.original_price) : null,
        discount_percent: Number(listPhoneForm.discount_percent) || 0,
        offer_tag: listPhoneForm.offer_tag || null,
        warranty_months: Number(listPhoneForm.warranty_months) || 6,
        description: listPhoneForm.description || null,
        images: listPhoneForm.images.split('\n').map((s) => s.trim()).filter(Boolean),
        is_approved: true,
        is_featured: true,
        stock: Number(listPhoneForm.stock) || 1,
      };

      const { data, error } = await db.from('products').insert(payload).select('*').single();
      const newProduct: Product = (data as Product) || {
        id: 'prod-' + Date.now(),
        ...payload,
        sold_count: 0,
        seller_id: null,
        created_at: new Date().toISOString(),
      };

      setProducts((prev) => [newProduct, ...prev]);
      setSelectedProductId(newProduct.id);
      setListPhoneModal(null);

      if (error) console.warn('Product insert notice:', error.message);
      alert(`🎉 ${payload.title} successfully listed in Buy Store!`);
    } catch (err: any) {
      alert(err?.message || 'Failed to publish phone to store');
    } finally {
      setListPhoneSaving(false);
    }
  };

  // Bulk Sync Catalog
  const handleSyncAllPhonesToDb = async () => {
    setSyncingCatalog(true);
    try {
      const res = await syncAllIndianPhonesToDbApi();
      if (res.error) throw new Error(res.error);
      alert(`🎉 Successfully synced ${res.count || ALL_INDIAN_PHONES_CATALOG.length} smartphones into database!`);
      const { data } = await db.from('master_phones').select('*');
      if (Array.isArray(data) && data.length > 0) {
        setMasterPhones(data as MasterPhone[]);
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to sync phones into database');
    } finally {
      setSyncingCatalog(false);
    }
  };

  // Pricing Rules
  const handleAutoGenerateIndianPricingRules = async () => {
    setGeneratingPricingRules(true);
    try {
      let created = 0;
      for (const phone of masterPhones) {
        const payload = {
          brand: phone.brand,
          model: phone.model,
          storage: phone.storage_options[0] || '128GB',
          base_price: phone.base_resale_value || 15000,
          excellent_multiplier: 0.75,
          good_multiplier: 0.6,
          fair_multiplier: 0.45,
          box_bonus: 600,
          charger_bonus: 400,
          is_active: true,
        };
        await db.from('sell_price_configs').insert(payload);
        created++;
      }
      const { data } = await db.from('sell_price_configs').select('*');
      if (data) setSellPriceConfigs(data as SellPriceConfig[]);
      alert(`🎉 Auto-generated ${created} sell pricing rules!`);
    } catch (err: any) {
      alert(err?.message || 'Failed to generate rules');
    } finally {
      setGeneratingPricingRules(false);
    }
  };

  const savePricingRule = async () => {
    setPricingSaving(true);
    try {
      const payload = {
        brand: pricingForm.brand,
        model: pricingForm.model,
        storage: pricingForm.storage || null,
        base_price: Number(pricingForm.base_price),
        excellent_multiplier: Number(pricingForm.excellent_multiplier),
        good_multiplier: Number(pricingForm.good_multiplier),
        fair_multiplier: Number(pricingForm.fair_multiplier),
        box_bonus: Number(pricingForm.box_bonus) || 0,
        charger_bonus: Number(pricingForm.charger_bonus) || 0,
        is_active: pricingForm.is_active,
      };

      if (pricingModal?.config) {
        const { data, error } = await db
          .from('sell_price_configs')
          .update(payload)
          .eq('id', pricingModal.config.id)
          .select('*')
          .single();
        if (error) throw error;
        savePriceOverride(pricingForm.brand, pricingForm.model, Number(pricingForm.base_price), pricingForm.storage);
        setSellPriceConfigs((prev) =>
          prev.map((c) => (c.id === pricingModal.config?.id ? (data as SellPriceConfig) : c))
        );
      } else {
        const { data, error } = await db.from('sell_price_configs').insert(payload).select('*').single();
        if (error) throw error;
        savePriceOverride(pricingForm.brand, pricingForm.model, Number(pricingForm.base_price), pricingForm.storage);
        setSellPriceConfigs((prev) => [data as SellPriceConfig, ...prev]);
      }
      setPricingModal(null);
    } catch (err: any) {
      alert(err?.message || 'Failed to save price rule');
    } finally {
      setPricingSaving(false);
    }
  };

  const deletePricingRule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pricing rule?')) return;
    const { error } = await db.from('sell_price_configs').delete().eq('id', id);
    if (error) {
      alert(error.message);
      return;
    }
    setSellPriceConfigs((prev) => prev.filter((c) => c.id !== id));
  };

  // Product actions
  const toggleApproval = async (table: 'products' | 'spare_parts' | 'reviews', id: string, current: boolean) => {
    const { error } = await db.from(table).update({ is_approved: !current }).eq('id', id);
    if (error) {
      alert(error.message);
      return;
    }
    if (table === 'products') setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, is_approved: !current } : p)));
    if (table === 'spare_parts') setParts((prev) => prev.map((p) => (p.id === id ? { ...p, is_approved: !current } : p)));
    if (table === 'reviews') setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, is_approved: !current } : r)));
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const { error } = await db.from('products').delete().eq('id', id);
    if (error) {
      alert(error.message);
      return;
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const saveProduct = async () => {
    setProductSaving(true);
    try {
      const payload = {
        title: productForm.title,
        brand: productForm.brand,
        model: productForm.model,
        ram: productForm.ram || null,
        storage: productForm.storage || null,
        color: productForm.color || null,
        condition: productForm.condition,
        price: Number(productForm.price),
        original_price: productForm.original_price ? Number(productForm.original_price) : null,
        discount_percent: Number(productForm.discount_percent) || 0,
        offer_tag: productForm.offer_tag || null,
        warranty_months: Number(productForm.warranty_months) || 6,
        description: productForm.description || null,
        images: productForm.images.split('\n').map((s) => s.trim()).filter(Boolean),
        is_approved: productForm.is_approved,
        is_featured: productForm.is_featured,
        show_all_grades: productForm.show_all_grades,
        stock: Number(productForm.stock) || 0,
      };

      if (productModal?.product) {
        const { data, error } = await db
          .from('products')
          .update(payload)
          .eq('id', productModal.product.id)
          .select('*')
          .single();
        if (error) throw error;
        setProducts((prev) => prev.map((p) => (p.id === productModal.product?.id ? (data as Product) : p)));
      } else {
        const { data, error } = await db.from('products').insert(payload).select('*').single();
        if (error) throw error;
        setProducts((prev) => [data as Product, ...prev]);
        setSelectedProductId((data as Product).id);
      }
      setProductModal(null);
    } catch (err: any) {
      alert(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setProductSaving(false);
    }
  };

  // Spare Parts actions
  const saveSparePart = async () => {
    setPartSaving(true);
    try {
      const payload = {
        title: partForm.title.trim(),
        brand: partForm.brand.trim(),
        model: partForm.model.trim(),
        category: partForm.category,
        price: Number(partForm.price),
        stock: Number(partForm.stock) || 0,
        description: partForm.description.trim() || null,
        images: partForm.images.split('\n').map((s) => s.trim()).filter(Boolean),
        is_approved: partForm.is_approved,
      };

      if (partModal?.part) {
        const { data, error } = await db
          .from('spare_parts')
          .update(payload)
          .eq('id', partModal.part.id)
          .select('*')
          .single();
        if (error) throw error;
        setParts((prev) => prev.map((p) => (p.id === partModal.part?.id ? (data as SparePart) : p)));
      } else {
        const { data, error } = await db.from('spare_parts').insert(payload).select('*').single();
        if (error) throw error;
        setParts((prev) => [data as SparePart, ...prev]);
        setSelectedPartId((data as SparePart).id);
      }
      setPartModal(null);
    } catch (err: any) {
      alert(err?.message || 'Failed to save spare part');
    } finally {
      setPartSaving(false);
    }
  };

  const deleteSparePart = async (id: string) => {
    if (!confirm('Are you sure you want to delete this spare part?')) return;
    const { error } = await db.from('spare_parts').delete().eq('id', id);
    if (error) {
      alert(error.message);
      return;
    }
    setParts((prev) => prev.filter((p) => p.id !== id));
  };

  // User actions
  const updateUserRole = async (userId: string, role: string) => {
    const { error } = await db.from('profiles').update({ role }).eq('id', userId);
    if (error) {
      alert(error.message);
      return;
    }
    setProfiles((prev) => prev.map((p) => (p.id === userId ? { ...p, role } : p)));
  };

  const toggleUserVerification = async (userId: string, current: boolean) => {
    const { error } = await db.from('profiles').update({ is_verified: !current }).eq('id', userId);
    if (error) {
      alert(error.message);
      return;
    }
    setProfiles((prev) => prev.map((p) => (p.id === userId ? { ...p, is_verified: !current } : p)));
  };

  // Review actions
  const deleteReview = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    const { error } = await db.from('reviews').delete().eq('id', id);
    if (error) {
      alert(error.message);
      return;
    }
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  // Delivery agent actions
  const toggleAgentStatus = async (agent: DeliveryAgent) => {
    const nextStatus = agent.status === 'available' ? 'offline' : 'available';
    const { error } = await db.from('delivery_agents').update({ status: nextStatus }).eq('id', agent.id);
    if (error) {
      alert(error.message);
      return;
    }
    setAgents((prev) => prev.map((a) => (a.id === agent.id ? { ...a, status: nextStatus } : a)));
  };

  const saveDeliveryAgent = async () => {
    if (!agentForm.name.trim() || !agentForm.phone.trim()) {
      alert('⚠️ Please enter delivery partner full name and phone number.');
      return;
    }
    setAgentSaving(true);
    try {
      const generatedRiderId = `LKO-RIDER-${Math.floor(1000 + Math.random() * 9000)}`;
      const generatedEmail =
        agentForm.email.trim() ||
        `rider.${agentForm.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@fundu.in`;
      const loginPin = agentForm.login_pin.trim() || 'Rider@123';

      const payload = {
        name: agentForm.name.trim(),
        phone: agentForm.phone.trim(),
        email: generatedEmail,
        login_pin: loginPin,
        rider_id: generatedRiderId,
        zones: agentForm.zones,
        vehicle_type: agentForm.vehicle_type,
        vehicle_number: agentForm.vehicle_number.trim() || 'UP 32 BK 4421',
        max_capacity: Number(agentForm.max_capacity) || 6,
        status: agentForm.status,
        current_locality: agentForm.current_locality,
        current_orders_count: 0,
        rating: 4.9,
      };

      const { data, error } = await db.from('delivery_agents').insert(payload).select('*').single();
      if (error) throw error;

      // Also create login account in database
      await db.from('users').insert({
        email: generatedEmail,
        password: loginPin,
        full_name: agentForm.name.trim(),
        phone: agentForm.phone.trim(),
        role: 'delivery',
        is_verified: true,
      });

      setAgents((prev) => [data as DeliveryAgent, ...prev]);
      setAgentModalOpen(false);

      const secretUrl = `${window.location.origin}/fleet-desk`;
      const waText =
        `🎉 *WELCOME TO FUNDU DISPATCH FLEET - RIDER ID ISSUED*\n\n` +
        `👤 *Agent Name:* ${agentForm.name}\n` +
        `🆔 *Rider ID:* ${generatedRiderId}\n` +
        `📧 *Login Email:* ${generatedEmail}\n` +
        `🔑 *Secret Passcode:* ${loginPin}\n` +
        `📍 *Assigned Zone:* ${agentForm.current_locality}\n` +
        `🔗 *Private Fleet Portal URL:* ${secretUrl}\n\n` +
        `Please log in on the private fleet portal and keep GPS online for doorstep pickups.`;

      const waUrl = `https://wa.me/91${agentForm.phone.replace(/\D/g, '')}?text=${encodeURIComponent(waText)}`;

      alert(
        `🎉 Delivery Partner Account Created Successfully!\n\n` +
        `🆔 Rider ID: ${generatedRiderId}\n` +
        `📧 Login Email: ${generatedEmail}\n` +
        `🔑 Secret Login Passcode: ${loginPin}\n` +
        `🔗 Private Fleet Desk: ${secretUrl}\n\n` +
        `Opening WhatsApp briefing link to send to ${agentForm.name}...`
      );

      window.open(waUrl, '_blank');
    } catch (err: any) {
      alert(err?.message || 'Failed to register delivery partner');
    } finally {
      setAgentSaving(false);
    }
  };

  // Custom Model Action
  const saveCustomPhoneModel = async () => {
    setCustomPhoneSaving(true);
    try {
      const payload = {
        brand: customPhoneForm.brand.trim(),
        model: customPhoneForm.model.trim(),
        release_year: Number(customPhoneForm.release_year),
        ram_options: customPhoneForm.ram_options.split(',').map((s) => s.trim()).filter(Boolean),
        storage_options: customPhoneForm.storage_options.split(',').map((s) => s.trim()).filter(Boolean),
        default_mrp: Number(customPhoneForm.default_mrp),
        base_resale_value: Number(customPhoneForm.base_resale_value),
        popular_tag: customPhoneForm.popular_tag.trim(),
        processor: customPhoneForm.processor.trim(),
        camera_spec: customPhoneForm.camera_spec.trim(),
        battery_spec: customPhoneForm.battery_spec.trim(),
        display_spec: customPhoneForm.display_spec.trim(),
        is_5g: customPhoneForm.is_5g,
      };
      const res = await addCustomIndianPhoneApi(payload);
      const newPhone: MasterPhone = res.data;
      setMasterPhones((prev) => [newPhone, ...prev]);
      setSelectedPhoneId(newPhone.id);
      setCustomPhoneModalOpen(false);
      alert(`🎉 Added ${newPhone.brand} ${newPhone.model} to Fundu catalog!`);
    } catch (err: any) {
      alert(err?.message || 'Failed to add custom phone');
    } finally {
      setCustomPhoneSaving(false);
    }
  };

  // 1. DELIVERY PARTNER STRICT BLOCK
  if (profile?.role === 'delivery' || profile?.role === 'rider' || (user as any)?.role === 'delivery') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md bg-slate-900 border border-red-500/40 rounded-3xl p-8 text-center space-y-5 shadow-2xl animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-400 grid place-items-center mx-auto border border-red-500/20 shadow-inner">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="font-display font-black text-2xl text-red-400">Access Restricted</h2>
            <p className="text-xs text-slate-300">
              Delivery Partner & Rider accounts are strictly not permitted to view or manage the Central Admin Console.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-left text-xs text-slate-300 space-y-1">
            <p className="font-bold text-slate-200">Current Logged-in Account:</p>
            <p className="text-slate-400 font-mono">{user?.email || (user as any)?.phone || 'Delivery Agent'}</p>
            <span className="badge bg-amber-500/20 text-amber-300 font-bold text-[10px] uppercase">
              Role: Delivery Partner
            </span>
          </div>
          <div className="pt-2">
            <Link
              to="/delivery"
              className="btn bg-brand-500 hover:bg-brand-600 text-slate-950 font-black px-5 py-3 rounded-2xl w-full flex items-center justify-center gap-2 shadow-lg text-xs"
            >
              <Truck className="h-4 w-4" /> Go to Field Rider Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. ADMIN AUTHENTICATION GATE (If not logged in as Admin)
  const activeRole = profile?.role || user?.role || 'customer';
  if (!user || activeRole !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 animate-fade-in">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-500 text-white grid place-items-center mx-auto shadow-lg">
              <Lock className="h-7 w-7" />
            </div>
            <h1 className="font-display text-2xl font-black">Fundu Central Admin</h1>
            <p className="text-xs text-slate-400">
              Restricted management console for Lucknow Operations.
            </p>
          </div>

          {adminLoginError && (
            <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{adminLoginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminSignIn} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-300 mb-1 block">Admin Email Address</label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@fundu.in"
                className="input bg-slate-800 border-slate-700 text-white text-xs w-full"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 mb-1 block">Admin Password</label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="input bg-slate-800 border-slate-700 text-white text-xs w-full"
              />
            </div>

            <button
              type="submit"
              disabled={adminLoginLoading}
              className="btn bg-brand-500 hover:bg-brand-600 text-slate-950 font-black text-xs py-3 rounded-2xl w-full flex items-center justify-center gap-2 shadow-lg"
            >
              <LogIn className="h-4 w-4" />
              {adminLoginLoading ? 'Authenticating Admin...' : 'Sign In as Administrator'}
            </button>
          </form>

          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-400 space-y-1">
            <p className="font-bold text-slate-300">Default Admin Credentials:</p>
            <p>Email: <span className="font-mono text-brand-400">admin@fundu.in</span></p>
            <p>Password: <span className="font-mono text-brand-400">Admin@123456</span></p>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <Link to="/" className="hover:text-white">← Main Store</Link>
            <Link to="/delivery" className="text-teal-400 hover:underline">Field Rider Portal →</Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-[#f4f7f8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-brand-600" />
          <p className="text-sm font-bold text-ink-700">Loading Fundu Admin Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7f8] text-ink-900 flex">
      {/* 1. Persistent Sidebar Navigation */}
      <AdminSidebar
        activeTab={tab}
        onSelectTab={(newTab) => setTab(newTab)}
        counts={{
          sells: sells.filter((s) => s.status === 'pending' || s.status === 'assigned').length,
          repairs: repairs.filter((r) => r.status !== 'delivered' && r.status !== 'cancelled').length,
          orders: orders.filter((o) => o.status === 'pending' || o.status === 'assigned').length,
          catalog: masterPhones.length,
          products: products.length,
          agents: agents.filter((a) => a.status === 'available').length,
        }}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-[#e5ecef] px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-ink-600 hover:bg-ink-100"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="font-display text-lg font-black text-ink-900 capitalize flex items-center gap-2">
                {tab === 'sells' && 'Sell Requests & Pickups'}
                {tab === 'repairs' && 'Repair Diagnostics'}
                {tab === 'catalog' && 'Master Smartphone Catalog'}
                {tab === 'pricing' && 'Pricing Valuation Rules'}
                {tab === 'orders' && 'Store Customer Orders'}
                {tab === 'products' && 'Refurbished Store Inventory'}
                {tab === 'wholesalers' && 'B2B Wholesalers & Vendor Khata'}
                {tab === 'agents' && 'Lucknow Delivery Fleet'}
                {tab === 'banners' && 'Hero Section Posters & Banners'}
                {tab === 'parts' && 'Spare Parts & OEM Components'}
                {tab === 'users' && 'User Accounts & Roles'}
                {tab === 'reviews' && 'Customer Reviews & Moderation'}
                {tab === 'contact' && 'Customer Help & Contact Queries'}
                {tab === 'overview' && 'Admin Control Center'}
              </h1>
              <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-emerald-600" /> Lucknow Hub Operational
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Audio Chime & Lead Alert Manager */}
            <AdminLiveNotifier
              activeNotifications={activeNotifications}
              onDismiss={(id) => setActiveNotifications((prev) => prev.filter((n) => n.id !== id))}
              onNavigateTab={(targetTab, itemId) => {
                setTab(targetTab);
                if (targetTab === 'sells' && itemId) setSelectedSellId(itemId);
                if (targetTab === 'repairs' && itemId) setSelectedRepairId(itemId);
                if (targetTab === 'orders' && itemId) setSelectedOrderId(itemId);
              }}
              onSimulateTestAlert={handleSimulateTestAlert}
            />

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-ink-100 text-ink-700 text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Admin: {user?.email}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  signOut();
                  navigate('/admin-login');
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 active:scale-95 transition-all shadow-xs"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* Quick Action Hub Bar */}
        <div className="px-4 lg:px-8 py-3 bg-gradient-to-r from-teal-900 to-slate-900 border-b border-teal-800 text-white flex flex-wrap items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black tracking-wide text-teal-300 uppercase flex items-center gap-1">
              ⚡ Admin Quick Actions:
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setTab('products');
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
                  offer_tag: '🔥 Hot Deal',
                  warranty_months: '6',
                  description: '',
                  images: '',
                  is_approved: true,
                  is_featured: false,
                  stock: '1',
                });
                setProductModal({ product: null });
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00a896] hover:bg-teal-600 text-white text-xs font-extrabold shadow-sm transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Add Store Product
            </button>

            <button
              type="button"
              onClick={() => {
                setTab('catalog');
                setCustomPhoneModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 text-xs font-bold transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Add Phone to Catalog
            </button>

            <button
              type="button"
              onClick={() => {
                setTab('agents');
                setAgentModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-emerald-200 border border-emerald-500/30 text-xs font-bold transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Add Delivery Agent
            </button>

            <button
              type="button"
              onClick={() => {
                setTab('parts');
                setPartForm({
                  title: '',
                  brand: 'Apple',
                  model: '',
                  category: 'Screen / Display',
                  price: '',
                  stock: '5',
                  description: '',
                  images: '',
                  is_approved: true,
                });
                setPartModal({ part: null });
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-900/80 hover:bg-purple-800 text-purple-200 border border-purple-500/30 text-xs font-bold transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Add Spare Part
            </button>
          </div>
        </div>

        {/* Tab Sub-Page Renderers */}
        {fetchError && (
          <div className="px-4 lg:px-8 py-2 bg-red-50 border-b border-red-200 flex items-center gap-3 text-red-700 text-xs font-semibold">
            <span>⚠️ {fetchError}</span>
            <button
              onClick={() => loadAllData()}
              className="ml-auto px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}
        <main className="p-4 lg:p-8 space-y-6 flex-1">
          {tab === 'overview' && (
            <AdminOverview
              orders={orders}
              sells={sells}
              repairs={repairs}
              products={products}
              agents={agents}
              masterPhones={masterPhones}
              onNavigateTab={(t) => setTab(t)}
            />
          )}

          {tab === 'sells' && (
            <AdminSellRequests
              sells={sells}
              selectedSellId={selectedSellId}
              onSelectSell={(id) => setSelectedSellId(id)}
              agents={agents}
              masterPhones={masterPhones}
              onUpdateStatus={(id, status) => updateStatus('sell_requests', id, status)}
              onReassignAgent={reassignSellAgent}
              onApproveAndListToStore={openListPhoneToStore}
              onOpenProductModal={() => {
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
                  offer_tag: '🔥 Hot Deal',
                  warranty_months: '6',
                  description: '',
                  images: '',
                  is_approved: true,
                  is_featured: false,
                  stock: '1',
                });
                setProductModal({ product: null });
              }}
            />
          )}

          {tab === 'repairs' && (
            <AdminRepairs
              repairs={repairs}
              selectedRepairId={selectedRepairId}
              onSelectRepair={(id) => setSelectedRepairId(id)}
              agents={agents}
              onUpdateStatus={(id, status) => updateStatus('repair_bookings', id, status)}
              onUpdateRepairCost={async (id, cost) => {
                const { error } = await db.from('repair_bookings').update({ final_cost: cost }).eq('id', id);
                if (error) {
                  alert(error.message);
                  return;
                }
                setRepairs((prev) => prev.map((r) => (r.id === id ? { ...r, final_cost: cost } : r)));
                alert('🎉 Updated repair invoice cost!');
              }}
              onReassignAgent={async (repairId, agentId) => {
                const ag = agents.find((a) => a.id === agentId);
                if (!ag) return;
                await db
                  .from('repair_bookings')
                  .update({
                    assigned_agent_id: ag.id,
                    delivery_person_name: ag.name,
                    delivery_person_phone: ag.phone,
                    status: 'assigned',
                  })
                  .eq('id', repairId);
                setRepairs((prev) =>
                  prev.map((r) =>
                    r.id === repairId
                      ? {
                          ...r,
                          assigned_agent_id: ag.id,
                          delivery_person_name: ag.name,
                          delivery_person_phone: ag.phone,
                          status: 'assigned',
                        }
                      : r
                  )
                );
              }}
            />
          )}

          {tab === 'catalog' && (
            <AdminCatalog
              masterPhones={masterPhones}
              selectedPhoneId={selectedPhoneId}
              onSelectPhone={(id) => setSelectedPhoneId(id)}
              products={products}
              onOpenListPhoneModal={openListPhoneToStore}
              onOpenCustomPhoneModal={() => setCustomPhoneModalOpen(true)}
              onSyncAllToDb={handleSyncAllPhonesToDb}
              syncingCatalog={syncingCatalog}
              onPhoneImported={(imported) => {
                setMasterPhones((prev) => [
                  imported,
                  ...prev.filter((p) => p.model.toLowerCase() !== imported.model.toLowerCase()),
                ]);
                setSelectedPhoneId(imported.id);
              }}
            />
          )}

          {tab === 'pricing' && (
            <AdminPricingRules
              configs={sellPriceConfigs}
              selectedPricingId={selectedPricingId}
              onSelectPricing={(id) => setSelectedPricingId(id)}
              onOpenPricingModal={(config) => {
                if (config) {
                  setPricingForm({
                    brand: config.brand,
                    model: config.model,
                    storage: config.storage || '128GB',
                    base_price: String(config.base_price),
                    excellent_multiplier: String(config.excellent_multiplier),
                    good_multiplier: String(config.good_multiplier),
                    fair_multiplier: String(config.fair_multiplier),
                    box_bonus: String(config.box_bonus),
                    charger_bonus: String(config.charger_bonus),
                    is_active: config.is_active,
                  });
                } else {
                  setPricingForm({
                    brand: 'Apple',
                    model: '',
                    storage: '128GB',
                    base_price: '20000',
                    excellent_multiplier: '0.75',
                    good_multiplier: '0.60',
                    fair_multiplier: '0.45',
                    box_bonus: '600',
                    charger_bonus: '400',
                    is_active: true,
                  });
                }
                setPricingModal({ config });
              }}
              onToggleActive={async (id, current) => {
                await db.from('sell_price_configs').update({ is_active: !current }).eq('id', id);
                setSellPriceConfigs((prev) => prev.map((c) => (c.id === id ? { ...c, is_active: !current } : c)));
              }}
              onDeleteConfig={deletePricingRule}
              onAutoGenerateRules={handleAutoGenerateIndianPricingRules}
              generatingRules={generatingPricingRules}
            />
          )}

          {tab === 'orders' && (
            <AdminOrders
              orders={orders}
              selectedOrderId={selectedOrderId}
              onSelectOrder={(id) => setSelectedOrderId(id)}
              agents={agents}
              onUpdateStatus={(id, status) => updateStatus('orders', id, status)}
              onReassignAgent={reassignOrderAgent}
            />
          )}

          {tab === 'products' && (
            <AdminProducts
              products={products}
              selectedProductId={selectedProductId}
              onSelectProduct={(id) => setSelectedProductId(id)}
              onOpenProductModal={(product) => {
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
                    offer_tag: product.offer_tag ?? '',
                    warranty_months: String(product.warranty_months),
                    description: product.description ?? '',
                    images: product.images.join('\n'),
                    is_approved: product.is_approved,
                    is_featured: product.is_featured,
                    show_all_grades: product.show_all_grades !== false,
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
                    offer_tag: '🔥 Hot Deal',
                    warranty_months: '6',
                    description: '',
                    images: '',
                    is_approved: true,
                    is_featured: false,
                    show_all_grades: true,
                    stock: '1',
                  });
                }
                setProductModal({ product });
              }}
              onToggleApproval={(id, current) => toggleApproval('products', id, current)}
              onDeleteProduct={deleteProduct}
            />
          )}

          {tab === 'agents' && (
            <AdminDeliveryAgents
              agents={agents}
              selectedAgentId={selectedAgentId}
              onSelectAgent={(id) => setSelectedAgentId(id)}
              onOpenAgentModal={() => setAgentModalOpen(true)}
              onToggleStatus={toggleAgentStatus}
              orders={orders}
              sellRequests={sells}
              repairs={repairs}
            />
          )}

          {tab === 'wholesalers' && (
            <AdminWholesalers />
          )}

          {tab === 'banners' && (
            <AdminHeroPosters />
          )}

          {tab === 'parts' && (
            <AdminSpareParts
              parts={parts}
              selectedPartId={selectedPartId}
              onSelectPart={(id) => setSelectedPartId(id)}
              onOpenPartModal={(part) => {
                if (part) {
                  setPartForm({
                    title: part.title,
                    brand: part.brand || 'Apple',
                    model: part.model,
                    category: part.category,
                    price: String(part.price),
                    stock: String(part.stock),
                    description: part.description || '',
                    images: part.images?.join('\n') || '',
                    is_approved: part.is_approved,
                  });
                } else {
                  setPartForm({
                    title: '',
                    brand: 'Apple',
                    model: '',
                    category: 'Screen / Display',
                    price: '',
                    stock: '5',
                    description: '',
                    images: '',
                    is_approved: true,
                  });
                }
                setPartModal({ part });
              }}
              onToggleApproval={(id, current) => toggleApproval('spare_parts', id, current)}
              onDeletePart={deleteSparePart}
            />
          )}

          {tab === 'users' && (
            <AdminUsers
              profiles={profiles}
              selectedUserId={selectedUserId}
              onSelectUser={(id) => setSelectedUserId(id)}
              orders={orders}
              sells={sells}
              repairs={repairs}
              onUpdateRole={updateUserRole}
              onToggleVerification={toggleUserVerification}
            />
          )}

          {tab === 'reviews' && (
            <AdminReviews
              reviews={reviews}
              selectedReviewId={selectedReviewId}
              onSelectReview={(id) => setSelectedReviewId(id)}
              onToggleApproval={(id, current) => toggleApproval('reviews', id, current)}
              onDeleteReview={deleteReview}
            />
          )}

          {tab === 'contact' && <AdminContactQueries />}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* GLOBAL MODALS (List Phone to Store, Product Modal, Pricing Rule Modal)   */}
      {/* ========================================================================= */}

      {/* MODAL 1: LIST PHONE FROM MASTER CATALOG INTO STORE */}
      {listPhoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4 overflow-y-auto">
          <div className="card w-full max-w-xl p-6 my-4 space-y-4 max-h-[90vh] overflow-y-auto bg-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-ink-100">
              <h3 className="font-display text-lg font-bold text-ink-900 flex items-center gap-2">
                <Tag className="h-5 w-5 text-brand-600" /> List to Buy Store
              </h3>
              <button onClick={() => setListPhoneModal(null)} className="text-ink-400 hover:text-ink-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="label text-xs">Listing Title</label>
                <input
                  type="text"
                  value={listPhoneForm.title}
                  onChange={(e) => setListPhoneForm({ ...listPhoneForm, title: e.target.value })}
                  className="input text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">Selling Price (₹)</label>
                  <input
                    type="number"
                    value={listPhoneForm.price}
                    onChange={(e) => setListPhoneForm({ ...listPhoneForm, price: e.target.value })}
                    className="input text-xs font-black text-brand-700"
                  />
                </div>
                <div>
                  <label className="label text-xs">Original MRP (₹)</label>
                  <input
                    type="number"
                    value={listPhoneForm.original_price}
                    onChange={(e) => setListPhoneForm({ ...listPhoneForm, original_price: e.target.value })}
                    className="input text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="label text-xs font-bold">RAM (Memory)</label>
                  <input
                    type="text"
                    placeholder="e.g. 8 GB"
                    value={listPhoneForm.ram}
                    onChange={(e) => setListPhoneForm({ ...listPhoneForm, ram: e.target.value })}
                    className="input text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="label text-xs font-bold">Storage</label>
                  <input
                    type="text"
                    placeholder="e.g. 256 GB"
                    value={listPhoneForm.storage}
                    onChange={(e) => setListPhoneForm({ ...listPhoneForm, storage: e.target.value })}
                    className="input text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="label text-xs font-bold">Device Color</label>
                  <input
                    type="text"
                    placeholder="e.g. Midnight Black"
                    value={listPhoneForm.color}
                    onChange={(e) => setListPhoneForm({ ...listPhoneForm, color: e.target.value })}
                    className="input text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="label text-xs font-bold">Refurbished Grade</label>
                  <select
                    value={listPhoneForm.condition}
                    onChange={(e) => setListPhoneForm({ ...listPhoneForm, condition: e.target.value as any })}
                    className="input text-xs font-bold"
                  >
                    <option value="Superb">Superb (Like New)</option>
                    <option value="Good">Good (Popular)</option>
                    <option value="Fair">Fair (Value)</option>
                    <option value="Excellent">Excellent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs font-bold">Offer Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. 🔥 Hot Deal"
                    value={listPhoneForm.offer_tag}
                    onChange={(e) => setListPhoneForm({ ...listPhoneForm, offer_tag: e.target.value })}
                    className="input text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="label text-xs font-bold">Stock Units</label>
                  <input
                    type="number"
                    value={listPhoneForm.stock}
                    onChange={(e) => setListPhoneForm({ ...listPhoneForm, stock: e.target.value })}
                    className="input text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="label text-xs">Warranty Description</label>
                <textarea
                  rows={2}
                  value={listPhoneForm.description}
                  onChange={(e) => setListPhoneForm({ ...listPhoneForm, description: e.target.value })}
                  className="input text-xs"
                />
              </div>

              {/* 📷 CUSTOM PRODUCT IMAGE UPLOADER & MANAGEMENT */}
              <div className="space-y-2.5 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <label className="label text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-[#00a896]" /> Product Photos & Images
                  </label>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#00a896] text-xs font-bold cursor-pointer transition">
                    <Upload className="h-3.5 w-3.5" /> Upload Photo From Device
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        files.forEach((file) => {
                          if (file.size > 5 * 1024 * 1024) {
                            alert(`File ${file.name} is too large (>5MB)`);
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const b64 = reader.result as string;
                            setListPhoneForm((prev) => {
                              const existing = prev.images ? prev.images.split('\n').filter(Boolean) : [];
                              return { ...prev, images: [...existing, b64].join('\n') };
                            });
                          };
                          reader.readAsDataURL(file);
                        });
                      }}
                    />
                  </label>
                </div>

                {/* Thumbnail Previews */}
                <div className="flex flex-wrap gap-2 py-1">
                  {listPhoneForm.images
                    .split('\n')
                    .map((url) => url.trim())
                    .filter(Boolean)
                    .map((url, idx) => (
                      <div key={idx} className="relative h-16 w-16 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden group shrink-0">
                        <img src={url} alt={`Preview ${idx + 1}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = listPhoneForm.images
                              .split('\n')
                              .map((s) => s.trim())
                              .filter((s) => s && s !== url)
                              .join('\n');
                            setListPhoneForm({ ...listPhoneForm, images: updated });
                          }}
                          className="absolute top-1 right-1 h-5 w-5 rounded-full bg-red-600 text-white grid place-items-center opacity-80 hover:opacity-100 transition shadow-md text-[10px]"
                          title="Remove image"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                </div>

                {/* Direct Image URL Textarea */}
                <div>
                  <textarea
                    rows={2}
                    value={listPhoneForm.images}
                    onChange={(e) => setListPhoneForm({ ...listPhoneForm, images: e.target.value })}
                    placeholder="Image URLs (one per line) or use Upload button above"
                    className="input text-xs font-mono"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Upload your own custom photos above or paste image URLs line by line.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-ink-100">
              <button onClick={() => setListPhoneModal(null)} className="btn-outline text-xs">
                Cancel
              </button>
              <button onClick={publishPhoneToStore} disabled={listPhoneSaving} className="btn-primary text-xs">
                {listPhoneSaving ? 'Publishing...' : 'Publish to Store'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD/EDIT PRICING RULE */}
      {pricingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4 overflow-y-auto">
          <div className="card w-full max-w-lg p-6 my-4 space-y-4 max-h-[90vh] overflow-y-auto bg-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-ink-100">
              <h3 className="font-display text-lg font-bold text-ink-900">
                {pricingModal.config ? 'Edit Pricing Rule' : 'Create Pricing Rule'}
              </h3>
              <button onClick={() => setPricingModal(null)} className="text-ink-400 hover:text-ink-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">Brand</label>
                  <input
                    type="text"
                    value={pricingForm.brand}
                    onChange={(e) => setPricingForm({ ...pricingForm, brand: e.target.value })}
                    className="input text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="label text-xs">Model</label>
                  <input
                    type="text"
                    value={pricingForm.model}
                    onChange={(e) => setPricingForm({ ...pricingForm, model: e.target.value })}
                    placeholder="e.g. iPhone 15 Pro"
                    className="input text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">Base Resale Value (₹)</label>
                  <input
                    type="number"
                    value={pricingForm.base_price}
                    onChange={(e) => setPricingForm({ ...pricingForm, base_price: e.target.value })}
                    className="input text-xs font-black text-emerald-700"
                  />
                </div>
                <div>
                  <label className="label text-xs">Storage</label>
                  <input
                    type="text"
                    value={pricingForm.storage}
                    onChange={(e) => setPricingForm({ ...pricingForm, storage: e.target.value })}
                    className="input text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-ink-50 p-3 rounded-2xl">
                <div>
                  <label className="text-[10px] text-ink-500 font-bold">Flawless Mult</label>
                  <input
                    type="number"
                    step="0.05"
                    value={pricingForm.excellent_multiplier}
                    onChange={(e) => setPricingForm({ ...pricingForm, excellent_multiplier: e.target.value })}
                    className="input text-xs mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-ink-500 font-bold">Good Mult</label>
                  <input
                    type="number"
                    step="0.05"
                    value={pricingForm.good_multiplier}
                    onChange={(e) => setPricingForm({ ...pricingForm, good_multiplier: e.target.value })}
                    className="input text-xs mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-ink-500 font-bold">Fair Mult</label>
                  <input
                    type="number"
                    step="0.05"
                    value={pricingForm.fair_multiplier}
                    onChange={(e) => setPricingForm({ ...pricingForm, fair_multiplier: e.target.value })}
                    className="input text-xs mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-ink-100">
              <button onClick={() => setPricingModal(null)} className="btn-outline text-xs">
                Cancel
              </button>
              <button onClick={savePricingRule} disabled={pricingSaving} className="btn-primary text-xs bg-brand-600">
                {pricingSaving ? 'Saving...' : 'Save Price Rule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD/EDIT PRODUCT MODAL */}
      {productModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4 overflow-y-auto">
          <div className="card w-full max-w-xl p-6 my-4 space-y-4 max-h-[90vh] overflow-y-auto bg-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-ink-100">
              <h3 className="font-display text-lg font-bold text-ink-900">
                {productModal.product ? 'Edit Store Product' : 'Add Store Product'}
              </h3>
              <button onClick={() => setProductModal(null)} className="text-ink-400 hover:text-ink-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="label text-xs">Product Title</label>
                <input
                  type="text"
                  value={productForm.title}
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                  placeholder="e.g. Apple iPhone 14 Pro 128GB Deep Purple"
                  className="input text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">Brand</label>
                  <input
                    type="text"
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    className="input text-xs"
                  />
                </div>
                <div>
                  <label className="label text-xs font-bold">Model</label>
                  <input
                    type="text"
                    value={productForm.model}
                    onChange={(e) => setProductForm({ ...productForm, model: e.target.value })}
                    className="input text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="label text-xs font-bold">RAM (Memory)</label>
                  <input
                    type="text"
                    placeholder="e.g. 8 GB"
                    value={productForm.ram}
                    onChange={(e) => setProductForm({ ...productForm, ram: e.target.value })}
                    className="input text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="label text-xs font-bold">Storage</label>
                  <input
                    type="text"
                    placeholder="e.g. 256 GB"
                    value={productForm.storage}
                    onChange={(e) => setProductForm({ ...productForm, storage: e.target.value })}
                    className="input text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="label text-xs font-bold">Device Color</label>
                  <input
                    type="text"
                    placeholder="e.g. Midnight Black"
                    value={productForm.color}
                    onChange={(e) => setProductForm({ ...productForm, color: e.target.value })}
                    className="input text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="label text-xs font-bold">Refurbished Grade</label>
                  <select
                    value={productForm.condition}
                    onChange={(e) => setProductForm({ ...productForm, condition: e.target.value as any })}
                    className="input text-xs font-bold"
                  >
                    <option value="Superb">Superb (Like New)</option>
                    <option value="Good">Good (Popular)</option>
                    <option value="Fair">Fair (Value)</option>
                    <option value="Excellent">Excellent</option>
                  </select>
                </div>
              </div>

              {/* Grade Display Mode on Product Detail Page */}
              <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-200/80">
                <label className="label text-xs font-extrabold text-teal-800 flex items-center gap-1.5 mb-1">
                  <Sparkles className="h-3.5 w-3.5 text-teal-700" /> Condition Grade View Mode on Website
                </label>
                <select
                  value={productForm.show_all_grades ? 'all' : 'single'}
                  onChange={(e) => setProductForm({ ...productForm, show_all_grades: e.target.value === 'all' })}
                  className="input text-xs font-extrabold text-gray-900 bg-white border-teal-300"
                >
                  <option value="all">Show All 3 Grade Cards (Fair, Good, Superb)</option>
                  <option value="single">Show Only Single Selected Grade Card ({productForm.condition})</option>
                </select>
                <p className="text-[11px] text-teal-700 font-medium mt-1">
                  Select "Show Only Single Selected Grade" if you want the customer to view only 1 condition card on the product page.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label text-xs">Selling Price (₹)</label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="input text-xs font-black text-brand-700"
                  />
                </div>
                <div>
                  <label className="label text-xs">Original MRP (₹)</label>
                  <input
                    type="number"
                    value={productForm.original_price}
                    onChange={(e) => setProductForm({ ...productForm, original_price: e.target.value })}
                    className="input text-xs"
                  />
                </div>
                <div>
                  <label className="label text-xs">Stock Units</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="input text-xs font-bold"
                  />
                </div>
              </div>

              {/* 📷 CUSTOM PRODUCT IMAGE UPLOADER & MANAGEMENT */}
              <div className="space-y-2.5 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <label className="label text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-[#00a896]" /> Product Photos & Images
                  </label>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#00a896] text-xs font-bold cursor-pointer transition">
                    <Upload className="h-3.5 w-3.5" /> Upload Photo From Device
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        files.forEach((file) => {
                          if (file.size > 5 * 1024 * 1024) {
                            alert(`File ${file.name} is too large (>5MB)`);
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const b64 = reader.result as string;
                            setProductForm((prev) => {
                              const existing = prev.images ? prev.images.split('\n').filter(Boolean) : [];
                              return { ...prev, images: [...existing, b64].join('\n') };
                            });
                          };
                          reader.readAsDataURL(file);
                        });
                      }}
                    />
                  </label>
                </div>

                {/* Thumbnail Previews */}
                <div className="flex flex-wrap gap-2 py-1">
                  {productForm.images
                    .split('\n')
                    .map((url) => url.trim())
                    .filter(Boolean)
                    .map((url, idx) => (
                      <div key={idx} className="relative h-16 w-16 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden group shrink-0">
                        <img src={url} alt={`Preview ${idx + 1}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = productForm.images
                              .split('\n')
                              .map((s) => s.trim())
                              .filter((s) => s && s !== url)
                              .join('\n');
                            setProductForm({ ...productForm, images: updated });
                          }}
                          className="absolute top-1 right-1 h-5 w-5 rounded-full bg-red-600 text-white grid place-items-center opacity-80 hover:opacity-100 transition shadow-md text-[10px]"
                          title="Remove image"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                </div>

                {/* Direct Image URL Textarea */}
                <div>
                  <textarea
                    rows={2}
                    value={productForm.images}
                    onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                    placeholder="Image URLs (one per line) or use Upload button above"
                    className="input text-xs font-mono"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Upload your own custom photos above or paste image URLs line by line.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-ink-100">
              <button onClick={() => setProductModal(null)} className="btn-outline text-xs">
                Cancel
              </button>
              <button onClick={saveProduct} disabled={productSaving} className="btn-primary text-xs">
                {productSaving ? 'Saving...' : 'Save Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: ADD DELIVERY AGENT & ISSUE RIDER ID */}
      {agentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4 overflow-y-auto">
          <div className="card w-full max-w-lg p-6 my-4 space-y-4 bg-white shadow-2xl rounded-3xl">
            <div className="flex items-center justify-between pb-3 border-b border-ink-100">
              <div>
                <span className="badge bg-brand-50 text-brand-700 font-bold text-[10px] uppercase">
                  Lucknow Dispatch Fleet
                </span>
                <h3 className="font-display text-lg font-black text-ink-900 mt-0.5">
                  Register Partner & Issue Rider ID
                </h3>
              </div>
              <button onClick={() => setAgentModalOpen(false)} className="text-ink-400 hover:text-ink-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">Partner Full Name *</label>
                  <input
                    type="text"
                    required
                    value={agentForm.name}
                    onChange={(e) => setAgentForm({ ...agentForm, name: e.target.value })}
                    placeholder="e.g. Ankit Sharma"
                    className="input text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="label text-xs">Mobile Number (WhatsApp) *</label>
                  <input
                    type="text"
                    required
                    value={agentForm.phone}
                    onChange={(e) => setAgentForm({ ...agentForm, phone: e.target.value })}
                    placeholder="e.g. +91 98391 22345"
                    className="input text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <div>
                  <label className="label text-xs font-bold text-slate-800">Login Email ID</label>
                  <input
                    type="email"
                    value={agentForm.email}
                    onChange={(e) => setAgentForm({ ...agentForm, email: e.target.value })}
                    placeholder="e.g. rider.ankit@fundu.in"
                    className="input text-xs font-mono bg-white"
                  />
                </div>

                <div>
                  <label className="label text-xs font-bold text-slate-800">Secret Login PIN / Passcode *</label>
                  <input
                    type="text"
                    required
                    value={agentForm.login_pin}
                    onChange={(e) => setAgentForm({ ...agentForm, login_pin: e.target.value })}
                    placeholder="e.g. Rider@123"
                    className="input text-xs font-mono font-bold bg-white text-emerald-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">Vehicle Type & Model</label>
                  <input
                    type="text"
                    value={agentForm.vehicle_type}
                    onChange={(e) => setAgentForm({ ...agentForm, vehicle_type: e.target.value })}
                    placeholder="e.g. Hero Splendor (Bike)"
                    className="input text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="label text-xs">Vehicle Reg. Number (UP 32)</label>
                  <input
                    type="text"
                    value={agentForm.vehicle_number}
                    onChange={(e) => setAgentForm({ ...agentForm, vehicle_number: e.target.value })}
                    placeholder="e.g. UP 32 BK 4421"
                    className="input text-xs font-bold font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="label text-xs">Primary Lucknow Operational Zone</label>
                <select
                  value={agentForm.current_locality}
                  onChange={(e) => setAgentForm({ ...agentForm, current_locality: e.target.value })}
                  className="input text-xs font-bold"
                >
                  {LUCKNOW_AREAS.map((area) => (
                    <option key={area} value={area}>
                      {area}, Lucknow
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0" />
                <span>
                  Admin will provision credentials for private route: <strong className="font-mono text-amber-950">/fleet-desk</strong>. A WhatsApp briefing with login link will be generated automatically.
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-ink-100">
              <button onClick={() => setAgentModalOpen(false)} className="btn-outline text-xs">
                Cancel
              </button>
              <button onClick={saveDeliveryAgent} disabled={agentSaving} className="btn-primary text-xs bg-brand-600 hover:bg-brand-700 font-bold px-4 py-2">
                {agentSaving ? 'Provisioning ID...' : '🚀 Issue Rider ID & Provision Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: ADD CUSTOM PHONE MODEL */}
      {customPhoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4 overflow-y-auto">
          <div className="card w-full max-w-lg p-6 my-4 space-y-4 max-h-[90vh] overflow-y-auto bg-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-ink-100">
              <h3 className="font-display text-lg font-bold text-ink-900">Add Indian Smartphone Model</h3>
              <button onClick={() => setCustomPhoneModalOpen(false)} className="text-ink-400 hover:text-ink-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">Brand</label>
                  <input
                    type="text"
                    value={customPhoneForm.brand}
                    onChange={(e) => setCustomPhoneForm({ ...customPhoneForm, brand: e.target.value })}
                    className="input text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="label text-xs">Model Name</label>
                  <input
                    type="text"
                    value={customPhoneForm.model}
                    onChange={(e) => setCustomPhoneForm({ ...customPhoneForm, model: e.target.value })}
                    placeholder="e.g. Vivo V40 Pro 5G"
                    className="input text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">India Launch MRP (₹)</label>
                  <input
                    type="number"
                    value={customPhoneForm.default_mrp}
                    onChange={(e) => setCustomPhoneForm({ ...customPhoneForm, default_mrp: e.target.value })}
                    className="input text-xs font-black text-brand-700"
                  />
                </div>
                <div>
                  <label className="label text-xs">Base Resale Value (₹)</label>
                  <input
                    type="number"
                    value={customPhoneForm.base_resale_value}
                    onChange={(e) => setCustomPhoneForm({ ...customPhoneForm, base_resale_value: e.target.value })}
                    className="input text-xs font-black text-emerald-700"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-ink-100">
              <button onClick={() => setCustomPhoneModalOpen(false)} className="btn-outline text-xs">
                Cancel
              </button>
              <button onClick={saveCustomPhoneModel} disabled={customPhoneSaving} className="btn-primary text-xs">
                {customPhoneSaving ? 'Saving...' : 'Add Phone Model'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: ADD/EDIT SPARE PART */}
      {partModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4 overflow-y-auto">
          <div className="card w-full max-w-lg p-6 my-4 space-y-4 max-h-[90vh] overflow-y-auto bg-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-ink-100">
              <h3 className="font-display text-lg font-bold text-ink-900 flex items-center gap-2">
                <Wrench className="h-5 w-5 text-brand-600" />
                {partModal.part ? 'Edit Spare Part' : 'Add Spare Part'}
              </h3>
              <button onClick={() => setPartModal(null)} className="text-ink-400 hover:text-ink-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="label text-xs">Component Title</label>
                <input
                  type="text"
                  value={partForm.title}
                  onChange={(e) => setPartForm({ ...partForm, title: e.target.value })}
                  placeholder="e.g. iPhone 13 OLED Display Assembly"
                  className="input text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">Brand</label>
                  <input
                    type="text"
                    value={partForm.brand}
                    onChange={(e) => setPartForm({ ...partForm, brand: e.target.value })}
                    className="input text-xs"
                  />
                </div>
                <div>
                  <label className="label text-xs">Compatible Model</label>
                  <input
                    type="text"
                    value={partForm.model}
                    onChange={(e) => setPartForm({ ...partForm, model: e.target.value })}
                    className="input text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">Category</label>
                  <select
                    value={partForm.category}
                    onChange={(e) => setPartForm({ ...partForm, category: e.target.value })}
                    className="input text-xs font-bold"
                  >
                    <option value="Screen / Display">Screen / Display</option>
                    <option value="Battery">Battery</option>
                    <option value="Camera Module">Camera Module</option>
                    <option value="Charging Port">Charging Port</option>
                    <option value="Motherboard">Motherboard</option>
                    <option value="Back Glass">Back Glass</option>
                    <option value="Speaker / Mic">Speaker / Mic</option>
                  </select>
                </div>
                <div>
                  <label className="label text-xs">Wholesale Price (₹)</label>
                  <input
                    type="number"
                    value={partForm.price}
                    onChange={(e) => setPartForm({ ...partForm, price: e.target.value })}
                    className="input text-xs font-black text-brand-700"
                  />
                </div>
              </div>

              <div>
                <label className="label text-xs">Stock Units</label>
                <input
                  type="number"
                  value={partForm.stock}
                  onChange={(e) => setPartForm({ ...partForm, stock: e.target.value })}
                  className="input text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-ink-100">
              <button onClick={() => setPartModal(null)} className="btn-outline text-xs">
                Cancel
              </button>
              <button onClick={saveSparePart} disabled={partSaving} className="btn-primary text-xs">
                {partSaving ? 'Saving...' : 'Save Spare Part'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
