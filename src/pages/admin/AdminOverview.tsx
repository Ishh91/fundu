import React from 'react';
import {
  TrendingUp,
  BadgeIndianRupee,
  Wrench,
  Store,
  Package,
  Truck,
  Smartphone,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import type { Order, SellRequest, RepairBooking, Product, DeliveryAgent, MasterPhone } from './adminTypes';
import { formatINR } from '../../lib/db';

type AdminOverviewProps = {
  orders: Order[];
  sells: SellRequest[];
  repairs: RepairBooking[];
  products: Product[];
  agents: DeliveryAgent[];
  masterPhones: MasterPhone[];
  onNavigateTab: (tab: any) => void;
};

export default function AdminOverview({
  orders,
  sells,
  repairs,
  products,
  agents,
  masterPhones,
  onNavigateTab,
}: AdminOverviewProps) {
  const totalSalesRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const pendingSellRequests = sells.filter((s) => s.status === 'pending' || s.status === 'assigned');
  const activeRepairs = repairs.filter((r) => r.status !== 'delivered' && r.status !== 'cancelled');

  const stats = [
    {
      label: 'Total Store Revenue (GMV)',
      value: formatINR(totalSalesRevenue),
      icon: TrendingUp,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      tab: 'orders',
    },
    {
      label: 'Pending Sell Requests',
      value: String(pendingSellRequests.length),
      icon: BadgeIndianRupee,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      tab: 'sells',
    },
    {
      label: 'Active Repair Bookings',
      value: String(activeRepairs.length),
      icon: Wrench,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      tab: 'repairs',
    },
    {
      label: 'Store Phones in Stock',
      value: String(products.reduce((sum, p) => sum + (p.stock || 0), 0)),
      icon: Store,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      tab: 'products',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((st) => {
          const Icon = st.icon;
          return (
            <div
              key={st.label}
              onClick={() => onNavigateTab(st.tab)}
              className={`card p-5 rounded-2xl cursor-pointer hover:shadow-md transition-all border ${st.color}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink-600">{st.label}</span>
                <div className="p-2 rounded-xl bg-white/80 shadow-2xs">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="font-display text-2xl font-black text-ink-900 mt-2">{st.value}</p>
              <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:underline">
                <span>View Details</span>
                <ArrowUpRight className="h-3 w-3" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Actionable Split Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sell Requests */}
        <div className="card p-6 rounded-[28px] bg-white border border-[#dce5e8] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-ink-100">
            <h3 className="font-display text-lg font-black text-ink-900 flex items-center gap-2">
              <BadgeIndianRupee className="h-5 w-5 text-amber-600" /> Recent Sell Inquiries (Lucknow)
            </h3>
            <button
              onClick={() => onNavigateTab('sells')}
              className="text-xs font-bold text-brand-600 hover:underline"
            >
              View All ({sells.length})
            </button>
          </div>

          <div className="space-y-2">
            {sells.slice(0, 5).map((s) => (
              <div
                key={s.id}
                onClick={() => onNavigateTab('sells')}
                className="p-3 rounded-2xl bg-ink-50 hover:bg-ink-100/80 cursor-pointer transition flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-ink-900">
                    {s.brand} {s.model}
                  </p>
                  <p className="text-ink-500 font-medium">
                    {s.pickup_area || 'Lucknow'} · {s.condition}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-black text-emerald-700">
                    {formatINR(s.final_price || s.estimated_price || 0)}
                  </span>
                  <p className="text-[10px] text-ink-400 capitalize">{s.status.replace('_', ' ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Repair Bookings */}
        <div className="card p-6 rounded-[28px] bg-white border border-[#dce5e8] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-ink-100">
            <h3 className="font-display text-lg font-black text-ink-900 flex items-center gap-2">
              <Wrench className="h-5 w-5 text-purple-600" /> Active Repair Tickets
            </h3>
            <button
              onClick={() => onNavigateTab('repairs')}
              className="text-xs font-bold text-brand-600 hover:underline"
            >
              View All ({repairs.length})
            </button>
          </div>

          <div className="space-y-2">
            {repairs.slice(0, 5).map((r) => (
              <div
                key={r.id}
                onClick={() => onNavigateTab('repairs')}
                className="p-3 rounded-2xl bg-ink-50 hover:bg-ink-100/80 cursor-pointer transition flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-purple-700 font-bold">{r.tracking_id}</span>
                  </div>
                  <p className="font-bold text-ink-900 mt-0.5">
                    {r.brand} {r.model}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-black text-emerald-700">
                    {formatINR(r.final_cost || r.estimated_cost || 0)}
                  </span>
                  <p className="text-[10px] text-ink-400 capitalize">{r.status.replace('_', ' ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
