// US-201: 카테고리별 메뉴 화면 / US-202: 메뉴 상세 모달
import { screen, waitFor, fireEvent } from '@testing-library/react';
import MenuPage from '@/pages/MenuPage';
import { renderWithProviders, clearLocalStorage } from '@/test/helpers';
import type { AuthInfo } from '@/types';

const mockAuth: AuthInfo = {
  token: 'test-token',
  storeId: 1,
  tableId: 1,
  tableNumber: 1,
  storeName: 'Test Store',
};

beforeEach(() => {
  clearLocalStorage();
  localStorage.setItem('auth', JSON.stringify(mockAuth));
  localStorage.setItem('token', mockAuth.token);
});

describe('US-201: MenuPage — 카테고리별 메뉴 조회', () => {
  it('카테고리 탭이 렌더링된다', async () => {
    renderWithProviders(<MenuPage />);
    await waitFor(() => {
      expect(screen.getByText('추천 메뉴')).toBeInTheDocument();
      expect(screen.getByText('식사')).toBeInTheDocument();
      expect(screen.getByText('사이드')).toBeInTheDocument();
      expect(screen.getByText('음료')).toBeInTheDocument();
    });
  });

  it('메뉴 카드가 렌더링된다', async () => {
    renderWithProviders(<MenuPage />);
    await waitFor(() => {
      expect(screen.getByText('김치찌개')).toBeInTheDocument();
      expect(screen.getByText('된장찌개')).toBeInTheDocument();
    });
  });

  it('카테고리 탭 클릭 시 해당 카테고리 메뉴만 표시된다', async () => {
    renderWithProviders(<MenuPage />);
    await waitFor(() => expect(screen.getByText('음료')).toBeInTheDocument());

    fireEvent.click(screen.getByText('음료'));
    await waitFor(() => {
      expect(screen.getByText('콜라')).toBeInTheDocument();
      expect(screen.getByText('맥주')).toBeInTheDocument();
      expect(screen.queryByText('김치찌개')).not.toBeInTheDocument();
    });
  });

  it('메뉴 가격이 표시된다', async () => {
    renderWithProviders(<MenuPage />);
    await waitFor(() => {
      const prices = screen.getAllByText('8,000원');
      expect(prices.length).toBeGreaterThanOrEqual(1);
    });
  });
});

describe('US-202: MenuPage — 메뉴 상세 모달', () => {
  it('메뉴 카드 클릭 시 상세 모달이 열린다', async () => {
    renderWithProviders(<MenuPage />);
    await waitFor(() => expect(screen.getByText('김치찌개')).toBeInTheDocument());

    fireEvent.click(screen.getByLabelText('김치찌개 8,000원'));
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('돼지고기와 잘 익은 김치로 끓인 얼큰한 김치찌개')).toBeInTheDocument();
    });
  });

  it('모달에서 수량 조절이 가능하다', async () => {
    renderWithProviders(<MenuPage />);
    await waitFor(() => expect(screen.getByText('김치찌개')).toBeInTheDocument());

    fireEvent.click(screen.getByLabelText('김치찌개 8,000원'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());

    fireEvent.click(screen.getByLabelText('수량 증가'));
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('장바구니 담기 (16,000원)')).toBeInTheDocument();
  });

  it('닫기 버튼으로 모달이 닫힌다', async () => {
    renderWithProviders(<MenuPage />);
    await waitFor(() => expect(screen.getByText('김치찌개')).toBeInTheDocument());

    fireEvent.click(screen.getByLabelText('김치찌개 8,000원'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());

    fireEvent.click(screen.getByText('닫기'));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
