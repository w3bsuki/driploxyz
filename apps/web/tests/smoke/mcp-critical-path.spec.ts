/**
 * MCP Playwright Smoke Tests - Critical Path
 * Uses MCP browser automation functions for comprehensive testing
 */

import { test, expect } from '@playwright/test';
import { testUsers, testProducts } from '../fixtures/test-data';

test.describe('MCP Smoke Tests - Critical Path', () => {
  const baseURL = 'http://localhost:5173';

  test.beforeAll(async () => {
    // Resize browser for consistent testing
    await mcp__playwright__browser_resize({ width: 1920, height: 1080 });
  });

  test('Homepage loads with all critical elements', async () => {
    // Navigate using MCP
    await mcp__playwright__browser_navigate({ url: baseURL });
    
    // Take accessibility snapshot
    const snapshot = await mcp__playwright__browser_snapshot();
    expect(snapshot).toBeDefined();
    
    // Take screenshot
    await mcp__playwright__browser_take_screenshot({ 
      filename: 'mcp-homepage-critical.png',
      fullPage: true 
    });
    
    // Check for console errors
    const messages = await mcp__playwright__browser_console_messages();
    const errors = messages.filter(msg => msg.type === 'error');
    expect(errors).toHaveLength(0);
  });

  test('Authentication flow - complete user journey', async () => {
    // Navigate to signup
    await mcp__playwright__browser_navigate({ url: `${baseURL}/signup` });
    
    // Fill signup form using MCP form filling
    const signupFields = [
      { name: 'Email', type: 'textbox', ref: '#email', value: `mcp-test-${Date.now()}@example.com` },
      { name: 'Password', type: 'textbox', ref: '#password', value: 'MCPTest123!' },
      { name: 'Confirm Password', type: 'textbox', ref: '#confirm-password', value: 'MCPTest123!' }
    ];
    
    await mcp__playwright__browser_fill_form({ fields: signupFields });
    
    // Submit form
    await mcp__playwright__browser_click({ 
      element: 'Sign up button', 
      ref: '[data-testid="signup-btn"]' 
    });
    
    // Wait for verification message
    await mcp__playwright__browser_wait_for({ text: 'Check your email' });
    
    // Take screenshot of verification state
    await mcp__playwright__browser_take_screenshot({ 
      filename: 'mcp-signup-verification.png' 
    });
    
    // Navigate to login
    await mcp__playwright__browser_navigate({ url: `${baseURL}/login` });
    
    // Login with existing test user
    const loginFields = [
      { name: 'Email', type: 'textbox', ref: '#email', value: testUsers.buyer.email },
      { name: 'Password', type: 'textbox', ref: '#password', value: testUsers.buyer.password }
    ];
    
    await mcp__playwright__browser_fill_form({ fields: loginFields });
    
    await mcp__playwright__browser_click({ 
      element: 'Login button', 
      ref: '[data-testid="login-btn"]' 
    });
    
    // Wait for successful login
    await mcp__playwright__browser_wait_for({ text: 'Dashboard' });
    
    // Take authenticated state screenshot
    await mcp__playwright__browser_take_screenshot({ 
      filename: 'mcp-authenticated-dashboard.png' 
    });
    
    // Test logout
    await mcp__playwright__browser_click({ 
      element: 'User menu', 
      ref: '[data-testid="user-menu"]' 
    });
    
    await mcp__playwright__browser_click({ 
      element: 'Logout option', 
      ref: '[data-testid="logout-btn"]' 
    });
    
    // Wait for logout redirect
    await mcp__playwright__browser_wait_for({ text: 'Log in' });
  });

  test('Search functionality with filters', async () => {
    await mcp__playwright__browser_navigate({ url: baseURL });
    
    // Perform search
    await mcp__playwright__browser_type({ 
      element: 'Search input', 
      ref: '[data-testid="search-input"]', 
      text: 'designer handbag',
      submit: true 
    });
    
    // Wait for search results
    await mcp__playwright__browser_wait_for({ text: 'results' });
    
    // Take search results screenshot
    await mcp__playwright__browser_take_screenshot({ 
      filename: 'mcp-search-results.png',
      fullPage: true 
    });
    
    // Test filters
    await mcp__playwright__browser_click({ 
      element: 'Filter button', 
      ref: '[data-testid="filter-btn"]' 
    });
    
    // Apply price filter
    await mcp__playwright__browser_select_option({ 
      element: 'Price range', 
      ref: '#price-range', 
      values: ['50-100'] 
    });
    
    // Apply brand filter
    await mcp__playwright__browser_select_option({ 
      element: 'Brand selector', 
      ref: '#brand-filter', 
      values: ['Gucci'] 
    });
    
    await mcp__playwright__browser_click({ 
      element: 'Apply filters', 
      ref: '[data-testid="apply-filters-btn"]' 
    });
    
    // Wait for filtered results
    await mcp__playwright__browser_wait_for({ time: 2 });
    
    await mcp__playwright__browser_take_screenshot({ 
      filename: 'mcp-filtered-results.png' 
    });
  });

  test('Product details and interactions', async () => {
    await mcp__playwright__browser_navigate({ url: baseURL });
    
    // Click on first product
    await mcp__playwright__browser_click({ 
      element: 'First product card', 
      ref: '[data-testid="product-card"]:first-child' 
    });
    
    // Wait for product page to load
    await mcp__playwright__browser_wait_for({ text: 'Buy Now' });
    
    // Take product details screenshot
    await mcp__playwright__browser_take_screenshot({ 
      filename: 'mcp-product-details.png',
      fullPage: true 
    });
    
    // Test product gallery interaction
    await mcp__playwright__browser_click({ 
      element: 'Next image button', 
      ref: '[data-testid="gallery-next"]' 
    });
    
    await mcp__playwright__browser_wait_for({ time: 1 });
    
    // Test zoom functionality
    await mcp__playwright__browser_click({ 
      element: 'Product image', 
      ref: '[data-testid="product-image"]',
      doubleClick: true 
    });
    
    // Test favorite button
    await mcp__playwright__browser_click({ 
      element: 'Favorite button', 
      ref: '[data-testid="favorite-btn"]' 
    });
    
    await mcp__playwright__browser_take_screenshot({ 
      filename: 'mcp-product-favorited.png' 
    });
    
    // Test seller contact
    await mcp__playwright__browser_click({ 
      element: 'Contact seller button', 
      ref: '[data-testid="contact-seller-btn"]' 
    });
    
    // Wait for message modal or redirect
    await mcp__playwright__browser_wait_for({ text: 'Message' });
  });

  test('Create listing flow', async () => {
    // Login as seller first
    await mcp__playwright__browser_navigate({ url: `${baseURL}/login` });
    
    const loginFields = [
      { name: 'Email', type: 'textbox', ref: '#email', value: testUsers.seller.email },
      { name: 'Password', type: 'textbox', ref: '#password', value: testUsers.seller.password }
    ];
    
    await mcp__playwright__browser_fill_form({ fields: loginFields });
    await mcp__playwright__browser_click({ element: 'Login button', ref: '[data-testid="login-btn"]' });
    
    // Navigate to sell page
    await mcp__playwright__browser_navigate({ url: `${baseURL}/sell` });
    
    // Fill listing form
    const listingFields = [
      { name: 'Title', type: 'textbox', ref: '#title', value: testProducts[0].title },
      { name: 'Description', type: 'textbox', ref: '#description', value: testProducts[0].description },
      { name: 'Price', type: 'textbox', ref: '#price', value: testProducts[0].price.toString() }
    ];
    
    await mcp__playwright__browser_fill_form({ fields: listingFields });
    
    // Select category
    await mcp__playwright__browser_select_option({ 
      element: 'Category selector', 
      ref: '#category', 
      values: [testProducts[0].category] 
    });
    
    // Select brand
    await mcp__playwright__browser_select_option({ 
      element: 'Brand selector', 
      ref: '#brand', 
      values: [testProducts[0].brand] 
    });
    
    // Select condition
    await mcp__playwright__browser_select_option({ 
      element: 'Condition selector', 
      ref: '#condition', 
      values: [testProducts[0].condition] 
    });
    
    await mcp__playwright__browser_take_screenshot({ 
      filename: 'mcp-listing-form-filled.png',
      fullPage: true 
    });
    
    // Submit listing
    await mcp__playwright__browser_click({ 
      element: 'Create listing button', 
      ref: '[data-testid="create-listing-btn"]' 
    });
    
    // Wait for success message
    await mcp__playwright__browser_wait_for({ text: 'Listing created' });
    
    await mcp__playwright__browser_take_screenshot({ 
      filename: 'mcp-listing-created.png' 
    });
  });

  test('Checkout flow basics', async () => {
    // Login as buyer
    await mcp__playwright__browser_navigate({ url: `${baseURL}/login` });
    
    const loginFields = [
      { name: 'Email', type: 'textbox', ref: '#email', value: testUsers.buyer.email },
      { name: 'Password', type: 'textbox', ref: '#password', value: testUsers.buyer.password }
    ];
    
    await mcp__playwright__browser_fill_form({ fields: loginFields });
    await mcp__playwright__browser_click({ element: 'Login button', ref: '[data-testid="login-btn"]' });
    
    // Find and click a product
    await mcp__playwright__browser_navigate({ url: baseURL });
    await mcp__playwright__browser_click({ 
      element: 'First product', 
      ref: '[data-testid="product-card"]:first-child' 
    });
    
    // Click buy now
    await mcp__playwright__browser_click({ 
      element: 'Buy now button', 
      ref: '[data-testid="buy-now-btn"]' 
    });
    
    // Wait for checkout page
    await mcp__playwright__browser_wait_for({ text: 'Checkout' });
    
    // Take checkout screenshot
    await mcp__playwright__browser_take_screenshot({ 
      filename: 'mcp-checkout-page.png',
      fullPage: true 
    });
    
    // Fill shipping address
    const addressFields = [
      { name: 'First Name', type: 'textbox', ref: '#firstName', value: 'Test' },
      { name: 'Last Name', type: 'textbox', ref: '#lastName', value: 'Buyer' },
      { name: 'Street Address', type: 'textbox', ref: '#street', value: 'Test Street 123' },
      { name: 'City', type: 'textbox', ref: '#city', value: 'Sofia' },
      { name: 'Postal Code', type: 'textbox', ref: '#postalCode', value: '1000' },
      { name: 'Phone', type: 'textbox', ref: '#phone', value: '+359888123456' }
    ];
    
    await mcp__playwright__browser_fill_form({ fields: addressFields });
    
    await mcp__playwright__browser_take_screenshot({ 
      filename: 'mcp-checkout-address-filled.png' 
    });
  });

  test('Mobile responsiveness check', async () => {
    // Switch to mobile viewport
    await mcp__playwright__browser_resize({ width: 375, height: 667 });
    
    await mcp__playwright__browser_navigate({ url: baseURL });
    
    // Take mobile homepage screenshot
    await mcp__playwright__browser_take_screenshot({ 
      filename: 'mcp-mobile-homepage.png',
      fullPage: true 
    });
    
    // Test mobile navigation
    await mcp__playwright__browser_click({ 
      element: 'Mobile menu button', 
      ref: '[data-testid="mobile-menu-btn"]' 
    });
    
    await mcp__playwright__browser_wait_for({ text: 'Menu' });
    
    await mcp__playwright__browser_take_screenshot({ 
      filename: 'mcp-mobile-menu.png' 
    });
    
    // Test mobile search
    await mcp__playwright__browser_click({ 
      element: 'Mobile search', 
      ref: '[data-testid="mobile-search-btn"]' 
    });
    
    await mcp__playwright__browser_type({ 
      element: 'Search input', 
      ref: '[data-testid="search-input"]', 
      text: 'shoes' 
    });
    
    await mcp__playwright__browser_press_key({ key: 'Enter' });
    
    await mcp__playwright__browser_wait_for({ text: 'results' });
    
    await mcp__playwright__browser_take_screenshot({ 
      filename: 'mcp-mobile-search-results.png' 
    });
    
    // Switch back to desktop
    await mcp__playwright__browser_resize({ width: 1920, height: 1080 });
  });

  test('Accessibility and keyboard navigation', async () => {
    await mcp__playwright__browser_navigate({ url: baseURL });
    
    // Take accessibility snapshot
    const snapshot = await mcp__playwright__browser_snapshot();
    console.log('Accessibility snapshot:', snapshot);
    
    // Test keyboard navigation
    await mcp__playwright__browser_press_key({ key: 'Tab' });
    await mcp__playwright__browser_press_key({ key: 'Tab' });
    await mcp__playwright__browser_press_key({ key: 'Tab' });
    
    // Test Enter key interaction
    await mcp__playwright__browser_press_key({ key: 'Enter' });
    
    await mcp__playwright__browser_wait_for({ time: 1 });
    
    // Test escape key
    await mcp__playwright__browser_press_key({ key: 'Escape' });
    
    await mcp__playwright__browser_take_screenshot({ 
      filename: 'mcp-keyboard-navigation.png' 
    });
  });

  test('Performance and network monitoring', async () => {
    // Navigate and monitor network
    await mcp__playwright__browser_navigate({ url: baseURL });
    
    // Get network requests
    const networkRequests = await mcp__playwright__browser_network_requests();
    console.log(`Network requests: ${networkRequests.length}`);
    
    // Check for failed requests
    const failedRequests = networkRequests.filter(req => req.status >= 400);
    expect(failedRequests).toHaveLength(0);
    
    // Evaluate performance metrics
    const performanceMetrics = await mcp__playwright__browser_evaluate({ 
      function: `() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        return {
          loadTime: navigation.loadEventEnd - navigation.loadEventStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          ttfb: navigation.responseStart - navigation.requestStart
        };
      }` 
    });
    
    console.log('Performance metrics:', performanceMetrics);
    
    // Basic performance assertions
    expect(performanceMetrics.ttfb).toBeLessThan(1000); // 1 second TTFB
    expect(performanceMetrics.loadTime).toBeLessThan(3000); // 3 seconds load time
  });

  test.afterAll(async () => {
    // Close browser
    await mcp__playwright__browser_close();
  });
});

