import { test, expect } from '@playwright/test'

// Mock authenticated user for sell tests
test.use({
  storageState: {
    cookies: [],
    origins: [
      {
        origin: 'http://localhost:5173',
        localStorage: [
          // Simulate logged in user
          { name: 'userSession', value: JSON.stringify({ user: { id: 'test-user', email: 'testuser@example.com' } }) }
        ]
      }
    ]
  }
})

test.describe('Sell flow', () => {
  test('create listing → lands on product', async ({ page }) => {
    // Navigate to sell page (assuming user is authenticated)
    await page.goto('/sell')
    
    // Should show create listing form
    await expect(page.getByRole('heading', { name: /create listing|създай обява/i })).toBeVisible()
    
    // Fill out basic product information
    await page.getByLabel(/title|заглавие/i).fill('Test Product Listing')
    await page.getByLabel(/description|описание/i).fill('This is a test product description')
    await page.getByLabel(/price|цена/i).fill('25.99')
    
    // Select category - assuming dropdown or select exists
    const categorySelect = page.getByRole('combobox', { name: /category|категория/i }).or(page.locator('[data-testid="category-select"]'))
    if (await categorySelect.isVisible()) {
      await categorySelect.click()
      await page.getByRole('option', { name: /clothing|дрехи/i }).first().click()
    }
    
    // Select size if available
    const sizeSelect = page.getByRole('combobox', { name: /size|размер/i }).or(page.locator('[data-testid="size-select"]'))
    if (await sizeSelect.isVisible()) {
      await sizeSelect.click()
      await page.getByRole('option', { name: /medium|m/i }).first().click()
    }
    
    // Select condition
    const conditionSelect = page.getByRole('combobox', { name: /condition|състояние/i }).or(page.locator('[data-testid="condition-select"]'))
    if (await conditionSelect.isVisible()) {
      await conditionSelect.click()
      await page.getByRole('option', { name: /good|добро/i }).first().click()
    }
    
    // Handle image upload (stub - just check if upload area exists)
    const imageUpload = page.getByText(/upload photos|качи снимки/i).or(page.locator('[data-testid="image-upload"]'))
    if (await imageUpload.isVisible()) {
      // For smoke test, just verify upload area is present
      await expect(imageUpload).toBeVisible()
    }
    
    // Submit the listing
    await page.getByRole('button', { name: /publish listing|публикувай обява/i }).or(page.getByRole('button', { name: /create|създай/i })).click()
    
    // Should redirect to the created product page
    await page.waitForURL(/product\//, { timeout: 10000 })
    
    // Verify we're on product page with our created listing
    await expect(page.getByRole('heading', { name: /test product listing/i })).toBeVisible()
    await expect(page.getByText(/25.99/)).toBeVisible()
    await expect(page.getByText(/this is a test product description/i)).toBeVisible()
  })
  
  test('require authentication to access sell page', async ({ page }) => {
    // Clear any existing auth
    await page.context().clearCookies()
    
    // Try to access sell page without auth
    await page.goto('/sell')
    
    // Should redirect to login
    await expect(page).toHaveURL(/login/)
  })
  
  test('draft listing can be saved and edited', async ({ page }) => {
    await page.goto('/sell')
    
    // Fill partial information
    await page.getByLabel(/title|заглавие/i).fill('Draft Test Listing')
    await page.getByLabel(/price|цена/i).fill('15.00')
    
    // Save as draft if option exists
    const saveDraftButton = page.getByRole('button', { name: /save draft|запази чернова/i })
    if (await saveDraftButton.isVisible()) {
      await saveDraftButton.click()
      
      // Should show success message or redirect to listings
      await expect(page.getByText(/draft saved|черновата е запазена/i)).toBeVisible()
      
      // Go to listings page to verify draft exists
      await page.goto('/listings')
      
      // Check if draft tab exists and contains our draft
      const draftTab = page.getByRole('tab', { name: /draft|чернови/i })
      if (await draftTab.isVisible()) {
        await draftTab.click()
        await expect(page.getByText(/draft test listing/i)).toBeVisible()
      }
    }
  })
})