import * as i18n from '@repo/i18n';

/**
 * Generate a locale-aware URL path
 * - Bulgarian (default): no prefix
 * - English: /uk prefix
 */
export function localizedPath(path: string, locale?: string): string {
  const targetLocale = locale || i18n.getLocale();
  
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // Bulgarian is default, no prefix needed
  if (targetLocale === 'bg') {
    return normalizedPath;
  }
  
  // English uses /uk prefix
  if (targetLocale === 'en') {
    return `/uk${normalizedPath}`;
  }
  
  // Fallback to no prefix
  return normalizedPath;
}

/**
 * Get the current path without locale prefix
 */
export function getPathWithoutLocale(pathname: string): string {
  // Remove /uk or /bg prefix if present
  const match = pathname.match(/^\/(uk|bg)(\/.*)?$/);
  if (match) {
    return match[2] || '/';
  }
  return pathname;
}

/**
 * Switch to a different locale while preserving the current path
 */
export function switchLocalePath(currentPath: string, targetLocale: string): string {
  const pathWithoutLocale = getPathWithoutLocale(currentPath);
  return localizedPath(pathWithoutLocale, targetLocale);
}

/**
 * Get all locale versions of the current path for hreflang links
 */
export function getLocaleUrls(path: string): { locale: string; url: string; hreflang: string }[] {
  const pathWithoutLocale = getPathWithoutLocale(path);
  
  return [
    {
      locale: 'bg',
      url: localizedPath(pathWithoutLocale, 'bg'),
      hreflang: 'bg-BG'
    },
    {
      locale: 'en',
      url: localizedPath(pathWithoutLocale, 'en'),
      hreflang: 'en-GB'
    }
  ];
}

/**
 * Check if a path has a locale prefix
 */
export function hasLocalePrefix(path: string): boolean {
  return /^\/(uk|bg)\//.test(path);
}

/**
 * Get the locale from a path
 */
export function getLocaleFromPath(path: string): string | null {
  const match = path.match(/^\/(uk|bg)\//);
  if (match) {
    const prefix = match[1];
    return prefix === 'uk' ? 'en' : prefix ?? null;
  }
  return null;
}