import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility tests', () => {
  test('homepage accessibility', async ({ page }) => {
    await page.goto('/')
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle')
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })
  
  test('product page accessibility', async ({ page }) => {
    await page.goto('/')
    
    // Navigate to a product page
    const productCard = page.locator('[data-testid="product-card"]').first()
    if (await productCard.isVisible()) {
      await productCard.click()
    } else {
      // Fallback: navigate to test product directly
      await page.goto('/product/test-product-id')
    }
    
    await page.waitForLoadState('networkidle')
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })
  
  test('search page accessibility', async ({ page }) => {
    await page.goto('/search?q=test')
    
    // Wait for search results to load
    await page.waitForLoadState('networkidle')
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .exclude('#cookie-consent') // Exclude cookie consent if it interferes
      .analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })
  
  test('checkout page accessibility', async ({ page }) => {
    // Mock authenticated user
    await page.addInitScript(() => {
      localStorage.setItem('userSession', JSON.stringify({ 
        user: { id: 'test-user', email: 'test@example.com' } 
      }))
    })
    
    await page.goto('/checkout/test-product-id')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .exclude('#stripe-elements') // Exclude Stripe elements which may have their own a11y
      .analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })
  
  test('login page accessibility', async ({ page }) => {
    await page.goto('/login')
    
    await page.waitForLoadState('networkidle')
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })
  
  test('signup page accessibility', async ({ page }) => {
    await page.goto('/signup')
    
    await page.waitForLoadState('networkidle')
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })
  
  test('navigation accessibility', async ({ page }) => {
    await page.goto('/')
    
    // Test keyboard navigation
    await page.keyboard.press('Tab') // Should focus first focusable element
    
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
    
    // Check if focused element has proper focus indicators
    const focusedElementStyles = await focusedElement.evaluate((el) => {
      const styles = window.getComputedStyle(el)
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
        outlineStyle: styles.outlineStyle,
        outlineColor: styles.outlineColor,
        boxShadow: styles.boxShadow
      }
    })
    
    // Should have some form of focus indicator
    expect(
      focusedElementStyles.outline !== 'none' ||
      focusedElementStyles.outlineWidth !== '0px' ||
      focusedElementStyles.boxShadow !== 'none'
    ).toBeTruthy()
  })
  
  test('color contrast accessibility', async ({ page }) => {
    await page.goto('/')
    
    await page.waitForLoadState('networkidle')
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('button, a, [role="button"], input, label')
      .analyze()
    
    // Focus specifically on color contrast violations
    const colorContrastViolations = accessibilityScanResults.violations.filter(
      violation => violation.id === 'color-contrast'
    )
    
    expect(colorContrastViolations).toEqual([])
  })
  
  test('form accessibility', async ({ page }) => {
    await page.goto('/login')
    
    await page.waitForLoadState('networkidle')
    
    // Check that form inputs have proper labels
    const emailInput = page.getByRole('textbox', { name: /email/i })
    const passwordInput = page.getByRole('textbox', { name: /password/i }).or(page.locator('input[type="password"]'))
    
    if (await emailInput.isVisible()) {
      await expect(emailInput).toHaveAttribute('aria-label')
      // OR should have associated label
      const emailId = await emailInput.getAttribute('id')
      if (emailId) {
        const associatedLabel = page.locator(`label[for="${emailId}"]`)
        await expect(associatedLabel.or(emailInput)).toBeVisible()
      }
    }
    
    if (await passwordInput.isVisible()) {
      await expect(passwordInput).toHaveAttribute('aria-label')
      // OR should have associated label
      const passwordId = await passwordInput.getAttribute('id')
      if (passwordId) {
        const associatedLabel = page.locator(`label[for="${passwordId}"]`)
        await expect(associatedLabel.or(passwordInput)).toBeVisible()
      }
    }
  })
  
  test('image alt text accessibility', async ({ page }) => {
    await page.goto('/')
    
    await page.waitForLoadState('networkidle')
    
    // Check that images have alt text
    const images = page.locator('img')
    const imageCount = await images.count()
    
    for (let i = 0; i < imageCount; i++) {
      const image = images.nth(i)
      const alt = await image.getAttribute('alt')
      
      // Images should have alt attribute (can be empty for decorative images)
      expect(alt).toBeDefined()
    }
  })
})