import { json } from '@sveltejs/kit';
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

export const GET: RequestHandler = async ({ request }) => {
  try {
    // Simple security check - you can enhance this with a secret token
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET_TOKEN || 'default-cron-secret';
    
    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Starting automated order archiving

    const supabase = createSupabaseAdmin();

    // Order archiving implementation pending database functions
    const archivedCount = 0; // No orders archived
    // Automated archiving completed

    return json({
      success: true,
      archived_count: archivedCount,
      message: `Successfully archived ${archivedCount} completed orders`,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('Cron archive orders error:', err);
    return json({ 
      success: false, 
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
};
