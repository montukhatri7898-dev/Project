import { User, Movie, Theatre, Show, SeatItem, Booking, NotificationItem, AdminMetrics } from '../types/index.js';

const API_BASE = '/api';

class ApiClient {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('imovies_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers = { ...this.getHeaders(), ...(options.headers as Record<string, string>) };

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Network request failed');
    }

    return data;
  }

  // Auth API
  async login(credentials: { email: string; password: string }) {
    const res = await this.request<{ success: boolean; token: string; user: User; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (res.token) {
      localStorage.setItem('imovies_token', res.token);
    }
    return res;
  }

  async register(data: { name: string; email: string; password: string; preferredCity?: string }) {
    const res = await this.request<{ success: boolean; token: string; user: User; message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.token) {
      localStorage.setItem('imovies_token', res.token);
    }
    return res;
  }

  async logout() {
    localStorage.removeItem('imovies_token');
    return this.request<{ success: boolean }>('/auth/logout', { method: 'POST' });
  }

  async getMe() {
    return this.request<{ success: boolean; user: User | null }>('/auth/me');
  }

  async updateProfile(updates: Partial<User>) {
    return this.request<{ success: boolean; user: User }>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Movies API
  async getMovies(params: {
    status?: string;
    search?: string;
    genre?: string;
    language?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
  } = {}) {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.search) query.set('search', params.search);
    if (params.genre) query.set('genre', params.genre);
    if (params.language) query.set('language', params.language);
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.sortBy) query.set('sortBy', params.sortBy);

    return this.request<{
      success: boolean;
      data: Movie[];
      meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        facets: { genres: string[]; languages: string[] };
      };
    }>(`/movies?${query.toString()}`);
  }

  async getMovie(idOrSlug: string) {
    return this.request<{ success: boolean; data: Movie }>(`/movies/${idOrSlug}`);
  }

  async createMovie(movieData: Partial<Movie>) {
    return this.request<{ success: boolean; data: Movie }>('/movies', {
      method: 'POST',
      body: JSON.stringify(movieData),
    });
  }

  async updateMovie(id: string, movieData: Partial<Movie>) {
    return this.request<{ success: boolean; data: Movie }>(`/movies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(movieData),
    });
  }

  async deleteMovie(id: string) {
    return this.request<{ success: boolean; message: string }>(`/movies/${id}`, {
      method: 'DELETE',
    });
  }

  // Theatres API
  async getTheatres(city?: string) {
    const query = city ? `?city=${encodeURIComponent(city)}` : '';
    return this.request<{ success: boolean; data: Theatre[]; meta: { total: number; cities: string[] } }>(
      `/theatres${query}`
    );
  }

  async getTheatre(id: string) {
    return this.request<{ success: boolean; data: Theatre }>(`/theatres/${id}`);
  }

  async createTheatre(theatreData: Partial<Theatre>) {
    return this.request<{ success: boolean; data: Theatre }>('/theatres', {
      method: 'POST',
      body: JSON.stringify(theatreData),
    });
  }

  // Shows API
  async getShows(params: { movieId?: string; theatreId?: string; date?: string; city?: string } = {}) {
    const query = new URLSearchParams();
    if (params.movieId) query.set('movieId', params.movieId);
    if (params.theatreId) query.set('theatreId', params.theatreId);
    if (params.date) query.set('date', params.date);
    if (params.city) query.set('city', params.city);

    return this.request<{ success: boolean; data: Show[] }>(`/shows?${query.toString()}`);
  }

  async getShow(id: string) {
    return this.request<{ success: boolean; data: Show }>(`/shows/${id}`);
  }

  async getShowSeats(id: string) {
    return this.request<{
      success: boolean;
      data: {
        showId: string;
        screenInfo: any;
        tierPricing: { silver: number; gold: number; platinum: number };
        seats: SeatItem[];
      };
    }>(`/shows/${id}/seats`);
  }

  async holdSeats(showId: string, seatIds: string[]) {
    return this.request<{
      success: boolean;
      data: { showId: string; heldSeats: string[]; expiresAt: string; holdDurationSeconds: number };
      message: string;
    }>(`/shows/${showId}/hold`, {
      method: 'POST',
      body: JSON.stringify({ seatIds }),
    });
  }

  async releaseSeats(showId: string, seatIds: string[]) {
    return this.request<{ success: boolean; releasedCount: number }>(`/shows/${showId}/release`, {
      method: 'POST',
      body: JSON.stringify({ seatIds }),
    });
  }

  async createShow(showData: {
    movieId: string;
    theatreId: string;
    screenId: string;
    startTime: string;
    tierPricing: { silver: number; gold: number; platinum: number };
  }) {
    return this.request<{ success: boolean; data: Show; message: string }>('/shows', {
      method: 'POST',
      body: JSON.stringify(showData),
    });
  }

  // Bookings API
  async createBooking(showId: string, seatIds: string[]) {
    return this.request<{ success: boolean; data: Booking; message: string }>('/bookings', {
      method: 'POST',
      body: JSON.stringify({ showId, seatIds }),
    });
  }

  async getMyBookings() {
    return this.request<{
      success: boolean;
      data: { all: Booking[]; upcoming: Booking[]; completed: Booking[]; cancelled: Booking[] };
    }>('/bookings/my');
  }

  async getBooking(id: string) {
    return this.request<{ success: boolean; data: Booking }>(`/bookings/${id}`);
  }

  async cancelBooking(id: string, reason?: string) {
    return this.request<{ success: boolean; data: Booking; message: string }>(`/bookings/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Payments API
  async createPaymentOrder(bookingId: string) {
    return this.request<{
      success: boolean;
      data: {
        orderId: string;
        bookingId: string;
        amount: number;
        currency: string;
        bookingReference: string;
        movieTitle: string;
        customerName: string;
        customerEmail: string;
      };
    }>('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ bookingId }),
    });
  }

  async verifyPayment(data: {
    bookingId: string;
    orderId: string;
    paymentId: string;
    paymentMethod: string;
  }) {
    return this.request<{ success: boolean; data: Booking; message: string }>('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Admin API
  async getAdminDashboard() {
    return this.request<{
      success: boolean;
      data: { metrics: AdminMetrics; recentBookings: any[] };
    }>('/admin/dashboard');
  }

  async getAdminBookings(params: { search?: string; status?: string; page?: number; limit?: number } = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.status) query.set('status', params.status);
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());

    return this.request<{
      success: boolean;
      data: Booking[];
      meta: { total: number; page: number; limit: number; totalPages: number };
    }>(`/admin/bookings?${query.toString()}`);
  }

  // Notifications API
  async getNotifications() {
    return this.request<{
      success: boolean;
      data: NotificationItem[];
      meta: { unreadCount: number };
    }>('/notifications');
  }

  async markNotificationRead(id: string) {
    return this.request<{ success: boolean }>(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }

  async markAllNotificationsRead() {
    return this.request<{ success: boolean; count: number }>('/notifications/read-all', {
      method: 'POST',
    });
  }

  // Promotions API
  async getPromotions() {
    return this.request<{ success: boolean; data: any[]; meta: { count: number } }>('/promotions');
  }

  async verifyPromotion(code: string, amount: number) {
    return this.request<{
      success: boolean;
      data: {
        code: string;
        title: string;
        discountType: string;
        discountAmount: number;
        finalAmount: number;
        badge: string;
      };
      message: string;
    }>('/promotions/verify', {
      method: 'POST',
      body: JSON.stringify({ code, amount }),
    });
  }
}

export const api = new ApiClient();
