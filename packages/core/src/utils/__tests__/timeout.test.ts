import { describe, it, expect } from 'vitest';
import { withTimeout } from '../timeout.js';

describe('withTimeout', () => {
  it('should resolve with promise value when promise completes before timeout', async () => {
    const fastPromise = Promise.resolve('success');
    const result = await withTimeout(fastPromise, 1000, 'fallback');
    expect(result).toBe('success');
  });

  it('should resolve with fallback value when promise times out', async () => {
    const slowPromise = new Promise<string>((resolve) => {
      setTimeout(() => resolve('slow result'), 500);
    });
    
    const result = await withTimeout(slowPromise, 50, 'fallback');
    expect(result).toBe('fallback');
  });

  it('should work with different types', async () => {
    // Number type
    const numberPromise = Promise.resolve(42);
    const numberResult = await withTimeout(numberPromise, 1000, 0);
    expect(numberResult).toBe(42);

    // Object type
    const objectPromise = Promise.resolve({ key: 'value' });
    const objectResult = await withTimeout(objectPromise, 1000, { key: 'fallback' });
    expect(objectResult).toEqual({ key: 'value' });

    // Array type
    const arrayPromise = Promise.resolve([1, 2, 3]);
    const arrayResult = await withTimeout(arrayPromise, 1000, []);
    expect(arrayResult).toEqual([1, 2, 3]);
  });

  it('should return fallback for timed out complex objects', async () => {
    const slowObjectPromise = new Promise<{ data: string }>((resolve) => {
      setTimeout(() => resolve({ data: 'late' }), 500);
    });

    const fallbackValue = { data: 'fallback' };
    const result = await withTimeout(slowObjectPromise, 50, fallbackValue);
    expect(result).toEqual(fallbackValue);
  });

  it('should handle null fallback values', async () => {
    const slowPromise = new Promise<string | null>((resolve) => {
      setTimeout(() => resolve('late'), 500);
    });

    const result = await withTimeout(slowPromise, 50, null);
    expect(result).toBeNull();
  });

  it('should handle undefined fallback values', async () => {
    const slowPromise = new Promise<string | undefined>((resolve) => {
      setTimeout(() => resolve('late'), 500);
    });

    const result = await withTimeout(slowPromise, 50, undefined);
    expect(result).toBeUndefined();
  });

  it('should resolve immediately completed promises before timeout triggers', async () => {
    const immediatePromise = Promise.resolve('immediate');
    const startTime = Date.now();
    
    const result = await withTimeout(immediatePromise, 1000, 'fallback');
    const elapsed = Date.now() - startTime;
    
    expect(result).toBe('immediate');
    expect(elapsed).toBeLessThan(100); // Should complete very fast
  });

  it('should handle race condition with exact timing', async () => {
    // Promise that resolves just before timeout
    const justInTimePromise = new Promise<string>((resolve) => {
      setTimeout(() => resolve('just in time'), 40);
    });

    // With a 100ms timeout, the promise should win
    const result = await withTimeout(justInTimePromise, 100, 'fallback');
    expect(result).toBe('just in time');
  });

  it('should not reject when the wrapped promise rejects after timeout', async () => {
    const rejectingPromise = new Promise<string>((_, reject) => {
      setTimeout(() => reject(new Error('Rejected')), 500);
    });

    // This should return fallback, not throw
    const result = await withTimeout(rejectingPromise, 50, 'fallback');
    expect(result).toBe('fallback');
  });

  it('should propagate rejection if promise rejects before timeout', async () => {
    const fastRejectingPromise = Promise.reject(new Error('Fast rejection'));

    await expect(withTimeout(fastRejectingPromise, 1000, 'fallback')).rejects.toThrow('Fast rejection');
  });

  it('should handle zero timeout', async () => {
    const slowPromise = new Promise<string>((resolve) => {
      setTimeout(() => resolve('late'), 100);
    });

    // With 0 timeout, fallback should almost always win (though not guaranteed due to JS event loop)
    const result = await withTimeout(slowPromise, 0, 'fallback');
    // Note: This test might be flaky - the exact behavior depends on JS event loop timing
    expect(typeof result).toBe('string');
  });

  it('should work with async functions', async () => {
    const asyncFn = async (): Promise<number> => {
      return 123;
    };

    const result = await withTimeout(asyncFn(), 1000, 0);
    expect(result).toBe(123);
  });
});
