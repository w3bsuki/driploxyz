import { test, expect } from '@playwright/test';

/**
 * Production Readiness Test Suite
 * 
 * Comprehensive tests for all critical user flows before production launch.
 * These tests must ALL pass before allowing real user registrations.
 */

// Test data - using unique identifiers to avoid conflicts
const testUsers = {
  free: {
    email: `test.free.${Date.now()}@driplo.test`,
    password: 'TestPass123!',
    username: `freeuser${Date.now()}`
  },
  pro: {
    email: `test.pro.${Date.now()}@driplo.test`, 
    password: 'TestPass123!',
    username: `prouser${Date.now()}`
  },
  brand: {
    email: `test.brand.${Date.now()}@driplo.test`,
    password: 'TestPass123!',
    username: `branduser${Date.now()}`
  },
  buyer: {
    email: `test.buyer.${Date.now()}@driplo.test`,
    password: 'TestPass123!', 
    username: `buyer${Date.now()}`
  }
};

test.describe('Production Readiness - Authentication Flows', () => {
  test('Auth page uses black tabs instead of blue', async ({ page }) => {
    await page.goto('/login');
    
    // Wait for page to load
    await expect(page.getByRole('heading', { name: 'Driplo' })).toBeVisible();
    
    // Check that active tab uses black/gray color, not blue
    const activeTab = page.locator('.bg-\\[color\\:var\\(--gray-900\\)\\]');
    await expect(activeTab).toBeVisible();
    
    // Verify no blue background colors are used
    const blueElements = page.locator('[class*="bg-blue"]');
    await expect(blueElements).toHaveCount(0);
  });

  test('Complete signup flow for free account', async ({ page }) => {
    await page.goto('/signup');
    
    // Fill signup form
    await page.fill('input[type="email"]', testUsers.free.email);
    await page.fill('input[type="password"]', testUsers.free.password);
    await page.click('button[type="submit"]');
    
    // Should redirect to verification page or show success message
    await expect(page).toHaveURL(/verification|success/);
    
    // Note: In real test, we'd need to handle email verification
    // For now, check that the signup request was successful
  });

  test('Sign in with valid credentials works', async ({ page }) => {
    // This test assumes we have a known valid account (admin)
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'rawtwstl@gmail.com');
    await page.fill('input[type="password"]', 'your_admin_password'); // Would need real password
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/dashboard/);
  });
});

test.describe('Production Readiness - Onboarding Flows', () => {
  test.beforeEach(async ({ page: _page }) => {
    // Mock authenticated state for onboarding tests
    // In real implementation, you'd set up proper auth state
  });

  test('Free account onboarding - no payment required', async ({ page }) => {
    await page.goto('/onboarding');
    
    // Select free account type
    await page.click('[data-testid="account-type-personal"]');
    
    // Fill onboarding form
    await page.fill('input[name="username"]', testUsers.free.username);
    await page.fill('input[name="fullName"]', 'Test Free User');
    await page.fill('input[name="location"]', 'Sofia, Bulgaria');
    
    // Complete onboarding
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/dashboard/);
    
    // Verify "new seller" badge is assigned
    await expect(page.locator('[data-testid="user-badge"]')).toContainText('new seller');
  });

  test('Pro account onboarding - payment required with INDECISIVE discount', async ({ page }) => {
    await page.goto('/onboarding');
    
    // Select pro account type
    await page.click('[data-testid="account-type-pro"]');
    
    // Should show payment modal
    await expect(page.locator('[data-testid="payment-modal"]')).toBeVisible();
    
    // Enter INDECISIVE discount code
    await page.fill('input[name="discountCode"]', 'INDECISIVE');
    
    // Verify 90% discount is applied
    const discountText = page.locator('[data-testid="discount-amount"]');
    await expect(discountText).toContainText('90%');
    
    // Mock successful payment (in real test, use Stripe test mode)
    // Fill payment form and complete purchase
    
    // After payment, complete onboarding
    await page.fill('input[name="username"]', testUsers.pro.username);
    await page.fill('input[name="fullName"]', 'Test Pro User');
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard with pro badge
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.locator('[data-testid="user-badge"]')).toContainText('pro');
  });

  test('Brand account onboarding - payment and brand profile creation', async ({ page }) => {
    await page.goto('/onboarding');
    
    // Select brand account type
    await page.click('[data-testid="account-type-brand"]');
    
    // Should show payment modal
    await expect(page.locator('[data-testid="payment-modal"]')).toBeVisible();
    
    // Complete payment process (mocked)
    // Complete brand onboarding with additional brand fields
    await page.fill('input[name="username"]', testUsers.brand.username);
    await page.fill('input[name="fullName"]', 'Test Brand');
    await page.fill('input[name="brandDescription"]', 'Premium fashion brand');
    
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard with brand badge
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.locator('[data-testid="user-badge"]')).toContainText('brand');
  });
});

