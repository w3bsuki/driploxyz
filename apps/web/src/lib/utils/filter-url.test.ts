/**
 * Tests for filter URL canonicalization utilities
 */

import { describe, it, expect } from 'vitest';
import { canonicalizeFilterUrl, buildCanonicalUrl } from './filter-url';

describe('Filter URL utilities', () => {
  describe('canonicalizeFilterUrl', () => {
    it('returns original params when no legacy parameters are present', () => {
      const url = new URL('https://example.com/search?category=women&q=dress');
      const result = canonicalizeFilterUrl(url);
      
      expect(result.needsRedirect).toBe(false);
      expect(result.canonical.get('category')).toBe('women');
      expect(result.canonical.get('q')).toBe('dress');
    });
    
    it('maps legacy level1 to canonical category', () => {
      const url = new URL('https://example.com/search?level1=women');
      const result = canonicalizeFilterUrl(url);
      
      expect(result.needsRedirect).toBe(true);
      expect(result.canonical.get('category')).toBe('women');
      expect(result.canonical.has('level1')).toBe(false);
    });
    
    it('maps legacy level2 to canonical subcategory', () => {
      const url = new URL('https://example.com/search?level2=clothing');
      const result = canonicalizeFilterUrl(url);
      
      expect(result.needsRedirect).toBe(true);
      expect(result.canonical.get('subcategory')).toBe('clothing');
      expect(result.canonical.has('level2')).toBe(false);
    });
    
    it('maps legacy level3 to canonical specific', () => {
      const url = new URL('https://example.com/search?level3=t-shirts');
      const result = canonicalizeFilterUrl(url);
      
      expect(result.needsRedirect).toBe(true);
      expect(result.canonical.get('specific')).toBe('t-shirts');
      expect(result.canonical.has('level3')).toBe(false);
    });
    
    it('maps all legacy parameters simultaneously', () => {
      const url = new URL('https://example.com/search?level1=women&level2=clothing&level3=t-shirts&q=dress');
      const result = canonicalizeFilterUrl(url);
      
      expect(result.needsRedirect).toBe(true);
      expect(result.canonical.get('category')).toBe('women');
      expect(result.canonical.get('subcategory')).toBe('clothing');
      expect(result.canonical.get('specific')).toBe('t-shirts');
      expect(result.canonical.get('q')).toBe('dress');
      
      // Legacy params should be removed
      expect(result.canonical.has('level1')).toBe(false);
      expect(result.canonical.has('level2')).toBe(false);
      expect(result.canonical.has('level3')).toBe(false);
    });
    
    it('canonical parameters take precedence over legacy when both present', () => {
      const url = new URL('https://example.com/search?level1=men&category=women');
      const result = canonicalizeFilterUrl(url);
      
      expect(result.needsRedirect).toBe(true);
      expect(result.canonical.get('category')).toBe('women'); // Canonical wins
      expect(result.canonical.has('level1')).toBe(false);
    });
    
    it('preserves non-filter parameters during canonicalization', () => {
      const url = new URL('https://example.com/search?level1=women&sort=price-low&page=2&min_price=10');
      const result = canonicalizeFilterUrl(url);
      
      expect(result.needsRedirect).toBe(true);
      expect(result.canonical.get('category')).toBe('women');
      expect(result.canonical.get('sort')).toBe('price-low');
      expect(result.canonical.get('page')).toBe('2');
      expect(result.canonical.get('min_price')).toBe('10');
    });
    
    it('handles mixed legacy and canonical with complex query', () => {
      const url = new URL('https://example.com/search?level1=women&subcategory=shoes&level3=boots&brand=nike&q=running');
      const result = canonicalizeFilterUrl(url);
      
      expect(result.needsRedirect).toBe(true);
      expect(result.canonical.get('category')).toBe('women');
      expect(result.canonical.get('subcategory')).toBe('shoes'); // Canonical preserved
      expect(result.canonical.get('specific')).toBe('boots');
      expect(result.canonical.get('brand')).toBe('nike');
      expect(result.canonical.get('q')).toBe('running');
    });
    
    it('handles empty legacy parameter values', () => {
      const url = new URL('https://example.com/search?level1=&level2=clothing');
      const result = canonicalizeFilterUrl(url);
      
      expect(result.needsRedirect).toBe(true);
      expect(result.canonical.get('category')).toBe(''); // Empty value mapped
      expect(result.canonical.get('subcategory')).toBe('clothing');
    });
  });
  
  describe('buildCanonicalUrl', () => {
    it('builds canonical URL with new parameters', () => {
      const originalUrl = new URL('https://example.com/search?level1=women');
      const canonicalParams = new URLSearchParams('category=women&q=dress');
      
      const result = buildCanonicalUrl(originalUrl, canonicalParams);
      
      expect(result).toBe('https://example.com/search?category=women&q=dress');
    });
    
    it('preserves original URL pathname and host', () => {
      const originalUrl = new URL('https://driplo.com/search?level1=men');
      const canonicalParams = new URLSearchParams('category=men');
      
      const result = buildCanonicalUrl(originalUrl, canonicalParams);
      
      expect(result).toBe('https://driplo.com/search?category=men');
    });
    
    it('handles empty parameters correctly', () => {
      const originalUrl = new URL('https://example.com/search?level1=women');
      const canonicalParams = new URLSearchParams('');
      
      const result = buildCanonicalUrl(originalUrl, canonicalParams);
      
      expect(result).toBe('https://example.com/search');
    });
  });
});