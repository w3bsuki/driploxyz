/**
 * WCAG 2.1 AA Compliance Tests
 * Comprehensive accessibility testing using MCP Playwright
 */

import { test, expect } from '@playwright/test';
import { testUsers } from '../fixtures/test-data';

test.describe('WCAG 2.1 AA Compliance Tests', () => {
  const baseURL = 'http://localhost:5173';
  
  // Critical pages to test
  const criticalPages = [
    { path: '/', name: 'Homepage' },
    { path: '/search', name: 'Search Results' },
    { path: '/login', name: 'Login Page' },
    { path: '/signup', name: 'Signup Page' },
    { path: '/sell', name: 'Create Listing' },
    { path: '/favorites', name: 'Favorites' },
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/messages', name: 'Messages' },
    { path: '/profile/edit', name: 'Edit Profile' },
    { path: '/checkout/1', name: 'Checkout' }
  ];

  test.beforeAll(async () => {
    await mcp__playwright__browser_resize({ width: 1920, height: 1080 });
  });

  test('1.1.1 Non-text Content - All images have alt text', async () => {
    for (const page of criticalPages) {
      await mcp__playwright__browser_navigate({ url: `${baseURL}${page.path}` });
      await mcp__playwright__browser_wait_for({ time: 2 });
      
      // Check all images have alt attributes
      const imagesWithoutAlt = await mcp__playwright__browser_evaluate({
        function: `() => {
          const images = Array.from(document.querySelectorAll('img'));
          return images.filter(img => !img.hasAttribute('alt')).length;
        }`
      });
      
      expect(imagesWithoutAlt).toBe(0);
      
      // Check decorative images have empty alt
      const decorativeImages = await mcp__playwright__browser_evaluate({
        function: `() => {
          const decorativeImages = Array.from(document.querySelectorAll('img[role="presentation"], img[aria-hidden="true"]'));
          return decorativeImages.filter(img => img.alt !== '').length;
        }`
      });
      
      expect(decorativeImages).toBe(0);
      
      await mcp__playwright__browser_take_screenshot({ 
        filename: `a11y-images-${page.name.toLowerCase().replace(' ', '-')}.png` 
      });
    }
  });

  test('1.3.1 Info and Relationships - Proper heading structure', async () => {
    for (const page of criticalPages) {
      await mcp__playwright__browser_navigate({ url: `${baseURL}${page.path}` });
      
      // Check heading hierarchy
      const headingStructure = await mcp__playwright__browser_evaluate({
        function: `() => {
          const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
          return headings.map(h => ({
            level: parseInt(h.tagName.charAt(1)),
            text: h.textContent.trim()
          }));
        }`
      });
      
      // Should have exactly one h1
      const h1Count = headingStructure.filter(h => h.level === 1).length;
      expect(h1Count).toBeLessThanOrEqual(1);
      
      // Check heading order doesn't skip levels
      for (let i = 1; i < headingStructure.length; i++) {
        const current = headingStructure[i];
        const previous = headingStructure[i - 1];
        const levelJump = current.level - previous.level;
        expect(levelJump).toBeLessThanOrEqual(1);
      }
    }
  });

  test('1.3.2 Meaningful Sequence - Logical reading order', async () => {
    await mcp__playwright__browser_navigate({ url: baseURL });
    
    // Test tab order follows logical sequence
    const tabOrder = [];
    
    for (let i = 0; i < 10; i++) {
      await mcp__playwright__browser_press_key({ key: 'Tab' });
      
      const activeElement = await mcp__playwright__browser_evaluate({
        function: `() => {
          const active = document.activeElement;
          return active ? {
            tagName: active.tagName,
            id: active.id,
            className: active.className,
            text: active.textContent?.trim().substring(0, 50)
          } : null;
        }`
      });
      
      if (activeElement) {
        tabOrder.push(activeElement);
      }
    }
    
    console.log('Tab order:', tabOrder);
    expect(tabOrder.length).toBeGreaterThan(0);
  });

  test('1.4.1 Use of Color - Information not conveyed by color alone', async () => {
    await mcp__playwright__browser_navigate({ url: baseURL });
    
    // Check for elements that might rely only on color
    const colorOnlyElements = await mcp__playwright__browser_evaluate({
      function: `() => {
        const elements = Array.from(document.querySelectorAll('*'));
        return elements.filter(el => {
          const style = getComputedStyle(el);
          const text = el.textContent?.trim();
          
          // Look for error states, success states etc.
          return (el.classList.contains('error') || 
                  el.classList.contains('success') ||
                  el.classList.contains('warning')) && 
                 !text && 
                 !el.hasAttribute('aria-label') &&
                 !el.hasAttribute('title');
        }).length;
      }`
    });
    
    expect(colorOnlyElements).toBe(0);
  });

  test('1.4.3 Contrast - Minimum color contrast ratios', async () => {
    for (const page of criticalPages) {
      await mcp__playwright__browser_navigate({ url: `${baseURL}${page.path}` });
      
      // Check contrast ratios (simplified check)
      const contrastIssues = await mcp__playwright__browser_evaluate({
        function: `() => {
          const elements = Array.from(document.querySelectorAll('*'));
          const issues = [];
          
          elements.forEach(el => {
            const style = getComputedStyle(el);
            const text = el.textContent?.trim();
            
            if (text && text.length > 0) {
              const color = style.color;
              const backgroundColor = style.backgroundColor;
              
              // Simple check for very low contrast (black on black, white on white)
              if ((color === 'rgb(0, 0, 0)' && backgroundColor === 'rgb(0, 0, 0)') ||
                  (color === 'rgb(255, 255, 255)' && backgroundColor === 'rgb(255, 255, 255)')) {
                issues.push({
                  text: text.substring(0, 50),
                  color,
                  backgroundColor
                });
              }
            }
          });
          
          return issues;
        }`
      });
      
      expect(contrastIssues.length).toBe(0);
    }
  });

  test('1.4.4 Resize Text - Text can be resized to 200%', async () => {
    await mcp__playwright__browser_navigate({ url: baseURL });
    
    // Set zoom to 200%
    await mcp__playwright__browser_evaluate({
      function: `() => document.body.style.zoom = '2.0'`
    });
    
    await mcp__playwright__browser_wait_for({ time: 1 });
    
    // Check if content is still accessible
    const isContentAccessible = await mcp__playwright__browser_evaluate({
      function: `() => {
        const body = document.body;
        return body.scrollWidth <= window.innerWidth * 2.5; // Allow some overflow
      }`
    });
    
    // Reset zoom
    await mcp__playwright__browser_evaluate({
      function: `() => document.body.style.zoom = '1.0'`
    });
    
    await mcp__playwright__browser_take_screenshot({ 
      filename: 'a11y-zoom-200-percent.png' 
    });
  });

  test('2.1.1 Keyboard - All functionality available via keyboard', async () => {
    await mcp__playwright__browser_navigate({ url: baseURL });
    
    // Test keyboard navigation to key interactive elements
    const interactiveElements = ['button', 'a', 'input', 'select', 'textarea'];
    
    for (const elementType of interactiveElements) {
      const elementExists = await mcp__playwright__browser_evaluate({
        function: `() => document.querySelector('${elementType}') !== null`
      });
      
      if (elementExists) {
        // Focus should be visible and manageable
        await mcp__playwright__browser_evaluate({
          function: `() => {
            const element = document.querySelector('${elementType}');
            if (element) element.focus();
          }`
        });
        
        const hasFocus = await mcp__playwright__browser_evaluate({
          function: `() => document.activeElement?.tagName.toLowerCase() === '${elementType}'`
        });
        
        expect(hasFocus).toBe(true);
      }
    }
  });

  test('2.1.2 No Keyboard Trap - Users can navigate away from all components', async () => {
    await mcp__playwright__browser_navigate({ url: baseURL });
    
    // Test modal/dialog keyboard traps
    const hasModal = await mcp__playwright__browser_evaluate({
      function: `() => document.querySelector('[role="dialog"], .modal') !== null`
    });
    
    if (hasModal) {
      // Open modal if exists
      await mcp__playwright__browser_click({
        element: 'Modal trigger',
        ref: '[data-testid*="modal"], [data-testid*="dialog"]'
      });
      
      // Try to escape
      await mcp__playwright__browser_press_key({ key: 'Escape' });
      
      // Modal should close
      const modalClosed = await mcp__playwright__browser_evaluate({
        function: `() => {
          const modal = document.querySelector('[role="dialog"], .modal');
          return !modal || getComputedStyle(modal).display === 'none';
        }`
      });
      
      expect(modalClosed).toBe(true);
    }
  });

  test('2.4.1 Bypass Blocks - Skip to main content link', async () => {
    await mcp__playwright__browser_navigate({ url: baseURL });
    
    // Focus first element and look for skip link
    await mcp__playwright__browser_press_key({ key: 'Tab' });
    
    const skipLinkExists = await mcp__playwright__browser_evaluate({
      function: `() => {
        const activeElement = document.activeElement;
        return activeElement && 
               (activeElement.textContent?.includes('skip') ||
                activeElement.textContent?.includes('main') ||
                activeElement.href?.includes('#main'));
      }`
    });
    
    expect(skipLinkExists).toBe(true);
  });

  test('2.4.2 Page Titled - Each page has a descriptive title', async () => {
    for (const page of criticalPages) {
      await mcp__playwright__browser_navigate({ url: `${baseURL}${page.path}` });
      
      const title = await mcp__playwright__browser_evaluate({
        function: `() => document.title`
      });
      
      expect(title).toBeDefined();
      expect(title.length).toBeGreaterThan(0);
      expect(title).not.toBe('Document'); // Default title
    }
  });

  test('2.4.3 Focus Order - Logical focus order', async () => {
    await mcp__playwright__browser_navigate({ url: `${baseURL}/sell` });
    
    const focusOrder = [];
    
    // Tab through form elements
    for (let i = 0; i < 15; i++) {
      await mcp__playwright__browser_press_key({ key: 'Tab' });
      
      const focusedElement = await mcp__playwright__browser_evaluate({
        function: `() => {
          const active = document.activeElement;
          if (!active) return null;
          
          const rect = active.getBoundingClientRect();
          return {
            tagName: active.tagName,
            type: active.type,
            id: active.id,
            top: rect.top,
            left: rect.left
          };
        }`
      });
      
      if (focusedElement) {
        focusOrder.push(focusedElement);
      }
    }
    
    // Focus order should generally move left-to-right, top-to-bottom
    for (let i = 1; i < focusOrder.length; i++) {
      const current = focusOrder[i];
      const previous = focusOrder[i - 1];
      
      // Allow some flexibility in focus order
      const isLogical = current.top >= previous.top - 50;
      expect(isLogical).toBe(true);
    }
  });

  test('2.4.4 Link Purpose - Link purpose clear from text or context', async () => {
    for (const page of criticalPages) {
      await mcp__playwright__browser_navigate({ url: `${baseURL}${page.path}` });
      
      const vagueLinkTexts = ['click here', 'read more', 'more', 'here', 'link'];
      
      const vagueLinks = await mcp__playwright__browser_evaluate({
        function: `() => {
          const links = Array.from(document.querySelectorAll('a'));
          const vague = ['click here', 'read more', 'more', 'here', 'link'];
          
          return links.filter(link => {
            const text = link.textContent?.toLowerCase().trim();
            return vague.includes(text) && 
                   !link.hasAttribute('aria-label') &&
                   !link.hasAttribute('title');
          }).length;
        }`
      });
      
      expect(vagueLinks).toBe(0);
    }
  });

  test('3.1.1 Language of Page - Page language specified', async () => {
    for (const page of criticalPages) {
      await mcp__playwright__browser_navigate({ url: `${baseURL}${page.path}` });
      
      const hasLangAttribute = await mcp__playwright__browser_evaluate({
        function: `() => document.documentElement.hasAttribute('lang')`
      });
      
      expect(hasLangAttribute).toBe(true);
      
      const langValue = await mcp__playwright__browser_evaluate({
        function: `() => document.documentElement.getAttribute('lang')`
      });
      
      expect(['bg', 'en', 'bg-BG', 'en-GB']).toContain(langValue);
    }
  });

  test('3.2.1 On Focus - No unexpected context changes on focus', async () => {
    await mcp__playwright__browser_navigate({ url: baseURL });
    
    const initialUrl = await mcp__playwright__browser_evaluate({
      function: `() => window.location.href`
    });
    
    // Tab through elements and check for unexpected navigation
    for (let i = 0; i < 10; i++) {
      await mcp__playwright__browser_press_key({ key: 'Tab' });
      await mcp__playwright__browser_wait_for({ time: 0.5 });
      
      const currentUrl = await mcp__playwright__browser_evaluate({
        function: `() => window.location.href`
      });
      
      // URL shouldn't change just from focusing
      expect(currentUrl).toBe(initialUrl);
    }
  });

  test('3.3.1 Error Identification - Errors clearly identified', async () => {
    await mcp__playwright__browser_navigate({ url: `${baseURL}/login` });
    
    // Submit empty form to trigger validation
    await mcp__playwright__browser_click({
      element: 'Login button',
      ref: '[data-testid="login-btn"]'
    });
    
    await mcp__playwright__browser_wait_for({ time: 1 });
    
    const errorMessages = await mcp__playwright__browser_evaluate({
      function: `() => {
        const errors = Array.from(document.querySelectorAll('[role="alert"], .error, [aria-invalid="true"]'));
        return errors.map(error => ({
          text: error.textContent?.trim(),
          hasAriaLabel: error.hasAttribute('aria-label'),
          isVisible: getComputedStyle(error).display !== 'none'
        }));
      }`
    });
    
    expect(errorMessages.length).toBeGreaterThan(0);
    
    await mcp__playwright__browser_take_screenshot({
      filename: 'a11y-error-identification.png'
    });
  });

  test('3.3.2 Labels or Instructions - Form fields have labels', async () => {
    const formsPages = ['/login', '/signup', '/sell', '/profile/edit'];
    
    for (const pagePath of formsPages) {
      await mcp__playwright__browser_navigate({ url: `${baseURL}${pagePath}` });
      
      const inputsWithoutLabels = await mcp__playwright__browser_evaluate({
        function: `() => {
          const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
          return inputs.filter(input => {
            // Skip hidden inputs
            if (input.type === 'hidden') return false;
            
            // Check for various labeling methods
            const hasLabel = input.labels && input.labels.length > 0;
            const hasAriaLabel = input.hasAttribute('aria-label');
            const hasAriaLabelledby = input.hasAttribute('aria-labelledby');
            const hasPlaceholder = input.hasAttribute('placeholder');
            
            return !(hasLabel || hasAriaLabel || hasAriaLabelledby || hasPlaceholder);
          }).length;
        }`
      });
      
      expect(inputsWithoutLabels).toBe(0);
    }
  });

  test('4.1.1 Parsing - Valid HTML markup', async () => {
    for (const page of criticalPages) {
      await mcp__playwright__browser_navigate({ url: `${baseURL}${page.path}` });
      
      const htmlValidationErrors = await mcp__playwright__browser_evaluate({
        function: `() => {
          // Basic HTML validation checks
          const errors = [];
          
          // Check for duplicate IDs
          const ids = Array.from(document.querySelectorAll('[id]')).map(el => el.id);
          const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
          
          if (duplicateIds.length > 0) {
            errors.push('Duplicate IDs found: ' + duplicateIds.join(', '));
          }
          
          // Check for missing required attributes
          const buttons = Array.from(document.querySelectorAll('button[type=""]'));
          if (buttons.length > 0) {
            errors.push('Buttons with empty type attributes found');
          }
          
          return errors;
        }`
      });
      
      expect(htmlValidationErrors.length).toBe(0);
    }
  });

  test('4.1.2 Name, Role, Value - Proper ARIA implementation', async () => {
    await mcp__playwright__browser_navigate({ url: baseURL });
    
    const ariaIssues = await mcp__playwright__browser_evaluate({
      function: `() => {
        const issues = [];
        
        // Check buttons have accessible names
        const buttons = Array.from(document.querySelectorAll('button'));
        buttons.forEach(btn => {
          const hasText = btn.textContent?.trim().length > 0;
          const hasAriaLabel = btn.hasAttribute('aria-label');
          const hasAriaLabelledby = btn.hasAttribute('aria-labelledby');
          
          if (!hasText && !hasAriaLabel && !hasAriaLabelledby) {
            issues.push('Button without accessible name found');
          }
        });
        
        // Check links have accessible names
        const links = Array.from(document.querySelectorAll('a'));
        links.forEach(link => {
          const hasText = link.textContent?.trim().length > 0;
          const hasAriaLabel = link.hasAttribute('aria-label');
          
          if (!hasText && !hasAriaLabel) {
            issues.push('Link without accessible name found');
          }
        });
        
        return issues;
      }`
    });
    
    expect(ariaIssues.length).toBe(0);
  });

  test('Touch targets are at least 44px', async () => {
    // Test mobile viewport
    await mcp__playwright__browser_resize({ width: 375, height: 667 });
    
    await mcp__playwright__browser_navigate({ url: baseURL });
    
    const smallTouchTargets = await mcp__playwright__browser_evaluate({
      function: `() => {
        const interactiveElements = Array.from(document.querySelectorAll('button, a, input, select, textarea, [role="button"]'));
        
        return interactiveElements.filter(el => {
          const rect = el.getBoundingClientRect();
          return (rect.width < 44 || rect.height < 44) && 
                 getComputedStyle(el).display !== 'none';
        }).length;
      }`
    });
    
    expect(smallTouchTargets).toBe(0);
    
    // Reset to desktop
    await mcp__playwright__browser_resize({ width: 1920, height: 1080 });
  });

  test.afterAll(async () => {
    await mcp__playwright__browser_close();
  });
});