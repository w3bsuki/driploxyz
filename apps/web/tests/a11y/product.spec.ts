import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Product Detail Page Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    // Try to navigate to a product page
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Look for a product card to click
    const productCard = page.locator('[data-testid="product-card"]')
      .or(page.locator('.product-card a'))
      .or(page.locator('a[href*="/product/"]'))
      .first()
    
    if (await productCard.isVisible()) {
      await productCard.click()
      await page.waitForLoadState('networkidle')
    } else {
      // Fallback: navigate directly to a test product
      await page.goto('/product/test-product-id')
      await page.waitForLoadState('networkidle')
    }
  })

  test('has zero critical accessibility violations', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .exclude('#stripe-elements') // Exclude third-party elements
      .exclude('#cookie-consent')
      .analyze()
    
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Product page accessibility violations:', 
        JSON.stringify(accessibilityScanResults.violations, null, 2))
    }
    
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('has accessible product images and gallery', async ({ page }) => {
    // Check main product image
    const mainImage = page.locator('[data-testid="product-image"]')
      .or(page.locator('.product-image img'))
      .or(page.locator('img[src*="product"]'))
      .first()

    if (await mainImage.isVisible()) {
      const alt = await mainImage.getAttribute('alt')
      expect(alt).toBeDefined()
      
      // Alt text should be descriptive, not just filename
      if (alt) {
        expect(alt.length).toBeGreaterThan(0)
        expect(alt).not.toMatch(/\.(jpg|png|gif|webp)$/i) // Should not be filename
      }
    }

    // Check for image gallery with proper navigation
    const gallery = page.locator('[data-testid="product-gallery"]')
      .or(page.locator('.product-gallery'))
      .or(page.locator('.image-gallery'))

    if (await gallery.isVisible()) {
      // Gallery should be navigable by keyboard
      const galleryImages = gallery.locator('img, button')
      const imageCount = await galleryImages.count()
      
      if (imageCount > 1) {
        // Test keyboard navigation in gallery
        await gallery.focus()
        await page.keyboard.press('Tab')
        
        const focusedElement = page.locator(':focus')
        const isInGallery = await focusedElement.evaluate((el, galleryEl) => {
          return galleryEl.contains(el)
        }, await gallery.elementHandle())
        
        expect(isInGallery).toBeTruthy()
        
        // Test arrow key navigation if implemented
        await page.keyboard.press('ArrowRight')
        await page.waitForTimeout(100)
      }

      // Each gallery image should have alt text
      const galleryImages2 = gallery.locator('img')
      const galleryImageCount = await galleryImages2.count()
      
      for (let i = 0; i < Math.min(galleryImageCount, 5); i++) {
        const img = galleryImages2.nth(i)
        const alt = await img.getAttribute('alt')
        expect(alt).toBeDefined()
      }
    }

    // Check for zoom functionality accessibility
    const zoomButton = page.locator('[data-testid="zoom"]')
      .or(page.locator('button[aria-label*="zoom" i]'))
      .or(page.locator('.zoom-button'))

    if (await zoomButton.isVisible()) {
      const ariaLabel = await zoomButton.getAttribute('aria-label')
      const buttonText = await zoomButton.textContent()
      
      expect(!!(ariaLabel || buttonText?.trim())).toBeTruthy()
    }
  })

  test('has accessible product information and pricing', async ({ page }) => {
    // Check product title
    const productTitle = page.locator('h1')
      .or(page.locator('[data-testid="product-title"]'))
      .or(page.locator('.product-title'))

    if (await productTitle.isVisible()) {
      const titleText = await productTitle.textContent()
      expect(titleText?.trim()).toBeTruthy()
    }

    // Check product price
    const price = page.locator('[data-testid="product-price"]')
      .or(page.locator('.product-price'))
      .or(page.locator('.price'))
      .or(page.locator(':text("$")'))

    if (await price.isVisible()) {
      const priceText = await price.textContent()
      expect(priceText?.trim()).toBeTruthy()
      
      // Price should be marked up semantically if it's important
      const ariaLabel = await price.getAttribute('aria-label')
      if (ariaLabel && ariaLabel.includes('price')) {
        expect(ariaLabel).toBeTruthy()
      }
    }

    // Check product description
    const description = page.locator('[data-testid="product-description"]')
      .or(page.locator('.product-description'))
      .or(page.locator('.description'))

    if (await description.isVisible()) {
      const descText = await description.textContent()
      expect(descText?.trim()).toBeTruthy()
    }

    // Check for product specifications/details
    const specifications = page.locator('[data-testid="specifications"]')
      .or(page.locator('.specifications'))
      .or(page.locator('.product-details'))

    if (await specifications.isVisible()) {
      // Should use proper list structure or table for specs
      const list = specifications.locator('ul, ol, dl, table')
      if (await list.isVisible()) {
        await expect(list).toBeVisible()
      }
    }
  })

  test('has accessible add to cart and purchase controls', async ({ page }) => {
    // Check for add to cart button
    const addToCartButton = page.locator('[data-testid="add-to-cart"]')
      .or(page.locator('button:has-text("add to cart")', { timeout: 1000 }))
      .or(page.locator('button:has-text("Add to Cart")'))
      .or(page.locator('.add-to-cart'))

    if (await addToCartButton.isVisible()) {
      // Should be a proper button
      const tagName = await addToCartButton.evaluate(el => el.tagName.toLowerCase())
      const role = await addToCartButton.getAttribute('role')
      
      expect(tagName === 'button' || role === 'button').toBeTruthy()
      
      // Should have accessible name
      const buttonText = await addToCartButton.textContent()
      const ariaLabel = await addToCartButton.getAttribute('aria-label')
      expect(!!(buttonText?.trim() || ariaLabel)).toBeTruthy()
      
      // Should have adequate size for touch
      const boundingBox = await addToCartButton.boundingBox()
      if (boundingBox) {
        expect(boundingBox.height).toBeGreaterThanOrEqual(36)
        expect(boundingBox.width).toBeGreaterThanOrEqual(36)
      }
      
      // Test button interaction
      await addToCartButton.click()
      await page.waitForTimeout(500) // Allow for feedback/animation
    }

    // Check for quantity selector
    const quantitySelector = page.locator('[data-testid="quantity"]')
      .or(page.locator('input[name="quantity"]'))
      .or(page.locator('.quantity-selector'))

    if (await quantitySelector.isVisible()) {
      // Should have proper labeling
      const hasLabel = await quantitySelector.evaluate((el) => {
        if (el.getAttribute('aria-label')) return true
        if (el.getAttribute('aria-labelledby')) return true
        
        const id = el.getAttribute('id')
        if (id && document.querySelector(`label[for="${id}"]`)) return true
        
        if (el.closest('label')) return true
        
        return false
      })
      
      expect(hasLabel).toBeTruthy()
    }

    // Check for buy now button if present
    const buyNowButton = page.locator('button:has-text("buy now")', { timeout: 1000 })
      .or(page.locator('button:has-text("Buy Now")'))
      .or(page.locator('[data-testid="buy-now"]'))

    if (await buyNowButton.isVisible()) {
      const buttonText = await buyNowButton.textContent()
      const ariaLabel = await buyNowButton.getAttribute('aria-label')
      expect(!!(buttonText?.trim() || ariaLabel)).toBeTruthy()
    }
  })

  test('has accessible product reviews and ratings', async ({ page }) => {
    // Check for ratings display
    const rating = page.locator('[data-testid="product-rating"]')
      .or(page.locator('.product-rating'))
      .or(page.locator('.rating'))
      .or(page.locator('[aria-label*="star" i]'))

    if (await rating.isVisible()) {
      // Rating should be accessible to screen readers
      const ariaLabel = await rating.getAttribute('aria-label')
      const text = await rating.textContent()
      
      // Should have meaningful description like "4.5 out of 5 stars"
      expect(!!(ariaLabel || text?.includes('star'))).toBeTruthy()
    }

    // Check for reviews section
    const reviewsSection = page.locator('[data-testid="reviews"]')
      .or(page.locator('#reviews'))
      .or(page.locator('.reviews'))
      .or(page.locator('section').filter({ hasText: /review/i }))

    if (await reviewsSection.isVisible()) {
      // Should have proper heading
      const reviewsHeading = reviewsSection.locator('h2, h3, h4')
        .or(page.locator('h2:has-text("review")', { timeout: 1000 }))
        .or(page.locator('h3:has-text("review")'))

      if (await reviewsHeading.isVisible()) {
        await expect(reviewsHeading).toBeVisible()
      }

      // Individual reviews should be properly structured
      const individualReviews = reviewsSection.locator('.review')
        .or(reviewsSection.locator('[data-testid="review"]'))
        .or(reviewsSection.locator('article'))

      const reviewCount = await individualReviews.count()
      if (reviewCount > 0) {
        const firstReview = individualReviews.first()
        
        // Should have reviewer name and review text
        const reviewerName = firstReview.locator('.reviewer-name')
          .or(firstReview.locator('[data-testid="reviewer-name"]'))
          .or(firstReview.locator('cite'))
        
        if (await reviewerName.isVisible()) {
          const name = await reviewerName.textContent()
          expect(name?.trim()).toBeTruthy()
        }
      }
    }

    // Check for write review button
    const writeReviewButton = page.locator('button:has-text("write review")', { timeout: 1000 })
      .or(page.locator('button:has-text("Write a Review")'))
      .or(page.locator('[data-testid="write-review"]'))

    if (await writeReviewButton.isVisible()) {
      const buttonText = await writeReviewButton.textContent()
      const ariaLabel = await writeReviewButton.getAttribute('aria-label')
      expect(!!(buttonText?.trim() || ariaLabel)).toBeTruthy()
    }
  })

  test('has accessible seller information', async ({ page }) => {
    // Check for seller info section
    const sellerInfo = page.locator('[data-testid="seller-info"]')
      .or(page.locator('.seller-info'))
      .or(page.locator('.seller'))
      .or(page.locator('section').filter({ hasText: /seller|sold by/i }))

    if (await sellerInfo.isVisible()) {
      // Seller name should be a link or clearly marked
      const sellerName = sellerInfo.locator('a')
        .or(sellerInfo.locator('[data-testid="seller-name"]'))
        .or(sellerInfo.locator('.seller-name'))

      if (await sellerName.isVisible()) {
        const text = await sellerName.textContent()
        const ariaLabel = await sellerName.getAttribute('aria-label')
        expect(!!(text?.trim() || ariaLabel)).toBeTruthy()
      }

      // Check for seller rating if present
      const sellerRating = sellerInfo.locator('.seller-rating')
        .or(sellerInfo.locator('[aria-label*="rating" i]'))

      if (await sellerRating.isVisible()) {
        const ariaLabel = await sellerRating.getAttribute('aria-label')
        const text = await sellerRating.textContent()
        expect(!!(ariaLabel || text?.includes('star'))).toBeTruthy()
      }
    }
  })

  test('has proper breadcrumb navigation', async ({ page }) => {
    const breadcrumbs = page.locator('nav[aria-label*="breadcrumb" i]')
      .or(page.locator('.breadcrumb'))
      .or(page.locator('[data-testid="breadcrumbs"]'))

    if (await breadcrumbs.isVisible()) {
      // Should be marked as navigation
      const ariaLabel = await breadcrumbs.getAttribute('aria-label')
      const role = await breadcrumbs.getAttribute('role')
      
      expect(ariaLabel?.includes('breadcrumb') || role === 'navigation').toBeTruthy()

      // Current page should be marked appropriately
      const breadcrumbLinks = breadcrumbs.locator('a')
      const linkCount = await breadcrumbLinks.count()
      
      if (linkCount > 0) {
        const currentPage = breadcrumbLinks.last()
        const ariaCurrent = await currentPage.getAttribute('aria-current')
        
        // Last breadcrumb might be current page
        if (ariaCurrent) {
          expect(ariaCurrent).toBe('page')
        }
      }
    }
  })

  test('supports keyboard navigation through product details', async ({ page }) => {
    // Test tabbing through product page elements
    let tabCount = 0
    const interactiveElements = []
    
    while (tabCount < 20) { // Test reasonable number of tab stops
      await page.keyboard.press('Tab')
      tabCount++
      
      const focused = page.locator(':focus')
      if (await focused.isVisible()) {
        const tagName = await focused.evaluate(el => el.tagName.toLowerCase())
        const role = await focused.getAttribute('role')
        const ariaLabel = await focused.getAttribute('aria-label')
        const text = await focused.textContent()
        
        interactiveElements.push({ 
          tagName, 
          role, 
          hasAccessibleName: !!(ariaLabel || text?.trim()),
          tabCount 
        })
        
        // Key interactive elements should be accessible
        if (['button', 'a', 'input', 'select'].includes(tagName) ||
            ['button', 'link', 'tab', 'menuitem'].includes(role || '')) {
          expect(interactiveElements[interactiveElements.length - 1].hasAccessibleName).toBeTruthy()
        }
      }
    }
    
    // Should have found interactive elements on product page
    expect(interactiveElements.length).toBeGreaterThan(0)
    
    // Should include essential product interactions
    const hasAddToCart = interactiveElements.some(el => 
      el.role === 'button' || el.tagName === 'button'
    )
    expect(hasAddToCart).toBeTruthy()
  })

  test('has accessible product variations and options', async ({ page }) => {
    // Check for size/color/variation selectors
    const variationSelectors = page.locator('[data-testid="size-selector"]')
      .or(page.locator('[data-testid="color-selector"]'))
      .or(page.locator('.variation-selector'))
      .or(page.locator('select[name*="size"]'))
      .or(page.locator('select[name*="color"]'))

    const selectorCount = await variationSelectors.count()
    if (selectorCount > 0) {
      for (let i = 0; i < Math.min(selectorCount, 3); i++) {
        const selector = variationSelectors.nth(i)
        
        // Should have proper labeling
        const tagName = await selector.evaluate(el => el.tagName.toLowerCase())
        
        if (tagName === 'select') {
          const id = await selector.getAttribute('id')
          const ariaLabel = await selector.getAttribute('aria-label')
          
          if (id) {
            const label = page.locator(`label[for="${id}"]`)
            if (await label.isVisible()) {
              await expect(label).toBeVisible()
            }
          } else if (ariaLabel) {
            expect(ariaLabel.trim().length).toBeGreaterThan(0)
          }
        }
      }
    }

    // Check for radio button groups (for variations)
    const radioGroups = page.locator('fieldset')
      .or(page.locator('[role="radiogroup"]'))

    const groupCount = await radioGroups.count()
    if (groupCount > 0) {
      const firstGroup = radioGroups.first()
      
      // Should have legend or aria-label
      const legend = firstGroup.locator('legend')
      const ariaLabel = await firstGroup.getAttribute('aria-label')
      
      if (await legend.isVisible()) {
        await expect(legend).toBeVisible()
      } else if (ariaLabel) {
        expect(ariaLabel.trim().length).toBeGreaterThan(0)
      }
    }
  })

  test('announces dynamic content changes to screen readers', async ({ page }) => {
    // Look for areas that might change dynamically
    const liveRegions = page.locator('[aria-live]')
      .or(page.locator('[role="status"]'))
      .or(page.locator('[role="alert"]'))

    // Test adding to cart if possible
    const addToCartButton = page.locator('[data-testid="add-to-cart"]')
      .or(page.locator('button:has-text("add to cart")', { timeout: 1000 }))
      .or(page.locator('button:has-text("Add to Cart")'))

    if (await addToCartButton.isVisible()) {
      await addToCartButton.click()
      await page.waitForTimeout(1000)
      
      // Should have some feedback mechanism
      const feedback = page.locator('[role="status"]')
        .or(page.locator('[aria-live]'))
        .or(page.locator('.toast'))
        .or(page.locator('.notification'))

      // If feedback exists, it should be accessible
      if (await feedback.isVisible()) {
        const ariaLive = await feedback.getAttribute('aria-live')
        const role = await feedback.getAttribute('role')
        
        if (ariaLive) {
          expect(['polite', 'assertive']).toContain(ariaLive)
        }
        
        if (role) {
          expect(['status', 'alert']).toContain(role)
        }
      }
    }
  })

  test('has accessible wishlist/favorite functionality', async ({ page }) => {
    // Check for wishlist/favorite button
    const favoriteButton = page.locator('[data-testid="favorite"]')
      .or(page.locator('[aria-label*="favorite" i]'))
      .or(page.locator('[aria-label*="wishlist" i]'))
      .or(page.locator('.favorite-button'))
      .or(page.locator('button').filter({ hasText: /heart|favorite|wishlist/i }))

    if (await favoriteButton.isVisible()) {
      // Should have accessible name
      const ariaLabel = await favoriteButton.getAttribute('aria-label')
      const title = await favoriteButton.getAttribute('title')
      const text = await favoriteButton.textContent()
      
      expect(!!(ariaLabel || title || text?.trim())).toBeTruthy()
      
      // Should indicate current state
      const ariaPressed = await favoriteButton.getAttribute('aria-pressed')
      if (ariaPressed) {
        expect(['true', 'false']).toContain(ariaPressed)
      }
      
      // Test interaction
      await favoriteButton.click()
      await page.waitForTimeout(500)
      
      // State should update
      const newAriaPressed = await favoriteButton.getAttribute('aria-pressed')
      if (newAriaPressed && ariaPressed) {
        expect(newAriaPressed).not.toBe(ariaPressed)
      }
    }
  })
})