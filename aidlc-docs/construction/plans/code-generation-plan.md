# Code Generation Plan — 테이블오더 서비스

## 개요
3개 유닛(백엔드, 고객 앱, 관리자 앱)의 코드를 모노레포 구조로 생성합니다.
병렬 개발을 위해 백엔드 API를 먼저 생성하고, 이어서 프론트엔드 2개를 생성합니다.

## 프로젝트 구조
```
table-order/          (워크스페이스 루트)
+-- backend/          Unit 1: NestJS 백엔드
+-- customer-app/     Unit 2: React 고객용 앱
+-- admin-app/        Unit 3: React 관리자용 앱
```

---

# Step 0: 모노레포 초기 설정 (전체 프로젝트 뼈대)

## Step 0: 모노레포 + 3개 프로젝트 뼈대 생성
- [x] 루트 구조 생성 (루트 package.json, .gitignore)
- [x] backend/ — NestJS 프로젝트 뼈대 (package.json, tsconfig, nest-cli, 디렉토리 구조, TypeORM+MySQL 설정, 환경 변수, 공통 모듈)
- [x] customer-app/ — React+Vite 프로젝트 뼈대 (package.json, tsconfig, vite.config, 디렉토리 구조, 라우팅, API 클라이언트, 공통 스타일/레이아웃)
- [x] admin-app/ — React+Vite 프로젝트 뼈대 (package.json, tsconfig, vite.config, 디렉토리 구조, 라우팅, API 클라이언트, 공통 스타일/레이아웃/Sidebar)
- **목적**: 이 Step 완료 후 4명의 개발자가 각자 담당 영역에서 병렬 작업 시작 가능
- **담당**: 전체 (리드 개발자 또는 AI 생성)

---

# Unit 1: 백엔드 API (backend/)

## Step 1: 데이터베이스 엔티티 및 마이그레이션
- [ ] Store 엔티티
- [ ] Admin 엔티티
- [ ] Table 엔티티
- [ ] TableSession 엔티티
- [ ] Category 엔티티
- [ ] Menu 엔티티
- [ ] Order 엔티티
- [ ] OrderItem 엔티티
- [ ] OrderHistory 엔티티
- [ ] 초기 시드 데이터 (Store, Admin OWNER 계정)
- **스토리**: 전체 스토리의 데이터 기반
- **담당**: BE-Dev1 (Auth/Store/Admin/Table), BE-Dev2 (Menu/Order)

## Step 2: AuthModule 구현
- [ ] JWT 전략 및 Guard 구현
- [ ] 관리자 로그인 API (POST /api/auth/admin/login)
- [ ] 테이블 태블릿 로그인 API (POST /api/auth/table/login)
- [ ] 로그인 시도 제한 로직
- [ ] 역할 기반 Guard (OwnerGuard)
- [ ] 단위 테스트
- **스토리**: US-101, US-102
- **담당**: BE-Dev1

## Step 3: StoreModule 구현
- [ ] 매장 정보 조회 API
- [ ] 매장 식별자 검증 서비스
- [ ] 단위 테스트
- **담당**: BE-Dev1

## Step 4: AdminModule 구현
- [ ] 관리자 목록 조회 API
- [ ] 관리자 계정 생성 API (OWNER 전용)
- [ ] 단위 테스트
- **스토리**: US-103
- **담당**: BE-Dev1

## Step 5: TableModule 구현
- [ ] 테이블 CRUD API
- [ ] 테이블 세션 관리 서비스
- [ ] 이용 완료 API (세션 종료 + 주문 이력 이동)
- [ ] 단위 테스트
- **스토리**: US-601, US-603
- **담당**: BE-Dev1

## Step 6: MenuModule + UploadModule 구현
- [ ] 카테고리 CRUD API
- [ ] 메뉴 CRUD API
- [ ] 메뉴 순서 변경 API
- [ ] 이미지 파일 업로드 API (Multer)
- [ ] 정적 파일 서빙 설정
- [ ] 단위 테스트
- **스토리**: US-201, US-202, US-701, US-702, US-703, US-704
- **담당**: BE-Dev2

## Step 7: OrderModule 구현
- [ ] 주문 생성 API
- [ ] 주문 조회 API (테이블 세션별)
- [ ] 주문 상태 변경 API
- [ ] 주문 삭제 API
- [ ] 과거 주문 이력 조회 API
- [ ] 주문 번호 생성 로직
- [ ] 단위 테스트
- **스토리**: US-401, US-402, US-501, US-502, US-503, US-602, US-604
- **담당**: BE-Dev2

## Step 8: EventModule 구현 (SSE)
- [ ] 관리자용 SSE 엔드포인트
- [ ] 고객용 SSE 엔드포인트
- [ ] 이벤트 발행 서비스 (주문 생성/상태 변경/삭제/세션 완료)
- [ ] 구독 관리 (매장별, 테이블별)
- [ ] 단위 테스트
- **스토리**: US-403, US-501
- **담당**: BE-Dev2

## Step 9: 통합 테스트
- [ ] 인증 플로우 통합 테스트
- [ ] 주문 생성 → 상태 변경 → 이용 완료 통합 테스트
- [ ] 멀티테넌트 데이터 격리 테스트
- **담당**: BE-Dev1 + BE-Dev2

---

# Unit 2: 고객용 프론트엔드 (customer-app/)

