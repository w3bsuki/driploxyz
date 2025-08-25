import { browser } from '$app/environment';
import { goto, invalidateAll } from '$app/navigation';
import * as i18n from '@repo/i18n';

const LANGUAGE_COOKIE_NAME = 'locale';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

/**
 * PRODUCTION-READY LANGUAGE SYSTEM
 * Cookie-first approach for SSR compatibility
 * No localStorage conflicts
 */

export function getStoredLanguage(): string | null {
  if (!browser) return null;
  
  // Only use cookies - no localStorage to avoid conflicts
  try {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === LANGUAGE_COOKIE_NAME) {
        return decodeURIComponent(value || '');
      }
    }
  } catch (e) {
    // Cookie reading failed
  }
  
  return null;
}

export function setStoredLanguage(lang: string) {
  if (!browser) return;
  
  // ONLY set cookie - consistent with server-side
  try {
    document.cookie = `${LANGUAGE_COOKIE_NAME}=${encodeURIComponent(lang)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax; Secure=${location.protocol === 'https:'}`;
  } catch (e) {
    console.warn('Failed to set language cookie:', e);
  }
}

/**
 * Initialize language from server-provided data
 * NEVER override server-set language
 */
export function initializeLanguage(serverLanguage?: string) {
  if (!browser) return;
  
  // Use server language if provided (SSR first)
  if (serverLanguage && i18n.isAvailableLanguageTag(serverLanguage)) {
    i18n.setLanguageTag(serverLanguage as any);
    document.documentElement.lang = serverLanguage;
    return;
  }
  
  // Fallback to cookie if no server language
  const storedLang = getStoredLanguage();
  if (storedLang && i18n.isAvailableLanguageTag(storedLang)) {
    i18n.setLanguageTag(storedLang as any);
    document.documentElement.lang = storedLang;
  } else {
    // Last resort: browser language detection
    let browserLang = 'en';
    if (typeof navigator !== 'undefined' && navigator.language) {
      const parts = navigator.language.split('-');
      browserLang = parts[0]?.toLowerCase() || 'en';
    }
    
    const finalLang = i18n.isAvailableLanguageTag(browserLang) ? browserLang : 'en';
    i18n.setLanguageTag(finalLang as any);
    document.documentElement.lang = finalLang;
    setStoredLanguage(finalLang);
  }
}

/**
 * Switch language and reload page for full SSR sync
 */
export async function switchLanguage(lang: string) {
  if (!i18n.isAvailableLanguageTag(lang)) {
    return false;
  }
  
  // Set cookie first
  setStoredLanguage(lang);
  
  // Update runtime
  i18n.setLanguageTag(lang as any);
  document.documentElement.lang = lang;
  
  // Force page reload to sync server-side - just invalidate, let SvelteKit handle navigation
  await invalidateAll();
  
  return true;
}

/**
 * Get available languages for language selector
 */
export function getAvailableLanguages() {
  return [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'bg', name: 'Bulgarian', nativeName: 'Български' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
    { code: 'ua', name: 'Ukrainian', nativeName: 'Українська' }
  ];
}