import apiClient from './client';
import type { Menu, CreateMenuRequest, UpdateMenuRequest, ReorderMenuRequest } from '@/types';

export const menusApi = {
  getAll: (storeId: number, categoryId?: number) => {
    const params: Record<string, number> = {};
    if (categoryId) params.categoryId = categoryId;
    return apiClient.get<Menu[]>(`/stores/${storeId}/menus`, { params });
  },

  create: (storeId: number, data: CreateMenuRequest) =>
    apiClient.post<Menu>(`/stores/${storeId}/menus`, data),

  update: (storeId: number, menuId: number, data: UpdateMenuRequest) =>
    apiClient.put<Menu>(`/stores/${storeId}/menus/${menuId}`, data),

  delete: (storeId: number, menuId: number) =>
    apiClient.delete(`/stores/${storeId}/menus/${menuId}`),

  reorder: (storeId: number, data: ReorderMenuRequest[]) =>
    apiClient.put(`/stores/${storeId}/menus/reorder`, data),
};
