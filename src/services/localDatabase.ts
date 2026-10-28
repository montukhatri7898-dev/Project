import { Movie, Theatre, Show, SeatItem, Booking, Promotion, User, AdminMetrics, NotificationItem } from '../types/index.js';
import { STATIC_MOVIES, STATIC_THEATRES, STATIC_PROMOTIONS, STATIC_USERS, generateStaticShowsAndSeats } from '../data/imoviesStaticDb.js';

const STORAGE_KEY_MOVIES = 'imovies_db_movies_v2';
const STORAGE_KEY_THEATRES = 'imovies_db_theatres_v2';
const STORAGE_KEY_SHOWS = 'imovies_db_shows_v2';
const STORAGE_KEY_SEATS = 'imovies_db_seats_v2';
const STORAGE_KEY_BOOKINGS = 'imovies_db_bookings_v2';
const STORAGE_KEY_USERS = 'imovies_db_users_v2';
const STORAGE_KEY_PROMOTIONS = 'imovies_db_promotions_v2';
const STORAGE_KEY_AUTH_USER = 'imovies_auth_user_v2';

export class LocalDatabaseService {
  private movies: Movie[] = [];
  private theatres: Theatre[] = [];
  private shows: Show[] = [];
  private seats: Record<string, SeatItem[]> = {};
  private bookings: Booking[] = [];
  private users: User[] = [];
  private promotions: Promotion[] = [];
  private currentUser: User | null = null;

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      // 1. Load or initialize movies
      const rawMovies = localStorage.getItem(STORAGE_KEY_MOVIES);
      if (rawMovies) {
        try {
          const parsed: Movie[] = JSON.parse(rawMovies);
          // Check if parsed movies contain the real world movies (Kalki and Stree 2)
          const hasKalki = parsed.some((m) => m._id === 'mov_kalki_2898_ad' || m.slug === 'kalki-2898-ad');
          const hasStree2 = parsed.some((m) => m._id === 'mov_stree_2' || m.slug === 'stree-2');
          if (hasKalki && hasStree2 && parsed.length >= 8) {
            this.movies = parsed;
          } else {
            // Synchronize with static real movies
            this.movies = [...STATIC_MOVIES];
            this.saveMovies();
          }
        } catch {
          this.movies = [...STATIC_MOVIES];
          this.saveMovies();
        }
      } else {
        this.movies = [...STATIC_MOVIES];
        this.saveMovies();
      }

      // 2. Load or initialize theatres
      const rawTheatres = localStorage.getItem(STORAGE_KEY_THEATRES);
      if (rawTheatres) {
        try {
          this.theatres = JSON.parse(rawTheatres);
        } catch {
          this.theatres = [...STATIC_THEATRES];
          this.saveTheatres();
        }
      } else {
        this.theatres = [...STATIC_THEATRES];
        this.saveTheatres();
      }

      // 3. Load or generate shows and seats
      const rawShows = localStorage.getItem(STORAGE_KEY_SHOWS);
      const rawSeats = localStorage.getItem(STORAGE_KEY_SEATS);
      if (rawShows && rawSeats) {
        try {
          this.shows = JSON.parse(rawShows);
          this.seats = JSON.parse(rawSeats);
        } catch {
          const generated = generateStaticShowsAndSeats();
          this.shows = generated.shows;
          this.seats = generated.seats;
          this.saveShowsAndSeats();
        }
      } else {
        const generated = generateStaticShowsAndSeats();
        this.shows = generated.shows;
        this.seats = generated.seats;
        this.saveShowsAndSeats();
      }

      // 4. Load or initialize promotions
      const rawPromos = localStorage.getItem(STORAGE_KEY_PROMOTIONS);
      if (rawPromos) {
        try {
          this.promotions = JSON.parse(rawPromos);
        } catch {
          this.promotions = [...STATIC_PROMOTIONS];
          this.savePromotions();
        }
      } else {
        this.promotions = [...STATIC_PROMOTIONS];
        this.savePromotions();
      }

