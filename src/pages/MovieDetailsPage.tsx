import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Calendar, MapPin, Clock, Film, ShieldAlert, Sparkles, Check } from 'lucide-react';
import { Movie, Show } from '../types/index.js';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';
import { localDb } from '../services/localDatabase.js';

interface MovieDetailsPageProps {
  movieId: string;
  onNavigate: (view: string, params?: any) => void;
}

export const MovieDetailsPage: React.FC<MovieDetailsPageProps> = ({ movieId, onNavigate }) => {
  const { selectedCity } = useAuth();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Date selection (Today, Tomorrow, Day 3)
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const tomorrowStr = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const day3Str = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  useEffect(() => {
    loadMovie();
  }, [movieId]);

  const loadMovie = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getMovie(movieId);
      if (res?.success && res.data) {
        setMovie(res.data);
      } else {
        const fallback = localDb.getMovie(movieId);
        if (fallback.success && fallback.data) {
          setMovie(fallback.data as Movie);
        } else {
          setError('Movie details could not be found.');
        }
      }
    } catch (err: any) {
      const fallback = localDb.getMovie(movieId);
      if (fallback.success && fallback.data) {
        setMovie(fallback.data as Movie);
      } else {
        setError(err.message || 'Failed to load movie details');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-sm text-red-400 mb-4">{error || 'Movie not found'}</p>
        <button
          onClick={() => onNavigate('movies')}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-xs text-white rounded-lg transition-colors cursor-pointer"
        >
          Back to Movies
        </button>
      </div>
    );
  }

  // Filter shows by selected date
  const filteredCinemaSchedules = (movie.cinemaSchedules || [])
    .map((schedule) => {
      const showsForDate = schedule.shows.filter((s) => s.startTime.startsWith(selectedDate));
      return {
        ...schedule,
        shows: showsForDate,
      };
    })
    .filter((schedule) => schedule.shows.length > 0);

  return (
    <div className="space-y-10">
      {/* Back button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <button
          onClick={() => onNavigate('movies')}
          className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Movie Listings</span>
        </button>
      </div>

      {/* Backdrop Header */}
      <section className="relative w-full h-[400px] sm:h-[460px] max-w-7xl mx-auto rounded-2xl overflow-hidden border border-white/10">
        <img
          src={movie.backdropUrl || movie.posterUrl}
          alt={movie.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10] via-[#0B0C10]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0C10]/95 via-[#0B0C10]/60 to-transparent" />

        <div className="absolute inset-0 p-6 sm:p-10 flex flex-col sm:flex-row items-end sm:items-center gap-6 z-10">
          {/* Small Poster */}
          <div className="hidden sm:block w-44 aspect-[3/4] rounded-lg overflow-hidden border border-white/20 shadow-2xl shrink-0 bg-[#14161D]">
            <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
          </div>

          <div className="max-w-2xl">
            {/* Unboxed Metadata */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-300 mb-2">
              <span className="text-red-500 font-semibold">{movie.genre?.join(', ')}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{movie.durationMinutes} min</span>
              <span aria-hidden="true">·</span>
              <span>{movie.language}</span>
              <span aria-hidden="true">·</span>
              <span className="border border-white/20 px-1 py-0.5 rounded text-[10px] text-gray-200">
                {movie.contentRating}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">
              {movie.title}
            </h1>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed line-clamp-3 mb-5">
              {movie.description}
            </p>

            <div className="flex items-center gap-3">
              {movie.trailerUrl && (
                <a
                  href={movie.trailerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium backdrop-blur-md border border-white/20 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                  Watch Official Trailer
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Details and Showtime Booking Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Showtimes & Cinemas */}
        <div className="lg:col-span-2 space-y-6">
          {/* Date Picker Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-red-500" />
              Available Showtimes
            </h2>
            <div className="text-xs text-gray-400">
              City: <span className="text-white font-medium">{selectedCity}</span>
            </div>
          </div>

          {/* Date Selector Segmented Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {[
              { date: todayStr, label: 'Today', sub: now.toLocaleDateString([], { month: 'short', day: 'numeric' }) },
              {
                date: tomorrowStr,
                label: 'Tomorrow',
                sub: new Date(now.getTime() + 24 * 3600 * 1000).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                }),
              },
              {
                date: day3Str,
                label: new Date(now.getTime() + 48 * 3600 * 1000).toLocaleDateString([], { weekday: 'short' }),
                sub: new Date(now.getTime() + 48 * 3600 * 1000).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                }),
              },
            ].map((d) => (
              <button
                key={d.date}
                onClick={() => setSelectedDate(d.date)}
                className={`flex flex-col items-center py-2 px-4 rounded-lg border text-xs transition-all cursor-pointer ${
                  selectedDate === d.date
                    ? 'bg-red-600 border-red-500 text-white font-semibold shadow-md'
                    : 'bg-[#14161D] border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                }`}
              >
                <span className="font-medium">{d.label}</span>
                <span className="text-[10px] opacity-80 font-mono">{d.sub}</span>
              </button>
            ))}
          </div>

          {/* Cinemas & Showtimes List */}
          {filteredCinemaSchedules.length === 0 ? (
            <div className="p-8 text-center bg-[#14161D] border border-white/10 rounded-xl">
              <Film className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-300">No shows scheduled for {selectedDate} in this theatre.</p>
              <p className="text-xs text-gray-500 mt-1">Select another date or switch your preferred city.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCinemaSchedules.map((schedule) => (
                <div
                  key={schedule.theatre._id}
                  className="p-5 rounded-xl bg-[#14161D] border border-white/10 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-red-500" />
                        {schedule.theatre.name}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">{schedule.theatre.address}</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {schedule.theatre.facilities?.slice(0, 2).map((fac: string) => (
                        <span
                          key={fac}
                          className="text-[10px] text-gray-400 bg-white/5 border border-white/5 px-1.5 py-0.5 rounded"
                        >
                          {fac}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Showtimes Pills */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2.5">
                      {schedule.shows.map((show) => {
                        const showDate = new Date(show.startTime);
                        const timeStr = showDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                        return (
                          <button
                            key={show._id}
                            onClick={() => onNavigate('seat-selection', { showId: show._id })}
                            className="group flex flex-col items-center justify-center p-2.5 min-w-[100px] rounded-lg bg-white/5 hover:bg-red-600/20 border border-white/10 hover:border-red-500 text-left transition-all cursor-pointer"
                          >
                            <span className="text-xs font-bold text-white group-hover:text-red-400 font-mono">
                              {timeStr}
                            </span>
                            <span className="text-[10px] text-gray-400 group-hover:text-gray-300">
                              {show.screenName}
                            </span>
                            <span className="text-[10px] font-mono text-emerald-400 mt-0.5">
                              from ₹{show.tierPricing?.silver || 200}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Column: Cast, Censor, Policies */}
        <div className="space-y-6">
          {/* Cast & Crew */}
          <div className="p-5 bg-[#14161D] border border-white/10 rounded-xl space-y-3">
            <h3 className="text-xs font-semibold text-gray-200 uppercase tracking-wider">Cast & Crew</h3>
            <div className="flex flex-wrap gap-1.5">
              {movie.cast?.map((member) => (
                <span
                  key={member}
                  className="text-xs text-gray-300 bg-white/5 border border-white/10 px-2.5 py-1 rounded"
                >
                  {member}
                </span>
              ))}
            </div>
          </div>

          {/* Cancellation Policy Banner */}
          <div className="p-5 bg-[#14161D] border border-white/10 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              Cancellation & Refund Policy
            </div>
            <ul className="text-[11px] text-gray-400 space-y-1.5 list-disc pl-4 leading-relaxed">
              <li>Up to 75% ticket refund if cancelled &gt; 4 hours before showtime.</li>
              <li>50% ticket refund if cancelled between 2 to 4 hours before showtime.</li>
              <li>Non-refundable within 2 hours of showtime.</li>
              <li>Seats are automatically restored to inventory on cancellation.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
