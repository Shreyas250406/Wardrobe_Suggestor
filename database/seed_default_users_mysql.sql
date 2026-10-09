-- ==============================================================================
-- AI WARDROBE SUGGESTOR - DEFAULT USERS SEED SCRIPT (MYSQL)
-- Dialect: MySQL 8.0+
-- Default Password for all seeded users: Password123!
-- ==============================================================================

USE ai_wardrobe_db;

INSERT INTO users (
  id,
  email,
  password_hash,
  full_name,
  role,
  avatar_url,
  gender_preference,
  is_active,
  email_verified,
  created_at,
  updated_at
) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'shreyas@example.com',
    '$2b$10$1rYQhD4nC5j7u6w1r9e7vOy2e9s3v1sO7V0K8YQeB1.N7tqH4Wq6e',
    'Shreyas Deshmukh',
    'user',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    'Men',
    true,
    true,
    DATE_SUB(NOW(), INTERVAL 30 DAY),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'admin@wardrobe.ai',
    '$2b$10$1rYQhD4nC5j7u6w1r9e7vOy2e9s3v1sO7V0K8YQeB1.N7tqH4Wq6e',
    'System Administrator',
    'admin',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    'Unisex',
    true,
    true,
    DATE_SUB(NOW(), INTERVAL 60 DAY),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'sophia.laurent@vogue-paris.fr',
    '$2b$10$1rYQhD4nC5j7u6w1r9e7vOy2e9s3v1sO7V0K8YQeB1.N7tqH4Wq6e',
    'Sophia Laurent',
    'admin',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    'Women',
    true,
    true,
    DATE_SUB(NOW(), INTERVAL 45 DAY),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'elena.rostova@fashion.io',
    '$2b$10$1rYQhD4nC5j7u6w1r9e7vOy2e9s3v1sO7V0K8YQeB1.N7tqH4Wq6e',
    'Elena Rostova',
    'user',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    'Women',
    true,
    true,
    DATE_SUB(NOW(), INTERVAL 25 DAY),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'marcus.vance@studio.design',
    '$2b$10$1rYQhD4nC5j7u6w1r9e7vOy2e9s3v1sO7V0K8YQeB1.N7tqH4Wq6e',
    'Marcus Vance',
    'user',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    'Men',
    true,
    true,
    DATE_SUB(NOW(), INTERVAL 20 DAY),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    'aisha.patel@creative.in',
    '$2b$10$1rYQhD4nC5j7u6w1r9e7vOy2e9s3v1sO7V0K8YQeB1.N7tqH4Wq6e',
    'Aisha Patel',
    'user',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    'Women',
    true,
    true,
    DATE_SUB(NOW(), INTERVAL 18 DAY),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000006',
    'julian.chen@berkeley.edu',
    '$2b$10$1rYQhD4nC5j7u6w1r9e7vOy2e9s3v1sO7V0K8YQeB1.N7tqH4Wq6e',
    'Julian Chen',
    'user',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    'Men',
    true,
    true,
    DATE_SUB(NOW(), INTERVAL 15 DAY),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000007',
    'david.kim@seoul-arch.kr',
    '$2b$10$1rYQhD4nC5j7u6w1r9e7vOy2e9s3v1sO7V0K8YQeB1.N7tqH4Wq6e',
    'David Kim',
    'user',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    'Men',
    true,
    true,
    DATE_SUB(NOW(), INTERVAL 10 DAY),
    NOW()
  )
ON DUPLICATE KEY UPDATE
  full_name = VALUES(full_name),
  role = VALUES(role),
  avatar_url = VALUES(avatar_url),
  gender_preference = VALUES(gender_preference),
  is_active = VALUES(is_active),
  email_verified = VALUES(email_verified),
  updated_at = NOW();

SELECT id, email, full_name, role, is_active FROM users ORDER BY role DESC;
