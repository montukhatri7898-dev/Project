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
  rows: string[];
  seatsPerRow: number;
  tierRows: {
    silver: string[];
    gold: string[];
    platinum: string[];
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
  taxes: number;
  fees: number;
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

export interface PromotionDoc {
  _id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'flat' | 'percentage' | 'cashback';
  discountValue: number;
  minBookingAmount?: number;
  badge: string;
  validUntil: string;
  bannerGradient: string;
  featuredMovieTitle?: string;
  terms?: string;
}

export interface DatabaseSchema {
  users: UserDoc[];
  movies: MovieDoc[];
  theatres: TheatreDoc[];
  shows: ShowDoc[];
  seats: SeatInventoryDoc[];
  bookings: BookingDoc[];
  notifications: NotificationDoc[];
  promotions: PromotionDoc[];
}

export const REAL_WORLD_MOVIES: MovieDoc[] = [
  {
    _id: 'mov_kalki_2898_ad',
    title: 'Kalki 2898 AD',
    slug: 'kalki-2898-ad',
    description: 'Set in a post-apocalyptic world in the year 2898 AD, a select few embark on a perilous mission to protect laboratory subject SUM-80 and her unborn child, believed to be the tenth avatar of Vishnu, Kalki. Starring Prabhas as Bhairava and Amitabh Bachchan as Ashwatthama.',
    genre: ['Sci-Fi', 'Action', 'Mythological'],
    language: 'Telugu / Hindi',
    durationMinutes: 181,
    releaseDate: '2024-06-27',
    contentRating: 'UA',
    posterUrl: '/assets/posters/kalki_2898_ad.jpg',
    backdropUrl: '/assets/posters/dune_backdrop.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=kQDd1AhGIHk',
    cast: ['Prabhas', 'Amitabh Bachchan', 'Kamal Haasan', 'Deepika Padukone', 'Disha Patani'],
    status: 'now_showing',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'mov_jawan',
    title: 'Jawan',
    slug: 'jawan',
    description: 'A high-octane emotional action thriller that outlines the journey of a man driven by a personal vendetta to rectify the wrongs in society, while keeping a promise made years ago. A massive box-office spectacle directed by Atlee.',
    genre: ['Action', 'Thriller', 'Drama'],
    language: 'Hindi',
    durationMinutes: 169,
    releaseDate: '2023-09-07',
    contentRating: 'UA',
    posterUrl: '/assets/posters/jawan.jpg',
    backdropUrl: '/assets/posters/oppenheimer_backdrop.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=COv52Qyctws',
    cast: ['Shah Rukh Khan', 'Nayanthara', 'Vijay Sethupathi', 'Deepika Padukone', 'Sanya Malhotra'],
    status: 'now_showing',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'mov_stree_2',
    title: 'Stree 2: Sarkate Ka Aatank',
    slug: 'stree-2',
    description: 'After the events of Stree, the town of Chanderi is haunted by a new menace known as Sarkata who abducts progressive women. Vicky and his loyal gang must team up with the mysterious protector spirit to defeat the malevolent entity.',
    genre: ['Comedy', 'Horror'],
    language: 'Hindi',
    durationMinutes: 147,
    releaseDate: '2024-08-15',
    contentRating: 'UA',
    posterUrl: '/assets/posters/stree_2.jpg',
    backdropUrl: '/assets/posters/oppenheimer_backdrop.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=KVnheQ84kCA',
    cast: ['Rajkummar Rao', 'Shraddha Kapoor', 'Pankaj Tripathi', 'Abhishek Banerjee', 'Aparshakti Khurana'],
    status: 'now_showing',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'mov_animal',
    title: 'Animal',
    slug: 'animal',
    description: 'A ferocious, complex drama exploring the volatile relationship between a son and his emotionally aloof industrialist father that erupts into ruthless underworld violence when an assassination attempt threatens his father.',
    genre: ['Action', 'Crime', 'Drama'],
    language: 'Hindi',
    durationMinutes: 201,
    releaseDate: '2023-12-01',
    contentRating: 'A',
    posterUrl: '/assets/posters/animal.jpg',
    backdropUrl: '/assets/posters/oppenheimer_backdrop.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=Dydmpfo68DA',
    cast: ['Ranbir Kapoor', 'Anil Kapoor', 'Bobby Deol', 'Rashmika Mandanna', 'Triptii Dimri'],
    status: 'now_showing',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'mov_dune_part_two',
    title: 'Dune: Part Two',
    slug: 'dune-part-two',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future.',
    genre: ['Sci-Fi', 'Adventure', 'Action'],
    language: 'English',
    durationMinutes: 166,
    releaseDate: '2024-03-01',
    contentRating: 'UA',
    posterUrl: '/assets/posters/dune_part_two.jpg',
    backdropUrl: '/assets/posters/dune_backdrop.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem', 'Austin Butler'],
    status: 'now_showing',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'mov_oppenheimer',
    title: 'Oppenheimer',
    slug: 'oppenheimer',
    description: 'Christopher Nolans Academy Award-winning masterpiece detailing the life of theoretical physicist J. Robert Oppenheimer, the director of the Manhattan Projects Los Alamos Laboratory during World War II.',
    genre: ['Biography', 'Drama', 'History'],
    language: 'English',
    durationMinutes: 180,
    releaseDate: '2023-07-21',
    contentRating: 'A',
    posterUrl: '/assets/posters/oppenheimer.jpg',
    backdropUrl: '/assets/posters/oppenheimer_backdrop.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
    cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.', 'Florence Pugh'],
    status: 'now_showing',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'mov_rrr',
    title: 'RRR',
    slug: 'rrr',
    description: 'A fictional story about two legendary Indian revolutionaries, Alluri Sitarama Raju and Komaram Bheem, and their fight against the British Raj in 1920. Winner of the Academy Award for Best Original Song.',
    genre: ['Action', 'Drama', 'Historical'],
    language: 'Telugu / Hindi',
    durationMinutes: 182,
    releaseDate: '2022-03-25',
    contentRating: 'UA',
    posterUrl: '/assets/posters/rrr.jpg',
    backdropUrl: '/assets/posters/oppenheimer_backdrop.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=NgBoMJy3_6M',
    cast: ['N. T. Rama Rao Jr.', 'Ram Charan', 'Ajay Devgn', 'Alia Bhatt', 'Shriya Saran'],
    status: 'now_showing',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'mov_interstellar',
    title: 'Interstellar',
    slug: 'interstellar',
    description: 'In Earths future, a global crop blight and second Dust Bowl are slowly rendering the planet uninhabitable. A team of astronauts travel through a wormhole near Saturn in search of a new home for mankind.',
    genre: ['Sci-Fi', 'Adventure', 'Drama'],
    language: 'English',
    durationMinutes: 169,
    releaseDate: '2014-11-07',
    contentRating: 'UA',
    posterUrl: '/assets/posters/interstellar.jpg',
    backdropUrl: '/assets/posters/interstellar_backdrop.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine', 'Matt Damon'],
    status: 'now_showing',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'mov_pushpa_2',
    title: 'Pushpa 2: The Rule',
    slug: 'pushpa-2-the-rule',
    description: 'The unstoppable rise of Pushpa Raj in the smuggling syndicate continues, bringing him into direct, merciless conflict with SP Bhanwar Singh Shekhawat in an explosive clash of wills and firepower.',
    genre: ['Action', 'Crime', 'Thriller'],
    language: 'Telugu / Hindi',
    durationMinutes: 175,
    releaseDate: '2024-12-05',
    contentRating: 'UA',
    posterUrl: '/assets/posters/pushpa_2.jpg',
    backdropUrl: '/assets/posters/dune_backdrop.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=1kVK0MZlbI4',
    cast: ['Allu Arjun', 'Rashmika Mandanna', 'Fahadh Faasil', 'Jagapathi Babu'],
    status: 'coming_soon',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'mov_avengers_endgame',
    title: 'Avengers: Endgame',
    slug: 'avengers-endgame',
    description: 'After the devastating cosmic snap by Thanos wiped out half of all life, the remaining Avengers assemble one final time for the ultimate time heist to restore the universe.',
    genre: ['Action', 'Sci-Fi', 'Adventure'],
    language: 'English',
    durationMinutes: 181,
    releaseDate: '2019-04-26',
    contentRating: 'UA',
    posterUrl: '/assets/posters/avengers_endgame.jpg',
    backdropUrl: '/assets/posters/interstellar_backdrop.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
    cast: ['Robert Downey Jr.', 'Chris Evans', 'Mark Ruffalo', 'Chris Hemsworth', 'Scarlett Johansson'],
    status: 'coming_soon',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const REAL_WORLD_PROMOTIONS: PromotionDoc[] = [
  {
    _id: 'promo_welcome50',
    code: 'IMOVIE50',
    title: 'Welcome to IMovies',
    description: 'Get Flat ₹50 instant discount on your first cinema ticket reservation.',
    discountType: 'flat',
    discountValue: 50,
    minBookingAmount: 200,
    badge: 'WELCOME OFFER',
    validUntil: '2026-12-31',
    bannerGradient: 'from-red-950/70 to-rose-900/50',
    terms: 'Applicable on any show across all participating multiplexes.',
  },
  {
    _id: 'promo_desi20',
    code: 'DESI20',
    title: 'Indian Blockbuster Bonanza',
    description: 'Enjoy 20% OFF on Kalki 2898 AD, Jawan, Stree 2, RRR, and Animal tickets.',
    discountType: 'percentage',
    discountValue: 20,
    minBookingAmount: 300,
    badge: 'TRENDING DEAL',
    validUntil: '2026-11-30',
    bannerGradient: 'from-amber-950/70 to-orange-900/50',
    featuredMovieTitle: 'Kalki 2898 AD & Jawan',
    terms: 'Valid on Hindi, Tamil, Telugu, and Kannada language theatrical screenings.',
  },
  {
    _id: 'promo_imaxlaser',
    code: 'IMAXPASS',
    title: 'IMAX Laser Experience Special',
    description: 'Save ₹100 on premium IMAX 3D screenings for Dune: Part Two and Oppenheimer.',
    discountType: 'flat',
    discountValue: 100,
    minBookingAmount: 500,
    badge: 'IMAX EXCLUSIVE',
    validUntil: '2026-11-20',
    bannerGradient: 'from-sky-950/70 to-blue-900/50',
    terms: 'Valid on Phoenix Palladium and Connaught Place IMAX auditoriums.',
  },
  {
    _id: 'promo_matinee25',
    code: 'MATINEE25',
    title: 'Weekday Matinee Celebration',
    description: 'Flat 25% OFF on morning & matinee shows scheduled before 4:00 PM (Mon-Thu).',
    discountType: 'percentage',
    discountValue: 25,
    minBookingAmount: 250,
    badge: 'WEEKDAY SAVER',
    validUntil: '2026-12-15',
    bannerGradient: 'from-emerald-950/70 to-teal-900/50',
    terms: 'Subject to auditorium seat availability.',
  },
];

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
      promotions: [],
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
        console.log('[IMovies DB] Loaded existing database records.');
      } catch (err) {
        console.error('[IMovies DB] Error reading DB file, re-seeding:', err);
        this.seedInitialData();
      }
    } else {
      console.log('[IMovies DB] No DB file found. Seeding initial data...');
      this.seedInitialData();
    }

    // Always ensure real world movies, clean out legacy fake movies
    this.synchronizeRealWorldMovies();
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
  public get promotions() { return this.data.promotions; }

  public holdSeats(
    showId: string,
    seatIds: string[],
    userId: string,
    timeoutMinutes = 5
  ): { success: boolean; error?: string; heldSeats?: string[]; expiresAt?: string } {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + timeoutMinutes * 60 * 1000).toISOString();

    for (const seatId of seatIds) {
      const seat = this.data.seats.find((s) => s.showId === showId && s.seatId === seatId);
      if (!seat) {
        return { success: false, error: `Seat ${seatId} does not exist in this auditorium.` };
      }
      if (seat.status === 'booked') {
        return { success: false, error: `Seat ${seatId} is already booked by another patron.` };
      }
      if (seat.status === 'held' && seat.heldByUserId !== userId) {
        if (seat.heldUntil && new Date(seat.heldUntil) > now) {
          return { success: false, error: `Seat ${seatId} is currently held by another user.` };
        }
      }
    }

    for (const seatId of seatIds) {
      const seat = this.data.seats.find((s) => s.showId === showId && s.seatId === seatId);
      if (seat) {
        seat.status = 'held';
        seat.heldByUserId = userId;
        seat.heldUntil = expiresAt;
        seat.updatedAt = new Date().toISOString();
      }
    }

    this.save();
    return { success: true, heldSeats: seatIds, expiresAt };
  }

  public releaseSeats(showId: string, seatIds: string[], userId?: string): number {
    let releasedCount = 0;
    for (const seatId of seatIds) {
      const seat = this.data.seats.find((s) => s.showId === showId && s.seatId === seatId);
      if (seat && (!userId || seat.heldByUserId === userId) && seat.status === 'held') {
        seat.status = 'available';
        seat.heldByUserId = undefined;
        seat.heldUntil = undefined;
        seat.updatedAt = new Date().toISOString();
        releasedCount++;
      }
    }
    if (releasedCount > 0) this.save();
    return releasedCount;
  }

  public confirmBookingSeats(
    showId: string,
    seatIds: string[],
    bookingId: string,
    _userId?: string
  ): boolean {
    for (const seatId of seatIds) {
      const seat = this.data.seats.find((s) => s.showId === showId && s.seatId === seatId);
      if (seat) {
        seat.status = 'booked';
        seat.bookingId = bookingId;
        seat.heldByUserId = undefined;
        seat.heldUntil = undefined;
        seat.updatedAt = new Date().toISOString();
      }
    }
    this.save();
    return true;
  }

  public reapExpiredHolds(): { showId: string; seatId: string }[] {
    const now = new Date();
    const expiredList: { showId: string; seatId: string }[] = [];

    for (const seat of this.data.seats) {
      if (seat.status === 'held' && seat.heldUntil && new Date(seat.heldUntil) <= now) {
        seat.status = 'available';
        seat.heldByUserId = undefined;
        seat.heldUntil = undefined;
        seat.updatedAt = now.toISOString();
        expiredList.push({ showId: seat.showId, seatId: seat.seatId });
      }
    }

    if (expiredList.length > 0) {
      this.save();
    }
    return expiredList;
  }

  public synchronizeRealWorldMovies() {
    let modified = false;

    // 1. Remove any fake movies by ID or title
    const fakeIds = new Set([
      'mov_stellar_voyage',
      'mov_shadow_operative',
      'mov_crimson_dynasty',
      'mov_aurora_protocol',
      'mov_mumbai_velocity',
      'mov_kaal_bhairav',
      'mov_kalki_chronicles',
    ]);
    const fakeTitles = new Set([
      'Stellar Voyage',
      'Shadow Operative',
      'Crimson Dynasty',
      'Aurora Protocol',
      'Mumbai Velocity',
      'Kaal Bhairav: Forest Legend',
      'Kalki: Dawn of Dharma',
    ]);

    const initialMovieCount = this.data.movies.length;
    this.data.movies = this.data.movies.filter(
      (m) => !fakeIds.has(m._id) && !fakeTitles.has(m.title)
    );
    if (this.data.movies.length !== initialMovieCount) {
      modified = true;
    }

    // 2. Add or update all REAL_WORLD_MOVIES
    for (const realMovie of REAL_WORLD_MOVIES) {
      const idx = this.data.movies.findIndex((m) => m._id === realMovie._id || m.slug === realMovie.slug);
      if (idx >= 0) {
        // Update metadata with latest poster URLs
        this.data.movies[idx] = { ...this.data.movies[idx], ...realMovie };
        modified = true;
      } else {
        this.data.movies.push(realMovie);
        modified = true;
      }
    }

    // 3. Ensure Default Theatres exist across major Indian metropolitan cities
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
            name: 'Audi 1 (IMAX 3D Laser)',
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
            name: 'Audi 2 (Dolby Cinema)',
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
      {
        _id: 'th_nexus_bengaluru',
        name: 'IMovies Luxe — Nexus Koramangala',
        city: 'Bengaluru',
        address: 'Hosur Road, Koramangala, Bengaluru, Karnataka',
        facilities: ['IMAX 4K Laser', 'Dolby Atmos', 'Recliner Lounges', 'Valet Parking'],
        screens: [
          {
            screenId: 'scr_05',
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
        ],
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'th_prasads_hyderabad',
        name: 'IMovies Prasads — Necklace Road',
        city: 'Hyderabad',
        address: 'Necklace Road, NTR Gardens, Hyderabad, Telangana',
        facilities: ['Giant Screen', 'Dolby Atmos', '4K Projection', 'Gaming Zone'],
        screens: [
          {
            screenId: 'scr_06',
            screenNumber: 1,
            name: 'Audi 1 (Giant Screen)',
            screenType: 'IMAX 3D',
            rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
            seatsPerRow: 12,
            tierRows: {
              silver: ['A', 'B'],
              gold: ['C', 'D', 'E', 'F'],
              platinum: ['G', 'H'],
            },
          },
        ],
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'th_phoenix_pune',
        name: 'IMovies Grand — Phoenix Marketcity',
        city: 'Pune',
        address: 'Viman Nagar, Nagar Road, Pune, Maharashtra',
        facilities: ['Dolby Atmos', '4K Laser', 'Food Court', 'VIP Recliners'],
        screens: [
          {
            screenId: 'scr_07',
            screenNumber: 1,
            name: 'Screen 1 (Laser Atmos)',
            screenType: 'Dolby Cinema',
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
    ];

    for (const theatre of defaultTheatres) {
      const idx = this.data.theatres.findIndex((t) => t._id === theatre._id);
      if (idx >= 0) {
        this.data.theatres[idx] = { ...this.data.theatres[idx], ...theatre };
      } else {
        this.data.theatres.push(theatre);
        modified = true;
      }
    }

    // 4. Clean out orphan shows and seats for fake movies
    const validMovieIds = new Set(this.data.movies.map((m) => m._id));
    const initialShowCount = this.data.shows.length;
    this.data.shows = this.data.shows.filter((s) => validMovieIds.has(s.movieId));
    if (this.data.shows.length !== initialShowCount) {
      modified = true;
    }

    const validShowIds = new Set(this.data.shows.map((s) => s._id));
    const initialSeatCount = this.data.seats.length;
    this.data.seats = this.data.seats.filter((st) => validShowIds.has(st.showId));
    if (this.data.seats.length !== initialSeatCount) {
      modified = true;
    }

    // 5. Ensure active showtimes for now_showing real movies
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const nowShowingMovies = this.data.movies.filter((m) => m.status === 'now_showing');

    for (const movie of nowShowingMovies) {
      // Ensure at least 2 shows exist for this movie
      const existingShows = this.data.shows.filter((s) => s.movieId === movie._id);
      if (existingShows.length < 2) {
        this.data.theatres.forEach((theatre, thIdx) => {
          const screen = theatre.screens[0];
          if (!screen) return;

          const timeSlots = [
            { start: '14:30:00', end: '17:30:00' },
            { start: '18:45:00', end: '21:45:00' },
          ];

          timeSlots.forEach((slot, slotIdx) => {
            const dateStr = slotIdx === 0 ? todayStr : tomorrowStr;
            const showId = `shw_${movie.slug}_${theatre.city.toLowerCase()}_${slotIdx + 1}`;

            if (!this.data.shows.some((s) => s._id === showId)) {
              const newShow: ShowDoc = {
                _id: showId,
                movieId: movie._id,
                theatreId: theatre._id,
                screenId: screen.screenId,
                screenName: screen.name,
                startTime: `${dateStr}T${slot.start}.000Z`,
                endTime: `${dateStr}T${slot.end}.000Z`,
                tierPricing: {
                  silver: screen.screenType === 'IMAX 3D' ? 280 : 200,
                  gold: screen.screenType === 'IMAX 3D' ? 420 : 320,
                  platinum: screen.screenType === 'IMAX 3D' ? 580 : 450,
                },
                status: 'scheduled',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              this.data.shows.push(newShow);
              modified = true;

              // Generate auditorium seat states
              screen.rows.forEach((rowLetter) => {
                let tier: 'silver' | 'gold' | 'platinum' = 'gold';
                if (screen.tierRows.silver.includes(rowLetter)) tier = 'silver';
                if (screen.tierRows.platinum.includes(rowLetter)) tier = 'platinum';

                for (let num = 1; num <= screen.seatsPerRow; num++) {
                  const seatId = `${rowLetter}${num < 10 ? '0' + num : num}`;
                  this.data.seats.push({
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
            }
          });
        });
      }
    }

    // 6. Ensure real promotions
    this.data.promotions = REAL_WORLD_PROMOTIONS;
    modified = true;

    if (modified) {
      this.save();
      console.log(`[IMovies DB] Successfully synchronized ${this.data.movies.length} real-world movies and ${this.data.shows.length} shows.`);
    }
  }

  private seedInitialData() {
    const adminPasswordHash = bcrypt.hashSync('admin123', 10);
    const customerPasswordHash = bcrypt.hashSync('customer123', 10);

    this.data.users = [
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

    this.data.movies = REAL_WORLD_MOVIES;
    this.data.promotions = REAL_WORLD_PROMOTIONS;
    this.data.theatres = [];
    this.data.shows = [];
    this.data.seats = [];
    this.data.bookings = [];
    this.data.notifications = [];
  }
}

export const db = new Database();
