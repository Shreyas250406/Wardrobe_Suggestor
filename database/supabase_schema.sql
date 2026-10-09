-- ==============================================================================
-- AI WARDROBE SUGGESTOR - SUPABASE CLOUD (POSTGRESQL) SCHEMA
-- Version: 1.0.0
-- Dialect: PostgreSQL 15+ / Supabase Cloud
-- Description:
--   1) Table 1: users (Profiles linked to Supabase Auth or standalone login)
--   2) S3-Compatible Storage bucket setup ('wardrobe-user-clothes') for clothing images
--   3) Table 2: clothes (Attributes matching fashion-dataset styles.csv + S3 image URLs + user_id FK)
--   4) Row Level Security (RLS) policies for user data isolation
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1) TABLE 1: USERS (LOGIN & PROFILES)
-- Works both with Supabase Auth (auth.users) and standalone login
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS public.clothes CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),           -- Matches Supabase auth.users.id
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NULL,                         -- Optional if using Supabase Auth
  full_name VARCHAR(150) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url TEXT NULL,
  gender_preference VARCHAR(30) DEFAULT 'Unisex',          -- 'Men', 'Women', 'Unisex'
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  last_login_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for authentication and search
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);

-- ------------------------------------------------------------------------------
-- 2) S3 STORAGE BUCKET CONFIGURATION (SUPABASE S3-COMPATIBLE STORAGE)
-- Creates the public storage bucket for user garment images
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wardrobe-user-clothes',
  'wardrobe-user-clothes',
  true,
  10485760, -- 10 MB limit per image
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 3) TABLE 2: CLOTHES (DATASET ATTRIBUTES + S3 IMAGE URL + USER FOREIGN KEY)
-- Attributes match styles.csv:
-- (gender, masterCategory, subCategory, articleType, baseColour, season, year, usage, productDisplayName)
-- ------------------------------------------------------------------------------
CREATE TABLE public.clothes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE,

  -- Dataset Attributes (Exact match to styles.csv)
  gender VARCHAR(50) NOT NULL,                             -- 'Men', 'Women', 'Boys', 'Girls', 'Unisex'
  master_category VARCHAR(100) NOT NULL,                   -- 'Apparel', 'Accessories', 'Footwear'
  sub_category VARCHAR(100) NOT NULL,                      -- 'Topwear', 'Bottomwear', 'Shoes', etc.
  article_type VARCHAR(100) NOT NULL,                      -- 'Shirts', 'Tshirts', 'Jeans', 'Kurtas', etc.
  base_colour VARCHAR(60) NOT NULL,                        -- 'Navy Blue', 'Black', 'White', etc.
  season VARCHAR(50) NOT NULL,                             -- 'Summer', 'Winter', 'Fall', 'Spring', 'All-Season'
  year INT NULL,                                           -- Catalog year (e.g., 2011, 2024)
  usage_type VARCHAR(100) NOT NULL,                        -- 'Casual', 'Smart Casual', 'Formal', 'Sports', 'Ethnic', 'Party'
  product_display_name VARCHAR(255) NOT NULL,              -- Full product name from dataset

  -- S3 Storage Image References (Requirement 2 & 3)
  s3_bucket VARCHAR(100) NOT NULL DEFAULT 'wardrobe-user-clothes',
  s3_key VARCHAR(500) NOT NULL,                            -- S3 path: users/{user_id}/clothes/{id}/raw.webp
  s3_image_url TEXT NOT NULL,                              -- Public / CDN URL to S3 image
  s3_cropped_key VARCHAR(500) NULL,                        -- S3 path for SAM-2 background-removed crop
  s3_cropped_url TEXT NULL,                                -- URL for cropped/segmented garment in S3

  -- Computer Vision & Stylist Enriched Attributes
  color_hex VARCHAR(10) NULL,                              -- Extracted hex color (e.g. #1E3A8A)
  material VARCHAR(100) NULL,                              -- Fabric texture (e.g. 'Oxford Cotton')
  pattern VARCHAR(60) DEFAULT 'Solid',                     -- 'Solid', 'Check', 'Striped', 'Floral'
  style_aesthetic VARCHAR(60) DEFAULT 'Classic',           -- 'Old Money', 'Minimal', 'Streetwear'
  ai_tags JSONB NULL,                                      -- Computer vision tags (['Tailored', 'Collar'])
  ai_status VARCHAR(20) NOT NULL DEFAULT 'processed' CHECK (ai_status IN ('pending', 'processed', 'flagged')),
  usage_count INT NOT NULL DEFAULT 0,
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes for Recommendation Engine Queries
CREATE INDEX idx_clothes_user_id ON public.clothes(user_id);
CREATE INDEX idx_clothes_article_type ON public.clothes(article_type);
CREATE INDEX idx_clothes_gender ON public.clothes(gender);
CREATE INDEX idx_clothes_sub_category ON public.clothes(sub_category);
CREATE INDEX idx_clothes_base_colour ON public.clothes(base_colour);
CREATE INDEX idx_clothes_season ON public.clothes(season);
CREATE INDEX idx_clothes_usage_type ON public.clothes(usage_type);
CREATE INDEX idx_clothes_ai_tags ON public.clothes USING gin(ai_tags);

-- Automatic Timestamp Update Trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clothes_updated_at
BEFORE UPDATE ON public.clothes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 4) ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures each user can only read/write their own wardrobe in Supabase
-- ------------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clothes ENABLE ROW LEVEL SECURITY;

-- Users Table Policies
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id OR role = 'admin');

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Clothes Table Policies
CREATE POLICY "Users can view their own wardrobe clothes"
  ON public.clothes FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can insert into their own wardrobe"
  ON public.clothes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wardrobe clothes"
  ON public.clothes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wardrobe clothes"
  ON public.clothes FOR DELETE
  USING (auth.uid() = user_id);

-- Storage RLS Policies for wardrobe-user-clothes S3 bucket
CREATE POLICY "Public read for wardrobe clothes images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'wardrobe-user-clothes');

CREATE POLICY "Authenticated users can upload clothes images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'wardrobe-user-clothes' AND auth.role() = 'authenticated');
