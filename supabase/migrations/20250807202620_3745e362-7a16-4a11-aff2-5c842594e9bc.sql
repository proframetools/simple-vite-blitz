-- Add Square orientation (check if exists first)
INSERT INTO frame_orientations (name, display_name, is_active) 
SELECT 'square', 'Square', true
WHERE NOT EXISTS (SELECT 1 FROM frame_orientations WHERE name = 'square');

-- Add 1:1 aspect ratio (check if exists first)
INSERT INTO aspect_ratios (name, display_name, width_ratio, height_ratio, is_active)
SELECT '1x1', '1:1 Square', 1, 1, true
WHERE NOT EXISTS (SELECT 1 FROM aspect_ratios WHERE name = '1x1');

-- Add missing square frame sizes
INSERT INTO frame_sizes (name, display_name, width_inches, height_inches, price_multiplier, is_active) 
SELECT * FROM (VALUES
    ('4x4', '4" × 4"', 4, 4, 1.0, true),
    ('6x6', '6" × 6"', 6, 6, 1.5, true),
    ('8x8', '8" × 8"', 8, 8, 2.0, true),
    ('10x10', '10" × 10"', 10, 10, 2.5, true),
    ('12x12', '12" × 12"', 12, 12, 3.0, true),
    ('16x16', '16" × 16"', 16, 16, 4.0, true),
    ('20x20', '20" × 20"', 20, 20, 5.0, true),
    ('24x24', '24" × 24"', 24, 24, 6.0, true)
) AS new_sizes(name, display_name, width_inches, height_inches, price_multiplier, is_active)
WHERE NOT EXISTS (SELECT 1 FROM frame_sizes WHERE frame_sizes.name = new_sizes.name);

-- Add 2.5 inch thickness option
INSERT INTO frame_thickness (name, display_name, thickness_mm, width_inches, price_multiplier, price_adjustment, is_active)
SELECT 'thick_2_5', '2.5" Thick', 63.5, 2.5, 1.2, 15.00, true
WHERE NOT EXISTS (SELECT 1 FROM frame_thickness WHERE name = 'thick_2_5');

-- Update frame colors to reference material textures instead of hex codes
UPDATE frame_colors 
SET hex_code = '/materials/brown_wood_thick_1x1.png',
    display_name = 'Brown Wood'
WHERE name = 'brown';

UPDATE frame_colors 
SET hex_code = '/materials/black_wood_thick_1x1.png',
    display_name = 'Black Wood'  
WHERE name = 'black';

-- Create the main Personalized Photo Frames product
INSERT INTO products (
  name, 
  description, 
  base_price, 
  category, 
  material, 
  style, 
  image_url,
  stock_quantity,
  popularity_score,
  is_active
) 
SELECT 
  'Personalized Photo Frames',
  'Premium wooden photo frames with custom photo mounting. Available in rich brown and elegant black wood finishes with 2.5" thickness for a bold, substantial look. Perfect for showcasing your cherished memories.',
  49.99,
  'Custom Frames',
  'Wood',
  'Classic',
  '/materials/brown_wood_thick_1x1.png',
  100,
  95,
  true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Personalized Photo Frames');