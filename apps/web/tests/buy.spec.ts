import { test, expect } from '@playwright/test'

// Mock authenticated user for buy tests
test.use({
  storageState: {
    cookies: [],
    origins: [
      {
        origin: 'http://localhost:5173',
        localStorage: [
          // Simulate logged in user
          { name: 'userSession', value: JSON.stringify({ user: { id: 'test-buyer', email: 'buyer@example.com' } }) }
        ]
      }
    ]
  }
})

test.describe('Buy/Checkout flow', () => {
  test('checkout flow (test keys) → order visible', async ({ page }) => {
    // First go to a product page (assuming we have products available)
    await page.goto('/')
    
    // Find and click on a product
    const productCard = page.locator('[data-testid="product-card"]').or(page.locator('.product-card')).first()
    if (await productCard.isVisible()) {
      await productCard.click()
    } else {
      // Alternative: navigate directly to product if no products on homepage
      await page.goto('/product/test-product-id')
    }
    
    // Should be on product page
    await expect(page).toHaveURL(/product\//)
    
    // Find and click buy/purchase button
    const buyButton = page.getByRole('button', { name: /buy now|купи сега/i }).or(page.getByRole('button', { name: /purchase|закупи/i }))
    await expect(buyButton).toBeVisible()
    await buyButton.click()
    
    // Should navigate to checkout
    await expect(page).toHaveURL(/checkout\//)
    await expect(page.getByRole('heading', { name: /checkout|плащане/i })).toBeVisible()
    
    // Fill shipping information if required
    const shippingForm = page.locator('[data-testid="shipping-form"]').or(page.getByText(/shipping address|адрес за доставка/i))
    if (await shippingForm.isVisible()) {
      await page.getByLabel(/full name|пълно име/i).fill('Test Buyer')
      await page.getByLabel(/address|адрес/i).fill('123 Test Street')
      await page.getByLabel(/city|град/i).fill('Test City')
      await page.getByLabel(/postal code|пощенски код/i).fill('12345')
    }
    
    // Fill payment information (test card details)
    const cardNumberInput = page.getByLabel(/card number|номер на карта/i).or(page.locator('[data-testid="card-number"]'))
    if (await cardNumberInput.isVisible()) {
      await cardNumberInput.fill('4242424242424242') // Test card number
      await page.getByLabel(/expiry|валидност/i).fill('12/25')
      await page.getByLabel(/cvc|cvv/i).fill('123')
      await page.getByLabel(/cardholder name|име на картодържател/i).fill('Test Buyer')
    }
    
    // Submit payment
    const completeOrderButton = page.getByRole('button', { name: /complete order|завърши поръчка/i }).or(page.getByRole('button', { name: /pay now|плати сега/i }))
    await completeOrderButton.click()
    
    // Wait for payment processing
    await page.waitForLoadState('networkidle')
    
    // Should redirect to success/confirmation page or order details
    await expect(page).toHaveURL(/order|success|dashboard/)
    
    // Check for success message
    await expect(page.getByText(/order confirmed|поръчката е потвърдена/i).or(page.getByText(/payment successful|плащането е успешно/i))).toBeVisible()
    
    // Navigate to orders to verify order is visible
    await page.goto('/dashboard')
    
    // Look for orders section or navigate to dedicated orders page
    const ordersLink = page.getByRole('link', { name: /orders|поръчки/i })
    if (await ordersLink.isVisible()) {
      await ordersLink.click()
    } else {
      // Try direct navigation to orders
      await page.goto('/orders')
    }
    
    // Verify order appears in list
    await expect(page.getByText(/test-product|recent order/i).or(page.locator('[data-testid="order-item"]')).first()).toBeVisible()
  })
  
  test('require authentication for checkout', async ({ page }) => {
    // Clear any existing auth
    await page.context().clearCookies()
    
    // Try to access checkout without auth
    await page.goto('/checkout/test-product-id')
    
    // Should redirect to login
    await expect(page).toHaveURL(/login/)
  })
  
  test('payment validation with invalid card', async ({ page }) => {
    // Navigate to a product and start checkout
    await page.goto('/product/test-product-id')
    await page.getByRole('button', { name: /buy now|купи сега/i }).click()
    
    // Fill invalid card details
    const cardNumberInput = page.getByLabel(/card number|номер на карта/i)
    if (await cardNumberInput.isVisible()) {
      await cardNumberInput.fill('4000000000000002') // Declined test card
      await page.getByLabel(/expiry|валидност/i).fill('12/25')
      await page.getByLabel(/cvc|cvv/i).fill('123')
      
      // Submit payment
      const completeOrderButton = page.getByRole('button', { name: /complete order|завърши поръчка/i })
      await completeOrderButton.click()
      
      // Should show error message
      await expect(page.getByText(/payment failed|declined|неуспешно плащане/i)).toBeVisible()
    }
  })
  
  test('bundle checkout flow', async ({ page }) => {
    // Test bundle checkout if available
    await page.goto('/checkout/bundle')
    
    await expect(page.getByRole('heading', { name: /bundle|пакет/i })).toBeVisible()
    
    // Should show multiple items
    const bundleItems = page.locator('[data-testid="bundle-item"]').or(page.locator('.bundle-item'))
    await expect(bundleItems.first()).toBeVisible()
    
    // Continue with checkout process similar to single item
    const completeOrderButton = page.getByRole('button', { name: /complete order|завърши поръчка/i })
    if (await completeOrderButton.isVisible()) {
      // Fill minimal required info and test
      await completeOrderButton.click()
      
      // Should either proceed to payment or show validation errors
      await expect(page.getByText(/payment|error|плащане|грешка/i)).toBeVisible()
    }
  })
})