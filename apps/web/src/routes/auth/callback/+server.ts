import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/';
  

  if (code) {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
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
      
      throw redirect(303, '/login?error=auth_exception');
    }
  }

  // No code provided - redirect to login
  throw redirect(303, '/login');
};