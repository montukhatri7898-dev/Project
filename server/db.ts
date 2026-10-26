import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'imovies_db.json');

export interface UserDoc {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'customer' | 'admin';
  preferredCity: string;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MovieDoc {
  _id: string;
  title: string;
  slug: string;
  description: string;
  genre: string[];
  language: string;
  durationMinutes: number;
  releaseDate: string;
  contentRating: 'U' | 'UA' | 'A';
  posterUrl: string;
  backdropUrl: string;
  trailerUrl: string;
  cast: string[];
  status: 'now_showing' | 'coming_soon' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface ScreenConfig {
  screenId: string;
  screenNumber: number;
  name: string;
  screenType: 'Standard' | 'Dolby Cinema' | 'IMAX 3D';
  rows: string[]; // e.g. ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
  seatsPerRow: number; // e.g. 12
  tierRows: {
    silver: string[]; // ['A', 'B']
    gold: string[]; // ['C', 'D', 'E', 'F']
    platinum: string[]; // ['G', 'H']
  };
}

export interface TheatreDoc {
  _id: string;
  name: string;
  city: string;
  address: string;
  facilities: string[];
  screens: ScreenConfig[];
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface ShowDoc {
  _id: string;
  movieId: string;
  theatreId: string;
  screenId: string;
  screenName: string;
  startTime: string; // ISO String
  endTime: string; // ISO String
  tierPricing: {
    silver: number;
    gold: number;
    platinum: number;
  };
  status: 'scheduled' | 'running' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface SeatInventoryDoc {
  _id: string; // `${showId}_${seatId}`
  showId: string;
  seatId: string; // e.g. 'D07'
  row: string;
  number: number;
  tier: 'silver' | 'gold' | 'platinum';
  status: 'available' | 'held' | 'booked';
  heldByUserId?: string;
  heldUntil?: string; // ISO string
  bookingId?: string;
  updatedAt: string;
}

export interface BookingSeatItem {
  seatId: string;
  row: string;
  number: number;
  tier: 'silver' | 'gold' | 'platinum';
  price: number;
}

export interface BookingDoc {
  _id: string;
  bookingReference: string;
  userId: string;
  userEmail: string;
  userName: string;
  showId: string;
  movieSnapshot: {
    movieId: string;
    title: string;
    posterUrl: string;
    language: string;
    contentRating: string;
    durationMinutes: number;
  };
  theatreSnapshot: {
    theatreId: string;
    name: string;
    city: string;
    screenName: string;
    address: string;
  };
  showTime: string;
  selectedSeats: BookingSeatItem[];
  subtotal: number;
  taxes: number; // 18% GST
  fees: number; // convenience fee
  totalAmount: number;
  bookingStatus: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  paymentDetails?: {
    orderId: string;
    paymentId?: string;
    method?: string;
    paidAt?: string;
  };
  cancellationDetails?: {
    cancelledAt: string;
    reason: string;
    refundAmount: number;
    refundStatus: 'initiated' | 'processed' | 'failed';
  };
  qrCodeDataUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationDoc {
  _id: string;
  userId: string;
  type: 'booking_confirmed' | 'booking_cancelled' | 'payment_failed' | 'show_reminder';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface DatabaseSchema {
  users: UserDoc[];
  movies: MovieDoc[];
  theatres: TheatreDoc[];
  shows: ShowDoc[];
  seats: SeatInventoryDoc[];
  bookings: BookingDoc[];
  notifications: NotificationDoc[];
}

class Database {
  private data: DatabaseSchema;
  private writeTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.data = {
      users: [],
      movies: [],
      theatres: [],
      shows: [],
      seats: [],
      bookings: [],
      notifications: [],
    };
    this.init();
  }

  private init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        console.log('[IMovies DB] Loaded existing database records successfully.');
      } catch (err) {
        console.error('[IMovies DB] Error reading DB file, re-initializing seed:', err);
        this.seedInitialData();
      }
    } else {
      console.log('[IMovies DB] No existing DB file found. Seeding initial data...');
      this.seedInitialData();
    }
  }

  public save() {
    if (this.writeTimer) clearTimeout(this.writeTimer);
    this.writeTimer = setTimeout(() => {
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
      } catch (e) {
        console.error('[IMovies DB] Write failed:', e);
      }
    }, 50);
  }

  public get users() { return this.data.users; }
  public get movies() { return this.data.movies; }
  public get theatres() { return this.data.theatres; }
  public get shows() { return this.data.shows; }
  public get seats() { return this.data.seats; }
  public get bookings() { return this.data.bookings; }
  public get notifications() { return this.data.notifications; }

  private seedInitialData() {
    const adminPasswordHash = bcrypt.hashSync('admin123', 10);
    const customerPasswordHash = bcrypt.hashSync('customer123', 10);

    const defaultUsers: UserDoc[] = [
      {
        _id: 'usr_admin_01',
        name: 'IMovies Chief Administrator',
        email: 'admin@imovies.com',
        passwordHash: adminPasswordHash,
        role: 'admin',
        preferredCity: 'Mumbai',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'usr_customer_01',
        name: 'Arjun Sharma',
        email: 'customer@imovies.com',
        passwordHash: customerPasswordHash,
        role: 'customer',
        preferredCity: 'Mumbai',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const defaultMovies: MovieDoc[] = [
      {
        _id: 'mov_stellar_voyage',
        title: 'Stellar Voyage',
        slug: 'stellar-voyage',
        description: 'When deep space anomaly threatens Earth, commander Elena Vance and an elite crew journey across uncharted solar systems to reach an orbital jumpgate, discovering secrets beyond cosmic imagination.',
        genre: ['Sci-Fi', 'Adventure', 'Drama'],
        language: 'English',
        durationMinutes: 154,
        releaseDate: '2026-10-18',
        contentRating: 'UA',
        posterUrl: '/src/assets/images/poster_stellar_voyage_1792988110200.jpg',
        backdropUrl: '/src/assets/images/hero_cinema_blockbuster_1792988110364.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
        cast: ['Elena Vance', 'David Chen', 'Sarah Lin', 'Marcus Thorne'],
        status: 'now_showing',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'mov_shadow_operative',
        title: 'Shadow Operative',
        slug: 'shadow-operative',
        description: 'An off-the-books intelligence agent is pulled out of hiding when a syndicate unleashes a lethal cyber weapon. Trapped in a rain-soaked neon metropolis, every shadow conceals betrayal.',
        genre: ['Action', 'Thriller', 'Mystery'],
        language: 'English',
        durationMinutes: 132,
        releaseDate: '2026-10-24',
        contentRating: 'A',
        posterUrl: '/src/assets/images/poster_shadow_operative_1792988110722.jpg',
        backdropUrl: '/src/assets/images/poster_shadow_operative_1792988110722.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=d96cjKs0Hy8',
        cast: ['Marcus Cole', 'Lena Kai', 'Victor Sterling'],
        status: 'now_showing',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'mov_crimson_dynasty',
        title: 'Crimson Dynasty',
        slug: 'crimson-dynasty',
        description: 'In an era of warring feudal kingdoms, a masterless samurai is entrusted with guarding the sacred imperial seal against an invading clan, leading to an epochal clash of honor and destiny.',
        genre: ['Action', 'Drama', 'Historical'],
        language: 'Hindi',
        durationMinutes: 165,
        releaseDate: '2026-10-20',
        contentRating: 'UA',
        posterUrl: '/src/assets/images/poster_crimson_dynasty_1792988111258.jpg',
        backdropUrl: '/src/assets/images/poster_crimson_dynasty_1792988111258.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
        cast: ['Kenjiro Sano', 'Aoi Miyazaki', 'Hiroyuki Sanada'],
        status: 'now_showing',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'mov_aurora_protocol',
        title: 'Aurora Protocol',
        slug: 'aurora-protocol',
        description: 'A subterranean scientific outpost beneath the Arctic discovers an encrypted frequency echoing from beneath the glacial shelf, triggering an international race for ultimate energy sovereignty.',
        genre: ['Thriller', 'Sci-Fi'],
        language: 'English',
        durationMinutes: 118,
        releaseDate: '2026-11-14',
        contentRating: 'UA',
        posterUrl: '/src/assets/images/hero_cinema_blockbuster_1792988110364.jpg',
        backdropUrl: '/src/assets/images/hero_cinema_blockbuster_1792988110364.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
        cast: ['Sophia Lind', 'Nils Lindqvist', 'Arthur Bell'],
        status: 'coming_soon',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const defaultTheatres: TheatreDoc[] = [
      {
        _id: 'th_pvr_phoenix',
        name: 'IMovies Cineplex — Phoenix Palladium',
        city: 'Mumbai',
        address: '462 Senapati Bapat Marg, Lower Parel, Mumbai',
        facilities: ['Dolby Atmos', '4K Laser Projection', 'Recliner Seats', 'Gourmet Dine-In', 'Valet Parking'],
        screens: [
          {
            screenId: 'scr_01',
            screenNumber: 1,
            name: 'Audi 1 (IMAX Laser)',
            screenType: 'IMAX 3D',
            rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
            seatsPerRow: 12,
            tierRows: {
              silver: ['A', 'B'],
              gold: ['C', 'D', 'E', 'F'],
              platinum: ['G', 'H'],
            },
          },
          {
            screenId: 'scr_02',
            screenNumber: 2,
            name: 'Audi 2 (Dolby Atmos)',
            screenType: 'Dolby Cinema',
            rows: ['A', 'B', 'C', 'D', 'E', 'F'],
            seatsPerRow: 10,
            tierRows: {
              silver: ['A', 'B'],
              gold: ['C', 'D'],
              platinum: ['E', 'F'],
            },
          },
        ],
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'th_inox_bandra',
        name: 'IMovies Grand — Bandra West',
        city: 'Mumbai',
        address: 'Hill Road, Near Bandra Station, Bandra West, Mumbai',
        facilities: ['Dolby Atmos', '4K RGB Laser', 'Lounge Cafe', 'Disabled Access'],
        screens: [
          {
            screenId: 'scr_03',
            screenNumber: 1,
            name: 'Screen 1 (Prime Laser)',
            screenType: 'Standard',
            rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
            seatsPerRow: 10,
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
      },
      {
        _id: 'th_cine_delhi',
        name: 'IMovies Multiplex — Connaught Place',
        city: 'Delhi',
        address: 'Radial Road 3, Inner Circle, Connaught Place, New Delhi',
        facilities: ['Dolby Atmos', '4K Projection', 'Cafe Bar', 'VIP Valet'],
        screens: [
          {
            screenId: 'scr_04',
            screenNumber: 1,
            name: 'Audi 1 (Dolby Cinema)',
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
      },
    ];

    // Create realistic showtimes for today and tomorrow
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const defaultShows: ShowDoc[] = [
      {
        _id: 'shw_stellar_mumbai_1',
        movieId: 'mov_stellar_voyage',
        theatreId: 'th_pvr_phoenix',
        screenId: 'scr_01',
        screenName: 'Audi 1 (IMAX Laser)',
        startTime: `${todayStr}T14:30:00.000Z`,
        endTime: `${todayStr}T17:15:00.000Z`,
        tierPricing: {
          silver: 250,
          gold: 380,
          platinum: 520,
        },
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'shw_stellar_mumbai_2',
        movieId: 'mov_stellar_voyage',
        theatreId: 'th_pvr_phoenix',
        screenId: 'scr_01',
        screenName: 'Audi 1 (IMAX Laser)',
        startTime: `${todayStr}T18:00:00.000Z`,
        endTime: `${todayStr}T20:45:00.000Z`,
        tierPricing: {
          silver: 290,
          gold: 420,
          platinum: 580,
        },
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'shw_shadow_mumbai_1',
        movieId: 'mov_shadow_operative',
        theatreId: 'th_pvr_phoenix',
        screenId: 'scr_02',
        screenName: 'Audi 2 (Dolby Cinema)',
        startTime: `${todayStr}T16:00:00.000Z`,
        endTime: `${todayStr}T18:25:00.000Z`,
        tierPricing: {
          silver: 220,
          gold: 340,
          platinum: 450,
        },
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'shw_crimson_bandra_1',
        movieId: 'mov_crimson_dynasty',
        theatreId: 'th_inox_bandra',
        screenId: 'scr_03',
        screenName: 'Screen 1 (Prime Laser)',
        startTime: `${todayStr}T19:30:00.000Z`,
        endTime: `${todayStr}T22:25:00.000Z`,
        tierPricing: {
          silver: 200,
          gold: 300,
          platinum: 420,
        },
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'shw_stellar_delhi_1',
        movieId: 'mov_stellar_voyage',
        theatreId: 'th_cine_delhi',
        screenId: 'scr_04',
        screenName: 'Audi 1 (Dolby Cinema)',
        startTime: `${tomorrowStr}T15:00:00.000Z`,
        endTime: `${tomorrowStr}T17:45:00.000Z`,
        tierPricing: {
          silver: 240,
          gold: 360,
          platinum: 480,
        },
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // Seed seat inventory for shows
    const defaultSeats: SeatInventoryDoc[] = [];

    defaultShows.forEach((show) => {
      const theatre = defaultTheatres.find((t) => t._id === show.theatreId);
      const screen = theatre?.screens.find((s) => s.screenId === show.screenId);
      if (!screen) return;

      screen.rows.forEach((rowLetter) => {
        let tier: 'silver' | 'gold' | 'platinum' = 'gold';
        if (screen.tierRows.silver.includes(rowLetter)) tier = 'silver';
        if (screen.tierRows.platinum.includes(rowLetter)) tier = 'platinum';

        for (let num = 1; num <= screen.seatsPerRow; num++) {
          const seatId = `${rowLetter}${num < 10 ? '0' + num : num}`;
          // Pre-book a couple of seats for realistic feel on show 1
          const isSampleBooked = show._id === 'shw_stellar_mumbai_1' && (seatId === 'D06' || seatId === 'D07' || seatId === 'G05');

          defaultSeats.push({
            _id: `${show._id}_${seatId}`,
            showId: show._id,
            seatId,
            row: rowLetter,
            number: num,
            tier,
            status: isSampleBooked ? 'booked' : 'available',
            updatedAt: new Date().toISOString(),
          });
        }
      });
    });

    this.data.users = defaultUsers;
    this.data.movies = defaultMovies;
    this.data.theatres = defaultTheatres;
    this.data.shows = defaultShows;
    this.data.seats = defaultSeats;
    this.data.bookings = [];
    this.data.notifications = [];

    this.save();
    console.log(`[IMovies DB] Successfully seeded ${defaultMovies.length} movies, ${defaultTheatres.length} cinemas, ${defaultShows.length} shows, and ${defaultSeats.length} seats.`);
  }

  // Atomic Seat Hold
  public holdSeats(showId: string, seatIds: string[], userId: string, holdMinutes = 5): { success: boolean; heldSeats?: string[]; error?: string } {
    const expiresAt = new Date(Date.now() + holdMinutes * 60 * 1000).toISOString();
    const now = new Date().toISOString();

    // 1. Verify show exists
    const show = this.shows.find((s) => s._id === showId);
    if (!show) return { success: false, error: 'Show not found' };

    // 2. Validate all requested seats are available or expired-held by someone else
    for (const seatId of seatIds) {
      const seat = this.seats.find((s) => s.showId === showId && s.seatId === seatId);
      if (!seat) {
        return { success: false, error: `Seat ${seatId} does not exist in this auditorium.` };
      }
      if (seat.status === 'booked') {
        return { success: false, error: `Seat ${seatId} is already booked by another patron.` };
      }
      if (seat.status === 'held' && seat.heldUntil && seat.heldUntil > now && seat.heldByUserId !== userId) {
        return { success: false, error: `Seat ${seatId} is temporarily reserved by another customer.` };
      }
    }

    // 3. Atomically acquire hold
    for (const seatId of seatIds) {
      const seat = this.seats.find((s) => s.showId === showId && s.seatId === seatId)!;
      seat.status = 'held';
      seat.heldByUserId = userId;
      seat.heldUntil = expiresAt;
      seat.updatedAt = now;
    }

    this.save();
    return { success: true, heldSeats: seatIds };
  }

  // Release Seat Holds
  public releaseSeats(showId: string, seatIds: string[], userId?: string) {
    let releasedCount = 0;
    const now = new Date().toISOString();
    for (const seat of this.seats) {
      if (seat.showId === showId && seatIds.includes(seat.seatId) && seat.status === 'held') {
        if (!userId || seat.heldByUserId === userId) {
          seat.status = 'available';
          seat.heldByUserId = undefined;
          seat.heldUntil = undefined;
          seat.updatedAt = now;
          releasedCount++;
        }
      }
    }
    if (releasedCount > 0) this.save();
    return releasedCount;
  }

  // Reaper for expired holds
  public reapExpiredHolds(): { showId: string; seatId: string }[] {
    const now = new Date().toISOString();
    const expired: { showId: string; seatId: string }[] = [];

    for (const seat of this.seats) {
      if (seat.status === 'held' && seat.heldUntil && seat.heldUntil <= now) {
        seat.status = 'available';
        seat.heldByUserId = undefined;
        seat.heldUntil = undefined;
        seat.updatedAt = now;
        expired.push({ showId: seat.showId, seatId: seat.seatId });
      }
    }

    if (expired.length > 0) {
      this.save();
    }
    return expired;
  }

  // Confirm Booking & Mark Seats as Booked
  public confirmBookingSeats(showId: string, seatIds: string[], bookingId: string, userId: string): boolean {
    const now = new Date().toISOString();
    for (const seatId of seatIds) {
      const seat = this.seats.find((s) => s.showId === showId && s.seatId === seatId);
      if (!seat) return false;
      // Allow confirming if held by user or available
      seat.status = 'booked';
      seat.bookingId = bookingId;
      seat.heldByUserId = undefined;
      seat.heldUntil = undefined;
      seat.updatedAt = now;
    }
    this.save();
    return true;
  }
}

export const db = new Database();
