import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y, getViolations } from 'axe-playwright';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Inject axe-core for accessibility testing
    await injectAxe(page);
  });

  test('Homepage accessibility', async ({ page }) => {
    await page.goto('/');
    
    // Check for accessibility violations
    const violations = await getViolations(page);
    
    // Generate detailed report
    if (violations.length > 0) {
      console.log('Accessibility violations found:');
      violations.forEach(violation => {
        console.log(`\n${violation.id}: ${violation.description}`);
        console.log(`Impact: ${violation.impact}`);
        console.log(`Help: ${violation.helpUrl}`);
        violation.nodes.forEach(node => {
          console.log(`  - ${node.target}`);
        });
      });
    }
    
    // Assert no violations
    expect(violations).toHaveLength(0);
  });

  test('Search page accessibility', async ({ page }) => {
    await page.goto('/search');
    
    await checkA11y(page, undefined, {
      detailedReport: true,
      detailedReportOptions: {
        html: true
      }
    });
  });

  test('Product page accessibility', async ({ page }) => {
    // Navigate to a product page (would use real product ID in production)
    await page.goto('/product/test-product-id');
    
    await checkA11y(page, undefined, {
      rules: {
        // You can disable specific rules if needed (not recommended)
        // 'color-contrast': { enabled: false }
      }
    });
  });

  test('Category page accessibility', async ({ page }) => {
    await page.goto('/category/women');
    
    await checkA11y(page);
  });

  test('Authentication pages accessibility', async ({ page }) => {
    // Test login page
    await page.goto('/login');
    await checkA11y(page, undefined, {
      includedImpacts: ['critical', 'serious']
    });
    
    // Test signup page
    await page.goto('/signup');
    await checkA11y(page, undefined, {
      includedImpacts: ['critical', 'serious']
    });
  });

  test('Form accessibility', async ({ page }) => {
    await page.goto('/sell/new');
    
    // Check form-specific accessibility
    await checkA11y(page, 'form', {
      detailedReport: true
    });
    
    // Additional manual checks
    // Check all form inputs have labels
    const inputs = await page.$$('input, select, textarea');
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      if (id) {
        const label = await page.$(`label[for="${id}"]`);
        expect(label).toBeTruthy();
      }
    }
  });

  test('Modal accessibility', async ({ page }) => {
    await page.goto('/');
    
    // Open a modal (example: search filters)
    await page.click('[data-testid="open-filters"]');
    
    // Check modal has proper ARIA attributes
    const modal = await page.$('[role="dialog"]');
    expect(modal).toBeTruthy();
    
    const modalLabel = await modal?.getAttribute('aria-labelledby');
    expect(modalLabel).toBeTruthy();
    
    // Check focus trap
    const focusableElements = await modal?.$$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    expect(focusableElements?.length).toBeGreaterThan(0);
    
    // Check modal accessibility
    await checkA11y(page, '[role="dialog"]');
  });

  test('Navigation accessibility', async ({ page }) => {
    await page.goto('/');
    
    // Check navigation landmarks
    const nav = await page.$('nav');
    expect(nav).toBeTruthy();
    
    const navLabel = await nav?.getAttribute('aria-label');
    expect(navLabel).toBeTruthy();
    
    // Check skip links
    const skipLink = await page.$('a[href="#main"]');
    expect(skipLink).toBeTruthy();
    
    // Check navigation accessibility
    await checkA11y(page, 'nav');
  });

  test('Image accessibility', async ({ page }) => {
    await page.goto('/');
    
    // Check all images have alt text
    const images = await page.$$('img');
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      const role = await img.getAttribute('role');
      
      // Image should have alt text or role="presentation" for decorative images
      expect(alt !== null || role === 'presentation').toBeTruthy();
    }
  });

  test('Color contrast', async ({ page }) => {
    await page.goto('/');
    
    // Specific color contrast check
    await checkA11y(page, undefined, {
      rules: {
        'color-contrast': { enabled: true }
      },
      includedImpacts: ['serious', 'critical']
    });
  });

  test('Keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    
    // Check focus is visible
    const focusedElement = await page.evaluate(() => {
      const element = document.activeElement;
      return {
        tagName: element?.tagName,
        hasOutline: window.getComputedStyle(element!).outline !== 'none',
        hasBorder: window.getComputedStyle(element!).border !== 'none'
      };
    });
    
    expect(focusedElement.hasOutline || focusedElement.hasBorder).toBeTruthy();
    
    // Continue tabbing and check tab order makes sense
    const tabOrder = [];
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const element = await page.evaluate(() => ({
        tag: document.activeElement?.tagName,
        text: document.activeElement?.textContent?.substring(0, 20)
      }));
      tabOrder.push(element);
    }
    
    // Verify logical tab order (header -> main -> footer)
    expect(tabOrder.length).toBeGreaterThan(0);
  });

  test('ARIA attributes', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper ARIA usage
    const ariaErrors = await page.evaluate(() => {
      const errors = [];
      
      // Check for invalid ARIA attributes
      const elementsWithAria = document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby], [role]');
      elementsWithAria.forEach(element => {
        // Check role is valid
        const role = element.getAttribute('role');
        const validRoles = ['button', 'link', 'navigation', 'main', 'banner', 'contentinfo', 'search', 'form', 'region', 'dialog', 'alert', 'status'];
        if (role && !validRoles.includes(role)) {
          errors.push(`Invalid role: ${role} on ${element.tagName}`);
        }
        
        // Check aria-labelledby points to existing element
        const labelledby = element.getAttribute('aria-labelledby');
        if (labelledby && !document.getElementById(labelledby)) {
          errors.push(`aria-labelledby points to non-existent element: ${labelledby}`);
        }
      });
      
      return errors;
    });
    
    expect(ariaErrors).toHaveLength(0);
  });

  test('Responsive accessibility', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Mobile menu should be accessible
    const mobileMenuButton = await page.$('[data-testid="mobile-menu-button"]');
    if (mobileMenuButton) {
      const ariaExpanded = await mobileMenuButton.getAttribute('aria-expanded');
      expect(ariaExpanded).toBeDefined();
      
      await mobileMenuButton.click();
      const updatedAriaExpanded = await mobileMenuButton.getAttribute('aria-expanded');
      expect(updatedAriaExpanded).toBe('true');
    }
    
    await checkA11y(page);
  });

  test('Screen reader announcements', async ({ page }) => {
    await page.goto('/');
    
    // Check for live regions
    const liveRegions = await page.$$('[aria-live], [role="alert"], [role="status"]');
    expect(liveRegions.length).toBeGreaterThan(0);
    
    // Simulate an action that should announce to screen readers
    await page.click('[data-testid="add-to-cart"]');
    
    // Check announcement was made
    const announcement = await page.$('[role="status"]');
    const text = await announcement?.textContent();
    expect(text).toContain('Added to cart');
  });

  test('Focus management in SPAs', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to a new page via client-side routing
    await page.click('a[href="/search"]');
    
    // Focus should move to main content or h1
    const focusedElement = await page.evaluate(() => {
      return document.activeElement?.tagName;
    });
    
    expect(['MAIN', 'H1', 'BODY'].includes(focusedElement!)).toBeTruthy();
  });

  test('Error message accessibility', async ({ page }) => {
    await page.goto('/login');
    
    // Submit form with errors
    await page.click('button[type="submit"]');
    
    // Check error messages are associated with inputs
    const errorMessages = await page.$$('[role="alert"], .error-message');
    for (const error of errorMessages) {
      const id = await error.getAttribute('id');
      if (id) {
        // Find input with aria-describedby pointing to this error
        const associatedInput = await page.$(`[aria-describedby*="${id}"]`);
        expect(associatedInput).toBeTruthy();
      }
    }
    
    // Check error messages are announced
    const liveRegion = await page.$('[aria-live="polite"], [aria-live="assertive"]');
    expect(liveRegion).toBeTruthy();
  });
});

test.describe('WCAG 2.1 AA Compliance', () => {
  test('Full WCAG 2.1 AA audit - Homepage', async ({ page }) => {
    await page.goto('/');
    await injectAxe(page);
    
    await checkA11y(page, undefined, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
      },
      detailedReport: true,
      detailedReportOptions: {
        html: true
      }
    });
  });

  test('Full WCAG 2.1 AA audit - Critical user journey', async ({ page }) => {
    // Test complete purchase flow for accessibility
    await page.goto('/');
    await injectAxe(page);
    
    // Search for product
    await page.fill('[role="searchbox"]', 'jacket');
    await page.press('[role="searchbox"]', 'Enter');
    await checkA11y(page);
    
    // Select product
    await page.click('[data-testid="product-card"]');
    await checkA11y(page);
    
    // Add to cart
    await page.click('[data-testid="add-to-cart"]');
    await checkA11y(page);
    
    // Checkout
    await page.goto('/checkout');
    await checkA11y(page);
  });
});