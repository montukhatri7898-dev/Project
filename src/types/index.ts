export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  preferredCity: string;
  profileImage?: string;
  createdAt: string;
}

export interface Movie {
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
  cinemaSchedules?: {
    theatre: {
      _id: string;
      name: string;
      city: string;
      address: string;
      facilities: string[];
    };
    shows: Show[];
  }[];
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

export interface Theatre {
  _id: string;
  name: string;
  city: string;
  address: string;
  facilities: string[];
  screens: ScreenConfig[];
  status: 'active' | 'inactive';
  shows?: (Show & { movie?: Partial<Movie> })[];
}

export interface Show {
  _id: string;
  movieId: string;
  theatreId: string;
  screenId: string;
  screenName: string;
  startTime: string;
  endTime: string;
  tierPricing: {
    silver: number;
    gold: number;
    platinum: number;
  };
  status: 'scheduled' | 'running' | 'completed' | 'cancelled';
  movie?: Partial<Movie>;
  theatre?: Partial<Theatre>;
  occupancy?: {
    totalSeats: number;
    availableSeats: number;
    bookedCount: number;
  };
}

export interface SeatItem {
  seatId: string;
  row: string;
  number: number;
  tier: 'silver' | 'gold' | 'platinum';
  price: number;
  status: 'available' | 'held' | 'booked';
  isMyHold?: boolean;
  heldUntil?: string;
}

export interface Booking {
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
  selectedSeats: {
    seatId: string;
    row: string;
    number: number;
    tier: 'silver' | 'gold' | 'platinum';
    price: number;
  }[];
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
  cancellationEligibility?: {
    isEligible: boolean;
    hoursRemaining: number;
    estimatedRefund: number;
    policyNotice: string;
  };
  qrCodeDataUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  _id: string;
  userId: string;
  type: 'booking_confirmed' | 'booking_cancelled' | 'payment_failed' | 'show_reminder';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AdminMetrics {
  totalRevenue: number;
  netRevenue: number;
  totalRefunded: number;
  totalBookings: number;
  confirmedCount: number;
  cancelledCount: number;
  totalMovies: number;
  nowShowingMovies: number;
  comingSoonMovies: number;
  activeCinemas: number;
  totalScreens: number;
  upcomingShows: number;
  totalShows: number;
  totalSeatsInInventory: number;
  bookedSeatsCount: number;
  heldSeatsCount: number;
  overallOccupancyPct: number;
}
