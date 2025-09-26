import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';
import { parseError, withRetry, ErrorType } from '$lib/utils/error-handling.svelte';
import { createLogger } from '$lib/utils/log';

type Product = Database['public']['Tables']['products']['Row'];
type ProductInsert = Database['public']['Tables']['products']['Insert'];
type ProductUpdate = Database['public']['Tables']['products']['Update'];
type ProductImage = Database['public']['Tables']['product_images']['Row'];

// Type for raw product data from Supabase with joined relations
interface ProductWithJoinedData extends Product {
  product_images: ProductImage[] | null;
  categories: { name: string | null } | null;
  profiles: { username: string | null; rating: number | null; avatar_url: string | null } | null;
}

type RawProductWithJoinedData = Product & {
  product_images?: ProductImage[] | null;
  categories?: { name: string | null } | null;
  profiles?: { username: string | null; rating: number | null; avatar_url: string | null } | null;
};

export interface ProductWithImages extends Product {
  images: ProductImage[];
  category_name?: string;
  seller_name?: string;
  seller_username?: string;
  seller_rating?: number;
}

export interface ProductFilters {
  category_ids?: string[];
  min_price?: number;
  max_price?: number;
  conditions?: string[]; // TODO: Fix when product_condition enum exists in database
  sizes?: string[];
  brands?: string[];
  location?: string;
  seller_id?: string;
  search?: string;
  country_code?: string;
}

export interface HierarchicalProductFilters {
  category_id?: string; // Single category for hierarchical filtering
  include_descendants?: boolean; // Include subcategories (default: true)
  min_price?: number;
  max_price?: number;
  conditions?: string[]; // TODO: Fix when product_condition enum exists in database
  sizes?: string[];
  brands?: string[];
  location?: string;
  seller_id?: string;
  search?: string;
  country_code?: string;
}

export interface ProductSort {
  by: 'created_at' | 'price' | 'popularity' | 'relevance';
  direction: 'asc' | 'desc';
}

export interface ProductListOptions {
  filters?: ProductFilters;
  sort?: ProductSort;
  limit?: number;
  offset?: number;
  cursor?: string; // For cursor-based pagination
}

export interface PaginatedProductResult {
  data: ProductWithImages[];
  error: string | null;
  total?: number;
  nextCursor?: string;
  hasMore: boolean;
}

export class ProductService {
  private log = createLogger('ProductService');

  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Handle service errors with consistent formatting
   */
  private handleError(error: unknown, context?: string): { data: null; error: string } {
    const errorDetails = parseError(error, {
      service: 'ProductService',
      context
    });

    this.log.error(`ProductService error: ${context || 'Unknown operation'}`, errorDetails);

    return {
      data: null,
      error: errorDetails.userMessage
    };
  }

  /**
   * Execute database operations with retry logic
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: string,
    retries: number = 2
  ): Promise<T> {
    try {
      return await withRetry(operation, { maxAttempts: retries }, ErrorType.SERVER);
    } catch (error) {
      const message = `Retry failed: ${context}`;
      const details = error instanceof Error ? { error: error.message } : undefined;
      this.log.warn(message, details);
      throw error;
    }
  }

  /**
   * Get a single product by ID with images and related data
   */
  async getProduct(id: string): Promise<{ data: ProductWithImages | null; error: string | null }> {
    if (!id?.trim()) {
      return { data: null, error: 'Product ID is required' };
    }

    try {
      const result = await this.executeWithRetry(async () => {
        return await this.supabase
          .from('products')
          .select(`
            *,
            product_images!product_id (id, image_url, alt_text, display_order, created_at, product_id, sort_order),
            categories!category_id (name),
            profiles!seller_id (username, rating, avatar_url)
          `)
          .eq('id', id)
          .eq('is_active', true)
          .single();
      }, `getProduct(${id})`);

      const { data, error } = result;

      if (error) {
        // Handle specific error types
        if (error.code === 'PGRST116' || error.message.includes('not found')) {
          return { data: null, error: 'Product not found' };
        }

        return this.handleError(error, `getProduct(${id})`);
      }

      if (!data) {
        return { data: null, error: 'Product not found' };
      }

      // Transform the data - handle potential SelectQueryError
      const product: ProductWithImages = {
        ...data,
        images: Array.isArray(data.product_images) ? data.product_images : [],
        category_name: (data.categories && typeof data.categories === 'object' && 'name' in data.categories) ? data.categories.name : undefined,
        seller_name: (data.profiles && typeof data.profiles === 'object' && 'username' in data.profiles) ? (data.profiles.username ?? undefined) : undefined,
        seller_username: (data.profiles && typeof data.profiles === 'object' && 'username' in data.profiles) ? (data.profiles.username ?? undefined) : undefined,
        seller_rating: (data.profiles && typeof data.profiles === 'object' && 'rating' in data.profiles) ? data.profiles.rating ?? undefined : undefined
      };

      // Increment view count
      await this.incrementViewCount();

      return { data: product, error: null };
    } catch {
      return { data: null, error: 'Failed to fetch product' };
    }
  }

