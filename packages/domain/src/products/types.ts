import type { Database } from '@repo/database';

/**
 * Domain entity for a Product
 * Represents a product with all its business logic invariants
 */
export interface Product {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly price: Money;
  readonly condition: ProductCondition;
  readonly size?: string;
  readonly brand?: string;
  readonly color?: string;
  readonly material?: string;
  readonly location: string;
  readonly country_code: string;
  readonly region?: string;
  readonly slug: Slug;
  readonly seller_id: string;
  readonly category_id: string;
  readonly is_active: boolean;
  readonly is_sold: boolean;
  readonly view_count: number;
  readonly favorite_count: number;
  readonly created_at: Date;
  readonly updated_at: Date;
  // Joined data
  readonly images: ProductImage[];
  readonly category_name?: string;
  readonly seller_username?: string;
  readonly seller_rating?: number;
}

/**
 * Domain entity for a Category
 */
export interface Category {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly slug: Slug;
  readonly parent_id?: string;
  readonly level: number;
  readonly sort_order: number;
  readonly is_active: boolean;
  readonly image_url?: string;
  readonly created_at: Date;
  readonly updated_at: Date;
  // Computed properties
  readonly product_count?: number;
  readonly children?: Category[];
}

/**
 * Domain entity for Product Images
 */
export interface ProductImage {
  readonly id: string;
  readonly product_id: string;
  readonly image_url: string;
  readonly alt_text?: string;
  readonly display_order: number;
  readonly sort_order?: number;
  readonly created_at: Date;
}

/**
 * Value Objects
 */

export interface Money {
  readonly amount: number;
  readonly currency: string; // ISO 4217 currency code
}

export interface Slug {
  readonly value: string;
}

export type ProductCondition =
  | 'brand_new_with_tags'
  | 'new_without_tags'
  | 'like_new'
  | 'good'
  | 'worn'
  | 'fair';

/**
 * Domain-specific error types
 */
export abstract class DomainError extends Error {
  abstract readonly code: string;
  abstract readonly type: 'not_found' | 'validation' | 'policy' | 'conflict';
}

export class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND';
  readonly type = 'not_found' as const;

  constructor(entity: string, identifier?: string) {
    super(`${entity}${identifier ? ` with identifier ${identifier}` : ''} not found`);
    this.name = 'NotFoundError';
  }
}

export class ProductValidationError extends DomainError {
  readonly code = 'VALIDATION_ERROR';
  readonly type = 'validation' as const;

  constructor(message: string) {
    super(message);
    this.name = 'ProductValidationError';
  }
}

export class PolicyError extends DomainError {
  readonly code = 'POLICY_ERROR';
  readonly type = 'policy' as const;

  constructor(message: string) {
    super(message);
    this.name = 'PolicyError';
  }
}

export class ConflictError extends DomainError {
  readonly code = 'CONFLICT_ERROR';
  readonly type = 'conflict' as const;

  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

/**
 * Result type for domain operations
 */
export type Result<T, E = DomainError> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Helper functions for working with Results
 */
// Success has no error; make E default to never so it's assignable to any Result<T, E>
export const Ok = <T, E = never>(data: T): Result<T, E> => ({ success: true, data });

export const Err = <E extends DomainError>(error: E): Result<never, E> => ({
  success: false,
  error
});

/**
 * Repository interfaces (domain ports)
 */
export interface ProductRepository {
  getById(id: string): Promise<Result<Product, NotFoundError>>;
  getBySlugAndSeller(slug: string, sellerUsername: string): Promise<Result<Product, NotFoundError>>;
  getBySeller(sellerId: string, options?: { limit?: number; offset?: number; sort?: { by: 'created_at' | 'price' | 'popularity'; direction: 'asc' | 'desc' } }): Promise<Result<Product[], ProductValidationError | NotFoundError>>;
  search(params: ProductSearchParams): Promise<Result<ProductSearchResult, ProductValidationError>>;
  getPromoted(limit: number): Promise<Result<Product[], ProductValidationError>>;
}

export interface CategoryRepository {
  getById(id: string): Promise<Result<Category, NotFoundError>>;
  getBySlug(slug: string): Promise<Result<Category, NotFoundError>>;
  search(query: string, limit: number): Promise<Result<Category[], ProductValidationError>>;
  getBreadcrumb(categoryId: string): Promise<Result<Category[], ProductValidationError>>;
}

/**
 * Search parameters for products
 */
export interface ProductSearchParams {
  query?: string;
  limit?: number;
  offset?: number;
  cursor?: string;
  country_code?: string;
  category_id?: string;
  category_ids?: string[];
  include_descendants?: boolean;
  min_price?: number;
  max_price?: number;
  conditions?: string[];
  sizes?: string[];
  brands?: string[];
  location?: string;
  seller_id?: string;
  sort?: { by: 'created_at' | 'price' | 'popularity' | 'relevance'; direction: 'asc' | 'desc' };
}

/**
 * Search result for products
 */
export interface ProductSearchResult {
  products: Product[];
  total: number;
  nextCursor?: string;
  hasMore: boolean;
}

/**
 * Database type mappings
 */
export type DbProduct = Database['public']['Tables']['products']['Row'];
export type DbCategory = Database['public']['Tables']['categories']['Row'];
export type DbProductImage = Database['public']['Tables']['product_images']['Row'];
