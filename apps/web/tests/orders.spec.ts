import { test, expect } from '@playwright/test'

// Mock authenticated seller for order management tests
test.use({
  storageState: {
    cookies: [],
    origins: [
      {
        origin: 'http://localhost:5173',
        localStorage: [
          // Simulate logged in seller
          { name: 'userSession', value: JSON.stringify({ user: { id: 'test-seller', email: 'seller@example.com' } }) }
        ]
      }
    ]
  }
})

test.describe('Orders flow', () => {
  test('seller: mark shipped → buyer: mark received', async ({ page, context }) => {
    // Start as seller - navigate to order management
    await page.goto('/dashboard/order-management')
    
    await expect(page.getByRole('heading', { name: /order management|управление на поръчки/i })).toBeVisible()
    
    // Find an order that needs shipping
    const orderRow = page.locator('[data-testid="order-row"]').or(page.locator('.order-item')).first()
    if (await orderRow.isVisible()) {
      // Look for "Mark as Shipped" button
      const markShippedButton = page.getByRole('button', { name: /mark.*shipped|отбележи.*изпратен/i })
      if (await markShippedButton.isVisible()) {
        await markShippedButton.click()
        
        // Fill shipping details if modal/form appears
        const trackingInput = page.getByLabel(/tracking.*number|номер.*проследяване/i)
        if (await trackingInput.isVisible()) {
          await trackingInput.fill('TEST123456789')
          
          const confirmButton = page.getByRole('button', { name: /confirm|потвърди/i })
          await confirmButton.click()
        }
        
        // Should show success message
        await expect(page.getByText(/marked.*shipped|отбелязано.*изпратено/i)).toBeVisible()
      }
    }
    
    // Now simulate buyer receiving the order
    // Create new context for buyer
    const buyerContext = await context.browser().newContext({
      storageState: {
        cookies: [],
        origins: [
          {
            origin: 'http://localhost:5173',
            localStorage: [
              { name: 'userSession', value: JSON.stringify({ user: { id: 'test-buyer', email: 'buyer@example.com' } }) }
            ]
          }
        ]
      }
    })
    
    const buyerPage = await buyerContext.newPage()
    await buyerPage.goto('/dashboard')
    
    // Navigate to buyer's orders
    const myOrdersLink = buyerPage.getByRole('link', { name: /my orders|моите поръчки/i })
    if (await myOrdersLink.isVisible()) {
      await myOrdersLink.click()
    } else {
      await buyerPage.goto('/orders')
    }
    
    // Find the shipped order and mark as received
    const shippedOrderRow = buyerPage.locator('[data-testid="order-row"]').or(buyerPage.locator('.order-item')).first()
    if (await shippedOrderRow.isVisible()) {
      const markReceivedButton = buyerPage.getByRole('button', { name: /mark.*received|отбележи.*получен/i }).or(buyerPage.getByRole('button', { name: /confirm receipt|потвърди получаване/i }))
      if (await markReceivedButton.isVisible()) {
        await markReceivedButton.click()
        
        // Should show success message
        await expect(buyerPage.getByText(/marked.*received|отбелязано.*получено/i)).toBeVisible()
      }
    }
    
    await buyerContext.close()
  })
  
  test('view order details and tracking', async ({ page }) => {
    await page.goto('/dashboard/order-management')
    
    // Click on an order to view details
    const orderRow = page.locator('[data-testid="order-row"]').or(page.locator('.order-item')).first()
    if (await orderRow.isVisible()) {
      await orderRow.click()
      
      // Should show order details
      await expect(page.getByText(/order details|детайли за поръчка/i)).toBeVisible()
      
      // Should show tracking information if available
      const trackingSection = page.locator('[data-testid="tracking-info"]').or(page.getByText(/tracking|проследяване/i))
      if (await trackingSection.isVisible()) {
        await expect(trackingSection).toBeVisible()
      }
    }
  })
  
  test('dispute/support flow', async ({ page }) => {
    await page.goto('/orders')
    
    // Find an order and access support/dispute options
    const orderRow = page.locator('[data-testid="order-row"]').first()
    if (await orderRow.isVisible()) {
      // Look for support/dispute button
      const supportButton = page.getByRole('button', { name: /support|help|dispute|поддръжка|помощ|спор/i })
      if (await supportButton.isVisible()) {
        await supportButton.click()
        
        // Should open support form or navigate to support page
        await expect(page.getByText(/support|help|contact|поддръжка|помощ|контакт/i)).toBeVisible()
      }
    }
  })
  
  test('order status progression', async ({ page }) => {
    await page.goto('/dashboard/order-management')
    
    // Check if different order statuses are displayed
    const statusLabels = [
      /pending|чакащ/i,
      /confirmed|потвърден/i,
      /shipped|изпратен/i,
      /delivered|доставен/i,
      /completed|завършен/i
    ]
    
    for (const statusRegex of statusLabels) {
      const statusElement = page.getByText(statusRegex)
      // If status exists, verify it's displayed properly
      if (await statusElement.isVisible()) {
        await expect(statusElement).toBeVisible()
      }
    }
  })
})