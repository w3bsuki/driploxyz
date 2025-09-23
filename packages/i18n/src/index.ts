// Paraglide v2+ zero-bundle i18n
// Proper tree-shaking approach: export * allows Vite to tree-shake unused messages

/// <reference path='./paraglide.d.ts' />
/// <reference path='./generated-messages.d.ts' />

// Export all message functions - Vite automatically tree-shakes unused ones
export * from '../lib/paraglide/messages.js';

// Type definitions
export type Locale = 'en' | 'bg';
export type LanguageTag = Locale; // Compatibility alias

// Re-export Paraglide runtime functions directly - let Paraglide handle locale detection
// During packaging/build, runtime is emitted to lib/paraglide/runtime.js.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export { setLocale, getLocale, isLocale, locales, baseLocale } from '../lib/paraglide/runtime.js';

// Local bindings for internal use
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { locales as runtimeLocales, setLocale as runtimeSetLocale } from '../lib/paraglide/runtime.js';

// Compatibility aliases for existing API
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export { getLocale as languageTag } from '../lib/paraglide/runtime.js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export { setLocale as setLanguageTag } from '../lib/paraglide/runtime.js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export { locales as availableLanguageTags } from '../lib/paraglide/runtime.js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export { isLocale as isAvailableLanguageTag } from '../lib/paraglide/runtime.js';

// Helper constants
export const languageNames: Record<Locale, string> = {
  en: 'English',
  bg: 'Български'
};

// Language detection utility
export function detectLanguage(acceptLanguage?: string): Locale {
  if (!acceptLanguage) return 'en';
  const langs = acceptLanguage.toLowerCase();
  if (langs.includes('bg')) return 'bg';
  return 'en';
}

// Shared server helpers for SSR parity
export const LOCALE_ALIASES: Record<string, Locale> = { uk: 'en' };

export function detectLocale(input: {
  path?: string;
  query?: URLSearchParams | null;
  cookie?: string | null;
  header?: string | null;
  defaultLocale?: Locale;
}): Locale {
  const fallback: Locale = input.defaultLocale ?? 'bg';

  // Path: /^\/(en|uk|bg)(\/|$)/
  if (input.path) {
    const match = input.path.match(/^\/(en|uk|bg)(\/|$)/);
    if (match && match[1]) {
      const mapped = LOCALE_ALIASES[match[1]] ?? (match[1] as Locale);
      if ((runtimeLocales as readonly string[]).includes(mapped)) return mapped as Locale;
    }
  }

  // Query param
  if (input.query) {
    const q = input.query.get('locale');
    if (q && (runtimeLocales as readonly string[]).includes(q)) return q as Locale;
  }

  // Cookie
  if (input.cookie && (runtimeLocales as readonly string[]).includes(input.cookie)) {
    return input.cookie as Locale;
  }

  // Accept-Language header
  if (input.header) {
    const browserLang = input.header.split(',')[0]?.split('-')[0]?.toLowerCase();
    if (browserLang && (runtimeLocales as readonly string[]).includes(browserLang)) {
      return browserLang as Locale;
    }
  }

  return fallback;
}

export function applyLocale(locale: Locale) {
  // Only sets runtime locale; caller should handle cookies and <html lang>
  if ((runtimeLocales as readonly string[]).includes(locale)) {
    runtimeSetLocale(locale);
  }
}