## Step 10: 인증 및 라우팅 설정
- [ ] Step 0에서 생성된 뼈대 기반으로 상세 라우팅 구성
- [ ] 페이지별 라우트 정의 (/, /menu, /cart, /orders)
- [ ] 공통 레이아웃 컴포넌트 (Header, BottomNav)
- [ ] 공통 UI 컴포넌트 (Loading, ErrorBoundary)
- **담당**: FE-Dev1

## Step 11: 인증 및 자동 로그인
- [ ] SetupPage (초기 설정 화면)
- [ ] 자동 로그인 로직 (localStorage 기반)
- [ ] AuthContext (인증 상태 관리)
- [ ] 단위 테스트
- **스토리**: US-101
- **담당**: FE-Dev1

## Step 12: 메뉴 조회 화면
- [ ] MenuPage (기본 화면)
- [ ] CategoryTabs 컴포넌트
- [ ] MenuGrid + MenuCard 컴포넌트
- [ ] MenuDetailModal 컴포넌트
- [ ] 단위 테스트
- **스토리**: US-201, US-202
- **담당**: FE-Dev1

## Step 13: 장바구니
- [ ] CartPage 컴포넌트
- [ ] CartItemRow 컴포넌트
- [ ] 장바구니 Context (localStorage 연동)
- [ ] 총 금액 계산 로직
- [ ] 단위 테스트
- **스토리**: US-301, US-302, US-303
- **담당**: FE-Dev1

## Step 14: 주문 생성 및 내역
- [ ] 주문 확인/확정 모달
- [ ] OrdersPage (주문 내역)
- [ ] OrderCard 컴포넌트
- [ ] SSE 연동 (주문 상태 실시간 업데이트)
- [ ] 단위 테스트
- **스토리**: US-401, US-402, US-403
- **담당**: FE-Dev1

---

# Unit 3: 관리자용 프론트엔드 (admin-app/)

## Step 15: 라우팅 및 레이아웃 설정
- [ ] Step 0에서 생성된 뼈대 기반으로 상세 라우팅 구성
- [ ] 페이지별 라우트 정의 (/login, /dashboard, /tables, /menu, /admins)
- [ ] 공통 레이아웃 컴포넌트 (Sidebar, Header, MainContent)
- [ ] 공통 UI 컴포넌트 (Loading, ErrorBoundary, ConfirmModal)
- **담당**: FE-Dev2

## Step 16: 관리자 로그인
- [ ] LoginPage
- [ ] AuthContext (JWT 관리)
- [ ] AuthGuard + RoleGuard
- [ ] 단위 테스트
- **스토리**: US-102
- **담당**: FE-Dev2

## Step 17: 실시간 주문 대시보드
- [ ] DashboardPage (테이블별 그리드)
- [ ] TableCard 컴포넌트 (총 주문액, 미리보기, 신규 주문 강조)
- [ ] OrderDetailModal (주문 상세, 상태 변경, 삭제)
- [ ] SSE 연동 (실시간 주문 수신)
- [ ] 테이블 필터링
- [ ] 단위 테스트
- **스토리**: US-501, US-502, US-503, US-602
- **담당**: FE-Dev2

## Step 18: 테이블 관리
- [ ] TableManagementPage
- [ ] TableSetupModal (테이블 초기 설정)
- [ ] 이용 완료 처리 UI
- [ ] OrderHistoryModal (과거 주문 내역, 날짜 필터)
- [ ] 단위 테스트
- **스토리**: US-601, US-603, US-604
- **담당**: FE-Dev2

## Step 19: 메뉴 관리
- [ ] MenuManagementPage
- [ ] CategorySidebar
- [ ] MenuForm (등록/수정, 이미지 업로드)
- [ ] MenuSortable (순서 변경)
- [ ] 단위 테스트
- **스토리**: US-701, US-702, US-703, US-704
- **담당**: FE-Dev2

## Step 20: 관리자 계정 관리
- [ ] AdminManagementPage (OWNER 전용)
- [ ] AdminCreateModal
- [ ] 단위 테스트
- **스토리**: US-103
- **담당**: FE-Dev2

---

# 공통

## Step 21: README 및 문서
- [ ] 루트 README.md (프로젝트 개요, 실행 방법)
- [ ] backend/README.md (API 문서, 환경 설정)
- [ ] customer-app/README.md
- [ ] admin-app/README.md

---

## 스토리 커버리지 검증

| 스토리 | Step |
|---|---|
| US-101 | Step 2, 11 |
| US-102 | Step 2, 16 |
| US-103 | Step 4, 20 |
| US-201 | Step 6, 12 |
| US-202 | Step 6, 12 |
| US-301 | Step 13 |
| US-302 | Step 13 |
| US-303 | Step 13 |
| US-401 | Step 7, 14 |
| US-402 | Step 7, 14 |
| US-403 | Step 8, 14 |
| US-501 | Step 8, 17 |
| US-502 | Step 7, 17 |
| US-503 | Step 7, 17 |
| US-601 | Step 5, 18 |
| US-602 | Step 7, 17 |
| US-603 | Step 5, 18 |
| US-604 | Step 7, 18 |
| US-701 | Step 6, 19 |
| US-702 | Step 6, 19 |
| US-703 | Step 6, 19 |
| US-704 | Step 6, 19 |

모든 20개 스토리가 커버됩니다.
