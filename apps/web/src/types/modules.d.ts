// Legacy module shim to keep tooling happy during Paraglide migration
// @deprecated - Use $lib/paraglide/runtime instead
declare module '@repo/i18n' {
  export type Locale = 'en-US' | 'en-GB' | 'bg-BG' | 'es-ES';
  export type LanguageTag = Locale;
  export const locales: readonly Locale[];
  export const baseLocale: Locale;
  export function getLocale(): Locale;
  export function setLocale(locale: Locale): void;
}

// Paraglide compiled runtime typings
declare module '$lib/paraglide/runtime' {
  export type LanguageTag = 'en-US' | 'en-GB' | 'bg-BG' | 'es-ES';
  export const baseLocale: LanguageTag;
  export const locales: readonly LanguageTag[];
  export function getLocale(): LanguageTag;
  export function setLocale(locale: LanguageTag, options?: { reload?: boolean }): void;

  export function deLocalizeUrl(url: URL | string): URL;
  export function localizeHref(href: string, options?: { locale?: LanguageTag }): string;
}

declare module '$lib/paraglide/server' {
  export function paraglideMiddleware<T>(
    request: Request,
    resolve: (args: { request: Request; locale: string }) => T | Promise<T>,
    callbacks?: { onRedirect?: (response: Response) => void }
  ): Promise<Response>;
}