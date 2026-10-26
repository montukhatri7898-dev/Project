import React, { useState, useEffect } from 'react';
import { Search, Play, Calendar, Film, Star, ArrowRight, ShieldCheck, Sparkles, MapPin } from 'lucide-react';
import { Movie, Theatre } from '../types/index.js';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';

interface HomePageProps {
  onNavigate: (view: string, params?: any) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { selectedCity } = useAuth();
  const [nowShowing, setNowShowing] = useState<Movie[]>([]);
  const [comingSoon, setComingSoon] = useState<Movie[]>([]);
  const [cinemas, setCinemas] = useState<Theatre[]>([]);
  const [activeTab, setActiveTab] = useState<'now_showing' | 'coming_soon'>('now_showing');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, [selectedCity]);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      const [nowRes, soonRes, theatresRes] = await Promise.all([
        api.getMovies({ status: 'now_showing', limit: 8 }),
        api.getMovies({ status: 'coming_soon', limit: 4 }),
        api.getTheatres(selectedCity),
      ]);

      if (nowRes.success) setNowShowing(nowRes.data);
      if (soonRes.success) setComingSoon(soonRes.data);
      if (theatresRes.success) setCinemas(theatresRes.data);
    } catch (err) {
      console.error('Failed to load homepage movies:', err);
    } finally {
      setLoading(false);
    }
  };

  const heroMovie = nowShowing[0] || {
    _id: 'mov_stellar_voyage',
    title: 'Stellar Voyage',
    slug: 'stellar-voyage',
    description: 'When a deep space anomaly threatens Earth, commander Elena Vance and an elite crew journey across uncharted solar systems to reach an orbital jumpgate.',
    genre: ['Sci-Fi', 'Adventure', 'Drama'],
    language: 'English',
    durationMinutes: 154,
    contentRating: 'UA',
    backdropUrl: '/src/assets/images/hero_cinema_blockbuster_1792988110364.jpg',
    posterUrl: '/src/assets/images/poster_stellar_voyage_1792988110200.jpg',
  };

  const displayedMovies = activeTab === 'now_showing' ? nowShowing : comingSoon;
  const filteredMovies = searchQuery.trim()
    ? displayedMovies.filter((m) =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.genre.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : displayedMovies;

  return (
    <div className="space-y-12">
      {/* 1. Cinematic Hero Section */}
      <section className="relative w-full h-[520px] sm:h-[580px] rounded-2xl overflow-hidden border border-white/10 mx-auto max-w-7xl">
        {/* Background Image with Measured Contrast Scrim */}
        <img
          src={heroMovie.backdropUrl || '/src/assets/images/hero_cinema_blockbuster_1792988110364.jpg'}
          alt={heroMovie.title}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10] via-[#0B0C10]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0C10]/95 via-[#0B0C10]/50 to-transparent" />

        {/* Hero Content Contiguous Module */}
        <div className="relative h-full max-w-7xl mx-auto px-6 sm:px-12 flex flex-col justify-end pb-12 z-10 max-w-2xl">
          {/* Clean Unboxed Metadata */}
          <div className="flex items-center gap-2 text-xs font-medium text-gray-300 mb-3">
            <span className="text-red-500 font-semibold tracking-wider uppercase text-[11px]">Featured IMAX Experience</span>
            <span aria-hidden="true">·</span>
            <span>{heroMovie.genre?.join(', ')}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{heroMovie.durationMinutes} min</span>
            <span aria-hidden="true">·</span>
            <span className="border border-white/20 px-1 py-0.5 rounded text-[10px] text-gray-200">{heroMovie.contentRating}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-3 text-balance leading-tight">
            {heroMovie.title}
          </h1>

          <p className="text-xs sm:text-sm text-gray-300 line-clamp-3 mb-6 leading-relaxed">
            {heroMovie.description}
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('movie-details', { movieId: heroMovie._id })}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold tracking-wide flex items-center gap-2 transition-all shadow-lg shadow-red-600/30 cursor-pointer"
            >
              <Film className="w-4 h-4" />
              Book Tickets Now
            </button>
            {heroMovie.trailerUrl && (
              <a
                href={heroMovie.trailerUrl}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium backdrop-blur-md border border-white/15 flex items-center gap-2 transition-all"
              >
                <Play className="w-4 h-4 text-gray-200" />
                Watch Trailer
              </a>
            )}
          </div>
        </div>
      </section>

      {/* 2. Interactive Search & Tabbed Segmented Controls */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          {/* Functional Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-white/5 border border-white/10 rounded-lg shrink-0">
            <button
              onClick={() => setActiveTab('now_showing')}
              className={`px-4 py-2 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeTab === 'now_showing'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Now Showing ({nowShowing.length})
            </button>
            <button
              onClick={() => setActiveTab('coming_soon')}
              className={`px-4 py-2 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeTab === 'coming_soon'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Coming Soon ({comingSoon.length})
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movie title or genre..."
              className="w-full bg-[#14161D] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>
        </div>

        {/* 3. Movie Grid */}
        <div className="mt-8">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white/5 rounded-xl aspect-[3/4] border border-white/5" />
              ))}
            </div>
          ) : filteredMovies.length === 0 ? (
            <div className="py-16 text-center rounded-xl bg-white/5 border border-white/10 p-8">
              <Film className="w-8 h-8 text-gray-500 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-300">No movies found matching "{searchQuery}"</p>
              <p className="text-xs text-gray-500 mt-1">Try searching another genre or clear your filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredMovies.map((movie) => (
                <div
                  key={movie._id}
                  onClick={() => onNavigate('movie-details', { movieId: movie._id })}
                  className="group relative bg-[#14161D] border border-white/10 rounded-xl overflow-hidden hover:border-red-500/50 hover:shadow-xl hover:shadow-red-950/20 transition-all duration-200 cursor-pointer flex flex-col"
                >
                  {/* Poster Image with Fallback */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#1A1D26]">
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded text-[10px] font-semibold text-white border border-white/15">
                      {movie.contentRating}
                    </div>
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/80 backdrop-blur-md rounded text-[10px] text-gray-300 font-medium">
                      {movie.language}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-white group-hover:text-red-400 transition-colors line-clamp-1 mb-1">
                        {movie.title}
                      </h3>
                      {/* Zero-Pill Unboxed Metadata */}
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-3">
                        <span>{movie.genre?.slice(0, 2).join(' / ')}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{movie.durationMinutes}m</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('movie-details', { movieId: movie._id });
                      }}
                      className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Book Showtimes</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. Cinema Multiplexes in Selected City */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-500" />
              Cinemas in {selectedCity}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Multiplexes with Dolby Cinema and IMAX screens</p>
          </div>
          <button
            onClick={() => onNavigate('cinemas')}
            className="text-xs font-medium text-red-400 hover:text-red-300 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {cinemas.map((theatre) => (
            <div
              key={theatre._id}
              onClick={() => onNavigate('cinemas')}
              className="p-5 rounded-xl bg-[#14161D] border border-white/10 hover:border-white/20 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">{theatre.name}</h3>
                <p className="text-xs text-gray-400 line-clamp-1 mb-3">{theatre.address}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {theatre.facilities.slice(0, 3).map((f) => (
                    <span
                      key={f}
                      className="text-[10px] text-gray-300 bg-white/5 border border-white/5 px-2 py-0.5 rounded"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-[11px] text-red-400 font-medium flex items-center gap-1">
                <span>Explore {theatre.screens.length} auditoriums</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
