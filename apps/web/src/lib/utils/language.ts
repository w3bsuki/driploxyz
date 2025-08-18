import { browser } from '$app/environment';
import * as i18n from '@repo/i18n';

const LANGUAGE_COOKIE_NAME = 'driplo_language';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

export function getStoredLanguage(): string | null {
  if (!browser) return null;
  
  // Check localStorage first (more reliable)
  try {
    const stored = localStorage.getItem(LANGUAGE_COOKIE_NAME);
    if (stored) return stored;
  } catch (e) {
    // localStorage might not be available
  }
  
  // Fallback to cookie
  try {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === LANGUAGE_COOKIE_NAME) {
        return decodeURIComponent(value);
      }
    }
  } catch (e) {
    // Cookie reading failed
  }
  
  return null;
}

export function setStoredLanguage(lang: string) {
  if (!browser) return;
  
  // Set in localStorage (more reliable)
  try {
    localStorage.setItem(LANGUAGE_COOKIE_NAME, lang);
  } catch (e) {
    // localStorage might not be available
  }
  
  // Also set cookie as backup
  try {
    document.cookie = `${LANGUAGE_COOKIE_NAME}=${encodeURIComponent(lang)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  } catch (e) {
    // Cookie setting failed
  }
}

export function initializeLanguage() {
  if (!browser) return;
  
  const storedLang = getStoredLanguage();
  if (storedLang && i18n.isAvailableLanguageTag(storedLang)) {
    i18n.setLanguageTag(storedLang as any);
  } else {
    // Try to detect from browser language
    try {
      const browserLang = navigator?.language?.split('-')[0]?.toLowerCase();
      if (browserLang && i18n.isAvailableLanguageTag(browserLang)) {
        i18n.setLanguageTag(browserLang as any);
        setStoredLanguage(browserLang);
      } else {
        // Default to English
        i18n.setLanguageTag('en');
        setStoredLanguage('en');
      }
    } catch (e) {
      // Navigator not available, default to English
      i18n.setLanguageTag('en');
      setStoredLanguage('en');
    }
  }
}

export function switchLanguage(lang: string) {
  if (i18n.isAvailableLanguageTag(lang)) {
    setStoredLanguage(lang); // Save FIRST
    i18n.setLanguageTag(lang as any); // Then update runtime
    return true;
  }
  return false;
}