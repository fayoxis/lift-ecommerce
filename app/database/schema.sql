-- ============================================================
--  LIFT E-Commerce — Database Schema
-- ============================================================
--  This schema mirrors the data model the frontend already uses
--  (currently simulated in the browser via localStorage — see the
--  mapping table in database/README.md). Wiring server/models and
--  server/controllers to these tables turns the demo into a real,
--  persistent backend without changing any frontend markup.
--
--  Dialect: MySQL 8 / MariaDB. Notes for PostgreSQL are given
--  inline where syntax differs (SERIAL vs AUTO_INCREMENT, etc).
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- 1. USERS
--    localStorage keys: launchpad_currentUser, launchpad_users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username        VARCHAR(60)  NOT NULL UNIQUE,
  email           VARCHAR(190) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  first_name      VARCHAR(80),
  last_name       VARCHAR(80),
  phone           VARCHAR(30),
  country         VARCHAR(80),
  avatar_url      TEXT,
  banner_url      TEXT,
  bio             VARCHAR(280),
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 2. CATEGORIES & PRODUCTS
--    Frontend source of truth today: CATALOG array in js/lift-shop.js
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(80) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
  id              VARCHAR(40) PRIMARY KEY,          -- slug, e.g. "smart-tv"
  name            VARCHAR(150) NOT NULL,
  category_id     INT UNSIGNED,
  price           DECIMAL(12,2) NOT NULL,           -- FCFA, no decimals needed but kept for portability
  rating          DECIMAL(2,1) DEFAULT 0,
  location        VARCHAR(80),
  image_url       TEXT,
  sizes           VARCHAR(255),                     -- comma-separated, e.g. "S,M,L,XL,XXL"
  stock           INT UNSIGNED NOT NULL DEFAULT 0,
  is_active       TINYINT(1) NOT NULL DEFAULT 1,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 3. CART
--    localStorage key: lift_cart_v1  → { items:[{id,qty}], coupon }
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coupons (
  code            VARCHAR(30) PRIMARY KEY,
  discount_rate   DECIMAL(4,3) NOT NULL,             -- e.g. 0.100 = 10%
  is_active       TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cart_items (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         INT UNSIGNED NOT NULL,
  product_id      VARCHAR(40) NOT NULL,
  quantity        INT UNSIGNED NOT NULL DEFAULT 1,
  coupon_code     VARCHAR(30),
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_product (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (coupon_code) REFERENCES coupons(code) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 4. ORDERS
--    localStorage key: lift_orders_v1
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id              VARCHAR(30) PRIMARY KEY,           -- e.g. "LIFT-AB12C345"
  user_id         INT UNSIGNED NOT NULL,
  subtotal        DECIMAL(12,2) NOT NULL,
  discount        DECIMAL(12,2) NOT NULL DEFAULT 0,
  total           DECIMAL(12,2) NOT NULL,
  payment_method  ENUM('mtn','orange','card','cash') NOT NULL,
  phone           VARCHAR(30),
  status          ENUM('processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'processing',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_items (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id        VARCHAR(30) NOT NULL,
  product_id      VARCHAR(40) NOT NULL,
  product_name    VARCHAR(150) NOT NULL,             -- snapshot at purchase time
  unit_price      DECIMAL(12,2) NOT NULL,             -- snapshot at purchase time
  quantity        INT UNSIGNED NOT NULL,
  line_total      DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 5. SOCIAL: follows, posts, likes, comments
--    localStorage keys: lift_follows_v1, lift_posts_v1
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS follows (
  follower_id     INT UNSIGNED NOT NULL,
  following_id    INT UNSIGNED NOT NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (follower_id, following_id),
  FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS posts (
  id              VARCHAR(30) PRIMARY KEY,           -- e.g. "POST-AB12C345"
  author_id       INT UNSIGNED NOT NULL,
  type            ENUM('announcement','product','purchase') NOT NULL DEFAULT 'announcement',
  text            VARCHAR(1000),
  product_id      VARCHAR(40),
  image_url       TEXT,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS post_likes (
  post_id         VARCHAR(30) NOT NULL,
  user_id         INT UNSIGNED NOT NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (post_id, user_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS post_comments (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  post_id         VARCHAR(30) NOT NULL,
  author_id       INT UNSIGNED NOT NULL,
  text            VARCHAR(500) NOT NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 6. MESSAGING
--    localStorage key: lift_messages_v1
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS messages (
  id              VARCHAR(30) PRIMARY KEY,           -- e.g. "MSG-AB12C345"
  from_user_id    INT UNSIGNED NOT NULL,
  to_user_id      INT UNSIGNED NOT NULL,
  body            VARCHAR(2000) NOT NULL,
  is_read         TINYINT(1) NOT NULL DEFAULT 0,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_thread (from_user_id, to_user_id, created_at)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 7. NOTIFICATIONS
--    localStorage key: lift_notifications_v1
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id              VARCHAR(30) PRIMARY KEY,           -- e.g. "NOTIF-AB12C345"
  user_id         INT UNSIGNED NOT NULL,             -- recipient
  type            ENUM('order','message','follow','like','comment') NOT NULL,
  text            VARCHAR(255) NOT NULL,
  link            VARCHAR(255),                      -- relative page the notif deep-links to
  is_read         TINYINT(1) NOT NULL DEFAULT 0,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------
-- Seed: coupons currently hard-coded in js/lift-shop.js
-- ------------------------------------------------------------
INSERT INTO coupons (code, discount_rate) VALUES
  ('LIFT10', 0.10),
  ('WELCOME5', 0.05)
ON DUPLICATE KEY UPDATE discount_rate = VALUES(discount_rate);

-- ------------------------------------------------------------
-- Seed: starter categories (from CATALOG in js/lift-shop.js)
-- ------------------------------------------------------------
INSERT INTO categories (name) VALUES
  ('Apparel'), ('Footwear'), ('Bags'), ('Electronics'), ('Jewelry'),
  ('Beauty & Care'), ('Home & Kitchen'), ('Groceries'),
  ('Sports & Fitness'), ('Baby & Kids'), ('Books & Stationery'),
  ('Automotive & Tools')
ON DUPLICATE KEY UPDATE name = VALUES(name);
