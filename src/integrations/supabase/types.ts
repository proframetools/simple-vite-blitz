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
      admin_roles: {
        Row: {
          created_at: string
          granted_at: string
          granted_by: string | null
          id: string
          is_active: boolean
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          is_active?: boolean
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          is_active?: boolean
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      aspect_ratios: {
        Row: {
          created_at: string
          display_name: string
          height_ratio: number
          id: string
          is_active: boolean
          name: string
          updated_at: string
          width_ratio: number
        }
        Insert: {
          created_at?: string
          display_name: string
          height_ratio: number
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          width_ratio: number
        }
        Update: {
          created_at?: string
          display_name?: string
          height_ratio?: number
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          width_ratio?: number
        }
        Relationships: []
      }
      frame_colors: {
        Row: {
          created_at: string
          display_name: string
          hex_code: string | null
          id: string
          is_active: boolean
          name: string
          price_adjustment: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          hex_code?: string | null
          id?: string
          is_active?: boolean
          name: string
          price_adjustment?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          hex_code?: string | null
          id?: string
          is_active?: boolean
          name?: string
          price_adjustment?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      frame_orientations: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      frame_sizes: {
        Row: {
          created_at: string
          display_name: string
          height_inches: number
          id: string
          is_active: boolean
          name: string
          price_multiplier: number
          updated_at: string
          width_inches: number
        }
        Insert: {
          created_at?: string
          display_name: string
          height_inches: number
          id?: string
          is_active?: boolean
          name: string
          price_multiplier?: number
          updated_at?: string
          width_inches: number
        }
        Update: {
          created_at?: string
          display_name?: string
          height_inches?: number
          id?: string
          is_active?: boolean
          name?: string
          price_multiplier?: number
          updated_at?: string
          width_inches?: number
        }
        Relationships: []
      }
      frame_thickness: {
        Row: {
          created_at: string
          display_name: string
          id: string
          is_active: boolean
          name: string
          price_adjustment: number | null
          thickness_mm: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          is_active?: boolean
          name: string
          price_adjustment?: number | null
          thickness_mm: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          is_active?: boolean
          name?: string
          price_adjustment?: number | null
          thickness_mm?: number
          updated_at?: string
        }
        Relationships: []
      }
      matting_options: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          id: string
          is_active: boolean
          name: string
          price_adjustment: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean
          name: string
          price_adjustment?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean
          name?: string
          price_adjustment?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      preview_images: {
        Row: {
          alt_text: string | null
          aspect_ratio_id: string
          color_id: string
          created_at: string
          id: string
          image_url: string
          is_active: boolean
          orientation_id: string
          thickness_id: string
          updated_at: string
        }
        Insert: {
          alt_text?: string | null
          aspect_ratio_id: string
          color_id: string
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean
          orientation_id: string
          thickness_id: string
          updated_at?: string
        }
        Update: {
          alt_text?: string | null
          aspect_ratio_id?: string
          color_id?: string
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean
          orientation_id?: string
          thickness_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "preview_images_aspect_ratio_id_fkey"
            columns: ["aspect_ratio_id"]
            isOneToOne: false
            referencedRelation: "aspect_ratios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preview_images_color_id_fkey"
            columns: ["color_id"]
            isOneToOne: false
            referencedRelation: "frame_colors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preview_images_orientation_id_fkey"
            columns: ["orientation_id"]
            isOneToOne: false
            referencedRelation: "frame_orientations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preview_images_thickness_id_fkey"
            columns: ["thickness_id"]
            isOneToOne: false
            referencedRelation: "frame_thickness"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          aspect_ratio_id: string
          color_id: string
          created_at: string
          id: string
          is_active: boolean
          matting_id: string | null
          orientation_id: string
          price_adjustment: number | null
          product_id: string
          size_id: string
          sku: string
          stock_quantity: number | null
          thickness_id: string
          updated_at: string
        }
        Insert: {
          aspect_ratio_id: string
          color_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          matting_id?: string | null
          orientation_id: string
          price_adjustment?: number | null
          product_id: string
          size_id: string
          sku: string
          stock_quantity?: number | null
          thickness_id: string
          updated_at?: string
        }
        Update: {
          aspect_ratio_id?: string
          color_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          matting_id?: string | null
          orientation_id?: string
          price_adjustment?: number | null
          product_id?: string
          size_id?: string
          sku?: string
          stock_quantity?: number | null
          thickness_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_aspect_ratio_id_fkey"
            columns: ["aspect_ratio_id"]
            isOneToOne: false
            referencedRelation: "aspect_ratios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_color_id_fkey"
            columns: ["color_id"]
            isOneToOne: false
            referencedRelation: "frame_colors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_matting_id_fkey"
            columns: ["matting_id"]
            isOneToOne: false
            referencedRelation: "matting_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_orientation_id_fkey"
            columns: ["orientation_id"]
            isOneToOne: false
            referencedRelation: "frame_orientations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_size_id_fkey"
            columns: ["size_id"]
            isOneToOne: false
            referencedRelation: "frame_sizes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_thickness_id_fkey"
            columns: ["thickness_id"]
            isOneToOne: false
            referencedRelation: "frame_thickness"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_price: number
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          base_price?: number
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          base_price?: number
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
