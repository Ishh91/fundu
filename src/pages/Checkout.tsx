import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, MapPin, Phone, User, CheckCircle2, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../lib/db';
import { getCleanPhoneImage } from '../lib/phoneImages';
import { verifyPanIndiaPincode, type VerifiedLocation } from '../lib/locationService';

export default function Checkout() {
  const { cartItems, totalAmount, totalItems, updateQuantity, removeFromCart, setDeliveryDetails } = useCart();
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    pincode: '',
    locality: '',
    address: '',
    area: '',
    city: '',
    state: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [verifyingPin, setVerifyingPin] = useState(false);
  const [verifiedLocation, setVerifiedLocation] = useState<VerifiedLocation | null>(null);
  const [pincodeError, setPincodeError] = useState<string | null>(null);

  // Auto-verify location when customer types complete 6-digit Pincode
  const handlePincodeVerify = async (codeToVerify: string) => {
    const clean = codeToVerify.replace(/\D/g, '').slice(0, 6);
    if (clean.length !== 6) {
      setVerifiedLocation(null);
      setPincodeError(null);
      return;
    }

    setVerifyingPin(true);
    setPincodeError(null);
    try {
      const res = await verifyPanIndiaPincode(clean);
      if (res.valid) {
        setVerifiedLocation(res);
        setPincodeError(null);
        setForm((prev) => ({
          ...prev,
          city: res.city,
          state: res.state,
          area: `${res.city}, ${res.state} (${res.pincode})`,
        }));
      } else {
        setVerifiedLocation(null);
        setPincodeError(res.error || 'Pincode not recognized in Indian postal database.');
      }
    } catch (_err) {
      setPincodeError('Could not verify PIN code. Please check your network and try again.');
    } finally {
      setVerifyingPin(false);
    }
  };

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
        name: prev.name || profile.full_name || '',
        phone: prev.phone || profile.phone || '',
        address: prev.address || profile.address || '',
        area: prev.area || (profile as any).city || profile.vendor_location || '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanPhone = form.phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setFormError('⚠️ Please enter a valid 10-digit Indian phone number.');
      return;
    }

    const cleanPincode = form.pincode.replace(/\D/g, '');
    if (cleanPincode.length !== 6) {
      setFormError('⚠️ Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    // Strict Pan-India Location Verification check before moving to next step
    let activeVerified = verifiedLocation;
    if (!activeVerified || !activeVerified.valid || activeVerified.pincode !== cleanPincode) {
      setVerifyingPin(true);
      const res = await verifyPanIndiaPincode(cleanPincode);
      setVerifyingPin(false);
      if (!res.valid) {
        setFormError(res.error || '⚠️ Please enter a verified Pan-India delivery PIN code.');
        setPincodeError(res.error || 'Invalid PIN code');
        return;
      }
      activeVerified = res;
      setVerifiedLocation(res);
      setForm((prev) => ({
        ...prev,
        city: res.city,
        state: res.state,
        area: `${res.city}, ${res.state} (${res.pincode})`,
      }));
    }

    if (!form.locality.trim()) {
      setFormError('⚠️ Please provide your locality / colony / sector.');
      return;
    }

    if (!form.address.trim()) {
      setFormError('⚠️ Please provide complete house/street address.');
      return;
    }

    setDeliveryDetails({
      ...form,
      phone: cleanPhone,
      pincode: cleanPincode,
      area: activeVerified?.displayLabel || `${activeVerified?.city}, ${activeVerified?.state} (${cleanPincode})`,
    });
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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/buy')}
                  className="text-xs font-bold text-[#344257] hover:underline cursor-pointer"
                >
                  + Add More
                </button>
                <span className="text-xs font-bold text-[#6A859F] bg-[#F0F0F5] px-2.5 py-1 rounded-full">
                  {totalItems} item{totalItems > 1 ? 's' : ''}
                </span>
              </div>
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

            <div className="mb-4">
              <button
                type="button"
                onClick={() => navigate('/buy')}
                className="w-full py-2 rounded-xl text-xs font-bold text-[#344257] bg-[#F0F0F5] hover:bg-[#E4E7F0] border border-[#C0C8D8] flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                + Add More Phones to Cart
              </button>
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
            <h2 className="font-display font-bold text-xl text-ink-900 mb-1">Delivery Details</h2>
            <p className="text-xs text-ink-500 mb-6">Enter your contact and doorstep address for safe delivery & verification</p>

            {formError && (
              <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-center gap-2">
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label flex items-center gap-2 text-xs font-bold text-gray-700">
                    <User className="h-4 w-4 text-[#344257]" /> Full Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    className="input text-sm"
                    placeholder="e.g. Rahul Sharma"
                  />
                </div>
                <div>
                  <label className="label flex items-center gap-2 text-xs font-bold text-gray-700">
                    <Phone className="h-4 w-4 text-[#344257]" /> Phone Number *
                  </label>
                  <input
                    required
                    type="tel"
                    maxLength={10}
                    value={form.phone}
                    onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                    className="input text-sm"
                    placeholder="10-digit mobile number"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">Delivery updates will be sent via SMS / WhatsApp</span>
                </div>
              </div>

              {/* Pan-India Pincode with Auto-Verification */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="label flex items-center gap-2 text-xs font-bold text-gray-700">
                    <MapPin className="h-4 w-4 text-[#344257]" /> Delivery Pincode (PIN Code) *
                  </label>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Pan-India Verified Delivery
                  </span>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      required
                      type="text"
                      maxLength={6}
                      value={form.pincode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setForm((prev) => ({ ...prev, pincode: val }));
                        if (val.length === 6) {
                          handlePincodeVerify(val);
                        } else {
                          setVerifiedLocation(null);
                          setPincodeError(null);
                        }
                      }}
                      className={`input text-sm font-semibold tracking-wider ${
                        verifiedLocation?.valid
                          ? 'border-emerald-500 bg-emerald-50/20 text-gray-900 focus:border-emerald-600 focus:ring-emerald-500/20'
                          : pincodeError
                          ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:border-rose-500'
                          : ''
                      }`}
                      placeholder="Enter 6-digit Pincode (e.g. 473001, 226001, 110001)"
                    />
                    {verifyingPin && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[11px] text-[#344257] font-semibold">
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Verifying...</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePincodeVerify(form.pincode)}
                    disabled={verifyingPin || form.pincode.length !== 6}
                    className="btn-outline px-4 text-xs font-bold shrink-0 disabled:opacity-40"
                  >
                    {verifyingPin ? 'Checking...' : 'Verify PIN'}
                  </button>
                </div>

                {/* Verified Location Card Badge */}
                {verifiedLocation?.valid && (
                  <div className="mt-2.5 rounded-xl bg-emerald-50/90 border border-emerald-200 p-3 text-xs text-emerald-950 flex items-start gap-2.5 shadow-2xs animate-in fade-in">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-extrabold text-emerald-900 text-xs">
                        ✓ Serviceable: {verifiedLocation.city}, {verifiedLocation.state} (PIN: {verifiedLocation.pincode})
                      </p>
                      <p className="text-[11px] text-emerald-700 mt-0.5">
                        Free doorstep delivery available in {verifiedLocation.district || verifiedLocation.city} with live tracking.
                      </p>
                    </div>
                  </div>
                )}

                {/* Pincode Error Banner */}
                {pincodeError && (
                  <div className="mt-2 rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-800 flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                    <span>{pincodeError}</span>
                  </div>
                )}
              </div>

              {/* Locality with Auto-Suggestions from Post Offices */}
              <div>
                <label className="label flex items-center gap-2 text-xs font-bold text-gray-700">
                  <MapPin className="h-4 w-4 text-[#344257]" /> Locality / Sector / Area / Landmark *
                </label>
                <input
                  required
                  type="text"
                  value={form.locality}
                  onChange={(e) => setForm((prev) => ({ ...prev, locality: e.target.value }))}
                  className="input text-sm"
                  placeholder="e.g. Bazar Road, Cantt Area, Sector 4, Near Clock Tower"
                />

                {/* Quick Post Office Chips if Available */}
                {verifiedLocation?.postOffices && verifiedLocation.postOffices.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5 items-center">
                    <span className="text-[10px] text-gray-500 font-semibold">Postal Areas:</span>
                    {verifiedLocation.postOffices.slice(0, 6).map((po) => (
                      <button
                        key={po}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, locality: po }))}
                        className={`text-[10px] px-2 py-0.5 rounded-md border transition ${
                          form.locality === po
                            ? 'bg-[#344257] text-white border-[#344257]'
                            : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-200'
                        }`}
                      >
                        {po}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Complete Street Address */}
              <div>
                <label className="label flex items-center gap-2 text-xs font-bold text-gray-700">
                  <MapPin className="h-4 w-4 text-[#344257]" /> Complete Doorstep Address *
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.address}
                  onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                  className="input min-h-[85px] text-sm"
                  placeholder="Flat / House No., Apartment / Building Name, Street / Road, Near Landmark"
                />
              </div>

              {/* City & State (Auto-Populated from Verified Pincode) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="label text-xs font-bold text-gray-600">City / District</label>
                  <input
                    type="text"
                    readOnly
                    value={verifiedLocation?.city || form.city || 'Verified upon PIN entry'}
                    className="input text-xs bg-gray-50 text-gray-700 cursor-not-allowed font-semibold"
                  />
                </div>
                <div>
                  <label className="label text-xs font-bold text-gray-600">State</label>
                  <input
                    type="text"
                    readOnly
                    value={verifiedLocation?.state || form.state || 'Verified upon PIN entry'}
                    className="input text-xs bg-gray-50 text-gray-700 cursor-not-allowed font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={verifyingPin || !verifiedLocation?.valid}
                className="btn-primary w-full mt-6 py-3 text-sm font-extrabold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verifyingPin ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Verifying Delivery Location...
                  </>
                ) : !verifiedLocation?.valid ? (
                  <>
                    <MapPin className="h-4 w-4" /> Verify PIN Code to Continue
                  </>
                ) : (
                  <>
                    Continue to Payment <CheckCircle2 className="h-4 w-4 ml-1" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
