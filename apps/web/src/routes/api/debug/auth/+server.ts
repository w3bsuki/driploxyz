import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies, locals, request }) => {
  // Get all cookies
  const allCookies = cookies.getAll();
  
  // Check for Supabase auth cookies specifically
  const authCookies = allCookies.filter(c => c.name.includes('sb-') || c.name.includes('supabase'));
  
  // Get session info
  let sessionInfo = null;
  let userInfo = null;
  let error = null;
  
  try {
    const { session, user } = await locals.safeGetSession();
    sessionInfo = session ? {
      expires_at: session.expires_at,
      expires_in: session.expires_in,
      token_type: session.token_type,
      user_id: session.user?.id
    } : null;
    userInfo = user ? { id: user.id, email: user.email } : null;
  } catch (e: any) {
    error = e?.message || 'Unknown error';
  }

  // Get request headers for debugging
  const headers = {
    'x-forwarded-proto': request.headers.get('x-forwarded-proto'),
    'x-forwarded-host': request.headers.get('x-forwarded-host'),
    'host': request.headers.get('host'),
    'user-agent': request.headers.get('user-agent')?.substring(0, 50) + '...',
  };

  // Check environment
  const env = {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV,
    PUBLIC_SUPABASE_URL: process.env.PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
    PUBLIC_SUPABASE_ANON_KEY: process.env.PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
  };

  return json({
    timestamp: new Date().toISOString(),
    cookies: {
      total: allCookies.length,
      auth: authCookies.length,
      names: authCookies.map(c => c.name)
    },
    session: sessionInfo,
    user: userInfo,
    error,
    headers,
    environment: env,
    runtime: typeof EdgeRuntime !== 'undefined' ? 'edge' : 'node'
  });
};