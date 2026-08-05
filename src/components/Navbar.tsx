import { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatINR } from '../lib/db';
import BrandLogo from './BrandLogo';

const mainCategories = [
  { to: '/sell', label: 'Sell Phone', icon: BadgeIndianRupee },
  { to: '/buy', label: 'Buy Phone', icon: Store },
  { to: '/repair', label: 'Repair', icon: Wrench },
  { to: '/spare-parts', label: 'Spare Parts', icon: ShieldCheck },
];

const quickLinks = [
  { to: '/store', label: 'Fundu Store' },
  { to: '/partner', label: 'Business With Us', icon: Building2 },
  { to: '/document-doctor', label: 'Document Doctor', icon: FileText },
  { to: '/articles', label: 'Articles' },
];

const extraLinks = [
  { to: '/brand', label: 'Brand Hub' },
  { to: '/recycle', label: 'Recycle' },
  { to: '/buy-laptop', label: 'Buy Laptop', note: 'Soon' },
];

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const { cartItem, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
    setMoreOpen(false);
    setCartOpen(false);
  }, [location.pathname]);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const value = search.trim();
    if (!value) {
      navigate('/buy');
      return;
    }
    navigate(`/buy?search=${encodeURIComponent(value)}`);
  };

  const authLinks = (
    <>
      <Link
        to="/dashboard"
        className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-ink-700 hover:bg-ink-50"
      >
        <LayoutDashboard className="h-4 w-4" /> Dashboard
      </Link>
      <Link
        to="/profile"
        className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-ink-700 hover:bg-ink-50"
      >
        <User className="h-4 w-4" /> Profile
      </Link>
      {profile?.role === 'admin' && (
        <Link
          to="/admin"
          className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-ink-700 hover:bg-ink-50"
        >
          <LayoutDashboard className="h-4 w-4" /> Admin Panel
        </Link>
      )}
      {profile?.role === 'wholesaler' && (
        <Link
          to="/wholesaler"
          className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-ink-700 hover:bg-ink-50"
        >
          <LayoutDashboard className="h-4 w-4" /> Wholesaler
        </Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-ink-200 bg-white/96 shadow-soft backdrop-blur-md">
      <div className="hidden border-b border-ink-100 bg-[#f7fbfb] lg:block">
        <div className="container-page flex h-11 items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-5 text-ink-600">
            <span className="inline-flex items-center gap-1.5 font-semibold text-ink-700">
              <MapPin className="h-4 w-4 text-brand-600" />
              Lucknow
            </span>
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.to} to={item.to} className="inline-flex items-center gap-2 hover:text-brand-700">
                  {Icon ? <Icon className="h-4 w-4" /> : null}
                  {item.label}
                </Link>
              );
            })}
          </div>
          <div className="flex items-center gap-5 text-ink-600">
            <span className="inline-flex items-center gap-2 font-medium">
              <Truck className="h-4 w-4 text-brand-600" /> Free pickup in select areas
            </span>
            <span className="font-semibold text-ink-800">Support: +91 98765 43210</span>
          </div>
        </div>
      </div>

      <div className="container-page">
        <nav className="flex h-20 items-center gap-4">
          <Link to="/" className="shrink-0">
            <BrandLogo imageClassName="h-12 w-auto" />
          </Link>

          <div className="hidden items-center gap-2 xl:flex">
            {mainCategories.map((item) => {
              const Icon = item.icon;
              const active = location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}

            <div className="relative">
              <button
                type="button"
                onClick={() => setMoreOpen((value) => !value)}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-ink-600 transition hover:bg-ink-100 hover:text-ink-900"
              >
                More
                <ChevronDown className={`h-4 w-4 transition ${moreOpen ? 'rotate-180' : ''}`} />
              </button>

              {moreOpen && (
                <div className="absolute left-0 top-full mt-3 w-60 rounded-[28px] border border-ink-100 bg-white p-3 shadow-card">
                  {extraLinks.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium text-ink-700 hover:bg-ink-50"
                    >
                      <span>{item.label}</span>
                      {item.note ? (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                          {item.note}
                        </span>
                      ) : null}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <form
            onSubmit={submitSearch}
            className="hidden min-w-0 flex-1 items-center gap-3 rounded-full border border-ink-200 bg-[#f4f8f8] px-4 py-3 lg:flex"
          >
            <Search className="h-4 w-4 shrink-0 text-ink-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search for mobiles, brands, storage or spare parts"
              className="w-full min-w-0 bg-transparent text-sm text-ink-800 outline-none placeholder:text-ink-400"
            />
          </form>

          <div className="hidden items-center gap-3 lg:flex">
            {/* Cart Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setCartOpen((prev) => !prev)}
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-700 transition hover:bg-ink-50 hover:text-brand-700"
                aria-label="View Cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItem ? (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold text-white shadow-sm">
                    {cartItem.quantity || 1}
                  </span>
                ) : null}
              </button>

              {cartOpen && (
                <div className="absolute right-0 top-full mt-3 w-80 rounded-[24px] border border-ink-100 bg-white p-4 shadow-card z-50">
                  <div className="flex items-center justify-between border-b border-ink-100 pb-3 mb-3">
                    <h3 className="font-display font-bold text-base text-ink-900 flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-brand-600" /> Your Cart
                    </h3>
                    {cartItem && (
                      <button
                        type="button"
                        onClick={() => clearCart()}
                        className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" /> Clear
                      </button>
                    )}
                  </div>

                  {cartItem ? (
                    <div className="space-y-3">
                      <div className="flex gap-3 items-center bg-ink-50 p-2.5 rounded-2xl">
                        {cartItem.item.images?.[0] ? (
                          <img
                            src={cartItem.item.images[0]}
                            alt={cartItem.item.title}
                            className="h-14 w-14 object-cover rounded-xl border border-ink-200 shrink-0 bg-white"
                          />
                        ) : (
                          <div className="h-14 w-14 rounded-xl border border-ink-200 bg-white grid place-items-center shrink-0">
                            <ShoppingBag className="h-6 w-6 text-ink-400" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-semibold text-ink-900 truncate">{cartItem.item.title}</h4>
                          <p className="text-xs text-ink-500 font-medium capitalize">{cartItem.type.replace('_', ' ')}</p>
                          <p className="text-sm font-bold text-brand-600 mt-0.5">{formatINR(cartItem.item.price)}</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-ink-100 flex items-center justify-between">
                        <span className="text-xs font-medium text-ink-600">Total Amount</span>
                        <span className="text-base font-bold text-ink-900">
                          {formatINR(cartItem.item.price * (cartItem.quantity || 1))}
                        </span>
                      </div>

                      <Link
                        to="/checkout"
                        onClick={() => setCartOpen(false)}
                        className="btn-primary w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
                      >
                        Proceed to Checkout <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  ) : (
                    <div className="py-6 text-center">
                      <ShoppingBag className="h-10 w-10 text-ink-300 mx-auto mb-2" />
                      <p className="text-sm font-medium text-ink-700">Your cart is empty</p>
                      <p className="text-xs text-ink-500 mt-1">Explore our range of phones and spare parts</p>
                      <Link
                        to="/buy"
                        onClick={() => setCartOpen(false)}
                        className="btn-outline inline-block mt-3 px-4 py-1.5 rounded-full text-xs font-semibold"
                      >
                        Browse Store
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen((value) => !value)}
                  className="flex items-center gap-3 rounded-full border border-ink-200 bg-white px-3 py-2 text-sm font-semibold text-ink-700"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-brand-700">
                    <User className="h-4 w-4" />
                  </span>
                  <span className="max-w-[120px] truncate">{profile?.full_name || user.email?.split('@')[0]}</span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-3 w-56 rounded-[28px] border border-ink-100 bg-white p-3 shadow-card">
                    {authLinks}
                    <button
                      type="button"
                      onClick={() => {
                        signOut();
                        navigate('/');
                      }}
                      className="flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-outline rounded-full px-4 py-2.5 text-sm">
                  Login
                </Link>
                <Link to="/sell" className="btn-primary rounded-full px-5 py-2.5 text-sm">
                  Sell Now
                </Link>
              </>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2 lg:hidden">
            <Link
              to={cartItem ? '/checkout' : '/buy'}
              className="relative grid h-11 w-11 place-items-center rounded-2xl border border-ink-200 bg-white text-ink-700"
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItem ? (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold text-white shadow-sm">
                  {cartItem.quantity || 1}
                </span>
              ) : null}
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen((value) => !value)}
              className="grid h-11 w-11 place-items-center rounded-2xl border border-ink-200 bg-white"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </div>

      {mobileOpen && (
        <div className="border-t border-ink-100 bg-white lg:hidden">
          <div className="container-page py-4">
            <form onSubmit={submitSearch} className="flex items-center gap-2 rounded-full border border-ink-200 bg-[#f4f8f8] px-4 py-3">
              <Search className="h-4 w-4 text-ink-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search phones or parts"
                className="w-full bg-transparent text-sm text-ink-800 outline-none placeholder:text-ink-400"
              />
            </form>

            <div className="mt-4 flex items-center justify-between rounded-2xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-700">
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Lucknow
              </span>
              <span>Free Pickup</span>
            </div>

            <div className="mt-4 grid gap-2">
              {mainCategories.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-ink-700 hover:bg-ink-50"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="mt-4 grid gap-2 border-t border-ink-100 pt-4">
              {[...quickLinks, ...extraLinks].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="rounded-2xl px-4 py-3 text-sm font-medium text-ink-600 hover:bg-ink-50 hover:text-ink-900"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="mt-4 grid gap-2 border-t border-ink-100 pt-4">
              {user ? (
                <>
                  {authLinks}
                  <button
                    type="button"
                    onClick={() => {
                      signOut();
                      navigate('/');
                    }}
                    className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </>
              ) : (
                <div className="flex gap-3">
                  <Link to="/login" className="btn-outline flex-1 rounded-full text-sm">
                    Login
                  </Link>
                  <Link to="/sell" className="btn-primary flex-1 rounded-full text-sm">
                    Sell Now
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
