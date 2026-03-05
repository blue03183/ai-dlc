# Code Generation Plan — Unit 3: 관리자용 프론트엔드 (admin-app)

## 유닛 컨텍스트

- **유닛**: Unit 3 — admin-app (관리자용 프론트엔드)
- **기술 스택**: React + TypeScript + Vite
- **개발자**: FE-Dev2
- **코드 위치**: `admin-app/` (워크스페이스 루트)
- **의존성**: Unit 1 (백엔드 REST API + SSE) — API 계약 기반 개발

## 담당 스토리 (13개)

| 스토리 | 설명 | 우선순위 |
|---|---|---|
| US-102 | 관리자 로그인 화면 | 높음 |
| US-103 | 관리자 계정 생성 화면 | 중간 |
| US-501 | 실시간 주문 대시보드 | 높음 |
| US-502 | 주문 상세 모달 | 높음 |
| US-503 | 주문 상태 변경 UI | 높음 |
| US-601 | 테이블 초기 설정 화면 | 높음 |
| US-602 | 주문 삭제 UI | 높음 |
| US-603 | 테이블 이용 완료 UI | 높음 |
| US-604 | 과거 주문 내역 화면 | 중간 |
| US-701 | 메뉴 등록 화면 | 높음 |
| US-702 | 메뉴 수정 화면 | 높음 |
| US-703 | 메뉴 삭제 UI | 중간 |
| US-704 | 메뉴 조회/순서 관리 화면 | 높음 |

---

## 실행 단계

### Step 1: 프로젝트 초기 설정
- [x] Vite + React + TypeScript 프로젝트 생성
- [x] 의존성 설치 (react-router-dom, axios)
- [x] tsconfig, vite.config 설정
- [x] 기본 index.html, main.tsx, App.tsx 설정

### Step 2: 타입 정의 및 API 클라이언트
- [x] `src/types/index.ts` — 공통 타입
- [x] `src/api/client.ts` — Axios 인스턴스 (JWT 인터셉터)
- [x] `src/api/auth.ts` — 관리자 로그인 API
- [x] `src/api/orders.ts` — 주문 CRUD API
- [x] `src/api/tables.ts` — 테이블 API
- [x] `src/api/menus.ts` — 메뉴 CRUD API
- [x] `src/api/categories.ts` — 카테고리 API
- [x] `src/api/admins.ts` — 관리자 계정 API
- [x] `src/api/upload.ts` — 이미지 업로드 API

### Step 3: 인증 컨텍스트 및 훅
- [x] `src/contexts/AuthContext.tsx` — 인증 상태 관리
- [x] `src/hooks/useAuth.ts` — AuthContext 소비 훅
- [x] `src/hooks/useSSE.ts` — SSE 연결 관리 훅

### Step 4: 공통 컴포넌트 및 레이아웃
- [x] `src/components/layout/Sidebar.tsx` — 사이드바 네비게이션
- [x] `src/components/layout/AppLayout.tsx` — 레이아웃 래퍼
- [x] `src/components/common/AuthGuard.tsx` — 인증 가드
- [x] `src/components/common/RoleGuard.tsx` — 역할 가드
- [x] `src/components/common/ConfirmModal.tsx` — 확인 팝업
- [x] `src/components/orders/OrderStatusBadge.tsx` — 주문 상태 배지
- [x] `src/utils/format.ts` — 포맷 유틸리티

### Step 5: 라우팅 및 App 구성
- [x] `src/App.tsx` — React Router 설정
- [x] `src/index.css` — 글로벌 스타일

### Step 6: 로그인 페이지 (US-102)
- [x] `src/pages/LoginPage.tsx` — 로그인 폼, JWT 저장, 에러 처리
- [x] data-testid 속성 포함

### Step 7: 대시보드 페이지 (US-501, US-502, US-503, US-602, US-603)
- [x] `src/pages/DashboardPage.tsx` — 테이블별 카드 그리드
- [x] SSE 연동, 신규 주문 강조, 테이블 필터링
- [x] OrderDetailModal (US-502)
- [x] 주문 상태 변경 (US-503)
- [x] 주문 삭제 (US-602)
- [x] 이용 완료 (US-603)
- [x] data-testid 속성 포함

### Step 8: 테이블 관리 페이지 (US-601, US-604)
- [x] `src/pages/TableManagementPage.tsx` — 테이블 목록 + 설정/이력
- [x] 테이블 추가 모달 (US-601)
- [x] 과거 주문 내역 모달 + 날짜 필터 (US-604)
- [x] data-testid 속성 포함

### Step 9: 메뉴 관리 페이지 (US-701, US-702, US-703, US-704)
- [x] `src/pages/MenuManagementPage.tsx` — 카테고리별 메뉴 CRUD
- [x] 카테고리 사이드바 + 추가/삭제
- [x] 메뉴 등록 폼 + 이미지 업로드 (US-701)
- [x] 메뉴 수정 폼 (US-702)
- [x] 메뉴 삭제 (US-703)
- [x] 메뉴 순서 변경 (US-704)
- [x] data-testid 속성 포함

### Step 10: 관리자 계정 관리 페이지 (US-103)
- [x] `src/pages/AdminManagementPage.tsx` — OWNER 전용
- [x] 관리자 목록 + 생성 모달
- [x] data-testid 속성 포함

### Step 11: 단위 테스트
- [x] 테스트 환경 설정 (vitest, @testing-library/react, happy-dom)
- [x] `src/utils/format.test.ts` — 포맷 유틸리티 테스트 (4 tests)
- [x] `src/components/common/ConfirmModal.test.tsx` — 확인 모달 테스트 (5 tests)
- [x] `src/pages/LoginPage.test.tsx` — 로그인 페이지 테스트 (3 tests)

### Step 12: 코드 생성 요약 문서
- [x] `aidlc-docs/construction/admin-app/code/code-summary.md`

---

## 스토리 완료 추적

| 스토리 | Step | 완료 |
|---|---|---|
| US-102 | Step 6 | [x] |
| US-103 | Step 10 | [x] |
| US-501 | Step 7 | [x] |
| US-502 | Step 7 | [x] |
| US-503 | Step 7 | [x] |
| US-601 | Step 8 | [x] |
| US-602 | Step 7 | [x] |
| US-603 | Step 7 | [x] |
| US-604 | Step 8 | [x] |
| US-701 | Step 9 | [x] |
| US-702 | Step 9 | [x] |
| US-703 | Step 9 | [x] |
| US-704 | Step 9 | [x] |
