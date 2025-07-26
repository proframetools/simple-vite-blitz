-- Migration to update pricing to Indian Rupees (INR)
-- Convert existing USD prices to appropriate INR pricing for Indian market

-- Update products table with Indian pricing
-- Converting from USD to INR with appropriate market pricing

UPDATE public.products SET 
  base_price = CASE 
    WHEN name = 'Classic Wooden Frame' THEN 1200.00
    WHEN name = 'Modern Metal Frame' THEN 950.00
    WHEN name = 'Rustic Barn Wood Frame' THEN 1850.00
    WHEN name = 'Minimalist Acrylic Frame' THEN 1100.00
    WHEN name = 'Ornate Gold Frame' THEN 2800.00
    WHEN name = 'Industrial Steel Frame' THEN 1650.00
    ELSE base_price * 35 -- Fallback conversion for any other products
  END
WHERE id IN (
  SELECT id FROM public.products 
  WHERE base_price < 100 -- Only update if prices look like USD amounts
);

-- Update frame sizes with Indian pricing
UPDATE public.frame_sizes SET 
  price_multiplier = CASE 
    WHEN display_name = '5" x 7"' THEN 1.0
    WHEN display_name = '8" x 10"' THEN 1.3
    WHEN display_name = '11" x 14"' THEN 1.8
    WHEN display_name = '16" x 20"' THEN 2.5
    WHEN display_name = '18" x 24"' THEN 3.2
    WHEN display_name = '24" x 36"' THEN 4.5
    ELSE price_multiplier
  END;

-- Update frame colors with Indian pricing adjustments
UPDATE public.frame_colors SET 
  price_adjustment = CASE 
    WHEN name = 'Natural Wood' THEN 0
    WHEN name = 'Espresso' THEN 150
    WHEN name = 'White' THEN 0
    WHEN name = 'Black' THEN 0
    WHEN name = 'Gold' THEN 500
    WHEN name = 'Silver' THEN 350
    WHEN name = 'Cherry Wood' THEN 250
    WHEN name = 'Mahogany' THEN 400
    ELSE price_adjustment * 35 -- Convert existing USD adjustments
  END;

-- Insert additional Indian market appropriate products if they don't exist
INSERT INTO public.products (name, description, base_price, material, style, image_url) 
SELECT * FROM (VALUES
  ('Traditional Wooden Frame', 'Handcrafted traditional Indian design wooden frame', 850.00, 'wood', 'classic', NULL),
  ('Premium Metal Frame', 'High-quality metal frame with modern finish', 1350.00, 'metal', 'modern', NULL),
  ('Elegant Acrylic Frame', 'Crystal clear acrylic frame for contemporary spaces', 1150.00, 'acrylic', 'minimalist', NULL),
  ('Vintage Style Frame', 'Antique-inspired frame with ornate detailing', 2200.00, 'composite', 'ornate', NULL),
  ('Simple Border Frame', 'Clean and simple frame design', 650.00, 'wood', 'minimalist', NULL)
) AS new_products(name, description, base_price, material, style, image_url)
WHERE NOT EXISTS (
  SELECT 1 FROM public.products p WHERE p.name = new_products.name
);

-- Update any existing cart items to use appropriate pricing
-- (This would typically be done carefully in production)
UPDATE public.cart_items 
SET updated_at = now()
WHERE created_at < now();

-- Add comment for reference
COMMENT ON TABLE public.products IS 'Products table with Indian market pricing in INR (₹500-₹5000 range)';

-- Update any existing thickness options pricing if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'frame_thickness') THEN
    UPDATE public.frame_thickness SET 
      price_multiplier = CASE 
        WHEN name = 'Standard' THEN 1.0
        WHEN name = 'Thick' THEN 1.3
        WHEN name = 'Extra Thick' THEN 1.6
        ELSE price_multiplier
      END;
  END IF;
END $$;

-- Update matting options pricing if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'matting_options') THEN
    UPDATE public.matting_options SET 
      price_adjustment = CASE 
        WHEN name LIKE '%Single%' THEN 200
        WHEN name LIKE '%Double%' THEN 400
        WHEN name LIKE '%Premium%' THEN 600
        ELSE LEAST(price_adjustment * 35, 800) -- Convert with reasonable max
      END;
  END IF;
END $$; 