-- Create custom types for the photoframe business
CREATE TYPE frame_material AS ENUM ('wood', 'metal', 'acrylic', 'composite');
CREATE TYPE frame_style AS ENUM ('modern', 'classic', 'rustic', 'minimalist', 'ornate');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'in_production', 'shipped', 'delivered', 'cancelled');

-- Products table for frame templates
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  material frame_material NOT NULL,
  style frame_style NOT NULL,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Available sizes for frames
CREATE TABLE public.frame_sizes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  width_inches DECIMAL(5,2) NOT NULL,
  height_inches DECIMAL(5,2) NOT NULL,
  display_name TEXT NOT NULL,
  price_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.0,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Color options for frames
CREATE TABLE public.frame_colors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  hex_code TEXT NOT NULL,
  price_adjustment DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Cart items for users
CREATE TABLE public.cart_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT, -- For guest users
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size_id UUID NOT NULL REFERENCES public.frame_sizes(id),
  color_id UUID NOT NULL REFERENCES public.frame_colors(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  custom_image_url TEXT,
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  payment_method TEXT,
  payment_status TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Order items
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  size_id UUID NOT NULL REFERENCES public.frame_sizes(id),
  color_id UUID NOT NULL REFERENCES public.frame_colors(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  custom_image_url TEXT,
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frame_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frame_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Public read policies for product data
CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active frame sizes" ON public.frame_sizes
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active frame colors" ON public.frame_colors
  FOR SELECT USING (is_active = true);

-- Cart policies
CREATE POLICY "Users can manage their own cart items" ON public.cart_items
  FOR ALL USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
    (auth.uid() IS NULL AND session_id IS NOT NULL)
  );

-- Order policies
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (user_id = auth.uid() OR (user_id IS NULL AND auth.uid() IS NULL));

CREATE POLICY "Users can create orders" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view order items for their orders" ON public.order_items
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM public.orders 
      WHERE user_id = auth.uid() OR (user_id IS NULL AND auth.uid() IS NULL)
    )
  );

-- Functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updating timestamps
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO public.frame_sizes (width_inches, height_inches, display_name, price_multiplier) VALUES
  (5, 7, '5" x 7"', 1.0),
  (8, 10, '8" x 10"', 1.2),
  (11, 14, '11" x 14"', 1.5),
  (16, 20, '16" x 20"', 2.0),
  (18, 24, '18" x 24"', 2.5),
  (24, 36, '24" x 36"', 3.0);

INSERT INTO public.frame_colors (name, hex_code, price_adjustment) VALUES
  ('Natural Wood', '#D2B48C', 0),
  ('Espresso', '#3C2414', 5),
  ('White', '#FFFFFF', 0),
  ('Black', '#000000', 0),
  ('Gold', '#FFD700', 15),
  ('Silver', '#C0C0C0', 10),
  ('Cherry Wood', '#8B4513', 8),
  ('Mahogany', '#C04000', 12);

INSERT INTO public.products (name, description, base_price, material, style, image_url) VALUES
  ('Classic Wooden Frame', 'Handcrafted wooden frame with timeless elegance', 45.00, 'wood', 'classic', NULL),
  ('Modern Metal Frame', 'Sleek metal frame perfect for contemporary spaces', 35.00, 'metal', 'modern', NULL),
  ('Rustic Barn Wood Frame', 'Reclaimed barn wood with authentic character', 55.00, 'wood', 'rustic', NULL),
  ('Minimalist Acrylic Frame', 'Clean acrylic design for modern aesthetics', 40.00, 'acrylic', 'minimalist', NULL),
  ('Ornate Gold Frame', 'Decorative frame with intricate gold detailing', 75.00, 'composite', 'ornate', NULL),
  ('Industrial Steel Frame', 'Raw steel frame with industrial appeal', 50.00, 'metal', 'modern', NULL);