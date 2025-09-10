import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { setCountryCookie } from '$lib/country/detection';

export const POST: RequestHandler = async (event) => {
  const { region } = await event.request.json();
  
  if (!['BG', 'UK'].includes(region)) {
    return json({ error: 'Invalid region' }, { status: 400 });
  }
  
  // Convert region to country code and set cookie using unified system
  const countryCode = region === 'UK' ? 'GB' : 'BG';
  setCountryCookie(event, countryCode);
  
  // Update user profile if logged in
  const { session } = await event.locals.safeGetSession();
  if (session?.user) {
    const { error } = await event.locals.supabase
      .from('profiles')
      .update({ 
        region,
        currency: region === 'UK' ? 'GBP' : 'BGN'
      })
      .eq('id', session.user.id);
      
    if (error) {
      console.error('Failed to update user region:', error);
    }
  }
  
  return json({ success: true, region });
};