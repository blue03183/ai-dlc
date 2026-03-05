-- 테이블오더 서비스 초기 스키마 + 시드 데이터

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

CREATE TABLE IF NOT EXISTS store (
  id INT AUTO_INCREMENT PRIMARY KEY,
  store_identifier VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE INDEX idx_store_identifier (store_identifier)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin (
  id INT AUTO_INCREMENT PRIMARY KEY,
  store_id INT NOT NULL,
  username VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('OWNER','MANAGER') NOT NULL DEFAULT 'MANAGER',
  login_attempts INT NOT NULL DEFAULT 0,
  locked_until DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE INDEX idx_admin_store_username (store_id, username),
  INDEX idx_admin_store (store_id),
  FOREIGN KEY (store_id) REFERENCES store(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `table_info` (
  id INT AUTO_INCREMENT PRIMARY KEY,
  store_id INT NOT NULL,
  table_number INT NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE INDEX idx_table_store_number (store_id, table_number),
  INDEX idx_table_store (store_id),
  FOREIGN KEY (store_id) REFERENCES store(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS table_session (
  id INT AUTO_INCREMENT PRIMARY KEY,
  store_id INT NOT NULL,
  table_id INT NOT NULL,
  status ENUM('ACTIVE','COMPLETED') NOT NULL DEFAULT 'ACTIVE',
  started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME NULL,
  INDEX idx_session_table_status (table_id, status),
  INDEX idx_session_store (store_id),
  FOREIGN KEY (store_id) REFERENCES store(id),
  FOREIGN KEY (table_id) REFERENCES table_info(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS category (
  id INT AUTO_INCREMENT PRIMARY KEY,
  store_id INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category_store_order (store_id, sort_order),
  UNIQUE INDEX idx_category_store_name (store_id, name),
  FOREIGN KEY (store_id) REFERENCES store(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS menu (
  id INT AUTO_INCREMENT PRIMARY KEY,
  store_id INT NOT NULL,
  category_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  price INT NOT NULL CHECK(price >= 0),
  description TEXT NULL,
  image_url VARCHAR(500) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_menu_store_category_order (store_id, category_id, sort_order),
  INDEX idx_menu_store (store_id),
  FOREIGN KEY (store_id) REFERENCES store(id),
  FOREIGN KEY (category_id) REFERENCES category(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `order` (
  id INT AUTO_INCREMENT PRIMARY KEY,
  store_id INT NOT NULL,
  table_id INT NOT NULL,
  session_id INT NOT NULL,
  order_number VARCHAR(20) NOT NULL,
  status ENUM('PENDING','PREPARING','COMPLETED') NOT NULL DEFAULT 'PENDING',
  total_amount INT NOT NULL CHECK(total_amount >= 0),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_order_store_table_session (store_id, table_id, session_id),
  INDEX idx_order_store_status (store_id, status),
  INDEX idx_order_store_created (store_id, created_at DESC),
  INDEX idx_order_session (session_id),
  FOREIGN KEY (store_id) REFERENCES store(id),
  FOREIGN KEY (table_id) REFERENCES table_info(id),
  FOREIGN KEY (session_id) REFERENCES table_session(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_item (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  menu_id INT NOT NULL,
  menu_name VARCHAR(100) NOT NULL,
  quantity INT NOT NULL CHECK(quantity > 0),
  unit_price INT NOT NULL CHECK(unit_price >= 0),
  subtotal INT NOT NULL,
  INDEX idx_orderitem_order (order_id),
  FOREIGN KEY (order_id) REFERENCES `order`(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_id) REFERENCES menu(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  store_id INT NOT NULL,
  table_id INT NOT NULL,
  session_id INT NOT NULL,
  order_number VARCHAR(20) NOT NULL,
  order_items JSON NOT NULL,
  total_amount INT NOT NULL,
  ordered_at DATETIME NOT NULL,
  completed_at DATETIME NOT NULL,
  INDEX idx_history_store_table_completed (store_id, table_id, completed_at DESC),
  INDEX idx_history_store_completed (store_id, completed_at DESC),
  FOREIGN KEY (store_id) REFERENCES store(id),
  FOREIGN KEY (table_id) REFERENCES table_info(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 시드 데이터
-- ============================================

-- 매장 (storeIdentifier: 'demo-store')
INSERT INTO store (store_identifier, name) VALUES ('demo-store', '데모 매장');

-- OWNER 관리자 (비밀번호: admin123 → bcrypt 해시)
-- $2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36zQKz0OGKIyv0TLYbGzCGG = 'admin123'
INSERT INTO admin (store_id, username, password, role)
VALUES (1, 'owner', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36zQKz0OGKIyv0TLYbGzCGG', 'OWNER');
