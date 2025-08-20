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
    // Force refresh session to ensure we have the correct user
    await supabase.auth.refreshSession();
    
    // Check if this is email verification (user just verified their email)
    const isEmailVerification = data.user.email_confirmed_at && 
      new Date(data.user.email_confirmed_at).getTime() > Date.now() - 60000; // Within last minute
    
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
        // New user - redirect to onboarding
        throw redirect(303, '/onboarding?welcome=true');
      }
    }

    // If email was just verified, always show success message first
    if (isEmailVerification) {
      // Sign out and redirect to login with success message
      await supabase.auth.signOut();
      throw redirect(303, '/login?verified=true');
    }

    // Check if onboarding is needed
    if (!profile || profile.onboarding_completed !== true) {
      throw redirect(303, '/onboarding');
    }

    // Safe next redirect for returning users
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
