// Re-export generated Paraglide functions
export * from '../lib/paraglide/messages.js';
export * from '../lib/paraglide/runtime.js';
// Helper constants
export const languageNames = {
    en: 'English',
    bg: 'Български'
};
// Compatibility functions for migration from Paraglide 1.x
export { isLocale as isAvailableLanguageTag, getLocale as languageTag, getLocale, setLocale } from '../lib/paraglide/runtime.js';
// Simple language detection (for later use)
export function detectLanguage(acceptLanguage) {
    if (!acceptLanguage)
        return 'en';
    const langs = acceptLanguage.toLowerCase();
    if (langs.includes('bg'))
        return 'bg';
    return 'en';
}
