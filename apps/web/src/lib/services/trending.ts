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
    // Get trending searches from popular product titles and brands
    const { data: popularProducts } = await supabase
      .from('products')
      .select('title, brand')
      .eq('is_active', true)
      .eq('is_sold', false)
      .order('view_count', { ascending: false })
      .limit(5);

    const searches = (popularProducts || []).map((p: any, index: number) => ({
      id: crypto.randomUUID(),
      query: p.brand || p.title,
      search_count: 100 - (index * 10), // Fake counts for now
      last_searched: new Date().toISOString()
    }));

    // Fetch trending products (most viewed/favorited)
    const { data: products } = await supabase
      .from('products')
      .select('id, title, view_count, favorite_count')
      .eq('is_active', true)
      .eq('is_sold', false)
      .order('view_count', { ascending: false })
      .limit(5);

    // Fetch trending categories - simple count
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('is_active', true)
      .limit(5);

    return {
      searches,
      products: products || [],
      categories: (categories || []).map((c: any, index: number) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        product_count: 50 - (index * 5) // Fake counts for now
      }))
    };
  } catch (error) {
    console.error('Error fetching trending data:', error);
    // Return fallback data if queries fail
    return {
      searches: [] as TrendingSearch[],
      products: [] as TrendingProduct[],
      categories: [] as TrendingCategory[]
    };
  }
}

// Get trending searches with fallback
export async function getTrendingSearches(supabase: SupabaseClient): Promise<string[]> {
  try {
    // Get popular product titles as trending searches
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