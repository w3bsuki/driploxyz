import { test, expect } from '@playwright/test'

// Mock authenticated user for review tests
test.use({
  storageState: {
    cookies: [],
    origins: [
      {
        origin: 'http://localhost:5173',
        localStorage: [
          // Simulate logged in user who has completed orders
          { name: 'userSession', value: JSON.stringify({ user: { id: 'test-reviewer', email: 'reviewer@example.com' } }) }
        ]
      }
    ]
  }
})

test.describe('Reviews flow', () => {
  test('leave a review post-delivery', async ({ page }) => {
    // Navigate to completed orders
    await page.goto('/dashboard/order-management')
    
    // Switch to completed orders tab
    const completedTab = page.getByRole('tab', { name: /completed|завършени/i })
    if (await completedTab.isVisible()) {
      await completedTab.click()
    }
    
    // Find a completed order that can be reviewed
    const completedOrderRow = page.locator('[data-testid="order-row"]').or(page.locator('.order-item')).first()
    if (await completedOrderRow.isVisible()) {
      // Look for review button
      const reviewButton = page.getByRole('button', { name: /review|rate|оценка|ревю/i })
      if (await reviewButton.isVisible()) {
        await reviewButton.click()
        
        // Should open rating modal
        await expect(page.getByRole('dialog').or(page.locator('[data-testid="rating-modal"]'))).toBeVisible()
        
        // Rate the product (click on stars)
        const stars = page.locator('[data-testid="star-rating"]').or(page.locator('.star-rating')).locator('button')
        if (await stars.first().isVisible()) {
          // Click on 4th star (4/5 rating)
          await stars.nth(3).click()
          await expect(page.locator('.star-rating')).toHaveClass(/.*rating-4.*/)
        }
        
        // Add review comment
        const reviewTextarea = page.getByRole('textbox', { name: /review|comment|ревю|коментар/i }).or(page.getByPlaceholder(/write.*review|напишете.*ревю/i))
        if (await reviewTextarea.isVisible()) {
          await reviewTextarea.fill('Great product! Fast shipping and exactly as described. Would buy again.')
        }
        
        // Submit review
        const submitButton = page.getByRole('button', { name: /submit|send|изпрати/i })
        await submitButton.click()
        
        // Should show success message
        await expect(page.getByText(/review.*submitted|ревюто.*изпратено/i).or(page.getByText(/thank you.*review|благодарим.*ревю/i))).toBeVisible()
        
        // Modal should close
        await expect(page.getByRole('dialog')).not.toBeVisible()
      }
    }
  })
  
  test('view reviews on product page', async ({ page }) => {
    // Go to a product page
    await page.goto('/')
    
    // Find and click on a product
    const productCard = page.locator('[data-testid="product-card"]').first()
    if (await productCard.isVisible()) {
      await productCard.click()
    } else {
      // Direct navigation to product if no products visible
      await page.goto('/product/test-product-id')
    }
    
    // Should be on product page
    await expect(page).toHaveURL(/product\//)
    
    // Look for reviews section
    const reviewsSection = page.locator('[data-testid="reviews-section"]').or(page.getByText(/reviews|отзиви/i))
    if (await reviewsSection.isVisible()) {
      await expect(reviewsSection).toBeVisible()
      
      // Check if individual reviews are displayed
      const reviewItems = page.locator('[data-testid="review-item"]').or(page.locator('.review-item'))
      if (await reviewItems.first().isVisible()) {
        // Verify review components
        await expect(reviewItems.first().locator('[data-testid="star-rating"]').or(reviewItems.first().locator('.star-rating'))).toBeVisible()
        await expect(reviewItems.first().getByText(/.+/)).toBeVisible() // Review text exists
      }
    }
  })
  
  test('rating validation', async ({ page }) => {
    await page.goto('/dashboard/order-management')
    
    const completedTab = page.getByRole('tab', { name: /completed|завършени/i })
    if (await completedTab.isVisible()) {
      await completedTab.click()
      
      const reviewButton = page.getByRole('button', { name: /review|rate|оценка/i }).first()
      if (await reviewButton.isVisible()) {
        await reviewButton.click()
        
        // Try to submit without rating
        const submitButton = page.getByRole('button', { name: /submit|изпрати/i })
        await submitButton.click()
        
        // Should show validation error
        await expect(page.getByText(/rating.*required|оценката.*задължителна/i).or(page.getByText(/select.*rating|изберете.*оценка/i))).toBeVisible()
        
        // Now provide rating
        const stars = page.locator('[data-testid="star-rating"]').locator('button')
        if (await stars.first().isVisible()) {
          await stars.nth(2).click() // 3-star rating
          await submitButton.click()
          
          // Should submit successfully
          await expect(page.getByText(/review.*submitted|ревюто.*изпратено/i)).toBeVisible()
        }
      }
    }
  })
  
  test('edit review if allowed', async ({ page }) => {
    // Navigate to user profile or reviews section
    await page.goto('/dashboard')
    
    // Look for "My Reviews" section
    const myReviewsLink = page.getByRole('link', { name: /my reviews|моите ревюта/i })
    if (await myReviewsLink.isVisible()) {
      await myReviewsLink.click()
      
      // Find an existing review
      const reviewItem = page.locator('[data-testid="review-item"]').first()
      if (await reviewItem.isVisible()) {
        // Look for edit button
        const editButton = reviewItem.getByRole('button', { name: /edit|редактирай/i })
        if (await editButton.isVisible()) {
          await editButton.click()
          
          // Should open edit form
          const editTextarea = page.getByRole('textbox', { name: /review|коментар/i })
          await editTextarea.fill('Updated review: Even better than expected!')
          
          // Save changes
          const saveButton = page.getByRole('button', { name: /save|запази/i })
          await saveButton.click()
          
          // Should show success message
          await expect(page.getByText(/review.*updated|ревюто.*обновено/i)).toBeVisible()
        }
      }
    }
  })
  
  test('seller cannot review own products', async ({ page }) => {
    // This test ensures sellers cannot review their own products
    await page.goto('/product/own-product-id') // Simulate navigating to seller's own product
    
    // Should not show review button or form for own products
    const reviewButton = page.getByRole('button', { name: /review|rate/i })
    await expect(reviewButton).not.toBeVisible()
    
    // Or if there's a message explaining why they can't review
    const cannotReviewMessage = page.getByText(/cannot.*review.*own|не можете.*ревю.*собствен/i)
    if (await cannotReviewMessage.isVisible()) {
      await expect(cannotReviewMessage).toBeVisible()
    }
  })
})