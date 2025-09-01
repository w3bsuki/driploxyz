// Re-export generated Paraglide functions from lib (built files)
export * from '../lib/paraglide/messages.js';
export * from '../lib/paraglide/runtime.js';

// Export TypeScript definitions for generated functions are handled by .d.ts files

// Type definitions
export type LanguageTag = 'en' | 'bg';

// Helper constants
export const languageNames: Record<LanguageTag, string> = {
  en: 'English',
  bg: 'Български'
};

// Export Paraglide 2.x functions with aliases for compatibility  
export { 
  setLocale,
  getLocale,
  isLocale,
  locales,
  baseLocale
} from '../lib/paraglide/runtime.js';

// Compatibility aliases for old API
export { setLocale as setLanguageTag } from '../lib/paraglide/runtime.js';
export { getLocale as languageTag } from '../lib/paraglide/runtime.js';  
export { locales as availableLanguageTags } from '../lib/paraglide/runtime.js';
export { isLocale as isAvailableLanguageTag } from '../lib/paraglide/runtime.js';

// Simple language detection (for later use)
export function detectLanguage(acceptLanguage?: string): LanguageTag {
  if (!acceptLanguage) return 'en';
  
  const langs = acceptLanguage.toLowerCase();
  if (langs.includes('bg')) return 'bg';
  return 'en';
}
