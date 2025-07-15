-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true);

-- Create policies for product images bucket
CREATE POLICY "Allow public access to product images" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Allow admins to upload product images" ON storage.objects
FOR INSERT 
WITH CHECK (bucket_id = 'product-images' AND is_admin());

CREATE POLICY "Allow admins to update product images" ON storage.objects
FOR UPDATE 
USING (bucket_id = 'product-images' AND is_admin());

CREATE POLICY "Allow admins to delete product images" ON storage.objects
FOR DELETE 
USING (bucket_id = 'product-images' AND is_admin());