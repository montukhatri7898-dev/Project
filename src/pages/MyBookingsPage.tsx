import React, { useState, useEffect } from 'react';
import { Ticket, Film, Calendar, Clock, MapPin, X, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { Booking } from '../types/index.js';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';

interface MyBookingsPageProps {
  onNavigate: (view: string, params?: any) => void;
}

export const MyBookingsPage: React.FC<MyBookingsPageProps> = ({ onNavigate }) => {
  const { user, openAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const [bookingsData, setBookingsData] = useState<{
    all: Booking[];
    upcoming: Booking[];
    completed: Booking[];
    cancelled: Booking[];
  }>({ all: [], upcoming: [], completed: [], cancelled: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cancellation Modal State
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('Change of schedule');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Ticket Modal State
  const [selectedTicket, setSelectedTicket] = useState<Booking | null>(null);

  useEffect(() => {
    if (user) {
      loadBookings();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getMyBookings();
      if (res.success) {
        setBookingsData(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCancelModal = async (b: Booking) => {
    try {
      const res = await api.getBooking(b._id);
      if (res.success) {
        setCancellingBooking(res.data);
        setCancelError(null);
      }
    } catch (e: any) {
      setCancelError(e.message || 'Unable to evaluate cancellation eligibility.');
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancellingBooking) return;
    try {
      setCancelling(true);
      setCancelError(null);
      const res = await api.cancelBooking(cancellingBooking._id, cancelReason);
      if (res.success) {
        setCancellingBooking(null);
        await loadBookings();
      }
    } catch (err: any) {
      setCancelError(err.message || 'Cancellation failed.');
    } finally {
      setCancelling(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-gray-400">
          <Ticket className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white">Sign In to View Your Tickets</h2>
        <p className="text-xs text-gray-400">
          Access your digital admission passes, upcoming showtimes, and booking receipts.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  const currentList = bookingsData[activeTab] || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Ticket className="w-6 h-6 text-red-500" />
          My Movie Bookings & Tickets
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Manage your confirmed digital tickets, upcoming showtimes, and refund requests
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {[
          { id: 'upcoming', label: `Upcoming (${bookingsData.upcoming.length})` },
          { id: 'completed', label: `Completed (${bookingsData.completed.length})` },
          { id: 'cancelled', label: `Cancelled (${bookingsData.cancelled.length})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`pb-3 px-5 text-xs font-semibold transition-colors border-b-2 cursor-pointer ${
              activeTab === t.id
                ? 'border-red-500 text-white'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white/5 rounded-xl h-36 border border-white/5" />
          ))}
        </div>
      ) : currentList.length === 0 ? (
        <div className="py-20 text-center bg-[#14161D] border border-white/10 rounded-xl p-8">
          <Ticket className="w-10 h-10 text-gray-500 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white">No {activeTab} bookings</h3>
          <p className="text-xs text-gray-400 mt-1">Browse trending movies and pick your favorite seats.</p>
          <button
            onClick={() => onNavigate('movies')}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium cursor-pointer"
          >
            Explore Movies
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {currentList.map((booking) => {
            const showDate = new Date(booking.showTime);
            return (
              <div
                key={booking._id}
                className="p-5 sm:p-6 rounded-xl bg-[#14161D] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-white/20 transition-all"
              >
                {/* Left Side: Poster & Info */}
                <div className="flex items-start gap-4">
                  <img
                    src={booking.movieSnapshot.posterUrl}
                    alt={booking.movieSnapshot.title}
                    className="w-16 h-24 object-cover rounded-lg bg-[#0B0C10] border border-white/10 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-gray-400">
                        Ref: #{booking.bookingReference}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${
                          booking.bookingStatus === 'confirmed'
                            ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/30'
                            : booking.bookingStatus === 'cancelled'
                            ? 'bg-red-950/50 text-red-300 border border-red-500/30'
                            : 'bg-amber-950/50 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {booking.bookingStatus}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white mb-1">{booking.movieSnapshot.title}</h3>
                    <p className="text-xs text-gray-400">
                      {booking.theatreSnapshot.name} · {booking.theatreSnapshot.screenName}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-gray-300 mt-2 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-red-500" />
                      <span>{showDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span aria-hidden="true">·</span>
                      <Clock className="w-3.5 h-3.5 text-red-500" />
                      <span>{showDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Seats & Actions */}
                <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between w-full md:w-auto gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-white/5">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Seats & Total</span>
                    <div className="flex flex-wrap gap-1 mt-0.5 md:justify-end">
                      {booking.selectedSeats.map((s) => (
                        <span
                          key={s.seatId}
                          className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white font-mono text-[11px]"
                        >
                          {s.seatId}
                        </span>
                      ))}
                    </div>
                    <span className="text-sm font-bold text-white font-mono block mt-1">
                      ₹{booking.totalAmount}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onNavigate('booking-confirmation', { bookingId: booking._id })}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition-colors cursor-pointer"
                    >
                      View Digital Pass
                    </button>

                    {booking.bookingStatus === 'confirmed' && (
                      <button
                        onClick={() => handleOpenCancelModal(booking)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-red-950/40 text-gray-300 hover:text-red-300 border border-white/10 text-xs font-medium transition-colors cursor-pointer"
                      >
                        Cancel Ticket
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Modal */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#14161D] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-red-500 font-bold text-sm">
                <AlertTriangle className="w-5 h-5" />
                Cancel Booking #{cancellingBooking.bookingReference}
              </div>
              <button onClick={() => setCancellingBooking(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-1">
                <div className="font-semibold text-white">{cancellingBooking.movieSnapshot.title}</div>
                <div className="text-gray-400">
                  {cancellingBooking.theatreSnapshot.name} · {cancellingBooking.selectedSeats.map((s) => s.seatId).join(', ')}
                </div>
              </div>

              {cancellingBooking.cancellationEligibility ? (
                <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-200 space-y-1">
                  <div className="font-semibold">Refund Policy Calculation:</div>
                  <p className="text-[11px] leading-relaxed">
                    {cancellingBooking.cancellationEligibility.policyNotice}
                  </p>
                  <div className="pt-2 text-white font-bold flex justify-between border-t border-amber-500/20">
                    <span>Estimated Refund Amount:</span>
                    <span className="text-emerald-400 font-mono text-sm">
                      ₹{cancellingBooking.cancellationEligibility.estimatedRefund}
                    </span>
                  </div>
                </div>
              ) : null}

              <div>
                <label className="block text-gray-300 font-medium mb-1">Reason for Cancellation</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full bg-[#0B0C10] border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-red-500"
                >
                  <option value="Change of plans">Change of plans</option>
                  <option value="Booked by mistake">Booked by mistake</option>
                  <option value="Showtime timing conflict">Showtime timing conflict</option>
                  <option value="Personal emergency">Personal emergency</option>
                </select>
              </div>

              {cancelError && <p className="text-red-400 text-xs">{cancelError}</p>}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setCancellingBooking(null)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-xs text-gray-300 rounded-lg transition-colors cursor-pointer"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelling}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-xs font-semibold text-white rounded-lg transition-colors cursor-pointer"
              >
                {cancelling ? 'Processing Cancellation...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
