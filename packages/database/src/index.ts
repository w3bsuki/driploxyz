// Clean, production-ready database types - no bloat
export * from './generated.js';
export type { Database } from './generated.js';

// Import Database type for utility exports
import type { Database } from './generated.js';

// Essential utility types for development - need to add these manually
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
export type Enums = Database['public']['Enums'];
export type CompositeTypes = Database['public']['CompositeTypes'];

// Runtime constants for validation
export {
  USER_ROLES,
  ORDER_STATUSES,
  PRODUCT_CONDITIONS,
  MESSAGE_STATUSES
} from './generated.js';