/**
 * @repo/core/utils - Framework-agnostic utility functions
 */

// Export all slug utilities
export * from './slug.js';

// Re-export common utilities that might be used across packages
export { nanoid } from 'nanoid';
export { default as slugify } from 'slugify';