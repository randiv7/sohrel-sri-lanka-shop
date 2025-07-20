
-- Phase 1: Database & Security Fixes

-- Add missing RLS policies for coupons table to allow admin management
CREATE POLICY "Admins can insert coupons" ON public.coupons
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update coupons" ON public.coupons
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete coupons" ON public.coupons
  FOR DELETE USING (is_admin());

-- Create store_settings table for persistent store configuration
CREATE TABLE public.store_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS on store_settings
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for store_settings
CREATE POLICY "Admins can view store settings" ON public.store_settings
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can insert store settings" ON public.store_settings
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update store settings" ON public.store_settings
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete store settings" ON public.store_settings
  FOR DELETE USING (is_admin());

-- Add trigger for updated_at on store_settings
CREATE TRIGGER update_store_settings_updated_at
  BEFORE UPDATE ON public.store_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default store settings
INSERT INTO public.store_settings (key, value, description) VALUES
  ('store_name', '"SOHREL"', 'Store name'),
  ('store_description', '"Premium fashion and lifestyle store in Sri Lanka"', 'Store description'),
  ('contact_email', '"info@sohrel.com"', 'Contact email'),
  ('contact_phone', '"+94 70 123 4567"', 'Contact phone'),
  ('address', '"123 Main Street"', 'Store address'),
  ('city', '"Colombo"', 'Store city'),
  ('postal_code', '"00100"', 'Postal code'),
  ('province', '"Western Province"', 'Province'),
  ('currency', '"LKR"', 'Store currency'),
  ('tax_rate', '0', 'Tax rate'),
  ('free_shipping_threshold', '5000', 'Free shipping threshold'),
  ('maintenance_mode', 'false', 'Maintenance mode'),
  ('allow_guest_checkout', 'true', 'Allow guest checkout'),
  ('require_phone_verification', 'false', 'Require phone verification'),
  ('auto_approve_reviews', 'false', 'Auto approve reviews');

-- Update admin permissions to include manage_settings and other missing permissions
UPDATE public.admin_users 
SET permissions = jsonb_set(
  permissions,
  '{manage_settings}',
  'true'
) WHERE permissions IS NOT NULL;

-- Also add other essential admin permissions
UPDATE public.admin_users 
SET permissions = permissions || '{"view_analytics": true, "manage_coupons": true, "manage_settings": true}'::jsonb
WHERE permissions IS NOT NULL;
