import React, { useState, useEffect } from 'react';
import {
  Bed, CheckCircle2, AlertCircle, Wallet as WalletIcon, Clock,
  ArrowRight, Star, MessageSquare, X, ShieldCheck
} from 'lucide-react';
import { Booking } from '../types';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export const BookingsPage: React.FC = () => {
  const { isAuthenticated, openAuthModal, walletBalance, refreshWallet } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [completingId, setCompletingId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Review Modal State
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');

  const fetchBookings = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await api.getBookings();
      if (res?.bookings) setBookings(res.bookings);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchBookings();
    else setLoading(false);
  }, [isAuthenticated]);

  const handlePayFromWallet = async (booking: Booking) => {
    setError('');
    setMessage('');
    setPayingId(booking.id);

    try {
      const res = await api.payBookingViaWallet(booking.id);
      setMessage(`Booking #${booking.booking_reference} confirmed and paid from Trip Wallet!`);
      await fetchBookings();
      await refreshWallet();
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please check wallet balance.');
    } finally {
      setPayingId(null);
    }
  };

  const handleCompleteTrip = async (booking: Booking) => {
    setError('');
    setMessage('');
    setCompletingId(booking.id);

    try {
      await api.completeBooking(booking.id);
      setMessage(`Trip #${booking.booking_reference} marked as completed! You are now authorized to post verified reviews.`);
      await fetchBookings();
    } catch (err: any) {
      setError(err.message || 'Could not update trip completion status.');
    } finally {
      setCompletingId(null);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBooking) return;
    setReviewSubmitting(true);
    setReviewError('');
    setReviewSuccess('');

    try {
      await api.createReview({
        rating: reviewRating,
        title: reviewTitle,
        body: reviewBody,
      });

      setReviewSuccess('Your verified traveler review has been recorded!');
      setTimeout(() => {
        setReviewBooking(null);
        setReviewTitle('');
        setReviewBody('');
        setReviewSuccess('');
      }, 2000);
    } catch (err: any) {
      setReviewError(err.message || 'Only authorized travelers who completed a booking can submit a review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-ivory-100 text-charcoal-500 flex items-center justify-center mx-auto">
          <Bed className="w-6 h-6 stroke-[1.5]" />
        </div>
        <h2 className="font-serif text-2xl font-medium text-charcoal-900">Your Travel Bookings</h2>
        <p className="text-xs text-charcoal-500 leading-relaxed font-light">
          Sign in to review confirmed reservations and complete payment from your Trip Wallet.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-6 py-2.5 rounded-full bg-forest-800 text-ivory-50 text-xs font-semibold hover:bg-forest-900 transition-colors shadow-soft"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

      {/* Title */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-forest-800 block mb-1">Reservations & Journey Logs</span>
        <h1 className="font-serif text-3xl sm:text-5xl font-medium text-charcoal-900">
          My Bookings
        </h1>
        <p className="text-sm text-charcoal-500 mt-2 font-light">
          Track travel reservations, mark completed journeys, and leave authorized traveler reviews for stays and guides.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200 text-forest-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-sage-600 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-terracotta-50 border border-terracotta-200 text-terracotta-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-terracotta-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Bookings List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-40 rounded-3xl bg-ivory-200 animate-pulse"></div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-charcoal-100 p-8 space-y-4 shadow-soft-sm">
            <Bed className="w-10 h-10 text-charcoal-300 mx-auto" />
            <h3 className="font-serif text-xl font-medium text-charcoal-900">No active reservations</h3>
            <p className="text-xs text-charcoal-500 font-light max-w-sm mx-auto">
              Explore boutique stays or build an AI concierge itinerary to initiate your first booking.
            </p>
            <Link
              to="/stays"
              className="inline-block px-6 py-2.5 rounded-full bg-forest-800 text-white text-xs font-semibold hover:bg-forest-900 transition-colors shadow-soft"
            >
              Discover Stays
            </Link>
          </div>
        ) : (
          bookings.map(booking => {
            const isPaid = booking.payment_status === 'paid';
            const isCompleted = booking.status === 'completed';
            const isPaying = payingId === booking.id;
            const isCompleting = completingId === booking.id;

            return (
              <div
                key={booking.id}
                className="bg-white rounded-3xl border border-charcoal-100 p-6 sm:p-8 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-charcoal-900 bg-ivory-100 px-2.5 py-0.5 rounded-md">
                      #{booking.booking_reference}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isCompleted
                        ? 'bg-purple-100 text-purple-900'
                        : isPaid
                        ? 'bg-sage-100 text-forest-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {isCompleted ? 'Trip Completed' : booking.status}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      isPaid ? 'bg-sage-50 text-forest-800' : 'bg-charcoal-100 text-charcoal-600'
                    }`}>
                      Payment: {booking.payment_status}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-medium text-charcoal-900">
                    Boutique Stay & Concierge Journey Reservation
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-charcoal-400">
                    <span>{booking.travelers_count} Traveler(s)</span>
                    <span>•</span>
                    <span>Booked {new Date(booking.booked_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 border-t sm:border-t-0 border-charcoal-100/70 pt-4 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-charcoal-400 uppercase tracking-wider block">Total Amount</span>
                    <span className="font-serif text-2xl font-bold text-charcoal-900">
                      ₹{booking.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {!isPaid ? (
                      <button
                        onClick={() => handlePayFromWallet(booking)}
                        disabled={isPaying}
                        className="px-5 py-2.5 rounded-full bg-forest-800 hover:bg-forest-900 text-ivory-50 text-xs font-semibold flex items-center gap-2 shadow-soft transition-all disabled:opacity-50"
                      >
                        <WalletIcon className="w-3.5 h-3.5 text-sage-300" />
                        <span>{isPaying ? 'Processing...' : 'Pay from Wallet'}</span>
                      </button>
                    ) : !isCompleted ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-sage-50 text-forest-800 text-xs font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-sage-600" />
                          <span>Confirmed</span>
                        </span>
                        <button
                          onClick={() => handleCompleteTrip(booking)}
                          disabled={isCompleting}
                          className="px-4 py-1.5 rounded-full bg-charcoal-900 hover:bg-forest-800 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                          title="Mark trip completed once your journey ends to authorize hotel & guide review"
                        >
                          {isCompleting ? 'Updating...' : 'Mark Trip Completed'}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-purple-50 text-purple-900 text-xs font-semibold">
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                          <span>Verified Completed</span>
                        </span>
                        <button
                          onClick={() => setReviewBooking(booking)}
                          className="px-4 py-1.5 rounded-full bg-forest-800 hover:bg-forest-900 text-white text-xs font-semibold flex items-center gap-1.5 shadow-soft"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                          <span>Write Review</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Review Modal for Completed Journey */}
      {reviewBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 space-y-5 shadow-float">
            <button
              onClick={() => setReviewBooking(null)}
              className="absolute top-6 right-6 p-2 rounded-full text-charcoal-400 hover:text-charcoal-800 hover:bg-ivory-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-forest-800 bg-sage-100 px-2.5 py-0.5 rounded-full">
                Authorized Traveler Review
              </span>
              <h3 className="font-serif text-2xl font-medium text-charcoal-900 mt-1">
                Review Your Completed Stay & Experience
              </h3>
              <p className="text-xs text-charcoal-500 font-light">
                Verified booking #{reviewBooking.booking_reference}. Your honest appraisal guides future travelers.
              </p>
            </div>

            {reviewSuccess && (
              <div className="p-3 rounded-xl bg-sage-50 text-forest-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sage-600" />
                <span>{reviewSuccess}</span>
              </div>
            )}

            {reviewError && (
              <div className="p-3 rounded-xl bg-terracotta-50 text-terracotta-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-terracotta-600 flex-shrink-0" />
                <span>{reviewError}</span>
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-1">
                  Overall Rating
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-charcoal-300'}`}
                      />
                    </button>
                  ))}
                  <span className="text-sm font-bold text-charcoal-800 ml-2">{reviewRating} / 5</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-1">
                  Headline
                </label>
                <input
                  type="text"
                  required
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="e.g. Unforgettable boutique retreat and top-tier guiding"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-charcoal-200 outline-none focus:border-forest-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-1">
                  Your Review Comments
                </label>
                <textarea
                  rows={4}
                  required
                  value={reviewBody}
                  onChange={(e) => setReviewBody(e.target.value)}
                  placeholder="Tell us about the property comfort, amenities, guide punctuality, and highlights..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-charcoal-200 outline-none focus:border-forest-800"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setReviewBooking(null)}
                  className="px-5 py-2 rounded-full border border-charcoal-200 text-charcoal-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="px-6 py-2 rounded-full bg-forest-800 hover:bg-forest-900 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {reviewSubmitting ? 'Submitting...' : 'Post Verified Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
