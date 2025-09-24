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
      admin_actions: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          target_id: string | null
          target_type: string
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_id?: string | null
          target_type: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_id?: string | null
          target_type?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_actions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_notifications: {
        Row: {
          action_label: string | null
          action_url: string | null
          country_code: string | null
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          priority: string
          title: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          country_code?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          priority?: string
          title: string
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          country_code?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          priority?: string
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_config_tasks: {
        Row: {
          completed: boolean | null
          created_at: string | null
          description: string
          id: string
          instructions: string
          task_type: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          description: string
          id?: string
          instructions: string
          task_type: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          description?: string
          id?: string
          instructions?: string
          task_type?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          badge_description: string | null
          badge_icon: string | null
          badge_name: string
          badge_type: string
          created_at: string | null
          earned_at: string | null
          expires_at: string | null
          id: string
          metadata: Json | null
          profile_id: string
        }
        Insert: {
          badge_description?: string | null
          badge_icon?: string | null
          badge_name: string
          badge_type: string
          created_at?: string | null
          earned_at?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          profile_id: string
        }
        Update: {
          badge_description?: string | null
          badge_icon?: string | null
          badge_name?: string
          badge_type?: string
          created_at?: string | null
          earned_at?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "badges_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      balance_history: {
        Row: {
          amount: number
          balance_after: number
          balance_before: number
          created_at: string | null
          created_by: string | null
          description: string
          id: string
          metadata: Json | null
          reference_id: string | null
          reference_type: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          balance_before: number
          created_at?: string | null
          created_by?: string | null
          description: string
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          balance_before?: number
          created_at?: string | null
          created_by?: string | null
          description?: string
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "balance_history_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "balance_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      boost_history: {
        Row: {
          boost_type: string
          boosted_at: string | null
          created_at: string | null
          credits_used: number
          expires_at: string
          id: string
          product_id: string
          status: string | null
          user_id: string
        }
        Insert: {
          boost_type?: string
          boosted_at?: string | null
          created_at?: string | null
          credits_used?: number
          expires_at: string
          id?: string
          product_id: string
          status?: string | null
          user_id: string
        }
        Update: {
          boost_type?: string
          boosted_at?: string | null
          created_at?: string | null
          credits_used?: number
          expires_at?: string
          id?: string
          product_id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "boost_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boost_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_collections: {
        Row: {
          collection_type: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_featured: boolean
          logo_url: string | null
          name: string
          product_count: number
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          collection_type: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          logo_url?: string | null
          name: string
          product_count?: number
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          collection_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          logo_url?: string | null
          name?: string
          product_count?: number
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      brand_suggestions: {
        Row: {
          brand_name: string
          created_at: string | null
          id: string
          merged_to_brand: string | null
          status: string | null
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          brand_name: string
          created_at?: string | null
          id?: string
          merged_to_brand?: string | null
          status?: string | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          brand_name?: string
          created_at?: string | null
          id?: string
          merged_to_brand?: string | null
          status?: string | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      brands: {
        Row: {
          brand_description: string | null
          brand_logo_url: string | null
          brand_name: string
          business_registration: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          profile_id: string
          subscription_active: boolean | null
          tax_id: string | null
          updated_at: string | null
          verification_documents: Json | null
          verified_brand: boolean | null
          website_url: string | null
        }
        Insert: {
          brand_description?: string | null
          brand_logo_url?: string | null
          brand_name: string
          business_registration?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          profile_id: string
          subscription_active?: boolean | null
          tax_id?: string | null
          updated_at?: string | null
          verification_documents?: Json | null
          verified_brand?: boolean | null
          website_url?: string | null
        }
        Update: {
          brand_description?: string | null
          brand_logo_url?: string | null
          brand_name?: string
          business_registration?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          profile_id?: string
          subscription_active?: boolean | null
          tax_id?: string | null
          updated_at?: string | null
          verification_documents?: Json | null
          verified_brand?: boolean | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brands_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bundle_sessions: {
        Row: {
          buyer_id: string
          completed: boolean | null
          created_at: string | null
          expires_at: string
          id: string
          product_ids: string[]
          seller_id: string
        }
        Insert: {
          buyer_id: string
          completed?: boolean | null
          created_at?: string | null
          expires_at?: string
          id?: string
          product_ids: string[]
          seller_id: string
        }
        Update: {
          buyer_id?: string
          completed?: boolean | null
          created_at?: string | null
          expires_at?: string
          id?: string
          product_ids?: string[]
          seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bundle_sessions_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bundle_sessions_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          level: number | null
          name: string
          parent_id: string | null
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          level?: number | null
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          level?: number | null
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
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
      country_config: {
        Row: {
          commission_rate: number | null
          country_code: string
          country_name: string
          created_at: string | null
          currency: string
          is_active: boolean | null
          locale: string
          tax_rate: number | null
          updated_at: string | null
        }
        Insert: {
          commission_rate?: number | null
          country_code: string
          country_name: string
          created_at?: string | null
          currency: string
          is_active?: boolean | null
          locale: string
          tax_rate?: number | null
          updated_at?: string | null
        }
        Update: {
          commission_rate?: number | null
          country_code?: string
          country_name?: string
          created_at?: string | null
          currency?: string
          is_active?: boolean | null
          locale?: string
          tax_rate?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      discount_codes: {
        Row: {
          applicable_plans: string[] | null
          code: string
          created_at: string | null
          currency: string | null
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          maximum_discount: number | null
          metadata: Json | null
          minimum_amount: number | null
          name: string | null
          per_user_limit: number | null
          updated_at: string | null
          usage_count: number | null
          usage_limit: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          applicable_plans?: string[] | null
          code: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          maximum_discount?: number | null
          metadata?: Json | null
          minimum_amount?: number | null
          name?: string | null
          per_user_limit?: number | null
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          applicable_plans?: string[] | null
          code?: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          maximum_discount?: number | null
          metadata?: Json | null
          minimum_amount?: number | null
          name?: string | null
          per_user_limit?: number | null
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      drip_nominations: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          nominated_at: string | null
          nominated_by: string
          product_id: string
          quality_score: number | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          nominated_at?: string | null
          nominated_by: string
          product_id: string
          quality_score?: number | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          nominated_at?: string | null
          nominated_by?: string
          product_id?: string
          quality_score?: number | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drip_nominations_nominated_by_fkey"
            columns: ["nominated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drip_nominations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drip_nominations_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      followers: {
        Row: {
          created_at: string | null
          follower_id: string | null
          following_id: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id?: string | null
          following_id?: string | null
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string | null
          following_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "followers_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followers_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      manual_config_tasks: {
        Row: {
          completed: boolean | null
          created_at: string | null
          description: string
          id: string
          instructions: string
          priority: string
          task_type: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          description: string
          id?: string
          instructions: string
          priority?: string
          task_type: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          description?: string
          id?: string
          instructions?: string
          priority?: string
          task_type?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          country_code: string | null
          created_at: string | null
          delivered_at: string | null
          id: string
          image_urls: string[] | null
          is_read: boolean | null
          message_type: string | null
          order_id: string | null
          product_id: string | null
          read_at: string | null
          receiver_id: string
          sender_id: string
          status: Database["public"]["Enums"]["message_status"] | null
        }
        Insert: {
          content: string
          country_code?: string | null
          created_at?: string | null
          delivered_at?: string | null
          id?: string
          image_urls?: string[] | null
          is_read?: boolean | null
          message_type?: string | null
          order_id?: string | null
          product_id?: string | null
          read_at?: string | null
          receiver_id: string
          sender_id: string
          status?: Database["public"]["Enums"]["message_status"] | null
        }
        Update: {
          content?: string
          country_code?: string | null
          created_at?: string | null
          delivered_at?: string | null
          id?: string
          image_urls?: string[] | null
          is_read?: boolean | null
          message_type?: string | null
          order_id?: string | null
          product_id?: string | null
          read_at?: string | null
          receiver_id?: string
          sender_id?: string
          status?: Database["public"]["Enums"]["message_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_required: boolean | null
          action_url: string | null
          category: string | null
          created_at: string | null
          data: Json | null
          dismissed: boolean | null
          dismissed_at: string | null
          expires_at: string | null
          id: string
          message: string
          order_id: string | null
          priority: string | null
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_required?: boolean | null
          action_url?: string | null
          category?: string | null
          created_at?: string | null
          data?: Json | null
          dismissed?: boolean | null
          dismissed_at?: string | null
          expires_at?: string | null
          id?: string
          message: string
          order_id?: string | null
          priority?: string | null
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_required?: boolean | null
          action_url?: string | null
          category?: string | null
          created_at?: string | null
          data?: Json | null
          dismissed?: boolean | null
          dismissed_at?: string | null
          expires_at?: string | null
          id?: string
          message?: string
          order_id?: string | null
          priority?: string | null
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string
          price: number
          product_id: string
          quantity: number | null
          size: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id: string
          price: number
          product_id: string
          quantity?: number | null
          size?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string
          price?: number
          product_id?: string
          quantity?: number | null
          size?: string | null
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
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          archived: boolean | null
          archived_at: string | null
          bundle_discount: number | null
          buyer_id: string
          buyer_rated: boolean | null
          cancelled_at: string | null
          cancelled_reason: string | null
          commission_rate: number | null
          completion_notes: string | null
          country_code: string | null
          created_at: string | null
          currency: string | null
          delivered_at: string | null
          id: string
          is_bundle: boolean | null
          items_count: number | null
          notes: string | null
          payment_method: string | null
          platform_fee: number | null
          product_id: string
          rating_reminder_sent: boolean | null
          refund_amount: number | null
          refund_reason: string | null
          refunded_at: string | null
          seller_id: string
          seller_net_amount: number | null
          seller_rated: boolean | null
          service_fee: number | null
          shipped_at: string | null
          shipping_address: Json | null
          shipping_cost: number | null
          status: Database["public"]["Enums"]["order_status"] | null
          tax_amount: number | null
          total_amount: number
          tracking_number: string | null
          updated_at: string | null
        }
        Insert: {
          archived?: boolean | null
          archived_at?: string | null
          bundle_discount?: number | null
          buyer_id: string
          buyer_rated?: boolean | null
          cancelled_at?: string | null
          cancelled_reason?: string | null
          commission_rate?: number | null
          completion_notes?: string | null
          country_code?: string | null
          created_at?: string | null
          currency?: string | null
          delivered_at?: string | null
          id?: string
          is_bundle?: boolean | null
          items_count?: number | null
          notes?: string | null
          payment_method?: string | null
          platform_fee?: number | null
          product_id: string
          rating_reminder_sent?: boolean | null
          refund_amount?: number | null
          refund_reason?: string | null
          refunded_at?: string | null
          seller_id: string
          seller_net_amount?: number | null
          seller_rated?: boolean | null
          service_fee?: number | null
          shipped_at?: string | null
          shipping_address?: Json | null
          shipping_cost?: number | null
          status?: Database["public"]["Enums"]["order_status"] | null
          tax_amount?: number | null
          total_amount: number
          tracking_number?: string | null
          updated_at?: string | null
        }
        Update: {
          archived?: boolean | null
          archived_at?: string | null
          bundle_discount?: number | null
          buyer_id?: string
          buyer_rated?: boolean | null
          cancelled_at?: string | null
          cancelled_reason?: string | null
          commission_rate?: number | null
          completion_notes?: string | null
          country_code?: string | null
          created_at?: string | null
          currency?: string | null
          delivered_at?: string | null
          id?: string
          is_bundle?: boolean | null
          items_count?: number | null
          notes?: string | null
          payment_method?: string | null
          platform_fee?: number | null
          product_id?: string
          rating_reminder_sent?: boolean | null
          refund_amount?: number | null
          refund_reason?: string | null
          refunded_at?: string | null
          seller_id?: string
          seller_net_amount?: number | null
          seller_rated?: boolean | null
          service_fee?: number | null
          shipped_at?: string | null
          shipping_address?: Json | null
          shipping_cost?: number | null
          status?: Database["public"]["Enums"]["order_status"] | null
          tax_amount?: number | null
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payout_requests: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          metadata: Json | null
          net_amount: number | null
          payout_method: Json
          processed_at: string | null
          processed_by: string | null
          reference_number: string | null
          rejection_reason: string | null
          requested_at: string | null
          reviewed_at: string | null
          status: string | null
          transaction_fee: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          net_amount?: number | null
          payout_method: Json
          processed_at?: string | null
          processed_by?: string | null
          reference_number?: string | null
          rejection_reason?: string | null
          requested_at?: string | null
          reviewed_at?: string | null
          status?: string | null
          transaction_fee?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          net_amount?: number | null
          payout_method?: Json
          processed_at?: string | null
          processed_by?: string | null
          reference_number?: string | null
          rejection_reason?: string | null
          requested_at?: string | null
          reviewed_at?: string | null
          status?: string | null
          transaction_fee?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payout_requests_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payout_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      presence: {
        Row: {
          created_at: string | null
          id: string
          last_seen: string | null
          status: string | null
          typing_in_conversation: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_seen?: string | null
          status?: string | null
          typing_in_conversation?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_seen?: string | null
          status?: string | null
          typing_in_conversation?: string | null
          user_id?: string
        }
        Relationships: []
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string | null
          display_order: number | null
          id: string
          image_url: string
          product_id: string
          sort_order: number | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          product_id: string
          sort_order?: number | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
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
      product_slug_history: {
        Row: {
          changed_at: string | null
          old_slug: string
          product_id: string
        }
        Insert: {
          changed_at?: string | null
          old_slug: string
          product_id: string
        }
        Update: {
          changed_at?: string | null
          old_slug?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_slug_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_views: {
        Row: {
          created_at: string
          id: string
          ip_address: unknown | null
          product_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          product_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          product_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_views_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          archived_at: string | null
          auto_archive_after_days: number | null
          boost_history_id: string | null
          boost_priority: number | null
          boost_type: string | null
          boosted_until: string | null
          brand: string | null
          brand_collection_id: string | null
          category_id: string
          color: string | null
          commission_rate: number | null
          condition: Database["public"]["Enums"]["product_condition"]
          country_code: string | null
          created_at: string | null
          custom_subcategory: string | null
          description: string
          drip_admin_notes: string | null
          drip_approved_at: string | null
          drip_nominated_at: string | null
          drip_nominated_by: string | null
          drip_quality_score: number | null
          drip_rejected_at: string | null
          drip_rejection_reason: string | null
          drip_reviewed_by: string | null
          drip_status: string | null
          favorite_count: number
          id: string
          is_active: boolean | null
          is_boosted: boolean | null
          is_drip_candidate: boolean | null
          is_featured: boolean | null
          is_sold: boolean | null
          location: string | null
          material: string | null
          net_earnings: number | null
          platform_fee: number | null
          price: number
          region: string | null
          search_vector: unknown | null
          seller_id: string
          shipping_cost: number | null
          size: string | null
          slug: string | null
          slug_locked: boolean | null
          sold_at: string | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          archived_at?: string | null
          auto_archive_after_days?: number | null
          boost_history_id?: string | null
          boost_priority?: number | null
          boost_type?: string | null
          boosted_until?: string | null
          brand?: string | null
          brand_collection_id?: string | null
          category_id: string
          color?: string | null
          commission_rate?: number | null
          condition: Database["public"]["Enums"]["product_condition"]
          country_code?: string | null
          created_at?: string | null
          custom_subcategory?: string | null
          description: string
          drip_admin_notes?: string | null
          drip_approved_at?: string | null
          drip_nominated_at?: string | null
          drip_nominated_by?: string | null
          drip_quality_score?: number | null
          drip_rejected_at?: string | null
          drip_rejection_reason?: string | null
          drip_reviewed_by?: string | null
          drip_status?: string | null
          favorite_count?: number
          id?: string
          is_active?: boolean | null
          is_boosted?: boolean | null
          is_drip_candidate?: boolean | null
          is_featured?: boolean | null
          is_sold?: boolean | null
          location?: string | null
          material?: string | null
          net_earnings?: number | null
          platform_fee?: number | null
          price: number
          region?: string | null
          search_vector?: unknown | null
          seller_id: string
          shipping_cost?: number | null
          size?: string | null
          slug?: string | null
          slug_locked?: boolean | null
          sold_at?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          archived_at?: string | null
          auto_archive_after_days?: number | null
          boost_history_id?: string | null
          boost_priority?: number | null
          boost_type?: string | null
          boosted_until?: string | null
          brand?: string | null
          brand_collection_id?: string | null
          category_id?: string
          color?: string | null
          commission_rate?: number | null
          condition?: Database["public"]["Enums"]["product_condition"]
          country_code?: string | null
          created_at?: string | null
          custom_subcategory?: string | null
          description?: string
          drip_admin_notes?: string | null
          drip_approved_at?: string | null
          drip_nominated_at?: string | null
          drip_nominated_by?: string | null
          drip_quality_score?: number | null
          drip_rejected_at?: string | null
          drip_rejection_reason?: string | null
          drip_reviewed_by?: string | null
          drip_status?: string | null
          favorite_count?: number
          id?: string
          is_active?: boolean | null
          is_boosted?: boolean | null
          is_drip_candidate?: boolean | null
          is_featured?: boolean | null
          is_sold?: boolean | null
          location?: string | null
          material?: string | null
          net_earnings?: number | null
          platform_fee?: number | null
          price?: number
          region?: string | null
          search_vector?: unknown | null
          seller_id?: string
          shipping_cost?: number | null
          size?: string | null
          slug?: string | null
          slug_locked?: boolean | null
          sold_at?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_boost_history_id_fkey"
            columns: ["boost_history_id"]
            isOneToOne: false
            referencedRelation: "boost_history"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_brand_collection_id_fkey"
            columns: ["brand_collection_id"]
            isOneToOne: false
            referencedRelation: "brand_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_drip_nominated_by_fkey"
            columns: ["drip_nominated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_drip_reviewed_by_fkey"
            columns: ["drip_reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_locked_until: string | null
          account_type: string | null
          avatar_url: string | null
          avg_shipping_hours: number | null
          bio: string | null
          boost_credits_used_this_month: number | null
          brand_status: string | null
          country_code: string | null
          created_at: string | null
          currency: string | null
          current_balance: number | null
          date_of_birth: string | null
          failed_login_attempts: number | null
          followers_count: number | null
          following_count: number | null
          full_name: string | null
          grace_period_ends_at: string | null
          id: string
          last_active_at: string | null
          last_boost_reset_date: string | null
          last_password_change: string | null
          last_payout_at: string | null
          last_stats_update: string | null
          location: string | null
          monthly_views: number | null
          on_time_shipping_rate: number | null
          onboarding_completed: boolean | null
          payout_method: Json | null
          payout_settings: Json | null
          phone: string | null
          premium_boosts_remaining: number | null
          purchases_count: number | null
          rating: number | null
          rating_breakdown: Json | null
          region: string | null
          response_time_hours: number | null
          review_count: number | null
          role: Database["public"]["Enums"]["user_role"] | null
          sales_count: number | null
          seller_metrics: Json | null
          social_links: Json | null
          subscription_expires_at: string | null
          subscription_tier: string | null
          total_boosts_used: number | null
          total_reviews: number | null
          total_sales: number | null
          total_sales_value: number | null
          total_withdrawn: number | null
          two_factor_enabled: boolean | null
          updated_at: string | null
          username: string | null
          verification_documents: Json | null
          verification_status: string | null
          verified: boolean | null
          weekly_sales_count: number | null
        }
        Insert: {
          account_locked_until?: string | null
          account_type?: string | null
          avatar_url?: string | null
          avg_shipping_hours?: number | null
          bio?: string | null
          boost_credits_used_this_month?: number | null
          brand_status?: string | null
          country_code?: string | null
          created_at?: string | null
          currency?: string | null
          current_balance?: number | null
          date_of_birth?: string | null
          failed_login_attempts?: number | null
          followers_count?: number | null
          following_count?: number | null
          full_name?: string | null
          grace_period_ends_at?: string | null
          id: string
          last_active_at?: string | null
          last_boost_reset_date?: string | null
          last_password_change?: string | null
          last_payout_at?: string | null
          last_stats_update?: string | null
          location?: string | null
          monthly_views?: number | null
          on_time_shipping_rate?: number | null
          onboarding_completed?: boolean | null
          payout_method?: Json | null
          payout_settings?: Json | null
          phone?: string | null
          premium_boosts_remaining?: number | null
          purchases_count?: number | null
          rating?: number | null
          rating_breakdown?: Json | null
          region?: string | null
          response_time_hours?: number | null
          review_count?: number | null
          role?: Database["public"]["Enums"]["user_role"] | null
          sales_count?: number | null
          seller_metrics?: Json | null
          social_links?: Json | null
          subscription_expires_at?: string | null
          subscription_tier?: string | null
          total_boosts_used?: number | null
          total_reviews?: number | null
          total_sales?: number | null
          total_sales_value?: number | null
          total_withdrawn?: number | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          username?: string | null
          verification_documents?: Json | null
          verification_status?: string | null
          verified?: boolean | null
          weekly_sales_count?: number | null
        }
        Update: {
          account_locked_until?: string | null
          account_type?: string | null
          avatar_url?: string | null
          avg_shipping_hours?: number | null
          bio?: string | null
          boost_credits_used_this_month?: number | null
          brand_status?: string | null
          country_code?: string | null
          created_at?: string | null
          currency?: string | null
          current_balance?: number | null
          date_of_birth?: string | null
          failed_login_attempts?: number | null
          followers_count?: number | null
          following_count?: number | null
          full_name?: string | null
          grace_period_ends_at?: string | null
          id?: string
          last_active_at?: string | null
          last_boost_reset_date?: string | null
          last_password_change?: string | null
          last_payout_at?: string | null
          last_stats_update?: string | null
          location?: string | null
          monthly_views?: number | null
          on_time_shipping_rate?: number | null
          onboarding_completed?: boolean | null
          payout_method?: Json | null
          payout_settings?: Json | null
          phone?: string | null
          premium_boosts_remaining?: number | null
          purchases_count?: number | null
          rating?: number | null
          rating_breakdown?: Json | null
          region?: string | null
          response_time_hours?: number | null
          review_count?: number | null
          role?: Database["public"]["Enums"]["user_role"] | null
          sales_count?: number | null
          seller_metrics?: Json | null
          social_links?: Json | null
          subscription_expires_at?: string | null
          subscription_tier?: string | null
          total_boosts_used?: number | null
          total_reviews?: number | null
          total_sales?: number | null
          total_sales_value?: number | null
          total_withdrawn?: number | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          username?: string | null
          verification_documents?: Json | null
          verification_status?: string | null
          verified?: boolean | null
          weekly_sales_count?: number | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          communication_rating: number | null
          country_code: string | null
          created_at: string | null
          helpful_count: number | null
          id: string
          image_urls: string[] | null
          is_public: boolean | null
          is_verified_purchase: boolean | null
          order_id: string | null
          product_id: string | null
          product_quality_rating: number | null
          rating: number
          reviewee_id: string
          reviewer_id: string
          shipping_rating: number | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          comment?: string | null
          communication_rating?: number | null
          country_code?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          image_urls?: string[] | null
          is_public?: boolean | null
          is_verified_purchase?: boolean | null
          order_id?: string | null
          product_id?: string | null
          product_quality_rating?: number | null
          rating: number
          reviewee_id: string
          reviewer_id: string
          shipping_rating?: number | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          comment?: string | null
          communication_rating?: number | null
          country_code?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          image_urls?: string[] | null
          is_public?: boolean | null
          is_verified_purchase?: boolean | null
          order_id?: string | null
          product_id?: string | null
          product_quality_rating?: number | null
          rating?: number
          reviewee_id?: string
          reviewer_id?: string
          shipping_rating?: number | null
          title?: string | null
          updated_at?: string | null
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
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_balances: {
        Row: {
          available_balance: number | null
          created_at: string | null
          currency: string | null
          id: string
          last_payout_at: string | null
          pending_balance: number | null
          total_earned: number | null
          total_withdrawn: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          available_balance?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          last_payout_at?: string | null
          pending_balance?: number | null
          total_earned?: number | null
          total_withdrawn?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          available_balance?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          last_payout_at?: string | null
          pending_balance?: number | null
          total_earned?: number | null
          total_withdrawn?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seller_balances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      slug_processing_queue: {
        Row: {
          attempts: number
          created_at: string | null
          error_message: string | null
          id: string
          max_attempts: number
          product_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          attempts?: number
          created_at?: string | null
          error_message?: string | null
          id?: string
          max_attempts?: number
          product_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          attempts?: number
          created_at?: string | null
          error_message?: string | null
          id?: string
          max_attempts?: number
          product_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "slug_processing_queue_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          analytics_access: boolean | null
          created_at: string | null
          currency: string
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          max_listings: number | null
          max_photos_per_listing: number | null
          name: string
          plan_type: string
          price_monthly: number
          price_yearly: number
          priority_support: boolean | null
          slug: string
          stripe_price_id_monthly: string | null
          stripe_price_id_yearly: string | null
          updated_at: string | null
        }
        Insert: {
          analytics_access?: boolean | null
          created_at?: string | null
          currency?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_listings?: number | null
          max_photos_per_listing?: number | null
          name: string
          plan_type: string
          price_monthly?: number
          price_yearly?: number
          priority_support?: boolean | null
          slug: string
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          updated_at?: string | null
        }
        Update: {
          analytics_access?: boolean | null
          created_at?: string | null
          currency?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_listings?: number | null
          max_photos_per_listing?: number | null
          name?: string
          plan_type?: string
          price_monthly?: number
          price_yearly?: number
          priority_support?: boolean | null
          slug?: string
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          message: string | null
          metadata: Json | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          message?: string | null
          metadata?: Json | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          message?: string | null
          metadata?: Json | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount_total: number
          buyer_id: string
          commission_amount: number
          country_code: string | null
          created_at: string | null
          currency: string
          id: string
          metadata: Json | null
          order_id: string
          payment_status: string | null
          payout_date: string | null
          payout_reference: string | null
          payout_status: string | null
          processed_at: string | null
          product_price: number | null
          seller_earnings: number
          seller_id: string
          shipping_cost: number | null
          status: string
          stripe_payment_intent_id: string
          updated_at: string | null
        }
        Insert: {
          amount_total: number
          buyer_id: string
          commission_amount?: number
          country_code?: string | null
          created_at?: string | null
          currency?: string
          id?: string
          metadata?: Json | null
          order_id: string
          payment_status?: string | null
          payout_date?: string | null
          payout_reference?: string | null
          payout_status?: string | null
          processed_at?: string | null
          product_price?: number | null
          seller_earnings?: number
          seller_id: string
          shipping_cost?: number | null
          status?: string
          stripe_payment_intent_id: string
          updated_at?: string | null
        }
        Update: {
          amount_total?: number
          buyer_id?: string
          commission_amount?: number
          country_code?: string | null
          created_at?: string | null
          currency?: string
          id?: string
          metadata?: Json | null
          order_id?: string
          payment_status?: string | null
          payout_date?: string | null
          payout_reference?: string | null
          payout_status?: string | null
          processed_at?: string | null
          product_price?: number | null
          seller_earnings?: number
          seller_id?: string
          shipping_cost?: number | null
          status?: string
          stripe_payment_intent_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_payments: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string | null
          currency: string
          failed_at: string | null
          id: string
          metadata: Json | null
          plan_type: string | null
          refunded_at: string | null
          status: string
          stripe_payment_intent_id: string
          user_id: string
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string | null
          currency?: string
          failed_at?: string | null
          id?: string
          metadata?: Json | null
          plan_type?: string | null
          refunded_at?: string | null
          status?: string
          stripe_payment_intent_id: string
          user_id: string
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string | null
          currency?: string
          failed_at?: string | null
          id?: string
          metadata?: Json | null
          plan_type?: string | null
          refunded_at?: string | null
          status?: string
          stripe_payment_intent_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          amount_paid: number | null
          auto_renewal: boolean | null
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created_at: string | null
          currency: string | null
          current_period_end: string | null
          current_period_start: string | null
          discount_code: string | null
          discount_percent: number | null
          expiry_warning_sent: boolean | null
          final_price: number | null
          grace_period_days: number | null
          id: string
          metadata: Json | null
          original_price: number | null
          payment_method: Json | null
          plan_id: string
          renewal_reminder_sent: boolean | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_source: string | null
          trial_end: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_paid?: number | null
          auto_renewal?: boolean | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string | null
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          discount_code?: string | null
          discount_percent?: number | null
          expiry_warning_sent?: boolean | null
          final_price?: number | null
          grace_period_days?: number | null
          id?: string
          metadata?: Json | null
          original_price?: number | null
          payment_method?: Json | null
          plan_id: string
          renewal_reminder_sent?: boolean | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_source?: string | null
          trial_end?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_paid?: number | null
          auto_renewal?: boolean | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string | null
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          discount_code?: string | null
          discount_percent?: number | null
          expiry_warning_sent?: boolean | null
          final_price?: number | null
          grace_period_days?: number | null
          id?: string
          metadata?: Json | null
          original_price?: number | null
          payment_method?: Json | null
          plan_id?: string
          renewal_reminder_sent?: boolean | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_source?: string | null
          trial_end?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      username_history: {
        Row: {
          changed_at: string | null
          old_username: string
          user_id: string
        }
        Insert: {
          changed_at?: string | null
          old_username: string
          user_id: string
        }
        Update: {
          changed_at?: string | null
          old_username?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "username_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_drip_product: {
        Args: {
          admin_id_param: string
          admin_notes_param?: string
          product_id_param: string
          quality_score_param?: number
        }
        Returns: boolean
      }
      audit_rls_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          policies_count: number
          rls_enabled: boolean
          security_status: string
          table_name: string
        }[]
      }
      boost_product: {
        Args: {
          p_boost_duration_days?: number
          p_product_id: string
          p_user_id: string
        }
        Returns: Json
      }
      calculate_seller_trending: {
        Args: { seller_id: string }
        Returns: string
      }
      can_message_about_product: {
        Args: { product_id: string; sender_id: string }
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          p_action: string
          p_identifier: string
          p_max_attempts?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      cleanup_summary: {
        Args: Record<PropertyKey, never>
        Returns: {
          performance_indexes_removed: number
          rls_policies_optimized: number
          security_issues_fixed: number
          status: string
          total_migrations: number
        }[]
      }
      create_order_transaction: {
        Args: {
          p_amount: number
          p_order_id: string
          p_status: string
          p_transaction_type: string
        }
        Returns: string
      }
      decrement_favorite_count: {
        Args: { product_uuid: string }
        Returns: undefined
      }
      expire_old_boosts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_unique_username: {
        Args: { base_username: string }
        Returns: string
      }
      get_category_ancestors: {
        Args: { category_id: string }
        Returns: {
          id: string
          level: number
          name: string
          slug: string
        }[]
      }
      get_category_descendants: {
        Args: { category_uuid: string }
        Returns: {
          id: string
        }[]
      }
      get_category_hierarchy: {
        Args: { category_uuid: string }
        Returns: Json
      }
      get_conversation_messages_secure: {
        Args: { limit_count?: number; other_user_id: string }
        Returns: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          read: boolean
          receiver_id: string
          sender_id: string
          sender_profile: Json
        }[]
      }
      get_homepage_data: {
        Args: { p_country_code?: string; p_limit?: number }
        Returns: Json
      }
      get_popular_brands: {
        Args: { limit_count?: number }
        Returns: {
          brand_name: string
          is_verified: boolean
          product_count: number
        }[]
      }
      get_price_suggestions: {
        Args: {
          p_brand?: string
          p_category_id: string
          p_condition?: Database["public"]["Enums"]["product_condition"]
          p_size?: string
        }
        Returns: Json
      }
      get_product_metrics: {
        Args: { p_product_id: string }
        Returns: Json
      }
      get_product_suggestions: {
        Args: { for_product_id: string; limit_count?: number }
        Returns: {
          id: string
          images: string[]
          price: number
          title: string
        }[]
      }
      get_product_with_seller: {
        Args: { product_id_param: string }
        Returns: {
          brand: string
          condition: Database["public"]["Enums"]["product_condition"]
          created_at: string
          description: string
          id: string
          image_urls: string[]
          is_favorited: boolean
          price: number
          seller_avatar_url: string
          seller_id: string
          seller_rating: number
          seller_sales_count: number
          seller_username: string
          size: string
          title: string
        }[]
      }
      get_products_by_category_name_across_genders: {
        Args:
          | { category_name: string; country_code?: string }
          | { category_name_input: string }
        Returns: {
          category_id: string
        }[]
      }
      get_products_in_category_tree: {
        Args: { category_id: string }
        Returns: {
          created_at: string
          id: string
          price: number
          title: string
        }[]
      }
      get_user_conversations_secure: {
        Args: { conv_limit?: number }
        Returns: {
          created_at: string
          id: string
          last_message_at: string
          last_message_content: string
          other_participant: Json
          participant_one_id: string
          participant_two_id: string
          status: string
          unread_count_p1: number
          unread_count_p2: number
          updated_at: string
        }[]
      }
      get_virtual_category_counts: {
        Args: Record<PropertyKey, never>
        Returns: {
          product_count: number
          virtual_type: string
        }[]
      }
      increment_favorite_count: {
        Args: { product_uuid: string }
        Returns: undefined
      }
      increment_product_view: {
        Args: { product_id_param: string }
        Returns: undefined
      }
      is_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
      is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          action_details?: Json
          action_name: string
          target_id?: string
          target_type: string
        }
        Returns: string
      }
      mark_conversation_read_secure: {
        Args: { other_user_id: string }
        Returns: boolean
      }
      mark_message_delivered: {
        Args: { p_message_id: string }
        Returns: undefined
      }
      mark_messages_as_read: {
        Args: { p_product_id?: string; p_sender_id: string }
        Returns: number
      }
      process_sale: {
        Args: { p_commission_rate?: number; p_order_id: string }
        Returns: Json
      }
      product_slug_base_secure: {
        Args: { product_title: string }
        Returns: string
      }
      queue_slug_generation: {
        Args: { p_product_id: string }
        Returns: undefined
      }
      reject_drip_product: {
        Args: {
          admin_id_param: string
          admin_notes_param?: string
          product_id_param: string
          rejection_reason_param: string
        }
        Returns: boolean
      }
      reset_monthly_boost_credits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      search_categories: {
        Args: { limit_count?: number; search_term: string }
        Returns: {
          id: string
          level: number
          name: string
          parent_id: string
        }[]
      }
      search_products_secure: {
        Args:
          | {
              p_category_id?: string
              p_country_code?: string
              p_limit?: number
              p_max_price?: number
              p_min_price?: number
              search_query: string
            }
          | {
              p_category_id?: string
              p_country_code?: string
              p_limit?: number
              p_max_price?: number
              p_min_price?: number
              search_query?: string
            }
        Returns: {
          brand: string
          category_name: string
          condition: string
          created_at: string
          description: string
          id: string
          image_urls: string[]
          is_promoted: boolean
          price: number
          seller_avatar: string
          seller_username: string
          size: string
          title: string
        }[]
      }
      slugify: {
        Args: { input_text: string }
        Returns: string
      }
      track_product_view: {
        Args: {
          p_ip_address?: unknown
          p_product_id: string
          p_user_agent?: string
          p_user_id?: string
        }
        Returns: boolean
      }
      track_profile_view: {
        Args: {
          p_profile_id: string
          p_session_id?: string
          p_viewer_id?: string
        }
        Returns: undefined
      }
      update_last_active: {
        Args: { user_id: string }
        Returns: undefined
      }
      update_user_presence: {
        Args: { p_status: string; p_typing_in?: string }
        Returns: undefined
      }
      validate_discount_code: {
        Args: {
          p_amount: number
          p_code: string
          p_plan_type: string
          p_user_id: string
        }
        Returns: Json
      }
    }
    Enums: {
      message_status: "sent" | "delivered" | "read"
      order_status:
        | "pending"
        | "paid"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "disputed"
        | "failed"
        | "completed"
      product_condition:
        | "brand_new_with_tags"
        | "new_without_tags"
        | "like_new"
        | "good"
        | "worn"
        | "fair"
      user_role: "buyer" | "seller" | "admin"
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
      message_status: ["sent", "delivered", "read"],
      order_status: [
        "pending",
        "paid",
        "shipped",
        "delivered",
        "cancelled",
        "disputed",
        "failed",
        "completed",
      ],
      product_condition: [
        "brand_new_with_tags",
        "new_without_tags",
        "like_new",
        "good",
        "worn",
        "fair",
      ],
      user_role: ["buyer", "seller", "admin"],
    },
  },
} as const