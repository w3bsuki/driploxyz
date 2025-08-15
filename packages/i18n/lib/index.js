// Re-export generated Paraglide functions
export * from '../lib/paraglide/messages.js';
export * from '../lib/paraglide/runtime.js';
// Helper constants
export const languageNames = {
    en: 'English',
    bg: 'Български',
    ru: 'Русский',
    ua: 'Українська'
};
// Simple language detection (for later use)
export function detectLanguage(acceptLanguage) {
    if (!acceptLanguage)
        return 'en';
    const langs = acceptLanguage.toLowerCase();
    if (langs.includes('bg'))
        return 'bg';
    if (langs.includes('ru'))
        return 'ru';
    if (langs.includes('uk') || langs.includes('ua'))
        return 'ua';
    return 'en';
}
