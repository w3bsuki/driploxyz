/**
 * Products Domain Adapter
 *
 * This file provides a bridge between the SvelteKit application and the domain layer.
 * It adapts the domain services to work with the existing app structure and
 * maintains backward compatibility with existing interfaces.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';
import type { Locals } from '$lib/types';
import {
  // Domain types
  type Product as DomainProduct,
  type Category as DomainCategory,
  type Result,
  type ProductSearchParams,
  type ProductSearchResult,

  // Domain infrastructure
  createSupabasePort,
  createProductRepository,
  createCategoryRepository,

  // Domain services
  createGetProductBySlug,
  createSearchProducts,
  createResolveCategorySegments,
  createGetFeaturedProducts,
  createGetProductsByCategory
} from '@repo/domain';

// Legacy types from the app for compatibility
import type { ProductWithImages } from './products';

/**
 * Adapter class that provides the same interface as the existing ProductService
 * but uses the domain layer internally
 */
export class ProductDomainAdapter {
  private productRepo: ReturnType<typeof createProductRepository>;
  private categoryRepo: ReturnType<typeof createCategoryRepository>;
  private getProductBySlug: ReturnType<typeof createGetProductBySlug>;
  private searchProducts: ReturnType<typeof createSearchProducts>;
  private resolveCategorySegments: ReturnType<typeof createResolveCategorySegments>;
  private getFeaturedProducts: ReturnType<typeof createGetFeaturedProducts>;
  private getProductsByCategory: ReturnType<typeof createGetProductsByCategory>;

  constructor(supabase: SupabaseClient<Database>) {
    // Create domain infrastructure
    const db = createSupabasePort(supabase);
    this.productRepo = createProductRepository(db);
    this.categoryRepo = createCategoryRepository(db);

    // Create domain services
    this.getProductBySlug = createGetProductBySlug(this.productRepo);
    this.searchProducts = createSearchProducts(this.productRepo);
    this.resolveCategorySegments = createResolveCategorySegments(this.categoryRepo);
    this.getFeaturedProducts = createGetFeaturedProducts(this.productRepo);
    this.getProductsByCategory = createGetProductsByCategory(this.productRepo, this.categoryRepo);
  }

  /**
   * Get a product by ID - maintains compatibility with existing ProductService.getProduct()
   */
  async getProduct(id: string): Promise<{ data: ProductWithImages | null; error: string | null }> {
    const result = await this.productRepo.getById(id);

    if (!result.success) {
      return {
        data: null,
        error: result.error.message
      };
    }

    return {
      data: this.mapDomainProductToLegacy(result.data),
      error: null
    };
  }

  /**
   * Get a product by slug and seller username - new domain-enhanced method
   */
  async getProductBySlugAndSeller(slug: string, sellerUsername: string): Promise<{ data: ProductWithImages | null; error: string | null }> {
    const result = await this.getProductBySlug.execute(slug, sellerUsername);

    if (!result.success) {
      return {
        data: null,
        error: result.error.message
      };
    }

    return {
      data: this.mapDomainProductToLegacy(result.data),
      error: null
    };
  }

  /**
   * Search products with filters - maintains compatibility with existing ProductService.searchProducts()
   */
  async searchProductsWithFilters(
    query: string,
    options: {
      limit?: number;
      country_code?: string;
      category_ids?: string[];
      min_price?: number;
      max_price?: number;
      conditions?: string[];
      sizes?: string[];
      brands?: string[];
      location?: string;
      sort?: { by: 'created_at' | 'price' | 'popularity' | 'relevance'; direction: 'asc' | 'desc' };
    } = {}
  ): Promise<{ data: ProductWithImages[]; error: string | null }> {
    const searchParams: ProductSearchParams = {
      query,
      limit: options.limit,
      country_code: options.country_code,
      category_ids: options.category_ids,
      min_price: options.min_price,
      max_price: options.max_price,
      conditions: options.conditions,
      sizes: options.sizes,
      brands: options.brands,
      location: options.location,
      sort: options.sort
    };

    const result = await this.searchProducts.execute(searchParams);

    if (!result.success) {
      return {
        data: [],
        error: result.error.message
      };
    }

    return {
      data: result.data.products.map(product => this.mapDomainProductToLegacy(product)),
      error: null
    };
  }

  /**
   * Get products with pagination - maintains compatibility with existing ProductService.getProducts()
   */
  async getProducts(options: {
    filters?: {
      category_ids?: string[];
      min_price?: number;
      max_price?: number;
      conditions?: string[];
      sizes?: string[];
      brands?: string[];
      location?: string;
      seller_id?: string;
      search?: string;
      country_code?: string;
    };
    sort?: { by: 'created_at' | 'price' | 'popularity'; direction: 'asc' | 'desc' };
    limit?: number;
    offset?: number;
    cursor?: string;
  } = {}): Promise<{
    data: ProductWithImages[];
    error: string | null;
    total?: number;
    nextCursor?: string;
    hasMore: boolean;
  }> {
    const searchParams: ProductSearchParams = {
      ...options.filters,
      sort: options.sort,
      limit: options.limit,
      offset: options.offset,
      cursor: options.cursor
    };

    const result = await this.searchProducts.execute(searchParams);

    if (!result.success) {
      return {
        data: [],
        error: result.error.message,
        hasMore: false
      };
    }

    return {
      data: result.data.products.map(product => this.mapDomainProductToLegacy(product)),
      error: null,
      total: result.data.total,
      nextCursor: result.data.nextCursor,
      hasMore: result.data.hasMore
    };
  }

