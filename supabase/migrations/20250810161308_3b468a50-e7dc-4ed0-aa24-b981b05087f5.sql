-- Fix database schema step by step

-- First, add missing columns to categories table
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS parent_id bigint;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Generate slugs for existing categories
UPDATE public.categories 
SET slug = LOWER(REPLACE(REPLACE(name, ' ', '-'), '''', '')) || '-' || id
WHERE slug IS NULL OR slug = '';

-- Make slug not null
ALTER TABLE public.categories ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS categories_slug_key ON public.categories(slug);

-- Add missing columns to products table (keeping bigint id for now)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price numeric;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sale_price numeric;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS short_description text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_quantity integer DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Copy base_price to price
UPDATE public.products 
SET price = COALESCE(base_price, 99.99)
WHERE price IS NULL;

-- Generate slugs for products
UPDATE public.products 
SET slug = LOWER(REPLACE(REPLACE(name, ' ', '-'), '''', '')) || '-' || id
WHERE slug IS NULL OR slug = '';

ALTER TABLE public.products ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS products_slug_key ON public.products(slug);

-- Enable RLS on tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories FOR SELECT 
USING (is_active = true);

DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
CREATE POLICY "Products are viewable by everyone" 
ON public.products FOR SELECT 
USING (is_active = true);

-- Add sample data if tables are empty
INSERT INTO public.categories (name, slug, description, is_active, display_order) 
VALUES 
  ('Electronics', 'electronics', 'Electronic devices and gadgets', true, 1),
  ('Clothing', 'clothing', 'Fashion and apparel', true, 2),
  ('Home & Garden', 'home-garden', 'Home improvement and garden supplies', true, 3)
ON CONFLICT (slug) DO NOTHING;

-- Add sample products if none exist
INSERT INTO public.products (name, slug, category_id, price, short_description, is_featured, is_active, stock_quantity) 
SELECT 
  'Sample Product ' || c.name, 
  'sample-product-' || c.slug,
  c.id,
  99.99,
  'A great ' || c.name || ' product',
  true,
  true,
  10
FROM public.categories c
WHERE NOT EXISTS (SELECT 1 FROM public.products)
LIMIT 3;