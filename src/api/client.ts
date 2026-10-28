import { User, Movie, Theatre, Show, SeatItem, Booking, NotificationItem, AdminMetrics } from '../types/index.js';
import { localDb } from '../services/localDatabase.js';

const API_BASE = '/api';

class ApiClient {
  private serverHealthy: boolean | null = null;
  private isProbing = false;

  constructor() {
    this.probeServerHealth();
  }

  private async probeServerHealth() {
    if (typeof window === 'undefined') return;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${API_BASE}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        this.serverHealthy = true;
      } else {
        this.serverHealthy = false;
      }
    } catch {
      this.serverHealthy = false;
    }
  }

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
    // If we already know the server is not responding (e.g. static Vercel deployment), bypass network lag
    if (this.serverHealthy === false) {
      throw new Error('SERVER_UNAVAILABLE');
    }

    const url = `${API_BASE}${endpoint}`;
    const headers = { ...this.getHeaders(), ...(options.headers as Record<string, string>) };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        // Returned HTML (e.g., 404 or SPA fallback from Vercel)
        this.serverHealthy = false;
        throw new Error('SERVER_UNAVAILABLE');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Network request failed');
      }

      this.serverHealthy = true;
      return data;
    } catch (err: any) {
      if (err.name === 'AbortError' || err.message === 'SERVER_UNAVAILABLE' || err.message?.includes('fetch') || err.message?.includes('Network')) {
        this.serverHealthy = false;
      }
      throw err;
    }
  }

  // --- Auth API ---
  async login(credentials: { email: string; password: string }) {
    try {
      const res = await this.request<{ success: boolean; token: string; user: User; message: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      if (res.token) {
        localStorage.setItem('imovies_token', res.token);
      }
      return res;
    } catch {
      const fallback = localDb.login(credentials);
      if (fallback.token) {
        localStorage.setItem('imovies_token', fallback.token);
      }
      return fallback;
    }
  }

  async register(data: { name: string; email: string; password: string; preferredCity?: string }) {
    try {
      const res = await this.request<{ success: boolean; token: string; user: User; message: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (res.token) {
        localStorage.setItem('imovies_token', res.token);
      }
      return res;
    } catch {
      const fallback = localDb.register(data);
      if (fallback.token) {
        localStorage.setItem('imovies_token', fallback.token);
      }
      return fallback;
    }
  }

  async logout() {
    localStorage.removeItem('imovies_token');
    try {
      return await this.request<{ success: boolean }>('/auth/logout', { method: 'POST' });
    } catch {
      return localDb.logout();
    }
  }

  async getMe() {
    try {
      return await this.request<{ success: boolean; user: User | null }>('/auth/me');
    } catch {
      return localDb.getMe();
    }
  }

  async updateProfile(updates: Partial<User>) {
    try {
      return await this.request<{ success: boolean; user: User }>('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    } catch {
      return localDb.updateProfile(updates);
    }
  }

  // --- Movies API ---
  async getMovies(params: {
    status?: string;
    search?: string;
    genre?: string;
    language?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
  } = {}) {
    try {
      const query = new URLSearchParams();
      if (params.status) query.set('status', params.status);
      if (params.search) query.set('search', params.search);
      if (params.genre) query.set('genre', params.genre);
      if (params.language) query.set('language', params.language);
      if (params.page) query.set('page', params.page.toString());
      if (params.limit) query.set('limit', params.limit.toString());
      if (params.sortBy) query.set('sortBy', params.sortBy);

      return await this.request<{
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
    } catch {
      // Seamlessly serve database movies in static publishing environment
      return localDb.getMovies(params);
    }
  }

  async getMovie(idOrSlug: string) {
    try {
      return await this.request<{ success: boolean; data: Movie }>(`/movies/${idOrSlug}`);
    } catch {
      return localDb.getMovie(idOrSlug) as any;
    }
  }

  async createMovie(movieData: Partial<Movie>) {
    try {
      return await this.request<{ success: boolean; data: Movie }>('/movies', {
        method: 'POST',
        body: JSON.stringify(movieData),
      });
    } catch {
      return localDb.createMovie(movieData);
    }
  }

  async updateMovie(id: string, movieData: Partial<Movie>) {
    try {
      return await this.request<{ success: boolean; data: Movie }>(`/movies/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(movieData),
      });
    } catch {
      return localDb.updateMovie(id, movieData);
    }
  }

  async deleteMovie(id: string) {
    try {
      return await this.request<{ success: boolean; message: string }>(`/movies/${id}`, {
        method: 'DELETE',
      });
    } catch {
      return localDb.deleteMovie(id);
    }
  }

  // --- Theatres API ---
  async getTheatres(city?: string) {
    try {
      const query = city ? `?city=${encodeURIComponent(city)}` : '';
      return await this.request<{ success: boolean; data: Theatre[]; meta: { total: number; cities: string[] } }>(
        `/theatres${query}`
      );
    } catch {
      return localDb.getTheatres(city);
    }
  }

  async getTheatre(id: string) {
    try {
      return await this.request<{ success: boolean; data: Theatre }>(`/theatres/${id}`);
    } catch {
      return localDb.getTheatre(id) as any;
    }
  }

  async createTheatre(theatreData: Partial<Theatre>) {
    return this.request<{ success: boolean; data: Theatre }>('/theatres', {
      method: 'POST',
      body: JSON.stringify(theatreData),
    });
  }

  // --- Shows API ---
  async getShows(params: { movieId?: string; theatreId?: string; date?: string; city?: string } = {}) {
    try {
      const query = new URLSearchParams();
      if (params.movieId) query.set('movieId', params.movieId);
      if (params.theatreId) query.set('theatreId', params.theatreId);
      if (params.date) query.set('date', params.date);
      if (params.city) query.set('city', params.city);

      return await this.request<{ success: boolean; data: Show[] }>(`/shows?${query.toString()}`);
    } catch {
      return localDb.getShows(params);
    }
  }

  async getShow(id: string) {
    try {
      return await this.request<{ success: boolean; data: Show }>(`/shows/${id}`);
    } catch {
      return localDb.getShow(id) as any;
    }
  }

  async getShowSeats(id: string) {
    try {
      return await this.request<{
        success: boolean;
        data: {
          showId: string;
          screenInfo: any;
          tierPricing: { silver: number; gold: number; platinum: number };
          seats: SeatItem[];
        };
      }>(`/shows/${id}/seats`);
    } catch {
      return localDb.getShowSeats(id) as any;
    }
  }

  async holdSeats(showId: string, seatIds: string[]) {
    try {
      return await this.request<{
        success: boolean;
        data: { showId: string; heldSeats: string[]; expiresAt: string; holdDurationSeconds: number };
        message: string;
      }>(`/shows/${showId}/hold`, {
        method: 'POST',
        body: JSON.stringify({ seatIds }),
      });
    } catch {
      return localDb.holdSeats(showId, seatIds) as any;
    }
  }

  async releaseSeats(showId: string, seatIds: string[]) {
    try {
      return await this.request<{ success: boolean; releasedCount: number }>(`/shows/${showId}/release`, {
        method: 'POST',
        body: JSON.stringify({ seatIds }),
      });
    } catch {
      return localDb.releaseSeats(showId, seatIds);
    }
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

  // --- Bookings API ---
  async createBooking(showId: string, seatIds: string[]) {
    try {
      return await this.request<{ success: boolean; data: Booking; message: string }>('/bookings', {
        method: 'POST',
        body: JSON.stringify({ showId, seatIds }),
      });
    } catch {
      return localDb.createBooking(showId, seatIds) as any;
    }
  }

  async getMyBookings() {
    try {
      return await this.request<{
        success: boolean;
        data: { all: Booking[]; upcoming: Booking[]; completed: Booking[]; cancelled: Booking[] };
      }>('/bookings/my');
    } catch {
      return localDb.getMyBookings();
    }
  }

  async getBooking(id: string) {
    try {
      return await this.request<{ success: boolean; data: Booking }>(`/bookings/${id}`);
    } catch {
      return localDb.getBooking(id) as any;
    }
  }

  async cancelBooking(id: string, reason?: string) {
    try {
      return await this.request<{ success: boolean; data: Booking; message: string }>(`/bookings/${id}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
    } catch {
      return localDb.cancelBooking(id, reason) as any;
    }
  }

  // --- Payments API ---
  async createPaymentOrder(bookingId: string) {
    try {
      return await this.request<{
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
    } catch {
      return localDb.createPaymentOrder(bookingId) as any;
    }
  }

  async verifyPayment(data: {
    bookingId: string;
    orderId: string;
    paymentId: string;
    paymentMethod: string;
  }) {
    try {
      return await this.request<{ success: boolean; data: Booking; message: string }>('/payments/verify', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      return localDb.verifyPayment(data) as any;
    }
  }

  // --- Admin API ---
  async getAdminDashboard() {
    try {
      return await this.request<{
        success: boolean;
        data: { metrics: AdminMetrics; recentBookings: any[] };
      }>('/admin/dashboard');
    } catch {
      return localDb.getAdminDashboard();
    }
  }

  async getAdminBookings(params: { search?: string; status?: string; page?: number; limit?: number } = {}) {
    try {
      const query = new URLSearchParams();
      if (params.search) query.set('search', params.search);
      if (params.status) query.set('status', params.status);
      if (params.page) query.set('page', params.page.toString());
      if (params.limit) query.set('limit', params.limit.toString());

      return await this.request<{
        success: boolean;
        data: Booking[];
        meta: { total: number; page: number; limit: number; totalPages: number };
      }>(`/admin/bookings?${query.toString()}`);
    } catch {
      return localDb.getAdminBookings(params);
    }
  }

  // --- Notifications API ---
  async getNotifications() {
    try {
      return await this.request<{
        success: boolean;
        data: NotificationItem[];
        meta: { unreadCount: number };
      }>('/notifications');
    } catch {
      return localDb.getNotifications();
    }
  }

  async markNotificationRead(id: string) {
    try {
      return await this.request<{ success: boolean }>(`/notifications/${id}/read`, {
        method: 'PATCH',
      });
    } catch {
      return { success: true };
    }
  }

  async markAllNotificationsRead() {
    try {
      return await this.request<{ success: boolean; count: number }>('/notifications/read-all', {
        method: 'POST',
      });
    } catch {
      return { success: true, count: 1 };
    }
  }

  // --- Promotions API ---
  async getPromotions() {
    try {
      return await this.request<{ success: boolean; data: any[]; meta: { count: number } }>('/promotions');
    } catch {
      return localDb.getPromotions();
    }
  }

  async verifyPromotion(code: string, amount: number) {
    try {
      return await this.request<{
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
    } catch {
      return localDb.verifyPromotion(code, amount) as any;
    }
  }
}

export const api = new ApiClient();
