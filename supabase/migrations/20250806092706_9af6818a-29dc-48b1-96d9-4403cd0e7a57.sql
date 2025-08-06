-- Add missing columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS popularity_score DECIMAL(5,2) DEFAULT 0;

-- Add description column to matting_options table
ALTER TABLE public.matting_options 
ADD COLUMN IF NOT EXISTS description TEXT;