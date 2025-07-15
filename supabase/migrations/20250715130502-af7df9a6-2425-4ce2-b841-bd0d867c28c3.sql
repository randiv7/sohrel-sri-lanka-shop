-- COD Backend Database Schema Implementation

-- 1. COD Orders table for COD-specific order details
CREATE TABLE public.cod_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  verification_method TEXT NOT NULL DEFAULT 'phone_call', -- 'phone_call', 'sms', 'whatsapp'
  verification_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'verified', 'failed', 'cancelled'
  verification_attempts INTEGER NOT NULL DEFAULT 0,
  max_verification_attempts INTEGER NOT NULL DEFAULT 3,
  delivery_preference TEXT, -- 'morning', 'afternoon', 'evening', 'weekend'
  special_instructions TEXT,
  customer_availability JSONB, -- Store availability schedule
  verification_notes TEXT,
  is_high_value BOOLEAN DEFAULT false, -- Flag for orders requiring special handling
  cod_amount NUMERIC NOT NULL,
  cod_fee NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. COD Verification table for tracking verification attempts
CREATE TABLE public.cod_verification (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cod_order_id UUID NOT NULL REFERENCES public.cod_orders(id) ON DELETE CASCADE,
  verification_type TEXT NOT NULL, -- 'phone_call', 'sms', 'whatsapp', 'email'
  attempted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL, -- 'success', 'failed', 'no_answer', 'wrong_number', 'customer_declined'
  contact_number TEXT,
  verification_code TEXT,
  response_details JSONB, -- Store verification response data
  attempted_by UUID REFERENCES auth.users(id),
  notes TEXT,
  next_attempt_at TIMESTAMP WITH TIME ZONE
);

-- 3. COD Delivery Attempts table for delivery management
CREATE TABLE public.cod_delivery_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cod_order_id UUID NOT NULL REFERENCES public.cod_orders(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  attempted_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'in_transit', 'delivered', 'failed', 'customer_unavailable', 'address_issue', 'cancelled'
  delivery_agent_id UUID REFERENCES auth.users(id),
  customer_feedback TEXT,
  failure_reason TEXT,
  location_coordinates POINT,
  delivery_notes TEXT,
  photo_proof_url TEXT, -- URL to delivery proof photo
  signature_url TEXT, -- URL to customer signature
  amount_collected NUMERIC DEFAULT 0,
  payment_method_used TEXT, -- 'cash', 'card', 'mobile_payment'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. COD Fees Configuration table for dynamic fee management
CREATE TABLE public.cod_fees_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  province TEXT NOT NULL,
  district TEXT,
  min_order_amount NUMERIC NOT NULL DEFAULT 0,
  max_order_amount NUMERIC,
  fee_type TEXT NOT NULL DEFAULT 'percentage', -- 'fixed', 'percentage', 'tiered'
  fee_value NUMERIC NOT NULL,
  max_fee_amount NUMERIC, -- Cap for percentage-based fees
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 1, -- For handling overlapping rules
  effective_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  effective_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. COD Payment Collection table for payment tracking
CREATE TABLE public.cod_payment_collection (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cod_order_id UUID NOT NULL REFERENCES public.cod_orders(id) ON DELETE CASCADE,
  delivery_attempt_id UUID REFERENCES public.cod_delivery_attempts(id),
  collected_amount NUMERIC NOT NULL,
  expected_amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL, -- 'cash', 'card', 'mobile_payment', 'partial_payment'
  collection_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'collected', 'partial', 'failed', 'refunded'
  collected_by UUID REFERENCES auth.users(id),
  collected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  discrepancy_amount NUMERIC DEFAULT 0,
  discrepancy_reason TEXT,
  receipt_number TEXT,
  bank_deposit_reference TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_cod_orders_order_id ON public.cod_orders(order_id);
CREATE INDEX idx_cod_orders_verification_status ON public.cod_orders(verification_status);
CREATE INDEX idx_cod_verification_cod_order_id ON public.cod_verification(cod_order_id);
CREATE INDEX idx_cod_verification_status ON public.cod_verification(status);
CREATE INDEX idx_cod_delivery_attempts_cod_order_id ON public.cod_delivery_attempts(cod_order_id);
CREATE INDEX idx_cod_delivery_attempts_status ON public.cod_delivery_attempts(status);
CREATE INDEX idx_cod_delivery_attempts_scheduled_at ON public.cod_delivery_attempts(scheduled_at);
CREATE INDEX idx_cod_fees_config_province ON public.cod_fees_config(province);
CREATE INDEX idx_cod_fees_config_active ON public.cod_fees_config(is_active);
CREATE INDEX idx_cod_payment_collection_cod_order_id ON public.cod_payment_collection(cod_order_id);
CREATE INDEX idx_cod_payment_collection_status ON public.cod_payment_collection(collection_status);

-- Enable Row Level Security
ALTER TABLE public.cod_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cod_verification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cod_delivery_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cod_fees_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cod_payment_collection ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cod_orders
CREATE POLICY "Users can view their own COD orders" 
ON public.cod_orders 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = cod_orders.order_id 
    AND (orders.user_id = auth.uid() OR (auth.uid() IS NULL AND orders.guest_email IS NOT NULL))
  )
);

