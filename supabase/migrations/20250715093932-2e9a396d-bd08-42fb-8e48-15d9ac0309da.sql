-- Add RLS policies for admin users to manage products
CREATE POLICY "Admins can insert products" ON public.products
FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Admins can update products" ON public.products
FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete products" ON public.products
FOR DELETE
USING (is_admin());

-- Add RLS policies for admin users to manage product images
CREATE POLICY "Admins can insert product images" ON public.product_images
FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Admins can update product images" ON public.product_images
FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete product images" ON public.product_images
FOR DELETE
USING (is_admin());

-- Add RLS policies for admin users to manage product variants
CREATE POLICY "Admins can insert product variants" ON public.product_variants
FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Admins can update product variants" ON public.product_variants
FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete product variants" ON public.product_variants
FOR DELETE
USING (is_admin());

-- Add RLS policies for admin users to manage categories
CREATE POLICY "Admins can insert categories" ON public.categories
FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Admins can update categories" ON public.categories
FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete categories" ON public.categories
FOR DELETE
USING (is_admin());