-- Create complete database schema for photo frame customization platform

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  category TEXT,
  material TEXT,
  style TEXT,
  image_url TEXT,
  average_rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create occasions table
CREATE TABLE public.occasions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create frame_sizes table
CREATE TABLE public.frame_sizes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  width_inches DECIMAL(5,2) NOT NULL,
  height_inches DECIMAL(5,2) NOT NULL,
  price_multiplier DECIMAL(5,2) NOT NULL DEFAULT 1.0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create frame_colors table
CREATE TABLE public.frame_colors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  hex_code TEXT,
  price_adjustment DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create frame_thickness table
CREATE TABLE public.frame_thickness (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  thickness_mm DECIMAL(5,2) NOT NULL,
  width_inches DECIMAL(5,2) NOT NULL,
  price_multiplier DECIMAL(5,2) NOT NULL DEFAULT 1.0,
  price_adjustment DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create matting_options table
CREATE TABLE public.matting_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  price_adjustment DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create aspect_ratios table
CREATE TABLE public.aspect_ratios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  width_ratio DECIMAL(5,2) NOT NULL,
  height_ratio DECIMAL(5,2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create frame_orientations table
CREATE TABLE public.frame_orientations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product_variants table
CREATE TABLE public.product_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  aspect_ratio_id UUID REFERENCES public.aspect_ratios(id) NOT NULL,
  orientation_id UUID REFERENCES public.frame_orientations(id) NOT NULL,
  size_id UUID REFERENCES public.frame_sizes(id) NOT NULL,
  color_id UUID REFERENCES public.frame_colors(id) NOT NULL,
  thickness_id UUID REFERENCES public.frame_thickness(id) NOT NULL,
  matting_id UUID REFERENCES public.matting_options(id),
  price_adjustment DECIMAL(10,2) DEFAULT 0,
  stock_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sku TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create preview_images table
CREATE TABLE public.preview_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aspect_ratio_id UUID REFERENCES public.aspect_ratios(id) NOT NULL,
  orientation_id UUID REFERENCES public.frame_orientations(id) NOT NULL,
  color_id UUID REFERENCES public.frame_colors(id) NOT NULL,
  thickness_id UUID REFERENCES public.frame_thickness(id) NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  shipping_address JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_variant_id UUID REFERENCES public.product_variants(id) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  custom_photo_url TEXT,
  custom_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create uploaded_photos table (referenced in admin dashboard)
CREATE TABLE public.uploaded_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product_categories junction table
CREATE TABLE public.product_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, category_id)
);

-- Create product_occasions junction table
CREATE TABLE public.product_occasions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  occasion_id UUID REFERENCES public.occasions(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, occasion_id)
);

-- Create admin_roles table
CREATE TABLE public.admin_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role TEXT NOT NULL,
  granted_by UUID,
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.occasions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frame_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frame_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frame_thickness ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matting_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aspect_ratios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frame_orientations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preview_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_occasions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for public access to product data
CREATE POLICY "Public read access for products" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access for categories" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access for occasions" ON public.occasions FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access for frame_sizes" ON public.frame_sizes FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access for frame_colors" ON public.frame_colors FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access for frame_thickness" ON public.frame_thickness FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access for matting_options" ON public.matting_options FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access for aspect_ratios" ON public.aspect_ratios FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access for frame_orientations" ON public.frame_orientations FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access for product_variants" ON public.product_variants FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access for preview_images" ON public.preview_images FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access for product_categories" ON public.product_categories FOR SELECT USING (true);
CREATE POLICY "Public read access for product_occasions" ON public.product_occasions FOR SELECT USING (true);

