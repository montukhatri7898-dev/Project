import { Router, Request, Response } from 'express';
import { db, ShowDoc, SeatInventoryDoc } from '../db.js';
import { requireAuth, requireAdmin, AuthenticatedRequest } from '../auth.js';
import { broadcastSeatHeld, broadcastSeatReleased } from '../socket.js';

const router = Router();

// GET /api/shows - List shows with filters
router.get('/', (req: Request, res: Response) => {
  const { movieId, theatreId, date, city } = req.query;

  let list = db.shows.filter((s) => s.status !== 'cancelled');

  if (movieId && typeof movieId === 'string') {
    list = list.filter((s) => s.movieId === movieId);
  }

  if (theatreId && typeof theatreId === 'string') {
    list = list.filter((s) => s.theatreId === theatreId);
  }

  if (date && typeof date === 'string') {
    list = list.filter((s) => s.startTime.startsWith(date));
  }

  if (city && typeof city === 'string' && city !== 'All') {
    const theatresInCity = new Set(
      db.theatres
        .filter((t) => t.city.toLowerCase() === city.toLowerCase())
        .map((t) => t._id)
    );
    list = list.filter((s) => theatresInCity.has(s.theatreId));
  }

  // Populate movie and theatre
  const populated = list.map((show) => {
    const movie = db.movies.find((m) => m._id === show.movieId);
    const theatre = db.theatres.find((t) => t._id === show.theatreId);
    const seatsForShow = db.seats.filter((s) => s.showId === show._id);
    const bookedCount = seatsForShow.filter((s) => s.status === 'booked').length;
    const totalSeats = seatsForShow.length;
    const availableSeats = totalSeats - bookedCount;

    return {
      ...show,
      movie: movie
        ? {
            _id: movie._id,
            title: movie.title,
            posterUrl: movie.posterUrl,
            language: movie.language,
            durationMinutes: movie.durationMinutes,
            contentRating: movie.contentRating,
          }
        : null,
      theatre: theatre
        ? {
            _id: theatre._id,
            name: theatre.name,
            city: theatre.city,
            address: theatre.address,
            facilities: theatre.facilities,
          }
        : null,
      occupancy: {
        totalSeats,
        availableSeats,
        bookedCount,
      },
    };
  });

  return res.json({ success: true, data: populated });
});

// GET /api/shows/:id - Show details
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const show = db.shows.find((s) => s._id === id);

  if (!show) {
    return res.status(404).json({ success: false, error: 'Show not found.' });
  }

  const movie = db.movies.find((m) => m._id === show.movieId);
  const theatre = db.theatres.find((t) => t._id === show.theatreId);
  const screen = theatre?.screens.find((sc) => sc.screenId === show.screenId);

  return res.json({
    success: true,
    data: {
      ...show,
      movie,
      theatre,
      screen,
    },
  });
});

// GET /api/shows/:id/seats - Get seat layout and live availability
router.get('/:id/seats', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const show = db.shows.find((s) => s._id === id);

  if (!show) {
    return res.status(404).json({ success: false, error: 'Show not found.' });
  }

  const theatre = db.theatres.find((t) => t._id === show.theatreId);
  const screen = theatre?.screens.find((s) => s.screenId === show.screenId);

  const currentUserId = req.user?.userId;
  const now = new Date().toISOString();

  // Fetch show seats
  const rawSeats = db.seats.filter((s) => s.showId === id);

  const seats = rawSeats.map((seat) => {
    let effectiveStatus: 'available' | 'held' | 'booked' = seat.status;
    let isMyHold = false;

    // Check expired hold
    if (seat.status === 'held') {
      if (seat.heldUntil && seat.heldUntil <= now) {
        effectiveStatus = 'available';
      } else if (currentUserId && seat.heldByUserId === currentUserId) {
        isMyHold = true;
      }
    }

    let price = show.tierPricing.gold;
    if (seat.tier === 'silver') price = show.tierPricing.silver;
    if (seat.tier === 'platinum') price = show.tierPricing.platinum;

    return {
      seatId: seat.seatId,
      row: seat.row,
      number: seat.number,
      tier: seat.tier,
      price,
      status: effectiveStatus,
      isMyHold,
      heldUntil: seat.heldUntil,
    };
  });

  return res.json({
    success: true,
    data: {
      showId: id,
      screenInfo: screen || {
        rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
        seatsPerRow: 12,
        tierRows: { silver: ['A', 'B'], gold: ['C', 'D', 'E', 'F'], platinum: ['G', 'H'] },
      },
      tierPricing: show.tierPricing,
      seats,
    },
  });
});

