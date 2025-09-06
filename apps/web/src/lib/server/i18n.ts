import { dev } from '$app/environment';
import type { RequestEvent } from '@sveltejs/kit';
import { detectLocale, applyLocale, locales, LOCALE_ALIASES } from '@repo/i18n';
import { checkServerConsent, COOKIES } from '@repo/core-cookies';

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
  
  const detected = detectLocale({
    path: event.url.pathname,
    query: event.url.searchParams,
    cookie: event.cookies.get(COOKIES.LOCALE) ?? null,
    header: event.request.headers.get('accept-language'),
    defaultLocale: 'bg'
  });
  const locale = detected;
  
  
  // Update cookie if locale was set via URL parameter and consent exists
  if (event.url.searchParams.get('locale') && hasFunctionalConsent) {
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
  
  (event.locals as any).locale = locale;
}

/**
 * Transform page chunk to add language attribute to HTML tag
 */
export function transformPageChunk(event: RequestEvent): (params: { html: string }) => string {
  return ({ html }) => {
    const locale = (event.locals as any).locale || 'bg';
    const nonce = (event.locals as any).cspNonce;
    let result = html.replace('<html', `<html lang="${locale}"`);
    if (!nonce) return result;

    // Add nonce to all <script> tags that don't already have one
    result = result.replace(/<script(?![^>]*\bnonce=)/g, `<script nonce="${nonce}"`);

    return result;
  };
}