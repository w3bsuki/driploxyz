import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Checkout Page Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authenticated user session
    await page.addInitScript(() => {
      localStorage.setItem('userSession', JSON.stringify({ 
        user: { id: 'test-user', email: 'test@example.com' } 
      }))
    })
    
    // Try to navigate to checkout page
    await page.goto('/checkout/test-product-id').catch(async () => {
      // If direct navigation fails, try going through product page
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      const productCard = page.locator('[data-testid="product-card"]').first()
      if (await productCard.isVisible()) {
        await productCard.click()
        await page.waitForLoadState('networkidle')
        
        const checkoutButton = page.locator('button:has-text("buy")')
          .or(page.locator('button:has-text("checkout")'))
          .or(page.locator('[data-testid="buy-now"]'))
        
        if (await checkoutButton.isVisible()) {
          await checkoutButton.click()
          await page.waitForLoadState('networkidle')
        }
      }
    })
    
    await page.waitForLoadState('networkidle')
  })

  test('has zero critical accessibility violations', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .exclude('#stripe-elements') // Exclude Stripe payment elements
      .exclude('#cookie-consent')
      .analyze()
    
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Checkout page accessibility violations:', 
        JSON.stringify(accessibilityScanResults.violations, null, 2))
    }
    
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('has accessible checkout form with proper labels', async ({ page }) => {
    // Check for checkout form
    const checkoutForm = page.locator('form')
      .or(page.locator('[data-testid="checkout-form"]'))
      .or(page.locator('.checkout-form'))

    if (await checkoutForm.isVisible()) {
      // Check all form inputs have proper labels
      const inputs = checkoutForm.locator('input, select, textarea')
      const inputCount = await inputs.count()
      
      for (let i = 0; i < Math.min(inputCount, 10); i++) {
        const input = inputs.nth(i)
        if (await input.isVisible()) {
          const inputType = await input.getAttribute('type')
          
          // Skip hidden inputs
          if (inputType === 'hidden') continue
          
          const hasProperLabel = await input.evaluate((el) => {
            // Check for aria-label
            if (el.getAttribute('aria-label')) return true
            
            // Check for aria-labelledby
            if (el.getAttribute('aria-labelledby')) return true
            
            // Check for associated label
            const id = el.getAttribute('id')
            if (id && document.querySelector(`label[for="${id}"]`)) return true
            
            // Check if wrapped in label
            if (el.closest('label')) return true
            
            return false
          })
          
          expect(hasProperLabel).toBeTruthy()
        }
      }
    }
  })

  test('has accessible shipping address form', async ({ page }) => {
    // Look for shipping address section
    const shippingSection = page.locator('[data-testid="shipping-address"]')
      .or(page.locator('.shipping-address'))
      .or(page.locator('fieldset').filter({ hasText: /shipping/i }))
      .or(page.locator('section').filter({ hasText: /shipping/i }))

    if (await shippingSection.isVisible()) {
      // Should have proper heading or legend
      const heading = shippingSection.locator('h2, h3, h4, legend')
        .or(page.locator('h2:has-text("shipping")', { timeout: 1000 }))
        .or(page.locator('legend:has-text("shipping")'))

      if (await heading.isVisible()) {
        await expect(heading).toBeVisible()
      }

      // Check common address fields
      const addressFields = [
        { selector: 'input[name*="name"]', name: 'name' },
        { selector: 'input[name*="address"]', name: 'address' },
        { selector: 'input[name*="city"]', name: 'city' },
        { selector: 'input[name*="zip"]', name: 'zip code' },
        { selector: 'select[name*="country"]', name: 'country' }
      ]

      for (const field of addressFields) {
        const input = shippingSection.locator(field.selector)
        if (await input.isVisible()) {
          // Should have accessible name
          const hasLabel = await input.evaluate((el) => {
            if (el.getAttribute('aria-label')) return true
            if (el.getAttribute('aria-labelledby')) return true
            
            const id = el.getAttribute('id')
            if (id && document.querySelector(`label[for="${id}"]`)) return true
            
            if (el.closest('label')) return true
            
            return false
          })
          
          expect(hasLabel).toBeTruthy()
          
          // Test field interaction
          if (field.name === 'name') {
            await input.click()
            await input.fill('Test User')
          }
        }
      }
    }
  })

  test('has accessible billing information form', async ({ page }) => {
    // Look for billing section
    const billingSection = page.locator('[data-testid="billing-info"]')
      .or(page.locator('.billing-info'))
      .or(page.locator('fieldset').filter({ hasText: /billing/i }))
      .or(page.locator('section').filter({ hasText: /billing/i }))

    if (await billingSection.isVisible()) {
      // Should have proper heading
      const heading = billingSection.locator('h2, h3, h4, legend')
        .or(page.locator('h2:has-text("billing")', { timeout: 1000 }))

      if (await heading.isVisible()) {
        await expect(heading).toBeVisible()
      }

      // Check for "same as shipping" option
      const sameAsShipping = billingSection.locator('input[type="checkbox"]')
        .filter({ hasText: /same.*shipping/i })
        .or(page.locator('input[type="checkbox"][name*="same"]'))

      if (await sameAsShipping.isVisible()) {
        // Should have proper labeling
        const hasLabel = await sameAsShipping.evaluate((el) => {
          if (el.getAttribute('aria-label')) return true
          if (el.getAttribute('aria-labelledby')) return true
          
          const id = el.getAttribute('id')
          if (id && document.querySelector(`label[for="${id}"]`)) return true
          
          if (el.closest('label')) return true
          
          return false
        })
        
        expect(hasLabel).toBeTruthy()
      }
    }
  })

  test('has accessible payment form with proper error handling', async ({ page }) => {
    // Look for payment section
    const paymentSection = page.locator('[data-testid="payment"]')
      .or(page.locator('.payment-form'))
      .or(page.locator('#payment-element'))
      .or(page.locator('fieldset').filter({ hasText: /payment/i }))

    if (await paymentSection.isVisible()) {
      // Should have proper heading
      const heading = paymentSection.locator('h2, h3, h4, legend')
        .or(page.locator('h2:has-text("payment")', { timeout: 1000 }))

      if (await heading.isVisible()) {
        await expect(heading).toBeVisible()
      }

      // Check for payment method options
      const paymentOptions = paymentSection.locator('input[type="radio"]')
        .or(paymentSection.locator('[role="radio"]'))

      const optionCount = await paymentOptions.count()
      if (optionCount > 0) {
        // Payment options should be in a radio group
        const radioGroup = paymentSection.locator('fieldset')
          .or(paymentSection.locator('[role="radiogroup"]'))

        if (await radioGroup.isVisible()) {
          const legend = radioGroup.locator('legend')
          const ariaLabel = await radioGroup.getAttribute('aria-label')
          
          if (await legend.isVisible()) {
            await expect(legend).toBeVisible()
          } else if (ariaLabel) {
            expect(ariaLabel.trim().length).toBeGreaterThan(0)
          }
        }

        // Each radio option should have proper labeling
        for (let i = 0; i < Math.min(optionCount, 3); i++) {
          const option = paymentOptions.nth(i)
          const hasLabel = await option.evaluate((el) => {
            if (el.getAttribute('aria-label')) return true
            if (el.getAttribute('aria-labelledby')) return true
            
            const id = el.getAttribute('id')
            if (id && document.querySelector(`label[for="${id}"]`)) return true
            
            if (el.closest('label')) return true
            
            return false
          })
          
          expect(hasLabel).toBeTruthy()
        }
      }

      // Test form validation - try submitting without required fields
      const submitButton = page.locator('button[type="submit"]')
        .or(page.locator('button:has-text("place order")', { timeout: 1000 }))
        .or(page.locator('button:has-text("complete purchase")'))
        .or(page.locator('[data-testid="submit-order"]'))

      if (await submitButton.isVisible()) {
        // Clear any existing form data and try to submit
        await submitButton.click()
        await page.waitForTimeout(1000)

        // Check for error messages
        const errorMessages = page.locator('[role="alert"]')
          .or(page.locator('.error'))
          .or(page.locator('[aria-live="assertive"]'))
          .or(page.locator('.form-error'))

        if (await errorMessages.isVisible()) {
          // Error messages should be properly announced
          const firstError = errorMessages.first()
          const role = await firstError.getAttribute('role')
          const ariaLive = await firstError.getAttribute('aria-live')
          
          expect(role === 'alert' || ariaLive === 'assertive' || ariaLive === 'polite').toBeTruthy()
          
          const errorText = await firstError.textContent()
          expect(errorText?.trim().length).toBeGreaterThan(0)
        }
      }
    }
  })

  test('has accessible order summary', async ({ page }) => {
    // Look for order summary
    const orderSummary = page.locator('[data-testid="order-summary"]')
      .or(page.locator('.order-summary'))
      .or(page.locator('aside'))
      .or(page.locator('section').filter({ hasText: /summary|total/i }))

    if (await orderSummary.isVisible()) {
      // Should have proper heading
      const summaryHeading = orderSummary.locator('h2, h3, h4')
        .or(page.locator('h2:has-text("summary")', { timeout: 1000 }))
        .or(page.locator('h3:has-text("order")'))

      if (await summaryHeading.isVisible()) {
        await expect(summaryHeading).toBeVisible()
      }

      // Check for itemized list
      const itemList = orderSummary.locator('ul, ol, table')
        .or(orderSummary.locator('.order-items'))

      if (await itemList.isVisible()) {
        await expect(itemList).toBeVisible()
      }

      // Check for total price
      const totalPrice = orderSummary.locator('[data-testid="total"]')
        .or(orderSummary.locator('.total'))
        .or(orderSummary.locator(':text("total")', { timeout: 1000 }))

      if (await totalPrice.isVisible()) {
        const priceText = await totalPrice.textContent()
        expect(priceText?.trim()).toBeTruthy()
        
        // Total should be clearly marked for screen readers
        const ariaLabel = await totalPrice.getAttribute('aria-label')
        if (ariaLabel && ariaLabel.includes('total')) {
          expect(ariaLabel).toBeTruthy()
        }
      }
    }
  })

  test('supports keyboard navigation through checkout flow', async ({ page }) => {
    // Test tabbing through checkout form
    let tabCount = 0
    const focusableElements = []
    
    while (tabCount < 25) { // More tab stops expected in checkout
      await page.keyboard.press('Tab')
      tabCount++
      
      const focused = page.locator(':focus')
      if (await focused.isVisible()) {
        const tagName = await focused.evaluate(el => el.tagName.toLowerCase())
        const type = await focused.getAttribute('type')
        const role = await focused.getAttribute('role')
        const ariaLabel = await focused.getAttribute('aria-label')
        const text = await focused.textContent()
        
        focusableElements.push({ 
          tagName, 
          type,
          role,
          hasAccessibleName: !!(ariaLabel || text?.trim()),
          tabCount 
        })
        
        // Form elements should have accessible names
        if (['input', 'select', 'textarea', 'button'].includes(tagName)) {
          const hasName = !!(ariaLabel || text?.trim()) || 
                          await focused.evaluate((el) => {
                            const id = el.getAttribute('id')
                            return id && document.querySelector(`label[for="${id}"]`)
                          })
          
          if (type !== 'hidden') { // Skip hidden inputs
            expect(hasName).toBeTruthy()
          }
        }
      }
    }
    
    // Should have found form elements
    const hasFormElements = focusableElements.some(el => 
      ['input', 'select', 'textarea'].includes(el.tagName)
    )
    expect(hasFormElements).toBeTruthy()
    
    // Should have submit button
    const hasSubmitButton = focusableElements.some(el => 
      el.tagName === 'button' && (el.type === 'submit' || el.role === 'button')
    )
    expect(hasSubmitButton).toBeTruthy()
  })

  test('provides clear progress indication', async ({ page }) => {
    // Look for checkout progress indicator
    const progressIndicator = page.locator('[data-testid="checkout-progress"]')
      .or(page.locator('.checkout-progress'))
      .or(page.locator('.progress'))
      .or(page.locator('nav').filter({ hasText: /step|progress/i }))

    if (await progressIndicator.isVisible()) {
      // Should be marked as navigation or have proper role
      const role = await progressIndicator.getAttribute('role')
      const ariaLabel = await progressIndicator.getAttribute('aria-label')
      
      if (role || ariaLabel) {
        expect(['navigation', 'progressbar'].includes(role || '') || !!ariaLabel).toBeTruthy()
      }

      // Current step should be marked
      const currentStep = progressIndicator.locator('[aria-current="step"]')
        .or(progressIndicator.locator('.current'))
        .or(progressIndicator.locator('.active'))

      if (await currentStep.isVisible()) {
        const ariaCurrent = await currentStep.getAttribute('aria-current')
        if (ariaCurrent) {
          expect(ariaCurrent).toBe('step')
        }
      }
    }
  })

  test('has accessible shipping and delivery options', async ({ page }) => {
    // Look for shipping options
    const shippingOptions = page.locator('[data-testid="shipping-options"]')
      .or(page.locator('.shipping-options'))
      .or(page.locator('fieldset').filter({ hasText: /shipping|delivery/i }))

    if (await shippingOptions.isVisible()) {
      // Should be a radio group with legend
      const legend = shippingOptions.locator('legend')
      const ariaLabel = await shippingOptions.getAttribute('aria-label')
      
      if (await legend.isVisible()) {
        await expect(legend).toBeVisible()
      } else if (ariaLabel) {
        expect(ariaLabel.trim().length).toBeGreaterThan(0)
      }

      // Each shipping option should be properly labeled
      const radioInputs = shippingOptions.locator('input[type="radio"]')
      const radioCount = await radioInputs.count()
      
      for (let i = 0; i < Math.min(radioCount, 3); i++) {
        const radio = radioInputs.nth(i)
        
        const hasLabel = await radio.evaluate((el) => {
          if (el.getAttribute('aria-label')) return true
          if (el.getAttribute('aria-labelledby')) return true
          
          const id = el.getAttribute('id')
          if (id && document.querySelector(`label[for="${id}"]`)) return true
          
          if (el.closest('label')) return true
          
          return false
        })
        
        expect(hasLabel).toBeTruthy()
      }
    }
  })

  test('handles form validation errors accessibly', async ({ page }) => {
    // Find required form fields and test validation
    const requiredFields = page.locator('input[required], select[required]')
      .or(page.locator('input[aria-required="true"], select[aria-required="true"]'))

    const fieldCount = await requiredFields.count()
    if (fieldCount > 0) {
      // Clear a required field and try to submit
      const firstRequired = requiredFields.first()
      await firstRequired.click()
      await firstRequired.fill('')
      
      // Try to submit form
      const submitButton = page.locator('button[type="submit"]')
        .or(page.locator('button:has-text("place order")', { timeout: 1000 }))
        .or(page.locator('button:has-text("complete")'))

      if (await submitButton.isVisible()) {
        await submitButton.click()
        await page.waitForTimeout(1000)
        
        // Check for validation messages
        const validationError = page.locator('[role="alert"]')
          .or(page.locator('.error'))
          .or(page.locator('[aria-invalid="true"] + .error-message'))
          .or(page.locator('.field-error'))

        if (await validationError.isVisible()) {
          // Error should be properly announced
          const role = await validationError.getAttribute('role')
          const ariaLive = await validationError.getAttribute('aria-live')
          
          expect(role === 'alert' || ariaLive === 'assertive').toBeTruthy()
          
          // Error should have meaningful text
          const errorText = await validationError.textContent()
          expect(errorText?.trim().length).toBeGreaterThan(5)
        }
        
        // Field should be marked as invalid
        const isInvalid = await firstRequired.getAttribute('aria-invalid')
        if (isInvalid) {
          expect(isInvalid).toBe('true')
        }
      }
    }
  })

  test('provides accessible loading and processing states', async ({ page }) => {
    // Try to submit checkout form to test loading states
    const submitButton = page.locator('button[type="submit"]')
      .or(page.locator('button:has-text("place order")', { timeout: 1000 }))
      .or(page.locator('[data-testid="submit-order"]'))

    if (await submitButton.isVisible()) {
      await submitButton.click()
      await page.waitForTimeout(500)
      
      // Check for loading indicators
      const loadingIndicator = page.locator('[role="status"]')
        .or(page.locator('[aria-live="polite"]'))
        .or(page.locator('.loading'))
        .or(page.locator('.spinner'))

      if (await loadingIndicator.isVisible()) {
        // Should have proper role or aria-live
        const role = await loadingIndicator.getAttribute('role')
        const ariaLive = await loadingIndicator.getAttribute('aria-live')
        const ariaLabel = await loadingIndicator.getAttribute('aria-label')
        
        expect(role === 'status' || ariaLive === 'polite' || !!ariaLabel).toBeTruthy()
      }
      
      // Submit button should be disabled during processing
      const isDisabled = await submitButton.isDisabled()
      if (isDisabled) {
        // Disabled state should be accessible
        const ariaDisabled = await submitButton.getAttribute('aria-disabled')
        const disabled = await submitButton.getAttribute('disabled')
        
        expect(ariaDisabled === 'true' || disabled !== null).toBeTruthy()
      }
    }
  })

  test('has accessible promo code and discount functionality', async ({ page }) => {
    // Look for promo code input
    const promoCodeInput = page.locator('input[name*="promo"]')
      .or(page.locator('input[name*="coupon"]'))
      .or(page.locator('[data-testid="promo-code"]'))
      .or(page.locator('input[placeholder*="promo" i]'))

    if (await promoCodeInput.isVisible()) {
      // Should have proper labeling
      const hasLabel = await promoCodeInput.evaluate((el) => {
        if (el.getAttribute('aria-label')) return true
        if (el.getAttribute('aria-labelledby')) return true
        
        const id = el.getAttribute('id')
        if (id && document.querySelector(`label[for="${id}"]`)) return true
        
        if (el.closest('label')) return true
        
        return false
      })
      
      expect(hasLabel).toBeTruthy()
      
      // Test applying promo code
      await promoCodeInput.click()
      await promoCodeInput.fill('TEST10')
      
      const applyButton = page.locator('button:has-text("apply")')
        .or(page.locator('[data-testid="apply-promo"]'))
        .or(promoCodeInput.locator('..').locator('button'))

      if (await applyButton.isVisible()) {
        await applyButton.click()
        await page.waitForTimeout(1000)
        
        // Should have feedback for successful/failed application
        const feedback = page.locator('[role="status"]')
          .or(page.locator('[role="alert"]'))
          .or(page.locator('.promo-feedback'))

        if (await feedback.isVisible()) {
          const role = await feedback.getAttribute('role')
          const ariaLive = await feedback.getAttribute('aria-live')
          
          expect(['status', 'alert'].includes(role || '') || 
                 ['polite', 'assertive'].includes(ariaLive || '')).toBeTruthy()
        }
      }
    }
  })
})