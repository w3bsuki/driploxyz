import { dev } from '$app/environment';
import type { RequestEvent } from '@sveltejs/kit';
import * as i18n from '@repo/i18n';
import { checkServerConsent, COOKIES } from '$lib/cookies/production-cookie-system';

// Debug flag for controlled logging
// Debug flag available for future i18n debugging - currently disabled to reduce console spam

/**
 * Setup internationalization for the request event
 * Handles locale detection from domain, URL, cookies, and headers
 */
export async function setupI18n(event: RequestEvent): Promise<void> {
  // Clean up legacy cookies INCLUDING removed locales
  ['driplo_language', 'language', 'lang', 'ru', 'ua'].forEach(old => {
    if (event.cookies.get(old)) {
      event.cookies.delete(old, { path: '/' });
    }
  });
  
  // Clean up invalid locale values from current cookie
  const cookieLocale = event.cookies.get(COOKIES.LOCALE);
  if (cookieLocale && !i18n.isAvailableLanguageTag(cookieLocale)) {
    event.cookies.delete(COOKIES.LOCALE, { path: '/' });
  }
  
  // HIGHEST PRIORITY: Detect language from URL path
  const pathname = event.url.pathname;
  let locale = 'bg'; // Default to Bulgarian
  let localeExplicitlySet = false;
  
  // Check if path starts with a locale (e.g., /uk/, /bg/)
  const pathMatch = pathname.match(/^\/(uk|bg)(\/|$)/);
  if (pathMatch) {
    const pathLocale = pathMatch[1];
    // Map /uk to 'en' locale internally
    const mappedLocale = pathLocale === 'uk' ? 'en' : pathLocale;
    if (mappedLocale && i18n.isAvailableLanguageTag(mappedLocale)) {
      locale = mappedLocale;
      localeExplicitlySet = true;
    }
  }
  
  // SECOND PRIORITY: Check URL parameter (only if not explicitly set by path)
  if (!localeExplicitlySet) {
    const urlLocale = event.url.searchParams.get('locale');
    if (urlLocale && i18n.isAvailableLanguageTag(urlLocale)) {
      locale = urlLocale;
      localeExplicitlySet = true;
    }
  }
  
  // THIRD PRIORITY: Fallback to cookie if no explicit locale preference
  if (!localeExplicitlySet) {
    const cookieLocale = event.cookies.get(COOKIES.LOCALE) || event.cookies.get('locale');
    if (cookieLocale && i18n.isAvailableLanguageTag(cookieLocale)) {
      locale = cookieLocale;
      localeExplicitlySet = true;
    }
  }
  
  // Check functional consent status
  const hasFunctionalConsent = checkServerConsent(event.cookies, 'functional');
  
  // FOURTH PRIORITY: Detect from headers if no explicit preference found
  if (!localeExplicitlySet) {
    const acceptLang = event.request.headers.get('accept-language');
    if (acceptLang) {
      const browserLang = acceptLang.split(',')[0]?.split('-')[0]?.toLowerCase();
      if (browserLang && i18n.isAvailableLanguageTag(browserLang)) {
        locale = browserLang;
      }
    }
    // If no valid header language found, keep default 'bg'
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
      i18n.setLocale(locale as any);
    } else {
      i18n.setLocale('bg');
    }
  } catch (error) {
    console.error(`❌ Failed to set language tag '${locale}':`, error);
    // Fallback to Bulgarian if language setting fails
    try {
      i18n.setLocale('bg');
    } catch (fallbackError) {
      console.error(`❌ Critical: Failed to set fallback language 'bg':`, fallbackError);
      throw new Error(`Language system failure: ${fallbackError}`);
    }
  }
  
  (event.locals as any).locale = i18n.getLocale();
}

/**
 * Transform page chunk to add language attribute to HTML tag
 */
export function transformPageChunk(event: RequestEvent): (params: { html: string }) => string {
  return ({ html }) => 
    html.replace('<html', `<html lang="${(event.locals as any).locale}"`);
}