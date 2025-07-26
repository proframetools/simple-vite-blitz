export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      cart_items: {
        Row: {
          color_id: string
          created_at: string
          custom_height_inches: number | null
          custom_image_url: string | null
          custom_width_inches: number | null
          id: string
          matting_id: string | null
          photo_id: string | null
          product_id: string
          quantity: number
          session_id: string | null
          size_id: string
          special_instructions: string | null
          thickness_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          color_id: string
          created_at?: string
          custom_height_inches?: number | null
          custom_image_url?: string | null
          custom_width_inches?: number | null
          id?: string
          matting_id?: string | null
          photo_id?: string | null
          product_id: string
          quantity?: number
          session_id?: string | null
          size_id: string
          special_instructions?: string | null
          thickness_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          color_id?: string
          created_at?: string
          custom_height_inches?: number | null
          custom_image_url?: string | null
          custom_width_inches?: number | null
          id?: string
          matting_id?: string | null
          photo_id?: string | null
          product_id?: string
          quantity?: number
          session_id?: string | null
          size_id?: string
          special_instructions?: string | null
          thickness_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_color_id_fkey"
            columns: ["color_id"]
            isOneToOne: false
            referencedRelation: "frame_colors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_matting_id_fkey"
            columns: ["matting_id"]
            isOneToOne: false
            referencedRelation: "matting_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "uploaded_photos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_size_id_fkey"
            columns: ["size_id"]
            isOneToOne: false
            referencedRelation: "frame_sizes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_thickness_id_fkey"
            columns: ["thickness_id"]
            isOneToOne: false
            referencedRelation: "frame_thickness"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      frame_colors: {
        Row: {
          hex_code: string
          id: string
          is_active: boolean
          name: string
          price_adjustment: number
        }
        Insert: {
          hex_code: string
          id?: string
          is_active?: boolean
          name: string
          price_adjustment?: number
        }
        Update: {
          hex_code?: string
          id?: string
          is_active?: boolean
          name?: string
          price_adjustment?: number
        }
        Relationships: []
      }
      frame_sizes: {
        Row: {
          display_name: string
          height_inches: number
          id: string
          is_active: boolean
          price_multiplier: number
          width_inches: number
        }
        Insert: {
          display_name: string
          height_inches: number
          id?: string
          is_active?: boolean
          price_multiplier?: number
          width_inches: number
        }
        Update: {
          display_name?: string
          height_inches?: number
          id?: string
          is_active?: boolean
          price_multiplier?: number
          width_inches?: number
        }
        Relationships: []
      }
      frame_thickness: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          price_multiplier: number
          width_inches: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          price_multiplier?: number
          width_inches: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          price_multiplier?: number
          width_inches?: number
        }
        Relationships: []
      }
      matting_options: {
        Row: {
          color_hex: string
          created_at: string
          id: string
          is_active: boolean
          is_double_mat: boolean
          name: string
          price_adjustment: number
          thickness_inches: number
        }
        Insert: {
          color_hex: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_double_mat?: boolean
          name: string
          price_adjustment?: number
          thickness_inches: number
        }
        Update: {
          color_hex?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_double_mat?: boolean
          name?: string
          price_adjustment?: number
          thickness_inches?: number
        }
        Relationships: []
      }
      occasions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          color_id: string
          created_at: string
          custom_image_url: string | null
          id: string
          order_id: string
          product_id: string
          quantity: number
          size_id: string
          special_instructions: string | null
          unit_price: number
        }
        Insert: {
          color_id: string
          created_at?: string
          custom_image_url?: string | null
          id?: string
          order_id: string
          product_id: string
          quantity: number
          size_id: string
          special_instructions?: string | null
          unit_price: number
        }
        Update: {
          color_id?: string
          created_at?: string
          custom_image_url?: string | null
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          size_id?: string
          special_instructions?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_color_id_fkey"
            columns: ["color_id"]
            isOneToOne: false
            referencedRelation: "frame_colors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_size_id_fkey"
            columns: ["size_id"]
            isOneToOne: false
            referencedRelation: "frame_sizes"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json | null
          created_at: string
          email: string
          id: string
          notes: string | null
          payment_method: string | null
          payment_status: string | null
          shipping_address: Json
          status: Database["public"]["Enums"]["order_status"]
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          billing_address?: Json | null
          created_at?: string
          email: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          shipping_address: Json
          status?: Database["public"]["Enums"]["order_status"]
          total_amount: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          billing_address?: Json | null
          created_at?: string
          email?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          shipping_address?: Json
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      popular_combinations: {
        Row: {
          color_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_staff_pick: boolean
          matting_id: string | null
          name: string
          popularity_score: number
          product_id: string
          size_id: string
          thickness_id: string | null
        }
        Insert: {
          color_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_staff_pick?: boolean
          matting_id?: string | null
          name: string
          popularity_score?: number
          product_id: string
          size_id: string
          thickness_id?: string | null
        }
        Update: {
          color_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_staff_pick?: boolean
          matting_id?: string | null
          name?: string
          popularity_score?: number
          product_id?: string
          size_id?: string
          thickness_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "popular_combinations_color_id_fkey"
            columns: ["color_id"]
            isOneToOne: false
            referencedRelation: "frame_colors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "popular_combinations_matting_id_fkey"
            columns: ["matting_id"]
            isOneToOne: false
            referencedRelation: "matting_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "popular_combinations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "popular_combinations_size_id_fkey"
            columns: ["size_id"]
            isOneToOne: false
            referencedRelation: "frame_sizes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "popular_combinations_thickness_id_fkey"
            columns: ["thickness_id"]
            isOneToOne: false
            referencedRelation: "frame_thickness"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          category_id: string
          created_at: string
          id: string
          product_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          product_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          image_url: string
          is_primary: boolean | null
          product_id: string
          sort_order: number | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url: string
          is_primary?: boolean | null
          product_id: string
          sort_order?: number | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url?: string
          is_primary?: boolean | null
          product_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_occasions: {
        Row: {
          created_at: string
          id: string
          occasion_id: string
          product_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          occasion_id: string
          product_id: string
        }
        Update: {
          created_at?: string
          id?: string
          occasion_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_occasions_occasion_id_fkey"
            columns: ["occasion_id"]
            isOneToOne: false
            referencedRelation: "occasions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_occasions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          created_at: string
          customer_email: string | null
          customer_name: string
          id: string
          is_approved: boolean | null
          is_verified_purchase: boolean | null
          product_id: string
          rating: number
          review_text: string | null
          title: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          customer_name: string
          id?: string
          is_approved?: boolean | null
          is_verified_purchase?: boolean | null
          product_id: string
          rating: number
          review_text?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          id?: string
          is_approved?: boolean | null
          is_verified_purchase?: boolean | null
          product_id?: string
          rating?: number
          review_text?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_tags: {
        Row: {
          created_at: string
          id: string
          product_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          tag_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_tags_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          average_rating: number | null
          base_price: number
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          material: Database["public"]["Enums"]["frame_material"]
          name: string
          popularity_score: number | null
          review_count: number | null
          stock_quantity: number | null
          style: Database["public"]["Enums"]["frame_style"]
          updated_at: string
        }
        Insert: {
          average_rating?: number | null
          base_price: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          material: Database["public"]["Enums"]["frame_material"]
          name: string
          popularity_score?: number | null
          review_count?: number | null
          stock_quantity?: number | null
          style: Database["public"]["Enums"]["frame_style"]
          updated_at?: string
        }
        Update: {
          average_rating?: number | null
          base_price?: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          material?: Database["public"]["Enums"]["frame_material"]
          name?: string
          popularity_score?: number | null
          review_count?: number | null
          stock_quantity?: number | null
          style?: Database["public"]["Enums"]["frame_style"]
          updated_at?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          color: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          slug: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
        }
        Relationships: []
      }
      uploaded_photos: {
        Row: {
          created_at: string
          dpi: number | null
          file_name: string
          file_size: number
          file_type: string
          height_pixels: number
          id: string
          is_processed: boolean
          session_id: string | null
          storage_path: string
          user_id: string | null
          width_pixels: number
        }
        Insert: {
          created_at?: string
          dpi?: number | null
          file_name: string
          file_size: number
          file_type: string
          height_pixels: number
          id?: string
          is_processed?: boolean
          session_id?: string | null
          storage_path: string
          user_id?: string | null
          width_pixels: number
        }
        Update: {
          created_at?: string
          dpi?: number | null
          file_name?: string
          file_size?: number
          file_type?: string
          height_pixels?: number
          id?: string
          is_processed?: boolean
          session_id?: string | null
          storage_path?: string
          user_id?: string | null
          width_pixels?: number
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          product_id: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      frame_material: "wood" | "metal" | "acrylic" | "composite"
      frame_style: "modern" | "classic" | "rustic" | "minimalist" | "ornate"
      order_status:
        | "pending"
        | "processing"
        | "in_production"
        | "shipped"
        | "delivered"
        | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      frame_material: ["wood", "metal", "acrylic", "composite"],
      frame_style: ["modern", "classic", "rustic", "minimalist", "ornate"],
      order_status: [
        "pending",
        "processing",
        "in_production",
        "shipped",
        "delivered",
        "cancelled",
      ],
    },
  },
} as const
