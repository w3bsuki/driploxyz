import type { SupabaseClient } from '@supabase/supabase-js';

export interface TrendingSearch {
  id: string;
  query: string;
  search_count: number;
  last_searched: string;
}

export interface TrendingProduct {
  id: string;
  title: string;
  view_count: number;
  favorite_count: number;
}

export interface TrendingCategory {
  id: string;
  name: string;
  slug: string;
  product_count: number;
}

export interface TrendingData {
  searches: TrendingSearch[];
  products: TrendingProduct[];
  categories: TrendingCategory[];
}

export async function getTrendingData(supabase: SupabaseClient): Promise<TrendingData> {
  try {
    // Fetch trending searches (most searched terms in last 7 days)
    const { data: searches } = await supabase
      .from('search_history')
      .select('query, count')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('count', { ascending: false })
      .limit(5);

    // Fetch trending products (most viewed/favorited)
    const { data: products } = await supabase
      .from('products')
      .select('id, title, view_count, favorite_count')
      .eq('is_active', true)
      .eq('is_sold', false)
      .order('view_count', { ascending: false })
      .limit(5);

    // Fetch trending categories (most products listed recently)
    const { data: categories } = await supabase
      .from('categories')
      .select(`
        id,
        name,
        slug,
        products(count)
      `)
      .order('products(count)', { ascending: false })
      .limit(5);

    return {
      searches: searches || [],
      products: products || [],
      categories: categories || []
    };
  } catch (error) {
    console.error('Error fetching trending data:', error);
    // Return fallback data if queries fail
    return {
      searches: [],
      products: [],
      categories: []
    };
  }
}

// Get trending searches with fallback
export async function getTrendingSearches(supabase: SupabaseClient): Promise<string[]> {
  try {
    // First try to get real trending searches
    const { data: recentSearches } = await supabase
      .rpc('get_trending_searches', { limit_count: 5 })
      .limit(5);

    if (recentSearches && recentSearches.length > 0) {
      return recentSearches.map((s: any) => s.query);
    }

    // Fallback: Get popular product titles as trending searches
    const { data: popularProducts } = await supabase
      .from('products')
      .select('title, brand')
      .eq('is_active', true)
      .eq('is_sold', false)
      .order('view_count', { ascending: false })
      .limit(3);

    if (popularProducts && popularProducts.length > 0) {
      return popularProducts.map(p => p.brand ? `${p.brand} ${p.title}` : p.title);
    }

    // Final fallback: category-based suggestions
    return ['Vintage Jackets', 'Designer Bags', 'Y2K Jeans'];
  } catch (error) {
    console.error('Error fetching trending searches:', error);
    return ['Vintage Jackets', 'Designer Bags', 'Y2K Jeans'];
  }
}