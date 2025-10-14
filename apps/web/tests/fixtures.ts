import { test as base, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Mock data factories
const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  username: 'testuser',
  full_name: 'Test User',
  avatar_url: '/placeholder-avatar.jpg',
  role: 'user',
  created_at: new Date().toISOString(),
  ...overrides
});

const createMockProduct = (overrides = {}) => ({
  id: 'test-product-1',
  title: 'Test Product',
  description: 'A great test product',
  price: 29.99,
  images: ['/placeholder-product.jpg'],
  seller: {
    id: 'seller-1',
    username: 'testuser',
    rating: 4.5,
    avatar_url: '/placeholder-avatar.jpg'
  },
  condition: 'good',
  category_name: 'Clothing',
  category_id: 'cat-1',
  slug: 'test-product',
  created_at: new Date().toISOString(),
  status: 'active',
  ...overrides
});

const createMockOrder = (overrides = {}) => ({
  id: 'order-1',
  product_id: 'test-product-1',
  buyer_id: 'buyer-1',
  seller_id: 'seller-1',
  status: 'pending',
  total_amount: 29.99,
  created_at: new Date().toISOString(),
  ...overrides
});

const createMockMessage = (overrides = {}) => ({
  id: 'msg-1',
  conversation_id: 'conv-1',
  sender_id: 'user-1',
  content: 'Test message',
  created_at: new Date().toISOString(),
  read: false,
  ...overrides
});

// Extend base test with custom fixtures
type CustomFixtures = {
  authenticatedPage: Page;
  adminPage: Page;
  makeAxeBuilder: () => AxeBuilder;
};

export const test = base.extend<CustomFixtures>({
  // Page with API mocking
  page: async ({ page }, use) => {
    // Disable animations for consistent testing
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-delay: 0.01ms !important;
          transition-duration: 0.01ms !important;
          transition-delay: 0.01ms !important;
        }
      `
    });

    // Mock comprehensive API responses
    await page.route('**/api/**', async (route) => {
      const url = route.request().url();
      const method = route.request().method();

      // Search API
      if (url.includes('/api/search') && method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            products: [
              createMockProduct({ id: 'search-1', title: 'Vintage Camera' }),
              createMockProduct({ id: 'search-2', title: 'Retro Watch' })
            ],
            hasMore: false,
            currentPage: 1,
            totalCount: 2
          })
        });
      }
      
      // Products API
      else if (url.includes('/api/products/') && method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(createMockProduct())
        });
      }

      // Health check
      else if (url.includes('/api/health')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() })
        });
      }

      else {
        await route.continue();
      }
    });

    await use(page);
  },

  // Authenticated page fixture
  authenticatedPage: async ({ page }, use) => {
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', 'mock-auth-token');
      localStorage.setItem('supabase.auth.user', JSON.stringify({
        id: 'test-user-id',
        email: 'test@example.com',
        username: 'testuser',
        role: 'authenticated'
      }));
    });
    await use(page);
  },

  // Admin page fixture
  adminPage: async ({ page }, use) => {
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', 'admin-auth-token');
      localStorage.setItem('supabase.auth.user', JSON.stringify({
        id: 'admin-user-id',
        email: 'admin@example.com',
        username: 'admin',
        role: 'admin',
        app_metadata: { role: 'admin' }
      }));
    });
    await use(page);
  },

  // Accessibility fixture
  makeAxeBuilder: async ({ page }, use) => {
    const makeAxeBuilder = () => new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']);

    await use(makeAxeBuilder);
  }
});

export { expect };

// Export utilities
export { createMockUser, createMockProduct, createMockOrder, createMockMessage };
