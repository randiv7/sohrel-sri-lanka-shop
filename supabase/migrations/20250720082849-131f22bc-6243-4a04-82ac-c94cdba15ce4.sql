-- Phase 1: Database Security Fixes
-- Fix all function search path issues by setting search_path

-- Fix is_admin function
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE user_id = user_uuid 
    AND is_active = true
  );
$function$;

-- Fix has_admin_permission function
CREATE OR REPLACE FUNCTION public.has_admin_permission(permission_key text, user_uuid uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE user_id = user_uuid 
    AND is_active = true 
    AND (permissions ->> permission_key)::boolean = true
  );
$function$;

-- Fix create_admin_user function
CREATE OR REPLACE FUNCTION public.create_admin_user(user_email text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
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
$function$;

-- Fix refresh_product_search function
CREATE OR REPLACE FUNCTION public.refresh_product_search()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.product_search;
END;
$function$;

-- Fix track_inventory_movement function
CREATE OR REPLACE FUNCTION public.track_inventory_movement(p_variant_id uuid, p_movement_type text, p_quantity_change integer, p_order_id uuid DEFAULT NULL::uuid, p_notes text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  current_stock INTEGER;
  new_stock INTEGER;
BEGIN
  -- Get current stock
  SELECT stock_quantity INTO current_stock
  FROM public.product_variants
  WHERE id = p_variant_id;

  -- Calculate new stock
  new_stock := current_stock + p_quantity_change;

  -- Update stock in product_variants
  UPDATE public.product_variants
  SET stock_quantity = new_stock,
      updated_at = now()
  WHERE id = p_variant_id;

  -- Insert inventory movement record
  INSERT INTO public.inventory_movements (
    product_variant_id,
    movement_type,
    quantity_change,
    previous_quantity,
    new_quantity,
    order_id,
    notes,
    created_by
  ) VALUES (
    p_variant_id,
    p_movement_type,
    p_quantity_change,
    current_stock,
    new_stock,
    p_order_id,
    p_notes,
    auth.uid()
  );
END;
$function$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix generate_order_number function
CREATE OR REPLACE FUNCTION public.generate_order_number()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  RETURN 'SH' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0');
END;
$function$;

-- Hide materialized view from API
REVOKE ALL ON public.product_search FROM anon, authenticated;

-- Update product images with working placeholder URLs
UPDATE public.product_images 
SET image_url = 'https://via.placeholder.com/800x800/f3f4f6/6b7280?text=Product+Image'
WHERE image_url LIKE '%unsplash.com%' OR image_url IS NULL OR image_url = '';

-- Create a proper placeholder image system
INSERT INTO public.store_settings (key, value, description) 
VALUES ('default_product_image', '"https://via.placeholder.com/800x800/f3f4f6/6b7280?text=Product+Image"', 'Default product image URL')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;