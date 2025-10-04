import { test, expect } from '@playwright/test';

test.describe('Seller Onboarding', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authenticated user
    await page.goto('/onboarding');
  });

  test('complete seller onboarding flow', async ({ page }) => {
    // Step 1: Account type selection
    await expect(page.locator('h1')).toContainText('Become a Seller');

    // Select seller account type
    await page.click('[data-testid="account-type-seller"]');
    await page.click('button:has-text("Continue")');

    // Step 2: Profile setup
    await page.fill('input[name="displayName"]', 'Test Seller');
    await page.fill('textarea[name="bio"]', 'I am a test seller');

    // Upload avatar (skip in test)
    await page.click('button:has-text("Continue")');

    // Step 3: Social links (optional)
    await page.click('button:has-text("Continue")');

    // Step 4: Payout method
    await expect(page.locator('text=Payout Method')).toBeVisible();

    // Select stripe as payout method
    await page.click('[data-testid="payout-stripe"]');
    await page.click('button:has-text("Complete Setup")');

    // Should complete onboarding
    await expect(page.url()).toMatch(/\/dashboard/);
  });

  test('validates required fields', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Become a Seller');

    // Try to continue without selecting account type
    await page.click('button:has-text("Continue")');

    // Should show validation error
    await expect(page.locator('text=Please select an account type')).toBeVisible();
  });

  test('allows saving progress', async ({ page }) => {
    // Fill first step
    await page.click('[data-testid="account-type-seller"]');

    // Navigate away and back
    await page.goto('/');
    await page.goto('/onboarding');

    // Should remember selection (if implemented)
    await expect(page.locator('[data-testid="account-type-seller"]')).toBeChecked();
  });
});