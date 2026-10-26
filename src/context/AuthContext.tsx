import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.js';
import { api } from '../api/client.js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { name: string; email: string; password: string; preferredCity?: string }) => Promise<void>;
  logout: () => Promise<void>;
  quickLogin: (role: 'customer' | 'admin') => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCityState] = useState<string>(() => {
    return localStorage.getItem('imovies_city') || 'Mumbai';
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  const setSelectedCity = (city: string) => {
    setSelectedCityState(city);
    localStorage.setItem('imovies_city', city);
  };

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      if (res.success && res.user) {
        setUser(res.user);
        if (res.user.preferredCity) {
          setSelectedCity(res.user.preferredCity);
        }
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const openAuthModal = (tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (credentials: { email: string; password: string }) => {
    const res = await api.login(credentials);
    if (res.success) {
      setUser(res.user);
      if (res.user.preferredCity) {
        setSelectedCity(res.user.preferredCity);
      }
      setIsAuthModalOpen(false);
    }
  };

  const register = async (data: { name: string; email: string; password: string; preferredCity?: string }) => {
    const res = await api.register(data);
    if (res.success) {
      setUser(res.user);
      if (res.user.preferredCity) {
        setSelectedCity(res.user.preferredCity);
      }
      setIsAuthModalOpen(false);
    }
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  // Instant 1-click login for evaluation/demo
  const quickLogin = async (role: 'customer' | 'admin') => {
    if (role === 'admin') {
      await login({ email: 'admin@imovies.com', password: 'admin123' });
    } else {
      await login({ email: 'customer@imovies.com', password: 'customer123' });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        selectedCity,
        setSelectedCity,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        quickLogin,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
