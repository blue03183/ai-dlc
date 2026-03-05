// US-401: 주문 확정 화면
import { screen, fireEvent, waitFor } from '@testing-library/react';
import CartPage from '@/pages/CartPage';
import { renderWithProviders, clearLocalStorage } from '@/test/helpers';
import type { AuthInfo } from '@/types';

const mockAuth: AuthInfo = {
  token: 'test-token', storeId: 1, tableId: 1, tableNumber: 1, storeName: 'Test Store',
};

beforeEach(() => {
  clearLocalStorage();
  localStorage.setItem('auth', JSON.stringify(mockAuth));
  localStorage.setItem('token', mockAuth.token);
});

describe('US-401: CartPage — 주문 확정', () => {
  it('장바구니가 비어있으면 빈 상태 메시지가 표시된다', () => {
    renderWithProviders(<CartPage />);
    expect(screen.getByText('장바구니가 비어있습니다.')).toBeInTheDocument();
    expect(screen.getByText('메뉴 보러가기')).toBeInTheDocument();
  });

  it('장바구니에 항목이 있으면 목록이 표시된다', () => {
    localStorage.setItem('cartItems', JSON.stringify([
      { menuId: 1, menuName: '김치찌개', unitPrice: 8000, quantity: 2, imageUrl: null },
    ]));
    renderWithProviders(<CartPage />);
    expect(screen.getByText('김치찌개')).toBeInTheDocument();
    expect(screen.getByText('8,000원')).toBeInTheDocument();
  });

  it('주문하기 버튼이 표시된다', () => {
    localStorage.setItem('cartItems', JSON.stringify([
      { menuId: 1, menuName: '김치찌개', unitPrice: 8000, quantity: 1, imageUrl: null },
    ]));
    renderWithProviders(<CartPage />);
    expect(screen.getByText('주문하기 (1건)')).toBeInTheDocument();
  });

  it('주문 성공 시 주문 완료 화면이 표시된다', async () => {
    localStorage.setItem('cartItems', JSON.stringify([
      { menuId: 1, menuName: '김치찌개', unitPrice: 8000, quantity: 1, imageUrl: null },
    ]));
    renderWithProviders(<CartPage />);
    fireEvent.click(screen.getByText('주문하기 (1건)'));

    await waitFor(() => {
      expect(screen.getByText('주문이 완료되었습니다')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('주문 성공 후 장바구니가 비워진다', async () => {
    localStorage.setItem('cartItems', JSON.stringify([
      { menuId: 1, menuName: '김치찌개', unitPrice: 8000, quantity: 1, imageUrl: null },
    ]));
    renderWithProviders(<CartPage />);
    fireEvent.click(screen.getByText('주문하기 (1건)'));

    await waitFor(() => {
      expect(screen.getByText('주문이 완료되었습니다')).toBeInTheDocument();
    }, { timeout: 3000 });

    const stored = JSON.parse(localStorage.getItem('cartItems') || '[]');
    expect(stored).toHaveLength(0);
  });

  it('비우기 버튼으로 장바구니를 비울 수 있다', () => {
    localStorage.setItem('cartItems', JSON.stringify([
      { menuId: 1, menuName: '김치찌개', unitPrice: 8000, quantity: 1, imageUrl: null },
    ]));
    renderWithProviders(<CartPage />);
    fireEvent.click(screen.getByText('비우기'));
    expect(screen.getByText('장바구니가 비어있습니다.')).toBeInTheDocument();
  });
});
