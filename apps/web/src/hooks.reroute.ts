import type { Reroute } from '@sveltejs/kit';

/**
 * Reroute hook to handle language path prefixes
 * Transforms /uk/about -> /about (maps to 'en' locale internally)
 * Transforms /bg/about -> /about with locale set
 * No prefix = Bulgarian (default)
 */
export const reroute: Reroute = ({ url }) => {
  const pathname = url.pathname;
  
  // Check if path starts with /uk or /bg
  const match = pathname.match(/^\/(uk|bg)(\/.*)?$/);
  
  if (match) {
    const rest = match[2] || '/';
    
    // Strip the locale prefix from the path
    // The actual locale will be determined in hooks.server.ts
    return rest;
  }
  
  // No change needed - default to Bulgarian
  return pathname;
};