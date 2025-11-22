import { test, expect } from '@playwright/test';

test('audit ui', async ({ page }) => {
  // Mobile viewport
  await page.setViewportSize({ width: 375, height: 812 });

  // Home page
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'audit-home-mobile.png' });

  // Search page
  await page.goto('/search');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'audit-search-mobile.png' });
});
