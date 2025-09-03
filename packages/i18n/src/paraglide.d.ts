// Type declarations for generated Paraglide modules
declare module './paraglide/messages.js' {
  // Export all message functions as callable functions that return strings
  const messages: Record<string, (...args: any[]) => string>;
  export = messages;
}

declare module './paraglide/runtime.js' {
  export type LanguageTag = 'en' | 'bg';
  
  export function setLocale(locale: LanguageTag): void;
  export function getLocale(): LanguageTag;
  export function isLocale(value: string): value is LanguageTag;
  export const locales: readonly LanguageTag[];
  export const baseLocale: LanguageTag;
}