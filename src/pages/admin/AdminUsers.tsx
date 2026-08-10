import React, { useState } from 'react';
import { Users, Search, ShieldCheck, Store, UserCog, MapPin, PhoneCall, CheckCircle2 } from 'lucide-react';
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

  const filteredUsers = profiles.filter((u) => {
    const matchesSearch = `${u.full_name || ''} ${u.phone || ''} ${u.business_name || ''} ${u.role}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesRole = roleFilter === 'All' || u.role.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const selectedUser = profiles.find((u) => u.id === selectedUserId) || filteredUsers[0] || null;

  const userOrders = selectedUser ? orders.filter((o) => o.user_id === selectedUser.id) : [];
  const userSells = selectedUser ? sells.filter((s) => s.user_id === selectedUser.id) : [];
  const userRepairs = selectedUser ? repairs.filter((r) => r.user_id === selectedUser.id) : [];

  return (
    <div className="space-y-6">
      <div className="card p-6 rounded-[28px] bg-gradient-to-r from-indigo-500/10 via-brand-500/10 to-purple-500/10 border border-indigo-200/60 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-800">
            <Users className="h-3.5 w-3.5" /> Customer & Wholesaler Management
          </div>
          <h2 className="mt-2 font-display text-2xl font-black text-ink-900">User Accounts & RBAC Roles</h2>
          <p className="mt-1 text-xs text-ink-600">Assign admin/wholesaler privileges, verify wholesale businesses, and track user activity.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Users List */}
        <div className="lg:col-span-5 space-y-3">
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
                      <p className="font-bold text-sm text-ink-900">{u.full_name || 'Customer'}</p>
                      <span className="badge bg-brand-50 text-brand-700 text-[10px] uppercase font-bold">{u.role}</span>
                    </div>
                    <p className="text-xs text-ink-500 mt-1">{u.phone || 'No phone'}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: User Details & History */}
        <div className="lg:col-span-7 sticky top-6">
          {selectedUser ? (
            <div className="card p-6 md:p-8 rounded-[28px] space-y-6 shadow-sm border border-[#dce5e8] bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-ink-100">
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
                    <h2 className="font-display text-2xl font-black text-ink-900">
                      {selectedUser.full_name || 'Unnamed User'}
                    </h2>
                    <p className="text-xs text-ink-500 mt-0.5">
                      {selectedUser.phone || 'No phone number'} · Registered {new Date(selectedUser.created_at).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
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

              {/* User History Tabs */}
              <div className="space-y-4 text-xs">
                {/* Orders */}
                <div className="p-4 rounded-2xl bg-ink-50 space-y-2">
                  <h4 className="font-bold text-ink-900 flex items-center justify-between">
                    <span>Store Orders ({userOrders.length})</span>
                  </h4>
                  {userOrders.length === 0 ? (
                    <p className="text-ink-400">No orders placed yet.</p>
                  ) : (
                    userOrders.map((o) => (
                      <div key={o.id} className="flex items-center justify-between p-2 rounded-xl bg-white shadow-2xs">
                        <div>
                          <p className="font-bold text-ink-900">Order #{o.id.slice(0, 8)}</p>
                          <p className="text-ink-500">{formatINR(o.total_amount)}</p>
                        </div>
                        <span className={`badge text-[10px] ${statusColors[o.status] ?? 'bg-ink-100 text-ink-600'}`}>{o.status}</span>
                      </div>
                    ))
                  )}
                </div>

                {/* Sell Requests */}
                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-2">
                  <h4 className="font-bold text-amber-900">Sell Requests ({userSells.length})</h4>
                  {userSells.length === 0 ? (
                    <p className="text-ink-400">No sell requests created.</p>
                  ) : (
                    userSells.map((s) => (
                      <div key={s.id} className="flex items-center justify-between p-2 rounded-xl bg-white shadow-2xs">
                        <div>
                          <p className="font-bold text-ink-900">{s.brand} {s.model}</p>
                          <p className="text-emerald-700 font-bold">{formatINR(s.final_price || s.estimated_price || 0)}</p>
                        </div>
                        <span className={`badge text-[10px] ${statusColors[s.status] ?? 'bg-ink-100 text-ink-600'}`}>{s.status.replace('_', ' ')}</span>
                      </div>
                    ))
                  )}
                </div>

                {/* Repair Bookings */}
                <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200/60 space-y-2">
                  <h4 className="font-bold text-purple-900">Repair Bookings ({userRepairs.length})</h4>
                  {userRepairs.length === 0 ? (
                    <p className="text-ink-400">No repair bookings created.</p>
                  ) : (
                    userRepairs.map((r) => (
                      <div key={r.id} className="flex items-center justify-between p-2 rounded-xl bg-white shadow-2xs">
                        <div>
                          <p className="font-bold text-ink-900">{r.brand} {r.model}</p>
                          <p className="font-mono text-purple-700">{r.tracking_id}</p>
                        </div>
                        <span className={`badge text-[10px] ${statusColors[r.status] ?? 'bg-ink-100 text-ink-600'}`}>{r.status.replace('_', ' ')}</span>
                      </div>
                    ))
                  )}
                </div>
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
