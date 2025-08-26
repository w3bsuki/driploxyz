import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';

// Initialize Supabase with service role key for admin operations
const supabase = createClient<Database>(
  process.env.PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export const GET: RequestHandler = async ({ request }) => {
  try {
    // Simple security check - you can enhance this with a secret token
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET_TOKEN || 'default-cron-secret';
    
    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Running automated order archiving...');

    // Call the database function to archive completed orders
    const { data: result, error: archiveError } = await supabase
      .rpc('archive_completed_orders');

    if (archiveError) {
      console.error('Error archiving orders:', archiveError);
      return json({ 
        success: false, 
        error: 'Failed to archive orders',
        details: archiveError.message 
      }, { status: 500 });
    }

    const archivedCount = result || 0;
    console.log(`Automated archiving completed: ${archivedCount} orders archived`);

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