import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/';

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user) {
      // Successful authentication
      throw redirect(303, `/${next.slice(1)}`);
    }
  }

  // Return the user to an error page with instructions
  throw redirect(303, '/auth/auth-code-error');
};