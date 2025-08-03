-- Create foundational tables first

-- Products table (main product catalog)
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  category TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Frame sizes table
CREATE TABLE public.frame_sizes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  width_inches DECIMAL(5,2) NOT NULL,
  height_inches DECIMAL(5,2) NOT NULL,
  display_name TEXT NOT NULL,
  price_multiplier DECIMAL(4,2) NOT NULL DEFAULT 1.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Frame colors table
CREATE TABLE public.frame_colors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  hex_code TEXT,
  price_adjustment DECIMAL(10,2) DEFAULT 0.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Frame thickness table
CREATE TABLE public.frame_thickness (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  thickness_mm DECIMAL(5,2) NOT NULL,
  display_name TEXT NOT NULL,
  price_adjustment DECIMAL(10,2) DEFAULT 0.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Matting options table
CREATE TABLE public.matting_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  price_adjustment DECIMAL(10,2) DEFAULT 0.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on foundational tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frame_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frame_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frame_thickness ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matting_options ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for foundational tables (publicly readable)
CREATE POLICY "Products are publicly readable" ON public.products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Frame sizes are publicly readable" ON public.frame_sizes
  FOR SELECT USING (is_active = true);

CREATE POLICY "Frame colors are publicly readable" ON public.frame_colors
  FOR SELECT USING (is_active = true);

CREATE POLICY "Frame thickness are publicly readable" ON public.frame_thickness
  FOR SELECT USING (is_active = true);

CREATE POLICY "Matting options are publicly readable" ON public.matting_options
  FOR SELECT USING (is_active = true);

-- Create updated_at triggers for foundational tables
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_frame_sizes_updated_at
  BEFORE UPDATE ON public.frame_sizes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_frame_colors_updated_at
  BEFORE UPDATE ON public.frame_colors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_frame_thickness_updated_at
  BEFORE UPDATE ON public.frame_thickness
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_matting_options_updated_at
  BEFORE UPDATE ON public.matting_options
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default data
INSERT INTO public.products (name, description, base_price, category) VALUES
  ('Standard Frame', 'High-quality picture frame suitable for all occasions', 29.99, 'standard'),
  ('Premium Frame', 'Premium picture frame with enhanced materials', 49.99, 'premium'),
  ('Luxury Frame', 'Luxury picture frame with gold accents', 89.99, 'luxury');

INSERT INTO public.frame_sizes (name, width_inches, height_inches, display_name, price_multiplier) VALUES
  ('4x6', 4.00, 6.00, '4" × 6"', 1.00),
  ('5x7', 5.00, 7.00, '5" × 7"', 1.20),
  ('8x10', 8.00, 10.00, '8" × 10"', 1.50),
  ('11x14', 11.00, 14.00, '11" × 14"', 2.00),
  ('16x20', 16.00, 20.00, '16" × 20"', 3.00);

INSERT INTO public.frame_colors (name, display_name, hex_code, price_adjustment) VALUES
  ('black', 'Classic Black', '#000000', 0.00),
  ('white', 'Pure White', '#FFFFFF', 0.00),
  ('brown', 'Rich Brown', '#8B4513', 5.00),
  ('gold', 'Elegant Gold', '#FFD700', 15.00),
  ('silver', 'Modern Silver', '#C0C0C0', 10.00);

INSERT INTO public.frame_thickness (name, thickness_mm, display_name, price_adjustment) VALUES
  ('thin', 15.00, 'Thin (15mm)', 0.00),
  ('medium', 25.00, 'Medium (25mm)', 8.00),
  ('thick', 35.00, 'Thick (35mm)', 15.00);

INSERT INTO public.matting_options (name, display_name, description, price_adjustment) VALUES
  ('none', 'No Matting', 'Frame without matting', 0.00),
  ('white', 'White Mat', 'Classic white matting', 12.00),
  ('black', 'Black Mat', 'Elegant black matting', 12.00),
  ('cream', 'Cream Mat', 'Warm cream matting', 15.00);