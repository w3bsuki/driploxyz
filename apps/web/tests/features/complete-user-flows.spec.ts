/**
 * Complete User Flows - Feature Tests
 * End-to-end testing of all major user journeys
 */

import { test, expect } from '@playwright/test';
import { testUsers, testProducts, testAddresses, searchQueries } from '../fixtures/test-data';

test.describe('Complete User Flows - All Features', () => {
  const baseURL = 'http://localhost:5173';

  test.beforeAll(async () => {
    await mcp__playwright__browser_resize({ width: 1920, height: 1080 });
  });

  test('Complete buyer journey - signup to purchase', async () => {
    // Step 1: Sign up new user
    await mcp__playwright__browser_navigate({ url: `${baseURL}/signup` });
    
    const newUserEmail = `buyer-flow-${Date.now()}@test.com`;
    const signupFields = [
      { name: 'Email', type: 'textbox', ref: '#email', value: newUserEmail },
      { name: 'Password', type: 'textbox', ref: '#password', value: 'BuyerFlow123!' },
      { name: 'Confirm Password', type: 'textbox', ref: '#confirm-password', value: 'BuyerFlow123!' }
    ];
    
    await mcp__playwright__browser_fill_form({ fields: signupFields });
    await mcp__playwright__browser_click({ element: 'Sign up button', ref: '[data-testid="signup-btn"]' });
    
    await mcp__playwright__browser_wait_for({ text: 'Check your email' });
    await mcp__playwright__browser_take_screenshot({ filename: 'feature-signup-verification.png' });
    
    // Step 2: Complete onboarding (simulate verification)
    await mcp__playwright__browser_navigate({ url: `${baseURL}/onboarding` });
    
    const onboardingFields = [
      { name: 'First Name', type: 'textbox', ref: '#firstName', value: 'Test' },
      { name: 'Last Name', type: 'textbox', ref: '#lastName', value: 'Buyer' },
      { name: 'Username', type: 'textbox', ref: '#username', value: 'testbuyer123' }
    ];
    
    const onboardingExists = await mcp__playwright__browser_evaluate({
      function: `() => document.querySelector('#firstName') !== null`
    });
    
    if (onboardingExists) {
      await mcp__playwright__browser_fill_form({ fields: onboardingFields });
      await mcp__playwright__browser_click({ element: 'Complete onboarding', ref: '[data-testid="complete-onboarding"]' });
      await mcp__playwright__browser_wait_for({ time: 2 });
    }
    
    // Step 3: Browse products
    await mcp__playwright__browser_navigate({ url: baseURL });
    await mcp__playwright__browser_take_screenshot({ filename: 'feature-buyer-homepage.png' });
    
    // Step 4: Search for products
    await mcp__playwright__browser_type({
      element: 'Search input',
      ref: '[data-testid="search-input"]',
      text: searchQueries[0],
      submit: true
    });
    
    await mcp__playwright__browser_wait_for({ text: 'results' });
    await mcp__playwright__browser_take_screenshot({ filename: 'feature-buyer-search-results.png' });
    
    // Step 5: View product details
    await mcp__playwright__browser_click({
      element: 'First product',
      ref: '[data-testid="product-card"]:first-child'
    });
    
    await mcp__playwright__browser_wait_for({ time: 2 });
    await mcp__playwright__browser_take_screenshot({ filename: 'feature-buyer-product-view.png' });
    
    // Step 6: Add to favorites
    const favoriteBtn = await mcp__playwright__browser_evaluate({
      function: `() => document.querySelector('[data-testid="favorite-btn"]') !== null`
    });
    
    if (favoriteBtn) {
      await mcp__playwright__browser_click({
        element: 'Favorite button',
        ref: '[data-testid="favorite-btn"]'
      });
      await mcp__playwright__browser_wait_for({ time: 1 });
    }
    
    // Step 7: Start checkout process
    await mcp__playwright__browser_click({
      element: 'Buy now button',
      ref: '[data-testid="buy-now-btn"]'
    });
    
    await mcp__playwright__browser_wait_for({ text: 'Checkout' });
    await mcp__playwright__browser_take_screenshot({ filename: 'feature-buyer-checkout.png' });
    
    // Step 8: Fill shipping information
    const shippingFields = [
      { name: 'First Name', type: 'textbox', ref: '#shipping-firstName', value: testAddresses.default.firstName },
      { name: 'Last Name', type: 'textbox', ref: '#shipping-lastName', value: testAddresses.default.lastName },
      { name: 'Street', type: 'textbox', ref: '#shipping-street', value: testAddresses.default.street },
      { name: 'City', type: 'textbox', ref: '#shipping-city', value: testAddresses.default.city },
      { name: 'Postal Code', type: 'textbox', ref: '#shipping-postalCode', value: testAddresses.default.postalCode },
      { name: 'Phone', type: 'textbox', ref: '#shipping-phone', value: testAddresses.default.phone }
    ];
    
    await mcp__playwright__browser_fill_form({ fields: shippingFields });
    await mcp__playwright__browser_take_screenshot({ filename: 'feature-buyer-checkout-filled.png' });
    
    // Note: Stop before payment to avoid actual charges
    console.log('Buyer journey completed up to payment step');
  });

  test('Complete seller journey - signup to first sale', async () => {
    // Step 1: Sign up as seller
    await mcp__playwright__browser_navigate({ url: `${baseURL}/signup` });
    
    const sellerEmail = `seller-flow-${Date.now()}@test.com`;
    const signupFields = [
      { name: 'Email', type: 'textbox', ref: '#email', value: sellerEmail },
      { name: 'Password', type: 'textbox', ref: '#password', value: 'SellerFlow123!' },
      { name: 'Confirm Password', type: 'textbox', ref: '#confirm-password', value: 'SellerFlow123!' }
    ];
    
    await mcp__playwright__browser_fill_form({ fields: signupFields });
    await mcp__playwright__browser_click({ element: 'Sign up button', ref: '[data-testid="signup-btn"]' });
    
    // Step 2: Complete seller onboarding
    await mcp__playwright__browser_navigate({ url: `${baseURL}/become-seller` });
    
    const becomeSeller = await mcp__playwright__browser_evaluate({
      function: `() => document.querySelector('[data-testid="become-seller-btn"]') !== null`
    });
    
    if (becomeSeller) {
      await mcp__playwright__browser_click({
        element: 'Become seller button',
        ref: '[data-testid="become-seller-btn"]'
      });
      await mcp__playwright__browser_wait_for({ time: 2 });
    }
    
    // Step 3: Create first listing
    await mcp__playwright__browser_navigate({ url: `${baseURL}/sell` });
    await mcp__playwright__browser_take_screenshot({ filename: 'feature-seller-create-listing.png' });
    
    const product = testProducts[0];
    const listingFields = [
      { name: 'Title', type: 'textbox', ref: '#title', value: product.title },
      { name: 'Description', type: 'textbox', ref: '#description', value: product.description },
      { name: 'Price', type: 'textbox', ref: '#price', value: product.price.toString() }
    ];
    
    await mcp__playwright__browser_fill_form({ fields: listingFields });
    
    // Select dropdowns
    await mcp__playwright__browser_select_option({
      element: 'Category',
      ref: '#category',
      values: [product.category]
    });
    
    await mcp__playwright__browser_select_option({
      element: 'Brand',
      ref: '#brand',
      values: [product.brand]
    });
    
    await mcp__playwright__browser_select_option({
      element: 'Condition',
      ref: '#condition',
      values: [product.condition]
    });
    
    await mcp__playwright__browser_select_option({
      element: 'Size',
      ref: '#size',
      values: [product.size]
    });
    
    await mcp__playwright__browser_take_screenshot({ filename: 'feature-seller-listing-filled.png' });
    
    // Submit listing
    await mcp__playwright__browser_click({
      element: 'Create listing',
      ref: '[data-testid="create-listing-btn"]'
    });
    
    await mcp__playwright__browser_wait_for({ text: 'Listing created' });
    await mcp__playwright__browser_take_screenshot({ filename: 'feature-seller-listing-created.png' });
    
    // Step 4: View seller dashboard
    await mcp__playwright__browser_navigate({ url: `${baseURL}/dashboard` });
    await mcp__playwright__browser_take_screenshot({ filename: 'feature-seller-dashboard.png' });
    
    // Step 5: Manage listings
    await mcp__playwright__browser_navigate({ url: `${baseURL}/listings` });
    
    const hasListings = await mcp__playwright__browser_evaluate({
      function: `() => document.querySelector('[data-testid="listing-item"]') !== null`
    });
    
    if (hasListings) {
      await mcp__playwright__browser_take_screenshot({ filename: 'feature-seller-manage-listings.png' });
      
      // Test edit listing
      await mcp__playwright__browser_click({
        element: 'Edit listing',
        ref: '[data-testid="edit-listing-btn"]'
      });
      
      await mcp__playwright__browser_wait_for({ time: 2 });
      await mcp__playwright__browser_take_screenshot({ filename: 'feature-seller-edit-listing.png' });
    }
    
    console.log('Seller journey completed');
  });

  test('Messaging system - complete conversation flow', async () => {
    // Step 1: Login as buyer
    await mcp__playwright__browser_navigate({ url: `${baseURL}/login` });
    
    const buyerLogin = [
      { name: 'Email', type: 'textbox', ref: '#email', value: testUsers.buyer.email },
      { name: 'Password', type: 'textbox', ref: '#password', value: testUsers.buyer.password }
    ];
    
    await mcp__playwright__browser_fill_form({ fields: buyerLogin });
    await mcp__playwright__browser_click({ element: 'Login', ref: '[data-testid="login-btn"]' });
    await mcp__playwright__browser_wait_for({ time: 2 });
    
    // Step 2: Find a product and contact seller
    await mcp__playwright__browser_navigate({ url: baseURL });
    
    await mcp__playwright__browser_click({
      element: 'First product',
      ref: '[data-testid="product-card"]:first-child'
    });
    
    await mcp__playwright__browser_wait_for({ time: 2 });
    
    // Step 3: Start conversation
    const contactSeller = await mcp__playwright__browser_evaluate({
      function: `() => document.querySelector('[data-testid="contact-seller-btn"]') !== null`
    });
    
    if (contactSeller) {
      await mcp__playwright__browser_click({
        element: 'Contact seller',
        ref: '[data-testid="contact-seller-btn"]'
      });
      
      await mcp__playwright__browser_wait_for({ time: 2 });
      await mcp__playwright__browser_take_screenshot({ filename: 'feature-messaging-start.png' });
      
      // Step 4: Send message
      const messageExists = await mcp__playwright__browser_evaluate({
        function: `() => document.querySelector('[data-testid="message-input"]') !== null`
      });
      
      if (messageExists) {
        await mcp__playwright__browser_type({
          element: 'Message input',
          ref: '[data-testid="message-input"]',
          text: 'Hi! Is this item still available? I\'m very interested!'
        });
        
        await mcp__playwright__browser_click({
          element: 'Send message',
          ref: '[data-testid="send-message-btn"]'
        });
        
        await mcp__playwright__browser_wait_for({ time: 1 });
        await mcp__playwright__browser_take_screenshot({ filename: 'feature-messaging-sent.png' });
      }
    }
    
    // Step 5: View messages list
    await mcp__playwright__browser_navigate({ url: `${baseURL}/messages` });
    await mcp__playwright__browser_take_screenshot({ filename: 'feature-messaging-list.png' });
    
    console.log('Messaging flow completed');
  });

  test('Search and filter functionality - comprehensive testing', async () => {
    await mcp__playwright__browser_navigate({ url: baseURL });
    
    // Step 1: Basic search
    for (const query of searchQueries.slice(0, 3)) {
      await mcp__playwright__browser_type({
        element: 'Search input',
        ref: '[data-testid="search-input"]',
        text: query,
        submit: true
      });
      
      await mcp__playwright__browser_wait_for({ text: 'results' });
      
      const resultCount = await mcp__playwright__browser_evaluate({
        function: `() => document.querySelectorAll('[data-testid="product-card"]').length`
      });
      
      console.log(`Search "${query}" returned ${resultCount} results`);
      
      await mcp__playwright__browser_take_screenshot({
        filename: `feature-search-${query.replace(/\s+/g, '-')}.png`
      });
      
      // Clear search
      await mcp__playwright__browser_evaluate({
        function: `() => {
          const searchInput = document.querySelector('[data-testid="search-input"]');
          if (searchInput) searchInput.value = '';
        }`
      });
    }
    
    // Step 2: Advanced filtering
    await mcp__playwright__browser_navigate({ url: `${baseURL}/search` });
    
    const filterBtn = await mcp__playwright__browser_evaluate({
      function: `() => document.querySelector('[data-testid="filter-btn"]') !== null`
    });
    
    if (filterBtn) {
      await mcp__playwright__browser_click({
        element: 'Filter button',
        ref: '[data-testid="filter-btn"]'
      });
      
      await mcp__playwright__browser_wait_for({ time: 1 });
      await mcp__playwright__browser_take_screenshot({ filename: 'feature-filters-open.png' });
      
      // Apply category filter
      await mcp__playwright__browser_select_option({
        element: 'Category filter',
        ref: '[data-testid="category-filter"]',
        values: ['clothing']
      });
      
      // Apply price range
      await mcp__playwright__browser_select_option({
        element: 'Price range',
        ref: '[data-testid="price-filter"]',
        values: ['50-100']
      });
      
      // Apply condition filter
      await mcp__playwright__browser_select_option({
        element: 'Condition filter',
        ref: '[data-testid="condition-filter"]',
        values: ['excellent']
      });
      
      await mcp__playwright__browser_click({
        element: 'Apply filters',
        ref: '[data-testid="apply-filters-btn"]'
      });
      
      await mcp__playwright__browser_wait_for({ time: 2 });
      await mcp__playwright__browser_take_screenshot({ filename: 'feature-filters-applied.png' });
      
      // Test clearing filters
      const clearFilters = await mcp__playwright__browser_evaluate({
        function: `() => document.querySelector('[data-testid="clear-filters"]') !== null`
      });
      
      if (clearFilters) {
        await mcp__playwright__browser_click({
          element: 'Clear filters',
          ref: '[data-testid="clear-filters"]'
        });
        
        await mcp__playwright__browser_wait_for({ time: 1 });
      }
    }
    
    console.log('Search and filter testing completed');
  });

  test('Favorites/Wishlist management flow', async () => {
    // Login as buyer
    await mcp__playwright__browser_navigate({ url: `${baseURL}/login` });
    
    const loginFields = [
      { name: 'Email', type: 'textbox', ref: '#email', value: testUsers.buyer.email },
      { name: 'Password', type: 'textbox', ref: '#password', value: testUsers.buyer.password }
    ];
    
    await mcp__playwright__browser_fill_form({ fields: loginFields });
    await mcp__playwright__browser_click({ element: 'Login', ref: '[data-testid="login-btn"]' });
    await mcp__playwright__browser_wait_for({ time: 2 });
    
    // Add items to favorites
    await mcp__playwright__browser_navigate({ url: baseURL });
    
    const productCards = await mcp__playwright__browser_evaluate({
      function: `() => document.querySelectorAll('[data-testid="product-card"]').length`
    });
    
    // Add first 3 products to favorites
    for (let i = 0; i < Math.min(3, productCards); i++) {
      const favoriteBtn = await mcp__playwright__browser_evaluate({
        function: `() => document.querySelectorAll('[data-testid="favorite-btn"]')[${i}] !== undefined`
      });
      
      if (favoriteBtn) {
        await mcp__playwright__browser_click({
          element: `Favorite button ${i + 1}`,
          ref: `[data-testid="favorite-btn"]:nth-child(${i + 1})`
        });
        
        await mcp__playwright__browser_wait_for({ time: 1 });
      }
    }
    
    await mcp__playwright__browser_take_screenshot({ filename: 'feature-favorites-added.png' });
    
    // View favorites page
    await mcp__playwright__browser_navigate({ url: `${baseURL}/favorites` });
    await mcp__playwright__browser_take_screenshot({ filename: 'feature-favorites-page.png' });
    
    // Test removing from favorites
    const favoriteItems = await mcp__playwright__browser_evaluate({
      function: `() => document.querySelectorAll('[data-testid="favorite-item"]').length`
    });
    
    if (favoriteItems > 0) {
      await mcp__playwright__browser_click({
        element: 'Remove from favorites',
        ref: '[data-testid="remove-favorite-btn"]:first-child'
      });
      
      await mcp__playwright__browser_wait_for({ time: 1 });
      await mcp__playwright__browser_take_screenshot({ filename: 'feature-favorites-removed.png' });
    }
    
    console.log('Favorites management completed');
  });

  test('Order management and reviews flow', async () => {
    // Login as buyer with existing orders
    await mcp__playwright__browser_navigate({ url: `${baseURL}/login` });
    
    const loginFields = [
      { name: 'Email', type: 'textbox', ref: '#email', value: testUsers.buyer.email },
      { name: 'Password', type: 'textbox', ref: '#password', value: testUsers.buyer.password }
    ];
    
    await mcp__playwright__browser_fill_form({ fields: loginFields });
    await mcp__playwright__browser_click({ element: 'Login', ref: '[data-testid="login-btn"]' });
    await mcp__playwright__browser_wait_for({ time: 2 });
    
    // View orders
    await mcp__playwright__browser_navigate({ url: `${baseURL}/orders` });
    await mcp__playwright__browser_take_screenshot({ filename: 'feature-orders-list.png' });
    
    const hasOrders = await mcp__playwright__browser_evaluate({
      function: `() => document.querySelector('[data-testid="order-item"]') !== null`
    });
    
    if (hasOrders) {
      // View order details
      await mcp__playwright__browser_click({
        element: 'Order details',
        ref: '[data-testid="order-item"]:first-child'
      });
      
      await mcp__playwright__browser_wait_for({ time: 2 });
      await mcp__playwright__browser_take_screenshot({ filename: 'feature-order-details.png' });
      
      // Leave review if option available
      const reviewBtn = await mcp__playwright__browser_evaluate({
        function: `() => document.querySelector('[data-testid="leave-review-btn"]') !== null`
      });
      
      if (reviewBtn) {
        await mcp__playwright__browser_click({
          element: 'Leave review',
          ref: '[data-testid="leave-review-btn"]'
        });
        
        await mcp__playwright__browser_wait_for({ time: 1 });
        
        // Fill review form
        const reviewFields = [
          { name: 'Review text', type: 'textbox', ref: '#review-text', value: 'Great product, exactly as described! Fast shipping.' }
        ];
        
        await mcp__playwright__browser_fill_form({ fields: reviewFields });
        
        // Select rating
        await mcp__playwright__browser_click({
          element: '5-star rating',
          ref: '[data-testid="rating-5"]'
        });
        
        await mcp__playwright__browser_take_screenshot({ filename: 'feature-review-form.png' });
        
        await mcp__playwright__browser_click({
          element: 'Submit review',
          ref: '[data-testid="submit-review-btn"]'
        });
        
        await mcp__playwright__browser_wait_for({ time: 1 });
      }
    }
    
    console.log('Order and review flow completed');
  });

  test('Mobile responsive user flows', async () => {
    // Switch to mobile viewport
    await mcp__playwright__browser_resize({ width: 375, height: 667 });
    
    // Test mobile navigation
    await mcp__playwright__browser_navigate({ url: baseURL });
    await mcp__playwright__browser_take_screenshot({ filename: 'feature-mobile-homepage.png' });
    
    // Test mobile search
    const mobileSearchBtn = await mcp__playwright__browser_evaluate({
      function: `() => document.querySelector('[data-testid="mobile-search-btn"]') !== null`
    });
    
    if (mobileSearchBtn) {
      await mcp__playwright__browser_click({
        element: 'Mobile search',
        ref: '[data-testid="mobile-search-btn"]'
      });
      
      await mcp__playwright__browser_wait_for({ time: 1 });
      
      await mcp__playwright__browser_type({
        element: 'Search input',
        ref: '[data-testid="search-input"]',
        text: 'shoes'
      });
      
      await mcp__playwright__browser_press_key({ key: 'Enter' });
      await mcp__playwright__browser_wait_for({ text: 'results' });
      await mcp__playwright__browser_take_screenshot({ filename: 'feature-mobile-search.png' });
    }
    
    // Test mobile product view
    await mcp__playwright__browser_click({
      element: 'First product',
      ref: '[data-testid="product-card"]:first-child'
    });
    
    await mcp__playwright__browser_wait_for({ time: 2 });
    await mcp__playwright__browser_take_screenshot({ filename: 'feature-mobile-product.png' });
    
    // Test mobile navigation menu
    const mobileMenuBtn = await mcp__playwright__browser_evaluate({
      function: `() => document.querySelector('[data-testid="mobile-menu-btn"]') !== null`
    });
    
    if (mobileMenuBtn) {
      await mcp__playwright__browser_click({
        element: 'Mobile menu',
        ref: '[data-testid="mobile-menu-btn"]'
      });
      
      await mcp__playwright__browser_wait_for({ time: 1 });
      await mcp__playwright__browser_take_screenshot({ filename: 'feature-mobile-menu.png' });
    }
    
    // Reset to desktop
    await mcp__playwright__browser_resize({ width: 1920, height: 1080 });
    
    console.log('Mobile responsive testing completed');
  });

  test.afterAll(async () => {
    await mcp__playwright__browser_close();
  });
});

// MCP function declarations
declare global {
  function mcp__playwright__browser_navigate(params: { url: string }): Promise<void>;
  function mcp__playwright__browser_resize(params: { width: number; height: number }): Promise<void>;
  function mcp__playwright__browser_fill_form(params: { fields: Array<{name: string; type: string; ref: string; value: string}> }): Promise<void>;
  function mcp__playwright__browser_click(params: { element: string; ref: string; doubleClick?: boolean }): Promise<void>;
  function mcp__playwright__browser_wait_for(params: { time?: number; text?: string }): Promise<void>;
  function mcp__playwright__browser_take_screenshot(params: { filename: string }): Promise<void>;
  function mcp__playwright__browser_type(params: { element: string; ref: string; text: string; submit?: boolean }): Promise<void>;
  function mcp__playwright__browser_evaluate(params: { function: string }): Promise<any>;
  function mcp__playwright__browser_select_option(params: { element: string; ref: string; values: string[] }): Promise<void>;
  function mcp__playwright__browser_press_key(params: { key: string }): Promise<void>;
  function mcp__playwright__browser_close(): Promise<void>;
}