-- ============================================
-- 개발용 시드 데이터
-- init.sql 실행 후 사용 (매장, OWNER 계정은 이미 존재)
-- ============================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- MANAGER 계정 (비밀번호: admin123)
INSERT IGNORE INTO admin (store_id, username, password, role)
VALUES (1, 'manager1', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36zQKz0OGKIyv0TLYbGzCGG', 'MANAGER');

-- 테이블 5개 (비밀번호: table123)
-- $2b$10$8KzaNdKIMyOkASCBkeAdleTSrdSYmqJOCpxPQ7GUfElXxBTq/WFHK = 'table123'
INSERT IGNORE INTO table_info (store_id, table_number, password) VALUES
(1, 1, '$2b$10$8KzaNdKIMyOkASCBkeAdleTSrdSYmqJOCpxPQ7GUfElXxBTq/WFHK'),
(1, 2, '$2b$10$8KzaNdKIMyOkASCBkeAdleTSrdSYmqJOCpxPQ7GUfElXxBTq/WFHK'),
(1, 3, '$2b$10$8KzaNdKIMyOkASCBkeAdleTSrdSYmqJOCpxPQ7GUfElXxBTq/WFHK'),
(1, 4, '$2b$10$8KzaNdKIMyOkASCBkeAdleTSrdSYmqJOCpxPQ7GUfElXxBTq/WFHK'),
(1, 5, '$2b$10$8KzaNdKIMyOkASCBkeAdleTSrdSYmqJOCpxPQ7GUfElXxBTq/WFHK');

-- 카테고리
INSERT IGNORE INTO category (store_id, name, sort_order) VALUES
(1, '추천 메뉴', 1),
(1, '메인 요리', 2),
(1, '사이드', 3),
(1, '음료', 4);

-- 메뉴
INSERT IGNORE INTO menu (store_id, category_id, name, price, description, sort_order, is_available) VALUES
-- 추천 메뉴
(1, 1, '김치찌개', 9000, '돼지고기와 묵은지로 끓인 김치찌개', 1, TRUE),
(1, 1, '된장찌개', 8000, '두부와 야채가 들어간 된장찌개', 2, TRUE),
(1, 1, '제육볶음', 11000, '매콤한 돼지고기 제육볶음', 3, TRUE),
-- 메인 요리
(1, 2, '불고기', 13000, '양념 소불고기', 1, TRUE),
(1, 2, '삼겹살 구이', 15000, '국내산 삼겹살 1인분', 2, TRUE),
(1, 2, '비빔밥', 9000, '야채와 고추장의 비빔밥', 3, TRUE),
(1, 2, '순두부찌개', 8500, '부드러운 순두부찌개', 4, TRUE),
-- 사이드
(1, 3, '계란말이', 5000, '부드러운 계란말이', 1, TRUE),
(1, 3, '감자전', 6000, '바삭한 감자전', 2, TRUE),
(1, 3, '공기밥', 1000, '흰 쌀밥', 3, TRUE),
-- 음료
(1, 4, '콜라', 2000, NULL, 1, TRUE),
(1, 4, '사이다', 2000, NULL, 2, TRUE),
(1, 4, '맥주', 5000, '생맥주 500ml', 3, TRUE),
(1, 4, '소주', 5000, '참이슬', 4, TRUE);
