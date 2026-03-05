# 테이블오더 서비스 — 도메인 엔티티 상세 설계

---

## 1. Store (매장)

| 컬럼 | 타입 | 제약 조건 | 설명 |
|---|---|---|---|
| id | INT | PK, AUTO_INCREMENT | 매장 고유 ID |
| storeIdentifier | VARCHAR(50) | UNIQUE, NOT NULL | 매장 식별자 (로그인용) |
| name | VARCHAR(100) | NOT NULL | 매장명 |
| createdAt | DATETIME | NOT NULL, DEFAULT NOW | 생성일시 |
| updatedAt | DATETIME | NOT NULL, DEFAULT NOW ON UPDATE | 수정일시 |

**인덱스**:
- `idx_store_identifier` — storeIdentifier (UNIQUE)

---

## 2. Admin (관리자)

| 컬럼 | 타입 | 제약 조건 | 설명 |
|---|---|---|---|
| id | INT | PK, AUTO_INCREMENT | 관리자 고유 ID |
| storeId | INT | FK → Store.id, NOT NULL | 소속 매장 |
| username | VARCHAR(50) | NOT NULL | 사용자명 |
| password | VARCHAR(255) | NOT NULL | 비밀번호 (bcrypt 해시) |
| role | ENUM('OWNER','MANAGER') | NOT NULL, DEFAULT 'MANAGER' | 역할 |
| loginAttempts | INT | NOT NULL, DEFAULT 0 | 연속 로그인 실패 횟수 |
| lockedUntil | DATETIME | NULL | 계정 잠금 해제 시각 |
| createdAt | DATETIME | NOT NULL, DEFAULT NOW | 생성일시 |
| updatedAt | DATETIME | NOT NULL, DEFAULT NOW ON UPDATE | 수정일시 |

**인덱스**:
- `idx_admin_store_username` — (storeId, username) UNIQUE
- `idx_admin_store` — storeId

---

## 3. Table (테이블)

| 컬럼 | 타입 | 제약 조건 | 설명 |
|---|---|---|---|
| id | INT | PK, AUTO_INCREMENT | 테이블 고유 ID |
| storeId | INT | FK → Store.id, NOT NULL | 소속 매장 |
| tableNumber | INT | NOT NULL | 테이블 번호 |
| password | VARCHAR(255) | NOT NULL | 테이블 비밀번호 (bcrypt 해시) |
| createdAt | DATETIME | NOT NULL, DEFAULT NOW | 생성일시 |
| updatedAt | DATETIME | NOT NULL, DEFAULT NOW ON UPDATE | 수정일시 |

**인덱스**:
- `idx_table_store_number` — (storeId, tableNumber) UNIQUE
- `idx_table_store` — storeId

---

## 4. TableSession (테이블 세션)

| 컬럼 | 타입 | 제약 조건 | 설명 |
|---|---|---|---|
| id | INT | PK, AUTO_INCREMENT | 세션 고유 ID |
| storeId | INT | FK → Store.id, NOT NULL | 소속 매장 |
| tableId | INT | FK → Table.id, NOT NULL | 테이블 |
| status | ENUM('ACTIVE','COMPLETED') | NOT NULL, DEFAULT 'ACTIVE' | 세션 상태 |
| startedAt | DATETIME | NOT NULL, DEFAULT NOW | 세션 시작 시각 |
| completedAt | DATETIME | NULL | 이용 완료 시각 |

**인덱스**:
- `idx_session_table_status` — (tableId, status) — 활성 세션 빠른 조회
- `idx_session_store` — storeId

**비즈니스 규칙**:
- 테이블당 ACTIVE 세션은 최대 1개
- 첫 주문 생성 시 ACTIVE 세션이 없으면 자동 생성
- 이용 완료 시 status → COMPLETED, completedAt 기록

---

## 5. Category (카테고리)

| 컬럼 | 타입 | 제약 조건 | 설명 |
|---|---|---|---|
| id | INT | PK, AUTO_INCREMENT | 카테고리 고유 ID |
| storeId | INT | FK → Store.id, NOT NULL | 소속 매장 |
| name | VARCHAR(50) | NOT NULL | 카테고리명 |
| sortOrder | INT | NOT NULL, DEFAULT 0 | 노출 순서 |
| createdAt | DATETIME | NOT NULL, DEFAULT NOW | 생성일시 |
| updatedAt | DATETIME | NOT NULL, DEFAULT NOW ON UPDATE | 수정일시 |

**인덱스**:
- `idx_category_store_order` — (storeId, sortOrder)
- `idx_category_store_name` — (storeId, name) UNIQUE

---

## 6. Menu (메뉴)

| 컬럼 | 타입 | 제약 조건 | 설명 |
|---|---|---|---|
| id | INT | PK, AUTO_INCREMENT | 메뉴 고유 ID |
| storeId | INT | FK → Store.id, NOT NULL | 소속 매장 |
| categoryId | INT | FK → Category.id, NOT NULL | 카테고리 |
| name | VARCHAR(100) | NOT NULL | 메뉴명 |
| price | INT | NOT NULL, CHECK(price >= 0) | 가격 (원) |
| description | TEXT | NULL | 메뉴 설명 |
| imageUrl | VARCHAR(500) | NULL | 이미지 URL |
| sortOrder | INT | NOT NULL, DEFAULT 0 | 노출 순서 |
| isAvailable | BOOLEAN | NOT NULL, DEFAULT TRUE | 판매 가능 여부 |
| createdAt | DATETIME | NOT NULL, DEFAULT NOW | 생성일시 |
| updatedAt | DATETIME | NOT NULL, DEFAULT NOW ON UPDATE | 수정일시 |

