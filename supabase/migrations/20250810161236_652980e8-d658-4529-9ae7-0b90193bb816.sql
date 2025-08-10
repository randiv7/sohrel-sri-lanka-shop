-- Fix database schema to match frontend expectations (final version)

-- Add missing columns to categories table
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS parent_id bigint;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Generate slugs for existing categories if they don't have slugs
UPDATE public.categories 
SET slug = LOWER(REPLACE(REPLACE(name, ' ', '-'), '''', ''))
WHERE slug IS NULL OR slug = '';

-- Make slug unique and not null after updating
UPDATE public.categories SET slug = name || '-' || id WHERE slug IS NULL OR slug = '';
ALTER TABLE public.categories ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS categories_slug_key ON public.categories(slug);

-- Change products.id from bigint to uuid to match product_images.product_id
-- First, we need to recreate the products table with uuid id
ALTER TABLE public.products RENAME TO products_old;

-- Create new products table with uuid id
CREATE TABLE public.products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text,
  category_id bigint,
  price numeric,
  sale_price numeric,
  base_price numeric,
  short_description text,
  description text,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  stock_quantity integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Copy data from old table to new table
INSERT INTO public.products (name, category_id, base_price, price, is_featured, is_active, stock_quantity)
SELECT 
  name, 
  category_id, 
  base_price,
  COALESCE(base_price, 99.99) as price,
  true as is_featured,
  true as is_active,
  10 as stock_quantity
FROM public.products_old;

-- Generate slugs for products
UPDATE public.products 
SET slug = LOWER(REPLACE(REPLACE(name, ' ', '-'), '''', '')) || '-' || SUBSTRING(id::text, 1, 8)
WHERE slug IS NULL;

ALTER TABLE public.products ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS products_slug_key ON public.products(slug);

-- Drop old table
DROP TABLE public.products_old;

-- Now add foreign key constraint for product_images
ALTER TABLE public.product_images DROP CONSTRAINT IF EXISTS product_images_product_id_fkey;
ALTER TABLE public.product_images ADD CONSTRAINT product_images_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- Add missing cart_items columns
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS session_id text;
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS product_id uuid;
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Add foreign key for cart_items to products (now uuid)
ALTER TABLE public.cart_items DROP CONSTRAINT IF EXISTS cart_items_product_id_fkey;
ALTER TABLE public.cart_items ADD CONSTRAINT cart_items_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- Enable RLS on tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories FOR SELECT 
USING (is_active = true);

DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
CREATE POLICY "Products are viewable by everyone" 
ON public.products FOR SELECT 
USING (is_active = true);

DROP POLICY IF EXISTS "Users can manage their own cart items" ON public.cart_items;
CREATE POLICY "Users can manage their own cart items" 
ON public.cart_items FOR ALL 
USING (auth.uid() = user_id OR session_id IS NOT NULL);

-- Add sample data if tables are empty
INSERT INTO public.categories (name, slug, description, is_active, display_order) 
VALUES 
  ('Electronics', 'electronics', 'Electronic devices and gadgets', true, 1),
  ('Clothing', 'clothing', 'Fashion and apparel', true, 2),
  ('Home & Garden', 'home-garden', 'Home improvement and garden supplies', true, 3)
ON CONFLICT (slug) DO NOTHING;

-- Add sample products only if none exist
INSERT INTO public.products (name, slug, category_id, price, short_description, is_featured, is_active, stock_quantity) 
SELECT 
  'Sample Product ' || c.name, 
  'sample-product-' || c.slug || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8),
  c.id,
  99.99,
  'A great ' || c.name || ' product',
  true,
  true,
  10
FROM public.categories c
WHERE NOT EXISTS (SELECT 1 FROM public.products)
LIMIT 3;