-- Insert a sample admin user (you'll need to replace with actual user ID after creating the account)
-- First, let's create a test admin account
-- Note: You'll need to manually create this user account through Supabase Auth first

-- For now, let's create a placeholder that can be updated later
INSERT INTO public.admin_users (user_id, role, permissions, is_active) 
VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid, -- Placeholder UUID
  'admin',
  '{"manage_products": true, "manage_orders": true, "manage_users": true, "view_analytics": true}'::jsonb,
  true
) ON CONFLICT (user_id) DO NOTHING;