CREATE POLICY "System can insert COD orders" 
ON public.cod_orders 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = cod_orders.order_id 
    AND (orders.user_id = auth.uid() OR (auth.uid() IS NULL AND orders.guest_email IS NOT NULL))
  )
);

CREATE POLICY "Admins can manage all COD orders" 
ON public.cod_orders 
FOR ALL 
USING (is_admin());

-- RLS Policies for cod_verification
CREATE POLICY "Users can view verification for their orders" 
ON public.cod_verification 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.cod_orders 
    JOIN public.orders ON orders.id = cod_orders.order_id
    WHERE cod_orders.id = cod_verification.cod_order_id 
    AND (orders.user_id = auth.uid() OR (auth.uid() IS NULL AND orders.guest_email IS NOT NULL))
  )
);

CREATE POLICY "Admins can manage verification records" 
ON public.cod_verification 
FOR ALL 
USING (is_admin());

-- RLS Policies for cod_delivery_attempts
CREATE POLICY "Users can view delivery attempts for their orders" 
ON public.cod_delivery_attempts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.cod_orders 
    JOIN public.orders ON orders.id = cod_orders.order_id
    WHERE cod_orders.id = cod_delivery_attempts.cod_order_id 
    AND (orders.user_id = auth.uid() OR (auth.uid() IS NULL AND orders.guest_email IS NOT NULL))
  )
);

CREATE POLICY "Admins and delivery agents can manage delivery attempts" 
ON public.cod_delivery_attempts 
FOR ALL 
USING (is_admin() OR auth.uid() = delivery_agent_id);

-- RLS Policies for cod_fees_config
CREATE POLICY "Everyone can view active COD fees" 
ON public.cod_fees_config 
FOR SELECT 
USING (is_active = true AND (effective_until IS NULL OR effective_until > now()));

CREATE POLICY "Admins can manage COD fees" 
ON public.cod_fees_config 
FOR ALL 
USING (is_admin());

-- RLS Policies for cod_payment_collection
CREATE POLICY "Users can view payment collection for their orders" 
ON public.cod_payment_collection 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.cod_orders 
    JOIN public.orders ON orders.id = cod_orders.order_id
    WHERE cod_orders.id = cod_payment_collection.cod_order_id 
    AND (orders.user_id = auth.uid() OR (auth.uid() IS NULL AND orders.guest_email IS NOT NULL))
  )
);

CREATE POLICY "Admins can manage payment collection records" 
ON public.cod_payment_collection 
FOR ALL 
USING (is_admin());

-- Create triggers for updated_at columns
CREATE TRIGGER update_cod_orders_updated_at
  BEFORE UPDATE ON public.cod_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cod_delivery_attempts_updated_at
  BEFORE UPDATE ON public.cod_delivery_attempts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cod_fees_config_updated_at
  BEFORE UPDATE ON public.cod_fees_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cod_payment_collection_updated_at
  BEFORE UPDATE ON public.cod_payment_collection
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default COD fee configurations for Sri Lankan provinces
INSERT INTO public.cod_fees_config (province, fee_type, fee_value, max_fee_amount, priority) VALUES
('Western', 'fixed', 200, NULL, 1),
('Central', 'fixed', 250, NULL, 1),
('Southern', 'fixed', 300, NULL, 1),
('Northern', 'fixed', 400, NULL, 1),
('Eastern', 'fixed', 350, NULL, 1),
('North Western', 'fixed', 300, NULL, 1),
('North Central', 'fixed', 350, NULL, 1),
('Uva', 'fixed', 350, NULL, 1),
('Sabaragamuwa', 'fixed', 300, NULL, 1);

-- Add unique constraints
ALTER TABLE public.cod_orders ADD CONSTRAINT uk_cod_orders_order_id UNIQUE (order_id);
ALTER TABLE public.cod_fees_config ADD CONSTRAINT uk_cod_fees_province_district UNIQUE (province, district, min_order_amount, effective_from);