// POST /api/shows/:id/hold - Temporarily reserve selected seats (5 min hold)
router.post('/:id/hold', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { seatIds } = req.body;
  const userId = req.user!.userId;

  if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
    return res.status(400).json({ success: false, error: 'Please select at least one seat.' });
  }

  // Maximum 8 seats per booking rule
  if (seatIds.length > 8) {
    return res.status(400).json({ success: false, error: 'Maximum 8 seats permitted per transaction.' });
  }

  const result = db.holdSeats(id, seatIds, userId, 5);

  if (!result.success) {
    return res.status(409).json({ success: false, error: result.error });
  }

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  // Real-time broadcast to all viewers in this show room
  broadcastSeatHeld(id, seatIds, userId, expiresAt);

  return res.json({
    success: true,
    data: {
      showId: id,
      heldSeats: seatIds,
      expiresAt,
      holdDurationSeconds: 300,
    },
    message: 'Seats reserved for 5 minutes. Please proceed to payment.',
  });
});

// POST /api/shows/:id/release - Release seat hold
router.post('/:id/release', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { seatIds } = req.body;
  const userId = req.user!.userId;

  if (!seatIds || !Array.isArray(seatIds)) {
    return res.status(400).json({ success: false, error: 'No seats specified for release.' });
  }

  const releasedCount = db.releaseSeats(id, seatIds, userId);
  broadcastSeatReleased(id, seatIds);

  return res.json({
    success: true,
    releasedCount,
    message: 'Seats released successfully.',
  });
});

// POST /api/shows - Admin schedule show with duration overlap check
router.post('/', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { movieId, theatreId, screenId, startTime, tierPricing } = req.body;

  if (!movieId || !theatreId || !screenId || !startTime || !tierPricing) {
    return res.status(400).json({ success: false, error: 'All show scheduling fields are required.' });
  }

  const movie = db.movies.find((m) => m._id === movieId);
  if (!movie) return res.status(404).json({ success: false, error: 'Movie not found.' });

  const theatre = db.theatres.find((t) => t._id === theatreId);
  if (!theatre) return res.status(404).json({ success: false, error: 'Theatre not found.' });

  const screen = theatre.screens.find((s) => s.screenId === screenId);
  if (!screen) return res.status(404).json({ success: false, error: 'Screen not found in theatre.' });

  // Calculate End Time with 20 min turnover buffer
  const startTimestamp = new Date(startTime).getTime();
  if (isNaN(startTimestamp)) {
    return res.status(400).json({ success: false, error: 'Invalid start time format.' });
  }

  const runtimeBufferMs = (movie.durationMinutes + 20) * 60 * 1000;
  const endTimestamp = startTimestamp + runtimeBufferMs;
  const endTime = new Date(endTimestamp).toISOString();

  // Collision Detection on the same screen:
  // Conflict if (existingStart < newEnd) && (newStart < existingEnd)
  const conflictingShow = db.shows.find((existing) => {
    if (existing.theatreId !== theatreId || existing.screenId !== screenId || existing.status === 'cancelled') {
      return false;
    }
    const eStart = new Date(existing.startTime).getTime();
    const eEnd = new Date(existing.endTime).getTime();
    return eStart < endTimestamp && startTimestamp < eEnd;
  });

  if (conflictingShow) {
    return res.status(409).json({
      success: false,
      error: `Screen schedule collision! An existing show (${conflictingShow.startTime.substring(11, 16)} to ${conflictingShow.endTime.substring(11, 16)}) is already booked on this screen.`,
    });
  }

  const newShow: ShowDoc = {
    _id: `shw_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    movieId,
    theatreId,
    screenId,
    screenName: screen.name,
    startTime: new Date(startTime).toISOString(),
    endTime,
    tierPricing: {
      silver: Number(tierPricing.silver) || 200,
      gold: Number(tierPricing.gold) || 320,
      platinum: Number(tierPricing.platinum) || 450,
    },
    status: 'scheduled',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.shows.push(newShow);

  // Generate seat inventory for this new show
  screen.rows.forEach((rowLetter) => {
    let tier: 'silver' | 'gold' | 'platinum' = 'gold';
    if (screen.tierRows.silver.includes(rowLetter)) tier = 'silver';
    if (screen.tierRows.platinum.includes(rowLetter)) tier = 'platinum';

    for (let num = 1; num <= screen.seatsPerRow; num++) {
      const seatId = `${rowLetter}${num < 10 ? '0' + num : num}`;
      db.seats.push({
        _id: `${newShow._id}_${seatId}`,
        showId: newShow._id,
        seatId,
        row: rowLetter,
        number: num,
        tier,
        status: 'available',
        updatedAt: new Date().toISOString(),
      });
    }
  });

  db.save();

  return res.status(201).json({
    success: true,
    data: newShow,
    message: `Show scheduled successfully with ${screen.rows.length * screen.seatsPerRow} seats initialized.`,
  });
});

// PATCH /api/shows/:id - Admin update show
router.patch('/:id', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const show = db.shows.find((s) => s._id === id);

  if (!show) {
    return res.status(404).json({ success: false, error: 'Show not found.' });
  }

  const { status, tierPricing } = req.body;
  if (status) show.status = status;
  if (tierPricing) Object.assign(show.tierPricing, tierPricing);
  show.updatedAt = new Date().toISOString();

  db.save();
  return res.json({ success: true, data: show, message: 'Show updated successfully.' });
});

export default router;
