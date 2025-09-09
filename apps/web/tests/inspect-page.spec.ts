import { test, expect } from '@playwright/test';

test('Inspect page structure', async ({ page }) => {
  console.log('Navigating to homepage...');
  await page.goto('http://localhost:5179');
  
  console.log('Waiting for page to load...');
  await page.waitForLoadState('networkidle', { timeout: 10000 });
  
  console.log('Page title:', await page.title());
  
  // Take a screenshot to see what's actually loaded
  await page.screenshot({ path: 'test-results/page-inspection.png', fullPage: true });
  
  // Get page content to understand structure
  const bodyHTML = await page.locator('body').innerHTML();
  console.log('Body HTML length:', bodyHTML.length);
  
  // Look for common elements
  const header = await page.locator('header').count();
  const nav = await page.locator('nav').count();
  const main = await page.locator('main').count();
  const buttons = await page.locator('button').count();
  const links = await page.locator('a').count();
  const inputs = await page.locator('input').count();
  
  console.log('Element counts:');
  console.log('- header:', header);
  console.log('- nav:', nav);
  console.log('- main:', main);
  console.log('- buttons:', buttons);
  console.log('- links:', links);
  console.log('- inputs:', inputs);
  
  // Check for data-testid attributes
  const testIds = await page.locator('[data-testid]').count();
  console.log('- elements with data-testid:', testIds);
  
  if (testIds > 0) {
    const testIdElements = await page.locator('[data-testid]').all();
    console.log('Found test IDs:');
    for (const element of testIdElements) {
      const testId = await element.getAttribute('data-testid');
      console.log(`  - ${testId}`);
    }
  }
  
  // Look for common CSS classes
  const hasSearch = await page.locator('input[type="search"], [placeholder*="search" i]').count();
  const hasProductCards = await page.locator('.product-card, [class*="product"]').count();
  const hasFavorites = await page.locator('[aria-label*="favorite" i], .favorite, [class*="heart"]').count();
  
  console.log('Content indicators:');
  console.log('- search inputs:', hasSearch);  
  console.log('- product-like elements:', hasProductCards);
  console.log('- favorite-like elements:', hasFavorites);
  
  // Get all h1 elements to understand page structure
  const headings = await page.locator('h1').all();
  console.log('H1 headings found:');
  for (const heading of headings) {
    const text = await heading.textContent();
    console.log(`  - "${text}"`);
  }
  
  expect(header).toBeGreaterThan(0);
});