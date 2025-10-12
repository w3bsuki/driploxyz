import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { enforceRateLimit } from '$lib/server/security/rate-limiter';

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
  const { session, user } = await locals.safeGetSession();

  if (!followingId) {
    return json({ error: 'Missing followingId parameter' }, { status: 400 });
  }

  // Get follower count for the user being followed
  const { data: profile, error: profileError } = await locals.supabase
    .from('profiles')
    .select('followers_count')
    .eq('id', followingId)
    .single();

  if (profileError) {
    return json({ error: 'User not found' }, { status: 404 });
  }

  let isFollowing = false;

  // Check if current user is following (if logged in)
  if (session && user) {
    const { data: follow, error: followError } = await locals.supabase
      .from('followers')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', followingId)
      .single();

    // Note: followError is expected when no follow relationship exists
    if (!followError) {
      isFollowing = !!follow;
    }
  }

  return json({
    isFollowing,
    followerCount: profile.followers_count || 0
  });
};