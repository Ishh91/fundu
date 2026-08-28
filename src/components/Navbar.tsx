import { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BadgeIndianRupee,
  Building2,
  ChevronDown,
  FileText,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Phone,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Store,
  Trash2,
  Tv,
  User,
  Wrench,
  X,
  Check,
  Clock,
  Truck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatINR } from '../lib/db';
import BrandLogo from './BrandLogo';
import { PHONE_LOOKUP_CATALOG } from '../data/phoneLookup';

export const LUCKNOW_LOCALITIES = [
  'Hazratganj',
  'Gomti Nagar',
  'Indira Nagar',
  'Aliganj',
  'Mahanagar',
  'Ashiyana',
  'Charbagh',
  'Chowk',
  'Vikas Nagar',
  'Jankipuram',
  'Rajajipuram',
  'Alambagh',
  'Gomti Nagar Extension',
  'Faizabad Road',
  'Telibagh',
  'Aminabad',
];

export const LUCKNOW_STORES = [
  {
    id: 1,
    name: 'Hazratganj Flagship Store',
    locality: 'Hazratganj',
    address: 'Shop 12, Ground Floor, MG Marg, Near Cathedral',
    timing: '10:00 AM – 9:00 PM',
    phone: '+91 98765 43210',
    type: 'Flagship Experience Center',
  },
  {
    id: 2,
    name: 'Gomti Nagar Super Hub',
    locality: 'Gomti Nagar',
    address: 'Plot 4, Viram Khand 1, Near Patrakarpuram Crossing',
    timing: '10:00 AM – 9:00 PM',
    phone: '+91 98765 43211',
    type: 'Sales & Express Repair Hub',
  },
  {
    id: 3,
    name: 'Aliganj Tech Center',
    locality: 'Aliganj',
    address: 'B-14, Kapoorthala Shopping Complex',
    timing: '10:30 AM – 8:30 PM',
    phone: '+91 98765 43212',
    type: 'Diagnostic & Trade-In Store',
  },
  {
    id: 4,
    name: 'Indira Nagar Store',
    locality: 'Indira Nagar',
    address: 'Sector 14, Near Munshipulia Metro Station',
    timing: '10:00 AM – 9:00 PM',
    phone: '+91 98765 43213',
    type: 'Retail & Refurbished Hub',
  },
  {
    id: 5,
    name: 'Mahanagar Store',
    locality: 'Mahanagar',
    address: 'Shop 8, Gole Market Commercial Centre',
    timing: '10:30 AM – 8:30 PM',
    phone: '+91 98765 43214',
    type: 'Experience & Pickup Point',
  },
  {
    id: 6,
    name: 'Ashiyana Pickup Hub',
    locality: 'Ashiyana',
    address: 'Sector H, Power House Chauraha, LDA Colony',
    timing: '10:00 AM – 8:30 PM',
    phone: '+91 98765 43215',
    type: 'Express Drop & Instant Cash',
  },
  {
    id: 7,
    name: 'Chowk Heritage Center',
    locality: 'Chowk',
    address: 'Shop 22, Phool Mandi Road, Opp. Clock Tower',
    timing: '11:00 AM – 9:00 PM',
    phone: '+91 98765 43216',
    type: 'Old City Trade & Service Hub',
  },
];

const PHONE_BRANDS = [
  { name: 'Apple', tag: 'Premium' },
  { name: 'Samsung', tag: 'Flagship' },
  { name: 'OnePlus', tag: 'High Demand' },
  { name: 'Xiaomi', tag: 'Range' },
  { name: 'Realme', tag: 'Affordable' },
  { name: 'Vivo', tag: 'Affordable' },
  { name: 'Oppo', tag: 'Affordable' },
  { name: 'Google', tag: 'Pixel Series' },
  { name: 'Nothing', tag: 'Trending' },
  { name: 'Motorola', tag: 'Series' },
];

