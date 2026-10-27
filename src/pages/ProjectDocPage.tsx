import React, { useState } from 'react';
import { 
  BookOpen, 
  Layers, 
  Terminal, 
  Server, 
  Database, 
  Layout, 
  PlayCircle, 
  CheckCircle2, 
  Copy, 
  Check, 
  FileText,
  ShieldCheck,
  Cpu,
  Workflow
} from 'lucide-react';

interface ProjectDocPageProps {
  onNavigate: (view: string, params?: any) => void;
}

export const ProjectDocPage: React.FC<ProjectDocPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<string>('architecture');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const TABS = [
    { id: 'architecture', label: '1. Project Architecture', icon: Layers },
    { id: 'setup', label: '2. Setup & Configuration', icon: Terminal },
    { id: 'backend', label: '3. Backend Development', icon: Server },
    { id: 'database', label: '4. Database Development', icon: Database },
    { id: 'frontend', label: '5. Frontend Development', icon: Layout },
    { id: 'execution', label: '6. Project Execution', icon: PlayCircle },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-950/40 via-purple-950/20 to-neutral-900 border border-red-500/20 rounded-2xl p-6 sm:p-8 mb-8 backdrop-blur-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
                Evaluation Rubric & Viva Documentation
              </span>
              <span className="text-xs text-gray-400">Repository: montukhatri7898-dev/Project: iMovies</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              iMovies Technical Specification & Project Dossier
            </h1>
            <p className="text-sm text-gray-300 mt-2 max-w-2xl leading-relaxed">
              Complete technical rubric covering architecture, ER diagrams, MVC design, setup, backend endpoints, database schemas, frontend structure, and execution steps.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#execution"
              onClick={() => setActiveTab('execution')}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-lg flex items-center gap-2"
            >
              <PlayCircle className="w-4 h-4" />
              Execution Steps
            </a>
            <button
              onClick={() => onNavigate('home')}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 text-gray-200 text-xs font-medium rounded-lg border border-white/10 transition-colors"
            >
              Return to App
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-8 border-b border-white/10 pb-4">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                isActive
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/20 font-semibold'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Project Architecture */}
      {activeTab === 'architecture' && (
        <div className="space-y-8 animate-fadeIn">
          {/* 1.1 Technical Architecture */}
          <section className="bg-[#12141C] border border-white/10 rounded-xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
                <Cpu className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-white">1.1 Technical Architecture</h2>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed mb-6">
              The <strong>iMovies</strong> platform is built on an enterprise <strong>MERN (MongoDB, Express, React, Node.js)</strong> decoupled architecture augmented with <strong>Socket.IO</strong> for low-latency bidirectional seat inventory locking and <strong>Tailwind CSS v4</strong> for responsive cinematic styling.
            </p>

            <div className="bg-[#0A0C13] border border-white/10 rounded-lg p-5 font-mono text-xs text-sky-300 overflow-x-auto leading-relaxed mb-6">
              <pre>{`┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT / VIEW TIER (Vite + React 19)            │
│   • Discovery UI  • SVG Cinema Screen  • Multi-Tier Seats  • Admin     │
│   • Socket.IO Client (ws://)           • Axios/Fetch HTTP Client       │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ HTTP (Port 3000) & WebSocket Events
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      APPLICATION CONTROLLER TIER                       │
│                         (Express.js + Node.js)                         │
│   • Helmet, CORS, Trust Proxy (1), Rate Limiter, Cookie Parser         │
│   • Auth & RBAC (bcryptjs + JWT Bearer Tokens)                         │
│   • Atomic Hold Reaper Daemon (30s interval)                           │
│   • Schedule Collision Prevention Engine (+20m turnaround buffer)      │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ Query & Mutation Operations
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      PERSISTENT STORAGE TIER                           │
│              (MongoDB Atlas / Atomic JSON Document Model)              │
│   • Users • Movies • Theatres • Screens • Shows • Bookings • Payments  │
└────────────────────────────────────────────────────────────────────────┘`}</pre>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                <h4 className="font-semibold text-white mb-1.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Client Tier
                </h4>
                <p className="text-gray-400">React 19 single-page app bundled with Vite 8. Features real-time Socket.IO listeners, SVG curved screen layout, and dynamic coupon engine.</p>
              </div>
              <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                <h4 className="font-semibold text-white mb-1.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Controller Tier
                </h4>
                <p className="text-gray-400">Node.js + Express 4 server. Enforces zero-trust monetary calculations, 5-minute atomic holds, and background cleanup jobs.</p>
              </div>
              <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                <h4 className="font-semibold text-white mb-1.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Persistence Tier
                </h4>
                <p className="text-gray-400">Document data store guaranteeing ACID atomic writes, unique indexes on references and seat coordinates, and instant persistence.</p>
              </div>
            </div>
          </section>

          {/* 1.2 ER-Diagram */}
          <section className="bg-[#12141C] border border-white/10 rounded-xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-red-500/30 flex items-center justify-center text-amber-400">
                <Database className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-white">1.2 ER-Diagram (Entity-Relationship Diagram)</h2>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed mb-6">
              Entity relationships, cardinality rules, and foreign key linkages across the eight core system models:
            </p>

            <div className="bg-[#0A0C13] border border-white/10 rounded-lg p-5 font-mono text-xs text-amber-300 overflow-x-auto leading-relaxed mb-6">
              <pre>{`USER (1) ──────────< reserves (1:N) >────────── BOOKING (N)
                                                     │ 1
                                                     │ pays for (1:1)
                                                     ▼ 1
                                                  PAYMENT (1)

THEATRE (1) ───────< contains (1:N) >────────── SCREEN (N)
                                                     │ 1
                                                     │ schedules (1:N)
                                                     ▼ N
MOVIE (1) ─────────< plays in (1:N) >─────────── SHOW (N)
                                                     │ 1
                                                     │ generates (1:N)
                                                     ▼ N
                                               SEAT_INVENTORY (N)`}</pre>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-lg bg-white/5 border border-white/5 space-y-2">
                <h4 className="font-semibold text-white">Primary Cardinalities</h4>
                <ul className="space-y-1.5 text-gray-300">
                  <li>• <strong>User 1:N Booking</strong>: Customers can reserve multiple tickets over time.</li>
                  <li>• <strong>Booking 1:1 Payment</strong>: Each confirmed ticket booking is tied to a verified payment transaction.</li>
                  <li>• <strong>Theatre 1:N Screen</strong>: Multiplex contains multiple auditoriums (IMAX, 4DX, Atmos).</li>
                  <li>• <strong>Screen 1:N Show</strong>: Each screen runs distinct showtimes separated by 20m buffers.</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-white/5 border border-white/5 space-y-2">
                <h4 className="font-semibold text-white">Compound Primary Keys & Constraints</h4>
                <ul className="space-y-1.5 text-gray-300">
                  <li>• <strong>SeatInventory PK</strong>: Unique compound key <code className="text-red-400">showId_seatId</code> prevents physical double-allocation.</li>
                  <li>• <strong>Booking Reference</strong>: Alphanumeric format <code className="text-red-400">IMV-XXXXXX</code> with unique index.</li>
                  <li>• <strong>User Email</strong>: Unique index enforces single registration per email address.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 1.3 Features */}
          <section className="bg-[#12141C] border border-white/10 rounded-xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-white">1.3 Features</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider">Customer Experience</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">✔</span>
                    <span><strong>Movie Discovery</strong>: City selector (Mumbai, Delhi, Bengaluru, etc.), language filters (Hindi, Telugu, Tamil, English), genre tabs, and instant search.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">✔</span>
                    <span><strong>Promotions Engine</strong>: Live discount coupon carousel with 1-click clipboard copy (<code className="text-red-300">IMOVIE50</code>, <code className="text-red-300">DESI20</code>, <code className="text-red-300">IMAXPASS</code>).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">✔</span>
                    <span><strong>Interactive Seat Selection</strong>: Multi-tier auditorium map (Platinum, Gold, Silver) with 5-minute atomic lock countdown timer.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">✔</span>
                    <span><strong>Multi-Channel Payment</strong>: Simulated UPI QR code, Credit/Debit card with Luhn check, and NetBanking gateways.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">✔</span>
                    <span><strong>Digital Boarding Pass</strong>: Verifiable high-contrast QR code with print receipt voucher support.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">✔</span>
                    <span><strong>Self-Service Cancellation</strong>: Policy-based refunds (75% / 50% / 0%) and instant seat release.</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">Administrative Control</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">✔</span>
                    <span><strong>Executive KPI Dashboard</strong>: Real-time calculation of Confirmed Revenue, Total Tickets Booked, Occupancy %, and Active Titles.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">✔</span>
                    <span><strong>Movie Catalog CRUD</strong>: Add, edit, and archive movies with cast, runtime, content rating, and poster URLs.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">✔</span>
                    <span><strong>Collision-Free Scheduler</strong>: Mathematical overlap prevention incorporating a 20-minute turnaround cleaning buffer.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">✔</span>
                    <span><strong>Customer Booking Audit</strong>: Searchable ledger with live payment statuses and cancellation logs.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* 1.4 Roles and Responsibilities */}
          <section className="bg-[#12141C] border border-white/10 rounded-xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-white">1.4 Roles and Responsibilities</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400">
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Authorization</th>
                    <th className="py-2.5 px-3">Primary Permissions & Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  <tr>
                    <td className="py-3 px-3 font-semibold text-white">Guest / Visitor</td>
                    <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/10">Unauthenticated</span></td>
                    <td className="py-3 px-3">Browse movies, filter by city/genre, view trailers, read synopses, preview seat layouts in read-only mode.</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-semibold text-sky-400">Customer / Patron</td>
                    <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">JWT Bearer (role: customer)</span></td>
                    <td className="py-3 px-3">Lock seats atomically for 5 mins, apply discount coupons, simulate payment checkout, view & print QR boarding passes, manage and cancel bookings with automated refund calculation.</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-semibold text-amber-400">Administrator</td>
                    <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">JWT Bearer (role: admin)</span></td>
                    <td className="py-3 px-3">Access <code className="text-red-300">/admin</code>, monitor operational KPIs, manage movies and multiplexes, schedule collision-free showtimes, audit customer transactions.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 1.5 User Flow */}
          <section className="bg-[#12141C] border border-white/10 rounded-xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Workflow className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-white">1.5 User Flow</h2>
            </div>

            <div className="p-4 rounded-lg bg-black/40 border border-white/10 font-mono text-xs text-purple-300 overflow-x-auto leading-relaxed">
              <pre>{`[1. Homepage]
   │  • Pick City (e.g. Mumbai)
   │  • Explore Indian Blockbusters & Active Promotions
   ▼
[2. Movie Details]
   │  • Watch Trailer, Review Cast, Select Date & Multiplex
   ▼
[3. Seat Selection Map]
   │  • Click Available Seats (A3, A4 Platinum)
   │  • Emits Socket.IO 'seat:hold' -> Server locks seat for 5 mins
   ▼
[4. Authentication & Checkout]
   │  • Sign In / Demo Customer Login
   │  • Apply Coupon Code (e.g. IMOVIE50) -> Instant server discount
   │  • Choose Payment Mode (UPI QR / Card / NetBanking)
   ▼
[5. Payment & Ticket Generation]
   │  • Transaction processed -> Seat status mutated to 'booked'
   │  • Digital QR Boarding Pass issued with 1-Click Print Voucher
   ▼
[6. My Bookings / Cancellation]
   │  • View QR ticket or initiate cancellation
   │  • Server inspects showtime -> Issues 75%/50% refund & releases seats`}</pre>
            </div>
          </section>

          {/* 1.6 MVC Pattern */}
          <section className="bg-[#12141C] border border-white/10 rounded-xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
                <Layers className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-white">1.6 MVC Pattern Mapping in iMovies</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="p-4 rounded-lg bg-white/5 border border-white/5 space-y-2">
                <h3 className="font-bold text-white text-sm">MODEL (Data Layer)</h3>
                <p className="text-gray-400">Defined in <code className="text-red-300">server/db.ts</code> and Mongoose schemas:</p>
                <ul className="space-y-1 text-gray-300 list-disc list-inside">
                  <li>User & Role Schema</li>
                  <li>Movie Catalog Model</li>
                  <li>Theatre & Screen Layout</li>
                  <li>Show & SeatInventory Model</li>
                  <li>Booking & Payment Records</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-white/5 border border-white/5 space-y-2">
                <h3 className="font-bold text-white text-sm">VIEW (Presentation Layer)</h3>
                <p className="text-gray-400">Implemented in <code className="text-red-300">src/pages/*</code> and <code className="text-red-300">src/components/*</code>:</p>
                <ul className="space-y-1 text-gray-300 list-disc list-inside">
                  <li>React 19 Components</li>
                  <li>Interactive SVG Seat Layout</li>
                  <li>Tailwind CSS Animations</li>
                  <li>Digital QR Canvas Ticket</li>
                  <li>Real-Time Hold Countdown</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-white/5 border border-white/5 space-y-2">
                <h3 className="font-bold text-white text-sm">CONTROLLER (Logic Layer)</h3>
                <p className="text-gray-400">Engineered in <code className="text-red-300">server/routes/*.ts</code>:</p>
                <ul className="space-y-1 text-gray-300 list-disc list-inside">
                  <li>Auth & JWT Verification</li>
                  <li>Atomic Seat Lock Handler</li>
                  <li>Collision Prevention Engine</li>
                  <li>Pricing & Tax Calculation</li>
                  <li>Socket.IO Event Dispatchers</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Tab 2: Project Setup and Configuration */}
      {activeTab === 'setup' && (
        <div className="space-y-8 animate-fadeIn">
          <section className="bg-[#12141C] border border-white/10 rounded-xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white mb-4">2.1 Creating Project Folder</h2>
            <p className="text-sm text-gray-300 mb-4">
              To bootstrap the clean monorepo architecture, execute the following commands:
            </p>
            <div className="bg-[#0A0C13] border border-white/10 rounded-lg p-4 font-mono text-xs text-emerald-400 overflow-x-auto relative">
              <pre>{`# 1. Create project folder and initialize npm
mkdir imovies && cd imovies
npm init -y

# 2. Setup directory hierarchy
mkdir -p src/components src/pages src/assets/images
mkdir -p server/routes data public/assets`}</pre>
            </div>
          </section>

          <section className="bg-[#12141C] border border-white/10 rounded-xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white mb-4">2.2 Client Setup</h2>
            <p className="text-sm text-gray-300 mb-4">
              The frontend is powered by <strong>React 19</strong>, <strong>TypeScript</strong>, and <strong>Vite 8</strong> with Tailwind CSS v4 styling:
            </p>
            <div className="bg-[#0A0C13] border border-white/10 rounded-lg p-4 font-mono text-xs text-sky-400 overflow-x-auto">
              <pre>{`// vite.config.ts
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
}));`}</pre>
            </div>
          </section>

          <section className="bg-[#12141C] border border-white/10 rounded-xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white mb-4">2.3 Server Setup</h2>
            <p className="text-sm text-gray-300 mb-4">
              Express server configuration with security headers, rate-limiting, and WebSocket integration:
            </p>
            <div className="bg-[#0A0C13] border border-white/10 rounded-lg p-4 font-mono text-xs text-amber-400 overflow-x-auto">
              <pre>{`// server.ts
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Trust proxy for proper IP resolution behind reverse proxies
app.set('trust proxy', 1);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  validate: { xForwardedForHeader: false },
});
app.use('/api/', limiter);`}</pre>
            </div>
          </section>
        </div>
      )}

      {/* Tab 3: Backend Development */}
      {activeTab === 'backend' && (
        <div className="space-y-8 animate-fadeIn">
          <section className="bg-[#12141C] border border-white/10 rounded-xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white mb-4">3.1 Backend Structure</h2>
            <p className="text-sm text-gray-300 mb-4">
              Modular separation of REST endpoints and background jobs:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white/5 border border-white/5 rounded-lg">
                <code className="text-red-400 font-bold block mb-1">server/routes/auth.ts</code>
                <span className="text-gray-400">User registration, login with bcrypt hash, JWT bearer issuance.</span>
              </div>
              <div className="p-3 bg-white/5 border border-white/5 rounded-lg">
                <code className="text-red-400 font-bold block mb-1">server/routes/movies.ts</code>
                <span className="text-gray-400">Movie catalog queries with city, language, and genre filters.</span>
              </div>
              <div className="p-3 bg-white/5 border border-white/5 rounded-lg">
                <code className="text-red-400 font-bold block mb-1">server/routes/shows.ts</code>
                <span className="text-gray-400">Show scheduling with mathematical collision prevention buffer.</span>
              </div>
              <div className="p-3 bg-white/5 border border-white/5 rounded-lg">
                <code className="text-red-400 font-bold block mb-1">server/routes/bookings.ts</code>
                <span className="text-gray-400">Atomic 5-minute seat locking, checkout, and cancellation refunds.</span>
              </div>
              <div className="p-3 bg-white/5 border border-white/5 rounded-lg">
                <code className="text-red-400 font-bold block mb-1">server/routes/promotions.ts</code>
                <span className="text-gray-400">Coupon validation engine (IMOVIE50, DESI20, IMAXPASS).</span>
              </div>
              <div className="p-3 bg-white/5 border border-white/5 rounded-lg">
                <code className="text-red-400 font-bold block mb-1">server/routes/admin.ts</code>
                <span className="text-gray-400">Operational KPIs, financial calculations, occupancy metrics.</span>
              </div>
            </div>
          </section>

          <section className="bg-[#12141C] border border-white/10 rounded-xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white mb-4">3.2 Development & Explanation</h2>
            
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-lg bg-black/30 border border-white/10">
                <h3 className="font-bold text-white text-sm mb-2">Atomic 5-Minute Seat Lock & Concurrency</h3>
                <p className="text-gray-300 leading-relaxed">
                  When a patron selects seats, a <code className="text-red-400">POST /api/shows/:id/hold</code> request is evaluated. If any seat is already locked or booked, the operation aborts with <code className="text-red-400">409 Conflict</code>. If valid, the server sets <code className="text-sky-300">heldUntil = Date.now() + 5*60*1000</code> and broadcasts a Socket.IO event to the room:
                </p>
                <div className="mt-3 bg-[#0A0C13] p-3 rounded font-mono text-emerald-400">
                  io.to(`show:$&#123;showId&#125;`).emit('seat:held', &#123; seatId, heldByUserId: user._id &#125;);
                </div>
              </div>

              <div className="p-4 rounded-lg bg-black/30 border border-white/10">
                <h3 className="font-bold text-white text-sm mb-2">Background Seat Reaper Daemon</h3>
                <p className="text-gray-300 leading-relaxed">
                  A recurring interval runs every 30 seconds to reclaim abandoned holds where <code className="text-red-400">heldUntil &lt; Date.now()</code>, automatically resetting seats to available and notifying all connected clients in real-time.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-black/30 border border-white/10">
                <h3 className="font-bold text-white text-sm mb-2">Conflict-Free Schedule Collision Prevention</h3>
                <p className="text-gray-300 leading-relaxed">
                  Prevents auditorium double-booking by calculating <code className="text-sky-300">durationMinutes + 20-minute turnaround</code> and enforcing:
                </p>
                <div className="mt-3 bg-[#0A0C13] p-3 rounded font-mono text-amber-300">
                  const collision = (newStart &lt; existingEnd) &amp;&amp; (existingStart &lt; newEnd);
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Tab 4: Database Development */}
      {activeTab === 'database' && (
        <div className="space-y-8 animate-fadeIn">
          <section className="bg-[#12141C] border border-white/10 rounded-xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white mb-4">4.1 Configure MongoDB</h2>
            <p className="text-sm text-gray-300 mb-4">
              Configure connection string in <code className="text-red-400">.env</code>:
            </p>
            <div className="bg-[#0A0C13] border border-white/10 rounded-lg p-4 font-mono text-xs text-sky-400 overflow-x-auto">
              <pre>{`MONGODB_URI="mongodb+srv://admin:password@cluster0.mongodb.net/imovies?retryWrites=true&w=majority"
DB_NAME="imovies"`}</pre>
            </div>
          </section>

          <section className="bg-[#12141C] border border-white/10 rounded-xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white mb-4">4.2 Create Database Connection</h2>
            <div className="bg-[#0A0C13] border border-white/10 rounded-lg p-4 font-mono text-xs text-emerald-400 overflow-x-auto">
              <pre>{`import mongoose from 'mongoose';

export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB connected successfully.');
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
}`}</pre>
            </div>
          </section>

          <section className="bg-[#12141C] border border-white/10 rounded-xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white mb-4">4.3 Create Schema and Models</h2>
            <p className="text-sm text-gray-300 mb-4">
              Key Mongoose schema models implemented in the system:
            </p>
            <div className="bg-[#0A0C13] border border-white/10 rounded-lg p-4 font-mono text-xs text-amber-400 overflow-x-auto">
              <pre>{`// User Schema
const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  preferredCity: { type: String, default: 'Mumbai' },
});

// Seat Inventory Schema with Compound Index
const SeatInventorySchema = new Schema({
  showId: { type: Schema.Types.ObjectId, ref: 'Show', required: true },
  seatId: { type: String, required: true },
  row: { type: String, required: true },
  colNumber: { type: Number, required: true },
  tier: { type: String, enum: ['silver', 'gold', 'platinum'], required: true },
  status: { type: String, enum: ['available', 'held', 'booked'], default: 'available' },
  heldByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  heldUntil: { type: Date },
});
SeatInventorySchema.index({ showId: 1, seatId: 1 }, { unique: true });`}</pre>
            </div>
          </section>
        </div>
      )}

      {/* Tab 5: Frontend Development */}
      {activeTab === 'frontend' && (
        <div className="space-y-8 animate-fadeIn">
          <section className="bg-[#12141C] border border-white/10 rounded-xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white mb-4">5.1 Frontend Structure</h2>
            <p className="text-sm text-gray-300 mb-4">
              Component hierarchy and page distribution:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-white/5 border border-white/5 rounded-lg">
                <span className="font-bold text-white block mb-1">HomePage.tsx</span>
                <span className="text-gray-400">Hero banner carousel, Indian blockbusters, Promotions banner.</span>
              </div>
              <div className="p-3 bg-white/5 border border-white/5 rounded-lg">
                <span className="font-bold text-white block mb-1">Promotions.tsx</span>
                <span className="text-gray-400">Interactive coupon cards with 1-click clipboard copying.</span>
              </div>
              <div className="p-3 bg-white/5 border border-white/5 rounded-lg">
                <span className="font-bold text-white block mb-1">SeatSelectionPage.tsx</span>
                <span className="text-gray-400">SVG curved screen, tier pricing, 5-minute hold timer.</span>
              </div>
              <div className="p-3 bg-white/5 border border-white/5 rounded-lg">
                <span className="font-bold text-white block mb-1">CheckoutPage.tsx</span>
                <span className="text-gray-400">Simulated UPI/Card/NetBanking checkout with price verify.</span>
              </div>
            </div>
          </section>

          <section className="bg-[#12141C] border border-white/10 rounded-xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white mb-4">5.2 Development & Explanation</h2>
            <p className="text-sm text-gray-300 leading-relaxed mb-4">
              The frontend incorporates optimistic user experience patterns combined with real-time WebSocket state synchronization:
            </p>
            <ul className="space-y-3 text-xs text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">1.</span>
                <span><strong>Socket.IO Client Listeners</strong>: Subscribes to <code className="text-red-400">show:&lt;showId&gt;</code> room. When another user selects a seat, it instantly renders as held across all screens without reloading.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">2.</span>
                <span><strong>Curved Screen Visualization</strong>: Rendered using a scalable SVG quadratic bezier curve (<code className="text-sky-300">M 50 50 Q 400 10 750 50</code>) with radial glow and perspective indicators.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">3.</span>
                <span><strong>Verifiable QR Boarding Pass</strong>: Generates an SVG/Canvas QR ticket voucher containing the encrypted booking reference and security hash for gate admission.</span>
              </li>
            </ul>
          </section>
        </div>
      )}

      {/* Tab 6: Project Execution */}
      {activeTab === 'execution' && (
        <div className="space-y-8 animate-fadeIn">
          <section className="bg-[#12141C] border border-white/10 rounded-xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white mb-4">6.1 Steps for Project Execution</h2>
            <div className="space-y-4 text-xs">
              <div className="bg-[#0A0C13] border border-white/10 rounded-lg p-4 font-mono text-emerald-400 overflow-x-auto">
                <pre>{`# Step 1: Clone Repository
git clone https://github.com/montukhatri7898-dev/iMovies.git
cd iMovies

# Step 2: Install Node Dependencies
npm install

# Step 3: Configure Environment
cp .env.example .env

# Step 4: Run Application in Development Mode
npm run dev

# Step 5: Open Browser
# Navigate to: http://localhost:3000`}</pre>
              </div>
            </div>
          </section>

          <section className="bg-[#12141C] border border-white/10 rounded-xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white mb-4">6.2 Output Screenshots Walkthrough</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                <h4 className="font-bold text-white mb-1.5">1. Homepage & Hero Carousel</h4>
                <p className="text-gray-400">Showcases Indian blockbusters (*Mumbai Velocity*, *Kaal Bhairav*), city filtering, and language tags.</p>
              </div>
              <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                <h4 className="font-bold text-white mb-1.5">2. Promotions Component</h4>
                <p className="text-gray-400">Displays active discount voucher cards with 1-click clipboard copying (<code className="text-red-300">IMOVIE50</code>, <code className="text-red-300">DESI20</code>).</p>
              </div>
              <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                <h4 className="font-bold text-white mb-1.5">3. Interactive Seat Selection</h4>
                <p className="text-gray-400">Curved auditorium screen with Platinum, Gold, and Silver tiers, real-time lock states, and 5-min timer.</p>
              </div>
              <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                <h4 className="font-bold text-white mb-1.5">4. Digital QR Boarding Pass</h4>
                <p className="text-gray-400">High-resolution QR code ticket with 1-click print support and booking cancellation workflow.</p>
              </div>
            </div>
          </section>

          <section className="bg-[#12141C] border border-white/10 rounded-xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white mb-4">6.3 Demo Video Script (Viva Defense)</h2>
            <div className="p-4 rounded-lg bg-black/40 border border-white/10 text-xs text-gray-300 space-y-3">
              <p><strong>0:00 - 0:30 (Architecture)</strong>: Welcome evaluators. Introduce the MERN + Socket.IO technical stack, database models, and double-booking prevention goals.</p>
              <p><strong>0:30 - 1:15 (Customer Journey)</strong>: Demonstrate movie discovery in Mumbai, active promotions, and selecting seats in the curved auditorium with the 5-minute atomic lock.</p>
              <p><strong>1:15 - 1:50 (Checkout & QR Pass)</strong>: Apply promo code <code className="text-red-300">IMOVIE50</code>, simulate UPI payment, and showcase the verifiable QR boarding pass.</p>
              <p><strong>1:50 - 2:20 (Cancellation & Refunds)</strong>: Cancel ticket in 'My Bookings' and demonstrate the 75% prorated policy and automatic seat release.</p>
              <p><strong>2:20 - 3:00 (Admin Portal)</strong>: Log in at <code className="text-red-300">/admin</code>, view real-time KPIs, and demonstrate conflict-free show scheduling with turnaround buffer validation.</p>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
