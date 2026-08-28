import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Smartphone,
  BadgeIndianRupee,
  Wrench,
  Package,
  TrendingUp,
  Users,
  Store,
  Truck,
  X,
  MessageSquare,
  MapPin,
  ExternalLink,
  Image as ImageIcon,
  Building2,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { AdminTab } from './adminTypes';

type AdminSidebarProps = {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  counts: {
    sells: number;
    repairs: number;
    orders: number;
    catalog: number;
    products: number;
    agents: number;
  };
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

export default function AdminSidebar({
  activeTab,
  onSelectTab,
  counts,
  mobileOpen,
  onCloseMobile,
}: AdminSidebarProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [navFilter, setNavFilter] = React.useState('');

  const menuGroups = [
    {
      title: 'OPERATIONS & ORDERS',
      items: [
        { id: 'overview' as AdminTab, label: 'Dashboard Overview', icon: LayoutDashboard, path: '/admin' },
        {
          id: 'orders' as AdminTab,
          label: 'Customer Orders',
          icon: Package,
          badge: counts.orders > 0 ? String(counts.orders) : undefined,
          badgeColor: 'bg-blue-600 text-white',
          path: '/admin/orders',
        },
        {
          id: 'repairs' as AdminTab,
          label: 'Repair Bookings',
          icon: Wrench,
          badge: counts.repairs > 0 ? String(counts.repairs) : undefined,
          badgeColor: 'bg-purple-500 text-white',
          path: '/admin/repairs',
        },
        {
          id: 'sells' as AdminTab,
          label: 'Sell Requests',
          icon: BadgeIndianRupee,
          badge: counts.sells > 0 ? String(counts.sells) : undefined,
          badgeColor: 'bg-amber-500 text-white',
          path: '/admin/sells',
        },
      ],
    },
    {
      title: 'PRODUCTS & CATALOG',
      items: [
        {
          id: 'products' as AdminTab,
          label: 'Store Inventory',
          icon: Store,
          badge: counts.products > 0 ? String(counts.products) : undefined,
          badgeColor: 'bg-brand-600 text-white',
          path: '/admin/products',
        },
        {
          id: 'catalog' as AdminTab,
          label: '31k+ Phone Catalog',
          icon: Smartphone,
          badge: '31k+ Live',
          badgeColor: 'bg-emerald-600 text-white',
          path: '/admin/catalog',
        },
        {
          id: 'pricing' as AdminTab,
          label: 'Pricing Engine',
          icon: TrendingUp,
          path: '/admin/pricing',
        },
        { id: 'parts' as AdminTab, label: 'Spare Parts Stock', icon: Wrench, path: '/admin?tab=parts' },
      ],
    },
    {
      title: 'FLEET & PARTNERS',
      items: [
        {
          id: 'agents' as AdminTab,
          label: 'Delivery Fleet',
          icon: Truck,
          badge: `${counts.agents} Active`,
          badgeColor: 'bg-emerald-600 text-white',
          path: '/admin/agents',
        },
        {
          id: 'wholesalers' as AdminTab,
          label: 'Vendors (10% Comm.)',
          icon: Building2,
          badge: 'Vendor Hub',
          badgeColor: 'bg-teal-600 text-white',
          path: '/admin/wholesalers',
        },
        { id: 'users' as AdminTab, label: 'Users & Roles', icon: Users, path: '/admin?tab=users' },
      ],
    },
    {
      title: 'STOREFRONT & CONTENT',
      items: [
        {
          id: 'banners' as AdminTab,
          label: 'Hero Sliders & Banners',
          icon: ImageIcon,
          badge: 'Live',
          badgeColor: 'bg-teal-600 text-white',
          path: '/admin/banners',
        },
        { id: 'reviews' as AdminTab, label: 'Customer Reviews', icon: MessageSquare, path: '/admin?tab=reviews' },
      ],
    },
  ];

  const handleItemClick = (item: { id: AdminTab; path: string }) => {
    onSelectTab(item.id);
    onCloseMobile();
    if (item.path.startsWith('/admin/')) {
      navigate(item.path);
    }
  };

  const navContent = (
    <div className="flex min-h-full flex-col justify-between p-4">
      <div className="space-y-5">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-1 pt-1 sticky top-0 bg-white z-10 pb-2 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-500 text-white shadow-md shadow-brand-500/30">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <span className="font-display text-lg font-black tracking-tight text-ink-900">Fundu Admin</span>
              <p className="text-[10px] font-bold text-brand-600 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-emerald-600" /> Lucknow Hub
              </p>
            </div>
          </Link>
          {mobileOpen && (
            <button onClick={onCloseMobile} className="rounded-xl p-1.5 text-ink-400 hover:bg-ink-100 lg:hidden">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Categorized Menu Groups */}
        <div className="space-y-4">
          {menuGroups.map((group) => {
            const filteredItems = group.items.filter((item) =>
              !navFilter.trim() || item.label.toLowerCase().includes(navFilter.toLowerCase().trim())
            );
            if (filteredItems.length === 0) return null;

            return (
              <div key={group.title} className="space-y-1">
                <h4 className="px-2 text-[10px] font-black tracking-wider text-gray-400 uppercase">
                  {group.title}
                </h4>
                <div className="space-y-0.5">
                  {filteredItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-[#00a896] text-white shadow-md shadow-teal-500/20 font-black'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-black ${
                              isActive ? 'bg-white/25 text-white' : item.badgeColor || 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Footer Links */}
      <div className="space-y-2 pt-4 border-t border-ink-100 mt-6">
        <Link
          to="/"
          className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-ink-500 hover:bg-ink-100 hover:text-ink-900"
        >
          <span>View Public Store</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
        <Link
          to="/delivery"
          className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100"
        >
          <span>Field Rider Portal</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
        <Link
          to="/vendor"
          className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100"
        >
          <span>Vendor Partner Hub</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
        <button
          onClick={() => {
            signOut();
            navigate('/admin-login');
          }}
          className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 transition mt-1 cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <LogOut className="h-3.5 w-3.5" /> Sign Out Admin
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Scrollable Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 z-30 bg-white border-r border-[#e5ecef] shadow-xs overflow-y-auto max-h-screen">
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-ink-900/50 backdrop-blur-xs">
          <div className="w-72 bg-white shadow-2xl h-full overflow-y-auto">{navContent}</div>
          <div className="flex-1" onClick={onCloseMobile} />
        </div>
      )}
    </>
  );
}
