/**
 * Tests for navigation utilities
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { scrollToTop, scrollIntoView, focusWithAnnouncement } from './navigation';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false, // Default: user does not prefer reduced motion
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
});

describe('Navigation utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('scrollToTop', () => {
    it('uses smooth scroll when user does not prefer reduced motion', () => {
      // Setup: user does not prefer reduced motion
      window.matchMedia = vi.fn().mockReturnValue({ matches: false });
      
      scrollToTop();
      
      expect(window.scrollTo).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth'
      });
    });

    it('uses auto scroll when user prefers reduced motion', () => {
      // Setup: user prefers reduced motion
      window.matchMedia = vi.fn().mockReturnValue({ matches: true });
      
      scrollToTop();
      
      expect(window.scrollTo).toHaveBeenCalledWith({
        top: 0,
        behavior: 'auto'
      });
    });

    it('scrolls container element when provided', () => {
      const mockContainer = {
        scrollTo: vi.fn(),
        scrollTop: 0
      } as any;

      // User does not prefer reduced motion
      window.matchMedia = vi.fn().mockReturnValue({ matches: false });
      
      scrollToTop(mockContainer);
      
      expect(mockContainer.scrollTo).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth'
      });
      expect(window.scrollTo).not.toHaveBeenCalled();
    });

    it('sets scrollTop directly when container and reduced motion', () => {
      const mockContainer = {
        scrollTop: 100
      } as any;

      // User prefers reduced motion
      window.matchMedia = vi.fn().mockReturnValue({ matches: true });
      
      scrollToTop(mockContainer);
      
      expect(mockContainer.scrollTop).toBe(0);
    });
  });

  describe('scrollIntoView', () => {
    it('scrolls element into view with smooth behavior by default', () => {
      const mockElement = {
        scrollIntoView: vi.fn()
      } as any;

      // User does not prefer reduced motion
      window.matchMedia = vi.fn().mockReturnValue({ matches: false });
      
      scrollIntoView(mockElement);
      
      expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    });

    it('uses auto behavior when user prefers reduced motion', () => {
      const mockElement = {
        scrollIntoView: vi.fn()
      } as any;

      // User prefers reduced motion
      window.matchMedia = vi.fn().mockReturnValue({ matches: true });
      
      scrollIntoView(mockElement);
      
      expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'auto',
        block: 'start',
        inline: 'nearest'
      });
    });

    it('focuses element when focus option is true', async () => {
      const mockElement = {
        scrollIntoView: vi.fn(),
        focus: vi.fn()
      } as any;

      // User does not prefer reduced motion
      window.matchMedia = vi.fn().mockReturnValue({ matches: false });
      
      scrollIntoView(mockElement, { focus: true });
      
      expect(mockElement.scrollIntoView).toHaveBeenCalled();
      
      // Focus should be called after timeout
      await new Promise(resolve => {
        setTimeout(() => {
          expect(mockElement.focus).toHaveBeenCalledWith({ preventScroll: true });
          resolve(undefined);
        }, 350);
      });
    });
  });

  describe('focusWithAnnouncement', () => {
    it('focuses element', () => {
      const mockElement = {
        focus: vi.fn()
      } as any;
      
      focusWithAnnouncement(mockElement);
      
      expect(mockElement.focus).toHaveBeenCalledWith({ preventScroll: false });
    });

    it('creates live region for announcement', async () => {
      const mockElement = {
        focus: vi.fn()
      } as any;

      // Mock document methods
      const mockLiveRegion = {
        setAttribute: vi.fn(),
        textContent: '',
        className: ''
      };
      
      document.createElement = vi.fn().mockReturnValue(mockLiveRegion);
      document.body.appendChild = vi.fn();
      document.body.removeChild = vi.fn();
      
      focusWithAnnouncement(mockElement, 'Test announcement');
      
      expect(document.createElement).toHaveBeenCalledWith('div');
      expect(mockLiveRegion.setAttribute).toHaveBeenCalledWith('aria-live', 'polite');
      expect(mockLiveRegion.setAttribute).toHaveBeenCalledWith('aria-atomic', 'true');
      expect(mockLiveRegion.className).toBe('sr-only');
      expect(mockLiveRegion.textContent).toBe('Test announcement');
      expect(document.body.appendChild).toHaveBeenCalledWith(mockLiveRegion);
      
      // Check cleanup after timeout
      await new Promise(resolve => {
        setTimeout(() => {
          expect(document.body.removeChild).toHaveBeenCalledWith(mockLiveRegion);
          resolve(undefined);
        }, 1100);
      });
    });
  });
});