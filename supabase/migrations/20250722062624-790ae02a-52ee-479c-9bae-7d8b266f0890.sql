
-- Create matting options table
CREATE TABLE public.matting_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color_hex TEXT NOT NULL,
  thickness_inches DECIMAL(3,2) NOT NULL,
  is_double_mat BOOLEAN NOT NULL DEFAULT false,
  price_adjustment DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create frame thickness variations table
CREATE TABLE public.frame_thickness (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  width_inches DECIMAL(3,2) NOT NULL,
  price_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create uploaded photos table
CREATE TABLE public.uploaded_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  width_pixels INTEGER NOT NULL,
  height_pixels INTEGER NOT NULL,
  dpi INTEGER,
  storage_path TEXT NOT NULL,
  is_processed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create popular combinations table
CREATE TABLE public.popular_combinations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  product_id UUID NOT NULL REFERENCES public.products(id),
  size_id UUID NOT NULL REFERENCES public.frame_sizes(id),
  color_id UUID NOT NULL REFERENCES public.frame_colors(id),
  thickness_id UUID REFERENCES public.frame_thickness(id),
  matting_id UUID REFERENCES public.matting_options(id),
  is_staff_pick BOOLEAN NOT NULL DEFAULT false,
  popularity_score INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add matting and thickness fields to cart_items
ALTER TABLE public.cart_items 
ADD COLUMN thickness_id UUID REFERENCES public.frame_thickness(id),
ADD COLUMN matting_id UUID REFERENCES public.matting_options(id),
ADD COLUMN photo_id UUID REFERENCES public.uploaded_photos(id),
ADD COLUMN custom_width_inches DECIMAL(5,2),
ADD COLUMN custom_height_inches DECIMAL(5,2);

-- Create storage bucket for customer photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'customer-photos',
  'customer-photos',
  false,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png']
);

-- Enable RLS on new tables
ALTER TABLE public.matting_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frame_thickness ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.popular_combinations ENABLE ROW LEVEL SECURITY;

-- RLS policies for matting options
CREATE POLICY "Anyone can view active matting options" ON public.matting_options
  FOR SELECT USING (is_active = true);

-- RLS policies for frame thickness
CREATE POLICY "Anyone can view active frame thickness" ON public.frame_thickness
  FOR SELECT USING (is_active = true);

-- RLS policies for uploaded photos
CREATE POLICY "Users can manage their own photos" ON public.uploaded_photos
  FOR ALL USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
    (auth.uid() IS NULL AND session_id IS NOT NULL)
  );

-- RLS policies for popular combinations
CREATE POLICY "Anyone can view active popular combinations" ON public.popular_combinations
  FOR SELECT USING (is_active = true);

-- Storage policies for customer photos
CREATE POLICY "Users can upload their own photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'customer-photos');

CREATE POLICY "Users can view their own photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'customer-photos');

CREATE POLICY "Users can update their own photos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'customer-photos');

CREATE POLICY "Users can delete their own photos" ON storage.objects
  FOR DELETE USING (bucket_id = 'customer-photos');

-- Insert sample data
INSERT INTO public.matting_options (name, color_hex, thickness_inches, is_double_mat, price_adjustment) VALUES
  ('White Mat', '#FFFFFF', 0.125, false, 15.00),
  ('Black Mat', '#000000', 0.125, false, 15.00),
  ('Cream Mat', '#F5F5DC', 0.125, false, 15.00),
  ('Navy Mat', '#000080', 0.125, false, 18.00),
  ('Double White/Black', '#FFFFFF', 0.25, true, 25.00),
  ('Double Cream/Navy', '#F5F5DC', 0.25, true, 28.00);

INSERT INTO public.frame_thickness (name, width_inches, price_multiplier) VALUES
  ('Thin (0.5")', 0.5, 1.0),
  ('Standard (1")', 1.0, 1.2),
  ('Medium (1.5")', 1.5, 1.4),
  ('Thick (2")', 2.0, 1.6),
  ('Extra Thick (2.5")', 2.5, 1.8);

INSERT INTO public.popular_combinations (name, description, product_id, size_id, color_id, is_staff_pick, popularity_score) VALUES
  ('Classic Portrait', 'Most popular combination for portraits', 
   (SELECT id FROM products WHERE name = 'Classic Wooden Frame' LIMIT 1),
   (SELECT id FROM frame_sizes WHERE display_name = '8" x 10"' LIMIT 1),
   (SELECT id FROM frame_colors WHERE name = 'Natural Wood' LIMIT 1),
   true, 95),
  ('Modern Minimalist', 'Clean and contemporary look',
   (SELECT id FROM products WHERE name = 'Modern Metal Frame' LIMIT 1),
   (SELECT id FROM frame_sizes WHERE display_name = '11" x 14"' LIMIT 1),
   (SELECT id FROM frame_colors WHERE name = 'Black' LIMIT 1),
   true, 88);
