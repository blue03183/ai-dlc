# 테이블오더 서비스 — Unit of Work 정의

---

## 프로젝트 구조 (모노레포)

```
table-order/
+-- backend/              # Unit 1: NestJS 백엔드 API
+-- customer-app/         # Unit 2: React 고객용 프론트엔드
+-- admin-app/            # Unit 3: React 관리자용 프론트엔드
+-- aidlc-docs/           # 문서
+-- requirements/         # 요구사항
```

---

## Unit 1: 백엔드 API 서버 (backend/)

- **기술 스택**: Node.js + NestJS + TypeScript + MySQL + TypeORM
- **책임**: REST API, SSE 실시간 이벤트, 인증/인가, 데이터 관리
- **개발자**: 2명 (병렬 개발)

### 개발자 배치

| 개발자 | 담당 모듈 | 주요 책임 |
|---|---|---|
| **BE-Dev1** | AuthModule, StoreModule, AdminModule, TableModule | 인증/인가, 매장 관리, 관리자 계정, 테이블 세션 관리 |
| **BE-Dev2** | MenuModule, OrderModule, EventModule, UploadModule | 메뉴 CRUD, 주문 라이프사이클, SSE 실시간 이벤트, 파일 업로드 |

### 공통 작업 (BE-Dev1 주도, BE-Dev2 협업)
- 프로젝트 초기 설정 (NestJS 프로젝트, TypeORM, MySQL 연결)
- 공통 미들웨어 (JWT Guard, 에러 핸들링)
- DB 마이그레이션 스키마

---

## Unit 2: 고객용 프론트엔드 (customer-app/)

- **기술 스택**: React + TypeScript + Vite
- **책임**: 고객 주문 UI (메뉴 조회, 장바구니, 주문, 주문 내역)
- **개발자**: 1명

### 개발자 배치

| 개발자 | 담당 컴포넌트 | 주요 책임 |
|---|---|---|
| **FE-Dev1** | AuthPage, MenuPage, CartComponent, OrderPage, SSEClient | 테이블 자동 로그인, 메뉴 탐색, 장바구니, 주문 생성/조회, 실시간 상태 업데이트 |

---

## Unit 3: 관리자용 프론트엔드 (admin-app/)

- **기술 스택**: React + TypeScript + Vite
- **책임**: 관리자 대시보드 UI (주문 모니터링, 테이블/메뉴/관리자 관리)
- **개발자**: 1명

### 개발자 배치

| 개발자 | 담당 컴포넌트 | 주요 책임 |
|---|---|---|
| **FE-Dev2** | LoginPage, DashboardPage, OrderDetailModal, TableManagementPage, MenuManagementPage, AdminManagementPage, SSEClient | 관리자 로그인, 실시간 대시보드, 주문 상태 관리, 테이블/메뉴/계정 관리 |

---

## 개발자 배치 요약

| 역할 | 개발자 | 유닛 | 담당 영역 |
|---|---|---|---|
| 백엔드 개발자 1 | BE-Dev1 | Unit 1 | Auth, Store, Admin, Table + 프로젝트 초기 설정 |
| 백엔드 개발자 2 | BE-Dev2 | Unit 1 | Menu, Order, Event, Upload |
| 프론트엔드 개발자 1 | FE-Dev1 | Unit 2 | 고객용 앱 전체 |
| 프론트엔드 개발자 2 | FE-Dev2 | Unit 3 | 관리자용 앱 전체 |

---

## 개발 전략

- **병렬 개발**: API 스펙(엔드포인트, DTO)을 먼저 정의하고, 백엔드와 프론트엔드가 동시에 개발
- **API 계약**: component-methods.md의 엔드포인트 정의를 API 계약으로 사용
- **통합 시점**: 각 Feature 단위로 백엔드 API 완성 시 프론트엔드와 통합 테스트
