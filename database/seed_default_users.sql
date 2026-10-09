```sql
-- ==============================================================================
-- AI WARDROBE SUGGESTOR - DEFAULT USERS SEED SCRIPT
-- Version: 1.0.0
-- Dialect: PostgreSQL / Supabase Cloud
-- Default Password for all seeded users: Password123!
-- ==============================================================================

INSERT INTO public.users (
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

  -- 1) Primary User: Aryan Pardeshi
  (
    '00000000-0000-0000-0000-000000000001',
    'aryanpar03@gmail.com',
    '$2b$10$1rYQhD4nC5j7u6w1r9e7vOy2e9s3v1sO7V0K8YQeB1.N7tqH4Wq6e',
    'Aryan Pardeshi',
    'user',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    'Men',
    true,
    true,
    NOW() - INTERVAL '30 days',
    NOW()
  ),

  -- 2) System Admin: Master Administrator
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
    NOW() - INTERVAL '60 days',
    NOW()
  ),

  -- 3) Admin Fashion Director: Sophia Laurent
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
    NOW() - INTERVAL '45 days',
    NOW()
  ),

  -- 4) Active User: Elena Rostova
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
    NOW() - INTERVAL '25 days',
    NOW()
  ),

  -- 5) Active User: Marcus Vance
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
    NOW() - INTERVAL '20 days',
    NOW()
  ),

  -- 6) Active User: Aisha Patel
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
    NOW() - INTERVAL '18 days',
    NOW()
  ),

  -- 7) Active User: Julian Chen
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
    NOW() - INTERVAL '15 days',
    NOW()
  ),

  -- 8) Active User: David Kim
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
    NOW() - INTERVAL '10 days',
    NOW()
  )

ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  avatar_url = EXCLUDED.avatar_url,
  gender_preference = EXCLUDED.gender_preference,
  is_active = EXCLUDED.is_active,
  email_verified = EXCLUDED.email_verified,
  updated_at = NOW();


-- Verification query
SELECT
  id,
  email,
  full_name,
  role,
  gender_preference,
  is_active
FROM public.users
ORDER BY role DESC, created_at ASC;
```