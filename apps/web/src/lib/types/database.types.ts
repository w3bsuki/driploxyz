// Generated database types - will be replaced with actual Supabase generated types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          location: string | null;
          phone: string | null;
          date_of_birth: string | null;
          role: 'buyer' | 'seller' | 'admin';
          is_verified: boolean;
          rating: number;
          review_count: number;
          sales_count: number;
          purchases_count: number;
          last_active_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          location?: string | null;
          phone?: string | null;
          date_of_birth?: string | null;
          role?: 'buyer' | 'seller' | 'admin';
          is_verified?: boolean;
          rating?: number;
          review_count?: number;
          sales_count?: number;
          purchases_count?: number;
          last_active_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          location?: string | null;
          phone?: string | null;
          date_of_birth?: string | null;
          role?: 'buyer' | 'seller' | 'admin';
          is_verified?: boolean;
          rating?: number;
          review_count?: number;
          sales_count?: number;
          purchases_count?: number;
          last_active_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          parent_id: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          parent_id?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          image_url?: string | null;
          parent_id?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          seller_id: string;
          category_id: string | null;
          title: string;
          description: string;
          price: number;
          brand: string | null;
          size: string | null;
          condition: 'new' | 'like-new' | 'good' | 'fair';
          color: string | null;
          material: string | null;
          tags: string[] | null;
          is_active: boolean;
          is_sold: boolean;
          is_featured: boolean;
          view_count: number;
          favorite_count: number;
          location: string | null;
          shipping_cost: number;
          created_at: string;
          updated_at: string;
          sold_at: string | null;
        };
        Insert: {
          id?: string;
          seller_id: string;
          category_id?: string | null;
          title: string;
          description: string;
          price: number;
          brand?: string | null;
          size?: string | null;
          condition: 'new' | 'like-new' | 'good' | 'fair';
          color?: string | null;
          material?: string | null;
          tags?: string[] | null;
          is_active?: boolean;
          is_sold?: boolean;
          is_featured?: boolean;
          view_count?: number;
          favorite_count?: number;
          location?: string | null;
          shipping_cost?: number;
          created_at?: string;
          updated_at?: string;
          sold_at?: string | null;
        };
        Update: {
          id?: string;
          seller_id?: string;
          category_id?: string | null;
          title?: string;
          description?: string;
          price?: number;
          brand?: string | null;
          size?: string | null;
          condition?: 'new' | 'like-new' | 'good' | 'fair';
          color?: string | null;
          material?: string | null;
          tags?: string[] | null;
          is_active?: boolean;
          is_sold?: boolean;
          is_featured?: boolean;
          view_count?: number;
          favorite_count?: number;
          location?: string | null;
          shipping_cost?: number;
          created_at?: string;
          updated_at?: string;
          sold_at?: string | null;
        };
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          image_url: string;
          alt_text: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          image_url: string;
          alt_text?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          image_url?: string;
          alt_text?: string | null;
          sort_order?: number;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          buyer_id: string;
          seller_id: string;
          product_id: string;
          status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'disputed';
          total_amount: number;
          shipping_cost: number;
          tax_amount: number;
          shipping_address: any | null;
          tracking_number: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
          shipped_at: string | null;
          delivered_at: string | null;
        };
        Insert: {
          id?: string;
          buyer_id: string;
          seller_id: string;
          product_id: string;
          status?: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'disputed';
          total_amount: number;
          shipping_cost?: number;
          tax_amount?: number;
          shipping_address?: any | null;
          tracking_number?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          shipped_at?: string | null;
          delivered_at?: string | null;
        };
        Update: {
          id?: string;
          buyer_id?: string;
          seller_id?: string;
          product_id?: string;
          status?: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'disputed';
          total_amount?: number;
          shipping_cost?: number;
          tax_amount?: number;
          shipping_address?: any | null;
          tracking_number?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          shipped_at?: string | null;
          delivered_at?: string | null;
        };
      };
      messages: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          product_id: string | null;
          order_id: string | null;
          content: string;
          image_urls: string[] | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id: string;
          product_id?: string | null;
          order_id?: string | null;
          content: string;
          image_urls?: string[] | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          sender_id?: string;
          receiver_id?: string;
          product_id?: string | null;
          order_id?: string | null;
          content?: string;
          image_urls?: string[] | null;
          is_read?: boolean;
          created_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          reviewer_id: string;
          reviewee_id: string;
          product_id: string | null;
          order_id: string | null;
          rating: number;
          title: string | null;
          comment: string | null;
          image_urls: string[] | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reviewer_id: string;
          reviewee_id: string;
          product_id?: string | null;
          order_id?: string | null;
          rating: number;
          title?: string | null;
          comment?: string | null;
          image_urls?: string[] | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          reviewer_id?: string;
          reviewee_id?: string;
          product_id?: string | null;
          order_id?: string | null;
          rating?: number;
          title?: string | null;
          comment?: string | null;
          image_urls?: string[] | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      product_condition: 'new' | 'like-new' | 'good' | 'fair';
      order_status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'disputed';
      user_role: 'buyer' | 'seller' | 'admin';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}