import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export interface User {
  userId: number;
  name: string;
  username: string;
  email: string;
  collegeId: number;
  collegeName?: string;
  role: 'STUDENT' | 'EVENT_ORGANIZER' | 'PLATFORM_ADMIN' | 'COLLEGE_ADMIN';
  department?: string;
  year?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  colleges: any[];
  login: (username: string, passwordPlain: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('eventbridge_token'));
  const [loading, setLoading] = useState<boolean>(true);
  const [colleges, setColleges] = useState<any[]>([]);

  const loadColleges = async () => {
    try {
      const res = await api.getColleges();
      if (res.success) setColleges(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const refreshUser = async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await api.getCurrentUser();
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        logout();
      }
    } catch (err) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadColleges();
    refreshUser();
  }, [token]);

  const login = async (username: string, passwordPlain: string) => {
    const res = await api.login({ username, password: passwordPlain });
    if (res.success) {
      localStorage.setItem('eventbridge_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    } else {
      throw new Error(res.message);
    }
  };

  const logout = () => {
    localStorage.removeItem('eventbridge_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, colleges, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