  /**
   * Get products with filtering, sorting and enhanced pagination (cursor-based)
   */
  async getProducts(options: ProductListOptions = {}): Promise<PaginatedProductResult> {
    try {
      let query = this.supabase
        .from('products')
        .select(`
          *,
          favorite_count,
          product_images!product_id (
            id, image_url, alt_text, display_order, created_at, product_id, sort_order
          ),
          categories!category_id (name),
          profiles!seller_id (username, rating, avatar_url)
        `, { count: 'exact' })
        .eq('is_active', true)
        .eq('is_sold', false);

      // Apply filters
      if (options.filters) {
        const { filters } = options;
        
        // CRITICAL: Filter by country FIRST for performance
        if (filters.country_code) {
          query = query.eq('country_code', filters.country_code);
        }
        
        if (filters.category_ids?.length) {
          query = query.in('category_id', filters.category_ids);
        }
        
        if (filters.min_price !== undefined) {
          query = query.gte('price', filters.min_price);
        }
        
        if (filters.max_price !== undefined) {
          query = query.lte('price', filters.max_price);
        }
        
        if (filters.conditions?.length) {
          query = query.in('condition', filters.conditions as ("brand_new_with_tags" | "new_without_tags" | "like_new" | "good" | "worn" | "fair")[]);
        }
        
        if (filters.sizes?.length) {
          query = query.in('size', filters.sizes);
        }
        
        if (filters.brands?.length) {
          query = query.in('brand', filters.brands);
        }
        
        if (filters.location) {
          query = query.ilike('location', `%${filters.location}%`);
        }
        
        if (filters.seller_id) {
          query = query.eq('seller_id', filters.seller_id);
        }
        
        if (filters.search) {
          query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,brand.ilike.%${filters.search}%`);
        }
      }

      // Apply sorting
      if (options.sort) {
        const { by, direction } = options.sort;
        if (by === 'popularity') {
          query = query.order('favorite_count', { ascending: direction === 'asc' });
        } else {
          query = query.order(by, { ascending: direction === 'asc' });
        }
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination - prefer cursor-based for better performance
      if (options.cursor) {
        try {
          // Decode cursor to get timestamp and ID
          const [timestamp, id] = Buffer.from(options.cursor, 'base64').toString().split(':');

          // For cursor-based pagination, we need to use appropriate ordering
          if (options.sort?.by === 'created_at' || !options.sort) {
            query = query
              .or(`created_at.lt.${timestamp},and(created_at.eq.${timestamp},id.lt.${id})`)
              .limit(options.limit || 20);
          } else {
            // Fallback to offset-based for complex sorting
            const offset = options.offset || 0;
            query = query.range(offset, offset + (options.limit || 20) - 1);
          }
        } catch {
          // Invalid cursor, fallback to offset-based
          const offset = options.offset || 0;
          query = query.range(offset, offset + (options.limit || 20) - 1);
        }
      } else {
        // Offset-based pagination (first page or fallback)
        if (options.limit) {
          query = query.limit(options.limit);
        }
        if (options.offset) {
          query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
        }
      }

      const { data, error, count } = await query;

      if (error) {
        return { data: [], error: error.message, hasMore: false };
      }

      // Transform the data - handle potential SelectQueryError
      const products: ProductWithImages[] = (data || []).map(item => ({
        ...item,
        images: Array.isArray(item.product_images) ? item.product_images : [],
        category_name: (item.categories && typeof item.categories === 'object' && 'name' in item.categories) ? item.categories.name : undefined,
        seller_name: (item.profiles && typeof item.profiles === 'object' && 'username' in item.profiles) ? (item.profiles.username ?? undefined) : undefined,
        seller_rating: (item.profiles && typeof item.profiles === 'object' && 'rating' in item.profiles) ? (item.profiles.rating || undefined) : undefined
      }));

      // Generate next cursor for pagination
      const requestedLimit = options.limit || 20;
      const hasMore = products.length === requestedLimit;
      let nextCursor: string | undefined;

      if (hasMore && products.length > 0) {
        const lastProduct = products[products.length - 1];
        if (lastProduct && lastProduct.created_at && lastProduct.id) {
          nextCursor = Buffer.from(
            `${lastProduct.created_at}:${lastProduct.id}`
          ).toString('base64');
        }
      }

      return {
        data: products,
        error: null,
        total: count || 0,
        nextCursor,
        hasMore
      };
    } catch {
      return { data: [], error: 'Failed to fetch products', hasMore: false };
    }
  }

  /**
   * Create a new product
   */
  async createProduct(
    product: Omit<ProductInsert, 'id' | 'created_at' | 'updated_at'>,
    imageUrls: string[] = []
  ): Promise<{ data: Product | null; error: string | null }> {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .insert(product)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      // Add images if provided
      if (imageUrls.length > 0 && data) {
        await this.addProductImages(data.id, imageUrls);
      }

      return { data, error: null };
    } catch {
      return { data: null, error: 'Failed to create product' };
    }
  }

  /**
   * Update a product
   */
  async updateProduct(
    id: string,
    updates: ProductUpdate,
    userId: string
  ): Promise<{ data: Product | null; error: string | null }> {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .eq('seller_id', userId)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch {
      return { data: null, error: 'Failed to update product' };
    }
  }

  /**
   * Get promoted products for homepage highlights
   */
  async getPromotedProducts(limit: number = 10): Promise<{ 
    data: ProductWithImages[]; 
    error: string | null;
  }> {
    try {
      // Skip premium boost query - premium features not yet implemented
      const boostedProducts: ProductWithJoinedData[] = [];

      // Get featured products (fallback since no boosted products exist)
      const { data: manuallyPromoted, error: manualError } = await this.supabase
        .from('products')
        .select(`
          *,
          product_images!product_id (id, image_url, alt_text, display_order, created_at, product_id, sort_order),
          categories!category_id (name),
          profiles!seller_id (username, rating, avatar_url)
        `)
        .eq('is_active', true)
        .eq('is_sold', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (manualError) {
        throw new Error('Failed to fetch promoted products');
      }

      // Combine and deduplicate products
      const manualProducts = this.normalizeProducts(manuallyPromoted as RawProductWithJoinedData[]);

      const allPromoted: ProductWithJoinedData[] = [
        ...boostedProducts,
        ...manualProducts
      ];
      
      // Remove duplicates based on product ID
      const uniqueProducts = allPromoted.reduce((acc: ProductWithJoinedData[], product) => {
        if (!acc.find((p) => p.id === product.id)) {
          acc.push(product);
        }
        return acc;
      }, [] as ProductWithJoinedData[]);

      let limitedProducts = uniqueProducts.slice(0, limit);

      // If we don't have enough promoted products, fill with newest listings
      if (limitedProducts.length < limit) {
        const remainingLimit = limit - limitedProducts.length;
        
        // Get newest products to fill the highlights
        const { data: newestProducts, error: newestError } = await this.supabase
          .from('products')
          .select(`
            *,
            product_images (id, image_url, alt_text, display_order, created_at, product_id, sort_order),
            categories (name),
            profiles!seller_id (username, rating, avatar_url)
          `)
          .eq('is_active', true)
          .eq('is_sold', false)
          .order('created_at', { ascending: false })
          .limit(remainingLimit);

        if (newestError) {
          // Error getting newest products, continue with promoted only
        } else {
          // Add newest products that aren't already in promoted list
          const promotedIds = new Set(limitedProducts.map((p) => p.id));
          const newestNormalized = this.normalizeProducts(newestProducts as RawProductWithJoinedData[]);
          const filteredNewest = newestNormalized.filter((p) => promotedIds.has(p.id) === false);
          limitedProducts = [...limitedProducts, ...filteredNewest];
        }
      }

      if (!limitedProducts || limitedProducts.length === 0) {
        return { data: [], error: null };
      }

      // Transform the data
      const products: ProductWithImages[] = limitedProducts.map((item): ProductWithImages => {
        const { product_images, categories, profiles, ...productData } = item;
        const normalizedImages = product_images ?? [];
        const sellerProfile = profiles ?? null;
        const productFields: Product = productData;

        return {
          ...productFields,
          images: normalizedImages,
          category_name: categories?.name ?? undefined,
          seller_name: sellerProfile?.username ?? undefined,
          seller_username: sellerProfile?.username ?? undefined,
          seller_rating: sellerProfile?.rating ?? undefined
        };
      });

      return { data: products, error: null };
    } catch {
      return { data: [], error: 'Failed to fetch promoted products' };
    }
  }

  private normalizeProducts(records: RawProductWithJoinedData[] | null): ProductWithJoinedData[] {
    if (records == null || records.length === 0) {
      return [];
    }

    return records.map((item): ProductWithJoinedData => {
      const { product_images, categories, profiles, ...productFields } = item;

      return {
        ...(productFields as Product),
        product_images: product_images ?? [],
        categories: categories ?? null,
        profiles: profiles ?? null
      };
    });
  }

  /**
   * Delete a product (soft delete)
   */
  async deleteProduct(id: string, userId: string): Promise<{ error: string | null }> {
    try {
      const { error } = await this.supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', id)
        .eq('seller_id', userId);

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch {
      return { error: 'Failed to delete product' };
    }
  }

  /**
   * Add images to a product
   */
  async addProductImages(productId: string, imageUrls: string[]): Promise<{ error: string | null }> {
    try {
      const images = imageUrls.map((url, index) => ({
        product_id: productId,
        image_url: url,
        display_order: index
      }));

      const { error } = await this.supabase
        .from('product_images')
        .insert(images);

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch {
      return { error: 'Failed to add product images' };
    }
  }

  /**
   * Remove product images
   */
  async removeProductImages(productId: string, imageIds: string[]): Promise<{ error: string | null }> {
    try {
      const { error } = await this.supabase
        .from('product_images')
        .delete()
        .eq('product_id', productId)
        .in('id', imageIds);

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch {
      return { error: 'Failed to remove product images' };
    }
  }

  /**
   * Increment product view count
   */
  private async incrementViewCount(/* id: string */): Promise<void> {
    try {
      // TODO: Implement when increment_product_view RPC function is available in database
      // await this.supabase.rpc('increment_product_view', { product_id_param: id });
    } catch {
      // Ignore view count increment errors
    }
  }

  /**
   * Get products by seller
   */
  async getSellerProducts(
    sellerId: string,
    options: Omit<ProductListOptions, 'filters'> & { includeInactive?: boolean } = {}
  ): Promise<{ data: ProductWithImages[]; error: string | null }> {
    const filters: ProductFilters = { seller_id: sellerId };
    const productOptions: ProductListOptions = {
      ...options,
      filters
    };

    return this.getProducts(productOptions);
  }

  /**
   * Search products using full-text search
   */
  async searchProducts(
    query: string,
    options: Omit<ProductListOptions, 'filters'> = {}
  ): Promise<{ data: ProductWithImages[]; error: string | null }> {
    try {
      // Use the search function from the database
      const { data, error } = await this.supabase
        .from('products')
        .select(`
          *,
          product_images(*),
          profiles!products_seller_id_fkey(username, avatar_url, rating, full_name),
          categories(name, slug)
        `)
        .ilike('title', `%${query}%`)
        .eq('is_active', true)
        .eq('is_sold', false)
        .order('created_at', { ascending: false })
        .limit(options.limit || 20);

      if (error) {
        return { data: [], error: error.message };
      }

      // Transform the data to match our interface
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const products: ProductWithImages[] = (data || []).map((item: any) => {
        // Handle joined data properly
        const images = Array.isArray(item.product_images) ? item.product_images : [];
        const profiles = item.profiles || null;
        const categories = item.categories || null;

        return {
          // Copy all product fields directly
          ...item,
          // Override specific joined fields
          images,
          category_name: categories?.name || undefined,
          seller_username: profiles?.username || undefined,
          seller_name: profiles?.full_name || profiles?.username || undefined,
          seller_rating: profiles?.rating || undefined
        } as ProductWithImages;
      });

      return { data: products, error: null };
    } catch {
      return { data: [], error: 'Failed to search products' };
    }
  }

  // ===== NEW HIERARCHICAL METHODS =====

  /**
   * Get products using hierarchical category filtering with cursor-based pagination
   * Supports filtering by category and its descendants automatically
   */
  async getHierarchicalProducts(
    filters: HierarchicalProductFilters = {},
    sort?: ProductSort,
    limit?: number,
    offset?: number,
    cursor?: string
  ): Promise<PaginatedProductResult> {
    try {
      let query = this.supabase
        .from('products')
        .select(`
          *,
          favorite_count,
          product_images!product_id (
            id, image_url, alt_text, display_order, created_at, product_id, sort_order
          ),
          categories!category_id (name),
          profiles!seller_id (username, rating, avatar_url)
        `, { count: 'exact' })
        .eq('is_active', true)
        .eq('is_sold', false);

      // HIERARCHICAL CATEGORY FILTERING
      if (filters.category_id) {
        if (filters.include_descendants !== false) { // Default to true
          // Get products in category tree (category + all descendants)
          // TODO: Implement when get_products_in_category_tree RPC function is available
          const productIds: Array<{id: string}> = [];
          const productIdsError = null;
          // const { data: productIds, error: productIdsError } = await this.supabase.rpc('get_products_in_category_tree', {
          //   category_id: filters.category_id
          // });

          if (productIdsError) {
            return { data: [], error: 'Failed to get products in category tree', hasMore: false };
          }

          if (productIds && productIds.length > 0) {
            const ids = productIds.map(p => p.id);
            query = query.in('id', ids);
          } else {
            // No products in this category tree
            return { data: [], error: null, total: 0, hasMore: false };
          }
        } else {
          // Exact category match only
          query = query.eq('category_id', filters.category_id);
        }
      }

      // Apply other filters
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
        query = query.in('condition', filters.conditions as ("brand_new_with_tags" | "new_without_tags" | "like_new" | "good" | "worn" | "fair")[]);
      }
      
      if (filters.sizes?.length) {
        query = query.in('size', filters.sizes);
      }
      
      if (filters.brands?.length) {
        query = query.in('brand', filters.brands);
      }
      
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      
      if (filters.seller_id) {
        query = query.eq('seller_id', filters.seller_id);
      }
      
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,brand.ilike.%${filters.search}%`);
      }

      // Apply sorting
      if (sort) {
        const { by, direction } = sort;
        if (by === 'popularity') {
          query = query.order('favorite_count', { ascending: direction === 'asc' });
        } else {
          query = query.order(by, { ascending: direction === 'asc' });
        }
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Apply cursor-based pagination
      if (cursor) {
        try {
          const [timestamp, id] = Buffer.from(cursor, 'base64').toString().split(':');

          if (sort?.by === 'created_at' || !sort) {
            query = query
              .or(`created_at.lt.${timestamp},and(created_at.eq.${timestamp},id.lt.${id})`)
              .limit(limit || 20);
          } else {
            // Fallback for complex sorting
            const actualOffset = offset || 0;
            query = query.range(actualOffset, actualOffset + (limit || 20) - 1);
          }
        } catch {
          // Invalid cursor fallback
          const actualOffset = offset || 0;
          query = query.range(actualOffset, actualOffset + (limit || 20) - 1);
        }
      } else {
        // Standard pagination
        if (limit) {
          query = query.limit(limit);
        }
        if (offset) {
          query = query.range(offset, offset + (limit || 10) - 1);
        }
      }

      const { data, error, count } = await query;

      if (error) {
        return { data: [], error: error.message, hasMore: false };
      }

      // Transform the data
      const products: ProductWithImages[] = (data || []).map(item => ({
        ...item,
        images: Array.isArray(item.product_images) ? item.product_images : [],
        category_name: (item.categories && typeof item.categories === 'object' && 'name' in item.categories) ? item.categories.name : undefined,
        seller_name: (item.profiles && typeof item.profiles === 'object' && 'username' in item.profiles) ? (item.profiles.username ?? undefined) : undefined,
        seller_rating: (item.profiles && typeof item.profiles === 'object' && 'rating' in item.profiles) ? item.profiles.rating ?? undefined : undefined
      }));

      // Generate cursor for pagination
      const requestedLimit = limit || 20;
      const hasMore = products.length === requestedLimit;
      let nextCursor: string | undefined;

      if (hasMore && products.length > 0) {
        const lastProduct = products[products.length - 1];
        if (lastProduct && lastProduct.created_at && lastProduct.id) {
          nextCursor = Buffer.from(
            `${lastProduct.created_at}:${lastProduct.id}`
          ).toString('base64');
        }
      }

      return {
        data: products,
        error: null,
        total: count || 0,
        nextCursor,
        hasMore
      };
    } catch {
      return { data: [], error: 'Failed to fetch hierarchical products', hasMore: false };
    }
  }

  /**
   * Get products for a specific category level (1, 2, or 3) with proper hierarchy
   */
  async getProductsForCategoryLevel(
    categoryId: string,
    level: number,
    additionalFilters: Omit<HierarchicalProductFilters, 'category_id'> = {},
    sort?: ProductSort,
    limit?: number,
    offset?: number,
    cursor?: string
  ): Promise<PaginatedProductResult> {
    
    const filters: HierarchicalProductFilters = {
      ...additionalFilters,
      category_id: categoryId,
      // Level 1 & 2 should include descendants, Level 3 should be exact
      include_descendants: level < 3
    };

    return this.getHierarchicalProducts(filters, sort, limit, offset, cursor);
  }

  /**
   * Get category-specific product count (including descendants)
   */
  async getCategoryProductCount(): Promise<{ count: number; error: string | null }> {
    try {
      // TODO: Implement when get_products_in_category_tree RPC function is available
      const data: Array<{id: string}> = [];
      const error = null;
      // const { data, error } = await this.supabase.rpc('get_products_in_category_tree', {
      //   category_id: categoryId
      // });

      if (error) {
        return { count: 0, error: 'Failed to get products in category tree' };
      }

      // Filter active and not sold products
      const activeProducts = await Promise.all(
        (data || []).map(async (item) => {
          const { data: product } = await this.supabase
            .from('products')
            .select('is_active, is_sold')
            .eq('id', item.id)
            .single();
          
          return product?.is_active && !product?.is_sold;
        })
      );

      const count = activeProducts.filter(Boolean).length;
      return { count, error: null };
    } catch {
      return { count: 0, error: 'Failed to get category product count' };
    }
  }
}
