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
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
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
          last_stats_update?: number | null
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
          description: string
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
          description: string
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
          description?: string
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
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_seller_id_fkey"
            columns: ["seller_id"]
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
          }
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          price: number
          quantity: number
          line_total: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          price: number
          quantity?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          price?: number
          quantity?: number
          created_at?: string | null
          updated_at?: string | null
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
        Relationships: [
          {
            foreignKeyName: "conversations_participant_one_id_fkey"
            columns: ["participant_one_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant_two_id_fkey"
            columns: ["participant_two_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
            foreignKeyName: "messages_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
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
          }
        ]
      }
      transactions: {
        Row: {
          id: string
          buyer_id: string
          seller_id: string
          order_id: string
          product_id: string
          amount: number
          seller_earnings: number
          commission_amount: number
          currency: string
          status: string
          stripe_payment_intent_id: string | null
          payout_status: string | null
          payout_date: string | null
          payout_reference: string | null
          processed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          buyer_id: string
          seller_id: string
          order_id: string
          product_id: string
          amount: number
          seller_earnings: number
          commission_amount: number
          currency?: string
          status: string
          stripe_payment_intent_id?: string | null
          payout_status?: string | null
          payout_date?: string | null
          payout_reference?: string | null
          processed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          buyer_id?: string
          seller_id?: string
          order_id?: string
          product_id?: string
          amount?: number
          seller_earnings?: number
          commission_amount?: number
          currency?: string
          status?: string
          stripe_payment_intent_id?: string | null
          payout_status?: string | null
          payout_date?: string | null
          payout_reference?: string | null
          processed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_type: string
          stripe_subscription_id: string | null
          status: string
          current_period_start: string | null
          current_period_end: string | null
          cancelled_at: string | null
          trial_end: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_type: string
          stripe_subscription_id?: string | null
          status: string
          current_period_start?: string | null
          current_period_end?: string | null
          cancelled_at?: string | null
          trial_end?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_type?: string
          stripe_subscription_id?: string | null
          status?: string
          current_period_start?: string | null
          current_period_end?: string | null
          cancelled_at?: string | null
          trial_end?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      subscription_plans: {
        Row: {
          id: string
          name: string
          description: string | null
          plan_type: string
          price_monthly: number
          price_yearly: number | null
          features: Json | null
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          plan_type: string
          price_monthly: number
          price_yearly?: number | null
          features?: Json | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          plan_type?: string
          price_monthly?: number
          price_yearly?: number | null
          features?: Json | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          data: Json | null
          is_read: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          data?: Json | null
          is_read?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          data?: Json | null
          is_read?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "username_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      product_slug_history: {
        Row: {
          product_id: string
          old_slug: string
          changed_at: string | null
        }
        Insert: {
          product_id: string
          old_slug: string
          changed_at?: string | null
        }
        Update: {
          product_id?: string
          old_slug?: string
          changed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_slug_history_product_id_fkey"
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
      get_conversation_messages_secure: {
        Args: {
          conversation_id: string
          other_user_id?: string
        }
        Returns: {
          id: string
          conversation_id: string
          sender_id: string
          receiver_id: string
          content: string
          status: string
          read: boolean
          created_at: string
          sender_profile: {
            id: string
            username: string
            full_name: string
            avatar_url: string | null
          }
        }[]
      }
      get_user_conversations_secure: {
        Args: {
          user_id: string
          conv_limit?: number
        }
        Returns: {
          id: string
          participant_one_id: string
          participant_two_id: string
          participant_id: string
          last_message: string
          last_message_at: string
          created_at: string
          other_participant: {
            id: string
            username: string
            full_name: string
            avatar_url: string | null
          }
        }[]
      }
      mark_conversation_read_secure: {
        Args: {
          conversation_id: string
          user_id: string
        }
        Returns: void
      }
      boost_product: {
        Args: {
          p_user_id: string
          p_product_id: string
          p_boost_duration_days?: number
        }
        Returns: Json
      }
      get_virtual_category_counts: {
        Args: Record<PropertyKey, never>
        Returns: {
          virtual_type: string
          product_count: number
        }[]
      }
      expire_old_boosts: {
        Args: Record<PropertyKey, never>
        Returns: void
      }
      reset_monthly_boost_credits: {
        Args: Record<PropertyKey, never>
        Returns: void
      }
    }
    Enums: {
      user_role: "buyer" | "seller" | "admin"
      order_status: "pending" | "paid" | "shipped" | "delivered" | "cancelled" | "disputed" | "failed" | "completed"
      product_condition: "brand_new_with_tags" | "new_without_tags" | "like_new" | "good" | "worn" | "fair"
      message_status: "sent" | "delivered" | "read"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Utility types for clean development
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
export type CompositeTypes<T extends keyof Database['public']['CompositeTypes']> = Database['public']['CompositeTypes'][T]

// Constants for runtime validation
export const USER_ROLES = ['buyer', 'seller', 'admin'] as const
export const ORDER_STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'disputed', 'failed', 'completed'] as const
export const PRODUCT_CONDITIONS = ['brand_new_with_tags', 'new_without_tags', 'like_new', 'good', 'worn', 'fair'] as const
export const MESSAGE_STATUSES = ['sent', 'delivered', 'read'] as const