const BUY_REFURBISHED_HIGHLIGHTS = [
  {
    title: 'iPhones',
    desc: 'iPhone 11 to 15 Pro Max with 6M warranty',
    to: '/buy?brand=Apple',
    badge: '32-Point Inspected',
  },
  {
    title: 'Samsung',
    desc: 'S21, S22, S23, S24 & Fold/Flip series',
    to: '/buy?brand=Samsung',
    badge: 'Best Cameras',
  },
  {
    title: 'OnePlus',
    desc: 'OnePlus 9 to 12R at unbelievable prices',
    to: '/buy?brand=OnePlus',
    badge: 'Fast Charging',
  },
  {
    title: 'Budget Picks Under ₹10,000',
    desc: 'Tested daily drivers with clean bills',
    to: '/buy?maxPrice=10000',
    badge: 'Best Value',
  },
  {
    title: 'Premium Deals Under ₹25,000',
    desc: 'High performance flagships for less',
    to: '/buy?maxPrice=25000',
    badge: 'Hot Seller',
  },
];

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const { cartItem, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation states
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const [selectedLocality, setSelectedLocality] = useState(() => {
    return localStorage.getItem('fundu_lucknow_area') || 'Lucknow';
  });

  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
    setCartOpen(false);
    setLocationModalOpen(false);
    setSearchOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  // Click outside listener for search & dropdown menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLocality = (loc: string) => {
    const fullLoc = `${loc}, Lucknow`;
    setSelectedLocality(loc);
    localStorage.setItem('fundu_lucknow_area', fullLoc);
    setLocationModalOpen(false);
  };

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const value = search.trim();
    if (!value) {
      navigate('/buy');
      return;
    }
    setSearchOpen(false);
    navigate(`/buy?search=${encodeURIComponent(value)}`);
  };

  // Autocomplete matching models
  const matchingModels = search.trim()
    ? PHONE_LOOKUP_CATALOG.filter(
      (p) =>
        p.model.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 5)
    : [];

  const toggleDropdown = (name: string) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  const isAdminRole = profile?.role === 'admin';
  const isVendorRole = profile?.role === 'vendor' || profile?.role === 'wholesaler';
  const isDeliveryRole = profile?.role === 'delivery' || profile?.role === 'rider';

  const authLinks = (
    <>
      {isAdminRole ? (
        <Link
          to="/admin"
          className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 transition"
        >
          <LayoutDashboard className="h-4 w-4 text-purple-600" /> Admin Console
        </Link>
      ) : (
        <>
          <Link
            to="/dashboard"
            className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition"
          >
            <LayoutDashboard className="h-4 w-4 text-teal-600" /> My Orders & Bookings
          </Link>
          <Link
            to="/profile"
            className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition"
          >
            <User className="h-4 w-4 text-teal-600" /> Account Profile
          </Link>
          {isVendorRole && (
            <Link
              to="/vendor"
              className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 transition"
            >
              <Building2 className="h-4 w-4 text-brand-600" /> Vendor Partner Portal
            </Link>
          )}
          {isDeliveryRole && (
            <Link
              to="/delivery"
              className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition"
            >
              <Truck className="h-4 w-4 text-emerald-600" /> Field Rider Portal
            </Link>
          )}
        </>
      )}
    </>
  );

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm transition-all">
        {/* ========================================================================= */}
        {/* TOP ROW: LOGO | LOCATION | EXPANDED PILL SEARCH BAR | CART | LOGIN PILL */}
        {/* ========================================================================= */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 sm:h-18 md:h-20 items-center justify-between gap-3 md:gap-6">

            {/* 1. Left: Brand Logo & Location Selector */}
            <div className="flex items-center gap-3 sm:gap-6 shrink-0">
              <Link to="/" className="flex items-center shrink-0" aria-label="Fundu Home">
                <BrandLogo imageClassName="h-11 sm:h-14 md:h-16 w-auto max-w-[240px] sm:max-w-[290px] md:max-w-[320px] filter drop-shadow-xs transition-transform duration-200 hover:scale-102" />
              </Link>

              {/* Location Selector (Lucknow) */}
              <button
                type="button"
                onClick={() => setLocationModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-700 hover:text-teal-600 transition-colors py-1.5 px-2 rounded-lg hover:bg-gray-50 group cursor-pointer"
                title="Fundu services Lucknow"
              >
                <MapPin className="h-4 w-4 text-[#00a896] shrink-0 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-gray-800 group-hover:text-[#00a896]">
                  {selectedLocality === 'Lucknow' ? 'Lucknow' : `${selectedLocality}`}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-gray-400 group-hover:text-teal-600 transition-transform" />
              </button>
            </div>

            {/* 2. Middle: Large Rounded-Full Pill Search Bar */}
            <div ref={searchRef} className="relative flex-1 max-w-2xl hidden md:block">
              <form
                onSubmit={submitSearch}
                className="flex items-center gap-3 rounded-full bg-[#f1f5f9] hover:bg-[#ebf0f5] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#00a896]/30 focus-within:border-[#00a896] border border-transparent px-4 sm:px-5 py-2.5 transition-all duration-200"
              >
                <Search className="h-4 w-4 shrink-0 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onFocus={() => setSearchOpen(true)}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setSearchOpen(true);
                  }}
                  placeholder="Search phone to sell — iPhone 15, S24, Pixel 8..."
                  className="w-full bg-transparent text-xs sm:text-sm font-medium text-gray-800 outline-none placeholder:text-gray-400"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="text-gray-400 hover:text-gray-600 transition p-0.5"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </form>

              {/* Live Search Autocomplete Popup */}
              {searchOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-gray-200 bg-white p-3.5 shadow-2xl z-50 animate-fade-in">
                  {search.trim() && matchingModels.length > 0 ? (
                    <div className="space-y-1">
                      <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        Direct Actions
                      </div>
                      {matchingModels.map((item) => (
                        <div
                          key={`${item.brand}-${item.model}`}
                          className="flex items-center justify-between rounded-xl p-2.5 hover:bg-teal-50/70 transition group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="grid h-8 w-8 place-items-center rounded-lg bg-teal-100/60 text-teal-700">
                              <Smartphone className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-800 group-hover:text-teal-700">
                                {item.model}
                              </p>
                              <p className="text-xs text-gray-400">{item.brand}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Link
                              to={`/sell?brand=${encodeURIComponent(item.brand)}&model=${encodeURIComponent(
                                item.model
                              )}`}
                              onClick={() => setSearchOpen(false)}
                              className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                            >
                              Sell
                            </Link>
                            <Link
                              to={`/buy?search=${encodeURIComponent(item.model)}`}
                              onClick={() => setSearchOpen(false)}
                              className="rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 hover:bg-teal-100"
                            >
                              Buy
                            </Link>
                            <Link
                              to={`/repair?brand=${encodeURIComponent(item.brand)}&model=${encodeURIComponent(
                                item.model
                              )}`}
                              onClick={() => setSearchOpen(false)}
                              className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 hover:bg-amber-100"
                            >
                              Repair
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : search.trim() ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      No exact matches found. Press Enter to browse all refurbished phones.
                    </div>
                  ) : (
                    <div className="p-2">
                      <p className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        Popular Searches in Lucknow
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {[
                          'iPhone 13',
                          'iPhone 14',
                          'iPhone 15',
                          'Galaxy S23',
                          'Galaxy S24',
                          'OnePlus 11',
                          'Redmi Note 13',
                          'Pixel 8',
                        ].map((name) => (
                          <button
                            key={name}
                            type="button"
                            onClick={() => {
                              setSearch(name);
                              navigate(`/buy?search=${encodeURIComponent(name)}`);
                              setSearchOpen(false);
                            }}
                            className="rounded-full bg-gray-100 px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition"
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. Right: Shopping Cart Icon & Solid Teal Pill Login Button */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">

              {/* Mobile Location Badge */}
              <button
                type="button"
                onClick={() => setLocationModalOpen(true)}
                className="flex sm:hidden items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700"
              >
                <MapPin className="h-3 w-3 text-[#00a896]" />
                <span className="max-w-[70px] truncate">{selectedLocality.split(',')[0]}</span>
              </button>

              {/* Cart Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCartOpen((prev) => !prev)}
                  className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-700 hover:text-[#00a896] hover:bg-gray-50 transition-colors"
                  aria-label="Shopping Cart"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartItem ? (
                    <span className="absolute 0 top-0.5 right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#00a896] text-[10px] font-bold text-white shadow">
                      {cartItem.quantity || 1}
                    </span>
                  ) : null}
                </button>

                {/* Cart Modal Dropdown */}
                {cartOpen && (
                  <div className="absolute right-0 top-full mt-3 w-80 sm:w-92 rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl z-50 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                      <h3 className="font-bold text-sm sm:text-base text-gray-900 flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4 text-[#00a896]" /> Shopping Cart
                      </h3>
                      {cartItem && (
                        <button
                          type="button"
                          onClick={() => clearCart()}
                          className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" /> Clear
                        </button>
                      )}
                    </div>

                    {cartItem ? (
                      <div className="space-y-3">
                        <div className="flex gap-3 items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                          {cartItem.item.images?.[0] ? (
                            <img
                              src={cartItem.item.images[0]}
                              alt={cartItem.item.title}
                              className="h-14 w-14 object-cover rounded-lg border border-gray-200 shrink-0 bg-white"
                            />
                          ) : (
                            <div className="h-14 w-14 rounded-lg border border-gray-200 bg-white grid place-items-center shrink-0">
                              <ShoppingBag className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-bold text-gray-900 truncate">
                              {cartItem.item.title}
                            </h4>
                            <p className="text-xs text-gray-500 font-medium capitalize">
                              {cartItem.type.replace('_', ' ')} • Lucknow Free Delivery
                            </p>
                            <p className="text-sm font-extrabold text-[#00a896] mt-0.5">
                              {formatINR(cartItem.item.price)}
                            </p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-600">Total Payable:</span>
                          <span className="text-base font-extrabold text-gray-900">
                            {formatINR(cartItem.item.price * (cartItem.quantity || 1))}
                          </span>
                        </div>

                        <Link
                          to="/checkout"
                          onClick={() => setCartOpen(false)}
                          className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 bg-[#00a896] hover:bg-[#008f80] text-white shadow transition"
                        >
                          Proceed to Checkout <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <ShoppingBag className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm font-bold text-gray-700">Your cart is empty</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Explore verified refurbished phones with 6M warranty
                        </p>
                        <Link
                          to="/buy"
                          onClick={() => setCartOpen(false)}
                          className="inline-block mt-3 px-4 py-1.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 hover:bg-teal-100"
                        >
                          Browse Deals
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Login Button or User Dropdown */}
              {user ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setProfileOpen((prev) => !prev)}
                    className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-bold text-gray-700 hover:border-[#00a896] shadow-sm transition"
                  >
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-teal-50 text-teal-700 overflow-hidden shrink-0 border border-teal-200">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Profile Avatar" className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-3.5 w-3.5" />
                      )}
                    </span>
                    <span className="max-w-[100px] truncate hidden sm:inline-block">
                      {profile?.full_name || user.email?.split('@')[0]}
                    </span>
                    <ChevronDown className="h-3 w-3 text-gray-400" />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl border border-gray-200 bg-white p-2.5 shadow-2xl z-50 animate-fade-in">
                      {authLinks}
                      <button
                        type="button"
                        onClick={() => {
                          signOut();
                          navigate('/');
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition mt-1 cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-full bg-[#00a896] hover:bg-[#009688] active:scale-95 text-white font-bold text-xs sm:text-sm px-5 sm:px-6 py-2 sm:py-2.5 shadow-sm transition-all duration-150"
                >
                  Login
                </Link>
              )}

              {/* Mobile Hamburger Menu */}
              <button
                type="button"
                onClick={() => setMobileOpen((prev) => !prev)}
                className="grid h-10 w-10 place-items-center rounded-full border border-gray-200 bg-white text-gray-700 lg:hidden shadow-sm hover:bg-gray-50"
                aria-label="Toggle Navigation Menu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BOTTOM ROW: SUB-NAVBAR CATEGORY STRIP */}
        {/* ========================================================================= */}
        <div ref={dropdownRef} className="border-t border-gray-100 bg-white relative hidden lg:block">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center justify-between text-[13px] font-semibold text-gray-700 h-11">

              {/* All Mega Menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown('all')}
                  className={`flex items-center gap-1.5 py-2 font-bold transition-colors cursor-pointer ${activeDropdown === 'all' ? 'text-[#00a896]' : 'text-gray-900 hover:text-[#00a896]'
                    }`}
                >
                  <span>All</span>
                  <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${activeDropdown === 'all' ? 'rotate-180 text-[#00a896]' : 'text-gray-400'}`} />
                </button>

                {activeDropdown === 'all' && (
                  <div className="absolute left-0 top-full mt-1 w-[720px] rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl z-50 animate-fade-in grid grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                        <BadgeIndianRupee className="h-3.5 w-3.5 text-[#00a896]" /> Sell & Trade-in
                      </h4>
                      <ul className="space-y-2 text-xs">
                        <li>
                          <Link to="/sell" className="font-semibold text-gray-800 hover:text-[#00a896] block">
                            Sell Old Phone (Instant Cash)
                          </Link>
                        </li>
                        <li>
                          <Link to="/recycle" className="font-semibold text-gray-800 hover:text-[#00a896] block">
                            Sell Old Appliances & Tablets
                          </Link>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                        <Store className="h-3.5 w-3.5 text-[#00a896]" /> Buy Phone
                      </h4>
                      <ul className="space-y-2 text-xs">
                        <li>
                          <Link to="/buy?brand=Apple" className="font-semibold text-gray-800 hover:text-[#00a896] block">
                            Refurbished Apple iPhones
                          </Link>
                        </li>
                        <li>
                          <Link to="/buy?brand=Samsung" className="font-semibold text-gray-800 hover:text-[#00a896] block">
                            Samsung Galaxy Flagships
                          </Link>
                        </li>
                        <li>
                          <Link to="/store" className="font-semibold text-gray-800 hover:text-[#00a896] block">
                            Fundu Exclusive Store
                          </Link>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                        <Wrench className="h-3.5 w-3.5 text-[#00a896]" /> Repairs & Services
                      </h4>
                      <ul className="space-y-2 text-xs">
                        <li>
                          <Link to="/repair" className="font-semibold text-gray-800 hover:text-[#00a896] block">
                            30-Min Doorstep Phone Repair
                          </Link>
                        </li>
                        <li>
                          <Link to="/spare-parts" className="font-semibold text-gray-800 hover:text-[#00a896] block">
                            Genuine Spare Parts
                          </Link>
                        </li>
                        <li>
                          <Link to="/document-doctor" className="font-semibold text-gray-800 hover:text-[#00a896] block">
                            Document Doctor (Bill & KYC)
                          </Link>
                        </li>
                        <li>
                          <Link to="/partner" className="font-semibold text-gray-800 hover:text-[#00a896] block">
                            Become a Partner / Franchise
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Sell Phone Dropdown */}
              <div className="relative flex items-center gap-1 py-2">
                <Link
                  to="/sell"
                  className={`transition-colors font-bold ${
                    activeDropdown === 'sell-phone' || location.pathname === '/sell'
                      ? 'text-[#00a896]'
                      : 'hover:text-[#00a896]'
                  }`}
                >
                  Sell Phone
                </Link>
                <button
                  type="button"
                  onClick={() => toggleDropdown('sell-phone')}
                  className="p-1 hover:text-[#00a896] cursor-pointer"
                  title="Toggle Sell Brands Menu"
                >
                  <ChevronDown
                    className={`h-3 w-3 transition-transform duration-200 ${
                      activeDropdown === 'sell-phone' ? 'rotate-180 text-[#00a896]' : 'text-gray-400'
                    }`}
                  />
                </button>

                {activeDropdown === 'sell-phone' && (
                  <div className="absolute left-0 top-full mt-1 w-[460px] rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl z-50 animate-fade-in">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-3">
                      <span className="text-xs font-bold text-gray-900">Select Brand to Sell</span>
                      <Link to="/sell" className="text-xs font-bold text-[#00a896] hover:underline">
                        View All Brands →
                      </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {PHONE_BRANDS.map((b) => (
                        <Link
                          key={b.name}
                          to={`/sell?brand=${encodeURIComponent(b.name)}`}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 border border-gray-100 transition group"
                        >
                          <span className="text-xs font-bold text-gray-800 group-hover:text-[#00a896]">
                            {b.name}
                          </span>
                          <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                            {b.tag}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Buy Refurbished Dropdown */}
              <div className="relative flex items-center gap-1 py-2">
                <Link
                  to="/buy"
                  className={`transition-colors font-bold ${
                    activeDropdown === 'buy-refurbished' || location.pathname === '/buy'
                      ? 'text-[#00a896]'
                      : 'hover:text-[#00a896]'
                  }`}
                >
                  Buy Phone
                </Link>
                <button
                  type="button"
                  onClick={() => toggleDropdown('buy-refurbished')}
                  className="p-1 hover:text-[#00a896] cursor-pointer"
                  title="Toggle Certified Phones Menu"
                >
                  <ChevronDown
                    className={`h-3 w-3 transition-transform duration-200 ${
                      activeDropdown === 'buy-refurbished' ? 'rotate-180 text-[#00a896]' : 'text-gray-400'
                    }`}
                  />
                </button>

                {activeDropdown === 'buy-refurbished' && (
                  <div className="absolute left-0 top-full mt-1 w-[420px] rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl z-50 animate-fade-in">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-3">
                      <span className="text-xs font-bold text-gray-900">Certified Phones</span>
                      <Link to="/buy" className="text-xs font-bold text-[#00a896] hover:underline">
                        All Deals →
                      </Link>
                    </div>
                    <div className="space-y-1.5">
                      {BUY_REFURBISHED_HIGHLIGHTS.map((item) => (
                        <Link
                          key={item.title}
                          to={item.to}
                          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-teal-50/60 border border-gray-100 transition group"
                        >
                          <div>
                            <p className="text-xs font-bold text-gray-900 group-hover:text-[#00a896]">
                              {item.title}
                            </p>
                            <p className="text-[11px] text-gray-500">{item.desc}</p>
                          </div>
                          <span className="text-[10px] font-bold bg-teal-100/70 text-teal-800 px-2 py-0.5 rounded-md shrink-0">
                            {item.badge}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Phone Repair */}
              <Link
                to="/repair"
                className="py-2 hover:text-[#00a896] transition-colors"
              >
                Phone Repair
              </Link>

              {/* Spare Parts */}
              <Link
                to="/spare-parts"
                className="py-2 hover:text-[#00a896] transition-colors"
              >
                Spare Parts
              </Link>

              {/* Sell Appliances */}
              <Link
                to="/recycle"
                className="py-2 hover:text-[#00a896] transition-colors"
              >
                Sell Appliances
              </Link>

              {/* Document Doctor */}
              <Link
                to="/document-doctor"
                className="py-2 hover:text-[#00a896] transition-colors flex items-center gap-1.5"
              >
                <FileText className="h-3.5 w-3.5 text-[#00a896]" />
                <span>Document Doctor</span>
              </Link>

              {/* Become Partner */}
              <Link
                to="/partner"
                className="py-2 hover:text-[#00a896] transition-colors"
              >
                Become Partner
              </Link>

              {/* Our Stores ⑦ Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown('our-stores')}
                  className={`flex items-center gap-1.5 py-2 font-bold transition-colors cursor-pointer ${activeDropdown === 'our-stores' ? 'text-[#00a896]' : 'text-gray-900 hover:text-[#00a896]'
                    }`}
                >
                  <MapPin className="h-3.5 w-3.5 text-[#00a896]" />
                  <span>Our Stores</span>
                  <span className="grid h-4.5 min-w-4.5 px-1 place-items-center rounded-full bg-[#00a896] text-[10px] font-extrabold text-white">
                    7
                  </span>
                  <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${activeDropdown === 'our-stores' ? 'rotate-180 text-[#00a896]' : 'text-gray-400'}`} />
                </button>

                {activeDropdown === 'our-stores' && (
                  <div className="absolute right-0 top-full mt-1 w-[460px] rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl z-50 animate-fade-in">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-3">
                      <div>
                        <span className="text-xs font-bold text-gray-900">7 Lucknow Store & Pickup Hubs</span>
                        <p className="text-[11px] text-teal-700 font-medium">Walk-in for instant cash or phone pickup</p>
                      </div>
                      <Link to="/store" className="text-xs font-bold text-[#00a896] hover:underline">
                        View Hub Details →
                      </Link>
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                      {LUCKNOW_STORES.map((s) => (
                        <div
                          key={s.id}
                          className="p-2.5 rounded-xl border border-gray-100 hover:border-teal-200 hover:bg-teal-50/40 transition"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                                <MapPin className="h-3 w-3 text-[#00a896]" /> {s.name}
                              </h5>
                              <p className="text-[11px] text-gray-600 mt-0.5">{s.address}</p>
                              <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-gray-400" /> {s.timing}
                                </span>
                                <span className="flex items-center gap-1 text-teal-700 font-semibold">
                                  <Phone className="h-3 w-3 text-[#00a896]" /> {s.phone}
                                </span>
                              </div>
                            </div>
                            <span className="text-[9px] font-bold uppercase bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded">
                              {s.locality}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                      <span className="font-semibold text-emerald-700 flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" /> All stores open today
                      </span>
                      <Link
                        to="/store"
                        className="font-bold text-[#00a896] hover:underline flex items-center gap-1"
                      >
                        Locate on Map <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

            </nav>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MOBILE NAVIGATION DRAWER & EXPANDABLE MENU */}
        {/* ========================================================================= */}
        {mobileOpen && (
          <div className="border-t border-gray-100 bg-white lg:hidden max-h-[85vh] overflow-y-auto animate-fade-in">
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Search */}
              <form onSubmit={submitSearch} className="flex items-center gap-2 rounded-full border border-gray-200 bg-[#f1f5f9] px-4 py-2.5">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search phone to sell — iPhone 15, S24..."
                  className="w-full bg-transparent text-xs sm:text-sm font-medium text-gray-800 outline-none"
                />
              </form>

              {/* Mobile Location Selector */}
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setLocationModalOpen(true);
                }}
                className="flex w-full items-center justify-between rounded-xl bg-teal-50 px-4 py-3 text-xs sm:text-sm font-bold text-teal-900 border border-teal-100"
              >
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#00a896]" />
                  <span>{selectedLocality}, Lucknow</span>
                </span>
                <span className="text-xs font-bold text-[#00a896] underline">Change Area</span>
              </button>

              {/* Primary Navigation Links */}
              <div className="grid gap-1 border-b border-gray-100 pb-3">
                <Link
                  to="/sell"
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-bold text-gray-800 hover:bg-gray-50"
                >
                  <span className="flex items-center gap-2.5">
                    <BadgeIndianRupee className="h-4 w-4 text-[#00a896]" /> Sell Phone
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Instant Cash
                  </span>
                </Link>

                <Link
                  to="/buy"
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-bold text-gray-800 hover:bg-gray-50"
                >
                  <span className="flex items-center gap-2.5">
                    <Store className="h-4 w-4 text-[#00a896]" /> Buy Refurbished Phones
                  </span>
                  <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
                    6M Warranty
                  </span>
                </Link>

                <Link
                  to="/repair"
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-bold text-gray-800 hover:bg-gray-50"
                >
                  <span className="flex items-center gap-2.5">
                    <Wrench className="h-4 w-4 text-[#00a896]" /> Phone Repair
                  </span>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    30-Min Doorstep
                  </span>
                </Link>

                <Link
                  to="/spare-parts"
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-bold text-gray-800 hover:bg-gray-50"
                >
                  <span className="flex items-center gap-2.5">
                    <Wrench className="h-4 w-4 text-[#00a896]" /> Genuine Spare Parts
                  </span>
                </Link>

                <Link
                  to="/recycle"
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-bold text-gray-800 hover:bg-gray-50"
                >
                  <span className="flex items-center gap-2.5">
                    <Tv className="h-4 w-4 text-[#00a896]" /> Sell Appliances
                  </span>
                </Link>

                <Link
                  to="/document-doctor"
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-bold text-gray-800 hover:bg-gray-50"
                >
                  <span className="flex items-center gap-2.5">
                    <FileText className="h-4 w-4 text-[#00a896]" /> Document Doctor
                  </span>
                </Link>

                <Link
                  to="/partner"
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-bold text-gray-800 hover:bg-gray-50"
                >
                  <span className="flex items-center gap-2.5">
                    <Building2 className="h-4 w-4 text-[#00a896]" /> Become Partner
                  </span>
                </Link>

                <Link
                  to="/store"
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-bold text-gray-800 hover:bg-gray-50"
                >
                  <span className="flex items-center gap-2.5">
                    <MapPin className="h-4 w-4 text-[#00a896]" /> Our Stores (7 Hubs)
                  </span>
                  <span className="text-[10px] font-bold bg-[#00a896] text-white px-2 py-0.5 rounded-full">
                    Lucknow
                  </span>
                </Link>
              </div>

              {/* User Account / Auth Mobile Actions */}
              <div>
                {user ? (
                  <div className="space-y-1">
                    {authLinks}
                    <button
                      type="button"
                      onClick={() => {
                        signOut();
                        navigate('/');
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2 pt-2">
                    <Link
                      to="/login"
                      className="flex-1 rounded-xl bg-[#00a896] py-2.5 text-center text-sm font-bold text-white shadow hover:bg-[#009688]"
                    >
                      Login
                    </Link>
                    <Link
                      to="/sell"
                      className="flex-1 rounded-xl border border-gray-200 py-2.5 text-center text-sm font-bold text-gray-800 hover:bg-gray-50"
                    >
                      Sell Phone
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* LUCKNOW LOCALITY SELECTION MODAL */}
      {/* ========================================================================= */}
      {locationModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-teal-50 text-[#00a896]">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-gray-900">Select Locality</h3>
                  <p className="text-xs font-semibold text-teal-700">
                    Fundu is exclusively operational across Lucknow
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLocationModalOpen(false)}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                Select Your Lucknow Area for Free Doorstep Pickup
              </p>
              <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                {LUCKNOW_LOCALITIES.map((loc) => {
                  const isSelected = selectedLocality === loc || selectedLocality.startsWith(loc);
                  return (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => handleSelectLocality(loc)}
                      className={`flex items-center justify-between rounded-xl p-2.5 text-left text-xs font-bold transition cursor-pointer ${isSelected
                          ? 'border-2 border-[#00a896] bg-teal-50 text-teal-900 shadow-sm'
                          : 'border border-gray-200 bg-white text-gray-700 hover:border-teal-300 hover:bg-teal-50/40'
                        }`}
                    >
                      <span>{loc}</span>
                      {isSelected && <Check className="h-4 w-4 text-[#00a896]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-teal-50/70 p-3 text-center text-xs font-semibold text-teal-900 flex items-center justify-center gap-2 border border-teal-100">
              <ShieldCheck className="h-4 w-4 text-[#00a896] shrink-0" />
              Free doorstep pickup & instant payment across all 16 Lucknow zones!
            </div>
          </div>
        </div>
      )}
    </>
  );
}
