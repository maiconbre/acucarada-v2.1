
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          author_name: string | null
          comment: string
          created_at: string
          id: string
          image_url: string | null
          instagram_handle: string | null
          is_approved: boolean | null
          product_id: string
          rating: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          author_name?: string | null
          comment: string
          created_at?: string
          id?: string
          image_url?: string | null
          instagram_handle?: string | null
          is_approved?: boolean | null
          product_id: string
          rating?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          author_name?: string | null
          comment?: string
          created_at?: string
          id?: string
          image_url?: string | null
          instagram_handle?: string | null
          is_approved?: boolean | null
          product_id?: string
          rating?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_analytics_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      feedbacks: {
        Row: {
          created_at: string
          customer_name: string
          customer_username: string | null
          display_order: number | null
          feedback_text: string
          id: string
          image_url: string
          is_active: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_name: string
          customer_username?: string | null
          display_order?: number | null
          feedback_text: string
          id?: string
          image_url: string
          is_active?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_name?: string
          customer_username?: string | null
          display_order?: number | null
          feedback_text?: string
          id?: string
          image_url?: string
          is_active?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      product_analytics: {
        Row: {
          id: string
          last_updated: string
          product_id: string
          total_clicks: number | null
          total_likes: number | null
          total_shares: number | null
        }
        Insert: {
          id?: string
          last_updated?: string
          product_id: string
          total_clicks?: number | null
          total_likes?: number | null
          total_shares?: number | null
        }
        Update: {
          id?: string
          last_updated?: string
          product_id?: string
          total_clicks?: number | null
          total_likes?: number | null
          total_shares?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_analytics_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "product_analytics_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_analytics_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_clicks: {
        Row: {
          click_type: string
          created_at: string
          id: string
          ip_address: unknown | null
          page_source: string | null
          product_id: string
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          click_type: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          page_source?: string | null
          product_id: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          click_type?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          page_source?: string | null
          product_id?: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_clicks_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_analytics_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_clicks_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_likes: {
        Row: {
          created_at: string
          id: string
          ip_address: unknown | null
          product_id: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          product_id: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          product_id?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_likes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_analytics_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_likes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_shares: {
        Row: {
          created_at: string | null
          id: string
          ip_address: unknown | null
          page_source: string | null
          product_id: string
          session_id: string | null
          share_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          page_source?: string | null
          product_id: string
          session_id?: string | null
          share_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          page_source?: string | null
          product_id?: string
          session_id?: string | null
          share_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_shares_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_analytics_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_shares_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          image_url: string | null
          ingredientes: string | null
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          price: number
          sabor_descriptions: Json | null
          sabor_images: Json | null
          sabores: string[] | null
          updated_at: string
          validade_armazenamento_dias: number | null
        }
        Insert: {
          category?: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          ingredientes?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          price: number
          sabor_descriptions?: Json | null
          sabor_images?: Json | null
          sabores?: string[] | null
          updated_at?: string
          validade_armazenamento_dias?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          ingredientes?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          price?: number
          sabor_descriptions?: Json | null
          sabor_images?: Json | null
          sabores?: string[] | null
          updated_at?: string
          validade_armazenamento_dias?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: string
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      storage_logs: {
        Row: {
          action: string
          bucket_id: string
          created_at: string | null
          file_size: number | null
          id: string
          mime_type: string | null
          object_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          bucket_id: string
          created_at?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          object_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          bucket_id?: string
          created_at?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          object_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      product_analytics_summary: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string | null
          image_url: string | null
          ingredientes: string | null
          is_active: boolean | null
          is_featured: boolean | null
          name: string | null
          price: number | null
          sabor_descriptions: Json | null
          sabor_images: Json | null
          sabores: string[] | null
          total_clicks: number | null
          total_likes: number | null
          total_shares: number | null
          unique_viewers: number | null
          updated_at: string | null
          validade_armazenamento_dias: number | null
        }
        Relationships: []
      }
      storage_statistics: {
        Row: {
          avg_file_size_kb: number | null
          bucket_id: string | null
          newest_file: string | null
          oldest_file: string | null
          total_files: number | null
          total_size_mb: number | null
          unique_uploaders: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_orphaned_images: {
        Args: Record<PropertyKey, never>
        Returns: {
          deleted_count: number
          deleted_files: string[]
        }[]
      }
      get_email_by_username: {
        Args: { input_username: string }
        Returns: string
      }
      get_product_complete_info: {
        Args: { product_id_param: string }
        Returns: {
          category: string
          created_at: string
          description: string
          id: string
          image_url: string
          ingredientes: string
          is_active: boolean
          is_featured: boolean
          name: string
          price: number
          sabor_images: Json
          sabores: string[]
          total_clicks: number
          total_likes: number
          total_shares: number
          updated_at: string
          validade_armazenamento_dias: number
        }[]
      }
      get_public_settings: {
        Args: Record<PropertyKey, never>
        Returns: {
          category: string
          description: string
          key: string
          value: string
        }[]
      }
      optimize_storage_usage: {
        Args: Record<PropertyKey, never>
        Returns: {
          folders_info: Json
          total_files: number
          total_size_mb: number
        }[]
      }
      toggle_product_like: {
        Args: {
          p_ip_address?: unknown
          p_product_id: string
          p_session_id?: string
          p_user_id?: string
        }
        Returns: boolean
      }
      track_product_click: {
        Args: {
          p_click_type: string
          p_ip_address?: unknown
          p_page_source?: string
          p_product_id: string
          p_session_id?: string
          p_user_agent?: string
          p_user_id?: string
        }
        Returns: boolean
      }
      track_product_share: {
        Args: {
          p_ip_address?: unknown
          p_page_source?: string
          p_product_id: string
          p_session_id?: string
          p_share_type: string
          p_user_agent?: string
          p_user_id?: string
        }
        Returns: boolean
      }
      update_app_setting: {
        Args: { setting_key: string; setting_value: string }
        Returns: boolean
      }
      update_product_analytics: {
        Args: { p_product_id: string }
        Returns: undefined
      }
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
