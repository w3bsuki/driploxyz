import { describe, it, expect } from 'vitest';
import { formatCurrency, formatNumber, formatBytes } from '../format';

describe('Format Utilities', () => {
  describe('formatCurrency', () => {
    it('should format currency with default euro symbol', () => {
      expect(formatCurrency(10)).toBe('€10.00');
      expect(formatCurrency(99.99)).toBe('€99.99');
    });

    it('should format currency with custom symbol', () => {
      expect(formatCurrency(10, '$')).toBe('$10.00');
      expect(formatCurrency(10, '£')).toBe('£10.00');
      expect(formatCurrency(10, '¥')).toBe('¥10.00');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('€0.00');
    });

    it('should round to 2 decimal places', () => {
      expect(formatCurrency(10.999)).toBe('€11.00');
      expect(formatCurrency(10.001)).toBe('€10.00');
      expect(formatCurrency(10.005)).toBe('€10.01'); // JS rounding
    });

    it('should handle large numbers', () => {
      expect(formatCurrency(1000000)).toBe('€1000000.00');
    });

    it('should handle negative numbers', () => {
      expect(formatCurrency(-10)).toBe('€-10.00');
    });

    it('should handle small decimal numbers', () => {
      expect(formatCurrency(0.01)).toBe('€0.01');
      expect(formatCurrency(0.99)).toBe('€0.99');
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with locale separators', () => {
      // Results depend on locale, but should include separators
      const result = formatNumber(1000);
      expect(result).toMatch(/1[,.]?000/);
    });

    it('should format large numbers', () => {
      const result = formatNumber(1000000);
      expect(result).toMatch(/1[,.]?000[,.]?000/);
    });

    it('should handle small numbers without separators', () => {
      expect(formatNumber(123)).toBe('123');
    });

    it('should handle zero', () => {
      expect(formatNumber(0)).toBe('0');
    });

    it('should handle negative numbers', () => {
      const result = formatNumber(-1000);
      expect(result).toContain('-');
      expect(result).toMatch(/-?1[,.]?000/);
    });

    it('should handle decimal numbers', () => {
      const result = formatNumber(1234.56);
      expect(result).toContain('1');
      expect(result).toContain('234');
    });
  });

  describe('formatBytes', () => {
    it('should format bytes', () => {
      expect(formatBytes(0)).toBe('0.00 B');
      expect(formatBytes(500)).toBe('500.00 B');
      expect(formatBytes(1023)).toBe('1023.00 B');
    });

    it('should format kilobytes', () => {
      expect(formatBytes(1024)).toBe('1.00 KB');
      expect(formatBytes(1536)).toBe('1.50 KB');
      expect(formatBytes(10240)).toBe('10.00 KB');
    });

    it('should format megabytes', () => {
      expect(formatBytes(1024 * 1024)).toBe('1.00 MB');
      expect(formatBytes(1024 * 1024 * 5)).toBe('5.00 MB');
      expect(formatBytes(1024 * 1024 * 2.5)).toBe('2.50 MB');
    });

    it('should format gigabytes', () => {
      expect(formatBytes(1024 * 1024 * 1024)).toBe('1.00 GB');
      expect(formatBytes(1024 * 1024 * 1024 * 10)).toBe('10.00 GB');
    });

    it('should handle edge cases', () => {
      // Just under 1KB
      expect(formatBytes(1023)).toBe('1023.00 B');
      
      // Exactly 1KB
      expect(formatBytes(1024)).toBe('1.00 KB');
      
      // Just over 1KB
      expect(formatBytes(1025)).toMatch(/1\.\d+ KB/);
    });

    it('should handle fractional bytes correctly', () => {
      const result = formatBytes(1500);
      expect(result).toBe('1.46 KB');
    });

    it('should handle very large files', () => {
      // 1TB should still show as GB (max unit is GB)
      const result = formatBytes(1024 * 1024 * 1024 * 1024);
      expect(result).toBe('1024.00 GB');
    });
  });
});
