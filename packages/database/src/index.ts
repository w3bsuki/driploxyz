// Export generated Supabase types
export * from './generated';
import type { Database } from './generated';
export type { Database } from './generated';

// Re-export common type aliases 
export type Tables = Database['public']['Tables'];
export type TablesInsert = Tables;
export type TablesUpdate = Tables;
export type Enums = Database['public']['Enums'];
export type CompositeTypes = Database['public']['CompositeTypes'];
export type Json = any;