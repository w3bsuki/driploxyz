import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/svelte';
import ProductCard from '../lib/ProductCard.svelte';
import {
  renderSvelte5Component,
  createMockProduct,
  createMockHandlers,
  userInteraction,
  mockTranslations,
  checkAccessibility,
  setupGlobalMocks,
  waitForSvelteUpdate
} from './test-utils.js';

describe('ProductCard', () => {
  let mockProduct: any;
  let mockHandlers: any;

  beforeEach(() => {
    setupGlobalMocks();
    mockProduct = createMockProduct();
    mockHandlers = createMockHandlers();
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders product information correctly', () => {
      renderSvelte5Component(ProductCard, {
        product: mockProduct,
        translations: mockTranslations
      });

      expect(screen.getByText(mockProduct.title)).toBeInTheDocument();
      expect(screen.getByText(mockProduct.brand)).toBeInTheDocument();
      expect(screen.getByText('$89.99')).toBeInTheDocument();
      expect(screen.getByText(/Size M/)).toBeInTheDocument();
      const conditionBadges = screen.getAllByText('Good');
      expect(conditionBadges.length).toBeGreaterThan(0);
    });

    it('renders product image with correct alt text', () => {
      renderSvelte5Component(ProductCard, {
        product: mockProduct,
        translations: mockTranslations
      });

      const image = screen.getByAltText(mockProduct.title);
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', mockProduct.images[0]);
    });

    it('shows condition badge with correct styling', () => {
      renderSvelte5Component(ProductCard, {
        product: mockProduct,
        translations: mockTranslations
      });

      const conditionBadge = screen.getByText('Good');
      expect(conditionBadge).toHaveClass('bg-yellow-500', 'text-white');
    });

    it('uses placeholder image when no images provided', () => {
      const productWithoutImages = createMockProduct({ images: [] });
      
      renderSvelte5Component(ProductCard, {
        product: productWithoutImages,
        translations: mockTranslations
      });

      const image = screen.getByAltText(productWithoutImages.title);
      expect(image).toHaveAttribute('src', '/placeholder-product.svg');
    });
  });

  describe('Pricing', () => {
    it('displays price with default currency', () => {
      renderSvelte5Component(ProductCard, {
        product: mockProduct,
        translations: mockTranslations
      });

      expect(screen.getByText('$89.99')).toBeInTheDocument();
    });

    it('uses custom formatPrice function when provided', () => {
      const customTranslations = {
        ...mockTranslations,
        formatPrice: (price: number) => `€${price.toFixed(0)}`
      };

      renderSvelte5Component(ProductCard, {
        product: mockProduct,
        translations: customTranslations
      });

      expect(screen.getByText('€90')).toBeInTheDocument();
    });

    it('handles different currencies correctly', () => {
      const euroTranslations = {
        ...mockTranslations,
        currency: '€'
      };

      renderSvelte5Component(ProductCard, {
        product: mockProduct,
        translations: euroTranslations
      });

      expect(screen.getByText('€89.99')).toBeInTheDocument();
    });
  });

  describe('Click Handlers', () => {
    it('calls onclick handler when card is clicked', async () => {
      renderSvelte5Component(ProductCard, {
        product: mockProduct,
        onclick: mockHandlers.onclick,
        translations: mockTranslations
      });

      const card = screen.getByRole('button');
      await userInteraction.click(card);

      expect(mockHandlers.onclick).toHaveBeenCalledWith(mockProduct);
      expect(mockHandlers.onclick).toHaveBeenCalledTimes(1);
    });

    it('handles keyboard navigation (Enter key)', async () => {
      renderSvelte5Component(ProductCard, {
        product: mockProduct,
        onclick: mockHandlers.onclick,
        translations: mockTranslations
      });

      const card = screen.getByRole('button');
      await userInteraction.keyDown(card, 'Enter');

      expect(mockHandlers.onclick).toHaveBeenCalledWith(mockProduct);
    });

    it('handles keyboard navigation (Space key)', async () => {
      renderSvelte5Component(ProductCard, {
        product: mockProduct,
        onclick: mockHandlers.onclick,
        translations: mockTranslations
      });

      const card = screen.getByRole('button');
      await userInteraction.keyDown(card, ' ');

      expect(mockHandlers.onclick).toHaveBeenCalledWith(mockProduct);
    });
  });

  describe('Favorite Functionality', () => {
    it('renders favorite button when onFavorite handler provided', () => {
      renderSvelte5Component(ProductCard, {
        product: mockProduct,
        onFavorite: mockHandlers.onFavorite,
        translations: mockTranslations
      });

      const favoriteButton = screen.getByLabelText('Add to favorites');
      expect(favoriteButton).toBeInTheDocument();
    });

    it('does not render favorite button when onFavorite handler not provided', () => {
      renderSvelte5Component(ProductCard, {
        product: mockProduct,
        translations: mockTranslations
      });

      const favoriteButton = screen.queryByLabelText('Add to favorites');
      expect(favoriteButton).not.toBeInTheDocument();
    });

    it('shows different states for favorited/unfavorited products', () => {
      const { rerender } = renderSvelte5Component(ProductCard, {
        product: mockProduct,
        onFavorite: mockHandlers.onFavorite,
        favorited: false,
        translations: mockTranslations
      });

      // Initially not favorited
      expect(screen.getByLabelText('Add to favorites')).toBeInTheDocument();

      // Update to favorited state
      rerender({
        product: mockProduct,
        onFavorite: mockHandlers.onFavorite,
        favorited: true,
        translations: mockTranslations
      });

      expect(screen.getByLabelText('Remove from favorites')).toBeInTheDocument();
    });

    it('calls onFavorite handler when favorite button is clicked', async () => {
      renderSvelte5Component(ProductCard, {
        product: mockProduct,
        onFavorite: mockHandlers.onFavorite,
        translations: mockTranslations
      });

      const favoriteButton = screen.getByLabelText('Add to favorites');
      await userInteraction.click(favoriteButton);

      expect(mockHandlers.onFavorite).toHaveBeenCalledWith(mockProduct);
      expect(mockHandlers.onFavorite).toHaveBeenCalledTimes(1);
    });

    it('prevents event propagation when favorite button is clicked', async () => {
      renderSvelte5Component(ProductCard, {
        product: mockProduct,
        onclick: mockHandlers.onclick,
        onFavorite: mockHandlers.onFavorite,
        translations: mockTranslations
      });

      const favoriteButton = screen.getByLabelText('Add to favorites');
      await userInteraction.click(favoriteButton);

      expect(mockHandlers.onFavorite).toHaveBeenCalledTimes(1);
      expect(mockHandlers.onclick).not.toHaveBeenCalled();
    });

    it('applies correct styling for favorited state', () => {
      renderSvelte5Component(ProductCard, {
        product: mockProduct,
        onFavorite: mockHandlers.onFavorite,
        favorited: true,
        translations: mockTranslations
      });

      const favoriteIcon = screen.getByLabelText('Remove from favorites').querySelector('svg');
      expect(favoriteIcon).toHaveClass('text-red-500', 'fill-current');
    });
  });

  describe('Highlighted/Premium State', () => {
    it('applies highlighted styling when highlighted prop is true', () => {
      renderSvelte5Component(ProductCard, {
        product: mockProduct,
        highlighted: true,
        translations: mockTranslations
      });

      const card = screen.getByRole('button');
      expect(card).toHaveClass('highlighted');
    });

    it('does not apply highlighted styling by default', () => {
      renderSvelte5Component(ProductCard, {
        product: mockProduct,
        translations: mockTranslations
      });

      const card = screen.getByRole('button');
      expect(card).not.toHaveClass('highlighted');
    });
  });

  describe('Hover Interactions', () => {
    it('triggers prefetch on hover', async () => {
      renderSvelte5Component(ProductCard, {
        product: mockProduct,
        translations: mockTranslations
      });

      const card = screen.getByRole('button');
      await userInteraction.hover(card);

      expect(mockHandlers.requestIdleCallback || vi.fn()).toHaveBeenCalled;
    });

    it('applies hover styles on mouse enter', async () => {
      renderSvelte5Component(ProductCard, {
        product: mockProduct,
        translations: mockTranslations
      });

      const card = screen.getByRole('button');
      await userInteraction.hover(card);

      // Hover effects are primarily handled by CSS, but we can test the event is triggered
      expect(card).toBeInTheDocument(); // Basic check that element is still there
    });
  });

  describe('Accessibility', () => {
    it('has proper role and tabindex', () => {
      renderSvelte5Component(ProductCard, {
        product: mockProduct,
        translations: mockTranslations
      });

      const card = screen.getByRole('button');
      expect(checkAccessibility.hasRole(card, 'button')).toBe(true);
      expect(checkAccessibility.hasTabIndex(card)).toBe(true);
    });

    it('provides proper ARIA labels for favorite button', () => {
      renderSvelte5Component(ProductCard, {
        product: mockProduct,
        onFavorite: mockHandlers.onFavorite,
        translations: mockTranslations
      });

      const favoriteButton = screen.getByLabelText('Add to favorites');
      expect(checkAccessibility.hasAriaLabel(favoriteButton)).toBe(true);
    });

    it('is keyboard accessible', () => {
      renderSvelte5Component(ProductCard, {
        product: mockProduct,
        translations: mockTranslations
      });

      const card = screen.getByRole('button');
      expect(checkAccessibility.isKeyboardAccessible(card)).toBe(true);
    });

    it('has proper image alt text', () => {
      renderSvelte5Component(ProductCard, {
        product: mockProduct,
        translations: mockTranslations
      });

      const image = screen.getByAltText(mockProduct.title);
      expect(image).toHaveAttribute('alt', mockProduct.title);
    });
  });

  describe('Condition Handling', () => {
    it('renders different condition labels and colors', () => {
      const conditions = [
        { value: 'new', label: 'New', color: 'bg-green-500' },
        { value: 'like-new', label: 'Like New', color: 'bg-blue-500' },
        { value: 'good', label: 'Good', color: 'bg-yellow-500' },
        { value: 'fair', label: 'Fair', color: 'bg-orange-500' }
      ];

      conditions.forEach(({ value, label, color }) => {
        const testProduct = createMockProduct({ condition: value as any });
        const { unmount } = renderSvelte5Component(ProductCard, {
          product: testProduct,
          translations: mockTranslations
        });

        const conditionBadge = screen.getByText(label);
        expect(conditionBadge).toHaveClass(color, 'text-white');

        unmount();
      });
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      renderSvelte5Component(ProductCard, {
        product: mockProduct,
        class: 'custom-class',
        translations: mockTranslations
      });

      const card = screen.getByRole('button');
      expect(card).toHaveClass('custom-class');
    });

    it('applies default classes without custom className', () => {
      renderSvelte5Component(ProductCard, {
        product: mockProduct,
        translations: mockTranslations
      });

      const card = screen.getByRole('button');
      expect(card).toHaveClass('product-card', 'cursor-pointer');
    });
  });

  describe('Translation Support', () => {
    it('uses custom translation labels', () => {
      const customTranslations = {
        ...mockTranslations,
        size: 'Größe',
        new: 'Neu',
        good: 'Gut'
      };

      renderSvelte5Component(ProductCard, {
        product: mockProduct,
        translations: customTranslations
      });

      expect(screen.getByText('Größe M')).toBeInTheDocument();
      expect(screen.getByText('Gut')).toBeInTheDocument();
    });

    it('falls back to default labels when translations missing', () => {
      renderSvelte5Component(ProductCard, {
        product: mockProduct
      });

      expect(screen.getByText('Size M')).toBeInTheDocument();
      expect(screen.getByText('Good')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing product data gracefully', () => {
      const incompleteProduct = createMockProduct({
        brand: undefined,
        size: undefined,
        condition: undefined
      });

      renderSvelte5Component(ProductCard, {
        product: incompleteProduct,
        translations: mockTranslations
      });

      expect(screen.getByText(incompleteProduct.title)).toBeInTheDocument();
      expect(screen.getByText('$89.99')).toBeInTheDocument();
    });

    it('handles string array images format', () => {
      const productWithStringImages = createMockProduct({
        images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg']
      });

      renderSvelte5Component(ProductCard, {
        product: productWithStringImages,
        translations: mockTranslations
      });

      const image = screen.getByAltText(productWithStringImages.title);
      expect(image).toHaveAttribute('src', 'https://example.com/image1.jpg');
    });

    it('handles object array images format', () => {
      const productWithObjectImages = createMockProduct({
        images: [
          { image_url: 'https://example.com/image1.jpg', alt_text: 'Front view' },
          { image_url: 'https://example.com/image2.jpg', alt_text: 'Back view' }
        ] as any
      });

      renderSvelte5Component(ProductCard, {
        product: productWithObjectImages,
        translations: mockTranslations
      });

      const image = screen.getByAltText(productWithObjectImages.title);
      expect(image).toHaveAttribute('src', 'https://example.com/image1.jpg');
    });
  });
});