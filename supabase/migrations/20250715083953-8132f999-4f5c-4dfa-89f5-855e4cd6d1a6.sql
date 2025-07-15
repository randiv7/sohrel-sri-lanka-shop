-- Insert Categories
INSERT INTO public.categories (id, name, slug, description, image_url, is_active, display_order) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Graphic Tees', 'graphic-tees', 'Eye-catching designs and artistic graphics', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=600', true, 1),
('550e8400-e29b-41d4-a716-446655440002', 'Minimalist', 'minimalist', 'Clean, simple designs for the modern look', 'https://images.unsplash.com/photo-1556821840-3a9b5bbfe21e?w=800&h=600', true, 2),
('550e8400-e29b-41d4-a716-446655440003', 'Vintage Collection', 'vintage-collection', 'Retro-inspired designs with a classic feel', 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&h=600', true, 3),
('550e8400-e29b-41d4-a716-446655440004', 'Plain Essentials', 'plain-essentials', 'Basic tees in premium quality fabrics', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=600', true, 4);

-- Insert Subcategories
INSERT INTO public.subcategories (id, category_id, name, slug, description, is_active, display_order) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Abstract Art', 'abstract-art', 'Modern abstract designs', true, 1),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Typography', 'typography', 'Text-based designs and quotes', true, 2),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Logo Designs', 'logo-designs', 'Simple logo and brand designs', true, 1),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', 'Retro Graphics', 'retro-graphics', 'Vintage-inspired graphics', true, 1);

-- Insert 10 Mock Products
INSERT INTO public.products (id, name, slug, description, short_description, price, sale_price, category_id, subcategory_id, sku, is_featured, is_active, meta_title, meta_description, tags) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'Abstract Waves Graphic Tee', 'abstract-waves-graphic-tee', 'A stunning abstract wave design that captures the essence of modern art. Made from premium 100% cotton with a comfortable fit perfect for casual wear.', 'Modern abstract wave design on premium cotton', 2500.00, 2250.00, '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'AWT-001', true, true, 'Abstract Waves Graphic T-Shirt | SOHREL', 'Modern abstract wave design t-shirt in premium cotton. Perfect for casual wear and artistic expression.', ARRAY['abstract', 'waves', 'graphic', 'art']),

('770e8400-e29b-41d4-a716-446655440002', 'Minimalist Logo Tee', 'minimalist-logo-tee', 'Clean and simple design featuring our signature minimalist logo. Perfect for those who appreciate understated elegance.', 'Clean minimalist logo design', 1800.00, NULL, '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440003', 'MLT-002', true, true, 'Minimalist Logo T-Shirt | SOHREL', 'Simple and elegant logo design t-shirt for modern minimalist style.', ARRAY['minimalist', 'logo', 'simple', 'clean']),

('770e8400-e29b-41d4-a716-446655440003', 'Vintage Typography Design', 'vintage-typography-design', 'Retro-inspired typography design that brings back the classic era. Features vintage fonts and distressed finishing.', 'Retro typography with vintage appeal', 3200.00, 2880.00, '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440004', 'VTD-003', true, true, 'Vintage Typography T-Shirt | SOHREL', 'Retro-inspired typography design with classic vintage appeal.', ARRAY['vintage', 'typography', 'retro', 'classic']),

('770e8400-e29b-41d4-a716-446655440004', 'Plain White Essential', 'plain-white-essential', 'The perfect white tee made from premium organic cotton. A wardrobe essential that goes with everything.', 'Premium organic cotton white tee', 1500.00, NULL, '550e8400-e29b-41d4-a716-446655440004', NULL, 'PWE-004', false, true, 'Plain White Essential T-Shirt | SOHREL', 'Premium organic cotton white t-shirt. A wardrobe essential for every occasion.', ARRAY['plain', 'white', 'essential', 'organic']),