  /**
   * Get promoted products for homepage
   */
  async getPromotedProducts(limit: number = 10): Promise<{ data: ProductWithImages[]; error: string | null }> {
    const result = await this.getFeaturedProducts.execute(limit);

    if (!result.success) {
      return {
        data: [],
        error: result.error.message
      };
    }

    return {
      data: result.data.map(product => this.mapDomainProductToLegacy(product)),
      error: null
    };
  }

  /**
   * Get products by seller - maintains compatibility with existing ProductService.getSellerProducts()
   */
  async getSellerProducts(
    sellerId: string,
    options: {
      limit?: number;
      offset?: number;
      sort?: { by: 'created_at' | 'price' | 'popularity'; direction: 'asc' | 'desc' };
      includeInactive?: boolean;
    } = {}
  ): Promise<{ data: ProductWithImages[]; error: string | null }> {
    const result = await this.productRepo.getBySeller(sellerId, options);

    if (!result.success) {
      return {
        data: [],
        error: result.error.message
      };
    }

    return {
      data: result.data.map(product => this.mapDomainProductToLegacy(product)),
      error: null
    };
  }

  /**
   * Get hierarchical products - maintains compatibility with existing ProductService.getHierarchicalProducts()
   */
  async getHierarchicalProducts(
    filters: {
      category_id?: string;
      include_descendants?: boolean;
      min_price?: number;
      max_price?: number;
      conditions?: string[];
      sizes?: string[];
      brands?: string[];
      location?: string;
      seller_id?: string;
      search?: string;
      country_code?: string;
    } = {},
    sort?: { by: 'created_at' | 'price' | 'popularity'; direction: 'asc' | 'desc' },
    limit?: number,
    offset?: number,
    cursor?: string
  ): Promise<{
    data: ProductWithImages[];
    error: string | null;
    total?: number;
    nextCursor?: string;
    hasMore: boolean;
  }> {
    const searchParams: ProductSearchParams = {
      ...filters,
      sort,
      limit,
      offset,
      cursor
    };

    const result = await this.searchProducts.execute(searchParams);

    if (!result.success) {
      return {
        data: [],
        error: result.error.message,
        hasMore: false
      };
    }

    return {
      data: result.data.products.map(product => this.mapDomainProductToLegacy(product)),
      error: null,
      total: result.data.total,
      nextCursor: result.data.nextCursor,
      hasMore: result.data.hasMore
    };
  }

  /**
   * Resolve category segments from URL path
   */
  async resolveCategorySegmentsFromPath(segments: string[]): Promise<{ data: string[]; error: string | null }> {
    const result = await this.resolveCategorySegments.execute(segments);

    if (!result.success) {
      return {
        data: [],
        error: result.error.message
      };
    }

    return {
      data: result.data,
      error: null
    };
  }

  /**
   * Get products for a category page
   */
  async getProductsForCategory(
    categoryId: string,
    options: {
      includeDescendants?: boolean;
      limit?: number;
      offset?: number;
      sort?: { by: 'created_at' | 'price' | 'popularity'; direction: 'asc' | 'desc' };
      country?: string;
    } = {}
  ): Promise<{
    data: ProductWithImages[];
    category?: DomainCategory;
    error: string | null;
    total?: number;
  }> {
    const result = await this.getProductsByCategory.execute(categoryId, options);

    if (!result.success) {
      return {
        data: [],
        error: result.error.message
      };
    }

    return {
      data: result.data.products.map(product => this.mapDomainProductToLegacy(product)),
      category: result.data.category,
      error: null,
      total: result.data.total
    };
  }

  /**
   * Map domain product to legacy ProductWithImages interface
   * This ensures backward compatibility with existing components
   */
  private mapDomainProductToLegacy(domainProduct: DomainProduct): ProductWithImages {
    return {
      id: domainProduct.id,
      title: domainProduct.title,
      description: domainProduct.description,
      price: domainProduct.price.amount,
      condition: domainProduct.condition,
      size: domainProduct.size,
      brand: domainProduct.brand,
      color: domainProduct.color,
      material: domainProduct.material,
      location: domainProduct.location,
      country_code: domainProduct.country_code,
      region: domainProduct.region,
      slug: domainProduct.slug.value,
      seller_id: domainProduct.seller_id,
      category_id: domainProduct.category_id,
      is_active: domainProduct.is_active,
      is_sold: domainProduct.is_sold,
      view_count: domainProduct.view_count,
      favorite_count: domainProduct.favorite_count,
      created_at: domainProduct.created_at.toISOString(),
      updated_at: domainProduct.updated_at.toISOString(),
      images: domainProduct.images.map(img => ({
        id: img.id,
        product_id: img.product_id,
        image_url: img.image_url,
        alt_text: img.alt_text,
        display_order: img.display_order,
        sort_order: img.sort_order,
        created_at: img.created_at.toISOString()
      })),
      category_name: domainProduct.category_name,
      seller_name: domainProduct.seller_username,
      seller_username: domainProduct.seller_username,
      seller_rating: domainProduct.seller_rating
    };
  }
}

/**
 * Factory function to create the adapter from SvelteKit locals
 */
export function createProductDomainAdapter(locals: Locals): ProductDomainAdapter {
  if (!locals.supabase) {
    throw new Error('Supabase client not available in locals');
  }

  return new ProductDomainAdapter(locals.supabase);
}

/**
 * Convenience function to get the product domain adapter in a SvelteKit context
 */
export function getProductAdapter(locals: Locals): ProductDomainAdapter {
  return createProductDomainAdapter(locals);
}

// Export the domain types for use in components if needed
export type {
  DomainProduct,
  DomainCategory,
  ProductSearchParams,
  ProductSearchResult,
  Result
} from '@repo/domain';