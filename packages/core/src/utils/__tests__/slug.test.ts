import { describe, it, expect } from 'vitest';
import {
  createSlug,
  isReservedSlug,
  validateSlug,
  generateCollisionSuffix,
  RESERVED_SLUGS
} from '../slug.js';

describe('Slug Utilities', () => {
  describe('createSlug', () => {
    it('should create a basic slug from text', () => {
      expect(createSlug('Hello World')).toBe('hello-world');
      expect(createSlug('Product Name')).toBe('product-name');
    });

    it('should handle special characters', () => {
      expect(createSlug('Hello! World?')).toBe('hello-world');
      expect(createSlug("Product's Name")).toBe('products-name');
      expect(createSlug('Test*+~.()')).toBe('test');
    });

    it('should convert to lowercase', () => {
      expect(createSlug('UPPERCASE TEXT')).toBe('uppercase-text');
      expect(createSlug('MixedCase')).toBe('mixedcase');
    });

    it('should handle multiple spaces and dashes', () => {
      expect(createSlug('Multiple   Spaces')).toBe('multiple-spaces');
      expect(createSlug('Multiple---Dashes')).toBe('multiple-dashes');
    });

    it('should trim leading and trailing dashes', () => {
      expect(createSlug('-leading')).toBe('leading');
      expect(createSlug('trailing-')).toBe('trailing');
      expect(createSlug('-both-')).toBe('both');
    });

    it('should respect maxLength option', () => {
      const longText = 'This is a very long product name that should be truncated';
      const slug = createSlug(longText, { maxLength: 20 });
      expect(slug.length).toBeLessThanOrEqual(20);
    });

    it('should handle empty or very short input', () => {
      const emptySlug = createSlug('');
      expect(emptySlug).toMatch(/^item-[a-z0-9]+$/);

      const shortSlug = createSlug('ab');
      expect(shortSlug).toMatch(/^item-[a-z0-9]+$/);
    });

    it('should handle unicode characters', () => {
      expect(createSlug('Café Latte')).toBe('cafe-latte');
      expect(createSlug('Naïve')).toBe('naive');
    });

    it('should handle numbers', () => {
      expect(createSlug('Product 123')).toBe('product-123');
      expect(createSlug('123 Start')).toBe('123-start');
    });
  });

  describe('isReservedSlug', () => {
    it('should identify reserved slugs', () => {
      expect(isReservedSlug('api')).toBe(true);
      expect(isReservedSlug('auth')).toBe(true);
      expect(isReservedSlug('login')).toBe(true);
      expect(isReservedSlug('admin')).toBe(true);
      expect(isReservedSlug('checkout')).toBe(true);
    });

    it('should be case-insensitive', () => {
      expect(isReservedSlug('API')).toBe(true);
      expect(isReservedSlug('Auth')).toBe(true);
      expect(isReservedSlug('LOGIN')).toBe(true);
    });

    it('should allow non-reserved slugs', () => {
      expect(isReservedSlug('nike-shoes')).toBe(false);
      expect(isReservedSlug('vintage-jacket')).toBe(false);
      expect(isReservedSlug('custom-product')).toBe(false);
    });

    it('should check additional reserved words', () => {
      expect(isReservedSlug('custom-word', ['custom-word'])).toBe(true);
      expect(isReservedSlug('allowed-word', ['custom-word'])).toBe(false);
    });

    it('should have expected reserved slugs in the set', () => {
      const expectedReserved = [
        'api', 'auth', 'category', 'search', 'signup', 'login',
        'logout', 'profile', 'wishlist', 'checkout', 'terms',
        'privacy', 'admin', 'dashboard', 'sell', 'about', 'help'
      ];

      expectedReserved.forEach(slug => {
        expect(RESERVED_SLUGS.has(slug)).toBe(true);
      });
    });
  });

  describe('validateSlug', () => {
    it('should validate correct slugs', () => {
      const result = validateSlug('valid-slug-123');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject slugs that are too short', () => {
      const result = validateSlug('ab');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Slug must be at least 3 characters long');
    });

    it('should reject slugs that are too long', () => {
      const longSlug = 'a'.repeat(101);
      const result = validateSlug(longSlug);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Slug must be less than 100 characters long');
    });

    it('should reject slugs with invalid characters', () => {
      const result = validateSlug('Invalid_Slug!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Slug can only contain lowercase letters, numbers, and hyphens');
    });

    it('should reject slugs starting or ending with hyphen', () => {
      const leadingResult = validateSlug('-leading-hyphen');
      expect(leadingResult.valid).toBe(false);
      expect(leadingResult.errors).toContain('Slug cannot start or end with a hyphen');

      const trailingResult = validateSlug('trailing-hyphen-');
      expect(trailingResult.valid).toBe(false);
      expect(trailingResult.errors).toContain('Slug cannot start or end with a hyphen');
    });

    it('should reject slugs with consecutive hyphens', () => {
      const result = validateSlug('double--hyphen');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Slug cannot contain consecutive hyphens');
    });

    it('should reject reserved slugs', () => {
      const result = validateSlug('api');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Slug is reserved and cannot be used');
    });

    it('should allow reserved slugs when allowReserved is true', () => {
      const result = validateSlug('api', [], true);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should check additional reserved words', () => {
      const result = validateSlug('my-custom-word', ['my-custom-word']);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Slug is reserved and cannot be used');
    });

    it('should collect multiple errors', () => {
      const result = validateSlug('A-');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('generateCollisionSuffix', () => {
    it('should generate a suffix of correct length', () => {
      const suffix = generateCollisionSuffix(6);
      expect(suffix).toHaveLength(6);
    });

    it('should generate different suffixes each time', () => {
      const suffix1 = generateCollisionSuffix();
      const suffix2 = generateCollisionSuffix();
      expect(suffix1).not.toBe(suffix2);
    });

    it('should only contain allowed characters', () => {
      const suffix = generateCollisionSuffix(10);
      expect(suffix).toMatch(/^[0-9a-z]+$/);
    });

    it('should respect custom length parameter', () => {
      expect(generateCollisionSuffix(4)).toHaveLength(4);
      expect(generateCollisionSuffix(8)).toHaveLength(8);
      expect(generateCollisionSuffix(12)).toHaveLength(12);
    });
  });

  describe('RESERVED_SLUGS', () => {
    it('should be a Set', () => {
      expect(RESERVED_SLUGS).toBeInstanceOf(Set);
    });

    it('should contain short/ambiguous slugs', () => {
      const shortSlugs = ['a', 'an', 'the', 'and', 'or', 'new', 'hot', 'top'];
      shortSlugs.forEach(slug => {
        expect(RESERVED_SLUGS.has(slug)).toBe(true);
      });
    });

    it('should contain system paths', () => {
      const systemPaths = ['www', 'mail', 'ftp', 'test', 'staging', 'dev'];
      systemPaths.forEach(slug => {
        expect(RESERVED_SLUGS.has(slug)).toBe(true);
      });
    });
  });
});
