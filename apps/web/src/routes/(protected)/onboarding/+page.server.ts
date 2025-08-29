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
    const location = formData.get('location') as string;
    const avatarUrl = formData.get('avatarUrl') as string;
    const payoutMethod = formData.get('payoutMethod') as string;
    const payoutDetails = formData.get('payoutDetails') as string;
    const payoutName = formData.get('payoutName') as string;
    const socialLinks = formData.get('socialLinks') as string;
    const brandPaid = formData.get('brandPaid') === 'true';
    
    console.log('[ONBOARDING COMPLETE] Starting completion for user:', user.email, { accountType, brandPaid });
    
    // SERVER-SIDE VALIDATION: Verify payment for brand/premium accounts
    if (accountType === 'brand' || accountType === 'premium') {
      // First check the client flag
      if (!brandPaid) {
        console.error('[ONBOARDING COMPLETE] Payment required but not completed:', { accountType, brandPaid });
        return fail(403, { error: 'Payment is required for ' + accountType + ' accounts. Please complete payment before continuing.' });
      }
      
      // Verify payment in database (within last 30 minutes to allow for webhook processing)
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      const { data: recentPayment, error: paymentError } = await supabase
        .from('user_payments')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .in('plan_type', ['brand', 'premium'])
        .gte('created_at', thirtyMinutesAgo)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (paymentError) {
        console.error('[ONBOARDING COMPLETE] Error checking payment:', paymentError);
        return fail(500, { error: 'Failed to verify payment. Please try again.' });
      }
      
      if (!recentPayment) {
        console.error('[ONBOARDING COMPLETE] No valid payment found for:', { accountType, userId: user.id });
        return fail(403, { 
          error: 'Payment verification failed. Please ensure your payment was processed successfully before continuing.' 
        });
      }
      
      console.log('[ONBOARDING COMPLETE] Payment verified:', { 
        paymentId: recentPayment.id, 
        planType: recentPayment.plan_type,
        amount: recentPayment.amount 
      });
    }

    if (!username || username.trim().length < 3) {
      return fail(400, { error: 'Username must be at least 3 characters' });
    }

    if (!fullName || fullName.trim().length === 0) {
      return fail(400, { error: 'Full name is required' });
    }

    // Location is optional

    if (!payoutDetails || payoutDetails.trim().length === 0) {
      return fail(400, { error: 'Payout details are required' });
    }

    if (!payoutName || payoutName.trim().length === 0) {
      return fail(400, { error: 'Payout name is required' });
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

      // Determine subscription tier based on account type and payment status
      let subscriptionTier = 'free';
      if (accountType === 'brand' && brandPaid) {
        subscriptionTier = 'brand';
      } else if (accountType === 'premium' && brandPaid) {
        subscriptionTier = 'premium';
      }

      // Build profile update object
      const profileUpdate = {
        account_type: accountType,
        username: username.trim(),
        full_name: fullName.trim(),
        location: location?.trim() || null,
        avatar_url: avatarUrl || null,
        payout_method: { 
          type: payoutMethod, 
          details: payoutDetails.trim(), 
          name: payoutName.trim()
        },
        social_links: parsedSocialLinks.filter((link: any) => link.url?.trim()),
        onboarding_completed: true,
        verified: (accountType === 'brand' || accountType === 'premium') && brandPaid,
        brand_status: accountStatus,
        subscription_tier: subscriptionTier,
        updated_at: new Date().toISOString()
      };

      console.log('[ONBOARDING COMPLETE] Updating profile with:', profileUpdate);

      // UPSERT profile - this handles both update and insert cases
      const { data: updatedProfile, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...profileUpdate
        })
        .select()
        .single();

      if (profileError) {
        console.error('[ONBOARDING COMPLETE] Profile update failed:', profileError);
        return fail(500, { error: 'Failed to update profile: ' + profileError.message });
      }

      console.log('[ONBOARDING COMPLETE] Profile updated successfully:', updatedProfile);

      // VERIFY the update actually succeeded by reading it back
      const { data: verifiedProfile, error: verifyError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (verifyError || !verifiedProfile) {
        console.error('[ONBOARDING COMPLETE] Failed to verify profile update:', verifyError);
        return fail(500, { error: 'Failed to verify profile completion. Please try again.' });
      }

      if (verifiedProfile.onboarding_completed !== true) {
        console.error('[ONBOARDING COMPLETE] Profile onboarding_completed is still false after update!');
        return fail(500, { error: 'Profile update failed to save. Please contact support.' });
      }

      console.log('[ONBOARDING COMPLETE] Verified profile data:', {
        id: verifiedProfile.id,
        username: verifiedProfile.username,
        account_type: verifiedProfile.account_type,
        onboarding_completed: verifiedProfile.onboarding_completed
      });

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
      
      // Return success with verified profile data
      return { 
        success: true, 
        profile: verifiedProfile,
        redirectTo: '/dashboard'
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