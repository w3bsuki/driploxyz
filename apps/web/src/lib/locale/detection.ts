import type { LanguageTag } from '@repo/i18n';

// Country to language mapping
const countryToLanguage: Record<string, LanguageTag> = {
  // Bulgaria
  BG: 'bg',
  // Default to English for all others
  US: 'en',
  GB: 'en',
  CA: 'en',
  AU: 'en',
  NZ: 'en',
  IE: 'en',
  // Russia, Ukraine, Belarus, etc. default to English now
  RU: 'en',
  BY: 'en',
  KZ: 'en',
  UA: 'en'
};

// Language detection based on browser settings
export function detectBrowserLanguage(): LanguageTag {
  if (typeof window === 'undefined') return 'en';
  
  // Safe access to navigator with fallback
  let browserLang = 'en';
  try {
    if (typeof navigator !== 'undefined') {
      browserLang = navigator.language || 
                   (navigator.languages && navigator.languages[0]) || 
                   'en';
    }
  } catch (e) {
    console.warn('Failed to detect browser language:', e);
  }
  
  const langCode = browserLang.toLowerCase();
  
  // Direct language matches
  if (langCode.startsWith('bg')) return 'bg';
  // All other languages default to English
  
  return 'en';
}

// IP-based geo detection (using free API)
export async function detectCountryFromIP(): Promise<string | null> {
  try {
    // Add timeout to prevent hanging on mobile networks
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    // Using ipapi.co free tier (no API key needed for basic usage)
    const response = await fetch('https://ipapi.co/json/', {
      headers: {
        'Accept': 'application/json'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.country_code || null;
  } catch (error) {
    // Don't log on abort (timeout) as it's expected on slow mobile networks
    if (error instanceof Error && error.name !== 'AbortError') {
      console.error('Failed to detect country from IP:', error);
    }
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
    try {
      // Test if localStorage is available (might fail in iOS Safari private mode)
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      
      localStorage.setItem('preferredLocale', locale);
    } catch (error) {
      // localStorage not available, use cookie only
      console.warn('localStorage not available, using cookie fallback');
    }
    
    // Always set cookie as fallback for SSR and iOS Safari
    try {
      const isSecure = window.location.protocol === 'https:';
      document.cookie = `PARAGLIDE_LOCALE=${locale};path=/;max-age=31536000;samesite=lax${isSecure ? ';secure' : ''}`;
    } catch (error) {
      console.error('Failed to set cookie:', error);
    }
  }
}

// Get stored locale preference
export function getStoredLocalePreference(): LanguageTag | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem('preferredLocale');
    if (stored && ['en', 'bg'].includes(stored)) {
      return stored as LanguageTag;
    }
  } catch (error) {
    // localStorage might be blocked on some mobile browsers
    console.error('Failed to get stored locale preference:', error);
  }
  
  return null;
}

// Mark locale banner as dismissed
export function dismissLocaleBanner() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('localeDetectionDismissed', 'true');
    } catch (error) {
      // Use cookie as fallback
      try {
        const isSecure = window.location.protocol === 'https:';
        document.cookie = `localeDetectionDismissed=true;path=/;max-age=31536000;samesite=lax${isSecure ? ';secure' : ''}`;
      } catch (e) {
        console.error('Failed to set dismissal cookie:', e);
      }
    }
  }
}

// Check if locale banner was dismissed
export function wasLocaleBannerDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    if (localStorage.getItem('localeDetectionDismissed') === 'true') {
      return true;
    }
  } catch (error) {
    // localStorage not available, check cookie
  }
  
  // Check cookie as fallback
  try {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'localeDetectionDismissed' && value === 'true') {
        return true;
      }
    }
  } catch (error) {
    console.error('Failed to read cookies:', error);
  }
  
  return false;
}