import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { AuthInfo, TableLoginRequest } from '@/types';
import { authApi } from '@/api';

interface AuthContextType {
  auth: AuthInfo | null;
  loading: boolean;
  login: (data: TableLoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // 저장된 인증 정보 복원
  useEffect(() => {
    const stored = localStorage.getItem('auth');
    if (stored) {
      try { setAuth(JSON.parse(stored)); } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  // 자동 로그인 시도
  useEffect(() => {
    if (auth || loading) return;
    const creds = localStorage.getItem('loginCredentials');
    if (!creds) return;
    try {
      const data: TableLoginRequest = JSON.parse(creds);
      authApi.tableLogin(data).then((res) => {
        const info: AuthInfo = {
          token: res.token,
          storeId: 1, // TODO: 실제 API에서는 JWT/응답에서 추출
          tableId: res.table.id,
          tableNumber: res.table.tableNumber,
          storeName: res.table.storeName,
        };
        localStorage.setItem('token', res.token);
        localStorage.setItem('auth', JSON.stringify(info));
        setAuth(info);
      }).catch(() => {
        localStorage.removeItem('loginCredentials');
        localStorage.removeItem('auth');
        localStorage.removeItem('token');
      });
    } catch { /* ignore */ }
  }, [auth, loading]);

  const login = useCallback(async (data: TableLoginRequest) => {
    const res = await authApi.tableLogin(data);
    const info: AuthInfo = {
      token: res.token,
      storeId: 1,
      tableId: res.table.id,
      tableNumber: res.table.tableNumber,
      storeName: res.table.storeName,
    };
    localStorage.setItem('token', res.token);
    localStorage.setItem('auth', JSON.stringify(info));
    localStorage.setItem('loginCredentials', JSON.stringify(data));
    setAuth(info);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('auth');
    localStorage.removeItem('loginCredentials');
    localStorage.removeItem('cartItems');
    setAuth(null);
  }, []);

  return (
    <AuthContext.Provider value={{ auth, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
