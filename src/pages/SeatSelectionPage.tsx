import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { ArrowLeft, Clock, ShieldCheck, Film, AlertCircle, ArrowRight } from 'lucide-react';
import { Show, SeatItem } from '../types/index.js';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';

interface SeatSelectionPageProps {
  showId: string;
  onNavigate: (view: string, params?: any) => void;
}

export const SeatSelectionPage: React.FC<SeatSelectionPageProps> = ({ showId, onNavigate }) => {
  const { user, openAuthModal } = useAuth();
  const [show, setShow] = useState<Show | null>(null);
  const [seats, setSeats] = useState<SeatItem[]>([]);
  const [tierPricing, setTierPricing] = useState({ silver: 200, gold: 350, platinum: 500 });
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [holding, setHolding] = useState(false);

  // Hold Timer state
  const [holdExpiresAt, setHoldExpiresAt] = useState<number | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    loadShowAndSeats();

    // Setup Socket.IO for real-time seat lock updates
    const socket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.emit('join:show', { showId });

    socket.on('seat:held', (payload: { showId: string; seatIds: string[]; heldByUserId: string; heldUntil: string }) => {
      if (payload.showId === showId) {
        setSeats((prev) =>
          prev.map((s) => {
            if (payload.seatIds.includes(s.seatId)) {
              const isMine = Boolean(user && payload.heldByUserId === user._id);
              return {
                ...s,
                status: 'held',
                isMyHold: isMine,
                heldUntil: payload.heldUntil,
              };
            }
            return s;
          })
        );
      }
    });

    socket.on('seat:released', (payload: { showId: string; seatIds: string[] }) => {
      if (payload.showId === showId) {
        setSeats((prev) =>
          prev.map((s) => {
            if (payload.seatIds.includes(s.seatId)) {
              return {
                ...s,
                status: 'available',
                isMyHold: false,
                heldUntil: undefined,
              };
            }
            return s;
          })
        );
      }
    });

    socket.on('seat:booked', (payload: { showId: string; seatIds: string[] }) => {
      if (payload.showId === showId) {
        setSeats((prev) =>
          prev.map((s) => {
            if (payload.seatIds.includes(s.seatId)) {
              return {
                ...s,
                status: 'booked',
                isMyHold: false,
              };
            }
            return s;
          })
        );
        // Deselect if user had them selected
        setSelectedSeatIds((prev) => prev.filter((id) => !payload.seatIds.includes(id)));
      }
    });

    return () => {
      socket.emit('leave:show', { showId });
      socket.disconnect();
    };
  }, [showId, user]);

  // Hold Timer countdown
  useEffect(() => {
    if (!holdExpiresAt) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((holdExpiresAt - Date.now()) / 1000));
      setSecondsRemaining(remaining);
      if (remaining <= 0) {
        setHoldExpiresAt(null);
        setError('Your 5-minute seat reservation has expired. Please re-select your seats.');
        setSelectedSeatIds([]);
        loadShowAndSeats();
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [holdExpiresAt]);

  const loadShowAndSeats = async () => {
    try {
      setLoading(true);
      setError(null);

      const [showRes, seatsRes] = await Promise.all([
        api.getShow(showId),
        api.getShowSeats(showId),
      ]);

      if (showRes.success && showRes.data) {
        setShow(showRes.data);
      }
      if (seatsRes.success && seatsRes.data) {
        setSeats(seatsRes.data.seats);
        if (seatsRes.data.tierPricing) {
          setTierPricing(seatsRes.data.tierPricing);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load auditorium seat map.');
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seat: SeatItem) => {
    if (seat.status === 'booked') return;
    if (seat.status === 'held' && !seat.isMyHold) return;

    setError(null);
    const isSelected = selectedSeatIds.includes(seat.seatId);

    if (isSelected) {
      setSelectedSeatIds((prev) => prev.filter((id) => id !== seat.seatId));
    } else {
      if (selectedSeatIds.length >= 8) {
        setError('Maximum 8 seats allowed per booking.');
        return;
      }
      setSelectedSeatIds((prev) => [...prev, seat.seatId]);
    }
  };

  // Group seats by row
  const rowsMap = new Map<string, SeatItem[]>();
  seats.forEach((seat) => {
    if (!rowsMap.has(seat.row)) {
      rowsMap.set(seat.row, []);
    }
    rowsMap.get(seat.row)!.push(seat);
  });
  const rowKeys = Array.from(rowsMap.keys()).sort();

  // Price calculations
  const selectedSeatObjects = seats.filter((s) => selectedSeatIds.includes(s.seatId));
  const subtotal = selectedSeatObjects.reduce((acc, s) => {
    let p = tierPricing.gold;
    if (s.tier === 'silver') p = tierPricing.silver;
    if (s.tier === 'platinum') p = tierPricing.platinum;
    return acc + p;
  }, 0);

  const convenienceFee = selectedSeatObjects.length * 30;
  const estimatedTax = Math.round((subtotal + convenienceFee) * 0.18);
  const totalAmount = subtotal + convenienceFee + estimatedTax;

  const handleProceedToHoldAndCheckout = async () => {
    if (!user) {
      openAuthModal('login');
      return;
    }

    if (selectedSeatIds.length === 0) {
      setError('Please select at least one seat to proceed.');
      return;
    }

    try {
      setHolding(true);
      setError(null);

      // 1. Atomic Hold on Backend
      const holdRes = await api.holdSeats(showId, selectedSeatIds);
      if (!holdRes.success) {
        throw new Error(holdRes.message || 'Seat could not be held.');
      }

      setHoldExpiresAt(Date.now() + 5 * 60 * 1000);

      // 2. Initialize Booking
      const bookingRes = await api.createBooking(showId, selectedSeatIds);
      if (!bookingRes.success) {
        throw new Error(bookingRes.message || 'Booking creation failed.');
      }

      // 3. Navigate to Checkout
      onNavigate('checkout', { bookingId: bookingRes.data._id });
    } catch (err: any) {
      setError(err.message || 'Seat lock failed. Another patron may have reserved these seats.');
      // Refresh seat state
      loadShowAndSeats();
    } finally {
      setHolding(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-gray-400">Loading auditorium layout and seat availability...</p>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-sm text-red-400 mb-4">{error || 'Showtime details not found'}</p>
        <button
          onClick={() => onNavigate('movies')}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-xs text-white rounded-lg transition-colors cursor-pointer"
        >
          Back to Movies
        </button>
      </div>
    );
  }

  const showDate = new Date(show.startTime);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Navigation & Movie Info Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('movie-details', { movieId: show.movieId })}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              {show.movie?.title}
              <span className="text-xs text-gray-400 font-normal">
                ({show.movie?.language} · {show.movie?.contentRating})
              </span>
            </h1>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="text-red-400 font-medium">{show.theatre?.name}</span>
              <span aria-hidden="true">·</span>
              <span>{show.screenName}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-gray-300">
                {showDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} at{' '}
                {showDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        {/* Hold Countdown Timer (if active) */}
        {holdExpiresAt && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>
              Hold Expiry:{' '}
              {Math.floor(secondsRemaining / 60)}:
              {(secondsRemaining % 60).toString().padStart(2, '0')}
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-950/50 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Seating Layout & Screen Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 bg-[#14161D] border border-white/10 rounded-2xl p-6 sm:p-10 flex flex-col items-center overflow-x-auto">
          {/* Cinema Curved Screen Glow */}
          <div className="w-full max-w-2xl text-center mb-6">
            <div className="cinema-screen-curve" />
            <div className="cinema-screen-glow" />
            <span className="text-[11px] font-semibold text-sky-400 uppercase tracking-widest">
              All Eyes This Way · Screen
            </span>
          </div>

          {/* Seat Grid Map */}
          <div className="space-y-3 py-4 w-full max-w-3xl">
            {rowKeys.map((rowLetter) => {
              const rowSeats = rowsMap.get(rowLetter) || [];
              const tier = rowSeats[0]?.tier || 'gold';

              return (
                <div key={rowLetter} className="flex items-center justify-center gap-2">
                  {/* Row Label */}
                  <span className="w-5 text-center text-xs font-mono font-bold text-gray-500">
                    {rowLetter}
                  </span>

                  {/* Seats in Row */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {rowSeats.map((seat) => {
                      const isSelected = selectedSeatIds.includes(seat.seatId);
                      const isBooked = seat.status === 'booked';
                      const isHeldByOther = seat.status === 'held' && !seat.isMyHold;

                      let btnStyle = 'bg-white/10 text-gray-300 hover:bg-white/20 border-white/15';
                      if (seat.tier === 'platinum') btnStyle = 'bg-amber-950/30 text-amber-200 border-amber-500/20 hover:bg-amber-900/40';
                      if (seat.tier === 'silver') btnStyle = 'bg-slate-900/60 text-slate-300 border-slate-700 hover:bg-slate-800';

                      if (isSelected) {
                        btnStyle = 'bg-red-600 border-red-500 text-white font-bold shadow-md shadow-red-600/30';
                      } else if (isBooked) {
                        btnStyle = 'bg-black/60 border-white/5 text-gray-600 cursor-not-allowed';
                      } else if (isHeldByOther) {
                        btnStyle = 'bg-amber-950/50 border-amber-500/40 text-amber-400 cursor-not-allowed animate-pulse';
                      }

                      return (
                        <button
                          key={seat.seatId}
                          onClick={() => handleSeatClick(seat)}
                          disabled={isBooked || isHeldByOther}
                          title={`${seat.seatId} · ${seat.tier.toUpperCase()} · ₹${seat.price} (${
                            isBooked ? 'Booked' : isHeldByOther ? 'Reserved by other' : 'Available'
                          })`}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded text-[11px] font-mono flex items-center justify-center border transition-all cursor-pointer ${btnStyle}`}
                        >
                          {isSelected ? '✓' : isBooked ? '✕' : seat.number}
                        </button>
                      );
                    })}
                  </div>

                  <span className="w-5 text-center text-xs font-mono font-bold text-gray-500">
                    {rowLetter}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Legend Strip */}
          <div className="mt-10 pt-6 border-t border-white/10 w-full flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-white/10 border border-white/20" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-600 border border-red-500 text-white text-[9px] flex items-center justify-center">
                ✓
              </div>
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-amber-950/60 border border-amber-500/50" />
              <span>Temporarily Held</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-black/60 border border-white/5 text-gray-600 text-[9px] flex items-center justify-center">
                ✕
              </div>
              <span>Booked</span>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Booking Summary & Checkout Action */}
        <div className="space-y-5">
          {/* Pricing Tiers Summary */}
          <div className="p-5 bg-[#14161D] border border-white/10 rounded-xl space-y-3">
            <h3 className="text-xs font-semibold text-gray-200 uppercase tracking-wider">Pricing Tiers</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-gray-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500" />
                  Platinum (Recliner)
                </span>
                <span className="font-mono font-bold text-white">₹{tierPricing.platinum}</span>
              </div>
              <div className="flex items-center justify-between text-gray-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-sky-500" />
                  Gold (Executive)
                </span>
                <span className="font-mono font-bold text-white">₹{tierPricing.gold}</span>
              </div>
              <div className="flex items-center justify-between text-gray-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-slate-500" />
                  Silver (Standard)
                </span>
                <span className="font-mono font-bold text-white">₹{tierPricing.silver}</span>
              </div>
            </div>
          </div>

          {/* Dynamic Order Calculation */}
          <div className="p-5 bg-[#14161D] border border-white/10 rounded-xl space-y-4">
            <h3 className="text-xs font-semibold text-gray-200 uppercase tracking-wider">Selection Summary</h3>

            {selectedSeatIds.length === 0 ? (
              <p className="text-xs text-gray-500 py-3 text-center">No seats selected yet</p>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {selectedSeatObjects.map((s) => (
                    <span
                      key={s.seatId}
                      className="px-2 py-1 rounded bg-red-600/20 border border-red-500/30 text-xs font-mono font-semibold text-red-300"
                    >
                      {s.seatId} (₹{s.price})
                    </span>
                  ))}
                </div>

                <div className="border-t border-white/5 pt-3 space-y-1.5 text-xs text-gray-400">
                  <div className="flex justify-between">
                    <span>Seats ({selectedSeatIds.length})</span>
                    <span className="font-mono text-gray-200">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Convenience Fee</span>
                    <span className="font-mono text-gray-200">₹{convenienceFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (18%)</span>
                    <span className="font-mono text-gray-200">₹{estimatedTax}</span>
                  </div>
                  <div className="border-t border-white/10 pt-2 flex justify-between text-sm font-bold text-white">
                    <span>Total Amount</span>
                    <span className="text-red-500 font-mono">₹{totalAmount}</span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleProceedToHoldAndCheckout}
              disabled={selectedSeatIds.length === 0 || holding}
              className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white rounded-lg text-xs font-semibold tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{holding ? 'Locking Seats...' : 'Lock Seats & Proceed to Pay'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-gray-500 text-center leading-relaxed">
              Seats are held for 5 minutes during checkout to prevent duplicate booking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
