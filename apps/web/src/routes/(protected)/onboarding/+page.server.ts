import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

/**
 * Onboarding Page Load Function
 * 
 * Ensures users who have already completed onboarding are redirected to dashboard.
 * Provides necessary data for users still in onboarding process.
 */
export const load: PageServerLoad = async ({ locals: { safeGetSession }, parent, url }) => {
  const { session, user } = await safeGetSession();
  
  console.log('[ONBOARDING LOAD] Loading onboarding for user:', user?.email);
  
  if (!session || !user) {
    console.log('[ONBOARDING LOAD] No session/user, redirecting to login');
    throw redirect(303, '/login');
  }

  const parentData = await parent();
  
  console.log('[ONBOARDING LOAD] Profile status:', {
    hasProfile: !!parentData.profile,
    onboardingCompleted: parentData.profile?.onboarding_completed,
    accountType: parentData.profile?.account_type
  });
  
  // Check if onboarding is already completed
  if (parentData.profile?.onboarding_completed === true) {
    console.log('[ONBOARDING LOAD] User already completed onboarding, redirecting to dashboard');
    throw redirect(303, '/dashboard');
  }

  console.log('[ONBOARDING LOAD] User needs onboarding, proceeding with page load');

  return {
    user,
    profile: parentData.profile
  };
};

export const actions: Actions = {
  complete: async ({ request, locals: { supabase, safeGetSession }, cookies }) => {
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
    
    console.log('[ONBOARDING COMPLETE] Starting completion for user:', user.email, { accountType, brandPaid });
    
    // SERVER-SIDE VALIDATION: Absolutely no brand/premium without payment
    if ((accountType === 'brand' || accountType === 'premium') && !brandPaid) {
      console.error('[ONBOARDING COMPLETE] Payment required but not completed:', { accountType, brandPaid });
      return fail(403, { error: 'Payment is required for ' + accountType + ' accounts. Please complete payment before continuing.' });
    }

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
      
      // Parse social links safely
      let parsedSocialLinks = [];
      try {
        parsedSocialLinks = socialLinks ? JSON.parse(socialLinks) : [];
      } catch (e) {
        console.warn('[ONBOARDING COMPLETE] Failed to parse social links:', e);
        parsedSocialLinks = [];
      }

      // Build profile update object
      const profileUpdate = {
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
        brand_status: accountStatus,
        updated_at: new Date().toISOString()
      };

      console.log('[ONBOARDING COMPLETE] Updating profile with:', profileUpdate);

      // Update profile - this is the CRITICAL step that completes onboarding
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', user.id);

      if (profileError) {
        console.error('[ONBOARDING COMPLETE] Profile update failed:', profileError);
        return fail(500, { error: 'Failed to update profile: ' + profileError.message });
      }

      console.log('[ONBOARDING COMPLETE] Profile updated successfully');

      // If brand account, create brand entry (with error handling)
      if (accountType === 'brand') {
        const brandData = {
          profile_id: user.id,
          brand_name: fullName?.trim() || username.trim(),
          brand_description: `${username.trim()} - Professional fashion brand`,
          verified_brand: brandPaid,
          subscription_active: brandPaid
        };

        console.log('[ONBOARDING COMPLETE] Creating brand entry:', brandData);

        const { error: brandError } = await supabase
          .from('brands')
          .insert(brandData);

        if (brandError) {
          if (brandError.code === '23505') {
            console.log('[ONBOARDING COMPLETE] Brand entry already exists (duplicate key), continuing...');
          } else {
            console.error('[ONBOARDING COMPLETE] Brand creation failed:', brandError);
            // Don't fail the entire onboarding for brand table issues
          }
        } else {
          console.log('[ONBOARDING COMPLETE] Brand entry created successfully');
        }
      }

      // CRITICAL: Invalidate auth session to force profile refresh on next page load
      // This ensures the protected route guard sees the updated onboarding_completed = true
      await supabase.auth.refreshSession();
      
      console.log('[ONBOARDING COMPLETE] Onboarding completed successfully for user:', user.email);
      
      // Return success with profile data to avoid race conditions
      return { 
        success: true, 
        profile: {
          ...profileUpdate,
          id: user.id
        }
      };
      
    } catch (error) {
      if (error instanceof Response) {
        throw error; // Re-throw redirects
      }
      
      console.error('[ONBOARDING COMPLETE] Unexpected error:', error);
      return fail(500, { error: 'Something went wrong during onboarding. Please try again.' });
    }
  }
};