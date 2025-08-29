import { dev } from '$app/environment';
import type { RequestEvent } from '@sveltejs/kit';
import * as i18n from '@repo/i18n';
import { checkServerConsent, COOKIES } from '$lib/cookies/production-cookie-system';

// Debug flag for controlled logging
const isDebug = false; // Disabled to reduce console spam

/**
 * Setup internationalization for the request event
 * Handles locale detection from domain, URL, cookies, and headers
 */
export async function setupI18n(event: RequestEvent): Promise<void> {
  // Clean up legacy cookies
  ['driplo_language', 'language', 'lang'].forEach(old => {
    if (event.cookies.get(old)) {
      event.cookies.delete(old, { path: '/' });
    }
  });
  
  // HIGHEST PRIORITY: Detect language from domain
  const hostname = event.url.hostname;
  let locale = 'en'; // Default to English instead of null
  
  // Domain to language mapping
  const domainLanguageMap: Record<string, string> = {
    'bg.driplo.com': 'bg',
    'bg.driplo.xyz': 'bg',
    'uk.driplo.com': 'en',  // UK uses English
    'uk.driplo.xyz': 'en',
    // Disabled for V1 - uncomment when adding ru/ua support
    // 'ru.driplo.com': 'ru',
    // 'ru.driplo.xyz': 'ru',
    // 'ua.driplo.com': 'ua',
    // 'ua.driplo.xyz': 'ua',
    'driplo.com': 'en',      // Main domain defaults to English
    'driplo.xyz': 'en',
    'localhost': 'en',       // Default to English on localhost
  };
  
  // Check if hostname matches any domain mapping
  for (const [domain, lang] of Object.entries(domainLanguageMap)) {
    if (hostname.includes(domain) && lang) {
      locale = lang;
      if (isDebug) console.log(`🌍 Domain-based language detected: ${domain} → ${lang}`);
      break;
    }
  }
  
  // If no domain match, check URL parameter (second priority)
  if (locale === 'en') { // Only check URL param if we're on default
    const urlLocale = event.url.searchParams.get('locale');
    
    // Validate URL locale parameter
    if (urlLocale && i18n.isAvailableLanguageTag(urlLocale)) {
      locale = urlLocale;
    }
  }
  
  // Fallback to cookie if no domain or URL locale (third priority)
  // ALWAYS try to get locale from cookie, regardless of consent
  if (locale === 'en') { // Only check cookie if we're on default
    // Try both cookie names (production and fallback)
    const cookieLocale = event.cookies.get(COOKIES.LOCALE) || event.cookies.get('locale');
    if (cookieLocale && i18n.isAvailableLanguageTag(cookieLocale)) {
      locale = cookieLocale;
    }
  }
  
  // Check functional consent status
  const hasFunctionalConsent = checkServerConsent(event.cookies, 'functional');
  
  // Detect from headers if still on default (fourth priority)
  if (locale === 'en') { // Only check headers if we're still on default
    const acceptLang = event.request.headers.get('accept-language');
    if (acceptLang) {
      const browserLang = acceptLang.split(',')[0]?.split('-')[0]?.toLowerCase();
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