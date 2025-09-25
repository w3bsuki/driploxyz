// Clean, production-ready database types - no bloat
export * from './generated.js';
export type { Database } from './generated.js';

// Essential utility types for development
export type {
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
  CompositeTypes
} from './generated.js';

// Runtime constants for validation
export {
  USER_ROLES,
  ORDER_STATUSES,
  PRODUCT_CONDITIONS,
  MESSAGE_STATUSES
} from './generated.js';