-- Create order status history table for tracking order status changes
CREATE TABLE public.order_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  previous_status TEXT,
  changed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing order status history
CREATE POLICY "Users can view status history for their orders"
ON public.order_status_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_status_history.order_id 
    AND (orders.user_id = auth.uid() OR (auth.uid() IS NULL AND orders.guest_email IS NOT NULL))
  )
);

-- Create policy for admins to insert status history
CREATE POLICY "Admins can insert order status history"
ON public.order_status_history
FOR INSERT
WITH CHECK (is_admin());

-- Create inventory movements table for tracking stock changes
CREATE TABLE public.inventory_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('purchase', 'sale', 'adjustment', 'return')),
  quantity_change INTEGER NOT NULL,
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  order_id UUID REFERENCES public.orders(id),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to view all inventory movements
CREATE POLICY "Admins can view all inventory movements"
ON public.inventory_movements
FOR SELECT
USING (is_admin());

-- Create policy for admins to insert inventory movements
CREATE POLICY "Admins can insert inventory movements"
ON public.inventory_movements
FOR INSERT
WITH CHECK (is_admin());

-- Create analytics events table for tracking user behavior
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_data JSONB,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting analytics events (public access for tracking)
CREATE POLICY "Anyone can insert analytics events"
ON public.analytics_events
FOR INSERT
WITH CHECK (true);

-- Create policy for admins to view analytics events
CREATE POLICY "Admins can view analytics events"
ON public.analytics_events
FOR SELECT
USING (is_admin());

-- Create product search materialized view for full-text search
CREATE MATERIALIZED VIEW public.product_search AS
SELECT 
  p.id,
  p.name,
  p.description,
  p.short_description,
  p.sku,
  p.price,
  p.sale_price,
  p.is_active,
  p.is_featured,
  p.tags,
  c.name as category_name,
  sc.name as subcategory_name,
  setweight(to_tsvector('english', COALESCE(p.name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(p.description, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(p.short_description, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(array_to_string(p.tags, ' '), '')), 'D') as search_vector
FROM public.products p
LEFT JOIN public.categories c ON p.category_id = c.id
LEFT JOIN public.subcategories sc ON p.subcategory_id = sc.id
WHERE p.is_active = true;

-- Create index for full-text search
CREATE INDEX idx_product_search_vector ON public.product_search USING GIN(search_vector);

-- Create index for analytics events
CREATE INDEX idx_analytics_events_type_created ON public.analytics_events(event_type, created_at DESC);
CREATE INDEX idx_analytics_events_user_created ON public.analytics_events(user_id, created_at DESC);

-- Create indexes for order status history
CREATE INDEX idx_order_status_history_order_id ON public.order_status_history(order_id);
CREATE INDEX idx_order_status_history_created_at ON public.order_status_history(created_at DESC);

-- Create indexes for inventory movements
CREATE INDEX idx_inventory_movements_variant_id ON public.inventory_movements(product_variant_id);
CREATE INDEX idx_inventory_movements_created_at ON public.inventory_movements(created_at DESC);
CREATE INDEX idx_inventory_movements_order_id ON public.inventory_movements(order_id);

-- Function to refresh product search materialized view
CREATE OR REPLACE FUNCTION refresh_product_search()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.product_search;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track inventory movement
CREATE OR REPLACE FUNCTION track_inventory_movement(
  p_variant_id UUID,
  p_movement_type TEXT,
  p_quantity_change INTEGER,
  p_order_id UUID DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  current_stock INTEGER;
  new_stock INTEGER;
BEGIN
  -- Get current stock
  SELECT stock_quantity INTO current_stock
  FROM public.product_variants
  WHERE id = p_variant_id;

  -- Calculate new stock
  new_stock := current_stock + p_quantity_change;

  -- Update stock in product_variants
  UPDATE public.product_variants
  SET stock_quantity = new_stock,
      updated_at = now()
  WHERE id = p_variant_id;

  -- Insert inventory movement record
  INSERT INTO public.inventory_movements (
    product_variant_id,
    movement_type,
    quantity_change,
    previous_quantity,
    new_quantity,
    order_id,
    notes,
    created_by
  ) VALUES (
    p_variant_id,
    p_movement_type,
    p_quantity_change,
    current_stock,
    new_stock,
    p_order_id,
    p_notes,
    auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;