export interface ProductSearchOptions {
  limit: number;
  offset?: number;
  country_code?: string;
  category_ids?: string[];
  min_price?: number;
  max_price?: number;
  conditions?: string[];
  brands?: string[];
  sizes?: string[];
  sort?: {
    by: 'created_at' | 'price' | 'popularity' | 'relevance';
    direction: 'asc' | 'desc';
  };
}

export interface ProductSearchResult {
  data?: unknown[];
  total?: number;
  error?: unknown;
}

export class ProductDomainAdapter {
  constructor(private supabase: any) {}

  async resolveCategorySegments(segments: string[]): Promise<{ success: boolean; data: string[] }> {
    try {
      // TODO: Implement category segment resolution
      // This should resolve category hierarchy segments to category IDs
      console.log('Resolving category segments:', segments);
      return { success: true, data: [] };
    } catch (error) {
      console.error('Error resolving category segments:', error);
      return { success: false, data: [] };
    }
  }

  async searchProductsWithFilters(query: string, options: ProductSearchOptions): Promise<ProductSearchResult> {
    try {
      // Implement product search with filters using Supabase query builder
      // This supports array filters which the RPC might not support yet

      const {
        limit = 20,
        offset = 0,
        country_code,
        category_ids,
        min_price,
        max_price,
        conditions,
        brands,
        sizes,
        sort
      } = options;

      // DEBUG: Phase 1 - Log adapter search start
      console.log('[ProductDomainAdapter] searchProductsWithFilters called:', {
        query,
        limit,
        offset,
        country_code,
        category_ids,
        min_price,
        max_price,
        conditions,
        brands,
        sizes,
        sort
      });

      // Select products with related data: categories, profiles (via seller_id), and images
      let q = this.supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug,
            level,
            parent_id
          ),
          profiles:profiles!products_seller_id_fkey (
            username,
            avatar_url,
            location
          ),
          product_images (
            image_url,
            sort_order
          )
        `, { count: 'exact' })
        .eq('status', 'active')
        .eq('is_active', true);

      if (query) {
        // Simple ILIKE search for now, can be upgraded to full text search later
        q = q.ilike('title', `%${query}%`);
      }

      if (country_code) {
        q = q.eq('country_code', country_code);
      }

      if (category_ids?.length) {
        q = q.in('category_id', category_ids);
      }

      if (min_price !== undefined) {
        q = q.gte('price', min_price);
      }

      if (max_price !== undefined) {
        q = q.lte('price', max_price);
      }

      if (conditions?.length) {
        q = q.in('condition', conditions);
      }

      if (brands?.length) {
        q = q.in('brand', brands);
      }

      if (sizes?.length) {
        q = q.in('size', sizes);
      }

      if (sort) {
        q = q.order(sort.by, { ascending: sort.direction === 'asc' });
      } else {
        // Default sort
        q = q.order('created_at', { ascending: false });
      }

      q = q.range(offset, offset + limit - 1);

      const { data, error, count } = await q;

      // DEBUG: Phase 1 - Log query results
      console.log('[ProductDomainAdapter] Query result:', {
        hasData: !!data,
        dataLength: data?.length,
        hasError: !!error,
        error: error?.message || error,
        count,
        firstProductSample: data?.[0] ? {
          id: data[0].id,
          title: data[0].title,
          status: data[0].status,
          hasCategories: !!data[0].categories,
          hasProfiles: !!data[0].profiles,
          productImagesCount: data[0].product_images?.length
        } : null
      });

      if (error) {
        console.error('Error searching products:', error);
        return { error };
      }

      return {
        data: data || [],
        total: count || 0
      };
    } catch (error) {
      console.error('Error searching products:', error);
      return {
        error: 'Search failed'
      };
    }
  }

  async getProducts(options: { filters?: any; limit?: number; offset?: number; sort?: ProductSearchOptions['sort'] }): Promise<{ data: unknown[] | null; error?: any }> {
    try {
      const { filters = {}, limit = 10, offset = 0, sort } = options;

      // Build query parameters with related data
      let query = this.supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug,
            level,
            parent_id
          ),
          profiles:profiles!products_seller_id_fkey (
            username,
            avatar_url,
            location
          ),
          product_images (
            image_url,
            sort_order
          )
        `, { count: 'exact' })
        .eq('status', 'active')
        .eq('is_active', true);

      // Apply filters
      if (filters.category_ids?.length) {
        query = query.in('category_id', filters.category_ids);
      }
      if (filters.country_code) {
        query = query.eq('country_code', filters.country_code);
      }
      if (filters.min_price !== undefined) {
        query = query.gte('price', filters.min_price);
      }
      if (filters.max_price !== undefined) {
        query = query.lte('price', filters.max_price);
      }
      if (filters.conditions?.length) {
        query = query.in('condition', filters.conditions);
      }
      if (filters.brands?.length) {
        query = query.in('brand', filters.brands);
      }

      // Apply sorting
      if (sort) {
        query = query.order(sort.by, { ascending: sort.direction === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching products:', error);
        return { data: null, error };
      }

      return { data };
    } catch (error) {
      console.error('Error getting products:', error);
      return {
        data: null,
        error
      };
    }
  }

