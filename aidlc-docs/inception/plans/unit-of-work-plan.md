# Unit of Work Plan — 테이블오더 서비스

## 개요
테이블오더 서비스를 3개 유닛으로 분해합니다: 백엔드 API, 고객용 프론트엔드, 관리자용 프론트엔드.
4명의 개발자가 참여하며, 각 개발자의 담당 영역을 명시합니다.

---

## 명확화 질문

### Question 1
프로젝트 디렉토리 구조를 어떻게 구성하시겠습니까?

A) 모노레포 — 하나의 루트에 `backend/`, `customer-app/`, `admin-app/` 디렉토리로 분리
B) 별도 레포지토리 — 각 유닛을 독립 레포지토리로 관리
C) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
유닛 간 개발 순서를 어떻게 하시겠습니까?

A) 백엔드 먼저 → 고객 프론트엔드 → 관리자 프론트엔드 (순차적)
B) 백엔드 + 프론트엔드 동시 개발 (병렬, API 스펙 기반)
C) Other (please describe after [Answer]: tag below)

[Answer]: B

### Question 3
4명의 개발자를 어떻게 배치하시겠습니까? 아래 옵션 중 선택하거나 직접 구성해 주세요.

A) 백엔드 2명 + 고객 프론트엔드 1명 + 관리자 프론트엔드 1명
B) 백엔드 1명 + 고객 프론트엔드 1명 + 관리자 프론트엔드 1명 + 풀스택(공통/통합) 1명
C) 백엔드 2명 + 프론트엔드 2명 (프론트엔드 2명이 고객/관리자 앱을 함께 개발)
D) 백엔드 1명 + 고객 프론트엔드 1명 + 관리자 프론트엔드 1명 + 테스트/인프라 1명
E) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4
백엔드 개발자가 2명인 경우, 백엔드 모듈을 어떻게 분담하시겠습니까? (Question 3에서 A 또는 C를 선택한 경우에만 답변)

A) 기능 도메인별 분담 — 개발자1: Auth+Store+Admin+Table, 개발자2: Menu+Order+Event+Upload
B) 레이어별 분담 — 개발자1: API 컨트롤러+DTO, 개발자2: 서비스+엔티티+DB
C) 핵심/부가 분담 — 개발자1: Order+Event(핵심), 개발자2: Auth+Menu+Table+Admin+Upload(부가)
D) 해당 없음 (백엔드 1명)
E) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## 실행 단계

- [x] Step 1: 유닛 정의 — unit-of-work.md 생성
  - [x] Unit 1: 백엔드 API 서버 정의
  - [x] Unit 2: 고객용 프론트엔드 정의
  - [x] Unit 3: 관리자용 프론트엔드 정의
  - [x] 코드 조직 전략 문서화
  - [x] 개발자 배치 및 담당 영역 명시

- [x] Step 2: 유닛 의존성 — unit-of-work-dependency.md 생성
  - [x] 유닛 간 의존성 매트릭스
  - [x] 개발 순서 및 통합 전략

- [x] Step 3: 스토리-유닛 매핑 — unit-of-work-story-map.md 생성
  - [x] 각 스토리를 해당 유닛에 매핑
  - [x] 크로스 유닛 스토리 식별
  - [x] 개발자별 담당 스토리 매핑

- [x] Step 4: 최종 검증
  - [x] 모든 스토리가 유닛에 할당되었는지 확인
  - [x] 유닛 경계 및 의존성 검증
  - [x] 개발자별 업무량 균형 검증
