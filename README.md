# IMovies — Full-Stack Cinema Ticket Booking & Management System

> **Project Reference**: `montukhatri7898-dev/Project: iMovies`  
> **Evaluation Rubric Compliance**: For the complete, exhaustive project report covering all 6 Rubric Modules, see [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md).

A production-grade, end-to-end MERN-architected cinema ticket booking platform providing movie discovery, interactive multi-tier seat selection with real-time locking via WebSockets, atomic booking and checkout verification, verifiable QR boarding passes, customer booking management with configurable cancellation, and a comprehensive role-protected administration dashboard.

---

## 1. System Architecture

IMovies is designed with a strict client-server separation of concerns:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                         │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌─────────┐  │
│  │ Movie Catalog  │ │ Seat Layout UI │ │ Checkout & Pay │ │ Admin   │  │
│  │ & Discovery    │ │ (Interactive)  │ │ (QR Ticket)    │ │ Portal  │  │
│  └───────┬────────┘ └───────┬────────┘ └───────┬────────┘ └────┬────┘  │
│          │                  │                  │               │       │
│          ▼                  ▼                  ▼               ▼       │
│   Axios/Fetch REST   Socket.IO Client   JWT Auth State   Admin State   │
└──────────┬──────────────────┬──────────────────┬───────────────┬───────┘
           │ HTTP (Port 3000) │ WebSocket Events │ Bearer/Cookie │
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
│  │ - seat:held/release   │ - Atomic state checks │ - Live occupancy │  │
│  └───────────┬───────────┴───────────┬───────────┴──────────┬───────┘  │
└──────────────┼───────────────────────┼──────────────────────┼──────────┘
               │                       │                      │
               ▼                       ▼                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        DATA PERSISTENCE LAYER                          │
│   Users · Movies · Theatres & Screens · Shows · Bookings · Payments    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Key Features

### For Customers / Patrons
- **Cinematic Discovery**: Browse now-showing and upcoming movies with high-resolution posters, backdrops, trailers, language filters, and content ratings (`U`, `UA`, `A`).
- **City & Cinema Explorer**: Filter showtimes and multiplexes across cities (Mumbai, Delhi, Bengaluru, Hyderabad, Pune).
- **Interactive Seat Map**: Real-time multi-tier auditorium layout (Platinum Recliners, Gold Executive, Silver Standard) with curved screen glow.
- **Real-Time Seat Locks**: Immediate 5-minute atomic reservation holding via Socket.IO room events (`seat:held`, `seat:released`).
- **Trusted Server-Side Pricing**: Zero client tampering; server computes base price, 18% GST, and convenience fees.
- **Interactive Payment Gateway**: Simulated Razorpay sandbox supporting UPI, Cards, and NetBanking with cryptographic verification.
- **Verifiable Digital Pass**: High-resolution QR code embedding ticket reference, customer details, and security signature, with 1-click print support.
- **Booking Management & Cancellation**: View upcoming and completed bookings, with policy-based prorated refunds (75% if $>4$h, 50% if $2\text{--}4$h, non-refundable $<2$h) and automated seat release.

### For Administrators (`/admin`)
- **Operational KPI Dashboard**: Real-time calculation of Gross Confirmed Revenue, Net Revenue, Occupancy Rate, and Booking Counts.
- **Movie Catalog CRUD**: Add, edit, archive, and delete movies with cast, runtime, and poster configurations.
- **Multiplex & Screen Design**: Manage theatre branches, screens, seat rows, and tier configurations.
- **Conflict-Free Show Scheduling**: Collision engine verifies movie runtime + 20-minute turnaround cleaning buffer against existing screen schedules.
- **Patron Booking Audit**: Search and filter bookings by reference, patron name, or status.

---

## 3. Demo Credentials (For Evaluation & Viva Defense)

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@imovies.com` | `admin123` | Full Admin Dashboard, Catalog CRUD, Scheduling, Booking Audit |
| **Customer** | `customer@imovies.com` | `customer123` | Ticket booking, Seat hold, Payment, Cancellation, History |

*Tip: You can also use the 1-Click "Demo Login" button in the navigation bar or Sign In modal for instantaneous evaluation.*

---

## 4. Database Schema Overview

1. **Users**: `_id`, `name`, `email` (unique), `passwordHash` (bcrypt), `role` (`'customer' | 'admin'`), `preferredCity`.
2. **Movies**: `_id`, `title`, `slug`, `genre`, `language`, `durationMinutes`, `releaseDate`, `contentRating`, `posterUrl`, `backdropUrl`, `status`.
3. **Theatres**: `_id`, `name`, `city`, `address`, `facilities`, `screens` (embedded screen number, rows, seatsPerRow, tierRows).
4. **Shows**: `_id`, `movieId`, `theatreId`, `screenId`, `startTime`, `endTime`, `tierPricing` (`{ silver, gold, platinum }`), `status`.
5. **Seat Inventory**: `_id` (`${showId}_${seatId}`), `showId`, `seatId`, `tier`, `status` (`available`, `held`, `booked`), `heldByUserId`, `heldUntil`.
6. **Bookings**: `_id`, `bookingReference`, `userId`, `showId`, `selectedSeats`, `subtotal`, `taxes`, `fees`, `totalAmount`, `bookingStatus`, `paymentStatus`, `qrCodeDataUrl`.
7. **Notifications**: `_id`, `userId`, `type`, `title`, `message`, `read`, `createdAt`.

---

## 5. Viva Defense Q&A Preparation Guide

### Q1: How does the system prevent double-booking when two users click the same seat simultaneously?
> **Answer**: We enforce atomic reservations on the backend. When a customer selects seats, an atomic hold request (`POST /api/shows/:id/hold`) is evaluated against the database. The server checks that every requested seat has `status: 'available'` or an expired hold (`heldUntil <= now`). If valid, it updates the status to `'held'`, records `heldByUserId` and `heldUntil = Date.now() + 5 minutes`, and broadcasts `seat:held` via Socket.IO to all other clients in that show's room. If a second user requests the same seat even milliseconds later, the server detects the active lock and rejects the transaction with a `409 Conflict`.

### Q2: Why is price calculation strictly server-side?
> **Answer**: Clients must never be trusted with monetary computations. A malicious client could alter the payload's `totalAmount` in transit. The client only sends `{ showId, seatIds }`. The server independently looks up the screen tier multipliers, calculates the subtotal, computes the 18% GST and convenience fee, and produces the immutable payment order.

### Q3: How is authentication and role-based access control (RBAC) enforced?
> **Answer**: Passwords are encrypted with `bcryptjs` using a salt round of 10. Upon login, a signed JWT token is issued containing the user ID, email, and role. Protected endpoints use Express middleware (`authenticate`, `requireAuth`, `requireAdmin`). The admin panel verifies administrative role tokens on every API call. Merely hiding buttons on the frontend is insufficient for security.

### Q4: How is schedule collision prevented when scheduling a show?
> **Answer**: When an administrator schedules a show for screen $S$, the system fetches the movie duration and adds a 20-minute turnaround cleaning buffer. It checks for mathematical overlap: `(existingStart < newEnd) && (newStart < existingEnd)` across all existing non-cancelled shows on that screen. If an overlap is detected, the server aborts with `409 Conflict`.
