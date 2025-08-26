import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';
import { PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

function createSupabaseAdmin() {
  return createClient<Database>(
    PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

export const POST: RequestHandler = async ({ request, locals: { safeGetSession } }) => {
  try {
    // Check authentication
    const { session } = await safeGetSession();
    
    if (!session?.user) {
      return error(401, 'Authentication required');
    }

    // For now, allow any authenticated user to trigger archiving
    // In production, you might want to restrict this to admin users
    // You can add a role check here later

    const supabase = createSupabaseAdmin();

    // Call the database function to archive completed orders
    const { data: result, error: archiveError } = await supabase
      .rpc('archive_completed_orders');

    if (archiveError) {
      console.error('Error archiving orders:', archiveError);
      return error(500, 'Failed to archive orders');
    }

    // Get archiving statistics
    const { data: stats, error: statsError } = await supabase
      .rpc('get_archiving_stats');

    if (statsError) {
      console.error('Error getting archiving stats:', statsError);
    }

    return json({
      success: true,
      archived_count: result || 0,
      message: `Successfully archived ${result || 0} completed orders`,
      stats: stats?.[0] || null
    });

  } catch (err) {
    console.error('Archive orders API error:', err);
    return error(500, 'Internal server error');
  }
};

export const GET: RequestHandler = async ({ locals: { safeGetSession } }) => {
  try {
    // Check authentication
    const { session } = await safeGetSession();
    
    if (!session?.user) {
      return error(401, 'Authentication required');
    }

    const supabase = createSupabaseAdmin();

    // Get archiving statistics
    const { data: stats, error: statsError } = await supabase
      .rpc('get_archiving_stats');

    if (statsError) {
      console.error('Error getting archiving stats:', statsError);
      return error(500, 'Failed to get archiving statistics');
    }

    return json({
      success: true,
      stats: stats?.[0] || {
        total_orders: 0,
        archived_orders: 0,
        eligible_for_archiving: 0,
        last_archiving_run: null
      }
    });

  } catch (err) {
    console.error('Archive stats API error:', err);
    return error(500, 'Internal server error');
  }
};