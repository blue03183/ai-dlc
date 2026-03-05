# 요구사항 명확화 질문

아래 질문에 답변해 주세요. 각 질문의 `[Answer]:` 태그 뒤에 선택지 문자를 입력해 주세요.
제공된 선택지가 맞지 않으면 마지막 옵션(Other)을 선택하고 설명을 추가해 주세요.

---

## Question 1
프론트엔드(고객용 + 관리자용) 기술 스택으로 어떤 것을 선호하시나요?

A) React + TypeScript
B) Vue.js + TypeScript
C) Next.js (React 기반 풀스택 프레임워크)
D) Svelte + TypeScript
E) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2
백엔드 기술 스택으로 어떤 것을 선호하시나요?

A) Node.js + Express + TypeScript
B) Node.js + NestJS + TypeScript
C) Python + FastAPI
D) Java + Spring Boot
E) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 3
데이터베이스로 어떤 것을 사용하시겠습니까?

A) PostgreSQL
B) MySQL
C) MongoDB
D) SQLite (개발/소규모 매장용)
E) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 4
배포 환경은 어떻게 계획하고 계신가요?

A) AWS 클라우드 (EC2, RDS, S3 등)
B) 로컬 서버 / 온프레미스
C) Docker 컨테이너 기반 (Docker Compose)
D) 배포 환경은 아직 미정 — 로컬 개발 환경만 우선 구성
E) Other (please describe after [Answer]: tag below)

[Answer]: D

## Question 5
고객용 인터페이스와 관리자용 인터페이스를 어떻게 구성하시겠습니까?

A) 하나의 웹 애플리케이션에서 라우팅으로 분리 (모노리스 프론트엔드)
B) 별도의 웹 애플리케이션으로 분리 (고객용 앱 + 관리자용 앱)
C) 고객용은 모바일 웹, 관리자용은 데스크톱 웹으로 별도 구성
D) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 6
매장(store)은 단일 매장만 지원하면 되나요, 아니면 다중 매장(멀티테넌트)을 지원해야 하나요?

A) 단일 매장만 지원 (MVP 단계)
B) 다중 매장 지원 (멀티테넌트 — 각 매장이 독립적으로 운영)
C) 단일 매장으로 시작하되, 향후 다중 매장 확장을 고려한 설계
D) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 7
동시 접속 사용자 규모는 어느 정도로 예상하시나요?

A) 소규모 (테이블 10개 이하, 관리자 1~2명)
B) 중규모 (테이블 10~50개, 관리자 3~5명)
C) 대규모 (테이블 50개 이상, 관리자 5명 이상)
D) 규모는 아직 미정 — 소규모로 시작
E) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 8
메뉴 이미지는 어떻게 관리하시겠습니까?

A) 외부 이미지 URL 직접 입력 (별도 이미지 호스팅 사용)
B) 서버에 이미지 파일 업로드 기능 구현
C) 클라우드 스토리지(S3 등)에 업로드 후 URL 저장
D) MVP에서는 이미지 URL 직접 입력만 지원
E) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 9
관리자 계정 관리는 어떻게 하시겠습니까?

A) 시스템에서 관리자 계정을 직접 생성/관리 (자체 회원가입)
B) 초기 관리자 계정은 DB에 직접 시딩(seed)하고, 추가 계정은 기존 관리자가 생성
C) 매장당 관리자 1명만 지원 (DB 시딩)
D) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 10
테스트 전략은 어떻게 하시겠습니까?

A) 단위 테스트 + 통합 테스트 모두 포함
B) 단위 테스트만 포함
C) 테스트는 나중에 추가 — 코드 생성에 집중
D) E2E 테스트까지 포함 (Cypress, Playwright 등)
E) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 11: Security Extensions
이 프로젝트에 보안 확장 규칙(SECURITY rules)을 적용해야 하나요?

A) Yes — 모든 SECURITY 규칙을 blocking constraint로 적용 (프로덕션 수준 애플리케이션에 권장)
B) No — 모든 SECURITY 규칙 건너뛰기 (PoC, 프로토타입, 실험적 프로젝트에 적합)
C) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 12
주문 상태 실시간 업데이트(고객 화면)를 MVP에 포함하시겠습니까?

A) Yes — 고객 화면에서도 SSE로 주문 상태 실시간 업데이트 포함
B) No — 고객 화면은 수동 새로고침 또는 페이지 이동 시 업데이트
C) 관리자 화면의 SSE만 구현하고, 고객 화면은 폴링(polling)으로 구현
D) Other (please describe after [Answer]: tag below)

[Answer]: A
