import { goto, invalidate } from '$app/navigation';
import * as i18n from '@repo/i18n';

export async function switchLanguage(lang: string) {
  console.log('Switching language to:', lang);
  
  if (!i18n.isAvailableLanguageTag(lang)) {
    console.error('Invalid language tag:', lang);
    return;
  }
  
  try {
    // For localhost or dev, we still need to handle cookies
    if (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1')) {
      const { ProductionCookieManager } = await import('$lib/cookies/production-cookie-system');
      const cookieManager = ProductionCookieManager.getInstance();
      
      if (!cookieManager.hasConsent('functional')) {
        sessionStorage.setItem('pendingLanguageSwitch', lang);
        
        window.dispatchEvent(new CustomEvent('requestCookieConsent', {
          detail: { 
            reason: 'language_switch', 
            targetLanguage: lang,
            message: `To switch to ${languages.find(l => l.code === lang)?.name || lang}, please enable functional cookies.`
          }
        }));
        return;
      }
      
      cookieManager.setCookie('locale', lang, {
        maxAge: 365 * 24 * 60 * 60,
        sameSite: 'lax',
        secure: location.protocol === 'https:'
      });
    }
    
    // Store selection in sessionStorage for cross-domain state
    sessionStorage.setItem('selectedLocale', lang);
    
    // Update runtime locale
    i18n.setLocale(lang as any);
    document.documentElement.lang = lang;
    
    // Navigate to the language-specific path using SvelteKit navigation
    // Map internal locale to URL path
    const currentPath = window.location.pathname.replace(/^\/(uk|bg)/, '');
    let newPath: string;
    
    if (lang === 'en') {
      // English uses /uk path
      newPath = `/uk${currentPath}`;
    } else if (lang === 'bg') {
      // Bulgarian is default, no prefix needed
      newPath = currentPath || '/';
    } else {
      newPath = `/${lang}${currentPath}`;
    }
    
    // Use goto with invalidateAll to ensure fresh data
    await goto(newPath, { invalidateAll: true });
    
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