// Mock 모드: 백엔드 없이 로컬 mock 데이터로 동작
// 백엔드 완성 후 USE_MOCK = false 로 전환
const USE_MOCK = true;

import apiClient from './client';
import { mockCategories, mockMenus, getMockOrders, createMockOrder } from '@/mocks/data';
import type {
  Category, Menu, Order,
  TableLoginRequest, TableLoginResponse,
  CreateOrderRequest, CreateOrderResponse,
} from '@/types';

const delay = (ms = 300) => new Promise<void>((r) => setTimeout(r, ms));

export const authApi = {
  tableLogin: async (data: TableLoginRequest): Promise<TableLoginResponse> => {
    if (USE_MOCK) {
      await delay(400);
      return {
        token: 'mock-jwt-' + Date.now(),
        table: { id: data.tableNumber, tableNumber: data.tableNumber, storeName: data.storeIdentifier },
        session: { id: 1, status: 'ACTIVE' },
      };
    }
    const res = await apiClient.post<TableLoginResponse>('/auth/table/login', data);
    return res.data;
  },
};

export const menuApi = {
  getCategories: async (storeId: number): Promise<Category[]> => {
    if (USE_MOCK) { await delay(); return mockCategories; }
    const res = await apiClient.get<Category[]>(`/stores/${storeId}/categories`);
    return res.data;
  },
  getMenus: async (storeId: number): Promise<Menu[]> => {
    if (USE_MOCK) { await delay(); return mockMenus; }
    const res = await apiClient.get<Menu[]>(`/stores/${storeId}/menus`);
    return res.data;
  },
};

export const orderApi = {
  create: async (storeId: number, data: CreateOrderRequest): Promise<CreateOrderResponse> => {
    if (USE_MOCK) {
      await delay(500);
      const order = createMockOrder(data.items);
      return { id: order.id, orderNumber: order.orderNumber, items: order.items, totalAmount: order.totalAmount, status: order.status, createdAt: order.createdAt };
    }
    const res = await apiClient.post<CreateOrderResponse>(`/stores/${storeId}/orders`, data);
    return res.data;
  },
  getByTable: async (storeId: number, tableId: number): Promise<Order[]> => {
    if (USE_MOCK) { await delay(); return getMockOrders(); }
    const res = await apiClient.get<Order[]>(`/stores/${storeId}/tables/${tableId}/orders`);
    return res.data;
  },
};
