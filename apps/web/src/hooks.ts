import type { Reroute } from '@sveltejs/kit';
import { deLocalizeUrl } from '@repo/i18n';

/**
 * Reroute hook to handle language path prefixes using Paraglide's built-in deLocalizeUrl
 * Automatically strips locale prefixes from URLs:
 * - /en/about -> /about (mapped to 'en' locale)
 * - /bg/about -> /about (mapped to 'bg' locale)
 * - /about -> /about (default locale)
 */
export const reroute: Reroute = ({ url }) => {
  // Paraglide's deLocalizeUrl handles ALL locale stripping automatically
  return deLocalizeUrl(url).pathname;
};

// Export empty transport function for build compatibility
export const transport = () => {};