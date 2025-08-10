-- Fix product_images relationship to work with existing schema
-- Since products.id is bigint and product_images.product_id is uuid, 
-- we need to change product_images.product_id to bigint to match

-- First, clear any existing data in product_images since we're changing the structure
TRUNCATE TABLE public.product_images;

-- Change product_images.product_id from uuid to bigint to match products.id
ALTER TABLE public.product_images ALTER COLUMN product_id TYPE bigint USING NULL;

-- Add the foreign key constraint
ALTER TABLE public.product_images DROP CONSTRAINT IF EXISTS product_images_product_id_fkey;
ALTER TABLE public.product_images ADD CONSTRAINT product_images_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- Fix cart_items to also use bigint product_id to match products.id
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS session_id text;
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS product_id bigint;
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Add foreign key for cart_items to products
ALTER TABLE public.cart_items DROP CONSTRAINT IF EXISTS cart_items_product_id_fkey;
ALTER TABLE public.cart_items ADD CONSTRAINT cart_items_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- Enable RLS on cart_items
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Create missing RLS policies for all tables
DROP POLICY IF EXISTS "Users can manage their own cart items" ON public.cart_items;
CREATE POLICY "Users can manage their own cart items" 
ON public.cart_items FOR ALL 
USING (auth.uid() = user_id OR session_id IS NOT NULL);

-- Enable RLS on product_variants if it exists and add policy
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_variants') THEN
        EXECUTE 'ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "Product variants are viewable by everyone" ON public.product_variants';
        EXECUTE 'CREATE POLICY "Product variants are viewable by everyone" ON public.product_variants FOR SELECT USING (true)';
    END IF;
END $$;

-- Enable RLS on inventory_movements if it exists and add policy  
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory_movements') THEN
        EXECUTE 'ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "Inventory movements are viewable by admins" ON public.inventory_movements';
        EXECUTE 'CREATE POLICY "Inventory movements are viewable by admins" ON public.inventory_movements FOR SELECT USING (true)';
    END IF;
END $$;

-- Add sample product images for the sample products
INSERT INTO public.product_images (product_id, image_url, alt_text, is_primary, display_order)
SELECT 
  p.id,
  'https://placehold.co/800x800/f3f4f6/6b7280?text=' || REPLACE(p.name, ' ', '+'),
  p.name || ' image',
  true,
  0
FROM public.products p
WHERE NOT EXISTS (SELECT 1 FROM public.product_images WHERE product_id = p.id);

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
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
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();