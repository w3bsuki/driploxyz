import { describe, it, expect } from 'vitest';
import { 
  calculateBuyerProtectionFee, 
  calculateTotalPrice,
  BUYER_PROTECTION_RATE,
  BUYER_PROTECTION_FIXED
} from '../price';

describe('Price Utilities', () => {
  describe('constants', () => {
    it('should have correct buyer protection rate', () => {
      expect(BUYER_PROTECTION_RATE).toBe(0.05);
    });

    it('should have correct fixed fee', () => {
      expect(BUYER_PROTECTION_FIXED).toBe(0.70);
    });
  });

  describe('calculateBuyerProtectionFee', () => {
    it('should calculate fee for standard price', () => {
      // 5% of 10 = 0.50 + 0.70 fixed = 1.20
      expect(calculateBuyerProtectionFee(10)).toBe(1.20);
    });

    it('should calculate fee for higher price', () => {
      // 5% of 100 = 5 + 0.70 fixed = 5.70
      expect(calculateBuyerProtectionFee(100)).toBe(5.70);
    });

    it('should handle zero price', () => {
      // 5% of 0 = 0 + 0.70 fixed = 0.70
      expect(calculateBuyerProtectionFee(0)).toBe(0.70);
    });

    it('should handle decimal prices', () => {
      // 5% of 25.99 = 1.2995 + 0.70 = 1.9995
      const result = calculateBuyerProtectionFee(25.99);
      expect(result).toBeCloseTo(1.9995, 4);
    });

    it('should handle large prices', () => {
      // 5% of 1000 = 50 + 0.70 = 50.70
      expect(calculateBuyerProtectionFee(1000)).toBe(50.70);
    });

    it('should handle very small prices', () => {
      // 5% of 1 = 0.05 + 0.70 = 0.75
      expect(calculateBuyerProtectionFee(1)).toBe(0.75);
    });

    it('should handle fractional cent prices', () => {
      // 5% of 0.01 = 0.0005 + 0.70 = 0.7005
      expect(calculateBuyerProtectionFee(0.01)).toBeCloseTo(0.7005, 4);
    });
  });

  describe('calculateTotalPrice', () => {
    it('should calculate total with buyer protection', () => {
      // 10 + (5% of 10 + 0.70) = 10 + 1.20 = 11.20
      expect(calculateTotalPrice(10)).toBe(11.20);
    });

    it('should calculate total for higher price', () => {
      // 100 + 5.70 = 105.70
      expect(calculateTotalPrice(100)).toBe(105.70);
    });

    it('should handle zero price', () => {
      // 0 + 0.70 = 0.70
      expect(calculateTotalPrice(0)).toBe(0.70);
    });

    it('should handle decimal prices', () => {
      // 25.99 + 1.9995 = 27.9895
      const result = calculateTotalPrice(25.99);
      expect(result).toBeCloseTo(27.9895, 4);
    });

    it('should handle large prices', () => {
      // 1000 + 50.70 = 1050.70
      expect(calculateTotalPrice(1000)).toBe(1050.70);
    });

    it('should handle common marketplace prices', () => {
      // 49.99 + (5% of 49.99 + 0.70) = 49.99 + 2.4995 + 0.70 = 53.1895
      const result = calculateTotalPrice(49.99);
      expect(result).toBeCloseTo(53.1895, 4);
    });
  });

  describe('fee calculation consistency', () => {
    it('should maintain relationship between fee and total', () => {
      const price = 75;
      const fee = calculateBuyerProtectionFee(price);
      const total = calculateTotalPrice(price);
      
      expect(total).toBe(price + fee);
    });

    it('should maintain relationship for various prices', () => {
      const prices = [0, 1, 10, 25, 50, 100, 500, 1000];
      
      prices.forEach(price => {
        const fee = calculateBuyerProtectionFee(price);
        const total = calculateTotalPrice(price);
        expect(total).toBeCloseTo(price + fee, 10);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle negative prices gracefully', () => {
      // Technically should not happen, but test behavior
      const result = calculateBuyerProtectionFee(-10);
      // 5% of -10 = -0.50 + 0.70 = 0.20
      expect(result).toBeCloseTo(0.20, 10);
    });

    it('should handle very large prices', () => {
      const result = calculateTotalPrice(10000);
      // 10000 + (500 + 0.70) = 10500.70
      expect(result).toBe(10500.70);
    });
  });
});