      // 5. Load or initialize bookings
      const rawBookings = localStorage.getItem(STORAGE_KEY_BOOKINGS);
      if (rawBookings) {
        try {
          this.bookings = JSON.parse(rawBookings);
        } catch {
          this.bookings = [];
        }
      } else {
        this.bookings = [];
      }

      // 6. Users & Session
      const rawUsers = localStorage.getItem(STORAGE_KEY_USERS);
      if (rawUsers) {
        try {
          this.users = JSON.parse(rawUsers);
        } catch {
          this.users = [...STATIC_USERS];
        }
      } else {
        this.users = [...STATIC_USERS];
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(this.users));
      }

      const rawAuth = localStorage.getItem(STORAGE_KEY_AUTH_USER);
      if (rawAuth) {
        try {
          this.currentUser = JSON.parse(rawAuth);
        } catch {
          this.currentUser = this.users[1]; // default customer
        }
      } else {
        this.currentUser = this.users[1];
        localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(this.currentUser));
      }
    } catch (e) {
      console.warn('[LocalDatabaseService] Storage error, falling back to static in-memory state:', e);
      this.movies = [...STATIC_MOVIES];
      this.theatres = [...STATIC_THEATRES];
      this.promotions = [...STATIC_PROMOTIONS];
      const gen = generateStaticShowsAndSeats();
      this.shows = gen.shows;
      this.seats = gen.seats;
      this.currentUser = STATIC_USERS[1];
    }
  }

  private saveMovies() {
    try {
      localStorage.setItem(STORAGE_KEY_MOVIES, JSON.stringify(this.movies));
    } catch (e) {
      console.warn('[LocalDatabaseService] Error saving movies:', e);
    }
  }

  private saveTheatres() {
    try {
      localStorage.setItem(STORAGE_KEY_THEATRES, JSON.stringify(this.theatres));
    } catch (e) {
      console.warn('[LocalDatabaseService] Error saving theatres:', e);
    }
  }

  private saveShowsAndSeats() {
    try {
      localStorage.setItem(STORAGE_KEY_SHOWS, JSON.stringify(this.shows));
      localStorage.setItem(STORAGE_KEY_SEATS, JSON.stringify(this.seats));
    } catch (e) {
      console.warn('[LocalDatabaseService] Error saving shows/seats:', e);
    }
  }

  private saveBookings() {
    try {
      localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(this.bookings));
    } catch (e) {
      console.warn('[LocalDatabaseService] Error saving bookings:', e);
    }
  }

  private savePromotions() {
    try {
      localStorage.setItem(STORAGE_KEY_PROMOTIONS, JSON.stringify(this.promotions));
    } catch (e) {
      console.warn('[LocalDatabaseService] Error saving promotions:', e);
    }
  }

  // --- MOVIES ---
  public getMovies(params: {
    status?: string;
    search?: string;
    genre?: string;
    language?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
  } = {}) {
    let list = [...this.movies];

    if (params.status && params.status !== 'all') {
      list = list.filter((m) => m.status === params.status);
    }

    if (params.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.cast.some((c) => c.toLowerCase().includes(q))
      );
    }

    if (params.genre && params.genre !== 'All') {
      list = list.filter((m) => m.genre.some((g) => g.toLowerCase() === params.genre!.toLowerCase()));
    }

    if (params.language && params.language !== 'All') {
      list = list.filter((m) => m.language.toLowerCase().includes(params.language!.toLowerCase()));
    }

    list.sort((a, b) => {
      if (params.sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
    });

    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, params.limit || 20);
    const total = list.length;
    const totalPages = Math.ceil(total / limit);
    const paginated = list.slice((page - 1) * limit, page * limit);

    const allGenres = Array.from(new Set(this.movies.flatMap((m) => m.genre)));
    const allLanguages = Array.from(new Set(this.movies.map((m) => m.language)));

    return {
      success: true,
      data: paginated,
      meta: {
        total,
        page,
        limit,
        totalPages,
        facets: {
          genres: allGenres,
          languages: allLanguages,
        },
      },
    };
  }

  public getMovie(idOrSlug: string) {
    const movie = this.movies.find((m) => m._id === idOrSlug || m.slug === idOrSlug);
    if (!movie) {
      return { success: false, error: 'Movie not found.' };
    }

    // Associated shows
    const shows = this.shows.filter((s) => s.movieId === movie._id && s.status !== 'cancelled');

    const theatreMap = new Map<string, { theatre: any; shows: Show[] }>();
    shows.forEach((show) => {
      const theatre = this.theatres.find((t) => t._id === show.theatreId);
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

    return {
      success: true,
      data: {
        ...movie,
        cinemaSchedules,
      },
    };
  }

  public createMovie(data: Partial<Movie>) {
    const slug = (data.title || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newMovie: Movie = {
      _id: `mov_${Date.now()}`,
      title: data.title || 'Untitled',
      slug,
      description: data.description || '',
      genre: data.genre || ['Action'],
      language: data.language || 'Hindi',
      durationMinutes: data.durationMinutes || 120,
      releaseDate: data.releaseDate || new Date().toISOString().split('T')[0],
      contentRating: data.contentRating || 'UA',
      posterUrl: data.posterUrl || '/assets/posters/kalki_2898_ad.jpg',
      backdropUrl: data.backdropUrl || '/assets/posters/kalki_backdrop.jpg',
      trailerUrl: data.trailerUrl || '',
      cast: data.cast || [],
      status: data.status || 'now_showing',
      createdAt: new Date().toISOString(),
    };

    this.movies.unshift(newMovie);
    this.saveMovies();
    return { success: true, data: newMovie };
  }

  public updateMovie(id: string, data: Partial<Movie>) {
    const idx = this.movies.findIndex((m) => m._id === id);
    if (idx < 0) return { success: false, error: 'Movie not found' };

    this.movies[idx] = { ...this.movies[idx], ...data };
    this.saveMovies();
    return { success: true, data: this.movies[idx] };
  }

  public deleteMovie(id: string) {
    this.movies = this.movies.filter((m) => m._id !== id);
    this.saveMovies();
    return { success: true, message: 'Movie removed successfully' };
  }

  // --- THEATRES ---
  public getTheatres(city?: string) {
    let list = this.theatres.filter((t) => t.status === 'active');
    if (city && city !== 'All') {
      list = list.filter((t) => t.city.toLowerCase() === city.toLowerCase());
    }
    const cities = Array.from(new Set(this.theatres.map((t) => t.city)));
    return {
      success: true,
      data: list,
      meta: {
        total: list.length,
        cities,
      },
    };
  }

  public getTheatre(id: string) {
    const theatre = this.theatres.find((t) => t._id === id);
    if (!theatre) return { success: false, error: 'Cinema not found' };

    const runningShows = this.shows
      .filter((s) => s.theatreId === theatre._id && s.status !== 'cancelled')
      .map((show) => {
        const movie = this.movies.find((m) => m._id === show.movieId);
        return {
          ...show,
          movie: movie
            ? {
                _id: movie._id,
                title: movie.title,
                posterUrl: movie.posterUrl,
                durationMinutes: movie.durationMinutes,
                language: movie.language,
                contentRating: movie.contentRating,
              }
            : undefined,
        };
      });

    return {
      success: true,
      data: {
        ...theatre,
        shows: runningShows,
      },
    };
  }

  // --- SHOWS & SEATS ---
  public getShows(params: { movieId?: string; theatreId?: string; date?: string; city?: string } = {}) {
    let list = this.shows.filter((s) => s.status !== 'cancelled');

    if (params.movieId) {
      list = list.filter((s) => s.movieId === params.movieId);
    }
    if (params.theatreId) {
      list = list.filter((s) => s.theatreId === params.theatreId);
    }
    if (params.date) {
      list = list.filter((s) => s.startTime.startsWith(params.date!));
    }
    if (params.city && params.city !== 'All') {
      const cityTheatreIds = new Set(
        this.theatres.filter((t) => t.city.toLowerCase() === params.city!.toLowerCase()).map((t) => t._id)
      );
      list = list.filter((s) => cityTheatreIds.has(s.theatreId));
    }

    const populated = list.map((show) => {
      const movie = this.movies.find((m) => m._id === show.movieId);
      const theatre = this.theatres.find((t) => t._id === show.theatreId);
      const seatsForShow = this.seats[show._id] || [];
      const bookedCount = seatsForShow.filter((s) => s.status === 'booked').length;
      return {
        ...show,
        movie: movie ? { ...movie } : undefined,
        theatre: theatre ? { ...theatre } : undefined,
        occupancy: {
          totalSeats: seatsForShow.length,
          availableSeats: seatsForShow.length - bookedCount,
          bookedCount,
        },
      };
    });

    return { success: true, data: populated };
  }

  public getShow(id: string) {
    const show = this.shows.find((s) => s._id === id);
    if (!show) return { success: false, error: 'Show not found' };

    const movie = this.movies.find((m) => m._id === show.movieId);
    const theatre = this.theatres.find((t) => t._id === show.theatreId);
    const screen = theatre?.screens.find((s) => s.screenId === show.screenId);

    return {
      success: true,
      data: {
        ...show,
        movie,
        theatre,
        screen,
      },
    };
  }

  public getShowSeats(id: string) {
    const show = this.shows.find((s) => s._id === id);
    if (!show) return { success: false, error: 'Show not found' };

    const theatre = this.theatres.find((t) => t._id === show.theatreId);
    const screen = theatre?.screens.find((s) => s.screenId === show.screenId);

    if (!this.seats[id]) {
      // Lazy generate seats for this show if missing
      const newSeats: SeatItem[] = [];
      const rows = screen?.rows || ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      const seatsPerRow = screen?.seatsPerRow || 12;

      rows.forEach((r) => {
        let tier: 'silver' | 'gold' | 'platinum' = 'gold';
        if (screen?.tierRows.silver.includes(r)) tier = 'silver';
        if (screen?.tierRows.platinum.includes(r)) tier = 'platinum';
        const price = show.tierPricing[tier];

        for (let num = 1; num <= seatsPerRow; num++) {
          const seatId = `${r}${num < 10 ? '0' + num : num}`;
          newSeats.push({
            seatId,
            row: r,
            number: num,
            tier,
            price,
            status: 'available',
          });
        }
      });
      this.seats[id] = newSeats;
      this.saveShowsAndSeats();
    }

    return {
      success: true,
      data: {
        showId: id,
        screenInfo: screen,
        tierPricing: show.tierPricing,
        seats: this.seats[id],
      },
    };
  }

  public holdSeats(showId: string, seatIds: string[]) {
    const showSeats = this.seats[showId];
    if (!showSeats) return { success: false, error: 'Auditorium not configured' };

    for (const seatId of seatIds) {
      const seat = showSeats.find((s) => s.seatId === seatId);
      if (!seat) return { success: false, error: `Seat ${seatId} not found` };
      if (seat.status === 'booked') return { success: false, error: `Seat ${seatId} is already booked` };
    }

    const expiresAt = new Date(Date.now() + 5 * 60000).toISOString();
    seatIds.forEach((seatId) => {
      const seat = showSeats.find((s) => s.seatId === seatId);
      if (seat) {
        seat.status = 'held';
        seat.isMyHold = true;
        seat.heldUntil = expiresAt;
      }
    });

    this.saveShowsAndSeats();

    return {
      success: true,
      data: {
        showId,
        heldSeats: seatIds,
        expiresAt,
        holdDurationSeconds: 300,
      },
      message: 'Seats locked successfully for 5 minutes',
    };
  }

  public releaseSeats(showId: string, seatIds: string[]) {
    const showSeats = this.seats[showId];
    if (showSeats) {
      seatIds.forEach((seatId) => {
        const seat = showSeats.find((s) => s.seatId === seatId);
        if (seat && seat.status === 'held') {
          seat.status = 'available';
          seat.isMyHold = false;
          seat.heldUntil = undefined;
        }
      });
      this.saveShowsAndSeats();
    }
    return { success: true, releasedCount: seatIds.length };
  }

  // --- BOOKINGS & PAYMENTS ---
  public createBooking(showId: string, seatIds: string[]) {
    const show = this.shows.find((s) => s._id === showId);
    if (!show) return { success: false, error: 'Show not found' };

    const movie = this.movies.find((m) => m._id === show.movieId);
    const theatre = this.theatres.find((t) => t._id === show.theatreId);
    const showSeats = this.seats[showId] || [];

    const selectedSeats = seatIds.map((seatId) => {
      const s = showSeats.find((seat) => seat.seatId === seatId);
      const tier = s?.tier || 'gold';
      const price = show.tierPricing[tier];
      return {
        seatId,
        row: seatId.charAt(0),
        number: parseInt(seatId.slice(1), 10) || 1,
        tier,
        price,
      };
    });

    const subtotal = selectedSeats.reduce((acc, curr) => acc + curr.price, 0);
    const taxes = Math.round(subtotal * 0.18);
    const fees = 30;
    const totalAmount = subtotal + taxes + fees;

    const ref = `IMV-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const newBooking: Booking = {
      _id: `bkg_${Date.now()}`,
      bookingReference: ref,
      userId: this.currentUser?._id || 'usr_customer_01',
      userEmail: this.currentUser?.email || 'customer@imovies.com',
      userName: this.currentUser?.name || 'Arjun Sharma',
      showId,
      movieSnapshot: {
        movieId: movie?._id || show.movieId,
        title: movie?.title || 'Blockbuster Movie',
        posterUrl: movie?.posterUrl || '/assets/posters/kalki_2898_ad.jpg',
        language: movie?.language || 'Hindi',
        contentRating: movie?.contentRating || 'UA',
        durationMinutes: movie?.durationMinutes || 150,
      },
      theatreSnapshot: {
        theatreId: theatre?._id || show.theatreId,
        name: theatre?.name || 'IMovies Multiplex',
        city: theatre?.city || 'Mumbai',
        screenName: show.screenName || 'Audi 1',
        address: theatre?.address || 'City Centre',
      },
      showTime: show.startTime,
      selectedSeats,
      subtotal,
      taxes,
      fees,
      totalAmount,
      bookingStatus: 'pending',
      paymentStatus: 'unpaid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.bookings.unshift(newBooking);
    this.saveBookings();

    return {
      success: true,
      data: newBooking,
      message: 'Booking initiated',
    };
  }

  public getMyBookings() {
    const userId = this.currentUser?._id || 'usr_customer_01';
    const userBookings = this.bookings.filter((b) => b.userId === userId);
    const now = new Date();

    const upcoming = userBookings.filter(
      (b) => b.bookingStatus === 'confirmed' && new Date(b.showTime) > now
    );
    const completed = userBookings.filter(
      (b) => b.bookingStatus === 'confirmed' && new Date(b.showTime) <= now
    );
    const cancelled = userBookings.filter((b) => b.bookingStatus === 'cancelled');

    return {
      success: true,
      data: {
        all: userBookings,
        upcoming,
        completed,
        cancelled,
      },
    };
  }

  public getBooking(id: string) {
    const booking = this.bookings.find((b) => b._id === id || b.bookingReference === id);
    if (!booking) return { success: false, error: 'Booking not found' };
    return { success: true, data: booking };
  }

  public cancelBooking(id: string, reason = 'Customer requested cancellation') {
    const booking = this.bookings.find((b) => b._id === id || b.bookingReference === id);
    if (!booking) return { success: false, error: 'Booking not found' };

    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'refunded';
    booking.cancellationDetails = {
      cancelledAt: new Date().toISOString(),
      reason,
      refundAmount: booking.totalAmount,
      refundStatus: 'processed',
    };
    booking.updatedAt = new Date().toISOString();

    // Release seats
    const showSeats = this.seats[booking.showId];
    if (showSeats) {
      booking.selectedSeats.forEach((s) => {
        const seat = showSeats.find((st) => st.seatId === s.seatId);
        if (seat) {
          seat.status = 'available';
          seat.isMyHold = false;
        }
      });
      this.saveShowsAndSeats();
    }

    this.saveBookings();
    return { success: true, data: booking, message: 'Booking successfully cancelled & refunded' };
  }

  public createPaymentOrder(bookingId: string) {
    const booking = this.bookings.find((b) => b._id === bookingId);
    if (!booking) return { success: false, error: 'Booking not found' };

    return {
      success: true,
      data: {
        orderId: `order_${Date.now()}`,
        bookingId: booking._id,
        amount: booking.totalAmount,
        currency: 'INR',
        bookingReference: booking.bookingReference,
        movieTitle: booking.movieSnapshot.title,
        customerName: booking.userName,
        customerEmail: booking.userEmail,
      },
    };
  }

  public verifyPayment(data: { bookingId: string; orderId: string; paymentId: string; paymentMethod: string }) {
    const booking = this.bookings.find((b) => b._id === data.bookingId);
    if (!booking) return { success: false, error: 'Booking not found' };

    booking.bookingStatus = 'confirmed';
    booking.paymentStatus = 'paid';
    booking.paymentDetails = {
      orderId: data.orderId,
      paymentId: data.paymentId,
      method: data.paymentMethod,
      paidAt: new Date().toISOString(),
    };
    booking.updatedAt = new Date().toISOString();

    // Permanently mark seats as booked
    const showSeats = this.seats[booking.showId];
    if (showSeats) {
      booking.selectedSeats.forEach((s) => {
        const seat = showSeats.find((st) => st.seatId === s.seatId);
        if (seat) {
          seat.status = 'booked';
          seat.isMyHold = false;
          seat.heldUntil = undefined;
        }
      });
      this.saveShowsAndSeats();
    }

    this.saveBookings();
    return { success: true, data: booking, message: 'Payment verified and ticket confirmed!' };
  }

  // --- PROMOTIONS ---
  public getPromotions() {
    return {
      success: true,
      data: this.promotions,
      meta: { count: this.promotions.length },
    };
  }

  public verifyPromotion(code: string, amount: number) {
    if (!code) return { success: false, error: 'Promotion code required' };
    const promo = this.promotions.find((p) => p.code.toUpperCase() === code.trim().toUpperCase());
    if (!promo) return { success: false, error: 'Invalid or expired promo code' };

    const bookingAmount = Number(amount) || 0;
    if (promo.minBookingAmount && bookingAmount < promo.minBookingAmount) {
      return {
        success: false,
        error: `Coupon requires minimum booking of ₹${promo.minBookingAmount}`,
      };
    }

    let discountAmount = 0;
    if (promo.discountType === 'flat') {
      discountAmount = promo.discountValue;
    } else if (promo.discountType === 'percentage') {
      discountAmount = Math.round((bookingAmount * promo.discountValue) / 100);
    }
    discountAmount = Math.min(discountAmount, bookingAmount);

    return {
      success: true,
      data: {
        code: promo.code,
        title: promo.title,
        discountType: promo.discountType,
        discountAmount,
        finalAmount: bookingAmount - discountAmount,
        badge: promo.badge,
      },
      message: 'Coupon applied successfully',
    };
  }

  // --- ADMIN METRICS ---
  public getAdminDashboard() {
    const confirmed = this.bookings.filter((b) => b.bookingStatus === 'confirmed');
    const cancelled = this.bookings.filter((b) => b.bookingStatus === 'cancelled');

    const totalRevenue = confirmed.reduce((acc, b) => acc + b.totalAmount, 0);
    const totalRefunded = cancelled.reduce((acc, b) => acc + b.totalAmount, 0);
    const netRevenue = totalRevenue - totalRefunded;

    let totalSeats = 0;
    let bookedSeats = 0;
    Object.values(this.seats).forEach((seatList) => {
      totalSeats += seatList.length;
      bookedSeats += seatList.filter((s) => s.status === 'booked').length;
    });

    const metrics: AdminMetrics = {
      totalRevenue,
      netRevenue,
      totalRefunded,
      totalBookings: this.bookings.length,
      confirmedCount: confirmed.length,
      cancelledCount: cancelled.length,
      totalMovies: this.movies.length,
      nowShowingMovies: this.movies.filter((m) => m.status === 'now_showing').length,
      comingSoonMovies: this.movies.filter((m) => m.status === 'coming_soon').length,
      activeCinemas: this.theatres.length,
      totalScreens: this.theatres.reduce((acc, t) => acc + t.screens.length, 0),
      upcomingShows: this.shows.length,
      totalShows: this.shows.length,
      totalSeatsInInventory: totalSeats,
      bookedSeatsCount: bookedSeats,
      heldSeatsCount: 0,
      overallOccupancyPct: totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 24,
    };

    return {
      success: true,
      data: {
        metrics,
        recentBookings: this.bookings.slice(0, 10),
      },
    };
  }

  public getAdminBookings(params: { search?: string; status?: string; page?: number; limit?: number } = {}) {
    let list = [...this.bookings];
    if (params.status && params.status !== 'all') {
      list = list.filter((b) => b.bookingStatus === params.status);
    }
    if (params.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.bookingReference.toLowerCase().includes(q) ||
          b.userName.toLowerCase().includes(q) ||
          b.userEmail.toLowerCase().includes(q) ||
          b.movieSnapshot.title.toLowerCase().includes(q)
      );
    }

    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, params.limit || 15);
    const paginated = list.slice((page - 1) * limit, page * limit);

    return {
      success: true,
      data: paginated,
      meta: {
        total: list.length,
        page,
        limit,
        totalPages: Math.ceil(list.length / limit),
      },
    };
  }

  // --- AUTH ---
  public login(credentials: { email: string; password: string }) {
    const user = this.users.find((u) => u.email.toLowerCase() === credentials.email.toLowerCase()) || {
      _id: `usr_${Date.now()}`,
      name: credentials.email.split('@')[0],
      email: credentials.email,
      role: (credentials.email.includes('admin') ? 'admin' : 'customer') as 'admin' | 'customer',
      preferredCity: 'Mumbai',
      createdAt: new Date().toISOString(),
    };

    this.currentUser = user;
    localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(user));
    return {
      success: true,
      token: `local_jwt_${Date.now()}`,
      user,
      message: 'Logged in successfully',
    };
  }

  public register(data: { name: string; email: string; password: string; preferredCity?: string }) {
    const newUser: User = {
      _id: `usr_${Date.now()}`,
      name: data.name,
      email: data.email,
      role: 'customer',
      preferredCity: data.preferredCity || 'Mumbai',
      createdAt: new Date().toISOString(),
    };

    this.users.push(newUser);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(this.users));
    this.currentUser = newUser;
    localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(newUser));

    return {
      success: true,
      token: `local_jwt_${Date.now()}`,
      user: newUser,
      message: 'Account created successfully',
    };
  }

  public logout() {
    this.currentUser = null;
    localStorage.removeItem(STORAGE_KEY_AUTH_USER);
    return { success: true };
  }

  public getMe() {
    return {
      success: true,
      user: this.currentUser,
    };
  }

  public updateProfile(updates: Partial<User>) {
    if (!this.currentUser) return { success: false, error: 'Not authenticated' };
    this.currentUser = { ...this.currentUser, ...updates };
    localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(this.currentUser));
    return { success: true, user: this.currentUser };
  }

  public getNotifications(): { success: boolean; data: NotificationItem[]; meta: { unreadCount: number } } {
    return {
      success: true,
      data: [
        {
          _id: 'notif_1',
          userId: this.currentUser?._id || 'usr_customer_01',
          type: 'booking_confirmed',
          title: 'Welcome to IMovies Cinema Experience',
          message: 'Browse all real Indian and global blockbusters, choose seats, and enjoy high-fidelity IMAX screenings.',
          read: false,
          createdAt: new Date().toISOString(),
        },
      ],
      meta: { unreadCount: 1 },
    };
  }
}

export const localDb = new LocalDatabaseService();
