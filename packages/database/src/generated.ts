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
          account_type: string | null
          avatar_url: string | null
          bio: string | null
          brand_status: string | null
          created_at: string | null
          date_of_birth: string | null
          full_name: string | null
          id: string
          is_verified: boolean | null
          last_active_at: string | null
          location: string | null
          onboarding_completed: boolean | null
          payout_method: Json | null
          phone: string | null
          premium_boosts_remaining: number | null
          purchases_count: number | null
          rating: number | null
          review_count: number | null
          role: Database["public"]["Enums"]["user_role"] | null
          sales_count: number | null
          social_links: Json | null
          subscription_tier: string | null
          updated_at: string | null
          username: string
          verified: boolean | null
        }
        Insert: {
          account_type?: string | null
          avatar_url?: string | null
          bio?: string | null
          brand_status?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          full_name?: string | null
          id: string
          is_verified?: boolean | null
          last_active_at?: string | null
          location?: string | null
          onboarding_completed?: boolean | null
          payout_method?: Json | null
          phone?: string | null
          premium_boosts_remaining?: number | null
          purchases_count?: number | null
          rating?: number | null
          review_count?: number | null
          role?: Database["public"]["Enums"]["user_role"] | null
          sales_count?: number | null
          social_links?: Json | null
          subscription_tier?: string | null
          updated_at?: string | null
          username: string
          verified?: boolean | null
        }
        Update: {
          account_type?: string | null
          avatar_url?: string | null
          bio?: string | null
          brand_status?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          full_name?: string | null
          id?: string
          is_verified?: boolean | null
          last_active_at?: string | null
          location?: string | null
          onboarding_completed?: boolean | null
          payout_method?: Json | null
          phone?: string | null
          premium_boosts_remaining?: number | null
          purchases_count?: number | null
          rating?: number | null
          review_count?: number | null
          role?: Database["public"]["Enums"]["user_role"] | null
          sales_count?: number | null
          social_links?: Json | null
          subscription_tier?: string | null
          updated_at?: string | null
          username?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          description: string | null
          features: Json
          id: string
          is_active: boolean | null
          max_listings: number | null
          name: string
          premium_boost_credits: number | null
          price_monthly: number
          price_yearly: number | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean | null
          max_listings?: number | null
          name: string
          premium_boost_credits?: number | null
          price_monthly: number
          price_yearly?: number | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean | null
          max_listings?: number | null
          name?: string
          premium_boost_credits?: number | null
          price_monthly?: number
          price_yearly?: number | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string | null
          id: string
          image_url: string
          product_id: string
          sort_order: number | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          id?: string
          image_url: string
          product_id: string
          sort_order?: number | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
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
      transactions: {
        Row: {
          order_id: string
          seller_id: string
          buyer_id: string
          product_id: string
          product_price: number
          shipping_cost: number
          total_amount: number
          commission_rate: number
          commission_amount: number
          seller_amount: number
          stripe_payment_intent_id: string | null
          payment_status: string
          processed_at: string | null
          created_at: string | null
          id: string
        }
        Insert: {
          order_id: string
          seller_id: string
          buyer_id: string
          product_id: string
          product_price: number
          shipping_cost: number
          total_amount: number
          commission_rate: number
          commission_amount: number
          seller_amount: number
          stripe_payment_intent_id?: string | null
          payment_status: string
          processed_at?: string | null
          created_at?: string | null
          id?: string
        }
        Update: {
          order_id?: string
          seller_id?: string
          buyer_id?: string
          product_id?: string
          product_price?: number
          shipping_cost?: number
          total_amount?: number
          commission_rate?: number
          commission_amount?: number
          seller_amount?: number
          stripe_payment_intent_id?: string | null
          payment_status?: string
          processed_at?: string | null
          created_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
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
            foreignKeyName: "transactions_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          seller_id: string
          amount: number
          payout_method: Json
          status: string
          created_at: string | null
          processed_at: string | null
          id: string
        }
        Insert: {
          seller_id: string
          amount: number
          payout_method: Json
          status: string
          created_at?: string | null
          processed_at?: string | null
          id?: string
        }
        Update: {
          seller_id?: string
          amount?: number
          payout_method?: Json
          status?: string
          created_at?: string | null
          processed_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payouts_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          user_id: string
          type: string
          title: string
          message: string
          related_id: string | null
          related_table: string | null
          is_read: boolean | null
          created_at: string | null
          id: string
        }
        Insert: {
          user_id: string
          type: string
          title: string
          message: string
          related_id?: string | null
          related_table?: string | null
          is_read?: boolean | null
          created_at?: string | null
          id?: string
        }
        Update: {
          user_id?: string
          type?: string
          title?: string
          message?: string
          related_id?: string | null
          related_table?: string | null
          is_read?: boolean | null
          created_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_notifications: {
        Row: {
          user_id: string
          type: string
          title: string
          message: string
          related_id: string | null
          related_table: string | null
          is_read: boolean | null
          created_at: string | null
          id: string
        }
        Insert: {
          user_id: string
          type: string
          title: string
          message: string
          related_id?: string | null
          related_table?: string | null
          is_read?: boolean | null
          created_at?: string | null
          id?: string
        }
        Update: {
          user_id?: string
          type?: string
          title?: string
          message?: string
          related_id?: string | null
          related_table?: string | null
          is_read?: boolean | null
          created_at?: string | null
          id?: string
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
      product_boosts: {
        Row: {
          product_id: string
          boost_type: string
          expires_at: string
          created_at: string | null
          id: string
        }
        Insert: {
          product_id: string
          boost_type: string
          expires_at: string
          created_at?: string | null
          id?: string
        }
        Update: {
          product_id?: string
          boost_type?: string
          expires_at?: string
          created_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_boosts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          billing_cycle: string
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string
          current_period_start: string
          id: string
          plan_id: string
          status: string
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          billing_cycle?: string
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end: string
          current_period_start?: string
          id?: string
          plan_id: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          billing_cycle?: string
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan_id?: string
          status?: string
          stripe_subscription_id?: string | null
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
          {
            foreignKeyName: "user_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
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
      decrement_premium_boosts: {
        Args: { user_id_param: string }
        Returns: undefined
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
      product_condition: "new" | "like-new" | "good" | "fair"
      user_role: "buyer" | "seller" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never