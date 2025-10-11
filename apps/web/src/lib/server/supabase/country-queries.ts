import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';
import type { CountryCode } from '$lib/country/detection';

/**
 * Helper functions for country-filtered Supabase queries
 * All queries automatically filter by the user's country
 */

// Get products for a specific country
export async function getProductsByCountry(
  supabase: SupabaseClient<Database>,
  country: CountryCode,
  limit: number = 20,
  offset: number = 0
) {
  return supabase
    .from('products')
    .select(`
      *,
      seller:profiles!products_seller_id_fkey (
        id,
        username,
        avatar_url,
        rating,
        is_verified
      ),
      product_images (
        id,
        image_url,
        display_order
      )
    `)
    .eq('country_code', country)
    .eq('is_active', true)
    .eq('is_sold', false)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
}

// Get featured products for country
export async function getFeaturedProductsByCountry(
  supabase: SupabaseClient<Database>,
  country: CountryCode,
  limit: number = 8
) {
  return supabase
    .from('products')
    .select(`
      *,
      seller:profiles!products_seller_id_fkey (
        id,
        username,
        avatar_url,
        rating,
        is_verified
      ),
      product_images (
        id,
        image_url,
        display_order
      )
    `)
    .eq('country_code', country)
    .eq('is_active', true)
    .eq('is_sold', false)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(limit);
}

// Search products in country
export async function searchProductsByCountry(
  supabase: SupabaseClient<Database>,
  country: CountryCode,
  searchTerm: string,
  filters?: {
    category_id?: string;
    min_price?: number;
    max_price?: number;
    condition?: string;
    brand?: string;
  }
) {
  let query = supabase
    .from('products')
    .select(`
      *,
      seller:profiles!products_seller_id_fkey (
        id,
        username,
        avatar_url,
        rating,
        is_verified
      ),
      product_images (
        id,
        image_url,
        display_order
      )
    `)
    .eq('country_code', country)
    .eq('is_active', true)
    .eq('is_sold', false);

  // Add search term
  if (searchTerm) {
    query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%`);
  }

  // Add filters
  if (filters?.category_id) {
    query = query.eq('category_id', filters.category_id);
  }
  if (filters?.min_price) {
    query = query.gte('price', filters.min_price);
  }
  if (filters?.max_price) {
    query = query.lte('price', filters.max_price);
  }
  if (filters?.condition) {
    query = query.eq('condition', filters.condition as Database['public']['Tables']['products']['Row']['condition']);
  }
  if (filters?.brand) {
    query = query.eq('brand', filters.brand);
  }

  return query.order('created_at', { ascending: false });
}

// Get sellers in country
export async function getSellersByCountry(
  supabase: SupabaseClient<Database>,
  country: CountryCode,
  limit: number = 20
) {
  return supabase
    .from('profiles')
    .select('*')
    .eq('country_code', country)
    .eq('role', 'seller')
    .order('rating', { ascending: false })
    .limit(limit);
}

// Get orders for country
export async function getOrdersByCountry(
  supabase: SupabaseClient<Database>,
  country: CountryCode,
  userId: string
) {
  return supabase
    .from('orders')
    .select(`
      *,
      product:products (
        title,
        price,
        product_images (
          image_url
        )
      ),
      seller:profiles!orders_seller_id_fkey (
        username,
        avatar_url
      ),
      buyer:profiles!orders_buyer_id_fkey (
        username,
        avatar_url
      )
    `)
    .eq('country_code', country)
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order('created_at', { ascending: false });
}

// Create product in country
export async function createProductInCountry(
  supabase: SupabaseClient<Database>,
  country: CountryCode,
  productData: Database['public']['Tables']['products']['Insert']
) {
  return supabase
    .from('products')
    .insert({
      ...productData,
      country_code: country
    })
    .select()
    .single();
}

// Update user's country
export async function updateUserCountry(
  supabase: SupabaseClient<Database>,
  userId: string,
  country: CountryCode
) {
  return supabase
    .from('profiles')
    .update({ country_code: country })
    .eq('id', userId);
}

// Get country statistics
export async function getCountryStats(
  supabase: SupabaseClient<Database>,
  country: CountryCode
) {
  const [products, sellers, orders] = await Promise.all([
    supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('country_code', country)
      .eq('is_active', true)
      .eq('is_sold', false),
    
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('country_code', country)
      .eq('role', 'seller'),
    
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('country_code', country)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
  ]);

  return {
    totalProducts: products.count || 0,
    totalSellers: sellers.count || 0,
    monthlyOrders: orders.count || 0
  };
}

// Helper to add country filter to any query
export function withCountryFilter<T extends { eq: (column: string, value: string) => T }>(
  query: T,
  country: CountryCode
): T {
  return query.eq('country_code', country);
}