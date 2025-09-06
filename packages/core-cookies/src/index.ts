import type { Cookies } from '@sveltejs/kit';

export const COOKIES = {
  AUTH_TOKEN: 'sb-auth-token',
  AUTH_REFRESH: 'sb-refresh-token',
  CONSENT: 'driplo_consent',
  CONSENT_VERSION: 'consent_v',
  LOCALE: 'PARAGLIDE_LOCALE',
  COUNTRY: 'country',
  THEME: 'theme',
  CURRENCY: 'currency',
  GA_CLIENT: '_ga',
  GA_SESSION: '_gid',
  GTM: '_gtm',
  FB_PIXEL: '_fbp',
  GOOGLE_ADS: '_gcl_au',
  SESSION_ID: 'session_id',
  CSRF: 'csrf_token'
} as const;

export const COOKIE_CATEGORIES = {
  essential: {
    id: 'essential',
    cookies: [
      COOKIES.AUTH_TOKEN,
      COOKIES.AUTH_REFRESH,
      COOKIES.CONSENT,
      COOKIES.CONSENT_VERSION,
      COOKIES.SESSION_ID,
      COOKIES.CSRF
    ]
  },
  functional: {
    id: 'functional',
    cookies: [COOKIES.LOCALE, COOKIES.THEME, COOKIES.CURRENCY]
  },
  analytics: {
    id: 'analytics',
    cookies: [COOKIES.GA_CLIENT, COOKIES.GA_SESSION, COOKIES.GTM]
  },
  marketing: {
    id: 'marketing',
    cookies: [COOKIES.FB_PIXEL, COOKIES.GOOGLE_ADS]
  }
} as const;

export type ConsentCategory = keyof typeof COOKIE_CATEGORIES;

export function checkServerConsent(cookies: Cookies, category: ConsentCategory): boolean {
  if (category === 'essential') return true;
  const consentCookie = cookies.get(COOKIES.CONSENT);
  if (!consentCookie) return false;
  try {
    const consent = JSON.parse(decodeURIComponent(consentCookie));
    return consent[category] === true;
  } catch {
    return false;
  }
}

export function setCookieSafe(
  cookies: Cookies,
  name: string,
  value: string,
  options?: Parameters<Cookies['set']>[2]
) {
  cookies.set(name, value, { path: '/', sameSite: 'lax', ...options });
}

export function deleteCookieEverywhere(cookies: Cookies, name: string) {
  cookies.delete(name, { path: '/' });
}


