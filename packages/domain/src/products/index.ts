/**
 * Products Domain
 * Public exports for the products domain
 */

// Export all types
export * from './types.js';

// Export all services
export * from './services.js';

// TODO: Add validation exports when validation.ts is created
// export * from './validation.js';

// Re-export commonly used items for convenience
export type {
  Product,
  Category,
  ProductImage,
  Money,
  Slug,
  ProductCondition,
  Result
} from './types.js';