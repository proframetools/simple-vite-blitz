-- Add featured products functionality
-- Add is_featured column to products table

-- Add is_featured column if it doesn't exist
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Add popularity_score column if it doesn't exist for carousel sorting
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS popularity_score INTEGER DEFAULT 0;

-- Add review columns if they don't exist
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(2,1) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Mark some products as featured for the carousel
UPDATE public.products SET 
  is_featured = true,
  popularity_score = CASE 
    WHEN name = 'Classic Wooden Frame' THEN 95
    WHEN name = 'Modern Metal Frame' THEN 88
    WHEN name = 'Rustic Barn Wood Frame' THEN 92
    WHEN name = 'Minimalist Acrylic Frame' THEN 85
    WHEN name = 'Ornate Gold Frame' THEN 78
    WHEN name = 'Industrial Steel Frame' THEN 82
    ELSE 50
  END,
  average_rating = CASE 
    WHEN name = 'Classic Wooden Frame' THEN 4.8
    WHEN name = 'Modern Metal Frame' THEN 4.6
    WHEN name = 'Rustic Barn Wood Frame' THEN 4.9
    WHEN name = 'Minimalist Acrylic Frame' THEN 4.5
    WHEN name = 'Ornate Gold Frame' THEN 4.3
    WHEN name = 'Industrial Steel Frame' THEN 4.4
    ELSE 4.0
  END,
  review_count = CASE 
    WHEN name = 'Classic Wooden Frame' THEN 127
    WHEN name = 'Modern Metal Frame' THEN 89
    WHEN name = 'Rustic Barn Wood Frame' THEN 156
    WHEN name = 'Minimalist Acrylic Frame' THEN 73
    WHEN name = 'Ornate Gold Frame' THEN 45
    WHEN name = 'Industrial Steel Frame' THEN 62
    ELSE 25
  END
WHERE name IN (
  'Classic Wooden Frame', 
  'Modern Metal Frame', 
  'Rustic Barn Wood Frame', 
  'Minimalist Acrylic Frame',
  'Ornate Gold Frame',
  'Industrial Steel Frame'
);

-- Mark new Indian products as featured too
UPDATE public.products SET 
  is_featured = true,
  popularity_score = CASE 
    WHEN name = 'Traditional Wooden Frame' THEN 87
    WHEN name = 'Premium Metal Frame' THEN 84
    ELSE popularity_score
  END,
  average_rating = CASE 
    WHEN name = 'Traditional Wooden Frame' THEN 4.7
    WHEN name = 'Premium Metal Frame' THEN 4.5
    ELSE average_rating
  END,
  review_count = CASE 
    WHEN name = 'Traditional Wooden Frame' THEN 98
    WHEN name = 'Premium Metal Frame' THEN 67
    ELSE review_count
  END
WHERE name IN ('Traditional Wooden Frame', 'Premium Metal Frame');

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_products_featured 
ON public.products(is_featured, popularity_score DESC) 
WHERE is_active = true;

-- Add index for homepage queries
CREATE INDEX IF NOT EXISTS idx_products_homepage 
ON public.products(is_active, popularity_score DESC, average_rating DESC);

-- Update the products table comment
COMMENT ON COLUMN public.products.is_featured IS 'Whether this product should be shown in the featured carousel';
COMMENT ON COLUMN public.products.popularity_score IS 'Score from 0-100 used for sorting popular products';
COMMENT ON COLUMN public.products.average_rating IS 'Average customer rating (1-5 stars)';
COMMENT ON COLUMN public.products.review_count IS 'Total number of customer reviews'; 