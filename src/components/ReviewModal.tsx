import { useState } from 'react';
import { Star, X, CheckCircle2, MessageSquarePlus, MapPin } from 'lucide-react';
import { db } from '../lib/db';
import { useAuth } from '../context/AuthContext';
import { LUCKNOW_AREAS } from '../types';

type ReviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  defaultServiceType?: 'buy' | 'sell' | 'repair' | 'spare_parts' | 'general';
  onSuccess?: () => void;
};

export default function ReviewModal({
  isOpen,
  onClose,
  defaultServiceType = 'general',
  onSuccess,
}: ReviewModalProps) {
  const { user, profile } = useAuth();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [serviceType, setServiceType] = useState<'buy' | 'sell' | 'repair' | 'spare_parts' | 'general'>(defaultServiceType);
  const [reviewerName, setReviewerName] = useState(profile?.full_name || user?.email?.split('@')[0] || '');
  const [location, setLocation] = useState('Gomti Nagar, Lucknow');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!comment.trim()) {
      setError('Please write a brief review.');
      return;
    }

    setSubmitting(true);
    setError('');

    const { error: insertErr } = await db.from('reviews').insert({
      service_type: serviceType,
      rating,
      comment: comment.trim(),
      reviewer_name: reviewerName.trim(),
      location: location.trim() || 'Lucknow',
      is_approved: false,
    });

    setSubmitting(false);

    if (insertErr) {
      setError(insertErr.message || 'Failed to submit review. Please try again.');
      return;
    }

    setSubmitted(true);
    if (onSuccess) onSuccess();
  };

  const resetForm = () => {
    setRating(5);
    setComment('');
    setSubmitted(false);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg card p-6 md:p-8 rounded-[32px] shadow-2xl bg-white border border-ink-100">
        <button
          type="button"
          onClick={resetForm}
          className="absolute top-5 right-5 grid h-9 w-9 place-items-center rounded-full bg-ink-50 text-ink-500 hover:bg-ink-100 hover:text-ink-900 transition"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {submitted ? (
          <div className="py-6 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600 mb-4 shadow-inner">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="font-display font-bold text-2xl text-ink-900">Review Submitted!</h3>
            <p className="mt-2 text-sm text-ink-600 leading-relaxed max-w-sm mx-auto">
              Thank you for sharing your experience! Your review has been sent to our admin team for verification and will appear on the website shortly.
            </p>
            <button
              type="button"
              onClick={resetForm}
              className="btn-primary mt-6 rounded-full px-6 py-2.5 text-sm"
            >
              Close
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                <MessageSquarePlus className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-ink-900">Share Your Experience</h3>
                <p className="text-xs text-ink-500">Review Fundu Lucknow services</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-2xl bg-accent-50 p-3 text-xs font-semibold text-accent-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Service type selector */}
              <div>
                <label className="block text-xs font-bold text-ink-700 uppercase tracking-wider mb-1.5">
                  Service Used
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'buy', label: 'Buy Phone' },
                    { id: 'sell', label: 'Sell Phone' },
                    { id: 'repair', label: 'Doorstep Repair' },
                    { id: 'spare_parts', label: 'Spare Parts' },
                    { id: 'general', label: 'General Experience' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setServiceType(s.id as any)}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold transition text-center truncate ${
                        serviceType === s.id
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'bg-ink-50 text-ink-600 hover:bg-ink-100'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Star Rating */}
              <div>
                <label className="block text-xs font-bold text-ink-700 uppercase tracking-wider mb-1.5">
                  Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 text-amber-400 hover:scale-110 transition"
                    >
                      <Star
                        className={`h-7 w-7 ${
                          star <= (hoverRating || rating) ? 'fill-amber-400 text-amber-400' : 'text-ink-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm font-bold text-ink-800">
                    {rating} / 5 Star{rating > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Reviewer Name */}
              <div>
                <label className="block text-xs font-bold text-ink-700 uppercase tracking-wider mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full rounded-xl border border-ink-200 bg-ink-50/50 px-3.5 py-2.5 text-sm text-ink-900 outline-none focus:border-brand-500 focus:bg-white"
                  required
                />
              </div>

              {/* Location in Lucknow */}
              <div>
                <label className="block text-xs font-bold text-ink-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-brand-600" /> Lucknow Locality
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-xl border border-ink-200 bg-ink-50/50 px-3.5 py-2.5 text-sm text-ink-900 outline-none focus:border-brand-500 focus:bg-white"
                >
                  {LUCKNOW_AREAS.map((area) => (
                    <option key={area} value={`${area}, Lucknow`}>
                      {area}, Lucknow
                    </option>
                  ))}
                </select>
              </div>

              {/* Review Comment */}
              <div>
                <label className="block text-xs font-bold text-ink-700 uppercase tracking-wider mb-1">
                  Your Review
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us about your experience with pickup, pricing, or repair in Lucknow..."
                  rows={4}
                  className="w-full rounded-xl border border-ink-200 bg-ink-50/50 px-3.5 py-2.5 text-sm text-ink-900 outline-none focus:border-brand-500 focus:bg-white resize-none"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-outline py-2.5 px-4 text-xs rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary py-2.5 px-6 text-xs rounded-full disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
