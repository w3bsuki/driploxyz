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
            referencedRelation: "admin_user_subscriptions"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "badges_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "badges_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "seller_performance_metrics"
            referencedColumns: ["user_id"]
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
            referencedRelation: "admin_user_subscriptions"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "balance_history_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "balance_history_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "seller_performance_metrics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "balance_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_user_subscriptions"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "balance_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "balance_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "seller_performance_metrics"
            referencedColumns: ["user_id"]
          },
        ]
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
            referencedRelation: "admin_user_subscriptions"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "brands_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brands_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "seller_performance_metrics"
            referencedColumns: ["user_id"]
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
            referencedRelation: "admin_user_subscriptions"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "seller_performance_metrics"
            referencedColumns: ["user_id"]
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
            referencedRelation: "admin_user_subscriptions"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "followers_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followers_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "seller_performance_metrics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "followers_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "admin_user_subscriptions"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "followers_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followers_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "seller_performance_metrics"
            referencedColumns: ["user_id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          image_urls: string[] | null
          is_read: boolean | null
          order_id: string | null
          product_id: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          image_urls?: string[] | null
          is_read?: boolean | null
          order_id?: string | null
          product_id?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          image_urls?: string[] | null
          is_read?: boolean | null
          order_id?: string | null
          product_id?: string | null
          receiver_id?: string
          sender_id?: string
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
            referencedRelation: "admin_user_subscriptions"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "seller_performance_metrics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "admin_user_subscriptions"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "seller_performance_metrics"
            referencedColumns: ["user_id"]
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
      orders: {
        Row: {
          archived: boolean | null
          archived_at: string | null
          buyer_id: string
          cancelled_at: string | null
          cancelled_reason: string | null
          commission_rate: number | null
          completion_notes: string | null
          country_code: string | null
          created_at: string | null
          currency: string | null
          delivered_at: string | null
          id: string
          notes: string | null
          payment_method: string | null
          platform_fee: number | null
          product_id: string
          refund_amount: number | null
          refund_reason: string | null
          refunded_at: string | null
          seller_id: string
          seller_net_amount: number | null
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
          buyer_id: string
          cancelled_at?: string | null
          cancelled_reason?: string | null
          commission_rate?: number | null
          completion_notes?: string | null
          country_code?: string | null
          created_at?: string | null
          currency?: string | null
          delivered_at?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          platform_fee?: number | null
          product_id: string
          refund_amount?: number | null
          refund_reason?: string | null
          refunded_at?: string | null
          seller_id: string
          seller_net_amount?: number | null
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
          buyer_id?: string
          cancelled_at?: string | null
          cancelled_reason?: string | null
          commission_rate?: number | null
          completion_notes?: string | null
          country_code?: string | null
          created_at?: string | null
          currency?: string | null
          delivered_at?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          platform_fee?: number | null
          product_id?: string
          refund_amount?: number | null
          refund_reason?: string | null
          refunded_at?: string | null
          seller_id?: string
          seller_net_amount?: number | null
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
            referencedRelation: "admin_user_subscriptions"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "seller_performance_metrics"
            referencedColumns: ["user_id"]
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
            referencedRelation: "admin_user_subscriptions"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "seller_performance_metrics"
            referencedColumns: ["user_id"]
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
            referencedRelation: "admin_user_subscriptions"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payout_requests_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payout_requests_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "seller_performance_metrics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payout_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_user_subscriptions"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payout_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payout_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "seller_performance_metrics"
            referencedColumns: ["user_id"]
          },
        ]
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
      products: {
        Row: {
          archived_at: string | null
          auto_archive_after_days: number | null
          boost_type: string | null
          boosted_until: string | null
          brand: string | null
          category_id: string
          color: string | null
          commission_rate: number | null
          condition: Database["public"]["Enums"]["product_condition"]
          country_code: string | null
          created_at: string | null
          description: string
          favorite_count: number | null
          id: string
          is_active: boolean | null
          is_boosted: boolean | null
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
          boost_type?: string | null
          boosted_until?: string | null
          brand?: string | null
          category_id: string
          color?: string | null
          commission_rate?: number | null
          condition: Database["public"]["Enums"]["product_condition"]
          country_code?: string | null
          created_at?: string | null
          description: string
          favorite_count?: number | null
          id?: string
          is_active?: boolean | null
          is_boosted?: boolean | null
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
          boost_type?: string | null
          boosted_until?: string | null
          brand?: string | null
          category_id?: string
          color?: string | null
          commission_rate?: number | null
          condition?: Database["public"]["Enums"]["product_condition"]
          country_code?: string | null
          created_at?: string | null
          description?: string
          favorite_count?: number | null
          id?: string
          is_active?: boolean | null
          is_boosted?: boolean | null
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
          sold_at?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
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
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "admin_user_subscriptions"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "seller_performance_metrics"
            referencedColumns: ["user_id"]
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
          is_verified: boolean | null
          last_active_at: string | null
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
          region: string | null
          response_time_hours: number | null
          review_count: number | null
          role: Database["public"]["Enums"]["user_role"] | null
          sales_count: number | null
          seller_metrics: Json | null
          social_links: Json | null
          subscription_expires_at: string | null
          subscription_tier: string | null
          total_sales_value: number | null
          total_withdrawn: number | null
          two_factor_enabled: boolean | null
          updated_at: string | null
          username: string
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
          is_verified?: boolean | null
          last_active_at?: string | null
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
          region?: string | null
          response_time_hours?: number | null
          review_count?: number | null
          role?: Database["public"]["Enums"]["user_role"] | null
          sales_count?: number | null
          seller_metrics?: Json | null
          social_links?: Json | null
          subscription_expires_at?: string | null
          subscription_tier?: string | null
          total_sales_value?: number | null
          total_withdrawn?: number | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          username: string
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
          is_verified?: boolean | null
          last_active_at?: string | null
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
          region?: string | null
          response_time_hours?: number | null
          review_count?: number | null
          role?: Database["public"]["Enums"]["user_role"] | null
          sales_count?: number | null
          seller_metrics?: Json | null
          social_links?: Json | null
          subscription_expires_at?: string | null
          subscription_tier?: string | null
          total_sales_value?: number | null
          total_withdrawn?: number | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          username?: string
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
          created_at: string | null
          id: string
          image_urls: string[] | null
          is_public: boolean | null
          order_id: string | null
          product_id: string | null
          rating: number
          reviewee_id: string
          reviewer_id: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          image_urls?: string[] | null
          is_public?: boolean | null
          order_id?: string | null
          product_id?: string | null
          rating: number
          reviewee_id: string
          reviewer_id: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          image_urls?: string[] | null
          is_public?: boolean | null
          order_id?: string | null
          product_id?: string | null
          rating?: number
          reviewee_id?: string
          reviewer_id?: string
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
            referencedRelation: "admin_user_subscriptions"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "seller_performance_metrics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "admin_user_subscriptions"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "seller_performance_metrics"
            referencedColumns: ["user_id"]
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
            referencedRelation: "admin_user_subscriptions"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "seller_balances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_balances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "seller_performance_metrics"
            referencedColumns: ["user_id"]
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
    }
    Views: {
      admin_financial_overview: {
        Row: {
          active_subscriptions: number | null
          expiring_soon_count: number | null
          monthly_platform_revenue: number | null
          monthly_seller_earnings: number | null
          monthly_subscription_revenue: number | null
          overdue_payouts_count: number | null
          pending_payouts_amount: number | null
          pending_payouts_count: number | null
          total_available_balance: number | null
          total_pending_balance: number | null
          total_platform_revenue: number | null
          total_seller_earnings: number | null
          total_withdrawn: number | null
        }
        Relationships: []
      }
      admin_payout_dashboard: {
        Row: {
          account_type: string | null
          admin_notes: string | null
          amount: number | null
          available_balance: number | null
          currency: string | null
          days_pending: number | null
          full_name: string | null
          net_amount: number | null
          payout_id: string | null
          payout_method: Json | null
          pending_balance: number | null
          processed_at: string | null
          processed_by_username: string | null
          reference_number: string | null
          rejection_reason: string | null
          requested_at: string | null
          reviewed_at: string | null
          risk_level: string | null
          status: string | null
          total_earned: number | null
          total_withdrawn: number | null
          username: string | null
        }
        Relationships: []
      }
      admin_user_subscriptions: {
        Row: {
          account_type: string | null
          active_listings: number | null
          amount_paid: number | null
          brand_status: string | null
          cancel_at_period_end: boolean | null
          currency: string | null
          current_period_end: string | null
          current_period_start: string | null
          discount_code: string | null
          discount_percent: number | null
          full_name: string | null
          grace_period_ends_at: string | null
          plan_name: string | null
          price_monthly: number | null
          sales_count: number | null
          sold_listings: number | null
          subscription_expires_at: string | null
          subscription_health: string | null
          subscription_id: string | null
          subscription_status: string | null
          subscription_tier: string | null
          total_sales_value: number | null
          user_created_at: string | null
          user_id: string | null
          username: string | null
          verification_status: string | null
        }
        Relationships: []
      }
      seller_performance_metrics: {
        Row: {
          account_type: string | null
          active_listings: number | null
          available_balance: number | null
          avg_rating: number | null
          avg_sale_value: number | null
          last_sale_date: string | null
          sales_last_30_days: number | null
          sell_through_rate: number | null
          sold_listings: number | null
          subscription_tier: string | null
          total_earned: number | null
          total_listings: number | null
          total_revenue: number | null
          total_reviews: number | null
          total_sales: number | null
          total_withdrawn: number | null
          user_id: string | null
          username: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      activate_brand_subscription: {
        Args: { p_discount_code?: string; p_plan_id: string; p_user_id: string }
        Returns: Json
      }
      admin_adjust_balance: {
        Args: { p_amount: number; p_reason: string; p_user_id: string }
        Returns: Json
      }
      admin_approve_payout: {
        Args: { p_admin_id: string; p_notes?: string; p_payout_id: string }
        Returns: Json
      }
      admin_batch_approve_payouts: {
        Args: { p_payout_ids: string[] }
        Returns: Json
      }
      admin_complete_payout: {
        Args: {
          p_admin_id: string
          p_payout_id: string
          p_transaction_reference?: string
        }
        Returns: Json
      }
      admin_get_dashboard_summary: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      admin_get_pending_payouts: {
        Args: Record<PropertyKey, never>
        Returns: {
          amount: number
          available_balance: number
          currency: string
          days_pending: number
          payout_id: string
          payout_method: Json
          requested_at: string
          username: string
        }[]
      }
      admin_get_user_financial_history: {
        Args: { p_username: string }
        Returns: Json
      }
      admin_quick_approve_payout: {
        Args: { p_payout_id: string }
        Returns: Json
      }
      admin_quick_complete_payout: {
        Args: { p_payout_id: string; p_reference?: string }
        Returns: Json
      }
      archive_completed_orders: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      assign_onboarding_badge: {
        Args: { user_id: string }
        Returns: undefined
      }
      calculate_response_time: {
        Args: { p_user_id: string }
        Returns: unknown
      }
      calculate_seller_metrics: {
        Args: { user_uuid: string }
        Returns: Json
      }
      calculate_seller_stats: {
        Args: { seller_uuid: string }
        Returns: {
          avg_rating: number
          response_time: unknown
          total_followers: number
          total_sales: number
        }[]
      }
      can_message_about_product: {
        Args: { product_id: string; sender_id: string }
        Returns: boolean
      }
      can_update_order_status: {
        Args: { new_status: string; order_id: string; user_id: string }
        Returns: boolean
      }
      can_user_create_listing: {
        Args: { user_id: string }
        Returns: boolean
      }
      check_email_exists: {
        Args: { email_to_check: string }
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
      cleanup_old_messages: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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
      create_payout_request: {
        Args: { p_amount: number; p_payout_method: Json; p_user_id: string }
        Returns: Json
      }
      decrement_favorite_count: {
        Args: { product_uuid: string }
        Returns: undefined
      }
      generate_unique_username: {
        Args: { base_username: string }
        Returns: string
      }
      get_archiving_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          archived_orders: number
          eligible_for_archiving: number
          last_archiving_run: string
          total_orders: number
        }[]
      }
      get_conversation_thread: {
        Args: { product_id?: string; user1_id: string; user2_id: string }
        Returns: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          receiver_id: string
          sender_id: string
        }[]
      }
      get_file_extension: {
        Args: { filename: string }
        Returns: string
      }
      get_product_favorite_count: {
        Args: { product_id: string }
        Returns: number
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
      get_seller_analytics: {
        Args: { date_from?: string; date_to?: string; seller_id: string }
        Returns: Json
      }
      get_user_country: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_messages: {
        Args: { p_limit?: number; p_offset?: number; p_user_id: string }
        Returns: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          product_id: string
          receiver_id: string
          sender_id: string
        }[]
      }
      increment_favorite_count: {
        Args: { product_uuid: string }
        Returns: undefined
      }
      increment_product_view: {
        Args: { product_id: string }
        Returns: undefined
      }
      is_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
      is_admin_secure: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_login_attempt: {
        Args: {
          p_email: string
          p_error?: string
          p_ip: unknown
          p_success: boolean
          p_user_agent: string
        }
        Returns: undefined
      }
      process_sale: {
        Args: { p_commission_rate?: number; p_order_id: string }
        Returns: Json
      }
      recalculate_all_seller_stats: {
        Args: { p_seller_id: string }
        Returns: undefined
      }
      search_products: {
        Args: {
          p_category_id?: string
          p_country_code?: string
          p_limit?: number
          p_max_price?: number
          p_min_price?: number
          search_query: string
        }
        Returns: {
          brand: string
          category_id: string
          category_name: string
          category_slug: string
          condition: Database["public"]["Enums"]["product_condition"]
          country_code: string
          created_at: string
          description: string
          id: string
          image_url: string
          location: string
          price: number
          rank: number
          seller_avatar: string
          seller_id: string
          seller_username: string
          size: string
          title: string
        }[]
      }
      track_and_update_product_view: {
        Args:
          | {
              p_product_id: string
              p_session_id?: string
              p_viewer_id?: string
            }
          | { p_product_id: string; p_viewer_id?: string }
        Returns: undefined
      }
      track_product_view: {
        Args:
          | {
              p_product_id: string
              p_session_id?: string
              p_viewer_id?: string
            }
          | { p_product_id: string; p_viewer_id?: string }
        Returns: undefined
      }
      track_profile_view: {
        Args:
          | {
              p_profile_id: string
              p_session_id?: string
              p_viewer_id?: string
            }
          | { p_profile_id: string; p_viewer_id?: string }
        Returns: undefined
      }
      update_last_active: {
        Args: { user_id: string }
        Returns: undefined
      }
      user_owns_resource: {
        Args: { requesting_user_id?: string; resource_user_id: string }
        Returns: boolean
      }
      validate_discount_code: {
        Args:
          | { code: string }
          | {
              p_amount: number
              p_code: string
              p_plan_type: string
              p_user_id: string
            }
          | {
              p_amount: number
              p_code: string
              p_plan_type: string
              p_user_id: string
            }
        Returns: Json
      }
    }
    Enums: {
      order_status:
        | "pending"
        | "paid"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "disputed"
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
      order_status: [
        "pending",
        "paid",
        "shipped",
        "delivered",
        "cancelled",
        "disputed",
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