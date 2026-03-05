# 테이블오더 서비스 — Unit of Work 의존성

---

## 유닛 간 의존성 매트릭스

| 유닛 | 의존 대상 | 의존 유형 | 설명 |
|---|---|---|---|
| Unit 2 (고객 앱) | Unit 1 (백엔드) | REST API + SSE | 메뉴 조회, 주문 생성/조회, 실시간 상태 |
| Unit 3 (관리자 앱) | Unit 1 (백엔드) | REST API + SSE + Multipart | 모든 관리 기능, 실시간 모니터링, 이미지 업로드 |
| Unit 1 (백엔드) | (없음) | — | 독립적, DB만 의존 |

---

## 개발 순서 및 통합 전략

### Phase 1: 기반 구축 (병렬)
```
BE-Dev1: NestJS 프로젝트 설정, DB 스키마, Auth/Store 모듈
BE-Dev2: Menu/Order 엔티티 및 서비스 기본 구조
FE-Dev1: React 프로젝트 설정, 라우팅, 공통 컴포넌트
FE-Dev2: React 프로젝트 설정, 라우팅, 공통 컴포넌트
```

### Phase 2: 핵심 기능 (병렬)
```
BE-Dev1: Auth API (관리자 로그인, 테이블 로그인), Table API
BE-Dev2: Menu API (CRUD), Order API (생성, 조회, 상태 변경), Event SSE
FE-Dev1: 메뉴 화면, 장바구니, 주문 생성 (Mock API → 실제 API 연동)
FE-Dev2: 로그인, 대시보드, 주문 모니터링 (Mock API → 실제 API 연동)
```

### Phase 3: 통합 및 완성 (병렬 + 통합)
```
BE-Dev1: Admin API, Table 세션 관리, 이용 완료
BE-Dev2: Upload API, 과거 주문 이력, SSE 최적화
FE-Dev1: SSE 연동, 주문 내역 조회, 실시간 상태 업데이트
FE-Dev2: 메뉴 관리, 테이블 관리, 관리자 계정 관리, SSE 연동
```

### Phase 4: 테스트 및 마무리
```
전체: 통합 테스트, 버그 수정, 코드 리뷰
```

---

## 통합 포인트

| 통합 포인트 | 관련 유닛 | 시점 | 검증 항목 |
|---|---|---|---|
| 인증 API | Unit 1 ↔ Unit 2, 3 | Phase 2 | JWT 발급/검증, 자동 로그인 |
| 메뉴 API | Unit 1 ↔ Unit 2, 3 | Phase 2 | 메뉴 조회, CRUD |
| 주문 API | Unit 1 ↔ Unit 2, 3 | Phase 2 | 주문 생성, 조회, 상태 변경 |
| SSE 이벤트 | Unit 1 ↔ Unit 2, 3 | Phase 3 | 실시간 주문 알림, 상태 업데이트 |
| 파일 업로드 | Unit 1 ↔ Unit 3 | Phase 3 | 이미지 업로드/표시 |
| 테이블 세션 | Unit 1 ↔ Unit 2, 3 | Phase 3 | 이용 완료, 세션 리셋 |
