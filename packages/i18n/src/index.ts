// Re-export generated Paraglide functions
// @ts-ignore - paraglide generated files don't have declaration files
export * from '../lib/paraglide/messages.js';
// @ts-ignore - paraglide generated files don't have declaration files
export * from '../lib/paraglide/runtime.js';

// Type definitions
export type LanguageTag = 'en' | 'bg' | 'ru' | 'ua';

// Helper constants
export const languageNames: Record<LanguageTag, string> = {
  en: 'English',
  bg: 'Български',
  ru: 'Русский',
  ua: 'Українська'
};

// Simple language detection (for later use)
export function detectLanguage(acceptLanguage?: string): LanguageTag {
  if (!acceptLanguage) return 'en';
  
  const langs = acceptLanguage.toLowerCase();
  if (langs.includes('bg')) return 'bg';
  if (langs.includes('ru')) return 'ru';
  if (langs.includes('uk') || langs.includes('ua')) return 'ua';
  return 'en';
}
