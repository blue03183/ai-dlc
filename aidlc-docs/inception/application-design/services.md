# 테이블오더 서비스 — 서비스 정의 및 오케스트레이션

---

## 서비스 아키텍처 개요

```
+------------------+     +-------------------+
|  고객용 React    |     |  관리자용 React    |
|  (Customer App)  |     |  (Admin App)      |
+--------+---------+     +---------+---------+
         |                         |
         |    REST API + SSE       |
         +------------+------------+
                      |
         +------------+------------+
         |     NestJS Backend      |
         |                         |
         |  +-------------------+  |
         |  |   AuthService     |  |
         |  +-------------------+  |
         |  |   StoreService    |  |
         |  +-------------------+  |
         |  |   TableService    |  |
         |  +-------------------+  |
         |  |   MenuService     |  |
         |  +-------------------+  |
         |  |   OrderService    |  |
         |  +-------------------+  |
         |  |   EventService    |  |
         |  +-------------------+  |
         |  |   AdminService    |  |
         |  +-------------------+  |
         |  |   UploadService   |  |
         |  +-------------------+  |
         +------------+------------+
                      |
              +-------+-------+
              |     MySQL     |
              +---------------+
```

---

## 핵심 오케스트레이션 패턴

### 1. 주문 생성 플로우
```
고객 앱 → OrderController.create()
  → AuthGuard (테이블 인증 확인)
  → OrderService.create()
    → 메뉴 유효성 검증 (MenuService)
    → 세션 유효성 검증 (TableService)
    → 주문 저장 (DB)
    → EventService.emitOrderCreated()
      → 관리자 SSE 스트림으로 전송
  → 응답 (주문 번호)
```

### 2. 주문 상태 변경 플로우
```
관리자 앱 → OrderController.updateStatus()
  → AuthGuard (관리자 인증 확인)
  → OrderService.updateStatus()
    → 주문 상태 업데이트 (DB)
    → EventService.emitOrderStatusChanged()
      → 관리자 SSE 스트림으로 전송
      → 해당 테이블 고객 SSE 스트림으로 전송
  → 응답 (업데이트된 주문)
```

### 3. 테이블 이용 완료 플로우
```
관리자 앱 → TableController.completeSession()
  → AuthGuard (관리자 인증 확인)
  → TableService.completeSession()
    → OrderService.moveToHistory() (현재 세션 주문 → 과거 이력)
    → 테이블 세션 종료 (DB)
    → EventService.emitSessionCompleted()
  → 응답 (성공)
```

### 4. SSE 연결 관리
```
클라이언트 → EventController.subscribe()
  → AuthGuard (인증 확인)
  → EventService.subscribe()
    → 매장별/테이블별 구독 채널 등록
    → 이벤트 발생 시 해당 채널 구독자에게 전송
    → 연결 종료 시 구독 해제
```

---

## 멀티테넌트 전략

- 모든 API 경로에 `:storeId` 포함
- 모든 서비스 메서드에 `storeId` 파라미터 필수
- DB 쿼리 시 항상 `storeId` 조건 포함
- JWT 토큰에 `storeId` 포함하여 교차 매장 접근 방지
