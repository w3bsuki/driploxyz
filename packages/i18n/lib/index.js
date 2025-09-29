export * from './generated/messages';
import { LOCALE_ALIASES, applyLocale, baseLocale, detectLanguage, detectLocale, getLocale, getMessage, isLocale, languageNames, locales, setLocale } from './runtime';
export { LOCALE_ALIASES, applyLocale, baseLocale, detectLanguage, detectLocale, getLocale, getMessage, isLocale, languageNames, locales, setLocale };
export const languageTag = getLocale;
export const setLanguageTag = setLocale;
export const availableLanguageTags = locales;
export const isAvailableLanguageTag = isLocale;
