import { test, expect } from '@playwright/test';

test.describe('Messaging System', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the messages page (assuming user is authenticated)
    await page.goto('/messages');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should load messages page with modern UI', async ({ page }) => {
    // Check if the page title is correct
    await expect(page).toHaveTitle(/Messages/);
    
    // Check for modern pill-style tabs
    await expect(page.locator('[role="button"]:has-text("All")')).toBeVisible();
    await expect(page.locator('[role="button"]:has-text("Unread")')).toBeVisible();
    
    // Verify rounded pill styling is applied
    const tabButton = page.locator('[role="button"]:has-text("All")').first();
    const classes = await tabButton.getAttribute('class');
    expect(classes).toContain('rounded-full');
  });

  test('should display conversation list with modern styling', async ({ page }) => {
    // Wait for conversations to load
    await page.waitForSelector('[data-testid="conversations-list"], .conversation-item', { timeout: 10000 });
    
    // Check if conversation items have modern styling
    const conversationItems = page.locator('button:has(.flex.items-start)');
    const count = await conversationItems.count();
    
    if (count > 0) {
      // Check first conversation has modern styling
      const firstConversation = conversationItems.first();
      const classes = await firstConversation.getAttribute('class');
      expect(classes).toContain('rounded-xl');
      expect(classes).toContain('transition-all');
    }
  });

  test('should switch between tab filters correctly', async ({ page }) => {
    // Click on different tabs and verify functionality
    const allTab = page.locator('[role="button"]:has-text("All")').first();
    const unreadTab = page.locator('[role="button"]:has-text("Unread")').first();
    
    // Start with All tab
    await allTab.click();
    await page.waitForTimeout(500);
    
    // Switch to Unread tab
    await unreadTab.click();
    await page.waitForTimeout(500);
    
    // Verify active state styling
    const activeClasses = await unreadTab.getAttribute('class');
    expect(activeClasses).toContain('bg-black');
    expect(activeClasses).toContain('text-white');
  });

  test('should open chat window when conversation is selected', async ({ page }) => {
    // Wait for conversations to load
    await page.waitForSelector('button:has(.flex.items-start)', { timeout: 10000 });
    
    const conversations = page.locator('button:has(.flex.items-start)');
    const count = await conversations.count();
    
    if (count > 0) {
      // Click on first conversation
      await conversations.first().click();
      await page.waitForTimeout(1000);
      
      // Check if chat window is visible
      await expect(page.locator('[placeholder*="message"], [placeholder*="Message"]')).toBeVisible();
      
      // Check for modern message input styling
      const input = page.locator('[placeholder*="message"], [placeholder*="Message"]').first();
      const inputClasses = await input.getAttribute('class');
      expect(inputClasses).toContain('rounded-full');
    }
  });

  test('should display and interact with quick action buttons', async ({ page }) => {
    // Wait for conversations and click on one
    await page.waitForSelector('button:has(.flex.items-start)', { timeout: 10000 });
    
    const conversations = page.locator('button:has(.flex.items-start)');
    const count = await conversations.count();
    
    if (count > 0) {
      await conversations.first().click();
      await page.waitForTimeout(1000);
      
      // Check if quick action buttons are visible
      await expect(page.locator('button:has-text("Make Offer"), button:has-text("Offer")')).toBeVisible();
      await expect(page.locator('button:has-text("Bundle")')).toBeVisible();
      await expect(page.locator('button:has-text("Location")')).toBeVisible();
      await expect(page.locator('button:has-text("Photo")')).toBeVisible();
      
      // Test Make Offer button functionality
      const messageInput = page.locator('[placeholder*="message"], [placeholder*="Message"]').first();
      await page.locator('button:has-text("Make Offer"), button:has-text("Offer")').click();
      
      // Verify the input field gets populated
      const inputValue = await messageInput.inputValue();
      expect(inputValue).toContain('offer');
      
      // Clear the input
      await messageInput.fill('');
      
      // Test Bundle button
      await page.locator('button:has-text("Bundle")').click();
      const bundleValue = await messageInput.inputValue();
      expect(bundleValue).toContain('bundle');
    }
  });

  test('should send messages with modern UI feedback', async ({ page }) => {
    // Navigate to a conversation
    await page.waitForSelector('button:has(.flex.items-start)', { timeout: 10000 });
    
    const conversations = page.locator('button:has(.flex.items-start)');
    const count = await conversations.count();
    
    if (count > 0) {
      await conversations.first().click();
      await page.waitForTimeout(1000);
      
      const messageInput = page.locator('[placeholder*="message"], [placeholder*="Message"]').first();
      const sendButton = page.locator('button[aria-label*="Send"], button:has(svg):near(input)').last();
      
      if (await messageInput.isVisible() && await sendButton.isVisible()) {
        // Type a test message
        await messageInput.fill('Test message for E2E testing');
        
        // Verify send button is enabled and has proper styling
        const sendButtonClasses = await sendButton.getAttribute('class');
        expect(sendButtonClasses).toContain('bg-gradient-to-r');
        expect(sendButtonClasses).toContain('rounded-full');
        
        // Click send button
        await sendButton.click();
        
        // Wait for message to be processed
        await page.waitForTimeout(2000);
        
        // Check if input is cleared (indicating successful send)
        const inputValue = await messageInput.inputValue();
        expect(inputValue).toBe('');
      }
    }
  });

  test('should display proper loading states', async ({ page }) => {
    // Check for loading states when page initially loads
    const loadingIndicators = page.locator('.animate-spin, [data-testid="loading"], :has-text("Loading")');
    
    // Either loading should be visible initially, or content should load quickly
    try {
      await expect(loadingIndicators.first()).toBeVisible({ timeout: 2000 });
      // Wait for loading to complete
      await expect(loadingIndicators.first()).toBeHidden({ timeout: 10000 });
    } catch (error) {
      // If no loading indicator found, that's also acceptable if content loaded immediately
      await expect(page.locator('button:has(.flex.items-start), :has-text("No messages")')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verify mobile layout
    await page.waitForSelector('[data-testid="conversations-list"], .conversation-item, button:has(.flex.items-start)', { timeout: 10000 });
    
    // On mobile, conversation list should be visible initially
    const conversationsList = page.locator('button:has(.flex.items-start)').first();
    
    if (await conversationsList.isVisible()) {
      // Click on a conversation
      await conversationsList.click();
      await page.waitForTimeout(1000);
      
      // On mobile, chat window should be visible and conversation list hidden
      await expect(page.locator('[placeholder*="message"], [placeholder*="Message"]')).toBeVisible();
      
      // Check for back button on mobile
      const backButton = page.locator('button:has(svg):has-text(""), button[aria-label*="Back"]');
      await expect(backButton.first()).toBeVisible();
    }
  });

  test('should handle empty states gracefully', async ({ page }) => {
    // If no conversations exist, should show empty state
    await page.waitForTimeout(3000);
    
    const hasConversations = await page.locator('button:has(.flex.items-start)').count() > 0;
    
    if (!hasConversations) {
      // Should show empty state message
      await expect(page.locator(':has-text("No messages"), :has-text("Start a conversation")')).toBeVisible();
      
      // Empty state should have modern styling
      const emptyState = page.locator(':has-text("No messages"), :has-text("Start a conversation")').first();
      const container = emptyState.locator('..').locator('..');
      const classes = await container.getAttribute('class');
      expect(classes).toContain('text-center');
    }
  });
});

test.describe('Progressive Message Loading', () => {
  test('should load initial messages and show load more indicator', async ({ page }) => {
    await page.goto('/messages');
    await page.waitForLoadState('networkidle');
    
    // Navigate to a conversation with messages
    await page.waitForSelector('button:has(.flex.items-start)', { timeout: 10000 });
    
    const conversations = page.locator('button:has(.flex.items-start)');
    const count = await conversations.count();
    
    if (count > 0) {
      await conversations.first().click();
      await page.waitForTimeout(2000);
      
      // Check if messages are loaded
      const messages = page.locator('.flex.justify-end, .flex.justify-start').filter({ hasText: /.+/ });
      const messageCount = await messages.count();
      
      if (messageCount > 0) {
        // Verify initial load is limited (should be around 10 messages)
        expect(messageCount).toBeLessThanOrEqual(15);
        
        // Look for scroll-to-load indicator
        const loadMoreIndicator = page.locator(':has-text("Scroll up"), :has-text("load more")');
        
        if (await loadMoreIndicator.count() > 0) {
          await expect(loadMoreIndicator.first()).toBeVisible();
        }
      }
    }
  });
});