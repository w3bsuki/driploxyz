import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/';
  
  // Minimal callback logging
  console.log('[AUTH_CALLBACK]', { hasCode: !!code, next });

  if (code) {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('[AUTH_CALLBACK_ERROR]', {
          error: error.message,
          code: error.code,
          status: error.status
        });
        throw redirect(303, '/login?error=auth_failed');
      }
      
      if (data.session) {
        // Ensure proper redirect path
        const redirectPath = next.startsWith('/') ? next : `/${next}`;
        throw redirect(303, redirectPath);
      }
    } catch (e) {
      // Re-throw redirects
      if (e instanceof redirect) throw e;
      
      console.error('[AUTH_CALLBACK_EXCEPTION]', e);
      throw redirect(303, '/login?error=auth_exception');
    }
  }

  // No code provided - redirect to login
  throw redirect(303, '/login');
};