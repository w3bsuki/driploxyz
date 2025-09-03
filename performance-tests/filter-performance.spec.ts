/**
 * Filter Performance Test Suite
 * Tests the performance of the new filter system according to CLAUDE.md requirements
 * Target: Real-time filtering ≤ 100ms, modal interactions ≤ 300ms
 */

import { test, expect, type Page } from '@playwright/test';
import { performance } from 'perf_hooks';

// Performance budgets from CLAUDE.md and PERFORMANCE_VALIDATION_STRATEGY.md
const PERFORMANCE_BUDGETS = {
  filterUpdateTime: 100,      // ms - real-time filtering requirement
  modalAnimationTime: 300,    // ms - modal opening
  bottomSheetTransition: 250, // ms - mobile bottom sheet
  memoryHeapIncrease: 2,      // MB - memory usage limit
  gcPressure: 10              // ms - garbage collection impact
};

test.describe('Filter Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to search page with filter system
    await page.goto('/search');
    await page.waitForLoadState('networkidle');
  });

  test('Filter modal opens within performance budget', async ({ page }) => {
    // Measure modal opening performance
    const startTime = await page.evaluate(() => performance.now());
    
    await page.click('[data-testid="filter-trigger"]');
    await page.waitForSelector('[data-testid="filter-modal"]', { 
      state: 'visible',
      timeout: 5000 
    });
    
    const endTime = await page.evaluate(() => performance.now());
    const duration = endTime - startTime;
    
    console.log(`Modal opening time: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(PERFORMANCE_BUDGETS.modalAnimationTime);
  });

  test('Real-time brand filter updates within budget', async ({ page }) => {
    // Open filter modal
    await page.click('[data-testid="filter-trigger"]');
    await page.waitForSelector('[data-testid="brand-selector"]');
    
    // Measure brand selection performance
    const startTime = await page.evaluate(() => performance.now());
    
    await page.click('[data-testid="brand-option-nike"]');
    
    // Wait for URL update (indicates filter applied)
    await page.waitForFunction(() => {
      return new URLSearchParams(window.location.search).has('brand');
    });
    
    const endTime = await page.evaluate(() => performance.now());
    const duration = endTime - startTime;
    
    console.log(`Brand filter update time: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(PERFORMANCE_BUDGETS.filterUpdateTime);
  });

  test('Category filter selection performance', async ({ page }) => {
    await page.click('[data-testid="filter-trigger"]');
    await page.waitForSelector('[data-testid="category-selector"]');
    
    const startTime = await page.evaluate(() => performance.now());
    
    // Select a category
    await page.click('[data-testid="category-option-sneakers"]');
    
    // Wait for filter application
    await page.waitForFunction(() => {
      return new URLSearchParams(window.location.search).has('category');
    });
    
    const endTime = await page.evaluate(() => performance.now());
    const duration = endTime - startTime;
    
    console.log(`Category filter update time: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(PERFORMANCE_BUDGETS.filterUpdateTime);
  });

  test('Price range filter performance', async ({ page }) => {
    await page.click('[data-testid="filter-trigger"]');
    await page.waitForSelector('[data-testid="price-range-selector"]');
    
    const startTime = await page.evaluate(() => performance.now());
    
    // Set price range
    await page.fill('[data-testid="price-min-input"]', '10');
    await page.fill('[data-testid="price-max-input"]', '100');
    
    // Wait for debounced update
    await page.waitForTimeout(350); // Account for debounce
    await page.waitForFunction(() => {
      const url = new URLSearchParams(window.location.search);
      return url.has('price_min') && url.has('price_max');
    });
    
    const endTime = await page.evaluate(() => performance.now());
    const duration = endTime - startTime - 350; // Subtract debounce time
    
    console.log(`Price range filter update time: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(PERFORMANCE_BUDGETS.filterUpdateTime);
  });

  test('Mobile bottom sheet performance', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/search');
    await page.waitForLoadState('networkidle');
    
    const startTime = await page.evaluate(() => performance.now());
    
    await page.click('[data-testid="mobile-filter-trigger"]');
    await page.waitForSelector('[data-testid="filter-bottom-sheet"]', { 
      state: 'visible' 
    });
    
    const endTime = await page.evaluate(() => performance.now());
    const duration = endTime - startTime;
    
    console.log(`Bottom sheet opening time: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(PERFORMANCE_BUDGETS.bottomSheetTransition);
  });

  test('Filter clearing performance', async ({ page }) => {
    // Apply some filters first
    await page.goto('/search?brand=nike&category=sneakers&price_min=10&price_max=100');
    await page.waitForLoadState('networkidle');
    
    const startTime = await page.evaluate(() => performance.now());
    
    await page.click('[data-testid="clear-all-filters"]');
    
    // Wait for URL to clear
    await page.waitForFunction(() => {
      const url = new URLSearchParams(window.location.search);
      return !url.has('brand') && !url.has('category') && !url.has('price_min');
    });
    
    const endTime = await page.evaluate(() => performance.now());
    const duration = endTime - startTime;
    
    console.log(`Filter clearing time: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(50); // Very fast clearing requirement
  });

  test('Memory usage during filter interactions', async ({ page }) => {
    // Get baseline memory
    const initialMetrics = await page.evaluate(() => {
      return (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize
      } : null;
    });
    
    if (!initialMetrics) {
      test.skip('Memory API not available');
      return;
    }
    
    // Perform multiple filter interactions
    await page.click('[data-testid="filter-trigger"]');
    
    for (let i = 0; i < 5; i++) {
      await page.click('[data-testid="brand-option-nike"]');
      await page.waitForTimeout(50);
      await page.click('[data-testid="brand-option-adidas"]');
      await page.waitForTimeout(50);
      await page.click('[data-testid="clear-all-filters"]');
      await page.waitForTimeout(100);
    }
    
    // Measure memory after interactions
    const finalMetrics = await page.evaluate(() => {
      return (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize
      } : null;
    });
    
    if (finalMetrics) {
      const heapIncrease = (finalMetrics.usedJSHeapSize - initialMetrics.usedJSHeapSize) / (1024 * 1024);
      console.log(`Memory heap increase: ${heapIncrease.toFixed(2)}MB`);
      expect(heapIncrease).toBeLessThan(PERFORMANCE_BUDGETS.memoryHeapIncrease);
    }
  });

  test('Filter accessibility performance', async ({ page }) => {
    // Test keyboard navigation performance
    await page.click('[data-testid="filter-trigger"]');
    await page.waitForSelector('[data-testid="filter-modal"]');
    
    const startTime = await page.evaluate(() => performance.now());
    
    // Navigate through filters with keyboard
    await page.press('[data-testid="brand-selector"]', 'Tab');
    await page.press('body', 'Tab');
    await page.press('body', 'Tab');
    await page.press('body', 'Enter'); // Select an option
    
    const endTime = await page.evaluate(() => performance.now());
    const duration = endTime - startTime;
    
    console.log(`Keyboard navigation time: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(100); // Keyboard interactions should be fast
  });

  test('Filter animation performance', async ({ page }) => {
    // Test modal animation smoothness
    await page.addInitScript(() => {
      (window as any).animationFrames = [];
      
      const originalRAF = requestAnimationFrame;
      requestAnimationFrame = (callback) => {
        return originalRAF(() => {
          const now = performance.now();
          (window as any).animationFrames.push(now);
          callback(now);
        });
      };
    });
    
    await page.click('[data-testid="filter-trigger"]');
    await page.waitForSelector('[data-testid="filter-modal"]', { state: 'visible' });
    
    // Allow animation to complete
    await page.waitForTimeout(500);
    
    const animationData = await page.evaluate(() => {
      const frames = (window as any).animationFrames || [];
      const frameTimes = [];
      
      for (let i = 1; i < frames.length; i++) {
        frameTimes.push(frames[i] - frames[i - 1]);
      }
      
      return {
        totalFrames: frames.length,
        averageFrameTime: frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length,
        maxFrameTime: Math.max(...frameTimes)
      };
    });
    
    console.log(`Animation performance:`, animationData);
    
    // Check for 60fps performance (16.67ms per frame)
    expect(animationData.averageFrameTime).toBeLessThan(17);
    expect(animationData.maxFrameTime).toBeLessThan(50); // Allow some variance
  });

  test('Bundle size impact analysis', async ({ page }) => {
    // Navigate to a page without filters
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const baselineResources = await page.evaluate(() => {
      return performance.getEntriesByType('resource')
        .filter(entry => entry.name.includes('.js'))
        .reduce((total, entry) => total + (entry as any).transferSize, 0);
    });
    
    // Navigate to filter page
    await page.goto('/search');
    await page.waitForLoadState('networkidle');
    
    const filterPageResources = await page.evaluate(() => {
      return performance.getEntriesByType('resource')
        .filter(entry => entry.name.includes('.js'))
        .reduce((total, entry) => total + (entry as any).transferSize, 0);
    });
    
    const additionalSize = (filterPageResources - baselineResources) / 1024; // KB
    console.log(`Additional JS bundle size for filters: ${additionalSize.toFixed(2)}KB`);
    
    // Check against budget (50KB from strategy doc)
    expect(additionalSize).toBeLessThan(50);
  });
});

test.describe('Filter Performance Stress Tests', () => {
  test('Rapid filter changes performance', async ({ page }) => {
    await page.goto('/search');
    await page.click('[data-testid="filter-trigger"]');
    
    const startTime = await page.evaluate(() => performance.now());
    
    // Rapidly change filters
    for (let i = 0; i < 10; i++) {
      await page.click('[data-testid="brand-option-nike"]');
      await page.click('[data-testid="brand-option-adidas"]');
      await page.click('[data-testid="category-option-sneakers"]');
      await page.click('[data-testid="clear-all-filters"]');
    }
    
    const endTime = await page.evaluate(() => performance.now());
    const averageTime = (endTime - startTime) / 40; // 40 interactions total
    
    console.log(`Average rapid filter change time: ${averageTime.toFixed(2)}ms`);
    expect(averageTime).toBeLessThan(PERFORMANCE_BUDGETS.filterUpdateTime);
  });
});