-- Admin policies (allow all operations for admin users)
CREATE POLICY "Admin access for all tables" ON public.products FOR ALL USING (true);
CREATE POLICY "Admin access for categories" ON public.categories FOR ALL USING (true);
CREATE POLICY "Admin access for occasions" ON public.occasions FOR ALL USING (true);
CREATE POLICY "Admin access for frame_sizes" ON public.frame_sizes FOR ALL USING (true);
CREATE POLICY "Admin access for frame_colors" ON public.frame_colors FOR ALL USING (true);
CREATE POLICY "Admin access for frame_thickness" ON public.frame_thickness FOR ALL USING (true);
CREATE POLICY "Admin access for matting_options" ON public.matting_options FOR ALL USING (true);
CREATE POLICY "Admin access for aspect_ratios" ON public.aspect_ratios FOR ALL USING (true);
CREATE POLICY "Admin access for frame_orientations" ON public.frame_orientations FOR ALL USING (true);
CREATE POLICY "Admin access for product_variants" ON public.product_variants FOR ALL USING (true);
CREATE POLICY "Admin access for preview_images" ON public.preview_images FOR ALL USING (true);
CREATE POLICY "Admin access for orders" ON public.orders FOR ALL USING (true);
CREATE POLICY "Admin access for order_items" ON public.order_items FOR ALL USING (true);
CREATE POLICY "Admin access for uploaded_photos" ON public.uploaded_photos FOR ALL USING (true);
CREATE POLICY "Admin access for admin_roles" ON public.admin_roles FOR ALL USING (true);
CREATE POLICY "Admin access for profiles" ON public.profiles FOR ALL USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_occasions_updated_at BEFORE UPDATE ON public.occasions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_frame_sizes_updated_at BEFORE UPDATE ON public.frame_sizes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_frame_colors_updated_at BEFORE UPDATE ON public.frame_colors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_frame_thickness_updated_at BEFORE UPDATE ON public.frame_thickness FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_matting_options_updated_at BEFORE UPDATE ON public.matting_options FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_aspect_ratios_updated_at BEFORE UPDATE ON public.aspect_ratios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_frame_orientations_updated_at BEFORE UPDATE ON public.frame_orientations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON public.product_variants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_preview_images_updated_at BEFORE UPDATE ON public.preview_images FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON public.order_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_uploaded_photos_updated_at BEFORE UPDATE ON public.uploaded_photos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_admin_roles_updated_at BEFORE UPDATE ON public.admin_roles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data

-- Insert sample categories
INSERT INTO public.categories (name, description, image_url) VALUES
('Modern', 'Contemporary and sleek frame designs', '/api/placeholder/300/200'),
('Classic', 'Traditional and timeless frame styles', '/api/placeholder/300/200'),
('Rustic', 'Natural wood and vintage-inspired frames', '/api/placeholder/300/200');

-- Insert sample occasions
INSERT INTO public.occasions (name, description, image_url) VALUES
('Wedding', 'Perfect for wedding photos and memories', '/api/placeholder/300/200'),
('Family', 'Great for family portraits and gatherings', '/api/placeholder/300/200'),
('Travel', 'Display your travel adventures', '/api/placeholder/300/200');

-- Insert sample frame sizes
INSERT INTO public.frame_sizes (name, display_name, width_inches, height_inches, price_multiplier) VALUES
('4x6', '4" x 6"', 4.0, 6.0, 1.0),
('5x7', '5" x 7"', 5.0, 7.0, 1.2),
('8x10', '8" x 10"', 8.0, 10.0, 1.5),
('11x14', '11" x 14"', 11.0, 14.0, 2.0),
('16x20', '16" x 20"', 16.0, 20.0, 3.0);

-- Insert sample frame colors
INSERT INTO public.frame_colors (name, display_name, hex_code, price_adjustment) VALUES
('black', 'Black', '#000000', 0),
('white', 'White', '#FFFFFF', 0),
('brown', 'Brown', '#8B4513', 5),
('gold', 'Gold', '#FFD700', 15),
('silver', 'Silver', '#C0C0C0', 10);

-- Insert sample frame thickness
INSERT INTO public.frame_thickness (name, display_name, thickness_mm, width_inches, price_multiplier, price_adjustment) VALUES
('thin', 'Thin (10mm)', 10.0, 0.5, 1.0, 0),
('medium', 'Medium (20mm)', 20.0, 1.0, 1.1, 5),
('thick', 'Thick (30mm)', 30.0, 1.5, 1.2, 10);

-- Insert sample matting options
INSERT INTO public.matting_options (name, display_name, price_adjustment) VALUES
('none', 'No Matting', 0),
('white', 'White Mat', 15),
('cream', 'Cream Mat', 15),
('black', 'Black Mat', 20);

-- Insert sample aspect ratios
INSERT INTO public.aspect_ratios (name, display_name, width_ratio, height_ratio) VALUES
('4:3', '4:3 (Standard)', 4.0, 3.0),
('3:2', '3:2 (Classic)', 3.0, 2.0),
('16:9', '16:9 (Widescreen)', 16.0, 9.0),
('1:1', '1:1 (Square)', 1.0, 1.0);

-- Insert sample frame orientations
INSERT INTO public.frame_orientations (name, display_name) VALUES
('portrait', 'Portrait'),
('landscape', 'Landscape');

-- Insert sample products
INSERT INTO public.products (name, description, base_price, category, material, style, image_url, average_rating, review_count) VALUES
('Premium Wood Frame', 'High-quality wooden frame perfect for any occasion', 49.99, 'Classic', 'Wood', 'Traditional', '/api/placeholder/400/300', 4.5, 127),
('Modern Metal Frame', 'Sleek aluminum frame with contemporary design', 39.99, 'Modern', 'Aluminum', 'Contemporary', '/api/placeholder/400/300', 4.2, 89),
('Rustic Barnwood Frame', 'Authentic reclaimed wood with vintage character', 59.99, 'Rustic', 'Reclaimed Wood', 'Vintage', '/api/placeholder/400/300', 4.7, 156);