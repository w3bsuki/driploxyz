export * from '../lib/paraglide/messages.js';
export * from '../lib/paraglide/runtime.js';
export type LanguageTag = 'en' | 'bg';
export declare const languageNames: Record<LanguageTag, string>;
export { setLocale, getLocale, isLocale, locales, baseLocale } from '../lib/paraglide/runtime.js';
export { setLocale as setLanguageTag } from '../lib/paraglide/runtime.js';
export { getLocale as languageTag } from '../lib/paraglide/runtime.js';
export { locales as availableLanguageTags } from '../lib/paraglide/runtime.js';
export { isLocale as isAvailableLanguageTag } from '../lib/paraglide/runtime.js';
export declare function detectLanguage(acceptLanguage?: string): LanguageTag;
//# sourceMappingURL=index.d.ts.map