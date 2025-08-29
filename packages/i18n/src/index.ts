// Re-export generated Paraglide functions
export * from '../lib/paraglide/messages.js';
export * from '../lib/paraglide/runtime.js';

// Type definitions
export type LanguageTag = 'en' | 'bg';

// Helper constants
export const languageNames: Record<LanguageTag, string> = {
  en: 'English',
  bg: 'Български'
};

// Compatibility functions for migration from Paraglide 1.x
export { 
  isLocale as isAvailableLanguageTag, 
  getLocale as languageTag,
  getLocale,
  setLocale
} from '../lib/paraglide/runtime.js';

// Simple language detection (for later use)
export function detectLanguage(acceptLanguage?: string): LanguageTag {
  if (!acceptLanguage) return 'en';
  
  const langs = acceptLanguage.toLowerCase();
  if (langs.includes('bg')) return 'bg';
  return 'en';
}
