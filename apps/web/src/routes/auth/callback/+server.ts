import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/';
  const providerError = url.searchParams.get('error');
  const errorDescription = url.searchParams.get('error_description');

  // Provider-side error
  if (providerError) {
    console.error('Auth provider error:', providerError, errorDescription);
    throw redirect(303, `/login?error=${encodeURIComponent(errorDescription || providerError)}`);
  }

  if (!code) {
    throw redirect(303, '/login?error=no_auth_code');
  }

  const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    console.error('Session exchange error:', exchangeError);
    throw redirect(303, '/login?error=session_exchange_failed');
  }

  if (data.session && data.user) {
    // Best-effort profile check; do not block on error
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', data.user.id)
        .single();

      if (!profile || profile.onboarding_completed !== true) {
        throw redirect(303, '/onboarding');
      }
    } catch (profileError) {
      console.warn('Profile check failed:', profileError);
      // continue
    }

    // Safe next redirect
    let redirectPath = '/';
    if (next && next !== 'undefined' && next !== 'null') {
      if (next.startsWith('/') && !next.includes('://')) {
        redirectPath = next;
      }
    }
    throw redirect(303, redirectPath);
  }

  // Fallback
  throw redirect(303, '/login?error=auth_failed');
};
