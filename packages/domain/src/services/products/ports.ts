import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';
import type {
  Product,
  Category,
  Result,
  NotFoundError,
  ProductValidationError as ValidationError
} from './entities';

/**
 * Port interface for Supabase data access
 * This is a thin abstraction over SupabaseClient to make our domain services testable
 */
export interface SupabasePort {
  /**
   * Execute a select query with joins
   */
  select<T extends Record<string, unknown>>(
    table: keyof Database['public']['Tables'],
    columns?: string,
    filters?: Record<string, unknown>,
    options?: {
      orderBy?: { column: string; ascending?: boolean } | { column: string; ascending?: boolean }[];
      limit?: number;
      offset?: number;
      single?: boolean;
      count?: 'exact' | 'planned' | 'estimated';
    }
  ): Promise<{
    data: T | T[] | null;
    error: unknown;
    count?: number;
  }>;

  /**
   * Get a single record by ID
   */
  single<T extends Record<string, unknown>>(
    table: keyof Database['public']['Tables'],
    id: string,
    columns?: string
  ): Promise<{ data: T | null; error: unknown }>;

  /**
   * List records with filtering
   */
  list<T extends Record<string, unknown>>(
    table: keyof Database['public']['Tables'],
    filters: Record<string, unknown>,
    columns?: string,
    options?: {
      orderBy?: { column: string; ascending?: boolean }[];
      limit?: number;
      offset?: number;
    }
  ): Promise<{ data: T[] | null; error: unknown }>;

  /**
   * Count records matching filters
   */
  count(
    table: keyof Database['public']['Tables'],
    filters: Record<string, unknown>
  ): Promise<{ count: number | null; error: unknown }>;

  /**
   * Execute a raw SQL query (for complex operations)
   */
  rpc<T = unknown>(
    functionName: string,
    params?: Record<string, unknown>
  ): Promise<{ data: T | null; error: unknown }>;
}

/**
 * Repository interfaces for domain entities
 */

export interface ProductRepository {
  /**
   * Get a product by its ID
   */
  getById(id: string): Promise<Result<Product, NotFoundError | ValidationError>>;

  /**
   * Get a product by its slug and seller username
   */
  getBySlugAndSeller(slug: string, sellerUsername: string): Promise<Result<Product, NotFoundError | ValidationError>>;

  /**
   * Search products with filters and pagination
   */
  search(params: ProductSearchParams): Promise<Result<ProductSearchResult, ValidationError>>;

  /**
   * Get promoted/featured products for homepage
   */
  getPromoted(limit?: number): Promise<Result<Product[], ValidationError>>;

  /**
   * Get products by seller ID
   */
  getBySeller(sellerId: string, options?: ProductListOptions): Promise<Result<Product[], ValidationError>>;

  /**
   * Get products in a category tree (category + descendants)
   */
  getByCategoryTree(categoryId: string, options?: ProductListOptions): Promise<Result<ProductSearchResult, ValidationError>>;

  /**
   * Count products matching filters
   */
  count(filters: ProductSearchFilters): Promise<Result<number, ValidationError>>;
}

export interface CategoryRepository {
  /**
   * Get a category by its ID
   */
  getById(id: string): Promise<Result<Category, NotFoundError>>;

  /**
   * Get a category by its slug
   */
  getBySlug(slug: string): Promise<Result<Category, NotFoundError>>;

  /**
   * Get all active categories
   */
  getAll(): Promise<Result<Category[], ValidationError>>;

  /**
   * Get categories organized as a tree
   */
  getTree(): Promise<Result<Category[], ValidationError>>;

  /**
   * Get category breadcrumb trail (ancestors)
   */
  getBreadcrumb(categoryId: string): Promise<Result<Category[], ValidationError>>;

  /**
   * Get descendants of a category
   */
  getDescendants(categoryId: string): Promise<Result<Category[], ValidationError>>;

  /**
   * Get categories by level
   */
  getByLevel(level: number): Promise<Result<Category[], ValidationError>>;

  /**
   * Search categories by name/description
   */
  search(query: string, limit?: number): Promise<Result<Category[], ValidationError>>;

