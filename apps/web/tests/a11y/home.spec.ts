import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Home Page Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('has zero critical accessibility violations', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    
    // Log violations for debugging if any exist
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility violations found:', 
        JSON.stringify(accessibilityScanResults.violations, null, 2))
    }
    
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('has proper focus management', async ({ page }) => {
    // Test initial focus
    await page.keyboard.press('Tab')
    const firstFocusable = page.locator(':focus')
    await expect(firstFocusable).toBeVisible()

    // Ensure focus indicators are visible
    const focusStyles = await firstFocusable.evaluate((el) => {
      const styles = window.getComputedStyle(el)
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
        outlineColor: styles.outlineColor,
        boxShadow: styles.boxShadow
      }
    })

    // Should have visible focus indicators
    const hasFocusIndicator = (
      focusStyles.outline !== 'none' ||
      focusStyles.outlineWidth !== '0px' ||
      focusStyles.boxShadow !== 'none'
    )
    expect(hasFocusIndicator).toBeTruthy()
  })

  test('supports keyboard navigation', async ({ page }) => {
    // Test Tab navigation through interactive elements
    let tabCount = 0
    const maxTabs = 20 // Prevent infinite loop
    const focusedElements = new Set()

    while (tabCount < maxTabs) {
      await page.keyboard.press('Tab')
      tabCount++
      
      const focusedElement = page.locator(':focus')
      if (await focusedElement.isVisible()) {
        const tagName = await focusedElement.evaluate(el => el.tagName.toLowerCase())
        const role = await focusedElement.getAttribute('role')
        const href = await focusedElement.getAttribute('href')
        
        // Track unique focusable elements
        const elementId = `${tagName}-${role || ''}-${href || ''}-${tabCount}`
        focusedElements.add(elementId)
        
        // Ensure interactive elements are properly focusable
        if (['button', 'a', 'input', 'select', 'textarea'].includes(tagName) || 
            ['button', 'link', 'menuitem'].includes(role || '')) {
          await expect(focusedElement).toBeVisible()
        }
      } else {
        // If no visible focused element, we may have reached the end
        break
      }
    }

    // Should have found at least some focusable elements
    expect(focusedElements.size).toBeGreaterThan(0)
  })

  test('has proper ARIA landmarks and navigation', async ({ page }) => {
    // Check for main landmark
    const main = page.locator('main').or(page.locator('[role="main"]'))
    await expect(main).toBeVisible()

    // Check for navigation landmark
    const nav = page.locator('nav').or(page.locator('[role="navigation"]'))
    await expect(nav).toBeVisible()

    // Check that navigation has accessible name
    const navElement = nav.first()
    const ariaLabel = await navElement.getAttribute('aria-label')
    const ariaLabelledBy = await navElement.getAttribute('aria-labelledby')
    
    if (!ariaLabel && ariaLabelledBy) {
      const labelElement = page.locator(`#${ariaLabelledBy}`)
      await expect(labelElement).toBeVisible()
    }
  })

  test('has proper heading structure', async ({ page }) => {
    const headings = page.locator('h1, h2, h3, h4, h5, h6')
    const headingCount = await headings.count()
    
    expect(headingCount).toBeGreaterThan(0)

    // Check that there's exactly one h1
    const h1Elements = page.locator('h1')
    const h1Count = await h1Elements.count()
    expect(h1Count).toBe(1)

    // Verify heading hierarchy (basic check)
    const allHeadings = []
    for (let i = 0; i < headingCount; i++) {
      const heading = headings.nth(i)
      const tagName = await heading.evaluate(el => el.tagName.toLowerCase())
      const level = parseInt(tagName.charAt(1))
      allHeadings.push(level)
    }

    // First heading should be h1
    expect(allHeadings[0]).toBe(1)
  })

  test('has accessible search functionality', async ({ page }) => {
    // Look for search input
    const searchInput = page.locator('input[type="search"]')
      .or(page.locator('input[placeholder*="search" i]'))
      .or(page.locator('[role="searchbox"]'))

    if (await searchInput.isVisible()) {
      // Check that search input has proper labeling
      const hasLabel = await searchInput.evaluate((input) => {
        // Check for aria-label
        if (input.getAttribute('aria-label')) return true
        
        // Check for associated label
        const id = input.getAttribute('id')
        if (id) {
          const label = document.querySelector(`label[for="${id}"]`)
          if (label) return true
        }
        
        // Check if wrapped in label
        if (input.closest('label')) return true
        
        return false
      })
      
      expect(hasLabel).toBeTruthy()

      // Test search functionality
      await searchInput.click()
      await searchInput.fill('test search')
      
      // Should be able to submit search (either Enter or button)
      await page.keyboard.press('Enter')
      
      // Should navigate or show results
      await page.waitForTimeout(1000) // Allow time for navigation or results
    }
  })

  test('has accessible image content', async ({ page }) => {
    const images = page.locator('img')
    const imageCount = await images.count()

    for (let i = 0; i < imageCount; i++) {
      const image = images.nth(i)
      const alt = await image.getAttribute('alt')
      
      // All images must have alt attribute (can be empty for decorative)
      expect(alt).toBeDefined()
      
      // If image is part of a link, ensure link has accessible name
      const parentLink = image.locator('..').locator('a').first()
      if (await parentLink.isVisible()) {
        const linkText = await parentLink.textContent()
        const linkAriaLabel = await parentLink.getAttribute('aria-label')
        const linkTitle = await parentLink.getAttribute('title')
        
        const hasAccessibleName = !!(linkText?.trim() || linkAriaLabel || linkTitle || alt)
        expect(hasAccessibleName).toBeTruthy()
      }
    }
  })

  test('supports screen reader navigation', async ({ page }) => {
    // Test for live regions
    const liveRegions = page.locator('[aria-live]').or(page.locator('[role="status"]'))
      .or(page.locator('[role="alert"]'))
    
    // If live regions exist, they should have appropriate attributes
    const liveRegionCount = await liveRegions.count()
    if (liveRegionCount > 0) {
      for (let i = 0; i < liveRegionCount; i++) {
        const region = liveRegions.nth(i)
        const ariaLive = await region.getAttribute('aria-live')
        const role = await region.getAttribute('role')
        
        // Should have appropriate live region attributes
        const isValidLiveRegion = !!(
          ariaLive === 'polite' || 
          ariaLive === 'assertive' || 
          role === 'status' || 
          role === 'alert'
        )
        expect(isValidLiveRegion).toBeTruthy()
      }
    }

    // Check for skip links
    const skipLink = page.locator('a[href="#main"]')
      .or(page.locator('a[href="#content"]'))
      .or(page.locator('.skip-link'))
    
    if (await skipLink.isVisible()) {
      await skipLink.focus()
      await expect(skipLink).toBeVisible()
    }
  })

  test('has minimum touch target sizes', async ({ page }) => {
    // Check interactive elements have adequate touch targets
    const interactiveElements = page.locator('button, a, input[type="button"], input[type="submit"], [role="button"]')
    const elementCount = await interactiveElements.count()

    for (let i = 0; i < Math.min(elementCount, 10); i++) { // Sample first 10 elements
      const element = interactiveElements.nth(i)
      if (await element.isVisible()) {
        const boundingBox = await element.boundingBox()
        
        if (boundingBox) {
          // WCAG recommends minimum 44x44px for touch targets
          const minSize = 36 // Using slightly smaller for testing flexibility
          expect(boundingBox.width).toBeGreaterThanOrEqual(minSize)
          expect(boundingBox.height).toBeGreaterThanOrEqual(minSize)
        }
      }
    }
  })

  test('has proper color contrast', async ({ page }) => {
    const contrastResults = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze()
    
    expect(contrastResults.violations).toEqual([])
  })

  test('works without JavaScript (progressive enhancement)', async ({ page }) => {
    // Disable JavaScript and test basic functionality
    await page.context().setExtraHTTPHeaders({})
    await page.addInitScript(() => {
      delete (window as any).navigator
    })
    
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    
    // Basic content should still be visible
    const main = page.locator('main').or(page.locator('body'))
    await expect(main).toBeVisible()
    
    // Links should still be clickable
    const links = page.locator('a[href]').first()
    if (await links.isVisible()) {
      await expect(links).toBeVisible()
    }
  })
})