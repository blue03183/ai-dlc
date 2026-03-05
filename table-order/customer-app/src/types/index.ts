// 공통 타입 정의 — 후속 Step에서 확장

export interface Store {
  id: number;
  storeIdentifier: string;
  name: string;
}

export interface TableInfo {
  id: number;
  tableNumber: number;
  storeName: string;
}

export interface Category {
  id: number;
  name: string;
  sortOrder: number;
}

export interface Menu {
  id: number;
  name: string;
  price: number;
  description: string | null;
  imageUrl: string | null;
  categoryId: number;
  sortOrder: number;
  isAvailable: boolean;
}

export interface CartItem {
  menuId: number;
  menuName: string;
  unitPrice: number;
  quantity: number;
  imageUrl: string | null;
}

export type OrderStatus = 'PENDING' | 'PREPARING' | 'COMPLETED';

export interface OrderItem {
  id: number;
  menuName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
}
