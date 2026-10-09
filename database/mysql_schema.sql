-- ==============================================================================
-- AI WARDROBE SUGGESTOR - MYSQL DATABASE SCHEMA
-- Version: 1.0.0
-- Dialect: MySQL 8.0+
-- Description:
--   1) Table 1: users (Login credentials, role management, profile)
--   2) S3 Storage metadata schema for storing images of clothes across all users
--   3) Table 2: clothes (Attributes matching fashion-dataset styles.csv + S3 image URLs + user_id FK)
-- ==============================================================================

-- Create Database if not exists
CREATE DATABASE IF NOT EXISTS ai_wardrobe_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ai_wardrobe_db;

-- ------------------------------------------------------------------------------
-- 1) TABLE 1: USERS (LOGIN & AUTHENTICATION)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS clothes;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id VARCHAR(36) NOT NULL,                                -- UUID v4 format
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,                    -- Argon2id or bcrypt hash
  full_name VARCHAR(150) NOT NULL,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  avatar_url TEXT NULL,
  gender_preference VARCHAR(30) NULL DEFAULT 'Unisex',    -- Preferred styling demographic
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  last_login_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Primary & Unique Constraints
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),

  -- Indexes for auth lookup speed
  INDEX idx_users_email (email),
  INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ------------------------------------------------------------------------------
-- 2) S3 STORAGE BUCKET SPECIFICATION & REFERENCE SCHEMA
-- S3 Bucket Name: wardrobe-user-clothes
-- S3 Key Pattern: users/{user_id}/clothes/{cloth_id}/{image_type}.webp
-- ------------------------------------------------------------------------------


-- ------------------------------------------------------------------------------
-- 3) TABLE 2: CLOTHES (DATASET ATTRIBUTES + S3 IMAGE URL + USER FOREIGN KEY)
-- Attributes match styles.csv:
-- (gender, masterCategory, subCategory, articleType, baseColour, season, year, usage, productDisplayName)
-- ------------------------------------------------------------------------------
CREATE TABLE clothes (
  id VARCHAR(36) NOT NULL,                                -- UUID v4 format
  user_id VARCHAR(36) NOT NULL,                           -- Foreign key referencing users(id)

  -- Dataset Attributes (Exact mapping to styles.csv)
  gender VARCHAR(50) NOT NULL,                            -- 'Men', 'Women', 'Boys', 'Girls', 'Unisex'
  master_category VARCHAR(100) NOT NULL,                  -- 'Apparel', 'Accessories', 'Footwear', etc.
  sub_category VARCHAR(100) NOT NULL,                     -- 'Topwear', 'Bottomwear', 'Shoes', etc.
  article_type VARCHAR(100) NOT NULL,                     -- 'Shirts', 'Tshirts', 'Jeans', 'Kurtas', etc.
  base_colour VARCHAR(60) NOT NULL,                       -- 'Navy Blue', 'Black', 'White', 'Blue', etc.
  season VARCHAR(50) NOT NULL,                            -- 'Summer', 'Winter', 'Fall', 'Spring', 'All-Season'
  year INT NULL,                                          -- Release / Catalog year (e.g., 2011, 2024)
  usage_type VARCHAR(100) NOT NULL,                       -- 'Casual', 'Smart Casual', 'Formal', 'Sports', 'Ethnic', 'Party'
  product_display_name VARCHAR(255) NOT NULL,             -- Full product title from dataset

  -- S3 Storage Image References (Requirement 2 & 3)
  s3_bucket VARCHAR(100) NOT NULL DEFAULT 'wardrobe-user-clothes',
  s3_key VARCHAR(500) NOT NULL,                           -- S3 Object path (e.g. users/{user_id}/clothes/{id}/raw.jpg)
  s3_image_url TEXT NOT NULL,                             -- Public or CloudFront CDN URL matching S3 image
  s3_cropped_key VARCHAR(500) NULL,                       -- S3 Object path for SAM-2 background removed crop
  s3_cropped_url TEXT NULL,                               -- URL for isolated garment image in S3

  -- Computer Vision & Stylist Enriched Attributes
  color_hex VARCHAR(10) NULL,                             -- Extracted hex color (e.g. #1E3A8A)
  material VARCHAR(100) NULL,                             -- Fabric texture (e.g. 'Oxford Cotton', 'Denim')
  pattern VARCHAR(60) NULL DEFAULT 'Solid',               -- 'Solid', 'Check', 'Striped', 'Floral'
  style_aesthetic VARCHAR(60) NULL DEFAULT 'Classic',     -- 'Old Money', 'Minimal', 'Streetwear', etc.
  ai_tags JSON NULL,                                      -- Computer vision tags ['Tailored', 'Collar', 'Lightweight']
  ai_status ENUM('pending', 'processed', 'flagged') NOT NULL DEFAULT 'processed',
  usage_count INT NOT NULL DEFAULT 0,
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Primary Key
  PRIMARY KEY (id),

  -- Foreign Key Constraint (Cascades on user deletion)
  CONSTRAINT fk_clothes_user_id
    FOREIGN KEY (user_id)
    REFERENCES users (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  -- Performance Indexes for Recommendation Engine Queries
  INDEX idx_clothes_user_id (user_id),
  INDEX idx_clothes_article_type (article_type),
  INDEX idx_clothes_gender (gender),
  INDEX idx_clothes_sub_category (sub_category),
  INDEX idx_clothes_base_colour (base_colour),
  INDEX idx_clothes_season (season),
  INDEX idx_clothes_usage_type (usage_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
