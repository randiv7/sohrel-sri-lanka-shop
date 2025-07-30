-- First handle inventory movements
DELETE FROM inventory_movements WHERE order_id IN (
  SELECT id FROM orders WHERE status IN ('delivered', 'cancelled')
);

-- Then delete order status history
DELETE FROM order_status_history WHERE order_id IN (
  SELECT id FROM orders WHERE status IN ('delivered', 'cancelled')
);

-- Delete COD related data if exists
DELETE FROM cod_delivery_attempts WHERE cod_order_id IN (
  SELECT id FROM cod_orders WHERE order_id IN (
    SELECT id FROM orders WHERE status IN ('delivered', 'cancelled')
  )
);

DELETE FROM cod_payment_collection WHERE cod_order_id IN (
  SELECT id FROM cod_orders WHERE order_id IN (
    SELECT id FROM orders WHERE status IN ('delivered', 'cancelled')
  )
);

DELETE FROM cod_verification WHERE cod_order_id IN (
  SELECT id FROM cod_orders WHERE order_id IN (
    SELECT id FROM orders WHERE status IN ('delivered', 'cancelled')
  )
);

DELETE FROM cod_orders WHERE order_id IN (
  SELECT id FROM orders WHERE status IN ('delivered', 'cancelled')
);

-- Now delete order items
DELETE FROM order_items WHERE order_id IN (
  SELECT id FROM orders WHERE status IN ('delivered', 'cancelled')
);

-- Finally delete the orders
DELETE FROM orders WHERE status IN ('delivered', 'cancelled');

-- Update foreign key constraint to allow cascading deletes for products
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;
ALTER TABLE order_items ADD CONSTRAINT order_items_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;