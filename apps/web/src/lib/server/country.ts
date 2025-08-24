import type { RequestEvent } from '@sveltejs/kit';
import { getUserCountry, type CountryCode } from '$lib/country/detection';

/**
 * Setup country detection for the request event
 * Handles country detection from IP, cookies, and URL parameters
 */
export async function setupCountry(event: RequestEvent): Promise<void> {
  const country = await getUserCountry(event);
  
  // Store country in locals for easy access
  (event.locals as any).country = country;
}