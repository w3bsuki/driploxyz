import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authenticated user
    await page.goto('/');
  });

  test('complete product checkout flow', async ({ page }) => {
    // Navigate to a product page
    await page.goto('/product/test-seller/test-product');

    // Verify product details are visible
    await expect(page.locator('h1')).toContainText('Test Product');
    await expect(page.locator('[data-testid="product-price"]')).toBeVisible();

    // Select size if applicable
    const sizeSelector = page.locator('[data-testid="size-selector"]');
    if (await sizeSelector.isVisible()) {
      await sizeSelector.first().click();
    }

    // Click buy button
    await page.click('button:has-text("Buy Now")');

    // Should redirect to checkout
    await expect(page.url()).toMatch(/\/checkout\/.+/);

    // Fill shipping information
    await page.fill('input[name="shippingAddress.line1"]', '123 Test St');
    await page.fill('input[name="shippingAddress.city"]', 'Test City');
    await page.fill('input[name="shippingAddress.postalCode"]', '12345');

    // Fill payment information (mock)
    await page.fill('input[name="cardNumber"]', '4242424242424242');
    await page.fill('input[name="cardExpiry"]', '12/25');
    await page.fill('input[name="cardCvc"]', '123');

    // Submit order
    await page.click('button:has-text("Place Order")');

    // Should redirect to success page
    await expect(page.url()).toMatch(/\/payment\/success/);
    await expect(page.locator('text=Order confirmed')).toBeVisible();
  });

  test('validates checkout fields', async ({ page }) => {
    await page.goto('/checkout/test-product-id');

    // Submit empty form
    await page.click('button:has-text("Place Order")');

    // Should show validation errors
    await expect(page.locator('text=Shipping address is required')).toBeVisible();
    await expect(page.locator('text=Payment information is required')).toBeVisible();
  });

  test('handles bundle checkout', async ({ page }) => {
    // Navigate to bundle checkout
    await page.goto('/checkout/bundle');

    // Verify bundle items are displayed
    await expect(page.locator('[data-testid="bundle-items"]')).toBeVisible();

    // Should show bundle pricing
    await expect(page.locator('[data-testid="bundle-total"]')).toBeVisible();

    // Continue with checkout
    await page.click('button:has-text("Proceed to Payment")');

    // Should redirect to payment page
    await expect(page.url()).toMatch(/\/payment/);
  });
});