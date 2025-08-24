import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals: { supabase } }) => {
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/';
  const error_description = url.searchParams.get('error_description');
  const error = url.searchParams.get('error');
  
  // Handle errors from Supabase
  if (error) {
    return redirect(303, `/login?error=${encodeURIComponent(error_description || error)}`);
  }
  
  if (!code) {
    return redirect(303, '/login?error=No verification code provided');
  }

  try {
    const { error: authError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (authError) {
      // Don't log in production
      return redirect(303, `/login?error=${encodeURIComponent(authError.message)}`);
    }

    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return redirect(303, '/login?error=Unable to verify user');
    }

    // Check if user has completed onboarding
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single();

    // Redirect based on onboarding status
    if (!profile || !profile.onboarding_completed) {
      return redirect(303, '/onboarding');
    }

    // Successfully verified - redirect to dashboard or next page
    return redirect(303, next === '/' ? '/dashboard' : next);
  } catch (err) {
    // Handle unexpected errors gracefully
    return redirect(303, '/login?error=Verification failed');
  }
};