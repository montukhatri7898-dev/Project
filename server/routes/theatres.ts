import { Router, Request, Response } from 'express';
import { db, TheatreDoc } from '../db.js';
import { requireAuth, requireAdmin, AuthenticatedRequest } from '../auth.js';

const router = Router();

// GET /api/theatres - List theatres with city filter
router.get('/', (req: Request, res: Response) => {
  const { city } = req.query;

  let list = db.theatres.filter((t) => t.status === 'active');
  if (city && typeof city === 'string' && city !== 'All') {
    list = list.filter((t) => t.city.toLowerCase() === city.toLowerCase());
  }

  const allCities = Array.from(new Set(db.theatres.map((t) => t.city)));

  return res.json({
    success: true,
    data: list,
    meta: {
      total: list.length,
      cities: allCities,
    },
  });
});

// GET /api/theatres/:id - Details + Running Shows
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const theatre = db.theatres.find((t) => t._id === id);

  if (!theatre) {
    return res.status(404).json({ success: false, error: 'Cinema not found.' });
  }

  // Find all shows for this theatre
  const shows = db.shows.filter((s) => s.theatreId === theatre._id && s.status !== 'cancelled');

  // Attach movie details
  const populatedShows = shows.map((show) => {
    const movie = db.movies.find((m) => m._id === show.movieId);
    return {
      ...show,
      movie: movie ? {
        _id: movie._id,
        title: movie.title,
        posterUrl: movie.posterUrl,
        durationMinutes: movie.durationMinutes,
        language: movie.language,
        contentRating: movie.contentRating,
      } : null,
    };
  });

  return res.json({
    success: true,
    data: {
      ...theatre,
      shows: populatedShows,
    },
  });
});

// POST /api/theatres - Admin create theatre
router.post('/', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { name, city, address, facilities = [], screens = [] } = req.body;

  if (!name || !city || !address) {
    return res.status(400).json({ success: false, error: 'Name, city, and address are required.' });
  }

  const newTheatre: TheatreDoc = {
    _id: `th_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim(),
    city: city.trim(),
    address: address.trim(),
    facilities: Array.isArray(facilities) ? facilities : facilities.split(',').map((f: string) => f.trim()),
    screens: screens.length > 0 ? screens : [
      {
        screenId: `scr_${Date.now()}`,
        screenNumber: 1,
        name: 'Screen 1 (Dolby Cinema)',
        screenType: 'Dolby Cinema',
        rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
        seatsPerRow: 12,
        tierRows: {
          silver: ['A', 'B'],
          gold: ['C', 'D', 'E'],
          platinum: ['F', 'G'],
        },
      },
    ],
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.theatres.unshift(newTheatre);
  db.save();

  return res.status(201).json({ success: true, data: newTheatre, message: 'Cinema added successfully.' });
});

// PATCH /api/theatres/:id - Admin edit theatre
router.patch('/:id', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const theatre = db.theatres.find((t) => t._id === id);

  if (!theatre) {
    return res.status(404).json({ success: false, error: 'Cinema not found.' });
  }

  Object.assign(theatre, req.body, { updatedAt: new Date().toISOString() });
  db.save();

  return res.json({ success: true, data: theatre, message: 'Cinema updated successfully.' });
});

// DELETE /api/theatres/:id - Admin delete theatre
router.delete('/:id', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const index = db.theatres.findIndex((t) => t._id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Cinema not found.' });
  }

  db.theatres[index].status = 'inactive';
  db.theatres[index].updatedAt = new Date().toISOString();
  db.save();

  return res.json({ success: true, message: 'Cinema deactivated successfully.' });
});

export default router;
