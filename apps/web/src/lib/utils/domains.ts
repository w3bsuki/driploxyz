/**
 * Domain configuration for language-specific sites
 */

import { dev } from '$app/environment';

// Language to domain mapping
export const LANGUAGE_DOMAINS = {
  en: 'uk.driplo.com',  // English on UK domain
  bg: 'bg.driplo.com',  // Bulgarian
  // Disabled for V1 - uncomment when needed
  // ru: 'ru.driplo.com',  // Russian (to be created)
  // ua: 'ua.driplo.com',  // Ukrainian (to be created)
} as const;

// Fallback domains for development/staging
export const LANGUAGE_DOMAINS_DEV = {
  en: 'uk.driplo.xyz',
  bg: 'bg.driplo.xyz',
  // Disabled for V1 - uncomment when needed
  // ru: 'ru.driplo.xyz',
  // ua: 'ua.driplo.xyz',
} as const;

/**
 * Get the domain URL for a specific language
 * @param language - The language code (en, bg, ru, ua)
 * @param currentUrl - The current page URL to preserve path
 * @returns The full URL with the correct domain for that language
 */
export function getLanguageDomain(language: string, currentUrl: URL): string {
  // In development, don't switch domains
  if (dev || currentUrl.hostname === 'localhost') {
    const url = new URL(currentUrl);
    url.searchParams.set('locale', language);
    return url.toString();
  }
  
  // Check if we're on .xyz (staging) or .com (production)
  const isStaging = currentUrl.hostname.includes('.xyz');
  const domains = isStaging ? LANGUAGE_DOMAINS_DEV : LANGUAGE_DOMAINS;
  
  // Get the domain for the language
  const domain = domains[language as keyof typeof domains];
  if (!domain) {
    // Fallback to current domain with locale param
    const url = new URL(currentUrl);
    url.searchParams.set('locale', language);
    return url.toString();
  }
  
  // Build new URL with the language-specific domain
  const protocol = currentUrl.protocol;
  const pathname = currentUrl.pathname;
  const search = currentUrl.search;
  const hash = currentUrl.hash;
  
  // Remove locale param if it exists since domain determines language
  const searchParams = new URLSearchParams(search);
  searchParams.delete('locale');
  const newSearch = searchParams.toString() ? `?${searchParams.toString()}` : '';
  
  return `${protocol}//${domain}${pathname}${newSearch}${hash}`;
}

/**
 * Get all available language URLs for the current page
 * Useful for language switcher
 */
export function getAllLanguageUrls(currentUrl: URL): Record<string, string> {
  return {
    en: getLanguageDomain('en', currentUrl),
    bg: getLanguageDomain('bg', currentUrl),
    ru: getLanguageDomain('ru', currentUrl),
    ua: getLanguageDomain('ua', currentUrl),
  };
}