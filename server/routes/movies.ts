import { Router, Request, Response } from 'express';
import { db, MovieDoc } from '../db.js';
import { requireAuth, requireAdmin, AuthenticatedRequest } from '../auth.js';

const router = Router();

// GET /api/movies - List movies with search, filters & pagination
router.get('/', (req: Request, res: Response) => {
  const {
    status = 'now_showing',
    search = '',
    genre = '',
    language = '',
    sortBy = 'releaseDate',
    page = '1',
    limit = '12',
  } = req.query;

  let list = [...db.movies];

  // Status filter
  if (status && status !== 'all') {
    list = list.filter((m) => m.status === status);
  }

  // Search filter (title, description, cast)
  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    list = list.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.cast.some((c) => c.toLowerCase().includes(q))
    );
  }

  // Genre filter
  if (genre && typeof genre === 'string' && genre !== 'All') {
    list = list.filter((m) => m.genre.some((g) => g.toLowerCase() === genre.toLowerCase()));
  }

  // Language filter
  if (language && typeof language === 'string' && language !== 'All') {
    list = list.filter((m) => m.language.toLowerCase() === language.toLowerCase());
  }

  // Sorting
  list.sort((a, b) => {
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    // Default: releaseDate descending
    return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
  });

  const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit as string, 10) || 12);
  const total = list.length;
  const totalPages = Math.ceil(total / limitNum);
  const paginated = list.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  // Available filter facets
  const allGenres = Array.from(new Set(db.movies.flatMap((m) => m.genre)));
  const allLanguages = Array.from(new Set(db.movies.map((m) => m.language)));

  return res.json({
    success: true,
    data: paginated,
    meta: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      facets: {
        genres: allGenres,
        languages: allLanguages,
      },
    },
  });
});

// GET /api/movies/:idOrSlug - Details + Active Shows & Theatres
router.get('/:idOrSlug', (req: Request, res: Response) => {
  const { idOrSlug } = req.params;
  const movie = db.movies.find((m) => m._id === idOrSlug || m.slug === idOrSlug);

  if (!movie) {
    return res.status(404).json({ success: false, error: 'Movie not found.' });
  }

  // Find associated shows
  const shows = db.shows.filter((s) => s.movieId === movie._id && s.status !== 'cancelled');

  // Group shows by theatre
  const theatreMap = new Map<string, { theatre: any; shows: any[] }>();
  shows.forEach((show) => {
    const theatre = db.theatres.find((t) => t._id === show.theatreId);
    if (!theatre) return;
    if (!theatreMap.has(theatre._id)) {
      theatreMap.set(theatre._id, {
        theatre: {
          _id: theatre._id,
          name: theatre.name,
          city: theatre.city,
          address: theatre.address,
          facilities: theatre.facilities,
        },
        shows: [],
      });
    }
    theatreMap.get(theatre._id)!.shows.push(show);
  });

  const cinemaSchedules = Array.from(theatreMap.values());

  return res.json({
    success: true,
    data: {
      ...movie,
      cinemaSchedules,
    },
  });
});

// POST /api/movies - Admin add movie
router.post('/', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const {
    title,
    description,
    genre,
    language,
    durationMinutes,
    releaseDate,
    contentRating = 'UA',
    posterUrl,
    backdropUrl,
    trailerUrl,
    cast = [],
    status = 'now_showing',
  } = req.body;

  if (!title || !description || !durationMinutes || !releaseDate) {
    return res.status(400).json({ success: false, error: 'Title, description, duration, and release date are required.' });
  }

  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const newMovie: MovieDoc = {
    _id: `mov_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    title: title.trim(),
    slug,
    description: description.trim(),
    genre: Array.isArray(genre) ? genre : [genre || 'General'],
    language: language || 'English',
    durationMinutes: Number(durationMinutes),
    releaseDate,
    contentRating,
    posterUrl: posterUrl || '/src/assets/images/poster_stellar_voyage_1792988110200.jpg',
    backdropUrl: backdropUrl || posterUrl || '/src/assets/images/hero_cinema_blockbuster_1792988110364.jpg',
    trailerUrl: trailerUrl || 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    cast: Array.isArray(cast) ? cast : cast.split(',').map((c: string) => c.trim()),
    status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.movies.unshift(newMovie);
  db.save();

  return res.status(201).json({ success: true, data: newMovie, message: 'Movie added successfully.' });
});

// PATCH /api/movies/:id - Admin edit movie
router.patch('/:id', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const movie = db.movies.find((m) => m._id === id);

  if (!movie) {
    return res.status(404).json({ success: false, error: 'Movie not found.' });
  }

  const updates = req.body;
  Object.assign(movie, updates, { updatedAt: new Date().toISOString() });
  db.save();

  return res.json({ success: true, data: movie, message: 'Movie updated successfully.' });
});

// DELETE /api/movies/:id - Admin delete/archive
router.delete('/:id', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const index = db.movies.findIndex((m) => m._id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Movie not found.' });
  }

  // Check if active shows or bookings exist
  const activeBookings = db.bookings.some(
    (b) => b.movieSnapshot.movieId === id && b.bookingStatus === 'confirmed'
  );

  if (activeBookings) {
    // Soft delete / archive to protect historical records
    db.movies[index].status = 'archived';
    db.movies[index].updatedAt = new Date().toISOString();
    db.save();
    return res.json({
      success: true,
      message: 'Movie has confirmed customer bookings and has been safely archived instead of permanently deleted.',
    });
  }

  db.movies.splice(index, 1);
  db.save();
  return res.json({ success: true, message: 'Movie removed successfully.' });
});

export default router;
