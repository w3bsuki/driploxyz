export * from './generated-messages.js';
export type Locale = 'en' | 'bg';
export type LanguageTag = Locale;
export { setLocale, getLocale, isLocale, locales, baseLocale } from './paraglide/runtime.js';
export { getLocale as languageTag } from './paraglide/runtime.js';
export { setLocale as setLanguageTag } from './paraglide/runtime.js';
export { locales as availableLanguageTags } from './paraglide/runtime.js';
export { isLocale as isAvailableLanguageTag } from './paraglide/runtime.js';
export declare const languageNames: Record<Locale, string>;
export declare function detectLanguage(acceptLanguage?: string): Locale;
export declare const LOCALE_ALIASES: Record<string, Locale>;
export declare function detectLocale(input: {
    path?: string;
    query?: URLSearchParams | null;
    cookie?: string | null;
    header?: string | null;
    defaultLocale?: Locale;
}): Locale;
export declare function applyLocale(locale: Locale): void;
//# sourceMappingURL=index.d.ts.map