import { Router, Response } from 'express';
import QRCode from 'qrcode';
import { db, BookingDoc, BookingSeatItem, NotificationDoc } from '../db.js';
import { requireAuth, AuthenticatedRequest } from '../auth.js';
import { broadcastSeatReleased } from '../socket.js';

const router = Router();

// POST /api/bookings - Initialize pending booking with server-calculated price
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { showId, seatIds } = req.body;
    const user = req.user!;

    if (!showId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({ success: false, error: 'Show ID and seat selection are required.' });
    }

    const show = db.shows.find((s) => s._id === showId);
    if (!show) {
      return res.status(404).json({ success: false, error: 'Show not found.' });
    }

    const movie = db.movies.find((m) => m._id === show.movieId);
    const theatre = db.theatres.find((t) => t._id === show.theatreId);
    if (!movie || !theatre) {
      return res.status(404).json({ success: false, error: 'Associated movie or cinema not found.' });
    }

    // Verify seats are currently held by this user
    const now = new Date().toISOString();
    const selectedSeatItems: BookingSeatItem[] = [];
    let subtotal = 0;

    for (const seatId of seatIds) {
      const seat = db.seats.find((s) => s.showId === showId && s.seatId === seatId);
      if (!seat) {
        return res.status(400).json({ success: false, error: `Seat ${seatId} does not exist.` });
      }

      // Check hold ownership
      if (seat.status !== 'held' || seat.heldByUserId !== user.userId) {
        return res.status(409).json({
          success: false,
          error: `Seat ${seatId} is no longer reserved for you. Please re-select your seats.`,
        });
      }

      if (seat.heldUntil && seat.heldUntil <= now) {
        return res.status(410).json({
          success: false,
          error: 'Your 5-minute reservation hold has expired. Please select seats again.',
        });
      }

      let price = show.tierPricing.gold;
      if (seat.tier === 'silver') price = show.tierPricing.silver;
      if (seat.tier === 'platinum') price = show.tierPricing.platinum;

      subtotal += price;
      selectedSeatItems.push({
        seatId: seat.seatId,
        row: seat.row,
        number: seat.number,
        tier: seat.tier,
        price,
      });
    }

    // Server-side calculation
    const convenienceFeePerTicket = 30;
    const fees = convenienceFeePerTicket * selectedSeatItems.length;
    const taxes = Math.round((subtotal + fees) * 0.18); // 18% GST
    const totalAmount = subtotal + fees + taxes;

    const bookingReference = `IMV-${Math.floor(100000 + Math.random() * 900000)}`;

    const newBooking: BookingDoc = {
      _id: `bkg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      bookingReference,
      userId: user.userId,
      userEmail: user.email,
      userName: user.name,
      showId: show._id,
      movieSnapshot: {
        movieId: movie._id,
        title: movie.title,
        posterUrl: movie.posterUrl,
        language: movie.language,
        contentRating: movie.contentRating,
        durationMinutes: movie.durationMinutes,
      },
      theatreSnapshot: {
        theatreId: theatre._id,
        name: theatre.name,
        city: theatre.city,
        screenName: show.screenName,
        address: theatre.address,
      },
      showTime: show.startTime,
      selectedSeats: selectedSeatItems,
      subtotal,
      taxes,
      fees,
      totalAmount,
      bookingStatus: 'pending',
      paymentStatus: 'unpaid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.bookings.push(newBooking);
    db.save();

    return res.status(201).json({
      success: true,
      data: newBooking,
      message: 'Booking created. Please complete payment to confirm your tickets.',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Booking creation failed.' });
  }
});

// GET /api/bookings/my - Customer bookings
router.get('/my', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const userBookings = db.bookings
    .filter((b) => b.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const now = new Date();

  const upcoming = userBookings.filter(
    (b) => b.bookingStatus === 'confirmed' && new Date(b.showTime) > now
  );
  const completed = userBookings.filter(
    (b) => b.bookingStatus === 'confirmed' && new Date(b.showTime) <= now
  );
  const cancelled = userBookings.filter((b) => b.bookingStatus === 'cancelled');

  return res.json({
    success: true,
    data: {
      all: userBookings,
      upcoming,
      completed,
      cancelled,
    },
  });
});

// GET /api/bookings/:id - Single booking details
router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  const booking = db.bookings.find((b) => b._id === id || b.bookingReference === id);
  if (!booking) {
    return res.status(404).json({ success: false, error: 'Booking not found.' });
  }

  // Security check: Only customer owner or admin can view
  if (booking.userId !== user.userId && user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Unauthorized to view this booking.' });
  }

  // Check cancellation eligibility
  const showTimeDate = new Date(booking.showTime).getTime();
  const nowDate = Date.now();
  const diffHours = (showTimeDate - nowDate) / (1000 * 60 * 60);

  const isEligibleForCancellation =
    booking.bookingStatus === 'confirmed' && diffHours >= 2;

  let estimatedRefund = 0;
  if (isEligibleForCancellation) {
    if (diffHours >= 4) {
      estimatedRefund = Math.round(booking.subtotal * 0.75); // 75% refund of ticket price
    } else {
      estimatedRefund = Math.round(booking.subtotal * 0.5); // 50% refund
    }
  }

  return res.json({
    success: true,
    data: {
      ...booking,
      cancellationEligibility: {
        isEligible: isEligibleForCancellation,
        hoursRemaining: Math.max(0, Math.round(diffHours * 10) / 10),
        estimatedRefund,
        policyNotice:
          diffHours >= 4
            ? 'Eligible for 75% ticket refund (>4 hours before showtime).'
            : diffHours >= 2
            ? 'Eligible for 50% ticket refund (2–4 hours before showtime).'
            : 'Non-refundable (less than 2 hours before showtime).',
      },
    },
  });
});

// POST /api/bookings/:id/cancel - Customer cancellation
router.post('/:id/cancel', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { reason = 'Personal emergency' } = req.body;
  const user = req.user!;

  const booking = db.bookings.find((b) => b._id === id || b.bookingReference === id);
  if (!booking) {
    return res.status(404).json({ success: false, error: 'Booking not found.' });
  }

  if (booking.userId !== user.userId && user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Unauthorized.' });
  }

  if (booking.bookingStatus !== 'confirmed') {
    return res.status(400).json({ success: false, error: `Cannot cancel booking with status: ${booking.bookingStatus}` });
  }

  const showTimeDate = new Date(booking.showTime).getTime();
  const nowDate = Date.now();
  const diffHours = (showTimeDate - nowDate) / (1000 * 60 * 60);

  if (diffHours < 2) {
    return res.status(400).json({
      success: false,
      error: 'Cancellation policy violation: Bookings cannot be cancelled less than 2 hours prior to showtime.',
    });
  }

  const refundRate = diffHours >= 4 ? 0.75 : 0.5;
  const refundAmount = Math.round(booking.subtotal * refundRate);

  // Update booking state
  booking.bookingStatus = 'cancelled';
  booking.paymentStatus = 'refunded';
  booking.cancellationDetails = {
    cancelledAt: new Date().toISOString(),
    reason,
    refundAmount,
    refundStatus: 'initiated',
  };
  booking.updatedAt = new Date().toISOString();

  // Atomically release booked seats back to inventory
  const seatIds = booking.selectedSeats.map((s) => s.seatId);
  for (const seatId of seatIds) {
    const seat = db.seats.find((s) => s.showId === booking.showId && s.seatId === seatId);
    if (seat) {
      seat.status = 'available';
      seat.bookingId = undefined;
      seat.heldByUserId = undefined;
      seat.heldUntil = undefined;
      seat.updatedAt = new Date().toISOString();
    }
  }

  // Create notification
  const notification: NotificationDoc = {
    _id: `notif_${Date.now()}`,
    userId: booking.userId,
    type: 'booking_cancelled',
    title: 'Booking Cancelled & Refund Initiated',
    message: `Your booking #${booking.bookingReference} for "${booking.movieSnapshot.title}" has been cancelled. Refund of ₹${refundAmount} has been initiated to your original payment method.`,
    read: false,
    createdAt: new Date().toISOString(),
  };
  db.notifications.push(notification);

  db.save();

  // Notify active users on this show
  broadcastSeatReleased(booking.showId, seatIds);

  return res.json({
    success: true,
    data: booking,
    message: `Booking cancelled successfully. Refund of ₹${refundAmount} (${refundRate * 100}%) initiated.`,
  });
});

export default router;
