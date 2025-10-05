/**
 * @repo/domain
 *
 * Business logic layer for the Driplo platform.
 *
 * This package contains:
 * - Domain services for business operations
 * - Business rules and validation
 * - Domain-specific types
 *
 * Usage:
 * import { productService } from '@repo/domain';
 * import { orderService } from '@repo/domain/services/orders';
 * import { productValidator } from '@repo/domain/validation';
 */

// Re-export main entry points
export * from './services/index';
export * from './validation/index';
export * from './types/index';
