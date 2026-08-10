import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Smartphone, BadgeIndianRupee, Wrench, Package,
  Truck, Clock, LogOut, User, Phone,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, formatINR } from '../lib/db';
import type { SellRequest, RepairBooking, Order, Dispatch } from '../types';

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
};

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
    return <div className="container-page py-20 text-center text-ink-500">Loading...</div>;
  }

  const stats = [
    { icon: BadgeIndianRupee, label: 'Sell Requests', value: sells.length, bg: 'bg-accent-50 text-accent-600' },
    { icon: Wrench, label: 'Repair Bookings', value: repairs.length, bg: 'bg-brand-50 text-brand-600' },
    { icon: Package, label: 'Orders', value: orders.length, bg: 'bg-nature-50 text-nature-600' },
  ];

  return (
    <div className="container-page py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-100 text-brand-700">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-extrabold text-ink-900">Hi, {profile?.full_name || user.email?.split('@')[0]} 👋</h1>
            <p className="text-sm text-ink-500">Manage your activity on Fundu</p>
          </div>
        </div>
        <button onClick={() => { signOut(); navigate('/'); }} className="btn-outline text-sm">
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="card p-5 flex items-center gap-4">
            <div className={`grid h-12 w-12 place-items-center rounded-xl ${s.bg}`}>
              <s.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="font-display text-2xl font-extrabold text-ink-900">{s.value}</p>
              <p className="text-sm text-ink-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-1 border-b border-ink-100 overflow-x-auto scrollbar-hide">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'sells', label: 'Sell Requests', icon: BadgeIndianRupee },
          { id: 'repairs', label: 'Repairs', icon: Wrench },
          { id: 'orders', label: 'Orders', icon: Package },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as typeof tab)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
              tab === t.id ? 'border-brand-600 text-brand-700' : 'border-transparent text-ink-500 hover:text-ink-800'
            }`}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {dataLoading ? (
          <div className="card p-12 text-center text-ink-500">Loading your data...</div>
        ) : tab === 'overview' ? (
          <div className="grid gap-5 md:grid-cols-2">
            <div className="card p-6">
              <h3 className="font-display font-bold text-ink-900">Recent Sell Requests</h3>
              {sells.length === 0 ? (
                <p className="mt-3 text-sm text-ink-500">No sell requests yet. <Link to="/sell" className="text-brand-600 font-semibold">Sell a phone →</Link></p>
              ) : (
                <div className="mt-3 space-y-2">
                  {sells.slice(0, 3).map((s) => (
                    <div key={s.id} className="flex items-center justify-between rounded-lg bg-ink-50 p-3">
                      <div>
                        <p className="font-semibold text-ink-900 text-sm">{s.brand} {s.model}</p>
                        <p className="text-xs text-ink-500">{new Date(s.created_at).toLocaleDateString('en-IN')}</p>
                      </div>
                      <span className={`badge ${statusColors[s.status] ?? 'bg-ink-100 text-ink-600'}`}>{s.status.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="card p-6">
              <h3 className="font-display font-bold text-ink-900">Recent Repairs</h3>
              {repairs.length === 0 ? (
                <p className="mt-3 text-sm text-ink-500">No repairs yet. <Link to="/repair" className="text-brand-600 font-semibold">Book a repair →</Link></p>
              ) : (
                <div className="mt-3 space-y-2">
                  {repairs.slice(0, 3).map((r) => (
                    <div key={r.id} className="flex items-center justify-between rounded-lg bg-ink-50 p-3">
                      <div>
                        <p className="font-semibold text-ink-900 text-sm">{r.brand} {r.model}</p>
                        <p className="text-xs text-ink-500">{r.tracking_id} · {r.problem}</p>
                      </div>
                      <span className={`badge ${statusColors[r.status] ?? 'bg-ink-100 text-ink-600'}`}>{r.status.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : tab === 'sells' ? (
          <div className="space-y-3">
            {sells.length === 0 ? (
              <EmptyState icon={BadgeIndianRupee} title="No sell requests" desc="Sell your old phone for the best price with free pickup." cta={{ to: '/sell', label: 'Sell Your Phone' }} />
            ) : sells.map((s) => (
              <div key={s.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display font-bold text-ink-900">{s.brand} {s.model}</p>
                    <p className="text-sm text-ink-500">{s.ram} · {s.storage} · {s.condition}</p>
                    <p className="mt-1 text-xs text-ink-400">Submitted {new Date(s.created_at).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-ink-500">Est. offer</p>
                    <p className="font-display text-lg font-extrabold text-ink-900">{s.estimated_price ? formatINR(s.estimated_price) : '—'}</p>
                    <span className={`mt-1 badge ${statusColors[s.status] ?? 'bg-ink-100 text-ink-600'}`}>{s.status.replace('_', ' ')}</span>
                  </div>
                </div>
                {s.pickup_address && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-ink-50 p-3 text-sm text-ink-600">
                    <Truck className="h-4 w-4 text-brand-600" />
                    <span>{s.pickup_address}</span>
                    {s.pickup_date && <span className="text-ink-400">· {s.pickup_date} · {s.pickup_slot}</span>}
                  </div>
                )}
                {s.pickup_person_name && (
                  <div className="mt-2.5 flex items-center justify-between rounded-lg bg-emerald-50/60 p-2.5 border border-emerald-100 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-100 text-emerald-700 font-bold">
                        {s.pickup_person_name[0]}
                      </span>
                      <div>
                        <p className="font-bold text-ink-900">Pickup Agent: {s.pickup_person_name}</p>
                        <p className="text-ink-500 text-[11px]">{s.estimated_arrival_time || 'Assigned for doorstep visit'}</p>
                      </div>
                    </div>
                    {s.pickup_person_phone && (
                      <a href={`tel:${s.pickup_person_phone}`} className="btn-outline text-[11px] px-2.5 py-1 bg-white font-bold text-emerald-700">
                        <Phone className="h-3 w-3 inline mr-1" /> Call
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : tab === 'repairs' ? (
          <div className="space-y-3">
            {repairs.length === 0 ? (
              <EmptyState icon={Wrench} title="No repair bookings" desc="Book a doorstep repair — free pickup & drop in Lucknow." cta={{ to: '/repair', label: 'Book a Repair' }} />
            ) : repairs.map((r) => (
              <div key={r.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display font-bold text-ink-900">{r.brand} {r.model}</p>
                    <p className="text-sm text-ink-500">{r.problem}</p>
                    {r.problem_detail && <p className="mt-1 text-xs text-ink-400">{r.problem_detail}</p>}
                    <p className="mt-1 text-xs text-ink-400">Tracking: <span className="font-mono font-semibold text-brand-700">{r.tracking_id}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-ink-500">Est. cost</p>
                    <p className="font-display text-lg font-extrabold text-ink-900">{r.estimated_cost ? formatINR(r.estimated_cost) : '—'}</p>
                    <span className={`mt-1 badge ${statusColors[r.status] ?? 'bg-ink-100 text-ink-600'}`}>{r.status.replace('_', ' ')}</span>
                  </div>
                </div>
                {r.pickup_address && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-ink-50 p-3 text-sm text-ink-600">
                    <Truck className="h-4 w-4 text-brand-600" />
                    <span>{r.pickup_address}</span>
                    {r.pickup_date && <span className="text-ink-400">· {r.pickup_date} · {r.pickup_slot}</span>}
                  </div>
                )}
                {r.pickup_person_name && (
                  <div className="mt-2.5 flex items-center justify-between rounded-lg bg-emerald-50/60 p-2.5 border border-emerald-100 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-100 text-emerald-700 font-bold">
                        {r.pickup_person_name[0]}
                      </span>
                      <div>
                        <p className="font-bold text-ink-900">Repair Technician: {r.pickup_person_name}</p>
                        <p className="text-ink-500 text-[11px]">{r.estimated_arrival_time || 'Doorstep service booked'}</p>
                      </div>
                    </div>
                    {r.pickup_person_phone && (
                      <a href={`tel:${r.pickup_person_phone}`} className="btn-outline text-[11px] px-2.5 py-1 bg-white font-bold text-emerald-700">
                        <Phone className="h-3 w-3 inline mr-1" /> Call
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {orders.length === 0 ? (
              <EmptyState icon={Package} title="No orders yet" desc="Browse refurbished phones with warranty." cta={{ to: '/buy', label: 'Browse Phones' }} />
            ) : orders.map((o) => {
              const disp = dispatches.find((d) => d.order_id === o.id);
              return (
                <div key={o.id} className="card p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-display font-bold text-ink-900">Order #{o.id.slice(0, 8)}</p>
                      <p className="text-sm text-ink-500">{new Date(o.created_at).toLocaleDateString('en-IN')} · {o.payment_method ?? 'COD'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-lg font-extrabold text-ink-900">{formatINR(o.total_amount)}</p>
                      <span className={`badge ${statusColors[o.status] ?? 'bg-ink-100 text-ink-600'}`}>{o.status}</span>
                    </div>
                  </div>
                  {disp && (
                    <div className="mt-4 rounded-lg bg-brand-50/60 p-4 border border-brand-100">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-brand-700">
                          <Truck className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-ink-900 text-sm">{disp.delivery_person_name}</p>
                          <p className="text-xs text-ink-500 flex items-center gap-1"><Phone className="h-3 w-3" /> {disp.delivery_person_phone}</p>
                        </div>
                        <span className={`ml-auto badge ${disp.status === 'delivered' ? 'bg-nature-50 text-nature-700' : disp.status === 'returned' ? 'bg-accent-50 text-accent-700' : 'bg-weather-50 text-weather-700'}`}>{disp.status.replace('_', ' ')}</span>
                      </div>
                      {disp.notes && <p className="mt-2 text-xs text-ink-500">{disp.notes}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="mt-10 grid gap-3 sm:grid-cols-3">
        <Link to="/buy" className="card p-4 flex items-center gap-3 hover:border-brand-400 transition-colors">
          <Smartphone className="h-5 w-5 text-brand-600" /> <span className="font-semibold text-ink-900 text-sm">Buy a Phone</span>
        </Link>
        <Link to="/sell" className="card p-4 flex items-center gap-3 hover:border-brand-400 transition-colors">
          <BadgeIndianRupee className="h-5 w-5 text-accent-600" /> <span className="font-semibold text-ink-900 text-sm">Sell a Phone</span>
        </Link>
        <Link to="/repair" className="card p-4 flex items-center gap-3 hover:border-brand-400 transition-colors">
          <Wrench className="h-5 w-5 text-nature-600" /> <span className="font-semibold text-ink-900 text-sm">Book Repair</span>
        </Link>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, desc, cta }: { icon: typeof Clock; title: string; desc: string; cta: { to: string; label: string } }) {
  return (
    <div className="card p-12 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-ink-100 text-ink-400"><Icon className="h-7 w-7" /></div>
      <p className="mt-4 font-semibold text-ink-700">{title}</p>
      <p className="text-sm text-ink-500">{desc}</p>
      <Link to={cta.to} className="mt-5 btn-primary text-sm">{cta.label}</Link>
    </div>
  );
}
// if user is admin then there is no dashboard like user and they can update everything in the website like add or remove phones and prices of everything like spare parts and mobile phone and assign pickup and delivery guy when they accept the order of user
