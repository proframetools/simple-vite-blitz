// Database types that match the actual Supabase schema
export interface Product {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  category: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Occasion {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  customer_email: string;
  customer_name: string;
  customer_phone: string | null;
  total_amount: number;
  status: string;
  notes: string | null;
  shipping_address: any;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_variant_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  custom_photo_url: string | null;
  custom_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FrameColor {
  id: string;
  name: string;
  display_name: string;
  hex_code: string | null;
  price_adjustment: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FrameSize {
  id: string;
  name: string;
  display_name: string;
  width_inches: number;
  height_inches: number;
  price_multiplier: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PreviewImage {
  id: string;
  aspect_ratio_id: string;
  orientation_id: string;
  color_id: string;
  thickness_id: string;
  image_url: string;
  alt_text: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  aspect_ratio_id: string;
  orientation_id: string;
  size_id: string;
  color_id: string;
  thickness_id: string;
  matting_id: string | null;
  price_adjustment: number | null;
  stock_quantity: number | null;
  is_active: boolean;
  sku: string;
  created_at: string;
  updated_at: string;
}

export interface ThicknessData {
  id: string;
  name: string;
  display_name: string;
  thickness_mm: number;
  price_adjustment: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}