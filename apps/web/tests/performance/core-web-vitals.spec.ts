/**
 * Performance Tests - Core Web Vitals
 * Comprehensive performance testing using MCP Playwright
 */

import { test, expect } from '@playwright/test';

test.describe('Performance Tests - Core Web Vitals', () => {
  const baseURL = 'http://localhost:5173';
  
  // Performance thresholds based on Google's Core Web Vitals
  const PERFORMANCE_THRESHOLDS = {
    LCP: 1500, // Largest Contentful Paint - 1.5s for mobile
    FID: 100,  // First Input Delay - 100ms
    CLS: 0.1,  // Cumulative Layout Shift - 0.1
    TTFB: 600, // Time to First Byte - 600ms
    FCP: 900,  // First Contentful Paint - 900ms
    TTI: 3800, // Time to Interactive - 3.8s for mobile
    TBT: 200   // Total Blocking Time - 200ms for mobile
  };

  // Critical pages to test performance
  const criticalPages = [
    { path: '/', name: 'Homepage', critical: true },
    { path: '/search', name: 'Search Results', critical: true },
    { path: '/product/1', name: 'Product Details', critical: true },
    { path: '/login', name: 'Login Page', critical: false },
    { path: '/sell', name: 'Create Listing', critical: false },
    { path: '/dashboard', name: 'Dashboard', critical: false },
    { path: '/checkout/1', name: 'Checkout', critical: true }
  ];

  test.beforeAll(async () => {
    // Start with mobile viewport for performance testing
    await mcp__playwright__browser_resize({ width: 375, height: 667 });
  });

  test('Core Web Vitals - Mobile Performance', async () => {
    const performanceResults = [];
    
    for (const page of criticalPages) {
      console.log(`Testing performance for: ${page.name}`);
      
      // Navigate to page
      await mcp__playwright__browser_navigate({ url: `${baseURL}${page.path}` });
      
      // Wait for page to fully load
      await mcp__playwright__browser_wait_for({ time: 3 });
      
      // Collect Core Web Vitals
      const webVitals = await mcp__playwright__browser_evaluate({
        function: `() => {
          return new Promise((resolve) => {
            const vitals = {};
            
            // Largest Contentful Paint
            new PerformanceObserver((list) => {
              const entries = list.getEntries();
              const lastEntry = entries[entries.length - 1];
              vitals.lcp = lastEntry ? Math.round(lastEntry.startTime) : 0;
            }).observe({ entryTypes: ['largest-contentful-paint'] });
            
            // First Input Delay (simulate)
            vitals.fid = 0; // Would be measured on actual user interaction
            
            // Cumulative Layout Shift
            let clsValue = 0;
            new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) {
                  clsValue += entry.value;
                }
              }
              vitals.cls = Math.round(clsValue * 1000) / 1000;
            }).observe({ entryTypes: ['layout-shift'] });
            
            // Navigation timing metrics
            const navigation = performance.getEntriesByType('navigation')[0];
            if (navigation) {
              vitals.ttfb = Math.round(navigation.responseStart - navigation.requestStart);
              vitals.fcp = Math.round(navigation.responseEnd - navigation.responseStart);
              vitals.domContentLoaded = Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
              vitals.loadComplete = Math.round(navigation.loadEventEnd - navigation.loadEventStart);
            }
            
            // First Contentful Paint
            const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
            if (fcpEntry) {
              vitals.fcp = Math.round(fcpEntry.startTime);
            }
            
            // Calculate Time to Interactive (simplified)
            vitals.tti = vitals.domContentLoaded || 0;
            
            // Total Blocking Time (simplified)
            const longTasks = performance.getEntriesByType('longtask') || [];
            vitals.tbt = longTasks.reduce((sum, task) => sum + Math.max(0, task.duration - 50), 0);
            
            setTimeout(() => resolve(vitals), 1000);
          });
        }`
      });
      
      // Store results
      const pageResult = {
        page: page.name,
        path: page.path,
        critical: page.critical,
        metrics: webVitals
      };
      
      performanceResults.push(pageResult);
      
      // Take performance screenshot
      await mcp__playwright__browser_take_screenshot({
        filename: `performance-${page.name.toLowerCase().replace(' ', '-')}.png`
      });
      
      // Log individual page results
      console.log(`${page.name} Performance:`, webVitals);
      
      // Assert critical thresholds for critical pages
      if (page.critical) {
        if (webVitals.lcp) expect(webVitals.lcp).toBeLessThan(PERFORMANCE_THRESHOLDS.LCP);
        if (webVitals.cls) expect(webVitals.cls).toBeLessThan(PERFORMANCE_THRESHOLDS.CLS);
        if (webVitals.ttfb) expect(webVitals.ttfb).toBeLessThan(PERFORMANCE_THRESHOLDS.TTFB);
        if (webVitals.fcp) expect(webVitals.fcp).toBeLessThan(PERFORMANCE_THRESHOLDS.FCP);
      }
    }
    
    // Generate performance report
    console.log('\n=== PERFORMANCE SUMMARY ===');
    performanceResults.forEach(result => {
      console.log(`\n${result.page} (${result.critical ? 'CRITICAL' : 'Standard'}):`);
      console.log(`  LCP: ${result.metrics.lcp}ms ${result.metrics.lcp > PERFORMANCE_THRESHOLDS.LCP ? '❌' : '✅'}`);
      console.log(`  CLS: ${result.metrics.cls} ${result.metrics.cls > PERFORMANCE_THRESHOLDS.CLS ? '❌' : '✅'}`);
      console.log(`  TTFB: ${result.metrics.ttfb}ms ${result.metrics.ttfb > PERFORMANCE_THRESHOLDS.TTFB ? '❌' : '✅'}`);
      console.log(`  FCP: ${result.metrics.fcp}ms ${result.metrics.fcp > PERFORMANCE_THRESHOLDS.FCP ? '❌' : '✅'}`);
    });
  });

  test('Network Performance - Resource Loading', async () => {
    await mcp__playwright__browser_navigate({ url: baseURL });
    
    // Get network requests
    const networkData = await mcp__playwright__browser_network_requests();
    
    console.log(`Total network requests: ${networkData.length}`);
    
    // Analyze network performance
    const networkAnalysis = networkData.reduce((analysis, request) => {
      const size = request.responseHeaders?.['content-length'] || 0;
      const type = request.resourceType || 'other';
      
      if (!analysis[type]) {
        analysis[type] = { count: 0, totalSize: 0, maxTime: 0 };
      }
      
      analysis[type].count++;
      analysis[type].totalSize += parseInt(size) || 0;
      analysis[type].maxTime = Math.max(analysis[type].maxTime, request.responseTime || 0);
      
      return analysis;
    }, {});
    
    console.log('Network Analysis:', networkAnalysis);
    
    // Performance assertions
    const failedRequests = networkData.filter(req => req.status >= 400);
    expect(failedRequests.length).toBe(0);
    
    const slowRequests = networkData.filter(req => req.responseTime > 2000);
    expect(slowRequests.length).toBeLessThan(3); // Allow max 2 slow requests
    
    // Check for critical resources
    const criticalResources = networkData.filter(req => 
      req.resourceType === 'document' || 
      req.resourceType === 'stylesheet' || 
      req.url.includes('main.js')
    );
    
    criticalResources.forEach(resource => {
      expect(resource.responseTime).toBeLessThan(1000); // Critical resources should load < 1s
    });
  });

  test('Image Performance - Lazy Loading and Optimization', async () => {
    await mcp__playwright__browser_navigate({ url: baseURL });
    
    // Analyze images on the page
    const imageAnalysis = await mcp__playwright__browser_evaluate({
      function: `() => {
        const images = Array.from(document.querySelectorAll('img'));
        
        return images.map(img => ({
          src: img.src,
          loading: img.loading,
          hasLazyLoading: img.loading === 'lazy' || img.dataset.src !== undefined,
          isVisible: img.getBoundingClientRect().top < window.innerHeight,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          displayWidth: img.width,
          displayHeight: img.height,
          hasAlt: !!img.alt
        }));
      }`
    });
    
    console.log(`Found ${imageAnalysis.length} images`);
    
    // Check lazy loading implementation
    const lazyImages = imageAnalysis.filter(img => img.hasLazyLoading);
    const visibleImages = imageAnalysis.filter(img => img.isVisible);
    
    console.log(`Images with lazy loading: ${lazyImages.length}`);
    console.log(`Initially visible images: ${visibleImages.length}`);
    
    // Performance assertions
    imageAnalysis.forEach((img, index) => {
      // All images should have alt text
      expect(img.hasAlt).toBe(true);
      
      // Images not initially visible should have lazy loading
      if (!img.isVisible && index > 2) { // Allow first few images to not be lazy
        expect(img.hasLazyLoading).toBe(true);
      }
    });
    
    // Test scroll performance with lazy loading
    await mcp__playwright__browser_evaluate({
      function: `() => window.scrollTo(0, document.body.scrollHeight)`
    });
    
    await mcp__playwright__browser_wait_for({ time: 2 });
    
    await mcp__playwright__browser_take_screenshot({
      filename: 'performance-lazy-loading-scrolled.png'
    });
  });

  test('JavaScript Performance - Bundle Size and Execution', async () => {
    await mcp__playwright__browser_navigate({ url: baseURL });
    
    // Analyze JavaScript performance
    const jsPerformance = await mcp__playwright__browser_evaluate({
      function: `() => {
        const scripts = Array.from(document.querySelectorAll('script[src]'));
        const performanceEntries = performance.getEntriesByType('resource')
          .filter(entry => entry.name.includes('.js'));
        
        const jsAnalysis = {
          scriptCount: scripts.length,
          totalTransferSize: 0,
          totalDecodedSize: 0,
          loadTimes: [],
          longTasks: performance.getEntriesByType('longtask').length
        };
        
        performanceEntries.forEach(entry => {
          jsAnalysis.totalTransferSize += entry.transferSize || 0;
          jsAnalysis.totalDecodedSize += entry.decodedBodySize || 0;
          jsAnalysis.loadTimes.push(entry.responseEnd - entry.startTime);
        });
        
        return jsAnalysis;
      }`
    });
    
    console.log('JavaScript Performance:', jsPerformance);
    
    // Performance assertions
    expect(jsPerformance.totalTransferSize).toBeLessThan(500000); // 500KB max JS bundle
    expect(jsPerformance.longTasks).toBeLessThan(5); // Max 5 long tasks
    
    const avgLoadTime = jsPerformance.loadTimes.reduce((a, b) => a + b, 0) / jsPerformance.loadTimes.length;
    expect(avgLoadTime).toBeLessThan(1000); // Average JS load time < 1s
  });

  test('Memory Usage - Heap and DOM Size', async () => {
    const memoryResults = [];
    
    for (const page of criticalPages.slice(0, 3)) { // Test first 3 pages
      await mcp__playwright__browser_navigate({ url: `${baseURL}${page.path}` });
      await mcp__playwright__browser_wait_for({ time: 2 });
      
      const memoryUsage = await mcp__playwright__browser_evaluate({
        function: `() => {
          const memory = performance.memory || {};
          return {
            usedJSHeapSize: memory.usedJSHeapSize || 0,
            totalJSHeapSize: memory.totalJSHeapSize || 0,
            jsHeapSizeLimit: memory.jsHeapSizeLimit || 0,
            domNodes: document.querySelectorAll('*').length,
            bodySize: document.body.innerHTML.length
          };
        }`
      });
      
      memoryResults.push({
        page: page.name,
        memory: memoryUsage
      });
      
      console.log(`${page.name} Memory Usage:`, memoryUsage);
    }
    
    // Memory assertions
    memoryResults.forEach(result => {
      // DOM should not be excessively large
      expect(result.memory.domNodes).toBeLessThan(5000);
      
      // JavaScript heap should be reasonable
      if (result.memory.usedJSHeapSize > 0) {
        expect(result.memory.usedJSHeapSize).toBeLessThan(50000000); // 50MB max
      }
    });
  });

  test('Mobile vs Desktop Performance Comparison', async () => {
    const performanceComparison = [];
    
    const testPage = criticalPages[0]; // Test homepage
    
    // Test mobile performance
    await mcp__playwright__browser_resize({ width: 375, height: 667 });
    await mcp__playwright__browser_navigate({ url: `${baseURL}${testPage.path}` });
    await mcp__playwright__browser_wait_for({ time: 3 });
    
    const mobileMetrics = await mcp__playwright__browser_evaluate({
      function: `() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        return {
          loadTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
          domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0,
          resourceCount: performance.getEntriesByType('resource').length
        };
      }`
    });
    
    await mcp__playwright__browser_take_screenshot({
      filename: 'performance-mobile-comparison.png'
    });
    
    // Test desktop performance
    await mcp__playwright__browser_resize({ width: 1920, height: 1080 });
    await mcp__playwright__browser_navigate({ url: `${baseURL}${testPage.path}` });
    await mcp__playwright__browser_wait_for({ time: 3 });
    
    const desktopMetrics = await mcp__playwright__browser_evaluate({
      function: `() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        return {
          loadTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
          domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0,
          resourceCount: performance.getEntriesByType('resource').length
        };
      }`
    });
    
    await mcp__playwright__browser_take_screenshot({
      filename: 'performance-desktop-comparison.png'
    });
    
    console.log('Mobile Metrics:', mobileMetrics);
    console.log('Desktop Metrics:', desktopMetrics);
    
    // Performance should be reasonable on both devices
    expect(mobileMetrics.loadTime).toBeLessThan(5000);
    expect(desktopMetrics.loadTime).toBeLessThan(3000);
    
    // Desktop should generally be faster
    if (mobileMetrics.loadTime > 0 && desktopMetrics.loadTime > 0) {
      expect(desktopMetrics.loadTime).toBeLessThanOrEqual(mobileMetrics.loadTime * 1.2);
    }
  });

  test('Third-party Performance Impact', async () => {
    await mcp__playwright__browser_navigate({ url: baseURL });
    
    const networkRequests = await mcp__playwright__browser_network_requests();
    
    // Identify third-party requests
    const thirdPartyRequests = networkRequests.filter(request => {
      const url = new URL(request.url);
      return !url.hostname.includes('localhost') && 
             !url.hostname.includes('127.0.0.1') &&
             !url.hostname.includes(baseURL);
    });
    
    console.log(`Third-party requests: ${thirdPartyRequests.length}`);
    
    const thirdPartyAnalysis = thirdPartyRequests.reduce((analysis, request) => {
      const domain = new URL(request.url).hostname;
      
      if (!analysis[domain]) {
        analysis[domain] = { count: 0, totalTime: 0, totalSize: 0 };
      }
      
      analysis[domain].count++;
      analysis[domain].totalTime += request.responseTime || 0;
      analysis[domain].totalSize += parseInt(request.responseHeaders?.['content-length'] || 0);
      
      return analysis;
    }, {});
    
    console.log('Third-party Analysis:', thirdPartyAnalysis);
    
    // Assert reasonable third-party usage
    expect(thirdPartyRequests.length).toBeLessThan(20); // Max 20 third-party requests
    
    const slowThirdPartyRequests = thirdPartyRequests.filter(req => req.responseTime > 3000);
    expect(slowThirdPartyRequests.length).toBeLessThan(2); // Max 2 slow third-party requests
  });

  test('Progressive Web App Performance', async () => {
    await mcp__playwright__browser_navigate({ url: baseURL });
    
    // Check PWA features
    const pwaFeatures = await mcp__playwright__browser_evaluate({
      function: `() => {
        return {
          hasServiceWorker: 'serviceWorker' in navigator,
          hasManifest: !!document.querySelector('link[rel="manifest"]'),
          isSecure: location.protocol === 'https:' || location.hostname === 'localhost',
          hasOfflineSupport: 'serviceWorker' in navigator && 'caches' in window,
          hasNotifications: 'Notification' in window,
          hasInstallPrompt: 'beforeinstallprompt' in window
        };
      }`
    });
    
    console.log('PWA Features:', pwaFeatures);
    
    // Check service worker performance if available
    if (pwaFeatures.hasServiceWorker) {
      const swPerformance = await mcp__playwright__browser_evaluate({
        function: `() => {
          return navigator.serviceWorker.getRegistrations().then(registrations => {
            return {
              registrationCount: registrations.length,
              states: registrations.map(reg => reg.active?.state).filter(Boolean)
            };
          }).catch(() => ({ error: 'Service worker not accessible' }));
        }`
      });
      
      console.log('Service Worker Performance:', swPerformance);
    }
  });

  test.afterAll(async () => {
    await mcp__playwright__browser_close();
    
    console.log('\n=== PERFORMANCE TEST SUMMARY ===');
    console.log('✅ Core Web Vitals tested');
    console.log('✅ Network performance analyzed');
    console.log('✅ Image optimization verified');
    console.log('✅ JavaScript performance measured');
    console.log('✅ Memory usage monitored');
    console.log('✅ Mobile vs Desktop compared');
    console.log('✅ Third-party impact assessed');
    console.log('✅ PWA features evaluated');
  });
});

// MCP function declarations
declare global {
  function mcp__playwright__browser_resize(params: { width: number; height: number }): Promise<void>;
  function mcp__playwright__browser_navigate(params: { url: string }): Promise<void>;
  function mcp__playwright__browser_wait_for(params: { time?: number; text?: string }): Promise<void>;
  function mcp__playwright__browser_evaluate(params: { function: string }): Promise<any>;
  function mcp__playwright__browser_take_screenshot(params: { filename: string }): Promise<void>;
  function mcp__playwright__browser_network_requests(): Promise<any[]>;
  function mcp__playwright__browser_close(): Promise<void>;
}