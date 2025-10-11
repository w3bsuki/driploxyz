/**
 * Validation schemas for @repo/core
 * Framework-agnostic validation using Zod
 */

import { z } from 'zod';

// Re-export all validation schemas
export * from './auth';
export * from './products';
export * from './users';
export * from './payments';