-- Create a simple way to set up the first admin user
-- This will be called manually after the user signs up with himethdharmapriya7@gmail.com

-- Try to create the admin user for the specified email if they exist
DO $$
DECLARE
    admin_email text := 'himethdharmapriya7@gmail.com';
    user_uuid uuid;
BEGIN
    -- Check if user exists in auth.users
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = admin_email;
    
    IF user_uuid IS NOT NULL THEN
        -- Create admin user
        INSERT INTO public.admin_users (user_id, role, permissions, is_active) 
        VALUES (
            user_uuid,
            'admin',
            '{"manage_products": true, "manage_orders": true, "manage_users": true, "manage_admins": true, "view_analytics": true}'::jsonb,
            true
        ) ON CONFLICT (user_id) DO UPDATE SET
            role = EXCLUDED.role,
            permissions = EXCLUDED.permissions,
            is_active = EXCLUDED.is_active,
            updated_at = now();
            
        RAISE NOTICE 'Admin user created for email: %', admin_email;
    ELSE
        RAISE NOTICE 'User with email % not found. Please sign up first.', admin_email;
    END IF;
END $$;