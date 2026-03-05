import type { Category, Menu, Order } from '@/types';

export const mockCategories: Category[] = [
  { id: 1, name: '추천 메뉴', sortOrder: 0 },
  { id: 2, name: '식사', sortOrder: 1 },
  { id: 3, name: '사이드', sortOrder: 2 },
  { id: 4, name: '음료', sortOrder: 3 },
];

export const mockMenus: Menu[] = [
  { id: 1, categoryId: 1, name: '김치찌개', price: 8000, description: '돼지고기와 잘 익은 김치로 끓인 얼큰한 김치찌개', imageUrl: null, sortOrder: 0, isAvailable: true },
  { id: 2, categoryId: 1, name: '된장찌개', price: 8000, description: '구수한 된장과 두부, 호박이 들어간 된장찌개', imageUrl: null, sortOrder: 1, isAvailable: true },
  { id: 3, categoryId: 2, name: '제육볶음', price: 10000, description: '매콤달콤 양념에 볶은 돼지고기 제육볶음', imageUrl: null, sortOrder: 0, isAvailable: true },
  { id: 4, categoryId: 2, name: '불고기', price: 12000, description: '달콤한 간장 양념의 소불고기', imageUrl: null, sortOrder: 1, isAvailable: true },
  { id: 5, categoryId: 2, name: '비빔밥', price: 9000, description: '신선한 나물과 고추장으로 비벼먹는 비빔밥', imageUrl: null, sortOrder: 2, isAvailable: true },
  { id: 6, categoryId: 3, name: '계란말이', price: 5000, description: '부드러운 계란말이', imageUrl: null, sortOrder: 0, isAvailable: true },
  { id: 7, categoryId: 3, name: '감자전', price: 6000, description: '바삭하게 부친 감자전', imageUrl: null, sortOrder: 1, isAvailable: true },
  { id: 8, categoryId: 3, name: '두부김치', price: 7000, description: '따뜻한 두부와 볶음김치', imageUrl: null, sortOrder: 2, isAvailable: true },
  { id: 9, categoryId: 4, name: '콜라', price: 2000, description: null, imageUrl: null, sortOrder: 0, isAvailable: true },
  { id: 10, categoryId: 4, name: '사이다', price: 2000, description: null, imageUrl: null, sortOrder: 1, isAvailable: true },
  { id: 11, categoryId: 4, name: '맥주', price: 4000, description: '시원한 생맥주 500ml', imageUrl: null, sortOrder: 2, isAvailable: true },
  { id: 12, categoryId: 4, name: '소주', price: 4000, description: '참이슬 후레쉬', imageUrl: null, sortOrder: 3, isAvailable: true },
];

let orderCounter = 0;
let mockOrders: Order[] = [];

export function resetMockOrders(): void {
  orderCounter = 0;
  mockOrders = [];
}

export function getMockOrders(): Order[] {
  return [...mockOrders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function createMockOrder(items: { menuId: number; quantity: number }[]): Order {
  orderCounter++;
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const orderNumber = `ORD-${dateStr}-${String(orderCounter).padStart(4, '0')}`;

  const orderItems = items.map((item, idx) => {
    const menu = mockMenus.find((m) => m.id === item.menuId)!;
    return {
      id: Date.now() + idx,
      menuName: menu.name,
      quantity: item.quantity,
      unitPrice: menu.price,
      subtotal: menu.price * item.quantity,
    };
  });

  const order: Order = {
    id: Date.now(),
    orderNumber,
    status: 'PENDING',
    totalAmount: orderItems.reduce((sum, i) => sum + i.subtotal, 0),
    items: orderItems,
    createdAt: now.toISOString(),
  };

  mockOrders.push(order);
  return order;
}
