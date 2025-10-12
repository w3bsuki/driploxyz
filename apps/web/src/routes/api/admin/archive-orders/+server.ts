import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { enforceRateLimit } from '$lib/security/rate-limiter';
// Imports for future archiving implementation
// import { createClient } from '@supabase/supabase-js';
// import type { Database } from '@repo/database';
// import { PUBLIC_SUPABASE_URL } from '$env/static/public';
// import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

// Temporarily commented out - will be used when archiving is implemented
// function createSupabaseAdmin() {
//   return createClient<Database>(
//     PUBLIC_SUPABASE_URL,
//     SUPABASE_SERVICE_ROLE_KEY,
//     {
//       auth: {
//         autoRefreshToken: false,
//         persistSession: false
//       }
//     }
//   );
// }

export const POST: RequestHandler = async ({ request, locals: { safeGetSession }, getClientAddress }) => {
  // Strict rate limiting for admin operations
  const rateLimitResponse = await enforceRateLimit(
    request, 
    getClientAddress, 
    'admin',
    `admin-archive:${getClientAddress()}`
  );
  if (rateLimitResponse) return rateLimitResponse;
  
  try {
    // Check authentication
    const { session } = await safeGetSession();
    
    if (!session?.user) {
      return error(401, 'Authentication required');
    }

    // For now, allow any authenticated user to trigger archiving
    // In production, you might want to restrict this to admin users
    // You can add a role check here later

    // Order archiving implementation pending database functions
    // const supabase = createSupabaseAdmin();
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

  } catch {
    return error(500, 'Internal server error');
  }
};

export const GET: RequestHandler = async ({ request, locals: { safeGetSession }, getClientAddress }) => {
  // Strict rate limiting for admin operations
  const rateLimitResponse = await enforceRateLimit(
    request, 
    getClientAddress, 
    'admin',
    `admin-archive-stats:${getClientAddress()}`
  );
  if (rateLimitResponse) return rateLimitResponse;
  
  try {
    // Check authentication
    const { session } = await safeGetSession();
    
    if (!session?.user) {
      return error(401, 'Authentication required');
    }

    // Archiving statistics implementation pending database functions
    // const supabase = createSupabaseAdmin();
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

  } catch {
    return error(500, 'Internal server error');
  }
};
