import type { LanguageTag } from '@repo/i18n';

// Country to language mapping
const countryToLanguage: Record<string, LanguageTag> = {
  // Bulgaria
  BG: 'bg',
  // Russia and Russian-speaking countries
  RU: 'ru',
  BY: 'ru', // Belarus
  KZ: 'ru', // Kazakhstan
  // Ukraine
  UA: 'ua',
  // Default to English for all others
  US: 'en',
  GB: 'en',
  CA: 'en',
  AU: 'en',
  NZ: 'en',
  IE: 'en'
};

// Language detection based on browser settings
export function detectBrowserLanguage(): LanguageTag {
  if (typeof window === 'undefined') return 'en';
  
  const browserLang = navigator.language || navigator.languages?.[0] || 'en';
  const langCode = browserLang.toLowerCase();
  
  // Direct language matches
  if (langCode.startsWith('bg')) return 'bg';
  if (langCode.startsWith('ru')) return 'ru';
  if (langCode.startsWith('uk') || langCode.startsWith('ua')) return 'ua';
  
  return 'en';
}

// IP-based geo detection (using free API)
export async function detectCountryFromIP(): Promise<string | null> {
  try {
    // Using ipapi.co free tier (no API key needed for basic usage)
    const response = await fetch('https://ipapi.co/json/', {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.country_code || null;
  } catch (error) {
    console.error('Failed to detect country from IP:', error);
    return null;
  }
}

// Combined detection with fallback
export async function detectUserLocale(): Promise<{
  detectedLocale: LanguageTag;
  detectedCountry: string | null;
  confidence: 'high' | 'medium' | 'low';
}> {
  // First try IP-based detection
  const country = await detectCountryFromIP();
  
  if (country && countryToLanguage[country]) {
    return {
      detectedLocale: countryToLanguage[country],
      detectedCountry: country,
      confidence: 'high'
    };
  }
  
  // Fallback to browser language
  const browserLocale = detectBrowserLanguage();
  
  return {
    detectedLocale: browserLocale,
    detectedCountry: country,
    confidence: browserLocale !== 'en' ? 'medium' : 'low'
  };
}

// Check if locale detection banner should be shown
export function shouldShowLocaleDetectionBanner(
  currentLocale: LanguageTag,
  detectedLocale: LanguageTag,
  userDismissed: boolean = false
): boolean {
  // Don't show if user already dismissed
  if (userDismissed) return false;
  
  // Don't show if current locale matches detected
  if (currentLocale === detectedLocale) return false;
  
  // Only show for high-confidence detections
  return true;
}

// Store user's locale preference
export function storeLocalePreference(locale: LanguageTag) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('preferredLocale', locale);
    // Also set a cookie for SSR
    document.cookie = `locale=${locale};path=/;max-age=31536000;samesite=lax`;
  }
}

// Get stored locale preference
export function getStoredLocalePreference(): LanguageTag | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem('preferredLocale');
  if (stored && ['en', 'bg', 'ru', 'ua'].includes(stored)) {
    return stored as LanguageTag;
  }
  
  return null;
}

// Mark locale banner as dismissed
export function dismissLocaleBanner() {
  if (typeof window !== 'undefined') {
    localStorage.setItem('localeDetectionDismissed', 'true');
  }
}

// Check if locale banner was dismissed
export function wasLocaleBannerDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('localeDetectionDismissed') === 'true';
}