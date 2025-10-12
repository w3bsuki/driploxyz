import { dev } from '$app/environment';
import type { RequestEvent } from '@sveltejs/kit';
import { detectLocale, locales, type LanguageTag, availableLanguageTags } from '@repo/i18n';
import { checkServerConsent, COOKIES } from '$lib/server/cookies/production-cookie-system';

// Debug flag for controlled logging
// Debug flag available for future i18n debugging - currently disabled to reduce console spam

/**
 * Setup internationalization for the request event
 * Handles locale detection from domain, URL, cookies, and headers
 */
export async function setupI18n(event: RequestEvent): Promise<void> {
  // Clean up legacy cookies INCLUDING removed locales  
  ['driplo_language', 'language', 'lang', 'locale', 'ru', 'ua'].forEach(old => {
    if (event.cookies.get(old)) {
      event.cookies.delete(old, { path: '/' });
    }
  });
  
  // Clean up invalid locale values from current cookie
  const cookieLocale = event.cookies.get(COOKIES.LOCALE);
  if (cookieLocale && !(locales as readonly string[]).includes(cookieLocale)) {
    event.cookies.delete(COOKIES.LOCALE, { path: '/' });
  }
  
  const hasFunctionalConsent = checkServerConsent(event.cookies, 'functional');
  
  // Check for Vercel host-based locale header first
  const headerLocale = event.request.headers.get('x-locale');
  let locale = headerLocale && availableLanguageTags.includes(headerLocale as LanguageTag) ? headerLocale : null;
  
  // If no header locale, use standard detection
  if (!locale) {
    let query: URLSearchParams | null = null;
    try {
      query = event.url.searchParams;
    } catch {
      // Handle prerendering context where searchParams is not available
      query = null;
    }

    const detected = detectLocale({
      path: event.url.pathname,
      query,
      cookie: event.cookies.get(COOKIES.LOCALE) ?? null,
      header: event.request.headers.get('accept-language'),
      defaultLocale: 'bg'
    });
    locale = detected;
  }
  
  
  // Update cookie if locale was set via URL parameter and consent exists
  let localeParam: string | null = null;
  try {
    localeParam = event.url.searchParams.get('locale');
  } catch {
    // Handle prerendering context where searchParams is not available
    localeParam = null;
  }
  if (localeParam && hasFunctionalConsent) {
    event.cookies.set(COOKIES.LOCALE, locale, {
      path: '/',
      maxAge: 365 * 24 * 60 * 60,
      httpOnly: false,
      sameSite: 'lax',
      secure: !dev
    });
  } else if (!event.cookies.get(COOKIES.LOCALE) && hasFunctionalConsent) {
    // Set cookie only if functional consent exists and no cookie already set
    event.cookies.set(COOKIES.LOCALE, locale, {
      path: '/',
      maxAge: 365 * 24 * 60 * 60,
      httpOnly: false,
      sameSite: 'lax',
      secure: !dev
    });
  }
  
  event.locals.locale = locale as LanguageTag;
}

/**
 * Transform page chunk to add language attribute to HTML tag
 */
export function transformPageChunk(event: RequestEvent): (params: { html: string }) => string {
  return ({ html }) => {
    const locale = event.locals.locale || 'bg';
    const nonce = event.locals.cspNonce;
    let result = html.replace('<html', `<html lang="${locale}"`);

    if (!nonce) {
      // During prerendering, remove nonce placeholders
      result = result.replace(/ nonce="%sveltekit\.nonce%"/g, '');
      return result;
    }

    // Add nonce to all <script> tags that don't already have one
    result = result.replace(/<script(?![^>]*\bnonce=)/g, `<script nonce="${nonce}"`);

    return result;
  };
}