// Helper function declarations for MCP functions
declare global {
  function mcp__playwright__browser_navigate(params: { url: string }): Promise<void>;
  function mcp__playwright__browser_snapshot(): Promise<any>;
  function mcp__playwright__browser_take_screenshot(params: { filename: string, fullPage?: boolean }): Promise<void>;
  function mcp__playwright__browser_console_messages(): Promise<any[]>;
  function mcp__playwright__browser_fill_form(params: { fields: any[] }): Promise<void>;
  function mcp__playwright__browser_click(params: { element: string, ref: string, doubleClick?: boolean }): Promise<void>;
  function mcp__playwright__browser_wait_for(params: { text?: string, textGone?: string, time?: number }): Promise<void>;
  function mcp__playwright__browser_type(params: { element: string, ref: string, text: string, submit?: boolean }): Promise<void>;
  function mcp__playwright__browser_select_option(params: { element: string, ref: string, values: string[] }): Promise<void>;
  function mcp__playwright__browser_resize(params: { width: number, height: number }): Promise<void>;
  function mcp__playwright__browser_press_key(params: { key: string }): Promise<void>;
  function mcp__playwright__browser_network_requests(): Promise<any[]>;
  function mcp__playwright__browser_evaluate(params: { function: string }): Promise<any>;
  function mcp__playwright__browser_close(): Promise<void>;
}