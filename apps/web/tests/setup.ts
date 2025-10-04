import { test as base } from '@playwright/test';

// Extend base test with custom fixtures
export const test = base.extend({
  // Mock authenticated user
  authenticatedPage: [async ({ page }: any, use: any) => {
    // Mock authentication by setting a cookie or local storage
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', 'mock-token');
      localStorage.setItem('supabase.auth.user', JSON.stringify({
        id: 'test-user-id',
        email: 'test@example.com',
        role: 'authenticated'
      }));
    });
    await use(page);
  }, { option: true }],

  // Mock admin user
  adminPage: [async ({ page }: any, use: any) => {
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', 'admin-token');
      localStorage.setItem('supabase.auth.user', JSON.stringify({
        id: 'admin-user-id',
        email: 'admin@example.com',
        role: 'admin',
        app_metadata: { role: 'admin' }
      }));
    });
    await use(page);
  }, { option: true }]
} as any);

export { expect } from '@playwright/test';

// Global test setup
test.beforeEach(async ({ page }) => {
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

  // Mock external API calls
  await page.route('**/api/**', async (route) => {
    // Mock successful API responses
    if (route.request().url().includes('/auth/')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id: 'test-user-id' } })
      });
    } else {
      // Let other API calls through
      await route.continue();
    }
  });
});