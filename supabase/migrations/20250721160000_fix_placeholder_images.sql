
-- Replace via.placeholder.com URLs with reliable alternatives
UPDATE product_images 
SET image_url = 'https://placehold.co/800x800/f3f4f6/6b7280?text=Product+Image'
WHERE image_url LIKE '%via.placeholder.com%';

-- Replace any other broken placeholder patterns
UPDATE product_images 
SET image_url = 'https://placehold.co/800x800/f3f4f6/6b7280?text=Product+Image'
WHERE image_url LIKE '%placeholder.com%' OR image_url LIKE '%placehold.it%';

-- Add a function to validate image URLs (optional)
CREATE OR REPLACE FUNCTION validate_image_url(url TEXT) 
RETURNS BOOLEAN AS $$
BEGIN
  -- Basic URL validation - must start with http/https and not be a known broken service
  RETURN url ~ '^https?://' 
    AND url NOT LIKE '%via.placeholder.com%' 
    AND url NOT LIKE '%placehold.it%'
    AND LENGTH(url) > 10;
END;
$$ LANGUAGE plpgsql;

-- Add a trigger to prevent future broken placeholder URLs (optional)
CREATE OR REPLACE FUNCTION prevent_broken_image_urls()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.image_url IS NOT NULL AND NOT validate_image_url(NEW.image_url) THEN
    NEW.image_url := 'https://placehold.co/800x800/f3f4f6/6b7280?text=Product+Image';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to product_images table
DROP TRIGGER IF EXISTS validate_product_image_url ON product_images;
CREATE TRIGGER validate_product_image_url
  BEFORE INSERT OR UPDATE ON product_images
  FOR EACH ROW EXECUTE FUNCTION prevent_broken_image_urls();
