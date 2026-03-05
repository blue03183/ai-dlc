// 공통 타입 정의 — 후속 Step에서 확장

export type AdminRole = 'OWNER' | 'MANAGER';

export interface AdminInfo {
  id: number;
  username: string;
  role: AdminRole;
  storeName: string;
  storeId: number;
}

export interface Table {
  id: number;
  tableNumber: number;
  storeId: number;
  createdAt: string;
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
  tableId: number;
  items: OrderItem[];
  createdAt: string;
}

export interface OrderHistory {
  id: number;
  orderNumber: string;
  orderItems: OrderItem[];
  totalAmount: number;
  orderedAt: string;
  completedAt: string;
}
