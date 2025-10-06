import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    actionTimeout: 10000,
    navigationTimeout: 15000
  },
  // Global test setup
  beforeEach: async ({ page }) => {
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
      const url = route.request().url();

      // Mock search API responses
      if (url.includes('/api/search')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            products: [
              {
                id: 'test-product-1',
                title: 'Test Product',
                price: 29.99,
                images: ['/placeholder-product.svg'],
                seller: { username: 'testuser', rating: 4.5 },
                condition: 'good',
                category_name: 'Clothing'
              }
            ],
            hasMore: false,
            currentPage: 1,
            totalCount: 1
          })
        });
      }
      // Mock auth API responses
      else if (url.includes('/auth/')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: {
              id: 'test-user-id',
              email: 'test@example.com',
              username: 'testuser'
            }
          })
        });
      }
      // Mock other common API calls
      else if (url.includes('/api/favorites')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ favorites: [] })
        });
      }
      else {
        // Let other API calls through
        await route.continue();
      }
    });
  },
  webServer: {
    command: 'pnpm --filter web dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] }
    }
  ]
});
