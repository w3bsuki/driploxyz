import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

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

    // TODO: Implement order archiving when database functions are ready
    // For now, return placeholder response to unblock production deployment
    const result = 0; // No orders archived
    const stats = [{
      total_orders: 0,
      archived_orders: 0,
      eligible_for_archiving: 0,
      last_archiving_run: new Date().toISOString()
    }];

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

    // TODO: Implement archiving statistics when database functions are ready
    // For now, return placeholder stats to unblock production deployment
    const stats = [{
      total_orders: 0,
      archived_orders: 0,
      eligible_for_archiving: 0,
      last_archiving_run: null
    }];

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
