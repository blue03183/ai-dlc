// US-301: 장바구니 추가 / US-302: 수량/삭제 / US-303: 로컬 저장
import { screen, fireEvent, act } from '@testing-library/react';
import { renderWithCart, clearLocalStorage } from '@/test/helpers';
import { useCart } from '@/contexts/CartContext';

// 장바구니 상태를 표시하는 테스트용 컴포넌트
function CartTestUI() {
  const { items, totalAmount, totalCount, addItem, removeItem, updateQuantity, clearCart } = useCart();
  return (
    <div>
      <div data-testid="count">{totalCount}</div>
      <div data-testid="amount">{totalAmount}</div>
      <div data-testid="items">{JSON.stringify(items)}</div>
      <button onClick={() => addItem({ menuId: 1, menuName: '김치찌개', unitPrice: 8000, imageUrl: null })}>add-1</button>
      <button onClick={() => addItem({ menuId: 2, menuName: '된장찌개', unitPrice: 8000, imageUrl: null }, 3)}>add-2-qty3</button>
      <button onClick={() => removeItem(1)}>remove-1</button>
      <button onClick={() => updateQuantity(1, 5)}>qty-1-to-5</button>
      <button onClick={() => updateQuantity(1, 0)}>qty-1-to-0</button>
      <button onClick={() => clearCart()}>clear</button>
    </div>
  );
}

beforeEach(() => clearLocalStorage());

describe('US-301: 장바구니 추가', () => {
  it('메뉴를 장바구니에 추가할 수 있다', () => {
    renderWithCart(<CartTestUI />);
    fireEvent.click(screen.getByText('add-1'));
    expect(screen.getByTestId('count').textContent).toBe('1');
    expect(screen.getByTestId('amount').textContent).toBe('8000');
  });

  it('같은 메뉴를 추가하면 수량이 증가한다', () => {
    renderWithCart(<CartTestUI />);
    fireEvent.click(screen.getByText('add-1'));
    fireEvent.click(screen.getByText('add-1'));
    expect(screen.getByTestId('count').textContent).toBe('2');
    expect(screen.getByTestId('amount').textContent).toBe('16000');
  });

  it('수량을 지정하여 추가할 수 있다', () => {
    renderWithCart(<CartTestUI />);
    fireEvent.click(screen.getByText('add-2-qty3'));
    expect(screen.getByTestId('count').textContent).toBe('3');
    expect(screen.getByTestId('amount').textContent).toBe('24000');
  });
});

describe('US-302: 장바구니 수량/삭제', () => {
  it('수량을 변경할 수 있다', () => {
    renderWithCart(<CartTestUI />);
    fireEvent.click(screen.getByText('add-1'));
    fireEvent.click(screen.getByText('qty-1-to-5'));
    expect(screen.getByTestId('count').textContent).toBe('5');
    expect(screen.getByTestId('amount').textContent).toBe('40000');
  });

  it('수량을 0으로 설정하면 항목이 삭제된다', () => {
    renderWithCart(<CartTestUI />);
    fireEvent.click(screen.getByText('add-1'));
    fireEvent.click(screen.getByText('qty-1-to-0'));
    expect(screen.getByTestId('count').textContent).toBe('0');
  });

  it('항목을 삭제할 수 있다', () => {
    renderWithCart(<CartTestUI />);
    fireEvent.click(screen.getByText('add-1'));
    fireEvent.click(screen.getByText('add-2-qty3'));
    fireEvent.click(screen.getByText('remove-1'));
    expect(screen.getByTestId('count').textContent).toBe('3');
  });

  it('장바구니를 비울 수 있다', () => {
    renderWithCart(<CartTestUI />);
    fireEvent.click(screen.getByText('add-1'));
    fireEvent.click(screen.getByText('add-2-qty3'));
    fireEvent.click(screen.getByText('clear'));
    expect(screen.getByTestId('count').textContent).toBe('0');
    expect(screen.getByTestId('amount').textContent).toBe('0');
  });
});

describe('US-303: 장바구니 로컬 저장', () => {
  it('장바구니 변경 시 localStorage에 저장된다', () => {
    renderWithCart(<CartTestUI />);
    fireEvent.click(screen.getByText('add-1'));
    const stored = JSON.parse(localStorage.getItem('cartItems') || '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].menuId).toBe(1);
    expect(stored[0].quantity).toBe(1);
  });

  it('localStorage에 저장된 장바구니가 복원된다', () => {
    localStorage.setItem('cartItems', JSON.stringify([
      { menuId: 99, menuName: '테스트메뉴', unitPrice: 5000, quantity: 2, imageUrl: null },
    ]));
    renderWithCart(<CartTestUI />);
    expect(screen.getByTestId('count').textContent).toBe('2');
    expect(screen.getByTestId('amount').textContent).toBe('10000');
  });

  it('비우기 후 localStorage도 비워진다', () => {
    renderWithCart(<CartTestUI />);
    fireEvent.click(screen.getByText('add-1'));
    fireEvent.click(screen.getByText('clear'));
    const stored = JSON.parse(localStorage.getItem('cartItems') || '[]');
    expect(stored).toHaveLength(0);
  });
});
