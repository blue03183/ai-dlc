# 테이블오더 서비스 — 컴포넌트 의존성

---

## 백엔드 모듈 의존성 매트릭스

| 모듈 | 의존하는 모듈 |
|---|---|
| AuthModule | StoreModule, TableModule, AdminModule |
| StoreModule | (없음 — 기본 모듈) |
| TableModule | StoreModule, OrderModule, EventModule |
| MenuModule | StoreModule, UploadModule |
| OrderModule | StoreModule, TableModule, MenuModule, EventModule |
| EventModule | (없음 — 독립 모듈) |
| AdminModule | StoreModule |
| UploadModule | (없음 — 독립 모듈) |

---

## 데이터 흐름

```
+----------+     +-----------+     +-----------+
|  Store   |<----|   Admin   |     |  Upload   |
+----+-----+     +-----------+     +-----+-----+
     |                                    |
     +--+--------+--------+              |
     |  |        |        |              |
+----+--++ +-----+--+ +---+----+  +------+---+
| Table  | | Menu   | | Order  |  | Category |
+----+---+ +--------+ +---+----+  +----------+
     |                     |
+----+--------+     +------+------+
| TableSession|     |  OrderItem  |
+-------------+     +------+------+
                           |
                    +------+------+
                    | OrderHistory|
                    +-------------+
```

---

## 프론트엔드 ↔ 백엔드 통신

### 고객용 앱
| 프론트엔드 컴포넌트 | 백엔드 모듈 | 통신 방식 |
|---|---|---|
| AuthPage | AuthModule | REST (POST) |
| MenuPage | MenuModule | REST (GET) |
| CartComponent | (로컬 전용) | LocalStorage |
| OrderPage | OrderModule | REST (POST, GET) |
| SSEClient | EventModule | SSE (GET stream) |

### 관리자용 앱
| 프론트엔드 컴포넌트 | 백엔드 모듈 | 통신 방식 |
|---|---|---|
| LoginPage | AuthModule | REST (POST) |
| DashboardPage | OrderModule, EventModule | REST (GET) + SSE |
| OrderDetailModal | OrderModule | REST (GET, PUT, DELETE) |
| TableManagementPage | TableModule, OrderModule | REST (GET, POST, PUT) |
| MenuManagementPage | MenuModule, UploadModule | REST (CRUD) + Multipart |
| AdminManagementPage | AdminModule | REST (GET, POST) |
| SSEClient | EventModule | SSE (GET stream) |

---

## 데이터베이스 엔티티 관계 요약

| 엔티티 | 관계 |
|---|---|
| Store | 1:N Admin, 1:N Table, 1:N Category, 1:N Menu |
| Admin | N:1 Store |
| Table | N:1 Store, 1:N TableSession |
| TableSession | N:1 Table, 1:N Order |
| Category | N:1 Store, 1:N Menu |
| Menu | N:1 Store, N:1 Category |
| Order | N:1 Store, N:1 Table, N:1 TableSession, 1:N OrderItem |
| OrderItem | N:1 Order, N:1 Menu |
| OrderHistory | N:1 Store, N:1 Table (과거 이력 보관) |
