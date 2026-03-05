import apiClient from './client';
import type { Category, CreateCategoryRequest } from '@/types';

export const categoriesApi = {
  getAll: (storeId: number) =>
    apiClient.get<Category[]>(`/stores/${storeId}/categories`),

  create: (storeId: number, data: CreateCategoryRequest) =>
    apiClient.post<Category>(`/stores/${storeId}/categories`, data),

  update: (storeId: number, categoryId: number, data: CreateCategoryRequest) =>
    apiClient.put<Category>(`/stores/${storeId}/categories/${categoryId}`, data),

  delete: (storeId: number, categoryId: number) =>
    apiClient.delete(`/stores/${storeId}/categories/${categoryId}`),
};
