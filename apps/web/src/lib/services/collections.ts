import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';
import { createLogger } from '$lib/utils/log';

const log = createLogger('CollectionService');

export interface BrandCollection {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  collection_type: 'drip' | 'designer';
  is_featured: boolean;
  sort_order: number;
  product_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CollectionWithProducts extends BrandCollection {
  products: {
    id: string;
    title: string;
    price: number;
    images: string[];
    condition: string;
    seller_id: string;
    created_at: string;
    updated_at: string;
  }[];
}

export interface CollectionFilters {
  collection_type?: 'drip' | 'designer';
  is_featured?: boolean;
  is_active?: boolean;
  limit?: number;
  offset?: number;
}

export class CollectionService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Get all brand collections
   */
  async getBrandCollections(filters: CollectionFilters = {}) {
    try {
      let query = this.supabase
        .from('brand_collections')
        .select('*');

      // Apply filters
      if (filters.collection_type) {
        query = query.eq('collection_type', filters.collection_type);
      }

      if (filters.is_featured !== undefined) {
        query = query.eq('is_featured', filters.is_featured);
      }

      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }

      // Default ordering
      query = query.order('sort_order', { ascending: true })
                   .order('name', { ascending: true });

      // Apply limit and offset
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        log.error('Error fetching brand collections:', error);
        return { data: null, error: error.message };
      }

      return { data: data as BrandCollection[], error: null };
    } catch (error) {
      log.error('Error in getBrandCollections:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get a specific brand collection by slug
   */
  async getBrandCollectionBySlug(slug: string) {
    try {
      const { data, error } = await this.supabase
        .from('brand_collections')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) {
        log.error('Error fetching brand collection by slug:', error);
        return { data: null, error: error.message };
      }

      return { data: data as BrandCollection, error: null };
    } catch (error) {
      log.error('Error in getBrandCollectionBySlug:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get products for a specific brand collection
   */
  async getCollectionProducts(collectionId: string, limit = 20, offset = 0) {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select(`
          id,
          title,
          price,
          condition,
          seller_id,
          created_at,
          updated_at,
          product_images (
            image_url,
            alt_text,
            display_order
          )
        `)
        .eq('brand_collection_id', collectionId)
        .eq('status', 'active')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        log.error('Error fetching collection products:', error);
        return { data: null, error: error.message };
      }

      // Transform the data to match expected format
      const transformedProducts = data?.map(product => ({
        ...product,
        images: product.product_images
          ?.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
          .map(img => img.image_url) || []
      })) || [];

      return { data: transformedProducts, error: null };
    } catch (error) {
      log.error('Error in getCollectionProducts:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get a brand collection with its products
   */
  async getBrandCollectionWithProducts(slug: string, limit = 20, offset = 0): Promise<{
    data: CollectionWithProducts | null;
    error: string | null;
  }> {
    try {
      // Get the collection
      const collectionResult = await this.getBrandCollectionBySlug(slug);
      if (collectionResult.error || !collectionResult.data) {
        return { data: null, error: collectionResult.error || 'Collection not found' };
      }

      // Get the products
      const productsResult = await this.getCollectionProducts(collectionResult.data.id, limit, offset);
      if (productsResult.error) {
        return { data: null, error: productsResult.error };
      }

      const collectionWithProducts: CollectionWithProducts = {
        ...collectionResult.data,
        products: productsResult.data || []
      };

      return { data: collectionWithProducts, error: null };
    } catch (error) {
      log.error('Error in getBrandCollectionWithProducts:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get featured brand collections for homepage display
   */
  async getFeaturedCollections(type?: 'drip' | 'designer') {
    const filters: CollectionFilters = {
      is_featured: true,
      is_active: true,
      limit: 8 // Limit for homepage display
    };

    if (type) {
      filters.collection_type = type;
    }

    return this.getBrandCollections(filters);
  }

  /**
   * Update product count for a collection
   */
  async updateCollectionProductCount(collectionId: string) {
    try {
      // Count active products for this collection
      const { count, error: countError } = await this.supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('brand_collection_id', collectionId)
        .eq('status', 'active')
        .eq('is_active', true);

      if (countError) {
        log.error('Error counting collection products:', countError);
        return { data: null, error: countError.message };
      }

      // Update the collection's product count
      const { data, error } = await this.supabase
        .from('brand_collections')
        .update({ product_count: count || 0, updated_at: new Date().toISOString() })
        .eq('id', collectionId);

      if (error) {
        log.error('Error updating collection product count:', error);
        return { data: null, error: error.message };
      }

      return { data: { product_count: count || 0 }, error: null };
    } catch (error) {
      log.error('Error in updateCollectionProductCount:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get collections for search dropdown
   */
  async getCollectionsForDropdown(limit = 6) {
    try {
      const { data, error } = await this.supabase
        .from('brand_collections')
        .select('id, name, slug, collection_type, product_count')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('sort_order', { ascending: true })
        .limit(limit);

      if (error) {
        log.error('Error fetching collections for dropdown:', error);
        return { data: null, error: error.message };
      }

      // Transform for dropdown display
      const dropdownCollections = data?.map(collection => ({
        key: `collection=${collection.slug}`,
        label: collection.name,
        emoji: collection.collection_type === 'designer' ? '💎' : '🔥',
        product_count: collection.product_count
      })) || [];

      return { data: dropdownCollections, error: null };
    } catch (error) {
      log.error('Error in getCollectionsForDropdown:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}