# Story Generation Plan — 테이블오더 서비스

## 개요
테이블오더 서비스의 요구사항을 사용자 중심 스토리로 변환하기 위한 계획입니다.

---

## Part 1: 명확화 질문

아래 질문에 답변해 주세요. 각 질문의 `[Answer]:` 태그 뒤에 선택지 문자를 입력해 주세요.

### Question 1
사용자 스토리 분류(breakdown) 방식으로 어떤 접근을 선호하시나요?

A) User Journey 기반 — 사용자 워크플로우 흐름에 따라 스토리 구성 (예: 고객 입장 → 메뉴 탐색 → 장바구니 → 주문 → 확인)
B) Feature 기반 — 시스템 기능 단위로 스토리 구성 (예: 메뉴 관리, 주문 관리, 테이블 관리)
C) Persona 기반 — 사용자 유형별로 스토리 그룹화 (예: 고객 스토리, 관리자 스토리)
D) Epic 기반 — 대규모 Epic을 정의하고 하위 스토리로 분해
E) Other (please describe after [Answer]: tag below)

[Answer]: B

### Question 2
스토리의 세분화(granularity) 수준은 어느 정도가 적절한가요?

A) 큰 단위 — Epic 수준의 큰 스토리 (예: "고객으로서 메뉴를 보고 주문할 수 있다")
B) 중간 단위 — 기능별 스토리 (예: "고객으로서 카테고리별 메뉴를 탐색할 수 있다")
C) 작은 단위 — 세부 인터랙션별 스토리 (예: "고객으로서 메뉴 카드를 탭하면 상세 정보를 볼 수 있다")
D) Other (please describe after [Answer]: tag below)

[Answer]: B

### Question 3
Acceptance Criteria(인수 조건)의 형식은 어떤 것을 선호하시나요?

A) Given-When-Then (BDD 스타일) — 구조화된 시나리오 형식
B) 체크리스트 형식 — 간단한 조건 목록
C) 시나리오 서술형 — 자연어로 시나리오 설명
D) Other (please describe after [Answer]: tag below)

[Answer]: B

### Question 4
고객 페르소나를 어떻게 정의하면 좋을까요? 주요 고객 유형을 선택해 주세요.

A) 단일 페르소나 — "식당 고객" 하나로 통합
B) 연령대별 분류 — 디지털 친숙도가 다른 고객 유형 (젊은 층, 중장년층)
C) 이용 패턴별 분류 — 혼밥 고객, 단체 고객, 상습 방문 고객
D) 단일 페르소나로 하되, 특수 시나리오(디지털 미숙, 단체 주문 등)를 별도 스토리로 처리
E) Other (please describe after [Answer]: tag below)

[Answer]: C

### Question 5
관리자 페르소나는 어떻게 구분하시겠습니까?

A) 단일 페르소나 — "매장 관리자" 하나로 통합 (소규모 매장 기준)
B) 역할별 분류 — 매장 오너, 매니저, 홀 직원 등
C) 매장 오너와 일반 관리자 2단계로 구분
D) Other (please describe after [Answer]: tag below)

[Answer]: C

### Question 6
우선순위 체계는 어떻게 설정하시겠습니까?

A) MoSCoW (Must/Should/Could/Won't)
B) 높음/중간/낮음 3단계
C) 숫자 기반 (P0, P1, P2, P3)
D) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Part 2: Story Generation 실행 계획

아래 단계는 질문 답변 승인 후 순차적으로 실행됩니다.

### 실행 단계

- [x] Step 1: 페르소나 정의 — personas.md 생성
  - [x] 고객 페르소나 정의
  - [x] 관리자 페르소나 정의
  - [x] 페르소나별 목표, 동기, 불편사항 정리

- [x] Step 2: Epic 정의 — 주요 기능 영역별 Epic 구성 (Feature 기반으로 통합)
  - [x] 고객 Feature 목록 정의 (인증, 메뉴 조회, 장바구니, 주문)
  - [x] 관리자 Feature 목록 정의 (인증, 모니터링, 테이블 관리, 메뉴 관리)

- [x] Step 3: 사용자 스토리 작성 — stories.md 생성
  - [x] 고객용 스토리 작성 (INVEST 기준 준수)
  - [x] 관리자용 스토리 작성 (INVEST 기준 준수)
  - [x] 각 스토리에 Acceptance Criteria 포함 (체크리스트 형식)
  - [x] 각 스토리에 우선순위 태깅 (높음/중간/낮음)

- [x] Step 4: 페르소나-스토리 매핑
  - [x] 각 페르소나와 관련 스토리 연결
  - [x] 매핑 검증

- [x] Step 5: 최종 검증
  - [x] 모든 요구사항이 스토리로 커버되는지 확인 (커버리지 테이블 포함)
  - [x] INVEST 기준 준수 확인
  - [x] Acceptance Criteria 완전성 확인
