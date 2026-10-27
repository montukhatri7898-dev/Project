# IMovies — Full-Stack Cinema Ticket Booking & Cinema Management System

A production-grade, end-to-end MERN-architected cinema ticket booking platform providing high-performance movie discovery, interactive multi-category seat selection with real-time locking via WebSockets, atomic booking and checkout verification, verifiable QR tickets, user booking management with configurable cancellation, and a comprehensive role-protected administration panel.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The architectural defaults below have been established for high-fidelity demonstration, portability for college viva/portfolio defense, and complete compliance with the evaluation criteria.

- **Storage & Database Architecture**: Dual-layer Mongoose-compatible engine. By default, it operates with a resilient persistent database layer with automatic schema validation and indexing, with direct connection support for external `MONGODB_URI` (MongoDB Atlas / local daemon) when supplied.
- **Real-Time Seat Locks & Concurrency**: Server-authoritative WebSockets (Socket.IO) coupled with atomic database hold reservations (5-minute expiration window with automatic release workers and lock contention protection).
- **Payment Verification Strategy**: A dual-tier payment processing architecture. It provides an interactive payment gateway modal supporting Card, UPI, and NetBanking with cryptographic signature verification, idempotent order processing, and optional test-mode Razorpay integration.
- **Seeding & Ready-to-Demo Data**: Automatically pre-seeds 6+ trending movies with verified media posters, 3 multiplexes across distinct cities, multi-tier screens (Standard, Dolby Cinema, IMAX), schedules, and default accounts (`admin@imovies.com` and `customer@imovies.com`).

---

## 1. Overview & Core Concept

- **What It Does**: IMovies is a full-stack cinema ecosystem that allows moviegoers to discover now-showing and upcoming movies, filter by city and format, select seats in real-time without collisions, complete ticket checkout, download verifiable digital boarding passes with QR codes, and manage or cancel bookings. For cinema operators, it provides a dashboard with real-time operational revenue metrics, movie catalog management, screen and seating layout design, and show scheduling with collision prevention.
- **Target Audience / Persona**:
  - *Moviegoers / Customers*: Seeking a frictionless, visual booking flow with instant seating feedback and mobile-friendly digital tickets.
  - *Cinema Admins / Managers*: Managing auditorium schedules, screen capacities, dynamic ticket pricing, and monitoring bookings.
  - *Evaluator / Viva Examiner*: Inspecting clean modular code, database normalization, concurrency handling, and security middlewares.
- **Key Value**: Guarantees zero double-booking through server-side atomic reservations and real-time socket broadcasts, accompanied by strict role-based access control and clear separation of concerns.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Browse & Discovery**: The user lands on a cinematic dark-themed home page with a featured hero release, quick city selector, genre filters, and tabbed "Now Showing" vs. "Coming Soon" sections.
2. **Movie & Showtime Selection**: Viewing movie synopsis, duration, censor rating, cast, trailer, and an interactive cinema discovery view showing auditorium formats (2D, 3D, IMAX) and available time slots.
3. **Interactive Seating & Real-Time Hold**: The user enters an interactive seat layout organized by tiers (Silver, Gold, Platinum / Recliner). Selecting a seat immediately acquires a 5-minute atomic lock on the server, broadcasting real-time "held" status to other active users on that show's room.
4. **Checkout & Verified Payment**: Reviewing itemized breakdown (ticket subtotal + convenience fees + GST). The customer initiates payment, completes the sandbox/test checkout, and the server cryptographically validates the transaction before confirming the booking.
5. **Digital Pass & Post-Booking**: An animated digital ticket with unique reference, booking breakdown, and scan-ready QR code is generated. The user can view past/upcoming bookings or request a refund according to policy.
6. **Admin Operations**: Cinema administrators access `/admin` to view revenue KPIs, create new movies, define screen seating matrices, and schedule shows with automated duration-conflict validation.

### Visual Identity & Theme
- **Aesthetic Direction**: Premium cinematic dark experience inspired by modern film festivals and high-end multiplexes (deep charcoal canvas, stark white typography, and a vivid crimson/ruby accent).
- **Color Palette**:
  - Canvas Neutral (60%): `#0B0C10` (Deep obsidian black) and `#14161D` (Structural surface)
  - Secondary Structural (30%): `#1F2330` (Cards, seat map boundaries, and dividers with subtle hairline borders)
  - Accent Energy (10%): `#E50914` (IMovies signature crimson red for primary CTAs and active states) with `#FFC107` (Gold VIP seats)
  - Semantic Status: `#10B981` (Available/Confirmed), `#F59E0B` (Held/Expiring), `#EF4444` (Booked/Cancelled)
