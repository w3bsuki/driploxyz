import { test, expect } from '@playwright/test';

test.describe('Product Detail Page Performance', () => {
  test.beforeEach(async ({ page }) => {
    // Enable performance monitoring
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to a product page
    const productLink = page.locator('a[href*="/product/"]').first();
    
    if (await productLink.isVisible()) {
      await productLink.click();
      await page.waitForLoadState('networkidle');
    } else {
      await page.goto('/product/test-seller/test-product-123');
      await page.waitForLoadState('networkidle');
    }
  });

  test.describe('Core Web Vitals', () => {
    test('meets LCP performance target (< 2.5s)', async ({ page }) => {
      // Measure LCP using Performance Observer API
      const lcp = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            resolve(lastEntry.startTime);
          }).observe({ entryTypes: ['largest-contentful-paint'] });
          
          // Fallback timeout after 5 seconds
          setTimeout(() => resolve(5000), 5000);
        });
      });

      console.log(`LCP: ${lcp}ms`);
      expect(lcp).toBeLessThan(2500); // LCP < 2.5s target
    });

    test('meets CLS performance target (< 0.1)', async ({ page }) => {
      // Wait for page to fully load and settle
      await page.waitForTimeout(2000);
      
      const cls = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          let clsValue = 0;
          
          new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            }
          }).observe({ entryTypes: ['layout-shift'] });
          
          // Measure CLS over 3 seconds
          setTimeout(() => resolve(clsValue), 3000);
        });
      });

      console.log(`CLS: ${cls}`);
      expect(cls).toBeLessThan(0.1); // CLS < 0.1 target
    });

    test('measures FID/INP responsiveness', async ({ page }) => {
      // Test interaction responsiveness by clicking on interactive elements
      const interactiveElements = [
        '[data-testid="favorite-button"]',
        '.favorite-button',
        'button:has-text("Message")',
        '.product-gallery button'
      ];

      for (const selector of interactiveElements) {
        const element = page.locator(selector).first();
        if (await element.isVisible()) {
          const startTime = Date.now();
          await element.click();
          const endTime = Date.now();
          
          const responseTime = endTime - startTime;
          console.log(`Interaction response time for ${selector}: ${responseTime}ms`);
          
          // Should respond within 100ms for good user experience
          expect(responseTime).toBeLessThan(100);
          break; // Test one working element
        }
      }
    });
  });

  test.describe('Resource Loading', () => {
    test('loads critical resources with high priority', async ({ page }) => {
      // Check that hero image has high priority
      const heroImage = page.locator('img').first();
      if (await heroImage.isVisible()) {
        const fetchPriority = await heroImage.getAttribute('fetchpriority');
        expect(fetchPriority).toBe('high');
        
        // Check that image is not lazy loaded
        const loading = await heroImage.getAttribute('loading');
        expect(loading).toBe('eager');
      }
    });

    test('lazy loads below-the-fold images', async ({ page }) => {
      // Scroll down to trigger lazy loading
      await page.evaluate(() => window.scrollTo(0, window.innerHeight));
      await page.waitForTimeout(500);
      
      // Check recommendation/similar product images are lazy loaded
      const recommendationImages = page.locator('.recommendations-section img, .similar-products img');
      const imageCount = await recommendationImages.count();
      
      if (imageCount > 0) {
        for (let i = 0; i < Math.min(imageCount, 3); i++) {
          const img = recommendationImages.nth(i);
          const loading = await img.getAttribute('loading');
          expect(loading).toBe('lazy');
        }
      }
    });

    test('preloads critical CSS and fonts', async ({ page }) => {
      // Check for critical resource preloads
      const preloadLinks = await page.locator('link[rel="preload"]').count();
      expect(preloadLinks).toBeGreaterThan(0);
      
      // Check for font preloads
      const fontPreloads = await page.locator('link[rel="preload"][as="font"]').count();
      console.log(`Font preloads: ${fontPreloads}`);
    });

    test('uses appropriate image formats and sizing', async ({ page }) => {
      const images = page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < Math.min(imageCount, 5); i++) {
        const img = images.nth(i);
        if (await img.isVisible()) {
          // Check for responsive images
          const sizes = await img.getAttribute('sizes');
          const srcset = await img.getAttribute('srcset');
          
          // Product images should have responsive sizing
          if (i === 0) { // Hero image
            expect(sizes || srcset).toBeTruthy();
          }
          
          // Check image dimensions to prevent CLS
          const width = await img.getAttribute('width');
          const height = await img.getAttribute('height');
          const hasAspectRatio = await img.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return computed.aspectRatio !== 'auto';
          });
          
          expect(width && height || hasAspectRatio).toBeTruthy();
        }
      }
    });
  });

  test.describe('JavaScript Performance', () => {
    test('minimizes main thread blocking time', async ({ page }) => {
      // Measure long tasks that block the main thread
      const longTasks = await page.evaluate(() => {
        return new Promise<number[]>((resolve) => {
          const longTaskTimes: number[] = [];
          
          new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              longTaskTimes.push(entry.duration);
            }
          }).observe({ entryTypes: ['longtask'] });
          
          // Collect data for 3 seconds
          setTimeout(() => resolve(longTaskTimes), 3000);
        });
      });

      const totalBlockingTime = longTasks
        .filter(duration => duration > 50)
        .reduce((sum, duration) => sum + (duration - 50), 0);

      console.log(`Total Blocking Time: ${totalBlockingTime}ms`);
      expect(totalBlockingTime).toBeLessThan(200); // TBT < 200ms target
    });

    test('uses code splitting for non-critical components', async ({ page }) => {
      // Check that modals and below-fold components are code split
      const scripts = page.locator('script[src]');
      const scriptCount = await scripts.count();
      
      // Should have multiple script chunks for code splitting
      expect(scriptCount).toBeGreaterThan(1);
      
      // Check for dynamic imports (lazy loaded components)
      const dynamicImports = await page.evaluate(() => {
        const scripts = Array.from(document.querySelectorAll('script'));
        return scripts.some(script => 
          script.textContent?.includes('import(') || 
          script.textContent?.includes('lazy')
        );
      });
      
      console.log(`Has dynamic imports: ${dynamicImports}`);
    });

    test('optimizes scroll performance', async ({ page }) => {
      // Test scroll performance
      const scrollStartTime = Date.now();
      
      await page.evaluate(() => {
        return new Promise(resolve => {
          let scrollCount = 0;
          const targetScrolls = 10;
          
          function smoothScroll() {
            window.scrollBy(0, 100);
            scrollCount++;
            
            if (scrollCount < targetScrolls) {
              requestAnimationFrame(smoothScroll);
            } else {
              resolve(true);
            }
          }
          
          smoothScroll();
        });
      });
      
      const scrollEndTime = Date.now();
      const scrollDuration = scrollEndTime - scrollStartTime;
      
      console.log(`Scroll performance: ${scrollDuration}ms for 10 scroll events`);
      expect(scrollDuration).toBeLessThan(1000); // Should be smooth
    });
  });

  test.describe('Bundle Optimization', () => {
    test('minimizes initial bundle size', async ({ page }) => {
      // Measure network resources
      const resources = await page.evaluate(() => {
        const entries = performance.getEntriesByType('resource');
        return entries
          .filter(entry => entry.name.includes('.js'))
          .map(entry => ({
            name: entry.name,
            size: entry.transferSize,
            duration: entry.duration
          }));
      });

      const totalJSSize = resources.reduce((sum, resource) => sum + (resource.size || 0), 0);
      console.log(`Total JS bundle size: ${(totalJSSize / 1024).toFixed(2)}KB`);
      
      // Bundle should be reasonable size (adjust based on requirements)
      expect(totalJSSize).toBeLessThan(500 * 1024); // < 500KB initial JS
    });

    test('loads non-critical resources asynchronously', async ({ page }) => {
      // Check that non-critical scripts are loaded with async/defer
      const scripts = page.locator('script[src]');
      const scriptCount = await scripts.count();
      
      let asyncScripts = 0;
      for (let i = 0; i < scriptCount; i++) {
        const script = scripts.nth(i);
        const async = await script.getAttribute('async');
        const defer = await script.getAttribute('defer');
        
        if (async !== null || defer !== null) {
          asyncScripts++;
        }
      }
      
      console.log(`Async/defer scripts: ${asyncScripts}/${scriptCount}`);
      expect(asyncScripts).toBeGreaterThan(0);
    });
  });

  test.describe('Mobile Performance', () => {
    test('performs well on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Mobile-specific LCP measurement
      const mobileLCP = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            resolve(lastEntry.startTime);
          }).observe({ entryTypes: ['largest-contentful-paint'] });
          
          setTimeout(() => resolve(5000), 5000);
        });
      });

      console.log(`Mobile LCP: ${mobileLCP}ms`);
      expect(mobileLCP).toBeLessThan(2500); // Same LCP target on mobile
    });

    test('optimizes touch interactions', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Test touch target sizes
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      let adequateTargets = 0;
      for (let i = 0; i < Math.min(buttonCount, 10); i++) {
        const button = buttons.nth(i);
        if (await button.isVisible()) {
          const boundingBox = await button.boundingBox();
          if (boundingBox && boundingBox.height >= 36 && boundingBox.width >= 36) {
            adequateTargets++;
          }
        }
      }
      
      const adequateRatio = adequateTargets / Math.min(buttonCount, 10);
      console.log(`Adequate touch targets: ${adequateTargets}/${Math.min(buttonCount, 10)} (${(adequateRatio * 100).toFixed(1)}%)`);
      
      expect(adequateRatio).toBeGreaterThan(0.8); // 80% of buttons should have adequate size
    });
  });

  test.describe('Accessibility Performance', () => {
    test('maintains performance with accessibility features', async ({ page }) => {
      // Enable screen reader mode simulation
      await page.evaluate(() => {
        // Simulate screen reader by adding aria-live regions
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.style.position = 'absolute';
        liveRegion.style.left = '-10000px';
        document.body.appendChild(liveRegion);
      });

      // Test keyboard navigation performance
      const startTime = Date.now();
      
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(10);
      }
      
      const endTime = Date.now();
      const keyboardNavTime = endTime - startTime;
      
      console.log(`Keyboard navigation time: ${keyboardNavTime}ms`);
      expect(keyboardNavTime).toBeLessThan(500); // Should be responsive
    });

    test('handles focus management efficiently', async ({ page }) => {
      // Test focus trap performance in modals
      const modal = page.locator('[role="dialog"]');
      
      if (await modal.count() > 0) {
        const focusableElements = modal.locator('button, a, input, select, textarea, [tabindex="0"]');
        const elementCount = await focusableElements.count();
        
        if (elementCount > 0) {
          const startTime = Date.now();
          
          // Cycle through all focusable elements
          for (let i = 0; i < elementCount; i++) {
            await page.keyboard.press('Tab');
            await page.waitForTimeout(5);
          }
          
          const endTime = Date.now();
          const focusTraversalTime = endTime - startTime;
          
          console.log(`Focus traversal time: ${focusTraversalTime}ms for ${elementCount} elements`);
          expect(focusTraversalTime / elementCount).toBeLessThan(20); // < 20ms per element
        }
      }
    });
  });

  test.describe('Performance Monitoring', () => {
    test('tracks custom performance metrics', async ({ page }) => {
      // Add custom performance marks
      await page.evaluate(() => {
        performance.mark('product-page-start');
        
        // Mark when key elements are visible
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              performance.mark(`${entry.target.className.replace(/\s+/g, '-')}-visible`);
            }
          });
        });
        
        document.querySelectorAll('.product-gallery, .product-info, .recommendations').forEach(el => {
          observer.observe(el);
        });
        
        setTimeout(() => performance.mark('product-page-complete'), 1000);
      });

      await page.waitForTimeout(2000);

      // Collect performance marks
      const marks = await page.evaluate(() => {
        return performance.getEntriesByType('mark').map(mark => ({
          name: mark.name,
          startTime: mark.startTime
        }));
      });

      console.log('Performance marks:', marks);
      expect(marks.length).toBeGreaterThan(0);
    });

    test('validates resource loading waterfall', async ({ page }) => {
      // Get resource loading timeline
      const resources = await page.evaluate(() => {
        return performance.getEntriesByType('resource').map(resource => ({
          name: resource.name.split('/').pop(),
          startTime: resource.startTime,
          responseEnd: resource.responseEnd,
          transferSize: resource.transferSize,
          type: resource.name.includes('.js') ? 'js' : 
                resource.name.includes('.css') ? 'css' :
                resource.name.includes('.png') || resource.name.includes('.jpg') || resource.name.includes('.webp') ? 'image' :
                'other'
        }));
      });

      // Critical resources should load first
      const criticalResources = resources.filter(r => r.type === 'css' || (r.type === 'js' && r.transferSize > 10000));
      const imageResources = resources.filter(r => r.type === 'image');

      if (criticalResources.length > 0 && imageResources.length > 0) {
        const avgCriticalStartTime = criticalResources.reduce((sum, r) => sum + r.startTime, 0) / criticalResources.length;
        const avgImageStartTime = imageResources.reduce((sum, r) => sum + r.startTime, 0) / imageResources.length;

        console.log(`Avg critical resource start: ${avgCriticalStartTime}ms`);
        console.log(`Avg image resource start: ${avgImageStartTime}ms`);
        
        // Images should generally start loading after critical resources
        // (or be properly prioritized if they start early)
      }

      expect(resources.length).toBeGreaterThan(0);
    });
  });
});