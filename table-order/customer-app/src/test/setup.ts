import '@testing-library/jest-dom';
import { vi, beforeEach } from 'vitest';
import { mockCategories, mockMenus, getMockOrders, createMockOrder, resetMockOrders } from '@/mocks/data';

// 각 테스트 전에 mock 주문 데이터 초기화
beforeEach(() => {
  resetMockOrders();
});

// API 모듈 mock — 테스트에서는 mock 데이터 사용
vi.mock('@/api', () => ({
  authApi: {
    tableLogin: vi.fn().mockResolvedValue({
      token: 'mock-token',
      table: { id: 1, tableNumber: 1, storeName: 'Test Store', storeId: 1 },
      session: { id: 1, status: 'ACTIVE' },
    }),
  },
  menuApi: {
    getCategories: vi.fn().mockResolvedValue(mockCategories),
    getMenus: vi.fn().mockResolvedValue(mockMenus),
  },
  orderApi: {
    create: vi.fn().mockImplementation((_storeId: number, data: { tableId: number; items: { menuId: number; quantity: number }[] }) => {
      const order = createMockOrder(data.items);
      return Promise.resolve(order);
    }),
    getByTable: vi.fn().mockImplementation(() => {
      return Promise.resolve(getMockOrders());
    }),
  },
}));

// SSE mock — EventSource는 테스트 환경에서 사용 불가
vi.mock('@/hooks/useSSE', () => ({
  useSSE: () => ({
    connected: false,
    subscribe: () => () => {},
  }),
}));
