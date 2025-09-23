/**
 * Network utilities for handling timeouts, aborts, and resilient data fetching
 * Used primarily for SSR load functions and client-side search/autocomplete
 */

/**
 * Races a promise against a timeout, returning a fallback value if the timeout is reached
 *
 * @param promise - The promise to race against the timeout
 * @param timeoutMs - Timeout in milliseconds
 * @param fallback - Fallback value to return if timeout is reached
 * @returns Promise that resolves to either the original result or fallback
 *
 * @example
 * ```ts
 * // SSR load function with skeleton fallback
 * const products = await withTimeout(
 *   supabase.from('products').select('*'),
 *   2000,
 *   { data: [], error: null }
 * );
 * ```
 */
export async function withTimeout<T>(
  promise: PromiseLike<T>,
  timeoutMs: number,
  fallback: T
): Promise<T> {
  return await Promise.race([
    promise,
    new Promise<T>((resolve) => {
      setTimeout(() => resolve(fallback), timeoutMs);
    })
  ]);
}

/**
 * Creates an AbortController with a timeout that automatically aborts after the specified duration
 * Useful for search/autocomplete requests that should be cancelled if they take too long
 *
 * @param timeoutMs - Timeout in milliseconds after which to abort
 * @returns AbortController that will auto-abort after timeout
 *
 * @example
 * ```ts
 * // Search with auto-abort after 5 seconds
 * const controller = createTimeoutController(5000);
 *
 * try {
 *   const response = await fetch('/api/search', {
 *     signal: controller.signal,
 *     method: 'POST',
 *     body: JSON.stringify({ query })
 *   });
 * } catch (error) {
 *   if (error.name === 'AbortError') {
 *
 *   }
 * }
 * ```
 */
export function createTimeoutController(timeoutMs: number): AbortController {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  // Clean up timeout if manually aborted before timeout
  controller.signal.addEventListener('abort', () => {
    clearTimeout(timeoutId);
  });

  return controller;
}

/**
 * Debounce function for search inputs and other rapid user interactions
 *
 * @param func - Function to debounce
 * @param delayMs - Delay in milliseconds
 * @returns Debounced function
 *
 * @example
 * ```ts
 * const debouncedSearch = debounce((query: string) => {
 *   // Perform search
 * }, 300);
 * ```
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delayMs);
  };
}
