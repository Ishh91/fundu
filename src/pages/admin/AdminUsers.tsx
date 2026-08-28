import { useState } from 'react';
import {
  Users,
  Search,
  ShieldCheck,
  Store,
  UserCog,
  MessageSquare,
  Trash2,
  Plus,
  X,
  Mail,
  CheckCircle2,
  Lock,
  Phone,
  AlertCircle,
  RefreshCw,
  Clock,
} from 'lucide-react';
import type { Order, SellRequest, RepairBooking } from './adminTypes';
import { db, formatINR } from '../../lib/db';
import CustomerDetailsModal from '../../components/CustomerDetailsModal';
import { sendEmailOtpCode } from '../../lib/freeNotifyService';

type UserProfile = {
  id: string;
  full_name: string | null;
  email?: string | null;
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
  const [userList, setUserList] = useState<UserProfile[]>(profiles);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [activityTab, setActivityTab] = useState<'all' | 'sells' | 'orders' | 'repairs'>('all');
  const [customerModalData, setCustomerModalData] = useState<any>(null);

  /* ── Add User Modal State ── */
  const [addUserModal, setAddUserModal] = useState(false);
  const [addUserForm, setAddUserForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'customer',
    password: 'User@123456',
  });
  const [addUserSubmitting, setAddUserSubmitting] = useState(false);
  const [addUserNotice, setAddUserNotice] = useState<string | null>(null);
  const [resendingEmailId, setResendingEmailId] = useState<string | null>(null);

  // Sync userList if parent profiles updates
  const activeProfiles = userList.length > 0 ? userList : profiles;

  const filteredUsers = activeProfiles.filter((u) => {
    const matchesSearch = `${u.full_name || ''} ${u.email || ''} ${u.phone || ''} ${u.business_name || ''} ${u.role} ${u.id}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesRole = roleFilter === 'All' || u.role.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const selectedUser = activeProfiles.find((u) => u.id === selectedUserId) || filteredUsers[0] || null;

  const userOrders = selectedUser ? orders.filter((o) => o.user_id === selectedUser.id) : [];
  const userSells = selectedUser ? sells.filter((s) => s.user_id === selectedUser.id) : [];
  const userRepairs = selectedUser ? repairs.filter((r) => r.user_id === selectedUser.id) : [];

  const totalSpent = userOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const totalPayouts = userSells.reduce((sum, s) => sum + (s.final_price || s.estimated_price || 0), 0);

  /* ── Handle Delete User ── */
  const handleDeleteUser = async (userId: string, name: string) => {
    if (!window.confirm(`⚠️ Are you sure you want to PERMANENTLY DELETE user "${name || 'Unnamed'}"? This action cannot be undone.`)) {
      return;
    }

    try {
      // 1. Delete from database
      const baseUrl = (import.meta.env.VITE_API_URL as string | undefined) || 'https://fundu.onrender.com/api';
      const targetUrl = `${baseUrl.replace(/\/$/, '')}/auth/delete-user`;

      await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      await db.from('profiles').delete().eq('id', userId);

      // 2. Update state
      setUserList((prev) => prev.filter((u) => u.id !== userId));
      alert(`✅ User "${name}" deleted successfully.`);
    } catch (err) {
      console.error('Delete user error:', err);
      alert('Failed to delete user. Please try again.');
    }
  };

  /* ── Handle Add User (Dispatches EmailJS OTP Verification) ── */
  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addUserForm.fullName || !addUserForm.email) {
      alert('Full Name and Email Address are required.');
      return;
    }

    setAddUserSubmitting(true);
    setAddUserNotice(null);

    const cleanEmail = addUserForm.email.trim().toLowerCase();
    const cleanPhone = addUserForm.phone.replace(/\D/g, '');
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      // 1. Create account on backend (is_verified: false until user enters Email OTP)
      const targetUrl =
        typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
          ? 'http://localhost:4000/api/auth/register'
          : 'https://fundu.onrender.com/api/auth/register';

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password: addUserForm.password || 'User@123456',
          fullName: addUserForm.fullName.trim(),
          phone: cleanPhone,
          role: addUserForm.role,
          is_verified: false,
        }),
      });

      const json = await response.json();
      if (json.error && !json.data) {
        throw new Error(json.error.message || json.error || 'Failed to create user');
      }

      // 2. Dispatch EmailJS Verification OTP to user/vendor email
      await sendEmailOtpCode(cleanEmail, generatedOtp, addUserForm.fullName.trim());

      const newUser: UserProfile = {
        id: json.data?.profile?.id || 'usr-' + Date.now(),
        full_name: addUserForm.fullName.trim(),
        email: cleanEmail,
        phone: cleanPhone || null,
        role: addUserForm.role,
        business_name: null,
        is_verified: false, // Requires email OTP verification
        created_at: new Date().toISOString(),
      };

      setUserList((prev) => [newUser, ...prev]);
      onSelectUser(newUser.id);
      setAddUserModal(false);
      alert(`🎉 User/Vendor "${addUserForm.fullName}" added successfully!\n📧 Verification Email OTP code sent to ${cleanEmail} via EmailJS. Please check email inbox.`);
    } catch (err: any) {
      console.error('Add user error:', err);
      alert(`⚠️ ${err?.message || 'Failed to add user.'}`);
    } finally {
      setAddUserSubmitting(false);
    }
  };

  /* ── Resend Email Verification OTP via EmailJS ── */
  const handleResendEmailVerification = async (user: UserProfile) => {
    if (!user.email && !user.phone) {
      alert('No email address associated with this account.');
      return;
    }

    const recipientEmail = user.email || `${user.phone}@fundu.in`;
    setResendingEmailId(user.id);

    try {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      await sendEmailOtpCode(recipientEmail, generatedOtp, user.full_name || 'User');
      alert(`📧 Verification Email OTP code sent to ${recipientEmail} via EmailJS! Please check inbox.`);
    } catch (err) {
      alert('Failed to resend email verification. Please check EmailJS settings.');
    } finally {
      setResendingEmailId(null);
    }
  };

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
            <Users className="h-3.5 w-3.5" /> User & Vendor Management
          </div>
          <h2 className="mt-2 font-display text-2xl font-black text-ink-900">Manage Accounts & Verification</h2>
          <p className="mt-1 text-xs text-ink-600">
            Add new users/vendors with EmailJS verification OTPs, manage roles, resend verification emails, or delete test accounts.
          </p>
        </div>

        {/* Add User / Vendor Action Button */}
        <button
          onClick={() => setAddUserModal(true)}
          className="btn-primary py-2.5 px-5 text-sm font-extrabold flex items-center gap-2 shadow-md hover:scale-[1.02] transition-transform"
        >
          <Plus className="h-4 w-4" /> Add New User / Vendor
        </button>
      </div>

      {addUserNotice && (
        <div className="alert-success flex items-center gap-2 p-3 text-sm rounded-xl">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> {addUserNotice}
        </div>
      )}

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
              {['All', 'Customer', 'Vendor', 'Wholesaler', 'Admin'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors ${
                    roleFilter === r ? 'bg-ink-900 text-white' : 'bg-ink-50 text-ink-600 hover:bg-ink-100'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Users List Cards */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredUsers.length === 0 ? (
              <div className="card p-6 text-center text-xs text-ink-400">No users found.</div>
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
                      <div className="flex items-center gap-1.5">
                        <span className="badge bg-brand-50 text-brand-700 text-[10px] uppercase font-bold">{u.role}</span>
                        {/* Delete Quick Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteUser(u.id, u.full_name || 'User');
                          }}
                          title="Delete User"
                          className="p-1 text-ink-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-ink-500">
                      <span>{u.phone || u.email || 'No contact'}</span>
                      <span className="font-bold text-brand-600">{totalReqs} Requests</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected User Details & Actions */}
        <div className="lg:col-span-8 sticky top-6">
          {selectedUser ? (
            <div className="card p-6 md:p-8 rounded-[28px] space-y-6 shadow-sm border border-[#dce5e8] bg-white">
              {/* User Header & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-ink-100">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl grid place-items-center ${
                      selectedUser.role === 'admin'
                        ? 'bg-brand-100 text-brand-700'
                        : selectedUser.role === 'vendor' || selectedUser.role === 'wholesaler'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-ink-100 text-ink-600'
                    }`}
                  >
                    {selectedUser.role === 'admin' ? (
                      <ShieldCheck className="h-7 w-7" />
                    ) : selectedUser.role === 'vendor' || selectedUser.role === 'wholesaler' ? (
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
                      {selectedUser.is_verified ? (
                        <span className="badge bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Email Verified
                        </span>
                      ) : (
                        <span className="badge bg-amber-100 text-amber-900 text-[10px] font-bold flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 text-amber-600" /> Verification Pending
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ink-500 mt-0.5 flex items-center gap-2 flex-wrap">
                      <span>{selectedUser.phone || selectedUser.email || 'No contact'}</span>
                      <span>•</span>
                      <span>Registered {new Date(selectedUser.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </p>
                  </div>
                </div>

                {/* Toolbar Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Resend Verification Email Button if unverified */}
                  {!selectedUser.is_verified && (
                    <button
                      onClick={() => handleResendEmailVerification(selectedUser)}
                      disabled={resendingEmailId === selectedUser.id}
                      className="btn-outline text-xs px-3 py-1.5 font-bold rounded-xl text-teal-800 border-teal-300 hover:bg-teal-50 flex items-center gap-1.5 shadow-xs"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 text-teal-600 ${resendingEmailId === selectedUser.id ? 'animate-spin' : ''}`} />
                      {resendingEmailId === selectedUser.id ? 'Sending Email…' : 'Resend Email Verification'}
                    </button>
                  )}

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
                    <option value="vendor">VENDOR</option>
                    <option value="wholesaler">WHOLESALER</option>
                    <option value="admin">ADMIN</option>
                  </select>

                  <button
                    onClick={() => onToggleVerification(selectedUser.id, selectedUser.is_verified)}
                    className={`btn text-xs px-3 py-1.5 font-bold rounded-xl ${
                      selectedUser.is_verified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {selectedUser.is_verified ? '✓ Verified' : 'Manually Verify'}
                  </button>

                  {/* DELETE USER BUTTON */}
                  <button
                    onClick={() => handleDeleteUser(selectedUser.id, selectedUser.full_name || 'User')}
                    className="btn bg-rose-600 text-white hover:bg-rose-700 text-xs px-3.5 py-1.5 font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete User
                  </button>
                </div>
              </div>

              {/* User Financial & Request Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100">
                  <p className="text-[10px] font-bold text-indigo-700 uppercase">Total Orders</p>
                  <p className="text-lg font-black text-indigo-950 mt-0.5">{userOrders.length}</p>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                  <p className="text-[10px] font-bold text-emerald-700 uppercase">Total Spent</p>
                  <p className="text-lg font-black text-emerald-950 mt-0.5">{formatINR(totalSpent)}</p>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-100">
                  <p className="text-[10px] font-bold text-amber-700 uppercase">Sell Requests</p>
                  <p className="text-lg font-black text-amber-950 mt-0.5">{userSells.length}</p>
                </div>
                <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-100">
                  <p className="text-[10px] font-bold text-purple-700 uppercase">Total Payouts</p>
                  <p className="text-lg font-black text-purple-950 mt-0.5">{formatINR(totalPayouts)}</p>
                </div>
              </div>

              {/* Activity Sub-Tabs & Detailed Request Lists */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b border-ink-100 pb-2">
                  <h3 className="font-display text-lg font-extrabold text-ink-900 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-brand-600" /> User Activity & Requests History
                  </h3>
                  <div className="flex items-center gap-1 bg-ink-50 p-1 rounded-xl">
                    {(['all', 'sells', 'orders', 'repairs'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActivityTab(tab)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-bold uppercase transition-colors ${
                          activityTab === tab ? 'bg-white text-ink-900 shadow-xs' : 'text-ink-500 hover:text-ink-900'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sell Requests Section */}
                {(activityTab === 'all' || activityTab === 'sells') && userSells.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase text-amber-800 tracking-wider">Device Sell Requests ({userSells.length})</h4>
                    <div className="space-y-2">
                      {userSells.map((s) => (
                        <div key={s.id} className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div>
                            <p className="font-bold text-ink-900 text-sm">{(s as any).device_name || `${s.brand} ${s.model}`}</p>
                            <p className="text-ink-500 mt-0.5">Condition: {s.condition} • Address: {s.pickup_address || 'Lucknow'}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-amber-900 text-sm">{formatINR(s.final_price || s.estimated_price || 0)}</p>
                            <span className="badge bg-amber-100 text-amber-900 text-[10px] font-bold uppercase mt-1">{s.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Orders Section */}
                {(activityTab === 'all' || activityTab === 'orders') && userOrders.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase text-indigo-800 tracking-wider">Store Orders ({userOrders.length})</h4>
                    <div className="space-y-2">
                      {userOrders.map((o) => (
                        <div key={o.id} className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-200/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div>
                            <p className="font-bold text-ink-900 text-sm">Order #{o.id.slice(0, 8).toUpperCase()}</p>
                            <p className="text-ink-500 mt-0.5">Payment: {o.payment_status || 'COD'} • Delivery: {o.delivery_address || 'Lucknow'}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-indigo-900 text-sm">{formatINR(o.total_amount || 0)}</p>
                            <span className="badge bg-indigo-100 text-indigo-900 text-[10px] font-bold uppercase mt-1">{o.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Repair Bookings Section */}
                {(activityTab === 'all' || activityTab === 'repairs') && userRepairs.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase text-purple-800 tracking-wider">Doorstep Repair Bookings ({userRepairs.length})</h4>
                    <div className="space-y-2">
                      {userRepairs.map((r) => (
                        <div key={r.id} className="p-4 rounded-2xl bg-purple-50/40 border border-purple-200/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div>
                            <p className="font-bold text-ink-900 text-sm">{r.device_model} ({r.issue_type || 'Repair'})</p>
                            <p className="text-ink-500 mt-0.5">Address: {r.address || 'Lucknow'}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-purple-900 text-sm">{formatINR(r.estimated_cost || 0)}</p>
                            <span className="badge bg-purple-100 text-purple-900 text-[10px] font-bold uppercase mt-1">{r.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {userSells.length === 0 && userOrders.length === 0 && userRepairs.length === 0 && (
                  <div className="p-8 text-center text-xs text-ink-400 border border-dashed border-ink-200 rounded-2xl">
                    No order, sell request, or doorstep repair history found for this user.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card p-12 text-center text-ink-400">Select a user from the list to view details.</div>
          )}
        </div>
      </div>

      {/* ── MODAL: ADD NEW USER / VENDOR ── */}
      {addUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="card max-w-md w-full p-6 md:p-8 space-y-4 animate-scale-up bg-white rounded-3xl">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
              <h3 className="font-display text-lg font-black text-ink-900 flex items-center gap-2">
                <Plus className="h-5 w-5 text-brand-600" /> Add New User / Vendor
              </h3>
              <button
                onClick={() => setAddUserModal(false)}
                className="p-1 rounded-full text-ink-400 hover:text-ink-900 hover:bg-ink-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="label">Full Name / Business Name *</label>
                <div className="flex rounded-xl border border-ink-200 overflow-hidden focus-within:border-brand-500 bg-white">
                  <div className="flex items-center border-r border-ink-200 bg-ink-50 px-3 text-ink-500">
                    <UserCog className="h-4 w-4 text-brand-500" />
                  </div>
                  <input
                    type="text"
                    required
                    value={addUserForm.fullName}
                    onChange={(e) => setAddUserForm({ ...addUserForm, fullName: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2.5 outline-none font-medium text-ink-900"
                  />
                </div>
              </div>

              <div>
                <label className="label">Email Address (Requires Email Verification) *</label>
                <div className="flex rounded-xl border border-ink-200 overflow-hidden focus-within:border-brand-500 bg-white">
                  <div className="flex items-center border-r border-ink-200 bg-ink-50 px-3 text-ink-500">
                    <Mail className="h-4 w-4 text-brand-500" />
                  </div>
                  <input
                    type="email"
                    required
                    value={addUserForm.email}
                    onChange={(e) => setAddUserForm({ ...addUserForm, email: e.target.value })}
                    placeholder="user@gmail.com"
                    className="w-full px-3 py-2.5 outline-none font-medium text-ink-900"
                  />
                </div>
              </div>

              <div>
                <label className="label">Mobile Number</label>
                <div className="flex rounded-xl border border-ink-200 overflow-hidden focus-within:border-brand-500 bg-white">
                  <div className="flex items-center border-r border-ink-200 bg-ink-50 px-3 text-ink-500">
                    <Phone className="h-4 w-4 text-brand-500" />
                  </div>
                  <input
                    type="tel"
                    value={addUserForm.phone}
                    onChange={(e) => setAddUserForm({ ...addUserForm, phone: e.target.value })}
                    placeholder="9876543210"
                    className="w-full px-3 py-2.5 outline-none font-medium text-ink-900"
                  />
                </div>
              </div>

              <div>
                <label className="label">Account Role</label>
                <select
                  value={addUserForm.role}
                  onChange={(e) => setAddUserForm({ ...addUserForm, role: e.target.value })}
                  className="input w-full font-bold text-xs py-2.5 bg-white"
                >
                  <option value="customer">CUSTOMER</option>
                  <option value="vendor">VENDOR PARTNER</option>
                  <option value="wholesaler">WHOLESALER</option>
                  <option value="delivery">DELIVERY AGENT</option>
                  <option value="admin">ADMIN</option>
                </select>
              </div>

              <div>
                <label className="label">Account Password</label>
                <div className="flex rounded-xl border border-ink-200 overflow-hidden focus-within:border-brand-500 bg-white">
                  <div className="flex items-center border-r border-ink-200 bg-ink-50 px-3 text-ink-500">
                    <Lock className="h-4 w-4 text-brand-500" />
                  </div>
                  <input
                    type="text"
                    required
                    value={addUserForm.password}
                    onChange={(e) => setAddUserForm({ ...addUserForm, password: e.target.value })}
                    placeholder="User@123456"
                    className="w-full px-3 py-2.5 outline-none font-medium text-ink-900"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-[11px] space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-teal-600" /> Email Verification OTP Dispatch
                </p>
                <p className="text-slate-600">
                  Submitting this form will create the account and send an <strong>Email Verification OTP via EmailJS</strong> to {addUserForm.email || 'the user email'}.
                </p>
              </div>

              <button
                type="submit"
                disabled={addUserSubmitting || !addUserForm.email || !addUserForm.fullName}
                className="btn-primary w-full py-3 font-bold text-sm mt-2"
              >
                {addUserSubmitting ? 'Creating & Sending OTP…' : 'Create & Send Email Verification'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Customer Inspection Details Modal */}
      {customerModalData && (
        <CustomerDetailsModal
          isOpen={!!customerModalData}
          customer={customerModalData}
          onClose={() => setCustomerModalData(null)}
        />
      )}
    </div>
  );
}