('770e8400-e29b-41d4-a716-446655440005', 'Geometric Pattern Tee', 'geometric-pattern-tee', 'Bold geometric patterns that make a statement. Modern design with sharp lines and vibrant contrasts.', 'Bold geometric patterns and modern design', 2800.00, NULL, '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'GPT-005', true, true, 'Geometric Pattern T-Shirt | SOHREL', 'Bold geometric pattern t-shirt with modern design and vibrant contrasts.', ARRAY['geometric', 'pattern', 'bold', 'modern']),

('770e8400-e29b-41d4-a716-446655440006', 'Inspirational Quote Tee', 'inspirational-quote-tee', 'Motivational typography design featuring an inspiring quote. Perfect for spreading positive vibes wherever you go.', 'Motivational quote in stylish typography', 2200.00, 1980.00, '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', 'IQT-006', false, true, 'Inspirational Quote T-Shirt | SOHREL', 'Motivational typography t-shirt with inspiring quotes for positive vibes.', ARRAY['quote', 'inspiration', 'typography', 'motivation']),

('770e8400-e29b-41d4-a716-446655440007', 'Sunset Gradient Design', 'sunset-gradient-design', 'Beautiful sunset gradient design that captures the magic of golden hour. Vibrant colors that transition seamlessly.', 'Sunset gradient with vibrant colors', 2600.00, NULL, '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'SGD-007', true, true, 'Sunset Gradient T-Shirt | SOHREL', 'Beautiful sunset gradient design with vibrant transitioning colors.', ARRAY['sunset', 'gradient', 'colorful', 'vibrant']),

('770e8400-e29b-41d4-a716-446655440008', 'Black Essential Tee', 'black-essential-tee', 'The perfect black tee in premium cotton blend. Versatile and comfortable, perfect for layering or wearing alone.', 'Premium black cotton blend essential', 1600.00, NULL, '550e8400-e29b-41d4-a716-446655440004', NULL, 'BET-008', false, true, 'Black Essential T-Shirt | SOHREL', 'Premium black cotton blend t-shirt. Versatile essential for any wardrobe.', ARRAY['black', 'essential', 'versatile', 'premium']),

('770e8400-e29b-41d4-a716-446655440009', 'Nature Mountain Print', 'nature-mountain-print', 'Stunning mountain landscape print for nature lovers. Detailed artwork featuring majestic peaks and serene valleys.', 'Mountain landscape print for nature lovers', 2900.00, 2610.00, '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'NMP-009', true, true, 'Nature Mountain Print T-Shirt | SOHREL', 'Mountain landscape print t-shirt for nature enthusiasts and outdoor lovers.', ARRAY['nature', 'mountain', 'landscape', 'outdoor']),

('770e8400-e29b-41d4-a716-446655440010', 'Urban Street Style', 'urban-street-style', 'Edgy urban design inspired by street culture. Bold graphics with a contemporary street art aesthetic.', 'Urban street art inspired design', 2400.00, NULL, '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'USS-010', false, true, 'Urban Street Style T-Shirt | SOHREL', 'Urban street art inspired t-shirt with bold contemporary graphics.', ARRAY['urban', 'street', 'contemporary', 'edgy']);

-- Insert Product Images
INSERT INTO public.product_images (product_id, image_url, alt_text, is_primary, display_order) VALUES
-- Abstract Waves Graphic Tee
('770e8400-e29b-41d4-a716-446655440001', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800', 'Abstract Waves Graphic Tee - Front View', true, 1),
('770e8400-e29b-41d4-a716-446655440001', 'https://images.unsplash.com/photo-1556821840-3a9b5bbfe21e?w=800&h=800', 'Abstract Waves Graphic Tee - Back View', false, 2),

-- Minimalist Logo Tee
('770e8400-e29b-41d4-a716-446655440002', 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&h=800', 'Minimalist Logo Tee - Front View', true, 1),

-- Vintage Typography Design
('770e8400-e29b-41d4-a716-446655440003', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800', 'Vintage Typography Design - Front View', true, 1),
('770e8400-e29b-41d4-a716-446655440003', 'https://images.unsplash.com/photo-1556821840-3a9b5bbfe21e?w=800&h=800', 'Vintage Typography Design - Detail View', false, 2),

-- Plain White Essential
('770e8400-e29b-41d4-a716-446655440004', 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&h=800', 'Plain White Essential - Front View', true, 1),

-- Geometric Pattern Tee
('770e8400-e29b-41d4-a716-446655440005', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800', 'Geometric Pattern Tee - Front View', true, 1),

-- Inspirational Quote Tee
('770e8400-e29b-41d4-a716-446655440006', 'https://images.unsplash.com/photo-1556821840-3a9b5bbfe21e?w=800&h=800', 'Inspirational Quote Tee - Front View', true, 1),

-- Sunset Gradient Design
('770e8400-e29b-41d4-a716-446655440007', 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&h=800', 'Sunset Gradient Design - Front View', true, 1),

-- Black Essential Tee
('770e8400-e29b-41d4-a716-446655440008', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800', 'Black Essential Tee - Front View', true, 1),

-- Nature Mountain Print
('770e8400-e29b-41d4-a716-446655440009', 'https://images.unsplash.com/photo-1556821840-3a9b5bbfe21e?w=800&h=800', 'Nature Mountain Print - Front View', true, 1),

-- Urban Street Style
('770e8400-e29b-41d4-a716-446655440010', 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&h=800', 'Urban Street Style - Front View', true, 1);

-- Insert Product Variants (Sizes for each product)
INSERT INTO public.product_variants (product_id, size, color, price, stock_quantity, sku) VALUES
-- Abstract Waves Graphic Tee
('770e8400-e29b-41d4-a716-446655440001', 'XS', 'Black', 2500.00, 10, 'AWT-001-XS-BLK'),
('770e8400-e29b-41d4-a716-446655440001', 'S', 'Black', 2500.00, 15, 'AWT-001-S-BLK'),
('770e8400-e29b-41d4-a716-446655440001', 'M', 'Black', 2500.00, 20, 'AWT-001-M-BLK'),
('770e8400-e29b-41d4-a716-446655440001', 'L', 'Black', 2500.00, 15, 'AWT-001-L-BLK'),
('770e8400-e29b-41d4-a716-446655440001', 'XL', 'Black', 2500.00, 10, 'AWT-001-XL-BLK'),

-- Minimalist Logo Tee
('770e8400-e29b-41d4-a716-446655440002', 'S', 'White', 1800.00, 12, 'MLT-002-S-WHT'),
('770e8400-e29b-41d4-a716-446655440002', 'M', 'White', 1800.00, 18, 'MLT-002-M-WHT'),
('770e8400-e29b-41d4-a716-446655440002', 'L', 'White', 1800.00, 15, 'MLT-002-L-WHT'),
('770e8400-e29b-41d4-a716-446655440002', 'XL', 'White', 1800.00, 8, 'MLT-002-XL-WHT'),

-- Vintage Typography Design
('770e8400-e29b-41d4-a716-446655440003', 'S', 'Gray', 3200.00, 8, 'VTD-003-S-GRY'),
('770e8400-e29b-41d4-a716-446655440003', 'M', 'Gray', 3200.00, 12, 'VTD-003-M-GRY'),
('770e8400-e29b-41d4-a716-446655440003', 'L', 'Gray', 3200.00, 10, 'VTD-003-L-GRY'),

-- Plain White Essential
('770e8400-e29b-41d4-a716-446655440004', 'XS', 'White', 1500.00, 20, 'PWE-004-XS-WHT'),
('770e8400-e29b-41d4-a716-446655440004', 'S', 'White', 1500.00, 25, 'PWE-004-S-WHT'),
('770e8400-e29b-41d4-a716-446655440004', 'M', 'White', 1500.00, 30, 'PWE-004-M-WHT'),
('770e8400-e29b-41d4-a716-446655440004', 'L', 'White', 1500.00, 25, 'PWE-004-L-WHT'),
('770e8400-e29b-41d4-a716-446655440004', 'XL', 'White', 1500.00, 15, 'PWE-004-XL-WHT'),

-- Geometric Pattern Tee
('770e8400-e29b-41d4-a716-446655440005', 'S', 'Navy', 2800.00, 10, 'GPT-005-S-NVY'),
('770e8400-e29b-41d4-a716-446655440005', 'M', 'Navy', 2800.00, 15, 'GPT-005-M-NVY'),
('770e8400-e29b-41d4-a716-446655440005', 'L', 'Navy', 2800.00, 12, 'GPT-005-L-NVY'),

-- Inspirational Quote Tee
('770e8400-e29b-41d4-a716-446655440006', 'S', 'Black', 2200.00, 8, 'IQT-006-S-BLK'),
('770e8400-e29b-41d4-a716-446655440006', 'M', 'Black', 2200.00, 12, 'IQT-006-M-BLK'),
('770e8400-e29b-41d4-a716-446655440006', 'L', 'Black', 2200.00, 10, 'IQT-006-L-BLK'),

-- Sunset Gradient Design
('770e8400-e29b-41d4-a716-446655440007', 'S', 'Multi', 2600.00, 6, 'SGD-007-S-MLT'),
('770e8400-e29b-41d4-a716-446655440007', 'M', 'Multi', 2600.00, 10, 'SGD-007-M-MLT'),
('770e8400-e29b-41d4-a716-446655440007', 'L', 'Multi', 2600.00, 8, 'SGD-007-L-MLT'),

-- Black Essential Tee
('770e8400-e29b-41d4-a716-446655440008', 'XS', 'Black', 1600.00, 15, 'BET-008-XS-BLK'),
('770e8400-e29b-41d4-a716-446655440008', 'S', 'Black', 1600.00, 20, 'BET-008-S-BLK'),
('770e8400-e29b-41d4-a716-446655440008', 'M', 'Black', 1600.00, 25, 'BET-008-M-BLK'),
('770e8400-e29b-41d4-a716-446655440008', 'L', 'Black', 1600.00, 20, 'BET-008-L-BLK'),
('770e8400-e29b-41d4-a716-446655440008', 'XL', 'Black', 1600.00, 12, 'BET-008-XL-BLK'),

-- Nature Mountain Print
('770e8400-e29b-41d4-a716-446655440009', 'S', 'Green', 2900.00, 5, 'NMP-009-S-GRN'),
('770e8400-e29b-41d4-a716-446655440009', 'M', 'Green', 2900.00, 8, 'NMP-009-M-GRN'),
('770e8400-e29b-41d4-a716-446655440009', 'L', 'Green', 2900.00, 6, 'NMP-009-L-GRN'),

-- Urban Street Style
('770e8400-e29b-41d4-a716-446655440010', 'S', 'Black', 2400.00, 7, 'USS-010-S-BLK'),
('770e8400-e29b-41d4-a716-446655440010', 'M', 'Black', 2400.00, 10, 'USS-010-M-BLK'),
('770e8400-e29b-41d4-a716-446655440010', 'L', 'Black', 2400.00, 8, 'USS-010-L-BLK');