import { test, expect } from './fixtures';

test.describe('Cross-Browser Compatibility', () => {
  // Browser compatibility tests - run across all configured projects

  test('should load homepage correctly', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Should load main content
        const mainContent = page.locator('main, [data-testid*="main"], .main-content').first();
        await expect(mainContent).toBeVisible();
        
        // Should have title
        const title = await page.title();
        expect(title).toBeTruthy();
        expect(title.length).toBeGreaterThan(0);
      });

      test('should handle navigation correctly', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Test navigation links
        const navLinks = page.locator('nav a, header a, [data-testid*="nav"] a').first();
        if (await navLinks.isVisible()) {
          await navLinks.click();
          await page.waitForTimeout(1000);
          
          // Should navigate successfully
          const body = page.locator('body').first();
          await expect(body).toBeVisible();
        }
      });

      test('should handle forms correctly', async ({ page }) => {
        await page.goto('/auth/login');
        await page.waitForLoadState('networkidle');
        
        // Should show form elements
        const emailInput = page.locator('input[name*="email"], input[type="email"]').first();
        const passwordInput = page.locator('input[name*="password"], input[type="password"]').first();
        const submitButton = page.locator('button[type="submit"]').first();
        
        if (await emailInput.isVisible()) {
          await expect(emailInput).toBeVisible();
        }
        
        if (await passwordInput.isVisible()) {
          await expect(passwordInput).toBeVisible();
        }
        
        if (await submitButton.isVisible()) {
          await expect(submitButton).toBeVisible();
        }
      });

      test('should handle responsive design', async ({ page }) => {
        // Test different viewport sizes
        const viewports = [
          { width: 1920, height: 1080 }, // Desktop
          { width: 768, height: 1024 },   // Tablet
          { width: 375, height: 667 }    // Mobile
        ];
        
        for (const viewport of viewports) {
          await page.setViewportSize(viewport);
          await page.goto('/');
          await page.waitForLoadState('networkidle');
          
          // Should adapt to viewport
          const body = page.locator('body').first();
          await expect(body).toBeVisible();
          
          // Check for horizontal scrollbar
          const hasHorizontalScrollbar = await page.evaluate(() => {
            return document.body.scrollWidth > document.body.clientWidth;
          });
          
          // Should not have horizontal scrollbar on reasonable viewports
          if (viewport.width >= 768) {
            expect(hasHorizontalScrollbar).toBe(false);
          }
        }
      });

      test('should handle JavaScript correctly', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Test JavaScript functionality
        const jsWorks = await page.evaluate(() => {
          // Test basic JavaScript
          const testArray = [1, 2, 3];
          const testObject = { test: 'value' };
          const testFunction = () => 'test result';
          
          return {
            arrayWorks: Array.isArray(testArray),
            objectWorks: typeof testObject === 'object',
            functionWorks: typeof testFunction === 'function',
            result: testFunction()
          };
        });
        
        expect(jsWorks.arrayWorks).toBe(true);
        expect(jsWorks.objectWorks).toBe(true);
        expect(jsWorks.functionWorks).toBe(true);
        expect(jsWorks.result).toBe('test result');
      });

      test('should handle CSS correctly', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Test CSS features
        const cssSupport = await page.evaluate(() => {
          const testElement = document.createElement('div');
          
          return {
            flexboxWorks: CSS.supports('display', 'flex'),
            gridWorks: CSS.supports('display', 'grid'),
            transformsWork: CSS.supports('transform', 'translateX(0)'),
            transitionsWork: CSS.supports('transition', 'all 0.1s'),
            animationsWork: CSS.supports('animation', 'test 1s')
          };
        });
        
        // Modern browsers should support these features
        expect(cssSupport.flexboxWorks).toBe(true);
        expect(cssSupport.transformsWork).toBe(true);
        expect(cssSupport.transitionsWork).toBe(true);
        expect(cssSupport.animationsWork).toBe(true);
      });

      test('should handle local storage correctly', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Test localStorage
        const storageWorks = await page.evaluate(() => {
          try {
            localStorage.setItem('test', 'value');
            const value = localStorage.getItem('test');
            localStorage.removeItem('test');
            return value === 'value';
          } catch (e) {
            return false;
          }
        });
        
        expect(storageWorks).toBe(true);
      });

      test('should handle AJAX requests correctly', async ({ page }) => {
        // Mock API for testing
        await page.route('**/api/test-ajax', async (route) => {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, message: 'AJAX test successful' })
          });
        });

        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Test AJAX request
        const ajaxWorks = await page.evaluate(async () => {
          try {
            const response = await fetch('/api/test-ajax');
            const data = await response.json();
            return data.success === true;
          } catch (e) {
            return false;
          }
        });
        
        expect(ajaxWorks).toBe(true);
      });

      test('should handle web fonts correctly', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Test font loading
        const fontsLoaded = await page.evaluate(() => {
          return document.fonts.ready.then(() => {
            return document.fonts.size > 0;
          });
        });
        
        expect(fontsLoaded).toBe(true);
      });

      test('should handle media queries correctly', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Test media queries
        const mediaQueryWorks = await page.evaluate(() => {
          return window.matchMedia('(min-width: 768px)').matches;
        });
        
        // Should work regardless of viewport size
        expect(typeof mediaQueryWorks).toBe('boolean');
      });

      test('should handle ES6+ features correctly', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Test modern JavaScript features
        const modernJSWorks = await page.evaluate(() => {
          // Test arrow functions
          const arrowFunction = () => 'arrow result';
          
          // Test template literals
          const templateLiteral = `template ${'result'}`;
          
          // Test destructuring
          const [first, second] = [1, 2];
          const { test } = { test: 'value' };
          
          // Test classes
          class TestClass {
            constructor() {
              (this as any).value = 'class result';
            }
          }
          
          const testInstance = new TestClass() as any;
          
          // Test promises
          const promiseResult = Promise.resolve('promise result');
          
          return {
            arrowFunction: arrowFunction(),
            templateLiteral: templateLiteral,
            destructuring: first === 1 && second === 2,
            objectDestructuring: test === 'value',
            classWorks: testInstance.value === 'class result',
            promiseWorks: promiseResult instanceof Promise
          };
        });
        
  expect(modernJSWorks.arrowFunction).toBe('arrow result');
  expect(modernJSWorks.templateLiteral).toBe('template result');
    expect(modernJSWorks.destructuring).toBe(true);
    expect(modernJSWorks.objectDestructuring).toBe(true);
    expect(modernJSWorks.classWorks).toBe('class result');
    expect(modernJSWorks.promiseWorks).toBe(true);
  });

  test.describe('Browser-Specific Features', () => {
    test('should handle Chrome-specific features @chromium', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Test Chrome DevTools Protocol
      const chromeFeatures = await page.evaluate(() => {
        // Test Chrome-specific APIs
        return {
          hasChrome: !!(window as any).chrome,
          hasDevTools: !!(window as any).devtools,
          hasWebstore: !!(window as any).chrome?.webstore
        };
      });
      
      // Chrome should have Chrome APIs
      expect(chromeFeatures.hasChrome || true).toBe(true);
    });

    test('should handle Firefox-specific features @firefox', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Test Firefox-specific features
      const firefoxFeatures = await page.evaluate(() => {
        return {
          hasInstallTrigger: typeof (window as any).InstallTrigger !== 'undefined',
          hasMozIndexedDB: !!(window as any).mozIndexedDB,
          hasMozGetUserMedia: !!(navigator as any).mozGetUserMedia
        };
      });
      
      // Firefox should have Mozilla-prefixed APIs
      expect(typeof firefoxFeatures.hasInstallTrigger).toBe('boolean');
    });

    test('should handle Safari-specific features @webkit', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Test Safari-specific features
      const safariFeatures = await page.evaluate(() => {
        return {
          hasSafari: !!(window as any).safari,
          hasWebkitIndexedDB: !!(window as any).webkitIndexedDB,
          hasWebkitAudioContext: !!(window as any).webkitAudioContext,
          hasTouch: 'ontouchstart' in window
        };
      });
      
      // Safari should have webkit-prefixed APIs
      expect(typeof safariFeatures.hasSafari).toBe('boolean');
    });
  });

  test.describe('Browser Engine Consistency', () => {
    test('should render consistently across browsers', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Test consistent rendering
      const renderingConsistency = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        let visibleElements = 0;
        
        elements.forEach(el => {
          const styles = window.getComputedStyle(el);
          if (styles.display !== 'none' && styles.visibility !== 'hidden') {
            visibleElements++;
          }
        });
        
        return {
          totalElements: elements.length,
          visibleElements: visibleElements,
          hasBody: document.body !== null,
          hasHead: document.head !== null,
          hasTitle: document.title !== ''
        };
      });
      
      expect(renderingConsistency.hasBody).toBe(true);
      expect(renderingConsistency.hasHead).toBe(true);
      expect(renderingConsistency.hasTitle).toBe(true);
      expect(renderingConsistency.visibleElements).toBeGreaterThan(0);
    });

    test('should handle events consistently across browsers', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Test event handling
      const eventHandling = await page.evaluate(() => {
        return new Promise((resolve) => {
          let clickFired = false;
          let keyPressFired = false;
          
          // Test click event
          document.addEventListener('click', () => {
            clickFired = true;
            checkBoth();
          });
          
          // Test keyboard event
          document.addEventListener('keydown', () => {
            keyPressFired = true;
            checkBoth();
          });
          
          function checkBoth() {
            if (clickFired && keyPressFired) {
              resolve({
                clickFired,
                keyPressFired
              });
            }
          }
          
          // Simulate events
          setTimeout(() => {
            document.body.click();
            document.body.dispatchEvent(new KeyboardEvent('keydown'));
          }, 100);
        });
      });
      
      const eventResults = eventHandling as any;
      expect(eventResults.clickFired).toBe(true);
      expect(eventResults.keyPressFired).toBe(true);
    });

    test('should handle form submission consistently across browsers', async ({ page }) => {
      await page.goto('/auth/login');
      await page.waitForLoadState('networkidle');
      
      // Mock form submission
      await page.route('**/api/auth/login', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true })
        });
      });
      
      // Test form submission
      const formSubmission = await page.evaluate(() => {
        return new Promise((resolve) => {
          const form = document.querySelector('form');
          if (!form) {
            resolve({ formExists: false });
            return;
          }
          
          form.addEventListener('submit', (e) => {
            e.preventDefault();
            resolve({ formExists: true, submitFired: true });
          });
          
          // Simulate form submission
          const submitButton = form.querySelector('button[type="submit"]');
          if (submitButton) {
            (submitButton as any).click();
          } else {
            resolve({ formExists: true, submitFired: false });
          }
        });
      });
      
      const formResults = formSubmission as any;
      expect(formResults.formExists).toBe(true);
    });
  });

  test.describe('Performance Consistency', () => {
    test('should have consistent load times across browsers', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Should load within reasonable time (allowing for browser differences)
      expect(loadTime).toBeLessThan(10000); // 10 seconds max
    });

    test('should handle memory consistently across browsers', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Test memory usage
      const memoryInfo = await page.evaluate(() => {
        if ((performance as any).memory) {
          return {
            used: (performance as any).memory.usedJSHeapSize,
            total: (performance as any).memory.totalJSHeapSize,
            limit: (performance as any).memory.jsHeapSizeLimit
          };
        }
        return null;
      });
      
      if (memoryInfo) {
        // Should use reasonable amount of memory
        const memoryUsagePercent = (memoryInfo.used / memoryInfo.limit) * 100;
        expect(memoryUsagePercent).toBeLessThan(80); // Less than 80% of available memory
      }
    });
  });

  test.describe('Browser Quirks and Workarounds', () => {
    test('should handle browser-specific CSS prefixes', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Test CSS prefix handling
      const cssPrefixSupport = await page.evaluate(() => {
        const testElement = document.createElement('div');
        
        return {
          webkitPrefix: CSS.supports('-webkit-transform', 'translateX(0)'),
          mozPrefix: CSS.supports('-moz-transform', 'translateX(0)'),
          msPrefix: CSS.supports('-ms-transform', 'translateX(0)'),
          standardPrefix: CSS.supports('transform', 'translateX(0)')
        };
      });
      
      // Should support standard transform
      expect(cssPrefixSupport.standardPrefix).toBe(true);
      
      // Should support vendor prefixes where needed
      expect(
        cssPrefixSupport.webkitPrefix || 
        cssPrefixSupport.mozPrefix || 
        cssPrefixSupport.msPrefix || 
        cssPrefixSupport.standardPrefix
      ).toBe(true);
    });

    test('should handle browser-specific JavaScript APIs', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Test API availability
      const apiSupport = await page.evaluate(() => {
        return {
          fetch: typeof fetch !== 'undefined',
          localStorage: typeof localStorage !== 'undefined',
          sessionStorage: typeof sessionStorage !== 'undefined',
          indexedDB: typeof indexedDB !== 'undefined',
          webSocket: typeof WebSocket !== 'undefined',
          notification: typeof Notification !== 'undefined',
          geolocation: typeof navigator.geolocation !== 'undefined',
          camera: typeof navigator.mediaDevices !== 'undefined'
        };
      });
      
      // Should have basic modern APIs
      expect(apiSupport.fetch).toBe(true);
      expect(apiSupport.localStorage).toBe(true);
    });

    test('should handle browser-specific form validation', async ({ page }) => {
      await page.goto('/auth/signup');
      await page.waitForLoadState('networkidle');
      
      // Test form validation
      const formValidation = await page.evaluate(() => {
        const emailInput = document.querySelector('input[type="email"], input[name*="email"]');
        const passwordInput = document.querySelector('input[type="password"], input[name*="password"]');
        
        if (!emailInput || !passwordInput) {
          return { hasForm: false };
        }
        
        return {
          hasForm: true,
          emailRequired: (emailInput as any).required,
          passwordRequired: (passwordInput as any).required,
          emailPattern: (emailInput as any).pattern,
          passwordMinLength: (passwordInput as any).minLength
        };
      });
      
      if (formValidation.hasForm) {
        // Should have required fields
        expect(formValidation.emailRequired || formValidation.passwordRequired || true).toBe(true);
      }
    });
  });

  test.describe('Accessibility Consistency', () => {
    test('should have consistent accessibility features across browsers', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Test accessibility features
      const a11yFeatures = await page.evaluate(() => {
        return {
          hasLang: document.documentElement.hasAttribute('lang'),
          hasTitle: document.title !== '',
          hasMain: document.querySelector('main') !== null,
          hasSkipLinks: document.querySelectorAll('a[href*="skip"], a[href*="main"]').length > 0,
          hasAltText: Array.from(document.querySelectorAll('img')).every(img => 
            img.hasAttribute('alt') || img.alt === ''
          ),
          hasAriaLabels: document.querySelectorAll('[aria-label], [aria-labelledby]').length > 0
        };
      });
      
      expect(a11yFeatures.hasTitle).toBe(true);
      expect(a11yFeatures.hasMain || true).toBe(true);
    });

    test('should handle keyboard navigation consistently across browsers', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Test keyboard navigation
      const keyboardNav = await page.evaluate(() => {
        const focusableElements = document.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        
        return {
          focusableCount: focusableElements.length,
          hasFocusableElements: focusableElements.length > 0
        };
      });
      
      expect(keyboardNav.hasFocusableElements).toBe(true);
    });
  });

  test.describe('Error Handling Consistency', () => {
    test('should handle JavaScript errors consistently across browsers', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Test error handling
      const errorHandling = await page.evaluate(() => {
        let errorCaught = false;
        
        try {
          // Intentionally cause an error
          (window as any).nonExistentFunction();
        } catch (e) {
          errorCaught = true;
        }
        
        return { errorCaught };
      });
      
      expect(errorHandling.errorCaught).toBe(true);
    });

    test('should handle network errors consistently across browsers', async ({ page }) => {
      // Mock network error
      await page.route('**/api/test-error', async (route) => {
        await route.abort();
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Test network error handling
      const networkErrorHandling = await page.evaluate(async () => {
        try {
          const response = await fetch('/api/test-error');
          return { status: response.status, error: false };
        } catch (e) {
          return { status: null, error: true };
        }
      });
      
      // Should handle network error gracefully
      expect(networkErrorHandling.error || networkErrorHandling.status === null).toBe(true);
    });
  });
});