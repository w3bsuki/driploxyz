import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { activateBrandStatus } from '$lib/services/brandService';

export const load = (async ({ url, locals: { supabase, safeGetSession } }) => {
  const { session } = await safeGetSession();
  
  if (!session) {
    throw redirect(303, '/login');
  }

  const params = url.searchParams;
  const paymentIntentStatus = params.get('payment_intent_status');
  const subscriptionId = params.get('subscription_id');
  
  let brandActivated = false;
  let planName = 'Premium';
  
  if (paymentIntentStatus === 'succeeded' && subscriptionId) {
    // Get user's profile to check if they're a brand account
    const { data: profile } = await supabase
      .from('profiles')
      .select('brand_status')
      .eq('id', session.user.id)
      .single();

    // If user has brand_pending status, activate their brand
    if (profile?.brand_status === 'brand_pending') {
      const result = await activateBrandStatus(supabase, {
        userId: session.user.id,
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