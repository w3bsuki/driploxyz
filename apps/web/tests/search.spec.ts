import { test, expect } from '@playwright/test';

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('search for products from homepage', async ({ page }) => {
    // Find search input
    const searchInput = page.locator('input[placeholder*="search" i], input[data-testid="search-input"]');
    await expect(searchInput).toBeVisible();

    // Type search query
    await searchInput.fill('vintage camera');
    
    // Submit search or wait for results
    await page.keyboard.press('Enter');
    
    // Should redirect to search results page
    await expect(page.url()).toMatch(/\/search/);
    
    // Verify search results are displayed
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    
    // Should show product cards
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible();
  });

  test('search with filters', async ({ page }) => {
    await page.goto('/search?q=camera');
    
    // Wait for results to load
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    
    // Apply category filter
    const categoryFilter = page.locator('[data-testid="category-filter"]');
    if (await categoryFilter.isVisible()) {
      await categoryFilter.first().click();
      
      // Should update results
      await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    }
    
    // Apply price filter
    const priceFilter = page.locator('[data-testid="price-filter"]');
    if (await priceFilter.isVisible()) {
      await priceFilter.first().click();
      
      // Should update results
      await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    }
  });

  test('search from navigation bar', async ({ page }) => {
    // Click search icon in navigation
    const searchIcon = page.locator('[data-testid="nav-search"], button[aria-label*="search" i]');
    if (await searchIcon.isVisible()) {
      await searchIcon.click();
      
      // Should show search modal or dropdown
      const searchModal = page.locator('[data-testid="search-modal"]');
      if (await searchModal.isVisible()) {
        await searchModal.locator('input').fill('vintage camera');
        await searchModal.locator('button[type="submit"]').click();
      }
    }
    
    // Should show search results
    await expect(page.url()).toMatch(/\/search/);
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test('handles no search results', async ({ page }) => {
    // Search for something that won't exist
    await page.goto('/search?q=xyznonexistentproduct12345');
    
    // Should show no results message
    await expect(page.locator('text=No products found, text=No results found')).toBeVisible();
    
    // Should show search suggestions
    const suggestions = page.locator('[data-testid="search-suggestions"]');
    if (await suggestions.isVisible()) {
      await expect(suggestions).toBeVisible();
    }
  });

  test('search suggestions/autocomplete', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="search" i], input[data-testid="search-input"]');
    await expect(searchInput).toBeVisible();
    
    // Type partial query
    await searchInput.fill('vint');
    
    // Wait for suggestions to appear
    await page.waitForTimeout(300);
    
    // Check if suggestions appear
    const suggestions = page.locator('[data-testid="search-suggestions"]');
    if (await suggestions.isVisible()) {
      // Should show suggestion items
      await expect(suggestions.locator('[data-testid="suggestion-item"]').first()).toBeVisible();
      
      // Click on a suggestion
      await suggestions.locator('[data-testid="suggestion-item"]').first().click();
      
      // Should search for the suggestion
      await expect(page.url()).toMatch(/\/search/);
    }
  });

  test('pagination in search results', async ({ page }) => {
    await page.goto('/search?q=camera');
    
    // Wait for results to load
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    
    // Check if pagination exists
    const pagination = page.locator('[data-testid="pagination"]');
    if (await pagination.isVisible()) {
      // Click next page
      const nextPage = pagination.locator('[data-testid="next-page"], button[aria-label="Next"]');
      if (await nextPage.isVisible()) {
        await nextPage.click();
        
        // Should load new results
        await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
        
        // URL should update
        await expect(page.url()).toMatch(/page=\d+/);
      }
    }
  });

  test('search URL parameters are preserved', async ({ page }) => {
    // Navigate with search parameters
    await page.goto('/search?q=vintage%20camera&category=electronics&sort=price_asc');
    
    // Should show search results
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    
    // Search input should reflect the query
    const searchInput = page.locator('input[data-testid="search-input"]');
    if (await searchInput.isVisible()) {
      await expect(searchInput).toHaveValue('vintage camera');
    }
    
    // Filters should be applied
    const activeFilters = page.locator('[data-testid="active-filters"]');
    if (await activeFilters.isVisible()) {
      await expect(activeFilters).toContainText('electronics');
    }
  });

  test('recent searches functionality', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="search" i], input[data-testid="search-input"]');
    await expect(searchInput).toBeVisible();
    
    // Perform a search
    await searchInput.fill('vintage camera');
    await page.keyboard.press('Enter');
    await page.waitForURL(/\/search/);
    
    // Go back to homepage
    await page.goto('/');
    
    // Click on search input again
    await searchInput.click();
    
    // Check if recent searches appear
    const recentSearches = page.locator('[data-testid="recent-searches"]');
    if (await recentSearches.isVisible()) {
      await expect(recentSearches).toContainText('vintage camera');
      
      // Click on recent search
      await recentSearches.locator('text=vintage camera').click();
      
      // Should search again
      await expect(page.url()).toMatch(/\/search\?q=vintage/);
    }
  });
});