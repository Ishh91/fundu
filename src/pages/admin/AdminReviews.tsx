import React, { useState } from 'react';
import { MessageSquare, Search, Trash2, CheckCircle2, Star } from 'lucide-react';
import type { Review } from './adminTypes';

type AdminReviewsProps = {
  reviews: Review[];
  selectedReviewId: string | null;
  onSelectReview: (id: string) => void;
  onToggleApproval: (id: string, current: boolean) => void;
  onDeleteReview: (id: string) => void;
};

export default function AdminReviews({
  reviews,
  selectedReviewId,
  onSelectReview,
  onToggleApproval,
  onDeleteReview,
}: AdminReviewsProps) {
  const [search, setSearch] = useState('');

  const filteredReviews = reviews.filter((r) =>
    `${r.reviewer_name || ''} ${r.comment || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const selectedReview = reviews.find((r) => r.id === selectedReviewId) || filteredReviews[0] || null;

  return (
    <div className="space-y-6">
      <div className="card p-6 rounded-[28px] bg-gradient-to-r from-amber-500/10 via-brand-500/10 to-orange-500/10 border border-amber-200/60 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800">
            <MessageSquare className="h-3.5 w-3.5" /> Customer Feedback & Ratings
          </div>
          <h2 className="mt-2 font-display text-2xl font-black text-ink-900">Reviews & Testimonial Moderation</h2>
          <p className="mt-1 text-xs text-ink-600">Approve verified customer feedback for Lucknow buy/sell/repair services.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Reviews List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="card p-3 rounded-2xl bg-white shadow-xs">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-ink-400 shrink-0 ml-1" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reviews by customer or comment..."
                className="w-full text-xs bg-transparent border-none focus:outline-none text-ink-900 font-medium"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto pr-1">
            {filteredReviews.length === 0 ? (
              <div className="card p-8 text-center bg-white">
                <MessageSquare className="h-8 w-8 text-ink-300 mx-auto" />
                <p className="text-xs font-bold text-ink-700 mt-2">No reviews found</p>
              </div>
            ) : (
              filteredReviews.map((rv) => {
                const isSelected = selectedReview?.id === rv.id;
                return (
                  <div
                    key={rv.id}
                    onClick={() => onSelectReview(rv.id)}
                    className={`card p-4 rounded-2xl cursor-pointer transition-all ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/60 shadow-md ring-2 ring-brand-500/20'
                        : 'bg-white hover:border-brand-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-sm text-ink-900">{rv.reviewer_name || 'Customer'}</p>
                      <span className="font-bold text-amber-500 text-xs">★ {rv.rating}</span>
                    </div>
                    <p className="text-xs text-ink-500 mt-1 truncate">{rv.comment}</p>
                    <div className="mt-2 flex items-center justify-between text-xs pt-2 border-t border-ink-100/60">
                      <span className={`badge text-[10px] ${rv.is_approved ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {rv.is_approved ? 'Approved' : 'Pending'}
                      </span>
                      <span className="text-ink-400 text-[11px]">{new Date(rv.created_at).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Review Details */}
        <div className="lg:col-span-7 sticky top-6">
          {selectedReview ? (
            <div className="card p-6 md:p-8 rounded-[28px] space-y-6 shadow-sm border border-[#dce5e8] bg-white">
              <div className="flex items-center justify-between pb-4 border-b border-ink-100">
                <div>
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < selectedReview.rating ? 'fill-amber-400 text-amber-400' : 'text-ink-200'}`}
                      />
                    ))}
                  </div>
                  <h2 className="font-display text-2xl font-black text-ink-900 mt-1">
                    {selectedReview.reviewer_name || 'Customer Review'}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleApproval(selectedReview.id, selectedReview.is_approved)}
                    className={`btn text-xs px-3.5 py-1.5 font-bold rounded-xl ${
                      selectedReview.is_approved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {selectedReview.is_approved ? '✓ Approved' : 'Approve Review'}
                  </button>
                  <button
                    onClick={() => onDeleteReview(selectedReview.id)}
                    className="btn-outline text-xs px-2.5 py-1.5 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-ink-50 text-sm text-ink-800 italic leading-relaxed">
                "{selectedReview.comment}"
              </div>
            </div>
          ) : (
            <div className="card p-12 text-center bg-white rounded-[28px] border border-[#dce5e8]">
              <MessageSquare className="h-12 w-12 text-ink-300 mx-auto" />
              <h3 className="font-display text-lg font-bold text-ink-900 mt-3">No Review Selected</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