  /**
   * Resolve category segments to category IDs
   * Example: ['women', 'clothing', 'dresses'] -> [categoryId]
   */
  resolveSegments(segments: string[]): Promise<Result<string[], ValidationError>>;
}

/**
 * Parameter interfaces for repository methods
 */

export interface ProductSearchParams {
  query?: string;
  category_ids?: string[];
  category_id?: string;
  include_descendants?: boolean;
  min_price?: number;
  max_price?: number;
  conditions?: string[];
  sizes?: string[];
  brands?: string[];
  location?: string;
  seller_id?: string;
  country_code?: string;
  sort?: {
    by: 'created_at' | 'price' | 'popularity' | 'relevance';
    direction: 'asc' | 'desc';
  };
  limit?: number;
  offset?: number;
  cursor?: string;
}

export interface ProductSearchFilters {
  category_ids?: string[];
  category_id?: string;
  include_descendants?: boolean;
  min_price?: number;
  max_price?: number;
  conditions?: string[];
  sizes?: string[];
  brands?: string[];
  location?: string;
  seller_id?: string;
  country_code?: string;
  is_active?: boolean;
  is_sold?: boolean;
}

export interface ProductListOptions {
  limit?: number;
  offset?: number;
  sort?: {
    by: 'created_at' | 'price' | 'popularity';
    direction: 'asc' | 'desc';
  };
  include_inactive?: boolean;
}

export interface ProductSearchResult {
  products: Product[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

/**
 * Factory function to create a SupabasePort from a SupabaseClient
 */
export function createSupabasePort(client: SupabaseClient<Database>): SupabasePort {
  return {
    async select(table, columns = '*', filters = {}, options = {}) {
      try {
        let query: any = client.from(table).select(columns as any, { count: options.count as any });

        // Apply filters
        Object.entries(filters).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            query = query.in(key, value);
          } else if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });

        // Apply ordering
        if (options.orderBy) {
          const orderBy = Array.isArray(options.orderBy) ? options.orderBy[0] : options.orderBy;
          if (orderBy) {
            query = query.order(orderBy.column, {
              ascending: orderBy.ascending ?? true
            });
          }
        }

        // Apply pagination
        if (options.limit !== undefined) {
          query = query.limit(options.limit);
        }
        if (options.offset !== undefined) {
          query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
        }

        // Single row?
        if (options.single) {
          query = query.single();
        }

        const result = await query;
        return {
          data: result.data as any,
          error: result.error as any,
          count: result.count ?? undefined
        };
      } catch (error) {
        return { data: null, error: error as any, count: undefined };
      }
    },

    async single(table, id, columns = '*') {
      try {
        const result = await client.from(table).select(columns as any).eq('id', id).single();
        return { data: result.data as any, error: result.error as any };
      } catch (error) {
        return { data: null, error: error as any };
      }
    },

    async list(table, filters, columns = '*', options = {}) {
      try {
        let query: any = client.from(table).select(columns as any);

        // Apply filters
        Object.entries(filters).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            query = query.in(key, value);
          } else if (typeof value === 'object' && value !== null) {
            // Handle complex filters like { or: [...] }
            Object.entries(value).forEach(([operator, operand]) => {
              if (operator === 'or' && Array.isArray(operand)) {
                query = query.or(operand.join(','));
              }
            });
          } else if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });

        // Apply ordering
        if (options.orderBy) {
          options.orderBy.forEach(order => {
            query = query.order(order.column, { ascending: order.ascending ?? true });
          });
        }

        // Apply pagination
        if (options.limit !== undefined) {
          query = query.limit(options.limit);
        }
        if (options.offset !== undefined) {
          query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
        }

        const result = await query;
        return { data: result.data as any, error: result.error as any };
      } catch (error) {
        return { data: null, error: error as any };
      }
    },

    async count(table, filters) {
      try {
        const result = await client.from(table).select('*', { count: 'exact', head: true }).match(filters as any);
        return { count: result.count ?? null, error: result.error as any };
      } catch (error) {
        return { count: null, error: error as any };
      }
    },

    async rpc(functionName, params) {
      try {
        const result = await client.rpc(functionName as any, params as any);
        return { data: result.data as any, error: result.error as any };
      } catch (error) {
        return { data: null, error: error as any };
      }
    }
  };
}
