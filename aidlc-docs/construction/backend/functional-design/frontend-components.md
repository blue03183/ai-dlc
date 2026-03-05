# 테이블오더 서비스 — 프론트엔드 컴포넌트 설계

---

## 고객용 앱 (customer-app/)

### 라우팅 구조
| 경로 | 컴포넌트 | 설명 |
|---|---|---|
| `/setup` | SetupPage | 테이블 초기 설정 (자동 로그인 실패 시) |
| `/` | MenuPage | 메뉴 조회 (기본 화면) |
| `/cart` | CartPage | 장바구니 |
| `/orders` | OrdersPage | 주문 내역 |

### 주요 컴포넌트

**SetupPage**
- Props: 없음
- State: storeIdentifier, tableNumber, password, error, loading
- API: POST `/api/auth/table/login`
- 동작: 로그인 성공 시 토큰+테이블 정보 localStorage 저장 → `/` 리다이렉트

**MenuPage**
- Props: 없음
- State: categories[], menus[], selectedCategory, selectedMenu(상세 모달)
- API: GET `/api/stores/:storeId/menus`, GET `/api/stores/:storeId/categories`
- 하위 컴포넌트: CategoryTabs, MenuGrid, MenuCard, MenuDetailModal

**MenuCard**
- Props: menu {id, name, price, imageUrl, description}
- 동작: 탭 시 MenuDetailModal 열기, 장바구니 추가 버튼

**MenuDetailModal**
- Props: menu, isOpen, onClose, onAddToCart
- State: quantity (기본 1)
- 동작: 수량 선택 후 장바구니 추가

**CartPage**
- Props: 없음
- State: cartItems[] (localStorage에서 로드), totalAmount
- 하위 컴포넌트: CartItemRow, CartSummary, OrderConfirmModal
- API: POST `/api/stores/:storeId/orders` (주문 확정 시)
- 동작: 수량 조절, 삭제, 비우기, 주문 확정

**CartItemRow**
- Props: item {menuId, menuName, unitPrice, quantity, imageUrl}, onQuantityChange, onRemove
- 동작: +/- 버튼, 삭제 버튼

**OrdersPage**
- Props: 없음
- State: orders[], sseConnected
- API: GET `/api/stores/:storeId/tables/:tableId/orders`
- SSE: GET `/api/stores/:storeId/tables/:tableId/events/orders`
- 하위 컴포넌트: OrderCard
- 동작: 주문 목록 표시, SSE로 실시간 상태 업데이트

**OrderCard**
- Props: order {orderNumber, status, totalAmount, items[], createdAt}
- 동작: 주문 상태 배지 표시 (대기중/준비중/완료)

**공통 컴포넌트**
- Header: 네비게이션 (메뉴/장바구니/주문내역), 장바구니 아이콘+수량 배지
- SSEProvider: SSE 연결 관리, 자동 재연결, 이벤트 분배

### 장바구니 로컬 저장 구조
```json
{
  "cartItems": [
    {
      "menuId": 1,
      "menuName": "김치찌개",
      "unitPrice": 8000,
      "quantity": 2,
      "imageUrl": "/uploads/xxx.jpg"
    }
  ],
  "storeId": 1,
  "tableId": 3
}
```

---

## 관리자용 앱 (admin-app/)

### 라우팅 구조
| 경로 | 컴포넌트 | 설명 |
|---|---|---|
| `/login` | LoginPage | 관리자 로그인 |
| `/` | DashboardPage | 실시간 주문 대시보드 |
| `/tables` | TableManagementPage | 테이블 관리 |
| `/menus` | MenuManagementPage | 메뉴 관리 |
| `/admins` | AdminManagementPage | 관리자 계정 관리 (OWNER 전용) |

### 주요 컴포넌트

**LoginPage**
- State: storeIdentifier, username, password, error, loading
- API: POST `/api/auth/admin/login`
- 동작: 로그인 성공 시 JWT localStorage 저장 → `/` 리다이렉트

**DashboardPage**
- State: tables[], orders (테이블별 그룹), sseConnected, filterTableId
- API: GET `/api/stores/:storeId/orders`, GET `/api/stores/:storeId/tables`
- SSE: GET `/api/stores/:storeId/events/orders`
- 하위 컴포넌트: TableCard, OrderDetailModal, TableFilter
- 동작: 테이블별 그리드, 신규 주문 강조, 필터링

**TableCard**
- Props: table {id, tableNumber}, orders[], totalAmount
- State: isHighlighted (신규 주문 시 애니메이션)
- 동작: 클릭 시 OrderDetailModal 열기, 총 주문액 표시, 최신 주문 미리보기

**OrderDetailModal**
- Props: tableId, orders[], isOpen, onClose
- 동작: 전체 주문 목록, 상태 변경 버튼, 삭제 버튼, 이용 완료 버튼
- API: PUT `/api/stores/:storeId/orders/:orderId/status`, DELETE `/api/stores/:storeId/orders/:orderId`, POST `/api/stores/:storeId/tables/:tableId/complete`

**TableManagementPage**
- State: tables[], showSetupModal, showHistoryModal, selectedTable
- API: GET/POST/PUT `/api/stores/:storeId/tables`
- 하위 컴포넌트: TableSetupModal, OrderHistoryModal

**TableSetupModal**
- Props: isOpen, onClose, onSubmit
- State: tableNumber, password
- API: POST `/api/stores/:storeId/tables`

**OrderHistoryModal**
- Props: tableId, isOpen, onClose
- State: history[], dateFilter
- API: GET `/api/stores/:storeId/tables/:tableId/orders/history`

**MenuManagementPage**
- State: categories[], menus[], selectedCategory, showMenuForm, editingMenu
- API: CRUD `/api/stores/:storeId/menus`, `/api/stores/:storeId/categories`
- 하위 컴포넌트: CategorySidebar, MenuList, MenuForm, MenuSortable

**MenuForm**
- Props: menu? (수정 시), onSubmit, onCancel
- State: name, price, description, categoryId, imageFile, imagePreview
- API: POST `/api/upload` (이미지), POST/PUT `/api/stores/:storeId/menus`
- 검증: 필수 필드, price >= 0, 이미지 형식/크기

**AdminManagementPage** (OWNER 전용)
- State: admins[], showCreateModal
- API: GET/POST `/api/stores/:storeId/admins`
- 하위 컴포넌트: AdminCreateModal

**공통 컴포넌트**
- Sidebar: 네비게이션 (대시보드/테이블/메뉴/관리자)
- ConfirmModal: 삭제/이용완료 확인 팝업
- SSEProvider: SSE 연결 관리
- AuthGuard: 인증 상태 확인, 미인증 시 로그인 리다이렉트
- RoleGuard: OWNER 전용 페이지 접근 제어
