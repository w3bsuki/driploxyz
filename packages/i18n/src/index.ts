// Paraglide v2+ zero-bundle i18n
// Proper tree-shaking approach: export * allows Vite to tree-shake unused messages

/// <reference path="./paraglide.d.ts" />

// Export all message functions - Vite automatically tree-shakes unused ones
export * from './generated-messages.js';

// Type definitions 
export type Locale = 'en' | 'bg';
export type LanguageTag = Locale; // Compatibility alias

// Simple runtime functions for compatibility
export const getLocale = () => 'en';
export const setLocale = () => {};
export const isLocale = () => true;
export const locales = ['en', 'bg'];
export const baseLocale = 'en';

// Compatibility aliases for existing API
export const languageTag = getLocale;
export const setLanguageTag = setLocale;
export const availableLanguageTags = locales;
export const isAvailableLanguageTag = isLocale;

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