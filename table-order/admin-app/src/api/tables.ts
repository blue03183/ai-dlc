import apiClient from './client';
import type { Table, CreateTableRequest, OrderHistory } from '@/types';

export const tablesApi = {
  getAll: (storeId: number) =>
    apiClient.get<Table[]>(`/stores/${storeId}/tables`),

  create: (storeId: number, data: CreateTableRequest) =>
    apiClient.post<Table>(`/stores/${storeId}/tables`, data),

  complete: (storeId: number, tableId: number) =>
    apiClient.post(`/stores/${storeId}/tables/${tableId}/complete`),

  getOrderHistory: (storeId: number, tableId: number, startDate?: string, endDate?: string) => {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return apiClient.get<OrderHistory[]>(
      `/stores/${storeId}/tables/${tableId}/orders/history`,
      { params },
    );
  },
};
