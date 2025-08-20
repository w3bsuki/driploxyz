import { test, expect } from '@playwright/test';

test.describe('Example E2E Tests', () => {
	test('should load the homepage', async ({ page }) => {
		await page.goto('/');
		
		// Check that the page loads
		await expect(page).toHaveTitle(/Driplo/);
		
		// Check for basic page elements
		await expect(page.locator('body')).toBeVisible();
	});

	test('should navigate to different pages', async ({ page }) => {
		await page.goto('/');
		
		// Example navigation test (adjust selectors based on your actual app)
		const navigationLink = page.locator('a[href*="/search"]').first();
		if (await navigationLink.isVisible()) {
			await navigationLink.click();
			await expect(page.url()).toContain('/search');
		}
	});

	test('should handle responsive design', async ({ page }) => {
		// Test desktop
		await page.setViewportSize({ width: 1200, height: 800 });
		await page.goto('/');
		await expect(page.locator('body')).toBeVisible();

		// Test mobile
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/');
		await expect(page.locator('body')).toBeVisible();
	});

	test('should handle form interactions', async ({ page }) => {
		await page.goto('/');
		
		// Look for any search input
		const searchInput = page.locator('input[type="search"]').first();
		if (await searchInput.isVisible()) {
			await searchInput.fill('test search');
			await expect(searchInput).toHaveValue('test search');
		}
	});

	test('should check accessibility basics', async ({ page }) => {
		await page.goto('/');
		
		// Check for proper heading structure
		const h1 = page.locator('h1').first();
		if (await h1.isVisible()) {
			await expect(h1).toBeVisible();
		}

		// Check for alt text on images
		const images = page.locator('img');
		const imageCount = await images.count();
		
		for (let i = 0; i < Math.min(imageCount, 5); i++) {
			const img = images.nth(i);
			if (await img.isVisible()) {
				const alt = await img.getAttribute('alt');
				expect(alt).not.toBeNull();
			}
		}
	});

	test('should test error handling', async ({ page }) => {
		// Test 404 page
		const response = await page.goto('/non-existent-page');
		expect(response?.status()).toBe(404);
	});
});