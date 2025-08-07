-- Create product variants for the Personalized Photo Frames
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

    -- Only proceed if we found the product
    IF product_uuid IS NOT NULL THEN
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
        (aspect_ratio_uuid, orientation_uuid, black_color_uuid, thickness_uuid, '/materials/black_wood_thick_1x1.png', 'Black wood frame preview', true)
        ON CONFLICT DO NOTHING;
    END IF;
    
END $$;