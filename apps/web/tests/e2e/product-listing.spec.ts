import { test, expect } from '@playwright/test';
import { createTestUser, loginUser, createTestProduct, deleteTestProduct } from '../utils/test-helpers';

test.describe('Product Listing Flow', () => {
  let testEmail: string;
  let testPassword: string;
  let productId: string;

  test.beforeAll(async () => {
    // Create a test user for the entire suite
    testEmail = `seller-${Date.now()}@test.com`;
    testPassword = 'TestPassword123!';
    await createTestUser(testEmail, testPassword);
  });

  test.afterEach(async () => {
    // Clean up test product if created
    if (productId) {
      await deleteTestProduct(productId);
      productId = '';
    }
  });

  test('should complete full product listing flow', async ({ page }) => {
    // Login first
    await loginUser(page, testEmail, testPassword);
    
    // Navigate to sell page
    await page.getByRole('link', { name: 'Sell' }).click();
    await expect(page).toHaveURL('/sell');
    
    // Start new listing
    await page.getByRole('button', { name: 'List an item' }).click();
    await expect(page).toHaveURL('/sell/new');

    // Step 1: Basic Information
    await expect(page.getByRole('heading', { name: 'List your item' })).toBeVisible();
    
    // Fill product details
    await page.getByLabel('Title').fill('Vintage Designer Jacket');
    await page.getByLabel('Description').fill('Beautiful vintage jacket in excellent condition. Rarely worn, from smoke-free home.');
    
    // Select category
    await page.getByLabel('Category').selectOption('Outerwear');
    await page.getByLabel('Subcategory').selectOption('Jackets');
    
    // Set condition
    await page.getByRole('radio', { name: 'Like New' }).check();
    
    // Add brand and size
    await page.getByLabel('Brand').fill('Designer Brand');
    await page.getByLabel('Size').selectOption('M');
    
    // Set price
    await page.getByLabel('Price').fill('89.99');
    
    // Continue to photos
    await page.getByRole('button', { name: 'Continue to Photos' }).click();

    // Step 2: Upload Photos
    await expect(page.getByRole('heading', { name: 'Add photos' })).toBeVisible();
    
    // Upload test images
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles([
      'tests/fixtures/test-image-1.jpg',
      'tests/fixtures/test-image-2.jpg',
      'tests/fixtures/test-image-3.jpg'
    ]);
    
    // Wait for upload to complete
    await expect(page.getByText('3 photos uploaded')).toBeVisible();
    
    // Reorder photos (drag first to second position)
    const firstPhoto = page.locator('[data-photo-index="0"]');
    const secondPhoto = page.locator('[data-photo-index="1"]');
    await firstPhoto.dragTo(secondPhoto);
    
    // Continue to shipping
    await page.getByRole('button', { name: 'Continue to Shipping' }).click();

    // Step 3: Shipping Options
    await expect(page.getByRole('heading', { name: 'Shipping options' })).toBeVisible();
    
    // Select shipping method
    await page.getByRole('radio', { name: 'Standard Shipping' }).check();
    
    // Set shipping price
    await page.getByLabel('Shipping cost').fill('5.99');
    
    // Enable international shipping
    await page.getByLabel('Ship internationally').check();
    await page.getByLabel('International shipping cost').fill('15.99');
    
    // Continue to review
    await page.getByRole('button', { name: 'Review Listing' }).click();

    // Step 4: Review and Publish
    await expect(page.getByRole('heading', { name: 'Review your listing' })).toBeVisible();
    
    // Verify preview
    await expect(page.getByText('Vintage Designer Jacket')).toBeVisible();
    await expect(page.getByText('$89.99')).toBeVisible();
    await expect(page.getByText('Like New')).toBeVisible();
    
    // Publish listing
    await page.getByRole('button', { name: 'Publish Listing' }).click();
    
    // Wait for success and redirect
    await expect(page.getByText('Your item has been listed!')).toBeVisible();
    
    // Should redirect to product page
    await expect(page).toHaveURL(/\/product\/[\w-]+/);
    
    // Verify product is live
    await expect(page.getByRole('heading', { name: 'Vintage Designer Jacket' })).toBeVisible();
    await expect(page.getByText('$89.99')).toBeVisible();
    
    // Save product ID for cleanup
    productId = page.url().split('/product/')[1];
  });

  test('should handle draft saving', async ({ page }) => {
    await loginUser(page, testEmail, testPassword);
    await page.goto('/sell/new');
    
    // Fill partial information
    await page.getByLabel('Title').fill('Draft Product Test');
    await page.getByLabel('Description').fill('This is a draft');
    
    // Save as draft
    await page.getByRole('button', { name: 'Save Draft' }).click();
    
    // Should show success message
    await expect(page.getByText('Draft saved')).toBeVisible();
    
    // Navigate away and come back
    await page.goto('/dashboard');
    await page.goto('/sell/drafts');
    
    // Draft should be visible
    await expect(page.getByText('Draft Product Test')).toBeVisible();
    
    // Resume editing
    await page.getByRole('button', { name: 'Continue Editing' }).click();
    
    // Fields should be populated
    await expect(page.getByLabel('Title')).toHaveValue('Draft Product Test');
    await expect(page.getByLabel('Description')).toHaveValue('This is a draft');
  });

  test('should validate required fields', async ({ page }) => {
    await loginUser(page, testEmail, testPassword);
    await page.goto('/sell/new');
    
    // Try to continue without filling required fields
    await page.getByRole('button', { name: 'Continue to Photos' }).click();
    
    // Should show validation errors
    await expect(page.getByText('Title is required')).toBeVisible();
    await expect(page.getByText('Description is required')).toBeVisible();
    await expect(page.getByText('Category is required')).toBeVisible();
    await expect(page.getByText('Price is required')).toBeVisible();
    
    // Fill minimum required fields
    await page.getByLabel('Title').fill('Test Product');
    await page.getByLabel('Description').fill('Test description');
    await page.getByLabel('Category').selectOption('Clothing');
    await page.getByLabel('Price').fill('10');
    
    // Should now allow continuing
    await page.getByRole('button', { name: 'Continue to Photos' }).click();
    await expect(page.getByRole('heading', { name: 'Add photos' })).toBeVisible();
  });

  test('should handle photo upload errors', async ({ page }) => {
    await loginUser(page, testEmail, testPassword);
    await page.goto('/sell/new');
    
    // Fill basic info
    await page.getByLabel('Title').fill('Photo Test Product');
    await page.getByLabel('Description').fill('Testing photo uploads');
    await page.getByLabel('Category').selectOption('Clothing');
    await page.getByLabel('Price').fill('20');
    await page.getByRole('button', { name: 'Continue to Photos' }).click();
    
    // Try to upload invalid file type
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/document.pdf');
    
    // Should show error
    await expect(page.getByText('Only image files are allowed')).toBeVisible();
    
    // Try to upload oversized image (mock)
    await fileInput.setInputFiles('tests/fixtures/large-image.jpg');
    await expect(page.getByText('Image size must be less than 10MB')).toBeVisible();
  });

  test('should calculate and display fees', async ({ page }) => {
    await loginUser(page, testEmail, testPassword);
    await page.goto('/sell/new');
    
    // Fill product details with specific price
    await page.getByLabel('Title').fill('Fee Test Product');
    await page.getByLabel('Description').fill('Testing fee calculation');
    await page.getByLabel('Category').selectOption('Clothing');
    await page.getByLabel('Price').fill('100');
    
    // Fee breakdown should be visible
    await expect(page.getByText('Listing price: $100.00')).toBeVisible();
    await expect(page.getByText(/Platform fee.*\$10\.00/)).toBeVisible(); // 10% fee
    await expect(page.getByText(/Payment processing.*\$3\.20/)).toBeVisible(); // 2.9% + $0.30
    await expect(page.getByText(/You'll receive.*\$86\.80/)).toBeVisible();
    
    // Change price and verify fee update
    await page.getByLabel('Price').fill('50');
    await expect(page.getByText(/You'll receive.*\$43\.65/)).toBeVisible();
  });

  test('should handle category-specific fields', async ({ page }) => {
    await loginUser(page, testEmail, testPassword);
    await page.goto('/sell/new');
    
    // Select shoes category
    await page.getByLabel('Category').selectOption('Shoes');
    
    // Shoe-specific fields should appear
    await expect(page.getByLabel('Shoe Size')).toBeVisible();
    await expect(page.getByLabel('Shoe Type')).toBeVisible();
    
    // Fill shoe-specific fields
    await page.getByLabel('Shoe Size').selectOption('US 9');
    await page.getByLabel('Shoe Type').selectOption('Sneakers');
    
    // Switch to clothing category
    await page.getByLabel('Category').selectOption('Clothing');
    
    // Shoe fields should disappear, clothing fields appear
    await expect(page.getByLabel('Shoe Size')).not.toBeVisible();
    await expect(page.getByLabel('Size')).toBeVisible();
    await expect(page.getByLabel('Fit')).toBeVisible();
  });
});

test.describe('Mobile Product Listing', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should handle mobile listing flow', async ({ page }) => {
    const testEmail = `mobile-seller-${Date.now()}@test.com`;
    await createTestUser(testEmail, 'TestPassword123!');
    await loginUser(page, testEmail, 'TestPassword123!');
    
    // Navigate to sell page on mobile
    await page.getByRole('button', { name: 'Menu' }).click();
    await page.getByRole('link', { name: 'Sell' }).click();
    
    // Start new listing
    await page.getByRole('button', { name: 'List an item' }).click();
    
    // Mobile-optimized form should be visible
    await expect(page.getByRole('heading', { name: 'List your item' })).toBeVisible();
    
    // Fill basic info
    await page.getByLabel('Title').fill('Mobile Test Product');
    await page.getByLabel('Description').fill('Listed from mobile');
    await page.getByLabel('Category').selectOption('Clothing');
    await page.getByLabel('Price').fill('25');
    
    // Mobile photo upload (camera option should be available)
    await page.getByRole('button', { name: 'Continue to Photos' }).click();
    const fileInput = page.locator('input[type="file"]');
    
    // Check for camera capture attribute on mobile
    await expect(fileInput).toHaveAttribute('accept', 'image/*');
    await expect(fileInput).toHaveAttribute('capture', 'environment');
  });
});