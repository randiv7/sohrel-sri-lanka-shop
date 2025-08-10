-- Fix database schema to match frontend expectations

-- Add missing columns to categories table
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS parent_id bigint;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Generate slugs for existing categories
UPDATE public.categories 
SET slug = LOWER(REPLACE(REPLACE(name, ' ', '-'), '''', ''))
WHERE slug IS NULL;

-- Make slug unique and not null
ALTER TABLE public.categories ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS categories_slug_key ON public.categories(slug);

-- Add missing columns to products table
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

-- Copy base_price to price for existing products
UPDATE public.products 
SET price = base_price 
WHERE price IS NULL AND base_price IS NOT NULL;

-- Generate slugs for existing products
UPDATE public.products 
SET slug = LOWER(REPLACE(REPLACE(name, ' ', '-'), '''', ''))
WHERE slug IS NULL;

-- Make slug unique and not null
ALTER TABLE public.products ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS products_slug_key ON public.products(slug);

-- Change product_images.product_id to reference products.id correctly
ALTER TABLE public.product_images DROP CONSTRAINT IF EXISTS product_images_product_id_fkey;
ALTER TABLE public.product_images ALTER COLUMN product_id TYPE bigint USING product_id::bigint;
ALTER TABLE public.product_images ADD CONSTRAINT product_images_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- Add missing cart_items columns and fix relationships
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS session_id text;
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS product_id bigint;
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Add foreign key for cart_items to products
ALTER TABLE public.cart_items DROP CONSTRAINT IF EXISTS cart_items_product_id_fkey;
ALTER TABLE public.cart_items ADD CONSTRAINT cart_items_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- Enable RLS on tables that need it
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for categories (public read)
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories FOR SELECT 
USING (is_active = true);

-- Create RLS policies for products (public read)
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
CREATE POLICY "Products are viewable by everyone" 
ON public.products FOR SELECT 
USING (is_active = true);

-- Create RLS policies for cart_items
DROP POLICY IF EXISTS "Users can manage their own cart items" ON public.cart_items;
CREATE POLICY "Users can manage their own cart items" 
ON public.cart_items FOR ALL 
USING (auth.uid() = user_id OR session_id IS NOT NULL);

-- Add some sample data if tables are empty
INSERT INTO public.categories (name, slug, description, is_active, display_order) 
VALUES 
  ('Electronics', 'electronics', 'Electronic devices and gadgets', true, 1),
  ('Clothing', 'clothing', 'Fashion and apparel', true, 2),
  ('Home & Garden', 'home-garden', 'Home improvement and garden supplies', true, 3)
ON CONFLICT (slug) DO NOTHING;

-- Add sample products
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
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE category_id = c.id)
LIMIT 3;

-- Create updated_at trigger for categories
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION update_categories_updated_at();

-- Create updated_at trigger for products
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION update_products_updated_at();