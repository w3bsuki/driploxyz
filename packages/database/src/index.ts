// Export generated Supabase types
export * from './generated';
import type { Database } from './generated';
export type { Database } from './generated';

// Re-export common type aliases 
export type Tables = Database['public']['Tables'];
export type TablesInsert = Database['public']['Tables'];
export type TablesUpdate = Database['public']['Tables'];
export type Enums = Database['public']['Enums'];
export type CompositeTypes = Database['public']['CompositeTypes'];
export type Json = Database['public']['Tables']['products']['Row']['tags'];

// Common table types
export type Product = Database['public']['Tables']['products']['Row'];
export type ProductInsert = Database['public']['Tables']['products']['Insert'];
export type ProductUpdate = Database['public']['Tables']['products']['Update'];

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Category = Database['public']['Tables']['categories']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
export type ProductImage = Database['public']['Tables']['product_images']['Row'];

// Custom composite types
export interface ProductWithImages extends Product {
  product_images?: ProductImage[];
  images?: string[];
  category?: Category;
}