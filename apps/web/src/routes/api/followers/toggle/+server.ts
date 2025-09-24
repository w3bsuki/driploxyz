import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { enforceRateLimit } from '$lib/security/rate-limiter';

export const POST: RequestHandler = async ({ request, locals, getClientAddress }) => {
  // Rate limiting for follow/unfollow actions
  const rateLimitResponse = await enforceRateLimit(
    request, 
    getClientAddress, 
    'followers',
    `followers:${getClientAddress()}`
  );
  if (rateLimitResponse) return rateLimitResponse;
  
  const { session } = await locals.safeGetSession();
  if (!session?.user) {
    throw error(401, 'Unauthorized');
  }

  try {
    const { following_id } = await request.json();

    if (!following_id) {
      throw error(400, 'Missing following_id');
    }

    if (following_id === session.user.id) {
      throw error(400, 'Cannot follow yourself');
    }

    // Check if already following
    const { data: existingFollow } = await locals.supabase
      .from('followers')
      .select('id')
      .eq('follower_id', session.user.id)
      .eq('following_id', following_id)
      .single();

    if (existingFollow) {
      // Unfollow
      const { error: deleteError } = await locals.supabase
        .from('followers')
        .delete()
        .eq('follower_id', session.user.id)
        .eq('following_id', following_id);

      if (deleteError) {
        throw error(500, 'Failed to unfollow');
      }

      return json({ following: false });
    } else {
      // Follow
      const { error: insertError } = await locals.supabase
        .from('followers')
        .insert({
          follower_id: session.user.id,
          following_id: following_id
        });

      if (insertError) {
        throw error(500, 'Failed to follow');
      }

      // Get follower info for notifications
      const { data: followerInfo } = await locals.supabase
        .from('profiles')
        .select('username, full_name, avatar_url')
        .eq('id', session.user.id)
        .single();

      return json({ 
        following: true,
        follower: followerInfo
      });
    }
  } catch {
    throw error(500, 'Internal server error');
  }
};