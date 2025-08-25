export async function switchLanguage(lang: string) {
  console.log('Switching language to:', lang);
  
  try {
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
    
    sessionStorage.setItem('selectedLocale', lang);
    await new Promise(resolve => setTimeout(resolve, 10));
    window.location.replace(window.location.pathname + window.location.search);
    
  } catch (error) {
    console.error('Language switch failed:', error);
    
    if ((error as any).message?.includes('Functional cookies required')) {
      sessionStorage.setItem('pendingLanguageSwitch', lang);
      
      window.dispatchEvent(new CustomEvent('requestCookieConsent', {
        detail: { 
          reason: 'language_switch', 
          targetLanguage: lang,
          message: 'To save your language preference, please enable functional cookies.'
        }
      }));
      return;
    }
    
    document.cookie = `locale=${lang}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax; Secure=${location.protocol === 'https:'}`;
    
    const url = new URL(window.location.href);
    url.searchParams.set('locale', lang);
    window.location.href = url.toString();
  }
}

export const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'bg', name: 'Български', flag: '🇧🇬' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ua', name: 'Українська', flag: '🇺🇦' }
];