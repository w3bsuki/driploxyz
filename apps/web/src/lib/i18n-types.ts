// Local i18n type definitions - Paraglide-based
// Keep in sync with Paraglide runtime locales generated in $lib/paraglide/runtime.js

export type LanguageTag = 'en-US' | 'en-GB' | 'bg-BG' | 'es-ES';

export const AVAILABLE_LANGUAGE_TAGS: ReadonlyArray<LanguageTag> = [
  'en-US',
  'en-GB',
  'bg-BG',
  'es-ES'
] as const;

export type Locale = LanguageTag;
