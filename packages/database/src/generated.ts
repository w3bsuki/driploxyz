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
            referencedRelation: "profiles"
            referencedColumns: ["id"]
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
          created_at: string | null
          data: Json | null
          expires_at: string | null
          id: string
          message: string
          order_id: string | null
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          message: string
          order_id?: string | null
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          message?: string
          order_id?: string | null
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
          buyer_id: string
          created_at: string | null
          delivered_at: string | null
          id: string
          notes: string | null
          product_id: string
          seller_id: string
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
          buyer_id: string
          created_at?: string | null
          delivered_at?: string | null
          id?: string
          notes?: string | null
          product_id: string
          seller_id: string
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
          buyer_id?: string
          created_at?: string | null
          delivered_at?: string | null
          id?: string
          notes?: string | null
          product_id?: string
          seller_id?: string
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
          boost_type: string | null
          boosted_until: string | null
          brand: string | null
          category_id: string | null
          color: string | null
          condition: Database["public"]["Enums"]["product_condition"]
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
          price: number
          seller_id: string
          shipping_cost: number | null
          size: string | null
          sold_at: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          boost_type?: string | null
          boosted_until?: string | null
          brand?: string | null
          category_id?: string | null
          color?: string | null
          condition: Database["public"]["Enums"]["product_condition"]
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
          price: number
          seller_id: string
          shipping_cost?: number | null
          size?: string | null
          sold_at?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          boost_type?: string | null
          boosted_until?: string | null
          brand?: string | null
          category_id?: string | null
          color?: string | null
          condition?: Database["public"]["Enums"]["product_condition"]
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
          price?: number
          seller_id?: string
          shipping_cost?: number | null
          size?: string | null
          sold_at?: string | null
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
          brand_status: string | null
          created_at: string | null
          date_of_birth: string | null
          failed_login_attempts: number | null
          followers_count: number | null
          following_count: number | null
          full_name: string | null
          id: string
          is_verified: boolean | null
          last_active_at: string | null
          last_password_change: string | null
          last_stats_update: string | null
          location: string | null
          monthly_views: number | null
          on_time_shipping_rate: number | null
          onboarding_completed: boolean | null
          payout_method: Json | null
          phone: string | null
          premium_boosts_remaining: number | null
          purchases_count: number | null
          rating: number | null
          response_time_hours: number | null
          review_count: number | null
          role: Database["public"]["Enums"]["user_role"] | null
          sales_count: number | null
          social_links: Json | null
          subscription_tier: string | null
          two_factor_enabled: boolean | null
          updated_at: string | null
          username: string
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
          created_at?: string | null
          date_of_birth?: string | null
          failed_login_attempts?: number | null
          followers_count?: number | null
          following_count?: number | null
          full_name?: string | null
          id: string
          is_verified?: boolean | null
          last_active_at?: string | null
          last_password_change?: string | null
          last_stats_update?: string | null
          location?: string | null
          monthly_views?: number | null
          on_time_shipping_rate?: number | null
          onboarding_completed?: boolean | null
          payout_method?: Json | null
          phone?: string | null
          premium_boosts_remaining?: number | null
          purchases_count?: number | null
          rating?: number | null
          response_time_hours?: number | null
          review_count?: number | null
          role?: Database["public"]["Enums"]["user_role"] | null
          sales_count?: number | null
          social_links?: Json | null
          subscription_tier?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          username: string
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
          created_at?: string | null
          date_of_birth?: string | null
          failed_login_attempts?: number | null
          followers_count?: number | null
          following_count?: number | null
          full_name?: string | null
          id?: string
          is_verified?: boolean | null
          last_active_at?: string | null
          last_password_change?: string | null
          last_stats_update?: string | null
          location?: string | null
          monthly_views?: number | null
          on_time_shipping_rate?: number | null
          onboarding_completed?: boolean | null
          payout_method?: Json | null
          phone?: string | null
          premium_boosts_remaining?: number | null
          purchases_count?: number | null
          rating?: number | null
          response_time_hours?: number | null
          review_count?: number | null
          role?: Database["public"]["Enums"]["user_role"] | null
          sales_count?: number | null
          social_links?: Json | null
          subscription_tier?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          username?: string
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
          payout_date: string | null
          payout_reference: string | null
          payout_status: string | null
          seller_earnings: number
          seller_id: string
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
          payout_date?: string | null
          payout_reference?: string | null
          payout_status?: string | null
          seller_earnings?: number
          seller_id: string
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
          payout_date?: string | null
          payout_reference?: string | null
          payout_status?: string | null
          seller_earnings?: number
          seller_id?: string
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
      user_subscriptions: {
        Row: {
          amount_paid: number | null
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created_at: string | null
          currency: string | null
          current_period_end: string | null
          current_period_start: string | null
          discount_code: string | null
          discount_percent: number | null
          id: string
          metadata: Json | null
          payment_method: Json | null
          plan_id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_paid?: number | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string | null
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          discount_code?: string | null
          discount_percent?: number | null
          id?: string
          metadata?: Json | null
          payment_method?: Json | null
          plan_id: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_paid?: number | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string | null
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          discount_code?: string | null
          discount_percent?: number | null
          id?: string
          metadata?: Json | null
          payment_method?: Json | null
          plan_id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
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
      [_ in never]: never
    }
    Functions: {
      assign_onboarding_badge: {
        Args: { user_id: string }
        Returns: undefined
      }
      calculate_response_time: {
        Args: { p_user_id: string }
        Returns: unknown
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
      decrement_favorite_count: {
        Args: { product_uuid: string }
        Returns: undefined
      }
      generate_unique_username: {
        Args: { base_username: string }
        Returns: string
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
      recalculate_all_seller_stats: {
        Args: { p_seller_id: string }
        Returns: undefined
      }
      search_products: {
        Args: {
          category_filter?: string
          max_price?: number
          min_price?: number
          search_query: string
        }
        Returns: {
          category_id: string
          created_at: string
          description: string
          id: string
          images: string[]
          price: number
          seller_id: string
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
      validate_discount_code: {
        Args:
          | { code: string }
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