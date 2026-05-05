'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authStorage, type CurrentUser, type UserRole } from '@/lib/auth';
import { authApi } from '@/lib/api/auth';

interface AuthContextValue {
  user: CurrentUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const token = authStorage.getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      const cached = authStorage.getUser();
      if (cached) {
        setUser(cached);
        setLoading(false);
        return;
      }
      try {
        const me = await authApi.me();
        const u: CurrentUser = { id: me.id, email: me.email, role: me.role as UserRole, language: me.language };
        authStorage.setUser(u);
        setUser(u);
      } catch {
        authStorage.clear();
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token } = await authApi.login({ email, password });
    authStorage.setToken(token);
    const me = await authApi.me();
    const u: CurrentUser = { id: me.id, email: me.email, role: me.role as UserRole, language: me.language };
    authStorage.setUser(u);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    authStorage.clear();
    setUser(null);
    router.push('/login');
  }, [router]);

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}

