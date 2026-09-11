import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import socket from '../lib/socket';

interface User { id: string; name: string; email: string; role: 'customer' | 'driver' | 'admin'; phone?: string; address?: string; }
interface AuthContextType { user: User | null; token: string | null; login: (email: string, password: string) => Promise<void>; register: (data: RegisterData) => Promise<void>; logout: () => void; refreshUser: () => Promise<void>; isLoading: boolean; }
interface RegisterData { name: string; email: string; password: string; role: 'customer' | 'driver'; phone?: string; }

const AuthContext = createContext<AuthContextType | null>(null);

// Forces a fresh socket connection before joining rooms for `user`, so a stale connection
// from a previously logged-in account (e.g. switching demo accounts in the same tab) can't
// keep receiving that account's room broadcasts.
function connectSocketAs(user: { id: string; role: string }) {
  socket.disconnect();
  socket.connect();
  socket.emit('user:join', user.id);
  if (user.role === 'driver') socket.emit('driver:join', user.id);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initAuth = useCallback(async () => {
    const t = localStorage.getItem('drovora_token');
    if (!t) { setIsLoading(false); return; }
    try {
      setToken(t);
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      connectSocketAs(data.user);
    } catch { localStorage.removeItem('drovora_token'); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { initAuth(); }, [initAuth]);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('drovora_token', data.token);
    setToken(data.token); setUser(data.user);
    connectSocketAs(data.user);
  };

  const register = async (d: RegisterData) => {
    const { data } = await api.post('/auth/register', d);
    localStorage.setItem('drovora_token', data.token);
    setToken(data.token); setUser(data.user);
    connectSocketAs(data.user);
  };

  const logout = () => { localStorage.removeItem('drovora_token'); setToken(null); setUser(null); socket.disconnect(); };
  const refreshUser = async () => { const { data } = await api.get('/auth/me'); setUser(data.user); };

  return <AuthContext.Provider value={{ user, token, login, register, logout, refreshUser, isLoading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