- **Typography & Hierarchy**:
  - Display Face: `Plus Jakarta Sans` / `Outfit` for bold, legible headings and cinema brand wordmark.
  - Body & Form Prose: `Plus Jakarta Sans` for clean, high-contrast legibility.
  - Numeric & Seats: `font-mono tabular-nums` for seat coordinates, timestamps, order amounts, and countdown timers.
- **Zero-Pill & Metadata Discipline**: Unboxed metadata tags separated by `·` or `/` (e.g. `Action · 2h 45m · UA · English`). Filter tabs use clean segmented buttons instead of candy badges.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Real-Time Seat Hold Architecture (Socket.IO + Atomic Expiry Locks)**
  - *Chosen Approach*: Show-specific Socket.IO rooms (`show:<id>`) paired with database-enforced hold records containing `heldUntil: Date` and client reservation tokens.
  - *Why*: Prevents race conditions where two customers click the same seat simultaneously. The first request atomically wins the lock; the server broadcasts `seat:held` to all room sockets. If checkout is abandoned or expires after 5 minutes, an automated reaper unlocks the seats and emits `seat:released`.
  - *Alternatives Considered*: Pure polling (wastes bandwidth, high latency) or client-only locks (vulnerable to double booking).

- **Decision 2: Price Calculation on the Backend**
  - *Chosen Approach*: The client only sends the show ID and seat identifiers. The server looks up seat categories, applies screen tier multipliers, calculates base subtotal, applies standard 18% GST and fixed convenience fees, and generates the immutable order.
  - *Why*: Never trust frontend calculations. Clients can tamper with payload numbers; the server remains the single source of financial truth.

- **Decision 3: Configurable Cancellation & Refund Engine**
  - *Chosen Approach*: Cancellation is permitted up to 2 hours prior to showtime with a graduated fee (e.g. 75% refund $>4$ hours prior, 50% refund $2\text{--}4$ hours prior, non-refundable $<2$ hours). Seats are immediately returned to inventory upon confirmed cancellation.

- **Decision 4: Show Scheduling Conflict Detector**
  - *Chosen Approach*: When an administrator schedules a show for a screen, the system fetches the movie duration + a default 20-minute turnaround cleaning buffer. It checks for mathematical overlap against any existing show on that specific screen: `(existingStart < newEnd) && (newStart < existingEnd)`.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                         │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌─────────┐  │
│  │ Movie Catalog  │ │ Seat Layout UI │ │ Checkout & Pay │ │ Admin   │  │
│  │ & Discovery    │ │ (Interactive)  │ │ (QR Ticket)    │ │ Portal  │  │
│  └───────┬────────┘ └───────┬────────┘ └───────┬────────┘ └────┬────┘  │
│          │                  │                  │               │       │
│          ▼                  ▼                  ▼               ▼       │
│   Axios REST API     Socket.IO Client   JWT Auth State   Admin State   │
└──────────┬──────────────────┬──────────────────┬───────────────┬───────┘
           │ HTTP (Port 3000) │ WebSocket Events │ HTTP Cookies  │
           ▼                  ▼                  ▼               ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      BACKEND (Express.js + Vite)                       │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Security Middlewares: Helmet, CORS, Rate Limit, Auth & RBAC     │  │
│  └─────────────────────────────────┬────────────────────────────────┘  │
│                                    │                                   │
│  ┌───────────────────────┬─────────┴─────────────┬──────────────────┐  │
│  │ Auth & Users API      │ Movies & Shows API    │ Bookings & Pay   │  │
│  │ - bcryptjs hashing    │ - Catalog & filters   │ - Atomic locking │  │
│  │ - JWT token issuing   │ - Schedule conflicts  │ - Payment verify │  │
│  └───────────┬───────────┴───────────┬───────────┴──────────┬───────┘  │
│              │                       │                      │          │
│              ▼                       ▼                      ▼          │
│  ┌───────────────────────┬───────────────────────┬──────────────────┐  │
│  │ Socket.IO Server      │ Seat Reservation Job  │ Audit & Metrics  │  │
│  │ - Room: show:<id>     │ - 5-min lock reaper   │ - Revenue stats  │  │
│  │ - seat:hold/release   │ - Atomic state checks │ - Live occupancy │  │
│  └───────────┬───────────┴───────────┬───────────┴──────────┬───────┘  │
└──────────────┼───────────────────────┼──────────────────────┼──────────┘
               │                       │                      │
               ▼                       ▼                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        DATA PERSISTENCE LAYER                          │
