import type { Reroute } from '@sveltejs/kit';

/**
 * Reroute hook to handle language path prefixes
 * Transforms /en/about -> /about (maps to 'en' locale internally)
 * Transforms /uk/about -> /about (legacy support, maps to 'en' locale)
 * No prefix = Bulgarian (default)
 */
export const reroute: Reroute = ({ url }) => {
  const pathname = url.pathname;
  
  // Check if path starts with /en, /uk (legacy), or /bg
  const match = pathname.match(/^\/(en|uk|bg)(\/.*)?$/);
  
  if (match) {
    const rest = match[2] || '/';
    
    // Strip the locale prefix from the path
    // The actual locale will be determined in hooks.server.ts
    return rest;
  }
  
  // No change needed - default to Bulgarian
  return pathname;
};

// Export empty transport function for build compatibility
export const transport = () => {};