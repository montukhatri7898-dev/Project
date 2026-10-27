import React, { useState, useEffect } from 'react';
import { CreditCard, Smartphone, Building, ShieldCheck, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { Booking } from '../types/index.js';
import { api } from '../api/client.js';

interface CheckoutPageProps {
  bookingId: string;
  onNavigate: (view: string, params?: any) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ bookingId, onNavigate }) => {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking'>('upi');

  // Form inputs
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8841');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('789');
  const [upiId, setUpiId] = useState('patron@okaxis');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [processing, setProcessing] = useState(false);

  // Promo code state
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountAmount: number; title: string } | null>(null);
  const [promoMsg, setPromoMsg] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  const loadBooking = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getBooking(bookingId);
      if (res.success && res.data) {
        setBooking(res.data);
      } else {
        setError('Booking session expired or not found.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load booking checkout.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking || !promoInput.trim()) return;

    try {
      setPromoMsg(null);
      const res = await api.verifyPromotion(promoInput.trim(), booking.totalAmount);
      if (res.success && res.data) {
        setAppliedPromo({
          code: res.data.code,
          discountAmount: res.data.discountAmount,
          title: res.data.title,
        });
        setPromoMsg({ text: res.message, isError: false });
      }
    } catch (err: any) {
      setAppliedPromo(null);
      setPromoMsg({ text: err.message || 'Coupon code could not be applied.', isError: true });
    }
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;

    try {
      setProcessing(true);
      setError(null);

      // 1. Create payment order intent
      const orderRes = await api.createPaymentOrder(booking._id);
      if (!orderRes.success) {
        throw new Error('Payment order initialization failed.');
      }

      // 2. Simulate official payment gateway completion & server verification
      const verifyRes = await api.verifyPayment({
        bookingId: booking._id,
        orderId: orderRes.data.orderId,
        paymentId: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        paymentMethod: paymentMethod === 'card' ? 'Credit Card (Visa)' : paymentMethod === 'upi' ? `UPI (${upiId})` : `NetBanking (${selectedBank})`,
      });

      if (!verifyRes.success) {
        throw new Error(verifyRes.message || 'Payment verification failed.');
      }

      // 3. Navigate to confirmation with confirmed digital ticket
      onNavigate('booking-confirmation', { bookingId: verifyRes.data._id });
    } catch (err: any) {
      setError(err.message || 'Payment processing failed. Please retry.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-sm text-red-400 mb-4">{error || 'Booking session unavailable'}</p>
        <button
          onClick={() => onNavigate('movies')}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-xs text-white rounded-lg transition-colors cursor-pointer"
        >
          Browse Movies
        </button>
      </div>
    );
  }

  const showDate = new Date(booking.showTime);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-white/10">
        <button
          onClick={() => onNavigate('seat-selection', { showId: booking.showId })}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Checkout & Payment Verification</h1>
          <p className="text-xs text-gray-400">Reference #{booking.bookingReference} · 256-Bit Encrypted Payment</p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-950/50 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Checkout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Payment Method Selection & Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Test Mode Sandbox Banner */}
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-start justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                Razorpay & Gateway Sandbox Active
              </span>
              <p className="text-[11px] text-gray-300 mt-1 leading-relaxed">
                Development test environment is operational. No real money will be charged. Click below to verify complete end-to-end checkout.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 shrink-0">
              SANDBOX
            </span>
          </div>

          {/* Payment Method Tabs */}
          <div className="p-6 bg-[#14161D] border border-white/10 rounded-2xl space-y-6">
            <h3 className="text-xs font-semibold text-gray-200 uppercase tracking-wider">
              Select Payment Method
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  paymentMethod === 'upi'
                    ? 'bg-red-600/20 border-red-500 text-white shadow-sm'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-5 h-5 mb-1.5 text-red-400" />
                <span>UPI / QR</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'bg-red-600/20 border-red-500 text-white shadow-sm'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-5 h-5 mb-1.5 text-red-400" />
                <span>Debit / Credit Card</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('netbanking')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  paymentMethod === 'netbanking'
                    ? 'bg-red-600/20 border-red-500 text-white shadow-sm'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                <Building className="w-5 h-5 mb-1.5 text-red-400" />
                <span>NetBanking</span>
              </button>
            </div>

            {/* Dynamic Payment Form */}
            <form onSubmit={handlePay} className="space-y-4 pt-2">
              {paymentMethod === 'upi' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">UPI ID / VPA</label>
                    <input
                      type="text"
                      required
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@okhdfcbank"
                      className="w-full bg-[#0B0C10] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px] text-gray-400">
                    <span className="text-gray-500">Popular:</span>
                    {['Google Pay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                      <button
                        key={app}
                        type="button"
                        onClick={() => setUpiId(`demo.${app.toLowerCase().replace(' ', '')}@okaxis`)}
                        className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 cursor-pointer"
                      >
                        {app}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Card Number</label>
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-[#0B0C10] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">Expiry Date</label>
                      <input
                        type="text"
                        required
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full bg-[#0B0C10] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">CVV</label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="•••"
                        className="w-full bg-[#0B0C10] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'netbanking' && (
                <div className="space-y-3">
                  <label className="block text-xs font-medium text-gray-300 mb-1">Select Bank</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full bg-[#0B0C10] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="State Bank of India">State Bank of India</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                  </select>
                </div>
              )}

              <div className="pt-4 border-t border-white/10">
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold tracking-wide transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {processing
                      ? 'Verifying Transaction with Bank...'
                      : `Pay ₹${
                          appliedPromo
                            ? Math.max(0, booking.totalAmount - appliedPromo.discountAmount)
                            : booking.totalAmount
                        } & Confirm Ticket`}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right 1 Column: Itemized Order Snapshot */}
        <div className="space-y-5">
          <div className="p-6 bg-[#14161D] border border-white/10 rounded-2xl space-y-4">
            <h3 className="text-xs font-semibold text-gray-200 uppercase tracking-wider">
              Booking Snapshot
            </h3>

            <div className="flex gap-3 pb-3 border-b border-white/10">
              <img
                src={booking.movieSnapshot.posterUrl}
                alt={booking.movieSnapshot.title}
                className="w-16 aspect-[3/4] object-cover rounded-md bg-[#0B0C10] border border-white/10"
              />
              <div>
                <h4 className="text-sm font-bold text-white line-clamp-1">{booking.movieSnapshot.title}</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">{booking.theatreSnapshot.name}</p>
                <p className="text-[10px] text-gray-500">{booking.theatreSnapshot.screenName}</p>
                <div className="text-[10px] text-red-400 font-mono mt-1">
                  {showDate.toLocaleDateString([], { month: 'short', day: 'numeric' })},{' '}
                  {showDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            {/* Selected Seats */}
            <div className="space-y-1.5 text-xs">
              <div className="text-gray-400">Reserved Seats:</div>
              <div className="flex flex-wrap gap-1">
                {booking.selectedSeats.map((s) => (
                  <span
                    key={s.seatId}
                    className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white font-mono text-[11px]"
                  >
                    {s.seatId}
                  </span>
                ))}
              </div>
            </div>

            {/* Promo Code Input Box */}
            <div className="border-t border-white/10 pt-3">
              <label className="block text-[11px] font-medium text-gray-300 mb-1">
                Have a Promotion Code?
              </label>
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  placeholder="e.g. IMOVIE50 / DESI20"
                  className="flex-1 bg-[#0B0C10] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white uppercase font-mono placeholder-gray-500 focus:outline-none focus:border-red-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium cursor-pointer"
                >
                  Apply
                </button>
              </form>

              {promoMsg && (
                <p
                  className={`text-[11px] mt-1.5 ${
                    promoMsg.isError ? 'text-red-400' : 'text-emerald-400'
                  }`}
                >
                  {promoMsg.text}
                </p>
              )}
            </div>

            {/* Itemized Calculations */}
            <div className="border-t border-white/10 pt-3 space-y-2 text-xs text-gray-300">
              <div className="flex justify-between">
                <span>Tickets Subtotal</span>
                <span className="font-mono text-white">₹{booking.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Convenience Fees</span>
                <span className="font-mono text-white">₹{booking.fees}</span>
              </div>
              <div className="flex justify-between">
                <span>Integrated GST (18%)</span>
                <span className="font-mono text-white">₹{booking.taxes}</span>
              </div>
              {appliedPromo && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Promo Discount ({appliedPromo.code})</span>
                  <span className="font-mono">-₹{appliedPromo.discountAmount}</span>
                </div>
              )}
              <div className="border-t border-white/10 pt-3 flex justify-between text-base font-bold text-white">
                <span>Total Payable</span>
                <span className="text-red-500 font-mono">
                  ₹{appliedPromo ? Math.max(0, booking.totalAmount - appliedPromo.discountAmount) : booking.totalAmount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
