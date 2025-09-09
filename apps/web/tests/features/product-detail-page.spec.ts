import { test, expect } from '@playwright/test';

test.describe('Product Detail Page Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage first
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Find and click on a product to test
    const productLink = page.locator('a[href*="/product/"]').first();
    
    if (await productLink.isVisible()) {
      await productLink.click();
      await page.waitForLoadState('networkidle');
    } else {
      // Fallback to a direct product URL
      await page.goto('/product/test-seller/test-product-123');
      await page.waitForLoadState('networkidle');
    }
  });

  test.describe('Product Gallery', () => {
    test('displays product images with proper lazy loading', async ({ page }) => {
      const gallery = page.locator('[data-testid="product-gallery"]')
        .or(page.locator('.product-gallery'))
        .first();

      await expect(gallery).toBeVisible();

      // Check that main image loads eagerly
      const mainImage = gallery.locator('img').first();
      await expect(mainImage).toBeVisible();
      
      const loading = await mainImage.getAttribute('loading');
      const fetchPriority = await mainImage.getAttribute('fetchpriority');
      
      // First image should be eager loaded with high priority
      expect(loading).toBe('eager');
      expect(fetchPriority).toBe('high');
      
      // Additional images should be lazy loaded
      const additionalImages = gallery.locator('img').nth(1);
      if (await additionalImages.isVisible()) {
        const additionalLoading = await additionalImages.getAttribute('loading');
        expect(additionalLoading).toBe('lazy');
      }
    });

    test('supports keyboard navigation through gallery', async ({ page }) => {
      const gallery = page.locator('[data-testid="product-gallery"]')
        .or(page.locator('.product-gallery'))
        .first();

      if (await gallery.isVisible()) {
        // Focus on gallery
        await gallery.focus();
        
        // Test arrow key navigation
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(100);
        
        await page.keyboard.press('ArrowLeft');
        await page.waitForTimeout(100);
        
        // Gallery should maintain focus and respond to keyboard
        const focusedElement = page.locator(':focus');
        const isInGallery = await focusedElement.evaluate((el, galleryEl) => {
          return galleryEl ? galleryEl.contains(el) : false;
        }, await gallery.elementHandle());
        
        expect(isInGallery).toBeTruthy();
      }
    });

    test('displays image counter and navigation dots', async ({ page }) => {
      const gallery = page.locator('[data-testid="product-gallery"]')
        .or(page.locator('.product-gallery'))
        .first();

      if (await gallery.isVisible()) {
        const images = gallery.locator('img');
        const imageCount = await images.count();
        
        if (imageCount > 1) {
          // Check for navigation dots or counter
          const dots = gallery.locator('.gallery-dot, .gallery-indicator, [role="tablist"]');
          const counter = gallery.locator('.image-counter, .gallery-counter');
          
          const hasDots = await dots.count() > 0;
          const hasCounter = await counter.count() > 0;
          
          expect(hasDots || hasCounter).toBeTruthy();
        }
      }
    });
  });

  test.describe('Product Information', () => {
    test('displays product title and key information', async ({ page }) => {
      // Product title should be in an h1
      const title = page.locator('h1').first();
      await expect(title).toBeVisible();
      
      const titleText = await title.textContent();
      expect(titleText?.trim().length).toBeGreaterThan(0);
      
      // Price should be visible
      const price = page.locator('[data-testid="product-price"]')
        .or(page.locator('.product-price'))
        .or(page.locator('.price'))
        .first();
      
      await expect(price).toBeVisible();
      
      const priceText = await price.textContent();
      expect(priceText?.trim().length).toBeGreaterThan(0);
    });

    test('displays condition badge with correct styling', async ({ page }) => {
      const conditionBadge = page.locator('[data-testid="condition-badge"]')
        .or(page.locator('.condition-tag'))
        .or(page.locator('.condition-badge'))
        .first();

      if (await conditionBadge.isVisible()) {
        const conditionText = await conditionBadge.textContent();
        expect(conditionText?.trim().length).toBeGreaterThan(0);
        
        // Check that condition badge has appropriate styling
        const styles = await conditionBadge.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return {
            backgroundColor: computed.backgroundColor,
            borderRadius: computed.borderRadius,
            padding: computed.padding
          };
        });
        
        expect(styles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)'); // Should have background
        expect(styles.borderRadius).not.toBe('0px'); // Should be rounded
      }
    });

    test('shows expandable product description', async ({ page }) => {
      const description = page.locator('[data-testid="product-description"]')
        .or(page.locator('.product-description'))
        .or(page.locator('.description'))
        .first();

      if (await description.isVisible()) {
        const descriptionText = await description.textContent();
        expect(descriptionText?.trim().length).toBeGreaterThan(0);
        
        // Check for "Read more" functionality if description is long
        const readMoreButton = page.locator('button:has-text("Read more")')
          .or(page.locator('button:has-text("Show more")')
          .or(page.locator('[data-testid="read-more"]')));
        
        if (await readMoreButton.isVisible()) {
          await readMoreButton.click();
          await page.waitForTimeout(300);
          
          // Description should expand or change
          const expandedDescription = await description.textContent();
          expect(expandedDescription?.length).toBeGreaterThanOrEqual(descriptionText?.length || 0);
        }
      }
    });

    test('displays product specifications in accordion', async ({ page }) => {
      const specsAccordion = page.locator('[data-testid="product-details"]')
        .or(page.locator('.product-details'))
        .or(page.locator('details'))
        .first();

      if (await specsAccordion.isVisible()) {
        // Check if it's a native details element or custom accordion
        const tagName = await specsAccordion.evaluate(el => el.tagName.toLowerCase());
        
        if (tagName === 'details') {
          const summary = specsAccordion.locator('summary');
          await expect(summary).toBeVisible();
          
          // Click to expand
          await summary.click();
          await page.waitForTimeout(300);
          
          const isOpen = await specsAccordion.getAttribute('open');
          expect(isOpen).not.toBeNull();
        } else {
          // Custom accordion - look for expand/collapse button
          const expandButton = specsAccordion.locator('button').first();
          if (await expandButton.isVisible()) {
            await expandButton.click();
            await page.waitForTimeout(300);
          }
        }
      }
    });
  });

  test.describe('Seller Information', () => {
    test('displays seller card with complete information', async ({ page }) => {
      const sellerCard = page.locator('[data-testid="seller-card"]')
        .or(page.locator('.seller-card'))
        .or(page.locator('.seller'))
        .first();

      if (await sellerCard.isVisible()) {
        // Seller name should be visible
        const sellerName = sellerCard.locator('[data-testid="seller-name"]')
          .or(sellerCard.locator('.seller-name'))
          .or(sellerCard.locator('h3, h4'))
          .first();
        
        await expect(sellerName).toBeVisible();
        
        // Check for seller stats
        const stats = sellerCard.locator('[data-testid="seller-stats"]')
          .or(sellerCard.locator('.seller-stats'))
          .or(sellerCard.locator('.stats'));
          
        if (await stats.count() > 0) {
          await expect(stats.first()).toBeVisible();
        }
        
        // Check for message seller button
        const messageButton = sellerCard.locator('button:has-text("Message")')
          .or(sellerCard.locator('[data-testid="message-seller"]'))
          .or(sellerCard.locator('.message-button'));
          
        if (await messageButton.count() > 0) {
          await expect(messageButton.first()).toBeVisible();
          
          // Button should be properly sized for touch
          const boundingBox = await messageButton.first().boundingBox();
          if (boundingBox) {
            expect(boundingBox.height).toBeGreaterThanOrEqual(36);
          }
        }
      }
    });

    test('allows viewing seller profile', async ({ page }) => {
      const sellerProfile = page.locator('[data-testid="view-profile"]')
        .or(page.locator('button:has-text("View profile")'))
        .or(page.locator('a:has-text("View profile")'))
        .first();

      if (await sellerProfile.isVisible()) {
        const isButton = await sellerProfile.evaluate(el => 
          el.tagName.toLowerCase() === 'button'
        );
        
        if (isButton) {
          // If it's a button, it should trigger navigation
          await sellerProfile.click();
          await page.waitForTimeout(500);
        } else {
          // If it's a link, check that it has proper href
          const href = await sellerProfile.getAttribute('href');
          expect(href).toContain('/profile/');
        }
      }
    });
  });

  test.describe('Action Buttons', () => {
    test('handles favorite/wishlist toggle', async ({ page }) => {
      const favoriteButton = page.locator('[data-testid="favorite-button"]')
        .or(page.locator('.favorite-button'))
        .or(page.locator('button[aria-label*="favorite" i]'))
        .first();

      if (await favoriteButton.isVisible()) {
        // Get initial state
        const initialAriaPressed = await favoriteButton.getAttribute('aria-pressed');
        const initialCount = await favoriteButton.textContent();
        
        // Click to toggle
        await favoriteButton.click();
        await page.waitForTimeout(1000); // Allow for async operation
        
        // State should change
        const newAriaPressed = await favoriteButton.getAttribute('aria-pressed');
        if (initialAriaPressed && newAriaPressed) {
          expect(newAriaPressed).not.toBe(initialAriaPressed);
        }
        
        // Visual feedback should be present
        const favoriteIcon = favoriteButton.locator('svg, .icon');
        if (await favoriteIcon.isVisible()) {
          await expect(favoriteIcon).toBeVisible();
        }
      }
    });

    test('handles buy now action', async ({ page }) => {
      const buyNowButton = page.locator('[data-testid="buy-now"]')
        .or(page.locator('button:has-text("Buy now")'))
        .or(page.locator('.buy-now-button'))
        .first();

      if (await buyNowButton.isVisible()) {
        // Button should be properly labeled
        const buttonText = await buyNowButton.textContent();
        const ariaLabel = await buyNowButton.getAttribute('aria-label');
        
        expect(buttonText?.trim() || ariaLabel).toBeTruthy();
        
        // Button should be large enough for touch
        const boundingBox = await buyNowButton.boundingBox();
        if (boundingBox) {
          expect(boundingBox.height).toBeGreaterThanOrEqual(44); // Primary action = 44px
        }
        
        // Click should trigger some action
        await buyNowButton.click();
        await page.waitForTimeout(500);
        
        // Should either navigate or show modal/dialog
        const currentUrl = page.url();
        const hasModal = await page.locator('[role="dialog"], .modal').count() > 0;
        
        expect(currentUrl.includes('/checkout') || hasModal).toBeTruthy();
      }
    });

    test('handles message seller action', async ({ page }) => {
      const messageButton = page.locator('[data-testid="message-seller"]')
        .or(page.locator('button:has-text("Message")'))
        .or(page.locator('.message-button'))
        .first();

      if (await messageButton.isVisible()) {
        await messageButton.click();
        await page.waitForTimeout(500);
        
        // Should either navigate to messages or open messaging modal
        const currentUrl = page.url();
        const hasModal = await page.locator('[role="dialog"], .modal').count() > 0;
        
        expect(currentUrl.includes('/messages') || hasModal).toBeTruthy();
      }
    });
  });

  test.describe('Sticky Header', () => {
    test('shows sticky header on scroll', async ({ page }) => {
      const stickyHeader = page.locator('[data-testid="sticky-header"]')
        .or(page.locator('.sticky-header'))
        .or(page.locator('.fixed-header'))
        .first();

      // Initially should be hidden or transparent
      if (await stickyHeader.isVisible()) {
        const initialOpacity = await stickyHeader.evaluate(el => 
          window.getComputedStyle(el).opacity
        );
        
        // Scroll down to trigger sticky header
        await page.evaluate(() => window.scrollTo(0, 300));
        await page.waitForTimeout(500);
        
        const scrolledOpacity = await stickyHeader.evaluate(el => 
          window.getComputedStyle(el).opacity
        );
        
        // Header should become more visible after scroll
        expect(parseFloat(scrolledOpacity)).toBeGreaterThanOrEqual(parseFloat(initialOpacity));
        
        // Should contain condensed product info
        const headerTitle = stickyHeader.locator('h1, .header-title');
        if (await headerTitle.isVisible()) {
          const titleText = await headerTitle.textContent();
          expect(titleText?.trim().length).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe('Reviews Section', () => {
    test('displays review summary and individual reviews', async ({ page }) => {
      const reviewsSection = page.locator('[data-testid="reviews-section"]')
        .or(page.locator('.reviews-section'))
        .or(page.locator('#reviews'))
        .first();

      if (await reviewsSection.isVisible()) {
        // Should have rating summary
        const ratingSummary = reviewsSection.locator('.rating-summary')
          .or(reviewsSection.locator('[data-testid="rating-summary"]'));
          
        if (await ratingSummary.count() > 0) {
          await expect(ratingSummary.first()).toBeVisible();
          
          // Should show stars
          const stars = ratingSummary.first().locator('.star, svg');
          expect(await stars.count()).toBeGreaterThan(0);
        }
        
        // Should show individual reviews
        const reviews = reviewsSection.locator('.review')
          .or(reviewsSection.locator('[data-testid="review"]'));
          
        if (await reviews.count() > 0) {
          const firstReview = reviews.first();
          await expect(firstReview).toBeVisible();
          
          // Review should have reviewer name and comment
          const reviewerName = firstReview.locator('.reviewer-name')
            .or(firstReview.locator('[data-testid="reviewer-name"]'));
            
          if (await reviewerName.isVisible()) {
            const name = await reviewerName.textContent();
            expect(name?.trim().length).toBeGreaterThan(0);
          }
        }
      }
    });

    test('supports expanding reviews', async ({ page }) => {
      const showAllButton = page.locator('button:has-text("Show all")')
        .or(page.locator('button:has-text("View all")'))
        .or(page.locator('[data-testid="show-all-reviews"]'));

      if (await showAllButton.isVisible()) {
        // Count initial reviews
        const initialReviews = await page.locator('.review').count();
        
        // Click show all
        await showAllButton.click();
        await page.waitForTimeout(500);
        
        // Should show more reviews or open modal
        const newReviews = await page.locator('.review').count();
        const hasModal = await page.locator('[role="dialog"]').count() > 0;
        
        expect(newReviews > initialReviews || hasModal).toBeTruthy();
      }
    });
  });

  test.describe('Recommendations', () => {
    test('displays similar products with lazy loading', async ({ page }) => {
      const recommendationsSection = page.locator('[data-testid="recommendations"]')
        .or(page.locator('.recommendations-section'))
        .or(page.locator('.similar-products'))
        .first();

      if (await recommendationsSection.isVisible()) {
        // Should have section title
        const sectionTitle = recommendationsSection.locator('h2, h3, .section-title').first();
        await expect(sectionTitle).toBeVisible();
        
        // Should display product grid
        const productGrid = recommendationsSection.locator('.products-grid')
          .or(recommendationsSection.locator('.grid'));
          
        if (await productGrid.isVisible()) {
          const productCards = productGrid.locator('.product-card')
            .or(productGrid.locator('a[href*="/product/"]'));
            
          const cardCount = await productCards.count();
          expect(cardCount).toBeGreaterThan(0);
          
          // Images should be lazy loaded except first few
          for (let i = 0; i < Math.min(cardCount, 3); i++) {
            const card = productCards.nth(i);
            const img = card.locator('img');
            
            if (await img.isVisible()) {
              const loading = await img.getAttribute('loading');
              // Below-fold images should be lazy loaded
              if (i > 0) {
                expect(loading).toBe('lazy');
              }
            }
          }
        }
      }
    });

    test('allows navigation to recommended products', async ({ page }) => {
      const firstRecommendation = page.locator('.recommendations-section .product-card')
        .or(page.locator('.similar-products a[href*="/product/"]'))
        .first();

      if (await firstRecommendation.isVisible()) {
        // Should be a proper link
        const href = await firstRecommendation.getAttribute('href');
        expect(href).toContain('/product/');
        
        // Should have product info
        const productName = firstRecommendation.locator('.product-name, h4');
        const productPrice = firstRecommendation.locator('.product-price, .price');
        
        if (await productName.isVisible()) {
          const name = await productName.textContent();
          expect(name?.trim().length).toBeGreaterThan(0);
        }
        
        if (await productPrice.isVisible()) {
          const price = await productPrice.textContent();
          expect(price?.trim().length).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('adapts layout for mobile screens', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Product action bar should be visible on mobile
      const actionBar = page.locator('[data-testid="product-action-bar"]')
        .or(page.locator('.product-action-bar'))
        .or(page.locator('.mobile-actions'))
        .first();

      if (await actionBar.isVisible()) {
        // Should be positioned at bottom
        const position = await actionBar.evaluate(el => 
          window.getComputedStyle(el).position
        );
        expect(position).toBe('fixed');
        
        // Should contain main CTAs
        const buyButton = actionBar.locator('button:has-text("Buy")')
          .or(actionBar.locator('[data-testid="mobile-buy"]'));
        const messageButton = actionBar.locator('button:has-text("Message")')
          .or(actionBar.locator('[data-testid="mobile-message"]'));
          
        if (await buyButton.count() > 0) {
          await expect(buyButton.first()).toBeVisible();
        }
        if (await messageButton.count() > 0) {
          await expect(messageButton.first()).toBeVisible();
        }
      }
      
      // Gallery should adapt to mobile
      const gallery = page.locator('.product-gallery').first();
      if (await gallery.isVisible()) {
        const galleryStyles = await gallery.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            width: computed.width,
            aspectRatio: computed.aspectRatio
          };
        });
        
        // Should take full width on mobile
        expect(galleryStyles.width).toContain('100%');
      }
    });

    test('maintains touch target sizes on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Check all interactive elements have adequate touch targets
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < Math.min(buttonCount, 10); i++) {
        const button = buttons.nth(i);
        if (await button.isVisible()) {
          const boundingBox = await button.boundingBox();
          if (boundingBox) {
            // Primary actions should be 44px+, secondary 36px+
            expect(boundingBox.height).toBeGreaterThanOrEqual(36);
            expect(boundingBox.width).toBeGreaterThanOrEqual(36);
          }
        }
      }
    });
  });

  test.describe('Performance Metrics', () => {
    test('loads critical images with high priority', async ({ page }) => {
      // Hero/first product image should have fetchpriority="high"
      const heroImage = page.locator('img').first();
      if (await heroImage.isVisible()) {
        const fetchPriority = await heroImage.getAttribute('fetchpriority');
        const loading = await heroImage.getAttribute('loading');
        
        expect(fetchPriority).toBe('high');
        expect(loading).toBe('eager');
      }
    });

    test('lazy loads below-fold content', async ({ page }) => {
      // Recommendations should be lazy loaded
      const recommendationImages = page.locator('.recommendations-section img')
        .or(page.locator('.similar-products img'));
        
      const imageCount = await recommendationImages.count();
      if (imageCount > 0) {
        for (let i = 0; i < Math.min(imageCount, 3); i++) {
          const img = recommendationImages.nth(i);
          if (await img.isVisible()) {
            const loading = await img.getAttribute('loading');
            expect(loading).toBe('lazy');
          }
        }
      }
    });

    test('prevents layout shift with proper image dimensions', async ({ page }) => {
      // All images should have width and height attributes
      const images = page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < Math.min(imageCount, 5); i++) {
        const img = images.nth(i);
        if (await img.isVisible()) {
          const width = await img.getAttribute('width');
          const height = await img.getAttribute('height');
          
          // Images should have dimensions or CSS aspect-ratio
          const hasAspectRatio = await img.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return computed.aspectRatio !== 'auto';
          });
          
          expect(width && height || hasAspectRatio).toBeTruthy();
        }
      }
    });
  });
});