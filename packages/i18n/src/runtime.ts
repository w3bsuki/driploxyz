import en from '../messages/en.json' with { type: 'json' };
import bg from '../messages/bg.json' with { type: 'json' };

export type Locale = 'en' | 'bg';
export type MessageInputs = Record<string, string | number | boolean>;
export type MessageOptions = { locale?: Locale };

const translations = {
  en,
  bg
} as const satisfies Record<Locale, Record<string, string>>;

export const baseLocale: Locale = 'en';
export const defaultLocale: Locale = 'en';
export const locales: readonly Locale[] = Object.keys(translations) as Locale[];

let currentLocale: Locale = defaultLocale;

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale, options: { reload?: boolean } = {}): void {
  currentLocale = isLocale(locale) ? locale : defaultLocale;

  if (typeof window !== 'undefined' && options.reload === true) {
    window.location.reload();
  }
}

export function isLocale(locale: unknown): locale is Locale {
  return typeof locale === 'string' && (locales as readonly string[]).includes(locale);
}

export function formatMessage(template: string, inputs: MessageInputs = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const value = inputs[key];
    return value !== undefined && value !== null ? String(value) : match;
  });
}

export function resolveTemplate(key: string, locale: Locale): string | undefined {
  const localeMessages = translations[locale];
  if (localeMessages && key in localeMessages) {
    return (localeMessages as Record<string, string>)[key];
  }

  if (locale !== baseLocale) {
    const baseMessages = translations[baseLocale];
    if (baseMessages && key in baseMessages) {
      return (baseMessages as Record<string, string>)[key];
    }
  }

  return undefined;
}

export type MessageFunction = (inputs?: MessageInputs, options?: MessageOptions) => string;

export function createMessage(key: string, fallback: string): MessageFunction {
  return (inputs?: MessageInputs, options?: MessageOptions) => {
    const targetLocale = options?.locale && isLocale(options.locale) ? options.locale : currentLocale;
    const template = resolveTemplate(key, targetLocale) ?? fallback ?? key;
    return formatMessage(template, inputs ?? {});
  };
}

export const languageNames: Record<Locale, string> = {
  en: 'English',
  bg: 'Български'
};

export const LOCALE_ALIASES: Record<string, Locale> = { uk: 'en' };

export function detectLanguage(acceptLanguage?: string | null): Locale {
  if (!acceptLanguage) return baseLocale;
  const langs = acceptLanguage.toLowerCase();
  if (langs.includes('bg')) return 'bg';
  if (langs.includes('en') || langs.includes('en-gb') || langs.includes('en-us')) return 'en';
  return baseLocale;
}

export function detectLocale(input: {
  path?: string;
  query?: URLSearchParams | null;
  cookie?: string | null;
  header?: string | null;
  defaultLocale?: Locale;
}): Locale {
  const fallback: Locale = input.defaultLocale ?? defaultLocale;

  if (input.path) {
    const match = input.path.match(/^\/(en|uk|bg)(\/|$)/);
    if (match && match[1]) {
      const mapped = LOCALE_ALIASES[match[1]] ?? (match[1] as Locale);
      if (isLocale(mapped)) return mapped;
    }
  }

  if (input.query) {
    const queryLocale = input.query.get('locale');
    if (queryLocale && isLocale(queryLocale)) return queryLocale;
  }

  if (input.cookie && isLocale(input.cookie)) {
    return input.cookie;
  }

  if (input.header) {
    const browserLang = input.header.split(',')[0]?.split('-')[0]?.toLowerCase();
    if (browserLang && isLocale(browserLang)) {
      return browserLang;
    }
  }

  return fallback;
}

export function applyLocale(locale: Locale): void {
  if (isLocale(locale)) {
    currentLocale = locale;
  }
}

export function getMessage(key: string): MessageFunction {
  return createMessage(key, key);
}
