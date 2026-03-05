// US-402: 주문 내역 화면 / US-403: SSE 실시간 상태 업데이트
import { screen, waitFor, fireEvent } from '@testing-library/react';
import OrdersPage from '@/pages/OrdersPage';
import { renderWithProviders, clearLocalStorage } from '@/test/helpers';
import { createMockOrder } from '@/mocks/data';
import type { AuthInfo } from '@/types';

const mockAuth: AuthInfo = {
  token: 'test-token', storeId: 1, tableId: 1, tableNumber: 1, storeName: 'Test Store',
};

beforeEach(() => {
  clearLocalStorage();
  localStorage.setItem('auth', JSON.stringify(mockAuth));
  localStorage.setItem('token', mockAuth.token);
});

describe('US-402: OrdersPage — 주문 내역 조회', () => {
  it('주문이 없으면 빈 상태 메시지가 표시된다', async () => {
    renderWithProviders(<OrdersPage />);
    await waitFor(() => {
      expect(screen.getByText('주문 내역이 없습니다.')).toBeInTheDocument();
    });
  });

  it('주문이 있으면 주문 카드가 표시된다', async () => {
    // mock 주문 생성
    createMockOrder([{ menuId: 1, quantity: 2 }]);

    renderWithProviders(<OrdersPage />);
    await waitFor(() => {
      expect(screen.getByText('김치찌개 × 2 (16,000원)')).toBeInTheDocument();
      expect(screen.getByText('16,000원')).toBeInTheDocument();
      expect(screen.getByText('대기중')).toBeInTheDocument();
    });
  });

  it('새로고침 버튼이 존재한다', async () => {
    renderWithProviders(<OrdersPage />);
    await waitFor(() => {
      expect(screen.getByText('새로고침')).toBeInTheDocument();
    });
  });

  it('주문 번호가 ORD-YYYYMMDD-NNNN 형식이다', async () => {
    createMockOrder([{ menuId: 9, quantity: 1 }]);

    renderWithProviders(<OrdersPage />);
    await waitFor(() => {
      const orderNumbers = screen.getAllByText(/^ORD-\d{8}-\d{4}$/);
      expect(orderNumbers.length).toBeGreaterThan(0);
    });
  });
});

describe('US-403: OrdersPage — SSE 실시간 상태', () => {
  it('SSE 연결 상태 표시가 존재한다', async () => {
    renderWithProviders(<OrdersPage />);
    await waitFor(() => {
      expect(screen.getByLabelText(/연결/)).toBeInTheDocument();
    });
  });
});
