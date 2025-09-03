// Paraglide v2+ zero-bundle i18n
// Proper tree-shaking approach: export * allows Vite to tree-shake unused messages
/// <reference path="./paraglide.d.ts" />
// Export all Paraglide runtime functions
export { getLocale, setLocale, isLocale, locales, baseLocale } from './paraglide/runtime.js';
// Export all message functions - Vite automatically tree-shakes unused ones
export * from './paraglide/messages.js';
// Import runtime functions for compatibility aliases
import { getLocale, setLocale, isLocale, locales } from './paraglide/runtime.js';
// Compatibility aliases for existing API
export const languageTag = getLocale;
export const setLanguageTag = setLocale;
export const availableLanguageTags = locales;
export const isAvailableLanguageTag = isLocale;
// Helper constants
export const languageNames = {
    en: 'English',
    bg: 'Български'
};
// Language detection utility
export function detectLanguage(acceptLanguage) {
    if (!acceptLanguage)
        return 'en';
    const langs = acceptLanguage.toLowerCase();
    if (langs.includes('bg'))
        return 'bg';
    return 'en';
}
