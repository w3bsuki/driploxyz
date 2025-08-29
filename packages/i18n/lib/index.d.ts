export * from '../lib/paraglide/messages.js';
export * from '../lib/paraglide/runtime.js';
export type LanguageTag = 'en' | 'bg';
export declare const languageNames: Record<LanguageTag, string>;
export { isLocale as isAvailableLanguageTag, getLocale as languageTag, getLocale, setLocale } from '../lib/paraglide/runtime.js';
export declare function detectLanguage(acceptLanguage?: string): LanguageTag;
//# sourceMappingURL=index.d.ts.map