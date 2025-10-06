/**
 * @repo/core - Consolidated core utilities for the Driplo marketplace
 *
 * This package consolidates auth, cookies, utils, services, stripe, and email functionality
 * that was previously split across multiple micro-packages.
 */

// Re-export all auth utilities
export * from './auth/index.js';

// Re-export all cookie utilities
export * from './cookies/index.js';

// Re-export all utils
export * from './utils/index.js';

// Re-export all services
export * from './services/index.js';

// Re-export all stripe utilities
export * from './stripe/index.js';

// Re-export all email utilities
export * from './email/index.js';