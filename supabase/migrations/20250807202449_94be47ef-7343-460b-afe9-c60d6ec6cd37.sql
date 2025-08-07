-- Add Square orientation
INSERT INTO frame_orientations (name, display_name, is_active) 
VALUES ('square', 'Square', true)
ON CONFLICT (name) DO NOTHING;

-- Add 1:1 aspect ratio
INSERT INTO aspect_ratios (name, display_name, width_ratio, height_ratio, is_active)
VALUES ('1x1', '1:1 Square', 1, 1, true)
ON CONFLICT (name) DO NOTHING;

-- Add missing square frame sizes
INSERT INTO frame_sizes (name, display_name, width_inches, height_inches, price_multiplier, is_active) VALUES
('4x4', '4" × 4"', 4, 4, 1.0, true),
('6x6', '6" × 6"', 6, 6, 1.5, true),
('8x8', '8" × 8"', 8, 8, 2.0, true),
('10x10', '10" × 10"', 10, 10, 2.5, true),
('12x12', '12" × 12"', 12, 12, 3.0, true),
('16x16', '16" × 16"', 16, 16, 4.0, true),
('20x20', '20" × 20"', 20, 20, 5.0, true),
('24x24', '24" × 24"', 24, 24, 6.0, true)
ON CONFLICT (name) DO NOTHING;

-- Add 2.5 inch thickness option
INSERT INTO frame_thickness (name, display_name, thickness_mm, width_inches, price_multiplier, price_adjustment, is_active)
VALUES ('thick_2_5', '2.5" Thick', 63.5, 2.5, 1.2, 15.00, true)
ON CONFLICT (name) DO NOTHING;

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
) VALUES (
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
);

-- Get the product ID for creating variants
DO $$
DECLARE
    product_uuid UUID;
    aspect_ratio_uuid UUID;
    orientation_uuid UUID;
    thickness_uuid UUID;
    brown_color_uuid UUID;
    black_color_uuid UUID;
    size_record RECORD;
    color_record RECORD;
BEGIN
    -- Get UUIDs for the product and related entities
    SELECT id INTO product_uuid FROM products WHERE name = 'Personalized Photo Frames';
    SELECT id INTO aspect_ratio_uuid FROM aspect_ratios WHERE name = '1x1';
    SELECT id INTO orientation_uuid FROM frame_orientations WHERE name = 'square';
    SELECT id INTO thickness_uuid FROM frame_thickness WHERE name = 'thick_2_5';
    SELECT id INTO brown_color_uuid FROM frame_colors WHERE name = 'brown';
    SELECT id INTO black_color_uuid FROM frame_colors WHERE name = 'black';

    -- Create product variants for all square sizes and both colors
    FOR size_record IN SELECT id, name, price_multiplier FROM frame_sizes WHERE name IN ('4x4', '6x6', '8x8', '10x10', '12x12', '16x16', '20x20', '24x24')
    LOOP
        FOR color_record IN SELECT id, name FROM frame_colors WHERE name IN ('brown', 'black')
        LOOP
            INSERT INTO product_variants (
                product_id,
                aspect_ratio_id,
                orientation_id,
                size_id,
                color_id,
                thickness_id,
                price_adjustment,
                stock_quantity,
                is_active,
                sku
            ) VALUES (
                product_uuid,
                aspect_ratio_uuid,
                orientation_uuid,
                size_record.id,
                color_record.id,
                thickness_uuid,
                (size_record.price_multiplier - 1) * 25.00, -- Base price adjustment based on size
                50,
                true,
                'PF-' || UPPER(color_record.name) || '-' || UPPER(size_record.name) || '-25T'
            );
        END LOOP;
    END LOOP;
    
    -- Create preview images for the main combinations
    INSERT INTO preview_images (
        aspect_ratio_id,
        orientation_id,
        color_id,
        thickness_id,
        image_url,
        alt_text,
        is_active
    ) VALUES 
    (aspect_ratio_uuid, orientation_uuid, brown_color_uuid, thickness_uuid, '/materials/brown_wood_thick_1x1.png', 'Brown wood frame preview', true),
    (aspect_ratio_uuid, orientation_uuid, black_color_uuid, thickness_uuid, '/materials/black_wood_thick_1x1.png', 'Black wood frame preview', true);
    
END $$;