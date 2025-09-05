export * from './generated-messages.js';
export type Locale = 'en' | 'bg';
export type LanguageTag = Locale;
export declare const getLocale: () => string;
export declare const setLocale: () => void;
export declare const isLocale: () => boolean;
export declare const locales: string[];
export declare const baseLocale = "en";
export declare const languageTag: () => string;
export declare const setLanguageTag: () => void;
export declare const availableLanguageTags: string[];
export declare const isAvailableLanguageTag: () => boolean;
export declare const languageNames: Record<Locale, string>;
export declare function detectLanguage(acceptLanguage?: string): Locale;
//# sourceMappingURL=index.d.ts.map