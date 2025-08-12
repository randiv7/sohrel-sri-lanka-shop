-- Fix foreign key relationships that are missing
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;
ALTER TABLE order_items ADD CONSTRAINT order_items_order_id_fkey 
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;

-- Fix product_variants foreign key
ALTER TABLE product_variants DROP CONSTRAINT IF EXISTS product_variants_product_id_fkey;
ALTER TABLE product_variants ADD CONSTRAINT product_variants_product_id_fkey 
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- Fix product_images foreign key  
ALTER TABLE product_images DROP CONSTRAINT IF EXISTS product_images_product_id_fkey;
ALTER TABLE product_images ADD CONSTRAINT product_images_product_id_fkey 
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- Add missing columns that frontend expects
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS sku TEXT;

-- Fix order_items to use correct ID types
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;
ALTER TABLE order_items ALTER COLUMN order_id TYPE uuid USING order_id::text::uuid;
ALTER TABLE order_items ADD CONSTRAINT order_items_order_id_fkey 
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;