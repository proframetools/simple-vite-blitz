
-- Create categories table for product organization
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create occasions table for specific use cases
CREATE TABLE public.occasions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tags table for flexible categorization
CREATE TABLE public.tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#6B7280',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Junction table for product categories (many-to-many)
CREATE TABLE public.product_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, category_id)
);

-- Junction table for product occasions (many-to-many)
CREATE TABLE public.product_occasions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  occasion_id UUID NOT NULL REFERENCES public.occasions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, occasion_id)
);

-- Junction table for product tags (many-to-many)
CREATE TABLE public.product_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, tag_id)
);

-- Product images table for multiple photos
CREATE TABLE public.product_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Product reviews table
CREATE TABLE public.product_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  review_text TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Wishlists table
CREATE TABLE public.wishlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT, -- For guest users
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id),
  UNIQUE(session_id, product_id)
);

-- Add new columns to products table
ALTER TABLE public.products ADD COLUMN stock_quantity INTEGER DEFAULT 0;
ALTER TABLE public.products ADD COLUMN average_rating DECIMAL(3,2) DEFAULT 0;
ALTER TABLE public.products ADD COLUMN review_count INTEGER DEFAULT 0;
ALTER TABLE public.products ADD COLUMN popularity_score INTEGER DEFAULT 0;

-- Enable RLS on new tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.occasions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_occasions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Public read policies for categories, occasions, and tags
CREATE POLICY "Anyone can view active categories" ON public.categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active occasions" ON public.occasions
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active tags" ON public.tags
  FOR SELECT USING (is_active = true);

-- Public read policies for product relationships
CREATE POLICY "Anyone can view product categories" ON public.product_categories
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view product occasions" ON public.product_occasions
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view product tags" ON public.product_tags
  FOR SELECT USING (true);

-- Public read policies for product images
CREATE POLICY "Anyone can view product images" ON public.product_images
  FOR SELECT USING (true);

-- Review policies
CREATE POLICY "Anyone can view approved reviews" ON public.product_reviews
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can create reviews" ON public.product_reviews
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own reviews" ON public.product_reviews
  FOR UPDATE USING (user_id = auth.uid());

-- Wishlist policies
CREATE POLICY "Users can manage their own wishlists" ON public.wishlists
  FOR ALL USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
    (auth.uid() IS NULL AND session_id IS NOT NULL)
  );

-- Create triggers for updating timestamps
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_occasions_updated_at BEFORE UPDATE ON public.occasions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_reviews_updated_at BEFORE UPDATE ON public.product_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample categories
INSERT INTO public.categories (name, slug, description) VALUES
  ('Traditional', 'traditional', 'Classic and timeless frame designs'),
  ('Modern', 'modern', 'Contemporary and sleek frame styles'),
  ('Minimalist', 'minimalist', 'Clean and simple frame designs'),
  ('Ornate', 'ornate', 'Decorative and elaborate frame styles'),
  ('Rustic', 'rustic', 'Natural and weathered frame designs'),
  ('Vintage', 'vintage', 'Retro and antique-inspired frames');

-- Insert sample occasions
INSERT INTO public.occasions (name, slug, description) VALUES
  ('Wedding', 'wedding', 'Perfect for wedding photos and memories'),
  ('Newborn', 'newborn', 'Gentle frames for baby photos'),
  ('Anniversary', 'anniversary', 'Celebrate milestone moments'),
  ('Graduation', 'graduation', 'Honor academic achievements'),
  ('Family Portrait', 'family-portrait', 'Beautiful family memories'),
  ('Holiday', 'holiday', 'Seasonal and festive occasions'),
  ('Travel', 'travel', 'Adventure and vacation memories'),
  ('Pet Portrait', 'pet-portrait', 'Beloved pet photography');

-- Insert sample tags
INSERT INTO public.tags (name, slug, color) VALUES
  ('Handcrafted', 'handcrafted', '#8B5A3C'),
  ('Premium', 'premium', '#D4AF37'),
  ('Eco-Friendly', 'eco-friendly', '#22C55E'),
  ('Custom Size', 'custom-size', '#3B82F6'),
  ('Fast Shipping', 'fast-shipping', '#F59E0B'),
  ('Popular', 'popular', '#EF4444'),
  ('New Arrival', 'new-arrival', '#10B981'),
  ('Limited Edition', 'limited-edition', '#8B5CF6');

-- Update existing products with sample data
UPDATE public.products SET 
  stock_quantity = 50,
  average_rating = 4.5,
  review_count = 12,
  popularity_score = 100
WHERE name = 'Classic Wooden Frame';

UPDATE public.products SET 
  stock_quantity = 35,
  average_rating = 4.3,
  review_count = 8,
  popularity_score = 85
WHERE name = 'Modern Metal Frame';

UPDATE public.products SET 
  stock_quantity = 25,
  average_rating = 4.7,
  review_count = 15,
  popularity_score = 120
WHERE name = 'Rustic Barn Wood Frame';

UPDATE public.products SET 
  stock_quantity = 40,
  average_rating = 4.2,
  review_count = 6,
  popularity_score = 75
WHERE name = 'Minimalist Acrylic Frame';

UPDATE public.products SET 
  stock_quantity = 15,
  average_rating = 4.8,
  review_count = 20,
  popularity_score = 150
WHERE name = 'Ornate Gold Frame';

UPDATE public.products SET 
  stock_quantity = 30,
  average_rating = 4.4,
  review_count = 10,
  popularity_score = 95
WHERE name = 'Industrial Steel Frame';
