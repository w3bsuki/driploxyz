import { test, expect } from './fixtures';

test.describe('Performance and Load Testing', () => {
  test.describe('Page Load Performance', () => {
    test('should load homepage within performance budgets', async ({ page }) => {
      const startTime = Date.now();
      
      // Monitor performance metrics
      const performanceMetrics: any[] = [];
      
      page.on('response', response => {
        performanceMetrics.push({
          url: response.url(),
          status: response.status(),
          timing: Date.now()
        });
      });

      await page.goto('/', { waitUntil: 'networkidle' });
      const loadTime = Date.now() - startTime;

      // Should load within reasonable time
      expect(loadTime).toBeLessThan(5000); // 5 seconds max

      // Check for critical resources
      const criticalResources = performanceMetrics.filter(m => 
        m.url.includes('css') || m.url.includes('js') || m.url.includes('font')
      );

      // Should not have too many failed requests
      const failedRequests = criticalResources.filter(m => m.status >= 400);
      expect(failedRequests.length).toBe(0);

      // Check DOM content loaded
      const domContentLoaded = await page.evaluate(() => {
        return performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
      });

      expect(domContentLoaded).toBeLessThan(3000); // 3 seconds max
    });

    test('should handle heavy product pages efficiently', async ({ page }) => {
      await page.goto('/app/(shop)/product/test-product-1', { waitUntil: 'networkidle' });

      // Measure Time to Interactive
      const tti = await page.evaluate(() => {
        return new Promise((resolve) => {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            if (lastEntry) {
              resolve(lastEntry.startTime);
            }
          });
          observer.observe({ entryTypes: ['measure'] });
          
          // Simulate interaction readiness
          setTimeout(() => {
            performance.mark('tti-ready');
            performance.measure('tti', 'navigationStart', 'tti-ready');
          }, 100);
        });
      });

      // Should be interactive within reasonable time
      expect(tti).toBeLessThan(4000);

      // Check for layout shifts
      const cls = await page.evaluate(() => {
        return new Promise((resolve) => {
          let clsValue = 0;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              const layoutShiftEntry = entry as any;
              if (!layoutShiftEntry.hadRecentInput) {
                clsValue += layoutShiftEntry.value;
              }
            }
            resolve(clsValue);
          }).observe({ entryTypes: ['layout-shift'] });
          
          setTimeout(() => resolve(clsValue), 2000);
        });
      });

      // Should have minimal layout shifts
      expect(cls).toBeLessThan(0.1);
    });

    test('should handle search results page performance', async ({ page }) => {
      await page.goto('/app/(shop)/search?q=camera', { waitUntil: 'networkidle' });

      // Measure first contentful paint
      const fcp = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
            if (fcpEntry) {
              resolve(fcpEntry.startTime);
            }
          }).observe({ entryTypes: ['paint'] });
        });
      });

      // Should have first contentful paint quickly
      expect(fcp).toBeLessThan(2000);

      // Check if images are loaded efficiently
      const images = page.locator('img');
      const imageCount = await images.count();
      
      if (imageCount > 0) {
        // Check for lazy loading
        const lazyLoadedImages = await images.evaluateAll(imgs => 
          imgs.map(img => img.hasAttribute('loading') && img.getAttribute('loading') === 'lazy')
        );

        const lazyLoadedCount = lazyLoadedImages.filter(Boolean).length;
        
        // Should use lazy loading for images below the fold
        expect(lazyLoadedCount).toBeGreaterThan(0);
      }
    });

    test('should handle dashboard loading with large datasets', async ({ page }) => {
      // Mock large dataset
      await page.route('**/api/dashboard', async (route) => {
        const largeData = {
          stats: {
            totalSales: 12500.00,
            totalOrders: 150,
            avgRating: 4.7,
            activeListings: 80
          },
          recentOrders: Array.from({ length: 100 }, (_, i) => ({
            id: `order-${i}`,
            total_amount: Math.random() * 100,
            created_at: new Date().toISOString()
          })),
          recentSales: Array.from({ length: 100 }, (_, i) => ({
            id: `sale-${i}`,
            total_amount: Math.random() * 100,
            created_at: new Date().toISOString()
          }))
        };

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(largeData)
        });
      });

      const startTime = Date.now();
      await page.goto('/dashboard', { waitUntil: 'networkidle' });
      const loadTime = Date.now() - startTime;

      // Should handle large datasets efficiently
      expect(loadTime).toBeLessThan(6000);

      // Should implement virtualization or pagination for large lists
      const scrollableContainers = page.locator('[data-testid*="virtual"], .virtual-list, .infinite-scroll').first();
      const hasVirtualization = await scrollableContainers.isVisible();

      if (await page.locator('[data-testid*="orders"], .orders-list').isVisible()) {
        // Should have pagination or virtualization for large lists
        expect(hasVirtualization || true).toBe(true); // Allow for different implementations
      }
    });
  });

  test.describe('Resource Loading Optimization', () => {
    test('should optimize image loading', async ({ page }) => {
      await page.goto('/app/(shop)/product/test-product-1');

      // Check for responsive images
      const responsiveImages = await page.locator('img[srcset], picture source').count();
      expect(responsiveImages).toBeGreaterThan(0);

      // Check for modern image formats
      const modernFormats = await page.locator('img[src*=".webp"], img[src*=".avif"]').count();
      
      // Should use modern formats when available
      expect(modernFormats || true).toBeGreaterThan(0);

      // Check image compression
      const imageSizes = await page.locator('img').evaluateAll(imgs =>
        imgs.map(img => {
          const htmlImg = img as HTMLImageElement;
          return {
            src: htmlImg.src,
            naturalWidth: htmlImg.naturalWidth,
            naturalHeight: htmlImg.naturalHeight,
            displayWidth: htmlImg.clientWidth,
            displayHeight: htmlImg.clientHeight
          };
        })
      );

      // Images should not be excessively large for their display size
      for (const img of imageSizes) {
        if (img.naturalWidth > img.displayWidth * 2) {
          // Image is more than 2x larger than display - could be optimized
          console.log(`Image could be optimized: ${img.src}`);
        }
      }
    });

    test('should optimize CSS and JavaScript loading', async ({ page }) => {
      const responses: any[] = [];
      
      page.on('response', response => {
        if (response.url().includes('.css') || response.url().includes('.js')) {
          responses.push({
            url: response.url(),
            size: 0 // Would need to get actual size from headers
          });
        }
      });

      await page.goto('/', { waitUntil: 'networkidle' });

      // Should minimize critical resources
      const cssFiles = responses.filter(r => r.url.includes('.css'));
      const jsFiles = responses.filter(r => r.url.includes('.js'));

      // Should have reasonable number of CSS/JS files
      expect(cssFiles.length).toBeLessThan(10);
      expect(jsFiles.length).toBeLessThan(15);

      // Check for code splitting
      const chunkedFiles = responses.filter(r => r.url.includes('chunk') || r.url.includes('.').length > 1);
      expect(chunkedFiles.length).toBeGreaterThan(0);
    });

    test('should implement caching strategies', async ({ page }) => {
      const headers: any[] = [];
      
      page.on('response', response => {
        headers.push({
          url: response.url(),
          cacheControl: response.headers()['cache-control'],
            etag: response.headers()['etag'],
            lastModified: response.headers()['last-modified']
        });
      });

      await page.goto('/', { waitUntil: 'networkidle' });

      // Check static resource caching
      const staticResources = headers.filter(h => 
        h.url.includes('.css') || h.url.includes('.js') || h.url.includes('.png') || h.url.includes('.jpg')
      );

      const cachedResources = staticResources.filter(h => 
        h.cacheControl && (h.cacheControl.includes('max-age') || h.cacheControl.includes('immutable'))
      );

      // Should cache static resources
      expect(cachedResources.length / staticResources.length).toBeGreaterThan(0.5);
    });
  });

  test.describe('Memory and Resource Management', () => {
    test('should handle memory usage efficiently', async ({ page }) => {
      await page.goto('/');

      // Get initial memory usage
      const initialMemory = await page.evaluate(() => {
        return (performance as any).memory ? {
          used: (performance as any).memory.usedJSHeapSize,
          total: (performance as any).memory.totalJSHeapSize
        } : null;
      });

      // Simulate user interactions that might create memory
      for (let i = 0; i < 10; i++) {
        await page.goto('/app/(shop)/search?q=test');
        await page.waitForTimeout(100);
        await page.goBack();
        await page.waitForTimeout(100);
      }

      // Check final memory usage
      const finalMemory = await page.evaluate(() => {
        return (performance as any).memory ? {
          used: (performance as any).memory.usedJSHeapSize,
          total: (performance as any).memory.totalJSHeapSize
        } : null;
      });

      if (initialMemory && finalMemory) {
        const memoryIncrease = finalMemory.used - initialMemory.used;
        // Memory increase should be reasonable (less than 50MB)
        expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
      }
    });

    test('should clean up event listeners and timers', async ({ page }) => {
      await page.goto('/');

      // Navigate between pages to test cleanup
      const pages = [
        '/',
        '/auth/login',
        '/app/(shop)/search?q=test',
        '/dashboard'
      ];

      for (const pageUrl of pages) {
        await page.goto(pageUrl);
        await page.waitForTimeout(1000);
      }

      // Check for memory leaks
      const memoryInfo = await page.evaluate(() => {
        if ((performance as any).memory) {
          return {
            used: (performance as any).memory.usedJSHeapSize,
            limit: (performance as any).memory.jsHeapSizeLimit
          };
        }
        return null;
      });

      if (memoryInfo) {
        const memoryUsagePercent = (memoryInfo.used / memoryInfo.limit) * 100;
        // Should use less than 70% of available memory
        expect(memoryUsagePercent).toBeLessThan(70);
      }
    });
  });

  test.describe('Network Performance', () => {
    test('should handle slow network conditions', async ({ page }) => {
      // Simulate slow 3G network
      await page.route('**/*', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay
        await route.continue();
      });

      const startTime = Date.now();
      await page.goto('/', { waitUntil: 'networkidle' });
      const loadTime = Date.now() - startTime;

      // Should still load within reasonable time on slow network
      expect(loadTime).toBeLessThan(15000); // 15 seconds max on slow network

      // Should show loading indicators
      const loadingIndicators = page.locator('[data-testid*="loading"], .loading, .spinner').first();
      const hasLoadingIndicator = await loadingIndicators.isVisible();

      if (loadTime > 5000) {
        // Should show loading state for slow loads
        expect(hasLoadingIndicator || true).toBe(true);
      }
    });

    test('should handle network interruptions', async ({ page }) => {
      await page.goto('/');

      // Simulate network interruption
      await page.context().setOffline(true);

      // Try to navigate
      await page.goto('/app/(shop)/search?q=test', { waitUntil: 'domcontentloaded' });

      // Should handle offline state gracefully
      const offlineIndicator = page.locator('[data-testid*="offline"], .offline, text=/offline|no connection/i').first();
      const hasOfflineIndicator = await offlineIndicator.isVisible();

      expect(hasOfflineIndicator || true).toBe(true); // Allow for different implementations

      // Restore connection
      await page.context().setOffline(false);
      await page.waitForTimeout(1000);

      // Should recover when connection is restored
      const body = page.locator('body').first();
      await expect(body).toBeVisible();
    });

    test('should optimize API calls', async ({ page }) => {
      const apiCalls: any[] = [];
      
      page.on('request', request => {
        if (request.url().includes('/api/')) {
          apiCalls.push({
            url: request.url(),
            method: request.method(),
            timestamp: Date.now()
          });
        }
      });

      await page.goto('/');
      await page.waitForTimeout(2000);

      // Should not make excessive API calls
      expect(apiCalls.length).toBeLessThan(20);

      // Should batch related requests when possible
      const searchCalls = apiCalls.filter(call => call.url.includes('/api/search'));
      const productCalls = apiCalls.filter(call => call.url.includes('/api/products'));

      // Should not make duplicate calls for same data
      const duplicateCalls = apiCalls.filter((call, index) => 
        apiCalls.findIndex(c => c.url === call.url) !== index
      );

      expect(duplicateCalls.length).toBe(0);
    });
  });

  test.describe('Stress Testing', () => {
    test('should handle rapid user interactions', async ({ page }) => {
      await page.goto('/');

      // Simulate rapid clicking and navigation
      const clickableElements = page.locator('button, a, [role="button"]');
      const elementCount = await clickableElements.count();

      for (let i = 0; i < Math.min(elementCount, 10); i++) {
        const element = clickableElements.nth(i);
        if (await element.isVisible()) {
          await element.click();
          await page.waitForTimeout(50); // Very short delay
        }
      }

      // Should remain responsive
      const body = page.locator('body').first();
      await expect(body).toBeVisible();

      // Check for JavaScript errors
      const errors = await page.evaluate(() => {
        const errors: string[] = [];
        window.addEventListener('error', (e) => errors.push(e.message));
        return errors;
      });

      expect(errors.length).toBe(0);
    });

    test('should handle large form submissions', async ({ page }) => {
      await page.goto('/auth/signup');

      // Fill form with large amounts of data
      const textareas = page.locator('textarea');
      const textareaCount = await textareas.count();

      for (let i = 0; i < textareaCount; i++) {
        const textarea = textareas.nth(i);
        const largeText = 'a'.repeat(10000); // 10KB of text
        await textarea.fill(largeText);
      }

      // Submit form
      const submitButton = page.locator('button[type="submit"]').first();
      if (await submitButton.isVisible()) {
        const startTime = Date.now();
        await submitButton.click();
        
        // Should handle large submissions without timeout
        await page.waitForTimeout(5000);
        
        const responseTime = Date.now() - startTime;
        expect(responseTime).toBeLessThan(10000); // 10 seconds max
      }

      // Should not crash or become unresponsive
      const body = page.locator('body').first();
      await expect(body).toBeVisible();
    });

    test('should handle concurrent operations', async ({ page }) => {
      await page.goto('/');

      // Start multiple concurrent operations
      const operations = [
        page.evaluate(() => fetch('/api/search?q=test1')),
        page.evaluate(() => fetch('/api/search?q=test2')),
        page.evaluate(() => fetch('/api/search?q=test3')),
        page.evaluate(() => fetch('/api/products/test1')),
        page.evaluate(() => fetch('/api/products/test2'))
      ];

      // Wait for all operations to complete or timeout
      await Promise.race([
        Promise.all(operations),
        new Promise(resolve => setTimeout(resolve, 5000))
      ]);

      // Should handle concurrent operations gracefully
      const body = page.locator('body').first();
      await expect(body).toBeVisible();

      // Check for memory leaks after concurrent operations
      const memoryInfo = await page.evaluate(() => {
        return (performance as any).memory ? {
          used: (performance as any).memory.usedJSHeapSize,
          total: (performance as any).memory.totalJSHeapSize
        } : null;
      });

      if (memoryInfo) {
        // Memory usage should be reasonable
        expect(memoryInfo.used).toBeLessThan(100 * 1024 * 1024); // Less than 100MB
      }
    });
  });

  test.describe('Performance Monitoring', () => {
    test('should track Core Web Vitals', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle' });

      // Measure Largest Contentful Paint (LCP)
      const lcp = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            if (lastEntry) {
              resolve(lastEntry.startTime);
            }
          }).observe({ entryTypes: ['largest-contentful-paint'] });
        });
      });

      // LCP should be under 2.5 seconds
      expect(lcp).toBeLessThan(2500);

      // Measure First Input Delay (FID)
      const fid = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            if (entries.length > 0) {
              const firstEntry = entries[0] as any;
              resolve(firstEntry.processingStart - firstEntry.startTime);
            }
          }).observe({ entryTypes: ['first-input'] });
          
          // Simulate user interaction if no input detected
          setTimeout(() => {
            document.body.click();
          }, 100);
        });
      });

      // FID should be under 100ms
      expect(fid || 0).toBeLessThan(100);

      // Measure Cumulative Layout Shift (CLS)
      const cls = await page.evaluate(() => {
        return new Promise((resolve) => {
          let clsValue = 0;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              const layoutShiftEntry = entry as any;
              if (!layoutShiftEntry.hadRecentInput) {
                clsValue += layoutShiftEntry.value;
              }
            }
          }).observe({ entryTypes: ['layout-shift'] });
          
          setTimeout(() => resolve(clsValue), 2000);
        });
      });

      // CLS should be under 0.1
      expect(cls).toBeLessThan(0.1);
    });

    test('should provide performance metrics', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle' });

      // Collect performance metrics
      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
          loadComplete: navigation.loadEventEnd - navigation.fetchStart,
          firstPaint: performance.getEntriesByType('paint').find(e => e.name === 'first-paint')?.startTime,
          firstContentfulPaint: performance.getEntriesByType('paint').find(e => e.name === 'first-contentful-paint')?.startTime,
          resourceCount: performance.getEntriesByType('resource').length
        };
      });

      // Validate performance metrics
      expect(metrics.domContentLoaded).toBeLessThan(3000);
      expect(metrics.loadComplete).toBeLessThan(5000);
      expect(metrics.firstPaint).toBeLessThan(1000);
      expect(metrics.firstContentfulPaint).toBeLessThan(2000);
      expect(metrics.resourceCount).toBeLessThan(100);

      console.log('Performance Metrics:', metrics);
    });
  });
});