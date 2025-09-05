import { goto, invalidate } from '$app/navigation';
import * as i18n from '@repo/i18n';
import { ProductionCookieManager } from '$lib/cookies/production-cookie-system';

export async function switchLanguage(lang: string) {
  console.log('Switching language to:', lang);
  
  if (!i18n.locales.includes(lang as i18n.Locale)) {
    console.error('Invalid language tag:', lang);
    return;
  }
  
  try {
    const cookieManager = ProductionCookieManager.getInstance();

    // If functional consent is missing, remember intent and prompt for consent
    if (!cookieManager.hasConsent('functional')) {
      sessionStorage.setItem('pendingLanguageSwitch', lang);
      window.dispatchEvent(new CustomEvent('requestCookieConsent', {
        detail: {
          reason: 'language_switch',
          targetLanguage: lang,
          message: `To switch to ${languages.find(l => l.code === lang)?.name || lang}, please enable functional cookies.`
        }
      }));
      // Proceed with a soft switch using explicit query so SSR renders desired locale
      // Cookie will be persisted once consent is granted later
    } else {
      // Persist preference when allowed
      cookieManager.setCookie('locale', lang, {
        maxAge: 365 * 24 * 60 * 60,
        sameSite: 'lax',
        secure: location.protocol === 'https:'
      });
    }

    // Store selection on client; used to complete switch post-consent too
    sessionStorage.setItem('selectedLocale', lang);

    // Update runtime locale immediately
    i18n.setLocale();
    document.documentElement.lang = lang;

    // Normalize path (strip any existing locale prefix)
    const currentPath = window.location.pathname.replace(/^\/(uk|bg)(?=\/|$)/, '');

    // Build explicit locale routing + query to ensure SSR honors choice
    // English uses /uk prefix; Bulgarian uses no prefix (root)
    const isEn = lang === 'en';
    const prefix = isEn ? '/uk' : '';
    const search = new URLSearchParams(window.location.search);
    search.set('locale', lang);
    const query = search.toString();

    const newPath = `${prefix}${currentPath || '/'}`.replace(/\/+$/, '/');
    const target = `${newPath}${query ? `?${query}` : ''}`;

    await goto(target, { invalidateAll: true });

  } catch (error) {
    console.error('Language switch failed:', error);
    
    // Fallback: Invalidate auth to trigger reload
    await invalidate('supabase:auth');
  }
}

export const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧', domain: 'uk.driplo.com' },
  { code: 'bg', name: 'Български', flag: '🇧🇬', domain: 'bg.driplo.com' },
  // Disabled for V1 - uncomment when needed
  // { code: 'ru', name: 'Русский', flag: '🇷🇺', domain: 'ru.driplo.com' },
  // { code: 'ua', name: 'Українська', flag: '🇺🇦', domain: 'ua.driplo.com' }
];

/**
 * Initialize language from server-provided data
 * NEVER override server-set language
 */
export function initializeLanguage(serverLanguage?: string) {
  if (typeof window === 'undefined') return;
  
  // Use server language if provided (SSR first)
  if (serverLanguage && i18n.locales.includes(serverLanguage as i18n.Locale)) {
    i18n.setLocale();
    document.documentElement.lang = serverLanguage;
    return;
  }
  
  // Fallback to stored preference
  let storedLang: string | null = null;
  try {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'locale') {
        storedLang = decodeURIComponent(value || '');
        break;
      }
    }
  } catch (e) {
    // Cookie reading failed
  }
  if (storedLang && i18n.locales.includes(storedLang as i18n.Locale)) {
    i18n.setLocale();
    document.documentElement.lang = storedLang;
  } else {
    // Last resort: browser language detection
    let browserLang = 'en';
    if (typeof navigator !== 'undefined' && navigator.language) {
      const parts = navigator.language.split('-');
      browserLang = parts[0]?.toLowerCase() || 'en';
    }
    
    const finalLang = i18n.locales.includes(browserLang as i18n.Locale) ? browserLang : 'en';
    i18n.setLocale();
    document.documentElement.lang = finalLang;
  }
}
