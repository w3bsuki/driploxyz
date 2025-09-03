export { getLocale, setLocale, isLocale, locales, baseLocale } from './paraglide/runtime.js';
export * from './paraglide/messages.js';
export type Locale = 'en' | 'bg';
export type LanguageTag = Locale;
export declare const languageTag: any;
export declare const setLanguageTag: any;
export declare const availableLanguageTags: any;
export declare const isAvailableLanguageTag: any;
export declare const languageNames: Record<Locale, string>;
export declare function detectLanguage(acceptLanguage?: string): Locale;
//# sourceMappingURL=index.d.ts.map