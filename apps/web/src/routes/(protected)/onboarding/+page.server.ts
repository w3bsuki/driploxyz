import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { safeGetSession }, parent }) => {
  const { session, user } = await safeGetSession();
  
  if (!session || !user) {
    throw redirect(303, '/login');
  }

  const parentData = await parent();
  
  // Check if onboarding is already completed
  if (parentData.profile?.onboarding_completed) {
    throw redirect(303, '/dashboard');
  }

  return {
    user,
    profile: parentData.profile
  };
};

export const actions: Actions = {
  complete: async ({ request, locals: { supabase, safeGetSession } }) => {
    const { session, user } = await safeGetSession();
    
    if (!session || !user) {
      return fail(401, { error: 'Unauthorized' });
    }

    const formData = await request.formData();
    
    const accountType = formData.get('accountType') as string;
    const username = formData.get('username') as string;
    const fullName = formData.get('fullName') as string;
    const avatarUrl = formData.get('avatarUrl') as string;
    const payoutMethod = formData.get('payoutMethod') as string;
    const payoutDetails = formData.get('payoutDetails') as string;
    const payoutName = formData.get('payoutName') as string;
    const socialLinks = formData.get('socialLinks') as string;
    const brandPaid = formData.get('brandPaid') === 'true';

    if (!username || username.trim().length < 3) {
      return fail(400, { error: 'Username must be at least 3 characters' });
    }

    try {
      // Determine account status based on selection
      let accountStatus = null;
      if (accountType === 'brand') {
        accountStatus = brandPaid ? 'brand' : 'brand_pending';
      } else if (accountType === 'premium') {
        accountStatus = brandPaid ? 'premium' : 'premium_pending';
      }
      
      // Parse social links
      let parsedSocialLinks = [];
      try {
        parsedSocialLinks = socialLinks ? JSON.parse(socialLinks) : [];
      } catch (e) {
        parsedSocialLinks = [];
      }

      // Update profile with service role client to bypass RLS
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          account_type: accountType,
          username: username.trim(),
          full_name: fullName?.trim() || null,
          avatar_url: avatarUrl || null,
          payout_method: payoutDetails ? { 
            type: payoutMethod, 
            details: payoutDetails.trim(), 
            name: payoutName?.trim() || null 
          } : null,
          social_links: parsedSocialLinks.filter((link: any) => link.url?.trim()),
          onboarding_completed: true,
          verified: (accountType === 'brand' || accountType === 'premium') && brandPaid,
          brand_status: accountStatus
        })
        .eq('id', user.id);

      if (profileError) {
        return fail(500, { error: 'Failed to update profile' });
      }

      // If brand account, create brand entry
      if (accountType === 'brand') {
        const { error: brandError } = await supabase
          .from('brands')
          .insert({
            profile_id: user.id,
            brand_name: fullName?.trim() || username.trim(),
            brand_description: `${username.trim()} - Professional fashion brand`,
            verified_brand: brandPaid,
            subscription_active: brandPaid
          });

        if (brandError && brandError.code !== '23505') { // Ignore duplicate key error
          // Silently ignore in production
        }
      }

      // Return success instead of redirect to avoid hanging with client-side handling
      return { success: true };
    } catch (error) {
      if (error instanceof Response) {
        throw error; // Re-throw redirects
      }
      return fail(500, { error: 'Something went wrong. Please try again.' });
    }
  }
};