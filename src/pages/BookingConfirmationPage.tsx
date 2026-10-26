import React, { useState, useEffect } from 'react';
import { CheckCircle, Printer, ArrowRight, Film, MapPin, Calendar, Clock, Ticket } from 'lucide-react';
import { Booking } from '../types/index.js';
import { api } from '../api/client.js';

interface BookingConfirmationPageProps {
  bookingId: string;
  onNavigate: (view: string, params?: any) => void;
}

export const BookingConfirmationPage: React.FC<BookingConfirmationPageProps> = ({ bookingId, onNavigate }) => {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  const loadBooking = async () => {
    try {
      setLoading(true);
      const res = await api.getBooking(bookingId);
      if (res.success && res.data) {
        setBooking(res.data);
      } else {
        setError('Booking not found.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load confirmation');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex justify-center">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-sm text-red-400 mb-4">{error || 'Booking not found'}</p>
        <button
          onClick={() => onNavigate('home')}
          className="px-4 py-2 bg-white/10 text-white rounded text-xs cursor-pointer"
        >
          Return Home
        </button>
      </div>
    );
  }

  const showDate = new Date(booking.showTime);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Success Banner */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/40">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Booking Confirmed!</h1>
        <p className="text-xs text-gray-300">
          Your payment was verified and digital tickets are ready. Reference: #{booking.bookingReference}
        </p>
      </div>

      {/* Printable Digital Boarding Pass */}
      <div className="printable-ticket relative bg-[#14161D] border border-white/15 rounded-2xl overflow-hidden shadow-2xl">
        {/* Cinema Ticket Header */}
        <div className="bg-gradient-to-r from-red-700 to-red-900 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-white/20 flex items-center justify-center text-white">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest text-red-200 block font-semibold">
                Official Digital Admission Pass
              </span>
              <span className="text-lg font-bold">IMovies Multiplex Experience</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase text-red-200 block">Booking Reference</span>
            <span className="font-mono text-base font-bold">{booking.bookingReference}</span>
          </div>
        </div>

        {/* Ticket Body with Two Columns */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-5">
            <div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Movie Feature</span>
              <h2 className="text-xl font-bold text-white mt-0.5">{booking.movieSnapshot.title}</h2>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                <span>{booking.movieSnapshot.language}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">{booking.movieSnapshot.durationMinutes} min</span>
                <span aria-hidden="true">·</span>
                <span className="border border-white/20 px-1 py-0.2 rounded text-[10px] text-gray-300">
                  {booking.movieSnapshot.contentRating}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Cinema Multiplex</span>
                <span className="font-semibold text-white mt-0.5 block">{booking.theatreSnapshot.name}</span>
                <span className="text-[11px] text-gray-400">{booking.theatreSnapshot.address}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Auditorium / Screen</span>
                <span className="font-semibold text-white mt-0.5 block">{booking.theatreSnapshot.screenName}</span>
                <span className="text-[11px] text-gray-400">{booking.theatreSnapshot.city}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs pt-3 border-t border-white/10">
              <div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Show Date & Time</span>
                <span className="font-semibold text-white mt-0.5 block">
                  {showDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="text-red-400 font-mono font-bold">
                  {showDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Assigned Seats</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {booking.selectedSeats.map((s) => (
                    <span
                      key={s.seatId}
                      className="px-2 py-0.5 rounded bg-red-600/20 border border-red-500/30 text-red-300 font-mono font-bold text-xs"
                    >
                      {s.seatId}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Scan QR Code & Total */}
          <div className="flex flex-col items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 text-center">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-2">
              Scan at Gate Turnstile
            </span>

            {booking.qrCodeDataUrl ? (
              <img
                src={booking.qrCodeDataUrl}
                alt="Ticket QR Code"
                className="w-36 h-36 rounded-lg bg-white p-2 shadow-md"
              />
            ) : (
              <div className="w-36 h-36 rounded-lg bg-white/10 flex items-center justify-center text-xs text-gray-500">
                Generating QR...
              </div>
            )}

            <div className="mt-3">
              <span className="text-[10px] text-gray-400 block">Total Amount Paid</span>
              <span className="text-base font-bold text-emerald-400 font-mono">₹{booking.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Ticket Perforated Divider Bar */}
        <div className="relative py-2 bg-[#0B0C10] flex items-center justify-between px-6 border-t border-b border-white/10">
          <div className="text-[10px] text-gray-500">
            Passholder: <span className="text-gray-300 font-medium">{booking.userName}</span> ({booking.userEmail})
          </div>
          <div className="text-[10px] text-gray-500 font-mono">
            Transaction ID: {booking.paymentDetails?.paymentId || 'PAY_VERIFIED'}
          </div>
        </div>
      </div>

      {/* Post-Booking Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={handlePrint}
          className="w-full sm:w-auto px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 border border-white/10 transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4 text-gray-300" />
          <span>Print / Save Digital Ticket</span>
        </button>

        <button
          onClick={() => onNavigate('my-bookings')}
          className="w-full sm:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Ticket className="w-4 h-4" />
          <span>View in My Bookings</span>
        </button>
      </div>
    </div>
  );
};
