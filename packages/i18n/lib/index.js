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
// Simple language detection (for later use)
export function detectLanguage(acceptLanguage) {
    if (!acceptLanguage)
        return 'en';
    const langs = acceptLanguage.toLowerCase();
    if (langs.includes('bg'))
        return 'bg';
    return 'en';
}
