import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Smartphone, BadgeIndianRupee, Wrench, Package,
  Truck, Clock, LogOut, User, Phone, MapPin, Calendar, CheckCircle2,
  Circle, AlertCircle, ChevronRight, Banknote, ShieldCheck, Star,
  RefreshCw, ArrowRight, CreditCard, Boxes,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, formatINR } from '../lib/db';
import type { SellRequest, RepairBooking, Order, Dispatch } from '../types';

/* ── Status helpers ─────────────────────────────────────────── */
const STATUS_META: Record<string, { color: string; dot: string; label: string }> = {
  pending:           { color: 'bg-trail-50 text-trail-600 border-trail-200',    dot: 'bg-trail-400',   label: 'Pending' },
  confirmed:         { color: 'bg-weather-50 text-weather-700 border-weather-200', dot: 'bg-weather-500', label: 'Confirmed' },
  price_offered:     { color: 'bg-weather-50 text-weather-700 border-weather-200', dot: 'bg-weather-500', label: 'Price Offered' },
  accepted:          { color: 'bg-brand-50 text-brand-700 border-brand-200',    dot: 'bg-brand-500',   label: 'Accepted' },
  pickup_scheduled:  { color: 'bg-brand-50 text-brand-700 border-brand-200',    dot: 'bg-brand-500',   label: 'Pickup Scheduled' },
  picked_up:         { color: 'bg-brand-50 text-brand-700 border-brand-200',    dot: 'bg-brand-500',   label: 'Picked Up' },
  diagnosing:        { color: 'bg-brand-50 text-brand-700 border-brand-200',    dot: 'bg-brand-500',   label: 'Diagnosing' },
  repairing:         { color: 'bg-brand-50 text-brand-700 border-brand-200',    dot: 'bg-brand-500',   label: 'Repairing' },
  inspected:         { color: 'bg-weather-50 text-weather-700 border-weather-200', dot: 'bg-weather-500', label: 'Inspected' },
  repaired:          { color: 'bg-nature-50 text-nature-700 border-nature-200', dot: 'bg-nature-500',  label: 'Repaired' },
  completed:         { color: 'bg-nature-50 text-nature-700 border-nature-200', dot: 'bg-nature-500',  label: 'Completed' },
  delivered:         { color: 'bg-nature-50 text-nature-700 border-nature-200', dot: 'bg-nature-500',  label: 'Delivered' },
  shipped:           { color: 'bg-weather-50 text-weather-700 border-weather-200', dot: 'bg-weather-500', label: 'Shipped' },
  cancelled:         { color: 'bg-accent-50 text-accent-700 border-accent-200', dot: 'bg-accent-500',  label: 'Cancelled' },
  rejected:          { color: 'bg-accent-50 text-accent-700 border-accent-200', dot: 'bg-accent-500',  label: 'Rejected' },
  dispatched:        { color: 'bg-weather-50 text-weather-700 border-weather-200', dot: 'bg-weather-500', label: 'Dispatched' },
  in_transit:        { color: 'bg-brand-50 text-brand-700 border-brand-200',    dot: 'bg-brand-500',   label: 'In Transit' },
};

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? { color: 'bg-ink-100 text-ink-600 border-ink-200', dot: 'bg-ink-400', label: status.replace(/_/g, ' ') };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

/* ── Sell status flow ── */
const SELL_STEPS = ['pending', 'confirmed', 'pickup_scheduled', 'picked_up', 'inspected', 'completed'];
const REPAIR_STEPS = ['pending', 'confirmed', 'pickup_scheduled', 'picked_up', 'diagnosing', 'repairing', 'repaired', 'completed'];
const ORDER_STEPS = ['confirmed', 'shipped', 'dispatched', 'in_transit', 'delivered'];

