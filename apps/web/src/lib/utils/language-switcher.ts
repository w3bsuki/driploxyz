import { getLanguageDomain } from './domains';

export async function switchLanguage(lang: string) {
  console.log('Switching language to:', lang);
  
  try {
    // Get the domain URL for the target language
    const targetUrl = getLanguageDomain(lang, new URL(window.location.href));
    
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
    
    // Navigate to the language-specific domain
    // Using replace to not add to history when switching languages
    window.location.replace(targetUrl);
    
  } catch (error) {
    console.error('Language switch failed:', error);
    
    // Fallback: Try the old approach with URL parameter
    const url = new URL(window.location.href);
    url.searchParams.set('locale', lang);
    window.location.href = url.toString();
  }
}

export const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧', domain: 'uk.driplo.com' },
  { code: 'bg', name: 'Български', flag: '🇧🇬', domain: 'bg.driplo.com' },
  // Disabled for V1 - uncomment when needed
  // { code: 'ru', name: 'Русский', flag: '🇷🇺', domain: 'ru.driplo.com' },
  // { code: 'ua', name: 'Українська', flag: '🇺🇦', domain: 'ua.driplo.com' }
];