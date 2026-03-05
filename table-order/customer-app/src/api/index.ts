// 모든 백엔드 API 구현 완료 → 실제 API 사용
import apiClient from './client';
import type {
  Category, Menu, Order,
  TableLoginRequest, TableLoginResponse,
  CreateOrderRequest, CreateOrderResponse,
} from '@/types';

export const authApi = {
  tableLogin: async (data: TableLoginRequest): Promise<TableLoginResponse> => {
    const res = await apiClient.post<TableLoginResponse>('/auth/table/login', data);
    return res.data;
  },
};

export const menuApi = {
  getCategories: async (storeId: number): Promise<Category[]> => {
    const res = await apiClient.get<Category[]>(`/stores/${storeId}/categories`);
    return res.data;
  },
  getMenus: async (storeId: number): Promise<Menu[]> => {
    const res = await apiClient.get<Menu[]>(`/stores/${storeId}/menus`);
    return res.data;
  },
};

export const orderApi = {
  create: async (storeId: number, data: CreateOrderRequest): Promise<CreateOrderResponse> => {
    const res = await apiClient.post<CreateOrderResponse>(`/stores/${storeId}/orders`, data);
    return res.data;
  },
  getByTable: async (storeId: number, tableId: number): Promise<Order[]> => {
    const res = await apiClient.get<Order[]>(`/stores/${storeId}/tables/${tableId}/orders`);
    return res.data;
  },
};
