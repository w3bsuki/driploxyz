import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { activateBrandStatus } from '@repo/core';

export const load = (async ({ url, locals }) => {
  const { session, user } = await locals.safeGetSession();

  if (!session || !user) {
    redirect(303, '/login');
  }

  const params = url.searchParams;
  const paymentIntentStatus = params.get('payment_intent_status');
  const subscriptionId = params.get('subscription_id');
  
  let brandActivated = false;
  let planName = 'Premium';
  
  if (paymentIntentStatus === 'succeeded' && subscriptionId) {
    // Get user's profile to check if they're a brand account
    const { data: profile } = await locals.supabase
      .from('profiles')
      .select('brand_status')
      .eq('id', user.id)
      .single();

    // If user has brand_pending status, activate their brand
    if (profile?.brand_status === 'brand_pending') {
      const result = await activateBrandStatus(locals.supabase, {
        userId: user.id,
        subscriptionId
      });
      
      if (result.success) {
        brandActivated = true;
        planName = 'Brand';
      }
    }
  }

  return {
    paymentIntentStatus,
    subscriptionId,
    brandActivated,
    planName
  };
}) satisfies PageServerLoad;