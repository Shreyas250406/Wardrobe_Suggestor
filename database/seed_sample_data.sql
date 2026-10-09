-- ==============================================================================
-- AI WARDROBE SUGGESTOR - SAMPLE SEED DATA
-- Dialect: Compatible with both MySQL and PostgreSQL / Supabase Cloud
-- ==============================================================================

-- 1) Seed Demo Users (Password: 'Pass123#' hashed or placeholder)
INSERT INTO users (id, email, password_hash, full_name, role, gender_preference, is_active, email_verified)
VALUES
  ('c1a8e24e-4f1a-4c2f-b4b3-0a7e6b8f1c01', 'shreyas@example.com', '$2b$10$Wp8u9s3v1sO7V0K8YQeB1.N7tqH4Wq6eE9x0o9z7t1u8y7w6v5u4', 'Shreyas Deshmukh', 'user', 'Men', true, true),
  ('a2b9d35f-5e2b-4d3a-c5c4-1b8f7c9a2d02', 'admin@wardrobe.ai', '$2b$10$Wp8u9s3v1sO7V0K8YQeB1.N7tqH4Wq6eE9x0o9z7t1u8y7w6v5u4', 'Wardrobe Administrator', 'admin', 'Unisex', true, true)
ON CONFLICT (email) DO NOTHING;

-- 2) Seed Clothes Items (From styles.csv & images.csv)
-- Item 1: 15970 - Turtle Check Men Navy Blue Shirt
INSERT INTO clothes (
  id, user_id, gender, master_category, sub_category, article_type, base_colour, season, year, usage_type, product_display_name,
  s3_bucket, s3_key, s3_image_url, s3_cropped_key, s3_cropped_url,
  color_hex, material, pattern, style_aesthetic, ai_tags, ai_status
) VALUES (
  'e3c0f46a-6f3c-4e4b-d6d5-2c9a8d0b3e01',
  'c1a8e24e-4f1a-4c2f-b4b3-0a7e6b8f1c01',
  'Men',
  'Apparel',
  'Topwear',
  'Shirts',
  'Navy Blue',
  'Fall',
  2011,
  'Casual',
  'Turtle Check Men Navy Blue Shirt',
  'wardrobe-user-clothes',
  'users/c1a8e24e-4f1a-4c2f-b4b3-0a7e6b8f1c01/clothes/e3c0f46a-6f3c-4e4b-d6d5-2c9a8d0b3e01/raw.jpg',
  'https://wardrobe-user-clothes.s3.amazonaws.com/users/c1a8e24e-4f1a-4c2f-b4b3-0a7e6b8f1c01/clothes/e3c0f46a-6f3c-4e4b-d6d5-2c9a8d0b3e01/raw.jpg',
  'users/c1a8e24e-4f1a-4c2f-b4b3-0a7e6b8f1c01/clothes/e3c0f46a-6f3c-4e4b-d6d5-2c9a8d0b3e01/cropped.webp',
  'https://wardrobe-user-clothes.s3.amazonaws.com/users/c1a8e24e-4f1a-4c2f-b4b3-0a7e6b8f1c01/clothes/e3c0f46a-6f3c-4e4b-d6d5-2c9a8d0b3e01/cropped.webp',
  '#1E293B',
  'Cotton',
  'Check',
  'Classic',
  '["Check Pattern", "Long Sleeve", "Collar", "Navy"]'::jsonb,
  'processed'
);

-- Item 2: 39386 - Peter England Men Party Blue Jeans
INSERT INTO clothes (
  id, user_id, gender, master_category, sub_category, article_type, base_colour, season, year, usage_type, product_display_name,
  s3_bucket, s3_key, s3_image_url, s3_cropped_key, s3_cropped_url,
  color_hex, material, pattern, style_aesthetic, ai_tags, ai_status
) VALUES (
  'f4d1a57b-7a4d-4f5c-e7e6-3d0b9e1c4f02',
  'c1a8e24e-4f1a-4c2f-b4b3-0a7e6b8f1c01',
  'Men',
  'Apparel',
  'Bottomwear',
  'Jeans',
  'Blue',
  'Summer',
  2012,
  'Casual',
  'Peter England Men Party Blue Jeans',
  'wardrobe-user-clothes',
  'users/c1a8e24e-4f1a-4c2f-b4b3-0a7e6b8f1c01/clothes/f4d1a57b-7a4d-4f5c-e7e6-3d0b9e1c4f02/raw.jpg',
  'https://wardrobe-user-clothes.s3.amazonaws.com/users/c1a8e24e-4f1a-4c2f-b4b3-0a7e6b8f1c01/clothes/f4d1a57b-7a4d-4f5c-e7e6-3d0b9e1c4f02/raw.jpg',
  'users/c1a8e24e-4f1a-4c2f-b4b3-0a7e6b8f1c01/clothes/f4d1a57b-7a4d-4f5c-e7e6-3d0b9e1c4f02/cropped.webp',
  'https://wardrobe-user-clothes.s3.amazonaws.com/users/c1a8e24e-4f1a-4c2f-b4b3-0a7e6b8f1c01/clothes/f4d1a57b-7a4d-4f5c-e7e6-3d0b9e1c4f02/cropped.webp',
  '#2563EB',
  'Denim',
  'Solid',
  'Contemporary',
  '["Slim Fit", "Classic Wash", "Five Pocket", "Durable"]'::jsonb,
  'processed'
);

-- Item 3: 59263 - Titan Women Silver Watch
INSERT INTO clothes (
  id, user_id, gender, master_category, sub_category, article_type, base_colour, season, year, usage_type, product_display_name,
  s3_bucket, s3_key, s3_image_url, s3_cropped_key, s3_cropped_url,
  color_hex, material, pattern, style_aesthetic, ai_tags, ai_status
) VALUES (
  'a5e2b68c-8b5e-4a6d-f8f7-4e1c0f2d5a03',
  'c1a8e24e-4f1a-4c2f-b4b3-0a7e6b8f1c01',
  'Women',
  'Accessories',
  'Watches',
  'Watches',
  'Silver',
  'Winter',
  2016,
  'Casual',
  'Titan Women Silver Watch',
  'wardrobe-user-clothes',
  'users/c1a8e24e-4f1a-4c2f-b4b3-0a7e6b8f1c01/clothes/a5e2b68c-8b5e-4a6d-f8f7-4e1c0f2d5a03/raw.jpg',
  'https://wardrobe-user-clothes.s3.amazonaws.com/users/c1a8e24e-4f1a-4c2f-b4b3-0a7e6b8f1c01/clothes/a5e2b68c-8b5e-4a6d-f8f7-4e1c0f2d5a03/raw.jpg',
  'users/c1a8e24e-4f1a-4c2f-b4b3-0a7e6b8f1c01/clothes/a5e2b68c-8b5e-4a6d-f8f7-4e1c0f2d5a03/cropped.webp',
  'https://wardrobe-user-clothes.s3.amazonaws.com/users/c1a8e24e-4f1a-4c2f-b4b3-0a7e6b8f1c01/clothes/a5e2b68c-8b5e-4a6d-f8f7-4e1c0f2d5a03/cropped.webp',
  '#CBD5E1',
  'Stainless Steel',
  'Metallic',
  'Minimal',
  '["Analog Dial", "Metal Strap", "Water Resistant", "Silver Finish"]'::jsonb,
  'processed'
);
