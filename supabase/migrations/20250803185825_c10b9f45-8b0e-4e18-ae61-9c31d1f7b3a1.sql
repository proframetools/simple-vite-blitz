-- Now create the advanced variant system tables

-- Create aspect_ratios table
CREATE TABLE public.aspect_ratios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  width_ratio INTEGER NOT NULL,
  height_ratio INTEGER NOT NULL,
  display_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create frame_orientations table  
CREATE TABLE public.frame_orientations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
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
  sku TEXT NOT NULL UNIQUE,
  price_adjustment DECIMAL(10,2) DEFAULT 0.00,
  stock_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, aspect_ratio_id, orientation_id, size_id, color_id, thickness_id, matting_id)
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
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(aspect_ratio_id, orientation_id, color_id, thickness_id)
);

-- Create admin_roles table
CREATE TABLE public.admin_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin',
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.aspect_ratios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frame_orientations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preview_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for aspect_ratios
CREATE POLICY "Aspect ratios are publicly readable" ON public.aspect_ratios
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify aspect ratios" ON public.aspect_ratios
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_roles 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- RLS Policies for frame_orientations
CREATE POLICY "Frame orientations are publicly readable" ON public.frame_orientations
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify frame orientations" ON public.frame_orientations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_roles 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- RLS Policies for product_variants
CREATE POLICY "Product variants are publicly readable" ON public.product_variants
  FOR SELECT USING (is_active = true);

CREATE POLICY "Only admins can modify product variants" ON public.product_variants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_roles 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- RLS Policies for preview_images
CREATE POLICY "Preview images are publicly readable" ON public.preview_images
  FOR SELECT USING (is_active = true);

CREATE POLICY "Only admins can modify preview images" ON public.preview_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_roles 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- RLS Policies for admin_roles
CREATE POLICY "Users can view their own admin role" ON public.admin_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Only existing admins can manage admin roles" ON public.admin_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_roles 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Add updated_at triggers for new tables
CREATE TRIGGER update_aspect_ratios_updated_at
  BEFORE UPDATE ON public.aspect_ratios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_frame_orientations_updated_at
  BEFORE UPDATE ON public.frame_orientations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_preview_images_updated_at
  BEFORE UPDATE ON public.preview_images
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_roles_updated_at
  BEFORE UPDATE ON public.admin_roles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default aspect ratios
INSERT INTO public.aspect_ratios (name, width_ratio, height_ratio, display_name) VALUES
  ('3:2', 3, 2, '3:2 Classic'),
  ('4:3', 4, 3, '4:3 Standard'),
  ('5:4', 5, 4, '5:4 Portrait'),
  ('1:1', 1, 1, '1:1 Square'),
  ('7:5', 7, 5, '7:5 Modern'),
  ('16:9', 16, 9, '16:9 Widescreen'),
  ('2:1', 2, 1, '2:1 Panoramic'),
  ('3:1', 3, 1, '3:1 Ultra Wide');

-- Insert default frame orientations
INSERT INTO public.frame_orientations (name, display_name, description) VALUES
  ('landscape', 'Landscape', 'Horizontal orientation - wider than tall'),
  ('portrait', 'Portrait', 'Vertical orientation - taller than wide'),
  ('square', 'Square', 'Equal width and height');

-- Create indexes for better performance
CREATE INDEX idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX idx_product_variants_active ON public.product_variants(is_active);
CREATE INDEX idx_preview_images_lookup ON public.preview_images(aspect_ratio_id, orientation_id, color_id, thickness_id);
CREATE INDEX idx_admin_roles_user_id ON public.admin_roles(user_id);
CREATE INDEX idx_admin_roles_active ON public.admin_roles(is_active);

-- Add admin policies for foundational tables to allow admin modifications
CREATE POLICY "Only admins can modify products" ON public.products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_roles 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Only admins can modify frame sizes" ON public.frame_sizes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_roles 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Only admins can modify frame colors" ON public.frame_colors
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_roles 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Only admins can modify frame thickness" ON public.frame_thickness
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_roles 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Only admins can modify matting options" ON public.matting_options
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_roles 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );