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

// Note: Global test setup should be in playwright.config.ts, not here