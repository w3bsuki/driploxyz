
import { test, expect } from './fixtures';

test.describe('Visual Regression Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Set consistent viewport for visual tests
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test.describe('Homepage Visual Tests', () => {
    test('should match homepage screenshot @visual', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Wait for any animations to complete
      await page.waitForTimeout(1000);
      
      // Take full page screenshot
      await expect(page).toHaveScreenshot('homepage.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should match homepage on mobile @visual', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveScreenshot('homepage-mobile.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should match homepage on tablet @visual', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveScreenshot('homepage-tablet.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });
  });

  test.describe('Authentication Pages Visual Tests', () => {
    test('should match login page design @visual', async ({ page }) => {
      await page.goto('/auth/login');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('login-page.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should match signup page design @visual', async ({ page }) => {
      await page.goto('/auth/signup');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('signup-page.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should match form validation states @visual', async ({ page }) => {
      await page.goto('/auth/login');
      await page.waitForLoadState('networkidle');
      
      // Submit empty form to trigger validation
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('login-validation.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });
  });

  test.describe('Product Pages Visual Tests', () => {
    test('should match product page layout @visual', async ({ page }) => {
      await page.goto('/app/(shop)/product/test-product-1');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveScreenshot('product-page.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should match product page on mobile @visual', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/app/(shop)/product/test-product-1');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveScreenshot('product-page-mobile.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should match search results page @visual', async ({ page }) => {
      await page.goto('/app/(shop)/search?q=camera');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveScreenshot('search-results.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should match category page @visual', async ({ page }) => {
      await page.goto('/app/(shop)/category/electronics');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveScreenshot('category-page.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });
  });

  test.describe('Dashboard Visual Tests', () => {
    test('should match dashboard overview @visual', async ({ page }) => {
      // Mock authentication
      await page.addInitScript(() => {
        localStorage.setItem('supabase.auth.token', 'mock-token');
        localStorage.setItem('supabase.auth.user', JSON.stringify({
          id: 'test-user-id',
          email: 'test@example.com',
          username: 'testuser'
        }));
      });
      
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveScreenshot('dashboard-overview.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should match dashboard sales view @visual', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('supabase.auth.token', 'mock-token');
        localStorage.setItem('supabase.auth.user', JSON.stringify({
          id: 'seller-user-id',
          email: 'seller@example.com',
          username: 'seller'
        }));
      });
      
      await page.goto('/dashboard/sales');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveScreenshot('dashboard-sales.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should match dashboard mobile view @visual', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.addInitScript(() => {
        localStorage.setItem('supabase.auth.token', 'mock-token');
        localStorage.setItem('supabase.auth.user', JSON.stringify({
          id: 'test-user-id',
          email: 'test@example.com',
          username: 'testuser'
        }));
      });
      
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveScreenshot('dashboard-mobile.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });
  });

  test.describe('Selling Flow Visual Tests', () => {
    test('should match sell page step 1 @visual', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('supabase.auth.token', 'mock-token');
        localStorage.setItem('supabase.auth.user', JSON.stringify({
          id: 'seller-user-id',
          email: 'seller@example.com',
          username: 'seller'
        }));
      });
      
      await page.goto('/sell');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveScreenshot('sell-step-1.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should match sell page mobile @visual', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.addInitScript(() => {
        localStorage.setItem('supabase.auth.token', 'mock-token');
        localStorage.setItem('supabase.auth.user', JSON.stringify({
          id: 'seller-user-id',
          email: 'seller@example.com',
          username: 'seller'
        }));
      });
      
      await page.goto('/sell');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveScreenshot('sell-mobile.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });
  });

  test.describe('Checkout Flow Visual Tests', () => {
    test('should match checkout page @visual', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('supabase.auth.token', 'mock-token');
        localStorage.setItem('supabase.auth.user', JSON.stringify({
          id: 'test-user-id',
          email: 'test@example.com',
          username: 'testuser'
        }));
      });
      
      await page.goto('/protected/checkout/test-product-1');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveScreenshot('checkout-page.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should match checkout mobile @visual', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.addInitScript(() => {
        localStorage.setItem('supabase.auth.token', 'mock-token');
        localStorage.setItem('supabase.auth.user', JSON.stringify({
          id: 'test-user-id',
          email: 'test@example.com',
          username: 'testuser'
        }));
      });
      
      await page.goto('/protected/checkout/test-product-1');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveScreenshot('checkout-mobile.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });
  });

  test.describe('Component Visual Tests', () => {
    test('should match header design @visual', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Capture just the header
      const header = page.locator('header');
      await expect(header).toHaveScreenshot('header-component.png', {
        animations: 'disabled'
      });
    });

    test('should match navigation menu @visual', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Open navigation if it's collapsible
      const navToggle = page.locator('button[aria-label*="menu"], .nav-toggle').first();
      if (await navToggle.isVisible()) {
        await navToggle.click();
        await page.waitForTimeout(500);
      }
      
      const nav = page.locator('nav, .navigation');
      await expect(nav).toHaveScreenshot('navigation-component.png', {
        animations: 'disabled'
      });
    });

    test('should match footer design @visual', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Scroll to bottom to ensure footer is visible
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);
      
      const footer = page.locator('footer');
      await expect(footer).toHaveScreenshot('footer-component.png', {
        animations: 'disabled'
      });
    });

    test('should match product card design @visual', async ({ page }) => {
      await page.goto('/app/(shop)/search?q=test');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      const productCard = page.locator('[data-testid*="product"], .product-card').first();
      if (await productCard.isVisible()) {
        await expect(productCard).toHaveScreenshot('product-card.png', {
          animations: 'disabled'
        });
      }
    });

    test('should match button states @visual', async ({ page }) => {
      await page.goto('/auth/login');
      await page.waitForLoadState('networkidle');
      
      const button = page.locator('button[type="submit"]').first();
      if (await button.isVisible()) {
        // Normal state
        await expect(button).toHaveScreenshot('button-normal.png', {
          animations: 'disabled'
        });
        
        // Hover state
        await button.hover();
        await page.waitForTimeout(200);
        await expect(button).toHaveScreenshot('button-hover.png', {
          animations: 'disabled'
        });
        
        // Focus state
        await button.focus();
        await page.waitForTimeout(200);
        await expect(button).toHaveScreenshot('button-focus.png', {
          animations: 'disabled'
        });
      }
    });

    test('should match form inputs @visual', async ({ page }) => {
      await page.goto('/auth/login');
      await page.waitForLoadState('networkidle');
      
      const emailInput = page.locator('input[type="email"], input[name*="email"]').first();
      if (await emailInput.isVisible()) {
        // Normal state
        await expect(emailInput).toHaveScreenshot('input-normal.png', {
          animations: 'disabled'
        });
        
        // Focus state
        await emailInput.focus();
        await page.waitForTimeout(200);
        await expect(emailInput).toHaveScreenshot('input-focus.png', {
          animations: 'disabled'
        });
        
        // Filled state
        await emailInput.fill('test@example.com');
        await expect(emailInput).toHaveScreenshot('input-filled.png', {
          animations: 'disabled'
        });
      }
    });
  });

  test.describe('Interactive State Visual Tests', () => {
    test('should match modal appearance @visual', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Look for modal trigger
      const modalTrigger = page.locator('button:has-text("Login"), button:has-text("Sign up"), [data-testid*="modal-trigger"]').first();
      if (await modalTrigger.isVisible()) {
        await modalTrigger.click();
        await page.waitForTimeout(1000);
        
        const modal = page.locator('[role="dialog"], .modal').first();
        if (await modal.isVisible()) {
          await expect(modal).toHaveScreenshot('modal-open.png', {
            animations: 'disabled'
          });
        }
      }
    });

    test('should match dropdown states @visual', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Look for dropdown
      const dropdown = page.locator('select, [data-testid*="dropdown"], .dropdown').first();
      if (await dropdown.isVisible()) {
        // Closed state
        await expect(dropdown).toHaveScreenshot('dropdown-closed.png', {
          animations: 'disabled'
        });
        
        // Open state
        await dropdown.click();
        await page.waitForTimeout(500);
        await expect(dropdown).toHaveScreenshot('dropdown-open.png', {
          animations: 'disabled'
        });
      }
    });

    test('should match loading states @visual', async ({ page }) => {
      // Mock slow loading
      await page.route('**/api/**', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: 'test' })
        });
      });
      
      await page.goto('/');
      
      // Capture loading state
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot('loading-state.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should match error states @visual', async ({ page }) => {
      // Mock error response
      await page.route('**/api/**', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' })
        });
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveScreenshot('error-state.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });
  });

  test.describe('Dark Mode Visual Tests', () => {
    test('should match homepage in dark mode @visual', async ({ page }) => {
      // Enable dark mode
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveScreenshot('homepage-dark.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should match dashboard in dark mode @visual', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.addInitScript(() => {
        localStorage.setItem('supabase.auth.token', 'mock-token');
        localStorage.setItem('supabase.auth.user', JSON.stringify({
          id: 'test-user-id',
          email: 'test@example.com',
          username: 'testuser'
        }));
      });
      
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveScreenshot('dashboard-dark.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });
  });

  test.describe('Responsive Design Tests', () => {
    const viewports = [
      { width: 320, height: 568, name: 'small-mobile' },
      { width: 375, height: 667, name: 'mobile' },
      { width: 414, height: 896, name: 'large-mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1024, height: 768, name: 'small-desktop' },
      { width: 1280, height: 720, name: 'desktop' },
      { width: 1440, height: 900, name: 'large-desktop' },
      { width: 1920, height: 1080, name: 'ultra-wide' }
    ];

    viewports.forEach(viewport => {
      test(`should match homepage on ${viewport.name} @visual`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        
        await expect(page).toHaveScreenshot(`homepage-${viewport.name}.png`, {
          fullPage: true,
          animations: 'disabled'
        });
      });
    });
  });

  test.describe('Content-Specific Visual Tests', () => {
    test('should match text rendering @visual', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Test different text sizes and weights
      const textElements = page.locator('h1, h2, h3, p, span').first();
      if (await textElements.isVisible()) {
        await expect(textElements).toHaveScreenshot('text-rendering.png', {
          animations: 'disabled'
        });
      }
    });

    test('should match image rendering @visual', async ({ page }) => {
      await page.goto('/app/(shop)/product/test-product-1');
      await page.waitForLoadState('networkidle');
      
      const productImage = page.locator('img[src*="product"]').first();
      if (await productImage.isVisible()) {
        await expect(productImage).toHaveScreenshot('image-rendering.png', {
          animations: 'disabled'
        });
      }
    });

    test('should match icon rendering @visual', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const icons = page.locator('svg, [data-testid*="icon"], .icon').first();
      if (await icons.isVisible()) {
        await expect(icons).toHaveScreenshot('icon-rendering.png', {
          animations: 'disabled'
        });
      }
    });
  });

  test.describe('Animation and Transition Tests', () => {
    test('should match hover states consistently @visual', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const hoverableElements = page.locator('button, a, [role="button"]').first();
      if (await hoverableElements.isVisible()) {
        // Test hover state
        await hoverableElements.hover();
        await page.waitForTimeout(300);
        
        await expect(hoverableElements).toHaveScreenshot('hover-state.png', {
          animations: 'disabled'
        });
      }
    });

    test('should match active states @visual', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const clickableElements = page.locator('button, a').first();
      if (await clickableElements.isVisible()) {
        // Test active (pressed) state
        await clickableElements.click();
        await page.waitForTimeout(100);
        
        await expect(page).toHaveScreenshot('active-state.png', {
          animations: 'disabled'
        });
      }
    });
  });
});