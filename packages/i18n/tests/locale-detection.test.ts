import { describe, it, expect } from 'vitest';
import { detectLocale, detectLanguage, LOCALE_ALIASES, languageNames, getLocale, setLocale } from '../src/runtime';

describe('Locale Detection', () => {
  describe('detectLanguage', () => {
    it('should detect Bulgarian language from Accept-Language header', () => {
      expect(detectLanguage('bg-BG,bg;q=0.9,en;q=0.8')).toBe('bg');
    });

    it('should detect English language from Accept-Language header', () => {
      expect(detectLanguage('en-US,en;q=0.9')).toBe('en');
    });

    it('should fallback to base locale for unsupported languages', () => {
      expect(detectLanguage('fr-FR,fr;q=0.9')).toBe('en');
    });

    it('should handle null header', () => {
      expect(detectLanguage(null)).toBe('en');
    });

    it('should handle undefined header', () => {
      expect(detectLanguage(undefined)).toBe('en');
    });
  });

  describe('detectLocale', () => {
    it('should detect locale from URL path', () => {
      expect(detectLocale({ path: '/en/home' })).toBe('en');
      expect(detectLocale({ path: '/bg/home' })).toBe('bg');
      expect(detectLocale({ path: '/uk/home' })).toBe('en'); // UK alias maps to en
    });

    it('should detect locale from query parameter', () => {
      expect(detectLocale({
        query: new URLSearchParams('locale=en')
      })).toBe('en');

      expect(detectLocale({
        query: new URLSearchParams('locale=bg')
      })).toBe('bg');
    });

    it('should detect locale from cookie', () => {
      expect(detectLocale({ cookie: 'en' })).toBe('en');
      expect(detectLocale({ cookie: 'bg' })).toBe('bg');
    });

    it('should detect locale from Accept-Language header', () => {
      expect(detectLocale({
        header: 'bg-BG,bg;q=0.9,en;q=0.8'
      })).toBe('bg');
    });

    it('should use correct priority: path > query > cookie > header > default', () => {
      // Path should take precedence
      expect(detectLocale({
        path: '/en/home',
        query: new URLSearchParams('locale=bg'),
        cookie: 'bg',
        header: 'bg-BG'
      })).toBe('en');

      // Query should take precedence over cookie/header
      expect(detectLocale({
        query: new URLSearchParams('locale=en'),
        cookie: 'bg',
        header: 'bg-BG'
      })).toBe('en');

      // Cookie should take precedence over header
      expect(detectLocale({
        cookie: 'en',
        header: 'bg-BG'
      })).toBe('en');
    });

    it('should fallback to default locale', () => {
      expect(detectLocale({
        path: '/unknown',
        query: null,
        cookie: null,
        header: 'unknown-language'
      })).toBe('bg'); // default locale
    });
  });

  describe('Locale Aliases', () => {
    it('should map UK to English', () => {
      expect(LOCALE_ALIASES.uk).toBe('en');
    });

    it('should handle alias mapping in path detection', () => {
      expect(detectLocale({ path: '/uk/home' })).toBe('en');
    });
  });

  describe('Language Names', () => {
    it('should return correct language names', () => {
      expect(languageNames.en).toBe('English');
      expect(languageNames.bg).toBe('Български');
    });
  });

  describe('Locale Management', () => {
    it('should get and set locale', () => {
      const originalLocale = getLocale();
      setLocale('en');
      expect(getLocale()).toBe('en');
      setLocale(originalLocale);
    });

    it('should handle invalid locale setting', () => {
      const originalLocale = getLocale();
      setLocale('invalid' as never);
      expect(getLocale()).toBe('bg'); // Should fallback to default
      setLocale(originalLocale);
    });
  });
});