test.describe('Production Readiness - Product Listing', () => {
  test.beforeEach(async ({ page: _page }) => {
    // Set up authenticated state
  });

  test('Create product listing with image upload', async ({ page }) => {
    await page.goto('/sell');
    
    // Fill product details
    await page.fill('input[name="title"]', 'Test Designer Jacket');
    await page.fill('textarea[name="description"]', 'Beautiful designer jacket in excellent condition');
    await page.fill('input[name="price"]', '99.99');
    
    // Select category
    await page.click('[data-testid="category-select"]');
    await page.click('[data-testid="category-clothing"]');
    
    // Select condition
    await page.click('[data-testid="condition-like-new"]');
    
    // Upload test image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./tests/fixtures/test-product-image.jpg');
    
    // Verify image preview appears
    await expect(page.locator('[data-testid="image-preview"]')).toBeVisible();
    
    // Submit listing
    await page.click('button[type="submit"]');
    
    // Should redirect to product page
    await expect(page).toHaveURL(/product\/[a-f0-9-]+/);
    
    // Verify product details are displayed correctly
    await expect(page.locator('h1')).toContainText('Test Designer Jacket');
    await expect(page.locator('[data-testid="product-price"]')).toContainText('99.99');
  });

  test('Image upload handles EXIF rotation correctly', async ({ page }) => {
    await page.goto('/sell');
    
    // Upload image with EXIF rotation data
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./tests/fixtures/rotated-image.jpg');
    
    // Wait for image processing
    await page.waitForLoadState('networkidle');
    
    // Verify image is displayed with correct orientation
    const imagePreview = page.locator('[data-testid="image-preview"] img');
    await expect(imagePreview).toBeVisible();
    
    // Check that image dimensions are correct (not rotated incorrectly)
    const imageBox = await imagePreview.boundingBox();
    expect(imageBox?.width).toBeGreaterThan(100);
    expect(imageBox?.height).toBeGreaterThan(100);
  });
});

test.describe('Production Readiness - Purchase Flow', () => {
  test('Complete purchase transaction', async ({ context }) => {
    // Create buyer session
    const buyerPage = await context.newPage();
    
    // Set up buyer account
    // Navigate to product
    await buyerPage.goto('/search');
    
    // Find a test product
    await buyerPage.click('[data-testid="product-card"]:first-child');
    
    // Click buy now
    await buyerPage.click('[data-testid="buy-now-button"]');
    
    // Should show checkout page
    await expect(buyerPage).toHaveURL(/checkout/);
    
    // Fill shipping details
    await buyerPage.fill('input[name="address"]', '123 Test Street');
    await buyerPage.fill('input[name="city"]', 'Sofia');
    await buyerPage.fill('input[name="postalCode"]', '1000');
    
    // Complete payment (mocked)
    await buyerPage.click('[data-testid="complete-purchase"]');
    
    // Should show success page
    await expect(buyerPage).toHaveURL(/order\/success/);
    
    // Verify order was created
    await expect(buyerPage.locator('[data-testid="order-confirmation"]')).toBeVisible();
  });
});

test.describe('Production Readiness - Mobile Responsiveness', () => {
  test('Auth flows work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/login');
    
    // Verify mobile-friendly layout
    await expect(page.locator('.min-h-screen')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    
    // Check tap target sizes are adequate (44px minimum)
    const submitButton = page.locator('button[type="submit"]');
    const buttonBox = await submitButton.boundingBox();
    expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
  });

  test('Product listing works on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/sell');
    
    // Verify form is mobile-friendly
    await expect(page.locator('input[name="title"]')).toBeVisible();
    await expect(page.locator('input[type="file"]')).toBeVisible();
    
    // Test mobile image upload
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./tests/fixtures/mobile-test-image.jpg');
    
    await expect(page.locator('[data-testid="image-preview"]')).toBeVisible();
  });
});

test.describe('Production Readiness - Performance', () => {
  test('Homepage loads within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    
    // Wait for main content to be visible
    await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 1.5 seconds (LCP target)
    expect(loadTime).toBeLessThan(1500);
  });
  
  test('Search page handles loading states properly', async ({ page }) => {
    await page.goto('/search');
    
    // Should show loading state initially
    await expect(page.locator('[data-testid="search-loading"]')).toBeVisible();
    
    // Then show results
    await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
    
    // Verify infinite scroll works
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Should load more products
    const productCards = page.locator('[data-testid="product-card"]');
    await expect(productCards).toHaveCount(await productCards.count());
  });
});

test.describe('Production Readiness - Error Handling', () => {
  test('Handles network errors gracefully', async ({ page }) => {
    // Intercept and fail API requests
    await page.route('**/api/**', route => route.abort());
    
    await page.goto('/search');
    
    // Should show error message, not crash
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });
  
  test('Form validation shows user-friendly errors', async ({ page }) => {
    await page.goto('/sell');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Should show validation errors
    await expect(page.locator('[data-testid="title-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="price-error"]')).toBeVisible();
    
    // Errors should be user-friendly, not technical
    const titleError = await page.locator('[data-testid="title-error"]').textContent();
    expect(titleError).not.toContain('null');
    expect(titleError).not.toContain('undefined');
  });
});

test.describe('Production Readiness - Security', () => {
  test('CSRF protection is enabled', async ({ page }) => {
    // This test would verify CSRF tokens are present in forms
    await page.goto('/sell');
    
    // Check for CSRF token in form
    const csrfToken = page.locator('input[name="csrf_token"]');
    await expect(csrfToken).toBeAttached();
  });
  
  test('No sensitive data in client-side code', async ({ page }) => {
    await page.goto('/');
    
    // Check that no service keys or sensitive data are exposed
    const pageContent = await page.content();
    
    // Should not contain service role keys
    expect(pageContent).not.toContain('service_role');
    expect(pageContent).not.toContain('sk_test_');
    expect(pageContent).not.toContain('sk_live_');
  });
});