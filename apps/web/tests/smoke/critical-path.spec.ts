import { test, expect } from '@playwright/test';
import { testUsers, testProducts } from '../fixtures/test-data';
import DriploTestHelpers from '../fixtures/test-helpers';

test.describe('Smoke Tests - Critical Path', () => {
  let helpers: DriploTestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new DriploTestHelpers({ 
      page, 
      baseURL: 'http://localhost:5173' 
    });
  });

  test('Homepage loads and displays core elements', async ({ page }) => {
    await helpers.navigateTo('/');
    
    // Check critical elements exist
    await expect(page.locator('[data-testid="header"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-bar"]')).toBeVisible();
    await expect(page.locator('[data-testid="featured-products"]')).toBeVisible();
    await expect(page.locator('[data-testid="footer"]')).toBeVisible();
    
    // Check no console errors
    const errors = await helpers.checkConsoleErrors();
    expect(errors.length).toBe(0);
    
    await helpers.takeScreenshot('homepage-critical.png');
  });

  test('Authentication flow works end-to-end', async ({ page }) => {
    // Test signup flow
    await helpers.navigateTo('/signup');
    
    const testEmail = `smoke-test-${Date.now()}@example.com`;
    await helpers.fillForm({
      email: testEmail,
      password: 'SmokeTest123!',
      'confirm password': 'SmokeTest123!'
    });
    
    await helpers.clickButton('Sign up');
    
    // Should show verification message
    await expect(page.getByText(/check your email|verify/i)).toBeVisible();
    
    // Test login with existing user
    await helpers.navigateTo('/login');
    await helpers.fillForm({
      email: testUsers.buyer.email,
      password: testUsers.buyer.password
    });
    
    await helpers.clickButton('Log in');
    
    // Should redirect to dashboard
    await helpers.waitForNavigation();
    expect(page.url()).toMatch(/dashboard|\/$/);
    
    // User menu should be visible
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    
    await helpers.takeScreenshot('authenticated-state.png');
    
    // Test logout
    await helpers.clickButton('User menu');
    await helpers.clickButton('Log out');
    
    // Should redirect to home
    await helpers.waitForNavigation();
    expect(page.url()).toMatch(/\/$/);
    await expect(page.getByRole('link', { name: /log in/i })).toBeVisible();
  });

  test('Search functionality works', async ({ page }) => {
    await helpers.navigateTo('/');
    
    // Test search
    await helpers.searchFor('handbag');
    
    // Should show search results
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-card"]')).toHaveCount(expect.any(Number));
    
    // Search query should be visible
    const searchInput = page.locator('[data-testid="search-input"]');
    await expect(searchInput).toHaveValue('handbag');
    
    await helpers.takeScreenshot('search-results-critical.png');
    
    // Test empty search
    await helpers.searchFor('xyzunknownproduct123');
    await expect(page.getByText(/no results|nothing found/i)).toBeVisible();
  });

  test('Product view displays correctly', async ({ page }) => {
    await helpers.navigateTo('/');
    
    // Click on first product
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.click();
    
    await helpers.waitForNavigation();
    
    // Check product details elements
    await expect(page.locator('[data-testid="product-gallery"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-price"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-description"]')).toBeVisible();
    await expect(page.locator('[data-testid="seller-card"]')).toBeVisible();
    
    // Check action buttons
    await expect(page.locator('[data-testid="buy-now-btn"]').or(page.locator('[data-testid="contact-seller-btn"]'))).toBeVisible();
    await expect(page.locator('[data-testid="favorite-btn"]')).toBeVisible();
    
    await helpers.takeScreenshot('product-details-critical.png');
  });

  test('Add to favorites works', async ({ page }) => {
    // Login first
    await helpers.loginAs('buyer');
    
    // Navigate to homepage
    await helpers.navigateTo('/');
    
    // Find favorite button and click it
    const favoriteBtn = page.locator('[data-testid="favorite-btn"]').first();
    await favoriteBtn.click();
    
    // Button should show active state
    await expect(favoriteBtn).toHaveClass(/active|filled|favorited/);
    
    // Navigate to favorites page
    await helpers.navigateTo('/favorites');
    
    // Should show at least one favorited item
    await expect(page.locator('[data-testid="favorite-item"]')).toHaveCount(expect.any(Number));
    
    await helpers.takeScreenshot('favorites-critical.png');
  });

  test('Listing creation flow works', async ({ page }) => {
    // Login as seller
    await helpers.loginAs('seller');
    
    // Navigate to sell page
    await helpers.navigateTo('/sell');
    
    // Fill out listing form
    const testProduct = testProducts[0];
    await helpers.fillForm({
      title: testProduct.title,
      description: testProduct.description,
      price: testProduct.price.toString()
    });
    
    // Select category
    await helpers.selectOption('category', testProduct.category);
    
    // Select brand
    await helpers.selectOption('brand', testProduct.brand);
    
    // Select size
    await helpers.selectOption('size', testProduct.size);
    
    // Select condition
    await helpers.selectOption('condition', testProduct.condition);
    
    await helpers.takeScreenshot('listing-form-filled.png');
    
    // Submit form
    await helpers.clickButton('Create Listing');
    
    // Should redirect to dashboard or listing page
    await helpers.waitForNavigation();
    expect(page.url()).toMatch(/dashboard|product|listings/);
    
    // Should show success message
    await expect(page.getByText(/listing created|published/i)).toBeVisible();
  });

  test('Basic checkout flow works', async ({ page }) => {
    // Login as buyer
    await helpers.loginAs('buyer');
    
    // Find a product to buy
    await helpers.navigateTo('/');
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.click();
    
    await helpers.waitForNavigation();
    
    // Click buy now
    await helpers.clickButton('Buy Now');
    
    await helpers.waitForNavigation();
    
    // Should be on checkout page
    expect(page.url()).toMatch(/checkout/);
    
    // Check checkout elements
    await expect(page.locator('[data-testid="order-summary"]')).toBeVisible();
    await expect(page.locator('[data-testid="shipping-form"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-section"]')).toBeVisible();
    
    await helpers.takeScreenshot('checkout-critical.png');
    
    // Fill shipping address (don't complete payment in smoke test)
    await helpers.fillCheckoutForm({
      firstName: 'Test',
      lastName: 'Buyer',
      street: 'Test Street 123',
      city: 'Sofia',
      postalCode: '1000',
      phone: '+359888123456'
    });
    
    await helpers.takeScreenshot('checkout-address-filled.png');
  });

  test('Navigation works across key pages', async ({ page }) => {
    const criticalPages = [
      { path: '/', name: 'homepage' },
      { path: '/search', name: 'search' },
      { path: '/login', name: 'login' },
      { path: '/signup', name: 'signup' }
    ];
    
    for (const pageInfo of criticalPages) {
      await helpers.navigateTo(pageInfo.path);
      
      // Check page loads without errors
      const errors = await helpers.checkConsoleErrors();
      expect(errors.length).toBe(0);
      
      // Check page has basic structure
      await expect(page.locator('main, [role="main"], .main-content')).toBeVisible();
      
      await helpers.takeScreenshot(`navigation-${pageInfo.name}.png`);
    }
  });

  test('Mobile responsiveness works', async ({ page }) => {
    // Test mobile viewport
    await helpers.setMobileViewport();
    
    await helpers.navigateTo('/');
    
    // Check mobile navigation
    await expect(page.locator('[data-testid="mobile-nav"]').or(page.locator('[data-testid="bottom-nav"]'))).toBeVisible();
    
    // Check responsive layout
    await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
    
    await helpers.takeScreenshot('mobile-homepage.png');
    
    // Test desktop viewport
    await helpers.setDesktopViewport();
    
    await helpers.navigateTo('/');
    
    // Check desktop navigation
    await expect(page.locator('[data-testid="header-nav"]')).toBeVisible();
    
    await helpers.takeScreenshot('desktop-homepage.png');
  });

  test('Performance baseline check', async ({ page }) => {
    await helpers.navigateTo('/');
    
    // Get basic performance metrics
    const metrics = await helpers.getPerformanceMetrics();
    
    // Basic performance assertions
    expect(metrics.loadTime).toBeLessThan(5000); // 5 seconds max
    expect(metrics.ttfb).toBeLessThan(1000); // 1 second TTFB max
    
    console.log('Performance metrics:', metrics);
  });

  test.afterEach(async ({ page }) => {
    // Clean up any test data if needed
    await helpers.clearStorage();
  });
});