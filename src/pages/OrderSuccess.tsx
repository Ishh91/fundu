import { Link } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, Home } from 'lucide-react';

export default function OrderSuccess() {
  return (
    <div className="container-page py-20 text-center">
      <div className="max-w-md mx-auto">
        <div className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-full bg-nature-100">
          <CheckCircle2 className="h-12 w-12 text-nature-600" />
        </div>
        <h1 className="font-display font-bold text-3xl text-ink-900 mb-2">Order Placed Successfully!</h1>
        <p className="text-ink-500 mb-8">
          Thank you for your order! We'll process it and deliver it to you soon.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/dashboard" className="btn-primary flex items-center justify-center gap-2">
            <ShoppingBag className="h-4 w-4" /> View Orders
          </Link>
          <Link to="/" className="btn-outline flex items-center justify-center gap-2">
            <Home className="h-4 w-4" /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
