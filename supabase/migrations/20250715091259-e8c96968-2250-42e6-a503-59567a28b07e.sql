-- Create the admin user record for the existing signed-up user
INSERT INTO public.admin_users (user_id, role, permissions, is_active) 
VALUES (
    'b10cc817-227f-43ff-9508-ed47039f16d6',
    'admin',
    '{"manage_products": true, "manage_orders": true, "manage_users": true, "manage_admins": true, "view_analytics": true}'::jsonb,
    true
) ON CONFLICT (user_id) DO UPDATE SET
    role = EXCLUDED.role,
    permissions = EXCLUDED.permissions,
    is_active = EXCLUDED.is_active,
    updated_at = now();