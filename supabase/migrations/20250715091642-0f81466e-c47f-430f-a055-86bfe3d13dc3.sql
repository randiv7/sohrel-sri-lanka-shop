-- First, create a security definer function to check admin status
-- This function bypasses RLS and prevents infinite recursion
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE user_id = user_uuid 
    AND is_active = true
  );
$$;

-- Create function to check specific admin permissions
CREATE OR REPLACE FUNCTION public.has_admin_permission(permission_key text, user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE user_id = user_uuid 
    AND is_active = true 
    AND (permissions ->> permission_key)::boolean = true
  );
$$;

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Admin users can view admin data" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can create other admins" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can delete other admin accounts" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can update admin accounts" ON public.admin_users;

-- Create new policies using the security definer functions
CREATE POLICY "Admin users can view admin data" 
ON public.admin_users 
FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Admins can create other admins" 
ON public.admin_users 
FOR INSERT 
WITH CHECK (public.has_admin_permission('manage_admins'));

CREATE POLICY "Admins can update admin accounts" 
ON public.admin_users 
FOR UPDATE 
USING (public.has_admin_permission('manage_admins'));

CREATE POLICY "Admins can delete other admin accounts" 
ON public.admin_users 
FOR DELETE 
USING (public.has_admin_permission('manage_admins') AND user_id != auth.uid());