// Local type bridge for legacy imports
// Re-export commonly used types from @repo/ui and define lightweight helpers used by web components

export type { Category } from '@repo/ui/types';

// Minimal SizeOption type used by sell flow components
export interface SizeOption {
  label: string;
  value: string;
}
