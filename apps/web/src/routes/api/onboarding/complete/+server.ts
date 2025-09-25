import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { enforceRateLimit } from '$lib/security/rate-limiter';

export const POST: RequestHandler = async ({ request, locals: { supabase, safeGetSession }, getClientAddress }) => {
  // Rate limiting for onboarding completion
  const rateLimitResponse = await enforceRateLimit(
    request, 
    getClientAddress, 
    'api',
    `onboarding:${getClientAddress()}`
  );
  if (rateLimitResponse) return rateLimitResponse;
  
  const { session, user } = await safeGetSession();

  if (!session || !user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profileData = await request.json();

  try {
    // Update user profile with onboarding data
    const { error } = await supabase
      .from('profiles')
      .update({
        username: profileData.username,
        bio: profileData.bio,
        avatar_url: profileData.avatar || null,
        interests: profileData.interests || [],
        seller_type: profileData.sellerType || 'individual',
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (error) {
      return json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return json({ success: true });
  } catch {
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};