import type { Reroute } from '@sveltejs/kit';
import * as i18n from '@repo/i18n';

/**
 * Reroute hook to handle language path prefixes
 * Transforms /bg/about -> /about with locale set
 * Transforms /en/about -> /about (en is default)
 */
export const reroute: Reroute = ({ url }) => {
  const pathname = url.pathname;
  
  // Check if path starts with a locale
  const match = pathname.match(/^\/([a-z]{2})(\/.*)?$/);
  
  if (match) {
    const locale = match[1];
    const rest = match[2] || '/';
    
    // If it's a valid locale, strip it from the path
    if (i18n.isAvailableLanguageTag(locale)) {
      // Return the path without the locale prefix
      // The locale will be handled by the i18n setup in hooks.server.ts
      return rest;
    }
  }
  
  // No change needed
  return pathname;
};