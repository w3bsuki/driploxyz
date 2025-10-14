// Shared cookie names used across client and server. Keep in sync with server cookie system.
// This file is safe to import on the client; do not add any server-only logic here.

export const COOKIES = {
  // Supabase Auth (Essential)
  AUTH_TOKEN: 'sb-auth-token',
  AUTH_REFRESH: 'sb-refresh-token',

  // GDPR Consent (Essential)
  CONSENT: 'driplo_consent',
  CONSENT_VERSION: 'consent_v',

  // Functional
  LOCALE: 'PARAGLIDE_LOCALE',
  COUNTRY: 'country',
  THEME: 'theme',
  CURRENCY: 'currency',
  LOCALE_PROMPT_DISMISSED: 'locale_banner_dismissed',

  // Analytics
  GA_CLIENT: '_ga',
  GA_SESSION: '_gid',
  GTM: '_gtm',

  // Marketing
  FB_PIXEL: '_fbp',
  GOOGLE_ADS: '_gcl_au',

  // Session
  SESSION_ID: 'session_id',
  CSRF: 'csrf_token'
} as const;

export type CookieName = typeof COOKIES[keyof typeof COOKIES];
