import { test, expect } from './fixtures';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('homepage a11y scan runs without crashing @smoke', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .disableRules(['color-contrast', 'aria-prohibited-attr'])
      .analyze();

    console.warn('A11y violations count:', results.violations.length);
  });
});
