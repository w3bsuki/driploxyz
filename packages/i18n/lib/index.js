// Paraglide v2+ zero-bundle i18n
// Proper tree-shaking approach: export * allows Vite to tree-shake unused messages
/// <reference path="./paraglide.d.ts" />
// Export all message functions - Vite automatically tree-shakes unused ones
export * from './generated-messages.js';
// Re-export Paraglide runtime functions directly - let Paraglide handle locale detection
export { setLocale, getLocale, isLocale, locales, baseLocale } from './paraglide/runtime.js';
// Local bindings for internal use
import { locales as runtimeLocales, setLocale as runtimeSetLocale } from './paraglide/runtime.js';
// Compatibility aliases for existing API
export { getLocale as languageTag } from './paraglide/runtime.js';
export { setLocale as setLanguageTag } from './paraglide/runtime.js';
export { locales as availableLanguageTags } from './paraglide/runtime.js';
export { isLocale as isAvailableLanguageTag } from './paraglide/runtime.js';
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
// Shared server helpers for SSR parity
export const LOCALE_ALIASES = { uk: 'en' };
export function detectLocale(input) {
    const fallback = input.defaultLocale ?? 'bg';
    // Path: /^\/(uk|bg)(\/|$)/
    if (input.path) {
        const match = input.path.match(/^\/(uk|bg)(\/|$)/);
        if (match) {
            const mapped = LOCALE_ALIASES[match[1]] ?? match[1];
            if (runtimeLocales.includes(mapped))
                return mapped;
        }
    }
    // Query param
    if (input.query) {
        const q = input.query.get('locale');
        if (q && runtimeLocales.includes(q))
            return q;
    }
    // Cookie
    if (input.cookie && runtimeLocales.includes(input.cookie)) {
        return input.cookie;
    }
    // Accept-Language header
    if (input.header) {
        const browserLang = input.header.split(',')[0]?.split('-')[0]?.toLowerCase();
        if (browserLang && runtimeLocales.includes(browserLang)) {
            return browserLang;
        }
    }
    return fallback;
}
export function applyLocale(locale) {
    // Only sets runtime locale; caller should handle cookies and <html lang>
    if (runtimeLocales.includes(locale)) {
        runtimeSetLocale(locale);
    }
}
