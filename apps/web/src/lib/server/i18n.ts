import { dev } from '$app/environment';
import type { RequestEvent } from '@sveltejs/kit';
import * as i18n from '@repo/i18n';
import { checkServerConsent, COOKIES } from '$lib/cookies/production-cookie-system';

// Debug flag for controlled logging
const isDebug = false; // Disabled to reduce console spam

/**
 * Setup internationalization for the request event
 * Handles locale detection from URL, cookies, and headers
 */
export async function setupI18n(event: RequestEvent): Promise<void> {
  // Clean up legacy cookies
  ['driplo_language', 'language', 'lang'].forEach(old => {
    if (event.cookies.get(old)) {
      event.cookies.delete(old, { path: '/' });
    }
  });
  
  // Get locale from URL parameter first (highest priority)
  let locale = event.url.searchParams.get('locale');
  
  // Validate URL locale parameter
  if (locale && !i18n.isAvailableLanguageTag(locale)) {
    locale = null;
  }
  
  // Fallback to cookie if no valid URL locale
  // ALWAYS try to get locale from cookie, regardless of consent
  if (!locale) {
    // Try both cookie names (production and fallback)
    locale = event.cookies.get(COOKIES.LOCALE) || event.cookies.get('locale') || null;
  }
  
  // Check functional consent status
  const hasFunctionalConsent = checkServerConsent(event.cookies, 'functional');
  
  // Detect from headers if no cookie or URL param
  if (!locale) {
    const acceptLang = event.request.headers.get('accept-language');
    if (acceptLang) {
      const browserLang = acceptLang.split(',')[0]?.split('-')[0]?.toLowerCase() || 'en';
      locale = i18n.isAvailableLanguageTag(browserLang) ? browserLang : 'en';
    } else {
      locale = 'en';
    }
  }
  
  
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
  
  // Apply locale with error handling
  try {
    if (locale && i18n.isAvailableLanguageTag(locale)) {
      i18n.setLanguageTag(locale as any);
    } else {
      i18n.setLanguageTag('en');
    }
  } catch (error) {
    console.error(`❌ Failed to set language tag '${locale}':`, error);
    // Fallback to English if language setting fails
    try {
      i18n.setLanguageTag('en');
    } catch (fallbackError) {
      console.error(`❌ Critical: Failed to set fallback language 'en':`, fallbackError);
      throw new Error(`Language system failure: ${fallbackError}`);
    }
  }
  
  (event.locals as any).locale = i18n.languageTag();
}

/**
 * Transform page chunk to add language attribute to HTML tag
 */
export function transformPageChunk(event: RequestEvent): (params: { html: string }) => string {
  return ({ html }) => 
    html.replace('<html', `<html lang="${(event.locals as any).locale}"`);
}