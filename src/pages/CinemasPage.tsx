import React, { useState, useEffect } from 'react';
import { MapPin, Film, ArrowRight, Sparkles } from 'lucide-react';
import { Theatre } from '../types/index.js';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';

interface CinemasPageProps {
  onNavigate: (view: string, params?: any) => void;
}

export const CinemasPage: React.FC<CinemasPageProps> = ({ onNavigate }) => {
  const { selectedCity, setSelectedCity } = useAuth();
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTheatres();
  }, [selectedCity]);

  const loadTheatres = async () => {
    try {
      setLoading(true);
      const res = await api.getTheatres(selectedCity);
      if (res.success) {
        setTheatres(res.data);
        if (res.meta.cities) {
          setAvailableCities(res.meta.cities);
        }
      }
    } catch (err) {
      console.error('Failed to load cinemas:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & City Selection */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <MapPin className="w-6 h-6 text-red-500" />
            Cinema Multiplexes & Theatres
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Discover premium movie destinations, IMAX laser auditoriums, and Dolby sound stages
          </p>
        </div>

        {/* City Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {availableCities.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                selectedCity === city
                  ? 'bg-red-600 text-white font-semibold'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Theatres List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white/5 rounded-xl h-44 border border-white/5" />
          ))}
        </div>
      ) : theatres.length === 0 ? (
        <div className="py-20 text-center bg-[#14161D] border border-white/10 rounded-xl p-8">
          <Film className="w-10 h-10 text-gray-500 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white">No cinemas found in {selectedCity}</h3>
          <p className="text-xs text-gray-400 mt-1">Please choose another city above to explore available multiplexes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {theatres.map((theatre) => (
            <div
              key={theatre._id}
              className="p-6 rounded-xl bg-[#14161D] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-base font-bold text-white">{theatre.name}</h3>
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded">
                    Open
                  </span>
                </div>

                <p className="text-xs text-gray-400 mb-4">{theatre.address}</p>

                {/* Screens */}
                <div className="mb-4">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                    Auditoriums ({theatre.screens.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {theatre.screens.map((screen) => (
                      <div
                        key={screen.screenId}
                        className="p-2.5 rounded bg-white/5 border border-white/5 text-xs"
                      >
                        <div className="font-medium text-white">{screen.name}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          {screen.screenType} · {screen.rows.length * screen.seatsPerRow} Seats
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Facilities */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {theatre.facilities.map((f) => (
                    <span
                      key={f}
                      className="text-[10px] text-gray-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onNavigate('movies')}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Browse Shows at this Cinema</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
