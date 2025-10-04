import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('user can signup and login', async ({ page }) => {
    // Navigate to signup
    await page.click('a[href="/signup"]');
    await expect(page).toHaveURL(/\/signup/);

    // Fill signup form
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!');

    // Submit signup
    await page.click('button[type="submit"]');

    // Should redirect to email verification or onboarding
    await expect(page.url()).toMatch(/\/(verify-email|onboarding)/);
  });

  test('user can login with valid credentials', async ({ page }) => {
    // Navigate to login
    await page.click('a[href="/login"]');
    await expect(page).toHaveURL(/\/login/);

    // Fill login form
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');

    // Submit login
    await page.click('button[type="submit"]');

    // Should redirect to dashboard or onboarding
    await expect(page.url()).toMatch(/\/(dashboard|onboarding)/);
  });

  test('shows validation errors for invalid inputs', async ({ page }) => {
    await page.goto('/login');

    // Submit empty form
    await page.click('button[type="submit"]');

    // Should show validation errors
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  test('password reset flow works', async ({ page }) => {
    await page.goto('/login');

    // Click forgot password
    await page.click('a[href="/forgot-password"]');
    await expect(page).toHaveURL(/\/forgot-password/);

    // Fill email
    await page.fill('input[name="email"]', 'test@example.com');

    // Submit reset request
    await page.click('button[type="submit"]');

    // Should show success message
    await expect(page.locator('text=Check your email')).toBeVisible();
  });
});