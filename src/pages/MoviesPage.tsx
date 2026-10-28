import React, { useState, useEffect } from 'react';
import { Search, Film, ArrowRight, Plus } from 'lucide-react';
import { Movie } from '../types/index.js';
import { api } from '../api/client.js';

import { STATIC_MOVIES } from '../data/imoviesStaticDb.js';

interface MoviesPageProps {
  onNavigate: (view: string, params?: any) => void;
}

export const MoviesPage: React.FC<MoviesPageProps> = ({ onNavigate }) => {
  const [movies, setMovies] = useState<Movie[]>(STATIC_MOVIES);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('releaseDate');
  const [facets, setFacets] = useState<{ genres: string[]; languages: string[] }>({
    genres: Array.from(new Set(STATIC_MOVIES.flatMap((m) => m.genre))),
    languages: Array.from(new Set(STATIC_MOVIES.map((m) => m.language))),
  });

  useEffect(() => {
    fetchMovies();
  }, [selectedStatus, selectedGenre, selectedLanguage, sortBy]);

  const fetchMovies = async () => {
    try {
      const res = await api.getMovies({
        status: selectedStatus,
        genre: selectedGenre !== 'All' ? selectedGenre : undefined,
        language: selectedLanguage !== 'All' ? selectedLanguage : undefined,
        sortBy,
        limit: 20,
      });

      if (res?.success && res.data?.length > 0) {
        setMovies(res.data);
        if (res.meta?.facets) {
          setFacets(res.meta.facets);
        }
      }
    } catch (err) {
      console.warn('Using static movie database:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMovies = search.trim()
    ? movies.filter(
        (m) =>
          m.title.toLowerCase().includes(search.toLowerCase()) ||
          m.description.toLowerCase().includes(search.toLowerCase()) ||
          m.cast.some((c) => c.toLowerCase().includes(search.toLowerCase()))
      )
    : movies;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Film className="w-6 h-6 text-red-500" />
            Movie Catalog & Releases
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Browse all cinematic screenings, upcoming blockbusters, and auditorium schedules
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search titles, actors, directors..."
              className="w-full bg-[#14161D] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>
          <button
            onClick={() => onNavigate('admin')}
            className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-sm"
            title="Add or manage movies in the Admin Portal"
          >
            <Plus className="w-4 h-4" />
            <span>Add Movie</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-[#14161D] border border-white/10 rounded-xl space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-2 shrink-0">
            Status:
          </span>
          {[
            { id: 'all', label: 'All Releases' },
            { id: 'now_showing', label: 'Now Showing' },
            { id: 'coming_soon', label: 'Coming Soon' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStatus(st.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                selectedStatus === st.id
                  ? 'bg-red-600 text-white font-semibold'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Genre Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-2 shrink-0">
            Genre:
          </span>
          {['All', ...facets.genres].map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-3 py-1 text-xs rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                selectedGenre === g
                  ? 'bg-white/20 text-white font-medium border border-white/30'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Language & Sorting */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Language:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-[#0B0C10] border border-white/10 rounded px-2.5 py-1 text-xs text-white focus:outline-none"
            >
              <option value="All">All Languages</option>
              {facets.languages.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#0B0C10] border border-white/10 rounded px-2.5 py-1 text-xs text-white focus:outline-none"
            >
              <option value="releaseDate">Release Date</option>
              <option value="title">Alphabetical (Title)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Movie Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white/5 rounded-xl aspect-[3/4] border border-white/5" />
          ))}
        </div>
      ) : filteredMovies.length === 0 ? (
        <div className="py-20 text-center bg-[#14161D] border border-white/10 rounded-xl p-8">
          <Film className="w-10 h-10 text-gray-500 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white">No movies match your selection</h3>
          <p className="text-xs text-gray-400 mt-1">Try resetting the filters or searching with a different keyword.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMovies.map((movie) => (
            <div
              key={movie._id}
              onClick={() => onNavigate('movie-details', { movieId: movie._id })}
              className="group bg-[#14161D] border border-white/10 rounded-xl overflow-hidden hover:border-red-500/50 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
            >
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
                {movie.status === 'coming_soon' && (
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-amber-500/90 text-black font-bold text-[10px] rounded uppercase">
                    Coming Soon
                  </div>
                )}
                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/80 backdrop-blur-md rounded text-[10px] text-gray-300">
                  {movie.language}
                </div>
              </div>

              <div className="p-4 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-red-400 transition-colors line-clamp-1 mb-1">
                    {movie.title}
                  </h3>
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
                  <span>{movie.status === 'coming_soon' ? 'View Details' : 'Book Tickets'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
