import type { Locale as GeneratedLocale } from '@repo/i18n/lib/src/runtime.js';

declare module '@repo/i18n' {
  export type Locale = GeneratedLocale;
  export type LanguageTag = Locale;
}