import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, Home, Star } from 'lucide-react';
import ReviewModal from '../components/ReviewModal';

export default function OrderSuccess() {
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  return (
    <div className="container-page py-20 text-center">
      <div className="max-w-md mx-auto">
        <div className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-full bg-nature-100 shadow-inner">
          <CheckCircle2 className="h-12 w-12 text-nature-600" />
        </div>
        <span className="inline-block rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
          Lucknow Order Confirmed
        </span>
        <h1 className="font-display font-bold text-3xl text-ink-900 mb-2">Order Placed Successfully!</h1>
        <p className="text-ink-500 mb-6">
          Thank you for your order! Our Lucknow doorstep delivery team is preparing your package.
        </p>

        {/* Review Prompt Banner */}
        <div className="mb-8 p-5 rounded-2xl bg-brand-50 border border-brand-100 text-center">
          <div className="flex justify-center text-amber-400 mb-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="h-4 w-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="text-xs font-bold text-brand-900 uppercase tracking-wider">How was your ordering experience?</p>
          <p className="text-xs text-ink-600 mt-1 mb-3">Help other Lucknow shoppers by rating your service</p>
          <button
            type="button"
            onClick={() => setReviewModalOpen(true)}
            className="btn-primary py-2 px-5 text-xs font-semibold rounded-full shadow-sm"
          >
            Rate & Write a Review
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/dashboard" className="btn-primary flex items-center justify-center gap-2">
            <ShoppingBag className="h-4 w-4" /> View Orders
          </Link>
          <Link to="/" className="btn-outline flex items-center justify-center gap-2">
            <Home className="h-4 w-4" /> Continue Shopping
          </Link>
        </div>
      </div>

      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        defaultServiceType="buy"
      />
    </div>
  );
}
