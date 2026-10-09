# AI Wardrobe Suggestor - Database & S3 Storage Architecture

This folder contains the complete, production-ready database definitions and S3 storage specifications designed to seamlessly power the AI Wardrobe Suggestor and connect with Supabase Cloud.

---

## 📁 File Structure

| File | Purpose | Target Engine |
| :--- | :--- | :--- |
| **`supabase_schema.sql`** | **Primary DDL for Supabase Cloud**. Sets up `users`, `clothes`, S3 storage bucket (`wardrobe-user-clothes`), UUIDs, and Row Level Security (RLS). | Supabase Cloud / PostgreSQL 15+ |
| **`seed_default_users.sql`** | **Default Users Seed Script**. Seeds standard users (`shreyas@example.com`, etc.) and system admins (`admin@wardrobe.ai`, `sophia.laurent@vogue-paris.fr`). | Supabase Cloud / PostgreSQL |
| **`mysql_schema.sql`** | Complete MySQL 8.0+ schema with dataset attributes, S3 image columns, and foreign keys. | Local MySQL / AWS RDS MySQL |
| **`seed_default_users_mysql.sql`** | Default users seed script formatted for MySQL. | MySQL 8.0+ |
| **`seed_sample_data.sql`** | Demo seed garments from `fashion-dataset` (`styles.csv` & `images.csv`). | Supabase / PostgreSQL & MySQL |
| **`s3_storage_config.json`** | S3 / Supabase Storage bucket policy, directory hierarchy, and CORS specification. | AWS S3 / Supabase Storage |

---

## 📋 Schema Overview

### 1. `users` Table (Login & Authentication)
Stores user credentials, access roles, and profile metadata:
* `id`: Unique identifier (`UUID`)
* `email`: User login email (Unique, indexed)
* `password_hash`: Bcrypt / Argon2id hashed password
* `full_name`: Display name
* `role`: `'user'` \| `'admin'`
* `avatar_url`: User profile image
* `gender_preference`: Styling preference (`Men`, `Women`, `Unisex`)
* `is_active`, `email_verified`, `last_login_at`, `created_at`, `updated_at`

### 2. S3 Storage Architecture
All user clothing photographs are organized in the S3 bucket:
* **Bucket Name**: `wardrobe-user-clothes`
* **Hierarchy**:
  ```
  wardrobe-user-clothes/
  └── users/
      └── {user_id}/
          └── clothes/
              └── {cloth_id}/
                  ├── raw.jpg        (Original photo uploaded by user)
                  ├── cropped.webp   (SAM-2 background-isolated garment)
                  └── thumb.webp     (Optimized thumbnail)
  ```

### 3. `clothes` Table (Fashion Dataset Attributes + S3 URLs + User Foreign Key)
Directly mirrors the schema of `fashion-dataset/styles.csv` combined with computer vision output and S3 links:
* `id`: Unique garment ID (`UUID`)
* `user_id`: **Foreign Key** referencing `users(id)` with `ON DELETE CASCADE`
* **Dataset Attributes**:
  * `gender`: Target demographic (`'Men'`, `'Women'`, `'Boys'`, `'Girls'`, `'Unisex'`)
  * `master_category`: High-level domain (`'Apparel'`, `'Accessories'`, `'Footwear'`)
  * `sub_category`: Apparel category (`'Topwear'`, `'Bottomwear'`, `'Shoes'`, `'Watches'`)
  * `article_type`: Precise garment type (`'Shirts'`, `'Tshirts'`, `'Jeans'`, `'Kurtas'`, `'Casual Shoes'`, etc.)
  * `base_colour`: Dominant color name (`'Navy Blue'`, `'White'`, `'Black'`, etc.)
  * `season`: Target season (`'Summer'`, `'Winter'`, `'Fall'`, `'Spring'`, `'All-Season'`)
  * `year`: Release / catalog year
  * `usage_type`: Occasion / usage (`'Casual'`, `'Smart Casual'`, `'Formal'`, `'Sports'`, `'Ethnic'`, `'Party'`)
  * `product_display_name`: Full garment name
* **S3 Image Storage Attributes**:
  * `s3_bucket`: Storage bucket name (`wardrobe-user-clothes`)
  * `s3_key`: S3 object path
  * `s3_image_url`: Full public / CDN URL to the garment photo
  * `s3_cropped_key`: S3 object path for SAM-2 segmented image
  * `s3_cropped_url`: Full URL to the background-removed image
* **AI & Stylist Features**:
  * `color_hex`: Extracted color code (`#1E293B`)
  * `material`: Fabric texture (`Cotton`, `Denim`, `Wool`)
  * `pattern`: Fabric print (`Solid`, `Check`, `Striped`)
  * `style_aesthetic`: Visual style (`Old Money`, `Minimal`, `Streetwear`)
  * `ai_tags`: JSON array of auto-detected traits
  * `ai_status`: State (`'pending'`, `'processed'`, `'flagged'`)

---

## 🚀 How to Set Up in Supabase Cloud (Zero Errors)

1. **Log in to [Supabase](https://supabase.com)** and create a new project.
2. In the left navigation bar, open the **SQL Editor**.
3. Open [`supabase_schema.sql`](./supabase_schema.sql) from this repository, copy its entire contents, and paste it into the Supabase SQL Editor.
4. Click **Run**.
   * It creates both tables (`users` and `clothes`) with complete foreign keys and indexes.
   * It provisions the `'wardrobe-user-clothes'` storage bucket.
   * It enables Row Level Security (RLS) so users can only access their own garments.
5. (Optional) Run [`seed_sample_data.sql`](./seed_sample_data.sql) to populate sample dataset items.

---

## 🐬 How to Set Up in Local / AWS MySQL

```bash
# 1. Login to MySQL
mysql -u root -p

# 2. Run the MySQL schema script
source database/mysql_schema.sql;

# 3. (Optional) Insert sample dataset records
source database/seed_sample_data.sql;
```
