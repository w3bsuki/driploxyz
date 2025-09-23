/**
 * Core shadcn-svelte utility function
 * Combines clsx and tailwind-merge for intelligent class merging
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Conditionally join classes and merge Tailwind CSS classes intelligently
 *
 * This is the core utility function used throughout shadcn-svelte components.
 * It handles:
 * - Conditional class application (via clsx)
 * - Intelligent Tailwind class merging (via tailwind-merge)
 * - Deduplication of conflicting Tailwind classes
 *
 * @param inputs - Class values (strings, objects, arrays, etc.)
 * @returns Merged class string
 *
 * @example
 * cn('px-2 py-1', 'px-4') // "py-1 px-4" (px-2 is overridden)
 * cn('text-red-500', condition && 'text-blue-500') // conditional classes
 * cn({ 'font-bold': isActive }, 'text-lg') // object notation
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Export for backwards compatibility with existing system
export { cn as classNames };

// Export types for component props
export type { ClassValue };