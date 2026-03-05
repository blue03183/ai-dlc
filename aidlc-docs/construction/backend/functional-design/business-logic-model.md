# 테이블오더 서비스 — 비즈니스 로직 모델

---

## 1. 주문 생성 플로우

```
입력: storeId, tableId, items[{menuId, quantity}]

1. 매장 존재 확인
2. 테이블이 해당 매장 소속인지 확인
3. 각 menuId가 해당 매장에 존재하고 isAvailable=true인지 확인
4. 각 항목의 quantity >= 1 확인
5. ACTIVE 세션 조회
   - 없으면 → 새 TableSession 생성 (status=ACTIVE)
   - 있으면 → 기존 세션 사용
6. 주문 번호 생성 (ORD-{YYYYMMDD}-{순번})
7. Order 생성 (status=PENDING)
8. OrderItem 생성 (menuName, unitPrice 스냅샷)
9. totalAmount 계산 및 저장
10. SSE 이벤트 발행 (ORDER_CREATED)
11. 주문 정보 반환

출력: {orderId, orderNumber, items, totalAmount, status, createdAt}
```

---

## 2. 주문 상태 변경 플로우

```
입력: storeId, orderId, newStatus

1. 주문이 해당 매장 소속인지 확인
2. 현재 상태 확인
3. 상태 전이 유효성 검증
   - PENDING → PREPARING: 허용
   - PREPARING → COMPLETED: 허용
   - 그 외: 거부 (400 에러)
4. 상태 업데이트
5. SSE 이벤트 발행 (ORDER_STATUS_CHANGED)
6. 업데이트된 주문 반환

출력: {orderId, status, updatedAt}
```

---

## 3. 테이블 이용 완료 플로우

```
입력: storeId, tableId

1. 테이블이 해당 매장 소속인지 확인
2. ACTIVE 세션 조회
   - 없으면 → 에러 (이미 완료되었거나 세션 없음)
3. 해당 세션의 모든 Order 조회
4. 각 Order + OrderItem을 OrderHistory로 변환
   - orderItems: JSON 스냅샷 [{menuName, quantity, unitPrice, subtotal}]
   - completedAt: 현재 시각
5. OrderHistory 일괄 저장
6. 원본 Order + OrderItem 일괄 삭제
7. TableSession.status → COMPLETED, completedAt 기록
8. SSE 이벤트 발행 (SESSION_COMPLETED)

출력: {success: true, completedAt}
```

---

## 4. 관리자 로그인 플로우

```
입력: storeIdentifier, username, password

1. storeIdentifier로 매장 조회
   - 없으면 → 401 에러
2. (storeId, username)으로 관리자 조회
   - 없으면 → 401 에러
3. 계정 잠금 확인
   - lockedUntil > 현재시각 → 403 에러 (잠금 중)
4. 비밀번호 bcrypt 검증
   - 실패 → loginAttempts++
     - loginAttempts >= 5 → lockedUntil = 현재 + 15분
     - 401 에러
   - 성공 → loginAttempts = 0, lockedUntil = null
5. JWT 토큰 생성 (payload: adminId, storeId, role, exp: 16h)
6. 토큰 반환

출력: {token, admin: {id, username, role, storeName}}
```

---

## 5. 테이블 태블릿 로그인 플로우

```
입력: storeIdentifier, tableNumber, password

1. storeIdentifier로 매장 조회
2. (storeId, tableNumber)로 테이블 조회
3. 비밀번호 bcrypt 검증
4. 현재 ACTIVE 세션 조회 (있으면 포함, 없으면 null)
5. JWT 토큰 생성 (payload: tableId, storeId, tableNumber, sessionId?, exp: 16h)
6. 토큰 반환

출력: {token, table: {id, tableNumber, storeName}, session: {id, status}?}
```

---

## 6. 메뉴 CRUD 플로우

### 등록
```
입력: storeId, {name, price, categoryId, description?, imageUrl?}

1. categoryId가 해당 매장 소속인지 확인
2. 필수 필드 검증 (name, price, categoryId)
3. price >= 0 검증
4. sortOrder = 해당 카테고리 내 최대 sortOrder + 1
5. Menu 생성
6. 생성된 메뉴 반환
```

### 순서 변경
```
입력: storeId, [{menuId, sortOrder}]

1. 모든 menuId가 해당 매장 소속인지 확인
2. sortOrder 일괄 업데이트
3. 성공 반환
```

---

## 7. SSE 이벤트 관리 모델

```
EventService 내부 구조:

storeSubscriptions: Map<storeId, Set<Response>>
  - 관리자 SSE 연결 관리
  - 매장별로 구독자 그룹화

tableSubscriptions: Map<`${storeId}-${tableId}`, Set<Response>>
  - 고객 SSE 연결 관리
  - 매장+테이블별로 구독자 그룹화

이벤트 발행 시:
  1. storeSubscriptions[storeId]의 모든 구독자에게 전송
  2. tableSubscriptions[storeId-tableId]의 모든 구독자에게 전송 (해당 시)
```
