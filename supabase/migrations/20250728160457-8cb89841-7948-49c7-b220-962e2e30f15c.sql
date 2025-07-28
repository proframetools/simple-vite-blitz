-- Convert existing USD prices to INR using 1 USD = 83 INR exchange rate
-- Update products table
UPDATE products SET base_price = base_price * 83;

-- Update frame_colors table 
UPDATE frame_colors SET price_adjustment = price_adjustment * 83;

-- Update matting_options table
UPDATE matting_options SET price_adjustment = price_adjustment * 83;