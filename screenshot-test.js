const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Navigate to the homepage
    console.log('Navigating to http://localhost:5178...');
    await page.goto('http://localhost:5178', { waitUntil: 'networkidle' });
    
    // Wait for potential loading
    await page.waitForTimeout(3000);
    
    // Take a screenshot
    console.log('Taking screenshot...');
    await page.screenshot({ 
      path: '.playwright-mcp/homepage-image-check.png', 
      fullPage: true 
    });
    
    // Check if there are any product cards on the page
    const productCards = await page.$$('.product-card');
    console.log(`Found ${productCards.length} product cards on the page`);
    
    // Check for images within product cards
    const productImages = await page.$$('.product-card img');
    console.log(`Found ${productImages.length} images in product cards`);
    
    // Check for placeholder images
    const placeholderImages = await page.$$('img[src*="placeholder"]');
    console.log(`Found ${placeholderImages.length} placeholder images`);
    
    // Get all image sources for debugging
    const imageSources = await page.$$eval('img', imgs => 
      imgs.map(img => ({ src: img.src, alt: img.alt }))
    );
    console.log('All image sources:', imageSources);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();