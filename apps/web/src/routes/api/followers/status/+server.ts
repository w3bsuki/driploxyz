import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { enforceRateLimit } from '$lib/security/rate-limiter';

// GET - Check if user is following another user and get follower count
export const GET: RequestHandler = async ({ url, locals, request, getClientAddress }) => {
  // Generous rate limiting for read operations
  const rateLimitResponse = await enforceRateLimit(
    request,
    getClientAddress,
    'apiRead',
    `followers-check:${getClientAddress()}`
  );
  if (rateLimitResponse) return rateLimitResponse;

  const followingId = url.searchParams.get('followingId');
  const { session } = await locals.safeGetSession();

  if (!followingId) {
    return json({ error: 'Missing followingId parameter' }, { status: 400 });
  }

  // Get follower count for the user being followed
  const { data: profile } = await locals.supabase
    .from('profiles')
    .select('follower_count')
    .eq('id', followingId)
    .single();

  let isFollowing = false;

  // Check if current user is following (if logged in)
  if (session?.user) {
    const { data: follow } = await locals.supabase
      .from('followers')
      .select('id')
      .eq('follower_id', session.user.id)
      .eq('following_id', followingId)
      .single();

    isFollowing = !!follow;
  }

  return json({
    isFollowing,
    followerCount: profile?.follower_count || 0
  });
};