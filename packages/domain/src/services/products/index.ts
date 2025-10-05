/**
 * Products Domain Services
 *
 * This module provides domain services for product and category operations.
 * It implements business logic and provides a clean interface for the application layer.
 */

// Export domain entities and types
export * from './entities.js';

// Export value objects
export * from './value-objects.js';

// Export ports (interfaces)
export * from './ports.js';

// Export repository implementations
export * from './repos.js';

// Export domain services
export * from './services.js';

// Convenience exports for common use cases
export type {
  Product,
  Category,
  ProductImage,
  Money,
  Slug,
  ProductCondition,
  Result
} from './entities.js';

export type {
  ProductSearchParams,
  ProductSearchResult
} from './ports.js';

export type {
  SupabasePort,
  ProductRepository,
  CategoryRepository
} from './ports.js';

export {
  MoneyValueObject,
  SlugValueObject,
  createMoney,
  createSlug
} from './value-objects.js';

export {
  createProductRepository,
  createCategoryRepository
} from './repos.js';

export {
  createSupabasePort
} from './ports.js';

export {
  GetProductBySlug,
  SearchProducts,
  ResolveCategorySegments,
  GetFeaturedProducts,
  GetProductsByCategory,
  createGetProductBySlug,
  createSearchProducts,
  createResolveCategorySegments,
  createGetFeaturedProducts,
  createGetProductsByCategory
} from './services.js';