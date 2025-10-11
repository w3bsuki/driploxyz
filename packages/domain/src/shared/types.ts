/**
 * Domain Types
 *
 * Type definitions for domain entities and value objects.
 */

// Placeholder for domain type exports
// Will be populated as types are extracted

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface SoftDeletable extends BaseEntity {
  deleted_at?: string;
}