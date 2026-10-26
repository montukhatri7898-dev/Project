import React, { useState } from 'react';
import { X, Eye, EyeOff, Lock, Mail, User, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, authModalTab, closeAuthModal, login, register, quickLogin } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>(authModalTab || 'login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [preferredCity, setPreferredCity] = useState('Mumbai');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (tab === 'login') {
        await login({ email, password });
      } else {
        await register({ name, email, password, preferredCity });
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemo = async (role: 'customer' | 'admin') => {
    setError(null);
    setSubmitting(true);
    try {
      await quickLogin(role);
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#14161D] border border-white/10 rounded-xl shadow-2xl p-6 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/10 mb-6">
          <button
            onClick={() => {
              setTab('login');
              setError(null);
            }}
            className={`pb-2.5 px-4 text-sm font-medium transition-colors border-b-2 cursor-pointer ${
              tab === 'login'
                ? 'border-red-500 text-white'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setTab('register');
              setError(null);
            }}
            className={`pb-2.5 px-4 text-sm font-medium transition-colors border-b-2 cursor-pointer ${
              tab === 'register'
                ? 'border-red-500 text-white'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Quick Demo Login Box for Viva Evaluation */}
        <div className="mb-5 p-3 rounded-lg bg-white/5 border border-white/10">
          <div className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-2">
            Instant Demo Access (Viva & Evaluation)
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('customer')}
              disabled={submitting}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-red-950/40 hover:bg-red-900/50 border border-red-500/30 rounded text-xs text-red-200 font-medium transition-colors cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-red-400" />
              Demo Customer
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              disabled={submitting}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/30 rounded text-xs text-amber-200 font-medium transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              Demo Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded bg-red-950/40 border border-red-500/30 text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Verma"
                  className="w-full bg-[#0B0C10] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[#0B0C10] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full bg-[#0B0C10] border border-white/10 rounded-lg pl-9 pr-10 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {tab === 'register' && (
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Preferred City</label>
              <select
                value={preferredCity}
                onChange={(e) => setPreferredCity(e.target.value)}
                className="w-full bg-[#0B0C10] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              >
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Pune">Pune</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-colors shadow-sm cursor-pointer mt-2"
          >
            {submitting ? 'Authenticating...' : tab === 'login' ? 'Sign In to IMovies' : 'Create My Account'}
          </button>
        </form>
      </div>
    </div>
  );
};
