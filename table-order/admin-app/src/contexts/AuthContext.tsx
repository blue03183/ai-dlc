import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { AdminInfo, LoginResponse } from '@/types';

interface AuthContextType {
  token: string | null;
  admin: AdminInfo | null;
  storeId: number | null;
  isAuthenticated: boolean;
  login: (data: LoginResponse) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  admin: null,
  storeId: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [admin, setAdmin] = useState<AdminInfo | null>(() => {
    const stored = localStorage.getItem('adminInfo');
    if (stored) {
      try { return JSON.parse(stored); } catch { return null; }
    }
    return null;
  });

  const isAuthenticated = !!token && !!admin;
  const storeId = admin?.storeId ?? null;

  const login = useCallback((data: LoginResponse) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('adminInfo', JSON.stringify(data.admin));
    setToken(data.token);
    setAdmin(data.admin);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminInfo');
    setToken(null);
    setAdmin(null);
  }, []);

  // JWT 만료 체크 (16시간)
  useEffect(() => {
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expMs = payload.exp * 1000;
      const remaining = expMs - Date.now();
      if (remaining <= 0) {
        logout();
        return;
      }
      const timer = setTimeout(logout, remaining);
      return () => clearTimeout(timer);
    } catch {
      // 토큰 파싱 실패 시 무시
    }
  }, [token, logout]);

  return (
    <AuthContext.Provider value={{ token, admin, storeId, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
