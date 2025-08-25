// Export generated Supabase types
export * from './generated.js';
import type { Database } from './generated.js';
export type { Database } from './generated.js';

// Keep legacy types for backward compatibility (can be removed later)
export * from './types.js';

// Re-export common type aliases 
export type Tables = Database['public']['Tables'];
export type TablesInsert = Tables;
export type TablesUpdate = Tables;
export type Enums = Database['public']['Enums'];
export type CompositeTypes = Database['public']['CompositeTypes'];
export type Json = any;