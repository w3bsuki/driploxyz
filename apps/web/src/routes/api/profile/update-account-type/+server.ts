import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { enforceRateLimit } from '$lib/server/security/rate-limiter';

export const POST: RequestHandler = async (event) => {
  // Rate limiting for profile account type updates
  const rateLimitResponse = await enforceRateLimit(
    event.request, 
    event.getClientAddress, 
    'api',
    `profile-update:${event.getClientAddress()}`
  );
  if (rateLimitResponse) return rateLimitResponse;
  
  try {
    const { accountType } = await event.request.json();
    
    if (!accountType || !['personal', 'premium', 'brand'].includes(accountType)) {
      return json({ error: 'Invalid account type' }, { status: 400 });
    }

    const supabase = event.locals.supabase;
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return json({ error: 'Authentication required' }, { status: 401 });
    }

    // Update the user's profile with the new account type
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        account_type: accountType,
        verified: accountType !== 'personal', // Verified for premium/brand after payment
        brand_status: accountType === 'brand' ? 'brand' : (accountType === 'premium' ? 'premium' : null)
      })
      .eq('id', user.id);

    if (updateError) {
      
      return json({ error: 'Failed to update profile' }, { status: 500 });
    }

    // If brand account, ensure brand entry exists
    if (accountType === 'brand') {
      // Get profile data for brand creation
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, full_name')
        .eq('id', user.id)
        .single();

      if (profile) {
        // Create or update brand entry
        const { error: brandError } = await supabase
          .from('brands')
          .upsert({
            profile_id: user.id,
            brand_name: profile.full_name || profile.username,
            brand_description: `${profile.username} - Professional fashion brand`,
            verified_brand: true,
            subscription_active: true
          }, {
            onConflict: 'profile_id'
          });

        if (brandError) {
          // Brand creation errors are non-critical - profile update continues
        }
      }
    }

    return json({ 
      success: true,
      accountType,
      userId: user.id,
      email: user.email
    });
    
  } catch {
    
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};