import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * GET /api/notifications
 * Fetch user notifications with pagination and filtering
 * 
 * Query params:
 * - limit: number (default: 20, max: 100)
 * - offset: number (default: 0)
 * - unread_only: boolean (default: false)
 * - category: string (optional) - filter by category
 */
export const GET: RequestHandler = async ({ locals, url }) => {
  const { session, user } = await locals.safeGetSession();

  if (!session || !user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse query parameters
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
  const offset = parseInt(url.searchParams.get('offset') || '0');
  const unreadOnly = url.searchParams.get('unread_only') === 'true';
  const category = url.searchParams.get('category');

  try {
    // Build query
    let query = locals.supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (unreadOnly) {
      query = query.eq('read', false);
    }
    if (category) {
      query = query.eq('category', category);
    }

    const { data: notifications, error, count } = await query;

    if (error) {
      console.error('[Notifications API] Error fetching notifications:', error);
      return json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }

    // Get unread count
    const { count: unreadCount } = await locals.supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false);

    return json({
      notifications: notifications || [],
      total: count || 0,
      unreadCount: unreadCount || 0,
      limit,
      offset,
      hasMore: (offset + limit) < (count || 0)
    });
  } catch (error) {
    console.error('[Notifications API] Exception:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

/**
 * PATCH /api/notifications
 * Mark notifications as read
 * 
 * Body:
 * - notification_ids: string[] (optional) - specific notifications to mark as read
 * - mark_all: boolean (optional) - mark all notifications as read
 */
export const PATCH: RequestHandler = async ({ locals, request }) => {
  const { session, user } = await locals.safeGetSession();

  if (!session || !user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { notification_ids, mark_all } = body;

    if (mark_all) {
      // Mark all notifications as read
      const { error } = await locals.supabase
        .from('notifications')
        .update({ 
          read: true,
          dismissed_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) {
        console.error('[Notifications API] Error marking all as read:', error);
        return json({ error: 'Failed to mark notifications as read' }, { status: 500 });
      }

      return json({ success: true, message: 'All notifications marked as read' });
    }

    if (notification_ids && Array.isArray(notification_ids) && notification_ids.length > 0) {
      // Mark specific notifications as read
      const { error } = await locals.supabase
        .from('notifications')
        .update({ 
          read: true,
          dismissed_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .in('id', notification_ids);

      if (error) {
        console.error('[Notifications API] Error marking notifications as read:', error);
        return json({ error: 'Failed to mark notifications as read' }, { status: 500 });
      }

      return json({ 
        success: true, 
        message: `${notification_ids.length} notification(s) marked as read` 
      });
    }

    return json({ error: 'No notifications specified' }, { status: 400 });
  } catch (error) {
    console.error('[Notifications API] Exception:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

/**
 * DELETE /api/notifications
 * Delete notifications
 * 
 * Body:
 * - notification_ids: string[] (optional) - specific notifications to delete
 * - delete_all_read: boolean (optional) - delete all read notifications
 */
export const DELETE: RequestHandler = async ({ locals, request }) => {
  const { session, user } = await locals.safeGetSession();

  if (!session || !user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { notification_ids, delete_all_read } = body;

    if (delete_all_read) {
      // Delete all read notifications
      const { error } = await locals.supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id)
        .eq('read', true);

      if (error) {
        console.error('[Notifications API] Error deleting read notifications:', error);
        return json({ error: 'Failed to delete notifications' }, { status: 500 });
      }

      return json({ success: true, message: 'All read notifications deleted' });
    }

    if (notification_ids && Array.isArray(notification_ids) && notification_ids.length > 0) {
      // Delete specific notifications
      const { error } = await locals.supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id)
        .in('id', notification_ids);

      if (error) {
        console.error('[Notifications API] Error deleting notifications:', error);
        return json({ error: 'Failed to delete notifications' }, { status: 500 });
      }

      return json({ 
        success: true, 
        message: `${notification_ids.length} notification(s) deleted` 
      });
    }

    return json({ error: 'No notifications specified' }, { status: 400 });
  } catch (error) {
    console.error('[Notifications API] Exception:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
