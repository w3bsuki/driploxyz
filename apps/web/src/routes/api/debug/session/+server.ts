import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  try {
    const { session, user } = await locals.safeGetSession();
    
    return json({
      timestamp: new Date().toISOString(),
      has_session: !!session,
      has_user: !!user,
      user_id: user?.id || null,
      user_email: user?.email || null,
      session_expires: session?.expires_at || null,
      auth_status: {
        authenticated: !!session && !!user,
        session_valid: !!session,
        user_verified: !!user
      }
    });
  } catch (error) {
    return json({
      timestamp: new Date().toISOString(),
      error: 'Failed to get session',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
};