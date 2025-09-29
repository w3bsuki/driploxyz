export * from './generated/messages';
import { LOCALE_ALIASES, applyLocale, baseLocale, detectLanguage, detectLocale, getLocale, getMessage, isLocale, languageNames, locales, setLocale } from './runtime';
export type { Locale, MessageFunction, MessageInputs, MessageOptions } from './runtime';
export { LOCALE_ALIASES, applyLocale, baseLocale, detectLanguage, detectLocale, getLocale, getMessage, isLocale, languageNames, locales, setLocale };
export declare const languageTag: typeof getLocale;
export declare const setLanguageTag: typeof setLocale;
export declare const availableLanguageTags: readonly import("./runtime").Locale[];
export declare const isAvailableLanguageTag: typeof isLocale;
//# sourceMappingURL=index.d.ts.map