  async getProduct(productId: string): Promise<{ data: unknown; error?: any }> {
    try {
      // TODO: Implement single product fetching
      console.log('Getting product by ID:', productId);
      return {
        data: null
      };
    } catch (error) {
      console.error('Error getting product:', error);
      return {
        data: null,
        error
      };
    }
  }

  async getProductById(productId: string): Promise<{ data: unknown; error?: any }> {
    return this.getProduct(productId);
  }

  async getProductsByIds(productIds: string[]): Promise<{ data: unknown[]; error?: any }> {
    try {
      // TODO: Implement multiple products fetching
      console.log('Getting products by IDs:', productIds);
      return {
        data: []
      };
    } catch (error) {
      console.error('Error getting products:', error);
      return {
        data: [],
        error
      };
    }
  }

  async getProductsByCategory(categoryId: string, options?: Partial<ProductSearchOptions>): Promise<ProductSearchResult> {
    try {
      const { limit = 20, offset = 0, sort } = options || {};

      let query = this.supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug,
            level,
            parent_id
          ),
          profiles:profiles!products_seller_id_fkey (
            username,
            avatar_url,
            location
          ),
          product_images (
            image_url,
            sort_order
          )
        `, { count: 'exact' })
        .eq('status', 'active')
        .eq('is_active', true)
        .eq('category_id', categoryId);

      // Apply sorting
      if (sort) {
        query = query.order(sort.by, { ascending: sort.direction === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching products by category:', error);
        return { error };
      }

      return {
        data: data || [],
        total: count || 0
      };
    } catch (error) {
      console.error('Error getting products by category:', error);
      return {
        error: 'Category fetch failed'
      };
    }
  }

  async getPopularProducts(limit: number = 10): Promise<{ data: unknown[]; error?: any }> {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug,
            level
          ),
          profiles:profiles!products_seller_id_fkey (
            username,
            avatar_url,
            location
          ),
          product_images (
            image_url,
            sort_order
          )
        `)
        .eq('status', 'active')
        .eq('is_active', true)
        .order('view_count', { ascending: false, nullsFirst: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching popular products:', error);
        return { data: [], error };
      }

      return { data: data || [] };
    } catch (error) {
      console.error('Error getting popular products:', error);
      return {
        data: [],
        error
      };
    }
  }

  async getFeaturedProducts(limit: number = 10): Promise<{ data: unknown[]; error?: any }> {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug,
            level
          ),
          profiles:profiles!products_seller_id_fkey (
            username,
            avatar_url,
            location
          ),
          product_images (
            image_url,
            sort_order
          )
        `)
        .eq('status', 'active')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching featured products:', error);
        return { data: [], error };
      }

      return { data: data || [] };
    } catch (error) {
      console.error('Error getting featured products:', error);
      return {
        data: [],
        error
      };
    }
  }

  async getNewProducts(limit: number = 10): Promise<{ data: unknown[]; error?: any }> {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug,
            level
          ),
          profiles:profiles!products_seller_id_fkey (
            username,
            avatar_url,
            location
          ),
          product_images (
            image_url,
            sort_order
          )
        `)
        .eq('status', 'active')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching new products:', error);
        return { data: [], error };
      }

      return { data: data || [] };
    } catch (error) {
      console.error('Error getting new products:', error);
      return {
        data: [],
        error
      };
    }
  }

  async getRelatedProducts(productId: string, limit: number = 5): Promise<{ data: unknown[]; error?: any }> {
    try {
      // First get the product to find its category
      const { data: product, error: productError } = await this.supabase
        .from('products')
        .select('category_id, seller_id')
        .eq('id', productId)
        .single();

      if (productError || !product) {
        return { data: [] };
      }

      // Find related products in same category, excluding the current product
      const { data, error } = await this.supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug,
            level
          ),
          profiles:profiles!products_seller_id_fkey (
            username,
            avatar_url,
            location
          ),
          product_images (
            image_url,
            sort_order
          )
        `)
        .eq('status', 'active')
        .eq('is_active', true)
        .eq('category_id', product.category_id)
        .neq('id', productId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching related products:', error);
        return { data: [], error };
      }

      return { data: data || [] };
    } catch (error) {
      console.error('Error getting related products:', error);
      return {
        data: [],
        error
      };
    }
  }

  async getSellerProducts(sellerId: string, options?: { limit?: number; sort?: ProductSearchOptions['sort'] }): Promise<{ data: unknown[]; error?: any }> {
    try {
      const { limit = 10, sort } = options || {};

      // Build query with related data
      let query = this.supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug,
            level
          ),
          profiles:profiles!products_seller_id_fkey (
            username,
            avatar_url,
            location
          ),
          product_images (
            image_url,
            sort_order
          )
        `)
        .eq('seller_id', sellerId)
        .eq('status', 'active')
        .eq('is_active', true);

      // Apply sorting
      if (sort) {
        query = query.order(sort.by, { ascending: sort.direction === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Apply limit
      query = query.limit(limit);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching seller products:', error);
        return { data: [], error };
      }

      return { data: data || [] };
    } catch (error) {
      console.error('Error getting seller products:', error);
      return {
        data: [],
        error
      };
    }
  }
}
