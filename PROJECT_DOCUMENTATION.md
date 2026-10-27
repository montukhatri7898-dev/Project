# Project Documentation: iMovies
**Repository**: `montukhatri7898-dev/Project: iMovies`  
**Platform**: Full-Stack Cinema Ticket Booking & Management System  
**Tech Stack**: MERN Architecture (React 19 + TypeScript, Node.js + Express.js, MongoDB Document Model, Socket.IO Real-Time Engine, Tailwind CSS v4)

---

## TABLE OF CONTENTS
1. [PROJECT ARCHITECTURE](#1-project-architecture)
   - 1.1 [Technical Architecture](#11-technical-architecture)
   - 1.2 [ER-Diagram (Entity-Relationship Diagram)](#12-er-diagram-entity-relationship-diagram)
   - 1.3 [Features](#13-features)
   - 1.4 [Roles and Responsibilities](#14-roles-and-responsibilities)
   - 1.5 [User Flow](#15-user-flow)
   - 1.6 [MVC Pattern](#16-mvc-pattern)
2. [PROJECT SETUP AND CONFIGURATION](#2-project-setup-and-configuration)
   - 2.1 [Creating Project Folder](#21-creating-project-folder)
   - 2.2 [Client Setup](#22-client-setup)
   - 2.3 [Server Setup](#23-server-setup)
3. [BACKEND DEVELOPEMENT](#3-backend-developement)
   - 3.1 [Backend Structure](#31-backend-structure)
   - 3.2 [Development and Explanation](#32-development-and-explanation)
4. [DATABASE DEVELOPMENT](#4-database-development)
   - 4.1 [Configure MongoDB](#41-configure-mongodb)
   - 4.2 [Create Database Connection](#42-create-database-connection)
   - 4.3 [Create Schema and Models](#43-create-schema-and-models)
5. [FRONTEND DEVELOPMENT](#5-frontend-development)
   - 5.1 [Frontend Structure](#51-frontend-structure)
   - 5.2 [Development and Explanation](#52-development-and-explanation)
6. [PROJECT EXECUTION](#6-project-execution)
   - 6.1 [Steps for Project Execution](#61-steps-for-project-execution)
   - 6.2 [Output Screenshots](#62-output-screenshots)
   - 6.3 [Demo Video](#63-demo-video)

---

# 1. PROJECT ARCHITECTURE

## 1.1 Technical Architecture

The **iMovies** platform is architected as a high-throughput, decoupled, three-tier client-server system designed for real-time concurrency and transactional safety.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 PRESENTATION TIER                                      │
│                             (React 19 + TypeScript + Vite)                             │
│                                                                                        │
│   ┌─────────────────────┐  ┌─────────────────────┐  ┌──────────────────────────────┐   │
│   │   Customer UI       │  │  Seat Selection UI  │  │   Administrator Portal       │   │
│   │ - Movie Discovery   │  │ - SVG Curved Screen │  │ - Operational KPIs           │   │
│   │ - Filter by City    │  │ - Multi-Tier Layout │  │ - Movie & Show CRUD          │   │
│   │ - Promo Code Banner │  │ - 5-min Hold Timer  │  │ - Conflict-Free Scheduler    │   │
│   └──────────┬──────────┘  └──────────┬──────────┘  └──────────────┬───────────────┘   │
│              │                        │                            │                   │
│              ▼                        ▼                            ▼                   │
│      REST API Client          Socket.IO Client             Role-Gated State            │
│       (Axios / Fetch)       (WebSockets / WSS)            (JWT Bearer Auth)            │
└──────────────┬────────────────────────┬────────────────────────────┬───────────────────┘
               │                        │                            │
      HTTP/JSON API Requests      Bidirectional Events         Secure Headers
      (Port 3000 /api/*)          (seat:held, seat:released)   (Authorization: Bearer)
               │                        │                            │
               ▼                        ▼                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                  APPLICATION TIER                                      │
│                               (Node.js + Express.js)                                   │
│                                                                                        │
│   ┌────────────────────────────────────────────────────────────────────────────────┐   │
│   │ Security Middlewares: Helmet, CORS, Trust Proxy (1), Rate Limiter, Body Parser │   │
│   └───────────────────────────────────────┬────────────────────────────────────────┘   │
│                                           │                                            │
│   ┌───────────────────────────────────────┴────────────────────────────────────────┐   │
│   │                         REST API Controller Layer                              │   │
│   │  /api/auth       /api/movies       /api/theatres      /api/shows               │   │
│   │  /api/bookings   /api/payments     /api/promotions    /api/admin               │   │
│   └───────────────────┬────────────────────────────────────┬───────────────────────┘   │
│                       │                                    │                           │
│   ┌───────────────────┴─────────────────┐  ┌───────────────┴───────────────────────┐   │
│   │      Socket.IO Real-Time Server     │  │       Background Daemon Jobs          │   │
│   │ - Room per show: `show:<showId>`    │  │ - 30-second Seat Hold Expire Reaper   │   │
│   │ - Sub-100ms lock synchronization    │  │ - Automatic seat release broadcast    │   │
│   └─────────────────────────────────────┘  └───────────────────────────────────────┘   │
└───────────────────────────────────────────────────┬────────────────────────────────────┘
                                                    │
                                  Atomic Queries & Data Mutations
                                                    │
                                                    ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                  PERSISTENCE TIER                                      │
│                       (MongoDB / JSON Document Store Engine)                           │
│                                                                                        │
│    Collections:                                                                        │
│    • Users (Credentials, Roles, Preferences)                                           │
│    • Movies (Metadata, Cast, Languages, Durations, Posters)                            │
│    • Theatres (Multiplexes, Cities, Screen Configurations)                             │
│    • Shows (Movie, Screen, Time Slots, Tier Pricing)                                   │
│    • SeatInventory (Atomic locks, User reservations, Expiry timestamps)                │
│    • Bookings (References, Seat arrays, Pricing, QR code, Status)                      │
│    • Payments (Transactions, Payment methods, Gateway responses)                       │
│    • Promotions (Discount codes, Expiry, Percentages, Limits)                         │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Communication Protocols & Network Flow
1. **HTTP/1.1 & HTTPS**: Handles idempotent queries (movie listings, theatre schedules, profile information) and transactional commands (user registration, payment processing, booking cancellation).
2. **WebSockets (WSS / Socket.IO)**: Powers real-time auditorium seat status propagation. When a patron selects a seat in auditorium Screen 1, a `seat:hold` event is emitted. The server checks availability atomically, updates the seat's reservation status, and broadcasts `seat:held` to all connected clients viewing that specific show room.
3. **JWT Bearer Authentication**: Stateless JSON Web Tokens containing user identity (`id`, `email`, `role`) are transmitted via HTTP `Authorization: Bearer <token>` headers or secured cookies.

---

## 1.2 ER-Diagram (Entity-Relationship Diagram)

```
   ┌───────────────────────┐
   │         USER          │
   ├───────────────────────┤
   │ PK  _id               │
   │     name              │
   │     email (UNIQUE)    │
   │     passwordHash      │
   │     role (cust/admin) │
   │     preferredCity     │
   │     createdAt         │
   └──────────┬────────────┘
              │ 1
              │
              │ has many (1:N)
              ▼ N
   ┌───────────────────────┐           ┌───────────────────────┐
   │        BOOKING        │  1     1  │        PAYMENT        │
   ├───────────────────────┤───────────├───────────────────────┤
   │ PK  _id               │  pays for │ PK  _id               │
   │     bookingReference  │           │ FK  bookingId         │
   │ FK  userId            │           │ FK  userId            │
   │ FK  showId            │           │     amount            │
   │     selectedSeats[]   │           │     paymentMethod     │
   │     subtotal          │           │     transactionRef    │
   │     taxes (GST 18%)   │           │     status            │
   │     convenienceFee    │           │     createdAt         │
   │     discountAmount    │           └───────────────────────┘
   │     totalAmount       │
   │     bookingStatus     │
   │     paymentStatus     │
   │     qrCodeDataUrl     │
   │     createdAt         │
   └──────────┬────────────┘
              │ N
              │
              │ reserves for (N:1)
              ▼ 1
   ┌───────────────────────┐ 1       N ┌───────────────────────┐
   │         SHOW          │───────────│    SEAT_INVENTORY     │
   ├───────────────────────┤ organizes ├───────────────────────┤
   │ PK  _id               │ inventory │ PK  _id (show_seat)   │
   │ FK  movieId           │           │ FK  showId            │
   │ FK  theatreId         │           │     seatId (e.g. B4)  │
   │ FK  screenId          │           │     row / colNumber   │
   │     startTime         │           │     tier (Sil/Gld/Plt)│
   │     endTime           │           │     status (A/H/B)    │
   │     tierPricing {}    │           │ FK  heldByUserId      │
   │     status            │           │     heldUntil         │
   └───────┬───────┬───────┘           └───────────────────────┘
           │       │
       N:1 │       │ N:1
           │       ▼
           │     ┌───────────────────────┐ 1       N ┌───────────────────────┐
           │     │        THEATRE        │───────────│        SCREEN         │
           │     ├───────────────────────┤ contains  ├───────────────────────┤
           │     │ PK  _id               │ screens   │ PK  screenId          │
           │     │     name              │           │ FK  theatreId         │
           │     │     city              │           │     name              │
           │     │     address           │           │     screenType (IMAX) │
           │     │     facilities[]      │           │     totalSeats        │
           │     └───────────────────────┘           │     tierRows {}       │
           ▼ N                                       └───────────────────────┘
   ┌───────────────────────┐
   │         MOVIE         │
   ├───────────────────────┤
   │ PK  _id               │
   │     title             │
   │     slug              │
   │     genre[]           │
   │     language          │
   │     durationMinutes   │
   │     contentRating     │
   │     releaseDate       │
   │     posterUrl         │
   │     backdropUrl       │
   │     status            │
   └───────────────────────┘
```

### Cardinality Rules
- **One User to Many Bookings (1:N)**: A registered customer can book tickets for multiple movies over time.
- **One Booking to Exactly One Payment (1:1)**: Each completed booking is reconciled with a single verified payment record.
- **One Movie to Many Shows (1:N)**: A movie is scheduled across multiple theatres, screens, and time slots.
- **One Theatre to Many Screens (1:N)**: A multiplex contains multiple physical auditoriums (e.g., Screen 1 IMAX, Screen 2 Gold Class).
- **One Screen to Many Shows (1:N)**: A screen hosts multiple sequenced shows throughout the day, constrained by collision buffers.
- **One Show to Many Seat Inventory Records (1:N)**: Each show instantiates the physical screen layout into active seat states (`available`, `held`, `booked`).

---

## 1.3 Features

### Customer / Patron Features
1. **Interactive Movie Discovery**:
   - Filter by City (Mumbai, Delhi, Bengaluru, Hyderabad, Pune).
   - Filter by Language (Hindi, Telugu, Tamil, English, Kannada) and Genre (Action, Thriller, Sci-Fi, Drama).
   - Search by title, director, or cast with instant client-side debouncing.
   - Comprehensive Movie Details page with embedded trailers, synopsis, duration, cast details, and age ratings.
2. **Promotions & Discount Engine**:
   - Live promotional banner carousel on the Homepage.
   - Copy-to-clipboard coupon codes:
     - `IMOVIE50` (50% off up to ₹150)
     - `DESI20` (Flat 20% off Indian blockbusters)
     - `IMAXPASS` (Flat ₹100 discount on IMAX screens)
   - Real-time coupon validation with immediate cart price recalculation.
3. **Auditorium Seat Reservation with Real-Time Lock**:
   - SVG Curved Cinema Screen visualization with realistic screen glow.
   - Tiered seating structure:
     - **Platinum Recliners** (Top tier, luxury seating with extra legroom)
     - **Gold Executive** (Middle tier, prime optical viewing angle)
     - **Silver Standard** (Front tier, economical pricing)
   - Sub-second visual feedback: Selected seats turn yellow, locked seats turn red, available seats remain green/gray.
   - 5-Minute atomic countdown timer synchronized with the server lock reaper.
4. **Trusted Checkout & Payment Gateway**:
   - Zero-trust pricing: All totals, taxes (18% GST), and convenience fees calculated exclusively on the backend.
   - Multi-option simulated payment gateway supporting UPI (Google Pay, PhonePe, Paytm QR), Credit/Debit Cards, and NetBanking.
5. **Verifiable Digital QR Boarding Pass**:
   - Instant booking confirmation displaying unique alphanumeric Booking Reference (e.g., `IMV-984210`).
   - High-resolution SVG/Canvas QR Code containing signed ticket payload for cinema gate scanning.
   - 1-Click Print Ticket functionality with CSS `@media print` optimized receipt formatting.
6. **Self-Service Booking Management & Prorated Refunds**:
   - "My Bookings" portal showing active upcoming shows and past booking history.
   - Policy-based cancellation:
     - $>4$ Hours before showtime: 75% refund.
     - $2\text{ to }4$ Hours before showtime: 50% refund.
     - $<2$ Hours before showtime: Non-refundable.
   - Automated seat inventory release back to the available pool upon cancellation.

### Administrator Features
1. **Operational KPI Dashboard**:
   - Real-time calculation of Gross Confirmed Revenue, Total Tickets Sold, System-wide Occupancy Percentage, and Active Catalog Count.
2. **Movie Catalog Management (CRUD)**:
   - Add new movies with poster URLs, trailer links, runtimes, and languages.
   - Edit release status (`Now Showing`, `Upcoming`, `Archived`).
3. **Multiplex & Screen Management**:
   - Configure theatre properties, city associations, amenities, and auditorium seat capacities.
4. **Collision-Free Show Scheduling**:
   - Schedule new shows by selecting Movie, Theatre, Screen, and Start Time.
   - Automated collision engine calculates Movie Duration + 20-minute turnaround cleaning buffer.
   - Aborts schedule conflicts with exact overlap warnings (`409 Conflict`).
5. **Customer Booking Audit**:
   - Searchable ledger of all bookings across the platform with status filtering and customer details.

---

## 1.4 Roles and Responsibilities

| Role | Access Level | Responsibilities & Capabilities |
| :--- | :--- | :--- |
| **Guest / Anonymous** | Public | • Browse catalog, upcoming films, and active promotions.<br>• Filter showtimes by city and theatre.<br>• View movie details, synopses, and cast info.<br>• Preview auditorium layout without reserving seats. |
| **Customer / Patron** | Authenticated (`role: 'customer'`) | • Lock up to 10 seats simultaneously with 5-minute atomic hold.<br>• Apply promotional discount coupons at checkout.<br>• Pay via simulated UPI, Card, or NetBanking gateway.<br>• Receive verifiable QR Code boarding passes.<br>• Cancel bookings and receive automated policy-governed refunds.<br>• View personal ticket history. |
| **Administrator** | Privileged (`role: 'admin'`) | • Full administrative access to `/admin`.<br>• View executive financial KPIs and auditorium occupancy metrics.<br>• Create, update, and remove movies from the catalog.<br>• Schedule movie showtimes with automated collision detection.<br>• Audit all customer bookings, payment states, and cancellations. |

---

## 1.5 User Flow

```
                     ┌─────────────────────────────┐
                     │     Guest / User Lands      │
                     │       on iMovies App        │
                     └──────────────┬──────────────┘
                                    │
                                    ▼
                     ┌─────────────────────────────┐
                     │   Select City & Browse      │
                     │  Catalog / Indian Movies    │
                     └──────────────┬──────────────┘
                                    │
                                    ▼
                     ┌─────────────────────────────┐
                     │  Select Movie & View Details │
                     │   (Trailer, Cast, Synopsis) │
                     └──────────────┬──────────────┘
                                    │
                                    ▼
                     ┌─────────────────────────────┐
                     │  Select Theatre, Date &     │
                     │       Showtime Slot         │
                     └──────────────┬──────────────┘
                                    │
                                    ▼
                     ┌─────────────────────────────┐
                     │  Interactive Auditorium UI  │◄────────────┐
                     │    (SVG Screen & Tiers)     │             │
                     └──────────────┬──────────────┘             │
                                    │                            │
                            Select Desired Seats                 │
                                    │                            │
                                    ▼                            │
                     ┌─────────────────────────────┐             │
                     │ Server Atomic Hold Request  │             │
                     │  (Lock seats for 5 minutes) │             │
                     └──────────────┬──────────────┘             │
                                    │                            │
                           ┌────────┴────────┐                   │
                  Success  │                 │ Conflict (Taken)  │
                  ─────────┘                 └───────────────────┘
                      │
                      ▼
       ┌─────────────────────────────┐
       │   Authenticate / Sign In    │ (1-Click Demo or Account Login)
       └──────────────┬──────────────┘
                      │
                      ▼
       ┌─────────────────────────────┐
       │     Checkout & Review       │
       │  • Apply Promo Code         │ (e.g. IMOVIE50, DESI20)
       │  • Review GST & Fees        │
       │  • Choose Payment Method    │ (UPI QR, Card, NetBanking)
       └──────────────┬──────────────┘
                      │
                      ▼
       ┌─────────────────────────────┐
       │   Payment Processing &      │
       │  Atomic Confirmation        │
       └──────────────┬──────────────┘
                      │
                      ▼
       ┌─────────────────────────────┐
       │   Digital Boarding Pass     │
       │  • Verifiable QR Code       │
       │  • 1-Click Print Pass       │
       └──────────────┬──────────────┘
                      │
                      ▼
       ┌─────────────────────────────┐
       │  Manage in 'My Bookings'    │
       │  (Option to Cancel & Refund)│
       └─────────────────────────────┘
```

---

## 1.6 MVC Pattern

The iMovies system strictly adheres to the **Model-View-Controller (MVC)** architectural design pattern:

```
                  ┌────────────────────────────────────────┐
                  │                 VIEW                   │
                  │        (React 19 Frontend)             │
                  │                                        │
                  │  • Pages: Home, MovieDetails, Seats,   │
                  │    Checkout, Confirmation, Admin       │
                  │  • Components: Navbar, Promotions,     │
                  │    AuthModal, Footer, SeatMap          │
                  │  • Dynamic UI & Real-Time Sync         │
                  └───────────────▲────────┬───────────────┘
                                  │        │
                     Render State │        │ User Action / Events
                     & UI Updates │        │ (HTTP / WebSocket)
                                  │        │
                                  │        ▼
                  ┌────────────────────────────────────────┐
                  │              CONTROLLER                │
                  │       (Express.js Route Handlers)      │
                  │                                        │
                  │  • server/routes/auth.ts               │
                  │  • server/routes/movies.ts             │
                  │  • server/routes/shows.ts              │
                  │  • server/routes/bookings.ts           │
                  │  • server/routes/promotions.ts         │
                  │  • server/routes/admin.ts              │
                  │  • Input Validation & Rate Limiting    │
                  │  • Atomic Hold & Conflict Logic        │
                  └───────────────▲────────┬───────────────┘
                                  │        │
                     Data Queries │        │ Mutate / Query
                     & Responses  │        │ Operations
                                  │        │
                                  │        ▼
                  ┌────────────────────────────────────────┐
                  │                 MODEL                  │
                  │      (Database Persistence Layer)      │
                  │                                        │
                  │  • User, Movie, Theatre, Screen        │
                  │  • Show, SeatInventory, Booking        │
                  │  • Payment, Promotion Models           │
                  │  • Schema Rules & Atomic File Store    │
                  └────────────────────────────────────────┘
```

1. **Model**:
   - Represents the core business entities and database layer.
   - Encapsulates data validation, entity definitions (Users, Movies, Shows, SeatInventories, Bookings), default timestamps, and persistent disk operations.
   - Completely decoupled from how data is presented to the user.
2. **View**:
   - The user interface constructed with React 19, TypeScript, and Tailwind CSS.
   - Receives state from controllers and renders the visual movie cards, interactive seat map, countdown timers, checkout forms, and QR boarding passes.
   - Dispatches user events (clicks, input changes, form submissions) to the controller via REST endpoints and Socket.IO messages.
3. **Controller**:
   - The intermediate logic layer implemented via Express route handlers.
   - Intercepts requests, validates authorization headers via JWT middleware, performs conflict checks (e.g., verifying if another patron holds a seat), invokes Model methods to persist or update records, and returns sanitized JSON responses to the View.

---

# 2. PROJECT SETUP AND CONFIGURATION

## 2.1 Creating Project Folder

To organize the full-stack MERN application cleanly, the project is structured as a unified monorepo where client and server coexist with optimized build pipelines:

```bash
# 1. Create project root directory
mkdir imovies
cd imovies

# 2. Initialize project with npm
npm init -y

# 3. Create core directory structure
mkdir -p src/components src/pages src/assets/images
mkdir -p server/routes
mkdir -p data public/assets
```

### Monorepo Directory Tree
```
imovies/
├── .env.example              # Environment variables template
├── index.html                # Single-page application HTML entry point
├── metadata.json             # AI Studio applet metadata & capabilities
├── package.json              # Project dependencies and script runner
├── tsconfig.json             # TypeScript compiler settings
├── vite.config.ts            # Vite 8 bundling & Tailwind plugin configuration
├── server.ts                 # Full-stack Express.js entry point & dev server
├── data/
│   └── imovies_db.json       # Persistent database document store
├── server/
│   ├── db.ts                 # Database abstraction & seed records
│   └── routes/
│       ├── auth.ts           # Authentication & user profile endpoints
│       ├── movies.ts         # Movie discovery & catalog management
│       ├── theatres.ts       # Multiplex & screen layout queries
│       ├── shows.ts          # Showtime scheduling & seat retrieval
│       ├── bookings.ts       # Atomic seat holds, checkout, & cancel
│       ├── payments.ts       # Payment gateway simulation
│       ├── promotions.ts     # Promo codes & discount calculator
│       ├── admin.ts          # Operational KPIs & analytics
│       └── notifications.ts  # In-app user alerts
└── src/
    ├── main.tsx              # React client entry point
    ├── App.tsx               # Root component & page router
    ├── index.css             # Tailwind CSS v4 styling rules
    ├── assets/images/        # High-resolution film posters & banners
    ├── components/
    │   ├── Navbar.tsx        # Responsive header with city selector
    │   ├── Footer.tsx        # Cinema info & system links
    │   ├── AuthModal.tsx     # Sign In / Sign Up modal with demo creds
    │   └── Promotions.tsx    # Active discount coupon cards
    └── pages/
        ├── HomePage.tsx      # Landing page, hero slider, Indian films
        ├── MoviesPage.tsx    # Filterable movie catalog
        ├── MovieDetailsPage.tsx # Synopses, trailers, & showtimes
        ├── SeatSelectionPage.tsx # Real-time interactive seat layout
        ├── CheckoutPage.tsx  # Pricing breakdown & payment gateway
        ├── BookingConfirmationPage.tsx # Digital QR boarding pass
        ├── MyBookingsPage.tsx # Ticket ledger & refund cancellation
        └── AdminPage.tsx     # KPIs, catalog CRUD, & show scheduler
```

---

## 2.2 Client Setup

The client is built using modern tooling: **React 19**, **Vite 8**, **TypeScript**, and **Tailwind CSS v4**.

### 1. Vite & Tailwind Configuration (`vite.config.ts`)
```typescript
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
```

### 2. Global Styling (`src/index.css`)
```css
@import "tailwindcss";

@layer base {
  body {
    background-color: #0b0f19;
    color: #f3f4f6;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  }
}
```

### 3. Dependencies Installed
```bash
npm install react react-dom lucide-react motion
npm install -D @types/react @types/react-dom @vitejs/plugin-react @tailwindcss/vite tailwindcss typescript vite
```

---

## 2.3 Server Setup

The backend utilizes **Express.js** running in Node.js via `tsx` (TypeScript Execution) alongside **Socket.IO** for real-time WebSocket communication.

### Key Server Configuration (`server.ts`)
```typescript
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

// Configure Express trust proxy for accurate rate-limiting behind reverse proxies
app.set('trust proxy', 1);

// Security middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Rate limiter configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
});
app.use('/api/', limiter);
```

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "tsx server.ts",
    "build": "vite build",
    "start": "node dist/server.js",
    "lint": "eslint src --ext .ts,.tsx"
  }
}
```

---

# 3. BACKEND DEVELOPEMENT

## 3.1 Backend Structure

The backend separates routing, business validation, data mutations, and real-time events across dedicated controller modules:

```
server/
├── db.ts               # Atomic persistent JSON document database & seed records
├── routes/
│   ├── auth.ts         # User registration, login, bcrypt verification, JWT issuing
│   ├── movies.ts       # Movie catalog listing, filtering, search, and CRUD
│   ├── theatres.ts     # Multiplex locations, cities, and auditorium structures
│   ├── shows.ts        # Showtime scheduling, collision detection, seat layout
│   ├── bookings.ts     # Atomic seat holds, checkout, ticket issuance, cancellation
│   ├── payments.ts     # Payment gateway simulation & cryptographic verification
│   ├── promotions.ts   # Discount coupons validation engine
│   ├── admin.ts        # KPI statistics, revenue calculations, occupancy analytics
│   └── notifications.ts# In-app user alerts
```

---

## 3.2 Development and Explanation

### Core API Endpoints

#### 1. Authentication Endpoints (`/api/auth`)
- `POST /api/auth/register`: Hashes password with `bcryptjs` (salt 10) and persists new customer record.
- `POST /api/auth/login`: Verifies email and password hash; returns signed JWT token with user object.
- `GET /api/auth/me`: Validates `Authorization: Bearer <token>` header and returns authenticated user profile.

#### 2. Movie Catalog Endpoints (`/api/movies`)
- `GET /api/movies`: Returns movie array with optional filters:
  - `?city=Mumbai`
  - `?language=Hindi`
  - `?genre=Action`
  - `?search=Velocity`
- `GET /api/movies/:id`: Retrieves full details, cast, synopsis, and associated showtimes.
- `POST /api/movies`: (Admin Only) Adds a new movie title to the catalog.
- `PUT /api/movies/:id`: (Admin Only) Updates movie metadata or poster URLs.
- `DELETE /api/movies/:id`: (Admin Only) Deletes a movie from the catalog.

#### 3. Showtime & Scheduling Endpoints (`/api/shows`)
- `GET /api/shows?movieId=<id>&city=<city>`: Returns available showtimes across multiplexes.
- `GET /api/shows/:id`: Returns show details, screen metadata, tier pricing, and current seat map state.
- `POST /api/shows`: (Admin Only) Creates a showtime with **automated collision detection**:
  ```typescript
  // Collision Prevention Algorithm
  const newStart = new Date(startTime).getTime();
  const newEnd = newStart + (movie.durationMinutes + 20) * 60 * 1000; // 20m cleaning turnaround

  const collision = existingShows.some(show => {
    if (show.screenId !== screenId || show.status === 'cancelled') return false;
    const existingStart = new Date(show.startTime).getTime();
    const existingEnd = new Date(show.endTime).getTime();
    return (newStart < existingEnd && existingStart < newEnd);
  });

  if (collision) {
    return res.status(409).json({ error: 'Schedule collision detected on this screen.' });
  }
  ```

#### 4. Real-Time Seat Locking & Booking Endpoints (`/api/bookings`)
- `POST /api/shows/:id/hold`: Atomically locks selected seats for 5 minutes.
  - Verifies that all requested seats are `status === 'available'` or have an expired `heldUntil`.
  - Sets `status = 'held'`, `heldByUserId = userId`, and `heldUntil = Date.now() + 5 * 60 * 1000`.
  - Broadcasts `seat:held` event via Socket.IO to `show:<id>` room.
- `POST /api/shows/:id/release`: Releases held seats before timeout.
- `POST /api/bookings`:
  - Enforces zero-trust server-side calculation:
    $$\text{Subtotal} = \sum \text{Seat Tier Base Prices}$$
    $$\text{Taxes} = \text{Subtotal} \times 18\% \quad (\text{GST})$$
    $$\text{Convenience Fee} = ₹30 \times \text{Number of Seats}$$
    $$\text{Total Amount} = \text{Subtotal} + \text{Taxes} + \text{Convenience Fee} - \text{Discount}$$
  - Generates verifiable QR code embedding booking reference and secret hash.
  - Marks seats as permanently `'booked'` and broadcasts `seat:booked`.
- `POST /api/bookings/:id/cancel`:
  - Evaluates time remaining until showtime.
  - Calculates refund: $>4\text{h} \rightarrow 75\%$, $2\text{--}4\text{h} \rightarrow 50\%$, $<2\text{h} \rightarrow 0\%$.
  - Releases seats back to `'available'` and records refund payment log.

#### 5. Promotion Endpoints (`/api/promotions`)
- `GET /api/promotions`: Returns active promotional banners and coupon codes.
- `POST /api/promotions/apply`: Validates coupon code, checks minimum purchase requirements, and returns calculated discount.

#### 6. Background Seat Reaper Daemon
A background recurring job runs every 30 seconds to reclaim abandoned holds:
```typescript
setInterval(() => {
  const now = Date.now();
  const releasedSeats = db.seatInventory.filter(
    s => s.status === 'held' && s.heldUntil && new Date(s.heldUntil).getTime() < now
  );
  
  for (const seat of releasedSeats) {
    seat.status = 'available';
    seat.heldByUserId = null;
    seat.heldUntil = null;
    io.to(`show:${seat.showId}`).emit('seat:released', { seatId: seat.seatId });
  }
}, 30000);
```

---

# 4. DATABASE DEVELOPMENT

## 4.1 Configure MongoDB

The application is architected to run seamlessly with MongoDB Atlas in production or a local MongoDB community instance. For development, portable testing, and viva defense demonstrations, it incorporates a zero-dependency JSON document store (`server/db.ts`) with identical schema semantics and atomic file writes.

### Connection Configuration (`.env`)
```env
MONGODB_URI="mongodb+srv://admin:securePassword@cluster0.mongodb.net/imovies?retryWrites=true&w=majority"
DB_NAME="imovies"
```

---

## 4.2 Create Database Connection

### Mongoose Connection Setup (`server/database.ts`)
```typescript
import mongoose from 'mongoose';

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/imovies';
  
  try {
    await mongoose.connect(uri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('Successfully connected to MongoDB database.');
  } catch (error) {
    console.error('MongoDB connection failure:', error);
    process.exit(1);
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Re-establishing connection...');
});
```

---

## 4.3 Create Schema and Models

### 1. User Model Schema
```typescript
import { Schema, model } from 'mongoose';

const UserSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  preferredCity: { type: String, default: 'Mumbai' },
  createdAt: { type: Date, default: Date.now },
});

export const UserModel = model('User', UserSchema);
```

### 2. Movie Model Schema
```typescript
const MovieSchema = new Schema({
  title: { type: String, required: true, index: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  durationMinutes: { type: Number, required: true },
  genre: [{ type: String, required: true }],
  language: { type: String, required: true, index: true },
  releaseDate: { type: String, required: true },
  contentRating: { type: String, enum: ['U', 'UA', 'A'], default: 'UA' },
  posterUrl: { type: String, required: true },
  backdropUrl: { type: String, required: true },
  trailerUrl: { type: String, default: '' },
  status: { type: String, enum: ['now-showing', 'upcoming', 'archived'], default: 'now-showing' },
  rating: { type: Number, default: 8.5 },
  votesCount: { type: Number, default: 1200 },
});

export const MovieModel = model('Movie', MovieSchema);
```

### 3. Theatre & Screen Schema
```typescript
const ScreenSchema = new Schema({
  screenId: { type: String, required: true },
  name: { type: String, required: true },
  screenType: { type: String, enum: ['IMAX 4K', '4DX', 'Dolby Atmos', 'Standard'], default: 'Dolby Atmos' },
  totalSeats: { type: Number, required: true },
  rows: { type: Number, required: true },
  seatsPerRow: { type: Number, required: true },
  tierRows: {
    platinum: [{ type: String }], // e.g. ['A', 'B']
    gold: [{ type: String }],     // e.g. ['C', 'D', 'E']
    silver: [{ type: String }],   // e.g. ['F', 'G', 'H']
  },
});

const TheatreSchema = new Schema({
  name: { type: String, required: true },
  city: { type: String, required: true, index: true },
  address: { type: String, required: true },
  facilities: [{ type: String }],
  screens: [ScreenSchema],
});

export const TheatreModel = model('Theatre', TheatreSchema);
```

### 4. Show & Seat Inventory Schema
```typescript
const ShowSchema = new Schema({
  movieId: { type: Schema.Types.ObjectId, ref: 'Movie', required: true, index: true },
  theatreId: { type: Schema.Types.ObjectId, ref: 'Theatre', required: true, index: true },
  screenId: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  tierPricing: {
    silver: { type: Number, required: true },
    gold: { type: Number, required: true },
    platinum: { type: Number, required: true },
  },
  status: { type: String, enum: ['active', 'cancelled', 'completed'], default: 'active' },
});

const SeatInventorySchema = new Schema({
  showId: { type: Schema.Types.ObjectId, ref: 'Show', required: true, index: true },
  seatId: { type: String, required: true },
  row: { type: String, required: true },
  colNumber: { type: Number, required: true },
  tier: { type: String, enum: ['silver', 'gold', 'platinum'], required: true },
  status: { type: String, enum: ['available', 'held', 'booked'], default: 'available' },
  heldByUserId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  heldUntil: { type: Date, default: null },
});
SeatInventorySchema.index({ showId: 1, seatId: 1 }, { unique: true });

export const ShowModel = model('Show', ShowSchema);
export const SeatInventoryModel = model('SeatInventory', SeatInventorySchema);
```

### 5. Booking & Payment Schema
```typescript
const BookingSchema = new Schema({
  bookingReference: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  showId: { type: Schema.Types.ObjectId, ref: 'Show', required: true },
  selectedSeats: [{
    seatId: String,
    tier: String,
    price: Number,
  }],
  subtotal: { type: Number, required: true },
  taxes: { type: Number, required: true },
  convenienceFees: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  bookingStatus: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
  paymentStatus: { type: String, enum: ['paid', 'refunded'], default: 'paid' },
  qrCodeDataUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const BookingModel = model('Booking', BookingSchema);
```

---

# 5. FRONTEND DEVELOPMENT

## 5.1 Frontend Structure

```
src/
├── main.tsx                  # React 19 Client Initialization
├── App.tsx                   # Main Layout, Navigation State, Global Router
├── index.css                 # Tailwind CSS directives & custom animations
├── assets/
│   └── images/               # High-fidelity movie posters and banners
├── components/
│   ├── Navbar.tsx            # Header with City Dropdown, Search, Auth Trigger
│   ├── Footer.tsx            # Footer with project links & documentation trigger
│   ├── AuthModal.tsx         # Tabbed Sign In / Sign Up modal with demo creds
│   └── Promotions.tsx        # Active promotional discount coupon carousel
└── pages/
    ├── HomePage.tsx          # Hero backdrop slider, Indian blockbusters, Promos
    ├── MoviesPage.tsx        # Complete movie catalog with multi-facet filters
    ├── MovieDetailsPage.tsx  # Movie metadata, video trailer embed, show selector
    ├── SeatSelectionPage.tsx # Interactive SVG auditorium map & 5-minute timer
    ├── CheckoutPage.tsx      # Payment gateway simulation & promo code validation
    ├── BookingConfirmationPage.tsx # Digital QR boarding pass & printable voucher
    ├── MyBookingsPage.tsx    # Customer booking ledger & prorated refund dialog
    └── AdminPage.tsx         # KPI analytics, movie CRUD, conflict-free scheduler
```

---

## 5.2 Development and Explanation

### 1. State Management & Hooks Pattern
- **City State (`currentCity`)**: Persisted in `localStorage` and shared across the Navbar and catalog filters so patrons immediately see showtimes in their metropolitan area.
- **User Authentication State (`currentUser`, `token`)**: Managed via a dedicated session hook that verifies token freshness against `GET /api/auth/me`.
- **Seat Map Real-Time State (`SeatSelectionPage`)**:
  - Connects to Socket.IO room `show:<showId>`.
  - Maintains `selectedSeats[]` locally for the customer.
  - Listens to incoming `seat:held`, `seat:released`, and `seat:booked` events to re-render auditorium seats in real-time without page refresh.
  - Houses a 5-minute client-side countdown timer with auto-redirect to showtimes if the hold expires.

### 2. SVG Curved Cinema Screen & Layout
The auditorium view features a realistic curved silver screen with radial gradients and neon glow:
```tsx
<div className="relative mb-12 flex flex-col items-center">
  <svg viewBox="0 0 800 60" className="w-full max-w-2xl h-14">
    <path
      d="M 50 50 Q 400 10 750 50"
      fill="none"
      stroke="url(#screenGradient)"
      strokeWidth="6"
      strokeLinecap="round"
    />
    <defs>
      <linearGradient id="screenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2" />
        <stop offset="50%" stopColor="#38bdf8" stopOpacity="1" />
        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
      </linearGradient>
    </defs>
  </svg>
  <span className="text-xs uppercase tracking-widest text-sky-400 font-semibold mt-1">
    All Eyes This Way • Auditorium Screen
  </span>
</div>
```

### 3. High-Resolution QR Boarding Pass
Upon checkout confirmation, a verifiable ticket is dynamically rendered with customer initials, barcode lines, booking reference, and a scannable QR code generated via HTML5 Canvas. A dedicated `@media print` CSS block formats the page for physical thermal ticket printing or PDF export.

---

# 6. PROJECT EXECUTION

## 6.1 Steps for Project Execution

### Prerequisites
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher
- Modern web browser (Chrome, Edge, Firefox, Safari)

### Step-by-Step Execution Guide

```bash
# 1. Clone the repository from GitHub
git clone https://github.com/montukhatri7898-dev/iMovies.git
cd iMovies

# 2. Install all project dependencies (Client & Server)
npm install

# 3. Configure environment variables
# Copy template into .env
cp .env.example .env

# 4. Start the Full-Stack Application in Development Mode
npm run dev
```

The application will start on `http://localhost:3000`:
- **Vite Client**: Proxied and served through port 3000.
- **Express Backend**: Listening on port 3000 with `/api/*` endpoints.
- **Socket.IO Real-Time Engine**: Active on `ws://localhost:3000`.

### Production Build & Deployment
```bash
# Build optimized client bundles
npm run build

# Start production server
npm start
```

---

## 6.2 Output Screenshots

### 1. Homepage & Indian Blockbusters Showcase
- **Description**: Features dynamic hero slider with high-resolution backdrops, city selector, quick search, and active Indian blockbuster posters (*Mumbai Velocity*, *Kaal Bhairav: Forest Legend*, *Crimson Dynasty*, *Stellar Voyage*).
- **Key Elements**: Search bar, city dropdown (Mumbai, Delhi, Bengaluru, Hyderabad, Pune), "Book Now" CTA, language tags (`Hindi`, `Telugu`, `Tamil`, `English`), IMDB ratings.
- **Asset References**: `/src/assets/images/poster_mumbai_velocity.png`, `/src/assets/images/poster_kaal_bhairav.png`.

### 2. Promotions & Discount Engine
- **Description**: Prominent promotional component rendering active discount vouchers with 1-click clipboard copy functionality.
- **Active Codes**:
  - `IMOVIE50` — 50% Off up to ₹150
  - `DESI20` — Flat 20% discount on Indian blockbusters
  - `IMAXPASS` — Flat ₹100 discount on IMAX screens

### 3. Movie Details & Showtime Selection
- **Description**: Displays full movie synopsis, cast & crew roster, duration, age classification (`UA`), genre badges, embedded YouTube trailer preview, and date selector pills (Today, Tomorrow, Weekend).
- **Multiplex Listings**: PVR INOX, Cinepolis, and Miraj Cinemas with screen format tags (`IMAX 4K`, `Dolby Atmos`) and interactive showtime buttons.

### 4. Interactive Auditorium Seat Selection
- **Description**: Tier-based auditorium map (Platinum Recliners ₹450, Gold Executive ₹280, Silver Standard ₹180).
- **Real-Time Indicators**:
  - Green/Gray: Available
  - Red: Booked by other patrons
  - Yellow: Currently selected
  - Purple: Held by other users in real-time
- **Timer**: 5-Minute atomic reservation countdown banner with real-time progress bar.

### 5. Multi-Option Checkout & Payment Gateway
- **Description**: Itemized summary (Ticket price, 18% GST, convenience fees, discount deduction).
- **Payment Modes**:
  - **UPI Mode**: Generates dynamic QR code for instant scanning with PhonePe / Google Pay / Paytm.
  - **Card Mode**: 16-digit card input with auto-formatting, expiry, and CVV.
  - **NetBanking Mode**: HDFC, ICICI, SBI, Axis bank selection.

### 6. Digital QR Boarding Pass & Printable Voucher
- **Description**: Confirmed boarding pass featuring high-contrast QR code, unique alphanumeric reference (`IMV-xxxxxx`), seat numbers, hall number, and "Print Ticket" button formatted for thermal printers.

### 7. My Bookings & Refund Cancellation Workflow
- **Description**: Tabbed ledger showing upcoming shows and booking history. Includes an interactive modal demonstrating policy-based prorated refunds (75% / 50% / 0%) and instant seat release.

### 8. Administrator Dashboard (`/admin`)
- **Description**: Executive dashboard with four real-time KPI counter cards (Total Confirmed Revenue, Tickets Booked, Occupancy Rate, Active Movies), a Movie Catalog CRUD modal, a conflict-free show scheduling tool with automated collision prevention, and a searchable customer booking audit log.

---

## 6.3 Demo Video

### Viva Defense & Demonstration Walkthrough Script (3-Minute Presentation)

#### Phase 1: Architecture & Overview (0:00 - 0:30)
> *"Good morning, evaluators. Today I am presenting **iMovies**, an enterprise-grade cinema ticket booking and cinema management platform built on the MERN stack with TypeScript and Socket.IO. The system solves the primary challenge in cinema ticketing: high-concurrency race conditions during blockbuster seat reservations."*

#### Phase 2: Customer Discovery & Real-Time Seat Hold (0:30 - 1:15)
> *"Here on the Homepage, patrons select their city and explore curated movies, including our featured Indian blockbusters like Mumbai Velocity and Kaal Bhairav. Notice our active Promotions component offering verified coupon codes like `IMOVIE50`.*  
> *When we enter the auditorium seat map, we see our curved screen and three seat tiers: Platinum, Gold, and Silver. Watch what happens when I select seats A3 and A4: the backend initiates an atomic 5-minute hold, locking these seats across all connected clients via WebSockets and starting our countdown timer."*

#### Phase 3: Zero-Trust Checkout & QR Boarding Pass (1:15 - 1:50)
> *"Proceeding to checkout, all pricing is verified server-side with 18% GST and convenience fees. We apply the promo code `IMOVIE50` to receive an instant discount. We simulate payment via UPI or Card, and upon completion, the system transitions seats from 'held' to 'booked' and issues this digital boarding pass with a verifiable QR code ready for gate scanning."*

#### Phase 4: Customer Booking Management & Cancellation (1:50 - 2:20)
> *"In the 'My Bookings' section, customers can inspect their boarding pass anytime or trigger a cancellation. Our policy engine inspects the showtime: if cancelled more than 4 hours prior, a 75% prorated refund is automatically generated, and the seats are instantly released back to the general pool."*

#### Phase 5: Administrator Portal & Collision-Free Scheduling (2:20 - 3:00)
> *"Finally, logging in as Administrator at `/admin`, we have live operational KPIs showing real-time revenue and auditorium occupancy. In the show scheduler, our engine automatically accounts for movie runtime plus a 20-minute turnaround cleaning buffer. If an administrator attempts to double-book a screen, the system detects the mathematical overlap and prevents the collision. Thank you!"*

---

## 7. Viva Defense Q&A Quick Reference

| Question | Evaluation Answer |
| :--- | :--- |
| **Q1: How does iMovies prevent double-booking when multiple users click the same seat?** | *Atomic reservation locks on the backend. When a user clicks a seat, `POST /api/shows/:id/hold` validates that `status === 'available'`. If valid, it assigns a 5-minute hold timestamp and broadcasts `seat:held` via Socket.IO. Any simultaneous attempt receives a `409 Conflict`.* |
| **Q2: Why is price calculation strictly server-side?** | *To prevent client-side price tampering. The client only transmits `{ showId, seatIds }`. The server calculates seat tier prices, 18% GST, convenience fees, and validates coupon codes.* |
| **Q3: How does the show scheduling collision engine work?** | *The engine takes `movie.durationMinutes + 20` minutes buffer and validates against all existing shows on the same screen using `(newStart < existingEnd && existingStart < newEnd)`. Overlapping slots are rejected with `409 Conflict`.* |
| **Q4: How does the system clean up abandoned seat holds?** | *A background reaper daemon runs every 30 seconds, queries expired holds (`heldUntil < now`), sets status back to `'available'`, and emits `seat:released` via Socket.IO.* |

---
*Documentation compiled for repository `montukhatri7898-dev/Project: iMovies`.*
