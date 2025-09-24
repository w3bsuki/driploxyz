import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createLogger } from '$lib/utils/log';

const log = createLogger('onboarding');

/**
 * Onboarding Page Load Function
 * 
 * Ensures users who have already completed onboarding are redirected to dashboard.
 * Provides necessary data for users still in onboarding process.
 */
export const load = (async ({ locals: { safeGetSession }, parent }) => {
  const { session, user } = await safeGetSession();
  
  log.debug('Loading onboarding page', { userEmail: user?.email });
  
  if (!session || !user) {
    log.debug('No session/user, redirecting to login');
    throw redirect(303, '/login');
  }

  const parentData = await parent();
  
  log.debug('Profile status check', {
    hasProfile: (!!parentData.profile).toString(),
    onboardingCompleted: parentData.profile?.onboarding_completed?.toString(),
    accountType: parentData.profile?.account_type || undefined
  });
  
  // Check if onboarding is already completed
  if (parentData.profile?.onboarding_completed === true) {
    log.debug('User already completed onboarding, redirecting to dashboard');
    throw redirect(303, '/dashboard');
  }

  log.debug('User needs onboarding, proceeding with page load');

  return {
    user,
    profile: parentData.profile
  };
}) satisfies PageServerLoad;

export const actions = {
  complete: async ({ request, locals: { supabase, safeGetSession } }) => {
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
    
    log.debug('Starting onboarding completion', { userEmail: user.email, accountType, brandPaid: brandPaid.toString() });
    
    // SERVER-SIDE VALIDATION: Verify payment for brand/pro accounts
    if (accountType === 'brand' || accountType === 'pro') {
      // First check the client flag
      if (!brandPaid) {
        log.error('Payment required but not completed', undefined, { accountType, brandPaid: brandPaid.toString() });
        return fail(403, { error: 'Payment is required for ' + accountType + ' accounts. Please complete payment before continuing.' });
      }
      
      // Verify payment in database (within last 30 minutes to allow for webhook processing)
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      const { data: recentPayment, error: paymentError } = await supabase
        .from('user_payments')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .in('plan_type', ['brand', 'pro'])
        .gte('created_at', thirtyMinutesAgo)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (paymentError) {
        log.error('Error checking payment', paymentError);
        return fail(500, { error: 'Failed to verify payment. Please try again.' });
      }
      
      if (!recentPayment) {
        log.error('No valid payment found', undefined, { accountType, userId: user.id });
        return fail(403, { 
          error: 'Payment verification failed. Please ensure your payment was processed successfully before continuing.' 
        });
      }
      
      log.debug('Payment verified', {
        paymentId: recentPayment.id,
        planType: recentPayment.plan_type || undefined,
        amount: recentPayment.amount?.toString()
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
      } else if (accountType === 'pro') {
        accountStatus = brandPaid ? 'pro' : 'pro_pending';
      }
      
      // Parse social links safely
      let parsedSocialLinks = [];
      try {
        parsedSocialLinks = socialLinks ? JSON.parse(socialLinks) : [];
      } catch (e) {
        log.warn('Failed to parse social links', { error: String(e) });
        parsedSocialLinks = [];
      }

      // Determine subscription tier based on account type and payment status
      let subscriptionTier = 'free';
      if (accountType === 'brand' && brandPaid) {
        subscriptionTier = 'brand';
      } else if (accountType === 'pro' && brandPaid) {
        subscriptionTier = 'pro';
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
        social_links: parsedSocialLinks.filter((link: { url?: string }) => link.url?.trim()),
        onboarding_completed: true,
        verified: (accountType === 'brand' || accountType === 'pro') && brandPaid,
        brand_status: accountStatus,
        subscription_tier: subscriptionTier,
        updated_at: new Date().toISOString()
      };

      log.debug('Updating profile', {
        accountType: profileUpdate.account_type,
        username: profileUpdate.username,
        location: profileUpdate.location || undefined
      });

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
        log.error('Profile update failed', profileError);
        return fail(500, { error: 'Failed to update profile: ' + profileError.message });
      }

      log.debug('Profile updated successfully', {
        profileId: updatedProfile?.id || undefined,
        username: updatedProfile?.username || undefined
      });

      // VERIFY the update actually succeeded by reading it back
      const { data: verifiedProfile, error: verifyError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (verifyError || !verifiedProfile) {
        log.error('Failed to verify profile update', verifyError);
        return fail(500, { error: 'Failed to verify profile completion. Please try again.' });
      }

      if (verifiedProfile.onboarding_completed !== true) {
        log.error('Profile onboarding_completed is still false after update');
        return fail(500, { error: 'Profile update failed to save. Please contact support.' });
      }

      log.debug('Verified profile data', {
        profileId: verifiedProfile.id,
        username: verifiedProfile.username || undefined,
        accountType: verifiedProfile.account_type || undefined,
        onboardingCompleted: verifiedProfile.onboarding_completed ? 'true' : 'false'
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

        log.debug('Creating brand entry', {
          profileId: brandData.profile_id,
          brandName: brandData.brand_name,
          verified: brandData.verified_brand ? 'true' : 'false'
        });

        const { error: brandError } = await supabase
          .from('brands')
          .insert(brandData);

        if (brandError) {
          if (brandError.code === '23505') {
            log.debug('Brand entry already exists (duplicate key), continuing');
          } else {
            log.error('Brand creation failed', brandError);
            // Don't fail the entire onboarding for brand table issues
          }
        } else {
          log.debug('Brand entry created successfully');
        }
      }

      // CRITICAL: Invalidate auth session to force profile refresh on next page load
      // This ensures the protected route guard sees the updated onboarding_completed = true
      await supabase.auth.refreshSession();
      
      log.info('Onboarding completed successfully', { userEmail: user.email });
      
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
      
      log.error('Unexpected error during onboarding', error);
      return fail(500, { error: 'Something went wrong during onboarding. Please try again.' });
    }
  }
} satisfies Actions;