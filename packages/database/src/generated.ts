// Basic database types for now - will be auto-generated later
export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          title: string
          price: number
          seller_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          price: number
          seller_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          price?: number
          seller_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]
export type CompositeTypes<T extends keyof Database['public']['CompositeTypes']> = Database['public']['CompositeTypes'][T]

// Legacy exports for existing code
export type Product = Tables<'products'>['Row']
export type Transaction = { id: string; amount: number; status: string }
export type Order = { id: string; product_id: string; buyer_id: string }