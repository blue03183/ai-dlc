# 테이블오더 서비스 — 컴포넌트 메서드 정의

> 비즈니스 규칙 상세는 Functional Design 단계에서 정의됩니다.

---

## 1. 백엔드 API 엔드포인트

### AuthModule
| Method | Endpoint | 설명 |
|---|---|---|
| POST | `/api/auth/admin/login` | 관리자 로그인 (JWT 발급) |
| POST | `/api/auth/table/login` | 테이블 태블릿 로그인 |
| POST | `/api/auth/table/setup` | 테이블 초기 설정 (관리자가 수행) |
| GET | `/api/auth/me` | 현재 인증 정보 조회 |

### StoreModule
| Method | Endpoint | 설명 |
|---|---|---|
| GET | `/api/stores/:storeId` | 매장 정보 조회 |

### TableModule
| Method | Endpoint | 설명 |
|---|---|---|
| GET | `/api/stores/:storeId/tables` | 테이블 목록 조회 |
| POST | `/api/stores/:storeId/tables` | 테이블 생성/설정 |
| PUT | `/api/stores/:storeId/tables/:tableId` | 테이블 정보 수정 |
| POST | `/api/stores/:storeId/tables/:tableId/complete` | 테이블 이용 완료 처리 |

### MenuModule
| Method | Endpoint | 설명 |
|---|---|---|
| GET | `/api/stores/:storeId/menus` | 메뉴 목록 조회 (카테고리별) |
| GET | `/api/stores/:storeId/menus/:menuId` | 메뉴 상세 조회 |
| POST | `/api/stores/:storeId/menus` | 메뉴 등록 |
| PUT | `/api/stores/:storeId/menus/:menuId` | 메뉴 수정 |
| DELETE | `/api/stores/:storeId/menus/:menuId` | 메뉴 삭제 |
| PUT | `/api/stores/:storeId/menus/reorder` | 메뉴 순서 변경 |
| GET | `/api/stores/:storeId/categories` | 카테고리 목록 조회 |
| POST | `/api/stores/:storeId/categories` | 카테고리 생성 |
| PUT | `/api/stores/:storeId/categories/:categoryId` | 카테고리 수정 |
| DELETE | `/api/stores/:storeId/categories/:categoryId` | 카테고리 삭제 |

### OrderModule
| Method | Endpoint | 설명 |
|---|---|---|
| POST | `/api/stores/:storeId/orders` | 주문 생성 |
| GET | `/api/stores/:storeId/orders` | 주문 목록 조회 (관리자) |
| GET | `/api/stores/:storeId/tables/:tableId/orders` | 테이블별 현재 세션 주문 조회 |
| GET | `/api/stores/:storeId/tables/:tableId/orders/history` | 테이블별 과거 주문 이력 조회 |
| PUT | `/api/stores/:storeId/orders/:orderId/status` | 주문 상태 변경 |
| DELETE | `/api/stores/:storeId/orders/:orderId` | 주문 삭제 |

### EventModule
| Method | Endpoint | 설명 |
|---|---|---|
| GET | `/api/stores/:storeId/events/orders` | 관리자용 주문 SSE 스트림 |
| GET | `/api/stores/:storeId/tables/:tableId/events/orders` | 고객용 주문 상태 SSE 스트림 |

### AdminModule
| Method | Endpoint | 설명 |
|---|---|---|
| GET | `/api/stores/:storeId/admins` | 관리자 목록 조회 |
| POST | `/api/stores/:storeId/admins` | 관리자 계정 생성 |

### UploadModule
| Method | Endpoint | 설명 |
|---|---|---|
| POST | `/api/upload` | 이미지 파일 업로드 |
| DELETE | `/api/upload/:filename` | 업로드된 파일 삭제 |

---

## 2. 서비스 레이어 메서드

### AuthService
- `adminLogin(storeId, username, password): Promise<{token, admin}>`
- `tableLogin(storeId, tableNumber, password): Promise<{token, table, session}>`
- `validateToken(token): Promise<TokenPayload>`
- `checkLoginAttempts(storeId, username): Promise<boolean>`

### TableService
- `findAllByStore(storeId): Promise<Table[]>`
- `create(storeId, tableData): Promise<Table>`
- `update(storeId, tableId, tableData): Promise<Table>`
- `completeSession(storeId, tableId): Promise<void>`
- `getCurrentSession(storeId, tableId): Promise<TableSession>`

### MenuService
- `findAllByStore(storeId, categoryId?): Promise<Menu[]>`
- `findOne(storeId, menuId): Promise<Menu>`
- `create(storeId, menuData): Promise<Menu>`
- `update(storeId, menuId, menuData): Promise<Menu>`
- `delete(storeId, menuId): Promise<void>`
- `reorder(storeId, menuOrders): Promise<void>`

### OrderService
- `create(storeId, tableId, sessionId, orderItems): Promise<Order>`
- `findByStore(storeId, filters?): Promise<Order[]>`
- `findByTableSession(storeId, tableId, sessionId): Promise<Order[]>`
- `findHistory(storeId, tableId, dateFilter?): Promise<OrderHistory[]>`
- `updateStatus(storeId, orderId, status): Promise<Order>`
- `delete(storeId, orderId): Promise<void>`
- `moveToHistory(storeId, tableId, sessionId): Promise<void>`

### EventService
- `subscribeToStoreOrders(storeId): Observable<OrderEvent>`
- `subscribeToTableOrders(storeId, tableId): Observable<OrderEvent>`
- `emitOrderCreated(storeId, order): void`
- `emitOrderStatusChanged(storeId, order): void`
- `emitOrderDeleted(storeId, orderId): void`

### AdminService
- `findAllByStore(storeId): Promise<Admin[]>`
- `create(storeId, adminData): Promise<Admin>`

### UploadService
- `uploadImage(file): Promise<{url, filename}>`
- `deleteImage(filename): Promise<void>`
