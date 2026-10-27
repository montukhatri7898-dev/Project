import React, { useState, useEffect } from 'react';
import { Film, MapPin, Bell, User as UserIcon, LogOut, ShieldCheck, Ticket, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../api/client.js';
import { NotificationItem } from '../types/index.js';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { user, selectedCity, setSelectedCity, openAuthModal, logout, quickLogin } = useAuth();
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Pune'];

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 15000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const res = await api.getNotifications();
      if (res.success) {
        setNotifications(res.data);
        setUnreadCount(res.meta.unreadCount);
      }
    } catch (e) {
      // quiet fail
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      // quiet fail
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0B0C10]/95 backdrop-blur-md border-b border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none"
          >
            <div className="w-9 h-9 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 group-hover:bg-red-600 group-hover:text-white transition-all shadow-sm">
              <Film className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5 font-sans">
                I<span className="text-red-500">Movies</span>
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (single-line, clean unboxed typography) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-300">
          <button
            onClick={() => onNavigate('home')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white cursor-pointer ${
              currentView === 'home' ? 'text-red-500 font-semibold' : ''
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('movies')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white cursor-pointer ${
              currentView === 'movies' ? 'text-red-500 font-semibold' : ''
            }`}
          >
            Movies
          </button>
          <button
            onClick={() => onNavigate('cinemas')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white cursor-pointer ${
              currentView === 'cinemas' ? 'text-red-500 font-semibold' : ''
            }`}
          >
            Cinemas
          </button>
          <button
            onClick={() => {
              if (!user) openAuthModal('login');
              else onNavigate('my-bookings');
            }}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white cursor-pointer flex items-center gap-1.5 ${
              currentView === 'my-bookings' ? 'text-red-500 font-semibold' : ''
            }`}
          >
            <Ticket className="w-4 h-4" />
            My Bookings
          </button>
          <button
            onClick={() => onNavigate('docs')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white cursor-pointer flex items-center gap-1.5 ${
              currentView === 'docs' ? 'text-red-500 font-semibold' : ''
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Project Docs
          </button>
          {user?.role === 'admin' && (
            <button
              onClick={() => onNavigate('admin')}
              className={`whitespace-nowrap shrink-0 transition-colors flex items-center gap-1 cursor-pointer ${
                currentView === 'admin' ? 'text-red-400 font-semibold' : 'text-amber-400/90 hover:text-amber-300'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Admin Portal
            </button>
          )}
        </nav>

        {/* Zone 3: 1 Primary Area (City Selector + Notification + User Auth) */}
        <div className="flex items-center gap-3 shrink-0">
          {/* City Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setCityDropdownOpen(!cityDropdownOpen);
                setUserMenuOpen(false);
                setNotificationsOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-300 bg-white/5 hover:bg-white/10 rounded-md border border-white/10 transition-colors cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              <span className="whitespace-nowrap">{selectedCity}</span>
            </button>

            {cityDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-[#14161D] border border-white/10 rounded-lg shadow-2xl py-1 z-50">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider border-b border-white/5">
                  Select City
                </div>
                {CITIES.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setSelectedCity(city);
                      setCityDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors hover:bg-white/5 flex items-center justify-between ${
                      selectedCity === city ? 'text-red-400 font-medium bg-red-500/10' : 'text-gray-300'
                    }`}
                  >
                    <span>{city}</span>
                    {selectedCity === city && <span className="text-red-500">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Notifications (if logged in) */}
          {user && (
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setUserMenuOpen(false);
                  setCityDropdownOpen(false);
                }}
                className="relative p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                title="Booking Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#0B0C10]" />
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[#14161D] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50">
                  <div className="p-3 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <span className="text-xs font-semibold text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-red-400 hover:text-red-300 transition-colors"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-gray-500">No recent notifications</div>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div
                          key={n._id}
                          className={`p-3 text-xs transition-colors ${
                            n.read ? 'text-gray-400 bg-transparent' : 'text-gray-200 bg-red-950/20'
                          }`}
                        >
                          <div className="font-medium text-white mb-0.5">{n.title}</div>
                          <p className="text-[11px] leading-relaxed text-gray-400">{n.message}</p>
                          <span className="text-[10px] text-gray-500 mt-1 block">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Account / Sign In */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => {
                  setUserMenuOpen(!userMenuOpen);
                  setCityDropdownOpen(false);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-2 pl-2 pr-3 py-1 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center">
                  {user.name.charAt(0)}
                </div>
                <span className="text-xs font-medium text-gray-200 max-w-[100px] truncate hidden sm:inline">
                  {user.name.split(' ')[0]}
                </span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-[#14161D] border border-white/10 rounded-lg shadow-2xl py-1 z-50">
                  <div className="px-3 py-2 border-b border-white/5">
                    <p className="text-xs font-medium text-white truncate">{user.name}</p>
                    <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                    <span className="text-[10px] text-red-400 uppercase tracking-wider font-semibold">
                      {user.role}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      onNavigate('my-bookings');
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-white/5 flex items-center gap-2"
                  >
                    <Ticket className="w-3.5 h-3.5 text-gray-400" />
                    My Bookings
                  </button>
                  {user.role === 'admin' && (
                    <button
                      onClick={() => {
                        onNavigate('admin');
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-amber-400 hover:bg-white/5 flex items-center gap-2"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Admin Dashboard
                    </button>
                  )}
                  <div className="border-t border-white/5 my-1" />
                  <button
                    onClick={() => {
                      logout();
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-white/5 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal('login')}
                className="px-4 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors cursor-pointer shadow-sm whitespace-nowrap"
              >
                Sign In
              </button>
              {/* Quick Demo Switcher for Examiner */}
              <button
                onClick={() => quickLogin('customer')}
                className="hidden lg:inline-flex px-2 py-1 text-[11px] font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-colors"
                title="Instant Demo Customer Login"
              >
                Demo Login
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
