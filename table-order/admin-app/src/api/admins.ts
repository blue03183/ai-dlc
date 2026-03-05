import apiClient from './client';
import type { Admin, CreateAdminRequest } from '@/types';

export const adminsApi = {
  getAll: (storeId: number) =>
    apiClient.get<Admin[]>(`/stores/${storeId}/admins`),

  create: (storeId: number, data: CreateAdminRequest) =>
    apiClient.post<Admin>(`/stores/${storeId}/admins`, data),
};
