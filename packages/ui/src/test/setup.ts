import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { setupGlobalMocks } from './test-utils.js';

// Setup global mocks before each test
beforeEach(() => {
  setupGlobalMocks();
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: '',
  thresholds: []
}));

// Mock ResizeObserver  
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});

// Mock window functions used in components
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn()
});

Object.defineProperty(window, 'requestIdleCallback', {
  writable: true,
  value: vi.fn((callback) => setTimeout(callback, 0))
});

// Mock performance API
Object.defineProperty(window, 'performance', {
  writable: true,
  value: {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn()
  }
});

// Mock CSS.supports for modern CSS features
Object.defineProperty(window, 'CSS', {
  writable: true,
  value: {
    supports: vi.fn().mockReturnValue(true)
  }
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.warn('Unhandled promise rejection:', reason, promise);
});

// Cleanup after each test
afterEach(() => {
  vi.clearAllMocks();
  
  // Clean up any lingering DOM elements
  document.body.innerHTML = '';
  
  // Reset any global state
  if (typeof window !== 'undefined') {
    // Reset window location
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        href: 'http://localhost:3000/',
        origin: 'http://localhost:3000',
        protocol: 'http:',
        hostname: 'localhost',
        port: '3000',
        pathname: '/',
        search: '',
        hash: '',
        replace: vi.fn(),
        assign: vi.fn(),
        reload: vi.fn()
      }
    });
  }
});