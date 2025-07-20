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
          created_at: string
          id: string
          product_id: string
          product_variant_id: string | null
          quantity: number
          session_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          product_variant_id?: string | null
          quantity?: number
          session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          product_variant_id?: string | null
          quantity?: number
          session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_search"
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
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          parent_id: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
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
      inventory_movements: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          movement_type: string
          new_quantity: number
          notes: string | null
          order_id: string | null
          previous_quantity: number
          product_variant_id: string
          quantity_change: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          movement_type: string
          new_quantity: number
          notes?: string | null
          order_id?: string | null
          previous_quantity: number
          product_variant_id: string
          quantity_change: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          movement_type?: string
          new_quantity?: number
          notes?: string | null
          order_id?: string | null
          previous_quantity?: number
          product_variant_id?: string
          quantity_change?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
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
          created_at: string
          id: string
          order_id: string
          product_id: string
          product_snapshot: Json
          product_variant_id: string | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id: string
          product_snapshot: Json
          product_variant_id?: string | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string
          product_snapshot?: Json
          product_variant_id?: string | null
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
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
            referencedRelation: "product_search"
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
          product_id: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_url: string
          is_primary?: boolean | null
          product_id: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string
          is_primary?: boolean | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_search"
            referencedColumns: ["id"]
          },
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
          created_at: string
          id: string
          low_stock_threshold: number | null
          price: number | null
          product_id: string
          size: string
          sku: string | null
          stock_quantity: number | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          low_stock_threshold?: number | null
          price?: number | null
          product_id: string
          size: string
          sku?: string | null
          stock_quantity?: number | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          low_stock_threshold?: number | null
          price?: number | null
          product_id?: string
          size?: string
          sku?: string | null
          stock_quantity?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_search"
            referencedColumns: ["id"]
          },
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
          category_id: string | null
          cost_price: number | null
          created_at: string
          description: string | null
          dimensions: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          meta_description: string | null
          meta_title: string | null
          name: string
          price: number
          sale_price: number | null
          short_description: string | null
          sku: string | null
          slug: string
          subcategory_id: string | null
          tags: string[] | null
          updated_at: string
          weight: number | null
        }
        Insert: {
          category_id?: string | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          dimensions?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          price: number
          sale_price?: number | null
          short_description?: string | null
          sku?: string | null
          slug: string
          subcategory_id?: string | null
          tags?: string[] | null
          updated_at?: string
          weight?: number | null
        }
        Update: {
          category_id?: string | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          dimensions?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          price?: number
          sale_price?: number | null
          short_description?: string | null
          sku?: string | null
          slug?: string
          subcategory_id?: string | null
          tags?: string[] | null
          updated_at?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
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
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
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
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_search"
            referencedColumns: ["id"]
          },
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
      product_search: {
        Row: {
          category_name: string | null
          description: string | null
          id: string | null
          is_active: boolean | null
          is_featured: boolean | null
          name: string | null
          price: number | null
          sale_price: number | null
          search_vector: unknown | null
          short_description: string | null
          sku: string | null
          subcategory_name: string | null
          tags: string[] | null
        }
        Relationships: []
      }
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
