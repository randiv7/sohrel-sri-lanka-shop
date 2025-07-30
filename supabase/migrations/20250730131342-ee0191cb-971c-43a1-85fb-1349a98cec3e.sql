-- First, allow deletion of completed and cancelled orders
DELETE FROM order_items WHERE order_id IN (
  SELECT id FROM orders WHERE status IN ('delivered', 'cancelled')
);

DELETE FROM orders WHERE status IN ('delivered', 'cancelled');

-- Update foreign key constraint to allow cascading deletes
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;
ALTER TABLE order_items ADD CONSTRAINT order_items_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- Add function to allow admins to delete completed orders
CREATE OR REPLACE FUNCTION delete_completed_order(order_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  order_status TEXT;
BEGIN
  -- Check if user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can delete orders';
  END IF;
  
  -- Get order status
  SELECT status INTO order_status FROM orders WHERE id = order_id_param;
  
  -- Only allow deletion of completed, cancelled, or delivered orders
  IF order_status NOT IN ('delivered', 'cancelled') THEN
    RAISE EXCEPTION 'Can only delete delivered or cancelled orders';
  END IF;
  
  -- Delete order items first (will be handled by cascade now, but explicit for clarity)
  DELETE FROM order_items WHERE order_id = order_id_param;
  
  -- Delete the order
  DELETE FROM orders WHERE id = order_id_param;
  
  RETURN TRUE;
END;
$$;