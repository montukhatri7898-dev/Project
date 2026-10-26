import { Router, Response } from 'express';
import { db } from '../db.js';
import { requireAuth, requireAdmin, AuthenticatedRequest } from '../auth.js';

const router = Router();

// GET /api/admin/dashboard - Operational statistics from actual database records
router.get('/dashboard', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const totalMovies = db.movies.length;
  const nowShowingMovies = db.movies.filter((m) => m.status === 'now_showing').length;
  const comingSoonMovies = db.movies.filter((m) => m.status === 'coming_soon').length;

  const activeCinemas = db.theatres.filter((t) => t.status === 'active').length;
  const totalScreens = db.theatres.reduce((acc, t) => acc + t.screens.length, 0);

  const totalShows = db.shows.length;
  const now = new Date();
  const upcomingShows = db.shows.filter(
    (s) => s.status !== 'cancelled' && new Date(s.startTime) > now
  ).length;

  const totalBookings = db.bookings.length;
  const confirmedBookings = db.bookings.filter((b) => b.bookingStatus === 'confirmed');
  const cancelledBookings = db.bookings.filter((b) => b.bookingStatus === 'cancelled');

  const confirmedRevenue = confirmedBookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalRefunded = cancelledBookings.reduce(
    (sum, b) => sum + (b.cancellationDetails?.refundAmount || 0),
    0
  );

  // Calculate live occupancy across all current active shows
  const totalSeatsInInventory = db.seats.length;
  const bookedSeatsCount = db.seats.filter((s) => s.status === 'booked').length;
  const heldSeatsCount = db.seats.filter((s) => s.status === 'held').length;
  const overallOccupancyPct =
    totalSeatsInInventory > 0
      ? Math.round((bookedSeatsCount / totalSeatsInInventory) * 100)
      : 0;

  // Recent 6 bookings
  const recentBookings = [...db.bookings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)
    .map((b) => ({
      _id: b._id,
      bookingReference: b.bookingReference,
      customerName: b.userName,
      customerEmail: b.userEmail,
      movieTitle: b.movieSnapshot.title,
      theatreName: b.theatreSnapshot.name,
      showTime: b.showTime,
      seatsCount: b.selectedSeats.length,
      totalAmount: b.totalAmount,
      bookingStatus: b.bookingStatus,
      createdAt: b.createdAt,
    }));

  return res.json({
    success: true,
    data: {
      metrics: {
        totalRevenue: confirmedRevenue,
        netRevenue: confirmedRevenue - totalRefunded,
        totalRefunded,
        totalBookings,
        confirmedCount: confirmedBookings.length,
        cancelledCount: cancelledBookings.length,
        totalMovies,
        nowShowingMovies,
        comingSoonMovies,
        activeCinemas,
        totalScreens,
        upcomingShows,
        totalShows,
        totalSeatsInInventory,
        bookedSeatsCount,
        heldSeatsCount,
        overallOccupancyPct,
      },
      recentBookings,
    },
  });
});

// GET /api/admin/bookings - Search and filter all customer bookings
router.get('/bookings', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { search = '', status = 'all', page = '1', limit = '15' } = req.query;

  let list = [...db.bookings];

  if (status && status !== 'all') {
    list = list.filter((b) => b.bookingStatus === status);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    list = list.filter(
      (b) =>
        b.bookingReference.toLowerCase().includes(q) ||
        b.userName.toLowerCase().includes(q) ||
        b.userEmail.toLowerCase().includes(q) ||
        b.movieSnapshot.title.toLowerCase().includes(q) ||
        b.theatreSnapshot.name.toLowerCase().includes(q)
    );
  }

  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit as string, 10) || 15);
  const total = list.length;
  const paginated = list.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  return res.json({
    success: true,
    data: paginated,
    meta: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

// GET /api/admin/users - User management
router.get('/users', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const users = db.users.map((u) => ({
    _id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    preferredCity: u.preferredCity,
    createdAt: u.createdAt,
    bookingsCount: db.bookings.filter((b) => b.userId === u._id).length,
  }));

  return res.json({ success: true, data: users });
});

export default router;
