/**
 * withTimeout utility function
 * Wraps a promise with a timeout and default fallback value
 */

export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  fallbackValue: T
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => {
      setTimeout(() => resolve(fallbackValue), timeoutMs);
    })
  ]);
}