import { test, expect } from '@playwright/test';
import { seedTestProducts } from '../utils/test-helpers';

test.describe('Search and Browse', () => {
  test.beforeAll(async () => {
    // Seed database with test products
    await seedTestProducts();
  });

  test('should search products by keyword', async ({ page }) => {
    await page.goto('/');
    
    // Use search bar
    const searchInput = page.getByRole('searchbox', { name: 'Search' });
    await searchInput.fill('vintage jacket');
    await searchInput.press('Enter');
    
    // Should navigate to search results
    await expect(page).toHaveURL('/search?q=vintage+jacket');
    await expect(page.getByRole('heading', { name: /Search results for "vintage jacket"/ })).toBeVisible();
    
    // Results should be visible
    await expect(page.getByTestId('product-grid')).toBeVisible();
    const products = page.locator('[data-testid="product-card"]');
    await expect(products).toHaveCount(await products.count());
    
    // Each result should contain search terms
    const firstProduct = products.first();
    const title = await firstProduct.getByRole('heading').textContent();
    expect(title?.toLowerCase()).toContain('vintage');
  });

  test('should filter products by category', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to category
    await page.getByRole('link', { name: 'Women' }).click();
    await expect(page).toHaveURL('/category/women');
    
    // Subcategories should be visible
    await expect(page.getByRole('link', { name: 'Dresses' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Tops' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Bottoms' })).toBeVisible();
    
    // Click subcategory
    await page.getByRole('link', { name: 'Dresses' }).click();
    await expect(page).toHaveURL('/category/women/dresses');
    
    // Products should be filtered
    const products = page.locator('[data-testid="product-card"]');
    await expect(products.first()).toBeVisible();
  });

  test('should apply multiple filters', async ({ page }) => {
    await page.goto('/search');
    
    // Open filter panel
    await page.getByRole('button', { name: 'Filters' }).click();
    
    // Apply price filter
    await page.getByLabel('Min price').fill('20');
    await page.getByLabel('Max price').fill('100');
    
    // Apply size filter
    await page.getByRole('checkbox', { name: 'Size M' }).check();
    await page.getByRole('checkbox', { name: 'Size L' }).check();
    
    // Apply condition filter
    await page.getByRole('checkbox', { name: 'New with tags' }).check();
    await page.getByRole('checkbox', { name: 'Like new' }).check();
    
    // Apply brand filter
    await page.getByLabel('Brand').fill('Nike');
    await page.getByRole('option', { name: 'Nike' }).click();
    
    // Apply filters
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    
    // URL should contain filter parameters
    await expect(page).toHaveURL(/price_min=20/);
    await expect(page).toHaveURL(/price_max=100/);
    await expect(page).toHaveURL(/size=M,L/);
    
    // Active filters should be visible
    await expect(page.getByText('$20 - $100')).toBeVisible();
    await expect(page.getByText('Size: M, L')).toBeVisible();
    await expect(page.getByText('Nike')).toBeVisible();
    
    // Clear individual filter
    await page.getByRole('button', { name: 'Remove Nike filter' }).click();
    await expect(page.getByText('Nike')).not.toBeVisible();
  });

  test('should sort products', async ({ page }) => {
    await page.goto('/search?q=shoes');
    
    // Default sort should be relevance
    await expect(page.getByRole('combobox', { name: 'Sort by' })).toHaveValue('relevance');
    
    // Sort by price low to high
    await page.getByRole('combobox', { name: 'Sort by' }).selectOption('price_asc');
    await expect(page).toHaveURL(/sort=price_asc/);
    
    // Verify prices are in ascending order
    const prices = await page.locator('[data-testid="product-price"]').allTextContents();
    const numericPrices = prices.map(p => parseFloat(p.replace('$', '')));
    for (let i = 1; i < numericPrices.length; i++) {
      expect(numericPrices[i]).toBeGreaterThanOrEqual(numericPrices[i - 1]);
    }
    
    // Sort by newest first
    await page.getByRole('combobox', { name: 'Sort by' }).selectOption('newest');
    await expect(page).toHaveURL(/sort=newest/);
  });

  test('should handle pagination', async ({ page }) => {
    await page.goto('/search');
    
    // Check pagination controls
    await expect(page.getByRole('navigation', { name: 'Pagination' })).toBeVisible();
    await expect(page.getByText(/Showing \d+-\d+ of \d+ results/)).toBeVisible();
    
    // Go to next page
    await page.getByRole('link', { name: 'Next page' }).click();
    await expect(page).toHaveURL(/page=2/);
    
    // Previous button should now be enabled
    await expect(page.getByRole('link', { name: 'Previous page' })).toBeEnabled();
    
    // Go to specific page
    await page.getByRole('link', { name: 'Page 3' }).click();
    await expect(page).toHaveURL(/page=3/);
    
    // Load more button (infinite scroll alternative)
    await page.goto('/search?view=infinite');
    await page.getByRole('button', { name: 'Load more' }).click();
    
    // More products should be loaded
    const productCount = await page.locator('[data-testid="product-card"]').count();
    expect(productCount).toBeGreaterThan(20);
  });

  test('should show product quick view', async ({ page }) => {
    await page.goto('/search');
    
    // Hover over product to show quick actions
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.hover();
    
    // Quick view button should appear
    await firstProduct.getByRole('button', { name: 'Quick view' }).click();
    
    // Modal should open with product details
    const modal = page.getByRole('dialog', { name: 'Product quick view' });
    await expect(modal).toBeVisible();
    
    // Product details should be visible in modal
    await expect(modal.getByRole('heading')).toBeVisible();
    await expect(modal.getByText(/\$\d+\.?\d*/)).toBeVisible();
    await expect(modal.getByRole('button', { name: 'Add to Cart' })).toBeVisible();
    
    // Image gallery in modal
    const modalImages = modal.locator('[data-testid="quick-view-images"]');
    await expect(modalImages).toBeVisible();
    
    // Close modal
    await modal.getByRole('button', { name: 'Close' }).click();
    await expect(modal).not.toBeVisible();
  });

  test('should save and load search preferences', async ({ page }) => {
    await page.goto('/search');
    
    // Set view preference
    await page.getByRole('button', { name: 'Grid view' }).click();
    
    // Set items per page
    await page.getByRole('combobox', { name: 'Items per page' }).selectOption('48');
    
    // Apply filters
    await page.getByRole('button', { name: 'Filters' }).click();
    await page.getByRole('checkbox', { name: 'Free shipping' }).check();
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    
    // Save search
    await page.getByRole('button', { name: 'Save search' }).click();
    await page.getByLabel('Search name').fill('My Saved Search');
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Navigate away and come back
    await page.goto('/');
    await page.goto('/saved-searches');
    
    // Saved search should be listed
    await expect(page.getByText('My Saved Search')).toBeVisible();
    
    // Load saved search
    await page.getByRole('link', { name: 'My Saved Search' }).click();
    
    // Filters should be applied
    await expect(page.getByText('Free shipping')).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Items per page' })).toHaveValue('48');
  });

  test('should show search suggestions', async ({ page }) => {
    await page.goto('/');
    
    const searchInput = page.getByRole('searchbox', { name: 'Search' });
    
    // Start typing
    await searchInput.fill('dre');
    
    // Suggestions should appear
    const suggestions = page.getByRole('listbox', { name: 'Search suggestions' });
    await expect(suggestions).toBeVisible();
    
    // Suggestions should include categories and products
    await expect(suggestions.getByText('Dresses')).toBeVisible();
    await expect(suggestions.getByText('dress shirts')).toBeVisible();
    await expect(suggestions.getByText('maxi dress')).toBeVisible();
    
    // Recent searches section
    await expect(suggestions.getByText('Recent searches')).toBeVisible();
    
    // Popular searches section
    await expect(suggestions.getByText('Popular searches')).toBeVisible();
    
    // Click suggestion
    await suggestions.getByText('Dresses').click();
    await expect(page).toHaveURL('/category/women/dresses');
  });

  test('should handle no results gracefully', async ({ page }) => {
    await page.goto('/search?q=xyznonexistentproduct123');
    
    // No results message
    await expect(page.getByRole('heading', { name: 'No products found' })).toBeVisible();
    await expect(page.getByText('Try adjusting your filters or search terms')).toBeVisible();
    
    // Suggestions for user
    await expect(page.getByText('Suggestions:')).toBeVisible();
    await expect(page.getByText('Check your spelling')).toBeVisible();
    await expect(page.getByText('Try more general terms')).toBeVisible();
    await expect(page.getByText('Remove some filters')).toBeVisible();
    
    // Popular categories as alternative
    await expect(page.getByRole('heading', { name: 'Browse popular categories' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Women' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Men' })).toBeVisible();
  });
});

