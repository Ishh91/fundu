import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Wallet, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { db, formatINR } from '../lib/db';

type RazorpayResponse = {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
};

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

export default function Payment() {
  const { cartItem, deliveryDetails, clearCart } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay' | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/payment');
    }
    if (!cartItem || !deliveryDetails) {
      navigate('/checkout');
    }
  }, [user, cartItem, deliveryDetails, navigate]);

  if (!cartItem || !deliveryDetails) return null;

  const createOrder = async (paymentMethod: 'cod' | 'razorpay', paymentStatus: string = 'pending') => {
    setLoading(true);
    try {
      const orderData = {
        user_id: user?.id,
        customer_name: deliveryDetails.name || profile?.full_name || null,
        customer_phone: deliveryDetails.phone || profile?.phone || null,
        customer_email: user?.email || null,
        product_id: cartItem.type === 'product' ? cartItem.item.id : null,
        spare_part_id: cartItem.type === 'spare_part' ? cartItem.item.id : null,
        quantity: cartItem.quantity,
        total_amount: cartItem.item.price,
        status: 'pending',
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        delivery_address: `${deliveryDetails.address}, ${deliveryDetails.area}`,
        delivery_area: deliveryDetails.area,
        delivery_name: deliveryDetails.name,
        delivery_phone: deliveryDetails.phone
      };

      const { error } = await db
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (error) throw error;

      clearCart();
      navigate('/order-success');
    } catch (err) {
      console.error('Error creating order:', err);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCOD = () => {
    setPaymentMethod('cod');
    createOrder('cod', 'pending');
  };

  const handleRazorpay = async () => {
    setPaymentMethod('razorpay');
    setLoading(true);
    try {
      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag', // Replace with your key
          amount: cartItem.item.price * 100, // Amount in paise
          currency: 'INR',
          name: 'Fundu',
          description: `Purchase of ${cartItem.item.title}`,
          handler: function (response: RazorpayResponse) {
            console.log('Payment success:', response);
            createOrder('razorpay', 'paid');
          },
          prefill: {
            name: deliveryDetails.name,
            email: user?.email || '',
            contact: deliveryDetails.phone
          },
          theme: {
            color: '#4f46e5'
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      };
      document.body.appendChild(script);
    } catch (err) {
      console.error('Error initializing Razorpay:', err);
      alert('Failed to initialize payment. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="container-page py-10 max-w-2xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-ink-600 hover:text-ink-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Checkout
      </button>

      <div className="card p-6">
        <h1 className="font-display font-bold text-2xl text-ink-900 mb-2">Select Payment Method</h1>
        <p className="text-ink-500 mb-6">Total Amount: <span className="font-bold text-brand-600">{formatINR(cartItem.item.price)}</span></p>

        <div className="space-y-4">
          {/* COD Option */}
          <button
            onClick={handleCOD}
            disabled={loading}
            className={`w-full p-4 border-2 rounded-xl text-left transition-all flex items-center gap-4 ${
              paymentMethod === 'cod' ? 'border-brand-500 bg-brand-50' : 'border-ink-200 bg-ink-100/60 hover:border-ink-300 hover:bg-ink-200/70'
            }`}
          >
            <div className="w-12 h-12 bg-nature-100 rounded-lg grid place-items-center">
              <Wallet className="h-6 w-6 text-nature-600" />
            </div>
            <div>
              <h3 className="font-bold text-ink-900">Cash on Delivery</h3>
              <p className="text-sm text-ink-500">Pay when you receive your order</p>
            </div>
          </button>

          {/* Razorpay Option */}
          <button
            onClick={handleRazorpay}
            disabled={loading}
            className={`w-full p-4 border-2 rounded-xl text-left transition-all flex items-center gap-4 ${
              paymentMethod === 'razorpay' ? 'border-brand-500 bg-brand-50' : 'border-ink-200 bg-ink-100/60 hover:border-ink-300 hover:bg-ink-200/70'
            }`}
          >
            <div className="w-12 h-12 bg-brand-100 rounded-lg grid place-items-center">
              <CreditCard className="h-6 w-6 text-brand-600" />
            </div>
            <div>
              <h3 className="font-bold text-ink-900">Pay Online</h3>
              <p className="text-sm text-ink-500">UPI, Credit/Debit Card, Netbanking</p>
            </div>
          </button>
        </div>

        {loading && (
          <div className="mt-6 flex items-center justify-center gap-2 text-ink-600">
            <Loader2 className="h-5 w-5 animate-spin" /> Processing...
          </div>
        )}
      </div>
    </div>
  );
}
