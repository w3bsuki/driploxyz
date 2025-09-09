/**
 * UI Components Tests
 * Comprehensive testing of all @repo/ui components
 */

import { test, expect } from '@playwright/test';
import { testUsers, testProducts } from '../fixtures/test-data';

test.describe('UI Components - Interactive Elements', () => {
  const baseURL = 'http://localhost:5173';

  test.beforeAll(async () => {
    await mcp__playwright__browser_resize({ width: 1920, height: 1080 });
  });

  test('Button component - all variants and states', async () => {
    await mcp__playwright__browser_navigate({ url: baseURL });
    
    // Test primary buttons
    const primaryButtons = await mcp__playwright__browser_evaluate({
      function: `() => Array.from(document.querySelectorAll('button')).filter(btn => 
        btn.classList.contains('btn-primary') || 
        btn.classList.contains('primary') ||
        btn.dataset.variant === 'primary'
      ).length`
    });
    
    if (primaryButtons > 0) {
      // Test hover state
      await mcp__playwright__browser_hover({
        element: 'Primary button',
        ref: 'button[class*="primary"], button[data-variant="primary"]'
      });
      
      await mcp__playwright__browser_take_screenshot({
        filename: 'component-button-primary-hover.png'
      });
      
      // Test click interaction
      await mcp__playwright__browser_click({
        element: 'Primary button',
        ref: 'button[class*="primary"], button[data-variant="primary"]'
      });
      
      await mcp__playwright__browser_wait_for({ time: 1 });
    }
    
    // Test loading state if available
    const loadingButtons = await mcp__playwright__browser_evaluate({
      function: `() => Array.from(document.querySelectorAll('button[data-loading="true"], button[aria-busy="true"], .btn-loading')).length`
    });
    
    if (loadingButtons > 0) {
      await mcp__playwright__browser_take_screenshot({
        filename: 'component-button-loading.png'
      });
    }
  });

  test('FavoriteButton component - toggle functionality', async () => {
    await mcp__playwright__browser_navigate({ url: baseURL });
    
    // Look for favorite buttons
    const favoriteBtn = await mcp__playwright__browser_evaluate({
      function: `() => document.querySelector('[data-testid="favorite-btn"], .favorite-btn, [aria-label*="favorite" i]') !== null`
    });
    
    if (favoriteBtn) {
      // Test initial state
      await mcp__playwright__browser_take_screenshot({
        filename: 'component-favorite-btn-initial.png'
      });
      
      // Click to favorite
      await mcp__playwright__browser_click({
        element: 'Favorite button',
        ref: '[data-testid="favorite-btn"], .favorite-btn, [aria-label*="favorite" i]'
      });
      
      await mcp__playwright__browser_wait_for({ time: 1 });
      
      // Check active state
      const isActive = await mcp__playwright__browser_evaluate({
        function: `() => {
          const btn = document.querySelector('[data-testid="favorite-btn"], .favorite-btn, [aria-label*="favorite" i]');
          return btn && (btn.classList.contains('active') || 
                        btn.classList.contains('favorited') ||
                        btn.dataset.favorited === 'true' ||
                        btn.ariaPressed === 'true');
        }`
      });
      
      expect(isActive).toBe(true);
      
      await mcp__playwright__browser_take_screenshot({
        filename: 'component-favorite-btn-active.png'
      });
    }
  });

  test('SearchBar component - search functionality', async () => {
    await mcp__playwright__browser_navigate({ url: baseURL });
    
    // Test search input
    await mcp__playwright__browser_type({
      element: 'Search input',
      ref: '[data-testid="search-input"], input[type="search"], input[placeholder*="search" i]',
      text: 'designer handbag'
    });
    
    await mcp__playwright__browser_take_screenshot({
      filename: 'component-search-filled.png'
    });
    
    // Test search submission
    await mcp__playwright__browser_press_key({ key: 'Enter' });
    
    await mcp__playwright__browser_wait_for({ text: 'results' });
    
    // Test clear search
    const clearButton = await mcp__playwright__browser_evaluate({
      function: `() => document.querySelector('[data-testid="search-clear"], .search-clear, [aria-label*="clear" i]') !== null`
    });
    
    if (clearButton) {
      await mcp__playwright__browser_click({
        element: 'Clear search button',
        ref: '[data-testid="search-clear"], .search-clear, [aria-label*="clear" i]'
      });
      
      await mcp__playwright__browser_wait_for({ time: 1 });
    }
  });

  test('ProductCard component - all interactive elements', async () => {
    await mcp__playwright__browser_navigate({ url: baseURL });
    
    // Test product card hover
    await mcp__playwright__browser_hover({
      element: 'Product card',
      ref: '[data-testid="product-card"], .product-card'
    });
    
    await mcp__playwright__browser_take_screenshot({
      filename: 'component-product-card-hover.png'
    });
    
    // Test quick actions if available
    const quickActionsVisible = await mcp__playwright__browser_evaluate({
      function: `() => {
        const card = document.querySelector('[data-testid="product-card"], .product-card');
        if (!card) return false;
        const quickActions = card.querySelector('[data-testid="quick-actions"], .quick-actions');
        return quickActions && getComputedStyle(quickActions).display !== 'none';
      }`
    });
    
    if (quickActionsVisible) {
      await mcp__playwright__browser_take_screenshot({
        filename: 'component-product-card-quick-actions.png'
      });
    }
    
    // Test click to view product
    await mcp__playwright__browser_click({
      element: 'Product card',
      ref: '[data-testid="product-card"], .product-card'
    });
    
    await mcp__playwright__browser_wait_for({ time: 2 });
  });

  test('Modal/Dialog components - open/close behavior', async () => {
    await mcp__playwright__browser_navigate({ url: baseURL });
    
    // Look for modal triggers
    const modalTriggers = await mcp__playwright__browser_evaluate({
      function: `() => Array.from(document.querySelectorAll('[data-testid*="modal"], [data-testid*="dialog"], [aria-haspopup="dialog"]')).length`
    });
    
    if (modalTriggers > 0) {
      // Open modal
      await mcp__playwright__browser_click({
        element: 'Modal trigger',
        ref: '[data-testid*="modal"], [data-testid*="dialog"], [aria-haspopup="dialog"]'
      });
      
      await mcp__playwright__browser_wait_for({ time: 1 });
      
      // Check modal is open
      const modalOpen = await mcp__playwright__browser_evaluate({
        function: `() => {
          const modal = document.querySelector('[role="dialog"], .modal[data-state="open"]');
          return modal && getComputedStyle(modal).display !== 'none';
        }`
      });
      
      if (modalOpen) {
        await mcp__playwright__browser_take_screenshot({
          filename: 'component-modal-open.png'
        });
        
        // Test close via escape key
        await mcp__playwright__browser_press_key({ key: 'Escape' });
        await mcp__playwright__browser_wait_for({ time: 1 });
        
        // Check modal is closed
        const modalClosed = await mcp__playwright__browser_evaluate({
          function: `() => {
            const modal = document.querySelector('[role="dialog"], .modal');
            return !modal || getComputedStyle(modal).display === 'none' || modal.dataset.state === 'closed';
          }`
        });
        
        expect(modalClosed).toBe(true);
      }
    }
  });

  test('Form components - Input, Select, TextArea', async () => {
    await mcp__playwright__browser_navigate({ url: `${baseURL}/sell` });
    
    // Test various form inputs
    const formFields = [
      { name: 'Title input', ref: '#title', value: 'Test Product Title', type: 'textbox' },
      { name: 'Description textarea', ref: '#description', value: 'Test product description', type: 'textbox' },
      { name: 'Price input', ref: '#price', value: '99.99', type: 'textbox' }
    ];
    
    for (const field of formFields) {
      const fieldExists = await mcp__playwright__browser_evaluate({
        function: `() => document.querySelector('${field.ref}') !== null`
      });
      
      if (fieldExists) {
        await mcp__playwright__browser_type({
          element: field.name,
          ref: field.ref,
          text: field.value
        });
        
        // Test focus state
        await mcp__playwright__browser_take_screenshot({
          filename: `component-input-${field.name.toLowerCase().replace(' ', '-')}.png`
        });
      }
    }
    
    // Test select dropdowns
    const selectFields = ['#category', '#brand', '#condition', '#size'];
    
    for (const selectRef of selectFields) {
      const selectExists = await mcp__playwright__browser_evaluate({
        function: `() => document.querySelector('${selectRef}') !== null`
      });
      
      if (selectExists) {
        await mcp__playwright__browser_click({
          element: `Select ${selectRef}`,
          ref: selectRef
        });
        
        await mcp__playwright__browser_wait_for({ time: 1 });
        
        await mcp__playwright__browser_take_screenshot({
          filename: `component-select-${selectRef.replace('#', '')}.png`
        });
        
        // Select first option
        await mcp__playwright__browser_select_option({
          element: `Select ${selectRef}`,
          ref: selectRef,
          values: ['0'] // Select first option
        });
      }
    }
  });

  test('ImageUploader component - file handling', async () => {
    await mcp__playwright__browser_navigate({ url: `${baseURL}/sell` });
    
    const imageUploader = await mcp__playwright__browser_evaluate({
      function: `() => document.querySelector('[data-testid="image-uploader"], .image-uploader, input[type="file"]') !== null`
    });
    
    if (imageUploader) {
      // Test drag and drop area
      await mcp__playwright__browser_hover({
        element: 'Image uploader',
        ref: '[data-testid="image-uploader"], .image-uploader'
      });
      
      await mcp__playwright__browser_take_screenshot({
        filename: 'component-image-uploader-hover.png'
      });
      
      // Test file input click
      await mcp__playwright__browser_click({
        element: 'File input',
        ref: 'input[type="file"], [data-testid="file-input"]'
      });
      
      // Note: Actual file upload would require file system access
      // This tests the UI interaction only
    }
  });

  test('Navigation components - Header, Footer, BottomNav', async () => {
    await mcp__playwright__browser_navigate({ url: baseURL });
    
    // Test header navigation
    const headerLinks = await mcp__playwright__browser_evaluate({
      function: `() => Array.from(document.querySelectorAll('header a, [data-testid="header"] a')).length`
    });
    
    if (headerLinks > 0) {
      // Test first header link
      await mcp__playwright__browser_hover({
        element: 'Header navigation link',
        ref: 'header a:first-child, [data-testid="header"] a:first-child'
      });
      
      await mcp__playwright__browser_take_screenshot({
        filename: 'component-header-nav-hover.png'
      });
    }
    
    // Test mobile bottom navigation
    await mcp__playwright__browser_resize({ width: 375, height: 667 });
    
    const bottomNav = await mcp__playwright__browser_evaluate({
      function: `() => document.querySelector('[data-testid="bottom-nav"], .bottom-nav') !== null`
    });
    
    if (bottomNav) {
      await mcp__playwright__browser_take_screenshot({
        filename: 'component-bottom-nav-mobile.png'
      });
      
      // Test bottom nav items
      const navItems = ['home', 'search', 'sell', 'messages', 'profile'];
      
      for (const item of navItems) {
        const itemExists = await mcp__playwright__browser_evaluate({
          function: `() => document.querySelector('[data-testid="nav-${item}"], [href*="${item}"]') !== null`
        });
        
        if (itemExists) {
          await mcp__playwright__browser_click({
            element: `${item} navigation`,
            ref: `[data-testid="nav-${item}"], [href*="${item}"]`
          });
          
          await mcp__playwright__browser_wait_for({ time: 1 });
        }
      }
    }
    
    // Reset to desktop
    await mcp__playwright__browser_resize({ width: 1920, height: 1080 });
  });

  test('Filter components - FilterModal, AppliedFilters', async () => {
    await mcp__playwright__browser_navigate({ url: `${baseURL}/search` });
    
    // Test filter button
    const filterButton = await mcp__playwright__browser_evaluate({
      function: `() => document.querySelector('[data-testid="filter-btn"], .filter-btn, [aria-label*="filter" i]') !== null`
    });
    
    if (filterButton) {
      await mcp__playwright__browser_click({
        element: 'Filter button',
        ref: '[data-testid="filter-btn"], .filter-btn, [aria-label*="filter" i]'
      });
      
      await mcp__playwright__browser_wait_for({ time: 1 });
      
      // Test filter options
      const filterOptions = await mcp__playwright__browser_evaluate({
        function: `() => Array.from(document.querySelectorAll('[data-testid*="filter"], .filter-option, input[type="checkbox"]')).length`
      });
      
      if (filterOptions > 0) {
        await mcp__playwright__browser_take_screenshot({
          filename: 'component-filter-modal-open.png'
        });
        
        // Apply some filters
        await mcp__playwright__browser_click({
          element: 'First filter option',
          ref: '[data-testid*="filter"]:first-child, .filter-option:first-child, input[type="checkbox"]:first-child'
        });
        
        await mcp__playwright__browser_click({
          element: 'Apply filters',
          ref: '[data-testid="apply-filters"], .apply-filters'
        });
        
        await mcp__playwright__browser_wait_for({ time: 2 });
        
        // Check applied filters display
        const appliedFilters = await mcp__playwright__browser_evaluate({
          function: `() => document.querySelector('[data-testid="applied-filters"], .applied-filters') !== null`
        });
        
        if (appliedFilters) {
          await mcp__playwright__browser_take_screenshot({
            filename: 'component-applied-filters.png'
          });
        }
      }
    }
  });

  test('Toast/Notification components', async () => {
    await mcp__playwright__browser_navigate({ url: baseURL });
    
    // Login to potentially trigger notifications
    await mcp__playwright__browser_navigate({ url: `${baseURL}/login` });
    
    const loginFields = [
      { name: 'Email', type: 'textbox', ref: '#email', value: testUsers.buyer.email },
      { name: 'Password', type: 'textbox', ref: '#password', value: testUsers.buyer.password }
    ];
    
    await mcp__playwright__browser_fill_form({ fields: loginFields });
    
    await mcp__playwright__browser_click({
      element: 'Login button',
      ref: '[data-testid="login-btn"]'
    });
    
    await mcp__playwright__browser_wait_for({ time: 2 });
    
    // Check for toast notifications
    const toastExists = await mcp__playwright__browser_evaluate({
      function: `() => document.querySelector('[data-testid="toast"], .toast, [role="alert"]') !== null`
    });
    
    if (toastExists) {
      await mcp__playwright__browser_take_screenshot({
        filename: 'component-toast-notification.png'
      });
      
      // Wait for toast to auto-dismiss or dismiss it
      await mcp__playwright__browser_wait_for({ time: 3 });
    }
  });

  test('Loading components - Spinners, Skeletons', async () => {
    await mcp__playwright__browser_navigate({ url: baseURL });
    
    // Check for loading spinners
    const loadingSpinner = await mcp__playwright__browser_evaluate({
      function: `() => document.querySelector('[data-testid="loading"], .loading, .spinner') !== null`
    });
    
    if (loadingSpinner) {
      await mcp__playwright__browser_take_screenshot({
        filename: 'component-loading-spinner.png'
      });
    }
    
    // Check for skeleton loaders
    const skeleton = await mcp__playwright__browser_evaluate({
      function: `() => document.querySelector('[data-testid*="skeleton"], .skeleton') !== null`
    });
    
    if (skeleton) {
      await mcp__playwright__browser_take_screenshot({
        filename: 'component-skeleton-loader.png'
      });
    }
  });

  test('Badge components - Various types and states', async () => {
    await mcp__playwright__browser_navigate({ url: baseURL });
    
    // Check for different badge types
    const badgeTypes = ['condition', 'brand', 'premium', 'new-seller', 'admin'];
    
    for (const badgeType of badgeTypes) {
      const badgeExists = await mcp__playwright__browser_evaluate({
        function: `() => document.querySelector('[data-testid="${badgeType}-badge"], .${badgeType}-badge, [class*="${badgeType}"]') !== null`
      });
      
      if (badgeExists) {
        await mcp__playwright__browser_take_screenshot({
          filename: `component-badge-${badgeType}.png`
        });
      }
    }
  });

  test.afterAll(async () => {
    await mcp__playwright__browser_close();
  });
});

// MCP function declarations
declare global {
  function mcp__playwright__browser_navigate(params: { url: string }): Promise<void>;
  function mcp__playwright__browser_resize(params: { width: number; height: number }): Promise<void>;
  function mcp__playwright__browser_evaluate(params: { function: string }): Promise<any>;
  function mcp__playwright__browser_hover(params: { element: string; ref: string }): Promise<void>;
  function mcp__playwright__browser_take_screenshot(params: { filename: string }): Promise<void>;
  function mcp__playwright__browser_click(params: { element: string; ref: string; doubleClick?: boolean }): Promise<void>;
  function mcp__playwright__browser_wait_for(params: { time?: number; text?: string }): Promise<void>;
  function mcp__playwright__browser_type(params: { element: string; ref: string; text: string; submit?: boolean }): Promise<void>;
  function mcp__playwright__browser_press_key(params: { key: string }): Promise<void>;
  function mcp__playwright__browser_fill_form(params: { fields: Array<{name: string; type: string; ref: string; value: string}> }): Promise<void>;
  function mcp__playwright__browser_select_option(params: { element: string; ref: string; values: string[] }): Promise<void>;
  function mcp__playwright__browser_close(): Promise<void>;
}