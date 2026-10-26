/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { AuthModal } from './components/AuthModal.js';
import { HomePage } from './pages/HomePage.js';
import { MoviesPage } from './pages/MoviesPage.js';
import { MovieDetailsPage } from './pages/MovieDetailsPage.js';
import { CinemasPage } from './pages/CinemasPage.js';
import { SeatSelectionPage } from './pages/SeatSelectionPage.js';
import { CheckoutPage } from './pages/CheckoutPage.js';
import { BookingConfirmationPage } from './pages/BookingConfirmationPage.js';
import { MyBookingsPage } from './pages/MyBookingsPage.js';
import { AdminPage } from './pages/AdminPage.js';

export function AppContent() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParams, setViewParams] = useState<any>({});

  // Sync hash routing if desired
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        const [view, queryStr] = hash.split('?');
        const params: Record<string, string> = {};
        if (queryStr) {
          new URLSearchParams(queryStr).forEach((val, key) => {
            params[key] = val;
          });
        }
        setCurrentView(view || 'home');
        setViewParams(params);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (view: string, params: any = {}) => {
    setCurrentView(view);
    setViewParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update hash
    const query = new URLSearchParams(params).toString();
    window.location.hash = query ? `${view}?${query}` : view;
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#F3F4F6] flex flex-col font-sans selection:bg-red-500 selection:text-white">
      <Navbar currentView={currentView} onNavigate={navigate} />

      <main className="flex-1">
        {currentView === 'home' && <HomePage onNavigate={navigate} />}
        {currentView === 'movies' && <MoviesPage onNavigate={navigate} />}
        {currentView === 'movie-details' && (
          <MovieDetailsPage movieId={viewParams.movieId} onNavigate={navigate} />
        )}
        {currentView === 'cinemas' && <CinemasPage onNavigate={navigate} />}
        {currentView === 'seat-selection' && (
          <SeatSelectionPage showId={viewParams.showId} onNavigate={navigate} />
        )}
        {currentView === 'checkout' && (
          <CheckoutPage bookingId={viewParams.bookingId} onNavigate={navigate} />
        )}
        {currentView === 'booking-confirmation' && (
          <BookingConfirmationPage bookingId={viewParams.bookingId} onNavigate={navigate} />
        )}
        {currentView === 'my-bookings' && <MyBookingsPage onNavigate={navigate} />}
        {currentView === 'admin' && <AdminPage onNavigate={navigate} />}
      </main>

      <Footer onNavigate={navigate} />
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
