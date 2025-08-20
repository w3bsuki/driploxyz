import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/svelte';
import ProductGallery from '../lib/ProductGallery.svelte';
import {
  renderSvelte5Component,
  createMockProduct,
  userInteraction,
  mockTranslations,
  checkAccessibility,
  setupGlobalMocks,
  waitForSvelteUpdate
} from './test-utils.js';

describe('ProductGallery', () => {
  let mockImages: any;
  let mockKeydownHandler: any;

  beforeEach(() => {
    setupGlobalMocks();
    mockImages = [
      { image_url: 'https://example.com/image1.jpg', alt_text: 'Front view', id: '1' },
      { image_url: 'https://example.com/image2.jpg', alt_text: 'Back view', id: '2' },
      { image_url: 'https://example.com/image3.jpg', alt_text: 'Side view', id: '3' }
    ];
    
    // Mock global keydown handler
    mockKeydownHandler = vi.fn();
    document.addEventListener = vi.fn((event, handler) => {
      if (event === 'keydown') {
        mockKeydownHandler = handler;
      }
    });
    
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders gallery with multiple images', () => {
      renderSvelte5Component(ProductGallery, {
        images: mockImages,
        title: 'Test Product',
        translations: mockTranslations
      });

      const mainImage = screen.getByAltText('Test Product - Image 1');
      expect(mainImage).toBeInTheDocument();
      expect(mainImage).toHaveAttribute('src', mockImages[0].image_url);
    });

    it('renders single image without navigation controls', () => {
      const singleImage = [mockImages[0]];
      
      renderSvelte5Component(ProductGallery, {
        images: singleImage,
        title: 'Test Product',
        translations: mockTranslations
      });

      expect(screen.getByAltText('Test Product - Image 1')).toBeInTheDocument();
      expect(screen.queryByLabelText('Previous image')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Next image')).not.toBeInTheDocument();
    });

    it('handles string array images format', () => {
      const stringImages = ['image1.jpg', 'image2.jpg', 'image3.jpg'];
      
      renderSvelte5Component(ProductGallery, {
        images: stringImages,
        title: 'Test Product',
        translations: mockTranslations
      });

      const mainImage = screen.getByAltText('Test Product - Image 1');
      expect(mainImage).toHaveAttribute('src', 'image1.jpg');
    });

    it('shows placeholder when no images provided', () => {
      renderSvelte5Component(ProductGallery, {
        images: [],
        title: 'Test Product',
        translations: mockTranslations
      });

      const mainImage = screen.getByAltText('Test Product - Image 1');
      expect(mainImage).toHaveAttribute('src', '/placeholder-product.svg');
    });
  });

  describe('Image Navigation', () => {
    it('renders navigation arrows for multiple images', () => {
      renderSvelte5Component(ProductGallery, {
        images: mockImages,
        title: 'Test Product',
        translations: mockTranslations
      });

      const nextButton = screen.getByLabelText('Next image');
      expect(nextButton).toBeInTheDocument();
      
      // Previous button should not be visible on first image
      expect(screen.queryByLabelText('Previous image')).not.toBeInTheDocument();
    });

    it('navigates to next image when next button clicked', async () => {
      renderSvelte5Component(ProductGallery, {
        images: mockImages,
        title: 'Test Product',
        translations: mockTranslations
      });

      const nextButton = screen.getByLabelText('Next image');
      await userInteraction.click(nextButton);

      const mainImage = screen.getByAltText('Test Product - Image 2');
      expect(mainImage).toHaveAttribute('src', mockImages[1].image_url);
    });

    it('navigates to previous image when previous button clicked', async () => {
      renderSvelte5Component(ProductGallery, {
        images: mockImages,
        title: 'Test Product',
        translations: mockTranslations
      });

      // First navigate to second image
      const nextButton = screen.getByLabelText('Next image');
      await userInteraction.click(nextButton);

      // Then navigate back
      const prevButton = screen.getByLabelText('Previous image');
      await userInteraction.click(prevButton);

      const mainImage = screen.getByAltText('Test Product - Image 1');
      expect(mainImage).toHaveAttribute('src', mockImages[0].image_url);
    });

    it('hides navigation buttons at boundaries', async () => {
      renderSvelte5Component(ProductGallery, {
        images: mockImages,
        title: 'Test Product',
        translations: mockTranslations
      });

      // At first image - no previous button
      expect(screen.queryByLabelText('Previous image')).not.toBeInTheDocument();

      // Navigate to last image
      const nextButton = screen.getByLabelText('Next image');
      await userInteraction.click(nextButton);
      await userInteraction.click(screen.getByLabelText('Next image'));

      // At last image - no next button
      expect(screen.queryByLabelText('Next image')).not.toBeInTheDocument();
      expect(screen.getByLabelText('Previous image')).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('navigates with arrow keys', async () => {
      renderSvelte5Component(ProductGallery, {
        images: mockImages,
        title: 'Test Product',
        translations: mockTranslations
      });

      // Navigate right
      await fireEvent.keyDown(window, { key: 'ArrowRight' });
      await waitForSvelteUpdate();

      let mainImage = screen.getByAltText('Test Product - Image 2');
      expect(mainImage).toHaveAttribute('src', mockImages[1].image_url);

      // Navigate left
      await fireEvent.keyDown(window, { key: 'ArrowLeft' });
      await waitForSvelteUpdate();

      mainImage = screen.getByAltText('Test Product - Image 1');
      expect(mainImage).toHaveAttribute('src', mockImages[0].image_url);
    });

    it('does not navigate beyond boundaries with keyboard', async () => {
      renderSvelte5Component(ProductGallery, {
        images: mockImages,
        title: 'Test Product',
        translations: mockTranslations
      });

      // Try to navigate left from first image
      await fireEvent.keyDown(window, { key: 'ArrowLeft' });
      await waitForSvelteUpdate();

      const mainImage = screen.getByAltText('Test Product - Image 1');
      expect(mainImage).toHaveAttribute('src', mockImages[0].image_url);
    });

    it('exits zoom with Escape key', async () => {
      renderSvelte5Component(ProductGallery, {
        images: mockImages,
        title: 'Test Product',
        translations: mockTranslations
      });

      // Enter zoom mode
      const mainButton = screen.getByLabelText('Product image gallery - click to zoom');
      await userInteraction.click(mainButton);

      // Verify zoom indicator appears
      expect(screen.getByText(/Click to zoom out/)).toBeInTheDocument();

      // Exit zoom with Escape
      await fireEvent.keyDown(window, { key: 'Escape' });
      await waitForSvelteUpdate();

      // Zoom indicator should be gone
      expect(screen.queryByText(/Click to zoom out/)).not.toBeInTheDocument();
    });
  });

  describe('Touch/Swipe Navigation', () => {
    it('navigates on swipe gestures', async () => {
      renderSvelte5Component(ProductGallery, {
        images: mockImages,
        title: 'Test Product',
        translations: mockTranslations
      });

      const mainButton = screen.getByLabelText('Product image gallery - click to zoom');

      // Swipe left (should go to next image)
      await userInteraction.touchStart(mainButton, 100);
      await userInteraction.touchEnd(mainButton, 50);

      const mainImage = screen.getByAltText('Test Product - Image 2');
      expect(mainImage).toHaveAttribute('src', mockImages[1].image_url);
    });

    it('requires minimum swipe distance', async () => {
      renderSvelte5Component(ProductGallery, {
        images: mockImages,
        title: 'Test Product',
        translations: mockTranslations
      });

      const mainButton = screen.getByLabelText('Product image gallery - click to zoom');

      // Small swipe (should not navigate)
      await userInteraction.touchStart(mainButton, 100);
      await userInteraction.touchEnd(mainButton, 90);

      const mainImage = screen.getByAltText('Test Product - Image 1');
      expect(mainImage).toHaveAttribute('src', mockImages[0].image_url);
    });
  });

  describe('Zoom Functionality', () => {
    it('toggles zoom when main image is clicked', async () => {
      renderSvelte5Component(ProductGallery, {
        images: mockImages,
        title: 'Test Product',
        translations: mockTranslations
      });

      const mainButton = screen.getByLabelText('Product image gallery - click to zoom');
      
      // Click to zoom in
      await userInteraction.click(mainButton);

      expect(screen.getByText(/Click to zoom out/)).toBeInTheDocument();
      expect(mainButton).toHaveClass('cursor-zoom-out');

      // Click to zoom out
      await userInteraction.click(mainButton);

      expect(screen.queryByText(/Click to zoom out/)).not.toBeInTheDocument();
      expect(mainButton).toHaveClass('cursor-zoom-in');
    });

    it('applies zoom scaling to image', async () => {
      renderSvelte5Component(ProductGallery, {
        images: mockImages,
        title: 'Test Product',
        translations: mockTranslations
      });

      const mainButton = screen.getByLabelText('Product image gallery - click to zoom');
      const image = screen.getByAltText('Test Product - Image 1');

      // Initially not zoomed
      expect(image).toHaveClass('scale-100');

      // Click to zoom
      await userInteraction.click(mainButton);

      expect(image).toHaveClass('scale-150');
    });
  });

  describe('Thumbnail Navigation', () => {
    it('renders thumbnail strip for multiple images', () => {
      renderSvelte5Component(ProductGallery, {
        images: mockImages,
        title: 'Test Product',
        translations: mockTranslations
      });

      const thumbnails = screen.getAllByLabelText(/View image \d+/);
      expect(thumbnails).toHaveLength(3);
    });

    it('highlights selected thumbnail', () => {
      renderSvelte5Component(ProductGallery, {
        images: mockImages,
        title: 'Test Product',
        translations: mockTranslations
      });

      const firstThumbnail = screen.getByLabelText('View image 1');
      expect(firstThumbnail).toHaveClass('ring-white', 'scale-105');
    });

    it('navigates when thumbnail is clicked', async () => {
      renderSvelte5Component(ProductGallery, {
        images: mockImages,
        title: 'Test Product',
        translations: mockTranslations
      });

      const thirdThumbnail = screen.getByLabelText('View image 3');
      await userInteraction.click(thirdThumbnail);

      const mainImage = screen.getByAltText('Test Product - Image 3');
      expect(mainImage).toHaveAttribute('src', mockImages[2].image_url);
    });

    it('does not render thumbnail strip for single image', () => {
      const singleImage = [mockImages[0]];
      
      renderSvelte5Component(ProductGallery, {
        images: singleImage,
        title: 'Test Product',
        translations: mockTranslations
      });

      expect(screen.queryByLabelText(/View image \d+/)).not.toBeInTheDocument();
    });
  });

  describe('Condition Badge', () => {
    it('renders condition badge when condition provided', () => {
      renderSvelte5Component(ProductGallery, {
        images: mockImages,
        title: 'Test Product',
        condition: 'good',
        translations: mockTranslations
      });

      const conditionBadge = screen.getByText('Good condition');
      expect(conditionBadge).toBeInTheDocument();
      expect(conditionBadge).toHaveClass('bg-amber-500', 'text-white');
    });

    it('does not render condition badge when no condition provided', () => {
      renderSvelte5Component(ProductGallery, {
        images: mockImages,
        title: 'Test Product',
        translations: mockTranslations
      });

      expect(screen.queryByText(/condition/)).not.toBeInTheDocument();
    });

    it('renders different condition styles', () => {
      const conditions = [
        { value: 'new', label: 'New with tags', color: 'bg-emerald-500' },
        { value: 'like-new', label: 'Like new', color: 'bg-blue-500' },
        { value: 'good', label: 'Good condition', color: 'bg-amber-500' },
        { value: 'fair', label: 'Fair condition', color: 'bg-orange-500' }
      ];

      conditions.forEach(({ value, label, color }) => {
        const { unmount } = renderSvelte5Component(ProductGallery, {
          images: mockImages,
          title: 'Test Product',
          condition: value,
          translations: mockTranslations
        });

        const conditionBadge = screen.getByText(label);
        expect(conditionBadge).toHaveClass(color, 'text-white');

        unmount();
      });
    });
  });

  describe('Image Counter', () => {
    it('displays image counter for multiple images', () => {
      renderSvelte5Component(ProductGallery, {
        images: mockImages,
        title: 'Test Product',
        translations: mockTranslations
      });

      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });

    it('updates counter when navigating', async () => {
      renderSvelte5Component(ProductGallery, {
        images: mockImages,
        title: 'Test Product',
        translations: mockTranslations
      });

      const nextButton = screen.getByLabelText('Next image');
      await userInteraction.click(nextButton);

      expect(screen.getByText('2 / 3')).toBeInTheDocument();
    });

    it('does not display counter for single image', () => {
      const singleImage = [mockImages[0]];
      
      renderSvelte5Component(ProductGallery, {
        images: singleImage,
        title: 'Test Product',
        translations: mockTranslations
      });

      expect(screen.queryByText(/\d+ \/ \d+/)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      renderSvelte5Component(ProductGallery, {
        images: mockImages,
        title: 'Test Product',
        translations: mockTranslations
      });

      const mainButton = screen.getByLabelText('Product image gallery - click to zoom');
      expect(checkAccessibility.hasAriaLabel(mainButton)).toBe(true);

      if (screen.queryByLabelText('Next image')) {
        const nextButton = screen.getByLabelText('Next image');
        expect(checkAccessibility.hasAriaLabel(nextButton)).toBe(true);
      }
    });

    it('provides proper alt text for images', () => {
      renderSvelte5Component(ProductGallery, {
        images: mockImages,
        title: 'Test Product',
        translations: mockTranslations
      });

      const mainImage = screen.getByAltText('Test Product - Image 1');
      expect(mainImage).toBeInTheDocument();

      const thumbnails = screen.getAllByAltText(/Test Product thumbnail \d+/);
      expect(thumbnails).toHaveLength(3);
    });

    it('supports keyboard navigation', () => {
      renderSvelte5Component(ProductGallery, {
        images: mockImages,
        title: 'Test Product',
        translations: mockTranslations
      });

      const mainButton = screen.getByLabelText('Product image gallery - click to zoom');
      expect(checkAccessibility.isKeyboardAccessible(mainButton)).toBe(true);
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      renderSvelte5Component(ProductGallery, {
        images: mockImages,
        title: 'Test Product',
        class: 'custom-gallery-class',
        translations: mockTranslations
      });

      const gallery = screen.getByLabelText('Product image gallery - click to zoom').closest('div');
      expect(gallery).toHaveClass('custom-gallery-class');
    });
  });

  describe('Translation Support', () => {
    it('uses custom translation labels', () => {
      const customTranslations = {
        new: 'Nouveau',
        good: 'Bon état',
        likeNew: 'Comme neuf',
        fair: 'État correct'
      };

      renderSvelte5Component(ProductGallery, {
        images: mockImages,
        title: 'Test Product',
        condition: 'good',
        translations: customTranslations
      });

      expect(screen.getByText('Bon état')).toBeInTheDocument();
    });

    it('falls back to defaults when translations missing', () => {
      renderSvelte5Component(ProductGallery, {
        images: mockImages,
        title: 'Test Product',
        condition: 'good'
      });

      expect(screen.getByText('Good condition')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty images array gracefully', () => {
      renderSvelte5Component(ProductGallery, {
        images: [],
        title: 'Test Product',
        translations: mockTranslations
      });

      const mainImage = screen.getByAltText('Test Product - Image 1');
      expect(mainImage).toHaveAttribute('src', '/placeholder-product.svg');
    });

    it('handles null/undefined images', () => {
      renderSvelte5Component(ProductGallery, {
        images: undefined as any,
        title: 'Test Product',
        translations: mockTranslations
      });

      const mainImage = screen.getByAltText('Test Product - Image 1');
      expect(mainImage).toHaveAttribute('src', '/placeholder-product.svg');
    });

    it('handles mixed image formats', () => {
      const mixedImages = [
        'string-image.jpg',
        { image_url: 'object-image.jpg', alt_text: 'Object image' },
        'another-string.jpg'
      ];

      renderSvelte5Component(ProductGallery, {
        images: mixedImages as any,
        title: 'Test Product',
        translations: mockTranslations
      });

      const mainImage = screen.getByAltText('Test Product - Image 1');
      expect(mainImage).toHaveAttribute('src', 'string-image.jpg');
    });
  });
});