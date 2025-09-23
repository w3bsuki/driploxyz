import type { RequestEvent } from '@sveltejs/kit';
import { getUserCountry, type CountryCode, getCountryFromDomain } from '$lib/country/detection';

/**
 * Setup country detection for the request event
 * Handles country detection from IP, cookies, and URL parameters
 * Also syncs user profile country_code if authenticated
 */
export async function setupCountry(event: RequestEvent): Promise<void> {
  const country = await getUserCountry(event);
  
  // Store country in locals for easy access
  (event.locals as any).country = country;
  
  // If user is authenticated and accessed via subdomain, sync their profile
  await syncUserCountryFromSubdomain(event, country);
}

/**
 * Sync user's profile country_code when accessing via subdomain
 * This ensures RLS policies work correctly
 */
async function syncUserCountryFromSubdomain(event: RequestEvent, detectedCountry: CountryCode): Promise<void> {
  try {
    // Only sync if the country was detected from subdomain
    const subdomainCountry = getCountryFromDomain(event.url.hostname);
    if (!subdomainCountry || subdomainCountry !== detectedCountry) {
      return;
    }
    
    // Check if user is authenticated
    const { user } = await event.locals.safeGetSession();
    if (!user?.id) {
      return;
    }
    
    // Convert GB to UK for database compatibility
    const dbCountryCode = detectedCountry === 'GB' ? 'UK' : detectedCountry;
    
    // Update user's profile country_code if different
    const { data: profile } = await event.locals.supabase
      .from('profiles')
      .select('country_code')
      .eq('id', user.id)
      .single();
    
    if (profile && profile.country_code !== dbCountryCode) {
      await event.locals.supabase
        .from('profiles')
        .update({ 
          country_code: dbCountryCode,
          region: dbCountryCode, // Keep region in sync
          currency: detectedCountry === 'GB' ? 'GBP' : 'BGN'
        })
        .eq('id', user.id);
      
      // Log the country update for admin visibility
      
    }
  } catch (error) {
    // Don't throw errors for country sync - it's not critical
    
  }
}