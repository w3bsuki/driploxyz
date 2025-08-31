import { test, expect } from '@playwright/test'

test.describe('Search flow', () => {
  test('search query + filter + load more', async ({ page }) => {
    // Go to homepage
    await page.goto('/')
    
    // Find and interact with search bar
    const searchInput = page.getByRole('textbox', { name: /search|търсене/i }).or(page.getByPlaceholder(/search|търсене/i))
    await expect(searchInput).toBeVisible()
    
    // Perform search
    await searchInput.fill('dress')
    await searchInput.press('Enter')
    
    // Should navigate to search page
    await expect(page).toHaveURL(/search/)
    await expect(page).toHaveURL(/q=dress/)
    
    // Check if search results are displayed
    await expect(page.getByText(/results|резултата/i)).toBeVisible()
    
    // Check if products are displayed
    await expect(page.locator('[data-testid="product-card"]').or(page.locator('.product-card')).first()).toBeVisible()
    
    // Test filtering - look for category or price filters
    const categoryFilter = page.getByRole('button', { name: /category|категория/i }).or(page.locator('[data-filter="category"]'))
    if (await categoryFilter.isVisible()) {
      await categoryFilter.click()
      // Select a category option
      await page.getByRole('option', { name: /clothing|дрехи/i }).first().click()
      
      // Wait for results to update
      await page.waitForLoadState('networkidle')
      
      // Check if URL updated with filter
      await expect(page).toHaveURL(/category/)
    }
    
    // Test load more functionality
    const loadMoreButton = page.getByRole('button', { name: /load more|покажи още/i })
    if (await loadMoreButton.isVisible()) {
      const initialProductCount = await page.locator('[data-testid="product-card"]').or(page.locator('.product-card')).count()
      
      await loadMoreButton.click()
      await page.waitForLoadState('networkidle')
      
      // Check if more products loaded
      const newProductCount = await page.locator('[data-testid="product-card"]').or(page.locator('.product-card')).count()
      expect(newProductCount).toBeGreaterThan(initialProductCount)
    }
  })
  
  test('empty search shows appropriate message', async ({ page }) => {
    await page.goto('/search?q=xyznonexistentproduct123')
    
    // Should show no results message
    await expect(page.getByText(/no results|няма резултати/i).or(page.getByText(/no products found|не са намерени продукти/i))).toBeVisible()
  })
  
  test('search from homepage', async ({ page }) => {
    await page.goto('/')
    
    // Use hero search or main search bar
    const searchInput = page.getByRole('textbox', { name: /search|търсене/i }).or(page.getByPlaceholder(/search|търсене/i)).first()
    await searchInput.fill('shoes')
    
    // Submit search (either Enter or search button)
    const searchButton = page.getByRole('button', { name: /search|търсене/i })
    if (await searchButton.isVisible()) {
      await searchButton.click()
    } else {
      await searchInput.press('Enter')
    }
    
    // Should navigate to search page with query
    await expect(page).toHaveURL(/search/)
    await expect(page).toHaveURL(/q=shoes/)
  })
})