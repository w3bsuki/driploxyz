// Re-export all Paraglide message functions
export * from './paraglide/messages/_index.js';

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
} from './runtime.js';

export type { Locale, MessageFunction, MessageInputs, MessageOptions } from './runtime.js';

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
