
-- 1) RLS policies for categories: allow admins to read all and write
-- Note: Keep the existing public SELECT (is_active = true) and add admin policies.

-- Ensure RLS is enabled (safe if already enabled)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Admins can view all categories (including inactive)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'categories' AND policyname = 'Admins can view all categories'
  ) THEN
    CREATE POLICY "Admins can view all categories"
      ON public.categories
      FOR SELECT
      USING (is_admin());
  END IF;
END $$;

-- Admins can insert categories
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'categories' AND policyname = 'Admins can insert categories'
  ) THEN
    CREATE POLICY "Admins can insert categories"
      ON public.categories
      FOR INSERT
      WITH CHECK (is_admin());
  END IF;
END $$;

-- Admins can update categories
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'categories' AND policyname = 'Admins can update categories'
  ) THEN
    CREATE POLICY "Admins can update categories"
      ON public.categories
      FOR UPDATE
      USING (is_admin());
  END IF;
END $$;

-- Admins can delete categories
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'categories' AND policyname = 'Admins can delete categories'
  ) THEN
    CREATE POLICY "Admins can delete categories"
      ON public.categories
      FOR DELETE
      USING (is_admin());
  END IF;
END $$;


-- 2) RLS policies for products: allow admins to read all and write

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Admins can view all products (including inactive)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'Admins can view all products'
  ) THEN
    CREATE POLICY "Admins can view all products"
      ON public.products
      FOR SELECT
      USING (is_admin());
  END IF;
END $$;

-- Admins can insert products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'Admins can insert products'
  ) THEN
    CREATE POLICY "Admins can insert products"
      ON public.products
      FOR INSERT
      WITH CHECK (is_admin());
  END IF;
END $$;

-- Admins can update products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'Admins can update products'
  ) THEN
    CREATE POLICY "Admins can update products"
      ON public.products
      FOR UPDATE
      USING (is_admin());
  END IF;
END $$;

-- Admins can delete products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'Admins can delete products'
  ) THEN
    CREATE POLICY "Admins can delete products"
      ON public.products
      FOR DELETE
      USING (is_admin());
  END IF;
END $$;


-- 3) RLS for product_variants: allow admins to write (SELECT already exists for everyone)

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Admins can insert product variants
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'product_variants' AND policyname = 'Admins can insert product variants'
  ) THEN
    CREATE POLICY "Admins can insert product variants"
      ON public.product_variants
      FOR INSERT
      WITH CHECK (is_admin());
  END IF;
END $$;

-- Admins can update product variants
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'product_variants' AND policyname = 'Admins can update product variants'
  ) THEN
    CREATE POLICY "Admins can update product variants"
      ON public.product_variants
      FOR UPDATE
      USING (is_admin());
  END IF;
END $$;

-- Admins can delete product variants
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'product_variants' AND policyname = 'Admins can delete product variants'
  ) THEN
    CREATE POLICY "Admins can delete product variants"
      ON public.product_variants
      FOR DELETE
      USING (is_admin());
  END IF;
END $$;


-- 4) Add missing foreign keys so nested selects/counts work in the admin UI

-- products.category_id -> categories.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'products_category_id_fkey'
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_category_id_fkey
      FOREIGN KEY (category_id) REFERENCES public.categories(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- product_images.product_id -> products.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'product_images_product_id_fkey'
  ) THEN
    ALTER TABLE public.product_images
      ADD CONSTRAINT product_images_product_id_fkey
      FOREIGN KEY (product_id) REFERENCES public.products(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- product_variants.product_id -> products.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'product_variants_product_id_fkey'
  ) THEN
    ALTER TABLE public.product_variants
      ADD CONSTRAINT product_variants_product_id_fkey
      FOREIGN KEY (product_id) REFERENCES public.products(id)
      ON DELETE CASCADE;
  END IF;
END $$;
