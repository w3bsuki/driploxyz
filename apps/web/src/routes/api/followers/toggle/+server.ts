import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals: { supabase, session } }) => {
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
    const { data: existingFollow } = await supabase
      .from('followers')
      .select('id')
      .eq('follower_id', session.user.id)
      .eq('following_id', following_id)
      .single();

    if (existingFollow) {
      // Unfollow
      const { error: deleteError } = await supabase
        .from('followers')
        .delete()
        .eq('follower_id', session.user.id)
        .eq('following_id', following_id);

      if (deleteError) {
        console.error('Error unfollowing:', deleteError);
        throw error(500, 'Failed to unfollow');
      }

      return json({ following: false });
    } else {
      // Follow
      const { error: insertError } = await supabase
        .from('followers')
        .insert({
          follower_id: session.user.id,
          following_id: following_id
        });

      if (insertError) {
        console.error('Error following:', insertError);
        throw error(500, 'Failed to follow');
      }

      // Get follower info for notifications
      const { data: followerInfo } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url')
        .eq('id', session.user.id)
        .single();

      return json({ 
        following: true,
        follower: followerInfo
      });
    }
  } catch (err) {
    console.error('Follow toggle error:', err);
    throw error(500, 'Internal server error');
  }
};