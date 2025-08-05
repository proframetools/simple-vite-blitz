-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  shipping_address JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_variant_id UUID NOT NULL REFERENCES public.product_variants(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  custom_photo_url TEXT,
  custom_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create occasions table
CREATE TABLE public.occasions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.occasions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for orders
CREATE POLICY "Orders are viewable by admins" ON public.orders
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Orders can be managed by admins" ON public.orders
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- Create RLS policies for order_items
CREATE POLICY "Order items are viewable by admins" ON public.order_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Order items can be managed by admins" ON public.order_items
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- Create RLS policies for categories
CREATE POLICY "Categories are publicly readable" ON public.categories
FOR SELECT USING (is_active = true);

CREATE POLICY "Categories can be managed by admins" ON public.categories
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- Create RLS policies for occasions
CREATE POLICY "Occasions are publicly readable" ON public.occasions
FOR SELECT USING (is_active = true);

CREATE POLICY "Occasions can be managed by admins" ON public.occasions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- Create triggers for updated_at columns
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_order_items_updated_at
  BEFORE UPDATE ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_occasions_updated_at
  BEFORE UPDATE ON public.occasions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();