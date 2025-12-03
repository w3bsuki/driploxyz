import { describe, it, expect, vi, beforeEach } from 'vitest';
import { formatPrice, formatPriceRange, parsePrice } from '../price';

// Mock the i18n module
vi.mock('@repo/i18n', () => ({
  getLocale: vi.fn(() => 'en')
}));

import * as i18n from '@repo/i18n';

describe('Price Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('formatPrice', () => {
    describe('English locale (USD)', () => {
      beforeEach(() => {
        vi.mocked(i18n.getLocale).mockReturnValue('en');
      });

      it('should format whole numbers without decimals', () => {
        const result = formatPrice(10, 'en');
        expect(result).toMatch(/\$10|\$10\.00/);
      });

      it('should format decimal prices with 2 decimal places', () => {
        const result = formatPrice(10.99, 'en');
        expect(result).toContain('10.99');
        expect(result).toContain('$');
      });

      it('should handle zero price', () => {
        const result = formatPrice(0, 'en');
        expect(result).toMatch(/\$0|\$0\.00/);
      });

      it('should handle large numbers', () => {
        const result = formatPrice(1000000, 'en');
        expect(result).toContain('$');
        expect(result).toMatch(/1[,]?000[,]?000/);
      });

      it('should handle prices with many decimal places', () => {
        const result = formatPrice(10.999, 'en');
        // Should round to 2 decimal places
        expect(result).toContain('11');
      });
    });

    describe('Bulgarian locale (BGN)', () => {
      beforeEach(() => {
        vi.mocked(i18n.getLocale).mockReturnValue('bg');
      });

      it('should format prices in Bulgarian format', () => {
        const result = formatPrice(10, 'bg');
        expect(result).toBe('10лв');
      });

      it('should format decimal prices in Bulgarian format', () => {
        const result = formatPrice(10.99, 'bg');
        expect(result).toBe('10.99лв');
      });

      it('should handle zero price in Bulgarian format', () => {
        const result = formatPrice(0, 'bg');
        expect(result).toBe('0лв');
      });

      it('should handle whole numbers without unnecessary decimals', () => {
        const result = formatPrice(50, 'bg');
        expect(result).toBe('50лв');
        expect(result).not.toContain('.00');
      });
    });

    describe('Default locale handling', () => {
      it('should use current locale when not specified', () => {
        vi.mocked(i18n.getLocale).mockReturnValue('en');
        const result = formatPrice(25);
        expect(result).toContain('$');
      });

      it('should fallback to USD for unknown locales', () => {
        vi.mocked(i18n.getLocale).mockReturnValue('unknown' as any);
        const result = formatPrice(25);
        // Should use fallback USD formatting
        expect(result).toContain('$') || expect(result).toMatch(/25/);
      });
    });

    describe('Edge cases', () => {
      it('should handle negative prices', () => {
        const result = formatPrice(-10, 'en');
        expect(result).toContain('-');
        expect(result).toContain('10');
      });

      it('should handle very small decimal prices', () => {
        const result = formatPrice(0.01, 'en');
        expect(result).toContain('0.01');
      });

      it('should handle very large prices', () => {
        const result = formatPrice(999999.99, 'en');
        expect(result).toContain('999');
      });
    });
  });

  describe('formatPriceRange', () => {
    it('should format a price range correctly in English', () => {
      const result = formatPriceRange(10, 50, 'en');
      expect(result).toContain('$');
      expect(result).toContain('-');
    });

    it('should format a price range correctly in Bulgarian', () => {
      const result = formatPriceRange(10, 50, 'bg');
      expect(result).toContain('лв');
      expect(result).toContain('-');
      expect(result).toContain('10');
      expect(result).toContain('50');
    });

    it('should handle same min and max price', () => {
      const result = formatPriceRange(25, 25, 'en');
      expect(result.match(/\$/g)?.length).toBe(2); // Should have two currency symbols
    });

    it('should handle zero to non-zero range', () => {
      const result = formatPriceRange(0, 100, 'en');
      expect(result).toContain('$');
      expect(result).toContain('100');
    });

    it('should handle decimal price ranges', () => {
      const result = formatPriceRange(9.99, 29.99, 'en');
      expect(result).toContain('9.99');
      expect(result).toContain('29.99');
    });
  });

  describe('parsePrice', () => {
    it('should parse USD formatted prices', () => {
      expect(parsePrice('$10.00')).toBe(10);
      expect(parsePrice('$99.99')).toBe(99.99);
      expect(parsePrice('$1,000.00')).toBe(1000);
    });

    it('should parse BGN formatted prices', () => {
      expect(parsePrice('10лв')).toBe(10);
      expect(parsePrice('99.99лв')).toBe(99.99);
    });

    it('should handle prices without currency symbols', () => {
      expect(parsePrice('50')).toBe(50);
      expect(parsePrice('25.99')).toBe(25.99);
    });

    it('should handle prices with spaces', () => {
      expect(parsePrice('$ 10.00')).toBe(10);
      expect(parsePrice('10.00 лв')).toBe(10);
    });

    it('should return 0 for invalid input', () => {
      expect(parsePrice('')).toBe(0);
      expect(parsePrice('not a price')).toBe(0);
      expect(parsePrice('abc')).toBe(0);
    });

    it('should handle prices with thousand separators', () => {
      expect(parsePrice('$1,234.56')).toBe(1234.56);
      expect(parsePrice('$10,000')).toBe(10000);
    });

    it('should extract first valid number from complex strings', () => {
      expect(parsePrice('Price: $25')).toBe(25);
    });

    it('should handle integer prices', () => {
      expect(parsePrice('$100')).toBe(100);
      expect(parsePrice('50лв')).toBe(50);
    });
  });
});
