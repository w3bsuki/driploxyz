import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import PromotedHighlights from '@repo/ui/PromotedHighlights.svelte';

describe('PromotedHighlights Accessibility', () => {
  const mockTranslations = {
    seller_premiumSeller: 'Premium Seller',
    seller_premiumSellerDescription: 'Top-rated seller',
    trending_promoted: 'Promoted',
    trending_featured: 'Featured',
    common_currency: 'BGN',
    ui_scroll: 'Scroll'
  };

  const mockProducts = [
    {
      id: '1',
      title: 'Test Product',
      price: 29.99,
      currency: 'BGN',
      images: ['test.jpg'],
      condition: 'good' as const,
      seller_id: 'seller1',
      category_id: 'cat1',
      size: 'M',
      brand: 'Test Brand',
      description: 'Test description',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sold: false,
      favorites_count: 0,
      views_count: 0
    }
  ];

  it('should have proper ARIA labels and roles', () => {
    const { container } = render(PromotedHighlights, {
      props: {
        promotedProducts: mockProducts,
        sellers: [],
        onSellerSelect: () => {},
        onSellerClick: () => {},
        translations: mockTranslations
      }
    });

    // Check for proper semantic structure
    const section = container.querySelector('section[role="region"]');
    expect(section).toBeTruthy();
    expect(section?.getAttribute('aria-label')).toBe('Promoted');

    // Check for navigation role
    const nav = container.querySelector('nav[role="navigation"]');
    expect(nav).toBeTruthy();
    expect(nav?.getAttribute('aria-label')).toBe('Promoted products carousel');

    // Check for proper heading structure
    const heading = container.querySelector('h2');
    expect(heading).toBeTruthy();

    // Check for screen reader only text
    const srOnly = container.querySelector('.sr-only');
    expect(srOnly?.textContent).toContain('1 promoted products available');
  });

  it('should have sufficient color contrast', () => {
    const { container } = render(PromotedHighlights, {
      props: {
        promotedProducts: mockProducts,
        sellers: [],
        onSellerSelect: () => {},
        onSellerClick: () => {},
        translations: mockTranslations
      }
    });

    // Check badge has gradient with proper contrast
    const badge = container.querySelector('.gradient-badge');
    expect(badge).toBeTruthy();
    expect(badge?.classList.contains('text-white')).toBe(true);
  });

  it('should have proper focus management', () => {
    const { container } = render(PromotedHighlights, {
      props: {
        promotedProducts: mockProducts,
        sellers: [],
        onSellerSelect: () => {},
        onSellerClick: () => {},
        translations: mockTranslations
      }
    });

    // Check badge is focusable
    const badge = container.querySelector('.promoted-badge');
    expect(badge?.getAttribute('tabindex')).toBe('0');
    expect(badge?.classList.contains('focus:outline-none')).toBe(true);
  });

  it('should have responsive text sizes', () => {
    const { container } = render(PromotedHighlights, {
      props: {
        promotedProducts: mockProducts,
        sellers: [],
        onSellerSelect: () => {},
        onSellerClick: () => {},
        translations: mockTranslations
      }
    });

    // Check responsive text classes
    const badge = container.querySelector('.promoted-badge');
    expect(badge?.classList.contains('text-sm')).toBe(true);
    expect(badge?.classList.contains('sm:text-base')).toBe(true);
  });

  it('should have mobile-optimized layout', () => {
    const { container } = render(PromotedHighlights, {
      props: {
        promotedProducts: mockProducts,
        sellers: [],
        onSellerSelect: () => {},
        onSellerClick: () => {},
        translations: mockTranslations
      }
    });

    // Check for mobile scroll indicator
    const mobileIndicator = container.querySelector('.sm\\:hidden svg');
    expect(mobileIndicator).toBeTruthy();

    // Check for desktop scroll indicator  
    const desktopIndicator = container.querySelector('.hidden.sm\\:flex');
    expect(desktopIndicator).toBeTruthy();
  });
});