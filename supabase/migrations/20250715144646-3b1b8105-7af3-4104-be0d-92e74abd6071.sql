-- Update problematic Unsplash URLs with working placeholder images
UPDATE product_images 
SET image_url = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800&q=80'
WHERE image_url LIKE '%unsplash.com%' 
AND image_url NOT LIKE '%ixlib=rb-4.0.3%';

-- Add backup placeholder for any remaining broken images
UPDATE product_images 
SET image_url = 'https://via.placeholder.com/800x800/f3f4f6/6b7280?text=Product+Image'
WHERE image_url IS NULL OR image_url = '';