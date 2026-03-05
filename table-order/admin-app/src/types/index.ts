// ===== Admin =====
export type AdminRole = 'OWNER' | 'MANAGER';

export interface AdminInfo {
  id: number;
  username: string;
  role: AdminRole;
  storeName: string;
  storeId: number;
}

export interface Admin {
  id: number;
  storeId: number;
  username: string;
  role: AdminRole;
  createdAt: string;
}

export interface LoginRequest {
  storeIdentifier: string;
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  admin: AdminInfo;
}

export interface CreateAdminRequest {
  username: string;
  password: string;
  role: AdminRole;
}

// ===== Table =====
export interface Table {
  id: number;
  tableNumber: number;
  storeId: number;
  createdAt: string;
}

export interface CreateTableRequest {
  tableNumber: number;
  password: string;
}

// ===== Category =====
export interface Category {
  id: number;
  name: string;
  sortOrder: number;
  storeId?: number;
}

export interface CreateCategoryRequest {
  name: string;
}

// ===== Menu =====
export interface Menu {
  id: number;
  name: string;
  price: number;
  description: string | null;
  imageUrl: string | null;
  categoryId: number;
  sortOrder: number;
  isAvailable: boolean;
  storeId?: number;
  createdAt?: string;
}

export interface CreateMenuRequest {
  name: string;
  price: number;
  categoryId: number;
  description?: string;
  imageUrl?: string;
}

export interface UpdateMenuRequest {
  name?: string;
  price?: number;
  categoryId?: number;
  description?: string;
  imageUrl?: string;
}

export interface ReorderMenuRequest {
  menuId: number;
  sortOrder: number;
}

// ===== Order =====
export type OrderStatus = 'PENDING' | 'PREPARING' | 'COMPLETED';

export interface OrderItem {
  id: number;
  menuId?: number;
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
  sessionId?: number;
  storeId?: number;
  items: OrderItem[];
  createdAt: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

// ===== OrderHistory =====
export interface OrderHistory {
  id: number;
  orderNumber: string;
  orderItems: OrderItem[];
  totalAmount: number;
  orderedAt: string;
  completedAt: string;
  storeId?: number;
  tableId?: number;
  sessionId?: number;
}

// ===== SSE Events =====
export type SSEEventType =
  | 'ORDER_CREATED'
  | 'ORDER_STATUS_CHANGED'
  | 'ORDER_DELETED'
  | 'SESSION_COMPLETED';

export interface SSEOrderCreatedEvent {
  type: 'ORDER_CREATED';
  data: Order;
}

export interface SSEOrderStatusChangedEvent {
  type: 'ORDER_STATUS_CHANGED';
  data: { orderId: number; status: OrderStatus };
}

export interface SSEOrderDeletedEvent {
  type: 'ORDER_DELETED';
  data: { orderId: number };
}

export interface SSESessionCompletedEvent {
  type: 'SESSION_COMPLETED';
  data: { tableId: number; sessionId: number };
}

export type SSEEvent =
  | SSEOrderCreatedEvent
  | SSEOrderStatusChangedEvent
  | SSEOrderDeletedEvent
  | SSESessionCompletedEvent;

// ===== Upload =====
export interface UploadResponse {
  url: string;
  filename: string;
}
