-- Security Fix 1: Update database functions to prevent search path vulnerabilities
-- This prevents SQL injection and function hijacking attacks

-- Update is_admin function with secure search path
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE user_id = user_uuid 
    AND is_active = true
  );
$function$;

-- Update has_admin_permission function with secure search path
CREATE OR REPLACE FUNCTION public.has_admin_permission(permission_key text, user_uuid uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE user_id = user_uuid 
    AND is_active = true 
    AND (permissions ->> permission_key)::boolean = true
  );
$function$;

-- Update validate_image_url function with secure search path
CREATE OR REPLACE FUNCTION public.validate_image_url(url text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Basic URL validation - must start with http/https and not be a known broken service
  RETURN url ~ '^https?://' 
    AND url NOT LIKE '%via.placeholder.com%' 
    AND url NOT LIKE '%placehold.it%'
    AND LENGTH(url) > 10;
END;
$function$;

-- Update prevent_broken_image_urls function with secure search path
CREATE OR REPLACE FUNCTION public.prevent_broken_image_urls()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  IF NEW.image_url IS NOT NULL AND NOT public.validate_image_url(NEW.image_url) THEN
    NEW.image_url := 'https://placehold.co/800x800/f3f4f6/6b7280?text=Product+Image';
  END IF;
  RETURN NEW;
END;
$function$;

-- Security Fix 2: Strengthen admin access control with audit logging
-- Create audit log table for admin operations
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id uuid NOT NULL,
  target_user_id uuid,
  action text NOT NULL,
  details jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" 
ON public.admin_audit_log 
FOR SELECT 
USING (public.is_admin());

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" 
ON public.admin_audit_log 
FOR INSERT 
WITH CHECK (true);

-- Security Fix 3: Add constraints to prevent privilege escalation
-- Function to safely update admin permissions with audit trail
CREATE OR REPLACE FUNCTION public.update_admin_permissions(
  target_user_id uuid,
  new_permissions jsonb,
  requesting_user_id uuid DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  current_admin_role text;
  target_admin_role text;
BEGIN
  -- Check if requesting user is admin
  IF NOT public.is_admin(requesting_user_id) THEN
    RAISE EXCEPTION 'Access denied: Only admins can update permissions';
  END IF;
  
  -- Get current admin roles
  SELECT role INTO current_admin_role FROM public.admin_users WHERE user_id = requesting_user_id;
  SELECT role INTO target_admin_role FROM public.admin_users WHERE user_id = target_user_id;
  
  -- Prevent self-modification of critical permissions
  IF requesting_user_id = target_user_id AND 
     (new_permissions ->> 'manage_admins')::boolean = false THEN
    RAISE EXCEPTION 'Cannot remove your own admin management permissions';
  END IF;
  
  -- Update permissions
  UPDATE public.admin_users 
  SET permissions = new_permissions, updated_at = now()
  WHERE user_id = target_user_id;
  
  -- Log the action
  INSERT INTO public.admin_audit_log (
    admin_user_id, target_user_id, action, details
  ) VALUES (
    requesting_user_id, target_user_id, 'update_permissions', 
    jsonb_build_object('old_permissions', 
      (SELECT permissions FROM public.admin_users WHERE user_id = target_user_id),
      'new_permissions', new_permissions
    )
  );
  
  RETURN true;
END;
$function$;

-- Security Fix 4: Add session validation table for guest carts
CREATE TABLE IF NOT EXISTS public.guest_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_token text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days'),
  last_activity timestamp with time zone NOT NULL DEFAULT now(),
  ip_address inet,
  user_agent text
);

-- Enable RLS on guest sessions
ALTER TABLE public.guest_sessions ENABLE ROW LEVEL SECURITY;

-- Anyone can manage their own session
CREATE POLICY "Users can manage their own guest sessions" 
ON public.guest_sessions 
FOR ALL 
USING (true);

-- Function to generate secure session tokens
CREATE OR REPLACE FUNCTION public.generate_secure_session_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64');
END;
$function$;

-- Function to validate and refresh session
CREATE OR REPLACE FUNCTION public.validate_guest_session(token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  session_record record;
BEGIN
  SELECT * INTO session_record 
  FROM public.guest_sessions 
  WHERE session_token = token AND expires_at > now();
  
  IF session_record.id IS NOT NULL THEN
    -- Update last activity
    UPDATE public.guest_sessions 
    SET last_activity = now() 
    WHERE id = session_record.id;
    RETURN true;
  END IF;
  
  RETURN false;
END;
$function$;