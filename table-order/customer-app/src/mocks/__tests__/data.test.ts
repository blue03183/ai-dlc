import { mockCategories, mockMenus, createMockOrder, getMockOrders } from '@/mocks/data';

describe('Mock Data', () => {
  it('카테고리가 4개 존재한다', () => {
    expect(mockCategories).toHaveLength(4);
  });

  it('메뉴가 12개 존재한다', () => {
    expect(mockMenus).toHaveLength(12);
  });

  it('모든 메뉴가 isAvailable=true이다', () => {
    expect(mockMenus.every((m) => m.isAvailable)).toBe(true);
  });

  it('주문을 생성하면 올바른 형식의 주문이 반환된다', () => {
    const order = createMockOrder([{ menuId: 1, quantity: 2 }, { menuId: 9, quantity: 1 }]);
    expect(order.orderNumber).toMatch(/^ORD-\d{8}-\d{4}$/);
    expect(order.status).toBe('PENDING');
    expect(order.items).toHaveLength(2);
    expect(order.totalAmount).toBe(8000 * 2 + 2000 * 1);
  });

  it('getMockOrders는 최신순으로 정렬된다', () => {
    createMockOrder([{ menuId: 1, quantity: 1 }]);
    createMockOrder([{ menuId: 2, quantity: 1 }]);
    const orders = getMockOrders();
    expect(orders.length).toBeGreaterThanOrEqual(2);
    const times = orders.map((o) => new Date(o.createdAt).getTime());
    for (let i = 1; i < times.length; i++) {
      expect(times[i - 1]).toBeGreaterThanOrEqual(times[i]);
    }
  });
});
