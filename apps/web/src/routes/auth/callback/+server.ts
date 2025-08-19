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
    // Check or create profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', data.user.id)
      .single();

    if (profileError && profileError.code === 'PGRST116') {
      // Profile doesn't exist, create it
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          username: `user_${data.user.id.substring(0, 8)}`,
          full_name: data.user.user_metadata?.full_name || '',
          onboarding_completed: false
        });
      
      if (!insertError) {
        // Profile created, redirect to onboarding
        throw redirect(303, '/onboarding');
      }
    }

    // Check if onboarding is needed
    if (!profile || profile.onboarding_completed !== true) {
      throw redirect(303, '/onboarding');
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
