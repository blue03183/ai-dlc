// 공통 타입 정의

export interface Store {
  id: number;
  storeIdentifier: string;
  name: string;
}

export interface TableInfo {
  id: number;
  tableNumber: number;
  storeName: string;
  storeId: number;
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

// Auth
export interface TableLoginRequest {
  storeIdentifier: string;
  tableNumber: number;
  password: string;
}

export interface TableLoginResponse {
  token: string;
  table: TableInfo;
  session?: { id: number; status: string };
}

export interface AuthInfo {
  token: string;
  storeId: number;
  tableId: number;
  tableNumber: number;
  storeName: string;
}

// Order API
export interface CreateOrderRequest {
  tableId: number;
  items: { menuId: number; quantity: number }[];
}

export interface CreateOrderResponse {
  id: number;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}

// SSE
export type SSEEventType =
  | 'ORDER_CREATED'
  | 'ORDER_STATUS_CHANGED'
  | 'ORDER_DELETED'
  | 'SESSION_COMPLETED';
