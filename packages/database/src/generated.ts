export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_notifications: {
        Row: {
          id: string
          type: string
          title: string
          message: string
          data: Json | null
          priority: string
          country_code: string | null
          user_id: string | null
          is_read: boolean | null
          action_url: string | null
          action_label: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          type: string
          title: string
          message: string
          data?: Json | null
          priority?: string
          country_code?: string | null
          user_id?: string | null
          is_read?: boolean | null
          action_url?: string | null
          action_label?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          type?: string
          title?: string
          message?: string
          data?: Json | null
          priority?: string
          country_code?: string | null
          user_id?: string | null
          is_read?: boolean | null
          action_url?: string | null
          action_label?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          location: string | null
          phone: string | null
          date_of_birth: string | null
          role: "buyer" | "seller" | "admin" | null
          rating: number | null
          review_count: number | null
          sales_count: number | null
          purchases_count: number | null
          last_active_at: string | null
          created_at: string | null
          updated_at: string | null
          account_type: string | null
          premium_boosts_remaining: number | null
          subscription_tier: string | null
          onboarding_completed: boolean | null
          verified: boolean | null
          brand_status: string | null
          payout_method: Json | null
          social_links: Json | null
          two_factor_enabled: boolean | null
          last_password_change: string | null
          failed_login_attempts: number | null
          account_locked_until: string | null
          response_time_hours: number | null
          avg_shipping_hours: number | null
          weekly_sales_count: number | null
          on_time_shipping_rate: number | null
          monthly_views: number | null
          followers_count: number | null
          following_count: number | null
          last_stats_update: string | null
          total_sales_value: number | null
          current_balance: number | null
          total_withdrawn: number | null
          payout_settings: Json | null
          verification_status: string | null
          verification_documents: Json | null
          seller_metrics: Json | null
          last_payout_at: string | null
          subscription_expires_at: string | null
          grace_period_ends_at: string | null
          country_code: string | null
          region: string | null
          currency: string | null
          total_reviews: number | null
          total_sales: number | null
          rating_breakdown: Json | null
          boost_credits_used_this_month: number | null
          last_boost_reset_date: string | null
          total_boosts_used: number | null
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          phone?: string | null
          date_of_birth?: string | null
          role?: "buyer" | "seller" | "admin" | null
          rating?: number | null
          review_count?: number | null
          sales_count?: number | null
          purchases_count?: number | null
          last_active_at?: string | null
          created_at?: string | null
          updated_at?: string | null
          account_type?: string | null
          premium_boosts_remaining?: number | null
          subscription_tier?: string | null
          onboarding_completed?: boolean | null
          verified?: boolean | null
          brand_status?: string | null
          payout_method?: Json | null
          social_links?: Json | null
          two_factor_enabled?: boolean | null
          last_password_change?: string | null
          failed_login_attempts?: number | null
          account_locked_until?: string | null
          response_time_hours?: number | null
          avg_shipping_hours?: number | null
          weekly_sales_count?: number | null
          on_time_shipping_rate?: number | null
          monthly_views?: number | null
          followers_count?: number | null
          following_count?: number | null
          last_stats_update?: string | null
          total_sales_value?: number | null
          current_balance?: number | null
          total_withdrawn?: number | null
          payout_settings?: Json | null
          verification_status?: string | null
          verification_documents?: Json | null
          seller_metrics?: Json | null
          last_payout_at?: string | null
          subscription_expires_at?: string | null
          grace_period_ends_at?: string | null
          country_code?: string | null
          region?: string | null
          currency?: string | null
          total_reviews?: number | null
          total_sales?: number | null
          rating_breakdown?: Json | null
          boost_credits_used_this_month?: number | null
          last_boost_reset_date?: string | null
          total_boosts_used?: number | null
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          phone?: string | null
          date_of_birth?: string | null
          role?: "buyer" | "seller" | "admin" | null
          rating?: number | null
          review_count?: number | null
          sales_count?: number | null
          purchases_count?: number | null
          last_active_at?: string | null
          created_at?: string | null
          updated_at?: string | null
          account_type?: string | null
          premium_boosts_remaining?: number | null
          subscription_tier?: string | null
          onboarding_completed?: boolean | null
          verified?: boolean | null
          brand_status?: string | null
          payout_method?: Json | null
          social_links?: Json | null
          two_factor_enabled?: boolean | null
          last_password_change?: string | null
          failed_login_attempts?: number | null
          account_locked_until?: string | null
          response_time_hours?: number | null
          avg_shipping_hours?: number | null
          weekly_sales_count?: number | null
          on_time_shipping_rate?: number | null
          monthly_views?: number | null
          followers_count?: number | null
          following_count?: number | null
          last_stats_update?: string | null
          total_sales_value?: number | null
          current_balance?: number | null
          total_withdrawn?: number | null
          payout_settings?: Json | null
          verification_status?: string | null
          verification_documents?: Json | null
          seller_metrics?: Json | null
          last_payout_at?: string | null
          subscription_expires_at?: string | null
          grace_period_ends_at?: string | null
          country_code?: string | null
          region?: string | null
          currency?: string | null
          total_reviews?: number | null
          total_sales?: number | null
          rating_breakdown?: Json | null
          boost_credits_used_this_month?: number | null
          last_boost_reset_date?: string | null
          total_boosts_used?: number | null
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          seller_id: string
          category_id: string
          title: string
          description: string | null
          price: number
          brand: string | null
          size: string | null
          condition: "brand_new_with_tags" | "new_without_tags" | "like_new" | "good" | "worn" | "fair"
          color: string | null
          material: string | null
          tags: string[] | null
          is_active: boolean | null
          is_sold: boolean | null
          is_featured: boolean | null
          view_count: number | null
          favorite_count: number
          location: string | null
          shipping_cost: number | null
          created_at: string | null
          updated_at: string | null
          sold_at: string | null
          is_boosted: boolean | null
          boosted_until: string | null
          boost_type: string | null
          commission_rate: number | null
          net_earnings: number | null
          platform_fee: number | null
          auto_archive_after_days: number | null
          archived_at: string | null
          status: string | null
          country_code: string | null
          region: string | null
          search_vector: unknown | null
          slug: string | null
          slug_locked: boolean | null
          is_drip_candidate: boolean | null
          drip_status: string | null
          drip_nominated_at: string | null
          drip_approved_at: string | null
          drip_rejected_at: string | null
          drip_nominated_by: string | null
          drip_reviewed_by: string | null
          drip_rejection_reason: string | null
          drip_quality_score: number | null
          drip_admin_notes: string | null
          boost_history_id: string | null
          boost_priority: number | null
          brand_collection_id: string | null
          custom_subcategory: string | null
        }
        Insert: {
          id?: string
          seller_id: string
          category_id: string
          title: string
          description?: string | null
          price: number
          brand?: string | null
          size?: string | null
          condition: "brand_new_with_tags" | "new_without_tags" | "like_new" | "good" | "worn" | "fair"
          color?: string | null
          material?: string | null
          tags?: string[] | null
          is_active?: boolean | null
          is_sold?: boolean | null
          is_featured?: boolean | null
          view_count?: number | null
          favorite_count?: number
          location?: string | null
          shipping_cost?: number | null
          created_at?: string | null
          updated_at?: string | null
          sold_at?: string | null
          is_boosted?: boolean | null
          boosted_until?: string | null
          boost_type?: string | null
          commission_rate?: number | null
          net_earnings?: number | null
          platform_fee?: number | null
          auto_archive_after_days?: number | null
          archived_at?: string | null
          status?: string | null
          country_code?: string | null
          region?: string | null
          search_vector?: unknown | null
          slug?: string | null
          slug_locked?: boolean | null
          is_drip_candidate?: boolean | null
          drip_status?: string | null
          drip_nominated_at?: string | null
          drip_approved_at?: string | null
          drip_rejected_at?: string | null
          drip_nominated_by?: string | null
          drip_reviewed_by?: string | null
          drip_rejection_reason?: string | null
          drip_quality_score?: number | null
          drip_admin_notes?: string | null
          boost_history_id?: string | null
          boost_priority?: number | null
          brand_collection_id?: string | null
          custom_subcategory?: string | null
        }
        Update: {
          id?: string
          seller_id?: string
          category_id?: string
          title?: string
          description?: string | null
          price?: number
          brand?: string | null
          size?: string | null
          condition?: "brand_new_with_tags" | "new_without_tags" | "like_new" | "good" | "worn" | "fair"
          color?: string | null
          material?: string | null
          tags?: string[] | null
          is_active?: boolean | null
          is_sold?: boolean | null
          is_featured?: boolean | null
          view_count?: number | null
          favorite_count?: number
          location?: string | null
          shipping_cost?: number | null
          created_at?: string | null
          updated_at?: string | null
          sold_at?: string | null
          is_boosted?: boolean | null
          boosted_until?: string | null
          boost_type?: string | null
          commission_rate?: number | null
          net_earnings?: number | null
          platform_fee?: number | null
          auto_archive_after_days?: number | null
          archived_at?: string | null
          status?: string | null
          country_code?: string | null
          region?: string | null
          search_vector?: unknown | null
          slug?: string | null
          slug_locked?: boolean | null
          is_drip_candidate?: boolean | null
          drip_status?: string | null
          drip_nominated_at?: string | null
          drip_approved_at?: string | null
          drip_rejected_at?: string | null
          drip_nominated_by?: string | null
          drip_reviewed_by?: string | null
          drip_rejection_reason?: string | null
          drip_quality_score?: number | null
          drip_admin_notes?: string | null
          boost_history_id?: string | null
          boost_priority?: number | null
          brand_collection_id?: string | null
          custom_subcategory?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      user_payments: {
        Row: {
          id: string
          user_id: string
          stripe_payment_intent_id: string
          amount: number
          currency: string
          status: string
          plan_type: string | null
          metadata: Json | null
          created_at: string | null
          completed_at: string | null
          failed_at: string | null
          refunded_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          stripe_payment_intent_id: string
          amount: number
          currency?: string
          status?: string
          plan_type?: string | null
          metadata?: Json | null
          created_at?: string | null
          completed_at?: string | null
          failed_at?: string | null
          refunded_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          stripe_payment_intent_id?: string
          amount?: number
          currency?: string
          status?: string
          plan_type?: string | null
          metadata?: Json | null
          created_at?: string | null
          completed_at?: string | null
          failed_at?: string | null
          refunded_at?: string | null
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          stripe_subscription_id: string | null
          stripe_customer_id: string | null
          status: string
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          trial_end: string | null
          discount_percent: number | null
          discount_code: string | null
          amount_paid: number | null
          currency: string | null
          payment_method: Json | null
          metadata: Json | null
          created_at: string | null
          updated_at: string | null
          auto_renewal: boolean | null
          grace_period_days: number | null
          renewal_reminder_sent: boolean | null
          expiry_warning_sent: boolean | null
          subscription_source: string | null
          original_price: number | null
          final_price: number | null
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          status?: string
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          trial_end?: string | null
          discount_percent?: number | null
          discount_code?: string | null
          amount_paid?: number | null
          currency?: string | null
          payment_method?: Json | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
          auto_renewal?: boolean | null
          grace_period_days?: number | null
          renewal_reminder_sent?: boolean | null
          expiry_warning_sent?: boolean | null
          subscription_source?: string | null
          original_price?: number | null
          final_price?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          status?: string
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          trial_end?: string | null
          discount_percent?: number | null
          discount_code?: string | null
          amount_paid?: number | null
          currency?: string | null
          payment_method?: Json | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
          auto_renewal?: boolean | null
          grace_period_days?: number | null
          renewal_reminder_sent?: boolean | null
          expiry_warning_sent?: boolean | null
          subscription_source?: string | null
          original_price?: number | null
          final_price?: number | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          price: number
          quantity: number | null
          size: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          price: number
          quantity?: number | null
          size?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          price?: number
          quantity?: number | null
          size?: string | null
          created_at?: string | null
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
          }
        ]
      }
      boost_history: {
        Row: {
          id: string
          user_id: string
          product_id: string
          boost_type: string
          credits_used: number
          boosted_at: string | null
          expires_at: string
          status: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          boost_type?: string
          credits_used?: number
          boosted_at?: string | null
          expires_at: string
          status?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          boost_type?: string
          credits_used?: number
          boosted_at?: string | null
          expires_at?: string
          status?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "boost_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boost_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      brand_collections: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          description: string | null
          collection_type: string
          is_featured: boolean
          sort_order: number
          product_count: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          logo_url?: string | null
          description?: string | null
          collection_type: string
          is_featured?: boolean
          sort_order?: number
          product_count?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          description?: string | null
          collection_type?: string
          is_featured?: boolean
          sort_order?: number
          product_count?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      bundle_sessions: {
        Row: {
          id: string
          buyer_id: string
          seller_id: string
          product_ids: string[]
          expires_at: string
          completed: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          buyer_id: string
          seller_id: string
          product_ids: string[]
          expires_at?: string
          completed?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          buyer_id?: string
          seller_id?: string
          product_ids?: string[]
          expires_at?: string
          completed?: boolean | null
          created_at?: string | null
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
          }
        ]
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          parent_id: string | null
          sort_order: number | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
          level: number | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          sort_order?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          level?: number | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          sort_order?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          level?: number | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          id: string
          participant_one_id: string
          participant_two_id: string
          product_id: string | null
          order_id: string | null
          last_message_at: string | null
          last_message_content: string | null
          unread_count_p1: number | null
          unread_count_p2: number | null
          status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          participant_one_id: string
          participant_two_id: string
          product_id?: string | null
          order_id?: string | null
          last_message_at?: string | null
          last_message_content?: string | null
          unread_count_p1?: number | null
          unread_count_p2?: number | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          participant_one_id?: string
          participant_two_id?: string
          product_id?: string | null
          order_id?: string | null
          last_message_at?: string | null
          last_message_content?: string | null
          unread_count_p1?: number | null
          unread_count_p2?: number | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          buyer_id: string
          seller_id: string
          product_id: string
          status: "pending" | "paid" | "shipped" | "delivered" | "cancelled" | "disputed" | "failed" | "completed" | null
          total_amount: number
          shipping_cost: number | null
          tax_amount: number | null
          shipping_address: Json | null
          tracking_number: string | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
          shipped_at: string | null
          delivered_at: string | null
          commission_rate: number | null
          platform_fee: number | null
          seller_net_amount: number | null
          currency: string | null
          payment_method: string | null
          completion_notes: string | null
          cancelled_reason: string | null
          cancelled_at: string | null
          refund_amount: number | null
          refund_reason: string | null
          refunded_at: string | null
          country_code: string | null
          service_fee: number | null
          archived: boolean | null
          archived_at: string | null
          buyer_rated: boolean | null
          seller_rated: boolean | null
          rating_reminder_sent: boolean | null
          items_count: number | null
          bundle_discount: number | null
          is_bundle: boolean | null
        }
        Insert: {
          id?: string
          buyer_id: string
          seller_id: string
          product_id: string
          status?: "pending" | "paid" | "shipped" | "delivered" | "cancelled" | "disputed" | "failed" | "completed" | null
          total_amount: number
          shipping_cost?: number | null
          tax_amount?: number | null
          shipping_address?: Json | null
          tracking_number?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          commission_rate?: number | null
          platform_fee?: number | null
          seller_net_amount?: number | null
          currency?: string | null
          payment_method?: string | null
          completion_notes?: string | null
          cancelled_reason?: string | null
          cancelled_at?: string | null
          refund_amount?: number | null
          refund_reason?: string | null
          refunded_at?: string | null
          country_code?: string | null
          service_fee?: number | null
          archived?: boolean | null
          archived_at?: string | null
          buyer_rated?: boolean | null
          seller_rated?: boolean | null
          rating_reminder_sent?: boolean | null
          items_count?: number | null
          bundle_discount?: number | null
          is_bundle?: boolean | null
        }
        Update: {
          id?: string
          buyer_id?: string
          seller_id?: string
          product_id?: string
          status?: "pending" | "paid" | "shipped" | "delivered" | "cancelled" | "disputed" | "failed" | "completed" | null
          total_amount?: number
          shipping_cost?: number | null
          tax_amount?: number | null
          shipping_address?: Json | null
          tracking_number?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          commission_rate?: number | null
          platform_fee?: number | null
          seller_net_amount?: number | null
          currency?: string | null
          payment_method?: string | null
          completion_notes?: string | null
          cancelled_reason?: string | null
          cancelled_at?: string | null
          refund_amount?: number | null
          refund_reason?: string | null
          refunded_at?: string | null
          country_code?: string | null
          service_fee?: number | null
          archived?: boolean | null
          archived_at?: string | null
          buyer_rated?: boolean | null
          seller_rated?: boolean | null
          rating_reminder_sent?: boolean | null
          items_count?: number | null
          bundle_discount?: number | null
          is_bundle?: boolean | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          created_at?: string | null
        }
        Relationships: []
      }
      followers: {
        Row: {
          id: string
          follower_id: string | null
          following_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          follower_id?: string | null
          following_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          follower_id?: string | null
          following_id?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          product_id: string | null
          order_id: string | null
          content: string
          image_urls: string[] | null
          is_read: boolean | null
          created_at: string | null
          country_code: string | null
          status: "sent" | "delivered" | "read" | null
          delivered_at: string | null
          read_at: string | null
          message_type: string | null
          conversation_id: string | null
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          product_id?: string | null
          order_id?: string | null
          content: string
          image_urls?: string[] | null
          is_read?: boolean | null
          created_at?: string | null
          country_code?: string | null
          status?: "sent" | "delivered" | "read" | null
          delivered_at?: string | null
          read_at?: string | null
          message_type?: string | null
          conversation_id?: string | null
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          product_id?: string | null
          order_id?: string | null
          content?: string
          image_urls?: string[] | null
          is_read?: boolean | null
          created_at?: string | null
          country_code?: string | null
          status?: "sent" | "delivered" | "read" | null
          delivered_at?: string | null
          read_at?: string | null
          message_type?: string | null
          conversation_id?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          id: string
          reviewer_id: string
          reviewee_id: string
          product_id: string | null
          order_id: string | null
          rating: number
          title: string | null
          comment: string | null
          image_urls: string[] | null
          is_public: boolean | null
          created_at: string | null
          updated_at: string | null
          country_code: string | null
          communication_rating: number | null
          shipping_rating: number | null
          product_quality_rating: number | null
          is_verified_purchase: boolean | null
          helpful_count: number | null
        }
        Insert: {
          id?: string
          reviewer_id: string
          reviewee_id: string
          product_id?: string | null
          order_id?: string | null
          rating: number
          title?: string | null
          comment?: string | null
          image_urls?: string[] | null
          is_public?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          country_code?: string | null
          communication_rating?: number | null
          shipping_rating?: number | null
          product_quality_rating?: number | null
          is_verified_purchase?: boolean | null
          helpful_count?: number | null
        }
        Update: {
          id?: string
          reviewer_id?: string
          reviewee_id?: string
          product_id?: string | null
          order_id?: string | null
          rating?: number
          title?: string | null
          comment?: string | null
          image_urls?: string[] | null
          is_public?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          country_code?: string | null
          communication_rating?: number | null
          shipping_rating?: number | null
          product_quality_rating?: number | null
          is_verified_purchase?: boolean | null
          helpful_count?: number | null
        }
        Relationships: []
      }
      username_history: {
        Row: {
          user_id: string
          old_username: string
          changed_at: string | null
        }
        Insert: {
          user_id: string
          old_username: string
          changed_at?: string | null
        }
        Update: {
          user_id?: string
          old_username?: string
          changed_at?: string | null
        }
        Relationships: []
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          image_url: string
          alt_text: string | null
          sort_order: number | null
          created_at: string | null
          display_order: number | null
        }
        Insert: {
          id?: string
          product_id: string
          image_url: string
          alt_text?: string | null
          sort_order?: number | null
          created_at?: string | null
          display_order?: number | null
        }
        Update: {
          id?: string
          product_id?: string
          image_url?: string
          alt_text?: string | null
          sort_order?: number | null
          created_at?: string | null
          display_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"])
  ? (Database["public"]["Tables"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"])[TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"])
  ? (Database["public"]["Tables"])[PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"])[TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"])
  ? (Database["public"]["Tables"])[PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof (Database["public"]["Enums"])
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicEnumNameOrOptions["schema"]]["Enums"])
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicEnumNameOrOptions["schema"]]["Enums"])[EnumName]
  : PublicEnumNameOrOptions extends keyof (Database["public"]["Enums"])
  ? (Database["public"]["Enums"])[PublicEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof Database["public"]["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof Database["public"]["CompositeTypes"]
  ? Database["public"]["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export type Constants<
  PublicConstantNameOrOptions extends
    | keyof Database["public"]
    | { schema: keyof Database },
  ConstantName extends PublicConstantNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicConstantNameOrOptions["schema"]]
    : never = never
> = PublicConstantNameOrOptions extends { schema: keyof Database }
  ? Database[PublicConstantNameOrOptions["schema"]][ConstantName]
  : PublicConstantNameOrOptions extends keyof Database["public"]
  ? Database["public"][PublicConstantNameOrOptions]
  : never