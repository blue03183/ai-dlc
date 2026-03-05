# Code Generation Summary — Unit 3: admin-app

## 생성된 파일 목록

### 프로젝트 설정
- `admin-app/package.json` — 의존성 (react, react-router-dom, axios, vitest 등)
- `admin-app/vite.config.ts` — Vite + vitest 설정
- `admin-app/tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`

### 타입 및 API (src/types/, src/api/)
- `types/index.ts` — 전체 도메인 타입 정의 (Admin, Table, Menu, Order, SSE 등)
- `api/client.ts` — Axios 인스턴스 (JWT 인터셉터, 401 자동 리다이렉트)
- `api/auth.ts`, `api/orders.ts`, `api/tables.ts`, `api/menus.ts`, `api/categories.ts`, `api/admins.ts`, `api/upload.ts`

### 인증 및 훅 (src/contexts/, src/hooks/)
- `contexts/AuthContext.tsx` — JWT 기반 인증 상태 관리, 자동 만료 처리
- `hooks/useAuth.ts` — AuthContext 소비 훅
- `hooks/useSSE.ts` — SSE 연결 관리 (자동 재연결)

### 공통 컴포넌트 (src/components/)
- `layout/Sidebar.tsx` — 역할 기반 네비게이션
- `layout/AppLayout.tsx` — 인증된 페이지 레이아웃
- `common/AuthGuard.tsx` — 미인증 리다이렉트
- `common/RoleGuard.tsx` — OWNER 전용 접근 제어
- `common/ConfirmModal.tsx` — 삭제/이용완료 확인 팝업
- `orders/OrderStatusBadge.tsx` — 주문 상태 배지

### 페이지 (src/pages/)
- `LoginPage.tsx` — US-102 (관리자 로그인)
- `DashboardPage.tsx` — US-501~503, US-602, US-603 (실시간 대시보드, 주문 상세/상태변경/삭제, 이용완료)
- `TableManagementPage.tsx` — US-601, US-604 (테이블 설정, 과거 주문 내역)
- `MenuManagementPage.tsx` — US-701~704 (메뉴 CRUD, 순서 관리, 이미지 업로드)
- `AdminManagementPage.tsx` — US-103 (관리자 계정 생성)

### 유틸리티 (src/utils/)
- `format.ts` — 가격, 날짜, 주문 상태, 관리자 역할 포맷

### 테스트 (3 파일, 12 tests)
- `utils/format.test.ts` — 4 tests
- `components/common/ConfirmModal.test.tsx` — 5 tests
- `pages/LoginPage.test.tsx` — 3 tests

## 스토리 커버리지
13개 스토리 모두 구현 완료 (US-102, US-103, US-501~503, US-601~604, US-701~704)

## 빌드 상태
- TypeScript 컴파일: ✅ 에러 없음
- Vite 빌드: ✅ 성공 (257KB gzipped 83KB)
- 단위 테스트: ✅ 12/12 통과
