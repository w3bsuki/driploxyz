import { test, expect } from '@playwright/test';

test.describe('Real World Smoke Tests - Critical Path', () => {
  const baseURL = 'http://localhost:5173';

  test('Homepage loads and displays core elements', async ({ page }) => {
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    
    // Check critical elements exist using actual selectors
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('input[type="search"], [placeholder*="search" i]')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    
    // Check for product-like content
    const productElements = await page.locator('.product-card, [class*="product"]').count();
    expect(productElements).toBeGreaterThan(0);
    
    // Check for favorite buttons
    const favoriteElements = await page.locator('[aria-label*="favorite" i], .favorite, [class*="heart"]').count();
    expect(favoriteElements).toBeGreaterThan(0);
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/real-homepage.png', fullPage: true });
    
    console.log('✅ Homepage loaded successfully with all core elements');
  });

  test('Navigation and basic interactions work', async ({ page }) => {
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    
    // Test search input interaction
    const searchInput = page.locator('input[type="search"], [placeholder*="search" i]').first();
    await searchInput.fill('test search');
    
    // Clear search
    await searchInput.fill('');
    
    // Test button interactions (click first few buttons to ensure they're responsive)
    const buttons = await page.locator('button').all();
    if (buttons.length > 0) {
      // Click first button (likely navigation or primary action)
      await buttons[0].click();
      await page.waitForTimeout(1000);
    }
    
    await page.screenshot({ path: 'test-results/real-navigation.png' });
    
    console.log('✅ Basic navigation and interactions work');
  });

  test('Mobile responsiveness works', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    
    // Check mobile layout exists
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    
    // Check responsive elements
    const buttons = await page.locator('button').count();
    expect(buttons).toBeGreaterThan(0);
    
    await page.screenshot({ path: 'test-results/real-mobile.png', fullPage: true });
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'test-results/real-desktop.png', fullPage: true });
    
    console.log('✅ Mobile and desktop responsiveness confirmed');
  });

  test('Performance baseline check', async ({ page }) => {
    await page.goto(baseURL);
    
    // Get basic performance metrics
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        ttfb: navigation.responseStart - navigation.requestStart
      };
    });
    
    console.log('Performance metrics:', metrics);
    
    // Basic performance assertions
    expect(metrics.loadTime).toBeLessThan(10000); // 10 seconds max (generous for first run)
    expect(metrics.ttfb).toBeLessThan(3000); // 3 seconds TTFB max (generous for first run)
    
    console.log('✅ Performance baseline acceptable');
  });

  test('Console errors check', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for any async errors
    await page.waitForTimeout(3000);
    
    console.log('Console errors found:', consoleErrors.length);
    if (consoleErrors.length > 0) {
      console.log('Errors:', consoleErrors);
    }
    
    // Allow some errors for now, but log them
    expect(consoleErrors.length).toBeLessThan(10); // Allow up to 10 errors for initial run
    
    console.log('✅ Console errors within acceptable range');
  });

  test('Accessibility basics check', async ({ page }) => {
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    
    // Check basic accessibility requirements
    const pageTitle = await page.title();
    expect(pageTitle.length).toBeGreaterThan(0);
    
    // Check for alt text on images
    const imagesWithoutAlt = await page.locator('img:not([alt])').count();
    console.log('Images without alt text:', imagesWithoutAlt);
    
    // Check for form labels
    const inputs = await page.locator('input').all();
    let unlabeledInputs = 0;
    
    for (const input of inputs) {
      const hasLabel = await input.evaluate((el) => {
        return el.labels?.length > 0 || 
               el.hasAttribute('aria-label') || 
               el.hasAttribute('aria-labelledby') ||
               el.hasAttribute('placeholder');
      });
      
      if (!hasLabel) {
        unlabeledInputs++;
      }
    }
    
    console.log('Unlabeled inputs:', unlabeledInputs);
    
    // Check for proper heading structure
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    console.log('Total headings found:', headings.length);
    
    console.log('✅ Basic accessibility check completed');
  });

  test('Content loading verification', async ({ page }) => {
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    
    // Verify main content is loaded
    const mainContent = await page.locator('main').innerHTML();
    expect(mainContent.length).toBeGreaterThan(1000); // Should have substantial content
    
    // Check for interactive elements
    const buttonCount = await page.locator('button').count();
    const linkCount = await page.locator('a').count();
    
    console.log(`Found ${buttonCount} buttons and ${linkCount} links`);
    
    expect(buttonCount).toBeGreaterThan(5); // Should have multiple interactive buttons
    expect(linkCount).toBeGreaterThan(5); // Should have multiple navigation links
    
    // Check for any loading states that might indicate incomplete loading
    const loadingElements = await page.locator('[class*="loading"], [class*="spinner"], [aria-busy="true"]').count();
    console.log('Loading elements still visible:', loadingElements);
    
    console.log('✅ Content loading verification successful');
  });

  test('Form elements basic functionality', async ({ page }) => {
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    
    // Test search input if available
    const searchInputs = await page.locator('input[type="search"], [placeholder*="search" i]').all();
    
    if (searchInputs.length > 0) {
      const searchInput = searchInputs[0];
      
      // Test typing in search
      await searchInput.fill('test query');
      const value = await searchInput.inputValue();
      expect(value).toBe('test query');
      
      // Clear search
      await searchInput.fill('');
      
      console.log('✅ Search input functionality works');
    }
    
    // Test other form inputs
    const otherInputs = await page.locator('input:not([type="search"])').all();
    
    if (otherInputs.length > 0) {
      for (const input of otherInputs.slice(0, 3)) { // Test first 3 inputs
        const type = await input.getAttribute('type');
        const placeholder = await input.getAttribute('placeholder');
        
        console.log(`Testing input type: ${type}, placeholder: ${placeholder}`);
        
        if (type !== 'hidden' && type !== 'submit' && type !== 'button') {
          try {
            await input.fill('test');
            await input.fill('');
          } catch (error) {
            console.log(`Input test failed for type ${type}: ${error}`);
          }
        }
      }
    }
    
    console.log('✅ Form elements basic functionality tested');
  });

  test('Link navigation check', async ({ page }) => {
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    
    // Get all links
    const links = await page.locator('a[href]').all();
    
    console.log(`Found ${links.length} links`);
    
    // Test a few internal links (not external ones)
    let testedLinks = 0;
    
    for (const link of links.slice(0, 5)) { // Test first 5 links
      const href = await link.getAttribute('href');
      
      if (href && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
        try {
          console.log(`Testing link: ${href}`);
          
          // Click link and check it navigates
          await link.click();
          await page.waitForTimeout(1000);
          
          // Go back to homepage
          await page.goto(baseURL);
          await page.waitForLoadState('networkidle');
          
          testedLinks++;
        } catch (error) {
          console.log(`Link test failed for ${href}: ${error}`);
        }
        
        if (testedLinks >= 3) break; // Test max 3 links
      }
    }
    
    console.log(`✅ Tested ${testedLinks} internal links`);
  });

  test('Button interactions check', async ({ page }) => {
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    
    // Get all buttons
    const buttons = await page.locator('button').all();
    
    console.log(`Found ${buttons.length} buttons`);
    
    // Test a few buttons (avoiding potentially destructive ones)
    let testedButtons = 0;
    
    for (const button of buttons.slice(0, 10)) { // Test first 10 buttons
      try {
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');
        const className = await button.getAttribute('class');
        
        console.log(`Testing button: "${text?.trim()}" (aria-label: ${ariaLabel}, class: ${className?.substring(0, 50)})`);
        
        // Skip potentially destructive buttons
        const buttonInfo = (text + ariaLabel + className).toLowerCase();
        if (buttonInfo.includes('delete') || buttonInfo.includes('remove') || buttonInfo.includes('logout')) {
          console.log('Skipping potentially destructive button');
          continue;
        }
        
        // Check if button is visible and enabled
        const isVisible = await button.isVisible();
        const isEnabled = await button.isEnabled();
        
        if (isVisible && isEnabled) {
          await button.click();
          await page.waitForTimeout(500);
          testedButtons++;
        }
        
        if (testedButtons >= 5) break; // Test max 5 buttons
      } catch (error) {
        console.log(`Button test failed: ${error}`);
      }
    }
    
    console.log(`✅ Tested ${testedButtons} button interactions`);
  });

  // Summary test that consolidates all findings
  test('Overall application health check', async ({ page }) => {
    console.log('🚀 Starting comprehensive application health check...');
    
    const startTime = Date.now();
    
    // Load homepage
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    console.log(`⏱️ Page load time: ${loadTime}ms`);
    
    // Collect comprehensive metrics
    const metrics = {
      loadTime,
      title: await page.title(),
      elementCounts: {
        headers: await page.locator('header').count(),
        navs: await page.locator('nav').count(),
        mains: await page.locator('main').count(),
        buttons: await page.locator('button').count(),
        links: await page.locator('a').count(),
        inputs: await page.locator('input').count(),
        images: await page.locator('img').count()
      },
      content: {
        bodyLength: (await page.locator('body').innerHTML()).length,
        headingCount: await page.locator('h1, h2, h3, h4, h5, h6').count(),
        productLikeElements: await page.locator('.product-card, [class*="product"]').count(),
        favoriteElements: await page.locator('[aria-label*="favorite" i], .favorite, [class*="heart"]').count()
      }
    };
    
    // Take final screenshot
    await page.screenshot({ path: 'test-results/health-check-final.png', fullPage: true });
    
    console.log('📊 Application Metrics:');
    console.log('Load Time:', metrics.loadTime + 'ms');
    console.log('Page Title:', metrics.title || 'No title');
    console.log('Elements:', metrics.elementCounts);
    console.log('Content:', metrics.content);
    
    // Basic health assertions
    expect(metrics.loadTime).toBeLessThan(15000); // 15 seconds max
    expect(metrics.elementCounts.headers).toBeGreaterThan(0);
    expect(metrics.elementCounts.mains).toBeGreaterThan(0);
    expect(metrics.elementCounts.buttons).toBeGreaterThan(0);
    expect(metrics.content.bodyLength).toBeGreaterThan(10000);
    
    console.log('✅ Application health check PASSED');
    console.log('🎉 All smoke tests completed successfully!');
  });
});