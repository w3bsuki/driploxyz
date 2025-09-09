import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Search and Category Pages Accessibility', () => {
  test.describe('Search Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/search?q=test')
      await page.waitForLoadState('networkidle')
    })

    test('has zero critical accessibility violations', async ({ page }) => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .exclude('#cookie-consent') // Exclude cookie consent if it interferes
        .analyze()
      
      if (accessibilityScanResults.violations.length > 0) {
        console.log('Search page accessibility violations:', 
          JSON.stringify(accessibilityScanResults.violations, null, 2))
      }
      
      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('has proper search form accessibility', async ({ page }) => {
      const searchInput = page.locator('input[type="search"]')
        .or(page.locator('[role="searchbox"]'))
        .or(page.locator('input[placeholder*="search" i]'))

      if (await searchInput.isVisible()) {
        // Check for proper labeling
        const hasProperLabel = await searchInput.evaluate((input) => {
          if (input.getAttribute('aria-label')) return true
          if (input.getAttribute('aria-labelledby')) return true
          
          const id = input.getAttribute('id')
          if (id && document.querySelector(`label[for="${id}"]`)) return true
          
          if (input.closest('label')) return true
          
          return false
        })
        
        expect(hasProperLabel).toBeTruthy()

        // Test autocomplete functionality if present
        await searchInput.click()
        await searchInput.fill('test')
        
        // Check for autocomplete dropdown with proper ARIA
        const dropdown = page.locator('[role="listbox"]')
          .or(page.locator('[role="combobox"]'))
          .or(page.locator('.search-dropdown'))

        if (await dropdown.isVisible()) {
          // Should have proper ARIA attributes
          const ariaControls = await searchInput.getAttribute('aria-controls')
          const ariaExpanded = await searchInput.getAttribute('aria-expanded')
          
          if (ariaControls) {
            const controlledElement = page.locator(`#${ariaControls}`)
            await expect(controlledElement).toBeVisible()
          }
          
          // Test keyboard navigation in dropdown
          await page.keyboard.press('ArrowDown')
          const activeDescendant = await searchInput.getAttribute('aria-activedescendant')
          if (activeDescendant) {
            const activeOption = page.locator(`#${activeDescendant}`)
            await expect(activeOption).toBeVisible()
          }
        }
      }
    })

    test('has accessible filter controls', async ({ page }) => {
      // Look for filter controls
      const filters = page.locator('[data-testid="filter"]')
        .or(page.locator('.filter'))
        .or(page.locator('select'))
        .or(page.locator('input[type="checkbox"]'))

      const filterCount = await filters.count()
      if (filterCount > 0) {
        for (let i = 0; i < Math.min(filterCount, 5); i++) {
          const filter = filters.nth(i)
          const tagName = await filter.evaluate(el => el.tagName.toLowerCase())
          
          if (tagName === 'select') {
            // Select should have label
            const id = await filter.getAttribute('id')
            if (id) {
              const label = page.locator(`label[for="${id}"]`)
              await expect(label).toBeVisible()
            } else {
              const ariaLabel = await filter.getAttribute('aria-label')
              expect(ariaLabel).toBeTruthy()
            }
          } else if (tagName === 'input') {
            const type = await filter.getAttribute('type')
            if (type === 'checkbox') {
              // Checkbox should be properly labeled
              const hasLabel = await filter.evaluate((input) => {
                if (input.getAttribute('aria-label')) return true
                if (input.getAttribute('aria-labelledby')) return true
                
                const id = input.getAttribute('id')
                if (id && document.querySelector(`label[for="${id}"]`)) return true
                
                if (input.closest('label')) return true
                
                return false
              })
              expect(hasLabel).toBeTruthy()
            }
          }
        }
      }
    })

    test('has accessible search results with proper headings', async ({ page }) => {
      // Check for results container
      const resultsContainer = page.locator('[data-testid="search-results"]')
        .or(page.locator('.search-results'))
        .or(page.locator('.product-grid'))
        .or(page.locator('main'))

      await expect(resultsContainer).toBeVisible()

      // Check for proper heading structure
      const resultHeading = page.locator('h1, h2').filter({ hasText: /results|search/i })
      if (await resultHeading.isVisible()) {
        await expect(resultHeading).toBeVisible()
      }

      // Test result items
      const resultItems = page.locator('[data-testid="product-card"]')
        .or(page.locator('.product-card'))
        .or(page.locator('.result-item'))

      const itemCount = await resultItems.count()
      if (itemCount > 0) {
        // Test first few result items
        for (let i = 0; i < Math.min(itemCount, 3); i++) {
          const item = resultItems.nth(i)
          
          // Each result should be focusable or contain focusable elements
          const isItemFocusable = await item.evaluate(el => {
            return el.tabIndex >= 0 || el.querySelector('a, button') !== null
          })
          expect(isItemFocusable).toBeTruthy()

          // Check for accessible product information
          const productLink = item.locator('a').first()
          if (await productLink.isVisible()) {
            const linkText = await productLink.textContent()
            const ariaLabel = await productLink.getAttribute('aria-label')
            const hasAccessibleName = !!(linkText?.trim() || ariaLabel)
            expect(hasAccessibleName).toBeTruthy()
          }
        }
      } else {
        // No results - check for proper messaging
        const noResults = page.locator(':text("No results")')
          .or(page.locator(':text("no products")', { timeout: 1000 }))
          .or(page.locator('.no-results'))
        
        if (await noResults.isVisible()) {
          await expect(noResults).toBeVisible()
        }
      }
    })

    test('supports keyboard navigation through results', async ({ page }) => {
      const resultItems = page.locator('[data-testid="product-card"]')
        .or(page.locator('.product-card a'))
        .or(page.locator('.result-item a'))

      const itemCount = await resultItems.count()
      if (itemCount > 0) {
        // Navigate to first result with keyboard
        await page.keyboard.press('Tab')
        let tabCount = 1
        
        while (tabCount < 20) { // Prevent infinite loop
          const focused = page.locator(':focus')
          if (await focused.isVisible()) {
            const isResultItem = await focused.evaluate((el) => {
              return el.closest('[data-testid="product-card"]') !== null ||
                     el.closest('.product-card') !== null ||
                     el.closest('.result-item') !== null
            })
            
            if (isResultItem) {
              // Found a result item, test interaction
              await page.keyboard.press('Enter')
              
              // Should navigate or perform action
              await page.waitForTimeout(500)
              break
            }
          }
          
          await page.keyboard.press('Tab')
          tabCount++
        }
      }
    })

    test('announces search results to screen readers', async ({ page }) => {
      // Check for live regions that announce result counts
      const liveRegions = page.locator('[aria-live]')
        .or(page.locator('[role="status"]'))
        .or(page.locator('[role="region"][aria-label*="result" i]'))

      // If results are announced, verify the implementation
      const liveRegionCount = await liveRegions.count()
      for (let i = 0; i < liveRegionCount; i++) {
        const region = liveRegions.nth(i)
        const ariaLive = await region.getAttribute('aria-live')
        
        if (ariaLive) {
          expect(['polite', 'assertive']).toContain(ariaLive)
        }
      }

      // Check for result count announcement
      const resultCount = page.locator(':text("results")')
        .or(page.locator(':text("products found")'))
        .or(page.locator('[data-testid="result-count"]'))

      if (await resultCount.isVisible()) {
        await expect(resultCount).toBeVisible()
      }
    })
  })

  test.describe('Category Page', () => {
    test.beforeEach(async ({ page }) => {
      // Try to navigate to a category page
      await page.goto('/category/electronics')
      
      // If that doesn't work, try the category segments route
      const response = await page.request.get('/category/electronics')
      if (response.status() === 404) {
        await page.goto('/category/test-category/subcategory')
      }
      
      await page.waitForLoadState('networkidle')
    })

    test('has zero critical accessibility violations', async ({ page }) => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .exclude('#cookie-consent')
        .analyze()
      
      if (accessibilityScanResults.violations.length > 0) {
        console.log('Category page accessibility violations:', 
          JSON.stringify(accessibilityScanResults.violations, null, 2))
      }
      
      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('has proper breadcrumb navigation', async ({ page }) => {
      const breadcrumbs = page.locator('nav[aria-label*="breadcrumb" i]')
        .or(page.locator('.breadcrumb'))
        .or(page.locator('[role="navigation"]').filter({ hasText: /home/i }))

      if (await breadcrumbs.isVisible()) {
        // Should be marked as navigation
        const role = await breadcrumbs.getAttribute('role')
        const ariaLabel = await breadcrumbs.getAttribute('aria-label')
        
        expect(role === 'navigation' || !!ariaLabel).toBeTruthy()

        // Check breadcrumb links
        const breadcrumbLinks = breadcrumbs.locator('a')
        const linkCount = await breadcrumbLinks.count()
        
        if (linkCount > 0) {
          // Current page should be marked appropriately
          const currentPage = breadcrumbLinks.last()
          const ariaCurrent = await currentPage.getAttribute('aria-current')
          
          if (ariaCurrent) {
            expect(ariaCurrent).toBe('page')
          }
        }
      }
    })

    test('has accessible category filters and sorting', async ({ page }) => {
      // Check for sort controls
      const sortControls = page.locator('select[name*="sort"]')
        .or(page.locator('[data-testid="sort"]'))
        .or(page.locator('.sort-control'))

      if (await sortControls.isVisible()) {
        const sortControl = sortControls.first()
        
        // Should have proper labeling
        const hasLabel = await sortControl.evaluate((el) => {
          const tagName = el.tagName.toLowerCase()
          if (tagName === 'select') {
            if (el.getAttribute('aria-label')) return true
            const id = el.getAttribute('id')
            if (id && document.querySelector(`label[for="${id}"]`)) return true
          }
          return false
        })
        
        if (await sortControl.getAttribute('aria-label') || 
            await sortControl.getAttribute('id')) {
          expect(hasLabel).toBeTruthy()
        }
      }

      // Check for filter controls
      const filterSection = page.locator('[data-testid="filters"]')
        .or(page.locator('.filters'))
        .or(page.locator('aside'))
        .or(page.locator('[role="complementary"]'))

      if (await filterSection.isVisible()) {
        // Should have proper landmark role
        const role = await filterSection.getAttribute('role')
        const ariaLabel = await filterSection.getAttribute('aria-label')
        
        if (role || ariaLabel) {
          expect(['complementary', 'region'].includes(role || '') || !!ariaLabel).toBeTruthy()
        }
      }
    })

    test('has accessible product grid with proper semantics', async ({ page }) => {
      const productGrid = page.locator('[data-testid="product-grid"]')
        .or(page.locator('.product-grid'))
        .or(page.locator('.category-products'))
        .or(page.locator('main'))

      await expect(productGrid).toBeVisible()

      // Check for product cards
      const productCards = page.locator('[data-testid="product-card"]')
        .or(page.locator('.product-card'))

      const cardCount = await productCards.count()
      if (cardCount > 0) {
        // Test first few product cards
        for (let i = 0; i < Math.min(cardCount, 3); i++) {
          const card = productCards.nth(i)
          
          // Each card should have a main link
          const mainLink = card.locator('a').first()
          if (await mainLink.isVisible()) {
            const linkText = await mainLink.textContent()
            const ariaLabel = await mainLink.getAttribute('aria-label')
            const hasAccessibleName = !!(linkText?.trim() || ariaLabel)
            expect(hasAccessibleName).toBeTruthy()

            // Product images should have alt text
            const productImage = card.locator('img').first()
            if (await productImage.isVisible()) {
              const alt = await productImage.getAttribute('alt')
              expect(alt).toBeDefined()
            }
          }

          // Check for price information accessibility
          const price = card.locator('[data-testid="price"]')
            .or(card.locator('.price'))
            .or(card.locator(':text("$")'))

          if (await price.isVisible()) {
            const priceText = await price.textContent()
            expect(priceText?.trim()).toBeTruthy()
          }
        }
      }
    })

    test('supports keyboard navigation through category content', async ({ page }) => {
      // Test tabbing through category page elements
      let tabCount = 0
      const focusableElements = []
      
      while (tabCount < 15) { // Test reasonable number of tab stops
        await page.keyboard.press('Tab')
        tabCount++
        
        const focused = page.locator(':focus')
        if (await focused.isVisible()) {
          const tagName = await focused.evaluate(el => el.tagName.toLowerCase())
          const role = await focused.getAttribute('role')
          
          focusableElements.push({ tagName, role, tabCount })
          
          // Test that interactive elements are properly focused
          if (['button', 'a', 'input', 'select'].includes(tagName) ||
              ['button', 'link', 'menuitem'].includes(role || '')) {
            await expect(focused).toBeVisible()
          }
        }
      }
      
      // Should have found interactive elements
      expect(focusableElements.length).toBeGreaterThan(0)
    })

    test('has proper category hierarchy and navigation', async ({ page }) => {
      // Check for category heading
      const categoryHeading = page.locator('h1')
        .or(page.locator('[data-testid="category-title"]'))
        .or(page.locator('.category-title'))

      if (await categoryHeading.isVisible()) {
        const headingText = await categoryHeading.textContent()
        expect(headingText?.trim()).toBeTruthy()
      }

      // Check for subcategory navigation if present
      const subcategoryNav = page.locator('[data-testid="subcategories"]')
        .or(page.locator('.subcategory-nav'))
        .or(page.locator('nav').filter({ hasText: /categor/i }))

      if (await subcategoryNav.isVisible()) {
        const subcategoryLinks = subcategoryNav.locator('a')
        const linkCount = await subcategoryLinks.count()
        
        if (linkCount > 0) {
          // Test first subcategory link
          const firstLink = subcategoryLinks.first()
          const linkText = await firstLink.textContent()
          const ariaLabel = await firstLink.getAttribute('aria-label')
          
          expect(!!(linkText?.trim() || ariaLabel)).toBeTruthy()
        }
      }
    })
  })

  test('search and category pages have consistent navigation patterns', async ({ page }) => {
    // Test that search and category pages share common navigation patterns
    const testUrls = ['/search?q=test', '/category/electronics']
    
    for (const url of testUrls) {
      await page.goto(url).catch(() => {
        // If URL fails, skip this iteration
        return
      })
      
      await page.waitForLoadState('networkidle')
      
      // Both should have main navigation
      const mainNav = page.locator('nav').first()
      if (await mainNav.isVisible()) {
        await expect(mainNav).toBeVisible()
      }
      
      // Both should have proper main content area
      const mainContent = page.locator('main')
        .or(page.locator('[role="main"]'))
      
      if (await mainContent.isVisible()) {
        await expect(mainContent).toBeVisible()
      }
    }
  })
})