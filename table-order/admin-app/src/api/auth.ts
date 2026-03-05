import apiClient from './client';
import type { LoginRequest, LoginResponse } from '@/types';

const mockLogin = (data: LoginRequest): Promise<{ data: LoginResponse }> =>
  new Promise((resolve) =>
    setTimeout(() => {
      resolve({
        data: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
            btoa(JSON.stringify({ sub: 1, role: 'OWNER', storeId: 1, exp: Math.floor(Date.now() / 1000) + 57600 })) +
            '.mock-signature',
          admin: {
            id: 1,
            username: data.username || 'admin',
            role: 'OWNER',
            storeName: data.storeIdentifier || 'Mock 매장',
            storeId: 1,
          },
        },
      });
    }, 300),
  );

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<LoginResponse>('/auth/admin/login', data).catch(() => mockLogin(data)),
};
