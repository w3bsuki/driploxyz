/**
 * Test helper functions for Driplo marketplace tests using MCP Playwright
 */

export interface TestContext {
  page: any; // Playwright page object
  baseURL: string;
}

export class DriploTestHelpers {
  constructor(private context: TestContext) {}

  /**
   * Navigate to a specific page and wait for it to load
   */
  async navigateTo(path: string = '/') {
    const url = `${this.context.baseURL}${path}`;
    // Using MCP Playwright navigation
    await this.mcpNavigate(url);
    await this.waitForPageLoad();
  }

  /**
   * MCP Playwright navigation wrapper
   */
  private async mcpNavigate(url: string) {
    // This would use the MCP browser_navigate function
    // For now, using standard Playwright
    await this.context.page.goto(url);
  }

  /**
   * Wait for page to load completely
   */
  async waitForPageLoad() {
    await this.context.page.waitForLoadState('networkidle');
  }

  /**
   * Take accessibility snapshot using MCP
   */
  async takeA11ySnapshot() {
    // This would use mcp__playwright__browser_snapshot
    // For now, return page content
    return await this.context.page.content();
  }

  /**
   * Check for console errors
   */
  async checkConsoleErrors(): Promise<string[]> {
    const errors: string[] = [];
    this.context.page.on('console', (msg: any) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    return errors;
  }

  /**
   * Login with test user
   */
  async loginAs(userType: 'buyer' | 'seller' | 'admin') {
    const { testUsers } = await import('./test-data');
    const user = testUsers[userType];
    
    await this.navigateTo('/login');
    await this.fillForm({
      email: user.email,
      password: user.password
    });
    
    await this.clickButton('Log in');
    await this.waitForNavigation();
  }

  /**
   * Fill form fields
   */
  async fillForm(fields: Record<string, string>) {
    for (const [name, value] of Object.entries(fields)) {
      const input = this.context.page.getByLabel(new RegExp(name, 'i'));
      await input.fill(value);
    }
  }

  /**
   * Click button by text or role
   */
  async clickButton(text: string) {
    const button = this.context.page.getByRole('button', { name: new RegExp(text, 'i') });
    await button.click();
  }

  /**
   * Click link by text
   */
  async clickLink(text: string) {
    const link = this.context.page.getByRole('link', { name: new RegExp(text, 'i') });
    await link.click();
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation() {
    await this.context.page.waitForLoadState('networkidle');
  }

  /**
   * Search for products
   */
  async searchFor(query: string) {
    const searchInput = this.context.page.getByPlaceholder(/search/i);
    await searchInput.fill(query);
    await searchInput.press('Enter');
    await this.waitForNavigation();
  }

  /**
   * Add item to favorites/wishlist
   */
  async addToFavorites(productIndex: number = 0) {
    const favoriteButton = this.context.page.locator('[data-testid="favorite-button"]').nth(productIndex);
    await favoriteButton.click();
  }

  /**
   * Create a test listing
   */
  async createListing(productData: any) {
    await this.navigateTo('/sell');
    
    // Fill basic product info
    await this.fillForm({
      title: productData.title,
      description: productData.description,
      price: productData.price.toString()
    });

    // Select category
    await this.selectOption('category', productData.category);
    
    // Select brand
    await this.selectOption('brand', productData.brand);
    
    // Select size
    await this.selectOption('size', productData.size);
    
    // Select condition
    await this.selectOption('condition', productData.condition);
    
    // Submit listing
    await this.clickButton('Create Listing');
    await this.waitForNavigation();
  }

  /**
   * Select option from dropdown
   */
  async selectOption(field: string, value: string) {
    const select = this.context.page.getByLabel(new RegExp(field, 'i'));
    await select.selectOption(value);
  }

  /**
   * Start checkout process
   */
  async startCheckout(productId?: string) {
    if (productId) {
      await this.navigateTo(`/product/${productId}`);
    }
    
    await this.clickButton('Buy Now');
    await this.waitForNavigation();
  }

  /**
   * Fill checkout form
   */
  async fillCheckoutForm(address: any) {
    await this.fillForm({
      'first name': address.firstName,
      'last name': address.lastName,
      'street': address.street,
      'city': address.city,
      'postal code': address.postalCode,
      'phone': address.phone
    });
  }

  /**
   * Send message to seller
   */
  async sendMessage(sellerId: string, message: string) {
    await this.navigateTo(`/messages/new?seller=${sellerId}`);
    
    const messageInput = this.context.page.getByPlaceholder(/type your message/i);
    await messageInput.fill(message);
    
    await this.clickButton('Send');
    await this.waitForNavigation();
  }

  /**
   * Check if element is visible
   */
  async isVisible(selector: string): Promise<boolean> {
    try {
      const element = this.context.page.locator(selector);
      return await element.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(selector: string, timeout: number = 5000) {
    await this.context.page.waitForSelector(selector, { 
      state: 'visible', 
      timeout 
    });
  }

  /**
   * Get text content of element
   */
  async getTextContent(selector: string): Promise<string> {
    const element = this.context.page.locator(selector);
    return await element.textContent() || '';
  }

  /**
   * Count elements matching selector
   */
  async countElements(selector: string): Promise<number> {
    return await this.context.page.locator(selector).count();
  }

  /**
   * Take screenshot for visual testing
   */
  async takeScreenshot(filename: string, fullPage: boolean = false) {
    await this.context.page.screenshot({
      path: `test-results/${filename}`,
      fullPage
    });
  }

  /**
   * Check page performance metrics
   */
  async getPerformanceMetrics() {
    const metrics = await this.context.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        ttfb: navigation.responseStart - navigation.requestStart
      };
    });
    return metrics;
  }

  /**
   * Simulate mobile viewport
   */
  async setMobileViewport() {
    await this.context.page.setViewportSize({ width: 375, height: 667 });
  }

  /**
   * Simulate desktop viewport
   */
  async setDesktopViewport() {
    await this.context.page.setViewportSize({ width: 1920, height: 1080 });
  }

  /**
   * Clear browser storage
   */
  async clearStorage() {
    await this.context.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  /**
   * Mock API responses
   */
  async mockApiResponse(endpoint: string, response: any) {
    await this.context.page.route(`**/${endpoint}`, (route: any) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });
  }
}

export default DriploTestHelpers;