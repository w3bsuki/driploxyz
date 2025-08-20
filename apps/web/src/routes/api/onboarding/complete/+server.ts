import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals: { supabase, getSession } }) => {
  const session = await getSession();
  
  if (!session?.user) {
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
      .eq('id', session.user.id);

    if (error) {
      console.error('Profile update error:', error);
      return json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return json({ success: true });
  } catch (error) {
    console.error('Onboarding error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};