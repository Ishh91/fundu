import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, MapPin, Phone, User, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { DOORSTEP_AREAS } from '../types';
import { formatINR } from '../lib/db';
import { getCleanPhoneImage } from '../lib/phoneImages';

export default function Checkout() {
  const { cartItems, totalAmount, totalItems, updateQuantity, removeFromCart, setDeliveryDetails } = useCart();
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    area: ''
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login?redirect=/checkout');
    }
    if (cartItems.length === 0) {
      navigate('/buy');
    }
    if (profile) {
      setForm(prev => ({
        ...prev,
        name: profile.full_name || '',
        phone: profile.phone || ''
      }));
    }
  }, [user, loading, cartItems.length, navigate, profile]);

  if (cartItems.length === 0) return null;

  if (profile && profile.role !== 'customer') {
    return (
      <div className="container-page py-16 max-w-xl mx-auto text-center">
        <div className="card p-8 rounded-3xl border border-amber-200 bg-amber-50/60 shadow-soft">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-amber-100 text-amber-700 text-2xl font-bold mb-4">
            ⚠️
          </div>
          <h2 className="font-display text-2xl font-extrabold text-ink-900 mb-2">
            Order Access Restricted
          </h2>
          <p className="text-sm text-ink-600 mb-6 leading-relaxed">
            You are logged in as <span className="font-bold text-ink-900 uppercase">{profile.role}</span>. Only customer accounts can place orders or buy services. Vendor, Delivery, Wholesaler, and Admin accounts cannot place customer orders.
          </p>
          <div className="flex justify-center gap-3">
            <button onClick={() => navigate(-1)} className="btn-outline">
              Go Back
            </button>
            <button
              onClick={() =>
                navigate(
                  profile.role === 'admin'
                    ? '/admin'
                    : profile.role === 'delivery' || profile.role === 'rider'
                    ? '/delivery'
                    : '/vendor'
                )
              }
              className="btn-primary"
            >
              Go to {profile.role.toUpperCase()} Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDeliveryDetails(form);
    navigate('/payment');
  };

  return (
    <div className="container-page py-10">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-ink-600 hover:text-ink-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-20">
            <h2 className="font-display font-bold text-xl text-ink-900 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-[#344257]" /> Order Summary
              </span>
              <span className="text-xs font-bold text-[#6A859F] bg-[#F0F0F5] px-2.5 py-1 rounded-full">
                {totalItems} item{totalItems > 1 ? 's' : ''}
              </span>
            </h2>

            <div className="border-b border-ink-200 pb-4 mb-4 space-y-3 max-h-80 overflow-y-auto pr-1 divide-y divide-gray-100">
              {cartItems.map((ci) => {
                const itemImg = ci.item.images?.[0] || (ci.item as any).image;
                const brand = (ci.item as any).brand || '';
                const variant = [(ci.item as any).storage, (ci.item as any).condition].filter(Boolean).join(' • ');

                return (
                  <div key={ci.id} className="pt-3 first:pt-0 flex gap-3 items-center">
                    {itemImg ? (
                      <img
                        src={getCleanPhoneImage(brand, ci.item.title, itemImg)}
                        alt={ci.item.title}
                        className="w-16 h-16 object-contain rounded-lg bg-gray-50 p-1 border border-gray-200 shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-ink-100 rounded-lg grid place-items-center shrink-0">
                        <ShoppingCart className="h-6 w-6 text-ink-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h3 className="font-semibold text-xs text-ink-900 truncate">{ci.item.title}</h3>
                        <button
                          type="button"
                          onClick={() => removeFromCart(ci.id)}
                          className="text-gray-400 hover:text-rose-600 text-[11px] cursor-pointer ml-1"
                          title="Remove item"
                        >
                          ✕
                        </button>
                      </div>
                      {variant && <p className="text-[10px] text-ink-500 truncate">{variant}</p>}
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-bold text-xs text-ink-900">
                          {formatINR(ci.item.price)}
                        </span>
                        {/* Quantity Counter */}
                        <div className="flex items-center gap-1.5 bg-[#F0F0F5] border border-[#C0C8D8] rounded-md px-1.5 py-0.5">
                          <button
                            type="button"
                            onClick={() => updateQuantity(ci.id, ci.quantity - 1)}
                            className="text-xs font-bold text-[#344257] hover:text-black w-3.5 h-3.5 grid place-items-center cursor-pointer"
                          >
                            -
                          </button>
                          <span className="text-xs font-extrabold text-[#344257] min-w-3 text-center">
                            {ci.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(ci.id, ci.quantity + 1)}
                            className="text-xs font-bold text-[#344257] hover:text-black w-3.5 h-3.5 grid place-items-center cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-600">Subtotal</span>
                <span className="font-semibold text-ink-900">{formatINR(totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-600">Doorstep Delivery</span>
                <span className="font-semibold text-emerald-600">Free</span>
              </div>
              <div className="border-t border-ink-200 pt-2 flex justify-between font-bold text-lg">
                <span className="text-ink-900">Total Payable</span>
                <span className="text-brand-600">{formatINR(totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Details Form */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <h2 className="font-display font-bold text-xl text-ink-900 mb-6">Delivery Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label flex items-center gap-2">
                  <User className="h-4 w-4" /> Full Name
                </label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="input"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="label flex items-center gap-2">
                  <Phone className="h-4 w-4" /> Phone Number
                </label>
                <input
                  required
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="input"
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <label className="label flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Area
                </label>
                <select
                  required
                  value={form.area}
                  onChange={(e) => setForm(prev => ({ ...prev, area: e.target.value }))}
                  className="input"
                >
                  <option value="">Select your area at your doorstep</option>
                  {DOORSTEP_AREAS.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Complete Address
                </label>
                <textarea
                  required
                  value={form.address}
                  onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))}
                  className="input min-h-[100px]"
                  placeholder="House no, street, landmark, etc."
                />
              </div>
              <button
                type="submit"
                className="btn-primary w-full mt-6"
              >
                Continue to Payment <CheckCircle2 className="h-4 w-4 ml-2" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
