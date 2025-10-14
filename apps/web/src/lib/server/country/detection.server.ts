/**
 * SERVER-ONLY country detection utilities
 * These functions MUST NOT be imported by client-side code
 * Place this file in $lib/server/ to enforce server-only usage
 */

import type { RequestEvent } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { getOrSetClientIp } from '$lib/server/client-ip';
import { COOKIES } from '$lib/cookies/constants';
import type { CountryCode } from '$lib/country/constants';
import { normalizeCountryCode, COUNTRY_CONFIGS } from '$lib/country/constants';

export function detectCountryFromHeaders(request: Request): CountryCode | null {
  const headerCandidates = [
    request.headers.get('cf-ipcountry'),
    request.headers.get('cf-ip-country'),
    request.headers.get('x-country'),
    request.headers.get('x-geo-country'),
    request.headers.get('x-vercel-ip-country'),
    request.headers.get('x-country-code')
  ];

  for (const candidate of headerCandidates) {
    const normalized = normalizeCountryCode(candidate);
    if (normalized) {
      return normalized;
    }
  }

  return null;
}

// Server-side country detection from IP
export async function detectCountryFromIP(event: RequestEvent): Promise<CountryCode | null> {
  try {
    // Get real IP from various headers (works with Vercel, Cloudflare, etc.)
    let ip: string | null = null;

    // Try headers first (most reliable in production environments)
    ip = event.request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
    if (!ip) ip = event.request.headers.get('x-real-ip') || null;
    if (!ip) ip = event.request.headers.get('cf-connecting-ip') || null;

    // Only try to resolve from event once if we don't have an IP from headers
    if (!ip) {
      ip = getOrSetClientIp(event) || null;
      if (!ip) return dev ? 'BG' : null;
    }

    if (!ip || ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
      // Local development or loopback address
      return dev ? 'BG' : null;
    }

    // Use ipapi.co for geolocation (free tier)
    const response = await fetch(`https://ipapi.co/${ip}/country/`, {
      headers: { 'Accept': 'text/plain' },
      signal: AbortSignal.timeout(2000) // 2 second timeout
    });

    if (!response.ok) return null;

    const country = normalizeCountryCode((await response.text()).trim());
    if (country) {
      return country;
    }

    return 'BG'; // Default to Bulgaria when location is unsupported
  } catch {
    return null;
  }
}

// Get country from cookies
export function getCountryFromCookie(event: RequestEvent): CountryCode | null {
  const country = event.cookies.get(COOKIES.COUNTRY) || event.cookies.get('country');
  if (country && country in COUNTRY_CONFIGS) {
    return country as CountryCode;
  }
  return null;
}

// Set country in cookie
export function setCountryCookie(event: RequestEvent, country: CountryCode): void {
  event.cookies.set(COOKIES.COUNTRY, country, {
    path: '/',
    maxAge: 365 * 24 * 60 * 60, // 1 year
    httpOnly: false,
    sameSite: 'lax',
    secure: !dev
  });
}

// Get user's country with fallback chain
export async function getUserCountry(event: RequestEvent): Promise<CountryCode> {
  // 1. Check URL parameter (highest priority for testing)
  let urlCountry: string | null = null;
  try {
    urlCountry = event.url.searchParams.get('country');
  } catch {
    // Handle prerendering context where searchParams is not available
    urlCountry = null;
  }
  if (urlCountry && urlCountry in COUNTRY_CONFIGS) {
    const country = urlCountry as CountryCode;
    setCountryCookie(event, country);
    return country;
  }
  
  // 2. Check Vercel host-based headers (from subdomain mapping)
  const headerCountry = detectCountryFromHeaders(event.request);
  if (headerCountry) {
    setCountryCookie(event, headerCountry);
    return headerCountry;
  }
  
  // 3. Check subdomain/domain (fallback if headers not set)
  const { getCountryFromDomain } = await import('$lib/country/constants');
  const domainCountry = getCountryFromDomain(event.url.hostname);
  if (domainCountry) {
    setCountryCookie(event, domainCountry);
    return domainCountry;
  }

  // 4. Check cookie
  const cookieCountry = getCountryFromCookie(event);
  if (cookieCountry) {
    return cookieCountry;
  }

  // 5. Check Vercel geo headers
  // 6. Detect from IP
  const ipCountry = await detectCountryFromIP(event);
  if (ipCountry) {
    setCountryCookie(event, ipCountry);
    return ipCountry;
  }

  // 7. Default to Bulgaria
  return 'BG';
}