function ProgressTrack({ steps, current }: { steps: string[]; current: string }) {
  const idx = steps.indexOf(current);
  const done = idx === -1 ? 0 : idx;
  const pct = steps.length <= 1 ? 100 : Math.round((done / (steps.length - 1)) * 100);

  return (
    <div className="mt-4">
      <div className="flex items-center gap-1">
        {steps.map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-1">
            <div className={`h-2 w-2 shrink-0 rounded-full transition-colors ${i <= done ? 'bg-brand-500' : 'bg-ink-200'}`} />
            {i < steps.length - 1 && (
              <div className={`h-0.5 flex-1 rounded-full transition-colors ${i < done ? 'bg-brand-500' : 'bg-ink-200'}`} />
            )}
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-ink-400">
        <span>{steps[0].replace(/_/g, ' ')}</span>
        <span className="font-semibold text-brand-600">{pct}%</span>
        <span>{steps[steps.length - 1].replace(/_/g, ' ')}</span>
      </div>
    </div>
  );
}

/* ── Info row ── */
function InfoRow({ icon: Icon, label, value, accent }: { icon: typeof MapPin; label: string; value: string | null | undefined; accent?: boolean }) {
  if (!value) return null;
  return (
    <div className={`flex items-start gap-2.5 rounded-xl px-3 py-2.5 ${accent ? 'bg-brand-50 border border-brand-100' : 'bg-ink-50'}`}>
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${accent ? 'text-brand-600' : 'text-ink-400'}`} />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">{label}</p>
        <p className={`text-sm font-medium ${accent ? 'text-brand-800' : 'text-ink-800'}`}>{value}</p>
      </div>
    </div>
  );
}

/* ── Agent card ── */
function AgentCard({ name, phone, label, eta }: { name: string; phone?: string | null; label: string; eta?: string | null }) {
  return (
    <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2.5">
      <div className="flex items-center gap-2.5">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">
          {name[0].toUpperCase()}
        </div>
        <div>
          <p className="text-xs font-bold text-ink-900">{label}: {name}</p>
          {eta && <p className="text-[11px] text-ink-500">{eta}</p>}
        </div>
      </div>
      {phone && (
        <a href={`tel:${phone}`} className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-white px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-50 transition-colors">
          <Phone className="h-3 w-3" /> Call
        </a>
      )}
    </div>
  );
}

/* ── Main Dashboard ── */
export default function Dashboard() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'overview' | 'sells' | 'repairs' | 'orders'>('overview');
  const [sells, setSells] = useState<SellRequest[]>([]);
  const [repairs, setRepairs] = useState<RepairBooking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate('/login?redirect=/dashboard');
    if (!loading && user && profile && profile.role === 'admin') navigate('/admin');
    if (!loading && user && profile && profile.role === 'wholesaler') navigate('/wholesaler');
  }, [loading, user, profile, navigate]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      db.from('sell_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      db.from('repair_bookings').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      db.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    ]).then(([s, r, o]) => {
      setSells((s.data as SellRequest[]) ?? []);
      setRepairs((r.data as RepairBooking[]) ?? []);
      const orderList = (o.data as Order[]) ?? [];
      setOrders(orderList);
      if (orderList.length > 0) {
        db.from('dispatches').select('*').in('order_id', orderList.map((or) => or.id)).order('created_at', { ascending: false })
          .then(({ data }) => setDispatches((data as Dispatch[]) ?? []));
      }
      setDataLoading(false);
    });
  }, [user]);

  if (loading || !user) {
    return (
      <div className="container-page py-20 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-600 animate-pulse">
          <RefreshCw className="h-6 w-6" />
        </div>
        <p className="mt-4 text-ink-500">Loading your dashboard…</p>
      </div>
    );
  }

  const displayName = profile?.full_name || (user as { phone?: string }).phone || user.email?.split('@')[0] || 'User';
  const stats = [
    { icon: BadgeIndianRupee, label: 'Sell Requests', value: sells.length, bg: 'bg-accent-50 text-accent-600', tab: 'sells' as const },
    { icon: Wrench,           label: 'Repair Bookings', value: repairs.length, bg: 'bg-brand-50 text-brand-600', tab: 'repairs' as const },
    { icon: Package,          label: 'Orders Placed', value: orders.length, bg: 'bg-nature-50 text-nature-600', tab: 'orders' as const },
  ];

  const TABS = [
    { id: 'overview', label: 'Overview',      icon: LayoutDashboard },
    { id: 'sells',    label: 'Sell Requests', icon: BadgeIndianRupee, count: sells.length },
    { id: 'repairs',  label: 'Repairs',       icon: Wrench,           count: repairs.length },
    { id: 'orders',   label: 'Orders',        icon: Package,          count: orders.length },
  ] as const;

  return (
    <div className="container-page py-10">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-100 text-brand-700">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-extrabold text-ink-900">Hi, {displayName} 👋</h1>
            <div className="flex items-center gap-3 mt-0.5">
              {profile?.phone && (
                <span className="flex items-center gap-1 text-xs text-ink-500">
                  <Phone className="h-3 w-3" /> {profile.phone}
                </span>
              )}
              {profile?.is_verified && (
                <span className="flex items-center gap-1 text-xs text-nature-700 font-semibold">
                  <ShieldCheck className="h-3 w-3" /> Verified
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/profile" className="btn-outline text-sm">
            <User className="h-4 w-4" /> Profile
          </Link>
          <button onClick={() => { signOut(); navigate('/'); }} className="btn-outline text-sm">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <button
            key={s.label}
            onClick={() => setTab(s.tab)}
            className="card p-5 flex items-center gap-4 hover:border-brand-300 transition-colors text-left"
          >
            <div className={`grid h-12 w-12 place-items-center rounded-xl ${s.bg}`}>
              <s.icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="font-display text-2xl font-extrabold text-ink-900">{s.value}</p>
              <p className="text-sm text-ink-500">{s.label}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-ink-300" />
          </button>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="mt-8 flex gap-1 border-b border-ink-100 overflow-x-auto scrollbar-hide">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as typeof tab)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              tab === t.id ? 'border-brand-600 text-brand-700' : 'border-transparent text-ink-500 hover:text-ink-800'
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
            {'count' in t && t.count > 0 && (
              <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${tab === t.id ? 'bg-brand-100 text-brand-700' : 'bg-ink-100 text-ink-500'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div className="mt-6">
        {dataLoading ? (
          <div className="card p-12 text-center text-ink-400">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin opacity-40" />
            <p className="mt-3 text-sm">Fetching your activity…</p>
          </div>
        ) : tab === 'overview' ? (
          <OverviewTab sells={sells} repairs={repairs} orders={orders} dispatches={dispatches} onTabChange={setTab} />
        ) : tab === 'sells' ? (
          <SellsTab sells={sells} />
        ) : tab === 'repairs' ? (
          <RepairsTab repairs={repairs} />
        ) : (
          <OrdersTab orders={orders} dispatches={dispatches} />
        )}
      </div>

      {/* ── Quick actions ── */}
      <div className="mt-10">
        <p className="mb-3 text-sm font-semibold text-ink-500 uppercase tracking-wide">Quick Actions</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link to="/buy" className="card p-4 flex items-center gap-3 hover:border-brand-400 transition-colors">
            <Smartphone className="h-5 w-5 text-brand-600" />
            <div className="flex-1">
              <p className="font-semibold text-ink-900 text-sm">Buy a Phone</p>
              <p className="text-xs text-ink-500">Certified refurbished with warranty</p>
            </div>
            <ArrowRight className="h-4 w-4 text-ink-300" />
          </Link>
          <Link to="/sell" className="card p-4 flex items-center gap-3 hover:border-brand-400 transition-colors">
            <BadgeIndianRupee className="h-5 w-5 text-accent-600" />
            <div className="flex-1">
              <p className="font-semibold text-ink-900 text-sm">Sell Your Phone</p>
              <p className="text-xs text-ink-500">Best price + free doorstep pickup</p>
            </div>
            <ArrowRight className="h-4 w-4 text-ink-300" />
          </Link>
          <Link to="/repair" className="card p-4 flex items-center gap-3 hover:border-brand-400 transition-colors">
            <Wrench className="h-5 w-5 text-nature-600" />
            <div className="flex-1">
              <p className="font-semibold text-ink-900 text-sm">Book Repair</p>
              <p className="text-xs text-ink-500">Doorstep pickup & repair in Lucknow</p>
            </div>
            <ArrowRight className="h-4 w-4 text-ink-300" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   OVERVIEW TAB
═══════════════════════════════════════════════════════════════ */
function OverviewTab({
  sells, repairs, orders, dispatches, onTabChange,
}: {
  sells: SellRequest[]; repairs: RepairBooking[]; orders: Order[];
  dispatches: Dispatch[]; onTabChange: (t: 'sells' | 'repairs' | 'orders') => void;
}) {
  const activeItems = [
    ...sells.filter((s) => !['completed', 'cancelled', 'rejected'].includes(s.status)).slice(0, 2).map((s) => ({
      type: 'sell' as const, id: s.id, title: `${s.brand} ${s.model}`, status: s.status,
      sub: `Est. ${s.estimated_price ? formatINR(s.estimated_price) : '—'}`, date: s.created_at, tab: 'sells' as const,
    })),
    ...repairs.filter((r) => !['completed', 'cancelled'].includes(r.status)).slice(0, 2).map((r) => ({
      type: 'repair' as const, id: r.id, title: `${r.brand} ${r.model}`, status: r.status,
      sub: r.problem, date: r.created_at, tab: 'repairs' as const,
    })),
    ...orders.filter((o) => !['delivered', 'cancelled'].includes(o.status)).slice(0, 2).map((o) => ({
      type: 'order' as const, id: o.id, title: `Order #${o.id.slice(0, 8).toUpperCase()}`, status: o.status,
      sub: formatINR(o.total_amount), date: o.created_at, tab: 'orders' as const,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  const TYPE_ICON = {
    sell:   { icon: BadgeIndianRupee, bg: 'bg-accent-50 text-accent-600' },
    repair: { icon: Wrench,           bg: 'bg-brand-50 text-brand-600' },
    order:  { icon: Package,          bg: 'bg-nature-50 text-nature-600' },
  };

  return (
    <div className="space-y-6">
      {/* Active items */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-ink-900">Active Activity</h3>
          <span className="badge bg-brand-50 text-brand-700">{activeItems.length} active</span>
        </div>
        {activeItems.length === 0 ? (
          <div className="py-6 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-nature-500 opacity-60" />
            <p className="mt-2 text-sm text-ink-500">All caught up! No pending activity.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeItems.map((item) => {
              const { icon: Icon, bg } = TYPE_ICON[item.type];
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.tab)}
                  className="w-full flex items-center gap-3 rounded-xl bg-ink-50 hover:bg-brand-50 transition-colors p-3 text-left"
                >
                  <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${bg}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink-900 text-sm truncate">{item.title}</p>
                    <p className="text-xs text-ink-500 truncate">{item.sub}</p>
                  </div>
                  <StatusBadge status={item.status} />
                  <ChevronRight className="h-4 w-4 text-ink-300 shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick summary grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          title="Sell Requests"
          items={sells.slice(0, 3)}
          renderItem={(s: SellRequest) => (
            <div key={s.id} className="flex items-center justify-between py-2 border-b border-ink-100 last:border-0">
              <div className="min-w-0">
                <p className="font-semibold text-ink-900 text-sm truncate">{s.brand} {s.model}</p>
                <p className="text-xs text-ink-500">{new Date(s.created_at).toLocaleDateString('en-IN')}</p>
              </div>
              <StatusBadge status={s.status} />
            </div>
          )}
          cta={{ label: 'View All', onClick: () => onTabChange('sells') }}
          emptyTo="/sell"
          emptyLabel="Sell a Phone"
        />
        <SummaryCard
          title="Repairs"
          items={repairs.slice(0, 3)}
          renderItem={(r: RepairBooking) => (
            <div key={r.id} className="flex items-center justify-between py-2 border-b border-ink-100 last:border-0">
              <div className="min-w-0">
                <p className="font-semibold text-ink-900 text-sm truncate">{r.brand} {r.model}</p>
                <p className="text-xs text-ink-500 truncate">{r.problem}</p>
              </div>
              <StatusBadge status={r.status} />
            </div>
          )}
          cta={{ label: 'View All', onClick: () => onTabChange('repairs') }}
          emptyTo="/repair"
          emptyLabel="Book Repair"
        />
        <SummaryCard
          title="Orders"
          items={orders.slice(0, 3)}
          renderItem={(o: Order) => {
            const disp = dispatches.find((d) => d.order_id === o.id);
            return (
              <div key={o.id} className="flex items-center justify-between py-2 border-b border-ink-100 last:border-0">
                <div className="min-w-0">
                  <p className="font-semibold text-ink-900 text-sm">#{o.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-xs text-ink-500">{formatINR(o.total_amount)}</p>
                </div>
                <StatusBadge status={disp?.status ?? o.status} />
              </div>
            );
          }}
          cta={{ label: 'View All', onClick: () => onTabChange('orders') }}
          emptyTo="/buy"
          emptyLabel="Browse Phones"
        />
      </div>
    </div>
  );
}

function SummaryCard<T extends { id: string }>({
  title, items, renderItem, cta, emptyTo, emptyLabel,
}: {
  title: string; items: T[]; renderItem: (item: T) => React.ReactNode;
  cta: { label: string; onClick: () => void }; emptyTo: string; emptyLabel: string;
}) {
  return (
    <div className="card p-5 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-display font-bold text-ink-900 text-sm">{title}</h4>
        {items.length > 0 && (
          <button onClick={cta.onClick} className="text-xs text-brand-600 font-semibold hover:underline">
            {cta.label}
          </button>
        )}
      </div>
      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
          <Circle className="h-6 w-6 text-ink-300" />
          <p className="mt-2 text-xs text-ink-500">Nothing yet</p>
          <Link to={emptyTo} className="mt-3 text-xs font-semibold text-brand-600 hover:underline">
            {emptyLabel} →
          </Link>
        </div>
      ) : (
        <div className="flex-1">{items.map(renderItem)}</div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SELLS TAB
═══════════════════════════════════════════════════════════════ */
function SellsTab({ sells }: { sells: SellRequest[] }) {
  if (sells.length === 0) {
    return <EmptyState icon={BadgeIndianRupee} title="No sell requests yet" desc="Sell your old phone at the best price with free doorstep pickup anywhere in Lucknow." cta={{ to: '/sell', label: 'Sell Your Phone' }} />;
  }
  return (
    <div className="space-y-4">
      {sells.map((s) => <SellCard key={s.id} sell={s} />)}
    </div>
  );
}

function SellCard({ sell: s }: { sell: SellRequest }) {
  const isTerminal = ['completed', 'cancelled', 'rejected'].includes(s.status);
  return (
    <div className="card p-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-display font-bold text-ink-900">{s.brand} {s.model}</p>
            <StatusBadge status={s.status} />
          </div>
          <p className="mt-1 text-sm text-ink-500">{[s.ram, s.storage, s.condition].filter(Boolean).join(' · ')}</p>
          <p className="mt-1 text-xs text-ink-400">Submitted {new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-ink-500 mb-0.5">Estimated offer</p>
          <p className="font-display text-xl font-extrabold text-ink-900">
            {s.estimated_price ? formatINR(s.estimated_price) : '—'}
          </p>
          {s.final_price && (
            <p className="text-xs font-semibold text-nature-700 mt-0.5">
              Final: {formatINR(s.final_price)}
            </p>
          )}
        </div>
      </div>

      {/* Progress */}
      {!isTerminal && <ProgressTrack steps={SELL_STEPS} current={s.status} />}

      {/* Details grid */}
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <InfoRow icon={MapPin}    label="Pickup Address" value={s.pickup_address} />
        <InfoRow icon={Calendar}  label="Pickup Date"    value={s.pickup_date ? `${s.pickup_date} · ${s.pickup_slot ?? ''}` : null} />
        {s.accessories?.length > 0 && (
          <InfoRow icon={Boxes}   label="Accessories"    value={s.accessories.join(', ')} />
        )}
        {s.payout_method && (
          <InfoRow icon={Banknote} label="Payout Via"    value={s.payout_method} />
        )}
        {s.notes && (
          <div className="sm:col-span-2">
            <InfoRow icon={AlertCircle} label="Notes" value={s.notes} />
          </div>
        )}
      </div>

      {/* Diagnostics */}
      {s.diagnostics && Object.keys(s.diagnostics).some((k) => s.diagnostics![k as keyof typeof s.diagnostics] !== null) && (
        <div className="mt-3 rounded-xl bg-ink-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400 mb-2">Device Diagnostics</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(s.diagnostics).map(([key, val]) => {
              if (val === null || val === undefined) return null;
              const isOk = val === true || (typeof val === 'string' && Number(val) >= 80);
              return (
                <span key={key} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${isOk ? 'bg-nature-50 text-nature-700' : 'bg-accent-50 text-accent-700'}`}>
                  {isOk ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                  {key.replace(/_/g, ' ')}{key === 'battery_health' ? `: ${val}%` : ''}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Agent */}
      {s.pickup_person_name && (
        <AgentCard
          name={s.pickup_person_name}
          phone={s.pickup_person_phone}
          label="Pickup Agent"
          eta={s.estimated_arrival_time}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   REPAIRS TAB
═══════════════════════════════════════════════════════════════ */
function RepairsTab({ repairs }: { repairs: RepairBooking[] }) {
  if (repairs.length === 0) {
    return <EmptyState icon={Wrench} title="No repair bookings yet" desc="Book a doorstep repair — free pickup & drop anywhere in Lucknow." cta={{ to: '/repair', label: 'Book a Repair' }} />;
  }
  return (
    <div className="space-y-4">
      {repairs.map((r) => <RepairCard key={r.id} repair={r} />)}
    </div>
  );
}

function RepairCard({ repair: r }: { repair: RepairBooking }) {
  const isTerminal = ['completed', 'cancelled'].includes(r.status);
  return (
    <div className="card p-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-display font-bold text-ink-900">{r.brand} {r.model}</p>
            <StatusBadge status={r.status} />
          </div>
          <p className="mt-1 text-sm text-ink-500">{r.problem}</p>
          {r.problem_detail && <p className="mt-0.5 text-xs text-ink-400">{r.problem_detail}</p>}
        </div>
        <div className="text-right">
          <p className="text-xs text-ink-500 mb-0.5">Estimated cost</p>
          <p className="font-display text-xl font-extrabold text-ink-900">
            {r.estimated_cost ? formatINR(r.estimated_cost) : '—'}
          </p>
          {r.final_cost && (
            <p className="text-xs font-semibold text-nature-700 mt-0.5">
              Final: {formatINR(r.final_cost)}
            </p>
          )}
        </div>
      </div>

      {/* Tracking ID */}
      <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-brand-50 border border-brand-100 px-3 py-1.5">
        <Star className="h-3.5 w-3.5 text-brand-600" />
        <span className="text-xs text-ink-500">Tracking ID:</span>
        <span className="font-mono font-bold text-brand-700 text-sm">{r.tracking_id}</span>
      </div>

      {/* Progress */}
      {!isTerminal && <ProgressTrack steps={REPAIR_STEPS} current={r.status} />}

      {/* Details */}
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <InfoRow icon={MapPin}   label="Pickup Address" value={r.pickup_address} />
        <InfoRow icon={Calendar} label="Pickup Date"    value={r.pickup_date ? `${r.pickup_date} · ${r.pickup_slot ?? ''}` : null} />
        {r.technician_name && (
          <InfoRow icon={User} label="Technician" value={`${r.technician_name}${r.technician_phone ? ` · ${r.technician_phone}` : ''}`} accent />
        )}
      </div>

      {/* Agent */}
      {r.pickup_person_name && (
        <AgentCard
          name={r.pickup_person_name}
          phone={r.pickup_person_phone}
          label="Repair Technician"
          eta={r.estimated_arrival_time}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ORDERS TAB
═══════════════════════════════════════════════════════════════ */
function OrdersTab({ orders, dispatches }: { orders: Order[]; dispatches: Dispatch[] }) {
  if (orders.length === 0) {
    return <EmptyState icon={Package} title="No orders yet" desc="Browse certified refurbished phones with warranty." cta={{ to: '/buy', label: 'Browse Phones' }} />;
  }
  return (
    <div className="space-y-4">
      {orders.map((o) => {
        const disp = dispatches.find((d) => d.order_id === o.id);
        return <OrderCard key={o.id} order={o} dispatch={disp} />;
      })}
    </div>
  );
}

function OrderCard({ order: o, dispatch: disp }: { order: Order; dispatch?: Dispatch }) {
  const isTerminal = ['delivered', 'cancelled'].includes(o.status);
  const effectiveStatus = disp?.status ?? o.status;
  return (
    <div className="card p-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-display font-bold text-ink-900">Order #{o.id.slice(0, 8).toUpperCase()}</p>
            <StatusBadge status={effectiveStatus} />
          </div>
          <p className="mt-1 text-sm text-ink-500">
            {new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-xl font-extrabold text-ink-900">{formatINR(o.total_amount)}</p>
          <div className="flex items-center gap-1.5 justify-end mt-1">
            <CreditCard className="h-3 w-3 text-ink-400" />
            <span className="text-xs text-ink-500">{o.payment_method ?? 'COD'}</span>
            <span className={`text-xs font-semibold ${o.payment_status === 'paid' ? 'text-nature-600' : 'text-trail-600'}`}>
              · {o.payment_status}
            </span>
          </div>
        </div>
      </div>

      {/* Progress */}
      {!isTerminal && <ProgressTrack steps={ORDER_STEPS} current={effectiveStatus} />}

      {/* Delivery details */}
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <InfoRow icon={MapPin}   label="Delivery Address" value={o.delivery_address} />
        <InfoRow icon={User}     label="Deliver To"       value={o.delivery_name} />
        <InfoRow icon={Phone}    label="Contact"          value={o.delivery_phone} />
        {o.delivery_slot && (
          <InfoRow icon={Clock} label="Delivery Slot"    value={o.delivery_slot} />
        )}
        {o.tracking_id && (
          <InfoRow icon={Star} label="Tracking ID" value={o.tracking_id} accent />
        )}
      </div>

      {/* Dispatch info */}
      {disp && (
        <div className="mt-4 rounded-xl bg-brand-50 border border-brand-100 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-600 mb-2">Delivery Update</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-brand-700">
                <Truck className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-ink-900 text-sm">{disp.delivery_person_name}</p>
                <p className="text-xs text-ink-500 flex items-center gap-1">
                  <Phone className="h-3 w-3" /> {disp.delivery_person_phone}
                </p>
              </div>
            </div>
            <a href={`tel:${disp.delivery_person_phone}`} className="inline-flex items-center gap-1 rounded-lg border border-brand-200 bg-white px-2.5 py-1 text-[11px] font-bold text-brand-700 hover:bg-brand-50 transition-colors">
              <Phone className="h-3 w-3" /> Call
            </a>
          </div>
          {disp.notes && <p className="mt-2 text-xs text-ink-500 italic">"{disp.notes}"</p>}
          {disp.dispatched_at && (
            <p className="mt-1.5 text-[11px] text-ink-400">
              Dispatched: {new Date(disp.dispatched_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
          {disp.delivered_at && (
            <p className="text-[11px] text-nature-600 font-semibold">
              ✓ Delivered: {new Date(disp.delivered_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SHARED: EMPTY STATE
═══════════════════════════════════════════════════════════════ */
function EmptyState({ icon: Icon, title, desc, cta }: {
  icon: typeof Clock; title: string; desc: string; cta: { to: string; label: string };
}) {
  return (
    <div className="card p-12 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-ink-100 text-ink-400">
        <Icon className="h-7 w-7" />
      </div>
      <p className="mt-4 font-semibold text-ink-700">{title}</p>
      <p className="text-sm text-ink-500 mt-1">{desc}</p>
      <Link to={cta.to} className="mt-5 btn-primary text-sm inline-flex">
        {cta.label} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

// if user is admin then there is no dashboard like user and they can update everything in the website like add or remove phones and prices of everything like spare parts and mobile phone and assign pickup and delivery guy when they accept the order of user
