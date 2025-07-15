-- First, let's clean up the placeholder admin user
DELETE FROM public.admin_users WHERE user_id = '00000000-0000-0000-0000-000000000000';

-- Create a function to find user by email and add them as admin
CREATE OR REPLACE FUNCTION public.create_admin_user(user_email text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_uuid uuid;
BEGIN
    -- Find the user by email in auth.users
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = user_email;
    
    IF user_uuid IS NULL THEN
        RAISE EXCEPTION 'User with email % not found in auth.users', user_email;
    END IF;
    
    -- Insert into admin_users table
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
    
    RETURN user_uuid;
END;
$$;

-- Add RLS policies for admin management
CREATE POLICY "Admins can create other admins" 
ON public.admin_users 
FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid() 
        AND is_active = true 
        AND permissions->>'manage_admins' = 'true'
    )
);

CREATE POLICY "Admins can update admin accounts" 
ON public.admin_users 
FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid() 
        AND is_active = true 
        AND permissions->>'manage_admins' = 'true'
    )
);

CREATE POLICY "Admins can delete other admin accounts" 
ON public.admin_users 
FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid() 
        AND is_active = true 
        AND permissions->>'manage_admins' = 'true'
    )
    AND user_id != auth.uid() -- Can't delete themselves
);