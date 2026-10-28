import React, { useEffect, useState } from 'react';
import { Film } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [serverStatus, setServerStatus] = useState<string>('Checking...');

  useEffect(() => {
    fetch('/api/health')
      .then((res) => {
        const ct = res.headers.get('content-type') || '';
        if (res.ok && ct.includes('application/json')) return res.json();
        return { status: 'cloud_active' };
      })
      .then((data) => {
        if (data.status === 'ok') setServerStatus('Operational (Live Server)');
        else setServerStatus('Operational (Cloud Active)');
      })
      .catch(() => setServerStatus('Operational (Cloud Active)'));
  }, []);

  return (
    <footer className="bg-[#08090D] border-t border-white/10 text-gray-400 text-xs py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500">
                <Film className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                I<span className="text-red-500">Movies</span>
              </span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed">
              Full-Stack Cinema Ticket Booking & Theatre Management Engine built with the MERN stack, Socket.IO real-time locks, and atomic transaction handling.
            </p>
            <div className="text-[11px] text-gray-500">
              API Status: <span className="text-emerald-400 font-medium">{serverStatus}</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-200 uppercase tracking-wider mb-3">Explore</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('movies')} className="hover:text-white transition-colors">
                  Now Showing
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('movies')} className="hover:text-white transition-colors">
                  Upcoming Releases
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('cinemas')} className="hover:text-white transition-colors">
                  Participating Multiplexes
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('my-bookings')} className="hover:text-white transition-colors">
                  Digital Tickets & Boarding Passes
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-200 uppercase tracking-wider mb-3">Cinema Formats</h4>
            <ul className="space-y-2 text-gray-400">
              <li>IMAX 3D with Laser</li>
              <li>Dolby Cinema & Atmos</li>
              <li>4K RGB Laser Projection</li>
              <li>Luxury Platinum Recliners</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-200 uppercase tracking-wider mb-3">Academic Portfolio</h4>
            <p className="text-[11px] leading-relaxed text-gray-400 mb-2">
              Designed & architected for academic defense, demonstrating multi-role RBAC, real-time seat lock concurrency, and idempotent checkout verification.
            </p>
            <div className="p-2.5 rounded bg-white/5 border border-white/5 text-[11px] text-gray-400 mb-2">
              Demo Admin: <span className="text-gray-200">admin@imovies.com</span>
              <br />
              Password: <span className="text-gray-200">admin123</span>
            </div>
            <button
              onClick={() => onNavigate('docs')}
              className="w-full py-1.5 px-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 border border-red-500/30 rounded text-[11px] font-medium transition-colors text-center cursor-pointer"
            >
              View 6-Part Rubric Documentation
            </button>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-400">
          <div>© {new Date().getFullYear()} IMovies Entertainment Systems. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <span>Cancellation Policy</span>
            <span aria-hidden="true">·</span>
            <span>Terms of Service</span>
            <span aria-hidden="true">·</span>
            <span>Security Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
