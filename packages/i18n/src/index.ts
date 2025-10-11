// Re-export all Paraglide-generated message functions
// Following Paraglide v2 + SvelteKit 2 best practices
export * from './paraglide/messages.js';

// Re-export Paraglide runtime functions
export * from './paraglide/runtime.js';

// Legacy custom runtime (kept for backward compatibility)
import {
  LOCALE_ALIASES,
  applyLocale,
  baseLocale,
  detectLanguage,
  detectLocale,
  getLocale as customGetLocale,
  getMessage,
  isLocale as customIsLocale,
  languageNames,
  locales as customLocales,
  setLocale as customSetLocale
} from './runtime';

export type { Locale, MessageFunction, MessageInputs, MessageOptions } from './runtime';

// Export legacy custom functions (may be used in existing code)
export {
  LOCALE_ALIASES,
  applyLocale,
  baseLocale,
  detectLanguage,
  detectLocale,
  getMessage,
  languageNames
};

// Aliases for compatibility
export const languageTag = customGetLocale;
export const setLanguageTag = customSetLocale;
export const availableLanguageTags = customLocales;
export const isAvailableLanguageTag = customIsLocale;
