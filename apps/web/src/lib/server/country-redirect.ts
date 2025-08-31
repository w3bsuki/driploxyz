import type { RequestEvent } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { getCountryFromDomain, type CountryCode } from '$lib/country/detection';

/**
 * Handle country-based redirects for proper subdomain access
 * Ensures users access the correct subdomain for their country
 */
export async function handleCountryRedirect(event: RequestEvent): Promise<void> {
  // Skip redirects in development
  if (dev) return;
  
  // Skip for API routes, static assets, and auth pages
  const pathname = event.url.pathname;
  if (
    event.route.id?.startsWith('/api/') || 
    pathname.startsWith('/_app/') ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/forgot-password')
  ) {
    return;
  }
  
  // Only check country redirects on navigation to main pages, not every request
  // Skip if we've already checked this session
  const hasCheckedCountry = event.cookies.get('country_checked');
  if (hasCheckedCountry) {
    return;
  }
  
  try {
    const { user } = await event.locals.safeGetSession();
    if (!user?.id) {
      // No user, no redirect needed
      return;
    }
    
    // Set a cookie to avoid checking on every request for this session
    event.cookies.set('country_checked', 'true', {
      path: '/',
      httpOnly: true,
      secure: !dev,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    });
    
    // Get user's profile country
    const { data: profile } = await event.locals.supabase
      .from('profiles')
      .select('country_code')
      .eq('id', user.id)
      .single();
    
    if (!profile?.country_code) {
      // No country set, no redirect needed
      return;
    }
    
    // Get current subdomain
    const currentSubdomain = getCountryFromDomain(event.url.hostname);
    const userCountry = profile.country_code === 'UK' ? 'GB' : profile.country_code;
    
    // Check if user is on wrong subdomain
    const shouldRedirect = (
      (userCountry === 'GB' && currentSubdomain !== 'GB') ||
      (userCountry === 'BG' && currentSubdomain !== 'BG')
    );
    
    if (shouldRedirect) {
      const targetSubdomain = userCountry === 'GB' ? 'uk' : 'bg';
      const currentHost = event.url.hostname;
      const baseHost = currentHost.replace(/^(uk\.|bg\.)/, '');
      
      const redirectUrl = new URL(event.url);
      redirectUrl.hostname = `${targetSubdomain}.${baseHost}`;
      
      throw redirect(302, redirectUrl.toString());
    }
  } catch (error) {
    // If it's already a redirect, re-throw it
    if (error instanceof Error && 'status' in error) {
      throw error;
    }
    
    // Don't break the app for redirect errors
    console.warn('Country redirect failed:', error);
  }
}

/**
 * Get the correct subdomain URL for a given country
 */
export function getCountrySubdomainUrl(country: CountryCode, currentUrl: URL): string {
  const subdomain = country === 'GB' ? 'uk' : 'bg';
  const baseHost = currentUrl.hostname.replace(/^(uk\.|bg\.)/, '');
  
  const newUrl = new URL(currentUrl);
  newUrl.hostname = `${subdomain}.${baseHost}`;
  
  return newUrl.toString();
}

/**
 * Check if user should be suggested to switch countries
 * Used for showing country switch banners
 */
export function shouldSuggestCountrySwitch(
  userCountry: string | null,
  currentSubdomain: string | null,
  dismissed: boolean = false
): boolean {
  if (dismissed || !userCountry || !currentSubdomain) {
    return false;
  }
  
  const userDbCountry = userCountry === 'UK' ? 'GB' : userCountry;
  return userDbCountry !== currentSubdomain;
}