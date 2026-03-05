# 테이블오더 서비스 — 비즈니스 규칙

---

## BR-01: 인증 규칙

### BR-01-1: 관리자 로그인
- 매장 식별자 + 사용자명 + 비밀번호로 인증
- 비밀번호는 bcrypt로 검증
- 성공 시 JWT 토큰 발급 (payload: adminId, storeId, role)
- JWT 만료: 16시간
- 연속 5회 실패 시 계정 15분 잠금 (lockedUntil 설정)
- 잠금 해제 후 loginAttempts 리셋

### BR-01-2: 테이블 태블릿 로그인
- 매장 식별자 + 테이블 번호 + 비밀번호로 인증
- 성공 시 JWT 토큰 발급 (payload: tableId, storeId, sessionId)
- JWT 만료: 16시간
- 로그인 정보는 클라이언트 로컬 스토리지에 저장하여 자동 로그인

### BR-01-3: 관리자 계정 생성
- OWNER 역할만 새 관리자 계정 생성 가능
- 동일 매장 내 사용자명 중복 불가
- 비밀번호는 bcrypt로 해싱하여 저장

---

## BR-02: 테이블 세션 규칙

### BR-02-1: 세션 시작
- 테이블에 ACTIVE 세션이 없는 상태에서 첫 주문 생성 시 자동으로 새 세션 생성
- 테이블당 ACTIVE 세션은 최대 1개

### BR-02-2: 세션 종료 (이용 완료)
- 관리자가 이용 완료 처리 시:
  1. 해당 세션의 모든 Order + OrderItem을 OrderHistory로 이동 (JSON 스냅샷)
  2. 원본 Order, OrderItem 삭제
  3. TableSession.status → COMPLETED, completedAt 기록
- 이용 완료 후 새 고객의 첫 주문 시 새 세션 자동 생성

---

## BR-03: 주문 규칙

### BR-03-1: 주문 생성
- 주문 항목이 1개 이상이어야 함
- 각 항목의 메뉴가 해당 매장에 존재하고 isAvailable=true여야 함
- 각 항목의 수량은 1 이상
- totalAmount = SUM(각 항목의 quantity * unitPrice)
- menuName, unitPrice는 주문 시점의 메뉴 정보 스냅샷
- 주문 번호: `ORD-{YYYYMMDD}-{매장별 일일 순번 4자리}`
- ACTIVE 세션이 없으면 자동 생성 (BR-02-1)

### BR-03-2: 주문 상태 전이
- 허용 전이: PENDING → PREPARING → COMPLETED
- 역방향 전이 불가 (COMPLETED → PREPARING 등)
- 상태 변경 시 SSE 이벤트 발행

### BR-03-3: 주문 삭제
- 관리자만 삭제 가능
- 모든 상태의 주문 삭제 가능
- 삭제 시 OrderItem도 CASCADE 삭제
- 삭제 시 SSE 이벤트 발행

### BR-03-4: 주문 조회 (고객)
- 현재 ACTIVE 세션의 주문만 조회 가능
- COMPLETED 세션의 주문은 조회 불가

### BR-03-5: 과거 주문 이력 조회 (관리자)
- OrderHistory 테이블에서 조회
- 테이블별, 날짜별 필터링 가능
- completedAt 기준 내림차순 정렬

---

## BR-04: 메뉴 규칙

### BR-04-1: 메뉴 등록
- 필수 필드: name, price, categoryId
- price >= 0 (정수, 원 단위)
- categoryId는 해당 매장의 카테고리여야 함
- 이미지는 선택사항 (파일 업로드 시 URL 저장)

### BR-04-2: 메뉴 수정
- 기존 주문의 스냅샷에는 영향 없음 (OrderItem에 스냅샷 저장)
- 동일한 필드 검증 적용

### BR-04-3: 메뉴 삭제
- 메뉴 삭제 시 isAvailable=false로 소프트 삭제 권장
- 기존 OrderItem의 menuId 참조 무결성 유지

### BR-04-4: 메뉴 순서 변경
- sortOrder 값을 업데이트하여 노출 순서 변경
- 동일 카테고리 내에서 순서 관리

---

## BR-05: SSE 이벤트 규칙

### BR-05-1: 이벤트 유형
| 이벤트 | 대상 | 데이터 |
|---|---|---|
| ORDER_CREATED | 매장 관리자 | 새 주문 전체 정보 |
| ORDER_STATUS_CHANGED | 매장 관리자 + 해당 테이블 고객 | 주문 ID, 새 상태 |
| ORDER_DELETED | 매장 관리자 + 해당 테이블 고객 | 주문 ID |
| SESSION_COMPLETED | 해당 테이블 고객 | 테이블 ID, 세션 ID |

### BR-05-2: 구독 범위
- 관리자: 매장 전체 주문 이벤트 구독 (storeId 기반)
- 고객: 자신의 테이블 주문 이벤트만 구독 (storeId + tableId 기반)

### BR-05-3: 연결 관리
- 클라이언트 연결 끊김 시 구독 자동 해제
- 클라이언트 자동 재연결 시 새 구독 등록

---

## BR-06: 파일 업로드 규칙

### BR-06-1: 이미지 업로드
- 허용 형식: JPEG, PNG, GIF, WebP
- 최대 파일 크기: 5MB
- 저장 경로: `uploads/` 디렉토리 (로컬 개발 환경)
- 파일명: UUID 기반 고유 파일명 생성
- 반환값: 업로드된 파일의 접근 URL

---

## BR-07: 멀티테넌트 규칙

### BR-07-1: 데이터 격리
- 모든 DB 쿼리에 storeId 조건 필수
- JWT 토큰의 storeId와 요청 경로의 storeId 일치 검증
- 교차 매장 데이터 접근 차단

### BR-07-2: 권한 검증
| 작업 | 필요 권한 |
|---|---|
| 관리자 계정 생성 | OWNER |
| 테이블 초기 설정 | OWNER 또는 MANAGER |
| 메뉴 CRUD | OWNER |
| 주문 상태 변경 | OWNER 또는 MANAGER |
| 주문 삭제 | OWNER 또는 MANAGER |
| 이용 완료 처리 | OWNER 또는 MANAGER |
| 과거 주문 조회 | OWNER 또는 MANAGER |