**인덱스**:
- `idx_menu_store_category_order` — (storeId, categoryId, sortOrder)
- `idx_menu_store` — storeId

---

## 7. Order (주문)

| 컬럼 | 타입 | 제약 조건 | 설명 |
|---|---|---|---|
| id | INT | PK, AUTO_INCREMENT | 주문 고유 ID |
| storeId | INT | FK → Store.id, NOT NULL | 소속 매장 |
| tableId | INT | FK → Table.id, NOT NULL | 테이블 |
| sessionId | INT | FK → TableSession.id, NOT NULL | 테이블 세션 |
| orderNumber | VARCHAR(20) | NOT NULL | 주문 번호 (표시용) |
| status | ENUM('PENDING','PREPARING','COMPLETED') | NOT NULL, DEFAULT 'PENDING' | 주문 상태 |
| totalAmount | INT | NOT NULL, CHECK(totalAmount >= 0) | 총 주문 금액 (원) |
| createdAt | DATETIME | NOT NULL, DEFAULT NOW | 주문 시각 |
| updatedAt | DATETIME | NOT NULL, DEFAULT NOW ON UPDATE | 수정일시 |

**인덱스**:
- `idx_order_store_table_session` — (storeId, tableId, sessionId) — 테이블 세션별 주문 조회
- `idx_order_store_status` — (storeId, status) — 상태별 주문 조회
- `idx_order_store_created` — (storeId, createdAt DESC) — 최신 주문 조회
- `idx_order_session` — sessionId

**비즈니스 규칙**:
- 주문 번호 형식: `ORD-{YYYYMMDD}-{순번}` (매장별 일일 순번)
- 상태 전이: PENDING → PREPARING → COMPLETED (역방향 불가)
- 주문 삭제 시 물리 삭제 (관리자 직권)

---

## 8. OrderItem (주문 항목)

| 컬럼 | 타입 | 제약 조건 | 설명 |
|---|---|---|---|
| id | INT | PK, AUTO_INCREMENT | 항목 고유 ID |
| orderId | INT | FK → Order.id, NOT NULL, ON DELETE CASCADE | 주문 |
| menuId | INT | FK → Menu.id, NOT NULL | 메뉴 |
| menuName | VARCHAR(100) | NOT NULL | 주문 시점 메뉴명 (스냅샷) |
| quantity | INT | NOT NULL, CHECK(quantity > 0) | 수량 |
| unitPrice | INT | NOT NULL, CHECK(unitPrice >= 0) | 주문 시점 단가 (스냅샷) |
| subtotal | INT | NOT NULL | 소계 (quantity * unitPrice) |

**인덱스**:
- `idx_orderitem_order` — orderId

**비즈니스 규칙**:
- menuName, unitPrice는 주문 시점의 스냅샷 (메뉴 변경 시에도 주문 이력 보존)

---

## 9. OrderHistory (과거 주문 이력)

| 컬럼 | 타입 | 제약 조건 | 설명 |
|---|---|---|---|
| id | INT | PK, AUTO_INCREMENT | 이력 고유 ID |
| storeId | INT | FK → Store.id, NOT NULL | 소속 매장 |
| tableId | INT | FK → Table.id, NOT NULL | 테이블 |
| sessionId | INT | NOT NULL | 원본 세션 ID |
| orderNumber | VARCHAR(20) | NOT NULL | 주문 번호 |
| orderItems | JSON | NOT NULL | 주문 항목 (JSON 스냅샷) |
| totalAmount | INT | NOT NULL | 총 금액 |
| orderedAt | DATETIME | NOT NULL | 원본 주문 시각 |
| completedAt | DATETIME | NOT NULL | 이용 완료 시각 |

**인덱스**:
- `idx_history_store_table_completed` — (storeId, tableId, completedAt DESC) — 테이블별 과거 이력 조회
- `idx_history_store_completed` — (storeId, completedAt DESC) — 날짜 필터링

**비즈니스 규칙**:
- 이용 완료 시 Order + OrderItem 데이터를 JSON으로 스냅샷하여 저장
- 원본 Order, OrderItem은 이용 완료 시 삭제 (현재 주문 목록 리셋)

---

## ER 다이어그램 (텍스트)

```
Store (1) ----< (N) Admin
Store (1) ----< (N) Table
Store (1) ----< (N) Category
Store (1) ----< (N) Menu
Store (1) ----< (N) Order
Store (1) ----< (N) OrderHistory

Table (1) ----< (N) TableSession
Table (1) ----< (N) Order
Table (1) ----< (N) OrderHistory

TableSession (1) ----< (N) Order

Category (1) ----< (N) Menu

Order (1) ----< (N) OrderItem
Menu (1) ----< (N) OrderItem
```
