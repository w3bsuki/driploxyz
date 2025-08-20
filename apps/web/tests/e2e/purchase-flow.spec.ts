import { test, expect } from '@playwright/test';
import { 
  createTestUser, 
  loginUser, 
  createTestProduct, 
  generateTestEmail 
} from '../utils/test-helpers';

test.describe('Purchase Flow', () => {
  let sellerEmail: string;
  let buyerEmail: string;
  let productId: string;
  const password = 'TestPassword123!';

  test.beforeAll(async () => {
    // Create seller and buyer accounts
    sellerEmail = generateTestEmail('seller');
    buyerEmail = generateTestEmail('buyer');
    
    await createTestUser(sellerEmail, password);
    await createTestUser(buyerEmail, password);
    
    // Create a test product as seller
    productId = await createTestProduct({
      sellerId: sellerEmail,
      title: 'Test Product for Purchase',
      price: 49.99,
      category: 'Clothing',
      condition: 'new'
    });
  });

  test('should complete full purchase journey', async ({ page }) => {
    // Login as buyer
    await loginUser(page, buyerEmail, password);
    
    // Navigate to product
    await page.goto(`/product/${productId}`);
    
    // Verify product details
    await expect(page.getByRole('heading', { name: 'Test Product for Purchase' })).toBeVisible();
    await expect(page.getByText('$49.99')).toBeVisible();
    await expect(page.getByText('New with tags')).toBeVisible();

    // Add to favorites first
    await page.getByRole('button', { name: 'Add to favorites' }).click();
    await expect(page.getByRole('button', { name: 'Remove from favorites' })).toBeVisible();

    // Click Buy Now
    await page.getByRole('button', { name: 'Buy Now' }).click();
    
    // Should navigate to checkout
    await expect(page).toHaveURL('/checkout');
    await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible();

    // Review order summary
    await expect(page.getByText('Test Product for Purchase')).toBeVisible();
    await expect(page.getByText('Item price: $49.99')).toBeVisible();
    await expect(page.getByText('Shipping: $5.99')).toBeVisible();
    await expect(page.getByText('Service fee: $2.50')).toBeVisible();
    await expect(page.getByText('Total: $58.48')).toBeVisible();

    // Fill shipping address
    await page.getByLabel('Full Name').fill('Test Buyer');
    await page.getByLabel('Street Address').fill('123 Test Street');
    await page.getByLabel('City').fill('Test City');
    await page.getByLabel('State').selectOption('CA');
    await page.getByLabel('ZIP Code').fill('90210');
    await page.getByLabel('Phone').fill('555-0123');

    // Select shipping method
    await page.getByRole('radio', { name: 'Standard Shipping (5-7 days)' }).check();

    // Continue to payment
    await page.getByRole('button', { name: 'Continue to Payment' }).click();

    // Fill payment details (Stripe test card)
    const stripeFrame = page.frameLocator('iframe[name*="stripe"]').first();
    await stripeFrame.getByPlaceholder('Card number').fill('4242 4242 4242 4242');
    await stripeFrame.getByPlaceholder('MM / YY').fill('12/25');
    await stripeFrame.getByPlaceholder('CVC').fill('123');
    
    // Review and confirm order
    await page.getByLabel('Save payment method for future purchases').check();
    await page.getByRole('button', { name: 'Place Order' }).click();

    // Wait for payment processing
    await expect(page.getByText('Processing payment...')).toBeVisible();
    
    // Success page
    await expect(page).toHaveURL(/\/order\/confirmation/);
    await expect(page.getByRole('heading', { name: 'Order Confirmed!' })).toBeVisible();
    await expect(page.getByText('Thank you for your purchase')).toBeVisible();
    
    // Order details should be visible
    await expect(page.getByText(/Order #[\w-]+/)).toBeVisible();
    await expect(page.getByText('Test Product for Purchase')).toBeVisible();
    await expect(page.getByText('Total paid: $58.48')).toBeVisible();
    
    // Tracking information
    await expect(page.getByText('Tracking information will be sent to your email')).toBeVisible();
  });

  test('should handle Make an Offer flow', async ({ page }) => {
    await loginUser(page, buyerEmail, password);
    await page.goto(`/product/${productId}`);
    
    // Click Make an Offer
    await page.getByRole('button', { name: 'Make an Offer' }).click();
    
    // Offer modal should open
    await expect(page.getByRole('dialog', { name: 'Make an Offer' })).toBeVisible();
    await expect(page.getByText('Current price: $49.99')).toBeVisible();
    
    // Enter offer amount
    await page.getByLabel('Your offer').fill('40');
    await page.getByLabel('Message (optional)').fill('Would you accept $40 for this item?');
    
    // Submit offer
    await page.getByRole('button', { name: 'Send Offer' }).click();
    
    // Success message
    await expect(page.getByText('Offer sent successfully')).toBeVisible();
    await expect(page.getByText('The seller will be notified')).toBeVisible();
    
    // Offer button should change state
    await expect(page.getByRole('button', { name: 'Offer Pending' })).toBeDisabled();
  });

  test('should handle cart and multiple items', async ({ page }) => {
    // Create another product
    const productId2 = await createTestProduct({
      sellerId: sellerEmail,
      title: 'Second Test Product',
      price: 29.99,
      category: 'Accessories'
    });
    
    await loginUser(page, buyerEmail, password);
    
    // Add first product to cart
    await page.goto(`/product/${productId}`);
    await page.getByRole('button', { name: 'Add to Cart' }).click();
    await expect(page.getByText('Added to cart')).toBeVisible();
    
    // Add second product to cart
    await page.goto(`/product/${productId2}`);
    await page.getByRole('button', { name: 'Add to Cart' }).click();
    
    // Go to cart
    await page.getByRole('link', { name: 'Cart (2)' }).click();
    await expect(page).toHaveURL('/cart');
    
    // Verify cart contents
    await expect(page.getByRole('heading', { name: 'Shopping Cart' })).toBeVisible();
    await expect(page.getByText('Test Product for Purchase')).toBeVisible();
    await expect(page.getByText('Second Test Product')).toBeVisible();
    
    // Update quantity
    const quantityInput = page.getByRole('spinbutton', { name: 'Quantity' }).first();
    await quantityInput.fill('2');
    
    // Cart total should update
    await expect(page.getByText(/Subtotal.*\$129\.97/)).toBeVisible();
    
    // Remove one item
    await page.getByRole('button', { name: 'Remove' }).last().click();
    await expect(page.getByText('Item removed from cart')).toBeVisible();
    
    // Proceed to checkout
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
    await expect(page).toHaveURL('/checkout');
  });

  test('should handle payment errors gracefully', async ({ page }) => {
    await loginUser(page, buyerEmail, password);
    await page.goto(`/product/${productId}`);
    await page.getByRole('button', { name: 'Buy Now' }).click();
    
    // Fill checkout form
    await page.getByLabel('Full Name').fill('Test Buyer');
    await page.getByLabel('Street Address').fill('123 Test Street');
    await page.getByLabel('City').fill('Test City');
    await page.getByLabel('State').selectOption('CA');
    await page.getByLabel('ZIP Code').fill('90210');
    await page.getByRole('button', { name: 'Continue to Payment' }).click();
    
    // Use card that triggers decline
    const stripeFrame = page.frameLocator('iframe[name*="stripe"]').first();
    await stripeFrame.getByPlaceholder('Card number').fill('4000 0000 0000 0002');
    await stripeFrame.getByPlaceholder('MM / YY').fill('12/25');
    await stripeFrame.getByPlaceholder('CVC').fill('123');
    
    await page.getByRole('button', { name: 'Place Order' }).click();
    
    // Should show error message
    await expect(page.getByText('Your card was declined')).toBeVisible();
    await expect(page.getByText('Please try a different payment method')).toBeVisible();
    
    // Should remain on checkout page
    await expect(page).toHaveURL('/checkout');
  });

  test('should handle sold out products', async ({ page }) => {
    // Mark product as sold
    await markProductAsSold(productId);
    
    await loginUser(page, buyerEmail, password);
    await page.goto(`/product/${productId}`);
    
    // Should show sold badge
    await expect(page.getByText('SOLD')).toBeVisible();
    
    // Buy button should be disabled
    await expect(page.getByRole('button', { name: 'Buy Now' })).toBeDisabled();
    await expect(page.getByText('This item has been sold')).toBeVisible();
    
    // Can still add to favorites
    await page.getByRole('button', { name: 'Add to favorites' }).click();
    await expect(page.getByRole('button', { name: 'Remove from favorites' })).toBeVisible();
  });

  test('should track order after purchase', async ({ page }) => {
    await loginUser(page, buyerEmail, password);
    
    // Go to orders page
    await page.goto('/orders');
    await expect(page.getByRole('heading', { name: 'My Orders' })).toBeVisible();
    
    // Recent order should be visible
    await expect(page.getByText('Test Product for Purchase')).toBeVisible();
    await expect(page.getByText('Status: Processing')).toBeVisible();
    
    // Click on order for details
    await page.getByRole('link', { name: /Order #[\w-]+/ }).first().click();
    
    // Order details page
    await expect(page.getByRole('heading', { name: /Order #[\w-]+/ })).toBeVisible();
    await expect(page.getByText('Order placed on')).toBeVisible();
    await expect(page.getByText('Estimated delivery')).toBeVisible();
    
    // Timeline should be visible
    await expect(page.getByText('Order Placed')).toBeVisible();
    await expect(page.getByText('Payment Confirmed')).toBeVisible();
    await expect(page.getByText('Preparing for Shipment')).toBeVisible();
  });
});

test.describe('Mobile Purchase Flow', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should handle mobile checkout', async ({ page }) => {
    const productId = await createTestProduct({
      sellerId: generateTestEmail('mobile-seller'),
      title: 'Mobile Test Product',
      price: 19.99
    });
    
    const buyerEmail = generateTestEmail('mobile-buyer');
    await createTestUser(buyerEmail, 'TestPassword123!');
    await loginUser(page, buyerEmail, 'TestPassword123!');
    
    // Navigate to product on mobile
    await page.goto(`/product/${productId}`);
    
    // Mobile layout adjustments
    await expect(page.getByRole('heading', { name: 'Mobile Test Product' })).toBeVisible();
    
    // Swipe through images (simulated)
    const imageContainer = page.locator('[data-testid="product-images"]');
    await imageContainer.swipe({ direction: 'left' });
    
    // Sticky buy button should be visible
    const buyButton = page.getByRole('button', { name: 'Buy Now' });
    await expect(buyButton).toBeInViewport();
    
    // Proceed with purchase
    await buyButton.click();
    
    // Mobile-optimized checkout
    await expect(page).toHaveURL('/checkout');
    
    // Autofill suggestion should be available
    await page.getByLabel('Full Name').click();
    await expect(page.getByText('Use saved address')).toBeVisible();
  });
});

// Helper function
async function markProductAsSold(productId: string) {
  // This would typically update the database
  // For testing, we'd mock this or use a test API endpoint
  console.log(`Marking product ${productId} as sold`);
}