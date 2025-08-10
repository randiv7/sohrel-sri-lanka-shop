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
      admin_audit_log: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          target_user_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          last_login: string | null
          permissions: Json | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          permissions?: Json | null
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          permissions?: Json | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          cart_id: number | null
          created_at: string | null
          id: number
          product_id: number | null
          product_variant_id: number | null
          quantity: number
          session_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cart_id?: number | null
          created_at?: string | null
          id?: never
          product_id?: number | null
          product_variant_id?: number | null
          quantity: number
          session_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cart_id?: number | null
          created_at?: string | null
          id?: never
          product_id?: number | null
          product_variant_id?: number | null
          quantity?: number
          session_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: number
          image_url: string | null
          is_active: boolean | null
          name: string
          parent_id: number | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: never
          image_url?: string | null
          is_active?: boolean | null
          name: string
          parent_id?: number | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: never
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          parent_id?: number | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      cod_delivery_attempts: {
        Row: {
          amount_collected: number | null
          attempt_number: number
          attempted_at: string | null
          cod_order_id: string
          created_at: string
          customer_feedback: string | null
          delivery_agent_id: string | null
          delivery_notes: string | null
          failure_reason: string | null
          id: string
          location_coordinates: unknown | null
          payment_method_used: string | null
          photo_proof_url: string | null
          scheduled_at: string
          signature_url: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount_collected?: number | null
          attempt_number?: number
          attempted_at?: string | null
          cod_order_id: string
          created_at?: string
          customer_feedback?: string | null
          delivery_agent_id?: string | null
          delivery_notes?: string | null
          failure_reason?: string | null
          id?: string
          location_coordinates?: unknown | null
          payment_method_used?: string | null
          photo_proof_url?: string | null
          scheduled_at: string
          signature_url?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount_collected?: number | null
          attempt_number?: number
          attempted_at?: string | null
          cod_order_id?: string
          created_at?: string
          customer_feedback?: string | null
          delivery_agent_id?: string | null
          delivery_notes?: string | null
          failure_reason?: string | null
          id?: string
          location_coordinates?: unknown | null
          payment_method_used?: string | null
          photo_proof_url?: string | null
          scheduled_at?: string
          signature_url?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cod_delivery_attempts_cod_order_id_fkey"
            columns: ["cod_order_id"]
            isOneToOne: false
            referencedRelation: "cod_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      cod_fees_config: {
        Row: {
          created_at: string
          district: string | null
          effective_from: string
          effective_until: string | null
          fee_type: string
          fee_value: number
          id: string
          is_active: boolean
          max_fee_amount: number | null
          max_order_amount: number | null
          min_order_amount: number
          priority: number
          province: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          district?: string | null
          effective_from?: string
          effective_until?: string | null
          fee_type?: string
          fee_value: number
          id?: string
          is_active?: boolean
          max_fee_amount?: number | null
          max_order_amount?: number | null
          min_order_amount?: number
          priority?: number
          province: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          district?: string | null
          effective_from?: string
          effective_until?: string | null
          fee_type?: string
          fee_value?: number
          id?: string
          is_active?: boolean
          max_fee_amount?: number | null
          max_order_amount?: number | null
          min_order_amount?: number
          priority?: number
          province?: string
          updated_at?: string
        }
        Relationships: []
      }
      cod_orders: {
        Row: {
          cod_amount: number
          cod_fee: number
          created_at: string
          customer_availability: Json | null
          delivery_preference: string | null
          id: string
          is_high_value: boolean | null
          max_verification_attempts: number
          order_id: string
          special_instructions: string | null
          updated_at: string
          verification_attempts: number
          verification_method: string
          verification_notes: string | null
          verification_status: string
        }
        Insert: {
          cod_amount: number
          cod_fee?: number
          created_at?: string
          customer_availability?: Json | null
          delivery_preference?: string | null
          id?: string
          is_high_value?: boolean | null
          max_verification_attempts?: number
          order_id: string
          special_instructions?: string | null
          updated_at?: string
          verification_attempts?: number
          verification_method?: string
          verification_notes?: string | null
          verification_status?: string
        }
        Update: {
          cod_amount?: number
          cod_fee?: number
          created_at?: string
          customer_availability?: Json | null
          delivery_preference?: string | null
          id?: string
          is_high_value?: boolean | null
          max_verification_attempts?: number
          order_id?: string
          special_instructions?: string | null
          updated_at?: string
          verification_attempts?: number
          verification_method?: string
          verification_notes?: string | null
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "cod_orders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      cod_payment_collection: {
        Row: {
          bank_deposit_reference: string | null
          cod_order_id: string
          collected_amount: number
          collected_at: string | null
          collected_by: string | null
          collection_status: string
          created_at: string
          delivery_attempt_id: string | null
          discrepancy_amount: number | null
          discrepancy_reason: string | null
          expected_amount: number
          id: string
          notes: string | null
          payment_method: string
          receipt_number: string | null
          updated_at: string
        }
        Insert: {
          bank_deposit_reference?: string | null
          cod_order_id: string
          collected_amount: number
          collected_at?: string | null
          collected_by?: string | null
          collection_status?: string
          created_at?: string
          delivery_attempt_id?: string | null
          discrepancy_amount?: number | null
          discrepancy_reason?: string | null
          expected_amount: number
          id?: string
          notes?: string | null
          payment_method: string
          receipt_number?: string | null
          updated_at?: string
        }
        Update: {
          bank_deposit_reference?: string | null
          cod_order_id?: string
          collected_amount?: number
          collected_at?: string | null
          collected_by?: string | null
          collection_status?: string
          created_at?: string
          delivery_attempt_id?: string | null
          discrepancy_amount?: number | null
          discrepancy_reason?: string | null
          expected_amount?: number
          id?: string
          notes?: string | null
          payment_method?: string
          receipt_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cod_payment_collection_cod_order_id_fkey"
            columns: ["cod_order_id"]
            isOneToOne: false
            referencedRelation: "cod_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cod_payment_collection_delivery_attempt_id_fkey"
            columns: ["delivery_attempt_id"]
            isOneToOne: false
            referencedRelation: "cod_delivery_attempts"
            referencedColumns: ["id"]
          },
        ]
      }
      cod_verification: {
        Row: {
          attempted_at: string
          attempted_by: string | null
          cod_order_id: string
          contact_number: string | null
          id: string
          next_attempt_at: string | null
          notes: string | null
          response_details: Json | null
          status: string
          verification_code: string | null
          verification_type: string
        }
        Insert: {
          attempted_at?: string
          attempted_by?: string | null
          cod_order_id: string
          contact_number?: string | null
          id?: string
          next_attempt_at?: string | null
          notes?: string | null
          response_details?: Json | null
          status: string
          verification_code?: string | null
          verification_type: string
        }
        Update: {
          attempted_at?: string
          attempted_by?: string | null
          cod_order_id?: string
          contact_number?: string | null
          id?: string
          next_attempt_at?: string | null
          notes?: string | null
          response_details?: Json | null
          status?: string
          verification_code?: string | null
          verification_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "cod_verification_cod_order_id_fkey"
            columns: ["cod_order_id"]
            isOneToOne: false
            referencedRelation: "cod_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          minimum_order_amount: number | null
          type: string
          updated_at: string
          usage_limit: number | null
          used_count: number | null
          value: number
        }
        Insert: {
          code: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          minimum_order_amount?: number | null
          type: string
          updated_at?: string
          usage_limit?: number | null
          used_count?: number | null
          value: number
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          minimum_order_amount?: number | null
          type?: string
          updated_at?: string
          usage_limit?: number | null
          used_count?: number | null
          value?: number
        }
        Relationships: []
      }
      customer_addresses: {
        Row: {
          address_line_1: string
          address_line_2: string | null
          city: string
          created_at: string
          district: string
          full_name: string
          id: string
          is_default: boolean | null
          phone: string
          postal_code: string
          province: string
          special_instructions: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line_1: string
          address_line_2?: string | null
          city: string
          created_at?: string
          district: string
          full_name: string
          id?: string
          is_default?: boolean | null
          phone: string
          postal_code: string
          province: string
          special_instructions?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line_1?: string
          address_line_2?: string | null
          city?: string
          created_at?: string
          district?: string
          full_name?: string
          id?: string
          is_default?: boolean | null
          phone?: string
          postal_code?: string
          province?: string
          special_instructions?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      guest_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          ip_address: unknown | null
          last_activity: string
          session_token: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          last_activity?: string
          session_token: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          last_activity?: string
          session_token?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      inventory_movements: {
        Row: {
          id: number
          movement_type: string | null
          product_variant_id: number | null
          quantity: number
          timestamp: string | null
        }
        Insert: {
          id?: never
          movement_type?: string | null
          product_variant_id?: number | null
          quantity: number
          timestamp?: string | null
        }
        Update: {
          id?: never
          movement_type?: string | null
          product_variant_id?: number | null
          quantity?: number
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletters: {
        Row: {
          email: string
          id: string
          is_subscribed: boolean | null
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: {
          email: string
          id?: string
          is_subscribed?: boolean | null
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          is_subscribed?: boolean | null
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: number
          order_id: number | null
          price: number | null
          product_variant_id: number | null
          quantity: number
        }
        Insert: {
          id?: never
          order_id?: number | null
          price?: number | null
          product_variant_id?: number | null
          quantity: number
        }
        Update: {
          id?: never
          order_id?: number | null
          price?: number | null
          product_variant_id?: number | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          notes: string | null
          order_id: string
          previous_status: string | null
          status: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          order_id: string
          previous_status?: string | null
          status: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string
          previous_status?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json | null
          created_at: string
          currency: string | null
          delivered_at: string | null
          guest_email: string | null
          id: string
          notes: string | null
          order_number: string
          payment_method: string
          payment_status: string
          shipped_at: string | null
          shipping_address: Json
          shipping_cost: number | null
          status: string
          subtotal: number
          tax_amount: number | null
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          billing_address?: Json | null
          created_at?: string
          currency?: string | null
          delivered_at?: string | null
          guest_email?: string | null
          id?: string
          notes?: string | null
          order_number: string
          payment_method: string
          payment_status?: string
          shipped_at?: string | null
          shipping_address: Json
          shipping_cost?: number | null
          status?: string
          subtotal: number
          tax_amount?: number | null
          total_amount: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          billing_address?: Json | null
          created_at?: string
          currency?: string | null
          delivered_at?: string | null
          guest_email?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string
          payment_status?: string
          shipped_at?: string | null
          shipping_address?: Json
          shipping_cost?: number | null
          status?: string
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string
          display_order: number | null
          id: string
          image_url: string
          is_primary: boolean | null
          product_id: number
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_url: string
          is_primary?: boolean | null
          product_id: number
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string
          is_primary?: boolean | null
          product_id?: number
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
      product_variants: {
        Row: {
          color: string | null
          id: number
          price: number | null
          product_id: number | null
          size: string | null
          stock_quantity: number | null
        }
        Insert: {
          color?: string | null
          id?: never
          price?: number | null
          product_id?: number | null
          size?: string | null
          stock_quantity?: number | null
        }
        Update: {
          color?: string | null
          id?: never
          price?: number | null
          product_id?: number | null
          size?: string | null
          stock_quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_price: number | null
          category_id: number | null
          created_at: string | null
          description: string | null
          id: number
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          price: number | null
          sale_price: number | null
          short_description: string | null
          slug: string
          stock_quantity: number | null
          updated_at: string | null
        }
        Insert: {
          base_price?: number | null
          category_id?: number | null
          created_at?: string | null
          description?: string | null
          id?: never
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          price?: number | null
          sale_price?: number | null
          short_description?: string | null
          slug: string
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Update: {
          base_price?: number | null
          category_id?: number | null
          created_at?: string | null
          description?: string | null
          id?: never
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          price?: number | null
          sale_price?: number | null
          short_description?: string | null
          slug?: string
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          is_approved: boolean | null
          is_verified_purchase: boolean | null
          order_id: string | null
          product_id: string
          rating: number
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean | null
          is_verified_purchase?: boolean | null
          order_id?: string | null
          product_id: string
          rating: number
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean | null
          is_verified_purchase?: boolean | null
          order_id?: string | null
          product_id?: string
          rating?: number
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      store_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      subcategories: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_admin_user: {
        Args: { user_email: string }
        Returns: string
      }
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_secure_session_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_admin_permission: {
        Args: { permission_key: string; user_uuid?: string }
        Returns: boolean
      }
      is_admin: {
        Args: { user_uuid?: string }
        Returns: boolean
      }
      refresh_product_search: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      track_inventory_movement: {
        Args: {
          p_variant_id: string
          p_movement_type: string
          p_quantity_change: number
          p_order_id?: string
          p_notes?: string
        }
        Returns: undefined
      }
      update_admin_permissions: {
        Args: {
          target_user_id: string
          new_permissions: Json
          requesting_user_id?: string
        }
        Returns: boolean
      }
      validate_guest_session: {
        Args: { token: string }
        Returns: boolean
      }
      validate_image_url: {
        Args: { url: string }
        Returns: boolean
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
