/**
 * @repo/domain
 *
 * Business logic layer for the Driplo platform.
 *
 * This package contains domain-driven design with business logic organized by domain:
 * - cart: Shopping cart business logic
 * - products: Product and category management
 * - auth: Authentication business rules (no framework code)
 * - orders: Order processing and management
 * - users: User management business logic
 * - payments: Payment processing business rules
 * - shared: Shared utilities and types
 *
 * Usage:
 * import { productService } from '@repo/domain/products';
 * import { cartService } from '@repo/domain/cart';
 * import { orderService } from '@repo/domain/orders';
 * import { validateProduct } from '@repo/domain/products';
 */

// Re-export domain entry points
export * from './products/index.js';
export * from './orders/index.js';
export * from './users/index.js';
export * from './payments/index.js';
export * from './cart/index.js';
export * from './auth/index.js';
export * from './shared/index.js';