test.describe('Mobile Search and Browse', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should handle mobile filters', async ({ page }) => {
    await page.goto('/search');
    
    // Filter button should open drawer/modal
    await page.getByRole('button', { name: 'Filters' }).click();
    
    // Full screen filter panel
    const filterPanel = page.getByRole('dialog', { name: 'Filters' });
    await expect(filterPanel).toBeVisible();
    
    // Apply filters
    await filterPanel.getByLabel('Max price').fill('50');
    await filterPanel.getByRole('checkbox', { name: 'Size S' }).check();
    
    // Apply button should be sticky at bottom
    const applyButton = filterPanel.getByRole('button', { name: 'Apply Filters' });
    await expect(applyButton).toBeInViewport();
    await applyButton.click();
    
    // Filter count badge
    await expect(page.getByText('Filters (2)')).toBeVisible();
  });

  test('should handle mobile search with voice input', async ({ page, browserName }) => {
    // Skip for browsers that don't support voice input in tests
    test.skip(browserName === 'firefox', 'Voice input not supported in Firefox tests');
    
    await page.goto('/');
    
    const searchInput = page.getByRole('searchbox', { name: 'Search' });
    
    // Voice search button should be visible on mobile
    const voiceButton = page.getByRole('button', { name: 'Voice search' });
    await expect(voiceButton).toBeVisible();
    
    // Click voice button (would trigger microphone in real scenario)
    await voiceButton.click();
    
    // Mock permission dialog would appear
    // In real scenario, user would speak
    // For testing, we simulate the result
    await page.evaluate(() => {
      const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
      searchInput.value = 'red dress';
      searchInput.dispatchEvent(new Event('input'));
    });
    
    await searchInput.press('Enter');
    await expect(page).toHaveURL('/search?q=red+dress');
  });
});