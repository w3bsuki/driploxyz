/**
 * Test Setup for @repo/ui
 *
 * Global test configuration and setup for UI component testing.
 */

import '@testing-library/jest-dom';

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock IntersectionObserver for virtualization tests
class MockIntersectionObserver {
  readonly root = null;
  readonly rootMargin = '';
  readonly thresholds: ReadonlyArray<number> = [];
  constructor(_callback: any, _options?: any) {}
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): any[] { return []; }
}
(globalThis as any).IntersectionObserver = MockIntersectionObserver;

// Mock ResizeObserver for responsive components
class MockResizeObserver implements ResizeObserver {
  constructor(_callback: ResizeObserverCallback) {}
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
(globalThis as any).ResizeObserver = MockResizeObserver as any;