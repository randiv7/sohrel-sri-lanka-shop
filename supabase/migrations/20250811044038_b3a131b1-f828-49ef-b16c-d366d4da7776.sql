-- Fix wishlist foreign key relationship to products
-- Change product_id in wishlists to be a proper foreign key to products.id

-- First check current structure
DO $$ 
BEGIN
    -- Change product_id in wishlists to bigint to match products.id
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'wishlists' AND column_name = 'product_id' AND data_type = 'uuid') THEN
        
        -- Clear existing data since we're changing the type
        TRUNCATE TABLE public.wishlists;
        
        -- Change the column type
        ALTER TABLE public.wishlists ALTER COLUMN product_id TYPE bigint USING NULL;
        
        -- Add the foreign key constraint
        ALTER TABLE public.wishlists DROP CONSTRAINT IF EXISTS wishlists_product_id_fkey;
        ALTER TABLE public.wishlists ADD CONSTRAINT wishlists_product_id_fkey 
          FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
    END IF;
END $$;