│   Users · Movies · Theatres & Screens · Shows · Bookings · Payments    │
└────────────────────────────────────────────────────────────────────────┘
```

### Database Schema Overview

1. **Users Collection**
   - `_id`, `name`, `email` (unique index), `passwordHash`, `role` (`'customer' | 'admin'`), `preferredCity`, `createdAt`, `updatedAt`
2. **Movies Collection**
   - `_id`, `title`, `slug` (indexed), `description`, `genre` (array), `language`, `durationMinutes`, `releaseDate`, `contentRating` (`'U' | 'UA' | 'A'`), `posterUrl`, `backdropUrl`, `trailerUrl`, `cast` (array), `status` (`'now_showing' | 'coming_soon' | 'archived'`)
3. **Theatres Collection**
   - `_id`, `name`, `city` (indexed), `address`, `facilities` (array: Dolby Atmos, 4K Projection, Recliner, Valet), `screens` (embedded list of screens with screen number, name, seating layout configuration: rows, seatsPerRow, tiers `[Silver, Gold, Platinum]`)
4. **Shows Collection**
   - `_id`, `movieId` (ref Movie), `theatreId` (ref Theatre), `screenId`, `screenName`, `startTime`, `endTime`, `tierPricing` (`{ silver: Number, gold: Number, platinum: Number }`), `status` (`'scheduled' | 'running' | 'completed' | 'cancelled'`)
5. **Seat Inventory / Show State**
   - Managed per show with rapid atomic lookup: Seat ID (e.g., `G12`), Tier, Status (`available`, `held`, `booked`), `heldByUserId`, `heldUntil` timestamp, and `bookingId`.
6. **Bookings Collection**
   - `_id`, `bookingReference` (e.g., `IMV-839214`), `userId` (ref User), `showId` (ref Show), `movieSnapshot` (title, poster, duration), `theatreSnapshot` (name, screen, city), `showTime`, `selectedSeats` (`[{ seatId, tier, price }]`), `subtotal`, `tax`, `fees`, `totalAmount`, `bookingStatus` (`'pending' | 'confirmed' | 'cancelled'`), `paymentStatus` (`'unpaid' | 'paid' | 'refunded'`), `cancellationDetails`, `createdAt`
7. **Payments Collection**
   - `_id`, `bookingId`, `provider` (`'razorpay' | 'mock_sandbox'`), `orderId`, `paymentId`, `amount`, `currency`, `status` (`'initiated' | 'captured' | 'failed' | 'refunded'`), `createdAt`
8. **Notifications Collection**
   - `_id`, `userId`, `type` (`'booking_confirmed' | 'booking_cancelled' | 'payment_failed'`), `title`, `message`, `read`, `createdAt`

---

## 5. Phased Implementation Roadmap

- [ ] **Phase 1: Project Setup & Full-Stack Foundation**
  - Configure Express server running in tandem with Vite on port 3000 (`server.ts`).
  - Set up environment configs, security headers (Helmet), CORS, JSON parser, and central error handler.
  - Install dependencies (`bcryptjs`, `jsonwebtoken`, `socket.io`, `socket.io-client`, `zod`, `qrcode`).
- [ ] **Phase 2: Database Layer & Authentication**
  - Implement models and storage engine with auto-seeding for movies, cinemas, screens, shows, and demo users.
  - Implement JWT authentication with HTTP cookies / authorization headers, registration, login, profile, and role-based access control (`customer` vs `admin`).
- [ ] **Phase 3: Movie Catalog, Cinema Discovery & Search**
  - Implement REST APIs for `/api/movies`, `/api/theatres`, `/api/shows` with filtering by city, date, and genre.
  - Build responsive Home, Movies Catalog, Movie Details, and Cinema Discovery pages.
- [ ] **Phase 4: Real-Time Seat Selection & Atomic Locking**
  - Implement Socket.IO server and room subscription (`show:<id>`).
  - Implement atomic seat hold endpoint (`POST /api/shows/:id/hold`) with 5-minute timeout and automatic reaper.
  - Build the interactive cinema seat layout with screen orientation, tier categorization, and dynamic subtotal.
- [ ] **Phase 5: Booking Checkout & Payment Verification**
  - Server-side price calculation with GST and convenience fees.
  - Interactive payment modal with sandbox card/UPI simulation and verification.
  - Atomic booking confirmation, digital ticket generation with verifiable QR code, and notifications.
- [ ] **Phase 6: User Bookings, History & Cancellation**
  - User booking dashboard (Upcoming, Completed, Cancelled tabs).
  - Cancellation policy check with prorated refund calculation and automatic seat inventory release.
- [ ] **Phase 7: Comprehensive Administration Panel**
  - Dashboard analytics (live occupancy, confirmed revenue, booking counts, active shows).
  - Movie CRUD, cinema & screen configuration, and show scheduling with time-overlap prevention.
- [ ] **Phase 8: Polish, Testing & Comprehensive Viva Documentation**
  - Verification of mobile responsiveness, dark mode elegance, and zero-broken-image policy.
  - Production README with architecture diagrams, API specifications, and viva questions preparation guide.
