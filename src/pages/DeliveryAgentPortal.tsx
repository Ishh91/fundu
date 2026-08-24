import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Truck,
  MapPin,
  PhoneCall,
  MessageSquare,
  Camera,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Smartphone,
  Wrench,
  Package,
  Upload,
  Image as ImageIcon,
  BadgeIndianRupee,
  RefreshCw,
  ExternalLink,
  Navigation,
  Sparkles,
  Search,
  SlidersHorizontal,
  ChevronRight,
  X,
  FileText,
  UserCheck,
  DollarSign,
  QrCode,
  ArrowRight,
  LogOut,
  Battery,
  Wifi,
  Shield,
  LayoutDashboard,
  Store,
  User,
  Radio,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, formatINR } from '../lib/db';
import type { SellRequest, RepairBooking, Order, DeliveryAgent } from '../types';

export default function DeliveryAgentPortal() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  // Rider Login & Fleet Identity State
  const [selectedRiderName, setSelectedRiderName] = useState('Deepak Verma');
  const [selectedRiderPhone, setSelectedRiderPhone] = useState('+91 98391 22345');
  const [selectedVehicle, setSelectedVehicle] = useState('Hero Splendor (UP 32 BK 4421)');
  const [isRiderApproved, setIsRiderApproved] = useState(true);
  const [isLoggedInAsRider, setIsLoggedInAsRider] = useState(true);

  // Tab State
  const [activeTab, setActiveTab] = useState<'sells' | 'repairs' | 'orders' | 'completed'>('sells');
  const [agentStatus, setAgentStatus] = useState<'available' | 'offline'>('available');

  // Active Job Data States
  const [sells, setSells] = useState<SellRequest[]>([]);
  const [repairs, setRepairs] = useState<RepairBooking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Doorstep Inspection Modal State (For Sell Requests)
  const [inspectingSell, setInspectingSell] = useState<SellRequest | null>(null);
  const [imeiInput, setImeiInput] = useState('');
  const [selectedCondition, setSelectedCondition] = useState<'Superb' | 'Good' | 'Fair'>('Good');
  const [screenCondition, setScreenCondition] = useState<'flawless' | 'scratched' | 'cracked'>('flawless');
  const [bodyCondition, setBodyCondition] = useState<'spotless' | 'minor_dents' | 'heavy_scratches'>('minor_dents');
  const [cameraWorking, setCameraWorking] = useState<boolean>(true);
  const [batteryHealth, setBatteryHealth] = useState<string>('88');
  const [biometricsWorking, setBiometricsWorking] = useState<boolean>(true);
  const [chargingPortWorking, setChargingPortWorking] = useState<boolean>(true);
  const [speakerMicWorking, setSpeakerMicWorking] = useState<boolean>(true);
  const [hasBox, setHasBox] = useState<boolean>(true);
  const [hasCharger, setHasCharger] = useState<boolean>(true);
  const [hasBill, setHasBill] = useState<boolean>(true);
  const [proposedPayout, setProposedPayout] = useState<string>('');
  const [riderNotes, setRiderNotes] = useState<string>('');
  const [payoutMethod, setPayoutMethod] = useState<'upi' | 'cash'>('upi');
  const [customerUpiId, setCustomerUpiId] = useState<string>('');

  // Live Photos Uploaded by Delivery Agent
  const [photoFront, setPhotoFront] = useState<string>('');
  const [photoBack, setPhotoBack] = useState<string>('');
  const [photoEdges, setPhotoEdges] = useState<string>('');
  const [photoImei, setPhotoImei] = useState<string>('');

  const [submittingInspection, setSubmittingInspection] = useState(false);
  const [approvalWaiting, setApprovalWaiting] = useState(false);
  const [isApprovedByAdmin, setIsApprovedByAdmin] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState(false);

  // Doorstep Repair Inspection Modal State
  const [inspectingRepair, setInspectingRepair] = useState<RepairBooking | null>(null);
  const [repairPhoto, setRepairPhoto] = useState<string>('');
  const [repairDiagnosticDetail, setRepairDiagnosticDetail] = useState('');
  const [repairFinalCost, setRepairFinalCost] = useState('');
  const [repairSubmitting, setRepairSubmitting] = useState(false);

  // Delivery Order Complete Modal State
  const [deliveringOrder, setDeliveringOrder] = useState<Order | null>(null);
  const [deliveryProofPhoto, setDeliveryProofPhoto] = useState<string>('');
  const [deliveryCashCollected, setDeliveryCashCollected] = useState(true);
  const [deliverySubmitting, setDeliverySubmitting] = useState(false);

  const isApprovedStatus = (status?: string | null) => {
    if (!status) return false;
    return [
      'price_offered',
      'approved_for_payout',
      'confirmed',
      'accepted',
      'inspected',
      'pickup_scheduled',
      'picked_up',
      'completed',
    ].includes(status.toLowerCase());
  };

  // Initial Data Fetch & Real-time 2.5s Polling from Database
  const fetchData = async () => {
    try {
      const [sRes, rRes, oRes] = await Promise.all([
        db.from('sell_requests').select('*').order('created_at', { ascending: false }),
        db.from('repair_bookings').select('*').order('created_at', { ascending: false }),
        db.from('orders').select('*').order('created_at', { ascending: false }),
      ]);

      const fetchedSells = (sRes.data as SellRequest[]) || [];
      const fetchedRepairs = (rRes.data as RepairBooking[]) || [];
      const fetchedOrders = (oRes.data as Order[]) || [];

      setSells(fetchedSells);
      setRepairs(fetchedRepairs);
      setOrders(fetchedOrders);
    } catch (err) {
      console.warn('Error fetching agent tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2500);
    return () => clearInterval(interval);
  }, []);

  // Sync open modal with latest database record whenever Admin changes status
  useEffect(() => {
    if (inspectingSell) {
      const latest = sells.find((s) => s.id === inspectingSell.id);
      if (latest) {
        if (isApprovedStatus(latest.status)) {
          setIsApprovedByAdmin(true);
          setApprovalWaiting(false);
        }
      }
    }
  }, [sells]);

  // Sync inspection modal initial values when sell is selected
  const handleOpenInspection = (sell: SellRequest) => {
    setInspectingSell(sell);
    setImeiInput(sell.imei || '');
    setSelectedCondition((sell.condition as any) || 'Good');
    setProposedPayout(String(sell.final_price || sell.estimated_price || ''));
    setRiderNotes(sell.notes || '');
    setPhotoFront(sell.device_photos?.front || '');
    setPhotoBack(sell.device_photos?.back || '');
    setPhotoEdges(sell.device_photos?.edges || '');
    setPhotoImei(sell.imei_photo || '');
    const approved = isApprovedStatus(sell.status);
    setIsApprovedByAdmin(approved);
    setApprovalWaiting(!approved && (sell.status === 'inspection_submitted' || sell.status === 'diagnosing'));
    setPayoutSuccess(sell.status === 'completed' || sell.status === 'picked_up');
  };

  // Convert uploaded image file to base64 for instant preview & persistence
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setter(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Sample camera snapshot generator for quick testing
  const handleCaptureSamplePhoto = (type: 'front' | 'back' | 'edges' | 'imei') => {
    const samples: Record<string, string> = {
      front: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=600&q=80',
      back: 'https://images.unsplash.com/photo-1574755393849-623942496936?auto=format&fit=crop&w=600&q=80',
      edges: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80',
      imei: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
    };
    if (type === 'front') setPhotoFront(samples.front);
    if (type === 'back') setPhotoBack(samples.back);
    if (type === 'edges') setPhotoEdges(samples.edges);
    if (type === 'imei') setPhotoImei(samples.imei);
  };

  // Submit Inspection to Admin for Real-Time Approval
  const handleSubmitInspection = async () => {
    if (!inspectingSell) return;
    if (!imeiInput || imeiInput.length < 10) {
      alert('⚠️ Please verify and enter a valid 15-digit device IMEI number (Dial *#06# on phone).');
      return;
    }
    if (!proposedPayout || Number(proposedPayout) <= 0) {
      alert('⚠️ Please enter the recommended spot payout valuation for the customer.');
      return;
    }

    setSubmittingInspection(true);
    try {
      const payoutAmount = Number(proposedPayout);
      const updatePayload: Partial<SellRequest> = {
        status: 'inspection_submitted',
        imei: imeiInput,
        imei_photo: photoImei || undefined,
        condition: selectedCondition,
        final_price: payoutAmount,
        notes: `[Rider Inspection Completed]: Battery ${batteryHealth}%, Screen: ${screenCondition}, Frame: ${bodyCondition}. ${riderNotes}`,
        device_photos: {
          front: photoFront || undefined,
          back: photoBack || undefined,
          edges: photoEdges || undefined,
          bill_box: photoImei || undefined,
        },
        diagnostics: {
          screen_touch: screenCondition !== 'cracked',
          cameras: cameraWorking,
          battery_health: batteryHealth,
          biometrics: biometricsWorking,
          speaker_mic: speakerMicWorking,
          charging_port: chargingPortWorking,
        },
        accessories: [
          hasBox ? 'Original Box' : null,
          hasCharger ? 'Original Fast Charger' : null,
          hasBill ? 'Valid Purchase Invoice' : null,
        ].filter(Boolean) as string[],
        payout_method: payoutMethod,
        payout_details: customerUpiId || 'Cash on spot at doorstep',
      };

      const { error } = await db.from('sell_requests').update(updatePayload).eq('id', inspectingSell.id);
      if (error) throw error;

      setApprovalWaiting(true);
      setInspectingSell((prev) => (prev ? { ...prev, ...updatePayload } : null));
      setSells((prev) => prev.map((s) => (s.id === inspectingSell.id ? { ...s, ...updatePayload } : s)));

      alert(
        `✅ Inspection Sheet & Live Photos Submitted to Central Admin!\n\n` +
        `Device: ${inspectingSell.brand} ${inspectingSell.model}\n` +
        `Verified IMEI: ${imeiInput}\n` +
        `Proposed Spot Payout: ₹${payoutAmount.toLocaleString('en-IN')}\n\n` +
        `Waiting for Central Admin at Hazratganj Hub to approve spot clearance.`
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to submit inspection');
    } finally {
      setSubmittingInspection(false);
    }
  };

  // Instant Demo Admin Approval Trigger (Allows Rider to complete flow immediately)
  const handleQuickAdminApprove = async () => {
    if (!inspectingSell) return;
    try {
      const finalVal = Number(proposedPayout) || inspectingSell.estimated_price || 11368;
      await db.from('sell_requests').update({
        status: 'confirmed',
        final_price: finalVal,
      }).eq('id', inspectingSell.id);

      setIsApprovedByAdmin(true);
      setApprovalWaiting(false);
      setInspectingSell((prev) => (prev ? { ...prev, status: 'confirmed', final_price: finalVal } : null));
      setSells((prev) => prev.map((s) => s.id === inspectingSell.id ? { ...s, status: 'confirmed', final_price: finalVal } : s));
    } catch (err) {
      console.error(err);
      setIsApprovedByAdmin(true);
      setApprovalWaiting(false);
    }
  };

  // Complete Spot Payout & Device Handover
  const handleCompletePayoutAndPickup = async () => {
    if (!inspectingSell) return;
    try {
      const finalVal = Number(proposedPayout) || inspectingSell.final_price || inspectingSell.estimated_price || 0;
      await db.from('sell_requests').update({
        status: 'completed',
        final_price: finalVal,
      }).eq('id', inspectingSell.id);

      setPayoutSuccess(true);
      setSells((prev) => prev.map((s) => s.id === inspectingSell.id ? { ...s, status: 'completed', final_price: finalVal } : s));
      alert(`🎉 Spot Payout of ₹${finalVal.toLocaleString('en-IN')} Handover Completed! Phone is now cleared for Hazratganj Hub.`);
      setInspectingSell(null);
    } catch (err) {
      alert('Failed to complete pickup');
    }
  };

  // Submit Repair Diagnostic
  const handleSubmitRepairDiagnostic = async () => {
    if (!inspectingRepair) return;
    setRepairSubmitting(true);
    try {
      const finalNum = Number(repairFinalCost) || inspectingRepair.estimated_cost || 0;
      const updatePayload: Partial<RepairBooking> = {
        status: 'diagnosing',
        final_cost: finalNum,
        problem_detail: repairDiagnosticDetail || inspectingRepair.problem_detail,
        device_photos: repairPhoto ? [repairPhoto] : undefined,
      };

      await db.from('repair_bookings').update(updatePayload).eq('id', inspectingRepair.id);
      setRepairs((prev) => prev.map((r) => r.id === inspectingRepair.id ? { ...r, ...updatePayload } : r));
      alert(`🔧 Technician Diagnostic Submitted for ${inspectingRepair.brand} ${inspectingRepair.model}!\nQuotation: ₹${finalNum.toLocaleString('en-IN')}`);
      setInspectingRepair(null);
    } catch (err) {
      alert('Failed to update repair');
    } finally {
      setRepairSubmitting(false);
    }
  };

  // Submit Order Handover & Proof
  const handleCompleteStoreOrder = async () => {
    if (!deliveringOrder) return;
    setDeliverySubmitting(true);
    try {
      await db.from('orders').update({
        status: 'delivered',
        payment_status: 'paid',
      }).eq('id', deliveringOrder.id);

      setOrders((prev) => prev.map((o) => o.id === deliveringOrder.id ? { ...o, status: 'delivered', payment_status: 'paid' } : o));
      alert(`📦 Order #${deliveringOrder.id.slice(0, 8).toUpperCase()} marked as Delivered to ${deliveringOrder.delivery_name || 'Customer'}!`);
      setDeliveringOrder(null);
    } catch (err) {
      alert('Failed to complete delivery');
    } finally {
      setDeliverySubmitting(false);
    }
  };

  // Generate 1-Click WhatsApp Report link to Admin Desk
  const getAdminWhatsAppReportLink = (sell: SellRequest) => {
    const text = `🚨 *FUNDU DOORSTEP INSPECTION REPORT - APPROVAL REQUEST*\n\n` +
      `👤 *Executive:* ${selectedRiderName}\n` +
      `📋 *Sell Request ID:* #${sell.id.slice(0, 8).toUpperCase()}\n` +
      `📱 *Device:* ${sell.brand} ${sell.model} (${sell.storage || '128GB'})\n` +
      `🔍 *Verified IMEI:* ${imeiInput || sell.imei || 'Checked'}\n` +
      `⚡ *Declared vs Tested Condition:* ${sell.condition} ➔ ${selectedCondition}\n` +
      `🔋 *Battery Health:* ${batteryHealth}%\n` +
      `🖥️ *Screen / Display:* ${screenCondition}\n` +
      `🔨 *Frame & Body:* ${bodyCondition}\n` +
      `💰 *Initial Web Quote:* ₹${(sell.estimated_price || 0).toLocaleString('en-IN')}\n` +
      `💵 *Proposed Spot Payout:* ₹${(Number(proposedPayout) || sell.estimated_price || 0).toLocaleString('en-IN')}\n` +
      `📍 *Customer Address:* ${sell.pickup_address || 'Lucknow'}\n\n` +
      `Please approve spot payout clearance on Admin Console!`;
    return `https://wa.me/919839122345?text=${encodeURIComponent(text)}`;
  };

  // Filter Tasks by Active Tab
  const activeSellTasks = sells.filter((s) => s.status !== 'completed' && s.status !== 'cancelled');
  const activeRepairTasks = repairs.filter((r) => r.status !== 'delivered' && r.status !== 'repaired');
  const activeOrderTasks = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled');
  const completedTasks = [
    ...sells.filter((s) => s.status === 'completed').map((s) => ({ type: 'sell', item: s, date: s.created_at })),
    ...repairs.filter((r) => r.status === 'delivered' || r.status === 'repaired').map((r) => ({ type: 'repair', item: r, date: r.created_at })),
    ...orders.filter((o) => o.status === 'delivered').map((o) => ({ type: 'order', item: o, date: o.created_at })),
  ];

  // Rider Authentication Form State
  const [riderEmailInput, setRiderEmailInput] = useState('rider@fundu.in');
  const [riderPasswordInput, setRiderPasswordInput] = useState('Rider@123456');
  const [riderLoginLoading, setRiderLoginLoading] = useState(false);
  const [riderLoginError, setRiderLoginError] = useState<string | null>(null);

  const handleRiderFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setRiderLoginLoading(true);
    setRiderLoginError(null);
    try {
      // Check in delivery_agents database or default fleet
      const cleanEmail = riderEmailInput.trim().toLowerCase();
      const cleanPass = riderPasswordInput.trim();

      // Check if user has an active agent record in db
      const { data: agentData } = await db
        .from('delivery_agents')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (agentData) {
        setSelectedRiderName((agentData as any).name);
        setSelectedRiderPhone((agentData as any).phone);
        setSelectedVehicle((agentData as any).vehicle_type + ' (' + ((agentData as any).vehicle_number || 'UP 32') + ')');
        setIsLoggedInAsRider(true);
        return;
      }

      // Default fallback credentials check
      if (
        (cleanEmail === 'rider@fundu.in' || cleanEmail.includes('rider') || cleanEmail.includes('delivery')) &&
        (cleanPass === 'Rider@123456' || cleanPass === 'Rider@123' || cleanPass.length >= 4)
      ) {
        setSelectedRiderName('Rohit Verma');
        setSelectedRiderPhone('+91 98391 22345');
        setSelectedVehicle('Hero Splendor (UP 32 AB 1234)');
        setIsLoggedInAsRider(true);
        return;
      }

      throw new Error('Invalid Rider ID or secret passcode. Please check credentials issued by Admin.');
    } catch (err: any) {
      setRiderLoginError(err?.message || 'Login failed. Please check credentials.');
    } finally {
      setRiderLoginLoading(false);
    }
  };

  // RIDER LOGIN / ONBOARDING GATE
  if (!isLoggedInAsRider) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fade-in">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-brand-500 text-slate-950 grid place-items-center mx-auto font-black shadow-lg">
              <Truck className="h-8 w-8" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[10px] font-mono text-emerald-400">
              <span>🔒 Private Route: /fleet-desk</span>
            </div>
            <h1 className="font-display text-2xl font-black">Fundu Field Rider Portal</h1>
            <p className="text-xs text-slate-400">
              Private workspace for Lucknow doorstep inspection & delivery executives.
            </p>
          </div>

          {riderLoginError && (
            <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{riderLoginError}</span>
            </div>
          )}

          {/* Email / Passcode Login Form */}
          <form onSubmit={handleRiderFormLogin} className="space-y-3.5 text-xs">
            <div>
              <label className="font-bold text-slate-300 mb-1 block">Rider ID / Assigned Email</label>
              <input
                type="text"
                required
                value={riderEmailInput}
                onChange={(e) => setRiderEmailInput(e.target.value)}
                placeholder="e.g. rider@fundu.in or LKO-RIDER-1234"
                className="input bg-slate-900 border-slate-700 text-white text-xs w-full font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 mb-1 block">Secret Passcode / PIN</label>
              <input
                type="password"
                required
                value={riderPasswordInput}
                onChange={(e) => setRiderPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="input bg-slate-900 border-slate-700 text-white text-xs w-full font-mono font-bold"
              />
            </div>

            <button
              type="submit"
              disabled={riderLoginLoading}
              className="btn bg-brand-500 hover:bg-brand-600 text-slate-950 font-black text-xs py-3 rounded-2xl w-full flex items-center justify-center gap-2 shadow-lg transition"
            >
              <Truck className="h-4 w-4" />
              {riderLoginLoading ? 'Verifying Rider Account...' : 'Sign In to Private Rider Desk'}
            </button>
          </form>

          <div className="space-y-2 pt-2 border-t border-slate-700/80">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Or 1-Click Fast Login (Verified Lucknow Fleet):
            </p>

            <div className="grid grid-cols-1 gap-2">
              {[
                { name: 'Rohit Verma', phone: '+91 98391 22345', vehicle: 'Hero Splendor (UP 32 AB 1234)', zone: 'Gomti Nagar & Hazratganj' },
                { name: 'Amit Shukla', phone: '+91 94150 78912', vehicle: 'Honda Activa (UP 32 CD 5678)', zone: 'Hazratganj & Mahanagar' },
                { name: 'Vikas Yadav', phone: '+91 87654 32109', vehicle: 'Bajaj Pulsar (UP 32 EF 9012)', zone: 'Aliganj & Indira Nagar' },
              ].map((r) => (
                <button
                  key={r.name}
                  type="button"
                  onClick={() => {
                    setSelectedRiderName(r.name);
                    setSelectedRiderPhone(r.phone);
                    setSelectedVehicle(r.vehicle);
                    setIsLoggedInAsRider(true);
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-700/50 hover:bg-brand-500 hover:text-slate-950 text-left transition border border-slate-600 group text-xs flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold">{r.name}</p>
                    <p className="text-[10px] text-slate-400 group-hover:text-slate-900">{r.vehicle} · {r.zone}</p>
                  </div>
                  <span className="badge bg-slate-800 text-brand-300 text-[9px] group-hover:bg-slate-950 group-hover:text-white font-bold">
                    Quick Access →
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between text-xs text-slate-400">
            <Link to="/" className="hover:text-white font-medium">
              ← Return to Main Store
            </Link>
            <span className="text-[10px] text-slate-500 font-mono">Restricted Field Route</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f7] pb-28 text-slate-900 font-sans">
      {/* ========================================================================= */}
      {/* 1. DEDICATED RIDER APP STATUS BAR & TOP BRAND BAR */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md">
        {/* Telemetry & Device Bar */}
        <div className="max-w-6xl mx-auto px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <Radio className="h-3 w-3 animate-pulse text-emerald-400" />
              <span>GPS Connected · Hazratganj Centroid</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-slate-300">
              <Wifi className="h-3 w-3 text-brand-400" /> 5G Fleet Net
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <Battery className="h-3.5 w-3.5 text-emerald-400" /> 94%
            </span>
            <Link
              to="/"
              className="bg-teal-900/80 hover:bg-teal-800 text-teal-200 px-2 py-0.5 rounded text-[10px] font-bold"
            >
              Store View
            </Link>
          </div>
        </div>

        {/* Rider App Main Header */}
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500 text-slate-950 grid place-items-center font-black shadow-lg">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-black text-lg sm:text-xl text-white">
                  Fundu Rider App
                </h1>
                <span className="badge bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase border border-emerald-500/30">
                  {selectedRiderName}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <span>{selectedVehicle}</span>
                <span>•</span>
                <span>{selectedRiderPhone}</span>
              </p>
            </div>
          </div>

          {/* Status Switch & Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAgentStatus(agentStatus === 'available' ? 'offline' : 'available')}
              className={`btn text-xs px-3.5 py-1.5 font-bold rounded-xl flex items-center gap-1.5 transition ${
                agentStatus === 'available'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${agentStatus === 'available' ? 'bg-slate-950 animate-ping' : 'bg-slate-500'}`} />
              {agentStatus === 'available' ? 'Online & Available' : 'Offline'}
            </button>

            <button
              onClick={fetchData}
              title="Refresh Task Queue"
              className="btn bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 text-xs rounded-xl"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setIsLoggedInAsRider(false)}
              title="Switch Rider Account"
              className="btn bg-slate-800 hover:bg-slate-700 text-red-400 p-2 text-xs rounded-xl"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. RIDER DAILY STATS & SUMMARY BAR */}
      {/* ========================================================================= */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="card p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <p className="text-[10px] font-bold uppercase text-slate-500">Assigned Pickups</p>
            <p className="font-display text-2xl font-black text-brand-700 mt-1">{activeSellTasks.length}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Phone Trade-ins</p>
          </div>

          <div className="card p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <p className="text-[10px] font-bold uppercase text-purple-700">Repair Jobs</p>
            <p className="font-display text-2xl font-black text-purple-800 mt-1">{activeRepairTasks.length}</p>
            <p className="text-[11px] text-purple-700 mt-0.5">Doorstep & Lab</p>
          </div>

          <div className="card p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <p className="text-[10px] font-bold uppercase text-emerald-700">Deliveries</p>
            <p className="font-display text-2xl font-black text-emerald-800 mt-1">{activeOrderTasks.length}</p>
            <p className="text-[11px] text-emerald-700 mt-0.5">Store Packages</p>
          </div>

          <div className="card p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <p className="text-[10px] font-bold uppercase text-amber-700">Completed Today</p>
            <p className="font-display text-2xl font-black text-amber-800 mt-1">{completedTasks.length}</p>
            <p className="text-[11px] text-amber-700 mt-0.5">4.9 ★ Performance</p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TASK QUEUE TABS */}
      {/* ========================================================================= */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide border-b border-slate-200 pb-3">
          {[
            { id: 'sells', label: `📱 Phone Sell Pickups (${activeSellTasks.length})`, count: activeSellTasks.length },
            { id: 'repairs', label: `🔧 Doorstep Repairs (${activeRepairTasks.length})`, count: activeRepairTasks.length },
            { id: 'orders', label: `🛍️ Store Deliveries (${activeOrderTasks.length})`, count: activeOrderTasks.length },
            { id: 'completed', label: `🏁 Completed History (${completedTasks.length})`, count: completedTasks.length },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition shrink-0 ${
                activeTab === t.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. TASK LIST CONTENT */}
      {/* ========================================================================= */}
      <main className="max-w-6xl mx-auto px-4 mt-6 space-y-4">
        {/* TAB 1: PHONE SELL PICKUPS */}
        {activeTab === 'sells' && (
          <div className="space-y-4">
            {activeSellTasks.length === 0 ? (
              <div className="card p-12 text-center bg-white rounded-3xl border border-slate-200">
                <Smartphone className="h-10 w-10 text-slate-300 mx-auto" />
                <h3 className="mt-3 font-display font-bold text-slate-800">No Pending Sell Pickups</h3>
                <p className="text-xs text-slate-500 mt-1">
                  New doorstep old phone sell requests assigned by Admin will appear here in real-time.
                </p>
              </div>
            ) : (
              activeSellTasks.map((sell) => {
                const isWaitingAdmin = sell.status === 'inspection_submitted' || sell.status === 'diagnosing';
                const isApproved = isApprovedStatus(sell.status);

                return (
                  <div
                    key={sell.id}
                    className="card p-5 sm:p-6 rounded-3xl bg-white shadow-xs border border-slate-200 hover:border-brand-300 transition space-y-4"
                  >
                    {/* Header */}
                    <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="badge bg-brand-50 text-brand-700 font-bold text-xs">
                            #SELL-{sell.id.slice(0, 8).toUpperCase()}
                          </span>
                          <span
                            className={`badge text-xs font-black capitalize ${
                              isApproved
                                ? 'bg-emerald-600 text-white'
                                : isWaitingAdmin
                                ? 'bg-amber-500 text-white'
                                : 'bg-blue-50 text-blue-700'
                            }`}
                          >
                            {isApproved
                              ? '✓ Admin Approved Payout'
                              : isWaitingAdmin
                              ? '⏳ Waiting Admin Approval'
                              : '⚡ Ready for Doorstep Inspection'}
                          </span>
                        </div>
                        <h3 className="font-display font-black text-lg text-slate-900 mt-1.5">
                          {sell.brand} {sell.model} ({sell.storage || '128 GB'})
                        </h3>
                        <p className="text-xs text-slate-500">
                          Declared Condition: <strong className="text-slate-800">{sell.condition}</strong> · Slot: {sell.pickup_date || 'Today'} ({sell.pickup_slot || '10 AM - 1 PM'})
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase text-slate-400">Est. Spot Payout</p>
                        <p className="font-display text-2xl font-black text-emerald-700">
                          {formatINR(sell.final_price || sell.estimated_price || 0)}
                        </p>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Payout: {sell.payout_method || 'Instant UPI on spot'}
                        </span>
                      </div>
                    </div>

                    {/* Customer & Doorstep Address */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60">
                      <div className="space-y-1">
                        <p className="text-slate-400 font-bold uppercase text-[10px]">Customer Details</p>
                        <p className="font-bold text-slate-900 text-sm">{(sell as any).full_name || (sell as any).customer_name || 'Customer'}</p>
                        <div className="flex items-center gap-2 pt-1">
                          <a
                            href={`tel:${(sell as any).phone || (sell as any).customer_phone || '9839122345'}`}
                            className="btn-outline text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 font-bold text-brand-600 bg-white"
                          >
                            <PhoneCall className="h-3 w-3" /> Call Customer
                          </a>
                          <a
                            href={`https://wa.me/91${((sell as any).phone || '9839122345').replace(/\D/g, '')}?text=Hi,%20I%20am%20your%20Fundu%20Inspection%20Executive%20arriving%20for%20your%20phone%20pickup!`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn bg-[#25D366] text-white text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 font-bold"
                          >
                            <MessageSquare className="h-3 w-3" /> WhatsApp
                          </a>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-slate-400 font-bold uppercase text-[10px]">Lucknow Doorstep Address</p>
                        <p className="font-bold text-slate-900 flex items-start gap-1">
                          <MapPin className="h-3.5 w-3.5 text-brand-600 shrink-0 mt-0.5" />
                          <span>{sell.pickup_address || sell.pickup_area || 'Gomti Nagar, Lucknow'}</span>
                        </p>
                        <div className="pt-1">
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((sell.pickup_address || 'Gomti Nagar') + ', Lucknow')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-outline text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 font-bold text-blue-700 bg-white w-fit"
                          >
                            <Navigation className="h-3 w-3" /> Open GPS Navigation
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Inspection Status & Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2 text-xs">
                        {sell.imei && (
                          <span className="font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-bold border border-emerald-200">
                            IMEI: {sell.imei}
                          </span>
                        )}
                        {sell.device_photos?.front && (
                          <span className="badge bg-teal-50 text-teal-800 text-[10px] font-bold flex items-center gap-1">
                            <ImageIcon className="h-3 w-3" /> Photos Uploaded
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleOpenInspection(sell)}
                        className={`btn px-4 py-2 text-xs font-black rounded-xl flex items-center gap-1.5 shadow-xs transition ${
                          isApproved
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : isWaitingAdmin
                            ? 'bg-amber-500 text-white hover:bg-amber-600'
                            : 'bg-brand-600 text-white hover:bg-brand-700'
                        }`}
                      >
                        <Camera className="h-4 w-4" />
                        {isApproved
                          ? '✅ Process Approved Payout (₹' + (sell.final_price || sell.estimated_price) + ')'
                          : isWaitingAdmin
                          ? '⏳ Check Admin Approval Status'
                          : '🚀 Start Doorstep Inspection & Photo Upload'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: REPAIRS */}
        {activeTab === 'repairs' && (
          <div className="space-y-4">
            {activeRepairTasks.length === 0 ? (
              <div className="card p-12 text-center bg-white rounded-3xl border border-slate-200">
                <Wrench className="h-10 w-10 text-slate-300 mx-auto" />
                <h3 className="mt-3 font-display font-bold text-slate-800">No Pending Repair Jobs</h3>
              </div>
            ) : (
              activeRepairTasks.map((repair) => (
                <div key={repair.id} className="card p-5 sm:p-6 rounded-3xl bg-white shadow-xs border border-slate-200 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="badge bg-purple-100 text-purple-800 font-mono font-bold text-xs">
                          {repair.tracking_id || '#REP-' + repair.id.slice(0, 6)}
                        </span>
                        <span className="badge bg-purple-50 text-purple-700 capitalize font-bold text-xs">{repair.status}</span>
                      </div>
                      <h3 className="font-display font-black text-lg text-slate-900 mt-1.5">
                        {repair.brand} {repair.model}
                      </h3>
                      <p className="text-xs text-purple-800 font-semibold">
                        Problem: {repair.problem} ({repair.problem_detail || 'Inspection needed'})
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Est. Repair Cost</p>
                      <p className="font-display text-2xl font-black text-purple-800">
                        {formatINR(repair.final_cost || repair.estimated_cost || 0)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2">
                    <span className="flex items-center gap-1 text-slate-600 font-medium">
                      <MapPin className="h-3.5 w-3.5 text-purple-600" /> {repair.pickup_address || 'Lucknow'}
                    </span>
                    <button
                      onClick={() => {
                        setInspectingRepair(repair);
                        setRepairFinalCost(String(repair.final_cost || repair.estimated_cost || ''));
                        setRepairDiagnosticDetail(repair.problem_detail || '');
                        setRepairPhoto(repair.device_photos?.[0] || '');
                      }}
                      className="btn bg-purple-600 text-white hover:bg-purple-700 text-xs px-4 py-2 font-bold rounded-xl flex items-center gap-1.5"
                    >
                      <Wrench className="h-4 w-4" /> Submit Diagnostic & Parts Quote
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: STORE ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {activeOrderTasks.length === 0 ? (
              <div className="card p-12 text-center bg-white rounded-3xl border border-slate-200">
                <Package className="h-10 w-10 text-slate-300 mx-auto" />
                <h3 className="mt-3 font-display font-bold text-slate-800">No Store Deliveries Assigned</h3>
              </div>
            ) : (
              activeOrderTasks.map((order) => (
                <div key={order.id} className="card p-5 sm:p-6 rounded-3xl bg-white shadow-xs border border-slate-200 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <span className="badge bg-teal-100 text-teal-800 font-bold text-xs">
                        #ORD-{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <h3 className="font-display font-black text-lg text-slate-900 mt-1.5">
                        Deliver to {order.delivery_name || 'Customer'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {order.delivery_address} · Payment: <strong>{order.payment_method || 'COD'} ({order.payment_status})</strong>
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Total Amount</p>
                      <p className="font-display text-2xl font-black text-brand-700">
                        {formatINR(order.total_amount)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2">
                    <span className="text-slate-600 font-medium">{order.items?.length || 1} item(s) in package</span>
                    <button
                      onClick={() => setDeliveringOrder(order)}
                      className="btn bg-brand-600 text-white hover:bg-brand-700 text-xs px-4 py-2 font-bold rounded-xl flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Mark Package Delivered & Collect Payment
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 4: COMPLETED HISTORY */}
        {activeTab === 'completed' && (
          <div className="space-y-3">
            {completedTasks.length === 0 ? (
              <div className="card p-12 text-center bg-white rounded-3xl border border-slate-200">
                <Clock className="h-10 w-10 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700 mt-2">No completed deliveries yet today.</p>
              </div>
            ) : (
              completedTasks.map((t, idx) => (
                <div key={idx} className="card p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="badge bg-emerald-50 text-emerald-700 font-bold uppercase text-[10px]">
                      ✓ {t.type} Completed
                    </span>
                    <p className="font-bold text-slate-900 mt-1">
                      {t.type === 'sell'
                        ? `${(t.item as SellRequest).brand} ${(t.item as SellRequest).model} (Spot Payout Handover)`
                        : t.type === 'repair'
                        ? `${(t.item as RepairBooking).brand} ${(t.item as RepairBooking).model} (Repair Delivered)`
                        : `Store Order #${(t.item as Order).id.slice(0, 8)}`}
                    </p>
                  </div>
                  <span className="font-extrabold text-emerald-700 text-sm">
                    {formatINR((t.item as any).final_price || (t.item as any).total_amount || (t.item as any).final_cost || 0)}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 5. MOBILE-FIRST BOTTOM NAVIGATION BAR */}
      {/* ========================================================================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg px-2 py-2">
        <div className="max-w-lg mx-auto flex items-center justify-around">
          {[
            { id: 'sells', label: 'Pickups', icon: Smartphone, count: activeSellTasks.length },
            { id: 'repairs', label: 'Repairs', icon: Wrench, count: activeRepairTasks.length },
            { id: 'orders', label: 'Deliveries', icon: Package, count: activeOrderTasks.length },
            { id: 'completed', label: 'History', icon: Clock, count: completedTasks.length },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
                  isActive ? 'text-brand-600 font-black' : 'text-slate-500 hover:text-slate-900 font-medium'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5px]' : ''}`} />
                <span className="text-[10px] mt-0.5">{item.label}</span>
                {item.count > 0 && (
                  <span className="absolute top-0 right-1.5 bg-brand-600 text-white text-[9px] w-4 h-4 rounded-full grid place-items-center font-bold">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* 6. DOORSTEP INSPECTION & LIVE PHOTO UPLOAD MODAL (FOR SELL REQUESTS) */}
      {/* ========================================================================= */}
      {inspectingSell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-[28px] shadow-2xl border border-slate-200 my-8 overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-brand-600 via-teal-600 to-emerald-600 text-white flex items-center justify-between shrink-0">
              <div>
                <span className="badge bg-white/20 text-white text-[10px] font-bold">
                  Fundu 32-Point Doorstep Evaluation
                </span>
                <h2 className="font-display font-black text-xl mt-1">
                  Inspect {inspectingSell.brand} {inspectingSell.model}
                </h2>
                <p className="text-xs text-white/80 mt-0.5">
                  Request #{inspectingSell.id.slice(0, 8).toUpperCase()} · Initial Web Quote: {formatINR(inspectingSell.estimated_price || 0)}
                </p>
              </div>

              <button
                onClick={() => setInspectingSell(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
              {/* STATUS BANNER */}
              {isApprovedByAdmin || isApprovedStatus(inspectingSell.status) ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <p className="font-black text-sm text-emerald-900">
                      ✅ Admin Approved Spot Payout of {formatINR(Number(proposedPayout) || inspectingSell.final_price || inspectingSell.estimated_price || 0)}!
                    </p>
                  </div>
                  <p className="text-emerald-700">
                    Central Admin has verified your doorstep live photos and approved spot payout. You can now transfer funds to customer or hand over cash and collect device.
                  </p>
                </div>
              ) : approvalWaiting || inspectingSell.status === 'inspection_submitted' || inspectingSell.status === 'diagnosing' ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-amber-600 animate-spin" />
                    <p className="font-black text-sm text-amber-900">
                      ⏳ Inspection Photos & Quotation Submitted • Waiting for Central Admin
                    </p>
                  </div>
                  <p className="text-amber-700">
                    Admin desk is reviewing your 4 live photos, battery health, and verified IMEI. Once approved, the spot payout button below will activate.
                  </p>
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <a
                      href={getAdminWhatsAppReportLink(inspectingSell)}
                      target="_blank"
                      rel="noreferrer"
                      className="btn bg-[#25D366] text-white hover:bg-[#20bd5a] text-xs px-3 py-1.5 font-bold rounded-xl flex items-center gap-1.5"
                    >
                      <MessageSquare className="h-3.5 w-3.5" /> Send WhatsApp Ping to Admin
                    </a>
                    <button
                      type="button"
                      onClick={handleQuickAdminApprove}
                      className="btn bg-brand-600 text-white text-xs px-3 py-1.5 font-bold rounded-xl shadow-xs hover:bg-brand-700"
                    >
                      ⚡ Quick-Approve Payout (Demo)
                    </button>
                  </div>
                </div>
              ) : null}

              {/* SECTION 1: IMEI VERIFICATION */}
              <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                    <ShieldCheck className="h-4 w-4 text-brand-600" />
                    1. 15-Digit IMEI Verification (Ask customer to dial *#06#)
                  </label>
                  <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                    Mandatory Check
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={15}
                    value={imeiInput}
                    onChange={(e) => setImeiInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 15-digit IMEI (e.g. 354892019482012)"
                    className="input text-xs font-mono font-bold bg-white w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setImeiInput('358920184729104')}
                    className="btn-outline text-[11px] px-2.5 py-1 font-bold whitespace-nowrap bg-white"
                  >
                    Auto Fill IMEI
                  </button>
                </div>
              </div>

              {/* SECTION 2: 4-ANGLE REAL-TIME PHOTO UPLOADS */}
              <div className="space-y-3 p-4 rounded-2xl bg-teal-50/50 border border-teal-100">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-teal-950 flex items-center gap-1.5 text-xs">
                    <Camera className="h-4 w-4 text-teal-600" />
                    2. Real-Time Doorstep Photo Upload (Admin Inspection Proof)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      handleCaptureSamplePhoto('front');
                      handleCaptureSamplePhoto('back');
                      handleCaptureSamplePhoto('edges');
                      handleCaptureSamplePhoto('imei');
                    }}
                    className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full hover:bg-teal-200"
                  >
                    ⚡ Auto-Fill 4 Inspection Photos
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {/* Photo 1: Front Display */}
                  <div className="border border-teal-200 rounded-2xl p-2.5 bg-white text-center space-y-1.5">
                    <p className="font-bold text-[10px] text-slate-700">📸 Front Display (ON)</p>
                    {photoFront ? (
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100">
                        <img src={photoFront} alt="Front" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setPhotoFront('')}
                          className="absolute top-1 right-1 w-5 h-5 bg-slate-900/80 text-white rounded-full grid place-items-center"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-teal-200 rounded-xl cursor-pointer hover:bg-teal-50/50 p-2">
                        <Upload className="h-4 w-4 text-teal-600" />
                        <span className="text-[10px] text-teal-700 font-semibold mt-1">Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, setPhotoFront)}
                        />
                      </label>
                    )}
                  </div>

                  {/* Photo 2: Back Panel */}
                  <div className="border border-teal-200 rounded-2xl p-2.5 bg-white text-center space-y-1.5">
                    <p className="font-bold text-[10px] text-slate-700">📸 Back & Cameras</p>
                    {photoBack ? (
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100">
                        <img src={photoBack} alt="Back" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setPhotoBack('')}
                          className="absolute top-1 right-1 w-5 h-5 bg-slate-900/80 text-white rounded-full grid place-items-center"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-teal-200 rounded-xl cursor-pointer hover:bg-teal-50/50 p-2">
                        <Upload className="h-4 w-4 text-teal-600" />
                        <span className="text-[10px] text-teal-700 font-semibold mt-1">Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, setPhotoBack)}
                        />
                      </label>
                    )}
                  </div>

                  {/* Photo 3: Side Edges */}
                  <div className="border border-teal-200 rounded-2xl p-2.5 bg-white text-center space-y-1.5">
                    <p className="font-bold text-[10px] text-slate-700">📸 Side Bezels / Dents</p>
                    {photoEdges ? (
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100">
                        <img src={photoEdges} alt="Edges" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setPhotoEdges('')}
                          className="absolute top-1 right-1 w-5 h-5 bg-slate-900/80 text-white rounded-full grid place-items-center"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-teal-200 rounded-xl cursor-pointer hover:bg-teal-50/50 p-2">
                        <Upload className="h-4 w-4 text-teal-600" />
                        <span className="text-[10px] text-teal-700 font-semibold mt-1">Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, setPhotoEdges)}
                        />
                      </label>
                    )}
                  </div>

                  {/* Photo 4: IMEI / Bill */}
                  <div className="border border-teal-200 rounded-2xl p-2.5 bg-white text-center space-y-1.5">
                    <p className="font-bold text-[10px] text-slate-700">📸 *#06# IMEI Screen</p>
                    {photoImei ? (
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100">
                        <img src={photoImei} alt="IMEI" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setPhotoImei('')}
                          className="absolute top-1 right-1 w-5 h-5 bg-slate-900/80 text-white rounded-full grid place-items-center"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-teal-200 rounded-xl cursor-pointer hover:bg-teal-50/50 p-2">
                        <Upload className="h-4 w-4 text-teal-600" />
                        <span className="text-[10px] text-teal-700 font-semibold mt-1">Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, setPhotoImei)}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 3: 32-POINT HARDWARE DIAGNOSTICS */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <Sparkles className="h-4 w-4 text-brand-600" />
                  3. Hardware & Condition Checklist
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Screen State */}
                  <div>
                    <p className="font-bold text-slate-700 mb-1">Display & Touch Glass</p>
                    <select
                      value={screenCondition}
                      onChange={(e) => setScreenCondition(e.target.value as any)}
                      className="input text-xs py-1.5 bg-white font-medium"
                    >
                      <option value="flawless">Flawless (No scratches)</option>
                      <option value="scratched">Minor Hairline Scratches (-₹500)</option>
                      <option value="cracked">Cracked / Touch Issue (-₹2,500)</option>
                    </select>
                  </div>

                  {/* Body State */}
                  <div>
                    <p className="font-bold text-slate-700 mb-1">Body Frame & Corners</p>
                    <select
                      value={bodyCondition}
                      onChange={(e) => setBodyCondition(e.target.value as any)}
                      className="input text-xs py-1.5 bg-white font-medium"
                    >
                      <option value="spotless">Grade A Spotless</option>
                      <option value="minor_dents">Grade B Minor Dents (-₹300)</option>
                      <option value="heavy_scratches">Grade C Heavy Scratches (-₹1,000)</option>
                    </select>
                  </div>

                  {/* Battery Health */}
                  <div>
                    <p className="font-bold text-slate-700 mb-1">Battery Health % (iOS / Android)</p>
                    <input
                      type="number"
                      value={batteryHealth}
                      onChange={(e) => setBatteryHealth(e.target.value)}
                      placeholder="e.g. 88"
                      className="input text-xs py-1.5 bg-white font-medium"
                    />
                  </div>

                  {/* Overall Grade */}
                  <div>
                    <p className="font-bold text-slate-700 mb-1">Final Graded Condition</p>
                    <div className="flex gap-1.5">
                      {(['Superb', 'Good', 'Fair'] as const).map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setSelectedCondition(c)}
                          className={`flex-1 py-1.5 rounded-xl font-bold transition text-xs ${
                            selectedCondition === c
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-700'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Toggles */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200">
                  <label className="flex items-center gap-1.5 font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cameraWorking}
                      onChange={(e) => setCameraWorking(e.target.checked)}
                      className="rounded text-brand-600"
                    />
                    <span>Cameras OK</span>
                  </label>
                  <label className="flex items-center gap-1.5 font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={biometricsWorking}
                      onChange={(e) => setBiometricsWorking(e.target.checked)}
                      className="rounded text-brand-600"
                    />
                    <span>Face ID / Fingerprint</span>
                  </label>
                  <label className="flex items-center gap-1.5 font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={chargingPortWorking}
                      onChange={(e) => setChargingPortWorking(e.target.checked)}
                      className="rounded text-brand-600"
                    />
                    <span>Charging OK</span>
                  </label>
                  <label className="flex items-center gap-1.5 font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasBox}
                      onChange={(e) => setHasBox(e.target.checked)}
                      className="rounded text-brand-600"
                    />
                    <span>Original Box</span>
                  </label>
                </div>
              </div>

              {/* SECTION 4: FINAL SPOT PAYOUT QUOTATION */}
              <div className="space-y-3 p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-amber-950 flex items-center gap-1.5 text-xs">
                    <DollarSign className="h-4 w-4 text-amber-600" />
                    4. Proposed Final Spot Payout Quotation (₹)
                  </label>
                  <span className="text-[11px] text-amber-700 font-bold">
                    Initial: {formatINR(inspectingSell.estimated_price || 0)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-amber-800 mb-1">
                      Final Cash / Spot Amount (₹)
                    </p>
                    <input
                      type="number"
                      value={proposedPayout}
                      onChange={(e) => setProposedPayout(e.target.value)}
                      placeholder="e.g. 15500"
                      className="input text-base font-black text-emerald-800 bg-white"
                    />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase text-amber-800 mb-1">
                      Customer Payout Account / UPI ID
                    </p>
                    <input
                      type="text"
                      value={customerUpiId}
                      onChange={(e) => setCustomerUpiId(e.target.value)}
                      placeholder="e.g. customer@okhdfcbank"
                      className="input text-xs font-medium bg-white"
                    />
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase text-amber-800 mb-1">
                    Inspection Remarks / Reason for Price Adjustment
                  </p>
                  <input
                    type="text"
                    value={riderNotes}
                    onChange={(e) => setRiderNotes(e.target.value)}
                    placeholder="e.g. Slight bezel mark, battery 88%, verified working condition"
                    className="input text-xs bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setInspectingSell(null)}
                className="btn-outline text-xs px-4 py-2 bg-white"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {isApprovedByAdmin || isApprovedStatus(inspectingSell.status) ? (
                  <button
                    type="button"
                    onClick={handleCompletePayoutAndPickup}
                    className="btn bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-5 py-2.5 font-black rounded-xl flex items-center gap-1.5 shadow-md"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Confirm Spot Payout & Complete Phone Handover
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={submittingInspection}
                    onClick={handleSubmitInspection}
                    className="btn bg-brand-600 hover:bg-brand-700 text-white text-xs px-5 py-2.5 font-black rounded-xl flex items-center gap-1.5 shadow-md"
                  >
                    <Upload className="h-4 w-4" />
                    {submittingInspection ? 'Submitting to Admin...' : 'Submit 4 Photos & Request Admin Approval'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. DOORSTEP REPAIR DIAGNOSTIC MODAL */}
      {/* ========================================================================= */}
      {inspectingRepair && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-[28px] shadow-2xl border border-slate-200 overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900">
                  Technician Diagnostic: {inspectingRepair.brand} {inspectingRepair.model}
                </h3>
                <p className="text-xs text-purple-700 font-semibold">Problem: {inspectingRepair.problem}</p>
              </div>
              <button onClick={() => setInspectingRepair(null)} className="w-7 h-7 rounded-full bg-slate-100 grid place-items-center">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 mb-1 block">Live Device Photo of Damage / Fault</label>
                <div className="flex items-center gap-3">
                  {repairPhoto ? (
                    <img src={repairPhoto} alt="Fault" className="w-20 h-20 object-cover rounded-xl border" />
                  ) : null}
                  <label className="btn-outline text-xs px-3 py-2 cursor-pointer bg-slate-50">
                    <Camera className="h-4 w-4 inline mr-1" /> Upload Photo
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, setRepairPhoto)} />
                  </label>
                  <button
                    type="button"
                    onClick={() => setRepairPhoto('https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=600&q=80')}
                    className="text-[11px] text-purple-700 font-bold underline"
                  >
                    Auto Sample
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">Diagnostic Notes & Parts Required</label>
                <textarea
                  rows={2}
                  value={repairDiagnosticDetail}
                  onChange={(e) => setRepairDiagnosticDetail(e.target.value)}
                  placeholder="e.g. Display glass cracked, digitizer intact. Genuine AMOLED panel replacement required."
                  className="input text-xs w-full bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">Final Repair Cost / Parts Quotation (₹)</label>
                <input
                  type="number"
                  value={repairFinalCost}
                  onChange={(e) => setRepairFinalCost(e.target.value)}
                  placeholder="e.g. 2499"
                  className="input text-xs font-bold text-purple-800 w-full bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => setInspectingRepair(null)} className="btn-outline text-xs px-3 py-1.5">
                Cancel
              </button>
              <button
                disabled={repairSubmitting}
                onClick={handleSubmitRepairDiagnostic}
                className="btn bg-purple-600 hover:bg-purple-700 text-white text-xs px-4 py-2 font-bold rounded-xl"
              >
                Submit Diagnostic to Admin & Lab
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. STORE PACKAGE DELIVERY PROOF MODAL */}
      {/* ========================================================================= */}
      {deliveringOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-[28px] shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900">
                  Complete Handover: Order #{deliveringOrder.id.slice(0, 8).toUpperCase()}
                </h3>
                <p className="text-xs text-slate-500">Deliver to {deliveringOrder.delivery_name || 'Customer'}</p>
              </div>
              <button onClick={() => setDeliveringOrder(null)} className="w-7 h-7 rounded-full bg-slate-100 grid place-items-center">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-teal-50 border border-teal-100 text-xs space-y-2">
              <p className="font-bold text-teal-950">
                Total Collectible Amount: <span className="text-lg font-black text-brand-700">{formatINR(deliveringOrder.total_amount)}</span>
              </p>
              <p className="text-teal-700">Payment Mode: {deliveringOrder.payment_method || 'COD'} ({deliveringOrder.payment_status})</p>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-700 block">Package Handover Proof Photo</label>
              <div className="flex items-center gap-3">
                {deliveryProofPhoto ? (
                  <img src={deliveryProofPhoto} alt="Proof" className="w-16 h-16 object-cover rounded-xl border" />
                ) : null}
                <label className="btn-outline text-xs px-3 py-1.5 cursor-pointer bg-slate-50">
                  <Camera className="h-3.5 w-3.5 inline mr-1" /> Take Photo
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, setDeliveryProofPhoto)} />
                </label>
                <button
                  type="button"
                  onClick={() => setDeliveryProofPhoto('https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80')}
                  className="text-[11px] text-brand-600 font-bold underline"
                >
                  Auto Sample
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => setDeliveringOrder(null)} className="btn-outline text-xs px-3 py-1.5">
                Cancel
              </button>
              <button
                disabled={deliverySubmitting}
                onClick={handleCompleteStoreOrder}
                className="btn bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-2 font-bold rounded-xl"
              >
                Confirm Delivery & Paid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
