// Re-export generated Paraglide functions
export * from '../lib/paraglide/messages.js';
export * from '../lib/paraglide/runtime.js';
// Helper constants
export const languageNames = {
    en: 'English',
    bg: 'Български'
};
// Re-export and alias paraglide runtime functions
export { getLocale, setLocale, isLocale, isLocale as isAvailableLanguageTag, getLocale as languageTag } from '../lib/paraglide/runtime.js';
// Simple language detection (for later use)
export function detectLanguage(acceptLanguage) {
    if (!acceptLanguage)
        return 'en';
    const langs = acceptLanguage.toLowerCase();
    if (langs.includes('bg'))
        return 'bg';
    return 'en';
}
