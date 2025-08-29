// Re-export generated Paraglide functions
// @ts-ignore - paraglide generated files don't have declaration files
export * from '../lib/paraglide/messages.js';
// @ts-ignore - paraglide generated files don't have declaration files
export * from '../lib/paraglide/runtime.js';
// Helper constants
export const languageNames = {
    en: 'English',
    bg: 'Български'
};
// Compatibility functions for migration from Paraglide 1.x
// @ts-ignore - paraglide generated files don't have declaration files
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
