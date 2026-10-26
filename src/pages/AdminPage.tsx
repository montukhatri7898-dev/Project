import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Film,
  Calendar,
  Building,
  Ticket,
  TrendingUp,
  Plus,
  Trash2,
  Edit2,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
} from 'lucide-react';
import { AdminMetrics, Movie, Theatre, Show, Booking } from '../types/index.js';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';

interface AdminPageProps {
  onNavigate: (view: string, params?: any) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const { user, quickLogin } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'movies' | 'theatres' | 'shows' | 'bookings'>('overview');

  // Dashboard Stats
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  // Entities
  const [movies, setMovies] = useState<Movie[]>([]);
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [shows, setShows] = useState<Show[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Add Movie Modal State
  const [showAddMovieModal, setShowAddMovieModal] = useState(false);
  const [newMovieTitle, setNewMovieTitle] = useState('');
  const [newMovieDesc, setNewMovieDesc] = useState('');
  const [newMovieGenre, setNewMovieGenre] = useState('Action, Sci-Fi');
  const [newMovieLang, setNewMovieLang] = useState('English');
  const [newMovieDuration, setNewMovieDuration] = useState(140);
  const [newMovieRelease, setNewMovieRelease] = useState(new Date().toISOString().split('T')[0]);
  const [newMovieRating, setNewMovieRating] = useState<'U' | 'UA' | 'A'>('UA');
  const [newMoviePoster, setNewMoviePoster] = useState('/src/assets/images/poster_stellar_voyage_1792988110200.jpg');

  // Schedule Show State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleMovieId, setScheduleMovieId] = useState('');
  const [scheduleTheatreId, setScheduleTheatreId] = useState('');
  const [scheduleScreenId, setScheduleScreenId] = useState('');
  const [scheduleStartTime, setScheduleStartTime] = useState('');
  const [scheduleSilverPrice, setScheduleSilverPrice] = useState(220);
  const [scheduleGoldPrice, setScheduleGoldPrice] = useState(350);
  const [schedulePlatinumPrice, setSchedulePlatinumPrice] = useState(480);

  // Bookings Filter State
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAllAdminData();
    }
  }, [user]);

  const loadAllAdminData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashRes, moviesRes, theatresRes, showsRes, bookingsRes] = await Promise.all([
        api.getAdminDashboard(),
        api.getMovies({ status: 'all', limit: 50 }),
        api.getTheatres(),
        api.getShows(),
        api.getAdminBookings({ limit: 50 }),
      ]);

      if (dashRes.success) {
        setMetrics(dashRes.data.metrics);
        setRecentBookings(dashRes.data.recentBookings);
      }
      if (moviesRes.success) setMovies(moviesRes.data);
      if (theatresRes.success) {
        setTheatres(theatresRes.data);
        if (theatresRes.data.length > 0) {
          setScheduleTheatreId(theatresRes.data[0]._id);
          setScheduleScreenId(theatresRes.data[0].screens[0]?.screenId || '');
        }
      }
      if (showsRes.success) setShows(showsRes.data);
      if (bookingsRes.success) setAllBookings(bookingsRes.data);
      if (moviesRes.data.length > 0) {
        setScheduleMovieId(moviesRes.data[0]._id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load administration data.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      const res = await api.createMovie({
        title: newMovieTitle,
        description: newMovieDesc,
        genre: newMovieGenre.split(',').map((g) => g.trim()),
        language: newMovieLang,
        durationMinutes: Number(newMovieDuration),
        releaseDate: newMovieRelease,
        contentRating: newMovieRating,
        posterUrl: newMoviePoster,
        status: 'now_showing',
      });

      if (res.success) {
        setShowAddMovieModal(false);
        setSuccessMsg(`Movie "${newMovieTitle}" added to catalog.`);
        loadAllAdminData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create movie.');
    }
  };

  const handleDeleteMovie = async (movieId: string) => {
    if (!confirm('Are you sure you want to remove or archive this movie?')) return;
    try {
      const res = await api.deleteMovie(movieId);
      if (res.success) {
        setSuccessMsg(res.message);
        loadAllAdminData();
      }
    } catch (err: any) {
      setError(err.message || 'Could not delete movie.');
    }
  };

  const handleScheduleShow = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      const res = await api.createShow({
        movieId: scheduleMovieId,
        theatreId: scheduleTheatreId,
        screenId: scheduleScreenId,
        startTime: new Date(scheduleStartTime).toISOString(),
        tierPricing: {
          silver: Number(scheduleSilverPrice),
          gold: Number(scheduleGoldPrice),
          platinum: Number(schedulePlatinumPrice),
        },
      });

      if (res.success) {
        setShowScheduleModal(false);
        setSuccessMsg(res.message);
        loadAllAdminData();
      }
    } catch (err: any) {
      setError(err.message || 'Scheduling failed. Please verify screen availability.');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white">Administrator Access Required</h2>
        <p className="text-xs text-gray-400">
          Sign in with administrator credentials to manage movies, cinemas, screens, and schedules.
        </p>
        <button
          onClick={() => quickLogin('admin')}
          className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-md"
        >
          1-Click Demo Admin Login
        </button>
      </div>
    );
  }

  const selectedTheatreDoc = theatres.find((t) => t._id === scheduleTheatreId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            Cinema Operations & Management
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time revenue metrics, screen schedules, catalog inventory, and booking audit
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddMovieModal(true)}
            className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Movie</span>
          </button>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Schedule Show</span>
          </button>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {error && (
        <div className="p-3 rounded-lg bg-red-950/50 border border-red-500/30 text-xs text-red-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-950/50 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex border-b border-white/10">
        {[
          { id: 'overview', label: 'Dashboard Overview', icon: TrendingUp },
          { id: 'movies', label: `Movie Catalog (${movies.length})`, icon: Film },
          { id: 'shows', label: `Show Schedules (${shows.length})`, icon: Calendar },
          { id: 'theatres', label: `Multiplexes & Screens (${theatres.length})`, icon: Building },
          { id: 'bookings', label: `Patron Bookings (${allBookings.length})`, icon: Ticket },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`pb-3 px-4 text-xs font-semibold transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
                activeTab === t.id
                  ? 'border-amber-400 text-white font-bold'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content 1: Dashboard Overview */}
      {activeTab === 'overview' && metrics && (
        <div className="space-y-6">
          {/* Key KPI Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-[#14161D] border border-white/10">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                Confirmed Gross Revenue
              </span>
              <span className="text-2xl font-bold font-mono text-emerald-400 block mt-2">
                ₹{metrics.totalRevenue}
              </span>
              <span className="text-[10px] text-gray-500 mt-1 block">From verified ticket transactions</span>
            </div>

            <div className="p-5 rounded-xl bg-[#14161D] border border-white/10">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                Total Bookings
              </span>
              <span className="text-2xl font-bold font-mono text-white block mt-2">
                {metrics.totalBookings}
              </span>
              <span className="text-[10px] text-gray-400 mt-1 block">
                {metrics.confirmedCount} confirmed · {metrics.cancelledCount} cancelled
              </span>
            </div>

            <div className="p-5 rounded-xl bg-[#14161D] border border-white/10">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                Auditorium Occupancy
              </span>
              <span className="text-2xl font-bold font-mono text-sky-400 block mt-2">
                {metrics.overallOccupancyPct}%
              </span>
              <span className="text-[10px] text-gray-500 mt-1 block">
                {metrics.bookedSeatsCount} booked of {metrics.totalSeatsInInventory} seats
              </span>
            </div>

            <div className="p-5 rounded-xl bg-[#14161D] border border-white/10">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                Active Multiplexes
              </span>
              <span className="text-2xl font-bold font-mono text-amber-400 block mt-2">
                {metrics.activeCinemas}
              </span>
              <span className="text-[10px] text-gray-500 mt-1 block">{metrics.totalScreens} active screens</span>
            </div>
          </div>

          {/* Recent Bookings Table */}
          <div className="p-6 bg-[#14161D] border border-white/10 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white tracking-tight">Recent Customer Bookings</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 uppercase text-[10px] tracking-wider">
                    <th className="pb-3 font-semibold">Reference</th>
                    <th className="pb-3 font-semibold">Patron</th>
                    <th className="pb-3 font-semibold">Movie Title</th>
                    <th className="pb-3 font-semibold">Auditorium</th>
                    <th className="pb-3 font-semibold">Seats</th>
                    <th className="pb-3 font-semibold">Amount</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {recentBookings.map((b) => (
                    <tr key={b._id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 font-mono font-medium text-white">{b.bookingReference}</td>
                      <td className="py-3">{b.customerName}</td>
                      <td className="py-3 text-white font-medium">{b.movieTitle}</td>
                      <td className="py-3 text-gray-400">{b.theatreName}</td>
                      <td className="py-3 font-mono">{b.seatsCount}</td>
                      <td className="py-3 font-mono font-bold text-white">₹{b.totalAmount}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold ${
                            b.bookingStatus === 'confirmed'
                              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                              : 'bg-red-950/60 text-red-300 border border-red-500/30'
                          }`}
                        >
                          {b.bookingStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Movie Management */}
      {activeTab === 'movies' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Catalog Inventory ({movies.length} Movies)</h3>
            <button
              onClick={() => setShowAddMovieModal(true)}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Movie</span>
            </button>
          </div>

          <div className="overflow-x-auto bg-[#14161D] border border-white/10 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 uppercase text-[10px] tracking-wider bg-white/5">
                  <th className="p-3 font-semibold">Poster</th>
                  <th className="p-3 font-semibold">Title & Details</th>
                  <th className="p-3 font-semibold">Genre</th>
                  <th className="p-3 font-semibold">Duration</th>
                  <th className="p-3 font-semibold">Rating</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {movies.map((m) => (
                  <tr key={m._id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3">
                      <img src={m.posterUrl} alt={m.title} className="w-10 h-14 object-cover rounded bg-black" />
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-white">{m.title}</div>
                      <div className="text-[11px] text-gray-400">{m.language} · Released {m.releaseDate}</div>
                    </td>
                    <td className="p-3 text-gray-400">{m.genre.join(', ')}</td>
                    <td className="p-3 font-mono">{m.durationMinutes}m</td>
                    <td className="p-3">
                      <span className="border border-white/20 px-1 py-0.5 rounded text-[10px] text-gray-300 font-mono">
                        {m.contentRating}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold ${
                          m.status === 'now_showing'
                            ? 'bg-emerald-950/60 text-emerald-300'
                            : m.status === 'coming_soon'
                            ? 'bg-amber-950/60 text-amber-300'
                            : 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        {m.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteMovie(m._id)}
                        className="p-1.5 rounded hover:bg-red-950/40 text-red-400 hover:text-red-300 transition-colors"
                        title="Delete / Archive Movie"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content 3: Show Schedules */}
      {activeTab === 'shows' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Scheduled Shows ({shows.length})</h3>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule New Show</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shows.map((show) => {
              const sDate = new Date(show.startTime);
              const eDate = new Date(show.endTime);
              return (
                <div key={show._id} className="p-4 rounded-xl bg-[#14161D] border border-white/10 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{show.movie?.title || 'Movie'}</h4>
                      <div className="text-xs text-red-400 mt-0.5">{show.theatre?.name}</div>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded">
                      {show.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-300 font-mono">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>
                      {sDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                      {eDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{sDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-gray-400 font-mono">
                    <span>
                      Prices: ₹{show.tierPricing.silver} (Sil) · ₹{show.tierPricing.gold} (Gld) · ₹{show.tierPricing.platinum} (Plat)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab Content 4: Theatres & Screens */}
      {activeTab === 'theatres' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white">Active Theatres ({theatres.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {theatres.map((th) => (
              <div key={th._id} className="p-5 rounded-xl bg-[#14161D] border border-white/10 space-y-4">
                <div>
                  <h4 className="font-bold text-white text-base">{th.name}</h4>
                  <p className="text-xs text-gray-400">{th.address} · {th.city}</p>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                    Configured Screens
                  </span>
                  {th.screens.map((sc) => (
                    <div key={sc.screenId} className="p-2.5 rounded bg-white/5 border border-white/5 text-xs flex justify-between">
                      <div>
                        <span className="font-medium text-white">{sc.name}</span>
                        <span className="text-gray-400 block text-[11px]">{sc.screenType}</span>
                      </div>
                      <div className="text-right text-gray-300 font-mono">
                        {sc.rows.length * sc.seatsPerRow} Seats
                        <span className="text-[10px] text-gray-500 block">
                          Rows {sc.rows[0]} - {sc.rows[sc.rows.length - 1]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content 5: Bookings Search & Filter */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                placeholder="Search by Booking Ref, Patron Name, or Movie..."
                className="w-full bg-[#14161D] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
              />
            </div>
            <select
              value={bookingStatusFilter}
              onChange={(e) => setBookingStatusFilter(e.target.value)}
              className="bg-[#14161D] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="overflow-x-auto bg-[#14161D] border border-white/10 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 uppercase text-[10px] tracking-wider bg-white/5">
                  <th className="p-3 font-semibold">Ref</th>
                  <th className="p-3 font-semibold">Patron Info</th>
                  <th className="p-3 font-semibold">Movie & Cinema</th>
                  <th className="p-3 font-semibold">Seats</th>
                  <th className="p-3 font-semibold">Total Paid</th>
                  <th className="p-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {allBookings
                  .filter((b) => {
                    const matchSearch =
                      !bookingSearch ||
                      b.bookingReference.toLowerCase().includes(bookingSearch.toLowerCase()) ||
                      b.userName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
                      b.movieSnapshot.title.toLowerCase().includes(bookingSearch.toLowerCase());
                    const matchStatus =
                      bookingStatusFilter === 'all' || b.bookingStatus === bookingStatusFilter;
                    return matchSearch && matchStatus;
                  })
                  .map((b) => (
                    <tr key={b._id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-mono font-bold text-white">{b.bookingReference}</td>
                      <td className="p-3">
                        <div className="font-medium text-white">{b.userName}</div>
                        <div className="text-[11px] text-gray-400">{b.userEmail}</div>
                      </td>
                      <td className="p-3">
                        <div className="text-white font-medium">{b.movieSnapshot.title}</div>
                        <div className="text-[11px] text-gray-400">{b.theatreSnapshot.name}</div>
                      </td>
                      <td className="p-3 font-mono">
                        {b.selectedSeats.map((s) => s.seatId).join(', ')}
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-400">₹{b.totalAmount}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold ${
                            b.bookingStatus === 'confirmed'
                              ? 'bg-emerald-950/60 text-emerald-300'
                              : 'bg-red-950/60 text-red-300'
                          }`}
                        >
                          {b.bookingStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Movie Modal */}
      {showAddMovieModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#14161D] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white">Add New Movie to Catalog</h3>
              <button onClick={() => setShowAddMovieModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMovie} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-medium mb-1">Movie Title</label>
                <input
                  type="text"
                  required
                  value={newMovieTitle}
                  onChange={(e) => setNewMovieTitle(e.target.value)}
                  placeholder="e.g. Interstellar Odyssey"
                  className="w-full bg-[#0B0C10] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Synopsis / Description</label>
                <textarea
                  required
                  rows={3}
                  value={newMovieDesc}
                  onChange={(e) => setNewMovieDesc(e.target.value)}
                  placeholder="Compelling plot summary..."
                  className="w-full bg-[#0B0C10] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Genres (comma-separated)</label>
                  <input
                    type="text"
                    value={newMovieGenre}
                    onChange={(e) => setNewMovieGenre(e.target.value)}
                    className="w-full bg-[#0B0C10] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Language</label>
                  <input
                    type="text"
                    value={newMovieLang}
                    onChange={(e) => setNewMovieLang(e.target.value)}
                    className="w-full bg-[#0B0C10] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Duration (Min)</label>
                  <input
                    type="number"
                    value={newMovieDuration}
                    onChange={(e) => setNewMovieDuration(Number(e.target.value))}
                    className="w-full bg-[#0B0C10] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Release Date</label>
                  <input
                    type="date"
                    value={newMovieRelease}
                    onChange={(e) => setNewMovieRelease(e.target.value)}
                    className="w-full bg-[#0B0C10] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Rating</label>
                  <select
                    value={newMovieRating}
                    onChange={(e) => setNewMovieRating(e.target.value as any)}
                    className="w-full bg-[#0B0C10] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="U">U (Universal)</option>
                    <option value="UA">UA (Parental)</option>
                    <option value="A">A (Adults 18+)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Poster Asset Path / URL</label>
                <input
                  type="text"
                  value={newMoviePoster}
                  onChange={(e) => setNewMoviePoster(e.target.value)}
                  className="w-full bg-[#0B0C10] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-red-500 font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddMovieModal(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Save Movie to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Show Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#14161D] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white">Schedule Show (Collision-Checked)</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleShow} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-medium mb-1">Select Movie</label>
                <select
                  value={scheduleMovieId}
                  onChange={(e) => setScheduleMovieId(e.target.value)}
                  className="w-full bg-[#0B0C10] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-red-500"
                >
                  {movies.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.title} ({m.durationMinutes}m · {m.language})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Cinema Multiplex</label>
                  <select
                    value={scheduleTheatreId}
                    onChange={(e) => {
                      setScheduleTheatreId(e.target.value);
                      const t = theatres.find((x) => x._id === e.target.value);
                      if (t && t.screens.length > 0) setScheduleScreenId(t.screens[0].screenId);
                    }}
                    className="w-full bg-[#0B0C10] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-red-500"
                  >
                    {theatres.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Auditorium / Screen</label>
                  <select
                    value={scheduleScreenId}
                    onChange={(e) => setScheduleScreenId(e.target.value)}
                    className="w-full bg-[#0B0C10] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-red-500"
                  >
                    {selectedTheatreDoc?.screens.map((sc) => (
                      <option key={sc.screenId} value={sc.screenId}>
                        {sc.name} ({sc.screenType})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Show Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={scheduleStartTime}
                  onChange={(e) => setScheduleStartTime(e.target.value)}
                  className="w-full bg-[#0B0C10] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Silver Price (₹)</label>
                  <input
                    type="number"
                    value={scheduleSilverPrice}
                    onChange={(e) => setScheduleSilverPrice(Number(e.target.value))}
                    className="w-full bg-[#0B0C10] border border-white/10 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Gold Price (₹)</label>
                  <input
                    type="number"
                    value={scheduleGoldPrice}
                    onChange={(e) => setScheduleGoldPrice(Number(e.target.value))}
                    className="w-full bg-[#0B0C10] border border-white/10 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Platinum Price (₹)</label>
                  <input
                    type="number"
                    value={schedulePlatinumPrice}
                    onChange={(e) => setSchedulePlatinumPrice(Number(e.target.value))}
                    className="w-full bg-[#0B0C10] border border-white/10 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <p className="text-[11px] text-gray-500 leading-relaxed pt-1">
                The server will calculate the end time based on the movie duration + 20-minute turnaround buffer and block overlapping shows.
              </p>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Verify & Schedule Show
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
