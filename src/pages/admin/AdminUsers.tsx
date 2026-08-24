import { useState } from 'react';
import {
  Users,
  Search,
  ShieldCheck,
  Store,
  UserCog,
  MapPin,
  PhoneCall,
  MessageSquare,
  Package,
  BadgeIndianRupee,
  Wrench,
  Clock,
  ExternalLink,
  Shield,
  Calendar,
  CreditCard,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import type { Order, SellRequest, RepairBooking } from './adminTypes';
import { statusColors } from './adminTypes';
import { formatINR } from '../../lib/db';

type UserProfile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  business_name: string | null;
  is_verified: boolean;
  created_at: string;
};

type AdminUsersProps = {
  profiles: UserProfile[];
  selectedUserId: string | null;
  onSelectUser: (id: string) => void;
  orders: Order[];
  sells: SellRequest[];
  repairs: RepairBooking[];
  onUpdateRole: (userId: string, role: string) => void;
  onToggleVerification: (userId: string, current: boolean) => void;
};

export default function AdminUsers({
  profiles,
  selectedUserId,
  onSelectUser,
  orders,
  sells,
  repairs,
  onUpdateRole,
  onToggleVerification,
}: AdminUsersProps) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [activityTab, setActivityTab] = useState<'all' | 'sells' | 'orders' | 'repairs'>('all');

  const filteredUsers = profiles.filter((u) => {
    const matchesSearch = `${u.full_name || ''} ${u.phone || ''} ${u.business_name || ''} ${u.role} ${u.id}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesRole = roleFilter === 'All' || u.role.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const selectedUser = profiles.find((u) => u.id === selectedUserId) || filteredUsers[0] || null;

  const userOrders = selectedUser ? orders.filter((o) => o.user_id === selectedUser.id) : [];
  const userSells = selectedUser ? sells.filter((s) => s.user_id === selectedUser.id) : [];
  const userRepairs = selectedUser ? repairs.filter((r) => r.user_id === selectedUser.id) : [];

  const totalSpent = userOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const totalPayouts = userSells.reduce((sum, s) => sum + (s.final_price || s.estimated_price || 0), 0);

  const getWhatsAppUserLink = (user: UserProfile) => {
    const phone = (user.phone || '9839122345').replace(/\D/g, '');
    const targetPhone = phone.length === 10 ? `91${phone}` : phone;
    const text = `Hi ${user.full_name || 'Customer'}, greetings from Fundu Lucknow Central Desk! How can we assist you today?`;
    return `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="card p-6 rounded-[28px] bg-gradient-to-r from-indigo-500/10 via-brand-500/10 to-purple-500/10 border border-indigo-200/60 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-800">
            <Users className="h-3.5 w-3.5" /> Customer & Wholesaler Management
          </div>
          <h2 className="mt-2 font-display text-2xl font-black text-ink-900">User Profiles & Activity History</h2>
          <p className="mt-1 text-xs text-ink-600">
            View full customer request history, device quotations, inspection details, orders, and manage Lucknow accounts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Users List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="card p-3 rounded-2xl bg-white shadow-xs space-y-2">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-ink-400 shrink-0 ml-1" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search user by name, phone..."
                className="w-full text-xs bg-transparent border-none focus:outline-none text-ink-900 font-medium"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide py-1 border-t border-ink-100/60">
              {['All', 'Customer', 'Wholesaler', 'Admin'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold shrink-0 transition ${
                    roleFilter.toLowerCase() === r.toLowerCase()
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-ink-50 text-ink-600 hover:bg-ink-100'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
            {filteredUsers.length === 0 ? (
              <div className="card p-8 text-center bg-white">
                <Users className="h-8 w-8 text-ink-300 mx-auto" />
                <p className="text-xs font-bold text-ink-700 mt-2">No users found</p>
              </div>
            ) : (
              filteredUsers.map((u) => {
                const isSelected = selectedUser?.id === u.id;
                const totalReqs =
                  orders.filter((o) => o.user_id === u.id).length +
                  sells.filter((s) => s.user_id === u.id).length +
                  repairs.filter((r) => r.user_id === u.id).length;

                return (
                  <div
                    key={u.id}
                    onClick={() => onSelectUser(u.id)}
                    className={`card p-4 rounded-2xl cursor-pointer transition-all ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/60 shadow-md ring-2 ring-brand-500/20'
                        : 'bg-white hover:border-brand-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-sm text-ink-900 truncate">{u.full_name || 'Customer'}</p>
                      <span className="badge bg-brand-50 text-brand-700 text-[10px] uppercase font-bold">{u.role}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-ink-500">
                      <span>{u.phone || 'No phone'}</span>
                      <span className="font-bold text-brand-600">{totalReqs} Requests</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: User Details & History */}
        <div className="lg:col-span-8 sticky top-6">
          {selectedUser ? (
            <div className="card p-6 md:p-8 rounded-[28px] space-y-6 shadow-sm border border-[#dce5e8] bg-white">
              {/* User Header & Quick Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-ink-100">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl grid place-items-center ${
                      selectedUser.role === 'admin'
                        ? 'bg-brand-100 text-brand-700'
                        : selectedUser.role === 'wholesaler'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-ink-100 text-ink-600'
                    }`}
                  >
                    {selectedUser.role === 'admin' ? (
                      <ShieldCheck className="h-7 w-7" />
                    ) : selectedUser.role === 'wholesaler' ? (
                      <Store className="h-7 w-7" />
                    ) : (
                      <UserCog className="h-7 w-7" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-display text-2xl font-black text-ink-900">
                        {selectedUser.full_name || 'Unnamed User'}
                      </h2>
                      {selectedUser.is_verified && (
                        <span className="badge bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ink-500 mt-0.5 flex items-center gap-2 flex-wrap">
                      <span>{selectedUser.phone || 'No phone number'}</span>
                      <span>•</span>
                      <span>Registered {new Date(selectedUser.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={getWhatsAppUserLink(selectedUser)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn bg-[#25D366] text-white hover:bg-[#20bd5a] text-xs px-3.5 py-1.5 font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
                  >
                    <MessageSquare className="h-3.5 w-3.5" /> WhatsApp User
                  </a>

                  <select
                    value={selectedUser.role}
                    onChange={(e) => onUpdateRole(selectedUser.id, e.target.value)}
                    className="input text-xs py-1.5 px-3 bg-white font-bold"
                  >
                    <option value="customer">CUSTOMER</option>
                    <option value="wholesaler">WHOLESALER</option>
                    <option value="admin">ADMIN</option>
                  </select>

                  <button
                    onClick={() => onToggleVerification(selectedUser.id, selectedUser.is_verified)}
                    className={`btn text-xs px-3 py-1.5 font-bold rounded-xl ${
                      selectedUser.is_verified ? 'bg-emerald-100 text-emerald-800' : 'bg-ink-100 text-ink-700'
                    }`}
                  >
                    {selectedUser.is_verified ? '✓ Verified Partner' : 'Verify Partner'}
                  </button>
                </div>
              </div>

              {/* Lifetime Activity Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-brand-50 border border-brand-100">
                  <p className="text-ink-500 font-bold uppercase text-[10px]">Store Orders</p>
                  <p className="font-display text-lg font-black text-brand-700 mt-0.5">{userOrders.length}</p>
                  <p className="text-[11px] text-ink-500 font-medium">Spent: {formatINR(totalSpent)}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-100">
                  <p className="text-amber-700 font-bold uppercase text-[10px]">Sell Requests</p>
                  <p className="font-display text-lg font-black text-amber-800 mt-0.5">{userSells.length}</p>
                  <p className="text-[11px] text-amber-700 font-medium">Payout: {formatINR(totalPayouts)}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-100">
                  <p className="text-purple-700 font-bold uppercase text-[10px]">Repairs Booked</p>
                  <p className="font-display text-lg font-black text-purple-800 mt-0.5">{userRepairs.length}</p>
                  <p className="text-[11px] text-purple-700 font-medium">Lucknow Doorstep</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <p className="text-emerald-700 font-bold uppercase text-[10px]">Total Activity</p>
                  <p className="font-display text-lg font-black text-emerald-800 mt-0.5">
                    {userOrders.length + userSells.length + userRepairs.length}
                  </p>
                  <p className="text-[11px] text-emerald-700 font-medium">Lifetime Requests</p>
                </div>
              </div>

              {/* Activity Request Filter Tabs */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-ink-100 pb-2">
                  <div className="flex items-center gap-2">
                    {[
                      { id: 'all', label: `All Requests (${userOrders.length + userSells.length + userRepairs.length})` },
                      { id: 'sells', label: `📱 Sells (${userSells.length})` },
                      { id: 'orders', label: `🛍️ Orders (${userOrders.length})` },
                      { id: 'repairs', label: `🔧 Repairs (${userRepairs.length})` },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setActivityTab(t.id as any)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                          activityTab === t.id
                            ? 'bg-brand-600 text-white shadow-xs'
                            : 'bg-ink-50 text-ink-600 hover:bg-ink-100'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sell Requests Detailed Section */}
                {(activityTab === 'all' || activityTab === 'sells') && userSells.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                      <BadgeIndianRupee className="h-3.5 w-3.5 text-amber-600" /> Phone Sell Requests ({userSells.length})
                    </h4>
                    <div className="space-y-2.5">
                      {userSells.map((s) => (
                        <div
                          key={s.id}
                          className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/70 text-xs space-y-2"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-ink-900 text-sm">{s.brand} {s.model}</span>
                                <span className="badge bg-amber-100 text-amber-800 text-[10px] font-bold">
                                  {s.storage || '128GB'} · {s.condition}
                                </span>
                              </div>
                              <p className="text-[11px] text-ink-500 mt-0.5">
                                Placed on {new Date(s.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`badge text-[10px] ${statusColors[s.status] ?? 'bg-ink-100 text-ink-600'}`}>
                                {s.status.replace('_', ' ').toUpperCase()}
                              </span>
                              <p className="font-black text-emerald-700 text-sm mt-1">
                                Payout: {formatINR(s.final_price || s.estimated_price || 0)}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-amber-200/50 text-[11px]">
                            <div>
                              <p className="text-ink-500 font-medium">Lucknow Pickup Address:</p>
                              <p className="font-bold text-ink-900 flex items-center gap-1 mt-0.5">
                                <MapPin className="h-3 w-3 text-brand-600 shrink-0" /> {s.pickup_address || s.pickup_area || 'Lucknow'}
                              </p>
                              <p className="text-ink-400 mt-0.5">Slot: {s.pickup_date} ({s.pickup_slot})</p>
                            </div>

                            <div>
                              <p className="text-ink-500 font-medium">Assigned Executive:</p>
                              <p className="font-bold text-ink-900 mt-0.5 flex items-center gap-1">
                                <Truck className="h-3 w-3 text-brand-600" /> {s.pickup_person_name || 'Pending assignment'}
                              </p>
                              {s.imei && <p className="text-emerald-700 font-mono mt-0.5">IMEI: {s.imei}</p>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Store Orders Detailed Section */}
                {(activityTab === 'all' || activityTab === 'orders') && userOrders.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-brand-800 flex items-center gap-1.5">
                      <Package className="h-3.5 w-3.5 text-brand-600" /> Store Refurbished Orders ({userOrders.length})
                    </h4>
                    <div className="space-y-2.5">
                      {userOrders.map((o) => (
                        <div
                          key={o.id}
                          className="p-4 rounded-2xl bg-brand-50/40 border border-brand-200/70 text-xs space-y-2"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-ink-900 text-sm">Order #{o.id.slice(0, 8).toUpperCase()}</span>
                                <span className="badge bg-brand-100 text-brand-800 text-[10px] font-bold">
                                  {o.payment_method || 'COD'}
                                </span>
                              </div>
                              <p className="text-[11px] text-ink-500 mt-0.5">
                                Placed on {new Date(o.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`badge text-[10px] ${statusColors[o.status] ?? 'bg-ink-100 text-ink-600'}`}>
                                {o.status.toUpperCase()}
                              </span>
                              <p className="font-black text-brand-700 text-sm mt-1">
                                Total: {formatINR(o.total_amount || 0)}
                              </p>
                            </div>
                          </div>

                          {/* Items */}
                          {o.items && o.items.length > 0 && (
                            <div className="py-1 space-y-1">
                              {o.items.map((it: any, idx: number) => (
                                <p key={idx} className="text-[11px] text-ink-700 font-medium">
                                  • {it.title} (Qty: {it.quantity || 1}) - <span className="font-bold text-brand-700">{formatINR(it.price || 0)}</span>
                                </p>
                              ))}
                            </div>
                          )}

                          <div className="pt-2 border-t border-brand-200/50 text-[11px]">
                            <p className="text-ink-500 font-medium">Delivery Address:</p>
                            <p className="font-bold text-ink-900 flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3 text-brand-600 shrink-0" /> {o.delivery_address || 'Lucknow'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Repair Bookings Detailed Section */}
                {(activityTab === 'all' || activityTab === 'repairs') && userRepairs.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-purple-800 flex items-center gap-1.5">
                      <Wrench className="h-3.5 w-3.5 text-purple-600" /> Doorstep Repair Bookings ({userRepairs.length})
                    </h4>
                    <div className="space-y-2.5">
                      {userRepairs.map((r) => (
                        <div
                          key={r.id}
                          className="p-4 rounded-2xl bg-purple-50/40 border border-purple-200/70 text-xs space-y-2"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-ink-900 text-sm">{r.brand} {r.model}</span>
                                <span className="font-mono text-[10px] text-purple-700 font-bold bg-purple-100 px-1.5 py-0.5 rounded">
                                  {r.tracking_id}
                                </span>
                              </div>
                              <p className="text-[11px] text-ink-500 mt-0.5">
                                Problem: <span className="font-semibold text-ink-800">{r.problem}</span>
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`badge text-[10px] ${statusColors[r.status] ?? 'bg-ink-100 text-ink-600'}`}>
                                {r.status.replace('_', ' ').toUpperCase()}
                              </span>
                              <p className="font-black text-purple-700 text-sm mt-1">
                                Cost: {formatINR(r.final_cost || r.estimated_cost || 0)}
                              </p>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-purple-200/50 text-[11px]">
                            <p className="text-ink-500 font-medium">Pickup & Service Address:</p>
                            <p className="font-bold text-ink-900 flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3 text-purple-600 shrink-0" /> {r.pickup_address || 'Lucknow'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State when no activity found */}
                {userOrders.length === 0 && userSells.length === 0 && userRepairs.length === 0 && (
                  <div className="p-8 text-center bg-ink-50 rounded-2xl">
                    <Clock className="h-8 w-8 text-ink-300 mx-auto" />
                    <p className="text-xs font-bold text-ink-700 mt-2">No activity requests placed by this user yet</p>
                    <p className="text-[11px] text-ink-400 mt-0.5">
                      New sell requests, repair bookings, and store orders will appear here in real-time.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card p-12 text-center bg-white rounded-[28px] border border-[#dce5e8]">
              <Users className="h-12 w-12 text-ink-300 mx-auto" />
              <h3 className="font-display text-lg font-bold text-ink-900 mt-3">No User Selected</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
