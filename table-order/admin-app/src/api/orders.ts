import apiClient from './client';
import type { Order, UpdateOrderStatusRequest } from '@/types';

export const ordersApi = {
  getAll: (storeId: number) =>
    apiClient.get<Order[]>(`/stores/${storeId}/orders`),

  updateStatus: (storeId: number, orderId: number, data: UpdateOrderStatusRequest) =>
    apiClient.put<Order>(`/stores/${storeId}/orders/${orderId}/status`, data),

  delete: (storeId: number, orderId: number) =>
    apiClient.delete(`/stores/${storeId}/orders/${orderId}`),
};
