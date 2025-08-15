import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';

type Product = Database['public']['Tables']['products']['Row'];
type ProductInsert = Database['public']['Tables']['products']['Insert'];
type ProductUpdate = Database['public']['Tables']['products']['Update'];
type ProductImage = Database['public']['Tables']['product_images']['Row'];

export interface ProductWithImages extends Product {
  images: ProductImage[];
  category_name?: string;
  seller_name?: string;
  seller_rating?: number;
}

export interface ProductFilters {
  category_ids?: string[];
  min_price?: number;
  max_price?: number;
  conditions?: ('new' | 'like-new' | 'good' | 'fair')[];
  sizes?: string[];
  brands?: string[];
  location?: string;
  seller_id?: string;
  search?: string;
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
}

export class ProductService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Get a single product by ID with images and related data
   */
  async getProduct(id: string): Promise<{ data: ProductWithImages | null; error: string | null }> {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select(`
          *,
          product_images (*),
          categories (name),
          profiles!products_seller_id_fkey (username, rating, avatar_url)
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        return { data: null, error: error.message };
      }

      if (!data) {
        return { data: null, error: 'Product not found' };
      }

      // Transform the data
      const product: ProductWithImages = {
        ...data,
        images: data.product_images || [],
        category_name: data.categories?.name,
        seller_name: data.profiles?.username,
        seller_rating: data.profiles?.rating
      };

      // Increment view count
      await this.incrementViewCount(id);

      return { data: product, error: null };
    } catch (error) {
      console.error('Error in getProduct:', error);
      return { data: null, error: 'Failed to fetch product' };
    }
  }

  /**
   * Get products with filtering, sorting and pagination
   */
  async getProducts(options: ProductListOptions = {}): Promise<{ 
    data: ProductWithImages[]; 
    error: string | null;
    total?: number;
  }> {
    try {
      let query = this.supabase
        .from('products')
        .select(`
          *,
          product_images!product_images_product_id_fkey (
            id, image_url, alt_text, sort_order
          ),
          categories!products_category_id_fkey (name),
          profiles!products_seller_id_fkey (username, rating, avatar_url)
        `, { count: 'exact' })
        .eq('is_active', true)
        .eq('is_sold', false);

      // Apply filters
      if (options.filters) {
        const { filters } = options;
        
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
          query = query.in('condition', filters.conditions);
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

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching products:', error);
        return { data: [], error: error.message };
      }

      // Transform the data
      const products: ProductWithImages[] = (data || []).map(item => ({
        ...item,
        images: item.product_images || [],
        category_name: item.categories?.name,
        seller_name: item.profiles?.username,
        seller_rating: item.profiles?.rating,
        seller_avatar: item.profiles?.avatar_url
      }));

      return { data: products, error: null, total: count || 0 };
    } catch (error) {
      console.error('Error in getProducts:', error);
      return { data: [], error: 'Failed to fetch products' };
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
        console.error('Error creating product:', error);
        return { data: null, error: error.message };
      }

      // Add images if provided
      if (imageUrls.length > 0 && data) {
        await this.addProductImages(data.id, imageUrls);
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in createProduct:', error);
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
        console.error('Error updating product:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in updateProduct:', error);
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
      // TEMPORARY FIX: Skip premium boost query that's causing 400 errors
      // TODO: Fix premium_boosts table/query later
      const boostedProducts: any[] = [];
      const boostedError = null;

      // Get manually promoted products (main source for now)
      const { data: manuallyPromoted, error: manualError } = await this.supabase
        .from('products')
        .select(`
          *,
          product_images (*),
          categories (name),
          profiles!products_seller_id_fkey (username, rating, avatar_url)
        `)
        .eq('is_promoted', true)
        .eq('is_active', true)
        .eq('is_sold', false)
        .or('promotion_expires_at.is.null,promotion_expires_at.gt.now()')
        .order('promotion_priority', { ascending: false })
        .order('promoted_at', { ascending: false })
        .limit(limit);

      if (manualError) {
        console.error('Manual promoted products error:', manualError);
        throw new Error('Failed to fetch promoted products');
      }

      // Combine and deduplicate products
      const allPromoted = [
        ...(boostedProducts || []),
        ...(manuallyPromoted || [])
      ];
      
      // Remove duplicates based on product ID
      const uniqueProducts = allPromoted.reduce((acc, product) => {
        if (!acc.find(p => p.id === product.id)) {
          acc.push(product);
        }
        return acc;
      }, [] as any[]);

      const limitedProducts = uniqueProducts.slice(0, limit);

      if (!limitedProducts || limitedProducts.length === 0) {
        return { data: [], error: null };
      }

      // Transform the data
      const products: ProductWithImages[] = limitedProducts.map(item => ({
        ...item,
        images: item.product_images || [],
        category_name: item.categories?.name,
        seller_name: item.profiles?.username,
        seller_rating: item.profiles?.rating,
        seller_avatar: item.profiles?.avatar_url
      }));

      return { data: products, error: null };
    } catch (error) {
      console.error('Error in getPromotedProducts:', error);
      return { data: [], error: 'Failed to fetch promoted products' };
    }
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
        console.error('Error deleting product:', error);
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      console.error('Error in deleteProduct:', error);
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
        sort_order: index
      }));

      const { error } = await this.supabase
        .from('product_images')
        .insert(images);

      if (error) {
        console.error('Error adding product images:', error);
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      console.error('Error in addProductImages:', error);
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
        console.error('Error removing product images:', error);
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      console.error('Error in removeProductImages:', error);
      return { error: 'Failed to remove product images' };
    }
  }

  /**
   * Increment product view count
   */
  private async incrementViewCount(id: string): Promise<void> {
    try {
      await this.supabase.rpc('increment_product_view', { product_id_param: id });
    } catch (error) {
      console.error('Error incrementing view count:', error);
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
      const { data, error } = await this.supabase.rpc('search_products', {
        search_query: query,
        limit_count: options.limit || 20,
        offset_count: options.offset || 0,
        sort_by: options.sort?.by || 'relevance',
        sort_direction: options.sort?.direction?.toUpperCase() || 'DESC'
      });

      if (error) {
        console.error('Error searching products:', error);
        return { data: [], error: error.message };
      }

      // Transform the data to match our interface
      const products: ProductWithImages[] = (data || []).map((item: any) => ({
        ...item,
        images: [{ image_url: item.image_url }],
        category_name: item.category_name,
        seller_name: item.seller_name,
        seller_rating: item.seller_rating
      }));

      return { data: products, error: null };
    } catch (error) {
      console.error('Error in searchProducts:', error);
      return { data: [], error: 'Failed to search products' };
    }
  }
}