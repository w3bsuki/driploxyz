/**
 * Svelte 5 compatible utility function for class merging
 * Replaces clsx and tailwind-merge with native implementation
 */

type ClassValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | ClassValue[]
  | Record<string, boolean | undefined | null>;

function toClassString(value: ClassValue): string[] {
  if (!value) return [];

  if (typeof value === 'string') return [value];
  if (typeof value === 'number') return [value.toString()];

  if (Array.isArray(value)) {
    return value.flatMap(toClassString);
  }

  if (typeof value === 'object') {
    return Object.entries(value)
      .filter(([, condition]) => Boolean(condition))
      .map(([className]) => className);
  }

  return [];
}

/**
 * Simple class merging utility for Svelte 5
 * Handles conditional classes and basic deduplication
 *
 * @example
 * cn('px-2 py-1', 'px-4') // "px-2 py-1 px-4"
 * cn('text-red-500', condition && 'text-blue-500') // conditional classes
 * cn({ 'font-bold': isActive }, 'text-lg') // object notation
 */
export function cn(...inputs: ClassValue[]): string {
  const classes = inputs.flatMap(toClassString);

  // Simple deduplication - last occurrence wins
  const seen = new Set();
  const result: string[] = [];

  for (const cls of classes.reverse()) {
    if (!seen.has(cls)) {
      seen.add(cls);
      result.push(cls);
    }
  }

  return result.reverse().join(' ');
}

// Export for backwards compatibility
export { cn as classNames };