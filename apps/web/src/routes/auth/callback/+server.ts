import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/';
  const error = url.searchParams.get('error');
  const errorDescription = url.searchParams.get('error_description');

  // Handle auth provider errors
  if (error) {
    console.error('Auth provider error:', error, errorDescription);
    throw redirect(303, `/login?error=${encodeURIComponent(errorDescription || error)}`);
  }

  if (code) {
    try {
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        console.error('Session exchange error:', exchangeError);
        throw redirect(303, '/login?error=session_exchange_failed');
      }
      
      if (data.session && data.user) {
        // Check if user has a profile and onboarding status
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', data.user.id)
            .single();
          
          // Redirect to onboarding if not completed
          if (!profile || profile.onboarding_completed !== true) {
            throw redirect(303, '/onboarding');
          }
        } catch (profileError) {
          // Profile doesn't exist or error - continue with normal redirect
          console.warn('Profile check failed:', profileError);
        }
        
        // Ensure safe redirect path
        let redirectPath = '/';
        if (next && next !== 'undefined' && next !== 'null') {
          // Validate redirect path is safe (starts with / and no protocol)
          if (next.startsWith('/') && !next.includes('://')) {
            redirectPath = next;
          }
        }
        
        throw redirect(303, redirectPath);
      }
    } catch (e) {
      // Re-throw redirects
      if (e instanceof redirect) throw e;
      
      console.error('Auth callback error:', e);
      throw redirect(303, '/login?error=auth_callback_failed');
    }
  }

  // No code provided - redirect to login
  throw redirect(303, '/login?error=no_auth_code');
};