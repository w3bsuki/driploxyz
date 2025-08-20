import { render, type RenderResult, fireEvent } from '@testing-library/svelte';
import { vi } from 'vitest';
import type { ComponentType } from 'svelte';
import type { Product, User } from '../types.js';

// Test data factories for consistent mock data
export const createMockProduct = (overrides?: Partial<Product>): Product => ({
  id: 'test-product-1',
  title: 'Vintage Leather Jacket',
  description: 'A beautiful vintage leather jacket in excellent condition',
  price: 89.99,
  images: [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg'
  ],
  brand: 'Levi\'s',
  size: 'M',
  condition: 'good',
  category: 'jackets',
  sellerId: 'seller-1',
  sellerName: 'John Doe',
  sellerRating: 4.8,
  sellerAvatar: 'https://example.com/avatar.jpg',
  createdAt: '2024-01-15T10:00:00Z',
  location: 'New York, NY',
  tags: ['vintage', 'leather'],
  is_sold: false,
  status: 'active',
  ...overrides
});

export const createMockUser = (overrides?: Partial<User>): User => ({
  id: 'test-user-1',
  username: 'testuser',
  email: 'test@example.com',
  avatar: 'https://example.com/avatar.jpg',
  bio: 'Fashion enthusiast and vintage collector',
  rating: 4.9,
  reviewCount: 127,
  verified: true,
  memberSince: '2023-03-15T08:00:00Z',
  location: 'Los Angeles, CA',
  ...overrides
});

export const createMockSellerStats = () => ({
  rating: 4.8,
  totalSales: 156,
  responseTime: 2.5,
  joinedDate: '2023-03-15T08:00:00Z',
  verificationLevel: 'verified' as const,
  lastActive: new Date().toISOString()
});

// Helper function to render Svelte 5 components with proper rune handling
export const renderSvelte5Component = <T extends Record<string, any>>(
  Component: ComponentType,
  props?: T,
  options?: {
    container?: HTMLElement;
    target?: HTMLElement;
  }
): RenderResult<T> => {
  // Ensure we have a container for proper DOM testing
  const container = options?.container || document.createElement('div');
  document.body.appendChild(container);
  
  const result = render(Component, {
    props: props || {},
    target: options?.target || container
  });

  // Add cleanup to remove container after test
  const originalUnmount = result.unmount;
  result.unmount = () => {
    originalUnmount();
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  };

  return result as RenderResult<T>;
};

// Mock functions for common event handlers
export const createMockHandlers = () => ({
  onFavorite: vi.fn(),
  onclick: vi.fn(),
  onFollow: vi.fn(),
  onMessage: vi.fn(),
  onViewProfile: vi.fn(),
  onLanguageChange: vi.fn()
});

// Helper to wait for Svelte reactive updates
export const waitForSvelteUpdate = () => new Promise(resolve => setTimeout(resolve, 0));

// Helper to simulate user interactions
export const userInteraction = {
  click: async (element: Element) => {
    await fireEvent.click(element);
    await waitForSvelteUpdate();
  },
  
  keyDown: async (element: Element, key: string, options?: { ctrlKey?: boolean; shiftKey?: boolean }) => {
    await fireEvent.keyDown(element, { key, ...options });
    await waitForSvelteUpdate();
  },
  
  hover: async (element: Element) => {
    await fireEvent.mouseEnter(element);
    await waitForSvelteUpdate();
  },
  
  unhover: async (element: Element) => {
    await fireEvent.mouseLeave(element);
    await waitForSvelteUpdate();
  },
  
  touchStart: async (element: Element, clientX: number) => {
    await fireEvent.touchStart(element, {
      touches: [{ clientX, clientY: 0 }],
      changedTouches: [{ clientX, clientY: 0 }]
    });
    await waitForSvelteUpdate();
  },
  
  touchEnd: async (element: Element, clientX: number) => {
    await fireEvent.touchEnd(element, {
      changedTouches: [{ clientX, clientY: 0 }]
    });
    await waitForSvelteUpdate();
  }
};

// Mock translation object for testing
export const mockTranslations = {
  size: 'Size',
  currency: '$',
  addToFavorites: 'Add to favorites',
  removeFromFavorites: 'Remove from favorites',
  new: 'New',
  likeNew: 'Like New',
  good: 'Good',
  fair: 'Fair',
  soldBy: 'Sold by',
  message: 'Message',
  follow: 'Follow',
  following: 'Following',
  viewFullProfile: 'View full profile',
  sales: 'sales',
  formatPrice: (price: number) => `$${price.toFixed(2)}`
};

// Helper to check accessibility attributes
export const checkAccessibility = {
  hasRole: (element: Element, role: string): boolean => {
    return element.getAttribute('role') === role;
  },
  
  hasAriaLabel: (element: Element): boolean => {
    return element.hasAttribute('aria-label');
  },
  
  hasTabIndex: (element: Element): boolean => {
    return element.hasAttribute('tabindex');
  },
  
  isKeyboardAccessible: (element: Element): boolean => {
    const tabIndex = element.getAttribute('tabindex');
    const role = element.getAttribute('role');
    
    return (
      tabIndex === '0' || 
      ['button', 'link', 'input', 'select', 'textarea'].includes(element.tagName.toLowerCase()) ||
      ['button', 'link', 'menuitem', 'option'].includes(role || '')
    );
  }
};

// Mock window functions for testing
export const mockWindow = {
  scrollTo: vi.fn(),
  requestIdleCallback: vi.fn((callback) => setTimeout(callback, 0)),
  matchMedia: vi.fn(() => ({
    matches: false,
    media: '',
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
};

// Setup global mocks before each test
export const setupGlobalMocks = () => {
  Object.defineProperty(window, 'scrollTo', {
    writable: true,
    value: mockWindow.scrollTo
  });
  
  Object.defineProperty(window, 'requestIdleCallback', {
    writable: true,
    value: mockWindow.requestIdleCallback
  });
  
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: mockWindow.matchMedia
  });
  
  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
  }));
  
  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
  }));
};

// Helper to create mock image with load event
export const createMockImage = (src: string, shouldLoad: boolean = true) => {
  const img = document.createElement('img');
  img.src = src;
  
  setTimeout(() => {
    if (shouldLoad) {
      img.dispatchEvent(new Event('load'));
    } else {
      img.dispatchEvent(new Event('error'));
    }
  }, 0);
  
  return img;
};

// Helper to test component props reactivity (Svelte 5 runes)
export const testPropsReactivity = async <T extends Record<string, any>>(
  result: RenderResult<T>,
  newProps: Partial<T>
) => {
  await result.component.$set(newProps);
  await waitForSvelteUpdate();
};