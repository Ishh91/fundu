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
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Store,
  Trash2,
  Truck,
  User,
  Wrench,
  X,
  Check,
  Smartphone,
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

const mainCategories = [
  {
    to: '/sell',
    label: 'Sell Phone',
    icon: BadgeIndianRupee,
    badge: 'Instant Cash',
    badgeColor: 'bg-emerald-500 text-white',
  },
  {
    to: '/buy',
    label: 'Buy Refurbished',
    icon: Store,
    badge: '6M Warranty',
    badgeColor: 'bg-teal-600 text-white',
  },
  {
    to: '/repair',
    label: 'Repair Phone',
    icon: Wrench,
    badge: '30-Min Doorstep',
    badgeColor: 'bg-amber-500 text-white',
  },
];

const secondaryLinks = [
  { to: '/store', label: 'Fundu Store', icon: Store },
  { to: '/partner', label: 'Partner with Us', icon: Building2 },
  { to: '/document-doctor', label: 'Document Doctor', icon: FileText },
  { to: '/articles', label: 'Articles & Guides' },
];

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const { cartItem, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [selectedLocality, setSelectedLocality] = useState(() => {
    return localStorage.getItem('fundu_lucknow_area') || 'Hazratganj, Lucknow';
  });

  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
    setCartOpen(false);
    setLocationModalOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // Click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLocality = (loc: string) => {
    const fullLoc = `${loc}, Lucknow`;
    setSelectedLocality(fullLoc);
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

  const authLinks = (
    <>
      <Link
        to="/dashboard"
        className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-ink-700 hover:bg-teal-50 hover:text-teal-700 transition"
      >
        <LayoutDashboard className="h-4 w-4 text-teal-600" /> My Orders & Bookings
      </Link>
      <Link
        to="/profile"
        className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-ink-700 hover:bg-teal-50 hover:text-teal-700 transition"
      >
        <User className="h-4 w-4 text-teal-600" /> Account Profile
      </Link>
      {profile?.role === 'admin' && (
        <Link
          to="/admin"
          className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 transition"
        >
          <LayoutDashboard className="h-4 w-4" /> Admin Console
        </Link>
      )}
      {profile?.role === 'wholesaler' && (
        <Link
          to="/wholesaler"
          className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 transition"
        >
          <Building2 className="h-4 w-4" /> Wholesaler Hub
        </Link>
      )}
    </>
  );

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
        {/* Cashify Style Top Utilities Strip */}
        <div className="hidden border-b border-gray-100 bg-[#f8fafc] text-xs lg:block">
          <div className="container-page flex h-9 items-center justify-between gap-4 text-gray-600">
            <div className="flex items-center gap-6">
              {/* Location Picker Trigger */}
              <button
                type="button"
                onClick={() => setLocationModalOpen(true)}
                className="group flex items-center gap-1.5 font-bold text-gray-800 hover:text-teal-600 transition"
              >
                <MapPin className="h-3.5 w-3.5 text-teal-600 group-hover:animate-bounce" />
                <span>{selectedLocality}</span>
                <ChevronDown className="h-3 w-3 text-gray-400 group-hover:text-teal-600" />
              </button>

              <span className="text-gray-300">|</span>

              <div className="flex items-center gap-4 text-gray-500">
                <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                  <Truck className="h-3.5 w-3.5" /> Free Doorstep Service in Lucknow
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-teal-700">
                  <ShieldCheck className="h-3.5 w-3.5" /> 6 Months Warranty on Refurbished & Repairs
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {secondaryLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="font-medium text-gray-600 hover:text-teal-600 transition"
                >
                  {item.label}
                </Link>
              ))}
              <span className="text-gray-300">|</span>
              <a
                href="tel:+919876543210"
                className="font-bold text-gray-800 hover:text-teal-600 transition"
              >
                Lucknow Helpline: <span className="text-teal-600">+91 98765 43210</span>
              </a>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="container-page">
          <div className="flex h-18 sm:h-20 items-center justify-between gap-3 md:gap-6">
            {/* Logo */}
            <Link to="/" className="shrink-0 flex items-center">
              <BrandLogo imageClassName="h-10 sm:h-12 w-auto max-w-[190px]" />
            </Link>

            {/* Cashify Style Category Navigation */}
            <nav className="hidden lg:flex items-center gap-1.5">
              {mainCategories.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-teal-500 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-teal-600'}`} />
                    <span>{item.label}</span>
                    {item.badge && !isActive && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Cashify Smart Search Bar with live autocomplete */}
            <div ref={searchRef} className="relative hidden md:block flex-1 max-w-md">
              <form
                onSubmit={submitSearch}
                className="flex items-center gap-2.5 rounded-full border border-gray-300 bg-[#f8fafc] px-4 py-2.5 transition focus-within:border-teal-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-teal-500/20"
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
                  placeholder="Search mobiles to Sell, Buy or Repair..."
                  className="w-full bg-transparent text-sm font-medium text-gray-800 outline-none placeholder:text-gray-400"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </form>

              {/* Autocomplete Dropdown */}
              {searchOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-gray-200 bg-white p-3 shadow-xl z-50">
                  {search.trim() && matchingModels.length > 0 ? (
                    <div className="space-y-1">
                      <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        Direct Actions
                      </div>
                      {matchingModels.map((item) => (
                        <div
                          key={`${item.brand}-${item.model}`}
                          className="flex items-center justify-between rounded-xl p-2.5 hover:bg-teal-50/60 transition group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="grid h-8 w-8 place-items-center rounded-lg bg-teal-100/50 text-teal-700">
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
                      No exact matches found. Press Enter to search all phones.
                    </div>
                  ) : (
                    <div className="p-2">
                      <p className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        Popular in Lucknow
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {['iPhone 13', 'iPhone 14', 'Galaxy S23', 'OnePlus 11', 'Redmi Note 13', 'Pixel 7'].map(
                          (name) => (
                            <button
                              key={name}
                              type="button"
                              onClick={() => {
                                setSearch(name);
                                navigate(`/buy?search=${encodeURIComponent(name)}`);
                                setSearchOpen(false);
                              }}
                              className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-teal-50 hover:text-teal-700"
                            >
                              {name}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Actions / Cart / Auth */}
            <div className="flex items-center gap-2.5 sm:gap-3.5">
              {/* Location Badge (Mobile) */}
              <button
                type="button"
                onClick={() => setLocationModalOpen(true)}
                className="flex lg:hidden items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1.5 text-xs font-bold text-teal-700"
              >
                <MapPin className="h-3 w-3" />
                <span className="max-w-[70px] truncate">{selectedLocality.split(',')[0]}</span>
              </button>

              {/* Cart Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCartOpen((prev) => !prev)}
                  className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:border-teal-400 hover:text-teal-600 shadow-sm"
                  aria-label="View Cart"
                >
                  <ShoppingCart className="h-4.5 w-4.5" />
                  {cartItem ? (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-teal-500 text-[11px] font-bold text-white shadow-md">
                      {cartItem.quantity || 1}
                    </span>
                  ) : null}
                </button>

                {/* Cart Modal Dropdown */}
                {cartOpen && (
                  <div className="absolute right-0 top-full mt-3 w-80 sm:w-92 rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl z-50">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                      <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4 text-teal-600" /> Shopping Cart
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
                            <p className="text-sm font-extrabold text-teal-600 mt-0.5">
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
                          className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white shadow-md transition"
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

              {/* User / Login Button */}
              {user ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setProfileOpen((prev) => !prev)}
                    className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-bold text-gray-700 hover:border-teal-400 shadow-sm"
                  >
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-teal-50 text-teal-700">
                      <User className="h-3.5 w-3.5" />
                    </span>
                    <span className="max-w-[100px] truncate hidden sm:inline-block">
                      {profile?.full_name || user.email?.split('@')[0]}
                    </span>
                    <ChevronDown className="h-3 w-3 text-gray-400" />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl border border-gray-200 bg-white p-2.5 shadow-xl z-50">
                      {authLinks}
                      <button
                        type="button"
                        onClick={() => {
                          signOut();
                          navigate('/');
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition mt-1"
                      >
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="hidden sm:inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-bold text-gray-700 hover:text-teal-600 transition"
                  >
                    Login
                  </Link>
                  <Link
                    to="/sell"
                    className="inline-flex items-center justify-center rounded-full bg-teal-500 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-teal-600 transition active:scale-95"
                  >
                    Sell Phone
                  </Link>
                </div>
              )}

              {/* Mobile Hamburger Menu */}
              <button
                type="button"
                onClick={() => setMobileOpen((prev) => !prev)}
                className="grid h-10 w-10 place-items-center rounded-full border border-gray-200 bg-white text-gray-700 lg:hidden shadow-sm"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileOpen && (
          <div className="border-t border-gray-100 bg-white lg:hidden">
            <div className="container-page py-4 space-y-4">
              {/* Mobile Search */}
              <form onSubmit={submitSearch} className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search mobiles..."
                  className="w-full bg-transparent text-sm font-medium text-gray-800 outline-none"
                />
              </form>

              {/* Mobile Location Selector */}
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setLocationModalOpen(true);
                }}
                className="flex w-full items-center justify-between rounded-xl bg-teal-50 px-4 py-3 text-sm font-bold text-teal-800"
              >
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-teal-600" />
                  {selectedLocality}
                </span>
                <span className="text-xs font-semibold text-teal-600 underline">Change</span>
              </button>

              {/* Main Categories */}
              <div className="grid gap-1.5">
                {mainCategories.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold text-gray-800 hover:bg-teal-50"
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-teal-600" />
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* Secondary links */}
              <div className="grid gap-1 border-t border-gray-100 pt-3">
                {secondaryLinks.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Auth links or Login */}
              <div className="border-t border-gray-100 pt-3">
                {user ? (
                  <>
                    {authLinks}
                    <button
                      type="button"
                      onClick={() => {
                        signOut();
                        navigate('/');
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 mt-1"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <Link
                      to="/login"
                      className="flex-1 rounded-xl border border-gray-200 py-2.5 text-center text-sm font-bold text-gray-800 hover:bg-gray-50"
                    >
                      Login
                    </Link>
                    <Link
                      to="/sell"
                      className="flex-1 rounded-xl bg-teal-500 py-2.5 text-center text-sm font-bold text-white shadow-sm hover:bg-teal-600"
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

      {/* Lucknow Locality Selection Modal */}
      {locationModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-gray-100 animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-teal-100 text-teal-700">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-gray-900">Select Locality</h3>
                  <p className="text-xs font-semibold text-teal-600">
                    Fundu is exclusively operational across Lucknow
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLocationModalOpen(false)}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                Popular Lucknow Localities for Doorstep Pickup
              </p>
              <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                {LUCKNOW_LOCALITIES.map((loc) => {
                  const isSelected = selectedLocality.startsWith(loc);
                  return (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => handleSelectLocality(loc)}
                      className={`flex items-center justify-between rounded-xl p-2.5 text-left text-xs font-bold transition ${
                        isSelected
                          ? 'border-2 border-teal-500 bg-teal-50 text-teal-800'
                          : 'border border-gray-200 bg-white text-gray-700 hover:border-teal-300 hover:bg-teal-50/50'
                      }`}
                    >
                      <span>{loc}</span>
                      {isSelected && <Check className="h-4 w-4 text-teal-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-teal-50/70 p-3 text-center text-xs font-semibold text-teal-800 flex items-center justify-center gap-2">
              <Truck className="h-4 w-4 text-teal-600 shrink-0" />
              Free doorstep pickup & delivery in all selected areas!
            </div>
          </div>
        </div>
      )}
    </>
  );
}
